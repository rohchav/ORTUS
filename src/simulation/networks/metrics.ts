import { networkMetricsArtifactType, type NetworkDefinition, type NetworkMetrics, type NetworkMetricsResult } from "./types";
import { validateNetworkDefinition } from "./validation";

export function computeNetworkMetrics(network: NetworkDefinition): NetworkMetricsResult {
  const valid = validateNetworkDefinition(network);
  const degrees = degreeValues(valid);
  const nodeCount = valid.nodes.length;
  const edgeCount = valid.edges.length;
  const directed = isDirectedNetwork(valid);
  const denominator = directed ? nodeCount * Math.max(0, nodeCount - 1) : (nodeCount * Math.max(0, nodeCount - 1)) / 2;
  const components = connectedComponents(valid);
  const metrics: NetworkMetrics = {
    nodeCount,
    edgeCount,
    density: denominator > 0 ? edgeCount / denominator : 0,
    averageDegree: nodeCount > 0 ? degrees.reduce((sum, value) => sum + value, 0) / nodeCount : 0,
    minDegree: degrees.length > 0 ? Math.min(...degrees) : 0,
    maxDegree: degrees.length > 0 ? Math.max(...degrees) : 0,
    connectedComponentCount: components.length,
    largestComponentSize: components.length > 0 ? Math.max(...components) : 0
  };
  return {
    schemaVersion: "1",
    artifactType: networkMetricsArtifactType,
    networkId: valid.id,
    metrics,
    warnings: directed ? ["Directed graph component metrics are weakly connected components."] : []
  };
}

function degreeValues(network: NetworkDefinition): number[] {
  const degrees = new Map(network.nodes.map((node) => [node.id, 0]));
  for (const edge of network.edges) {
    degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
    degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);
  }
  return [...degrees.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, value]) => value);
}

function connectedComponents(network: NetworkDefinition): number[] {
  const adjacency = new Map(network.nodes.map((node) => [node.id, new Set<string>()]));
  for (const edge of network.edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }
  const visited = new Set<string>();
  const componentSizes: number[] = [];
  for (const node of network.nodes.map((item) => item.id).sort((left, right) => left.localeCompare(right))) {
    if (visited.has(node)) {
      continue;
    }
    let size = 0;
    const stack = [node];
    visited.add(node);
    while (stack.length > 0) {
      const current = stack.pop()!;
      size += 1;
      for (const next of [...(adjacency.get(current) ?? [])].sort((left, right) => left.localeCompare(right))) {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }
    componentSizes.push(size);
  }
  return componentSizes;
}

function isDirectedNetwork(network: NetworkDefinition): boolean {
  return Boolean(network.directed || network.edges.some((edge) => edge.directed));
}
