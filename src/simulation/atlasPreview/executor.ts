import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import { buildEphemeralLandscapePreviewRunPlans, validateEphemeralLandscapePreviewRequest } from "./request";
import {
  ephemeralLandscapePreviewCapabilityVersion,
  ephemeralLandscapePreviewResultArtifactType,
  type EphemeralLandscapePreviewExecutionOptions,
  type EphemeralLandscapePreviewRequest,
  type EphemeralLandscapePreviewResult,
  type PreviewExecutionEngine,
  type PreviewExecutionError,
  type PreviewExecutionProgress,
  type PreviewExecutionStatus,
  type PreviewPlannedRun,
  type PreviewSamplePoint,
  type PreviewSampleRun
} from "./types";

const resultWarnings = [
  "This preview contains model outputs only; it is not empirical evidence or scientific validation.",
  "Only executed coordinates are represented. No interpolation, extrapolation, regime detection, or confidence estimate was performed."
] as const;

export async function executeEphemeralLandscapePreview(
  requestValue: EphemeralLandscapePreviewRequest,
  options: EphemeralLandscapePreviewExecutionOptions = {}
): Promise<EphemeralLandscapePreviewResult> {
  const request = validateEphemeralLandscapePreviewRequest(requestValue);
  const plans = buildEphemeralLandscapePreviewRunPlans(request);
  const createEngine = options.createEngine ?? createEngineFromRunConfig;
  const yieldFn = options.yieldFn ?? defaultYield;
  const runs: PreviewSampleRun[] = [];
  const errors: PreviewExecutionError[] = [];
  let fatalError = false;

  reportProgress(options, progressFor(runs, plans.length, "running"));

  for (let index = 0; index < plans.length; index += 1) {
    const plan = plans[index]!;
    if (options.signal?.cancelled) {
      break;
    }

    reportProgress(options, progressFor(runs, plans.length, "running", plan.runId));
    let engine: PreviewExecutionEngine | undefined;
    let run: PreviewSampleRun;
    try {
      engine = createEngine(plan.runConfig);
      engine.runSteps(request.tickHorizon);
    } catch (error) {
      run = failedRun(plan, engine?.clock.tick ?? 0, "sample_run", userMessage(error));
      errors.push(errorFromRun(run));
      engine = undefined;
      runs.push(run);
      reportProgress(options, progressFor(runs, plans.length, "running", plan.runId));
      if (!(await yieldBetweenRuns(index, plans.length, yieldFn, errors))) {
        fatalError = true;
        break;
      }
      continue;
    }

    try {
      run = observeFinalMetric(plan, engine, request);
    } catch (error) {
      run = failedRun(plan, engine.clock.tick, "metric_observation", userMessage(error));
      errors.push(errorFromRun(run));
    }
    engine = undefined;
    runs.push(run);
    reportProgress(options, progressFor(runs, plans.length, "running", plan.runId));

    if (!(await yieldBetweenRuns(index, plans.length, yieldFn, errors))) {
      fatalError = true;
      break;
    }
  }

  const unstartedRunCount = plans.length - runs.length;
  const cancellationRequested = Boolean(options.signal?.cancelled);
  const cancellationEffective = !fatalError && cancellationRequested && unstartedRunCount > 0;
  const status = resultStatus(runs, fatalError, cancellationEffective);
  const result = buildResult(request, plans, runs, errors, status, cancellationRequested, cancellationEffective);
  reportProgress(
    options,
    progressFor(
      runs,
      plans.length,
      status === "cancelled" ? "cancelled" : status === "failed" ? "failed" : "complete"
    )
  );
  return result;
}

