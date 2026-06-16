import { describe, expect, it } from "vitest";
import {
  validateVisualBuilderWorkspaceDefinition,
  visualBuilderWorkspaceArtifactType,
  type VisualBuilderWorkspaceDefinition
} from "../../../simulation/visualBuilderWorkspace";
import {
  createBuilderGraphEdgePath,
  createBuilderGraphViewModel,
  defaultBuilderGraphFilters,
  filterBuilderGraph,
  formatGraphStatus,
  getBuilderGraphFitZoom,
  getBuilderGraphInspector,
  getBuilderGraphNeighborhood,
  getBuilderGraphNodeDomId,
  maxBuilderGraphVisualEdges,
  maxBuilderGraphVisualNodes,
  resolveBuilderGraphSelection
} from "./builderGraphViewModel";

function graphWorkspace(overrides: Partial<VisualBuilderWorkspaceDefinition> = {}): VisualBuilderWorkspaceDefinition {
  return {
    artifactType: visualBuilderWorkspaceArtifactType,
    id: "graph-workspace",
    name: "Graph Workspace",
    version: "1.0.0",
    workspaceVersion: "1",
    modelSchemaId: "schema-1",
    nodes: [
      {
        id: "schema",
        label: "Model Schema",
        nodeKind: "modelSchema",
        referencedArtifactType: "ortus.modelSchema",
        referencedArtifactId: "schema-1",
        status: "serviceOnly",
        position: { x: -20, y: 10 },
        active: true,
        executable: false,
        notes: ["Schema source note"],
        metadata: { source: "fixture" }
      },
      {
        id: "entity",
        label: "Agent Entity",
        nodeKind: "entityType",
        referencedSchemaElementId: "agent",
        status: "structuralOnly",
        active: true,
        executable: false
      },
      {
        id: "rule",
        label: "Learning Rule",
        nodeKind: "ruleDeclaration",
        referencedSchemaElementId: "rule-1",
        status: "futureOnly",
        active: true,
        executable: false
      },
      {
        id: "social",
        label: "Social Semantics",
        nodeKind: "socialLearningDescriptor",
        referencedArtifactType: "ortus.knowledgeMemorySocialLearningModel",
        referencedArtifactId: "social-1",
        status: "unsupported",
        active: false,
        executable: false
      },
      {
        id: "runtime-claim",
        label: "Runtime Claim",
        nodeKind: "futureCapability",
        status: "templateRuntimeSupported",
        active: false,
        executable: false
      }
    ],
    edges: [
      {
        id: "schema-contains-entity",
        label: "contains",
        edgeKind: "contains",
        sourceNodeId: "schema",
        targetNodeId: "entity",
        active: true,
        executable: false
      },
      {
        id: "schema-references-social",
        label: "references",
        edgeKind: "references",
        sourceNodeId: "schema",
        targetNodeId: "social",
        active: true,
        executable: false,
        notes: ["Structural relation note"],
        metadata: { relation: "structural" }
      }
    ],
    validationMarkers: [
      {
        id: "schema-not-runnable",
        label: "Not Runnable",
        markerKind: "notRunnable",
        targetNodeId: "schema",
        severity: "warning",
        message: "A valid schema is not runnable.",
        active: true,
        executable: false
      }
    ],
    warningMarkers: [
      {
        id: "social-edge-warning",
        label: "Structural Edge",
        markerKind: "warning",
        targetEdgeId: "schema-references-social",
        severity: "info",
        message: "This relationship does not activate social learning.",
        active: true,
        executable: false
      },
      {
        id: "rule-future-only",
        label: "Future Only",
        markerKind: "futureOnly",
        targetNodeId: "rule",
        severity: "info",
        message: "This rule remains future-only.",
        active: true,
        executable: false
      }
    ],
    unsupportedMarkers: [
      {
        id: "social-unsupported",
        label: "Unsupported Runtime",
        markerKind: "unsupported",
        targetNodeId: "social",
        severity: "error",
        message: "Generic social-learning runtime is unavailable.",
        active: true,
        executable: false
      }
    ],
    layout: { layoutKind: "forceDirected" },
    metadata: { purpose: "graph test" },
    ...overrides
  };
}

