"use client";

import { AgentInspector } from "./AgentInspector";
import { useSimulationStore } from "../state/simulationStore";

export function RightContextDrawer() {
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const isOpen = Boolean(selectedEntityId);

  return (
    <aside
      className={`right-context-drawer ${isOpen ? "is-open" : ""}`}
      aria-label="Right context drawer"
      aria-hidden={!isOpen}
      data-workspace-region="rightDrawer"
      data-state={isOpen ? "open" : "closed"}
    >
      {isOpen ? <AgentInspector placement="drawer" /> : null}
    </aside>
  );
}
