import type {
  BehaviorModeDefinition,
  EntityTypeDefinition,
  JsonValue,
  InitializationConfig,
  InitializationPresetDefinition,
  MetricDefinition,
  ModelDocumentation,
  ParameterDefinition,
  ParameterValues,
  ComponentValue,
  SimulationSnapshotView,
  SimulationTemplate,
  System,
  SystemContext,
  TemplateCapabilities,
  TemplateSpaceDefinition
} from "../kernel/types";
import { SimulationValidationError } from "../kernel/Errors";
import { World, type WorldView } from "../kernel/World";
import { Continuous2DSpace, type Continuous2DSpaceReader } from "../spaces/Continuous2DSpace";
import type { BoundaryMode, Point2D, SpaceLocation } from "../spaces/Space";
import { Position2D, Velocity2D } from "./epidemic.template";
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const FLOCKING_SPACE_ID = "flocking-space";
export const BoidState = "BoidState";
export const BoidGroup = "BoidGroup";

export interface BoidStateComponent extends Record<string, JsonValue> {
  neighborCount: number;
  localDensity: number;
  speed: number;
}

export interface BoidGroupComponent extends Record<string, JsonValue> {
  groupId: string;
  groupIndex: number;
  groupCount: number;
}

type Vec2 = Point2D;
type FlockingBehaviorModeId = "default" | "groupAware";

interface CachedBoid {
  id: string;
  position: Vec2;
  velocity: Vec2;
  groupId?: string;
}

interface NeighborSummary {
  neighborCount: number;
  weightedNeighborCount: number;
  separationCount: number;
  velocitySum: Vec2;
  weightedVelocitySum: Vec2;
  cohesionOffsetSum: Vec2;
  weightedCohesionOffsetSum: Vec2;
  separationSum: Vec2;
}

interface FlockingTickData {
  tick: number;
  signature: string;
  boids: CachedBoid[];
  summaries: Map<string, NeighborSummary>;
}

interface FlockingTickCache {
  data?: FlockingTickData;
}

const worldWidth = 100;
const worldHeight = 100;

const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "agentCount",
    label: "Agent count",
    type: "integer",
    defaultValue: 180,
    min: 20,
    max: 600,
    step: 1,
    description: "Number of boids.",
    liveUpdate: false
  },
  {
    key: "perceptionRadius",
    label: "Perception radius",
    type: "number",
    defaultValue: 55,
    min: 5,
    max: 200,
    step: 1,
    description: "How far each boid can sense neighbors.",
    liveUpdate: true
  },
  {
    key: "separationRadius",
    label: "Separation radius",
    type: "number",
    defaultValue: 18,
    min: 2,
    max: 80,
    step: 1,
    description: "Distance where boids strongly avoid crowding.",
    liveUpdate: true
  },
  {
    key: "alignmentWeight",
    label: "Alignment weight",
    type: "number",
    defaultValue: 0.55,
    min: 0,
    max: 3,
    step: 0.01,
    description: "Strength of steering toward nearby average heading.",
    liveUpdate: true
  },
  {
    key: "cohesionWeight",
    label: "Cohesion weight",
    type: "number",
    defaultValue: 0.35,
    min: 0,
    max: 3,
    step: 0.01,
    description: "Strength of steering toward nearby group center.",
    liveUpdate: true
  },
  {
    key: "separationWeight",
    label: "Separation weight",
    type: "number",
    defaultValue: 0.9,
    min: 0,
    max: 5,
    step: 0.01,
    description: "Strength of steering away from crowded neighbors.",
    liveUpdate: true
  },
  {
    key: "maxSpeed",
    label: "Max speed",
    type: "number",
    defaultValue: 2.4,
    min: 0.1,
    max: 10,
    step: 0.1,
    description: "Maximum boid speed per tick.",
    liveUpdate: true
  },
  {
    key: "maxForce",
    label: "Max force",
    type: "number",
    defaultValue: 0.08,
    min: 0.001,
    max: 1,
    step: 0.001,
    description: "Maximum steering force per tick.",
    liveUpdate: true
  },
  {
    key: "noise",
    label: "Noise",
    type: "number",
    defaultValue: 0.01,
    min: 0,
    max: 0.5,
    step: 0.01,
    description: "Random steering noise.",
    liveUpdate: true
  },
  {
    key: "boundaryMode",
    label: "Boundary mode",
    type: "select",
    defaultValue: "wrap",
    options: ["wrap", "bounce", "clamp"],
    description: "How boids behave at the world boundary.",
    liveUpdate: false
  }
];

const behaviorModes: BehaviorModeDefinition[] = [
  {
    id: "default",
    label: "Classic boids",
    description: "Boids share the same separation, alignment, cohesion, boundary, and noise rules.",
    templateId: "flocking-boids",
    supportedCompositionFields: ["agentCount"],
    documentation: "The default mode keeps the historical ORTUS flocking behavior."
  },
  {
    id: "groupAware",
    label: "Group-aware boids",
    description: "Boids belong to deterministic groups; same-group neighbors weigh more strongly for alignment and cohesion while separation still avoids all nearby boids.",
    templateId: "flocking-boids",
    supportedCompositionFields: ["agentCount", "groupCount", "primaryGroupRatio"],
    supportedParameters: ["alignmentWeight", "cohesionWeight", "separationWeight", "perceptionRadius", "separationRadius"],
    documentation: "A stylized group-aware flocking variant for exploring how local affinity affects collective movement.",
    limitations: [
      "Groups are assigned at initialization and do not change during a run.",
      "Group affinity changes steering weights only; it is not a social identity or biological cognition model."
    ],
    visualNotes: "Group-aware boids expose BoidGroup metadata so renderers can distinguish initialized groups.",
    metricNotes: "Inter-group center distance is reported when at least two groups exist."
  }
];

