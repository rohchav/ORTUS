import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  coordinateSpaceTypes,
  environmentalLayerTypes,
  extrapolationPolicies,
  fieldLayerArtifactType,
  fieldTypes,
  fieldValueSources,
  maxEnvironmentalLayers,
  maxLayerFieldRefs,
  maxSamplingRules,
  maxSpatialFieldMetadataJsonLength,
  maxSpatialFieldModelJsonLength,
  maxSpatialFieldNoteLength,
  maxSpatialFieldNotes,
  maxSpatialFields,
  samplingTypes,
  spatialFieldValueTypes,
  type CoordinateSpace,
  type EnvironmentalLayer,
  type FieldDefinition,
  type SamplingRule,
  type SpatialFieldModel,
  type SpatialResolution
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxSpatialFieldNoteLength);
const notesSchema = z.array(noteSchema).max(maxSpatialFieldNotes);

const extentSchema = z
  .object({
    minX: z.number(),
    maxX: z.number(),
    minY: z.number(),
    maxY: z.number()
  })
  .strict();

const resolutionSchema: z.ZodType<SpatialResolution> = z
  .object({
    dx: z.number().positive().optional(),
    dy: z.number().positive().optional(),
    rows: z.number().int().positive().optional(),
    columns: z.number().int().positive().optional()
  })
  .strict();

const originSchema = z
  .object({
    x: z.number(),
    y: z.number()
  })
  .strict();

const coordinateSpaceSchema: z.ZodType<CoordinateSpace> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    spaceType: z.enum(coordinateSpaceTypes),
    extent: extentSchema.optional(),
    resolution: resolutionSchema.optional(),
    unit: z.string().min(1).max(80).optional(),
    origin: originSchema.optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const fieldDefinitionSchema: z.ZodType<FieldDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    fieldType: z.enum(fieldTypes),
    valueType: z.enum(spatialFieldValueTypes),
    unit: z.string().min(1).max(80).optional(),
    valueSource: z.enum(fieldValueSources),
    domainDescription: z.string().min(1).max(400).optional(),
    resolutionDescription: z.string().min(1).max(400).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const environmentalLayerSchema: z.ZodType<EnvironmentalLayer> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    layerType: z.enum(environmentalLayerTypes),
    fieldIds: z.array(boundedString(160)).max(maxLayerFieldRefs),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const samplingRuleSchema: z.ZodType<SamplingRule> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    fieldId: boundedString(160),
    samplingType: z.enum(samplingTypes),
    interpolationType: z.string().min(1).max(160).optional(),
    extrapolationPolicy: z.enum(extrapolationPolicies),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const spatialFieldModelSchema: z.ZodType<SpatialFieldModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(fieldLayerArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    coordinateSpace: coordinateSpaceSchema,
    fields: z.array(fieldDefinitionSchema).min(1).max(maxSpatialFields),
    layers: z.array(environmentalLayerSchema).max(maxEnvironmentalLayers).optional(),
    samplingRules: z.array(samplingRuleSchema).max(maxSamplingRules).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxSpatialFieldNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxSpatialFieldNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxSpatialFieldNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenSpatialFieldKeys = new Set([
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
  "activeEngine",
  "raster",
  "rasters",
  "gridValues",
  "fieldValues",
  "valueGrid",
  "cellValues",
  "formula",
  "formulas",
  "expression",
  "expressions",
  "equation",
  "equations",
  "code",
  "script",
  "functionBody"
]);

export function validateSpatialFieldModel(value: unknown): SpatialFieldModel {
  assertPlainSpatialFieldJson(value, "Spatial field model");
  const parsed = spatialFieldModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid spatial field model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeSpatialFieldModel(parsed.data);
  assertSpatialFieldJsonBound(model, maxSpatialFieldModelJsonLength, "Spatial field model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateCoordinateSpace(model.coordinateSpace);
  validateUniqueIds("field", model.fields);
  validateUniqueIds("environmental layer", model.layers ?? []);
  validateUniqueIds("sampling rule", model.samplingRules ?? []);
  validateReferences(model);
  return model;
}

export function parseSpatialFieldModelJson(json: string | unknown): SpatialFieldModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxSpatialFieldModelJsonLength) {
      throw new SimulationSerializationError(`Spatial field model JSON must be ${maxSpatialFieldModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid spatial field model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== fieldLayerArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${fieldLayerArtifactType}`);
  }
  return validateSpatialFieldModel(raw);
}

export function normalizeSpatialFieldModel(model: SpatialFieldModel): SpatialFieldModel {
  return {
    ...model,
    coordinateSpace: cloneRecord(model.coordinateSpace),
    fields: model.fields.map((field) => cloneRecord(field)),
    ...(model.layers ? { layers: model.layers.map((layer) => cloneRecord(layer)) } : {}),
    ...(model.samplingRules ? { samplingRules: model.samplingRules.map((rule) => cloneRecord(rule)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("spatial field assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("spatial field limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("spatial field validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function validateNotes(model: SpatialFieldModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`spatial field ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: SpatialFieldModel): void {
  if (model.metadata) {
    assertSpatialFieldJsonBound(model.metadata, maxSpatialFieldMetadataJsonLength, "Spatial field model metadata");
  }
  for (const [label, values] of [
    ["coordinate space", [model.coordinateSpace]],
    ["field", model.fields],
    ["environmental layer", model.layers ?? []],
    ["sampling rule", model.samplingRules ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertSpatialFieldJsonBound(value.metadata, maxSpatialFieldMetadataJsonLength, `${label} metadata`);
      }
    }
  }
}

function validateCoordinateSpace(coordinateSpace: CoordinateSpace): void {
  const extent = coordinateSpace.extent;
  if (extent && (extent.minX >= extent.maxX || extent.minY >= extent.maxY)) {
    throw new SimulationValidationError("Coordinate space extent must have minX < maxX and minY < maxY");
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

function validateReferences(model: SpatialFieldModel): void {
  const fieldIds = new Set(model.fields.map((field) => field.id));
  for (const layer of model.layers ?? []) {
    for (const fieldId of layer.fieldIds) {
      if (!fieldIds.has(fieldId)) {
        throw new SimulationValidationError(`Environmental layer ${layer.id} references unknown fieldId: ${fieldId}`);
      }
    }
  }
  for (const rule of model.samplingRules ?? []) {
    if (!fieldIds.has(rule.fieldId)) {
      throw new SimulationValidationError(`Sampling rule ${rule.id} references unknown fieldId: ${rule.fieldId}`);
    }
  }
}

export function assertSpatialFieldJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainSpatialFieldJson(value: unknown, label: string): void {
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
      if (forbiddenSpatialFieldKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not contain live-state, raster/value-grid, or executable-shaped key ${key}`);
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
