import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { SimulationTemplate, System } from "../kernel/types";
import { World } from "../kernel/World";

describe("scheduler", () => {
  it("executes systems by phase, then priority, then id", () => {
    const order: string[] = [];
    const systems: System[] = [
      system("act-z", "act", 0, order),
      system("sense-b", "sense", 1, order),
      system("sense-a", "sense", 1, order),
      system("before", "beforeStep", 10, order),
      system("decide-high", "decide", 5, order),
      system("decide-low", "decide", -1, order),
      system("resolve", "resolve", 0, order),
      system("after", "afterStep", 0, order),
      system("metrics", "metrics", 0, order)
    ];
    const template = minimalTemplate({
      registerSystems(registry) {
        for (const entry of systems) {
          registry.register(entry);
        }
      }
    });

    new SimulationEngine(template).step();

    expect(order).toEqual([
      "before",
      "sense-a",
      "sense-b",
      "decide-low",
      "decide-high",
      "act-z",
      "resolve",
      "after",
      "metrics"
    ]);
  });
});

function system(id: string, phase: System["phase"], priority: number, order: string[]): System {
  return {
    id,
    phase,
    priority,
    update() {
      order.push(id);
    }
  };
}

function minimalTemplate(overrides: Partial<SimulationTemplate>): SimulationTemplate {
  return {
    id: "scheduler-test",
    name: "Scheduler Test",
    description: "Scheduler test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Test scheduling.",
      entities: [],
      stateVariables: [],
      processOverview: "No model behavior.",
      scheduling: "Test systems.",
      designConcepts: {},
      initialization: "Empty world.",
      submodels: [],
      assumptions: [],
      limitations: []
    },
    createInitialWorld: () => new World(),
    registerSystems: () => undefined,
    registerMetrics: () => undefined,
    getVisuals: () => ({ components: {} }),
    ...overrides
  };
}
