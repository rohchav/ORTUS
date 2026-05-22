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
import type { RandomStream } from "../kernel/Random";
import type { Point2D } from "../spaces/Space";
import { Position2D, Velocity2D } from "./epidemic.template";
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const PREDATOR_PREY_SPACE_ID = "predator-prey-space";
export const Species = "Species";
export const Energy = "Energy";
export const ReproductionState = "ReproductionState";

export interface SpeciesComponent {
  kind: "prey" | "predator";
}

export interface EnergyComponent {
  value: number;
}

const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "initialPrey",
    label: "Initial prey",
    type: "integer",
    defaultValue: 120,
    min: 0,
    max: 1000,
    step: 1,
    description: "Starting prey population.",
    liveUpdate: false
  },
  {
    key: "initialPredators",
    label: "Initial predators",
    type: "integer",
    defaultValue: 3,
    min: 0,
    max: 1000,
    step: 1,
    description: "Starting predator population.",
    liveUpdate: false
  },
  {
    key: "preyReproductionProbability",
    label: "Prey reproduction probability",
    type: "number",
    defaultValue: 0.015,
    min: 0,
    max: 1,
    step: 0.001,
    description: "Per-tick chance of prey reproduction.",
    liveUpdate: true
  },
  {
    key: "predatorEnergyLoss",
    label: "Predator energy loss",
    type: "number",
    defaultValue: 0.25,
    min: 0,
    max: 10,
    step: 0.01,
    description: "Energy predators lose each tick.",
    liveUpdate: true
  },
  {
    key: "predatorEnergyGain",
    label: "Predator energy gain",
    type: "number",
    defaultValue: 8,
    min: 0,
    max: 100,
    step: 0.1,
    description: "Energy gained from consuming prey.",
    liveUpdate: true
  },
  {
    key: "predatorReproductionThreshold",
    label: "Predator reproduction threshold",
    type: "number",
    defaultValue: 18,
    min: 0.1,
    max: 200,
    step: 0.1,
    description: "Energy level that allows predator reproduction.",
    liveUpdate: true
  },
  {
    key: "predationRadius",
    label: "Predation radius",
    type: "number",
    defaultValue: 1.5,
    min: 0.1,
    max: 100,
    step: 0.1,
    description: "Distance at which predators can consume prey.",
    liveUpdate: true
  },
  {
    key: "movementSpeed",
    label: "Movement speed",
    type: "number",
    defaultValue: 1.0,
    min: 0,
    max: 10,
    step: 0.1,
    description: "Entity movement speed per fixed tick.",
    liveUpdate: true
  }
];

const behaviorModes: BehaviorModeDefinition[] = [
  {
    id: "default",
    label: "Classic predator-prey",
    description: "Predators consume prey, lose energy, reproduce above threshold, and die at zero energy."
  }
];

const agentCompositionDefinitions: ParameterDefinition[] = [parameterDefinition("initialPrey"), parameterDefinition("initialPredators")];

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
  spaceId: PREDATOR_PREY_SPACE_ID,
  description: "A bounded continuous 2D ecology field with wrapping boundaries.",
  boundaryMode: "wrap",
  dimensions: { width: 100, height: 100 }
};

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "prey",
    label: "Prey",
    description: "Mobile prey agent that can reproduce and be consumed by predators.",
    components: [Position2D, Velocity2D, Species],
    representedAs: "entity",
    configurableCount: true,
    countParameterKey: "initialPrey",
    defaultVisual: { color: "#43a047", label: "Prey" }
  },
  {
    typeId: "predator",
    label: "Predator",
    description: "Mobile predator agent with energy that can consume prey, reproduce, and die.",
    components: [Position2D, Velocity2D, Species, Energy],
    representedAs: "entity",
    configurableCount: true,
    countParameterKey: "initialPredators",
    defaultVisual: { color: "#8e2c2c", label: "Predator" }
  }
];

const initializationPresets: InitializationPresetDefinition[] = [
  {
    id: "random-ecology",
    label: "Random Ecology",
    description: "Predators and prey are seeded across the field with random headings."
  },
  {
    id: "prey-cluster-predator-edge",
    label: "Prey Cluster / Predator Edge",
    description: "Prey start near a resource patch while predators begin near field edges.",
    optionDefinitions: [
      {
        key: "clusterRadius",
        label: "Cluster radius",
        type: "number",
        defaultValue: 18,
        min: 2,
        max: 50,
        step: 1,
        description: "Radius of the initial prey patch.",
        liveUpdate: false
      }
    ]
  },
  {
    id: "sparse-predators",
    label: "Sparse Predators",
    description: "A prey-heavy start with a smaller predator population.",
    parameterOverrides: { initialPrey: 160, initialPredators: 1 }
  }
];

