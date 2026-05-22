"use client";

import { formatNumber, formatTick } from "../lib/format";
import { useSimulationStore } from "../state/simulationStore";

export function PhaseStateReadout() {
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const engine = useSimulationStore((state) => state.engine);
  const debug = engine?.debugData();
  const phase = debug?.systemExecutionLog.at(-1)?.phase ?? "ready";

  return (
    <div className="phase-readout" aria-label="Simulation time readout">
      <span>Tick {formatTick(snapshot?.tick ?? 0)}</span>
      <span>Time {formatNumber(snapshot?.time ?? 0, 1)}</span>
      <span>Phase {phase}</span>
    </div>
  );
}
