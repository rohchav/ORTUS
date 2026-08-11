import {
  BoidState,
  type BoidStateComponent
} from "../../simulation/templates/flocking.template";
import type { ParameterValues, SimulationSnapshotView } from "../../simulation";
import {
  componentForEntity,
  getContinuousWorld,
  getVelocity,
  renderAgents
} from "../templateVisuals";
import type {
  ImmersiveLensData,
  ImmersiveSceneEntity,
  ImmersiveSceneRelationship,
  WorldSceneAdapter
} from "./types";

export function createFlockingWorldSceneAdapter(
  snapshot: SimulationSnapshotView,
  parameters: ParameterValues
): WorldSceneAdapter {
  if (snapshot.templateId !== "flocking-boids") {
    throw new Error(`Immersive Flocking adapter cannot read template ${snapshot.templateId}`);
  }
  const bounds = getContinuousWorld(snapshot);
  const perceptionRadius = finiteParameter(parameters, "perceptionRadius");
  const boundaryMode = parameters.boundaryMode === "wrap" ? "wrap" : "bounded";
  const entities = renderAgents(snapshot).map((agent): ImmersiveSceneEntity => {
    const velocity = getVelocity(snapshot, agent.id) ?? { x: 0, y: 0 };
    const speed = Math.hypot(velocity.x, velocity.y);
    const state = componentForEntity<BoidStateComponent>(snapshot, agent.id, BoidState);
    const headingRadians = speed > 0 ? Math.atan2(velocity.y, velocity.x) : 0;
    return {
      id: agent.id,
      label: agent.entity.label ?? agent.label,
      x: agent.x,
      y: agent.y,
      velocityX: velocity.x,
      velocityY: velocity.y,
      speed,
      headingRadians,
      headingDegrees: normalizeDegrees((headingRadians * 180) / Math.PI),
      neighborCount: finiteNonNegativeInteger(state?.neighborCount),
      localDensity: finiteNonNegative(state?.localDensity),
      fill: agent.fill,
      stroke: agent.stroke,
      radius: agent.radius
    };
  });
  const entityById = new Map<string, ImmersiveSceneEntity>();
  for (const entity of entities) {
    entityById.set(entity.id, entity);
  }
  const latestMetrics = snapshot.metricsHistory.at(-1)?.values;
  const alignment = finiteOrNull(latestMetrics?.alignmentScore);

  function getRelationships(entityId: string | null): readonly ImmersiveSceneRelationship[] {
    if (!entityId) {
      return [];
    }
    const source = entityById.get(entityId);
    if (!source) {
      return [];
    }
    const relationships: ImmersiveSceneRelationship[] = [];
    for (const target of entities) {
      if (target.id === source.id) {
        continue;
      }
      const offset = minimumImageOffset(source, target, bounds, boundaryMode === "wrap");
      const distance = Math.hypot(offset.x, offset.y);
      if (distance <= perceptionRadius) {
        relationships.push({
          sourceId: source.id,
          targetId: target.id,
          distance,
          sourceX: source.x,
          sourceY: source.y,
          targetX: source.x + offset.x,
          targetY: source.y + offset.y
        });
      }
    }
    return relationships.sort(
      (left, right) => left.distance - right.distance || left.targetId.localeCompare(right.targetId)
    );
  }

  let lensData: ImmersiveLensData | null = null;
  let signature: string | null = null;

  return {
    templateId: snapshot.templateId,
    tick: snapshot.tick,
    parameters,
    getBounds: () => bounds,
    getEntities: () => entities,
    getRelationships,
    getInspectableState(entityId) {
      const entity = entityId ? entityById.get(entityId) : undefined;
      if (!entity) {
        return null;
      }
      return {
        entity,
        relationshipCount: getRelationships(entity.id).length,
        perceptionRadius
      };
    },
    getSelectionGeometry(entityId) {
      const entity = entityId ? entityById.get(entityId) : undefined;
      if (!entity) {
        return null;
      }
      return {
        entityId: entity.id,
        x: entity.x,
        y: entity.y,
        headingX: entity.speed > 0 ? entity.velocityX / entity.speed : 0,
        headingY: entity.speed > 0 ? entity.velocityY / entity.speed : 0,
        interactionRadius: perceptionRadius
      };
    },
    getAlignment: () => alignment,
    getLensData() {
      lensData ??= {
        alignment,
        vectors: entities.map((entity) => ({
          entityId: entity.id,
          x: entity.x,
          y: entity.y,
          headingX: entity.speed > 0 ? entity.velocityX / entity.speed : 0,
          headingY: entity.speed > 0 ? entity.velocityY / entity.speed : 0
        }))
      };
      return lensData;
    },
    getRuntimeSignature() {
      signature ??= runtimeSignature(snapshot.tick, entities, alignment);
      return signature;
    }
  };
}

function minimumImageOffset(
  source: { x: number; y: number },
  target: { x: number; y: number },
  bounds: { width: number; height: number },
  wrap: boolean
): { x: number; y: number } {
  let x = target.x - source.x;
  let y = target.y - source.y;
  if (wrap && Math.abs(x) > bounds.width / 2) {
    x -= Math.sign(x) * bounds.width;
  }
  if (wrap && Math.abs(y) > bounds.height / 2) {
    y -= Math.sign(y) * bounds.height;
  }
  return { x, y };
}

function runtimeSignature(tick: number, entities: readonly ImmersiveSceneEntity[], alignment: number | null): string {
  let hash = 2166136261;
  hash = mixHash(hash, tick);
  hash = mixHash(hash, Math.round((alignment ?? -1) * 1_000_000));
  for (const entity of entities) {
    hash = mixHash(hash, Math.round(entity.x * 10_000));
    hash = mixHash(hash, Math.round(entity.y * 10_000));
    hash = mixHash(hash, Math.round(entity.velocityX * 10_000));
    hash = mixHash(hash, Math.round(entity.velocityY * 10_000));
  }
  return `${tick}:${entities.length}:${(hash >>> 0).toString(36)}`;
}

function mixHash(hash: number, value: number): number {
  hash ^= value;
  return Math.imul(hash, 16777619);
}

function finiteParameter(parameters: ParameterValues, key: string): number {
  const value = parameters[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`Immersive Flocking adapter requires a finite ${key} parameter`);
  }
  return value;
}

function finiteNonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function finiteNonNegative(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}
