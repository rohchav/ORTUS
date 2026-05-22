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
import { World, type WorldView } from "../kernel/World";
import { Grid2DSpace, type Grid2DSpaceReader } from "../spaces/Grid2DSpace";
import type { RandomStream } from "../kernel/Random";
import type { GridCell } from "../spaces/Space";
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const SCHELLING_SPACE_ID = "schelling-grid";
export const PositionGrid = "PositionGrid";
export const GroupIdentity = "GroupIdentity";
export const SatisfactionState = "SatisfactionState";

export interface PositionGridComponent extends Record<string, JsonValue> {
  row: number;
  col: number;
}

export interface GroupIdentityComponent extends Record<string, JsonValue> {
  group: "A" | "B";
}

export interface SatisfactionStateComponent extends Record<string, JsonValue> {
  satisfied: boolean;
  similarNeighborRatio: number;
  similarNeighbors: number;
  differentNeighbors: number;
  totalOccupiedNeighbors: number;
}

const maxCells = 6000;

const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "rows",
    label: "Rows",
    type: "integer",
    defaultValue: 35,
    min: 10,
    max: 80,
    step: 1,
    description: "Number of grid rows.",
    liveUpdate: false
  },
  {
    key: "cols",
    label: "Columns",
    type: "integer",
    defaultValue: 45,
    min: 10,
    max: 100,
    step: 1,
    description: "Number of grid columns.",
    liveUpdate: false
  },
  {
    key: "density",
    label: "Density",
    type: "number",
    defaultValue: 0.85,
    min: 0.1,
    max: 0.95,
    step: 0.01,
    description: "Fraction of grid cells initially occupied.",
    liveUpdate: false
  },
  {
    key: "groupRatio",
    label: "Group A ratio",
    type: "number",
    defaultValue: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Fraction of occupied agents assigned to Group A.",
    liveUpdate: false
  },
  {
    key: "similarityThreshold",
    label: "Similarity threshold",
    type: "number",
    defaultValue: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Minimum fraction of similar occupied neighbors needed to feel satisfied.",
    liveUpdate: true
  },
  {
    key: "neighborhoodRadius",
    label: "Neighborhood radius",
    type: "integer",
    defaultValue: 1,
    min: 1,
    max: 3,
    step: 1,
    description: "How far each agent looks for neighbors.",
    liveUpdate: true
  },
  {
    key: "moveFractionPerTick",
    label: "Move fraction per tick",
    type: "number",
    defaultValue: 0.15,
    min: 0.01,
    max: 1,
    step: 0.01,
    description: "Fraction of dissatisfied agents allowed to move per tick.",
    liveUpdate: true
  }
];

const behaviorModes: BehaviorModeDefinition[] = [
  {
    id: "default",
    label: "Classic Schelling",
    description: "Agents evaluate local similarity and dissatisfied agents move to empty cells."
  }
];

const agentCompositionDefinitions: ParameterDefinition[] = [parameterDefinition("density"), parameterDefinition("groupRatio")];
const environmentOptionDefinitions: ParameterDefinition[] = [parameterDefinition("rows"), parameterDefinition("cols")];

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
  supportsContinuousSpace: false,
  supportsGridSpace: true,
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
  type: "grid2d",
  spaceId: SCHELLING_SPACE_ID,
  description: "A bounded 2D grid of occupied and empty neighborhood cells.",
  boundaryMode: "clamp",
  dimensions: { rows: 35, cols: 45 }
};

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "groupA",
    label: "Group A agent",
    description: "Grid occupant with Group A identity.",
    components: [PositionGrid, GroupIdentity, SatisfactionState],
    representedAs: "entity",
    configurableCount: true,
    countParameterKey: "groupRatio",
    defaultVisual: { color: "#d8a34a", label: "Group A" }
  },
  {
    typeId: "groupB",
    label: "Group B agent",
    description: "Grid occupant with Group B identity.",
    components: [PositionGrid, GroupIdentity, SatisfactionState],
    representedAs: "entity",
    configurableCount: true,
    countParameterKey: "groupRatio",
    defaultVisual: { color: "#9d6b58", label: "Group B" }
  },
  {
    typeId: "emptyCell",
    label: "Empty cell",
    description: "Unoccupied grid cell available for movement.",
    representedAs: "cell",
    configurableCount: true,
    countParameterKey: "density",
    defaultVisual: { color: "#2a241d", label: "Empty" }
  }
];

