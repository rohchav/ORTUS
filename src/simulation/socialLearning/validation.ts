import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  attentionKinds,
  backgroundKinds,
  beliefKinds,
  beliefStateKinds,
  decisionCouplingKinds,
  exposureChannelKinds,
  knowledgeAbstractionLevels,
  knowledgeItemCategories,
  knowledgeMemorySocialLearningArtifactType,
  learningKinds,
  maxKnowledgeSocialDescriptionLength,
  maxKnowledgeSocialDescriptors,
  maxKnowledgeSocialMetadataJsonLength,
  maxKnowledgeSocialModelJsonLength,
  maxKnowledgeSocialNoteLength,
  maxKnowledgeSocialNotes,
  memoryKinds,
  normKinds,
  relationshipRoleKinds,
  socialSignalKinds,
  trustSourceTypes,
  type AttentionProfile,
  type BackgroundProfile,
  type BeliefStateDescriptor,
  type BeliefVariable,
  type DecisionCouplingDescriptor,
  type ExposureChannel,
  type KnowledgeItem,
  type KnowledgeMemorySocialLearningModel,
  type KnowledgeSocialScope,
  type LearningRuleDescriptor,
  type MemoryTraceDescriptor,
  type NormDescriptor,
  type RelationshipRole,
  type SocialSignalDescriptor,
  type TrustProfile
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(maxKnowledgeSocialDescriptionLength).optional();
const noteSchema = z.string().min(1).max(maxKnowledgeSocialNoteLength);
const notesSchema = z.array(noteSchema).max(maxKnowledgeSocialNotes);
const stringIdArraySchema = z.array(boundedString(160)).max(maxKnowledgeSocialDescriptors);

