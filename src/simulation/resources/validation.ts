import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import {
  maxFlowCount,
  maxResourceCount,
  maxResourceLedgerLength,
  maxResourceMetadataJsonLength,
  maxResourceSystemJsonLength,
  maxStockCount,
  resourceSystemArtifactType,
  type FlowDefinition,
  type ResourceDefinition,
  type ResourceSystemDefinition,
  type ResourceSystemState,
  type StockDefinition,
  type StockState
} from "./types";

const resourceDefinitionSchema = z
  .object({
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1_200).optional(),
    unit: z.string().min(1).max(80).optional(),
    kind: z.enum(["material", "energy", "information", "capacity", "abstract"]).optional(),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    allowNegative: z.boolean().optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const stockDefinitionSchema = z
  .object({
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1_200).optional(),
    resourceId: z.string().min(1).max(160),
    ownerType: z.enum(["system", "agent", "group", "region", "environment"]).optional(),
    ownerId: z.string().min(1).max(160).optional(),
    initialValue: z.number().finite(),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    capacity: z.number().finite().min(0).optional(),
    allowNegative: z.boolean().optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const flowDefinitionSchema = z
  .object({
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1_200).optional(),
    resourceId: z.string().min(1).max(160),
    sourceStockId: z.string().min(1).max(160).optional(),
    targetStockId: z.string().min(1).max(160).optional(),
    flowType: z.enum(["produce", "consume", "transfer", "regenerate", "decay", "deplete"]),
    rate: z.number().finite().min(0),
    min: z.number().finite().min(0).optional(),
    max: z.number().finite().min(0).optional(),
    enabled: z.boolean().optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const stockStateSchema = z
  .object({
    stockId: z.string().min(1).max(160),
    value: z.number().finite(),
    capacity: z.number().finite().min(0).optional(),
    updatedAtTick: z.number().int().min(0).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const flowResultSchema = z
  .object({
    flowId: z.string().min(1).max(160),
    resourceId: z.string().min(1).max(160),
    tick: z.number().int().min(0),
    requestedAmount: z.number().finite().min(0),
    appliedAmount: z.number().finite().min(0),
    sourceStockId: z.string().min(1).max(160).optional(),
    targetStockId: z.string().min(1).max(160).optional(),
    reason: z.string().max(240).optional(),
    warnings: z.array(z.string().max(240)).optional()
  })
  .strict();

const resourceSystemDefinitionSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(resourceSystemArtifactType),
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1_200).optional(),
    resources: z.array(resourceDefinitionSchema).max(maxResourceCount),
    stocks: z.array(stockDefinitionSchema).max(maxStockCount),
    flows: z.array(flowDefinitionSchema).max(maxFlowCount),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const resourceSystemStateSchema = resourceSystemDefinitionSchema
  .extend({
    stockStates: z.array(stockStateSchema).max(maxStockCount),
    ledger: z.array(flowResultSchema).max(maxResourceLedgerLength).optional()
  })
  .strict();

const forbiddenResourceKeys = new Set([
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
  "template",
  "activeEngine",
  "runState",
  "runSummary",
  "runSummaries"
]);

export function validateResourceSystemDefinition(value: unknown): ResourceSystemDefinition {
  assertPlainResourceJson(value, "Resource system");
  const parsed = resourceSystemDefinitionSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid resource system: ${formatZodIssue(parsed.error)}`);
  }
  const definition = normalizeResourceSystemDefinition(parsed.data);
  assertJsonBound(definition, maxResourceSystemJsonLength, "Resource system");
  assertMetadataBounds(definition);
  assertValidResourceDefinitions(definition);
  return definition;
}

export function validateResourceSystemState(value: unknown): ResourceSystemState {
  assertPlainResourceJson(value, "Resource system state");
  const parsed = resourceSystemStateSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid resource system state: ${formatZodIssue(parsed.error)}`);
  }
  const state = normalizeResourceSystemState(parsed.data);
  assertJsonBound(state, maxResourceSystemJsonLength, "Resource system state");
  assertMetadataBounds(state);
  assertValidResourceDefinitions(state);
  assertValidStockStates(state);
  return state;
}

export function parseResourceSystemJson(json: string): ResourceSystemState {
  if (json.length > maxResourceSystemJsonLength) {
    throw new SimulationSerializationError(`Resource system JSON must be ${maxResourceSystemJsonLength} characters or less`);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid resource system JSON", { cause: error });
  }
  return validateResourceSystemState(raw);
}

export function normalizeResourceSystemDefinition(definition: ResourceSystemDefinition): ResourceSystemDefinition {
  return {
    ...definition,
    resources: definition.resources.map((resource) => ({
      ...resource,
      kind: resource.kind ?? "material",
      allowNegative: resource.allowNegative ?? false,
      metadata: resource.metadata ?? {}
    })),
    stocks: definition.stocks.map((stock) => ({
      ...stock,
      ownerType: stock.ownerType ?? "system",
      allowNegative: stock.allowNegative ?? resourceById(definition.resources, stock.resourceId)?.allowNegative ?? false,
      metadata: stock.metadata ?? {}
    })),
    flows: definition.flows.map((flow) => ({
      ...flow,
      enabled: flow.enabled ?? true,
      metadata: flow.metadata ?? {}
    })),
    metadata: definition.metadata ?? {}
  };
}

export function normalizeResourceSystemState(state: ResourceSystemState): ResourceSystemState {
  const definition = normalizeResourceSystemDefinition(state);
  return {
    ...definition,
    stockStates: state.stockStates.map((stockState) => ({ ...stockState, metadata: stockState.metadata ?? {} })),
    ledger: (state.ledger ?? []).map((entry) => ({ ...entry, warnings: entry.warnings ?? [] }))
  };
}

export function assertPlainResourceJson(value: unknown, label: string): void {
  const stack: Array<{ value: unknown; path: string }> = [{ value, path: label }];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const item = current.value;
    if (item === null || typeof item === "string" || typeof item === "boolean") {
      continue;
    }
    if (typeof item === "number") {
      if (!Number.isFinite(item)) {
        throw new SimulationValidationError(`${current.path} must not contain non-finite numbers`);
      }
      continue;
    }
    if (Array.isArray(item)) {
      item.forEach((child, index) => stack.push({ value: child, path: `${current.path}[${index}]` }));
      continue;
    }
    if (typeof item === "object" && item !== null) {
      const prototype = Object.getPrototypeOf(item);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new SimulationValidationError(`${current.path} must contain only plain JSON objects`);
      }
      for (const [key, child] of Object.entries(item as Record<string, unknown>)) {
        if (forbiddenResourceKeys.has(key)) {
          throw new SimulationValidationError(`${current.path} must not embed live run state (${key})`);
        }
        stack.push({ value: child, path: `${current.path}.${key}` });
      }
      continue;
    }
    throw new SimulationValidationError(`${current.path} must contain only plain JSON values`);
  }
}

