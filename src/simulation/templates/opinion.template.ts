import type {
  BehaviorModeDefinition,
  EntityTypeDefinition,
  InitializationConfig,
  InitializationPresetDefinition,
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
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import type { Point2D } from "../spaces/Space";
import { Position2D } from "./epidemic.template";
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const OPINION_SPACE_ID = "opinion-space";
export const OpinionState = "OpinionState";

export interface OpinionStateComponent {
  value: number;
  stubbornness: number;
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
  }
];

const behaviorModes: BehaviorModeDefinition[] = [
  {
    id: "default",
    label: "Classic influence",
    description: "Agents adjust continuous opinions through local social influence and seeded noise."
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
  supportsUncertaintyConfig: true
};

const spaceDefinition: TemplateSpaceDefinition = {
  type: "continuous2d",
  spaceId: OPINION_SPACE_ID,
  description: "A continuous 2D interaction field where nearby agents influence each other.",
  boundaryMode: "wrap",
  dimensions: { width: 100, height: 100 }
};

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "opinionAgent",
    label: "Opinion agent",
    description: "Mobile social agent with scalar opinion and stubbornness.",
    components: [Position2D, OpinionState],
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
  stateVariables: ["Position2D", "OpinionState"],
  processOverview: "Agents sense nearby opinions, compute target averages, then update gradually with optional seeded noise.",
  scheduling: "Neighbor sensing runs in sense, opinion updates in decide, noise in act, and metrics after the step.",
  designConcepts: {
    emergence: "Population-level convergence or clustering can emerge from local influence.",
    adaptation: "Agents adjust opinions toward local neighbors depending on stubbornness.",
    interaction: "Influence depends on spatial neighbors.",
    stochasticity: "Optional noise uses deterministic seeded RNG streams.",
    observation: "Average opinion, variance, and polarization score are collected."
  },
  initialization: "Agents are seeded in continuous space with opinions distributed according to initial polarization.",
  submodels: ["Neighbor averaging", "Stubbornness-weighted update", "Opinion noise"],
  assumptions: ["Opinion is represented as a scalar in [-1, 1]."],
  limitations: [
    "This template is conceptual and not a social prediction model.",
    "These models are exploratory simulations, not calibrated predictive tools."
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
    "memory",
    "adaptive cognition or memory beyond the scalar opinion state",
    "measurement or observability model for real opinions",
    "causal validation of influence mechanisms",
    "multi-issue beliefs"
  ],
  appropriateUse: ["Exploring stylized local influence, polarization sensitivity, noise effects, and seed-dependent convergence."],
  inappropriateUse: ["Predicting elections, modeling real communities, or making claims about actual social groups."]
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
    "Scalar opinion values omit identity, culture, media systems, institutions, and strategic persuasion."
  ],
  validationStatus: "internallyTested",
  validationNotes: "Internally tested through deterministic engine, validation, serialization, and template smoke tests. Not calibrated or externally validated."
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
  parameterDefinitions,
  metricDefinitions,
  initializationPresets,
  behaviorModes,
  agentCompositionDefinitions,
  documentation,
  assumptionProfile,
  createInitialWorld(ctx) {
    const params = opinionParams(ctx.params);
    const world = new World();
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
    for (const entityId of componentEntityIds(world, Position2D)) {
      const position = world.getComponent<Point2D>(entityId, Position2D);
      if (!isFinitePoint(position)) {
        throw new SimulationValidationError(`Invalid Position2D component on ${entityId}`);
      }
    }
  },
  validateParameters(params) {
    opinionParams(params);
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
      const space = ctx.spaces.continuous2D(OPINION_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Opinion space is missing");
      }
      const targets: Record<string, number> = {};
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
          continue;
        }
        const average = neighbors.reduce((sum, neighbor) => sum + neighbor.state.value, 0) / neighbors.length;
        targets[entityId] = average;
      }
      ctx.commands.setGlobal("opinionTargets", targets, "opinion neighbor sensing");
    }
  };
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
    }
  ];
}

function opinionStates(world: { entitiesWith(componentTypes: readonly string[]): string[]; getComponent<T>(entityId: string, componentType: string): T | undefined }): OpinionStateComponent[] {
  return world
    .entitiesWith([OpinionState])
    .map((entityId) => world.getComponent<OpinionStateComponent>(entityId, OpinionState))
    .filter((state): state is OpinionStateComponent => state !== undefined);
}

function isOpinionTargets(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((entry) => typeof entry === "number" && Number.isFinite(entry))
  );
}

function clampOpinion(value: number): number {
  return Math.max(-1, Math.min(1, value));
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

function opinionParams(params: ParameterValues): {
  agentCount: number;
  influenceRadius: number;
  influenceStrength: number;
  noise: number;
  initialPolarization: number;
} {
  const values = {
    agentCount: Number(params.agentCount),
    influenceRadius: Number(params.influenceRadius),
    influenceStrength: Number(params.influenceStrength),
    noise: Number(params.noise),
    initialPolarization: Number(params.initialPolarization)
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
    values.initialPolarization > 1
  ) {
    throw new SimulationValidationError("Invalid opinion parameters");
  }
  return values;
}
