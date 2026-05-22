import type { SimulationEngine } from "../kernel/SimulationEngine";
import type { JsonValue } from "../kernel/types";
import { deepClone } from "../kernel/Validation";
import { maxInterventionHistoryLength, type AppliedInterventionRecord } from "./interventionTypes";

const historyMetadataKey = "interventionHistory";

export function readInterventionHistory(engine: Pick<SimulationEngine, "metadata"> & Partial<Pick<SimulationEngine, "world">>): AppliedInterventionRecord[] {
  const raw = engine.world ? engine.world.view().globals[historyMetadataKey] : engine.metadata[historyMetadataKey];
  if (!Array.isArray(raw)) {
    return [];
  }
  return (raw as unknown[]).filter(isHistoryRecord).map((record) => deepClone(record));
}

export function appendInterventionHistory(engine: SimulationEngine, record: AppliedInterventionRecord): AppliedInterventionRecord[] {
  const next = boundInterventionHistory([...readInterventionHistory(engine), deepClone(record)]);
  engine.applyCommands(
    [{ type: "setGlobal", key: historyMetadataKey, value: next as unknown as JsonValue }],
    { sourceSystemId: "intervention:history", reason: "record intervention history" }
  );
  return next;
}

export function boundInterventionHistory(records: readonly AppliedInterventionRecord[]): AppliedInterventionRecord[] {
  return records.slice(-maxInterventionHistoryLength).map((record) => deepClone(record));
}

export function clearInterventionHistory(engine: SimulationEngine): void {
  engine.applyCommands(
    [{ type: "setGlobal", key: historyMetadataKey, value: [] }],
    { sourceSystemId: "intervention:history", reason: "clear intervention history" }
  );
}

export function nextInterventionOrder(engine: Pick<SimulationEngine, "metadata"> & Partial<Pick<SimulationEngine, "world">>): number {
  const history = readInterventionHistory(engine);
  return (history.at(-1)?.order ?? 0) + 1;
}

function isHistoryRecord(value: unknown): value is AppliedInterventionRecord {
  if (!isPlainObject(value)) {
    return false;
  }
  const candidate = value as Partial<AppliedInterventionRecord>;
  const tickApplied = candidate.tickApplied;
  const simulationTime = candidate.simulationTime;
  const order = candidate.order;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.templateId === "string" &&
    typeof candidate.interventionId === "string" &&
    typeof candidate.label === "string" &&
    typeof tickApplied === "number" &&
    Number.isInteger(tickApplied) &&
    tickApplied >= 0 &&
    typeof simulationTime === "number" &&
    Number.isFinite(simulationTime) &&
    simulationTime >= 0 &&
    typeof candidate.targetSummary === "string" &&
    isPlainObject(candidate.parameters) &&
    (candidate.status === "applied" || candidate.status === "failed") &&
    typeof order === "number" &&
    Number.isInteger(order) &&
    order >= 1 &&
    (candidate.error === undefined || typeof candidate.error === "string") &&
    (candidate.visualMarker === undefined || isVisualMarker(candidate.visualMarker))
  );
}

function isVisualMarker(value: unknown): value is AppliedInterventionRecord["visualMarker"] {
  if (!isPlainObject(value)) {
    return false;
  }
  const marker = value as unknown as NonNullable<AppliedInterventionRecord["visualMarker"]>;
  if (marker.kind !== "point" && marker.kind !== "gridCell" && marker.kind !== "entity") {
    return false;
  }
  return (
    (marker.x === undefined || Number.isFinite(marker.x)) &&
    (marker.y === undefined || Number.isFinite(marker.y)) &&
    (marker.row === undefined || Number.isInteger(marker.row)) &&
    (marker.col === undefined || Number.isInteger(marker.col)) &&
    (marker.entityId === undefined || typeof marker.entityId === "string") &&
    (marker.radius === undefined || (Number.isFinite(marker.radius) && marker.radius >= 0))
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