const agentCompositionDefinitions: ParameterDefinition[] = [
  parameterDefinition("agentCount"),
  {
    key: "groupCount",
    label: "Group count",
    type: "integer",
    defaultValue: 2,
    min: 1,
    max: 4,
    step: 1,
    description: "Number of deterministic boid groups used by group-aware behavior.",
    liveUpdate: false
  },
  {
    key: "primaryGroupRatio",
    label: "Primary group ratio",
    type: "number",
    defaultValue: 0.5,
    min: 0.1,
    max: 0.9,
    step: 0.05,
    description: "Fraction assigned to group 1 when two boid groups are used.",
    liveUpdate: false
  }
];
const environmentOptionDefinitions: ParameterDefinition[] = [parameterDefinition("boundaryMode")];

const capabilities: TemplateCapabilities = {
  supportsScenarioBuilder: true,
  supportsInitializationPresets: true,
  supportsAgentComposition: true,
  supportsBehaviorModes: true,
  supportsEnvironmentOptions: true,
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
  spaceId: FLOCKING_SPACE_ID,
  description: "A bounded continuous 2D motion field for boid steering.",
  boundaryMode: "wrap",
  dimensions: { width: worldWidth, height: worldHeight }
};

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "boid",
    label: "Boid",
    description: "Mobile agent with position, velocity, and local flock-state summaries.",
    components: [Position2D, Velocity2D, BoidState, BoidGroup],
    representedAs: "entity",
    configurableCount: true,
    countParameterKey: "agentCount",
    defaultVisual: { color: "#d9a34e", glyph: "arrow", label: "Boid" }
  },
  {
    typeId: "boidGroup",
    label: "Boid group",
    description: "Optional initialized group metadata used by group-aware flocking behavior.",
    components: [BoidGroup],
    representedAs: "state",
    configurableCount: true,
    defaultVisual: { color: "#d8ff3e", glyph: "arrow", label: "Group-aware boid" }
  }
];

const initializationPresets: InitializationPresetDefinition[] = [
  {
    id: "random-headings",
    label: "Random Headings",
    description: "Boids start throughout the field with seeded random headings."
  },
  {
    id: "aligned-flock",
    label: "Aligned Flock",
    description: "Boids start with similar headings to reveal alignment stability.",
    parameterOverrides: { alignmentWeight: 0.8, cohesionWeight: 0.45 },
    optionDefinitions: [
      {
        key: "headingDegrees",
        label: "Heading degrees",
        type: "number",
        defaultValue: 0,
        min: -180,
        max: 180,
        step: 5,
        description: "Central starting heading.",
        liveUpdate: false
      },
      {
        key: "headingSpread",
        label: "Heading spread",
        type: "number",
        defaultValue: 12,
        min: 0,
        max: 180,
        step: 1,
        description: "Maximum seeded heading deviation.",
        liveUpdate: false
      }
    ]
  },
  {
    id: "two-opposing-flocks",
    label: "Two Opposing Flocks",
    description: "Two initial groups start on opposite sides with opposing headings.",
    parameterOverrides: { agentCount: 180, separationWeight: 1.1 }
  },
  {
    id: "ring-formation",
    label: "Ring Formation",
    description: "Boids begin around a ring with tangential headings. This is an initial formation only, not a persistent orbit rule.",
    parameterOverrides: { agentCount: 160, cohesionWeight: 0.25 },
    optionDefinitions: [
      {
        key: "ringRadius",
        label: "Ring radius",
        type: "number",
        defaultValue: 28,
        min: 8,
        max: 48,
        step: 1,
        description: "Radius of the initial ring around the field center.",
        liveUpdate: false
      },
      {
        key: "clockwise",
        label: "Clockwise",
        type: "boolean",
        defaultValue: true,
        description: "Whether initial headings travel clockwise around the ring.",
        liveUpdate: false
      }
    ]
  }
];

const documentation: ModelDocumentation = {
  purpose: "Demonstrate emergent flocking from local movement rules.",
  entities: ["Boid agents moving in a continuous 2D world."],
  stateVariables: ["Position2D", "Velocity2D", "BoidState"],
  processOverview:
    "Boids sense nearby agents, combine separation, alignment, and cohesion steering, update velocity, move, and record flock-level metrics.",
  scheduling:
    "Neighbor sensing runs before steering. Steering uses start-of-tick positions and velocities, movement runs after velocity updates, and metrics are collected after movement.",
  designConcepts: {
    emergence: "Coherent flock movement can emerge from local steering rules.",
    interaction: "Each boid reacts only to nearby boids inside the perception radius.",
    adaptation: "Boids adapt heading and speed based on local alignment, cohesion, and separation.",
    stochasticity: "Initialization and optional steering noise use deterministic seeded RNG streams.",
    observation: "Speed, neighbor count, alignment, dispersion, and agent count are collected as metrics."
  },
  initialization: "Boids are initialized with seeded random positions and velocities.",
  submodels: ["Neighbor sensing", "Separation", "Alignment", "Cohesion", "Boundary handling", "Observation"],
  assumptions: [
    "All boids use the same behavioral rules.",
    "There are no obstacles, leaders, predators, energy limits, or environmental constraints.",
    "The world is a simplified 2D space with local perception only."
  ],
  limitations: [
    "This is not a calibrated animal movement model.",
    "Forces are simplified and do not include vision cones, fatigue, or environmental constraints.",
    "These models are exploratory simulations, not calibrated predictive tools.",
    "The template is exploratory only."
  ],
  notRepresented: [
    "Animal cognition",
    "aerodynamics",
    "obstacles",
    "leaders",
    "energy/fatigue",
    "vision cones",
    "explicit system boundary or environment layer",
    "boundaryMode as a full boundary model",
    "positions as environmental field layers",
    "explicit spatial/environmental field layers",
    "external forcing or exogenous shocks",
    "delayed perception or control feedback",
    "multi-scale flock/group abstraction",
    "measurement noise or observability model",
    "terrain"
  ],
  appropriateUse: ["Exploring local separation/alignment/cohesion dynamics and how parameter changes affect flock-level patterns."],
  inappropriateUse: ["Predicting real animal movement, designing aircraft control systems, or claiming biological fidelity."]
};

