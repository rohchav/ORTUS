import type {
  BehaviorModeDefinition,
  EntityTypeDefinition,
  InitializationConfig,
  InitializationPresetDefinition,
  JsonValue,
  MetricDefinition,
  ModelDocumentation,
  ParameterDefinition,
  ParameterValues,
  SimulationSnapshotView,
  SimulationTemplate,
  System,
  TemplateCapabilities,
  TemplateSpaceDefinition
} from "../kernel/types";
import { SimulationValidationError } from "../kernel/Errors";
import { World } from "../kernel/World";
import { Continuous2DSpace, continuous2DQueryDiagnosticsDelta } from "../spaces/Continuous2DSpace";
import type { Point2D } from "../spaces/Space";
import { Position2D } from "./epidemic.template";
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const OPINION_SPACE_ID = "opinion-space";
export const OpinionState = "OpinionState";
export const OpinionSocialLearningState = "OpinionSocialLearningState";

export interface OpinionStateComponent {
  value: number;
  stubbornness: number;
}

export interface OpinionSocialLearningStateComponent extends Record<string, number> {
  memory: number;
  salience: number;
  lastOpinionShift: number;
  lastNeighborInfluence: number;
  lastSourceInfluence: number;
  lastCrowdInfluence: number;
  lastMemoryInfluence: number;
  lastConfirmationWeight: number;
  lastTrustWeight: number;
  lastCredibilityWeightedExposure: number;
}

export const opinionInformationSourceCategories = ["institutional", "peer", "community", "media", "expert", "crowd", "custom"] as const;
export type OpinionInformationSourceCategory = (typeof opinionInformationSourceCategories)[number];

export interface OpinionInformationSource {
  id: string;
  label: string;
  category: OpinionInformationSourceCategory;
  signal: number;
  credibility: number;
  exposure: number;
  influence: number;
}

type OpinionBehaviorModeId = "default" | "socialLearning";

interface OpinionSocialLearningTarget extends Record<string, number> {
  opinionShift: number;
  neighborInfluence: number;
  sourceInfluence: number;
  crowdInfluence: number;
  memoryInfluence: number;
  confirmationWeight: number;
  trustWeight: number;
  credibilityWeightedExposure: number;
}

const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "agentCount",
    label: "Agent count",
    type: "integer",
    defaultValue: 100,
    min: 1,
    max: 1000,
    step: 1,
    description: "Number of opinion agents.",
    liveUpdate: false
  },
  {
    key: "influenceRadius",
    label: "Influence radius",
    type: "number",
    defaultValue: 14,
    min: 0.1,
    max: 100,
    step: 0.1,
    description: "Spatial radius for social influence.",
    liveUpdate: true
  },
  {
    key: "influenceStrength",
    label: "Influence strength",
    type: "number",
    defaultValue: 0.18,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Fractional movement toward neighbors each tick.",
    liveUpdate: true
  },
  {
    key: "noise",
    label: "Noise",
    type: "number",
    defaultValue: 0.02,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Seeded random perturbation strength.",
    liveUpdate: true
  },
  {
    key: "initialPolarization",
    label: "Initial polarization",
    type: "number",
    defaultValue: 0.65,
    min: 0,
    max: 1,
    step: 0.01,
    description: "How strongly initial opinions cluster near extremes.",
    liveUpdate: false
  },
  {
    key: "socialLearningRate",
    label: "Social learning rate",
    type: "number",
    defaultValue: 0.3,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Bounded rate used only by the Opinion social-learning behavior mode.",
    liveUpdate: true
  },
  {
    key: "socialTrustWeight",
    label: "Social trust weight",
    type: "number",
    defaultValue: 0.7,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Weight on local social exposure in the Opinion social-learning behavior mode.",
    liveUpdate: true
  },
  {
    key: "confirmationBias",
    label: "Confirmation bias",
    type: "number",
    defaultValue: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Reduces modeled influence from signals farther from the current scalar opinion.",
    liveUpdate: true
  },
  {
    key: "memoryDecay",
    label: "Memory decay",
    type: "number",
    defaultValue: 0.18,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Bounded update rate for the compressed scalar memory used by social-learning mode.",
    liveUpdate: true
  },
  {
    key: "salienceWeight",
    label: "Salience weight",
    type: "number",
    defaultValue: 0.25,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Weight for bounded salience and memory carry-over in social-learning mode.",
    liveUpdate: true
  },
  {
    key: "sourceExposureStrength",
    label: "Source exposure strength",
    type: "number",
    defaultValue: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Overall strength of fixed information-source exposure in social-learning mode.",
    liveUpdate: true
  },
  {
    key: "sourceTrustSensitivity",
    label: "Source trust sensitivity",
    type: "number",
    defaultValue: 0.65,
    min: 0,
    max: 1,
    step: 0.01,
    description: "How strongly model-source credibility changes fixed-source exposure weight.",
    liveUpdate: true
  },
  {
    key: "maxSourceInfluencePerTick",
    label: "Max source influence",
    type: "number",
    defaultValue: 0.08,
    min: 0,
    max: 0.5,
    step: 0.005,
    description: "Bound on total fixed-source contribution per tick.",
    liveUpdate: true
  },
  {
    key: "crowdSignal",
    label: "Crowd signal",
    type: "number",
    defaultValue: 0,
    min: -1,
    max: 1,
    step: 0.01,
    description: "Aggregate crowd/stranger exposure signal used only by social-learning mode.",
    liveUpdate: true
  },
  {
    key: "crowdSignalStrength",
    label: "Crowd signal strength",
    type: "number",
    defaultValue: 0.15,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Bounded influence of the aggregate crowd signal.",
    liveUpdate: true
  },
  {
    key: "maxOpinionShiftPerTick",
    label: "Max opinion shift",
    type: "number",
    defaultValue: 0.12,
    min: 0,
    max: 0.5,
    step: 0.005,
    description: "Bound on the total social-learning opinion update before optional existing noise.",
    liveUpdate: true
  },
  {
    key: "sourceOneSignal",
    label: "Source one signal",
    type: "number",
    defaultValue: 0.55,
    min: -1,
    max: 1,
    step: 0.01,
    description: "Fixed model signal for the first information source.",
    liveUpdate: true
  },
  {
    key: "sourceOneCredibility",
    label: "Source one credibility",
    type: "number",
    defaultValue: 0.65,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Model credibility weight for the first source; this is not a verified truth score.",
    liveUpdate: true
  },
  {
    key: "sourceOneExposure",
    label: "Source one exposure",
    type: "number",
    defaultValue: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Exposure level for the first fixed source.",
    liveUpdate: true
  },
  {
    key: "sourceOneInfluence",
    label: "Source one influence",
    type: "number",
    defaultValue: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Relative model influence for the first fixed source.",
    liveUpdate: true
  },
  {
    key: "sourceTwoSignal",
    label: "Source two signal",
    type: "number",
    defaultValue: -0.35,
    min: -1,
    max: 1,
    step: 0.01,
    description: "Fixed model signal for the second information source.",
    liveUpdate: true
  },
  {
    key: "sourceTwoCredibility",
    label: "Source two credibility",
    type: "number",
    defaultValue: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Model credibility weight for the second source; this is not a verified truth score.",
    liveUpdate: true
  },
  {
    key: "sourceTwoExposure",
    label: "Source two exposure",
    type: "number",
    defaultValue: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Exposure level for the second fixed source.",
    liveUpdate: true
  },
  {
    key: "sourceTwoInfluence",
    label: "Source two influence",
    type: "number",
    defaultValue: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Relative model influence for the second fixed source.",
    liveUpdate: true
  }
];

