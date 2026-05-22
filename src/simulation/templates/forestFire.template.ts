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
import type { GridCell } from "../spaces/Space";
import type { RandomStream } from "../kernel/Random";
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const FOREST_FIRE_SPACE_ID = "forest-fire-grid";
export const ForestFireCellPosition = "ForestFireCellPosition";
export const ForestFireCellState = "ForestFireCellState";

export type ForestFireCellStatus = "empty" | "fuel" | "burning" | "burned";
export type ForestFireNeighborMode = "vonNeumann" | "moore";
export type ForestFireBoundaryMode = "closed" | "wrap";

export interface ForestFireCellPositionComponent extends Record<string, JsonValue> {
  x: number;
  y: number;
}

export interface ForestFireCellStateComponent extends Record<string, JsonValue> {
  state: ForestFireCellStatus;
  burnAge: number;
  lastChangedTick: number;
}

interface ForestFireParams {
  gridWidth: number;
  gridHeight: number;
  initialFuelDensity: number;
  initialIgnitionCount: number;
  spreadProbability: number;
  lightningProbability: number;
  regrowthProbability: number;
  neighborMode: ForestFireNeighborMode;
  boundaryMode: ForestFireBoundaryMode;
  burnDuration: number;
}

interface ForestFireCellRecord {
  entityId: string;
  cell: GridCell;
  state: ForestFireCellStateComponent;
}

const maxCells = 19200;
const nonPredictiveNote = "These models are exploratory simulations, not calibrated predictive tools.";

const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "gridWidth",
    label: "Grid width",
    type: "integer",
    defaultValue: 60,
    min: 10,
    max: 160,
    step: 1,
    description: "Number of landscape columns.",
    liveUpdate: false
  },
  {
    key: "gridHeight",
    label: "Grid height",
    type: "integer",
    defaultValue: 40,
    min: 10,
    max: 120,
    step: 1,
    description: "Number of landscape rows.",
    liveUpdate: false
  },
  {
    key: "initialFuelDensity",
    label: "Initial fuel density",
    type: "number",
    defaultValue: 0.58,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Initial fraction of cells containing fuel.",
    liveUpdate: false
  },
  {
    key: "initialIgnitionCount",
    label: "Initial ignitions",
    type: "integer",
    defaultValue: 3,
    min: 0,
    max: 100,
    step: 1,
    description: "Number of initial burning fuel cells.",
    liveUpdate: false
  },
  {
    key: "spreadProbability",
    label: "Spread probability",
    type: "number",
    defaultValue: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Per-neighbor chance that a burning cell ignites an adjacent fuel cell.",
    liveUpdate: true
  },
  {
    key: "lightningProbability",
    label: "Lightning probability",
    type: "number",
    defaultValue: 0.0005,
    min: 0,
    max: 1,
    step: 0.0005,
    description: "Per-cell chance that fuel ignites independently each tick.",
    liveUpdate: true
  },
  {
    key: "regrowthProbability",
    label: "Regrowth probability",
    type: "number",
    defaultValue: 0.002,
    min: 0,
    max: 1,
    step: 0.001,
    description: "Per-cell chance that an empty or previously burned cell becomes fuel each tick.",
    liveUpdate: true
  },
  {
    key: "neighborMode",
    label: "Neighbor mode",
    type: "select",
    defaultValue: "vonNeumann",
    options: ["vonNeumann", "moore"],
    description: "Use four-neighbor or eight-neighbor local spread.",
    liveUpdate: false
  },
  {
    key: "boundaryMode",
    label: "Boundary mode",
    type: "select",
    defaultValue: "closed",
    options: ["closed", "wrap"],
    description: "Template-owned grid edge handling; this is not a BoundaryEnvironmentModel.",
    liveUpdate: false
  },
  {
    key: "burnDuration",
    label: "Burn duration",
    type: "integer",
    defaultValue: 1,
    min: 1,
    max: 10,
    step: 1,
    description: "Number of ticks a burning cell remains burning before becoming burned.",
    liveUpdate: false
  }
];

const behaviorModes: BehaviorModeDefinition[] = [
  {
    id: "default",
    label: "Local Spread",
    description: "Fuel cells ignite from local burning neighbors, independent lightning, and optional stylized regrowth."
  }
];

