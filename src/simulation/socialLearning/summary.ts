import { modelUsesCrowdOrStrangerAbstraction } from "./query";
import { validateKnowledgeMemorySocialLearningModel } from "./validation";
import { maxKnowledgeSocialWarnings, type KnowledgeMemorySocialLearningModel, type KnowledgeMemorySocialLearningSummary } from "./types";

export function summarizeKnowledgeMemorySocialLearningModel(model: KnowledgeMemorySocialLearningModel): KnowledgeMemorySocialLearningSummary {
  const valid = validateKnowledgeMemorySocialLearningModel(model);
  return {
    id: valid.id,
    name: valid.name,
    knowledgeItemCount: valid.knowledgeItems.length,
    beliefVariableCount: (valid.beliefVariables ?? []).length,
    beliefStateDescriptorCount: (valid.beliefStateDescriptors ?? []).length,
    memoryTraceDescriptorCount: (valid.memoryTraceDescriptors ?? []).length,
    attentionProfileCount: (valid.attentionProfiles ?? []).length,
    trustProfileCount: (valid.trustProfiles ?? []).length,
    exposureChannelCount: (valid.exposureChannels ?? []).length,
    socialSignalCount: (valid.socialSignals ?? []).length,
    learningRuleDescriptorCount: (valid.learningRuleDescriptors ?? []).length,
    backgroundProfileCount: (valid.backgroundProfiles ?? []).length,
    relationshipRoleCount: (valid.relationshipRoles ?? []).length,
    normDescriptorCount: (valid.normDescriptors ?? []).length,
    decisionCouplingCount: (valid.decisionCouplings ?? []).length,
    activeDescriptorCount: countActiveDescriptors(valid),
    executableCount: 0,
    warnings: getKnowledgeMemorySocialLearningWarnings(valid)
  };
}

export function getKnowledgeMemorySocialLearningWarnings(model: KnowledgeMemorySocialLearningModel): readonly string[] {
  const valid = validateKnowledgeMemorySocialLearningModel(model);
  const warnings: string[] = [
    "Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition.",
    "No social-learning runtime exists in V1; descriptors are not executed.",
    "No human cognition runtime exists in V1.",
    "No LLM-agent runtime exists in V1. LLM-per-agent runtime is not implemented and must not be implied.",
    "No psychological validity is implied by a valid descriptor model.",
    "No empirical validation is implied by a valid descriptor model.",
    "No prediction of real people is implied by a valid descriptor model.",
    "No protected-class inference is supported.",
    "No real-person profiling is supported.",
    "No persuasion or microtargeting runtime is supported.",
    "Valid descriptor models are not ethical approval, policy guidance, treatment-effect evidence, safety certification, or operational readiness."
  ];

  if (countActiveDescriptors(valid) > 0) {
    warnings.push("Active descriptors are structurally active only; active does not mean runtime-executed.");
  }
  if (valid.knowledgeItems.length > 0) {
    warnings.push("Knowledge items are bounded symbolic descriptors, not human understanding.");
  }
  if ((valid.beliefVariables ?? []).length > 0) {
    warnings.push("Belief variables are model variables, not measured human beliefs.");
  }
  if ((valid.beliefStateDescriptors ?? []).length > 0) {
    warnings.push("Belief-state descriptors are descriptors, not inferred mental states.");
  }
  if ((valid.memoryTraceDescriptors ?? []).length > 0) {
    warnings.push("Memory traces are bounded descriptors, not autobiographical memory.");
  }
  if ((valid.attentionProfiles ?? []).length > 0) {
    warnings.push("Attention and salience profiles do not implement attention.");
  }
  if ((valid.trustProfiles ?? []).length > 0) {
    warnings.push("Trust profiles describe source assumptions; they do not validate source credibility.");
  }
  if ((valid.exposureChannels ?? []).length > 0) {
    warnings.push("Exposure channels do not sample social exposure at runtime.");
  }
  if ((valid.socialSignals ?? []).length > 0) {
    warnings.push("Social signals are descriptors; they are not emitted at runtime.");
  }
  if ((valid.learningRuleDescriptors ?? []).length > 0) {
    warnings.push("Social learning rule descriptors are descriptive metadata and are not executed.");
  }
  if ((valid.backgroundProfiles ?? []).length > 0) {
    warnings.push("Background profiles are compressed prior descriptors, not simulated life histories.");
  }
  if ((valid.relationshipRoles ?? []).length > 0) {
    warnings.push("Relationship roles are abstractions, not real relationships.");
  }
  if ((valid.normDescriptors ?? []).length > 0) {
    warnings.push("Norm descriptors are model descriptors, not measured social norms.");
  }
  if ((valid.decisionCouplings ?? []).length > 0) {
    warnings.push("Decision couplings are structural descriptors and do not execute behavior.");
  }
  if (modelUsesCrowdOrStrangerAbstraction(valid)) {
    warnings.push("Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals.");
  }

  if (valid.scope?.observabilityModelId) {
    warnings.push("Observability references do not measure beliefs or validate social observations.");
  }
  if (valid.scope?.causalAssumptionModelId) {
    warnings.push("Causal references do not prove social influence.");
  }
  if (valid.scope?.networkDefinitionId) {
    warnings.push("Network references do not execute social learning or social transmission.");
  }
  if (valid.scope?.feedbackLoopModelId) {
    warnings.push("Feedback references do not run social feedback loops.");
  }
  if (valid.scope?.uncertaintyConfigId) {
    warnings.push("Uncertainty references do not validate belief distributions.");
  }
  if (valid.scope?.modelSchemaId) {
    warnings.push("Model schema references do not make social, memory, or belief rules executable.");
  }
  if (valid.scope?.controlStrategyModelId) {
    warnings.push("Control references do not execute persuasion, policy, or intervention guidance.");
  }
  if (valid.scope?.quantitySemanticsModelId) {
    warnings.push("Quantity semantics references do not validate belief measurement.");
  }
  if ((valid.assumptionNotes ?? []).length > 0 || (valid.limitationNotes ?? []).length > 0 || (valid.validationNotes ?? []).length > 0 || (valid.ethicsNotes ?? []).length > 0) {
    warnings.push("Assumption, limitation, validation, and ethics notes are transparency metadata; they do not validate psychology or make real-world use safe.");
  }

  if (!valid.validationNotes?.length && claimsBroadApplicability(valid)) {
    warnings.push("Broad applicability or real-world wording appears without validation notes; V1 does not validate psychology or predict people.");
  }
  if (mentionsFullHumanCognition(valid)) {
    warnings.push("Full-human-cognition wording is unsupported; this is not a cognitive architecture.");
  }
  if (mentionsLlmAgents(valid)) {
    warnings.push("LLM-agent wording is unsupported; LLM-per-agent runtime is not implemented and must not be implied.");
  }
  if (mentionsRealPersonProfiling(valid)) {
    warnings.push("Real-person profiling wording is unsupported; descriptors must not infer traits or profiles for real people.");
  }
  if (mentionsProtectedClassInference(valid)) {
    warnings.push("Protected-class inference wording is unsupported; descriptors must not infer protected attributes.");
  }
  if (mentionsPsychologicalDiagnosis(valid)) {
    warnings.push("Psychological-diagnosis wording is unsupported; descriptors do not diagnose people or validate psychology.");
  }
  if (mentionsPolicyGuidance(valid)) {
    warnings.push("Real-world policy, intervention, persuasion, or guidance wording is unsupported in V1.");
  }

  return Array.from(new Set(warnings)).slice(0, maxKnowledgeSocialWarnings);
}

