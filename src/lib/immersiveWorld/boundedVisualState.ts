import type { ImmersiveSceneEntity } from "./types";

export interface ImmersiveTrailPoint {
  x: number;
  y: number;
  tick: number;
}

export type ImmersiveVisualEffectKind = "selection";

export interface ImmersiveVisualEffect {
  id: number;
  kind: ImmersiveVisualEffectKind;
  x: number;
  y: number;
  startedAt: number;
  durationMs: number;
}

export class BoundedTrailBuffer {
  readonly maxEntities: number;
  readonly maxPointsPerEntity: number;
  private readonly trails = new Map<string, ImmersiveTrailPoint[]>();

  constructor(maxEntities: number, maxPointsPerEntity: number) {
    if (!Number.isInteger(maxEntities) || maxEntities <= 0 || !Number.isInteger(maxPointsPerEntity) || maxPointsPerEntity <= 0) {
      throw new Error("Trail bounds must be positive integers");
    }
    this.maxEntities = maxEntities;
    this.maxPointsPerEntity = maxPointsPerEntity;
  }

  update(
    entities: readonly ImmersiveSceneEntity[],
    trackedIds: readonly string[],
    tick: number,
    pointLimit = this.maxPointsPerEntity
  ): void {
    if (!Number.isInteger(pointLimit) || pointLimit <= 0) {
      throw new Error("Active trail point bound must be a positive integer");
    }
    const activePointLimit = Math.min(pointLimit, this.maxPointsPerEntity);
    const allowedIds = new Set(trackedIds.slice(0, this.maxEntities));
    if (allowedIds.size === 0) {
      this.trails.clear();
      return;
    }
    for (const id of this.trails.keys()) {
      if (!allowedIds.has(id)) {
        this.trails.delete(id);
      }
    }
    const foundIds = new Set<string>();
    for (const entity of entities) {
      if (!allowedIds.has(entity.id)) {
        continue;
      }
      foundIds.add(entity.id);
      const trail = this.trails.get(entity.id) ?? [];
      const previous = trail.at(-1);
      if (previous?.tick === tick) {
        continue;
      }
      trail.push({ x: entity.x, y: entity.y, tick });
      if (trail.length > activePointLimit) {
        trail.splice(0, trail.length - activePointLimit);
      }
      this.trails.set(entity.id, trail);
    }
    for (const id of allowedIds) {
      if (!foundIds.has(id)) {
        this.trails.delete(id);
      }
    }
  }

  entries(): readonly [string, readonly ImmersiveTrailPoint[]][] {
    return [...this.trails.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, points]) => [id, [...points]]);
  }

  pointCount(): number {
    let total = 0;
    for (const points of this.trails.values()) {
      total += points.length;
    }
    return total;
  }

  forEach(visitor: (entityId: string, points: readonly ImmersiveTrailPoint[]) => void): void {
    for (const [entityId, points] of this.trails) {
      visitor(entityId, points);
    }
  }

  clear(): void {
    this.trails.clear();
  }
}

export class BoundedVisualEffectBuffer {
  readonly maxEffects: number;
  private effects: ImmersiveVisualEffect[] = [];
  private nextId = 1;

  constructor(maxEffects: number) {
    if (!Number.isInteger(maxEffects) || maxEffects <= 0) {
      throw new Error("Effect bound must be a positive integer");
    }
    this.maxEffects = maxEffects;
  }

  add(effect: Omit<ImmersiveVisualEffect, "id">): ImmersiveVisualEffect {
    const created = { ...effect, id: this.nextId };
    this.nextId += 1;
    this.effects = [...this.effects, created].slice(-this.maxEffects);
    return created;
  }

  active(at: number): readonly ImmersiveVisualEffect[] {
    this.effects = this.effects.filter((effect) => at - effect.startedAt <= effect.durationMs);
    return this.effects;
  }

  count(): number {
    return this.effects.length;
  }

  clear(): void {
    this.effects = [];
  }
}
