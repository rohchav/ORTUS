import { SimulationSerializationError } from "../kernel/Errors";
import { causalAssumptionModelArtifactType, type CausalAssumptionModel } from "./types";
import { parseCausalAssumptionModelJson, validateCausalAssumptionModel } from "./validation";

export function serializeCausalAssumptionModel(model: CausalAssumptionModel): string {
  return JSON.stringify(validateCausalAssumptionModel(model), null, 2);
}

export function deserializeCausalAssumptionModel(json: string | unknown): CausalAssumptionModel {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${causalAssumptionModelArtifactType}`);
  }
  return parseCausalAssumptionModelJson(json);
}
