import { Worker } from "node:worker_threads";
import { afterEach, describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationSerializationError } from "../kernel/Errors";
import { RandomService } from "../kernel/Random";
import type { SimulationTemplate, SnapshotExport } from "../kernel/types";
import { maxImportJsonLength, maxImportJsonValues, parseScenario, parseSnapshot } from "../kernel/Validation";
import { World } from "../kernel/World";
import { parseRuntimeArtifact } from "../runtime/artifacts";
import { parseRuntimeWorkerRequest } from "../runtime/protocol";
import { maxRuntimeArtifactJsonLength } from "../runtime/types";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Grid2DSpace } from "../spaces/Grid2DSpace";
import { reflectCoordinate, type Reflection } from "../spaces/Space";
import { epidemicTemplate } from "../templates/epidemic.template";
import { flockingTemplate } from "../templates/flocking.template";
import { forestFireTemplate } from "../templates/forestFire.template";
import { useSimulationStore } from "../../state/simulationStore";

// The pre-Phase-3 reflection loops, kept as references: within two reflections of the range the
// canonical function must reproduce them bit for bit, so existing trajectories do not change.
function legacyReflect(value: number, max: number): Reflection {
  let result = value;
  let lastWall: Reflection["lastWall"];
  while (result < 0 || result > max) {
    if (result < 0) {
      result = -result;
      lastWall = "low";
    }
    if (result > max) {
      result = max - (result - max);
      lastWall = "high";
    }
  }
  return lastWall === undefined ? { value: result } : { value: result, lastWall };
}

function legacyGridReflect(value: number, size: number): number {
  let result = value;
  while (result < 0 || result >= size) {
    if (result < 0) {
      result = -result;
    }
    if (result >= size) {
      result = size - 1 - (result - (size - 1));
    }
  }
  return result;
}

const hostileCoordinates = [1e300, -1e300, Number.MAX_VALUE, -Number.MAX_VALUE, 2 ** 53 + 2, -(2 ** 60), 1e17 + 0.5, -123_456_789.25];

