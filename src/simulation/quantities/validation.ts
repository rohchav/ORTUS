import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  compatibilityRelations,
  dimensionKinds,
  maxBaseDimensions,
  maxCompatibilityRules,
  maxDimensions,
  maxQuantities,
  maxQuantitySemanticsMetadataJsonLength,
  maxQuantitySemanticsModelJsonLength,
  maxQuantitySemanticsNoteLength,
  maxQuantitySemanticsNotes,
  maxUnits,
  numericRoles,
  quantityKinds,
  quantitySemanticsModelArtifactType,
  unitKinds,
  type CompatibilityRule,
  type DimensionDefinition,
  type QuantityDefinition,
  type QuantityRange,
  type QuantityScope,
  type QuantitySemanticsModel,
  type UnitDefinition
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxQuantitySemanticsNoteLength);
const notesSchema = z.array(noteSchema).max(maxQuantitySemanticsNotes);

const scopeSchema: z.ZodType<QuantityScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    runConfigId: boundedString(240).optional(),
    observabilityModelId: boundedString(160).optional(),
    causalAssumptionModelId: boundedString(160).optional(),
    scaleModelId: boundedString(160).optional(),
    resourceSystemId: boundedString(160).optional(),
    fieldLayerId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const baseDimensionSchema = z
  .object({
    dimensionId: boundedString(160),
    exponent: z.number().finite().min(-24).max(24)
  })
  .strict();

const dimensionDefinitionSchema: z.ZodType<DimensionDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    dimensionKind: z.enum(dimensionKinds),
    baseDimensions: z.array(baseDimensionSchema).max(maxBaseDimensions).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const unitDefinitionSchema: z.ZodType<UnitDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    symbol: z.string().min(1).max(40).optional(),
    dimensionId: boundedString(160),
    unitKind: z.enum(unitKinds),
    scaleDescription: z.string().min(1).max(400).optional(),
    offsetDescription: z.string().min(1).max(400).optional(),
    conversionNotes: z.string().min(1).max(800).optional(),
    canonical: z.boolean().optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const quantityRangeSchema: z.ZodType<QuantityRange> = z
  .object({
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    includeMin: z.boolean().optional(),
    includeMax: z.boolean().optional()
  })
  .strict();

const quantityDefinitionSchema: z.ZodType<QuantityDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    quantityKind: z.enum(quantityKinds),
    unitId: boundedString(160).optional(),
    dimensionId: boundedString(160).optional(),
    targetPath: z.string().min(1).max(400).optional(),
    numericRole: z.enum(numericRoles),
    extensive: z.boolean().optional(),
    intensive: z.boolean().optional(),
    perTick: z.boolean().optional(),
    perTimeUnitId: boundedString(160).optional(),
    perSpaceUnitId: boundedString(160).optional(),
    perEntityUnitId: boundedString(160).optional(),
    validRange: quantityRangeSchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const compatibilityRuleSchema: z.ZodType<CompatibilityRule> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    leftQuantityId: boundedString(160).optional(),
    rightQuantityId: boundedString(160).optional(),
    leftDimensionId: boundedString(160).optional(),
    rightDimensionId: boundedString(160).optional(),
    relation: z.enum(compatibilityRelations),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const quantitySemanticsModelSchema: z.ZodType<QuantitySemanticsModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(quantitySemanticsModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    scope: scopeSchema.optional(),
    dimensions: z.array(dimensionDefinitionSchema).min(1).max(maxDimensions),
    units: z.array(unitDefinitionSchema).min(1).max(maxUnits),
    quantities: z.array(quantityDefinitionSchema).min(1).max(maxQuantities),
    compatibilityRules: z.array(compatibilityRuleSchema).max(maxCompatibilityRules).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxQuantitySemanticsNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxQuantitySemanticsNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxQuantitySemanticsNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenQuantityKeys = new Set([
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
  "formula",
  "formulas",
  "expression",
  "expressions",
  "equation",
  "equations",
  "symbolic",
  "symbolicAlgebra",
  "solver",
  "solvers",
  "unitConverter",
  "unitConverters",
  "conversionFunction",
  "conversionFunctions",
  "calibration",
  "calibrationConfig",
  "calibrationResult",
  "calibrationResults",
  "externalValidation",
  "externalValidations",
  "likelihood",
  "likelihoods",
  "proof",
  "proofs",
  "certification",
  "certifications",
  "certified",
  "validationClaim",
  "validationClaims",
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
  "code",
  "script",
  "functionBody",
  "callback"
]);

export function validateQuantitySemanticsModel(value: unknown): QuantitySemanticsModel {
  assertPlainQuantitySemanticsJson(value, "Quantity semantics model");
  const parsed = quantitySemanticsModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid quantity semantics model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeQuantitySemanticsModel(parsed.data);
  assertQuantitySemanticsJsonBound(model, maxQuantitySemanticsModelJsonLength, "Quantity semantics model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("dimension", model.dimensions);
  validateUniqueIds("unit", model.units);
  validateUniqueIds("quantity", model.quantities);
  validateUniqueIds("compatibility rule", model.compatibilityRules ?? []);
  validateReferences(model);
  validateQuantityRanges(model.quantities);
  return model;
}

export function parseQuantitySemanticsModelJson(json: string | unknown): QuantitySemanticsModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxQuantitySemanticsModelJsonLength) {
      throw new SimulationSerializationError(`Quantity semantics model JSON must be ${maxQuantitySemanticsModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid quantity semantics model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== quantitySemanticsModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${quantitySemanticsModelArtifactType}`);
  }
  return validateQuantitySemanticsModel(raw);
}

