import type { InitializationConfig, JsonValue, ParameterValues, SimulationRunConfig, SimulationTemplate } from "../kernel/types";
import { assertSerializableValue, deepClone, resolveParameters } from "../kernel/Validation";
import { getProductionTemplate } from "../templates/registry";
import { buildAssumptionProvenance } from "../assumptions/summary";
import {
  applyPresetParameterOverrides,
  defaultInitializationOptions,
  defaultInitializationPresetForTemplate,
  findInitializationPreset
} from "../scenarios/scenarioPresets";
import {
  applyScenarioVariantParameterOverrides,
  defaultAgentCompositionForTemplate,
  defaultBehaviorModeForTemplate,
  defaultEnvironmentOptionsForTemplate,
  resolveScenarioVariantConfig
} from "../scenarios/scenarioVariantTypes";
import type { AuthoredScenario } from "../scenarios/scenarioTypes";

export interface CreateDefaultRunConfigOptions {
  template: SimulationTemplate;
  seed?: string;
  metadata?: Record<string, JsonValue>;
}

export function createDefaultRunConfig(options: CreateDefaultRunConfigOptions): SimulationRunConfig {
  const preset = defaultInitializationPresetForTemplate(options.template);
  const baseParameters = resolveParameters(options.template.parameterDefinitions, {});
  const parameters = applyPresetParameterOverrides(options.template, preset, baseParameters);
  return validateRunConfig(
    {
      schemaVersion: "1",
      templateId: options.template.id,
      seed: options.seed ?? "ortus-field-001",
      parameters,
      initializationPreset: preset.id,
      initializationOptions: defaultInitializationOptions(preset),
      agentComposition: defaultAgentCompositionForTemplate(options.template, parameters),
      behaviorMode: defaultBehaviorModeForTemplate(options.template).id,
      environmentOptions: defaultEnvironmentOptionsForTemplate(options.template, parameters),
      metadata: options.metadata ?? {}
    },
    options.template
  );
}

export function runConfigFromScenario(scenario: AuthoredScenario): SimulationRunConfig {
  const template = getProductionTemplate(scenario.templateId);
  const assumptionProvenance = template ? buildAssumptionProvenance({ template, scenario }) : undefined;
  return validateRunConfig({
    schemaVersion: "1",
    templateId: scenario.templateId,
    seed: scenario.seed,
    parameters: scenario.parameters,
    scenarioId: scenario.scenarioId,
    scenarioName: scenario.name,
    initializationPreset: scenario.initializationPreset,
    initializationOptions: scenario.initializationOptions,
    agentComposition: scenario.agentComposition,
    behaviorMode: scenario.behaviorMode,
    environmentOptions: scenario.environmentOptions,
    metadata: {
      ...scenario.metadata,
      ...(assumptionProvenance ? { assumptionProvenance } : {})
    }
  });
}

export function validateRunConfig(config: SimulationRunConfig, template?: SimulationTemplate): SimulationRunConfig {
  assertKnownRunConfigFields(config);
  const resolvedTemplate = template ?? getProductionTemplate(config.templateId);
  if (!resolvedTemplate) {
    throw new Error(`Unknown run config template: ${config.templateId}`);
  }
  if (config.schemaVersion !== "1") {
    throw new Error("RunConfig schemaVersion must be 1");
  }
  if (config.templateId !== resolvedTemplate.id) {
    throw new Error(`RunConfig template ${config.templateId} does not match template ${resolvedTemplate.id}`);
  }
  if (typeof config.seed !== "string" || config.seed.trim().length === 0) {
    throw new Error("RunConfig seed must be a non-empty string");
  }
  assertSerializableValue(config.parameters, "run config parameters");
  if (config.uncertaintyConfig !== undefined) {
    assertSerializableValue(config.uncertaintyConfig, "run config uncertaintyConfig");
  }
  if (config.metadata !== undefined) {
    assertSerializableValue(config.metadata, "run config metadata");
  }

  const preset = config.initializationPreset ? findInitializationPreset(resolvedTemplate, config.initializationPreset) : undefined;
  if (config.initializationPreset && !preset) {
    throw new Error(`Unknown run config initialization preset: ${config.initializationPreset}`);
  }
  const initializationOptions = preset
    ? resolveParameters(preset.optionDefinitions ?? [], config.initializationOptions ?? {})
    : config.initializationOptions
      ? resolveParameters([], config.initializationOptions)
      : undefined;
  const initialization: InitializationConfig | undefined = preset
    ? {
        presetId: preset.id,
        options: initializationOptions ?? {}
      }
    : undefined;

  const baseParameters = resolveParameters(resolvedTemplate.parameterDefinitions, config.parameters);
  const variant = resolveScenarioVariantConfig(
    resolvedTemplate,
    {
      behaviorMode: config.behaviorMode ?? defaultBehaviorModeForTemplate(resolvedTemplate).id,
      agentComposition: config.agentComposition ?? defaultAgentCompositionForTemplate(resolvedTemplate, baseParameters),
      environmentOptions: config.environmentOptions ?? defaultEnvironmentOptionsForTemplate(resolvedTemplate, baseParameters)
    },
    baseParameters,
    initialization
  );
  const parameters = applyScenarioVariantParameterOverrides(resolvedTemplate, baseParameters, variant);
  const finalVariant = resolveScenarioVariantConfig(resolvedTemplate, variant, parameters, initialization);
  if (initialization) {
    resolvedTemplate.validateInitializationOptions?.(initialization, parameters);
  }
  resolvedTemplate.validateParameters?.(parameters);

  return {
    schemaVersion: "1",
    templateId: resolvedTemplate.id,
    seed: config.seed.trim(),
    parameters: deepClone(parameters),
    ...(config.scenarioId ? { scenarioId: config.scenarioId } : {}),
    ...(config.scenarioName ? { scenarioName: config.scenarioName } : {}),
    ...(initialization ? { initializationPreset: initialization.presetId, initializationOptions: deepClone(initialization.options) as ParameterValues } : {}),
    agentComposition: deepClone(finalVariant.agentComposition),
    behaviorMode: finalVariant.behaviorMode,
    environmentOptions: deepClone(finalVariant.environmentOptions),
    ...(config.uncertaintyConfig ? { uncertaintyConfig: deepClone(config.uncertaintyConfig) } : {}),
    metadata: deepClone(config.metadata ?? {})
  };
}

const allowedRunConfigFields = new Set([
  "schemaVersion",
  "templateId",
  "seed",
  "parameters",
  "scenarioId",
  "scenarioName",
  "initializationPreset",
  "initializationOptions",
  "agentComposition",
  "behaviorMode",
  "environmentOptions",
  "uncertaintyConfig",
  "metadata"
]);

function assertKnownRunConfigFields(config: SimulationRunConfig): void {
  for (const key of Object.keys(config as unknown as Record<string, unknown>)) {
    if (!allowedRunConfigFields.has(key)) {
      throw new Error(`Unsupported RunConfig field: ${key}`);
    }
  }
}
