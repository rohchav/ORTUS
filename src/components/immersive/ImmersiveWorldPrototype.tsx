"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MutableRefObject
} from "react";
import {
  createSystemCamera,
  focusImmersiveCamera,
  immersiveComparisonRubric,
  immersiveConceptIds,
  immersivePrototypeHref,
  parseImmersivePrototypeQuery,
  releaseImmersiveCameraFocus,
  resetImmersiveCamera,
  zoomImmersiveCamera,
  type ImmersiveAgentCount,
  type ImmersiveCameraState,
  type ImmersiveConceptId,
  type ImmersiveGodHandTool,
  type ImmersivePrototypeRouteConfig
} from "../../lib/immersiveWorld";
import { formatNumber, formatTick } from "../../lib/format";
import { IconButton } from "../ui/IconButton";
import { ModalSurface } from "../ui/ModalSurface";
import { ImmersiveInspector } from "./ImmersiveInspector";
import { ImmersiveFlockingRuntime } from "./ImmersiveFlockingRuntime";
import { ImmersiveWorldCanvas, type ImmersiveCanvasAuditHandle } from "./ImmersiveWorldCanvas";

interface ImmersiveWorldPrototypeProps {
  initialConfig: ImmersivePrototypeRouteConfig;
}

interface ImmersiveAuditApi {
  whenReady(): Promise<void>;
  startMeasurement(): void;
  readMeasurement(): {
    concept: ImmersiveConceptId;
    agentCount: ImmersiveAgentCount;
    runtime: ReturnType<ImmersiveFlockingRuntime["performanceSummary"]>;
    render: ReturnType<ImmersiveCanvasAuditHandle["summary"]> | null;
    runtimeSignature: string;
    runtimeKind: "local" | "worker";
    generation: number;
  };
}

declare global {
  interface Window {
    __ORTUS_IMMERSIVE_AUDIT__?: ImmersiveAuditApi;
  }
}

const conceptLabels: Record<ImmersiveConceptId, string> = {
  "living-diorama": "Living Diorama",
  "god-hand": "God-Hand",
  "field-scientist": "Field Scientist"
};

