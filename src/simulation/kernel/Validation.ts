import { z } from "zod";
import {
  type Command,
  type ComponentValue,
  type JsonValue,
  type ParameterDefinition,
  type ParameterValues,
  type ScenarioExport,
  type SimulationEvent,
  type SimulationTemplate,
  type SnapshotExport,
  schedulerPhases
} from "./types";
import { SimulationSerializationError, SimulationTemplateError, SimulationValidationError } from "./Errors";
import { validateAssumptionProfile } from "../assumptions/validation";

const finiteNumberSchema = z.number().finite();

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    finiteNumberSchema,
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema)
  ])
);

export const componentValueSchema: z.ZodType<ComponentValue> = z.record(jsonValueSchema);

const entitySchema = z.object({
  id: z.string().min(1),
  archetype: z.string().min(1),
  alive: z.boolean(),
  createdAtTick: z.number().int().min(0),
  destroyedAtTick: z.number().int().min(0).optional(),
  label: z.string().optional()
});

export const eventSchema: z.ZodType<SimulationEvent> = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  scheduledTick: z.number().int().min(0),
  payload: jsonValueSchema,
  source: z.string().optional(),
  target: z.string().optional(),
  createdAtTick: z.number().int().min(0),
  priority: z.number().finite().optional()
});

const spaceLocationSchema = z.union([
  z.object({ x: finiteNumberSchema, y: finiteNumberSchema }),
  z.object({ row: z.number().int(), col: z.number().int() }),
  z.record(jsonValueSchema)
]);

const commandSchema: z.ZodType<Command> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("createEntity"),
    entityId: z.string().min(1).optional(),
    archetype: z.string().min(1),
    label: z.string().optional(),
    components: z.record(componentValueSchema).optional(),
    spaceLocations: z.record(spaceLocationSchema).optional()
  }),
  z.object({
    type: z.literal("destroyEntity"),
    entityId: z.string().min(1),
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("addComponent"),
    entityId: z.string().min(1),
    componentType: z.string().min(1),
    value: componentValueSchema,
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("setComponent"),
    entityId: z.string().min(1),
    componentType: z.string().min(1),
    value: componentValueSchema,
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("setComponents"),
    componentType: z.string().min(1),
    values: z.record(componentValueSchema),
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("patchComponent"),
    entityId: z.string().min(1),
    componentType: z.string().min(1),
    partial: componentValueSchema,
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("removeComponent"),
    entityId: z.string().min(1),
    componentType: z.string().min(1),
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("moveEntity"),
    spaceId: z.string().min(1),
    entityId: z.string().min(1),
    location: spaceLocationSchema,
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("moveEntities"),
    spaceId: z.string().min(1),
    locations: z.record(spaceLocationSchema),
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("addEdge"),
    spaceId: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    weight: finiteNumberSchema.optional(),
    directed: z.boolean().optional(),
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("removeEdge"),
    spaceId: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    allowMissing: z.boolean().optional()
  }),
  z.object({
    type: z.literal("emitEvent"),
    event: z.object({
      id: z.string().min(1).optional(),
      type: z.string().min(1),
      scheduledTick: z.number().int().min(0),
      payload: jsonValueSchema,
      source: z.string().optional(),
      target: z.string().optional(),
      createdAtTick: z.number().int().min(0),
      priority: finiteNumberSchema.optional()
    })
  }),
  z.object({
    type: z.literal("setGlobal"),
    key: z.string().min(1),
    value: jsonValueSchema
  })
]);

const parameterDefinitionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["number", "integer", "boolean", "select"]),
  defaultValue: jsonValueSchema,
  min: finiteNumberSchema.optional(),
  max: finiteNumberSchema.optional(),
  step: finiteNumberSchema.optional(),
  options: z.array(jsonValueSchema).optional(),
  description: z.string(),
  liveUpdate: z.boolean()
});

const initializationPresetSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  parameterOverrides: z.record(jsonValueSchema).optional(),
  optionDefinitions: z.array(parameterDefinitionSchema).optional()
});

const behaviorModeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  templateId: z.string().min(1).optional(),
  supportedCompositionFields: z.array(z.string().min(1)).optional(),
  supportedParameters: z.array(z.string().min(1)).optional(),
  defaultParameterOverrides: z.record(jsonValueSchema).optional(),
  documentation: z.string().optional(),
  limitations: z.array(z.string()).optional(),
  visualNotes: z.string().optional(),
  metricNotes: z.string().optional()
});

const templateCapabilitiesSchema = z.object({
  supportsScenarioBuilder: z.boolean(),
  supportsInitializationPresets: z.boolean(),
  supportsAgentComposition: z.boolean(),
  supportsBehaviorModes: z.boolean(),
  supportsEnvironmentOptions: z.boolean(),
  supportsInterventions: z.boolean(),
  supportsMetricHistory: z.boolean(),
  supportsRunComparison: z.boolean(),
  supportsExperimentRunner: z.boolean(),
  supportsSnapshotExport: z.boolean(),
  supportsContinuousSpace: z.boolean(),
  supportsGridSpace: z.boolean(),
  supportsNetworkSpace: z.boolean(),
  supportsNetworkOptions: z.boolean(),
  supportsNetworkMetrics: z.boolean(),
  supportsResources: z.boolean(),
  supportsStocks: z.boolean(),
  supportsFlows: z.boolean(),
  supportsResourceMetrics: z.boolean(),
  supportsEvents: z.boolean(),
  supportsDelays: z.boolean(),
  supportsFeedbackLoops: z.boolean(),
  supportsFeedbackMetrics: z.boolean(),
  supportsEnvironmentLayers: z.boolean(),
  supportsUncertaintyConfig: z.boolean()
});

const runtimePerformanceMetadataSchema = z
  .object({
    expectedScaleClass: z.enum(["small", "medium", "large", "unknown"]),
    neighborSearchStrategy: z.enum(["none", "gridLocal", "continuousSpatialHash", "allPairs", "templateSpecific"]),
    hotLoopNotes: z.array(z.string().min(1)).min(1).max(20),
    defaultEntityCount: z.number().int().positive(),
    stressEntityCount: z.number().int().positive(),
    knownPerformanceLimits: z.array(z.string().min(1)).min(1).max(20)
  })
  .superRefine((metadata, ctx) => {
    if (metadata.stressEntityCount < metadata.defaultEntityCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stressEntityCount"],
        message: "stressEntityCount must be >= defaultEntityCount"
      });
    }
  });

const templateSpaceDefinitionSchema = z.object({
  type: z.enum(["continuous2d", "grid2d", "network", "hybrid"]),
  spaceId: z.string().min(1).optional(),
  description: z.string().min(1),
  boundaryMode: z.enum(["wrap", "bounce", "clamp"]).optional(),
  dimensions: z
    .object({
      width: finiteNumberSchema.positive().optional(),
      height: finiteNumberSchema.positive().optional(),
      rows: z.number().int().positive().optional(),
      cols: z.number().int().positive().optional()
    })
    .optional()
});

const entityTypeDefinitionSchema = z.object({
  typeId: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  components: z.array(z.string().min(1)).optional(),
  representedAs: z.enum(["entity", "state", "cell"]).optional(),
  configurableCount: z.boolean().optional(),
  countParameterKey: z.string().min(1).optional(),
  defaultVisual: z
    .object({
      color: z.string().min(1).optional(),
      glyph: z.string().min(1).optional(),
      label: z.string().min(1).optional()
    })
    .optional()
});

