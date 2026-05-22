import {
  feedbackEventMetricsArtifactType,
  type DelayQueueItem,
  type EventApplicationResult,
  type FeedbackApplicationResult,
  type FeedbackEventMetrics,
  type FeedbackEventMetricsResult,
  type FeedbackLoopDefinition,
  type ScheduledEvent
} from "./types";
import { computeDelayMetrics } from "./delays";
import { compareDelayItems } from "./validation";
import { validateDelayQueue, validateEventApplicationResult, validateFeedbackApplicationResult, validateFeedbackLoops, validateScheduledEventQueue } from "./validation";

export interface FeedbackEventMetricsInput {
  scheduledEvents?: readonly ScheduledEvent[];
  releasedEvents?: readonly ScheduledEvent[];
  delayQueue?: readonly DelayQueueItem[];
  releasedDelayItems?: readonly DelayQueueItem[];
  feedbackLoops?: readonly FeedbackLoopDefinition[];
  eventLedger?: readonly EventApplicationResult[];
  feedbackLedger?: readonly FeedbackApplicationResult[];
}

export function computeFeedbackEventMetrics(input: FeedbackEventMetricsInput = {}): FeedbackEventMetricsResult {
  const scheduledEvents = validateScheduledEventQueue(input.scheduledEvents ?? []);
  const releasedEvents = validateScheduledEventQueue(input.releasedEvents ?? []);
  const delayQueue = validateDelayQueue(input.delayQueue ?? []);
  const releasedDelayItems = validateDelayQueue(input.releasedDelayItems ?? []);
  const feedbackLoops = validateFeedbackLoops(input.feedbackLoops ?? []);
  const eventLedger = (input.eventLedger ?? []).map(validateEventApplicationResult);
  const feedbackLedger = (input.feedbackLedger ?? []).map(validateFeedbackApplicationResult);
  const allDelayItems = delayQueue.concat(releasedDelayItems).sort(compareDelayItems);
  const delayMetrics = computeDelayMetrics(allDelayItems);

  const eventsByType: Record<string, number> = {};
  for (const event of scheduledEvents.concat(releasedEvents)) {
    eventsByType[event.eventType] = (eventsByType[event.eventType] ?? 0) + 1;
  }
  const feedbackAdjustmentsByTarget: Record<string, number> = {};
  let clampedFeedbackCount = 0;
  for (const result of feedbackLedger) {
    feedbackAdjustmentsByTarget[result.target] = finite((feedbackAdjustmentsByTarget[result.target] ?? 0) + result.appliedAdjustment);
    if (result.appliedAdjustment !== result.requestedAdjustment) {
      clampedFeedbackCount += 1;
    }
  }

  const metrics: FeedbackEventMetrics = {
    scheduledEventCount: scheduledEvents.length,
    releasedEventCount: releasedEvents.length,
    delayQueueSize: delayQueue.length,
    releasedDelayItemCount: releasedDelayItems.length,
    feedbackLoopCount: feedbackLoops.length,
    enabledFeedbackLoopCount: feedbackLoops.filter((loop) => loop.enabled).length,
    reinforcingLoopCount: feedbackLoops.filter((loop) => loop.loopType === "reinforcing").length,
    balancingLoopCount: feedbackLoops.filter((loop) => loop.loopType === "balancing").length,
    unknownLoopCount: feedbackLoops.filter((loop) => loop.loopType === "unknown").length,
    averageDelayTicks: delayMetrics.averageDelayTicks,
    maxDelayTicks: delayMetrics.maxDelayTicks,
    eventLedgerCount: eventLedger.length,
    feedbackLedgerCount: feedbackLedger.length,
    eventsByType,
    delaysByType: delayMetrics.delaysByType,
    feedbackAdjustmentsByTarget,
    clampedFeedbackCount
  };
  return {
    schemaVersion: "1",
    artifactType: feedbackEventMetricsArtifactType,
    metrics,
    warnings: []
  };
}

function finite(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Feedback/event metrics must be finite");
  }
  return value;
}
