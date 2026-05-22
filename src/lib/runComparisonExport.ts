import type { RunComparisonResult, SavedRunSummary } from "../simulation";
import packageJson from "../../package.json";

export function exportRunComparisonJson(runs: readonly SavedRunSummary[], comparison: RunComparisonResult): string {
  return JSON.stringify(
    {
      schemaVersion: "1",
      exportedAt: new Date().toISOString(),
      app: {
        name: packageJson.name,
        version: packageJson.version
      },
      comparison: {
        baselineRunId: comparison.baselineRunId,
        runIds: comparison.runIds,
        metricDeltas: comparison.metricDeltas,
        parameterDifferences: comparison.parameterDifferences,
        warnings: comparison.warnings
      },
      runs
    },
    null,
    2
  );
}

export function exportRunComparisonCsv(runs: readonly SavedRunSummary[]): string {
  const parameterKeys = uniqueKeys(runs.flatMap((run) => Object.keys(run.parameters)));
  const metricKeys = uniqueKeys(runs.flatMap((run) => Object.keys(run.finalMetrics)));
  const columns = [
    "runId",
    "label",
    "templateId",
    "seed",
    "ticksRun",
    "source",
    "capturedAt",
    "interventionCount",
    "notes",
    "tags",
    ...parameterKeys.map((key) => `param.${key}`),
    ...metricKeys.map((key) => `metric.${key}`)
  ];
  const rows = runs.map((run) => [
    run.runId,
    run.label,
    run.templateId,
    run.seed,
    String(run.ticksRun),
    run.source,
    run.capturedAt,
    String(run.interventions.length),
    run.notes,
    run.tags.join(";"),
    ...parameterKeys.map((key) => valueForCsv(run.parameters[key])),
    ...metricKeys.map((key) => valueForCsv(run.finalMetrics[key]))
  ]);
  return [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function uniqueKeys(keys: readonly string[]): string[] {
  return [...new Set(keys)].sort((left, right) => left.localeCompare(right));
}

function valueForCsv(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(Number(value.toFixed(6))) : "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function csvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
}
