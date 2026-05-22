import type { EntityId, SerializedSpace } from "../kernel/types";
import { SimulationInvariantError, SimulationValidationError } from "../kernel/Errors";
import type { NeighborResult, ReadonlySpace, Space } from "./Space";

export interface NetworkSpaceReader extends ReadonlySpace<EntityId> {
  neighbors(entityId: EntityId): EntityId[];
  degree(entityId: EntityId): number;
  getEdge(source: EntityId, target: EntityId): NetworkEdge | undefined;
}

export interface NetworkEdge {
  source: EntityId;
  target: EntityId;
  weight?: number;
  directed: boolean;
}

export class NetworkSpace implements Space<EntityId> {
  readonly id: string;
  readonly kind = "network" as const;
  private readonly nodes = new Set<EntityId>();
  private readonly edges = new Map<string, NetworkEdge>();

  constructor(id: string) {
    this.id = id;
  }

  addEntity(entityId: EntityId, location: EntityId = entityId): void {
    this.addNode(location);
  }

  removeEntity(entityId: EntityId): void {
    this.nodes.delete(entityId);
    for (const key of [...this.edges.keys()]) {
      const edge = this.edges.get(key);
      if (edge && (edge.source === entityId || edge.target === entityId)) {
        this.edges.delete(key);
      }
    }
  }

  moveEntity(): void {
    throw new SimulationValidationError("NetworkSpace does not support moveEntity");
  }

  getLocation(entityId: EntityId): EntityId | undefined {
    return this.nodes.has(entityId) ? entityId : undefined;
  }

  queryNeighbors(entityId: EntityId): NeighborResult<EntityId>[] {
    return this.neighbors(entityId).map((neighborId) => ({ entityId: neighborId, location: neighborId }));
  }

  addNode(entityId: EntityId): void {
    this.nodes.add(entityId);
  }

  addEdge(source: EntityId, target: EntityId, weight?: number, directed = false): void {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new SimulationInvariantError("Both network edge endpoints must exist");
    }
    if (weight !== undefined && (!Number.isFinite(weight) || weight < 0)) {
      throw new SimulationValidationError("Network edge weight must be a nonnegative finite number");
    }
    const edge: NetworkEdge = { source, target, directed, ...(weight !== undefined ? { weight } : {}) };
    this.edges.set(edgeKey(source, target), edge);
    if (!directed) {
      this.edges.set(edgeKey(target, source), { source: target, target: source, directed, ...(weight !== undefined ? { weight } : {}) });
    }
  }

  removeEdge(source: EntityId, target: EntityId): void {
    this.edges.delete(edgeKey(source, target));
    this.edges.delete(edgeKey(target, source));
  }

  neighbors(entityId: EntityId): EntityId[] {
    if (!this.nodes.has(entityId)) {
      throw new SimulationInvariantError(`Node ${entityId} does not exist`, { entityId });
    }
    return [...this.edges.values()]
      .filter((edge) => edge.source === entityId)
      .map((edge) => edge.target)
      .sort((left, right) => left.localeCompare(right));
  }

  degree(entityId: EntityId): number {
    return this.neighbors(entityId).length;
  }

  getEdge(source: EntityId, target: EntityId): NetworkEdge | undefined {
    const edge = this.edges.get(edgeKey(source, target));
    return edge ? { ...edge } : undefined;
  }

  serialize(): Extract<SerializedSpace, { kind: "network" }> {
    const canonicalEdges = [...this.edges.values()].filter((edge) => edge.directed || edge.source.localeCompare(edge.target) <= 0);
    return {
      id: this.id,
      kind: this.kind,
      nodes: [...this.nodes].sort((left, right) => left.localeCompare(right)),
      edges: canonicalEdges.sort((left, right) => left.source.localeCompare(right.source) || left.target.localeCompare(right.target))
    };
  }

  clone(): NetworkSpace {
    return NetworkSpace.fromSerialized(this.serialize());
  }

  readonlyView(): NetworkSpaceReader {
    return {
      id: this.id,
      kind: this.kind,
      getLocation: (entityId) => this.getLocation(entityId),
      queryNeighbors: (entityId) => this.queryNeighbors(entityId),
      neighbors: (entityId) => this.neighbors(entityId),
      degree: (entityId) => this.degree(entityId),
      getEdge: (source, target) => this.getEdge(source, target),
      serialize: () => this.serialize()
    };
  }

  static fromSerialized(serialized: Extract<SerializedSpace, { kind: "network" }>): NetworkSpace {
    const space = new NetworkSpace(serialized.id);
    for (const node of serialized.nodes) {
      space.addNode(node);
    }
    for (const edge of serialized.edges) {
      space.addEdge(edge.source, edge.target, edge.weight, edge.directed);
    }
    return space;
  }
}

function edgeKey(source: EntityId, target: EntityId): string {
  return `${source}->${target}`;
}
