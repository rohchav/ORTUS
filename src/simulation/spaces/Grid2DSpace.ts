import type { EntityId, SerializedSpace } from "../kernel/types";
import { SimulationInvariantError, SimulationValidationError } from "../kernel/Errors";
import { deepClone } from "../kernel/Validation";
import type { BoundaryMode, GridCell, NeighborResult, ReadonlySpace, Space } from "./Space";
import { isGridCell } from "./Space";

export interface Grid2DSpaceReader extends ReadonlySpace<GridCell> {
  readonly rows: number;
  readonly cols: number;
  readonly boundaryMode: BoundaryMode;
  getCell(entityId: EntityId): GridCell | undefined;
  entitiesAt(cell: GridCell): EntityId[];
  neighbors(cell: GridCell, options?: GridNeighborOptions): GridCell[];
  queryNeighbors(entityId: EntityId, options?: GridNeighborOptions): NeighborResult<GridCell>[];
}

export interface Grid2DSpaceOptions {
  id: string;
  rows: number;
  cols: number;
  boundaryMode: BoundaryMode;
}

export interface GridNeighborOptions {
  includeDiagonals?: boolean;
  radius?: number;
}

export class Grid2DSpace implements Space<GridCell> {
  readonly id: string;
  readonly kind = "grid2d" as const;
  readonly rows: number;
  readonly cols: number;
  readonly boundaryMode: BoundaryMode;
  private readonly cells = new Map<EntityId, GridCell>();

  constructor(options: Grid2DSpaceOptions) {
    if (!Number.isInteger(options.rows) || options.rows <= 0 || !Number.isInteger(options.cols) || options.cols <= 0) {
      throw new SimulationValidationError("Grid2DSpace dimensions must be positive integers");
    }
    this.id = options.id;
    this.rows = options.rows;
    this.cols = options.cols;
    this.boundaryMode = options.boundaryMode;
  }

  addEntity(entityId: EntityId, location: GridCell): void {
    if (this.cells.has(entityId)) {
      throw new SimulationInvariantError(`Entity ${entityId} already exists in grid ${this.id}`, { entityId });
    }
    this.cells.set(entityId, this.normalizeCell(location));
  }

  removeEntity(entityId: EntityId): void {
    this.cells.delete(entityId);
  }

  moveEntity(entityId: EntityId, location: GridCell): void {
    this.setCell(entityId, location);
  }

  setCell(entityId: EntityId, cell: GridCell): void {
    if (!this.cells.has(entityId)) {
      throw new SimulationInvariantError(`Entity ${entityId} is not in grid ${this.id}`, { entityId });
    }
    this.cells.set(entityId, this.normalizeCell(cell));
  }

  getLocation(entityId: EntityId): GridCell | undefined {
    return this.getCell(entityId);
  }

  getCell(entityId: EntityId): GridCell | undefined {
    const cell = this.cells.get(entityId);
    return cell ? deepClone(cell) : undefined;
  }

  entitiesAt(cell: GridCell): EntityId[] {
    const normalized = this.normalizeCell(cell);
    return [...this.cells.entries()]
      .filter(([, candidate]) => candidate.row === normalized.row && candidate.col === normalized.col)
      .map(([entityId]) => entityId)
      .sort((left, right) => left.localeCompare(right));
  }

  neighbors(cell: GridCell, options: GridNeighborOptions = {}): GridCell[] {
    const includeDiagonals = options.includeDiagonals ?? false;
    const radius = options.radius ?? 1;
    if (!Number.isInteger(radius) || radius < 1) {
      throw new SimulationValidationError("Grid neighbor radius must be a positive integer");
    }
    const origin = this.normalizeCell(cell);
    const seen = new Set<string>();
    const results: GridCell[] = [];
    for (let dRow = -radius; dRow <= radius; dRow += 1) {
      for (let dCol = -radius; dCol <= radius; dCol += 1) {
        if (dRow === 0 && dCol === 0) {
          continue;
        }
        if (!includeDiagonals && Math.abs(dRow) + Math.abs(dCol) > radius) {
          continue;
        }
        const candidate = this.normalizeCell({ row: origin.row + dRow, col: origin.col + dCol });
        const key = `${candidate.row}:${candidate.col}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        results.push(candidate);
      }
    }
    return results.sort((left, right) => left.row - right.row || left.col - right.col);
  }

  queryNeighbors(entityId: EntityId, options: GridNeighborOptions = {}): NeighborResult<GridCell>[] {
    const cell = this.cells.get(entityId);
    if (!cell) {
      throw new SimulationInvariantError(`Entity ${entityId} is not in grid ${this.id}`, { entityId });
    }
    const neighborCells = this.neighbors(cell, options);
    const results: NeighborResult<GridCell>[] = [];
    for (const neighborCell of neighborCells) {
      for (const neighborId of this.entitiesAt(neighborCell)) {
        results.push({ entityId: neighborId, location: neighborCell });
      }
    }
    return results
      .filter((result) => result.entityId !== entityId)
      .sort((left, right) => left.entityId.localeCompare(right.entityId));
  }

  serialize(): Extract<SerializedSpace, { kind: "grid2d" }> {
    const cells: Record<EntityId, GridCell> = {};
    for (const entityId of [...this.cells.keys()].sort((left, right) => left.localeCompare(right))) {
      const cell = this.cells.get(entityId);
      if (cell) {
        cells[entityId] = deepClone(cell);
      }
    }
    return {
      id: this.id,
      kind: this.kind,
      rows: this.rows,
      cols: this.cols,
      boundaryMode: this.boundaryMode,
      cells
    };
  }

  clone(): Grid2DSpace {
    return Grid2DSpace.fromSerialized(this.serialize());
  }

  readonlyView(): Grid2DSpaceReader {
    return {
      id: this.id,
      kind: this.kind,
      rows: this.rows,
      cols: this.cols,
      boundaryMode: this.boundaryMode,
      getLocation: (entityId) => this.getLocation(entityId),
      getCell: (entityId) => this.getCell(entityId),
      entitiesAt: (cell) => this.entitiesAt(cell),
      neighbors: (cell, options) => this.neighbors(cell, options),
      queryNeighbors: (entityId, options) => this.queryNeighbors(entityId, options),
      serialize: () => this.serialize()
    };
  }

  static fromSerialized(serialized: Extract<SerializedSpace, { kind: "grid2d" }>): Grid2DSpace {
    const space = new Grid2DSpace(serialized);
    for (const entityId of Object.keys(serialized.cells).sort((left, right) => left.localeCompare(right))) {
      const cell = serialized.cells[entityId];
      if (cell) {
        space.addEntity(entityId, cell);
      }
    }
    return space;
  }

  private normalizeCell(cell: GridCell): GridCell {
    if (!isGridCell(cell)) {
      throw new SimulationValidationError("Expected integer grid cell");
    }
    return {
      row: this.normalizeAxis(cell.row, this.rows),
      col: this.normalizeAxis(cell.col, this.cols)
    };
  }

  private normalizeAxis(value: number, size: number): number {
    if (this.boundaryMode === "wrap") {
      return ((value % size) + size) % size;
    }
    if (this.boundaryMode === "clamp") {
      return Math.min(size - 1, Math.max(0, value));
    }
    let result = value;
    while (result < 0 || result >= size) {
      if (result < 0) {
        result = -result;
      }
      if (result >= size) {
        result = size - 1 - (result - (size - 1));
      }
    }
    return result;
  }
}
