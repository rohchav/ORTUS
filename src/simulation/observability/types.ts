import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const observabilityModelArtifactType = "ortus.observabilityModel";
export const maxObservabilityModelJsonLength = 220_000;
export const maxObservabilityMetadataJsonLength = 20_000;
export const maxObservabilityNoteLength = 1_200;
export const maxObservabilityNotes = 48;
export const maxObservableVariables = 256;
export const maxMeasurements = 256;
export const maxObservationSchedules = 128;
export const maxMeasurementProcesses = 128;
export const maxScheduleTicks = 2_000;
export const maxObservabilityWarnings = 512;

export const variableKinds = [
  "state",
  "metric",
  "parameter",
  "event",
  "resource",
  "network",
  "field",
  "aggregate",
  "derived",
  "latent",
  "custom"
] as const;
export type ObservableVariableKind = (typeof variableKinds)[number];

export const observabilityLevels = ["direct", "indirect", "latent", "unobserved", "unknown"] as const;
export type VariableObservability = (typeof observabilityLevels)[number];

export const measurementKinds = ["exact", "sampled", "aggregate", "proxy", "categorical", "threshold", "eventCount", "presenceAbsence", "custom"] as const;
export type MeasurementKind = (typeof measurementKinds)[number];

export const measurementSourceTypes = ["modelOutput", "synthetic", "empirical", "manual", "externalPlaceholder", "custom"] as const;
export type MeasurementSourceType = (typeof measurementSourceTypes)[number];

export const observationScheduleTypes = ["everyTick", "fixedInterval", "specificTicks", "eventTriggered", "manual", "unknown", "custom"] as const;
export type ObservationScheduleType = (typeof observationScheduleTypes)[number];

export const measurementProcessTypes = ["none", "noise", "bias", "lag", "missingness", "censoring", "aggregation", "sampling", "proxy", "custom"] as const;
export type MeasurementProcessType = (typeof measurementProcessTypes)[number];

export interface ObservabilityScope {
  templateId?: string;
  scenarioId?: string;
  runConfigId?: string;
  scaleModelId?: string;
  boundaryModelId?: string;
  fieldLayerId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ObservableVariable {
  id: string;
  label: string;
  variableKind: ObservableVariableKind;
  observability: VariableObservability;
  targetPath?: string;
  unit?: string;
  scaleId?: string;
  entityTypeId?: string;
  fieldId?: string;
  metricId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface MeasurementDefinition {
  id: string;
  label: string;
  variableId: string;
  measurementKind: MeasurementKind;
  sourceType: MeasurementSourceType;
  scheduleId?: string;
  processId?: string;
  unit?: string;
  aggregation?: string;
  lagTicks?: number;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ObservationSchedule {
  id: string;
  label: string;
  scheduleType: ObservationScheduleType;
  intervalTicks?: number;
  ticks?: readonly number[];
  eventDescription?: string;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface MeasurementProcess {
  id: string;
  label: string;
  processType: MeasurementProcessType;
  noiseDescription?: string;
  biasDescription?: string;
  missingnessDescription?: string;
  samplingDescription?: string;
  transformationDescription?: string;
  uncertaintyDescription?: string;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ObservabilityModel {
  schemaVersion: "1";
  artifactType: typeof observabilityModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scope?: ObservabilityScope;
  variables: readonly ObservableVariable[];
  measurements?: readonly MeasurementDefinition[];
  schedules?: readonly ObservationSchedule[];
  measurementProcesses?: readonly MeasurementProcess[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface ObservabilityMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface ObservabilityValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly ObservabilityMissingCapability[];
}

export interface ObservabilitySummary {
  id: string;
  name: string;
  variableCount: number;
  directlyObservableCount: number;
  indirectlyObservableCount: number;
  latentCount: number;
  unobservedCount: number;
  measurementCount: number;
  activeMeasurementCount: number;
  empiricalMeasurementCount: number;
  syntheticMeasurementCount: number;
  modelOutputMeasurementCount: number;
  scheduleCount: number;
  processCount: number;
  executableCount: number;
  warnings: readonly string[];
}
