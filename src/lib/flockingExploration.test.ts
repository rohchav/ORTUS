import { describe, expect, it } from "vitest";
import { createEngineFromScenario, validateScenario, type SimulationSnapshotView } from "../simulation";
import { Velocity2D } from "../simulation/templates/epidemic.template";
import {
  createFlockingExplorationScenario,
  flockingExplorationTargets,
  getFlockingExplorationTarget
} from "./flockingExploration";

interface Vec2 {
  x: number;
  y: number;
}

describe("Flocking exploration product content", () => {
  it("builds four exact validated tick-zero scenarios through the scenario authority", () => {
    expect(flockingExplorationTargets.map((target) => target.id)).toEqual([
      "coordinate",
      "noisy",
      "fragments",
      "opposition"
    ]);

    for (const target of flockingExplorationTargets) {
      const scenario = createFlockingExplorationScenario(target.id);
      expect(validateScenario(scenario).scenario).toEqual(scenario);
      expect(scenario.templateId).toBe("flocking-boids");
      expect(scenario.seed).toBe(target.seed);
      expect(scenario.initializationPreset).toBe(target.initializationPreset);
      expect(scenario.metadata.productContentId).toBe(`flocking-exploration:${target.id}`);
    }
  });

  it("reproduces the bounded model-output distinctions used by the exploration labels", () => {
    const coordinate = runTarget("coordinate", 90);
    const noisy = runTarget("noisy", 180);
    const fragments = runTarget("fragments", 180);

    expect(latestMetric(coordinate, "alignmentScore")).toBeGreaterThan(0.99);
    expect(latestMetric(noisy, "alignmentScore")).toBeLessThan(0.2);

    const fragmentSizes = toroidalComponents(fragments, 10);
    expect(fragmentSizes.filter((size) => size >= 3).length).toBeGreaterThanOrEqual(3);
    expect(fragmentSizes[0]).toBeLessThan(100);
  }, 15_000);

  it("keeps the opposition claim at initialization instead of implying a persistent group rule", () => {
    const snapshot = runTarget("opposition", 0);
    const space = continuousSpace(snapshot);
    const leftIds = Object.entries(space.positions).filter(([, position]) => position.x < 40).map(([id]) => id);
    const rightIds = Object.entries(space.positions).filter(([, position]) => position.x > 60).map(([id]) => id);

    expect(leftIds).toHaveLength(80);
    expect(rightIds).toHaveLength(80);
    expect(leftIds.every((id) => velocity(snapshot, id).x > 0)).toBe(true);
    expect(rightIds.every((id) => velocity(snapshot, id).x < 0)).toBe(true);
    expect(getFlockingExplorationTarget("opposition").watch).toMatch(/temporary/i);
  });
});

function runTarget(id: Parameters<typeof createFlockingExplorationScenario>[0], ticks: number): SimulationSnapshotView {
  const { engine } = createEngineFromScenario(createFlockingExplorationScenario(id));
  engine.runSteps(ticks);
  return engine.createSnapshot();
}

function latestMetric(snapshot: SimulationSnapshotView, key: string): number {
  const value = snapshot.metricsHistory.at(-1)?.values[key];
  expect(value).toBeTypeOf("number");
  return value ?? Number.NaN;
}

function continuousSpace(snapshot: SimulationSnapshotView) {
  const space = snapshot.spaces.find((candidate) => candidate.kind === "continuous2d");
  if (!space || space.kind !== "continuous2d") {
    throw new Error("Expected the Flocking continuous space.");
  }
  return space;
}

function velocity(snapshot: SimulationSnapshotView, entityId: string): Vec2 {
  return snapshot.components[Velocity2D]?.[entityId] as unknown as Vec2;
}

function toroidalComponents(snapshot: SimulationSnapshotView, connectionRadius: number): number[] {
  const space = continuousSpace(snapshot);
  const points = Object.values(space.positions);
  const visited = new Set<number>();
  const sizes: number[] = [];

  for (let start = 0; start < points.length; start += 1) {
    if (visited.has(start)) continue;
    const pending = [start];
    visited.add(start);
    let size = 0;
    while (pending.length > 0) {
      const current = pending.pop();
      if (current === undefined) break;
      size += 1;
      for (let next = 0; next < points.length; next += 1) {
        if (!visited.has(next) && toroidalDistance(points[current]!, points[next]!, space.width, space.height) <= connectionRadius) {
          visited.add(next);
          pending.push(next);
        }
      }
    }
    sizes.push(size);
  }

  return sizes.sort((left, right) => right - left);
}

function toroidalDistance(left: Vec2, right: Vec2, width: number, height: number): number {
  const deltaX = Math.min(Math.abs(left.x - right.x), width - Math.abs(left.x - right.x));
  const deltaY = Math.min(Math.abs(left.y - right.y), height - Math.abs(left.y - right.y));
  return Math.hypot(deltaX, deltaY);
}
