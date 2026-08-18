import { SimulationValidationError } from "../kernel/Errors";

export interface RuntimeSchedulerOptions {
  targetTicksPerSecond?: number;
  maximumElapsedContributionMs?: number;
  now?: () => number;
  setTimer?: (callback: () => void, delayMs: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

export class RuntimeAccumulatorScheduler {
  private readonly targetTicksPerSecond: number;
  private readonly maximumElapsedContributionMs: number;
  private readonly now: () => number;
  private readonly setTimer: (callback: () => void, delayMs: number) => unknown;
  private readonly clearTimer: (handle: unknown) => void;
  private timer: unknown;
  private running = false;
  private lastCycleAt: number | null = null;
  private accumulatedMs = 0;

  constructor(
    private readonly callbacks: {
      advance(steps: number): void;
      maxStepsPerCycle(): number;
      speedMultiplier(): number;
      onError(error: unknown): void;
    },
    options: RuntimeSchedulerOptions = {}
  ) {
    this.targetTicksPerSecond = options.targetTicksPerSecond ?? 24;
    this.maximumElapsedContributionMs = options.maximumElapsedContributionMs ?? 250;
    this.now = options.now ?? readNow;
    this.setTimer = options.setTimer ?? ((callback, delayMs) => setTimeout(callback, delayMs));
    this.clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
    if (!Number.isFinite(this.targetTicksPerSecond) || this.targetTicksPerSecond <= 0) {
      throw new SimulationValidationError("Runtime scheduler target rate must be positive and finite");
    }
    if (!Number.isFinite(this.maximumElapsedContributionMs) || this.maximumElapsedContributionMs <= 0) {
      throw new SimulationValidationError("Runtime scheduler maximum elapsed contribution must be positive and finite");
    }
  }

  play(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastCycleAt = null;
    this.accumulatedMs = 0;
    this.schedule(16);
  }

  pause(): void {
    this.running = false;
    if (this.timer !== undefined) {
      this.clearTimer(this.timer);
      this.timer = undefined;
    }
    this.lastCycleAt = null;
    this.accumulatedMs = 0;
  }

  dispose(): void {
    this.pause();
  }

  private cycle(): void {
    this.timer = undefined;
    if (!this.running) {
      return;
    }
    try {
      const at = this.now();
      const previous = this.lastCycleAt ?? at;
      this.lastCycleAt = at;
      this.accumulatedMs += Math.min(this.maximumElapsedContributionMs, Math.max(0, at - previous));
      const speed = this.callbacks.speedMultiplier();
      if (!Number.isFinite(speed) || speed < 0) {
        throw new SimulationValidationError("Runtime scheduler speed multiplier must be nonnegative and finite");
      }
      if (speed > 0) {
        const intervalMs = 1000 / (this.targetTicksPerSecond * speed);
        const requestedSteps = Math.floor(this.accumulatedMs / intervalMs);
        const maxSteps = this.callbacks.maxStepsPerCycle();
        if (!Number.isInteger(maxSteps) || maxSteps <= 0) {
          throw new SimulationValidationError("Runtime scheduler max steps per cycle must be a positive integer");
        }
        const steps = Math.min(requestedSteps, maxSteps);
        if (steps > 0) {
          this.accumulatedMs -= steps * intervalMs;
          this.callbacks.advance(steps);
        }
      }
    } catch (error) {
      this.running = false;
      this.callbacks.onError(error);
      return;
    }
    this.schedule(16);
  }

  private schedule(delayMs: number): void {
    if (!this.running || this.timer !== undefined) {
      return;
    }
    this.timer = this.setTimer(() => this.cycle(), delayMs);
  }
}

function readNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}
