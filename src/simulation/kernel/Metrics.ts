import type { MetricDefinition, MetricRecord } from "./types";
import type { World } from "./World";
import { SimulationTemplateError, SimulationValidationError } from "./Errors";
import { BoundedHistory } from "./History";
import { deepClone } from "./Validation";

export class MetricsCollector {
  private readonly definitions = new Map<string, MetricDefinition>();
  private readonly history: BoundedHistory<MetricRecord>;

  constructor(
    maxHistoryLength = 1000,
    private readonly interval = 1
  ) {
    this.history = new BoundedHistory<MetricRecord>(maxHistoryLength);
    if (!Number.isInteger(interval) || interval <= 0) {
      throw new SimulationValidationError("Metrics interval must be a positive integer");
    }
  }

  register(definition: MetricDefinition): void {
    if (this.definitions.has(definition.key)) {
      throw new SimulationTemplateError(`Duplicate metric key: ${definition.key}`);
    }
    this.definitions.set(definition.key, definition);
  }

  collect(world: World): MetricRecord | undefined {
    if (world.tick % this.interval !== 0) {
      return undefined;
    }
    const values: Record<string, number> = {};
    const view = world.view();
    for (const key of [...this.definitions.keys()].sort((left, right) => left.localeCompare(right))) {
      const definition = this.definitions.get(key);
      if (!definition) {
        continue;
      }
      const value = definition.collect(view);
      if (!Number.isFinite(value)) {
        throw new SimulationValidationError(`Metric ${key} produced a non-finite value`);
      }
      values[key] = value;
    }
    const record: MetricRecord = { tick: world.tick, time: world.time, values };
    this.history.push(record);
    return deepClone(record);
  }

  definitionsList(): MetricDefinition[] {
    return [...this.definitions.values()].sort((left, right) => left.key.localeCompare(right.key));
  }

  serialize(): MetricRecord[] {
    return this.history.all() as MetricRecord[];
  }

  restore(history: readonly MetricRecord[]): void {
    this.history.reset(history);
  }

  reset(): void {
    this.history.reset();
  }

  historyRecords(): readonly MetricRecord[] {
    return this.history.all() as MetricRecord[];
  }

  latestRecord(): MetricRecord | undefined {
    return this.history.last();
  }

  get maxHistoryLength(): number {
    return this.history.maxLength;
  }
}
