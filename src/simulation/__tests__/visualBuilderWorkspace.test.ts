import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deserializeVisualBuilderWorkspace,
  getArtifactFamily,
  getVisualBuilderWorkspaceArtifactReference,
  getEdgesForNode,
  getMarker,
  getPanel,
  getPrimitive,
  getSection,
  getTemplateCapability,
  getVisualBuilderWorkspaceValidationReport,
  getVisualBuilderWorkspaceWarnings,
  getWorkspaceEdge,
  getWorkspaceNode,
  listActiveWorkspaceNodes,
  listVisualBuilderWorkspaceArtifactReferences,
  listVisualBuilderWorkspaceArtifactReferencesByRole,
  listVisualBuilderWorkspaceArtifactReferencesByType,
  listPanels,
  listPanelsByKind,
  listReservedPrimitives,
  listSections,
  listSectionsByKind,
  listServiceOnlyPrimitives,
  listUnsupportedMarkers,
  listValidationMarkers,
  listWarningMarkers,
  listWorkspaceEdges,
  listWorkspaceEdgesByKind,
  listWorkspaceNodes,
  listWorkspaceNodesByKind,
  listWorkspaceNodesByStatus,
  listMarkersForEdge,
  listMarkersForNode,
  productionTemplates,
  serializeVisualBuilderWorkspace,
  summarizeVisualBuilderWorkspace,
  validateCompositionCapabilities,
  validateHybridComposition,
  validateVisualBuilderWorkspaceDefinition,
  visualBuilderWorkspace,
  visualBuilderWorkspaceArtifactType,
  workspaceHasNodeKind,
  workspaceHasNodeStatus,
  workspaceReferencesArtifactType,
  type HybridModelComposition,
  type VisualBuilderWorkspaceDefinition
} from "../index";

const repoRoot = process.cwd();
const requiredVisualWorkspaceDocPhrases = [
  "Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges.",
  "The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime.",
  "A structurally valid workspace is still not a runnable model.",
  "Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics."
] as const;

const requiredLiveStateForbiddenKeys = [
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "metricHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "runState",
  "runSummary",
  "runSummaries",
  "template",
  "activeEngine"
] as const;

const requiredUnsafeVisualWorkspaceKeys = [
  "formula",
  "expression",
  "equation",
  "code",
  "script",
  "javascript",
  "typescript",
  "python",
  "functionBody",
  "runtime",
  "execute",
  "executor",
  "stepFunction",
  "tickFunction",
  "behaviorFunction",
  "ruleFunction",
  "simulationLoop",
  "visualBuilderRuntime",
  "nodeRuntime",
  "edgeRuntime",
  "dataflowRuntime",
  "blockProgram",
  "visualProgram",
  "graphProgram",
  "graphExecution",
  "compile",
  "compiler",
  "interpreter",
  "parser",
  "transpiler",
  "codegen",
  "generatedCode",
  "generateTemplate",
  "generateScenario",
  "generateRunConfig",
  "generateSnapshot",
  "createEngine",
  "applyScenario",
  "netlogoCode",
  "mesaModel",
  "masonModel",
  "externalAdapter",
  "externalRuntime",
  "llm",
  "largeLanguageModel",
  "embedding",
  "embeddings",
  "modelWeights",
  "trainingData",
  "realPersonProfile",
  "protectedAttributeInference",
  "persuasionOptimization",
  "microtargeting",
  "proof",
  "certification",
  "riskScore",
  "safetyScore"
] as const;

const forbiddenUiRuntimeKeys = [
  "reactComponent",
  "componentRef",
  "domRef",
  "canvasRef",
  "uiRuntime",
  "visualBuilderUi",
  "nodeEditor",
  "nodeCanvas",
  "graphRenderer",
  "toolbar",
  "palette",
  "saveLoadUi",
  "runModelButton",
  "schemaAuthoringForm",
  "dragDropRuntime"
] as const;

function minimalWorkspace(overrides: Partial<VisualBuilderWorkspaceDefinition> = {}): VisualBuilderWorkspaceDefinition {
  return {
    artifactType: visualBuilderWorkspaceArtifactType,
    id: "workspace-minimal",
    name: "Minimal Workspace",
    version: "1.0.0",
    workspaceVersion: "1",
    modelSchemaId: "schema-1",
    nodes: [
      {
        id: "schema-node",
        label: "Model Schema",
        nodeKind: "modelSchema",
        referencedArtifactType: "ortus.modelSchema",
        referencedArtifactId: "schema-1",
        status: "serviceOnly",
        active: true,
        executable: false
      }
    ],
    ...overrides
  };
}

