"use client";

import { AvatarModeControl } from "./AvatarModeControl";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface PanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function MicroPanel({ collapsed = false, onToggle }: PanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const documentation = getTemplateDescriptor(selectedTemplateId).template.documentation;

  return (
    <CornerFramePanel title="Micro Field" eyebrow="Local Rules" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="rule-block">
        <span>Agents</span>
        <p>{documentation.entities.join(" ")}</p>
      </div>
      <div className="tag-field">
        {documentation.stateVariables.map((variable) => (
          <span key={variable}>{variable}</span>
        ))}
      </div>
      <div className="rule-block">
        <span>Process</span>
        <p>{documentation.processOverview}</p>
      </div>
      <AvatarModeControl />
    </CornerFramePanel>
  );
}
