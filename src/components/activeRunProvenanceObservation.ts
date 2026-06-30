import type {
  InitializationConfig,
  JsonValue,
  ParameterValues,
  ScenarioVariantConfig,
  SimulationSnapshotView,
  SimulationTemplate
} from "../simulation";
import { getRunStatusPillModel, type RunStatusPillModel } from "./runStatusSemantics";
import type { StatusPillCategory, StatusPillState, StatusPillTone } from "./ui/statusPillSemantics";

export const RUN_PROVENANCE_NON_PERSISTENT_COPY =
  "This provenance summary describes the active model configuration. It is not a saved experiment record.";

export const RUN_OBSERVATION_MODEL_STATE_COPY =
  "Observed values describe the model’s current state, not measured real-world data.";

export const RUN_INTERPRETATION_VISUAL_PATTERN_COPY =
  "A visual pattern in this run is evidence about this model under this configuration. It is not automatically evidence about the real system.";

export interface RunStatusModel {
  label: string;
  tone: StatusPillTone;
  category: StatusPillCategory;
  state: StatusPillState;
  description: string;
}

export interface RunMetricObservationRow {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
}

export interface RunProvenanceSummary {
  templateId: string;
  templateLabel: string;
  scenarioLabel: string;
  runtimeModeLabel: string;
  behaviorModeLabel: string;
  seedLabel: string;
  parameterCount: number;
  parameterKeys: readonly string[];
  parameterSummaryLabel: string;
  initializationLabel: string;
  agentCompositionLabel: string;
  environmentOptionsLabel: string;
  speedLabel: string;
  runConfigurationStatus: RunStatusModel;
  liveNonPersistent: true;
  configurationFingerprint: null;
  boundaryCopy: string;
}

export interface RunObservationSummary {
  runStatus: RunStatusPillModel;
  lifecycleStatus: RunStatusModel;
  runtimeStatusLabel: string;
  tickLabel: string;
  timeLabel: string;
  advancingLabel: string;
  aliveEntityCount: number;
  aliveEntityCountLabel: string;
  metricRecordCount: number;
  metricRecordCountLabel: string;
  latestMetricRows: readonly RunMetricObservationRow[];
  interventionCount: number;
  boundaryCopy: string;
}

export interface RunInterpretationBoundary {
  evidenceStatus: RunStatusModel;
  visualPatternCopy: string;
  claimBoundaries: readonly string[];
}

export interface ActiveRunProvenanceObservation {
  provenance: RunProvenanceSummary;
  observation: RunObservationSummary;
  interpretation: RunInterpretationBoundary;
}

export interface ActiveRunProvenanceInput {
  selectedTemplateId: string;
  template?: Pick<
    SimulationTemplate,
    "id" | "name" | "parameterDefinitions" | "behaviorModes" | "initializationPresets" | "agentCompositionDefinitions" | "environmentOptionDefinitions"
  >;
  templateLabel?: string;
  seed?: string | number;
  parameters?: ParameterValues;
  initialization?: InitializationConfig;
  scenario?: ScenarioVariantConfig;
  metadata?: Record<string, JsonValue>;
  snapshot?: SimulationSnapshotView | null;
  isRunning: boolean;
  hasActiveEngine: boolean;
  lastError?: string | null;
  speedMultiplier?: number;
  interventionCount?: number;
  metricLabelForKey?: (templateId: string, key: string) => string;
  maxMetricRows?: number;
}

export function deriveActiveRunProvenanceObservation(input: ActiveRunProvenanceInput): ActiveRunProvenanceObservation {
  return {
    provenance: deriveRunProvenanceSummary(input),
    observation: deriveRunObservationSummary(input),
    interpretation: deriveRunInterpretationBoundary()
  };
}

