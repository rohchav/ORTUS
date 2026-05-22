"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { formatNumber } from "../lib/format";
import { getTemplateDescriptor, metricLabel } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface PanelProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function MacroPanel({ collapsed, onToggle }: PanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const controlCount = getTemplateDescriptor(selectedTemplateId).template.parameterDefinitions.length;
  const latest = snapshot?.metricsHistory.at(-1);
  const alive = snapshot?.entities.filter((entity) => entity.alive).length ?? 0;

  return (
    <CornerFramePanel title="Macro Field" eyebrow="Emergence" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="macro-grid">
        <div>
          <span>Living entities</span>
          <strong>{formatNumber(alive, 0)}</strong>
        </div>
        <div>
          <span>Metric records</span>
          <strong>{formatNumber(snapshot?.metricsHistory.length ?? 0, 0)}</strong>
        </div>
      </div>
      <div className="metric-list">
        {latest && Object.keys(latest.values).length > 0 ? (
          Object.entries(latest.values).map(([key, value]) => (
            <div key={key} className="metric-row">
              <span>{metricLabel(selectedTemplateId, key)}</span>
              <strong>{formatNumber(value, 3)}</strong>
            </div>
          ))
        ) : (
          <p className="microcopy">Metrics will appear after the first tick.</p>
        )}
      </div>
      <p className="microcopy">
        Aggregate readings are descriptive summaries from the current run, not calibrated predictions. {controlCount} controls define this model.
      </p>
    </CornerFramePanel>
  );
}
