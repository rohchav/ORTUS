import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterDefinition, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import {
  EPIDEMIC_SPACE_ID,
  InfectionState,
  Position2D,
  Velocity2D,
  createEpidemicTransmissionSystem,
  createEpidemicMovementSystem,
  createEpidemicBoundarySystem,
  createRecoveryEventSystem,
  epidemicMetrics,
  epidemicTemplate,
  type InfectionStateComponent
} from "../templates/epidemic.template";

describe("epidemic template", () => {
  it("recovers infected agents after recoveryTicks", () => {
    const engine = new SimulationEngine(epidemicTemplate, {
      seed: "epidemic-recovery",
      parameters: params({ agentCount: 1, initialInfected: 1, recoveryTicks: 2, infectionProbability: 0 })
    });

    engine.runSteps(2);

    expect(engine.world.view().getComponent<InfectionStateComponent>("e000001", InfectionState)?.status).toBe("recovered");
  });

  it("rejects negative recoveryTicks", () => {
    expect(
      () =>
        new SimulationEngine(epidemicTemplate, {
          parameters: params({ recoveryTicks: -1 })
        })
    ).toThrow();
  });

  it("infects susceptible agents within radius", () => {
    const engine = new SimulationEngine(lineTemplate(["infected", "susceptible"]), {
      parameters: params({ agentCount: 2, initialInfected: 1, infectionProbability: 1, infectionRadius: 1.1, movementSpeed: 0 })
    });

    engine.step();

    expect(engine.world.view().getComponent<InfectionStateComponent>("B", InfectionState)?.status).toBe("infected");
  });

  it("infectionProbability zero prevents infection and movementSpeed zero keeps positions stable", () => {
    const engine = new SimulationEngine(lineTemplate(["infected", "susceptible"]), {
      parameters: params({ agentCount: 2, initialInfected: 1, infectionProbability: 0, infectionRadius: 1.1, movementSpeed: 0 })
    });
    const beforeA = engine.world.view().getComponent("A", Position2D);
    const beforeB = engine.world.view().getComponent("B", Position2D);

    engine.runSteps(5);

    expect(engine.world.view().getComponent<InfectionStateComponent>("B", InfectionState)?.status).toBe("susceptible");
    expect(engine.world.view().getComponent("A", Position2D)).toEqual(beforeA);
    expect(engine.world.view().getComponent("B", Position2D)).toEqual(beforeB);
  });

  it("does not reinfect recovered agents", () => {
    const engine = new SimulationEngine(lineTemplate(["infected", "recovered"]), {
      parameters: params({ agentCount: 2, initialInfected: 1, infectionProbability: 1, infectionRadius: 1.1, movementSpeed: 0 })
    });

    engine.step();

    expect(engine.world.view().getComponent<InfectionStateComponent>("B", InfectionState)?.status).toBe("recovered");
  });

  it("uses staged updates so same-tick infection chains do not occur", () => {
    const engine = new SimulationEngine(lineTemplate(["infected", "susceptible", "susceptible"]), {
      seed: "staged-line",
      parameters: params({ agentCount: 3, initialInfected: 1, infectionProbability: 1, infectionRadius: 1.1, movementSpeed: 0 })
    });

    engine.step();

    expect(engine.world.view().getComponent<InfectionStateComponent>("B", InfectionState)?.status).toBe("infected");
    expect(engine.world.view().getComponent<InfectionStateComponent>("C", InfectionState)?.status).toBe("susceptible");

    engine.step();
    expect(engine.world.view().getComponent<InfectionStateComponent>("C", InfectionState)?.status).toBe("infected");
  });

  it("is reproducible for the same seed", () => {
    const left = new SimulationEngine(epidemicTemplate, { seed: "epi-same", parameters: params({ agentCount: 30 }) });
    const right = new SimulationEngine(epidemicTemplate, { seed: "epi-same", parameters: params({ agentCount: 30 }) });
    left.runSteps(100);
    right.runSteps(100);
    expect(left.createSnapshot()).toEqual(right.createSnapshot());
  });
});

function lineTemplate(statuses: InfectionStateComponent["status"][]): SimulationTemplate {
  return {
    id: "line-epidemic",
    name: "Line Epidemic",
    description: "Line epidemic test.",
    version: "1.0.0",
    parameterDefinitions: epidemicParameterDefinitions(),
    documentation: docs(),
    createInitialWorld() {
      const world = new World();
      const space = new Continuous2DSpace({ id: EPIDEMIC_SPACE_ID, width: 20, height: 20, boundaryMode: "clamp" });
      world.addSpace(space);
      const ids = ["A", "B", "C"];
      statuses.forEach((status, index) => {
        const id = ids[index] as string;
        world.entityStore.create("agent", { id, createdAtTick: 0 });
        const position = { x: index, y: 0 };
        world.componentStore.add(id, Position2D, position);
        world.componentStore.add(id, Velocity2D, { x: 0, y: 0 });
        world.componentStore.add(id, InfectionState, { status, ...(status === "infected" ? { infectedAtTick: 0 } : {}) });
        space.addEntity(id, position);
      });
      return world;
    },
    registerSystems(registry) {
      registry.register(createEpidemicTransmissionSystem());
      registry.register(createEpidemicMovementSystem());
      registry.register(createEpidemicBoundarySystem());
      registry.register(createRecoveryEventSystem());
    },
    registerMetrics(registry) {
      for (const metric of epidemicMetrics()) {
        registry.register(metric);
      }
    },
    getVisuals: () => ({ components: {} })
  };
}

function epidemicParameterDefinitions(): ParameterDefinition[] {
  return epidemicTemplate.parameterDefinitions.map((definition) => ({ ...definition }));
}

function params(overrides: Record<string, number> = {}) {
  return {
    agentCount: 3,
    initialInfected: 1,
    infectionRadius: 1.1,
    infectionProbability: 1,
    recoveryTicks: 100,
    movementSpeed: 0,
    ...overrides
  };
}

function docs() {
  return {
    purpose: "Test epidemic line transmission.",
    entities: ["Agents"],
    stateVariables: ["Position2D", "Velocity2D", "InfectionState"],
    processOverview: "Transmission and recovery only.",
    scheduling: "Transmission in decide, recovery in resolve.",
    designConcepts: { interaction: "Line contact." },
    initialization: "Agents in a line.",
    submodels: ["Transmission"],
    assumptions: [],
    limitations: []
  };
}
