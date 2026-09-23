import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationEngineFailedError, SimulationInvariantError, SimulationTemplateError, SimulationValidationError } from "../kernel/Errors";
import type { SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { epidemicTemplate } from "../templates/epidemic.template";
import { executeIntervention, readInterventionHistory } from "../interventions";
import { RuntimeWorkerHost } from "../runtime/RuntimeWorkerHost";
import type { RuntimeWorkerResponse } from "../runtime/protocol";
import { createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld/scenario";

// Fault plan read by the fixture's systems on every tick. Tests mutate it to inject a failure and
// then clear it so the same template can be used for a clean comparison run after reset.
interface FaultPlan {
  throwInBeforeStepAtTick?: number;
  throwInSenseAtTick?: number;
  badBatchAtTick?: number;
  badMultiTargetCommandAtTick?: number;
  invalidWorldAtTick?: number;
}

describe("engine tick failure semantics", () => {
  it("fails the run when a system throws before any command is applied", () => {
    const plan: FaultPlan = { throwInBeforeStepAtTick: 2 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "before-mutation" });
    engine.step();
    const beforeFailure = engine.world.serialize();

    expect(() => engine.step()).toThrow(/System draw-noise failed: injected beforeStep failure/);

    expect(engine.failure).toMatchObject({ operation: "step", tick: 2 });
    expect(engine.world.tick).toBe(2);
    expect(engine.world.componentStore.get("a", "Counter")).toEqual(beforeFailure.components.Counter?.a);
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
    expect(engine.world.tick).toBe(2);
  });

  it("fails the run when a later phase throws after an earlier phase committed mutations", () => {
    const plan: FaultPlan = { throwInSenseAtTick: 2 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "partial-tick" });
    engine.step();

    expect(() => engine.step()).toThrow(/System b-sense-fault failed: injected sense failure/);

    // The beforeStep phase of tick 2 committed before the sense phase threw; that partial state is
    // inspectable but must not be continued, exported as continuation state, or recorded as a metric.
    expect(engine.world.globals["noise:2"]).toEqual(expect.any(Number));
    expect(engine.failure?.tick).toBe(2);
    expect(engine.metrics.historyRecords().map((record) => record.tick)).toEqual([1]);
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
    expect(() => engine.runSteps(1)).toThrow(SimulationEngineFailedError);
    expect(() => engine.snapshotExport()).toThrow(SimulationEngineFailedError);
    expect(() => engine.exportSnapshot()).toThrow(SimulationEngineFailedError);
    expect(engine.createSnapshot().tick).toBe(2);
  });

  it("discards commands queued by a failed tick so no later execution can apply them", () => {
    const plan: FaultPlan = { throwInSenseAtTick: 2 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "leak" });
    engine.step();

    expect(() => engine.step()).toThrow(/System b-sense-fault failed: injected sense failure/);

    // "a-queue-marker" queued setGlobal("marker:2") in the same phase, before "b-sense-fault" threw.
    expect(engine.commandBuffer.count()).toBe(0);
    expect(engine.world.globals["marker:2"]).toBeUndefined();
    expect(() => engine.applyCommands([{ type: "setGlobal", key: "unrelated", value: 1 }])).toThrow(SimulationEngineFailedError);
    expect(engine.world.globals["marker:2"]).toBeUndefined();
    expect(engine.world.globals.unrelated).toBeUndefined();

    plan.throwInSenseAtTick = undefined;
    engine.reset();
    engine.runSteps(3);
    const fresh = new SimulationEngine(faultTemplate(plan), { seed: "leak" });
    fresh.runSteps(3);
    expect(engine.exportSnapshot()).toBe(fresh.exportSnapshot());
    expect(engine.world.globals["marker:2"]).toBe(2);
  });

  it("fails the run when one command in a tick's batch fails, and never applies the commands after it", () => {
    const plan: FaultPlan = { badBatchAtTick: 1 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "tick-batch" });

    expect(() => engine.step()).toThrow(SimulationInvariantError);

    expect(engine.failure).toMatchObject({ operation: "step", tick: 1 });
    expect(engine.world.globals["batch:third"]).toBeUndefined();
    expect(engine.commandBuffer.count()).toBe(0);
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
  });

  it("fails the run when a single multi-target command fails part-way through", () => {
    const plan: FaultPlan = { badMultiTargetCommandAtTick: 1 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "multi-target" });

    // setComponents targets alive entity "a" and missing entity "missing" without allowMissing.
    expect(() => engine.step()).toThrow(/missing or dead entity missing/);

    expect(engine.failure?.operation).toBe("step");
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
    expect(() => engine.snapshotExport()).toThrow(SimulationEngineFailedError);
  });

  it("consumes events due in a failed tick with that tick and delivers them exactly once after reset", () => {
    const plan: FaultPlan = { throwInSenseAtTick: 2 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "events" });
    engine.step();
    expect(engine.world.eventQueue.all().map((event) => event.id)).toEqual(["pulse"]);

    expect(() => engine.step()).toThrow(/System b-sense-fault failed: injected sense failure/);

    expect(engine.world.eventQueue.all()).toEqual([]);
    expect(engine.world.globals["pulse:2"]).toBeUndefined();
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);

    plan.throwInSenseAtTick = undefined;
    engine.reset();
    engine.runSteps(4);
    const deliveries = Object.keys(engine.world.globals).filter((key) => key.startsWith("pulse:"));
    expect(deliveries).toEqual(["pulse:2"]);
  });

  it("does not let RNG draws from a failed tick shift the stream of the rebuilt run", () => {
    const plan: FaultPlan = { throwInSenseAtTick: 3 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "rng" });
    engine.runSteps(2);

    expect(() => engine.step()).toThrow(/System b-sense-fault failed: injected sense failure/);
    expect(engine.world.globals["noise:3"]).toEqual(expect.any(Number));
    expect(() => engine.snapshotExport()).toThrow(SimulationEngineFailedError);

    plan.throwInSenseAtTick = undefined;
    engine.reset();
    engine.runSteps(3);
    const fresh = new SimulationEngine(faultTemplate(plan), { seed: "rng" });
    fresh.runSteps(3);
    expect([1, 2, 3].map((tick) => engine.world.globals[`noise:${tick}`])).toEqual(
      [1, 2, 3].map((tick) => fresh.world.globals[`noise:${tick}`])
    );
    expect(engine.snapshotExport().rng).toEqual(fresh.snapshotExport().rng);
  });

  it("fails the run when template world validation rejects a tick, without recording that tick's metrics", () => {
    const plan: FaultPlan = { invalidWorldAtTick: 2 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "validate-world" });
    engine.step();

    expect(() => engine.step()).toThrow(SimulationTemplateError);

    expect(engine.failure).toMatchObject({ operation: "step", tick: 2 });
    expect(engine.metrics.historyRecords().map((record) => record.tick)).toEqual([1]);
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
  });

  it("stops a multi-step run at the failed tick", () => {
    const plan: FaultPlan = { throwInSenseAtTick: 3 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "run-steps" });
    let systemCalls = 0;
    engine.registry.register({ id: "z-call-counter", phase: "afterStep", priority: 0, update: () => void (systemCalls += 1) });

    expect(() => engine.runSteps(5)).toThrow(/System b-sense-fault failed: injected sense failure/);

    expect(engine.world.tick).toBe(3);
    expect(systemCalls).toBe(2);
    expect(() => engine.runSteps(1)).toThrow(SimulationEngineFailedError);
    expect(systemCalls).toBe(2);
  });

  it("keeps the failure inspectable and refuses to resume playback", () => {
    const plan: FaultPlan = { throwInSenseAtTick: 1 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "inspect" });
    engine.play();

    let thrown: unknown;
    try {
      engine.step();
    } catch (error) {
      thrown = error;
    }

    expect(engine.failure?.error).toBe(thrown);
    expect(engine.clock.running).toBe(false);
    expect(() => engine.play()).toThrow(SimulationEngineFailedError);
    expect(engine.clock.running).toBe(false);
    const refusal = captureError(() => engine.step());
    expect(refusal).toBeInstanceOf(SimulationEngineFailedError);
    expect((refusal as SimulationEngineFailedError).cause).toBe(thrown);
    expect((refusal as Error).message).toMatch(/tick 1.*injected sense failure/);
    expect(JSON.parse(engine.exportScenario())).toMatchObject({ seed: "inspect" });
  });
});

