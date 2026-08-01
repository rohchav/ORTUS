import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createDefaultScenario,
  createEngineFromScenario,
  deserializeAuthoredScenario,
  initializationPresetsForTemplate,
  runConfigFromScenario,
  serializeAuthoredScenario,
  updateScenarioPreset,
  validateRunConfig,
  validateScenario
} from "../index";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterValues } from "../kernel/types";
import { executeIntervention } from "../interventions/interventionExecutor";
import { getTemplateCapability } from "../registry";
import {
  FOREST_FIRE_SPACE_ID,
  ForestFireCellState,
  forestFireNeighbors,
  forestFireTemplate,
  type ForestFireCellStateComponent
} from "../templates/forestFire.template";
import { productionTemplateMap, productionTemplates } from "../templates/registry";
import { defaultParameters, renderGrid, templateDescriptors } from "../../lib/templateVisuals";

const now = "2026-05-16T12:00:00.000Z";
const repoRoot = process.cwd();

describe("forest fire / landscape spread template", () => {
  it("registers as a production template with valid metadata and tick-0 initialization", () => {
    expect(productionTemplates.map((template) => template.id)).toContain("forest-fire");
    expect(productionTemplateMap["forest-fire"]).toBe(forestFireTemplate);
    expect(templateDescriptors.map((descriptor) => descriptor.id)).toContain("forest-fire");

    const scenario = createDefaultScenario({ template: forestFireTemplate, scenarioId: "scenario-forest-default", now, seed: "forest-default" });
    const validation = validateScenario(scenario, forestFireTemplate);
    const engine = createEngineFromScenario(validation.scenario).engine;
    const snapshot = engine.createSnapshot();

    expect(snapshot.templateId).toBe("forest-fire");
    expect(snapshot.tick).toBe(0);
    expect(snapshot.spaces.find((space) => space.id === FOREST_FIRE_SPACE_ID)).toMatchObject({ kind: "grid2d" });
    expect(snapshot.entities.length).toBeGreaterThan(0);
    expect(forestFireTemplate.getVisuals(snapshot).components.stateComponent).toBe(ForestFireCellState);
    expect(renderGrid(snapshot)?.agents.length).toBe(snapshot.entities.length);
  });

  it("is deterministic for the same seed, seed-sensitive, and avoids hidden Math.random", () => {
    const parameters = params({ initialFuelDensity: 0.52, initialIgnitionCount: 4, spreadProbability: 0.5 });
    const left = new SimulationEngine(forestFireTemplate, { seed: "forest-same", parameters });
    const right = new SimulationEngine(forestFireTemplate, { seed: "forest-same", parameters });
    const different = new SimulationEngine(forestFireTemplate, { seed: "forest-different", parameters });

    expect(left.createSnapshot()).toEqual(right.createSnapshot());
    expect(snapshotCore(left.createSnapshot())).not.toEqual(snapshotCore(different.createSnapshot()));

    left.runSteps(12);
    right.runSteps(12);
    different.runSteps(12);

    expect(left.createSnapshot()).toEqual(right.createSnapshot());
    expect(snapshotCore(left.createSnapshot())).not.toEqual(snapshotCore(different.createSnapshot()));

    const source = readFileSync(join(repoRoot, "src", "simulation", "templates", "forestFire.template.ts"), "utf8");
    expect(source).not.toContain("Math.random");
  });

  it("rejects invalid parameter combinations", () => {
    const invalidCases: ParameterValues[] = [
      { gridWidth: 9 },
      { gridHeight: 9 },
      { gridWidth: 161 },
      { gridHeight: 121 },
      { gridWidth: Number.NaN },
      { spreadProbability: Number.POSITIVE_INFINITY },
      { initialFuelDensity: -0.1 },
      { initialFuelDensity: 1.1 },
      { initialIgnitionCount: -1 },
      { initialIgnitionCount: 101 },
      { spreadProbability: -0.1 },
      { spreadProbability: 1.1 },
      { lightningProbability: -0.1 },
      { lightningProbability: 1.1 },
      { regrowthProbability: -0.1 },
      { regrowthProbability: 1.1 },
      { neighborMode: "hex" },
      { boundaryMode: "bounce" },
      { burnDuration: 0 },
      { burnDuration: 11 }
    ];

    for (const overrides of invalidCases) {
      expect(() => new SimulationEngine(forestFireTemplate, { parameters: params(overrides) })).toThrow();
    }
    expect(() => new SimulationEngine(forestFireTemplate, { parameters: params({ unknownParameter: 1 }) })).toThrow(/Unknown parameter/);
  });

  it("uses two-phase local spread, burnout, lightning, regrowth, and boundary semantics", () => {
    const spread = new SimulationEngine(forestFireTemplate, {
      seed: "forest-spread",
      parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 1, spreadProbability: 1, lightningProbability: 0, regrowthProbability: 0 }),
      initialization: { presetId: "central-ignition", options: {} }
    });
    expect(countStates(spread.createSnapshot()).burning).toBe(1);
    spread.step();
    expect(countStates(spread.createSnapshot())).toMatchObject({ burning: 4, burned: 1 });
    expect(stateAt(spread.createSnapshot(), 4, 4)?.state).toBe("burned");

    const mooreSpread = new SimulationEngine(forestFireTemplate, {
      seed: "forest-moore-spread",
      parameters: params({
        initialFuelDensity: 1,
        initialIgnitionCount: 1,
        spreadProbability: 1,
        lightningProbability: 0,
        regrowthProbability: 0,
        neighborMode: "moore"
      }),
      initialization: { presetId: "central-ignition", options: {} }
    });
    mooreSpread.step();
    expect(countStates(mooreSpread.createSnapshot())).toMatchObject({ burning: 8, burned: 1 });

    const noSpread = new SimulationEngine(forestFireTemplate, {
      seed: "forest-no-spread",
      parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 1, spreadProbability: 0, lightningProbability: 0, regrowthProbability: 0 }),
      initialization: { presetId: "central-ignition", options: {} }
    });
    noSpread.step();
    expect(countStates(noSpread.createSnapshot())).toMatchObject({ burning: 0, burned: 1 });

    const slowBurn = new SimulationEngine(forestFireTemplate, {
      seed: "forest-slow-burn",
      parameters: params({
        initialFuelDensity: 1,
        initialIgnitionCount: 1,
        spreadProbability: 0,
        lightningProbability: 0,
        regrowthProbability: 0,
        burnDuration: 2
      }),
      initialization: { presetId: "central-ignition", options: {} }
    });
    slowBurn.step();
    expect(stateAt(slowBurn.createSnapshot(), 4, 4)).toMatchObject({ state: "burning", burnAge: 1 });
    slowBurn.step();
    expect(stateAt(slowBurn.createSnapshot(), 4, 4)).toMatchObject({ state: "burned", burnAge: 0 });

    const lightning = new SimulationEngine(forestFireTemplate, {
      seed: "forest-lightning",
      parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 0, lightningProbability: 1, spreadProbability: 0, regrowthProbability: 0 })
    });
    lightning.step();
    expect(countStates(lightning.createSnapshot()).burning).toBe(100);

    const regrowth = new SimulationEngine(forestFireTemplate, {
      seed: "forest-regrowth",
      parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 1, spreadProbability: 0, lightningProbability: 0, regrowthProbability: 1 }),
      initialization: { presetId: "central-ignition", options: {} }
    });
    regrowth.step();
    expect(stateAt(regrowth.createSnapshot(), 4, 4)?.state).toBe("burned");
    regrowth.step();
    expect(stateAt(regrowth.createSnapshot(), 4, 4)?.state).toBe("fuel");

    const regrowthWithIgnition = new SimulationEngine(forestFireTemplate, {
      seed: "forest-regrowth-with-ignition",
      parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 1, spreadProbability: 1, lightningProbability: 0, regrowthProbability: 1 }),
      initialization: { presetId: "central-ignition", options: {} }
    });
    regrowthWithIgnition.step();
    expect(stateAt(regrowthWithIgnition.createSnapshot(), 3, 4)?.state).toBe("burning");
    expect(stateAt(regrowthWithIgnition.createSnapshot(), 4, 4)?.state).toBe("burned");

    expect(forestFireNeighbors({ row: 0, col: 0 }, 10, 10, "vonNeumann", "closed")).toEqual([
      { row: 0, col: 1 },
      { row: 1, col: 0 }
    ]);
    expect(forestFireNeighbors({ row: 0, col: 0 }, 10, 10, "vonNeumann", "wrap")).toEqual([
      { row: 0, col: 1 },
      { row: 0, col: 9 },
      { row: 1, col: 0 },
      { row: 9, col: 0 }
    ]);
    expect(forestFireNeighbors({ row: 0, col: 0 }, 10, 10, "moore", "closed")).toHaveLength(3);
    expect(forestFireNeighbors({ row: 0, col: 0 }, 10, 10, "moore", "wrap")).toEqual([
      { row: 0, col: 1 },
      { row: 0, col: 9 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 9 },
      { row: 9, col: 0 },
      { row: 9, col: 1 },
      { row: 9, col: 9 }
    ]);
  });

  it("records finite bounded metrics", () => {
    const engine = new SimulationEngine(forestFireTemplate, {
      seed: "forest-metrics",
      parameters: params({ initialFuelDensity: 0.7, initialIgnitionCount: 3, spreadProbability: 0.6 })
    });
    engine.runSteps(8);
    const latest = engine.createSnapshot().metricsHistory.at(-1)?.values;
    const counts = countStates(engine.createSnapshot());

    expect(latest).toBeDefined();
    for (const key of ["fuelFraction", "burningFraction", "burnedFraction", "emptyFraction"] as const) {
      expect(latest?.[key]).toBeGreaterThanOrEqual(0);
      expect(latest?.[key]).toBeLessThanOrEqual(1);
    }
    expect((latest?.fuelFraction ?? 0) + (latest?.burningFraction ?? 0) + (latest?.burnedFraction ?? 0) + (latest?.emptyFraction ?? 0)).toBeCloseTo(1);
    expect(latest?.activeFireCount).toBe(counts.burning);
    expect(latest?.burnedTotalCount).toBe(counts.burned);
    expect(latest?.extinguished).toBe(counts.burning === 0 ? 1 : 0);
    expect(latest?.newIgnitions).toBeGreaterThanOrEqual(0);
    expect(latest?.spreadRate).toBeGreaterThanOrEqual(0);
    for (const value of Object.values(latest ?? {})) {
      expect(Number.isFinite(value)).toBe(true);
    }

    const noFire = new SimulationEngine(forestFireTemplate, {
      seed: "forest-no-fire-metrics",
      parameters: params({ initialFuelDensity: 0, initialIgnitionCount: 0, lightningProbability: 0, spreadProbability: 0, regrowthProbability: 0 })
    });
    noFire.step();
    const noFireMetrics = noFire.createSnapshot().metricsHistory.at(-1)?.values;
    expect(noFireMetrics?.emptyFraction).toBe(1);
    expect(noFireMetrics?.activeFireCount).toBe(0);
    expect(noFireMetrics?.extinguished).toBe(1);
    for (const value of Object.values(noFireMetrics ?? {})) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("publishes compact hot-loop counts and performance counters without changing cell semantics", () => {
    const engine = new SimulationEngine(forestFireTemplate, {
      seed: "forest-hot-loop-counters",
      parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 1, spreadProbability: 1, lightningProbability: 0, regrowthProbability: 0 }),
      initialization: { presetId: "central-ignition", options: {} },
      performance: { enabled: true, maxSamples: 4 }
    });

    engine.step();
    const snapshot = engine.createSnapshot();
    const counts = countStates(snapshot);
    const globals = snapshot.globals as Record<string, unknown>;
    const perfCounters = engine.performanceData().tickSamples.at(-1)?.counters ?? {};

    expect(globals.forestFireStateCounts).toEqual(counts);
    expect(globals.forestFireStateCountsTick).toBe(snapshot.tick);
    expect(globals.forestFireChangedCellCount).toBe(5);
    expect(globals.forestFireComponentUpdateCount).toBe(5);
    expect(globals.forestFireNeighborCheckCount).toBe(4);
    expect(globals.forestFireSpreadCandidateCount).toBe(4);
    expect(globals.forestFireLightningCheckCount).toBe(95);
    expect(globals.forestFireRegrowthCheckCount).toBe(0);
    expect(perfCounters.forestFireChangedCells).toBe(5);
    expect(perfCounters.forestFireComponentUpdates).toBe(5);
    expect(perfCounters.forestFireNeighborChecks).toBe(4);
    for (const value of Object.values(perfCounters)) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("provides deterministic, distinct initialization presets", () => {
    const base = createDefaultScenario({ template: forestFireTemplate, scenarioId: "scenario-forest-presets", now, seed: "forest-preset-seed" });
    const signatures = new Map<string, string>();

    for (const preset of initializationPresetsForTemplate(forestFireTemplate)) {
      const scenario = updateScenarioPreset(base, preset.id, now);
      const first = createEngineFromScenario(scenario).engine.createSnapshot();
      const second = createEngineFromScenario(scenario).engine.createSnapshot();
      expect(first).toEqual(second);
      signatures.set(preset.id, snapshotCore(first));
    }

    expect(new Set(signatures.values()).size).toBe(initializationPresetsForTemplate(forestFireTemplate).length);

    const central = createEngineFromScenario(updateScenarioPreset(base, "central-ignition", now)).engine.createSnapshot();
    const burningCells = burningCellCoordinates(central);
    expect(burningCells.length).toBeGreaterThanOrEqual(1);
    expect(burningCells.some((cell) => Math.abs(cell.row - 19) <= 1 && Math.abs(cell.col - 29) <= 1)).toBe(true);

    const corridorScenario = updateScenarioPreset(base, "firebreak-corridor", now);
    const corridor = createEngineFromScenario(corridorScenario).engine.createSnapshot();
    const corridorRepeat = createEngineFromScenario(corridorScenario).engine.createSnapshot();
    expect(corridor).toEqual(corridorRepeat);
    expect(countStates(corridor).empty).toBe(40);
    for (let row = 0; row < 40; row += 1) {
      expect(stateAt(corridor, row, 40)?.state).toBe("empty");
    }
    expect(burningCellCoordinates(corridor).some((cell) => Math.abs(cell.row - 19) <= 1 && Math.abs(cell.col - 29) <= 1)).toBe(true);
    expect(corridorScenario.parameters).toEqual(updateScenarioPreset(base, "central-ignition", now).parameters);

    const dense = countStates(createEngineFromScenario(updateScenarioPreset(base, "dense-dry-landscape", now)).engine.createSnapshot());
    const sparse = countStates(createEngineFromScenario(updateScenarioPreset(base, "sparse-fragmented-landscape", now)).engine.createSnapshot());
    expect(dense.fuel + dense.burning).toBeGreaterThan(sparse.fuel + sparse.burning);

    const regrowing = updateScenarioPreset(base, "regrowing-landscape", now);
    expect(Number(regrowing.parameters.regrowthProbability)).toBeGreaterThan(Number(base.parameters.regrowthProbability));

    expect(
      countStates(
        new SimulationEngine(forestFireTemplate, {
          seed: "forest-all-ignitions",
          parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 100, lightningProbability: 0, spreadProbability: 0 })
        }).createSnapshot()
      ).burning
    ).toBe(100);
    expect(
      countStates(
        new SimulationEngine(forestFireTemplate, {
          seed: "forest-no-fuel-ignitions",
          parameters: params({ initialFuelDensity: 0, initialIgnitionCount: 100, lightningProbability: 0, spreadProbability: 0 })
        }).createSnapshot()
      ).burning
    ).toBe(0);

    expect(
      () => new SimulationEngine(forestFireTemplate, { parameters: params(), initialization: { presetId: "unknown-preset", options: {} } })
    ).toThrow(/Unknown Forest Fire initialization preset/);
    expect(
      () => new SimulationEngine(forestFireTemplate, { parameters: params(), initialization: { presetId: "random-forest", options: { custom: true } } })
    ).toThrow(/do not accept custom options/);
  });

  it("round-trips scenarios and RunConfig recipes without carrying stale run state", () => {
    const scenario = updateScenarioPreset(
      createDefaultScenario({ template: forestFireTemplate, scenarioId: "scenario-forest-roundtrip", now, seed: "forest-scenario-seed" }),
      "central-ignition",
      now
    );
    const imported = deserializeAuthoredScenario(serializeAuthoredScenario(scenario));
    const runConfig = validateRunConfig(runConfigFromScenario(imported), forestFireTemplate);
    const previous = new SimulationEngine(forestFireTemplate, { seed: "forest-previous", parameters: params() });
    previous.runSteps(3);
    const before = previous.exportSnapshot();
    const engine = createEngineFromScenario(imported).engine;

    expect(runConfig.templateId).toBe("forest-fire");
    expect(runConfig.initializationPreset).toBe("central-ignition");
    expect(engine.createSnapshot().tick).toBe(0);
    expect(JSON.stringify(imported)).not.toContain('"world"');
    expect(JSON.stringify(imported)).not.toContain('"metricsHistory"');
    expect(previous.exportSnapshot()).toBe(before);
    expect(() => validateRunConfig({ ...runConfig, behaviorMode: "unsupported-mode" }, forestFireTemplate)).toThrow(/Unsupported behavior mode/);
  });

  it("keeps structural primitive capabilities honest", () => {
    expect(forestFireTemplate.capabilities).toMatchObject({
      supportsGridSpace: true,
      supportsEnvironmentLayers: false,
      supportsNetworkSpace: false,
      supportsResources: false,
      supportsEvents: false,
      supportsInterventions: true
    });
    for (const primitiveId of [
      "spatialFields",
      "boundariesEnvironment",
      "multiScale",
      "scaleAwareViews",
      "observability",
      "causalAssumptions",
      "visualModelBuilder",
      "networks",
      "resources",
      "feedbackEvents",
      "validationCalibration",
      "interventionStrategy",
      "externalFrameworkInterop"
    ] as const) {
      expect(getTemplateCapability("forest-fire", primitiveId)).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
  });

  it("supports a minimal template-owned cell ignition intervention", () => {
    const engine = new SimulationEngine(forestFireTemplate, {
      seed: "forest-intervention",
      parameters: params({ initialFuelDensity: 1, initialIgnitionCount: 0, spreadProbability: 0, lightningProbability: 0 })
    });
    expect(stateAt(engine.createSnapshot(), 4, 4)?.state).toBe("fuel");
    const before = countStates(engine.createSnapshot());

    const result = executeIntervention(engine, {
      templateId: "forest-fire",
      interventionId: "forestFire.igniteCell",
      target: { gridCell: { row: 4, col: 4 } }
    });

    expect(result.appliedCommandCount).toBe(1);
    expect(stateAt(engine.createSnapshot(), 4, 4)).toMatchObject({ state: "burning", burnAge: 0 });
    expect(stateAt(engine.createSnapshot(), 4, 5)?.state).toBe("fuel");
    expect(countStates(engine.createSnapshot())).toMatchObject({ ...before, fuel: before.fuel - 1, burning: before.burning + 1 });
    expect(() =>
      executeIntervention(engine, {
        templateId: "forest-fire",
        interventionId: "forestFire.igniteCell",
        target: { gridCell: { row: 4, col: 4 } }
      })
    ).toThrow(/only fuel cells/);
    expect(() =>
      executeIntervention(engine, {
        templateId: "forest-fire",
        interventionId: "forestFire.igniteCell",
        target: {}
      })
    ).toThrow(/grid cell/);
    expect(() =>
      executeIntervention(engine, {
        templateId: "forest-fire",
        interventionId: "forestFire.igniteCell",
        target: { gridCell: { row: -1, col: 0 } }
      })
    ).toThrow(/outside/);
  });

  it("documents assumptions and limits without wildfire, GIS, or calibration claims", () => {
    const profileText = JSON.stringify(forestFireTemplate.assumptionProfile).toLowerCase();
    expect(profileText).toContain("not a wildfire predictor");
    expect(profileText).toContain("wind");
    expect(profileText).toContain("humidity");
    expect(profileText).toContain("terrain");
    expect(profileText).toContain("gis");
    expect(profileText).toContain("suppression");
    expect(profileText).toContain("firefighting");
    expect(profileText).toContain("probabilities are model parameters, not calibrated real-world probabilities");
    expect(profileText).toContain("grid boundaries are implementation geometry, not a full boundaryenvironmentmodel");
    expect(profileText).toContain("grid cell positions are not explicit spatialfieldmodel runtime support");
    expect(profileText).toContain("operational fire safety");
    expect(profileText).not.toContain("calibrated probability field");
    expect(profileText).not.toContain("causal proof");

    const docsText = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ]
      .join("\n")
      .toLowerCase();
    expect(docsText).toContain("not a wildfire predictor");
    expect(docsText).toContain("suppression");
    expect(docsText).toContain("firefighting");
    expect(docsText).toContain("not spatialfieldmodel runtime support");
    expect(docsText).toContain("not boundaryenvironmentmodel runtime support");
  });

  it("keeps the template simulation path headless and bounded to local grid logic", () => {
    const source = readFileSync(join(repoRoot, "src", "simulation", "templates", "forestFire.template.ts"), "utf8");
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
    expect(source).not.toContain("WorldStage");
    expect(source).not.toMatch(
      /from ["'][^"']*(spatialFields|boundaries|multiscale|scaleView|composition|hybridComposition|gis|diffusion|advection|physics|solver|compiler|visualBuilder)[^"']*["']/
    );
  });
});