const documentation: ModelDocumentation = {
  purpose: "Show how local consumption, reproduction, and energy loss can produce population cycles or collapse.",
  entities: ["Prey and predator agents moving in continuous 2D space."],
  stateVariables: ["Position2D", "Velocity2D", "Species", "Energy"],
  processOverview: "Predators consume nearby prey, lose energy, reproduce above threshold, and die at zero energy while prey may reproduce.",
  scheduling: "Predation runs in decide, movement and energy decay in act, reproduction and death in resolve, and metrics after the step.",
  designConcepts: {
    emergence: "Population cycles or collapse can emerge from local consumption and reproduction.",
    interaction: "Predators interact with nearby prey through predation.",
    stochasticity: "Movement and reproduction use deterministic seeded RNG streams.",
    observation: "Prey and predator counts are collected as metrics."
  },
  initialization: "Prey and predators are seeded in continuous space with deterministic positions and velocities.",
  submodels: ["Movement", "Predation", "Energy decay", "Reproduction", "Death"],
  assumptions: ["Predators consume at most one prey per tick.", "Prey do not have energy in V1."],
  limitations: [
    "This template is conceptual and not an ecological prediction model.",
    "These models are exploratory simulations, not calibrated predictive tools."
  ],
  notRepresented: [
    "explicit food/grass resources",
    "seasons",
    "delayed seasonal or resource feedback cycles",
    "habitat patches",
    "explicit system boundary or environment layer",
    "world bounds as a full environment model",
    "external forcing or exogenous shocks",
    "spatial fields or environmental layers",
    "positions as environmental field layers",
    "measurement noise or observability model",
    "causal validation of ecosystem mechanisms",
    "disease",
    "age classes",
    "multi-species food webs",
    "migration"
  ],
  appropriateUse: ["Exploring stylized predator-prey sensitivity, collapse/coexistence patterns, and seeded initial-condition effects."],
  inappropriateUse: ["Forecasting real ecosystems, setting conservation policy, or representing full food-web dynamics."]
};

const assumptionProfile = createTemplateAssumptionProfile({
  templateId: "predator-prey",
  assumptions: documentation.assumptions,
  limitations: documentation.limitations,
  notRepresented: documentation.notRepresented ?? [],
  appropriateUse: documentation.appropriateUse ?? [],
  inappropriateUse: documentation.inappropriateUse ?? [],
  ethicsNotes: [
    "Do not use this stylized ecology model for real ecosystem management without empirical validation.",
    "The model omits resources, habitat, disease, age structure, and food-web complexity."
  ],
  validationStatus: "internallyTested",
  validationNotes: "Internally tested through deterministic engine, validation, serialization, and template smoke tests. Not calibrated or externally validated."
});

const metricDefinitions = predatorPreyMetrics();

