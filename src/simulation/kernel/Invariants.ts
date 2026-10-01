import type { ComponentType, ComponentValue, EntityId, FixedByConfiguration, JsonValue, ParameterValues, SerializedSpace } from "./types";
import type { World, WorldView } from "./World";
import { SimulationInvariantError, SimulationValidationError } from "./Errors";
import { eventSchema } from "./Validation";
import type { ReadonlySpace, Space } from "../spaces/Space";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Grid2DSpace } from "../spaces/Grid2DSpace";

// A world can be trusted as an executable state of a declared model when it passes three checks:
// 1. assertWorldInvariants: kernel structure that execution maintains for every model (unique ids,
//    components on existing entities, finite values, every space member a live entity, valid events).
// 2. The template's validateWorld: the model's own rules for its entities and component values, including
//    which live entities are agents and where they must be (assertAgentRole).
// These two run for built worlds, after every tick and external command batch, and on restore.
// 3. assertWorldMatchesConfiguration: what the model configuration fixes and execution never changes.
//    A world built from its configuration satisfies it by construction and no command can break it, so it
//    runs only where a world arrives from outside, in snapshot restore.
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

// A template's own membership rule: the space holds exactly `entityIds` (distinct ids), typically every
// live agent and nothing else. A space passed as undefined (missing, or of the wrong kind at its typed
// accessor) is rejected as well. assertAgentRole applies it to each of an agent role's spaces every tick,
// so it reads membership without copying the space.
export function assertSpaceHoldsExactly(
  space: ReadonlySpace<unknown> | undefined,
  spaceId: string,
  entityIds: readonly EntityId[],
  memberLabel: string
): void {
  if (!space) {
    throw new SimulationValidationError(`Space ${spaceId} is missing or has the wrong kind`);
  }
  for (const entityId of entityIds) {
    if (!space.has(entityId)) {
      throw new SimulationValidationError(`${memberLabel} ${entityId} is missing from ${spaceId}`, { entityId });
    }
  }
  if (space.memberCount() !== entityIds.length) {
    const expected = new Set(entityIds);
    const unexpected = spaceMemberIds(space.serialize()).find((entityId) => !expected.has(entityId));
    throw new SimulationValidationError(`Space ${spaceId} contains unexpected member ${unexpected}`, { entityId: unexpected });
  }
}

function spaceMemberIds(space: SerializedSpace): string[] {
  return space.kind === "continuous2d" ? Object.keys(space.positions) : space.kind === "grid2d" ? Object.keys(space.cells) : space.nodes;
}

export interface AgentRole {
  // Names an agent in error messages, such as "Opinion agent".
  label: string;
  // Components every agent holds in this world's model variant.
  required: readonly ComponentType[];
  // Components no agent holds in this world's model variant.
  forbidden?: readonly ComponentType[];
  // Spaces that hold exactly the live agents. Pass each space from its typed accessor so that a missing or
  // wrong-kind space is rejected.
  spaces: ReadonlyArray<{ id: string; space: ReadonlySpace<unknown> | undefined }>;
}

// For a template whose world holds nothing but its agents: every live entity is an agent, holds the role's
// required components and none of its forbidden ones, and each of the role's spaces holds exactly the
// agents. Agent identity is liveness, not a component. Identifying agents by one component would let an
// entity stripped of that component and removed from its spaces drop out of this check while systems,
// metrics, or renderers that read its other components still count it. Returns the agent ids.
export function assertAgentRole(world: WorldView, role: AgentRole): EntityId[] {
  const agents = world.aliveEntityIds();
  for (const entityId of agents) {
    for (const componentType of role.required) {
      if (!world.hasComponent(entityId, componentType)) {
        throw new SimulationValidationError(`${role.label} ${entityId} is missing ${componentType}`, { entityId });
      }
    }
    for (const componentType of role.forbidden ?? []) {
      if (world.hasComponent(entityId, componentType)) {
        throw new SimulationValidationError(`${role.label} ${entityId} holds ${componentType}, which this model variant does not use`, { entityId });
      }
    }
  }
  for (const { id, space } of role.spaces) {
    assertSpaceHoldsExactly(space, id, agents, role.label);
  }
  return agents;
}