export function deriveRunProvenanceSummary(input: ActiveRunProvenanceInput): RunProvenanceSummary {
  const templateId = input.template?.id ?? input.snapshot?.templateId ?? input.selectedTemplateId;
  const templateLabel = input.templateLabel ?? input.template?.name ?? templateId;
  const parameterKeys = Object.keys(input.parameters ?? {}).sort((left, right) => left.localeCompare(right));
  const parameterCount = parameterKeys.length;
  const scenarioLabel = getStringMetadata(input.metadata, "scenarioName") ?? "Default run";
  const behaviorModeLabel = resolveBehaviorModeLabel(input.template, input.scenario);
  const initializationLabel = resolveInitializationLabel(input.template, input.initialization ?? input.scenario?.initialization);
  const agentCompositionCount = countRecordKeys(input.scenario?.agentComposition);
  const environmentOptionCount = countRecordKeys(input.scenario?.environmentOptions);
  const speed = Number.isFinite(input.speedMultiplier) ? Number(input.speedMultiplier) : 1;
  const hasRunnableSurface = input.hasActiveEngine && Boolean(input.snapshot);

  return {
    templateId,
    templateLabel,
    scenarioLabel,
    runtimeModeLabel: input.hasActiveEngine ? "Active World engine" : "No active World engine",
    behaviorModeLabel,
    seedLabel: input.seed === undefined || input.seed === null || input.seed === "" ? "No seed exposed" : String(input.seed),
    parameterCount,
    parameterKeys,
    parameterSummaryLabel:
      parameterCount === 0 ? "No active parameters exposed" : `${parameterCount} active parameter${parameterCount === 1 ? "" : "s"}`,
    initializationLabel,
    agentCompositionLabel:
      agentCompositionCount === 0 ? "Default composition" : `${agentCompositionCount} composition field${agentCompositionCount === 1 ? "" : "s"}`,
    environmentOptionsLabel:
      environmentOptionCount === 0 ? "Default environment options" : `${environmentOptionCount} environment option${environmentOptionCount === 1 ? "" : "s"}`,
    speedLabel: `${formatDecimal(speed, 2)}x local playback`,
    runConfigurationStatus: hasRunnableSurface
      ? {
          label: "Live run",
          tone: "neutral",
          category: "operational",
          state: "ready",
          description: "An active engine and current snapshot are mounted in World."
        }
      : {
          label: "Incomplete",
          tone: "neutral",
          category: "operational",
          state: "idle",
          description: "World does not currently expose both an active engine and a snapshot."
        },
    liveNonPersistent: true,
    configurationFingerprint: null,
    boundaryCopy: RUN_PROVENANCE_NON_PERSISTENT_COPY
  };
}

export function deriveRunObservationSummary(input: ActiveRunProvenanceInput): RunObservationSummary {
  const snapshot = input.snapshot ?? null;
  const latestMetricRecord = snapshot?.metricsHistory.at(-1);
  const metricLabelForKey = input.metricLabelForKey ?? humanizeKey;
  const maxMetricRows = Math.max(0, Math.min(input.maxMetricRows ?? 5, 8));
  const aliveEntityCount = snapshot?.entities.filter((entity) => entity.alive).length ?? 0;
  const metricRecordCount = snapshot?.metricsHistory.length ?? 0;
  const latestMetricRows = Object.entries(latestMetricRecord?.values ?? {})
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, maxMetricRows)
    .map(([key, value]) => ({
      key,
      label: metricLabelForKey(snapshot?.templateId ?? input.selectedTemplateId, key),
      value,
      valueLabel: formatDecimal(value, 3)
    }));

  return {
    runStatus: getRunStatusPillModel(input.isRunning),
    lifecycleStatus: deriveLifecycleStatus(input),
    runtimeStatusLabel: deriveRuntimeStatusLabel(input),
    tickLabel: snapshot ? formatInteger(snapshot.tick) : "No snapshot",
    timeLabel: snapshot ? formatDecimal(snapshot.time, 2) : "No snapshot",
    advancingLabel: input.isRunning ? "Advancing" : "Not advancing",
    aliveEntityCount,
    aliveEntityCountLabel: snapshot ? formatInteger(aliveEntityCount) : "No snapshot",
    metricRecordCount,
    metricRecordCountLabel: snapshot ? formatInteger(metricRecordCount) : "No snapshot",
    latestMetricRows,
    interventionCount: input.interventionCount ?? 0,
    boundaryCopy: RUN_OBSERVATION_MODEL_STATE_COPY
  };
}

