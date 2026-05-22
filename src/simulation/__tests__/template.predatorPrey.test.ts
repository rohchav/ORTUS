import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterDefinition, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Position2D, Velocity2D } from "../templates/epidemic.template";
import {
  Energy,
  PREDATOR_PREY_SPACE_ID,
  Species,
  createDeathSystem,
  createEnergyDecaySystem,
  createPredationSystem,
  createPredatorPreyBoundarySystem,
  createPredatorPreyMovementSystem,
  createReproductionSystem,
  predatorPreyMetrics,
  predatorPreyTemplate,
  type EnergyComponent,
  type SpeciesComponent
} from "../templates/predatorPrey.template";

describe("predator-prey template", () => {
  it("predators lose energy", () => {
    const engine = new SimulationEngine(testTemplate([{ id: "P", kind: "predator", x: 0, energy: 10 }]), {
      parameters: params({ predatorEnergyLoss: 2, predatorEnergyGain: 0, predatorReproductionThreshold: 100 })
    });

    engine.step();

    expect(engine.world.view().getComponent<EnergyComponent>("P", Energy)?.value).toBe(8);
  });

  it("predators consume prey and gain energy", () => {
    const engine = new SimulationEngine(
      testTemplate([
        { id: "P", kind: "predator", x: 0, energy: 5 },
        { id: "R", kind: "prey", x: 1 }
      ]),
      {
        parameters: params({ predatorEnergyLoss: 0, predatorEnergyGain: 3, predationRadius: 2, predatorReproductionThreshold: 100 })
      }
    );

    engine.step();

    expect(engine.world.view().getEntity("R")?.alive).toBe(false);
    expect(engine.world.view().getComponent<EnergyComponent>("P", Energy)?.value).toBe(8);
  });

  it("entities with zero predator energy die", () => {
    const engine = new SimulationEngine(testTemplate([{ id: "P", kind: "predator", x: 0, energy: 0 }]), {
      parameters: params({ predatorEnergyLoss: 0, predatorReproductionThreshold: 100 })
    });

    engine.step();

    expect(engine.world.view().getEntity("P")?.alive).toBe(false);
  });

  it("is reproducible for the same seed", () => {
    const left = new SimulationEngine(predatorPreyTemplate, { seed: "pp-same" });
    const right = new SimulationEngine(predatorPreyTemplate, { seed: "pp-same" });
    left.runSteps(100);
    right.runSteps(100);
    expect(left.createSnapshot()).toEqual(right.createSnapshot());
  });

  it("default templates run 300 ticks with finite bounded metrics", () => {
    for (const template of [predatorPreyTemplate]) {
      const engine = new SimulationEngine(template, { seed: "smoke" });
      expect(() => engine.runSteps(300)).not.toThrow();
      const aliveCount = engine.createSnapshot().entities.filter((entity) => entity.alive).length;
      expect(aliveCount).toBeGreaterThan(0);
      expect(aliveCount).toBeLessThan(5000);
      for (const record of engine.createSnapshot().metricsHistory) {
        for (const value of Object.values(record.values)) {
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    }
  });
});

interface TestEntity {
  id: string;
  kind: SpeciesComponent["kind"];
  x: number;
  energy?: number;
}

function testTemplate(entities: TestEntity[]): SimulationTemplate {
  return {
    id: "predator-prey-test",
    name: "Predator Prey Test",
    description: "Predator-prey behavior test.",
    version: "1.0.0",
    parameterDefinitions: predatorPreyTemplate.parameterDefinitions.map((definition) => ({ ...definition })) as ParameterDefinition[],
    documentation: {
      purpose: "Test predator-prey behavior.",
      entities: ["Prey", "Predators"],
      stateVariables: ["Position2D", "Velocity2D", "Species", "Energy"],
      processOverview: "Runs predator-prey systems.",
      scheduling: "Shared systems.",
      designConcepts: { interaction: "Predation." },
      initialization: "Explicit test entities.",
      submodels: ["Predation", "Energy"],
      assumptions: [],
      limitations: []
    },
    createInitialWorld() {
      const world = new World();
      const space = new Continuous2DSpace({ id: PREDATOR_PREY_SPACE_ID, width: 20, height: 20, boundaryMode: "clamp" });
      world.addSpace(space);
      for (const entity of entities) {
        world.entityStore.create(entity.kind, { id: entity.id, createdAtTick: 0 });
        const position = { x: entity.x, y: 0 };
        world.componentStore.add(entity.id, Position2D, position);
        world.componentStore.add(entity.id, Velocity2D, { x: 0, y: 0 });
        world.componentStore.add(entity.id, Species, { kind: entity.kind });
        if (entity.kind === "predator") {
          world.componentStore.add(entity.id, Energy, { value: entity.energy ?? 10 });
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
      for (const metric of predatorPreyMetrics()) {
        registry.register(metric);
      }
    },
    getVisuals: () => ({ components: {} })
  };
}

function params(overrides: Record<string, number> = {}) {
  return {
    initialPrey: 1,
    initialPredators: 1,
    preyReproductionProbability: 0,
    predatorEnergyLoss: 1,
    predatorEnergyGain: 3,
    predatorReproductionThreshold: 50,
    predationRadius: 2,
    movementSpeed: 0,
    ...overrides
  };
}