// `world` agrees with `reference`, the world that its declared model configuration builds, on everything
// that configuration fixes: the set of spaces with their kinds, extents, and boundary modes, the template's
// configuration globals, and, for a model that neither creates nor destroys entities, the entity set.
// Positions, component values, and other evolving state are not compared.
export function assertWorldMatchesConfiguration(world: World, reference: World, fixed: FixedByConfiguration = {}): void {
  for (const space of world.spaces.values()) {
    const expected = reference.getSpace(space.id);
    if (!expected) {
      throw new SimulationValidationError(`Space ${space.id} is not part of the configured model`);
    }
    const actualShape = spaceShape(space);
    const expectedShape = spaceShape(expected);
    for (const [property, value] of Object.entries(expectedShape)) {
      if (actualShape[property] !== value) {
        throw new SimulationValidationError(
          `Space ${space.id} ${property} ${String(actualShape[property])} does not match the configured model (${String(value)})`
        );
      }
    }
  }
  for (const spaceId of reference.spaces.keys()) {
    if (!world.spaces.has(spaceId)) {
      throw new SimulationValidationError(`Configured space ${spaceId} is missing`);
    }
  }
  for (const key of fixed.globals ?? []) {
    const actual = world.globals[key];
    const expected = reference.globals[key];
    if (!sameJsonValue(actual, expected)) {
      throw new SimulationValidationError(
        `Global ${key} ${JSON.stringify(actual) ?? "(absent)"} does not match the configured model (${JSON.stringify(expected) ?? "(absent)"})`
      );
    }
  }
  if (fixed.population) {
    assertSameEntities(world, reference);
  }
}

// A snapshot's parameters belong to the model it is a state of, so they must be the configured parameters.
export function assertParametersMatchConfiguration(parameters: ParameterValues, configured: ParameterValues): void {
  for (const key of new Set([...Object.keys(configured), ...Object.keys(parameters)])) {
    if (!sameJsonValue(parameters[key], configured[key])) {
      throw new SimulationValidationError(
        `Parameter ${key} ${JSON.stringify(parameters[key]) ?? "(absent)"} does not match the configured model (${JSON.stringify(configured[key]) ?? "(absent)"})`
      );
    }
  }
}

// Kind first, so that a same-id space of another kind is reported as a kind mismatch.
function spaceShape(space: Space<any>): Record<string, JsonValue> {
  if (space instanceof Continuous2DSpace) {
    return { kind: space.kind, width: space.width, height: space.height, boundaryMode: space.boundaryMode };
  }
  if (space instanceof Grid2DSpace) {
    return { kind: space.kind, rows: space.rows, cols: space.cols, boundaryMode: space.boundaryMode };
  }
  return { kind: space.kind };
}

function assertSameEntities(world: World, reference: World): void {
  const expected = new Set(reference.entityStore.aliveIds());
  let live = 0;
  for (const entity of world.entityStore.all()) {
    if (!entity.alive) {
      throw new SimulationValidationError(`Entity ${entity.id} is destroyed, but the configured model never destroys entities`, { entityId: entity.id });
    }
    if (!expected.has(entity.id)) {
      throw new SimulationValidationError(`Entity ${entity.id} is not one of the configured model's entities`, { entityId: entity.id });
    }
    live += 1;
  }
  if (live !== expected.size) {
    const missing = [...expected].find((entityId) => !world.entityStore.has(entityId));
    throw new SimulationValidationError(`Configured entity ${missing} is missing`, { entityId: missing });
  }
}

function sameJsonValue(left: JsonValue | undefined, right: JsonValue | undefined): boolean {
  if (left === right) {
    return true;
  }
  if (typeof left !== "object" || typeof right !== "object" || left === null || right === null) {
    return false;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => sameJsonValue(item, right[index]));
  }
  const leftKeys = Object.keys(left);
  return leftKeys.length === Object.keys(right).length && leftKeys.every((key) => Object.hasOwn(right, key) && sameJsonValue(left[key], right[key]));
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
