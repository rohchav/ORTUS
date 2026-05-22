import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  boundaryDirectionalities,
  boundaryExchangeDirections,
  boundaryExchangeTypes,
  boundaryKinds,
  boundaryModelArtifactType,
  boundaryPermeabilities,
  boundaryTypes,
  environmentTypes,
  exogenousShockTypes,
  externalForcingTypes,
  maxBoundaryExchanges,
  maxBoundaryForcings,
  maxBoundaryModelJsonLength,
  maxBoundaryModelMetadataJsonLength,
  maxBoundaryNoteLength,
  maxBoundaryNotes,
  maxBoundaryScopeItems,
  maxBoundaryShocks,
  maxBoundarySurfaces,
  type BoundaryEnvironmentModel,
  type BoundaryExchange,
  type BoundarySurface,
  type ExogenousShock,
  type ExternalForcing,
  type SystemScope
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxBoundaryNoteLength);
const scopeItemSchema = z.string().min(1).max(180);
const scopeListSchema = z.array(scopeItemSchema).max(maxBoundaryScopeItems);
const notesSchema = z.array(noteSchema).max(maxBoundaryNotes);

const systemScopeSchema: z.ZodType<SystemScope> = z
  .object({
    includedEntityTypes: scopeListSchema.optional(),
    excludedEntityTypes: scopeListSchema.optional(),
    includedProcesses: scopeListSchema.optional(),
    excludedProcesses: scopeListSchema.optional(),
    includedScales: scopeListSchema.optional(),
    excludedScales: scopeListSchema.optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const environmentScopeSchema = z
  .object({
    environmentType: z.enum(environmentTypes),
    description: optionalDescription,
    externalEntityTypes: scopeListSchema.optional(),
    externalProcesses: scopeListSchema.optional(),
    externalConstraints: scopeListSchema.optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const boundarySurfaceSchema: z.ZodType<BoundarySurface> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    boundaryKind: z.enum(boundaryKinds),
    directionality: z.enum(boundaryDirectionalities),
    permeability: z.enum(boundaryPermeabilities),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const boundaryExchangeSchema: z.ZodType<BoundaryExchange> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    boundarySurfaceId: boundedString(160).optional(),
    exchangeType: z.enum(boundaryExchangeTypes),
    direction: z.enum(boundaryExchangeDirections),
    source: boundedString(240).optional(),
    target: boundedString(240).optional(),
    quantityVariable: boundedString(160).optional(),
    rateVariable: boundedString(160).optional(),
    unit: z.string().min(1).max(80).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const externalForcingSchema: z.ZodType<ExternalForcing> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    forcingType: z.enum(externalForcingTypes),
    targetDescription: z.string().min(1).max(400).optional(),
    variable: boundedString(160).optional(),
    unit: z.string().min(1).max(80).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const exogenousShockSchema: z.ZodType<ExogenousShock> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    shockType: z.enum(exogenousShockTypes),
    timingDescription: z.string().min(1).max(400).optional(),
    targetDescription: z.string().min(1).max(400).optional(),
    magnitudeDescription: z.string().min(1).max(400).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const boundaryEnvironmentModelSchema: z.ZodType<BoundaryEnvironmentModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(boundaryModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    boundaryType: z.enum(boundaryTypes),
    systemScope: systemScopeSchema,
    environmentScope: environmentScopeSchema.optional(),
    boundarySurfaces: z.array(boundarySurfaceSchema).max(maxBoundarySurfaces).optional(),
    exchanges: z.array(boundaryExchangeSchema).max(maxBoundaryExchanges).optional(),
    externalForcings: z.array(externalForcingSchema).max(maxBoundaryForcings).optional(),
    exogenousShocks: z.array(exogenousShockSchema).max(maxBoundaryShocks).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxBoundaryNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxBoundaryNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxBoundaryNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenBoundaryKeys = new Set([
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
  "fieldLayer",
  "spatialFields",
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

export function validateBoundaryEnvironmentModel(value: unknown): BoundaryEnvironmentModel {
  assertPlainBoundaryJson(value, "Boundary/environment model");
  const parsed = boundaryEnvironmentModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid boundary/environment model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeBoundaryEnvironmentModel(parsed.data);
  assertBoundaryJsonBound(model, maxBoundaryModelJsonLength, "Boundary/environment model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("boundary surface", model.boundarySurfaces ?? []);
  validateUniqueIds("boundary exchange", model.exchanges ?? []);
  validateUniqueIds("external forcing", model.externalForcings ?? []);
  validateUniqueIds("exogenous shock", model.exogenousShocks ?? []);
  validateBoundaryExchanges(model);
  return model;
}

export function parseBoundaryEnvironmentModelJson(json: string | unknown): BoundaryEnvironmentModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxBoundaryModelJsonLength) {
      throw new SimulationSerializationError(`Boundary/environment model JSON must be ${maxBoundaryModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid boundary/environment model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== boundaryModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${boundaryModelArtifactType}`);
  }
  return validateBoundaryEnvironmentModel(raw);
}

export function normalizeBoundaryEnvironmentModel(model: BoundaryEnvironmentModel): BoundaryEnvironmentModel {
  return {
    ...model,
    systemScope: cloneScope(model.systemScope),
    ...(model.environmentScope ? { environmentScope: cloneRecord(model.environmentScope) } : {}),
    ...(model.boundarySurfaces ? { boundarySurfaces: model.boundarySurfaces.map((surface) => cloneRecord(surface)) } : {}),
    ...(model.exchanges ? { exchanges: model.exchanges.map((exchange) => cloneRecord(exchange)) } : {}),
    ...(model.externalForcings ? { externalForcings: model.externalForcings.map((forcing) => cloneRecord(forcing)) } : {}),
    ...(model.exogenousShocks ? { exogenousShocks: model.exogenousShocks.map((shock) => cloneRecord(shock)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("boundary assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("boundary limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("boundary validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function cloneScope(scope: SystemScope): SystemScope {
  return cloneRecord(scope);
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function validateNotes(model: BoundaryEnvironmentModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`boundary ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: BoundaryEnvironmentModel): void {
  if (model.metadata) {
    assertBoundaryJsonBound(model.metadata, maxBoundaryModelMetadataJsonLength, "Boundary/environment model metadata");
  }
  for (const [label, values] of [
    ["system scope", [model.systemScope]],
    ["environment scope", model.environmentScope ? [model.environmentScope] : []],
    ["boundary surface", model.boundarySurfaces ?? []],
    ["boundary exchange", model.exchanges ?? []],
    ["external forcing", model.externalForcings ?? []],
    ["exogenous shock", model.exogenousShocks ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertBoundaryJsonBound(value.metadata, maxBoundaryModelMetadataJsonLength, `${label} metadata`);
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

function validateBoundaryExchanges(model: BoundaryEnvironmentModel): void {
  const surfaceIds = new Set((model.boundarySurfaces ?? []).map((surface) => surface.id));
  for (const exchange of model.exchanges ?? []) {
    if (exchange.boundarySurfaceId && !surfaceIds.has(exchange.boundarySurfaceId)) {
      throw new SimulationValidationError(`Boundary exchange ${exchange.id} references unknown boundarySurfaceId: ${exchange.boundarySurfaceId}`);
    }
  }
}

export function assertBoundaryJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainBoundaryJson(value: unknown, label: string): void {
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
      if (forbiddenBoundaryKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not contain live-state, spatial-field, or executable-shaped key ${key}`);
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
