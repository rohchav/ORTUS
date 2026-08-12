import { SimulationValidationError } from "./Errors";

export interface PerformanceInstrumentationOptions {
  enabled?: boolean;
  maxSamples?: number;
  now?: () => number;
}

export const performanceMeasureNames = [
  "ortus.sim.step",
  "ortus.sim.neighbors",
  "ortus.sim.snapshot",
  "ortus.runtime.publish",
  "ortus.scene.project",
  "ortus.render.draw",
  "ortus.ui.publish",
  "ortus.run.rebuild"
] as const;

export type PerformanceMeasureName = (typeof performanceMeasureNames)[number];

export interface PerformanceMeasureSummary {
  name: PerformanceMeasureName;
  count: number;
  medianMs: number;
  p95Ms: number;
  maxMs: number;
  totalMs: number;
}

export interface TickPerformanceSample {
  tick: number;
  time: number;
  stepMs: number;
  schedulerMs: number;
  metricsMs: number;
  entityCount: number;
  counters: Record<string, number>;
}

export interface SnapshotPerformanceSample {
  tick: number;
  snapshotMs: number;
  entityCount: number;
  metricsHistoryLength: number;
}

export interface FramePerformanceSample {
  tick: number;
  steps: number;
  updateMs: number;
  frameIntervalMs?: number;
}

export interface SimulationPerformanceSnapshot {
  enabled: boolean;
  maxSamples: number;
  tickSamples: readonly TickPerformanceSample[];
  snapshotSamples: readonly SnapshotPerformanceSample[];
  frameSamples: readonly FramePerformanceSample[];
  measures: readonly PerformanceMeasureSummary[];
}

const defaultMaxSamples = 120;

export class SimulationPerformanceMonitor {
  private enabledState: boolean;
  private maxSamplesValue: number;
  private readonly nowFn: () => number;
  private readonly tickSamples: TickPerformanceSample[] = [];
  private readonly snapshotSamples: SnapshotPerformanceSample[] = [];
  private readonly frameSamples: FramePerformanceSample[] = [];
  private readonly counters = new Map<string, number>();
  private readonly measures: BoundedPerformanceRecorder;

  constructor(options: boolean | PerformanceInstrumentationOptions | undefined = false) {
    const normalized = typeof options === "boolean" ? { enabled: options } : (options ?? {});
    this.enabledState = normalized.enabled ?? false;
    this.maxSamplesValue = normalizeMaxSamples(normalized.maxSamples ?? defaultMaxSamples);
    this.nowFn = normalized.now ?? defaultNow;
    this.measures = new BoundedPerformanceRecorder({
      enabled: this.enabledState,
      maxSamples: this.maxSamplesValue
    });
  }

  get enabled(): boolean {
    return this.enabledState;
  }

  get maxSamples(): number {
    return this.maxSamplesValue;
  }

  enable(options: PerformanceInstrumentationOptions = {}): void {
    this.enabledState = options.enabled ?? true;
    this.measures.setEnabled(this.enabledState);
    if (options.maxSamples !== undefined) {
      this.maxSamplesValue = normalizeMaxSamples(options.maxSamples);
      this.measures.setMaxSamples(this.maxSamplesValue);
      this.trimAll();
    }
  }

  disable(): void {
    this.enabledState = false;
    this.measures.setEnabled(false);
  }

  clear(): void {
    this.tickSamples.length = 0;
    this.snapshotSamples.length = 0;
    this.frameSamples.length = 0;
    this.counters.clear();
    this.measures.clear();
  }

  mark(): number {
    return this.enabledState ? this.nowFn() : 0;
  }

  elapsedSince(mark: number): number {
    return this.enabledState ? Math.max(0, this.nowFn() - mark) : 0;
  }

  recordDuration(name: PerformanceMeasureName, durationMs: number): void {
    this.measures.record(name, durationMs);
  }

  measureSummaries(): readonly PerformanceMeasureSummary[] {
    return this.measures.summaries();
  }

