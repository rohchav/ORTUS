"use client";

import type { JsonValue, ParameterDefinition, ParameterValues } from "../simulation";
import { formatNumber } from "../lib/format";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface ParameterPanelProps {
  includeKeys?: readonly string[];
  excludeKeys?: readonly string[];
  highlightedKey?: string;
  showNote?: boolean;
  ariaLabel?: string;
  searchQuery?: string;
  values: ParameterValues;
  activeValues: ParameterValues;
  onDraftChange: (key: string, value: JsonValue) => void;
}

export function ParameterPanel({
  includeKeys,
  excludeKeys = [],
  highlightedKey,
  showNote = false,
  ariaLabel = "Model parameters",
  searchQuery = "",
  values,
  activeValues,
  onDraftChange
}: ParameterPanelProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const includeOrder = new Map(includeKeys?.map((key, index) => [key, index]));
  const definitions = getTemplateDescriptor(selectedTemplateId).template.parameterDefinitions
    .filter((definition) => {
      if ((includeKeys && !includeKeys.includes(definition.key)) || excludeKeys.includes(definition.key)) {
        return false;
      }
      return !normalizedSearch || `${definition.label} ${definition.key} ${definition.description}`.toLowerCase().includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (!includeOrder) {
        return 0;
      }
      return (includeOrder.get(left.key) ?? Number.MAX_SAFE_INTEGER) - (includeOrder.get(right.key) ?? Number.MAX_SAFE_INTEGER);
    });

  const controls = definitions.map((definition) => (
    <ParameterControl
      key={definition.key}
      definition={definition}
      value={values[definition.key] ?? definition.defaultValue}
      activeValue={activeValues[definition.key] ?? definition.defaultValue}
      onChange={(value) => onDraftChange(definition.key, value)}
      highlighted={definition.key === highlightedKey}
    />
  ));

  return (
    <div className="parameter-panel" aria-label={ariaLabel}>
      {showNote ? (
        <p className="parameter-panel__note">
          Parameter edits remain drafts until you explicitly rebuild. Rebuild uses template parameter checks, and unsupported combinations are rejected before the engine is replaced.
        </p>
      ) : null}
      {controls.length > 0 ? controls : <p className="parameter-panel__empty">No parameters match this search.</p>}
    </div>
  );
}

function ParameterControl({
  definition,
  value,
  activeValue,
  onChange,
  highlighted
}: {
  definition: ParameterDefinition;
  value: JsonValue;
  activeValue: JsonValue;
  onChange: (value: JsonValue) => void;
  highlighted: boolean;
}) {
  const activeStatus = formatActiveStatus(definition, value, activeValue);

  if (definition.type === "boolean") {
    return (
      <label className={`parameter-control parameter-control--boolean${highlighted ? " is-highlighted" : ""}`}>
        <span>
          <strong>{definition.label}</strong>
          <em>{definition.description}</em>
        </span>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} suppressHydrationWarning />
        <span className="parameter-control__mode">{activeStatus}</span>
      </label>
    );
  }

  if (definition.type === "select") {
    return (
      <label className={`parameter-control${highlighted ? " is-highlighted" : ""}`}>
        <span className="parameter-control__head">
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
        <span className="parameter-control__mode">{activeStatus}</span>
      </label>
    );
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  const min = definition.min ?? 0;
  const max = definition.max ?? Math.max(100, numericValue);
  const step = definition.step ?? (definition.type === "integer" ? 1 : 0.1);
  const commit = (next: number) => onChange(definition.type === "integer" ? Math.round(next) : next);
  const isUnitInterval = min === 0 && max === 1;

  return (
    <label className={`parameter-control${highlighted ? " is-highlighted" : ""}`}>
      <span className="parameter-control__head">
        <strong>{definition.label}</strong>
        <b>{formatParameterValue(numericValue, isUnitInterval)}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={numericValue} onChange={(event) => commit(Number(event.target.value))} suppressHydrationWarning />
      <span className="parameter-control__meta">
        <em>
          {definition.description} Range {formatNumber(min, 3)} to {formatNumber(max, 3)}.
        </em>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(event) => commit(Number(event.target.value))}
          aria-label={`${definition.label} numeric value`}
          suppressHydrationWarning
        />
      </span>
      <span className="parameter-control__mode">{activeStatus}</span>
    </label>
  );
}

function formatActiveStatus(definition: ParameterDefinition, draftValue: JsonValue, activeValue: JsonValue): string {
  const displayValue =
    definition.type === "number" || definition.type === "integer"
      ? formatParameterValue(Number(activeValue), definition.min === 0 && definition.max === 1)
      : String(activeValue);
  return Object.is(draftValue, activeValue)
    ? `Active run: ${displayValue}. Draft matches.`
    : `Active run: ${displayValue}. Draft pending.`;
}

function formatParameterValue(value: number, asPercent: boolean): string {
  if (!asPercent) {
    return formatNumber(value, 3);
  }
  return `${formatNumber(value, 3)} / ${formatNumber(value * 100, 1)}%`;
}
