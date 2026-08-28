"use client";

import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { DebugPanel } from "./DebugPanel";
import { ExperimentPanel } from "./ExperimentPanel";
import { InterventionPanel } from "./InterventionPanel";
import { ModelExplanationPanel } from "./ModelExplanationPanel";
import { RunSettingsPanel } from "./RunSettingsPanel";
import { WorldComparePanel } from "./WorldComparePanel";
import { WorldObservePanel } from "./WorldObservePanel";
import { WorldObservationDock } from "./WorldObservationDock";
import { GuidedInvestigationPanel } from "./starterWorlds/GuidedInvestigationPanel";
import { getWorkspacePanelDefinition } from "../lib/workspacePanels";
import { getSimulationWorkspaceMode, type SimulationWorkspaceModeId } from "../lib/workspaceModes";
import type { GuidedInvestigationAuthority, StarterWorldLaunch } from "../lib/starterWorlds";

interface LeftInstrumentStackProps {
  activeMode: SimulationWorkspaceModeId;
  onModeChange: (mode: SimulationWorkspaceModeId) => void;
  toolsHidden: boolean;
  onHideTools: () => void;
  onShowTools: () => void;
  guidedInvestigation?: {
    authority: GuidedInvestigationAuthority;
    launch: StarterWorldLaunch;
  };
  onExitGuide?: () => void;
  onFocusPlayback?: () => void;
  onRestorePreparedRecipe?: () => void;
}

export function LeftInstrumentStack({
  activeMode,
  onModeChange,
  toolsHidden,
  onHideTools,
  onShowTools,
  guidedInvestigation,
  onExitGuide,
  onFocusPlayback,
  onRestorePreparedRecipe
}: LeftInstrumentStackProps) {
  const mode = getSimulationWorkspaceMode(activeMode);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreFocusRequest, setMoreFocusRequest] = useState(0);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const moreItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const directItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingMoreFocusIndexRef = useRef<number | null>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const focusPanelAfterChangeRef = useRef(false);
  const scrollTaskAfterGuideActionRef = useRef(false);
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
    if (!focusPanelAfterChangeRef.current || toolsHidden) {
      return;
    }
    focusPanelAfterChangeRef.current = false;
    window.requestAnimationFrame(() => {
      if (scrollTaskAfterGuideActionRef.current && panelScrollRef.current) {
        scrollTaskAfterGuideActionRef.current = false;
        const guide = panelScrollRef.current.querySelector<HTMLElement>("[data-guided-investigation-panel]");
        panelScrollRef.current.scrollTop = guide?.offsetHeight ?? 0;
      }
      panelHeadingRef.current?.focus();
    });
  }, [activeMode, toolsHidden]);

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

  function chooseMode(modeId: SimulationWorkspaceModeId) {
    focusPanelAfterChangeRef.current = true;
    onModeChange(modeId);
    closeMoreMenu();
    if (modeId === activeMode && !toolsHidden) {
      if (panelScrollRef.current) {
        panelScrollRef.current.scrollTop = 0;
      }
      focusPanelAfterChangeRef.current = false;
      window.requestAnimationFrame(() => panelHeadingRef.current?.focus());
    }
  }

  function chooseModeFromGuide(modeId: SimulationWorkspaceModeId) {
    scrollTaskAfterGuideActionRef.current = true;
    chooseMode(modeId);
    if (modeId === activeMode && !toolsHidden) {
      window.requestAnimationFrame(() => {
        if (!scrollTaskAfterGuideActionRef.current || !panelScrollRef.current) {
          return;
        }
        scrollTaskAfterGuideActionRef.current = false;
        const guide = panelScrollRef.current.querySelector<HTMLElement>("[data-guided-investigation-panel]");
        panelScrollRef.current.scrollTop = guide?.offsetHeight ?? 0;
      });
    }
  }

  function handleDirectKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const taskControlCount = directModes.length + 1;
    const nextIndex =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? (index + 1) % taskControlCount
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? (index - 1 + taskControlCount) % taskControlCount
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? taskControlCount - 1
              : null;
    if (nextIndex !== null) {
      event.preventDefault();
      focusTaskControl(nextIndex);
    }
  }

  function focusTaskControl(index: number) {
    if (index === directModes.length) {
      moreTriggerRef.current?.focus();
      return;
    }
    directItemRefs.current[index]?.focus();
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
    <>
      <nav className="workspace-navigator" aria-label="World tasks">
        {directModes.map((candidate, index) => (
          <button
            key={candidate.id}
            ref={(element) => {
              directItemRefs.current[index] = element;
            }}
            id={`workspace-mode-control-${candidate.id}`}
            type="button"
            aria-pressed={candidate.id === activeMode}
            aria-current={candidate.id === activeMode ? "page" : undefined}
            aria-controls="workspace-task-panel"
            className={candidate.id === activeMode ? "is-active" : ""}
            onClick={() => chooseMode(candidate.id)}
            onKeyDown={(event) => handleDirectKeyDown(event, index)}
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
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                directItemRefs.current.at(-1)?.focus();
              } else if (event.key === "ArrowRight" || event.key === "Home") {
                event.preventDefault();
                directItemRefs.current[0]?.focus();
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
                <Fragment key={candidate.id}>
                  {index === 0 || moreModes[index - 1]?.group !== candidate.group ? (
                    <li className="workspace-more-menu__group" role="presentation">
                      {candidate.group}
                    </li>
                  ) : null}
                  <li role="none">
                    <button
                      ref={(element) => {
                        moreItemRefs.current[index] = element;
                      }}
                      type="button"
                      role="menuitem"
                      aria-current={candidate.id === activeMode ? "page" : undefined}
                      onClick={() => chooseMode(candidate.id)}
                      onKeyDown={(event) => handleMoreKeyDown(event, index)}
                    >
                      <strong>{candidate.label}</strong>
                      <span>{candidate.description}</span>
                    </button>
                  </li>
                </Fragment>
              ))}
            </ul>
          ) : null}
        </div>
        {toolsHidden ? (
          <button
            id="world-show-tools"
            type="button"
            className="workspace-tools-toggle"
            onClick={() => {
              onShowTools();
              window.requestAnimationFrame(() => panelHeadingRef.current?.focus());
            }}
          >
            Show tools
          </button>
        ) : null}
      </nav>
      <aside className="left-instruments" aria-label="Active World tool surface" hidden={toolsHidden}>
        <section
          id="workspace-task-panel"
          className="workspace-context-panel"
          aria-labelledby={moreCurrent ? undefined : `workspace-mode-control-${activeMode}`}
          aria-label={moreCurrent ? `${mode.label} task` : undefined}
        >
          <header className="workspace-context-panel__head">
            <div>
              <span>{mode.eyebrow}</span>
              <h2 ref={panelHeadingRef} tabIndex={-1}>{mode.label}</h2>
              <p>{mode.description}</p>
            </div>
            <button
              type="button"
              className="workspace-focus-world"
              onClick={() => {
                onHideTools();
                window.requestAnimationFrame(() => document.getElementById("world-show-tools")?.focus());
              }}
            >
              Focus world
            </button>
          </header>
          <WorldObservationDock activeMode={activeMode} onOpenObserve={() => chooseMode("observe")} />
          <div ref={panelScrollRef} className="workspace-context-panel__scroll" data-intentional-scroll-region="workspace-context">
            {guidedInvestigation && onExitGuide && onFocusPlayback && onRestorePreparedRecipe ? (
              <GuidedInvestigationPanel
                authority={guidedInvestigation.authority}
                launch={guidedInvestigation.launch}
                activeMode={activeMode}
                onOpenTask={chooseModeFromGuide}
                onFocusPlayback={onFocusPlayback}
                onExitGuide={onExitGuide}
                onRestorePreparedRecipe={onRestorePreparedRecipe}
              />
            ) : null}
            <div hidden={activeMode !== "setup"}>
              <RailPanelSlot panelId="runSettings">
                <RunSettingsPanel active={activeMode === "setup" && !toolsHidden} />
              </RailPanelSlot>
            </div>
            {activeMode === "setup" ? null : renderWorkspaceMode(activeMode, chooseMode, !toolsHidden)}
          </div>
        </section>
      </aside>
    </>
  );
}

