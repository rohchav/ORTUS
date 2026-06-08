import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { validateAssumptionProfile } from "../assumptions/validation";
import { validateDelayQueueArtifact, validateEventScheduleArtifact, validateFeedbackLoopsArtifact } from "../feedback/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import { validateNetworkDefinition } from "../networks/validation";
import { getArtifactFamily, getPrimitive } from "../registry/query";
import { primitiveIds } from "../registry/types";
import { getProductionTemplate } from "../templates/registry";
import { validateResourceSystemState } from "../resources/validation";
import {
  hybridCompositionArtifactType,
  maxHybridCompositionAttachments,
  maxHybridCompositionInlineDataJsonLength,
  maxHybridCompositionJsonLength,
  maxHybridCompositionMetadataJsonLength,
  maxHybridCompositionNoteLength,
  maxHybridCompositionNotes,
  maxHybridCompositionRequirements,
  primitiveAttachmentModes,
  primitiveAttachmentTypes,
  type CapabilityRequirement,
  type HybridModelComposition,
  type PrimitiveAttachment,
  type PrimitiveAttachmentType
} from "./types";

const requiredSupportLevelValues = ["runtime", "service", "metadata", "documentation"] as const;

const capabilityRequirementSchema = z
  .object({
    primitiveId: z.enum(primitiveIds),
    requiredSupportLevel: z.enum(requiredSupportLevelValues),
    requiredRuntimeActive: z.boolean().optional(),
    reason: z.string().max(maxHybridCompositionNoteLength).optional()
  })
  .strict();

const primitiveAttachmentSchema = z
  .object({
    id: z.string().min(1).max(160),
    primitiveId: z.enum(primitiveIds),
    attachmentType: z.enum(primitiveAttachmentTypes),
    mode: z.enum(primitiveAttachmentModes),
    artifactType: z.string().min(1).max(160).optional(),
    artifactId: z.string().min(1).max(240).optional(),
    inlineData: jsonValueSchema.optional(),
    active: z.boolean(),
    required: z.boolean(),
    notes: z.string().max(maxHybridCompositionNoteLength).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const hybridCompositionSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(hybridCompositionArtifactType),
    id: z.string().min(1).max(160),
    name: z.string().min(1).max(180),
    description: z.string().max(2_000).optional(),
    version: z.string().min(1).max(80),
    baseTemplateId: z.string().min(1).max(160).optional(),
    primitiveAttachments: z.array(primitiveAttachmentSchema).max(maxHybridCompositionAttachments),
    requiredCapabilities: z.array(capabilityRequirementSchema).max(maxHybridCompositionRequirements),
    declaredCapabilities: z.array(capabilityRequirementSchema).max(maxHybridCompositionRequirements).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxHybridCompositionNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxHybridCompositionNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxHybridCompositionNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const attachmentTypeArtifactTypes: Record<PrimitiveAttachmentType, readonly string[]> = {
  scenario: ["ortus.scenario"],
  snapshot: ["ortus.snapshot"],
  uncertaintyConfig: ["ortus.uncertaintyConfig"],
  assumptionProfile: ["ortus.assumptionProfile"],
  networkDefinition: ["ortus.networkDefinition"],
  resourceSystem: ["ortus.resourceSystem"],
  eventSchedule: ["ortus.eventSchedule"],
  delayQueue: ["ortus.delayQueue"],
  feedbackLoops: ["ortus.feedbackLoops"],
  scaleModel: ["ortus.scaleModel"],
  scaleViewState: ["ortus.scaleViewState"],
  boundaryModel: ["ortus.boundaryModel"],
  fieldLayer: ["ortus.fieldLayer"],
  observabilityModel: ["ortus.observabilityModel"],
  causalAssumptionModel: ["ortus.causalAssumptionModel"],
  quantitySemanticsModel: ["ortus.quantitySemanticsModel"],
  emergencePatternModel: ["ortus.emergencePatternModel"],
  robustnessResilienceModel: ["ortus.robustnessResilienceModel"],
  controlStrategyModel: ["ortus.controlStrategyModel"],
  modelSchema: ["ortus.modelSchema"],
  knowledgeMemorySocialLearningModel: ["ortus.knowledgeMemorySocialLearningModel"],
  visualBuilderWorkspace: ["ortus.visualBuilderWorkspace"],
  schemaTemplateCompatibilityReport: ["ortus.schemaTemplateCompatibilityReport"],
  templateMappingProfile: ["ortus.templateMappingProfile"],
  declaredPrimitive: [],
  reservedFuture: []
};

const inlineSupportedArtifactTypes = new Set([
  "ortus.assumptionProfile",
  "ortus.networkDefinition",
  "ortus.resourceSystem",
  "ortus.eventSchedule",
  "ortus.delayQueue",
  "ortus.feedbackLoops"
]);

const forbiddenCompositionKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "runState",
  "runSummary",
  "runSummaries",
  "template",
  "activeEngine"
]);

