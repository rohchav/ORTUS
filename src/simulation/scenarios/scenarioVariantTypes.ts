import { SimulationValidationError } from "../kernel/Errors";
import type { BehaviorModeDefinition, ParameterDefinition, ParameterValues, ScenarioVariantConfig, SimulationTemplate } from "../kernel/types";
import { resolveParameters } from "../kernel/Validation";

const defaultBehaviorMode: BehaviorModeDefinition = {
  id: "default",
  label: "Default",
  description: "Use the template's standard rule set."
};

export interface ScenarioVariantInput {
  behaviorMode?: string;
  agentComposition?: ParameterValues;
  environmentOptions?: ParameterValues;
}

export function behaviorModesForTemplate(template: SimulationTemplate): readonly BehaviorModeDefinition[] {
  return template.behaviorModes && template.behaviorModes.length > 0 ? template.behaviorModes : [defaultBehaviorMode];
}

export function defaultBehaviorModeForTemplate(template: SimulationTemplate): BehaviorModeDefinition {
  return behaviorModesForTemplate(template)[0] ?? defaultBehaviorMode;
}

export function findBehaviorMode(template: SimulationTemplate, behaviorModeId: string): BehaviorModeDefinition | undefined {
  return behaviorModesForTemplate(template).find((mode) => mode.id === behaviorModeId);
}

export function agentCompositionDefinitionsForTemplate(template: SimulationTemplate): readonly ParameterDefinition[] {
  return template.agentCompositionDefinitions ?? [];
}

export function environmentOptionDefinitionsForTemplate(template: SimulationTemplate): readonly ParameterDefinition[] {
  return template.environmentOptionDefinitions ?? [];
}

export function defaultAgentCompositionForTemplate(template: SimulationTemplate, parameters: ParameterValues): ParameterValues {
  return resolveParameters(agentCompositionDefinitionsForTemplate(template), optionDefaultsFromParameters(agentCompositionDefinitionsForTemplate(template), parameters));
}

export function defaultEnvironmentOptionsForTemplate(template: SimulationTemplate, parameters: ParameterValues): ParameterValues {
  return resolveParameters(environmentOptionDefinitionsForTemplate(template), optionDefaultsFromParameters(environmentOptionDefinitionsForTemplate(template), parameters));
}

export function resolveScenarioVariantConfig(
  template: SimulationTemplate,
  input: ScenarioVariantInput,
  parameters: ParameterValues,
  initialization?: ScenarioVariantConfig["initialization"]
): ScenarioVariantConfig {
  const behaviorMode = input.behaviorMode ?? defaultBehaviorModeForTemplate(template).id;
  if (!findBehaviorMode(template, behaviorMode)) {
    throw new SimulationValidationError(`Unsupported behavior mode: ${behaviorMode}`);
  }

  const agentComposition = resolveParameters(agentCompositionDefinitionsForTemplate(template), input.agentComposition ?? {});
  const environmentOptions = resolveParameters(environmentOptionDefinitionsForTemplate(template), input.environmentOptions ?? {});
  const config: ScenarioVariantConfig = {
    behaviorMode,
    agentComposition,
    environmentOptions,
    ...(initialization ? { initialization } : {})
  };
  template.validateScenarioOptions?.(config, parameters);
  return config;
}

export function applyScenarioVariantParameterOverrides(
  template: SimulationTemplate,
  parameters: ParameterValues,
  variant: Pick<ScenarioVariantConfig, "agentComposition" | "environmentOptions">
): ParameterValues {
  const parameterKeys = new Set(template.parameterDefinitions.map((definition) => definition.key));
  const overrides: ParameterValues = {};
  for (const values of [variant.agentComposition, variant.environmentOptions]) {
    for (const [key, value] of Object.entries(values)) {
      if (parameterKeys.has(key)) {
        overrides[key] = value;
      }
    }
  }
  return resolveParameters(template.parameterDefinitions, { ...parameters, ...overrides });
}

export function synchronizeVariantOptionsWithParameters(
  template: SimulationTemplate,
  values: Pick<ScenarioVariantConfig, "agentComposition" | "environmentOptions">,
  parameters: ParameterValues
): Pick<ScenarioVariantConfig, "agentComposition" | "environmentOptions"> {
  return {
    agentComposition: syncDefinitions(agentCompositionDefinitionsForTemplate(template), values.agentComposition, parameters),
    environmentOptions: syncDefinitions(environmentOptionDefinitionsForTemplate(template), values.environmentOptions, parameters)
  };
}

function syncDefinitions(definitions: readonly ParameterDefinition[], current: ParameterValues, parameters: ParameterValues): ParameterValues {
  const next = { ...current };
  for (const definition of definitions) {
    if (Object.prototype.hasOwnProperty.call(parameters, definition.key)) {
      next[definition.key] = parameters[definition.key]!;
    }
  }
  return resolveParameters(definitions, next);
}

function optionDefaultsFromParameters(definitions: readonly ParameterDefinition[], parameters: ParameterValues): ParameterValues {
  const supplied: ParameterValues = {};
  for (const definition of definitions) {
    if (Object.prototype.hasOwnProperty.call(parameters, definition.key)) {
      supplied[definition.key] = parameters[definition.key]!;
    }
  }
  return supplied;
}
