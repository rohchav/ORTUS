import { validateKnowledgeMemorySocialLearningModel } from "./validation";
import type {
  AttentionProfile,
  BackgroundProfile,
  BeliefStateDescriptor,
  BeliefVariable,
  DecisionCouplingDescriptor,
  ExposureChannel,
  KnowledgeAbstractionLevel,
  KnowledgeItem,
  KnowledgeItemCategory,
  KnowledgeMemorySocialLearningModel,
  LearningKind,
  LearningRuleDescriptor,
  MemoryTraceDescriptor,
  NormDescriptor,
  RelationshipRole,
  SocialSignalDescriptor,
  TrustProfile,
  TrustSourceType
} from "./types";

export function listKnowledgeItems(model: KnowledgeMemorySocialLearningModel): readonly KnowledgeItem[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).knowledgeItems);
}

export function getKnowledgeItem(model: KnowledgeMemorySocialLearningModel, id: string): KnowledgeItem | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).knowledgeItems.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listKnowledgeItemsByCategory(model: KnowledgeMemorySocialLearningModel, category: KnowledgeItemCategory): readonly KnowledgeItem[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).knowledgeItems.filter((item) => item.category === category));
}

export function listKnowledgeItemsByAbstractionLevel(
  model: KnowledgeMemorySocialLearningModel,
  abstractionLevel: KnowledgeAbstractionLevel
): readonly KnowledgeItem[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).knowledgeItems.filter((item) => item.abstractionLevel === abstractionLevel));
}

export function listBeliefVariables(model: KnowledgeMemorySocialLearningModel): readonly BeliefVariable[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).beliefVariables ?? []);
}

export function getBeliefVariable(model: KnowledgeMemorySocialLearningModel, id: string): BeliefVariable | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).beliefVariables?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listBeliefStates(model: KnowledgeMemorySocialLearningModel): readonly BeliefStateDescriptor[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).beliefStateDescriptors ?? []);
}

export function getBeliefStateDescriptor(model: KnowledgeMemorySocialLearningModel, id: string): BeliefStateDescriptor | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).beliefStateDescriptors?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listMemoryTraceDescriptors(model: KnowledgeMemorySocialLearningModel): readonly MemoryTraceDescriptor[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).memoryTraceDescriptors ?? []);
}

export function getMemoryTraceDescriptor(model: KnowledgeMemorySocialLearningModel, id: string): MemoryTraceDescriptor | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).memoryTraceDescriptors?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listAttentionProfiles(model: KnowledgeMemorySocialLearningModel): readonly AttentionProfile[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).attentionProfiles ?? []);
}

export function getAttentionProfile(model: KnowledgeMemorySocialLearningModel, id: string): AttentionProfile | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).attentionProfiles?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listTrustProfiles(model: KnowledgeMemorySocialLearningModel): readonly TrustProfile[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).trustProfiles ?? []);
}

export function getTrustProfile(model: KnowledgeMemorySocialLearningModel, id: string): TrustProfile | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).trustProfiles?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listTrustProfilesBySourceType(model: KnowledgeMemorySocialLearningModel, sourceType: TrustSourceType): readonly TrustProfile[] {
  return clone((validateKnowledgeMemorySocialLearningModel(model).trustProfiles ?? []).filter((item) => item.sourceType === sourceType));
}

export function listExposureChannels(model: KnowledgeMemorySocialLearningModel): readonly ExposureChannel[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).exposureChannels ?? []);
}

export function getExposureChannel(model: KnowledgeMemorySocialLearningModel, id: string): ExposureChannel | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).exposureChannels?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listSocialSignals(model: KnowledgeMemorySocialLearningModel): readonly SocialSignalDescriptor[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).socialSignals ?? []);
}

export function getSocialSignal(model: KnowledgeMemorySocialLearningModel, id: string): SocialSignalDescriptor | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).socialSignals?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listLearningRuleDescriptors(model: KnowledgeMemorySocialLearningModel): readonly LearningRuleDescriptor[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).learningRuleDescriptors ?? []);
}

export function getLearningRuleDescriptor(model: KnowledgeMemorySocialLearningModel, id: string): LearningRuleDescriptor | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).learningRuleDescriptors?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listLearningRulesByKind(model: KnowledgeMemorySocialLearningModel, learningKind: LearningKind): readonly LearningRuleDescriptor[] {
  return clone((validateKnowledgeMemorySocialLearningModel(model).learningRuleDescriptors ?? []).filter((item) => item.learningKind === learningKind));
}

export function listBackgroundProfiles(model: KnowledgeMemorySocialLearningModel): readonly BackgroundProfile[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).backgroundProfiles ?? []);
}

export function getBackgroundProfile(model: KnowledgeMemorySocialLearningModel, id: string): BackgroundProfile | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).backgroundProfiles?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listRelationshipRoles(model: KnowledgeMemorySocialLearningModel): readonly RelationshipRole[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).relationshipRoles ?? []);
}

export function getRelationshipRole(model: KnowledgeMemorySocialLearningModel, id: string): RelationshipRole | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).relationshipRoles?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listNormDescriptors(model: KnowledgeMemorySocialLearningModel): readonly NormDescriptor[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).normDescriptors ?? []);
}

export function getNormDescriptor(model: KnowledgeMemorySocialLearningModel, id: string): NormDescriptor | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).normDescriptors?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function listDecisionCouplings(model: KnowledgeMemorySocialLearningModel): readonly DecisionCouplingDescriptor[] {
  return clone(validateKnowledgeMemorySocialLearningModel(model).decisionCouplings ?? []);
}

export function getDecisionCoupling(model: KnowledgeMemorySocialLearningModel, id: string): DecisionCouplingDescriptor | undefined {
  const item = validateKnowledgeMemorySocialLearningModel(model).decisionCouplings?.find((candidate) => candidate.id === id);
  return item ? clone(item) : undefined;
}

export function modelHasLearningKind(model: KnowledgeMemorySocialLearningModel, learningKind: LearningKind): boolean {
  return (validateKnowledgeMemorySocialLearningModel(model).learningRuleDescriptors ?? []).some((item) => item.learningKind === learningKind);
}

export function modelHasSourceType(model: KnowledgeMemorySocialLearningModel, sourceType: TrustSourceType): boolean {
  return (validateKnowledgeMemorySocialLearningModel(model).trustProfiles ?? []).some((item) => item.sourceType === sourceType);
}

export function modelUsesCrowdOrStrangerAbstraction(model: KnowledgeMemorySocialLearningModel): boolean {
  const valid = validateKnowledgeMemorySocialLearningModel(model);
  return (
    (valid.trustProfiles ?? []).some((item) => item.sourceType === "crowd" || item.sourceType === "stranger") ||
    (valid.relationshipRoles ?? []).some((item) => item.roleKind === "crowd" || item.roleKind === "stranger") ||
    (valid.exposureChannels ?? []).some((item) => item.channelKind === "crowdSignal" || item.channelKind === "fieldExposure") ||
    valid.knowledgeItems.some((item) => item.abstractionLevel === "population" || item.abstractionLevel === "field")
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
