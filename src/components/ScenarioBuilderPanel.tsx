"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AuthoredScenario, JsonValue, ParameterDefinition, ParameterValues, SimulationSnapshotView } from "../simulation";
import {
  createDefaultScenario,
  deserializeAuthoredScenario,
  duplicateScenario,
  agentCompositionDefinitionsForTemplate,
  behaviorModesForTemplate,
  environmentOptionDefinitionsForTemplate,
  findInitializationPreset,
  initializationPresetsForTemplate,
  patchScenarioInitializationOptions,
  patchScenarioMetadata,
  patchScenarioParameters,
  patchScenarioVariantOptions,
  previewScenario,
  serializeAuthoredScenario,
  updateScenarioPreset,
  validateScenario,
  maxSavedScenarios
} from "../simulation";
import {
  clearScenarioLibraryStorage,
  deleteScenarioFromLibrary,
  loadScenarioLibrary,
  saveScenarioToLibrary
} from "../lib/localScenarioStorage";
import { getTemplateDescriptor, renderAgents, renderGrid } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import { CornerFramePanel } from "./ui/CornerFramePanel";

interface ScenarioBuilderPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function ScenarioBuilderPanel({ collapsed = false, onToggle }: ScenarioBuilderPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const seed = useSimulationStore((state) => state.seed);
  const applyScenario = useSimulationStore((state) => state.applyScenario);
  const selectedDescriptor = getTemplateDescriptor(selectedTemplateId);
  const [draft, setDraft] = useState(() => createDefaultScenario({ template: selectedDescriptor.template, seed, now: currentIso() }));
  const [library, setLibrary] = useState<AuthoredScenario[]>([]);
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debouncedDraft = useDebouncedValue(draft, 250);

  useEffect(() => {
    const loaded = loadScenarioLibrary();
    setLibrary(loaded.scenarios);
    setNotice(loaded.warning ?? null);
  }, []);

  useEffect(() => {
    setDraft(createDefaultScenario({ template: selectedDescriptor.template, seed, now: currentIso() }));
    setError(null);
    setNotice(null);
  }, [selectedDescriptor.template, seed]);

  const draftDescriptor = getTemplateDescriptor(draft.templateId);
  const presets = initializationPresetsForTemplate(draftDescriptor.template);
  const behaviorModes = behaviorModesForTemplate(draftDescriptor.template);
  const agentCompositionDefinitions = agentCompositionDefinitionsForTemplate(draftDescriptor.template);
  const environmentOptionDefinitions = environmentOptionDefinitionsForTemplate(draftDescriptor.template);
  const activePreset = findInitializationPreset(draftDescriptor.template, draft.initializationPreset) ?? presets[0];
  const activeBehaviorMode = behaviorModes.find((mode) => mode.id === draft.behaviorMode) ?? behaviorModes[0];
  const validation = useMemo(() => {
    try {
      const result = validateScenario(draft);
      return { scenario: result.scenario, warnings: result.warnings, error: null as string | null };
    } catch (validationError) {
      return { scenario: null, warnings: [], error: messageFor(validationError) };
    }
  }, [draft]);
  const preview = useMemo(() => previewScenario(debouncedDraft), [debouncedDraft]);

  function safely(update: () => AuthoredScenario, success?: string) {
    try {
      setDraft(update());
      setError(null);
      if (success) {
        setNotice(success);
      }
    } catch (updateError) {
      setError(messageFor(updateError));
    }
  }

  function saveDraft() {
    try {
      const saved = saveScenarioToLibrary(validateScenario(draft).scenario, library);
      setLibrary(saved);
      setNotice(`Saved scenario "${draft.name}" to the local library.`);
      setError(null);
    } catch (saveError) {
      setError(`Save scenario failed: ${messageFor(saveError)}`);
      setNotice(null);
    }
  }

  function duplicateDraft() {
    try {
      const copy = duplicateScenario(draft, currentIso(), createUiId("scenario"));
      const saved = saveScenarioToLibrary(copy, library);
      setLibrary(saved);
      setDraft(copy);
      setNotice(`Duplicated scenario "${draft.name}".`);
      setError(null);
    } catch (duplicateError) {
      setError(`Duplicate scenario failed: ${messageFor(duplicateError)}`);
      setNotice(null);
    }
  }

  function exportDraft() {
    try {
      setExportText(serializeAuthoredScenario(draft));
      setNotice("Scenario export JSON is ready. It contains initial conditions only, not a snapshot or run summary.");
      setError(null);
    } catch (exportError) {
      setError(`Export scenario failed: ${messageFor(exportError)}`);
      setNotice(null);
    }
  }

  function importScenario() {
    try {
      const imported = deserializeAuthoredScenario(importText.trim());
      setDraft(imported);
      setImportText("");
      setNotice(`Imported scenario "${imported.name}" into the builder. Save or apply it when ready.`);
      setError(null);
    } catch (importError) {
      setError(`Import scenario failed: ${messageFor(importError)}`);
      setNotice(null);
    }
  }

  function deleteScenario(scenarioId: string) {
    const next = deleteScenarioFromLibrary(scenarioId, library);
    setLibrary(next);
    setNotice("Scenario deleted from the local library.");
  }

  function clearLibrary() {
    clearScenarioLibraryStorage();
    setLibrary([]);
    setNotice("Scenario library cleared.");
  }

  return (
    <CornerFramePanel title="Scenario Builder" eyebrow="Initial Conditions" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="scenario-builder-panel">
        <p className="scenario-builder-note">
          Scenarios define initial conditions. Snapshots restore a live run state; run summaries compare outcomes.
        </p>
        <p className="scenario-builder-note">
          Template: {draftDescriptor.template.name} v{draftDescriptor.template.version}
        </p>
        <div className="scenario-builder-actions">
          <button type="button" onClick={() => setDraft(createDefaultScenario({ template: selectedDescriptor.template, seed, now: currentIso() }))} suppressHydrationWarning>
            New Scenario
          </button>
          <button type="button" onClick={() => applyScenario(draft)} disabled={!validation.scenario} suppressHydrationWarning>
            Apply Scenario
          </button>
          <button type="button" onClick={saveDraft} disabled={!validation.scenario} suppressHydrationWarning>
            Save Scenario
          </button>
          <button type="button" onClick={duplicateDraft} disabled={!validation.scenario} suppressHydrationWarning>
            Duplicate Scenario
          </button>
        </div>
        {error || validation.error ? <p className="scenario-builder-error">{error ?? validation.error}</p> : null}
        {notice ? <p className="scenario-builder-status">{notice}</p> : null}
        {validation.warnings.map((warning) => (
          <p key={warning} className="scenario-builder-warning">
            {warning}
          </p>
        ))}
        <div className="scenario-builder-grid">
          <label>
            <span>Scenario name</span>
            <input
              value={draft.name}
              onChange={(event) => safely(() => patchScenarioMetadata(draft, { name: event.target.value }, currentIso()))}
              suppressHydrationWarning
            />
          </label>
          <label>
            <span>Seed</span>
            <input
              value={draft.seed}
              onChange={(event) => safely(() => patchScenarioMetadata(draft, { seed: event.target.value }, currentIso()))}
              suppressHydrationWarning
            />
          </label>
          <label>
            <span>Initialization Preset</span>
            <select value={draft.initializationPreset} onChange={(event) => safely(() => updateScenarioPreset(draft, event.target.value, currentIso()))} suppressHydrationWarning>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Behavior Mode</span>
            <select
              value={draft.behaviorMode}
              onChange={(event) => safely(() => patchScenarioVariantOptions(draft, { behaviorMode: event.target.value }, currentIso()))}
              suppressHydrationWarning
            >
              {behaviorModes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Tags</span>
            <input
              value={draft.tags.join(", ")}
              onChange={(event) => safely(() => patchScenarioMetadata(draft, { tags: splitTags(event.target.value) }, currentIso()))}
              placeholder="baseline, field-test"
              suppressHydrationWarning
            />
          </label>
          <label className="scenario-builder-grid__wide">
            <span>Scenario notes</span>
            <textarea
              value={draft.description}
              onChange={(event) => safely(() => patchScenarioMetadata(draft, { description: event.target.value }, currentIso()))}
              suppressHydrationWarning
            />
          </label>
        </div>
        {activePreset ? <p className="scenario-builder-note">{activePreset.description}</p> : null}
        {activeBehaviorMode ? <p className="scenario-builder-note">Behavior mode: {activeBehaviorMode.description}</p> : null}
        <ScenarioParameterEditor
          title="Initial Parameters"
          definitions={draftDescriptor.template.parameterDefinitions}
          values={draft.parameters}
          onChange={(key, value) =>
            safely(() => patchScenarioParameters(draft, { ...draft.parameters, [key]: value }, currentIso()))
          }
        />
        {activePreset?.optionDefinitions && activePreset.optionDefinitions.length > 0 ? (
          <ScenarioParameterEditor
            title="Initialization Options"
            definitions={activePreset.optionDefinitions}
            values={draft.initializationOptions}
            onChange={(key, value) =>
              safely(() => patchScenarioInitializationOptions(draft, { ...draft.initializationOptions, [key]: value }, currentIso()))
            }
          />
        ) : (
          <p className="microcopy">This preset has no extra initialization options.</p>
        )}
        {agentCompositionDefinitions.length > 0 ? (
          <ScenarioParameterEditor
            title="Agent Composition"
            definitions={agentCompositionDefinitions}
            values={draft.agentComposition}
            onChange={(key, value) =>
              safely(() => patchScenarioVariantOptions(draft, { agentComposition: { ...draft.agentComposition, [key]: value } }, currentIso()))
            }
          />
        ) : (
          <p className="microcopy">This template has no separate agent composition controls; use initial parameters.</p>
        )}
        {environmentOptionDefinitions.length > 0 ? (
          <ScenarioParameterEditor
            title="Environment Options"
            definitions={environmentOptionDefinitions}
            values={draft.environmentOptions}
            onChange={(key, value) =>
              safely(() => patchScenarioVariantOptions(draft, { environmentOptions: { ...draft.environmentOptions, [key]: value } }, currentIso()))
            }
          />
        ) : (
          <p className="microcopy">This template has no separate environment options for V1.</p>
        )}
        <ScenarioPreview preview={preview} />
        <div className="scenario-builder-actions">
          <button type="button" onClick={exportDraft} disabled={!validation.scenario} suppressHydrationWarning>
            Export Scenario
          </button>
          <button type="button" onClick={importScenario} disabled={!importText.trim()} suppressHydrationWarning>
            Import Scenario
          </button>
        </div>
        {exportText ? (
          <label className="json-field">
            <span>Scenario Export</span>
            <textarea className="json-box" value={exportText} readOnly suppressHydrationWarning />
          </label>
        ) : null}
        <label className="json-field">
          <span>Import Scenario JSON</span>
          <textarea
            className="json-box"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder="Paste Scenario Builder JSON here."
            suppressHydrationWarning
          />
        </label>
        <ScenarioLibrary scenarios={library} activeScenarioId={draft.scenarioId} onLoad={setDraft} onDelete={deleteScenario} onClear={clearLibrary} />
      </div>
    </CornerFramePanel>
  );
}

function ScenarioParameterEditor({
  title,
  definitions,
  values,
  onChange
}: {
  title: string;
  definitions: readonly ParameterDefinition[];
  values: ParameterValues;
  onChange: (key: string, value: JsonValue) => void;
}) {
  return (
    <section className="scenario-parameter-editor">
      <span className="run-section-label">{title}</span>
      {definitions.map((definition) => (
        <ScenarioParameterControl
          key={definition.key}
          definition={definition}
          value={values[definition.key] ?? definition.defaultValue}
          onChange={(value) => onChange(definition.key, value)}
        />
      ))}
    </section>
  );
}

function ScenarioParameterControl({
  definition,
  value,
  onChange
}: {
  definition: ParameterDefinition;
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}) {
  if (definition.type === "boolean") {
    return (
      <label className="scenario-parameter-control scenario-parameter-control--boolean">
        <span>
          <strong>{definition.label}</strong>
          <em>{definition.description}</em>
        </span>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} suppressHydrationWarning />
      </label>
    );
  }
  if (definition.type === "select") {
    return (
      <label className="scenario-parameter-control">
        <span>
          <strong>{definition.label}</strong>
          <em>{definition.description}</em>
        </span>
        <select value={String(value)} onChange={(event) => onChange(event.target.value)} suppressHydrationWarning>
          {(definition.options ?? []).map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const numericValue = typeof value === "number" ? value : Number(value);
  const min = definition.min ?? 0;
  const max = definition.max ?? Math.max(100, numericValue);
  const step = definition.step ?? (definition.type === "integer" ? 1 : 0.1);
  return (
    <label className="scenario-parameter-control">
      <span>
        <strong>{definition.label}</strong>
        <em>{definition.description}</em>
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(numericValue) ? numericValue : ""}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) {
            onChange(definition.type === "integer" ? Math.round(next) : next);
          }
        }}
        suppressHydrationWarning
      />
    </label>
  );
}

