import { SimulationSerializationError } from "../kernel/Errors";
import { boundaryModelArtifactType, type BoundaryEnvironmentModel } from "./types";
import { parseBoundaryEnvironmentModelJson, validateBoundaryEnvironmentModel } from "./validation";

export function serializeBoundaryEnvironmentModel(model: BoundaryEnvironmentModel): string {
  return JSON.stringify(validateBoundaryEnvironmentModel(model), null, 2);
}

export function deserializeBoundaryEnvironmentModel(json: string | unknown): BoundaryEnvironmentModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${boundaryModelArtifactType}`);
  }
  return parseBoundaryEnvironmentModelJson(json);
}
