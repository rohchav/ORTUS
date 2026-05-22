import type { ScenarioExport, SimulationSnapshotView, SimulationTemplate, SnapshotExport } from "./types";
import type { MetricsCollector } from "./Metrics";
import type { RandomService } from "./Random";
import type { World } from "./World";
import { deepClone } from "./Validation";

export function createScenarioExport(
  template: SimulationTemplate,
  parameters: ScenarioExport["parameters"],
  seed: string,
  metadata: ScenarioExport["metadata"]
): ScenarioExport {
  return {
    schemaVersion: "1",
    templateId: template.id,
    parameters: deepClone(parameters),
    seed,
    metadata: deepClone(metadata)
  };
}

export function createSnapshotExport(
  template: SimulationTemplate,
  parameters: SnapshotExport["parameters"],
  seed: string,
  metadata: SnapshotExport["metadata"],
  world: World,
  rng: RandomService,
  metrics: MetricsCollector
): SnapshotExport {
  return {
    ...createScenarioExport(template, parameters, seed, metadata),
    tick: world.tick,
    time: world.time,
    world: world.serialize(),
    rng: rng.getState(),
    metricsHistory: metrics.serialize()
  };
}

export function createSnapshotView(
  template: SimulationTemplate,
  world: World,
  metrics: MetricsCollector
): SimulationSnapshotView {
  const serialized = world.serialize();
  return {
    schemaVersion: "1",
    templateId: template.id,
    tick: serialized.tick,
    time: serialized.time,
    entities: serialized.entities.entities,
    components: serialized.components,
    spaces: serialized.spaces,
    globals: serialized.globals,
    metricsHistory: metrics.serialize()
  };
}