  recordCounter(counterId: string, value: number): void {
    if (!this.enabledState) {
      return;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_.:-]{0,80}$/.test(counterId)) {
      throw new SimulationValidationError(`Invalid performance counter id: ${counterId}`);
    }
    if (!Number.isFinite(value) || value < 0) {
      throw new SimulationValidationError(`Performance counter ${counterId} must be a nonnegative finite number`);
    }
    this.counters.set(counterId, (this.counters.get(counterId) ?? 0) + value);
  }

  recordTick(sample: Omit<TickPerformanceSample, "counters">): void {
    if (!this.enabledState) {
      this.counters.clear();
      return;
    }
    this.tickSamples.push({
      ...sample,
      counters: Object.fromEntries([...this.counters.entries()].sort(([left], [right]) => left.localeCompare(right)))
    });
    this.counters.clear();
    trim(this.tickSamples, this.maxSamplesValue);
  }

  recordSnapshot(sample: SnapshotPerformanceSample): void {
    if (!this.enabledState) {
      return;
    }
    this.snapshotSamples.push({ ...sample });
    trim(this.snapshotSamples, this.maxSamplesValue);
  }

  recordFrame(sample: FramePerformanceSample): void {
    if (!this.enabledState) {
      return;
    }
    this.frameSamples.push({ ...sample });
    trim(this.frameSamples, this.maxSamplesValue);
  }

  snapshot(): SimulationPerformanceSnapshot {
    return {
      enabled: this.enabledState,
      maxSamples: this.maxSamplesValue,
      tickSamples: this.tickSamples.map((sample) => ({ ...sample, counters: { ...sample.counters } })),
      snapshotSamples: this.snapshotSamples.map((sample) => ({ ...sample })),
      frameSamples: this.frameSamples.map((sample) => ({ ...sample })),
      measures: this.measureSummaries()
    };
  }

  private trimAll(): void {
    trim(this.tickSamples, this.maxSamplesValue);
    trim(this.snapshotSamples, this.maxSamplesValue);
    trim(this.frameSamples, this.maxSamplesValue);
  }
}

export class BoundedPerformanceRecorder {
  private enabledState: boolean;
  private maxSamplesValue: number;
  private readonly samples = new Map<PerformanceMeasureName, number[]>();

  constructor(options: { enabled?: boolean; maxSamples?: number } = {}) {
    this.enabledState = options.enabled ?? false;
    this.maxSamplesValue = normalizeMaxSamples(options.maxSamples ?? defaultMaxSamples);
  }

  get enabled(): boolean {
    return this.enabledState;
  }

  setEnabled(enabled: boolean): void {
    this.enabledState = enabled;
  }

  setMaxSamples(maxSamples: number): void {
    this.maxSamplesValue = normalizeMaxSamples(maxSamples);
    for (const values of this.samples.values()) {
      trim(values, this.maxSamplesValue);
    }
  }

  clear(): void {
    this.samples.clear();
  }

  record(name: PerformanceMeasureName, durationMs: number): void {
    if (!this.enabledState) {
      return;
    }
    if (!performanceMeasureNames.includes(name)) {
      throw new SimulationValidationError(`Unknown performance measure: ${name}`);
    }
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new SimulationValidationError(`Performance measure ${name} must be a nonnegative finite duration`);
    }
    const values = this.samples.get(name) ?? [];
    values.push(durationMs);
    trim(values, this.maxSamplesValue);
    this.samples.set(name, values);
  }

  summaries(): readonly PerformanceMeasureSummary[] {
    return performanceMeasureNames.flatMap((name) => {
      const values = this.samples.get(name);
      if (!values || values.length === 0) {
        return [];
      }
      const sorted = [...values].sort((left, right) => left - right);
      return [{
        name,
        count: sorted.length,
        medianMs: percentile(sorted, 0.5),
        p95Ms: percentile(sorted, 0.95),
        maxMs: sorted.at(-1) ?? 0,
        totalMs: sorted.reduce((sum, value) => sum + value, 0)
      }];
    });
  }
}

function defaultNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function normalizeMaxSamples(value: number): number {
  if (!Number.isInteger(value) || value <= 0 || value > 5000) {
    throw new SimulationValidationError("Performance maxSamples must be an integer from 1 to 5000");
  }
  return value;
}

function trim<T>(records: T[], maxSamples: number): void {
  while (records.length > maxSamples) {
    records.shift();
  }
}

function percentile(sorted: readonly number[], fraction: number): number {
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return sorted[index] ?? 0;
}
