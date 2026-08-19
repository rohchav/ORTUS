"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  SimulationEngine,
  getProductionTemplate,
  parseRuntimeArtifact,
  readInterventionHistory,
  runConfigFromArtifact,
  supportsWorkerRuntime,
  validateRunConfig,
  type InitializationConfig,
  type JsonValue,
  type MetricRecord,
  type ParameterValues,
  type RuntimeArtifactKind,
  type RuntimeDriverState,
  type RuntimeExecutionKind,
  type RuntimeInterventionSummary,
  type RuntimePlaybackState,
  type RuntimeRunRequest,
  type ScenarioVariantConfig,
  type SelectedUIProjection,
  type SimulationRunConfig,
  type UIProjection
} from "../../simulation";
import { useSimulationStore } from "../../state/simulationStore";
import { ProductionFlockingRuntime, type ProductionFlockingRuntimeView } from "./ProductionFlockingRuntime";

interface ProductionRuntimeContextValue {
  runtime: ProductionFlockingRuntime | null;
  view: ProductionFlockingRuntimeView;
  config: SimulationRunConfig | null;
  toggleRunning(): void;
  step(): Promise<void>;
  reset(): Promise<void>;
  setSpeedMultiplier(value: number): void;
  applyIntervention(interventionId: string, parameters: ParameterValues): Promise<void>;
  clearInterventions(): Promise<void>;
  exportArtifact(kind: RuntimeArtifactKind): Promise<void>;
  importArtifact(kind: RuntimeArtifactKind, json: string): Promise<void>;
  captureCurrentRun(options?: { label?: string; notes?: string; tags?: string[] }): Promise<void>;
}

const idleView: ProductionFlockingRuntimeView = {
  revision: 0,
  state: "idle",
  ui: null,
  error: null
};

const ProductionRuntimeContext = createContext<ProductionRuntimeContextValue | null>(null);

