import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  emergencePatternModelArtifactType,
  maxEmergencePatternMetadataJsonLength,
  maxEmergencePatternModelJsonLength,
  maxEmergencePatternNoteLength,
  maxEmergencePatternNotes,
  maxPatternDescriptors,
  maxPatternScaleLinks,
  maxPatternSignatures,
  maxPatternThresholds,
  maxPatternTimeWindows,
  maxPatternVariables,
  patternDescriptorStatuses,
  patternKinds,
  patternScaleLinkRelations,
  patternSignatureKinds,
  patternThresholdKinds,
  patternTimeWindowKinds,
  patternVariableKinds,
  type EmergencePatternModel,
  type EmergenceScope,
  type PatternDescriptor,
  type PatternScaleLink,
  type PatternSignature,
  type PatternThreshold,
  type PatternTimeWindow,
  type PatternVariable
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxEmergencePatternNoteLength);
const notesSchema = z.array(noteSchema).max(maxEmergencePatternNotes);
const tickSchema = z.number().finite().int().min(0).max(10_000_000);

const scopeSchema: z.ZodType<EmergenceScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    runConfigId: boundedString(240).optional(),
    observabilityModelId: boundedString(160).optional(),
    causalAssumptionModelId: boundedString(160).optional(),
    quantitySemanticsModelId: boundedString(160).optional(),
    scaleModelId: boundedString(160).optional(),
    scaleViewStateId: boundedString(160).optional(),
    networkDefinitionId: boundedString(160).optional(),
    resourceSystemId: boundedString(160).optional(),
    fieldLayerId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const stringIdArraySchema = z.array(boundedString(160)).max(256);

