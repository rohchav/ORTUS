import type { JsonValue, ParameterValues, SimulationRunConfig } from "../kernel/types";

export const uncertaintyConfigArtifactType = "ortus.uncertaintyConfig";
export const uncertaintyResultArtifactType = "ortus.uncertaintyResult";
export const maxUncertaintySampleCount = 100;
export const maxUncertaintyTotalRuns = 100;
export const maxUncertaintyConfigJsonLength = 40_000;
export const maxUncertaintyResultJsonLength = 240_000;
export const maxUncertaintyVariableCount = 12;
export const maxUncertaintyOutputMetrics = 24;
export const maxUncertaintySeedLength = 160;
export const maxUncertaintyTicksPerRun = 1000;

export type UncertaintyTargetType =
  | "parameter"
  | "seed"
  | "agentComposition"
  | "environmentOptions"
  | "initializationOptions"
  | "behaviorMode";

export type UncertaintySamplingMethod = "randomMonteCarlo";

export type UncertaintyDistribution =
  | {
      type: "fixed";
      value: JsonValue;
    }
  | {
      type: "uniform";
      min: number;
      max: number;
    }
  | {
      type: "integerRange";
      min: number;
      max: number;
    }
  | {
      type: "categorical";
      options: readonly JsonValue[];
    }
  | {
      type: "seedEnsemble";
      seeds: readonly string[];
    };

export interface UncertaintyVariable {
  id: string;
  label: string;
  description?: string;
  target: UncertaintyTargetType;
  targetPath: string;
  distribution: UncertaintyDistribution;
  defaultValue?: JsonValue;
  enabled: boolean;
  notes?: string;
}

// An uncertainty config is a fresh-run sampling recipe. It is plain JSON and
// must not contain snapshots, metric histories, live entities, or executable code.
export interface UncertaintyConfig {
  schemaVersion: "1";
  artifactType: typeof uncertaintyConfigArtifactType;
  id?: string;
  label?: string;
  description?: string;
  baseSeed: string;
  samplingMethod: UncertaintySamplingMethod;
  sampleCount: number;
  runsPerSample?: number;
  includeSeedEnsemble?: boolean;
  variables: readonly UncertaintyVariable[];
  outputMetrics: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface UncertaintyValidationResult {
  config: UncertaintyConfig;
  warnings: string[];
}

export interface UncertaintyRunResult {
  runId: string;
  templateId: string;
  sampleIndex: number;
  repeatIndex: number;
  seed: string;
  parameters: ParameterValues;
  behaviorMode?: string;
  agentComposition?: ParameterValues;
  environmentOptions?: ParameterValues;
  ticksRun: number;
  status: "success" | "failed";
  finalMetrics: Record<string, number>;
  error?: string;
  metadata?: Record<string, JsonValue>;
}

export interface UncertaintyMetricSummary {
  count: number;
  mean: number;
  min: number;
  max: number;
  median: number;
  standardDeviation: number;
  p05: number;
  p95: number;
}

export interface UncertaintySummaryResult {
  metrics: Record<string, UncertaintyMetricSummary>;
  warnings: string[];
}

export interface UncertaintyResultSet {
  schemaVersion: "1";
  artifactType: typeof uncertaintyResultArtifactType;
  config: UncertaintyConfig;
  baseRunConfig: SimulationRunConfig;
  generatedRunCount: number;
  ticksPerRun: number;
  runs: readonly UncertaintyRunResult[];
  metricSummaries: Record<string, UncertaintyMetricSummary>;
  warnings: readonly string[];
  status: "success" | "failed";
}

export interface UncertaintyRunOptions {
  ticksPerRun?: number;
  now?: () => number;
}