const assumptionProfile = createTemplateAssumptionProfile({
  templateId: "flocking-boids",
  assumptions: documentation.assumptions,
  limitations: documentation.limitations,
  notRepresented: documentation.notRepresented ?? [],
  appropriateUse: documentation.appropriateUse ?? [],
  inappropriateUse: documentation.inappropriateUse ?? [],
  ethicsNotes: [
    "Do not treat stylized boid behavior as evidence about animal cognition or validated control systems.",
    "Group-aware behavior modes remain template-defined simplifications, not general social or biological rules."
  ],
  validationStatus: "internallyTested",
  validationNotes: "Internally tested through deterministic engine, validation, serialization, group-aware behavior, and template smoke tests. Not calibrated or externally validated."
});

const metricDefinitions = flockingMetrics();

export const flockingTemplate: SimulationTemplate = {
  id: "flocking-boids",
  name: "Flocking / Boids",
  description: "Local separation, alignment, and cohesion rules for emergent flock motion.",
  version: "1.0.0",
  capabilities,
  spaceDefinition,
  entityTypeDefinitions,
  parameterDefinitions,
  metricDefinitions,
  initializationPresets,
  behaviorModes,
  agentCompositionDefinitions,
  environmentOptionDefinitions,
  documentation,
  assumptionProfile,
  createInitialWorld(ctx) {
    const params = flockingParams(ctx.params);
    const behaviorMode = flockingBehaviorModeFromScenario(ctx.scenario?.behaviorMode);
    const groupConfig = flockingGroupConfig(ctx.scenario?.agentComposition, params);
    const world = new World({
      globals: {
        flockingBehaviorMode: behaviorMode,
        flockingGroupCount: groupConfig.groupCount
      }
    });
    const space = new Continuous2DSpace({
      id: FLOCKING_SPACE_ID,
      width: worldWidth,
      height: worldHeight,
      boundaryMode: params.boundaryMode
    });
    world.addSpace(space);

    const initRng = ctx.rng.fork("flocking:init");
    for (let index = 0; index < params.agentCount; index += 1) {
      const entity = world.entityStore.create("boid", { createdAtTick: 0, label: `Boid ${index + 1}` });
      const position = initialBoidPosition(index, params.agentCount, ctx.initialization, initRng.float(), initRng.float());
      const angle = initialBoidAngle(index, params.agentCount, ctx.initialization, initRng.float());
      const speed = params.maxSpeed * (0.45 + initRng.float() * 0.55);
      const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
      world.componentStore.add(entity.id, Position2D, position);
      world.componentStore.add(entity.id, Velocity2D, velocity);
      world.componentStore.add(entity.id, BoidState, { neighborCount: 0, localDensity: 0, speed });
      if (behaviorMode === "groupAware") {
        world.componentStore.add(entity.id, BoidGroup, boidGroupForIndex(index, params.agentCount, groupConfig));
      }
      space.addEntity(entity.id, position);
    }

    return world;
  },
  registerSystems(registry) {
    const tickCache: FlockingTickCache = {};
    registry.register(createBoidNeighborSensingSystem(tickCache));
    registry.register(createBoidSteeringSystem(tickCache));
    registry.register(createBoidMovementSystem());
  },
  registerMetrics(registry) {
    for (const metric of metricDefinitions) {
      registry.register(metric);
    }
  },
  getVisuals(_snapshot: SimulationSnapshotView) {
    return {
      components: {
        positionComponent: Position2D,
        velocityComponent: Velocity2D,
        boidStateComponent: BoidState,
        boidGroupComponent: BoidGroup
      },
      colors: {
        boid: "#d9a34e",
        "group-1": "#d8ff3e",
        "group-2": "#6c72ff",
        "group-3": "#ff4a2e",
        "group-4": "#c34dff",
        heading: "#f1dfb0",
        selected: "#ffe0a0"
      },
      labels: {
        boid: "Boid",
        "group-1": "Group 1 boid",
        "group-2": "Group 2 boid",
        "group-3": "Group 3 boid",
        "group-4": "Group 4 boid",
        heading: "Velocity heading",
        selected: "Selected boid"
      },
      description: "Boids are directional marks aligned to their velocity heading."
    };
  },
  validateWorld(world) {
    validateFlockingWorld(world);
  },
  validateParameters(params) {
    flockingParams(params);
  },
  validateScenarioOptions(options, params) {
    const behaviorMode = flockingBehaviorModeFromScenario(options.behaviorMode);
    const resolved = flockingParams(params);
    const groupConfig = flockingGroupConfig(options.agentComposition, resolved);
    if (behaviorMode === "default" && groupConfig.groupCount < 1) {
      throw new SimulationValidationError("groupCount must be at least 1");
    }
    if (behaviorMode === "groupAware" && groupConfig.groupCount < 2) {
      throw new SimulationValidationError("groupAware behavior requires groupCount of at least 2");
    }
  },
  validateInitializationOptions(initialization) {
    if (initialization.presetId === "aligned-flock") {
      const spread = finiteOption(initialization, "headingSpread", 12);
      if (spread < 0 || spread > 180) {
        throw new SimulationValidationError("headingSpread must be between 0 and 180 degrees");
      }
    }
    if (initialization.presetId === "ring-formation") {
      const radius = finiteOption(initialization, "ringRadius", 28);
      if (radius < 8 || radius > 48) {
        throw new SimulationValidationError("ringRadius must be between 8 and 48");
      }
      if (typeof initialization.options.clockwise !== "boolean") {
        throw new SimulationValidationError("clockwise must be a boolean option");
      }
    }
  }
};

function parameterDefinition(key: string): ParameterDefinition {
  const definition = parameterDefinitions.find((candidate) => candidate.key === key);
  if (!definition) {
    throw new Error(`Missing flocking parameter definition: ${key}`);
  }
  return definition;
}

