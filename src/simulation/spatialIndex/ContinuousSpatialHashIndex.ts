import { SimulationValidationError } from "../kernel/Errors";

export type ContinuousSpatialHashTopology = "closed" | "wrap";

export interface ContinuousSpatialHashItem {
  id: string;
  x: number;
  y: number;
}

export interface ContinuousSpatialHashResult {
  id: string;
  x: number;
  y: number;
  distance: number;
  distanceSquared: number;
  offset: { x: number; y: number };
}

export interface ContinuousSpatialHashPair {
  leftId: string;
  rightId: string;
  distance: number;
  distanceSquared: number;
  offset: { x: number; y: number };
}

export interface ContinuousSpatialHashQueryResult {
  results: readonly ContinuousSpatialHashResult[];
  distanceChecks: number;
  visitedCellCount: number;
}

export interface ContinuousSpatialHashPairQueryResult {
  pairs: readonly ContinuousSpatialHashPair[];
  distanceChecks: number;
  visitedCellCount: number;
}

export interface ContinuousSpatialHashOptions {
  width: number;
  height: number;
  cellSize: number;
  topology: ContinuousSpatialHashTopology;
  cellSizing?: "nominal" | "uniformCoverage";
  maxItems?: number;
  maxCells?: number;
}

const defaultMaxItems = 100_000;
const defaultMaxCells = 1_000_000;

export class ContinuousSpatialHashIndex {
  readonly width: number;
  readonly height: number;
  readonly cellSize: number;
  readonly topology: ContinuousSpatialHashTopology;
  readonly cols: number;
  readonly rows: number;
  private readonly cellSizing: "nominal" | "uniformCoverage";
  private readonly cellWidth: number;
  private readonly cellHeight: number;
  private readonly maxItems: number;
  private readonly cells: ContinuousSpatialHashItem[][];
  private readonly items: ContinuousSpatialHashItem[] = [];
  private readonly itemIndexById = new Map<string, number>();

  constructor(options: ContinuousSpatialHashOptions) {
    if (!Number.isFinite(options.width) || options.width <= 0 || !Number.isFinite(options.height) || options.height <= 0) {
      throw new SimulationValidationError("ContinuousSpatialHashIndex dimensions must be positive finite numbers");
    }
    if (!Number.isFinite(options.cellSize) || options.cellSize <= 0) {
      throw new SimulationValidationError("ContinuousSpatialHashIndex cellSize must be a positive finite number");
    }
    if (options.topology !== "closed" && options.topology !== "wrap") {
      throw new SimulationValidationError("ContinuousSpatialHashIndex topology must be closed or wrap");
    }
    if (options.cellSizing !== undefined && options.cellSizing !== "nominal" && options.cellSizing !== "uniformCoverage") {
      throw new SimulationValidationError("ContinuousSpatialHashIndex cellSizing must be nominal or uniformCoverage");
    }
    const maxItems = options.maxItems ?? defaultMaxItems;
    if (!Number.isInteger(maxItems) || maxItems <= 0) {
      throw new SimulationValidationError("ContinuousSpatialHashIndex maxItems must be a positive integer");
    }
    const maxCells = options.maxCells ?? defaultMaxCells;
    if (!Number.isInteger(maxCells) || maxCells <= 0 || maxCells > defaultMaxCells) {
      throw new SimulationValidationError(`ContinuousSpatialHashIndex maxCells must be an integer from 1 to ${defaultMaxCells}`);
    }

    this.width = options.width;
    this.height = options.height;
    this.cellSize = options.cellSize;
    this.topology = options.topology;
    this.cellSizing = options.cellSizing ?? "nominal";
    this.cols = Math.max(1, Math.ceil(this.width / this.cellSize));
    this.rows = Math.max(1, Math.ceil(this.height / this.cellSize));
    if (this.cols * this.rows > maxCells) {
      throw new SimulationValidationError(`ContinuousSpatialHashIndex cannot allocate more than ${maxCells} cells`);
    }
    this.cellWidth = this.cellSizing === "uniformCoverage" ? this.width / this.cols : this.cellSize;
    this.cellHeight = this.cellSizing === "uniformCoverage" ? this.height / this.rows : this.cellSize;
    this.maxItems = maxItems;
    this.cells = Array.from({ length: this.cols * this.rows }, () => []);
  }

  add(item: ContinuousSpatialHashItem): void {
    validateItem(item);
    if (this.itemIndexById.has(item.id)) {
      throw new SimulationValidationError(`Duplicate ContinuousSpatialHashIndex item id: ${item.id}`);
    }
    if (this.items.length >= this.maxItems) {
      throw new SimulationValidationError(`ContinuousSpatialHashIndex cannot contain more than ${this.maxItems} items`);
    }
    const stored = this.normalizedItem(item);
    const cell = this.cellFor(stored);
    this.itemIndexById.set(stored.id, this.items.length);
    this.items.push(stored);
    this.cells[cell.index]!.push(stored);
  }

  addAll(items: readonly ContinuousSpatialHashItem[]): void {
    for (const item of items) {
      this.add(item);
    }
  }

