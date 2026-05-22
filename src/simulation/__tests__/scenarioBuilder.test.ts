import { describe, expect, it } from "vitest";
import {
  createDefaultScenario,
  createEngineFromScenario,
  deserializeAuthoredScenario,
  duplicateScenario,
  agentCompositionDefinitionsForTemplate,
  behaviorModesForTemplate,
  initializationPresetsForTemplate,
  maxScenarioJsonLength,
  patchScenarioVariantOptions,
  previewScenario,
  productionTemplates,
  readSimulationEventLog,
  runConfigFromScenario,
  serializeAuthoredScenario,
  SimulationEngine,
  updateScenarioPreset,
  validateRunConfig,
  validateScenario
} from "../index";
import { deleteScenarioFromLibrary, loadScenarioLibrary, saveScenarioLibrary, saveScenarioToLibrary, type ScenarioStorageLike } from "../../lib/localScenarioStorage";
import { useSimulationStore } from "../../state/simulationStore";
import { epidemicTemplate } from "../templates/epidemic.template";
import { flockingTemplate } from "../templates/flocking.template";
import { predatorPreyTemplate } from "../templates/predatorPrey.template";
import { schellingTemplate } from "../templates/schelling.template";

const now = "2026-05-06T12:00:00.000Z";

describe("scenario builder", () => {
  it("creates default scenarios for every production template and fresh tick-0 engines", () => {
    for (const template of productionTemplates) {
      const scenario = createDefaultScenario({ template, scenarioId: `scenario-${template.id}`, now, seed: "scenario-seed" });
      const validation = validateScenario(scenario, template);
      const { engine } = createEngineFromScenario(validation.scenario);
      const snapshot = engine.createSnapshot();
      expect(validation.scenario.templateId).toBe(template.id);
      expect(snapshot.templateId).toBe(template.id);
      expect(snapshot.tick).toBe(0);
      expect(snapshot.time).toBe(0);
      expect(snapshot.entities.length).toBeGreaterThan(0);
      expect(validation.scenario.behaviorMode).toBe("default");
      expect(behaviorModesForTemplate(template).some((mode) => mode.id === validation.scenario.behaviorMode)).toBe(true);
      expect(validation.scenario.agentComposition).toBeDefined();
      expect(validation.scenario.environmentOptions).toBeDefined();
      expect(JSON.stringify(scenario)).not.toContain('"world"');
      expect(JSON.stringify(scenario)).not.toContain('"metricsHistory"');
    }
  });

  it("exposes valid behavior mode and composition metadata for every template", () => {
    for (const template of productionTemplates) {
      const modes = behaviorModesForTemplate(template);
      const modeIds = new Set<string>();
      expect(modes.some((mode) => mode.id === "default")).toBe(true);
      for (const mode of modes) {
        expect(mode.id).toMatch(/^[a-z][a-zA-Z0-9-]*$/);
        expect(mode.label.length).toBeGreaterThan(2);
        expect(mode.description.length).toBeGreaterThan(8);
        expect(modeIds.has(mode.id)).toBe(false);
        modeIds.add(mode.id);
      }

      const compositionDefinitions = agentCompositionDefinitionsForTemplate(template);
      const compositionIds = new Set<string>();
      for (const definition of compositionDefinitions) {
        expect(definition.label.length).toBeGreaterThan(2);
        expect(definition.description.length).toBeGreaterThan(8);
        expect(compositionIds.has(definition.key)).toBe(false);
        compositionIds.add(definition.key);
      }
    }

    const groupAware = behaviorModesForTemplate(flockingTemplate).find((mode) => mode.id === "groupAware");
    expect(groupAware?.supportedCompositionFields).toEqual(expect.arrayContaining(["agentCount", "groupCount", "primaryGroupRatio"]));
    expect(groupAware?.documentation).toMatch(/group-aware/i);
  });

  it("validates malformed scenarios, invalid params, invalid presets, invalid variants, and version warnings", () => {
    const scenario = createDefaultScenario({ template: epidemicTemplate, scenarioId: "scenario-valid", now });
    expect(validateScenario(scenario).scenario.scenarioId).toBe("scenario-valid");
    expect(() => validateScenario({ ...scenario, templateId: "missing-template" })).toThrow(/Unknown scenario template/);
    expect(() => validateScenario({ ...scenario, parameters: { ...scenario.parameters, initialInfected: 9999 } })).toThrow(/initialInfected/);
    expect(() => validateScenario({ ...scenario, initializationPreset: "not-a-preset" })).toThrow(/Unknown initialization preset/);
    expect(() => validateScenario({ ...scenario, initializationOptions: { notSupported: 1 } })).toThrow(/Unknown parameter/);
    expect(() => validateScenario({ ...scenario, behaviorMode: "unsupported-mode" })).toThrow(/Unsupported behavior mode/);
    expect(() => validateScenario({ ...scenario, agentComposition: { ...scenario.agentComposition, agentCount: 0 } })).toThrow(/agentCount/i);
    expect(() => validateScenario({ ...scenario, environmentOptions: { fakeLayer: true } })).toThrow(/Unknown parameter/);
    expect(() => validateScenario({ ...scenario, metadata: { snapshot: { tick: 10 } } })).toThrow(/live run state/);
    expect(() =>
      validateScenario({
        ...scenario,
        metadata: { large: "x".repeat(maxScenarioJsonLength) }
      })
    ).toThrow(/characters or less/);
    expect(() => validateScenario({ ...scenario, scenarioId: "" })).toThrow(/Invalid scenario/);

    const flockingScenario = createDefaultScenario({ template: flockingTemplate, scenarioId: "scenario-flocking", now });
    expect(() =>
      validateScenario({
        ...flockingScenario,
        behaviorMode: "groupAware",
        agentComposition: { ...flockingScenario.agentComposition, groupCount: 1 }
      })
    ).toThrow(/groupCount/);
    expect(() =>
      validateScenario({
        ...flockingScenario,
        behaviorMode: "groupAware",
        agentComposition: { ...flockingScenario.agentComposition, groupCount: Number.NaN }
      })
    ).toThrow(/Invalid scenario|finite number|NaN/);
    expect(() =>
      validateScenario({
        ...flockingScenario,
        behaviorMode: "groupAware",
        agentComposition: { ...flockingScenario.agentComposition, primaryGroupRatio: 1.5 }
      })
    ).toThrow(/primaryGroupRatio/);
    expect(() =>
      validateScenario({
        ...flockingScenario,
        behaviorMode: "groupAware",
        agentComposition: { ...flockingScenario.agentComposition, world: { entities: [] } }
      })
    ).toThrow(/Unknown parameter: world/);
    expect(() =>
      validateScenario({
        ...flockingScenario,
        behaviorMode: "groupAware",
        agentComposition: { ...flockingScenario.agentComposition, groupCount: { entities: [] } }
      })
    ).toThrow(/finite number/);

    const schellingScenario = createDefaultScenario({ template: schellingTemplate, scenarioId: "scenario-schelling", now });
    expect(() => validateScenario({ ...schellingScenario, environmentOptions: { ...schellingScenario.environmentOptions, rows: 2 } })).toThrow(/rows/i);

    const versioned = validateScenario({ ...scenario, templateVersion: "0.0.0" });
    expect(versioned.warnings[0]).toMatch(/template version/);
  });

  it("normalizes older scenario JSON by applying default variant fields", () => {
    const scenario = createDefaultScenario({ template: epidemicTemplate, scenarioId: "scenario-legacy", now });
    const legacy = { ...scenario } as Partial<typeof scenario>;
    delete legacy.agentComposition;
    delete legacy.behaviorMode;
    delete legacy.environmentOptions;

    const validation = validateScenario(legacy);
    expect(validation.scenario.behaviorMode).toBe("default");
    expect(validation.scenario.agentComposition.agentCount).toBe(scenario.parameters.agentCount);
    expect(validation.warnings.some((warning) => warning.includes("variant fields"))).toBe(true);
  });

  it("maps scenarios to RunConfig without becoming a snapshot or run summary", () => {
    const scenario = updateScenarioPreset(
      createDefaultScenario({ template: epidemicTemplate, scenarioId: "scenario-run-config", now, seed: "run-config-seed" }),
      "single-cluster-outbreak",
      now
    );
    const runConfig = runConfigFromScenario(scenario);
    const validated = validateRunConfig(runConfig);

    expect(validated).toMatchObject({
      schemaVersion: "1",
      templateId: scenario.templateId,
      seed: "run-config-seed",
      scenarioId: "scenario-run-config",
      scenarioName: scenario.name,
      initializationPreset: "single-cluster-outbreak",
      behaviorMode: "default"
    });
    expect(validated.agentComposition).toEqual(scenario.agentComposition);
    expect(validated.environmentOptions).toEqual(scenario.environmentOptions);
    expect(JSON.stringify(validated)).not.toContain('"world"');
    expect(JSON.stringify(validated)).not.toContain('"finalMetrics"');
    expect(JSON.stringify(validated)).not.toContain('"metricsHistory"');
  });

  it("exposes deterministic initialization presets that produce valid initial worlds", () => {
    for (const template of productionTemplates) {
      const base = createDefaultScenario({ template, scenarioId: `scenario-${template.id}`, now, seed: "preset-seed" });
      const snapshots = initializationPresetsForTemplate(template).map((preset) => {
        const scenario = updateScenarioPreset(base, preset.id, now);
        const first = createEngineFromScenario(scenario).engine.createSnapshot();
        const second = createEngineFromScenario(scenario).engine.createSnapshot();
        expect(first.tick).toBe(0);
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
        return JSON.stringify({ components: first.components, spaces: first.spaces });
      });
      if (snapshots.length > 1) {
        expect(new Set(snapshots).size).toBeGreaterThan(1);
      }
    }
  });

  it("previews scenarios without mutating an existing engine or advancing time", () => {
    const active = new SimulationEngine(epidemicTemplate, { seed: "active-seed", parameters: { agentCount: 12, initialInfected: 1 } });
    active.runSteps(4);
    const before = active.exportSnapshot();
    const scenario = createDefaultScenario({ template: epidemicTemplate, scenarioId: "scenario-preview", now, seed: "preview-seed" });
    const previewA = previewScenario(scenario);
    const previewB = previewScenario(scenario);

    expect(previewA.errors).toEqual([]);
    expect(previewA.snapshot?.tick).toBe(0);
    expect(JSON.stringify(previewA.snapshot)).toBe(JSON.stringify(previewB.snapshot));
    expect(active.exportSnapshot()).toBe(before);

    const invalidPreview = previewScenario({ ...scenario, initializationPreset: "missing-preset" });
    expect(invalidPreview.snapshot).toBeNull();
    expect(invalidPreview.errors[0]).toMatch(/Unknown initialization preset/);
    expect(active.exportSnapshot()).toBe(before);
  });

  it("applies scenario recipes by creating fresh engines without mutating previous engines", () => {
    const previous = new SimulationEngine(epidemicTemplate, { seed: "previous-seed", parameters: { agentCount: 12, initialInfected: 1 } });
    previous.runSteps(2);
    const before = previous.exportSnapshot();
    const scenario = updateScenarioPreset(
      createDefaultScenario({ template: epidemicTemplate, scenarioId: "scenario-apply", now, seed: "apply-seed" }),
      "single-cluster-outbreak",
      now
    );
    const { engine } = createEngineFromScenario(scenario);

    expect(engine.seed).toBe("apply-seed");
    expect(engine.createSnapshot().tick).toBe(0);
    expect(engine.parameters.initialInfected).toBe(6);
    expect(readSimulationEventLog(engine).map((event) => event.type)).toEqual(["run.initialized", "scenario.applied"]);
    expect(readSimulationEventLog(engine).at(-1)).toMatchObject({
      tick: 0,
      type: "scenario.applied",
      source: "scenarioBuilder",
      label: scenario.name
    });
    expect(previous.exportSnapshot()).toBe(before);
  });

  it("store-level Apply Scenario replaces the active run and clears stale run context", () => {
    useSimulationStore.getState().selectTemplate("epidemic-spread");
    const initialSnapshot = useSimulationStore.getState().latestSnapshot;
    expect(initialSnapshot).toBeTruthy();
    const susceptibleId = Object.entries(initialSnapshot?.components.InfectionState ?? {}).find(
      ([, value]) => value.status === "susceptible"
    )?.[0];
    expect(susceptibleId).toBeTruthy();

    useSimulationStore.getState().selectEntity(susceptibleId ?? null);
    useSimulationStore.getState().setInterventionTarget({ point: { x: 12, y: 18 }, gridCell: { row: 1, col: 1 } });
    useSimulationStore.getState().applyIntervention("epidemic.infectSelected", {});
    useSimulationStore.getState().stepOnce();

    const previousEngine = useSimulationStore.getState().engine;
    expect(previousEngine).toBeTruthy();
    const previousSnapshot = previousEngine?.exportSnapshot();
    expect(useSimulationStore.getState().selectedEntityId).toBe(susceptibleId);
    expect(useSimulationStore.getState().interventionHistory.length).toBeGreaterThan(0);

    const scenario = createDefaultScenario({ template: epidemicTemplate, scenarioId: "scenario-store-apply", now, seed: "store-apply-seed" });
    useSimulationStore.getState().applyScenario(scenario);

    const nextState = useSimulationStore.getState();
    expect(nextState.engine).not.toBe(previousEngine);
    expect(nextState.seed).toBe("store-apply-seed");
    expect(nextState.latestSnapshot?.tick).toBe(0);
    expect(nextState.latestSnapshot?.metricsHistory.every((record) => record.tick === 0)).toBe(true);
    expect(nextState.selectedEntityId).toBeNull();
    expect(nextState.interventionTargetPoint).toBeNull();
    expect(nextState.interventionTargetCell).toBeNull();
    expect(nextState.interventionHistory).toEqual([]);
    expect(nextState.isRunning).toBe(false);
    expect(readSimulationEventLog(nextState.engine!).map((event) => event.type)).toEqual(["run.initialized", "scenario.applied"]);
    expect(nextState.engine?.metadata.assumptionProvenance).toMatchObject({ scenarioId: "scenario-store-apply" });
    useSimulationStore.getState().captureCurrentRun({ label: "Scenario provenance capture" });
    expect(useSimulationStore.getState().savedRuns[0]?.metadata?.assumptionProvenance).toMatchObject({ scenarioId: "scenario-store-apply" });
    expect(previousEngine?.exportSnapshot()).toBe(previousSnapshot);
  });

  it("uses agent composition and environment options as validated initial-run variants", () => {
    const epidemicScenario = patchScenarioVariantOptions(
      createDefaultScenario({ template: epidemicTemplate, scenarioId: "scenario-composition", now, seed: "composition-seed" }),
      { agentComposition: { agentCount: 20 } },
      now
    );
    const epidemicSnapshot = createEngineFromScenario(epidemicScenario).engine.createSnapshot();
    expect(epidemicSnapshot.entities).toHaveLength(20);
    expect(epidemicScenario.parameters.agentCount).toBe(20);

    const predatorPreyScenario = patchScenarioVariantOptions(
      createDefaultScenario({ template: predatorPreyTemplate, scenarioId: "scenario-species-composition", now, seed: "species-seed" }),
      { agentComposition: { initialPrey: 14, initialPredators: 2 } },
      now
    );
    const predatorPreySnapshot = createEngineFromScenario(predatorPreyScenario).engine.createSnapshot();
    expect(predatorPreySnapshot.entities.filter((entity) => entity.archetype === "prey")).toHaveLength(14);
    expect(predatorPreySnapshot.entities.filter((entity) => entity.archetype === "predator")).toHaveLength(2);
    expect(predatorPreyScenario.parameters.initialPrey).toBe(14);
    expect(predatorPreyScenario.parameters.initialPredators).toBe(2);

    const schellingScenario = patchScenarioVariantOptions(
      createDefaultScenario({ template: schellingTemplate, scenarioId: "scenario-environment", now, seed: "environment-seed" }),
      { environmentOptions: { rows: 20, cols: 22 } },
      now
    );
    const schellingSnapshot = createEngineFromScenario(schellingScenario).engine.createSnapshot();
    expect(schellingSnapshot.spaces[0]).toMatchObject({ kind: "grid2d", rows: 20, cols: 22 });
    expect(schellingScenario.parameters.rows).toBe(20);
    expect(schellingScenario.parameters.cols).toBe(22);
  });

  it("saves, loads, duplicates, deletes, bounds, and recovers local scenario storage", () => {
    const storage = new MemoryStorage();
    const scenarios = Array.from({ length: 52 }, (_, index) =>
      createDefaultScenario({ template: epidemicTemplate, scenarioId: `scenario-${index}`, now, seed: `seed-${index}` })
    );
    saveScenarioLibrary(scenarios, storage);
    expect(loadScenarioLibrary(storage).scenarios).toHaveLength(50);

    const copy = duplicateScenario(scenarios[0]!, "2026-05-06T12:01:00.000Z", "scenario-copy");
    const saved = saveScenarioToLibrary(copy, loadScenarioLibrary(storage).scenarios, storage);
    expect(saved[0]?.scenarioId).toBe("scenario-copy");

    const deleted = deleteScenarioFromLibrary("scenario-copy", saved, storage);
    expect(deleted.some((scenario) => scenario.scenarioId === "scenario-copy")).toBe(false);

    storage.setItem("ortus.scenarioBuilder.v1", "{bad json");
    expect(loadScenarioLibrary(storage).warning).toMatch(/invalid/i);

    const valid = scenarios[0]!;
    storage.setItem("ortus.scenarioBuilder.v1", JSON.stringify([valid, { ...valid, scenarioId: "", templateId: "missing-template" }]));
    const recovered = loadScenarioLibrary(storage);
    expect(recovered.scenarios.map((scenario) => scenario.scenarioId)).toEqual([valid.scenarioId]);
    expect(recovered.warning).toMatch(/Some stored scenarios/);
  });

  it("exports and imports scenario JSON while rejecting snapshot JSON", () => {
    const scenario = patchScenarioVariantOptions(
      createDefaultScenario({ template: flockingTemplate, scenarioId: "scenario-export", now, seed: "export-seed" }),
      { behaviorMode: "groupAware", agentComposition: { agentCount: 40, groupCount: 2, primaryGroupRatio: 0.65 } },
      now
    );
    const json = serializeAuthoredScenario(scenario);
    const imported = deserializeAuthoredScenario(json);
    expect(imported.scenarioId).toBe("scenario-export");
    expect(imported.behaviorMode).toBe(scenario.behaviorMode);
    expect(imported.agentComposition).toEqual(scenario.agentComposition);
    expect(imported.environmentOptions).toEqual(scenario.environmentOptions);
    expect(json).toContain('"artifactType": "ortus.scenario"');
    expect(json).not.toContain('"world"');
    expect(json).not.toContain('"interventionHistory"');
    expect(json).not.toContain('"finalMetrics"');

    const runConfig = runConfigFromScenario(imported);
    expect(runConfig.behaviorMode).toBe("groupAware");
    expect(runConfig.agentComposition?.groupCount).toBe(2);

    const snapshotJson = new SimulationEngine(epidemicTemplate, { seed: "snapshot-seed" }).exportSnapshot();
    expect(() => deserializeAuthoredScenario(snapshotJson)).toThrow(/Invalid scenario/);
    expect(() => deserializeAuthoredScenario("{bad json")).toThrow(/Invalid scenario JSON/);
  });
});

class MemoryStorage implements ScenarioStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}
