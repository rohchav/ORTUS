import type { JsonValue, MetricRecord, ParameterValues } from "../kernel/types";

export type RunSummarySource = "manual" | "experiment" | "imported";

export interface RunMetricRecord {
  tick: number;
  time: number;
  values: Record<string, number>;
}

export interface RunInterventionSummary {
  interventionId: string;
  label: string;
  tickApplied: number;
  targetSummary: string;
  status: "applied" | "failed";
}

export interface RunEventSummary {
  type: string;
  tick: number;
  source: string;
  label?: string;
  severity?: "info" | "warning" | "error";
  category?: string;
}

// Saved run summaries are bounded comparison artifacts. They are not scenarios
// and do not store full snapshot/world state by default.
export interface SavedRunSummary {
  schemaVersion: "1";
  runId: string;
  label: string;
  templateId: string;
  templateName: string;
  templateVersion: string;
  seed: string;
  parameters: ParameterValues;
  capturedAt: string;
  ticksRun: number;
  time: number;
  finalMetrics: Record<string, number>;
  metricHistory: RunMetricRecord[];
  interventions: RunInterventionSummary[];
  events?: RunEventSummary[];
  source: RunSummarySource;
  notes: string;
  tags: string[];
  metadata?: Record<string, JsonValue>;
}

export interface RunParameterDifference {
  key: string;
  values: Record<string, JsonValue | undefined>;
}

export interface RunMetricDelta {
  key: string;
  baselineValue?: number;
  values: Record<string, number | undefined>;
  deltas: Record<string, { absolute?: number; percent?: number }>;
}

export interface RunComparisonMetadata {
  runId: string;
  label: string;
  templateId: string;
  seed: string;
  ticksRun: number;
  source: RunSummarySource;
  capturedAt: string;
  interventionCount: number;
}

export interface RunComparisonResult {
  baselineRunId: string | null;
  runIds: string[];
  metadata: RunComparisonMetadata[];
  parameterDifferences: RunParameterDifference[];
  metricDeltas: RunMetricDelta[];
  warnings: string[];
}

export const maxSavedRunSummaries = 50;
export const maxRunMetricHistoryLength = 240;
export const maxRunInterventionSummaryLength = 100;
export const maxRunEventSummaryLength = 100;

export function metricRecordFromKernel(record: MetricRecord): RunMetricRecord {
  return {
    tick: record.tick,
    time: record.time,
    values: { ...record.values }
  };
}
