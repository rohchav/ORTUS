import { SimulationSerializationError } from "../kernel/Errors";
import { scaleModelArtifactType, type MultiScaleModel } from "./types";
import { parseMultiScaleModelJson, validateMultiScaleModel } from "./validation";

export function serializeMultiScaleModel(model: MultiScaleModel): string {
  return JSON.stringify(validateMultiScaleModel(model), null, 2);
}

export function deserializeMultiScaleModel(json: string | unknown): MultiScaleModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${scaleModelArtifactType}`);
  }
  return parseMultiScaleModelJson(json);
}
