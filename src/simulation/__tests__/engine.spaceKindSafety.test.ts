import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationInvariantError, SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import type { Command, SimulationTemplate } from "../kernel/types";
import { parseSnapshot } from "../kernel/Validation";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Grid2DSpace } from "../spaces/Grid2DSpace";
import { NetworkSpace } from "../spaces/NetworkSpace";

describe("space and location kind safety", () => {
  it("places and moves entities in continuous and grid spaces with matching locations", () => {
    const engine = spacesEngine();

    engine.applyCommands([
      { type: "createEntity", entityId: "c", archetype: "agent", spaceLocations: { field: { x: 1, y: 2 }, grid: { row: 3, col: 4 } } },
      { type: "moveEntity", spaceId: "field", entityId: "c", location: { x: 5, y: 6 } },
      { type: "moveEntities", spaceId: "grid", locations: { c: { row: 1, col: 1 } } }
    ]);

    expect(engine.world.getSpace<Continuous2DSpace>("field")?.getPosition("c")).toEqual({ x: 5, y: 6 });
    expect(engine.world.getSpace<Grid2DSpace>("grid")?.getCell("c")).toEqual({ row: 1, col: 1 });
    expect(engine.failure).toBeUndefined();
  });

  it("keeps network membership on network commands: edges between member nodes and removal on destroy", () => {
    const engine = spacesEngine();

    engine.applyCommands([{ type: "addEdge", spaceId: "net", source: "n1", target: "n2", weight: 2 }]);
    expect(engine.world.view().network("net")?.neighbors("n1")).toEqual(["n2"]);

    engine.applyCommands([{ type: "destroyEntity", entityId: "n2" }]);
    expect(engine.world.view().network("net")?.serialize()).toEqual({ id: "net", kind: "network", nodes: ["n1"], edges: [] });
  });

  it("rejects the Phase 1 corruption path: point locations routed into a network space", () => {
    const engine = spacesEngine();
    const networkBefore = engine.world.getSpace("net")!.serialize();

    expect(() =>
      engine.applyCommands([
        { type: "createEntity", entityId: "p1", archetype: "agent", spaceLocations: { net: { x: 1, y: 2 } } },
        { type: "createEntity", entityId: "p2", archetype: "agent", spaceLocations: { net: { x: 3, y: 4 } } }
      ])
    ).toThrow(/net is a network/);

    // Previously the network stored {x, y} objects as node ids and the post-apply invariant check
    // crashed with "TypeError: left.localeCompare is not a function".
    expect(engine.world.entityStore.has("p1")).toBe(false);
    expect(engine.world.getSpace("net")!.serialize()).toEqual(networkBefore);
    expect(() => engine.world.serialize()).not.toThrow();
  });

  it("rejects wrong-kind locations for continuous and grid spaces before creating the entity", () => {
    for (const [spaceId, location, message] of [
      ["field", { row: 1, col: 2 }, /continuous2d space field requires a finite \{x, y\} point/],
      ["grid", { x: 1.5, y: 2 }, /grid2d space grid requires an integer \{row, col\} cell/]
    ] as const) {
      const engine = spacesEngine();
      expect(() =>
        engine.applyCommands([
          { type: "createEntity", entityId: "bad", archetype: "agent", components: { Tag: { v: 1 } }, spaceLocations: { [spaceId]: location } }
        ])
      ).toThrow(message);
      expect(engine.world.entityStore.has("bad")).toBe(false);
      expect(engine.world.componentStore.has("bad", "Tag")).toBe(false);
    }
  });

  it("rejects a createEntity with one invalid location among several without touching any space", () => {
    const engine = spacesEngine();
    const before = engine.world.serialize();

    // Sorted placement order is field, grid, net: the valid field and grid placements come first.
    expect(() =>
      engine.applyCommands([
        {
          type: "createEntity",
          entityId: "multi",
          archetype: "agent",
          spaceLocations: { field: { x: 1, y: 1 }, grid: { row: 1, col: 1 }, net: { x: 0, y: 0 } }
        }
      ])
    ).toThrow(SimulationValidationError);

    const after = engine.world.serialize();
    expect(after.entities).toEqual(before.entities);
    expect(after.spaces).toEqual(before.spaces);
  });

  it("rejects placement into a missing space before creating the entity", () => {
    const engine = spacesEngine();

    expect(() =>
      engine.applyCommands([{ type: "createEntity", entityId: "lost", archetype: "agent", components: { Tag: { v: 1 } }, spaceLocations: { nowhere: { x: 1, y: 1 } } }])
    ).toThrow(SimulationInvariantError);

    expect(engine.world.entityStore.has("lost")).toBe(false);
    expect(engine.world.componentStore.has("lost", "Tag")).toBe(false);
  });

  it("rejects moves into a network space and wrong-kind batch moves before moving anyone", () => {
    const toNetwork = spacesEngine();
    expect(() => toNetwork.applyCommands([{ type: "moveEntity", spaceId: "net", entityId: "n1", location: { x: 1, y: 1 } }])).toThrow(
      /net is a network/
    );

    const batch = spacesEngine();
    const before = batch.world.getSpace("field")!.serialize();
    expect(() =>
      batch.applyCommands([{ type: "moveEntities", spaceId: "field", locations: { f1: { x: 9, y: 9 }, f2: { row: 1, col: 1 } } }])
    ).toThrow(/continuous2d space field requires/);
    expect(batch.world.getSpace("field")!.serialize()).toEqual(before);
  });

  it("rejects locations that are neither points nor cells at command validation, before anything applies", () => {
    const engine = spacesEngine();
    const commands: Command[] = [
      { type: "createEntity", entityId: "odd", archetype: "agent", spaceLocations: { field: { lat: 1, lon: 2 } as never } }
    ];

    expect(() => engine.applyCommands(commands)).toThrow(SimulationValidationError);
    expect(() =>
      engine.applyCommands([{ type: "moveEntities", spaceId: "field", locations: { f1: {} as never } }])
    ).toThrow(SimulationValidationError);

    expect(engine.failure).toBeUndefined();
    expect(engine.world.entityStore.has("odd")).toBe(false);
  });

  it("keeps a network node identical to its entity id", () => {
    const network = new NetworkSpace("n");
    network.addEntity("a");

    expect(() => network.addEntity("b", "a")).toThrow(SimulationValidationError);
    expect(() => network.addEntity("c", { x: 1, y: 2 } as never)).toThrow(SimulationValidationError);
    expect(network.serialize().nodes).toEqual(["a"]);
  });

  it("rejects imported snapshots whose space state has the wrong location representation", () => {
    const engine = spacesEngine();
    const snapshot = engine.snapshotExport();
    const withGridCellInField = structuredClone(snapshot);
    const field = withGridCellInField.world.spaces.find((space) => space.id === "field")!;
    (field as { positions: Record<string, unknown> }).positions.f1 = { row: 1, col: 1 };
    const withObjectNode = structuredClone(snapshot);
    const net = withObjectNode.world.spaces.find((space) => space.id === "net")!;
    (net as { nodes: unknown[] }).nodes.push({ x: 1, y: 2 });

    expect(() => parseSnapshot(withGridCellInField)).toThrow(SimulationSerializationError);
    expect(() => parseSnapshot(withObjectNode)).toThrow(SimulationSerializationError);
    expect(() => parseSnapshot(snapshot)).not.toThrow();
  });
});

