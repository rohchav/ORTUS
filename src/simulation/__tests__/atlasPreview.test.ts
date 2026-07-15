import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import {
  auditLandscapeProbePlanForEphemeralPreview,
  buildEphemeralLandscapePreviewRunPlans,
  clearEphemeralLandscapePreviewResult,
  createEphemeralLandscapePreviewRequest,
  createEphemeralPreviewRequestFromLandscapeProbePlan,
  defaultEphemeralLandscapePreviewConfiguration,
  ephemeralLandscapePreviewCapabilities,
  ephemeralLandscapePreviewRequestsEqual,
  executeEphemeralLandscapePreview,
  formatEphemeralPreviewNumber,
  generateEphemeralPreviewAxisValues,
  getEphemeralLandscapePreviewScenario,
  isEphemeralLandscapePreviewResultStale,
  maxEphemeralPreviewWorkUnits,
  PreviewConfigurationValidationError,
  safeCreateEphemeralLandscapePreviewRequest,
  validateEphemeralLandscapePreviewRequest,
  type EphemeralLandscapePreviewConfigurationInput,
  type EphemeralLandscapePreviewRequest,
  type PreviewExecutionEngine
} from "../atlasPreview";

const repoRoot = process.cwd();

function configuration(
  overrides: Partial<EphemeralLandscapePreviewConfigurationInput> = {}
): EphemeralLandscapePreviewConfigurationInput {
  return {
    ...defaultEphemeralLandscapePreviewConfiguration(),
    xAxis: { parameterId: "alignmentWeight", minimum: 0.2, maximum: 0.8, pointCount: 2 },
    seeds: [101],
    tickHorizon: 2,
    metricId: "alignmentScore",
    ...overrides
  };
}

function request(overrides: Partial<EphemeralLandscapePreviewConfigurationInput> = {}): EphemeralLandscapePreviewRequest {
  return createEphemeralLandscapePreviewRequest(configuration(overrides));
}

function fakeEngine(metricId: string, value: number, records = true): PreviewExecutionEngine {
  const clock = { tick: 0 };
  return {
    clock,
    runSteps(steps) {
      clock.tick += steps;
    },
    metrics: {
      historyRecords() {
        return records ? [{ tick: clock.tick, time: clock.tick, values: { [metricId]: value } }] : [];
      }
    }
  };
}

