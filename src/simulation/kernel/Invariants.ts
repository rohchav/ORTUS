import type { ComponentValue, EntityId, SerializedSpace } from "./types";
import type { World } from "./World";
import { SimulationInvariantError, SimulationValidationError } from "./Errors";
import { eventSchema } from "./Validation";
import type { ReadonlySpace } from "../spaces/Space";

export function assertWorldInvariants(world: World): void {
  const ids = new Set<string>();
  for (const entity of world.entityStore.all()) {
    if (ids.has(entity.id)) {
      throw new SimulationInvariantError(`Duplicate entity id: ${entity.id}`, { entityId: entity.id });
    }
    ids.add(entity.id);
  }

  world.componentStore.forEachComponent((componentType, entityId, value) => {
    if (!world.entityStore.has(entityId)) {
      throw new SimulationInvariantError(`Component ${componentType} references missing entity ${entityId}`, { entityId });
    }
    assertFiniteDeep(value, `component ${componentType} on ${entityId}`, entityId);
  });

  for (const space of world.spaces.values()) {
    const serialized = space.serialize();
    assertFiniteDeep(serialized as unknown as ComponentValue, `space ${space.id}`);
    assertSpaceMembersAlive(world, serialized);
  }

  for (const event of world.eventQueue.all()) {
    const result = eventSchema.safeParse(event);
    if (!result.success) {
      throw new SimulationInvariantError(`Invalid event in queue: ${event.id}`, { cause: result.error });
    }
  }
}

// Every space member is a live entity. Execution maintains this: destroyEntity removes the entity from
// every space, and placement and movement commands require a live entity. Checking it here extends the
// guarantee to restored and template-built worlds. Network edges always join member nodes because
// NetworkSpace refuses any other edge, including while deserializing. Which live entities must be
// placed in which space is template knowledge and belongs in the template's validateWorld.
function assertSpaceMembersAlive(world: World, space: SerializedSpace): void {
  for (const entityId of spaceMemberIds(space)) {
    if (!world.entityStore.isAlive(entityId)) {
      const state = world.entityStore.has(entityId) ? "destroyed" : "missing";
      throw new SimulationInvariantError(`Space ${space.id} contains ${state} entity ${entityId}`, { entityId });
    }
  }
}

// A template's own membership rule: the space holds exactly `entityIds`, typically every live agent and
// nothing else. Templates call this from validateWorld for spaces their systems read member by member,
// passing the space from its typed accessor so that a missing or wrong-kind space is rejected as well.
export function assertSpaceHoldsExactly(
  space: ReadonlySpace<unknown> | undefined,
  spaceId: string,
  entityIds: readonly EntityId[],
  memberLabel: string
): void {
  if (!space) {
    throw new SimulationValidationError(`Space ${spaceId} is missing or has the wrong kind`);
  }
  const remaining = new Set(spaceMemberIds(space.serialize()));
  for (const entityId of entityIds) {
    if (!remaining.delete(entityId)) {
      throw new SimulationValidationError(`${memberLabel} ${entityId} is missing from ${spaceId}`, { entityId });
    }
  }
  const [unexpected] = remaining;
  if (unexpected !== undefined) {
    throw new SimulationValidationError(`Space ${spaceId} contains unexpected member ${unexpected}`, { entityId: unexpected });
  }
}

function spaceMemberIds(space: SerializedSpace): string[] {
  return space.kind === "continuous2d" ? Object.keys(space.positions) : space.kind === "grid2d" ? Object.keys(space.cells) : space.nodes;
}

export function assertFiniteDeep(value: unknown, label: string, entityId?: string): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SimulationInvariantError(`${label} contains non-finite number`, { entityId });
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      assertFiniteDeep(item, label, entityId);
    }
    return;
  }
  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      assertFiniteDeep(item, label, entityId);
    }
  }
}