export function ProductionRuntimeProvider({ children }: { children: ReactNode }) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const config = useSimulationStore((state) => state.flockingRuntimeConfig);
  const configRevision = useSimulationStore((state) => state.flockingRuntimeRevision);
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const speedMultiplier = useSimulationStore((state) => state.speedMultiplier);
  const [runtime, setRuntime] = useState<ProductionFlockingRuntime | null>(null);
  const [view, setView] = useState<ProductionFlockingRuntimeView>(idleView);
  const appliedRevisionRef = useRef<number | null>(null);
  const artifactSequenceRef = useRef(0);
  const workerManaged = supportsWorkerRuntime(selectedTemplateId);

  useEffect(() => {
    if (!workerManaged) {
      setRuntime(null);
      setView(idleView);
      appliedRevisionRef.current = null;
      return;
    }
    const nextRuntime = new ProductionFlockingRuntime();
    const update = () => setView(nextRuntime.getView());
    const unsubscribe = nextRuntime.subscribe(update);
    setRuntime(nextRuntime);
    setView(nextRuntime.getView());
    appliedRevisionRef.current = null;
    return () => {
      unsubscribe();
      nextRuntime.dispose();
    };
  }, [workerManaged]);

  useEffect(() => {
    if (!runtime || !config || !workerManaged || appliedRevisionRef.current === configRevision) {
      return;
    }
    appliedRevisionRef.current = configRevision;
    const request: RuntimeRunRequest = {
      runId: productionRunId(config, configRevision),
      runConfig: config,
      instrumentation: true
    };
    const operation = runtime.getView().state === "idle" ? runtime.start(request) : runtime.replaceRun(request);
    void operation.catch((error) => {
      if (appliedRevisionRef.current !== configRevision || runtime.getView().state !== "ready") {
        return;
      }
      const activeConfig = runtime.getActiveRunConfig();
      if (!activeConfig || runtime.getView().ui?.runId === request.runId) {
        return;
      }
      const state = useSimulationStore.getState();
      state.adoptFlockingRuntimeConfig(
        activeConfig,
        "The requested Worker run was not accepted; the previous run remains active."
      );
      state.setRuntimeFeedback({
        error: `Run replacement failed: ${messageFor(error)}`,
        notice: "The requested Worker run was not accepted; the previous run remains active."
      });
    });
  }, [config, configRevision, runtime, workerManaged]);

  useEffect(() => {
    runtime?.setSelectedEntity(selectedEntityId);
  }, [runtime, selectedEntityId, view.state]);

  useEffect(() => {
    runtime?.setSpeedMultiplier(speedMultiplier);
  }, [runtime, speedMultiplier, view.state]);

  const toggleRunning = useCallback(() => {
    if (!runtime) {
      return;
    }
    if (runtime.getView().ui?.playback === "running") {
      runtime.pause();
    } else {
      runtime.play();
    }
  }, [runtime]);

  const step = useCallback(async () => {
    if (!runtime) {
      return;
    }
    try {
      await runtime.step();
    } catch (error) {
      useSimulationStore.getState().setRuntimeFeedback({ error: `Step failed: ${messageFor(error)}`, notice: null });
    }
  }, [runtime]);

  const reset = useCallback(async () => {
    if (!runtime) {
      return;
    }
    const state = useSimulationStore.getState();
    if (!state.flockingRuntimeConfig || !supportsWorkerRuntime(state.selectedTemplateId)) {
      return;
    }
    let resetConfig: SimulationRunConfig;
    try {
      resetConfig = validateRunConfig({
        schemaVersion: "1",
        templateId: state.selectedTemplateId,
        seed: state.seed,
        parameters: state.parameterValues,
        metadata: {}
      });
    } catch (error) {
      state.setRuntimeFeedback({ error: `Reset failed: ${messageFor(error)}`, notice: null });
      return;
    }
    const sourceRevision = state.flockingRuntimeRevision;
    const previousRunId = runtime.getView().ui?.runId ?? null;
    const previousSelection = state.selectedEntityId;
    const previousPoint = state.interventionTargetPoint;
    const previousCell = state.interventionTargetCell;
    artifactSequenceRef.current += 1;
    const runId = `production-flocking-reset:${artifactSequenceRef.current}`;
    state.selectEntity(null);
    state.setInterventionTarget({ point: null, gridCell: null });
    try {
      await runtime.replaceRun({ runId, runConfig: resetConfig, instrumentation: true });
      const latestState = useSimulationStore.getState();
      if (latestState.flockingRuntimeRevision !== sourceRevision || runtime.getView().ui?.runId !== runId) {
        return;
      }
      appliedRevisionRef.current = sourceRevision;
      latestState.adoptFlockingRuntimeConfig(
        resetConfig,
        "Run reset in the Worker runtime. Prepared recipe provenance was discarded."
      );
    } catch (error) {
      const latestState = useSimulationStore.getState();
      if (
        latestState.flockingRuntimeRevision === sourceRevision
        && runtime.getView().state === "ready"
        && runtime.getView().ui?.runId === previousRunId
      ) {
        latestState.selectEntity(previousSelection);
        latestState.setInterventionTarget({ point: previousPoint, gridCell: previousCell });
      }
      latestState.setRuntimeFeedback({
        error: `Reset failed: ${messageFor(error)}`,
        notice: runtime.getView().state === "ready" ? "The previous Worker run remains active." : null
      });
    }
  }, [runtime]);

  const setSpeedMultiplier = useCallback((value: number) => {
    useSimulationStore.getState().setSpeedMultiplier(value);
    runtime?.setSpeedMultiplier(Math.max(0.25, Math.min(8, value)));
  }, [runtime]);

  const applyIntervention = useCallback(async (interventionId: string, parameters: ParameterValues) => {
    if (!runtime) {
      return;
    }
    const state = useSimulationStore.getState();
    const target = {
      ...(state.selectedEntityId ? { entityId: state.selectedEntityId } : {}),
      ...(state.interventionTargetPoint ? { point: state.interventionTargetPoint } : {}),
      ...(state.interventionTargetCell ? { gridCell: state.interventionTargetCell } : {})
    };
    try {
      await runtime.applyIntervention({
        templateId: "flocking-boids",
        interventionId,
        parameters,
        target
      });
      const latest = runtime.getView().ui?.interventions.at(-1);
      state.setRuntimeFeedback({
        error: null,
        notice: latest
          ? `${latest.label} applied at tick ${latest.tickApplied}. It does not advance simulation time.`
          : "Intervention applied through the Worker runtime."
      });
    } catch (error) {
      state.setRuntimeFeedback({ error: `Intervention failed: ${messageFor(error)}`, notice: null });
    }
  }, [runtime]);

  const clearInterventions = useCallback(async () => {
    if (!runtime) {
      return;
    }
    try {
      await runtime.clearInterventions();
      useSimulationStore.getState().setRuntimeFeedback({ error: null, notice: "Current-run intervention entries cleared." });
    } catch (error) {
      useSimulationStore.getState().setRuntimeFeedback({ error: messageFor(error), notice: null });
    }
  }, [runtime]);

  const exportArtifact = useCallback(async (kind: RuntimeArtifactKind) => {
    if (!runtime) {
      return;
    }
    try {
      const json = await runtime.exportArtifact(kind);
      useSimulationStore.getState().setRuntimeExport(
        json,
        kind,
        kind === "scenario"
          ? "Scenario export ready from the Worker-owned run. It restarts from template, parameters, seed, and metadata."
          : "Snapshot export ready from the Worker-owned run. It includes tick, world state, events, RNG streams, metrics, and intervention history."
      );
    } catch (error) {
      useSimulationStore.getState().setRuntimeFeedback({ error: `${capitalize(kind)} export failed: ${messageFor(error)}`, notice: null });
    }
  }, [runtime]);

  const importArtifact = useCallback(async (kind: RuntimeArtifactKind, json: string) => {
    if (!runtime) {
      return;
    }
    const state = useSimulationStore.getState();
    try {
      const artifact = parseRuntimeArtifact(kind, json);
      if (!supportsWorkerRuntime(artifact.templateId)) {
        state.importJson();
        return;
      }
      artifactSequenceRef.current += 1;
      const runId = `production-flocking-import:${artifactSequenceRef.current}`;
      await runtime.importArtifact({
        runId,
        kind,
        json
      });
      if (runtime.getView().ui?.runId !== runId) {
        return;
      }
      const importedConfig = runConfigFromArtifact(artifact);
      state.adoptFlockingRuntimeConfig(
        importedConfig,
        kind === "scenario"
          ? "Scenario imported into the Worker runtime. The run restarted from initial conditions."
          : "Snapshot imported into the Worker runtime. Tick, world state, RNG streams, events, metrics, and intervention history were restored."
      );
      runtime.setSpeedMultiplier(state.speedMultiplier);
    } catch (error) {
      state.setRuntimeFeedback({ error: `Import failed: ${messageFor(error)}`, notice: null });
    }
  }, [runtime]);

  const activeConfig = view.state === "ready"
    ? runtime?.getActiveRunConfig() ?? config
    : config;

  const captureCurrentRun = useCallback(async (options: { label?: string; notes?: string; tags?: string[] } = {}) => {
    if (!runtime) {
      return;
    }
    const state = useSimulationStore.getState();
    try {
      const json = await runtime.exportArtifact("snapshot");
      const template = getProductionTemplate("flocking-boids");
      if (!template) {
        throw new Error("Flocking template is unavailable");
      }
      const capturedConfig = runConfigFromArtifact(parseRuntimeArtifact("snapshot", json));
      const engine = SimulationEngine.fromSnapshot(template, json);
      state.captureRuntimeRun({
        snapshot: engine.createSnapshot(),
        seed: capturedConfig.seed,
        parameters: capturedConfig.parameters,
        metadata: runtimeMetadata(capturedConfig),
        interventionHistory: readInterventionHistory(engine)
      }, options);
    } catch (error) {
      state.setRuntimeFeedback({ error: `Run capture failed: ${messageFor(error)}`, notice: null });
    }
  }, [runtime]);

  const value = useMemo<ProductionRuntimeContextValue>(() => ({
    runtime,
    view,
    config: activeConfig,
    toggleRunning,
    step,
    reset,
    setSpeedMultiplier,
    applyIntervention,
    clearInterventions,
    exportArtifact,
    importArtifact,
    captureCurrentRun
  }), [
    applyIntervention,
    captureCurrentRun,
    clearInterventions,
    activeConfig,
    exportArtifact,
    importArtifact,
    reset,
    runtime,
    setSpeedMultiplier,
    step,
    toggleRunning,
    view
  ]);

  return <ProductionRuntimeContext.Provider value={value}>{children}</ProductionRuntimeContext.Provider>;
}

