import { describe, expect, it } from "vitest";
import { SpatialHashGrid, type SpatialHashGridItem } from "../spaces/SpatialHashGrid";

describe("SpatialHashGrid", () => {
  it("queries radius results deterministically without mutating input items", () => {
    const items: SpatialHashGridItem[] = [
      { id: "c", position: { x: 20, y: 20 } },
      { id: "a", position: { x: 2, y: 2 } },
      { id: "b", position: { x: 5, y: 2 } }
    ];
    const grid = new SpatialHashGrid({ width: 100, height: 100, cellSize: 10, boundaryMode: "clamp" });
    grid.addAll(items);
    items[1]!.position.x = 90;

    const query = grid.queryRadius({ x: 2, y: 2 }, 4);

    expect(query.results.map((result) => result.id)).toEqual(["a", "b"]);
    expect(query.results[0]?.position).toEqual({ x: 2, y: 2 });
    expect(query.distanceChecks).toBeGreaterThan(0);
  });

  it("matches brute-force unique pairs for closed continuous worlds", () => {
    const items: SpatialHashGridItem[] = [
      { id: "a", position: { x: 2, y: 2 } },
      { id: "b", position: { x: 6, y: 2 } },
      { id: "c", position: { x: 20, y: 20 } },
      { id: "d", position: { x: 22, y: 21 } },
      { id: "e", position: { x: 80, y: 80 } }
    ];
    const radius = 5;
    const grid = new SpatialHashGrid({ width: 100, height: 100, cellSize: radius, boundaryMode: "clamp" });
    grid.addAll(items);

    expect(grid.queryPairsWithinRadius(radius).pairs.map(pairKey)).toEqual(bruteForcePairs(items, radius));
  });

  it("handles wrapped distances across world edges", () => {
    const grid = new SpatialHashGrid({ width: 10, height: 10, cellSize: 2, boundaryMode: "wrap" });
    grid.addAll([
      { id: "a", position: { x: 0.5, y: 5 } },
      { id: "b", position: { x: 9.5, y: 5 } },
      { id: "c", position: { x: 5, y: 5 } }
    ]);

    const pairs = grid.queryPairsWithinRadius(1.1).pairs;

    expect(pairs.map(pairKey)).toEqual(["a:b"]);
    expect(pairs[0]?.offset).toEqual({ x: -1, y: 0 });
    expect(pairs[0]?.distance).toBeCloseTo(1);
  });

  it("reduces distance checks for local-radius pair queries", () => {
    const items = Array.from({ length: 100 }, (_, index) => ({
      id: `p${index.toString().padStart(3, "0")}`,
      position: { x: (index % 10) * 10 + 1, y: Math.floor(index / 10) * 10 + 1 }
    }));
    const grid = new SpatialHashGrid({ width: 100, height: 100, cellSize: 5, boundaryMode: "clamp" });
    grid.addAll(items);

    const query = grid.queryPairsWithinRadius(5);

    expect(query.distanceChecks).toBeLessThan((items.length * (items.length - 1)) / 2);
    expect(query.pairs).toHaveLength(0);
  });

  it("rejects invalid grid configuration and query values", () => {
    expect(() => new SpatialHashGrid({ width: 0, height: 10, cellSize: 1, boundaryMode: "clamp" })).toThrow();
    expect(() => new SpatialHashGrid({ width: 10, height: 10, cellSize: 0, boundaryMode: "clamp" })).toThrow();
    const grid = new SpatialHashGrid({ width: 10, height: 10, cellSize: 1, boundaryMode: "clamp" });
    expect(() => grid.add({ id: "bad", position: { x: Number.NaN, y: 1 } })).toThrow();
    expect(() => grid.queryRadius({ x: 1, y: 1 }, -1)).toThrow();
  });
});

function pairKey(pair: { leftId: string; rightId: string }): string {
  return `${pair.leftId}:${pair.rightId}`;
}

function bruteForcePairs(items: readonly SpatialHashGridItem[], radius: number): string[] {
  const radiusSquared = radius * radius;
  const pairs: string[] = [];
  const sorted = [...items].sort((left, right) => left.id.localeCompare(right.id));
  for (let leftIndex = 0; leftIndex < sorted.length; leftIndex += 1) {
    const left = sorted[leftIndex]!;
    for (let rightIndex = leftIndex + 1; rightIndex < sorted.length; rightIndex += 1) {
      const right = sorted[rightIndex]!;
      const dx = right.position.x - left.position.x;
      const dy = right.position.y - left.position.y;
      if (dx * dx + dy * dy <= radiusSquared) {
        pairs.push(`${left.id}:${right.id}`);
      }
    }
  }
  return pairs;
}