const metricDefinitionSchema = z.object({
  id: z.string().min(1).optional(),
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  valueType: z.enum(["number", "integer", "boolean", "category"]),
  unit: z.string().optional(),
  displayUnit: z.string().optional(),
  range: z
    .object({
      min: finiteNumberSchema.optional(),
      max: finiteNumberSchema.optional()
    })
    .optional(),
  supportsHistory: z.boolean().optional(),
  comparableAcrossRuns: z.boolean().optional(),
  source: z.enum(["modelState", "event", "derived", "input"]).optional(),
  precision: z.number().int().min(0).max(12).optional(),
  displayFormat: z.enum(["integer", "decimal", "percent"]).optional(),
  collect: z.function().args(z.any()).returns(z.number())
});

const documentationSchema = z.object({
  purpose: z.string().min(1),
  entities: z.array(z.string()),
  stateVariables: z.array(z.string()),
  processOverview: z.string().min(1),
  scheduling: z.string().min(1),
  designConcepts: z.object({
    emergence: z.string().optional(),
    adaptation: z.string().optional(),
    interaction: z.string().optional(),
    stochasticity: z.string().optional(),
    observation: z.string().optional()
  }),
  initialization: z.string().min(1),
  inputData: z.string().optional(),
  submodels: z.array(z.string()),
  assumptions: z.array(z.string()),
  limitations: z.array(z.string()),
  notRepresented: z.array(z.string()).optional(),
  appropriateUse: z.array(z.string()).optional(),
  inappropriateUse: z.array(z.string()).optional()
});

const continuousSpaceSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("continuous2d"),
  width: finiteNumberSchema.positive(),
  height: finiteNumberSchema.positive(),
  boundaryMode: z.enum(["wrap", "bounce", "clamp"]),
  positions: z.record(z.object({ x: finiteNumberSchema, y: finiteNumberSchema }))
});

const gridSpaceSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("grid2d"),
  rows: z.number().int().positive(),
  cols: z.number().int().positive(),
  boundaryMode: z.enum(["wrap", "bounce", "clamp"]),
  cells: z.record(z.object({ row: z.number().int(), col: z.number().int() }))
});

const networkSpaceSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("network"),
  nodes: z.array(z.string().min(1)),
  edges: z.array(
    z.object({
      source: z.string().min(1),
      target: z.string().min(1),
      weight: finiteNumberSchema.optional(),
      directed: z.boolean()
    })
  )
});

const serializedSpaceSchema = z.discriminatedUnion("kind", [continuousSpaceSchema, gridSpaceSchema, networkSpaceSchema]);

const entityStoreSnapshotSchema = z.object({
  sequence: z.number().int().min(0),
  entities: z.array(entitySchema)
});

const eventQueueSnapshotSchema = z.object({
  sequence: z.number().int().min(0),
  events: z.array(eventSchema)
});

const worldSnapshotSchema = z.object({
  tick: z.number().int().min(0),
  time: finiteNumberSchema.min(0),
  globals: z.record(jsonValueSchema),
  entities: entityStoreSnapshotSchema,
  components: z.record(z.record(componentValueSchema)),
  spaces: z.array(serializedSpaceSchema),
  events: eventQueueSnapshotSchema
});

const metricRecordSchema = z.object({
  tick: z.number().int().min(0),
  time: finiteNumberSchema.min(0),
  values: z.record(finiteNumberSchema)
});

const randomStateSchema = z.object({
  seed: z.string(),
  streams: z.record(
    z.object({
      state: z.number().int().min(0).max(0xffffffff),
      spareNormal: finiteNumberSchema.optional()
    })
  )
});

const scenarioSchemaBase = z.object({
  schemaVersion: z.literal("1"),
  templateId: z.string().min(1),
  parameters: z.record(jsonValueSchema),
  seed: z.string(),
  metadata: z.record(jsonValueSchema)
});

export const scenarioSchema = scenarioSchemaBase;

