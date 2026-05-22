import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import {
  delayQueueArtifactType,
  eventScheduleArtifactType,
  feedbackLoopsArtifactType,
  maxDelayQueueItemCount,
  maxDelayTicks,
  maxFeedbackJsonLength,
  maxFeedbackLedgerLength,
  maxFeedbackLoopCount,
  maxFeedbackPayloadJsonLength,
  maxFeedbackTick,
  maxScheduledEventCount,
  type DelayDefinition,
  type DelayQueueArtifact,
  type DelayQueueItem,
  type EventApplicationResult,
  type EventDefinition,
  type EventScheduleArtifact,
  type FeedbackApplicationResult,
  type FeedbackEventSystemState,
  type FeedbackLoopDefinition,
  type FeedbackLoopsArtifact,
  type FeedbackSignal,
  type ScheduledEvent
} from "./types";

const targetTypeSchema = z.enum(["system", "agent", "group", "region", "environment", "resource", "stock", "network", "metadata"]);
const tickSchema = z.number().int().min(0).max(maxFeedbackTick);

const eventDefinitionSchema = z
  .object({
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1_200).optional(),
    eventType: z.string().min(1).max(160),
    targetType: targetTypeSchema.optional(),
    targetId: z.string().min(1).max(160).optional(),
    payload: jsonValueSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const scheduledEventSchema = z
  .object({
    id: z.string().min(1).max(160),
    eventDefinitionId: z.string().min(1).max(160).optional(),
    label: z.string().min(1).max(180).optional(),
    tick: tickSchema,
    priority: z.number().int().min(-1_000).max(1_000).optional(),
    eventType: z.string().min(1).max(160),
    targetType: targetTypeSchema.optional(),
    targetId: z.string().min(1).max(160).optional(),
    payload: jsonValueSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const eventApplicationResultSchema = z
  .object({
    eventId: z.string().min(1).max(160),
    tick: tickSchema,
    applied: z.boolean(),
    reason: z.string().max(240).optional(),
    warnings: z.array(z.string().max(240)).optional(),
    payloadSummary: z.string().max(240).optional()
  })
  .strict();

const delayDefinitionSchema = z
  .object({
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1_200).optional(),
    delayType: z.string().min(1).max(160),
    delayTicks: z.number().int().min(0).max(maxDelayTicks),
    sourceType: targetTypeSchema.optional(),
    targetType: targetTypeSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const delayQueueItemSchema = z
  .object({
    id: z.string().min(1).max(180),
    delayDefinitionId: z.string().min(1).max(160).optional(),
    scheduledAtTick: tickSchema,
    releaseTick: tickSchema,
    payload: jsonValueSchema,
    targetType: targetTypeSchema.optional(),
    targetId: z.string().min(1).max(160).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const feedbackLoopSchema = z
  .object({
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1_200).optional(),
    loopType: z.enum(["reinforcing", "balancing", "unknown"]),
    signalSource: z.string().min(1).max(180),
    target: z.string().min(1).max(180),
    gain: z.number().finite(),
    clamp: z
      .object({
        min: z.number().finite().optional(),
        max: z.number().finite().optional()
      })
      .strict()
      .optional(),
    enabled: z.boolean().optional(),
    delayTicks: z.number().int().min(0).max(maxDelayTicks).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const feedbackResultSchema = z
  .object({
    loopId: z.string().min(1).max(160),
    tick: tickSchema,
    signalValue: z.number().finite(),
    requestedAdjustment: z.number().finite(),
    appliedAdjustment: z.number().finite(),
    target: z.string().min(1).max(180),
    warnings: z.array(z.string().max(240)).optional()
  })
  .strict();

const feedbackSignalSchema = z
  .object({
    loopId: z.string().min(1).max(160),
    tick: tickSchema,
    value: z.number().finite(),
    source: z.string().min(1).max(180),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const feedbackEventSystemStateSchema = z
  .object({
    scheduledEvents: z.array(scheduledEventSchema).max(maxScheduledEventCount),
    delayQueue: z.array(delayQueueItemSchema).max(maxDelayQueueItemCount),
    feedbackLoops: z.array(feedbackLoopSchema).max(maxFeedbackLoopCount),
    eventLedger: z.array(eventApplicationResultSchema).max(maxFeedbackLedgerLength).optional(),
    feedbackLedger: z.array(feedbackResultSchema).max(maxFeedbackLedgerLength).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const eventScheduleArtifactSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(eventScheduleArtifactType),
    scheduledEvents: z.array(scheduledEventSchema).max(maxScheduledEventCount),
    eventLedger: z.array(eventApplicationResultSchema).max(maxFeedbackLedgerLength).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const delayQueueArtifactSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(delayQueueArtifactType),
    delayQueue: z.array(delayQueueItemSchema).max(maxDelayQueueItemCount),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const feedbackLoopsArtifactSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(feedbackLoopsArtifactType),
    feedbackLoops: z.array(feedbackLoopSchema).max(maxFeedbackLoopCount),
    feedbackLedger: z.array(feedbackResultSchema).max(maxFeedbackLedgerLength).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenFeedbackKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "template",
  "activeEngine",
  "runState",
  "runSummary",
  "runSummaries"
]);

export function validateEventDefinition(value: unknown): EventDefinition {
  const definition = parseWithSchema(value, eventDefinitionSchema, "Event definition");
  assertPayloadBound(definition.payload, "Event definition payload");
  assertPayloadBound(definition.metadata, "Event definition metadata");
  return { ...definition, metadata: definition.metadata ?? {} };
}

export function validateScheduledEvent(value: unknown): ScheduledEvent {
  const event = parseWithSchema(value, scheduledEventSchema, "Scheduled event");
  assertPayloadBound(event.payload, "Scheduled event payload");
  assertPayloadBound(event.metadata, "Scheduled event metadata");
  return { ...event, priority: event.priority ?? 0, metadata: event.metadata ?? {} };
}

export function validateEventApplicationResult(value: unknown): EventApplicationResult {
  return parseWithSchema(value, eventApplicationResultSchema, "Event application result");
}

export function validateDelayDefinition(value: unknown): DelayDefinition {
  const definition = parseWithSchema(value, delayDefinitionSchema, "Delay definition");
  assertPayloadBound(definition.metadata, "Delay definition metadata");
  return { ...definition, metadata: definition.metadata ?? {} };
}

export function validateDelayQueueItem(value: unknown): DelayQueueItem {
  const item = parseWithSchema(value, delayQueueItemSchema, "Delay queue item");
  if (item.releaseTick < item.scheduledAtTick) {
    throw new SimulationValidationError(`Delay releaseTick must be >= scheduledAtTick: ${item.id}`);
  }
  assertPayloadBound(item.payload, "Delay payload");
  assertPayloadBound(item.metadata, "Delay metadata");
  return { ...item, metadata: item.metadata ?? {} };
}

export function validateFeedbackLoopDefinition(value: unknown): FeedbackLoopDefinition {
  const loop = parseWithSchema(value, feedbackLoopSchema, "Feedback loop");
  if (loop.clamp?.min !== undefined && loop.clamp?.max !== undefined && loop.clamp.max < loop.clamp.min) {
    throw new SimulationValidationError(`Feedback clamp max must be >= min: ${loop.id}`);
  }
  assertPayloadBound(loop.metadata, "Feedback loop metadata");
  return { ...loop, enabled: loop.enabled ?? true, metadata: loop.metadata ?? {} };
}

export function validateFeedbackApplicationResult(value: unknown): FeedbackApplicationResult {
  return parseWithSchema(value, feedbackResultSchema, "Feedback application result");
}

export function validateFeedbackSignal(value: unknown): FeedbackSignal {
  const signal = parseWithSchema(value, feedbackSignalSchema, "Feedback signal");
  assertPayloadBound(signal.metadata, "Feedback signal metadata");
  return { ...signal, metadata: signal.metadata ?? {} };
}

export function validateFeedbackEventSystemState(value: unknown): FeedbackEventSystemState {
  const state = parseWithSchema(value, feedbackEventSystemStateSchema, "Feedback/event system state");
  assertJsonBound(state, maxFeedbackJsonLength, "Feedback/event system state");
  assertPayloadBound(state.metadata, "Feedback/event system state metadata");
  return {
    ...state,
    scheduledEvents: validateScheduledEventQueue(state.scheduledEvents),
    delayQueue: validateDelayQueue(state.delayQueue),
    feedbackLoops: validateFeedbackLoops(state.feedbackLoops),
    eventLedger: (state.eventLedger ?? []).map(validateEventApplicationResult),
    feedbackLedger: (state.feedbackLedger ?? []).map(validateFeedbackApplicationResult),
    metadata: state.metadata ?? {}
  };
}

export function validateEventScheduleArtifact(value: unknown): EventScheduleArtifact {
  const artifact = parseWithSchema(value, eventScheduleArtifactSchema, "Event schedule");
  assertJsonBound(artifact, maxFeedbackJsonLength, "Event schedule");
  assertUniqueIds(artifact.scheduledEvents, "scheduled event");
  return {
    ...artifact,
    scheduledEvents: artifact.scheduledEvents.map(validateScheduledEvent).sort(compareScheduledEvents),
    eventLedger: (artifact.eventLedger ?? []).map(validateEventApplicationResult),
    metadata: artifact.metadata ?? {}
  };
}

export function validateDelayQueueArtifact(value: unknown): DelayQueueArtifact {
  const artifact = parseWithSchema(value, delayQueueArtifactSchema, "Delay queue");
  assertJsonBound(artifact, maxFeedbackJsonLength, "Delay queue");
  assertUniqueIds(artifact.delayQueue, "delay queue item");
  return {
    ...artifact,
    delayQueue: artifact.delayQueue.map(validateDelayQueueItem).sort(compareDelayItems),
    metadata: artifact.metadata ?? {}
  };
}

export function validateFeedbackLoopsArtifact(value: unknown): FeedbackLoopsArtifact {
  const artifact = parseWithSchema(value, feedbackLoopsArtifactSchema, "Feedback loops");
  assertJsonBound(artifact, maxFeedbackJsonLength, "Feedback loops");
  assertUniqueIds(artifact.feedbackLoops, "feedback loop");
  return {
    ...artifact,
    feedbackLoops: artifact.feedbackLoops.map(validateFeedbackLoopDefinition).sort((left, right) => left.id.localeCompare(right.id)),
    feedbackLedger: (artifact.feedbackLedger ?? []).map(validateFeedbackApplicationResult),
    metadata: artifact.metadata ?? {}
  };
}

export function validateScheduledEventQueue(events: readonly ScheduledEvent[]): ScheduledEvent[] {
  const valid = events.map(validateScheduledEvent).sort(compareScheduledEvents);
  if (valid.length > maxScheduledEventCount) {
    throw new SimulationValidationError(`Scheduled event queue must contain ${maxScheduledEventCount} events or fewer`);
  }
  assertUniqueIds(valid, "scheduled event");
  return valid;
}

export function validateDelayQueue(queue: readonly DelayQueueItem[]): DelayQueueItem[] {
  const valid = queue.map(validateDelayQueueItem).sort(compareDelayItems);
  if (valid.length > maxDelayQueueItemCount) {
    throw new SimulationValidationError(`Delay queue must contain ${maxDelayQueueItemCount} items or fewer`);
  }
  assertUniqueIds(valid, "delay queue item");
  return valid;
}

export function validateFeedbackLoops(loops: readonly FeedbackLoopDefinition[]): FeedbackLoopDefinition[] {
  const valid = loops.map(validateFeedbackLoopDefinition).sort((left, right) => left.id.localeCompare(right.id));
  if (valid.length > maxFeedbackLoopCount) {
    throw new SimulationValidationError(`Feedback loop list must contain ${maxFeedbackLoopCount} loops or fewer`);
  }
  assertUniqueIds(valid, "feedback loop");
  return valid;
}

export function assertPlainFeedbackJson(value: unknown, label: string): void {
  const stack: Array<{ value: unknown; path: string }> = [{ value, path: label }];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const item = current.value;
    if (item === null || typeof item === "string" || typeof item === "boolean") {
      continue;
    }
    if (typeof item === "number") {
      if (!Number.isFinite(item)) {
        throw new SimulationValidationError(`${current.path} must not contain non-finite numbers`);
      }
      continue;
    }
    if (Array.isArray(item)) {
      item.forEach((child, index) => stack.push({ value: child, path: `${current.path}[${index}]` }));
      continue;
    }
    if (typeof item === "object" && item !== null) {
      const prototype = Object.getPrototypeOf(item);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new SimulationValidationError(`${current.path} must contain only plain JSON objects`);
      }
      for (const [key, child] of Object.entries(item as Record<string, unknown>)) {
        if (forbiddenFeedbackKeys.has(key)) {
          throw new SimulationValidationError(`${current.path} must not embed live run state (${key})`);
        }
        stack.push({ value: child, path: `${current.path}.${key}` });
      }
      continue;
    }
    throw new SimulationValidationError(`${current.path} must contain only plain JSON values`);
  }
}

export function compareScheduledEvents(left: ScheduledEvent, right: ScheduledEvent): number {
  return left.tick - right.tick || (left.priority ?? 0) - (right.priority ?? 0) || left.id.localeCompare(right.id);
}

export function compareDelayItems(left: DelayQueueItem, right: DelayQueueItem): number {
  return left.releaseTick - right.releaseTick || left.scheduledAtTick - right.scheduledAtTick || left.id.localeCompare(right.id);
}

function parseWithSchema<T>(value: unknown, schema: z.ZodType<T>, label: string): T {
  assertPlainFeedbackJson(value, label);
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid ${label.toLowerCase()}: ${formatZodIssue(parsed.error)}`);
  }
  return parsed.data;
}

function assertUniqueIds(items: readonly { id: string }[], label: string): void {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) {
      throw new SimulationValidationError(`Duplicate ${label} id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

function assertPayloadBound(value: unknown, label: string): void {
  if (value !== undefined) {
    assertJsonBound(value, maxFeedbackPayloadJsonLength, label);
  }
}

function assertJsonBound(value: unknown, maxLength: number, label: string): void {
  if (JSON.stringify(value).length > maxLength) {
    throw new SimulationValidationError(`${label} JSON must be ${maxLength} characters or less`);
  }
}

export function parseFeedbackJson(json: string, label: string): unknown {
  if (json.length > maxFeedbackJsonLength) {
    throw new SimulationSerializationError(`${label} JSON must be ${maxFeedbackJsonLength} characters or less`);
  }
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError(`Invalid ${label} JSON`, { cause: error });
  }
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
