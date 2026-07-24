"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ExperimentCancellationToken,
  ExperimentConfig,
  ExperimentProgress,
  ExperimentResultSet,
  JsonValue,
  MetricDefinition,
  ParameterDefinition,
  SweepValue
} from "../simulation";
import { defaultExperimentMaxRuns, metricDefinitionsForTemplate, runExperiment, validateExperimentConfig } from "../simulation";
import { exportExperimentCsv, exportExperimentJson } from "../lib/experimentExport";
import { formatNumber } from "../lib/format";
import { defaultParameters, getTemplateDescriptor, metricLabel } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import { CornerFramePanel } from "./ui/CornerFramePanel";

interface ExperimentPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
  embedded?: boolean;
}

type SweepInputMode = "range" | "list";

const presets: Record<string, { parameterKey: string; metricKey: string; min: number; max: number; steps: number }> = {
  "epidemic-spread": { parameterKey: "infectionProbability", metricKey: "recoveredCount", min: 0.05, max: 0.75, steps: 5 },
  "opinion-dynamics": { parameterKey: "influenceStrength", metricKey: "polarizationScore", min: 0.05, max: 0.8, steps: 5 },
  "predator-prey": { parameterKey: "predatorEnergyLoss", metricKey: "predatorCount", min: 0.1, max: 1.1, steps: 5 },
  "schelling-segregation": { parameterKey: "similarityThreshold", metricKey: "satisfactionRate", min: 0.1, max: 0.7, steps: 5 },
  "flocking-boids": { parameterKey: "alignmentWeight", metricKey: "alignmentScore", min: 0.1, max: 1.3, steps: 5 }
};

