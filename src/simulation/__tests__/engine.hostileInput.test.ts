import { afterEach, describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import type { JsonValue } from "../kernel/types";
import { maxJsonValueDepth, parseScenario, parseSnapshot, validateCommand } from "../kernel/Validation";
import { epidemicTemplate } from "../templates/epidemic.template";
import { parseRuntimeArtifact } from "../runtime/artifacts";
import { parseRuntimeWorkerRequest } from "../runtime/protocol";
import { validateRunConfig } from "../runs/runConfig";
import { createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld/scenario";
import { modelSchemaArtifactType, parseModelSchemaJson } from "../modelSchema";
import { useSimulationStore } from "../../state/simulationStore";

// Far beyond what the old recursive validator survived (Phase 1 overflowed at 50,000); JSON.parse
// itself is iterative in V8, so building and parsing these strings is cheap.
const hostileDepth = 100_000;

describe("hostile nesting in imported artifacts", () => {
  afterEach(() => {
    useSimulationStore.getState().selectTemplate("epidemic-spread");
  });

  it("accepts ordinary artifacts and JSON values nested exactly to the limit", () => {
    const engine = new SimulationEngine(epidemicTemplate, {
      seed: "depth-boundary",
      metadata: { lineage: nestedObjectValue(maxJsonValueDepth) }
    });
    engine.runSteps(2);

    const scenario = parseScenario(engine.exportScenario());
    const snapshot = parseSnapshot(engine.exportSnapshot());

    expect(depthOf(scenario.metadata.lineage)).toBe(maxJsonValueDepth);
    expect(snapshot.tick).toBe(2);
    expect(() => SimulationEngine.fromSnapshot(epidemicTemplate, engine.exportSnapshot()).step()).not.toThrow();
  });

  it("rejects a JSON value one level beyond the limit with a serialization error", () => {
    const scenario = JSON.parse(new SimulationEngine(epidemicTemplate, { seed: "just-beyond" }).exportScenario()) as Record<string, unknown>;
    scenario.metadata = { lineage: nestedObjectValue(maxJsonValueDepth + 1) };

    const error = captureError(() => parseScenario(JSON.stringify(scenario)));

    expect(error).toBeInstanceOf(SimulationSerializationError);
    expect(String((error as Error & { cause?: unknown }).cause)).toMatch(new RegExp(`nesting exceeds ${maxJsonValueDepth} levels`));
  });

  it("rejects extremely deep arrays, objects, and mixed nesting in scenario and snapshot imports without overflowing the stack", () => {
    const engine = new SimulationEngine(epidemicTemplate, { seed: "hostile" });
    const scenarioJson = engine.exportScenario();
    const snapshotJson = engine.exportSnapshot();

    for (const deep of [deepArrayJson(hostileDepth), deepObjectJson(hostileDepth), deepMixedJson(hostileDepth)]) {
      expect(() => parseScenario(scenarioJson.replace(/"metadata":\{\}/, `"metadata":{"deep":${deep}}`))).toThrow(SimulationSerializationError);
      expect(() => parseSnapshot(snapshotJson.replace(/"globals":\{/, `"globals":{"deep":${deep},`))).toThrow(SimulationSerializationError);
      expect(() => SimulationEngine.fromSnapshot(epidemicTemplate, snapshotJson.replace(/"payload":\{/, `"payload":${deep},"ignored":{`)))
        .toThrow(SimulationSerializationError);
    }
    expect(scenarioJson).toContain("\"metadata\":{}");
    expect(snapshotJson).toContain("\"globals\":{");
  });

  it("rejects hostile nesting in shape positions that are not JSON values", () => {
    const snapshotJson = new SimulationEngine(epidemicTemplate, { seed: "shape" }).exportSnapshot();
    const withDeepSpaces = snapshotJson.replace(/"spaces":\[/, `"spaces":[${deepArrayJson(hostileDepth)},`);

    expect(withDeepSpaces).not.toBe(snapshotJson);
    expect(() => parseSnapshot(withDeepSpaces)).toThrow(SimulationSerializationError);
    expect(() => parseSnapshot(deepArrayJson(hostileDepth))).toThrow(SimulationSerializationError);
    expect(() => parseScenario("null")).toThrow(SimulationSerializationError);
    expect(() => parseScenario("42")).toThrow(SimulationSerializationError);
  });

  it("rejects cyclic programmatic input instead of recursing forever", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const scenario = JSON.parse(new SimulationEngine(epidemicTemplate, { seed: "cycle" }).exportScenario()) as Record<string, unknown>;

    expect(() => parseScenario({ ...scenario, metadata: { cyclic } })).toThrow(SimulationSerializationError);
  });

  it("rejects hostile nesting on the Worker artifact, protocol, RunConfig, and command paths", () => {
    const deepSnapshot = new SimulationEngine(epidemicTemplate, { seed: "runtime" })
      .exportSnapshot()
      .replace(/"globals":\{/, `"globals":{"deep":${deepArrayJson(hostileDepth)},`);
    expect(() => parseRuntimeArtifact("snapshot", deepSnapshot)).toThrow(SimulationSerializationError);

    const deepValue = JSON.parse(deepObjectJson(hostileDepth)) as never;
    expect(() => validateCommand({ type: "setGlobal", key: "deep", value: deepValue })).toThrow(SimulationValidationError);
    expect(() => validateCommand({ type: "setComponents", componentType: "Deep", values: { e1: { nested: deepValue } } })).toThrow(
      /nests deeper than/
    );
    expect(() =>
      parseRuntimeWorkerRequest({
        type: "runtime.applyCommands",
        requestId: 1,
        generation: 1,
        commands: [{ type: "setComponents", componentType: "Deep", values: { e1: { nested: deepValue } } }]
      })
    ).toThrow(SimulationValidationError);
    expect(() => validateRunConfig({ ...createImmersiveFlockingRunConfig(100), metadata: { deep: deepValue } })).toThrow(/nests deeper than/);
  });

  it("rejects hostile nesting in a Builder model-schema import", () => {
    const schema = {
      artifactType: modelSchemaArtifactType,
      id: "deep-schema",
      name: "Deep Schema",
      version: "1.0.0",
      schemaVersion: "1",
      entityTypes: [{ id: "agent", label: "Agent", entityKind: "agent", active: true, executable: false, metadata: { deep: "__DEEP__" } }]
    };
    const json = JSON.stringify(schema).replace("\"__DEEP__\"", deepArrayJson(hostileDepth));

    const error = captureError(() => parseModelSchemaJson(json));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(RangeError);
  });

  it("reports malformed pasted imports as import errors in the store", () => {
    const store = useSimulationStore;
    store.getState().selectTemplate("epidemic-spread");
    const engine = store.getState().engine;

    for (const text of ["null", "[]", "42", `{"templateId":"epidemic-spread","metadata":${deepArrayJson(hostileDepth)}}`]) {
      store.getState().setImportText(text);
      store.getState().importJson();
      expect(store.getState().lastError).toMatchObject({ area: "file", text: expect.stringMatching(/^Import failed: Invalid (scenario|snapshot) payload/) });
      expect(store.getState().engine).toBe(engine);
    }
  });
});

function nestedObjectValue(depth: number): JsonValue {
  let value: JsonValue = { leaf: true };
  for (let level = 1; level < depth; level += 1) {
    value = { next: value };
  }
  return value;
}

function depthOf(value: unknown): number {
  let depth = 0;
  let current = value;
  while (typeof current === "object" && current !== null) {
    depth += 1;
    current = Array.isArray(current) ? current[0] : Object.values(current)[0];
  }
  return depth;
}

function deepArrayJson(depth: number): string {
  return `${"[".repeat(depth)}0${"]".repeat(depth)}`;
}

function deepObjectJson(depth: number): string {
  return `${"{\"a\":".repeat(depth)}0${"}".repeat(depth)}`;
}

function deepMixedJson(depth: number): string {
  return `${"[{\"a\":".repeat(depth / 2)}0${"}]".repeat(depth / 2)}`;
}

function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}