export const predatorPreyTemplate: SimulationTemplate = {
  id: "predator-prey",
  name: "Predator-Prey",
  description: "Local predator-prey simulation with energy and reproduction.",
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
    const params = predatorPreyParams(ctx.params);
    const world = new World();
    const space = new Continuous2DSpace({ id: PREDATOR_PREY_SPACE_ID, width: 100, height: 100, boundaryMode: "wrap" });
    world.addSpace(space);
    const initRng = ctx.rng.fork("predator-prey:init");
    const total = params.initialPrey + params.initialPredators;
    for (let index = 0; index < total; index += 1) {
      const kind: SpeciesComponent["kind"] = index < params.initialPrey ? "prey" : "predator";
      const entity = world.entityStore.create(kind, { createdAtTick: 0, label: `${kind} ${index + 1}` });
      const position = predatorPreyInitialPosition(index, kind, ctx.initialization, initRng);
      const angle = initRng.float() * Math.PI * 2;
      const velocity = {
        x: Math.cos(angle) * params.movementSpeed,
        y: Math.sin(angle) * params.movementSpeed
      };
      world.componentStore.add(entity.id, Position2D, position);
      world.componentStore.add(entity.id, Velocity2D, velocity);
      world.componentStore.add(entity.id, Species, { kind });
      if (kind === "predator") {
        world.componentStore.add(entity.id, Energy, { value: params.predatorReproductionThreshold * 0.65 });
      }
      space.addEntity(entity.id, position);
    }
    return world;
  },
  registerSystems(registry) {
    registry.register(createPredationSystem());
    registry.register(createPredatorPreyMovementSystem());
    registry.register(createEnergyDecaySystem());
    registry.register(createPredatorPreyBoundarySystem());
    registry.register(createReproductionSystem());
    registry.register(createDeathSystem());
  },
  registerMetrics(registry) {
    for (const metric of metricDefinitions) {
      registry.register(metric);
    }
  },
  getVisuals(_snapshot: SimulationSnapshotView) {
    return {
      components: {
        speciesComponent: Species
      },
      colors: {
        prey: "#43a047",
        predator: "#8e2c2c"
      },
      labels: {
        prey: "Prey",
        predator: "Predator"
      },
      description: "Predators and prey use distinct visual encodings."
    };
  },
  validateWorld(world) {
    for (const entityId of componentEntityIds(world, Species)) {
      const species = world.getComponent<SpeciesComponent>(entityId, Species);
      if (!species || (species.kind !== "prey" && species.kind !== "predator")) {
        throw new SimulationValidationError(`Invalid Species component on ${entityId}`);
      }
      const energy = world.getComponent<EnergyComponent>(entityId, Energy);
      if (species.kind === "predator" && (!energy || !Number.isFinite(energy.value) || energy.value < 0)) {
        throw new SimulationValidationError(`Invalid Energy component on predator ${entityId}`);
      }
    }
    for (const entityId of componentEntityIds(world, Position2D)) {
      const position = world.getComponent<Point2D>(entityId, Position2D);
      if (!isFinitePoint(position)) {
        throw new SimulationValidationError(`Invalid Position2D component on ${entityId}`);
      }
    }
    for (const entityId of componentEntityIds(world, Velocity2D)) {
      const velocity = world.getComponent<Point2D>(entityId, Velocity2D);
      if (!isFinitePoint(velocity)) {
        throw new SimulationValidationError(`Invalid Velocity2D component on ${entityId}`);
      }
    }
  },
  validateParameters(params) {
    predatorPreyParams(params);
  },
  validateInitializationOptions(initialization) {
    if (initialization.presetId === "prey-cluster-predator-edge") {
      const radius = finiteOption(initialization, "clusterRadius", 18);
      if (radius <= 0 || radius > 100) {
        throw new SimulationValidationError("clusterRadius must be finite and within the world extent");
      }
    }
  }
};

function parameterDefinition(key: string): ParameterDefinition {
  const definition = parameterDefinitions.find((candidate) => candidate.key === key);
  if (!definition) {
    throw new Error(`Missing predator-prey parameter definition: ${key}`);
  }
  return definition;
}

