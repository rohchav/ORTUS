import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const emergencePatternModelArtifactType = "ortus.emergencePatternModel";
export const maxEmergencePatternModelJsonLength = 220_000;
export const maxEmergencePatternMetadataJsonLength = 20_000;
export const maxEmergencePatternNoteLength = 1_200;
export const maxEmergencePatternNotes = 48;
export const maxPatternDescriptors = 512;
export const maxPatternVariables = 512;
export const maxPatternSignatures = 512;
export const maxPatternThresholds = 512;
export const maxPatternTimeWindows = 512;
export const maxPatternScaleLinks = 512;
export const maxEmergenceWarnings = 512;

export const patternKinds = [
  "clustering",
  "segregation",
  "synchronization",
  "polarization",
  "oscillation",
  "wave",
  "cascade",
  "percolation",
  "phaseTransition",
  "tippingPoint",
  "selfOrganization",
  "flocking",
  "consensus",
  "fragmentation",
  "criticality",
  "resilience",
  "collapse",
  "recovery",
  "custom"
] as const;
export type PatternKind = (typeof patternKinds)[number];

export const patternDescriptorStatuses = [
  "candidate",
  "hypothesized",
  "observedInModelOutput",
  "internallyTested",
  "externallyValidated",
  "rejected",
  "unknown"
] as const;
export type PatternDescriptorStatus = (typeof patternDescriptorStatuses)[number];

export const patternVariableKinds = [
  "state",
  "metric",
  "parameter",
  "agentProperty",
  "networkMeasure",
  "resourceStock",
  "resourceFlow",
  "fieldValue",
  "scaleAggregate",
  "observation",
  "custom"
] as const;
export type PatternVariableKind = (typeof patternVariableKinds)[number];

export const patternSignatureKinds = [
  "increase",
  "decrease",
  "thresholdCrossing",
  "plateau",
  "oscillation",
  "varianceChange",
  "spatialCluster",
  "networkCluster",
  "synchrony",
  "divergence",
  "distributionShift",
  "persistence",
  "recovery",
  "collapse",
  "custom"
] as const;
export type PatternSignatureKind = (typeof patternSignatureKinds)[number];

export const patternThresholdKinds = [
  "absolute",
  "relative",
  "percentile",
  "rateOfChange",
  "variance",
  "duration",
  "spatialExtent",
  "networkFraction",
  "custom"
] as const;
export type PatternThresholdKind = (typeof patternThresholdKinds)[number];

export const patternTimeWindowKinds = ["tickRange", "rolling", "beforeAfter", "phase", "unknown", "custom"] as const;
export type PatternTimeWindowKind = (typeof patternTimeWindowKinds)[number];

export const patternScaleLinkRelations = [
  "localToGlobal",
  "globalToLocal",
  "crossScaleFeedback",
  "aggregation",
  "disaggregation",
  "unknown",
  "custom"
] as const;
export type PatternScaleLinkRelation = (typeof patternScaleLinkRelations)[number];

export interface EmergenceScope {
  templateId?: string;
  scenarioId?: string;
  runConfigId?: string;
  observabilityModelId?: string;
  causalAssumptionModelId?: string;
  quantitySemanticsModelId?: string;
  scaleModelId?: string;
  scaleViewStateId?: string;
  networkDefinitionId?: string;
  resourceSystemId?: string;
  fieldLayerId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface PatternDescriptor {
  id: string;
  label: string;
  patternKind: PatternKind;
  status: PatternDescriptorStatus;
  localMechanismDescription?: string;
  globalPatternDescription?: string;
  variableIds?: readonly string[];
  signatureIds?: readonly string[];
  thresholdIds?: readonly string[];
  timeWindowIds?: readonly string[];
  scaleLinkIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface PatternVariable {
  id: string;
  label: string;
  variableKind: PatternVariableKind;
  targetPath?: string;
  metricId?: string;
  fieldId?: string;
  networkMeasureId?: string;
  quantityId?: string;
  scaleId?: string;
  unitId?: string;
  dimensionId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface PatternSignature {
  id: string;
  label: string;
  signatureKind: PatternSignatureKind;
  variableId?: string;
  thresholdId?: string;
  timeWindowId?: string;
  description?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface PatternThreshold {
  id: string;
  label: string;
  thresholdKind: PatternThresholdKind;
  valueDescription: string;
  quantityId?: string;
  unitId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface PatternTimeWindow {
  id: string;
  label: string;
  windowKind: PatternTimeWindowKind;
  startTick?: number;
  endTick?: number;
  durationTicks?: number;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface PatternScaleLink {
  id: string;
  label: string;
  localScaleId?: string;
  globalScaleId?: string;
  relation: PatternScaleLinkRelation;
  description?: string;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface EmergencePatternModel {
  schemaVersion: "1";
  artifactType: typeof emergencePatternModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scope?: EmergenceScope;
  descriptors: readonly PatternDescriptor[];
  signatures?: readonly PatternSignature[];
  patternVariables?: readonly PatternVariable[];
  thresholds?: readonly PatternThreshold[];
  timeWindows?: readonly PatternTimeWindow[];
  scaleLinks?: readonly PatternScaleLink[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface EmergencePatternMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface EmergencePatternValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly EmergencePatternMissingCapability[];
}

export interface EmergencePatternSummary {
  id: string;
  name: string;
  descriptorCount: number;
  activeDescriptorCount: number;
  candidateCount: number;
  observedInModelOutputCount: number;
  internallyTestedCount: number;
  externallyValidatedCount: number;
  rejectedCount: number;
  variableCount: number;
  signatureCount: number;
  thresholdCount: number;
  timeWindowCount: number;
  scaleLinkCount: number;
  executableCount: number;
  warnings: readonly string[];
}
