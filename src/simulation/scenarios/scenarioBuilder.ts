import { SimulationEngine } from "../kernel/SimulationEngine";
import type { InitializationConfig, JsonValue, ParameterValues, SimulationSnapshotView, SimulationTemplate } from "../kernel/types";
import { appendSimulationEventLog } from "../kernel/EventLog";
import { deepClone, resolveParameters } from "../kernel/Validation";
import { runConfigFromScenario } from "../runs/runConfig";
import { getProductionTemplate } from "../templates/registry";
import {
  applyPresetParameterOverrides,
  defaultInitializationOptions,
  defaultInitializationPresetForTemplate,
  findInitializationPreset
} from "./scenarioPresets";
import {
  applyScenarioVariantParameterOverrides,
  defaultAgentCompositionForTemplate,
  defaultBehaviorModeForTemplate,
  defaultEnvironmentOptionsForTemplate,
  resolveScenarioVariantConfig,
  synchronizeVariantOptionsWithParameters
} from "./scenarioVariantTypes";
import { validateScenario, validateScenarioParameters } from "./scenarioValidation";
import { maxScenarioTags, scenarioArtifactType, type AuthoredScenario, type ScenarioValidationResult } from "./scenarioTypes";

export interface CreateDefaultScenarioOptions {
  template: SimulationTemplate;
  scenarioId?: string;
  now?: string;
  seed?: string;
  name?: string;
}

export interface ScenarioPreviewResult {
  snapshot: SimulationSnapshotView | null;
  errors: string[];
  warnings: string[];
}

export function createDefaultScenario(options: CreateDefaultScenarioOptions): AuthoredScenario {
  const now = options.now ?? new Date().toISOString();
  const preset = defaultInitializationPresetForTemplate(options.template);
  const baseParameters = resolveParameters(options.template.parameterDefinitions, {});
  const parameters = applyPresetParameterOverrides(options.template, preset, baseParameters);
  const agentComposition = defaultAgentCompositionForTemplate(options.template, parameters);
  const environmentOptions = defaultEnvironmentOptionsForTemplate(options.template, parameters);
  return validateScenario(
    {
      schemaVersion: "1",
      artifactType: scenarioArtifactType,
      scenarioId: options.scenarioId ?? createScenarioId(options.template.id, now),
      name: options.name ?? `${options.template.name} - ${preset.label}`,
      description: "",
      tags: [],
      templateId: options.template.id,
      templateVersion: options.template.version,
      seed: options.seed ?? "ortus-field-001",
      parameters,
      initializationPreset: preset.id,
      initializationOptions: defaultInitializationOptions(preset),
      agentComposition,
      behaviorMode: defaultBehaviorModeForTemplate(options.template).id,
      environmentOptions,
      metadata: {},
      createdAt: now,
      updatedAt: now
    },
    options.template
  ).scenario;
}

export function updateScenarioTemplate(scenario: AuthoredScenario, template: SimulationTemplate, now = new Date().toISOString()): AuthoredScenario {
  const next = createDefaultScenario({ template, now, seed: scenario.seed });
  return {
    ...next,
    scenarioId: createScenarioId(template.id, now),
    createdAt: now,
    updatedAt: now
  };
}

export function updateScenarioPreset(scenario: AuthoredScenario, presetId: string, now = new Date().toISOString()): AuthoredScenario {
  const template = requireScenarioTemplate(scenario.templateId);
  const preset = findInitializationPreset(template, presetId);
  if (!preset) {
    throw new Error(`Unknown initialization preset: ${presetId}`);
  }
  const parameters = applyPresetParameterOverrides(template, preset, scenario.parameters);
  const synced = synchronizeVariantOptionsWithParameters(template, scenario, parameters);
  return validateScenario({
    ...scenario,
    parameters,
    initializationPreset: preset.id,
    initializationOptions: defaultInitializationOptions(preset),
    agentComposition: synced.agentComposition,
    environmentOptions: synced.environmentOptions,
    updatedAt: now
  }).scenario;
}

export function patchScenarioParameters(scenario: AuthoredScenario, parameters: ParameterValues, now = new Date().toISOString()): AuthoredScenario {
  const template = requireScenarioTemplate(scenario.templateId);
  const resolved = validateScenarioParameters(template, parameters);
  const synced = synchronizeVariantOptionsWithParameters(template, scenario, resolved);
  return validateScenario({
    ...scenario,
    parameters: resolved,
    agentComposition: synced.agentComposition,
    environmentOptions: synced.environmentOptions,
    updatedAt: now
  }).scenario;
}

export function patchScenarioMetadata(
  scenario: AuthoredScenario,
  patch: Partial<Pick<AuthoredScenario, "name" | "description" | "seed" | "tags">>,
  now = new Date().toISOString()
): AuthoredScenario {
  return validateScenario({
    ...scenario,
    ...patch,
    name: patch.name?.trim() || scenario.name,
    seed: patch.seed?.trim() || scenario.seed,
    description: patch.description ?? scenario.description,
    tags: patch.tags ? normalizeTags(patch.tags) : scenario.tags,
    updatedAt: now
  }).scenario;
}

