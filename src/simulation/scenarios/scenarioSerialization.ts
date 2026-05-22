import { SimulationSerializationError } from "../kernel/Errors";
import { parseScenarioJson, validateScenario } from "./scenarioValidation";
import type { AuthoredScenario } from "./scenarioTypes";

export function serializeAuthoredScenario(scenario: AuthoredScenario): string {
  return JSON.stringify(validateScenario(scenario).scenario, null, 2);
}

export function deserializeAuthoredScenario(json: string | unknown): AuthoredScenario {
  if (typeof json === "string") {
    return parseScenarioJson(json).scenario;
  }
  try {
    return validateScenario(json).scenario;
  } catch (error) {
    throw new SimulationSerializationError(error instanceof Error ? error.message : "Invalid scenario payload", { cause: error });
  }
}
