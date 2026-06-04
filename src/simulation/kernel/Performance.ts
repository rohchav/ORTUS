import { SimulationValidationError } from "./Errors";

export interface PerformanceInstrumentationOptions {
  enabled?: boolean;
  maxSamples?: number;
  now?: () => number;
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

  constructor(options: boolean | PerformanceInstrumentationOptions | undefined = false) {
    const normalized = typeof options === "boolean" ? { enabled: options } : (options ?? {});
    this.enabledState = normalized.enabled ?? false;
    this.maxSamplesValue = normalizeMaxSamples(normalized.maxSamples ?? defaultMaxSamples);
    this.nowFn = normalized.now ?? defaultNow;
  }

  get enabled(): boolean {
    return this.enabledState;
  }

  get maxSamples(): number {
    return this.maxSamplesValue;
  }

  enable(options: PerformanceInstrumentationOptions = {}): void {
    this.enabledState = options.enabled ?? true;
    if (options.maxSamples !== undefined) {
      this.maxSamplesValue = normalizeMaxSamples(options.maxSamples);
      this.trimAll();
    }
  }

  disable(): void {
    this.enabledState = false;
  }

  clear(): void {
    this.tickSamples.length = 0;
    this.snapshotSamples.length = 0;
    this.frameSamples.length = 0;
    this.counters.clear();
  }

  mark(): number {
    return this.enabledState ? this.nowFn() : 0;
  }

  elapsedSince(mark: number): number {
    return this.enabledState ? Math.max(0, this.nowFn() - mark) : 0;
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
      frameSamples: this.frameSamples.map((sample) => ({ ...sample }))
    };
  }

  private trimAll(): void {
    trim(this.tickSamples, this.maxSamplesValue);
    trim(this.snapshotSamples, this.maxSamplesValue);
    trim(this.frameSamples, this.maxSamplesValue);
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