export function createPredatorPreyMovementSystem(): System {
  return {
    id: "PredatorPreyMovementSystem",
    phase: "act",
    priority: 0,
    query: [Position2D, Velocity2D, Species],
    update(ctx) {
      const space = ctx.spaces.continuous2D(PREDATOR_PREY_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Predator-prey space is missing");
      }
      for (const entityId of ctx.entityIds ?? []) {
        const position = ctx.world.getComponent<Point2D>(entityId, Position2D);
        const velocity = ctx.world.getComponent<Point2D>(entityId, Velocity2D);
        if (!position || !velocity) {
          continue;
        }
        const next = { x: position.x + velocity.x * ctx.dt, y: position.y + velocity.y * ctx.dt };
        ctx.commands.moveEntity(PREDATOR_PREY_SPACE_ID, entityId, next, "predator-prey movement");
        ctx.commands.setComponent(entityId, Position2D, next, "sync position component");
      }
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

export function createPredatorPreyBoundarySystem(): System {
  return {
    id: "PredatorPreyBoundarySystem",
    phase: "resolve",
    priority: 0,
    query: [Position2D, Species],
    update(ctx) {
      const space = ctx.spaces.continuous2D(PREDATOR_PREY_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Predator-prey space is missing");
      }
      for (const entityId of ctx.entityIds ?? []) {
        const position = ctx.world.getComponent<Point2D>(entityId, Position2D);
        if (!position) {
          continue;
        }
        const bounded = space.normalizePosition(position);
        ctx.commands.moveEntity(PREDATOR_PREY_SPACE_ID, entityId, bounded, "predator-prey boundary");
        ctx.commands.setComponent(entityId, Position2D, bounded, "sync bounded position");
      }
    }
  };
}

export function createPredationSystem(): System {
  return {
    id: "PredationSystem",
    phase: "decide",
    priority: 0,
    query: [Position2D, Species],
    update(ctx) {
      const params = predatorPreyParams(ctx.params);
      const space = ctx.spaces.continuous2D(PREDATOR_PREY_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Predator-prey space is missing");
      }
      const consumedPrey = new Set<string>();
      const speciesByEntity = new Map<string, SpeciesComponent["kind"]>();
      const predators: string[] = [];
      for (const entityId of ctx.entityIds ?? []) {
        const species = ctx.world.getComponent<SpeciesComponent>(entityId, Species);
        if (!species) {
          continue;
        }
        speciesByEntity.set(entityId, species.kind);
        if (species.kind === "predator") {
          predators.push(entityId);
        }
      }
      for (const predatorId of predators.sort((left, right) => left.localeCompare(right))) {
        const energy = ctx.world.getComponent<EnergyComponent>(predatorId, Energy);
        if (!energy) {
          continue;
        }
        const prey = space.queryNeighbors(predatorId, params.predationRadius).find((neighbor) => {
          return speciesByEntity.get(neighbor.entityId) === "prey" && !consumedPrey.has(neighbor.entityId);
        });
        if (!prey) {
          continue;
        }
        consumedPrey.add(prey.entityId);
        ctx.commands.destroyEntity(prey.entityId, "predation");
        ctx.commands.patchComponent(
          predatorId,
          Energy,
          { value: energy.value + params.predatorEnergyGain },
          "predator energy gain"
        );
      }
    }
  };
}

export function createEnergyDecaySystem(): System {
  return {
    id: "EnergyDecaySystem",
    phase: "act",
    priority: 1,
    query: [Species, Energy],
    update(ctx) {
      const params = predatorPreyParams(ctx.params);
      for (const entityId of ctx.entityIds ?? []) {
        const species = ctx.world.getComponent<SpeciesComponent>(entityId, Species);
        const energy = ctx.world.getComponent<EnergyComponent>(entityId, Energy);
        if (species?.kind !== "predator" || !energy) {
          continue;
        }
        ctx.commands.patchComponent(entityId, Energy, { value: Math.max(0, energy.value - params.predatorEnergyLoss) }, "energy decay");
      }
    }
  };
}

export function createReproductionSystem(): System {
  return {
    id: "ReproductionSystem",
    phase: "resolve",
    priority: 1,
    query: [Position2D, Species],
    update(ctx) {
      const params = predatorPreyParams(ctx.params);
      const stream = ctx.rng.fork("predator-prey:reproduction");
      for (const entityId of ctx.entityIds ?? []) {
        const species = ctx.world.getComponent<SpeciesComponent>(entityId, Species);
        const position = ctx.world.getComponent<Point2D>(entityId, Position2D);
        if (!species || !position) {
          continue;
        }
        const velocity = randomVelocity(stream, params.movementSpeed);
        if (species.kind === "prey" && stream.bool(params.preyReproductionProbability)) {
          const childPosition = jitteredPosition(position, stream);
          ctx.commands.createEntity(
            {
              archetype: "prey",
              components: {
                [Position2D]: childPosition,
                [Velocity2D]: velocity,
                [Species]: { kind: "prey" }
              },
              spaceLocations: {
                [PREDATOR_PREY_SPACE_ID]: childPosition
              }
            },
            "prey reproduction"
          );
        }
        if (species.kind === "predator") {
          const energy = ctx.world.getComponent<EnergyComponent>(entityId, Energy);
          if (!energy || energy.value < params.predatorReproductionThreshold) {
            continue;
          }
          const childEnergy = energy.value / 2;
          const childPosition = jitteredPosition(position, stream);
          ctx.commands.patchComponent(entityId, Energy, { value: childEnergy }, "predator reproduction energy split");
          ctx.commands.createEntity(
            {
              archetype: "predator",
              components: {
                [Position2D]: childPosition,
                [Velocity2D]: velocity,
                [Species]: { kind: "predator" },
                [Energy]: { value: childEnergy }
              },
              spaceLocations: {
                [PREDATOR_PREY_SPACE_ID]: childPosition
              }
            },
            "predator reproduction"
          );
        }
      }
    }
  };
}

export function createDeathSystem(): System {
  return {
    id: "DeathSystem",
    phase: "afterStep",
    priority: 0,
    query: [Species, Energy],
    update(ctx) {
      for (const entityId of ctx.entityIds ?? []) {
        const species = ctx.world.getComponent<SpeciesComponent>(entityId, Species);
        const energy = ctx.world.getComponent<EnergyComponent>(entityId, Energy);
        if (species?.kind === "predator" && energy && energy.value <= 0) {
          ctx.commands.destroyEntity(entityId, "predator energy depleted");
        }
      }
    }
  };
}

export function predatorPreyMetrics(): MetricDefinition[] {
  return [
    speciesCountMetric("preyCount", "Prey count", "Living prey count.", "prey"),
    speciesCountMetric("predatorCount", "Predator count", "Living predator count.", "predator")
  ];
}

function speciesCountMetric(
  key: string,
  label: string,
  description: string,
  kind: SpeciesComponent["kind"]
): MetricDefinition {
  return {
    key,
    id: key,
    label,
    description,
    valueType: "integer",
    displayUnit: "agents",
    range: { min: 0 },
    supportsHistory: true,
    comparableAcrossRuns: true,
    source: "modelState",
    precision: 0,
    displayFormat: "integer",
    collect(world) {
      return world
        .entitiesWith([Species])
        .filter((entityId) => world.getComponent<SpeciesComponent>(entityId, Species)?.kind === kind).length;
    }
  };
}

function randomVelocity(stream: { float(): number }, movementSpeed: number): Point2D {
  const angle = stream.float() * Math.PI * 2;
  return { x: Math.cos(angle) * movementSpeed, y: Math.sin(angle) * movementSpeed };
}

function jitteredPosition(position: Point2D, stream: { float(): number }): Point2D {
  return {
    x: position.x + (stream.float() * 2 - 1),
    y: position.y + (stream.float() * 2 - 1)
  };
}

function predatorPreyInitialPosition(
  index: number,
  kind: SpeciesComponent["kind"],
  initialization: InitializationConfig | undefined,
  initRng: RandomStream
): Point2D {
  if (initialization?.presetId !== "prey-cluster-predator-edge") {
    return { x: initRng.float() * 100, y: initRng.float() * 100 };
  }
  if (kind === "prey") {
    const radius = finiteOption(initialization, "clusterRadius", 18);
    const angle = initRng.float() * Math.PI * 2;
    const distance = Math.sqrt(initRng.float()) * radius;
    return clampPoint({
      x: 50 + Math.cos(angle) * distance,
      y: 50 + Math.sin(angle) * distance
    });
  }
  const edge = index % 4;
  const offset = 8 + initRng.float() * 84;
  if (edge === 0) {
    return { x: 4, y: offset };
  }
  if (edge === 1) {
    return { x: 96, y: offset };
  }
  if (edge === 2) {
    return { x: offset, y: 4 };
  }
  return { x: offset, y: 96 };
}

function clampPoint(point: Point2D): Point2D {
  return {
    x: Math.max(0, Math.min(100, point.x)),
    y: Math.max(0, Math.min(100, point.y))
  };
}

function finiteOption(initialization: InitializationConfig, key: string, fallback: number): number {
  const value = initialization.options[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function predatorPreyParams(params: ParameterValues): {
  initialPrey: number;
  initialPredators: number;
  preyReproductionProbability: number;
  predatorEnergyLoss: number;
  predatorEnergyGain: number;
  predatorReproductionThreshold: number;
  predationRadius: number;
  movementSpeed: number;
} {
  const values = {
    initialPrey: Number(params.initialPrey),
    initialPredators: Number(params.initialPredators),
    preyReproductionProbability: Number(params.preyReproductionProbability),
    predatorEnergyLoss: Number(params.predatorEnergyLoss),
    predatorEnergyGain: Number(params.predatorEnergyGain),
    predatorReproductionThreshold: Number(params.predatorReproductionThreshold),
    predationRadius: Number(params.predationRadius),
    movementSpeed: Number(params.movementSpeed)
  };
  if (
    !Number.isInteger(values.initialPrey) ||
    values.initialPrey < 0 ||
    !Number.isInteger(values.initialPredators) ||
    values.initialPredators < 0 ||
    values.initialPrey + values.initialPredators < 1 ||
    !Number.isFinite(values.preyReproductionProbability) ||
    values.preyReproductionProbability < 0 ||
    values.preyReproductionProbability > 1 ||
    !Number.isFinite(values.predatorEnergyLoss) ||
    values.predatorEnergyLoss < 0 ||
    !Number.isFinite(values.predatorEnergyGain) ||
    values.predatorEnergyGain < 0 ||
    !Number.isFinite(values.predatorReproductionThreshold) ||
    values.predatorReproductionThreshold <= 0 ||
    !Number.isFinite(values.predationRadius) ||
    values.predationRadius <= 0 ||
    !Number.isFinite(values.movementSpeed) ||
    values.movementSpeed < 0
  ) {
    throw new SimulationValidationError("Invalid predator-prey parameters");
  }
  return values;
}
