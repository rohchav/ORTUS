import type { JsonValue, MetricRecord, ParameterValues, SimulationRunConfig } from "../kernel/types";

export const ephemeralLandscapePreviewRequestArtifactType = "ortus.ephemeralLandscapePreviewRequest";
export const ephemeralLandscapePreviewResultArtifactType = "ortus.ephemeralLandscapePreviewResult";
export const ephemeralLandscapePreviewCapabilityVersion = "1";
export const minEphemeralPreviewAxisPoints = 2;
export const maxEphemeralPreviewAxisPoints = 5;
export const maxEphemeralPreviewGridPoints = 25;
export const minEphemeralPreviewSeeds = 1;
export const maxEphemeralPreviewSeeds = 3;
export const minEphemeralPreviewTickHorizon = 1;
export const maxEphemeralPreviewTickHorizon = 250;
export const maxEphemeralPreviewWorkUnits = 5_000;
export const minEphemeralPreviewSeed = -2_147_483_648;
export const maxEphemeralPreviewSeed = 2_147_483_647;
export const defaultEphemeralPreviewSeeds = [101] as const;

export type PreviewNumericParameterType = "number" | "integer";

export interface PreviewAxisInput {
  parameterId: string;
  minimum: number;
  maximum: number;
  pointCount: number;
}

export interface EphemeralLandscapePreviewConfigurationInput {
  templateId: string;
  scenarioId: string;
  xAxis: PreviewAxisInput;
  yAxis?: PreviewAxisInput;
  seeds: readonly number[];
  tickHorizon: number;
  metricId: string;
}

export interface PreviewAxis extends PreviewAxisInput {
  parameterType: PreviewNumericParameterType;
  values: readonly number[];
}

export interface PreviewWorkEstimate {
  gridPointCount: number;
  sampleRunCount: number;
  tickHorizon: number;
  workUnits: number;
  maximumWorkUnits: typeof maxEphemeralPreviewWorkUnits;
}

export interface EphemeralLandscapePreviewRequest {
  schemaVersion: "1";
  artifactType: typeof ephemeralLandscapePreviewRequestArtifactType;
  capabilityVersion: typeof ephemeralLandscapePreviewCapabilityVersion;
  templateId: string;
  scenarioId: string;
  xAxis: PreviewAxis;
  yAxis?: PreviewAxis;
  seeds: readonly number[];
  tickHorizon: number;
  metricId: string;
  observation: "finalTick";
  fixedParameters: ParameterValues;
  workEstimate: PreviewWorkEstimate;
}

export interface PreviewCoordinateValue {
  parameterId: string;
  value: number;
}

export interface PreviewSampleCoordinate {
  x: PreviewCoordinateValue;
  y?: PreviewCoordinateValue;
}

export interface PreviewPlannedRun {
  runId: string;
  pointId: string;
  coordinate: PreviewSampleCoordinate;
  seed: number;
  runConfig: SimulationRunConfig;
}

export type PreviewRunErrorKind = "sample_run" | "metric_observation";

export interface PreviewRunError {
  kind: PreviewRunErrorKind;
  message: string;
}

export interface PreviewSampleRun {
  runId: string;
  pointId: string;
  coordinate: PreviewSampleCoordinate;
  seed: number;
  runConfig: SimulationRunConfig;
  status: "success" | "failed";
  ticksCompleted: number;
  finalTick: number | null;
  metricValue: number | null;
  error?: PreviewRunError;
}

export type PreviewSamplePointStatus = "sampled" | "partial" | "failed";

export interface PreviewSamplePoint {
  pointId: string;
  coordinate: PreviewSampleCoordinate;
  status: PreviewSamplePointStatus;
  plannedSeedCount: number;
  attemptedRunCount: number;
  successfulRunCount: number;
  failedRunCount: number;
  unstartedRunCount: number;
  mean: number | null;
  minimum: number | null;
  maximum: number | null;
  runs: readonly PreviewSampleRun[];
}

export type PreviewExecutionStatus = "completed" | "completed_with_errors" | "cancelled" | "failed";

export interface PreviewExecutionError {
  kind: PreviewRunErrorKind | "fatal_executor";
  message: string;
  runId?: string;
  pointId?: string;
  seed?: number;
}

export interface PreviewCancellationState {
  requested: boolean;
  effective: boolean;
  unstartedRunCount: number;
}

export interface EphemeralLandscapePreviewResult {
  schemaVersion: "1";
  artifactType: typeof ephemeralLandscapePreviewResultArtifactType;
  capabilityVersion: typeof ephemeralLandscapePreviewCapabilityVersion;
  request: EphemeralLandscapePreviewRequest;
  status: PreviewExecutionStatus;
  partial: boolean;
  plannedRunCount: number;
  completedRunCount: number;
  successfulRunCount: number;
  failedRunCount: number;
  points: readonly PreviewSamplePoint[];
  runs: readonly PreviewSampleRun[];
  cancellation: PreviewCancellationState;
  errors: readonly PreviewExecutionError[];
  warnings: readonly string[];
}

export interface PreviewExecutionProgress {
  completedRunCount: number;
  totalRunCount: number;
  successfulRunCount: number;
  failedRunCount: number;
  currentRunId?: string;
  status: "running" | "cancelled" | "complete" | "failed";
}

export interface PreviewCancellationSignal {
  cancelled: boolean;
}

export interface PreviewExecutionEngine {
  readonly clock: { readonly tick: number };
  readonly metrics: { historyRecords(): readonly MetricRecord[] };
  runSteps(steps: number): void;
}

export interface EphemeralLandscapePreviewExecutionOptions {
  signal?: PreviewCancellationSignal;
  onProgress?(progress: PreviewExecutionProgress): void;
  yieldFn?(): Promise<void>;
  createEngine?(runConfig: SimulationRunConfig): PreviewExecutionEngine;
}

export interface PreviewValidationIssue {
  path: string;
  message: string;
}

export interface PreviewValidationOutcome {
  request: EphemeralLandscapePreviewRequest | null;
  issues: readonly PreviewValidationIssue[];
}

export interface PreviewParameterCapability {
  id: string;
  label: string;
  type: PreviewNumericParameterType;
  minimum: number;
  maximum: number;
  step: number;
  suggestedMinimum: number;
  suggestedMaximum: number;
  suggestedPointCount: number;
  description: string;
}

export interface PreviewMetricCapability {
  id: string;
  label: string;
  description: string;
  unit?: string;
  precision: number;
}

export interface PreviewScenarioCapability {
  id: string;
  name: string;
  description: string;
}

export interface EphemeralLandscapePreviewCapability {
  capabilityVersion: typeof ephemeralLandscapePreviewCapabilityVersion;
  templateId: string;
  templateName: string;
  templateVersion: string;
  scenario: PreviewScenarioCapability;
  parameters: readonly PreviewParameterCapability[];
  metrics: readonly PreviewMetricCapability[];
  fixedMetadata: Readonly<Record<string, JsonValue>>;
}