describe("engine external command batch semantics", () => {
  it("fails the run when an external batch fails during application, without applying later commands", () => {
    const engine = new SimulationEngine(faultTemplate({}), { seed: "external-batch" });
    engine.step();

    expect(() =>
      engine.applyCommands([
        { type: "setGlobal", key: "first", value: "applied" },
        { type: "addComponent", entityId: "missing", componentType: "Counter", value: { value: 1 } },
        { type: "setGlobal", key: "third", value: "applied" }
      ])
    ).toThrow(SimulationInvariantError);

    expect(engine.failure).toMatchObject({ operation: "applyCommands", tick: 1 });
    expect(engine.world.globals.third).toBeUndefined();
    expect(engine.commandBuffer.count()).toBe(0);
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
    expect(engine.world.tick).toBe(1);
  });

  it("fails the run when template validation rejects the result of an external batch", () => {
    const plan: FaultPlan = {};
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "external-validate" });
    plan.invalidWorldAtTick = 0;

    expect(() => engine.applyCommands([{ type: "setGlobal", key: "x", value: 1 }])).toThrow(SimulationTemplateError);

    expect(engine.failure?.operation).toBe("applyCommands");
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
  });

  it("rejects an invalid external batch before applying or queueing any of it", () => {
    const engine = new SimulationEngine(faultTemplate({}), { seed: "external-invalid" });
    const before = engine.exportSnapshot();

    expect(() =>
      engine.applyCommands([
        { type: "setGlobal", key: "valid-prefix", value: "should-not-apply" },
        { type: "addComponent", entityId: "a", componentType: "Bad", value: { x: Number.NaN } }
      ])
    ).toThrow(SimulationValidationError);

    expect(engine.failure).toBeUndefined();
    expect(engine.commandBuffer.count()).toBe(0);
    expect(engine.exportSnapshot()).toBe(before);
    engine.step();
    expect(engine.world.globals["valid-prefix"]).toBeUndefined();
  });

  it("refuses interventions on a failed engine without touching world state or intervention history", () => {
    const engine = new SimulationEngine(epidemicTemplate, {
      seed: "failed-intervention",
      parameters: { agentCount: 8, initialInfected: 0, recoveryTicks: 5 }
    });
    engine.step();
    expect(() => engine.applyCommands([{ type: "destroyEntity", entityId: "missing-entity" }])).toThrow(SimulationInvariantError);
    const world = JSON.stringify(engine.world.serialize());
    const history = readInterventionHistory(engine);
    const [entityId] = engine.world.view().entitiesWith(["InfectionState"]);

    expect(() =>
      executeIntervention(engine, {
        templateId: engine.template.id,
        interventionId: "epidemic.infectSelected",
        target: { entityId: entityId! }
      })
    ).toThrow(SimulationEngineFailedError);

    expect(JSON.stringify(engine.world.serialize())).toBe(world);
    expect(readInterventionHistory(engine)).toEqual(history);
  });
});