const behaviorModes: BehaviorModeDefinition[] = [
  {
    id: "default",
    label: "Classic influence",
    description: "Agents adjust continuous opinions through local social influence and seeded noise.",
    templateId: "opinion-dynamics",
    supportedCompositionFields: ["agentCount", "initialPolarization"],
    documentation: "The default mode preserves the original scalar-neighbor influence runtime."
  },
  {
    id: "socialLearning",
    label: "Social learning",
    description: "Adds bounded template-owned source exposure, aggregate crowd exposure, and scalar memory/salience to Opinion Dynamics.",
    templateId: "opinion-dynamics",
    supportedCompositionFields: ["agentCount", "initialPolarization"],
    supportedParameters: [
      "influenceRadius",
      "influenceStrength",
      "noise",
      "socialLearningRate",
      "socialTrustWeight",
      "confirmationBias",
      "memoryDecay",
      "salienceWeight",
      "sourceExposureStrength",
      "sourceTrustSensitivity",
      "maxSourceInfluencePerTick",
      "crowdSignal",
      "crowdSignalStrength",
      "maxOpinionShiftPerTick",
      "sourceOneSignal",
      "sourceOneCredibility",
      "sourceOneExposure",
      "sourceOneInfluence",
      "sourceTwoSignal",
      "sourceTwoCredibility",
      "sourceTwoExposure",
      "sourceTwoInfluence"
    ],
    documentation:
      "Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.",
    limitations: [
      "Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template.",
      "Opinion values and social-learning metrics are model outputs, not measured human beliefs.",
      "Information-source credibility is a model parameter, not a verified truth score.",
      "No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented."
    ],
    metricNotes: "Social-learning metrics summarize bounded model-state updates only; they are not empirical measurements."
  }
];

const agentCompositionDefinitions: ParameterDefinition[] = [parameterDefinition("agentCount"), parameterDefinition("initialPolarization")];

const capabilities: TemplateCapabilities = {
  supportsScenarioBuilder: true,
  supportsInitializationPresets: true,
  supportsAgentComposition: true,
  supportsBehaviorModes: true,
  supportsEnvironmentOptions: false,
  supportsInterventions: true,
  supportsMetricHistory: true,
  supportsRunComparison: true,
  supportsExperimentRunner: true,
  supportsSnapshotExport: true,
  supportsContinuousSpace: true,
  supportsGridSpace: false,
  supportsNetworkSpace: false,
  supportsNetworkOptions: false,
  supportsNetworkMetrics: false,
  supportsResources: false,
  supportsStocks: false,
  supportsFlows: false,
  supportsResourceMetrics: false,
  supportsEvents: false,
  supportsDelays: false,
  supportsFeedbackLoops: false,
  supportsFeedbackMetrics: false,
  supportsEnvironmentLayers: false,
  supportsUncertaintyConfig: true,
  supportsTemplateOwnedSocialLearning: true,
  supportsInformationSourceExposure: true
};

const spaceDefinition: TemplateSpaceDefinition = {
  type: "continuous2d",
  spaceId: OPINION_SPACE_ID,
  description: "A continuous 2D interaction field where nearby agents influence each other.",
  boundaryMode: "wrap",
  dimensions: { width: 100, height: 100 }
};

const runtimeMetadata = {
  expectedScaleClass: "medium",
  neighborSearchStrategy: "continuousSpatialHash",
  hotLoopNotes: [
    "Opinion sensing calls Continuous2DSpace.queryNeighbors for each agent; the generic continuous reader uses a tick-local spatial index for local-radius queries.",
    "The social-learning behavior mode reuses the same neighbor query path and adds fixed source/crowd scalar calculations per agent.",
    "Tiny worlds and broad/global radii still use deterministic all-pairs fallback.",
    "Opinion updates are batched through the command buffer after target opinions are computed."
  ],
  defaultEntityCount: 100,
  stressEntityCount: 500,
  knownPerformanceLimits: [
    "Broad influenceRadius settings can still approach O(agents^2) neighbor checks when fallback is selected.",
    "Metric and snapshot cost grows with full entity/component serialization."
  ]
} as const;

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "opinionAgent",
    label: "Opinion agent",
    description: "Mobile social agent with scalar opinion, stubbornness, and optional bounded social-learning state.",
    components: [Position2D, OpinionState, OpinionSocialLearningState],
    representedAs: "entity",
    configurableCount: true,
    countParameterKey: "agentCount",
    defaultVisual: { color: "#f2c94c", label: "Opinion agent" }
  }
];

const initializationPresets: InitializationPresetDefinition[] = [
  {
    id: "random-opinions",
    label: "Random Opinions",
    description: "Opinions are seeded uniformly across the full [-1, 1] range.",
    parameterOverrides: { initialPolarization: 0.5 }
  },
  {
    id: "polarized-camps",
    label: "Polarized Camps",
    description: "Two camps start near opposite opinion values.",
    parameterOverrides: { initialPolarization: 0.75 }
  },
  {
    id: "consensus-start",
    label: "Consensus Start",
    description: "Most agents begin near a shared opinion with bounded spread.",
    parameterOverrides: { initialPolarization: 0.1 },
    optionDefinitions: [
      {
        key: "meanOpinion",
        label: "Mean opinion",
        type: "number",
        defaultValue: 0,
        min: -1,
        max: 1,
        step: 0.05,
        description: "Shared starting opinion center.",
        liveUpdate: false
      },
      {
        key: "spread",
        label: "Spread",
        type: "number",
        defaultValue: 0.15,
        min: 0,
        max: 1,
        step: 0.01,
        description: "Random deviation around the shared opinion.",
        liveUpdate: false
      }
    ]
  }
];