const directModes: ReadonlyArray<{ id: SimulationWorkspaceModeId; label: string }> = [
  { id: "setup", label: "Setup" },
  { id: "observe", label: "Observe" },
  { id: "intervene", label: "Change" },
  { id: "compare", label: "Compare" },
  { id: "understand", label: "Explain" }
];

const moreModes: ReadonlyArray<{
  id: SimulationWorkspaceModeId;
  label: string;
  description: string;
  group: "Investigate" | "Inspect";
}> = [
  { id: "experiment", label: "Experiments", description: "Bounded local parameter sweeps", group: "Investigate" },
  { id: "debug", label: "Diagnostics", description: "Runtime counters and instrumentation", group: "Inspect" }
];

function renderWorkspaceMode(
  mode: SimulationWorkspaceModeId,
  onModeChange: (mode: SimulationWorkspaceModeId) => void,
  toolsVisible: boolean
): ReactNode {
  switch (mode) {
    case "setup":
      return null;
    case "understand":
      return (
        <RailPanelSlot panelId="assumptions">
          <ModelExplanationPanel />
        </RailPanelSlot>
      );
    case "observe":
      return (
        <RailPanelSlot panelId="metrics">
          <WorldObservePanel active={toolsVisible} />
        </RailPanelSlot>
      );
    case "intervene":
      return (
        <RailPanelSlot panelId="interventions">
          <InterventionPanel onOpenSetup={() => onModeChange("setup")} />
        </RailPanelSlot>
      );
    case "experiment":
      return (
        <RailPanelSlot panelId="experiments">
          <ExperimentPanel embedded active={toolsVisible} />
        </RailPanelSlot>
      );
    case "compare":
      return (
        <RailPanelSlot panelId="comparisons">
          <WorldComparePanel active={toolsVisible} />
        </RailPanelSlot>
      );
    case "debug":
      return (
        <RailPanelSlot panelId="debug">
          <DebugPanel embedded active={toolsVisible} />
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
