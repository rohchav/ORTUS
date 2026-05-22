import type {
  BufferedCommand,
  Command,
  CommandMetadata,
  CommandSink,
  ComponentValue,
  CreateEntityCommand,
  EntityId,
  SchedulableEvent
} from "./types";
import type { World } from "./World";
import { SimulationInvariantError, SimulationValidationError } from "./Errors";
import { assertSerializableValue, deepClone, validateCommand } from "./Validation";
import { isGridCell, isPoint2D, type SpaceLocation } from "../spaces/Space";
import { NetworkSpace } from "../spaces/NetworkSpace";

export class CommandBuffer {
  private readonly pending: BufferedCommand[] = [];
  private readonly history: BufferedCommand[] = [];

  constructor(private readonly maxHistory = 200) {}

  add(command: Command, metadata: CommandMetadata): void {
    const validated = validateCommand(command);
    this.pending.push({ command: deepClone(validated), metadata: deepClone(metadata) });
  }

  count(): number {
    return this.pending.length;
  }

  drain(): BufferedCommand[] {
    const commands = this.pending.splice(0, this.pending.length);
    return commands.map((entry) => deepClone(entry));
  }

  apply(world: World): BufferedCommand[] {
    const commands = this.drain();
    for (const entry of commands) {
      this.applyOne(world, entry);
      this.history.push(deepClone(entry));
      while (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }
    return commands;
  }

  clear(): void {
    this.pending.length = 0;
  }

  recent(limit = this.maxHistory): BufferedCommand[] {
    return this.history.slice(-limit).map((entry) => deepClone(entry));
  }

  private applyOne(world: World, entry: BufferedCommand): void {
    const command = entry.command;
    switch (command.type) {
      case "createEntity": {
        const entity = world.entityStore.create(command.archetype, {
          id: command.entityId,
          label: command.label,
          createdAtTick: entry.metadata.tick
        });
        for (const [componentType, value] of Object.entries(command.components ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
          world.componentStore.add(entity.id, componentType, value);
        }
        for (const [spaceId, location] of Object.entries(command.spaceLocations ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
          const space = world.getSpace(spaceId);
          if (!space) {
            throw new SimulationInvariantError(`Cannot place entity in missing space ${spaceId}`, {
              entityId: entity.id,
              command
            });
          }
          space.addEntity(entity.id, location);
        }
        return;
      }
      case "destroyEntity": {
        if (!this.requireAlive(world, command.entityId, command.allowMissing, command)) {
          return;
        }
        world.entityStore.destroy(command.entityId, entry.metadata.tick);
        world.removeEntityFromSpaces(command.entityId);
        return;
      }
      case "addComponent": {
        if (!command.value) {
          throw new SimulationValidationError("addComponent requires value", { command });
        }
        if (!this.requireAlive(world, command.entityId, command.allowMissing, command)) {
          return;
        }
        world.componentStore.add(command.entityId, command.componentType, command.value);
        return;
      }
      case "setComponent": {
        if (!command.value) {
          throw new SimulationValidationError("setComponent requires value", { command });
        }
        if (!this.requireAlive(world, command.entityId, command.allowMissing, command)) {
          return;
        }
        world.componentStore.set(command.entityId, command.componentType, command.value);
        return;
      }
      case "setComponents": {
        for (const [entityId, value] of Object.entries(command.values).sort(([left], [right]) => left.localeCompare(right))) {
          if (!this.requireAlive(world, entityId, command.allowMissing, command)) {
            continue;
          }
          world.componentStore.set(entityId, command.componentType, value);
        }
        return;
      }
      case "patchComponent": {
        if (!command.partial) {
          throw new SimulationValidationError("patchComponent requires partial", { command });
        }
        if (!this.requireAlive(world, command.entityId, command.allowMissing, command)) {
          return;
        }
        world.componentStore.patch(command.entityId, command.componentType, command.partial);
        return;
      }
      case "removeComponent": {
        if (!this.requireAlive(world, command.entityId, command.allowMissing, command)) {
          return;
        }
        world.componentStore.remove(command.entityId, command.componentType);
        return;
      }
      case "moveEntity": {
        if (!this.requireAlive(world, command.entityId, command.allowMissing, command)) {
          return;
        }
        const space = world.getSpace(command.spaceId);
        if (!space) {
          throw new SimulationInvariantError(`Missing space ${command.spaceId}`, { entityId: command.entityId, command });
        }
        space.moveEntity(command.entityId, command.location);
        return;
      }
      case "moveEntities": {
        const space = world.getSpace(command.spaceId);
        if (!space) {
          throw new SimulationInvariantError(`Missing space ${command.spaceId}`, { command });
        }
        for (const [entityId, location] of Object.entries(command.locations).sort(([left], [right]) => left.localeCompare(right))) {
          if (!this.requireAlive(world, entityId, command.allowMissing, command)) {
            continue;
          }
          space.moveEntity(entityId, location);
        }
        return;
      }
      case "addEdge": {
        if (!this.requireAlive(world, command.source, command.allowMissing, command)) {
          return;
        }
        if (!this.requireAlive(world, command.target, command.allowMissing, command)) {
          return;
        }
        const space = world.getSpace(command.spaceId);
        if (!(space instanceof NetworkSpace)) {
          throw new SimulationInvariantError(`Space ${command.spaceId} is not a network`, { command });
        }
        space.addEdge(command.source, command.target, command.weight, command.directed ?? false);
        return;
      }
      case "removeEdge": {
        const space = world.getSpace(command.spaceId);
        if (!(space instanceof NetworkSpace)) {
          throw new SimulationInvariantError(`Space ${command.spaceId} is not a network`, { command });
        }
        space.removeEdge(command.source, command.target);
        return;
      }
      case "emitEvent": {
        if (command.event.scheduledTick < world.tick) {
          throw new SimulationInvariantError("Cannot schedule event in the past", { command });
        }
        world.eventQueue.schedule(command.event);
        return;
      }
      case "setGlobal": {
        assertSerializableValue(command.value, `global ${command.key}`);
        world.globals[command.key] = deepClone(command.value);
        return;
      }
      default: {
        const neverCommand: never = command;
        throw new SimulationValidationError(`Unsupported command ${(neverCommand as Command).type}`, { command });
      }
    }
  }

  private requireAlive(world: World, entityId: EntityId, allowMissing: boolean | undefined, command: Command): boolean {
    const entity = world.entityStore.get(entityId);
    if (!entity || !entity.alive) {
      if (allowMissing) {
        return false;
      }
      throw new SimulationInvariantError(`Command targets missing or dead entity ${entityId}`, { entityId, command });
    }
    return true;
  }
}

export class SystemCommandSink implements CommandSink {
  constructor(
    private readonly buffer: CommandBuffer,
    private readonly metadata: CommandMetadata
  ) {}

  add(command: Command, reason?: string): void {
    this.buffer.add(command, this.withReason(reason));
  }

  createEntity(command: Omit<CreateEntityCommand, "type">, reason?: string): void {
    this.add({ type: "createEntity", ...command }, reason);
  }

  destroyEntity(entityId: EntityId, reason?: string): void {
    this.add({ type: "destroyEntity", entityId }, reason);
  }

  addComponent(entityId: EntityId, componentType: string, value: ComponentValue, reason?: string): void {
    this.add({ type: "addComponent", entityId, componentType, value }, reason);
  }

  setComponent(entityId: EntityId, componentType: string, value: ComponentValue, reason?: string): void {
    this.add({ type: "setComponent", entityId, componentType, value }, reason);
  }

  setComponents(componentType: string, values: Record<EntityId, ComponentValue>, reason?: string): void {
    this.add({ type: "setComponents", componentType, values }, reason);
  }

  patchComponent(entityId: EntityId, componentType: string, partial: ComponentValue, reason?: string): void {
    this.add({ type: "patchComponent", entityId, componentType, partial }, reason);
  }

  removeComponent(entityId: EntityId, componentType: string, reason?: string): void {
    this.add({ type: "removeComponent", entityId, componentType }, reason);
  }

  moveEntity(spaceId: string, entityId: EntityId, location: SpaceLocation, reason?: string): void {
    if (!isPoint2D(location) && !isGridCell(location)) {
      throw new SimulationValidationError("moveEntity location must be a supported space location");
    }
    this.add({ type: "moveEntity", spaceId, entityId, location }, reason);
  }

  moveEntities(spaceId: string, locations: Record<EntityId, SpaceLocation>, reason?: string): void {
    for (const location of Object.values(locations)) {
      if (!isPoint2D(location) && !isGridCell(location)) {
        throw new SimulationValidationError("moveEntities locations must be supported space locations");
      }
    }
    this.add({ type: "moveEntities", spaceId, locations }, reason);
  }

  addEdge(spaceId: string, source: EntityId, target: EntityId, weight?: number, directed?: boolean, reason?: string): void {
    this.add({ type: "addEdge", spaceId, source, target, weight, directed }, reason);
  }

  removeEdge(spaceId: string, source: EntityId, target: EntityId, reason?: string): void {
    this.add({ type: "removeEdge", spaceId, source, target }, reason);
  }

  emitEvent(event: SchedulableEvent, reason?: string): void {
    this.add({ type: "emitEvent", event }, reason);
  }

  setGlobal(key: string, value: import("./types").JsonValue, reason?: string): void {
    this.add({ type: "setGlobal", key, value }, reason);
  }

  private withReason(reason?: string): CommandMetadata {
    return {
      ...this.metadata,
      ...(reason !== undefined ? { reason } : {})
    };
  }
}
