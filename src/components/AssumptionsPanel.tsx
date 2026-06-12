"use client";

import { templateAssumptionProfile, type AssumptionItem, type ValidationStatus } from "../simulation";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import { CornerFramePanel } from "./ui/CornerFramePanel";

interface AssumptionsPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const validationStatusLabels: Record<ValidationStatus, string> = {
  illustrative: "Illustrative",
  internallyTested: "Internally Tested",
  patternValidated: "Pattern Validated",
  calibrated: "Calibrated",
  externallyValidated: "Externally Validated",
  unknown: "Unknown"
};

export function AssumptionsPanel({ collapsed = false, onToggle }: AssumptionsPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const profile = templateAssumptionProfile(descriptor.template);

  return (
    <CornerFramePanel title="Assumptions + Limits" eyebrow="Model boundary" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="assumptions-panel">
        <div className="assumptions-panel__header">
          <span>{descriptor.template.name}</span>
          <strong>{validationStatusLabels[profile.validationStatus]}</strong>
        </div>
        <p className="assumptions-panel__validation">{profile.validationNotes}</p>
        <AssumptionSection title="Assumptions" items={profile.assumptions} />
        <AssumptionSection title="Limitations" items={profile.limitations} />
        <AssumptionSection title="Not Represented" items={profile.notRepresented} />
        <AssumptionSection title="Appropriate Use" items={profile.appropriateUse} />
        <AssumptionSection title="Inappropriate Use" items={profile.inappropriateUse} />
        {profile.ethicsNotes.length > 0 ? <AssumptionSection title="Ethics Notes" items={profile.ethicsNotes} /> : null}
        <p className="assumptions-panel__note">
          Validation status describes evidence about the model, not truth about the real world.
        </p>
      </div>
    </CornerFramePanel>
  );
}

function AssumptionSection({ title, items }: { title: string; items: readonly AssumptionItem[] }) {
  return (
    <section className="assumption-section">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-severity={item.severity ?? "info"}>
            <span>{item.label}</span>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