describe("Builder Graph View model", () => {
  it("creates deterministic presentation-only nodes and edges without mutating the workspace", () => {
    const workspace = graphWorkspace();
    const before = JSON.stringify(workspace);
    const first = createBuilderGraphViewModel(workspace);
    const second = createBuilderGraphViewModel(workspace);

    expect(first).toEqual(second);
    expect(JSON.stringify(workspace)).toBe(before);
    expect(first).toMatchObject({
      sourceArtifactType: visualBuilderWorkspaceArtifactType,
      sourceArtifactId: "graph-workspace",
      structuralValid: true,
      runnableNow: false,
      executable: false,
      layout: { kind: "deterministicLayered" }
    });
    expect(first.nodes.map((node) => node.id)).toEqual(["schema", "entity", "rule", "runtime-claim", "social"]);
    expect(first.nodes.every((node) => node.executable === false)).toBe(true);
    expect(first.edges.every((edge) => edge.executable === false)).toBe(true);
    expect(first.nodes.find((node) => node.id === "schema")).toMatchObject({
      artifactReference: {
        artifactType: "ortus.modelSchema",
        artifactId: "schema-1"
      },
      markerIds: ["schema-not-runnable"]
    });
    expect(first.nodes.find((node) => node.id === "runtime-claim")?.warnings.join(" ")).toContain("only a workspace claim");
    expect(formatGraphStatus("templateRuntimeSupported")).toBe("Workspace Claim: Template Runtime Supported");
    expect(first.edges.find((edge) => edge.id === "schema-references-social")?.warnings).toContain(
      "This relationship does not activate social learning."
    );
    expect(first.summary).toMatchObject({
      validationMarkerCount: 1,
      warningMarkerCount: 2,
      unsupportedMarkerCount: 1,
      unsupportedItemCount: 1,
      futureOnlyItemCount: 1,
      futureOnlyMarkerCount: 1,
      serviceOnlyItemCount: 1
    });
    expect(first.summary.reportNoticeCount).toBeGreaterThan(0);
  });

  it("isolates presentation data from later output mutation", () => {
    const workspace = graphWorkspace();
    const view = createBuilderGraphViewModel(workspace);
    const mutableNode = view.nodes.find((node) => node.id === "schema") as unknown as {
      notes: string[];
      metadata: { source: string };
      position: { x: number; y: number };
    };
    const mutableEdge = view.edges.find((edge) => edge.id === "schema-references-social") as unknown as {
      notes: string[];
      metadata: { relation: string };
    };

    mutableNode.notes.push("Presentation-only mutation");
    mutableNode.metadata.source = "changed";
    mutableNode.position.x = 999;
    mutableEdge.notes.push("Presentation-only mutation");
    mutableEdge.metadata.relation = "changed";

    expect(workspace.nodes[0]).toMatchObject({
      notes: ["Schema source note"],
      metadata: { source: "fixture" },
      position: { x: -20, y: 10 }
    });
    expect(workspace.edges?.[1]).toMatchObject({
      notes: ["Structural relation note"],
      metadata: { relation: "structural" }
    });
  });

  it("bounds imported coordinates and sizes and uses deterministic fallback coordinates without force simulation", () => {
    const workspace = graphWorkspace({
      nodes: graphWorkspace().nodes.map((node) =>
        node.id === "schema"
          ? { ...node, position: { x: 1_000_000, y: -1_000_000 }, size: { width: 50_000, height: 50_000 } }
          : node
      )
    });
    const before = JSON.stringify(workspace);
    const view = createBuilderGraphViewModel(workspace);
    const schema = view.nodes.find((node) => node.id === "schema");
    const entity = view.nodes.find((node) => node.id === "entity");
    const rule = view.nodes.find((node) => node.id === "rule");

    expect(schema?.position.x).toBeGreaterThanOrEqual(30);
    expect(schema?.position.y).toBeGreaterThanOrEqual(30);
    expect(schema?.size).toEqual({ width: 300, height: 140 });
    expect(entity?.position).not.toEqual(rule?.position);
    expect(JSON.stringify(workspace)).toBe(before);
    expect(view.layout.width).toBeGreaterThanOrEqual(440);
    expect(view.layout.height).toBeGreaterThanOrEqual(340);
    expect(getBuilderGraphFitZoom(view)).toBeGreaterThanOrEqual(0.1);
    expect(getBuilderGraphFitZoom(view)).toBeLessThanOrEqual(1);
    expect(getBuilderGraphFitZoom(view, 320, 240)).toBeLessThanOrEqual(getBuilderGraphFitZoom(view, 1_200, 800));
  });

  it("filters by search, kind, status, warnings, and unsupported/future visibility without changing source data", () => {
    const view = createBuilderGraphViewModel(graphWorkspace());

    expect(filterBuilderGraph(view, { ...defaultBuilderGraphFilters, query: "references" })).toMatchObject({
      nodes: [expect.objectContaining({ id: "schema" }), expect.objectContaining({ id: "social" })],
      edges: [expect.objectContaining({ id: "schema-references-social" })]
    });
    expect(
      filterBuilderGraph(view, { ...defaultBuilderGraphFilters, nodeKind: "ruleDeclaration" }).nodes.map((node) => node.id)
    ).toEqual(["rule"]);
    expect(
      filterBuilderGraph(view, { ...defaultBuilderGraphFilters, nodeStatus: "serviceOnly" }).nodes.map((node) => node.id)
    ).toEqual(["schema"]);
    const warningsOnly = filterBuilderGraph(view, { ...defaultBuilderGraphFilters, warningStatus: "withWarnings" });
    expect(warningsOnly.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(["schema", "social"]));
    expect(warningsOnly.edges.map((edge) => edge.id)).toContain("schema-references-social");
    const warningSearch = filterBuilderGraph(view, {
      ...defaultBuilderGraphFilters,
      query: "contains",
      warningStatus: "withWarnings"
    });
    expect(warningSearch.nodes.map((node) => node.id)).toEqual(["schema"]);
    expect(warningSearch.edges).toEqual([]);
    expect(filterBuilderGraph(view, { ...defaultBuilderGraphFilters, showUnsupported: false }).nodes.map((node) => node.id)).not.toContain("social");
    expect(filterBuilderGraph(view, { ...defaultBuilderGraphFilters, showFutureOnly: false }).nodes.map((node) => node.id)).not.toContain("rule");
  });

  it("builds read-only node and edge inspectors with connected items and text metadata", () => {
    const view = createBuilderGraphViewModel(graphWorkspace());
    const nodeInspector = getBuilderGraphInspector(view, { type: "node", id: "schema" });
    const edgeInspector = getBuilderGraphInspector(view, { type: "edge", id: "schema-references-social" });

    expect(nodeInspector).toMatchObject({
      eyebrow: "Structural node",
      executable: false,
      connectedNodeIds: ["entity", "social"],
      connectedEdgeIds: ["schema-contains-entity", "schema-references-social"]
    });
    expect(nodeInspector?.metadataText).toContain('"source": "fixture"');
    expect(nodeInspector?.limitation).toContain("not compiled");
    expect(edgeInspector).toMatchObject({
      eyebrow: "Structural edge",
      executable: false,
      connectedNodeIds: ["schema", "social"]
    });
    expect(edgeInspector?.limitation).toContain("not executable dataflow");
    expect(getBuilderGraphInspector(view, { type: "node", id: "missing" })).toBeNull();
    expect(getBuilderGraphInspector(view, { type: "edge", id: "missing" })).toBeNull();
  });

  it("returns deterministic neighborhoods and orthogonal structural edge paths", () => {
    const view = createBuilderGraphViewModel(graphWorkspace());
    const nodeNeighborhood = getBuilderGraphNeighborhood(view, { type: "node", id: "schema" });
    const edgeNeighborhood = getBuilderGraphNeighborhood(view, { type: "edge", id: "schema-references-social" });
    const source = view.nodes.find((node) => node.id === "schema")!;
    const target = view.nodes.find((node) => node.id === "social")!;

    expect(Array.from(nodeNeighborhood.nodeIds).sort()).toEqual(["entity", "schema", "social"]);
    expect(Array.from(nodeNeighborhood.edgeIds).sort()).toEqual(["schema-contains-entity", "schema-references-social"]);
    expect(Array.from(edgeNeighborhood.nodeIds).sort()).toEqual(["schema", "social"]);
    expect(createBuilderGraphEdgePath(source, target)).toMatch(/^M .+ H .+ V .+ H .+$/);
    expect(Array.from(getBuilderGraphNeighborhood(view, { type: "node", id: "missing" }).edgeIds)).toEqual([]);
  });

  it("resolves stale filtered selections predictably and uses collision-free node DOM ids", () => {
    const view = createBuilderGraphViewModel(graphWorkspace());
    const filtered = filterBuilderGraph(view, { ...defaultBuilderGraphFilters, nodeKind: "ruleDeclaration" });

    expect(resolveBuilderGraphSelection({ type: "node", id: "schema" }, filtered)).toEqual({ type: "node", id: "rule" });
    expect(resolveBuilderGraphSelection({ type: "node", id: "rule" }, filtered)).toEqual({ type: "node", id: "rule" });
    expect(resolveBuilderGraphSelection(null, { nodes: [], edges: filtered.edges })).toBeNull();
    expect(getBuilderGraphNodeDomId("a b")).not.toBe(getBuilderGraphNodeDomId("a-b"));
    expect(getBuilderGraphNodeDomId("a b")).toMatch(/^builder-graph-node-/);
  });

  it("supports empty, singleton, disconnected, and repeated-kind workspaces", () => {
    const empty = createBuilderGraphViewModel(graphWorkspace({ nodes: [], edges: [], validationMarkers: [], warningMarkers: [], unsupportedMarkers: [] }));
    expect(empty.nodes).toEqual([]);
    expect(empty.edges).toEqual([]);
    expect(empty.summary.visualGraphAvailable).toBe(true);

    const singleton = createBuilderGraphViewModel(
      graphWorkspace({
        nodes: [graphWorkspace().nodes[1]!],
        edges: [],
        validationMarkers: [],
        warningMarkers: [],
        unsupportedMarkers: []
      })
    );
    expect(singleton.nodes).toHaveLength(1);

    const repeated = createBuilderGraphViewModel(
      graphWorkspace({
        nodes: [
          { ...graphWorkspace().nodes[1]!, id: "entity-z", label: "Zed" },
          { ...graphWorkspace().nodes[1]!, id: "entity-a", label: "Alpha" },
          { ...graphWorkspace().nodes[2]!, id: "rule-disconnected" }
        ],
        edges: [],
        validationMarkers: [],
        warningMarkers: [],
        unsupportedMarkers: []
      })
    );
    expect(repeated.nodes.map((node) => node.id)).toEqual(["entity-a", "entity-z", "rule-disconnected"]);
    expect(new Set(repeated.nodes.map((node) => `${node.position.x}:${node.position.y}`)).size).toBe(3);
  });

  it("suppresses visual drawing above either threshold while retaining the full outline model", () => {
    const nodes = Array.from({ length: maxBuilderGraphVisualNodes + 1 }, (_, index) => ({
      id: `node-${index}`,
      label: `Node ${index}`,
      nodeKind: "custom" as const,
      status: "structuralOnly" as const,
      active: true,
      executable: false as const
    }));
    const oversized = createBuilderGraphViewModel(
      graphWorkspace({
        nodes,
        edges: [],
        validationMarkers: [],
        warningMarkers: [],
        unsupportedMarkers: []
      })
    );
    expect(oversized.nodes).toHaveLength(maxBuilderGraphVisualNodes + 1);
    expect(oversized.summary.visualGraphAvailable).toBe(false);

    const excessiveEdges = createBuilderGraphViewModel(
      graphWorkspace({
        nodes: graphWorkspace().nodes.slice(0, 2),
        edges: Array.from({ length: maxBuilderGraphVisualEdges + 1 }, (_, index) => ({
          id: `edge-${index}`,
          edgeKind: "references" as const,
          sourceNodeId: "schema",
          targetNodeId: "entity",
          active: true,
          executable: false as const
        })),
        validationMarkers: [],
        warningMarkers: [],
        unsupportedMarkers: []
      })
    );
    expect(excessiveEdges.edges).toHaveLength(maxBuilderGraphVisualEdges + 1);
    expect(excessiveEdges.summary.visualGraphAvailable).toBe(false);
  });

  it("keeps malformed references under the existing visual-workspace validator", () => {
    expect(() =>
      createBuilderGraphViewModel(
        graphWorkspace({
          edges: [
            {
              id: "bad-edge",
              edgeKind: "references",
              sourceNodeId: "schema",
              targetNodeId: "missing",
              active: true,
              executable: false
            }
          ]
        })
      )
    ).toThrow(/unknown targetNodeId/);

    expect(() => validateVisualBuilderWorkspaceDefinition(graphWorkspace())).not.toThrow();
  });
});
