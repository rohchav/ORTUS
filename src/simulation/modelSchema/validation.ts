import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import { primitiveIds } from "../registry/types";
import {
  maxModelSchemaArtifactReferences,
  maxModelSchemaDeclarations,
  maxModelSchemaDescriptionLength,
  maxModelSchemaJsonLength,
  maxModelSchemaMetadataJsonLength,
  maxModelSchemaNoteLength,
  maxModelSchemaNotes,
  modelArtifactReferenceRoles,
  modelComponentKinds,
  modelEntityKinds,
  modelMetricKinds,
  modelParameterValueKinds,
  modelRuleKinds,
  modelSchemaArtifactType,
  modelSpaceKinds,
  modelValueKinds,
  type AttributeTypeDeclaration,
  type ComponentTypeDeclaration,
  type EntityTypeDeclaration,
  type MetricDeclaration,
  type ModelArtifactReference,
  type ModelSchemaDefinition,
  type ModelSchemaScope,
  type ParameterDeclaration,
  type RuleDeclaration,
  type SpaceDeclaration
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(maxModelSchemaDescriptionLength).optional();
const noteSchema = z.string().min(1).max(maxModelSchemaNoteLength);
const notesSchema = z.array(noteSchema).max(maxModelSchemaNotes);
const stringIdArraySchema = z.array(boundedString(160)).max(maxModelSchemaDeclarations);

const scopeSchema: z.ZodType<ModelSchemaScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    runConfigId: boundedString(240).optional(),
    hybridCompositionId: boundedString(160).optional(),
    networkDefinitionId: boundedString(160).optional(),
    resourceSystemId: boundedString(160).optional(),
    eventScheduleId: boundedString(160).optional(),
    delayQueueId: boundedString(160).optional(),
    feedbackLoopModelId: boundedString(160).optional(),
    scaleModelId: boundedString(160).optional(),
    scaleViewStateId: boundedString(160).optional(),
    boundaryModelId: boundedString(160).optional(),
    fieldLayerId: boundedString(160).optional(),
    observabilityModelId: boundedString(160).optional(),
    causalAssumptionModelId: boundedString(160).optional(),
    quantitySemanticsModelId: boundedString(160).optional(),
    emergencePatternModelId: boundedString(160).optional(),
    robustnessResilienceModelId: boundedString(160).optional(),
    controlStrategyModelId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const entityTypeSchema: z.ZodType<EntityTypeDeclaration> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    entityKind: z.enum(modelEntityKinds),
    description: optionalDescription,
    componentTypeIds: stringIdArraySchema.optional(),
    attributeTypeIds: stringIdArraySchema.optional(),
    spaceIds: stringIdArraySchema.optional(),
    relationTypeIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const componentTypeSchema: z.ZodType<ComponentTypeDeclaration> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    componentKind: z.enum(modelComponentKinds),
    attributeTypeIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const attributeTypeSchema: z.ZodType<AttributeTypeDeclaration> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    valueKind: z.enum(modelValueKinds),
    defaultValueDescription: z.string().max(800).optional(),
    allowedValues: z.array(jsonValueSchema).min(1).max(256).optional(),
    quantityId: boundedString(160).optional(),
    unitId: boundedString(160).optional(),
    dimensionId: boundedString(160).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const spaceSchema: z.ZodType<SpaceDeclaration> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    spaceKind: z.enum(modelSpaceKinds),
    boundaryModelId: boundedString(160).optional(),
    fieldLayerId: boundedString(160).optional(),
    networkDefinitionId: boundedString(160).optional(),
    scaleModelId: boundedString(160).optional(),
    coordinateDescription: z.string().max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const parameterSchema: z.ZodType<ParameterDeclaration> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    valueKind: z.enum(modelParameterValueKinds),
    defaultValueDescription: z.string().max(800).optional(),
    rangeDescription: z.string().max(800).optional(),
    quantityId: boundedString(160).optional(),
    unitId: boundedString(160).optional(),
    uncertaintyVariableId: boundedString(160).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const metricSchema: z.ZodType<MetricDeclaration> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    metricKind: z.enum(modelMetricKinds),
    quantityId: boundedString(160).optional(),
    unitId: boundedString(160).optional(),
    sourceDescription: z.string().max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const ruleDeclarationSchema: z.ZodType<RuleDeclaration> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    ruleKind: z.enum(modelRuleKinds),
    sourceEntityTypeIds: stringIdArraySchema.optional(),
    targetEntityTypeIds: stringIdArraySchema.optional(),
    parameterIds: stringIdArraySchema.optional(),
    metricIds: stringIdArraySchema.optional(),
    referencedArtifactIds: stringIdArraySchema.optional(),
    ruleDescription: z.string().min(1).max(2_000),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const artifactReferenceSchema: z.ZodType<ModelArtifactReference> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    artifactType: boundedString(180),
    artifactId: boundedString(240),
    primitiveId: z.enum(primitiveIds).optional(),
    role: z.enum(modelArtifactReferenceRoles),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const modelSchemaDefinitionSchema: z.ZodType<ModelSchemaDefinition> = z
  .object({
    artifactType: z.literal(modelSchemaArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    schemaVersion: z.literal("1"),
    scope: scopeSchema.optional(),
    entityTypes: z.array(entityTypeSchema).min(1).max(maxModelSchemaDeclarations),
    componentTypes: z.array(componentTypeSchema).max(maxModelSchemaDeclarations).optional(),
    attributeTypes: z.array(attributeTypeSchema).max(maxModelSchemaDeclarations).optional(),
    spaces: z.array(spaceSchema).max(maxModelSchemaDeclarations).optional(),
    parameters: z.array(parameterSchema).max(maxModelSchemaDeclarations).optional(),
    metrics: z.array(metricSchema).max(maxModelSchemaDeclarations).optional(),
    ruleDeclarations: z.array(ruleDeclarationSchema).max(maxModelSchemaDeclarations).optional(),
    artifactReferences: z.array(artifactReferenceSchema).max(maxModelSchemaArtifactReferences).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxModelSchemaNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxModelSchemaNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxModelSchemaNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenModelSchemaKeys = new Set([
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
  "bytecode",
  "ast",
  "parser",
  "interpreter",
  "compiler",
  "transpiler",
  "codegen",
  "generatedCode",
  "runtime",
  "runtimeHooks",
  "execute",
  "executor",
  "stepFunction",
  "tickFunction",
  "behaviorFunction",
  "ruleFunction",
  "simulationLoop",
  "visualBuilderState",
  "nodeGraph",
  "blockProgram",
  "externalFrameworkImport",
  "externalFrameworkExport",
  "frameworkAdapter",
  "netlogoCode",
  "netlogoImport",
  "netlogoExport",
  "mesaModel",
  "mesaImport",
  "mesaExport",
  "masonModel",
  "masonImport",
  "masonExport",
  "optimizer",
  "controller",
  "policyEngine",
  "reinforcementLearning",
  "modelPredictiveControl",
  "calibration",
  "likelihood",
  "inference",
  "dataset",
  "observedData",
  "timeSeries",
  "rawData",
  "dataFrame",
  "csv",
  "table",
  "proof",
  "certification",
  "riskScore",
  "safetyScore",
  "llm",
  "largeLanguageModel",
  "embedding",
  "embeddings",
  "modelWeights",
  "trainingData",
  "promptTemplate",
  "agentBiography",
  "freeTextMemory",
  "realPersonProfile",
  "protectedAttributeInference",
  "function",
  "class",
  "prototype",
  "constructor",
  "__proto__"
]);

const allowedTopLevelModelSchemaKeys = new Set([
  "artifactType",
  "id",
  "name",
  "description",
  "version",
  "schemaVersion",
  "scope",
  "entityTypes",
  "componentTypes",
  "attributeTypes",
  "spaces",
  "parameters",
  "metrics",
  "ruleDeclarations",
  "artifactReferences",
  "assumptionNotes",
  "limitationNotes",
  "validationNotes",
  "metadata"
]);

export function validateModelSchemaDefinition(value: unknown): ModelSchemaDefinition {
  assertPlainModelSchemaJson(value, "Model schema");
  const parsed = modelSchemaDefinitionSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid model schema: ${formatZodIssue(parsed.error)}`);
  }
  const schema = normalizeModelSchemaDefinition(parsed.data);
  assertModelSchemaJsonBound(schema, maxModelSchemaJsonLength, "Model schema");
  validateNotes(schema);
  validateMetadataBounds(schema);
  validateUniqueIds("entity type", schema.entityTypes);
  validateUniqueIds("component type", schema.componentTypes ?? []);
  validateUniqueIds("attribute type", schema.attributeTypes ?? []);
  validateUniqueIds("space", schema.spaces ?? []);
  validateUniqueIds("parameter", schema.parameters ?? []);
  validateUniqueIds("metric", schema.metrics ?? []);
  validateUniqueIds("rule declaration", schema.ruleDeclarations ?? []);
  validateUniqueIds("artifact reference", schema.artifactReferences ?? []);
  validateReferences(schema);
  return schema;
}

export function parseModelSchemaJson(json: string | unknown): ModelSchemaDefinition {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxModelSchemaJsonLength) {
      throw new SimulationSerializationError(`Model schema JSON must be ${maxModelSchemaJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid model schema JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== modelSchemaArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${modelSchemaArtifactType}`);
  }
  return validateModelSchemaDefinition(raw);
}

export function normalizeModelSchemaDefinition(schema: ModelSchemaDefinition): ModelSchemaDefinition {
  return {
    ...schema,
    ...(schema.scope ? { scope: cloneRecord(schema.scope) } : {}),
    entityTypes: schema.entityTypes.map((entity) => cloneRecord(entity)),
    ...(schema.componentTypes ? { componentTypes: schema.componentTypes.map((component) => cloneRecord(component)) } : {}),
    ...(schema.attributeTypes ? { attributeTypes: schema.attributeTypes.map((attribute) => cloneRecord(attribute)) } : {}),
    ...(schema.spaces ? { spaces: schema.spaces.map((space) => cloneRecord(space)) } : {}),
    ...(schema.parameters ? { parameters: schema.parameters.map((parameter) => cloneRecord(parameter)) } : {}),
    ...(schema.metrics ? { metrics: schema.metrics.map((metric) => cloneRecord(metric)) } : {}),
    ...(schema.ruleDeclarations ? { ruleDeclarations: schema.ruleDeclarations.map((rule) => cloneRecord(rule)) } : {}),
    ...(schema.artifactReferences ? { artifactReferences: schema.artifactReferences.map((reference) => cloneRecord(reference)) } : {}),
    ...(schema.assumptionNotes ? { assumptionNotes: validateAssumptionItems("model schema assumption notes", schema.assumptionNotes) } : {}),
    ...(schema.limitationNotes ? { limitationNotes: validateAssumptionItems("model schema limitation notes", schema.limitationNotes) } : {}),
    ...(schema.validationNotes ? { validationNotes: validateAssumptionItems("model schema validation notes", schema.validationNotes) } : {}),
    ...(schema.metadata ? { metadata: cloneRecord(schema.metadata) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(schema: ModelSchemaDefinition): void {
  const componentIds = new Set((schema.componentTypes ?? []).map((component) => component.id));
  const attributeIds = new Set((schema.attributeTypes ?? []).map((attribute) => attribute.id));
  const spaceIds = new Set((schema.spaces ?? []).map((space) => space.id));
  const entityIds = new Set(schema.entityTypes.map((entity) => entity.id));
  const parameterIds = new Set((schema.parameters ?? []).map((parameter) => parameter.id));
  const metricIds = new Set((schema.metrics ?? []).map((metric) => metric.id));
  const artifactReferenceIds = new Set((schema.artifactReferences ?? []).map((reference) => reference.id));

  for (const entity of schema.entityTypes) {
    validateReferenceSet(`Entity type ${entity.id}`, "componentTypeId", entity.componentTypeIds ?? [], componentIds);
    validateReferenceSet(`Entity type ${entity.id}`, "attributeTypeId", entity.attributeTypeIds ?? [], attributeIds);
    validateReferenceSet(`Entity type ${entity.id}`, "spaceId", entity.spaceIds ?? [], spaceIds);
  }

  for (const component of schema.componentTypes ?? []) {
    validateReferenceSet(`Component type ${component.id}`, "attributeTypeId", component.attributeTypeIds ?? [], attributeIds);
  }

  for (const rule of schema.ruleDeclarations ?? []) {
    validateReferenceSet(`Rule declaration ${rule.id}`, "sourceEntityTypeId", rule.sourceEntityTypeIds ?? [], entityIds);
    validateReferenceSet(`Rule declaration ${rule.id}`, "targetEntityTypeId", rule.targetEntityTypeIds ?? [], entityIds);
    validateReferenceSet(`Rule declaration ${rule.id}`, "parameterId", rule.parameterIds ?? [], parameterIds);
    validateReferenceSet(`Rule declaration ${rule.id}`, "metricId", rule.metricIds ?? [], metricIds);
    validateReferenceSet(`Rule declaration ${rule.id}`, "referencedArtifactId", rule.referencedArtifactIds ?? [], artifactReferenceIds);
  }
}

function validateReferenceSet(label: string, field: string, ids: readonly string[], knownIds: ReadonlySet<string>): void {
  for (const id of ids) {
    if (!knownIds.has(id)) {
      throw new SimulationValidationError(`${label} references unknown ${field}: ${id}`);
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

function validateNotes(schema: ModelSchemaDefinition): void {
  for (const [section, items] of [
    ["assumptionNotes", schema.assumptionNotes],
    ["limitationNotes", schema.limitationNotes],
    ["validationNotes", schema.validationNotes]
  ] as const) {
    if (items) {
      validateAssumptionItems(`model schema ${section}`, items);
    }
  }
}

function validateMetadataBounds(schema: ModelSchemaDefinition): void {
  const metadataValues: Array<[string, Record<string, JsonValue> | undefined]> = [
    ["model schema metadata", schema.metadata],
    ["scope metadata", schema.scope?.metadata],
    ...schema.entityTypes.map((entity) => [`entity type ${entity.id} metadata`, entity.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(schema.componentTypes ?? []).map((component) => [`component type ${component.id} metadata`, component.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(schema.attributeTypes ?? []).map((attribute) => [`attribute type ${attribute.id} metadata`, attribute.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(schema.spaces ?? []).map((space) => [`space ${space.id} metadata`, space.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(schema.parameters ?? []).map((parameter) => [`parameter ${parameter.id} metadata`, parameter.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(schema.metrics ?? []).map((metric) => [`metric ${metric.id} metadata`, metric.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(schema.ruleDeclarations ?? []).map((rule) => [`rule declaration ${rule.id} metadata`, rule.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ]),
    ...(schema.artifactReferences ?? []).map((reference) => [`artifact reference ${reference.id} metadata`, reference.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ])
  ];
  for (const [label, metadata] of metadataValues) {
    if (metadata) {
      assertModelSchemaJsonBound(metadata, maxModelSchemaMetadataJsonLength, label);
    }
  }
}

export function assertModelSchemaJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainModelSchemaJson(value: unknown, label: string): void {
  const stack: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  while (stack.length > 0) {
    const item = stack.pop();
    const current = item?.value;
    const depth = item?.depth ?? 0;
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
      stack.push(...current.map((child) => ({ value: child, depth: depth + 1 })));
      continue;
    }
    if (!isPlainRecord(current)) {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    for (const [key, child] of Object.entries(current)) {
      if (forbiddenModelSchemaKeys.has(key) && !(depth === 0 && allowedTopLevelModelSchemaKeys.has(key))) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable, formula, compiler, visual-builder, external-framework, optimizer, proof, calibration, dataset, LLM, biography, real-person profiling, or protected-attribute-inference key ${key}`
        );
      }
      stack.push({ value: child, depth: depth + 1 });
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
