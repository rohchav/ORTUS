import { getModelSchemaWarnings } from "./summary";
import { validateModelSchemaDefinition } from "./validation";
import type { ModelInterpreterCapabilityReport, ModelRuleKind, ModelSchemaDefinition } from "./types";

export function getModelInterpreterCapabilityReport(schema: ModelSchemaDefinition | unknown): ModelInterpreterCapabilityReport {
  try {
    const valid = validateModelSchemaDefinition(schema);
    const unsupportedRuleKinds = Array.from(new Set((valid.ruleDeclarations ?? []).map((rule) => rule.ruleKind))).sort() as ModelRuleKind[];
    return {
      modelId: valid.id,
      valid: true,
      runnableNow: false,
      interpreterAvailable: false,
      executableRuleCount: 0,
      unsupportedRuleKinds,
      missingRuntimeCapabilities: buildMissingRuntimeCapabilities(unsupportedRuleKinds),
      warnings: [
        "Model schemas declare model structure; they do not execute rules or create runnable simulations.",
        "A valid model schema is not a template, scenario, RunConfig, or snapshot.",
        "Rule declarations are descriptive metadata, not parsed formulas or executable behavior.",
        ...getModelSchemaWarnings(valid)
      ],
      errors: []
    };
  } catch (error) {
    return {
      modelId: readModelId(schema),
      valid: false,
      runnableNow: false,
      interpreterAvailable: false,
      executableRuleCount: 0,
      unsupportedRuleKinds: [],
      missingRuntimeCapabilities: ["model schema validation"],
      warnings: ["No model schema interpreter exists in V1; invalid schemas are not runnable."],
      errors: [error instanceof Error ? error.message : "Invalid model schema"]
    };
  }
}

function buildMissingRuntimeCapabilities(ruleKinds: readonly ModelRuleKind[]): readonly string[] {
  const capabilities = new Set<string>([
    "safe model schema interpreter",
    "model compiler",
    "custom simulation runtime",
    "visual model builder",
    "template generation",
    "scenario/RunConfig/snapshot generation"
  ]);
  for (const ruleKind of ruleKinds) {
    switch (ruleKind) {
      case "agentBehavior":
      case "movement":
      case "interaction":
      case "stateTransition":
        capabilities.add("runtime agent rule interpreter");
        break;
      case "networkUpdate":
        capabilities.add("network runtime mutation");
        break;
      case "resourceFlow":
        capabilities.add("resource/stock-flow runtime execution");
        break;
      case "eventEmission":
      case "feedbackAdjustment":
        capabilities.add("feedback/event runtime execution");
        break;
      case "observation":
        capabilities.add("observability runtime measurement");
        break;
      case "controlPolicy":
        capabilities.add("strategy/control runtime execution");
        break;
      case "aggregation":
      case "disaggregation":
        capabilities.add("multi-scale runtime aggregation/disaggregation");
        break;
      case "socialLearning":
      case "memoryUpdate":
      case "beliefUpdate":
        capabilities.add("social/cognitive runtime");
        break;
      case "custom":
        capabilities.add("custom rule runtime");
        break;
    }
  }
  return Array.from(capabilities);
}

function readModelId(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return "unknown";
}
