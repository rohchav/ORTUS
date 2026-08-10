import type { SimulationEngine, SimulationSnapshotView } from "../../simulation";
import {
  createFlockingWorldSceneAdapter,
  createImmersiveFlockingEngine,
  immersiveFlockingInitializationPreset,
  immersiveFlockingScenarioId,
  immersiveFlockingSeed,
  type ImmersiveAgentCount,
  type WorldSceneAdapter
} from "../../lib/immersiveWorld";

export type ImmersiveAdvanceKind = "initialization" | "run" | "step" | "restore";

export interface ImmersiveRuntimeView {
  revision: number;
  tick: number;
  time: number;
  isRunning: boolean;
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
  sampleCount: number;
}

const targetTicksPerSecond = 24;
const uiNotificationIntervalMs = 120;
const maxStepSamples = 360;
const maximumAccumulatedMs = 250;

export class ImmersiveFlockingRuntime {
  private engine: SimulationEngine;
  private snapshot: SimulationSnapshotView;
  private adapter: WorldSceneAdapter;
  private running = false;
  private frameRequest: number | null = null;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFrameAt: number | null = null;
  private accumulatedMs = 0;
  private disposed = false;
  private revision = 0;
  private listeners = new Set<() => void>();
  private lastNotificationAt = 0;
  private lastAdvanceKind: ImmersiveAdvanceKind = "initialization";
  private error: string | null = null;
  private view: ImmersiveRuntimeView;
  private measurementStartedAt = 0;
  private measurementStartTick = 0;
  private stepSamples: number[] = [];