const agentCompositionDefinitions: ParameterDefinition[] = [parameterDefinition("initialFuelDensity"), parameterDefinition("initialIgnitionCount")];
const environmentOptionDefinitions: ParameterDefinition[] = [
  parameterDefinition("gridWidth"),
  parameterDefinition("gridHeight"),
  parameterDefinition("neighborMode"),
  parameterDefinition("boundaryMode")
];

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
  spaceId: FOREST_FIRE_SPACE_ID,
  description: "A template-owned rectangular grid of landscape cells for abstract local spread.",
  boundaryMode: "clamp",
  dimensions: { rows: 40, cols: 60 }
};

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "emptyCell",
    label: "Empty cell",
    description: "A grid cell without fuel.",
    components: [ForestFireCellPosition, ForestFireCellState],
    representedAs: "cell",
    defaultVisual: { color: "#25221b", glyph: "·", label: "Empty" }
  },
  {
    typeId: "fuelCell",
    label: "Fuel cell",
    description: "A grid cell containing fuel that can ignite.",
    components: [ForestFireCellPosition, ForestFireCellState],
    representedAs: "cell",
    configurableCount: true,
    countParameterKey: "initialFuelDensity",
    defaultVisual: { color: "#6f8f3d", glyph: "F", label: "Fuel" }
  },
  {
    typeId: "burningCell",
    label: "Burning cell",
    description: "A fuel cell that is currently burning.",
    components: [ForestFireCellPosition, ForestFireCellState],
    representedAs: "cell",
    configurableCount: true,
    countParameterKey: "initialIgnitionCount",
    defaultVisual: { color: "#ff5a24", glyph: "B", label: "Burning" }
  },
  {
    typeId: "burnedCell",
    label: "Burned cell",
    description: "A cell that has burned out.",
    components: [ForestFireCellPosition, ForestFireCellState],
    representedAs: "cell",
    defaultVisual: { color: "#4a4540", glyph: "X", label: "Burned" }
  }
];

const initializationPresets: InitializationPresetDefinition[] = [
  {
    id: "random-forest",
    label: "Random Forest",
    description: "Random seeded fuel placement with a few ignition points."
  },
  {
    id: "dense-dry-landscape",
    label: "Dense Dry Landscape",
    description: "High fuel density and higher local spread probability.",
    parameterOverrides: { initialFuelDensity: 0.82, spreadProbability: 0.65, initialIgnitionCount: 4, lightningProbability: 0.001 }
  },
  {
    id: "sparse-fragmented-landscape",
    label: "Sparse Fragmented Landscape",
    description: "Lower fuel density creates fragmented clusters and natural breaks.",
    parameterOverrides: { initialFuelDensity: 0.35, spreadProbability: 0.45, initialIgnitionCount: 2, lightningProbability: 0.0002 }
  },
  {
    id: "regrowing-landscape",
    label: "Regrowing Landscape",
    description: "Stylized regrowth can refuel empty or burned cells over time.",
    parameterOverrides: { initialFuelDensity: 0.62, spreadProbability: 0.5, initialIgnitionCount: 2, regrowthProbability: 0.01 }
  },
  {
    id: "central-ignition",
    label: "Central Ignition",
    description: "A deterministic ignition near the center of a fully fueled landscape.",
    parameterOverrides: { initialFuelDensity: 1, initialIgnitionCount: 1, lightningProbability: 0, regrowthProbability: 0 }
  }
];

