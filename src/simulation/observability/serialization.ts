import { SimulationSerializationError } from "../kernel/Errors";
import { observabilityModelArtifactType, type ObservabilityModel } from "./types";
import { parseObservabilityModelJson, validateObservabilityModel } from "./validation";

export function serializeObservabilityModel(model: ObservabilityModel): string {
  return JSON.stringify(validateObservabilityModel(model), null, 2);
}

export function deserializeObservabilityModel(json: string | unknown): ObservabilityModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${observabilityModelArtifactType}`);
  }
  return parseObservabilityModelJson(json);
}
