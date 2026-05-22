import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId, PrimitiveSupportLevel, PrimitiveCapabilityStatus } from "../registry/types";

export const hybridCompositionArtifactType = "ortus.hybridComposition";
export const maxHybridCompositionJsonLength = 200_000;
export const maxHybridCompositionMetadataJsonLength = 20_000;
export const maxHybridCompositionInlineDataJsonLength = 120_000;
export const maxHybridCompositionNoteLength = 1_200;
export const maxHybridCompositionAttachments = 64;
export const maxHybridCompositionRequirements = 64;
export const maxHybridCompositionNotes = 48;

export const primitiveAttachmentModes = ["reference", "inline", "declaredOnly"] as const;
export type PrimitiveAttachmentMode = (typeof primitiveAttachmentModes)[number];

export const primitiveAttachmentTypes = [
  "scenario",
  "snapshot",
  "uncertaintyConfig",
  "assumptionProfile",
  "networkDefinition",
  "resourceSystem",
  "eventSchedule",
  "delayQueue",
  "feedbackLoops",
  "scaleModel",
  "scaleViewState",
  "boundaryModel",
  "fieldLayer",
  "observabilityModel",
  "causalAssumptionModel",
  "quantitySemanticsModel",
  "emergencePatternModel",
  "robustnessResilienceModel",
  "controlStrategyModel",
  "declaredPrimitive",
  "reservedFuture"
] as const;
export type PrimitiveAttachmentType = (typeof primitiveAttachmentTypes)[number];

export type CompositionRequiredSupportLevel = Extract<PrimitiveSupportLevel, "runtime" | "service" | "metadata" | "documentation">;

export interface PrimitiveAttachment {
  id: string;
  primitiveId: PrimitiveId;
  attachmentType: PrimitiveAttachmentType;
  mode: PrimitiveAttachmentMode;
  artifactType?: string;
  artifactId?: string;
  inlineData?: JsonValue;
  active: boolean;
  required: boolean;
  notes?: string;
  metadata?: Record<string, JsonValue>;
}

export interface CapabilityRequirement {
  primitiveId: PrimitiveId;
  requiredSupportLevel: CompositionRequiredSupportLevel;
  requiredRuntimeActive?: boolean;
  reason?: string;
}

export interface HybridModelComposition {
  schemaVersion: "1";
  artifactType: typeof hybridCompositionArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  baseTemplateId?: string;
  primitiveAttachments: readonly PrimitiveAttachment[];
  requiredCapabilities: readonly CapabilityRequirement[];
  declaredCapabilities?: readonly CapabilityRequirement[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface MissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: CompositionRequiredSupportLevel;
  actualStatus: PrimitiveCapabilityStatus;
  actualSupportLevel: PrimitiveSupportLevel;
  templateId?: string;
  reason: string;
}

export interface CompositionValidationReport {
  compositionId: string;
  valid: boolean;
  runnableNow: boolean;
  missingCapabilities: readonly MissingCapability[];
  unsupportedAttachments: readonly string[];
  warnings: readonly string[];
  notes: readonly string[];
}

export interface CompositionSummary {
  id: string;
  name: string;
  baseTemplateId?: string;
  primitiveCount: number;
  activeAttachmentCount: number;
  declaredOnlyAttachmentCount: number;
  requiredCapabilityCount: number;
  runnableNow: boolean;
  warnings: readonly string[];
}

export interface CompositionArtifactRef {
  attachmentId: string;
  primitiveId: PrimitiveId;
  attachmentType: PrimitiveAttachmentType;
  artifactType?: string;
  artifactId?: string;
  mode: PrimitiveAttachmentMode;
  active: boolean;
  required: boolean;
}
