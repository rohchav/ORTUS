import { describe, expect, it } from "vitest";
import { EventQueue } from "../kernel/EventQueue";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { epidemicTemplate, InfectionState, type InfectionStateComponent } from "../templates/epidemic.template";

describe("event queue", () => {
  it("fires future events at the correct tick", () => {
    const template: SimulationTemplate = {
      id: "event-template",
      name: "Event Template",
      description: "Event test.",
      version: "1.0.0",
      parameterDefinitions: [],
      documentation: docs(),
      createInitialWorld() {
        const world = new World();
        world.eventQueue.schedule({
          id: "future",
          type: "test.future",
          scheduledTick: 3,
          payload: { value: 1 },
          createdAtTick: 0
        });
        return world;
      },
      registerSystems(registry) {
        registry.register({
          id: "EventRecorder",
          phase: "beforeStep",
          priority: 0,
          update(ctx) {
            const fired = ctx.events.due().map((event) => event.id).join(",");
            ctx.commands.setGlobal("fired", fired);
          }
        });
      },
      registerMetrics: () => undefined,
      getVisuals: () => ({ components: {} })
    };
    const engine = new SimulationEngine(template);

    engine.runSteps(2);
    expect(engine.world.globals.fired).toBe("");
    engine.step();
    expect(engine.world.globals.fired).toBe("future");
  });

  it("orders same-tick events deterministically", () => {
    const queue = new EventQueue();
    queue.schedule({ id: "c", type: "x", scheduledTick: 5, payload: {}, createdAtTick: 1, priority: 1 });
    queue.schedule({ id: "a", type: "x", scheduledTick: 5, payload: {}, createdAtTick: 1, priority: 0 });
    queue.schedule({ id: "b", type: "x", scheduledTick: 5, payload: {}, createdAtTick: 0, priority: 0 });

    expect(queue.popDue(5).map((event) => event.id)).toEqual(["b", "a", "c"]);
  });

  it("does not fire cancelled events", () => {
    const queue = new EventQueue();
    queue.schedule({ id: "cancelled", type: "x", scheduledTick: 1, payload: {}, createdAtTick: 0 });
    queue.schedule({ id: "kept", type: "x", scheduledTick: 1, payload: {}, createdAtTick: 0 });

    expect(queue.cancel("cancelled")).toBe(true);
    expect(queue.popDue(1).map((event) => event.id)).toEqual(["kept"]);
  });

  it("recovers infected epidemic agents on the scheduled tick", () => {
    const engine = new SimulationEngine(epidemicTemplate, {
      seed: "recover",
      parameters: {
        agentCount: 1,
        initialInfected: 1,
        infectionRadius: 1,
        infectionProbability: 0,
        recoveryTicks: 3,
        movementSpeed: 0
      }
    });

    engine.runSteps(2);
    let state = engine.world.view().getComponent<InfectionStateComponent>("e000001", InfectionState);
    expect(state?.status).toBe("infected");
    engine.step();
    state = engine.world.view().getComponent<InfectionStateComponent>("e000001", InfectionState);
    expect(state?.status).toBe("recovered");
  });
});

function docs() {
  return {
    purpose: "Test events.",
    entities: [],
    stateVariables: [],
    processOverview: "Schedule and record events.",
    scheduling: "beforeStep records due events.",
    designConcepts: {},
    initialization: "One future event.",
    submodels: [],
    assumptions: [],
    limitations: []
  };
}
