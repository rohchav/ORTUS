import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SimulationRunConfig } from "../kernel/types";
import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import { getProductionTemplate } from "../templates/registry";
import {
  auditLandscapeProbePlanForEphemeralPreview,
  buildEphemeralLandscapePreviewRunPlans,
  canonicalPreviewNumber,
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

function metricEngine(
  metricId: string,
  value: unknown,
  options: { engineTickOffset?: number; recordTickOffset?: number; onRead?: () => void; onRun?: (steps: number) => void } = {}
): PreviewExecutionEngine {
  const clock = { tick: 0 };
  return {
    clock,
    runSteps(steps) {
      options.onRun?.(steps);
      clock.tick = steps + (options.engineTickOffset ?? 0);
    },
    metrics: {
      historyRecords() {
        options.onRead?.();
        const tick = clock.tick + (options.recordTickOffset ?? 0);
        return [{ tick, time: tick, values: { [metricId]: value } as Record<string, number> }];
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
    const template = getProductionTemplate(capability.templateId)!;
    expect(template.version).toBe(capability.templateVersion);
    for (const parameter of capability.parameters) {
      const definition = template.parameterDefinitions.find((candidate) => candidate.key === parameter.id)!;
      expect(definition.type).toBe(parameter.type);
      expect(parameter.minimum).toBeGreaterThanOrEqual(definition.min!);
      expect(parameter.maximum).toBeLessThanOrEqual(definition.max!);
    }
    for (const metric of capability.metrics) {
      expect(template.metricDefinitions?.find((candidate) => candidate.key === metric.id)?.valueType).toMatch(/number|integer/);
    }
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

  it("generates inclusive canonical number and integer axes across boundaries and rejects invalid or collapsed ranges", () => {
    expect(generateEphemeralPreviewAxisValues(0.1, 0.7, 4, "number")).toEqual([0.1, 0.3, 0.5, 0.7]);
    expect(generateEphemeralPreviewAxisValues(20, 23, 4, "integer")).toEqual([20, 21, 22, 23]);
    expect(generateEphemeralPreviewAxisValues(20, 23, 3, "integer")).toEqual([20, 22, 23]);
    expect(generateEphemeralPreviewAxisValues(-0.3, 0.3, 3, "number")).toEqual([-0.3, 0, 0.3]);
    expect(Object.is(generateEphemeralPreviewAxisValues(-0.000000001, 0.1, 2, "number")[0], -0)).toBe(false);
    expect(() => generateEphemeralPreviewAxisValues(20, 22, 5, "integer")).toThrow(/not unique/);
    expect(() => generateEphemeralPreviewAxisValues(2, 2, 2, "number")).toThrow(/less than/);
    expect(() => generateEphemeralPreviewAxisValues(3, 2, 2, "number")).toThrow(/less than/);
    expect(() => generateEphemeralPreviewAxisValues(Number.NaN, 2, 2, "number")).toThrow(/finite/);
    expect(() => generateEphemeralPreviewAxisValues(0, Number.POSITIVE_INFINITY, 2, "number")).toThrow(/finite/);
    expect(() => generateEphemeralPreviewAxisValues(0, 1, 1, "number")).toThrow(/from 2 to 5/);
    expect(() => generateEphemeralPreviewAxisValues(0, 1, 6, "number")).toThrow(/from 2 to 5/);
    expect(() => generateEphemeralPreviewAxisValues(0, 1, 2.5, "number")).toThrow(/integer/);
    expect(() => generateEphemeralPreviewAxisValues(20.5, 23, 3, "integer")).toThrow(/integer minimum/);
    expect(canonicalPreviewNumber(-0)).toBe(0);
    expect(formatEphemeralPreviewNumber(0.30000000000000004)).toBe("0.3");
  });

  it("canonicalizes equivalent seed sets and fixed parameters before deterministic one-axis and Y-major two-axis ordering", () => {
    const mutableInput = configuration({ seeds: [7, 3] });
    const mutableInputSnapshot = structuredClone(mutableInput);
    createEphemeralLandscapePreviewRequest(mutableInput);
    expect(mutableInput).toEqual(mutableInputSnapshot);

    const oneAxis = buildEphemeralLandscapePreviewRunPlans(request({ seeds: [7, 3] }));
    expect(oneAxis.map((plan) => [plan.runId, plan.pointId, plan.coordinate.x.value, plan.seed])).toEqual([
      ["sample-001", "point-01", 0.2, 3],
      ["sample-002", "point-01", 0.2, 7],
      ["sample-003", "point-02", 0.8, 3],
      ["sample-004", "point-02", 0.8, 7]
    ]);
    const reordered = request({ seeds: [3, 7] });
    expect(request({ seeds: [7, 3] })).toEqual(reordered);
    expect(ephemeralLandscapePreviewRequestsEqual(request({ seeds: [7, 3] }), reordered)).toBe(true);
    expect(request({ seeds: [-0] }).seeds).toEqual([0]);
    expect(Object.keys(reordered.fixedParameters)).toEqual(Object.keys(reordered.fixedParameters).sort());
    expect(reordered.fixedParameters).not.toHaveProperty(reordered.xAxis.parameterId);

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
    for (const seeds of [[], [1, 1], [1, 2, 3, 4], [-2_147_483_649], [2_147_483_648], [1.5], [Number.NaN]]) {
      expect(safeCreateEphemeralLandscapePreviewRequest(configuration({ seeds })).request).toBeNull();
    }
    expect(request({ seeds: [-2_147_483_648, 2_147_483_647] }).seeds).toEqual([-2_147_483_648, 2_147_483_647]);
    expect(safeCreateEphemeralLandscapePreviewRequest(configuration({ tickHorizon: 0 })).request).toBeNull();
    expect(safeCreateEphemeralLandscapePreviewRequest(configuration({ tickHorizon: 251 })).request).toBeNull();
    expect(safeCreateEphemeralLandscapePreviewRequest(configuration({ tickHorizon: 1.5 })).request).toBeNull();

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

    const firstRepresentableGridOverage = safeCreateEphemeralLandscapePreviewRequest(
      configuration({
        xAxis: { parameterId: "alignmentWeight", minimum: 0.2, maximum: 0.8, pointCount: 5 },
        yAxis: { parameterId: "cohesionWeight", minimum: 0.1, maximum: 0.7, pointCount: 5 },
        seeds: [1],
        tickHorizon: 201
      })
    );
    expect(firstRepresentableGridOverage.request).toBeNull();
    expect(firstRepresentableGridOverage.issues).toContainEqual(
      expect.objectContaining({ path: "workEstimate.workUnits", message: expect.stringContaining("5025") })
    );

    expect(() =>
      validateEphemeralLandscapePreviewRequest({
        ...boundary,
        workEstimate: { ...boundary.workEstimate, workUnits: 5_001 }
      })
    ).toThrow(/canonical supported axis values/);
  });

  it("strictly reconstructs canonical requests and rejects forged identity, axes, fixed values, work, and prototype-like keys", () => {
    const valid = request();
    expect(validateEphemeralLandscapePreviewRequest(valid)).toEqual(valid);
    const forgedRequests: unknown[] = [
      { ...valid, schemaVersion: "2" },
      { ...valid, artifactType: "ortus.savedLandscape" },
      { ...valid, capabilityVersion: "2" },
      { ...valid, templateId: "opinion-dynamics" },
      { ...valid, scenarioId: "missing-scenario" },
      { ...valid, metricId: "agentCount" },
      { ...valid, observation: "initialTick" },
      { ...valid, xAxis: { ...valid.xAxis, parameterId: "maxSpeed" } },
      { ...valid, xAxis: { ...valid.xAxis, parameterType: "integer" } },
      { ...valid, xAxis: { ...valid.xAxis, minimum: 0.1 } },
      { ...valid, xAxis: { ...valid.xAxis, maximum: 0.9 } },
      { ...valid, xAxis: { ...valid.xAxis, pointCount: 3 } },
      { ...valid, xAxis: { ...valid.xAxis, values: [0.2, 0.7] } },
      { ...valid, seeds: [101, 102] },
      { ...valid, tickHorizon: 3 },
      { ...valid, fixedParameters: { ...valid.fixedParameters, maxSpeed: 9 } },
      { ...valid, fixedParameters: { ...valid.fixedParameters, [valid.xAxis.parameterId]: valid.xAxis.minimum } },
      { ...valid, workEstimate: { ...valid.workEstimate, gridPointCount: 3 } },
      { ...valid, workEstimate: { ...valid.workEstimate, sampleRunCount: 3 } },
      { ...valid, workEstimate: { ...valid.workEstimate, tickHorizon: 3 } },
      { ...valid, workEstimate: { ...valid.workEstimate, workUnits: valid.workEstimate.workUnits - 1 } },
      { ...valid, workEstimate: { ...valid.workEstimate, maximumWorkUnits: 9_999 } },
      { ...valid, unexpected: true },
      { ...valid, xAxis: { ...valid.xAxis, unexpected: true } }
    ];
    for (const forged of forgedRequests) {
      expect(() => validateEphemeralLandscapePreviewRequest(forged)).toThrow(PreviewConfigurationValidationError);
    }

    const prototypeLikeFixedParameters = structuredClone(valid) as unknown as Record<string, unknown>;
    prototypeLikeFixedParameters.fixedParameters = JSON.parse('{"__proto__":{"polluted":true}}') as unknown;
    expect(() => validateEphemeralLandscapePreviewRequest(prototypeLikeFixedParameters)).toThrow(
      PreviewConfigurationValidationError
    );
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("rejects a forged request before engine construction", async () => {
    const valid = request();
    let engineConstructed = false;
    await expect(
      executeEphemeralLandscapePreview(
        {
          ...valid,
          xAxis: { ...valid.xAxis, values: [valid.xAxis.minimum, 0.7] }
        },
        {
          createEngine() {
            engineConstructed = true;
            return fakeEngine(valid.metricId, 1);
          }
        }
      )
    ).rejects.toThrow(/canonical supported axis values/);
    expect(engineConstructed).toBe(false);
  });

  it("assembles exact deterministic RunConfigs, keeps scenario data immutable, and synchronizes integer composition axes", () => {
    const scenarioBefore = getEphemeralLandscapePreviewScenario(
      ephemeralLandscapePreviewCapabilities[0]!.templateId,
      ephemeralLandscapePreviewCapabilities[0]!.scenario.id
    )!;
    const scenarioSnapshot = structuredClone(scenarioBefore);
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
    for (const plan of first) {
      expect(plan.runConfig.parameters).toEqual({ ...config.fixedParameters, agentCount: plan.coordinate.x.value });
      expect(plan.runConfig.parameters).not.toBe(config.fixedParameters);
      expect(plan.runConfig.metadata?.atlasEphemeralPreview).toMatchObject({
        capabilityVersion: "1",
        observation: "finalTick",
        metricId: "alignmentScore",
        pointId: plan.pointId,
        runId: plan.runId
      });
    }
    expect(getEphemeralLandscapePreviewScenario(config.templateId, config.scenarioId)).toEqual(scenarioSnapshot);
    expect(scenarioBefore).toEqual(scenarioSnapshot);
  });

  it("keeps the shared RunConfig factory strict, fresh, deterministic, and input-immutable", () => {
    const runConfig = buildEphemeralLandscapePreviewRunPlans(request())[0]!.runConfig;
    const inputSnapshot = structuredClone(runConfig);
    const first = createEngineFromRunConfig(runConfig);
    const second = createEngineFromRunConfig(runConfig);
    expect(first).not.toBe(second);
    expect(first.clock.tick).toBe(0);
    expect(second.clock.tick).toBe(0);
    expect(first.createSnapshot()).toEqual(second.createSnapshot());
    expect(runConfig).toEqual(inputSnapshot);
    expect(() => createEngineFromRunConfig({ ...runConfig, templateId: "missing-template" })).toThrow(/Unknown run config template/);
    expect(() =>
      createEngineFromRunConfig({ ...runConfig, unexpected: true } as unknown as SimulationRunConfig)
    ).toThrow();
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

  it("passes the exact tick horizon once per run, reads the metric history once, and rejects N-1 or N+1 observations", async () => {
    const previewRequest = request({ tickHorizon: 7 });
    const requestedSteps: number[] = [];
    let metricReads = 0;
    const exact = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine: () =>
        metricEngine(previewRequest.metricId, 0, {
          onRun: (steps) => requestedSteps.push(steps),
          onRead: () => {
            metricReads += 1;
          }
        }),
      yieldFn: async () => undefined
    });
    expect(requestedSteps).toEqual([7, 7]);
    expect(metricReads).toBe(2);
    expect(exact.runs.every((run) => run.finalTick === 7 && run.metricValue === 0)).toBe(true);

    for (const engineTickOffset of [-1, 1]) {
      const result = await executeEphemeralLandscapePreview(previewRequest, {
        createEngine: () => metricEngine(previewRequest.metricId, 1, { engineTickOffset }),
        yieldFn: async () => undefined
      });
      expect(result.status).toBe("completed_with_errors");
      expect(result.runs.every((run) => run.error?.message.includes("final-tick observation requires tick 7"))).toBe(true);
    }
    for (const recordTickOffset of [-1, 1]) {
      const result = await executeEphemeralLandscapePreview(previewRequest, {
        createEngine: () => metricEngine(previewRequest.metricId, 1, { recordTickOffset }),
        yieldFn: async () => undefined
      });
      expect(result.status).toBe("completed_with_errors");
      expect(result.runs.every((run) => run.error?.message.includes("Metric record for final tick 7 is unavailable"))).toBe(true);
    }
  });

  it("observes every declared preview metric as a finite model output at the requested real-engine tick", async () => {
    const metricIds = ephemeralLandscapePreviewCapabilities[0]!.metrics.map((metric) => metric.id);
    for (const metricId of metricIds) {
      const previewRequest = request({ metricId, tickHorizon: 1 });
      const result = await executeEphemeralLandscapePreview(previewRequest, { yieldFn: async () => undefined });
      expect(result.status).toBe("completed");
      expect(result.runs.every((run) => run.finalTick === 1 && Number.isFinite(run.metricValue))).toBe(true);
    }
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

  it("uses deterministic compensated aggregation and preserves numeric zero distinctly from absent output", async () => {
    const previewRequest = request({ seeds: [3, 1, 2] });
    const run = () =>
      executeEphemeralLandscapePreview(previewRequest, {
        createEngine(runConfig) {
          const values: Record<string, number> = { "1": 0.1, "2": 0.2, "3": 0.3 };
          return fakeEngine(previewRequest.metricId, values[runConfig.seed]!);
        },
        yieldFn: async () => undefined
      });
    const first = await run();
    const second = await run();
    expect(first).toEqual(second);
    expect(first.runs.slice(0, 3).map((sample) => [sample.seed, sample.metricValue])).toEqual([
      [1, 0.1],
      [2, 0.2],
      [3, 0.3]
    ]);
    expect(first.points[0]?.mean).toBeCloseTo(0.2, 15);
    expect(first.points[0]).toMatchObject({ minimum: 0.1, maximum: 0.3 });

    const zero = await executeEphemeralLandscapePreview(request({ seeds: [1] }), {
      createEngine: (runConfig) =>
        Number(runConfig.parameters.alignmentWeight) === 0.2
          ? fakeEngine(previewRequest.metricId, 0)
          : fakeEngine(previewRequest.metricId, 0, false),
      yieldFn: async () => undefined
    });
    expect(zero.status).toBe("completed_with_errors");
    expect(zero.points[0]).toMatchObject({ mean: 0, minimum: 0, maximum: 0, status: "sampled" });
    expect(zero.points[1]).toMatchObject({ mean: null, minimum: null, maximum: null, status: "failed" });
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

  it("contains engine-construction, tick, missing, non-numeric, and non-finite metric failures without aborting later samples", async () => {
    const previewRequest = request({ seeds: [1, 2, 3] });
    const values: unknown[] = [undefined, "1", Number.NaN, Number.POSITIVE_INFINITY];
    let runIndex = 0;
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine() {
        const index = runIndex;
        runIndex += 1;
        if (index === 0) {
          throw new Error("construction failed");
        }
        if (index === 1) {
          return {
            ...metricEngine(previewRequest.metricId, 1),
            runSteps() {
              throw new Error("tick failed");
            }
          };
        }
        return metricEngine(previewRequest.metricId, values[index - 2]);
      },
      yieldFn: async () => undefined
    });
    expect(result.status).toBe("completed_with_errors");
    expect(result.completedRunCount).toBe(previewRequest.workEstimate.sampleRunCount);
    expect(result.successfulRunCount).toBe(0);
    expect(result.errors.map((error) => error.kind)).toEqual([
      "sample_run",
      "sample_run",
      "metric_observation",
      "metric_observation",
      "metric_observation",
      "metric_observation"
    ]);
    expect(result.runs.every((run) => run.metricValue === null)).toBe(true);
  });

  it("reports exact monotonic progress through success and failure terminal states", async () => {
    const previewRequest = request({ seeds: [1] });
    const progress: Array<[number, number, number, string, string | undefined]> = [];
    let created = 0;
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine() {
        created += 1;
        return created === 1 ? fakeEngine(previewRequest.metricId, 1) : fakeEngine(previewRequest.metricId, 1, false);
      },
      onProgress(value) {
        progress.push([
          value.completedRunCount,
          value.successfulRunCount,
          value.failedRunCount,
          value.status,
          value.currentRunId
        ]);
      },
      yieldFn: async () => undefined
    });
    expect(result.status).toBe("completed_with_errors");
    expect(progress).toEqual([
      [0, 0, 0, "running", undefined],
      [0, 0, 0, "running", "sample-001"],
      [1, 1, 0, "running", "sample-001"],
      [1, 1, 0, "running", "sample-002"],
      [2, 1, 1, "running", "sample-002"],
      [2, 1, 1, "complete", undefined]
    ]);
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
    const progress: string[] = [];
    const result = await executeEphemeralLandscapePreview(previewRequest, {
      createEngine: () => fakeEngine(previewRequest.metricId, 2),
      onProgress(value) {
        progress.push(`${value.completedRunCount}/${value.totalRunCount}:${value.status}`);
      },
      async yieldFn() {
        throw new Error("yield unavailable");
      }
    });
    expect(result.status).toBe("failed");
    expect(result.completedRunCount).toBe(1);
    expect(result.errors).toContainEqual(expect.objectContaining({ kind: "fatal_executor", message: expect.stringContaining("yield unavailable") }));
    expect(result.cancellation.effective).toBe(false);
    expect(result.points).toHaveLength(1);
    expect(result.cancellation.unstartedRunCount).toBe(3);
    expect(progress.at(-1)).toBe("1/4:failed");
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

  it("keeps preview execution and UI independent from World, Experiment Runner, Builder, Lab, storage, clocks, and random identity", () => {
    const files = [
      "src/simulation/atlasPreview/executor.ts",
      "src/simulation/atlasPreview/request.ts",
      "src/simulation/atlasPreview/types.ts",
      "src/simulation/runs/engineFromRunConfig.ts",
      "src/components/atlas/EphemeralLandscapePreview.tsx"
    ];
    const source = files.map((file) => readFileSync(join(repoRoot, file), "utf8")).join("\n");
    expect(source).not.toMatch(
      /simulationStore|ExperimentRunner|experimentRunnerStore|builderStore|labStore|localStorage|sessionStorage|IndexedDB|document\.cookie/
    );
    expect(source).not.toMatch(/Date\.now|performance\.now|Math\.random|crypto\.randomUUID|randomUUID|uuidv4|nanoid/);
    expect(source).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/);
    expect(readFileSync(join(repoRoot, "src/components/atlas/EphemeralLandscapePreview.tsx"), "utf8")).toMatch(
      /cancellationRef\.current\.cancelled = true/
    );
  });

  it("does not mutate capability, scenario, template, Builder, Lab, or registry descriptors during real execution", async () => {
    const capabilityBefore = structuredClone(ephemeralLandscapePreviewCapabilities[0]!);
    const template = getProductionTemplate(capabilityBefore.templateId)!;
    const templateParametersBefore = structuredClone(template.parameterDefinitions);
    const templateMetricsBefore = JSON.stringify(template.metricDefinitions);
    const scenarioBefore = getEphemeralLandscapePreviewScenario(capabilityBefore.templateId, capabilityBefore.scenario.id)!;
    const scenarioSnapshot = structuredClone(scenarioBefore);
    const result = await executeEphemeralLandscapePreview(request({ tickHorizon: 1 }), { yieldFn: async () => undefined });
    expect(result.status).toBe("completed");
    expect(ephemeralLandscapePreviewCapabilities[0]).toEqual(capabilityBefore);
    expect(getProductionTemplate(capabilityBefore.templateId)).toBe(template);
    expect(template.parameterDefinitions).toEqual(templateParametersBefore);
    expect(JSON.stringify(template.metricDefinitions)).toBe(templateMetricsBefore);
    expect(getEphemeralLandscapePreviewScenario(capabilityBefore.templateId, capabilityBefore.scenario.id)).toEqual(scenarioSnapshot);
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
    expect(containsObjectIdentity(result, created[0]!)).toBe(false);
    expect(result).not.toHaveProperty("engine");
    expect(result).not.toHaveProperty("snapshot");
  });

  it("keeps GW9B documentation status aligned with the next named roadmap milestone", () => {
    const roadmap = readFileSync(join(repoRoot, "docs/roadmap.md"), "utf8");
    const context = readFileSync(join(repoRoot, "docs/codex/CURRENT_CONTEXT.md"), "utf8");
    expect(roadmap).toMatch(/GW9B[^\n]*(complete|completed)/i);
    expect(context).toMatch(/GW9B[^\n]*(complete|completed)/i);
    expect(`${roadmap}\n${context}`).toMatch(/F1: Fractal Metrics V1/);
  });
});

function containsObjectIdentity(value: unknown, target: object, seen = new Set<object>()): boolean {
  if (value === target) {
    return true;
  }
  if (!value || typeof value !== "object" || seen.has(value)) {
    return false;
  }
  seen.add(value);
  return Object.values(value).some((child) => containsObjectIdentity(child, target, seen));
}
