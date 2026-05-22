import { SimulationValidationError } from "../kernel/Errors";
import { maxFeedbackTick, maxScheduledEventCount, type EventApplicationResult, type ScheduledEvent } from "./types";
import { compareScheduledEvents, validateEventApplicationResult, validateScheduledEvent, validateScheduledEventQueue } from "./validation";

export interface ReleaseEventsResult {
  queue: readonly ScheduledEvent[];
  released: readonly ScheduledEvent[];
  results: readonly EventApplicationResult[];
}

export function scheduleEvent(queue: readonly ScheduledEvent[], event: ScheduledEvent): ScheduledEvent[] {
  const next = validateScheduledEventQueue([...queue, validateScheduledEvent(event)]);
  if (next.length > maxScheduledEventCount) {
    throw new SimulationValidationError(`Scheduled event queue must contain ${maxScheduledEventCount} events or fewer`);
  }
  return next;
}

export function releaseEventsForTick(queue: readonly ScheduledEvent[], tick: number): ReleaseEventsResult {
  assertValidTick(tick, "Release tick");
  const valid = validateScheduledEventQueue(queue);
  const released = valid.filter((event) => event.tick <= tick).sort(compareScheduledEvents);
  const releasedIds = new Set(released.map((event) => event.id));
  const remaining = valid.filter((event) => !releasedIds.has(event.id)).sort(compareScheduledEvents);
  return {
    queue: remaining,
    released,
    results: released.map((event) => applyEventResult(event, true))
  };
}

export function applyEventResult(event: ScheduledEvent, applied: boolean, reason?: string, warnings: readonly string[] = []): EventApplicationResult {
  const valid = validateScheduledEvent(event);
  return validateEventApplicationResult({
    eventId: valid.id,
    tick: valid.tick,
    applied,
    ...(reason ? { reason } : {}),
    warnings,
    ...(valid.payload !== undefined ? { payloadSummary: summarizePayload(valid.payload) } : {})
  });
}

export function sortScheduledEvents(events: readonly ScheduledEvent[]): ScheduledEvent[] {
  return validateScheduledEventQueue(events);
}

function assertValidTick(tick: number, label: string): void {
  if (!Number.isInteger(tick) || tick < 0 || tick > maxFeedbackTick) {
    throw new SimulationValidationError(`${label} must be a finite non-negative integer within bounds`);
  }
}

function summarizePayload(payload: unknown): string {
  const json = JSON.stringify(payload);
  return json.length <= 120 ? json : `${json.slice(0, 117)}...`;
}
