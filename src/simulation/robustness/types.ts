import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const robustnessResilienceModelArtifactType = "ortus.robustnessResilienceModel";
export const maxRobustnessResilienceModelJsonLength = 220_000;
export const maxRobustnessResilienceMetadataJsonLength = 20_000;
export const maxRobustnessResilienceNoteLength = 1_200;
export const maxRobustnessResilienceNotes = 48;
export const maxRobustnessDescriptors = 512;
export const maxStressors = 512;
export const maxResponseCriteria = 512;
export const maxFailureModes = 512;
export const maxStressTestPlans = 512;
export const maxRobustnessWarnings = 512;

export const robustnessKinds = [
  "robustness",
  "resilience",
  "stability",
  "fragility",
  "adaptability",
  "recoverability",
  "redundancy",
  "gracefulDegradation",
  "faultTolerance",
  "shockAbsorption",
  "sensitivity",
  "custom"
] as const;
export type RobustnessKind = (typeof robustnessKinds)[number];

export const robustnessDescriptorStatuses = [
  "candidate",
  "hypothesized",
  "plannedTest",
  "observedInModelOutput",
  "internallyTested",
  "externallyValidated",
  "rejected",
  "unknown"
] as const;
export type RobustnessDescriptorStatus = (typeof robustnessDescriptorStatuses)[number];

export const stressorKinds = [
  "parameterPerturbation",
  "stateShock",
  "agentRemoval",
  "edgeRemoval",
  "resourceShock",
  "boundaryShock",
  "fieldShock",
  "delayShock",
  "feedbackGainChange",
  "noiseIncrease",
  "scenarioChange",
  "uncertaintyEnsemble",
  "intervention",
  "custom"
] as const;
export type StressorKind = (typeof stressorKinds)[number];

export const responseCriterionKinds = [
  "threshold",
  "recoveryTime",
  "returnToBaseline",
  "boundedDeviation",
  "persistence",
  "survival",
  "serviceLevel",
  "metricStability",
  "varianceBound",
  "custom"
] as const;
export type ResponseCriterionKind = (typeof responseCriterionKinds)[number];

export const failureKinds = [
  "collapse",
  "runawayGrowth",
  "extinction",
  "fragmentation",
  "lockIn",
  "oscillation",
  "resourceDepletion",
  "cascade",
  "phaseTransition",
  "lossOfDiversity",
  "lossOfConnectivity",
  "custom"
] as const;
export type FailureKind = (typeof failureKinds)[number];

export const stressTestPlanKinds = [
  "singlePerturbation",
  "parameterSweep",
  "ensemble",
  "scenarioComparison",
  "shockSequence",
  "boundaryConditionTest",
  "resourceStressTest",
  "networkStressTest",
  "delayFeedbackStressTest",
  "custom"
] as const;
export type StressTestPlanKind = (typeof stressTestPlanKinds)[number];

export interface RobustnessScope {
  templateId?: string;
  scenarioId?: string;
  runConfigId?: string;
  uncertaintyConfigId?: string;
  uncertaintyResultId?: string;
  emergencePatternModelId?: string;
  boundaryModelId?: string;
  resourceSystemId?: string;
  feedbackLoopModelId?: string;
  scaleModelId?: string;
  quantitySemanticsModelId?: string;
  observabilityModelId?: string;
  causalAssumptionModelId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface RobustnessDescriptor {
  id: string;
  label: string;
  robustnessKind: RobustnessKind;
  status: RobustnessDescriptorStatus;
  targetDescription?: string;
  stressorIds?: readonly string[];
  responseCriterionIds?: readonly string[];
  failureModeIds?: readonly string[];
  stressTestPlanIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface StressorDefinition {
  id: string;
  label: string;
  stressorKind: StressorKind;
  targetPath?: string;
  targetDescription?: string;
  magnitudeDescription?: string;
  durationDescription?: string;
  timingDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ResponseCriterion {
  id: string;
  label: string;
  criterionKind: ResponseCriterionKind;
  metricId?: string;
  quantityId?: string;
  thresholdDescription?: string;
  timeWindowId?: string;
  successDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface FailureMode {
  id: string;
  label: string;
  failureKind: FailureKind;
  triggerDescription?: string;
  consequenceDescription?: string;
  recoveryDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface StressTestPlan {
  id: string;
  label: string;
  planKind: StressTestPlanKind;
  stressorIds?: readonly string[];
  responseCriterionIds?: readonly string[];
  scenarioIds?: readonly string[];
  uncertaintyConfigId?: string;
  timeWindowDescription?: string;
  replicationDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface RobustnessResilienceModel {
  schemaVersion: "1";
  artifactType: typeof robustnessResilienceModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scope?: RobustnessScope;
  descriptors: readonly RobustnessDescriptor[];
  stressors?: readonly StressorDefinition[];
  responseCriteria?: readonly ResponseCriterion[];
  failureModes?: readonly FailureMode[];
  stressTestPlans?: readonly StressTestPlan[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface RobustnessResilienceMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface RobustnessResilienceValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly RobustnessResilienceMissingCapability[];
}

export interface RobustnessResilienceSummary {
  id: string;
  name: string;
  descriptorCount: number;
  activeDescriptorCount: number;
  stressorCount: number;
  activeStressorCount: number;
  responseCriterionCount: number;
  failureModeCount: number;
  stressTestPlanCount: number;
  candidateCount: number;
  plannedTestCount: number;
  observedInModelOutputCount: number;
  internallyTestedCount: number;
  externallyValidatedCount: number;
  rejectedCount: number;
  executableCount: number;
  warnings: readonly string[];
}
