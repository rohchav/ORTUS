"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { formatNumber } from "../lib/format";
import { useSimulationStore } from "../state/simulationStore";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

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
  const runtime = useActiveWorldRuntime();
  const debug = engine?.debugData();
  const performance = engine?.performanceData();
  const latestTickSample = performance?.tickSamples.at(-1);
  const runtimeStep = runtime.uiProjection?.performance.measures.find((measure) => measure.name === "ortus.sim.step");

  return (
    <>
      <div className="debug-grid">
        <span>Template</span>
        <strong>{debug?.templateId ?? runtime.uiProjection?.templateId ?? "none"}</strong>
        <span>Seed</span>
        <strong>{debug?.seed ?? runtime.seed}</strong>
        <span>Tick</span>
        <strong>{active ? runtime.tick : 0}</strong>
        <span>Time</span>
        <strong>{formatNumber(active ? runtime.time : 0, 2)}</strong>
        <span>State</span>
        <strong>{active ? runtime.playback : "inactive"}</strong>
        <span>Execution</span>
        <strong>{runtime.executionKind}</strong>
        <span>Generation</span>
        <strong>{runtime.uiProjection?.generation ?? "legacy"}</strong>
        <span>Entities</span>
        <strong>{active ? runtime.entityCount : 0}</strong>
        <span>Last commands</span>
        <strong>{runtime.workerManaged ? "Not projected" : debug?.lastCommands.length ?? 0}</strong>
        <span>Last events</span>
        <strong>{runtime.workerManaged ? "Not projected" : debug?.lastEvents.length ?? 0}</strong>
        {runtimeStep ? (
          <>
            <span>Worker step p95 ms</span>
            <strong>{formatNumber(runtimeStep.p95Ms, 3)}</strong>
          </>
        ) : null}
        {performance?.enabled ? (
          <>
            <span>Step ms</span>
            <strong>{formatNumber(latestTickSample?.stepMs ?? 0, 3)}</strong>
            <span>Flocking checks</span>
            <strong>{formatNumber(latestTickSample?.counters.flockingPairwiseChecks ?? 0, 0)}</strong>
          </>
        ) : null}
      </div>
      {runtime.error ? <p className="debug-error">{runtime.error}</p> : null}
    </>
  );
}
