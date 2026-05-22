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
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const EPIDEMIC_SPACE_ID = "epidemic-space";
export const Position2D = "Position2D";
export const Velocity2D = "Velocity2D";
export const InfectionState = "InfectionState";

export interface InfectionStateComponent {
  status: "susceptible" | "infected" | "recovered";
  infectedAtTick?: number;
}

const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "agentCount",
    label: "Agent count",
    type: "integer",
    defaultValue: 80,
    min: 1,
    max: 1000,
    step: 1,
    description: "Number of moving agents.",
    liveUpdate: false
  },
  {
    key: "initialInfected",
    label: "Initial infected",
    type: "integer",
    defaultValue: 3,
    min: 0,
    max: 1000,
    step: 1,
    description: "Agents that start infected.",
    liveUpdate: false
  },
  {
    key: "infectionRadius",
    label: "Infection radius",
    type: "number",
    defaultValue: 8,
    min: 0.1,
    max: 100,
    step: 0.1,
    description: "Distance at which infected agents can transmit.",
    liveUpdate: true
  },
  {
    key: "infectionProbability",
    label: "Infection probability",
    type: "number",
    defaultValue: 0.22,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Per-contact transmission chance.",
    liveUpdate: true
  },
  {
    key: "recoveryTicks",
    label: "Recovery ticks",
    type: "integer",
    defaultValue: 45,
    min: 1,
    max: 1000,
    step: 1,
    description: "Ticks until infected agents recover.",
    liveUpdate: true
  },
  {
    key: "movementSpeed",
    label: "Movement speed",
    type: "number",
    defaultValue: 1.1,
    min: 0,
    max: 10,
    step: 0.1,
    description: "Agent movement speed per fixed tick.",
    liveUpdate: true
  }
];

const behaviorModes: BehaviorModeDefinition[] = [
  {
    id: "default",
    label: "Classic contact spread",
    description: "Agents move and transmit through local contact using the template's standard epidemic rules."
  }
];

const agentCompositionDefinitions: ParameterDefinition[] = [parameterDefinition("agentCount")];

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
  spaceId: EPIDEMIC_SPACE_ID,
  description: "A bounded continuous 2D contact field with wrapping boundaries.",
  boundaryMode: "wrap",
  dimensions: { width: 100, height: 100 }
};

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "susceptible",
    label: "Susceptible agent",
    description: "Mobile agent that can become infected through local contact.",
    components: [Position2D, Velocity2D, InfectionState],
    representedAs: "state",
    configurableCount: true,
    countParameterKey: "agentCount",
    defaultVisual: { color: "#6aa6ff", label: "Susceptible" }
  },
  {
    typeId: "infected",
    label: "Infected agent",
    description: "Mobile agent that can transmit infection and later recover.",
    components: [Position2D, Velocity2D, InfectionState],
    representedAs: "state",
    configurableCount: true,
    countParameterKey: "initialInfected",
    defaultVisual: { color: "#e0523a", label: "Infected" }
  },
  {
    typeId: "recovered",
    label: "Recovered agent",
    description: "Mobile agent that has recovered and is immune in V1.",
    components: [Position2D, Velocity2D, InfectionState],
    representedAs: "state",
    configurableCount: false,
    defaultVisual: { color: "#9aa36d", label: "Recovered" }
  }
];