export const snapshotSchema = scenarioSchemaBase.extend({
  tick: z.number().int().min(0),
  time: finiteNumberSchema.min(0),
  world: worldSnapshotSchema,
  rng: randomStateSchema,
  metricsHistory: z.array(metricRecordSchema)
});

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function assertSerializableValue(value: unknown, label: string): asserts value is JsonValue {
  const issue = serializableIssue(value);
  if (issue) {
    throw new SimulationValidationError(`${label} must be JSON-serializable with finite numbers: ${issue}`);
  }
}

export function assertComponentValue(value: unknown, label = "component"): asserts value is ComponentValue {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SimulationValidationError(`${label} must be a plain serializable component`);
  }
  const issue = serializableIssue(value);
  if (issue) {
    throw new SimulationValidationError(`${label} must be a plain serializable component: ${issue}`);
  }
}

function serializableIssue(value: unknown, path = "value"): string | undefined {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return undefined;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? undefined : `${path} is not finite`;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const issue = serializableIssue(value[index], `${path}[${index}]`);
      if (issue) {
        return issue;
      }
    }
    return undefined;
  }
  if (typeof value === "object" && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      const issue = serializableIssue(item, `${path}.${key}`);
      if (issue) {
        return issue;
      }
    }
    return undefined;
  }
  return `${path} has unsupported type ${typeof value}`;
}

export function validateCommand(command: Command): Command {
  const fast = validateHotCommand(command);
  if (fast) {
    return fast;
  }
  const result = commandSchema.safeParse(command);
  if (!result.success) {
    throw new SimulationValidationError("Invalid command shape", { command, cause: result.error });
  }
  return result.data;
}

function validateHotCommand(command: Command): Command | undefined {
  if (command.type === "setComponents") {
    if (!nonemptyString(command.componentType) || !isPlainRecord(command.values)) {
      throw new SimulationValidationError("Invalid command shape", { command });
    }
    for (const [entityId, value] of Object.entries(command.values)) {
      if (!nonemptyString(entityId)) {
        throw new SimulationValidationError("Invalid command shape", { command });
      }
      assertComponentValue(value, `command component ${command.componentType} on ${entityId}`);
    }
    return command;
  }
  if (command.type === "moveEntities") {
    if (!nonemptyString(command.spaceId) || !isPlainRecord(command.locations)) {
      throw new SimulationValidationError("Invalid command shape", { command });
    }
    for (const [entityId, location] of Object.entries(command.locations)) {
      if (!nonemptyString(entityId) || !isSpaceLocationValue(location)) {
        throw new SimulationValidationError("Invalid command shape", { command });
      }
    }
    return command;
  }
  return undefined;
}

function nonemptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSpaceLocationValue(value: unknown): boolean {
  if (!isPlainRecord(value)) {
    return false;
  }
  const x = value.x;
  const y = value.y;
  if (typeof x === "number" || typeof y === "number") {
    return typeof x === "number" && Number.isFinite(x) && typeof y === "number" && Number.isFinite(y);
  }
  const row = value.row;
  const col = value.col;
  if (typeof row === "number" || typeof col === "number") {
    return Number.isInteger(row) && Number.isInteger(col);
  }
  return serializableIssue(value) === undefined;
}

export function validateEvent(event: SimulationEvent): SimulationEvent {
  const result = eventSchema.safeParse(event);
  if (!result.success) {
    throw new SimulationValidationError("Invalid event", { cause: result.error });
  }
  return result.data;
}

