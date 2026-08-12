import type { ParameterValues } from "../../simulation";
import { decodeEntityId, type RenderFramePacket } from "../../simulation/runtime";
import type {
  ImmersiveLensData,
  ImmersiveSceneEntity,
  ImmersiveSceneRelationship,
  WorldSceneAdapter
} from "./types";

export function createFlockingFrameSceneAdapter(frame: RenderFramePacket): WorldSceneAdapter {
  if (frame.templateId !== "flocking-boids") {
    throw new Error(`Immersive Flocking frame adapter cannot read template ${frame.templateId}`);
  }
  const bounds = { width: frame.worldWidth, height: frame.worldHeight };
  const parameters: Readonly<ParameterValues> = Object.freeze({
    boundaryMode: frame.boundaryMode,
    perceptionRadius: frame.perceptionRadius
  });
  let entities: readonly ImmersiveSceneEntity[] | null = null;
  let entityById: Map<string, ImmersiveSceneEntity> | null = null;
  let relationshipCache: { entityId: string; relationships: readonly ImmersiveSceneRelationship[] } | null = null;
  let lensData: ImmersiveLensData | null = null;

  function getEntities(): readonly ImmersiveSceneEntity[] {
    if (entities) {
      return entities;
    }
    const projected: ImmersiveSceneEntity[] = [];
    for (let index = 0; index < frame.entityCount; index += 1) {
      const idNumber = frame.entityIds[index]!;
      const vectorIndex = index * 2;
      const velocityX = frame.velocities[vectorIndex] ?? 0;
      const velocityY = frame.velocities[vectorIndex + 1] ?? 0;
      const speed = Math.hypot(velocityX, velocityY);
      const headingRadians = speed > 0 ? Math.atan2(velocityY, velocityX) : 0;
      const group = groupStyle(frame.groupCodes[index] ?? 0);
      const neighborCount = frame.neighborCounts[index] ?? 0;
      projected.push({
        id: decodeEntityId(idNumber),
        label: `Boid ${idNumber}`,
        x: frame.positions[vectorIndex] ?? 0,
        y: frame.positions[vectorIndex + 1] ?? 0,
        velocityX,
        velocityY,
        speed,
        headingRadians,
        headingDegrees: normalizeDegrees(headingRadians * 180 / Math.PI),
        neighborCount,
        localDensity: frame.localDensities[index] ?? 0,
        fill: group.fill,
        stroke: neighborCount > 0 ? "#d8ff3e" : "#8b8f89",
        radius: 3.8 + Math.min(1.5, speed / 4)
      });
    }
    entities = projected;
    entityById = new Map(projected.map((entity) => [entity.id, entity]));
    return entities;
  }

  function getRelationships(entityId: string | null): readonly ImmersiveSceneRelationship[] {
    if (!entityId) {
      return [];
    }
    if (relationshipCache?.entityId === entityId) {
      return relationshipCache.relationships;
    }
    const source = entityMap().get(entityId);
    if (!source) {
      return [];
    }
    const selected = frame.selectedDetail;
    const relationships = selected?.entityId === frameIdForEntity(entityId)
      ? relationshipsFromSelectedDetail(source, selected)
      : relationshipsFromFrame(source, getEntities());
    relationshipCache = { entityId, relationships };
    return relationships;
  }

  return {
    templateId: frame.templateId,
    tick: frame.tick,
    parameters,
    getBounds: () => bounds,
    getEntities,
    getRelationships,
    getInspectableState(entityId) {
      const entity = entityId ? entityMap().get(entityId) : undefined;
      if (!entity) {
        return null;
      }
      return {
        entity,
        relationshipCount: getRelationships(entity.id).length,
        perceptionRadius: frame.perceptionRadius
      };
    },
    getSelectionGeometry(entityId) {
      const entity = entityId ? entityMap().get(entityId) : undefined;
      if (!entity) {
        return null;
      }
      return {
        entityId: entity.id,
        x: entity.x,
        y: entity.y,
        headingX: entity.speed > 0 ? entity.velocityX / entity.speed : 0,
        headingY: entity.speed > 0 ? entity.velocityY / entity.speed : 0,
        interactionRadius: frame.perceptionRadius
      };
    },
    getAlignment: () => frame.alignment,
    getLensData() {
      lensData ??= {
        alignment: frame.alignment,
        vectors: getEntities().map((entity) => ({
          entityId: entity.id,
          x: entity.x,
          y: entity.y,
          headingX: entity.speed > 0 ? entity.velocityX / entity.speed : 0,
          headingY: entity.speed > 0 ? entity.velocityY / entity.speed : 0
        }))
      };
      return lensData;
    },
    getRuntimeSignature: () => frame.runtimeSignature
  };

  function entityMap(): Map<string, ImmersiveSceneEntity> {
    getEntities();
    return entityById!;
  }

  function relationshipsFromSelectedDetail(
    source: ImmersiveSceneEntity,
    selected: NonNullable<RenderFramePacket["selectedDetail"]>
  ): readonly ImmersiveSceneRelationship[] {
    const relationships: ImmersiveSceneRelationship[] = [];
    for (let index = 0; index < selected.neighborIds.length; index += 1) {
      relationships.push({
        sourceId: source.id,
        targetId: decodeEntityId(selected.neighborIds[index]!),
        distance: selected.neighborDistances[index] ?? 0,
        sourceX: source.x,
        sourceY: source.y,
        targetX: source.x + (selected.neighborOffsets[index * 2] ?? 0),
        targetY: source.y + (selected.neighborOffsets[index * 2 + 1] ?? 0)
      });
    }
    return relationships;
  }

  function relationshipsFromFrame(
    source: ImmersiveSceneEntity,
    candidates: readonly ImmersiveSceneEntity[]
  ): readonly ImmersiveSceneRelationship[] {
    const relationships: ImmersiveSceneRelationship[] = [];
    for (const target of candidates) {
      if (target.id === source.id) {
        continue;
      }
      const offset = minimumImageOffset(source, target, bounds, frame.boundaryMode === "wrap");
      const distance = Math.hypot(offset.x, offset.y);
      if (distance <= frame.perceptionRadius) {
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
    return relationships.sort((left, right) => left.distance - right.distance || left.targetId.localeCompare(right.targetId));
  }
}

export function createEmptyFlockingFrameSceneAdapter(): WorldSceneAdapter {
  return createFlockingFrameSceneAdapter({
    schemaVersion: "1",
    publicationId: 1,
    templateId: "flocking-boids",
    generation: 0,
    runId: "initializing",
    tick: 0,
    time: 0,
    entityCount: 0,
    entityIds: new Uint32Array(),
    positions: new Float32Array(),
    velocities: new Float32Array(),
    neighborCounts: new Uint16Array(),
    localDensities: new Float32Array(),
    groupCodes: new Uint8Array(),
    worldWidth: 100,
    worldHeight: 100,
    boundaryMode: "wrap",
    perceptionRadius: 30,
    alignment: null,
    runtimeSignature: "0:0:initializing"
  });
}

function frameIdForEntity(entityId: string): number {
  const match = /^e(\d+)$/.exec(entityId);
  return match?.[1] ? Number.parseInt(match[1], 10) : -1;
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

function groupStyle(code: number): { fill: string } {
  if (code === 1) return { fill: "#d8ff3e" };
  if (code === 2) return { fill: "#6c72ff" };
  if (code === 3) return { fill: "#ff4a2e" };
  if (code === 4) return { fill: "#c34dff" };
  return { fill: "#e8efe0" };
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}
