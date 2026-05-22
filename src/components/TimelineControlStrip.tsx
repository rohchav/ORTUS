"use client";

import { IconButton } from "./ui/IconButton";
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

  return (
    <div className="timeline-strip" aria-label="Simulation playback controls">
      <div className="timeline-strip__buttons">
        <IconButton label={isRunning ? "Pause simulation" : "Play simulation"} icon={isRunning ? "Ⅱ" : "▶"} onClick={toggleRunning} active={isRunning} />
        <IconButton label="Step exactly one tick" icon="→" onClick={stepOnce} />
        <IconButton label="Reset from current model, parameters, and seed" icon="↻" onClick={reset} />
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
    </div>
  );
}
