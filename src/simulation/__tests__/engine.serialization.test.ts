import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { epidemicTemplate } from "../templates/epidemic.template";

describe("serialization", () => {
  it("exports, imports, and continues a running snapshot deterministically", () => {
    const original = new SimulationEngine(epidemicTemplate, {
      seed: "serialize",
      parameters: {
        agentCount: 35,
        initialInfected: 2,
        infectionRadius: 9,
        infectionProbability: 0.35,
        recoveryTicks: 20,
        movementSpeed: 0.5
      }
    });
    original.runSteps(50);
    const exported = original.exportSnapshot();
    original.runSteps(50);

    const restored = SimulationEngine.fromSnapshot(epidemicTemplate, exported);
    restored.runSteps(50);

    expect(restored.createSnapshot()).toEqual(original.createSnapshot());
  });

  it("imports scenarios as restarts from initial conditions", () => {
    const engine = new SimulationEngine(epidemicTemplate, { seed: "scenario" });
    engine.runSteps(10);
    const scenario = engine.exportScenario();
    const restarted = SimulationEngine.fromScenario(epidemicTemplate, scenario);

    expect(restarted.createSnapshot().tick).toBe(0);
    expect(restarted.exportScenario()).toBe(scenario);
  });
});
