import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const knowledgeMemorySocialLearningArtifactType = "ortus.knowledgeMemorySocialLearningModel";
export const maxKnowledgeSocialModelJsonLength = 260_000;
export const maxKnowledgeSocialMetadataJsonLength = 20_000;
export const maxKnowledgeSocialNoteLength = 1_200;
export const maxKnowledgeSocialNotes = 48;
export const maxKnowledgeSocialDescriptionLength = 2_000;
export const maxKnowledgeSocialDescriptors = 512;
export const maxKnowledgeSocialWarnings = 512;

export const knowledgeItemCategories = [
  "fact",
  "belief",
  "norm",
  "skill",
  "risk",
  "preference",
  "identity",
  "institutionalSignal",
  "socialSignal",
  "custom"
] as const;
export type KnowledgeItemCategory = (typeof knowledgeItemCategories)[number];

export const knowledgeAbstractionLevels = ["individual", "group", "institutional", "population", "field", "custom"] as const;
export type KnowledgeAbstractionLevel = (typeof knowledgeAbstractionLevels)[number];

export const beliefKinds = [
  "binary",
  "continuous",
  "categorical",
  "ordinal",
  "confidence",
  "riskPerception",
  "trust",
  "preference",
  "normEndorsement",
  "custom"
] as const;
export type BeliefKind = (typeof beliefKinds)[number];

export const beliefStateKinds = ["prior", "current", "hypothetical", "aggregate", "distributional", "custom"] as const;
export type BeliefStateKind = (typeof beliefStateKinds)[number];

export const memoryKinds = [
  "recentExposure",
  "reinforcedAssociation",
  "habit",
  "salientEvent",
  "sourceMemory",
  "groupMemory",
  "aggregateMemory",
  "custom"
] as const;
export type MemoryKind = (typeof memoryKinds)[number];

export const attentionKinds = [
  "salience",
  "recency",
  "novelty",
  "threatSensitivity",
  "socialProof",
  "identityRelevance",
  "limitedCapacity",
  "custom"
] as const;
export type AttentionKind = (typeof attentionKinds)[number];

export const trustSourceTypes = [
  "self",
  "friend",
  "family",
  "coworker",
  "peer",
  "stranger",
  "crowd",
  "expert",
  "institution",
  "media",
  "algorithmicFeed",
  "custom"
] as const;
export type TrustSourceType = (typeof trustSourceTypes)[number];

export const exposureChannelKinds = [
  "directInteraction",
  "networkNeighbor",
  "crowdSignal",
  "fieldExposure",
  "institutionalMessage",
  "mediaSignal",
  "observedBehavior",
  "eventDriven",
  "custom"
] as const;
export type ExposureChannelKind = (typeof exposureChannelKinds)[number];

export const socialSignalKinds = [
  "beliefSignal",
  "normSignal",
  "riskSignal",
  "trustSignal",
  "behaviorSignal",
  "consensusSignal",
  "statusSignal",
  "institutionalSignal",
  "custom"
] as const;
export type SocialSignalKind = (typeof socialSignalKinds)[number];

export const learningKinds = [
  "conformity",
  "prestigeBias",
  "expertBias",
  "frequencyBias",
  "recencyBias",
  "confirmationBias",
  "homophily",
  "noveltyBias",
  "socialProof",
  "memoryDecay",
  "trustWeightedUpdate",
  "custom"
] as const;
export type LearningKind = (typeof learningKinds)[number];

export const backgroundKinds = [
  "priorBeliefProfile",
  "trustProfile",
  "educationExposure",
  "communityNorm",
  "familyInfluence",
  "peerInfluence",
  "mediaDiet",
  "institutionalTrust",
  "riskTolerance",
  "groupIdentity",
  "topicFamiliarity",
  "custom"
] as const;
export type BackgroundKind = (typeof backgroundKinds)[number];

export const relationshipRoleKinds = ["friend", "family", "coworker", "peer", "authority", "expert", "institution", "stranger", "crowd", "group", "custom"] as const;
export type RelationshipRoleKind = (typeof relationshipRoleKinds)[number];

export const normKinds = ["descriptiveNorm", "injunctiveNorm", "groupNorm", "institutionalNorm", "localNorm", "populationNorm", "custom"] as const;
export type NormKind = (typeof normKinds)[number];

export const decisionCouplingKinds = [
  "beliefToBehavior",
  "trustToExposureWeight",
  "normToAction",
  "riskToAvoidance",
  "memoryToSalience",
  "attentionToLearning",
  "custom"
] as const;
export type DecisionCouplingKind = (typeof decisionCouplingKinds)[number];

