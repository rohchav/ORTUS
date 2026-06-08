export * from "./types";
export * from "./validation";
export * from "./fit";
export * from "./query";
export * from "./summary";
export * from "./serialization";

import { getSchemaTemplateCompatibilityWarnings } from "./summary";
import type { SchemaTemplateCompatibilityReport, SchemaTemplateCompatibilityValidationReport } from "./types";
import { validateSchemaTemplateCompatibilityReport } from "./validation";

export function getSchemaTemplateCompatibilityValidationReport(
  report: SchemaTemplateCompatibilityReport | unknown
): SchemaTemplateCompatibilityValidationReport {
  try {
    const valid = validateSchemaTemplateCompatibilityReport(report);
    return {
      reportId: valid.id,
      valid: true,
      runnableNow: false,
      schemaExecutionAvailable: false,
      conversionAvailable: false,
      scenarioGenerationAvailable: false,
      runConfigGenerationAvailable: false,
      generationAvailable: false,
      validationAvailable: false,
      calibrationAvailable: false,
      errors: [],
      warnings: getSchemaTemplateCompatibilityWarnings(valid),
      missingCapabilities: [
        "ModelSchemaDefinition runtime interpreter",
        "schema-to-template conversion",
        "scenario generation",
        "RunConfig generation",
        "snapshot generation",
        "template generation",
        "engine creation",
        "visual builder runtime",
        "external framework interop",
        "social-learning runtime",
        "scientific validation",
        "calibration evidence"
      ]
    };
  } catch (error) {
    return {
      reportId: readReportId(report),
      valid: false,
      runnableNow: false,
      schemaExecutionAvailable: false,
      conversionAvailable: false,
      scenarioGenerationAvailable: false,
      runConfigGenerationAvailable: false,
      generationAvailable: false,
      validationAvailable: false,
      calibrationAvailable: false,
      errors: [error instanceof Error ? error.message : "Invalid schema/template compatibility report"],
      warnings: ["Invalid compatibility reports are not runnable."],
      missingCapabilities: ["schema/template compatibility report validation"]
    };
  }
}

function readReportId(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return "unknown";
}
