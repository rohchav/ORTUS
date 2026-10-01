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
  // Membership without copying a location, for whole-space checks.
  has(entityId: EntityId): boolean;
  memberCount(): number;
  queryNeighbors(entityId: EntityId, options?: unknown): NeighborResult<TLocation>[];
  queryRegion?(region: unknown): NeighborResult<TLocation>[];
  serialize(): SerializedSpace;
  clone(): Space<TLocation>;
}

export interface ReadonlySpace<TLocation = SpaceLocation> {
  readonly id: string;
  readonly kind: SpaceKind;
  getLocation(entityId: EntityId): TLocation | undefined;
  has(entityId: EntityId): boolean;
  memberCount(): number;
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

// Reflects a finite coordinate into [0, max] between walls at 0 and max (max >= 0), as wall-by-wall
// reflection does, and reports the last wall, which Flocking uses for the bounced velocity.
// - Within two reflections of the range ([-2max, 3max]) the original step-by-step loop runs (at most twice),
//   so trajectories are bit-identical; production movement leaves a 100-unit world by at most 10 units per
//   step. Its last wall is always the exact one.
// - Farther out, stepping one wall at a time could take an unbounded number of steps, never finish once max
//   is below the coordinate's floating-point precision, or drift: each step rounds, so at 1e17 in a 100-wide
//   range it removes 96 per reflection instead of 100. Every period (2max) is one reflection off each wall,
//   so the exact result is the remainder of |value| after whole periods, reached off the low wall, or its
//   mirror 2max - remainder, reached off the high wall. Both are exact: the remainder by fmod, the mirror by
//   Sterbenz's lemma. This is the step-by-step loop's result wherever that loop's arithmetic is exact.
export function reflectCoordinate(value: number, max: number): Reflection {
  if (max === 0) {
    return { value: 0 };
  }
  if (value < -2 * max || value > 3 * max) {
    const remainder = Math.abs(value) % (2 * max);
    if (remainder === 0) {
      return { value: 0, lastWall: "high" };
    }
    return remainder <= max ? { value: remainder, lastWall: "low" } : { value: 2 * max - remainder, lastWall: "high" };
  }
  let result = value;
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