const initializationPresets: InitializationPresetDefinition[] = [
  {
    id: "random-neighborhood",
    label: "Random Neighborhood",
    description: "Occupied cells and group identities are seeded randomly."
  },
  {
    id: "clustered-neighborhood",
    label: "Clustered Neighborhood",
    description: "Group identities are assigned into broad seeded spatial districts.",
    parameterOverrides: { similarityThreshold: 0.42 }
  },
  {
    id: "balanced-sparse-neighborhood",
    label: "Balanced Sparse Neighborhood",
    description: "A lower-density neighborhood with balanced groups and more empty space.",
    parameterOverrides: { density: 0.55, groupRatio: 0.5, similarityThreshold: 0.35 }
  }
];

const documentation: ModelDocumentation = {
  purpose: "Show how mild local preferences can produce large-scale spatial segregation without strongly exclusionary individual rules.",
  entities: ["Group A agents", "Group B agents", "Empty grid cells"],
  stateVariables: ["PositionGrid", "GroupIdentity", "SatisfactionState"],
  processOverview: "Agents evaluate nearby occupied cells, mark satisfaction, and a deterministic seeded subset of dissatisfied agents moves to empty cells.",
  scheduling: "Satisfaction evaluation runs before movement. Movement uses seeded randomness and metrics are collected after movement.",
  designConcepts: {
    emergence: "Local satisfaction thresholds and moves to empty cells can generate macro-level clustering.",
    interaction: "Agents react only to local neighborhood composition.",
    stochasticity: "Initial placement, group assignment, and movement order use deterministic seeded RNG streams.",
    observation: "Satisfaction, similarity, movement, group counts, and empty cells are recorded as metrics."
  },
  initialization: "Grid cells are populated according to density, groups are assigned according to groupRatio, and remaining cells stay empty.",
  submodels: ["Neighborhood satisfaction", "Dissatisfied movement", "Aggregate observation"],
  assumptions: [
    "Only two groups are modeled.",
    "Agents care only about local neighborhood composition.",
    "Agents with zero occupied neighbors are treated as satisfied.",
    "Empty cells are available for movement."
  ],
  limitations: [
    "This is not a predictive model of real segregation.",
    "Group identity and movement are simplified.",
    "Income, policy, housing price, road networks, institutional constraints, and historical constraints are not modeled.",
    "These models are exploratory simulations, not calibrated predictive tools.",
    "The template is exploratory only."
  ],
  notRepresented: [
    "Housing markets",
    "institutions",
    "law",
    "income",
    "transportation",
    "discrimination history",
    "explicit system boundary or environment layer",
    "grid edges as a full boundary model",
    "grid occupancy as an environmental field layer",
    "explicit spatial/environmental field layers",
    "external forcing or exogenous shocks",
    "human identity complexity",
    "institutional feedback, delayed policy response, or market response",
    "measurement or observability model for real neighborhoods",
    "causal validation of real segregation mechanisms",
    "relational social networks beyond grid neighbors"
  ],
  appropriateUse: ["Exploring how local preference thresholds and empty-cell availability can produce spatial clustering."],
  inappropriateUse: ["Explaining or predicting real segregation, evaluating policy, or representing lived social identities."]
};

const assumptionProfile = createTemplateAssumptionProfile({
  templateId: "schelling-segregation",
  assumptions: documentation.assumptions,
  limitations: documentation.limitations,
  notRepresented: documentation.notRepresented ?? [],
  appropriateUse: documentation.appropriateUse ?? [],
  inappropriateUse: documentation.inappropriateUse ?? [],
  ethicsNotes: [
    "This model abstracts social identity and housing dynamics; do not use it to justify discriminatory claims or policy.",
    "Real segregation involves institutions, law, economics, history, violence, and human agency that are outside this template."
  ],
  validationStatus: "internallyTested",
  validationNotes: "Internally tested through deterministic engine, validation, serialization, and template smoke tests. Not calibrated or externally validated."
});

const metricDefinitions = schellingMetrics();

