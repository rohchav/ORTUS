import type { PrimitiveId } from "../registry/types";
import { validateCompositionCapabilities } from "./capabilities";
import type { CompositionArtifactRef, HybridModelComposition, PrimitiveAttachment } from "./types";
import { validateHybridComposition } from "./validation";

export function getCompositionPrimitiveIds(composition: HybridModelComposition): readonly PrimitiveId[] {
  const valid = validateHybridComposition(composition);
  return [...new Set(valid.primitiveAttachments.map((attachment) => attachment.primitiveId))].sort();
}

export function getActiveAttachments(composition: HybridModelComposition): readonly PrimitiveAttachment[] {
  return clone(validatedAttachments(composition).filter((attachment) => attachment.active));
}

export function getDeclaredOnlyAttachments(composition: HybridModelComposition): readonly PrimitiveAttachment[] {
  return clone(validatedAttachments(composition).filter((attachment) => attachment.mode === "declaredOnly"));
}

export function getAttachmentsForPrimitive(composition: HybridModelComposition, primitiveId: PrimitiveId): readonly PrimitiveAttachment[] {
  return clone(validatedAttachments(composition).filter((attachment) => attachment.primitiveId === primitiveId));
}

export function getRequiredCapabilitiesForPrimitive(composition: HybridModelComposition, primitiveId: PrimitiveId) {
  const valid = validateHybridComposition(composition);
  return clone(valid.requiredCapabilities.filter((requirement) => requirement.primitiveId === primitiveId));
}

export function compositionUsesPrimitive(composition: HybridModelComposition, primitiveId: PrimitiveId): boolean {
  return validatedAttachments(composition).some((attachment) => attachment.primitiveId === primitiveId);
}

export function compositionRequiresRuntimeSupport(composition: HybridModelComposition, primitiveId: PrimitiveId): boolean {
  const valid = validateHybridComposition(composition);
  return valid.requiredCapabilities.some(
    (requirement) =>
      requirement.primitiveId === primitiveId && (requirement.requiredSupportLevel === "runtime" || requirement.requiredRuntimeActive === true)
  );
}

export function getCompositionArtifactRefs(composition: HybridModelComposition): readonly CompositionArtifactRef[] {
  const valid = validateHybridComposition(composition);
  return clone(
    valid.primitiveAttachments
      .filter((attachment) => attachment.artifactType || attachment.artifactId)
      .map((attachment) => ({
        attachmentId: attachment.id,
        primitiveId: attachment.primitiveId,
        attachmentType: attachment.attachmentType,
        artifactType: attachment.artifactType,
        artifactId: attachment.artifactId,
        mode: attachment.mode,
        active: attachment.active,
        required: attachment.required
      }))
  );
}

export function summarizeComposition(composition: HybridModelComposition) {
  const valid = validateHybridComposition(composition);
  const report = validateCompositionCapabilities(valid);
  return {
    id: valid.id,
    name: valid.name,
    ...(valid.baseTemplateId ? { baseTemplateId: valid.baseTemplateId } : {}),
    primitiveCount: getCompositionPrimitiveIds(valid).length,
    activeAttachmentCount: valid.primitiveAttachments.filter((attachment) => attachment.active).length,
    declaredOnlyAttachmentCount: valid.primitiveAttachments.filter((attachment) => attachment.mode === "declaredOnly").length,
    requiredCapabilityCount: valid.requiredCapabilities.length,
    runnableNow: report.runnableNow,
    warnings: report.warnings
  };
}

function validatedAttachments(composition: HybridModelComposition): readonly PrimitiveAttachment[] {
  return validateHybridComposition(composition).primitiveAttachments;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
