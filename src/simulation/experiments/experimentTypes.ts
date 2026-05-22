import type { JsonValue, MetricDefinition, ParameterValues } from "../kernel/types";

export type SweepValue = string | number | boolean;

export interface ParameterSweepDimension {
  parameterKey: string;
  values?: readonly SweepValue[];
  range?: {
    min: number;
    max: number;
    steps: number;
  };
}

export interface ParameterSweep {
  dimensions: readonly ParameterSweepDimension[];
}

export type ExperimentSeedMode = "fixed" | "sequential";
export type ExperimentAggregationMode = "final";
export type ExperimentRunStatus = "success" | "failed" | "cancelled";
export type ExperimentStatus = "success" | "failed" | "cancelled";

// V1 experiments sweep template parameters and seeds. Future work should evolve
// this toward a generalized RunConfig so scenarios and uncertainty configs can
// participate without coupling experiments to UI state.
export interface ExperimentConfig {
  templateId: string;
  baseParameters: ParameterValues;
  parameterSweep: ParameterSweep;
  seedMode: ExperimentSeedMode;
  seeds: readonly string[];
  baseSeed?: string;
  trialsPerCondition: number;
  ticksPerRun: number;
  metricsToRecord: readonly string[];
  aggregationMode: ExperimentAggregationMode;
  maxRuns: number;
  metadata?: Record<string, JsonValue>;
}

export interface ExperimentCondition {
  key: string;
  parameterValues: ParameterValues;
  sweptValues: Record<string, SweepValue>;
}

export interface ExperimentRunPlan {
  runId: string;
  condition: ExperimentCondition;
  seed: string;
  trialIndex: number;
}

export interface ExperimentValidationResult {
  config: ExperimentConfig;
  conditions: ExperimentCondition[];
  runPlans: ExperimentRunPlan[];
  metricDefinitions: MetricDefinition[];
  totalRuns: number;
}

export interface ExperimentRunResult {
  runId: string;
  templateId: string;
  parameterValues: ParameterValues;
  sweptValues: Record<string, SweepValue>;
  seed: string;
  ticksRun: number;
  status: ExperimentRunStatus;
  finalMetrics: Record<string, number>;
  selectedSummaryMetrics?: Record<string, number>;
  error?: string;
  durationMs: number;
  metadata?: Record<string, JsonValue>;
}

export interface ExperimentMetricAggregate {
  count: number;
  mean: number;
  min: number;
  max: number;
  standardDeviation: number;
}

export interface ExperimentAggregateResult {
  conditionKey: string;
  parameterValues: ParameterValues;
  sweptValues: Record<string, SweepValue>;
  runCount: number;
  successCount: number;
  failureCount: number;
  cancelledCount: number;
  metrics: Record<string, ExperimentMetricAggregate>;
}

export interface ExperimentResultSet {
  config: ExperimentConfig;
  runs: ExperimentRunResult[];
  aggregates: ExperimentAggregateResult[];
  status: ExperimentStatus;
}

export interface ExperimentProgress {
  completedRuns: number;
  totalRuns: number;
  currentRunId?: string;
  status: "idle" | "running" | "cancelled" | "complete";
}

export interface ExperimentCancellationToken {
  cancelled: boolean;
}

export interface ExperimentRunOptions {
  onProgress?: (progress: ExperimentProgress) => void;
  signal?: ExperimentCancellationToken;
  yieldEvery?: number;
  yieldFn?: () => Promise<void>;
  now?: () => number;
}

export const defaultExperimentMaxRuns = 100;
export const hardExperimentMaxRuns = 500;
