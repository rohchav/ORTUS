import {
  BoundedPerformanceRecorder,
  LocalRuntimeDriver,
  WorkerRuntimeDriver,
  type PerformanceMeasureName,
  type PerformanceMeasureSummary,
  type RuntimeExecutionKind,
  type RuntimePublication,
  type RuntimeWorkerLike,
  type SimulationRuntimePort,
  type UIProjection
} from "../../simulation";
import {
  createEmptyFlockingFrameSceneAdapter,
  createFlockingFrameSceneAdapter,
  createImmersiveFlockingRunConfig,
  immersiveFlockingInitializationPreset,
  immersiveFlockingScenarioId,
  immersiveFlockingSeed,
  type ImmersiveAgentCount,
  type WorldSceneAdapter
} from "../../lib/immersiveWorld";

export type ImmersiveAdvanceKind = "initialization" | "run" | "step" | "command" | "restore" | "replacement";

export interface ImmersiveRuntimeView {
  revision: number;
  generation: number;
  tick: number;
  time: number;
  isReady: boolean;
  isRunning: boolean;
  executionKind: RuntimeExecutionKind;
  agentCount: ImmersiveAgentCount;
  alignment: number | null;
  scenarioId: string;
  seed: string;
  initializationPreset: string;
  runtimeSignature: string;
  lastAdvanceKind: ImmersiveAdvanceKind;
  error: string | null;
}

export interface ImmersiveRuntimePerformanceSummary {
  elapsedMs: number;
  ticksAdvanced: number;
  ticksPerSecond: number;
  medianStepAndSnapshotMs: number;
  p95StepAndSnapshotMs: number;
  medianEngineStepMs: number;
  p95EngineStepMs: number;
  medianSnapshotMs: number;
  p95SnapshotMs: number;
  medianAdapterMs: number;
  p95AdapterMs: number;
  sampleCount: number;
  executionKind: RuntimeExecutionKind;
  generation: number;
  framePublications: number;
  uiPublications: number;
  framesCoalesced: number;
  uiCoalesced: number;
  measures: readonly PerformanceMeasureSummary[];
}

export interface ImmersiveFlockingRuntimeOptions {
  execution?: RuntimeExecutionKind;
  port?: SimulationRuntimePort;
}

const maxPerformanceSamples = 360;

export class ImmersiveFlockingRuntime {
  private port: SimulationRuntimePort | null = null;
  private readonly requestedExecution: RuntimeExecutionKind;
  private readonly providedPort: SimulationRuntimePort | undefined;
  private adapter: WorldSceneAdapter = createEmptyFlockingFrameSceneAdapter();
  private latestUI: UIProjection | null = null;
  private disposed = false;
  private revision = 0;
  private listeners = new Set<() => void>();
  private error: string | null = null;
  private view: ImmersiveRuntimeView;
  private unsubscribePort: (() => void) | null = null;
  private initialization: Promise<void> = Promise.resolve();
  private measurementStartedAt: number | null = null;
  private measurementStartTick = 0;
  private measurementStartFramePublications = 0;
  private measurementStartUiPublications = 0;
  private framePublications = 0;
  private uiPublications = 0;
  private adapterSamples: number[] = [];
  private readonly presentationMeasures = new BoundedPerformanceRecorder({ enabled: true, maxSamples: maxPerformanceSamples });

  constructor(
    readonly agentCount: ImmersiveAgentCount,
    options: ImmersiveFlockingRuntimeOptions = {}
  ) {
    const requestedExecution = options.port?.executionKind ?? options.execution ?? "local";
    this.requestedExecution = requestedExecution;
    this.providedPort = options.port;
    this.view = this.buildView(requestedExecution);
    if (requestedExecution === "local" || options.port) {
      this.start();
    }
  }

