import type {
  ModelEntityKind,
  ModelMetricKind,
  ModelParameterValueKind,
  ModelRuleKind,
  ModelSpaceKind,
  ModelValueKind
} from "../modelSchema/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId, PrimitiveSupportLevel } from "../registry/types";

export const schemaTemplateCompatibilityPrimitiveId = "schemaTemplateCompatibility";
export const schemaTemplateCompatibilityReportArtifactType = "ortus.schemaTemplateCompatibilityReport";
export const templateMappingProfileArtifactType = "ortus.templateMappingProfile";

export const maxSchemaTemplateCompatibilityJsonLength = 280_000;
export const maxSchemaTemplateCompatibilityMetadataJsonLength = 20_000;
export const maxSchemaTemplateCompatibilityNoteLength = 1_200;
export const maxSchemaTemplateCompatibilityDescriptionLength = 2_000;
export const maxSchemaTemplateCompatibilityItems = 512;
export const maxSchemaTemplateCompatibilityResults = 128;
export const maxSchemaTemplateCompatibilityWarnings = 512;

export const compatibilityFitLevels = ["none", "weak", "partial", "strong", "templateExact"] as const;
export type CompatibilityFit = (typeof compatibilityFitLevels)[number];

export const schemaElementKinds = [
  "entityType",
  "componentType",
  "attributeType",
  "space",
  "parameter",
  "metric",
  "ruleDeclaration",
  "artifactReference",
  "socialLearningDescriptor",
  "modelReference",
  "custom"
] as const;
export type SchemaElementKind = (typeof schemaElementKinds)[number];

export const templateConceptKinds = [
  "agent",
  "cell",
  "space",
  "parameter",
  "metric",
  "behaviorMode",
  "intervention",
  "visualMetadata",
  "unsupported",
  "futureOnly",
  "custom"
] as const;
export type TemplateConceptKind = (typeof templateConceptKinds)[number];

export const mappingStatuses = ["mapped", "partial", "unsupported", "futureOnly", "lossy"] as const;
export type MappingStatus = (typeof mappingStatuses)[number];

export const mappingConfidences = ["low", "medium", "high"] as const;
export type MappingConfidence = (typeof mappingConfidences)[number];

export const unsupportedReasons = [
  "noTemplateCapability",
  "serviceOnlyPrimitive",
  "futurePrimitive",
  "runtimeUnsupported",
  "unsafe",
  "ambiguous",
  "outOfScope",
  "custom"
] as const;
export type UnsupportedReason = (typeof unsupportedReasons)[number];

export const lossyMappingKinds = [
  "semanticLoss",
  "scaleLoss",
  "behaviorLoss",
  "measurementLoss",
  "causalLoss",
  "unitLoss",
  "socialCognitiveLoss",
  "runtimeLoss",
  "custom"
] as const;
export type LossyMappingKind = (typeof lossyMappingKinds)[number];

export const lossyMappingSeverities = ["info", "warning", "critical"] as const;
export type LossyMappingSeverity = (typeof lossyMappingSeverities)[number];

export interface TemplatePrimitiveMappingCapability {
  primitiveId: PrimitiveId;
  supportLevel: PrimitiveSupportLevel;
  runtimeActive: boolean;
  serviceAvailable: boolean;
  notes?: string;
}

export interface TemplateMappingProfile {
  schemaVersion: "1";
  artifactType: typeof templateMappingProfileArtifactType;
  id: string;
  templateId: string;
  templateName: string;
  templateVersion: string;
  description?: string;
  supportedEntityKinds: readonly ModelEntityKind[];
  supportedEntityTypeIds: readonly string[];
  supportedComponentTypeIds: readonly string[];
  supportedSpaceKinds: readonly ModelSpaceKind[];
  supportedParameterValueKinds: readonly ModelParameterValueKind[];
  supportedParameterIds: readonly string[];
  supportedMetricKinds: readonly ModelMetricKind[];
  supportedMetricIds: readonly string[];
  supportedRuleKinds: readonly ModelRuleKind[];
  supportedBehaviorModeIds: readonly string[];
  supportedArtifactTypes: readonly string[];
  primitiveCapabilities?: readonly TemplatePrimitiveMappingCapability[];
  active: boolean;
  executable: false;
  runtimeActive: false;
  conversionSupported: false;
  generationSupported: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface SchemaConceptMapping {
  id: string;
  schemaElementId: string;
  schemaElementLabel?: string;
  schemaElementKind: SchemaElementKind;
  schemaElementType?: ModelEntityKind | ModelSpaceKind | ModelParameterValueKind | ModelMetricKind | ModelRuleKind | ModelValueKind | string;
  templateConceptId?: string;
  templateConceptLabel?: string;
  templateConceptKind: TemplateConceptKind;
  status: MappingStatus;
  confidence: MappingConfidence;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface UnsupportedSchemaConcept {
  id: string;
  schemaElementId: string;
  schemaElementLabel?: string;
  schemaElementKind: SchemaElementKind;
  schemaElementType?: string;
  reason: UnsupportedReason;
  primitiveId?: PrimitiveId;
  artifactType?: string;
  active: boolean;
  executable: false;
  notes: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface LossyMappingNote {
  id: string;
  schemaElementId: string;
  schemaElementKind: SchemaElementKind;
  lossKind: LossyMappingKind;
  severity: LossyMappingSeverity;
  message: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface TemplateCompatibilityResult {
  id: string;
  templateId: string;
  templateName: string;
  templateVersion: string;
  fit: CompatibilityFit;
  score: number;
  mappedConcepts: readonly SchemaConceptMapping[];
  unsupportedConcepts: readonly UnsupportedSchemaConcept[];
  lossyMappings: readonly LossyMappingNote[];
  requiredRuntimeCapabilities: readonly string[];
  missingTemplateCapabilities: readonly string[];
  warnings: readonly string[];
  runnableNow: false;
  schemaExecutionSupported: false;
  conversionSupported: false;
  generationSupported: false;
  templateRuntimeSupportClaimed: false;
  active: boolean;
  executable: false;
  metadata?: Record<string, JsonValue>;
}

export interface SchemaTemplateCompatibilityReport {
  schemaVersion: "1";
  artifactType: typeof schemaTemplateCompatibilityReportArtifactType;
  id: string;
  modelSchemaId: string;
  modelSchemaName: string;
  modelSchemaVersion: string;
  generatedAtDescription?: string;
  templateResults: readonly TemplateCompatibilityResult[];
  bestTemplateId?: string;
  overallFit: CompatibilityFit;
  requiredRuntimeCapabilities: readonly string[];
  warnings: readonly string[];
  runnableNow: false;
  schemaExecutionAvailable: false;
  conversionAvailable: false;
  generationAvailable: false;
  validationAvailable: false;
  calibrationAvailable: false;
  active: boolean;
  executable: false;
  metadata?: Record<string, JsonValue>;
}

export interface SchemaTemplateCompatibilitySummary {
  reportId: string;
  modelSchemaId: string;
  templateResultCount: number;
  bestTemplateId?: string;
  bestFit: CompatibilityFit;
  mappedConceptCount: number;
  unsupportedConceptCount: number;
  lossyMappingCount: number;
  runnableNow: false;
  warnings: readonly string[];
  requiredRuntimeCapabilities: readonly string[];
}

export interface SchemaTemplateCompatibilityValidationReport {
  reportId: string;
  valid: boolean;
  runnableNow: false;
  schemaExecutionAvailable: false;
  conversionAvailable: false;
  generationAvailable: false;
  validationAvailable: false;
  calibrationAvailable: false;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly string[];
}
