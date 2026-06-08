export * from "./types";
export * from "./validation";
export * from "./query";
export * from "./summary";
export * from "./serialization";

import { getKnowledgeMemorySocialLearningWarnings } from "./summary";
import { validateKnowledgeMemorySocialLearningModel } from "./validation";
import type { KnowledgeMemorySocialLearningModel, KnowledgeMemorySocialLearningValidationReport } from "./types";

export function getKnowledgeMemorySocialLearningValidationReport(model: KnowledgeMemorySocialLearningModel | unknown): KnowledgeMemorySocialLearningValidationReport {
  try {
    const valid = validateKnowledgeMemorySocialLearningModel(model);
    return {
      modelId: valid.id,
      valid: true,
      runnableNow: false,
      socialLearningRuntimeAvailable: false,
      humanCognitionRuntimeAvailable: false,
      llmAgentRuntimeAvailable: false,
      errors: [],
      warnings: getKnowledgeMemorySocialLearningWarnings(valid),
      missingCapabilities: [
        "runtime social learning",
        "belief and memory runtime updates",
        "social exposure sampling",
        "Opinion Dynamics social-learning runtime integration",
        "human cognition runtime",
        "LLM-per-agent runtime",
        "protected-class inference safeguards",
        "persuasion/microtargeting prevention",
        "psychological validation",
        "empirical calibration",
        "real-person inference safeguards",
        "policy-guidance validation"
      ]
    };
  } catch (error) {
    return {
      modelId: readModelId(model),
      valid: false,
      runnableNow: false,
      socialLearningRuntimeAvailable: false,
      humanCognitionRuntimeAvailable: false,
      llmAgentRuntimeAvailable: false,
      errors: [error instanceof Error ? error.message : "Invalid knowledge/memory/social-learning model"],
      warnings: ["Invalid knowledge/memory/social-learning models are not runnable."],
      missingCapabilities: ["knowledge/memory/social-learning model validation"]
    };
  }
}

function readModelId(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return "unknown";
}
