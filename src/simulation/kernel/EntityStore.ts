import type { Entity, EntityId, EntityStoreSnapshot } from "./types";
import { SimulationInvariantError } from "./Errors";
import { deepClone } from "./Validation";

export interface CreateEntityOptions {
  id?: EntityId;
  label?: string;
  createdAtTick?: number;
}

export class EntityStore {
  private readonly entities = new Map<EntityId, Entity>();
  private sequence = 0;

  create(archetype: string, options: CreateEntityOptions = {}): Entity {
    const id = options.id ?? this.nextId();
    const entity: Entity = {
      id,
      archetype,
      alive: true,
      createdAtTick: options.createdAtTick ?? 0,
      ...(options.label !== undefined ? { label: options.label } : {})
    };
    this.add(entity);
    return deepClone(entity);
  }

  reserveId(): EntityId {
    return this.nextId();
  }

  add(entity: Entity): void {
    if (this.entities.has(entity.id)) {
      throw new SimulationInvariantError(`Duplicate entity id: ${entity.id}`, { entityId: entity.id });
    }
    this.entities.set(entity.id, deepClone(entity));
    this.captureSequence(entity.id);
  }

  get(entityId: EntityId): Entity | undefined {
    const entity = this.entities.get(entityId);
    return entity ? deepClone(entity) : undefined;
  }

  getMutable(entityId: EntityId): Entity | undefined {
    return this.entities.get(entityId);
  }

  has(entityId: EntityId): boolean {
    return this.entities.has(entityId);
  }

  destroy(entityId: EntityId, tick: number): void {
    const entity = this.entities.get(entityId);
    if (!entity) {
      throw new SimulationInvariantError(`Cannot destroy missing entity: ${entityId}`, { entityId });
    }
    if (!entity.alive) {
      return;
    }
    entity.alive = false;
    entity.destroyedAtTick = tick;
  }

  alive(): Entity[] {
    return this.all().filter((entity) => entity.alive);
  }

  all(): Entity[] {
    return [...this.entities.values()]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((entity) => deepClone(entity));
  }

  clone(): EntityStore {
    return EntityStore.fromSnapshot(this.serialize());
  }

  serialize(): EntityStoreSnapshot {
    return {
      sequence: this.sequence,
      entities: this.all()
    };
  }

  static fromSnapshot(snapshot: EntityStoreSnapshot): EntityStore {
    const store = new EntityStore();
    store.sequence = snapshot.sequence;
    for (const entity of snapshot.entities) {
      store.add(entity);
    }
    store.sequence = Math.max(store.sequence, snapshot.sequence);
    return store;
  }

  private nextId(): EntityId {
    this.sequence += 1;
    return `e${this.sequence.toString().padStart(6, "0")}`;
  }

  private captureSequence(id: EntityId): void {
    const match = /^e(\d+)$/.exec(id);
    if (match?.[1]) {
      this.sequence = Math.max(this.sequence, Number.parseInt(match[1], 10));
    }
  }
}
