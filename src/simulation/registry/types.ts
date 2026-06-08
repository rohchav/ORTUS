export const primitiveCapabilityStatuses = ["implemented", "serviceOnly", "metadataOnly", "reserved", "unsupported", "deprecated"] as const;
export type PrimitiveCapabilityStatus = (typeof primitiveCapabilityStatuses)[number];

export const primitiveSupportLevels = ["runtime", "service", "metadata", "documentation", "none"] as const;
export type PrimitiveSupportLevel = (typeof primitiveSupportLevels)[number];

export const primitiveIds = [
  "scenarios",
  "snapshots",
  "behaviorModes",
  "agentComposition",
  "uncertainty",
  "assumptions",
  "networks",
  "resources",
  "feedbackEvents",
  "hybridComposition",
  "multiScale",
  "scaleAwareViews",
  "boundariesEnvironment",
  "spatialFields",
  "temporalScale",
  "observability",
  "causalAssumptions",
  "emergenceDetection",
  "phaseTransitions",
  "attractorsBasins",
  "robustnessResilience",
  "adaptiveAgents",
  "heterogeneity",
  "explainabilityTrace",
  "errorBudgets",
  "unitsDimensionalConsistency",
  "modelSchema",
  "knowledgeMemorySocialLearning",
  "visualBuilderWorkspace",
  "schemaTemplateCompatibility",
  "modelDefinitionSchema",
  "rulePrimitiveLibrary",
  "socialLearningRuntime",
  "safeInterpreterCompiler",
  "visualModelBuilder",
  "customModelRuntime",
  "llmAgents",
  "humanModelCritique",
  "patternLibraries",
  "domainPacks",
  "validationCalibration",
  "interventionStrategy",
  "externalFrameworkInterop",
  "performanceScale",
  "securityProjectHardening",
  "productization"
] as const;

export type PrimitiveId = (typeof primitiveIds)[number];

export interface SystemsPrimitiveEntry {
  id: PrimitiveId;
  label: string;
  description: string;
  status: PrimitiveCapabilityStatus;
  supportLevel: PrimitiveSupportLevel;
  currentScope: string;
  futureScope: string;
  limitations: readonly string[];
  docsRefs: readonly string[];
  artifactTypes: readonly string[];
  relatedPrimitives: readonly PrimitiveId[];
  mustNotClaimYet: readonly string[];
  promptIntroduced?: string;
  promptAudit?: string;
}

export interface ArtifactFamilyEntry {
  id: string;
  artifactType: string;
  primitiveId: PrimitiveId;
  implemented: boolean;
  importSupported: boolean;
  exportSupported: boolean;
  serviceOnly: boolean;
  description: string;
  mustRejectAsOtherArtifactWhereApplicable?: readonly string[];
}

export interface TemplatePrimitiveCapability {
  templateId: string;
  primitiveId: PrimitiveId;
  status: PrimitiveCapabilityStatus;
  supportLevel: PrimitiveSupportLevel;
  runtimeActive: boolean;
  serviceAvailable: boolean;
  metadataAvailable: boolean;
  notes?: string;
  limitations?: readonly string[];
}

export interface ListTemplatesSupportingPrimitiveOptions {
  runtimeOnly?: boolean;
  includeServiceOnly?: boolean;
  includeMetadataOnly?: boolean;
  includeUnsupportedWithGlobalService?: boolean;
}

export interface RoadmapPrimitivePhase {
  prompt: string;
  label: string;
  primitiveIds: readonly PrimitiveId[];
}
