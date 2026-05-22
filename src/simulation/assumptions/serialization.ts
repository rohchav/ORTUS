import { SimulationSerializationError } from "../kernel/Errors";
import { assumptionProfileArtifactType, maxAssumptionProfileJsonLength, type ModelAssumptionProfile } from "./types";
import { validateAssumptionProfile } from "./validation";

export function serializeAssumptionProfileArtifact(profile: ModelAssumptionProfile): string {
  return JSON.stringify(validateAssumptionProfile(profile), null, 2);
}

export function deserializeAssumptionProfileArtifact(json: string | unknown): ModelAssumptionProfile {
  const raw = typeof json === "string" ? parseJson(json) : json;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid assumption profile artifact");
  }
  const artifactType = (raw as { artifactType?: unknown }).artifactType;
  if (artifactType !== assumptionProfileArtifactType) {
    throw new SimulationSerializationError("Invalid assumption profile artifact type");
  }
  const serialized = JSON.stringify(raw);
  if (serialized.length > maxAssumptionProfileJsonLength) {
    throw new SimulationSerializationError(`Assumption profile JSON must be ${maxAssumptionProfileJsonLength} characters or less`);
  }
  try {
    return validateAssumptionProfile(raw);
  } catch (error) {
    throw new SimulationSerializationError(error instanceof Error ? error.message : "Invalid assumption profile", { cause: error });
  }
}

function parseJson(json: string): unknown {
  if (json.length > maxAssumptionProfileJsonLength) {
    throw new SimulationSerializationError(`Assumption profile JSON must be ${maxAssumptionProfileJsonLength} characters or less`);
  }
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid assumption profile JSON", { cause: error });
  }
}