function observeFinalMetric(
  plan: PreviewPlannedRun,
  engine: PreviewExecutionEngine,
  request: EphemeralLandscapePreviewRequest
): PreviewSampleRun {
  if (engine.clock.tick !== request.tickHorizon) {
    throw new Error(`Sample stopped at tick ${engine.clock.tick}; final-tick observation requires tick ${request.tickHorizon}.`);
  }
  const finalRecord = engine.metrics.historyRecords().at(-1);
  if (!finalRecord || finalRecord.tick !== request.tickHorizon) {
    throw new Error(`Metric record for final tick ${request.tickHorizon} is unavailable.`);
  }
  const value = finalRecord.values[request.metricId];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Metric ${request.metricId} is unavailable or non-finite at final tick ${request.tickHorizon}.`);
  }
  return {
    runId: plan.runId,
    pointId: plan.pointId,
    coordinate: plan.coordinate,
    seed: plan.seed,
    runConfig: plan.runConfig,
    status: "success",
    ticksCompleted: engine.clock.tick,
    finalTick: finalRecord.tick,
    metricValue: value
  };
}

function failedRun(
  plan: PreviewPlannedRun,
  ticksCompleted: number,
  kind: "sample_run" | "metric_observation",
  message: string
): PreviewSampleRun {
  return {
    runId: plan.runId,
    pointId: plan.pointId,
    coordinate: plan.coordinate,
    seed: plan.seed,
    runConfig: plan.runConfig,
    status: "failed",
    ticksCompleted,
    finalTick: null,
    metricValue: null,
    error: { kind, message }
  };
}

function errorFromRun(run: PreviewSampleRun): PreviewExecutionError {
  return {
    kind: run.error?.kind ?? "sample_run",
    message: run.error?.message ?? "Sample run failed.",
    runId: run.runId,
    pointId: run.pointId,
    seed: run.seed
  };
}

async function yieldBetweenRuns(
  completedIndex: number,
  plannedRunCount: number,
  yieldFn: () => Promise<void>,
  errors: PreviewExecutionError[]
): Promise<boolean> {
  if (completedIndex >= plannedRunCount - 1) {
    return true;
  }
  try {
    await yieldFn();
    return true;
  } catch (error) {
    errors.push({ kind: "fatal_executor", message: `Preview executor could not yield safely: ${userMessage(error)}` });
    return false;
  }
}

function buildResult(
  request: EphemeralLandscapePreviewRequest,
  plans: readonly PreviewPlannedRun[],
  runs: readonly PreviewSampleRun[],
  errors: readonly PreviewExecutionError[],
  status: PreviewExecutionStatus,
  cancellationRequested: boolean,
  cancellationEffective: boolean
): EphemeralLandscapePreviewResult {
  const successfulRunCount = runs.filter((run) => run.status === "success").length;
  const failedRunCount = runs.length - successfulRunCount;
  return {
    schemaVersion: "1",
    artifactType: ephemeralLandscapePreviewResultArtifactType,
    capabilityVersion: ephemeralLandscapePreviewCapabilityVersion,
    request,
    status,
    partial: status !== "completed",
    plannedRunCount: plans.length,
    completedRunCount: runs.length,
    successfulRunCount,
    failedRunCount,
    points: aggregatePoints(plans, runs, request.seeds.length),
    runs: [...runs],
    cancellation: {
      requested: cancellationRequested,
      effective: cancellationEffective,
      unstartedRunCount: plans.length - runs.length
    },
    errors: [...errors],
    warnings: [...resultWarnings]
  };
}

function aggregatePoints(
  plans: readonly PreviewPlannedRun[],
  runs: readonly PreviewSampleRun[],
  plannedSeedCount: number
): readonly PreviewSamplePoint[] {
  const pointOrder = [...new Set(plans.map((plan) => plan.pointId))];
  return pointOrder.flatMap((pointId) => {
    const pointRuns = runs.filter((run) => run.pointId === pointId);
    if (pointRuns.length === 0) {
      return [];
    }
    const successfulValues = pointRuns.flatMap((run) =>
      run.status === "success" && run.metricValue !== null ? [run.metricValue] : []
    );
    const failedRunCount = pointRuns.length - successfulValues.length;
    const unstartedRunCount = plannedSeedCount - pointRuns.length;
    const status =
      successfulValues.length === 0
        ? "failed"
        : failedRunCount > 0 || unstartedRunCount > 0
          ? "partial"
          : "sampled";
    return [
      {
        pointId,
        coordinate: pointRuns[0]!.coordinate,
        status,
        plannedSeedCount,
        attemptedRunCount: pointRuns.length,
        successfulRunCount: successfulValues.length,
        failedRunCount,
        unstartedRunCount,
        mean: successfulValues.length > 0 ? stableMean(successfulValues) : null,
        minimum: successfulValues.length > 0 ? Math.min(...successfulValues) : null,
        maximum: successfulValues.length > 0 ? Math.max(...successfulValues) : null,
        runs: pointRuns
      } satisfies PreviewSamplePoint
    ];
  });
}

function stableMean(values: readonly number[]): number {
  let sum = 0;
  let compensation = 0;
  for (const value of values) {
    const corrected = value - compensation;
    const next = sum + corrected;
    compensation = next - sum - corrected;
    sum = next;
  }
  return sum / values.length;
}

function resultStatus(
  runs: readonly PreviewSampleRun[],
  fatalError: boolean,
  cancellationEffective: boolean
): PreviewExecutionStatus {
  if (fatalError) {
    return "failed";
  }
  if (cancellationEffective) {
    return "cancelled";
  }
  return runs.some((run) => run.status === "failed") ? "completed_with_errors" : "completed";
}

function progressFor(
  runs: readonly PreviewSampleRun[],
  totalRunCount: number,
  status: PreviewExecutionProgress["status"],
  currentRunId?: string
): PreviewExecutionProgress {
  return {
    completedRunCount: runs.length,
    totalRunCount,
    successfulRunCount: runs.filter((run) => run.status === "success").length,
    failedRunCount: runs.filter((run) => run.status === "failed").length,
    ...(currentRunId ? { currentRunId } : {}),
    status
  };
}

function reportProgress(options: EphemeralLandscapePreviewExecutionOptions, progress: PreviewExecutionProgress): void {
  options.onProgress?.(progress);
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
