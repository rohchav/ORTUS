import type { EntityId, SerializedSpace } from "../kernel/types";
import { SimulationInvariantError, SimulationValidationError } from "../kernel/Errors";
import { ContinuousSpatialHashIndex } from "../spatialIndex";
import type { BoundaryMode, NeighborResult, Point2D, ReadonlySpace, Space } from "./Space";
import { isPoint2D } from "./Space";

export interface Continuous2DQueryDiagnostics {
  queryCount: number;
  allPairsQueries: number;
  spatialIndexQueries: number;
  spatialIndexBuilds: number;
  distanceChecks: number;
  spatialIndexCandidateChecks: number;
  spatialIndexVisitedCells: number;
}

export function continuous2DQueryDiagnosticsDelta(
  before: Continuous2DQueryDiagnostics,
  after: Continuous2DQueryDiagnostics
): Continuous2DQueryDiagnostics {
  return {
    queryCount: Math.max(0, after.queryCount - before.queryCount),
    allPairsQueries: Math.max(0, after.allPairsQueries - before.allPairsQueries),
    spatialIndexQueries: Math.max(0, after.spatialIndexQueries - before.spatialIndexQueries),
    spatialIndexBuilds: Math.max(0, after.spatialIndexBuilds - before.spatialIndexBuilds),
    distanceChecks: Math.max(0, after.distanceChecks - before.distanceChecks),
    spatialIndexCandidateChecks: Math.max(0, after.spatialIndexCandidateChecks - before.spatialIndexCandidateChecks),
    spatialIndexVisitedCells: Math.max(0, after.spatialIndexVisitedCells - before.spatialIndexVisitedCells)
  };
}

export interface Continuous2DSpaceReader extends ReadonlySpace<Point2D> {
  readonly width: number;
  readonly height: number;
  readonly boundaryMode: BoundaryMode;
  getPosition(entityId: EntityId): Point2D | undefined;
  queryRadius(position: Point2D, radius: number): NeighborResult<Point2D>[];
  queryNeighbors(entityId: EntityId, radiusOrOptions?: number | { radius?: number }): NeighborResult<Point2D>[];
  queryDiagnostics(): Continuous2DQueryDiagnostics;
  normalizePosition(position: Point2D): Point2D;
}

export interface Continuous2DSpaceOptions {
  id: string;
  width: number;
  height: number;
  boundaryMode: BoundaryMode;
}

export class Continuous2DSpace implements Space<Point2D> {
  readonly id: string;
  readonly kind = "continuous2d" as const;
  readonly width: number;
  readonly height: number;
  readonly boundaryMode: BoundaryMode;
  private readonly positions = new Map<EntityId, Point2D>();
  private positionVersion = 0;
  private spatialIndexCache:
    | {
        version: number;
        cellSize: number;
        index: ContinuousSpatialHashIndex;
      }
    | undefined;
  private diagnostics: Continuous2DQueryDiagnostics = emptyDiagnostics();

  constructor(options: Continuous2DSpaceOptions) {
    if (!Number.isFinite(options.width) || options.width <= 0 || !Number.isFinite(options.height) || options.height <= 0) {
      throw new SimulationValidationError("Continuous2DSpace dimensions must be positive finite numbers");
    }
    this.id = options.id;
    this.width = options.width;
    this.height = options.height;
    this.boundaryMode = options.boundaryMode;
  }

  addEntity(entityId: EntityId, location: Point2D): void {
    this.assertPoint(location);
    if (this.positions.has(entityId)) {
      throw new SimulationInvariantError(`Entity ${entityId} already exists in space ${this.id}`, { entityId });
    }
    this.positions.set(entityId, this.normalizePosition(location));
    this.markPositionsChanged();
  }

  removeEntity(entityId: EntityId): void {
    if (this.positions.delete(entityId)) {
      this.markPositionsChanged();
    }
  }

  moveEntity(entityId: EntityId, location: Point2D): void {
    this.setPosition(entityId, location);
  }

  setPosition(entityId: EntityId, position: Point2D): void {
    this.assertPoint(position);
    if (!this.positions.has(entityId)) {
      throw new SimulationInvariantError(`Entity ${entityId} is not in space ${this.id}`, { entityId });
    }
    this.positions.set(entityId, this.normalizePosition(position));
    this.markPositionsChanged();
  }

