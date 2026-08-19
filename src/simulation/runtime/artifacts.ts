import { deserializeScenario, deserializeSnapshot } from "../kernel/Serialization";
import type { ScenarioExport, SnapshotExport } from "../kernel/types";
import { maxRuntimeArtifactJsonLength, type RuntimeArtifactKind } from "./types";

export function parseRuntimeArtifact(kind: "scenario", json: string): ScenarioExport;
export function parseRuntimeArtifact(kind: "snapshot", json: string): SnapshotExport;
export function parseRuntimeArtifact(kind: RuntimeArtifactKind, json: string): ScenarioExport | SnapshotExport;
export function parseRuntimeArtifact(kind: RuntimeArtifactKind, json: string): ScenarioExport | SnapshotExport {
  if (json.length === 0 || json.length > maxRuntimeArtifactJsonLength) {
    throw new Error(`Runtime artifact JSON must contain between 1 and ${maxRuntimeArtifactJsonLength} characters`);
  }
  return kind === "scenario" ? deserializeScenario(json) : deserializeSnapshot(json);
}
