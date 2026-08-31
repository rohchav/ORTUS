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
  type ParameterDefinition,
  type ParameterValues
} from "../../../simulation";
import {
  consumeStarterRemixActiveWorldHandoff,
  createStarterRemixWorldLaunch,
  requireStarterWorldById,
  starterRemixLaunchMatchesMetadata,
  type StarterRemixSource
} from "../../../lib/starterWorlds";
import { useSimulationStore } from "../../../state/simulationStore";
import { Disclosure } from "../../ui/Disclosure";

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
  const [resetRevision, setResetRevision] = useState(0);
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
  const remainingParameters = template.parameterDefinitions.filter((definition) => definition.key !== primaryParameter?.key);
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
      setResetRevision((revision) => revision + 1);
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

  function clearRemountedFieldErrors() {
    setFieldErrors((current): FieldErrors => {
      const seedError = current.seed;
      if (seedError) {
        return { seed: seedError };
      }
      return {};
    });
  }

  function updateDraft(field: string, update: (current: AuthoredScenario) => AuthoredScenario): boolean {
    onMeaningfulChange(true);
    setLaunchError(null);
    setStatus(null);
    try {
      const next = update(draftRef.current);
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
      updateDraft(field, (current) => patchScenarioParameters(current, { ...current.parameters, [key]: value }));
      return;
    }
    if (group === "initializationOptions") {
      updateDraft(field, (current) => patchScenarioInitializationOptions(current, { ...current.initializationOptions, [key]: value }));
      return;
    }
    updateDraft(field, (current) => patchScenarioVariantOptions(current, {
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
    setResetRevision((revision) => revision + 1);
    onMeaningfulChange(false);
    window.requestAnimationFrame(() => document.getElementById("starter-remix-primary-control")?.focus());
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
      const acceptedMetadata = acceptedState.flockingRuntimeConfig?.metadata ?? acceptedState.engine?.metadata;
      if (
        acceptedState.lastError ||
        acceptedState.selectedTemplateId !== launch.templateId ||
        !starterRemixLaunchMatchesMetadata(acceptedMetadata, launch)
      ) {
        throw new Error(acceptedState.lastError ?? "The established runtime path did not accept this derivative.");
      }
      onMeaningfulChange(false);
      router.push(launch.href);
    } catch (error) {
      setLaunchError(`Run Remix stopped: ${messageFor(error)}`);
    }
  }

  return (
    <div className="starter-remix" data-starter-remix-workspace data-starter-world-id={world.id}>
      <header className="starter-remix__header">
        <div>
          <p>Executable Starter derivative</p>
          <h2>{world.title}</h2>
          <span>{source.launch.recipeId ? `Prepared recipe: ${source.sourceScenario.name}` : `Source Starter: ${source.sourceScenario.name}`}</span>
        </div>
        <dl aria-label="Starter remix lineage">
          <div><dt>Source</dt><dd>{world.title} v{source.lineage.source.starterWorldVersion}</dd></div>
          <div><dt>Derivative</dt><dd>Unsaved remix</dd></div>
          <div><dt>Runtime</dt><dd>{template.name} v{template.version}</dd></div>
        </dl>
      </header>

      <fieldset className="starter-remix__workspace" disabled={!controlsReady} aria-busy={!controlsReady}>
        <div className="starter-remix__editor">
          <section className="starter-remix__question" aria-labelledby="starter-remix-question-heading">
            <p>Start with one controlled change</p>
            <h3 id="starter-remix-question-heading">{world.firstChange.action}</h3>
            <span>{world.firstChange.differenceToLookFor}</span>
            {primaryParameter ? (
              <RemixParameterControl
                key={`${resetRevision}:primary:${primaryParameter.key}`}
                controlId="starter-remix-primary-control"
                definition={primaryParameter}
                value={draft.parameters[primaryParameter.key] ?? primaryParameter.defaultValue}
                error={fieldErrors[`parameters.${primaryParameter.key}`]}
                onRawChange={() => onMeaningfulChange(true)}
                onValidationError={(error) => setFieldError(`parameters.${primaryParameter.key}`, error)}
                onChange={(value) => updateParameterGroup("parameters", primaryParameter.key, value)}
              />
            ) : (
              <p className="starter-remix__boundary">This Starter has no parameter mapped to its first investigation. Use the exact controls below.</p>
            )}
            {primaryParameter && world.firstChange.suggestedValue !== undefined ? (
              <button
                type="button"
                className="starter-remix__suggestion"
                onClick={() => updateParameterGroup("parameters", primaryParameter.key, world.firstChange.suggestedValue!)}
              >
                Use suggested value: {String(world.firstChange.suggestedValue)}
              </button>
            ) : null}
          </section>

          <Disclosure expandLabel="Edit exact run configuration" collapseLabel="Hide exact run configuration" className="starter-remix__disclosure">
            <div className="starter-remix__configuration">
              <section aria-labelledby="starter-remix-run-configuration">
                <header>
                  <p>Run configuration</p>
                  <h3 id="starter-remix-run-configuration">Editable now</h3>
                </header>
                <label className="starter-remix-control">
                  <span><strong>Seed</strong><em>Deterministic seed for the fresh derivative run.</em></span>
                  <input
                    type="text"
                    value={seedInput}
                    aria-invalid={Boolean(fieldErrors.seed)}
                    aria-describedby={fieldErrors.seed ? "starter-remix-seed-error" : undefined}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSeedInput(value);
                      onMeaningfulChange(true);
                      if (!value.trim()) {
                        setFieldError("seed", "Seed is required.");
                        return;
                      }
                      updateDraft("seed", (current) => patchScenarioMetadata(current, { seed: value }));
                    }}
                    suppressHydrationWarning
                  />
                  {fieldErrors.seed ? <small id="starter-remix-seed-error" role="alert">{fieldErrors.seed}</small> : null}
                </label>
                <label className="starter-remix-control">
                  <span><strong>Initialization preset</strong><em>Template-owned initial-state recipe.</em></span>
                  <select
                    value={draft.initializationPreset}
                    onChange={(event) => {
                      if (updateDraft("initializationPreset", (current) => updateScenarioPreset(current, event.target.value))) {
                        clearRemountedFieldErrors();
                        setResetRevision((revision) => revision + 1);
                      }
                    }}
                    suppressHydrationWarning
                  >
                    {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                  </select>
                </label>
                <label className="starter-remix-control">
                  <span><strong>Behavior mode</strong><em>Bounded behavior variant implemented by this template.</em></span>
                  <select
                    value={draft.behaviorMode}
                    onChange={(event) => {
                      if (updateDraft("behaviorMode", (current) => patchScenarioVariantOptions(current, { behaviorMode: event.target.value }))) {
                        clearRemountedFieldErrors();
                        setResetRevision((revision) => revision + 1);
                      }
                    }}
                    suppressHydrationWarning
                  >
                    {behaviorModes.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
                  </select>
                </label>
              </section>

              {remainingParameters.length > 0 ? (
                <RemixParameterGroup
                  key={`${resetRevision}:parameters`}
                  title="Template parameters"
                  definitions={remainingParameters}
                  values={draft.parameters}
                  errors={fieldErrors}
                  errorPrefix="parameters"
                  onRawChange={() => onMeaningfulChange(true)}
                  onValidationError={setFieldError}
                  onChange={(key, value) => updateParameterGroup("parameters", key, value)}
                />
              ) : null}
              {activePreset?.optionDefinitions?.length ? (
                <RemixParameterGroup
                  key={`${resetRevision}:${draft.initializationPreset}:initialization`}
                  title="Initialization options"
                  definitions={activePreset.optionDefinitions}
                  values={draft.initializationOptions}
                  errors={fieldErrors}
                  errorPrefix="initializationOptions"
                  onRawChange={() => onMeaningfulChange(true)}
                  onValidationError={setFieldError}
                  onChange={(key, value) => updateParameterGroup("initializationOptions", key, value)}
                />
              ) : null}
              {compositionDefinitions.length > 0 ? (
                <RemixParameterGroup
                  key={`${resetRevision}:composition`}
                  title="Agent composition"
                  definitions={compositionDefinitions}
                  values={draft.agentComposition}
                  errors={fieldErrors}
                  errorPrefix="agentComposition"
                  onRawChange={() => onMeaningfulChange(true)}
                  onValidationError={setFieldError}
                  onChange={(key, value) => updateParameterGroup("agentComposition", key, value)}
                />
              ) : null}
              {environmentDefinitions.length > 0 ? (
                <RemixParameterGroup
                  key={`${resetRevision}:environment`}
                  title="Environment options"
                  definitions={environmentDefinitions}
                  values={draft.environmentOptions}
                  errors={fieldErrors}
                  errorPrefix="environmentOptions"
                  onRawChange={() => onMeaningfulChange(true)}
                  onValidationError={setFieldError}
                  onChange={(key, value) => updateParameterGroup("environmentOptions", key, value)}
                />
              ) : null}
            </div>
          </Disclosure>
        </div>

        <aside className="starter-remix__context" aria-label="Remix structure and launch status">
          <section>
            <p>Model structure</p>
            <h3>Fixed in this remix</h3>
            <dl>
              <div><dt>Template</dt><dd>{template.name}</dd></div>
              <div><dt>Entities</dt><dd>{world.anatomy.entities?.join(", ") ?? "Template-defined entities"}</dd></div>
              <div><dt>Space</dt><dd>{template.spaceDefinition?.type ?? "Template-defined"}</dd></div>
              <div><dt>Rules and metrics</dt><dd>Owned by {template.id}; not authored here</dd></div>
            </dl>
          </section>
          <section>
            <p>Not part of S1</p>
            <h3>Future composition</h3>
            <ul>
              <li>Adding or wiring arbitrary entities and rules</li>
              <li>Combining templates or Builder graph nodes</li>
              <li>Executing schemas, formulas, scripts, or custom code</li>
            </ul>
          </section>
          <section className="starter-remix__validation" aria-live="polite">
            <p>Draft check</p>
            <h3>{canRun ? "Ready for a fresh local run" : "Draft needs attention"}</h3>
            {status ? <span>{status}</span> : null}
            {errorMessages.length > 0 ? (
              <ul>{errorMessages.map((error) => <li key={error}>{error}</li>)}</ul>
            ) : (
              <span>Scenario and template contracts accept the current derivative. This is software readiness, not scientific validation.</span>
            )}
            {launchError ? <strong role="alert">{launchError}</strong> : null}
          </section>
          <div className="starter-remix__actions">
            <button type="button" onClick={resetToSource} suppressHydrationWarning>Reset to source</button>
            <button type="button" className="starter-remix__run" onClick={runRemix} disabled={!canRun} suppressHydrationWarning>
              Run Remix
            </button>
          </div>
          <p className="starter-remix__boundary">
            Run Remix creates a fresh tick-0 run through the existing {template.id === "flocking-boids" ? "Worker" : "main-thread"} template path. It does not modify the Starter or save this draft.
          </p>
          <Link href={`/worlds/${world.slug}`}>Review source Starter</Link>
        </aside>
      </fieldset>
    </div>
  );
}

function RemixParameterGroup({
  title,
  definitions,
  values,
  errors,
  errorPrefix,
  onRawChange,
  onValidationError,
  onChange
}: {
  title: string;
  definitions: readonly ParameterDefinition[];
  values: ParameterValues;
  errors: FieldErrors;
  errorPrefix: string;
  onRawChange: () => void;
  onValidationError: (field: string, error: string | null) => void;
  onChange: (key: string, value: JsonValue) => void;
}) {
  return (
    <section className="starter-remix__parameter-group">
      <h4>{title}</h4>
      {definitions.map((definition) => {
        const field = `${errorPrefix}.${definition.key}`;
        return (
          <RemixParameterControl
            key={definition.key}
            controlId={`starter-remix-${errorPrefix}-${definition.key}`}
            definition={definition}
            value={values[definition.key] ?? definition.defaultValue}
            error={errors[field]}
            onRawChange={onRawChange}
            onValidationError={(error) => onValidationError(field, error)}
            onChange={(value) => onChange(definition.key, value)}
          />
        );
      })}
    </section>
  );
}

function RemixParameterControl({
  controlId,
  definition,
  value,
  error,
  onRawChange,
  onValidationError,
  onChange
}: {
  controlId?: string;
  definition: ParameterDefinition;
  value: JsonValue;
  error?: string;
  onRawChange: () => void;
  onValidationError: (error: string | null) => void;
  onChange: (value: JsonValue) => void;
}) {
  const generatedId = `starter-remix-${definition.key.replace(/[^A-Za-z0-9_-]/g, "-")}`;
  const id = controlId ?? generatedId;
  const errorId = `${id}-error`;
  const [rawValue, setRawValue] = useState(String(value));
  const observedValueRef = useRef(value);

  useEffect(() => {
    if (Object.is(observedValueRef.current, value)) {
      return;
    }
    observedValueRef.current = value;
    setRawValue(String(value));
  }, [value]);

  if (definition.type === "boolean") {
    return (
      <label className="starter-remix-control starter-remix-control--boolean" htmlFor={id}>
        <span><strong>{definition.label}</strong><em>{definition.description}</em></span>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => {
            onRawChange();
            onValidationError(null);
            onChange(event.target.checked);
          }}
          suppressHydrationWarning
        />
      </label>
    );
  }

  if (definition.type === "select") {
    return (
      <label className="starter-remix-control" htmlFor={id}>
        <span><strong>{definition.label}</strong><em>{definition.description}</em></span>
        <select
          id={id}
          value={String(value)}
          onChange={(event) => {
            const option = definition.options?.find((candidate) => String(candidate) === event.target.value);
            if (option === undefined) {
              onValidationError("Choose one of the template-defined options.");
              return;
            }
            onRawChange();
            onValidationError(null);
            onChange(option);
          }}
          suppressHydrationWarning
        >
          {(definition.options ?? []).map((option) => <option key={String(option)} value={String(option)}>{String(option)}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="starter-remix-control" htmlFor={id}>
      <span><strong>{definition.label}</strong><em>{definition.description}</em></span>
      <input
        id={id}
        type="number"
        min={definition.min}
        max={definition.max}
        step={definition.step ?? (definition.type === "integer" ? 1 : 0.1)}
        value={rawValue}
        aria-label={`${definition.label} numeric value`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          const raw = event.target.value;
          setRawValue(raw);
          onRawChange();
          const parsed = parseNumericParameter(definition, raw);
          if (!parsed.ok) {
            onValidationError(parsed.message);
            return;
          }
          onValidationError(null);
          onChange(parsed.value);
        }}
        suppressHydrationWarning
      />
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