export function createBoidNeighborSensingSystem(cache?: FlockingTickCache): System {
  return {
    id: "BoidNeighborSensingSystem",
    phase: "sense",
    priority: 0,
    query: [Position2D, Velocity2D, BoidState],
    update(ctx) {
      const params = flockingParams(ctx.params);
      const space = requireFlockingSpace(ctx.spaces.continuous2D(FLOCKING_SPACE_ID));
      const data = ensureFlockingTickData(ctx, space, params, cache);
      if (cache) {
        return;
      }
      const boidCount = data.boids.length;
      for (const boid of data.boids) {
        const summary = data.summaries.get(boid.id) ?? emptyNeighborSummary();
        const state = {
          neighborCount: summary.neighborCount,
          localDensity: boidCount <= 1 ? 0 : summary.neighborCount / (boidCount - 1),
          speed: magnitude(boid.velocity)
        };
        const current = ctx.world.getComponent<BoidStateComponent>(boid.id, BoidState);
        if (!current || !sameBoidState(current, state)) {
          ctx.commands.setComponent(boid.id, BoidState, state, "boid neighbor sensing");
        }
      }
    }
  };
}

export function createBoidSteeringSystem(cache?: FlockingTickCache): System {
  return {
    id: "BoidSteeringSystem",
    phase: "decide",
    priority: 0,
    query: [Position2D, Velocity2D, BoidState],
    update(ctx) {
      const params = flockingParams(ctx.params);
      const space = requireFlockingSpace(ctx.spaces.continuous2D(FLOCKING_SPACE_ID));
      const data = ensureFlockingTickData(ctx, space, params, cache);
      const noiseRng = ctx.rng.fork("flocking:noise");
      const boidCount = data.boids.length;
      const velocityUpdates: Record<string, ComponentValue> = {};
      const stateUpdates: Record<string, ComponentValue> = {};

      for (const boid of data.boids) {
        const summary = data.summaries.get(boid.id) ?? emptyNeighborSummary();
        const separation =
          summary.separationCount === 0
            ? zero()
            : steerToward(boid.velocity, divide(summary.separationSum, summary.separationCount), params.maxSpeed, params.maxForce);
        const alignment =
          summary.weightedNeighborCount === 0
            ? zero()
            : steerToward(boid.velocity, divide(summary.weightedVelocitySum, summary.weightedNeighborCount), params.maxSpeed, params.maxForce);
        const cohesion =
          summary.weightedNeighborCount === 0
            ? zero()
            : steerToward(boid.velocity, divide(summary.weightedCohesionOffsetSum, summary.weightedNeighborCount), params.maxSpeed, params.maxForce);
        let steering = add(add(multiply(separation, params.separationWeight), multiply(alignment, params.alignmentWeight)), multiply(cohesion, params.cohesionWeight));

        if (params.noise > 0) {
          const angle = noiseRng.float() * Math.PI * 2;
          steering = add(steering, multiply({ x: Math.cos(angle), y: Math.sin(angle) }, params.noise));
        }

        steering = limitMagnitude(steering, params.maxForce);
        const nextVelocity = limitMagnitude(add(boid.velocity, steering), params.maxSpeed);
        if (!sameVector(boid.velocity, nextVelocity)) {
          velocityUpdates[boid.id] = nextVelocity;
        }
        const nextState = {
          neighborCount: summary.neighborCount,
          localDensity: boidCount <= 1 ? 0 : summary.neighborCount / (boidCount - 1),
          speed: magnitude(nextVelocity)
        };
        const currentState = ctx.world.getComponent<BoidStateComponent>(boid.id, BoidState);
        if (!currentState || !sameBoidState(currentState, nextState)) {
          stateUpdates[boid.id] = nextState;
        }
      }
      if (Object.keys(velocityUpdates).length > 0) {
        ctx.commands.setComponents(Velocity2D, velocityUpdates, "boid steering velocities");
      }
      if (Object.keys(stateUpdates).length > 0) {
        ctx.commands.setComponents(BoidState, stateUpdates, "boid steering states");
      }
    }
  };
}

export function createBoidMovementSystem(): System {
  return {
    id: "BoidMovementSystem",
    phase: "act",
    priority: 0,
    query: [Position2D, Velocity2D, BoidState],
    update(ctx) {
      const params = flockingParams(ctx.params);
      const space = requireFlockingSpace(ctx.spaces.continuous2D(FLOCKING_SPACE_ID));
      const positionUpdates: Record<string, ComponentValue> = {};
      const velocityUpdates: Record<string, ComponentValue> = {};
      const moveUpdates: Record<string, SpaceLocation> = {};
      for (const entityId of [...(ctx.entityIds ?? [])].sort((left, right) => left.localeCompare(right))) {
        const position = ctx.world.getComponent<Vec2>(entityId, Position2D);
        const velocity = ctx.world.getComponent<Vec2>(entityId, Velocity2D);
        if (!position || !velocity) {
          continue;
        }
        const bounded = applyBoundary(add(position, multiply(velocity, ctx.dt)), velocity, space, params.boundaryMode);
        moveUpdates[entityId] = bounded.position;
        positionUpdates[entityId] = bounded.position;
        if (!sameVector(velocity, bounded.velocity)) {
          velocityUpdates[entityId] = bounded.velocity;
        }
      }
      if (Object.keys(moveUpdates).length > 0) {
        ctx.commands.moveEntities(FLOCKING_SPACE_ID, moveUpdates, "boid movement");
      }
      if (Object.keys(positionUpdates).length > 0) {
        ctx.commands.setComponents(Position2D, positionUpdates, "sync boid positions");
      }
      if (Object.keys(velocityUpdates).length > 0) {
        ctx.commands.setComponents(Velocity2D, velocityUpdates, "boid boundary velocities");
      }
    }
  };
}