function params(overrides: ParameterValues = {}): ParameterValues {
  return {
    ...defaultParameters(forestFireTemplate),
    gridWidth: 10,
    gridHeight: 10,
    initialFuelDensity: 0.6,
    initialIgnitionCount: 2,
    spreadProbability: 0.45,
    lightningProbability: 0,
    regrowthProbability: 0,
    neighborMode: "vonNeumann",
    boundaryMode: "closed",
    burnDuration: 1,
    ...overrides
  };
}

function snapshotCore(snapshot: ReturnType<SimulationEngine["createSnapshot"]>): string {
  return JSON.stringify({
    entities: snapshot.entities,
    components: snapshot.components,
    spaces: snapshot.spaces,
    globals: snapshot.globals
  });
}

function stateAt(snapshot: ReturnType<SimulationEngine["createSnapshot"]>, row: number, col: number): ForestFireCellStateComponent | undefined {
  return snapshot.components[ForestFireCellState]?.[`forest-cell-${row}-${col}`] as ForestFireCellStateComponent | undefined;
}

function countStates(snapshot: ReturnType<SimulationEngine["createSnapshot"]>): Record<"empty" | "fuel" | "burning" | "burned", number> {
  const counts = { empty: 0, fuel: 0, burning: 0, burned: 0 };
  for (const value of Object.values(snapshot.components[ForestFireCellState] ?? {}) as ForestFireCellStateComponent[]) {
    counts[value.state] += 1;
  }
  return counts;
}

function burningCellCoordinates(snapshot: ReturnType<SimulationEngine["createSnapshot"]>): Array<{ row: number; col: number }> {
  const grid = snapshot.spaces.find((space) => space.kind === "grid2d");
  if (grid?.kind !== "grid2d") {
    return [];
  }
  const result: Array<{ row: number; col: number }> = [];
  for (const [entityId, value] of Object.entries(snapshot.components[ForestFireCellState] ?? {}) as Array<
    [string, ForestFireCellStateComponent]
  >) {
    if (value.state === "burning") {
      const cell = grid.cells[entityId];
      if (cell) {
        result.push(cell);
      }
    }
  }
  return result;
}
