import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ContinuousSpatialHashIndex, type ContinuousSpatialHashItem } from "../spatialIndex";

describe("ContinuousSpatialHashIndex", () => {
  it("queries radius results deterministically and does not mutate input items", () => {
    const items: ContinuousSpatialHashItem[] = [
      { id: "c", x: 20, y: 20 },
      { id: "a", x: 2, y: 2 },
      { id: "b", x: 5, y: 2 }
    ];
    const index = new ContinuousSpatialHashIndex({ width: 100, height: 100, cellSize: 10, topology: "closed" });
    index.addAll(items);
    items[1]!.x = 90;

    const query = index.queryRadius(2, 2, 4);

    expect(query.results.map((result) => result.id)).toEqual(["a", "b"]);
    expect(query.results[0]).toMatchObject({ id: "a", x: 2, y: 2, distance: 0 });
    expect(query.distanceChecks).toBeGreaterThan(0);
  });

  it("matches brute-force unique pairs for closed worlds", () => {
    const items: ContinuousSpatialHashItem[] = [
      { id: "a", x: 2, y: 2 },
      { id: "b", x: 6, y: 2 },
      { id: "c", x: 20, y: 20 },
      { id: "d", x: 22, y: 21 },
      { id: "e", x: 80, y: 80 }
    ];
    const radius = 5;
    const index = new ContinuousSpatialHashIndex({ width: 100, height: 100, cellSize: radius, topology: "closed" });
    index.addAll(items);

    expect(index.queryPairsWithinRadius(radius).pairs.map(pairKey)).toEqual(bruteForcePairs(items, radius, "closed", 100, 100));
  });

  it("excludes self from neighbor-id queries", () => {
    const index = new ContinuousSpatialHashIndex({ width: 20, height: 20, cellSize: 5, topology: "closed" });
    index.addAll([
      { id: "self", x: 4, y: 4 },
      { id: "near", x: 6, y: 4 },
      { id: "far", x: 18, y: 18 }
    ]);

    expect(index.queryNeighborIds("self", 3)).toEqual(["near"]);
  });

  it("handles wrap topology across world edges", () => {
    const index = new ContinuousSpatialHashIndex({ width: 10, height: 10, cellSize: 2, topology: "wrap" });
    index.addAll([
      { id: "a", x: 0.5, y: 5 },
      { id: "b", x: 9.5, y: 5 },
      { id: "c", x: 5, y: 5 }
    ]);

    const pairs = index.queryPairsWithinRadius(1.1).pairs;

    expect(index.queryNeighborIds("a", 1.1)).toEqual(["b"]);
    expect(pairs.map(pairKey)).toEqual(["a:b"]);
    expect(pairs[0]?.offset).toEqual({ x: -1, y: 0 });
    expect(pairs[0]?.distance).toBeCloseTo(1);
  });

  it("reduces candidate checks for local-radius pair queries", () => {
    const items = Array.from({ length: 100 }, (_, itemIndex) => ({
      id: `p${itemIndex.toString().padStart(3, "0")}`,
      x: (itemIndex % 10) * 10 + 1,
      y: Math.floor(itemIndex / 10) * 10 + 1
    }));
    const index = new ContinuousSpatialHashIndex({ width: 100, height: 100, cellSize: 5, topology: "closed" });
    index.addAll(items);

    const query = index.queryPairsWithinRadius(5);

    expect(query.distanceChecks).toBeLessThan((items.length * (items.length - 1)) / 2);
    expect(query.pairs).toHaveLength(0);
  });

  it("rejects invalid options, items, and query values", () => {
    expect(() => new ContinuousSpatialHashIndex({ width: 0, height: 10, cellSize: 1, topology: "closed" })).toThrow();
    expect(() => new ContinuousSpatialHashIndex({ width: 10, height: 10, cellSize: 0, topology: "closed" })).toThrow();
    expect(() => new ContinuousSpatialHashIndex({ width: 10, height: 10, cellSize: 1, topology: "closed", maxCells: 0 })).toThrow();
    const index = new ContinuousSpatialHashIndex({ width: 10, height: 10, cellSize: 1, topology: "closed" });
    expect(() => index.add({ id: "bad", x: Number.NaN, y: 1 })).toThrow();
    expect(() => index.addAll([{ id: "dupe", x: 1, y: 1 }, { id: "dupe", x: 2, y: 2 }])).toThrow();
    expect(() => index.queryRadius(1, 1, -1)).toThrow();
    expect(() => index.queryNeighborIds("missing", 1)).toThrow();
  });

  it("stays headless and avoids hidden randomness or dynamic execution", () => {
    const files = simulationFiles(join(process.cwd(), "src", "simulation", "spatialIndex"));
    const banned = [
      /from\s+["']react["']/,
      /from\s+["']zustand["']/,
      /\bdocument\./,
      /\bwindow\./,
      /\blocalStorage\b/,
      /\bnavigator\./,
      /\brequestAnimationFrame\b/,
      /\bCanvasRenderingContext2D\b/,
      /\bHTMLCanvasElement\b/,
      /\bMath\.random\b/,
      /\beval\s*\(/,
      /\bnew\s+Function\b/
    ];

    expect(files.filter((file) => banned.some((pattern) => pattern.test(readFileSync(file, "utf8"))))).toEqual([]);
  });
});

function pairKey(pair: { leftId: string; rightId: string }): string {
  return `${pair.leftId}:${pair.rightId}`;
}

function bruteForcePairs(
  items: readonly ContinuousSpatialHashItem[],
  radius: number,
  topology: "closed" | "wrap",
  width: number,
  height: number
): string[] {
  const radiusSquared = radius * radius;
  const pairs: string[] = [];
  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    const left = items[leftIndex]!;
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const right = items[rightIndex]!;
      const offset = delta(left, right, topology, width, height);
      if (offset.x * offset.x + offset.y * offset.y <= radiusSquared) {
        pairs.push(`${left.id}:${right.id}`);
      }
    }
  }
  return pairs;
}

function delta(
  from: ContinuousSpatialHashItem,
  to: ContinuousSpatialHashItem,
  topology: "closed" | "wrap",
  width: number,
  height: number
): { x: number; y: number } {
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  if (topology === "wrap") {
    if (Math.abs(dx) > width / 2) {
      dx -= Math.sign(dx) * width;
    }
    if (Math.abs(dy) > height / 2) {
      dy -= Math.sign(dy) * height;
    }
  }
  return { x: dx, y: dy };
}

function simulationFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return simulationFiles(path);
    }
    return path.endsWith(".ts") ? [path] : [];
  });
}
