import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  modelEntityKinds,
  modelMetricKinds,
  modelParameterValueKinds,
  modelRuleKinds,
  modelSpaceKinds
} from "../modelSchema/types";
import { primitiveIds } from "../registry/types";
import {
  compatibilityFitLevels,
  lossyMappingKinds,
  lossyMappingSeverities,
  mappingConfidences,
  mappingStatuses,
  maxSchemaTemplateCompatibilityDescriptionLength,
  maxSchemaTemplateCompatibilityItems,
  maxSchemaTemplateCompatibilityJsonLength,
  maxSchemaTemplateCompatibilityMetadataJsonLength,
  maxSchemaTemplateCompatibilityNoteLength,
  maxSchemaTemplateCompatibilityResults,
  schemaElementKinds,
  schemaTemplateCompatibilityReportArtifactType,
  templateConceptKinds,
  templateMappingProfileArtifactType,
  unsupportedReasons,
  type LossyMappingNote,
  type SchemaConceptMapping,
  type SchemaTemplateCompatibilityReport,
  type TemplateCompatibilityResult,
  type TemplateMappingProfile,
  type TemplatePrimitiveMappingCapability,
  type UnsupportedSchemaConcept
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(maxSchemaTemplateCompatibilityDescriptionLength).optional();
const noteSchema = z.string().min(1).max(maxSchemaTemplateCompatibilityNoteLength);
const notesSchema = z.array(noteSchema).max(maxSchemaTemplateCompatibilityItems);
const stringIdArraySchema = z.array(boundedString(180)).max(maxSchemaTemplateCompatibilityItems);

const primitiveMappingCapabilitySchema: z.ZodType<TemplatePrimitiveMappingCapability> = z
  .object({
    primitiveId: z.enum(primitiveIds),
    supportLevel: z.enum(["runtime", "service", "metadata", "documentation", "none"]),
    runtimeActive: z.boolean(),
    serviceAvailable: z.boolean(),
    notes: z.string().max(maxSchemaTemplateCompatibilityNoteLength).optional()
  })
  .strict();

const templateMappingProfileSchema: z.ZodType<TemplateMappingProfile> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(templateMappingProfileArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    version: boundedString(80),
    templateId: boundedString(160),
    templateName: boundedString(180).optional(),
    templateVersion: boundedString(80).optional(),
    description: optionalDescription,
    supportedEntityKinds: z.array(z.enum(modelEntityKinds)).max(maxSchemaTemplateCompatibilityItems),
    supportedEntityTypeIds: stringIdArraySchema,
    supportedComponentTypeIds: stringIdArraySchema,
    supportedSpaceKinds: z.array(z.enum(modelSpaceKinds)).max(maxSchemaTemplateCompatibilityItems),
    supportedParameterKinds: z.array(z.enum(modelParameterValueKinds)).max(maxSchemaTemplateCompatibilityItems),
    supportedParameterValueKinds: z.array(z.enum(modelParameterValueKinds)).max(maxSchemaTemplateCompatibilityItems),
    supportedParameterIds: stringIdArraySchema,
    supportedMetricKinds: z.array(z.enum(modelMetricKinds)).max(maxSchemaTemplateCompatibilityItems),
    supportedMetricIds: stringIdArraySchema,
    supportedRuleKinds: z.array(z.enum(modelRuleKinds)).max(maxSchemaTemplateCompatibilityItems),
    supportedBehaviorModeIds: stringIdArraySchema,
    supportedArtifactTypes: z.array(boundedString(180)).max(maxSchemaTemplateCompatibilityItems),
    unsupportedConcepts: notesSchema.optional(),
    capabilityNotes: notesSchema.optional(),
    limitationNotes: notesSchema.optional(),
    primitiveCapabilities: z.array(primitiveMappingCapabilitySchema).max(maxSchemaTemplateCompatibilityItems).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    runtimeActive: z.literal(false),
    conversionSupported: z.literal(false),
    generationSupported: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const schemaConceptMappingSchema: z.ZodType<SchemaConceptMapping> = z
  .object({
    id: boundedString(180),
    schemaElementId: boundedString(180),
    schemaElementLabel: boundedString(180).optional(),
    schemaElementKind: z.enum(schemaElementKinds),
    schemaElementType: z.string().min(1).max(180).optional(),
    templateConceptId: boundedString(180).optional(),
    templateConceptLabel: boundedString(180).optional(),
    templateConceptKind: z.enum(templateConceptKinds),
    status: z.enum(mappingStatuses),
    confidence: z.enum(mappingConfidences),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const unsupportedSchemaConceptSchema: z.ZodType<UnsupportedSchemaConcept> = z
  .object({
    id: boundedString(180),
    schemaElementId: boundedString(180),
    schemaElementLabel: boundedString(180).optional(),
    schemaElementKind: z.enum(schemaElementKinds),
    schemaElementType: z.string().min(1).max(180).optional(),
    reason: z.enum(unsupportedReasons),
    primitiveId: z.enum(primitiveIds).optional(),
    artifactType: boundedString(180).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema,
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const lossyMappingNoteSchema: z.ZodType<LossyMappingNote> = z
  .object({
    id: boundedString(180),
    schemaElementId: boundedString(180),
    schemaElementKind: z.enum(schemaElementKinds),
    lossKind: z.enum(lossyMappingKinds),
    severity: z.enum(lossyMappingSeverities),
    message: z.string().min(1).max(2_000),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const templateCompatibilityResultSchema: z.ZodType<TemplateCompatibilityResult> = z
  .object({
    id: boundedString(180),
    templateId: boundedString(160),
    templateName: boundedString(180),
    templateVersion: boundedString(80),
    fit: z.enum(compatibilityFitLevels),
    score: z.number().finite().min(0).max(1),
    mappedConcepts: z.array(schemaConceptMappingSchema).max(maxSchemaTemplateCompatibilityItems),
    unsupportedConcepts: z.array(unsupportedSchemaConceptSchema).max(maxSchemaTemplateCompatibilityItems),
    lossyMappings: z.array(lossyMappingNoteSchema).max(maxSchemaTemplateCompatibilityItems),
    requiredRuntimeCapabilities: notesSchema,
    missingTemplateCapabilities: notesSchema,
    warnings: notesSchema,
    runnableNow: z.literal(false),
    schemaExecutionSupported: z.literal(false),
    conversionSupported: z.literal(false),
    generationSupported: z.literal(false),
    templateRuntimeSupportClaimed: z.literal(false),
    active: z.boolean(),
    executable: z.literal(false),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const schemaTemplateCompatibilityReportSchema: z.ZodType<SchemaTemplateCompatibilityReport> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(schemaTemplateCompatibilityReportArtifactType),
    id: boundedString(180),
    name: boundedString(180),
    version: boundedString(80),
    schemaId: boundedString(160),
    modelSchemaId: boundedString(160),
    modelSchemaName: boundedString(180),
    modelSchemaVersion: boundedString(80),
    generatedAtDescription: z.string().max(400).optional(),
    templateResults: z.array(templateCompatibilityResultSchema).max(maxSchemaTemplateCompatibilityResults),
    bestTemplateId: boundedString(160).optional(),
    overallFit: z.enum(compatibilityFitLevels),
    requiredRuntimeCapabilities: notesSchema,
    warnings: notesSchema,
    runnableNow: z.literal(false),
    schemaExecutionAvailable: z.literal(false),
    conversionAvailable: z.literal(false),
    scenarioGenerationAvailable: z.literal(false),
    runConfigGenerationAvailable: z.literal(false),
    snapshotGenerationAvailable: z.literal(false),
    templateGenerationAvailable: z.literal(false),
    engineCreationAvailable: z.literal(false),
    generationAvailable: z.literal(false),
    validationAvailable: z.literal(false),
    calibrationAvailable: z.literal(false),
    active: z.boolean(),
    executable: z.literal(false),
    errors: notesSchema.optional(),
    assumptionNotes: notesSchema.optional(),
    limitationNotes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenCompatibilityKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "metricHistory",
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
  "activeEngine",
  "formula",
  "formulas",
  "expression",
  "expressions",
  "equation",
  "equations",
  "code",
  "script",
  "javascript",
  "typescript",
  "python",
  "functionBody",
  "executablePayload",
  "function",
  "class",
  "prototype",
  "constructor",
  "__proto__",
  "runtime",
  "runtimeHook",
  "runtimeHooks",
  "runtimeAdapter",
  "runtimeFactory",
  "runtimeEngine",
  "execute",
  "executor",
  "execution",
  "compiler",
  "interpreter",
  "parser",
  "transpiler",
  "codegen",
  "generatedCode",
  "convert",
  "converter",
  "conversionFunction",
  "conversionPayload",
  "generatedScenario",
  "generatedRunConfig",
  "generatedSnapshot",
  "generatedTemplate",
  "generateTemplate",
  "generateScenario",
  "generateRunConfig",
  "generateSnapshot",
  "createEngine",
  "applyScenario",
  "scenario",
  "runConfig",
  "snapshotState",
  "templateDefinition",
  "templateFactory",
  "scenarioFactory",
  "runConfigFactory",
  "snapshotFactory",
  "netlogoCode",
  "mesaModel",
  "masonModel",
  "externalAdapter",
  "externalRuntime",
  "externalFrameworkImport",
  "externalFrameworkExport",
  "frameworkAdapter",
  "llm",
  "llmAgent",
  "llmAgents",
  "largeLanguageModel",
  "embedding",
  "embeddings",
  "modelWeights",
  "trainingData",
  "realPersonProfile",
  "realPersonTraits",
  "protectedAttribute",
  "protectedAttributeInference",
  "persuasionOptimization",
  "microtargeting",
  "proof",
  "certification",
  "riskScore",
  "safetyScore"
]);

const normalizedForbiddenCompatibilityKeys = new Set(Array.from(forbiddenCompatibilityKeys).map((key) => key.toLowerCase()));

export function validateTemplateMappingProfile(value: unknown): TemplateMappingProfile {
  assertPlainSchemaTemplateCompatibilityJson(value, "Template mapping profile");
  const parsed = templateMappingProfileSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid template mapping profile: ${formatZodIssue(parsed.error)}`);
  }
  const profile = normalizeTemplateMappingProfile(parsed.data);
  assertSchemaTemplateCompatibilityJsonBound(profile, maxSchemaTemplateCompatibilityJsonLength, "Template mapping profile");
  validateProfileDuplicates(profile);
  validateCompatibilityMetadataBounds(profile);
  return profile;
}

export function validateTemplateCompatibilityResult(value: unknown): TemplateCompatibilityResult {
  assertPlainSchemaTemplateCompatibilityJson(value, "Template compatibility result");
  const parsed = templateCompatibilityResultSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid template compatibility result: ${formatZodIssue(parsed.error)}`);
  }
  const result = normalizeTemplateCompatibilityResult(parsed.data);
  validateResultDuplicates(result);
  validateCompatibilityMetadataBounds(result);
  return result;
}

export function validateSchemaTemplateCompatibilityReport(value: unknown): SchemaTemplateCompatibilityReport {
  assertPlainSchemaTemplateCompatibilityJson(value, "Schema/template compatibility report");
  const parsed = schemaTemplateCompatibilityReportSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid schema/template compatibility report: ${formatZodIssue(parsed.error)}`);
  }
  const report = normalizeSchemaTemplateCompatibilityReport(parsed.data);
  assertSchemaTemplateCompatibilityJsonBound(report, maxSchemaTemplateCompatibilityJsonLength, "Schema/template compatibility report");
  validateReportDuplicates(report);
  validateCompatibilityMetadataBounds(report);
  if (report.schemaId !== report.modelSchemaId) {
    throw new SimulationValidationError(`Report schemaId must match modelSchemaId: ${report.schemaId}`);
  }
  if (report.bestTemplateId && !report.templateResults.some((result) => result.templateId === report.bestTemplateId)) {
    throw new SimulationValidationError(`Report bestTemplateId does not match any template result: ${report.bestTemplateId}`);
  }
  return report;
}

export function parseTemplateMappingProfileJson(json: string | unknown): TemplateMappingProfile {
  const raw = parseJsonForArtifact(json, templateMappingProfileArtifactType, "Template mapping profile");
  return validateTemplateMappingProfile(raw);
}

export function parseSchemaTemplateCompatibilityReportJson(json: string | unknown): SchemaTemplateCompatibilityReport {
  const raw = parseJsonForArtifact(json, schemaTemplateCompatibilityReportArtifactType, "Schema/template compatibility report");
  return validateSchemaTemplateCompatibilityReport(raw);
}

export function normalizeTemplateMappingProfile(profile: TemplateMappingProfile): TemplateMappingProfile {
  return {
    ...profile,
    name: profile.name,
    version: profile.version,
    supportedEntityKinds: [...profile.supportedEntityKinds],
    supportedEntityTypeIds: [...profile.supportedEntityTypeIds],
    supportedComponentTypeIds: [...profile.supportedComponentTypeIds],
    supportedSpaceKinds: [...profile.supportedSpaceKinds],
    supportedParameterKinds: [...profile.supportedParameterKinds],
    supportedParameterValueKinds: [...profile.supportedParameterValueKinds],
    supportedParameterIds: [...profile.supportedParameterIds],
    supportedMetricKinds: [...profile.supportedMetricKinds],
    supportedMetricIds: [...profile.supportedMetricIds],
    supportedRuleKinds: [...profile.supportedRuleKinds],
    supportedBehaviorModeIds: [...profile.supportedBehaviorModeIds],
    supportedArtifactTypes: [...profile.supportedArtifactTypes],
    ...(profile.unsupportedConcepts ? { unsupportedConcepts: [...profile.unsupportedConcepts] } : {}),
    ...(profile.capabilityNotes ? { capabilityNotes: [...profile.capabilityNotes] } : {}),
    ...(profile.limitationNotes ? { limitationNotes: [...profile.limitationNotes] } : {}),
    ...(profile.primitiveCapabilities ? { primitiveCapabilities: profile.primitiveCapabilities.map((capability) => cloneRecord(capability)) } : {}),
    ...(profile.notes ? { notes: [...profile.notes] } : {}),
    ...(profile.metadata ? { metadata: cloneRecord(profile.metadata) as Record<string, JsonValue> } : {})
  };
}

export function normalizeTemplateCompatibilityResult(result: TemplateCompatibilityResult): TemplateCompatibilityResult {
  return {
    ...result,
    mappedConcepts: result.mappedConcepts.map((mapping) => cloneRecord(mapping)),
    unsupportedConcepts: result.unsupportedConcepts.map((concept) => cloneRecord(concept)),
    lossyMappings: result.lossyMappings.map((note) => cloneRecord(note)),
    requiredRuntimeCapabilities: [...result.requiredRuntimeCapabilities],
    missingTemplateCapabilities: [...result.missingTemplateCapabilities],
    warnings: [...result.warnings],
    ...(result.metadata ? { metadata: cloneRecord(result.metadata) as Record<string, JsonValue> } : {})
  };
}

export function normalizeSchemaTemplateCompatibilityReport(report: SchemaTemplateCompatibilityReport): SchemaTemplateCompatibilityReport {
  return {
    ...report,
    templateResults: report.templateResults.map((result) => normalizeTemplateCompatibilityResult(result)),
    requiredRuntimeCapabilities: [...report.requiredRuntimeCapabilities],
    warnings: [...report.warnings],
    ...(report.errors ? { errors: [...report.errors] } : {}),
    ...(report.assumptionNotes ? { assumptionNotes: [...report.assumptionNotes] } : {}),
    ...(report.limitationNotes ? { limitationNotes: [...report.limitationNotes] } : {}),
    ...(report.metadata ? { metadata: cloneRecord(report.metadata) as Record<string, JsonValue> } : {})
  };
}

export function assertSchemaTemplateCompatibilityJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainSchemaTemplateCompatibilityJson(value: unknown, label: string): void {
  const stack: unknown[] = [value];
  const seen = new WeakSet<object>();
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
    if (seen.has(current)) {
      throw new SimulationValidationError(`${label} must be acyclic plain JSON`);
    }
    seen.add(current);
    for (const [key, child] of Object.entries(current)) {
      if (key.toLowerCase() === "executable" && child === true) {
        throw new SimulationValidationError(`${label} must not contain executable true`);
      }
      if (isForbiddenCompatibilityKey(key)) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable, formula, code, runtime, generation, conversion, compiler, interpreter, external-framework, LLM, embedding, model-weight, training-data, real-person, protected-class, persuasion, microtargeting, proof, certification, safety, or risk key ${key}`
        );
      }
      stack.push(child);
    }
  }
}

function parseJsonForArtifact(json: string | unknown, artifactType: string, label: string): unknown {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxSchemaTemplateCompatibilityJsonLength) {
      throw new SimulationSerializationError(`${label} JSON must be ${maxSchemaTemplateCompatibilityJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError(`Invalid ${label} JSON`, { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== artifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${artifactType}`);
  }
  return raw;
}

function validateProfileDuplicates(profile: TemplateMappingProfile): void {
  validateUniqueStrings("supported entity kind", profile.supportedEntityKinds);
  validateUniqueStrings("supported entity type id", profile.supportedEntityTypeIds);
  validateUniqueStrings("supported component type id", profile.supportedComponentTypeIds);
  validateUniqueStrings("supported space kind", profile.supportedSpaceKinds);
  validateUniqueStrings("supported parameter kind", profile.supportedParameterKinds);
  validateUniqueStrings("supported parameter value kind", profile.supportedParameterValueKinds);
  validateUniqueStrings("supported parameter id", profile.supportedParameterIds);
  validateUniqueStrings("supported metric kind", profile.supportedMetricKinds);
  validateUniqueStrings("supported metric id", profile.supportedMetricIds);
  validateUniqueStrings("supported rule kind", profile.supportedRuleKinds);
  validateUniqueStrings("supported behavior mode id", profile.supportedBehaviorModeIds);
  validateUniqueStrings("supported artifact type", profile.supportedArtifactTypes);
  validateUniqueStrings("primitive capability", (profile.primitiveCapabilities ?? []).map((capability) => capability.primitiveId));
}

function validateResultDuplicates(result: TemplateCompatibilityResult): void {
  validateUniqueIds("schema concept mapping", result.mappedConcepts);
  validateUniqueIds("unsupported schema concept", result.unsupportedConcepts);
  validateUniqueIds("lossy mapping note", result.lossyMappings);
}

function validateReportDuplicates(report: SchemaTemplateCompatibilityReport): void {
  validateUniqueIds("template compatibility result", report.templateResults);
  validateUniqueStrings("template result templateId", report.templateResults.map((result) => result.templateId));
  for (const result of report.templateResults) {
    validateResultDuplicates(result);
  }
}

function validateCompatibilityMetadataBounds(value: TemplateMappingProfile | TemplateCompatibilityResult | SchemaTemplateCompatibilityReport): void {
  const metadataValues: Array<[string, Record<string, JsonValue> | undefined]> = [];
  if ("templateId" in value && "supportedEntityKinds" in value) {
    metadataValues.push(["template mapping profile metadata", value.metadata]);
  }
  if ("mappedConcepts" in value) {
    metadataValues.push(["template compatibility result metadata", value.metadata]);
    metadataValues.push(...value.mappedConcepts.map((mapping) => [`mapping ${mapping.id} metadata`, mapping.metadata] as [string, Record<string, JsonValue> | undefined]));
    metadataValues.push(
      ...value.unsupportedConcepts.map((concept) => [`unsupported concept ${concept.id} metadata`, concept.metadata] as [
        string,
        Record<string, JsonValue> | undefined
      ])
    );
    metadataValues.push(...value.lossyMappings.map((note) => [`lossy mapping ${note.id} metadata`, note.metadata] as [string, Record<string, JsonValue> | undefined]));
  }
  if ("templateResults" in value) {
    metadataValues.push(["schema/template compatibility report metadata", value.metadata]);
    for (const result of value.templateResults) {
      metadataValues.push(["template compatibility result metadata", result.metadata]);
      metadataValues.push(...result.mappedConcepts.map((mapping) => [`mapping ${mapping.id} metadata`, mapping.metadata] as [
        string,
        Record<string, JsonValue> | undefined
      ]));
      metadataValues.push(
        ...result.unsupportedConcepts.map((concept) => [`unsupported concept ${concept.id} metadata`, concept.metadata] as [
          string,
          Record<string, JsonValue> | undefined
        ])
      );
      metadataValues.push(...result.lossyMappings.map((note) => [`lossy mapping ${note.id} metadata`, note.metadata] as [
        string,
        Record<string, JsonValue> | undefined
      ]));
    }
  }
  for (const [label, metadata] of metadataValues) {
    if (metadata) {
      assertSchemaTemplateCompatibilityJsonBound(metadata, maxSchemaTemplateCompatibilityMetadataJsonLength, label);
    }
  }
}

function validateUniqueIds(label: string, values: readonly { id: string }[]): void {
  validateUniqueStrings(label, values.map((value) => value.id));
}

function validateUniqueStrings(label: string, values: readonly string[]): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value)) {
      throw new SimulationValidationError(`Duplicate ${label}: ${value}`);
    }
    ids.add(value);
  }
}

function isForbiddenCompatibilityKey(key: string): boolean {
  return forbiddenCompatibilityKeys.has(key) || normalizedForbiddenCompatibilityKeys.has(key.toLowerCase());
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
