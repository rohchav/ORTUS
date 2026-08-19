"use client";

import { useEffect, useMemo, useState } from "react";
import { compareRunSummaries, maxSavedRunSummaries, type RunComparisonResult, type SavedRunSummary } from "../simulation";
import { exportRunComparisonCsv, exportRunComparisonJson } from "../lib/runComparisonExport";
import { formatNumber, formatTick } from "../lib/format";
import { getTemplateDescriptor, metricLabel } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

interface RunComparisonPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
  embedded?: boolean;
  active?: boolean;
}

const traceColors = ["#d8ff3e", "#ff4a2e", "#f3f1e8", "#6c72ff", "#c34dff", "#9a9b94"];

export function RunComparisonPanel({ collapsed = false, onToggle, embedded = false, active = true }: RunComparisonPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const runtime = useActiveWorldRuntime();
  const seed = useSimulationStore((state) => state.seed);
  const savedRuns = useSimulationStore((state) => state.savedRuns);
  const runLibraryWarning = useSimulationStore((state) => state.runLibraryWarning);
  const selectedRunIds = useSimulationStore((state) => state.selectedComparisonRunIds);
  const baselineRunId = useSimulationStore((state) => state.baselineRunId);
  const latestExperimentResultSet = useSimulationStore((state) => state.latestExperimentResultSet);
  const importLatestExperimentRuns = useSimulationStore((state) => state.importLatestExperimentRuns);
  const toggleComparisonRun = useSimulationStore((state) => state.toggleComparisonRun);
  const setComparisonBaseline = useSimulationStore((state) => state.setComparisonBaseline);
  const updateSavedRun = useSimulationStore((state) => state.updateSavedRun);
  const deleteSavedRun = useSimulationStore((state) => state.deleteSavedRun);
  const clearSavedRuns = useSimulationStore((state) => state.clearSavedRuns);
  const [captureLabel, setCaptureLabel] = useState("");
  const [captureNotes, setCaptureNotes] = useState("");
  const [captureTags, setCaptureTags] = useState("");
  const selectedRuns = useMemo(
    () => selectedRunIds.map((runId) => savedRuns.find((run) => run.runId === runId)).filter((run): run is SavedRunSummary => Boolean(run)),
    [savedRuns, selectedRunIds]
  );
  const comparison = useMemo(() => compareRunSummaries(selectedRuns, baselineRunId), [baselineRunId, selectedRuns]);
  const metricKeys = comparison.metricDeltas.map((metric) => metric.key);
  const [traceMetricKey, setTraceMetricKey] = useState(metricKeys[0] ?? "");

  useEffect(() => {
    if (!metricKeys.includes(traceMetricKey)) {
      setTraceMetricKey(metricKeys[0] ?? "");
    }
  }, [metricKeys, traceMetricKey]);

  function captureRun() {
    void runtime.captureCurrentRun({
      label: captureLabel,
      notes: captureNotes,
      tags: splitTags(captureTags)
    });
    setCaptureLabel("");
    setCaptureNotes("");
    setCaptureTags("");
  }

  function exportJson() {
    if (selectedRuns.length === 0) {
      return;
    }
    downloadText("ortus-run-comparison.json", exportRunComparisonJson(selectedRuns, comparison), "application/json");
  }

  function exportCsv() {
    if (selectedRuns.length === 0) {
      return;
    }
    downloadText("ortus-run-comparison.csv", exportRunComparisonCsv(selectedRuns), "text/csv");
  }

  const content = (
      <div className="run-comparison-panel world-task-view">
        <section className="world-tool-section" aria-labelledby="comparison-current-run-title">
          <div className="world-tool-section__head">
            <h3 id="comparison-current-run-title" tabIndex={-1}>Current run</h3>
            <span>{active && runtime.isRunning ? "Running" : "Paused"}</span>
          </div>
          <dl className="world-current-run-summary">
            <div><dt>World</dt><dd>{getTemplateDescriptor(selectedTemplateId).template.name}</dd></div>
            <div><dt>Tick</dt><dd>{formatTick(active ? runtime.tick : 0)}</dd></div>
            <div><dt>Seed</dt><dd>{seed}</dd></div>
            <div><dt>Metric records</dt><dd>{active ? runtime.metricRecordCount : 0}</dd></div>
          </dl>
        </section>
        <p className="run-comparison-note">
          Capture this run as a bounded local summary, then select saved summaries to inspect differences.
        </p>
        {runLibraryWarning ? (
          <div className="run-library-warning" role="alert">
            <strong>Saved-run recovery warning</strong>
            <p>{runLibraryWarning} No invalid records were loaded or treated as comparison evidence.</p>
            <button type="button" onClick={clearSavedRuns}>Discard stored run library</button>
          </div>
        ) : null}
        <h3 className="world-section-heading">Capture current run</h3>
        <div className="run-capture-grid">
          <label>
            <span>Run label</span>
            <input value={captureLabel} onChange={(event) => setCaptureLabel(event.target.value)} placeholder="Capture label" suppressHydrationWarning />
          </label>
          <label>
            <span>Tags</span>
            <input value={captureTags} onChange={(event) => setCaptureTags(event.target.value)} placeholder="stable, intervention" suppressHydrationWarning />
          </label>
          <label className="run-capture-grid__wide">
            <span>Notes</span>
            <textarea value={captureNotes} onChange={(event) => setCaptureNotes(event.target.value)} placeholder="Observation notes" suppressHydrationWarning />
          </label>
        </div>
        <div className="run-comparison-actions">
          <button type="button" onClick={captureRun} disabled={!runtime.isReady} suppressHydrationWarning>
            Capture Run
          </button>
          <button type="button" onClick={importLatestExperimentRuns} disabled={!latestExperimentResultSet} suppressHydrationWarning>
            Add Experiment Runs
          </button>
          <button type="button" onClick={exportJson} disabled={selectedRuns.length === 0} suppressHydrationWarning>
            Export Comparison JSON
          </button>
          <button type="button" onClick={exportCsv} disabled={selectedRuns.length === 0} suppressHydrationWarning>
            Export Comparison CSV
          </button>
        </div>
        <h3 className="world-section-heading">Saved comparison runs</h3>
        <RunLibrary
          runs={savedRuns}
          selectedRunIds={selectedRunIds}
          baselineRunId={comparison.baselineRunId}
          onToggleRun={toggleComparisonRun}
          onBaseline={setComparisonBaseline}
          onUpdate={updateSavedRun}
          onDelete={deleteSavedRun}
          onClear={clearSavedRuns}
        />
        <h3 className="world-section-heading">Differences</h3>
        <RunDeltaSummary comparison={comparison} selectedRuns={selectedRuns} />
        <RunMetricTraceCompare runs={selectedRuns} metricKey={traceMetricKey} metricKeys={metricKeys} onMetricChange={setTraceMetricKey} />
        <p className="run-comparison-note">
          Saved World comparisons are local run summaries. They are not Lab evidence records or Atlas discoveries, and differences do not prove causation.
        </p>
      </div>
  );
  return embedded ? content : (
    <CornerFramePanel title="Run Comparison" eyebrow="Workspace" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      {content}
    </CornerFramePanel>
  );
}