  getLocation(entityId: EntityId): Point2D | undefined {
    return this.getPosition(entityId);
  }

  getPosition(entityId: EntityId): Point2D | undefined {
    const position = this.positions.get(entityId);
    return position ? clonePoint(position) : undefined;
  }

  move(entityId: EntityId, delta: Point2D): void {
    this.assertPoint(delta);
    const current = this.positions.get(entityId);
    if (!current) {
      throw new SimulationInvariantError(`Entity ${entityId} is not in space ${this.id}`, { entityId });
    }
    this.positions.set(entityId, this.normalizePosition({ x: current.x + delta.x, y: current.y + delta.y }));
    this.markPositionsChanged();
  }

  queryRadius(position: Point2D, radius: number): NeighborResult<Point2D>[] {
    this.assertPoint(position);
    if (!Number.isFinite(radius) || radius < 0) {
      throw new SimulationValidationError("Radius must be a nonnegative finite number");
    }
    return this.queryRadiusLinear(position, radius);
  }

  queryNeighbors(entityId: EntityId, radiusOrOptions: number | { radius?: number } = Number.POSITIVE_INFINITY): NeighborResult<Point2D>[] {
    const position = this.positions.get(entityId);
    if (!position) {
      throw new SimulationInvariantError(`Entity ${entityId} is not in space ${this.id}`, { entityId });
    }
    const radius = typeof radiusOrOptions === "number" ? radiusOrOptions : radiusOrOptions.radius ?? Number.POSITIVE_INFINITY;
    if (Number.isNaN(radius) || radius < 0) {
      throw new SimulationValidationError("Radius must be a nonnegative finite number or positive infinity");
    }
    if (this.shouldUseSpatialIndex(radius)) {
      const index = this.spatialIndexFor(radius);
      const query = index.queryRadius(position.x, position.y, radius, { excludeId: entityId });
      this.diagnostics.queryCount += 1;
      this.diagnostics.spatialIndexQueries += 1;
      this.diagnostics.distanceChecks += query.distanceChecks;
      this.diagnostics.spatialIndexCandidateChecks += query.distanceChecks;
      this.diagnostics.spatialIndexVisitedCells += query.visitedCellCount;
      return query.results.map((result) => ({
        entityId: result.id,
        location: { x: result.x, y: result.y },
        distance: result.distance
      }));
    }
    return this.queryRadiusLinear(position, radius, { excludeId: entityId });
  }

  queryDiagnostics(): Continuous2DQueryDiagnostics {
    return { ...this.diagnostics };
  }

  private queryRadiusLinear(
    position: Point2D,
    radius: number,
    options: { excludeId?: EntityId } = {}
  ): NeighborResult<Point2D>[] {
    if ((Number.isNaN(radius) || radius < 0) && radius !== Number.POSITIVE_INFINITY) {
      throw new SimulationValidationError("Radius must be a nonnegative finite number or positive infinity");
    }
    const results: NeighborResult<Point2D>[] = [];
    const radiusSquared = radius * radius;
    let distanceChecks = 0;
    for (const [entityId, candidate] of this.positions.entries()) {
      if (options.excludeId !== undefined && entityId === options.excludeId) {
        continue;
      }
      const distanceSquared = this.distanceSquared(position, candidate);
      distanceChecks += 1;
      if (distanceSquared <= radiusSquared) {
        results.push({ entityId, location: clonePoint(candidate), distance: Math.sqrt(distanceSquared) });
      }
    }
    this.diagnostics.queryCount += 1;
    this.diagnostics.allPairsQueries += 1;
    this.diagnostics.distanceChecks += distanceChecks;
    return results.sort((left, right) => (left.distance ?? 0) - (right.distance ?? 0) || left.entityId.localeCompare(right.entityId));
  }

  enforceBounds(entityId: EntityId): Point2D {
    const position = this.positions.get(entityId);
    if (!position) {
      throw new SimulationInvariantError(`Entity ${entityId} is not in space ${this.id}`, { entityId });
    }
    const normalized = this.normalizePosition(position);
    this.positions.set(entityId, normalized);
    this.markPositionsChanged();
    return clonePoint(normalized);
  }

  normalizePosition(position: Point2D): Point2D {
    this.assertPoint(position);
    return {
      x: this.normalizeAxis(position.x, this.width),
      y: this.normalizeAxis(position.y, this.height)
    };
  }

