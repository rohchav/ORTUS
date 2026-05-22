"use client";

import { create } from "zustand";
import {
  clearInterventionHistory,
  buildRunSummaryFromSnapshot,
  createEngineFromScenario,
  executeIntervention,
  experimentRunToSummary,
  readInterventionHistory,
  SimulationEngine,
  type AppliedInterventionRecord,
  type AuthoredScenario,
  type ExperimentResultSet,
  type GridCell,
  type InterventionTarget,
  type JsonValue,
  maxSavedRunSummaries,
  type ParameterValues,
  type SavedRunSummary,
  type Point2D,
  type SimulationSnapshotView
} from "../simulation";
import { defaultParameters, getTemplateDescriptor, requireTemplateDescriptor, templateDescriptors, type TemplateId } from "../lib/templateVisuals";
import { loadPanelState, savePanelState, type PanelState } from "../lib/panelPersistence";
import { clearRunLibraryStorage, loadRunLibrary, saveRunLibrary } from "../lib/localRunStorage";

export type AvatarMode = "glyph" | "arrow" | "initials" | "head";

const panelDefaults: PanelState = {
  micro: true,
  macro: true,
  metrics: true,
  experiments: false,
  interventions: false,
  assumptions: false,
  scenarios: false,
  comparisons: false,
  notes: false,
  debug: false,
  legend: true,
  file: false
};

interface SimulationUiState {
  selectedTemplateId: TemplateId;
  engine: SimulationEngine | null;
  latestSnapshot: SimulationSnapshotView | null;
  isRunning: boolean;
  speedMultiplier: number;
  selectedEntityId: string | null;
  parameterValues: ParameterValues;
  seed: string;
  lastError: string | null;
  lastNotice: string | null;
  exportText: string;
  importText: string;
  importMode: "scenario" | "snapshot";
  avatarMode: AvatarMode;
  interventionTargetPoint: Point2D | null;
  interventionTargetCell: GridCell | null;
  interventionHistory: AppliedInterventionRecord[];
  savedRuns: SavedRunSummary[];
  selectedComparisonRunIds: string[];
  baselineRunId: string | null;
  latestExperimentResultSet: ExperimentResultSet | null;
  panelState: PanelState;
  hydratePreferences: () => void;
  initialize: () => void;
  selectTemplate: (templateId: TemplateId) => void;
  setSeed: (seed: string) => void;
  regenerateSeed: () => void;
  setParameter: (key: string, value: JsonValue) => void;
  setSpeedMultiplier: (value: number) => void;
  play: () => void;
  pause: () => void;
  toggleRunning: () => void;
  stepOnce: () => void;
  runFrameSteps: (steps: number) => void;
  reset: () => void;
  selectEntity: (entityId: string | null) => void;
  setInterventionTarget: (target: { point?: Point2D | null; gridCell?: GridCell | null }) => void;
  applyIntervention: (interventionId: string, parameters: ParameterValues) => void;
  clearInterventions: () => void;
  applyScenario: (scenario: AuthoredScenario) => void;
  captureCurrentRun: (options?: { label?: string; notes?: string; tags?: string[] }) => void;
  importLatestExperimentRuns: () => void;
  setLatestExperimentResultSet: (result: ExperimentResultSet | null) => void;
  toggleComparisonRun: (runId: string) => void;
  setComparisonBaseline: (runId: string | null) => void;
  updateSavedRun: (runId: string, patch: Partial<Pick<SavedRunSummary, "label" | "notes" | "tags">>) => void;
  deleteSavedRun: (runId: string) => void;
  clearSavedRuns: () => void;
  setAvatarMode: (mode: AvatarMode) => void;
  exportScenario: () => void;
  exportSnapshot: () => void;
  setImportText: (value: string) => void;
  setImportMode: (mode: "scenario" | "snapshot") => void;
  importJson: () => void;
  clearExchangeText: () => void;
  togglePanel: (panelId: string) => void;
  dismissError: () => void;
  dismissNotice: () => void;
}

const initialTemplate = templateDescriptors[0]!;
const initialSeed = "ortus-field-001";
const avatarModeStorageKey = "ortus.avatarMode.v1";