export function resourceById(resources: readonly ResourceDefinition[], resourceId: string): ResourceDefinition | undefined {
  return resources.find((resource) => resource.id === resourceId);
}

export function stockById(stocks: readonly StockDefinition[], stockId: string): StockDefinition | undefined {
  return stocks.find((stock) => stock.id === stockId);
}

export function resourceLowerBound(resource: ResourceDefinition, stock?: StockDefinition): number | undefined {
  if (stock?.min !== undefined) {
    return stock.min;
  }
  if (resource.min !== undefined) {
    return resource.min;
  }
  const allowNegative = stock?.allowNegative ?? resource.allowNegative ?? false;
  return allowNegative ? undefined : 0;
}

export function stockUpperBound(resource: ResourceDefinition, stock: StockDefinition, state?: StockState): number | undefined {
  const bounds = [resource.max, stock.max, stock.capacity, state?.capacity].filter((value): value is number => typeof value === "number");
  return bounds.length > 0 ? Math.min(...bounds) : undefined;
}

function assertValidResourceDefinitions(definition: ResourceSystemDefinition): void {
  const resourceIds = new Set<string>();
  for (const resource of definition.resources) {
    if (resourceIds.has(resource.id)) {
      throw new SimulationValidationError(`Duplicate resource id: ${resource.id}`);
    }
    if (resource.min !== undefined && resource.max !== undefined && resource.max < resource.min) {
      throw new SimulationValidationError(`Resource max must be greater than or equal to min: ${resource.id}`);
    }
    if (!(resource.allowNegative ?? false) && resource.min !== undefined && resource.min < 0) {
      throw new SimulationValidationError(`Resource min cannot be negative unless allowNegative is true: ${resource.id}`);
    }
    resourceIds.add(resource.id);
  }

  const stockIds = new Set<string>();
  for (const stock of definition.stocks) {
    if (stockIds.has(stock.id)) {
      throw new SimulationValidationError(`Duplicate stock id: ${stock.id}`);
    }
    const resource = resourceById(definition.resources, stock.resourceId);
    if (!resource) {
      throw new SimulationValidationError(`Unknown stock resourceId: ${stock.resourceId}`);
    }
    assertStockBounds(resource, stock, stock.initialValue, stock.capacity);
    stockIds.add(stock.id);
  }

  const flowIds = new Set<string>();
  for (const flow of definition.flows) {
    if (flowIds.has(flow.id)) {
      throw new SimulationValidationError(`Duplicate flow id: ${flow.id}`);
    }
    assertValidFlow(definition, resourceIds, stockIds, flow);
    flowIds.add(flow.id);
  }
}

