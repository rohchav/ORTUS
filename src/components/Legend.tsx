"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { formatNumber } from "../lib/format";
import { getTemplateDescriptor, legendEntries, legendNotes, renderNeuralDecisionReadout } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface LegendProps {
  collapsed?: boolean;
  floating?: boolean;
  onToggle?: () => void;
}

export function Legend({ collapsed, floating = true, onToggle }: LegendProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const latestSnapshot = useSimulationStore((state) => state.latestSnapshot);
  const panelState = useSimulationStore((state) => state.panelState);
  const togglePanel = useSimulationStore((state) => state.togglePanel);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const items = legendEntries(descriptor.id);
  const notes = legendNotes(descriptor.id);
  const neuralDecisionReadout = renderNeuralDecisionReadout(latestSnapshot);
  const isControlled = collapsed !== undefined || onToggle !== undefined;
  const isCollapsed = collapsed ?? !panelState.legend;
  const toggle = onToggle ?? (isControlled ? undefined : () => togglePanel("legend"));

  return (
    <div className={floating ? "legend-shell" : "legend-panel-shell"}>
      <CornerFramePanel title="Legend" eyebrow="Visual key" variant={floating ? "floating" : "compact"} collapsed={isCollapsed} onToggle={toggle}>
        <div className="legend-list">
          {items.map((item) => (
            <div key={item.label} className="legend-item">
              <span className="legend-symbol" style={{ background: item.color }}>
                {item.glyph}
              </span>
              <span>
                <strong>{item.label}</strong>
                <em>{item.description}</em>
              </span>
            </div>
          ))}
        </div>
        {notes.length > 0 ? (
          <div className="legend-notes" aria-label="Legend boundary notes">
            {notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        ) : null}
        {neuralDecisionReadout ? (
          <div className="decision-readout" aria-label="Neural Decision Readout">
            <div className="decision-readout__head">
              <span>Selected readout</span>
              <strong>{neuralDecisionReadout.enabled ? titleCase(neuralDecisionReadout.selected) : "Disabled"}</strong>
            </div>
            <div className="decision-readout__bars" aria-label="Output assembly activation">
              <span>Output assembly activation</span>
              {neuralDecisionReadout.choices.map((choice) => (
                <div key={choice.choice} className="decision-readout__bar">
                  <b>{choice.label}</b>
                  <i style={{ width: `${Math.min(100, Math.max(0, choice.activation / 5) * 100)}%` }} />
                  <em>{formatNumber(choice.activation, 3)}</em>
                </div>
              ))}
              {neuralDecisionReadout.choices.length === 0 ? <p>Decision Readout V1 is disabled for this run.</p> : null}
            </div>
            <div className="decision-readout__meta">
              <span>Confidence {formatNumber(neuralDecisionReadout.confidence, 3)}</span>
              <span>Margin {formatNumber(neuralDecisionReadout.winnerMargin, 3)}</span>
            </div>
            {neuralDecisionReadout.rps ? (
              <div className="decision-readout__payoff">
                <span>Observational payoff</span>
                <strong>{formatRpsPayoff(neuralDecisionReadout.rps.outcome, neuralDecisionReadout.rps.payoff)}</strong>
              </div>
            ) : null}
            <p>Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network.</p>
          </div>
        ) : null}
      </CornerFramePanel>
    </div>
  );
}

function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function formatRpsPayoff(outcome: string, payoff: number): string {
  if (outcome === "none") {
    return "None / 0";
  }
  return `${titleCase(outcome)} / ${formatNumber(payoff, 0)}`;
}