function fullWorkspace(overrides: Partial<VisualBuilderWorkspaceDefinition> = {}): VisualBuilderWorkspaceDefinition {
  return minimalWorkspace({
    id: "workspace-full",
    name: "Full Workspace",
    description:
      "A universal builder planning draft that mentions node graph execution, drag-and-drop runtime, visual programming, NetLogo/Mesa/MASON compatibility, social-learning runtime, human cognition, and LLM agents.",
    scope: {
      modelSchemaId: "schema-1",
      hybridCompositionId: "composition-1",
      scenarioId: "scenario-1",
      templateId: "opinion-dynamics",
      knowledgeMemorySocialLearningModelId: "social-1",
      observabilityModelId: "observability-1",
      causalAssumptionModelId: "causal-1",
      quantitySemanticsModelId: "quantity-1",
      networkDefinitionId: "network-1",
      resourceSystemId: "resource-1",
      feedbackLoopModelId: "feedback-1",
      boundaryModelId: "boundary-1",
      fieldLayerId: "field-1",
      scaleModelId: "scale-1",
      controlStrategyModelId: "control-1",
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
        size: { width: 240, height: 140 },
        active: true,
        executable: false
      },
      {
        id: "entity-node",
        label: "Agent Entity",
        nodeKind: "entityType",
        referencedSchemaElementId: "agent",
        status: "structuralOnly",
        collapsed: false,
        active: true,
        executable: false
      },
      {
        id: "rule-node",
        label: "Rule Declaration",
        nodeKind: "ruleDeclaration",
        referencedSchemaElementId: "rule-1",
        status: "futureOnly",
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
        active: false,
        executable: false
      },
      {
        id: "runtime-node",
        label: "Template Runtime",
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
        sourceNodeId: "schema-node",
        targetNodeId: "entity-node",
        active: true,
        executable: false
      },
      {
        id: "schema-references-social",
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
        nodeIds: ["schema-node", "entity-node"],
        active: true,
        executable: false
      },
      {
        id: "warnings-panel",
        label: "Warnings",
        panelKind: "warnings",
        nodeIds: ["rule-node", "social-node"],
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
      },
      {
        id: "future-section",
        label: "Future Work",
        sectionKind: "futureWork",
        panelIds: ["warnings-panel"],
        nodeIds: ["rule-node"],
        active: true,
        executable: false
      }
    ],
    artifactReferences: [
      {
        id: "schema-ref",
        label: "Schema Ref",
        artifactType: "ortus.modelSchema",
        artifactId: "schema-1",
        primitiveId: "modelSchema",
        role: "source",
        active: true,
        executable: false
      },
      {
        id: "social-ref",
        label: "Social Ref",
        artifactType: "ortus.knowledgeMemorySocialLearningModel",
        artifactId: "social-1",
        primitiveId: "knowledgeMemorySocialLearning",
        role: "context",
        active: true,
        executable: false
      },
      {
        id: "future-ref",
        label: "Future Ref",
        artifactType: "ortus.visualModelBuilder",
        artifactId: "future-builder",
        primitiveId: "visualModelBuilder",
        role: "futureDependency",
        active: false,
        executable: false
      }
    ],
    validationMarkers: [
      {
        id: "not-runnable",
        label: "Not Runnable",
        markerKind: "notRunnable",
        targetNodeId: "schema-node",
        severity: "warning",
        message: "Valid workspace is not runnable.",
        active: true,
        executable: false
      }
    ],
    warningMarkers: [
      {
        id: "edge-warning",
        label: "Edge Warning",
        markerKind: "warning",
        targetEdgeId: "schema-references-social",
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
      selectedEdgeIds: ["schema-contains-entity"],
      focusedPanelId: "structure-panel",
      focusedSectionId: "schema-section"
    },
    viewport: { x: 10, y: -20, zoom: 1.25 },
    layout: { layoutKind: "manual" },
    assumptionNotes: [{ id: "assumption-1", label: "Structural", description: "Planning metadata only.", severity: "info", confidence: "unknown" }],
    limitationNotes: [
      {
        id: "limit-1",
        label: "No runtime",
        description: "No runnable visual builder runtime exists.",
        severity: "caution",
        confidence: "high"
      }
    ],
    validationNotes: [{ id: "validation-1", label: "Internal", description: "Schema validation only.", severity: "info", confidence: "medium" }],
    metadata: { purpose: "planning" },
    ...overrides
  });
}

