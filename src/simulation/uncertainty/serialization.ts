import { SimulationSerializationError } from "../kernel/Errors";
import { assertSerializableValue } from "../kernel/Validation";
import type { SimulationRunConfig } from "../kernel/types";
import {
  maxUncertaintyResultJsonLength,
  uncertaintyResultArtifactType,
  type UncertaintyConfig,
  type UncertaintyResultSet
} from "./types";
import { deserializeUncertaintyConfig, serializeUncertaintyConfig } from "./validation";

export { deserializeUncertaintyConfig, serializeUncertaintyConfig };

export function serializeUncertaintyResult(result: UncertaintyResultSet): string {
  assertSerializableValue(result as unknown as Record<string, unknown>, "uncertainty result");
  assertNoLiveState(result);
  const json = JSON.stringify(result, null, 2);
  assertResultJsonBounds(json);
  return json;
}

export function deserializeUncertaintyResult(json: string): UncertaintyResultSet {
  assertResultJsonBounds(json);
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid uncertainty result JSON", { cause: error });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SimulationSerializationError("Invalid uncertainty result");
  }
  assertAllowedTopLevelKeys(raw as Record<string, unknown>);
  const value = raw as Partial<UncertaintyResultSet>;
  if (value.schemaVersion !== "1" || value.artifactType !== uncertaintyResultArtifactType) {
    throw new SimulationSerializationError("Invalid uncertainty result artifact");
  }
  const generatedRunCount = value.generatedRunCount;
  if (typeof generatedRunCount !== "number" || !Number.isInteger(generatedRunCount) || generatedRunCount < 0) {
    throw new SimulationSerializationError("Invalid uncertainty result run count");
  }
  if (!Array.isArray(value.runs) || value.runs.length !== generatedRunCount) {
    throw new SimulationSerializationError("Invalid uncertainty result runs");
  }
  if (!value.config || typeof value.config !== "object" || !value.baseRunConfig || typeof value.baseRunConfig !== "object") {
    throw new SimulationSerializationError("Invalid uncertainty result provenance");
  }
  assertSerializableValue(value as Record<string, unknown>, "uncertainty result");
  assertNoLiveState(value);
  return value as UncertaintyResultSet;
}

export function uncertaintyConfigFromJson(json: string, baseRunConfig: SimulationRunConfig): UncertaintyConfig {
  return deserializeUncertaintyConfig(json, baseRunConfig);
}

const forbiddenResultKeys = new Set([
  "snapshot",
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
  "snapshots",
  "runState"
]);

const allowedResultTopLevelKeys = new Set([
  "schemaVersion",
  "artifactType",
  "config",
  "baseRunConfig",
  "generatedRunCount",
  "ticksPerRun",
  "runs",
  "metricSummaries",
  "warnings",
  "status"
]);

function assertAllowedTopLevelKeys(value: Record<string, unknown>): void {
  for (const key of Object.keys(value)) {
    if (!allowedResultTopLevelKeys.has(key)) {
      throw new SimulationSerializationError(`Invalid uncertainty result field: ${key}`);
    }
  }
}

function assertResultJsonBounds(json: string): void {
  if (json.length > maxUncertaintyResultJsonLength) {
    throw new SimulationSerializationError(`Uncertainty result JSON must be ${maxUncertaintyResultJsonLength} characters or less`);
  }
}

function assertNoLiveState(value: unknown): void {
  const stack: unknown[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") {
      continue;
    }
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }
    for (const [key, child] of Object.entries(current)) {
      if (forbiddenResultKeys.has(key)) {
        throw new SimulationSerializationError(`Uncertainty result must not embed live run state (${key})`);
      }
      stack.push(child);
    }
  }
}
