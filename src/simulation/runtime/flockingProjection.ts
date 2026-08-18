import type { SimulationEngine } from "../kernel/SimulationEngine";
import type { Point2D } from "../spaces/Space";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import {
  BoidGroup,
  BoidState,
  FLOCKING_SPACE_ID,
  type BoidGroupComponent,
  type BoidStateComponent
} from "../templates/flocking.template";
import { Position2D, Velocity2D } from "../templates/epidemic.template";
import { SimulationValidationError } from "../kernel/Errors";
import {
  maxRenderFrameEntities,
  maxSelectedNeighborCount,
  type RenderFramePacket,
  type RuntimeIdentity,
  type SelectedRenderDetail,
  type SelectedUIProjection
} from "./types";

export function createFlockingRenderFramePacket(
  engine: SimulationEngine,
  identity: RuntimeIdentity,
  selectedEntityId: string | null,
  publicationId = 1
): RenderFramePacket {
  if (engine.template.id !== "flocking-boids") {
    throw new SimulationValidationError(`No PERF1 frame projector is registered for template ${engine.template.id}`);
  }
  const entityIds = engine.world.view().entitiesWith([Position2D, Velocity2D, BoidState]);
  if (entityIds.length > maxRenderFrameEntities) {
    throw new SimulationValidationError(`Render frame cannot contain more than ${maxRenderFrameEntities} entities`);
  }
  const space = engine.world.getSpace(FLOCKING_SPACE_ID);
  if (!(space instanceof Continuous2DSpace)) {
    throw new SimulationValidationError("Flocking render projection requires its continuous space");
  }

  const count = entityIds.length;
  const encodedIds = new Uint32Array(count);
  const positions = new Float32Array(count * 2);
  const velocities = new Float32Array(count * 2);
  const neighborCounts = new Uint16Array(count);
  const groupCodes = new Uint8Array(count);
  let hash = mixHash(2166136261, engine.world.tick);

  for (let index = 0; index < count; index += 1) {
    const entityId = entityIds[index]!;
    const position = requireVector(engine.world.componentStore.getMutable<Point2D>(entityId, Position2D), entityId, Position2D);
    const velocity = requireVector(engine.world.componentStore.getMutable<Point2D>(entityId, Velocity2D), entityId, Velocity2D);
    const state = engine.world.componentStore.getMutable<BoidStateComponent>(entityId, BoidState);
    const group = engine.world.componentStore.getMutable<BoidGroupComponent>(entityId, BoidGroup);
    const encodedId = encodeEntityId(entityId);
    const vectorIndex = index * 2;
    encodedIds[index] = encodedId;
    positions[vectorIndex] = position.x;
    positions[vectorIndex + 1] = position.y;
    velocities[vectorIndex] = velocity.x;
    velocities[vectorIndex + 1] = velocity.y;
    neighborCounts[index] = boundedUint16(state?.neighborCount);
    groupCodes[index] = boundedGroupCode(group?.groupIndex);
    hash = mixHash(hash, Math.round(position.x * 10_000));
    hash = mixHash(hash, Math.round(position.y * 10_000));
    hash = mixHash(hash, Math.round(velocity.x * 10_000));
    hash = mixHash(hash, Math.round(velocity.y * 10_000));
  }

  const alignment = latestAlignment(engine);
  hash = mixHash(hash, Math.round((alignment ?? -1) * 1_000_000));
  const selectedDetail = selectedEntityId
    ? createSelectedDetail(engine, entityIds, selectedEntityId, space, finiteParameter(engine, "perceptionRadius"))
    : undefined;

  return {
    schemaVersion: "1",
    projectionKind: "flocking-v1",
    publicationId,
    templateId: engine.template.id,
    ...identity,
    tick: engine.world.tick,
    time: engine.world.time,
    entityCount: count,
    entityIds: encodedIds,
    positions,
    velocities,
    neighborCounts,
    groupCodes,
    worldWidth: space.width,
    worldHeight: space.height,
    boundaryMode: space.boundaryMode,
    perceptionRadius: finiteParameter(engine, "perceptionRadius"),
    alignment,
    runtimeSignature: `${engine.world.tick}:${count}:${(hash >>> 0).toString(36)}`,
    ...(selectedDetail ? { selectedDetail } : {})
  };
}

export function createFlockingSelectedUIProjection(
  engine: SimulationEngine,
  selectedEntityId: string | null,
  selectedDetail: SelectedRenderDetail | undefined
): SelectedUIProjection | null {
  if (!selectedEntityId) {
    return null;
  }
  if (!engine.world.entityStore.get(selectedEntityId)?.alive) {
    return null;
  }
  const position = engine.world.componentStore.get<Point2D>(selectedEntityId, Position2D);
  const velocity = engine.world.componentStore.get<Point2D>(selectedEntityId, Velocity2D);
  const state = engine.world.componentStore.get<BoidStateComponent>(selectedEntityId, BoidState);
  if (!position || !velocity || !state) {
    return null;
  }
  const encodedId = encodeEntityId(selectedEntityId);
  const heading = Math.atan2(velocity.y, velocity.x) * 180 / Math.PI;
  return {
    entityId: encodedId,
    label: `Boid ${encodedId}`,
    x: position.x,
    y: position.y,
    velocityX: velocity.x,
    velocityY: velocity.y,
    speed: Math.hypot(velocity.x, velocity.y),
    headingDegrees: ((heading % 360) + 360) % 360,
    neighborCount: boundedUint16(state.neighborCount),
    localDensity: finiteNonNegative(state.localDensity),
    currentProximityCount: selectedDetail?.entityId === encodedId
      ? selectedDetail.neighborIds.length
      : null
  };
}

