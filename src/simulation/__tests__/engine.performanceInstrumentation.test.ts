import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { flockingTemplate } from "../templates/flocking.template";

describe("engine performance instrumentation", () => {
  it("is disabled by default and produces no timing samples", () => {
    const engine = new SimulationEngine(flockingTemplate, {
      seed: "performance-disabled",
      parameters: { agentCount: 40 }
    });

    engine.runSteps(3);
    engine.createSnapshot();

    expect(engine.performanceData()).toMatchObject({
      enabled: false,
      tickSamples: [],
      snapshotSamples: [],
      frameSamples: []
    });
  });

  it("keeps timing samples bounded and records flocking operation counters", () => {
    const engine = new SimulationEngine(flockingTemplate, {
      seed: "performance-enabled",
      parameters: {
        agentCount: 360,
        perceptionRadius: 10,
        separationRadius: 5,
        noise: 0
      },
      performance: { enabled: true, maxSamples: 3 }
    });

    for (let index = 0; index < 8; index += 1) {
      engine.step();
      engine.createSnapshot();
      engine.recordFramePerformance({ steps: 1, updateMs: 1 + index, frameIntervalMs: 16 });
    }

    const data = engine.performanceData();
    const latestTick = data.tickSamples.at(-1);

    expect(data.tickSamples).toHaveLength(3);
    expect(data.snapshotSamples).toHaveLength(3);
    expect(data.frameSamples).toHaveLength(3);
    expect(latestTick?.entityCount).toBe(360);
    expect(latestTick?.stepMs).toBeGreaterThanOrEqual(0);
    expect(latestTick?.metricsMs).toBeGreaterThanOrEqual(0);
    expect(latestTick?.counters.flockingTheoreticalAllPairs).toBe((360 * 359) / 2);
    expect(latestTick?.counters.flockingPairwiseChecks).toBeGreaterThan(0);
    expect(latestTick?.counters.flockingPairwiseChecks).toBeLessThan((360 * 359) / 2);
    expect(latestTick?.counters.flockingNeighborPairs).toBeGreaterThanOrEqual(0);
    expect(latestTick?.counters.flockingSpatialHashActive).toBe(1);
  });

  it("uses the spatial hash for default-count flocking while keeping a small-flock fallback", () => {
    const defaultCount = 160;
    const defaultRun = new SimulationEngine(flockingTemplate, {
      seed: "performance-default-flocking",
      parameters: { agentCount: defaultCount, noise: 0 },
      performance: { enabled: true, maxSamples: 5 }
    });
    defaultRun.step();

    const defaultCounters = defaultRun.performanceData().tickSamples.at(-1)?.counters ?? {};
    expect(defaultCounters.flockingTheoreticalAllPairs).toBe((defaultCount * (defaultCount - 1)) / 2);
    expect(defaultCounters.flockingSpatialHashActive).toBe(1);
    expect(defaultCounters.flockingPairwiseChecks).toBeGreaterThan(0);
    expect(defaultCounters.flockingPairwiseChecks).toBeLessThan((defaultCount * (defaultCount - 1)) / 2);

    const smallCount = 80;
    const smallRun = new SimulationEngine(flockingTemplate, {
      seed: "performance-small-flocking",
      parameters: { agentCount: smallCount, noise: 0 },
      performance: { enabled: true, maxSamples: 5 }
    });
    smallRun.step();

    const smallCounters = smallRun.performanceData().tickSamples.at(-1)?.counters ?? {};
    expect(smallCounters.flockingSpatialHashActive).toBe(0);
    expect(smallCounters.flockingPairwiseChecks).toBe((smallCount * (smallCount - 1)) / 2);
  });

  it("does not alter deterministic simulation state", () => {
    const options = {
      seed: "performance-determinism",
      parameters: {
        agentCount: 160,
        perceptionRadius: 30,
        separationRadius: 6,
        noise: 0.02
      }
    };
    const plain = new SimulationEngine(flockingTemplate, options);
    const instrumented = new SimulationEngine(flockingTemplate, {
      ...options,
      performance: { enabled: true, maxSamples: 10 }
    });

    plain.runSteps(25);
    instrumented.runSteps(25);

    expect(instrumented.createSnapshot()).toEqual(plain.createSnapshot());
    expect(instrumented.performanceData().tickSamples.length).toBeGreaterThan(0);
    expect(instrumented.performanceData().tickSamples.at(-1)?.counters.flockingSpatialHashActive).toBe(1);
  });
});
