"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getTemplateDescriptor, legendEntries } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

export function Legend() {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const panelState = useSimulationStore((state) => state.panelState);
  const togglePanel = useSimulationStore((state) => state.togglePanel);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const items = legendEntries(descriptor.id);

  return (
    <div className="legend-shell">
      <CornerFramePanel title="Legend" eyebrow="Visual key" variant="floating" collapsed={!panelState.legend} onToggle={() => togglePanel("legend")}>
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