const documentation: ModelDocumentation = {
  purpose: "Show how local spread, stochastic ignition, thresholds, and fragmentation can produce landscape-level burn patterns in an abstract grid.",
  entities: ["Empty cells", "Fuel cells", "Burning cells", "Burned cells"],
  stateVariables: ["ForestFireCellPosition", "ForestFireCellState"],
  processOverview:
    "Burning cells attempt to ignite neighboring fuel cells, lightning can ignite fuel independently, burning cells age into burned cells, and optional stylized regrowth can turn empty or previously burned cells back into fuel.",
  scheduling:
    "Each tick uses a two-phase update. Ignition candidates are read from the start-of-tick grid, new ignitions do not spread until the next tick, burn aging is based on previous state, and regrowth never overrides a new ignition.",
  designConcepts: {
    emergence: "Local spread and fuel fragmentation can produce fire fronts, holes, extinction, or saturation-like patterns.",
    interaction: "Cells interact only through local grid neighborhoods.",
    stochasticity: "Initial fuel placement, ignition placement, spread, lightning, and regrowth use deterministic seeded RNG streams.",
    observation: "Fuel, burning, burned, ignition, spread-rate, and extinguished metrics are recorded from the grid state."
  },
  initialization: "The grid is seeded with empty/fuel states from the chosen preset and parameters, then selected fuel cells are marked burning.",
  submodels: ["Fuel initialization", "Local neighbor spread", "Lightning ignition", "Burnout", "Stylized regrowth", "Landscape metrics"],
  assumptions: [
    "This is an abstract local-spread model.",
    "Grid cells are homogeneous except for their template-owned cell state.",
    "Spread probabilities are model parameters, not calibrated real-world probabilities.",
    "Forest-fire probability parameters are stylized model probabilities, not measured wildfire probabilities.",
    "Regrowth is stylized if enabled."
  ],
  limitations: [
    "This is not a wildfire predictor.",
    "It does not model real wind, humidity, slope, fuel chemistry, suppression, weather, firefighting, terrain, or GIS data.",
    "Grid boundaries are implementation geometry, not a full BoundaryEnvironmentModel.",
    "Grid cell positions are not explicit SpatialFieldModel runtime support.",
    "Forest-fire metrics are qualitative model outputs, not empirical wildfire measurements.",
    "Forest-fire spread rules are abstract model mechanisms, not empirical causal fire science.",
    "Forest-fire cascades and spread patterns are abstract model outputs, not validated wildfire emergence.",
    "Forest-fire spread, collapse, recovery, or stress-like patterns are abstract model outputs, not wildfire risk validation.",
    "Forest-fire ignite-cell is an abstract template intervention, not wildfire management guidance.",
    nonPredictiveNote,
    "The template is exploratory only."
  ],
  notRepresented: [
    "real wildfire prediction",
    "real weather, wind, humidity, slope, terrain, fuel chemistry, suppression, firefighting, or GIS data",
    "calibrated real-world fire probabilities",
    "explicit system boundary or environment layer",
    "external forcing or exogenous shocks",
    "grid bounds as a full boundary model",
    "grid positions as environmental field layers",
    "explicit spatial/environmental field layers",
    "runtime SpatialFieldModel support",
    "runtime BoundaryEnvironmentModel support",
    "multi-scale aggregation or scale-aware view runtime",
    "observability or measurement model",
    "causal-assumption runtime support",
    "runtime emergence detection",
    "runtime robustness or resilience stress testing",
    "runtime strategy/control semantics",
    "causal validation of real fire mechanisms"
  ],
  appropriateUse: ["Exploring local spread, thresholds, fragmentation, seeded stochasticity, and qualitative emergent patterns."],
  inappropriateUse: ["Operational fire safety decisions, wildfire forecasting, evacuation planning, hazard estimation, or real-world policy claims."]
};

const assumptionProfile = createTemplateAssumptionProfile({
  templateId: "forest-fire",
  assumptions: documentation.assumptions,
  limitations: documentation.limitations,
  notRepresented: documentation.notRepresented ?? [],
  appropriateUse: documentation.appropriateUse ?? [],
  inappropriateUse: documentation.inappropriateUse ?? [],
  ethicsNotes: [
    "Do not use this abstract model for operational fire safety, evacuation, suppression, insurance, or hazard decisions.",
    "Visual burn patterns are qualitative simulation artifacts, not evidence about real landscapes."
  ],
  validationStatus: "internallyTested",
  validationNotes: "Internally tested through deterministic engine, validation, serialization, and template behavior tests. Not calibrated or externally validated."
});

const metricDefinitions = forestFireMetrics();

