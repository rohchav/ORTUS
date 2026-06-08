import { SimulationSerializationError } from "../kernel/Errors";
import { visualBuilderWorkspaceArtifactType, type VisualBuilderWorkspaceDefinition } from "./types";
import { parseVisualBuilderWorkspaceJson, validateVisualBuilderWorkspaceDefinition } from "./validation";

export function serializeVisualBuilderWorkspace(workspace: VisualBuilderWorkspaceDefinition): string {
  return JSON.stringify(validateVisualBuilderWorkspaceDefinition(workspace), null, 2);
}

export function deserializeVisualBuilderWorkspace(json: string | unknown): VisualBuilderWorkspaceDefinition {
  if (typeof json !== "string" && (!json || typeof json !== "object" || Array.isArray(json))) {
    throw new SimulationSerializationError(`Expected artifact type ${visualBuilderWorkspaceArtifactType}`);
  }
  return parseVisualBuilderWorkspaceJson(json);
}
