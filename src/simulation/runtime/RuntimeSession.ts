import { BoundedPerformanceRecorder, type PerformanceMeasureName, type PerformanceMeasureSummary } from "../kernel/Performance";
import type { Command, SimulationRunConfig } from "../kernel/types";
import { SimulationValidationError } from "../kernel/Errors";
import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import { validateRunConfig } from "../runs/runConfig";
import { createFlockingRenderFramePacket, createFlockingSelectedUIProjection } from "./flockingProjection";
import {
  runtimeUiPublicationIntervalMs,
  type RenderFramePacket,
  type RuntimeAdvanceKind,
  type RuntimeExecutionKind,
  type RuntimeIdentity,
  type RuntimePlaybackState,
  type RuntimePublicationStats,
  type RuntimeRunRequest,
  type UIProjection
} from "./types";

export interface RuntimePublicationBundle {
  frame: RenderFramePacket;
  ui?: UIProjection;
}

export class RuntimeSession {
  private engine: ReturnType<typeof createEngineFromRunConfig> | undefined;
  private runConfig: SimulationRunConfig | undefined;
  private identity: RuntimeIdentity = { generation: 0, runId: "uninitialized" };
  private playback: RuntimePlaybackState = "initializing";
  private lastAdvanceKind: RuntimeAdvanceKind = "initialization";
  private selectedEntityId: string | null = null;
  private instrumentation = false;
  private disposed = false;
  private lastUiAt = Number.NEGATIVE_INFINITY;
  private latestFrame: RenderFramePacket | undefined;
  private framePublicationId = 0;
  private uiRevision = 0;
  private readonly measures = new BoundedPerformanceRecorder({ enabled: false, maxSamples: 360 });
  private publicationStats: RuntimePublicationStats = emptyPublicationStats();

  constructor(
    readonly executionKind: RuntimeExecutionKind,
    private readonly now: () => number = readNow
  ) {}

  rebuild(request: RuntimeRunRequest, identity: RuntimeIdentity, kind: "initialization" | "replacement" | "restore"): RuntimePublicationBundle {
    this.assertNotDisposed();
    const runConfig = validateRunConfig(request.runConfig);
    assertRuntimeTemplateSupport(runConfig);
    this.instrumentation = request.instrumentation ?? false;
    this.measures.setEnabled(this.instrumentation);
    this.measures.clear();
    this.publicationStats = emptyPublicationStats();
    const started = this.performanceMark();
    const engine = createEngineFromRunConfig(runConfig);
    engine.enablePerformanceInstrumentation({ enabled: this.instrumentation, maxSamples: 360 });
    this.recordElapsed("ortus.run.rebuild", started);
    this.engine?.pause();
    this.engine = engine;
    this.runConfig = runConfig;
    this.identity = identity;
    this.playback = "paused";
    this.lastAdvanceKind = kind;
    this.selectedEntityId = null;
    this.lastUiAt = Number.NEGATIVE_INFINITY;
    this.framePublicationId = 0;
    this.uiRevision = 0;
    return this.project(true);
  }

  reset(identity: RuntimeIdentity): RuntimePublicationBundle {
    this.assertNotDisposed();
    if (!this.runConfig) {
      throw new SimulationValidationError("Runtime cannot reset before initialization");
    }
    return this.rebuild(
      { runId: identity.runId, runConfig: this.runConfig, instrumentation: this.instrumentation },
      identity,
      "restore"
    );
  }

  play(): UIProjection {
    const engine = this.requireEngine();
    engine.play();
    this.playback = "running";
    return this.projectUI(this.latestFrame ?? this.projectFrame());
  }

  pause(): UIProjection {
    const engine = this.requireEngine();
    engine.pause();
    this.playback = "paused";
    return this.projectUI(this.latestFrame ?? this.projectFrame());
  }

  advance(steps: number, kind: "run" | "step"): RuntimePublicationBundle {
    const engine = this.requireEngine();
    if (!Number.isInteger(steps) || steps <= 0 || steps > engine.clock.maxStepsPerFrame) {
      throw new SimulationValidationError(`Runtime advance must contain 1..${engine.clock.maxStepsPerFrame} steps`);
    }
    if (kind === "step" && this.playback === "running") {
      throw new SimulationValidationError("Manual step requires a paused runtime");
    }
    for (let index = 0; index < steps; index += 1) {
      engine.step();
      this.publicationStats.ticksSimulated += 1;
    }
    this.lastAdvanceKind = kind;
    return this.project(kind === "step");
  }

  applyCommands(commands: readonly Command[]): RuntimePublicationBundle {
    const engine = this.requireEngine();
    engine.applyCommands(commands, { sourceSystemId: "runtime-port", reason: "validated runtime-port command" });
    this.lastAdvanceKind = "command";
    return this.project(true);
  }

  setSelectedEntity(entityId: string | null): RuntimePublicationBundle {
    const engine = this.requireEngine();
    if (entityId !== null && !engine.world.entityStore.get(entityId)?.alive) {
      throw new SimulationValidationError(`Cannot select missing runtime entity ${entityId}`);
    }
    this.selectedEntityId = entityId;
    return this.project(true);
  }

