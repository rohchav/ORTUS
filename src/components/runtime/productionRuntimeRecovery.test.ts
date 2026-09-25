import { describe, expect, it } from "vitest";
import { WorkerRuntimeDriver, type RuntimeWorkerLike } from "../../simulation";
import { RuntimeWorkerHost } from "../../simulation/runtime/RuntimeWorkerHost";
import { createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld";
import { ProductionFlockingRuntime } from "./ProductionFlockingRuntime";

// Recovery contract for the production Flocking runtime:
// - a rejected import is refused before the driver changes generation, so the active run continues;
// - a failed driver (engine failure inside the Worker, or the Worker itself failing) stays stopped;
// - only an explicit rebuild (Reset, a Setup change) retires it and starts a fresh driver and Worker.
describe("production Flocking runtime recovery", () => {
  it("refuses an invalid import without replacing or stopping the active Worker run", async () => {
    const workers = workerFactory();
    const runtime = new ProductionFlockingRuntime({ createWorker: workers.create });
    const runConfig = createImmersiveFlockingRunConfig(100);
    await runtime.start({ runId: "recovery-base", runConfig, instrumentation: true });
    await runtime.step();
    const tampered = destroyedButPlaced(await runtime.exportArtifact("snapshot"));

    await expect(runtime.importArtifact({ runId: "recovery-tampered", kind: "snapshot", json: tampered })).rejects.toThrow(
      /contains destroyed entity/
    );

    expect(runtime.getView()).toMatchObject({ state: "ready", ui: { runId: "recovery-base", tick: 1 } });
    expect(runtime.getActiveRunConfig()).toBe(runConfig);
    await runtime.step();
    expect(runtime.getView()).toMatchObject({ state: "ready", error: null, ui: { runId: "recovery-base", tick: 2 } });
    expect(workers.created).toHaveLength(1);
    expect(workers.created[0]!.terminated).toBe(false);
    runtime.dispose();
  });

  it.each([
    [
      "an engine failure inside the Worker",
      (worker: HostBackedWorker, generation: number) =>
        worker.host.handleMessage({
          type: "runtime.applyCommands",
          requestId: 9_999,
          generation,
          commands: [{ type: "destroyEntity", entityId: "e999999" }]
        })
    ],
    ["the Worker itself failing", (worker: HostBackedWorker) => worker.emitError("injected Worker crash")]
  ])("stays stopped after %s until an explicit rebuild starts a fresh driver and Worker", async (_label, fail) => {
    const workers = workerFactory();
    const runtime = new ProductionFlockingRuntime({ createWorker: workers.create });
    const runConfig = createImmersiveFlockingRunConfig(100);
    await runtime.start({ runId: "recovery-before", runConfig, instrumentation: true });
    await runtime.step();
    const failedWorker = workers.created[0]!;

    fail(failedWorker, runtime.getView().ui!.generation);
    await settleMessages();

    expect(runtime.getView().state).toBe("failed");
    expect(failedWorker.terminated).toBe(true);
    await expect(runtime.step()).rejects.toThrow(/failed/);
    runtime.play();
    expect(runtime.getView().state).toBe("failed");
    expect(workers.created).toHaveLength(1);

    await runtime.replaceRun({ runId: "recovery-rebuilt", runConfig, instrumentation: true });

    expect(workers.created).toHaveLength(2);
    expect(runtime.getView()).toMatchObject({ state: "ready", error: null, ui: { runId: "recovery-rebuilt", generation: 1, tick: 0 } });
    expect(failedWorker.listenerCount()).toBe(0);
    failedWorker.emit({ type: "runtime.failure", failure: { generation: 1, runId: "recovery-rebuilt", code: "runtime", message: "stale" } });
    await runtime.step();
    expect(runtime.getView()).toMatchObject({ state: "ready", error: null, ui: { runId: "recovery-rebuilt", generation: 1, tick: 1 } });
    runtime.dispose();
    expect(workers.created[1]!.terminated).toBe(true);
  });

  it("rebuilds after a Worker that could not start, once an explicit rebuild can create one", async () => {
    const workers = workerFactory({ failFirst: true });
    const runtime = new ProductionFlockingRuntime({ createWorker: workers.create });
    const runConfig = createImmersiveFlockingRunConfig(100);

    await expect(runtime.start({ runId: "recovery-no-worker", runConfig })).rejects.toThrow(/cannot start/);
    expect(runtime.getView().state).toBe("failed");

    await runtime.replaceRun({ runId: "recovery-started", runConfig });
    expect(runtime.getView()).toMatchObject({ state: "ready", error: null, ui: { runId: "recovery-started", tick: 0 } });
    runtime.dispose();
  });

  it("does not replace an injected port, which it cannot recreate", async () => {
    const workers = workerFactory();
    const port = new WorkerRuntimeDriver(workers.create());
    const runtime = new ProductionFlockingRuntime({ port });
    const runConfig = createImmersiveFlockingRunConfig(100);
    await runtime.start({ runId: "recovery-injected", runConfig });
    workers.created[0]!.emitError("injected Worker crash");
    await settleMessages();

    await expect(runtime.replaceRun({ runId: "recovery-injected-rebuild", runConfig })).rejects.toThrow(/will not fall back/);
    expect(runtime.getView().state).toBe("failed");
    expect(workers.created).toHaveLength(1);
    runtime.dispose();
  });
});

function destroyedButPlaced(snapshotJson: string): string {
  const snapshot = JSON.parse(snapshotJson) as { world: { entities: { entities: Array<Record<string, unknown>> } } };
  Object.assign(snapshot.world.entities.entities[0]!, { alive: false, destroyedAtTick: 1 });
  return JSON.stringify(snapshot);
}

function workerFactory(options: { failFirst?: boolean } = {}) {
  const created: HostBackedWorker[] = [];
  let attempts = 0;
  return {
    created,
    create(): HostBackedWorker {
      attempts += 1;
      if (options.failFirst && attempts === 1) {
        throw new Error("Simulation Worker cannot start in this test");
      }
      const worker = new HostBackedWorker();
      created.push(worker);
      return worker;
    }
  };
}

async function settleMessages(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

// A Worker transport backed by a real RuntimeWorkerHost; messages are structured-cloned like postMessage.
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

  listenerCount(): number {
    return this.messageListeners.size + this.errorListeners.size + this.messageErrorListeners.size;
  }

  private listeners(type: "message" | "error" | "messageerror"): Set<any> {
    if (type === "message") return this.messageListeners;
    if (type === "error") return this.errorListeners;
    return this.messageErrorListeners;
  }
}