const scopeSchema: z.ZodType<KnowledgeSocialScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    modelSchemaId: boundedString(160).optional(),
    observabilityModelId: boundedString(160).optional(),
    causalAssumptionModelId: boundedString(160).optional(),
    quantitySemanticsModelId: boundedString(160).optional(),
    uncertaintyConfigId: boundedString(160).optional(),
    networkDefinitionId: boundedString(160).optional(),
    feedbackLoopModelId: boundedString(160).optional(),
    controlStrategyModelId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const knowledgeItemSchema: z.ZodType<KnowledgeItem> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    topic: boundedString(180).optional(),
    category: z.enum(knowledgeItemCategories),
    abstractionLevel: z.enum(knowledgeAbstractionLevels),
    description: optionalDescription,
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const beliefVariableSchema: z.ZodType<BeliefVariable> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    beliefKind: z.enum(beliefKinds),
    knowledgeItemIds: stringIdArraySchema.optional(),
    valueDescription: z.string().min(1).max(800).optional(),
    quantityId: boundedString(160).optional(),
    unitId: boundedString(160).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const beliefStateDescriptorSchema: z.ZodType<BeliefStateDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    beliefVariableId: boundedString(160),
    stateKind: z.enum(beliefStateKinds),
    valueDescription: z.string().min(1).max(800).optional(),
    confidenceDescription: z.string().min(1).max(800).optional(),
    salienceDescription: z.string().min(1).max(800).optional(),
    uncertaintyDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const memoryTraceDescriptorSchema: z.ZodType<MemoryTraceDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    memoryKind: z.enum(memoryKinds),
    knowledgeItemIds: stringIdArraySchema.optional(),
    beliefVariableIds: stringIdArraySchema.optional(),
    boundedCapacityDescription: z.string().min(1).max(800).optional(),
    decayDescription: z.string().min(1).max(800).optional(),
    salienceDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const attentionProfileSchema: z.ZodType<AttentionProfile> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    attentionKind: z.enum(attentionKinds),
    capacityDescription: z.string().min(1).max(800).optional(),
    salienceDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const trustProfileSchema: z.ZodType<TrustProfile> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    sourceType: z.enum(trustSourceTypes),
    trustDescription: z.string().min(1).max(800).optional(),
    credibilityDescription: z.string().min(1).max(800).optional(),
    uncertaintyDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const exposureChannelSchema: z.ZodType<ExposureChannel> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    channelKind: z.enum(exposureChannelKinds),
    sourceProfileIds: stringIdArraySchema.optional(),
    targetDescription: z.string().min(1).max(800).optional(),
    frequencyDescription: z.string().min(1).max(800).optional(),
    strengthDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const socialSignalDescriptorSchema: z.ZodType<SocialSignalDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    signalKind: z.enum(socialSignalKinds),
    knowledgeItemIds: stringIdArraySchema.optional(),
    beliefVariableIds: stringIdArraySchema.optional(),
    sourceProfileId: boundedString(160).optional(),
    exposureChannelId: boundedString(160).optional(),
    intensityDescription: z.string().min(1).max(800).optional(),
    perceivedConsensusDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const learningRuleDescriptorSchema: z.ZodType<LearningRuleDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    learningKind: z.enum(learningKinds),
    beliefVariableIds: stringIdArraySchema.optional(),
    knowledgeItemIds: stringIdArraySchema.optional(),
    trustProfileIds: stringIdArraySchema.optional(),
    exposureChannelIds: stringIdArraySchema.optional(),
    ruleDescription: z.string().min(1).max(2_000),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const backgroundProfileSchema: z.ZodType<BackgroundProfile> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    backgroundKind: z.enum(backgroundKinds),
    priorDescription: z.string().min(1).max(800).optional(),
    distributionDescription: z.string().min(1).max(800).optional(),
    groupDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const relationshipRoleSchema: z.ZodType<RelationshipRole> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    roleKind: z.enum(relationshipRoleKinds),
    trustProfileIds: stringIdArraySchema.optional(),
    influenceDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const normDescriptorSchema: z.ZodType<NormDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    normKind: z.enum(normKinds),
    knowledgeItemIds: stringIdArraySchema.optional(),
    beliefVariableIds: stringIdArraySchema.optional(),
    scopeDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const decisionCouplingDescriptorSchema: z.ZodType<DecisionCouplingDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    couplingKind: z.enum(decisionCouplingKinds),
    sourceIds: stringIdArraySchema.optional(),
    targetDescription: z.string().min(1).max(800),
    couplingDescription: z.string().min(1).max(800),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const knowledgeSocialModelSchema: z.ZodType<KnowledgeMemorySocialLearningModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(knowledgeMemorySocialLearningArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    scope: scopeSchema.optional(),
    knowledgeItems: z.array(knowledgeItemSchema).min(1).max(maxKnowledgeSocialDescriptors),
    beliefVariables: z.array(beliefVariableSchema).max(maxKnowledgeSocialDescriptors).optional(),
    beliefStateDescriptors: z.array(beliefStateDescriptorSchema).max(maxKnowledgeSocialDescriptors).optional(),
    memoryTraceDescriptors: z.array(memoryTraceDescriptorSchema).max(maxKnowledgeSocialDescriptors).optional(),
    attentionProfiles: z.array(attentionProfileSchema).max(maxKnowledgeSocialDescriptors).optional(),
    trustProfiles: z.array(trustProfileSchema).max(maxKnowledgeSocialDescriptors).optional(),
    exposureChannels: z.array(exposureChannelSchema).max(maxKnowledgeSocialDescriptors).optional(),
    socialSignals: z.array(socialSignalDescriptorSchema).max(maxKnowledgeSocialDescriptors).optional(),
    learningRuleDescriptors: z.array(learningRuleDescriptorSchema).max(maxKnowledgeSocialDescriptors).optional(),
    backgroundProfiles: z.array(backgroundProfileSchema).max(maxKnowledgeSocialDescriptors).optional(),
    relationshipRoles: z.array(relationshipRoleSchema).max(maxKnowledgeSocialDescriptors).optional(),
    normDescriptors: z.array(normDescriptorSchema).max(maxKnowledgeSocialDescriptors).optional(),
    decisionCouplings: z.array(decisionCouplingDescriptorSchema).max(maxKnowledgeSocialDescriptors).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxKnowledgeSocialNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxKnowledgeSocialNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxKnowledgeSocialNotes).optional(),
    ethicsNotes: z.array(assumptionItemSchema).max(maxKnowledgeSocialNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenKnowledgeSocialKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "metricHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "runState",
  "runSummary",
  "runSummaries",
  "template",
  "activeEngine",
  "formula",
  "formulas",
  "expression",
  "expressions",
  "equation",
  "equations",
  "code",
  "script",
  "javascript",
  "typescript",
  "python",
  "functionBody",
  "function",
  "class",
  "prototype",
  "constructor",
  "__proto__",
  "callback",
  "bytecode",
  "ast",
  "parser",
  "interpreter",
  "compiler",
  "transpiler",
  "codegen",
  "generatedCode",
  "algorithm",
  "runtime",
  "runtimeHook",
  "runtimeHooks",
  "execute",
  "executor",
  "stepFunction",
  "tickFunction",
  "behaviorFunction",
  "ruleFunction",
  "simulationLoop",
  "llm",
  "llmAgent",
  "llmAgents",
  "largeLanguageModel",
  "prompt",
  "promptTemplate",
  "promptChain",
  "promptChains",
  "chainOfThought",
  "agenticWorkflow",
  "agentRuntime",
  "agentMind",
  "agentMinds",
  "embedding",
  "embeddings",
  "embeddingVector",
  "embeddingVectors",
  "vector",
  "vectors",
  "modelWeight",
  "modelWeights",
  "trainingData",
  "trainingDataset",
  "trainingDatasets",
  "dataset",
  "datasets",
  "observedData",
  "observationData",
  "rawData",
  "timeSeries",
  "dataFrame",
  "dataTable",
  "dataTables",
  "csv",
  "table",
  "records",
  "observations",
  "corpus",
  "documents",
  "biography",
  "agentBiography",
  "lifeHistory",
  "lifeHistories",
  "runtimeMemory",
  "freeTextMemory",
  "autobiographicalMemory",
  "memoryCorpus",
  "knowledgeCorpus",
  "unboundedMemory",
  "realPerson",
  "realPersonProfile",
  "realPersonTraits",
  "personalityDiagnosis",
  "psychologicalDiagnosis",
  "mentalHealthDiagnosis",
  "psychiatricDiagnosis",
  "cognitiveDiagnosis",
  "protectedAttribute",
  "protectedAttributeInference",
  "raceInference",
  "religionInference",
  "politicalInference",
  "sexualOrientationInference",
  "healthInference",
  "persuasionOptimization",
  "manipulationOptimization",
  "microtargeting",
  "targeting",
  "targetingModel",
  "recommender",
  "recommendations",
  "recommendationEngine",
  "policyOptimizer",
  "policyRecommendation",
  "policyGuidance",
  "interventionGuidance",
  "decisionSupport",
  "treatmentEffect",
  "treatmentEffectEstimate",
  "treatmentEffectEstimation",
  "causalEffect",
  "causalEffectEstimate",
  "causalEffectEstimation",
  "calibration",
  "calibrationData",
  "validationClaim",
  "validationClaims",
  "statisticalSignificance",
  "proof",
  "certification",
  "safetyCertification",
  "operationalSafety",
  "operationalReadiness",
  "riskScore",
  "safetyScore"
]);

