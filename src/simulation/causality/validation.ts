import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  causalAssumptionModelArtifactType,
  causalAssumptionStatuses,
  causalAssumptionTypes,
  causalConfidenceLevels,
  causalObservabilityStatuses,
  causalVariableKinds,
  evidenceTypes,
  influenceDirections,
  influencePolarities,
  influenceTypes,
  interventionExpectedDirections,
  interventionKinds,
  maxCausalAssumptionMetadataJsonLength,
  maxCausalAssumptionModelJsonLength,
  maxCausalAssumptionNoteLength,
  maxCausalAssumptionNotes,
  maxCausalAssumptions,
  maxCausalRefs,
  maxCausalVariables,
  maxEvidenceItems,
  maxInfluenceEdges,
  maxInterventionLinks,
  type CausalAssumption,
  type CausalAssumptionModel,
  type CausalScope,
  type CausalVariable,
  type EvidenceItem,
  type InfluenceEdge,
  type InterventionLink
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxCausalAssumptionNoteLength);
const notesSchema = z.array(noteSchema).max(maxCausalAssumptionNotes);

const scopeSchema: z.ZodType<CausalScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    runConfigId: boundedString(240).optional(),
    observabilityModelId: boundedString(160).optional(),
    scaleModelId: boundedString(160).optional(),
    boundaryModelId: boundedString(160).optional(),
    fieldLayerId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const causalVariableSchema: z.ZodType<CausalVariable> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    variableKind: z.enum(causalVariableKinds),
    observabilityStatus: z.enum(causalObservabilityStatuses).optional(),
    targetPath: z.string().min(1).max(400).optional(),
    unit: z.string().min(1).max(80).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const influenceEdgeSchema: z.ZodType<InfluenceEdge> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    sourceVariableId: boundedString(160),
    targetVariableId: boundedString(160),
    direction: z.enum(influenceDirections),
    influenceType: z.enum(influenceTypes),
    polarity: z.enum(influencePolarities).optional(),
    strengthDescription: z.string().min(1).max(400).optional(),
    lagDescription: z.string().min(1).max(400).optional(),
    mechanismDescription: z.string().min(1).max(800).optional(),
    evidenceIds: z.array(boundedString(160)).max(maxCausalRefs).optional(),
    assumptionIds: z.array(boundedString(160)).max(maxCausalRefs).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const causalAssumptionSchema: z.ZodType<CausalAssumption> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    assumptionType: z.enum(causalAssumptionTypes),
    statement: z.string().min(1).max(1_200),
    confidence: z.enum(causalConfidenceLevels),
    status: z.enum(causalAssumptionStatuses),
    evidenceIds: z.array(boundedString(160)).max(maxCausalRefs).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const evidenceItemSchema: z.ZodType<EvidenceItem> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    evidenceType: z.enum(evidenceTypes),
    provenance: z.string().min(1).max(800).optional(),
    citation: z.string().min(1).max(800).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const interventionLinkSchema: z.ZodType<InterventionLink> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    targetVariableId: boundedString(160),
    interventionKind: z.enum(interventionKinds),
    expectedDirection: z.enum(interventionExpectedDirections).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const causalAssumptionModelSchema: z.ZodType<CausalAssumptionModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(causalAssumptionModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    scope: scopeSchema.optional(),
    variables: z.array(causalVariableSchema).min(1).max(maxCausalVariables),
    influences: z.array(influenceEdgeSchema).max(maxInfluenceEdges).optional(),
    assumptions: z.array(causalAssumptionSchema).max(maxCausalAssumptions).optional(),
    evidenceItems: z.array(evidenceItemSchema).max(maxEvidenceItems).optional(),
    interventionLinks: z.array(interventionLinkSchema).max(maxInterventionLinks).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxCausalAssumptionNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxCausalAssumptionNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxCausalAssumptionNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenCausalKeys = new Set([
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
  "structuralEquation",
  "structuralEquations",
  "doCalculus",
  "doCalculusConfig",
  "estimator",
  "estimators",
  "estimatorConfig",
  "likelihood",
  "likelihoods",
  "likelihoodConfig",
  "inference",
  "inferenceConfig",
  "calibration",
  "calibrationConfig",
  "causalDiscovery",
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
  "callback",
  "proof",
  "proofs",
  "causalProof",
  "causalProofs",
  "certification",
  "certifications",
  "certified",
  "validationClaim",
  "validationClaims",
  "causalValidation"
]);

export function validateCausalAssumptionModel(value: unknown): CausalAssumptionModel {
  assertPlainCausalAssumptionJson(value, "Causal assumption model");
  const parsed = causalAssumptionModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid causal assumption model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeCausalAssumptionModel(parsed.data);
  assertCausalAssumptionJsonBound(model, maxCausalAssumptionModelJsonLength, "Causal assumption model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("variable", model.variables);
  validateUniqueIds("influence", model.influences ?? []);
  validateUniqueIds("assumption", model.assumptions ?? []);
  validateUniqueIds("evidence", model.evidenceItems ?? []);
  validateUniqueIds("intervention link", model.interventionLinks ?? []);
  validateReferences(model);
  return model;
}

export function parseCausalAssumptionModelJson(json: string | unknown): CausalAssumptionModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxCausalAssumptionModelJsonLength) {
      throw new SimulationSerializationError(`Causal assumption model JSON must be ${maxCausalAssumptionModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid causal assumption model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== causalAssumptionModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${causalAssumptionModelArtifactType}`);
  }
  return validateCausalAssumptionModel(raw);
}