describe("bounded boundary reflection", () => {
  it("matches the original reflection bit for bit, including the last wall, within two reflections of the range", () => {
    const stream = new RandomService("reflection-differential").fork("values");
    for (const max of [2 ** -20, 1e-3, 1, 7.5, 100, 123.456, 1e6]) {
      const values = [0, -0, max, -max, 2 * max, -2 * max, 3 * max, max * (1 + 2 ** -52), -max * 2 ** -40, 3 * max * (1 - 2 ** -52)];
      for (let index = 0; index < 2_000; index += 1) {
        values.push(max * (stream.float() * 5 - 2));
      }
      for (const value of values) {
        const expected = legacyReflect(value, max);
        const actual = reflectCoordinate(value, max);
        expect(Object.is(actual.value, expected.value), `${value} in [0, ${max}]`).toBe(true);
        expect(actual.lastWall).toBe(expected.lastWall);
      }
    }
  });

  it("matches the original grid reflection for every cell index the old loop could finish", () => {
    for (let size = 2; size <= 12; size += 1) {
      for (let value = -60; value <= 60; value += 1) {
        expect(reflectCoordinate(value, size - 1).value).toBe(legacyGridReflect(value, size));
      }
    }
  });

  it("keeps ordinary bounces, exact walls, and negative coordinates unchanged", () => {
    expect(reflectCoordinate(105, 100)).toEqual({ value: 95, lastWall: "high" });
    expect(reflectCoordinate(-5, 100)).toEqual({ value: 5, lastWall: "low" });
    expect(reflectCoordinate(-150, 100)).toEqual({ value: 50, lastWall: "high" });
    expect(reflectCoordinate(250, 100)).toEqual({ value: 50, lastWall: "low" });
    expect(reflectCoordinate(0, 100)).toEqual({ value: 0 });
    expect(reflectCoordinate(100, 100)).toEqual({ value: 100 });
    expect(reflectCoordinate(-100, 100)).toEqual({ value: 100, lastWall: "low" });
    expect(reflectCoordinate(200, 100)).toEqual({ value: 0, lastWall: "high" });
  });

  it("terminates with an in-range result for huge finite coordinates and a single-cell axis", async () => {
    const cases: Array<[number, number]> = [
      ...hostileCoordinates.flatMap((value) => [[value, 100], [value, 1], [value, 2 ** -30], [value, 0]] as Array<[number, number]>),
      [5, 0],
      [-5, 0]
    ];

    const results = await reflectInWorker(cases);

    results.forEach((result, index) => {
      const [value, max] = cases[index]!;
      expect(result.value >= 0 && result.value <= max, `${value} in [0, ${max}] gave ${result.value}`).toBe(true);
      if (max > 0 && Math.abs(value) > 3 * max) {
        // Far outside: the exact remainder of whole periods, then at most one reflection.
        const remainder = ((value % (2 * max)) + 2 * max) % (2 * max);
        expect(result.value).toBeCloseTo(remainder <= max ? remainder : 2 * max - remainder, 9);
      }
    });
  });

  it("normalizes hostile coordinates in bounce spaces, including a 1x1 grid, without looping", () => {
    const field = new Continuous2DSpace({ id: "field", width: 100, height: 50, boundaryMode: "bounce" });
    const cell = new Grid2DSpace({ id: "cell", rows: 1, cols: 1, boundaryMode: "bounce" });
    const grid = new Grid2DSpace({ id: "grid", rows: 10, cols: 10, boundaryMode: "bounce" });

    hostileCoordinates.forEach((value, index) => {
      const position = field.normalizePosition({ x: value, y: -value });
      expect(position.x >= 0 && position.x <= 100 && position.y >= 0 && position.y <= 50).toBe(true);
      if (Number.isInteger(value)) {
        cell.addEntity(`c${index}`, { row: value, col: -value });
        grid.addEntity(`g${index}`, { row: value, col: -value });
      }
    });

    expect(Object.values(cell.serialize().cells).every((location) => location.row === 0 && location.col === 0)).toBe(true);
    expect(Object.values(grid.serialize().cells).every((location) => location.row >= 0 && location.row < 10 && location.col >= 0 && location.col < 10)).toBe(true);
    expect(cell.neighbors({ row: 0, col: 0 }, { includeDiagonals: true, radius: 2 })).toEqual([{ row: 0, col: 0 }]);
    expect(grid.readonlyView().neighbors({ row: 12, col: -3 })).toEqual(grid.neighbors({ row: 6, col: 3 }));
  });

  it("restores a snapshot whose bounce space holds huge coordinates and moves entities there without looping", () => {
    const engine = new SimulationEngine(bounceTemplate(), { seed: "bounce" });
    const snapshot = engine.snapshotExport();
    const field = snapshot.world.spaces[0]!;
    if (field.kind !== "continuous2d") {
      throw new Error("expected field");
    }
    field.positions.a = { x: 1e300, y: -Number.MAX_VALUE };

    const restored = SimulationEngine.fromSnapshot(bounceTemplate(), snapshot);
    restored.applyCommands([{ type: "moveEntity", spaceId: "field", entityId: "a", location: { x: -1e300, y: 2 ** 60 } }]);

    const position = restored.world.getSpace<Continuous2DSpace>("field")!.getPosition("a")!;
    expect(position.x >= 0 && position.x <= 10 && position.y >= 0 && position.y <= 10).toBe(true);
  });

  it("bounces a Flocking boid with a hostile position back into the world instead of looping", () => {
    const engine = new SimulationEngine(flockingTemplate, { seed: "flocking-bounce", parameters: { boundaryMode: "bounce", agentCount: 20 } });
    const boid = engine.world.view().entitiesWith(["Position2D"])[0]!;
    // Far from its neighbours, so steering stays finite; the movement step then bounces 1e300.
    engine.applyCommands([{ type: "setComponent", entityId: boid, componentType: "Position2D", value: { x: 1e300, y: -1e300 } }]);

    engine.step();

    const space = engine.world.getSpace<Continuous2DSpace>("flocking-space")!;
    const position = space.getPosition(boid)!;
    expect(position.x >= 0 && position.x <= space.width && position.y >= 0 && position.y <= space.height).toBe(true);
    expect(engine.world.view().getComponent(boid, "Position2D")).toEqual(position);
  });
});