describe("ephemeral Atlas landscape preview", () => {
  it("publishes one explicit runtime capability without inferring support from every numeric field", () => {
    expect(ephemeralLandscapePreviewCapabilities).toHaveLength(1);
    const capability = ephemeralLandscapePreviewCapabilities[0]!;
    expect(capability.templateId).toBe("flocking-boids");
    expect(capability.parameters.map((parameter) => parameter.id)).toEqual([
      "agentCount",
      "alignmentWeight",
      "cohesionWeight",
      "separationWeight",
      "noise"
    ]);
    expect(capability.metrics.map((metric) => metric.id)).toEqual(["alignmentScore", "dispersion", "averageSpeed"]);
    expect(getEphemeralLandscapePreviewScenario(capability.templateId, capability.scenario.id)).toMatchObject({
      templateId: capability.templateId,
      scenarioId: capability.scenario.id,
      initializationPreset: "random-headings",
      behaviorMode: "default"
    });
  });

  it("validates template, scenario, parameter, metric, and duplicate-axis capability boundaries", () => {
    for (const [override, path] of [
      [{ templateId: "opinion-dynamics" }, "templateId"],
      [{ scenarioId: "missing-scenario" }, "scenarioId"],
      [{ xAxis: { parameterId: "maxSpeed", minimum: 1, maximum: 2, pointCount: 2 } }, "xAxis.parameterId"],
      [{ metricId: "agentCount" }, "metricId"]
    ] as const) {
      const outcome = safeCreateEphemeralLandscapePreviewRequest(configuration(override));
      expect(outcome.request).toBeNull();
      expect(outcome.issues.some((issue) => issue.path === path)).toBe(true);
    }

    const duplicateAxis = safeCreateEphemeralLandscapePreviewRequest(
      configuration({
        yAxis: { parameterId: "alignmentWeight", minimum: 0.1, maximum: 0.9, pointCount: 3 }
      })
    );
    expect(duplicateAxis.request).toBeNull();
    expect(duplicateAxis.issues).toContainEqual(expect.objectContaining({ path: "yAxis.parameterId" }));
  });

  it("generates inclusive canonical number and integer axes and rejects collapsed integer values", () => {
    expect(generateEphemeralPreviewAxisValues(0.1, 0.7, 4, "number")).toEqual([0.1, 0.3, 0.5, 0.7]);
    expect(generateEphemeralPreviewAxisValues(20, 23, 4, "integer")).toEqual([20, 21, 22, 23]);
    expect(() => generateEphemeralPreviewAxisValues(20, 22, 5, "integer")).toThrow(/not unique/);
    expect(() => generateEphemeralPreviewAxisValues(2, 2, 2, "number")).toThrow(/less than/);
    expect(formatEphemeralPreviewNumber(0.30000000000000004)).toBe("0.3");
  });

  it("builds deterministic one-axis and Y-major two-axis point and run ordering", () => {
    const oneAxis = buildEphemeralLandscapePreviewRunPlans(request({ seeds: [7, 3] }));
    expect(oneAxis.map((plan) => [plan.runId, plan.pointId, plan.coordinate.x.value, plan.seed])).toEqual([
      ["sample-001", "point-01", 0.2, 7],
      ["sample-002", "point-01", 0.2, 3],
      ["sample-003", "point-02", 0.8, 7],
      ["sample-004", "point-02", 0.8, 3]
    ]);

    const twoAxisRequest = request({
      xAxis: { parameterId: "alignmentWeight", minimum: 0.2, maximum: 0.8, pointCount: 2 },
      yAxis: { parameterId: "cohesionWeight", minimum: 0.1, maximum: 0.7, pointCount: 2 }
    });
    const twoAxis = buildEphemeralLandscapePreviewRunPlans(twoAxisRequest);
    expect(twoAxis.map((plan) => [plan.coordinate.x.value, plan.coordinate.y?.value])).toEqual([
      [0.2, 0.1],
      [0.8, 0.1],
      [0.2, 0.7],
      [0.8, 0.7]
    ]);
    expect(twoAxisRequest.workEstimate.gridPointCount).toBe(4);
  });

  it("rejects malformed seeds and enforces all independent and combined work bounds without reduction", () => {
    for (const seeds of [[], [1, 1], [1, 2, 3, 4], [2_147_483_648]]) {
      expect(safeCreateEphemeralLandscapePreviewRequest(configuration({ seeds })).request).toBeNull();
    }
    expect(safeCreateEphemeralLandscapePreviewRequest(configuration({ tickHorizon: 0 })).request).toBeNull();
    expect(safeCreateEphemeralLandscapePreviewRequest(configuration({ tickHorizon: 251 })).request).toBeNull();

    const overBudget = safeCreateEphemeralLandscapePreviewRequest(
      configuration({
        xAxis: { parameterId: "alignmentWeight", minimum: 0.2, maximum: 0.8, pointCount: 5 },
        yAxis: { parameterId: "cohesionWeight", minimum: 0.1, maximum: 0.7, pointCount: 5 },
        seeds: [1, 2, 3],
        tickHorizon: 250
      })
    );
    expect(overBudget.request).toBeNull();
    expect(overBudget.issues).toContainEqual(expect.objectContaining({ path: "workEstimate.workUnits" }));

    const boundary = request({
      xAxis: { parameterId: "alignmentWeight", minimum: 0.2, maximum: 0.8, pointCount: 5 },
      yAxis: { parameterId: "cohesionWeight", minimum: 0.1, maximum: 0.7, pointCount: 5 },
      seeds: [1],
      tickHorizon: 200
    });
    expect(boundary.workEstimate.workUnits).toBe(5_000);
    expect(boundary.workEstimate.maximumWorkUnits).toBe(maxEphemeralPreviewWorkUnits);
  });

  it("requires canonical exact values, fixed scenario values, and declared work in validated requests", () => {
    const valid = request();
    expect(validateEphemeralLandscapePreviewRequest(valid)).toEqual(valid);
    expect(() => validateEphemeralLandscapePreviewRequest({ ...valid, xAxis: { ...valid.xAxis, values: [0.2, 0.7] } })).toThrow(
      /canonical supported axis values/
    );
    expect(() => validateEphemeralLandscapePreviewRequest({ ...valid, fixedParameters: { ...valid.fixedParameters, maxSpeed: 9 } })).toThrow(
      /canonical supported axis values/
    );
    expect(() =>
      validateEphemeralLandscapePreviewRequest({
        ...valid,
        workEstimate: { ...valid.workEstimate, workUnits: valid.workEstimate.workUnits - 1 }
      })
    ).toThrow(/canonical supported axis values/);
    expect(() => validateEphemeralLandscapePreviewRequest({ ...valid, unexpected: true })).toThrow();
  });

  it("assembles exact deterministic RunConfigs and synchronizes integer composition axes", () => {
    const config = request({
      xAxis: { parameterId: "agentCount", minimum: 20, maximum: 40, pointCount: 3 },
      seeds: [-4, 8]
    });
    const first = buildEphemeralLandscapePreviewRunPlans(config);
    const second = buildEphemeralLandscapePreviewRunPlans(config);
    expect(first).toEqual(second);
    expect(first[0]?.runConfig).toMatchObject({
      templateId: "flocking-boids",
      scenarioId: "atlas-preview-flocking-random-headings-v1",
      seed: "-4",
      parameters: { agentCount: 20 },
      agentComposition: { agentCount: 20 },
      initializationPreset: "random-headings",
      behaviorMode: "default"
    });
    expect(first.at(-1)?.runConfig).toMatchObject({ seed: "8", parameters: { agentCount: 40 } });
  });

  it("uses a fresh real engine for every run, observes exactly the final tick, and is deterministic", async () => {
    const previewRequest = request({ seeds: [11, 12], tickHorizon: 3 });
    const engineIdentities = new Set<PreviewExecutionEngine>();
    const first = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine(runConfig) {
        const engine = createEngineFromRunConfig(runConfig);
        engineIdentities.add(engine);
        return engine;
      },
      yieldFn: async () => undefined
    });
    const second = await executeEphemeralLandscapePreview(previewRequest, { yieldFn: async () => undefined });
    expect(engineIdentities.size).toBe(previewRequest.workEstimate.sampleRunCount);
    expect(first.status).toBe("completed");
    expect(first.runs.every((run) => run.finalTick === 3 && run.ticksCompleted === 3)).toBe(true);
    expect(first).toEqual(second);
  });

  it("retains per-seed outputs and computes deterministic mean, minimum, and maximum", async () => {
    const previewRequest = request({ seeds: [1, 2, 3] });
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine(runConfig) {
        const value = Number(runConfig.parameters.alignmentWeight) + Number(runConfig.seed);
        return fakeEngine(previewRequest.metricId, value);
      },
      yieldFn: async () => undefined
    });
    expect(result.status).toBe("completed");
    expect(result.runs.map((run) => run.seed)).toEqual([1, 2, 3, 1, 2, 3]);
    expect(result.points[0]).toMatchObject({
      status: "sampled",
      successfulRunCount: 3,
      failedRunCount: 0,
      mean: 2.2,
      minimum: 1.2,
      maximum: 3.2
    });
  });

  it("keeps individual and metric failures explicit, never coerces them to zero, and handles no-success points", async () => {
    const previewRequest = request({ seeds: [1, 2] });
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine(runConfig) {
        if (runConfig.seed === "1" && runConfig.parameters.alignmentWeight === 0.2) {
          throw new Error("bounded engine failure");
        }
        const hasMetric = !(runConfig.seed === "2" && runConfig.parameters.alignmentWeight === 0.2);
        return fakeEngine(previewRequest.metricId, 4, hasMetric);
      },
      yieldFn: async () => undefined
    });
    expect(result.status).toBe("completed_with_errors");
    expect(result.partial).toBe(true);
    expect(result.runs.slice(0, 2).map((run) => run.metricValue)).toEqual([null, null]);
    expect(result.runs.slice(0, 2).map((run) => run.error?.kind)).toEqual(["sample_run", "metric_observation"]);
    expect(result.points[0]).toMatchObject({ status: "failed", successfulRunCount: 0, mean: null, minimum: null, maximum: null });
    expect(result.points[1]).toMatchObject({ status: "sampled", successfulRunCount: 2, mean: 4 });
  });

  it("cancels honestly between samples and retains only attempted coordinates", async () => {
    const signal = { cancelled: false };
    const progress: string[] = [];
    const previewRequest = request({ seeds: [1, 2, 3] });
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      signal,
      createEngine: () => fakeEngine(previewRequest.metricId, 1),
      onProgress(value) {
        progress.push(`${value.completedRunCount}/${value.totalRunCount}:${value.status}`);
      },
      async yieldFn() {
        signal.cancelled = true;
      }
    });
    expect(result.status).toBe("cancelled");
    expect(result.completedRunCount).toBe(1);
    expect(result.cancellation).toEqual({ requested: true, effective: true, unstartedRunCount: 5 });
    expect(result.points).toHaveLength(1);
    expect(result.points[0]).toMatchObject({ attemptedRunCount: 1, unstartedRunCount: 2, status: "partial" });
    expect(progress).toContain("1/6:cancelled");
  });

  it("stops on a fatal cooperative-yield error while preserving completed sample provenance", async () => {
    const previewRequest = request({ seeds: [1, 2] });
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine: () => fakeEngine(previewRequest.metricId, 2),
      async yieldFn() {
        throw new Error("yield unavailable");
      }
    });
    expect(result.status).toBe("failed");
    expect(result.completedRunCount).toBe(1);
    expect(result.errors).toContainEqual(expect.objectContaining({ kind: "fatal_executor", message: expect.stringContaining("yield unavailable") }));
    expect(result.cancellation.effective).toBe(false);
  });

  it("detects stale results, supports bounded clear, and does not mutate the original result", async () => {
    const originalRequest = request();
    const result = await executeEphemeralLandscapePreview(originalRequest, {
      createEngine: () => fakeEngine(originalRequest.metricId, 1),
      yieldFn: async () => undefined
    });
    const changedRequest = request({ tickHorizon: 3 });
    expect(ephemeralLandscapePreviewRequestsEqual(originalRequest, request())).toBe(true);
    expect(isEphemeralLandscapePreviewResultStale(result, originalRequest)).toBe(false);
    expect(isEphemeralLandscapePreviewResultStale(result, changedRequest)).toBe(true);
    expect(isEphemeralLandscapePreviewResultStale(result, null)).toBe(true);
    expect(clearEphemeralLandscapePreviewResult()).toBeNull();
    expect(result.request).toEqual(originalRequest);
  });

  it("audits the current probe foundation as planning-only and rejects conversion without silently dropping fields", () => {
    const audit = auditLandscapeProbePlanForEphemeralPreview();
    expect(audit.status).toBe("not-mappable");
    expect(audit.request).toBeNull();
    expect(audit.fields.every((field) => field.mappedPreviewRequestField === null)).toBe(true);
    expect(audit.reason).toMatch(/no stable template, scenario, parameter ID/);
    expect(() => createEphemeralPreviewRequestFromLandscapeProbePlan({ axes: [], outcomes: [], unsupported: true })).toThrow(
      /not executable/
    );
  });

  it("keeps the executor independent from World, Experiment Runner, browser storage, clocks, and random identity", () => {
    const files = [
      "src/simulation/atlasPreview/executor.ts",
      "src/simulation/atlasPreview/request.ts",
      "src/simulation/atlasPreview/types.ts"
    ];
    const source = files.map((file) => readFileSync(join(repoRoot, file), "utf8")).join("\n");
    expect(source).not.toMatch(/simulationStore|ExperimentRunner|experimentRunner|localStorage|sessionStorage|IndexedDB|document\.cookie/);
    expect(source).not.toMatch(/Date\.now|performance\.now|Math\.random|crypto\.randomUUID|randomUUID|uuidv4|nanoid/);
  });

  it("runs a representative bounded executor smoke without retaining engine instances", async () => {
    const previewRequest = request({ tickHorizon: 5, seeds: [21] });
    const created: PreviewExecutionEngine[] = [];
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine(runConfig) {
        const engine = fakeEngine(previewRequest.metricId, Number(runConfig.parameters.alignmentWeight));
        created.push(engine);
        return engine;
      },
      yieldFn: async () => undefined
    });
    expect(result).toMatchObject({ status: "completed", plannedRunCount: 2, completedRunCount: 2 });
    expect(result.runs.some((run) => Object.values(run).includes(created[0] as never))).toBe(false);
  });
});