export const forestFireTemplate: SimulationTemplate = {
  id: "forest-fire",
  name: "Forest Fire / Landscape Spread",
  description: "A grid-based local-spread model where fire propagates through fuel cells and produces landscape-level burn patterns.",
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
    const params = forestFireParams(ctx.params);
    const presetId = ctx.initialization?.presetId ?? "random-forest";
    const world = new World({ globals: { newIgnitions: 0, spreadRate: 0 } });
    const space = new Grid2DSpace({
      id: FOREST_FIRE_SPACE_ID,
      rows: params.gridHeight,
      cols: params.gridWidth,
      boundaryMode: params.boundaryMode === "wrap" ? "wrap" : "clamp"
    });
    world.addSpace(space);

    const initRng = ctx.rng.fork("forestFire:init");
    const cells = allCells(params.gridHeight, params.gridWidth);
    const stateByKey = new Map<string, ForestFireCellStatus>();
    for (const cell of cells) {
      stateByKey.set(cellKey(cell), chance(initRng, params.initialFuelDensity) ? "fuel" : "empty");
    }

    for (const cell of initialIgnitionCells(cells, stateByKey, params, presetId, initRng)) {
      stateByKey.set(cellKey(cell), "burning");
    }

    for (const cell of cells) {
      const state = stateByKey.get(cellKey(cell)) ?? "empty";
      const entityId = forestFireCellEntityId(cell);
      world.entityStore.create("forest-fire-cell", { id: entityId, createdAtTick: 0, label: `Cell ${cell.col},${cell.row}` });
      world.componentStore.add(entityId, ForestFireCellPosition, { x: cell.col, y: cell.row });
      world.componentStore.add(entityId, ForestFireCellState, {
        state,
        burnAge: state === "burning" ? 0 : 0,
        lastChangedTick: 0
      });
      space.addEntity(entityId, cell);
    }

    return world;
  },
  registerSystems(registry) {
    registry.register(createForestFireSpreadSystem());
  },
  registerMetrics(registry) {
    for (const metric of metricDefinitions) {
      registry.register(metric);
    }
  },
  getVisuals(_snapshot: SimulationSnapshotView) {
    return {
      components: {
        positionComponent: ForestFireCellPosition,
        stateComponent: ForestFireCellState
      },
      colors: {
        empty: "#25221b",
        fuel: "#6f8f3d",
        burning: "#ff5a24",
        burned: "#4a4540"
      },
      labels: {
        empty: "Empty",
        fuel: "Fuel",
        burning: "Burning",
        burned: "Burned"
      },
      description: "Landscape cells are colored by template-owned state: empty, fuel, burning, or burned."
    };
  },
  validateWorld(world) {
    validateForestFireWorld(world);
  },
  validateParameters(params) {
    forestFireParams(params);
  },
  validateInitializationOptions(initialization) {
    if (!initializationPresets.some((preset) => preset.id === initialization.presetId)) {
      throw new SimulationValidationError(`Unknown Forest Fire initialization preset: ${initialization.presetId}`);
    }
    if (Object.keys(initialization.options ?? {}).length > 0) {
      throw new SimulationValidationError("Forest Fire initialization presets do not accept custom options in V1");
    }
  }
};

function parameterDefinition(key: string): ParameterDefinition {
  const definition = parameterDefinitions.find((candidate) => candidate.key === key);
  if (!definition) {
    throw new Error(`Missing Forest Fire parameter definition: ${key}`);
  }
  return definition;
}

export function createForestFireSpreadSystem(): System {
  return {
    id: "ForestFireLocalSpreadSystem",
    phase: "act",
    priority: 0,
    query: [ForestFireCellPosition, ForestFireCellState],
    update(ctx) {
      const params = forestFireParams(ctx.params);
      const space = requireForestFireGrid(ctx.spaces.grid2D(FOREST_FIRE_SPACE_ID));
      const records = forestFireCellRecords(ctx.world, space);
      const byCell = new Map(records.map((record) => [cellKey(record.cell), record]));
      const tickRng = ctx.rng.fork("forestFire:tick");
      const ignitionKeys = new Set<string>();
      const previousBurning = records.filter((record) => record.state.state === "burning").length;

      for (const record of records) {
        if (record.state.state !== "burning") {
          continue;
        }
        for (const neighbor of forestFireNeighbors(record.cell, params.gridHeight, params.gridWidth, params.neighborMode, params.boundaryMode)) {
          const candidate = byCell.get(cellKey(neighbor));
          if (!candidate || candidate.state.state !== "fuel" || ignitionKeys.has(cellKey(neighbor))) {
            continue;
          }
          if (chance(tickRng, params.spreadProbability)) {
            ignitionKeys.add(cellKey(neighbor));
          }
        }
      }

      for (const record of records) {
        const key = cellKey(record.cell);
        if (record.state.state === "fuel" && !ignitionKeys.has(key) && chance(tickRng, params.lightningProbability)) {
          ignitionKeys.add(key);
        }
      }

      const nextStates: Record<string, ForestFireCellStateComponent> = {};
      let newIgnitions = 0;
      for (const record of records) {
        const key = cellKey(record.cell);
        let nextState: ForestFireCellStatus = record.state.state;
        let nextBurnAge = record.state.state === "burning" ? record.state.burnAge : 0;

        if (record.state.state === "burning") {
          nextBurnAge = record.state.burnAge + 1;
          if (nextBurnAge >= params.burnDuration) {
            nextState = "burned";
            nextBurnAge = 0;
          }
        } else if (record.state.state === "fuel" && ignitionKeys.has(key)) {
          nextState = "burning";
          nextBurnAge = 0;
          newIgnitions += 1;
        } else if ((record.state.state === "empty" || record.state.state === "burned") && chance(tickRng, params.regrowthProbability)) {
          nextState = "fuel";
          nextBurnAge = 0;
        }

        const changed = nextState !== record.state.state;
        nextStates[record.entityId] = {
          state: nextState,
          burnAge: nextState === "burning" ? nextBurnAge : 0,
          lastChangedTick: changed ? ctx.tick : record.state.lastChangedTick
        };
      }

      ctx.commands.setComponents(ForestFireCellState, nextStates, "forest fire two-phase cell update");
      ctx.commands.setGlobal("newIgnitions", newIgnitions, "forest fire new ignition count");
      ctx.commands.setGlobal("spreadRate", previousBurning === 0 ? 0 : newIgnitions / previousBurning, "forest fire spread rate");
    }
  };
}