const normalizedForbiddenKnowledgeSocialKeys = new Set(Array.from(forbiddenKnowledgeSocialKeys).map((key) => key.toLowerCase()));

const allowedTopLevelKeys = new Set([
  "schemaVersion",
  "artifactType",
  "id",
  "name",
  "description",
  "version",
  "scope",
  "knowledgeItems",
  "beliefVariables",
  "beliefStateDescriptors",
  "memoryTraceDescriptors",
  "attentionProfiles",
  "trustProfiles",
  "exposureChannels",
  "socialSignals",
  "learningRuleDescriptors",
  "backgroundProfiles",
  "relationshipRoles",
  "normDescriptors",
  "decisionCouplings",
  "assumptionNotes",
  "limitationNotes",
  "validationNotes",
  "ethicsNotes",
  "metadata"
]);

export function validateKnowledgeMemorySocialLearningModel(value: unknown): KnowledgeMemorySocialLearningModel {
  assertPlainKnowledgeSocialJson(value, "Knowledge/memory/social-learning model");
  const parsed = knowledgeSocialModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid knowledge/memory/social-learning model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeKnowledgeMemorySocialLearningModel(parsed.data);
  assertKnowledgeSocialJsonBound(model, maxKnowledgeSocialModelJsonLength, "Knowledge/memory/social-learning model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("knowledge item", model.knowledgeItems);
  validateUniqueIds("belief variable", model.beliefVariables ?? []);
  validateUniqueIds("belief state descriptor", model.beliefStateDescriptors ?? []);
  validateUniqueIds("memory trace descriptor", model.memoryTraceDescriptors ?? []);
  validateUniqueIds("attention profile", model.attentionProfiles ?? []);
  validateUniqueIds("trust profile", model.trustProfiles ?? []);
  validateUniqueIds("exposure channel", model.exposureChannels ?? []);
  validateUniqueIds("social signal", model.socialSignals ?? []);
  validateUniqueIds("learning rule descriptor", model.learningRuleDescriptors ?? []);
  validateUniqueIds("background profile", model.backgroundProfiles ?? []);
  validateUniqueIds("relationship role", model.relationshipRoles ?? []);
  validateUniqueIds("norm descriptor", model.normDescriptors ?? []);
  validateUniqueIds("decision coupling", model.decisionCouplings ?? []);
  validateReferences(model);
  return model;
}

export function parseKnowledgeMemorySocialLearningModelJson(json: string | unknown): KnowledgeMemorySocialLearningModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxKnowledgeSocialModelJsonLength) {
      throw new SimulationSerializationError(`Knowledge/memory/social-learning model JSON must be ${maxKnowledgeSocialModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid knowledge/memory/social-learning model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== knowledgeMemorySocialLearningArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${knowledgeMemorySocialLearningArtifactType}`);
  }
  return validateKnowledgeMemorySocialLearningModel(raw);
}

