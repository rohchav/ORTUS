import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assumptionProfileArtifactType,
  computeNetworkMetrics,
  createDefaultRunConfig,
  createDefaultScenario,
  deserializeNetworkDefinition,
  deserializeNetworkMetrics,
  generateNetworkDefinition,
  getDegree,
  getEdgeWeight,
  getEdgesBetween,
  getIncomingNeighbors,
  getNeighbors,
  getOutgoingNeighbors,
  hasEdge,
  maxNetworkDefinitionJsonLength,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  productionTemplates,
  serializeNetworkDefinition,
  serializeNetworkMetrics,
  validateScenario,
  validateRunConfig,
  type NetworkDefinition
} from "../index";
import { validateNetworkDefinition, validateNetworkOptions } from "../networks/validation";

function baseNetwork(): NetworkDefinition {
  return {
    schemaVersion: "1",
    artifactType: networkDefinitionArtifactType,
    id: "network-test",
    label: "Test network",
    directed: false,
    nodes: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" }
    ],
    edges: [
      { id: "ab", source: "a", target: "b", relationType: "contact", weight: 0.5 },
      { id: "bc", source: "b", target: "c", relationType: "contact", weight: 0.75 }
    ],
    relationTypes: [{ id: "contact", label: "Contact", weightRange: { min: 0, max: 1 } }]
  };
}