describe("import size bounds", () => {
  afterEach(() => {
    useSimulationStore.getState().selectTemplate("epidemic-spread");
  });

  it("accepts an import exactly at the character bound and rejects one more character before parsing", () => {
    const atLimit = scenarioJsonWithLength(maxImportJsonLength);
    const overLimit = scenarioJsonWithLength(maxImportJsonLength + 1);

    expect(atLimit.length).toBe(maxImportJsonLength);
    expect(parseScenario(atLimit).templateId).toBe("epidemic-spread");
    expect(() => parseScenario(overLimit)).toThrow(SimulationSerializationError);
    expect(() => parseScenario(overLimit)).toThrow(`Scenario JSON is ${maxImportJsonLength + 1} characters; imports are limited to ${maxImportJsonLength}`);
  });

  it("accepts a snapshot with exactly the JSON-value bound and rejects one value more before schema validation", () => {
    const atLimit = snapshotWithValueCount(maxImportJsonValues);
    const overLimit = snapshotWithValueCount(maxImportJsonValues + 1);

    expect(countJsonValues(atLimit)).toBe(maxImportJsonValues);
    expect(countJsonValues(overLimit)).toBe(maxImportJsonValues + 1);
    expect(() => parseSnapshot(atLimit)).not.toThrow();
    expect(() => parseSnapshot(overLimit)).toThrow(`Snapshot has more than ${maxImportJsonValues} JSON values; imports are limited to that many`);
  });

  it("rejects a broad shallow payload that the schema would otherwise accept", () => {
    // Two million numbers are valid JSON values; only the value bound can refuse them, and it does so
    // before Zod would spend several seconds walking them.
    const scenario = JSON.parse(new SimulationEngine(epidemicTemplate, { seed: "broad" }).exportScenario()) as Record<string, unknown>;
    const broad = JSON.stringify({ ...scenario, metadata: { wide: new Array(2 * maxImportJsonValues).fill(0) } });

    expect(broad.length).toBeLessThan(maxImportJsonLength);
    expect(() => parseScenario(broad)).toThrow(`Scenario has more than ${maxImportJsonValues} JSON values`);
    expect(() => SimulationEngine.fromScenario(epidemicTemplate, broad)).toThrow(SimulationSerializationError);
  });

  it("still rejects hostile nesting through the depth gate, which runs after the value bound", () => {
    const scenarioJson = new SimulationEngine(epidemicTemplate, { seed: "deep" }).exportScenario();
    const deep = scenarioJson.replace("\"metadata\":{}", `"metadata":{"deep":${"[".repeat(100_000)}0${"]".repeat(100_000)}}`);

    const error = captureError(() => parseScenario(deep));

    expect(error).toBeInstanceOf(SimulationSerializationError);
    expect(String((error as { cause?: unknown }).cause)).toMatch(/nesting exceeds/);
  });

  it("applies the same bounds to Worker runtime artifacts and requests", () => {
    const broadSnapshot = snapshotWithValueCount(maxImportJsonValues + 1);

    expect(maxRuntimeArtifactJsonLength).toBe(maxImportJsonLength);
    expect(() => parseRuntimeArtifact("snapshot", broadSnapshot)).toThrow(`Snapshot has more than ${maxImportJsonValues} JSON values`);
    expect(() => parseRuntimeArtifact("scenario", scenarioJsonWithLength(maxImportJsonLength + 1))).toThrow(/between 1 and 16000000 characters/);
    expect(() =>
      parseRuntimeWorkerRequest({
        type: "runtime.importArtifact",
        requestId: 1,
        generation: 1,
        runId: "oversized",
        kind: "scenario",
        json: scenarioJsonWithLength(maxImportJsonLength + 1)
      })
    ).toThrow();
  });

  it("reports an oversized paste import as a file error and keeps the current run", () => {
    const store = useSimulationStore;
    store.getState().selectTemplate("epidemic-spread");
    const engine = store.getState().engine;

    store.getState().setImportMode("scenario");
    store.getState().setImportText(scenarioJsonWithLength(maxImportJsonLength + 1));
    store.getState().importJson();
    expect(store.getState().lastError).toEqual({
      area: "file",
      text: `Import failed: Scenario JSON is ${maxImportJsonLength + 1} characters; imports are limited to ${maxImportJsonLength}`
    });
    expect(store.getState().engine).toBe(engine);

    store.getState().setImportMode("snapshot");
    store.getState().setImportText(snapshotWithValueCount(maxImportJsonValues + 1));
    store.getState().importJson();
    expect(store.getState().lastError?.text).toBe(`Import failed: Snapshot has more than ${maxImportJsonValues} JSON values; imports are limited to that many`);
    expect(store.getState().engine).toBe(engine);
  });

  it("keeps the largest supported world well inside both bounds", () => {
    // Forest Fire at its 160 x 120 maximum is the largest supported world (19,200 cell entities).
    const engine = new SimulationEngine(forestFireTemplate, { seed: "largest", parameters: { gridWidth: 160, gridHeight: 120 } });
    engine.runSteps(2);
    const json = engine.exportSnapshot();

    expect(json.length).toBeLessThan(maxImportJsonLength / 3);
    expect(countJsonValues(JSON.parse(json))).toBeLessThan(maxImportJsonValues / 3);
    expect(parseSnapshot(json).world.entities.entities).toHaveLength(19_200);
  }, 30_000);
});

