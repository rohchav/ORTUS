import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterDefinition, SimulationRunConfig, SimulationTemplate } from "../kernel/types";
import { createDefaultRunConfig } from "../runs/runConfig";
import { productionTemplates } from "../templates/registry";
import { epidemicTemplate } from "../templates/epidemic.template";
import { flockingTemplate } from "../templates/flocking.template";
import {
  maxUncertaintyOutputMetrics,
  maxUncertaintyResultJsonLength,
  maxUncertaintySeedLength,
  maxUncertaintyTicksPerRun,
  maxUncertaintyVariableCount,
  deserializeUncertaintyConfig,
  generateUncertaintyRunConfigs,
  runUncertaintyEnsemble,
  deserializeUncertaintyResult,
  serializeUncertaintyConfig,
  serializeUncertaintyResult,
  summarizeMetricValues,
  summarizeUncertaintyRuns,
  uncertaintyConfigArtifactType,
  type UncertaintyConfig
} from "../uncertainty";

const baseNow = "2026-05-12T12:00:00.000Z";

describe("uncertainty layer", () => {
  it("validates uncertainty configs and rejects malformed targets, distributions, metrics, and live-state payloads", () => {
    const base = createDefaultRunConfig({ template: epidemicTemplate, seed: "uncertainty-base" });
    const config = epidemicUncertaintyConfig();
    expect(() => generateUncertaintyRunConfigs(base, config)).not.toThrow();
    expect(() => generateUncertaintyRunConfigs(base, { ...config, variables: [{ ...config.variables[0]!, id: "x" }, { ...config.variables[0]!, id: "x" }] })).toThrow(/Duplicate/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, variables: [{ ...config.variables[0]!, target: "shock" as never }] })).toThrow(/Invalid uncertainty config/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, variables: [{ ...config.variables[0]!, targetPath: "parameters.notReal" }] })).toThrow(/Unknown uncertainty targetPath/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, variables: [{ ...config.variables[0]!, targetPath: "metadata.snapshot" }] })).toThrow(/must start with parameters/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, variables: [{ ...config.variables[0]!, targetPath: "templateId" }] })).toThrow(/must start with parameters/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, variables: [{ ...config.variables[0]!, targetPath: "artifactType" }] })).toThrow(/must start with parameters/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, variables: [{ ...config.variables[0]!, targetPath: "snapshot.world" }] })).toThrow(/must start with parameters/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [{ ...config.variables[0]!, distribution: { type: "uniform", min: 0.5, max: 0.5 } }]
      })
    ).toThrow(/min < max/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [
          {
            ...config.variables[0]!,
            targetPath: "parameters.initialInfected",
            distribution: { type: "integerRange", min: 4, max: 2 }
          }
        ]
      })
    ).toThrow(/min <= max/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [
          {
            ...config.variables[0]!,
            targetPath: "parameters.initialInfected",
            distribution: { type: "uniform", min: 1, max: 3 }
          }
        ]
      })
    ).toThrow(/Uniform distribution requires a number target/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [
          {
            ...config.variables[0]!,
            distribution: { type: "categorical", options: ["not-a-number"] }
          }
        ]
      })
    ).toThrow(/finite number/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [{ ...config.variables[0]!, distribution: { type: "categorical", options: [] } }]
      })
    ).toThrow(/Invalid uncertainty config/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [{ ...config.variables[0]!, distribution: { type: "seedEnsemble", seeds: ["seed"] } }]
      })
    ).toThrow(/seedEnsemble distribution can only target seed/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [
          {
            id: "long-seed",
            label: "Long seed",
            target: "seed",
            targetPath: "seed",
            enabled: true,
            distribution: { type: "seedEnsemble", seeds: ["x".repeat(maxUncertaintySeedLength + 1)] }
          }
        ]
      })
    ).toThrow(/Invalid uncertainty config/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, sampleCount: 101 })).toThrow(/sampleCount/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: Array.from({ length: maxUncertaintyVariableCount + 1 }, (_, index) => ({
          ...config.variables[0]!,
          id: `variable-${index}`
        }))
      })
    ).toThrow(/variables/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        outputMetrics: Array.from({ length: maxUncertaintyOutputMetrics + 1 }, () => "infectedCount")
      })
    ).toThrow(/outputMetrics/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, metadata: { large: "x".repeat(50_000) } })).toThrow(/characters or less/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [{ ...config.variables[0]!, distribution: { type: "uniform", min: Number.NaN, max: 1 } }]
      })
    ).toThrow(/Invalid uncertainty config|NaN/);
    expect(() =>
      generateUncertaintyRunConfigs(base, {
        ...config,
        variables: [{ ...config.variables[0]!, defaultValue: Number.POSITIVE_INFINITY }]
      })
    ).toThrow(/Invalid uncertainty config|Infinity|finite/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, metadata: { snapshot: { tick: 1 } } })).toThrow(/live run state/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, metadata: { engine: { tick: 1 } } })).toThrow(/live run state/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, metadata: { runState: { tick: 1 } } })).toThrow(/live run state/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, metadata: { callback: () => undefined } as never })).toThrow(/Invalid uncertainty config/);
    expect(() => generateUncertaintyRunConfigs(base, { ...config, outputMetrics: ["notAMetric"] })).toThrow(/Unknown output metric/);
  });

  it("generates deterministic concrete RunConfigs without mutating base config or template definitions", () => {
    const base = createDefaultRunConfig({ template: epidemicTemplate, seed: "uncertainty-base" });
    const withUnresolvedConfig = { ...base, uncertaintyConfig: epidemicUncertaintyConfig() as unknown as Record<string, never> };
    const baseBefore = JSON.stringify(withUnresolvedConfig);
    const uncertaintyBefore = JSON.stringify(epidemicUncertaintyConfig());
    const templateBefore = JSON.stringify(epidemicTemplate.parameterDefinitions);
    const first = generateUncertaintyRunConfigs(withUnresolvedConfig, epidemicUncertaintyConfig());
    const second = generateUncertaintyRunConfigs(withUnresolvedConfig, epidemicUncertaintyConfig());
    const differentSeed = generateUncertaintyRunConfigs(withUnresolvedConfig, { ...epidemicUncertaintyConfig(), baseSeed: "different-sampler" });

    expect(first).toEqual(second);
    expect(first).not.toEqual(differentSeed);
    expect(first).toHaveLength(4);
    expect(first.every((config) => config.uncertaintyConfig === undefined)).toBe(true);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    expect(JSON.stringify(withUnresolvedConfig)).toBe(baseBefore);
    expect(JSON.stringify(epidemicUncertaintyConfig())).toBe(uncertaintyBefore);
    expect(JSON.stringify(epidemicTemplate.parameterDefinitions)).toBe(templateBefore);

    const left = new SimulationEngine(epidemicTemplate, { seed: first[0]!.seed, parameters: first[0]!.parameters });
    const right = new SimulationEngine(epidemicTemplate, { seed: first[0]!.seed, parameters: first[0]!.parameters });
    left.runSteps(12);
    right.runSteps(12);
    expect(left.createSnapshot()).toEqual(right.createSnapshot());
  });

  it("supports seed ensembles, categorical options, and preserves behavior/composition fields", () => {
    const base = createDefaultRunConfig({ template: flockingTemplate, seed: "flock-base" });
    const groupAwareBase: SimulationRunConfig = {
      ...base,
      behaviorMode: "groupAware",
      agentComposition: { ...base.agentComposition, agentCount: 40, groupCount: 2, primaryGroupRatio: 0.6 },
      parameters: { ...base.parameters, agentCount: 40 }
    };
    const config: UncertaintyConfig = {
      schemaVersion: "1",
      artifactType: uncertaintyConfigArtifactType,
      baseSeed: "flock-sampler",
      samplingMethod: "randomMonteCarlo",
      sampleCount: 3,
      variables: [
        {
          id: "seed",
          label: "Seed ensemble",
          target: "seed",
          targetPath: "seed",
          enabled: true,
          distribution: { type: "seedEnsemble", seeds: ["a", "b", "c"] }
        },
        {
          id: "boundary",
          label: "Boundary",
          target: "environmentOptions",
          targetPath: "environmentOptions.boundaryMode",
          enabled: true,
          distribution: { type: "categorical", options: ["wrap", "bounce"] }
        }
      ],
      outputMetrics: ["averageSpeed", "interGroupDistance"]
    };

    const generated = generateUncertaintyRunConfigs(groupAwareBase, config);
    expect(generated.map((run) => run.seed)).toEqual(["a", "b", "c"]);
    expect(generated.every((run) => run.behaviorMode === "groupAware")).toBe(true);
    expect(generated.every((run) => run.agentComposition?.groupCount === 2)).toBe(true);
    expect(generated.every((run) => run.environmentOptions?.boundaryMode === "wrap" || run.environmentOptions?.boundaryMode === "bounce")).toBe(true);

    const cycledSeeds = generateUncertaintyRunConfigs(groupAwareBase, {
      ...config,
      sampleCount: 5,
      variables: [
        {
          id: "seed",
          label: "Seed ensemble",
          target: "seed",
          targetPath: "seed",
          enabled: true,
          distribution: { type: "seedEnsemble", seeds: ["a", "b"] }
        }
      ]
    });
    expect(cycledSeeds.map((run) => run.seed)).toEqual(["a", "b", "a", "b", "a"]);

    const duplicateSeeds = generateUncertaintyRunConfigs(groupAwareBase, {
      ...config,
      sampleCount: 3,
      variables: [
        {
          id: "seed",
          label: "Seed ensemble",
          target: "seed",
          targetPath: "seed",
          enabled: true,
          distribution: { type: "seedEnsemble", seeds: ["same", "same", "other"] }
        }
      ]
    });
    expect(duplicateSeeds.map((run) => run.seed)).toEqual(["same", "same", "other"]);
  });

  it("skips disabled variables and records explicit provenance for synced parameter targets", () => {
    const base = createDefaultRunConfig({ template: epidemicTemplate, seed: "sync-base" });
    const generated = generateUncertaintyRunConfigs(base, {
      ...epidemicUncertaintyConfig(),
      sampleCount: 2,
      variables: [
        {
          id: "agent-count",
          label: "Agent count",
          target: "parameter",
          targetPath: "parameters.agentCount",
          enabled: true,
          distribution: { type: "integerRange", min: 81, max: 82 }
        },
        {
          id: "disabled-infection",
          label: "Disabled infection",
          target: "parameter",
          targetPath: "parameters.infectionProbability",
          enabled: false,
          distribution: { type: "uniform", min: 0.05, max: 0.25 }
        }
      ]
    });

    expect(generated).toHaveLength(2);
    expect(generated[0]?.parameters.infectionProbability).toBe(base.parameters.infectionProbability);
    expect(generated[0]?.parameters.agentCount).toBe(generated[0]?.agentComposition?.agentCount);
    const uncertainty = generated[0]?.metadata?.uncertainty as Record<string, unknown> | undefined;
    expect(uncertainty?.sampledValues).toEqual({ "agent-count": generated[0]?.parameters.agentCount });
    expect(uncertainty?.syncedTargetPaths).toEqual({ "agent-count": ["agentComposition.agentCount"] });
  });

  it("runs uncertainty ensembles through the service layer and computes finite output summaries", () => {
    const base = createDefaultRunConfig({ template: epidemicTemplate, seed: "ensemble-base" });
    const result = runUncertaintyEnsemble(base, epidemicUncertaintyConfig(), { ticksPerRun: 8, now: fixedClock() });

    expect(result.artifactType).toBe("ortus.uncertaintyResult");
    expect(result.generatedRunCount).toBe(4);
    expect(result.status).toBe("success");
    expect(result.runs.every((run) => run.status === "success")).toBe(true);
    expect(result.metricSummaries.infectedCount?.count).toBeGreaterThan(0);
    for (const summary of Object.values(result.metricSummaries)) {
      expect(Object.values(summary).every(Number.isFinite)).toBe(true);
    }
    expect(JSON.stringify(result)).not.toContain('"world"');
    expect(JSON.stringify(result)).not.toContain('"metricsHistory"');
    const resultJson = serializeUncertaintyResult(result);
    expect(deserializeUncertaintyResult(resultJson).generatedRunCount).toBe(4);
    expect(() => runUncertaintyEnsemble(base, epidemicUncertaintyConfig(), { ticksPerRun: maxUncertaintyTicksPerRun + 1 })).toThrow(/ticksPerRun/);
  });

  it.each(productionTemplates.map((template) => [template.id, template] as const))(
    "supports production-template numeric-parameter uncertainty for %s",
    (_templateId, template) => {
      const base = createDefaultRunConfig({ template, seed: `uncertainty-${template.id}` });
      const variable = variableForTemplate(template);
      const metric = template.metricDefinitions?.[0]?.key;
      expect(metric).toBeTruthy();
      const config: UncertaintyConfig = {
        schemaVersion: "1",
        artifactType: uncertaintyConfigArtifactType,
        baseSeed: `sampler-${template.id}`,
        samplingMethod: "randomMonteCarlo",
        sampleCount: 2,
        variables: [variable],
        outputMetrics: [metric!]
      };
      const generated = generateUncertaintyRunConfigs(base, config);
      expect(generated).toHaveLength(2);
      for (const runConfig of generated) {
        const first = new SimulationEngine(template, {
          seed: runConfig.seed,
          parameters: runConfig.parameters,
          scenario: {
            behaviorMode: runConfig.behaviorMode ?? "default",
            agentComposition: runConfig.agentComposition ?? {},
            environmentOptions: runConfig.environmentOptions ?? {}
          }
        });
        const second = new SimulationEngine(template, {
          seed: runConfig.seed,
          parameters: runConfig.parameters,
          scenario: {
            behaviorMode: runConfig.behaviorMode ?? "default",
            agentComposition: runConfig.agentComposition ?? {},
            environmentOptions: runConfig.environmentOptions ?? {}
          }
        });
        first.runSteps(5);
        second.runSteps(5);
        expect(first.createSnapshot()).toEqual(second.createSnapshot());
        for (const record of first.createSnapshot().metricsHistory) {
          for (const value of Object.values(record.values)) {
            expect(Number.isFinite(value)).toBe(true);
          }
        }
      }
    }
  );

  it("computes controlled summary statistics while handling missing and non-finite metrics with warnings", () => {
    const summary = summarizeMetricValues([1, 2, 3, 4]);
    expect(summary).toMatchObject({
      count: 4,
      mean: 2.5,
      min: 1,
      max: 4,
      median: 2.5
    });
    expect(summary?.standardDeviation).toBeCloseTo(Math.sqrt(1.25));
    expect(summary?.p05).toBeCloseTo(1.15);
    expect(summary?.p95).toBeCloseTo(3.85);

    const runSummary = summarizeUncertaintyRuns(
      [
        { runId: "a", status: "success", finalMetrics: { value: 1 } },
        { runId: "b", status: "success", finalMetrics: { value: Number.NaN } },
        { runId: "c", status: "success", finalMetrics: {} }
      ],
      ["value"]
    );
    expect(runSummary.metrics.value?.count).toBe(1);
    expect(runSummary.warnings).toEqual(expect.arrayContaining(["Run b reported non-finite metric value", "Run c is missing metric value"]));
    expect(summarizeMetricValues([])).toBeNull();
  });

  it("round-trips uncertainty config JSON and rejects snapshot or scenario JSON as uncertainty configs", () => {
    const base = createDefaultRunConfig({ template: epidemicTemplate, seed: "import-base" });
    const config = epidemicUncertaintyConfig();
    const json = serializeUncertaintyConfig(config, base);
    const imported = deserializeUncertaintyConfig(json, base);
    expect(imported).toEqual(config);
    expect(json).toContain('"artifactType": "ortus.uncertaintyConfig"');

    const snapshotJson = new SimulationEngine(epidemicTemplate, { seed: "snapshot" }).exportSnapshot();
    const scenarioJson = JSON.stringify({
      schemaVersion: "1",
      artifactType: "ortus.scenario",
      scenarioId: "scenario",
      name: "Scenario",
      description: "",
      tags: [],
      templateId: "epidemic-spread",
      templateVersion: "1.0.0",
      seed: "seed",
      parameters: {},
      initializationPreset: "random-outbreak",
      initializationOptions: {},
      metadata: {},
      createdAt: baseNow,
      updatedAt: baseNow
    });
    const runSummaryJson = JSON.stringify({
      schemaVersion: "1",
      artifactType: "ortus.runSummary",
      runId: "run",
      finalMetrics: {}
    });
    expect(() => deserializeUncertaintyConfig(snapshotJson, base)).toThrow(/Invalid uncertainty config/);
    expect(() => deserializeUncertaintyConfig(scenarioJson, base)).toThrow(/Invalid uncertainty config/);
    expect(() => deserializeUncertaintyConfig(runSummaryJson, base)).toThrow(/Invalid uncertainty config/);
    expect(() => deserializeUncertaintyConfig("{bad json", base)).toThrow(/Invalid uncertainty config JSON/);

    const result = runUncertaintyEnsemble(base, config, { ticksPerRun: 2, now: fixedClock() });
    expect(() => deserializeUncertaintyResult(JSON.stringify({ ...result, extra: true }))).toThrow(/Invalid uncertainty result field/);
    expect(() => deserializeUncertaintyResult(JSON.stringify({ ...result, runs: [] }))).toThrow(/Invalid uncertainty result runs/);
    expect(() =>
      deserializeUncertaintyResult(
        JSON.stringify({
          ...result,
          runs: result.runs.map((run, index) => (index === 0 ? { ...run, world: {} } : run))
        })
      )
    ).toThrow(/live run state/);
    expect(() =>
      deserializeUncertaintyResult(
        JSON.stringify({
          schemaVersion: "1",
          artifactType: "ortus.uncertaintyResult",
          generatedRunCount: 0,
          runs: [],
          config: {},
          baseRunConfig: {},
          ticksPerRun: 0,
          metricSummaries: {},
          warnings: ["x".repeat(maxUncertaintyResultJsonLength)],
          status: "success"
        })
      )
    ).toThrow(/characters or less/);
  });

  it("keeps uncertainty implementation free of platform randomness and browser/UI imports", () => {
    const files = uncertaintyFiles(join(process.cwd(), "src", "simulation", "uncertainty"));
    const banned = [
      /Math\.random/,
      /\beval\s*\(/,
      /\bnew\s+Function\b/,
      /from\s+["']react["']/,
      /from\s+["']zustand["']/,
      /\bdocument\./,
      /\bwindow\./,
      /\blocalStorage\b/,
      /\bCanvasRenderingContext2D\b/
    ];
    const offenders = files.filter((file) => banned.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
    expect(offenders).toEqual([]);
  });
});

function epidemicUncertaintyConfig(): UncertaintyConfig {
  return {
    schemaVersion: "1",
    artifactType: uncertaintyConfigArtifactType,
    id: "uncertainty-epidemic",
    label: "Epidemic uncertainty",
    description: "Illustrative parameter uncertainty only.",
    baseSeed: "sampler-seed",
    samplingMethod: "randomMonteCarlo",
    sampleCount: 4,
    variables: [
      {
        id: "infection-probability",
        label: "Infection probability",
        target: "parameter",
        targetPath: "parameters.infectionProbability",
        enabled: true,
        distribution: { type: "uniform", min: 0.05, max: 0.25 },
        notes: "Illustrative range, not calibrated."
      },
      {
        id: "initial-infected",
        label: "Initial infected",
        target: "parameter",
        targetPath: "parameters.initialInfected",
        enabled: true,
        distribution: { type: "integerRange", min: 1, max: 4 }
      }
    ],
    outputMetrics: ["infectedCount", "recoveredCount"],
    metadata: { assumption: "Illustrative only." }
  };
}

function variableForTemplate(template: SimulationTemplate): UncertaintyConfig["variables"][number] {
  const definition = safeNumericParameter(template);
  if (definition.type === "integer") {
    const min = Number(definition.defaultValue);
    const max = Math.min(definition.max ?? min + 1, min + 1);
    return {
      id: `${definition.key}-uncertainty`,
      label: `${definition.label} uncertainty`,
      target: "parameter",
      targetPath: `parameters.${definition.key}`,
      enabled: true,
      distribution: { type: "integerRange", min, max }
    };
  }
  const value = Number(definition.defaultValue);
  const low = Math.max(definition.min ?? value - 0.01, value * 0.95);
  const high = Math.min(definition.max ?? value + 0.01, value === 0 ? 0.01 : value * 1.05);
  return {
    id: `${definition.key}-uncertainty`,
    label: `${definition.label} uncertainty`,
    target: "parameter",
    targetPath: `parameters.${definition.key}`,
    enabled: true,
    distribution: { type: "uniform", min: low, max: high }
  };
}

function safeNumericParameter(template: SimulationTemplate): ParameterDefinition {
  const definition = template.parameterDefinitions.find(
    (candidate) =>
      (candidate.type === "number" || candidate.type === "integer") &&
      typeof candidate.defaultValue === "number" &&
      Number.isFinite(candidate.defaultValue)
  );
  expect(definition).toBeDefined();
  return definition!;
}

function fixedClock(): () => number {
  let value = 0;
  return () => {
    value += 1;
    return value;
  };
}

function uncertaintyFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return uncertaintyFiles(path);
    }
    return path.endsWith(".ts") ? [path] : [];
  });
}
