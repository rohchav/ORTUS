import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deserializeVisualBuilderWorkspace,
  maxVisualBuilderWorkspaceJsonLength,
  visualBuilderWorkspaceArtifactType,
  type VisualBuilderWorkspaceDefinition
} from "../../simulation/visualBuilderWorkspace";
import {
  createBuilderWorkspaceViewModel,
  defaultBuilderWorkspaceFilters,
  exportBuilderWorkspaceJson,
  getInspectorViewModel,
  getSelectedWorkspaceItem,
  getVisibleWorkspaceEdges,
  getVisibleWorkspaceNodes,
  getWorkspaceStatusBadges,
  importBuilderWorkspaceJson
} from "./builderViewModel";

const repoRoot = process.cwd();

function workspaceFixture(overrides: Partial<VisualBuilderWorkspaceDefinition> = {}): VisualBuilderWorkspaceDefinition {
  return {
    artifactType: visualBuilderWorkspaceArtifactType,
    id: "builder-shell-workspace",
    name: "Builder Shell Test Workspace",
    description: "Structural inspection fixture with compatibility fit metadata that must not become run readiness.",
    version: "1.0.0",
    workspaceVersion: "1",
    modelSchemaId: "schema-1",
    scope: {
      modelSchemaId: "schema-1",
      knowledgeMemorySocialLearningModelId: "social-1",
      templateId: "opinion-dynamics",
      notes: ["Scope references are structural only."]
    },
    nodes: [
      {
        id: "schema-node",
        label: "Model Schema",
        nodeKind: "modelSchema",
        referencedArtifactType: "ortus.modelSchema",
        referencedArtifactId: "schema-1",
        status: "serviceOnly",
        position: { x: 0, y: 0 },
        active: true,
        executable: false,
        metadata: { compatibilityFit: "strong" }
      },
      {
        id: "parameter-node",
        label: "Parameter",
        nodeKind: "parameter",
        referencedSchemaElementId: "param-1",
        status: "structuralOnly",
        position: { x: 280, y: 0 },
        active: true,
        executable: false
      },
      {
        id: "rule-node",
        label: "Rule Declaration",
        nodeKind: "ruleDeclaration",
        referencedSchemaElementId: "rule-1",
        status: "futureOnly",
        position: { x: 0, y: 170 },
        active: true,
        executable: false
      },
      {
        id: "social-node",
        label: "Social Semantics",
        nodeKind: "socialLearningDescriptor",
        referencedArtifactType: "ortus.knowledgeMemorySocialLearningModel",
        referencedArtifactId: "social-1",
        status: "unsupported",
        position: { x: 280, y: 170 },
        active: false,
        executable: false
      },
      {
        id: "runtime-claim-node",
        label: "Runtime Claim",
        nodeKind: "futureCapability",
        status: "templateRuntimeSupported",
        position: { x: 560, y: 80 },
        active: false,
        executable: false,
        metadata: { compatibilityFit: "templateExact", lossyMapping: "visible" }
      }
    ],
    edges: [
      {
        id: "schema-to-parameter",
        label: "contains",
        edgeKind: "contains",
        sourceNodeId: "schema-node",
        targetNodeId: "parameter-node",
        active: true,
        executable: false
      },
      {
        id: "schema-to-social",
        edgeKind: "references",
        sourceNodeId: "schema-node",
        targetNodeId: "social-node",
        active: true,
        executable: false
      }
    ],
    panels: [
      {
        id: "structure-panel",
        label: "Structure",
        panelKind: "modelStructure",
        nodeIds: ["schema-node", "parameter-node"],
        active: true,
        executable: false
      }
    ],
    sections: [
      {
        id: "schema-section",
        label: "Schema",
        sectionKind: "schema",
        panelIds: ["structure-panel"],
        nodeIds: ["schema-node"],
        active: true,
        executable: false
      }
    ],
    artifactReferences: [
      {
        id: "schema-ref",
        label: "Schema Reference",
        artifactType: "ortus.modelSchema",
        artifactId: "schema-1",
        primitiveId: "modelSchema",
        role: "source",
        active: true,
        executable: false
      },
      {
        id: "compat-ref",
        label: "Compatibility Report Reference",
        artifactType: "ortus.schemaTemplateCompatibilityReport",
        artifactId: "compat-1",
        primitiveId: "schemaTemplateCompatibility",
        role: "context",
        active: true,
        executable: false
      },
      {
        id: "social-ref",
        label: "Social Reference",
        artifactType: "ortus.knowledgeMemorySocialLearningModel",
        artifactId: "social-1",
        primitiveId: "knowledgeMemorySocialLearning",
        role: "annotation",
        active: true,
        executable: false
      }
    ],
    validationMarkers: [
      {
        id: "not-runnable-marker",
        label: "Not Runnable",
        markerKind: "notRunnable",
        targetNodeId: "schema-node",
        severity: "warning",
        message: "Structurally valid is not runnable.",
        active: true,
        executable: false
      }
    ],
    warningMarkers: [
      {
        id: "edge-warning",
        label: "Edge Warning",
        markerKind: "warning",
        targetEdgeId: "schema-to-social",
        severity: "info",
        message: "Edges are visual links only.",
        active: true,
        executable: false
      }
    ],
    unsupportedMarkers: [
      {
        id: "unsupported-social",
        label: "Unsupported Social Runtime",
        markerKind: "unsupported",
        targetNodeId: "social-node",
        severity: "error",
        message: "Social-learning runtime is not implemented.",
        active: true,
        executable: false
      }
    ],
    selection: {
      selectedNodeIds: ["schema-node"],
      selectedEdgeIds: ["schema-to-parameter"],
      focusedPanelId: "structure-panel",
      focusedSectionId: "schema-section"
    },
    viewport: { x: 0, y: 0, zoom: 1 },
    layout: { layoutKind: "manual" },
    metadata: { purpose: "ui shell test" },
    ...overrides
  };
}

