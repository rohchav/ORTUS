import type { InitializationPresetDefinition, ParameterValues, SimulationTemplate } from "../kernel/types";
import { deepClone, resolveParameters } from "../kernel/Validation";

export function initializationPresetsForTemplate(template: SimulationTemplate): readonly InitializationPresetDefinition[] {
  return template.initializationPresets && template.initializationPresets.length > 0
    ? template.initializationPresets
    : [defaultInitializationPreset];
}

export function defaultInitializationPresetForTemplate(template: SimulationTemplate): InitializationPresetDefinition {
  return initializationPresetsForTemplate(template)[0] ?? defaultInitializationPreset;
}

export function findInitializationPreset(template: SimulationTemplate, presetId: string): InitializationPresetDefinition | undefined {
  return initializationPresetsForTemplate(template).find((preset) => preset.id === presetId);
}

export function defaultInitializationOptions(preset: InitializationPresetDefinition): ParameterValues {
  return resolveParameters(preset.optionDefinitions ?? [], {});
}

export function applyPresetParameterOverrides(template: SimulationTemplate, preset: InitializationPresetDefinition, parameters: ParameterValues): ParameterValues {
  return resolveParameters(template.parameterDefinitions, {
    ...parameters,
    ...(preset.parameterOverrides ? deepClone(preset.parameterOverrides) : {})
  });
}

const defaultInitializationPreset: InitializationPresetDefinition = {
  id: "default",
  label: "Default Initialization",
  description: "Use the template default seeded initial world."
};
