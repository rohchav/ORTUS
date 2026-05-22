import type { EventQueueSnapshot, SimulationEvent, SchedulableEvent } from "./types";
import { SimulationValidationError } from "./Errors";
import { deepClone, validateEvent } from "./Validation";

export class EventQueue {
  private sequence = 0;
  private readonly events = new Map<string, SimulationEvent>();

  schedule(event: SchedulableEvent): SimulationEvent {
    const id = event.id ?? this.nextId();
    const scheduled: SimulationEvent = validateEvent({ ...event, id });
    if (this.events.has(scheduled.id)) {
      throw new SimulationValidationError(`Duplicate event id: ${scheduled.id}`);
    }
    this.events.set(scheduled.id, deepClone(scheduled));
    this.captureSequence(scheduled.id);
    return deepClone(scheduled);
  }

  cancel(eventId: string): boolean {
    return this.events.delete(eventId);
  }

  popDue(tick: number): SimulationEvent[] {
    if (!Number.isInteger(tick) || tick < 0) {
      throw new SimulationValidationError("Cannot pop events for invalid tick");
    }
    const due = this.ordered().filter((event) => event.scheduledTick <= tick);
    for (const event of due) {
      this.events.delete(event.id);
    }
    return due.map((event) => deepClone(event));
  }

  peekNext(): SimulationEvent | undefined {
    const [next] = this.ordered();
    return next ? deepClone(next) : undefined;
  }

  clear(): void {
    this.events.clear();
  }

  all(): SimulationEvent[] {
    return this.ordered().map((event) => deepClone(event));
  }

  serialize(): EventQueueSnapshot {
    return {
      sequence: this.sequence,
      events: this.all()
    };
  }

  clone(): EventQueue {
    return EventQueue.fromSnapshot(this.serialize());
  }

  static fromSnapshot(snapshot: EventQueueSnapshot): EventQueue {
    const queue = new EventQueue();
    queue.sequence = snapshot.sequence;
    for (const event of snapshot.events) {
      queue.schedule(event);
    }
    queue.sequence = Math.max(queue.sequence, snapshot.sequence);
    return queue;
  }

  private ordered(): SimulationEvent[] {
    return [...this.events.values()].sort(compareEvents);
  }

  private nextId(): string {
    this.sequence += 1;
    return `event-${this.sequence.toString().padStart(6, "0")}`;
  }

  private captureSequence(id: string): void {
    const match = /^event-(\d+)$/.exec(id);
    if (match?.[1]) {
      this.sequence = Math.max(this.sequence, Number.parseInt(match[1], 10));
    }
  }
}

export function compareEvents(left: SimulationEvent, right: SimulationEvent): number {
  return (
    left.scheduledTick - right.scheduledTick ||
    (left.priority ?? 0) - (right.priority ?? 0) ||
    left.createdAtTick - right.createdAtTick ||
    left.id.localeCompare(right.id)
  );
}
