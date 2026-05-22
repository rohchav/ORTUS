import { SimulationSerializationError } from "../kernel/Errors";
import { fieldLayerArtifactType, type SpatialFieldModel } from "./types";
import { parseSpatialFieldModelJson, validateSpatialFieldModel } from "./validation";

export function serializeSpatialFieldModel(model: SpatialFieldModel): string {
  return JSON.stringify(validateSpatialFieldModel(model), null, 2);
}

export function deserializeSpatialFieldModel(json: string | unknown): SpatialFieldModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${fieldLayerArtifactType}`);
  }
  return parseSpatialFieldModelJson(json);
}
