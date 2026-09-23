import type { Command, SchedulerPhase } from "./types";

export interface SimulationErrorDetails {
  tick?: number;
  phase?: SchedulerPhase;
  systemId?: string;
  entityId?: string;
  command?: Command;
  cause?: unknown;
}

export class SimulationError extends Error {
  readonly tick?: number;
  readonly phase?: SchedulerPhase;
  readonly systemId?: string;
  readonly entityId?: string;
  readonly command?: Command;
  override readonly cause?: unknown;

  constructor(message: string, details: SimulationErrorDetails = {}) {
    super(message);
    this.name = "SimulationError";
    this.tick = details.tick;
    this.phase = details.phase;
    this.systemId = details.systemId;
    this.entityId = details.entityId;
    this.command = details.command;
    this.cause = details.cause;
  }
}

export class SimulationValidationError extends SimulationError {
  constructor(message: string, details: SimulationErrorDetails = {}) {
    super(message, details);
    this.name = "SimulationValidationError";
  }
}

export class SimulationInvariantError extends SimulationError {
  constructor(message: string, details: SimulationErrorDetails = {}) {
    super(message, details);
    this.name = "SimulationInvariantError";
  }
}

export class SimulationTemplateError extends SimulationError {
  constructor(message: string, details: SimulationErrorDetails = {}) {
    super(message, details);
    this.name = "SimulationTemplateError";
  }
}

export class SimulationSerializationError extends SimulationError {
  constructor(message: string, details: SimulationErrorDetails = {}) {
    super(message, details);
    this.name = "SimulationSerializationError";
  }
}

export interface SimulationFailure {
  readonly operation: "step" | "applyCommands";
  readonly tick: number;
  readonly error: unknown;
}

// Thrown when an operation is attempted on an engine whose run has failed. The original failure
// is the cause; only reset, restoreSnapshot, or importScenario can leave the failed state.
export class SimulationEngineFailedError extends SimulationError {
  constructor(attempted: string, failure: SimulationFailure) {
    const reason = failure.error instanceof Error ? failure.error.message : String(failure.error);
    super(
      `Cannot ${attempted}: the run failed at tick ${failure.tick} during ${failure.operation} (${reason}). Reset or rebuild the run to continue.`,
      { tick: failure.tick, cause: failure.error }
    );
    this.name = "SimulationEngineFailedError";
  }
}