describe("engine rebuild from failure", () => {
  it("reset after a failure produces a run identical to a fresh engine", () => {
    const plan: FaultPlan = { badBatchAtTick: 2 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "reset" });
    engine.step();
    expect(() => engine.step()).toThrow(SimulationInvariantError);

    plan.badBatchAtTick = undefined;
    engine.reset();

    expect(engine.failure).toBeUndefined();
    expect(engine.world.tick).toBe(0);
    engine.runSteps(4);
    const fresh = new SimulationEngine(faultTemplate(plan), { seed: "reset" });
    fresh.runSteps(4);
    expect(engine.exportSnapshot()).toBe(fresh.exportSnapshot());
  });

  it("restoring a pre-failure snapshot into a failed engine continues exactly like an uninterrupted run", () => {
    const plan: FaultPlan = {};
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "restore" });
    engine.runSteps(2);
    const checkpoint = engine.snapshotExport();
    plan.throwInSenseAtTick = 3;
    expect(() => engine.step()).toThrow(/System b-sense-fault failed: injected sense failure/);

    plan.throwInSenseAtTick = undefined;
    engine.restoreSnapshot(checkpoint);
    engine.runSteps(2);

    expect(engine.failure).toBeUndefined();
    const uninterrupted = new SimulationEngine(faultTemplate(plan), { seed: "restore" });
    uninterrupted.runSteps(4);
    expect(engine.exportSnapshot()).toBe(uninterrupted.exportSnapshot());
  });

  it("leaves the engine untouched when a snapshot restore fails validation", () => {
    const plan: FaultPlan = {};
    const source = new SimulationEngine(faultTemplate(plan), { seed: "bad-restore" });
    source.runSteps(3);
    const laterSnapshot = source.snapshotExport();
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "bad-restore" });
    engine.step();
    const before = engine.exportSnapshot();

    plan.invalidWorldAtTick = 3;
    expect(() => engine.restoreSnapshot(laterSnapshot)).toThrow(SimulationTemplateError);
    plan.invalidWorldAtTick = undefined;

    expect(engine.failure).toBeUndefined();
    expect(engine.exportSnapshot()).toBe(before);
    engine.step();
    expect(engine.world.tick).toBe(2);
  });

  it("keeps a failed engine failed when a rebuild attempt itself fails", () => {
    const plan: FaultPlan = { throwInSenseAtTick: 1 };
    const engine = new SimulationEngine(faultTemplate(plan), { seed: "failed-reset" });
    expect(() => engine.step()).toThrow(/System b-sense-fault failed: injected sense failure/);

    plan.throwInSenseAtTick = undefined;
    plan.invalidWorldAtTick = 0;
    expect(() => engine.reset()).toThrow(SimulationTemplateError);
    plan.invalidWorldAtTick = undefined;

    expect(engine.failure?.tick).toBe(1);
    expect(() => engine.step()).toThrow(SimulationEngineFailedError);
    engine.reset();
    engine.step();
    expect(engine.world.tick).toBe(1);
  });
});

