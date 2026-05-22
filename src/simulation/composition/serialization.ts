import { SimulationSerializationError } from "../kernel/Errors";
import { hybridCompositionArtifactType, type HybridModelComposition } from "./types";
import { parseHybridCompositionJson, validateHybridComposition } from "./validation";

export function serializeHybridComposition(composition: HybridModelComposition): string {
  return JSON.stringify(validateHybridComposition(composition), null, 2);
}

export function deserializeHybridComposition(json: string | unknown): HybridModelComposition {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${hybridCompositionArtifactType}`);
  }
  return parseHybridCompositionJson(json);
}
