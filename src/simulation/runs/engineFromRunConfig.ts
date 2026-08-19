import { SimulationEngine } from "../kernel/SimulationEngine";
import type {
  InitializationConfig,
  JsonValue,
  ParameterValues,
  ScenarioExport,
  SimulationRunConfig,
  SnapshotExport
} from "../kernel/types";
import { getProductionTemplate } from "../templates/registry";
import { validateRunConfig } from "./runConfig";

export function createEngineFromRunConfig(runConfig: SimulationRunConfig): SimulationEngine {
  const validated = validateRunConfig(runConfig);
  const template = getProductionTemplate(validated.templateId);
  if (!template) {
    throw new Error(`Unknown run config template: ${validated.templateId}`);
  }
  const initialization: InitializationConfig | undefined = validated.initializationPreset
    ? {
        presetId: validated.initializationPreset,
        options: validated.initializationOptions ?? {}
      }
    : undefined;

  return new SimulationEngine(template, {
    seed: validated.seed,
    parameters: validated.parameters,
    ...(initialization ? { initialization } : {}),
    scenario: {
      behaviorMode: validated.behaviorMode ?? "default",
      agentComposition: validated.agentComposition ?? {},
      environmentOptions: validated.environmentOptions ?? {},
      ...(initialization ? { initialization } : {})
    },
    metadata: validated.metadata ?? {}
  });
}

const runtimeRunConfigMetadataKey = "ortusRuntimeRunConfigV1";
const runtimeRunConfigEnvelopeKind = "ortus-runtime-run-config";

export function withRuntimeArtifactMetadata(runConfig: SimulationRunConfig): SimulationRunConfig {
  const validated = validateRunConfig(runConfig);
  const sourceMetadata = validated.metadata ?? {};
  const preservedMetadataValuePresent = Object.prototype.hasOwnProperty.call(sourceMetadata, runtimeRunConfigMetadataKey);
  const runtimeRecipe: ParameterValues = {
    ...(validated.scenarioId ? { scenarioId: validated.scenarioId } : {}),
    ...(validated.scenarioName ? { scenarioName: validated.scenarioName } : {}),
    ...(validated.initializationPreset ? { initializationPreset: validated.initializationPreset } : {}),
    ...(validated.initializationOptions ? { initializationOptions: validated.initializationOptions } : {}),
    ...(validated.behaviorMode ? { behaviorMode: validated.behaviorMode } : {}),
    ...(validated.agentComposition ? { agentComposition: validated.agentComposition } : {}),
    ...(validated.environmentOptions ? { environmentOptions: validated.environmentOptions } : {})
  };
  return {
    ...validated,
    metadata: {
      ...sourceMetadata,
      [runtimeRunConfigMetadataKey]: {
        kind: runtimeRunConfigEnvelopeKind,
        schemaVersion: "1",
        runConfig: runtimeRecipe,
        preservedMetadataValuePresent,
        ...(preservedMetadataValuePresent
          ? { preservedMetadataValue: sourceMetadata[runtimeRunConfigMetadataKey]! }
          : {})
      }
    }
  };
}

export function runConfigFromArtifact(artifact: ScenarioExport | SnapshotExport): SimulationRunConfig {
  const runtimeEnvelope = runtimeMetadataEnvelope(artifact.metadata[runtimeRunConfigMetadataKey]);
  const runtimeRecipe = metadataRecord(runtimeEnvelope?.runConfig) ?? {};
  const metadata = { ...artifact.metadata };
  if (runtimeEnvelope) {
    delete metadata[runtimeRunConfigMetadataKey];
    if (
      runtimeEnvelope.preservedMetadataValuePresent === true
      && Object.prototype.hasOwnProperty.call(runtimeEnvelope, "preservedMetadataValue")
    ) {
      metadata[runtimeRunConfigMetadataKey] = runtimeEnvelope.preservedMetadataValue!;
    }
  }
  const scenarioId = metadataString(runtimeRecipe.scenarioId);
  const scenarioName = metadataString(runtimeRecipe.scenarioName);
  const initializationPreset = metadataString(runtimeRecipe.initializationPreset);
  const initializationOptions = metadataRecord(runtimeRecipe.initializationOptions);
  const behaviorMode = metadataString(runtimeRecipe.behaviorMode);
  const agentComposition = metadataRecord(runtimeRecipe.agentComposition);
  const environmentOptions = metadataRecord(runtimeRecipe.environmentOptions);
  return validateRunConfig({
    schemaVersion: "1",
    templateId: artifact.templateId,
    seed: artifact.seed,
    parameters: artifact.parameters,
    ...(scenarioId ? { scenarioId } : {}),
    ...(scenarioName ? { scenarioName } : {}),
    ...(initializationPreset ? { initializationPreset } : {}),
    ...(initializationOptions ? { initializationOptions } : {}),
    ...(behaviorMode ? { behaviorMode } : {}),
    ...(agentComposition ? { agentComposition } : {}),
    ...(environmentOptions ? { environmentOptions } : {}),
    metadata
  });
}

function runtimeMetadataEnvelope(value: JsonValue | undefined): ParameterValues | undefined {
  const candidate = metadataRecord(value);
  return candidate?.kind === runtimeRunConfigEnvelopeKind
    && candidate.schemaVersion === "1"
    && typeof candidate.preservedMetadataValuePresent === "boolean"
    && metadataRecord(candidate.runConfig)
    ? candidate
    : undefined;
}

function metadataString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function metadataRecord(value: JsonValue | undefined): ParameterValues | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as ParameterValues
    : undefined;
}
