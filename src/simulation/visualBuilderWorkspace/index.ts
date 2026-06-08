export * from "./types";
export * from "./validation";
export * from "./query";
export * from "./summary";
export * from "./serialization";

import { getVisualBuilderWorkspaceWarnings } from "./summary";
import { validateVisualBuilderWorkspaceDefinition } from "./validation";
import type { VisualBuilderWorkspaceDefinition, VisualBuilderWorkspaceValidationReport } from "./types";

export function getVisualBuilderWorkspaceValidationReport(workspace: VisualBuilderWorkspaceDefinition | unknown): VisualBuilderWorkspaceValidationReport {
  try {
    const valid = validateVisualBuilderWorkspaceDefinition(workspace);
    return {
      workspaceId: valid.id,
      valid: true,
      runnableNow: false,
      visualBuilderRuntimeAvailable: false,
      schemaExecutionAvailable: false,
      compilerAvailable: false,
      errors: [],
      warnings: getVisualBuilderWorkspaceWarnings(valid),
      missingCapabilities: [
        "visual builder UI/runtime",
        "node editor",
        "drag-and-drop modeling",
        "graph execution",
        "visual programming",
        "schema execution",
        "compiler/interpreter runtime",
        "scenario generation",
        "RunConfig generation",
        "snapshot generation",
        "template generation",
        "engine creation",
        "external framework interop",
        "custom model runtime",
        "social-learning runtime",
        "LLM-agent runtime"
      ]
    };
  } catch (error) {
    return {
      workspaceId: readWorkspaceId(workspace),
      valid: false,
      runnableNow: false,
      visualBuilderRuntimeAvailable: false,
      schemaExecutionAvailable: false,
      compilerAvailable: false,
      errors: [error instanceof Error ? error.message : "Invalid visual builder workspace"],
      warnings: ["Invalid visual builder workspaces are not runnable."],
      missingCapabilities: ["visual builder workspace validation"]
    };
  }
}

function readWorkspaceId(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return "unknown";
}
