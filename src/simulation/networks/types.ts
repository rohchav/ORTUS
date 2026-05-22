import type { JsonValue } from "../kernel/types";

export const networkDefinitionArtifactType = "ortus.networkDefinition";
export const networkMetricsArtifactType = "ortus.networkMetrics";
export const maxNetworkNodeCount = 500;
export const maxNetworkEdgeCount = 20_000;
export const maxNetworkRelationTypeCount = 200;
export const maxNetworkDefinitionJsonLength = 300_000;
export const maxNetworkMetadataJsonLength = 40_000;
export const maxNetworkSeedLength = 160;

export type NetworkGeneratorType = "empty" | "complete" | "randomErdosRenyi" | "ring";

export interface NetworkNode {
  id: string;
  label?: string;
  type?: string;
  weight?: number;
  metadata?: Record<string, JsonValue>;
}

export interface NetworkEdge {
  id?: string;
  source: string;
  target: string;
  directed?: boolean;
  weight?: number;
  relationType?: string;
  metadata?: Record<string, JsonValue>;
}

export interface RelationTypeDefinition {
  id: string;
  label: string;
  description?: string;
  directed?: boolean;
  weightRange?: {
    min?: number;
    max?: number;
  };
  visual?: Record<string, JsonValue>;
  metadata?: Record<string, JsonValue>;
}

// Network definitions are relational setup artifacts, not live engine state.
export interface NetworkDefinition {
  schemaVersion: "1";
  artifactType: typeof networkDefinitionArtifactType;
  id: string;
  label: string;
  description?: string;
  directed?: boolean;
  allowSelfLoops?: boolean;
  nodes: readonly NetworkNode[];
  edges: readonly NetworkEdge[];
  relationTypes?: readonly RelationTypeDefinition[];
  metadata?: Record<string, JsonValue>;
}

export interface NetworkOptions {
  mode?: "synthetic";
  generator: NetworkGeneratorType;
  nodeCount?: number;
  edgeProbability?: number;
  averageDegree?: number;
  directed?: boolean;
  weighted?: boolean;
  relationType?: string;
  allowSelfLoops?: boolean;
  seed?: string;
  metadata?: Record<string, JsonValue>;
}

export interface NetworkMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averageDegree: number;
  minDegree: number;
  maxDegree: number;
  connectedComponentCount: number;
  largestComponentSize: number;
}

export interface NetworkMetricsResult {
  schemaVersion: "1";
  artifactType: typeof networkMetricsArtifactType;
  networkId: string;
  metrics: NetworkMetrics;
  warnings: readonly string[];
}
