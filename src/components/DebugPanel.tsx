"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { formatNumber } from "../lib/format";
import { useSimulationStore } from "../state/simulationStore";

interface DebugPanelProps {
  collapsed?: boolean;
  floating?: boolean;
  onToggle?: () => void;
  embedded?: boolean;
  active?: boolean;
}

export function DebugPanel({ collapsed, floating = false, onToggle, embedded = false, active = true }: DebugPanelProps) {
  const panelState = useSimulationStore((state) => state.panelState);
  const togglePanel = useSimulationStore((state) => state.togglePanel);
  const isControlled = collapsed !== undefined || onToggle !== undefined;
  const isCollapsed = collapsed ?? !panelState.debug;
  const toggle = onToggle ?? (isControlled ? undefined : () => togglePanel("debug"));

  if (embedded) {
    return <div className="debug-panel-embedded"><DebugPanelBody active={active} /></div>;
  }

  return (
    <div className={floating ? "debug-floating" : ""}>
      <CornerFramePanel title="Debug" eyebrow="Runtime" variant={floating ? "floating" : "compact"} collapsed={isCollapsed} onToggle={toggle}>
        <DebugPanelBody active={active} />
      </CornerFramePanel>
    </div>
  );
}

function DebugPanelBody({ active }: { active: boolean }) {
  const engine = useSimulationStore((state) => state.engine);
  const snapshot = useSimulationStore((state) => active ? state.latestSnapshot : null);
  const isRunning = useSimulationStore((state) => active && state.isRunning);
  const lastError = useSimulationStore((state) => state.lastError);
  const debug = engine?.debugData();
  const performance = engine?.performanceData();
  const latestTickSample = performance?.tickSamples.at(-1);

  return (
    <>
      <div className="debug-grid">
        <span>Template</span>
        <strong>{debug?.templateId ?? "none"}</strong>
        <span>Seed</span>
        <strong>{debug?.seed ?? "none"}</strong>
        <span>Tick</span>
        <strong>{snapshot?.tick ?? 0}</strong>
        <span>Time</span>
        <strong>{formatNumber(snapshot?.time ?? 0, 2)}</strong>
        <span>State</span>
        <strong>{isRunning ? "running" : "paused"}</strong>
        <span>Entities</span>
        <strong>{snapshot?.entities.filter((entity) => entity.alive).length ?? 0}</strong>
        <span>Last commands</span>
        <strong>{debug?.lastCommands.length ?? 0}</strong>
        <span>Last events</span>
        <strong>{debug?.lastEvents.length ?? 0}</strong>
        {performance?.enabled ? (
          <>
            <span>Step ms</span>
            <strong>{formatNumber(latestTickSample?.stepMs ?? 0, 3)}</strong>
            <span>Flocking checks</span>
            <strong>{formatNumber(latestTickSample?.counters.flockingPairwiseChecks ?? 0, 0)}</strong>
          </>
        ) : null}
      </div>
      {lastError ? <p className="debug-error">{lastError}</p> : null}
    </>
  );
}