export interface ActiveWorldRuntime {
  workerManaged: boolean;
  executionKind: RuntimeExecutionKind | "main-thread";
  state: RuntimeDriverState | "ready";
  playback: RuntimePlaybackState;
  isReady: boolean;
  isRunning: boolean;
  hasActiveRun: boolean;
  tick: number;
  time: number;
  entityCount: number;
  metricsHistory: readonly MetricRecord[];
  metricRecordCount: number;
  speedMultiplier: number;
  selected: SelectedUIProjection | null;
  interventions: readonly RuntimeInterventionSummary[];
  interventionCount: number;
  appliedInterventionCount: number;
  runtimeSignature: string | null;
  error: string | null;
  metadata: Record<string, JsonValue>;
  initialization: InitializationConfig | undefined;
  scenario: ScenarioVariantConfig | undefined;
  uiProjection: UIProjection | null;
  sceneRuntime: ProductionFlockingRuntime | null;
  toggleRunning(): void;
  step(): Promise<void> | void;
  reset(): Promise<void> | void;
  setSpeedMultiplier(value: number): void;
  applyIntervention(interventionId: string, parameters: ParameterValues): Promise<void> | void;
  clearInterventions(): Promise<void> | void;
  exportArtifact(kind: RuntimeArtifactKind): Promise<void> | void;
  importArtifact(kind: RuntimeArtifactKind, json: string): Promise<void> | void;
  captureCurrentRun(options?: { label?: string; notes?: string; tags?: string[] }): Promise<void> | void;
}

