import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  aggregationTypes,
  crossScaleDirections,
  crossScaleLinkTypes,
  disaggregationTypes,
  maxCrossScaleLinks,
  maxScaleEntityTypesPerLevel,
  maxScaleLevels,
  maxScaleModelJsonLength,
  maxScaleModelMetadataJsonLength,
  maxScaleModelNoteLength,
  maxScaleModelNotes,
  maxScaleRules,
  maxScaleStateVariablesPerEntity,
  scaleEntityKinds,
  scaleModelArtifactType,
  scaleStateValueTypes,
  scaleTypes,
  type AggregationRule,
  type CrossScaleLink,
  type DisaggregationRule,
  type MultiScaleModel,
  type ScaleEntityType,
  type ScaleLevel,
  type ScaleStateVariable
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(1_200).optional();
const variableReferenceSchema = z.string().min(1).max(160);
const noteSchema = z.string().min(1).max(maxScaleModelNoteLength);

const stateVariableSchema: z.ZodType<ScaleStateVariable> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    valueType: z.enum(scaleStateValueTypes),
    unit: z.string().min(1).max(80).optional(),
    description: optionalDescription,
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const entityTypeSchema: z.ZodType<ScaleEntityType> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    description: optionalDescription,
    kind: z.enum(scaleEntityKinds),
    stateVariables: z.array(stateVariableSchema).max(maxScaleStateVariablesPerEntity).optional(),
    metrics: z.array(stateVariableSchema).max(maxScaleStateVariablesPerEntity).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const scaleLevelSchema: z.ZodType<ScaleLevel> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    description: optionalDescription,
    order: z.number().int().min(0).max(10_000),
    scaleType: z.enum(scaleTypes),
    entityTypes: z.array(entityTypeSchema).max(maxScaleEntityTypesPerLevel),
    defaultViewMode: z.string().min(1).max(120).optional(),
    temporalResolution: z.string().min(1).max(120).optional(),
    spatialResolution: z.string().min(1).max(120).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const aggregationRuleSchema: z.ZodType<AggregationRule> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    fromScaleId: boundedString(160),
    toScaleId: boundedString(160),
    fromEntityTypeId: boundedString(160),
    toEntityTypeId: boundedString(160),
    aggregationType: z.enum(aggregationTypes),
    sourceVariables: z.array(variableReferenceSchema).max(maxScaleStateVariablesPerEntity).optional(),
    targetVariables: z.array(variableReferenceSchema).max(maxScaleStateVariablesPerEntity).optional(),
    informationLossNotes: z.array(noteSchema).max(maxScaleModelNotes).optional(),
    executable: z.literal(false),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const disaggregationRuleSchema: z.ZodType<DisaggregationRule> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    fromScaleId: boundedString(160),
    toScaleId: boundedString(160),
    fromEntityTypeId: boundedString(160),
    toEntityTypeId: boundedString(160),
    disaggregationType: z.enum(disaggregationTypes),
    sourceVariables: z.array(variableReferenceSchema).max(maxScaleStateVariablesPerEntity).optional(),
    targetVariables: z.array(variableReferenceSchema).max(maxScaleStateVariablesPerEntity).optional(),
    syntheticDetailNotes: z.array(noteSchema).max(maxScaleModelNotes).optional(),
    executable: z.literal(false),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const crossScaleLinkSchema: z.ZodType<CrossScaleLink> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    sourceScaleId: boundedString(160),
    targetScaleId: boundedString(160),
    sourceEntityTypeId: boundedString(160).optional(),
    targetEntityTypeId: boundedString(160).optional(),
    linkType: z.enum(crossScaleLinkTypes),
    direction: z.enum(crossScaleDirections),
    active: z.boolean(),
    executable: z.literal(false),
    notes: z.string().max(maxScaleModelNoteLength).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const multiScaleModelSchema: z.ZodType<MultiScaleModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(scaleModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: z.string().max(2_000).optional(),
    version: boundedString(80),
    scaleLevels: z.array(scaleLevelSchema).min(1).max(maxScaleLevels),
    aggregationRules: z.array(aggregationRuleSchema).max(maxScaleRules),
    disaggregationRules: z.array(disaggregationRuleSchema).max(maxScaleRules),
    crossScaleLinks: z.array(crossScaleLinkSchema).max(maxCrossScaleLinks),
    primaryScaleId: boundedString(160).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxScaleModelNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxScaleModelNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxScaleModelNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenScaleKeys = new Set([
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
  "code",
  "script",
  "functionBody"
]);

export function validateMultiScaleModel(value: unknown): MultiScaleModel {
  assertPlainScaleJson(value, "Multi-scale model");
  const parsed = multiScaleModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid multi-scale model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeMultiScaleModel(parsed.data);
  assertScaleJsonBound(model, maxScaleModelJsonLength, "Multi-scale model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateScaleLevels(model.scaleLevels);
  validateRuleIds("aggregation rule", model.aggregationRules);
  validateRuleIds("disaggregation rule", model.disaggregationRules);
  validateRuleIds("cross-scale link", model.crossScaleLinks);
  validatePrimaryScale(model);
  validateAggregationRules(model);
  validateDisaggregationRules(model);
  validateCrossScaleLinks(model);
  return model;
}

export function parseMultiScaleModelJson(json: string | unknown): MultiScaleModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxScaleModelJsonLength) {
      throw new SimulationSerializationError(`Multi-scale model JSON must be ${maxScaleModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid multi-scale model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== scaleModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${scaleModelArtifactType}`);
  }
  return validateMultiScaleModel(raw);
}

