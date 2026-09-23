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
import { isLocationForSpaceKind, type Space, type SpaceLocation } from "../spaces/Space";
import { NetworkSpace } from "../spaces/NetworkSpace";

// Entry ownership: add() makes the one copy of a command, so a caller mutating its payload after
// queueing cannot change what is applied. Entries are never mutated after that, and every write into
// the world copies what it keeps (component and entity stores, event queue, globals, and spaces, which
// normalize locations into new objects). drain(), history, and the scheduler's debug log therefore
// hand over and retain the queued entries without copying; recent(), debugData(), and
// SimulationEngine.applyCommands copy them on the way out.
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
    return this.pending.splice(0, this.pending.length);
  }

  apply(world: World): BufferedCommand[] {
    const commands = this.drain();
    for (const entry of commands) {
      this.applyOne(world, entry);
      this.history.push(entry);
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
        // Resolve every placement first so a bad space or location cannot leave a half-created entity.
        const placements = Object.entries(command.spaceLocations ?? {})
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([spaceId, location]) => {
            const space = requireSpace(world, spaceId, command);
            assertLocationFits(space, location, command);
            return { space, location };
          });
        const entity = world.entityStore.create(command.archetype, {
          id: command.entityId,
          label: command.label,
          createdAtTick: entry.metadata.tick
        });
        for (const [componentType, value] of Object.entries(command.components ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
          world.componentStore.add(entity.id, componentType, value);
        }
        for (const { space, location } of placements) {
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
        const space = requireSpace(world, command.spaceId, command);
        assertLocationFits(space, command.location, command);
        space.moveEntity(command.entityId, command.location);
        return;
      }
      case "moveEntities": {
        const space = requireSpace(world, command.spaceId, command);
        const moves = Object.entries(command.locations)
          .sort(([left], [right]) => left.localeCompare(right))
          .filter(([entityId]) => this.requireAlive(world, entityId, command.allowMissing, command));
        for (const [, location] of moves) {
          assertLocationFits(space, location, command);
        }
        for (const [entityId, location] of moves) {
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
    if (!world.entityStore.isAlive(entityId)) {
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
    this.add({ type: "moveEntity", spaceId, entityId, location }, reason);
  }

  moveEntities(spaceId: string, locations: Record<EntityId, SpaceLocation>, reason?: string): void {
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

function requireSpace(world: World, spaceId: string, command: Command): Space<any> {
  const space = world.getSpace(spaceId);
  if (!space) {
    throw new SimulationInvariantError(`Missing space ${spaceId}`, { command });
  }
  return space;
}

// Command validation checks location shape without knowing the target space; this checks the shape
// against the resolved space's kind before any mutation. Network membership is never a location.
function assertLocationFits(space: Space<any>, location: SpaceLocation, command: Command): void {
  if (!isLocationForSpaceKind(space.kind, location)) {
    throw new SimulationValidationError(
      space.kind === "network"
        ? `Space ${space.id} is a network; network membership is not a spatial location and cannot be set by placement or movement commands`
        : `${space.kind} space ${space.id} requires ${space.kind === "continuous2d" ? "a finite {x, y} point" : "an integer {row, col} cell"}`,
      { command }
    );
  }
}