const documentation: ModelDocumentation = {
  purpose: "Show how local influence can produce convergence, clustering, or polarization.",
  entities: ["Agents with continuous opinions in a 2D space."],
  stateVariables: ["Position2D", "OpinionState", "OpinionSocialLearningState in the socialLearning behavior mode"],
  processOverview:
    "Agents sense nearby opinions, compute target averages, then update gradually with optional seeded noise. The socialLearning behavior mode adds bounded template-owned source exposure, aggregate crowd exposure, and scalar memory/salience updates.",
  scheduling: "Neighbor sensing runs in sense, opinion updates in decide, noise in act, and metrics after the step.",
  designConcepts: {
    emergence: "Population-level convergence or clustering can emerge from local influence.",
    adaptation: "Agents adjust opinions toward local neighbors depending on stubbornness; socialLearning mode also uses bounded scalar source/crowd/memory terms.",
    interaction: "Influence depends on spatial neighbors and, in socialLearning mode only, fixed aggregate source/crowd exposure parameters.",
    stochasticity: "Optional noise uses deterministic seeded RNG streams.",
    observation: "Average opinion, variance, polarization score, and social-learning runtime metrics are collected as model outputs."
  },
  initialization: "Agents are seeded in continuous space with opinions distributed according to initial polarization.",
  submodels: [
    "Neighbor averaging",
    "Stubbornness-weighted update",
    "Opinion noise",
    "Bounded Opinion social-learning source/crowd/memory update"
  ],
  assumptions: [
    "Opinion is represented as a scalar in [-1, 1].",
    "Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.",
    "Information-source credibility is a model parameter, not a verified truth score."
  ],
  limitations: [
    "This template is conceptual and not a social prediction model.",
    "These models are exploratory simulations, not calibrated predictive tools.",
    "Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template.",
    "Opinion values and social-learning metrics are model outputs, not measured human beliefs.",
    "No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented."
  ],
  notRepresented: [
    "Explicit social or media network topology",
    "network platforms",
    "media institutions",
    "attention budgets",
    "media supply",
    "world bounds as a full environment model",
    "explicit system boundary or environment layer",
    "explicit spatial/environmental field layers",
    "positions as environmental field layers",
    "external forcing or exogenous shocks",
    "platform or media feedback cycles",
    "platform incentives",
    "identity",
    "strategic communication",
    "unbounded memory",
    "free-text biographies",
    "adaptive cognition or memory beyond the bounded scalar social-learning state",
    "measurement or observability model for real opinions",
    "causal validation of influence mechanisms",
    "multi-issue beliefs",
    "misinformation detection",
    "fact checking",
    "recommendation systems",
    "persuasion optimization",
    "microtargeting"
  ],
  appropriateUse: ["Exploring stylized local influence, polarization sensitivity, noise effects, and seed-dependent convergence."],
  inappropriateUse: [
    "Predicting elections, modeling real communities, making claims about actual social groups, profiling real people, inferring protected classes, optimizing persuasion, or diagnosing psychology."
  ]
};

const assumptionProfile = createTemplateAssumptionProfile({
  templateId: "opinion-dynamics",
  assumptions: documentation.assumptions,
  limitations: documentation.limitations,
  notRepresented: documentation.notRepresented ?? [],
  appropriateUse: documentation.appropriateUse ?? [],
  inappropriateUse: documentation.inappropriateUse ?? [],
  ethicsNotes: [
    "Do not use simplified opinion dynamics to profile, manipulate, or predict real groups.",
    "Scalar opinion values omit identity, culture, media systems, institutions, and strategic persuasion.",
    "Opinion values and social-learning metrics are model outputs, not measured human beliefs.",
    "No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented."
  ],
  validationStatus: "internallyTested",
  validationNotes:
    "Internally tested through deterministic engine, validation, serialization, social-learning behavior, and template smoke tests. Not calibrated or externally validated."
});

const metricDefinitions = opinionMetrics();