  resetPerformance(): void {
    this.measures.clear();
    this.engine?.performanceMonitor.clear();
    this.publicationStats = emptyPublicationStats();
  }

  currentIdentity(): RuntimeIdentity {
    return { ...this.identity };
  }

  get speedMultiplier(): number {
    return this.requireEngine().clock.speedMultiplier;
  }

  get maxStepsPerCycle(): number {
    return this.requireEngine().clock.maxStepsPerFrame;
  }

  get isRunning(): boolean {
    return this.playback === "running";
  }

  recordDuration(name: PerformanceMeasureName, durationMs: number): void {
    this.measures.record(name, durationMs);
  }

  performanceMark(): number {
    return this.measures.enabled ? this.now() : 0;
  }

  recordElapsed(name: PerformanceMeasureName, mark: number): void {
    if (!this.measures.enabled) {
      return;
    }
    this.measures.record(name, Math.max(0, this.now() - mark));
  }

  recordFramePublication(coalesced: boolean): void {
    if (coalesced) {
      this.publicationStats.framesCoalesced += 1;
    } else {
      this.publicationStats.framesPublished += 1;
    }
  }

  recordUiPublication(coalesced: boolean): void {
    if (coalesced) {
      this.publicationStats.uiCoalesced += 1;
    } else {
      this.publicationStats.uiPublished += 1;
    }
  }

  fail(): UIProjection | undefined {
    if (!this.engine || this.disposed) {
      return undefined;
    }
    this.engine.pause();
    this.playback = "failed";
    return this.projectUI(this.latestFrame ?? this.projectFrame());
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.engine?.pause();
    this.playback = "disposed";
    this.latestFrame = undefined;
    this.engine = undefined;
    this.runConfig = undefined;
    this.selectedEntityId = null;
    this.disposed = true;
  }

  private project(forceUI: boolean): RuntimePublicationBundle {
    const frame = this.projectFrame();
    const now = this.now();
    const shouldPublishUI = forceUI || now - this.lastUiAt >= runtimeUiPublicationIntervalMs;
    if (!shouldPublishUI) {
      return { frame };
    }
    this.lastUiAt = now;
    return { frame, ui: this.projectUI(frame) };
  }

  private projectFrame(): RenderFramePacket {
    const engine = this.requireEngine();
    const started = this.performanceMark();
    this.framePublicationId += 1;
    const frame = createFlockingRenderFramePacket(engine, this.identity, this.selectedEntityId, this.framePublicationId);
    this.recordElapsed("ortus.scene.project", started);
    this.publicationStats.framesProjected += 1;
    this.latestFrame = frame;
    return frame;
  }

  private projectUI(frame: RenderFramePacket): UIProjection {
    const started = this.performanceMark();
    this.uiRevision += 1;
    const selected = createFlockingSelectedUIProjection(this.requireEngine(), this.selectedEntityId, frame.selectedDetail);
    const ui: UIProjection = {
      schemaVersion: "1",
      projectionKind: "flocking-v1",
      revision: this.uiRevision,
      templateId: frame.templateId,
      ...this.identity,
      executionKind: this.executionKind,
      tick: frame.tick,
      time: frame.time,
      entityCount: frame.entityCount,
      playback: this.playback,
      lastAdvanceKind: this.lastAdvanceKind,
      alignment: frame.alignment,
      runtimeSignature: frame.runtimeSignature,
      selected,
      warnings: [],
      performance: {
        measures: this.performanceSummaries(),
        publications: { ...this.publicationStats, uiProjected: this.publicationStats.uiProjected + 1 }
      }
    };
    this.publicationStats.uiProjected += 1;
    this.recordElapsed("ortus.ui.publish", started);
    return ui;
  }

  private performanceSummaries(): readonly PerformanceMeasureSummary[] {
    const engineMeasures = this.engine?.performanceMonitor.measureSummaries() ?? [];
    return [...engineMeasures, ...this.measures.summaries()].sort((left, right) => left.name.localeCompare(right.name));
  }

  private requireEngine(): ReturnType<typeof createEngineFromRunConfig> {
    this.assertNotDisposed();
    if (!this.engine) {
      throw new SimulationValidationError("Runtime is not initialized");
    }
    return this.engine;
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new SimulationValidationError("Runtime is disposed");
    }
  }
}

function assertRuntimeTemplateSupport(runConfig: SimulationRunConfig): void {
  if (runConfig.templateId !== "flocking-boids") {
    throw new SimulationValidationError(
      `PERF1 runtime projection support is explicit and currently limited to flocking-boids, not ${runConfig.templateId}`
    );
  }
}

function emptyPublicationStats(): RuntimePublicationStats {
  return {
    ticksSimulated: 0,
    framesProjected: 0,
    framesPublished: 0,
    framesCoalesced: 0,
    uiProjected: 0,
    uiPublished: 0,
    uiCoalesced: 0
  };
}

function readNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}
