import { SimulationSerializationError } from "../kernel/Errors";
import {
  maxResourceSystemJsonLength,
  resourceMetricsArtifactType,
  resourceSystemArtifactType,
  type ResourceMetricsResult,
  type ResourceSystemState
} from "./types";
import { assertPlainResourceJson, validateResourceSystemState } from "./validation";

export function serializeResourceSystem(system: ResourceSystemState): string {
  return JSON.stringify(validateResourceSystemState(system), null, 2);
}

export function deserializeResourceSystem(json: string | unknown): ResourceSystemState {
  const raw = typeof json === "string" ? parseJson(json) : json;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid resource system artifact");
  }
  if ((raw as { artifactType?: unknown }).artifactType !== resourceSystemArtifactType) {
    throw new SimulationSerializationError("Invalid resource system artifact type");
  }
  try {
    return validateResourceSystemState(raw);
  } catch (error) {
    throw new SimulationSerializationError(error instanceof Error ? error.message : "Invalid resource system", { cause: error });
  }
}

export function serializeResourceMetrics(result: ResourceMetricsResult): string {
  validateResourceMetricsResult(result);
  return JSON.stringify(result, null, 2);
}

export function deserializeResourceMetrics(json: string): ResourceMetricsResult {
  const raw = parseJson(json);
  validateResourceMetricsResult(raw);
  return raw as ResourceMetricsResult;
}

const allowedMetricsTopLevelKeys = new Set(["schemaVersion", "artifactType", "systemId", "metrics", "warnings"]);
const allowedMetricsKeys = new Set([
  "resourceCount",
  "stockCount",
  "flowCount",
  "totalStockByResource",
  "minStockValue",
  "maxStockValue",
  "depletedStockCount",
  "overCapacityStockCount",
  "totalFlowAppliedByResource",
  "totalFlowRequestedByResource",
  "netFlowByResource",
  "insufficientStockFlowCount",
  "clampedFlowCount"
]);

function validateResourceMetricsResult(value: unknown): void {
  assertPlainResourceJson(value, "Resource metrics");
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SimulationSerializationError("Invalid resource metrics artifact");
  }
  const raw = value as Partial<ResourceMetricsResult> & Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (!allowedMetricsTopLevelKeys.has(key)) {
      throw new SimulationSerializationError(`Invalid resource metrics field: ${key}`);
    }
  }
  if (raw.schemaVersion !== "1" || raw.artifactType !== resourceMetricsArtifactType) {
    throw new SimulationSerializationError("Invalid resource metrics artifact type");
  }
  if (typeof raw.systemId !== "string" || !raw.metrics || typeof raw.metrics !== "object" || !Array.isArray(raw.warnings)) {
    throw new SimulationSerializationError("Invalid resource metrics payload");
  }
  const metrics = raw.metrics as unknown as Record<string, unknown>;
  for (const key of Object.keys(metrics)) {
    if (!allowedMetricsKeys.has(key)) {
      throw new SimulationSerializationError(`Invalid resource metric: ${key}`);
    }
  }
  for (const key of allowedMetricsKeys) {
    if (!(key in metrics)) {
      throw new SimulationSerializationError(`Missing resource metric: ${key}`);
    }
  }
  assertFiniteMetricValue(metrics);
}

function assertFiniteMetricValue(value: unknown): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SimulationSerializationError("Resource metrics must be finite");
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      assertFiniteMetricValue(item);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      assertFiniteMetricValue(item);
    }
  }
}

function parseJson(json: string): unknown {
  if (json.length > maxResourceSystemJsonLength) {
    throw new SimulationSerializationError(`Resource system JSON must be ${maxResourceSystemJsonLength} characters or less`);
  }
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid resource JSON", { cause: error });
  }
}
