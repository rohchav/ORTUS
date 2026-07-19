"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { DebugPanel } from "./DebugPanel";
import { FileActions } from "./FileActions";
import { ExperimentPanel } from "./ExperimentPanel";
import { InterventionPanel } from "./InterventionPanel";
import { Legend } from "./Legend";
import { MacroPanel } from "./MacroPanel";
import { MetricGraphPanel } from "./MetricGraphPanel";
import { MicroPanel } from "./MicroPanel";
import { ModelExplanationPanel } from "./ModelExplanationPanel";
import { NeuralRuntimeLabPanel } from "./NeuralRuntimeLabPanel";
import { RunProvenanceObservationPanel } from "./RunProvenanceObservationPanel";
import { RunSettingsPanel } from "./RunSettingsPanel";
import { RunComparisonPanel } from "./RunComparisonPanel";
import { ScenarioBuilderPanel } from "./ScenarioBuilderPanel";
import { CapabilityGuidancePanel } from "./researchWorld/CapabilityGuidancePanel";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { Disclosure } from "./ui/Disclosure";
import { getWorkspacePanelDefinition } from "../lib/workspacePanels";
import { getSimulationWorkspaceMode, type SimulationWorkspaceModeId } from "../lib/workspaceModes";

interface LeftInstrumentStackProps {
  activeMode: SimulationWorkspaceModeId;
  onModeChange: (mode: SimulationWorkspaceModeId) => void;
}