export function validateTemplate(template: SimulationTemplate): void {
  const baseResult = z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      version: z.string().min(1),
      capabilities: templateCapabilitiesSchema.optional(),
      spaceDefinition: templateSpaceDefinitionSchema.optional(),
      entityTypeDefinitions: z.array(entityTypeDefinitionSchema).optional(),
      parameterDefinitions: z.array(parameterDefinitionSchema),
      metricDefinitions: z.array(metricDefinitionSchema).optional(),
      initializationPresets: z.array(initializationPresetSchema).optional(),
      behaviorModes: z.array(behaviorModeSchema).optional(),
      agentCompositionDefinitions: z.array(parameterDefinitionSchema).optional(),
      environmentOptionDefinitions: z.array(parameterDefinitionSchema).optional(),
      runtimeMetadata: runtimePerformanceMetadataSchema.optional(),
      assumptionProfile: z.unknown().optional(),
      documentation: documentationSchema
    })
    .safeParse(template);

  if (!baseResult.success) {
    throw new SimulationTemplateError("Invalid simulation template definition", { cause: baseResult.error });
  }

  const parameterKeys = new Set<string>();
  for (const definition of template.parameterDefinitions) {
    if (parameterKeys.has(definition.key)) {
      throw new SimulationTemplateError(`Duplicate parameter key: ${definition.key}`);
    }
    parameterKeys.add(definition.key);
    validateParameterValue(definition, definition.defaultValue);
  }

  const presetIds = new Set<string>();
  for (const preset of template.initializationPresets ?? []) {
    if (presetIds.has(preset.id)) {
      throw new SimulationTemplateError(`Duplicate initialization preset id: ${preset.id}`);
    }
    presetIds.add(preset.id);
    for (const definition of preset.optionDefinitions ?? []) {
      validateParameterValue(definition, definition.defaultValue);
    }
  }

  const agentCompositionKeys = new Set<string>();
  for (const definition of template.agentCompositionDefinitions ?? []) {
    if (agentCompositionKeys.has(definition.key)) {
      throw new SimulationTemplateError(`Duplicate agent composition key: ${definition.key}`);
    }
    agentCompositionKeys.add(definition.key);
    validateParameterValue(definition, definition.defaultValue);
  }

  const environmentOptionKeys = new Set<string>();
  for (const definition of template.environmentOptionDefinitions ?? []) {
    if (environmentOptionKeys.has(definition.key)) {
      throw new SimulationTemplateError(`Duplicate environment option key: ${definition.key}`);
    }
    environmentOptionKeys.add(definition.key);
    validateParameterValue(definition, definition.defaultValue);
  }

  const behaviorModeIds = new Set<string>();
  for (const behaviorMode of template.behaviorModes ?? []) {
    if (behaviorModeIds.has(behaviorMode.id)) {
      throw new SimulationTemplateError(`Duplicate behavior mode id: ${behaviorMode.id}`);
    }
    if (behaviorMode.templateId && behaviorMode.templateId !== template.id) {
      throw new SimulationTemplateError(`Behavior mode ${behaviorMode.id} references template ${behaviorMode.templateId}, expected ${template.id}`);
    }
    for (const key of behaviorMode.supportedCompositionFields ?? []) {
      if (!agentCompositionKeys.has(key)) {
        throw new SimulationTemplateError(`Behavior mode ${behaviorMode.id} references unknown agent composition field ${key}`);
      }
    }
    for (const key of behaviorMode.supportedParameters ?? []) {
      if (!parameterKeys.has(key)) {
        throw new SimulationTemplateError(`Behavior mode ${behaviorMode.id} references unknown parameter ${key}`);
      }
    }
    if (behaviorMode.defaultParameterOverrides) {
      resolveParameters(template.parameterDefinitions, behaviorMode.defaultParameterOverrides);
    }
    behaviorModeIds.add(behaviorMode.id);
  }

  const entityTypeIds = new Set<string>();
  for (const entityType of template.entityTypeDefinitions ?? []) {
    if (entityTypeIds.has(entityType.typeId)) {
      throw new SimulationTemplateError(`Duplicate entity type id: ${entityType.typeId}`);
    }
    entityTypeIds.add(entityType.typeId);
    if (entityType.countParameterKey && !parameterKeys.has(entityType.countParameterKey)) {
      throw new SimulationTemplateError(`Entity type ${entityType.typeId} references unknown count parameter ${entityType.countParameterKey}`);
    }
  }

  const metricKeys = new Set<string>();
  for (const definition of template.metricDefinitions ?? []) {
    if (metricKeys.has(definition.key)) {
      throw new SimulationTemplateError(`Duplicate metric definition key: ${definition.key}`);
    }
    metricKeys.add(definition.key);
    if (definition.range?.min !== undefined && definition.range?.max !== undefined && definition.range.min > definition.range.max) {
      throw new SimulationTemplateError(`Metric ${definition.key} has an invalid range`);
    }
  }

  if (template.assumptionProfile) {
    try {
      validateAssumptionProfile(template.assumptionProfile);
    } catch (error) {
      throw new SimulationTemplateError(`Invalid assumption profile for template ${template.id}`, { cause: error });
    }
    if (template.assumptionProfile.ownerType !== "template" || template.assumptionProfile.ownerId !== template.id) {
      throw new SimulationTemplateError(`Assumption profile for ${template.id} must be owned by that template`);
    }
  }
}