describe("Worker runtime tick failure", () => {
  it("reports a mid-tick validation failure as a terminal runtime failure, not a recoverable rejection", () => {
    const responses: RuntimeWorkerResponse[] = [];
    const host = new RuntimeWorkerHost({ postMessage: (message) => responses.push(message) });
    host.handleMessage({
      type: "runtime.initialize",
      requestId: 1,
      generation: 1,
      runId: "tick-failure",
      runConfig: createImmersiveFlockingRunConfig(100)
    });
    // Finite but extreme velocities pass command and world validation, then overflow to a
    // non-finite steering value inside the next tick's systems.
    const values: Record<string, { x: number; y: number }> = {};
    for (let index = 1; index <= 100; index += 1) {
      values[`e${String(index).padStart(6, "0")}`] = { x: 1e308, y: 1e308 };
    }
    host.handleMessage({
      type: "runtime.applyCommands",
      requestId: 2,
      generation: 1,
      commands: [{ type: "setComponents", componentType: "Velocity2D", values }]
    });
    expect(responses.some((message) => message.type === "runtime.failure")).toBe(false);
    responses.length = 0;

    host.handleMessage({ type: "runtime.step", requestId: 3, generation: 1 });

    expect(responses.some((message) => message.type === "runtime.rejected")).toBe(false);
    const failure = responses.find((message) => message.type === "runtime.failure");
    expect(failure).toMatchObject({ failure: { code: "runtime", requestId: 3, message: expect.stringMatching(/not finite/) } });
    responses.length = 0;

    host.handleMessage({ type: "runtime.step", requestId: 4, generation: 1 });

    expect(responses.some((message) => message.type === "runtime.complete")).toBe(false);
    expect(responses.find((message) => message.type === "runtime.failure")).toMatchObject({
      failure: { requestId: 4, message: expect.stringMatching(/run failed at tick 1/) }
    });
    host.dispose();
  });
});

