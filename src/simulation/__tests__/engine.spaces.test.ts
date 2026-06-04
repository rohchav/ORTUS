import { describe, expect, it } from "vitest";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Grid2DSpace } from "../spaces/Grid2DSpace";
import { NetworkSpace } from "../spaces/NetworkSpace";

describe("spaces", () => {
  it("Continuous2DSpace places, moves, bounds, and queries radius", () => {
    const space = new Continuous2DSpace({ id: "c", width: 10, height: 10, boundaryMode: "clamp" });
    space.addEntity("a", { x: 1, y: 1 });
    space.addEntity("b", { x: 2, y: 1 });
    space.addEntity("c", { x: 9, y: 9 });

    space.move("a", { x: 20, y: -5 });
    expect(space.getPosition("a")).toEqual({ x: 10, y: 0 });
    expect(space.queryRadius({ x: 2, y: 1 }, 1.1).map((result) => result.entityId)).toEqual(["b"]);
    expect(space.queryNeighbors("b", 20).map((result) => result.entityId)).toEqual(["a", "c"]);
  });

  it("Continuous2DSpace enforces wrap and bounce bounds", () => {
    const wrap = new Continuous2DSpace({ id: "wrap", width: 10, height: 10, boundaryMode: "wrap" });
    wrap.addEntity("a", { x: 9, y: 1 });
    wrap.move("a", { x: 3, y: -4 });
    expect(wrap.getPosition("a")).toEqual({ x: 2, y: 7 });

    const bounce = new Continuous2DSpace({ id: "bounce", width: 10, height: 10, boundaryMode: "bounce" });
    bounce.addEntity("b", { x: 9, y: 1 });
    bounce.move("b", { x: 3, y: -4 });
    expect(bounce.getPosition("b")).toEqual({ x: 8, y: 3 });
  });

  it("Continuous2DSpace uses a reusable spatial index for local neighbor queries without changing results", () => {
    const space = new Continuous2DSpace({ id: "indexed", width: 100, height: 100, boundaryMode: "wrap" });
    for (let index = 0; index < 80; index += 1) {
      space.addEntity(`e-${index.toString().padStart(2, "0")}`, {
        x: (index % 10) * 9.5,
        y: Math.floor(index / 10) * 11.5
      });
    }

    const expected = bruteForceContinuousNeighbors(space, "e-00", 10);
    expect(space.queryNeighbors("e-00", 10).map((result) => result.entityId)).toEqual(expected);
    const afterFirst = space.queryDiagnostics();
    expect(afterFirst.spatialIndexQueries).toBe(1);
    expect(afterFirst.spatialIndexBuilds).toBe(1);
    expect(afterFirst.spatialIndexCandidateChecks).toBeLessThan(79);

    expect(space.queryNeighbors("e-01", 10).map((result) => result.entityId)).toEqual(bruteForceContinuousNeighbors(space, "e-01", 10));
    const afterSecond = space.queryDiagnostics();
    expect(afterSecond.spatialIndexQueries).toBe(2);
    expect(afterSecond.spatialIndexBuilds).toBe(1);

    space.moveEntity("e-10", { x: 99, y: 99 });
    expect(space.queryNeighbors("e-00", 10).map((result) => result.entityId)).toEqual(bruteForceContinuousNeighbors(space, "e-00", 10));
    expect(space.queryDiagnostics().spatialIndexBuilds).toBe(1);
  });

  it("Continuous2DSpace keeps all-pairs fallback for tiny or broad-radius queries", () => {
    const space = new Continuous2DSpace({ id: "fallback", width: 100, height: 100, boundaryMode: "clamp" });
    for (let index = 0; index < 20; index += 1) {
      space.addEntity(`e-${index.toString().padStart(2, "0")}`, { x: index * 2, y: index * 2 });
    }

    expect(space.queryNeighbors("e-00", 50).map((result) => result.entityId)).toEqual(bruteForceContinuousNeighbors(space, "e-00", 50));
    expect(space.queryDiagnostics()).toMatchObject({ allPairsQueries: 1, spatialIndexQueries: 0 });

    for (let index = 20; index < 80; index += 1) {
      space.addEntity(`e-${index.toString().padStart(2, "0")}`, { x: index, y: 100 - index });
    }
    expect(space.queryNeighbors("e-00", 75).map((result) => result.entityId)).toEqual(bruteForceContinuousNeighbors(space, "e-00", 75));
    expect(space.queryDiagnostics()).toMatchObject({ allPairsQueries: 1, spatialIndexQueries: 0 });
  });

  it("Grid2DSpace places entities and queries neighbors", () => {
    const grid = new Grid2DSpace({ id: "g", rows: 5, cols: 5, boundaryMode: "clamp" });
    grid.addEntity("a", { row: 2, col: 2 });
    grid.addEntity("b", { row: 2, col: 3 });
    grid.addEntity("c", { row: 4, col: 4 });

    expect(grid.entitiesAt({ row: 2, col: 3 })).toEqual(["b"]);
    grid.setCell("c", { row: 2, col: 1 });
    expect(grid.entitiesAt({ row: 2, col: 1 })).toEqual(["c"]);
    expect(grid.queryNeighbors("a", { includeDiagonals: false }).map((result) => result.entityId)).toEqual(["b", "c"]);
    expect(grid.neighbors({ row: 0, col: 0 }, { includeDiagonals: true })).toContainEqual({ row: 1, col: 1 });
  });

  it("NetworkSpace adds edges and queries neighbors and degrees", () => {
    const network = new NetworkSpace("n");
    network.addNode("a");
    network.addNode("b");
    network.addNode("c");
    network.addEdge("a", "b");
    network.addEdge("a", "c", 2, true);

    expect(network.neighbors("a")).toEqual(["b", "c"]);
    expect(network.neighbors("b")).toEqual(["a"]);
    expect(network.degree("a")).toBe(2);
    expect(network.getEdge("a", "c")?.weight).toBe(2);
    network.removeEdge("a", "b");
    expect(network.neighbors("a")).toEqual(["c"]);
    expect(network.neighbors("b")).toEqual([]);
    expect(network.getEdge("c", "a")).toBeUndefined();
  });
});

function bruteForceContinuousNeighbors(space: Continuous2DSpace, entityId: string, radius: number): string[] {
  const serialized = space.serialize();
  const origin = serialized.positions[entityId];
  if (!origin) {
    return [];
  }
  const radiusSquared = radius * radius;
  return Object.entries(serialized.positions)
    .filter(([candidateId]) => candidateId !== entityId)
    .map(([candidateId, point]) => {
      let dx = Math.abs(origin.x - point.x);
      let dy = Math.abs(origin.y - point.y);
      if (serialized.boundaryMode === "wrap") {
        dx = Math.min(dx, serialized.width - dx);
        dy = Math.min(dy, serialized.height - dy);
      }
      const distanceSquared = dx * dx + dy * dy;
      return { candidateId, distanceSquared };
    })
    .filter((candidate) => candidate.distanceSquared <= radiusSquared)
    .sort((left, right) => Math.sqrt(left.distanceSquared) - Math.sqrt(right.distanceSquared) || left.candidateId.localeCompare(right.candidateId))
    .map((candidate) => candidate.candidateId);
}