describe("network and relation primitives", () => {
  it("validates network definitions and rejects malformed or live-state payloads", () => {
    const network = baseNetwork();
    expect(validateNetworkDefinition(network)).toMatchObject({ id: "network-test", directed: false });
    expect(() => validateNetworkDefinition({ ...network, id: "" })).toThrow(/Invalid network definition/);
    expect(() => validateNetworkDefinition({ ...network, nodes: [...network.nodes, { id: "a" }] })).toThrow(/Duplicate network node id/);
    expect(() => validateNetworkDefinition({ ...network, edges: [...network.edges, { ...network.edges[0]!, target: "c" }] })).toThrow(
      /Duplicate network edge id/
    );
    expect(() =>
      validateNetworkDefinition({ ...network, relationTypes: [...(network.relationTypes ?? []), { id: "contact", label: "Duplicate" }] })
    ).toThrow(/Duplicate relation type id/);
    expect(() => validateNetworkDefinition({ ...network, edges: [{ source: "missing", target: "a" }] })).toThrow(/source does not exist/);
    expect(() => validateNetworkDefinition({ ...network, edges: [{ source: "a", target: "missing" }] })).toThrow(/target does not exist/);
    expect(() => validateNetworkDefinition({ ...network, edges: [{ source: "a", target: "a" }] })).toThrow(/self-loop/);
    expect(() => validateNetworkDefinition({ ...network, edges: [{ source: "a", target: "b", relationType: "unknown" }] })).toThrow(
      /Unknown network relationType/
    );
    expect(() => validateNetworkDefinition({ ...network, edges: [{ source: "a", target: "b", weight: -1 }] })).toThrow(
      /Invalid network definition/
    );
    expect(() => validateNetworkDefinition({ ...network, edges: [{ source: "a", target: "b", weight: Number.NaN }] })).toThrow(
      /non-finite/
    );
    expect(() => validateNetworkDefinition({ ...network, directed: "yes" })).toThrow(/Invalid network definition/);
    expect(() =>
      validateNetworkDefinition({ ...network, relationTypes: [{ id: "bad", label: "Bad", weightRange: { min: 2, max: 1 } }] })
    ).toThrow(/Invalid relation type weight range/);
    expect(() => validateNetworkDefinition({ ...network, nodes: [{ id: "a", metadata: new Date() as unknown as Record<string, never> }] })).toThrow(
      /plain JSON/
    );
    expect(() =>
      validateNetworkDefinition({ ...network, metadata: { snapshot: { tick: 1 } } })
    ).toThrow(/live run state/);
    expect(() =>
      validateNetworkDefinition({ ...network, metadata: { runSummary: { runId: "r1" } } })
    ).toThrow(/live run state/);
    expect(() => validateNetworkDefinition({ ...network, metadata: { snapshots: [] } })).toThrow(/live run state/);
    expect(() => validateNetworkDefinition({ ...network, metadata: { template: { id: "x" } } })).toThrow(/live run state/);
    expect(() => validateNetworkDefinition({ ...network, metadata: { activeEngine: {} } })).toThrow(/live run state/);
    expect(() =>
      validateNetworkDefinition({ ...network, metadata: { fn: (() => "bad") as unknown as never } })
    ).toThrow(/plain JSON/);
    expect(() => validateNetworkDefinition({ ...network, metadata: { huge: "x".repeat(50_000) } })).toThrow(/Network metadata/);
    expect(() => validateNetworkDefinition({ ...network, extra: true })).toThrow(/Invalid network definition/);
  });

  it("validates generator options and creates deterministic empty, complete, ring, and random networks", () => {
    expect(validateNetworkOptions({ generator: "empty", nodeCount: 2 })).toMatchObject({ mode: "synthetic" });
    expect(() => validateNetworkOptions({ generator: "smallWorld", nodeCount: 4 })).toThrow(/Invalid network options/);
    expect(() => validateNetworkOptions({ generator: "randomErdosRenyi", nodeCount: 4 })).toThrow(/requires edgeProbability/);
    expect(() => validateNetworkOptions({ generator: "randomErdosRenyi", nodeCount: 4, edgeProbability: 2 })).toThrow(
      /Invalid network options/
    );
    expect(() => validateNetworkOptions({ generator: "ring", nodeCount: 2 })).toThrow(/Ring network generator/);
    expect(() => validateNetworkOptions({ generator: "complete", nodeCount: 4, averageDegree: 8 })).toThrow(/averageDegree/);

    const empty = generateNetworkDefinition({ generator: "empty", nodeCount: 3 });
    expect(empty.nodes).toHaveLength(3);
    expect(empty.edges).toHaveLength(0);

    const complete = generateNetworkDefinition({ generator: "complete", nodeCount: 4, relationType: "contact" });
    expect(complete.edges).toHaveLength(6);
    expect(validateNetworkDefinition(complete).edges).toHaveLength(6);

    const directedComplete = generateNetworkDefinition({ generator: "complete", nodeCount: 4, directed: true });
    expect(directedComplete.edges).toHaveLength(12);
    expect(directedComplete.edges.every((edge) => edge.directed)).toBe(true);

    const ring = generateNetworkDefinition({ generator: "ring", nodeCount: 5 });
    expect(ring.edges).toHaveLength(5);
    expect(getDegree(ring, "node-1")).toBe(2);

    const options = { generator: "randomErdosRenyi" as const, nodeCount: 10, edgeProbability: 0.5, seed: "network-seed" };
    const before = JSON.stringify(options);
    const first = generateNetworkDefinition(options);
    const second = generateNetworkDefinition(options);
    const different = generateNetworkDefinition({ ...options, seed: "different-network-seed" });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(first.edges)).not.toBe(JSON.stringify(different.edges));
    expect(JSON.stringify(options)).toBe(before);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);

    const none = generateNetworkDefinition({ generator: "randomErdosRenyi", nodeCount: 5, edgeProbability: 0, seed: "p0" });
    expect(none.edges).toHaveLength(0);
    const all = generateNetworkDefinition({ generator: "randomErdosRenyi", nodeCount: 5, edgeProbability: 1, seed: "p1" });
    expect(all.edges).toHaveLength(10);
    const directedWeighted = generateNetworkDefinition({
      generator: "randomErdosRenyi",
      nodeCount: 3,
      edgeProbability: 1,
      directed: true,
      weighted: true,
      relationType: "influence",
      seed: "weighted"
    });
    expect(directedWeighted.edges).toHaveLength(6);
    expect(directedWeighted.edges.every((edge) => edge.directed && edge.relationType === "influence" && Number.isFinite(edge.weight))).toBe(true);
  });

  it("computes finite network metrics for undirected, directed, and empty graphs", () => {
    const complete = generateNetworkDefinition({ generator: "complete", nodeCount: 4 });
    const completeMetrics = computeNetworkMetrics(complete);
    expect(completeMetrics.metrics).toMatchObject({
      nodeCount: 4,
      edgeCount: 6,
      density: 1,
      averageDegree: 3,
      minDegree: 3,
      maxDegree: 3,
      connectedComponentCount: 1,
      largestComponentSize: 4
    });

    const ring = generateNetworkDefinition({ generator: "ring", nodeCount: 5 });
    expect(computeNetworkMetrics(ring).metrics).toMatchObject({ edgeCount: 5, density: 0.5, averageDegree: 2 });

    const single = generateNetworkDefinition({ generator: "empty", nodeCount: 1 });
    expect(computeNetworkMetrics(single).metrics).toMatchObject({
      nodeCount: 1,
      edgeCount: 0,
      density: 0,
      averageDegree: 0,
      minDegree: 0,
      maxDegree: 0,
      connectedComponentCount: 1,
      largestComponentSize: 1
    });

    const disconnected = validateNetworkDefinition({
      schemaVersion: "1",
      artifactType: networkDefinitionArtifactType,
      id: "disconnected",
      label: "Disconnected",
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
      edges: [{ source: "a", target: "b" }]
    });
    expect(computeNetworkMetrics(disconnected).metrics).toMatchObject({
      connectedComponentCount: 3,
      largestComponentSize: 2,
      averageDegree: 0.5,
      minDegree: 0,
      maxDegree: 1
    });

    const directed = validateNetworkDefinition({
      schemaVersion: "1",
      artifactType: networkDefinitionArtifactType,
      id: "directed",
      label: "Directed",
      directed: true,
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" }
      ]
    });
    const directedMetrics = computeNetworkMetrics(directed);
    expect(directedMetrics.metrics.density).toBeCloseTo(2 / 6);
    expect(directedMetrics.metrics.connectedComponentCount).toBe(1);
    expect(directedMetrics.warnings[0]).toMatch(/weakly connected/);

    const empty = generateNetworkDefinition({ generator: "empty", nodeCount: 0 });
    expect(Object.values(computeNetworkMetrics(empty).metrics).every(Number.isFinite)).toBe(true);
    const before = JSON.stringify(complete);
    computeNetworkMetrics(complete);
    expect(JSON.stringify(complete)).toBe(before);
  });

  it("queries neighbors, direction, degree, edge lookup, and weights without mutating networks", () => {
    const directed = validateNetworkDefinition({
      schemaVersion: "1",
      artifactType: networkDefinitionArtifactType,
      id: "query",
      label: "Query",
      directed: true,
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { id: "ab", source: "a", target: "b", weight: 0.4 },
        { id: "ca", source: "c", target: "a", weight: 0.9 }
      ]
    });
    const before = JSON.stringify(directed);
    expect(getOutgoingNeighbors(directed, "a")).toEqual(["b"]);
    expect(getIncomingNeighbors(directed, "a")).toEqual(["c"]);
    expect(getNeighbors(directed, "a")).toEqual(["b", "c"]);
    expect(getDegree(directed, "a")).toBe(2);
    expect(getEdgesBetween(directed, "a", "b")).toHaveLength(1);
    expect(getEdgeWeight(directed, "a", "b")).toBe(0.4);
    expect(hasEdge(directed, "c", "a")).toBe(true);
    expect(() => getNeighbors(directed, "missing")).toThrow(/Unknown network node/);
    expect(JSON.stringify(directed)).toBe(before);

    const undirected = validateNetworkDefinition({
      schemaVersion: "1",
      artifactType: networkDefinitionArtifactType,
      id: "multi",
      label: "Multi relation",
      nodes: [{ id: "a" }, { id: "b" }],
      relationTypes: [
        { id: "contact", label: "Contact" },
        { id: "influence", label: "Influence" }
      ],
      edges: [
        { id: "contact-edge", source: "a", target: "b", relationType: "contact", weight: 0.3 },
        { id: "influence-edge", source: "a", target: "b", relationType: "influence", weight: 0.7 }
      ]
    });
    expect(getNeighbors(undirected, "b")).toEqual(["a"]);
    expect(getOutgoingNeighbors(undirected, "b")).toEqual([]);
    expect(getIncomingNeighbors(undirected, "b")).toEqual(["a"]);
    expect(getDegree(undirected, "a")).toBe(2);
    expect(getEdgesBetween(undirected, "b", "a")).toHaveLength(2);
    expect(getEdgeWeight(undirected, "a", "b")).toBe(0.3);
  });

  it("serializes network definitions and metrics as distinct artifacts", () => {
    const network = generateNetworkDefinition({ generator: "complete", nodeCount: 3, relationType: "contact" });
    const json = serializeNetworkDefinition(network);
    const imported = deserializeNetworkDefinition(json);
    expect(imported.artifactType).toBe(networkDefinitionArtifactType);
    expect(imported.edges).toHaveLength(3);

    const metrics = computeNetworkMetrics(imported);
    const metricsJson = serializeNetworkMetrics(metrics);
    expect(JSON.parse(metricsJson).artifactType).toBe(networkMetricsArtifactType);
    expect(deserializeNetworkMetrics(metricsJson).metrics.edgeCount).toBe(3);
    expect(() => deserializeNetworkMetrics(JSON.stringify({ ...JSON.parse(metricsJson), world: {} }))).toThrow(/live run state|Invalid network metrics/);

    expect(() => deserializeNetworkDefinition(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.scenario" }))).toThrow(/artifact type/);
    expect(() => deserializeNetworkDefinition(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.snapshot" }))).toThrow(/artifact type/);
    expect(() => deserializeNetworkDefinition(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.uncertaintyConfig" }))).toThrow(
      /artifact type/
    );
    expect(() => deserializeNetworkDefinition(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.uncertaintyResult" }))).toThrow(
      /artifact type/
    );
    expect(() => deserializeNetworkDefinition(JSON.stringify({ schemaVersion: "1", artifactType: assumptionProfileArtifactType }))).toThrow(
      /artifact type/
    );
    expect(() => deserializeNetworkDefinition(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.runSummary" }))).toThrow(
      /artifact type/
    );
    expect(() => deserializeNetworkDefinition(JSON.stringify({ ...network, world: {} }))).toThrow(/live run state/);
    expect(() => deserializeNetworkDefinition("x".repeat(maxNetworkDefinitionJsonLength + 1))).toThrow(/characters or less/);
  });

  it("keeps production templates and fresh-run schemas honest about unsupported network fields", () => {
    for (const template of productionTemplates) {
      const neuralRuntimeNetwork = template.id === "neural-excitation-network";
      expect(template.capabilities?.supportsNetworkSpace).toBe(neuralRuntimeNetwork);
      expect(template.capabilities?.supportsNetworkOptions).toBe(false);
      expect(template.capabilities?.supportsNetworkMetrics).toBe(neuralRuntimeNetwork);
      expect(template.spaceDefinition?.type).not.toBe("network");

      const runConfig = createDefaultRunConfig({ template, seed: `network-capabilities-${template.id}` });
      expect(() => validateRunConfig({ ...runConfig, networkOptions: { generator: "empty" } } as never, template)).toThrow(
        /Unsupported RunConfig field/
      );
      const scenario = createDefaultScenario({ template, now: "2026-01-01T00:00:00.000Z" });
      expect(() => validateScenario({ ...scenario, networkOptions: { generator: "empty" } } as never, template)).toThrow(/Invalid scenario/);
    }
  });

  it("keeps network services headless, deterministic, and outside React", () => {
    const networksDir = new URL("../networks", import.meta.url);
    for (const file of readdirSync(networksDir)) {
      if (!file.endsWith(".ts")) {
        continue;
      }
      const source = readFileSync(join(networksDir.pathname, file), "utf8");
      expect(source).not.toMatch(/from "react"|from 'react'|zustand|document\.|window\.|Canvas|localStorage/);
      expect(source).not.toContain("Math.random");
      expect(source).not.toMatch(/eval\(|new Function/);
    }
  });
});
