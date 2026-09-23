"use client";

import { SimulationCanvas } from "./SimulationCanvas";
import { TemplateBackgroundLayer } from "./TemplateBackgroundLayer";
import { EmptyState } from "./EmptyState";
import { useSimulationStore, type StoreErrorArea } from "../state/simulationStore";
import { ProductionFlockingWorld } from "./runtime/ProductionFlockingWorld";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

const errorAreaLabels: Record<StoreErrorArea, string> = {
  run: "Run",
  setup: "Setup",
  intervention: "Intervention",
  comparison: "Run comparison",
  file: "Import and export"
};

export function WorldStage() {
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const lastError = useSimulationStore((state) => state.lastError);
  const dismissError = useSimulationStore((state) => state.dismissError);
  const activeRuntime = useActiveWorldRuntime();
  // The Worker failure alert already shows the runtime's own failure message; do not repeat it.
  const duplicatesWorkerFailure =
    activeRuntime.workerManaged && activeRuntime.state === "failed" && lastError?.text === activeRuntime.error;

  return (
    <section className="world-stage" aria-label="Simulation world stage" tabIndex={-1}>
      <TemplateBackgroundLayer stage />
      <div className="world-stage__frame">
        {activeRuntime.workerManaged
          ? <ProductionFlockingWorld />
          : snapshot
            ? <SimulationCanvas />
            : <EmptyState title="No world loaded" message="Select a model or reset the run to create a snapshot." />}
      </div>
      <div className="floating-overlay-layer" data-workspace-region="floatingOverlay">
        {lastError && !duplicatesWorkerFailure ? (
          <div className="error-banner" role="alert">
            <strong>{errorAreaLabels[lastError.area]}</strong>
            <span>{lastError.text}</span>
            <button type="button" onClick={dismissError} aria-label="Dismiss error" suppressHydrationWarning>
              ×
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
