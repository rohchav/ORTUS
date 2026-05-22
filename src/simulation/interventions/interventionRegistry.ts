import type { Command, ComponentValue, JsonValue, ParameterDefinition } from "../kernel/types";
import type { WorldView } from "../kernel/World";
import { SimulationValidationError } from "../kernel/Errors";
import type { SimulationEngine } from "../kernel/SimulationEngine";
import type { Point2D } from "../spaces/Space";
import { EPIDEMIC_SPACE_ID, InfectionState, Position2D, Velocity2D, type InfectionStateComponent } from "../templates/epidemic.template";
import { OPINION_SPACE_ID, OpinionState, type OpinionStateComponent } from "../templates/opinion.template";
import { PREDATOR_PREY_SPACE_ID, Species, type SpeciesComponent } from "../templates/predatorPrey.template";
import { GroupIdentity, type GroupIdentityComponent } from "../templates/schelling.template";
import { FLOCKING_SPACE_ID, BoidState, flockingParams, type BoidStateComponent } from "../templates/flocking.template";
import { FOREST_FIRE_SPACE_ID, ForestFireCellState, type ForestFireCellStateComponent } from "../templates/forestFire.template";
import type {
  InterventionBuildContext,
  InterventionCommandResult,
  InterventionDefinition,
  InterventionTarget
} from "./interventionTypes";

const opinionValueParam: ParameterDefinition = {
  key: "opinionValue",
  label: "Opinion value",
  type: "number",
  defaultValue: 0,
  min: -1,
  max: 1,
  step: 0.05,
  description: "Target opinion value from -1 to 1.",
  liveUpdate: true
};

const radiusParam = (defaultValue: number): ParameterDefinition => ({
  key: "radius",
  label: "Radius",
  type: "number",
  defaultValue,
  min: 0.1,
  max: 100,
  step: 0.5,
  description: "Intervention radius in world units.",
  liveUpdate: true
});

export function getInterventionDefinitions(templateId: string): InterventionDefinition[] {
  return [...(interventionsByTemplate[templateId] ?? [])].sort((left, right) => left.id.localeCompare(right.id));
}

export function getInterventionDefinition(templateId: string, interventionId: string): InterventionDefinition | undefined {
  return getInterventionDefinitions(templateId).find((definition) => definition.id === interventionId);
}

