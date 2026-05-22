import type { BufferedCommand, SimulationEvent } from "./types";
import { deepClone } from "./Validation";

export interface DebugStepLog {
  tick: number;
  phase: string;
  systemId: string;
  commandCount: number;
}

export class SimulationRuntime {
  dueEvents: SimulationEvent[] = [];
  readonly systemExecutionLog: DebugStepLog[] = [];
  readonly lastEvents: SimulationEvent[] = [];
  readonly lastCommands: BufferedCommand[] = [];

  constructor(private readonly maxDebugRecords = 200) {}

  setDueEvents(events: readonly SimulationEvent[]): void {
    this.dueEvents = events.map((event) => deepClone(event));
    for (const event of events) {
      this.lastEvents.push(deepClone(event));
      this.trim(this.lastEvents);
    }
  }

  due(type?: string): readonly SimulationEvent[] {
    const events = type ? this.dueEvents.filter((event) => event.type === type) : this.dueEvents;
    return events.map((event) => deepClone(event));
  }

  recordSystem(tick: number, phase: string, systemId: string, commandCount: number): void {
    this.systemExecutionLog.push({ tick, phase, systemId, commandCount });
    this.trim(this.systemExecutionLog);
  }

  recordCommands(commands: readonly BufferedCommand[]): void {
    for (const command of commands) {
      this.lastCommands.push(deepClone(command));
      this.trim(this.lastCommands);
    }
  }

  resetStep(): void {
    this.dueEvents = [];
  }

  resetAll(): void {
    this.dueEvents = [];
    this.systemExecutionLog.length = 0;
    this.lastEvents.length = 0;
    this.lastCommands.length = 0;
  }

  private trim<T>(records: T[]): void {
    while (records.length > this.maxDebugRecords) {
      records.shift();
    }
  }
}