export function useActiveWorldRuntime(): ActiveWorldRuntime {
  const production = useContext(ProductionRuntimeContext);
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const engine = useSimulationStore((state) => state.engine);
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const legacyRunning = useSimulationStore((state) => state.isRunning);
  const speedMultiplier = useSimulationStore((state) => state.speedMultiplier);
  const legacyInterventions = useSimulationStore((state) => state.interventionHistory);
  const lastError = useSimulationStore((state) => state.lastError);
  const legacyToggle = useSimulationStore((state) => state.toggleRunning);
  const legacyStep = useSimulationStore((state) => state.stepOnce);
  const legacyReset = useSimulationStore((state) => state.reset);
  const legacySetSpeed = useSimulationStore((state) => state.setSpeedMultiplier);
  const legacyApplyIntervention = useSimulationStore((state) => state.applyIntervention);
  const legacyClearInterventions = useSimulationStore((state) => state.clearInterventions);
  const legacyExportScenario = useSimulationStore((state) => state.exportScenario);
  const legacyExportSnapshot = useSimulationStore((state) => state.exportSnapshot);
  const legacyImport = useSimulationStore((state) => state.importJson);
  const legacyCapture = useSimulationStore((state) => state.captureCurrentRun);
  const workerManaged = supportsWorkerRuntime(selectedTemplateId);

  if (workerManaged) {
    const ui = production?.view.ui ?? null;
    const runtimeState = production?.view.state ?? "initializing";
    const config = production?.config ?? null;
    return {
      workerManaged: true,
      executionKind: "worker",
      state: runtimeState,
      playback: runtimeState === "failed" ? "failed" : ui?.playback ?? "initializing",
      isReady: runtimeState === "ready" && Boolean(ui),
      isRunning: ui?.playback === "running",
      hasActiveRun: runtimeState === "ready" && Boolean(ui),
      tick: ui?.tick ?? 0,
      time: ui?.time ?? 0,
      entityCount: ui?.entityCount ?? 0,
      metricsHistory: ui?.metricHistory ?? [],
      metricRecordCount: ui?.metricRecordCount ?? 0,
      speedMultiplier: ui?.speedMultiplier ?? speedMultiplier,
      selected: ui?.selected ?? null,
      interventions: ui?.interventions ?? [],
      interventionCount: ui?.interventionCount ?? 0,
      appliedInterventionCount: ui?.appliedInterventionCount ?? 0,
      runtimeSignature: ui?.runtimeSignature ?? null,
      error: production?.view.error ?? lastError,
      metadata: runtimeMetadata(config),
      initialization: runtimeInitialization(config),
      scenario: runtimeScenario(config),
      uiProjection: ui,
      sceneRuntime: production?.runtime ?? null,
      toggleRunning: production?.toggleRunning ?? (() => undefined),
      step: production?.step ?? (() => undefined),
      reset: production?.reset ?? (() => undefined),
      setSpeedMultiplier: production?.setSpeedMultiplier ?? (() => undefined),
      applyIntervention: production?.applyIntervention ?? (() => undefined),
      clearInterventions: production?.clearInterventions ?? (() => undefined),
      exportArtifact: production?.exportArtifact ?? (() => undefined),
      importArtifact: production?.importArtifact ?? (() => undefined),
      captureCurrentRun: production?.captureCurrentRun ?? (() => undefined)
    };
  }

  return {
    workerManaged: false,
    executionKind: "main-thread",
    state: engine ? "ready" : "idle",
    playback: legacyRunning ? "running" : "paused",
    isReady: Boolean(engine && snapshot),
    isRunning: legacyRunning,
    hasActiveRun: Boolean(engine && snapshot),
    tick: snapshot?.tick ?? 0,
    time: snapshot?.time ?? 0,
    entityCount: snapshot?.entities.filter((entity) => entity.alive).length ?? 0,
    metricsHistory: snapshot?.metricsHistory ?? [],
    metricRecordCount: snapshot?.metricsHistory.length ?? 0,
    speedMultiplier,
    selected: null,
    interventions: legacyInterventions,
    interventionCount: legacyInterventions.length,
    appliedInterventionCount: legacyInterventions.filter((record) => record.status === "applied").length,
    runtimeSignature: null,
    error: lastError,
    metadata: engine?.metadata ?? {},
    initialization: engine?.initialization,
    scenario: engine?.scenario,
    uiProjection: null,
    sceneRuntime: null,
    toggleRunning: legacyToggle,
    step: legacyStep,
    reset: legacyReset,
    setSpeedMultiplier: legacySetSpeed,
    applyIntervention: legacyApplyIntervention,
    clearInterventions: legacyClearInterventions,
    exportArtifact: (kind) => kind === "scenario" ? legacyExportScenario() : legacyExportSnapshot(),
    importArtifact: () => legacyImport(),
    captureCurrentRun: legacyCapture
  };
}