export function forestFireMetrics(): MetricDefinition[] {
  return [
    fractionMetric("fuelFraction", "Fuel fraction", "Fraction of cells that currently contain fuel.", "fuel"),
    fractionMetric("burningFraction", "Burning fraction", "Fraction of cells currently burning.", "burning"),
    fractionMetric("burnedFraction", "Burned fraction", "Fraction of cells that are burned.", "burned"),
    fractionMetric("emptyFraction", "Empty fraction", "Fraction of cells with no fuel.", "empty"),
    countMetric("activeFireCount", "Active fires", "Number of currently burning cells.", "burning"),
    countMetric("burnedTotalCount", "Burned cells", "Number of currently burned cells.", "burned"),
    {
      key: "newIgnitions",
      id: "newIgnitions",
      label: "New ignitions",
      description: "Cells newly ignited during the last tick.",
      valueType: "integer",
      displayUnit: "cells",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "event",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return Number(world.globals.newIgnitions ?? 0);
      }
    },
    {
      key: "spreadRate",
      id: "spreadRate",
      label: "Spread rate",
      description: "New ignitions divided by active burning cells from the previous tick.",
      valueType: "number",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        return Number(world.globals.spreadRate ?? 0);
      }
    },
    {
      key: "extinguished",
      id: "extinguished",
      label: "Extinguished",
      description: "1 when no cells are currently burning, otherwise 0.",
      valueType: "integer",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return countStates(world, "burning") === 0 ? 1 : 0;
      }
    }
  ];
}

export function forestFireParams(params: ParameterValues): ForestFireParams {
  const values: ForestFireParams = {
    gridWidth: Number(params.gridWidth),
    gridHeight: Number(params.gridHeight),
    initialFuelDensity: Number(params.initialFuelDensity),
    initialIgnitionCount: Number(params.initialIgnitionCount),
    spreadProbability: Number(params.spreadProbability),
    lightningProbability: Number(params.lightningProbability),
    regrowthProbability: Number(params.regrowthProbability),
    neighborMode: String(params.neighborMode) as ForestFireNeighborMode,
    boundaryMode: String(params.boundaryMode) as ForestFireBoundaryMode,
    burnDuration: Number(params.burnDuration)
  };
  if (!Number.isInteger(values.gridWidth) || values.gridWidth < 10 || values.gridWidth > 160) {
    throw new SimulationValidationError("Invalid Forest Fire parameters: gridWidth must be an integer from 10 to 160");
  }
  if (!Number.isInteger(values.gridHeight) || values.gridHeight < 10 || values.gridHeight > 120) {
    throw new SimulationValidationError("Invalid Forest Fire parameters: gridHeight must be an integer from 10 to 120");
  }
  if (values.gridWidth * values.gridHeight > maxCells) {
    throw new SimulationValidationError(`Invalid Forest Fire parameters: gridWidth * gridHeight must be ${maxCells} cells or fewer`);
  }
  assertProbability(values.initialFuelDensity, "initialFuelDensity", 1);
  if (!Number.isInteger(values.initialIgnitionCount) || values.initialIgnitionCount < 0 || values.initialIgnitionCount > 100) {
    throw new SimulationValidationError("Invalid Forest Fire parameters: initialIgnitionCount must be an integer from 0 to 100");
  }
  assertProbability(values.spreadProbability, "spreadProbability", 1);
  assertProbability(values.lightningProbability, "lightningProbability", 1);
  assertProbability(values.regrowthProbability, "regrowthProbability", 1);
  if (values.neighborMode !== "vonNeumann" && values.neighborMode !== "moore") {
    throw new SimulationValidationError("Invalid Forest Fire parameters: neighborMode must be vonNeumann or moore");
  }
  if (values.boundaryMode !== "closed" && values.boundaryMode !== "wrap") {
    throw new SimulationValidationError("Invalid Forest Fire parameters: boundaryMode must be closed or wrap");
  }
  if (!Number.isInteger(values.burnDuration) || values.burnDuration < 1 || values.burnDuration > 10) {
    throw new SimulationValidationError("Invalid Forest Fire parameters: burnDuration must be an integer from 1 to 10");
  }
  return values;
}

