"use client";

import { useEffect, useRef, useState } from "react";
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
  defaultSimulationWorkspaceModeId,
  simulationWorkspaceModeQueryValue,
  type SimulationWorkspaceModeId
} from "../lib/workspaceModes";
import type { TemplateId } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

const baseTicksPerSecond = 24;

interface AppShellProps {
  initialTemplateId?: TemplateId;
  initialWorkspaceMode?: SimulationWorkspaceModeId;
  showStarterGuide?: boolean;
}

export function AppShell({ initialTemplateId, initialWorkspaceMode, showStarterGuide = false }: AppShellProps) {
  const hydratePreferences = useSimulationStore((state) => state.hydratePreferences);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const speedMultiplier = useSimulationStore((state) => state.speedMultiplier);
  const engine = useSimulationStore((state) => state.engine);
  const [mounted, setMounted] = useState(false);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<SimulationWorkspaceModeId>(
    initialWorkspaceMode ?? defaultSimulationWorkspaceModeId
  );
  const [toolsHidden, setToolsHidden] = useState(false);
  const [runDetailsOpen, setRunDetailsOpen] = useState(false);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const starterInitializedRef = useRef(false);
  const runDetailsTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    hydratePreferences();
    const state = useSimulationStore.getState();
    if (initialTemplateId && showStarterGuide && !starterInitializedRef.current) {
      starterInitializedRef.current = true;
      state.selectTemplate(initialTemplateId);
    } else if (initialTemplateId && state.selectedTemplateId !== initialTemplateId) {
      state.selectTemplate(initialTemplateId);
    } else {
      state.initialize();
    }
  }, [hydratePreferences, initialTemplateId, showStarterGuide]);

  useEffect(() => {
    setActiveWorkspaceMode(initialWorkspaceMode ?? defaultSimulationWorkspaceModeId);
  }, [initialWorkspaceMode]);

  function changeWorkspaceMode(mode: SimulationWorkspaceModeId) {
    setActiveWorkspaceMode(mode);

    const query = new URLSearchParams(window.location.search);
    const task = simulationWorkspaceModeQueryValue(mode);
    if (task) {
      query.set("task", task);
    } else {
      query.delete("task");
    }
    const nextHref = `/world${query.size > 0 ? `?${query.toString()}` : ""}${window.location.hash}`;
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextHref !== currentHref) {
      window.history.replaceState(window.history.state, "", nextHref);
    }
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
            {showStarterGuide ? <StarterActionNudge /> : null}
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
