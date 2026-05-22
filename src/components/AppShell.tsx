"use client";

import { useEffect, useRef, useState } from "react";
import { BottomAnalysisDock } from "./BottomAnalysisDock";
import { LeftInstrumentStack } from "./LeftInstrumentStack";
import { RightContextDrawer } from "./RightContextDrawer";
import { TopStatusBar } from "./TopStatusBar";
import { WorldStage } from "./WorldStage";
import { WorkspaceMode } from "./WorkspaceMode";
import { useSimulationStore } from "../state/simulationStore";

const baseTicksPerSecond = 24;

export function AppShell() {
  const hydratePreferences = useSimulationStore((state) => state.hydratePreferences);
  const initialize = useSimulationStore((state) => state.initialize);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const speedMultiplier = useSimulationStore((state) => state.speedMultiplier);
  const engine = useSimulationStore((state) => state.engine);
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    hydratePreferences();
    initialize();
  }, [hydratePreferences, initialize]);

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
      <main className="ortus-shell ortus-shell--hydrating" aria-busy="true">
        <div className="ortus-hydration-shell">
          <span className="brand-mark">ORTUS</span>
          <span>Initializing simulation instrument</span>
        </div>
      </main>
    );
  }

  return (
    <main className="ortus-shell">
      <TopStatusBar />
      <div className="ortus-layout">
        <LeftInstrumentStack />
        <section className="workspace-center" aria-label="Simulation workspace" data-workspace-region="center">
          <div className="world-workspace">
            <WorldStage />
            <BottomAnalysisDock />
          </div>
          <RightContextDrawer />
          <WorkspaceMode />
        </section>
      </div>
    </main>
  );
}
