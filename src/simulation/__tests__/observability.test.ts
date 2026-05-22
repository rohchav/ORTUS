import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  boundaryModelArtifactType,
  createDefaultScenario,
  createEngineFromScenario,
  deserializeObservabilityModel,
  fieldLayerArtifactType,
  getArtifactFamily,
  getMeasurementProcess,
  getMeasurementsForVariable,
  getObservableVariable,
  getObservationSchedule,
  getObservabilityWarnings,
  getPrimitive,
  getTemplateCapability,
  hybridCompositionArtifactType,
  listActiveMeasurements,
  listEmpiricalMeasurements,
  listLatentVariables,
  listMeasurements,
  listMeasurementProcesses,
  listModelOutputMeasurements,
  listObservableVariables,
  listObservationSchedules,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  listSyntheticMeasurements,
  listUnobservedVariables,
  modelHasEmpiricalMeasurements,
  modelHasLatentVariables,
  observabilityModelArtifactType,
  productionTemplateMap,
  productionTemplates,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeObservabilityModel,
  summarizeObservabilityModel,
  validateCompositionCapabilities,
  validateObservabilityModel,
  validateObservabilityModelForRuntime,
  type HybridModelComposition,
  type ObservabilityModel
} from "../index";

const repoRoot = process.cwd();

function observabilityModel(overrides: Partial<ObservabilityModel> = {}): ObservabilityModel {
  return {
    schemaVersion: "1",
    artifactType: observabilityModelArtifactType,
    id: "observability-model",
    name: "Observability Model",
    version: "1.0.0",
    variables: [
      {
        id: "infected-count",
        label: "Infected Count",
        variableKind: "metric",
        observability: "direct",
        targetPath: "metrics.infectedCount",
        metricId: "infectedCount",
        unit: "agents"
      }
    ],
    ...overrides
  };
}

function fullObservabilityModel(overrides: Partial<ObservabilityModel> = {}): ObservabilityModel {
  return observabilityModel({
    scope: { templateId: "epidemic-spread", notes: ["Scope references a template only."] },
    variables: [
      observabilityModel().variables[0]!,
      {
        id: "latent-risk",
        label: "Latent Risk",
        variableKind: "latent",
        observability: "latent",
        targetPath: "state.latentRisk",
        unit: "index"
      },
      {
        id: "unobserved-memory",
        label: "Unobserved Memory",
        variableKind: "state",
        observability: "unobserved",
        targetPath: "state.memory"
      }
    ],
    schedules: [
      {
        id: "every-two",
        label: "Every Two Ticks",
        scheduleType: "fixedInterval",
        intervalTicks: 2,
        executable: false
      },
      {
        id: "unknown-schedule",
        label: "Unknown Schedule",
        scheduleType: "unknown",
        executable: false
      }
    ],
    measurementProcesses: [
      {
        id: "sampling-process",
        label: "Sampling Process",
        processType: "sampling",
        samplingDescription: "Sample a structural subset; no runtime sampler is implemented.",
        executable: false
      },
      {
        id: "noise-process",
        label: "Noise Process",
        processType: "noise",
        executable: false
      }
    ],
    measurements: [
      {
        id: "infected-output",
        label: "Infected Model Output",
        variableId: "infected-count",
        measurementKind: "aggregate",
        sourceType: "modelOutput",
        scheduleId: "every-two",
        processId: "sampling-process",
        unit: "agents",
        active: true,
        executable: false,
        notes: ["Runtime metrics are model outputs, not empirical observations."]
      },
      {
        id: "synthetic-risk",
        label: "Synthetic Risk",
        variableId: "latent-risk",
        measurementKind: "exact",
        sourceType: "synthetic",
        unit: "score",
        active: true,
        executable: false
      },
      {
        id: "empirical-placeholder",
        label: "Empirical Placeholder",
        variableId: "unobserved-memory",
        measurementKind: "proxy",
        sourceType: "externalPlaceholder",
        active: true,
        executable: false
      }
    ],
    ...overrides
  });
}

