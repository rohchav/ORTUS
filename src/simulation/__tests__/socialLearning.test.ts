import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deserializeKnowledgeMemorySocialLearningModel,
  getArtifactFamily,
  getAttentionProfile,
  getBackgroundProfile,
  getBeliefStateDescriptor,
  getBeliefVariable,
  getDecisionCoupling,
  getExposureChannel,
  getKnowledgeItem,
  getKnowledgeMemorySocialLearningValidationReport,
  getKnowledgeMemorySocialLearningWarnings,
  getModelInterpreterCapabilityReport,
  getLearningRuleDescriptor,
  getMemoryTraceDescriptor,
  getNormDescriptor,
  getPrimitive,
  getRelationshipRole,
  getSocialSignal,
  getTemplateCapability,
  getTrustProfile,
  knowledgeMemorySocialLearningArtifactType,
  listAttentionProfiles,
  listBackgroundProfiles,
  listBeliefStates,
  listBeliefVariables,
  listDecisionCouplings,
  listExposureChannels,
  listKnowledgeItems,
  listKnowledgeItemsByAbstractionLevel,
  listKnowledgeItemsByCategory,
  listLearningRuleDescriptors,
  listLearningRulesByKind,
  listMemoryTraceDescriptors,
  listNormDescriptors,
  listRelationshipRoles,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  listSocialSignals,
  listTrustProfiles,
  listTrustProfilesBySourceType,
  modelHasLearningKind,
  modelHasSourceType,
  modelUsesCrowdOrStrangerAbstraction,
  opinionTemplate,
  productionTemplates,
  schemaHasArtifactType,
  schemaHasRuleKind,
  serializeKnowledgeMemorySocialLearningModel,
  summarizeKnowledgeMemorySocialLearningModel,
  validateCompositionCapabilities,
  validateHybridComposition,
  validateKnowledgeMemorySocialLearningModel,
  type HybridModelComposition,
  type KnowledgeMemorySocialLearningModel
} from "../index";

const repoRoot = process.cwd();

function minimalModel(overrides: Partial<KnowledgeMemorySocialLearningModel> = {}): KnowledgeMemorySocialLearningModel {
  return {
    schemaVersion: "1",
    artifactType: knowledgeMemorySocialLearningArtifactType,
    id: "minimal-social",
    name: "Minimal Social Semantics",
    version: "1.0.0",
    knowledgeItems: [
      {
        id: "topic-risk",
        label: "Topic Risk",
        category: "risk",
        abstractionLevel: "individual",
        active: true,
        executable: false
      }
    ],
    ...overrides
  };
}

