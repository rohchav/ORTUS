"use client";

import { useMemo } from "react";
import { formatNumber, formatTick } from "../lib/format";
import { getTemplateDescriptor, metricLabel } from "../lib/templateVisuals";
import { primaryMetricKeysForTemplate } from "../lib/worldPresentation";
import { metricDefinitionsForTemplate } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";
import type { SimulationWorkspaceModeId } from "../lib/workspaceModes";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

export function WorldObservationDock({
  activeMode,
  onOpenObserve
}: {
  activeMode: SimulationWorkspaceModeId;
  onOpenObserve: () => void;
}) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const runtime = useActiveWorldRuntime();
  const template = getTemplateDescriptor(selectedTemplateId).template;
  const metricKeys = useMemo(() => {
    const available = metricDefinitionsForTemplate(template).map((definition) => definition.key);
    return primaryMetricKeysForTemplate(selectedTemplateId, available).slice(0, 3);
  }, [selectedTemplateId, template]);
  const latest = runtime.metricsHistory.at(-1);

  return (
    <section className="world-observation-dock" aria-label="Persistent current model-output readout" data-world-observation-dock>
      <header>
        <span>Current model output</span>
        <strong>{latest ? `Tick ${formatTick(latest.tick)}` : "Run for first record"}</strong>
        {activeMode !== "observe" ? <button type="button" onClick={onOpenObserve}>Full readout</button> : null}
      </header>
      <div>
        {metricKeys.map((key) => (
          <span key={key}>
            <small>{metricLabel(selectedTemplateId, key)}</small>
            <strong>{typeof latest?.values[key] === "number" ? formatNumber(latest.values[key], 3) : "--"}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}
