import type { ComponentStoreSnapshot, ComponentType, ComponentValue, EntityId } from "./types";
import { SimulationInvariantError } from "./Errors";
import { assertComponentValue, deepClone } from "./Validation";

export class ComponentStore {
  private readonly components = new Map<ComponentType, Map<EntityId, ComponentValue>>();

  add(entityId: EntityId, componentType: ComponentType, value: ComponentValue): void {
    assertComponentValue(value, `component ${componentType}`);
    const bucket = this.bucket(componentType);
    if (bucket.has(entityId)) {
      throw new SimulationInvariantError(`Entity ${entityId} already has component ${componentType}`, { entityId });
    }
    bucket.set(entityId, deepClone(value));
  }

  get<T = ComponentValue>(entityId: EntityId, componentType: ComponentType): T | undefined {
    const value = this.components.get(componentType)?.get(entityId);
    return value ? (deepClone(value) as T) : undefined;
  }

  getMutable<T = ComponentValue>(entityId: EntityId, componentType: ComponentType): T | undefined {
    return this.components.get(componentType)?.get(entityId) as T | undefined;
  }

  set(entityId: EntityId, componentType: ComponentType, value: ComponentValue): void {
    assertComponentValue(value, `component ${componentType}`);
    const bucket = this.components.get(componentType);
    if (!bucket?.has(entityId)) {
      throw new SimulationInvariantError(`Cannot set missing component ${componentType} on ${entityId}`, { entityId });
    }
    bucket.set(entityId, deepClone(value));
  }

  patch(entityId: EntityId, componentType: ComponentType, partial: ComponentValue): void {
    assertComponentValue(partial, `component patch ${componentType}`);
    const bucket = this.components.get(componentType);
    const current = bucket?.get(entityId);
    if (!bucket || !current) {
      throw new SimulationInvariantError(`Cannot patch missing component ${componentType} on ${entityId}`, { entityId });
    }
    bucket.set(entityId, { ...deepClone(current), ...deepClone(partial) });
  }

  remove(entityId: EntityId, componentType: ComponentType): void {
    const bucket = this.components.get(componentType);
    if (!bucket?.has(entityId)) {
      throw new SimulationInvariantError(`Cannot remove missing component ${componentType} on ${entityId}`, { entityId });
    }
    bucket.delete(entityId);
  }

  has(entityId: EntityId, componentType: ComponentType): boolean {
    return this.components.get(componentType)?.has(entityId) ?? false;
  }

  entitiesWith(componentTypes: readonly ComponentType[]): EntityId[] {
    if (componentTypes.length === 0) {
      return [];
    }
    const [first, ...rest] = componentTypes;
    if (!first) {
      return [];
    }
    const firstBucket = this.components.get(first);
    if (!firstBucket) {
      return [];
    }
    return [...firstBucket.keys()]
      .filter((entityId) => rest.every((componentType) => this.components.get(componentType)?.has(entityId)))
      .sort((left, right) => left.localeCompare(right));
  }

  componentTypes(): ComponentType[] {
    return [...this.components.keys()].sort((left, right) => left.localeCompare(right));
  }

  forEachComponent(callback: (componentType: ComponentType, entityId: EntityId, value: ComponentValue) => void): void {
    for (const componentType of this.componentTypes()) {
      const bucket = this.components.get(componentType);
      if (!bucket) {
        continue;
      }
      for (const entityId of [...bucket.keys()].sort((left, right) => left.localeCompare(right))) {
        const value = bucket.get(entityId);
        if (value) {
          callback(componentType, entityId, value);
        }
      }
    }
  }

  clone(): ComponentStore {
    return ComponentStore.fromSnapshot(this.serialize());
  }

  serialize(): ComponentStoreSnapshot {
    const snapshot: ComponentStoreSnapshot = {};
    for (const componentType of this.componentTypes()) {
      const bucket = this.components.get(componentType);
      if (!bucket) {
        continue;
      }
      snapshot[componentType] = {};
      for (const entityId of [...bucket.keys()].sort((left, right) => left.localeCompare(right))) {
        const value = bucket.get(entityId);
        if (value) {
          snapshot[componentType][entityId] = deepClone(value);
        }
      }
    }
    return snapshot;
  }

  static fromSnapshot(snapshot: ComponentStoreSnapshot): ComponentStore {
    const store = new ComponentStore();
    for (const componentType of Object.keys(snapshot).sort((left, right) => left.localeCompare(right))) {
      const bucket = snapshot[componentType];
      if (!bucket) {
        continue;
      }
      for (const entityId of Object.keys(bucket).sort((left, right) => left.localeCompare(right))) {
        const value = bucket[entityId];
        if (value) {
          store.add(entityId, componentType, value);
        }
      }
    }
    return store;
  }

  private bucket(componentType: ComponentType): Map<EntityId, ComponentValue> {
    const existing = this.components.get(componentType);
    if (existing) {
      return existing;
    }
    const created = new Map<EntityId, ComponentValue>();
    this.components.set(componentType, created);
    return created;
  }
}
