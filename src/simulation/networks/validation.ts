import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import {
  maxNetworkDefinitionJsonLength,
  maxNetworkEdgeCount,
  maxNetworkMetadataJsonLength,
  maxNetworkNodeCount,
  maxNetworkRelationTypeCount,
  maxNetworkSeedLength,
  networkDefinitionArtifactType,
  type NetworkDefinition,
  type NetworkEdge,
  type NetworkOptions,
  type RelationTypeDefinition
} from "./types";

const networkNodeSchema = z
  .object({
    id: z.string().min(1).max(160),
    label: z.string().max(160).optional(),
    type: z.string().max(120).optional(),
    weight: z.number().finite().min(0).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const networkEdgeSchema = z
  .object({
    id: z.string().min(1).max(180).optional(),
    source: z.string().min(1).max(160),
    target: z.string().min(1).max(160),
    directed: z.boolean().optional(),
    weight: z.number().finite().min(0).optional(),
    relationType: z.string().min(1).max(120).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const relationTypeSchema = z
  .object({
    id: z.string().min(1).max(120),
    label: z.string().min(1).max(160),
    description: z.string().max(600).optional(),
    directed: z.boolean().optional(),
    weightRange: z
      .object({
        min: z.number().finite().min(0).optional(),
        max: z.number().finite().min(0).optional()
      })
      .strict()
      .optional(),
    visual: z.record(jsonValueSchema).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const networkDefinitionSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(networkDefinitionArtifactType),
    id: z.string().min(1).max(160),
    label: z.string().min(1).max(180),
    description: z.string().max(1200).optional(),
    directed: z.boolean().optional(),
    allowSelfLoops: z.boolean().optional(),
    nodes: z.array(networkNodeSchema).max(maxNetworkNodeCount),
    edges: z.array(networkEdgeSchema).max(maxNetworkEdgeCount),
    relationTypes: z.array(relationTypeSchema).max(maxNetworkRelationTypeCount).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const networkOptionsSchema = z
  .object({
    mode: z.literal("synthetic").optional(),
    generator: z.enum(["empty", "complete", "randomErdosRenyi", "ring"]),
    nodeCount: z.number().int().min(0).max(maxNetworkNodeCount).optional(),
    edgeProbability: z.number().finite().min(0).max(1).optional(),
    averageDegree: z.number().finite().min(0).optional(),
    directed: z.boolean().optional(),
    weighted: z.boolean().optional(),
    relationType: z.string().min(1).max(120).optional(),
    allowSelfLoops: z.boolean().optional(),
    seed: z.string().min(1).max(maxNetworkSeedLength).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenNetworkKeys = new Set([
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

export function validateNetworkDefinition(value: unknown): NetworkDefinition {
  assertPlainJsonValue(value, "Network definition");
  const parsed = networkDefinitionSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid network definition: ${formatZodIssue(parsed.error)}`);
  }
  const network = normalizeNetworkDefinition(parsed.data);
  assertJsonBound(network, maxNetworkDefinitionJsonLength, "Network definition");
  assertMetadataBounds(network);
  assertValidNetworkTopology(network);
  return network;
}

export function validateNetworkOptions(value: unknown): NetworkOptions {
  assertPlainJsonValue(value, "Network options");
  const parsed = networkOptionsSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid network options: ${formatZodIssue(parsed.error)}`);
  }
  const options = parsed.data;
  assertJsonBound(options, maxNetworkMetadataJsonLength, "Network options");
  const nodeCount = options.nodeCount ?? 0;
  if (options.generator === "ring" && nodeCount > 0 && nodeCount < 3) {
    throw new SimulationValidationError("Ring network generator requires nodeCount 0 or at least 3");
  }
  if (options.averageDegree !== undefined && options.averageDegree > Math.max(0, nodeCount - 1)) {
    throw new SimulationValidationError("Network averageDegree cannot exceed nodeCount - 1");
  }
  if (options.generator === "randomErdosRenyi" && options.edgeProbability === undefined) {
    throw new SimulationValidationError("randomErdosRenyi network generator requires edgeProbability");
  }
  return { ...options, mode: options.mode ?? "synthetic" };
}

export function parseNetworkDefinitionJson(json: string): NetworkDefinition {
  if (json.length > maxNetworkDefinitionJsonLength) {
    throw new SimulationSerializationError(`Network definition JSON must be ${maxNetworkDefinitionJsonLength} characters or less`);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid network definition JSON", { cause: error });
  }
  return validateNetworkDefinition(raw);
}

function normalizeNetworkDefinition(network: NetworkDefinition): NetworkDefinition {
  const relationTypes = (network.relationTypes ?? []).map((relationType) => ({
    ...relationType,
    directed: relationType.directed ?? false
  }));
  const relationTypeById = new Map(relationTypes.map((relationType) => [relationType.id, relationType]));
  const directed = network.directed ?? false;
  return {
    ...network,
    directed,
    allowSelfLoops: network.allowSelfLoops ?? false,
    relationTypes,
    nodes: network.nodes.map((node) => ({ ...node })),
    edges: network.edges.map((edge) => ({
      ...edge,
      directed: edge.directed ?? relationTypeById.get(edge.relationType ?? "")?.directed ?? directed
    })),
    metadata: network.metadata ?? {}
  };
}

function assertValidNetworkTopology(network: NetworkDefinition): void {
  const nodeIds = new Set<string>();
  for (const node of network.nodes) {
    if (nodeIds.has(node.id)) {
      throw new SimulationValidationError(`Duplicate network node id: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  const relationIds = new Set<string>();
  for (const relationType of network.relationTypes ?? []) {
    if (relationIds.has(relationType.id)) {
      throw new SimulationValidationError(`Duplicate relation type id: ${relationType.id}`);
    }
    if (
      relationType.weightRange?.min !== undefined &&
      relationType.weightRange?.max !== undefined &&
      relationType.weightRange.min > relationType.weightRange.max
    ) {
      throw new SimulationValidationError(`Invalid relation type weight range: ${relationType.id}`);
    }
    relationIds.add(relationType.id);
  }

  const edgeIds = new Set<string>();
  const edgeKeys = new Set<string>();
  for (const edge of network.edges) {
    if (!nodeIds.has(edge.source)) {
      throw new SimulationValidationError(`Network edge source does not exist: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      throw new SimulationValidationError(`Network edge target does not exist: ${edge.target}`);
    }
    if (edge.source === edge.target && !network.allowSelfLoops) {
      throw new SimulationValidationError(`Network self-loop is not allowed: ${edge.source}`);
    }
    if (edge.id) {
      if (edgeIds.has(edge.id)) {
        throw new SimulationValidationError(`Duplicate network edge id: ${edge.id}`);
      }
      edgeIds.add(edge.id);
    }
    if (edge.relationType && !relationIds.has(edge.relationType)) {
      throw new SimulationValidationError(`Unknown network relationType: ${edge.relationType}`);
    }
    const relation = edge.relationType ? findRelationType(network.relationTypes ?? [], edge.relationType) : undefined;
    if (edge.weight !== undefined && relation?.weightRange) {
      if (relation.weightRange.min !== undefined && edge.weight < relation.weightRange.min) {
        throw new SimulationValidationError(`Network edge weight is below relationType range: ${edge.relationType}`);
      }
      if (relation.weightRange.max !== undefined && edge.weight > relation.weightRange.max) {
        throw new SimulationValidationError(`Network edge weight is above relationType range: ${edge.relationType}`);
      }
    }
    const key = edgeIdentityKey(edge);
    if (edgeKeys.has(key)) {
      throw new SimulationValidationError(`Duplicate network edge between ${edge.source} and ${edge.target}`);
    }
    edgeKeys.add(key);
  }
}

function findRelationType(relationTypes: readonly RelationTypeDefinition[], id: string): RelationTypeDefinition | undefined {
  return relationTypes.find((relationType) => relationType.id === id);
}

function edgeIdentityKey(edge: NetworkEdge): string {
  const directed = edge.directed ?? false;
  const relationType = edge.relationType ?? "";
  if (directed) {
    return `d:${edge.source}->${edge.target}:${relationType}`;
  }
  const [left, right] = [edge.source, edge.target].sort((a, b) => a.localeCompare(b));
  return `u:${left}<->${right}:${relationType}`;
}

function assertMetadataBounds(network: NetworkDefinition): void {
  for (const value of [
    network.metadata,
    ...network.nodes.map((node) => node.metadata),
    ...network.edges.map((edge) => edge.metadata),
    ...(network.relationTypes ?? []).map((relationType) => relationType.metadata),
    ...(network.relationTypes ?? []).map((relationType) => relationType.visual)
  ]) {
    if (value !== undefined) {
      assertJsonBound(value, maxNetworkMetadataJsonLength, "Network metadata");
    }
  }
}

function assertJsonBound(value: unknown, maxLength: number, label: string): void {
  if (JSON.stringify(value).length > maxLength) {
    throw new SimulationValidationError(`${label} JSON must be ${maxLength} characters or less`);
  }
}

export function assertPlainJsonValue(value: unknown, label: string): void {
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
        if (forbiddenNetworkKeys.has(key)) {
          throw new SimulationValidationError(`${current.path} must not embed live run state (${key})`);
        }
        stack.push({ value: child, path: `${current.path}.${key}` });
      }
      continue;
    }
    throw new SimulationValidationError(`${current.path} must contain only plain JSON values`);
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