export function ImmersiveWorldPrototype({ initialConfig }: ImmersiveWorldPrototypeProps) {
  const [concept, setConcept] = useState(initialConfig.concept);
  const [agentCount, setAgentCount] = useState(initialConfig.agentCount);

  useEffect(() => {
    function syncFromHistory() {
      const parsed = parseImmersivePrototypeQuery(browserQuery());
      if (!parsed.ok) {
        return;
      }
      setConcept(parsed.config.concept);
      setAgentCount(parsed.config.agentCount);
    }
    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, []);

  function commitConfig(next: ImmersivePrototypeRouteConfig) {
    const nextHref = immersivePrototypeHref(next);
    const currentHref = `${window.location.pathname}${window.location.search}`;
    if (nextHref !== currentHref) {
      window.history.pushState(window.history.state, "", nextHref);
    }
    setConcept(next.concept);
    setAgentCount(next.agentCount);
  }

  return (
    <ImmersivePrototypeSession
      key={agentCount}
      concept={concept}
      agentCount={agentCount}
      onConceptChange={(nextConcept) => commitConfig({ concept: nextConcept, agentCount })}
      onAgentCountChange={(nextAgentCount) => commitConfig({ concept, agentCount: nextAgentCount })}
    />
  );
}

function ImmersivePrototypeSession({
  concept,
  agentCount,
  onConceptChange,
  onAgentCountChange
}: {
  concept: ImmersiveConceptId;
  agentCount: ImmersiveAgentCount;
  onConceptChange: (concept: ImmersiveConceptId) => void;
  onAgentCountChange: (agentCount: ImmersiveAgentCount) => void;
}) {
  const [runtime] = useState(() => new ImmersiveFlockingRuntime(agentCount, { execution: "worker" }));
  const runtimeView = useSyncExternalStore(runtime.subscribe, runtime.getView, runtime.getView);
  const [camera, setCamera] = useState<ImmersiveCameraState>(() => createSystemCamera({ width: 100, height: 100 }));
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [alignmentLens, setAlignmentLens] = useState(false);
  const [godHandTool, setGodHandTool] = useState<ImmersiveGodHandTool>("navigate");
  const [restoreArmed, setRestoreArmed] = useState(false);
  const [rubricOpen, setRubricOpen] = useState(false);
  const [pendingAgentCount, setPendingAgentCount] = useState<ImmersiveAgentCount | null>(null);
  const reducedMotion = useReducedMotion();
  const conceptTabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const rubricTriggerRef = useRef<HTMLButtonElement>(null);
  const loadSelectRef = useRef<HTMLSelectElement>(null);
  const canvasAuditRef = useRef<ImmersiveCanvasAuditHandle | null>(null);
  const runtimeLifecycleGenerationRef = useRef(0);
  const lensActive = concept === "god-hand" ? godHandTool === "measure" : alignmentLens;
  const adapter = runtime.getSceneAdapter();

  useEffect(() => {
    runtime.start();
    const generation = runtimeLifecycleGenerationRef.current + 1;
    runtimeLifecycleGenerationRef.current = generation;
    return () => {
      setTimeout(() => {
        if (runtimeLifecycleGenerationRef.current === generation) {
          runtime.dispose();
        }
      }, 0);
    };
  }, [runtime]);

  useEffect(() => {
    setCamera(createSystemCamera(runtime.getSceneAdapter().getBounds()));
    setGodHandTool("navigate");
    setRestoreArmed(false);
  }, [concept, runtime]);

  useEffect(() => {
    if (selectedEntityId && !runtime.getSceneAdapter().getInspectableState(selectedEntityId)) {
      setSelectedEntityId(null);
      setCamera(createSystemCamera(runtime.getSceneAdapter().getBounds()));
    }
  }, [runtime, runtimeView.revision, selectedEntityId]);

  useEffect(() => {
    window.__ORTUS_IMMERSIVE_AUDIT__ = {
      whenReady: () => runtime.whenReady(),
      startMeasurement() {
        const now = performance.now();
        runtime.startPerformanceMeasurement(now);
        canvasAuditRef.current?.reset(now);
      },
      readMeasurement() {
        const now = performance.now();
        return {
          concept,
          agentCount,
          runtime: runtime.performanceSummary(now),
          render: canvasAuditRef.current?.summary(now) ?? null,
          runtimeSignature: runtime.getSceneAdapter().getRuntimeSignature(),
          runtimeKind: runtime.getView().executionKind,
          generation: runtime.getView().generation
        };
      }
    };
    return () => {
      delete window.__ORTUS_IMMERSIVE_AUDIT__;
    };
  }, [agentCount, concept, runtime]);

  const selectEntity = useCallback((entityId: string | null) => {
    runtime.setSelectedEntity(entityId);
    setSelectedEntityId(entityId);
    setCamera((current) => {
      if (!entityId) {
        return releaseImmersiveCameraFocus(current, runtime.getSceneAdapter().getBounds());
      }
      return current.mode === "local" || current.mode === "follow"
        ? focusImmersiveCamera(current, current.mode, entityId)
        : current;
    });
  }, [runtime]);

  const cycleSelection = useCallback((direction: -1 | 1) => {
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

  const showSystemView = useCallback(() => {
    setCamera(resetImmersiveCamera(runtime.getSceneAdapter().getBounds()));
  }, [runtime]);

  const focusSelection = useCallback((mode: "local" | "follow") => {
    setCamera((current) => focusImmersiveCamera(current, mode, selectedEntityId));
  }, [selectedEntityId]);

  function requestAgentCount(next: ImmersiveAgentCount) {
    if (next === agentCount) {
      return;
    }
    if (runtimeView.tick > 0) {
      runtime.pause();
      setPendingAgentCount(next);
      return;
    }
    onAgentCountChange(next);
  }

  function requestRestore() {
    if (runtimeView.tick > 0 && !restoreArmed) {
      runtime.pause();
      setRestoreArmed(true);
      return;
    }
    runtime.restore();
    setSelectedEntityId(null);
    showSystemView();
    setRestoreArmed(false);
  }

  return (
    <section
      className={`immersive-prototype immersive-prototype--${concept}`}
      aria-label="Immersive Flocking prototype comparison"
      data-immersive-prototype
      data-concept={concept}
      data-agent-count={agentCount}
      data-tick={runtimeView.tick}
      data-runtime-signature={runtimeView.runtimeSignature}
      data-runtime-ready={runtimeView.isReady}
      data-runtime-state={runtimeView.playback}
      data-runtime-kind={runtimeView.executionKind}
      data-runtime-generation={runtimeView.generation}
      data-reduced-motion={reducedMotion}
    >
      <header className="immersive-prototype__bar">
        <div className="immersive-prototype__identity">
          <span>Internal I0 prototype</span>
          <h1>Immersive Flocking</h1>
        </div>

        <div
          className="immersive-concept-tabs"
          role="tablist"
          aria-label="Immersive concept"
          onKeyDown={(event) => moveConceptTabFocus(event, conceptTabsRef)}
        >
          {immersiveConceptIds.map((conceptId, index) => (
            <button
              key={conceptId}
              ref={(element) => { conceptTabsRef.current[index] = element; }}
              type="button"
              role="tab"
              aria-selected={concept === conceptId}
              tabIndex={concept === conceptId ? 0 : -1}
              onClick={() => onConceptChange(conceptId)}
            >
              {conceptLabels[conceptId]}
            </button>
          ))}
        </div>

        <label className="immersive-load-control">
          <span>Scene load</span>
          <select
            ref={loadSelectRef}
            value={agentCount}
            onChange={(event) => requestAgentCount(Number(event.target.value) as ImmersiveAgentCount)}
          >
            <option value={100}>100 boids</option>
            <option value={500}>500 boids</option>
          </select>
        </label>

        <div className="immersive-prototype__links">
          <button ref={rubricTriggerRef} type="button" onClick={() => setRubricOpen(true)}>Rubric</button>
          <Link href="/world?template=flocking-boids">Exit prototype</Link>
        </div>
      </header>

      <div className="immersive-prototype__stage" data-world-dominant-stage>
        <ImmersiveWorldCanvas
          runtime={runtime}
          concept={concept}
          camera={camera}
          onCameraChange={setCamera}
          selectedEntityId={selectedEntityId}
          onSelectEntity={selectEntity}
          onCycleSelection={cycleSelection}
          lensActive={lensActive}
          godHandTool={godHandTool}
          reducedMotion={reducedMotion}
          isRunning={runtimeView.isRunning}
          auditHandleRef={canvasAuditRef}
        />

        <ConceptTools
          concept={concept}
          camera={camera}
          setCamera={setCamera}
          selectedEntityId={selectedEntityId}
          alignmentLens={alignmentLens}
          setAlignmentLens={setAlignmentLens}
          godHandTool={godHandTool}
          setGodHandTool={setGodHandTool}
          onSystemView={showSystemView}
          onFocusSelection={focusSelection}
        />

        <div className="immersive-stage-readout" aria-label="Current prototype run">
          <span>{conceptLabels[concept]}</span>
          <strong>{runtimePlaybackLabel(runtimeView.playback)}</strong>
          <em>Tick {formatTick(runtimeView.tick)}</em>
        </div>

        <ImmersiveInspector
          adapter={adapter}
          runtimeView={runtimeView}
          concept={concept}
          cameraMode={camera.mode}
          activeTool={concept === "god-hand" ? godHandTool : "observe"}
          lensActive={lensActive}
          selectedEntityId={selectedEntityId}
          onSelectEntity={selectEntity}
          onCycleSelection={cycleSelection}
          onFollowSelection={() => focusSelection("follow")}
          onSystemView={showSystemView}
        />
      </div>

      <footer className="immersive-playback" aria-label="Immersive prototype playback controls">
        <div className="immersive-playback__buttons">
          <button
            type="button"
            disabled={!runtimeView.isReady}
            aria-label={runtimeView.isRunning ? "Pause immersive simulation" : "Run immersive simulation"}
            aria-pressed={runtimeView.isRunning || undefined}
            onClick={() => {
              setRestoreArmed(false);
              runtime.toggleRunning();
            }}
          >
            <span aria-hidden="true">{runtimeView.isRunning ? "II" : ">"}</span>
            <b>{runtimeView.isRunning ? "Pause" : "Run"}</b>
          </button>
          <button type="button" disabled={!runtimeView.isReady || runtimeView.isRunning} onClick={() => runtime.stepOnce()}>
            <span aria-hidden="true">→</span>
            <b>Step</b>
          </button>
          <button
            type="button"
            disabled={!runtimeView.isReady}
            aria-label={restoreArmed ? "Confirm restore and discard current prototype run state" : "Restore prepared prototype run"}
            aria-pressed={restoreArmed || undefined}
            onClick={requestRestore}
          >
            <span aria-hidden="true">↻</span>
            <b>{restoreArmed ? "Confirm restore" : "Restore"}</b>
          </button>
          {restoreArmed ? <button type="button" onClick={() => setRestoreArmed(false)}>Cancel</button> : null}
        </div>
        <div className="immersive-playback__facts">
          <span>Tick <strong>{formatTick(runtimeView.tick)}</strong></span>
          <span>Alignment <strong>{runtimeView.alignment === null ? "awaiting tick" : formatNumber(runtimeView.alignment, 3)}</strong></span>
          <span>{agentCount} boids</span>
        </div>
        <div className="immersive-playback__scenario">
          <span>random-headings</span>
          <strong>{runtimeView.seed}</strong>
        </div>
        {restoreArmed ? (
          <p role="status">Confirm restore discards current tick, metric history, selection, camera focus, trails, and effects.</p>
        ) : null}
        {runtimeView.error ? <p role="alert">Runtime stopped: {runtimeView.error}</p> : null}
      </footer>

      <ModalSurface
        open={rubricOpen}
        eyebrow="I0 comparison"
        title="Immersive concept rubric"
        closeLabel="Close rubric"
        onClose={() => setRubricOpen(false)}
        returnFocusRef={rubricTriggerRef}
        className="immersive-rubric-modal"
      >
        <div className="immersive-rubric-list">
          {immersiveComparisonRubric.map((item) => (
            <section key={item.id}>
              <h3>{item.label}</h3>
              <p>{item.question}</p>
            </section>
          ))}
        </div>
      </ModalSurface>

      <ModalSurface
        open={pendingAgentCount !== null}
        eyebrow="Replace prototype run"
        title={`Load ${pendingAgentCount ?? agentCount} boids`}
        closeLabel="Cancel replacement"
        onClose={() => setPendingAgentCount(null)}
        returnFocusRef={loadSelectRef}
        className="immersive-load-modal"
      >
        <div className="immersive-load-confirmation">
          <p>A different load creates a fresh paused tick-0 engine. Current tick, metric history, selection, camera focus, trails, and effects are discarded.</p>
          <button
            type="button"
            onClick={() => {
              if (pendingAgentCount !== null) {
                onAgentCountChange(pendingAgentCount);
              }
            }}
          >
            Confirm replacement
          </button>
        </div>
      </ModalSurface>
    </section>
  );
}

function ConceptTools({
  concept,
  camera,
  setCamera,
  selectedEntityId,
  alignmentLens,
  setAlignmentLens,
  godHandTool,
  setGodHandTool,
  onSystemView,
  onFocusSelection
}: {
  concept: ImmersiveConceptId;
  camera: ImmersiveCameraState;
  setCamera: (camera: ImmersiveCameraState) => void;
  selectedEntityId: string | null;
  alignmentLens: boolean;
  setAlignmentLens: (active: boolean) => void;
  godHandTool: ImmersiveGodHandTool;
  setGodHandTool: (tool: ImmersiveGodHandTool) => void;
  onSystemView: () => void;
  onFocusSelection: (mode: "local" | "follow") => void;
}) {
  return (
    <div className="immersive-context-tools" aria-label={`${conceptLabels[concept]} contextual tools`}>
      {concept === "god-hand" ? (
        <div className="immersive-tool-segments" aria-label="God-Hand tool">
          {(["navigate", "inspect", "measure"] as const).map((tool) => (
            <button
              key={tool}
              type="button"
              aria-pressed={godHandTool === tool}
              onClick={() => setGodHandTool(tool)}
            >
              {tool.slice(0, 1).toUpperCase()}{tool.slice(1)}
            </button>
          ))}
        </div>
      ) : null}

      {concept === "field-scientist" ? (
        <div className="immersive-tool-segments" aria-label="Observation scale">
          <button type="button" aria-pressed={camera.mode === "system"} onClick={onSystemView}>System</button>
          <button type="button" aria-pressed={camera.mode === "local"} disabled={!selectedEntityId} onClick={() => onFocusSelection("local")}>Local</button>
          <button type="button" aria-pressed={camera.mode === "follow"} disabled={!selectedEntityId} onClick={() => onFocusSelection("follow")}>Follow</button>
        </div>
      ) : null}

      {concept === "living-diorama" ? (
        <div className="immersive-tool-segments" aria-label="Diorama camera">
          <button type="button" aria-pressed={camera.mode === "system"} onClick={onSystemView}>System</button>
          <button type="button" aria-pressed={camera.mode === "follow"} disabled={!selectedEntityId} onClick={() => onFocusSelection("follow")}>Follow</button>
        </div>
      ) : null}

      {concept !== "god-hand" ? (
        <button
          type="button"
          className="immersive-lens-toggle"
          aria-pressed={alignmentLens}
          onClick={() => setAlignmentLens(!alignmentLens)}
        >
          Alignment lens
        </button>
      ) : null}

      <div className="immersive-camera-buttons">
        <IconButton label="Zoom out" icon="−" onClick={() => setCamera(zoomImmersiveCamera(camera, 0.86))} />
        <IconButton label="Zoom in" icon="+" onClick={() => setCamera(zoomImmersiveCamera(camera, 1.16))} />
        <IconButton label="Reset camera" icon="↺" onClick={onSystemView} />
      </div>
    </div>
  );
}

function moveConceptTabFocus(event: KeyboardEvent<HTMLDivElement>, tabsRef: MutableRefObject<Array<HTMLButtonElement | null>>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    return;
  }
  event.preventDefault();
  const tabs = tabsRef.current.filter((tab): tab is HTMLButtonElement => tab !== null);
  const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
  const nextIndex = event.key === "Home"
    ? 0
    : event.key === "End"
      ? tabs.length - 1
      : (Math.max(0, currentIndex) + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  tabs[nextIndex]?.focus();
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function browserQuery(): Record<string, string | string[] | undefined> {
  const result: Record<string, string | string[]> = {};
  const query = new URLSearchParams(window.location.search);
  for (const key of new Set(query.keys())) {
    const values = query.getAll(key);
    result[key] = values.length === 1 ? values[0]! : values;
  }
  return result;
}

function boidNumber(label: string): number {
  const match = label.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function runtimePlaybackLabel(playback: "initializing" | "paused" | "running" | "failed" | "disposed"): string {
  if (playback === "initializing") return "Preparing";
  if (playback === "paused") return "Paused";
  if (playback === "running") return "Running";
  if (playback === "failed") return "Failed";
  return "Disposed";
}
