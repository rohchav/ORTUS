"use client";

import type { ReactNode } from "react";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { FieldNotesPanel } from "./FieldNotesPanel";
import { FileActions } from "./FileActions";
import { ExperimentPanel } from "./ExperimentPanel";
import { InterventionPanel } from "./InterventionPanel";
import { MacroPanel } from "./MacroPanel";
import { MetricGraphPanel } from "./MetricGraphPanel";
import { MicroPanel } from "./MicroPanel";
import { RunComparisonPanel } from "./RunComparisonPanel";
import { ScenarioBuilderPanel } from "./ScenarioBuilderPanel";
import { TimelineControlStrip } from "./TimelineControlStrip";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { getWorkspacePanelDefinition } from "../lib/workspacePanels";
import { useSimulationStore } from "../state/simulationStore";

export function LeftInstrumentStack() {
  const panelState = useSimulationStore((state) => state.panelState);
  const togglePanel = useSimulationStore((state) => state.togglePanel);

  return (
    <aside className="left-instruments" aria-label="Model instruments">
      <RailPanelSlot panelId="micro">
        <MicroPanel collapsed={!panelState.micro} onToggle={() => togglePanel("micro")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="macro">
        <MacroPanel collapsed={!panelState.macro} onToggle={() => togglePanel("macro")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="metrics">
        <MetricGraphPanel collapsed={!panelState.metrics} onToggle={() => togglePanel("metrics")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="scenarios">
        <ScenarioBuilderPanel collapsed={!panelState.scenarios} onToggle={() => togglePanel("scenarios")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="assumptions">
        <AssumptionsPanel collapsed={!panelState.assumptions} onToggle={() => togglePanel("assumptions")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="interventions">
        <InterventionPanel collapsed={!panelState.interventions} onToggle={() => togglePanel("interventions")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="experiments">
        <ExperimentPanel collapsed={!panelState.experiments} onToggle={() => togglePanel("experiments")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="comparisons">
        <RunComparisonPanel collapsed={!panelState.comparisons} onToggle={() => togglePanel("comparisons")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="timeline">
        <TimelineControlStrip />
      </RailPanelSlot>
      <RailPanelSlot panelId="notes">
        <FieldNotesPanel collapsed={!panelState.notes} onToggle={() => togglePanel("notes")} />
      </RailPanelSlot>
      <RailPanelSlot panelId="file">
        <CornerFramePanel title="File Exchange" eyebrow="JSON" variant="compact" collapsed={!panelState.file} onToggle={() => togglePanel("file")}>
          <FileActions />
        </CornerFramePanel>
      </RailPanelSlot>
    </aside>
  );
}

function RailPanelSlot({ panelId, children }: { panelId: string; children: ReactNode }) {
  const definition = getWorkspacePanelDefinition(panelId);

  return (
    <div
      className="rail-panel-slot"
      data-panel-id={panelId}
      data-default-placement={definition?.defaultPlacement ?? "leftRail"}
      data-supported-placements={definition?.supportedPlacements.join(" ") ?? "leftRail"}
      data-workspace-capable={definition?.workspaceCapable ? "true" : "false"}
    >
      {children}
    </div>
  );
}
