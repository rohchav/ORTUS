"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { DebugPanel } from "./DebugPanel";
import { FieldNotesPanel } from "./FieldNotesPanel";
import { FileActions } from "./FileActions";
import { ExperimentPanel } from "./ExperimentPanel";
import { InterventionPanel } from "./InterventionPanel";
import { Legend } from "./Legend";
import { MacroPanel } from "./MacroPanel";
import { MetricGraphPanel } from "./MetricGraphPanel";
import { MicroPanel } from "./MicroPanel";
import { RunSettingsPanel } from "./RunSettingsPanel";
import { RunComparisonPanel } from "./RunComparisonPanel";
import { ScenarioBuilderPanel } from "./ScenarioBuilderPanel";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getWorkspacePanelDefinition } from "../lib/workspacePanels";
import { getSimulationWorkspaceMode, simulationWorkspaceModes, type SimulationWorkspaceModeId } from "../lib/workspaceModes";

interface LeftInstrumentStackProps {
  activeMode: SimulationWorkspaceModeId;
  onModeChange: (mode: SimulationWorkspaceModeId) => void;
}

export function LeftInstrumentStack({ activeMode, onModeChange }: LeftInstrumentStackProps) {
  const mode = getSimulationWorkspaceMode(activeMode);

  function handleModeKeyDown(event: KeyboardEvent<HTMLButtonElement>, modeId: SimulationWorkspaceModeId) {
    const currentIndex = simulationWorkspaceModes.findIndex((candidate) => candidate.id === modeId);
    const lastIndex = simulationWorkspaceModes.length - 1;
    const nextIndex =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (currentIndex + 1) % simulationWorkspaceModes.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (currentIndex - 1 + simulationWorkspaceModes.length) % simulationWorkspaceModes.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? lastIndex
              : null;

    if (nextIndex === null) {
      return;
    }
    event.preventDefault();
    const nextMode = simulationWorkspaceModes[nextIndex]!;
    onModeChange(nextMode.id);
    focusModeTab(nextMode.id);
  }

  return (
    <aside className="left-instruments" aria-label="Simulation workspace tools">
      <nav className="workspace-navigator" aria-label="Simulation workspace modes" role="tablist">
        {simulationWorkspaceModes.map((candidate) => (
          <button
            key={candidate.id}
            id={`workspace-mode-tab-${candidate.id}`}
            type="button"
            role="tab"
            aria-selected={candidate.id === activeMode}
            aria-controls={`workspace-mode-panel-${candidate.id}`}
            className={candidate.id === activeMode ? "is-active" : ""}
            onClick={() => onModeChange(candidate.id)}
            onKeyDown={(event) => handleModeKeyDown(event, candidate.id)}
            suppressHydrationWarning
          >
            <span>{candidate.label}</span>
            <em>{candidate.eyebrow}</em>
          </button>
        ))}
      </nav>
      <section
        id={`workspace-mode-panel-${activeMode}`}
        className="workspace-context-panel"
        role="tabpanel"
        aria-labelledby={`workspace-mode-tab-${activeMode}`}
      >
        <header className="workspace-context-panel__head">
          <span>{mode.eyebrow}</span>
          <h2>{mode.label}</h2>
          <p>{mode.description}</p>
        </header>
        <div className="workspace-context-panel__scroll" data-intentional-scroll-region="workspace-context">
          {renderWorkspaceMode(activeMode)}
        </div>
      </section>
    </aside>
  );
}

function focusModeTab(modeId: SimulationWorkspaceModeId): void {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(`workspace-mode-tab-${modeId}`)?.focus();
  });
}

function renderWorkspaceMode(mode: SimulationWorkspaceModeId): ReactNode {
  switch (mode) {
    case "setup":
      return (
        <>
          <RailPanelSlot panelId="runSettings">
            <RunSettingsPanel />
          </RailPanelSlot>
          <RailPanelSlot panelId="scenarios">
            <ScenarioBuilderPanel />
          </RailPanelSlot>
        </>
      );
    case "understand":
      return (
        <>
          <RailPanelSlot panelId="assumptions">
            <AssumptionsPanel />
          </RailPanelSlot>
          <RailPanelSlot panelId="notes">
            <FieldNotesPanel />
          </RailPanelSlot>
        </>
      );
    case "observe":
      return (
        <>
          <RailPanelSlot panelId="macro">
            <MacroPanel />
          </RailPanelSlot>
          <RailPanelSlot panelId="micro">
            <MicroPanel />
          </RailPanelSlot>
          <RailPanelSlot panelId="metrics">
            <MetricGraphPanel />
          </RailPanelSlot>
          <RailPanelSlot panelId="legend">
            <Legend floating={false} collapsed={false} />
          </RailPanelSlot>
        </>
      );
    case "intervene":
      return (
        <RailPanelSlot panelId="interventions">
          <InterventionPanel />
        </RailPanelSlot>
      );
    case "experiment":
      return (
        <RailPanelSlot panelId="experiments">
          <ExperimentPanel />
        </RailPanelSlot>
      );
    case "compare":
      return (
        <>
          <RailPanelSlot panelId="comparisons">
            <RunComparisonPanel />
          </RailPanelSlot>
          <RailPanelSlot panelId="file">
            <CornerFramePanel title="Scenario/Snapshot Exchange" eyebrow="JSON artifacts" variant="compact">
              <FileActions />
            </CornerFramePanel>
          </RailPanelSlot>
        </>
      );
    case "debug":
      return (
        <RailPanelSlot panelId="debug">
          <DebugPanel collapsed={false} />
        </RailPanelSlot>
      );
  }
}

function RailPanelSlot({ panelId, children }: { panelId: string; children: ReactNode }) {
  const definition = getWorkspacePanelDefinition(panelId);

  return (
    <div
      className="rail-panel-slot"
      data-panel-id={panelId}
      data-default-placement={definition?.defaultPlacement ?? "modePanel"}
      data-supported-placements={definition?.supportedPlacements.join(" ") ?? "modePanel"}
      data-workspace-capable={definition?.workspaceCapable ? "true" : "false"}
    >
      {children}
    </div>
  );
}
