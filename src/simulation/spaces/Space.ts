import type { EntityId, SerializedSpace } from "../kernel/types";

export type BoundaryMode = "wrap" | "bounce" | "clamp";
export type SpaceKind = "continuous2d" | "grid2d" | "network";

export type Point2D = {
  x: number;
  y: number;
};

export type GridCell = {
  row: number;
  col: number;
};

// A spatial location. Network spaces have no locations: membership is the node itself.
export type SpaceLocation = Point2D | GridCell;

export interface NeighborResult<TLocation = SpaceLocation> {
  entityId: EntityId;
  location: TLocation;
  distance?: number;
}

export interface Space<TLocation = SpaceLocation> {
  readonly id: string;
  readonly kind: SpaceKind;
  addEntity(entityId: EntityId, location: TLocation): void;
  removeEntity(entityId: EntityId): void;
  moveEntity(entityId: EntityId, location: TLocation): void;
  getLocation(entityId: EntityId): TLocation | undefined;
  queryNeighbors(entityId: EntityId, options?: unknown): NeighborResult<TLocation>[];
  queryRegion?(region: unknown): NeighborResult<TLocation>[];
  serialize(): SerializedSpace;
  clone(): Space<TLocation>;
}

export interface ReadonlySpace<TLocation = SpaceLocation> {
  readonly id: string;
  readonly kind: SpaceKind;
  getLocation(entityId: EntityId): TLocation | undefined;
  queryNeighbors(entityId: EntityId, options?: unknown): NeighborResult<TLocation>[];
  queryRegion?(region: unknown): NeighborResult<TLocation>[];
  serialize(): SerializedSpace;
}

export function isPoint2D(value: unknown): value is Point2D {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Point2D).x === "number" &&
    Number.isFinite((value as Point2D).x) &&
    typeof (value as Point2D).y === "number" &&
    Number.isFinite((value as Point2D).y)
  );
}

export function isLocationForSpaceKind(kind: SpaceKind, location: unknown): boolean {
  switch (kind) {
    case "continuous2d":
      return isPoint2D(location);
    case "grid2d":
      return isGridCell(location);
    case "network":
      return false;
  }
}

export interface Reflection {
  readonly value: number;
  // The wall the coordinate was reflected off last, if it was outside [0, max].
  readonly lastWall?: "low" | "high";
}

// Reflects a finite coordinate into [0, max] between walls at 0 and max (max >= 0). A coordinate within
// two reflections of the range ([-2max, 3max]) keeps the original step-by-step arithmetic, so trajectories
// are bit-identical; production movement leaves a 100-unit world by at most 10 units per step. A coordinate
// farther out is first reduced by whole periods (2max) with an exact remainder: reflecting it one wall at a
// time could take an unbounded number of steps, or never finish once max is below its floating-point
// precision. Either way the loop below runs at most twice.
export function reflectCoordinate(value: number, max: number): Reflection {
  if (max === 0) {
    return { value: 0 };
  }
  let result = value;
  if (result < -2 * max || result > 3 * max) {
    const period = 2 * max;
    const remainder = result % period;
    // In [0, period]; an exact multiple of the period maps to 0 rather than -0.
    result = remainder < 0 ? remainder + period : remainder === 0 ? 0 : remainder;
  }
  let lastWall: Reflection["lastWall"];
  while (result < 0 || result > max) {
    if (result < 0) {
      result = -result;
      lastWall = "low";
    }
    if (result > max) {
      result = max - (result - max);
      lastWall = "high";
    }
  }
  return lastWall === undefined ? { value: result } : { value: result, lastWall };
}

export function isGridCell(value: unknown): value is GridCell {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger((value as GridCell).row) &&
    Number.isInteger((value as GridCell).col)
  );
}
