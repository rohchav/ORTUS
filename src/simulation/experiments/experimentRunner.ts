import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationValidationError } from "../kernel/Errors";
import type { ParameterValues } from "../kernel/types";
import { getProductionTemplate } from "../templates/registry";
import { aggregateExperimentResults } from "./experimentAggregation";
import {
  type ExperimentConfig,
  type ExperimentProgress,
  type ExperimentResultSet,
  type ExperimentRunOptions,
  type ExperimentRunPlan,
  type ExperimentRunResult
} from "./experimentTypes";
import { validateExperimentConfig } from "./experimentValidation";

export async function runExperiment(config: ExperimentConfig, options: ExperimentRunOptions = {}): Promise<ExperimentResultSet> {
  const validation = validateExperimentConfig(config);
  const template = getProductionTemplate(validation.config.templateId);
  if (!template) {
    throw new SimulationValidationError(`Unknown experiment template: ${validation.config.templateId}`);
  }

  const now = options.now ?? defaultNow;
  const yieldEvery = Math.max(1, options.yieldEvery ?? 1);
  const yieldFn = options.yieldFn ?? defaultYield;
  const runs: ExperimentRunResult[] = [];
  let completedRuns = 0;
  reportProgress(options, {
    completedRuns,
    totalRuns: validation.totalRuns,
    status: "running"
  });

  for (let index = 0; index < validation.runPlans.length; index += 1) {
    const plan = validation.runPlans[index]!;
    if (options.signal?.cancelled) {
      appendCancelledRuns(validation.runPlans.slice(index), validation.config, runs);
      completedRuns = runs.length;
      reportProgress(options, {
        completedRuns,
        totalRuns: validation.totalRuns,
        status: "cancelled"
      });
      break;
    }

    reportProgress(options, {
      completedRuns,
      totalRuns: validation.totalRuns,
      currentRunId: plan.runId,
      status: "running"
    });

    runs.push(runSinglePlan(template, validation.config, plan, now));
    completedRuns = runs.length;
    reportProgress(options, {
      completedRuns,
      totalRuns: validation.totalRuns,
      currentRunId: plan.runId,
      status: options.signal?.cancelled ? "cancelled" : "running"
    });

    if ((index + 1) % yieldEvery === 0) {
      await yieldFn();
    }
  }

  const status = runs.some((run) => run.status === "cancelled")
    ? "cancelled"
    : runs.some((run) => run.status === "failed")
      ? "failed"
      : "success";
  const result: ExperimentResultSet = {
    config: validation.config,
    runs,
    aggregates: aggregateExperimentResults(validation.config, runs),
    status
  };

  reportProgress(options, {
    completedRuns: runs.length,
    totalRuns: validation.totalRuns,
    status: status === "cancelled" ? "cancelled" : "complete"
  });
  return result;
}

function runSinglePlan(
  template: NonNullable<ReturnType<typeof getProductionTemplate>>,
  config: ExperimentConfig,
  plan: ExperimentRunPlan,
  now: () => number
): ExperimentRunResult {
  const started = now();
  try {
    const engine = new SimulationEngine(template, {
      seed: plan.seed,
      parameters: plan.condition.parameterValues
    });
    engine.runSteps(config.ticksPerRun);
    const finalRecord = engine.metrics.historyRecords().at(-1);
    const finalMetrics = selectMetrics(finalRecord?.values ?? {}, config.metricsToRecord);
    return {
      runId: plan.runId,
      templateId: config.templateId,
      parameterValues: plan.condition.parameterValues,
      sweptValues: plan.condition.sweptValues,
      seed: plan.seed,
      ticksRun: config.ticksPerRun,
      status: "success",
      finalMetrics,
      selectedSummaryMetrics: finalMetrics,
      durationMs: Math.max(0, now() - started),
      metadata: { trialIndex: plan.trialIndex }
    };
  } catch (error) {
    return {
      runId: plan.runId,
      templateId: config.templateId,
      parameterValues: plan.condition.parameterValues,
      sweptValues: plan.condition.sweptValues,
      seed: plan.seed,
      ticksRun: 0,
      status: "failed",
      finalMetrics: {},
      error: userMessage(error),
      durationMs: Math.max(0, now() - started),
      metadata: { trialIndex: plan.trialIndex }
    };
  }
}

function appendCancelledRuns(plans: readonly ExperimentRunPlan[], config: ExperimentConfig, runs: ExperimentRunResult[]): void {
  for (const plan of plans) {
    runs.push({
      runId: plan.runId,
      templateId: config.templateId,
      parameterValues: plan.condition.parameterValues,
      sweptValues: plan.condition.sweptValues,
      seed: plan.seed,
      ticksRun: 0,
      status: "cancelled",
      finalMetrics: {},
      error: "Cancelled before this run started.",
      durationMs: 0,
      metadata: { trialIndex: plan.trialIndex }
    });
  }
}

function selectMetrics(values: Record<string, number>, requested: readonly string[]): Record<string, number> {
  const keys = requested.length > 0 ? requested : Object.keys(values).sort((left, right) => left.localeCompare(right));
  const selected: Record<string, number> = {};
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      selected[key] = value;
    }
  }
  return selected;
}

function reportProgress(options: ExperimentRunOptions, progress: ExperimentProgress): void {
  options.onProgress?.(progress);
}

function defaultNow(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function defaultYield(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function userMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 360 ? `${message.slice(0, 357)}...` : message;
}

export function mergeExperimentParameters(base: ParameterValues, overrides: ParameterValues): ParameterValues {
  return { ...base, ...overrides };
}