export function normalizeKnowledgeMemorySocialLearningModel(model: KnowledgeMemorySocialLearningModel): KnowledgeMemorySocialLearningModel {
  return {
    ...model,
    ...(model.scope ? { scope: cloneRecord(model.scope) } : {}),
    knowledgeItems: model.knowledgeItems.map((item) => cloneRecord(item)),
    ...(model.beliefVariables ? { beliefVariables: model.beliefVariables.map((item) => cloneRecord(item)) } : {}),
    ...(model.beliefStateDescriptors ? { beliefStateDescriptors: model.beliefStateDescriptors.map((item) => cloneRecord(item)) } : {}),
    ...(model.memoryTraceDescriptors ? { memoryTraceDescriptors: model.memoryTraceDescriptors.map((item) => cloneRecord(item)) } : {}),
    ...(model.attentionProfiles ? { attentionProfiles: model.attentionProfiles.map((item) => cloneRecord(item)) } : {}),
    ...(model.trustProfiles ? { trustProfiles: model.trustProfiles.map((item) => cloneRecord(item)) } : {}),
    ...(model.exposureChannels ? { exposureChannels: model.exposureChannels.map((item) => cloneRecord(item)) } : {}),
    ...(model.socialSignals ? { socialSignals: model.socialSignals.map((item) => cloneRecord(item)) } : {}),
    ...(model.learningRuleDescriptors ? { learningRuleDescriptors: model.learningRuleDescriptors.map((item) => cloneRecord(item)) } : {}),
    ...(model.backgroundProfiles ? { backgroundProfiles: model.backgroundProfiles.map((item) => cloneRecord(item)) } : {}),
    ...(model.relationshipRoles ? { relationshipRoles: model.relationshipRoles.map((item) => cloneRecord(item)) } : {}),
    ...(model.normDescriptors ? { normDescriptors: model.normDescriptors.map((item) => cloneRecord(item)) } : {}),
    ...(model.decisionCouplings ? { decisionCouplings: model.decisionCouplings.map((item) => cloneRecord(item)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("knowledge/social assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("knowledge/social limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("knowledge/social validation notes", model.validationNotes) } : {}),
    ...(model.ethicsNotes ? { ethicsNotes: validateAssumptionItems("knowledge/social ethics notes", model.ethicsNotes) } : {}),
    ...(model.metadata ? { metadata: cloneRecord(model.metadata) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(model: KnowledgeMemorySocialLearningModel): void {
  const knowledgeIds = new Set(model.knowledgeItems.map((item) => item.id));
  const beliefIds = new Set((model.beliefVariables ?? []).map((item) => item.id));
  const trustIds = new Set((model.trustProfiles ?? []).map((item) => item.id));
  const exposureIds = new Set((model.exposureChannels ?? []).map((item) => item.id));
  const descriptorIds = new Set([
    ...knowledgeIds,
    ...beliefIds,
    ...(model.beliefStateDescriptors ?? []).map((item) => item.id),
    ...(model.memoryTraceDescriptors ?? []).map((item) => item.id),
    ...(model.attentionProfiles ?? []).map((item) => item.id),
    ...trustIds,
    ...exposureIds,
    ...(model.socialSignals ?? []).map((item) => item.id),
    ...(model.learningRuleDescriptors ?? []).map((item) => item.id),
    ...(model.backgroundProfiles ?? []).map((item) => item.id),
    ...(model.relationshipRoles ?? []).map((item) => item.id),
    ...(model.normDescriptors ?? []).map((item) => item.id)
  ]);

  for (const belief of model.beliefVariables ?? []) {
    validateReferenceSet(`Belief variable ${belief.id}`, "knowledgeItemId", belief.knowledgeItemIds ?? [], knowledgeIds);
  }
  for (const state of model.beliefStateDescriptors ?? []) {
    validateReferenceSet(`Belief state descriptor ${state.id}`, "beliefVariableId", [state.beliefVariableId], beliefIds);
  }
  for (const memory of model.memoryTraceDescriptors ?? []) {
    validateReferenceSet(`Memory trace descriptor ${memory.id}`, "knowledgeItemId", memory.knowledgeItemIds ?? [], knowledgeIds);
    validateReferenceSet(`Memory trace descriptor ${memory.id}`, "beliefVariableId", memory.beliefVariableIds ?? [], beliefIds);
  }
  for (const exposure of model.exposureChannels ?? []) {
    validateReferenceSet(`Exposure channel ${exposure.id}`, "sourceProfileId", exposure.sourceProfileIds ?? [], trustIds);
  }
  for (const signal of model.socialSignals ?? []) {
    validateReferenceSet(`Social signal ${signal.id}`, "knowledgeItemId", signal.knowledgeItemIds ?? [], knowledgeIds);
    validateReferenceSet(`Social signal ${signal.id}`, "beliefVariableId", signal.beliefVariableIds ?? [], beliefIds);
    validateReferenceSet(`Social signal ${signal.id}`, "sourceProfileId", signal.sourceProfileId ? [signal.sourceProfileId] : [], trustIds);
    validateReferenceSet(`Social signal ${signal.id}`, "exposureChannelId", signal.exposureChannelId ? [signal.exposureChannelId] : [], exposureIds);
  }
  for (const rule of model.learningRuleDescriptors ?? []) {
    validateReferenceSet(`Learning rule descriptor ${rule.id}`, "knowledgeItemId", rule.knowledgeItemIds ?? [], knowledgeIds);
    validateReferenceSet(`Learning rule descriptor ${rule.id}`, "beliefVariableId", rule.beliefVariableIds ?? [], beliefIds);
    validateReferenceSet(`Learning rule descriptor ${rule.id}`, "trustProfileId", rule.trustProfileIds ?? [], trustIds);
    validateReferenceSet(`Learning rule descriptor ${rule.id}`, "exposureChannelId", rule.exposureChannelIds ?? [], exposureIds);
  }
  for (const role of model.relationshipRoles ?? []) {
    validateReferenceSet(`Relationship role ${role.id}`, "trustProfileId", role.trustProfileIds ?? [], trustIds);
  }
  for (const norm of model.normDescriptors ?? []) {
    validateReferenceSet(`Norm descriptor ${norm.id}`, "knowledgeItemId", norm.knowledgeItemIds ?? [], knowledgeIds);
    validateReferenceSet(`Norm descriptor ${norm.id}`, "beliefVariableId", norm.beliefVariableIds ?? [], beliefIds);
  }
  for (const coupling of model.decisionCouplings ?? []) {
    validateReferenceSet(`Decision coupling ${coupling.id}`, "sourceId", coupling.sourceIds ?? [], descriptorIds);
  }
}

function validateReferenceSet(label: string, field: string, ids: readonly string[], knownIds: ReadonlySet<string>): void {
  for (const id of ids) {
    if (!knownIds.has(id)) {
      throw new SimulationValidationError(`${label} references unknown ${field}: ${id}`);
    }
  }
}

function validateUniqueIds(label: string, values: readonly { id: string }[]): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new SimulationValidationError(`Duplicate ${label} id: ${value.id}`);
    }
    ids.add(value.id);
  }
}

function validateNotes(model: KnowledgeMemorySocialLearningModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes],
    ["ethicsNotes", model.ethicsNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`knowledge/social ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: KnowledgeMemorySocialLearningModel): void {
  const metadataValues: Array<[string, Record<string, JsonValue> | undefined]> = [
    ["model metadata", model.metadata],
    ["scope metadata", model.scope?.metadata],
    ...model.knowledgeItems.map((item) => [`knowledge item ${item.id} metadata`, item.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(model.beliefVariables ?? []).map((item) => [`belief variable ${item.id} metadata`, item.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(model.beliefStateDescriptors ?? []).map((item) => [`belief state descriptor ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(model.memoryTraceDescriptors ?? []).map((item) => [`memory trace descriptor ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(model.attentionProfiles ?? []).map((item) => [`attention profile ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(model.trustProfiles ?? []).map((item) => [`trust profile ${item.id} metadata`, item.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(model.exposureChannels ?? []).map((item) => [`exposure channel ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(model.socialSignals ?? []).map((item) => [`social signal ${item.id} metadata`, item.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(model.learningRuleDescriptors ?? []).map((item) => [`learning rule descriptor ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(model.backgroundProfiles ?? []).map((item) => [`background profile ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(model.relationshipRoles ?? []).map((item) => [`relationship role ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(model.normDescriptors ?? []).map((item) => [`norm descriptor ${item.id} metadata`, item.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(model.decisionCouplings ?? []).map((item) => [`decision coupling ${item.id} metadata`, item.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ])
  ];
  for (const [label, metadata] of metadataValues) {
    if (metadata) {
      assertKnowledgeSocialJsonBound(metadata, maxKnowledgeSocialMetadataJsonLength, label);
    }
  }
}

export function assertKnowledgeSocialJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainKnowledgeSocialJson(value: unknown, label: string): void {
  const stack: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  while (stack.length > 0) {
    const item = stack.pop();
    const current = item?.value;
    const depth = item?.depth ?? 0;
    if (current === null || current === undefined) {
      continue;
    }
    if (typeof current === "function" || typeof current === "symbol" || typeof current === "bigint") {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    if (typeof current !== "object") {
      if (typeof current === "number" && !Number.isFinite(current)) {
        throw new SimulationValidationError(`${label} must not contain non-finite numbers`);
      }
      continue;
    }
    if (Array.isArray(current)) {
      stack.push(...current.map((child) => ({ value: child, depth: depth + 1 })));
      continue;
    }
    if (!isPlainRecord(current)) {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    for (const [key, child] of Object.entries(current)) {
      if (isForbiddenKnowledgeSocialKey(key) && !(depth === 0 && allowedTopLevelKeys.has(key))) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable, formula, code, dataset, training-data, embedding, model-weight, LLM, agent-runtime, biography, unbounded-memory, real-person, protected-attribute, diagnosis, persuasion, microtargeting, policy-optimization, causal-effect, proof, certification, safety, or risk key ${key}`
        );
      }
      stack.push({ value: child, depth: depth + 1 });
    }
  }
}

function isForbiddenKnowledgeSocialKey(key: string): boolean {
  return forbiddenKnowledgeSocialKeys.has(key) || normalizedForbiddenKnowledgeSocialKeys.has(key.toLowerCase());
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainRecord(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
