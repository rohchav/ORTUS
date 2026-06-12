"use client";

import { useEffect, useState } from "react";
import { ParameterPanel } from "./ParameterPanel";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getTemplateDescriptor, templateDescriptors, type TemplateId } from "../lib/templateVisuals";
import { getInterventionDefinitions } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";

interface RunSettingsPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function RunSettingsPanel({ collapsed = false, onToggle }: RunSettingsPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const selectTemplate = useSimulationStore((state) => state.selectTemplate);
  const seed = useSimulationStore((state) => state.seed);
  const setSeed = useSimulationStore((state) => state.setSeed);
  const regenerateSeed = useSimulationStore((state) => state.regenerateSeed);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const interventionCount = getInterventionDefinitions(selectedTemplateId).length;
  const [seedDraft, setSeedDraft] = useState(seed);

  useEffect(() => {
    setSeedDraft(seed);
  }, [seed]);

  return (
    <CornerFramePanel title="Run Settings" eyebrow="Fresh run setup" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="run-settings-panel">
        <p className="run-settings-note">
          Model, seed, and parameter changes rebuild the current run through template validation. Scenarios remain initial-condition recipes, not snapshots.
        </p>
        <label className="run-settings-field">
          <span>Model template</span>
          <select value={selectedTemplateId} onChange={(event) => selectTemplate(event.target.value as TemplateId)} suppressHydrationWarning>
            {templateDescriptors.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.template.name}
              </option>
            ))}
          </select>
        </label>
        <div className="run-settings-summary">
          <span>Template version {descriptor.template.version}</span>
          <span>{descriptor.template.parameterDefinitions.length} parameters</span>
          <span>{interventionCount} interventions</span>
        </div>
        <form
          className="run-settings-seed"
          onSubmit={(event) => {
            event.preventDefault();
            setSeed(seedDraft);
          }}
        >
          <label htmlFor="ortus-setup-seed">
            <span>Seed</span>
            <input
              id="ortus-setup-seed"
              value={seedDraft}
              onChange={(event) => setSeedDraft(event.target.value)}
              onBlur={() => setSeed(seedDraft)}
              suppressHydrationWarning
            />
          </label>
          <div className="run-settings-actions">
            <button type="submit" suppressHydrationWarning>
              Apply Seed
            </button>
            <button type="button" onClick={regenerateSeed} suppressHydrationWarning>
              Regenerate Seed
            </button>
          </div>
        </form>
        <ParameterPanel />
      </div>
    </CornerFramePanel>
  );
}