function countActiveDescriptors(model: KnowledgeMemorySocialLearningModel): number {
  return [
    ...model.knowledgeItems,
    ...(model.beliefVariables ?? []),
    ...(model.beliefStateDescriptors ?? []),
    ...(model.memoryTraceDescriptors ?? []),
    ...(model.attentionProfiles ?? []),
    ...(model.trustProfiles ?? []),
    ...(model.exposureChannels ?? []),
    ...(model.socialSignals ?? []),
    ...(model.learningRuleDescriptors ?? []),
    ...(model.backgroundProfiles ?? []),
    ...(model.relationshipRoles ?? []),
    ...(model.normDescriptors ?? []),
    ...(model.decisionCouplings ?? [])
  ].filter((item) => item.active).length;
}

function claimsBroadApplicability(model: KnowledgeMemorySocialLearningModel): boolean {
  return textFor(model).match(/\bbroad applicability\b|\bgeneraliz|\breal-world\b|\breal world\b|\boperational\b|\bproduction\b|\bvalidated\b|\bpredict/i) !== null;
}

function mentionsFullHumanCognition(model: KnowledgeMemorySocialLearningModel): boolean {
  return textFor(model).match(/\bfull human cognition\b|\bhuman-like cognition\b|\bhuman cognition\b|\bhuman-like mind\b|\bmind simulation\b|\bcognitive architecture\b|\bpsychological diagnosis\b/i) !== null;
}

function mentionsLlmAgents(model: KnowledgeMemorySocialLearningModel): boolean {
  return textFor(model).match(/\bllm\b|\blarge language model\b|\bllm agent\b|\bprompt chain\b|\bagentic\b|\bembedding\b|\bmodel weight\b/i) !== null;
}

function mentionsRealPersonProfiling(model: KnowledgeMemorySocialLearningModel): boolean {
  return textFor(model).match(/\breal-person profil|\breal person profil|\bprofile real people\b|\binfer real-person traits\b|\binfer real person traits\b/i) !== null;
}

function mentionsProtectedClassInference(model: KnowledgeMemorySocialLearningModel): boolean {
  return textFor(model).match(/\bprotected-class inference\b|\bprotected class inference\b|\bprotected attribute\b|\brace inference\b|\breligion inference\b|\bpolitical inference\b|\bsexual orientation inference\b|\bhealth inference\b/i) !== null;
}

function mentionsPsychologicalDiagnosis(model: KnowledgeMemorySocialLearningModel): boolean {
  return textFor(model).match(/\bpsychological diagnosis\b|\bmental health diagnosis\b|\bpersonality diagnosis\b|\bpsychiatric diagnosis\b/i) !== null;
}

function mentionsPolicyGuidance(model: KnowledgeMemorySocialLearningModel): boolean {
  return textFor(model).match(/\bpolicy guidance\b|\bpolicy recommendation\b|\bintervention guidance\b|\bpersuasion\b|\bmicrotarget\b|\brecommendation engine\b|\btargeting\b|\bdecision support\b|\bmanipulat/i) !== null;
}

function textFor(model: KnowledgeMemorySocialLearningModel): string {
  return JSON.stringify(model).toLowerCase();
}
