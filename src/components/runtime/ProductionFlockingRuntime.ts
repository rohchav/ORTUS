"use client";

import {
  BoundedPerformanceRecorder,
  parseRuntimeArtifact,
  runConfigFromArtifact,
  WorkerRuntimeDriver,
  type InterventionRequest,
  type PerformanceMeasureSummary,
  type RuntimeArtifactImportRequest,
  type RuntimeArtifactKind,
  type RuntimeDriverState,
  type RuntimePublication,
  type RuntimeRunRequest,
  type RuntimeWorkerLike,
  type SimulationRunConfig,
  type SimulationRuntimePort,
  type UIProjection
} from "../../simulation";
import {
  createEmptyFlockingFrameSceneAdapter,
  createFlockingFrameSceneAdapter,
  type WorldSceneAdapter
} from "../../lib/immersiveWorld";

export interface ProductionFlockingRuntimeView {
  revision: number;
  state: RuntimeDriverState;
  ui: UIProjection | null;
  error: string | null;
}

export interface ProductionFlockingRuntimeOptions {
  port?: SimulationRuntimePort;
  createWorker?: () => RuntimeWorkerLike;
}

export class ProductionFlockingRuntime {
  private port: SimulationRuntimePort | null = null;
  private adapter: WorldSceneAdapter = createEmptyFlockingFrameSceneAdapter();
  private latestUI: UIProjection | null = null;
  private currentRequest: RuntimeRunRequest | null = null;
  private desiredSelection: string | null = null;
  private desiredSpeed = 1;
  private error: string | null = null;
  private disposed = false;
  private revision = 0;
  private operationSequence = 0;
  private initialization: Promise<void> = Promise.resolve();
  private unsubscribePort: (() => void) | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly presentationMeasures = new BoundedPerformanceRecorder({ enabled: true, maxSamples: 360 });

  constructor(private readonly options: ProductionFlockingRuntimeOptions = {}) {}

