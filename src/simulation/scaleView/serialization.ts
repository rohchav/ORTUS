import { SimulationSerializationError } from "../kernel/Errors";
import { scaleViewStateArtifactType, type ScaleViewState } from "./types";
import { parseScaleViewStateJson, validateScaleViewState } from "./validation";

export function serializeScaleViewState(viewState: ScaleViewState): string {
  return JSON.stringify(validateScaleViewState(viewState), null, 2);
}

export function deserializeScaleViewState(json: string | unknown): ScaleViewState {
  if (typeof json !== "string" && (!json || typeof json !== "object")) {
    throw new SimulationSerializationError(`Expected artifact type ${scaleViewStateArtifactType}`);
  }
  return parseScaleViewStateJson(json);
}