function assertValidFlow(
  definition: ResourceSystemDefinition,
  resourceIds: ReadonlySet<string>,
  stockIds: ReadonlySet<string>,
  flow: FlowDefinition
): void {
  if (!resourceIds.has(flow.resourceId)) {
    throw new SimulationValidationError(`Unknown flow resourceId: ${flow.resourceId}`);
  }
  if (flow.min !== undefined && flow.max !== undefined && flow.max < flow.min) {
    throw new SimulationValidationError(`Flow max must be greater than or equal to min: ${flow.id}`);
  }
  if (flow.sourceStockId && !stockIds.has(flow.sourceStockId)) {
    throw new SimulationValidationError(`Unknown sourceStockId: ${flow.sourceStockId}`);
  }
  if (flow.targetStockId && !stockIds.has(flow.targetStockId)) {
    throw new SimulationValidationError(`Unknown targetStockId: ${flow.targetStockId}`);
  }

  const source = flow.sourceStockId ? stockById(definition.stocks, flow.sourceStockId) : undefined;
  const target = flow.targetStockId ? stockById(definition.stocks, flow.targetStockId) : undefined;
  if (source && source.resourceId !== flow.resourceId) {
    throw new SimulationValidationError(`Flow source stock resource mismatch: ${flow.id}`);
  }
  if (target && target.resourceId !== flow.resourceId) {
    throw new SimulationValidationError(`Flow target stock resource mismatch: ${flow.id}`);
  }

  if ((flow.flowType === "consume" || flow.flowType === "decay" || flow.flowType === "deplete") && !source) {
    throw new SimulationValidationError(`Flow requires sourceStockId: ${flow.id}`);
  }
  if ((flow.flowType === "produce" || flow.flowType === "regenerate") && !target) {
    throw new SimulationValidationError(`Flow requires targetStockId: ${flow.id}`);
  }
  if (flow.flowType === "transfer" && (!source || !target)) {
    throw new SimulationValidationError(`Transfer flow requires sourceStockId and targetStockId: ${flow.id}`);
  }
}

function assertValidStockStates(state: ResourceSystemState): void {
  const seen = new Set<string>();
  const stockIds = new Set(state.stocks.map((stock) => stock.id));
  for (const stockState of state.stockStates) {
    if (seen.has(stockState.stockId)) {
      throw new SimulationValidationError(`Duplicate stock state id: ${stockState.stockId}`);
    }
    const stock = stockById(state.stocks, stockState.stockId);
    if (!stock) {
      throw new SimulationValidationError(`Unknown stock state stockId: ${stockState.stockId}`);
    }
    const resource = resourceById(state.resources, stock.resourceId);
    if (!resource) {
      throw new SimulationValidationError(`Unknown stock state resourceId: ${stock.resourceId}`);
    }
    assertStockBounds(resource, stock, stockState.value, stockState.capacity);
    seen.add(stockState.stockId);
  }
  for (const stockId of stockIds) {
    if (!seen.has(stockId)) {
      throw new SimulationValidationError(`Missing stock state for stock: ${stockId}`);
    }
  }
}

function assertStockBounds(resource: ResourceDefinition, stock: StockDefinition, value: number, stateCapacity?: number): void {
  if (stock.min !== undefined && stock.max !== undefined && stock.max < stock.min) {
    throw new SimulationValidationError(`Stock max must be greater than or equal to min: ${stock.id}`);
  }
  const allowNegative = stock.allowNegative ?? resource.allowNegative ?? false;
  if (!allowNegative && stock.min !== undefined && stock.min < 0) {
    throw new SimulationValidationError(`Stock min cannot be negative unless allowNegative is true: ${stock.id}`);
  }
  if (stock.capacity !== undefined && stock.capacity < 0) {
    throw new SimulationValidationError(`Stock capacity must be non-negative: ${stock.id}`);
  }
  const lower = resourceLowerBound(resource, stock);
  const upper = stockUpperBound(resource, stock, stateCapacity !== undefined ? { stockId: stock.id, value, capacity: stateCapacity } : undefined);
  if (lower !== undefined && upper !== undefined && upper < lower) {
    throw new SimulationValidationError(`Stock upper bound must be greater than or equal to lower bound: ${stock.id}`);
  }
  if (lower !== undefined && value < lower) {
    throw new SimulationValidationError(`Stock value is below minimum: ${stock.id}`);
  }
  if (upper !== undefined && value > upper) {
    throw new SimulationValidationError(`Stock value is above maximum or capacity: ${stock.id}`);
  }
}

function assertMetadataBounds(definition: ResourceSystemDefinition | ResourceSystemState): void {
  const values = [
    definition.metadata,
    ...definition.resources.map((resource) => resource.metadata),
    ...definition.stocks.map((stock) => stock.metadata),
    ...definition.flows.map((flow) => flow.metadata),
    ...("stockStates" in definition ? definition.stockStates.map((stockState) => stockState.metadata) : [])
  ];
  for (const value of values) {
    if (value !== undefined) {
      assertJsonBound(value, maxResourceMetadataJsonLength, "Resource metadata");
    }
  }
}

function assertJsonBound(value: unknown, maxLength: number, label: string): void {
  if (JSON.stringify(value).length > maxLength) {
    throw new SimulationValidationError(`${label} JSON must be ${maxLength} characters or less`);
  }
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
