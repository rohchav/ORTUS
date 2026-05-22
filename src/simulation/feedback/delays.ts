import { SimulationValidationError } from "../kernel/Errors";
import type { JsonValue } from "../kernel/types";
import { maxDelayQueueItemCount, maxFeedbackTick, type DelayDefinition, type DelayQueueItem } from "./types";
import { assertPlainFeedbackJson, compareDelayItems, validateDelayDefinition, validateDelayQueue } from "./validation";

export interface ReleaseDelayItemsResult {
  queue: readonly DelayQueueItem[];
  released: readonly DelayQueueItem[];
}

export interface DelayQueueMetrics {
  delayQueueSize: number;
  averageDelayTicks: number;
  maxDelayTicks: number;
  delaysByType: Record<string, number>;
}

export function scheduleDelay(
  queue: readonly DelayQueueItem[],
  definition: DelayDefinition,
  payload: JsonValue,
  scheduledAtTick: number,
  target?: Pick<DelayQueueItem, "targetType" | "targetId" | "metadata">
): DelayQueueItem[] {
  const validDefinition = validateDelayDefinition(definition);
  const validQueue = validateDelayQueue(queue);
  assertPlainFeedbackJson(payload, "Delay payload");
  const releaseTick = scheduledAtTick + validDefinition.delayTicks;
  if (!Number.isInteger(scheduledAtTick) || scheduledAtTick < 0 || !Number.isFinite(releaseTick) || releaseTick > maxFeedbackTick) {
    throw new SimulationValidationError("Delay scheduling ticks must be finite non-negative integers within bounds");
  }
  const prefix = `delay-${validDefinition.id}-${scheduledAtTick}-${releaseTick}-${hashPayload(payload)}`;
  const duplicateCount = validQueue.filter((item) => item.id.startsWith(prefix)).length;
  const item: DelayQueueItem = {
    id: `${prefix}-${duplicateCount + 1}`,
    delayDefinitionId: validDefinition.id,
    scheduledAtTick,
    releaseTick,
    payload,
    ...(target?.targetType ? { targetType: target.targetType } : validDefinition.targetType ? { targetType: validDefinition.targetType } : {}),
    ...(target?.targetId ? { targetId: target.targetId } : {}),
    metadata: target?.metadata ?? {}
  };
  const next = validateDelayQueue([...validQueue, item]);
  if (next.length > maxDelayQueueItemCount) {
    throw new SimulationValidationError(`Delay queue must contain ${maxDelayQueueItemCount} items or fewer`);
  }
  return next;
}

export function releaseDelayItemsForTick(queue: readonly DelayQueueItem[], tick: number): ReleaseDelayItemsResult {
  assertValidTick(tick, "Delay release tick");
  const valid = validateDelayQueue(queue);
  const released = valid.filter((item) => item.releaseTick <= tick).sort(compareDelayItems);
  const releasedIds = new Set(released.map((item) => item.id));
  return {
    queue: valid.filter((item) => !releasedIds.has(item.id)).sort(compareDelayItems),
    released
  };
}

export function peekDelayItems(queue: readonly DelayQueueItem[], tick: number): DelayQueueItem[] {
  assertValidTick(tick, "Delay peek tick");
  return validateDelayQueue(queue)
    .filter((item) => item.releaseTick <= tick)
    .sort(compareDelayItems);
}

export function computeDelayMetrics(queue: readonly DelayQueueItem[]): DelayQueueMetrics {
  const valid = validateDelayQueue(queue);
  const delays = valid.map((item) => item.releaseTick - item.scheduledAtTick);
  const delaysByType: Record<string, number> = {};
  for (const item of valid) {
    const key = item.delayDefinitionId ?? "inline";
    delaysByType[key] = (delaysByType[key] ?? 0) + 1;
  }
  return {
    delayQueueSize: valid.length,
    averageDelayTicks: delays.length > 0 ? delays.reduce((sum, value) => sum + value, 0) / delays.length : 0,
    maxDelayTicks: delays.length > 0 ? Math.max(...delays) : 0,
    delaysByType
  };
}

function assertValidTick(tick: number, label: string): void {
  if (!Number.isInteger(tick) || tick < 0 || tick > maxFeedbackTick) {
    throw new SimulationValidationError(`${label} must be a finite non-negative integer within bounds`);
  }
}

function hashPayload(payload: JsonValue): string {
  const json = JSON.stringify(payload);
  let hash = 2166136261;
  for (let index = 0; index < json.length; index += 1) {
    hash ^= json.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
