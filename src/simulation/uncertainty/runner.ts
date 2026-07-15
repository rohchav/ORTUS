import { SimulationValidationError } from "../kernel/Errors";
import type { SimulationRunConfig } from "../kernel/types";
import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import { validateRunConfig } from "../runs/runConfig";
import { getProductionTemplate } from "../templates/registry";
import { generateUncertaintyRunConfigs } from "./sampling";
import {
  uncertaintyResultArtifactType,
  maxUncertaintyTicksPerRun,
  type UncertaintyConfig,
  type UncertaintyResultSet,
  type UncertaintyRunOptions,
  type UncertaintyRunResult
} from "./types";
import { normalizeOutputMetrics, validateUncertaintyConfig } from "./validation";
import { summarizeUncertaintyRuns } from "./results";

export function runUncertaintyEnsemble(
  baseRunConfig: SimulationRunConfig,
  uncertaintyConfig: UncertaintyConfig,
  options: UncertaintyRunOptions = {}
): UncertaintyResultSet {
  const base = validateRunConfig(baseRunConfig);
  const template = getProductionTemplate(base.templateId);
  if (!template) {
    throw new Error(`Unknown uncertainty template: ${base.templateId}`);
  }
  const validation = validateUncertaintyConfig(uncertaintyConfig, base);
  const config = validation.config;
  const outputMetrics = normalizeOutputMetrics(config, template);
  const runConfigs = generateUncertaintyRunConfigs(base, config);
  const ticksPerRun = normalizeTicksPerRun(options.ticksPerRun ?? 50);
  const now = options.now ?? defaultNow;
  const runs: UncertaintyRunResult[] = [];

  for (let index = 0; index < runConfigs.length; index += 1) {
    const runConfig = runConfigs[index]!;
    const started = now();
    try {
      const engine = createEngineFromRunConfig(runConfig);
      engine.runSteps(ticksPerRun);
      const finalRecord = engine.metrics.historyRecords().at(-1);
      runs.push({
        runId: `uncertainty-run-${index + 1}`,
        templateId: runConfig.templateId,
        sampleIndex: uncertaintyMetadataNumber(runConfig, "sampleIndex", index),
        repeatIndex: uncertaintyMetadataNumber(runConfig, "repeatIndex", 0),
        seed: runConfig.seed,
        parameters: runConfig.parameters,
        behaviorMode: runConfig.behaviorMode,
        agentComposition: runConfig.agentComposition,
        environmentOptions: runConfig.environmentOptions,
        ticksRun: ticksPerRun,
        status: "success",
        finalMetrics: selectMetrics(finalRecord?.values ?? {}, outputMetrics),
        metadata: {
          ...(runConfig.metadata ?? {}),
          durationMs: Math.max(0, now() - started)
        }
      });
    } catch (error) {
      runs.push({
        runId: `uncertainty-run-${index + 1}`,
        templateId: runConfig.templateId,
        sampleIndex: uncertaintyMetadataNumber(runConfig, "sampleIndex", index),
        repeatIndex: uncertaintyMetadataNumber(runConfig, "repeatIndex", 0),
        seed: runConfig.seed,
        parameters: runConfig.parameters,
        behaviorMode: runConfig.behaviorMode,
        agentComposition: runConfig.agentComposition,
        environmentOptions: runConfig.environmentOptions,
        ticksRun: 0,
        status: "failed",
        finalMetrics: {},
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          ...(runConfig.metadata ?? {}),
          durationMs: Math.max(0, now() - started)
        }
      });
    }
  }

  const summaries = summarizeUncertaintyRuns(runs, outputMetrics);
  return {
    schemaVersion: "1",
    artifactType: uncertaintyResultArtifactType,
    config,
    baseRunConfig: base,
    generatedRunCount: runConfigs.length,
    ticksPerRun,
    runs,
    metricSummaries: summaries.metrics,
    warnings: [...validation.warnings, ...summaries.warnings],
    status: runs.some((run) => run.status === "failed") ? "failed" : "success"
  };
}

function selectMetrics(values: Record<string, number>, requested: readonly string[]): Record<string, number> {
  const selected: Record<string, number> = {};
  for (const key of requested) {
    const value = values[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      selected[key] = value;
    }
  }
  return selected;
}

function uncertaintyMetadataNumber(runConfig: SimulationRunConfig, key: "sampleIndex" | "repeatIndex", fallback: number): number {
  const uncertainty = runConfig.metadata?.uncertainty;
  if (uncertainty && typeof uncertainty === "object" && !Array.isArray(uncertainty)) {
    const value = (uncertainty as Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return fallback;
}

function defaultNow(): number {
  return Date.now();
}

function normalizeTicksPerRun(value: number): number {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0 || value > maxUncertaintyTicksPerRun) {
    throw new SimulationValidationError(`Uncertainty ticksPerRun must be an integer from 0 to ${maxUncertaintyTicksPerRun}`);
  }
  return value;
}
