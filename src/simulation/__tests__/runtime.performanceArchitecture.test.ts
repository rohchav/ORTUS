import { describe, expect, it } from "vitest";
import {
  BoundedPerformanceRecorder,
  LocalRuntimeDriver,
  WorkerRuntimeDriver,
  type RuntimePublication,
  type RuntimeWorkerLike
} from "..";
import { LatestPublicationGate } from "../runtime/LatestPublicationGate";
import { RuntimeWorkerHost } from "../runtime/RuntimeWorkerHost";
import { createFlockingRenderFramePacket } from "../runtime/flockingProjection";
import { parseRuntimeWorkerResponse, type RuntimeWorkerResponse } from "../runtime/protocol";
import { createImmersiveFlockingEngine, createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld";

const runId = "perf1-runtime-test";

describe("PERF1 runtime performance architecture", () => {
  it("keeps named duration instrumentation disabled cheaply and bounded when enabled", () => {
    const recorder = new BoundedPerformanceRecorder({ maxSamples: 3 });
    recorder.record("ortus.sim.step", 100);
    expect(recorder.summaries()).toEqual([]);

    recorder.setEnabled(true);
    for (const duration of [5, 1, 9, 3, 7]) {
      recorder.record("ortus.sim.step", duration);
    }
    expect(recorder.summaries()).toEqual([{
      name: "ortus.sim.step",
      count: 3,
      medianMs: 7,
      p95Ms: 9,
      maxMs: 9,
      totalMs: 19
    }]);
    expect(() => recorder.record("ortus.sim.step", -1)).toThrow(/nonnegative finite duration/i);
  });

  it("uses only UI-throttle clock reads on disabled forced-publication paths", async () => {
    let clockReads = 0;
    const port = new LocalRuntimeDriver({
      now: () => {
        clockReads += 1;
        return 100;
      }
    });

    await port.initialize({ runId, runConfig: createImmersiveFlockingRunConfig(100), instrumentation: false });
    await port.step();

    expect(clockReads).toBe(2);
    port.dispose();
  });

  it("projects compact typed arrays without snapshot, history, or mutable engine objects", () => {
    const engine = createImmersiveFlockingEngine(500);
    engine.step();
    const frame = createFlockingRenderFramePacket(engine, { generation: 1, runId }, "e000001");

    expect(frame).toMatchObject({
      schemaVersion: "1",
      projectionKind: "flocking-v1",
      templateId: "flocking-boids",
      generation: 1,
      tick: 1,
      entityCount: 500,
      publicationId: 1
    });
    expect(frame.entityIds).toBeInstanceOf(Uint32Array);
    expect(frame.positions).toBeInstanceOf(Float32Array);
    expect(frame.velocities).toBeInstanceOf(Float32Array);
    expect(frame.neighborCounts).toBeInstanceOf(Uint16Array);
    expect(frame.groupCodes).toBeInstanceOf(Uint8Array);
    expect(frame.positions).toHaveLength(1_000);
    expect(frame.selectedDetail?.entityId).toBe(1);
    expect(frame.selectedDetail?.neighborIds.length ?? 0).toBeLessThanOrEqual(499);
    expect(frame.selectedDetail?.neighborOffsets.length).toBe((frame.selectedDetail?.neighborIds.length ?? 0) * 2);
    expect(Object.keys(frame)).not.toEqual(expect.arrayContaining(["entities", "components", "spaces", "metricsHistory", "world", "rng"]));
    expect(packetBytes(frame)).toBeLessThan(32_000);
  });

  it("keeps local manual stepping exactly aligned with the authoritative engine", async () => {
    const port = new LocalRuntimeDriver();
    const config = createImmersiveFlockingRunConfig(100);
    const direct = createImmersiveFlockingEngine(100);
    await port.initialize({ runId, runConfig: config, instrumentation: true });
    const initialSignature = port.getLatestFrame()?.runtimeSignature;

    for (let tick = 0; tick < 12; tick += 1) {
      await port.step();
      direct.step();
    }
    const expected = createFlockingRenderFramePacket(direct, { generation: 1, runId }, null);
    expect(port.getLatestFrame()?.runtimeSignature).toBe(expected.runtimeSignature);
    expect(port.getLatestFrame()?.positions).toEqual(expected.positions);
    expect(port.getLatestFrame()?.velocities).toEqual(expected.velocities);
    expect(port.getLatestFrame()?.neighborCounts).toEqual(expected.neighborCounts);

    const reset = await port.reset();
    expect(reset).toMatchObject({ generation: 2, tick: 0, playback: "paused" });
    expect(port.getLatestFrame()?.runtimeSignature).toBe(initialSignature);
    port.dispose();
  });

  it("preserves the accumulator scheduler's bounded catch-up contract", async () => {
    let now = 0;
    let timer: (() => void) | undefined;
    const port = new LocalRuntimeDriver({
      now: () => now,
      setTimer: (callback) => {
        timer = callback;
        return callback;
      },
      clearTimer: () => {
        timer = undefined;
      }
    });
    await port.initialize({ runId, runConfig: createImmersiveFlockingRunConfig(100) });
    port.play();
    now = 16;
    runTimer(timer);
    now = 58;
    runTimer(timer);
    expect(port.getLatestFrame()?.tick).toBe(1);
    now = 558;
    runTimer(timer);
    expect(port.getLatestFrame()?.tick).toBe(6);
    port.pause();
    expect(timer).toBeUndefined();
    expect(port.getLatestUI()?.playback).toBe("paused");
    port.dispose();
  });

  it("keeps Worker protocol stepping exactly aligned with the local reference path", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    const local = new LocalRuntimeDriver();
    const request = { runId, runConfig: createImmersiveFlockingRunConfig(100), instrumentation: true };
    await Promise.all([worker.initialize(request), local.initialize(request)]);

    for (let tick = 0; tick < 10; tick += 1) {
      await Promise.all([worker.step(), local.step()]);
    }
    await settleMessages();
    expect(worker.getLatestFrame()?.runtimeSignature).toBe(local.getLatestFrame()?.runtimeSignature);
    expect(worker.getLatestFrame()?.positions).toEqual(local.getLatestFrame()?.positions);
    expect(worker.getLatestFrame()?.velocities).toEqual(local.getLatestFrame()?.velocities);
    expect(worker.getLatestUI()).toMatchObject({ executionKind: "worker", tick: 10, playback: "paused" });
    expect(local.getLatestUI()).toMatchObject({ executionKind: "local", tick: 10, playback: "paused" });
    worker.dispose();
    local.dispose();
  });

  it("drops stale generation publications after replacement", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    const request = { runId: "run-a", runConfig: createImmersiveFlockingRunConfig(100) };
    await worker.initialize(request);
    const staleFrame = structuredClone(worker.getLatestFrame()!);
    await worker.replaceRun({ ...request, runId: "run-b" });
    const currentSignature = worker.getLatestFrame()?.runtimeSignature;

    fakeWorker.emit({ type: "runtime.frame", frame: staleFrame });
    await settleMessages();
    expect(worker.generation).toBe(2);
    expect(worker.getLatestFrame()).toMatchObject({ generation: 2, runId: "run-b" });
    expect(worker.getLatestFrame()?.runtimeSignature).toBe(currentSignature);
    worker.dispose();
  });

  it("keeps only one in-flight and one newest pending visual publication", () => {
    const sent: number[] = [];
    let coalesced = 0;
    const gate = new LatestPublicationGate<number>(
      (value) => sent.push(value),
      (value) => value,
      () => undefined,
      () => { coalesced += 1; }
    );
    for (let value = 1; value <= 100; value += 1) {
      gate.offer(value);
    }
    expect(gate.counts()).toEqual({ inFlight: 1, pending: 1 });
    expect(sent).toEqual([1]);
    expect(coalesced).toBe(98);
    gate.acknowledge(1);
    expect(sent).toEqual([1, 100]);
    expect(gate.counts()).toEqual({ inFlight: 1, pending: 0 });
    gate.acknowledge(100);
    expect(gate.counts()).toEqual({ inFlight: 0, pending: 0 });
  });

  it("publishes selected-only detail without attaching neighborhoods to every entity", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    await worker.initialize({ runId, runConfig: createImmersiveFlockingRunConfig(500) });
    const selectedFrame = nextPublication(worker, "frame", (publication) => publication.frame.selectedDetail?.entityId === 1);
    worker.setSelectedEntity("e000001");
    const publication = await selectedFrame;
    expect(publication.type).toBe("frame");
    if (publication.type === "frame") {
      expect(publication.frame.selectedDetail?.neighborIds.length ?? 0).toBeLessThanOrEqual(499);
      expect(publication.frame).not.toHaveProperty("trajectories");
      expect(publication.frame).not.toHaveProperty("neighborsByEntity");
    }
    worker.dispose();
  });

  it("survives repeated reset generations without queue or listener growth", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    await worker.initialize({ runId, runConfig: createImmersiveFlockingRunConfig(100) });
    for (let replacement = 0; replacement < 12; replacement += 1) {
      const ui = await worker.reset();
      expect(ui).toMatchObject({ generation: replacement + 2, tick: 0, playback: "paused" });
    }
    await settleMessages();
    expect(fakeWorker.queueCounts()).toEqual({
      frame: { inFlight: 0, pending: 0 },
      ui: { inFlight: 0, pending: 0 }
    });
    expect(fakeWorker.listenerCount()).toBe(3);
    worker.dispose();
    expect(fakeWorker.listenerCount()).toBe(0);
    expect(fakeWorker.terminated).toBe(true);
  });

  it("fails clearly on malformed Worker output and never falls back", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    await worker.initialize({ runId, runConfig: createImmersiveFlockingRunConfig(100) });
    const failure = nextPublication(worker, "failure");
    fakeWorker.emit({ type: "runtime.frame", frame: { generation: 1 } });
    await expect(failure).resolves.toMatchObject({
      type: "failure",
      failure: { code: "protocol" }
    });
    expect(() => worker.step()).toThrow(/failed.*will not fall back/i);
    expect(fakeWorker.terminated).toBe(true);
  });

  it("rejects Worker initialization failures without fabricating partial state", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    const invalid = createImmersiveFlockingRunConfig(100);
    invalid.templateId = "missing-template";
    await expect(worker.initialize({ runId, runConfig: invalid })).rejects.toThrow(/unknown run config template/i);
    expect(worker.getLatestFrame()).toBeNull();
    expect(worker.getLatestUI()).toBeNull();
    expect(worker.state).toBe("failed");
    expect(fakeWorker.terminated).toBe(true);
    worker.dispose();
  });

  it("reports Worker-owned runtime exceptions without publishing a fabricated frame", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    await worker.initialize({ runId, runConfig: createImmersiveFlockingRunConfig(100) });
    const frameBeforeFailure = worker.getLatestFrame();
    const failure = nextPublication(worker, "failure");

    await expect(worker.applyCommands([{ type: "destroyEntity", entityId: "missing-entity" }]))
      .rejects.toThrow(/missing-entity/i);
    await expect(failure).resolves.toMatchObject({
      type: "failure",
      failure: { code: "runtime", generation: 1, runId }
    });
    expect(worker.getLatestFrame()).toBe(frameBeforeFailure);
    expect(worker.state).toBe("failed");
    expect(fakeWorker.terminated).toBe(true);
    worker.dispose();
  });

  it("fails closed on a Worker error signal and removes all listeners", async () => {
    const fakeWorker = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(fakeWorker);
    await worker.initialize({ runId, runConfig: createImmersiveFlockingRunConfig(100) });
    const failure = nextPublication(worker, "failure");

    fakeWorker.emitError("Worker terminated unexpectedly");

    await expect(failure).resolves.toMatchObject({
      type: "failure",
      failure: { code: "worker", message: "Worker terminated unexpectedly" }
    });
    expect(fakeWorker.terminated).toBe(true);
    expect(fakeWorker.listenerCount()).toBe(0);
    expect(() => worker.play()).toThrow(/failed.*will not fall back/i);
  });

  it("rejects malformed frame lengths at the protocol boundary", () => {
    const engine = createImmersiveFlockingEngine(100);
    const frame = createFlockingRenderFramePacket(engine, { generation: 1, runId }, null);
    const malformed = { ...frame, positions: new Float32Array(1) };
    expect(() => parseRuntimeWorkerResponse({ type: "runtime.frame", frame: malformed })).toThrow(/positions length/i);
  });
});

