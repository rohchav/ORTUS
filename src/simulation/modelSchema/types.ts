import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const modelSchemaArtifactType = "ortus.modelSchema";
export const maxModelSchemaJsonLength = 260_000;
export const maxModelSchemaMetadataJsonLength = 20_000;
export const maxModelSchemaNoteLength = 1_200;
export const maxModelSchemaNotes = 48;
export const maxModelSchemaDescriptionLength = 2_000;
export const maxModelSchemaDeclarations = 512;
export const maxModelSchemaArtifactReferences = 256;
export const maxModelSchemaWarnings = 256;

export const modelEntityKinds = [
  "agent",
  "cell",
  "node",
  "edge",
  "resourceStock",
  "event",
  "fieldSample",
  "aggregate",
  "environment",
  "observer",
  "custom"
] as const;
export type ModelEntityKind = (typeof modelEntityKinds)[number];

export const modelComponentKinds = ["state", "behavior", "position", "velocity", "identity", "memory", "resource", "health", "belief", "group", "custom"] as const;
export type ModelComponentKind = (typeof modelComponentKinds)[number];

export const modelValueKinds = [
  "number",
  "integer",
  "boolean",
  "string",
  "category",
  "vector2",
  "vector3",
  "distributionReference",
  "quantityReference",
  "custom"
] as const;
export type ModelValueKind = (typeof modelValueKinds)[number];

export const modelSpaceKinds = ["continuous2d", "continuous3d", "grid2d", "network", "field", "multiscale", "abstract", "custom"] as const;
export type ModelSpaceKind = (typeof modelSpaceKinds)[number];

export const modelParameterValueKinds = ["number", "integer", "boolean", "category", "string", "seed", "distributionReference", "custom"] as const;
export type ModelParameterValueKind = (typeof modelParameterValueKinds)[number];

export const modelMetricKinds = [
  "count",
  "fraction",
  "mean",
  "sum",
  "rate",
  "distribution",
  "networkMetric",
  "resourceMetric",
  "fieldMetric",
  "emergenceIndicator",
  "robustnessIndicator",
  "controlIndicator",
  "custom"
] as const;
export type ModelMetricKind = (typeof modelMetricKinds)[number];

export const modelRuleKinds = [
  "agentBehavior",
  "stateTransition",
  "interaction",
  "movement",
  "networkUpdate",
  "resourceFlow",
  "eventEmission",
  "feedbackAdjustment",
  "observation",
  "controlPolicy",
  "aggregation",
  "disaggregation",
  "socialLearning",
  "memoryUpdate",
  "beliefUpdate",
  "custom"
] as const;
export type ModelRuleKind = (typeof modelRuleKinds)[number];

export const modelArtifactReferenceRoles = [
  "context",
  "constraint",
  "input",
  "output",
  "assumption",
  "measurement",
  "validationTarget",
  "futureRuntimeDependency",
  "custom"
] as const;
export type ModelArtifactReferenceRole = (typeof modelArtifactReferenceRoles)[number];

export interface ModelSchemaScope {
  templateId?: string;
  scenarioId?: string;
  runConfigId?: string;
  hybridCompositionId?: string;
  networkDefinitionId?: string;
  resourceSystemId?: string;
  eventScheduleId?: string;
  delayQueueId?: string;
  feedbackLoopModelId?: string;
  scaleModelId?: string;
  scaleViewStateId?: string;
  boundaryModelId?: string;
  fieldLayerId?: string;
  observabilityModelId?: string;
  causalAssumptionModelId?: string;
  quantitySemanticsModelId?: string;
  emergencePatternModelId?: string;
  robustnessResilienceModelId?: string;
  controlStrategyModelId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface EntityTypeDeclaration {
  id: string;
  label: string;
  entityKind: ModelEntityKind;
  description?: string;
  componentTypeIds?: readonly string[];
  attributeTypeIds?: readonly string[];
  spaceIds?: readonly string[];
  relationTypeIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ComponentTypeDeclaration {
  id: string;
  label: string;
  componentKind: ModelComponentKind;
  attributeTypeIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface AttributeTypeDeclaration {
  id: string;
  label: string;
  valueKind: ModelValueKind;
  defaultValueDescription?: string;
  allowedValues?: readonly JsonValue[];
  quantityId?: string;
  unitId?: string;
  dimensionId?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface SpaceDeclaration {
  id: string;
  label: string;
  spaceKind: ModelSpaceKind;
  boundaryModelId?: string;
  fieldLayerId?: string;
  networkDefinitionId?: string;
  scaleModelId?: string;
  coordinateDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ParameterDeclaration {
  id: string;
  label: string;
  valueKind: ModelParameterValueKind;
  defaultValueDescription?: string;
  rangeDescription?: string;
  quantityId?: string;
  unitId?: string;
  uncertaintyVariableId?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface MetricDeclaration {
  id: string;
  label: string;
  metricKind: ModelMetricKind;
  quantityId?: string;
  unitId?: string;
  sourceDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface RuleDeclaration {
  id: string;
  label: string;
  ruleKind: ModelRuleKind;
  sourceEntityTypeIds?: readonly string[];
  targetEntityTypeIds?: readonly string[];
  parameterIds?: readonly string[];
  metricIds?: readonly string[];
  referencedArtifactIds?: readonly string[];
  ruleDescription: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ModelArtifactReference {
  id: string;
  label: string;
  artifactType: string;
  artifactId: string;
  primitiveId?: PrimitiveId;
  role: ModelArtifactReferenceRole;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ModelSchemaDefinition {
  artifactType: typeof modelSchemaArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  schemaVersion: "1";
  scope?: ModelSchemaScope;
  entityTypes: readonly EntityTypeDeclaration[];
  componentTypes?: readonly ComponentTypeDeclaration[];
  attributeTypes?: readonly AttributeTypeDeclaration[];
  spaces?: readonly SpaceDeclaration[];
  parameters?: readonly ParameterDeclaration[];
  metrics?: readonly MetricDeclaration[];
  ruleDeclarations?: readonly RuleDeclaration[];
  artifactReferences?: readonly ModelArtifactReference[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface ModelSchemaSummary {
  id: string;
  name: string;
  entityTypeCount: number;
  componentTypeCount: number;
  attributeTypeCount: number;
  spaceCount: number;
  parameterCount: number;
  metricCount: number;
  ruleDeclarationCount: number;
  artifactReferenceCount: number;
  activeEntityTypeCount: number;
  activeRuleDeclarationCount: number;
  executableCount: number;
  warnings: readonly string[];
}

export interface ModelInterpreterCapabilityReport {
  modelId: string;
  valid: boolean;
  runnableNow: false;
  interpreterAvailable: false;
  executableRuleCount: number;
  unsupportedRuleKinds: readonly ModelRuleKind[];
  missingRuntimeCapabilities: readonly string[];
  warnings: readonly string[];
  errors: readonly string[];
}
