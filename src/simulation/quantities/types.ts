import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const quantitySemanticsModelArtifactType = "ortus.quantitySemanticsModel";
export const maxQuantitySemanticsModelJsonLength = 220_000;
export const maxQuantitySemanticsMetadataJsonLength = 20_000;
export const maxQuantitySemanticsNoteLength = 1_200;
export const maxQuantitySemanticsNotes = 48;
export const maxDimensions = 256;
export const maxUnits = 512;
export const maxQuantities = 512;
export const maxCompatibilityRules = 512;
export const maxBaseDimensions = 16;
export const maxQuantityWarnings = 512;

export const dimensionKinds = [
  "dimensionless",
  "count",
  "time",
  "length",
  "area",
  "volume",
  "mass",
  "energy",
  "rate",
  "probability",
  "ratio",
  "resource",
  "information",
  "custom"
] as const;
export type DimensionKind = (typeof dimensionKinds)[number];

export const unitKinds = ["base", "derived", "dimensionless", "index", "category", "custom"] as const;
export type UnitKind = (typeof unitKinds)[number];

export const quantityKinds = [
  "state",
  "parameter",
  "metric",
  "rate",
  "probability",
  "count",
  "resourceStock",
  "resourceFlow",
  "distance",
  "area",
  "duration",
  "index",
  "category",
  "latent",
  "custom"
] as const;
export type QuantityKind = (typeof quantityKinds)[number];

export const numericRoles = ["continuous", "integer", "nonNegative", "bounded01", "categorical", "ordinal", "boolean01", "unknown"] as const;
export type NumericRole = (typeof numericRoles)[number];

export const compatibilityRelations = ["compatible", "incompatible", "requiresConversion", "ratioOf", "rateOf", "unknown", "custom"] as const;
export type CompatibilityRelation = (typeof compatibilityRelations)[number];

export interface QuantityScope {
  templateId?: string;
  scenarioId?: string;
  runConfigId?: string;
  observabilityModelId?: string;
  causalAssumptionModelId?: string;
  scaleModelId?: string;
  resourceSystemId?: string;
  fieldLayerId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface BaseDimensionReference {
  dimensionId: string;
  exponent: number;
}

export interface DimensionDefinition {
  id: string;
  label: string;
  dimensionKind: DimensionKind;
  baseDimensions?: readonly BaseDimensionReference[];
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface UnitDefinition {
  id: string;
  label: string;
  symbol?: string;
  dimensionId: string;
  unitKind: UnitKind;
  scaleDescription?: string;
  offsetDescription?: string;
  conversionNotes?: string;
  canonical?: boolean;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface QuantityRange {
  min?: number;
  max?: number;
  includeMin?: boolean;
  includeMax?: boolean;
}

export interface QuantityDefinition {
  id: string;
  label: string;
  quantityKind: QuantityKind;
  unitId?: string;
  dimensionId?: string;
  targetPath?: string;
  numericRole: NumericRole;
  extensive?: boolean;
  intensive?: boolean;
  perTick?: boolean;
  perTimeUnitId?: string;
  perSpaceUnitId?: string;
  perEntityUnitId?: string;
  validRange?: QuantityRange;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface CompatibilityRule {
  id: string;
  label: string;
  leftQuantityId?: string;
  rightQuantityId?: string;
  leftDimensionId?: string;
  rightDimensionId?: string;
  relation: CompatibilityRelation;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface QuantitySemanticsModel {
  schemaVersion: "1";
  artifactType: typeof quantitySemanticsModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scope?: QuantityScope;
  dimensions: readonly DimensionDefinition[];
  units: readonly UnitDefinition[];
  quantities: readonly QuantityDefinition[];
  compatibilityRules?: readonly CompatibilityRule[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface QuantitySemanticsMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface QuantitySemanticsValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly QuantitySemanticsMissingCapability[];
}

export interface QuantitySemanticsSummary {
  id: string;
  name: string;
  dimensionCount: number;
  unitCount: number;
  quantityCount: number;
  activeQuantityCount: number;
  probabilityQuantityCount: number;
  rateQuantityCount: number;
  countQuantityCount: number;
  resourceQuantityCount: number;
  dimensionlessQuantityCount: number;
  compatibilityRuleCount: number;
  executableCount: number;
  warnings: readonly string[];
}