export function deriveRunInterpretationBoundary(): RunInterpretationBoundary {
  return {
    evidenceStatus: {
      label: "Model output",
      tone: "neutral",
      category: "evidence",
      state: "unresolved",
      description: "This run needs external validation before it can support claims about a real system."
    },
    visualPatternCopy: RUN_INTERPRETATION_VISUAL_PATTERN_COPY,
    claimBoundaries: [
      "Configuration, seed, assumptions, and template limits shape every visible output.",
      "Runnable means the local template is producing model behavior; it does not mean the model has been validated.",
      "Interventions in this World run are model perturbations, not externally validated causal effects.",
      "Uncertainty and stochastic variation are model conditions here, not calibrated probabilities."
    ]
  };
}

function deriveLifecycleStatus(input: ActiveRunProvenanceInput): RunStatusModel {
  if (input.lastError) {
    return {
      label: "Failed",
      tone: "danger",
      category: "operational",
      state: "failed",
      description: "The active run has a recorded runtime error."
    };
  }
  if (input.isRunning) {
    return {
      label: "Running",
      tone: "accent",
      category: "operational",
      state: "running",
      description: "The active World run is advancing ticks."
    };
  }
  if (!input.hasActiveEngine || !input.snapshot) {
    return {
      label: "Not initialized",
      tone: "neutral",
      category: "operational",
      state: "idle",
      description: "No active engine and snapshot pair is mounted in World."
    };
  }
  if (input.snapshot.tick === 0) {
    return {
      label: "Initialized",
      tone: "neutral",
      category: "operational",
      state: "ready",
      description: "The active World run is initialized at tick 0 and not advancing."
    };
  }
  return {
    label: "Paused",
    tone: "neutral",
    category: "operational",
    state: "paused",
    description: "The active World run is paused at its current tick."
  };
}

function deriveRuntimeStatusLabel(input: ActiveRunProvenanceInput): string {
  if (input.lastError) {
    return "Failed with a runtime error";
  }
  if (!input.hasActiveEngine) {
    return "No active run mounted";
  }
  if (!input.snapshot) {
    return "Engine mounted without a current snapshot";
  }
  return "Active run mounted in World";
}

function resolveBehaviorModeLabel(
  template: ActiveRunProvenanceInput["template"],
  scenario: ScenarioVariantConfig | undefined
): string {
  const behaviorMode = scenario?.behaviorMode;
  if (!behaviorMode) {
    return "Default template behavior";
  }
  return template?.behaviorModes?.find((mode) => mode.id === behaviorMode)?.label ?? behaviorMode;
}

function resolveInitializationLabel(
  template: ActiveRunProvenanceInput["template"],
  initialization: InitializationConfig | undefined
): string {
  if (!initialization) {
    return "Default initialization";
  }
  const presetLabel = template?.initializationPresets?.find((preset) => preset.id === initialization.presetId)?.label;
  return presetLabel ?? initialization.presetId;
}

function countRecordKeys(record: ParameterValues | undefined): number {
  return Object.keys(record ?? {}).length;
}

function getStringMetadata(metadata: Record<string, JsonValue> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function formatInteger(value: number): string {
  return Number.isFinite(value) ? Math.trunc(value).toLocaleString() : "0";
}

function formatDecimal(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function humanizeKey(_templateId: string, key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/^\w/, (match) => match.toUpperCase());
}