function faultTemplate(plan: FaultPlan): SimulationTemplate {
  return {
    id: "fault-injection",
    name: "Fault Injection",
    description: "Kernel failure-semantics test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Exercise kernel failure semantics.",
      entities: ["agent"],
      stateVariables: ["Counter"],
      processOverview: "Counts ticks, draws RNG, and observes one scheduled event.",
      scheduling: "beforeStep, sense, act.",
      designConcepts: {},
      initialization: "One agent with a counter and one event at tick 2.",
      submodels: [],
      assumptions: [],
      limitations: []
    },
    createInitialWorld: () => {
      const world = new World();
      world.entityStore.create("agent", { id: "a", createdAtTick: 0 });
      world.componentStore.add("a", "Counter", { value: 0 });
      world.eventQueue.schedule({ id: "pulse", type: "pulse", scheduledTick: 2, payload: null, createdAtTick: 0 });
      return world;
    },
    registerSystems(registry) {
      registry.register({
        id: "draw-noise",
        phase: "beforeStep",
        priority: 0,
        update(ctx) {
          if (plan.throwInBeforeStepAtTick === ctx.tick) {
            throw new Error("injected beforeStep failure");
          }
          ctx.commands.setGlobal(`noise:${ctx.tick}`, ctx.rng.fork("fault:noise").float());
        }
      });
      registry.register({
        id: "a-queue-marker",
        phase: "sense",
        priority: 0,
        update(ctx) {
          ctx.commands.setGlobal(`marker:${ctx.tick}`, ctx.tick);
        }
      });
      registry.register({
        id: "b-sense-fault",
        phase: "sense",
        priority: 1,
        update(ctx) {
          if (plan.throwInSenseAtTick === ctx.tick) {
            throw new Error("injected sense failure");
          }
        }
      });
      registry.register({
        id: "count",
        phase: "act",
        priority: 0,
        update(ctx) {
          const current = ctx.world.getComponent<{ value: number }>("a", "Counter");
          ctx.commands.setComponent("a", "Counter", { value: (current?.value ?? 0) + 1 });
          for (const event of ctx.events.due("pulse")) {
            ctx.commands.setGlobal(`pulse:${ctx.tick}`, event.id);
          }
          if (plan.badBatchAtTick === ctx.tick) {
            ctx.commands.setGlobal("batch:first", ctx.tick);
            ctx.commands.addComponent("missing", "Counter", { value: 1 });
            ctx.commands.setGlobal("batch:third", ctx.tick);
          }
          if (plan.badMultiTargetCommandAtTick === ctx.tick) {
            ctx.commands.setComponents("Counter", { a: { value: -1 }, missing: { value: -1 } });
          }
        }
      });
    },
    registerMetrics(metrics) {
      metrics.register({
        key: "counter",
        label: "Counter",
        description: "Counter value of agent a.",
        valueType: "integer",
        collect: (world) => world.getComponent<{ value: number }>("a", "Counter")?.value ?? 0
      });
    },
    validateWorld(world) {
      if (plan.invalidWorldAtTick === world.tick) {
        throw new SimulationTemplateError("injected world validation failure");
      }
    },
    getVisuals: () => ({ components: {} })
  };
}

function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}
