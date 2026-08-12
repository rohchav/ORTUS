import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { SimulationTemplate } from "../kernel/types";
import {
  flockingTemplate,
  registerFlockingSystemsWithNeighborStrategy,
  type FlockingNeighborExecutionStrategy
} from "../templates/flocking.template";
import {
  ContinuousSpatialHashIndex,
  type ContinuousSpatialHashItem,
  type ContinuousSpatialHashTopology
} from "../spatialIndex";

describe("Flocking neighbor-search equivalence", () => {
  it("matches reference membership, offsets, distances, and pair order for adversarial states", () => {
    const cases: Array<{
      label: string;
      topology: ContinuousSpatialHashTopology;
      radius: number;
      items: ContinuousSpatialHashItem[];
    }> = [
      { label: "zero agents", topology: "closed", radius: 5, items: [] },
      { label: "one agent", topology: "closed", radius: 5, items: [{ id: "a", x: 5, y: 5 }] },
      {
        label: "sparse agents",
        topology: "closed",
        radius: 4,
        items: [{ id: "a", x: 1, y: 1 }, { id: "b", x: 50, y: 50 }, { id: "c", x: 90, y: 10 }]
      },
      {
        label: "dense same-position cluster",
        topology: "closed",
        radius: 0,
        items: Array.from({ length: 12 }, (_, index) => ({ id: id(index), x: 20, y: 20 }))
      },
      {
        label: "exact, inside, and outside radius",
        topology: "closed",
        radius: 10,
        items: [
          { id: "a", x: 20, y: 20 },
          { id: "b", x: 30, y: 20 },
          { id: "c", x: 29.999999, y: 20 },
          { id: "d", x: 30.000001, y: 20 }
        ]
      },
      {
        label: "wrapped edges and corners",
        topology: "wrap",
        radius: 2,
        items: [
          { id: "a", x: 0.5, y: 0.5 },
          { id: "b", x: 99.5, y: 0.5 },
          { id: "c", x: 0.5, y: 99.5 },
          { id: "d", x: 99.5, y: 99.5 },
          { id: "e", x: 50, y: 50 }
        ]
      }
    ];

    for (const testCase of cases) {
      expect(indexedPairs(testCase.items, testCase.radius, testCase.topology), testCase.label)
        .toEqual(referencePairs(testCase.items, testCase.radius, testCase.topology));
    }
  });

  it("matches the all-pairs reference for 500 deterministic agents across multiple radii", () => {
    const items = deterministicItems(500, 0x51a7c0de);
    for (const topology of ["closed", "wrap"] as const) {
      for (const radius of [0, 1, 5, 10, 30, 49.999]) {
        expect(indexedPairs(items, radius, topology), `${topology} radius ${radius}`)
          .toEqual(referencePairs(items, radius, topology));
      }
    }

    const local = new ContinuousSpatialHashIndex({
      width: 100,
      height: 100,
      cellSize: 5,
      topology: "wrap",
      maxItems: items.length
    });
    local.addAll(items);
    expect(local.queryPairsWithinRadius(5).distanceChecks).toBeLessThan((items.length * (items.length - 1)) / 2);
  });

  it.each([
    { agentCount: 100, ticks: 40 },
    { agentCount: 500, ticks: 16 }
  ])("preserves exact full evolution for $agentCount agents over $ticks ticks", ({ agentCount, ticks }) => {
    const options = {
      seed: `perf1-neighbor-trajectory-${agentCount}`,
      parameters: {
        agentCount,
        perceptionRadius: 30,
        separationRadius: 10,
        noise: 0.01,
        boundaryMode: "wrap"
      }
    } as const;
    const reference = new SimulationEngine(templateFor("allPairsReference"), options);
    const indexed = new SimulationEngine(templateFor("spatialHash"), options);

    reference.runSteps(ticks);
    indexed.runSteps(ticks);

    expect(indexed.snapshotExport()).toEqual(reference.snapshotExport());
  });

  it("preserves the pre-PERF1 automatic strategy within the supported 500-agent bound", () => {
    const engine = new SimulationEngine(templateFor("automatic"), {
      seed: "perf1-automatic-strategy",
      parameters: { agentCount: 500, perceptionRadius: 30, boundaryMode: "wrap" },
      performance: { enabled: true, maxSamples: 4 }
    });

    engine.step();

    expect(engine.performanceData().tickSamples[0]?.counters).toMatchObject({
      flockingSpatialHashActive: 1,
      flockingTheoreticalAllPairs: 124_750
    });
    expect(engine.performanceData().tickSamples[0]?.counters.flockingPairwiseChecks).toBeLessThan(124_750);
  });
});

function templateFor(strategy: FlockingNeighborExecutionStrategy): SimulationTemplate {
  return {
    ...flockingTemplate,
    registerSystems(registry) {
      registerFlockingSystemsWithNeighborStrategy(registry, strategy);
    }
  };
}

function indexedPairs(
  items: readonly ContinuousSpatialHashItem[],
  radius: number,
  topology: ContinuousSpatialHashTopology
) {
  const index = new ContinuousSpatialHashIndex({
    width: 100,
    height: 100,
    cellSize: Math.max(1, radius),
    topology,
    cellSizing: "uniformCoverage",
    maxItems: Math.max(1, items.length)
  });
  index.addAll(items);
  return index.queryPairsWithinRadius(radius).pairs.map((pair) => ({
    leftId: pair.leftId,
    rightId: pair.rightId,
    offset: pair.offset,
    distanceSquared: pair.distanceSquared,
    distance: pair.distance
  }));
}

function referencePairs(
  items: readonly ContinuousSpatialHashItem[],
  radius: number,
  topology: ContinuousSpatialHashTopology
) {
  const pairs = [];
  const radiusSquared = radius * radius;
  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    const left = items[leftIndex]!;
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const right = items[rightIndex]!;
      const offset = minimumImageOffset(left, right, topology);
      const distanceSquared = offset.x * offset.x + offset.y * offset.y;
      if (distanceSquared <= radiusSquared) {
        pairs.push({
          leftId: left.id,
          rightId: right.id,
          offset,
          distanceSquared,
          distance: Math.sqrt(distanceSquared)
        });
      }
    }
  }
  return pairs;
}

function minimumImageOffset(
  left: ContinuousSpatialHashItem,
  right: ContinuousSpatialHashItem,
  topology: ContinuousSpatialHashTopology
) {
  let x = right.x - left.x;
  let y = right.y - left.y;
  if (topology === "wrap" && Math.abs(x) > 50) x -= Math.sign(x) * 100;
  if (topology === "wrap" && Math.abs(y) > 50) y -= Math.sign(y) * 100;
  return { x, y };
}

function deterministicItems(count: number, seed: number): ContinuousSpatialHashItem[] {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
  return Array.from({ length: count }, (_, index) => ({
    id: id(index),
    x: next() * 100,
    y: next() * 100
  }));
}

function id(index: number): string {
  return `p${index.toString().padStart(4, "0")}`;
}