class HostBackedWorker implements RuntimeWorkerLike {
  readonly host: RuntimeWorkerHost;
  terminated = false;
  private readonly messageListeners = new Set<(event: MessageEvent<unknown>) => void>();
  private readonly errorListeners = new Set<(event: ErrorEvent) => void>();
  private readonly messageErrorListeners = new Set<(event: MessageEvent<unknown>) => void>();

  constructor() {
    this.host = new RuntimeWorkerHost({
      postMessage: (message, transfer) => {
        const cloned = structuredClone(message, transfer?.length ? { transfer } : undefined);
        queueMicrotask(() => this.emit(cloned));
      }
    });
  }

  postMessage(message: unknown): void {
    if (this.terminated) {
      throw new Error("Host-backed Worker is terminated");
    }
    const cloned = structuredClone(message);
    queueMicrotask(() => this.host.handleMessage(cloned));
  }

  terminate(): void {
    this.host.dispose();
    this.terminated = true;
  }

  addEventListener(type: "message" | "error" | "messageerror", listener: ((event: MessageEvent<unknown>) => void) | ((event: ErrorEvent) => void)): void {
    this.listeners(type).add(listener as never);
  }

  removeEventListener(type: "message" | "error" | "messageerror", listener: ((event: MessageEvent<unknown>) => void) | ((event: ErrorEvent) => void)): void {
    this.listeners(type).delete(listener as never);
  }

