import type {
  UncertaintyMetricSummary,
  UncertaintyRunResult,
  UncertaintySummaryResult
} from "./types";

export function summarizeUncertaintyRuns(
  runs: readonly Pick<UncertaintyRunResult, "runId" | "finalMetrics" | "status">[],
  outputMetrics: readonly string[]
): UncertaintySummaryResult {
  const warnings: string[] = [];
  const metrics: Record<string, UncertaintyMetricSummary> = {};
  for (const metric of outputMetrics) {
    const values: number[] = [];
    for (const run of runs) {
      if (run.status !== "success") {
        continue;
      }
      const value = run.finalMetrics[metric];
      if (value === undefined) {
        warnings.push(`Run ${run.runId} is missing metric ${metric}`);
        continue;
      }
      if (!Number.isFinite(value)) {
        warnings.push(`Run ${run.runId} reported non-finite metric ${metric}`);
        continue;
      }
      values.push(value);
    }
    const summary = summarizeMetricValues(values);
    if (summary) {
      metrics[metric] = summary;
    }
  }
  return { metrics, warnings: [...new Set(warnings)] };
}

export function summarizeMetricValues(values: readonly number[]): UncertaintyMetricSummary | null {
  const finite = values.filter((value) => Number.isFinite(value)).sort((left, right) => left - right);
  if (finite.length === 0) {
    return null;
  }
  const mean = finite.reduce((sum, value) => sum + value, 0) / finite.length;
  const variance = finite.reduce((sum, value) => sum + (value - mean) ** 2, 0) / finite.length;
  return {
    count: finite.length,
    mean,
    min: finite[0]!,
    max: finite[finite.length - 1]!,
    median: quantile(finite, 0.5),
    standardDeviation: Math.sqrt(variance),
    p05: quantile(finite, 0.05),
    p95: quantile(finite, 0.95)
  };
}

function quantile(sortedValues: readonly number[], probability: number): number {
  if (sortedValues.length === 1) {
    return sortedValues[0]!;
  }
  const clamped = Math.max(0, Math.min(1, probability));
  const position = (sortedValues.length - 1) * clamped;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) {
    return sortedValues[lower]!;
  }
  const weight = position - lower;
  return sortedValues[lower]! * (1 - weight) + sortedValues[upper]! * weight;
}
