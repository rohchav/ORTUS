import { describe, expect, it } from "vitest";
import type { ExperimentConfig, ExperimentRunResult, ParameterDefinition } from "../index";
import {
  aggregateExperimentResults,
  effectiveSeeds,
  generateSweepValues,
  hardExperimentMaxRuns,
  runExperiment,
  validateExperimentConfig
} from "../index";
import { defaultParameters } from "../../lib/templateVisuals";
import { exportExperimentCsv, exportExperimentJson } from "../../lib/experimentExport";
import { epidemicTemplate } from "../templates/epidemic.template";
import { flockingTemplate } from "../templates/flocking.template";

describe("experiment runner", () => {
  it("validates experiment configs and rejects unsafe or invalid sweeps", () => {
    const valid = baseExperimentConfig();
    const validation = validateExperimentConfig(valid);
    expect(validation.totalRuns).toBe(4);
    expect(validation.conditions.map((condition) => condition.sweptValues.infectionProbability)).toEqual([0, 1]);

    const twoParameterGrid = validateExperimentConfig({
      ...valid,
      parameterSweep: {
        dimensions: [
          { parameterKey: "infectionProbability", values: [0, 1] },
          { parameterKey: "infectionRadius", values: [6, 9] }
        ]
      },
      seeds: ["grid-seed"]
    });
    expect(twoParameterGrid.totalRuns).toBe(4);

    expect(() =>
      validateExperimentConfig({
        ...valid,
        parameterSweep: { dimensions: [{ parameterKey: "missing", values: [1] }] }
      })
    ).toThrow(/Unknown sweep parameter/);

    expect(() =>
      validateExperimentConfig({
        ...valid,
        parameterSweep: { dimensions: [{ parameterKey: "infectionProbability", values: [2] }] }
      })
    ).toThrow(/must be <= 1/);

    expect(() => validateExperimentConfig({ ...valid, ticksPerRun: 0 })).toThrow(/Invalid experiment configuration/);
    expect(() => validateExperimentConfig({ ...valid, seedMode: "fixed", seeds: [] })).toThrow(/Fixed seed mode requires at least one seed/);
    expect(() => validateExperimentConfig({ ...valid, seedMode: "fixed", seeds: ["ok", ""] })).toThrow(/Fixed seed entries cannot be empty/);

    expect(() =>
      validateExperimentConfig({
        ...valid,
        parameterSweep: { dimensions: [{ parameterKey: "infectionProbability", range: { min: 0, max: 1, steps: 50 } }] },
        seeds: Array.from({ length: 11 }, (_, index) => `seed-${index}`),
        maxRuns: hardExperimentMaxRuns
      })
    ).toThrow(/above the V1 hard limit/);
  });

  it("builds deterministic fixed and sequential seed run plans", () => {
    const duplicateFixedSeeds = validateExperimentConfig(baseExperimentConfig({ infectionProbability: [0.2], seeds: ["same", "same", "other"] }));
    expect(duplicateFixedSeeds.totalRuns).toBe(3);
    expect(duplicateFixedSeeds.runPlans.map((plan) => plan.seed)).toEqual(["same", "same", "other"]);
    expect(duplicateFixedSeeds.runPlans.map((plan) => plan.runId)).toEqual(["run-1-1", "run-1-2", "run-1-3"]);

    const sequentialConfig = {
      ...baseExperimentConfig({ infectionProbability: [0.2] }),
      seedMode: "sequential" as const,
      seeds: [],
      baseSeed: "base",
      trialsPerCondition: 3
    };
    expect(effectiveSeeds(sequentialConfig)).toEqual(["base-1", "base-2", "base-3"]);
    expect(validateExperimentConfig(sequentialConfig).runPlans.map((plan) => plan.seed)).toEqual(["base-1", "base-2", "base-3"]);
  });

  it("generates numeric, integer, boolean, and select sweep values deterministically", () => {
    const infectionProbability = epidemicTemplate.parameterDefinitions.find((definition) => definition.key === "infectionProbability")!;
    expect(generateSweepValues(infectionProbability, { parameterKey: "infectionProbability", range: { min: 0, max: 1, steps: 3 } })).toEqual([
      0,
      0.5,
      1
    ]);

    const agentCount = epidemicTemplate.parameterDefinitions.find((definition) => definition.key === "agentCount")!;
    expect(generateSweepValues(agentCount, { parameterKey: "agentCount", range: { min: 1, max: 3, steps: 3 } })).toEqual([1, 2, 3]);

    const booleanDefinition: ParameterDefinition = {
      key: "enabled",
      label: "Enabled",
      type: "boolean",
      defaultValue: false,
      description: "Boolean sweep test.",
      liveUpdate: true
    };
    expect(generateSweepValues(booleanDefinition, { parameterKey: "enabled" })).toEqual([false, true]);

    const boundaryMode = flockingTemplate.parameterDefinitions.find((definition) => definition.key === "boundaryMode")!;
    expect(generateSweepValues(boundaryMode, { parameterKey: "boundaryMode", values: ["wrap", "clamp", "wrap"] })).toEqual(["wrap", "clamp"]);
  });

  it("runs separate trials, records final metrics, and is deterministic for the same config", async () => {
    let now = 0;
    const options = {
      now: () => {
        now += 1;
        return now;
      },
      yieldFn: async () => {}
    };
    const left = await runExperiment(baseExperimentConfig({ infectionProbability: [0.2, 0.8] }), options);
    now = 0;
    const right = await runExperiment(baseExperimentConfig({ infectionProbability: [0.2, 0.8] }), options);

    expect(left).toEqual(right);
    expect(left.status).toBe("success");
    expect(left.runs).toHaveLength(4);
    for (const run of left.runs) {
      expect(run.status).toBe("success");
      expect(run.ticksRun).toBe(6);
      expect(Number.isFinite(run.finalMetrics.infectedCount)).toBe(true);
    }
  });

  it("different seeds can change stochastic experiment outcomes", async () => {
    const config = flockingExperimentConfig("seed-a");
    const lowSeeds = await runExperiment(config, {
      now: () => 0,
      yieldFn: async () => {}
    });
    const highSeeds = await runExperiment(flockingExperimentConfig("seed-b"), {
      now: () => 0,
      yieldFn: async () => {}
    });

    expect(highSeeds.runs[0]?.finalMetrics).not.toEqual(lowSeeds.runs[0]?.finalMetrics);
  });

  it("aggregates means, min, max, and failure counts without breaking on failures", () => {
    const config = baseExperimentConfig({ infectionProbability: [0.5], seeds: ["a", "b", "c"] });
    const runs: ExperimentRunResult[] = [
      runResult("run-1", 2, "success", 0.5),
      runResult("run-2", 4, "success", 0.5),
      runResult("run-3", 0, "failed", 0.5)
    ];

    const [aggregate] = aggregateExperimentResults(config, runs);
    expect(aggregate?.runCount).toBe(3);
    expect(aggregate?.successCount).toBe(2);
    expect(aggregate?.failureCount).toBe(1);
    expect(aggregate?.metrics.infectedCount?.mean).toBe(3);
    expect(aggregate?.metrics.infectedCount?.min).toBe(2);
    expect(aggregate?.metrics.infectedCount?.max).toBe(4);

    const ordered = aggregateExperimentResults(config, [
      runResult("run-10", 10, "success", 10),
      runResult("run-2", 2, "success", 2),
      runResult("run-1", 1, "success", 1)
    ]);
    expect(ordered.map((item) => item.sweptValues.infectionProbability)).toEqual([1, 2, 10]);
  });

  it("cancels future runs while preserving completed results", async () => {
    const signal = { cancelled: false };
    const result = await runExperiment(baseExperimentConfig({ infectionProbability: [0.1, 0.4, 0.8], seeds: ["a", "b"] }), {
      signal,
      now: () => 0,
      yieldFn: async () => {},
      onProgress(progress) {
        if (progress.completedRuns === 1) {
          signal.cancelled = true;
        }
      }
    });

    expect(result.status).toBe("cancelled");
    expect(result.runs.filter((run) => run.status === "success")).toHaveLength(1);
    expect(result.runs.filter((run) => run.status === "cancelled").length).toBeGreaterThan(0);
  });

  it("exports JSON and CSV without storing full snapshots", async () => {
    const result = await runExperiment(baseExperimentConfig({ infectionProbability: [0.2], seeds: ["seed-a"] }), {
      now: () => 0,
      yieldFn: async () => {}
    });
    const json = exportExperimentJson(result);
    const parsed = JSON.parse(json) as { exportedAt?: string; app?: { version?: string }; template?: { id?: string; version?: string }; result?: unknown };
    expect(parsed.exportedAt).toEqual(expect.any(String));
    expect(parsed.app?.version).toBe("0.1.0");
    expect(parsed.template).toEqual({ id: "epidemic-spread", version: epidemicTemplate.version });
    expect(parsed.result).toBeTruthy();
    expect(json).not.toContain('"world"');

    const csv = exportExperimentCsv(result);
    const header = csv.split("\n")[0] ?? "";
    expect(header).toContain("runId,templateId,seed,ticksRun,status,durationMs,error");
    expect(header).toContain("param.agentCount");
    expect(header).toContain("param.infectionProbability");
    expect(header).toContain("metric.infectedCount");
    expect(csv).toContain("run-1-1");

    const escapedCsv = exportExperimentCsv({
      ...result,
      runs: [
        ...result.runs,
        {
          ...runResult("run-failed", 0, "failed", 0.2),
          error: 'bad, "quoted"\nline'
        }
      ]
    });
    expect(escapedCsv).toContain('"bad, ""quoted""\nline"');
  });
});