export function flockingMetrics(): MetricDefinition[] {
  return [
    {
      key: "averageSpeed",
      id: "averageSpeed",
      label: "Average speed",
      description: "Mean boid velocity magnitude.",
      valueType: "number",
      displayUnit: "units/tick",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const velocities = velocityValues(world);
        return mean(velocities.map(magnitude));
      }
    },
    {
      key: "averageNeighborCount",
      id: "averageNeighborCount",
      label: "Average neighbors",
      description: "Mean number of neighbors sensed in the last sensing phase.",
      valueType: "number",
      displayUnit: "neighbors",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return mean(boidStates(world).map((state) => state.neighborCount));
      }
    },
    {
      key: "averageLocalDensity",
      id: "averageLocalDensity",
      label: "Average local density",
      description: "Mean neighbor count normalized by flock size.",
      valueType: "number",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return mean(boidStates(world).map((state) => state.localDensity));
      }
    },
    {
      key: "alignmentScore",
      id: "alignmentScore",
      label: "Alignment score",
      description: "Magnitude of the mean normalized heading vector.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const headings = velocityValues(world).map(normalize).filter((value) => magnitude(value) > 0);
        if (headings.length === 0) {
          return 0;
        }
        return magnitude(divide(headings.reduce(add, zero()), headings.length));
      }
    },
    {
      key: "dispersion",
      id: "dispersion",
      label: "Dispersion",
      description: "Mean distance from the flock center of mass.",
      valueType: "number",
      displayUnit: "world units",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const positions = world.entitiesWith([Position2D]).map((entityId) => world.getComponent<Vec2>(entityId, Position2D)).filter(isFiniteVector);
        if (positions.length === 0) {
          return 0;
        }
        const center = divide(positions.reduce(add, zero()), positions.length);
        return mean(positions.map((position) => distance(position, center)));
      }
    },
    {
      key: "interGroupDistance",
      id: "interGroupDistance",
      label: "Inter-group distance",
      description: "Mean pairwise distance between initialized boid group centers; zero when groups are not active.",
      valueType: "number",
      displayUnit: "world units",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return meanInterGroupDistance(world);
      }
    },
    {
      key: "agentCount",
      id: "agentCount",
      label: "Boid count",
      description: "Living boid count.",
      valueType: "integer",
      displayUnit: "boids",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return world.entitiesWith([BoidState]).length;
      }
    }
  ];
}

export function flockingParams(params: ParameterValues): {
  agentCount: number;
  perceptionRadius: number;
  separationRadius: number;
  alignmentWeight: number;
  cohesionWeight: number;
  separationWeight: number;
  maxSpeed: number;
  maxForce: number;
  noise: number;
  boundaryMode: BoundaryMode;
} {
  const values = {
    agentCount: Number(params.agentCount),
    perceptionRadius: Number(params.perceptionRadius),
    separationRadius: Number(params.separationRadius),
    alignmentWeight: Number(params.alignmentWeight),
    cohesionWeight: Number(params.cohesionWeight),
    separationWeight: Number(params.separationWeight),
    maxSpeed: Number(params.maxSpeed),
    maxForce: Number(params.maxForce),
    noise: Number(params.noise),
    boundaryMode: String(params.boundaryMode)
  };
  if (!Number.isInteger(values.agentCount) || values.agentCount < 20 || values.agentCount > 600) {
    throw new SimulationValidationError("Invalid flocking parameters: agent count must be an integer from 20 to 600");
  }
  if (!Number.isFinite(values.perceptionRadius) || values.perceptionRadius < 5 || values.perceptionRadius > 200) {
    throw new SimulationValidationError("Invalid flocking parameters: perception radius must be from 5 to 200");
  }
  if (!Number.isFinite(values.separationRadius) || values.separationRadius < 2 || values.separationRadius > 80) {
    throw new SimulationValidationError("Invalid flocking parameters: separation radius must be from 2 to 80");
  }
  if (values.separationRadius > values.perceptionRadius) {
    throw new SimulationValidationError("Invalid flocking parameters: separation radius must be <= perception radius");
  }
  if (
    !nonnegative(values.alignmentWeight) ||
    !nonnegative(values.cohesionWeight) ||
    !nonnegative(values.separationWeight)
  ) {
    throw new SimulationValidationError("Invalid flocking parameters: steering weights must be nonnegative");
  }
  if (!Number.isFinite(values.maxSpeed) || values.maxSpeed <= 0) {
    throw new SimulationValidationError("Invalid flocking parameters: max speed must be positive");
  }
  if (!Number.isFinite(values.maxForce) || values.maxForce <= 0) {
    throw new SimulationValidationError("Invalid flocking parameters: max force must be positive");
  }
  if (!Number.isFinite(values.noise) || values.noise < 0 || values.noise > 0.5) {
    throw new SimulationValidationError("Invalid flocking parameters: noise must be between 0 and 0.5");
  }
  if (values.boundaryMode !== "wrap" && values.boundaryMode !== "bounce" && values.boundaryMode !== "clamp") {
    throw new SimulationValidationError("Invalid flocking parameters: boundary mode must be wrap, bounce, or clamp");
  }
  return { ...values, boundaryMode: values.boundaryMode };
}

function initialBoidPosition(
  index: number,
  agentCount: number,
  initialization: InitializationConfig | undefined,
  randomX: number,
  randomY: number
): Vec2 {
  if (initialization?.presetId === "ring-formation") {
    const angle = (index / Math.max(1, agentCount)) * Math.PI * 2;
    const radius = finiteOption(initialization, "ringRadius", 28);
    const jitter = (randomX - 0.5) * 3;
    return {
      x: worldWidth / 2 + Math.cos(angle) * (radius + jitter),
      y: worldHeight / 2 + Math.sin(angle) * (radius + jitter)
    };
  }
  if (initialization?.presetId === "two-opposing-flocks") {
    const left = index < agentCount / 2;
    return {
      x: left ? 18 + randomX * 16 : 66 + randomX * 16,
      y: 18 + randomY * 64
    };
  }
  return { x: randomX * worldWidth, y: randomY * worldHeight };
}

