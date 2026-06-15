"use client";

import { useEffect, useState } from "react";
import { formatNumber, formatTick } from "../lib/format";
import { useSimulationStore } from "../state/simulationStore";

export function TimelineControlStrip() {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const toggleRunning = useSimulationStore((state) => state.toggleRunning);
  const stepOnce = useSimulationStore((state) => state.stepOnce);
  const reset = useSimulationStore((state) => state.reset);
  const speedMultiplier = useSimulationStore((state) => state.speedMultiplier);
  const setSpeedMultiplier = useSimulationStore((state) => state.setSpeedMultiplier);
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const interventionHistoryCount = useSimulationStore((state) => state.interventionHistory.length);
  const [resetArmed, setResetArmed] = useState(false);
  const metricHistoryCount = snapshot?.metricsHistory.length ?? 0;
  const resetIsDestructive = (snapshot?.tick ?? 0) > 0 || metricHistoryCount > 1 || interventionHistoryCount > 0;

  useEffect(() => {
    if (!resetIsDestructive) {
      setResetArmed(false);
    }
  }, [resetIsDestructive]);

  function handleReset() {
    if (resetIsDestructive && !resetArmed) {
      setResetArmed(true);
      return;
    }
    reset();
    setResetArmed(false);
  }

  return (
    <section className="timeline-strip" aria-label="Persistent simulation playback controls" data-workspace-region="runControlDock">
      <div className="timeline-strip__label">
        <span>Run Control</span>
        <strong>{isRunning ? "Running" : "Paused"}</strong>
      </div>
      <div className="timeline-strip__buttons">
        <RunControlButton
          label={isRunning ? "Pause" : "Run"}
          icon={isRunning ? "Ⅱ" : "▶"}
          ariaLabel={isRunning ? "Pause simulation" : "Run simulation"}
          active={isRunning}
          onClick={toggleRunning}
        />
        <RunControlButton label="Step" icon="→" ariaLabel="Step exactly one tick" onClick={stepOnce} />
        <RunControlButton
          label={resetArmed ? "Confirm Reset" : "Reset"}
          icon="↻"
          ariaLabel={
            resetArmed
              ? "Confirm reset and discard current run state"
              : resetIsDestructive
                ? "Prepare reset; current tick, metrics, selection, targets, and intervention history may be discarded"
                : "Reset from current model, parameters, and seed"
          }
          active={resetArmed}
          onClick={handleReset}
        />
      </div>
      <div className="timeline-strip__readout">
        <strong>{formatTick(snapshot?.tick ?? 0)}</strong>
        <span>tick</span>
        <strong>{formatNumber(snapshot?.time ?? 0, 1)}</strong>
        <span>time</span>
      </div>
      <label className="speed-control">
        <span>Speed {formatNumber(speedMultiplier, 2)}x</span>
        <input
          type="range"
          min="0.25"
          max="8"
          step="0.25"
          value={speedMultiplier}
          onChange={(event) => setSpeedMultiplier(Number(event.target.value))}
          suppressHydrationWarning
        />
      </label>
      {resetArmed ? (
        <p className="timeline-strip__warning" role="status">
          Confirm Reset to rebuild a fresh tick-0 run from the current model, parameters, and seed. Current tick, metric history, selection, targets, and
          intervention history will be cleared.
        </p>
      ) : null}
    </section>
  );
}

function RunControlButton({
  label,
  icon,
  ariaLabel,
  active = false,
  onClick
}: {
  label: string;
  icon: string;
  ariaLabel: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`timeline-strip__button ${active ? "is-active" : ""}`}
      aria-label={ariaLabel}
      aria-pressed={active || undefined}
      onClick={onClick}
      suppressHydrationWarning
    >
      <span aria-hidden="true">{icon}</span>
      <b>{label}</b>
    </button>
  );
}
