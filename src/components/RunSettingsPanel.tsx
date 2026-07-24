"use client";

import { useEffect, useState } from "react";
import { NeuralRuntimeLabPanel } from "./NeuralRuntimeLabPanel";
import { ParameterPanel } from "./ParameterPanel";
import { ScenarioBuilderPanel } from "./ScenarioBuilderPanel";
import { getSystemCatalogEntry } from "../lib/systemCatalog";
import { getTemplateDescriptor, templateDescriptors, type TemplateId } from "../lib/templateVisuals";
import { parameterPresentationForTemplate } from "../lib/worldPresentation";
import { getInterventionDefinitions } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";

type SetupView = "quick" | "parameters" | "recipes" | "neural";

export function RunSettingsPanel({ active = true }: { active?: boolean } = {}) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const selectTemplate = useSimulationStore((state) => state.selectTemplate);
  const seed = useSimulationStore((state) => state.seed);
  const setSeed = useSimulationStore((state) => state.setSeed);
  const regenerateSeed = useSimulationStore((state) => state.regenerateSeed);
  const engine = useSimulationStore((state) => state.engine);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const system = getSystemCatalogEntry(selectedTemplateId);
  const parameterPresentation = parameterPresentationForTemplate(selectedTemplateId);
  const quickParameterKeys = parameterPresentation.filter((item) => item.priority === "primary").map((item) => item.key);
  const interventionCount = getInterventionDefinitions(selectedTemplateId).length;
  const scenarioName = typeof engine?.metadata.scenarioName === "string" && engine.metadata.scenarioName.trim()
    ? engine.metadata.scenarioName
    : "Default run";
  const [seedDraft, setSeedDraft] = useState(seed);
  const [view, setView] = useState<SetupView>("quick");
  const [parameterSearch, setParameterSearch] = useState("");

  useEffect(() => {
    setSeedDraft(seed);
  }, [seed]);

  useEffect(() => {
    setView("quick");
    setParameterSearch("");
  }, [selectedTemplateId]);

  useEffect(() => {
    function openAdvancedConfig() {
      setView("parameters");
      focusSetupView("parameters");
    }
    window.addEventListener("ortus:open-neural-advanced-config", openAdvancedConfig);
    return () => window.removeEventListener("ortus:open-neural-advanced-config", openAdvancedConfig);
  }, []);

  function openView(next: SetupView) {
    setView(next);
    focusSetupView(next);
  }

  return (
    <div className="run-settings-panel world-task-view" data-setup-view={view}>
      <div hidden={view !== "quick"}>
        <section className="world-tool-section world-current-system" aria-labelledby="current-world-title">
          <div className="world-tool-section__head">
            <div>
              <span>Current world</span>
              <h3 id="current-world-title" tabIndex={-1}>{descriptor.template.name}</h3>
            </div>
            <span>{interventionCount} live changes</span>
          </div>
          <p>{system.question}</p>
          <label className="run-settings-field">
            <span>World template</span>
            <select value={selectedTemplateId} onChange={(event) => selectTemplate(event.target.value as TemplateId)} suppressHydrationWarning>
              {templateDescriptors.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.template.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="run-settings-quick world-tool-section" aria-labelledby="quick-controls-title">
          <div className="run-settings-quick__head">
            <div className="world-tool-section__head">
              <h3 id="quick-controls-title">Quick setup</h3>
              <span>{quickParameterKeys.length} key controls</span>
            </div>
            <span>{system.suggestedChange}</span>
            <p>Changing a key control rebuilds a paused tick-0 run immediately. Choose Run to start the new configuration.</p>
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
              <button type="submit" aria-label="Apply Seed and rebuild a fresh run" suppressHydrationWarning>
                Apply Seed
              </button>
              <button type="button" onClick={regenerateSeed} aria-label="New Seed: generate and rebuild a fresh run" suppressHydrationWarning>
                New Seed
              </button>
            </div>
          </form>
          <ParameterPanel
            includeKeys={quickParameterKeys}
            highlightedKey={system.highlightedParameterKey}
            ariaLabel="Key model parameters"
          />
        </section>

        <section className="world-tool-entry" aria-labelledby="starting-recipe-title">
          <div>
            <span>Starting recipe</span>
            <h3 id="starting-recipe-title">{scenarioName}</h3>
            <p>Initial conditions and supported model variants for a fresh run.</p>
          </div>
          <button type="button" onClick={() => openView("recipes")}>Choose recipe</button>
        </section>

        <section className="world-tool-section" aria-labelledby="deeper-setup-title">
          <h3 id="deeper-setup-title">Deeper setup</h3>
          <div className="world-task-link-list">
            <button id="neural-advanced-config-toggle" type="button" onClick={() => openView("parameters")}>
              <span>All parameters</span>
              <strong>{descriptor.template.parameterDefinitions.length} exact values</strong>
            </button>
            {selectedTemplateId === "neural-excitation-network" ? (
              <button type="button" onClick={() => openView("neural")}>
                <span>Neural Runtime Lab</span>
                <strong>Scenario-guided template tools</strong>
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <div className="world-task-subview" hidden={view !== "parameters"}>
        <TaskViewBack onClick={() => openView("quick")} />
        <h3 id="setup-parameters-title" tabIndex={-1}>All parameters</h3>
        <p className="world-task-view__intro">Every executed parameter remains visible. Changes rebuild a fresh paused run at tick 0.</p>
        <label className="world-parameter-search">
          <span>Find a parameter</span>
          <input
            type="search"
            value={parameterSearch}
            onChange={(event) => setParameterSearch(event.target.value)}
            placeholder="Label, key, or description"
          />
        </label>
        <section className="world-parameter-group" aria-labelledby="primary-parameter-group-title">
          <h4 id="primary-parameter-group-title">Quick setup controls</h4>
          <ParameterPanel includeKeys={quickParameterKeys} searchQuery={parameterSearch} ariaLabel="Quick setup parameters" />
        </section>
        <section className="world-parameter-group" aria-labelledby="additional-parameter-group-title">
          <h4 id="additional-parameter-group-title">Additional controls</h4>
          <ParameterPanel
            excludeKeys={quickParameterKeys}
            searchQuery={parameterSearch}
            showNote
            ariaLabel="Additional model parameters"
          />
        </section>
      </div>

      <div className="world-task-subview" hidden={view !== "recipes"}>
        <TaskViewBack onClick={() => openView("quick")} />
        <h3 id="setup-recipes-title" tabIndex={-1}>Starting recipes and model variants</h3>
        <ScenarioBuilderPanel />
      </div>

      <div className="world-task-subview" hidden={view !== "neural"}>
        <TaskViewBack onClick={() => openView("quick")} />
        <h3 id="setup-neural-title" tabIndex={-1}>Neural Runtime Lab</h3>
        <NeuralRuntimeLabPanel active={active && view === "neural"} />
      </div>
    </div>
  );
}

function TaskViewBack({ onClick }: { onClick: () => void }) {
  return <button type="button" className="world-task-back" onClick={onClick}>Back to Setup</button>;
}

function focusSetupView(view: SetupView): void {
  const targetId = {
    quick: "current-world-title",
    parameters: "setup-parameters-title",
    recipes: "setup-recipes-title",
    neural: "setup-neural-title"
  }[view];
  window.requestAnimationFrame(() => document.getElementById(targetId)?.focus());
}
