import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { JsonValue, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";

// The kernel's ownership contract: world state changes only through applied commands, a queued command
// cannot change after it is queued, every read returns a private copy, and recorded command history is
// neither changed by later world updates nor by callers mutating what they read out.

type Counter = { value: number };

describe("kernel state ownership", () => {
  it("applies the payload as queued even when the system mutates it afterwards", () => {
    const engine = new SimulationEngine(ownershipTemplate([]), { seed: "ownership" });
    engine.step();

    // setComponents and moveEntities use the hot validation path, which does not copy the command.
    expect(engine.world.componentStore.get<Counter>("a", "Counter")).toEqual({ value: 1 });
    expect(engine.world.componentStore.has("b", "Counter")).toBe(true);
    expect(engine.world.componentStore.get<Counter>("b", "Counter")).toEqual({ value: 0 });
    expect(engine.world.getSpace<Continuous2DSpace>("field")?.getPosition("a")).toEqual({ x: 2, y: 2 });
  });

  it("gives systems private copies of components, entities, globals, and due events", () => {
    const observations: Observation[] = [];
    const engine = new SimulationEngine(ownershipTemplate(observations), { seed: "ownership" });
    const globalsBefore = engine.world.serialize().globals;
    engine.step();

    expect(engine.world.componentStore.get<Counter>("a", "Counter")).toEqual({ value: 1 });
    expect(engine.world.entityStore.get("a")).toEqual({ id: "a", archetype: "agent", alive: true, createdAtTick: 0 });
    expect(engine.world.entityStore.get("b")).toEqual({ id: "b", archetype: "agent", alive: true, createdAtTick: 0 });
    expect(engine.world.serialize().globals).toEqual(globalsBefore);
    expect(observations).toEqual([
      {
        tick: 1,
        counter: { value: 1 },
        entityIds: ["a", "b"],
        duePayloads: [{ nested: { n: 1 } }],
        globals: globalsBefore
      }
    ]);
    expect(globalsBefore.config).toEqual({ nested: [1, 2] });
    expect(globalsBefore).not.toHaveProperty("injected");
    const view = engine.world.view();
    expect(view.getGlobal("config")).toEqual({ nested: [1, 2] });
    expect(view.getGlobal("missing")).toBeUndefined();
    expect(view.getGlobal("__proto__")).toBeUndefined();
    expect(view.getGlobal("toString")).toBeUndefined();
  });

  it("excludes destroyed entities from queries and skips them when a command allows missing targets", () => {
    const engine = new SimulationEngine(ownershipTemplate([]), { seed: "ownership" });

    expect(engine.world.view().entitiesWith(["Counter"])).toEqual(["a", "b"]);
    engine.applyCommands([{ type: "setComponents", componentType: "Counter", values: { dead: { value: 5 }, b: { value: 7 } }, allowMissing: true }]);
    expect(engine.world.componentStore.get<Counter>("dead", "Counter")).toEqual({ value: 0 });
    expect(engine.world.componentStore.get<Counter>("b", "Counter")).toEqual({ value: 7 });
    expect(() => engine.applyCommands([{ type: "setComponent", entityId: "dead", componentType: "Counter", value: { value: 5 } }])).toThrow(
      /missing or dead entity dead/
    );
  });

  it("keeps recorded commands independent of later world updates and of callers mutating read-outs", () => {
    const engine = new SimulationEngine(ownershipTemplate([]), { seed: "ownership" });
    engine.step();
    const tickOneHistory = engine.commandBuffer.recent();
    const tickOneDebug = engine.debugData().lastCommands;
    expect(tickOneHistory.find((entry) => entry.command.type === "setComponents")?.command).toMatchObject({ values: { a: { value: 1 } } });

    // Mutate everything that was read out, then check nothing recorded or live changed.
    for (const entry of [...engine.commandBuffer.recent(), ...engine.debugData().lastCommands]) {
      mutateCommand(entry.command);
      entry.metadata.tick = -1;
    }
    expect(engine.commandBuffer.recent()).toEqual(tickOneHistory);
    expect(engine.debugData().lastCommands).toEqual(tickOneDebug);
    expect(engine.world.componentStore.get<Counter>("a", "Counter")).toEqual({ value: 1 });

    // The stores keep their own copies: changing a stored value in place does not rewrite history.
    engine.world.componentStore.getMutable<Counter>("a", "Counter")!.value = 777;
    expect(engine.commandBuffer.recent()).toEqual(tickOneHistory);
    expect(engine.debugData().lastCommands).toEqual(tickOneDebug);
    engine.world.componentStore.getMutable<Counter>("a", "Counter")!.value = 1;

    // The next tick overwrites the component; the tick-1 record still shows what was applied then.
    engine.step();
    expect(engine.world.componentStore.get<Counter>("a", "Counter")).toEqual({ value: 2 });
    expect(engine.commandBuffer.recent().slice(0, tickOneHistory.length)).toEqual(tickOneHistory);

    // Entries returned by applyCommands are the caller's copies.
    const applied = engine.applyCommands([{ type: "setComponents", componentType: "Counter", values: { b: { value: 3 } } }]);
    const recordedExternal = engine.commandBuffer.recent(1);
    for (const entry of applied) {
      mutateCommand(entry.command);
    }
    expect(engine.commandBuffer.recent(1)).toEqual(recordedExternal);
    expect(recordedExternal[0]?.command).toMatchObject({ values: { b: { value: 3 } } });
    expect(engine.world.componentStore.get<Counter>("b", "Counter")).toEqual({ value: 3 });
  });
});

interface Observation {
  tick: number;
  counter: Counter | undefined;
  entityIds: string[];
  duePayloads: JsonValue[];
  globals: Record<string, JsonValue>;
}

function mutateCommand(command: object): void {
  const record = command as Record<string, unknown>;
  const values = record.values as Record<string, Counter> | undefined;
  for (const value of Object.values(values ?? {})) {
    value.value = -999;
  }
  const locations = record.locations as Record<string, { x: number }> | undefined;
  for (const location of Object.values(locations ?? {})) {
    location.x = -999;
  }
}

function ownershipTemplate(observations: Observation[]): SimulationTemplate {
  return {
    id: "ownership",
    name: "Ownership",
    description: "Kernel state-ownership test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Exercise kernel copy and ownership boundaries.",
      entities: ["agent"],
      stateVariables: ["Counter"],
      processOverview: "Queues then mutates payloads, mutates every read, and observes the result.",
      scheduling: "sense, decide, act.",
      designConcepts: {},
      initialization: "Two live agents and one destroyed agent with counters, one event at tick 1.",
      submodels: [],
      assumptions: [],
      limitations: []
    },
    createInitialWorld: () => {
      const world = new World({ globals: { config: { nested: [1, 2] } } });
      const field = new Continuous2DSpace({ id: "field", width: 10, height: 10, boundaryMode: "wrap" });
      world.addSpace(field);
      for (const id of ["a", "b", "dead"]) {
        world.entityStore.create("agent", { id, createdAtTick: 0 });
        world.componentStore.add(id, "Counter", { value: 0 });
      }
      field.addEntity("a", { x: 1, y: 1 });
      field.addEntity("b", { x: 1, y: 1 });
      world.entityStore.destroy("dead", 0);
      world.eventQueue.schedule({ id: "pulse", type: "pulse", scheduledTick: 1, payload: { nested: { n: 1 } }, createdAtTick: 0 });
      return world;
    },
    registerSystems(registry) {
      registry.register({
        id: "queue-then-mutate",
        phase: "sense",
        priority: 0,
        update(ctx) {
          const values: Record<string, Counter> = { a: { value: ctx.tick } };
          ctx.commands.setComponents("Counter", values);
          values.a!.value = -1;
          values.b = { value: -1 };
          const locations: Record<string, { x: number; y: number }> = { a: { x: 2, y: 2 } };
          ctx.commands.moveEntities("field", locations);
          locations.a!.x = 9;
        }
      });
      registry.register({
        id: "mutate-every-read",
        phase: "decide",
        priority: 0,
        update(ctx) {
          const counter = ctx.world.getComponent<Counter>("a", "Counter");
          if (counter) {
            counter.value = 12345;
          }
          const entity = ctx.world.getEntity("a");
          if (entity) {
            entity.alive = false;
            entity.archetype = "hijacked";
          }
          for (const each of ctx.world.allEntities()) {
            each.alive = false;
          }
          for (const each of ctx.world.aliveEntities()) {
            each.label = "hijacked";
          }
          const globals = ctx.world.globals;
          (globals.config as { nested: number[] }).nested.push(3);
          globals.injected = true;
          (ctx.world.getGlobal("config") as { nested: number[] }).nested.push(4);
          for (const event of ctx.events.due("pulse")) {
            (event.payload as { nested: { n: number } }).nested.n = 99;
          }
        }
      });
      registry.register({
        id: "observe",
        phase: "act",
        priority: 0,
        update(ctx) {
          observations.push({
            tick: ctx.tick,
            counter: ctx.world.getComponent<Counter>("a", "Counter"),
            entityIds: ctx.world.entitiesWith(["Counter"]),
            duePayloads: ctx.events.due("pulse").map((event) => event.payload),
            globals: ctx.world.globals
          });
        }
      });
    },
    registerMetrics: () => undefined,
    getVisuals: () => ({ components: {} })
  };
}