export function renderFrameTransferables(frame: RenderFramePacket): Transferable[] {
  const transferables: Transferable[] = [
    frame.entityIds.buffer,
    frame.positions.buffer,
    frame.velocities.buffer,
    frame.neighborCounts.buffer,
    frame.groupCodes.buffer
  ];
  if (frame.selectedDetail) {
    transferables.push(
      frame.selectedDetail.neighborIds.buffer,
      frame.selectedDetail.neighborOffsets.buffer,
      frame.selectedDetail.neighborDistances.buffer
    );
  }
  return transferables;
}

export function decodeEntityId(value: number): string {
  if (!Number.isInteger(value) || value <= 0 || value > 0xffff_ffff) {
    throw new SimulationValidationError("Render-frame entity id must be a positive uint32 value");
  }
  return `e${value.toString().padStart(6, "0")}`;
}

function createSelectedDetail(
  engine: SimulationEngine,
  entityIds: readonly string[],
  selectedEntityId: string,
  space: Continuous2DSpace,
  perceptionRadius: number
): SelectedRenderDetail | undefined {
  const source = engine.world.componentStore.getMutable<Point2D>(selectedEntityId, Position2D);
  if (!source || !entityIds.includes(selectedEntityId)) {
    return undefined;
  }
  const candidates: Array<{ id: number; offset: Point2D; distance: number }> = [];
  for (const entityId of entityIds) {
    if (entityId === selectedEntityId) {
      continue;
    }
    const target = engine.world.componentStore.getMutable<Point2D>(entityId, Position2D);
    if (!target) {
      continue;
    }
    const offset = minimumImageOffset(source, target, space);
    const distance = Math.hypot(offset.x, offset.y);
    if (distance <= perceptionRadius) {
      candidates.push({ id: encodeEntityId(entityId), offset, distance });
    }
  }
  candidates.sort((left, right) => left.distance - right.distance || left.id - right.id);
  if (candidates.length > maxSelectedNeighborCount) {
    throw new SimulationValidationError(`Selected detail cannot contain more than ${maxSelectedNeighborCount} neighbors`);
  }
  const neighborIds = new Uint32Array(candidates.length);
  const neighborOffsets = new Float32Array(candidates.length * 2);
  const neighborDistances = new Float32Array(candidates.length);
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]!;
    neighborIds[index] = candidate.id;
    neighborOffsets[index * 2] = candidate.offset.x;
    neighborOffsets[index * 2 + 1] = candidate.offset.y;
    neighborDistances[index] = candidate.distance;
  }
  return {
    entityId: encodeEntityId(selectedEntityId),
    neighborIds,
    neighborOffsets,
    neighborDistances
  };
}

function minimumImageOffset(from: Point2D, to: Point2D, space: Continuous2DSpace): Point2D {
  let x = to.x - from.x;
  let y = to.y - from.y;
  if (space.boundaryMode === "wrap" && Math.abs(x) > space.width / 2) {
    x -= Math.sign(x) * space.width;
  }
  if (space.boundaryMode === "wrap" && Math.abs(y) > space.height / 2) {
    y -= Math.sign(y) * space.height;
  }
  return { x, y };
}

function encodeEntityId(entityId: string): number {
  const match = /^e(\d{1,10})$/.exec(entityId);
  const value = match?.[1] ? Number.parseInt(match[1], 10) : Number.NaN;
  if (!Number.isSafeInteger(value) || value <= 0 || value > 0xffff_ffff) {
    throw new SimulationValidationError(`Flocking render projection cannot encode entity id ${entityId}`);
  }
  return value;
}

function requireVector(value: Point2D | undefined, entityId: string, componentType: string): Point2D {
  if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.y)) {
    throw new SimulationValidationError(`Entity ${entityId} has no finite ${componentType} projection`);
  }
  return value;
}

function finiteParameter(engine: SimulationEngine, key: string): number {
  const value = engine.parameters[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new SimulationValidationError(`Flocking render projection requires finite parameter ${key}`);
  }
  return value;
}

function latestAlignment(engine: SimulationEngine): number | null {
  const value = engine.metrics.latestRecord()?.values.alignmentScore;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function boundedUint16(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? Math.min(0xffff, value)
    : 0;
}

function finiteNonNegative(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function boundedGroupCode(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 4 ? value : 0;
}

function mixHash(hash: number, value: number): number {
  hash ^= value;
  return Math.imul(hash, 16777619);
}