export const useSimulationStore = create<SimulationUiState>((set, get) => ({
  selectedTemplateId: initialTemplate.id,
  engine: null,
  latestSnapshot: null,
  isRunning: false,
  speedMultiplier: 1,
  selectedEntityId: null,
  parameterValues: defaultParameters(initialTemplate.template) as ParameterValues,
  seed: initialSeed,
  lastError: null,
  lastNotice: null,
  exportText: "",
  importText: "",
  importMode: "snapshot",
  avatarMode: "glyph",
  interventionTargetPoint: null,
  interventionTargetCell: null,
  interventionHistory: [],
  savedRuns: [],
  selectedComparisonRunIds: [],
  baselineRunId: null,
  latestExperimentResultSet: null,
  panelState: panelDefaults,

  hydratePreferences() {
    const avatarMode = loadAvatarMode();
    const panelState = loadPanelState(panelDefaults);
    const runLibrary = loadRunLibrary();
    set({
      avatarMode,
      panelState,
      savedRuns: runLibrary.runs,
      selectedComparisonRunIds: get().selectedComparisonRunIds.filter((runId) => runLibrary.runs.some((run) => run.runId === runId)),
      lastNotice: runLibrary.warning ?? get().lastNotice
    });
  },

  initialize() {
    if (get().engine) {
      return;
    }
    replaceEngine(set, get, {
      templateId: get().selectedTemplateId,
      parameters: get().parameterValues,
      seed: get().seed,
      keepSelection: false
    });
  },

  selectTemplate(templateId) {
    const descriptor = getTemplateDescriptor(templateId);
    replaceEngine(set, get, {
      templateId: descriptor.id,
      parameters: defaultParameters(descriptor.template) as ParameterValues,
      seed: get().seed,
      keepSelection: false
    });
  },

  setSeed(seed) {
    const trimmed = seed.trim();
    if (!trimmed) {
      set({ lastError: "Seed cannot be empty.", lastNotice: null });
      return;
    }
    replaceEngine(set, get, {
      templateId: get().selectedTemplateId,
      parameters: get().parameterValues,
      seed: trimmed,
      keepSelection: false
    });
  },

  regenerateSeed() {
    get().setSeed(generateSeed());
  },

  setParameter(key, value) {
    const nextParameters = { ...get().parameterValues, [key]: value };
    replaceEngine(set, get, {
      templateId: get().selectedTemplateId,
      parameters: nextParameters,
      seed: get().seed,
      keepSelection: false,
      errorPrefix: `Parameter ${key}`
    });
  },

  setSpeedMultiplier(value) {
    const speedMultiplier = Math.max(0.25, Math.min(8, value));
    const engine = get().engine;
    engine?.setSpeed(speedMultiplier);
    set({ speedMultiplier, lastError: null });
  },

  play() {
    get().engine?.play();
    set({ isRunning: true });
  },

  pause() {
    get().engine?.pause();
    set({ isRunning: false });
  },

  toggleRunning() {
    if (get().isRunning) {
      get().pause();
    } else {
      get().play();
    }
  },

  stepOnce() {
    const engine = get().engine;
    if (!engine) {
      return;
    }
    try {
      engine.step();
      set({ latestSnapshot: engine.createSnapshot(), lastError: null });
      clearStaleSelection(set, get);
    } catch (error) {
      set({ isRunning: false, lastError: errorMessage(error) });
    }
  },

  runFrameSteps(steps) {
    const engine = get().engine;
    if (!engine || steps <= 0) {
      return;
    }
    try {
      engine.runSteps(steps);
      set({ latestSnapshot: engine.createSnapshot(), lastError: null });
      clearStaleSelection(set, get);
    } catch (error) {
      engine.pause();
      set({ isRunning: false, lastError: errorMessage(error) });
    }
  },

  reset() {
    replaceEngine(set, get, {
      templateId: get().selectedTemplateId,
      parameters: get().parameterValues,
      seed: get().seed,
      keepSelection: false
    });
  },

  selectEntity(entityId) {
    set({ selectedEntityId: entityId });
  },

  setInterventionTarget(target) {
    set({
      interventionTargetPoint: target.point === undefined ? get().interventionTargetPoint : target.point,
      interventionTargetCell: target.gridCell === undefined ? get().interventionTargetCell : target.gridCell
    });
  },

  applyIntervention(interventionId, parameters) {
    const engine = get().engine;
    if (!engine) {
      set({ lastError: "Start or import a run before applying an intervention.", lastNotice: null });
      return;
    }
    try {
      const selectedEntityId = get().selectedEntityId;
      const interventionTargetPoint = get().interventionTargetPoint;
      const interventionTargetCell = get().interventionTargetCell;
      const target: InterventionTarget = {
        ...(selectedEntityId ? { entityId: selectedEntityId } : {}),
        ...(interventionTargetPoint ? { point: interventionTargetPoint } : {}),
        ...(interventionTargetCell ? { gridCell: interventionTargetCell } : {})
      };
      const result = executeIntervention(engine, {
        templateId: get().selectedTemplateId,
        interventionId,
        parameters,
        target
      });
      set({
        latestSnapshot: engine.createSnapshot(),
        interventionHistory: readInterventionHistory(engine),
        lastError: null,
        lastNotice: `${result.record.label} applied at tick ${result.record.tickApplied}. It does not advance simulation time.`
      });
      clearStaleSelection(set, get);
    } catch (error) {
      set({
        interventionHistory: readInterventionHistory(engine),
        lastError: `Intervention failed: ${errorMessage(error)}`,
        lastNotice: null
      });
    }
  },

  clearInterventions() {
    const engine = get().engine;
    if (!engine) {
      set({ interventionHistory: [] });
      return;
    }
    clearInterventionHistory(engine);
    set({ interventionHistory: [], lastNotice: "Intervention history cleared.", lastError: null });
  },

  applyScenario(scenario) {
    try {
      const { engine, validation } = createEngineFromScenario(scenario);
      const descriptor = requireTemplateDescriptor(validation.scenario.templateId);
      engine.setSpeed(get().speedMultiplier);
      set({
        selectedTemplateId: descriptor.id,
        engine,
        latestSnapshot: engine.createSnapshot(),
        parameterValues: engine.parameters,
        seed: engine.seed,
        selectedEntityId: null,
        interventionTargetPoint: null,
        interventionTargetCell: null,
        interventionHistory: readInterventionHistory(engine),
        isRunning: false,
        lastError: null,
        lastNotice: `Applied scenario "${validation.scenario.name}". A fresh run is ready at tick 0.`
      });
      if (validation.warnings.length > 0) {
        set({ lastNotice: `Applied scenario "${validation.scenario.name}" with warning: ${validation.warnings[0]}` });
      }
    } catch (error) {
      set({ lastError: `Apply scenario failed: ${errorMessage(error)}`, lastNotice: null });
    }
  },

  captureCurrentRun(options = {}) {
    const engine = get().engine;
    const snapshot = get().latestSnapshot;
    if (!engine || !snapshot) {
      set({ lastError: "Run comparison needs an active snapshot before capture.", lastNotice: null });
      return;
    }
    try {
      const descriptor = requireTemplateDescriptor(get().selectedTemplateId);
      const run = buildRunSummaryFromSnapshot({
        runId: generateUiId("manual"),
        label: options.label,
        template: descriptor.template,
        seed: get().seed,
        parameters: get().parameterValues,
        snapshot,
        interventionHistory: get().interventionHistory,
        capturedAt: new Date().toISOString(),
        notes: options.notes,
        tags: options.tags,
        source: "manual",
        metadata: engine.metadata
      });
      const savedRuns = [run, ...get().savedRuns.filter((candidate) => candidate.runId !== run.runId)].slice(0, maxSavedRunSummaries);
      saveRunLibrary(savedRuns);
      const selectedComparisonRunIds = nextSelectedRunIds(get().selectedComparisonRunIds, run.runId);
      set({
        savedRuns,
        selectedComparisonRunIds,
        baselineRunId: get().baselineRunId ?? selectedComparisonRunIds[0] ?? run.runId,
        lastNotice: `Captured "${run.label}" for comparison.`,
        lastError: null
      });
    } catch (error) {
      set({ lastError: `Run capture failed: ${errorMessage(error)}`, lastNotice: null });
    }
  },

  importLatestExperimentRuns() {
    const resultSet = get().latestExperimentResultSet;
    if (!resultSet) {
      set({ lastError: "Run a parameter sweep before importing experiment runs for comparison.", lastNotice: null });
      return;
    }
    try {
      const descriptor = requireTemplateDescriptor(resultSet.config.templateId);
      const capturedAt = new Date().toISOString();
      const imported = resultSet.runs
        .filter((run) => run.status === "success")
        .map((run) =>
          experimentRunToSummary({
            template: descriptor.template,
            run,
            runId: experimentSummaryRunId(resultSet.config.templateId, run),
            label: `${descriptor.shortName} ${run.runId}`,
            capturedAt,
            tags: ["experiment"]
          })
        );
      if (imported.length === 0) {
        set({ lastError: "The latest experiment has no successful runs to compare.", lastNotice: null });
        return;
      }
      let savedRuns = get().savedRuns;
      for (const run of imported) {
        savedRuns = [run, ...savedRuns.filter((candidate) => candidate.runId !== run.runId)].slice(0, maxSavedRunSummaries);
      }
      saveRunLibrary(savedRuns);
      const selectedComparisonRunIds = imported.reduce(
        (selected, run) => nextSelectedRunIds(selected, run.runId),
        get().selectedComparisonRunIds
      );
      set({
        savedRuns,
        selectedComparisonRunIds,
        baselineRunId: get().baselineRunId ?? selectedComparisonRunIds[0] ?? imported[0]?.runId ?? null,
        lastNotice: `Imported ${imported.length} experiment run summaries for comparison.`,
        lastError: null
      });
    } catch (error) {
      set({ lastError: `Experiment import failed: ${errorMessage(error)}`, lastNotice: null });
    }
  },

  setLatestExperimentResultSet(result) {
    set({ latestExperimentResultSet: result });
  },

  toggleComparisonRun(runId) {
    const selectedComparisonRunIds = get().selectedComparisonRunIds.includes(runId)
      ? get().selectedComparisonRunIds.filter((candidate) => candidate !== runId)
      : nextSelectedRunIds(get().selectedComparisonRunIds, runId);
    set({
      selectedComparisonRunIds,
      baselineRunId: selectedComparisonRunIds.includes(get().baselineRunId ?? "") ? get().baselineRunId : (selectedComparisonRunIds[0] ?? null)
    });
  },

  setComparisonBaseline(runId) {
    set({ baselineRunId: runId });
  },

  updateSavedRun(runId, patch) {
    const savedRuns = get().savedRuns.map((run) =>
      run.runId === runId
        ? {
            ...run,
            label: patch.label?.trim() || run.label,
            notes: patch.notes ?? run.notes,
            tags: patch.tags ? [...new Set(patch.tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 8) : run.tags
          }
        : run
    );
    saveRunLibrary(savedRuns);
    set({ savedRuns });
  },

  deleteSavedRun(runId) {
    const savedRuns = get().savedRuns.filter((run) => run.runId !== runId);
    const selectedComparisonRunIds = get().selectedComparisonRunIds.filter((candidate) => candidate !== runId);
    saveRunLibrary(savedRuns);
    set({
      savedRuns,
      selectedComparisonRunIds,
      baselineRunId: get().baselineRunId === runId ? (selectedComparisonRunIds[0] ?? null) : get().baselineRunId,
      lastNotice: "Run summary deleted.",
      lastError: null
    });
  },

  clearSavedRuns() {
    clearRunLibraryStorage();
    set({
      savedRuns: [],
      selectedComparisonRunIds: [],
      baselineRunId: null,
      lastNotice: "Run comparison library cleared.",
      lastError: null
    });
  },

  setAvatarMode(mode) {
    saveAvatarMode(mode);
    set({ avatarMode: mode });
  },

  exportScenario() {
    const engine = get().engine;
    if (!engine) {
      return;
    }
    set({
      exportText: engine.exportScenario(),
      importMode: "scenario",
      lastNotice: "Scenario export ready. It will restart from the current template, parameters, and seed.",
      lastError: null,
      panelState: persistPanel(get().panelState, "file", true)
    });
  },

  exportSnapshot() {
    const engine = get().engine;
    if (!engine) {
      return;
    }
    set({
      exportText: engine.exportSnapshot(),
      importMode: "snapshot",
      lastNotice: "Snapshot export ready. It includes tick, world state, events, RNG streams, metrics, and applied intervention history.",
      lastError: null,
      panelState: persistPanel(get().panelState, "file", true)
    });
  },

  setImportText(value) {
    set({ importText: value });
  },

  setImportMode(mode) {
    set({ importMode: mode });
  },

  importJson() {
    const text = get().importText.trim();
    if (!text) {
      set({ lastError: "Paste scenario or snapshot JSON before importing.", lastNotice: null });
      return;
    }
    try {
      const raw = JSON.parse(text) as { templateId?: string };
      const descriptor = requireTemplateDescriptor(raw.templateId ?? get().selectedTemplateId);
      const engine =
        get().importMode === "scenario"
          ? SimulationEngine.fromScenario(descriptor.template, text)
          : SimulationEngine.fromSnapshot(descriptor.template, text);
      engine.setSpeed(get().speedMultiplier);
      set({
        selectedTemplateId: descriptor.id,
        engine,
        latestSnapshot: engine.createSnapshot(),
        parameterValues: engine.parameters,
        seed: engine.seed,
        selectedEntityId: null,
        interventionTargetPoint: null,
        interventionTargetCell: null,
        interventionHistory: readInterventionHistory(engine),
        isRunning: false,
        lastError: null,
        lastNotice:
          get().importMode === "scenario"
            ? "Scenario imported. The run restarted from initial conditions."
            : "Snapshot imported. Tick, world state, RNG streams, events, metrics, and applied intervention history were restored."
      });
    } catch (error) {
      set({ lastError: `Import failed: ${importErrorMessage(error)}`, lastNotice: null });
    }
  },

  clearExchangeText() {
    set({ exportText: "", importText: "", lastNotice: null });
  },

  togglePanel(panelId) {
    const current = get().panelState;
    set({ panelState: persistPanel(current, panelId, !current[panelId]) });
  },

  dismissError() {
    set({ lastError: null });
  },

  dismissNotice() {
    set({ lastNotice: null });
  }
}));

function loadAvatarMode(): AvatarMode {
  if (typeof window === "undefined") {
    return "glyph";
  }
  const value = window.localStorage.getItem(avatarModeStorageKey);
  return isAvatarMode(value) ? value : "glyph";
}

function saveAvatarMode(mode: AvatarMode): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(avatarModeStorageKey, mode);
}