export function normalizeCausalAssumptionModel(model: CausalAssumptionModel): CausalAssumptionModel {
  return {
    ...model,
    ...(model.scope ? { scope: cloneRecord(model.scope) } : {}),
    variables: model.variables.map((variable) => cloneRecord(variable)),
    ...(model.influences ? { influences: model.influences.map((influence) => cloneRecord(influence)) } : {}),
    ...(model.assumptions ? { assumptions: model.assumptions.map((assumption) => cloneRecord(assumption)) } : {}),
    ...(model.evidenceItems ? { evidenceItems: model.evidenceItems.map((evidence) => cloneRecord(evidence)) } : {}),
    ...(model.interventionLinks ? { interventionLinks: model.interventionLinks.map((link) => cloneRecord(link)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("causal assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("causal limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("causal validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(model: CausalAssumptionModel): void {
  const variableIds = new Set(model.variables.map((variable) => variable.id));
  const evidenceIds = new Set((model.evidenceItems ?? []).map((evidence) => evidence.id));
  const assumptionIds = new Set((model.assumptions ?? []).map((assumption) => assumption.id));
  for (const influence of model.influences ?? []) {
    if (!variableIds.has(influence.sourceVariableId)) {
      throw new SimulationValidationError(`Influence ${influence.id} references unknown sourceVariableId: ${influence.sourceVariableId}`);
    }
    if (!variableIds.has(influence.targetVariableId)) {
      throw new SimulationValidationError(`Influence ${influence.id} references unknown targetVariableId: ${influence.targetVariableId}`);
    }
    if (influence.sourceVariableId === influence.targetVariableId) {
      throw new SimulationValidationError(`Influence ${influence.id} cannot be a self-edge`);
    }
    for (const evidenceId of influence.evidenceIds ?? []) {
      if (!evidenceIds.has(evidenceId)) {
        throw new SimulationValidationError(`Influence ${influence.id} references unknown evidenceId: ${evidenceId}`);
      }
    }
    for (const assumptionId of influence.assumptionIds ?? []) {
      if (!assumptionIds.has(assumptionId)) {
        throw new SimulationValidationError(`Influence ${influence.id} references unknown assumptionId: ${assumptionId}`);
      }
    }
  }
  for (const assumption of model.assumptions ?? []) {
    for (const evidenceId of assumption.evidenceIds ?? []) {
      if (!evidenceIds.has(evidenceId)) {
        throw new SimulationValidationError(`Causal assumption ${assumption.id} references unknown evidenceId: ${evidenceId}`);
      }
    }
  }
  for (const link of model.interventionLinks ?? []) {
    if (!variableIds.has(link.targetVariableId)) {
      throw new SimulationValidationError(`Intervention link ${link.id} references unknown targetVariableId: ${link.targetVariableId}`);
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

function validateNotes(model: CausalAssumptionModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`causal ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: CausalAssumptionModel): void {
  for (const [label, values] of [
    ["scope", model.scope ? [model.scope] : []],
    ["variable", model.variables],
    ["influence", model.influences ?? []],
    ["assumption", model.assumptions ?? []],
    ["evidence", model.evidenceItems ?? []],
    ["intervention link", model.interventionLinks ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertCausalAssumptionJsonBound(value.metadata, maxCausalAssumptionMetadataJsonLength, `${label} metadata`);
      }
    }
  }
  if (model.metadata) {
    assertCausalAssumptionJsonBound(model.metadata, maxCausalAssumptionMetadataJsonLength, "Causal assumption model metadata");
  }
}

export function assertCausalAssumptionJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainCausalAssumptionJson(value: unknown, label: string): void {
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
      if (forbiddenCausalKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not contain live-state, executable-shaped, formula, structural-equation, or external-data key ${key}`);
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