export const schellingTemplate: SimulationTemplate = {
  id: "schelling-segregation",
  name: "Schelling Segregation",
  description: "Grid-based local preference model for emergent clustering.",
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
    const params = schellingParams(ctx.params);
    const world = new World({ globals: { movedThisTick: 0 } });
    const space = new Grid2DSpace({ id: SCHELLING_SPACE_ID, rows: params.rows, cols: params.cols, boundaryMode: "clamp" });
    world.addSpace(space);

    const initRng = ctx.rng.fork("schelling:init");
    const cells = initRng.shuffle(allCells(params.rows, params.cols));
    const occupiedCount = occupiedCellCount(params);
    const occupiedCells = cells.slice(0, occupiedCount);
    const groups = initialSchellingGroups(params, occupiedCells, ctx.initialization, initRng);

    for (let index = 0; index < occupiedCount; index += 1) {
      const cell = occupiedCells[index];
      const group = groups[index];
      if (!cell || !group) {
        continue;
      }
      const label = `Group ${group} ${index + 1}`;
      const entity = world.entityStore.create(group === "A" ? "group-a" : "group-b", { createdAtTick: 0, label });
      world.componentStore.add(entity.id, PositionGrid, cell);
      world.componentStore.add(entity.id, GroupIdentity, { group });
      world.componentStore.add(entity.id, SatisfactionState, initialSatisfaction());
      space.addEntity(entity.id, cell);
    }

    return world;
  },
  registerSystems(registry) {
    registry.register(createSchellingSatisfactionSystem());
    registry.register(createSchellingMovementSystem());
  },
  registerMetrics(registry) {
    for (const metric of metricDefinitions) {
      registry.register(metric);
    }
  },
  getVisuals(_snapshot: SimulationSnapshotView) {
    return {
      components: {
        positionGridComponent: PositionGrid,
        groupIdentityComponent: GroupIdentity,
        satisfactionStateComponent: SatisfactionState
      },
      colors: {
        groupA: "#d8a34a",
        groupB: "#9d6b58",
        empty: "#2a241d",
        dissatisfied: "#f0dfaa"
      },
      labels: {
        groupA: "Group A",
        groupB: "Group B",
        empty: "Empty cell",
        dissatisfied: "Dissatisfied outline"
      },
      description: "Group A and Group B occupy grid cells; dissatisfied agents receive a brighter outline."
    };
  },
  validateWorld(world) {
    validateSchellingWorld(world);
  },
  validateParameters(params) {
    schellingParams(params);
  }
};

function parameterDefinition(key: string): ParameterDefinition {
  const definition = parameterDefinitions.find((candidate) => candidate.key === key);
  if (!definition) {
    throw new Error(`Missing Schelling parameter definition: ${key}`);
  }
  return definition;
}

export function createSchellingSatisfactionSystem(): System {
  return {
    id: "SchellingSatisfactionEvaluationSystem",
    phase: "sense",
    priority: 0,
    query: [PositionGrid, GroupIdentity, SatisfactionState],
    update(ctx) {
      const params = schellingParams(ctx.params);
      const space = requireSchellingGrid(ctx.spaces.grid2D(SCHELLING_SPACE_ID));
      const occupancy = occupancyFromGrid(space);
      const groups = groupMap(ctx.world);

      for (const entityId of [...(ctx.entityIds ?? [])].sort((left, right) => left.localeCompare(right))) {
        const cell = space.getCell(entityId);
        const group = groups.get(entityId);
        if (!cell || !group) {
          continue;
        }
        const state = evaluateSatisfaction(space, occupancy, groups, entityId, cell, group, params.neighborhoodRadius, params.similarityThreshold);
        const current = ctx.world.getComponent<SatisfactionStateComponent>(entityId, SatisfactionState);
        if (!current || !sameSatisfaction(current, state)) {
          ctx.commands.setComponent(entityId, SatisfactionState, state, "schelling satisfaction evaluation");
        }
      }
    }
  };
}

export function createSchellingMovementSystem(): System {
  return {
    id: "SchellingMovementDecisionSystem",
    phase: "decide",
    priority: 0,
    query: [PositionGrid, GroupIdentity, SatisfactionState],
    update(ctx) {
      const params = schellingParams(ctx.params);
      const space = requireSchellingGrid(ctx.spaces.grid2D(SCHELLING_SPACE_ID));
      const movementRng = ctx.rng.fork("schelling:movement");
      const cells = gridCells(space);
      const occupiedKeys = new Set(Object.values(cells).map(cellKey));
      const emptyCells = allCells(space.rows, space.cols).filter((cell) => !occupiedKeys.has(cellKey(cell)));
      const dissatisfied = [...(ctx.entityIds ?? [])]
        .filter((entityId) => ctx.world.getComponent<SatisfactionStateComponent>(entityId, SatisfactionState)?.satisfied === false)
        .sort((left, right) => left.localeCompare(right));
      const moveLimit = Math.min(emptyCells.length, Math.ceil(dissatisfied.length * params.moveFractionPerTick));
      const movers = movementRng.shuffle(dissatisfied).slice(0, moveLimit);
      const destinations = movementRng.shuffle(emptyCells).slice(0, movers.length);

      let moved = 0;
      for (let index = 0; index < movers.length; index += 1) {
        const entityId = movers[index];
        const destination = destinations[index];
        if (!entityId || !destination) {
          continue;
        }
        ctx.commands.moveEntity(SCHELLING_SPACE_ID, entityId, destination, "schelling dissatisfied move");
        ctx.commands.setComponent(entityId, PositionGrid, destination, "sync grid position component");
        moved += 1;
      }

      ctx.commands.setGlobal("movedThisTick", moved, "schelling movement count");
    }
  };
}

