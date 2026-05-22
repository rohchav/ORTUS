import { SimulationSerializationError } from "../kernel/Errors";
import {
  delayQueueArtifactType,
  eventScheduleArtifactType,
  feedbackEventMetricsArtifactType,
  feedbackLoopsArtifactType,
  maxFeedbackJsonLength,
  type DelayQueueArtifact,
  type EventScheduleArtifact,
  type FeedbackEventMetricsResult,
  type FeedbackLoopsArtifact
} from "./types";
import {
  assertPlainFeedbackJson,
  parseFeedbackJson,
  validateDelayQueueArtifact,
  validateEventScheduleArtifact,
  validateFeedbackLoopsArtifact
} from "./validation";

export function serializeEventSchedule(artifact: EventScheduleArtifact): string {
  return JSON.stringify(validateEventScheduleArtifact(artifact), null, 2);
}

export function deserializeEventSchedule(json: string | unknown): EventScheduleArtifact {
  const raw = typeof json === "string" ? parseFeedbackJson(json, "Event schedule") : json;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid event schedule artifact");
  }
  if ((raw as { artifactType?: unknown }).artifactType !== eventScheduleArtifactType) {
    throw new SimulationSerializationError("Invalid event schedule artifact type");
  }
  try {
    return validateEventScheduleArtifact(raw);
  } catch (error) {
    throw new SimulationSerializationError(error instanceof Error ? error.message : "Invalid event schedule", { cause: error });
  }
}

export function serializeDelayQueue(artifact: DelayQueueArtifact): string {
  return JSON.stringify(validateDelayQueueArtifact(artifact), null, 2);
}

export function deserializeDelayQueue(json: string | unknown): DelayQueueArtifact {
  const raw = typeof json === "string" ? parseFeedbackJson(json, "Delay queue") : json;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid delay queue artifact");
  }
  if ((raw as { artifactType?: unknown }).artifactType !== delayQueueArtifactType) {
    throw new SimulationSerializationError("Invalid delay queue artifact type");
  }
  try {
    return validateDelayQueueArtifact(raw);
  } catch (error) {
    throw new SimulationSerializationError(error instanceof Error ? error.message : "Invalid delay queue", { cause: error });
  }
}

export function serializeFeedbackLoops(artifact: FeedbackLoopsArtifact): string {
  return JSON.stringify(validateFeedbackLoopsArtifact(artifact), null, 2);
}

export function deserializeFeedbackLoops(json: string | unknown): FeedbackLoopsArtifact {
  const raw = typeof json === "string" ? parseFeedbackJson(json, "Feedback loops") : json;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid feedback loops artifact");
  }
  if ((raw as { artifactType?: unknown }).artifactType !== feedbackLoopsArtifactType) {
    throw new SimulationSerializationError("Invalid feedback loops artifact type");
  }
  try {
    return validateFeedbackLoopsArtifact(raw);
  } catch (error) {
    throw new SimulationSerializationError(error instanceof Error ? error.message : "Invalid feedback loops", { cause: error });
  }
}

export function serializeFeedbackEventMetrics(result: FeedbackEventMetricsResult): string {
  validateFeedbackEventMetricsResult(result);
  return JSON.stringify(result, null, 2);
}

export function deserializeFeedbackEventMetrics(json: string | unknown): FeedbackEventMetricsResult {
  const raw = typeof json === "string" ? parseFeedbackJson(json, "Feedback/event metrics") : json;
  validateFeedbackEventMetricsResult(raw);
  return raw as FeedbackEventMetricsResult;
}

const allowedMetricsTopLevelKeys = new Set(["schemaVersion", "artifactType", "metrics", "warnings"]);
const allowedMetricsKeys = new Set([
  "scheduledEventCount",
  "releasedEventCount",
  "delayQueueSize",
  "releasedDelayItemCount",
  "feedbackLoopCount",
  "enabledFeedbackLoopCount",
  "reinforcingLoopCount",
  "balancingLoopCount",
  "unknownLoopCount",
  "averageDelayTicks",
  "maxDelayTicks",
  "eventLedgerCount",
  "feedbackLedgerCount",
  "eventsByType",
  "delaysByType",
  "feedbackAdjustmentsByTarget",
  "clampedFeedbackCount"
]);

function validateFeedbackEventMetricsResult(value: unknown): void {
  assertPlainFeedbackJson(value, "Feedback/event metrics");
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SimulationSerializationError("Invalid feedback/event metrics artifact");
  }
  if (JSON.stringify(value).length > maxFeedbackJsonLength) {
    throw new SimulationSerializationError(`Feedback/event metrics JSON must be ${maxFeedbackJsonLength} characters or less`);
  }
  const raw = value as Partial<FeedbackEventMetricsResult> & Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (!allowedMetricsTopLevelKeys.has(key)) {
      throw new SimulationSerializationError(`Invalid feedback/event metrics field: ${key}`);
    }
  }
  if (raw.schemaVersion !== "1" || raw.artifactType !== feedbackEventMetricsArtifactType) {
    throw new SimulationSerializationError("Invalid feedback/event metrics artifact type");
  }
  if (!raw.metrics || typeof raw.metrics !== "object" || Array.isArray(raw.metrics) || !Array.isArray(raw.warnings)) {
    throw new SimulationSerializationError("Invalid feedback/event metrics payload");
  }
  for (const warning of raw.warnings) {
    if (typeof warning !== "string" || warning.length > 240) {
      throw new SimulationSerializationError("Invalid feedback/event metrics warning");
    }
  }
  const metrics = raw.metrics as unknown as Record<string, unknown>;
  for (const key of Object.keys(metrics)) {
    if (!allowedMetricsKeys.has(key)) {
      throw new SimulationSerializationError(`Invalid feedback/event metric: ${key}`);
    }
  }
  for (const key of allowedMetricsKeys) {
    if (!(key in metrics)) {
      throw new SimulationSerializationError(`Missing feedback/event metric: ${key}`);
    }
  }
  for (const key of allowedMetricsKeys) {
    const metric = metrics[key];
    if (key === "eventsByType" || key === "delaysByType" || key === "feedbackAdjustmentsByTarget") {
      assertFiniteMetricMap(metric, key);
    } else if (typeof metric !== "number" || !Number.isFinite(metric)) {
      throw new SimulationSerializationError("Feedback/event metrics must be finite");
    }
  }
}

function assertFiniteMetricMap(value: unknown, label: string): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SimulationSerializationError(`Invalid feedback/event metric map: ${label}`);
  }
  for (const metric of Object.values(value)) {
    if (typeof metric !== "number" || !Number.isFinite(metric)) {
      throw new SimulationSerializationError("Feedback/event metrics must be finite");
    }
  }
}
