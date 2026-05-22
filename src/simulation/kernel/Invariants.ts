import type { ComponentValue } from "./types";
import type { World } from "./World";
import { SimulationInvariantError } from "./Errors";
import { eventSchema } from "./Validation";

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
  }

  for (const event of world.eventQueue.all()) {
    const result = eventSchema.safeParse(event);
    if (!result.success) {
      throw new SimulationInvariantError(`Invalid event in queue: ${event.id}`, { cause: result.error });
    }
  }
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
