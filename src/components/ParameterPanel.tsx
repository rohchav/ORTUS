"use client";

import { useEffect, useState } from "react";
import type { JsonValue, ParameterDefinition } from "../simulation";
import { formatNumber } from "../lib/format";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

export function ParameterPanel() {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const parameterValues = useSimulationStore((state) => state.parameterValues);
  const setParameter = useSimulationStore((state) => state.setParameter);
  const definitions = getTemplateDescriptor(selectedTemplateId).template.parameterDefinitions;
  const [neuralAdvancedOpen, setNeuralAdvancedOpen] = useState(false);
  const isNeural = selectedTemplateId === "neural-excitation-network";

  useEffect(() => {
    if (!isNeural) {
      return;
    }
    function openAdvancedConfig() {
      setNeuralAdvancedOpen(true);
    }
    window.addEventListener("ortus:open-neural-advanced-config", openAdvancedConfig);
    return () => window.removeEventListener("ortus:open-neural-advanced-config", openAdvancedConfig);
  }, [isNeural]);

  const controls = definitions.map((definition) => (
    <ParameterControl
      key={definition.key}
      definition={definition}
      value={parameterValues[definition.key] ?? definition.defaultValue}
      onChange={(value) => setParameter(definition.key, value)}
    />
  ));

  if (isNeural) {
    return (
      <section className="parameter-panel parameter-panel--advanced" aria-label="Neural advanced configuration">
        <button
          id="neural-advanced-config-toggle"
          type="button"
          className="parameter-panel__advanced-toggle"
          aria-expanded={neuralAdvancedOpen}
          aria-controls="neural-advanced-config-panel"
          onClick={() => setNeuralAdvancedOpen((current) => !current)}
          suppressHydrationWarning
        >
          <span>Advanced config</span>
          <strong>{neuralAdvancedOpen ? "Hide exact parameters" : "Show exact parameters"}</strong>
        </button>
        <p className="parameter-panel__note">
          Parameter changes rebuild a fresh tick-0 run immediately through template validation. Invalid combinations are rejected before the engine is replaced.
          Neural Runtime Lab controls are shortcuts; this drawer keeps every exact parameter available.
        </p>
        {neuralAdvancedOpen ? (
          <div id="neural-advanced-config-panel" className="parameter-panel__advanced-body">
            {controls}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <div className="parameter-panel">
      <p className="parameter-panel__note">
        Parameter changes rebuild a fresh tick-0 run immediately through template validation. Invalid combinations are rejected before the engine is replaced.
      </p>
      {controls}
    </div>
  );
}

function ParameterControl({
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
      <label className="parameter-control parameter-control--boolean">
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
      <label className="parameter-control">
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
    <label className="parameter-control">
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