export function validateHybridComposition(value: unknown): HybridModelComposition {
  assertPlainCompositionJson(value, "Hybrid composition");
  const parsed = hybridCompositionSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid hybrid composition: ${formatZodIssue(parsed.error)}`);
  }
  const composition = normalizeHybridComposition(parsed.data);
  assertCompositionJsonBound(composition, maxHybridCompositionJsonLength, "Hybrid composition");
  if (composition.baseTemplateId && !getProductionTemplate(composition.baseTemplateId)) {
    throw new SimulationValidationError(`Unknown composition baseTemplateId: ${composition.baseTemplateId}`);
  }
  validateNotes(composition);
  validateMetadataBounds(composition);
  validateDuplicateAttachments(composition.primitiveAttachments);
  validateDuplicateRequirements("requiredCapabilities", composition.requiredCapabilities);
  validateDuplicateRequirements("declaredCapabilities", composition.declaredCapabilities ?? []);
  for (const attachment of composition.primitiveAttachments) {
    validatePrimitiveAttachment(attachment);
  }
  for (const requirement of [...composition.requiredCapabilities, ...(composition.declaredCapabilities ?? [])]) {
    if (!getPrimitive(requirement.primitiveId)) {
      throw new SimulationValidationError(`Unknown capability primitiveId: ${requirement.primitiveId}`);
    }
    const primitive = getPrimitive(requirement.primitiveId);
    if (primitive?.status === "reserved" && (requirement.requiredSupportLevel === "runtime" || requirement.requiredRuntimeActive)) {
      throw new SimulationValidationError(`Reserved primitive ${requirement.primitiveId} cannot require runtime support`);
    }
  }
  return composition;
}

function normalizeHybridComposition(composition: HybridModelComposition): HybridModelComposition {
  return {
    ...composition,
    primitiveAttachments: composition.primitiveAttachments.map((attachment) => ({ ...attachment })),
    requiredCapabilities: composition.requiredCapabilities.map((requirement) => ({ ...requirement })),
    ...(composition.declaredCapabilities ? { declaredCapabilities: composition.declaredCapabilities.map((requirement) => ({ ...requirement })) } : {}),
    ...(composition.assumptionNotes ? { assumptionNotes: validateAssumptionItems("composition assumption notes", composition.assumptionNotes) } : {}),
    ...(composition.limitationNotes ? { limitationNotes: validateAssumptionItems("composition limitation notes", composition.limitationNotes) } : {}),
    ...(composition.validationNotes ? { validationNotes: validateAssumptionItems("composition validation notes", composition.validationNotes) } : {}),
    ...(composition.metadata ? { metadata: JSON.parse(JSON.stringify(composition.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validatePrimitiveAttachment(attachment: PrimitiveAttachment): void {
  const primitive = getPrimitive(attachment.primitiveId);
  if (!primitive) {
    throw new SimulationValidationError(`Unknown attachment primitiveId: ${attachment.primitiveId}`);
  }
  if (attachment.mode === "declaredOnly" && attachment.active) {
    throw new SimulationValidationError(`Attachment ${attachment.id} cannot be active when mode is declaredOnly`);
  }
  if (attachment.mode === "reference") {
    if (!attachment.artifactType || !attachment.artifactId) {
      throw new SimulationValidationError(`Reference attachment ${attachment.id} requires artifactType and artifactId`);
    }
    if (attachment.inlineData !== undefined) {
      throw new SimulationValidationError(`Reference attachment ${attachment.id} must not include inlineData`);
    }
  }
  if (attachment.mode === "inline") {
    if (!attachment.artifactType || attachment.inlineData === undefined) {
      throw new SimulationValidationError(`Inline attachment ${attachment.id} requires artifactType and inlineData`);
    }
    if (!inlineSupportedArtifactTypes.has(attachment.artifactType)) {
      throw new SimulationValidationError(`Inline data is not supported for artifact family ${attachment.artifactType}`);
    }
    assertCompositionJsonBound(attachment.inlineData, maxHybridCompositionInlineDataJsonLength, `Attachment ${attachment.id} inlineData`);
  }
  if (attachment.mode === "declaredOnly") {
    if (attachment.inlineData !== undefined) {
      throw new SimulationValidationError(`Declared-only attachment ${attachment.id} must not include inlineData`);
    }
    if (attachment.artifactType || attachment.artifactId) {
      throw new SimulationValidationError(`Declared-only attachment ${attachment.id} must not include artifact references`);
    }
  }
  if (primitive.status === "reserved") {
    if (attachment.mode !== "declaredOnly" || attachment.attachmentType !== "reservedFuture") {
      throw new SimulationValidationError(`Reserved primitive ${attachment.primitiveId} must use reservedFuture declaredOnly attachment`);
    }
    if (attachment.active) {
      throw new SimulationValidationError(`Reserved primitive ${attachment.primitiveId} cannot be active`);
    }
    if (attachment.inlineData !== undefined) {
      throw new SimulationValidationError(`Reserved primitive ${attachment.primitiveId} cannot include inlineData`);
    }
  } else if (attachment.attachmentType === "reservedFuture") {
    throw new SimulationValidationError(`Attachment ${attachment.id} cannot use reservedFuture for implemented or service primitive ${attachment.primitiveId}`);
  }
  validateAttachmentArtifact(attachment);
  if (attachment.inlineData !== undefined) {
    validateInlineData(attachment.artifactType!, attachment.inlineData);
  }
}

function validateAttachmentArtifact(attachment: PrimitiveAttachment): void {
  const expectedArtifactTypes = attachmentTypeArtifactTypes[attachment.attachmentType];
  if (expectedArtifactTypes.length === 0) {
    if (attachment.artifactType) {
      throw new SimulationValidationError(`Attachment ${attachment.id} type ${attachment.attachmentType} must not include artifactType`);
    }
    return;
  }
  if (!attachment.artifactType) {
    return;
  }
  if (!expectedArtifactTypes.includes(attachment.artifactType)) {
    throw new SimulationValidationError(`Attachment ${attachment.id} artifactType does not match attachmentType ${attachment.attachmentType}`);
  }
  const artifact = getArtifactFamily(attachment.artifactType);
  if (!artifact) {
    throw new SimulationValidationError(`Unknown composition artifactType: ${attachment.artifactType}`);
  }
  if (artifact.primitiveId !== attachment.primitiveId) {
    throw new SimulationValidationError(`Attachment ${attachment.id} primitiveId does not match artifactType ${attachment.artifactType}`);
  }
  if (!artifact.implemented && attachment.mode !== "declaredOnly") {
    throw new SimulationValidationError(`Artifact family ${attachment.artifactType} is reserved and cannot be attached as ${attachment.mode}`);
  }
}

function validateInlineData(artifactType: string, inlineData: unknown): void {
  switch (artifactType) {
    case "ortus.assumptionProfile":
      validateAssumptionProfile(inlineData);
      return;
    case "ortus.networkDefinition":
      validateNetworkDefinition(inlineData);
      return;
    case "ortus.resourceSystem":
      validateResourceSystemState(inlineData);
      return;
    case "ortus.eventSchedule":
      validateEventScheduleArtifact(inlineData);
      return;
    case "ortus.delayQueue":
      validateDelayQueueArtifact(inlineData);
      return;
    case "ortus.feedbackLoops":
      validateFeedbackLoopsArtifact(inlineData);
      return;
    default:
      throw new SimulationValidationError(`Inline data is not supported for artifact family ${artifactType}`);
  }
}

function validateDuplicateAttachments(attachments: readonly PrimitiveAttachment[]): void {
  const ids = new Set<string>();
  for (const attachment of attachments) {
    if (ids.has(attachment.id)) {
      throw new SimulationValidationError(`Duplicate primitive attachment id: ${attachment.id}`);
    }
    ids.add(attachment.id);
  }
}

function validateDuplicateRequirements(section: string, requirements: readonly CapabilityRequirement[]): void {
  const keys = new Set<string>();
  for (const requirement of requirements) {
    const key = `${requirement.primitiveId}:${requirement.requiredSupportLevel}:${Boolean(requirement.requiredRuntimeActive)}`;
    if (keys.has(key)) {
      throw new SimulationValidationError(`Duplicate ${section} entry for ${requirement.primitiveId}`);
    }
    keys.add(key);
  }
}

function validateNotes(composition: HybridModelComposition): void {
  for (const [section, items] of [
    ["assumptionNotes", composition.assumptionNotes],
    ["limitationNotes", composition.limitationNotes],
    ["validationNotes", composition.validationNotes]
  ] as const) {
    for (const item of items ?? []) {
      assertCompositionJsonBound(item, maxHybridCompositionNoteLength * 2, `Composition ${section}`);
    }
  }
}

function validateMetadataBounds(composition: HybridModelComposition): void {
  if (composition.metadata) {
    assertCompositionJsonBound(composition.metadata, maxHybridCompositionMetadataJsonLength, "Hybrid composition metadata");
  }
  for (const attachment of composition.primitiveAttachments) {
    if (attachment.metadata) {
      assertCompositionJsonBound(attachment.metadata, maxHybridCompositionMetadataJsonLength, `Attachment ${attachment.id} metadata`);
    }
  }
}

export function parseHybridCompositionJson(json: string | unknown): HybridModelComposition {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxHybridCompositionJsonLength) {
      throw new SimulationSerializationError(`Hybrid composition JSON must be ${maxHybridCompositionJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid hybrid composition JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || (raw as { artifactType?: unknown }).artifactType !== hybridCompositionArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${hybridCompositionArtifactType}`);
  }
  return validateHybridComposition(raw);
}

function assertCompositionJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

function assertPlainCompositionJson(value: unknown, label: string): void {
  const stack: unknown[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || current === undefined) {
      continue;
    }
    if (typeof current === "function" || typeof current === "symbol" || typeof current === "bigint") {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    if (typeof current !== "object") {
      if (typeof current === "number" && !Number.isFinite(current)) {
        throw new SimulationValidationError(`${label} must not contain non-finite numbers`);
      }
      continue;
    }
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }
    if (!isPlainRecord(current)) {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    for (const [key, child] of Object.entries(current)) {
      if (forbiddenCompositionKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not embed live run state (${key})`);
      }
      stack.push(child);
    }
  }
}

function isPlainRecord(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
