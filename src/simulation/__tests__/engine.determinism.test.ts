import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { MetricDefinition, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { epidemicTemplate } from "../templates/epidemic.template";

describe("engine determinism", () => {
  it("runs headlessly for 100 ticks without UI", () => {
    const engine = new SimulationEngine(epidemicTemplate, { seed: "headless" });
    engine.runSteps(100);
    expect(engine.createSnapshot().tick).toBe(100);
  });

  it("same seed, template, and parameters produce identical snapshots", () => {
    const options = { seed: "same-seed", parameters: epidemicParams() };
    const left = new SimulationEngine(epidemicTemplate, options);
    const right = new SimulationEngine(epidemicTemplate, options);

    left.runSteps(100);
    right.runSteps(100);

    expect(left.createSnapshot()).toEqual(right.createSnapshot());
  });

  it("different seeds can produce different stochastic outcomes", () => {
    const left = new SimulationEngine(epidemicTemplate, { seed: "seed-a", parameters: epidemicParams() });
    const right = new SimulationEngine(epidemicTemplate, { seed: "seed-b", parameters: epidemicParams() });

    left.runSteps(100);
    right.runSteps(100);

    expect(left.createSnapshot()).not.toEqual(right.createSnapshot());
  });

  it("snapshot continuation restores RNG state and final state", () => {
    const original = new SimulationEngine(epidemicTemplate, { seed: "continuation", parameters: epidemicParams() });
    original.runSteps(50);
    const snapshotAt50 = original.exportSnapshot();
    original.runSteps(50);

    const restored = SimulationEngine.fromSnapshot(epidemicTemplate, snapshotAt50);
    restored.runSteps(50);

    expect(restored.createSnapshot()).toEqual(original.createSnapshot());
  });

  it("does not contain forbidden platform randomness calls in simulation source", () => {
    const files = simulationFiles(join(process.cwd(), "src", "simulation")).filter((file) => !file.endsWith(".test.ts"));
    const offenders = files.filter((file) => readFileSync(file, "utf8").includes("Math.random"));
    expect(offenders).toEqual([]);
  });

  it("bounds metrics history length", () => {
    const engine = new SimulationEngine(metricsOnlyTemplate(), { maxMetricsHistory: 1000 });
    engine.runSteps(2000);
    expect(engine.createSnapshot().metricsHistory.length).toBeLessThanOrEqual(1000);
    const latest = engine.createSnapshot().metricsHistory.at(-1);
    expect(latest?.tick).toBe(2000);
    expect(Number.isFinite(latest?.values.tickValue)).toBe(true);
  });
});

function epidemicParams() {
  return {
    agentCount: 40,
    initialInfected: 3,
    infectionRadius: 10,
    infectionProbability: 0.3,
    recoveryTicks: 25,
    movementSpeed: 0.8
  };
}

function metricsOnlyTemplate(): SimulationTemplate {
  const metric: MetricDefinition = {
    key: "tickValue",
    label: "Tick value",
    description: "Current tick.",
    valueType: "number",
    collect: (world) => world.tick
  };
  return {
    id: "metrics-only",
    name: "Metrics Only",
    description: "Metrics history test.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Test metrics bounds.",
      entities: [],
      stateVariables: [],
      processOverview: "Collects tick metric.",
      scheduling: "No systems.",
      designConcepts: { observation: "Records tick." },
      initialization: "Empty world.",
      submodels: [],
      assumptions: [],
      limitations: []
    },
    createInitialWorld: () => new World(),
    registerSystems: () => undefined,
    registerMetrics: (registry) => registry.register(metric),
    getVisuals: () => ({ components: {} })
  };
}

function simulationFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return simulationFiles(path);
    }
    return path.endsWith(".ts") ? [path] : [];
  });
}
