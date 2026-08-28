"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSystemCamera,
  focusImmersiveCamera,
  releaseImmersiveCameraFocus,
  resetImmersiveCamera,
  zoomImmersiveCamera,
  type ImmersiveCameraState
} from "../../lib/immersiveWorld";
import { formatNumber, formatTick } from "../../lib/format";
import { useSimulationStore } from "../../state/simulationStore";
import { ImmersiveWorldCanvas, type ImmersiveCanvasAuditHandle } from "../immersive/ImmersiveWorldCanvas";
import { IconButton } from "../ui/IconButton";
import { ProductionFlockingRuntime, type ProductionFlockingRuntimeView } from "./ProductionFlockingRuntime";
import { useActiveWorldRuntime } from "./ProductionRuntimeProvider";

interface ProductionRuntimeAuditApi {
  whenReady(): Promise<void>;
  startMeasurement(): void;
  readMeasurement(): {
    agentCount: number;
    tick: number;
    generation: number;
    runtime: NonNullable<ProductionFlockingRuntimeView["ui"]>["performance"] | null;
    render: ReturnType<ImmersiveCanvasAuditHandle["summary"]> | null;
    presentation: ReturnType<ProductionFlockingRuntime["getPresentationMeasures"]>;
  };
}

declare global {
  interface Window {
    __ORTUS_PRODUCTION_RUNTIME_AUDIT__?: ProductionRuntimeAuditApi;
  }
}