  serialize(): Extract<SerializedSpace, { kind: "continuous2d" }> {
    const positions: Record<EntityId, Point2D> = {};
    for (const entityId of [...this.positions.keys()].sort((left, right) => left.localeCompare(right))) {
      const position = this.positions.get(entityId);
      if (position) {
        positions[entityId] = clonePoint(position);
      }
    }
    return {
      id: this.id,
      kind: this.kind,
      width: this.width,
      height: this.height,
      boundaryMode: this.boundaryMode,
      positions
    };
  }

  clone(): Continuous2DSpace {
    return Continuous2DSpace.fromSerialized(this.serialize());
  }

  readonlyView(): Continuous2DSpaceReader {
    return {
      id: this.id,
      kind: this.kind,
      width: this.width,
      height: this.height,
      boundaryMode: this.boundaryMode,
      getLocation: (entityId) => this.getLocation(entityId),
      getPosition: (entityId) => this.getPosition(entityId),
      queryRadius: (position, radius) => this.queryRadius(position, radius),
      queryNeighbors: (entityId, radiusOrOptions) => this.queryNeighbors(entityId, radiusOrOptions),
      queryDiagnostics: () => this.queryDiagnostics(),
      normalizePosition: (position) => this.normalizePosition(position),
      serialize: () => this.serialize()
    };
  }

  static fromSerialized(serialized: Extract<SerializedSpace, { kind: "continuous2d" }>): Continuous2DSpace {
    const space = new Continuous2DSpace(serialized);
    for (const entityId of Object.keys(serialized.positions).sort((left, right) => left.localeCompare(right))) {
      const position = serialized.positions[entityId];
      if (position) {
        space.addEntity(entityId, position);
      }
    }
    return space;
  }

  private distanceSquared(left: Point2D, right: Point2D): number {
    let dx = Math.abs(left.x - right.x);
    let dy = Math.abs(left.y - right.y);
    if (this.boundaryMode === "wrap") {
      dx = Math.min(dx, this.width - dx);
      dy = Math.min(dy, this.height - dy);
    }
    return dx * dx + dy * dy;
  }

  private shouldUseSpatialIndex(radius: number): boolean {
    return Number.isFinite(radius) && radius > 0 && this.positions.size >= 32 && radius < Math.max(this.width, this.height) / 2;
  }

  private spatialIndexFor(radius: number): ContinuousSpatialHashIndex {
    const cellSize = Math.max(1, radius);
    if (this.spatialIndexCache?.version === this.positionVersion && this.spatialIndexCache.cellSize === cellSize) {
      return this.spatialIndexCache.index;
    }
    const index = new ContinuousSpatialHashIndex({
      width: this.width,
      height: this.height,
      cellSize,
      topology: this.boundaryMode === "wrap" ? "wrap" : "closed",
      maxItems: Math.max(1, this.positions.size)
    });
    for (const [id, position] of this.positions.entries()) {
      index.add({ id, x: position.x, y: position.y });
    }
    this.spatialIndexCache = {
      version: this.positionVersion,
      cellSize,
      index
    };
    this.diagnostics.spatialIndexBuilds += 1;
    return index;
  }

  private markPositionsChanged(): void {
    this.positionVersion += 1;
    this.spatialIndexCache = undefined;
    this.diagnostics = emptyDiagnostics();
  }

  private normalizeAxis(value: number, max: number): number {
    if (this.boundaryMode === "wrap") {
      return ((value % max) + max) % max;
    }
    if (this.boundaryMode === "clamp") {
      return Math.min(max, Math.max(0, value));
    }
    let result = value;
    while (result < 0 || result > max) {
      if (result < 0) {
        result = -result;
      }
      if (result > max) {
        result = max - (result - max);
      }
    }
    return result;
  }

  private assertPoint(value: unknown): asserts value is Point2D {
    if (!isPoint2D(value)) {
      throw new SimulationValidationError("Expected finite 2D point");
    }
  }
}

function clonePoint(point: Point2D): Point2D {
  return { x: point.x, y: point.y };
}

function emptyDiagnostics(): Continuous2DQueryDiagnostics {
  return {
    queryCount: 0,
    allPairsQueries: 0,
    spatialIndexQueries: 0,
    spatialIndexBuilds: 0,
    distanceChecks: 0,
    spatialIndexCandidateChecks: 0,
    spatialIndexVisitedCells: 0
  };
}