export function schellingMetrics(): MetricDefinition[] {
  return [
    {
      key: "satisfiedCount",
      id: "satisfiedCount",
      label: "Satisfied agents",
      description: "Agents whose current satisfaction state is satisfied.",
      valueType: "integer",
      displayUnit: "agents",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return satisfactionStates(world).filter((state) => state.satisfied).length;
      }
    },
    {
      key: "dissatisfiedCount",
      id: "dissatisfiedCount",
      label: "Dissatisfied agents",
      description: "Agents below the local similarity threshold.",
      valueType: "integer",
      displayUnit: "agents",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return satisfactionStates(world).filter((state) => !state.satisfied).length;
      }
    },
    {
      key: "satisfactionRate",
      id: "satisfactionRate",
      label: "Satisfaction rate",
      description: "Satisfied agents divided by occupied cells.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "percent",
      collect(world) {
        const states = satisfactionStates(world);
        return states.length === 0 ? 1 : states.filter((state) => state.satisfied).length / states.length;
      }
    },
    {
      key: "averageSimilarity",
      id: "averageSimilarity",
      label: "Average similarity",
      description: "Mean similar-neighbor ratio across occupied cells.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const states = satisfactionStates(world);
        return states.length === 0 ? 1 : states.reduce((sum, state) => sum + state.similarNeighborRatio, 0) / states.length;
      }
    },
    {
      key: "movedThisTick",
      id: "movedThisTick",
      label: "Moved this tick",
      description: "Dissatisfied agents moved during the last movement phase.",
      valueType: "integer",
      displayUnit: "agents",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "event",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return Number(world.globals.movedThisTick ?? 0);
      }
    },
    groupCountMetric("groupACount", "Group A", "Living Group A agents.", "A"),
    groupCountMetric("groupBCount", "Group B", "Living Group B agents.", "B"),
    {
      key: "emptyCellCount",
      id: "emptyCellCount",
      label: "Empty cells",
      description: "Grid cells not currently occupied by an agent.",
      valueType: "integer",
      displayUnit: "cells",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        const space = world.grid2D(SCHELLING_SPACE_ID);
        if (!space) {
          return 0;
        }
        return space.rows * space.cols - world.entitiesWith([GroupIdentity]).length;
      }
    }
  ];
}

export function schellingParams(params: ParameterValues): {
  rows: number;
  cols: number;
  density: number;
  groupRatio: number;
  similarityThreshold: number;
  neighborhoodRadius: number;
  moveFractionPerTick: number;
} {
  const values = {
    rows: Number(params.rows),
    cols: Number(params.cols),
    density: Number(params.density),
    groupRatio: Number(params.groupRatio),
    similarityThreshold: Number(params.similarityThreshold),
    neighborhoodRadius: Number(params.neighborhoodRadius),
    moveFractionPerTick: Number(params.moveFractionPerTick)
  };
  if (!Number.isInteger(values.rows) || values.rows < 10 || values.rows > 80) {
    throw new SimulationValidationError("Invalid Schelling parameters: rows must be an integer from 10 to 80");
  }
  if (!Number.isInteger(values.cols) || values.cols < 10 || values.cols > 100) {
    throw new SimulationValidationError("Invalid Schelling parameters: columns must be an integer from 10 to 100");
  }
  if (values.rows * values.cols > maxCells) {
    throw new SimulationValidationError(`Invalid Schelling parameters: rows * columns must be ${maxCells} cells or fewer`);
  }
  if (!Number.isFinite(values.density) || values.density <= 0 || values.density >= 1) {
    throw new SimulationValidationError("Invalid Schelling parameters: density must be greater than 0 and less than 1");
  }
  if (occupiedCellCount(values) >= values.rows * values.cols) {
    throw new SimulationValidationError("Invalid Schelling parameters: density must leave at least one empty cell");
  }
  if (!Number.isFinite(values.groupRatio) || values.groupRatio < 0 || values.groupRatio > 1) {
    throw new SimulationValidationError("Invalid Schelling parameters: Group A ratio must be between 0 and 1");
  }
  if (!Number.isFinite(values.similarityThreshold) || values.similarityThreshold < 0 || values.similarityThreshold > 1) {
    throw new SimulationValidationError("Invalid Schelling parameters: similarity threshold must be between 0 and 1");
  }
  if (!Number.isInteger(values.neighborhoodRadius) || values.neighborhoodRadius < 1 || values.neighborhoodRadius > 3) {
    throw new SimulationValidationError("Invalid Schelling parameters: neighborhood radius must be an integer from 1 to 3");
  }
  if (!Number.isFinite(values.moveFractionPerTick) || values.moveFractionPerTick <= 0 || values.moveFractionPerTick > 1) {
    throw new SimulationValidationError("Invalid Schelling parameters: move fraction per tick must be greater than 0 and at most 1");
  }
  return values;
}