export function normalizeQuantitySemanticsModel(model: QuantitySemanticsModel): QuantitySemanticsModel {
  return {
    ...model,
    ...(model.scope ? { scope: cloneRecord(model.scope) } : {}),
    dimensions: model.dimensions.map((dimension) => cloneRecord(dimension)),
    units: model.units.map((unit) => cloneRecord(unit)),
    quantities: model.quantities.map((quantity) => cloneRecord(quantity)),
    ...(model.compatibilityRules ? { compatibilityRules: model.compatibilityRules.map((rule) => cloneRecord(rule)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("quantity semantics assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("quantity semantics limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("quantity semantics validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(model: QuantitySemanticsModel): void {
  const dimensionIds = new Set(model.dimensions.map((dimension) => dimension.id));
  const unitIds = new Set(model.units.map((unit) => unit.id));
  const quantityIds = new Set(model.quantities.map((quantity) => quantity.id));

  for (const dimension of model.dimensions) {
    for (const base of dimension.baseDimensions ?? []) {
      if (!dimensionIds.has(base.dimensionId)) {
        throw new SimulationValidationError(`Dimension ${dimension.id} references unknown base dimensionId: ${base.dimensionId}`);
      }
    }
  }

  for (const unit of model.units) {
    if (!dimensionIds.has(unit.dimensionId)) {
      throw new SimulationValidationError(`Unit ${unit.id} references unknown dimensionId: ${unit.dimensionId}`);
    }
  }

  for (const quantity of model.quantities) {
    if (quantity.unitId && !unitIds.has(quantity.unitId)) {
      throw new SimulationValidationError(`Quantity ${quantity.id} references unknown unitId: ${quantity.unitId}`);
    }
    if (quantity.dimensionId && !dimensionIds.has(quantity.dimensionId)) {
      throw new SimulationValidationError(`Quantity ${quantity.id} references unknown dimensionId: ${quantity.dimensionId}`);
    }
    for (const [field, unitId] of [
      ["perTimeUnitId", quantity.perTimeUnitId],
      ["perSpaceUnitId", quantity.perSpaceUnitId],
      ["perEntityUnitId", quantity.perEntityUnitId]
    ] as const) {
      if (unitId && !unitIds.has(unitId)) {
        throw new SimulationValidationError(`Quantity ${quantity.id} references unknown ${field}: ${unitId}`);
      }
    }
    if (quantity.extensive && quantity.intensive) {
      throw new SimulationValidationError(`Quantity ${quantity.id} cannot be both extensive and intensive`);
    }
  }

  for (const rule of model.compatibilityRules ?? []) {
    for (const [field, quantityId] of [
      ["leftQuantityId", rule.leftQuantityId],
      ["rightQuantityId", rule.rightQuantityId]
    ] as const) {
      if (quantityId && !quantityIds.has(quantityId)) {
        throw new SimulationValidationError(`Compatibility rule ${rule.id} references unknown ${field}: ${quantityId}`);
      }
    }
    for (const [field, dimensionId] of [
      ["leftDimensionId", rule.leftDimensionId],
      ["rightDimensionId", rule.rightDimensionId]
    ] as const) {
      if (dimensionId && !dimensionIds.has(dimensionId)) {
        throw new SimulationValidationError(`Compatibility rule ${rule.id} references unknown ${field}: ${dimensionId}`);
      }
    }
  }
}

function validateQuantityRanges(quantities: readonly QuantityDefinition[]): void {
  for (const quantity of quantities) {
    const range = quantity.validRange;
    if (!range) {
      continue;
    }
    if (range.min === undefined && range.max === undefined) {
      throw new SimulationValidationError(`Quantity ${quantity.id} validRange requires min or max`);
    }
    if (range.min !== undefined && range.max !== undefined && range.min > range.max) {
      throw new SimulationValidationError(`Quantity ${quantity.id} validRange min must be less than or equal to max`);
    }
    if (quantity.numericRole === "bounded01") {
      if ((range.min !== undefined && range.min < 0) || (range.max !== undefined && range.max > 1)) {
        throw new SimulationValidationError(`Quantity ${quantity.id} with bounded01 numericRole must have range within 0..1`);
      }
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

function validateNotes(model: QuantitySemanticsModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`quantity semantics ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: QuantitySemanticsModel): void {
  for (const [label, values] of [
    ["scope", model.scope ? [model.scope] : []],
    ["dimension", model.dimensions],
    ["unit", model.units],
    ["quantity", model.quantities],
    ["compatibility rule", model.compatibilityRules ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertQuantitySemanticsJsonBound(value.metadata, maxQuantitySemanticsMetadataJsonLength, `${label} metadata`);
      }
    }
  }
  if (model.metadata) {
    assertQuantitySemanticsJsonBound(model.metadata, maxQuantitySemanticsMetadataJsonLength, "Quantity semantics model metadata");
  }
}

export function assertQuantitySemanticsJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainQuantitySemanticsJson(value: unknown, label: string): void {
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
      if (forbiddenQuantityKeys.has(key)) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable-shaped, formula, equation, solver, conversion-engine, calibration, or external-data key ${key}`
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