  emit(message: unknown): void {
    for (const listener of this.messageListeners) {
      listener({ data: message } as MessageEvent<unknown>);
    }
  }

  emitError(message: string): void {
    const event = { message, preventDefault() {} } as ErrorEvent;
    for (const listener of this.errorListeners) {
      listener(event);
    }
  }

  queueCounts() {
    return this.host.queueCounts();
  }

  listenerCount(): number {
    return this.messageListeners.size + this.errorListeners.size + this.messageErrorListeners.size;
  }

  private listeners(type: "message" | "error" | "messageerror"): Set<any> {
    if (type === "message") return this.messageListeners;
    if (type === "error") return this.errorListeners;
    return this.messageErrorListeners;
  }
}

function packetBytes(frame: ReturnType<typeof createFlockingRenderFramePacket>): number {
  return frame.entityIds.byteLength
    + frame.positions.byteLength
    + frame.velocities.byteLength
    + frame.neighborCounts.byteLength
    + frame.groupCodes.byteLength
    + (frame.selectedDetail?.neighborIds.byteLength ?? 0)
    + (frame.selectedDetail?.neighborOffsets.byteLength ?? 0)
    + (frame.selectedDetail?.neighborDistances.byteLength ?? 0);
}

function runTimer(timer: (() => void) | undefined): void {
  if (!timer) {
    throw new Error("Expected a scheduled runtime callback");
  }
  timer();
}

function nextPublication<TType extends RuntimePublication["type"]>(
  port: WorkerRuntimeDriver,
  type: TType,
  predicate: (publication: Extract<RuntimePublication, { type: TType }>) => boolean = () => true
): Promise<Extract<RuntimePublication, { type: TType }>> {
  return new Promise((resolve) => {
    const unsubscribe = port.subscribe((publication) => {
      if (publication.type === type && predicate(publication as Extract<RuntimePublication, { type: TType }>)) {
        unsubscribe();
        resolve(publication as Extract<RuntimePublication, { type: TType }>);
      }
    });
  });
}

async function settleMessages(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}