export const opinionTemplate: SimulationTemplate = {
  id: "opinion-dynamics",
  name: "Opinion Dynamics",
  description: "Local influence model for continuous opinions.",
  version: "1.0.0",
  capabilities,
  spaceDefinition,
  entityTypeDefinitions,
  runtimeMetadata,
  parameterDefinitions,
  metricDefinitions,
  initializationPresets,
  behaviorModes,
  agentCompositionDefinitions,
  documentation,
  assumptionProfile,
  createInitialWorld(ctx) {
    const params = opinionParams(ctx.params);
    const behaviorMode = opinionBehaviorModeFromScenario(ctx.scenario?.behaviorMode);
    const informationSources = behaviorMode === "socialLearning" ? opinionInformationSourcesFromParams(params) : [];
    const world = new World({
      globals: {
        opinionBehaviorMode: behaviorMode,
        opinionInformationSourceCount: informationSources.length,
        opinionSocialLearningRuntimeScope: behaviorMode === "socialLearning" ? "template-owned-opinion-only" : "inactive"
      }
    });
    const space = new Continuous2DSpace({ id: OPINION_SPACE_ID, width: 100, height: 100, boundaryMode: "wrap" });
    world.addSpace(space);
    const initRng = ctx.rng.fork("opinion:init");

    for (let index = 0; index < params.agentCount; index += 1) {
      const entity = world.entityStore.create("opinion-agent", { createdAtTick: 0, label: `Opinion ${index + 1}` });
      const position = { x: initRng.float() * 100, y: initRng.float() * 100 };
      const opinion = initialOpinionValue(index, params.initialPolarization, ctx.initialization, initRng.float() * 2 - 1);
      const stubbornness = initRng.float() * 0.45;
      world.componentStore.add(entity.id, Position2D, position);
      world.componentStore.add(entity.id, OpinionState, { value: opinion, stubbornness });
      if (behaviorMode === "socialLearning") {
        world.componentStore.add(entity.id, OpinionSocialLearningState, initialSocialLearningState(opinion));
      }
      space.addEntity(entity.id, position);
    }

    return world;
  },
  registerSystems(registry) {
    registry.register(createOpinionNeighborSensingSystem());
    registry.register(createOpinionUpdateSystem());
    registry.register(createOpinionNoiseSystem());
  },
  registerMetrics(registry) {
    for (const metric of metricDefinitions) {
      registry.register(metric);
    }
  },
  getVisuals(_snapshot: SimulationSnapshotView) {
    return {
      components: {
        opinionStateComponent: OpinionState
      },
      colors: {
        negative: "#3154a3",
        neutral: "#f2c94c",
        positive: "#c23b5a"
      },
      labels: {
        negative: "Negative opinion",
        neutral: "Neutral opinion",
        positive: "Positive opinion"
      },
      description: "Opinion value can be mapped across negative, neutral, and positive colors."
    };
  },
  validateWorld(world) {
    for (const entityId of componentEntityIds(world, OpinionState)) {
      const opinion = world.getComponent<OpinionStateComponent>(entityId, OpinionState);
      if (
        !opinion ||
        !Number.isFinite(opinion.value) ||
        opinion.value < -1 ||
        opinion.value > 1 ||
        !Number.isFinite(opinion.stubbornness) ||
        opinion.stubbornness < 0 ||
        opinion.stubbornness > 1
      ) {
        throw new SimulationValidationError(`Invalid OpinionState component on ${entityId}`);
      }
    }
    for (const entityId of componentEntityIds(world, OpinionSocialLearningState)) {
      const social = world.getComponent<OpinionSocialLearningStateComponent>(entityId, OpinionSocialLearningState);
      if (!isValidOpinionSocialLearningState(social)) {
        throw new SimulationValidationError(`Invalid OpinionSocialLearningState component on ${entityId}`);
      }
    }
    for (const entityId of componentEntityIds(world, Position2D)) {
      const position = world.getComponent<Point2D>(entityId, Position2D);
      if (!isFinitePoint(position)) {
        throw new SimulationValidationError(`Invalid Position2D component on ${entityId}`);
      }
    }
    opinionBehaviorModeFromWorld(world.globals);
    const sourceCount = world.globals.opinionInformationSourceCount;
    if (
      sourceCount !== undefined &&
      (typeof sourceCount !== "number" || !Number.isInteger(sourceCount) || sourceCount < 0 || sourceCount > 2)
    ) {
      throw new SimulationValidationError("Invalid opinion information source count");
    }
  },
  validateParameters(params) {
    opinionParams(params);
  },
  validateScenarioOptions(options) {
    opinionBehaviorModeFromScenario(options.behaviorMode);
  },
  validateInitializationOptions(initialization) {
    if (initialization.presetId === "consensus-start") {
      const mean = finiteOption(initialization, "meanOpinion", 0);
      const spread = finiteOption(initialization, "spread", 0.15);
      if (mean < -1 || mean > 1 || spread < 0 || spread > 1) {
        throw new SimulationValidationError("Consensus opinion options must stay within their configured ranges");
      }
    }
  }
};

function parameterDefinition(key: string): ParameterDefinition {
  const definition = parameterDefinitions.find((candidate) => candidate.key === key);
  if (!definition) {
    throw new Error(`Missing opinion parameter definition: ${key}`);
  }
  return definition;
}

export function createOpinionNeighborSensingSystem(): System {
  return {
    id: "OpinionNeighborSensingSystem",
    phase: "sense",
    priority: 0,
    query: [Position2D, OpinionState],
    update(ctx) {
      const params = opinionParams(ctx.params);
      const behaviorMode = opinionBehaviorModeFromWorld(ctx.world.globals);
      const informationSources = behaviorMode === "socialLearning" ? opinionInformationSourcesFromParams(params) : [];
      const space = ctx.spaces.continuous2D(OPINION_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Opinion space is missing");
      }
      const targets: Record<string, number> = {};
      const socialTargets: Record<string, OpinionSocialLearningTarget> = {};
      const diagnosticsBefore = space.queryDiagnostics();
      for (const entityId of ctx.entityIds ?? []) {
        const own = ctx.world.getComponent<OpinionStateComponent>(entityId, OpinionState);
        if (!own) {
          continue;
        }
        const neighbors = space
          .queryNeighbors(entityId, params.influenceRadius)
          .map((neighbor) => ({
            id: neighbor.entityId,
            state: ctx.world.getComponent<OpinionStateComponent>(neighbor.entityId, OpinionState)
          }))
          .filter((neighbor): neighbor is { id: string; state: OpinionStateComponent } => neighbor.state !== undefined);
        if (neighbors.length === 0) {
          targets[entityId] = own.value;
          if (behaviorMode === "socialLearning") {
            const socialState =
              ctx.world.getComponent<OpinionSocialLearningStateComponent>(entityId, OpinionSocialLearningState) ??
              initialSocialLearningState(own.value);
            socialTargets[entityId] = socialLearningTargetFor(own, socialState, own.value, 0, informationSources, params);
          }
          continue;
        }
        const average = neighbors.reduce((sum, neighbor) => sum + neighbor.state.value, 0) / neighbors.length;
        targets[entityId] = average;
        if (behaviorMode === "socialLearning") {
          const socialState =
            ctx.world.getComponent<OpinionSocialLearningStateComponent>(entityId, OpinionSocialLearningState) ??
            initialSocialLearningState(own.value);
          socialTargets[entityId] = socialLearningTargetFor(own, socialState, average, neighbors.length, informationSources, params);
        }
      }
      recordContinuous2DCounters(ctx.performance, diagnosticsBefore, space.queryDiagnostics());
      ctx.commands.setGlobal("opinionTargets", targets, "opinion neighbor sensing");
      ctx.commands.setGlobal(
        "opinionSocialLearningTargets",
        behaviorMode === "socialLearning" ? socialTargets : {},
        "opinion social-learning sensing"
      );
      ctx.commands.setGlobal(
        "opinionInformationSourceCount",
        behaviorMode === "socialLearning" ? informationSources.length : 0,
        "opinion information-source exposure count"
      );
    }
  };
}

