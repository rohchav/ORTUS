import { SimulationSerializationError } from "../kernel/Errors";
import {
  maxNetworkDefinitionJsonLength,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  type NetworkDefinition,
  type NetworkMetricsResult
} from "./types";
import { assertPlainJsonValue, validateNetworkDefinition } from "./validation";

export function serializeNetworkDefinition(network: NetworkDefinition): string {
  return JSON.stringify(validateNetworkDefinition(network), null, 2);
}

export function deserializeNetworkDefinition(json: string | unknown): NetworkDefinition {
  const raw = typeof json === "string" ? parseJson(json) : json;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid network definition artifact");
  }
  if ((raw as { artifactType?: unknown }).artifactType !== networkDefinitionArtifactType) {
    throw new SimulationSerializationError("Invalid network definition artifact type");
  }
  try {
    return validateNetworkDefinition(raw);
  } catch (error) {
    throw new SimulationSerializationError(error instanceof Error ? error.message : "Invalid network definition", { cause: error });
  }
}

export function serializeNetworkMetrics(result: NetworkMetricsResult): string {
  assertPlainJsonValue(result, "Network metrics");
  if (result.schemaVersion !== "1" || result.artifactType !== networkMetricsArtifactType) {
    throw new SimulationSerializationError("Invalid network metrics artifact");
  }
  return JSON.stringify(result, null, 2);
}

export function deserializeNetworkMetrics(json: string): NetworkMetricsResult {
  const raw = parseJson(json);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid network metrics artifact");
  }
  assertPlainJsonValue(raw, "Network metrics");
  assertAllowedMetricsTopLevelKeys(raw as Record<string, unknown>);
  const value = raw as Partial<NetworkMetricsResult>;
  if (value.schemaVersion !== "1" || value.artifactType !== networkMetricsArtifactType) {
    throw new SimulationSerializationError("Invalid network metrics artifact type");
  }
  if (!value.metrics || typeof value.metrics !== "object" || typeof value.networkId !== "string" || !Array.isArray(value.warnings)) {
    throw new SimulationSerializationError("Invalid network metrics payload");
  }
  for (const metric of Object.values(value.metrics)) {
    if (typeof metric !== "number" || !Number.isFinite(metric)) {
      throw new SimulationSerializationError("Network metrics must be finite");
    }
  }
  return value as NetworkMetricsResult;
}

const allowedMetricsTopLevelKeys = new Set(["schemaVersion", "artifactType", "networkId", "metrics", "warnings"]);

function assertAllowedMetricsTopLevelKeys(value: Record<string, unknown>): void {
  for (const key of Object.keys(value)) {
    if (!allowedMetricsTopLevelKeys.has(key)) {
      throw new SimulationSerializationError(`Invalid network metrics field: ${key}`);
    }
  }
}

function parseJson(json: string): unknown {
  if (json.length > maxNetworkDefinitionJsonLength) {
    throw new SimulationSerializationError(`Network definition JSON must be ${maxNetworkDefinitionJsonLength} characters or less`);
  }
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid network JSON", { cause: error });
  }
}