export function resolveParameters(definitions: readonly ParameterDefinition[], supplied: ParameterValues = {}): ParameterValues {
  const resolved: ParameterValues = {};
  const knownKeys = new Set(definitions.map((definition) => definition.key));

  for (const key of Object.keys(supplied)) {
    if (!knownKeys.has(key)) {
      throw new SimulationValidationError(`Unknown parameter: ${key}`);
    }
  }

  for (const definition of definitions) {
    const value = Object.prototype.hasOwnProperty.call(supplied, definition.key)
      ? supplied[definition.key]
      : definition.defaultValue;
    validateParameterValue(definition, value);
    resolved[definition.key] = deepClone(value as JsonValue);
  }

  return resolved;
}

export function validateParameterValue(definition: ParameterDefinition, value: unknown): void {
  assertSerializableValue(value, `parameter ${definition.key}`);

  if (definition.type === "boolean") {
    if (typeof value !== "boolean") {
      throw new SimulationValidationError(`Parameter ${definition.key} must be boolean`);
    }
    return;
  }

  if (definition.type === "select") {
    if (!definition.options || definition.options.length === 0) {
      throw new SimulationTemplateError(`Select parameter ${definition.key} must define options`);
    }
    if (!definition.options.some((option) => JSON.stringify(option) === JSON.stringify(value))) {
      throw new SimulationValidationError(`Parameter ${definition.key} must be one of its configured options`);
    }
    return;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new SimulationValidationError(`Parameter ${definition.key} must be a finite number`);
  }
  if (definition.type === "integer" && !Number.isInteger(value)) {
    throw new SimulationValidationError(`Parameter ${definition.key} must be an integer`);
  }
  if (definition.min !== undefined && value < definition.min) {
    throw new SimulationValidationError(`Parameter ${definition.key} must be >= ${definition.min}`);
  }
  if (definition.max !== undefined && value > definition.max) {
    throw new SimulationValidationError(`Parameter ${definition.key} must be <= ${definition.max}`);
  }
}

export function parseScenario(json: string | unknown): ScenarioExport {
  return parseWithSchema(json, scenarioSchema, "scenario");
}

export function parseSnapshot(json: string | unknown): SnapshotExport {
  return parseWithSchema(json, snapshotSchema, "snapshot");
}

function parseWithSchema<T>(json: string | unknown, schema: z.ZodType<T>, label: string): T {
  let raw: unknown = json;
  if (typeof json === "string") {
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError(`Invalid ${label} JSON`, { cause: error });
    }
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new SimulationSerializationError(`Invalid ${label} payload`, { cause: result.error });
  }
  return result.data;
}

export function assertPhase(phase: string): asserts phase is (typeof schedulerPhases)[number] {
  if (!schedulerPhases.includes(phase as (typeof schedulerPhases)[number])) {
    throw new SimulationValidationError(`Unknown scheduler phase: ${phase}`);
  }
}
