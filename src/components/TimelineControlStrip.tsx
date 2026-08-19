"use client";

import { useEffect, useState } from "react";
import { formatNumber, formatTick } from "../lib/format";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

export function TimelineControlStrip() {
  const runtime = useActiveWorldRuntime();
  const { isRunning, speedMultiplier } = runtime;
  const [resetArmed, setResetArmed] = useState(false);
  const resetIsDestructive = runtime.tick > 0 || runtime.metricRecordCount > 1 || runtime.interventionCount > 0;

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
    void runtime.reset();
    setResetArmed(false);
  }

  return (
    <section className="timeline-strip" aria-label="Persistent simulation playback controls" data-workspace-region="runControlDock">
      <div className="timeline-strip__label">
        <span>Run Control</span>
        <strong>{runtime.state === "initializing" ? "Initializing" : runtime.state === "failed" ? "Stopped" : isRunning ? "Running" : "Paused"}</strong>
      </div>
      <div className="timeline-strip__buttons">
        <RunControlButton
          label={isRunning ? "Pause" : "Run"}
          icon={isRunning ? "Ⅱ" : "▶"}
          ariaLabel={isRunning ? "Pause simulation" : "Run simulation"}
          active={isRunning}
          onClick={runtime.toggleRunning}
          disabled={!runtime.isReady}
        />
        <RunControlButton label="Step" icon="→" ariaLabel="Step exactly one tick" onClick={() => void runtime.step()} disabled={!runtime.isReady || isRunning} />
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
          disabled={!runtime.isReady}
        />
      </div>
      <div className="timeline-strip__readout">
        <strong>{formatTick(runtime.tick)}</strong>
        <span>tick</span>
        <strong>{formatNumber(runtime.time, 1)}</strong>
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
          onChange={(event) => runtime.setSpeedMultiplier(Number(event.target.value))}
          disabled={!runtime.isReady}
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
  disabled = false,
  onClick
}: {
  label: string;
  icon: string;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`timeline-strip__button ${active ? "is-active" : ""}`}
      aria-label={ariaLabel}
      aria-pressed={active || undefined}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
    >
      <span aria-hidden="true">{icon}</span>
      <b>{label}</b>
    </button>
  );
}
