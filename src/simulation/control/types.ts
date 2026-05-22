import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const controlStrategyModelArtifactType = "ortus.controlStrategyModel";
export const maxControlStrategyModelJsonLength = 220_000;
export const maxControlStrategyMetadataJsonLength = 20_000;
export const maxControlStrategyNoteLength = 1_200;
export const maxControlStrategyNotes = 48;
export const maxStrategies = 512;
export const maxInterventionOptions = 512;
export const maxTriggerConditions = 512;
export const maxObjectives = 512;
export const maxConstraints = 512;
export const maxPolicyRules = 512;
export const maxStoppingRules = 512;
export const maxExpectedEffects = 512;
export const maxControlWarnings = 512;

export const strategyKinds = [
  "intervention",
  "policy",
  "feedbackControl",
  "openLoopControl",
  "closedLoopControl",
  "adaptiveStrategy",
  "mitigation",
  "suppression",
  "amplification",
  "resourceAllocation",
  "networkRewiring",
  "boundaryManagement",
  "custom"
] as const;
export type StrategyKind = (typeof strategyKinds)[number];

export const strategyStatuses = [
  "candidate",
  "hypothesized",
  "planned",
  "observedInModelOutput",
  "internallyTested",
  "externallyValidated",
  "rejected",
  "unknown"
] as const;
export type StrategyStatus = (typeof strategyStatuses)[number];

export const controlInterventionKinds = [
  "parameterChange",
  "stateChange",
  "agentAddition",
  "agentRemoval",
  "edgeAddition",
  "edgeRemoval",
  "resourceTransfer",
  "boundaryChange",
  "fieldChange",
  "delayChange",
  "feedbackGainChange",
  "templateInterventionReference",
  "custom"
] as const;
export type ControlInterventionKind = (typeof controlInterventionKinds)[number];

export const triggerKinds = [
  "threshold",
  "time",
  "event",
  "metricCondition",
  "observationCondition",
  "resourceCondition",
  "networkCondition",
  "emergencePatternCondition",
  "robustnessCondition",
  "custom"
] as const;
export type TriggerKind = (typeof triggerKinds)[number];

export const objectiveKinds = ["minimize", "maximize", "stabilize", "maintainWithinBounds", "delay", "accelerate", "avoid", "recover", "custom"] as const;
export type ObjectiveKind = (typeof objectiveKinds)[number];

export const constraintKinds = ["budget", "capacity", "safety", "ethical", "resource", "timing", "fairness", "boundary", "technical", "custom"] as const;
export type ConstraintKind = (typeof constraintKinds)[number];

export const policyKinds = ["ifThen", "schedule", "priorityRule", "feedbackRule", "allocationRule", "thresholdRule", "custom"] as const;
export type PolicyKind = (typeof policyKinds)[number];

export const stoppingKinds = ["timeLimit", "thresholdReached", "resourceLimit", "riskLimit", "convergence", "manual", "custom"] as const;
export type StoppingKind = (typeof stoppingKinds)[number];

export const effectKinds = ["increase", "decrease", "stabilize", "destabilize", "delay", "accelerate", "redistribute", "prevent", "recover", "unknown", "custom"] as const;
export type EffectKind = (typeof effectKinds)[number];

export interface ControlScope {
  templateId?: string;
  scenarioId?: string;
  runConfigId?: string;
  uncertaintyConfigId?: string;
  uncertaintyResultId?: string;
  robustnessResilienceModelId?: string;
  emergencePatternModelId?: string;
  causalAssumptionModelId?: string;
  observabilityModelId?: string;
  resourceSystemId?: string;
  feedbackLoopModelId?: string;
  networkDefinitionId?: string;
  quantitySemanticsModelId?: string;
  boundaryModelId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface StrategyDescriptor {
  id: string;
  label: string;
  strategyKind: StrategyKind;
  status: StrategyStatus;
  targetDescription?: string;
  interventionIds?: readonly string[];
  triggerIds?: readonly string[];
  objectiveIds?: readonly string[];
  constraintIds?: readonly string[];
  policyIds?: readonly string[];
  stoppingRuleIds?: readonly string[];
  expectedEffectIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface InterventionOption {
  id: string;
  label: string;
  interventionKind: ControlInterventionKind;
  targetPath?: string;
  targetDescription?: string;
  templateInterventionId?: string;
  magnitudeDescription?: string;
  timingDescription?: string;
  durationDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface TriggerCondition {
  id: string;
  label: string;
  triggerKind: TriggerKind;
  conditionDescription: string;
  metricId?: string;
  observationId?: string;
  quantityId?: string;
  eventType?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ObjectiveDefinition {
  id: string;
  label: string;
  objectiveKind: ObjectiveKind;
  targetDescription: string;
  metricId?: string;
  quantityId?: string;
  priorityDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ConstraintDefinition {
  id: string;
  label: string;
  constraintKind: ConstraintKind;
  constraintDescription: string;
  hardConstraint?: boolean;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface PolicyRule {
  id: string;
  label: string;
  policyKind: PolicyKind;
  ruleDescription: string;
  triggerIds?: readonly string[];
  interventionIds?: readonly string[];
  constraintIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface StoppingRule {
  id: string;
  label: string;
  stoppingKind: StoppingKind;
  ruleDescription: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ExpectedEffect {
  id: string;
  label: string;
  effectKind: EffectKind;
  affectedTargetDescription: string;
  evidenceDescription?: string;
  uncertaintyDescription?: string;
  riskDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ControlStrategyModel {
  schemaVersion: "1";
  artifactType: typeof controlStrategyModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scope?: ControlScope;
  strategies: readonly StrategyDescriptor[];
  interventions?: readonly InterventionOption[];
  triggers?: readonly TriggerCondition[];
  objectives?: readonly ObjectiveDefinition[];
  constraints?: readonly ConstraintDefinition[];
  policies?: readonly PolicyRule[];
  stoppingRules?: readonly StoppingRule[];
  expectedEffects?: readonly ExpectedEffect[];
  riskNotes?: readonly AssumptionItem[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface ControlStrategyMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface ControlStrategyValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly ControlStrategyMissingCapability[];
}

export interface ControlStrategySummary {
  id: string;
  name: string;
  strategyCount: number;
  activeStrategyCount: number;
  interventionCount: number;
  activeInterventionCount: number;
  triggerCount: number;
  objectiveCount: number;
  constraintCount: number;
  policyCount: number;
  stoppingRuleCount: number;
  expectedEffectCount: number;
  candidateCount: number;
  plannedCount: number;
  observedInModelOutputCount: number;
  internallyTestedCount: number;
  externallyValidatedCount: number;
  rejectedCount: number;
  executableCount: number;
  warnings: readonly string[];
}
