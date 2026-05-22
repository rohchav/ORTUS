import { SimulationSerializationError } from "../kernel/Errors";
import { emergencePatternModelArtifactType, type EmergencePatternModel } from "./types";
import { parseEmergencePatternModelJson, validateEmergencePatternModel } from "./validation";

export function serializeEmergencePatternModel(model: EmergencePatternModel): string {
  return JSON.stringify(validateEmergencePatternModel(model), null, 2);
}

export function deserializeEmergencePatternModel(json: string | unknown): EmergencePatternModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${emergencePatternModelArtifactType}`);
  }
  return parseEmergencePatternModelJson(json);
}
