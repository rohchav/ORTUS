import { SimulationSerializationError } from "../kernel/Errors";
import { quantitySemanticsModelArtifactType, type QuantitySemanticsModel } from "./types";
import { parseQuantitySemanticsModelJson, validateQuantitySemanticsModel } from "./validation";

export function serializeQuantitySemanticsModel(model: QuantitySemanticsModel): string {
  return JSON.stringify(validateQuantitySemanticsModel(model), null, 2);
}

export function deserializeQuantitySemanticsModel(json: string | unknown): QuantitySemanticsModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${quantitySemanticsModelArtifactType}`);
  }
  return parseQuantitySemanticsModelJson(json);
}
