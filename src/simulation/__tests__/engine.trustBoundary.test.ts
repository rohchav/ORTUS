import { afterEach, describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationError } from "../kernel/Errors";
import { RandomService, type RandomStream } from "../kernel/Random";
import type { ComponentType, JsonValue, SerializedSpace, SimulationRunConfig, SimulationTemplate, SnapshotExport } from "../kernel/types";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { createFlockingRenderFramePacket } from "../runtime/flockingProjection";
import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import { createDefaultRunConfig } from "../runs/runConfig";
import { createDefaultScenario, patchScenarioVariantOptions, type AuthoredScenario } from "../scenarios";
import { epidemicTemplate, EPIDEMIC_SPACE_ID, InfectionState, Position2D, Velocity2D } from "../templates/epidemic.template";
import { BoidGroup, BoidState, flockingTemplate, FLOCKING_SPACE_ID } from "../templates/flocking.template";
import { ForestFireCellPosition, ForestFireCellState, forestFireTemplate, FOREST_FIRE_SPACE_ID } from "../templates/forestFire.template";
import {
  NEURAL_EXCITATION_NETWORK_ID,
  NEURAL_EXCITATION_SPACE_ID,
  neuralExcitationTemplate,
  NeuralNeuronStateComponent
} from "../templates/neuralExcitation.template";
import { OPINION_SPACE_ID, OpinionSocialLearningState, OpinionState, opinionTemplate } from "../templates/opinion.template";
import { PREDATOR_PREY_SPACE_ID, predatorPreyTemplate, Species } from "../templates/predatorPrey.template";
import { GroupIdentity, PositionGrid, SatisfactionState, schellingTemplate, SCHELLING_SPACE_ID } from "../templates/schelling.template";
import { createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld/scenario";
import { ProductionFlockingRuntime } from "../../components/runtime/ProductionFlockingRuntime";
import { useSimulationStore } from "../../state/simulationStore";
import { hostBackedWorkers } from "./fixtures/hostBackedWorker";

// An imported or restored world becomes executable only if it is a valid state of the model configuration it
// declares (Phase 3B). Every import path (direct restore, the main-thread paste import, and the Worker import)
// reaches the same checks in SimulationEngine.restoreSnapshot, and each must refuse before it replaces the
// current run. These tests drive the public paths only, so they run unchanged against earlier trees.

const now = "2026-01-01T00:00:00.000Z";

afterEach(() => {
  useSimulationStore.getState().selectTemplate("epidemic-spread");
});

// ---------------------------------------------------------------------------------------------------------
// Finding 1: a seeded consistency oracle. Strip random agents of random parts of their role (required
// components and space memberships), restore, and require every accepted world to agree with itself.
// ---------------------------------------------------------------------------------------------------------

interface OracleModel {
  name: string;
  template: SimulationTemplate;
  config: Partial<SimulationRunConfig>;
  ticks: number;
  // The agent role in this model variant: components every agent holds and spaces every agent occupies.
  required: readonly ComponentType[];
  spaces: readonly string[];
  // Metrics whose values add up to the number of agents.
  countMetrics?: readonly string[];
}

const oracleModels: OracleModel[] = [
  {
    name: "Epidemic",
    template: epidemicTemplate,
    config: { parameters: { agentCount: 40, initialInfected: 4 } },
    ticks: 6,
    required: [Position2D, Velocity2D, InfectionState],
    spaces: [EPIDEMIC_SPACE_ID],
    countMetrics: ["susceptibleCount", "infectedCount", "recoveredCount"]
  },
  {
    name: "Opinion",
    template: opinionTemplate,
    config: { parameters: { agentCount: 40 } },
    ticks: 3,
    required: [Position2D, OpinionState],
    spaces: [OPINION_SPACE_ID]
  },
  {
    name: "Opinion socialLearning",
    template: opinionTemplate,
    config: { parameters: { agentCount: 40 }, behaviorMode: "socialLearning" },
    ticks: 3,
    required: [Position2D, OpinionState, OpinionSocialLearningState],
    spaces: [OPINION_SPACE_ID]
  },
  {
    name: "Predator-Prey",
    template: predatorPreyTemplate,
    config: { parameters: { initialPrey: 30, initialPredators: 8 } },
    ticks: 4,
    required: [Position2D, Velocity2D, Species],
    spaces: [PREDATOR_PREY_SPACE_ID],
    countMetrics: ["preyCount", "predatorCount"]
  },
  {
    name: "Flocking",
    template: flockingTemplate,
    config: { parameters: { agentCount: 40 } },
    ticks: 3,
    required: [Position2D, Velocity2D, BoidState],
    spaces: [FLOCKING_SPACE_ID],
    countMetrics: ["agentCount"]
  },
  {
    name: "Flocking groupAware",
    template: flockingTemplate,
    config: { parameters: { agentCount: 40 }, behaviorMode: "groupAware", agentComposition: { agentCount: 40, groupCount: 3, primaryGroupRatio: 0.5 } },
    ticks: 3,
    required: [Position2D, Velocity2D, BoidState, BoidGroup],
    spaces: [FLOCKING_SPACE_ID],
    countMetrics: ["agentCount"]
  },
  {
    name: "Schelling",
    template: schellingTemplate,
    config: { parameters: { rows: 12, cols: 12 } },
    ticks: 3,
    required: [PositionGrid, GroupIdentity, SatisfactionState],
    spaces: [SCHELLING_SPACE_ID],
    countMetrics: ["groupACount", "groupBCount"]
  },
  {
    name: "Forest Fire",
    template: forestFireTemplate,
    config: { parameters: { gridWidth: 12, gridHeight: 10 } },
    ticks: 4,
    required: [ForestFireCellPosition, ForestFireCellState],
    spaces: [FOREST_FIRE_SPACE_ID]
  },
  {
    name: "Neural",
    template: neuralExcitationTemplate,
    config: { parameters: { neuronCount: 30 } },
    ticks: 3,
    required: [Position2D, NeuralNeuronStateComponent],
    spaces: [NEURAL_EXCITATION_SPACE_ID, NEURAL_EXCITATION_NETWORK_ID]
  }
];

const oracleCasesPerModel = 250;

describe("Finding 1: consistency oracle over agents stripped of parts of their role", { timeout: 120_000 }, () => {
  it.each(oracleModels.map((model) => [model.name, model] as const))(
    "%s: every accepted world shows one agent set to liveness, role components, spaces, metrics, and frame",
    (_name, model) => {
      const genuine = createEngineFromRunConfig(runConfigFor(model.name, model.template, model.config));
      genuine.runSteps(model.ticks);
      const genuineSnapshot = genuine.snapshotExport();
      const declared = { ...(genuine.initialization ? { initialization: genuine.initialization } : {}), ...(genuine.scenario ? { scenario: genuine.scenario } : {}) };
      const stream = new RandomService(`trust-boundary-oracle-${model.name}`).fork("cases");
      let accepted = 0;
      let refused = 0;
      for (let index = 0; index < oracleCasesPerModel; index += 1) {
        const snapshot = structuredClone(genuineSnapshot);
        const mutation = `case ${index}: ${mutate(snapshot, model, stream)}`;
        let restored: SimulationEngine;
        try {
          restored = SimulationEngine.fromSnapshot(model.template, snapshot, declared);
        } catch (error) {
          // A refusal names what is wrong; it is never a crash inside a system.
          expect(error, mutation).toBeInstanceOf(SimulationError);
          refused += 1;
          continue;
        }
        accepted += 1;
        restored.step();
        expectOneAgentSet(restored, model, mutation);
      }
      // Unchanged controls (and Predator-Prey removals) are accepted, so the oracle is never vacuous.
      expect(accepted).toBeGreaterThan(0);
      expect(refused).toBeGreaterThan(oracleCasesPerModel / 2);
    }
  );
});

// One of: no change (a control); a live entity removed entirely, which only Predator-Prey's model allows; or
// one to three live agents each losing a random non-empty subset of their role's components and spaces.
function mutate(snapshot: SnapshotExport, model: OracleModel, stream: RandomStream): string {
  const live = snapshot.world.entities.entities.filter((entity) => entity.alive).map((entity) => entity.id);
  const pick = () => live[stream.int(0, live.length - 1)]!;
  const roll = stream.float();
  if (roll < 0.1) {
    return "unchanged";
  }
  if (roll < 0.2) {
    const entityId = pick();
    removeEntity(snapshot, entityId);
    return `${entityId} removed entirely`;
  }
  const parts = [...model.required.map((component) => ({ component })), ...model.spaces.map((spaceId) => ({ spaceId }))];
  const changes: string[] = [];
  for (let victim = stream.int(1, 3); victim > 0; victim -= 1) {
    const entityId = pick();
    let lost = parts.filter(() => stream.bool(0.5));
    if (lost.length === 0) {
      lost = [parts[stream.int(0, parts.length - 1)]!];
    }
    for (const part of lost) {
      if ("component" in part) {
        delete snapshot.world.components[part.component]?.[entityId];
      } else {
        removeMember(spaceIn(snapshot, part.spaceId), entityId);
      }
    }
    changes.push(`${entityId} lost ${lost.map((part) => ("component" in part ? part.component : part.spaceId)).join(" + ")}`);
  }
  return changes.join("; ");
}

function expectOneAgentSet(engine: SimulationEngine, model: OracleModel, mutation: string): void {
  const view = engine.world.view();
  const agents = sorted(view.aliveEntities().map((entity) => entity.id));
  for (const component of model.required) {
    expect(sorted(view.entitiesWith([component])), `${mutation}: ${component} holders`).toEqual(agents);
  }
  for (const spaceId of model.spaces) {
    expect(sorted(memberIds(engine.world.getSpace(spaceId)!.serialize())), `${mutation}: ${spaceId} members`).toEqual(agents);
  }
  if (model.countMetrics) {
    const latest = engine.metrics.historyRecords().at(-1)!;
    const counted = model.countMetrics.reduce((sum, key) => sum + latest.values[key]!, 0);
    expect(counted, `${mutation}: ${model.countMetrics.join(" + ")}`).toBe(agents.length);
  }
  if (model.template === flockingTemplate) {
    expect(createFlockingRenderFramePacket(engine, { generation: 1, runId: "oracle" }, null).entityCount, `${mutation}: frame`).toBe(agents.length);
  }
}

// ---------------------------------------------------------------------------------------------------------
// Paths. Each refusal is checked where users import: a direct restore into a live engine, and the
// main-thread paste import or, for Flocking, the production Worker runtime. The current run must be untouched
// at the same tick and keep stepping.
// ---------------------------------------------------------------------------------------------------------

interface PathModel {
  name: string;
  template: SimulationTemplate;
  // The run the direct path starts.
  runConfig(): SimulationRunConfig;
  // The run the store starts for the paste path; Flocking imports through the Worker instead.
  storeRun?(): void;
}

const opinion: PathModel = {
  name: "Opinion",
  template: opinionTemplate,
  runConfig: () => runConfigFor("Opinion", opinionTemplate),
  storeRun: () => useSimulationStore.getState().selectTemplate("opinion-dynamics")
};
const opinionSocial: PathModel = {
  name: "Opinion socialLearning",
  template: opinionTemplate,
  runConfig: () => runConfigFor("Opinion socialLearning", opinionTemplate, { behaviorMode: "socialLearning" }),
  storeRun: () => useSimulationStore.getState().applyScenario(socialLearningOpinionScenario())
};
const epidemic: PathModel = {
  name: "Epidemic",
  template: epidemicTemplate,
  runConfig: () => runConfigFor("Epidemic", epidemicTemplate),
  storeRun: () => useSimulationStore.getState().selectTemplate("epidemic-spread")
};
const predatorPrey: PathModel = {
  name: "Predator-Prey",
  template: predatorPreyTemplate,
  runConfig: () => runConfigFor("Predator-Prey", predatorPreyTemplate),
  storeRun: () => useSimulationStore.getState().selectTemplate("predator-prey")
};
const neural: PathModel = {
  name: "Neural",
  template: neuralExcitationTemplate,
  runConfig: () => runConfigFor("Neural", neuralExcitationTemplate),
  storeRun: () => useSimulationStore.getState().selectTemplate("neural-excitation-network")
};
const schelling: PathModel = {
  name: "Schelling",
  template: schellingTemplate,
  runConfig: () => runConfigFor("Schelling", schellingTemplate),
  storeRun: () => useSimulationStore.getState().selectTemplate("schelling-segregation")
};
const forestFire: PathModel = {
  name: "Forest Fire",
  template: forestFireTemplate,
  runConfig: () => runConfigFor("Forest Fire", forestFireTemplate),
  storeRun: () => useSimulationStore.getState().selectTemplate("forest-fire")
};
const flocking: PathModel = {
  name: "Flocking",
  template: flockingTemplate,
  runConfig: () => createImmersiveFlockingRunConfig(100)
};
const flockingGrouped: PathModel = {
  name: "Flocking groupAware",
  template: flockingTemplate,
  runConfig: () => ({ ...createImmersiveFlockingRunConfig(100), behaviorMode: "groupAware" })
};

type Tamper = (snapshot: SnapshotExport) => void;

// Refused by a direct restore into a live engine and by the template's user import path, keeping the run.
async function expectRefusedOnEveryPath(model: PathModel, tamper: Tamper, message: RegExp): Promise<void> {
  expectDirectRestoreRefused(model, tamper, message);
  if (model.storeRun) {
    expectPasteImportRefused(model, tamper, message);
  } else {
    await expectWorkerImportRefused(model, tamper, message);
  }
}

function expectDirectRestoreRefused(model: PathModel, tamper: Tamper, message: RegExp, source?: SimulationEngine): void {
  const engine = createEngineFromRunConfig(model.runConfig());
  engine.runSteps(2);
  const snapshot = (source ?? engine).snapshotExport();
  tamper(snapshot);
  const before = engine.exportSnapshot();

  expect(() => engine.importSnapshot(JSON.stringify(snapshot)), `${model.name}: direct restore`).toThrow(message);

  expect(engine.exportSnapshot()).toBe(before);
  expect(engine.failure).toBeUndefined();
  engine.step();
  expect(engine.world.tick).toBe(3);
}

function expectPasteImportRefused(model: PathModel, tamper: Tamper, message: RegExp): void {
  const store = useSimulationStore;
  model.storeRun!();
  const engine = store.getState().engine!;
  store.getState().runFrameSteps(2);
  store.getState().exportSnapshot();
  const snapshot = JSON.parse(store.getState().exportText) as SnapshotExport;
  tamper(snapshot);

  store.getState().setImportMode("snapshot");
  store.getState().setImportText(JSON.stringify(snapshot));
  store.getState().importJson();

  const error = store.getState().lastError;
  expect(error?.area, `${model.name}: paste import`).toBe("file");
  expect(error?.text.startsWith("Import failed: ")).toBe(true);
  expect(error?.text).toMatch(message);
  expect(store.getState().engine).toBe(engine);
  expect(engine.world.tick).toBe(2);
  store.getState().runFrameSteps(1);
  expect(engine.world.tick).toBe(3);
}

async function expectWorkerImportRefused(model: PathModel, tamper: Tamper, message: RegExp): Promise<void> {
  const workers = hostBackedWorkers();
  const runtime = new ProductionFlockingRuntime({ createWorker: workers.create });
  await runtime.start({ runId: "trust-current", runConfig: model.runConfig() });
  await runtime.step();
  await runtime.step();
  const generation = runtime.getView().ui!.generation;
  const snapshot = JSON.parse(await runtime.exportArtifact("snapshot")) as SnapshotExport;
  tamper(snapshot);

  await expect(
    runtime.importArtifact({ runId: "trust-tampered", kind: "snapshot", json: JSON.stringify(snapshot) }),
    `${model.name}: Worker import`
  ).rejects.toThrow(message);

  expect(runtime.getView()).toMatchObject({ state: "ready", ui: { runId: "trust-current", generation, tick: 2 } });
  await runtime.step();
  expect(runtime.getView()).toMatchObject({ state: "ready", error: null, ui: { runId: "trust-current", generation, tick: 3 } });
  expect(workers.created).toHaveLength(1);
  expect(workers.created[0]!.terminated).toBe(false);
  runtime.dispose();
}

// ---------------------------------------------------------------------------------------------------------
// Finding 2: what the declared configuration fixes must agree with it.
// ---------------------------------------------------------------------------------------------------------

describe("Finding 2: a restored world agrees with its declared configuration on every import path", { timeout: 60_000 }, () => {
  it.each([
    [opinion.name, opinion, OPINION_SPACE_ID],
    [epidemic.name, epidemic, EPIDEMIC_SPACE_ID],
    [predatorPrey.name, predatorPrey, PREDATOR_PREY_SPACE_ID],
    [neural.name, neural, NEURAL_EXCITATION_SPACE_ID],
    [flocking.name, flocking, FLOCKING_SPACE_ID]
  ] as const)("%s: refuses continuous width x0.25 and x4, a different height, and a different boundary mode", async (_name, model, spaceId) => {
    const tamperings: Array<[Tamper, RegExp]> = [
      [(snapshot) => { continuousIn(snapshot, spaceId).width *= 0.25; }, extentMessage(spaceId, "width")],
      [(snapshot) => { continuousIn(snapshot, spaceId).width *= 4; }, extentMessage(spaceId, "width")],
      [(snapshot) => { continuousIn(snapshot, spaceId).height *= 0.5; }, extentMessage(spaceId, "height")],
      [(snapshot) => { const space = continuousIn(snapshot, spaceId); space.boundaryMode = space.boundaryMode === "bounce" ? "wrap" : "bounce"; }, extentMessage(spaceId, "boundaryMode")]
    ];
    for (const [tamper, message] of tamperings) {
      await expectRefusedOnEveryPath(model, tamper, message);
    }
  });

  it.each([
    [schelling.name, schelling, SCHELLING_SPACE_ID],
    [forestFire.name, forestFire, FOREST_FIRE_SPACE_ID]
  ] as const)("%s: refuses different grid rows, columns, and boundary mode", async (_name, model, spaceId) => {
    const tamperings: Array<[Tamper, RegExp]> = [
      [(snapshot) => { gridIn(snapshot, spaceId).rows += 1; }, extentMessage(spaceId, "rows")],
      [(snapshot) => { gridIn(snapshot, spaceId).cols += 5; }, extentMessage(spaceId, "cols")],
      [(snapshot) => { const grid = gridIn(snapshot, spaceId); grid.boundaryMode = grid.boundaryMode === "wrap" ? "clamp" : "wrap"; }, extentMessage(spaceId, "boundaryMode")]
    ];
    for (const [tamper, message] of tamperings) {
      await expectRefusedOnEveryPath(model, tamper, message);
    }
  });

  it("refuses the review's small Schelling snapshot that declares a 30000 x 30000 grid, before any tick", async () => {
    // Before the repair this imported quickly and the first step exhausted about 4 GB of heap.
    const huge: Tamper = (snapshot) => {
      Object.assign(gridIn(snapshot, SCHELLING_SPACE_ID), { rows: 30_000, cols: 30_000 });
    };
    const engine = createEngineFromRunConfig(schelling.runConfig());
    engine.runSteps(2);
    const snapshot = engine.snapshotExport();
    huge(snapshot);
    expect(JSON.stringify(snapshot).length).toBeLessThan(1_000_000);

    await expectRefusedOnEveryPath(schelling, huge, /Space schelling-grid rows 30000 does not match the configured model \(\d+\)/);
  });

  it("Opinion: refuses a socialLearning world declared as the default model, and the reverse, on the direct and paste paths", () => {
    for (const [worldMode, declaredMode] of [["socialLearning", "default"], ["default", "socialLearning"]] as const) {
      const world = worldMode === "socialLearning" ? opinionSocial : opinion;
      const declared = declaredMode === "socialLearning" ? opinionSocial : opinion;
      const message = new RegExp(`Global opinionBehaviorMode "${worldMode}" does not match the configured model \\("${declaredMode}"\\)`);
      // Direct: an engine of the declared model restores a snapshot of the other variant's world.
      const source = createEngineFromRunConfig({ ...world.runConfig(), seed: declared.runConfig().seed });
      source.runSteps(2);
      expectDirectRestoreRefused(declared, () => undefined, message, source);
      // Paste: the snapshot's own metadata declares the other variant.
      expectPasteImportRefused(world, (snapshot) => { snapshot.metadata.behaviorMode = declaredMode; }, message);
    }
  });

  it("Flocking: refuses a groupAware world declared as the default model, and the reverse, on the direct and Worker paths", async () => {
    const recipe = (snapshot: SnapshotExport) => (snapshot.metadata.ortusRuntimeRunConfigV1 as { runConfig: Record<string, JsonValue> }).runConfig;
    for (const [worldMode, declaredMode] of [["groupAware", "default"], ["default", "groupAware"]] as const) {
      const world = worldMode === "groupAware" ? flockingGrouped : flocking;
      const declared = declaredMode === "groupAware" ? flockingGrouped : flocking;
      const message = new RegExp(`Global flockingBehaviorMode "${worldMode}" does not match the configured model \\("${declaredMode}"\\)`);
      const source = createEngineFromRunConfig(world.runConfig());
      source.runSteps(2);
      expectDirectRestoreRefused(declared, () => undefined, message, source);
      // Worker: the runtime envelope inside the snapshot declares the other variant.
      await expectWorkerImportRefused(world, (snapshot) => { recipe(snapshot).behaviorMode = declaredMode; }, message);
    }
  });

  it("Flocking: refuses a world whose space boundary differs from its boundaryMode parameter, either way round", async () => {
    // The review's hybrid: movement once read the parameter and neighbour search the space.
    await expectRefusedOnEveryPath(
      flocking,
      (snapshot) => { continuousIn(snapshot, FLOCKING_SPACE_ID).boundaryMode = "bounce"; },
      /Space flocking-space boundaryMode bounce does not match the configured model \(wrap\)/
    );
    const declaredBounce: PathModel = {
      ...flocking,
      runConfig: () => ({ ...flocking.runConfig(), environmentOptions: { boundaryMode: "bounce" } })
    };
    const parameterMessage = /Parameter boundaryMode "wrap" does not match the configured model \("bounce"\)/;
    const source = createEngineFromRunConfig(flocking.runConfig());
    source.runSteps(2);
    expectDirectRestoreRefused(declaredBounce, () => undefined, parameterMessage, source);
    const recipe = (snapshot: SnapshotExport) => (snapshot.metadata.ortusRuntimeRunConfigV1 as { runConfig: Record<string, JsonValue> }).runConfig;
    await expectWorkerImportRefused(flocking, (snapshot) => { recipe(snapshot).environmentOptions = { boundaryMode: "bounce" }; }, parameterMessage);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Finding 3: a placed agent's position component and its space location name the same place.
// ---------------------------------------------------------------------------------------------------------

describe("Finding 3: position components agree with space locations on every import path", { timeout: 60_000 }, () => {
  it.each([
    [opinion.name, opinion, OPINION_SPACE_ID],
    [epidemic.name, epidemic, EPIDEMIC_SPACE_ID],
    [predatorPrey.name, predatorPrey, PREDATOR_PREY_SPACE_ID],
    [neural.name, neural, NEURAL_EXCITATION_SPACE_ID],
    [flocking.name, flocking, FLOCKING_SPACE_ID]
  ] as const)("%s: refuses a Position2D moved away from its space location, and a space location moved away from Position2D", async (_name, model, spaceId) => {
    const message = new RegExp(`Entity \\S+ Position2D \\{.*\\} does not match its location \\{.*\\} in ${spaceId}`);
    await expectRefusedOnEveryPath(model, (snapshot) => {
      const entityId = firstMember(spaceIn(snapshot, spaceId));
      const position = snapshot.world.components[Position2D]![entityId] as { x: number; y: number };
      position.x = elsewhere(position.x, continuousIn(snapshot, spaceId).width);
    }, message);
    await expectRefusedOnEveryPath(model, (snapshot) => {
      const space = continuousIn(snapshot, spaceId);
      const location = space.positions[firstMember(space)]!;
      location.y = elsewhere(location.y, space.height);
    }, message);
  });

  it.each([
    [schelling.name, schelling, SCHELLING_SPACE_ID, PositionGrid, /Invalid PositionGrid component/],
    [forestFire.name, forestFire, FOREST_FIRE_SPACE_ID, ForestFireCellPosition, /Invalid ForestFireCellPosition component/]
  ] as const)("%s: refuses a grid position component moved off its cell", async (_name, model, spaceId, component, message) => {
    // Grid templates already compared these every tick; the shared placement check now states it for all.
    await expectRefusedOnEveryPath(model, (snapshot) => {
      const entityId = firstMember(spaceIn(snapshot, spaceId));
      const value = snapshot.world.components[component]![entityId] as Record<string, number>;
      const key = "row" in value ? "row" : "y";
      value[key] = value[key]! === 0 ? 1 : value[key]! - 1;
    }, message);
  });

  it("accepts a genuine wrap position whose normalization a second normalization moves, as a newborn's can be", () => {
    // Predator-Prey births place a child at its raw jittered position, which can be just below 0; the space
    // stores its wrap normalization, and restore normalizes that stored location once more.
    const engine = createEngineFromRunConfig(predatorPrey.runConfig());
    engine.runSteps(2);
    const snapshot = engine.snapshotExport();
    const space = continuousIn(snapshot, PREDATOR_PREY_SPACE_ID);
    const normalizer = new Continuous2DSpace({ id: "normalizer", width: space.width, height: space.height, boundaryMode: space.boundaryMode });
    const raw = { x: -0.0007699040269944817, y: 50.25 };
    const stored = normalizer.normalizePosition(raw);
    expect(normalizer.normalizePosition(stored).x).not.toBe(stored.x);
    const entityId = firstMember(space);
    snapshot.world.components[Position2D]![entityId] = raw;
    space.positions[entityId] = stored;

    const restored = SimulationEngine.fromSnapshot(predatorPreyTemplate, snapshot, { ...(engine.initialization ? { initialization: engine.initialization } : {}), ...(engine.scenario ? { scenario: engine.scenario } : {}) });
    const reexported = restored.snapshotExport();
    expect(continuousIn(reexported, PREDATOR_PREY_SPACE_ID).positions[entityId]).toEqual(normalizer.normalizePosition(stored));
    expect(() => SimulationEngine.fromSnapshot(predatorPreyTemplate, reexported, { ...(engine.initialization ? { initialization: engine.initialization } : {}), ...(engine.scenario ? { scenario: engine.scenario } : {}) })).not.toThrow();
    restored.runSteps(2);
    expect(restored.world.tick).toBe(4);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Legitimate worlds keep importing through the Worker, for every Flocking behavior mode, preset, and boundary.
// ---------------------------------------------------------------------------------------------------------

describe("legitimate Flocking round trips through the production Worker runtime", { timeout: 120_000 }, () => {
  it("imports every behavior mode x initialization preset x boundary mode it exported and keeps the declared model", async () => {
    let imported = 0;
    for (const preset of flockingTemplate.initializationPresets ?? []) {
      for (const mode of flockingTemplate.behaviorModes ?? []) {
        for (const boundaryMode of ["wrap", "bounce", "clamp"] as const) {
          const runConfig: SimulationRunConfig = {
            ...createImmersiveFlockingRunConfig(100),
            initializationPreset: preset.id,
            initializationOptions: {},
            behaviorMode: mode.id,
            environmentOptions: { boundaryMode }
          };
          const workers = hostBackedWorkers();
          const runtime = new ProductionFlockingRuntime({ createWorker: workers.create });
          await runtime.start({ runId: "round-trip", runConfig });
          for (let tick = 0; tick < 6; tick += 1) {
            await runtime.step();
          }
          const exported = await runtime.exportArtifact("snapshot");

          await runtime.importArtifact({ runId: "round-trip-imported", kind: "snapshot", json: exported });

          const label = `${preset.id} ${mode.id} ${boundaryMode}`;
          expect(runtime.getView(), label).toMatchObject({ state: "ready", error: null, ui: { runId: "round-trip-imported", tick: 6 } });
          expect(runtime.getActiveRunConfig(), label).toMatchObject({ initializationPreset: preset.id, behaviorMode: mode.id, parameters: { boundaryMode } });
          const reexported = JSON.parse(await runtime.exportArtifact("snapshot")) as SnapshotExport;
          expect(continuousIn(reexported, FLOCKING_SPACE_ID).boundaryMode, label).toBe(boundaryMode);
          expect(reexported.world, label).toEqual((JSON.parse(exported) as SnapshotExport).world);
          await runtime.step();
          expect(runtime.getView().ui?.tick, label).toBe(7);
          runtime.dispose();
          imported += 1;
        }
      }
    }
    expect(imported).toBe((flockingTemplate.initializationPresets?.length ?? 0) * (flockingTemplate.behaviorModes?.length ?? 0) * 3);
  });
});

// ---------------------------------------------------------------------------------------------------------

function runConfigFor(name: string, template: SimulationTemplate, config: Partial<SimulationRunConfig> = {}): SimulationRunConfig {
  const base = createDefaultRunConfig({ template, seed: `trust-boundary-${name}` });
  // Composition and environment options derive from the parameters unless a case sets them.
  const { agentComposition: _composition, environmentOptions: _environment, ...rest } = base;
  return { ...rest, ...config, parameters: { ...base.parameters, ...config.parameters } };
}

function socialLearningOpinionScenario(): AuthoredScenario {
  return patchScenarioVariantOptions(createDefaultScenario({ template: opinionTemplate, seed: "trust-boundary-paste-social", now }), { behaviorMode: "socialLearning" }, now);
}

function extentMessage(spaceId: string, property: string): RegExp {
  return new RegExp(`Space ${spaceId} ${property} \\S+ does not match the configured model`);
}

// A coordinate inside [0, extent] a quarter of the extent away.
function elsewhere(value: number, extent: number): number {
  return value + extent / 4 <= extent ? value + extent / 4 : value - extent / 4;
}

function removeEntity(snapshot: SnapshotExport, entityId: string): void {
  for (const component of Object.keys(snapshot.world.components)) {
    delete snapshot.world.components[component]![entityId];
  }
  for (const space of snapshot.world.spaces) {
    removeMember(space, entityId);
  }
  snapshot.world.entities.entities = snapshot.world.entities.entities.filter((entity) => entity.id !== entityId);
  snapshot.world.events.events = snapshot.world.events.events.filter((event) => event.target !== entityId && event.source !== entityId);
}

function spaceIn(snapshot: SnapshotExport, spaceId: string): SerializedSpace {
  const space = snapshot.world.spaces.find((candidate) => candidate.id === spaceId);
  if (!space) {
    throw new Error(`No space ${spaceId}`);
  }
  return space;
}

function continuousIn(snapshot: SnapshotExport, spaceId: string): Extract<SerializedSpace, { kind: "continuous2d" }> {
  const space = spaceIn(snapshot, spaceId);
  if (space.kind !== "continuous2d") {
    throw new Error(`${spaceId} is not continuous`);
  }
  return space;
}

function gridIn(snapshot: SnapshotExport, spaceId: string): Extract<SerializedSpace, { kind: "grid2d" }> {
  const space = spaceIn(snapshot, spaceId);
  if (space.kind !== "grid2d") {
    throw new Error(`${spaceId} is not a grid`);
  }
  return space;
}

function memberIds(space: SerializedSpace): string[] {
  return space.kind === "continuous2d" ? Object.keys(space.positions) : space.kind === "grid2d" ? Object.keys(space.cells) : space.nodes;
}

function firstMember(space: SerializedSpace): string {
  return sorted(memberIds(space))[0]!;
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

function sorted(ids: readonly string[]): string[] {
  return [...ids].sort();
}