const interventionsByTemplate: Record<string, InterventionDefinition[]> = {
  "epidemic-spread": [
    {
      id: "epidemic.infectSelected",
      templateId: "epidemic-spread",
      label: "Infect Selected Agent",
      description: "Set the selected susceptible agent to infected and schedule recovery.",
      targetType: "selectedEntity",
      supportedTemplates: ["epidemic-spread"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [],
      documentation: "Applies immediately at the current tick without advancing time. Recovered agents are not reinfected in V1.",
      build(ctx) {
        const entityId = requireSelectedEntity(ctx.world, ctx.target);
        return infectEntities(ctx, [entityId], `entity ${entityId}`);
      }
    },
    {
      id: "epidemic.infectRadius",
      templateId: "epidemic-spread",
      label: "Infect Radius",
      description: "Infect susceptible agents near the selected point or selected agent.",
      targetType: "radius",
      supportedTemplates: ["epidemic-spread"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [radiusParam(8)],
      documentation: "Applies only to susceptible agents in radius and schedules their recovery events.",
      build(ctx) {
        const radius = positiveNumber(ctx.params.radius, "radius");
        const { point, summary } = requireContinuousTarget(ctx.world, ctx.target, EPIDEMIC_SPACE_ID);
        const space = requireContinuousSpace(ctx.world, EPIDEMIC_SPACE_ID);
        const targets = space
          .queryRadius(point, radius)
          .map((result) => result.entityId)
          .filter((entityId) => ctx.world.getComponent<InfectionStateComponent>(entityId, InfectionState)?.status === "susceptible");
        return infectEntities(ctx, targets, `${targets.length} susceptible agents near ${summary}`, { kind: "point", x: point.x, y: point.y, radius });
      }
    }
  ],
  "opinion-dynamics": [
    {
      id: "opinion.setSelected",
      templateId: "opinion-dynamics",
      label: "Set Selected Opinion",
      description: "Set the selected agent's opinion to a validated value.",
      targetType: "selectedEntity",
      supportedTemplates: ["opinion-dynamics"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [opinionValueParam],
      documentation: "Applies immediately without advancing time.",
      build(ctx) {
        const entityId = requireSelectedEntity(ctx.world, ctx.target);
        const opinion = requireOpinion(ctx.world, entityId);
        const value = clamp(positiveFinite(ctx.params.opinionValue, "opinionValue"), -1, 1);
        return {
          commands: [{ type: "setComponent", entityId, componentType: OpinionState, value: { value, stubbornness: opinion.stubbornness } }],
          targetSummary: `entity ${entityId}`
        };
      }
    },
    {
      id: "opinion.broadcastRadius",
      templateId: "opinion-dynamics",
      label: "Broadcast Opinion Pulse",
      description: "Move nearby opinions toward a target value by a bounded strength.",
      targetType: "radius",
      supportedTemplates: ["opinion-dynamics"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [
        opinionValueParam,
        {
          key: "strength",
          label: "Strength",
          type: "number",
          defaultValue: 0.35,
          min: 0,
          max: 1,
          step: 0.05,
          description: "Fractional movement toward the target opinion.",
          liveUpdate: true
        },
        radiusParam(15)
      ],
      documentation: "Applies to opinion agents in radius and clamps opinions to [-1, 1].",
      build(ctx) {
        const targetOpinion = clamp(positiveFinite(ctx.params.opinionValue, "opinionValue"), -1, 1);
        const strength = clamp(positiveFinite(ctx.params.strength, "strength"), 0, 1);
        const radius = positiveNumber(ctx.params.radius, "radius");
        const { point, summary } = requireContinuousTarget(ctx.world, ctx.target, OPINION_SPACE_ID);
        const space = requireContinuousSpace(ctx.world, OPINION_SPACE_ID);
        const values: Record<string, ComponentValue> = {};
        for (const result of space.queryRadius(point, radius)) {
          const opinion = ctx.world.getComponent<OpinionStateComponent>(result.entityId, OpinionState);
          if (!opinion) {
            continue;
          }
          values[result.entityId] = {
            value: clamp(opinion.value + (targetOpinion - opinion.value) * strength, -1, 1),
            stubbornness: opinion.stubbornness
          };
        }
        return {
          commands: Object.keys(values).length > 0 ? [{ type: "setComponents", componentType: OpinionState, values }] : [],
          targetSummary: `${Object.keys(values).length} agents near ${summary}`,
          visualMarker: { kind: "point", x: point.x, y: point.y, radius }
        };
      }
    }
  ],
  "predator-prey": [
    {
      id: "predatorPrey.addPrey",
      templateId: "predator-prey",
      label: "Add Prey At Target",
      description: "Add a small deterministic group of prey near the selected point.",
      targetType: "worldPoint",
      supportedTemplates: ["predator-prey"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [
        {
          key: "count",
          label: "Count",
          type: "integer",
          defaultValue: 1,
          min: 1,
          max: 10,
          step: 1,
          description: "Number of prey to add.",
          liveUpdate: true
        }
      ],
      documentation: "Adds prey immediately through create-entity commands. It does not advance time.",
      build(ctx) {
        const count = integerInRange(ctx.params.count, "count", 1, 10);
        const { point, summary } = requireContinuousTarget(ctx.world, ctx.target, PREDATOR_PREY_SPACE_ID);
        const space = requireContinuousSpace(ctx.world, PREDATOR_PREY_SPACE_ID);
        const commands: Command[] = [];
        for (let index = 0; index < count; index += 1) {
          const position = offsetPoint(space, point, index, count);
          commands.push({
            type: "createEntity",
            archetype: "prey",
            label: `Intervention prey ${ctx.historyIndex + 1}.${index + 1}`,
            components: {
              [Position2D]: position,
              [Velocity2D]: { x: 0, y: 0 },
              [Species]: { kind: "prey" satisfies SpeciesComponent["kind"] }
            },
            spaceLocations: {
              [PREDATOR_PREY_SPACE_ID]: position
            }
          });
        }
        return { commands, targetSummary: `${count} prey near ${summary}`, visualMarker: { kind: "point", x: point.x, y: point.y, radius: 4 } };
      }
    },
    {
      id: "predatorPrey.removeSelected",
      templateId: "predator-prey",
      label: "Remove Selected Agent",
      description: "Destroy the selected predator or prey.",
      targetType: "selectedEntity",
      supportedTemplates: ["predator-prey"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [],
      documentation: "A destructive intervention that marks the entity destroyed and removes it from spaces.",
      build(ctx) {
        const entityId = requireSelectedEntity(ctx.world, ctx.target);
        const species = ctx.world.getComponent<SpeciesComponent>(entityId, Species);
        if (!species) {
          throw new SimulationValidationError("Selected entity is not a predator-prey agent");
        }
        return {
          commands: [{ type: "destroyEntity", entityId }],
          targetSummary: `${species.kind} ${entityId}`,
          visualMarker: { kind: "entity", entityId }
        };
      }
    }
  ],
  "schelling-segregation": [
    {
      id: "schelling.swapSelectedGroup",
      templateId: "schelling-segregation",
      label: "Swap Selected Group",
      description: "Switch the selected Schelling agent between Group A and Group B.",
      targetType: "selectedEntity",
      supportedTemplates: ["schelling-segregation"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [],
      documentation: "Relocation requires empty-cell target mode, so V1 uses a clear group-swap perturbation.",
      build(ctx) {
        const entityId = requireSelectedEntity(ctx.world, ctx.target);
        const group = ctx.world.getComponent<GroupIdentityComponent>(entityId, GroupIdentity);
        if (!group || (group.group !== "A" && group.group !== "B")) {
          throw new SimulationValidationError("Selected entity does not have a valid Schelling group");
        }
        const next = group.group === "A" ? "B" : "A";
        return {
          commands: [{ type: "setComponent", entityId, componentType: GroupIdentity, value: { group: next } }],
          targetSummary: `entity ${entityId} Group ${group.group} -> ${next}`,
          visualMarker: { kind: "entity", entityId }
        };
      }
    }
  ],
  "flocking-boids": [
    {
      id: "flocking.applyImpulse",
      templateId: "flocking-boids",
      label: "Apply Impulse To Boid",
      description: "Adjust the selected boid velocity by a finite impulse.",
      targetType: "selectedEntity",
      supportedTemplates: ["flocking-boids"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [
        vectorParam("impulseX", "Impulse X", 1),
        vectorParam("impulseY", "Impulse Y", 0),
        {
          key: "strength",
          label: "Strength",
          type: "number",
          defaultValue: 1,
          min: 0.01,
          max: 10,
          step: 0.1,
          description: "Impulse multiplier.",
          liveUpdate: true
        }
      ],
      documentation: "Velocity is clamped to the template maxSpeed after applying the impulse.",
      build(ctx) {
        const entityId = requireSelectedEntity(ctx.world, ctx.target);
        const velocity = requirePointComponent(ctx.world, entityId, Velocity2D);
        const boid = requireBoid(ctx.world, entityId);
        const params = flockingParams(ctx.engine.parameters);
        const impulse = {
          x: positiveFinite(ctx.params.impulseX, "impulseX") * positiveNumber(ctx.params.strength, "strength"),
          y: positiveFinite(ctx.params.impulseY, "impulseY") * positiveNumber(ctx.params.strength, "strength")
        };
        if (Math.hypot(impulse.x, impulse.y) <= 0) {
          throw new SimulationValidationError("Impulse vector must be nonzero");
        }
        const nextVelocity = limitMagnitude({ x: velocity.x + impulse.x, y: velocity.y + impulse.y }, params.maxSpeed);
        return {
          commands: boidVelocityCommands(entityId, nextVelocity, boid),
          targetSummary: `boid ${entityId}`,
          visualMarker: { kind: "entity", entityId }
        };
      }
    },
    {
      id: "flocking.scatterRadius",
      templateId: "flocking-boids",
      label: "Scatter Radius",
      description: "Push nearby boids outward from the selected point.",
      targetType: "radius",
      supportedTemplates: ["flocking-boids"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["agents"],
      eventType: "intervention.applied",
      parameterDefinitions: [radiusParam(16), vectorStrengthParam(1.4)],
      documentation: "Computes outward deterministic impulses once at apply time and clamps speed.",
      build(ctx) {
        const radius = positiveNumber(ctx.params.radius, "radius");
        const strength = positiveNumber(ctx.params.strength, "strength");
        const params = flockingParams(ctx.engine.parameters);
        const { point, summary } = requireContinuousTarget(ctx.world, ctx.target, FLOCKING_SPACE_ID);
        const space = requireContinuousSpace(ctx.world, FLOCKING_SPACE_ID);
        const velocityUpdates: Record<string, ComponentValue> = {};
        const stateUpdates: Record<string, ComponentValue> = {};
        for (const result of space.queryRadius(point, radius)) {
          const velocity = ctx.world.getComponent<Point2D>(result.entityId, Velocity2D);
          const boid = ctx.world.getComponent<BoidStateComponent>(result.entityId, BoidState);
          if (!velocity || !boid) {
            continue;
          }
          const direction = outwardDirection(result.location, point, result.entityId);
          const nextVelocity = limitMagnitude({ x: velocity.x + direction.x * strength, y: velocity.y + direction.y * strength }, params.maxSpeed);
          velocityUpdates[result.entityId] = nextVelocity;
          stateUpdates[result.entityId] = { ...boid, speed: Math.hypot(nextVelocity.x, nextVelocity.y) };
        }
        const commands: Command[] = [];
        if (Object.keys(velocityUpdates).length > 0) {
          commands.push({ type: "setComponents", componentType: Velocity2D, values: velocityUpdates });
          commands.push({ type: "setComponents", componentType: BoidState, values: stateUpdates });
        }
        return {
          commands,
          targetSummary: `${Object.keys(velocityUpdates).length} boids near ${summary}`,
          visualMarker: { kind: "point", x: point.x, y: point.y, radius }
        };
      }
    }
  ],
  "forest-fire": [
    {
      id: "forestFire.igniteCell",
      templateId: "forest-fire",
      label: "Ignite Cell",
      description: "Ignite the targeted fuel cell in the abstract landscape grid.",
      targetType: "gridCell",
      supportedTemplates: ["forest-fire"],
      capabilityRequirements: ["supportsInterventions"],
      mutates: ["environment"],
      eventType: "intervention.applied",
      parameterDefinitions: [],
      documentation:
        "Applies immediately to a template-owned fuel cell. This is an exploratory grid perturbation, not real fire suppression or wildfire operations behavior.",
      build(ctx) {
        const target = requireGridCellTarget(ctx.world, ctx.target, FOREST_FIRE_SPACE_ID);
        const state = ctx.world.getComponent<ForestFireCellStateComponent>(target.entityId, ForestFireCellState);
        if (!state) {
          throw new SimulationValidationError(`Cell entity ${target.entityId} does not have ForestFireCellState`);
        }
        if (state.state !== "fuel") {
          throw new SimulationValidationError(`Target forest cell is ${state.state}; only fuel cells can be ignited`);
        }
        return {
          commands: [
            {
              type: "setComponent",
              entityId: target.entityId,
              componentType: ForestFireCellState,
              value: { state: "burning", burnAge: 0, lastChangedTick: ctx.world.tick }
            }
          ],
          targetSummary: `grid cell ${target.cell.row},${target.cell.col}`
        };
      }
    }
  ]
};

function infectEntities(
  ctx: InterventionBuildContext,
  entityIds: readonly string[],
  targetSummary: string,
  visualMarker?: InterventionCommandResult["visualMarker"]
): InterventionCommandResult {
  const recoveryTicks = integerInRange(ctx.engine.parameters.recoveryTicks, "recoveryTicks", 1, 1000);
  const commands: Command[] = [];
  for (const entityId of [...entityIds].sort((left, right) => left.localeCompare(right))) {
    const infection = ctx.world.getComponent<InfectionStateComponent>(entityId, InfectionState);
    if (!infection) {
      throw new SimulationValidationError(`Entity ${entityId} does not have InfectionState`);
    }
    if (infection.status === "recovered") {
      throw new SimulationValidationError(`Entity ${entityId} is recovered and cannot be reinfected in V1`);
    }
    if (infection.status !== "susceptible") {
      throw new SimulationValidationError(`Entity ${entityId} is already ${infection.status}`);
    }
    commands.push({
      type: "setComponent",
      entityId,
      componentType: InfectionState,
      value: { status: "infected", infectedAtTick: ctx.world.tick }
    });
    commands.push({
      type: "emitEvent",
      event: {
        id: `${ctx.requestId}:recover:${entityId}`,
        type: "epidemic.recover",
        scheduledTick: ctx.world.tick + recoveryTicks,
        payload: {},
        target: entityId,
        createdAtTick: ctx.world.tick,
        priority: 0
      }
    });
  }
  return { commands, targetSummary, visualMarker };
}

function requireSelectedEntity(world: WorldView, target: InterventionTarget): string {
  const entityId = target.entityId;
  if (!entityId) {
    throw new SimulationValidationError("Select an entity before applying this intervention");
  }
  const entity = world.getEntity(entityId);
  if (!entity || !entity.alive) {
    throw new SimulationValidationError(`Selected entity ${entityId} is missing or destroyed`);
  }
  return entityId;
}

function requireContinuousSpace(world: WorldView, spaceId: string) {
  const space = world.continuous2D(spaceId);
  if (!space) {
    throw new SimulationValidationError(`Template space ${spaceId} is not available`);
  }
  return space;
}

function requireContinuousTarget(world: WorldView, target: InterventionTarget, spaceId: string): { point: Point2D; summary: string } {
  const space = requireContinuousSpace(world, spaceId);
  if (target.point) {
    return { point: space.normalizePosition(target.point), summary: `${formatPoint(target.point)}` };
  }
  if (target.entityId) {
    const entityId = requireSelectedEntity(world, target);
    const point = space.getPosition(entityId);
    if (point) {
      return { point, summary: `selected entity ${entityId}` };
    }
  }
  throw new SimulationValidationError("Choose a world point or selected entity target before applying this intervention");
}

function requireGridCellTarget(world: WorldView, target: InterventionTarget, spaceId: string): { entityId: string; cell: { row: number; col: number } } {
  const space = world.grid2D(spaceId);
  if (!space) {
    throw new SimulationValidationError(`Template grid ${spaceId} is not available`);
  }
  const cell = target.gridCell;
  if (!cell || !Number.isInteger(cell.row) || !Number.isInteger(cell.col)) {
    throw new SimulationValidationError("Choose a grid cell before applying this intervention");
  }
  if (cell.row < 0 || cell.row >= space.rows || cell.col < 0 || cell.col >= space.cols) {
    throw new SimulationValidationError(`Grid cell ${cell.row},${cell.col} is outside ${spaceId}`);
  }
  const entityId = space.entitiesAt(cell)[0];
  if (!entityId) {
    throw new SimulationValidationError(`No entity exists at grid cell ${cell.row},${cell.col}`);
  }
  return { entityId, cell };
}

function requireOpinion(world: WorldView, entityId: string): OpinionStateComponent {
  const opinion = world.getComponent<OpinionStateComponent>(entityId, OpinionState);
  if (!opinion || !Number.isFinite(opinion.value) || !Number.isFinite(opinion.stubbornness)) {
    throw new SimulationValidationError("Selected entity does not have a valid OpinionState");
  }
  return opinion;
}

function requireBoid(world: WorldView, entityId: string): BoidStateComponent {
  const boid = world.getComponent<BoidStateComponent>(entityId, BoidState);
  if (!boid) {
    throw new SimulationValidationError("Selected entity is not a boid");
  }
  return boid;
}

function requirePointComponent(world: WorldView, entityId: string, componentType: string): Point2D {
  const value = world.getComponent<Point2D>(entityId, componentType);
  if (!isFinitePoint(value)) {
    throw new SimulationValidationError(`Selected entity does not have a valid ${componentType}`);
  }
  return value;
}

function boidVelocityCommands(entityId: string, velocity: Point2D, boid: BoidStateComponent): Command[] {
  return [
    { type: "setComponent", entityId, componentType: Velocity2D, value: velocity },
    { type: "setComponent", entityId, componentType: BoidState, value: { ...boid, speed: Math.hypot(velocity.x, velocity.y) } }
  ];
}

function offsetPoint(space: ReturnType<typeof requireContinuousSpace>, point: Point2D, index: number, count: number): Point2D {
  if (count === 1) {
    return space.normalizePosition(point);
  }
  const angle = (index / count) * Math.PI * 2;
  const distance = 1.2 + index * 0.08;
  return space.normalizePosition({ x: point.x + Math.cos(angle) * distance, y: point.y + Math.sin(angle) * distance });
}

function outwardDirection(location: Point2D, origin: Point2D, entityId: string): Point2D {
  const dx = location.x - origin.x;
  const dy = location.y - origin.y;
  const magnitude = Math.hypot(dx, dy);
  if (magnitude > 0.0001) {
    return { x: dx / magnitude, y: dy / magnitude };
  }
  const angle = stableAngle(entityId);
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function limitMagnitude(vector: Point2D, max: number): Point2D {
  const magnitude = Math.hypot(vector.x, vector.y);
  if (magnitude <= max || magnitude === 0) {
    return vector;
  }
  return { x: (vector.x / magnitude) * max, y: (vector.y / magnitude) * max };
}

function vectorParam(key: string, label: string, defaultValue: number): ParameterDefinition {
  return {
    key,
    label,
    type: "number",
    defaultValue,
    min: -10,
    max: 10,
    step: 0.1,
    description: "Finite vector component.",
    liveUpdate: true
  };
}

function vectorStrengthParam(defaultValue: number): ParameterDefinition {
  return {
    key: "strength",
    label: "Strength",
    type: "number",
    defaultValue,
    min: 0.01,
    max: 10,
    step: 0.1,
    description: "Impulse strength.",
    liveUpdate: true
  };
}

function integerInRange(value: JsonValue | undefined, key: string, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new SimulationValidationError(`${key} must be an integer from ${min} to ${max}`);
  }
  return parsed;
}

function positiveNumber(value: JsonValue | undefined, key: string): number {
  const parsed = positiveFinite(value, key);
  if (parsed <= 0) {
    throw new SimulationValidationError(`${key} must be positive`);
  }
  return parsed;
}

function positiveFinite(value: JsonValue | undefined, key: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new SimulationValidationError(`${key} must be finite`);
  }
  return parsed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isFinitePoint(value: unknown): value is Point2D {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Point2D).x === "number" &&
    Number.isFinite((value as Point2D).x) &&
    typeof (value as Point2D).y === "number" &&
    Number.isFinite((value as Point2D).y)
  );
}

function stableAngle(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return (hash / 0xffffffff) * Math.PI * 2;
}

function formatPoint(point: Point2D): string {
  return `${point.x.toFixed(1)}, ${point.y.toFixed(1)}`;
}