function recordContinuous2DCounters(
  performance: { recordCounter(counterId: string, value: number): void },
  before: ReturnType<Continuous2DSpace["queryDiagnostics"]>,
  after: ReturnType<Continuous2DSpace["queryDiagnostics"]>
): void {
  const delta = continuous2DQueryDiagnosticsDelta(before, after);
  performance.recordCounter("continuous2DNeighborQueries", delta.queryCount);
  performance.recordCounter("continuous2DAllPairsQueries", delta.allPairsQueries);
  performance.recordCounter("continuous2DSpatialIndexQueries", delta.spatialIndexQueries);
  performance.recordCounter("continuous2DSpatialIndexBuilds", delta.spatialIndexBuilds);
  performance.recordCounter("continuous2DNeighborDistanceChecks", delta.distanceChecks);
  performance.recordCounter("continuous2DSpatialIndexCandidateChecks", delta.spatialIndexCandidateChecks);
  performance.recordCounter("continuous2DSpatialIndexVisitedCells", delta.spatialIndexVisitedCells);
}

function componentEntityIds(world: { allEntities(): Array<{ id: string }>; hasComponent(entityId: string, componentType: string): boolean }, componentType: string): string[] {
  return world
    .allEntities()
    .filter((entity) => world.hasComponent(entity.id, componentType))
    .map((entity) => entity.id)
    .sort((left, right) => left.localeCompare(right));
}

function isFinitePoint(value: unknown): value is Point2D {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Point2D).x === "number" &&
    Number.isFinite((value as Point2D).x) &&
    typeof (value as Point2D).y === "number" &&
    Number.isFinite((value as Point2D).y)
  );
}

export function createOpinionUpdateSystem(): System {
  return {
    id: "OpinionUpdateSystem",
    phase: "decide",
    priority: 0,
    query: [OpinionState],
    update(ctx) {
      const params = opinionParams(ctx.params);
      const behaviorMode = opinionBehaviorModeFromWorld(ctx.world.globals);
      if (behaviorMode === "socialLearning") {
        const socialTargets = ctx.world.globals.opinionSocialLearningTargets;
        if (!isOpinionSocialLearningTargets(socialTargets)) {
          return;
        }
        for (const entityId of ctx.entityIds ?? []) {
          const state = ctx.world.getComponent<OpinionStateComponent>(entityId, OpinionState);
          const target = socialTargets[entityId];
          if (!state || target === undefined) {
            continue;
          }
          const currentSocial =
            ctx.world.getComponent<OpinionSocialLearningStateComponent>(entityId, OpinionSocialLearningState) ??
            initialSocialLearningState(state.value);
          const nextOpinion = clampOpinion(state.value + target.opinionShift);
          const nextSocial = nextSocialLearningState(currentSocial, nextOpinion, target, params);
          ctx.commands.patchComponent(entityId, OpinionState, { value: nextOpinion }, "opinion social-learning update");
          if (ctx.world.hasComponent(entityId, OpinionSocialLearningState)) {
            ctx.commands.setComponent(entityId, OpinionSocialLearningState, nextSocial, "opinion social-learning state update");
          } else {
            ctx.commands.addComponent(entityId, OpinionSocialLearningState, nextSocial, "opinion social-learning state initialization");
          }
        }
        return;
      }
      const targets = ctx.world.globals.opinionTargets;
      if (!isOpinionTargets(targets)) {
        return;
      }
      for (const entityId of ctx.entityIds ?? []) {
        const state = ctx.world.getComponent<OpinionStateComponent>(entityId, OpinionState);
        const target = targets[entityId];
        if (!state || target === undefined) {
          continue;
        }
        const updateAmount = (target - state.value) * params.influenceStrength * (1 - state.stubbornness);
        ctx.commands.patchComponent(
          entityId,
          OpinionState,
          { value: clampOpinion(state.value + updateAmount) },
          "opinion influence update"
        );
      }
    }
  };
}

export function createOpinionNoiseSystem(): System {
  return {
    id: "OpinionNoiseSystem",
    phase: "act",
    priority: 0,
    query: [OpinionState],
    update(ctx) {
      const params = opinionParams(ctx.params);
      if (params.noise === 0) {
        return;
      }
      const stream = ctx.rng.fork("opinion:noise");
      for (const entityId of ctx.entityIds ?? []) {
        const state = ctx.world.getComponent<OpinionStateComponent>(entityId, OpinionState);
        if (!state) {
          continue;
        }
        const perturbation = (stream.float() * 2 - 1) * params.noise;
        ctx.commands.patchComponent(entityId, OpinionState, { value: clampOpinion(state.value + perturbation) }, "opinion noise");
      }
    }
  };
}

export function opinionMetrics(): MetricDefinition[] {
  return [
    {
      key: "averageOpinion",
      id: "averageOpinion",
      label: "Average opinion",
      description: "Mean opinion value.",
      valueType: "number",
      range: { min: -1, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const states = opinionStates(world);
        return states.length === 0 ? 0 : states.reduce((sum, state) => sum + state.value, 0) / states.length;
      }
    },
    {
      key: "opinionVariance",
      id: "opinionVariance",
      label: "Opinion variance",
      description: "Variance of opinion values.",
      valueType: "number",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const states = opinionStates(world);
        if (states.length === 0) {
          return 0;
        }
        const average = states.reduce((sum, state) => sum + state.value, 0) / states.length;
        return states.reduce((sum, state) => sum + (state.value - average) ** 2, 0) / states.length;
      }
    },
    {
      key: "polarizationScore",
      id: "polarizationScore",
      label: "Polarization score",
      description: "Mean absolute opinion value.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const states = opinionStates(world);
        return states.length === 0 ? 0 : states.reduce((sum, state) => sum + Math.abs(state.value), 0) / states.length;
      }
    },
    {
      key: "meanOpinionShift",
      id: "meanOpinionShift",
      label: "Mean opinion shift",
      description: "Mean absolute bounded social-learning opinion shift. Model output, not measured human belief change.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => Math.abs(state.lastOpinionShift));
      }
    },
    {
      key: "meanNeighborInfluence",
      id: "meanNeighborInfluence",
      label: "Mean neighbor influence",
      description: "Mean absolute modeled neighbor contribution in Opinion social-learning mode.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => Math.abs(state.lastNeighborInfluence));
      }
    },
    {
      key: "meanSourceInfluence",
      id: "meanSourceInfluence",
      label: "Mean source influence",
      description: "Mean absolute modeled fixed-source contribution. Source credibility is a model parameter, not a verified truth score.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => Math.abs(state.lastSourceInfluence));
      }
    },
    {
      key: "meanCrowdInfluence",
      id: "meanCrowdInfluence",
      label: "Mean crowd influence",
      description: "Mean absolute modeled aggregate crowd-signal contribution.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => Math.abs(state.lastCrowdInfluence));
      }
    },
    {
      key: "meanMemoryInfluence",
      id: "meanMemoryInfluence",
      label: "Mean memory influence",
      description: "Mean absolute modeled bounded scalar memory contribution.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => Math.abs(state.lastMemoryInfluence));
      }
    },
    {
      key: "meanCredibilityWeightedExposure",
      id: "meanCredibilityWeightedExposure",
      label: "Mean credibility-weighted exposure",
      description: "Mean modeled source exposure weighted by model credibility; this is not a truth or quality score.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => state.lastCredibilityWeightedExposure);
      }
    },
    {
      key: "meanConfirmationWeight",
      id: "meanConfirmationWeight",
      label: "Mean confirmation weight",
      description: "Mean modeled confirmation weight in the bounded social-learning update.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => state.lastConfirmationWeight);
      }
    },
    {
      key: "meanTrustWeight",
      id: "meanTrustWeight",
      label: "Mean trust weight",
      description: "Mean modeled trust/stubbornness weight in the bounded social-learning update.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanSocialStateValue(world, (state) => state.lastTrustWeight);
      }
    },
    {
      key: "socialLearningActiveAgents",
      id: "socialLearningActiveAgents",
      label: "Social-learning agents",
      description: "Count of agents carrying bounded OpinionSocialLearningState.",
      valueType: "integer",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return socialLearningStates(world).length;
      }
    },
    {
      key: "informationSourceCount",
      id: "informationSourceCount",
      label: "Information source count",
      description: "Count of fixed model information sources active in the Opinion social-learning behavior mode.",
      valueType: "integer",
      range: { min: 0, max: 2 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "input",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        const count = world.globals.opinionInformationSourceCount;
        return typeof count === "number" && Number.isInteger(count) ? count : 0;
      }
    }
  ];
}