function initialBoidAngle(index: number, agentCount: number, initialization: InitializationConfig | undefined, randomUnit: number): number {
  if (initialization?.presetId === "aligned-flock") {
    const heading = (finiteOption(initialization, "headingDegrees", 0) * Math.PI) / 180;
    const spread = (finiteOption(initialization, "headingSpread", 12) * Math.PI) / 180;
    return heading + (randomUnit * 2 - 1) * spread;
  }
  if (initialization?.presetId === "two-opposing-flocks") {
    const left = index < agentCount / 2;
    return left ? 0 : Math.PI;
  }
  if (initialization?.presetId === "ring-formation") {
    const radial = (index / Math.max(1, agentCount)) * Math.PI * 2;
    const clockwise = initialization.options.clockwise !== false;
    return radial + (clockwise ? Math.PI / 2 : -Math.PI / 2);
  }
  return randomUnit * Math.PI * 2;
}

function finiteOption(initialization: InitializationConfig, key: string, fallback: number): number {
  const value = initialization.options[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function flockingBehaviorModeFromScenario(value: unknown): FlockingBehaviorModeId {
  if (value === undefined || value === "default") {
    return "default";
  }
  if (value === "groupAware") {
    return "groupAware";
  }
  throw new SimulationValidationError(`Unsupported flocking behavior mode: ${String(value)}`);
}

function flockingBehaviorModeFromWorld(globals: Record<string, JsonValue>): FlockingBehaviorModeId {
  return flockingBehaviorModeFromScenario(globals.flockingBehaviorMode);
}

function flockingGroupConfig(
  composition: ParameterValues | undefined,
  params: ReturnType<typeof flockingParams>
): { groupCount: number; primaryGroupRatio: number } {
  const groupCount = Number(composition?.groupCount ?? 2);
  const primaryGroupRatio = Number(composition?.primaryGroupRatio ?? 0.5);
  if (!Number.isInteger(groupCount) || groupCount < 1 || groupCount > 4) {
    throw new SimulationValidationError("groupCount must be an integer from 1 to 4");
  }
  if (!Number.isFinite(primaryGroupRatio) || primaryGroupRatio < 0.1 || primaryGroupRatio > 0.9) {
    throw new SimulationValidationError("primaryGroupRatio must be between 0.1 and 0.9");
  }
  if (groupCount > params.agentCount) {
    throw new SimulationValidationError("groupCount cannot exceed agentCount");
  }
  return { groupCount, primaryGroupRatio };
}

function boidGroupForIndex(index: number, agentCount: number, config: { groupCount: number; primaryGroupRatio: number }): BoidGroupComponent {
  const groupIndex =
    config.groupCount === 1
      ? 1
      : config.groupCount === 2
        ? index < Math.max(1, Math.min(agentCount - 1, Math.round(agentCount * config.primaryGroupRatio)))
          ? 1
          : 2
        : (index % config.groupCount) + 1;
  return {
    groupId: `group-${groupIndex}`,
    groupIndex,
    groupCount: config.groupCount
  };
}

function groupAffinityWeight(source: CachedBoid, target: CachedBoid, behaviorMode: FlockingBehaviorModeId): number {
  if (behaviorMode !== "groupAware" || !source.groupId || !target.groupId) {
    return 1;
  }
  return source.groupId === target.groupId ? 1.65 : 0.45;
}

function ensureFlockingTickData(
  ctx: SystemContext,
  space: Continuous2DSpaceReader,
  params: ReturnType<typeof flockingParams>,
  cache?: FlockingTickCache
): FlockingTickData {
  const behaviorMode = flockingBehaviorModeFromWorld(ctx.world.globals);
  const signature = `${behaviorMode}:${params.perceptionRadius}:${params.separationRadius}:${space.width}:${space.height}:${space.boundaryMode}`;
  if (cache?.data?.tick === ctx.tick && cache.data.signature === signature) {
    return cache.data;
  }

  const boids = [...(ctx.entityIds ?? [])]
    .sort((left, right) => left.localeCompare(right))
    .map((entityId): CachedBoid | undefined => {
      const position = ctx.world.getComponent<Vec2>(entityId, Position2D);
      const velocity = ctx.world.getComponent<Vec2>(entityId, Velocity2D);
      const group = ctx.world.getComponent<BoidGroupComponent>(entityId, BoidGroup);
      return position && velocity ? { id: entityId, position, velocity, ...(group?.groupId ? { groupId: group.groupId } : {}) } : undefined;
    })
    .filter((boid): boid is CachedBoid => boid !== undefined);

  const summaries = new Map<string, NeighborSummary>();
  for (const boid of boids) {
    summaries.set(boid.id, emptyNeighborSummary());
  }

  const perceptionRadiusSquared = params.perceptionRadius * params.perceptionRadius;
  const separationRadiusSquared = params.separationRadius * params.separationRadius;
  for (let leftIndex = 0; leftIndex < boids.length; leftIndex += 1) {
    const left = boids[leftIndex]!;
    const leftSummary = summaries.get(left.id)!;
    for (let rightIndex = leftIndex + 1; rightIndex < boids.length; rightIndex += 1) {
      const right = boids[rightIndex]!;
      const rightSummary = summaries.get(right.id)!;
      const offset = delta(left.position, right.position, space);
      const distanceSquared = offset.x * offset.x + offset.y * offset.y;
      if (distanceSquared > perceptionRadiusSquared) {
        continue;
      }

      leftSummary.neighborCount += 1;
      rightSummary.neighborCount += 1;
      const leftAffinity = groupAffinityWeight(left, right, behaviorMode);
      const rightAffinity = groupAffinityWeight(right, left, behaviorMode);
      leftSummary.weightedNeighborCount += leftAffinity;
      rightSummary.weightedNeighborCount += rightAffinity;
      addInto(leftSummary.velocitySum, right.velocity);
      addInto(rightSummary.velocitySum, left.velocity);
      addScaledInto(leftSummary.weightedVelocitySum, right.velocity, leftAffinity);
      addScaledInto(rightSummary.weightedVelocitySum, left.velocity, rightAffinity);
      addInto(leftSummary.cohesionOffsetSum, offset);
      subtractInto(rightSummary.cohesionOffsetSum, offset);
      addScaledInto(leftSummary.weightedCohesionOffsetSum, offset, leftAffinity);
      subtractScaledInto(rightSummary.weightedCohesionOffsetSum, offset, rightAffinity);

      if (distanceSquared > separationRadiusSquared) {
        continue;
      }

      const distanceValue = Math.sqrt(distanceSquared);
      const weight = 1 / Math.max(distanceValue, 0.001);
      if (distanceValue < 1e-9) {
        addScaledInto(leftSummary.separationSum, unitFromString(`${left.id}:${right.id}`), weight);
        addScaledInto(rightSummary.separationSum, unitFromString(`${right.id}:${left.id}`), weight);
      } else {
        const inverseDistance = 1 / distanceValue;
        const nx = offset.x * inverseDistance;
        const ny = offset.y * inverseDistance;
        leftSummary.separationSum.x -= nx * weight;
        leftSummary.separationSum.y -= ny * weight;
        rightSummary.separationSum.x += nx * weight;
        rightSummary.separationSum.y += ny * weight;
      }
      leftSummary.separationCount += 1;
      rightSummary.separationCount += 1;
    }
  }

  const data = { tick: ctx.tick, signature, boids, summaries };
  if (cache) {
    cache.data = data;
  }
  return data;
}

function emptyNeighborSummary(): NeighborSummary {
  return {
    neighborCount: 0,
    weightedNeighborCount: 0,
    separationCount: 0,
    velocitySum: zero(),
    weightedVelocitySum: zero(),
    cohesionOffsetSum: zero(),
    weightedCohesionOffsetSum: zero(),
    separationSum: zero()
  };
}

function steerToward(currentVelocity: Vec2, desiredDirection: Vec2, maxSpeed: number, maxForce: number): Vec2 {
  if (magnitude(desiredDirection) === 0) {
    return zero();
  }
  const desiredVelocity = multiply(normalize(desiredDirection), maxSpeed);
  return limitMagnitude(subtract(desiredVelocity, currentVelocity), maxForce);
}

function applyBoundary(position: Vec2, velocity: Vec2, space: Continuous2DSpaceReader, mode: BoundaryMode): { position: Vec2; velocity: Vec2 } {
  if (mode === "wrap") {
    return { position: space.normalizePosition(position), velocity };
  }
  if (mode === "clamp") {
    const clamped = {
      x: clamp(position.x, 0, space.width),
      y: clamp(position.y, 0, space.height)
    };
    return {
      position: clamped,
      velocity: {
        x: clamped.x === position.x ? velocity.x : 0,
        y: clamped.y === position.y ? velocity.y : 0
      }
    };
  }
  return bounce(position, velocity, space.width, space.height);
}

function bounce(position: Vec2, velocity: Vec2, width: number, height: number): { position: Vec2; velocity: Vec2 } {
  let next = { ...position };
  let nextVelocity = { ...velocity };
  while (next.x < 0 || next.x > width) {
    if (next.x < 0) {
      next.x = -next.x;
      nextVelocity.x = Math.abs(nextVelocity.x);
    }
    if (next.x > width) {
      next.x = width - (next.x - width);
      nextVelocity.x = -Math.abs(nextVelocity.x);
    }
  }
  while (next.y < 0 || next.y > height) {
    if (next.y < 0) {
      next.y = -next.y;
      nextVelocity.y = Math.abs(nextVelocity.y);
    }
    if (next.y > height) {
      next.y = height - (next.y - height);
      nextVelocity.y = -Math.abs(nextVelocity.y);
    }
  }
  return { position: next, velocity: nextVelocity };
}

function validateFlockingWorld(world: WorldView): void {
  flockingBehaviorModeFromWorld(world.globals);
  for (const entityId of componentEntityIds(world, Position2D)) {
    const position = world.getComponent<Vec2>(entityId, Position2D);
    if (!isFiniteVector(position)) {
      throw new SimulationValidationError(`Invalid Position2D component on ${entityId}`);
    }
  }
  for (const entityId of componentEntityIds(world, Velocity2D)) {
    const velocity = world.getComponent<Vec2>(entityId, Velocity2D);
    if (!isFiniteVector(velocity)) {
      throw new SimulationValidationError(`Invalid Velocity2D component on ${entityId}`);
    }
  }
  for (const entityId of componentEntityIds(world, BoidState)) {
    const state = world.getComponent<BoidStateComponent>(entityId, BoidState);
    if (!isBoidState(state)) {
      throw new SimulationValidationError(`Invalid BoidState component on ${entityId}`);
    }
  }
  for (const entityId of componentEntityIds(world, BoidGroup)) {
    const group = world.getComponent<BoidGroupComponent>(entityId, BoidGroup);
    if (!isBoidGroup(group)) {
      throw new SimulationValidationError(`Invalid BoidGroup component on ${entityId}`);
    }
  }
}

function velocityValues(world: WorldView): Vec2[] {
  return world.entitiesWith([Velocity2D]).map((entityId) => world.getComponent<Vec2>(entityId, Velocity2D)).filter(isFiniteVector);
}

function boidStates(world: WorldView): BoidStateComponent[] {
  return world.entitiesWith([BoidState]).map((entityId) => world.getComponent<BoidStateComponent>(entityId, BoidState)).filter(isBoidState);
}

function boidGroups(world: WorldView): Array<{ entityId: string; group: BoidGroupComponent; position?: Vec2 }> {
  return world
    .entitiesWith([BoidGroup])
    .map((entityId) => {
      const group = world.getComponent<BoidGroupComponent>(entityId, BoidGroup);
      const position = world.getComponent<Vec2>(entityId, Position2D);
      return group && isBoidGroup(group) ? { entityId, group, ...(position && isFiniteVector(position) ? { position } : {}) } : undefined;
    })
    .filter((record): record is { entityId: string; group: BoidGroupComponent; position?: Vec2 } => record !== undefined);
}

function meanInterGroupDistance(world: WorldView): number {
  const groups = new Map<string, { count: number; sum: Vec2 }>();
  for (const record of boidGroups(world)) {
    if (!record.position) {
      continue;
    }
    const current = groups.get(record.group.groupId) ?? { count: 0, sum: zero() };
    current.count += 1;
    addInto(current.sum, record.position);
    groups.set(record.group.groupId, current);
  }
  const centers = [...groups.values()]
    .filter((group) => group.count > 0)
    .map((group) => divide(group.sum, group.count));
  if (centers.length < 2) {
    return 0;
  }
  const distances: number[] = [];
  for (let leftIndex = 0; leftIndex < centers.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < centers.length; rightIndex += 1) {
      distances.push(distance(centers[leftIndex]!, centers[rightIndex]!));
    }
  }
  return mean(distances);
}

function componentEntityIds(world: { allEntities(): Array<{ id: string }>; hasComponent(entityId: string, componentType: string): boolean }, componentType: string): string[] {
  return world
    .allEntities()
    .filter((entity) => world.hasComponent(entity.id, componentType))
    .map((entity) => entity.id)
    .sort((left, right) => left.localeCompare(right));
}

function requireFlockingSpace(space: Continuous2DSpaceReader | undefined): Continuous2DSpaceReader {
  if (!space) {
    throw new SimulationValidationError("Flocking continuous space is missing");
  }
  return space;
}

function isBoidState(value: unknown): value is BoidStateComponent {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger((value as BoidStateComponent).neighborCount) &&
    (value as BoidStateComponent).neighborCount >= 0 &&
    Number.isFinite((value as BoidStateComponent).localDensity) &&
    (value as BoidStateComponent).localDensity >= 0 &&
    Number.isFinite((value as BoidStateComponent).speed) &&
    (value as BoidStateComponent).speed >= 0
  );
}

