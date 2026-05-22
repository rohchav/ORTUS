import { getPrimitive, getTemplateCapability } from "../registry/query";
import type { PrimitiveCapabilityStatus, PrimitiveId, PrimitiveSupportLevel } from "../registry/types";
import { validateHybridComposition } from "./validation";
import type { CompositionValidationReport, HybridModelComposition, MissingCapability, CapabilityRequirement, PrimitiveAttachment } from "./types";

export function validateCompositionCapabilities(value: HybridModelComposition): CompositionValidationReport {
  const composition = validateHybridComposition(value);
  const missingCapabilities: MissingCapability[] = [];
  const unsupportedAttachments: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  for (const requirement of composition.requiredCapabilities) {
    const missing = evaluateRequirement(composition.baseTemplateId, requirement);
    if (missing) {
      missingCapabilities.push(missing);
    }
  }

  for (const attachment of composition.primitiveAttachments) {
    const primitive = getPrimitive(attachment.primitiveId);
    if (!primitive) {
      continue;
    }
    if (attachment.mode === "declaredOnly") {
      notes.push(`Attachment ${attachment.id} declares ${attachment.primitiveId} without activating it.`);
      continue;
    }
    if (!attachment.active) {
      notes.push(`Attachment ${attachment.id} references ${attachment.primitiveId} but is not active in the composition.`);
      continue;
    }
    if (primitive.status === "serviceOnly" || primitive.status === "metadataOnly") {
      const capability = composition.baseTemplateId ? getTemplateCapability(composition.baseTemplateId, attachment.primitiveId) : undefined;
      if (!capability?.runtimeActive) {
        const message = `Attachment ${attachment.id} is structurally active, but ${attachment.primitiveId} is not runtime-active for the base template.`;
        warnings.push(message);
        if (attachment.required && composition.baseTemplateId) {
          unsupportedAttachments.push(attachment.id);
          missingCapabilities.push({
            primitiveId: attachment.primitiveId,
            requiredSupportLevel: "runtime",
            actualStatus: capability?.status ?? primitive.status,
            actualSupportLevel: capability?.supportLevel ?? primitive.supportLevel,
            templateId: composition.baseTemplateId,
            reason: "Required active attachment needs template runtime support to be runnable now."
          });
        }
      }
    }
  }

  return {
    compositionId: composition.id,
    valid: true,
    runnableNow: missingCapabilities.length === 0 && unsupportedAttachments.length === 0,
    missingCapabilities,
    unsupportedAttachments,
    warnings,
    notes
  };
}

function evaluateRequirement(baseTemplateId: string | undefined, requirement: CapabilityRequirement): MissingCapability | null {
  const primitive = getPrimitive(requirement.primitiveId);
  if (!primitive) {
    return {
      primitiveId: requirement.primitiveId,
      requiredSupportLevel: requirement.requiredSupportLevel,
      actualStatus: "unsupported",
      actualSupportLevel: "none",
      ...(baseTemplateId ? { templateId: baseTemplateId } : {}),
      reason: requirement.reason ?? "Unknown primitive requirement."
    };
  }

  if (requirement.requiredRuntimeActive || requirement.requiredSupportLevel === "runtime") {
    if (!baseTemplateId) {
      return missing(requirement, primitive.status, primitive.supportLevel, undefined, "Runtime support requires a base template.");
    }
    const capability = getTemplateCapability(baseTemplateId, requirement.primitiveId);
    if (!capability?.runtimeActive) {
      return missing(
        requirement,
        capability?.status ?? primitive.status,
        capability?.supportLevel ?? primitive.supportLevel,
        baseTemplateId,
        "Global service availability does not satisfy template runtime support."
      );
    }
    return null;
  }

  if (requirement.requiredSupportLevel === "service") {
    if (primitive.supportLevel === "service" || primitive.supportLevel === "runtime" || primitive.status === "implemented") {
      return null;
    }
    const capability = baseTemplateId ? getTemplateCapability(baseTemplateId, requirement.primitiveId) : undefined;
    if (capability?.serviceAvailable) {
      return null;
    }
    return missing(requirement, primitive.status, primitive.supportLevel, baseTemplateId, "Required service support is not available.");
  }

  if (requirement.requiredSupportLevel === "metadata") {
    const capability = baseTemplateId ? getTemplateCapability(baseTemplateId, requirement.primitiveId) : undefined;
    if (capability?.metadataAvailable || primitive.supportLevel === "metadata" || primitive.supportLevel === "runtime") {
      return null;
    }
    return missing(requirement, capability?.status ?? primitive.status, capability?.supportLevel ?? primitive.supportLevel, baseTemplateId, "Required metadata support is not available.");
  }

  if (requirement.requiredSupportLevel === "documentation") {
    if (primitive.supportLevel === "documentation" || primitive.docsRefs.length > 0) {
      return null;
    }
    return missing(requirement, primitive.status, primitive.supportLevel, baseTemplateId, "Required documentation support is not available.");
  }

  return null;
}

function missing(
  requirement: CapabilityRequirement,
  actualStatus: PrimitiveCapabilityStatus,
  actualSupportLevel: PrimitiveSupportLevel,
  templateId: string | undefined,
  fallbackReason: string
): MissingCapability {
  return {
    primitiveId: requirement.primitiveId,
    requiredSupportLevel: requirement.requiredSupportLevel,
    actualStatus,
    actualSupportLevel,
    ...(templateId ? { templateId } : {}),
    reason: requirement.reason ?? fallbackReason
  };
}

export function attachmentRequiresRuntimeSupport(attachment: PrimitiveAttachment, baseTemplateId?: string): boolean {
  if (!attachment.active || !attachment.required || !baseTemplateId) {
    return false;
  }
  const capability = getTemplateCapability(baseTemplateId, attachment.primitiveId);
  return !Boolean(capability?.runtimeActive);
}
