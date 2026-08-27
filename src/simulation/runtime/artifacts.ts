import { deserializeScenario, deserializeSnapshot } from "../kernel/Serialization";
import type { ScenarioExport, SimulationSnapshotView, SnapshotExport } from "../kernel/types";
import { deepClone } from "../kernel/Validation";
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

export function createSnapshotViewFromRuntimeArtifact(artifact: SnapshotExport): SimulationSnapshotView {
  return deepClone({
    schemaVersion: artifact.schemaVersion,
    templateId: artifact.templateId,
    tick: artifact.tick,
    time: artifact.time,
    entities: artifact.world.entities.entities,
    components: artifact.world.components,
    spaces: artifact.world.spaces,
    globals: artifact.world.globals,
    metricsHistory: artifact.metricsHistory
  });
}