function evaluateSatisfaction(
  space: Grid2DSpaceReader,
  occupancy: Map<string, string>,
  groups: Map<string, GroupIdentityComponent["group"]>,
  entityId: string,
  cell: GridCell,
  group: GroupIdentityComponent["group"],
  radius: number,
  threshold: number
): SatisfactionStateComponent {
  let similarNeighbors = 0;
  let differentNeighbors = 0;

  for (const neighborCell of space.neighbors(cell, { includeDiagonals: true, radius })) {
    const neighborId = occupancy.get(cellKey(neighborCell));
    if (!neighborId || neighborId === entityId) {
      continue;
    }
    if (groups.get(neighborId) === group) {
      similarNeighbors += 1;
    } else {
      differentNeighbors += 1;
    }
  }

  const totalOccupiedNeighbors = similarNeighbors + differentNeighbors;
  const similarNeighborRatio = totalOccupiedNeighbors === 0 ? 1 : similarNeighbors / totalOccupiedNeighbors;
  return {
    satisfied: totalOccupiedNeighbors === 0 || similarNeighborRatio >= threshold,
    similarNeighborRatio,
    similarNeighbors,
    differentNeighbors,
    totalOccupiedNeighbors
  };
}

function validateSchellingWorld(world: WorldView): void {
  const space = requireSchellingGrid(world.grid2D(SCHELLING_SPACE_ID));
  const cells = gridCells(space);
  const seen = new Set<string>();

  for (const [entityId, cell] of Object.entries(cells)) {
    const key = cellKey(cell);
    if (seen.has(key)) {
      throw new SimulationValidationError(`Schelling grid cell ${key} has more than one agent`);
    }
    seen.add(key);
    const position = world.getComponent<PositionGridComponent>(entityId, PositionGrid);
    if (!isGridPosition(position) || position.row !== cell.row || position.col !== cell.col) {
      throw new SimulationValidationError(`Invalid PositionGrid component on ${entityId}`);
    }
  }

  for (const entityId of world.entitiesWith([GroupIdentity])) {
    const group = world.getComponent<GroupIdentityComponent>(entityId, GroupIdentity);
    const satisfaction = world.getComponent<SatisfactionStateComponent>(entityId, SatisfactionState);
    if (!group || (group.group !== "A" && group.group !== "B")) {
      throw new SimulationValidationError(`Invalid GroupIdentity component on ${entityId}`);
    }
    if (!isSatisfactionState(satisfaction)) {
      throw new SimulationValidationError(`Invalid SatisfactionState component on ${entityId}`);
    }
    if (!cells[entityId]) {
      throw new SimulationValidationError(`Schelling agent ${entityId} is missing from grid space`);
    }
  }
}

function groupCountMetric(key: string, label: string, description: string, group: GroupIdentityComponent["group"]): MetricDefinition {
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
        .entitiesWith([GroupIdentity])
        .filter((entityId) => world.getComponent<GroupIdentityComponent>(entityId, GroupIdentity)?.group === group).length;
    }
  };
}

function groupMap(world: WorldView): Map<string, GroupIdentityComponent["group"]> {
  const groups = new Map<string, GroupIdentityComponent["group"]>();
  for (const entityId of world.entitiesWith([GroupIdentity])) {
    const group = world.getComponent<GroupIdentityComponent>(entityId, GroupIdentity);
    if (group) {
      groups.set(entityId, group.group);
    }
  }
  return groups;
}

