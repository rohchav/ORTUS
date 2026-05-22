import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ModelDocumentation, ParameterDefinition, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { Grid2DSpace } from "../spaces/Grid2DSpace";
import { templateDescriptors } from "../../lib/templateVisuals";
import {
  GroupIdentity,
  PositionGrid,
  SatisfactionState,
  SCHELLING_SPACE_ID,
  createSchellingMovementSystem,
  createSchellingSatisfactionSystem,
  schellingMetrics,
  schellingTemplate,
  type GroupIdentityComponent,
  type SatisfactionStateComponent
} from "../templates/schelling.template";

describe("schelling segregation template", () => {
  it("is registered for UI selection and can create an engine", () => {
    expect(templateDescriptors.map((descriptor) => descriptor.id)).toContain("schelling-segregation");

    const engine = new SimulationEngine(schellingTemplate, { seed: "schelling-register", parameters: params() });

    expect(engine.template.id).toBe("schelling-segregation");
    expect(engine.createSnapshot().spaces.find((space) => space.kind === "grid2d")).toMatchObject({ rows: 10, cols: 10 });
  });

  it("initializes dimensions, density, group counts, and empty cells", () => {
    const engine = new SimulationEngine(schellingTemplate, {
      seed: "schelling-init",
      parameters: params({ density: 0.73, groupRatio: 0.6 })
    });
    const snapshot = engine.createSnapshot();
    const grid = snapshot.spaces.find((space) => space.kind === "grid2d");
    const occupied = snapshot.entities.filter((entity) => entity.alive).length;
    const groupA = groupCount(snapshot, "A");
    const groupB = groupCount(snapshot, "B");

    expect(grid).toMatchObject({ rows: 10, cols: 10 });
    expect(occupied).toBe(73);
    expect(groupA).toBe(44);
    expect(groupB).toBe(29);
    expect(100 - occupied).toBeGreaterThanOrEqual(1);
  });

  it("rejects invalid parameter combinations", () => {
    const invalidCases: Array<Record<string, number>> = [
      { rows: 80, cols: 100 },
      { density: 1 },
      { density: 0 },
      { groupRatio: 1.2 },
      { similarityThreshold: -0.1 },
      { neighborhoodRadius: 0 },
      { moveFractionPerTick: 0 }
    ];

    for (const overrides of invalidCases) {
      expect(() => new SimulationEngine(schellingTemplate, { parameters: params(overrides) })).toThrow();
    }
  });

  it("is deterministic for the same seed and changes for different seeds", () => {
    const parameters = params({ density: 0.72, similarityThreshold: 0.4 });
    const left = new SimulationEngine(schellingTemplate, { seed: "schelling-same", parameters });
    const right = new SimulationEngine(schellingTemplate, { seed: "schelling-same", parameters });
    const different = new SimulationEngine(schellingTemplate, { seed: "schelling-different", parameters });

    left.runSteps(100);
    right.runSteps(100);
    different.runSteps(100);

    expect(left.createSnapshot()).toEqual(right.createSnapshot());
    expect(different.createSnapshot()).not.toEqual(left.createSnapshot());
  });

  it("evaluates known neighbor satisfaction counts", () => {
    const engine = new SimulationEngine(
      manualTemplate(
        [
          { id: "center-a", group: "A", row: 5, col: 5 },
          { id: "near-a", group: "A", row: 5, col: 6 },
          { id: "near-b-1", group: "B", row: 6, col: 5 },
          { id: "near-b-2", group: "B", row: 6, col: 6 }
        ],
        { systems: "satisfaction" }
      ),
      { parameters: params({ similarityThreshold: 0.5 }) }
    );

    engine.step();

    const state = engine.world.view().getComponent<SatisfactionStateComponent>("center-a", SatisfactionState);
    expect(state).toMatchObject({
      satisfied: false,
      similarNeighbors: 1,
      differentNeighbors: 2,
      totalOccupiedNeighbors: 3
    });
    expect(state?.similarNeighborRatio).toBeCloseTo(1 / 3);
  });

  it("treats zero occupied neighbors as satisfied", () => {
    const engine = new SimulationEngine(
      manualTemplate([{ id: "isolated", group: "A", row: 5, col: 5 }], { systems: "satisfaction" }),
      { parameters: params({ similarityThreshold: 1 }) }
    );

    engine.step();

    expect(engine.world.view().getComponent<SatisfactionStateComponent>("isolated", SatisfactionState)).toMatchObject({
      satisfied: true,
      similarNeighborRatio: 1,
      similarNeighbors: 0,
      differentNeighbors: 0,
      totalOccupiedNeighbors: 0
    });
  });

  it("produces the same satisfaction evaluation regardless of insertion order", () => {
    const placements = [
      { id: "center-a", group: "A" as const, row: 5, col: 5 },
      { id: "near-a", group: "A" as const, row: 5, col: 6 },
      { id: "near-b-1", group: "B" as const, row: 6, col: 5 },
      { id: "near-b-2", group: "B" as const, row: 6, col: 6 }
    ];
    const first = new SimulationEngine(manualTemplate(placements, { systems: "satisfaction" }), {
      seed: "schelling-order",
      parameters: params({ similarityThreshold: 0.5 })
    });
    const reversed = new SimulationEngine(manualTemplate([...placements].reverse(), { systems: "satisfaction" }), {
      seed: "schelling-order",
      parameters: params({ similarityThreshold: 0.5 })
    });

    first.step();
    reversed.step();

    expect(satisfactionMap(first)).toEqual(satisfactionMap(reversed));
  });

  it("moves dissatisfied agents without changing occupied count or duplicating cells", () => {
    const engine = new SimulationEngine(schellingTemplate, {
      seed: "schelling-move",
      parameters: params({ density: 0.8, similarityThreshold: 1, moveFractionPerTick: 1 })
    });
    const before = engine.createSnapshot();

    engine.step();

    const after = engine.createSnapshot();
    const movedEntities = changedGridPositions(before, after);
    const movedThisTick = after.metricsHistory.at(-1)?.values.movedThisTick ?? 0;
    expect(after.entities.filter((entity) => entity.alive).length).toBe(before.entities.filter((entity) => entity.alive).length);
    expect(uniqueCellCount(after)).toBe(after.entities.filter((entity) => entity.alive).length);
    expect(movedThisTick).toBeGreaterThan(0);
    expect(movedEntities).toBe(movedThisTick);
    const grid = after.spaces.find((space) => space.kind === "grid2d");
    expect(grid?.kind).toBe("grid2d");
    if (grid?.kind === "grid2d") {
      for (const cell of Object.values(grid.cells)) {
        expect(cell.row).toBeGreaterThanOrEqual(0);
        expect(cell.row).toBeLessThan(grid.rows);
        expect(cell.col).toBeGreaterThanOrEqual(0);
        expect(cell.col).toBeLessThan(grid.cols);
      }
    }
  });

  it("limits movement by moveFractionPerTick", () => {
    const moveFractionPerTick = 0.1;
    const engine = new SimulationEngine(schellingTemplate, {
      seed: "schelling-move-limit",
      parameters: params({ density: 0.8, similarityThreshold: 1, moveFractionPerTick })
    });

    engine.step();

    const latest = engine.createSnapshot().metricsHistory.at(-1)?.values;
    const moved = latest?.movedThisTick ?? 0;
    const dissatisfied = latest?.dissatisfiedCount ?? 0;
    expect(moved).toBeLessThanOrEqual(Math.ceil(dissatisfied * moveFractionPerTick));
  });

  it("keeps satisfaction evaluation staged from the start-of-tick grid", () => {
    const placements = filledGridExcept({ rows: 10, cols: 10, empty: { row: 9, col: 9 } }, ({ row, col }) => {
      if (row === 0 && col === 0) {
        return { id: "mover", group: "A" as const, row, col };
      }
      if ((row === 0 && col === 1) || (row === 1 && col === 0) || (row === 1 && col === 1)) {
        return { id: `b-${row}-${col}`, group: "B" as const, row, col };
      }
      return { id: `a-${row}-${col}`, group: "A" as const, row, col };
    });
    const engine = new SimulationEngine(manualTemplate(placements, { systems: "all" }), {
      seed: "schelling-staged",
      parameters: params({ similarityThreshold: 0.01, moveFractionPerTick: 1 })
    });

    engine.step();

    expect(engine.world.view().getComponent("mover", PositionGrid)).toEqual({ row: 9, col: 9 });
    expect(engine.world.view().getComponent<SatisfactionStateComponent>("mover", SatisfactionState)?.satisfied).toBe(false);

    engine.step();
    expect(engine.world.view().getComponent<SatisfactionStateComponent>("mover", SatisfactionState)?.satisfied).toBe(true);
  });

  it("records finite bounded metrics", () => {
    const engine = new SimulationEngine(schellingTemplate, {
      seed: "schelling-metrics",
      parameters: params({ density: 0.75, groupRatio: 0.55 })
    });

    engine.runSteps(25);

    const latest = engine.createSnapshot().metricsHistory.at(-1)?.values;
    expect(latest).toBeDefined();
    expect(latest?.satisfactionRate).toBeGreaterThanOrEqual(0);
    expect(latest?.satisfactionRate).toBeLessThanOrEqual(1);
    expect(latest?.averageSimilarity).toBeGreaterThanOrEqual(0);
    expect(latest?.averageSimilarity).toBeLessThanOrEqual(1);
    expect(latest?.movedThisTick).toBeGreaterThanOrEqual(0);
    expect((latest?.groupACount ?? 0) + (latest?.groupBCount ?? 0) + (latest?.emptyCellCount ?? 0)).toBe(100);
    for (const value of Object.values(latest ?? {})) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("exports scenarios and restores snapshots for deterministic continuation", () => {
    const engine = new SimulationEngine(schellingTemplate, { seed: "schelling-serialize", parameters: params({ density: 0.7 }) });
    engine.runSteps(50);
    const scenario = engine.exportScenario();
    const snapshot = engine.exportSnapshot();
    engine.runSteps(50);

    const restarted = SimulationEngine.fromScenario(schellingTemplate, scenario);
    const restored = SimulationEngine.fromSnapshot(schellingTemplate, snapshot);
    restored.runSteps(50);

    expect(restarted.createSnapshot().tick).toBe(0);
    expect(restored.createSnapshot()).toEqual(engine.createSnapshot());
  });

  it("rejects invalid nested Schelling snapshot state", () => {
    const engine = new SimulationEngine(schellingTemplate, { seed: "schelling-invalid-nested", parameters: params() });
    const parsed = JSON.parse(engine.exportSnapshot()) as {
      world: {
        components: Record<string, Record<string, Record<string, unknown>>>;
        spaces: Array<{ kind: string; cells?: Record<string, { row: number; col: number }> }>;
      };
    };
    const firstId = Object.keys(parsed.world.components[GroupIdentity] ?? {})[0] as string;
    const secondId = Object.keys(parsed.world.components[GroupIdentity] ?? {})[1] as string;
    const grid = parsed.world.spaces.find((space) => space.kind === "grid2d");
    expect(firstId).toBeDefined();
    expect(secondId).toBeDefined();
    expect(grid?.cells).toBeDefined();

    const invalidGroup = JSON.parse(JSON.stringify(parsed));
    invalidGroup.world.components[GroupIdentity][firstId] = { group: "C" };
    expect(() => SimulationEngine.fromSnapshot(schellingTemplate, invalidGroup)).toThrow();

    const duplicateCell = JSON.parse(JSON.stringify(parsed));
    if (grid?.cells?.[firstId] && duplicateCell.world.spaces[0]?.cells) {
      duplicateCell.world.spaces[0].cells[secondId] = { ...grid.cells[firstId] };
    }
    expect(() => SimulationEngine.fromSnapshot(schellingTemplate, duplicateCell)).toThrow();

    const outOfBounds = JSON.parse(JSON.stringify(parsed));
    outOfBounds.world.components[PositionGrid][firstId] = { row: 999, col: 0 };
    expect(() => SimulationEngine.fromSnapshot(schellingTemplate, outOfBounds)).toThrow();
  });
});

function params(overrides: Record<string, number> = {}) {
  return {
    rows: 10,
    cols: 10,
    density: 0.7,
    groupRatio: 0.5,
    similarityThreshold: 0.35,
    neighborhoodRadius: 1,
    moveFractionPerTick: 0.2,
    ...overrides
  };
}

function groupCount(snapshot: ReturnType<SimulationEngine["createSnapshot"]>, group: GroupIdentityComponent["group"]): number {
  return Object.values(snapshot.components[GroupIdentity] ?? {}).filter((value) => value.group === group).length;
}

function uniqueCellCount(snapshot: ReturnType<SimulationEngine["createSnapshot"]>): number {
  const grid = snapshot.spaces.find((space) => space.kind === "grid2d");
  if (grid?.kind !== "grid2d") {
    return 0;
  }
  return new Set(Object.values(grid.cells).map((cell) => `${cell.row}:${cell.col}`)).size;
}

function changedGridPositions(left: ReturnType<SimulationEngine["createSnapshot"]>, right: ReturnType<SimulationEngine["createSnapshot"]>): number {
  const leftGrid = left.spaces.find((space) => space.kind === "grid2d");
  const rightGrid = right.spaces.find((space) => space.kind === "grid2d");
  if (leftGrid?.kind !== "grid2d" || rightGrid?.kind !== "grid2d") {
    return 0;
  }
  return Object.entries(leftGrid.cells).filter(([entityId, cell]) => {
    const next = rightGrid.cells[entityId];
    return next && (next.row !== cell.row || next.col !== cell.col);
  }).length;
}

function satisfactionMap(engine: SimulationEngine): Record<string, SatisfactionStateComponent | undefined> {
  const snapshot = engine.createSnapshot();
  const result: Record<string, SatisfactionStateComponent | undefined> = {};
  for (const entity of snapshot.entities) {
    result[entity.id] = snapshot.components[SatisfactionState]?.[entity.id] as SatisfactionStateComponent | undefined;
  }
  return result;
}

function manualTemplate(
  placements: Array<{ id: string; group: GroupIdentityComponent["group"]; row: number; col: number }>,
  options: { systems: "satisfaction" | "all" }
): SimulationTemplate {
  return {
    id: `manual-schelling-${options.systems}`,
    name: "Manual Schelling",
    description: "Schelling test fixture.",
    version: "1.0.0",
    parameterDefinitions: schellingParameterDefinitions(),
    documentation: docs(),
    createInitialWorld() {
      const world = new World({ globals: { movedThisTick: 0 } });
      const space = new Grid2DSpace({ id: SCHELLING_SPACE_ID, rows: 10, cols: 10, boundaryMode: "clamp" });
      world.addSpace(space);
      for (const placement of placements) {
        world.entityStore.create(`group-${placement.group.toLowerCase()}`, { id: placement.id, createdAtTick: 0, label: placement.id });
        const cell = { row: placement.row, col: placement.col };
        world.componentStore.add(placement.id, PositionGrid, cell);
        world.componentStore.add(placement.id, GroupIdentity, { group: placement.group });
        world.componentStore.add(placement.id, SatisfactionState, {
          satisfied: true,
          similarNeighborRatio: 1,
          similarNeighbors: 0,
          differentNeighbors: 0,
          totalOccupiedNeighbors: 0
        });
        space.addEntity(placement.id, cell);
      }
      return world;
    },
    registerSystems(registry) {
      registry.register(createSchellingSatisfactionSystem());
      if (options.systems === "all") {
        registry.register(createSchellingMovementSystem());
      }
    },
    registerMetrics(registry) {
      for (const metric of schellingMetrics()) {
        registry.register(metric);
      }
    },
    getVisuals: () => ({ components: {} })
  };
}

function filledGridExcept(
  grid: { rows: number; cols: number; empty: { row: number; col: number } },
  create: (cell: { row: number; col: number }) => { id: string; group: GroupIdentityComponent["group"]; row: number; col: number }
): Array<{ id: string; group: GroupIdentityComponent["group"]; row: number; col: number }> {
  const placements: Array<{ id: string; group: GroupIdentityComponent["group"]; row: number; col: number }> = [];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      if (row === grid.empty.row && col === grid.empty.col) {
        continue;
      }
      placements.push(create({ row, col }));
    }
  }
  return placements;
}

function schellingParameterDefinitions(): ParameterDefinition[] {
  return schellingTemplate.parameterDefinitions.map((definition) => ({ ...definition }));
}

function docs(): ModelDocumentation {
  return {
    purpose: "Test Schelling behavior.",
    entities: ["Group A", "Group B"],
    stateVariables: ["PositionGrid", "GroupIdentity", "SatisfactionState"],
    processOverview: "Evaluate and optionally move.",
    scheduling: "Satisfaction before movement.",
    designConcepts: { emergence: "Test fixture." },
    initialization: "Manual grid.",
    submodels: ["Satisfaction", "Movement"],
    assumptions: [],
    limitations: []
  };
}