  constructor(readonly agentCount: ImmersiveAgentCount) {
    this.engine = createImmersiveFlockingEngine(agentCount);
    this.snapshot = this.engine.createSnapshot();
    this.adapter = createFlockingWorldSceneAdapter(this.snapshot, this.engine.parameters);
    this.view = this.buildView();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getView = (): ImmersiveRuntimeView => this.view;

  getSceneAdapter(): WorldSceneAdapter {
    return this.adapter;
  }

  play(): void {
    if (this.disposed || this.running) {
      return;
    }
    this.running = true;
    this.error = null;
    this.engine.play();
    this.lastFrameAt = null;
    this.accumulatedMs = 0;
    this.refreshView();
    this.notify(true);
    this.scheduleNextFrame();
  }

  pause(): void {
    if (this.disposed) {
      return;
    }
    this.running = false;
    this.engine.pause();
    this.clearScheduler();
    this.lastFrameAt = null;
    this.accumulatedMs = 0;
    this.refreshView();
    this.notify(true);
  }

  toggleRunning(): void {
    if (this.running) {
      this.pause();
    } else {
      this.play();
    }
  }

  stepOnce(): void {
    if (this.disposed || this.running) {
      return;
    }
    this.advance("step", true);
  }

  restore(): void {
    if (this.disposed) {
      return;
    }
    this.pause();
    this.engine = createImmersiveFlockingEngine(this.agentCount);
    this.snapshot = this.engine.createSnapshot();
    this.adapter = createFlockingWorldSceneAdapter(this.snapshot, this.engine.parameters);
    this.lastAdvanceKind = "restore";
    this.error = null;
    this.stepSamples = [];
    this.measurementStartedAt = 0;
    this.measurementStartTick = 0;
    this.refreshView();
    this.notify(true);
  }

  startPerformanceMeasurement(at = readNow()): void {
    this.measurementStartedAt = at;
    this.measurementStartTick = this.snapshot.tick;
    this.stepSamples = [];
  }

  performanceSummary(at = readNow()): ImmersiveRuntimePerformanceSummary {
    const elapsedMs = this.measurementStartedAt > 0 ? Math.max(0, at - this.measurementStartedAt) : 0;
    const sorted = [...this.stepSamples].sort((left, right) => left - right);
    const ticksAdvanced = this.snapshot.tick - this.measurementStartTick;
    return {
      elapsedMs,
      ticksAdvanced,
      ticksPerSecond: elapsedMs > 0 ? (ticksAdvanced / elapsedMs) * 1000 : 0,
      medianStepAndSnapshotMs: percentile(sorted, 0.5),
      p95StepAndSnapshotMs: percentile(sorted, 0.95),
      sampleCount: sorted.length
    };
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.running = false;
    this.engine.pause();
    this.clearScheduler();
    this.disposed = true;
    this.listeners.clear();
  }

  private scheduleNextFrame(): void {
    this.clearScheduler();
    if (typeof globalThis.requestAnimationFrame === "function") {
      this.frameRequest = globalThis.requestAnimationFrame((at) => this.runScheduledFrame(at));
      return;
    }
    this.fallbackTimer = setTimeout(() => this.runScheduledFrame(readNow()), 1000 / 60);
  }

  private runScheduledFrame(at: number): void {
    if (!this.running || this.disposed) {
      return;
    }
    const previous = this.lastFrameAt ?? at;
    this.lastFrameAt = at;
    this.accumulatedMs += Math.min(maximumAccumulatedMs, Math.max(0, at - previous));
    const intervalMs = 1000 / targetTicksPerSecond;
    const requestedSteps = Math.floor(this.accumulatedMs / intervalMs);
    const steps = Math.min(requestedSteps, this.engine.clock.maxStepsPerFrame);
    if (steps > 0) {
      this.accumulatedMs -= steps * intervalMs;
      this.advance("run", false, steps);
    }
    if (!this.running || this.disposed) {
      return;
    }
    this.scheduleNextFrame();
  }

  private advance(kind: "run" | "step", forceNotification: boolean, steps = 1): void {
    const startedAt = readNow();
    try {
      if (steps === 1) {
        this.engine.step();
      } else {
        this.engine.runSteps(steps);
      }
      this.snapshot = this.engine.createSnapshot();
      this.adapter = createFlockingWorldSceneAdapter(this.snapshot, this.engine.parameters);
      this.lastAdvanceKind = kind;
      this.error = null;
      pushBounded(this.stepSamples, Math.max(0, readNow() - startedAt) / steps);
      this.refreshView();
      this.notify(forceNotification);
    } catch (error) {
      this.running = false;
      this.engine.pause();
      this.clearScheduler();
      this.error = error instanceof Error ? error.message : String(error);
      this.refreshView();
      this.notify(true);
    }
  }

  private buildView(): ImmersiveRuntimeView {
    return {
      revision: this.revision,
      tick: this.snapshot.tick,
      time: this.snapshot.time,
      isRunning: this.running,
      agentCount: this.agentCount,
      alignment: this.adapter.getLensData().alignment,
      scenarioId: immersiveFlockingScenarioId,
      seed: immersiveFlockingSeed,
      initializationPreset: immersiveFlockingInitializationPreset,
      runtimeSignature: this.adapter.getRuntimeSignature(),
      lastAdvanceKind: this.lastAdvanceKind,
      error: this.error
    };
  }

  private refreshView(): void {
    this.revision += 1;
    this.view = this.buildView();
  }

  private notify(force: boolean): void {
    const now = readNow();
    if (!force && now - this.lastNotificationAt < uiNotificationIntervalMs) {
      return;
    }
    this.lastNotificationAt = now;
    for (const listener of this.listeners) {
      listener();
    }
  }

  private clearScheduler(): void {
    if (this.frameRequest !== null && typeof globalThis.cancelAnimationFrame === "function") {
      globalThis.cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
    if (this.fallbackTimer !== null) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}

function readNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function pushBounded(target: number[], value: number): void {
  target.push(value);
  if (target.length > maxStepSamples) {
    target.splice(0, target.length - maxStepSamples);
  }
}

function percentile(sorted: readonly number[], fraction: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return sorted[index] ?? 0;
}
