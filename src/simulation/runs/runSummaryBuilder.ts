import type { ExperimentRunResult } from "../experiments/experimentTypes";
import type { AppliedInterventionRecord } from "../interventions/interventionTypes";
import type { JsonValue, ParameterValues, SimulationSnapshotView, SimulationTemplate } from "../kernel/types";
import { readSimulationEventLogFromGlobals } from "../kernel/EventLog";
import { deepClone } from "../kernel/Validation";
import type { RunEventSummary, RunInterventionSummary, SavedRunSummary } from "./runSummaryTypes";
import { maxRunEventSummaryLength, maxRunInterventionSummaryLength, maxRunMetricHistoryLength, metricRecordFromKernel } from "./runSummaryTypes";
import { validateRunSummary } from "./runComparisonValidation";

export interface BuildRunSummaryOptions {
  runId: string;
  label?: string;
  template: SimulationTemplate;
  seed: string;
  parameters: ParameterValues;
  snapshot: SimulationSnapshotView;
  interventionHistory?: readonly AppliedInterventionRecord[];
  capturedAt: string;
  notes?: string;
  tags?: readonly string[];
  source?: SavedRunSummary["source"];
  metadata?: Record<string, JsonValue>;
}

export interface ExperimentRunSummaryOptions {
  template: SimulationTemplate;
  run: ExperimentRunResult;
  capturedAt: string;
  runId?: string;
  label?: string;
  notes?: string;
  tags?: readonly string[];
}

export function buildRunSummaryFromSnapshot(options: BuildRunSummaryOptions): SavedRunSummary {
  const metricHistory = options.snapshot.metricsHistory.slice(-maxRunMetricHistoryLength).map(metricRecordFromKernel);
  const finalMetrics = finiteMetrics(metricHistory.at(-1)?.values ?? {});
  const summary: SavedRunSummary = {
    schemaVersion: "1",
    runId: options.runId,
    label: normalizeLabel(options.label, `${options.template.name} tick ${options.snapshot.tick}`),
    templateId: options.template.id,
    templateName: options.template.name,
    templateVersion: options.template.version,
    seed: options.seed,
    parameters: deepClone(options.parameters),
    capturedAt: options.capturedAt,
    ticksRun: options.snapshot.tick,
    time: options.snapshot.time,
    finalMetrics,
    metricHistory,
    interventions: summarizeInterventions(options.interventionHistory ?? []),
    events: summarizeEvents(readSimulationEventLogFromGlobals(options.snapshot.globals)),
    source: options.source ?? "manual",
    notes: options.notes ?? "",
    tags: normalizeTags(options.tags ?? []),
    ...(options.metadata ? { metadata: deepClone(options.metadata) } : {})
  };
  return validateRunSummary(summary);
}

export function experimentRunToSummary(options: ExperimentRunSummaryOptions): SavedRunSummary {
  const summary: SavedRunSummary = {
    schemaVersion: "1",
    runId: options.runId ?? `experiment-${options.run.runId}`,
    label: normalizeLabel(options.label, `${options.template.name} ${options.run.runId}`),
    templateId: options.template.id,
    templateName: options.template.name,
    templateVersion: options.template.version,
    seed: options.run.seed,
    parameters: deepClone(options.run.parameterValues),
    capturedAt: options.capturedAt,
    ticksRun: options.run.ticksRun,
    time: options.run.ticksRun,
    finalMetrics: finiteMetrics(options.run.finalMetrics),
    metricHistory: [],
    interventions: [],
    source: "experiment",
    notes: options.notes ?? "",
    tags: normalizeTags(options.tags ?? []),
    metadata: {
      originalRunId: options.run.runId,
      status: options.run.status,
      durationMs: options.run.durationMs,
      sweptValues: deepClone(options.run.sweptValues),
      ...(options.run.metadata ?? {})
    }
  };
  return validateRunSummary(summary);
}

export function summarizeInterventions(records: readonly AppliedInterventionRecord[]): RunInterventionSummary[] {
  return records.slice(-maxRunInterventionSummaryLength).map((record) => ({
    interventionId: record.interventionId,
    label: record.label,
    tickApplied: record.tickApplied,
    targetSummary: record.targetSummary,
    status: record.status
  }));
}

export function summarizeEvents(records: ReturnType<typeof readSimulationEventLogFromGlobals>): RunEventSummary[] {
  return records.slice(-maxRunEventSummaryLength).map((record) => ({
    type: record.type,
    tick: record.tick,
    source: record.source,
    ...(record.label !== undefined ? { label: record.label } : {}),
    ...(record.severity !== undefined ? { severity: record.severity } : {}),
    ...(record.category !== undefined ? { category: record.category } : {})
  }));
}

function finiteMetrics(values: Record<string, number>): Record<string, number> {
  const entries = Object.entries(values).filter(([, value]) => Number.isFinite(value));
  return Object.fromEntries(entries.sort(([left], [right]) => left.localeCompare(right)));
}

function normalizeLabel(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 90) : fallback.slice(0, 90);
}

function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 8);
}
