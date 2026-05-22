import { RandomService } from "../kernel/Random";
import { networkDefinitionArtifactType, type NetworkDefinition, type NetworkEdge, type NetworkNode, type NetworkOptions } from "./types";
import { validateNetworkDefinition, validateNetworkOptions } from "./validation";

export function generateNetworkDefinition(options: NetworkOptions): NetworkDefinition {
  const resolved = validateNetworkOptions(options);
  const nodes = createNodes(resolved.nodeCount ?? 0);
  const relationTypes = resolved.relationType
    ? [
        {
          id: resolved.relationType,
          label: humanizeRelationType(resolved.relationType),
          directed: resolved.directed ?? false
        }
      ]
    : undefined;
  const edges = generateEdges(resolved, nodes);
  return validateNetworkDefinition({
    schemaVersion: "1",
    artifactType: networkDefinitionArtifactType,
    id: `network-${resolved.generator}-${hashNetworkOptions(resolved)}`,
    label: `${humanizeGenerator(resolved.generator)} network`,
    description: "Deterministic synthetic network generated from NetworkOptions.",
    directed: resolved.directed ?? false,
    allowSelfLoops: resolved.allowSelfLoops ?? false,
    nodes,
    edges,
    ...(relationTypes ? { relationTypes } : {}),
    metadata: {
      generator: resolved.generator,
      seed: resolved.seed ?? null,
      ...(resolved.metadata ?? {})
    }
  });
}

function createNodes(nodeCount: number): NetworkNode[] {
  return Array.from({ length: nodeCount }, (_, index) => ({
    id: `node-${index + 1}`,
    label: `Node ${index + 1}`
  }));
}

function generateEdges(options: NetworkOptions, nodes: readonly NetworkNode[]): NetworkEdge[] {
  if (options.generator === "empty") {
    return [];
  }
  if (options.generator === "complete") {
    return completeEdges(options, nodes);
  }
  if (options.generator === "ring") {
    return ringEdges(options, nodes);
  }
  return randomErdosRenyiEdges(options, nodes);
}

function completeEdges(options: NetworkOptions, nodes: readonly NetworkNode[]): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  const directed = options.directed ?? false;
  if (directed) {
    for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
      for (let targetIndex = 0; targetIndex < nodes.length; targetIndex += 1) {
        if (sourceIndex !== targetIndex || options.allowSelfLoops) {
          edges.push(edge(options, nodes[sourceIndex]!.id, nodes[targetIndex]!.id, edges.length));
        }
      }
    }
    return edges;
  }
  for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < nodes.length; targetIndex += 1) {
      edges.push(edge(options, nodes[sourceIndex]!.id, nodes[targetIndex]!.id, edges.length));
    }
  }
  return edges;
}

function ringEdges(options: NetworkOptions, nodes: readonly NetworkNode[]): NetworkEdge[] {
  if (nodes.length < 3) {
    return [];
  }
  return nodes.map((node, index) => edge(options, node.id, nodes[(index + 1) % nodes.length]!.id, index));
}

function randomErdosRenyiEdges(options: NetworkOptions, nodes: readonly NetworkNode[]): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  const directed = options.directed ?? false;
  const rng = new RandomService(options.seed ?? "ortus-network").fork("network:randomErdosRenyi");
  const probability = options.edgeProbability ?? 0;
  if (directed) {
    for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
      for (let targetIndex = 0; targetIndex < nodes.length; targetIndex += 1) {
        if ((sourceIndex !== targetIndex || options.allowSelfLoops) && rng.bool(probability)) {
          edges.push(edge(options, nodes[sourceIndex]!.id, nodes[targetIndex]!.id, edges.length, options.weighted ? rng.float() : undefined));
        }
      }
    }
    return edges;
  }
  for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < nodes.length; targetIndex += 1) {
      if (rng.bool(probability)) {
        edges.push(edge(options, nodes[sourceIndex]!.id, nodes[targetIndex]!.id, edges.length, options.weighted ? rng.float() : undefined));
      }
    }
  }
  return edges;
}

function edge(options: NetworkOptions, source: string, target: string, index: number, randomWeight?: number): NetworkEdge {
  return {
    id: `edge-${index + 1}`,
    source,
    target,
    directed: options.directed ?? false,
    ...(options.weighted ? { weight: randomWeight ?? 1 } : {}),
    ...(options.relationType ? { relationType: options.relationType } : {})
  };
}

function humanizeGenerator(generator: string): string {
  return generator.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

function humanizeRelationType(relationType: string): string {
  return relationType.replace(/[-_]/g, " ").replace(/^./, (value) => value.toUpperCase());
}

function hashNetworkOptions(options: NetworkOptions): string {
  const json = JSON.stringify({
    generator: options.generator,
    nodeCount: options.nodeCount ?? 0,
    edgeProbability: options.edgeProbability ?? null,
    directed: options.directed ?? false,
    weighted: options.weighted ?? false,
    relationType: options.relationType ?? null,
    allowSelfLoops: options.allowSelfLoops ?? false,
    seed: options.seed ?? null
  });
  let hash = 2166136261;
  for (let index = 0; index < json.length; index += 1) {
    hash ^= json.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