function isBoidGroup(value: unknown): value is BoidGroupComponent {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as BoidGroupComponent).groupId === "string" &&
    /^group-[1-4]$/.test((value as BoidGroupComponent).groupId) &&
    Number.isInteger((value as BoidGroupComponent).groupIndex) &&
    (value as BoidGroupComponent).groupIndex >= 1 &&
    (value as BoidGroupComponent).groupIndex <= 4 &&
    Number.isInteger((value as BoidGroupComponent).groupCount) &&
    (value as BoidGroupComponent).groupCount >= 1 &&
    (value as BoidGroupComponent).groupCount <= 4
  );
}

function isFiniteVector(value: unknown): value is Vec2 {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Vec2).x === "number" &&
    Number.isFinite((value as Vec2).x) &&
    typeof (value as Vec2).y === "number" &&
    Number.isFinite((value as Vec2).y)
  );
}

function nonnegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function add(left: Vec2, right: Vec2): Vec2 {
  return { x: left.x + right.x, y: left.y + right.y };
}

function addInto(target: Vec2, value: Vec2): void {
  target.x += value.x;
  target.y += value.y;
}

function subtractInto(target: Vec2, value: Vec2): void {
  target.x -= value.x;
  target.y -= value.y;
}

function addScaledInto(target: Vec2, value: Vec2, scalar: number): void {
  target.x += value.x * scalar;
  target.y += value.y * scalar;
}