function isAvatarMode(value: unknown): value is AvatarMode {
  return value === "glyph" || value === "arrow" || value === "initials" || value === "head";
}

function replaceEngine(
  set: (partial: Partial<SimulationUiState>) => void,
  get: () => SimulationUiState,
  options: {
    templateId: TemplateId;
    parameters: ParameterValues;
    seed: string;
    keepSelection: boolean;
    errorPrefix?: string;
  }
): void {
  try {
    const descriptor = requireTemplateDescriptor(options.templateId);
    const engine = new SimulationEngine(descriptor.template, {
      seed: options.seed,
      parameters: options.parameters
    });
    engine.setSpeed(get().speedMultiplier);
    set({
      selectedTemplateId: descriptor.id,
      engine,
      latestSnapshot: engine.createSnapshot(),
      parameterValues: engine.parameters,
      seed: options.seed,
      selectedEntityId: options.keepSelection ? get().selectedEntityId : null,
      interventionTargetPoint: null,
      interventionTargetCell: null,
      interventionHistory: readInterventionHistory(engine),
      isRunning: false,
      lastError: null,
      lastNotice: null
    });
  } catch (error) {
    const prefix = options.errorPrefix ? `${options.errorPrefix}: ` : "";
    set({ lastError: `${prefix}${errorMessage(error)}`, lastNotice: null });
  }
}

