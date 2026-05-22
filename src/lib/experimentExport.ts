import type { ExperimentResultSet, ExperimentRunResult } from "../simulation";
import { getProductionTemplate } from "../simulation";
import packageJson from "../../package.json";

export function exportExperimentJson(result: ExperimentResultSet): string {
  const template = getProductionTemplate(result.config.templateId);
  return JSON.stringify(
    {
      schemaVersion: "1",
      exportedAt: new Date().toISOString(),
      app: {
        name: packageJson.name,
        version: packageJson.version
      },
      template: {
        id: result.config.templateId,
        version: template?.version ?? "unknown"
      },
      result
    },
    null,
    2
  );
}

export function exportExperimentCsv(result: ExperimentResultSet): string {
  const parameterKeys = uniqueKeys(result.runs.flatMap((run) => Object.keys(run.parameterValues)));
  const metricKeys = uniqueKeys(result.runs.flatMap((run) => Object.keys(run.finalMetrics)));
  const columns = [
    "runId",
    "templateId",
    "seed",
    "ticksRun",
    "status",
    "durationMs",
    "error",
    ...parameterKeys.map((key) => `param.${key}`),
    ...metricKeys.map((key) => `metric.${key}`)
  ];
  const rows = result.runs.map((run) => rowForRun(run, parameterKeys, metricKeys));
  return [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function rowForRun(run: ExperimentRunResult, parameterKeys: readonly string[], metricKeys: readonly string[]): string[] {
  return [
    run.runId,
    run.templateId,
    run.seed,
    String(run.ticksRun),
    run.status,
    String(round(run.durationMs)),
    run.error ?? "",
    ...parameterKeys.map((key) => valueForCsv(run.parameterValues[key])),
    ...metricKeys.map((key) => valueForCsv(run.finalMetrics[key]))
  ];
}

function uniqueKeys(keys: readonly string[]): string[] {
  return [...new Set(keys)].sort((left, right) => left.localeCompare(right));
}

function valueForCsv(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "number") {
    return String(round(value));
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function round(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(6)) : value;
}

function csvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
}