export interface KnowledgeSocialScope {
  templateId?: string;
  scenarioId?: string;
  modelSchemaId?: string;
  observabilityModelId?: string;
  causalAssumptionModelId?: string;
  quantitySemanticsModelId?: string;
  uncertaintyConfigId?: string;
  networkDefinitionId?: string;
  feedbackLoopModelId?: string;
  controlStrategyModelId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface KnowledgeItem {
  id: string;
  label: string;
  topic?: string;
  category: KnowledgeItemCategory;
  abstractionLevel: KnowledgeAbstractionLevel;
  description?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface BeliefVariable {
  id: string;
  label: string;
  beliefKind: BeliefKind;
  knowledgeItemIds?: readonly string[];
  valueDescription?: string;
  quantityId?: string;
  unitId?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface BeliefStateDescriptor {
  id: string;
  label: string;
  beliefVariableId: string;
  stateKind: BeliefStateKind;
  valueDescription?: string;
  confidenceDescription?: string;
  salienceDescription?: string;
  uncertaintyDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface MemoryTraceDescriptor {
  id: string;
  label: string;
  memoryKind: MemoryKind;
  knowledgeItemIds?: readonly string[];
  beliefVariableIds?: readonly string[];
  boundedCapacityDescription?: string;
  decayDescription?: string;
  salienceDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface AttentionProfile {
  id: string;
  label: string;
  attentionKind: AttentionKind;
  capacityDescription?: string;
  salienceDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface TrustProfile {
  id: string;
  label: string;
  sourceType: TrustSourceType;
  trustDescription?: string;
  credibilityDescription?: string;
  uncertaintyDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ExposureChannel {
  id: string;
  label: string;
  channelKind: ExposureChannelKind;
  sourceProfileIds?: readonly string[];
  targetDescription?: string;
  frequencyDescription?: string;
  strengthDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface SocialSignalDescriptor {
  id: string;
  label: string;
  signalKind: SocialSignalKind;
  knowledgeItemIds?: readonly string[];
  beliefVariableIds?: readonly string[];
  sourceProfileId?: string;
  exposureChannelId?: string;
  intensityDescription?: string;
  perceivedConsensusDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface LearningRuleDescriptor {
  id: string;
  label: string;
  learningKind: LearningKind;
  beliefVariableIds?: readonly string[];
  knowledgeItemIds?: readonly string[];
  trustProfileIds?: readonly string[];
  exposureChannelIds?: readonly string[];
  ruleDescription: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface BackgroundProfile {
  id: string;
  label: string;
  backgroundKind: BackgroundKind;
  priorDescription?: string;
  distributionDescription?: string;
  groupDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface RelationshipRole {
  id: string;
  label: string;
  roleKind: RelationshipRoleKind;
  trustProfileIds?: readonly string[];
  influenceDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface NormDescriptor {
  id: string;
  label: string;
  normKind: NormKind;
  knowledgeItemIds?: readonly string[];
  beliefVariableIds?: readonly string[];
  scopeDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface DecisionCouplingDescriptor {
  id: string;
  label: string;
  couplingKind: DecisionCouplingKind;
  sourceIds?: readonly string[];
  targetDescription: string;
  couplingDescription: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface KnowledgeMemorySocialLearningModel {
  schemaVersion: "1";
  artifactType: typeof knowledgeMemorySocialLearningArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scope?: KnowledgeSocialScope;
  knowledgeItems: readonly KnowledgeItem[];
  beliefVariables?: readonly BeliefVariable[];
  beliefStateDescriptors?: readonly BeliefStateDescriptor[];
  memoryTraceDescriptors?: readonly MemoryTraceDescriptor[];
  attentionProfiles?: readonly AttentionProfile[];
  trustProfiles?: readonly TrustProfile[];
  exposureChannels?: readonly ExposureChannel[];
  socialSignals?: readonly SocialSignalDescriptor[];
  learningRuleDescriptors?: readonly LearningRuleDescriptor[];
  backgroundProfiles?: readonly BackgroundProfile[];
  relationshipRoles?: readonly RelationshipRole[];
  normDescriptors?: readonly NormDescriptor[];
  decisionCouplings?: readonly DecisionCouplingDescriptor[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  ethicsNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface KnowledgeMemorySocialLearningSummary {
  id: string;
  name: string;
  knowledgeItemCount: number;
  beliefVariableCount: number;
  beliefStateDescriptorCount: number;
  memoryTraceDescriptorCount: number;
  attentionProfileCount: number;
  trustProfileCount: number;
  exposureChannelCount: number;
  socialSignalCount: number;
  learningRuleDescriptorCount: number;
  backgroundProfileCount: number;
  relationshipRoleCount: number;
  normDescriptorCount: number;
  decisionCouplingCount: number;
  activeDescriptorCount: number;
  executableCount: number;
  warnings: readonly string[];
}

export interface KnowledgeMemorySocialLearningValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: false;
  socialLearningRuntimeAvailable: false;
  humanCognitionRuntimeAvailable: false;
  llmAgentRuntimeAvailable: false;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly string[];
}

export interface KnowledgeMemorySocialLearningMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}
