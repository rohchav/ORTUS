"use client";

import { useEffect, useState } from "react";
import { ParameterPanel } from "./ParameterPanel";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getSystemCatalogEntry } from "../lib/systemCatalog";
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
  const engine = useSimulationStore((state) => state.engine);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const system = getSystemCatalogEntry(selectedTemplateId);
  const interventionCount = getInterventionDefinitions(selectedTemplateId).length;
  const scenarioName = typeof engine?.metadata.scenarioName === "string" && engine.metadata.scenarioName.trim()
    ? engine.metadata.scenarioName
    : "Default run";
  const [seedDraft, setSeedDraft] = useState(seed);
  const [allParametersOpen, setAllParametersOpen] = useState(false);

  useEffect(() => {
    setSeedDraft(seed);
  }, [seed]);

  useEffect(() => {
    setAllParametersOpen(false);
  }, [selectedTemplateId]);

  useEffect(() => {
    function openAdvancedConfig() {
      setAllParametersOpen(true);
      window.requestAnimationFrame(() => document.getElementById("neural-advanced-config-toggle")?.focus());
    }
    window.addEventListener("ortus:open-neural-advanced-config", openAdvancedConfig);
    return () => window.removeEventListener("ortus:open-neural-advanced-config", openAdvancedConfig);
  }, []);

  return (
    <CornerFramePanel title="Setup" eyebrow="Fresh run" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="run-settings-panel">
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
          <span>Starting recipe: {scenarioName}</span>
          <span>{interventionCount} available changes</span>
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
            <button type="submit" aria-label="Apply typed seed and rebuild a fresh run" suppressHydrationWarning>
              Apply Seed
            </button>
            <button type="button" onClick={regenerateSeed} aria-label="Generate a new seed and rebuild a fresh run" suppressHydrationWarning>
              Regenerate Seed
            </button>
          </div>
        </form>
        <section className="run-settings-quick" aria-labelledby="quick-controls-title">
          <div className="run-settings-quick__head">
            <h3 id="quick-controls-title">Key controls</h3>
            <span>{system.suggestedChange}</span>
          </div>
          <ParameterPanel
            includeKeys={system.quickParameterKeys}
            highlightedKey={system.highlightedParameterKey}
            ariaLabel="Key model parameters"
          />
        </section>
        <div className="parameter-panel parameter-panel--advanced">
          <button
            id="neural-advanced-config-toggle"
            type="button"
            className="parameter-panel__advanced-toggle"
            aria-expanded={allParametersOpen}
            aria-controls="all-model-parameters"
            onClick={() => setAllParametersOpen((current) => !current)}
            suppressHydrationWarning
          >
            <span>All parameters</span>
            <strong>{allParametersOpen ? "Hide exact controls" : `${descriptor.template.parameterDefinitions.length} exact controls`}</strong>
          </button>
          <div id="all-model-parameters" className="parameter-panel__advanced-body" hidden={!allParametersOpen}>
            <ParameterPanel
              excludeKeys={system.quickParameterKeys}
              showNote
              ariaLabel="Additional model parameters"
            />
          </div>
        </div>
      </div>
    </CornerFramePanel>
  );
}
