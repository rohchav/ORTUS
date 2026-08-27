import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  LocalRuntimeDriver,
  WorkerRuntimeDriver,
  createDefaultRunConfig,
  forestFireTemplate,
  maxPendingRuntimeMessages,
  type RenderFramePacket,
  type RuntimePublication,
  type RuntimeWorkerLike
} from "..";
import { createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld";
import { createFlockingFrameSceneAdapter } from "../../lib/immersiveWorld/frameSceneAdapter";
import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import { Position2D } from "../templates/epidemic.template";
import { LatestPublicationGate } from "../runtime/LatestPublicationGate";
import { RuntimeAccumulatorScheduler } from "../runtime/RuntimeScheduler";
import { RuntimeSession } from "../runtime/RuntimeSession";
import { RuntimeWorkerHost } from "../runtime/RuntimeWorkerHost";
import { createFlockingRenderFramePacket, renderFrameTransferables } from "../runtime/flockingProjection";
import type { RuntimeWorkerResponse } from "../runtime/protocol";

const baseRunId = "perf1b-runtime-audit";

describe("PERF1B adversarial runtime audit", () => {
  it("keeps runtime internals out of the public simulation runtime surface", () => {
    const publicRuntime = readFileSync(new URL("../runtime/index.ts", import.meta.url), "utf8");
    expect(publicRuntime).not.toMatch(/RuntimeSession|RuntimeWorkerHost|LatestPublicationGate|RuntimeAccumulatorScheduler/);
    expect(publicRuntime).not.toMatch(/parseRuntimeWorker|createFlockingRenderFramePacket|renderFrameTransferables/);
    expect(publicRuntime).toContain("LocalRuntimeDriver");
    expect(publicRuntime).toContain("WorkerRuntimeDriver");
  });

  it.each([
    { agentCount: 100 as const, seed: "perf1b-seed-alpha", ticks: 8 },
    { agentCount: 100 as const, seed: "perf1b-seed-beta", ticks: 8 },
    { agentCount: 500 as const, seed: "perf1b-seed-alpha", ticks: 6 },
    { agentCount: 500 as const, seed: "perf1b-seed-beta", ticks: 6 }
  ])("keeps local, Worker, and direct manual outcomes exact at $agentCount agents with $seed", async ({ agentCount, seed, ticks }) => {
    const request = runRequest(`${baseRunId}-${agentCount}-${seed}`, agentCount, seed);
    const direct = createEngineFromRunConfig(request.runConfig);
    const local = new LocalRuntimeDriver();
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await Promise.all([local.initialize(request), worker.initialize(request)]);

    local.setSelectedEntity("e000001");
    worker.setSelectedEntity("e000001");
    await settleMessages();
    for (let tick = 0; tick < ticks; tick += 1) {
      direct.step();
      await Promise.all([local.step(), worker.step()]);
    }
    await settleMessages();

    const expected = createFlockingRenderFramePacket(
      direct,
      { generation: 1, runId: request.runId },
      "e000001"
    );
    expectFrameModeledValues(local.getLatestFrame(), expected);
    expectFrameModeledValues(worker.getLatestFrame(), expected);
    expect(worker.getLatestUI()?.selected).toEqual(local.getLatestUI()?.selected);
    expect(worker.getLatestUI()).toMatchObject({ tick: ticks, playback: "paused", executionKind: "worker" });
    expect(local.getLatestUI()).toMatchObject({ tick: ticks, playback: "paused", executionKind: "local" });
    worker.dispose();
    local.dispose();
  });

  it("rejects stale same-generation frame and UI revisions without regressing presentation", async () => {
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await worker.initialize(runRequest("same-generation", 100));
    const oldFrame = structuredClone(worker.getLatestFrame()!);
    const oldUI = structuredClone(worker.getLatestUI()!);
    await worker.step();
    await settleMessages();
    const currentFrame = worker.getLatestFrame();
    const currentUI = worker.getLatestUI();

    transport.emit({ type: "runtime.frame", frame: oldFrame });
    transport.emit({ type: "runtime.ui", ui: oldUI });
    await settleMessages();

    expect(worker.getLatestFrame()).toBe(currentFrame);
    expect(worker.getLatestUI()).toBe(currentUI);
    expect(worker.getLatestFrame()?.publicationId).toBeGreaterThan(oldFrame.publicationId);
    expect(worker.getLatestUI()?.revision).toBeGreaterThan(oldUI.revision);
    expect(worker.state).toBe("ready");
    worker.dispose();
  });

  it("fails closed when a current completion carries a different run identity", async () => {
    const transport = new PassiveWorker();
    const worker = new WorkerRuntimeDriver(transport);
    const request = runRequest("identity-a", 100);
    const initialization = worker.initialize(request);
    const initializeMessage = transport.messages[0] as { requestId: number };
    const session = new RuntimeSession("worker");
    const bundle = session.rebuild(request, { generation: 1, runId: "identity-b" }, "initialization");

    transport.emit({
      type: "runtime.complete",
      requestId: initializeMessage.requestId,
      generation: 1,
      ui: bundle.ui!
    });

    await expect(initialization).rejects.toThrow(/identity|active run/i);
    expect(worker.state).toBe("failed");
    expect(transport.terminated).toBe(true);
    expect(worker.getLatestFrame()).toBeNull();
    session.dispose();
  });

  it("makes initial startup commands explicit and disposal-before-ready terminal", async () => {
    const transport = new PassiveWorker();
    const worker = new WorkerRuntimeDriver(transport);
    const initialization = worker.initialize(runRequest("slow-start", 100));
    expect(worker.state).toBe("initializing");
    expect(() => worker.play()).toThrow(/while initializing/i);
    expect(() => worker.pause()).toThrow(/while initializing/i);
    expect(() => worker.step()).toThrow(/while initializing/i);
    expect(() => worker.setSelectedEntity("e000001")).toThrow(/while initializing/i);

    worker.dispose();
    await expect(initialization).rejects.toThrow(/disposed/i);
    expect(worker.state).toBe("disposed");
    expect(transport.terminated).toBe(true);
    expect(transport.listenerCount()).toBe(0);
  });

  it("rejects play-then-step bursts before UI acknowledgement without failing either driver", async () => {
    const request = runRequest("play-step-intent", 100);
    const local = new LocalRuntimeDriver();
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await Promise.all([local.initialize(request), worker.initialize(request)]);

    local.play();
    worker.play();
    await expect(local.step()).rejects.toThrow(/paused runtime/i);
    await expect(worker.step()).rejects.toThrow(/paused runtime/i);
    expect(local.state).toBe("ready");
    expect(worker.state).toBe("ready");

    local.pause();
    worker.pause();
    await settleMessages();
    const localTick = local.getLatestUI()!.tick;
    const workerTick = worker.getLatestUI()!.tick;
    await Promise.all([local.step(), worker.step()]);
    expect(local.getLatestUI()?.tick).toBe(localTick + 1);
    expect(worker.getLatestUI()?.tick).toBe(workerTick + 1);
    local.dispose();
    worker.dispose();
  });

  it("bounds accepted authoritative requests and rejects overflow explicitly", async () => {
    const transport = new PassiveWorker();
    const worker = new WorkerRuntimeDriver(transport);
    const request = runRequest("bounded-requests", 100);
    const initialization = worker.initialize(request);
    const initializeMessage = transport.messages[0] as { requestId: number };
    const session = new RuntimeSession("worker");
    const bundle = session.rebuild(request, { generation: 1, runId: request.runId }, "initialization");
    transport.emit({
      type: "runtime.complete",
      requestId: initializeMessage.requestId,
      generation: 1,
      ui: bundle.ui!
    });
    await initialization;

    const accepted = Array.from({ length: maxPendingRuntimeMessages }, () => worker.step());
    await expect(worker.step()).rejects.toThrow(new RegExp(String(maxPendingRuntimeMessages)));
    expect(transport.messages.filter((message) => (message as { type?: string }).type === "runtime.step")).toHaveLength(maxPendingRuntimeMessages);

    worker.dispose();
    const settled = await Promise.allSettled(accepted);
    expect(settled.every((result) => result.status === "rejected")).toBe(true);
    session.dispose();
  });

  it("bounds fire-and-forget controls and rejects a replacement without changing generation when transport is full", async () => {
    const transport = new PassiveWorker();
    const worker = new WorkerRuntimeDriver(transport);
    const request = runRequest("bounded-controls", 100);
    const initialization = worker.initialize(request);
    const initializeMessage = transport.messages[0] as { requestId: number };
    const session = new RuntimeSession("worker");
    const bundle = session.rebuild(request, { generation: 1, runId: request.runId }, "initialization");
    transport.emit({
      type: "runtime.complete",
      requestId: initializeMessage.requestId,
      generation: 1,
      ui: bundle.ui!
    });
    await initialization;

    for (let index = 0; index < maxPendingRuntimeMessages; index += 1) {
      worker.play();
    }
    expect(() => worker.pause()).toThrow(new RegExp(String(maxPendingRuntimeMessages)));
    await expect(worker.replaceRun(runRequest("must-not-start", 500))).rejects.toThrow(
      new RegExp(String(maxPendingRuntimeMessages))
    );
    expect(worker.generation).toBe(1);
    expect(worker.state).toBe("ready");
    expect(transport.messages.filter((message) => (message as { type?: string }).type === "runtime.play"))
      .toHaveLength(maxPendingRuntimeMessages);
    worker.dispose();
    session.dispose();
  });

  it("publishes completion UI when completion arrives before its matching UI channel message", async () => {
    const transport = new PassiveWorker();
    const worker = new WorkerRuntimeDriver(transport);
    const request = runRequest("completion-first", 100);
    const seen: RuntimePublication[] = [];
    worker.subscribe((publication) => seen.push(publication));
    const initialization = worker.initialize(request);
    const initializeMessage = transport.messages[0] as { requestId: number };
    const session = new RuntimeSession("worker");
    const bundle = session.rebuild(request, { generation: 1, runId: request.runId }, "initialization");
    transport.emit({
      type: "runtime.complete",
      requestId: initializeMessage.requestId,
      generation: 1,
      ui: bundle.ui!
    });

    await expect(initialization).resolves.toMatchObject({ tick: 0, playback: "paused" });
    expect(worker.state).toBe("ready");
    expect(worker.getLatestUI()).toBeTruthy();
    expect(seen).toContainEqual({ type: "ui", ui: bundle.ui! });
    worker.dispose();
    session.dispose();
  });

  it("resolves a same-revision completion with the already accepted UI projection", async () => {
    const transport = new PassiveWorker();
    const worker = new WorkerRuntimeDriver(transport);
    const request = runRequest("same-revision-completion", 100);
    const initialization = worker.initialize(request);
    const initializeMessage = transport.messages[0] as { requestId: number };
    const session = new RuntimeSession("worker");
    const accepted = session.rebuild(request, { generation: 1, runId: request.runId }, "initialization").ui!;
    const divergent = { ...accepted, tick: 17, time: 17 };

    transport.emit({ type: "runtime.ui", ui: accepted });
    transport.emit({
      type: "runtime.complete",
      requestId: initializeMessage.requestId,
      generation: 1,
      ui: divergent
    });

    await expect(initialization).resolves.toStrictEqual(accepted);
    expect(worker.getLatestUI()).toStrictEqual(accepted);
    expect(worker.getLatestUI()?.tick).toBe(0);
    expect(worker.state).toBe("ready");
    worker.dispose();
    session.dispose();
  });

  it("keeps rapid control, reset, replacement, and delayed-step sequences generation-safe", async () => {
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await worker.initialize(runRequest("sequence-a", 100));

    worker.play();
    worker.pause();
    await worker.step();
    await settleMessages();
    expect(worker.getLatestUI()).toMatchObject({ tick: 1, playback: "paused", generation: 1 });

    const resetOne = worker.reset();
    const resetTwo = worker.reset();
    const resetThree = worker.reset();
    await expect(resetOne).rejects.toThrow(/superseded/i);
    await expect(resetTwo).rejects.toThrow(/superseded/i);
    await expect(resetThree).resolves.toMatchObject({ generation: 4, tick: 0 });

    const replaceA = worker.replaceRun(runRequest("replace-a", 100, "replace-seed-a"));
    const replaceB = worker.replaceRun(runRequest("replace-b", 100, "replace-seed-b"));
    const replaceC = worker.replaceRun(runRequest("replace-c", 100, "replace-seed-c"));
    await expect(replaceA).rejects.toThrow(/superseded/i);
    await expect(replaceB).rejects.toThrow(/superseded/i);
    await expect(replaceC).resolves.toMatchObject({ generation: 7, runId: "replace-c", tick: 0 });

    const obsoleteStep = worker.step();
    const replacement = worker.replaceRun(runRequest("replace-final", 100, "replace-seed-final"));
    await expect(obsoleteStep).rejects.toThrow(/superseded/i);
    await replacement;
    await settleMessages();
    expect(worker.getLatestFrame()).toMatchObject({ generation: 8, runId: "replace-final", tick: 0 });
    expect(worker.getLatestUI()).toMatchObject({ generation: 8, runId: "replace-final", tick: 0, playback: "paused" });
    worker.dispose();
  });

  it("prevents delayed selected detail from replacing the latest selection or deselection", async () => {
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await worker.initialize(runRequest("selection-race", 100));

    const selectedA = nextPublication(worker, "frame", (publication) => publication.frame.selectedDetail?.entityId === 1);
    worker.setSelectedEntity("e000001");
    const oldFrame = structuredClone((await selectedA).frame);
    const oldUI = structuredClone(worker.getLatestUI()!);
    worker.setSelectedEntity("e000002");
    worker.setSelectedEntity("e000003");
    await settleMessages();
    expect(worker.getLatestFrame()?.selectedDetail?.entityId).toBe(3);
    expect(worker.getLatestUI()?.selected?.entityId).toBe(3);

    transport.emit({ type: "runtime.frame", frame: oldFrame });
    transport.emit({ type: "runtime.ui", ui: oldUI });
    await settleMessages();
    expect(worker.getLatestFrame()?.selectedDetail?.entityId).toBe(3);
    expect(worker.getLatestUI()?.selected?.entityId).toBe(3);

    worker.setSelectedEntity(null);
    await settleMessages();
    expect(worker.getLatestFrame()?.selectedDetail).toBeUndefined();
    expect(worker.getLatestUI()?.selected).toBeNull();
    worker.dispose();
  });

  it("projects authoritative selected values and removes destroyed entities from presentation", async () => {
    const request = runRequest("selected-truth", 100);
    const direct = createEngineFromRunConfig(request.runConfig);
    const expectedPosition = direct.world.componentStore.get<{ x: number; y: number }>("e000001", Position2D)!;
    const session = new RuntimeSession("local");
    session.rebuild(request, { generation: 1, runId: request.runId }, "initialization");
    const selected = session.setSelectedEntity("e000001");
    expect(selected.ui?.selected?.x).toBe(expectedPosition.x);
    expect(selected.ui?.selected?.y).toBe(expectedPosition.y);
    expect(selected.frame.positions[0]).toBe(Math.fround(expectedPosition.x));

    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await worker.initialize(request);
    worker.setSelectedEntity("e000001");
    await settleMessages();
    await worker.applyCommands([{ type: "destroyEntity", entityId: "e000001" }]);
    await settleMessages();
    expect(worker.getLatestFrame()?.entityCount).toBe(99);
    expect(worker.getLatestFrame()?.selectedDetail).toBeUndefined();
    expect(worker.getLatestUI()?.selected).toBeNull();
    expect(worker.state).toBe("ready");
    worker.dispose();
    session.dispose();
  });

  it("keeps local runtime failures terminal and semantically aligned with Worker failures", async () => {
    const local = new LocalRuntimeDriver();
    const failures: RuntimePublication[] = [];
    local.subscribe((publication) => {
      if (publication.type === "failure") failures.push(publication);
    });
    await local.initialize(runRequest("local-failure", 100));
    await expect(local.applyCommands([{ type: "destroyEntity", entityId: "missing-entity" }]))
      .rejects.toThrow(/missing-entity/i);
    expect(local.state).toBe("failed");
    expect(local.getLatestUI()?.playback).toBe("failed");
    expect(failures).toHaveLength(1);
    expect(() => local.play()).toThrow(/failed/i);
    local.dispose();
  });

  it("fails terminally on an unknown host protocol message", async () => {
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await worker.initialize(runRequest("unknown-protocol", 100));
    const failure = nextPublication(worker, "failure");
    transport.host.handleMessage({
      type: "runtime.futureMessage",
      generation: 1,
      runId: "unknown-protocol"
    });
    await expect(failure).resolves.toMatchObject({ type: "failure", failure: { code: "protocol" } });
    expect(worker.state).toBe("failed");
    expect(transport.terminated).toBe(true);
  });

  it("consumes malformed stale-generation messages without pausing or failing the active host run", () => {
    const responses: RuntimeWorkerResponse[] = [];
    const host = new RuntimeWorkerHost({
      postMessage: (message) => responses.push(message)
    });
    const first = runRequest("stale-malformed-a", 100);
    const second = runRequest("stale-malformed-b", 100);
    host.handleMessage({
      type: "runtime.initialize",
      requestId: 1,
      generation: 1,
      runId: first.runId,
      runConfig: first.runConfig
    });
    host.handleMessage({
      type: "runtime.replace",
      requestId: 2,
      generation: 2,
      runId: second.runId,
      runConfig: second.runConfig
    });
    responses.length = 0;

    host.handleMessage({
      type: "runtime.play",
      commandId: 3,
      generation: 1,
      unexpected: true
    });
    expect(responses).toEqual([{ type: "runtime.messageConsumed", messageId: 3, generation: 1 }]);

    host.handleMessage({ type: "runtime.step", requestId: 4, generation: 2 });
    expect(responses.some((message) => message.type === "runtime.failure")).toBe(false);
    expect(responses.some((message) => message.type === "runtime.complete" && message.requestId === 4)).toBe(true);
    host.dispose();
  });

  it("ignores a malformed stale-generation Worker response without terminating the current run", async () => {
    const transport = new PassiveWorker();
    const worker = new WorkerRuntimeDriver(transport);
    const first = runRequest("stale-response-a", 100);
    const second = runRequest("stale-response-b", 100);
    const session = new RuntimeSession("worker");
    const initialization = worker.initialize(first);
    const firstMessage = transport.messages[0] as { requestId: number };
    transport.emit({
      type: "runtime.complete",
      requestId: firstMessage.requestId,
      generation: 1,
      ui: session.rebuild(first, { generation: 1, runId: first.runId }, "initialization").ui!
    });
    await initialization;

    const replacement = worker.replaceRun(second);
    const secondMessage = transport.messages.at(-1) as { requestId: number };
    const accepted = session.rebuild(second, { generation: 2, runId: second.runId }, "replacement").ui!;
    transport.emit({
      type: "runtime.complete",
      requestId: secondMessage.requestId,
      generation: 2,
      ui: accepted
    });
    await replacement;

    transport.emit({
      type: "runtime.frame",
      frame: { generation: 1, runId: first.runId, positions: "not-a-typed-array" }
    });
    expect(worker.state).toBe("ready");
    expect(worker.getLatestUI()).toStrictEqual(accepted);
    expect(transport.terminated).toBe(false);
    worker.dispose();
    session.dispose();
  });

  it("rejects invalid interventions without terminating either healthy runtime", async () => {
    const request = runRequest("recoverable-intervention", 100);
    const local = new LocalRuntimeDriver();
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await Promise.all([local.initialize(request), worker.initialize(request)]);
    const invalidRequest = {
      templateId: "flocking-boids",
      interventionId: "missing-intervention",
      parameters: {}
    };

    await expect(local.applyIntervention(invalidRequest)).rejects.toThrow(/unsupported intervention/i);
    await expect(worker.applyIntervention(invalidRequest)).rejects.toThrow(/unsupported intervention/i);
    expect(local.state).toBe("ready");
    expect(worker.state).toBe("ready");
    expect(local.getLatestUI()).toMatchObject({ playback: "paused", interventionCount: 1 });
    expect(worker.getLatestUI()).toMatchObject({ playback: "paused", interventionCount: 1 });
    expect(() => local.setSpeedMultiplier(99)).toThrow(/between 0.25 and 8/i);
    expect(() => worker.setSpeedMultiplier(99)).toThrow(/between 0.25 and 8/i);
    expect(() => local.setSelectedEntity("e999999")).toThrow(/missing runtime entity/i);
    const rejectedSelection = nextPublication(worker, "rejection");
    worker.setSelectedEntity("e999999");
    await expect(rejectedSelection).resolves.toMatchObject({
      rejection: { code: "invalid-request", message: expect.stringMatching(/missing runtime entity/i) }
    });
    expect(local.state).toBe("ready");
    expect(worker.state).toBe("ready");
    await expect(local.step()).resolves.toMatchObject({ tick: 1 });
    await expect(worker.step()).resolves.toMatchObject({ tick: 1 });
    await expect(worker.exportArtifact("snapshot")).resolves.toBe(await local.exportArtifact("snapshot"));
    local.dispose();
    worker.dispose();
  });

  it("uses one-shot unique transfer buffers and keeps presentation adaptation non-mutating", () => {
    const engine = createEngineFromRunConfig(runRequest("transfer", 500).runConfig);
    engine.step();
    const source = createFlockingRenderFramePacket(engine, { generation: 1, runId: "transfer" }, "e000001");
    const transferables = renderFrameTransferables(source);
    expect(transferables).toHaveLength(8);
    expect(new Set(transferables).size).toBe(transferables.length);
    const cloned = structuredClone(source, { transfer: transferables });
    expect(source.positions.byteLength).toBe(0);
    expect(source.entityIds.byteLength).toBe(0);
    expect(cloned.positions.byteLength).toBe(500 * 2 * Float32Array.BYTES_PER_ELEMENT);

    const presentationFrame = createFlockingRenderFramePacket(engine, { generation: 1, runId: "transfer" }, "e000001", 2);
    const positionsBefore = Array.from(presentationFrame.positions);
    const neighborsBefore = Array.from(presentationFrame.selectedDetail?.neighborIds ?? []);
    const adapter = createFlockingFrameSceneAdapter(presentationFrame);
    adapter.getEntities();
    adapter.getRelationships("e000001");
    adapter.getLensData();
    expect(Array.from(presentationFrame.positions)).toEqual(positionsBefore);
    expect(Array.from(presentationFrame.selectedDetail?.neighborIds ?? [])).toEqual(neighborsBefore);
  });

  it("keeps visual backpressure at one in-flight plus one pending without dropping model steps", () => {
    let now = 0;
    let timer: (() => void) | undefined;
    const responses: RuntimeWorkerResponse[] = [];
    const host = new RuntimeWorkerHost({
      now: () => now,
      scheduler: {
        now: () => now,
        setTimer: (callback) => {
          timer = callback;
          return callback;
        },
        clearTimer: () => {
          timer = undefined;
        }
      },
      postMessage(message, transfer) {
        responses.push(structuredClone(message, transfer?.length ? { transfer } : undefined));
      }
    });
    const request = runRequest("slow-consumer", 100);
    host.handleMessage({
      type: "runtime.initialize",
      requestId: 1,
      generation: 1,
      runId: request.runId,
      runConfig: request.runConfig
    });
    host.handleMessage({ type: "runtime.play", commandId: 2, generation: 1 });
    now = 16;
    runTimer(timer);
    now = 266;
    runTimer(timer);
    now = 516;
    runTimer(timer);
    host.handleMessage({ type: "runtime.pause", commandId: 3, generation: 1 });

    expect(host.queueCounts()).toEqual({
      frame: { inFlight: 1, pending: 1 },
      ui: { inFlight: 1, pending: 1 }
    });
    expect(responses.filter((message) => message.type === "runtime.messageConsumed")).toEqual([
      { type: "runtime.messageConsumed", messageId: 1, generation: 1 },
      { type: "runtime.messageConsumed", messageId: 2, generation: 1 },
      { type: "runtime.messageConsumed", messageId: 3, generation: 1 }
    ]);
    host.handleMessage({ type: "runtime.frameConsumed", generation: 1, publicationId: 1 });
    const frames = responses.filter((message): message is Extract<RuntimeWorkerResponse, { type: "runtime.frame" }> => message.type === "runtime.frame");
    expect(frames.at(-1)?.frame.tick).toBe(10);
    expect(host.queueCounts().frame).toEqual({ inFlight: 1, pending: 0 });
    host.dispose();
    expect(timer).toBeUndefined();
    expect(host.queueCounts()).toEqual({ frame: { inFlight: 0, pending: 0 }, ui: { inFlight: 0, pending: 0 } });
  });

  it("preserves bounded catch-up and clears timers across pause and pause-during-advance", () => {
    let now = 0;
    let timer: (() => void) | undefined;
    const batches: number[] = [];
    let scheduler: RuntimeAccumulatorScheduler;
    scheduler = new RuntimeAccumulatorScheduler({
      advance(steps) {
        batches.push(steps);
        scheduler.pause();
      },
      maxStepsPerCycle: () => 5,
      speedMultiplier: () => 1,
      onError: (error) => { throw error; }
    }, {
      now: () => now,
      setTimer: (callback) => {
        timer = callback;
        return callback;
      },
      clearTimer: () => {
        timer = undefined;
      }
    });
    scheduler.play();
    now = 16;
    const firstTimer = timer;
    timer = undefined;
    runTimer(firstTimer);
    now = 1_016;
    const catchUpTimer = timer;
    timer = undefined;
    runTimer(catchUpTimer);
    expect(batches).toEqual([5]);
    expect(timer).toBeUndefined();

    scheduler.play();
    scheduler.pause();
    expect(timer).toBeUndefined();
    expect(() => new RuntimeAccumulatorScheduler({
      advance() {},
      maxStepsPerCycle: () => 5,
      speedMultiplier: () => 1,
      onError() {}
    }, { maximumElapsedContributionMs: Number.POSITIVE_INFINITY })).toThrow(/maximum elapsed contribution/i);
  });

  it("contains corrected Flocking indexing as an explicit non-production experiment", async () => {
    const productionRequest = runRequest("historical-policy", 500);
    const metadataAttempt = {
      ...productionRequest,
      runConfig: {
        ...productionRequest.runConfig,
        metadata: { ...productionRequest.runConfig.metadata, neighborExecutionStrategy: "spatialHash" }
      }
    };
    const production = new LocalRuntimeDriver();
    const metadataOnly = new LocalRuntimeDriver();
    await Promise.all([production.initialize(productionRequest), metadataOnly.initialize(metadataAttempt)]);
    for (let tick = 0; tick < 8; tick += 1) {
      await Promise.all([production.step(), metadataOnly.step()]);
    }
    expectFrameModeledValues(metadataOnly.getLatestFrame(), production.getLatestFrame()!);
    production.dispose();
    metadataOnly.dispose();
  });

  it("rejects unsupported template projection explicitly in both mechanisms", async () => {
    const request = {
      runId: "forest-not-supported",
      runConfig: createDefaultRunConfig({ template: forestFireTemplate, seed: "forest-runtime-audit" })
    };
    const local = new LocalRuntimeDriver();
    await expect(local.initialize(request)).rejects.toThrow(/limited to flocking-boids/i);
    expect(local.state).toBe("failed");

    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await expect(worker.initialize(request)).rejects.toThrow(/limited to flocking-boids/i);
    expect(worker.state).toBe("failed");
    expect(transport.terminated).toBe(true);
    local.dispose();
    worker.dispose();
  });

  it("survives 25 replacements with one bounded host and disposes idempotently", async () => {
    const transport = new HostBackedWorker();
    const worker = new WorkerRuntimeDriver(transport);
    await worker.initialize(runRequest("replace-0", 100));
    for (let index = 1; index <= 25; index += 1) {
      const ui = await worker.replaceRun(runRequest(`replace-${index}`, index % 2 === 0 ? 100 : 500, `seed-${index}`));
      expect(ui).toMatchObject({ generation: index + 1, runId: `replace-${index}`, tick: 0, playback: "paused" });
    }
    await settleMessages();
    expect(transport.listenerCount()).toBe(3);
    expect(transport.host.queueCounts()).toEqual({ frame: { inFlight: 0, pending: 0 }, ui: { inFlight: 0, pending: 0 } });
    worker.dispose();
    worker.dispose();
    expect(transport.terminateCount).toBe(1);
    expect(transport.listenerCount()).toBe(0);
  });

  it("rejects nonmonotonic publication offers and counts only actually replaced pending values", () => {
    const sent: number[] = [];
    let coalesced = 0;
    const gate = new LatestPublicationGate<number>(
      (value) => sent.push(value),
      (value) => value,
      () => undefined,
      () => { coalesced += 1; }
    );
    gate.offer(1);
    gate.offer(2);
    gate.offer(3);
    expect(coalesced).toBe(1);
    expect(gate.counts()).toEqual({ inFlight: 1, pending: 1 });
    expect(() => gate.offer(3)).toThrow(/strictly increasing/i);
    gate.acknowledge(1);
    expect(sent).toEqual([1, 3]);
  });
});

class HostBackedWorker implements RuntimeWorkerLike {
  readonly host: RuntimeWorkerHost;
  terminated = false;
  terminateCount = 0;
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
    if (this.terminated) {
      return;
    }
    this.host.dispose();
    this.terminated = true;
    this.terminateCount += 1;
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

  listenerCount(): number {
    return this.messageListeners.size + this.errorListeners.size + this.messageErrorListeners.size;
  }

  private listeners(type: "message" | "error" | "messageerror"): Set<any> {
    if (type === "message") return this.messageListeners;
    if (type === "error") return this.errorListeners;
    return this.messageErrorListeners;
  }
}

class PassiveWorker implements RuntimeWorkerLike {
  readonly messages: unknown[] = [];
  terminated = false;
  private readonly messageListeners = new Set<(event: MessageEvent<unknown>) => void>();
  private readonly errorListeners = new Set<(event: ErrorEvent) => void>();
  private readonly messageErrorListeners = new Set<(event: MessageEvent<unknown>) => void>();

  postMessage(message: unknown): void {
    if (this.terminated) {
      throw new Error("Passive Worker is terminated");
    }
    this.messages.push(structuredClone(message));
  }

  terminate(): void {
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
      listener({ data: structuredClone(message) } as MessageEvent<unknown>);
    }
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

function runRequest(runId: string, agentCount: 100 | 500, seed = `seed-${runId}`) {
  const runConfig = createImmersiveFlockingRunConfig(agentCount);
  return { runId, runConfig: { ...runConfig, seed } };
}

function expectFrameModeledValues(actual: RenderFramePacket | null, expected: RenderFramePacket): void {
  expect(actual).not.toBeNull();
  expect(actual?.tick).toBe(expected.tick);
  expect(actual?.runtimeSignature).toBe(expected.runtimeSignature);
  expect(actual?.entityIds).toEqual(expected.entityIds);
  expect(actual?.positions).toEqual(expected.positions);
  expect(actual?.velocities).toEqual(expected.velocities);
  expect(actual?.neighborCounts).toEqual(expected.neighborCounts);
  expect(actual?.groupCodes).toEqual(expected.groupCodes);
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

function runTimer(timer: (() => void) | undefined): void {
  if (!timer) {
    throw new Error("Expected a scheduled runtime callback");
  }
  timer();
}

async function settleMessages(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}
