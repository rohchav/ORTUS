"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getTemplateDescriptor, metricNotes } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface FieldNotesPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function FieldNotesPanel({ collapsed = false, onToggle }: FieldNotesPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const template = getTemplateDescriptor(selectedTemplateId).template;
  const documentation = template.documentation;
  const metrics = metricNotes(selectedTemplateId);

  return (
    <CornerFramePanel title="Field Notes" eyebrow="Model explanation" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="notes-block">
        <strong>Purpose</strong>
        <p>{documentation.purpose}</p>
      </div>
      <div className="notes-block">
        <strong>Scheduling</strong>
        <p>{documentation.scheduling}</p>
      </div>
      <div className="notes-block">
        <strong>Process</strong>
        <p>{documentation.processOverview}</p>
      </div>
      {metrics.length > 0 ? (
        <div className="notes-block">
          <strong>Observed Metrics</strong>
          <ul className="metric-notes">
            {metrics.map((metric) => (
              <li key={metric.label}>
                <b>{metric.label}</b>
                <span>{metric.description}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="notes-columns">
        <div>
          <strong>Assumptions</strong>
          <ul>
            {documentation.assumptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Limitations</strong>
          <ul>
            {documentation.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="calibration-note">These models are exploratory simulations, not calibrated predictive tools.</p>
    </CornerFramePanel>
  );
}