function subtractScaledInto(target: Vec2, value: Vec2, scalar: number): void {
  target.x -= value.x * scalar;
  target.y -= value.y * scalar;
}

function subtract(left: Vec2, right: Vec2): Vec2 {
  return { x: left.x - right.x, y: left.y - right.y };
}

function multiply(value: Vec2, scalar: number): Vec2 {
  return { x: value.x * scalar, y: value.y * scalar };
}

function divide(value: Vec2, scalar: number): Vec2 {
  return scalar === 0 ? zero() : { x: value.x / scalar, y: value.y / scalar };
}

function magnitude(value: Vec2): number {
  return Math.hypot(value.x, value.y);
}

function normalize(value: Vec2): Vec2 {
  const length = magnitude(value);
  return length === 0 ? zero() : divide(value, length);
}

function limitMagnitude(value: Vec2, max: number): Vec2 {
  const length = magnitude(value);
  return length > max ? multiply(divide(value, length), max) : value;
}

function distance(left: Vec2, right: Vec2): number {
  return magnitude(subtract(left, right));
}

function delta(from: Vec2, to: Vec2, space: Continuous2DSpaceReader): Vec2 {
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  if (space.boundaryMode === "wrap") {
    if (Math.abs(dx) > space.width / 2) {
      dx -= Math.sign(dx) * space.width;
    }
    if (Math.abs(dy) > space.height / 2) {
      dy -= Math.sign(dy) * space.height;
    }
  }
  return { x: dx, y: dy };
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function zero(): Vec2 {
  return { x: 0, y: 0 };
}

function sameVector(left: Vec2, right: Vec2): boolean {
  return Math.abs(left.x - right.x) < 1e-12 && Math.abs(left.y - right.y) < 1e-12;
}

function sameBoidState(left: BoidStateComponent, right: BoidStateComponent): boolean {
  return (
    left.neighborCount === right.neighborCount &&
    Math.abs(left.localDensity - right.localDensity) < 1e-12 &&
    Math.abs(left.speed - right.speed) < 1e-12
  );
}

function unitFromString(value: string): Vec2 {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  const angle = (hash / 0xffffffff) * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}
