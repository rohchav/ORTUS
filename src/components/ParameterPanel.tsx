"use client";

import type { JsonValue, ParameterDefinition } from "../simulation";
import { formatNumber } from "../lib/format";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface ParameterPanelProps {
  includeKeys?: readonly string[];
  excludeKeys?: readonly string[];
  highlightedKey?: string;
  showNote?: boolean;
  ariaLabel?: string;
}

export function ParameterPanel({
  includeKeys,
  excludeKeys = [],
  highlightedKey,
  showNote = false,
  ariaLabel = "Model parameters"
}: ParameterPanelProps = {}) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const parameterValues = useSimulationStore((state) => state.parameterValues);
  const setParameter = useSimulationStore((state) => state.setParameter);
  const definitions = getTemplateDescriptor(selectedTemplateId).template.parameterDefinitions.filter(
    (definition) => (!includeKeys || includeKeys.includes(definition.key)) && !excludeKeys.includes(definition.key)
  );

  const controls = definitions.map((definition) => (
    <ParameterControl
      key={definition.key}
      definition={definition}
      value={parameterValues[definition.key] ?? definition.defaultValue}
      onChange={(value) => setParameter(definition.key, value)}
      highlighted={definition.key === highlightedKey}
    />
  ));

  return (
    <div className="parameter-panel" aria-label={ariaLabel}>
      {showNote ? (
        <p className="parameter-panel__note">
          Parameter changes rebuild a fresh tick-0 run through template parameter checks. Unsupported combinations are rejected before the engine is replaced.
        </p>
      ) : null}
      {controls}
    </div>
  );
}

function ParameterControl({
  definition,
  value,
  onChange,
  highlighted
}: {
  definition: ParameterDefinition;
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  highlighted: boolean;
}) {
  if (definition.type === "boolean") {
    return (
      <label className={`parameter-control parameter-control--boolean${highlighted ? " is-highlighted" : ""}`}>
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
      <span className="parameter-control__mode">{definition.liveUpdate ? "Rule parameter" : "Initial setup"}</span>
    </label>
  );
}

function formatParameterValue(value: number, asPercent: boolean): string {
  if (!asPercent) {
    return formatNumber(value, 3);
  }
  return `${formatNumber(value, 3)} / ${formatNumber(value * 100, 1)}%`;
}
