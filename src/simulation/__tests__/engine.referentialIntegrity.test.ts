import { afterEach, describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationInvariantError, SimulationValidationError } from "../kernel/Errors";
import type { SerializedSpace, SimulationTemplate, SnapshotExport } from "../kernel/types";
import { World } from "../kernel/World";
import { RuntimeSession } from "../runtime/RuntimeSession";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Grid2DSpace } from "../spaces/Grid2DSpace";
import { NetworkSpace } from "../spaces/NetworkSpace";
import { createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld/scenario";
import { epidemicTemplate, EPIDEMIC_SPACE_ID, Position2D } from "../templates/epidemic.template";
import { flockingTemplate, FLOCKING_SPACE_ID } from "../templates/flocking.template";
import { opinionTemplate, OPINION_SPACE_ID } from "../templates/opinion.template";
import { predatorPreyTemplate, PREDATOR_PREY_SPACE_ID } from "../templates/predatorPrey.template";
import { productionTemplates } from "../templates/registry";
import { GroupIdentity, schellingTemplate, SCHELLING_SPACE_ID } from "../templates/schelling.template";
import { useSimulationStore } from "../../state/simulationStore";

// A restored world must satisfy the structural invariants that execution maintains: every member of
// every space is a live entity (destroyEntity removes an entity from all spaces, and placement and
// movement require a live entity), and network edges join member nodes. Which live entities must be
// placed in which space is template knowledge, checked by each template's validateWorld.
describe("space membership referential integrity", () => {
  describe("kernel invariant: every space member is a live entity", () => {
    const tamperings: Array<[string, (snapshot: SnapshotExport) => void, RegExp]> = [
      ["a missing entity in a continuous space", (snapshot) => { positionsOf(snapshot, "field").ghost = { x: 1, y: 1 }; }, /Space field contains missing entity ghost/],
      ["a destroyed entity in a continuous space", (snapshot) => { markDestroyed(snapshot, "f1"); }, /Space field contains destroyed entity f1/],
      ["a missing entity in a grid space", (snapshot) => { cellsOf(snapshot, "grid").ghost = { row: 0, col: 0 }; }, /Space grid contains missing entity ghost/],
      ["a destroyed entity in a grid space", (snapshot) => { markDestroyed(snapshot, "g1"); }, /Space grid contains destroyed entity g1/],
      ["a network node that is not an entity", (snapshot) => { networkOf(snapshot, "net").nodes.push("ghost"); }, /Space net contains missing entity ghost/],
      ["a network node whose entity was destroyed", (snapshot) => { markDestroyed(snapshot, "n1"); }, /Space net contains destroyed entity n1/],
      [
        "a network edge to a node that does not exist",
        (snapshot) => { networkOf(snapshot, "net").edges.push({ source: "n1", target: "ghost", directed: true }); },
        /Both network edge endpoints must exist/
      ]
    ];

    it.each(tamperings)("rejects a restored world holding %s", (_label, tamper, message) => {
      const snapshot = membershipEngine().snapshotExport();
      tamper(snapshot);

      expect(() => SimulationEngine.fromSnapshot(membershipTemplate(), snapshot)).toThrow(SimulationInvariantError);
      expect(() => SimulationEngine.fromSnapshot(membershipTemplate(), snapshot)).toThrow(message);
    });

    it.each(tamperings)("leaves the current run untouched when importing a world holding %s", (_label, tamper) => {
      const engine = membershipEngine();
      engine.applyCommands([{ type: "moveEntity", spaceId: "field", entityId: "f2", location: { x: 7, y: 7 } }]);
      const snapshot = engine.snapshotExport();
      tamper(snapshot);
      const before = engine.world.serialize();

      expect(() => engine.importSnapshot(JSON.stringify(snapshot))).toThrow();

      expect(engine.world.serialize()).toEqual(before);
      expect(engine.failure).toBeUndefined();
      expect(() => engine.step()).not.toThrow();
    });

    it("rejects a template that builds a world with a missing space member, not only imports", () => {
      const template = membershipTemplate({ ghostInField: true });

      expect(() => new SimulationEngine(template, { seed: "fresh" })).toThrow(/Space field contains missing entity ghost/);
    });

    it("removes destroyed entities from every space and round-trips the result", () => {
      const engine = membershipEngine();
      engine.applyCommands([
        { type: "destroyEntity", entityId: "f1" },
        { type: "destroyEntity", entityId: "g1" },
        { type: "destroyEntity", entityId: "n1" }
      ]);
      const snapshot = engine.snapshotExport();

      expect(positionsOf(snapshot, "field")).not.toHaveProperty("f1");
      expect(cellsOf(snapshot, "grid")).not.toHaveProperty("g1");
      expect(networkOf(snapshot, "net")).toEqual({ id: "net", kind: "network", nodes: ["n2"], edges: [] });
      expect(snapshot.world.entities.entities.filter((entity) => !entity.alive).map((entity) => entity.id)).toEqual(["f1", "g1", "n1"]);

      const restored = SimulationEngine.fromSnapshot(membershipTemplate(), snapshot);
      expect(restored.world.serialize()).toEqual(engine.world.serialize());
    });
  });

  describe.each(productionTemplates.map((template) => [template.id, template] as const))("%s snapshot import", (_templateId, template) => {
    it("rejects a destroyed entity left in each of the template's spaces", () => {
      const genuine = genuineSnapshot(template);

      for (const space of genuine.world.spaces) {
        const snapshot = structuredClone(genuine);
        const member = firstMember(space);
        markDestroyed(snapshot, member);

        // An entity placed in several spaces (Neural neurons) is reported for the first space checked.
        expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(new RegExp(`Space \\S+ contains destroyed entity ${member}$`));
      }
    });

    it("rejects an entity id that does not exist in each of the template's spaces", () => {
      const genuine = genuineSnapshot(template);

      for (const space of genuine.world.spaces) {
        const snapshot = structuredClone(genuine);
        addMember(spaceIn(snapshot, space.id), "e999999");

        expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(`Space ${space.id} contains missing entity e999999`);
      }
    });

    it("rejects a live entity missing from a space its template requires", () => {
      const genuine = genuineSnapshot(template);

      for (const space of genuine.world.spaces) {
        const snapshot = structuredClone(genuine);
        const member = firstMember(space);
        removeMember(spaceIn(snapshot, space.id), member);

        expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(SimulationValidationError);
        expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(/missing/);
      }
    });
  });

  // Templates whose systems read their space member by member also require the reverse direction: every
  // member is one of the template's live agents. (Forest Fire and Neural index their cells and neurons
  // directly; an extra live member there is inert, and their existing placement checks are unchanged.)
  describe.each([
    [epidemicTemplate, EPIDEMIC_SPACE_ID, Position2D],
    [opinionTemplate, OPINION_SPACE_ID, Position2D],
    [predatorPreyTemplate, PREDATOR_PREY_SPACE_ID, Position2D],
    [flockingTemplate, FLOCKING_SPACE_ID, Position2D],
    [schellingTemplate, SCHELLING_SPACE_ID, GroupIdentity]
  ] as const)("$id space members are exactly its agents", (template, spaceId, agentComponent) => {
    it("rejects a live entity that is not an agent placed in the space", () => {
      const snapshot = genuineSnapshot(template);
      snapshot.world.entities.entities.push({ id: "e999999", archetype: "stranger", alive: true, createdAtTick: 0 });
      const space = spaceIn(snapshot, spaceId);
      if (space.kind === "grid2d") {
        // An otherwise consistent occupant: a free cell and a matching PositionGrid component.
        const cell = freeCell(space);
        space.cells.e999999 = cell;
        snapshot.world.components.PositionGrid!.e999999 = cell;
      } else {
        addMember(space, "e999999");
      }

      expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(SimulationValidationError);
      expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(`Space ${spaceId} contains unexpected member e999999`);
    });

    it("rejects a placed agent stripped of the component that makes it an agent", () => {
      const snapshot = genuineSnapshot(template);
      const member = firstMember(spaceIn(snapshot, spaceId));
      delete snapshot.world.components[agentComponent]![member];

      expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(`Space ${spaceId} contains unexpected member ${member}`);
    });

    it("rejects a same-id space of the wrong kind", () => {
      const snapshot = genuineSnapshot(template);
      const index = snapshot.world.spaces.findIndex((space) => space.id === spaceId);
      snapshot.world.spaces[index] = { id: spaceId, kind: "network", nodes: [], edges: [] };

      expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow(SimulationValidationError);
    });
  });

  describe("consequences that stale membership used to have", () => {
    afterEach(() => {
      useSimulationStore.getState().selectTemplate("epidemic-spread");
    });

    it("an Opinion agent destroyed but left in the space can no longer influence its neighbours", () => {
      const snapshot = genuineSnapshot(opinionTemplate, { agentCount: 60 });
      const member = firstMember(spaceIn(snapshot, OPINION_SPACE_ID));
      markDestroyed(snapshot, member);
      // Before the invariant this imported and ran: the dead agent kept its OpinionState, the space
      // still returned it from queryNeighbors, and averageOpinion diverged from the genuine run.

      expect(() => SimulationEngine.fromSnapshot(opinionTemplate, snapshot)).toThrow(`Space ${OPINION_SPACE_ID} contains destroyed entity ${member}`);
    });

    it("a Schelling agent destroyed but left on the grid can no longer occupy a cell or count as a neighbour", () => {
      const snapshot = genuineSnapshot(schellingTemplate);
      const member = firstMember(spaceIn(snapshot, SCHELLING_SPACE_ID));
      markDestroyed(snapshot, member);

      expect(() => SimulationEngine.fromSnapshot(schellingTemplate, snapshot)).toThrow(`Space ${SCHELLING_SPACE_ID} contains destroyed entity ${member}`);
    });

    it("keeps a genuine Predator-Prey run with destroyed entities importable and deterministic", () => {
      const original = new SimulationEngine(predatorPreyTemplate, { seed: "referential-deaths" });
      original.runSteps(60);
      const snapshot = original.snapshotExport();
      const destroyed = snapshot.world.entities.entities.filter((entity) => !entity.alive).map((entity) => entity.id);
      const placed = Object.keys(positionsOf(snapshot, snapshot.world.spaces[0]!.id));

      expect(destroyed.length).toBeGreaterThan(0);
      expect(placed.filter((entityId) => destroyed.includes(entityId))).toEqual([]);

      const restored = SimulationEngine.fromSnapshot(predatorPreyTemplate, snapshot);
      original.runSteps(20);
      restored.runSteps(20);
      expect(restored.createSnapshot()).toEqual(original.createSnapshot());
    });

    it("rejects the paste import before replacing the current main-thread run", () => {
      const store = useSimulationStore;
      store.getState().selectTemplate("opinion-dynamics");
      const engine = store.getState().engine!;
      engine.runSteps(2);
      const snapshot = engine.snapshotExport();
      const member = firstMember(spaceIn(snapshot, OPINION_SPACE_ID));
      markDestroyed(snapshot, member);

      store.getState().setImportMode("snapshot");
      store.getState().setImportText(JSON.stringify(snapshot));
      store.getState().importJson();

      expect(store.getState().lastError).toEqual({
        area: "file",
        text: `Import failed: Space ${OPINION_SPACE_ID} contains destroyed entity ${member}`
      });
      expect(store.getState().engine).toBe(engine);
      expect(engine.world.tick).toBe(2);
    });

    it("rejects the Worker runtime import before replacing the session's run", () => {
      const session = new RuntimeSession("local", () => 0);
      session.rebuild({ runId: "valid", runConfig: createImmersiveFlockingRunConfig(100) }, { generation: 1, runId: "valid" }, "initialization");
      session.advance(3, "step");
      const exported = JSON.parse(session.exportArtifact("snapshot")) as SnapshotExport;
      const member = firstMember(exported.world.spaces[0]!);
      markDestroyed(exported, member);

      expect(() => session.importArtifact({ runId: "tampered", kind: "snapshot", json: JSON.stringify(exported) }, { generation: 2, runId: "tampered" }))
        .toThrow(/contains destroyed entity/);

      expect(session.currentIdentity()).toEqual({ generation: 1, runId: "valid" });
      expect(session.advance(1, "step").frame.tick).toBe(4);
    });
  });
});

function genuineSnapshot(template: SimulationTemplate, parameters: Record<string, number> = {}): SnapshotExport {
  const engine = new SimulationEngine(template, { seed: `referential-${template.id}`, parameters });
  engine.runSteps(3);
  return engine.snapshotExport();
}

function spaceIn(snapshot: SnapshotExport, spaceId: string): SerializedSpace {
  const space = snapshot.world.spaces.find((candidate) => candidate.id === spaceId);
  if (!space) {
    throw new Error(`No space ${spaceId}`);
  }
  return space;
}

function positionsOf(snapshot: SnapshotExport, spaceId: string): Record<string, { x: number; y: number }> {
  const space = spaceIn(snapshot, spaceId);
  if (space.kind !== "continuous2d") {
    throw new Error(`${spaceId} is not continuous`);
  }
  return space.positions;
}

function cellsOf(snapshot: SnapshotExport, spaceId: string): Record<string, { row: number; col: number }> {
  const space = spaceIn(snapshot, spaceId);
  if (space.kind !== "grid2d") {
    throw new Error(`${spaceId} is not a grid`);
  }
  return space.cells;
}

function networkOf(snapshot: SnapshotExport, spaceId: string): Extract<SerializedSpace, { kind: "network" }> {
  const space = spaceIn(snapshot, spaceId);
  if (space.kind !== "network") {
    throw new Error(`${spaceId} is not a network`);
  }
  return space;
}

function firstMember(space: SerializedSpace): string {
  const members = space.kind === "continuous2d" ? Object.keys(space.positions) : space.kind === "grid2d" ? Object.keys(space.cells) : space.nodes;
  const first = [...members].sort()[0];
  if (!first) {
    throw new Error(`Space ${space.id} has no members`);
  }
  return first;
}

function addMember(space: SerializedSpace, entityId: string): void {
  if (space.kind === "continuous2d") {
    space.positions[entityId] = { x: 0, y: 0 };
  } else if (space.kind === "grid2d") {
    space.cells[entityId] = { row: 0, col: 0 };
  } else {
    space.nodes.push(entityId);
  }
}

function freeCell(space: Extract<SerializedSpace, { kind: "grid2d" }>): { row: number; col: number } {
  const occupied = new Set(Object.values(space.cells).map((cell) => `${cell.row}:${cell.col}`));
  for (let row = 0; row < space.rows; row += 1) {
    for (let col = 0; col < space.cols; col += 1) {
      if (!occupied.has(`${row}:${col}`)) {
        return { row, col };
      }
    }
  }
  throw new Error(`Grid ${space.id} has no free cell`);
}

function removeMember(space: SerializedSpace, entityId: string): void {
  if (space.kind === "continuous2d") {
    delete space.positions[entityId];
  } else if (space.kind === "grid2d") {
    delete space.cells[entityId];
  } else {
    space.nodes = space.nodes.filter((node) => node !== entityId);
    space.edges = space.edges.filter((edge) => edge.source !== entityId && edge.target !== entityId);
  }
}

function markDestroyed(snapshot: SnapshotExport, entityId: string): void {
  const entity = snapshot.world.entities.entities.find((candidate) => candidate.id === entityId);
  if (!entity) {
    throw new Error(`No entity ${entityId}`);
  }
  entity.alive = false;
  entity.destroyedAtTick = snapshot.tick;
}

function membershipEngine(): SimulationEngine {
  return new SimulationEngine(membershipTemplate(), { seed: "membership" });
}

function membershipTemplate(options: { ghostInField?: boolean } = {}): SimulationTemplate {
  return {
    id: "space-membership",
    name: "Space Membership",
    description: "Kernel space-membership integrity test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Exercise space membership integrity across space kinds.",
      entities: ["agent"],
      stateVariables: [],
      processOverview: "No systems.",
      scheduling: "None.",
      designConcepts: {},
      initialization: "Two entities per space kind, and one network edge.",
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
      for (const [id, space] of [["f1", "field"], ["f2", "field"], ["g1", "grid"], ["g2", "grid"], ["n1", "net"], ["n2", "net"]] as const) {
        world.entityStore.create("agent", { id, createdAtTick: 0 });
        if (space === "field") {
          field.addEntity(id, { x: 1, y: 1 });
        } else if (space === "grid") {
          grid.addEntity(id, { row: 1, col: id === "g1" ? 1 : 2 });
        } else {
          net.addEntity(id);
        }
      }
      net.addEdge("n1", "n2", 1, false);
      if (options.ghostInField) {
        field.addEntity("ghost", { x: 2, y: 2 });
      }
      return world;
    },
    registerSystems: () => undefined,
    registerMetrics: () => undefined,
    getVisuals: () => ({ components: {} })
  };
}
