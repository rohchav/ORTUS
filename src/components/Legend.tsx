"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getTemplateDescriptor, legendEntries } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface LegendProps {
  collapsed?: boolean;
  floating?: boolean;
  onToggle?: () => void;
}

export function Legend({ collapsed, floating = true, onToggle }: LegendProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const panelState = useSimulationStore((state) => state.panelState);
  const togglePanel = useSimulationStore((state) => state.togglePanel);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const items = legendEntries(descriptor.id);
  const isControlled = collapsed !== undefined || onToggle !== undefined;
  const isCollapsed = collapsed ?? !panelState.legend;
  const toggle = onToggle ?? (isControlled ? undefined : () => togglePanel("legend"));

  return (
    <div className={floating ? "legend-shell" : "legend-panel-shell"}>
      <CornerFramePanel title="Legend" eyebrow="Visual key" variant={floating ? "floating" : "compact"} collapsed={isCollapsed} onToggle={toggle}>
        <div className="legend-list">
          {items.map((item) => (
            <div key={item.label} className="legend-item">
              <span className="legend-symbol" style={{ background: item.color }}>
                {item.glyph}
              </span>
              <span>
                <strong>{item.label}</strong>
                <em>{item.description}</em>
              </span>
            </div>
          ))}
        </div>
      </CornerFramePanel>
    </div>
  );
}
