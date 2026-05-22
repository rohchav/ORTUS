import type { JsonValue, SimulationLogEvent, SimulationLogEventCategory, SimulationLogEventSeverity } from "./types";
import type { SimulationEngine } from "./SimulationEngine";
import { deepClone } from "./Validation";
import type { World } from "./World";

export const simulationEventLogGlobalKey = "simulationEventLog";
export const maxSimulationEventLogLength = 500;

export interface SimulationLogEventInput {
  type: string;
  source: string;
  tick?: number;
  eventId?: string;
  target?: string;
  label?: string;
  payload?: JsonValue;
  severity?: SimulationLogEventSeverity;
  category?: SimulationLogEventCategory;
}

export function readSimulationEventLogFromGlobals(globals: Record<string, JsonValue>): SimulationLogEvent[] {
  const raw = globals[simulationEventLogGlobalKey];
  if (!Array.isArray(raw)) {
    return [];
  }
  return boundSimulationEventLog((raw as unknown[]).filter(isSimulationLogEvent));
}

export function readSimulationEventLog(engine: Pick<SimulationEngine, "world">): SimulationLogEvent[] {
  return readSimulationEventLogFromGlobals(engine.world.view().globals);
}

export function appendSimulationEventLog(engine: SimulationEngine, input: SimulationLogEventInput): SimulationLogEvent {
  const event = createSimulationLogEvent(engine.world.tick, readSimulationEventLog(engine), input);
  const next = boundSimulationEventLog([...readSimulationEventLog(engine), event]);
  engine.applyCommands(
    [{ type: "setGlobal", key: simulationEventLogGlobalKey, value: next as unknown as JsonValue }],
    { sourceSystemId: "event-log", reason: event.type }
  );
  return event;
}

export function appendSimulationEventLogToWorld(world: World, input: SimulationLogEventInput): SimulationLogEvent {
  const current = readSimulationEventLogFromGlobals(world.globals);
  const event = createSimulationLogEvent(world.tick, current, input);
  world.globals[simulationEventLogGlobalKey] = boundSimulationEventLog([...current, event]) as unknown as JsonValue;
  return event;
}

export function normalizeSimulationEventLogInWorld(world: World): void {
  world.globals[simulationEventLogGlobalKey] = readSimulationEventLogFromGlobals(world.globals) as unknown as JsonValue;
}

export function boundSimulationEventLog(events: readonly SimulationLogEvent[]): SimulationLogEvent[] {
  return events.slice(-maxSimulationEventLogLength).map((event) => deepClone(event));
}

function createSimulationLogEvent(tick: number, current: readonly SimulationLogEvent[], input: SimulationLogEventInput): SimulationLogEvent {
  const order = (current.at(-1)?.order ?? 0) + 1;
  return {
    eventId: input.eventId ?? `event-${tick}-${order}`,
    tick: input.tick ?? tick,
    type: input.type,
    source: input.source,
    order,
    ...(input.target !== undefined ? { target: input.target } : {}),
    ...(input.label !== undefined ? { label: input.label } : {}),
    ...(input.payload !== undefined ? { payload: deepClone(input.payload) } : {}),
    ...(input.severity !== undefined ? { severity: input.severity } : {}),
    ...(input.category !== undefined ? { category: input.category } : {})
  };
}

function isSimulationLogEvent(value: unknown): value is SimulationLogEvent {
  if (!isPlainRecord(value)) {
    return false;
  }
  const candidate = value as Partial<SimulationLogEvent>;
  return (
    typeof candidate.eventId === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.source === "string" &&
    typeof candidate.tick === "number" &&
    Number.isInteger(candidate.tick) &&
    candidate.tick >= 0 &&
    typeof candidate.order === "number" &&
    Number.isInteger(candidate.order) &&
    candidate.order >= 1 &&
    (candidate.target === undefined || typeof candidate.target === "string") &&
    (candidate.label === undefined || typeof candidate.label === "string") &&
    (candidate.payload === undefined || isSerializable(candidate.payload)) &&
    (candidate.severity === undefined || candidate.severity === "info" || candidate.severity === "warning" || candidate.severity === "error") &&
    (candidate.category === undefined ||
      candidate.category === "run" ||
      candidate.category === "scenario" ||
      candidate.category === "snapshot" ||
      candidate.category === "experiment" ||
      candidate.category === "intervention" ||
      candidate.category === "agent" ||
      candidate.category === "system")
  );
}

function isSerializable(value: unknown): value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(isSerializable);
  }
  if (isPlainRecord(value)) {
    return Object.values(value).every(isSerializable);
  }
  return false;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
