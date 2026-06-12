"use client";

import { SimulationCanvas } from "./SimulationCanvas";
import { TemplateBackgroundLayer } from "./TemplateBackgroundLayer";
import { EmptyState } from "./EmptyState";
import { useSimulationStore } from "../state/simulationStore";

export function WorldStage() {
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const lastError = useSimulationStore((state) => state.lastError);
  const dismissError = useSimulationStore((state) => state.dismissError);

  return (
    <section className="world-stage" aria-label="Simulation world stage">
      <TemplateBackgroundLayer stage />
      <div className="world-stage__frame">
        {snapshot ? <SimulationCanvas /> : <EmptyState title="No world loaded" message="Select a model or reset the run to create a snapshot." />}
      </div>
      <div className="floating-overlay-layer" data-workspace-region="floatingOverlay">
        {lastError ? (
          <div className="error-banner" role="alert">
            <strong>Engine message</strong>
            <span>{lastError}</span>
            <button type="button" onClick={dismissError} aria-label="Dismiss error" suppressHydrationWarning>
              ×
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
