import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
  createEngineFromRunConfig,
  createSnapshotViewFromRuntimeArtifact,
  createDefaultScenario,
  flockingTemplate,
  parseRuntimeArtifact,
  supportsWorkerRuntime,
  type RuntimeDriverState,
  type SimulationRuntimePort,
  type UIProjection
} from "../../simulation";
import {
  createStarterWorldScenario,
  readStarterRemixLineage,
  readStarterWorldOrigin,
  resolveStarterRemixRequest,
  resolveStarterWorldLaunch
} from "../../lib/starterWorlds";
import { useSimulationStore } from "../../state/simulationStore";
import { ProductionFlockingRuntime } from "./ProductionFlockingRuntime";

describe("I1 production runtime adoption", () => {
  afterEach(() => {
    useSimulationStore.getState().selectTemplate("epidemic-spread");
  });

  it("keeps the Worker capability decision explicit and Flocking-only", () => {
    expect(supportsWorkerRuntime("flocking-boids")).toBe(true);
    for (const templateId of [
      "epidemic-spread",
      "opinion-dynamics",
      "predator-prey",
      "schelling-segregation",
      "forest-fire",
      "neural-excitation-network"
    ]) {
      expect(supportsWorkerRuntime(templateId)).toBe(false);
    }
  });

  it("stores Flocking configuration without constructing a main-thread engine or snapshot", () => {
    useSimulationStore.getState().selectTemplate("flocking-boids");
    const state = useSimulationStore.getState();

    expect(state.selectedTemplateId).toBe("flocking-boids");
    expect(state.engine).toBeNull();
    expect(state.latestSnapshot).toBeNull();
    expect(state.flockingRuntimeConfig).toMatchObject({
      schemaVersion: "1",
      templateId: "flocking-boids",
      seed: state.seed,
      parameters: state.parameterValues
    });
    expect(state.flockingRuntimeRevision).toBeGreaterThan(0);
  });

  it("hands a validated prepared Flocking scenario to the runtime without a duplicate engine", () => {
    const scenario = createDefaultScenario({
      template: flockingTemplate,
      scenarioId: "i1-prepared-flock",
      name: "I1 prepared flock",
      seed: "i1-prepared-seed",
      now: "2026-08-18T00:00:00.000Z"
    });
    useSimulationStore.getState().applyScenario(scenario);
    const state = useSimulationStore.getState();

    expect(state.engine).toBeNull();
    expect(state.latestSnapshot).toBeNull();
    expect(state.flockingRuntimeConfig).toMatchObject({
      templateId: "flocking-boids",
      scenarioId: "i1-prepared-flock",
      scenarioName: "I1 prepared flock",
      seed: "i1-prepared-seed"
    });
    expect(state.lastNotice).toMatch(/queued for the Worker-owned runtime; readiness follows Worker acceptance/i);
  });

  it("preserves canonical Starter origin without retaining prepared-recipe identity across Flocking rebuild and reset", () => {
    const resolved = resolveStarterWorldLaunch({
      starterId: "coordination-under-sensor-noise",
      recipeId: "coordination-clear-signals",
      guideId: "reading-a-flock"
    });
    if (!resolved.ok) {
      throw new Error(resolved.message);
    }
    useSimulationStore.getState().applyScenario(createStarterWorldScenario(resolved.launch));
    const preparedConfig = useSimulationStore.getState().flockingRuntimeConfig!;
    expect(preparedConfig.metadata).toMatchObject({
      starterWorldId: "coordination-under-sensor-noise",
      starterWorldRecipeId: "coordination-clear-signals"
    });

    useSimulationStore.getState().setParameters({
      ...preparedConfig.parameters,
      alignmentWeight: 0.2
    }, "Rebuild accepted Flocking configuration");
    const rebuiltConfig = useSimulationStore.getState().flockingRuntimeConfig!;
    expect(rebuiltConfig.parameters.alignmentWeight).toBe(0.2);
    expect(rebuiltConfig.metadata).not.toHaveProperty("starterWorldId");
    expect(rebuiltConfig.metadata).not.toHaveProperty("starterWorldRecipeId");
    expect(readStarterWorldOrigin(rebuiltConfig.metadata)?.source).toMatchObject({
      starterWorldId: "coordination-under-sensor-noise",
      recipeId: "coordination-clear-signals",
      templateId: "flocking-boids"
    });
    expect(rebuiltConfig).toMatchObject({
      initializationPreset: preparedConfig.initializationPreset,
      initializationOptions: preparedConfig.initializationOptions,
      behaviorMode: preparedConfig.behaviorMode
    });

    useSimulationStore.getState().reset();
    const state = useSimulationStore.getState();

    expect(state.engine).toBeNull();
    expect(state.latestSnapshot).toBeNull();
    expect(readStarterWorldOrigin(state.flockingRuntimeConfig?.metadata)?.source).toMatchObject({
      starterWorldId: "coordination-under-sensor-noise",
      recipeId: "coordination-clear-signals"
    });
    expect(state.flockingRuntimeConfig).not.toHaveProperty("scenarioId");
    expect(state.flockingRuntimeConfig).not.toHaveProperty("scenarioName");
    expect(state.flockingRuntimeConfig).toMatchObject({
      seed: preparedConfig.seed,
      parameters: rebuiltConfig.parameters,
      initializationPreset: preparedConfig.initializationPreset,
      initializationOptions: preparedConfig.initializationOptions,
      behaviorMode: preparedConfig.behaviorMode,
      agentComposition: preparedConfig.agentComposition,
      environmentOptions: preparedConfig.environmentOptions
    });
    expect(state.lastNotice).toMatch(/Starter origin was preserved; prepared-recipe identity and run progress were discarded/i);
  });

  it("keeps Flocking remix configuration Worker-owned and preserves its derivative lineage on reset", () => {
    const resolved = resolveStarterRemixRequest(
      { starterId: "flocking" },
      { now: "2026-08-29T12:00:00.000Z" }
    );
    if (!resolved.ok) {
      throw new Error(resolved.message);
    }
    useSimulationStore.getState().applyScenario(resolved.source.draft);
    const accepted = useSimulationStore.getState();
    expect(accepted.engine).toBeNull();
    expect(accepted.latestSnapshot).toBeNull();
    expect(readStarterRemixLineage(accepted.flockingRuntimeConfig?.metadata)?.draftId).toBe(
      resolved.source.draft.scenarioId
    );

    useSimulationStore.getState().reset();
    const reset = useSimulationStore.getState();
    expect(reset.engine).toBeNull();
    expect(reset.latestSnapshot).toBeNull();
    expect(reset.flockingRuntimeConfig?.scenarioId).toBe(resolved.source.draft.scenarioId);
    expect(readStarterRemixLineage(reset.flockingRuntimeConfig?.metadata)?.source.starterWorldId).toBe("flocking");
    expect(reset.lastNotice).toMatch(/source lineage was preserved/i);
  });

  it("keeps legacy remixes on the existing main-thread path and preserves lineage on reset", () => {
    const resolved = resolveStarterRemixRequest(
      { starterId: "epidemic" },
      { now: "2026-08-29T12:00:00.000Z" }
    );
    if (!resolved.ok) {
      throw new Error(resolved.message);
    }
    useSimulationStore.getState().applyScenario(resolved.source.draft);
    useSimulationStore.getState().stepOnce();
    expect(useSimulationStore.getState().latestSnapshot?.tick).toBe(1);
    expect(useSimulationStore.getState().flockingRuntimeConfig).toBeNull();

    useSimulationStore.getState().reset();
    const reset = useSimulationStore.getState();
    expect(reset.engine).not.toBeNull();
    expect(reset.flockingRuntimeConfig).toBeNull();
    expect(reset.latestSnapshot?.tick).toBe(0);
    expect(readStarterRemixLineage(reset.engine?.metadata)?.draftId).toBe(resolved.source.draft.scenarioId);
    expect(reset.lastNotice).toMatch(/source lineage was preserved/i);

    useSimulationStore.getState().setParameters({
      ...reset.parameterValues,
      infectionProbability: 0.2
    }, "Rebuild accepted legacy remix");
    const rebuilt = useSimulationStore.getState();
    expect(rebuilt.engine).not.toBeNull();
    expect(rebuilt.latestSnapshot?.tick).toBe(0);
    expect(rebuilt.parameterValues.infectionProbability).toBe(0.2);
    expect(readStarterRemixLineage(rebuilt.engine?.metadata)?.draftId).toBe(resolved.source.draft.scenarioId);
  });

  it.each([
    ["epidemic", "infectionProbability", 0.2],
    ["predator-prey", "preyReproductionProbability", 0.02]
  ])("keeps %s Starter origin and accepted variant structure on main-thread parameter rebuild", (
    starterWorldId,
    parameterId,
    value
  ) => {
    const resolved = resolveStarterWorldLaunch({ starterId: starterWorldId });
    if (!resolved.ok) {
      throw new Error(resolved.message);
    }
    useSimulationStore.getState().applyScenario(createStarterWorldScenario(resolved.launch));
    const accepted = useSimulationStore.getState();
    expect(accepted.engine).not.toBeNull();
    const beforeMetadata = accepted.engine!.metadata;

    useSimulationStore.getState().setParameters({
      ...accepted.parameterValues,
      [parameterId]: value
    }, `Rebuild ${starterWorldId} configuration`);
    const rebuilt = useSimulationStore.getState();

    expect(rebuilt.engine).not.toBeNull();
    expect(rebuilt.flockingRuntimeConfig).toBeNull();
    expect(rebuilt.latestSnapshot?.tick).toBe(0);
    expect(rebuilt.parameterValues[parameterId]).toBe(value);
    expect(rebuilt.engine?.metadata).not.toHaveProperty("starterWorldId");
    expect(readStarterWorldOrigin(rebuilt.engine?.metadata)?.source.starterWorldId).toBe(starterWorldId);
    expect(rebuilt.engine?.metadata).toMatchObject({
      initializationPreset: beforeMetadata.initializationPreset,
      behaviorMode: beforeMetadata.behaviorMode
    });
  });

  it("rejects the legacy store import path for Worker-owned Flocking artifacts", () => {
    useSimulationStore.getState().selectTemplate("flocking-boids");
    useSimulationStore.getState().setImportMode("scenario");
    useSimulationStore.getState().setImportText(JSON.stringify({ templateId: "flocking-boids" }));
    useSimulationStore.getState().importJson();

    const state = useSimulationStore.getState();
    expect(state.engine).toBeNull();
    expect(state.latestSnapshot).toBeNull();
    expect(state.lastError).toMatch(/active Worker runtime/i);
  });

  it("captures Worker comparison provenance from the exported run rather than mutable UI state", () => {
    useSimulationStore.getState().selectTemplate("flocking-boids");
    const acceptedConfig = useSimulationStore.getState().flockingRuntimeConfig!;
    const engine = createEngineFromRunConfig(acceptedConfig);
    engine.step();
    const artifact = parseRuntimeArtifact("snapshot", engine.exportSnapshot());
    const detachedSnapshot = createSnapshotViewFromRuntimeArtifact(artifact);

    expect(detachedSnapshot).toStrictEqual(engine.createSnapshot());
    expect(detachedSnapshot).not.toBe(artifact.world);

    useSimulationStore.getState().setSeed("new-ui-seed-before-capture-completes");
    useSimulationStore.getState().captureRuntimeRun({
      snapshot: detachedSnapshot,
      seed: acceptedConfig.seed,
      parameters: acceptedConfig.parameters,
      metadata: { source: "accepted-worker-artifact" },
      interventionHistory: []
    }, { label: "Accepted Worker run" });

    const captured = useSimulationStore.getState().savedRuns[0];
    expect(captured).toMatchObject({
      label: "Accepted Worker run",
      seed: acceptedConfig.seed,
      parameters: acceptedConfig.parameters,
      metadata: { source: "accepted-worker-artifact" }
    });
    expect(captured?.seed).not.toBe(useSimulationStore.getState().seed);
    useSimulationStore.getState().clearSavedRuns();
  });

  it("publishes the actual initializing state while a production lifecycle operation is pending", async () => {
    useSimulationStore.getState().selectTemplate("flocking-boids");
    const runConfig = useSimulationStore.getState().flockingRuntimeConfig;
    expect(runConfig).not.toBeNull();

    let lifecycle: RuntimeDriverState = "idle";
    let completeInitialization: ((ui: UIProjection) => void) | undefined;
    const port = {
      executionKind: "worker",
      generation: 1,
      get state() {
        return lifecycle;
      },
      initialize() {
        lifecycle = "initializing";
        return new Promise<UIProjection>((resolve) => {
          completeInitialization = resolve;
        });
      },
      subscribe() {
        return () => undefined;
      },
      setSpeedMultiplier() {},
      setSelectedEntity() {},
      dispose() {
        lifecycle = "disposed";
      }
    } as unknown as SimulationRuntimePort;
    const runtime = new ProductionFlockingRuntime({ port });
    const pending = runtime.start({ runId: "i1-lifecycle", runConfig: runConfig!, instrumentation: true });

    expect(runtime.getView().state).toBe("initializing");
    lifecycle = "ready";
    completeInitialization?.(emptyProjection("i1-lifecycle"));
    await pending;
    expect(runtime.getView().state).toBe("ready");
    runtime.dispose();
  });

  it("rejects stale operation projections and clears selection at run replacement", async () => {
    useSimulationStore.getState().selectTemplate("flocking-boids");
    const runConfig = useSimulationStore.getState().flockingRuntimeConfig!;
    let lifecycle: RuntimeDriverState = "idle";
    let generation = 0;
    const selections: Array<string | null> = [];
    const pendingSteps: Array<{ resolve(ui: UIProjection): void; reject(error: Error): void }> = [];
    let completeReplacement: ((ui: UIProjection) => void) | undefined;
    const port = {
      executionKind: "worker",
      get generation() {
        return generation;
      },
      get state() {
        return lifecycle;
      },
      initialize(request: { runId: string }) {
        generation = 1;
        lifecycle = "ready";
        return Promise.resolve(emptyProjection(request.runId));
      },
      replaceRun() {
        generation += 1;
        lifecycle = "initializing";
        return new Promise<UIProjection>((resolve) => {
          completeReplacement = (ui) => {
            lifecycle = "ready";
            resolve(ui);
          };
        });
      },
      step() {
        return new Promise<UIProjection>((resolve, reject) => pendingSteps.push({ resolve, reject }));
      },
      subscribe() {
        return () => undefined;
      },
      setSpeedMultiplier() {},
      setSelectedEntity(entityId: string | null) {
        selections.push(entityId);
      },
      dispose() {
        lifecycle = "disposed";
      }
    } as unknown as SimulationRuntimePort;
    const runtime = new ProductionFlockingRuntime({ port });
    await runtime.start({ runId: "i1-ordering", runConfig });
    runtime.setSelectedEntity("e000001");

    const older = runtime.step();
    const newer = runtime.step();
    pendingSteps[1]!.resolve(emptyProjection("i1-ordering", { revision: 3, tick: 2 }));
    await newer;
    pendingSteps[0]!.resolve(emptyProjection("i1-ordering", { revision: 2, tick: 1 }));
    await older;
    expect(runtime.getView().ui).toMatchObject({ revision: 3, tick: 2 });

    const superseded = runtime.step();
    const replacing = runtime.replaceRun({ runId: "i1-replacement", runConfig });
    completeReplacement?.(emptyProjection("i1-replacement", { generation: 2, revision: 1 }));
    await replacing;
    pendingSteps[2]!.reject(new Error("superseded operation"));
    await expect(superseded).resolves.toBeUndefined();
    expect(runtime.getView()).toMatchObject({ error: null, ui: { generation: 2, runId: "i1-replacement" } });
    expect(selections.at(-1)).toBeNull();
    runtime.dispose();
  });

  it("preserves the ready run when a replacement is rejected before acceptance", async () => {
    useSimulationStore.getState().selectTemplate("flocking-boids");
    const runConfig = useSimulationStore.getState().flockingRuntimeConfig!;
    let lifecycle: RuntimeDriverState = "idle";
    const selections: Array<string | null> = [];
    const port = {
      executionKind: "worker",
      generation: 1,
      get state() {
        return lifecycle;
      },
      initialize(request: { runId: string }) {
        lifecycle = "ready";
        return Promise.resolve(emptyProjection(request.runId));
      },
      replaceRun() {
        return Promise.reject(new Error("runtime transport is full"));
      },
      subscribe() {
        return () => undefined;
      },
      setSpeedMultiplier() {},
      setSelectedEntity(entityId: string | null) {
        selections.push(entityId);
      },
      dispose() {
        lifecycle = "disposed";
      }
    } as unknown as SimulationRuntimePort;
    const runtime = new ProductionFlockingRuntime({ port });
    await runtime.start({ runId: "i1-still-active", runConfig });
    runtime.setSelectedEntity("e000001");
    const previousUI = runtime.getView().ui;
    const previousConfig = runtime.getActiveRunConfig();
    const rejectedConfig = { ...runConfig, seed: "i1-rejected-seed" };

    await expect(runtime.replaceRun({ runId: "i1-rejected", runConfig: rejectedConfig })).rejects.toThrow(/transport is full/i);
    expect(runtime.getView()).toMatchObject({ state: "ready", error: "runtime transport is full" });
    expect(runtime.getView().ui).toBe(previousUI);
    expect(runtime.getActiveRunConfig()).toBe(previousConfig);
    expect(runtime.getActiveRunConfig()).not.toBe(rejectedConfig);
    expect(selections.at(-1)).toBe("e000001");
    await expect(runtime.whenReady()).resolves.toBeUndefined();
    runtime.dispose();
  });

  it("does not adopt a rejected rapid replacement while an accepted replacement is still initializing", async () => {
    useSimulationStore.getState().selectTemplate("flocking-boids");
    const runConfig = useSimulationStore.getState().flockingRuntimeConfig!;
    let lifecycle: RuntimeDriverState = "idle";
    let generation = 0;
    let completeAcceptedReplacement: ((ui: UIProjection) => void) | undefined;
    const port = {
      executionKind: "worker",
      get generation() {
        return generation;
      },
      get state() {
        return lifecycle;
      },
      initialize(request: { runId: string }) {
        generation = 1;
        lifecycle = "ready";
        return Promise.resolve(emptyProjection(request.runId));
      },
      replaceRun(request: { runId: string }) {
        if (request.runId === "i1-accepted-a") {
          generation = 2;
          lifecycle = "initializing";
          return new Promise<UIProjection>((resolve) => {
            completeAcceptedReplacement = (ui) => {
              lifecycle = "ready";
              resolve(ui);
            };
          });
        }
        return Promise.reject(new Error("runtime transport is full"));
      },
      subscribe() {
        return () => undefined;
      },
      setSpeedMultiplier() {},
      setSelectedEntity() {},
      dispose() {
        lifecycle = "disposed";
      }
    } as unknown as SimulationRuntimePort;
    const runtime = new ProductionFlockingRuntime({ port });
    await runtime.start({ runId: "i1-rapid-base", runConfig });
    const acceptedConfig = { ...runConfig, seed: "i1-accepted-a" };
    const rejectedConfig = { ...runConfig, seed: "i1-rejected-b" };

    const accepted = runtime.replaceRun({ runId: "i1-accepted-a", runConfig: acceptedConfig });
    await expect(runtime.replaceRun({ runId: "i1-rejected-b", runConfig: rejectedConfig })).rejects.toThrow(/transport is full/i);
    expect(runtime.getView().state).toBe("initializing");
    expect(runtime.getActiveRunConfig()).toBe(acceptedConfig);

    completeAcceptedReplacement?.(emptyProjection("i1-accepted-a", { generation: 2 }));
    await accepted;
    expect(runtime.getView()).toMatchObject({ state: "ready", error: null, ui: { runId: "i1-accepted-a" } });
    expect(runtime.getActiveRunConfig()).toBe(acceptedConfig);
    runtime.dispose();
  });

  it("uses one production Worker controller and the existing packet scene adapter without a Local fallback", () => {
    const appShell = source("../AppShell.tsx");
    const controller = source("./ProductionFlockingRuntime.ts");
    const provider = source("./ProductionRuntimeProvider.tsx");
    const world = source("./ProductionFlockingWorld.tsx");

    expect(appShell).toContain("ProductionRuntimeProvider");
    expect(controller).toContain("new WorkerRuntimeDriver");
    expect(controller).toContain("ortus-production-flocking-runtime");
    expect(controller).not.toContain("LocalRuntimeDriver");
    expect(controller).toContain("no implicit local fallback was started");
    expect(provider).toContain("readStarterWorldOrigin");
    expect(provider).toContain("Starter origin were preserved; prepared-recipe identity and run progress were discarded");
    expect(provider).not.toContain("SimulationEngine");
    expect(provider).not.toContain("runFrameSteps");
    expect(world).toContain("ImmersiveWorldCanvas");
    expect(world).toContain("Camera and lens are presentation only");
  });
});

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function emptyProjection(
  runId: string,
  options: { generation?: number; revision?: number; tick?: number } = {}
): UIProjection {
  const tick = options.tick ?? 0;
  return {
    schemaVersion: "1",
    projectionKind: "flocking-v1",
    generation: options.generation ?? 1,
    runId,
    revision: options.revision ?? 1,
    templateId: "flocking-boids",
    executionKind: "worker",
    tick,
    time: tick,
    entityCount: 0,
    playback: "paused",
    lastAdvanceKind: "initialization",
    speedMultiplier: 1,
    runtimeSignature: "i1-empty",
    warnings: [],
    metricHistory: [],
    metricRecordCount: 0,
    interventions: [],
    interventionCount: 0,
    appliedInterventionCount: 0,
    performance: {
      measures: [],
      publications: {
        ticksSimulated: 0,
        framesProjected: 0,
        framesPublished: 0,
        framesCoalesced: 0,
        uiProjected: 0,
        uiPublished: 0,
        uiCoalesced: 0
      }
    },
    alignment: null,
    selected: null
  };
}