const initializationPresets: InitializationPresetDefinition[] = [
  {
    id: "random-outbreak",
    label: "Random Outbreak",
    description: "Seeded susceptible population with infected agents chosen randomly.",
    optionDefinitions: [
      {
        key: "initialInfectedCount",
        label: "Initial infected count",
        type: "integer",
        defaultValue: 3,
        min: 0,
        max: 1000,
        step: 1,
        description: "Number of agents that start infected for this scenario.",
        liveUpdate: false
      }
    ]
  },
  {
    id: "single-cluster-outbreak",
    label: "Single Cluster Outbreak",
    description: "Initial infections are seeded nearest a scenario origin point.",
    parameterOverrides: { initialInfected: 6 },
    optionDefinitions: [
      {
        key: "initialInfectedCount",
        label: "Initial infected count",
        type: "integer",
        defaultValue: 6,
        min: 0,
        max: 1000,
        step: 1,
        description: "Number of agents infected near the cluster center.",
        liveUpdate: false
      },
      {
        key: "centerX",
        label: "Center X",
        type: "number",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        description: "Cluster center x coordinate.",
        liveUpdate: false
      },
      {
        key: "centerY",
        label: "Center Y",
        type: "number",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        description: "Cluster center y coordinate.",
        liveUpdate: false
      }
    ]
  },
  {
    id: "multiple-hotspots",
    label: "Multiple Hotspots",
    description: "Initial infections are distributed near several seeded hotspot centers.",
    parameterOverrides: { initialInfected: 9 },
    optionDefinitions: [
      {
        key: "initialInfectedCount",
        label: "Initial infected count",
        type: "integer",
        defaultValue: 9,
        min: 0,
        max: 1000,
        step: 1,
        description: "Number of agents infected across hotspots.",
        liveUpdate: false
      },
      {
        key: "hotspotCount",
        label: "Hotspot count",
        type: "integer",
        defaultValue: 3,
        min: 1,
        max: 8,
        step: 1,
        description: "Seeded outbreak centers.",
        liveUpdate: false
      }
    ]
  }
];

const documentation: ModelDocumentation = {
  purpose: "Show how local contact and stochastic transmission can produce population-level epidemic curves.",
  entities: ["Agents moving in a continuous 2D space."],
  stateVariables: ["Position2D", "Velocity2D", "InfectionState"],
  processOverview: "Agents sense nearby contacts, infected agents may transmit, movement is applied, and scheduled recovery events resolve infection state.",
  scheduling: "Transmission runs in decide, movement in act, recovery events in resolve, and metrics after the step.",
  designConcepts: {
    emergence: "Aggregate susceptible, infected, and recovered curves emerge from local interactions.",
    interaction: "Transmission depends on spatial proximity.",
    stochasticity: "Transmission uses deterministic seeded RNG streams.",
    observation: "Counts by infection state are collected as metrics."
  },
  initialization: "Agents are placed in a bounded continuous space with deterministic seeded positions and velocities.",
  submodels: ["Local transmission", "Movement", "Scheduled recovery"],
  assumptions: ["Recovered agents do not become infected again in V1.", "All agents share the same transmission and recovery parameters."],
  limitations: [
    "This template is educational and not calibrated for scientific prediction.",
    "These models are exploratory simulations, not calibrated predictive tools."
  ],
  notRepresented: [
    "Age structure",
    "testing",
    "vaccination",
    "asymptomatic spread",
    "hospital capacity",
    "medication supply",
    "healthcare staffing",
    "real geography",
    "world bounds as a full environment model",
    "explicit system boundary or environment layer",
    "explicit spatial/environmental field layers",
    "positions as environmental field layers",
    "external forcing or exogenous shocks",
    "policy response",
    "delayed policy or behavior response",
    "explicit contact networks",
    "measurement noise, under-reporting, or observability model",
    "causal validation of policy or public-health effects"
  ],
  appropriateUse: ["Exploring local contact sensitivity, recovery timing, seed effects, and qualitative epidemic curves."],
  inappropriateUse: ["Forecasting real outbreaks, evaluating policy, estimating public-health risk, or making clinical decisions."]
};

const assumptionProfile = createTemplateAssumptionProfile({
  templateId: "epidemic-spread",
  assumptions: documentation.assumptions,
  limitations: documentation.limitations,
  notRepresented: documentation.notRepresented ?? [],
  appropriateUse: documentation.appropriateUse ?? [],
  inappropriateUse: documentation.inappropriateUse ?? [],
  ethicsNotes: [
    "Do not use this simplified model for public-health decisions without calibration, validation, and domain review.",
    "Uniform transmission and recovery parameters can hide important population heterogeneity."
  ],
  validationStatus: "internallyTested",
  validationNotes: "Internally tested through deterministic engine, validation, serialization, and template smoke tests. Not calibrated or externally validated."
});

const metricDefinitions = epidemicMetrics();