  start(): void {
    if (this.disposed || this.port) {
      return;
    }
    try {
      this.port = this.providedPort ?? createRuntimePort(this.requestedExecution);
    } catch (error) {
      this.handleRejectedOperation(error);
      return;
    }
    if (!this.port) {
      return;
    }
    this.unsubscribePort = this.port.subscribe((publication) => this.handlePublication(publication));
    this.initialization = this.port.initialize({
      runId: immersiveFlockingScenarioId,
      runConfig: createImmersiveFlockingRunConfig(this.agentCount),
      instrumentation: true
    }).then(() => undefined).catch((error) => {
      if (!this.error) {
        this.error = error instanceof Error ? error.message : String(error);
        this.refreshView();
        this.notify();
      }
    });
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getView = (): ImmersiveRuntimeView => this.view;

  whenReady(): Promise<void> {
    this.start();
    return this.initialization;
  }

  getSceneAdapter(): WorldSceneAdapter {
    return this.adapter;
  }

  play(): void {
    if (this.disposed || !this.view.isReady) {
      return;
    }
    try {
      this.port?.play();
    } catch (error) {
      this.handleRejectedOperation(error);
    }
  }

  pause(): void {
    if (this.disposed) {
      return;
    }
    this.port?.pause();
  }

  toggleRunning(): void {
    if (this.view.isRunning) {
      this.pause();
    } else {
      this.play();
    }
  }

  stepOnce(): Promise<void> {
    if (this.disposed || !this.view.isReady || this.view.isRunning || !this.port) {
      return Promise.resolve();
    }
    return this.port.step().then(() => undefined).catch((error) => this.handleRejectedOperation(error));
  }

  restore(): Promise<void> {
    if (this.disposed || !this.port) {
      return Promise.resolve();
    }
    this.error = null;
    this.adapterSamples = [];
    this.presentationMeasures.clear();
    return this.port.reset().then(() => undefined).catch((error) => this.handleRejectedOperation(error));
  }

  setSelectedEntity(entityId: string | null): void {
    if (this.disposed || !this.view.isReady || !this.port) {
      return;
    }
    try {
      this.port.setSelectedEntity(entityId);
    } catch (error) {
      this.handleRejectedOperation(error);
    }
  }

  startPerformanceMeasurement(at = readNow()): void {
    this.measurementStartedAt = at;
    this.measurementStartTick = this.adapter.tick;
    this.measurementStartFramePublications = this.framePublications;
    this.measurementStartUiPublications = this.uiPublications;
    this.adapterSamples = [];
    this.presentationMeasures.clear();
    this.port?.resetPerformance();
  }

  recordPresentationDuration(name: Extract<PerformanceMeasureName, "ortus.render.draw">, durationMs: number): void {
    this.presentationMeasures.record(name, durationMs);
  }

  performanceSummary(at = readNow()): ImmersiveRuntimePerformanceSummary {
    const elapsedMs = this.measurementStartedAt === null ? 0 : Math.max(0, at - this.measurementStartedAt);
    const ticksAdvanced = this.adapter.tick - this.measurementStartTick;
    const workerMeasures = this.latestUI?.performance.measures ?? [];
    const engineStep = findMeasure(workerMeasures, "ortus.sim.step");
    const snapshot = findMeasure(workerMeasures, "ortus.sim.snapshot");
    const packetProjection = findMeasure(workerMeasures, "ortus.scene.project");
    const adapters = [...this.adapterSamples].sort((left, right) => left - right);
    const measures = [...workerMeasures, ...this.presentationMeasures.summaries()]
      .sort((left, right) => left.name.localeCompare(right.name));
    const publications = this.latestUI?.performance.publications;
    return {
      elapsedMs,
      ticksAdvanced,
      ticksPerSecond: elapsedMs > 0 ? ticksAdvanced / elapsedMs * 1000 : 0,
      medianStepAndSnapshotMs: (engineStep?.medianMs ?? 0) + (packetProjection?.medianMs ?? 0),
      p95StepAndSnapshotMs: (engineStep?.p95Ms ?? 0) + (packetProjection?.p95Ms ?? 0),
      medianEngineStepMs: engineStep?.medianMs ?? 0,
      p95EngineStepMs: engineStep?.p95Ms ?? 0,
      medianSnapshotMs: snapshot?.medianMs ?? 0,
      p95SnapshotMs: snapshot?.p95Ms ?? 0,
      medianAdapterMs: percentile(adapters, 0.5),
      p95AdapterMs: percentile(adapters, 0.95),
      sampleCount: engineStep?.count ?? 0,
      executionKind: this.view.executionKind,
      generation: this.view.generation,
      framePublications: this.framePublications - this.measurementStartFramePublications,
      uiPublications: this.uiPublications - this.measurementStartUiPublications,
      framesCoalesced: publications?.framesCoalesced ?? 0,
      uiCoalesced: publications?.uiCoalesced ?? 0,
      measures
    };
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.unsubscribePort?.();
    this.unsubscribePort = null;
    this.port?.dispose();
    this.listeners.clear();
  }

  private handlePublication(publication: RuntimePublication): void {
    if (this.disposed) {
      return;
    }
    if (publication.type === "frame") {
      const started = readNow();
      const adapter = createFlockingFrameSceneAdapter(publication.frame);
      adapter.getEntities();
      pushBounded(this.adapterSamples, Math.max(0, readNow() - started));
      this.adapter = adapter;
      this.framePublications += 1;
      return;
    }
    if (publication.type === "ui") {
      this.latestUI = publication.ui;
      this.uiPublications += 1;
      this.refreshView();
      this.notify();
      return;
    }
    this.error = publication.failure.message;
    this.refreshView();
    this.notify();
  }

  private handleRejectedOperation(error: unknown): void {
    this.error = error instanceof Error ? error.message : String(error);
    this.refreshView();
    this.notify();
  }

  private buildView(executionKind = this.port?.executionKind ?? "worker"): ImmersiveRuntimeView {
    const ui = this.latestUI;
    return {
      revision: this.revision,
      generation: ui?.generation ?? this.port?.generation ?? 0,
      tick: ui?.tick ?? 0,
      time: ui?.time ?? 0,
      isReady: ui !== null && (ui.playback === "paused" || ui.playback === "running") && this.error === null,
      isRunning: ui?.playback === "running",
      executionKind,
      agentCount: this.agentCount,
      alignment: ui?.alignment ?? null,
      scenarioId: immersiveFlockingScenarioId,
      seed: immersiveFlockingSeed,
      initializationPreset: immersiveFlockingInitializationPreset,
      runtimeSignature: this.adapter.getRuntimeSignature(),
      lastAdvanceKind: ui?.lastAdvanceKind ?? "initialization",
      error: this.error
    };
  }

  private refreshView(): void {
    this.revision += 1;
    this.view = this.buildView(this.view.executionKind);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

function createRuntimePort(execution: RuntimeExecutionKind): SimulationRuntimePort | null {
  if (execution === "local") {
    return new LocalRuntimeDriver();
  }
  if (typeof window === "undefined") {
    return null;
  }
  if (typeof Worker !== "function") {
    throw new Error("This browser cannot initialize the required Simulation Worker; no implicit local fallback was started");
  }
  const worker = new Worker(new URL("../../workers/simulationRuntime.worker.ts", import.meta.url), {
    type: "module",
    name: "ortus-simulation-runtime"
  });
  return new WorkerRuntimeDriver(worker as unknown as RuntimeWorkerLike);
}

function findMeasure(
  measures: readonly PerformanceMeasureSummary[],
  name: PerformanceMeasureName
): PerformanceMeasureSummary | undefined {
  return measures.find((measure) => measure.name === name);
}

function readNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function pushBounded(target: number[], value: number): void {
  target.push(value);
  if (target.length > maxPerformanceSamples) {
    target.splice(0, target.length - maxPerformanceSamples);
  }
}

function percentile(sorted: readonly number[], fraction: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return sorted[index] ?? 0;
}
