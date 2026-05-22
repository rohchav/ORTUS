import type { ScenarioExport, SnapshotExport } from "./types";
import { parseScenario, parseSnapshot } from "./Validation";

export function serializeScenario(scenario: ScenarioExport): string {
  return JSON.stringify(scenario);
}

export function deserializeScenario(json: string | unknown): ScenarioExport {
  return parseScenario(json);
}

export function serializeSnapshot(snapshot: SnapshotExport): string {
  return JSON.stringify(snapshot);
}

export function deserializeSnapshot(json: string | unknown): SnapshotExport {
  return parseSnapshot(json);
}