function RunLibrary({
  runs,
  selectedRunIds,
  baselineRunId,
  onToggleRun,
  onBaseline,
  onUpdate,
  onDelete,
  onClear
}: {
  runs: readonly SavedRunSummary[];
  selectedRunIds: readonly string[];
  baselineRunId: string | null;
  onToggleRun: (runId: string) => void;
  onBaseline: (runId: string | null) => void;
  onUpdate: (runId: string, patch: Partial<Pick<SavedRunSummary, "label" | "notes" | "tags">>) => void;
  onDelete: (runId: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="run-library">
      <div className="run-library__head">
        <span>Run Library</span>
        <strong>{runs.length}/{maxSavedRunSummaries} saved</strong>
        <button type="button" onClick={onClear} disabled={runs.length === 0} suppressHydrationWarning>
          Clear Run Library
        </button>
      </div>
      {runs.length === 0 ? (
        <p className="microcopy">No saved run summaries yet. Capture the current run or add completed experiment runs.</p>
      ) : (
        <ol>
          {runs.map((run) => {
            const selected = selectedRunIds.includes(run.runId);
            return (
              <li key={run.runId} className={selected ? "is-selected" : ""}>
                <div className="run-library__select">
                  <label>
                    <input type="checkbox" checked={selected} onChange={() => onToggleRun(run.runId)} suppressHydrationWarning />
                    Compare
                  </label>
                  <button type="button" onClick={() => onBaseline(run.runId)} disabled={!selected} suppressHydrationWarning>
                    {baselineRunId === run.runId ? "Baseline" : "Set baseline"}
                  </button>
                  <button type="button" onClick={() => onDelete(run.runId)} suppressHydrationWarning>
                    Delete
                  </button>
                </div>
                <label className="run-library__label">
                  <span>Label</span>
                  <input value={run.label} onChange={(event) => onUpdate(run.runId, { label: event.target.value })} suppressHydrationWarning />
                </label>
                <div className="run-library__meta">
                  <span>{run.templateName}</span>
                  <span>{run.source}</span>
                  <span>tick {formatTick(run.ticksRun)}</span>
                  <span>{run.seed}</span>
                </div>
                <label className="run-library__label">
                  <span>Notes</span>
                  <textarea value={run.notes} onChange={(event) => onUpdate(run.runId, { notes: event.target.value })} suppressHydrationWarning />
                </label>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function RunDeltaSummary({ comparison, selectedRuns }: { comparison: RunComparisonResult; selectedRuns: readonly SavedRunSummary[] }) {
  return (
    <div className="run-delta-summary">
      <div className="run-comparison-summary">
        <strong>{selectedRuns.length}</strong>
        <span>selected</span>
        <span>baseline {comparison.baselineRunId ? labelForRun(selectedRuns, comparison.baselineRunId) : "none"}</span>
      </div>
      {comparison.warnings.map((warning) => (
        <p key={warning} className="run-warning">
          {warning}
        </p>
      ))}
      <section>
        <span className="run-section-label">Parameter Differences</span>
        {comparison.parameterDifferences.length === 0 ? (
          <p className="microcopy">No differing parameters among selected runs.</p>
        ) : (
          <div className="run-table">
            <div>
              <strong>Parameter</strong>
              {selectedRuns.map((run) => (
                <strong key={run.runId}>{run.label}</strong>
              ))}
            </div>
            {comparison.parameterDifferences.slice(0, 10).map((difference) => (
              <div key={difference.key}>
                <span>{difference.key}</span>
                {selectedRuns.map((run) => (
                  <span key={run.runId}>{valueLabel(difference.values[run.runId])}</span>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <span className="run-section-label">Final Metrics</span>
        {comparison.metricDeltas.length === 0 ? (
          <p className="microcopy">No overlapping numeric metrics available for comparison.</p>
        ) : (
          <div className="run-table">
            <div>
              <strong>Metric</strong>
              {selectedRuns.map((run) => (
                <strong key={run.runId}>{run.label}</strong>
              ))}
            </div>
            {comparison.metricDeltas.slice(0, 12).map((metric) => (
              <div key={metric.key}>
                <span>{metricLabel(selectedRuns[0]?.templateId ?? "", metric.key)}</span>
                {selectedRuns.map((run) => {
                  const value = metric.values[run.runId];
                  const delta = metric.deltas[run.runId];
                  return (
                    <span key={run.runId}>
                      {typeof value === "number" ? formatNumber(value, 3) : "missing"}
                      {delta?.absolute && delta.absolute !== 0 ? <em> {delta.absolute > 0 ? "+" : ""}{formatNumber(delta.absolute, 3)}</em> : null}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <span className="run-section-label">Interventions</span>
        {selectedRuns.some((run) => run.interventions.length > 0) ? (
          <ul className="run-intervention-list">
            {selectedRuns.map((run) => (
              <li key={run.runId}>
                <strong>{run.label}</strong>
                <span>{run.interventions.length} interventions</span>
                {run.interventions.slice(0, 3).map((intervention) => (
                  <em key={`${run.runId}-${intervention.interventionId}-${intervention.tickApplied}`}>
                    tick {intervention.tickApplied}: {intervention.label}
                  </em>
                ))}
              </li>
            ))}
          </ul>
        ) : (
          <p className="microcopy">No selected run has applied interventions.</p>
        )}
      </section>
    </div>
  );
}

function RunMetricTraceCompare({
  runs,
  metricKey,
  metricKeys,
  onMetricChange
}: {
  runs: readonly SavedRunSummary[];
  metricKey: string;
  metricKeys: readonly string[];
  onMetricChange: (metricKey: string) => void;
}) {
  const traceRuns = runs.filter((run) => run.metricHistory.some((record) => Number.isFinite(record.values[metricKey])));
  const traceScale = traceChartScale(traceRuns, metricKey);
  if (metricKeys.length === 0) {
    return <p className="microcopy">Metric trace comparison appears when selected runs have bounded metric histories.</p>;
  }
  return (
    <div className="run-trace-compare">
      <label>
        <span>Metric Trace</span>
        <select value={metricKey} onChange={(event) => onMetricChange(event.target.value)} suppressHydrationWarning>
          {metricKeys.map((key) => (
            <option key={key} value={key}>
              {metricLabel(runs[0]?.templateId ?? "", key)}
            </option>
          ))}
        </select>
      </label>
      {traceRuns.length === 0 ? (
        <p className="microcopy">Selected experiment summaries have final metrics only. Capture a manual run for bounded traces.</p>
      ) : (
        <>
          <svg className="run-trace-chart" viewBox="0 0 320 128" role="img" aria-label="Saved run metric trace comparison">
            {[32, 64, 96].map((y) => (
              <line key={y} x1="0" x2="320" y1={y} y2={y} className="chart-gridline" />
            ))}
            {traceRuns.slice(0, 6).map((run, index) => (
              <polyline
                key={run.runId}
                points={pointsForRun(run, metricKey, traceScale)}
                fill="none"
                stroke={traceColors[index % traceColors.length]}
                strokeWidth="2"
              />
            ))}
          </svg>
          <div className="chart-legend">
            {traceRuns.slice(0, 6).map((run, index) => (
              <span key={run.runId}>
                <i style={{ background: traceColors[index % traceColors.length] }} />
                {run.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface TraceChartScale {
  minTick: number;
  maxTick: number;
  minValue: number;
  maxValue: number;
}

function traceChartScale(runs: readonly SavedRunSummary[], metricKey: string): TraceChartScale {
  const records = runs.flatMap((run) => run.metricHistory.filter((record) => Number.isFinite(record.values[metricKey])));
  const ticks = records.map((record) => record.tick);
  const values = records.map((record) => record.values[metricKey] ?? 0);
  return {
    minTick: Math.min(...ticks, 0),
    maxTick: Math.max(...ticks, 1),
    minValue: Math.min(...values, 0),
    maxValue: Math.max(...values, 1)
  };
}

function pointsForRun(run: SavedRunSummary, metricKey: string, scale: TraceChartScale): string {
  const records = run.metricHistory.filter((record) => Number.isFinite(record.values[metricKey]));
  const tickSpan = scale.maxTick - scale.minTick || 1;
  const valueSpan = scale.maxValue - scale.minValue || 1;
  return records
    .map((record) => {
      const value = record.values[metricKey] ?? 0;
      const x = ((record.tick - scale.minTick) / tickSpan) * 312 + 4;
      const y = 118 - ((value - scale.minValue) / valueSpan) * 104;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function labelForRun(runs: readonly SavedRunSummary[], runId: string): string {
  return runs.find((run) => run.runId === runId)?.label ?? "unknown";
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function valueLabel(value: unknown): string {
  if (value === undefined) {
    return "missing";
  }
  if (typeof value === "number") {
    return formatNumber(value, 3);
  }
  return String(value);
}

function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
