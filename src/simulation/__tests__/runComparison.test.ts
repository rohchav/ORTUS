import { describe, expect, it } from "vitest";
import type { AppliedInterventionRecord, ExperimentRunResult, JsonValue, MetricRecord, SavedRunSummary } from "../index";
import {
  buildRunSummaryFromSnapshot,
  compareRunSummaries,
  experimentRunToSummary,
  maxRunEventSummaryLength,
  maxSavedRunSummaries,
  maxRunInterventionSummaryLength,
  maxRunMetricHistoryLength,
  SimulationEngine,
  validateRunSummary
} from "../index";
import { deleteRunFromLibrary, loadRunLibrary, saveRunLibrary, saveRunToLibrary, type RunStorageLike } from "../../lib/localRunStorage";
import { exportRunComparisonCsv, exportRunComparisonJson } from "../../lib/runComparisonExport";
import { defaultParameters } from "../../lib/templateVisuals";
import { epidemicTemplate } from "../templates/epidemic.template";
import { opinionTemplate } from "../templates/opinion.template";

describe("run comparison workspace", () => {
  it("captures bounded manual run summaries with template, seed, parameters, metrics, and interventions", () => {
    const engine = new SimulationEngine(epidemicTemplate, {
      seed: "capture-seed",
      parameters: { ...defaultParameters(epidemicTemplate), agentCount: 12, initialInfected: 1, recoveryTicks: 5 }
    });
    engine.runSteps(5);
    const snapshot = engine.createSnapshot();
    const longHistory = Array.from({ length: maxRunMetricHistoryLength + 20 }, (_, index): MetricRecord => ({
      tick: index,
      time: index,
      values: { infectedCount: index, recoveredCount: index / 2 }
    }));
    const interventions = Array.from({ length: maxRunInterventionSummaryLength + 4 }, (_, index) =>
      intervention("infect-radius", `Infect Radius ${index}`, index)
    );
    const summary = buildRunSummaryFromSnapshot({
      runId: "manual-run-1",
      label: "Manual capture",
      template: epidemicTemplate,
      seed: engine.seed,
      parameters: engine.parameters,
      snapshot: { ...snapshot, metricsHistory: longHistory },
      interventionHistory: interventions,
      capturedAt: "2026-05-06T12:00:00.000Z",
      notes: "High contact radius",
      tags: ["manual", " manual "]
    });

    expect(summary.templateId).toBe("epidemic-spread");
    expect(summary.seed).toBe("capture-seed");
    expect(summary.parameters.agentCount).toBe(12);
    expect(summary.ticksRun).toBe(snapshot.tick);
    expect(summary.metricHistory).toHaveLength(maxRunMetricHistoryLength);
    expect(summary.finalMetrics.infectedCount).toBe(maxRunMetricHistoryLength + 19);
    expect(summary.interventions).toHaveLength(maxRunInterventionSummaryLength);
    expect(summary.events?.map((event) => event.type)).toContain("run.initialized");
    expect(summary.interventions[0]?.tickApplied).toBe(4);
    expect(summary.interventions.at(-1)).toEqual({
      interventionId: "infect-radius",
      label: `Infect Radius ${maxRunInterventionSummaryLength + 3}`,
      tickApplied: maxRunInterventionSummaryLength + 3,
      targetSummary: "center radius 10",
      status: "applied"
    });
    expect(summary.tags).toEqual(["manual"]);
    expect(JSON.stringify(summary)).not.toContain('"world"');
  });

  it("builds current-run summaries without advancing or mutating the engine", () => {
    const engine = new SimulationEngine(epidemicTemplate, {
      seed: "capture-stability-seed",
      parameters: { ...defaultParameters(epidemicTemplate), agentCount: 10, initialInfected: 1 }
    });
    engine.runSteps(3);
    const beforeSnapshot = engine.createSnapshot();
    const beforeExport = engine.exportSnapshot();

    const summary = buildRunSummaryFromSnapshot({
      runId: "manual-run-stable",
      label: "No mutation capture",
      template: epidemicTemplate,
      seed: engine.seed,
      parameters: engine.parameters,
      snapshot: beforeSnapshot,
      capturedAt: "2026-05-06T12:05:00.000Z"
    });

    const afterSnapshot = engine.createSnapshot();
    expect(summary.ticksRun).toBe(beforeSnapshot.tick);
    expect(afterSnapshot.tick).toBe(beforeSnapshot.tick);
    expect(afterSnapshot.time).toBe(beforeSnapshot.time);
    expect(engine.exportSnapshot()).toBe(beforeExport);
  });

  it("validates run summaries and rejects malformed or unbounded data", () => {
    const valid = sampleRun("run-valid", "Baseline", { infectedCount: 2 }, { infectionProbability: 0.2 });
    expect(validateRunSummary(valid).runId).toBe("run-valid");
    expect(() => validateRunSummary({ ...valid, runId: "" })).toThrow(/Invalid run summary/);
    expect(() => validateRunSummary({ ...valid, capturedAt: "not-a-date" })).toThrow(/Invalid run summary/);
    expect(() =>
      validateRunSummary({
        ...valid,
        metricHistory: Array.from({ length: maxRunMetricHistoryLength + 1 }, (_, index) => ({ tick: index, time: index, values: {} }))
      })
    ).toThrow(/Invalid run summary/);
    expect(() =>
      validateRunSummary({
        ...valid,
        interventions: Array.from({ length: maxRunInterventionSummaryLength + 1 }, (_, index) => ({
          interventionId: "infect-radius",
          label: "Infect Radius",
          tickApplied: index,
          targetSummary: "center radius 10",
          status: "applied" as const
        }))
      })
    ).toThrow(/Invalid run summary/);
    expect(() =>
      validateRunSummary({
        ...valid,
        events: Array.from({ length: maxRunEventSummaryLength + 1 }, (_, index) => ({
          type: "test.event",
          tick: index,
          source: "test"
        }))
      })
    ).toThrow(/Invalid run summary/);
  });

  it("computes parameter differences and metric deltas without NaN for missing or zero baselines", () => {
    const baseline = sampleRun("run-a", "Baseline", { infectedCount: 0, recoveredCount: 10 }, { infectionProbability: 0.2 });
    const changed = sampleRun("run-b", "Changed", { infectedCount: 3, recoveredCount: 14 }, { infectionProbability: 0.8 });
    const missing = sampleRun("run-c", "Missing metric", { recoveredCount: 5 }, { infectionProbability: 0.8 });
    const comparison = compareRunSummaries([baseline, changed, missing], baseline.runId);

    expect(comparison.baselineRunId).toBe("run-a");
    expect(comparison.parameterDifferences.map((difference) => difference.key)).toEqual(["infectionProbability"]);
    const infected = comparison.metricDeltas.find((metric) => metric.key === "infectedCount");
    const recovered = comparison.metricDeltas.find((metric) => metric.key === "recoveredCount");
    expect(infected?.deltas["run-b"]).toEqual({ absolute: 3 });
    expect(infected?.deltas["run-c"]).toEqual({});
    expect(recovered?.deltas["run-b"]).toEqual({ absolute: 4, percent: 40 });
    expect(JSON.stringify(comparison)).not.toContain("NaN");
  });

  it("limits mismatched-template metric comparison to overlapping numeric metrics", () => {
    const epidemic = sampleRun("run-epidemic", "Epidemic", { shared: 2, infectedCount: 4 }, {});
    const opinion = {
      ...sampleRun("run-opinion", "Opinion", { shared: 5, polarizationScore: 0.3 }, {}),
      templateId: opinionTemplate.id,
      templateName: opinionTemplate.name,
      templateVersion: opinionTemplate.version
    };
    const comparison = compareRunSummaries([epidemic, opinion], epidemic.runId);
    expect(comparison.warnings[0]).toMatch(/different templates/);
    expect(comparison.metricDeltas.map((metric) => metric.key)).toEqual(["shared"]);
  });

  it("saves, loads, deletes, bounds, and recovers from corrupted local storage data", () => {
    const storage = new MemoryStorage();
    const runs = Array.from({ length: maxSavedRunSummaries + 2 }, (_, index) => sampleRun(`run-${index}`, `Run ${index}`, { metric: index }, {}));
    saveRunLibrary(runs, storage);
    expect(loadRunLibrary(storage).runs).toHaveLength(maxSavedRunSummaries);

    const withNewRun = saveRunToLibrary(sampleRun("run-new", "New", { metric: 1 }, {}), loadRunLibrary(storage).runs, storage);
    expect(withNewRun[0]?.runId).toBe("run-new");

    const deleted = deleteRunFromLibrary("run-new", withNewRun, storage);
    expect(deleted.some((run) => run.runId === "run-new")).toBe(false);

    storage.setItem("ortus.runComparison.v1", "{bad json");
    const recovered = loadRunLibrary(storage);
    expect(recovered.runs).toEqual([]);
    expect(recovered.warning).toMatch(/invalid/i);

    const validStored = sampleRun("run-stored", "Stored", { metric: 2 }, {});
    storage.setItem("ortus.runComparison.v1", JSON.stringify([validStored, { ...validStored, runId: "", capturedAt: "bad-date" }]));
    const partiallyRecovered = loadRunLibrary(storage);
    expect(partiallyRecovered.runs.map((run) => run.runId)).toEqual(["run-stored"]);
    expect(partiallyRecovered.warning).toMatch(/some stored/i);
  });

  it("exports JSON and CSV comparison data without full snapshots and with escaped cells", () => {
    const runs = [
      sampleRun("run-a", 'Baseline, "quoted"', { infectedCount: 2 }, { infectionProbability: 0.2 }, "line one\nline two"),
      sampleRun("run-b", "Changed", { infectedCount: 4 }, { infectionProbability: 0.5 })
    ];
    const comparison = compareRunSummaries(runs, "run-a");
    const json = exportRunComparisonJson(runs, comparison);
    const parsed = JSON.parse(json) as { exportedAt?: string; runs?: unknown[]; comparison?: { baselineRunId?: string } };
    expect(parsed.exportedAt).toEqual(expect.any(String));
    expect(parsed.comparison?.baselineRunId).toBe("run-a");
    expect(json).not.toContain('"world"');

    const csv = exportRunComparisonCsv(runs);
    expect(csv.split("\n")[0]).toContain("runId,label,templateId,seed,ticksRun,source");
    expect(csv).toContain('"Baseline, ""quoted"""');
    expect(csv).toContain('"line one\nline two"');
    expect(csv).toContain("metric.infectedCount");
  });

  it("converts experiment run results into comparable run summaries without metric history", () => {
    const run: ExperimentRunResult = {
      runId: "run-1-1",
      templateId: epidemicTemplate.id,
      parameterValues: { ...defaultParameters(epidemicTemplate), infectionProbability: 0.5 },
      sweptValues: { infectionProbability: 0.5 },
      seed: "experiment-seed",
      ticksRun: 25,
      status: "success",
      finalMetrics: { infectedCount: 3, recoveredCount: 9 },
      durationMs: 12,
      metadata: { trialIndex: 1 }
    };
    const summary = experimentRunToSummary({
      template: epidemicTemplate,
      run,
      capturedAt: "2026-05-06T12:30:00.000Z"
    });

    expect(summary.source).toBe("experiment");
    expect(summary.finalMetrics).toEqual({ infectedCount: 3, recoveredCount: 9 });
    expect(summary.metricHistory).toEqual([]);
    expect(summary.metadata?.sweptValues).toEqual({ infectionProbability: 0.5 });
  });
});

function sampleRun(
  runId: string,
  label: string,
  finalMetrics: Record<string, number>,
  parameters: Record<string, JsonValue>,
  notes = ""
): SavedRunSummary {
  return {
    schemaVersion: "1",
    runId,
    label,
    templateId: epidemicTemplate.id,
    templateName: epidemicTemplate.name,
    templateVersion: epidemicTemplate.version,
    seed: "seed",
    parameters,
    capturedAt: "2026-05-06T12:00:00.000Z",
    ticksRun: 10,
    time: 10,
    finalMetrics,
    metricHistory: [{ tick: 10, time: 10, values: finalMetrics }],
    interventions: [],
    source: "manual",
    notes,
    tags: []
  };
}

function intervention(interventionId: string, label: string, tickApplied: number): AppliedInterventionRecord {
  return {
    id: `${interventionId}-${tickApplied}`,
    templateId: epidemicTemplate.id,
    interventionId,
    label,
    tickApplied,
    simulationTime: tickApplied,
    targetSummary: "center radius 10",
    parameters: {},
    status: "applied",
    order: tickApplied
  };
}

class MemoryStorage implements RunStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}
