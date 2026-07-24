"use client";

import { useEffect, useMemo, useState } from "react";
import type { JsonValue, ParameterDefinition, ParameterValues } from "../simulation";
import { getInterventionDefinitions } from "../simulation";
import { formatNumber } from "../lib/format";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import {
  deriveActiveInterventionReadiness,
  describeInterventionTarget,
  isInterventionTargetReady,
  type ActiveInterventionReadiness
} from "./activeInterventionReadiness";
import { Disclosure } from "./ui/Disclosure";
import { StatusPill } from "./ui/StatusPill";

interface InterventionPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onOpenSetup?: () => void;
}

export function InterventionPanel({ onOpenSetup }: InterventionPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const engine = useSimulationStore((state) => state.engine);
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const targetPoint = useSimulationStore((state) => state.interventionTargetPoint);
  const targetCell = useSimulationStore((state) => state.interventionTargetCell);
  const history = useSimulationStore((state) => state.interventionHistory);
  const applyIntervention = useSimulationStore((state) => state.applyIntervention);
  const clearInterventions = useSimulationStore((state) => state.clearInterventions);
  const definitions = useMemo(() => getInterventionDefinitions(selectedTemplateId), [selectedTemplateId]);
  const [selectedInterventionId, setSelectedInterventionId] = useState(definitions[0]?.id ?? "");
  const selectedDefinition = definitions.find((definition) => definition.id === selectedInterventionId) ?? definitions[0];
  const [parameters, setParameters] = useState<ParameterValues>(() => defaultInterventionParameters(selectedDefinition?.parameterDefinitions ?? []));

  useEffect(() => {
    const nextId = definitions[0]?.id ?? "";
    setSelectedInterventionId(nextId);
    setParameters(defaultInterventionParameters(definitions[0]?.parameterDefinitions ?? []));
  }, [definitions]);

  useEffect(() => {
    setParameters(defaultInterventionParameters(selectedDefinition?.parameterDefinitions ?? []));
  }, [selectedDefinition]);

  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const readiness = useMemo(
    () =>
      deriveActiveInterventionReadiness({
        selectedTemplateId,
        template: descriptor.template,
        templateLabel: descriptor.template.name,
        definitions,
        selectedInterventionId: selectedDefinition?.id,
        selectedEntityId,
        targetPoint,
        targetCell,
        hasActiveEngine: Boolean(engine),
        activeInterventionCount: history.length
      }),
    [definitions, descriptor.template, engine, history.length, selectedDefinition?.id, selectedEntityId, selectedTemplateId, targetCell, targetPoint]
  );
  const targetStatus = readiness.selectedTarget?.targetStatusLabel ?? describeInterventionTarget(selectedDefinition?.targetType, selectedEntityId, targetPoint, targetCell);
  const targetReady = readiness.selectedTarget?.targetReady ?? isInterventionTargetReady(selectedDefinition?.targetType, selectedEntityId, targetPoint, targetCell);
  const parameterError = selectedDefinition ? interventionParameterError(selectedDefinition.parameterDefinitions, parameters) : null;
  const latestEntry = history.at(-1);

  return (
    <div className="intervention-panel world-task-view">
      <div className="world-change-kind" data-change-kind="live">
        <strong>Live change</strong>
        <span>Applies to the current run through engine-checked commands without advancing time.</span>
      </div>
      <section className="world-tool-section" aria-labelledby="available-live-changes-title">
        <div className="world-tool-section__head">
          <h3 id="available-live-changes-title">Available live changes</h3>
          <StatusPill
            label={readiness.readiness.availabilityStatus.label}
            tone={readiness.readiness.availabilityStatus.tone}
            category={readiness.readiness.availabilityStatus.category}
            state={readiness.readiness.availabilityStatus.state}
            description={readiness.readiness.availabilityStatus.description}
            size="compact"
          />
        </div>
        {definitions.length > 0 && selectedDefinition ? (
          <>
            <label className="intervention-field">
              <span>Intervention type</span>
              <select value={selectedDefinition.id} onChange={(event) => setSelectedInterventionId(event.target.value)} suppressHydrationWarning>
                {definitions.map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="intervention-description">{selectedDefinition.description}</p>
            <div className={`intervention-target ${targetReady ? "is-ready" : ""}`}>
              <span>Target</span>
              <strong>{targetStatus}</strong>
            </div>
            <div className="intervention-params">
              {selectedDefinition.parameterDefinitions.map((definition) => (
                <InterventionParameter
                  key={definition.key}
                  definition={definition}
                  value={parameters[definition.key] ?? definition.defaultValue}
                  onChange={(value) => setParameters((current) => ({ ...current, [definition.key]: value }))}
                />
              ))}
            </div>
            <button
              type="button"
              className="intervention-apply"
              onClick={() => applyIntervention(selectedDefinition.id, parameters)}
              disabled={!targetReady || parameterError !== null}
              suppressHydrationWarning
            >
              Apply {selectedDefinition.label}
            </button>
            {!targetReady ? <p className="microcopy">Select the required target in the World Stage before applying.</p> : null}
            {parameterError ? <p className="microcopy intervention-error">{parameterError}</p> : null}
            <p className="world-interpretation-note">
              This action changes model state in this run. It does not establish real-world effectiveness or causal proof.
            </p>
          </>
        ) : (
          <div className="world-empty-state">
            <p>This world has no current-run change for the present template.</p>
            {onOpenSetup ? <button type="button" onClick={onOpenSetup}>Open Setup changes</button> : null}
          </div>
        )}
      </section>
      {latestEntry ? (
        <p className={`world-action-feedback ${latestEntry.status === "failed" ? "is-failed" : ""}`} role="status">
          {latestEntry.status === "failed" ? "Change failed" : "Change applied"}: {latestEntry.label} at tick {latestEntry.tickApplied}.
        </p>
      ) : null}
      {definitions.length > 0 && onOpenSetup ? (
        <div className="world-setup-change-link">
          <div>
            <strong>Setup change</strong>
            <span>Parameter and seed changes rebuild a fresh run at tick 0.</span>
          </div>
          <button type="button" onClick={onOpenSetup}>Open Setup</button>
        </div>
      ) : null}
      <Disclosure expandLabel="Intervention details" collapseLabel="Hide intervention details" className="world-technical-disclosure">
        <InterventionReadinessView context={readiness} />
      </Disclosure>
      <InterventionHistory history={history} onClear={clearInterventions} />
    </div>
  );
}

function InterventionReadinessView({ context }: { context: ActiveInterventionReadiness }) {
  const { readiness, selectedTarget, boundary } = context;

  return (
    <section className="intervention-readiness" aria-labelledby="intervention-readiness-heading">
      <div className="intervention-readiness__heading">
        <h3 id="intervention-readiness-heading">Intervention Readiness</h3>
        <StatusPill
          label={readiness.availabilityStatus.label}
          tone={readiness.availabilityStatus.tone}
          category={readiness.availabilityStatus.category}
          state={readiness.availabilityStatus.state}
          description={readiness.availabilityStatus.description}
          size="compact"
        />
      </div>

      <p className="microcopy">{readiness.readinessCopy}</p>
      <p className="microcopy">{readiness.modelBoundaryCopy}</p>

      <dl className="intervention-readiness__facts">
        <ReadinessFact label="Model" value={readiness.templateLabel} />
        <ReadinessFact label="Mode" value={readiness.worldModeLabel} />
        <ReadinessFact label="Controls" value={readiness.registeredControlLabel} />
        <ReadinessFact label="Selected" value={readiness.selectedControlLabel} />
        <ReadinessFact label="Timing" value={readiness.applicationTimingLabel} />
        <ReadinessFact label="Runtime path" value={readiness.runtimePathLabel} />
        <ReadinessFact label="Current run" value={readiness.activeRunRecordLabel} />
      </dl>

      {selectedTarget ? (
        <div className="intervention-readiness__subsection" aria-label="Selected intervention target">
          <div className="intervention-readiness__subhead">
            <h4>Selected Control Boundary</h4>
            <StatusPill
              label={selectedTarget.availabilityStatus.label}
              tone={selectedTarget.availabilityStatus.tone}
              category={selectedTarget.availabilityStatus.category}
              state={selectedTarget.availabilityStatus.state}
              description={selectedTarget.availabilityStatus.description}
              size="compact"
            />
          </div>
          <dl className="intervention-readiness__facts intervention-readiness__facts--compact">
            <ReadinessFact label="Target kind" value={selectedTarget.targetKindLabel} />
            <ReadinessFact label="Current target" value={selectedTarget.targetStatusLabel} />
            <ReadinessFact label="Parameters" value={selectedTarget.parameterSummaryLabel} />
            <ReadinessFact label="Mutation scope" value={selectedTarget.mutatesLabel} />
          </dl>
          <p className="microcopy">{selectedTarget.documentation}</p>
        </div>
      ) : null}

      <div className="intervention-readiness__subsection" aria-label="Intervention interpretation boundary">
        <div className="intervention-readiness__subhead">
          <h4>Intervention Boundary</h4>
          <StatusPill
            label={boundary.evidenceStatus.label}
            tone={boundary.evidenceStatus.tone}
            category={boundary.evidenceStatus.category}
            state={boundary.evidenceStatus.state}
            description={boundary.evidenceStatus.description}
            size="compact"
          />
        </div>
        <p className="microcopy">{boundary.responseBoundaryCopy}</p>
        <ul className="intervention-readiness__boundary-list">
          {boundary.claimBoundaries.map((claim) => (
            <li key={claim}>{claim}</li>
          ))}
        </ul>
        <p className="microcopy">{readiness.persistenceBoundaryLabel}</p>
        <p className="microcopy">{readiness.labBoundaryLabel}</p>
        <p className="microcopy">{readiness.atlasBoundaryLabel}</p>
      </div>
    </section>
  );
}

function ReadinessFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function InterventionParameter({
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
      <label className="intervention-field intervention-field--inline">
        <span>{definition.label}</span>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} suppressHydrationWarning />
      </label>
    );
  }
  if (definition.type === "select") {
    return (
      <label className="intervention-field">
        <span>{definition.label}</span>
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
  const step = definition.step ?? (definition.type === "integer" ? 1 : 0.1);
  const commit = (next: number) => onChange(definition.type === "integer" ? Math.round(next) : next);
  return (
    <label className="intervention-field">
      <span>
        {definition.label} <b>{formatNumber(numericValue, 3)}</b>
      </span>
      <input
        type="number"
        min={definition.min}
        max={definition.max}
        step={step}
        value={Number.isFinite(numericValue) ? numericValue : ""}
        onChange={(event) => commit(Number(event.target.value))}
        aria-label={`${definition.label} intervention value`}
        suppressHydrationWarning
      />
      <em>{definition.description}</em>
    </label>
  );
}

function InterventionHistory({
  history,
  onClear
}: {
  history: ReturnType<typeof useSimulationStore.getState>["interventionHistory"];
  onClear: () => void;
}) {
  return (
    <div className="intervention-history">
      <div className="intervention-history__head">
        <span>Current run intervention entries</span>
        <button type="button" onClick={onClear} disabled={history.length === 0} suppressHydrationWarning>
          Clear entries
        </button>
      </div>
      {history.length === 0 ? (
        <p className="microcopy">No interventions applied in the current run yet.</p>
      ) : (
        <ol>
          {history.slice(-6).reverse().map((record) => (
            <li key={record.id} className={record.status === "failed" ? "is-failed" : ""}>
              <strong>{record.label}</strong>
              <span>
                tick {record.tickApplied} · {record.targetSummary}
              </span>
              {record.error ? <em>{record.error}</em> : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function defaultInterventionParameters(definitions: readonly ParameterDefinition[]): ParameterValues {
  return Object.fromEntries(definitions.map((definition) => [definition.key, definition.defaultValue]));
}

function interventionParameterError(definitions: readonly ParameterDefinition[], parameters: ParameterValues): string | null {
  for (const definition of definitions) {
    const value = parameters[definition.key] ?? definition.defaultValue;
    const issue = parameterIssue(definition, value);
    if (issue) {
      return issue;
    }
  }
  return null;
}

function parameterIssue(definition: ParameterDefinition, value: JsonValue): string | null {
  if (definition.type === "boolean") {
    return typeof value === "boolean" ? null : `${definition.label} must be true or false.`;
  }
  if (definition.type === "select") {
    const allowed = definition.options ?? [];
    return allowed.some((option) => option === value) ? null : `${definition.label} must use one of the listed options.`;
  }
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return `${definition.label} must be a finite number.`;
  }
  if (definition.type === "integer" && !Number.isInteger(numericValue)) {
    return `${definition.label} must be an integer.`;
  }
  if (definition.min !== undefined && numericValue < definition.min) {
    return `${definition.label} must be at least ${formatNumber(definition.min, 3)}.`;
  }
  if (definition.max !== undefined && numericValue > definition.max) {
    return `${definition.label} must be no more than ${formatNumber(definition.max, 3)}.`;
  }
  return null;
}
