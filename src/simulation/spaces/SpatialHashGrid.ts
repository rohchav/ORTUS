import { SimulationValidationError } from "../kernel/Errors";
import type { BoundaryMode, Point2D } from "./Space";
import { isPoint2D } from "./Space";

export interface SpatialHashGridItem {
  id: string;
  position: Point2D;
}

export interface SpatialHashGridResult {
  id: string;
  position: Point2D;
  distance: number;
  distanceSquared: number;
  offset: Point2D;
}

export interface SpatialHashGridPair {
  leftId: string;
  rightId: string;
  distance: number;
  distanceSquared: number;
  offset: Point2D;
}

export interface SpatialHashGridQueryResult {
  results: SpatialHashGridResult[];
  distanceChecks: number;
  visitedCellCount: number;
}

export interface SpatialHashGridPairQueryResult {
  pairs: SpatialHashGridPair[];
  distanceChecks: number;
  visitedCellCount: number;
}

export interface SpatialHashGridOptions {
  width: number;
  height: number;
  cellSize: number;
  boundaryMode: BoundaryMode;
  maxItems?: number;
}

const defaultMaxItems = 100_000;
const maxCellCount = 1_000_000;

export class SpatialHashGrid {
  readonly width: number;
  readonly height: number;
  readonly cellSize: number;
  readonly boundaryMode: BoundaryMode;
  readonly cols: number;
  readonly rows: number;
  private readonly maxItems: number;
  private readonly cells: SpatialHashGridItem[][];
  private readonly items: SpatialHashGridItem[] = [];
  private readonly itemIndexById = new Map<string, number>();

  constructor(options: SpatialHashGridOptions) {
    if (!Number.isFinite(options.width) || options.width <= 0 || !Number.isFinite(options.height) || options.height <= 0) {
      throw new SimulationValidationError("SpatialHashGrid dimensions must be positive finite numbers");
    }
    if (!Number.isFinite(options.cellSize) || options.cellSize <= 0) {
      throw new SimulationValidationError("SpatialHashGrid cellSize must be a positive finite number");
    }
    if (options.boundaryMode !== "wrap" && options.boundaryMode !== "bounce" && options.boundaryMode !== "clamp") {
      throw new SimulationValidationError("SpatialHashGrid boundaryMode must be wrap, bounce, or clamp");
    }
    const maxItems = options.maxItems ?? defaultMaxItems;
    if (!Number.isInteger(maxItems) || maxItems <= 0) {
      throw new SimulationValidationError("SpatialHashGrid maxItems must be a positive integer");
    }

    this.width = options.width;
    this.height = options.height;
    this.cellSize = options.cellSize;
    this.boundaryMode = options.boundaryMode;
    this.cols = Math.max(1, Math.ceil(this.width / this.cellSize));
    this.rows = Math.max(1, Math.ceil(this.height / this.cellSize));
    if (this.cols * this.rows > maxCellCount) {
      throw new SimulationValidationError(`SpatialHashGrid cannot allocate more than ${maxCellCount} cells`);
    }
    this.maxItems = maxItems;
    this.cells = Array.from({ length: this.cols * this.rows }, () => []);
  }

  add(item: SpatialHashGridItem): void {
    if (!item.id) {
      throw new SimulationValidationError("SpatialHashGrid item id is required");
    }
    if (this.itemIndexById.has(item.id)) {
      throw new SimulationValidationError(`Duplicate SpatialHashGrid item id: ${item.id}`);
    }
    if (this.items.length >= this.maxItems) {
      throw new SimulationValidationError(`SpatialHashGrid cannot contain more than ${this.maxItems} items`);
    }
    const stored = {
      id: item.id,
      position: this.normalizePosition(item.position)
    };
    const cell = this.cellFor(stored.position);
    this.itemIndexById.set(stored.id, this.items.length);
    this.items.push(stored);
    this.cells[cell.index]!.push(stored);
  }

  addAll(items: readonly SpatialHashGridItem[]): void {
    for (const item of items) {
      this.add(item);
    }
  }

