"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LeftInstrumentStack } from "./LeftInstrumentStack";
import { RightContextDrawer } from "./RightContextDrawer";
import { RunProvenanceObservationPanel } from "./RunProvenanceObservationPanel";
import { StarterActionNudge } from "./StarterActionNudge";
import { TimelineControlStrip } from "./TimelineControlStrip";
import { TopStatusBar } from "./TopStatusBar";
import { WorldStage } from "./WorldStage";
import { OrtusBrand } from "./branding";
import { CapabilityGuidancePanel } from "./researchWorld/CapabilityGuidancePanel";
import { ModalSurface } from "./ui/ModalSurface";
import { ProductionRuntimeProvider } from "./runtime/ProductionRuntimeProvider";
import {
  defaultSimulationWorkspaceModeId,
  simulationWorkspaceModeFromQuery,
  simulationWorkspaceModeQueryValue,
  type SimulationWorkspaceModeId
} from "../lib/workspaceModes";
import {
  createStarterWorldScenario,
  deriveGuidedInvestigationAuthority,
  getStarterWorldLaunchRecipeById,
  requireStarterWorldById,
  type StarterWorldLaunch
} from "../lib/starterWorlds";
import type { TemplateId } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

const baseTicksPerSecond = 24;

interface AppShellProps {
  initialTemplateId?: TemplateId;
  initialWorkspaceMode?: SimulationWorkspaceModeId;
  starterLaunch?: StarterWorldLaunch;
}

export function AppShell({ initialTemplateId, initialWorkspaceMode, starterLaunch }: AppShellProps) {
  return (
    <ProductionRuntimeProvider>
      <AppShellContent
        initialTemplateId={initialTemplateId}
        initialWorkspaceMode={initialWorkspaceMode}
        starterLaunch={starterLaunch}
      />
    </ProductionRuntimeProvider>
  );
}

