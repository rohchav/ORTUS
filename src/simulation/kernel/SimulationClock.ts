import { SimulationValidationError } from "./Errors";

export class SimulationClock {
  tick = 0;
  time = 0;
  fixedDt: number;
  speedMultiplier: number;
  maxStepsPerFrame: number;
  running = false;

  constructor(options: { fixedDt?: number; speedMultiplier?: number; maxStepsPerFrame?: number } = {}) {
    this.fixedDt = options.fixedDt ?? 1;
    this.speedMultiplier = options.speedMultiplier ?? 1;
    this.maxStepsPerFrame = options.maxStepsPerFrame ?? 5;
    this.validate();
  }

  advanceOne(): void {
    this.tick += 1;
    this.time = this.tick * this.fixedDt;
  }

  reset(): void {
    this.tick = 0;
    this.time = 0;
    this.running = false;
  }

  pause(): void {
    this.running = false;
  }

  play(): void {
    this.running = true;
  }

  setSpeed(multiplier: number): void {
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      throw new SimulationValidationError("Speed multiplier must be a nonnegative finite number");
    }
    this.speedMultiplier = multiplier;
  }

  restore(tick: number, time: number): void {
    if (!Number.isInteger(tick) || tick < 0 || !Number.isFinite(time) || time < 0) {
      throw new SimulationValidationError("Invalid clock restore state");
    }
    this.tick = tick;
    this.time = time;
  }

  private validate(): void {
    if (!Number.isFinite(this.fixedDt) || this.fixedDt <= 0) {
      throw new SimulationValidationError("fixedDt must be a positive finite number");
    }
    if (!Number.isFinite(this.speedMultiplier) || this.speedMultiplier < 0) {
      throw new SimulationValidationError("speedMultiplier must be a nonnegative finite number");
    }
    if (!Number.isInteger(this.maxStepsPerFrame) || this.maxStepsPerFrame <= 0) {
      throw new SimulationValidationError("maxStepsPerFrame must be a positive integer");
    }
  }
}