describe("safe builder UI shell", () => {
  it("defines empty and loaded shell UI states with non-runnable capability language", () => {
    const componentSource = readBuilderSource();
    expect(componentSource).toContain("Safe visual builder shell");
    expect(componentSource).toContain("No workspace loaded");
    expect(componentSource).toContain("Structural only");
    expect(componentSource).toContain("Not runnable");
    expect(componentSource).toContain("No compiler");
    expect(componentSource).toContain("No schema execution");
    expect(componentSource).toContain("nodes ·");
    expect(componentSource).toContain("edges ·");
    const warnings = createBuilderWorkspaceViewModel(workspaceFixture()).validationReport.warnings;
    expect(warnings).toContain("Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior.");
    expect(warnings).toContain("Social-learning references do not implement cognition or runtime learning.");
    expect(componentSource).not.toContain(">Run Model<");
    expect(componentSource).not.toContain(">Compile<");
    expect(componentSource).not.toContain(">Generate Scenario<");
    expect(componentSource).not.toContain(">Generate RunConfig<");
    expect(componentSource).not.toContain(">Apply to Template<");
  });

  it("builds deterministic view models, selection, inspector, and filters without mutating workspaces", () => {
    const workspace = workspaceFixture();
    const before = JSON.stringify(workspace);
    const viewModel = createBuilderWorkspaceViewModel(workspace);

    expect(viewModel.summary).toMatchObject({
      nodeCount: 5,
      edgeCount: 2,
      warningMarkerCount: 1,
      unsupportedMarkerCount: 1,
      executableCount: 0
    });
    expect(getWorkspaceStatusBadges(viewModel.validationReport).map((badge) => badge.label)).toEqual(
      expect.arrayContaining(["Structural only", "Structurally valid", "Not runnable", "Service only", "No compiler", "No schema execution"])
    );
    expect(viewModel.limitations).toEqual(
      expect.arrayContaining([
        "Compatibility reports describe fit, not run readiness.",
        "Strong or templateExact compatibility is not runnable without runtime capability proof.",
        "Social-learning nodes do not implement cognition."
      ])
    );

    expect(getVisibleWorkspaceNodes(viewModel, { nodeKind: "modelSchema", nodeStatus: "all" }).map((node) => node.id)).toEqual(["schema-node"]);
    expect(getVisibleWorkspaceNodes(viewModel, { nodeKind: "all", nodeStatus: "unsupported" }).map((node) => node.id)).toEqual(["social-node"]);
    expect(getVisibleWorkspaceNodes(viewModel, { nodeKind: "all", nodeStatus: "futureOnly" }).map((node) => node.id)).toEqual(["rule-node"]);
    const visible = getVisibleWorkspaceNodes(viewModel, { nodeKind: "modelSchema", nodeStatus: "all" });
    expect(getVisibleWorkspaceEdges(viewModel, visible)).toHaveLength(0);

    expect(getSelectedWorkspaceItem(viewModel, { type: "section", id: "schema-section" })).toMatchObject({ label: "Schema" });
    expect(getSelectedWorkspaceItem(viewModel, { type: "panel", id: "structure-panel" })).toMatchObject({ label: "Structure" });

    const nodeInspector = getInspectorViewModel(viewModel, { type: "node", id: "schema-node" });
    expect(nodeInspector).toMatchObject({ heading: "Model Schema", readOnly: true });
    expect(nodeInspector?.runtimeLimitation).toContain("not compiled");
    expect(nodeInspector?.connectedEdgeIds).toEqual(["schema-to-parameter", "schema-to-social"]);
    expect(nodeInspector?.markerIds).toEqual(["not-runnable-marker"]);

    const edgeInspector = getInspectorViewModel(viewModel, { type: "edge", id: "schema-to-social" });
    expect(edgeInspector?.runtimeLimitation).toContain("not executable dataflow");
    expect(edgeInspector?.rows.some((row) => row.label === "Source node" && row.value === "schema-node")).toBe(true);

    const markerInspector = getInspectorViewModel(viewModel, { type: "marker", id: "unsupported-social" });
    expect(markerInspector).toMatchObject({ heading: "Unsupported Social Runtime", readOnly: true });
    expect(markerInspector?.rows.some((row) => row.label === "Message" && row.value === "Social-learning runtime is not implemented.")).toBe(true);

    const referenceInspector = getInspectorViewModel(viewModel, { type: "artifactReference", id: "compat-ref" });
    expect(referenceInspector?.runtimeLimitation).toContain("does not activate model schemas, compatibility reports, or social-learning semantics");

    expect(JSON.stringify(workspace)).toBe(before);
  });

  it("imports and exports only validated visual-builder workspace artifacts while preserving previous valid state on failure", () => {
    const workspace = workspaceFixture();
    const json = exportBuilderWorkspaceJson(workspace);
    const success = importBuilderWorkspaceJson(null, json);
    expect(success.changed).toBe(true);
    expect(success.workspace?.id).toBe("builder-shell-workspace");

    const previous = success.workspace;
    expect(importBuilderWorkspaceJson(previous, "{").workspace).toBe(previous);
    expect(importBuilderWorkspaceJson(previous, JSON.stringify({ artifactType: "ortus.modelSchema" }))).toMatchObject({
      workspace: previous,
      changed: false
    });
    expect(importBuilderWorkspaceJson(previous, JSON.stringify({ ...workspace, id: "" }))).toMatchObject({ workspace: previous, changed: false });
    expect(importBuilderWorkspaceJson(previous, "x".repeat(maxVisualBuilderWorkspaceJsonLength + 1))).toMatchObject({
      workspace: previous,
      changed: false
    });
    expect(importBuilderWorkspaceJson(previous, JSON.stringify({ ...workspace, metadata: { createEngine: true } }))).toMatchObject({
      workspace: previous,
      changed: false
    });

    const roundTrip = deserializeVisualBuilderWorkspace(json);
    expect(roundTrip.id).toBe(workspace.id);
    expect(json).not.toContain("activeEngine");
    expect(json).not.toContain("generateScenario");
    expect(json).not.toContain("generateRunConfig");
    expect(json).not.toContain("generateSnapshot");
    expect(json).not.toContain("generatedCode");
  });

  it("keeps accessibility hooks text-readable without pointer-only or color-only semantics", () => {
    const componentSource = readBuilderSource();
    const viewModel = createBuilderWorkspaceViewModel(workspaceFixture());
    expect(componentSource).toContain('aria-label="Safe visual builder shell"');
    expect(componentSource).toContain('aria-label="Builder navigation and import"');
    expect(componentSource).toContain('aria-label="Read-only visual workspace descriptors"');
    expect(componentSource).toContain('aria-label="Selected workspace item inspector"');
    expect(componentSource).toContain('role="status"');
    expect(componentSource).toContain('role="alert"');
    expect(componentSource).toContain("aria-label={`Node ${node.label}, ${formatNodeKind(node.nodeKind)}, ${formatNodeStatus(node.status)}`}");
    expect(componentSource).toContain("{edge.sourceNodeId} → {edge.targetNodeId}");
    expect(componentSource).toContain("Reset View");
    expect(getVisibleWorkspaceNodes(viewModel, defaultBuilderWorkspaceFilters)).toHaveLength(5);
  });

  it("does not wire builder components into simulation runtime, graph execution, schema execution, or unsafe rendering", () => {
    const builderSource = readBuilderSource();
    const packageJson = readFileSync(join(repoRoot, "package.json"), "utf8");

    expect(builderSource).not.toMatch(/from ["'][^"']*simulationStore["']/);
    expect(builderSource).not.toContain("useSimulationStore");
    expect(builderSource).not.toContain("SimulationEngine");
    expect(builderSource).not.toContain("latestSnapshot");
    expect(builderSource).not.toContain("runFrameSteps");
    expect(builderSource).not.toContain("selectedTemplateId");
    expect(builderSource).not.toContain("dangerouslySetInnerHTML");
    expect(builderSource).not.toContain("eval(");
    expect(builderSource).not.toContain("new Function");
    expect(builderSource).not.toMatch(/from ["'][^"']*(reactflow|react-flow|cytoscape|d3|dagre|elkjs)[^"']*["']/i);
    expect(builderSource).not.toMatch(/from ["'][^"']*(netlogo|mesa|mason)[^"']*["']/i);
    expect(builderSource).not.toMatch(/from ["'][^"']*(recommender|targeting|fact.?check|modelWeight|embedding)[^"']*["']/i);
    expect(packageJson).not.toMatch(/reactflow|react-flow|cytoscape|d3|dagre|elkjs/i);

    for (const forbiddenLabel of [
      "Run Model",
      ">Compile<",
      ">Simulate<",
      "Generate Scenario",
      "Generate RunConfig",
      "Apply to Template",
      ">Deploy<",
      "Publish as runtime"
    ]) {
      expect(builderSource).not.toContain(forbiddenLabel);
    }
  });
});

function readBuilderSource(): string {
  const builderDir = join(repoRoot, "src", "components", "builder");
  return [
    ...readdirSync(builderDir)
      .filter((file) => (file.endsWith(".ts") || file.endsWith(".tsx")) && !file.endsWith(".test.ts"))
      .map((file) => readFileSync(join(builderDir, file), "utf8")),
    readFileSync(join(repoRoot, "src", "app", "builder", "page.tsx"), "utf8")
  ].join("\n");
}
