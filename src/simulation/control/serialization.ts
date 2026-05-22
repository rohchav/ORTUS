import { SimulationSerializationError } from "../kernel/Errors";
import { controlStrategyModelArtifactType, type ControlStrategyModel } from "./types";
import { parseControlStrategyModelJson, validateControlStrategyModel } from "./validation";

export function serializeControlStrategyModel(model: ControlStrategyModel): string {
  return JSON.stringify(validateControlStrategyModel(model), null, 2);
}

export function deserializeControlStrategyModel(json: string | unknown): ControlStrategyModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${controlStrategyModelArtifactType}`);
  }
  return parseControlStrategyModelJson(json);
}
