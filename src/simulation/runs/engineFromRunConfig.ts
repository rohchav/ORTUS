import { SimulationEngine } from "../kernel/SimulationEngine";
import type { InitializationConfig, SimulationRunConfig } from "../kernel/types";
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
