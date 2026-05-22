import type { ComponentType, EntityId } from "./types";
import type { WorldView } from "./World";

export function queryEntities(world: WorldView, componentTypes: readonly ComponentType[]): EntityId[] {
  return world.entitiesWith(componentTypes);
}