export function forestFireNeighbors(
  cell: GridCell,
  rows: number,
  cols: number,
  neighborMode: ForestFireNeighborMode,
  boundaryMode: ForestFireBoundaryMode
): GridCell[] {
  const offsets =
    neighborMode === "moore"
      ? [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1]
        ]
      : [
          [-1, 0],
          [0, -1],
          [0, 1],
          [1, 0]
        ];
  const seen = new Set<string>();
  const results: GridCell[] = [];
  for (const [dRow, dCol] of offsets) {
    let row = cell.row + (dRow ?? 0);
    let col = cell.col + (dCol ?? 0);
    if (boundaryMode === "wrap") {
      row = wrapAxis(row, rows);
      col = wrapAxis(col, cols);
    } else if (row < 0 || row >= rows || col < 0 || col >= cols) {
      continue;
    }
    const key = `${row}:${col}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ row, col });
    }
  }
  return results.sort((left, right) => left.row - right.row || left.col - right.col);
}

function validateForestFireWorld(world: WorldView): void {
  const space = requireForestFireGrid(world.grid2D(FOREST_FIRE_SPACE_ID));
  const cells = serializedGridCells(space);
  const seen = new Set<string>();
  const entityIds = world.entitiesWith([ForestFireCellPosition, ForestFireCellState]);
  if (entityIds.length !== space.rows * space.cols) {
    throw new SimulationValidationError("Forest Fire world must contain exactly one cell entity per grid cell");
  }
  for (const [entityId, cell] of Object.entries(cells)) {
    const key = cellKey(cell);
    if (seen.has(key)) {
      throw new SimulationValidationError(`Forest Fire grid cell ${key} has more than one entity`);
    }
    seen.add(key);
    const position = world.getComponent<ForestFireCellPositionComponent>(entityId, ForestFireCellPosition);
    const state = world.getComponent<ForestFireCellStateComponent>(entityId, ForestFireCellState);
    if (!isForestFirePosition(position) || position.x !== cell.col || position.y !== cell.row) {
      throw new SimulationValidationError(`Invalid ForestFireCellPosition component on ${entityId}`);
    }
    if (!isForestFireCellState(state)) {
      throw new SimulationValidationError(`Invalid ForestFireCellState component on ${entityId}`);
    }
  }
}

function forestFireCellRecords(world: WorldView, space: Grid2DSpaceReader): ForestFireCellRecord[] {
  return Object.entries(serializedGridCells(space))
    .map(([entityId, cell]) => {
      const state = world.getComponent<ForestFireCellStateComponent>(entityId, ForestFireCellState);
      if (!state) {
        return undefined;
      }
      return { entityId, cell, state };
    })
    .filter((record): record is ForestFireCellRecord => record !== undefined)
    .sort((left, right) => left.cell.row - right.cell.row || left.cell.col - right.cell.col || left.entityId.localeCompare(right.entityId));
}

function initialIgnitionCells(
  cells: readonly GridCell[],
  stateByKey: ReadonlyMap<string, ForestFireCellStatus>,
  params: ForestFireParams,
  presetId: string,
  initRng: RandomStream
): GridCell[] {
  const fuelCells = cells.filter((cell) => stateByKey.get(cellKey(cell)) === "fuel");
  const ignitionCount = Math.min(params.initialIgnitionCount, fuelCells.length);
  if (ignitionCount <= 0) {
    return [];
  }
  if (presetId === "central-ignition") {
    const centerRow = (params.gridHeight - 1) / 2;
    const centerCol = (params.gridWidth - 1) / 2;
    return [...fuelCells]
      .sort(
        (left, right) =>
          distanceSquared(left, centerRow, centerCol) - distanceSquared(right, centerRow, centerCol) ||
          left.row - right.row ||
          left.col - right.col
      )
      .slice(0, ignitionCount);
  }
  return initRng.shuffle(fuelCells).slice(0, ignitionCount);
}

function fractionMetric(key: string, label: string, description: string, state: ForestFireCellStatus): MetricDefinition {
  return {
    key,
    id: key,
    label,
    description,
    valueType: "number",
    range: { min: 0, max: 1 },
    supportsHistory: true,
    comparableAcrossRuns: true,
    source: "modelState",
    precision: 3,
    displayFormat: "percent",
    collect(world) {
      const total = forestFireStates(world).length;
      return total === 0 ? 0 : countStates(world, state) / total;
    }
  };
}

function countMetric(key: string, label: string, description: string, state: ForestFireCellStatus): MetricDefinition {
  return {
    key,
    id: key,
    label,
    description,
    valueType: "integer",
    displayUnit: "cells",
    range: { min: 0 },
    supportsHistory: true,
    comparableAcrossRuns: true,
    source: "modelState",
    precision: 0,
    displayFormat: "integer",
    collect(world) {
      return countStates(world, state);
    }
  };
}

function countStates(world: WorldView, state: ForestFireCellStatus): number {
  return forestFireStates(world).filter((cellState) => cellState.state === state).length;
}

function forestFireStates(world: WorldView): ForestFireCellStateComponent[] {
  return world
    .entitiesWith([ForestFireCellState])
    .map((entityId) => world.getComponent<ForestFireCellStateComponent>(entityId, ForestFireCellState))
    .filter((state): state is ForestFireCellStateComponent => state !== undefined);
}

function serializedGridCells(space: Grid2DSpaceReader): Record<string, GridCell> {
  const serialized = space.serialize();
  if (serialized.kind !== "grid2d") {
    throw new SimulationValidationError("Expected grid2d serialized space");
  }
  return serialized.cells;
}

function requireForestFireGrid(space: Grid2DSpaceReader | undefined): Grid2DSpaceReader {
  if (!space) {
    throw new SimulationValidationError("Forest Fire grid space is missing");
  }
  return space;
}

function isForestFirePosition(value: unknown): value is ForestFireCellPositionComponent {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger((value as ForestFireCellPositionComponent).x) &&
    Number.isInteger((value as ForestFireCellPositionComponent).y)
  );
}

function isForestFireCellState(value: unknown): value is ForestFireCellStateComponent {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const state = (value as ForestFireCellStateComponent).state;
  const burnAge = (value as ForestFireCellStateComponent).burnAge;
  const lastChangedTick = (value as ForestFireCellStateComponent).lastChangedTick;
  return (
    (state === "empty" || state === "fuel" || state === "burning" || state === "burned") &&
    Number.isInteger(burnAge) &&
    burnAge >= 0 &&
    (state === "burning" || burnAge === 0) &&
    Number.isInteger(lastChangedTick) &&
    lastChangedTick >= 0
  );
}

function assertProbability(value: number, key: string, max: number): void {
  if (!Number.isFinite(value) || value < 0 || value > max) {
    throw new SimulationValidationError(`Invalid Forest Fire parameters: ${key} must be between 0 and ${max}`);
  }
}

function chance(rng: RandomStream, probability: number): boolean {
  if (probability <= 0) {
    return false;
  }
  if (probability >= 1) {
    return true;
  }
  return rng.bool(probability);
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

function forestFireCellEntityId(cell: GridCell): string {
  return `forest-cell-${cell.row}-${cell.col}`;
}

function distanceSquared(cell: GridCell, row: number, col: number): number {
  return (cell.row - row) ** 2 + (cell.col - col) ** 2;
}

function wrapAxis(value: number, size: number): number {
  return ((value % size) + size) % size;
}

function cellKey(cell: GridCell): string {
  return `${cell.row}:${cell.col}`;
}