function opinionStates(world: { entitiesWith(componentTypes: readonly string[]): string[]; getComponent<T>(entityId: string, componentType: string): T | undefined }): OpinionStateComponent[] {
  return world
    .entitiesWith([OpinionState])
    .map((entityId) => world.getComponent<OpinionStateComponent>(entityId, OpinionState))
    .filter((state): state is OpinionStateComponent => state !== undefined);
}

function socialLearningStates(world: {
  entitiesWith(componentTypes: readonly string[]): string[];
  getComponent<T>(entityId: string, componentType: string): T | undefined;
}): OpinionSocialLearningStateComponent[] {
  return world
    .entitiesWith([OpinionSocialLearningState])
    .map((entityId) => world.getComponent<OpinionSocialLearningStateComponent>(entityId, OpinionSocialLearningState))
    .filter((state): state is OpinionSocialLearningStateComponent => state !== undefined);
}

function meanSocialStateValue(
  world: { entitiesWith(componentTypes: readonly string[]): string[]; getComponent<T>(entityId: string, componentType: string): T | undefined },
  valueForState: (state: OpinionSocialLearningStateComponent) => number
): number {
  const states = socialLearningStates(world);
  return states.length === 0 ? 0 : states.reduce((sum, state) => sum + valueForState(state), 0) / states.length;
}

function isOpinionTargets(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((entry) => typeof entry === "number" && Number.isFinite(entry))
  );
}

function isOpinionSocialLearningTargets(value: unknown): value is Record<string, OpinionSocialLearningTarget> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).opinionShift, -1, 1) &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).neighborInfluence, -1, 1) &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).sourceInfluence, -1, 1) &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).crowdInfluence, -1, 1) &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).memoryInfluence, -1, 1) &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).confirmationWeight, 0, 1) &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).trustWeight, 0, 1) &&
        isFiniteBoundedNumber((entry as OpinionSocialLearningTarget).credibilityWeightedExposure, 0, 1)
    )
  );
}

function clampOpinion(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function initialSocialLearningState(opinion: number): OpinionSocialLearningStateComponent {
  return {
    memory: clampOpinion(opinion),
    salience: 0,
    lastOpinionShift: 0,
    lastNeighborInfluence: 0,
    lastSourceInfluence: 0,
    lastCrowdInfluence: 0,
    lastMemoryInfluence: 0,
    lastConfirmationWeight: 1,
    lastTrustWeight: 0,
    lastCredibilityWeightedExposure: 0
  };
}

function isValidOpinionSocialLearningState(value: unknown): value is OpinionSocialLearningStateComponent {
  const allowedKeys = new Set([
    "memory",
    "salience",
    "lastOpinionShift",
    "lastNeighborInfluence",
    "lastSourceInfluence",
    "lastCrowdInfluence",
    "lastMemoryInfluence",
    "lastConfirmationWeight",
    "lastTrustWeight",
    "lastCredibilityWeightedExposure"
  ]);
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => allowedKeys.has(key)) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).memory, -1, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).salience, 0, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastOpinionShift, -1, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastNeighborInfluence, -1, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastSourceInfluence, -1, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastCrowdInfluence, -1, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastMemoryInfluence, -1, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastConfirmationWeight, 0, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastTrustWeight, 0, 1) &&
    isFiniteBoundedNumber((value as OpinionSocialLearningStateComponent).lastCredibilityWeightedExposure, 0, 1)
  );
}

function socialLearningTargetFor(
  own: OpinionStateComponent,
  socialState: OpinionSocialLearningStateComponent,
  neighborAverage: number,
  neighborCount: number,
  informationSources: readonly OpinionInformationSource[],
  params: ReturnType<typeof opinionParams>
): OpinionSocialLearningTarget {
  const trustWeight = clamp01(params.socialTrustWeight * (1 - own.stubbornness));
  const neighborDelta = neighborAverage - own.value;
  const neighborConfirmation = confirmationWeightFor(neighborAverage, own.value, params.confirmationBias);
  const neighborInfluence =
    neighborCount === 0
      ? 0
      : neighborDelta * params.influenceStrength * params.socialLearningRate * trustWeight * neighborConfirmation;
  const sourceInfluence = sourceInfluenceFor(own.value, informationSources, params);
  const crowdConfirmation = confirmationWeightFor(params.crowdSignal, own.value, params.confirmationBias);
  const crowdInfluence =
    (params.crowdSignal - own.value) * params.crowdSignalStrength * params.socialLearningRate * trustWeight * crowdConfirmation;
  const memoryInfluence =
    (socialState.memory - own.value) * socialState.salience * params.salienceWeight * params.socialLearningRate;
  const boundedShift = clamp(
    neighborInfluence + sourceInfluence.influence + crowdInfluence + memoryInfluence,
    -params.maxOpinionShiftPerTick,
    params.maxOpinionShiftPerTick
  );

  return {
    opinionShift: boundedShift,
    neighborInfluence,
    sourceInfluence: sourceInfluence.influence,
    crowdInfluence,
    memoryInfluence,
    confirmationWeight: clamp01((neighborConfirmation + sourceInfluence.confirmationWeight + crowdConfirmation) / 3),
    trustWeight,
    credibilityWeightedExposure: sourceInfluence.credibilityWeightedExposure
  };
}

