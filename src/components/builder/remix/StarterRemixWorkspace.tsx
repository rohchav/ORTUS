"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  agentCompositionDefinitionsForTemplate,
  behaviorModesForTemplate,
  environmentOptionDefinitionsForTemplate,
  findInitializationPreset,
  getProductionTemplate,
  initializationPresetsForTemplate,
  patchScenarioInitializationOptions,
  patchScenarioMetadata,
  patchScenarioParameters,
  patchScenarioVariantOptions,
  updateScenarioPreset,
  validateScenario,
  type AuthoredScenario,
  type JsonValue,
  type ParameterDefinition
} from "../../../simulation";
import {
  consumeStarterRemixActiveWorldHandoff,
  createAcceptedLegacyRunConfig,
  createStarterRemixWorldLaunch,
  requireStarterWorldById,
  starterRemixLaunchMatchesRunConfig,
  type StarterRemixSource
} from "../../../lib/starterWorlds";
import { useSimulationStore } from "../../../state/simulationStore";
import { Disclosure } from "../../ui/Disclosure";
import { ModalSurface } from "../../ui/ModalSurface";
import { VisualSystemsWorkbench } from "../workbench/VisualSystemsWorkbench";
import {
  deriveWorkbenchModel,
  findWorkbenchPieceForControl,
  resolveWorkbenchControlDefinition,
  type WorkbenchControlGroup,
  type WorkbenchControlReference,
  type WorkbenchPiece
} from "../../../lib/workbench";

interface StarterRemixWorkspaceProps {
  source: StarterRemixSource;
  onMeaningfulChange: (meaningful: boolean) => void;
}

type FieldErrors = Record<string, string>;

