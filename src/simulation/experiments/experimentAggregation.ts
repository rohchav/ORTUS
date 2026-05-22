import type {
  ExperimentAggregateResult,
  ExperimentConfig,
  ExperimentMetricAggregate,
  ExperimentRunResult,
  SweepValue
} from "./experimentTypes";

export function aggregateExperimentResults(config: ExperimentConfig, runs: readonly ExperimentRunResult[]): ExperimentAggregateResult[] {
  const groups = new Map<string, ExperimentRunResult[]>();
  for (const run of runs) {
    const key = conditionKey(run.sweptValues);
    const bucket = groups.get(key) ?? [];
    bucket.push(run);
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .map(([key, bucket]) => {
      const representative = bucket[0]!;
      const successful = bucket.filter((run) => run.status === "success");
      const failed = bucket.filter((run) => run.status === "failed");
      const cancelled = bucket.filter((run) => run.status === "cancelled");
      return {
        conditionKey: key,
        parameterValues: representative.parameterValues,
        sweptValues: representative.sweptValues,
        runCount: bucket.length,
        successCount: successful.length,
        failureCount: failed.length,
        cancelledCount: cancelled.length,
        metrics: aggregateMetrics(config.metricsToRecord, successful)
      };
    })
    .sort(compareAggregates);
}

function aggregateMetrics(metricKeys: readonly string[], runs: readonly ExperimentRunResult[]): Record<string, ExperimentMetricAggregate> {
  const keys = metricKeys.length > 0 ? metricKeys : uniqueMetricKeys(runs);
  const output: Record<string, ExperimentMetricAggregate> = {};
  for (const key of keys) {
    const values = runs.map((run) => run.finalMetrics[key]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    if (values.length === 0) {
      continue;
    }
    const mean = values.reduce((total, value) => total + value, 0) / values.length;
    const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
    output[key] = {
      count: values.length,
      mean,
      min: Math.min(...values),
      max: Math.max(...values),
      standardDeviation: Math.sqrt(variance)
    };
  }
  return output;
}

function uniqueMetricKeys(runs: readonly ExperimentRunResult[]): string[] {
  const keys = new Set<string>();
  for (const run of runs) {
    for (const key of Object.keys(run.finalMetrics)) {
      keys.add(key);
    }
  }
  return [...keys].sort((left, right) => left.localeCompare(right));
}

function conditionKey(values: Record<string, SweepValue>): string {
  return JSON.stringify(Object.fromEntries(Object.entries(values).sort(([left], [right]) => left.localeCompare(right))));
}

function compareAggregates(left: ExperimentAggregateResult, right: ExperimentAggregateResult): number {
  const leftEntries = Object.entries(left.sweptValues).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
  const rightEntries = Object.entries(right.sweptValues).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
  for (let index = 0; index < Math.max(leftEntries.length, rightEntries.length); index += 1) {
    const leftEntry = leftEntries[index];
    const rightEntry = rightEntries[index];
    if (!leftEntry) {
      return -1;
    }
    if (!rightEntry) {
      return 1;
    }
    const [leftKey, leftValue] = leftEntry;
    const [rightKey, rightValue] = rightEntry;
    const keyComparison = leftKey.localeCompare(rightKey);
    if (keyComparison !== 0) {
      return keyComparison;
    }
    const valueComparison = compareSweepValues(leftValue, rightValue);
    if (valueComparison !== 0) {
      return valueComparison;
    }
  }
  return left.conditionKey.localeCompare(right.conditionKey);
}

function compareSweepValues(left: SweepValue, right: SweepValue): number {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }
  return String(left).localeCompare(String(right), undefined, { numeric: true });
}
