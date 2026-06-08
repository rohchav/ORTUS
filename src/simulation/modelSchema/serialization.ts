import { SimulationSerializationError } from "../kernel/Errors";
import { modelSchemaArtifactType, type ModelSchemaDefinition } from "./types";
import { parseModelSchemaJson, validateModelSchemaDefinition } from "./validation";

export function serializeModelSchema(schema: ModelSchemaDefinition): string {
  return JSON.stringify(validateModelSchemaDefinition(schema), null, 2);
}

export function deserializeModelSchema(json: string | unknown): ModelSchemaDefinition {
  if (typeof json !== "string" && (!json || typeof json !== "object" || Array.isArray(json))) {
    throw new SimulationSerializationError(`Expected artifact type ${modelSchemaArtifactType}`);
  }
  return parseModelSchemaJson(json);
}