function clearStaleSelection(set: (partial: Partial<SimulationUiState>) => void, get: () => SimulationUiState): void {
  const selectedEntityId = get().selectedEntityId;
  const snapshot = get().latestSnapshot;
  if (!selectedEntityId || !snapshot) {
    return;
  }
  const entity = snapshot.entities.find((candidate) => candidate.id === selectedEntityId);
  if (!entity || !entity.alive) {
    set({ selectedEntityId: null });
  }
}

function persistPanel(current: PanelState, panelId: string, value: boolean): PanelState {
  const next = { ...current, [panelId]: value };
  savePanelState(next);
  return next;
}

function generateSeed(): string {
  const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (webCrypto?.randomUUID) {
    return `ortus-${webCrypto.randomUUID().slice(0, 13)}`;
  }
  if (webCrypto) {
    const values = new Uint32Array(2);
    webCrypto.getRandomValues(values);
    return `ortus-${values[0]?.toString(16) ?? "seed"}-${values[1]?.toString(16) ?? "field"}`;
  }
  return `ortus-${Date.now().toString(36)}`;
}

function generateUiId(prefix: string): string {
  const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (webCrypto?.randomUUID) {
    return `${prefix}-${webCrypto.randomUUID().slice(0, 13)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function nextSelectedRunIds(current: readonly string[], runId: string): string[] {
  return [runId, ...current.filter((candidate) => candidate !== runId)].slice(0, 6);
}

function experimentSummaryRunId(templateId: string, run: { runId: string; seed: string; ticksRun: number; parameterValues: ParameterValues }): string {
  const signature = JSON.stringify({
    templateId,
    runId: run.runId,
    seed: run.seed,
    ticksRun: run.ticksRun,
    parameterValues: run.parameterValues
  });
  return `experiment-${templateId}-${run.runId}-${hashString(signature)}`;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 420 ? `${message.slice(0, 417)}...` : message;
}

function importErrorMessage(error: unknown): string {
  if (error instanceof SyntaxError) {
    return "The pasted JSON could not be parsed. Check that the file is complete and try again.";
  }
  return errorMessage(error);
}
