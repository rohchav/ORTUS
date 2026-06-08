import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterValues, SimulationTemplate } from "../kernel/types";
import { validateTemplate } from "../kernel/Validation";
import { createDefaultRunConfig, validateRunConfig } from "../runs/runConfig";
import { productionTemplateIds, productionTemplateMap, productionTemplates } from "../templates/registry";
import { templateAssumptionProfile, validateAssumptionProfile } from "../assumptions";
import {
  defaultParameters,
  getTemplateDescriptor,
  legendEntries,
  metricLabel,
  metricNotes,
  renderAgents,
  renderGrid,
  requireTemplateDescriptor,
  templateDescriptors
} from "../../lib/templateVisuals";

const nonPredictiveNote = "These models are exploratory simulations, not calibrated predictive tools.";

const invalidParameterCases: Record<string, ParameterValues> = {
  "epidemic-spread": { initialInfected: 5, agentCount: 2 },
  "opinion-dynamics": { influenceStrength: -0.1 },
  "predator-prey": { initialPrey: 0, initialPredators: 0 },
  "schelling-segregation": { density: 1 },
  "flocking-boids": { separationRadius: 80, perceptionRadius: 20 },
  "forest-fire": { spreadProbability: 1.2 }
};

const productionTemplateCases = productionTemplates.map((template) => [template.id, template] as const);