function ScenarioPreview({ preview }: { preview: ReturnType<typeof previewScenario> }) {
  return (
    <section className="scenario-preview">
      <span className="run-section-label">Initial World Preview</span>
      {preview.errors.length > 0 ? (
        <p className="scenario-builder-error">{preview.errors[0]}</p>
      ) : preview.snapshot ? (
        <>
          <ScenarioPreviewCanvas snapshot={preview.snapshot} />
          <p className="microcopy">
            Tick {preview.snapshot.tick}. {preview.snapshot.entities.filter((entity) => entity.alive).length} initial entities. Preview does not advance the simulation.
          </p>
        </>
      ) : (
        <p className="microcopy">No preview available for this scenario.</p>
      )}
    </section>
  );
}

function ScenarioPreviewCanvas({ snapshot }: { snapshot: SimulationSnapshotView }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const width = 300;
    const height = 150;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawScenarioPreview(ctx, snapshot, width, height);
  }, [snapshot]);
  return <canvas ref={canvasRef} className="scenario-preview-canvas" role="img" aria-label="Scenario initial world preview" />;
}

function ScenarioLibrary({
  scenarios,
  activeScenarioId,
  onLoad,
  onDelete,
  onClear
}: {
  scenarios: readonly AuthoredScenario[];
  activeScenarioId: string;
  onLoad: (scenario: AuthoredScenario) => void;
  onDelete: (scenarioId: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="scenario-library">
      <div className="run-library__head">
        <span>Scenario Library</span>
        <strong>{scenarios.length}/{maxSavedScenarios} saved</strong>
        <button type="button" onClick={onClear} disabled={scenarios.length === 0} suppressHydrationWarning>
          Clear Scenario Library
        </button>
      </div>
      {scenarios.length === 0 ? (
        <p className="microcopy">No saved scenarios yet. Save the draft scenario to reuse or duplicate initial conditions.</p>
      ) : (
        <ol>
          {scenarios.map((scenario) => (
            <li key={scenario.scenarioId} className={scenario.scenarioId === activeScenarioId ? "is-selected" : ""}>
              <strong>{scenario.name}</strong>
              <span>{scenario.templateId}</span>
              <em>
                {scenario.initializationPreset} · {scenario.behaviorMode}
              </em>
              <div className="scenario-builder-actions">
                <button type="button" onClick={() => onLoad(scenario)} suppressHydrationWarning>
                  Edit Scenario Draft
                </button>
                <button type="button" onClick={() => onDelete(scenario.scenarioId)} suppressHydrationWarning>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function drawScenarioPreview(ctx: CanvasRenderingContext2D, snapshot: SimulationSnapshotView, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(8, 9, 9, 0.82)";
  ctx.fillRect(0, 0, width, height);
  const grid = renderGrid(snapshot);
  if (grid) {
    const cellWidth = width / grid.cols;
    const cellHeight = height / grid.rows;
    ctx.strokeStyle = "rgba(243, 241, 232, 0.08)";
    ctx.lineWidth = 1;
    for (const agent of grid.agents) {
      ctx.fillStyle = agent.fill;
      ctx.globalAlpha = agent.intensity;
      ctx.fillRect(agent.col * cellWidth + 1, agent.row * cellHeight + 1, Math.max(1, cellWidth - 2), Math.max(1, cellHeight - 2));
    }
    ctx.globalAlpha = 1;
    return;
  }
  for (const agent of renderAgents(snapshot)) {
    ctx.beginPath();
    ctx.fillStyle = agent.fill;
    ctx.globalAlpha = agent.intensity;
    ctx.arc((agent.x / 100) * width, (agent.y / 100) * height, Math.max(1.8, agent.radius * 0.7), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);
  return debounced;
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function currentIso(): string {
  return new Date().toISOString();
}

function createUiId(prefix: string): string {
  const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (webCrypto?.randomUUID) {
    return `${prefix}-${webCrypto.randomUUID().slice(0, 13)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function messageFor(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 360 ? `${message.slice(0, 357)}...` : message;
}
