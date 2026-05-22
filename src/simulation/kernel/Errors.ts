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
