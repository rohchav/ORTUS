import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterDefinition, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Position2D } from "../templates/epidemic.template";
import {
  OPINION_SPACE_ID,
  OpinionState,
  createOpinionNeighborSensingSystem,
  createOpinionNoiseSystem,
  createOpinionUpdateSystem,
  opinionMetrics,
  opinionTemplate,
  type OpinionStateComponent
} from "../templates/opinion.template";

describe("opinion template", () => {
  it("keeps opinions within [-1, 1]", () => {
    const engine = new SimulationEngine(opinionTemplate, {
      seed: "opinion-bounds",
      parameters: params({ noise: 1, influenceRadius: 100, influenceStrength: 1 })
    });
    engine.runSteps(100);

    for (const entityId of engine.world.view().entitiesWith([OpinionState])) {
      const state = engine.world.view().getComponent<OpinionStateComponent>(entityId, OpinionState);
      expect(state?.value).toBeGreaterThanOrEqual(-1);
      expect(state?.value).toBeLessThanOrEqual(1);
    }
  });

  it("influence strength affects convergence", () => {
    const weak = new SimulationEngine(opinionTemplate, {
      seed: "convergence",
      parameters: params({ influenceStrength: 0, noise: 0, influenceRadius: 100 })
    });
    const strong = new SimulationEngine(opinionTemplate, {
      seed: "convergence",
      parameters: params({ influenceStrength: 0.8, noise: 0, influenceRadius: 100 })
    });
    weak.runSteps(40);
    strong.runSteps(40);

    const weakVariance = latestMetric(weak, "opinionVariance");
    const strongVariance = latestMetric(strong, "opinionVariance");
    expect(strongVariance).toBeLessThan(weakVariance);
  });

  it("is reproducible for the same seed", () => {
    const left = new SimulationEngine(opinionTemplate, { seed: "opinion-same", parameters: params() });
    const right = new SimulationEngine(opinionTemplate, { seed: "opinion-same", parameters: params() });
    left.runSteps(100);
    right.runSteps(100);
    expect(left.createSnapshot()).toEqual(right.createSnapshot());
  });

  it("noise uses seeded RNG streams", () => {
    const left = new SimulationEngine(opinionTemplate, {
      seed: "noise-a",
      parameters: params({ noise: 0.5, influenceStrength: 0, influenceRadius: 10 })
    });
    const right = new SimulationEngine(opinionTemplate, {
      seed: "noise-b",
      parameters: params({ noise: 0.5, influenceStrength: 0, influenceRadius: 10 })
    });

    left.runSteps(25);
    right.runSteps(25);

    expect(left.createSnapshot()).not.toEqual(right.createSnapshot());
  });

  it("updates from staged sensed values without accidental order dependence", () => {
    const engine = new SimulationEngine(twoOpinionTemplate(), {
      parameters: params({ agentCount: 2, influenceRadius: 10, influenceStrength: 0.5, noise: 0, initialPolarization: 1 })
    });

    engine.step();

    expect(engine.world.view().getComponent<OpinionStateComponent>("A", OpinionState)?.value).toBe(0);
    expect(engine.world.view().getComponent<OpinionStateComponent>("B", OpinionState)?.value).toBe(0);
  });
});

function twoOpinionTemplate(): SimulationTemplate {
  return {
    id: "two-opinion",
    name: "Two Opinion",
    description: "Two-agent opinion test.",
    version: "1.0.0",
    parameterDefinitions: opinionTemplate.parameterDefinitions.map((definition) => ({ ...definition })) as ParameterDefinition[],
    documentation: {
      purpose: "Test opinion staging.",
      entities: ["Agents"],
      stateVariables: ["Position2D", "OpinionState"],
      processOverview: "Sense and update.",
      scheduling: "Sense before decide.",
      designConcepts: { interaction: "Two neighbors." },
      initialization: "Two agents.",
      submodels: ["Opinion influence"],
      assumptions: [],
      limitations: []
    },
    createInitialWorld() {
      const world = new World();
      const space = new Continuous2DSpace({ id: OPINION_SPACE_ID, width: 10, height: 10, boundaryMode: "clamp" });
      world.addSpace(space);
      for (const [id, x, value] of [
        ["A", 0, -1],
        ["B", 1, 1]
      ] as const) {
        world.entityStore.create("opinion-agent", { id, createdAtTick: 0 });
        const position = { x, y: 0 };
        world.componentStore.add(id, Position2D, position);
        world.componentStore.add(id, OpinionState, { value, stubbornness: 0 });
        space.addEntity(id, position);
      }
      return world;
    },
    registerSystems(registry) {
      registry.register(createOpinionNeighborSensingSystem());
      registry.register(createOpinionUpdateSystem());
      registry.register(createOpinionNoiseSystem());
    },
    registerMetrics(registry) {
      for (const metric of opinionMetrics()) {
        registry.register(metric);
      }
    },
    getVisuals: () => ({ components: {} })
  };
}

function params(overrides: Record<string, number> = {}) {
  return {
    agentCount: 60,
    influenceRadius: 14,
    influenceStrength: 0.18,
    noise: 0.02,
    initialPolarization: 0.65,
    ...overrides
  };
}

function latestMetric(engine: SimulationEngine, key: string): number {
  const history = engine.createSnapshot().metricsHistory;
  const latest = history[history.length - 1];
  return latest?.values[key] ?? Number.NaN;
}