function fullModel(overrides: Partial<KnowledgeMemorySocialLearningModel> = {}): KnowledgeMemorySocialLearningModel {
  return minimalModel({
    id: "opinion-social-semantics",
    name: "Opinion Social Semantics",
    description:
      "A structural model for broad applicability, real-world policy guidance, full human cognition, LLM agents, and social-learning review.",
    scope: {
      templateId: "opinion-dynamics",
      modelSchemaId: "opinion-schema",
      observabilityModelId: "observability-1",
      causalAssumptionModelId: "causal-1",
      quantitySemanticsModelId: "quantity-1",
      uncertaintyConfigId: "uncertainty-1",
      networkDefinitionId: "network-1",
      feedbackLoopModelId: "feedback-1",
      controlStrategyModelId: "control-1",
      notes: ["Scope references are structural only."]
    },
    knowledgeItems: [
      {
        id: "topic-risk",
        label: "Topic Risk",
        topic: "Risk perception",
        category: "risk",
        abstractionLevel: "individual",
        description: "A bounded symbolic topic descriptor.",
        active: true,
        executable: false
      },
      {
        id: "crowd-consensus",
        label: "Crowd Consensus",
        category: "socialSignal",
        abstractionLevel: "population",
        active: false,
        executable: false
      }
    ],
    beliefVariables: [
      {
        id: "risk-belief",
        label: "Risk Belief",
        beliefKind: "riskPerception",
        knowledgeItemIds: ["topic-risk"],
        valueDescription: "Scalar descriptor only.",
        quantityId: "belief-score",
        unitId: "dimensionless",
        active: true,
        executable: false
      }
    ],
    beliefStateDescriptors: [
      {
        id: "risk-prior",
        label: "Risk Prior",
        beliefVariableId: "risk-belief",
        stateKind: "prior",
        valueDescription: "Compressed prior descriptor.",
        active: true,
        executable: false
      }
    ],
    memoryTraceDescriptors: [
      {
        id: "recent-signal",
        label: "Recent Signal",
        memoryKind: "recentExposure",
        knowledgeItemIds: ["topic-risk"],
        beliefVariableIds: ["risk-belief"],
        boundedCapacityDescription: "Last few stylized exposures only.",
        active: true,
        executable: false
      }
    ],
    attentionProfiles: [
      {
        id: "salience",
        label: "Salience",
        attentionKind: "salience",
        capacityDescription: "Bounded symbolic salience only.",
        active: true,
        executable: false
      }
    ],
    trustProfiles: [
      {
        id: "crowd-source",
        label: "Crowd Source",
        sourceType: "crowd",
        trustDescription: "Aggregate crowd descriptor.",
        active: true,
        executable: false
      },
      {
        id: "stranger-source",
        label: "Stranger Source",
        sourceType: "stranger",
        active: false,
        executable: false
      }
    ],
    exposureChannels: [
      {
        id: "crowd-channel",
        label: "Crowd Channel",
        channelKind: "crowdSignal",
        sourceProfileIds: ["crowd-source"],
        targetDescription: "Aggregate exposure target.",
        active: true,
        executable: false
      }
    ],
    socialSignals: [
      {
        id: "consensus-signal",
        label: "Consensus Signal",
        signalKind: "consensusSignal",
        knowledgeItemIds: ["crowd-consensus"],
        beliefVariableIds: ["risk-belief"],
        sourceProfileId: "crowd-source",
        exposureChannelId: "crowd-channel",
        intensityDescription: "Declared intensity only.",
        active: true,
        executable: false
      }
    ],
    learningRuleDescriptors: [
      {
        id: "trust-weighted",
        label: "Trust Weighted",
        learningKind: "trustWeightedUpdate",
        beliefVariableIds: ["risk-belief"],
        knowledgeItemIds: ["topic-risk"],
        trustProfileIds: ["crowd-source"],
        exposureChannelIds: ["crowd-channel"],
        ruleDescription: "Descriptive metadata only; no update is executed.",
        active: true,
        executable: false
      }
    ],
    backgroundProfiles: [
      {
        id: "prior-profile",
        label: "Prior Profile",
        backgroundKind: "priorBeliefProfile",
        priorDescription: "Compressed prior descriptor, not life history.",
        active: true,
        executable: false
      }
    ],
    relationshipRoles: [
      {
        id: "crowd-role",
        label: "Crowd Role",
        roleKind: "crowd",
        trustProfileIds: ["crowd-source"],
        influenceDescription: "Aggregate role only.",
        active: true,
        executable: false
      }
    ],
    normDescriptors: [
      {
        id: "local-norm",
        label: "Local Norm",
        normKind: "localNorm",
        knowledgeItemIds: ["crowd-consensus"],
        beliefVariableIds: ["risk-belief"],
        active: true,
        executable: false
      }
    ],
    decisionCouplings: [
      {
        id: "belief-action",
        label: "Belief Action",
        couplingKind: "beliefToBehavior",
        sourceIds: ["risk-belief", "trust-weighted"],
        targetDescription: "Stylized behavior target.",
        couplingDescription: "Structural coupling only.",
        active: true,
        executable: false
      }
    ],
    ...overrides
  });
}

function hybridComposition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: "ortus.hybridComposition",
    id: "social-composition",
    name: "Social Composition",
    version: "1.0.0",
    baseTemplateId: "opinion-dynamics",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

function expectInvalid(label: string, model: unknown, expected: RegExp): void {
  expect(() => validateKnowledgeMemorySocialLearningModel(model), label).toThrow(expected);
}