export const epidemicTemplate: SimulationTemplate = {
  id: "epidemic-spread",
  name: "Epidemic Spread",
  description: "Local-contact epidemic spread with scheduled recovery.",
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
    const params = epidemicParams(ctx.params);
    const world = new World();
    const space = new Continuous2DSpace({ id: EPIDEMIC_SPACE_ID, width: 100, height: 100, boundaryMode: "wrap" });
    world.addSpace(space);
    const initRng = ctx.rng.fork("epidemic:init");
    const plans = Array.from({ length: params.agentCount }, () => {
      const position = { x: initRng.float() * 100, y: initRng.float() * 100 };
      const angle = initRng.float() * Math.PI * 2;
      const speed = params.movementSpeed;
      return {
        position,
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }
      };
    });
    const infectedIndices = epidemicInitialInfectedIndices(params, plans.map((plan) => plan.position), ctx.initialization, initRng);

    for (let index = 0; index < params.agentCount; index += 1) {
      const entity = world.entityStore.create("agent", { createdAtTick: 0, label: `Agent ${index + 1}` });
      const plan = plans[index]!;
      const position = plan.position;
      const velocity = plan.velocity;
      const status: InfectionStateComponent["status"] = infectedIndices.has(index) ? "infected" : "susceptible";
      world.componentStore.add(entity.id, Position2D, position);
      world.componentStore.add(entity.id, Velocity2D, velocity);
      world.componentStore.add(entity.id, InfectionState, {
        status,
        ...(status === "infected" ? { infectedAtTick: 0 } : {})
      });
      space.addEntity(entity.id, position);
      if (status === "infected") {
        world.eventQueue.schedule({
          id: `epidemic:recover:${entity.id}:0`,
          type: "epidemic.recover",
          scheduledTick: params.recoveryTicks,
          payload: {},
          target: entity.id,
          createdAtTick: 0,
          priority: 0
        });
      }
    }

    return world;
  },
  registerSystems(registry) {
    registry.register(createEpidemicTransmissionSystem());
    registry.register(createEpidemicMovementSystem());
    registry.register(createEpidemicBoundarySystem());
    registry.register(createRecoveryEventSystem());
  },
  registerMetrics(registry) {
    for (const metric of metricDefinitions) {
      registry.register(metric);
    }
  },
  getVisuals(_snapshot: SimulationSnapshotView) {
    return {
      components: {
        infectionStateComponent: InfectionState
      },
      colors: {
        susceptible: "#2f80ed",
        infected: "#d64545",
        recovered: "#2f9e44"
      },
      labels: {
        susceptible: "Susceptible",
        infected: "Infected",
        recovered: "Recovered"
      },
      description: "Susceptible, infected, and recovered agents use distinct colors."
    };
  },
  validateWorld(world) {
    for (const entityId of componentEntityIds(world, InfectionState)) {
      const infection = world.getComponent<InfectionStateComponent>(entityId, InfectionState);
      if (!isValidInfectionState(infection)) {
        throw new SimulationValidationError(`Invalid InfectionState component on ${entityId}`);
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
    const parsed = epidemicParams(params);
    if (parsed.initialInfected > parsed.agentCount) {
      throw new SimulationValidationError("initialInfected must be <= agentCount");
    }
  },
  validateInitializationOptions(initialization, params) {
    const parsed = epidemicParams(params);
    const count = finiteOption(initialization, "initialInfectedCount", parsed.initialInfected);
    if (!Number.isInteger(count) || count < 0 || count > parsed.agentCount) {
      throw new SimulationValidationError("initialInfectedCount must be an integer between 0 and agentCount");
    }
  }
};

function parameterDefinition(key: string): ParameterDefinition {
  const definition = parameterDefinitions.find((candidate) => candidate.key === key);
  if (!definition) {
    throw new Error(`Missing epidemic parameter definition: ${key}`);
  }
  return definition;
}

export function createEpidemicMovementSystem(): System {
  return {
    id: "EpidemicMovementSystem",
    phase: "act",
    priority: 0,
    query: [Position2D, Velocity2D],
    update(ctx) {
      const space = ctx.spaces.continuous2D(EPIDEMIC_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Epidemic space is missing");
      }
      for (const entityId of ctx.entityIds ?? []) {
        const position = ctx.world.getComponent<Point2D>(entityId, Position2D);
        const velocity = ctx.world.getComponent<Point2D>(entityId, Velocity2D);
        if (!position || !velocity) {
          continue;
        }
        const next = {
          x: position.x + velocity.x * ctx.dt,
          y: position.y + velocity.y * ctx.dt
        };
        ctx.commands.moveEntity(EPIDEMIC_SPACE_ID, entityId, next, "epidemic movement");
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

function isValidInfectionState(value: unknown): value is InfectionStateComponent {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as InfectionStateComponent;
  return (
    (candidate.status === "susceptible" || candidate.status === "infected" || candidate.status === "recovered") &&
    (candidate.infectedAtTick === undefined || (Number.isInteger(candidate.infectedAtTick) && candidate.infectedAtTick >= 0))
  );
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

export function createEpidemicBoundarySystem(): System {
  return {
    id: "EpidemicBoundarySystem",
    phase: "resolve",
    priority: 0,
    query: [Position2D],
    update(ctx) {
      const space = ctx.spaces.continuous2D(EPIDEMIC_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Epidemic space is missing");
      }
      for (const entityId of ctx.entityIds ?? []) {
        const position = ctx.world.getComponent<Point2D>(entityId, Position2D);
        if (!position) {
          continue;
        }
        const bounded = space.normalizePosition(position);
        ctx.commands.moveEntity(EPIDEMIC_SPACE_ID, entityId, bounded, "epidemic boundary");
        ctx.commands.setComponent(entityId, Position2D, bounded, "sync bounded position");
      }
    }
  };
}

export function createEpidemicTransmissionSystem(): System {
  return {
    id: "InfectionTransmissionSystem",
    phase: "decide",
    priority: 0,
    query: [Position2D, InfectionState],
    update(ctx) {
      const params = epidemicParams(ctx.params);
      const space = ctx.spaces.continuous2D(EPIDEMIC_SPACE_ID);
      if (!space) {
        throw new SimulationValidationError("Epidemic space is missing");
      }
      const infectedThisTick = new Set<string>();
      const stream = ctx.rng.fork("epidemic:transmission");
      const infectedIds = (ctx.entityIds ?? []).filter((entityId) => {
        const state = ctx.world.getComponent<InfectionStateComponent>(entityId, InfectionState);
        return state?.status === "infected";
      });

      for (const infectedId of infectedIds.sort((left, right) => left.localeCompare(right))) {
        for (const neighbor of space.queryNeighbors(infectedId, params.infectionRadius)) {
          const targetState = ctx.world.getComponent<InfectionStateComponent>(neighbor.entityId, InfectionState);
          if (targetState?.status !== "susceptible" || infectedThisTick.has(neighbor.entityId)) {
            continue;
          }
          if (!stream.bool(params.infectionProbability)) {
            continue;
          }
          infectedThisTick.add(neighbor.entityId);
          ctx.commands.patchComponent(
            neighbor.entityId,
            InfectionState,
            { status: "infected", infectedAtTick: ctx.tick },
            "local transmission"
          );
          ctx.commands.emitEvent(
            {
              id: `epidemic:recover:${neighbor.entityId}:${ctx.tick}`,
              type: "epidemic.recover",
              scheduledTick: ctx.tick + params.recoveryTicks,
              payload: {},
              source: infectedId,
              target: neighbor.entityId,
              createdAtTick: ctx.tick,
              priority: 0
            },
            "schedule recovery"
          );
        }
      }
    }
  };
}

export function createRecoveryEventSystem(): System {
  return {
    id: "RecoveryEventSystem",
    phase: "resolve",
    priority: 1,
    update(ctx) {
      for (const event of ctx.events.due("epidemic.recover")) {
        if (!event.target || typeof event.target !== "string") {
          continue;
        }
        const state = ctx.world.getComponent<InfectionStateComponent>(event.target, InfectionState);
        if (state?.status === "infected") {
          ctx.commands.patchComponent(event.target, InfectionState, { status: "recovered" }, "scheduled recovery");
        }
      }
    }
  };
}

export function epidemicMetrics(): MetricDefinition[] {
  return [
    countMetric("susceptibleCount", "Susceptible", "Agents currently susceptible.", "susceptible"),
    countMetric("infectedCount", "Infected", "Agents currently infected.", "infected"),
    countMetric("recoveredCount", "Recovered", "Agents recovered from infection.", "recovered")
  ];
}

function countMetric(
  key: string,
  label: string,
  description: string,
  status: InfectionStateComponent["status"]
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
        .entitiesWith([InfectionState])
        .filter((entityId) => world.getComponent<InfectionStateComponent>(entityId, InfectionState)?.status === status).length;
    }
  };
}

function epidemicParams(params: ParameterValues): {
  agentCount: number;
  initialInfected: number;
  infectionRadius: number;
  infectionProbability: number;
  recoveryTicks: number;
  movementSpeed: number;
} {
  const values = {
    agentCount: Number(params.agentCount),
    initialInfected: Number(params.initialInfected),
    infectionRadius: Number(params.infectionRadius),
    infectionProbability: Number(params.infectionProbability),
    recoveryTicks: Number(params.recoveryTicks),
    movementSpeed: Number(params.movementSpeed)
  };
  if (
    !Number.isInteger(values.agentCount) ||
    values.agentCount <= 0 ||
    !Number.isInteger(values.initialInfected) ||
    values.initialInfected < 0 ||
    values.initialInfected > values.agentCount ||
    !Number.isFinite(values.infectionRadius) ||
    values.infectionRadius <= 0 ||
    !Number.isFinite(values.infectionProbability) ||
    values.infectionProbability < 0 ||
    values.infectionProbability > 1 ||
    !Number.isInteger(values.recoveryTicks) ||
    values.recoveryTicks <= 0 ||
    !Number.isFinite(values.movementSpeed) ||
    values.movementSpeed < 0
  ) {
    throw new SimulationValidationError("Invalid epidemic parameters");
  }
  return values;
}

function epidemicInitialInfectedIndices(
  params: ReturnType<typeof epidemicParams>,
  positions: readonly Point2D[],
  initialization: InitializationConfig | undefined,
  initRng: RandomStream
): Set<number> {
  if (!initialization) {
    return new Set(Array.from({ length: params.initialInfected }, (_, index) => index));
  }
  const count = Math.min(params.agentCount, Math.max(0, Math.round(finiteOption(initialization, "initialInfectedCount", params.initialInfected))));
  if (count === 0) {
    return new Set();
  }
  if (initialization.presetId === "single-cluster-outbreak") {
    const center = {
      x: finiteOption(initialization, "centerX", 50),
      y: finiteOption(initialization, "centerY", 50)
    };
    return closestIndices(positions, count, (position) => squaredDistance(position, center));
  }
  if (initialization.presetId === "multiple-hotspots") {
    const hotspotCount = Math.max(1, Math.round(finiteOption(initialization, "hotspotCount", 3)));
    const hotspots = Array.from({ length: hotspotCount }, () => ({ x: initRng.float() * 100, y: initRng.float() * 100 }));
    return closestIndices(positions, count, (position) => Math.min(...hotspots.map((hotspot) => squaredDistance(position, hotspot))));
  }
  return new Set(initRng.shuffle(Array.from({ length: params.agentCount }, (_, index) => index)).slice(0, count));
}

function closestIndices(positions: readonly Point2D[], count: number, score: (position: Point2D) => number): Set<number> {
  return new Set(
    positions
      .map((position, index) => ({ index, score: score(position) }))
      .sort((left, right) => left.score - right.score || left.index - right.index)
      .slice(0, count)
      .map((entry) => entry.index)
  );
}

function squaredDistance(left: Point2D, right: Point2D): number {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  return dx * dx + dy * dy;
}

function finiteOption(initialization: InitializationConfig, key: string, fallback: number): number {
  const value = initialization.options[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