// A valid Epidemic scenario whose JSON text is exactly `length` characters (one long metadata string).
function scenarioJsonWithLength(length: number): string {
  const scenario = JSON.parse(new SimulationEngine(epidemicTemplate, { seed: "length" }).exportScenario()) as Record<string, unknown>;
  const base = JSON.stringify({ ...scenario, metadata: { pad: "" } });
  return JSON.stringify({ ...scenario, metadata: { pad: "x".repeat(length - base.length) } });
}

// A schema-valid snapshot with exactly `count` JSON values, padded with minimal destroyed entities (five
// values each) and a metadata array for the remainder. Fixed-shape entities keep schema validation fast.
function snapshotWithValueCount(count: number): string {
  const snapshot = JSON.parse(new SimulationEngine(epidemicTemplate, { seed: "values" }).exportSnapshot()) as SnapshotExport;
  snapshot.metadata = { pad: [] };
  const base = countJsonValues(snapshot);
  const entityCount = Math.floor((count - base) / 5);
  const entities = snapshot.world.entities.entities;
  for (let index = 0; index < entityCount; index += 1) {
    entities.push({ id: `pad${index}`, archetype: "pad", alive: false, createdAtTick: 0 });
  }
  (snapshot.metadata.pad as number[]).push(...new Array(count - base - entityCount * 5).fill(0));
  return JSON.stringify(snapshot);
}

function countJsonValues(value: unknown): number {
  let count = 0;
  const pending: unknown[] = [typeof value === "string" ? JSON.parse(value) : value];
  while (pending.length > 0) {
    const current = pending.pop();
    count += 1;
    if (typeof current === "object" && current !== null) {
      for (const child of Array.isArray(current) ? current : Object.values(current)) {
        pending.push(child);
      }
    }
  }
  return count;
}

function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}

function reflectInWorker(cases: Array<[number, number]>, timeoutMs = 5_000): Promise<Reflection[]> {
  const worker = new Worker(new URL("./fixtures/reflectCoordinateWorker.mjs", import.meta.url), {
    workerData: { moduleUrl: new URL("../spaces/Space.ts", import.meta.url).href, cases }
  });
  return new Promise<Reflection[]>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`reflectCoordinate did not return within ${timeoutMs} ms`)), timeoutMs);
    worker.once("message", (results: Reflection[]) => {
      clearTimeout(timer);
      resolve(results);
    });
    worker.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  }).finally(() => void worker.terminate());
}

function bounceTemplate(): SimulationTemplate {
  return {
    id: "bounce-bounds",
    name: "Bounce Bounds",
    description: "Bounce-space resource-bound test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: {
      purpose: "Exercise bounce normalization on restore and movement.",
      entities: ["agent"],
      stateVariables: [],
      processOverview: "No systems.",
      scheduling: "None.",
      designConcepts: {},
      initialization: "One entity in a bounce space.",
      submodels: [],
      assumptions: [],
      limitations: []
    },
    createInitialWorld: () => {
      const world = new World();
      const field = new Continuous2DSpace({ id: "field", width: 10, height: 10, boundaryMode: "bounce" });
      world.addSpace(field);
      world.entityStore.create("agent", { id: "a", createdAtTick: 0 });
      field.addEntity("a", { x: 1, y: 1 });
      return world;
    },
    registerSystems: () => undefined,
    registerMetrics: () => undefined,
    getVisuals: () => ({ components: {} })
  };
}