describe("knowledge, memory, and social-learning semantics service", () => {
  it("validates minimal and full structural models", () => {
    expect(validateKnowledgeMemorySocialLearningModel(minimalModel())).toMatchObject({
      id: "minimal-social",
      artifactType: knowledgeMemorySocialLearningArtifactType
    });
    expect(validateKnowledgeMemorySocialLearningModel(fullModel())).toMatchObject({
      id: "opinion-social-semantics",
      learningRuleDescriptors: expect.any(Array)
    });
  });

  it("rejects malformed fields, duplicates, executable flags, unknown references, and unsafe payloads", () => {
    const duplicate = <K extends keyof KnowledgeMemorySocialLearningModel>(key: K) => {
      const value = fullModel()[key] as readonly { id: string }[];
      return fullModel({ [key]: [value[0], value[0]] } as Partial<KnowledgeMemorySocialLearningModel>);
    };

    const cases: Array<[string, unknown, RegExp]> = [
      ["missing id", { ...minimalModel(), id: undefined }, /id/],
      ["missing name", { ...minimalModel(), name: undefined }, /name/],
      ["invalid artifactType", { ...minimalModel(), artifactType: "ortus.modelSchema" }, /artifactType/],
      ["invalid version", { ...minimalModel(), version: "" }, /version/],
      ["missing knowledgeItems", { ...minimalModel(), knowledgeItems: undefined }, /knowledgeItems/],
      ["malformed knowledgeItems", { ...minimalModel(), knowledgeItems: {} }, /knowledgeItems/],
      ["malformed optional array", minimalModel({ beliefVariables: {} as never }), /beliefVariables/],
      ["unknown top-level field", { ...minimalModel(), extra: true }, /Unrecognized key|Invalid/],
      ["duplicate knowledge", duplicate("knowledgeItems"), /Duplicate knowledge item id/],
      ["duplicate belief", duplicate("beliefVariables"), /Duplicate belief variable id/],
      ["duplicate belief state", duplicate("beliefStateDescriptors"), /Duplicate belief state descriptor id/],
      ["duplicate memory", duplicate("memoryTraceDescriptors"), /Duplicate memory trace descriptor id/],
      ["duplicate attention", duplicate("attentionProfiles"), /Duplicate attention profile id/],
      ["duplicate trust", duplicate("trustProfiles"), /Duplicate trust profile id/],
      ["duplicate exposure", duplicate("exposureChannels"), /Duplicate exposure channel id/],
      ["duplicate signal", duplicate("socialSignals"), /Duplicate social signal id/],
      ["duplicate learning", duplicate("learningRuleDescriptors"), /Duplicate learning rule descriptor id/],
      ["duplicate background", duplicate("backgroundProfiles"), /Duplicate background profile id/],
      ["duplicate role", duplicate("relationshipRoles"), /Duplicate relationship role id/],
      ["duplicate norm", duplicate("normDescriptors"), /Duplicate norm descriptor id/],
      ["duplicate coupling", duplicate("decisionCouplings"), /Duplicate decision coupling id/],
      ["invalid knowledge enum", fullModel({ knowledgeItems: [{ ...fullModel().knowledgeItems[0]!, category: "runtime" as never }] }), /category/],
      ["invalid belief enum", fullModel({ beliefVariables: [{ ...fullModel().beliefVariables![0]!, beliefKind: "mind" as never }] }), /beliefKind/],
      ["invalid state enum", fullModel({ beliefStateDescriptors: [{ ...fullModel().beliefStateDescriptors![0]!, stateKind: "measured" as never }] }), /stateKind/],
      ["invalid memory enum", fullModel({ memoryTraceDescriptors: [{ ...fullModel().memoryTraceDescriptors![0]!, memoryKind: "biography" as never }] }), /memoryKind/],
      ["invalid attention enum", fullModel({ attentionProfiles: [{ ...fullModel().attentionProfiles![0]!, attentionKind: "focus" as never }] }), /attentionKind/],
      ["invalid trust enum", fullModel({ trustProfiles: [{ ...fullModel().trustProfiles![0]!, sourceType: "personality" as never }] }), /sourceType/],
      ["invalid exposure enum", fullModel({ exposureChannels: [{ ...fullModel().exposureChannels![0]!, channelKind: "platformRuntime" as never }] }), /channelKind/],
      ["invalid signal enum", fullModel({ socialSignals: [{ ...fullModel().socialSignals![0]!, signalKind: "diagnosis" as never }] }), /signalKind/],
      ["invalid learning enum", fullModel({ learningRuleDescriptors: [{ ...fullModel().learningRuleDescriptors![0]!, learningKind: "llmReasoning" as never }] }), /learningKind/],
      ["invalid background enum", fullModel({ backgroundProfiles: [{ ...fullModel().backgroundProfiles![0]!, backgroundKind: "lifeHistory" as never }] }), /backgroundKind/],
      ["invalid role enum", fullModel({ relationshipRoles: [{ ...fullModel().relationshipRoles![0]!, roleKind: "target" as never }] }), /roleKind/],
      ["invalid norm enum", fullModel({ normDescriptors: [{ ...fullModel().normDescriptors![0]!, normKind: "truth" as never }] }), /normKind/],
      ["invalid coupling enum", fullModel({ decisionCouplings: [{ ...fullModel().decisionCouplings![0]!, couplingKind: "executeAction" as never }] }), /couplingKind/],
      ["unknown knowledge ref", fullModel({ beliefVariables: [{ ...fullModel().beliefVariables![0]!, knowledgeItemIds: ["missing"] }] }), /unknown knowledgeItemId/],
      ["unknown belief ref", fullModel({ beliefStateDescriptors: [{ ...fullModel().beliefStateDescriptors![0]!, beliefVariableId: "missing" }] }), /unknown beliefVariableId/],
      ["unknown trust ref", fullModel({ exposureChannels: [{ ...fullModel().exposureChannels![0]!, sourceProfileIds: ["missing"] }] }), /unknown sourceProfileId/],
      ["unknown exposure ref", fullModel({ socialSignals: [{ ...fullModel().socialSignals![0]!, exposureChannelId: "missing" }] }), /unknown exposureChannelId/],
      ["unknown source profile", fullModel({ socialSignals: [{ ...fullModel().socialSignals![0]!, sourceProfileId: "missing" }] }), /unknown sourceProfileId/],
      ["missing rule description", fullModel({ learningRuleDescriptors: [{ ...fullModel().learningRuleDescriptors![0]!, ruleDescription: undefined as never }] }), /ruleDescription/],
      ["missing coupling target", fullModel({ decisionCouplings: [{ ...fullModel().decisionCouplings![0]!, targetDescription: undefined as never }] }), /targetDescription/],
      ["missing coupling description", fullModel({ decisionCouplings: [{ ...fullModel().decisionCouplings![0]!, couplingDescription: undefined as never }] }), /couplingDescription/],
      ["non-finite", minimalModel({ metadata: { value: Number.POSITIVE_INFINITY } as never }), /non-finite/],
      ["oversized note", minimalModel({ knowledgeItems: [{ ...minimalModel().knowledgeItems[0]!, notes: ["x".repeat(2_000)] }] }), /notes/],
      ["oversized metadata", minimalModel({ metadata: { huge: "x".repeat(30_000) } }), /metadata/],
      ["oversized model", minimalModel({ description: "x".repeat(300_000) }), /description|Knowledge/],
      ["function payload", minimalModel({ metadata: { handler: () => null } as never }), /plain JSON/],
      ["class payload", minimalModel({ metadata: { date: new Date() } as never }), /plain JSON/]
    ];

    for (const [label, model, expected] of cases) {
      expectInvalid(label, model, expected);
    }

    for (const [family, key, model] of [
      ["knowledge", "executable", fullModel({ knowledgeItems: [{ ...fullModel().knowledgeItems[0]!, executable: true as never }] })],
      ["belief", "executable", fullModel({ beliefVariables: [{ ...fullModel().beliefVariables![0]!, executable: true as never }] })],
      ["belief state", "executable", fullModel({ beliefStateDescriptors: [{ ...fullModel().beliefStateDescriptors![0]!, executable: true as never }] })],
      ["memory", "executable", fullModel({ memoryTraceDescriptors: [{ ...fullModel().memoryTraceDescriptors![0]!, executable: true as never }] })],
      ["attention", "executable", fullModel({ attentionProfiles: [{ ...fullModel().attentionProfiles![0]!, executable: true as never }] })],
      ["trust", "executable", fullModel({ trustProfiles: [{ ...fullModel().trustProfiles![0]!, executable: true as never }] })],
      ["exposure", "executable", fullModel({ exposureChannels: [{ ...fullModel().exposureChannels![0]!, executable: true as never }] })],
      ["signal", "executable", fullModel({ socialSignals: [{ ...fullModel().socialSignals![0]!, executable: true as never }] })],
      ["learning", "executable", fullModel({ learningRuleDescriptors: [{ ...fullModel().learningRuleDescriptors![0]!, executable: true as never }] })],
      ["background", "executable", fullModel({ backgroundProfiles: [{ ...fullModel().backgroundProfiles![0]!, executable: true as never }] })],
      ["role", "executable", fullModel({ relationshipRoles: [{ ...fullModel().relationshipRoles![0]!, executable: true as never }] })],
      ["norm", "executable", fullModel({ normDescriptors: [{ ...fullModel().normDescriptors![0]!, executable: true as never }] })],
      ["coupling", "executable", fullModel({ decisionCouplings: [{ ...fullModel().decisionCouplings![0]!, executable: true as never }] })]
    ] as const) {
      expectInvalid(`${family} ${key}`, model, /executable/);
    }

    const forbiddenLiveStateKeys = [
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
      "activeEngine"
    ];
    for (const key of forbiddenLiveStateKeys) {
      expectInvalid(`forbidden live-state key ${key}`, minimalModel({ metadata: { [key]: {} } }), new RegExp(key));
    }

    const forbiddenUnsafeKeys = [
      "formula",
      "expression",
      "equation",
      "code",
      "script",
      "javascript",
      "typescript",
      "python",
      "functionBody",
      "callback",
      "runtimeHook",
      "runtimeHooks",
      "algorithm",
      "runtime",
      "execute",
      "executor",
      "stepFunction",
      "tickFunction",
      "behaviorFunction",
      "ruleFunction",
      "simulationLoop",
      "llm",
      "llmAgent",
      "largeLanguageModel",
      "prompt",
      "promptTemplate",
      "promptChain",
      "chainOfThought",
      "agenticWorkflow",
      "agentRuntime",
      "agentMind",
      "embedding",
      "embeddings",
      "embeddingVector",
      "vector",
      "vectors",
      "modelWeight",
      "modelWeights",
      "trainingData",
      "trainingDataset",
      "dataset",
      "datasets",
      "observedData",
      "observationData",
      "rawData",
      "timeSeries",
      "dataFrame",
      "dataTable",
      "csv",
      "table",
      "records",
      "observations",
      "corpus",
      "documents",
      "biography",
      "agentBiography",
      "lifeHistory",
      "runtimeMemory",
      "freeTextMemory",
      "autobiographicalMemory",
      "memoryCorpus",
      "unboundedMemory",
      "realPerson",
      "realPersonProfile",
      "personalityDiagnosis",
      "psychologicalDiagnosis",
      "mentalHealthDiagnosis",
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
      "recommendationEngine",
      "policyOptimizer",
      "policyRecommendation",
      "policyGuidance",
      "interventionGuidance",
      "treatmentEffect",
      "treatmentEffectEstimate",
      "causalEffect",
      "causalEffectEstimate",
      "calibration",
      "validationClaim",
      "proof",
      "certification",
      "safetyCertification",
      "operationalSafety",
      "riskScore",
      "safetyScore"
    ];
    for (const key of forbiddenUnsafeKeys) {
      expectInvalid(`forbidden unsafe key ${key}`, minimalModel({ metadata: { [key]: "payload" } }), /must not contain/);
    }
    expectInvalid("case-insensitive unsafe key", minimalModel({ metadata: { LLM: "payload" } as never }), /LLM/);
  });

  it("surfaces structural-only warnings without implying cognition, runtime, prediction, or validation", () => {
    const warnings = getKnowledgeMemorySocialLearningWarnings(fullModel()).join("\n");
    expect(warnings).toContain("Knowledge, memory, and social-learning descriptors are structural semantics");
    expect(warnings).toContain("Active descriptors are structurally active only");
    expect(warnings).toContain("not human understanding");
    expect(warnings).toContain("not measured human beliefs");
    expect(warnings).toContain("not inferred mental states");
    expect(warnings).toContain("not autobiographical memory");
    expect(warnings).toContain("do not implement attention");
    expect(warnings).toContain("do not validate source credibility");
    expect(warnings).toContain("do not sample social exposure");
    expect(warnings).toContain("not emitted at runtime");
    expect(warnings).toContain("not executed");
    expect(warnings).toContain("Background profiles are compressed prior descriptors");
    expect(warnings).toContain("not real relationships");
    expect(warnings).toContain("not measured social norms");
    expect(warnings).toContain("do not execute behavior");
    expect(warnings).toContain("aggregate signals, representative agents, or fields");
    expect(warnings).toContain("No KnowledgeMemorySocialLearningModel runtime exists");
    expect(warnings).toContain("No human cognition runtime exists");
    expect(warnings).toContain("No LLM-agent runtime exists");
    expect(warnings).toContain("No psychological validity is implied");
    expect(warnings).toContain("No empirical validation is implied");
    expect(warnings).toContain("No prediction of real people is implied");
    expect(warnings).toContain("No protected-class inference is supported");
    expect(warnings).toContain("No real-person profiling is supported");
    expect(warnings).toContain("No persuasion or microtargeting runtime is supported");
    expect(warnings).toContain("not ethical approval, policy guidance, treatment-effect evidence, safety certification, or operational readiness");
    expect(warnings).toContain("Observability references do not measure beliefs");
    expect(warnings).toContain("Causal references do not prove social influence");
    expect(warnings).toContain("Network references do not execute social learning");
    expect(warnings).toContain("Feedback references do not run social feedback loops");
    expect(warnings).toContain("Uncertainty references do not validate belief distributions");
    expect(warnings).toContain("Model schema references do not make social, memory, or belief rules executable");
    expect(warnings).toContain("Control references do not execute persuasion, policy, or intervention guidance");
    expect(warnings).toContain("Quantity semantics references do not validate belief measurement");
    expect(warnings).toContain("Broad applicability");
    expect(warnings).toContain("Full-human-cognition wording is unsupported");
    expect(warnings).toContain("LLM-agent wording is unsupported");
    expect(warnings).toContain("Real-world policy");

    const diagnosisWarnings = getKnowledgeMemorySocialLearningWarnings(
      minimalModel({
        description:
          "Real-person profiling, protected attribute inference, psychological diagnosis, and policy recommendation are unsupported wording."
      })
    ).join("\n");
    expect(diagnosisWarnings).toContain("Real-person profiling wording is unsupported");
    expect(diagnosisWarnings).toContain("Protected-class inference wording is unsupported");
    expect(diagnosisWarnings).toContain("Psychological-diagnosis wording is unsupported");
    expect(diagnosisWarnings).toContain("Real-world policy");
  });

  it("queries, summarizes, reports, and preserves input immutability", () => {
    const model = fullModel();
    const before = JSON.stringify(model);
    expect(listBeliefVariables(minimalModel())).toEqual([]);
    expect(listBeliefStates(minimalModel())).toEqual([]);
    expect(listMemoryTraceDescriptors(minimalModel())).toEqual([]);
    expect(listAttentionProfiles(minimalModel())).toEqual([]);
    expect(listTrustProfiles(minimalModel())).toEqual([]);
    expect(listExposureChannels(minimalModel())).toEqual([]);
    expect(listSocialSignals(minimalModel())).toEqual([]);
    expect(listLearningRuleDescriptors(minimalModel())).toEqual([]);
    expect(listBackgroundProfiles(minimalModel())).toEqual([]);
    expect(listRelationshipRoles(minimalModel())).toEqual([]);
    expect(listNormDescriptors(minimalModel())).toEqual([]);
    expect(listDecisionCouplings(minimalModel())).toEqual([]);
    expect(listKnowledgeItems(model)).toHaveLength(2);
    expect(getKnowledgeItem(model, "topic-risk")?.category).toBe("risk");
    expect(listKnowledgeItemsByCategory(model, "socialSignal")).toHaveLength(1);
    expect(listKnowledgeItemsByAbstractionLevel(model, "population")).toHaveLength(1);
    expect(listBeliefVariables(model)).toHaveLength(1);
    expect(getBeliefVariable(model, "risk-belief")?.beliefKind).toBe("riskPerception");
    expect(listBeliefStates(model)).toHaveLength(1);
    expect(getBeliefStateDescriptor(model, "risk-prior")?.stateKind).toBe("prior");
    expect(listMemoryTraceDescriptors(model)).toHaveLength(1);
    expect(getMemoryTraceDescriptor(model, "recent-signal")?.memoryKind).toBe("recentExposure");
    expect(listAttentionProfiles(model)).toHaveLength(1);
    expect(getAttentionProfile(model, "salience")?.attentionKind).toBe("salience");
    expect(listTrustProfiles(model)).toHaveLength(2);
    expect(getTrustProfile(model, "crowd-source")?.sourceType).toBe("crowd");
    expect(listTrustProfilesBySourceType(model, "stranger")).toHaveLength(1);
    expect(listExposureChannels(model)).toHaveLength(1);
    expect(getExposureChannel(model, "crowd-channel")?.channelKind).toBe("crowdSignal");
    expect(listSocialSignals(model)).toHaveLength(1);
    expect(getSocialSignal(model, "consensus-signal")?.signalKind).toBe("consensusSignal");
    expect(listLearningRuleDescriptors(model)).toHaveLength(1);
    expect(getLearningRuleDescriptor(model, "trust-weighted")?.learningKind).toBe("trustWeightedUpdate");
    expect(listLearningRulesByKind(model, "trustWeightedUpdate")).toHaveLength(1);
    expect(listBackgroundProfiles(model)).toHaveLength(1);
    expect(getBackgroundProfile(model, "prior-profile")?.backgroundKind).toBe("priorBeliefProfile");
    expect(listRelationshipRoles(model)).toHaveLength(1);
    expect(getRelationshipRole(model, "crowd-role")?.roleKind).toBe("crowd");
    expect(listNormDescriptors(model)).toHaveLength(1);
    expect(getNormDescriptor(model, "local-norm")?.normKind).toBe("localNorm");
    expect(listDecisionCouplings(model)).toHaveLength(1);
    expect(getDecisionCoupling(model, "belief-action")?.couplingKind).toBe("beliefToBehavior");
    expect(modelHasLearningKind(model, "trustWeightedUpdate")).toBe(true);
    expect(modelHasSourceType(model, "crowd")).toBe(true);
    expect(modelUsesCrowdOrStrangerAbstraction(model)).toBe(true);
    expect(summarizeKnowledgeMemorySocialLearningModel(model)).toMatchObject({
      id: "opinion-social-semantics",
      knowledgeItemCount: 2,
      activeDescriptorCount: 13,
      executableCount: 0
    });
    const report = getKnowledgeMemorySocialLearningValidationReport(model);
    expect(report).toMatchObject({
      valid: true,
      runnableNow: false,
      socialLearningRuntimeAvailable: false,
      humanCognitionRuntimeAvailable: false,
      llmAgentRuntimeAvailable: false
    });
    expect(report.missingCapabilities).toEqual(
      expect.arrayContaining([
        "runtime social learning",
        "belief and memory runtime updates",
        "social exposure sampling",
        "protected-class inference safeguards",
        "persuasion/microtargeting prevention",
        "policy-guidance validation"
      ])
    );
    expect(getKnowledgeMemorySocialLearningValidationReport({ ...minimalModel(), id: "" })).toMatchObject({
      modelId: "",
      valid: false,
      runnableNow: false,
      socialLearningRuntimeAvailable: false,
      humanCognitionRuntimeAvailable: false,
      llmAgentRuntimeAvailable: false
    });

    const item = listKnowledgeItems(model)[0] as { label: string };
    item.label = "Mutated";
    expect(getKnowledgeItem(model, "topic-risk")?.label).toBe("Topic Risk");
    expect(JSON.stringify(model)).toBe(before);
  });

  it("serializes only social-learning semantics artifacts and rejects unsafe imports", () => {
    const json = serializeKnowledgeMemorySocialLearningModel(fullModel());
    expect(json).toContain(`"artifactType": "${knowledgeMemorySocialLearningArtifactType}"`);
    expect(deserializeKnowledgeMemorySocialLearningModel(json)).toMatchObject({ id: "opinion-social-semantics" });

    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.networkMetrics",
      "ortus.resourceSystem",
      "ortus.resourceMetrics",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.feedbackEventMetrics",
      "ortus.hybridComposition",
      "ortus.scaleModel",
      "ortus.scaleViewState",
      "ortus.boundaryModel",
      "ortus.fieldLayer",
      "ortus.observabilityModel",
      "ortus.causalAssumptionModel",
      "ortus.quantitySemanticsModel",
      "ortus.emergencePatternModel",
      "ortus.robustnessResilienceModel",
      "ortus.controlStrategyModel",
      "ortus.modelSchema"
    ]) {
      expect(() => deserializeKnowledgeMemorySocialLearningModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }

    for (const metadata of [
      { world: {} },
      { formula: "x + y" },
      { code: "return true" },
      { dataset: [] },
      { observedData: [] },
      { timeSeries: [] },
      { trainingData: [] },
      { embeddings: [] },
      { modelWeights: [] },
      { llm: "agent" },
      { promptChain: "reason" },
      { promptTemplate: "reason" },
      { agentRuntime: {} },
      { freeTextMemory: "biography" },
      { runtimeMemory: "unbounded notes" },
      { realPersonProfile: {} },
      { protectedAttributeInference: {} },
      { psychologicalDiagnosis: {} },
      { personalityDiagnosis: {} },
      { microtargeting: {} },
      { policyGuidance: {} },
      { treatmentEffectEstimate: {} },
      { proof: {} },
      { certification: {} },
      { safetyScore: 1 },
      { riskScore: 1 }
    ]) {
      expect(() => deserializeKnowledgeMemorySocialLearningModel(JSON.stringify(minimalModel({ metadata: metadata as never })))).toThrow();
    }
    expect(() => deserializeKnowledgeMemorySocialLearningModel(JSON.stringify({ ...minimalModel(), knowledgeItems: "bad" }))).toThrow(/knowledgeItems/);
    expect(() => deserializeKnowledgeMemorySocialLearningModel("x".repeat(300_000))).toThrow(/JSON/);
  });

  it("integrates with registry, hybrid composition, model schema, and templates without generic semantics runtime support", () => {
    expect(getPrimitive("knowledgeMemorySocialLearning")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("knowledgeMemorySocialLearning");
    expect(getPrimitive("socialLearningRuntime")).toMatchObject({ status: "reserved" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).toContain("socialLearningRuntime");
    expect(getArtifactFamily(knowledgeMemorySocialLearningArtifactType)).toMatchObject({
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true,
      primitiveId: "knowledgeMemorySocialLearning"
    });

    const composition = hybridComposition({
      primitiveAttachments: [
        {
          id: "social-ref",
          primitiveId: "knowledgeMemorySocialLearning",
          attachmentType: "knowledgeMemorySocialLearningModel",
          mode: "reference",
          artifactType: knowledgeMemorySocialLearningArtifactType,
          artifactId: "opinion-social-semantics",
          active: true,
          required: true
        }
      ]
    });
    expect(validateHybridComposition(composition).primitiveAttachments[0]).toMatchObject({ attachmentType: "knowledgeMemorySocialLearningModel" });
    const report = validateCompositionCapabilities(composition);
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "knowledgeMemorySocialLearning", requiredSupportLevel: "runtime" });
    expect(() =>
      validateHybridComposition(hybridComposition({ requiredCapabilities: [{ primitiveId: "socialLearningRuntime", requiredSupportLevel: "runtime" }] }))
    ).toThrow(/Reserved primitive socialLearningRuntime/);

    expect(
      validateCompositionCapabilities(hybridComposition({ requiredCapabilities: [{ primitiveId: "modelSchema", requiredSupportLevel: "runtime" }] })).runnableNow
    ).toBe(false);
    for (const primitiveId of ["visualModelBuilder", "validationCalibration", "socialLearningRuntime"] as const) {
      expect(
        validateCompositionCapabilities(hybridComposition({ requiredCapabilities: [{ primitiveId, requiredSupportLevel: "metadata" }] })).runnableNow
      ).toBe(false);
    }

    const modelSchemaReport = getKnowledgeMemorySocialLearningValidationReport(fullModel({ scope: { modelSchemaId: "schema-1" } }));
    expect(modelSchemaReport.runnableNow).toBe(false);
    const schemaWithSocialReference = {
      artifactType: "ortus.modelSchema",
      id: "s",
      name: "S",
      version: "1",
      schemaVersion: "1",
      entityTypes: [{ id: "agent", label: "Agent", entityKind: "agent", active: true, executable: false }],
      ruleDeclarations: [
        { id: "social", label: "Social", ruleKind: "socialLearning", ruleDescription: "Structural only.", active: true, executable: false },
        { id: "memory", label: "Memory", ruleKind: "memoryUpdate", ruleDescription: "Structural only.", active: true, executable: false },
        { id: "belief", label: "Belief", ruleKind: "beliefUpdate", ruleDescription: "Structural only.", active: true, executable: false }
      ],
      artifactReferences: [
        {
          id: "social-semantics-ref",
          label: "Social Semantics Ref",
          artifactType: knowledgeMemorySocialLearningArtifactType,
          artifactId: "opinion-social-semantics",
          primitiveId: "knowledgeMemorySocialLearning",
          role: "context",
          active: true,
          executable: false
        }
      ]
    } as const;
    expect(schemaHasRuleKind(schemaWithSocialReference, "socialLearning")).toBe(true);
    expect(schemaHasArtifactType(schemaWithSocialReference, knowledgeMemorySocialLearningArtifactType)).toBe(true);
    expect(getModelInterpreterCapabilityReport(schemaWithSocialReference)).toMatchObject({
      valid: true,
      runnableNow: false,
      interpreterAvailable: false,
      executableRuleCount: 0,
      unsupportedRuleKinds: expect.arrayContaining(["socialLearning", "memoryUpdate", "beliefUpdate"]),
      missingRuntimeCapabilities: expect.arrayContaining(["social/cognitive runtime"])
    });

    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "knowledgeMemorySocialLearning")).toMatchObject({
        status: "unsupported",
        supportLevel: "none",
        runtimeActive: false,
        serviceAvailable: true
      });
    }
    expect(getTemplateCapability("opinion-dynamics", "knowledgeMemorySocialLearning")?.notes).toContain("does not execute social-learning runtime");
    expect(getTemplateCapability("opinion-dynamics", "socialLearningRuntime")).toMatchObject({ status: "unsupported", runtimeActive: false });
    expect(opinionTemplate.behaviorModes?.map((mode) => mode.id)).toEqual(["default", "socialLearning"]);
    expect(opinionTemplate.capabilities?.supportsTemplateOwnedSocialLearning).toBe(true);
    expect(opinionTemplate.capabilities?.supportsInformationSourceExposure).toBe(true);
    expect(opinionTemplate.documentation.limitations.join("\n")).toContain("not a social prediction model");
    expect(opinionTemplate.documentation.limitations.join("\n")).toContain(
      "Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template."
    );
    expect(opinionTemplate.metricDefinitions?.every((metric) => metric.source === "modelState" || metric.source === "derived" || metric.source === "input")).toBe(
      true
    );
  });

  it("updates docs, assumptions, and architecture boundaries without overclaiming", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "planned_roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "codex", "CURRENT_CONTEXT.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "codex", "SESSION_LOG.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition.");
    expect(docs).toContain("Background profiles are compressed prior descriptors, not simulated life histories.");
    expect(docs).toContain(
      "Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals."
    );
    expect(docs).toContain("LLM-per-agent runtime is not implemented and must not be implied.");
    expect(docs).toContain("Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.");
    expect(docs).toContain("Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template.");
    expect(docs).toContain("Opinion values and social-learning metrics are model outputs, not measured human beliefs.");
    expect(docs).toContain("Information-source credibility is a model parameter, not a verified truth score.");
    expect(docs).toContain(
      "No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented."
    );
    expect(docs).toContain(
      "Hierarchical trajectory motifs describe repeated observable state-action sequences. They do not reveal thoughts, intentions, beliefs, personality, or subconscious mental states."
    );

    const assumptionText = productionTemplates
      .flatMap((template) => template.assumptionProfile?.limitations.map((item) => item.description) ?? [])
      .join("\n");
    expect(assumptionText).toContain("No current template executes KnowledgeMemorySocialLearningModel artifacts as runtime cognition or LLM agents.");
    expect(assumptionText).toContain("Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.");
    expect(assumptionText).toContain("Knowledge, memory, and social-learning descriptors are structural only");

    const source = readdirSync(join(repoRoot, "src", "simulation", "socialLearning"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(repoRoot, "src", "simulation", "socialLearning", file), "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']zustand["']/);
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.");
    expect(source).not.toContain("Canvas");
    expect(source).not.toContain("SimulationEngine");
    expect(source).not.toMatch(/from ["'].*templates/);
    expect(source).not.toMatch(/from ["'].*experiments/);
    expect(source).not.toMatch(/from ["'].*interventions/);
    expect(source).not.toMatch(/from ["'].*modelSchema/);

    const opinionSource = readFileSync(join(repoRoot, "src", "simulation", "templates", "opinion.template.ts"), "utf8");
    expect(opinionSource).not.toMatch(/from ["'].*socialLearning/);
    expect(opinionSource).not.toContain("knowledgeMemorySocialLearning");
    expect(opinionSource).not.toContain("socialLearningRuntime");
  });
});
