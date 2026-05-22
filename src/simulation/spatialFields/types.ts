import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const fieldLayerArtifactType = "ortus.fieldLayer";
export const maxSpatialFieldModelJsonLength = 220_000;
export const maxSpatialFieldMetadataJsonLength = 20_000;
export const maxSpatialFieldNoteLength = 1_200;
export const maxSpatialFieldNotes = 48;
export const maxSpatialFields = 128;
export const maxEnvironmentalLayers = 64;
export const maxSamplingRules = 128;
export const maxLayerFieldRefs = 64;
export const maxSpatialFieldWarnings = 512;

export const coordinateSpaceTypes = ["grid2D", "continuous2D", "networkProjected", "abstract", "custom"] as const;
export type CoordinateSpaceType = (typeof coordinateSpaceTypes)[number];

export const fieldTypes = ["scalar", "vector2", "categorical", "boolean", "density", "cost", "probabilityLike", "custom"] as const;
export type FieldType = (typeof fieldTypes)[number];

export const spatialFieldValueTypes = ["number", "integer", "boolean", "category", "vector2", "distribution", "custom"] as const;
export type SpatialFieldValueType = (typeof spatialFieldValueTypes)[number];

export const fieldValueSources = ["declared", "measured", "sampled", "synthetic", "derived", "placeholder"] as const;
export type FieldValueSource = (typeof fieldValueSources)[number];

export const environmentalLayerTypes = [
  "terrain",
  "resource",
  "population",
  "risk",
  "policy",
  "infrastructure",
  "climate",
  "media",
  "social",
  "abstract",
  "custom"
] as const;
export type EnvironmentalLayerType = (typeof environmentalLayerTypes)[number];

export const samplingTypes = ["nearest", "bilinear", "areaAverage", "networkLookup", "categoryLookup", "none", "custom"] as const;
export type SamplingType = (typeof samplingTypes)[number];

export const extrapolationPolicies = ["reject", "clamp", "nearest", "unknown", "custom"] as const;
export type ExtrapolationPolicy = (typeof extrapolationPolicies)[number];

export interface SpatialExtent {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface SpatialResolution {
  dx?: number;
  dy?: number;
  rows?: number;
  columns?: number;
}

export interface SpatialOrigin {
  x: number;
  y: number;
}

export interface CoordinateSpace {
  id: string;
  label: string;
  spaceType: CoordinateSpaceType;
  extent?: SpatialExtent;
  resolution?: SpatialResolution;
  unit?: string;
  origin?: SpatialOrigin;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface FieldDefinition {
  id: string;
  label: string;
  fieldType: FieldType;
  valueType: SpatialFieldValueType;
  unit?: string;
  valueSource: FieldValueSource;
  domainDescription?: string;
  resolutionDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface EnvironmentalLayer {
  id: string;
  label: string;
  layerType: EnvironmentalLayerType;
  fieldIds: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface SamplingRule {
  id: string;
  label: string;
  fieldId: string;
  samplingType: SamplingType;
  interpolationType?: string;
  extrapolationPolicy: ExtrapolationPolicy;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface SpatialFieldModel {
  schemaVersion: "1";
  artifactType: typeof fieldLayerArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  coordinateSpace: CoordinateSpace;
  fields: readonly FieldDefinition[];
  layers?: readonly EnvironmentalLayer[];
  samplingRules?: readonly SamplingRule[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface SpatialFieldMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface SpatialFieldValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly SpatialFieldMissingCapability[];
}

export interface SpatialFieldSummary {
  id: string;
  name: string;
  coordinateSpaceType: CoordinateSpaceType;
  fieldCount: number;
  activeFieldCount: number;
  layerCount: number;
  activeLayerCount: number;
  samplingRuleCount: number;
  syntheticFieldCount: number;
  measuredFieldCount: number;
  placeholderFieldCount: number;
  executableCount: number;
  warnings: readonly string[];
}