function hybridComposition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: "ortus.hybridComposition",
    id: "hybrid-workspace",
    name: "Hybrid Workspace",
    version: "1",
    baseTemplateId: "opinion-dynamics",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

function expectInvalid(label: string, value: unknown, pattern?: RegExp): void {
  expect(
    () => validateVisualBuilderWorkspaceDefinition(value),
    label
  ).toThrow(pattern ?? /Invalid visual builder workspace|Visual builder workspace/);
}

describe("visual builder workspace schema service", () => {
  it("validates minimal and full workspaces while rejecting malformed structure and unsafe payloads", () => {
    expect(validateVisualBuilderWorkspaceDefinition(minimalWorkspace()).id).toBe("workspace-minimal");
    expect(validateVisualBuilderWorkspaceDefinition(fullWorkspace()).nodes).toHaveLength(5);

    expectInvalid("missing id", { ...minimalWorkspace(), id: "" }, /id/);
    expectInvalid("missing name", { ...minimalWorkspace(), name: "" }, /name/);
    expectInvalid("invalid artifactType", { ...minimalWorkspace(), artifactType: "ortus.modelSchema" }, /artifactType/);
    expectInvalid("invalid version", { ...minimalWorkspace(), version: "" }, /version/);
    expectInvalid("invalid workspaceVersion", { ...minimalWorkspace(), workspaceVersion: "2" }, /workspaceVersion/);
    const { nodes: _nodes, ...withoutNodes } = minimalWorkspace();
    expectInvalid("missing nodes", withoutNodes, /nodes/);
    expectInvalid("duplicate node ids", minimalWorkspace({ nodes: [minimalWorkspace().nodes[0]!, minimalWorkspace().nodes[0]!] }), /Duplicate workspace node id/);
    expectInvalid("duplicate edge ids", fullWorkspace({ edges: [fullWorkspace().edges![0]!, fullWorkspace().edges![0]!] }), /Duplicate workspace edge id/);
    expectInvalid("duplicate panel ids", fullWorkspace({ panels: [fullWorkspace().panels![0]!, fullWorkspace().panels![0]!] }), /Duplicate workspace panel id/);
    expectInvalid("duplicate section ids", fullWorkspace({ sections: [fullWorkspace().sections![0]!, fullWorkspace().sections![0]!] }), /Duplicate workspace section id/);
    expectInvalid(
      "duplicate marker ids",
      fullWorkspace({ warningMarkers: [{ ...fullWorkspace().validationMarkers![0]!, targetNodeId: "entity-node" }] }),
      /Duplicate workspace marker id/
    );
    expectInvalid(
      "duplicate artifact refs",
      fullWorkspace({ artifactReferences: [fullWorkspace().artifactReferences![0]!, fullWorkspace().artifactReferences![0]!] }),
      /Duplicate workspace artifact reference id/
    );

    expectInvalid("invalid nodeKind", minimalWorkspace({ nodes: [{ ...minimalWorkspace().nodes[0]!, nodeKind: "bad" as never }] }), /nodeKind/);
    expectInvalid("invalid node status", minimalWorkspace({ nodes: [{ ...minimalWorkspace().nodes[0]!, status: "bad" as never }] }), /status/);
    expectInvalid("node executable true", minimalWorkspace({ nodes: [{ ...minimalWorkspace().nodes[0]!, executable: true as never }] }), /executable/);
    expectInvalid("invalid edgeKind", fullWorkspace({ edges: [{ ...fullWorkspace().edges![0]!, edgeKind: "bad" as never }] }), /edgeKind/);
    expectInvalid("edge unknown source", fullWorkspace({ edges: [{ ...fullWorkspace().edges![0]!, sourceNodeId: "missing" }] }), /sourceNodeId/);
    expectInvalid("edge unknown target", fullWorkspace({ edges: [{ ...fullWorkspace().edges![0]!, targetNodeId: "missing" }] }), /targetNodeId/);
    expectInvalid("edge executable true", fullWorkspace({ edges: [{ ...fullWorkspace().edges![0]!, executable: true as never }] }), /executable/);
    expectInvalid("invalid panelKind", fullWorkspace({ panels: [{ ...fullWorkspace().panels![0]!, panelKind: "bad" as never }] }), /panelKind/);
    expectInvalid("panel unknown node", fullWorkspace({ panels: [{ ...fullWorkspace().panels![0]!, nodeIds: ["missing"] }] }), /nodeId/);
    expectInvalid("panel executable true", fullWorkspace({ panels: [{ ...fullWorkspace().panels![0]!, executable: true as never }] }), /executable/);
    expectInvalid("invalid sectionKind", fullWorkspace({ sections: [{ ...fullWorkspace().sections![0]!, sectionKind: "bad" as never }] }), /sectionKind/);
    expectInvalid("section unknown panel", fullWorkspace({ sections: [{ ...fullWorkspace().sections![0]!, panelIds: ["missing"] }] }), /panelId/);
    expectInvalid("section unknown node", fullWorkspace({ sections: [{ ...fullWorkspace().sections![0]!, nodeIds: ["missing"] }] }), /nodeId/);
    expectInvalid("section executable true", fullWorkspace({ sections: [{ ...fullWorkspace().sections![0]!, executable: true as never }] }), /executable/);
    expectInvalid("invalid markerKind", fullWorkspace({ validationMarkers: [{ ...fullWorkspace().validationMarkers![0]!, markerKind: "bad" as never }] }), /markerKind/);
    expectInvalid("invalid severity", fullWorkspace({ validationMarkers: [{ ...fullWorkspace().validationMarkers![0]!, severity: "bad" as never }] }), /severity/);
    expectInvalid("marker unknown node", fullWorkspace({ validationMarkers: [{ ...fullWorkspace().validationMarkers![0]!, targetNodeId: "missing" }] }), /targetNodeId/);
    expectInvalid("marker unknown edge", fullWorkspace({ warningMarkers: [{ ...fullWorkspace().warningMarkers![0]!, targetEdgeId: "missing" }] }), /targetEdgeId/);
    expectInvalid("marker missing message", fullWorkspace({ validationMarkers: [{ ...fullWorkspace().validationMarkers![0]!, message: "" }] }), /message/);
    expectInvalid("marker executable true", fullWorkspace({ validationMarkers: [{ ...fullWorkspace().validationMarkers![0]!, executable: true as never }] }), /executable/);
    expectInvalid(
      "invalid artifact reference role",
      fullWorkspace({ artifactReferences: [{ ...fullWorkspace().artifactReferences![0]!, role: "bad" as never }] }),
      /role/
    );
    expectInvalid(
      "artifact reference missing artifact type",
      fullWorkspace({ artifactReferences: [{ ...fullWorkspace().artifactReferences![0]!, artifactType: undefined as never }] }),
      /artifactType/
    );
    expectInvalid(
      "artifact reference executable true",
      fullWorkspace({ artifactReferences: [{ ...fullWorkspace().artifactReferences![0]!, executable: true as never }] }),
      /executable/
    );
    expectInvalid("selection unknown node", fullWorkspace({ selection: { selectedNodeIds: ["missing"] } }), /selectedNodeId/);
    expectInvalid("selection unknown edge", fullWorkspace({ selection: { selectedEdgeIds: ["missing"] } }), /selectedEdgeId/);
    expectInvalid("focused panel unknown", fullWorkspace({ selection: { focusedPanelId: "missing" } }), /focusedPanelId/);
    expectInvalid("focused section unknown", fullWorkspace({ selection: { focusedSectionId: "missing" } }), /focusedSectionId/);
    expectInvalid("non-finite viewport", fullWorkspace({ viewport: { x: Number.NaN } }), /non-finite|viewport/);
    expectInvalid("invalid layoutKind", fullWorkspace({ layout: { layoutKind: "bad" as never } }), /layoutKind/);
    expectInvalid("unknown top-level field", { ...minimalWorkspace(), extra: true }, /Unrecognized key|Invalid visual builder workspace/);
    expectInvalid("oversized workspace", minimalWorkspace({ metadata: { huge: "x".repeat(300_000) } }), /characters or less/);
    expectInvalid("function payload", minimalWorkspace({ metadata: { handler: () => null } as never }), /plain JSON/);
    class BadPayload {
      value = 1;
    }
    expectInvalid("class/prototype payload", minimalWorkspace({ metadata: { payload: new BadPayload() } as never }), /plain JSON/);
    expectInvalid("top-level array", [], /Invalid visual builder workspace/);
    expectInvalid("non-plain date payload", minimalWorkspace({ metadata: { when: new Date() } as never }), /plain JSON/);
    const cyclicPayload: Record<string, unknown> = {};
    cyclicPayload.self = cyclicPayload;
    expectInvalid("cyclic object payload", minimalWorkspace({ metadata: { cyclicPayload } as never }), /acyclic plain JSON/);

    for (const [label, metadata] of [
      ["live state", { activeEngine: {} }],
      ["formula/code/script", { formula: "x + 1" }],
      ["visual programming", { blockProgram: {} }],
      ["graph execution", { graphExecution: {} }],
      ["compiler", { compiler: {} }],
      ["schema generation", { generateTemplate: true }],
      ["runtime engine", { createEngine: true }],
      ["external framework", { mesaModel: {} }],
      ["LLM", { llm: {} }],
      ["embedding", { embeddings: [] }],
      ["model weights", { modelWeights: {} }],
      ["training data", { trainingData: [] }],
      ["real person", { realPersonProfile: {} }],
      ["protected class", { protectedAttributeInference: {} }],
      ["persuasion", { persuasionOptimization: {} }],
      ["microtargeting", { microtargeting: {} }],
      ["proof", { proof: {} }],
      ["certification", { certification: {} }],
      ["safety risk", { safetyScore: 1, riskScore: 1 }]
    ] as const) {
      expectInvalid(label, minimalWorkspace({ metadata: metadata as never }), /must not contain/);
    }

    for (const key of [...requiredLiveStateForbiddenKeys, ...requiredUnsafeVisualWorkspaceKeys, ...forbiddenUiRuntimeKeys]) {
      expectInvalid(`forbidden key ${key}`, minimalWorkspace({ metadata: { [key]: true } as never }), /must not contain/);
    }
  });

  it("surfaces structural-only warnings without implying runtime behavior", () => {
    const warnings = getVisualBuilderWorkspaceWarnings(fullWorkspace());
    expect(warnings).toContain("Visual builder workspaces are structural planning artifacts; they do not implement runnable visual model authoring.");
    expect(warnings).toContain("Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior.");
    expect(warnings).toContain("A valid visual builder workspace does not make a model schema runnable.");
    expect(warnings).toContain("Prompt 34 adds a read-only builder shell; it does not add drag-and-drop modeling, visual programming, or schema execution.");
    expect(warnings).toContain("Active workspace declarations are structurally active only; active does not mean runtime-executed.");
    expect(warnings).toContain("Workspace nodes are visual descriptors, not runtime objects.");
    expect(warnings).toContain("Workspace edges are visual/semantic links, not dataflow execution.");
    expect(warnings).toContain("Workspace layout metadata is visual metadata, not simulation topology.");
    expect(warnings).toContain("Viewport and camera metadata is display-only.");
    expect(warnings).toContain("Selection metadata does not mutate runtime state.");
    expect(warnings).toContain("Artifact references are structural references only; reference or attachment does not activate behavior.");
    expect(warnings).toContain("ModelSchema references do not make schemas executable.");
    expect(warnings).toContain("Social-learning references do not implement cognition or runtime learning.");
    expect(warnings).toContain("Observability references do not measure runtime data.");
    expect(warnings).toContain("Causal references do not prove causality.");
    expect(warnings).toContain("Network references do not execute network behavior.");
    expect(warnings).toContain("Resource references do not execute stock/flow behavior.");
    expect(warnings).toContain("Feedback references do not run feedback loops.");
    expect(warnings).toContain("Control references do not execute policies.");
    expect(warnings).toContain("No runnable visual builder runtime exists in V1.");
    expect(warnings).toContain("No schema execution exists in V1.");
    expect(warnings).toContain("No compiler exists in V1.");
    expect(warnings).toContain("No external framework interop exists in V1.");
    expect(warnings).toContain("No custom model runtime exists in V1.");
    expect(warnings).toContain("No node editor or graph editing exists in V1.");
    expect(warnings).toContain("Workspace artifacts cannot generate scenarios, RunConfigs, snapshots, templates, or engines.");
    expect(warnings).toContain("Universal builder wording is unsupported; this workspace is not a universal model builder.");
    expect(warnings).toContain("Node graph execution wording is unsupported; workspace graphs are not executed.");
    expect(warnings).toContain("Drag-and-drop runtime wording is unsupported; Prompt 34 does not add drag-and-drop modeling.");
    expect(warnings).toContain("Visual programming wording is unsupported; Prompt 34 does not implement visual programming.");
    expect(warnings).toContain("NetLogo/Mesa/MASON compatibility wording is unsupported; external framework interop is not implemented.");
    expect(warnings).toContain("Social/cognitive runtime wording is unsupported; social-learning workspace nodes do not implement cognition or runtime learning.");
    expect(warnings).toContain("LLM-agent wording is unsupported; no LLM-agent runtime exists in V1.");
  });

  it("queries workspace structure deterministically without mutating inputs", () => {
    const workspace = fullWorkspace();
    const before = JSON.stringify(workspace);
    expect(listWorkspaceNodes(workspace)).toHaveLength(5);
    expect(getWorkspaceNode(workspace, "schema-node")?.nodeKind).toBe("modelSchema");
    expect(listWorkspaceNodesByKind(workspace, "modelSchema")).toHaveLength(1);
    expect(listWorkspaceNodesByStatus(workspace, "futureOnly")).toHaveLength(1);
    expect(listActiveWorkspaceNodes(workspace)).toHaveLength(3);
    expect(listWorkspaceEdges(workspace)).toHaveLength(2);
    expect(getWorkspaceEdge(workspace, "schema-references-social")?.edgeKind).toBe("references");
    expect(listWorkspaceEdgesByKind(workspace, "contains")).toHaveLength(1);
    expect(getEdgesForNode(workspace, "schema-node")).toHaveLength(2);
    expect(listPanels(workspace)).toHaveLength(2);
    expect(getPanel(workspace, "structure-panel")?.panelKind).toBe("modelStructure");
    expect(listPanelsByKind(workspace, "warnings")).toHaveLength(1);
    expect(listSections(workspace)).toHaveLength(2);
    expect(getSection(workspace, "schema-section")?.sectionKind).toBe("schema");
    expect(listSectionsByKind(workspace, "futureWork")).toHaveLength(1);
    expect(listValidationMarkers(workspace)).toHaveLength(1);
    expect(listWarningMarkers(workspace)).toHaveLength(1);
    expect(listUnsupportedMarkers(workspace)).toHaveLength(1);
    expect(getMarker(workspace, "not-runnable")?.markerKind).toBe("notRunnable");
    expect(listMarkersForNode(workspace, "social-node")).toHaveLength(1);
    expect(listMarkersForEdge(workspace, "schema-references-social")).toHaveLength(1);
    expect(listVisualBuilderWorkspaceArtifactReferences(workspace)).toHaveLength(3);
    expect(getVisualBuilderWorkspaceArtifactReference(workspace, "schema-ref")?.artifactType).toBe("ortus.modelSchema");
    expect(listVisualBuilderWorkspaceArtifactReferencesByType(workspace, "ortus.modelSchema")).toHaveLength(1);
    expect(listVisualBuilderWorkspaceArtifactReferencesByRole(workspace, "context")).toHaveLength(1);
    expect(visualBuilderWorkspace.listArtifactReferences(workspace)).toHaveLength(3);
    expect(visualBuilderWorkspace.getArtifactReference(workspace, "schema-ref")?.artifactType).toBe("ortus.modelSchema");
    expect(workspaceHasNodeKind(workspace, "socialLearningDescriptor")).toBe(true);
    expect(workspaceHasNodeStatus(workspace, "unsupported")).toBe(true);
    expect(workspaceReferencesArtifactType(workspace, "ortus.knowledgeMemorySocialLearningModel")).toBe(true);
    expect(summarizeVisualBuilderWorkspace(workspace)).toMatchObject({
      id: "workspace-full",
      nodeCount: 5,
      edgeCount: 2,
      panelCount: 2,
      sectionCount: 2,
      artifactReferenceCount: 3,
      validationMarkerCount: 1,
      warningMarkerCount: 1,
      unsupportedMarkerCount: 1,
      executableCount: 0,
      structuralOnlyNodeCount: 1,
      serviceOnlyNodeCount: 1,
      futureOnlyNodeCount: 1,
      unsupportedNodeCount: 1
    });
    expect(getVisualBuilderWorkspaceValidationReport(workspace)).toMatchObject({
      workspaceId: "workspace-full",
      valid: true,
      runnableNow: false,
      visualBuilderRuntimeAvailable: false,
      schemaExecutionAvailable: false,
      compilerAvailable: false,
      missingCapabilities: expect.arrayContaining(["runnable visual builder runtime", "schema execution", "compiler/interpreter runtime"])
    });
    expect(getVisualBuilderWorkspaceValidationReport({ artifactType: visualBuilderWorkspaceArtifactType })).toMatchObject({
      valid: false,
      runnableNow: false
    });
    const clonedNodes = [...listWorkspaceNodes(workspace)];
    clonedNodes[0]!.label = "Mutated clone";
    expect(getWorkspaceNode(workspace, "schema-node")?.label).toBe("Model Schema");
    expect(JSON.stringify(workspace)).toBe(before);
  });

  it("serializes only visual-builder workspace artifacts and rejects unsafe imports", () => {
    const workspace = fullWorkspace();
    const json = serializeVisualBuilderWorkspace(workspace);
    expect(json).toContain(`"artifactType": "${visualBuilderWorkspaceArtifactType}"`);
    expect(deserializeVisualBuilderWorkspace(json)).toMatchObject({ id: "workspace-full" });

    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.networkMetrics",
      "ortus.resourceSystem",
      "ortus.resourceMetrics",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.feedbackEventMetrics",
      "ortus.hybridComposition",
      "ortus.scaleModel",
      "ortus.scaleViewState",
      "ortus.boundaryModel",
      "ortus.fieldLayer",
      "ortus.observabilityModel",
      "ortus.causalAssumptionModel",
      "ortus.quantitySemanticsModel",
      "ortus.emergencePatternModel",
      "ortus.robustnessResilienceModel",
      "ortus.controlStrategyModel",
      "ortus.modelSchema",
      "ortus.knowledgeMemorySocialLearningModel"
    ]) {
      expect(() => deserializeVisualBuilderWorkspace(JSON.stringify({ artifactType }))).toThrow(/artifact type/);
    }

    for (const metadata of [
      { activeEngine: {} },
      { formula: "x + 1" },
      { functionBody: "return 1" },
      { blockProgram: {} },
      { visualProgram: {} },
      { graphProgram: {} },
      { compiler: {} },
      { generatedCode: "const x = 1" },
      { createEngine: true },
      { generateScenario: true },
      { externalRuntime: {} },
      { llm: {} },
      { modelWeights: {} },
      { embeddings: [] },
      { trainingData: [] },
      { realPersonProfile: {} },
      { protectedAttributeInference: {} },
      { persuasionOptimization: {} },
      { microtargeting: {} },
      { proof: {} },
      { certification: {} },
      { riskScore: 1 }
    ]) {
      expect(() => deserializeVisualBuilderWorkspace(JSON.stringify(minimalWorkspace({ metadata: metadata as never })))).toThrow();
    }
    expect(() => deserializeVisualBuilderWorkspace([])).toThrow(/artifact type/);
    expect(() => deserializeVisualBuilderWorkspace(JSON.stringify([]))).toThrow(/artifact type/);
    expect(() => deserializeVisualBuilderWorkspace(JSON.stringify({ artifactType: visualBuilderWorkspaceArtifactType, nodes: [] }))).toThrow(/id/);
    expect(() => deserializeVisualBuilderWorkspace(JSON.stringify({ ...minimalWorkspace(), nodes: "bad" }))).toThrow(/nodes/);
    expect(() => deserializeVisualBuilderWorkspace("x".repeat(300_000))).toThrow(/JSON/);
  });

  it("integrates with registry and hybrid composition without satisfying future runtime capabilities", () => {
    expect(getPrimitive("visualBuilderWorkspace")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("visualBuilderWorkspace");
    expect(getArtifactFamily(visualBuilderWorkspaceArtifactType)).toMatchObject({
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true,
      primitiveId: "visualBuilderWorkspace"
    });

    for (const primitiveId of [
      "visualModelBuilder",
      "safeInterpreterCompiler",
      "validationCalibration",
      "externalFrameworkInterop",
      "socialLearningRuntime",
      "customModelRuntime",
      "llmAgents"
    ] as const) {
      expect(listReservedPrimitives().map((primitive) => primitive.id)).toContain(primitiveId);
    }

    const composition = hybridComposition({
      primitiveAttachments: [
        {
          id: "workspace-ref",
          primitiveId: "visualBuilderWorkspace",
          attachmentType: "visualBuilderWorkspace",
          mode: "reference",
          artifactType: visualBuilderWorkspaceArtifactType,
          artifactId: "workspace-full",
          active: true,
          required: true
        }
      ]
    });
    expect(validateHybridComposition(composition).primitiveAttachments[0]).toMatchObject({ attachmentType: "visualBuilderWorkspace" });
    const report = validateCompositionCapabilities(composition);
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "visualBuilderWorkspace", requiredSupportLevel: "runtime" });

    for (const primitiveId of [
      "visualModelBuilder",
      "safeInterpreterCompiler",
      "validationCalibration",
      "externalFrameworkInterop",
      "socialLearningRuntime",
      "customModelRuntime",
      "llmAgents"
    ] as const) {
      expect(
        validateCompositionCapabilities(hybridComposition({ requiredCapabilities: [{ primitiveId, requiredSupportLevel: "metadata" }] })).runnableNow
      ).toBe(false);
    }
    expect(() =>
      validateHybridComposition(hybridComposition({ requiredCapabilities: [{ primitiveId: "visualModelBuilder", requiredSupportLevel: "runtime" }] }))
    ).toThrow(/Reserved primitive visualModelBuilder/);
  });

  it("preserves model-schema, social-learning, UI, and template capability boundaries", () => {
    const workspace = fullWorkspace();
    expect(workspaceReferencesArtifactType(workspace, "ortus.modelSchema")).toBe(true);
    expect(workspaceReferencesArtifactType(workspace, "ortus.knowledgeMemorySocialLearningModel")).toBe(true);
    expect(getVisualBuilderWorkspaceValidationReport(workspace)).toMatchObject({
      runnableNow: false,
      schemaExecutionAvailable: false,
      compilerAvailable: false
    });
    expect(getVisualBuilderWorkspaceWarnings(workspace)).toEqual(
      expect.arrayContaining([
        "A valid visual builder workspace does not make a model schema runnable.",
        "Social-learning references do not implement cognition or runtime learning.",
        "No LLM-agent runtime exists in V1."
      ])
    );

    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "visualBuilderWorkspace")).toMatchObject({
        status: "unsupported",
        supportLevel: "none",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
  });

  it("updates docs, assumptions, and architecture boundaries without adding simulation runtime code", () => {
    const auditedDocPaths = [
      "README.md",
      "docs/concepts.md",
      "src/simulation/README.md",
      "docs/roadmap.md",
      "planned_roadmap.md",
      "docs/codex/CURRENT_CONTEXT.md",
      "docs/codex/SESSION_LOG.md",
      "AGENTS.md"
    ] as const;
    const docs = auditedDocPaths.map((docPath) => readFileSync(join(repoRoot, docPath), "utf8")).join("\n");

    for (const docPath of auditedDocPaths) {
      const doc = readFileSync(join(repoRoot, docPath), "utf8");
      for (const phrase of requiredVisualWorkspaceDocPhrases) {
        expect(doc, `${docPath} includes required visual-builder workspace phrase`).toContain(phrase);
      }
    }
    expect(docs).toContain("Prompt 33B");
    expect(docs).toContain("Prompt 34B");

    const assumptionText = productionTemplates
      .flatMap((template) => template.assumptionProfile?.limitations.map((item) => item.description) ?? [])
      .join("\n");
    expect(assumptionText).toContain("Visual builder workspace schemas are structural only");
    expect(assumptionText).toContain("current templates are not generated from builder workspaces");
    expect(assumptionText).toContain("workspace graph edges are not dataflow or runtime behavior");

    const source = readdirSync(join(repoRoot, "src", "simulation", "visualBuilderWorkspace"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(repoRoot, "src", "simulation", "visualBuilderWorkspace", file), "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']zustand["']/);
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.");
    expect(source).not.toMatch(/from ["'].*components/);
    expect(source).not.toMatch(/from ["'].*state/);
    expect(source).not.toMatch(/from ["'][^"']*(renderer|reactflow|dnd|drag|graph|canvas)[^"']*["']/i);
    expect(source).not.toMatch(/from ["'].*templates/);
    expect(source).not.toMatch(/from ["'].*experiments/);
    expect(source).not.toMatch(/from ["'].*interventions/);
    expect(source).not.toMatch(/from ["'].*SimulationEngine/);
    expect(source).not.toMatch(/from ["'].*netlogo/);
    expect(source).not.toMatch(/from ["'].*mesa/);
    expect(source).not.toMatch(/from ["'].*mason/);
  });
});