function composition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "observability-composition",
    name: "Observability Composition",
    version: "1.0.0",
    baseTemplateId: "forest-fire",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("observability and measurement model services", () => {
  it("validates observability models conservatively", () => {
    expect(validateObservabilityModel(observabilityModel()).id).toBe("observability-model");
    expect(validateObservabilityModel(fullObservabilityModel()).measurements?.[0]?.id).toBe("infected-output");
    expect(() => validateObservabilityModel(observabilityModel({ id: "" }))).toThrow(/Invalid observability model/);
    expect(() => validateObservabilityModel(observabilityModel({ name: "" }))).toThrow(/Invalid observability model/);
    expect(() => validateObservabilityModel(observabilityModel({ artifactType: "ortus.fieldLayer" as never }))).toThrow(/Invalid observability model/);
    expect(() => validateObservabilityModel(observabilityModel({ version: "" }))).toThrow(/Invalid observability model/);
    expect(() => validateObservabilityModel({ ...observabilityModel(), variables: undefined })).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(observabilityModel({ variables: [observabilityModel().variables[0]!, { ...observabilityModel().variables[0]! }] }))
    ).toThrow(/Duplicate variable id/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [fullObservabilityModel().measurements![0]!, { ...fullObservabilityModel().measurements![0]! }] }))
    ).toThrow(/Duplicate measurement id/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ schedules: [fullObservabilityModel().schedules![0]!, { ...fullObservabilityModel().schedules![0]! }] }))
    ).toThrow(/Duplicate schedule id/);
    expect(() =>
      validateObservabilityModel(
        fullObservabilityModel({
          measurementProcesses: [fullObservabilityModel().measurementProcesses![0]!, { ...fullObservabilityModel().measurementProcesses![0]! }]
        })
      )
    ).toThrow(/Duplicate measurement process id/);
    expect(() => validateObservabilityModel(observabilityModel({ variables: [{ ...observabilityModel().variables[0]!, variableKind: "truth" as never }] }))).toThrow(
      /Invalid observability model/
    );
    expect(() => validateObservabilityModel(observabilityModel({ variables: [{ ...observabilityModel().variables[0]!, observability: "verified" as never }] }))).toThrow(
      /Invalid observability model/
    );
    expect(() => validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, variableId: "missing" }] }))).toThrow(
      /unknown variableId/
    );
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, measurementKind: "likelihood" as never }] }))
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, sourceType: "truthData" as never }] }))
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, scheduleId: "missing" }] }))
    ).toThrow(/unknown scheduleId/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, processId: "missing" }] }))
    ).toThrow(/unknown processId/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, executable: true as never }] }))
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, lagTicks: -1 }] }))
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ measurements: [{ ...fullObservabilityModel().measurements![0]!, lagTicks: Infinity }] }))
    ).toThrow(/non-finite/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ schedules: [{ ...fullObservabilityModel().schedules![0]!, scheduleType: "cron" as never }] }))
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ schedules: [{ ...fullObservabilityModel().schedules![0]!, intervalTicks: 0 }] }))
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ schedules: [{ id: "specific", label: "Specific", scheduleType: "specificTicks", ticks: [], executable: false }] }))
    ).toThrow(/requires ticks/);
    expect(() =>
      validateObservabilityModel(
        fullObservabilityModel({ schedules: [{ id: "specific", label: "Specific", scheduleType: "specificTicks", ticks: [1, 1], executable: false }] })
      )
    ).toThrow(/duplicate tick/);
    expect(() =>
      validateObservabilityModel(fullObservabilityModel({ schedules: [{ ...fullObservabilityModel().schedules![0]!, executable: true as never }] }))
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(
        fullObservabilityModel({ measurementProcesses: [{ ...fullObservabilityModel().measurementProcesses![0]!, processType: "kalman" as never }] })
      )
    ).toThrow(/Invalid observability model/);
    expect(() =>
      validateObservabilityModel(
        fullObservabilityModel({ measurementProcesses: [{ ...fullObservabilityModel().measurementProcesses![0]!, executable: true as never }] })
      )
    ).toThrow(/Invalid observability model/);
    expect(() => validateObservabilityModel({ ...observabilityModel(), extra: true })).toThrow(/Invalid observability model/);
    expect(() => validateObservabilityModel(observabilityModel({ metadata: { world: { tick: 1 } } }))).toThrow(/live-state|executable/);
    expect(() => validateObservabilityModel(observabilityModel({ metadata: { formula: "x + y" } }))).toThrow(/executable-shaped/);
    expect(() => validateObservabilityModel(observabilityModel({ metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data/);
    expect(() => validateObservabilityModel(observabilityModel({ metadata: { observedData: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data/);
    expect(() => validateObservabilityModel(observabilityModel({ metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data/);
    expect(() => validateObservabilityModel(observabilityModel({ metadata: { huge: "x".repeat(230_000) } }))).toThrow(/Observability model/);
    expect(() => validateObservabilityModel(new Date())).toThrow(/plain JSON|Invalid observability model/);
    expect(() => validateObservabilityModel({ ...observabilityModel(), metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid observability model|executable-shaped/
    );
  });

  it("surfaces measurement warnings without implying runtime observation, calibration, validation, or truth", () => {
    const warned = fullObservabilityModel({
      schedules: [
        { id: "unknown", label: "Unknown", scheduleType: "unknown", executable: false },
        { id: "event", label: "Event", scheduleType: "eventTriggered", executable: false }
      ],
      measurementProcesses: [
        { id: "noise", label: "Noise", processType: "noise", executable: false },
        { id: "bias", label: "Bias", processType: "bias", executable: false },
        { id: "missingness", label: "Missing", processType: "missingness", executable: false },
        { id: "sampling", label: "Sampling", processType: "sampling", executable: false },
        { id: "proxy-process", label: "Proxy", processType: "proxy", executable: false }
      ],
      measurements: [
        {
          id: "empirical",
          label: "Empirical",
          variableId: "infected-count",
          measurementKind: "exact",
          sourceType: "empirical",
          unit: "people",
          active: true,
          executable: false
        },
        {
          id: "synthetic",
          label: "Synthetic",
          variableId: "latent-risk",
          measurementKind: "exact",
          sourceType: "synthetic",
          active: true,
          executable: false
        },
        {
          id: "proxy",
          label: "Proxy",
          variableId: "unobserved-memory",
          measurementKind: "proxy",
          sourceType: "externalPlaceholder",
          active: true,
          executable: false
        }
      ]
    });
    const warnings = getObservabilityWarnings(warned).join(" ");
    expect(warnings).toMatch(/Empirical measurement empirical has no provenance/);
    expect(warnings).toMatch(/Empirical measurement empirical is a source declaration, not evidence by itself/);
    expect(warnings).toMatch(/Synthetic measurement synthetic has no synthetic-detail/);
    expect(warnings).toMatch(/Proxy measurement proxy has no proxy explanation/);
    expect(warnings).toMatch(/Latent variable latent-risk has a direct\/exact measurement/);
    expect(warnings).toMatch(/Unobserved variable unobserved-memory has active measurement/);
    expect(warnings).toMatch(/externalPlaceholder/);
    expect(warnings).toMatch(/structural declaration/);
    expect(warnings).toMatch(/unknown timing/);
    expect(warnings).toMatch(/Event-triggered observation schedule event has no event description/);
    expect(warnings).toMatch(/noise without a noise description/);
    expect(warnings).toMatch(/bias without a bias description/);
    expect(warnings).toMatch(/missingness without a missingness description/);
    expect(warnings).toMatch(/sampling without a sampling description/);
    expect(warnings).toMatch(/proxy transformation without a transformation description/);
    expect(warnings).toMatch(/unit people differs from variable infected-count unit agents/);
    expect(warnings).not.toMatch(/calibrated|causal proof|truth|validated/i);

    const report = validateObservabilityModelForRuntime(warned);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "observability", requiredSupportLevel: "runtime" });
    expect(report.warnings.join(" ")).toContain("does not collect, calibrate, or validate data");

    const provenanceWarnings = getObservabilityWarnings(
      fullObservabilityModel({
        measurements: [
          {
            id: "empirical-with-provenance",
            label: "Empirical With Provenance",
            variableId: "infected-count",
            measurementKind: "sampled",
            sourceType: "empirical",
            active: false,
            executable: false,
            notes: ["Provenance: named source placeholder only."]
          }
        ]
      })
    ).join(" ");
    expect(provenanceWarnings).not.toMatch(/no provenance/);
    expect(provenanceWarnings).toMatch(/source declaration, not evidence by itself/);
  });

  it("queries and summarizes observability structure without mutating input", () => {
    const model = fullObservabilityModel();
    const before = JSON.stringify(model);
    expect(listObservableVariables(model).map((variable) => variable.id)).toEqual(["infected-count"]);
    expect(listLatentVariables(model).map((variable) => variable.id)).toEqual(["latent-risk"]);
    expect(listUnobservedVariables(model).map((variable) => variable.id)).toEqual(["unobserved-memory"]);
    expect(getObservableVariable(model, "infected-count")?.metricId).toBe("infectedCount");
    expect(listMeasurements(model).map((measurement) => measurement.id)).toEqual(["infected-output", "synthetic-risk", "empirical-placeholder"]);
    expect(listActiveMeasurements(model)).toHaveLength(3);
    expect(getMeasurementsForVariable(model, "latent-risk").map((measurement) => measurement.id)).toEqual(["synthetic-risk"]);
    expect(listEmpiricalMeasurements(model)).toHaveLength(0);
    expect(listSyntheticMeasurements(model).map((measurement) => measurement.id)).toEqual(["synthetic-risk"]);
    expect(listModelOutputMeasurements(model).map((measurement) => measurement.id)).toEqual(["infected-output"]);
    expect(listObservationSchedules(model).map((schedule) => schedule.id)).toEqual(["every-two", "unknown-schedule"]);
    expect(getObservationSchedule(model, "every-two")?.intervalTicks).toBe(2);
    expect(listMeasurementProcesses(model).map((process) => process.id)).toEqual(["sampling-process", "noise-process"]);
    expect(getMeasurementProcess(model, "sampling-process")?.processType).toBe("sampling");
    expect(modelHasEmpiricalMeasurements(model)).toBe(false);
    expect(modelHasLatentVariables(model)).toBe(true);
    expect(summarizeObservabilityModel(model)).toMatchObject({
      id: "observability-model",
      variableCount: 3,
      directlyObservableCount: 1,
      indirectlyObservableCount: 0,
      latentCount: 1,
      unobservedCount: 1,
      measurementCount: 3,
      activeMeasurementCount: 3,
      empiricalMeasurementCount: 0,
      syntheticMeasurementCount: 1,
      modelOutputMeasurementCount: 1,
      scheduleCount: 2,
      processCount: 2,
      executableCount: 0
    });
    expect(JSON.stringify(model)).toBe(before);
    const returned = listMeasurements(model)[0] as { label: string };
    returned.label = "Mutated";
    expect(listMeasurements(model)[0]?.label).toBe("Infected Model Output");

    const minimal = observabilityModel();
    expect(listMeasurements(minimal)).toEqual([]);
    expect(listActiveMeasurements(minimal)).toEqual([]);
    expect(listObservationSchedules(minimal)).toEqual([]);
    expect(listMeasurementProcesses(minimal)).toEqual([]);
    expect(getObservationSchedule(minimal, "missing")).toBeUndefined();
    expect(getMeasurementProcess(minimal, "missing")).toBeUndefined();
    expect(summarizeObservabilityModel(minimal)).toMatchObject({ measurementCount: 0, scheduleCount: 0, processCount: 0, executableCount: 0 });
  });

  it("serializes only observability artifacts and rejects other artifact families", () => {
    const model = fullObservabilityModel();
    const json = serializeObservabilityModel(model);
    expect(json).toContain(`"artifactType": "${observabilityModelArtifactType}"`);
    expect(deserializeObservabilityModel(json)).toMatchObject({ id: "observability-model", artifactType: observabilityModelArtifactType });
    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.networkMetrics",
      "ortus.resourceSystem",
      "ortus.resourceMetrics",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.feedbackEventMetrics",
      hybridCompositionArtifactType,
      scaleModelArtifactType,
      scaleViewStateArtifactType,
      boundaryModelArtifactType,
      fieldLayerArtifactType
    ]) {
      expect(() => deserializeObservabilityModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeObservabilityModel(JSON.stringify({ schemaVersion: "1", artifactType: observabilityModelArtifactType }))).toThrow(
      /Invalid observability model/
    );
    expect(() => deserializeObservabilityModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeObservabilityModel(JSON.stringify({ ...model, metadata: { observationData: [{ tick: 1, value: 2 }] } }))).toThrow(
      /external-data/
    );
    expect(() => deserializeObservabilityModel({ ...model, metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid observability model|executable-shaped/
    );
  });

  it("updates registry and template capabilities without making templates observability-runtime capable", () => {
    expect(getPrimitive("observability")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("observability");
    expect(getArtifactFamily(observabilityModelArtifactType)).toMatchObject({
      primitiveId: "observability",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("causalAssumptions")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("validationCalibration")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("observability");
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "observability")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "validationCalibration")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
  });

  it("keeps runtime metrics distinct from observability and empirical evidence", () => {
    const template = productionTemplateMap["forest-fire"];
    const scenario = createDefaultScenario({ template, scenarioId: "forest-observability-distinction", seed: "forest-observability", now: "2026-05-16T12:00:00.000Z" });
    const { engine } = createEngineFromScenario(scenario);
    engine.runSteps(2);
    const latestMetrics = engine.createSnapshot().metricsHistory.at(-1)?.values;
    expect(latestMetrics?.burningFraction).toBeDefined();
    expect(getTemplateCapability("forest-fire", "observability")).toMatchObject({ runtimeActive: false });
    expect(forestMetricObservability().variables[0]).toMatchObject({ variableKind: "metric", metricId: "burningFraction" });
    expect(validateObservabilityModelForRuntime(forestMetricObservability()).runnableNow).toBe(false);

    const profileText = JSON.stringify(template.assumptionProfile).toLowerCase();
    expect(profileText).toContain("runtime metrics are model outputs");
    expect(profileText).toContain("forest-fire metrics are qualitative model outputs, not empirical wildfire measurements");
  });

  it("keeps observability composition references structural and non-runnable for runtime requirements", () => {
    const report = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "observability-ref",
            primitiveId: "observability",
            attachmentType: "observabilityModel",
            mode: "reference",
            artifactType: observabilityModelArtifactType,
            artifactId: "observability-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "observability", requiredSupportLevel: "runtime" }]
      })
    );
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toContain("observability");

    const validationRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "observability-ref",
            primitiveId: "observability",
            attachmentType: "observabilityModel",
            mode: "reference",
            artifactType: observabilityModelArtifactType,
            artifactId: "observability-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "validationCalibration", requiredSupportLevel: "metadata" }]
      })
    );
    expect(validationRequirement.runnableNow).toBe(false);
    expect(validationRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("validationCalibration");
  });

  it("documents observability boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Runtime metrics are model outputs; they are not automatically empirical observations.");
    expect(docs).toContain("An observability model defines how something could be measured; it does not collect, calibrate, or validate data.");
    expect(docs).toContain("Synthetic observations are generated or declared model-side; they must not be treated as observed evidence.");
    expect(docs).toContain("Causal assumption models declare influence assumptions; they do not prove causality.");
    expect(docs).toContain("Do not treat runtime metrics as empirical observations.");

    const observabilityDir = join(repoRoot, "src", "simulation", "observability");
    const source = readdirSync(observabilityDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(observabilityDir, file), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']zustand["']/);
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.");
    expect(source).not.toContain("Canvas");
    expect(source).not.toContain("WorldStage");
    expect(source).not.toMatch(/from ["'][^"']*\/(renderer|components|app|ingestion|inference|calibration|mcmc|filter|kalman|particle|compiler|visualBuilder)(\/|["'])/);
  });
});

function forestMetricObservability(): ObservabilityModel {
  return observabilityModel({
    scope: { templateId: "forest-fire" },
    variables: [
      {
        id: "forest-burning-fraction",
        label: "Forest Burning Fraction",
        variableKind: "metric",
        observability: "direct",
        targetPath: "metrics.burningFraction",
        metricId: "burningFraction",
        unit: "fraction",
        notes: ["This is a model metric reference, not an empirical wildfire observation."]
      }
    ],
    measurements: [
      {
        id: "forest-burning-output",
        label: "Forest Burning Model Output",
        variableId: "forest-burning-fraction",
        measurementKind: "exact",
        sourceType: "modelOutput",
        unit: "fraction",
        active: true,
        executable: false,
        notes: ["Runtime metrics are model outputs, not empirical observations."]
      }
    ]
  });
}
