import { SimulationSerializationError } from "../kernel/Errors";
import { robustnessResilienceModelArtifactType, type RobustnessResilienceModel } from "./types";
import { parseRobustnessResilienceModelJson, validateRobustnessResilienceModel } from "./validation";

export function serializeRobustnessResilienceModel(model: RobustnessResilienceModel): string {
  return JSON.stringify(validateRobustnessResilienceModel(model), null, 2);
}

export function deserializeRobustnessResilienceModel(json: string | unknown): RobustnessResilienceModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${robustnessResilienceModelArtifactType}`);
  }
  return parseRobustnessResilienceModelJson(json);
}
