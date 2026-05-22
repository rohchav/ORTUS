import type {
  ComponentType,
  ComponentValue,
  Entity,
  EntityId,
  JsonValue,
  WorldSnapshot
} from "./types";
import { ComponentStore } from "./ComponentStore";
import { EntityStore } from "./EntityStore";
import { EventQueue } from "./EventQueue";
import { SimulationInvariantError } from "./Errors";
import { deepClone } from "./Validation";
import type { ReadonlySpace, Space } from "../spaces/Space";
import { Continuous2DSpace, type Continuous2DSpaceReader } from "../spaces/Continuous2DSpace";
import { Grid2DSpace, type Grid2DSpaceReader } from "../spaces/Grid2DSpace";
import { NetworkSpace, type NetworkSpaceReader } from "../spaces/NetworkSpace";

export class World {
  readonly entityStore: EntityStore;
  readonly componentStore: ComponentStore;
  readonly spaces = new Map<string, Space<any>>();
  eventQueue: EventQueue;
  globals: Record<string, JsonValue>;
  tick: number;
  time: number;

  constructor(options: {
    entityStore?: EntityStore;
    componentStore?: ComponentStore;
    eventQueue?: EventQueue;
    globals?: Record<string, JsonValue>;
    tick?: number;
    time?: number;
  } = {}) {
    this.entityStore = options.entityStore ?? new EntityStore();
    this.componentStore = options.componentStore ?? new ComponentStore();
    this.eventQueue = options.eventQueue ?? new EventQueue();
    this.globals = deepClone(options.globals ?? {});
    this.tick = options.tick ?? 0;
    this.time = options.time ?? 0;
  }

  addSpace(space: Space<any>): void {
    if (this.spaces.has(space.id)) {
      throw new SimulationInvariantError(`Duplicate space id: ${space.id}`);
    }
    this.spaces.set(space.id, space);
  }

  getSpace<TSpace extends Space<any> = Space<any>>(spaceId: string): TSpace | undefined {
    return this.spaces.get(spaceId) as TSpace | undefined;
  }

  removeEntityFromSpaces(entityId: EntityId): void {
    for (const space of this.spaces.values()) {
      space.removeEntity(entityId);
    }
  }

  view(): WorldView {
    return new WorldView(this);
  }

  clone(): World {
    return World.fromSnapshot(this.serialize());
  }

  serialize(): WorldSnapshot {
    return {
      tick: this.tick,
      time: this.time,
      globals: deepClone(this.globals),
      entities: this.entityStore.serialize(),
      components: this.componentStore.serialize(),
      spaces: [...this.spaces.values()]
        .map((space) => space.serialize())
        .sort((left, right) => left.id.localeCompare(right.id)),
      events: this.eventQueue.serialize()
    };
  }

  static fromSnapshot(snapshot: WorldSnapshot): World {
    const world = new World({
      entityStore: EntityStore.fromSnapshot(snapshot.entities),
      componentStore: ComponentStore.fromSnapshot(snapshot.components),
      eventQueue: EventQueue.fromSnapshot(snapshot.events),
      globals: snapshot.globals,
      tick: snapshot.tick,
      time: snapshot.time
    });

    for (const serialized of snapshot.spaces) {
      if (serialized.kind === "continuous2d") {
        world.addSpace(Continuous2DSpace.fromSerialized(serialized));
      } else if (serialized.kind === "grid2d") {
        world.addSpace(Grid2DSpace.fromSerialized(serialized));
      } else if (serialized.kind === "network") {
        world.addSpace(NetworkSpace.fromSerialized(serialized));
      } else {
        const unsupported = serialized as { kind: string };
        throw new SimulationInvariantError(`Unsupported serialized space kind: ${unsupported.kind}`);
      }
    }

    return world;
  }
}

export class WorldView {
  constructor(private readonly world: World) {}

  get tick(): number {
    return this.world.tick;
  }

  get time(): number {
    return this.world.time;
  }

  get globals(): Record<string, JsonValue> {
    return deepClone(this.world.globals);
  }

  getEntity(entityId: EntityId): Entity | undefined {
    return this.world.entityStore.get(entityId);
  }

  hasEntity(entityId: EntityId): boolean {
    return this.world.entityStore.has(entityId);
  }

  aliveEntities(): Entity[] {
    return this.world.entityStore.alive();
  }

  allEntities(): Entity[] {
    return this.world.entityStore.all();
  }

  getComponent<T = ComponentValue>(entityId: EntityId, componentType: ComponentType): T | undefined {
    return this.world.componentStore.get<T>(entityId, componentType);
  }

  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    return this.world.componentStore.has(entityId, componentType);
  }

  entitiesWith(componentTypes: readonly ComponentType[]): EntityId[] {
    return this.world.componentStore
      .entitiesWith(componentTypes)
      .filter((entityId) => this.world.entityStore.get(entityId)?.alive)
      .sort((left, right) => left.localeCompare(right));
  }

  getSpace(spaceId: string): ReadonlySpace<any> | undefined {
    const space = this.world.getSpace(spaceId);
    return space ? readonlySpace(space) : undefined;
  }

  continuous2D(spaceId: string): Continuous2DSpaceReader | undefined {
    const space = this.world.getSpace(spaceId);
    return space instanceof Continuous2DSpace ? space.readonlyView() : undefined;
  }

  grid2D(spaceId: string): Grid2DSpaceReader | undefined {
    const space = this.world.getSpace(spaceId);
    return space instanceof Grid2DSpace ? space.readonlyView() : undefined;
  }

  network(spaceId: string): NetworkSpaceReader | undefined {
    const space = this.world.getSpace(spaceId);
    return space instanceof NetworkSpace ? space.readonlyView() : undefined;
  }

  spaces(): ReadonlySpace<any>[] {
    return [...this.world.spaces.values()]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((space) => readonlySpace(space));
  }
}

function readonlySpace(space: Space<any>): ReadonlySpace<any> {
  if (space instanceof Continuous2DSpace || space instanceof Grid2DSpace || space instanceof NetworkSpace) {
    return space.readonlyView();
  }
  return {
    id: space.id,
    kind: space.kind,
    getLocation: (entityId) => space.getLocation(entityId),
    queryNeighbors: (entityId, options) => space.queryNeighbors(entityId, options),
    serialize: () => space.serialize()
  };
}
