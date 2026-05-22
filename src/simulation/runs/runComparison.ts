import type { JsonValue } from "../kernel/types";
import type { RunComparisonResult, RunMetricDelta, RunParameterDifference, SavedRunSummary } from "./runSummaryTypes";
import { maxSavedRunSummaries } from "./runSummaryTypes";

export function compareRunSummaries(runs: readonly SavedRunSummary[], baselineRunId?: string | null): RunComparisonResult {
  const selectedRuns = runs.filter((run, index, array) => array.findIndex((candidate) => candidate.runId === run.runId) === index);
  const baseline = selectedRuns.find((run) => run.runId === baselineRunId) ?? selectedRuns[0] ?? null;
  const warnings: string[] = [];
  const templateIds = new Set(selectedRuns.map((run) => run.templateId));
  if (templateIds.size > 1) {
    warnings.push("Selected runs use different templates. Metric comparison is limited to overlapping numeric metric keys.");
  }
  if (selectedRuns.length < 2) {
    warnings.push("Select at least two runs to compare deltas.");
  }

  return {
    baselineRunId: baseline?.runId ?? null,
    runIds: selectedRuns.map((run) => run.runId),
    metadata: selectedRuns.map((run) => ({
      runId: run.runId,
      label: run.label,
      templateId: run.templateId,
      seed: run.seed,
      ticksRun: run.ticksRun,
      source: run.source,
      capturedAt: run.capturedAt,
      interventionCount: run.interventions.length
    })),
    parameterDifferences: differingParameters(selectedRuns),
    metricDeltas: metricDeltas(selectedRuns, baseline, templateIds.size > 1),
    warnings
  };
}

export function addRunToLibrary(
  existing: readonly SavedRunSummary[],
  run: SavedRunSummary,
  maxRuns = maxSavedRunSummaries
): SavedRunSummary[] {
  const withoutDuplicate = existing.filter((candidate) => candidate.runId !== run.runId);
  return [run, ...withoutDuplicate].slice(0, maxRuns);
}

export function updateRunInLibrary(
  existing: readonly SavedRunSummary[],
  runId: string,
  patch: Partial<Pick<SavedRunSummary, "label" | "notes" | "tags">>
): SavedRunSummary[] {
  return existing.map((run) =>
    run.runId === runId
      ? {
          ...run,
          label: normalizeLabel(patch.label ?? run.label),
          notes: patch.notes ?? run.notes,
          tags: patch.tags ? normalizeTags(patch.tags) : run.tags
        }
      : run
  );
}

function differingParameters(runs: readonly SavedRunSummary[]): RunParameterDifference[] {
  const keys = uniqueSorted(runs.flatMap((run) => Object.keys(run.parameters)));
  return keys
    .map((key) => ({
      key,
      values: Object.fromEntries(runs.map((run) => [run.runId, run.parameters[key]])) as Record<string, JsonValue | undefined>
    }))
    .filter((difference) => {
      const values = runs.map((run) => stableJson(run.parameters[difference.key]));
      return new Set(values).size > 1;
    });
}

function metricDeltas(runs: readonly SavedRunSummary[], baseline: SavedRunSummary | null, requireOverlap: boolean): RunMetricDelta[] {
  if (!baseline) {
    return [];
  }
  const metricKeys = requireOverlap
    ? intersectionKeys(runs.map((run) => numericMetricKeys(run)))
    : uniqueSorted(runs.flatMap((run) => numericMetricKeys(run)));
  return metricKeys.map((key) => {
    const baselineValue = baseline.finalMetrics[key];
    const values: Record<string, number | undefined> = {};
    const deltas: Record<string, { absolute?: number; percent?: number }> = {};
    for (const run of runs) {
      const value = run.finalMetrics[key];
      values[run.runId] = Number.isFinite(value) ? value : undefined;
      if (typeof value === "number" && typeof baselineValue === "number" && Number.isFinite(value) && Number.isFinite(baselineValue)) {
        const absolute = round(value - baselineValue);
        deltas[run.runId] = {
          absolute,
          ...(baselineValue !== 0 ? { percent: round((absolute / baselineValue) * 100) } : {})
        };
      } else {
        deltas[run.runId] = {};
      }
    }
    return {
      key,
      ...(Number.isFinite(baselineValue) ? { baselineValue } : {}),
      values,
      deltas
    };
  });
}

function numericMetricKeys(run: SavedRunSummary): string[] {
  return Object.keys(run.finalMetrics).filter((key) => Number.isFinite(run.finalMetrics[key]));
}

function intersectionKeys(keySets: readonly string[][]): string[] {
  if (keySets.length === 0) {
    return [];
  }
  const [first, ...rest] = keySets.map((keys) => new Set(keys));
  return [...(first ?? new Set<string>())].filter((key) => rest.every((set) => set.has(key))).sort((left, right) => left.localeCompare(right));
}

function uniqueSorted(keys: readonly string[]): string[] {
  return [...new Set(keys)].sort((left, right) => left.localeCompare(right));
}

function stableJson(value: unknown): string {
  if (value === undefined) {
    return "__undefined__";
  }
  return JSON.stringify(value);
}

function round(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(6)) : value;
}

function normalizeLabel(label: string): string {
  const trimmed = label.trim();
  return trimmed ? trimmed.slice(0, 90) : "Untitled run";
}

function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 8);
}