function spacesEngine(): SimulationEngine {
  return new SimulationEngine(spacesTemplate(), { seed: "spaces" });
}

function spacesTemplate(): SimulationTemplate {
  return {
    id: "space-kind-safety",
    name: "Space Kind Safety",
    description: "Kernel space kind-safety test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Exercise location validation across space kinds.",
      entities: ["agent"],
      stateVariables: [],
      processOverview: "No systems.",
      scheduling: "None.",
      designConcepts: {},
      initialization: "Two entities per space kind.",
      submodels: [],
      assumptions: [],
      limitations: []
    },
    createInitialWorld: () => {
      const world = new World();
      const field = new Continuous2DSpace({ id: "field", width: 10, height: 10, boundaryMode: "wrap" });
      const grid = new Grid2DSpace({ id: "grid", rows: 5, cols: 5, boundaryMode: "clamp" });
      const net = new NetworkSpace("net");
      world.addSpace(field);
      world.addSpace(grid);
      world.addSpace(net);
      for (const id of ["f1", "f2"]) {
        world.entityStore.create("agent", { id, createdAtTick: 0 });
        field.addEntity(id, { x: 1, y: 1 });
      }
      for (const id of ["n1", "n2"]) {
        world.entityStore.create("agent", { id, createdAtTick: 0 });
        net.addEntity(id);
      }
      return world;
    },
    registerSystems: () => undefined,
    registerMetrics: () => undefined,
    getVisuals: () => ({ components: {} })
  };
}