export function StarterRemixWorkspace({ source, onMeaningfulChange }: StarterRemixWorkspaceProps) {
  const router = useRouter();
  const world = requireStarterWorldById(source.launch.starterWorldId);
  const template = getProductionTemplate(source.launch.templateId);
  if (!template) {
    throw new Error(`Starter remix template is unavailable: ${source.launch.templateId}`);
  }
  const [draft, setDraft] = useState<AuthoredScenario>(source.draft);
  const draftRef = useRef<AuthoredScenario>(source.draft);
  const [seedInput, setSeedInput] = useState(source.draft.seed);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  // Raw edits belong to the derivative, so inspecting another piece never clears them.
  const [rawValues, setRawValues] = useState<Record<string, { raw: string; invalid: boolean }>>({});
  const [meaningfulChange, setMeaningfulChange] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeSourceChecked, setActiveSourceChecked] = useState(source.entry !== "world");
  const activeHandoffConsumedRef = useRef(false);
  const presets = initializationPresetsForTemplate(template);
  const behaviorModes = behaviorModesForTemplate(template);
  const compositionDefinitions = agentCompositionDefinitionsForTemplate(template);
  const environmentDefinitions = environmentOptionDefinitionsForTemplate(template);
  const activePreset = findInitializationPreset(template, draft.initializationPreset) ?? presets[0];
  const primaryParameterId = source.focusParameterId ?? (
    world.firstChange.targetType === "parameter"
      ? world.firstChange.targetId
      : world.runtime?.recommendedParameterId
  );
  const primaryParameter = template.parameterDefinitions.find((definition) => definition.key === primaryParameterId);
  const model = useMemo(() => deriveWorkbenchModel(world), [world]);
  const initialPiece = source.focusParameterId
    ? findWorkbenchPieceForControl(model, "parameters", source.focusParameterId)
    : undefined;
  const validation = useMemo(() => {
    try {
      return { scenario: validateScenario(draft).scenario, error: null as string | null };
    } catch (error) {
      return { scenario: null, error: messageFor(error) };
    }
  }, [draft]);
  const errorMessages = [...Object.values(fieldErrors), ...(validation.error ? [validation.error] : [])];
  const controlsReady = hydrated && activeSourceChecked;
  const canRun = Boolean(validation.scenario) && errorMessages.length === 0 && controlsReady;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (source.entry !== "world" || activeHandoffConsumedRef.current) {
      return;
    }
    activeHandoffConsumedRef.current = true;
    try {
      const activeDraft = consumeStarterRemixActiveWorldHandoff(source);
      if (!activeDraft) {
        throw new Error("No matching accepted active-run handoff is available.");
      }
      draftRef.current = activeDraft;
      setDraft(activeDraft);
      setSeedInput(activeDraft.seed);
      setStatus("Drafted from the accepted active World configuration. The named Starter remains the immutable source.");
    } catch {
      setStatus("The active World no longer matches this source. Workshop restored the immutable Starter configuration instead.");
    } finally {
      setFieldErrors({});
      setRawValues({});
      setActiveSourceChecked(true);
      onMeaningfulChange(false);
    }
  }, [onMeaningfulChange, source]);

  function setFieldError(field: string, error: string | null) {
    setFieldErrors((current) => {
      if (error) {
        return current[field] === error ? current : { ...current, [field]: error };
      }
      if (!(field in current)) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function markMeaningfulChange() {
    setMeaningfulChange(true);
    onMeaningfulChange(true);
  }

  function clearRawValue(field: string) {
    setRawValues((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateDraft(field: string, update: (current: AuthoredScenario) => AuthoredScenario): boolean {
    markMeaningfulChange();
    setLaunchError(null);
    setStatus(null);
    try {
      const previous = draftRef.current;
      const next = update(previous);
      setRawValues((current) => Object.fromEntries(Object.entries(current).filter(([key, entry]) =>
        entry.invalid || key === field || Object.is(scenarioFieldValue(previous, key), scenarioFieldValue(next, key))
      )));
      draftRef.current = next;
      setDraft(next);
      setFieldError(field, null);
      return true;
    } catch (error) {
      setFieldError(field, messageFor(error));
      return false;
    }
  }

  function updateParameterGroup(
    group: "parameters" | "initializationOptions" | "agentComposition" | "environmentOptions",
    key: string,
    value: JsonValue
  ) {
    const field = `${group}.${key}`;
    if (group === "parameters") {
      return updateDraft(field, (current) => patchScenarioParameters(current, { ...current.parameters, [key]: value }));
    }
    if (group === "initializationOptions") {
      return updateDraft(field, (current) => patchScenarioInitializationOptions(current, { ...current.initializationOptions, [key]: value }));
    }
    return updateDraft(field, (current) => patchScenarioVariantOptions(current, {
      [group]: { ...current[group], [key]: value }
    }));
  }

  function resetToSource() {
    draftRef.current = source.draft;
    setDraft(source.draft);
    setSeedInput(source.draft.seed);
    setFieldErrors({});
    setLaunchError(null);
    setStatus(`Restored the immutable ${source.launch.recipeId ? "prepared recipe" : "Starter"} configuration. No active run was changed.`);
    setRawValues({});
    setMeaningfulChange(false);
    setResetOpen(false);
    onMeaningfulChange(false);
    window.requestAnimationFrame(() => resetButtonRef.current?.focus());
  }

  function runRemix() {
    if (!canRun || !validation.scenario) {
      setLaunchError("Resolve the draft errors before starting a run.");
      return;
    }
    try {
      const acceptedDraft = validateScenario(validation.scenario).scenario;
      const launch = createStarterRemixWorldLaunch(acceptedDraft);
      useSimulationStore.getState().applyScenario(acceptedDraft);
      const acceptedState = useSimulationStore.getState();
      const acceptedConfig = acceptedState.flockingRuntimeConfig ?? (
        acceptedState.engine?.template.id === launch.templateId
          ? createAcceptedLegacyRunConfig({
              templateId: acceptedState.engine.template.id,
              seed: acceptedState.engine.seed,
              parameters: acceptedState.engine.parameters,
              metadata: acceptedState.engine.metadata
            })
          : null
      );
      // applyScenario reports its own rejection as a Setup error; errors from other panels are unrelated.
      const setupError = acceptedState.lastError?.area === "setup" ? acceptedState.lastError.text : null;
      if (
        setupError ||
        acceptedState.selectedTemplateId !== launch.templateId ||
        !starterRemixLaunchMatchesRunConfig(acceptedConfig, launch)
      ) {
        throw new Error(setupError ?? "The established runtime path did not accept this derivative.");
      }
      onMeaningfulChange(false);
      router.push(launch.href);
    } catch (error) {
      setLaunchError(`Run Remix stopped: ${messageFor(error)}`);
    }
  }

  function changeRawParameter(reference: WorkbenchControlReference, definition: ParameterDefinition, raw: string) {
    const field = `${reference.group}.${reference.key}`;
    const parsed = parseNumericParameter(definition, raw);
    markMeaningfulChange();
    setStatus(null);
    if (!parsed.ok) {
      setRawValues((current) => ({ ...current, [field]: { raw, invalid: true } }));
      setFieldError(field, parsed.message);
      return;
    }
    if (reference.group === "run") return;
    const accepted = updateParameterGroup(reference.group, reference.key, parsed.value);
    setRawValues((current) => ({ ...current, [field]: { raw, invalid: !accepted } }));
  }

  function resetProperty(reference: WorkbenchControlReference) {
    const { group, key } = reference;
    if (group === "run") return;
    const sourceValue = source.draft[group][key];
    if (sourceValue !== undefined && updateParameterGroup(group, key, sourceValue)) {
      clearRawValue(`${group}.${key}`);
      setStatus(`Restored ${key} to its source value. Other draft edits are preserved.`);
    }
  }

  function renderParameter(reference: WorkbenchControlReference, prefix: string) {
    if (reference.group === "run") return renderRunControl(reference.key, prefix);
    const definition = resolveWorkbenchControlDefinition(reference, template!, draft);
    if (!definition) return null;
    const field = `${reference.group}.${reference.key}`;
    const value = draft[reference.group][reference.key] ?? definition.defaultValue;
    const sourceValue = source.draft[reference.group][reference.key];
    const id = prefix === "selected" && reference.key === primaryParameter?.key
      ? "starter-remix-primary-control"
      : `starter-remix-${prefix}-${reference.group}-${reference.key}`;
    return (
      <div key={field} className="starter-remix__property" data-workbench-control={field}>
        <RemixParameterControl
          controlId={id}
          definition={definition}
          value={value}
          rawValue={rawValues[field]?.raw ?? String(value)}
          error={fieldErrors[field]}
          onRawChange={(raw) => changeRawParameter(reference, definition, raw)}
          onChange={(nextValue) => {
            if (reference.group !== "run" && updateParameterGroup(reference.group, reference.key, nextValue)) clearRawValue(field);
          }}
        />
        <div className="starter-remix__property-source">
          <small>Source: {sourceValue === undefined ? "not part of the source preset" : String(sourceValue)}</small>
          {sourceValue !== undefined ? (
            <button
              type="button"
              aria-label={`Reset ${definition.label} to source`}
              disabled={Object.is(value, sourceValue) && !rawValues[field]?.invalid && !fieldErrors[field]}
              onClick={() => resetProperty(reference)}
            >Reset property</button>
          ) : null}
        </div>
        {prefix === "selected" && reference.group === "parameters" && reference.key === primaryParameter?.key && world.firstChange.suggestedValue !== undefined ? (
          <button type="button" className="starter-remix__suggestion" onClick={() => {
            if (updateParameterGroup("parameters", reference.key, world.firstChange.suggestedValue!)) clearRawValue(field);
          }}>Try {String(world.firstChange.suggestedValue)} · {world.firstChange.action}</button>
        ) : null}
      </div>
    );
  }

  function renderRunControl(key: string, prefix: string) {
    if (key === "seed") {
      const id = `starter-remix-${prefix}-seed`;
      return (
        <label className="starter-remix-control" key={key} htmlFor={id}>
          <span><strong>Seed</strong><em>Deterministic seed for the fresh derivative run.</em></span>
          <input id={id} type="text" value={seedInput} aria-invalid={Boolean(fieldErrors.seed)}
            aria-describedby={fieldErrors.seed ? `${id}-error` : undefined}
            onChange={(event) => {
              const value = event.target.value;
              setSeedInput(value);
              markMeaningfulChange();
              if (!value.trim()) {
                setFieldError("seed", "Seed is required.");
                return;
              }
              updateDraft("seed", (current) => patchScenarioMetadata(current, { seed: value }));
            }} suppressHydrationWarning />
          {fieldErrors.seed ? <small id={`${id}-error`} role="alert">{fieldErrors.seed}</small> : null}
        </label>
      );
    }
    if (key === "initializationPreset") {
      return (
        <label className="starter-remix-control" key={key}>
          <span><strong>Initialization preset</strong><em>Substitute a template-owned initial arrangement. Its option values are replaced; unrelated draft errors remain.</em></span>
          <select value={draft.initializationPreset} onChange={(event) => {
            updateDraft("initializationPreset", (current) => updateScenarioPreset(current, event.target.value));
          }} suppressHydrationWarning>
            {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
          </select>
          {fieldErrors.initializationPreset ? <small role="alert">{fieldErrors.initializationPreset}</small> : null}
        </label>
      );
    }
    if (key === "behaviorMode") {
      return (
        <label className="starter-remix-control" key={key}>
          <span><strong>Behavior mode</strong><em>Substitute a bounded rule variant implemented by this template.</em></span>
          <select value={draft.behaviorMode} onChange={(event) => {
            updateDraft("behaviorMode", (current) => patchScenarioVariantOptions(current, { behaviorMode: event.target.value }));
          }} suppressHydrationWarning>
            {behaviorModes.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
          </select>
          {fieldErrors.behaviorMode ? <small role="alert">{fieldErrors.behaviorMode}</small> : null}
        </label>
      );
    }
    return null;
  }

  function renderControls(piece: WorkbenchPiece) {
    const selected = uniqueControls(piece.controls).filter((reference) =>
      reference.group === "run" || resolveWorkbenchControlDefinition(reference, template!, draft)
    );
    const selectedKeys = new Set(selected.map((reference) => `${reference.group}.${reference.key}`));
    const hasGroups = behaviorModes.some((mode) => mode.id === "groupAware") && selected.some((reference) => reference.group === "agentComposition" && reference.key === "groupCount");
    const exactGroups: { group: Exclude<WorkbenchControlGroup, "run">; title: string; definitions: readonly ParameterDefinition[] }[] = [
      { group: "parameters", title: "Template parameters", definitions: template!.parameterDefinitions.filter((definition) => !compositionDefinitions.some((candidate) => candidate.key === definition.key) && !environmentDefinitions.some((candidate) => candidate.key === definition.key)) },
      { group: "initializationOptions", title: "Initialization options", definitions: activePreset?.optionDefinitions ?? [] },
      { group: "agentComposition", title: "Agent composition", definitions: compositionDefinitions },
      { group: "environmentOptions", title: "Environment options", definitions: environmentDefinitions }
    ];
    return (
      <fieldset className="starter-remix__selected-controls" disabled={!controlsReady} aria-busy={!controlsReady}>
        <legend>Modify {piece.label}</legend>
        {hasGroups ? (
          <div className="starter-remix__variant">
            <p>Deterministic groups are a supported Flocking variant. They change local steering affinity; they do not create separate systems.</p>
            {draft.behaviorMode !== "groupAware" ? (
              <button type="button" onClick={() => updateDraft("behaviorMode", (current) => patchScenarioVariantOptions(current, { behaviorMode: "groupAware" }))}>
                Substitute group-aware boids
              </button>
            ) : <strong>Group-aware boids selected</strong>}
            <small>Group count applies in group-aware mode. Primary group ratio applies when group count is two.</small>
          </div>
        ) : null}
        {selected.map((reference) => renderParameter(reference, "selected"))}
        {selected.length === 0 ? <p>This piece has no editable property in the current template contract.</p> : null}
        <Disclosure expandLabel="Edit exact run configuration" collapseLabel="Hide exact run configuration" className="starter-remix__disclosure">
          <div className="starter-remix__configuration">
            <p>Other supported settings for this system. Rules and metrics remain fixed in this remix.</p>
            {["seed", "initializationPreset", "behaviorMode"].filter((key) => !selectedKeys.has(`run.${key}`)).map((key) => renderRunControl(key, "exact"))}
            {exactGroups.map(({ group, title, definitions }) => {
              const references = uniqueControls(definitions.map((definition) => ({ group, key: definition.key })))
                .filter((reference) => !selectedKeys.has(`${reference.group}.${reference.key}`))
                .filter((reference) => !selected.some((selectedReference) => selectedReference.key === reference.key && selectedReference.group !== "run" && reference.group !== "initializationOptions" && selectedReference.group !== "initializationOptions"));
              return references.length ? <section key={group} className="starter-remix__parameter-group"><h4>{title}</h4>{references.map((reference) => renderParameter(reference, "exact"))}</section> : null;
            })}
          </div>
        </Disclosure>
      </fieldset>
    );
  }

  return (
    <div className="starter-remix starter-remix--workbench" data-starter-remix-workspace data-starter-world-id={world.id}>
      <VisualSystemsWorkbench
        world={world}
        scenario={draft}
        initialPieceId={initialPiece?.id}
        renderControls={renderControls}
        sourceContext={(
          <div className="starter-remix__lineage" aria-label="Starter remix lineage">
            <span>{source.launch.recipeId ? `Prepared recipe: ${source.sourceScenario.name}` : `Source Starter: ${source.sourceScenario.name}`} · v{source.lineage.source.starterWorldVersion}</span>
            <strong>Unsaved remix</strong>
            <span>Fixed in this remix: {template.name} v{template.version} owns rules and metrics.</span>
            <Link href={`/worlds/${world.slug}`}>Review source Starter</Link>
          </div>
        )}
        footer={(
          <div className="starter-remix__run-footer">
            <div className="starter-remix__validation" aria-live="polite">
              <strong>{canRun ? "Draft contract checked · fresh local run" : "Draft needs attention"}</strong>
              {status ? <span>{status}</span> : null}
              {errorMessages.length > 0 ? <ul>{errorMessages.map((error, index) => <li key={`${index}:${error}`}>{error}</li>)}</ul> : null}
              {Object.entries(rawValues).filter(([, entry]) => entry.invalid).map(([field]) => (
                <button type="button" key={field} onClick={() => {
                  clearRawValue(field);
                  setFieldError(field, null);
                  setStatus(`Discarded the invalid edit for ${field}; retained its last accepted draft value.`);
                }}>Discard invalid edit: {field}</button>
              ))}
              {launchError ? <strong role="alert">{launchError}</strong> : null}
              <small>Run Remix creates a fresh tick-0 run through the existing {template.id === "flocking-boids" ? "Worker" : "main-thread"} template path. Source Starter ≠ derivative draft ≠ accepted run. Software checks do not establish scientific validity.</small>
            </div>
            <div className="starter-remix__actions">
              <button type="button" disabled={!controlsReady} onClick={() => setStatus(canRun ? "Draft accepted by scenario and template contracts. This is software readiness, not scientific validation." : "Resolve the listed draft errors before Run Remix.")}>Validate draft</button>
              <button ref={resetButtonRef} type="button" disabled={!controlsReady} onClick={() => {
                if (meaningfulChange || JSON.stringify(draft.parameters) !== JSON.stringify(source.draft.parameters) || JSON.stringify(draft.initializationOptions) !== JSON.stringify(source.draft.initializationOptions) || JSON.stringify(draft.agentComposition) !== JSON.stringify(source.draft.agentComposition) || JSON.stringify(draft.environmentOptions) !== JSON.stringify(source.draft.environmentOptions) || draft.seed !== source.draft.seed || draft.behaviorMode !== source.draft.behaviorMode || draft.initializationPreset !== source.draft.initializationPreset) setResetOpen(true);
                else resetToSource();
              }} suppressHydrationWarning>Reset to source</button>
              <button type="button" className="starter-remix__run" onClick={runRemix} disabled={!canRun} suppressHydrationWarning>Run Remix</button>
            </div>
          </div>
        )}
      />
      <ModalSurface open={resetOpen} eyebrow="Discard derivative changes" title="Reset this remix to its source?" closeLabel="Keep editing" onClose={() => setResetOpen(false)} returnFocusRef={resetButtonRef}>
        <p>This discards all unsaved parameter, composition, environment, preset, behavior, seed, and invalid input edits in this remix. The source Starter and active run stay intact.</p>
        <button type="button" onClick={resetToSource}>Discard draft changes and reset to source</button>
      </ModalSurface>
    </div>
  );
}

/** Shared parameter/variant keys are synchronized by the existing scenario patch APIs. */
function uniqueControls(references: readonly WorkbenchControlReference[]): WorkbenchControlReference[] {
  return references.filter((reference, index) =>
    references.findIndex((candidate) => candidate.group === reference.group && candidate.key === reference.key) === index &&
    !(reference.group === "parameters" && references.some((candidate) => candidate.key === reference.key && (candidate.group === "agentComposition" || candidate.group === "environmentOptions")))
  );
}

function scenarioFieldValue(scenario: AuthoredScenario, field: string): JsonValue | undefined {
  const [group, key] = field.split(".");
  if (!key || (group !== "parameters" && group !== "initializationOptions" && group !== "agentComposition" && group !== "environmentOptions")) return undefined;
  return scenario[group][key];
}

function RemixParameterControl({ controlId, definition, value, rawValue, error, onRawChange, onChange }: {
  controlId: string;
  definition: ParameterDefinition;
  value: JsonValue;
  rawValue: string;
  error?: string;
  onRawChange: (raw: string) => void;
  onChange: (value: JsonValue) => void;
}) {
  const errorId = `${controlId}-error`;
  return (
    <label className={`starter-remix-control${definition.type === "boolean" ? " starter-remix-control--boolean" : ""}`} htmlFor={controlId}>
      <span><strong>{definition.label}</strong><em>{definition.description}</em></span>
      {definition.type === "boolean" ? (
        <input id={controlId} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} suppressHydrationWarning />
      ) : definition.type === "select" ? (
        <select id={controlId} value={String(value)} onChange={(event) => {
          const option = definition.options?.find((candidate) => String(candidate) === event.target.value);
          if (option !== undefined) onChange(option);
        }} suppressHydrationWarning>
          {(definition.options ?? []).map((option) => <option key={String(option)} value={String(option)}>{String(option)}</option>)}
        </select>
      ) : (
        <input id={controlId} type="number" min={definition.min} max={definition.max} step={definition.step ?? (definition.type === "integer" ? 1 : 0.1)} value={rawValue}
          aria-label={`${definition.label} numeric value`} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}
          onChange={(event) => onRawChange(event.target.value)} suppressHydrationWarning />
      )}
      {error ? <small id={errorId} role="alert">{error}</small> : null}
    </label>
  );
}

function parseNumericParameter(
  definition: ParameterDefinition,
  raw: string
): { ok: true; value: number } | { ok: false; message: string } {
  if (!raw.trim()) {
    return { ok: false, message: `${definition.label} is required.` };
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return { ok: false, message: `${definition.label} must be a finite number.` };
  }
  if (definition.type === "integer" && !Number.isInteger(value)) {
    return { ok: false, message: `${definition.label} must be a whole number.` };
  }
  if (definition.min !== undefined && value < definition.min) {
    return { ok: false, message: `${definition.label} must be at least ${definition.min}.` };
  }
  if (definition.max !== undefined && value > definition.max) {
    return { ok: false, message: `${definition.label} must be at most ${definition.max}.` };
  }
  return { ok: true, value };
}

function messageFor(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return (message.trim() || "Starter remix operation failed.").slice(0, 420);
}