function satisfactionStates(world: WorldView): SatisfactionStateComponent[] {
  return world
    .entitiesWith([SatisfactionState])
    .map((entityId) => world.getComponent<SatisfactionStateComponent>(entityId, SatisfactionState))
    .filter((state): state is SatisfactionStateComponent => state !== undefined);
}

function occupancyFromGrid(space: Grid2DSpaceReader): Map<string, string> {
  const occupancy = new Map<string, string>();
  const cells = gridCells(space);
  for (const [entityId, cell] of Object.entries(cells).sort(([left], [right]) => left.localeCompare(right))) {
    occupancy.set(cellKey(cell), entityId);
  }
  return occupancy;
}

function gridCells(space: Grid2DSpaceReader): Record<string, GridCell> {
  const serialized = space.serialize();
  if (serialized.kind !== "grid2d") {
    throw new SimulationValidationError("Expected grid2d serialized space");
  }
  return serialized.cells;
}

function occupiedCellCount(params: { rows: number; cols: number; density: number }): number {
  return Math.max(1, Math.min(params.rows * params.cols - 1, Math.round(params.rows * params.cols * params.density)));
}

function initialSchellingGroups(
  params: ReturnType<typeof schellingParams>,
  occupiedCells: readonly GridCell[],
  initialization: InitializationConfig | undefined,
  initRng: RandomStream
): GroupIdentityComponent["group"][] {
  const groupA = Math.round(occupiedCells.length * params.groupRatio);
  if (initialization?.presetId === "clustered-neighborhood") {
    const sortedCells = [...occupiedCells].sort((left, right) => left.col - right.col || left.row - right.row);
    const groupedByCell = new Map(
      sortedCells.map((cell, index): [string, GroupIdentityComponent["group"]] => [cellKey(cell), index < groupA ? "A" : "B"])
    );
    return occupiedCells.map((cell) => groupedByCell.get(cellKey(cell)) ?? "A");
  }
  return initRng.shuffle(
    Array.from({ length: occupiedCells.length }, (_, index): GroupIdentityComponent["group"] => (index < groupA ? "A" : "B"))
  );
}

function allCells(rows: number, cols: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({ row, col });
    }
  }
  return cells;
}

function initialSatisfaction(): SatisfactionStateComponent {
  return {
    satisfied: true,
    similarNeighborRatio: 1,
    similarNeighbors: 0,
    differentNeighbors: 0,
    totalOccupiedNeighbors: 0
  };
}

function sameSatisfaction(left: SatisfactionStateComponent, right: SatisfactionStateComponent): boolean {
  return (
    left.satisfied === right.satisfied &&
    left.similarNeighbors === right.similarNeighbors &&
    left.differentNeighbors === right.differentNeighbors &&
    left.totalOccupiedNeighbors === right.totalOccupiedNeighbors &&
    Math.abs(left.similarNeighborRatio - right.similarNeighborRatio) < 1e-12
  );
}

function requireSchellingGrid(space: Grid2DSpaceReader | undefined): Grid2DSpaceReader {
  if (!space) {
    throw new SimulationValidationError("Schelling grid space is missing");
  }
  return space;
}

function isGridPosition(value: unknown): value is PositionGridComponent {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger((value as PositionGridComponent).row) &&
    Number.isInteger((value as PositionGridComponent).col)
  );
}

function isSatisfactionState(value: unknown): value is SatisfactionStateComponent {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SatisfactionStateComponent).satisfied === "boolean" &&
    Number.isFinite((value as SatisfactionStateComponent).similarNeighborRatio) &&
    (value as SatisfactionStateComponent).similarNeighborRatio >= 0 &&
    (value as SatisfactionStateComponent).similarNeighborRatio <= 1 &&
    Number.isInteger((value as SatisfactionStateComponent).similarNeighbors) &&
    (value as SatisfactionStateComponent).similarNeighbors >= 0 &&
    Number.isInteger((value as SatisfactionStateComponent).differentNeighbors) &&
    (value as SatisfactionStateComponent).differentNeighbors >= 0 &&
    Number.isInteger((value as SatisfactionStateComponent).totalOccupiedNeighbors) &&
    (value as SatisfactionStateComponent).totalOccupiedNeighbors >= 0
  );
}

function cellKey(cell: GridCell): string {
  return `${cell.row}:${cell.col}`;
}