function productionRunId(config: SimulationRunConfig, revision: number): string {
  const source = config.scenarioId ?? config.templateId;
  const bounded = source.replace(/[^a-zA-Z0-9._:-]/g, "-").slice(0, 80);
  return `production:${revision}:${bounded}`;
}

function runtimeMetadata(config: SimulationRunConfig | null): Record<string, JsonValue> {
  if (!config) {
    return {};
  }
  return {
    ...(config.metadata ?? {}),
    ...(config.scenarioId ? { scenarioId: config.scenarioId } : {}),
    ...(config.scenarioName ? { scenarioName: config.scenarioName } : {}),
    ...(config.initializationPreset ? { initializationPreset: config.initializationPreset } : {}),
    ...(config.initializationOptions ? { initializationOptions: config.initializationOptions } : {}),
    ...(config.behaviorMode ? { behaviorMode: config.behaviorMode } : {}),
    ...(config.agentComposition ? { agentComposition: config.agentComposition } : {}),
    ...(config.environmentOptions ? { environmentOptions: config.environmentOptions } : {})
  };
}

function runtimeInitialization(config: SimulationRunConfig | null): InitializationConfig | undefined {
  return config?.initializationPreset
    ? { presetId: config.initializationPreset, options: config.initializationOptions ?? {} }
    : undefined;
}

function runtimeScenario(config: SimulationRunConfig | null): ScenarioVariantConfig | undefined {
  if (!config) {
    return undefined;
  }
  const initialization = runtimeInitialization(config);
  return {
    behaviorMode: config.behaviorMode ?? "default",
    agentComposition: config.agentComposition ?? {},
    environmentOptions: config.environmentOptions ?? {},
    ...(initialization ? { initialization } : {})
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function messageFor(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return (message.trim() || "Runtime operation failed").slice(0, 420);
}
