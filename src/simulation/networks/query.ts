import { SimulationValidationError } from "../kernel/Errors";
import type { NetworkDefinition, NetworkEdge } from "./types";
import { validateNetworkDefinition } from "./validation";

export function getNeighbors(network: NetworkDefinition, nodeId: string): string[] {
  const valid = validateNetworkDefinition(network);
  assertNode(valid, nodeId);
  const neighbors = new Set<string>();
  for (const edge of valid.edges) {
    if (edge.source === nodeId) {
      neighbors.add(edge.target);
    }
    if (edge.target === nodeId) {
      neighbors.add(edge.source);
    }
  }
  return [...neighbors].sort((left, right) => left.localeCompare(right));
}

export function getOutgoingNeighbors(network: NetworkDefinition, nodeId: string): string[] {
  const valid = validateNetworkDefinition(network);
  assertNode(valid, nodeId);
  return uniqueSorted(valid.edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target));
}

export function getIncomingNeighbors(network: NetworkDefinition, nodeId: string): string[] {
  const valid = validateNetworkDefinition(network);
  assertNode(valid, nodeId);
  const incoming = valid.edges
    .flatMap((edge) => {
      if (edge.target === nodeId) {
        return [edge.source];
      }
      return edge.directed ? [] : edge.source === nodeId ? [edge.target] : [];
    });
  return uniqueSorted(incoming);
}

export function getDegree(network: NetworkDefinition, nodeId: string): number {
  const valid = validateNetworkDefinition(network);
  assertNode(valid, nodeId);
  let degree = 0;
  for (const edge of valid.edges) {
    if (edge.source === nodeId) {
      degree += 1;
    }
    if (edge.target === nodeId) {
      degree += 1;
    }
  }
  return degree;
}

export function getEdgesBetween(network: NetworkDefinition, source: string, target: string): NetworkEdge[] {
  const valid = validateNetworkDefinition(network);
  assertNode(valid, source);
  assertNode(valid, target);
  return valid.edges
    .filter((edge) => edge.source === source && edge.target === target)
    .concat(valid.edges.filter((edge) => !edge.directed && edge.source === target && edge.target === source))
    .map((edge) => ({ ...edge }));
}

export function getEdgeWeight(network: NetworkDefinition, source: string, target: string): number | undefined {
  return getEdgesBetween(network, source, target)[0]?.weight;
}

export function hasEdge(network: NetworkDefinition, source: string, target: string): boolean {
  return getEdgesBetween(network, source, target).length > 0;
}

function assertNode(network: NetworkDefinition, nodeId: string): void {
  if (!network.nodes.some((node) => node.id === nodeId)) {
    throw new SimulationValidationError(`Unknown network node: ${nodeId}`);
  }
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