export function ExperimentPanel({ collapsed = false, onToggle, embedded = false }: ExperimentPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const parameterValues = useSimulationStore((state) => state.parameterValues);
  const seed = useSimulationStore((state) => state.seed);
  const setLatestExperimentResultSet = useSimulationStore((state) => state.setLatestExperimentResultSet);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const definitions = descriptor.template.parameterDefinitions;
  const metricDefinitions = useMemo(() => metricDefinitionsForTemplate(descriptor.template), [descriptor.template]);
  const preset = presets[selectedTemplateId];
  const firstDefinition = definitions[0];
  const firstMetric = metricDefinitions[0];
  const initialParameterKey = resolvePresetParameterKey(preset, definitions) ?? firstDefinition?.key ?? "";
  const initialMetricKey = resolvePresetMetricKey(preset, metricDefinitions) ?? firstMetric?.key ?? "";

  const [parameterKey, setParameterKey] = useState(initialParameterKey);
  const [metricKey, setMetricKey] = useState(initialMetricKey);
  const [inputMode, setInputMode] = useState<SweepInputMode>("range");
  const [rangeMin, setRangeMin] = useState(String(preset?.min ?? numericDefinition(parameterKey, definitions)?.min ?? 0));
  const [rangeMax, setRangeMax] = useState(String(preset?.max ?? numericDefinition(parameterKey, definitions)?.max ?? 1));
  const [rangeSteps, setRangeSteps] = useState(String(preset?.steps ?? 5));
  const [manualValues, setManualValues] = useState("");
  const [trialsPerCondition, setTrialsPerCondition] = useState("3");
  const [ticksPerRun, setTicksPerRun] = useState("200");
  const [seedMode, setSeedMode] = useState<"sequential" | "fixed">("sequential");
  const [baseSeed, setBaseSeed] = useState(seed);
  const [seedList, setSeedList] = useState(seed);
  const [progress, setProgress] = useState<ExperimentProgress>({ completedRuns: 0, totalRuns: 0, status: "idle" });
  const [resultSet, setResultSet] = useState<ExperimentResultSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const cancellationRef = useRef<ExperimentCancellationToken | null>(null);

  useEffect(() => {
    const nextPreset = presets[selectedTemplateId];
    const nextParameterKey = resolvePresetParameterKey(nextPreset, definitions) ?? definitions[0]?.key ?? "";
    const nextMetricKey = resolvePresetMetricKey(nextPreset, metricDefinitions) ?? metricDefinitions[0]?.key ?? "";
    setParameterKey(nextParameterKey);
    setMetricKey(nextMetricKey);
    setRangeMin(String(nextPreset?.min ?? numericDefinition(nextParameterKey, definitions)?.min ?? 0));
    setRangeMax(String(nextPreset?.max ?? numericDefinition(nextParameterKey, definitions)?.max ?? 1));
    setRangeSteps(String(nextPreset?.steps ?? 5));
    setManualValues("");
    setSeedMode("sequential");
    setBaseSeed(seed);
    setSeedList(seed);
    setResultSet(null);
    setError(null);
    setNotice(null);
  }, [definitions, metricDefinitions, seed, selectedTemplateId]);

  const selectedDefinition = definitions.find((definition) => definition.key === parameterKey);
  const configPreview = useMemo(() => {
    try {
      if (!selectedDefinition || !metricKey) {
        throw new Error("Choose a sweep parameter and a metric.");
      }
      const config = buildConfig({
        templateId: selectedTemplateId,
        parameterValues,
        selectedDefinition,
        parameterKey,
        metricKey,
        inputMode,
        rangeMin,
        rangeMax,
        rangeSteps,
        manualValues,
        trialsPerCondition,
        ticksPerRun,
        baseSeed,
        seedList,
        seedMode
      });
      return { config, validation: validateExperimentConfig(config), error: null };
    } catch (previewError) {
      return { config: null, validation: null, error: messageFor(previewError) };
    }
  }, [
    baseSeed,
    inputMode,
    manualValues,
    metricKey,
    parameterKey,
    parameterValues,
    rangeMax,
    rangeMin,
    rangeSteps,
    selectedDefinition,
    selectedTemplateId,
    seedList,
    seedMode,
    ticksPerRun,
    trialsPerCondition
  ]);

  const aggregates = resultSet?.aggregates ?? [];
  const selectedAggregateMetric = metricKey || Object.keys(aggregates[0]?.metrics ?? {})[0] || "";
  const selectedDefinitionSupportsRange = selectedDefinition?.type === "number" || selectedDefinition?.type === "integer";

  async function startExperiment() {
    if (!configPreview.config || configPreview.error) {
      setError(configPreview.error ?? "Experiment configuration is invalid.");
      return;
    }
    const token: ExperimentCancellationToken = { cancelled: false };
    cancellationRef.current = token;
    setIsRunning(true);
    setError(null);
    setNotice(null);
    setResultSet(null);
    try {
      const result = await runExperiment(configPreview.config, {
        signal: token,
        yieldEvery: 1,
        onProgress: setProgress
      });
      setResultSet(result);
      setLatestExperimentResultSet(result);
      setNotice(result.status === "cancelled" ? "Experiment cancelled. Completed runs are preserved for export." : "Experiment complete.");
    } catch (runError) {
      setError(messageFor(runError));
    } finally {
      setIsRunning(false);
      cancellationRef.current = null;
    }
  }

  function cancelExperiment() {
    if (cancellationRef.current) {
      cancellationRef.current.cancelled = true;
      setNotice("Cancellation requested. The current run will finish, then remaining runs will stop.");
    }
  }

  function exportJson() {
    if (!resultSet) {
      return;
    }
    downloadText(`ortus-experiment-${selectedTemplateId}.json`, exportExperimentJson(resultSet), "application/json");
  }

  function exportCsv() {
    if (!resultSet) {
      return;
    }
    downloadText(`ortus-experiment-${selectedTemplateId}.csv`, exportExperimentCsv(resultSet), "text/csv");
  }

  const content = (
      <div className="experiment-panel world-task-view">
        <p className="experiment-panel__note">
          Run fresh engine instances across parameter values and seeds. Results record final metrics only, not per-run snapshots.
        </p>
        <div className="experiment-grid">
          <label>
            <span>Parameter</span>
            <select value={parameterKey} onChange={(event) => setParameterKey(event.target.value)} suppressHydrationWarning>
              {definitions.map((definition) => (
                <option key={definition.key} value={definition.key}>
                  {definition.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Values</span>
            <select value={inputMode} onChange={(event) => setInputMode(event.target.value as SweepInputMode)} suppressHydrationWarning>
              <option value="range">Generated range</option>
              <option value="list">Manual list</option>
            </select>
          </label>
          {inputMode === "range" && selectedDefinitionSupportsRange ? (
            <>
              <label>
                <span>Min</span>
                <input value={rangeMin} onChange={(event) => setRangeMin(event.target.value)} inputMode="decimal" suppressHydrationWarning />
              </label>
              <label>
                <span>Max</span>
                <input value={rangeMax} onChange={(event) => setRangeMax(event.target.value)} inputMode="decimal" suppressHydrationWarning />
              </label>
              <label>
                <span>Steps</span>
                <input value={rangeSteps} onChange={(event) => setRangeSteps(event.target.value)} inputMode="numeric" suppressHydrationWarning />
              </label>
            </>
          ) : inputMode === "range" ? (
            <p className="experiment-grid__wide microcopy">This parameter will sweep its configured values.</p>
          ) : (
            <label className="experiment-grid__wide">
              <span>Manual values</span>
              <input
                value={manualValues}
                onChange={(event) => setManualValues(event.target.value)}
                placeholder={selectedDefinition?.type === "boolean" ? "true,false" : "0.1,0.2,0.3"}
                suppressHydrationWarning
              />
            </label>
          )}
          {seedMode === "sequential" ? (
            <label>
              <span>Trials</span>
              <input value={trialsPerCondition} onChange={(event) => setTrialsPerCondition(event.target.value)} inputMode="numeric" suppressHydrationWarning />
            </label>
          ) : null}
          <label>
            <span>Ticks/run</span>
            <input value={ticksPerRun} onChange={(event) => setTicksPerRun(event.target.value)} inputMode="numeric" suppressHydrationWarning />
          </label>
          <label>
            <span>Seed mode</span>
            <select value={seedMode} onChange={(event) => setSeedMode(event.target.value as "sequential" | "fixed")} suppressHydrationWarning>
              <option value="sequential">Sequential</option>
              <option value="fixed">Fixed list</option>
            </select>
          </label>
          {seedMode === "fixed" ? (
            <label className="experiment-grid__wide">
              <span>Seeds</span>
              <input value={seedList} onChange={(event) => setSeedList(event.target.value)} placeholder="seed-a,seed-b,seed-c" suppressHydrationWarning />
            </label>
          ) : (
            <label>
              <span>Base seed</span>
              <input value={baseSeed} onChange={(event) => setBaseSeed(event.target.value)} suppressHydrationWarning />
            </label>
          )}
          <label className="experiment-grid__wide">
            <span>Metric</span>
            <select value={metricKey} onChange={(event) => setMetricKey(event.target.value)} suppressHydrationWarning>
              {metricDefinitions.map((definition) => (
                <option key={definition.key} value={definition.key}>
                  {definition.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="experiment-summary">
          <strong>{configPreview.validation?.totalRuns ?? 0}</strong>
          <span>runs</span>
          <span>{configPreview.validation?.conditions.length ?? 0} conditions</span>
          <span>max {defaultExperimentMaxRuns}</span>
        </div>
        {configPreview.error || error ? <p className="experiment-error">{error ?? configPreview.error}</p> : null}
        {notice ? <p className="exchange-notice">{notice}</p> : null}
        <div className="experiment-actions">
          <button type="button" onClick={startExperiment} disabled={isRunning || Boolean(configPreview.error)} suppressHydrationWarning>
            Start Sweep
          </button>
          <button type="button" onClick={cancelExperiment} disabled={!isRunning} suppressHydrationWarning>
            Cancel
          </button>
          <button type="button" onClick={exportJson} disabled={!resultSet} suppressHydrationWarning>
            Export JSON
          </button>
          <button type="button" onClick={exportCsv} disabled={!resultSet} suppressHydrationWarning>
            Export CSV
          </button>
        </div>
        <ExperimentProgressView progress={progress} />
        <ExperimentChart aggregates={aggregates} metricKey={selectedAggregateMetric} templateId={selectedTemplateId} />
        <ExperimentResultsTable aggregates={aggregates} metricKey={selectedAggregateMetric} templateId={selectedTemplateId} />
      </div>
  );
  return embedded ? content : (
    <CornerFramePanel title="Experiment Runner" eyebrow="Sweeps" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      {content}
    </CornerFramePanel>
  );
}

function ExperimentProgressView({ progress }: { progress: ExperimentProgress }) {
  const ratio = progress.totalRuns > 0 ? progress.completedRuns / progress.totalRuns : 0;
  return (
    <div className="experiment-progress" aria-label="Experiment progress">
      <span>
        {progress.completedRuns}/{progress.totalRuns} runs
      </span>
      <i>
        <b style={{ width: `${Math.round(ratio * 100)}%` }} />
      </i>
      <em>{progress.status}</em>
    </div>
  );
}

function ExperimentChart({
  aggregates,
  metricKey,
  templateId
}: {
  aggregates: readonly ExperimentResultSet["aggregates"][number][];
  metricKey: string;
  templateId: string;
}) {
  if (aggregates.length === 0 || !metricKey) {
    return <p className="microcopy">Results will appear after a sweep completes.</p>;
  }
  const points = aggregates
    .map((aggregate) => ({
      xLabel: Object.values(aggregate.sweptValues).join(", "),
      y: aggregate.metrics[metricKey]?.mean
    }))
    .filter((point): point is { xLabel: string; y: number } => typeof point.y === "number" && Number.isFinite(point.y));
  if (points.length === 0) {
    return <p className="microcopy">No finite values were recorded for {metricLabel(templateId, metricKey)}.</p>;
  }
  const min = Math.min(...points.map((point) => point.y));
  const max = Math.max(...points.map((point) => point.y));
  const span = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? 160 : 18 + (index / (points.length - 1)) * 284;
      const y = 112 - ((point.y - min) / span) * 88;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg className="experiment-chart" viewBox="0 0 320 128" role="img" aria-label={`${metricLabel(templateId, metricKey)} experiment chart`}>
      <line x1="18" x2="302" y1="112" y2="112" className="chart-gridline" />
      <line x1="18" x2="18" y1="20" y2="112" className="chart-gridline" />
      <path d={path} fill="none" stroke="#d8ff3e" strokeWidth="2.4" />
      {points.map((point, index) => {
        const x = points.length === 1 ? 160 : 18 + (index / (points.length - 1)) * 284;
        const y = 112 - ((point.y - min) / span) * 88;
        return <circle key={`${point.xLabel}-${index}`} cx={x} cy={y} r="3" fill="#f3f1e8" />;
      })}
    </svg>
  );
}

function ExperimentResultsTable({
  aggregates,
  metricKey,
  templateId
}: {
  aggregates: readonly ExperimentResultSet["aggregates"][number][];
  metricKey: string;
  templateId: string;
}) {
  if (aggregates.length === 0) {
    return null;
  }
  return (
    <div className="experiment-table" role="table" aria-label="Experiment aggregate results">
      <div role="row">
        <span role="columnheader">Condition</span>
        <span role="columnheader">Runs</span>
        <span role="columnheader">{metricLabel(templateId, metricKey)}</span>
      </div>
      {aggregates.slice(0, 8).map((aggregate) => {
        const metric = aggregate.metrics[metricKey];
        return (
          <div key={aggregate.conditionKey} role="row">
            <span role="cell">{formatSweptValues(aggregate.sweptValues)}</span>
            <span role="cell">
              {aggregate.successCount}/{aggregate.runCount}
            </span>
            <span role="cell">{metric ? `${formatNumber(metric.mean, 4)} mean` : "No value"}</span>
          </div>
        );
      })}
    </div>
  );
}

function buildConfig(options: {
  templateId: string;
  parameterValues: Record<string, JsonValue>;
  selectedDefinition: ParameterDefinition;
  parameterKey: string;
  metricKey: string;
  inputMode: SweepInputMode;
  rangeMin: string;
  rangeMax: string;
  rangeSteps: string;
  manualValues: string;
  trialsPerCondition: string;
  ticksPerRun: string;
  baseSeed: string;
  seedList: string;
  seedMode: "sequential" | "fixed";
}): ExperimentConfig {
  const rangeSupported = options.selectedDefinition.type === "number" || options.selectedDefinition.type === "integer";
  const values = options.inputMode === "list" ? parseManualValues(options.manualValues, options.selectedDefinition) : undefined;
  const range =
    options.inputMode === "range" && rangeSupported
      ? {
          min: Number(options.rangeMin),
          max: Number(options.rangeMax),
          steps: Number(options.rangeSteps)
        }
      : undefined;
  return {
    templateId: options.templateId,
    baseParameters: { ...defaultParameters(getTemplateDescriptor(options.templateId).template), ...options.parameterValues },
    parameterSweep: {
      dimensions: [
        {
          parameterKey: options.parameterKey,
          values,
          range
        }
      ]
    },
    seedMode: options.seedMode,
    seeds: options.seedMode === "fixed" ? parseSeedList(options.seedList) : [],
    baseSeed: options.baseSeed.trim() || "experiment-seed",
    trialsPerCondition: Number(options.trialsPerCondition),
    ticksPerRun: Number(options.ticksPerRun),
    metricsToRecord: [options.metricKey],
    aggregationMode: "final",
    maxRuns: defaultExperimentMaxRuns,
    metadata: { source: "ortus-ui" }
  };
}

function parseSeedList(value: string): string[] {
  const seeds = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (seeds.length === 0) {
    throw new Error("Fixed seed mode requires at least one seed.");
  }
  return seeds;
}

function parseManualValues(value: string, definition: ParameterDefinition): SweepValue[] {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    throw new Error("Manual value list cannot be empty.");
  }
  if (definition.type === "boolean") {
    return parts.map((part) => {
      if (part === "true") {
        return true;
      }
      if (part === "false") {
        return false;
      }
      throw new Error("Boolean sweep values must be true or false.");
    });
  }
  if (definition.type === "select") {
    return parts;
  }
  return parts.map((part) => {
    const number = Number(part);
    if (!Number.isFinite(number)) {
      throw new Error(`Sweep value "${part}" is not numeric.`);
    }
    return definition.type === "integer" ? Math.round(number) : number;
  });
}

function numericDefinition(parameterKey: string, definitions: readonly ParameterDefinition[]): ParameterDefinition | undefined {
  const definition = definitions.find((candidate) => candidate.key === parameterKey);
  return definition?.type === "number" || definition?.type === "integer" ? definition : undefined;
}

function resolvePresetParameterKey(
  preset: { parameterKey: string } | undefined,
  definitions: readonly ParameterDefinition[]
): string | undefined {
  if (!preset) {
    return undefined;
  }
  return definitions.some((definition) => definition.key === preset.parameterKey) ? preset.parameterKey : undefined;
}

function resolvePresetMetricKey(
  preset: { metricKey: string } | undefined,
  definitions: readonly MetricDefinition[]
): string | undefined {
  if (!preset) {
    return undefined;
  }
  return definitions.some((definition) => definition.key === preset.metricKey) ? preset.metricKey : undefined;
}

function formatSweptValues(values: Record<string, SweepValue>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function downloadText(filename: string, text: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function messageFor(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 320 ? `${message.slice(0, 317)}...` : message;
}
