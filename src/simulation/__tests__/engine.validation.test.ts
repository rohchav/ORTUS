import { describe, expect, it } from "vitest";
import { CommandBuffer } from "../kernel/CommandBuffer";
import { EventQueue } from "../kernel/EventQueue";
import { SimulationInvariantError, SimulationValidationError } from "../kernel/Errors";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SystemRegistry } from "../kernel/SystemRegistry";
import type { SimulationTemplate } from "../kernel/types";
import { assertWorldInvariants } from "../kernel/Invariants";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { epidemicTemplate, InfectionState } from "../templates/epidemic.template";

describe("validation and invariants", () => {
  it("rejects invalid parameters", () => {
    expect(
      () =>
        new SimulationEngine(epidemicTemplate, {
          parameters: {
            agentCount: 2,
            initialInfected: 3,
            infectionRadius: 5,
            infectionProbability: 1,
            recoveryTicks: 5,
            movementSpeed: 0
          }
        })
    ).toThrow();
  });

  it("rejects invalid nested imported snapshot state", () => {
    const engine = new SimulationEngine(epidemicTemplate, { seed: "invalid-import" });
    const snapshot = engine.snapshotExport();
    const firstSpace = snapshot.world.spaces[0];
    if (firstSpace?.kind !== "continuous2d") {
      throw new Error("Expected continuous space");
    }
    firstSpace.positions.e000001 = { x: Number.NaN, y: 0 };

    expect(() => engine.importSnapshot(snapshot)).toThrow();
  });

  it("rejects invalid imported nested component values, including destroyed entities", () => {
    const engine = new SimulationEngine(epidemicTemplate, { seed: "invalid-component" });
    const snapshot = engine.snapshotExport();
    const infectionComponents = snapshot.world.components[InfectionState];
    if (!infectionComponents?.e000001) {
      throw new Error("Expected infection component in snapshot");
    }
    const entity = snapshot.world.entities.entities.find((candidate) => candidate.id === "e000001");
    if (!entity) {
      throw new Error("Expected entity in snapshot");
    }
    entity.alive = false;
    entity.destroyedAtTick = 1;
    infectionComponents.e000001 = { status: "not-a-real-status" };

    expect(() => engine.importSnapshot(snapshot)).toThrow(SimulationValidationError);
  });

  it("rejects NaN positions", () => {
    const space = new Continuous2DSpace({ id: "bad", width: 10, height: 10, boundaryMode: "clamp" });
    expect(() => space.addEntity("a", { x: Number.NaN, y: 1 })).toThrow();
  });

  it("rejects duplicate system ids", () => {
    const template = baseTemplate({
      registerSystems(registry: SystemRegistry) {
        registry.register({ id: "dup", phase: "act", priority: 0, update: () => undefined });
        registry.register({ id: "dup", phase: "act", priority: 1, update: () => undefined });
      }
    });
    expect(() => new SimulationEngine(template)).toThrow();
  });

  it("rejects duplicate metric keys", () => {
    const template = baseTemplate({
      registerMetrics(registry) {
        registry.register({ key: "dup", label: "Dup", description: "Duplicate.", valueType: "number", collect: () => 1 });
        registry.register({ key: "dup", label: "Dup", description: "Duplicate.", valueType: "number", collect: () => 2 });
      }
    });
    expect(() => new SimulationEngine(template)).toThrow();
  });

  it("rejects events scheduled at negative ticks", () => {
    const queue = new EventQueue();
    expect(() =>
      queue.schedule({ id: "bad", type: "bad", scheduledTick: -1, payload: {}, createdAtTick: 0 })
    ).toThrow();
  });

  it("rejects components referencing missing entities", () => {
    const world = new World();
    world.componentStore.add("missing", "Position2D", { x: 1, y: 2 });
    expect(() => assertWorldInvariants(world)).toThrow();
  });

  it("rejects commands targeting missing entities", () => {
    const world = new World();
    const buffer = new CommandBuffer();
    buffer.add(
      { type: "destroyEntity", entityId: "missing" },
      { sourceSystemId: "test-system", tick: 0, reason: "missing target test" }
    );

    expect(() => buffer.apply(world)).toThrow(SimulationInvariantError);
  });

  it("rejects commands targeting destroyed entities unless no-op is explicit", () => {
    const world = new World();
    world.entityStore.create("agent", { id: "dead", createdAtTick: 0 });
    world.entityStore.destroy("dead", 1);

    const invalid = new CommandBuffer();
    invalid.add(
      { type: "setComponent", entityId: "dead", componentType: "Any", value: {} },
      { sourceSystemId: "test-system", tick: 2 }
    );
    expect(() => invalid.apply(world)).toThrow(SimulationInvariantError);

    const allowed = new CommandBuffer();
    allowed.add(
      { type: "destroyEntity", entityId: "dead", allowMissing: true },
      { sourceSystemId: "test-system", tick: 2 }
    );
    expect(() => allowed.apply(world)).not.toThrow();
  });

  it("rejects commands with invalid component values and preserves command metadata", () => {
    const world = new World();
    world.entityStore.create("agent", { id: "a", createdAtTick: 0 });
    const invalid = new CommandBuffer();

    expect(() =>
      invalid.add(
        { type: "addComponent", entityId: "a", componentType: "Bad", value: { x: Number.NaN } },
        { sourceSystemId: "bad-system", tick: 1 }
      )
    ).toThrow(SimulationValidationError);

    const valid = new CommandBuffer();
    valid.add(
      { type: "addComponent", entityId: "a", componentType: "Good", value: { x: 1 } },
      { sourceSystemId: "good-system", tick: 1, reason: "metadata test" }
    );
    valid.apply(world);

    expect(valid.recent(1)[0]?.metadata).toEqual({
      sourceSystemId: "good-system",
      tick: 1,
      reason: "metadata test"
    });
  });

  it("validates and applies batched component and movement commands deterministically", () => {
    const world = new World();
    world.entityStore.create("agent", { id: "a", createdAtTick: 0 });
    world.entityStore.create("agent", { id: "b", createdAtTick: 0 });
    world.componentStore.add("a", "Position2D", { x: 0, y: 0 });
    world.componentStore.add("b", "Position2D", { x: 1, y: 1 });
    const space = new Continuous2DSpace({ id: "space", width: 100, height: 100, boundaryMode: "wrap" });
    world.addSpace(space);
    space.addEntity("a", { x: 0, y: 0 });
    space.addEntity("b", { x: 1, y: 1 });

    const valid = new CommandBuffer();
    valid.add(
      {
        type: "setComponents",
        componentType: "Position2D",
        values: {
          b: { x: 20, y: 21 },
          a: { x: 10, y: 11 }
        }
      },
      { sourceSystemId: "batch-system", tick: 1 }
    );
    valid.add(
      {
        type: "moveEntities",
        spaceId: "space",
        locations: {
          b: { x: 20, y: 21 },
          a: { x: 10, y: 11 }
        }
      },
      { sourceSystemId: "batch-system", tick: 1 }
    );
    expect(() => valid.apply(world)).not.toThrow();
    expect(world.componentStore.get("a", "Position2D")).toEqual({ x: 10, y: 11 });
    expect(space.getPosition("b")).toEqual({ x: 20, y: 21 });

    const invalidComponent = new CommandBuffer();
    expect(() =>
      invalidComponent.add(
        { type: "setComponents", componentType: "Position2D", values: { a: { x: Number.NaN, y: 0 } } },
        { sourceSystemId: "batch-system", tick: 2 }
      )
    ).toThrow(SimulationValidationError);

    const missingTarget = new CommandBuffer();
    missingTarget.add(
      { type: "moveEntities", spaceId: "space", locations: { missing: { x: 1, y: 2 } } },
      { sourceSystemId: "batch-system", tick: 2 }
    );
    expect(() => missingTarget.apply(world)).toThrow(SimulationInvariantError);
  });
});

function baseTemplate(overrides: Partial<SimulationTemplate>): SimulationTemplate {
  return {
    id: "validation-template",
    name: "Validation Template",
    description: "Validation test.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Validation.",
      entities: [],
      stateVariables: [],
      processOverview: "No behavior.",
      scheduling: "No behavior.",
      designConcepts: {},
      initialization: "Empty.",
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