export function ProductionFlockingWorld() {
  const activeRuntime = useActiveWorldRuntime();
  const runtime = activeRuntime.sceneRuntime;
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const selectEntityInStore = useSimulationStore((state) => state.selectEntity);
  const setInterventionTarget = useSimulationStore((state) => state.setInterventionTarget);
  const [camera, setCamera] = useState<ImmersiveCameraState>(() => createSystemCamera({ width: 100, height: 100 }));
  const [alignmentLens, setAlignmentLens] = useState(false);
  const reducedMotion = useReducedMotion();
  const auditHandleRef = useRef<ImmersiveCanvasAuditHandle | null>(null);

  useEffect(() => {
    if (!runtime) {
      return;
    }
    window.__ORTUS_PRODUCTION_RUNTIME_AUDIT__ = {
      whenReady: () => runtime.whenReady(),
      startMeasurement() {
        const now = performance.now();
        runtime.resetPerformanceMeasurement();
        auditHandleRef.current?.reset(now);
      },
      readMeasurement() {
        const view = runtime.getView();
        return {
          agentCount: runtime.agentCount,
          tick: view.ui?.tick ?? 0,
          generation: view.ui?.generation ?? 0,
          runtime: view.ui?.performance ?? null,
          render: auditHandleRef.current?.summary(performance.now()) ?? null,
          presentation: runtime.getPresentationMeasures()
        };
      }
    };
    return () => {
      delete window.__ORTUS_PRODUCTION_RUNTIME_AUDIT__;
    };
  }, [runtime]);

  useEffect(() => {
    if (!runtime || !activeRuntime.isReady) {
      return;
    }
    setCamera((current) => current.mode === "system" ? resetImmersiveCamera(runtime.getSceneAdapter().getBounds()) : current);
  }, [activeRuntime.isReady, activeRuntime.uiProjection?.generation, runtime]);

  useEffect(() => {
    if (!runtime || !selectedEntityId) {
      return;
    }
    if (!runtime.getSceneAdapter().getInspectableState(selectedEntityId)) {
      selectEntityInStore(null);
      setCamera(resetImmersiveCamera(runtime.getSceneAdapter().getBounds()));
    }
  }, [activeRuntime.uiProjection?.revision, runtime, selectEntityInStore, selectedEntityId]);

  const selectEntity = useCallback((entityId: string | null) => {
    if (!runtime) {
      return;
    }
    selectEntityInStore(entityId);
    if (entityId) {
      setInterventionTarget({ point: null });
    }
    setCamera((current) => {
      if (!entityId) {
        return releaseImmersiveCameraFocus(current, runtime.getSceneAdapter().getBounds());
      }
      return current.mode === "local" || current.mode === "follow"
        ? focusImmersiveCamera(current, current.mode, entityId)
        : current;
    });
  }, [runtime, selectEntityInStore, setInterventionTarget]);

  const cycleSelection = useCallback((direction: -1 | 1) => {
    if (!runtime) {
      return;
    }
    const entities = [...runtime.getSceneAdapter().getEntities()].sort(
      (left, right) => boidNumber(left.label) - boidNumber(right.label) || left.id.localeCompare(right.id)
    );
    if (entities.length === 0) {
      return;
    }
    const currentIndex = entities.findIndex((entity) => entity.id === selectedEntityId);
    const nextIndex = currentIndex < 0
      ? direction > 0 ? 0 : entities.length - 1
      : (currentIndex + direction + entities.length) % entities.length;
    selectEntity(entities[nextIndex]?.id ?? null);
  }, [runtime, selectEntity, selectedEntityId]);

  function showSystemView() {
    if (!runtime) {
      return;
    }
    setCamera(resetImmersiveCamera(runtime.getSceneAdapter().getBounds()));
  }

  function focusSelection(mode: "local" | "follow") {
    setCamera((current) => focusImmersiveCamera(current, mode, selectedEntityId));
  }

  if (!runtime) {
    return (
      <div className="production-flocking-state" role="status">
        <strong>Preparing Worker runtime</strong>
        <span>The Flocking engine and scheduler are initializing outside React.</span>
      </div>
    );
  }

  return (
    <div
      className="production-flocking-world"
      data-production-runtime="worker"
      data-runtime-state={activeRuntime.state}
      data-runtime-generation={activeRuntime.uiProjection?.generation ?? 0}
      data-runtime-tick={activeRuntime.tick}
      data-runtime-signature={activeRuntime.runtimeSignature ?? ""}
      data-runtime-ready={activeRuntime.isReady ? "true" : "false"}
      data-agent-count={activeRuntime.entityCount}
      data-ui-revision={activeRuntime.uiProjection?.revision ?? 0}
      data-metric-record-count={activeRuntime.metricRecordCount}
    >
      <ImmersiveWorldCanvas
        runtime={runtime}
        concept="living-diorama"
        camera={camera}
        onCameraChange={setCamera}
        selectedEntityId={selectedEntityId}
        onSelectEntity={selectEntity}
        onSelectWorldPoint={(point) => setInterventionTarget({ point })}
        onCycleSelection={cycleSelection}
        lensActive={alignmentLens}
        godHandTool="navigate"
        reducedMotion={reducedMotion}
        isRunning={activeRuntime.isRunning}
        auditHandleRef={auditHandleRef}
      />

      <div className="production-flocking-world__instrument" aria-label="Flocking scene presentation controls">
        <div className="production-flocking-world__runtime">
          <span>Model view</span>
          <strong>{activeRuntime.state === "ready" ? "Directional boids" : runtimeStateLabel(activeRuntime.state)}</strong>
          <small>Camera and lens are presentation only</small>
        </div>
        <div className="production-camera-modes" role="group" aria-label="Camera presentation mode">
          <button type="button" aria-pressed={camera.mode === "system"} onClick={showSystemView}>System</button>
          <button type="button" aria-pressed={camera.mode === "local"} disabled={!selectedEntityId} onClick={() => focusSelection("local")}>Local</button>
          <button type="button" aria-pressed={camera.mode === "follow"} disabled={!selectedEntityId} onClick={() => focusSelection("follow")}>Follow</button>
        </div>
        <div className="production-camera-tools">
          <IconButton label="Zoom in" icon="+" onClick={() => setCamera((current) => zoomImmersiveCamera(current, 1.12))} />
          <IconButton label="Zoom out" icon="-" onClick={() => setCamera((current) => zoomImmersiveCamera(current, 0.89))} />
          <IconButton label="Reset camera" icon="0" onClick={showSystemView} />
          <label>
            <input type="checkbox" checked={alignmentLens} onChange={(event) => setAlignmentLens(event.target.checked)} />
            Alignment lens
          </label>
        </div>
        <div className="production-entity-controls" role="group" aria-label="Boid inspection controls">
          <IconButton label="Previous boid" icon="<" disabled={!selectedEntityId} onClick={() => cycleSelection(-1)} />
          <button type="button" data-boid-inspect-control onClick={() => cycleSelection(1)}>
            {selectedEntityId ? "Next boid" : "Inspect a boid"}
          </button>
          <IconButton label="Clear boid selection" icon="x" disabled={!selectedEntityId} onClick={() => selectEntity(null)} />
          <span aria-live="polite">{activeRuntime.selected?.label ?? "No boid selected"}</span>
        </div>
      </div>

      <div className="production-flocking-world__readout" aria-label="Flocking model-output readout">
        <span>Tick <strong>{formatTick(activeRuntime.tick)}</strong></span>
        <span>Boids <strong>{activeRuntime.entityCount}</strong></span>
        <span>Alignment <strong>{activeRuntime.uiProjection?.alignment === null || activeRuntime.uiProjection?.alignment === undefined ? "Not recorded" : formatNumber(activeRuntime.uiProjection.alignment, 3)}</strong></span>
        <span>Edges <strong>{boundaryLabel(activeRuntime.parameters.boundaryMode)}</strong></span>
      </div>

      <p id="flocking-canvas-description" className="sr-only">
        The canvas presents a bounded 100 by 100 model domain. Use the adjacent boid inspection controls for a keyboard-operable semantic alternative to pointer selection.
      </p>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Flocking model at tick {activeRuntime.tick} with {activeRuntime.entityCount} simulated boids.
        {activeRuntime.selected ? ` Selected ${activeRuntime.selected.label} with ${activeRuntime.selected.neighborCount} modeled neighbors.` : " No boid selected."}
      </p>

      {activeRuntime.state === "initializing" ? (
        <div className="production-flocking-state" role="status">
          <strong>Rebuilding Worker-owned run</strong>
          <span>Controls will resume when the new generation is ready.</span>
        </div>
      ) : null}
      {activeRuntime.state === "failed" && activeRuntime.error ? (
        <div className="production-flocking-state production-flocking-state--failed" role="alert">
          <strong>Worker runtime stopped</strong>
          <span>{activeRuntime.error}</span>
          <small>No local fallback was started. Any visible frame is the last accepted presentation, not continued execution.</small>
        </div>
      ) : null}
      {activeRuntime.state === "ready" && activeRuntime.error ? (
        <div className="production-flocking-state" role="alert">
          <strong>Runtime request not accepted</strong>
          <span>{activeRuntime.error}</span>
          <small>The accepted Worker run and its last valid scene remain active.</small>
        </div>
      ) : null}
    </div>
  );
}

function runtimeStateLabel(state: ActiveWorldRuntimeState): string {
  if (state === "initializing") return "Initializing Worker";
  if (state === "failed") return "Worker stopped";
  if (state === "disposed") return "Runtime disposed";
  return "Preparing runtime";
}

type ActiveWorldRuntimeState = ReturnType<typeof useActiveWorldRuntime>["state"];

function boidNumber(label: string): number {
  const match = /Boid\s+(\d+)/i.exec(label);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function boundaryLabel(value: unknown): string {
  if (value === "wrap") return "Wrap";
  if (value === "bounce") return "Bounce";
  if (value === "clamp") return "Clamp";
  return "Unknown";
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
