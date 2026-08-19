"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AvatarModeControl } from "./AvatarModeControl";
import { Legend } from "./Legend";
import { MetricGraphPanel } from "./MetricGraphPanel";
import { formatNumber } from "../lib/format";
import { getSystemCatalogEntry } from "../lib/systemCatalog";
import { getTemplateDescriptor, metricLabel, metricNotes } from "../lib/templateVisuals";
import { metricPresentationForTemplate, primaryMetricKeysForTemplate } from "../lib/worldPresentation";
import { metricDefinitionsForTemplate } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

type ObserveView = "summary" | "all" | "visual";

export function WorldObservePanel({ active = true }: { active?: boolean } = {}) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const runtime = useActiveWorldRuntime();
  const history = active ? runtime.metricsHistory : [];
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const system = getSystemCatalogEntry(selectedTemplateId);
  const availableKeys = useMemo(
    () => metricDefinitionsForTemplate(descriptor.template).map((definition) => definition.key),
    [descriptor.template]
  );
  const presentation = metricPresentationForTemplate(selectedTemplateId, availableKeys);
  const primaryKeys = primaryMetricKeysForTemplate(selectedTemplateId, availableKeys);
  const latest = history.at(-1);
  const [view, setView] = useState<ObserveView>("summary");
  const viewHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setView("summary");
  }, [selectedTemplateId]);

  function openView(next: ObserveView) {
    setView(next);
    window.requestAnimationFrame(() => viewHeadingRef.current?.focus());
  }

  if (view === "all") {
    return (
      <div className="world-task-view world-observe" data-observe-view="all">
        <TaskViewBack label="Back to Observe" onClick={() => openView("summary")} />
        <h3 ref={viewHeadingRef} tabIndex={-1}>All model metrics</h3>
        <p className="world-task-view__intro">Exact current values from this simulated run, ordered by display priority.</p>
        <MetricRows keys={presentation.map((metric) => metric.key)} values={latest?.values} templateId={selectedTemplateId} />
        <MetricGraphPanel embedded active={active} />
        <p className="world-interpretation-note">These values and traces describe this model run; they are not empirical measurements or validation evidence.</p>
      </div>
    );
  }

  if (view === "visual") {
    return (
      <div className="world-task-view world-observe" data-observe-view="visual">
        <TaskViewBack label="Back to Observe" onClick={() => openView("summary")} />
        <h3 ref={viewHeadingRef} tabIndex={-1}>Visual key and display</h3>
        <Legend floating={false} collapsed={false} />
        <section className="world-tool-section" aria-label="Agent display preference">
          <h4>Agent display</h4>
          <AvatarModeControl />
        </section>
      </div>
    );
  }

  return (
    <div className="world-task-view world-observe" data-observe-view="summary">
      <section className="world-tool-section" aria-labelledby="primary-metrics-title">
        <div className="world-tool-section__head">
          <h3 id="primary-metrics-title">Key metrics</h3>
          <span>{latest ? `Tick ${latest.tick}` : "Waiting for a tick"}</span>
        </div>
        {latest ? (
          <MetricRows keys={primaryKeys} values={latest.values} templateId={selectedTemplateId} descriptions />
        ) : (
          <div className="world-empty-state">
            <p>Run the world to create the first bounded metric record.</p>
            <button type="button" onClick={runtime.toggleRunning} disabled={!runtime.isReady}>{runtime.isRunning ? "Pause" : "Run"}</button>
          </div>
        )}
      </section>
      <section className="world-tool-section world-tool-section--trace" aria-labelledby="primary-trace-title">
        <h3 id="primary-trace-title">Recent trace</h3>
        <MetricGraphPanel embedded metricKeys={primaryKeys} active={active} />
      </section>
      <section className="world-watch-note" aria-labelledby="what-to-watch-title">
        <h3 id="what-to-watch-title">What to watch</h3>
        <p>{system.watchFor}</p>
      </section>
      <p className="world-interpretation-note">Bounded traces are model output over simulated ticks, not empirical measurements or validation evidence.</p>
      <div className="world-task-actions">
        <button type="button" onClick={() => openView("all")}>All metrics</button>
        <button type="button" onClick={() => openView("visual")}>Visual key and display</button>
      </div>
    </div>
  );
}

function MetricRows({
  keys,
  values,
  templateId,
  descriptions = false
}: {
  keys: readonly string[];
  values: Record<string, number> | undefined;
  templateId: ReturnType<typeof useSimulationStore.getState>["selectedTemplateId"];
  descriptions?: boolean;
}) {
  return (
    <div className="world-metric-list">
      {keys.map((key) => (
        <div key={key} className="world-metric-row">
          <span>
            <strong>{metricLabel(templateId, key)}</strong>
            {descriptions ? <em>{descriptionForMetric(templateId, key)}</em> : null}
          </span>
          <b>{typeof values?.[key] === "number" ? formatNumber(values[key], 3) : "Not recorded"}</b>
        </div>
      ))}
    </div>
  );
}

function descriptionForMetric(templateId: ReturnType<typeof useSimulationStore.getState>["selectedTemplateId"], key: string): string {
  const label = metricLabel(templateId, key);
  return metricNotes(templateId).find((note) => note.label.toLowerCase() === label.toLowerCase())?.description ?? "Current model-output value.";
}

function TaskViewBack({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="world-task-back" onClick={onClick}>{label}</button>;
}