  queryRadius(x: number, y: number, radius: number, options: { excludeId?: string } = {}): ContinuousSpatialHashQueryResult {
    const origin = this.normalizePoint(x, y);
    const radiusSquared = validateRadius(radius);
    const results: ContinuousSpatialHashResult[] = [];
    let distanceChecks = 0;
    const visitedCells = this.nearbyCellIndices(origin, radius);

    for (const index of visitedCells) {
      const bucket = this.cells[index]!;
      for (const item of bucket) {
        if (options.excludeId !== undefined && item.id === options.excludeId) {
          continue;
        }
        const offset = this.offset(origin, item);
        const distanceSquared = offset.x * offset.x + offset.y * offset.y;
        distanceChecks += 1;
        if (distanceSquared <= radiusSquared) {
          results.push({
            id: item.id,
            x: item.x,
            y: item.y,
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

  queryNeighborIds(entityId: string, radius: number): readonly string[] {
    const item = this.itemFor(entityId);
    return this.queryRadius(item.x, item.y, radius, { excludeId: entityId }).results.map((result) => result.id);
  }

  queryPairsWithinRadius(radius: number): ContinuousSpatialHashPairQueryResult {
    const radiusSquared = validateRadius(radius);
    const pairs: ContinuousSpatialHashPair[] = [];
    let distanceChecks = 0;
    let visitedCellCount = 0;

    for (let leftIndex = 0; leftIndex < this.items.length; leftIndex += 1) {
      const left = this.items[leftIndex]!;
      const visitedCells = this.nearbyCellIndices(left, radius);
      visitedCellCount += visitedCells.length;
      const pairsForLeft: Array<ContinuousSpatialHashPair & { rightIndex: number }> = [];
      for (const index of visitedCells) {
        const bucket = this.cells[index]!;
        for (const right of bucket) {
          const rightIndex = this.itemIndexById.get(right.id);
          if (rightIndex === undefined || rightIndex <= leftIndex) {
            continue;
          }
          const offset = this.offset(left, right);
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

  private itemFor(entityId: string): ContinuousSpatialHashItem {
    const index = this.itemIndexById.get(entityId);
    if (index === undefined) {
      throw new SimulationValidationError(`ContinuousSpatialHashIndex item is missing: ${entityId}`);
    }
    return this.items[index]!;
  }

  private nearbyCellIndices(position: Pick<ContinuousSpatialHashItem, "x" | "y">, radius: number): number[] {
    const center = this.cellFor(position);
    const xRange = Math.min(this.cols - 1, Math.ceil(radius / this.cellWidth));
    const yRange = Math.min(this.rows - 1, Math.ceil(radius / this.cellHeight));
    const indices: number[] = [];
    const needsDuplicateGuard = this.topology === "wrap" && (xRange * 2 + 1 > this.cols || yRange * 2 + 1 > this.rows);
    const seen = needsDuplicateGuard ? new Set<number>() : undefined;

    for (let dx = -xRange; dx <= xRange; dx += 1) {
      for (let dy = -yRange; dy <= yRange; dy += 1) {
        const col = center.col + dx;
        const row = center.row + dy;
        let index: number | undefined;
        if (this.topology === "wrap") {
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

  private cellFor(position: Pick<ContinuousSpatialHashItem, "x" | "y">): { col: number; row: number; index: number } {
    const col = clamp(Math.floor(position.x / this.cellWidth), 0, this.cols - 1);
    const row = clamp(Math.floor(position.y / this.cellHeight), 0, this.rows - 1);
    return { col, row, index: this.cellIndex(col, row) };
  }

  private cellIndex(col: number, row: number): number {
    return row * this.cols + col;
  }

  private normalizedItem(item: ContinuousSpatialHashItem): ContinuousSpatialHashItem {
    const point = this.normalizePoint(item.x, item.y);
    return { id: item.id, x: point.x, y: point.y };
  }

  private normalizePoint(x: number, y: number): { x: number; y: number } {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new SimulationValidationError("ContinuousSpatialHashIndex coordinates must be finite numbers");
    }
    if (this.topology === "wrap") {
      if (this.cellSizing === "nominal") {
        return { x: mod(x, this.width), y: mod(y, this.height) };
      }
      return {
        x: x >= 0 && x < this.width ? x : mod(x, this.width),
        y: y >= 0 && y < this.height ? y : mod(y, this.height)
      };
    }
    return { x: clamp(x, 0, this.width), y: clamp(y, 0, this.height) };
  }

  private offset(from: Pick<ContinuousSpatialHashItem, "x" | "y">, to: Pick<ContinuousSpatialHashItem, "x" | "y">): { x: number; y: number } {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    if (this.topology === "wrap") {
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

function validateItem(item: ContinuousSpatialHashItem): void {
  if (!item.id) {
    throw new SimulationValidationError("ContinuousSpatialHashIndex item id is required");
  }
  if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) {
    throw new SimulationValidationError("ContinuousSpatialHashIndex item coordinates must be finite numbers");
  }
}

function validateRadius(radius: number): number {
  if (!Number.isFinite(radius) || radius < 0) {
    throw new SimulationValidationError("ContinuousSpatialHashIndex radius must be a nonnegative finite number");
  }
  return radius * radius;
}

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
