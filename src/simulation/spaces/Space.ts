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

export function isGridCell(value: unknown): value is GridCell {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger((value as GridCell).row) &&
    Number.isInteger((value as GridCell).col)
  );
}