  queryRadius(position: Point2D, radius: number): SpatialHashGridQueryResult {
    const origin = this.normalizePosition(position);
    const radiusSquared = this.validateRadius(radius);
    const results: SpatialHashGridResult[] = [];
    let distanceChecks = 0;
    const visitedCells = this.nearbyCellIndices(origin, radius);

    for (const index of visitedCells) {
      const bucket = this.cells[index]!;
      for (const item of bucket) {
        const offset = this.offset(origin, item.position);
        const distanceSquared = offset.x * offset.x + offset.y * offset.y;
        distanceChecks += 1;
        if (distanceSquared <= radiusSquared) {
          results.push({
            id: item.id,
            position: clonePoint(item.position),
            distance: Math.sqrt(distanceSquared),
            distanceSquared,
            offset
          });
        }
      }
    }

    results.sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id));
    return { results, distanceChecks, visitedCellCount: visitedCells.length };
  }

  queryPairsWithinRadius(radius: number): SpatialHashGridPairQueryResult {
    const radiusSquared = this.validateRadius(radius);
    const pairs: SpatialHashGridPair[] = [];
    let distanceChecks = 0;
    let visitedCellCount = 0;

    for (let leftIndex = 0; leftIndex < this.items.length; leftIndex += 1) {
      const left = this.items[leftIndex]!;
      const visitedCells = this.nearbyCellIndices(left.position, radius);
      visitedCellCount += visitedCells.length;
      const pairsForLeft: Array<SpatialHashGridPair & { rightIndex: number }> = [];
      for (const index of visitedCells) {
        const bucket = this.cells[index]!;
        for (const right of bucket) {
          const rightIndex = this.itemIndexById.get(right.id);
          if (rightIndex === undefined || rightIndex <= leftIndex) {
            continue;
          }
          const offset = this.offset(left.position, right.position);
          const distanceSquared = offset.x * offset.x + offset.y * offset.y;
          distanceChecks += 1;
          if (distanceSquared <= radiusSquared) {
            pairsForLeft.push({
              leftId: left.id,
              rightId: right.id,
              distance: Math.sqrt(distanceSquared),
              distanceSquared,
              offset,
              rightIndex
            });
          }
        }
      }
      pairsForLeft.sort((leftPair, rightPair) => leftPair.rightIndex - rightPair.rightIndex);
      for (const pair of pairsForLeft) {
        const { rightIndex: _rightIndex, ...publicPair } = pair;
        pairs.push(publicPair);
      }
    }

    return { pairs, distanceChecks, visitedCellCount };
  }

  private validateRadius(radius: number): number {
    if (!Number.isFinite(radius) || radius < 0) {
      throw new SimulationValidationError("SpatialHashGrid radius must be a nonnegative finite number");
    }
    return radius * radius;
  }

  private nearbyCellIndices(position: Point2D, radius: number): number[] {
    const center = this.cellFor(position);
    const xRange = Math.min(this.cols - 1, Math.ceil(radius / this.cellSize));
    const yRange = Math.min(this.rows - 1, Math.ceil(radius / this.cellSize));
    const indices: number[] = [];
    const needsDuplicateGuard = this.boundaryMode === "wrap" && (xRange * 2 + 1 > this.cols || yRange * 2 + 1 > this.rows);
    const seen = needsDuplicateGuard ? new Set<number>() : undefined;

    for (let dx = -xRange; dx <= xRange; dx += 1) {
      for (let dy = -yRange; dy <= yRange; dy += 1) {
        const col = center.col + dx;
        const row = center.row + dy;
        let index: number | undefined;
        if (this.boundaryMode === "wrap") {
          index = this.cellIndex(mod(col, this.cols), mod(row, this.rows));
        } else if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
          index = this.cellIndex(col, row);
        }
        if (index === undefined) {
          continue;
        }
        if (seen) {
          if (seen.has(index)) {
            continue;
          }
          seen.add(index);
        }
        indices.push(index);
      }
    }

    return indices;
  }

  private cellFor(position: Point2D): { col: number; row: number; index: number } {
    const col = clamp(Math.floor(position.x / this.cellSize), 0, this.cols - 1);
    const row = clamp(Math.floor(position.y / this.cellSize), 0, this.rows - 1);
    return { col, row, index: this.cellIndex(col, row) };
  }

  private cellIndex(col: number, row: number): number {
    return row * this.cols + col;
  }

  private normalizePosition(position: Point2D): Point2D {
    if (!isPoint2D(position)) {
      throw new SimulationValidationError("SpatialHashGrid item position must be a finite 2D point");
    }
    if (this.boundaryMode === "wrap") {
      return {
        x: mod(position.x, this.width),
        y: mod(position.y, this.height)
      };
    }
    return {
      x: clamp(position.x, 0, this.width),
      y: clamp(position.y, 0, this.height)
    };
  }

  private offset(from: Point2D, to: Point2D): Point2D {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    if (this.boundaryMode === "wrap") {
      if (Math.abs(dx) > this.width / 2) {
        dx -= Math.sign(dx) * this.width;
      }
      if (Math.abs(dy) > this.height / 2) {
        dy -= Math.sign(dy) * this.height;
      }
    }
    return { x: dx, y: dy };
  }
}

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clonePoint(point: Point2D): Point2D {
  return { x: point.x, y: point.y };
}
