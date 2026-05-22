import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const scaleModelArtifactType = "ortus.scaleModel";
export const maxScaleModelJsonLength = 220_000;
export const maxScaleModelMetadataJsonLength = 20_000;
export const maxScaleModelNoteLength = 1_200;
export const maxScaleModelNotes = 48;
export const maxScaleLevels = 16;
export const maxScaleEntityTypesPerLevel = 64;
export const maxScaleStateVariablesPerEntity = 64;
export const maxScaleRules = 128;
export const maxCrossScaleLinks = 128;

export const scaleTypes = ["micro", "meso", "macro", "environment", "custom"] as const;
export type ScaleType = (typeof scaleTypes)[number];

export const scaleEntityKinds = ["agent", "group", "region", "field", "networkNode", "resourceStock", "system", "custom"] as const;
export type ScaleEntityKind = (typeof scaleEntityKinds)[number];

export const scaleStateValueTypes = ["number", "integer", "boolean", "category", "vector2", "distribution", "custom"] as const;
export type ScaleStateValueType = (typeof scaleStateValueTypes)[number];

export const aggregationTypes = ["count", "sum", "mean", "distribution", "density", "cluster", "networkProjection", "custom"] as const;
export type AggregationType = (typeof aggregationTypes)[number];

export const disaggregationTypes = ["restorePrevious", "sampleRepresentative", "uniformSplit", "distributionSample", "custom"] as const;
export type DisaggregationType = (typeof disaggregationTypes)[number];

export const crossScaleLinkTypes = [
  "aggregateUp",
  "constrainDown",
  "feedbackAcross",
  "resourceAcross",
  "eventAcross",
  "networkProjection",
  "custom"
] as const;
export type CrossScaleLinkType = (typeof crossScaleLinkTypes)[number];

export const crossScaleDirections = ["up", "down", "bidirectional"] as const;
export type CrossScaleDirection = (typeof crossScaleDirections)[number];

export interface ScaleStateVariable {
  id: string;
  label: string;
  valueType: ScaleStateValueType;
  unit?: string;
  description?: string;
  metadata?: Record<string, JsonValue>;
}

export interface ScaleEntityType {
  id: string;
  label: string;
  description?: string;
  kind: ScaleEntityKind;
  stateVariables?: readonly ScaleStateVariable[];
  metrics?: readonly ScaleStateVariable[];
  metadata?: Record<string, JsonValue>;
}

export interface ScaleLevel {
  id: string;
  label: string;
  description?: string;
  order: number;
  scaleType: ScaleType;
  entityTypes: readonly ScaleEntityType[];
  defaultViewMode?: string;
  temporalResolution?: string;
  spatialResolution?: string;
  metadata?: Record<string, JsonValue>;
}

export interface AggregationRule {
  id: string;
  label: string;
  fromScaleId: string;
  toScaleId: string;
  fromEntityTypeId: string;
  toEntityTypeId: string;
  aggregationType: AggregationType;
  sourceVariables?: readonly string[];
  targetVariables?: readonly string[];
  informationLossNotes?: readonly string[];
  executable: false;
  metadata?: Record<string, JsonValue>;
}

export interface DisaggregationRule {
  id: string;
  label: string;
  fromScaleId: string;
  toScaleId: string;
  fromEntityTypeId: string;
  toEntityTypeId: string;
  disaggregationType: DisaggregationType;
  sourceVariables?: readonly string[];
  targetVariables?: readonly string[];
  syntheticDetailNotes?: readonly string[];
  executable: false;
  metadata?: Record<string, JsonValue>;
}

export interface CrossScaleLink {
  id: string;
  label: string;
  sourceScaleId: string;
  targetScaleId: string;
  sourceEntityTypeId?: string;
  targetEntityTypeId?: string;
  linkType: CrossScaleLinkType;
  direction: CrossScaleDirection;
  active: boolean;
  executable: false;
  notes?: string;
  metadata?: Record<string, JsonValue>;
}

export interface MultiScaleModel {
  schemaVersion: "1";
  artifactType: typeof scaleModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scaleLevels: readonly ScaleLevel[];
  aggregationRules: readonly AggregationRule[];
  disaggregationRules: readonly DisaggregationRule[];
  crossScaleLinks: readonly CrossScaleLink[];
  primaryScaleId?: string;
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface MultiScaleMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface MultiScaleValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  warnings: readonly string[];
  errors: readonly string[];
  informationLossWarnings: readonly string[];
  syntheticDetailWarnings: readonly string[];
  missingCapabilities: readonly MultiScaleMissingCapability[];
}

export interface MultiScaleSummary {
  id: string;
  name: string;
  scaleLevelCount: number;
  entityTypeCount: number;
  aggregationRuleCount: number;
  disaggregationRuleCount: number;
  crossScaleLinkCount: number;
  primaryScaleId?: string;
  hasSyntheticDisaggregation: boolean;
  hasInformationLoss: boolean;
  runnableNow: boolean;
  warnings: readonly string[];
}
