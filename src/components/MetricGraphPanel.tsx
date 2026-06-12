"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { metricLabel } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface PanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const colors = ["#d8ff3e", "#ff4a2e", "#f3f1e8", "#6c72ff", "#c34dff"];

export function MetricGraphPanel({ collapsed = false, onToggle }: PanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const history = snapshot?.metricsHistory ?? EMPTY_HISTORY;
  const sample = history.slice(-120);
  const keys = Object.keys(sample.at(-1)?.values ?? {}).slice(0, 4);

  return (
    <CornerFramePanel title="Metric Trace" eyebrow="History" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      {sample.length > 1 && keys.length > 0 ? (
        <svg className="metric-chart" viewBox="0 0 320 128" role="img" aria-label="Metric history line chart">
          <defs>
            <linearGradient id="chartFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(216,255,62,.16)" />
              <stop offset="100%" stopColor="rgba(216,255,62,0)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="320" height="128" fill="url(#chartFade)" />
          {[32, 64, 96].map((y) => (
            <line key={y} x1="0" x2="320" y1={y} y2={y} className="chart-gridline" />
          ))}
          {keys.map((key, index) => (
            <polyline key={key} points={pointsFor(sample, key)} fill="none" stroke={colors[index % colors.length]} strokeWidth="2" />
          ))}
        </svg>
      ) : (
        <p className="microcopy">Run the model to build a bounded metric trace.</p>
      )}
      <div className="chart-legend">
        {keys.map((key, index) => (
          <span key={key}>
            <i style={{ background: colors[index % colors.length] }} />
            {metricLabel(selectedTemplateId, key)}
          </span>
        ))}
      </div>
    </CornerFramePanel>
  );
}

const EMPTY_HISTORY: NonNullable<ReturnType<typeof useSimulationStore.getState>["latestSnapshot"]>["metricsHistory"] = [];

function pointsFor(history: Array<{ values: Record<string, number> }>, key: string): string {
  const values = history.map((record) => record.values[key] ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = history.length === 1 ? 0 : (index / (history.length - 1)) * 312 + 4;
      const y = 118 - ((value - min) / span) * 104;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