const descriptorSchema: z.ZodType<PatternDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    patternKind: z.enum(patternKinds),
    status: z.enum(patternDescriptorStatuses),
    localMechanismDescription: z.string().min(1).max(800).optional(),
    globalPatternDescription: z.string().min(1).max(800).optional(),
    variableIds: stringIdArraySchema.optional(),
    signatureIds: stringIdArraySchema.optional(),
    thresholdIds: stringIdArraySchema.optional(),
    timeWindowIds: stringIdArraySchema.optional(),
    scaleLinkIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const variableSchema: z.ZodType<PatternVariable> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    variableKind: z.enum(patternVariableKinds),
    targetPath: z.string().min(1).max(400).optional(),
    metricId: boundedString(160).optional(),
    fieldId: boundedString(160).optional(),
    networkMeasureId: boundedString(160).optional(),
    quantityId: boundedString(160).optional(),
    scaleId: boundedString(160).optional(),
    unitId: boundedString(160).optional(),
    dimensionId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const signatureSchema: z.ZodType<PatternSignature> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    signatureKind: z.enum(patternSignatureKinds),
    variableId: boundedString(160).optional(),
    thresholdId: boundedString(160).optional(),
    timeWindowId: boundedString(160).optional(),
    description: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const thresholdSchema: z.ZodType<PatternThreshold> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    thresholdKind: z.enum(patternThresholdKinds),
    valueDescription: z.string().min(1).max(800),
    quantityId: boundedString(160).optional(),
    unitId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const timeWindowSchema: z.ZodType<PatternTimeWindow> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    windowKind: z.enum(patternTimeWindowKinds),
    startTick: tickSchema.optional(),
    endTick: tickSchema.optional(),
    durationTicks: tickSchema.optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const scaleLinkSchema: z.ZodType<PatternScaleLink> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    localScaleId: boundedString(160).optional(),
    globalScaleId: boundedString(160).optional(),
    relation: z.enum(patternScaleLinkRelations),
    description: z.string().min(1).max(800).optional(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const emergencePatternModelSchema: z.ZodType<EmergencePatternModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(emergencePatternModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    scope: scopeSchema.optional(),
    descriptors: z.array(descriptorSchema).min(1).max(maxPatternDescriptors),
    signatures: z.array(signatureSchema).max(maxPatternSignatures).optional(),
    patternVariables: z.array(variableSchema).max(maxPatternVariables).optional(),
    thresholds: z.array(thresholdSchema).max(maxPatternThresholds).optional(),
    timeWindows: z.array(timeWindowSchema).max(maxPatternTimeWindows).optional(),
    scaleLinks: z.array(scaleLinkSchema).max(maxPatternScaleLinks).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxEmergencePatternNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxEmergencePatternNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxEmergencePatternNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenEmergenceKeys = new Set([
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
  "algorithm",
  "algorithms",
  "anomaly",
  "anomalyDetection",
  "anomalyDetector",
  "anomalyDetectors",
  "detector",
  "detectors",
  "emergenceDetector",
  "emergenceDetectors",
  "classifier",
  "classifiers",
  "clusterer",
  "clusterers",
  "embedding",
  "embeddings",
  "modelWeights",
  "trainingData",
  "dataset",
  "datasets",
  "observedData",
  "observationData",
  "timeSeries",
  "timeSeriesData",
  "rawData",
  "dataFrame",
  "csv",
  "table",
  "tables",
  "pValue",
  "pValues",
  "significance",
  "significanceTest",
  "confidenceInterval",
  "confidenceIntervals",
  "calibration",
  "calibrationResult",
  "calibrationResults",
  "likelihood",
  "likelihoods",
  "proof",
  "proofs",
  "certification",
  "certifications",
  "certified",
  "consciousness",
  "consciousnessDetector",
  "consciousnessDetectors",
  "consciousnessScore",
  "intelligence",
  "intelligenceDetector",
  "intelligenceDetectors",
  "intelligenceScore",
  "code",
  "script",
  "functionBody",
  "callback"
]);

export function validateEmergencePatternModel(value: unknown): EmergencePatternModel {
  assertPlainEmergencePatternJson(value, "Emergence pattern model");
  const parsed = emergencePatternModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid emergence pattern model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeEmergencePatternModel(parsed.data);
  assertEmergencePatternJsonBound(model, maxEmergencePatternModelJsonLength, "Emergence pattern model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("descriptor", model.descriptors);
  validateUniqueIds("signature", model.signatures ?? []);
  validateUniqueIds("variable", model.patternVariables ?? []);
  validateUniqueIds("threshold", model.thresholds ?? []);
  validateUniqueIds("timeWindow", model.timeWindows ?? []);
  validateUniqueIds("scaleLink", model.scaleLinks ?? []);
  validateReferences(model);
  validateTimeWindows(model.timeWindows ?? []);
  return model;
}

export function parseEmergencePatternModelJson(json: string | unknown): EmergencePatternModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxEmergencePatternModelJsonLength) {
      throw new SimulationSerializationError(`Emergence pattern model JSON must be ${maxEmergencePatternModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid emergence pattern model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== emergencePatternModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${emergencePatternModelArtifactType}`);
  }
  return validateEmergencePatternModel(raw);
}

export function normalizeEmergencePatternModel(model: EmergencePatternModel): EmergencePatternModel {
  return {
    ...model,
    ...(model.scope ? { scope: cloneRecord(model.scope) } : {}),
    descriptors: model.descriptors.map((descriptor) => cloneRecord(descriptor)),
    ...(model.signatures ? { signatures: model.signatures.map((signature) => cloneRecord(signature)) } : {}),
    ...(model.patternVariables ? { patternVariables: model.patternVariables.map((variable) => cloneRecord(variable)) } : {}),
    ...(model.thresholds ? { thresholds: model.thresholds.map((threshold) => cloneRecord(threshold)) } : {}),
    ...(model.timeWindows ? { timeWindows: model.timeWindows.map((tickWindow) => cloneRecord(tickWindow)) } : {}),
    ...(model.scaleLinks ? { scaleLinks: model.scaleLinks.map((link) => cloneRecord(link)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("emergence pattern assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("emergence pattern limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("emergence pattern validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(model: EmergencePatternModel): void {
  const variableIds = new Set((model.patternVariables ?? []).map((variable) => variable.id));
  const signatureIds = new Set((model.signatures ?? []).map((signature) => signature.id));
  const thresholdIds = new Set((model.thresholds ?? []).map((threshold) => threshold.id));
  const timeWindowIds = new Set((model.timeWindows ?? []).map((tickWindow) => tickWindow.id));
  const scaleLinkIds = new Set((model.scaleLinks ?? []).map((link) => link.id));

  for (const descriptor of model.descriptors) {
    for (const variableId of descriptor.variableIds ?? []) {
      if (!variableIds.has(variableId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown variableId: ${variableId}`);
      }
    }
    for (const signatureId of descriptor.signatureIds ?? []) {
      if (!signatureIds.has(signatureId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown signatureId: ${signatureId}`);
      }
    }
    for (const thresholdId of descriptor.thresholdIds ?? []) {
      if (!thresholdIds.has(thresholdId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown thresholdId: ${thresholdId}`);
      }
    }
    for (const timeWindowId of descriptor.timeWindowIds ?? []) {
      if (!timeWindowIds.has(timeWindowId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown timeWindowId: ${timeWindowId}`);
      }
    }
    for (const scaleLinkId of descriptor.scaleLinkIds ?? []) {
      if (!scaleLinkIds.has(scaleLinkId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown scaleLinkId: ${scaleLinkId}`);
      }
    }
  }

  for (const signature of model.signatures ?? []) {
    if (signature.variableId && !variableIds.has(signature.variableId)) {
      throw new SimulationValidationError(`Signature ${signature.id} references unknown variableId: ${signature.variableId}`);
    }
    if (signature.thresholdId && !thresholdIds.has(signature.thresholdId)) {
      throw new SimulationValidationError(`Signature ${signature.id} references unknown thresholdId: ${signature.thresholdId}`);
    }
    if (signature.timeWindowId && !timeWindowIds.has(signature.timeWindowId)) {
      throw new SimulationValidationError(`Signature ${signature.id} references unknown timeWindowId: ${signature.timeWindowId}`);
    }
  }
}

function validateTimeWindows(timeWindows: readonly PatternTimeWindow[]): void {
  for (const timeWindow of timeWindows) {
    if (timeWindow.startTick !== undefined && timeWindow.endTick !== undefined && timeWindow.endTick < timeWindow.startTick) {
      throw new SimulationValidationError(`Time window ${timeWindow.id} endTick must be greater than or equal to startTick`);
    }
  }
}

function validateUniqueIds(label: string, values: readonly { id: string }[]): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new SimulationValidationError(`Duplicate ${label} id: ${value.id}`);
    }
    ids.add(value.id);
  }
}

function validateNotes(model: EmergencePatternModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`emergence pattern ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: EmergencePatternModel): void {
  for (const [label, values] of [
    ["scope", model.scope ? [model.scope] : []],
    ["descriptor", model.descriptors],
    ["signature", model.signatures ?? []],
    ["variable", model.patternVariables ?? []],
    ["threshold", model.thresholds ?? []],
    ["time window", model.timeWindows ?? []],
    ["scale link", model.scaleLinks ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertEmergencePatternJsonBound(value.metadata, maxEmergencePatternMetadataJsonLength, `${label} metadata`);
      }
    }
  }
  if (model.metadata) {
    assertEmergencePatternJsonBound(model.metadata, maxEmergencePatternMetadataJsonLength, "Emergence pattern model metadata");
  }
}

export function assertEmergencePatternJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainEmergencePatternJson(value: unknown, label: string): void {
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
      if (forbiddenEmergenceKeys.has(key)) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable-shaped, formula, algorithm, detector, classifier, anomaly, ML, statistical-significance, calibration, proof, consciousness, intelligence, or external-data key ${key}`
        );
      }
      stack.push(child);
    }
  }
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
