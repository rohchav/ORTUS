"use client";

import { useEffect, useRef, useState } from "react";
import { NeuralRuntimeLabPanel } from "./NeuralRuntimeLabPanel";
import { FlockingExplorationPanel } from "./FlockingExplorationPanel";
import { ParameterPanel } from "./ParameterPanel";
import { ScenarioBuilderPanel } from "./ScenarioBuilderPanel";
import { getSystemCatalogEntry } from "../lib/systemCatalog";
import { getTemplateDescriptor, templateDescriptors, type TemplateId } from "../lib/templateVisuals";
import { generateUiSeed } from "../lib/uiSeed";
import { parameterPresentationForTemplate } from "../lib/worldPresentation";
import { getInterventionDefinitions, validateTemplateParameters, type JsonValue, type ParameterValues } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

type SetupView = "quick" | "explore" | "parameters" | "recipes" | "neural";

export function RunSettingsPanel({ active = true }: { active?: boolean } = {}) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const selectTemplate = useSimulationStore((state) => state.selectTemplate);
  const setSeed = useSimulationStore((state) => state.setSeed);
  const setParameters = useSimulationStore((state) => state.setParameters);
  const runtime = useActiveWorldRuntime();
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const system = getSystemCatalogEntry(selectedTemplateId);
  const parameterPresentation = parameterPresentationForTemplate(selectedTemplateId);
  const quickParameterKeys = parameterPresentation.filter((item) => item.priority === "primary").map((item) => item.key);
  const interventionCount = getInterventionDefinitions(selectedTemplateId).length;
  const scenarioName = typeof runtime.metadata.scenarioName === "string" && runtime.metadata.scenarioName.trim()
    ? runtime.metadata.scenarioName
    : "Default run";
  const [seedDraft, setSeedDraft] = useState(runtime.seed);
  const [parameterDraft, setParameterDraft] = useState<ParameterValues>(runtime.parameters);
  const [parameterError, setParameterError] = useState<string | null>(null);
  const previousActiveParametersRef = useRef(runtime.parameters);
  const parameterDraftTemplateRef = useRef(selectedTemplateId);
  const [view, setView] = useState<SetupView>("quick");
  const [parameterSearch, setParameterSearch] = useState("");
  const pendingParameterKeys = descriptor.template.parameterDefinitions
    .filter((definition) => !Object.is(parameterDraft[definition.key], runtime.parameters[definition.key]))
    .map((definition) => definition.key);
  const seedDraftDiffers = seedDraft.trim() !== runtime.seed;

  useEffect(() => {
    setSeedDraft(runtime.seed);
  }, [runtime.seed]);

  useEffect(() => {
    const previousActive = previousActiveParametersRef.current;
    const templateChanged = parameterDraftTemplateRef.current !== selectedTemplateId;
    setParameterDraft((currentDraft) =>
      templateChanged ? runtime.parameters : preservePendingParameterDrafts(currentDraft, previousActive, runtime.parameters)
    );
    previousActiveParametersRef.current = runtime.parameters;
    parameterDraftTemplateRef.current = selectedTemplateId;
    setParameterError(null);
  }, [runtime.parameters, selectedTemplateId]);

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

  function updateParameterDraft(key: string, value: JsonValue) {
    setParameterDraft((current) => ({ ...current, [key]: value }));
    setParameterError(null);
  }

  function applyParameterDraft() {
    try {
      const validated = validateTemplateParameters(descriptor.template, parameterDraft);
      setParameters(validated, "Setup parameter drafts");
      setParameterDraft(validated);
      setParameterError(null);
    } catch (error) {
      setParameterError(error instanceof Error ? error.message : "Parameter drafts could not be checked.");
    }
  }

  function discardParameterDraft() {
    setParameterDraft(runtime.parameters);
    setParameterError(null);
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
          <p>Choosing another template immediately discards the current trajectory and prepares that template paused at tick 0.</p>
        </section>

        {selectedTemplateId === "flocking-boids" ? (
          <section className="world-tool-entry world-exploration-entry" aria-labelledby="flocking-exploration-entry-title">
            <div>
              <span>What you are looking at</span>
              <h3 id="flocking-exploration-entry-title">Boids use three local steering rules</h3>
              <p>See the entities, translate the rule names, and load only behavior setups reproduced in the current runtime.</p>
            </div>
            <button type="button" onClick={() => openView("explore")}>Explore behavior</button>
          </section>
        ) : null}

        <section className="run-settings-quick world-tool-section" aria-labelledby="quick-controls-title">
          <div className="run-settings-quick__head">
            <div className="world-tool-section__head">
              <h3 id="quick-controls-title">Quick setup</h3>
              <span>{quickParameterKeys.length} key controls</span>
            </div>
            <span>{system.suggestedChange}</span>
            <p>Parameter and seed edits stay as Setup drafts. Use a rebuild action to replace the active run with a fresh paused tick-0 configuration.</p>
          </div>
          <ParameterDraftActions
            pendingCount={pendingParameterKeys.length}
            error={parameterError}
            onApply={applyParameterDraft}
            onDiscard={discardParameterDraft}
          />
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
                suppressHydrationWarning
              />
            </label>
            <div className="run-settings-actions">
              <button type="submit" aria-label="Apply Seed and rebuild a fresh run" suppressHydrationWarning>
                Apply Seed
              </button>
              <button type="button" onClick={() => setSeedDraft(generateUiSeed())} aria-label="New Seed: generate a seed draft" suppressHydrationWarning>
                New Seed
              </button>
            </div>
            <p className="run-settings-draft-status" aria-live="polite">
              {seedDraftDiffers ? "Seed draft differs from the active run. Apply Seed rebuilds the run." : "Seed draft matches the active run."}
            </p>
          </form>
          <ParameterPanel
            includeKeys={quickParameterKeys}
            highlightedKey={system.highlightedParameterKey}
            ariaLabel="Key model parameters"
            values={parameterDraft}
            activeValues={runtime.parameters}
            onDraftChange={updateParameterDraft}
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

      <div className="world-task-subview" hidden={view !== "explore"}>
        <TaskViewBack onClick={() => openView("quick")} />
        <h3 id="setup-explore-title" tabIndex={-1}>Explore Flocking behavior</h3>
        <p className="world-task-view__intro">Intuition first, exact configuration second. Every setup below replaces the run only after a separate confirmation.</p>
        <FlockingExplorationPanel />
      </div>

      <div className="world-task-subview" hidden={view !== "parameters"}>
        <TaskViewBack onClick={() => openView("quick")} />
        <h3 id="setup-parameters-title" tabIndex={-1}>All parameters</h3>
        <p className="world-task-view__intro">Every active parameter remains visible. Edits remain drafts until an explicit rebuild creates a fresh paused run at tick 0.</p>
        <ParameterDraftActions
          pendingCount={pendingParameterKeys.length}
          error={parameterError}
          onApply={applyParameterDraft}
          onDiscard={discardParameterDraft}
        />
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
          <ParameterPanel
            includeKeys={quickParameterKeys}
            searchQuery={parameterSearch}
            ariaLabel="Quick setup parameters"
            values={parameterDraft}
            activeValues={runtime.parameters}
            onDraftChange={updateParameterDraft}
          />
        </section>
        <section className="world-parameter-group" aria-labelledby="additional-parameter-group-title">
          <h4 id="additional-parameter-group-title">Additional controls</h4>
          <ParameterPanel
            excludeKeys={quickParameterKeys}
            searchQuery={parameterSearch}
            showNote
            ariaLabel="Additional model parameters"
            values={parameterDraft}
            activeValues={runtime.parameters}
            onDraftChange={updateParameterDraft}
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

function preservePendingParameterDrafts(
  currentDraft: ParameterValues,
  previousActive: ParameterValues,
  nextActive: ParameterValues
): ParameterValues {
  const nextDraft = { ...nextActive };
  for (const [key, draftValue] of Object.entries(currentDraft)) {
    if (key in nextActive && !Object.is(draftValue, previousActive[key])) {
      nextDraft[key] = draftValue;
    }
  }
  return nextDraft;
}

function ParameterDraftActions({
  pendingCount,
  error,
  onApply,
  onDiscard
}: {
  pendingCount: number;
  error: string | null;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="run-settings-draft" data-parameter-draft-state={pendingCount > 0 ? "pending" : "active"}>
      <p className="run-settings-draft-status" aria-live="polite">
        {pendingCount > 0
          ? `${pendingCount} parameter ${pendingCount === 1 ? "draft differs" : "drafts differ"} from the active run. Rebuild required.`
          : "Parameter drafts match the active run."}
      </p>
      {error ? <p className="experiment-error">{error}</p> : null}
      {pendingCount > 0 ? (
        <div className="run-settings-actions">
          <button type="button" onClick={onApply}>
            Rebuild run with parameter drafts
          </button>
          <button type="button" onClick={onDiscard}>
            Discard parameter drafts
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TaskViewBack({ onClick }: { onClick: () => void }) {
  return <button type="button" className="world-task-back" onClick={onClick}>Back to Setup</button>;
}

function focusSetupView(view: SetupView): void {
  const targetId = {
    quick: "current-world-title",
    explore: "setup-explore-title",
    parameters: "setup-parameters-title",
    recipes: "setup-recipes-title",
    neural: "setup-neural-title"
  }[view];
  window.requestAnimationFrame(() => document.getElementById(targetId)?.focus());
}