describe("production template system", () => {
  it("keeps production template registry and UI descriptors aligned", () => {
    expect(productionTemplates.map((template) => template.id)).toEqual([...productionTemplateIds]);
    expect(Object.keys(productionTemplateMap).sort()).toEqual([...productionTemplateIds].sort());
    expect(templateDescriptors.map((descriptor) => descriptor.id)).toEqual([...productionTemplateIds]);
    expect(new Set(productionTemplates.map((template) => template.id)).size).toBe(productionTemplates.length);
    expect(() => requireTemplateDescriptor("missing-template")).toThrow(/Unknown simulation template/);

    for (const descriptor of templateDescriptors) {
      expect(descriptor.template).toBe(productionTemplateMap[descriptor.id]);
      expect(descriptor.shortName.length).toBeGreaterThan(0);
      expect(descriptor.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(descriptor.atmosphere.length).toBeGreaterThan(0);
      expect(getTemplateDescriptor(descriptor.id).id).toBe(descriptor.id);
    }
  });

  it("exposes a consistent external template API and ODD-style documentation", () => {
    for (const template of productionTemplates) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(template.capabilities).toEqual(
        expect.objectContaining({
          supportsScenarioBuilder: true,
          supportsMetricHistory: true,
          supportsRunComparison: true,
          supportsExperimentRunner: true,
          supportsSnapshotExport: true,
          supportsNetworkOptions: false,
          supportsNetworkMetrics: false,
          supportsResources: false,
          supportsStocks: false,
          supportsFlows: false,
          supportsResourceMetrics: false,
          supportsEvents: false,
          supportsDelays: false,
          supportsFeedbackLoops: false,
          supportsFeedbackMetrics: false,
          supportsUncertaintyConfig: true
        })
      );
      expect(template.spaceDefinition?.type).toMatch(/^(continuous2d|grid2d)$/);
      expect(template.spaceDefinition?.description).toBeTruthy();
      expect(template.entityTypeDefinitions?.length).toBeGreaterThan(0);
      for (const entityType of template.entityTypeDefinitions ?? []) {
        expect(entityType.typeId).toBeTruthy();
        expect(entityType.label).toBeTruthy();
        expect(entityType.description).toBeTruthy();
        if (entityType.countParameterKey) {
          expect(template.parameterDefinitions.some((definition) => definition.key === entityType.countParameterKey)).toBe(true);
        }
      }
      expect(template.parameterDefinitions.length).toBeGreaterThan(0);
      expect(template.metricDefinitions?.length).toBeGreaterThan(0);
      expect(typeof template.createInitialWorld).toBe("function");
      expect(typeof template.registerSystems).toBe("function");
      expect(typeof template.registerMetrics).toBe("function");
      expect(typeof template.getVisuals).toBe("function");
      expect(typeof template.validateParameters).toBe("function");

      const docs = template.documentation;
      expect(docs.purpose).toBeTruthy();
      expect(docs.entities.length).toBeGreaterThan(0);
      expect(docs.stateVariables.length).toBeGreaterThan(0);
      expect(docs.processOverview).toBeTruthy();
      expect(docs.scheduling).toBeTruthy();
      expect(Object.keys(docs.designConcepts).length).toBeGreaterThan(0);
      expect(docs.initialization).toBeTruthy();
      expect(docs.submodels.length).toBeGreaterThan(0);
      expect(docs.assumptions.length).toBeGreaterThan(0);
      expect(docs.limitations).toContain(nonPredictiveNote);
      expect(docs.notRepresented?.length).toBeGreaterThan(0);
      expect(docs.appropriateUse?.length).toBeGreaterThan(0);
      expect(docs.inappropriateUse?.length).toBeGreaterThan(0);
      const profile = templateAssumptionProfile(template);
      expect(validateAssumptionProfile(profile)).toEqual(profile);
      expect(profile.ownerType).toBe("template");
      expect(profile.ownerId).toBe(template.id);
      expect(profile.assumptions.length).toBeGreaterThan(0);
      expect(profile.limitations.length).toBeGreaterThan(0);
      expect(profile.notRepresented.length).toBeGreaterThan(0);
      expect(profile.appropriateUse.length).toBeGreaterThan(0);
      expect(profile.inappropriateUse.length).toBeGreaterThan(0);
      expect(["illustrative", "internallyTested"]).toContain(profile.validationStatus);
      expect(profile.validationNotes).toMatch(/not calibrated|externally validated/i);
      expect(template.behaviorModes?.some((mode) => mode.id === "default")).toBe(true);
    }
    expect(templateAssumptionProfile(productionTemplateMap["schelling-segregation"]).ethicsNotes.length).toBeGreaterThan(0);
    expect(templateAssumptionProfile(productionTemplateMap["opinion-dynamics"]).ethicsNotes.length).toBeGreaterThan(0);
    expect(templateAssumptionProfile(productionTemplateMap["epidemic-spread"]).ethicsNotes.length).toBeGreaterThan(0);
  });

  it("declares explicit production template space definitions and capability flags", () => {
    expect(productionTemplateMap["schelling-segregation"].spaceDefinition?.type).toBe("grid2d");
    expect(productionTemplateMap["flocking-boids"].spaceDefinition?.type).toBe("continuous2d");

    for (const template of productionTemplates) {
      expect(template.spaceDefinition?.type).toBeTruthy();
      expect(template.capabilities?.supportsNetworkSpace).toBe(false);
      expect(template.capabilities?.supportsNetworkOptions).toBe(false);
      expect(template.capabilities?.supportsNetworkMetrics).toBe(false);
      expect(template.capabilities?.supportsResources).toBe(false);
      expect(template.capabilities?.supportsStocks).toBe(false);
      expect(template.capabilities?.supportsFlows).toBe(false);
      expect(template.capabilities?.supportsResourceMetrics).toBe(false);
      expect(template.capabilities?.supportsEvents).toBe(false);
      expect(template.capabilities?.supportsDelays).toBe(false);
      expect(template.capabilities?.supportsFeedbackLoops).toBe(false);
      expect(template.capabilities?.supportsFeedbackMetrics).toBe(false);
      expect(template.capabilities?.supportsEnvironmentLayers).toBe(false);
      expect(template.capabilities?.supportsUncertaintyConfig).toBe(true);
      if (template.spaceDefinition?.type === "continuous2d") {
        expect(template.capabilities?.supportsContinuousSpace).toBe(true);
        expect(template.capabilities?.supportsGridSpace).toBe(false);
      }
      if (template.spaceDefinition?.type === "grid2d") {
        expect(template.capabilities?.supportsGridSpace).toBe(true);
        expect(template.capabilities?.supportsContinuousSpace).toBe(false);
      }
    }
  });

  it("creates default RunConfig recipes for every production template without snapshot or summary fields", () => {
    for (const template of productionTemplates) {
      const config = createDefaultRunConfig({ template, seed: `run-config-${template.id}` });
      expect(config.schemaVersion).toBe("1");
      expect(config.templateId).toBe(template.id);
      expect(config.seed).toBe(`run-config-${template.id}`);
      expect(Object.keys(config.parameters).sort()).toEqual(template.parameterDefinitions.map((definition) => definition.key).sort());
      expect(config.behaviorMode).toBe("default");
      expect(config.agentComposition).toEqual(expect.any(Object));
      expect(config.environmentOptions).toEqual(expect.any(Object));
      expect(config.uncertaintyConfig).toBeUndefined();
      expect("world" in config).toBe(false);
      expect("tick" in config).toBe(false);
      expect("runId" in config).toBe(false);
      expect("finalMetrics" in config).toBe(false);

      const runConfigWithUncertaintyMetadata = validateRunConfig({ ...config, uncertaintyConfig: { configId: "uncertainty-placeholder" } }, template);
      expect(runConfigWithUncertaintyMetadata.uncertaintyConfig).toEqual({ configId: "uncertainty-placeholder" });
      expect(() => validateRunConfig({ ...config, behaviorMode: "unsupported-mode" }, template)).toThrow(/Unsupported behavior mode/);
    }
  });

  it("rejects malformed behavior mode and composition metadata before runtime", () => {
    const flocking = productionTemplateMap["flocking-boids"];
    const defaultMode = flocking.behaviorModes?.find((mode) => mode.id === "default");
    const agentCount = flocking.agentCompositionDefinitions?.find((definition) => definition.key === "agentCount");
    expect(defaultMode).toBeDefined();
    expect(agentCount).toBeDefined();

    expect(() =>
      validateTemplate({
        ...flocking,
        behaviorModes: [{ ...defaultMode!, id: "foreign", templateId: "other-template" }]
      })
    ).toThrow(/references template/);

    expect(() =>
      validateTemplate({
        ...flocking,
        behaviorModes: [{ ...defaultMode!, id: "bad-composition-field", supportedCompositionFields: ["missingField"] }]
      })
    ).toThrow(/unknown agent composition field/);

    expect(() =>
      validateTemplate({
        ...flocking,
        behaviorModes: [{ ...defaultMode!, id: "bad-parameter", supportedParameters: ["missingParameter"] }]
      })
    ).toThrow(/unknown parameter/);

    expect(() =>
      validateTemplate({
        ...flocking,
        agentCompositionDefinitions: [...(flocking.agentCompositionDefinitions ?? []), { ...agentCount! }]
      })
    ).toThrow(/Duplicate agent composition key/);

    expect(() =>
      validateTemplate({
        ...flocking,
        assumptionProfile: {
          ...flocking.assumptionProfile!,
          ownerId: "other-template"
        }
      })
    ).toThrow(/Assumption profile/);
  });

  it("defines readable parameters and rejects known invalid parameter combinations", () => {
    for (const template of productionTemplates) {
      const keys = new Set<string>();
      for (const definition of template.parameterDefinitions) {
        expect(definition.key).toBeTruthy();
        expect(keys.has(definition.key)).toBe(false);
        keys.add(definition.key);
        expect(definition.label).toBeTruthy();
        expect(definition.description).toBeTruthy();
        expect(definition.liveUpdate).toEqual(expect.any(Boolean));
        if (definition.type === "integer") {
          expect(Number.isInteger(definition.defaultValue)).toBe(true);
          if (typeof definition.step === "number") {
            expect(Number.isInteger(definition.step)).toBe(true);
          }
        }
        if (definition.type === "number" || definition.type === "integer") {
          expect(typeof definition.defaultValue).toBe("number");
          if (typeof definition.min === "number") {
            expect(definition.defaultValue as number).toBeGreaterThanOrEqual(definition.min);
          }
          if (typeof definition.max === "number") {
            expect(definition.defaultValue as number).toBeLessThanOrEqual(definition.max);
          }
        }
        if (definition.type === "select") {
          expect(definition.options?.length).toBeGreaterThan(0);
          expect(definition.options).toContain(definition.defaultValue);
        }
      }

      expect(() => new SimulationEngine(template, { parameters: defaultParameters(template) })).not.toThrow();
      expect(() =>
        new SimulationEngine(template, {
          parameters: { ...defaultParameters(template), ...invalidParameterCases[template.id] }
        })
      ).toThrow();
    }
  });

  it.each(productionTemplateCases)(
    "%s collects finite metrics and exposes render metadata",
    (_templateId, template) => {
      const engine = new SimulationEngine(template, { seed: `template-system-${template.id}` });
      engine.runSteps(100);
      const snapshot = engine.createSnapshot();
      const definitions = engine.metrics.definitionsList();
      const metricKeys = new Set(definitions.map((definition) => definition.key));

      expect(definitions.length).toBeGreaterThan(0);
      expect(metricKeys.size).toBe(definitions.length);
      expect(new Set(template.metricDefinitions?.map((definition) => definition.key))).toEqual(metricKeys);
      for (const definition of definitions) {
        const templateMetric = template.metricDefinitions?.find((metric) => metric.key === definition.key);
        expect(templateMetric).toBeDefined();
        expect(definition.label).toBeTruthy();
        expect(definition.description).toBeTruthy();
        expect(definition.supportsHistory).toBe(true);
        expect(definition.comparableAcrossRuns).toBe(true);
        expect(definition.source).toBeTruthy();
        expect(definition.valueType).toMatch(/^(number|integer)$/);
        expect(metricLabel(template.id, definition.key)).toBeTruthy();
      }
      expect(metricNotes(template.id).length).toBeGreaterThan(0);
      expect(snapshot.metricsHistory.length).toBeGreaterThan(0);
      expect(snapshot.metricsHistory.length).toBeLessThanOrEqual(engine.metrics.maxHistoryLength);
      for (const record of snapshot.metricsHistory) {
        for (const value of Object.values(record.values)) {
          expect(Number.isFinite(value)).toBe(true);
        }
      }

      const visuals = template.getVisuals(snapshot);
      expect(visuals.components).toEqual(expect.any(Object));
      expect(visuals.description).toBeTruthy();
      expect(legendEntries(template.id).length).toBeGreaterThan(0);

      const grid = renderGrid(snapshot);
      const agents = renderAgents(snapshot);
      if (grid) {
        expect(grid.agents.length).toBe(snapshot.entities.filter((entity) => entity.alive).length);
      } else {
        expect(agents.length).toBe(snapshot.entities.filter((entity) => entity.alive).length);
      }
    },
    30_000
  );

  it.each(productionTemplateCases)(
    "%s is deterministic and restores snapshots",
    (_templateId, template) => {
      const options = { seed: `determinism-${template.id}`, parameters: defaultParameters(template) };
      const left = new SimulationEngine(template, options);
      const right = new SimulationEngine(template, options);
      left.runSteps(100);
      right.runSteps(100);
      expect(left.createSnapshot()).toEqual(right.createSnapshot());

      const original = new SimulationEngine(template, options);
      original.runSteps(50);
      const snapshotAt50 = original.exportSnapshot();
      original.runSteps(50);
      const restored = SimulationEngine.fromSnapshot(template, snapshotAt50);
      restored.runSteps(50);
      expect(restored.createSnapshot()).toEqual(original.createSnapshot());
    },
    30_000
  );

  it("keeps scenario/snapshot import paths consistent and rejects corrupted nested state", () => {
    for (const template of productionTemplates) {
      const engine = new SimulationEngine(template, { seed: `io-${template.id}` });
      engine.runSteps(10);
      const scenario = engine.exportScenario();
      const snapshot = engine.snapshotExport();

      const restarted = SimulationEngine.fromScenario(template, scenario);
      expect(restarted.createSnapshot().tick).toBe(0);

      const restored = SimulationEngine.fromSnapshot(template, snapshot);
      expect(restored.createSnapshot()).toEqual(engine.createSnapshot());

      const corrupted = JSON.parse(JSON.stringify(snapshot)) as ReturnType<SimulationEngine["snapshotExport"]>;
      const first = firstComponentReference(corrupted);
      expect(first).toBeDefined();
      corrupted.world.components[first!.componentType]![first!.entityId] = { invalid: Number.NaN };
      expect(() => SimulationEngine.fromSnapshot(template, corrupted)).toThrow();
    }
  });

  it("different seeds usually produce different production template states", () => {
    for (const template of productionTemplates) {
      const left = new SimulationEngine(template, { seed: `seed-a-${template.id}` });
      const right = new SimulationEngine(template, { seed: `seed-b-${template.id}` });
      left.runSteps(20);
      right.runSteps(20);
      expect(right.createSnapshot()).not.toEqual(left.createSnapshot());
    }
  }, 30_000);
});

function firstComponentReference(snapshot: ReturnType<SimulationEngine["snapshotExport"]>): { componentType: string; entityId: string } | undefined {
  for (const componentType of Object.keys(snapshot.world.components).sort((left, right) => left.localeCompare(right))) {
    const bucket = snapshot.world.components[componentType];
    if (!bucket) {
      continue;
    }
    const entityId = Object.keys(bucket).sort((left, right) => left.localeCompare(right))[0];
    if (entityId) {
      return { componentType, entityId };
    }
  }
  return undefined;
}