export function patchScenarioInitializationOptions(
  scenario: AuthoredScenario,
  options: ParameterValues,
  now = new Date().toISOString()
): AuthoredScenario {
  return validateScenario({
    ...scenario,
    initializationOptions: options,
    updatedAt: now
  }).scenario;
}

export function patchScenarioVariantOptions(
  scenario: AuthoredScenario,
  patch: Partial<Pick<AuthoredScenario, "agentComposition" | "behaviorMode" | "environmentOptions">>,
  now = new Date().toISOString()
): AuthoredScenario {
  const template = requireScenarioTemplate(scenario.templateId);
  const variant = resolveScenarioVariantConfig(
    template,
    {
      behaviorMode: patch.behaviorMode ?? scenario.behaviorMode,
      agentComposition: patch.agentComposition ?? scenario.agentComposition,
      environmentOptions: patch.environmentOptions ?? scenario.environmentOptions
    },
    scenario.parameters,
    { presetId: scenario.initializationPreset, options: scenario.initializationOptions }
  );
  const parameters = applyScenarioVariantParameterOverrides(template, scenario.parameters, variant);
  return validateScenario({
    ...scenario,
    parameters,
    agentComposition: variant.agentComposition,
    behaviorMode: variant.behaviorMode,
    environmentOptions: variant.environmentOptions,
    updatedAt: now
  }).scenario;
}

export function duplicateScenario(scenario: AuthoredScenario, now = new Date().toISOString(), scenarioId?: string): AuthoredScenario {
  return validateScenario({
    ...deepClone(scenario),
    scenarioId: scenarioId ?? createScenarioId(scenario.templateId, now),
    name: `${scenario.name} Copy`.slice(0, 120),
    createdAt: now,
    updatedAt: now
  }).scenario;
}

export function createEngineFromScenario(scenario: AuthoredScenario): { engine: SimulationEngine; validation: ScenarioValidationResult } {
  const validation = validateScenario(scenario);
  const template = requireScenarioTemplate(validation.scenario.templateId);
  const runConfig = runConfigFromScenario(validation.scenario);
  const initialization: InitializationConfig = {
    presetId: runConfig.initializationPreset ?? validation.scenario.initializationPreset,
    options: runConfig.initializationOptions ?? validation.scenario.initializationOptions
  };
  const scenarioOptions = {
    behaviorMode: runConfig.behaviorMode ?? validation.scenario.behaviorMode,
    agentComposition: runConfig.agentComposition ?? validation.scenario.agentComposition,
    environmentOptions: runConfig.environmentOptions ?? validation.scenario.environmentOptions,
    initialization
  };
  const engine = new SimulationEngine(template, {
    seed: runConfig.seed,
    parameters: runConfig.parameters,
    initialization,
    scenario: scenarioOptions,
    metadata: {
      ...runConfig.metadata,
      scenarioId: runConfig.scenarioId ?? validation.scenario.scenarioId,
      scenarioName: runConfig.scenarioName ?? validation.scenario.name,
      initializationPreset: initialization.presetId,
      initializationOptions: initialization.options as Record<string, JsonValue>,
      behaviorMode: scenarioOptions.behaviorMode,
      agentComposition: scenarioOptions.agentComposition as Record<string, JsonValue>,
      environmentOptions: scenarioOptions.environmentOptions as Record<string, JsonValue>
    }
  });
  appendSimulationEventLog(engine, {
    type: "scenario.applied",
    source: "scenarioBuilder",
    label: validation.scenario.name,
    category: "scenario",
    severity: "info",
    payload: {
      scenarioId: validation.scenario.scenarioId,
      scenarioName: validation.scenario.name,
      templateId: validation.scenario.templateId,
      behaviorMode: validation.scenario.behaviorMode,
      initializationPreset: validation.scenario.initializationPreset
    }
  });
  return { engine, validation };
}

export function previewScenario(scenario: AuthoredScenario): ScenarioPreviewResult {
  try {
    const { engine, validation } = createEngineFromScenario(scenario);
    return { snapshot: engine.createSnapshot(), errors: [], warnings: validation.warnings };
  } catch (error) {
    return {
      snapshot: null,
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: []
    };
  }
}

export function scenarioToSerializable(scenario: AuthoredScenario): AuthoredScenario {
  return validateScenario(scenario).scenario;
}

export function createScenarioId(templateId: string, value: string): string {
  return `scenario-${templateId}-${hashString(value).slice(0, 10)}`;
}

function requireScenarioTemplate(templateId: string): SimulationTemplate {
  const template = getProductionTemplate(templateId);
  if (!template) {
    throw new Error(`Unknown scenario template: ${templateId}`);
  }
  return template;
}

function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, maxScenarioTags);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