function sourceInfluenceFor(
  opinion: number,
  sources: readonly OpinionInformationSource[],
  params: ReturnType<typeof opinionParams>
): { influence: number; confirmationWeight: number; credibilityWeightedExposure: number } {
  if (sources.length === 0 || params.sourceExposureStrength === 0) {
    return { influence: 0, confirmationWeight: 1, credibilityWeightedExposure: 0 };
  }

  let weightedSignal = 0;
  let totalWeight = 0;
  let confirmationTotal = 0;
  let exposureTotal = 0;
  for (const source of sources) {
    const confirmationWeight = confirmationWeightFor(source.signal, opinion, params.confirmationBias);
    const credibilityWeight = (1 - params.sourceTrustSensitivity) + params.sourceTrustSensitivity * source.credibility;
    const weight = source.exposure * source.influence * params.sourceExposureStrength * credibilityWeight * confirmationWeight;
    weightedSignal += source.signal * weight;
    totalWeight += weight;
    confirmationTotal += confirmationWeight;
    exposureTotal += source.credibility * source.exposure * source.influence;
  }

  if (totalWeight === 0) {
    return {
      influence: 0,
      confirmationWeight: clamp01(confirmationTotal / sources.length),
      credibilityWeightedExposure: clamp01(exposureTotal / sources.length)
    };
  }

  const targetSignal = weightedSignal / totalWeight;
  return {
    influence: clamp((targetSignal - opinion) * totalWeight, -params.maxSourceInfluencePerTick, params.maxSourceInfluencePerTick),
    confirmationWeight: clamp01(confirmationTotal / sources.length),
    credibilityWeightedExposure: clamp01(exposureTotal / sources.length)
  };
}

function confirmationWeightFor(signal: number, opinion: number, confirmationBias: number): number {
  return clamp01(1 - confirmationBias * (Math.abs(signal - opinion) / 2));
}

function nextSocialLearningState(
  current: OpinionSocialLearningStateComponent,
  nextOpinion: number,
  target: OpinionSocialLearningTarget,
  params: ReturnType<typeof opinionParams>
): OpinionSocialLearningStateComponent {
  return {
    memory: clampOpinion(current.memory * (1 - params.memoryDecay) + nextOpinion * params.memoryDecay),
    salience: clamp01(current.salience * (1 - params.memoryDecay) + Math.abs(target.opinionShift) * params.salienceWeight),
    lastOpinionShift: target.opinionShift,
    lastNeighborInfluence: clamp(target.neighborInfluence, -1, 1),
    lastSourceInfluence: clamp(target.sourceInfluence, -1, 1),
    lastCrowdInfluence: clamp(target.crowdInfluence, -1, 1),
    lastMemoryInfluence: clamp(target.memoryInfluence, -1, 1),
    lastConfirmationWeight: target.confirmationWeight,
    lastTrustWeight: target.trustWeight,
    lastCredibilityWeightedExposure: target.credibilityWeightedExposure
  };
}

function initialOpinionValue(index: number, polarization: number, initialization: InitializationConfig | undefined, randomUnit: number): number {
  if (initialization?.presetId === "random-opinions") {
    return clampOpinion(randomUnit);
  }
  if (initialization?.presetId === "consensus-start") {
    const mean = finiteOption(initialization, "meanOpinion", 0);
    const spread = finiteOption(initialization, "spread", 0.15);
    return clampOpinion(mean + randomUnit * spread);
  }
  const side = index % 2 === 0 ? -1 : 1;
  return clampOpinion(side * polarization + randomUnit * (1 - polarization));
}

function finiteOption(initialization: InitializationConfig, key: string, fallback: number): number {
  const value = initialization.options[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function opinionBehaviorModeFromScenario(value: unknown): OpinionBehaviorModeId {
  if (value === undefined || value === "default") {
    return "default";
  }
  if (value === "socialLearning") {
    return "socialLearning";
  }
  throw new SimulationValidationError(`Unsupported opinion behavior mode: ${String(value)}`);
}

function opinionBehaviorModeFromWorld(globals: Record<string, JsonValue>): OpinionBehaviorModeId {
  return opinionBehaviorModeFromScenario(globals.opinionBehaviorMode);
}

function isFiniteBoundedNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function validateOpinionInformationSources(sources: readonly OpinionInformationSource[]): OpinionInformationSource[] {
  if (!Array.isArray(sources) || sources.length > 2) {
    throw new SimulationValidationError("Opinion social-learning mode supports at most two fixed information sources");
  }
  const ids = new Set<string>();
  return sources.map((source) => {
    assertPlainOpinionInformationSource(source);
    if (ids.has(source.id)) {
      throw new SimulationValidationError(`Duplicate opinion information source id: ${source.id}`);
    }
    ids.add(source.id);
    if (typeof source.id !== "string" || !/^[a-z][a-z0-9-]{1,47}$/.test(source.id)) {
      throw new SimulationValidationError(`Invalid opinion information source id: ${source.id}`);
    }
    if (typeof source.label !== "string" || source.label.trim().length === 0 || source.label.length > 80) {
      throw new SimulationValidationError("Invalid opinion information source label");
    }
    if (!opinionInformationSourceCategories.includes(source.category)) {
      throw new SimulationValidationError(`Invalid opinion information source category: ${String(source.category)}`);
    }
    if (!isFiniteBoundedNumber(source.signal, -1, 1)) {
      throw new SimulationValidationError(`Invalid opinion information source signal for ${source.id}`);
    }
    if (!isFiniteBoundedNumber(source.credibility, 0, 1)) {
      throw new SimulationValidationError(`Invalid opinion information source credibility for ${source.id}`);
    }
    if (!isFiniteBoundedNumber(source.exposure, 0, 1)) {
      throw new SimulationValidationError(`Invalid opinion information source exposure for ${source.id}`);
    }
    if (!isFiniteBoundedNumber(source.influence, 0, 1)) {
      throw new SimulationValidationError(`Invalid opinion information source influence for ${source.id}`);
    }
    return {
      id: source.id,
      label: source.label,
      category: source.category,
      signal: source.signal,
      credibility: source.credibility,
      exposure: source.exposure,
      influence: source.influence
    };
  });
}

function assertPlainOpinionInformationSource(source: OpinionInformationSource): void {
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    throw new SimulationValidationError("Opinion information source must be a plain object");
  }
  const prototype = Object.getPrototypeOf(source);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new SimulationValidationError("Opinion information source must be a plain object");
  }
  const allowedKeys = new Set(["id", "label", "category", "signal", "credibility", "exposure", "influence"]);
  for (const key of Object.keys(source as unknown as Record<string, unknown>)) {
    if (!allowedKeys.has(key)) {
      throw new SimulationValidationError(`Unsupported opinion information source field: ${key}`);
    }
  }
}