export function normalizeMultiScaleModel(model: MultiScaleModel): MultiScaleModel {
  return {
    ...model,
    scaleLevels: model.scaleLevels.map((level) => ({
      ...level,
      entityTypes: level.entityTypes.map((entityType) => ({
        ...entityType,
        ...(entityType.stateVariables ? { stateVariables: entityType.stateVariables.map((variable) => ({ ...variable })) } : {}),
        ...(entityType.metrics ? { metrics: entityType.metrics.map((metric) => ({ ...metric })) } : {}),
        ...(entityType.metadata ? { metadata: JSON.parse(JSON.stringify(entityType.metadata)) as Record<string, JsonValue> } : {})
      })),
      ...(level.metadata ? { metadata: JSON.parse(JSON.stringify(level.metadata)) as Record<string, JsonValue> } : {})
    })),
    aggregationRules: model.aggregationRules.map((rule) => cloneRule(rule)),
    disaggregationRules: model.disaggregationRules.map((rule) => cloneRule(rule)),
    crossScaleLinks: model.crossScaleLinks.map((link) => ({ ...link, ...(link.metadata ? { metadata: JSON.parse(JSON.stringify(link.metadata)) as Record<string, JsonValue> } : {}) })),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("multi-scale assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("multi-scale limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("multi-scale validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function cloneRule<T extends AggregationRule | DisaggregationRule>(rule: T): T {
  return {
    ...rule,
    ...(rule.sourceVariables ? { sourceVariables: [...rule.sourceVariables] } : {}),
    ...(rule.targetVariables ? { targetVariables: [...rule.targetVariables] } : {}),
    ...("informationLossNotes" in rule && rule.informationLossNotes ? { informationLossNotes: [...rule.informationLossNotes] } : {}),
    ...("syntheticDetailNotes" in rule && rule.syntheticDetailNotes ? { syntheticDetailNotes: [...rule.syntheticDetailNotes] } : {}),
    ...(rule.metadata ? { metadata: JSON.parse(JSON.stringify(rule.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validateScaleLevels(scaleLevels: readonly ScaleLevel[]): void {
  const ids = new Set<string>();
  const orders = new Set<number>();
  for (const level of scaleLevels) {
    if (ids.has(level.id)) {
      throw new SimulationValidationError(`Duplicate scale level id: ${level.id}`);
    }
    ids.add(level.id);
    if (orders.has(level.order)) {
      throw new SimulationValidationError(`Duplicate scale order: ${level.order}`);
    }
    orders.add(level.order);
    const entityIds = new Set<string>();
    for (const entityType of level.entityTypes) {
      if (entityIds.has(entityType.id)) {
        throw new SimulationValidationError(`Duplicate entity type id ${entityType.id} in scale ${level.id}`);
      }
      entityIds.add(entityType.id);
      validateVariableIds(level.id, entityType.id, "state variable", entityType.stateVariables ?? []);
      validateVariableIds(level.id, entityType.id, "metric", entityType.metrics ?? []);
    }
  }
}

function validateVariableIds(scaleId: string, entityTypeId: string, label: string, variables: readonly ScaleStateVariable[]): void {
  const ids = new Set<string>();
  for (const variable of variables) {
    if (ids.has(variable.id)) {
      throw new SimulationValidationError(`Duplicate ${label} id ${variable.id} in ${scaleId}/${entityTypeId}`);
    }
    ids.add(variable.id);
  }
}

function validateRuleIds(label: string, values: readonly { id: string }[]): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new SimulationValidationError(`Duplicate ${label} id: ${value.id}`);
    }
    ids.add(value.id);
  }
}

function validatePrimaryScale(model: MultiScaleModel): void {
  if (model.primaryScaleId && !scaleIdSet(model).has(model.primaryScaleId)) {
    throw new SimulationValidationError(`Unknown primaryScaleId: ${model.primaryScaleId}`);
  }
}

function validateAggregationRules(model: MultiScaleModel): void {
  for (const rule of model.aggregationRules) {
    validateScaleTransition(model, rule.fromScaleId, rule.toScaleId, `Aggregation rule ${rule.id}`);
    validateEntityReference(model, rule.fromScaleId, rule.fromEntityTypeId, `Aggregation rule ${rule.id} fromEntityTypeId`);
    validateEntityReference(model, rule.toScaleId, rule.toEntityTypeId, `Aggregation rule ${rule.id} toEntityTypeId`);
  }
}

function validateDisaggregationRules(model: MultiScaleModel): void {
  for (const rule of model.disaggregationRules) {
    validateScaleTransition(model, rule.fromScaleId, rule.toScaleId, `Disaggregation rule ${rule.id}`);
    validateEntityReference(model, rule.fromScaleId, rule.fromEntityTypeId, `Disaggregation rule ${rule.id} fromEntityTypeId`);
    validateEntityReference(model, rule.toScaleId, rule.toEntityTypeId, `Disaggregation rule ${rule.id} toEntityTypeId`);
    if (rule.disaggregationType !== "restorePrevious" && (rule.syntheticDetailNotes?.length ?? 0) === 0) {
      throw new SimulationValidationError(`Disaggregation rule ${rule.id} must describe synthetic detail`);
    }
  }
}

function validateCrossScaleLinks(model: MultiScaleModel): void {
  for (const link of model.crossScaleLinks) {
    validateScaleTransition(model, link.sourceScaleId, link.targetScaleId, `Cross-scale link ${link.id}`);
    if (link.sourceEntityTypeId) {
      validateEntityReference(model, link.sourceScaleId, link.sourceEntityTypeId, `Cross-scale link ${link.id} sourceEntityTypeId`);
    }
    if (link.targetEntityTypeId) {
      validateEntityReference(model, link.targetScaleId, link.targetEntityTypeId, `Cross-scale link ${link.id} targetEntityTypeId`);
    }
  }
}

function validateScaleTransition(model: MultiScaleModel, fromScaleId: string, toScaleId: string, label: string): void {
  const scaleIds = scaleIdSet(model);
  if (!scaleIds.has(fromScaleId)) {
    throw new SimulationValidationError(`${label} references unknown source scale ${fromScaleId}`);
  }
  if (!scaleIds.has(toScaleId)) {
    throw new SimulationValidationError(`${label} references unknown target scale ${toScaleId}`);
  }
  if (fromScaleId === toScaleId) {
    throw new SimulationValidationError(`${label} must connect different scale levels`);
  }
}

function validateEntityReference(model: MultiScaleModel, scaleId: string, entityTypeId: string, label: string): void {
  const level = model.scaleLevels.find((candidate) => candidate.id === scaleId);
  if (!level?.entityTypes.some((entityType) => entityType.id === entityTypeId)) {
    throw new SimulationValidationError(`${label} references unknown entity type ${entityTypeId} on scale ${scaleId}`);
  }
}

function scaleIdSet(model: MultiScaleModel): Set<string> {
  return new Set(model.scaleLevels.map((level) => level.id));
}

function validateNotes(model: MultiScaleModel): void {
  for (const [section, items] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    for (const item of items ?? []) {
      assertScaleJsonBound(item, maxScaleModelNoteLength * 2, `Multi-scale ${section}`);
    }
  }
}

function validateMetadataBounds(model: MultiScaleModel): void {
  if (model.metadata) {
    assertScaleJsonBound(model.metadata, maxScaleModelMetadataJsonLength, "Multi-scale model metadata");
  }
  for (const level of model.scaleLevels) {
    if (level.metadata) {
      assertScaleJsonBound(level.metadata, maxScaleModelMetadataJsonLength, `Scale level ${level.id} metadata`);
    }
    for (const entityType of level.entityTypes) {
      if (entityType.metadata) {
        assertScaleJsonBound(entityType.metadata, maxScaleModelMetadataJsonLength, `Entity type ${entityType.id} metadata`);
      }
      for (const variable of [...(entityType.stateVariables ?? []), ...(entityType.metrics ?? [])]) {
        if (variable.metadata) {
          assertScaleJsonBound(variable.metadata, maxScaleModelMetadataJsonLength, `Variable ${variable.id} metadata`);
        }
      }
    }
  }
  for (const rule of [...model.aggregationRules, ...model.disaggregationRules]) {
    if (rule.metadata) {
      assertScaleJsonBound(rule.metadata, maxScaleModelMetadataJsonLength, `Scale rule ${rule.id} metadata`);
    }
  }
  for (const link of model.crossScaleLinks) {
    if (link.metadata) {
      assertScaleJsonBound(link.metadata, maxScaleModelMetadataJsonLength, `Cross-scale link ${link.id} metadata`);
    }
  }
}

export function assertScaleJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainScaleJson(value: unknown, label: string): void {
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
      if (forbiddenScaleKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not contain live-state or executable-shaped key ${key}`);
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