export function LeftInstrumentStack({ activeMode, onModeChange }: LeftInstrumentStackProps) {
  const mode = getSimulationWorkspaceMode(activeMode);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreFocusRequest, setMoreFocusRequest] = useState(0);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const moreItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingMoreFocusIndexRef = useRef<number | null>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const focusPanelAfterChangeRef = useRef(false);
  const moreCurrent = moreModes.some((candidate) => candidate.id === activeMode);

  useEffect(() => {
    if (!moreOpen) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        pendingMoreFocusIndexRef.current = null;
        setMoreOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [moreOpen]);

  useEffect(() => {
    if (panelScrollRef.current) {
      panelScrollRef.current.scrollTop = 0;
    }
    if (!focusPanelAfterChangeRef.current) {
      return;
    }
    focusPanelAfterChangeRef.current = false;
    window.requestAnimationFrame(() => panelHeadingRef.current?.focus());
  }, [activeMode]);

  useEffect(() => {
    if (!moreOpen) {
      return;
    }
    const pendingIndex = pendingMoreFocusIndexRef.current;
    if (pendingIndex !== null) {
      moreItemRefs.current[pendingIndex]?.focus();
    }
  }, [moreFocusRequest, moreOpen]);

  function closeMoreMenu() {
    pendingMoreFocusIndexRef.current = null;
    setMoreOpen(false);
  }

  function focusMoreItem(index: number) {
    pendingMoreFocusIndexRef.current = index;
    setMoreOpen(true);
    setMoreFocusRequest((request) => request + 1);
  }

  function chooseMode(modeId: SimulationWorkspaceModeId, focusPanel = false) {
    focusPanelAfterChangeRef.current = focusPanel;
    onModeChange(modeId);
    closeMoreMenu();
    if (focusPanel && modeId === activeMode) {
      if (panelScrollRef.current) {
        panelScrollRef.current.scrollTop = 0;
      }
      focusPanelAfterChangeRef.current = false;
      window.requestAnimationFrame(() => panelHeadingRef.current?.focus());
    }
  }

  function handleMoreKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const nextIndex =
      event.key === "ArrowDown"
        ? (index + 1) % moreModes.length
        : event.key === "ArrowUp"
          ? (index - 1 + moreModes.length) % moreModes.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? moreModes.length - 1
              : null;

    if (nextIndex !== null) {
      event.preventDefault();
      pendingMoreFocusIndexRef.current = nextIndex;
      moreItemRefs.current[nextIndex]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMoreMenu();
      moreTriggerRef.current?.focus();
    }
  }

  return (
    <aside className="left-instruments" aria-label="Simulation workspace tools">
      <nav className="workspace-navigator" aria-label="World tasks">
        {directModes.map((candidate) => (
          <button
            key={candidate.id}
            id={`workspace-mode-control-${candidate.id}`}
            type="button"
            aria-pressed={candidate.id === activeMode}
            aria-controls="workspace-task-panel"
            className={candidate.id === activeMode ? "is-active" : ""}
            onClick={() => chooseMode(candidate.id)}
            suppressHydrationWarning
          >
            {candidate.label}
          </button>
        ))}
        <div className="workspace-more-menu" ref={moreRef}>
          <button
            ref={moreTriggerRef}
            type="button"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className={moreCurrent ? "is-active" : ""}
            data-current={moreCurrent ? "true" : "false"}
            onClick={() => {
              if (moreOpen) {
                closeMoreMenu();
              } else {
                setMoreOpen(true);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const pendingIndex = pendingMoreFocusIndexRef.current;
                const index =
                  pendingIndex === null
                    ? event.key === "ArrowDown"
                      ? 0
                      : moreModes.length - 1
                    : event.key === "ArrowDown"
                      ? (pendingIndex + 1) % moreModes.length
                      : (pendingIndex - 1 + moreModes.length) % moreModes.length;
                focusMoreItem(index);
              } else if (event.key === "Escape" && moreOpen) {
                event.preventDefault();
                closeMoreMenu();
              }
            }}
          >
            More
          </button>
          {moreOpen ? (
            <ul className="workspace-more-menu__popover" role="menu" aria-label="More World tasks">
              {moreModes.map((candidate, index) => (
                <li key={candidate.id} role="none">
                  <button
                    ref={(element) => {
                      moreItemRefs.current[index] = element;
                    }}
                    type="button"
                    role="menuitem"
                    aria-current={candidate.id === activeMode ? "page" : undefined}
                    onClick={() => chooseMode(candidate.id, true)}
                    onKeyDown={(event) => handleMoreKeyDown(event, index)}
                  >
                    <strong>{candidate.label}</strong>
                    <span>{candidate.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </nav>
      <section
        id="workspace-task-panel"
        className="workspace-context-panel"
        aria-labelledby={moreCurrent ? undefined : `workspace-mode-control-${activeMode}`}
        aria-label={moreCurrent ? `${mode.label} task` : undefined}
      >
        <header className="workspace-context-panel__head">
          <span>{mode.eyebrow}</span>
          <h2 ref={panelHeadingRef} tabIndex={-1}>{activeMode === "intervene" ? "Change" : mode.label}</h2>
          <p>{mode.description}</p>
        </header>
        <div ref={panelScrollRef} className="workspace-context-panel__scroll" data-intentional-scroll-region="workspace-context">
          {renderWorkspaceMode(activeMode)}
        </div>
      </section>
    </aside>
  );
}

const directModes: ReadonlyArray<{ id: SimulationWorkspaceModeId; label: string }> = [
  { id: "setup", label: "Setup" },
  { id: "observe", label: "Observe" },
  { id: "intervene", label: "Change" },
  { id: "compare", label: "Compare" }
];

const moreModes: ReadonlyArray<{ id: SimulationWorkspaceModeId; label: string; description: string }> = [
  { id: "understand", label: "Understand model", description: "Question, mechanism, assumptions, and limits" },
  { id: "experiment", label: "Experiments", description: "Bounded local parameter sweeps" },
  { id: "debug", label: "Diagnostics", description: "Runtime counters and instrumentation" }
];

function renderWorkspaceMode(mode: SimulationWorkspaceModeId): ReactNode {
  switch (mode) {
    case "setup":
      return (
        <>
          <RailPanelSlot panelId="runSettings">
            <RunSettingsPanel />
          </RailPanelSlot>
          <RailPanelSlot panelId="neuralLab">
            <NeuralRuntimeLabPanel />
          </RailPanelSlot>
          <Disclosure expandLabel="Scenarios and starting recipes" collapseLabel="Hide scenarios and starting recipes" className="world-secondary-disclosure">
            <RailPanelSlot panelId="scenarios">
              <ScenarioBuilderPanel />
            </RailPanelSlot>
          </Disclosure>
          <CapabilityGuidancePanel destinationId="world" className="capability-guidance--world" maxItemsPerGroup={1} />
        </>
      );
    case "understand":
      return (
        <RailPanelSlot panelId="assumptions">
          <ModelExplanationPanel />
        </RailPanelSlot>
      );
    case "observe":
      return (
        <>
          <RailPanelSlot panelId="runProvenance">
            <RunProvenanceObservationPanel />
          </RailPanelSlot>
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