function opinionInformationSourcesFromParams(params: ReturnType<typeof opinionParams>): OpinionInformationSource[] {
  return validateOpinionInformationSources([
    {
      id: "source-one",
      label: "Source One",
      category: "institutional",
      signal: params.sourceOneSignal,
      credibility: params.sourceOneCredibility,
      exposure: params.sourceOneExposure,
      influence: params.sourceOneInfluence
    },
    {
      id: "source-two",
      label: "Source Two",
      category: "peer",
      signal: params.sourceTwoSignal,
      credibility: params.sourceTwoCredibility,
      exposure: params.sourceTwoExposure,
      influence: params.sourceTwoInfluence
    }
  ]);
}

function opinionParams(params: ParameterValues): {
  agentCount: number;
  influenceRadius: number;
  influenceStrength: number;
  noise: number;
  initialPolarization: number;
  socialLearningRate: number;
  socialTrustWeight: number;
  confirmationBias: number;
  memoryDecay: number;
  salienceWeight: number;
  sourceExposureStrength: number;
  sourceTrustSensitivity: number;
  maxSourceInfluencePerTick: number;
  crowdSignal: number;
  crowdSignalStrength: number;
  maxOpinionShiftPerTick: number;
  sourceOneSignal: number;
  sourceOneCredibility: number;
  sourceOneExposure: number;
  sourceOneInfluence: number;
  sourceTwoSignal: number;
  sourceTwoCredibility: number;
  sourceTwoExposure: number;
  sourceTwoInfluence: number;
} {
  const values = {
    agentCount: Number(params.agentCount),
    influenceRadius: Number(params.influenceRadius),
    influenceStrength: Number(params.influenceStrength),
    noise: Number(params.noise),
    initialPolarization: Number(params.initialPolarization),
    socialLearningRate: Number(params.socialLearningRate),
    socialTrustWeight: Number(params.socialTrustWeight),
    confirmationBias: Number(params.confirmationBias),
    memoryDecay: Number(params.memoryDecay),
    salienceWeight: Number(params.salienceWeight),
    sourceExposureStrength: Number(params.sourceExposureStrength),
    sourceTrustSensitivity: Number(params.sourceTrustSensitivity),
    maxSourceInfluencePerTick: Number(params.maxSourceInfluencePerTick),
    crowdSignal: Number(params.crowdSignal),
    crowdSignalStrength: Number(params.crowdSignalStrength),
    maxOpinionShiftPerTick: Number(params.maxOpinionShiftPerTick),
    sourceOneSignal: Number(params.sourceOneSignal),
    sourceOneCredibility: Number(params.sourceOneCredibility),
    sourceOneExposure: Number(params.sourceOneExposure),
    sourceOneInfluence: Number(params.sourceOneInfluence),
    sourceTwoSignal: Number(params.sourceTwoSignal),
    sourceTwoCredibility: Number(params.sourceTwoCredibility),
    sourceTwoExposure: Number(params.sourceTwoExposure),
    sourceTwoInfluence: Number(params.sourceTwoInfluence)
  };
  if (
    !Number.isInteger(values.agentCount) ||
    values.agentCount <= 0 ||
    !Number.isFinite(values.influenceRadius) ||
    values.influenceRadius <= 0 ||
    !Number.isFinite(values.influenceStrength) ||
    values.influenceStrength < 0 ||
    values.influenceStrength > 1 ||
    !Number.isFinite(values.noise) ||
    values.noise < 0 ||
    values.noise > 1 ||
    !Number.isFinite(values.initialPolarization) ||
    values.initialPolarization < 0 ||
    values.initialPolarization > 1 ||
    !isFiniteBoundedNumber(values.socialLearningRate, 0, 1) ||
    !isFiniteBoundedNumber(values.socialTrustWeight, 0, 1) ||
    !isFiniteBoundedNumber(values.confirmationBias, 0, 1) ||
    !isFiniteBoundedNumber(values.memoryDecay, 0, 1) ||
    !isFiniteBoundedNumber(values.salienceWeight, 0, 1) ||
    !isFiniteBoundedNumber(values.sourceExposureStrength, 0, 1) ||
    !isFiniteBoundedNumber(values.sourceTrustSensitivity, 0, 1) ||
    !isFiniteBoundedNumber(values.maxSourceInfluencePerTick, 0, 0.5) ||
    !isFiniteBoundedNumber(values.crowdSignal, -1, 1) ||
    !isFiniteBoundedNumber(values.crowdSignalStrength, 0, 1) ||
    !isFiniteBoundedNumber(values.maxOpinionShiftPerTick, 0, 0.5) ||
    !isFiniteBoundedNumber(values.sourceOneSignal, -1, 1) ||
    !isFiniteBoundedNumber(values.sourceOneCredibility, 0, 1) ||
    !isFiniteBoundedNumber(values.sourceOneExposure, 0, 1) ||
    !isFiniteBoundedNumber(values.sourceOneInfluence, 0, 1) ||
    !isFiniteBoundedNumber(values.sourceTwoSignal, -1, 1) ||
    !isFiniteBoundedNumber(values.sourceTwoCredibility, 0, 1) ||
    !isFiniteBoundedNumber(values.sourceTwoExposure, 0, 1) ||
    !isFiniteBoundedNumber(values.sourceTwoInfluence, 0, 1)
  ) {
    throw new SimulationValidationError("Invalid opinion parameters");
  }
  return values;
}
