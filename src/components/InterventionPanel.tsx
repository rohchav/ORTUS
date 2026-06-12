"use client";

import { useEffect, useMemo, useState } from "react";
import type { JsonValue, ParameterDefinition, ParameterValues } from "../simulation";
import { getInterventionDefinitions } from "../simulation";
import { formatNumber } from "../lib/format";
import { useSimulationStore } from "../state/simulationStore";
import { CornerFramePanel } from "./ui/CornerFramePanel";

interface InterventionPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function InterventionPanel({ collapsed = false, onToggle }: InterventionPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
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

  const targetStatus = targetSummary(selectedDefinition?.targetType, selectedEntityId, targetPoint, targetCell);
  const targetReady = isTargetReady(selectedDefinition?.targetType, selectedEntityId, targetPoint, targetCell);
  const parameterError = selectedDefinition ? interventionParameterError(selectedDefinition.parameterDefinitions, parameters) : null;

  return (
    <CornerFramePanel title="Interventions" eyebrow="Perturb" variant="compact" collapsed={collapsed} onToggle={onToggle}>
      <div className="intervention-panel">
        <p className="intervention-panel__note">
          Interventions apply immediately through engine-validated commands. They do not advance time; the next normal step continues from the perturbed state.
        </p>
        {definitions.length > 0 && selectedDefinition ? (
          <>
            <label className="intervention-field">
              <span>Intervention</span>
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
          </>
        ) : (
          <p className="microcopy">No interventions are registered for this template.</p>
        )}
        <InterventionHistory history={history} onClear={clearInterventions} />
      </div>
    </CornerFramePanel>
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
        <span>Recent interventions</span>
        <button type="button" onClick={onClear} disabled={history.length === 0} suppressHydrationWarning>
          Clear
        </button>
      </div>
      {history.length === 0 ? (
        <p className="microcopy">No interventions applied yet.</p>
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

function isTargetReady(
  targetType: string | undefined,
  selectedEntityId: string | null,
  point: { x: number; y: number } | null,
  gridCell: { row: number; col: number } | null
): boolean {
  if (!targetType || targetType === "none") {
    return true;
  }
  if (targetType === "selectedEntity") {
    return Boolean(selectedEntityId);
  }
  if (targetType === "worldPoint" || targetType === "radius") {
    return Boolean(point || selectedEntityId);
  }
  if (targetType === "gridCell") {
    return Boolean(gridCell);
  }
  return false;
}

function targetSummary(
  targetType: string | undefined,
  selectedEntityId: string | null,
  point: { x: number; y: number } | null,
  gridCell: { row: number; col: number } | null
): string {
  if (!targetType || targetType === "none") {
    return "No target required";
  }
  if (targetType === "selectedEntity") {
    return selectedEntityId ? `Selected entity ${selectedEntityId}` : "No entity selected";
  }
  if (targetType === "gridCell") {
    return gridCell ? `Cell ${gridCell.row}, ${gridCell.col}` : "No grid cell selected";
  }
  if (point) {
    return `Point ${formatNumber(point.x, 1)}, ${formatNumber(point.y, 1)}`;
  }
  return selectedEntityId ? `Selected entity ${selectedEntityId}` : "No point selected";
}
