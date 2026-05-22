import { SimulationValidationError } from "../kernel/Errors";
import { maxFeedbackTick, type DelayQueueItem, type FeedbackLoopDefinition, type FeedbackLoopType, type ScheduledEvent } from "./types";
import { compareDelayItems, compareScheduledEvents, validateDelayQueue, validateFeedbackLoops, validateScheduledEventQueue } from "./validation";

export function getScheduledEventsForTick(queue: readonly ScheduledEvent[], tick: number): ScheduledEvent[] {
  assertValidTick(tick, "Scheduled event query tick");
  return validateScheduledEventQueue(queue)
    .filter((event) => event.tick === tick)
    .sort(compareScheduledEvents);
}

export function getFutureEvents(queue: readonly ScheduledEvent[], tick: number): ScheduledEvent[] {
  assertValidTick(tick, "Future event query tick");
  return validateScheduledEventQueue(queue)
    .filter((event) => event.tick > tick)
    .sort(compareScheduledEvents);
}

export function getDelayItemsForReleaseTick(queue: readonly DelayQueueItem[], tick: number): DelayQueueItem[] {
  assertValidTick(tick, "Delay release query tick");
  return validateDelayQueue(queue)
    .filter((item) => item.releaseTick === tick)
    .sort(compareDelayItems);
}

export function getFeedbackLoop(loops: readonly FeedbackLoopDefinition[], loopId: string): FeedbackLoopDefinition {
  const loop = validateFeedbackLoops(loops).find((item) => item.id === loopId);
  if (!loop) {
    throw new SimulationValidationError(`Unknown feedback loop: ${loopId}`);
  }
  return { ...loop, metadata: loop.metadata ? { ...loop.metadata } : {} };
}

export function getEnabledFeedbackLoops(loops: readonly FeedbackLoopDefinition[]): FeedbackLoopDefinition[] {
  return validateFeedbackLoops(loops).filter((loop) => loop.enabled);
}

export function getFeedbackLoopsByType(loops: readonly FeedbackLoopDefinition[], loopType: FeedbackLoopType): FeedbackLoopDefinition[] {
  return validateFeedbackLoops(loops).filter((loop) => loop.loopType === loopType);
}

export function hasScheduledEvent(queue: readonly ScheduledEvent[], eventId: string): boolean {
  return validateScheduledEventQueue(queue).some((event) => event.id === eventId);
}

export function hasFeedbackLoop(loops: readonly FeedbackLoopDefinition[], loopId: string): boolean {
  return validateFeedbackLoops(loops).some((loop) => loop.id === loopId);
}

function assertValidTick(tick: number, label: string): void {
  if (!Number.isInteger(tick) || tick < 0 || tick > maxFeedbackTick) {
    throw new SimulationValidationError(`${label} must be a finite non-negative integer within bounds`);
  }
}
