"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  ProductionRuntimeProvider,
  useAcceptedWorkerRunConfigAccessor
} from "./runtime/ProductionRuntimeProvider";
import {
  defaultSimulationWorkspaceModeId,
  simulationWorkspaceModeFromQuery,
  simulationWorkspaceModeQueryValue,
  type SimulationWorkspaceModeId
} from "../lib/workspaceModes";
import {
  createAcceptedLegacyRunConfig,
  createStarterWorldScenario,
  deriveGuidedInvestigationAuthority,
  getStarterWorldLaunchRecipeById,
  prepareStarterRemixActiveWorldHandoff,
  requireStarterWorldById,
  starterRemixLaunchMatchesMetadata,
  type StarterRemixWorldLaunch,
  type StarterWorldLaunch
} from "../lib/starterWorlds";
import type { TemplateId } from "../lib/templateVisuals";
import { supportsWorkerRuntime } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";

const baseTicksPerSecond = 24;

interface AppShellProps {
  initialTemplateId?: TemplateId;
  initialWorkspaceMode?: SimulationWorkspaceModeId;
  starterLaunch?: StarterWorldLaunch;
  starterRemixLaunch?: StarterRemixWorldLaunch;
}

export function AppShell({ initialTemplateId, initialWorkspaceMode, starterLaunch, starterRemixLaunch }: AppShellProps) {
  return (
    <ProductionRuntimeProvider>
      <AppShellContent
        initialTemplateId={initialTemplateId}
        initialWorkspaceMode={initialWorkspaceMode}
        starterLaunch={starterLaunch}
        starterRemixLaunch={starterRemixLaunch}
      />
    </ProductionRuntimeProvider>
  );
}

function AppShellContent({ initialTemplateId, initialWorkspaceMode, starterLaunch, starterRemixLaunch }: AppShellProps) {
  const hydratePreferences = useSimulationStore((state) => state.hydratePreferences);
  const applyScenario = useSimulationStore((state) => state.applyScenario);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const speedMultiplier = useSimulationStore((state) => state.speedMultiplier);
  const engine = useSimulationStore((state) => state.engine);
  const getAcceptedWorkerRunConfig = useAcceptedWorkerRunConfigAccessor();
  const [mounted, setMounted] = useState(false);
  const [remixLaunchState, setRemixLaunchState] = useState<"checking" | "ready" | "missing">(
    starterRemixLaunch ? "checking" : "ready"
  );
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

  const prepareActiveWorldRemix = useCallback((launch: StarterWorldLaunch): string | null => {
    const state = useSimulationStore.getState();
    if (state.selectedTemplateId !== launch.templateId) {
      return "Wait for the matching active World run to finish rebuilding before opening Workshop.";
    }
    try {
      const acceptedConfig = supportsWorkerRuntime(launch.templateId)
        ? getAcceptedWorkerRunConfig()
        : state.engine?.template.id === launch.templateId
          ? createAcceptedLegacyRunConfig({
              templateId: state.engine.template.id,
              seed: state.engine.seed,
              parameters: state.engine.parameters,
              metadata: state.engine.metadata
            })
          : null;
      if (!acceptedConfig) {
        return "Wait for the matching active World run to finish rebuilding before opening Workshop.";
      }
      prepareStarterRemixActiveWorldHandoff(launch, acceptedConfig);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "The active World configuration could not be transferred.";
    }
  }, [getAcceptedWorkerRunConfig]);

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
    if (starterRemixLaunch) {
      const acceptedMetadata = state.flockingRuntimeConfig?.metadata ?? state.engine?.metadata;
      const accepted =
        state.selectedTemplateId === starterRemixLaunch.templateId &&
        starterRemixLaunchMatchesMetadata(acceptedMetadata, starterRemixLaunch);
      setRemixLaunchState(accepted ? "ready" : "missing");
      return;
    }
    setRemixLaunchState("ready");
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
  }, [hydratePreferences, initialTemplateId, starterLaunch, starterRemixLaunch]);

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

  if (!mounted || remixLaunchState === "checking") {
    return (
      <section className="ortus-shell ortus-shell--hydrating" aria-busy="true" aria-label="World simulation workbench">
        <div className="ortus-hydration-shell">
          <OrtusBrand variant="soft" showDescriptor />
          <span>Initializing simulation instrument</span>
        </div>
      </section>
    );
  }

  if (remixLaunchState === "missing" && starterRemixLaunch && starterLaunch) {
    const sourceWorld = requireStarterWorldById(starterLaunch.starterWorldId);
    return (
      <section className="starter-launch-error" data-starter-remix-resume-error role="alert">
        <p>Unsaved remix unavailable</p>
        <h1>This derivative is no longer in the current page session</h1>
        <span>
          ORTUS did not substitute the source Starter or a generic run. Return to {sourceWorld.title} to create a new derivative.
        </span>
        <div>
          <Link href={`/worlds/${sourceWorld.slug}`}>Review source Starter</Link>
          <Link href="/worlds">Explore Worlds</Link>
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
                onPrepareRemix={prepareActiveWorldRemix}
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