  get agentCount(): number {
    const configured = this.currentRequest?.runConfig.parameters.agentCount;
    return this.latestUI?.entityCount ?? (typeof configured === "number" ? configured : 0);
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getView = (): ProductionFlockingRuntimeView => {
    const portState = this.port?.state;
    return {
      revision: this.revision,
      state: this.disposed
        ? "disposed"
        : portState === "ready"
          ? "ready"
          : this.error
            ? "failed"
            : portState ?? "idle",
      ui: this.latestUI,
      error: this.error
    };
  };

  getSceneAdapter(): WorldSceneAdapter {
    return this.adapter;
  }

  getActiveRunConfig(): SimulationRunConfig | null {
    return this.currentRequest?.runConfig ?? null;
  }

  getPresentationMeasures(): readonly PerformanceMeasureSummary[] {
    return this.presentationMeasures.summaries();
  }

  resetPerformanceMeasurement(): void {
    this.presentationMeasures.clear();
    this.port?.resetPerformance();
  }

  start(request: RuntimeRunRequest): Promise<void> {
    this.assertNotDisposed();
    if (this.port) {
      return this.replaceRun(request);
    }
    try {
      this.port = this.options.port ?? new WorkerRuntimeDriver(
        this.options.createWorker?.() ?? createProductionWorker()
      );
    } catch (error) {
      this.recordError(error);
      return Promise.reject(error);
    }
    this.unsubscribePort = this.port.subscribe((publication) => this.handlePublication(publication));
    this.initialization = this.runLifecycleOperation(
      () => this.port!.initialize(request),
      () => {
        this.currentRequest = request;
        this.adapter = createEmptyFlockingFrameSceneAdapter();
        this.latestUI = null;
        this.error = null;
      }
    );
    return this.initialization;
  }

  replaceRun(request: RuntimeRunRequest): Promise<void> {
    this.assertNotDisposed();
    if (!this.port) {
      return this.start(request);
    }
    this.initialization = this.runLifecycleOperation(
      () => this.port!.replaceRun(request),
      () => {
        this.currentRequest = request;
        this.desiredSelection = null;
        this.adapter = createEmptyFlockingFrameSceneAdapter();
        this.latestUI = null;
        this.error = null;
      }
    );
    return this.initialization;
  }

  whenReady(): Promise<void> {
    return this.initialization.then(() => undefined, () => undefined).then(() => {
      this.assertNotDisposed();
      if (this.port?.state === "ready") {
        return;
      }
      if (this.error) {
        throw new Error(this.error);
      }
      throw new Error(`Production Flocking runtime did not become ready; current state is ${this.port?.state ?? "idle"}`);
    });
  }

  play(): void {
    this.runControl(() => this.requirePort().play());
  }

  pause(): void {
    this.runControl(() => this.requirePort().pause());
  }

  step(): Promise<void> {
    return this.runOperation(() => this.requirePort().step());
  }

  reset(): Promise<void> {
    this.initialization = this.runLifecycleOperation(
      () => this.requirePort().reset(),
      () => {
        this.desiredSelection = null;
        this.adapter = createEmptyFlockingFrameSceneAdapter();
        this.latestUI = null;
        this.error = null;
      }
    );
    return this.initialization;
  }

  setSpeedMultiplier(value: number): void {
    this.desiredSpeed = value;
    if (this.port?.state !== "ready") {
      return;
    }
    this.runControl(() => this.requirePort().setSpeedMultiplier(value));
  }

  setSelectedEntity(entityId: string | null): void {
    this.desiredSelection = entityId;
    if (this.port?.state !== "ready") {
      return;
    }
    this.runControl(() => this.requirePort().setSelectedEntity(entityId));
  }

  applyIntervention(request: InterventionRequest): Promise<void> {
    return this.runOperation(() => this.requirePort().applyIntervention(request));
  }

  clearInterventions(): Promise<void> {
    return this.runOperation(() => this.requirePort().clearInterventions());
  }

  exportArtifact(kind: RuntimeArtifactKind): Promise<string> {
    this.assertReady();
    return this.requirePort().exportArtifact(kind);
  }

  importArtifact(request: RuntimeArtifactImportRequest): Promise<void> {
    this.assertReady();
    let importedRunConfig: SimulationRunConfig;
    try {
      importedRunConfig = runConfigFromArtifact(parseRuntimeArtifact(request.kind, request.json));
    } catch (error) {
      this.recordError(error);
      return Promise.reject(error);
    }
    this.initialization = this.runLifecycleOperation(
      () => this.requirePort().importArtifact(request),
      () => {
        this.currentRequest = {
          runId: request.runId,
          runConfig: importedRunConfig,
          instrumentation: true
        };
        this.desiredSelection = null;
        this.adapter = createEmptyFlockingFrameSceneAdapter();
        this.latestUI = null;
        this.error = null;
      }
    );
    return this.initialization;
  }

  recordPresentationDuration(name: "ortus.render.draw", durationMs: number): void {
    this.presentationMeasures.record(name, durationMs);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.operationSequence += 1;
    this.unsubscribePort?.();
    this.unsubscribePort = null;
    this.port?.dispose();
    this.port = null;
    this.adapter = createEmptyFlockingFrameSceneAdapter();
    this.latestUI = null;
    this.listeners.clear();
  }

  private runLifecycleOperation(
    operation: () => Promise<UIProjection>,
    onAccepted: () => void
  ): Promise<void> {
    const previousState = this.port?.state;
    let pending: Promise<UIProjection>;
    try {
      pending = operation();
      const accepted = this.port?.executionKind === "local"
        || this.port?.state === "initializing"
        || previousState === "idle";
      if (accepted) {
        onAccepted();
        this.operationSequence += 1;
      }
      this.notify();
    } catch (error) {
      this.recordError(error);
      return Promise.reject(error);
    }
    const sequence = this.operationSequence;
    return pending.then((ui) => {
      if (this.disposed || sequence !== this.operationSequence) {
        return;
      }
      this.acceptUI(ui);
      this.error = null;
      this.applyDesiredPresentationRequests();
      this.notify();
    }).catch((error) => {
      if (this.disposed || sequence !== this.operationSequence) {
        return;
      }
      this.recordError(error);
      throw error;
    });
  }

  private runOperation(operation: () => Promise<UIProjection>): Promise<void> {
    const sequence = this.operationSequence;
    try {
      this.assertReady();
      return operation().then((ui) => {
        if (this.disposed || sequence !== this.operationSequence) {
          return;
        }
        if (this.acceptUI(ui)) {
          this.error = null;
          this.notify();
        }
      }).catch((error) => {
        if (this.disposed || sequence !== this.operationSequence) {
          return;
        }
        this.recordError(error);
        throw error;
      });
    } catch (error) {
      this.recordError(error);
      return Promise.reject(error);
    }
  }

  private runControl(operation: () => void): void {
    try {
      this.assertReady();
      operation();
      this.error = null;
    } catch (error) {
      this.recordError(error);
    }
  }

  private applyDesiredPresentationRequests(): void {
    if (this.port?.state !== "ready") {
      return;
    }
    this.port.setSpeedMultiplier(this.desiredSpeed);
    this.port.setSelectedEntity(this.desiredSelection);
  }

  private handlePublication(publication: RuntimePublication): void {
    if (this.disposed) {
      return;
    }
    if (publication.type === "frame") {
      this.adapter = createFlockingFrameSceneAdapter(publication.frame);
      return;
    }
    if (publication.type === "ui") {
      if (this.acceptUI(publication.ui)) {
        this.error = publication.ui.playback === "failed" ? this.error : null;
        this.notify();
      }
      return;
    }
    this.recordError(publication.failure.message);
  }

  private recordError(error: unknown): void {
    this.error = boundedErrorMessage(error);
    this.notify();
  }

  private acceptUI(ui: UIProjection): boolean {
    if (
      this.latestUI
      && (
        ui.generation < this.latestUI.generation
        || (ui.generation === this.latestUI.generation && ui.revision < this.latestUI.revision)
      )
    ) {
      return false;
    }
    this.latestUI = ui;
    return true;
  }

  private notify(): void {
    this.revision += 1;
    for (const listener of this.listeners) {
      listener();
    }
  }

  private assertReady(): void {
    this.assertNotDisposed();
    if (this.port?.state !== "ready") {
      throw new Error(`Production Flocking runtime is ${this.port?.state ?? "idle"}`);
    }
  }

  private requirePort(): SimulationRuntimePort {
    this.assertNotDisposed();
    if (!this.port) {
      throw new Error("Production Flocking runtime has not been initialized");
    }
    return this.port;
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error("Production Flocking runtime is disposed");
    }
  }
}

function createProductionWorker(): RuntimeWorkerLike {
  if (typeof Worker !== "function") {
    throw new Error("This browser cannot initialize the required Simulation Worker; no implicit local fallback was started");
  }
  return new Worker(new URL("../../workers/simulationRuntime.worker.ts", import.meta.url), {
    type: "module",
    name: "ortus-production-flocking-runtime"
  }) as unknown as RuntimeWorkerLike;
}

function boundedErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return (message.trim() || "Production Flocking runtime failed").slice(0, 2_000);
}
