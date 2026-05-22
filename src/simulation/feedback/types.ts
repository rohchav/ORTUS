import type { JsonValue } from "../kernel/types";

export const eventScheduleArtifactType = "ortus.eventSchedule";
export const delayQueueArtifactType = "ortus.delayQueue";
export const feedbackLoopsArtifactType = "ortus.feedbackLoops";
export const feedbackEventMetricsArtifactType = "ortus.feedbackEventMetrics";

export const maxScheduledEventCount = 1_000;
export const maxDelayQueueItemCount = 1_000;
export const maxFeedbackLoopCount = 500;
export const maxFeedbackLedgerLength = 1_000;
export const maxFeedbackJsonLength = 300_000;
export const maxFeedbackPayloadJsonLength = 40_000;
export const maxDelayTicks = 100_000;
export const maxFeedbackTick = 1_000_000_000;

export type FeedbackTargetType = "system" | "agent" | "group" | "region" | "environment" | "resource" | "stock" | "network" | "metadata";
export type FeedbackLoopType = "reinforcing" | "balancing" | "unknown";

export interface EventDefinition {
  id: string;
  label: string;
  description?: string;
  eventType: string;
  targetType?: FeedbackTargetType;
  targetId?: string;
  payload?: JsonValue;
  metadata?: Record<string, JsonValue>;
}

export interface ScheduledEvent {
  id: string;
  eventDefinitionId?: string;
  label?: string;
  tick: number;
  priority?: number;
  eventType: string;
  targetType?: FeedbackTargetType;
  targetId?: string;
  payload?: JsonValue;
  metadata?: Record<string, JsonValue>;
}

export interface EventApplicationResult {
  eventId: string;
  tick: number;
  applied: boolean;
  reason?: string;
  warnings?: readonly string[];
  payloadSummary?: string;
}

export interface DelayDefinition {
  id: string;
  label: string;
  description?: string;
  delayType: string;
  delayTicks: number;
  sourceType?: FeedbackTargetType;
  targetType?: FeedbackTargetType;
  metadata?: Record<string, JsonValue>;
}

export interface DelayQueueItem {
  id: string;
  delayDefinitionId?: string;
  scheduledAtTick: number;
  releaseTick: number;
  payload: JsonValue;
  targetType?: FeedbackTargetType;
  targetId?: string;
  metadata?: Record<string, JsonValue>;
}

export interface FeedbackLoopDefinition {
  id: string;
  label: string;
  description?: string;
  loopType: FeedbackLoopType;
  signalSource: string;
  target: string;
  gain: number;
  clamp?: {
    min?: number;
    max?: number;
  };
  enabled?: boolean;
  delayTicks?: number;
  metadata?: Record<string, JsonValue>;
}

export interface FeedbackSignal {
  loopId: string;
  tick: number;
  value: number;
  source: string;
  metadata?: Record<string, JsonValue>;
}

export interface FeedbackApplicationResult {
  loopId: string;
  tick: number;
  signalValue: number;
  requestedAdjustment: number;
  appliedAdjustment: number;
  target: string;
  warnings?: readonly string[];
}

export interface FeedbackEventSystemState {
  scheduledEvents: readonly ScheduledEvent[];
  delayQueue: readonly DelayQueueItem[];
  feedbackLoops: readonly FeedbackLoopDefinition[];
  eventLedger?: readonly EventApplicationResult[];
  feedbackLedger?: readonly FeedbackApplicationResult[];
  metadata?: Record<string, JsonValue>;
}

export interface EventScheduleArtifact {
  schemaVersion: "1";
  artifactType: typeof eventScheduleArtifactType;
  scheduledEvents: readonly ScheduledEvent[];
  eventLedger?: readonly EventApplicationResult[];
  metadata?: Record<string, JsonValue>;
}

export interface DelayQueueArtifact {
  schemaVersion: "1";
  artifactType: typeof delayQueueArtifactType;
  delayQueue: readonly DelayQueueItem[];
  metadata?: Record<string, JsonValue>;
}

export interface FeedbackLoopsArtifact {
  schemaVersion: "1";
  artifactType: typeof feedbackLoopsArtifactType;
  feedbackLoops: readonly FeedbackLoopDefinition[];
  feedbackLedger?: readonly FeedbackApplicationResult[];
  metadata?: Record<string, JsonValue>;
}

export interface FeedbackEventMetrics {
  scheduledEventCount: number;
  releasedEventCount: number;
  delayQueueSize: number;
  releasedDelayItemCount: number;
  feedbackLoopCount: number;
  enabledFeedbackLoopCount: number;
  reinforcingLoopCount: number;
  balancingLoopCount: number;
  unknownLoopCount: number;
  averageDelayTicks: number;
  maxDelayTicks: number;
  eventLedgerCount: number;
  feedbackLedgerCount: number;
  eventsByType: Record<string, number>;
  delaysByType: Record<string, number>;
  feedbackAdjustmentsByTarget: Record<string, number>;
  clampedFeedbackCount: number;
}

export interface FeedbackEventMetricsResult {
  schemaVersion: "1";
  artifactType: typeof feedbackEventMetricsArtifactType;
  metrics: FeedbackEventMetrics;
  warnings: readonly string[];
}
