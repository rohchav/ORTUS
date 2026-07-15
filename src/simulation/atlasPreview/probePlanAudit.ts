import { SimulationValidationError } from "../kernel/Errors";

export interface LandscapeProbePreviewFieldAudit {
  sourceField: string;
  previewV1Support: "planning-only" | "unsupported-for-execution";
  mappedPreviewRequestField: null;
  reason: string;
}

export interface LandscapeProbePreviewMappingAudit {
  status: "not-mappable";
  request: null;
  fields: readonly LandscapeProbePreviewFieldAudit[];
  reason: string;
}

const planningFoundationFields = ["title", "status", "principle", "boundary", "purpose", "concepts", "axes", "outcomes", "constraints", "scaffold", "boundaries"] as const;

export function auditLandscapeProbePlanForEphemeralPreview(): LandscapeProbePreviewMappingAudit {
  return {
    status: "not-mappable",
    request: null,
    fields: planningFoundationFields.map((sourceField) => ({
      sourceField,
      previewV1Support: "planning-only",
      mappedPreviewRequestField: null,
      reason: "The current foundation contains conceptual vocabulary, not stable runtime IDs or exact executable values."
    })),
    reason:
      "The current probe-planning foundation has no stable template, scenario, parameter ID, exact range, metric ID, seed set, or tick horizon. Mapping it would invent or silently discard execution fields."
  };
}

export function createEphemeralPreviewRequestFromLandscapeProbePlan(plan: unknown): never {
  const suppliedFields =
    typeof plan === "object" && plan !== null && !Array.isArray(plan) ? Object.keys(plan as Record<string, unknown>).sort() : [];
  const suffix = suppliedFields.length > 0 ? ` Supplied planning fields: ${suppliedFields.join(", ")}.` : "";
  throw new SimulationValidationError(
    `Landscape probe plans are not executable and cannot be converted by Preview V1.${suffix} Use the separate supported preview configuration.`
  );
}