function baseExperimentConfig(options: { infectionProbability?: number[]; seeds?: string[] } = {}): ExperimentConfig {
  return {
    templateId: "epidemic-spread",
    baseParameters: {
      ...defaultParameters(epidemicTemplate),
      agentCount: 14,
      initialInfected: 1,
      infectionRadius: 10,
      movementSpeed: 0.8,
      recoveryTicks: 10
    },
    parameterSweep: {
      dimensions: [
        {
          parameterKey: "infectionProbability",
          values: options.infectionProbability ?? [0, 1]
        }
      ]
    },
    seedMode: "fixed",
    seeds: options.seeds ?? ["experiment-a", "experiment-b"],
    trialsPerCondition: 2,
    ticksPerRun: 6,
    metricsToRecord: ["infectedCount"],
    aggregationMode: "final",
    maxRuns: 100,
    metadata: { test: true }
  };
}

function flockingExperimentConfig(seed: string): ExperimentConfig {
  return {
    templateId: "flocking-boids",
    baseParameters: {
      ...defaultParameters(flockingTemplate),
      agentCount: 20,
      noise: 0.02
    },
    parameterSweep: {
      dimensions: [
        {
          parameterKey: "alignmentWeight",
          values: [0.55]
        }
      ]
    },
    seedMode: "fixed",
    seeds: [seed],
    trialsPerCondition: 1,
    ticksPerRun: 12,
    metricsToRecord: ["alignmentScore", "dispersion"],
    aggregationMode: "final",
    maxRuns: 100
  };
}

function runResult(runId: string, infectedCount: number, status: ExperimentRunResult["status"], infectionProbability: number): ExperimentRunResult {
  return {
    runId,
    templateId: "epidemic-spread",
    parameterValues: { agentCount: 14, infectionProbability },
    sweptValues: { infectionProbability },
    seed: runId,
    ticksRun: status === "success" ? 6 : 0,
    status,
    finalMetrics: status === "success" ? { infectedCount } : {},
    durationMs: 1
  };
}