function AppShellContent({ initialTemplateId, initialWorkspaceMode, starterLaunch }: AppShellProps) {
  const hydratePreferences = useSimulationStore((state) => state.hydratePreferences);
  const applyScenario = useSimulationStore((state) => state.applyScenario);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const speedMultiplier = useSimulationStore((state) => state.speedMultiplier);
  const engine = useSimulationStore((state) => state.engine);
  const [mounted, setMounted] = useState(false);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<SimulationWorkspaceModeId>(
    initialWorkspaceMode ?? defaultSimulationWorkspaceModeId
  );
  const [toolsHidden, setToolsHidden] = useState(false);
  const [runDetailsOpen, setRunDetailsOpen] = useState(false);
  const [guideVisible, setGuideVisible] = useState(Boolean(starterLaunch?.guideId));
  const guideLaunchIdentity = starterLaunch?.guideId
    ? `${starterLaunch.guideId}:${starterLaunch.recipeId ?? ""}`
    : undefined;
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const starterInitializedRef = useRef<string | null>(null);
  const runDetailsTriggerRef = useRef<HTMLButtonElement>(null);
  const previousGuideLaunchIdentityRef = useRef(guideLaunchIdentity);
  const defaultWorkspaceMode = useMemo(
    () => starterLaunch ? starterLaunchDefaultWorkspaceMode(starterLaunch) : defaultSimulationWorkspaceModeId,
    [starterLaunch]
  );
  const guidedAuthority = useMemo(
    () => starterLaunch?.guideId ? deriveGuidedInvestigationAuthority(starterLaunch.guideId) : undefined,
    [starterLaunch?.guideId]
  );

  useEffect(() => {
    if (previousGuideLaunchIdentityRef.current === guideLaunchIdentity) {
      return;
    }
    previousGuideLaunchIdentityRef.current = guideLaunchIdentity;
    setGuideVisible(Boolean(starterLaunch?.guideId));
  }, [guideLaunchIdentity, starterLaunch?.guideId]);

  useEffect(() => {
    setMounted(true);
    hydratePreferences();
    const state = useSimulationStore.getState();
    const starterIdentity = starterLaunch
      ? `${starterLaunch.starterWorldId}:${starterLaunch.recipeId ?? "default"}`
      : null;
    if (starterLaunch && starterInitializedRef.current !== starterIdentity) {
      starterInitializedRef.current = starterIdentity;
      state.applyScenario(createStarterWorldScenario(starterLaunch));
    } else if (initialTemplateId && state.selectedTemplateId !== initialTemplateId) {
      state.selectTemplate(initialTemplateId);
    } else {
      state.initialize();
    }
  }, [hydratePreferences, initialTemplateId, starterLaunch]);

  useEffect(() => {
    const mode = workspaceModeFromLocation(initialWorkspaceMode);
    setActiveWorkspaceMode(mode);
    replaceNonCanonicalWorkspaceHref(mode, defaultWorkspaceMode);
  }, [defaultWorkspaceMode, initialWorkspaceMode]);

  useEffect(() => {
    function syncWorkspaceModeFromHistory() {
      setActiveWorkspaceMode(workspaceModeFromLocation(defaultWorkspaceMode));
    }
    window.addEventListener("popstate", syncWorkspaceModeFromHistory);
    return () => window.removeEventListener("popstate", syncWorkspaceModeFromHistory);
  }, [defaultWorkspaceMode]);

  function changeWorkspaceMode(mode: SimulationWorkspaceModeId) {
    setActiveWorkspaceMode(mode);

    const nextHref = workspaceHref(mode, defaultWorkspaceMode);
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextHref !== currentHref) {
      window.history.pushState(window.history.state, "", nextHref);
    }
  }

  function exitGuide() {
    const query = new URLSearchParams(window.location.search);
    query.delete("guide");
    const nextHref = `/world${query.size > 0 ? `?${query.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextHref);
    setGuideVisible(false);
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(".world-stage")?.focus());
  }

  function focusPlayback() {
    document.querySelector<HTMLButtonElement>('[aria-label="Run simulation"], [aria-label="Pause simulation"]')?.focus();
  }

  function restorePreparedRecipe() {
    if (!starterLaunch?.guideId || !starterLaunch.recipeId) {
      return;
    }
    applyScenario(createStarterWorldScenario(starterLaunch));
  }

  useEffect(() => {
    if (!isRunning) {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTimeRef.current = null;
      accumulatedRef.current = 0;
      return;
    }

    const loop = (time: number) => {
      const state = useSimulationStore.getState();
      if (!state.isRunning || !state.engine) {
        frameRef.current = null;
        return;
      }

      const previous = lastTimeRef.current ?? time;
      lastTimeRef.current = time;
      accumulatedRef.current += Math.min(250, time - previous);

      const interval = 1000 / (baseTicksPerSecond * state.speedMultiplier);
      const requestedSteps = Math.floor(accumulatedRef.current / interval);
      const cappedSteps = Math.min(requestedSteps, state.engine.clock.maxStepsPerFrame);
      if (cappedSteps > 0) {
        accumulatedRef.current -= cappedSteps * interval;
        state.runFrameSteps(cappedSteps);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
    };
  }, [isRunning, speedMultiplier, engine]);

  if (!mounted) {
    return (
      <section className="ortus-shell ortus-shell--hydrating" aria-busy="true" aria-label="World simulation workbench">
        <div className="ortus-hydration-shell">
          <OrtusBrand variant="soft" showDescriptor />
          <span>Initializing simulation instrument</span>
        </div>
      </section>
    );
  }

  return (
    <section className="ortus-shell" aria-label="World simulation workbench" data-destination-route="world">
      <h1 className="sr-only">World</h1>
      <TopStatusBar
        onOpenRunDetails={() => setRunDetailsOpen(true)}
        runDetailsTriggerRef={runDetailsTriggerRef}
      />
      <div className="ortus-layout" data-tools-state={toolsHidden ? "hidden" : "visible"}>
        <section className="workspace-center" aria-label="Simulation workspace" data-workspace-region="center">
          <div className="world-workspace">
            {starterLaunch ? (
              <StarterActionNudge
                launch={starterLaunch}
                activeGuideId={guideVisible ? starterLaunch.guideId : undefined}
              />
            ) : null}
            <WorldStage />
          </div>
          <TimelineControlStrip />
          <RightContextDrawer />
        </section>
        <LeftInstrumentStack
          activeMode={activeWorkspaceMode}
          onModeChange={changeWorkspaceMode}
          toolsHidden={toolsHidden}
          onHideTools={() => setToolsHidden(true)}
          onShowTools={() => setToolsHidden(false)}
          guidedInvestigation={guideVisible && guidedAuthority && starterLaunch?.recipeId
            ? { authority: guidedAuthority, launch: starterLaunch }
            : undefined}
          onExitGuide={exitGuide}
          onFocusPlayback={focusPlayback}
          onRestorePreparedRecipe={restorePreparedRecipe}
        />
      </div>
      <ModalSurface
        open={runDetailsOpen}
        eyebrow="Inspect"
        title="Technical run details"
        closeLabel="Close run details"
        onClose={() => setRunDetailsOpen(false)}
        returnFocusRef={runDetailsTriggerRef}
      >
        <div className="world-run-details-stack">
          <RunProvenanceObservationPanel embedded />
          <CapabilityGuidancePanel destinationId="world" className="capability-guidance--world" maxItemsPerGroup={1} />
        </div>
      </ModalSurface>
    </section>
  );
}

function workspaceModeFromLocation(fallback = defaultSimulationWorkspaceModeId): SimulationWorkspaceModeId {
  const query = new URLSearchParams(window.location.search);
  return simulationWorkspaceModeFromQuery(query.get("task") ?? undefined) ?? fallback;
}

function workspaceHref(
  mode: SimulationWorkspaceModeId,
  defaultMode: SimulationWorkspaceModeId
): string {
  const query = new URLSearchParams(window.location.search);
  if (mode === defaultMode) {
    query.delete("task");
  } else {
    const task = simulationWorkspaceModeQueryValue(mode) ?? "setup";
    query.set("task", task);
  }
  return `/world${query.size > 0 ? `?${query.toString()}` : ""}${window.location.hash}`;
}

function replaceNonCanonicalWorkspaceHref(
  mode: SimulationWorkspaceModeId,
  defaultMode: SimulationWorkspaceModeId
): void {
  const canonicalHref = workspaceHref(mode, defaultMode);
  const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (canonicalHref !== currentHref) {
    window.history.replaceState(window.history.state, "", canonicalHref);
  }
}

function starterLaunchDefaultWorkspaceMode(launch: StarterWorldLaunch): SimulationWorkspaceModeId {
  const recipe = launch.recipeId ? getStarterWorldLaunchRecipeById(launch.recipeId) : undefined;
  if (recipe) {
    return recipe.recommendedTask;
  }
  return requireStarterWorldById(launch.starterWorldId).runtime?.recommendedTask ?? defaultSimulationWorkspaceModeId;
}
