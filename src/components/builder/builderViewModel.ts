import {
  deserializeVisualBuilderWorkspace,
  getEdgesForNode,
  getMarker,
  getPanel,
  getSection,
  getVisualBuilderWorkspaceValidationReport,
  listArtifactReferences,
  listMarkersForEdge,
  listMarkersForNode,
  listPanels,
  listSections,
  listUnsupportedMarkers,
  listValidationMarkers,
  listWarningMarkers,
  listWorkspaceEdges,
  listWorkspaceNodes,
  serializeVisualBuilderWorkspace,
  summarizeVisualBuilderWorkspace,
  validateVisualBuilderWorkspaceDefinition,
  visualBuilderNodeKinds,
  visualBuilderNodeStatuses,
  visualBuilderWorkspaceArtifactType,
  type VisualBuilderArtifactReference,
  type VisualBuilderEdge,
  type VisualBuilderMarker,
  type VisualBuilderNode,
  type VisualBuilderNodeKind,
  type VisualBuilderNodeStatus,
  type VisualBuilderPanel,
  type VisualBuilderSection,
  type VisualBuilderWorkspaceDefinition,
  type VisualBuilderWorkspaceSummary,
  type VisualBuilderWorkspaceValidationReport
} from "../../simulation/visualBuilderWorkspace";

export type BuilderSelectionType = "node" | "edge" | "marker" | "artifactReference" | "panel" | "section";

export interface BuilderSelection {
  type: BuilderSelectionType;
  id: string;
}

export interface BuilderWorkspaceFilters {
  nodeKind: VisualBuilderNodeKind | "all";
  nodeStatus: VisualBuilderNodeStatus | "all";
}

export interface BuilderStatusBadge {
  label: string;
  tone: "neutral" | "accent" | "danger" | "moss";
  description: string;
}

export interface BuilderMarkerView {
  source: "validation" | "warning" | "unsupported";
  marker: VisualBuilderMarker;
}

export interface BuilderWorkspaceViewModel {
  workspace: VisualBuilderWorkspaceDefinition;
  artifactType: typeof visualBuilderWorkspaceArtifactType;
  summary: VisualBuilderWorkspaceSummary;
  validationReport: VisualBuilderWorkspaceValidationReport;
  nodes: readonly VisualBuilderNode[];
  edges: readonly VisualBuilderEdge[];
  panels: readonly VisualBuilderPanel[];
  sections: readonly VisualBuilderSection[];
  artifactReferences: readonly VisualBuilderArtifactReference[];
  markers: readonly BuilderMarkerView[];
  statusBadges: readonly BuilderStatusBadge[];
  limitations: readonly string[];
  availableNodeKinds: readonly VisualBuilderNodeKind[];
  availableNodeStatuses: readonly VisualBuilderNodeStatus[];
  defaultSelection: BuilderSelection | null;
}

export interface BuilderInspectorRow {
  label: string;
  value: string;
}

export interface BuilderInspectorViewModel {
  heading: string;
  eyebrow: string;
  type: BuilderSelectionType;
  rows: readonly BuilderInspectorRow[];
  notes: readonly string[];
  metadataSummary: string;
  markerIds: readonly string[];
  connectedEdgeIds: readonly string[];
  runtimeLimitation: string;
  readOnly: true;
}

export interface BuilderImportResult {
  workspace: VisualBuilderWorkspaceDefinition | null;
  error: string | null;
  changed: boolean;
}

export interface BuilderNodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BuilderEdgeLayout {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BuilderViewportLayout {
  width: number;
  height: number;
  nodes: readonly BuilderNodeLayout[];
  edges: readonly BuilderEdgeLayout[];
}

export const defaultBuilderWorkspaceFilters: BuilderWorkspaceFilters = {
  nodeKind: "all",
  nodeStatus: "all"
};

export const builderWorkspaceLimitations = [
  "This workspace is structural only.",
  "It does not execute nodes or edges.",
  "It does not compile model schemas.",
  "It cannot generate or run simulations.",
  "It cannot generate scenarios or RunConfigs.",
  "Compatibility reports describe fit, not run readiness.",
  "Strong or templateExact compatibility is not runnable without runtime capability proof.",
  "Unsupported and lossy concepts remain visible.",
  "Social-learning nodes do not implement cognition.",
  "Scientific validity is not established by structural validity."
] as const;

export function createBuilderWorkspaceViewModel(workspace: VisualBuilderWorkspaceDefinition): BuilderWorkspaceViewModel {
  const valid = validateVisualBuilderWorkspaceDefinition(workspace);
  const nodes = listWorkspaceNodes(valid);
  const edges = listWorkspaceEdges(valid);
  const panels = listPanels(valid);
  const sections = listSections(valid);
  const artifactReferences = listArtifactReferences(valid);
  const validationMarkers = listValidationMarkers(valid).map((marker) => ({ source: "validation" as const, marker }));
  const warningMarkers = listWarningMarkers(valid).map((marker) => ({ source: "warning" as const, marker }));
  const unsupportedMarkers = listUnsupportedMarkers(valid).map((marker) => ({ source: "unsupported" as const, marker }));
  const validationReport = getVisualBuilderWorkspaceValidationReport(valid);
  const summary = summarizeVisualBuilderWorkspace(valid);

  return {
    workspace: valid,
    artifactType: visualBuilderWorkspaceArtifactType,
    summary,
    validationReport,
    nodes,
    edges,
    panels,
    sections,
    artifactReferences,
    markers: [...validationMarkers, ...warningMarkers, ...unsupportedMarkers],
    statusBadges: getWorkspaceStatusBadges(validationReport),
    limitations: builderWorkspaceLimitations,
    availableNodeKinds: visualBuilderNodeKinds.filter((kind) => nodes.some((node) => node.nodeKind === kind)),
    availableNodeStatuses: visualBuilderNodeStatuses.filter((status) => nodes.some((node) => node.status === status)),
    defaultSelection: getDefaultSelection(valid)
  };
}

export function getWorkspaceStatusBadges(report: VisualBuilderWorkspaceValidationReport): readonly BuilderStatusBadge[] {
  return [
    {
      label: "Structural only",
      tone: "accent",
      description: "The workspace is a structural display artifact."
    },
    {
      label: report.valid ? "Structurally valid" : "Invalid",
      tone: report.valid ? "moss" : "danger",
      description: report.valid ? "The artifact passes workspace schema validation." : "The artifact did not pass workspace validation."
    },
    {
      label: "Not runnable",
      tone: "danger",
      description: "A structurally valid workspace is still not a runnable model."
    },
    {
      label: "Service only",
      tone: "neutral",
      description: "The artifact is handled by service-level validation and display only."
    },
    {
      label: "No compiler",
      tone: "neutral",
      description: "The builder shell is not a compiler or interpreter."
    },
    {
      label: "No schema execution",
      tone: "neutral",
      description: "Model schema references are not executed."
    }
  ];
}

export function getVisibleWorkspaceNodes(
  viewModel: BuilderWorkspaceViewModel,
  filters: BuilderWorkspaceFilters = defaultBuilderWorkspaceFilters
): readonly VisualBuilderNode[] {
  return viewModel.nodes.filter((node) => {
    if (filters.nodeKind !== "all" && node.nodeKind !== filters.nodeKind) {
      return false;
    }
    if (filters.nodeStatus !== "all" && node.status !== filters.nodeStatus) {
      return false;
    }
    return true;
  });
}

export function getVisibleWorkspaceEdges(
  viewModel: BuilderWorkspaceViewModel,
  visibleNodes: readonly VisualBuilderNode[] = viewModel.nodes
): readonly VisualBuilderEdge[] {
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  return viewModel.edges.filter((edge) => visibleNodeIds.has(edge.sourceNodeId) && visibleNodeIds.has(edge.targetNodeId));
}

export function getSelectedWorkspaceItem(
  viewModel: BuilderWorkspaceViewModel,
  selection: BuilderSelection | null
):
  | VisualBuilderNode
  | VisualBuilderEdge
  | VisualBuilderMarker
  | VisualBuilderArtifactReference
  | VisualBuilderPanel
  | VisualBuilderSection
  | undefined {
  if (!selection) {
    return undefined;
  }
  switch (selection.type) {
    case "node":
      return viewModel.nodes.find((node) => node.id === selection.id);
    case "edge":
      return viewModel.edges.find((edge) => edge.id === selection.id);
    case "marker":
      return getMarker(viewModel.workspace, selection.id);
    case "artifactReference":
      return viewModel.artifactReferences.find((reference) => reference.id === selection.id);
    case "panel":
      return getPanel(viewModel.workspace, selection.id);
    case "section":
      return getSection(viewModel.workspace, selection.id);
  }
}

export function getInspectorViewModel(viewModel: BuilderWorkspaceViewModel, selection: BuilderSelection | null): BuilderInspectorViewModel | null {
  const item = getSelectedWorkspaceItem(viewModel, selection);
  if (!selection || !item) {
    return null;
  }
  switch (selection.type) {
    case "node":
      return inspectNode(viewModel, item as VisualBuilderNode);
    case "edge":
      return inspectEdge(viewModel, item as VisualBuilderEdge);
    case "marker":
      return inspectMarker(item as VisualBuilderMarker);
    case "artifactReference":
      return inspectArtifactReference(item as VisualBuilderArtifactReference);
    case "panel":
      return inspectPanel(item as VisualBuilderPanel);
    case "section":
      return inspectSection(item as VisualBuilderSection);
  }
}

export function getWorkspaceValidationViewModel(viewModel: BuilderWorkspaceViewModel): VisualBuilderWorkspaceValidationReport {
  return viewModel.validationReport;
}

export function getWorkspaceWarningsViewModel(viewModel: BuilderWorkspaceViewModel): readonly string[] {
  return viewModel.validationReport.warnings;
}

export function getNodeConnectedEdgeIds(viewModel: BuilderWorkspaceViewModel, nodeId: string): readonly string[] {
  return getEdgesForNode(viewModel.workspace, nodeId).map((edge) => edge.id);
}

export function getNodeMarkerIds(viewModel: BuilderWorkspaceViewModel, nodeId: string): readonly string[] {
  return listMarkersForNode(viewModel.workspace, nodeId).map((marker) => marker.id);
}

export function importBuilderWorkspaceJson(currentWorkspace: VisualBuilderWorkspaceDefinition | null, json: string): BuilderImportResult {
  try {
    const workspace = deserializeVisualBuilderWorkspace(json);
    return { workspace, error: null, changed: true };
  } catch (error) {
    return {
      workspace: currentWorkspace,
      error: error instanceof Error ? error.message : "Invalid visual builder workspace JSON",
      changed: false
    };
  }
}

export function exportBuilderWorkspaceJson(workspace: VisualBuilderWorkspaceDefinition): string {
  return serializeVisualBuilderWorkspace(workspace);
}

export function createBuilderViewportLayout(nodes: readonly VisualBuilderNode[], edges: readonly VisualBuilderEdge[]): BuilderViewportLayout {
  const columnCount = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, nodes.length))));
  const fallbackWidth = 230;
  const fallbackHeight = 92;
  const gapX = 74;
  const gapY = 54;
  const rawLayouts = nodes.map((node, index) => {
    const row = Math.floor(index / columnCount);
    const column = index % columnCount;
    const width = clampSize(node.size?.width ?? fallbackWidth, 160, 320);
    const height = clampSize(node.size?.height ?? fallbackHeight, 72, 160);
    return {
      id: node.id,
      x: node.position?.x ?? column * (fallbackWidth + gapX),
      y: node.position?.y ?? row * (fallbackHeight + gapY),
      width,
      height
    };
  });
  const minX = Math.min(0, ...rawLayouts.map((layout) => layout.x));
  const minY = Math.min(0, ...rawLayouts.map((layout) => layout.y));
  const offsetX = minX < 24 ? 24 - minX : 24;
  const offsetY = minY < 24 ? 24 - minY : 24;
  const layouts = rawLayouts.map((layout) => ({ ...layout, x: layout.x + offsetX, y: layout.y + offsetY }));
  const byId = new Map(layouts.map((layout) => [layout.id, layout]));
  const edgeLayouts = edges.flatMap((edge) => {
    const source = byId.get(edge.sourceNodeId);
    const target = byId.get(edge.targetNodeId);
    if (!source || !target) {
      return [];
    }
    return [
      {
        id: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        x1: source.x + source.width / 2,
        y1: source.y + source.height / 2,
        x2: target.x + target.width / 2,
        y2: target.y + target.height / 2
      }
    ];
  });
  const width = Math.max(420, ...layouts.map((layout) => layout.x + layout.width + 48));
  const height = Math.max(320, ...layouts.map((layout) => layout.y + layout.height + 48));

  return { width, height, nodes: layouts, edges: edgeLayouts };
}

export function formatNodeKind(kind: VisualBuilderNodeKind): string {
  return splitCamel(kind);
}

export function formatNodeStatus(status: VisualBuilderNodeStatus): string {
  if (status === "templateRuntimeSupported") {
    return "Runtime support claim needs template proof";
  }
  return splitCamel(status);
}

export function formatSelectionType(type: BuilderSelectionType): string {
  return splitCamel(type);
}

function getDefaultSelection(workspace: VisualBuilderWorkspaceDefinition): BuilderSelection | null {
  const selectedNodeId = workspace.selection?.selectedNodeIds?.[0];
  if (selectedNodeId) {
    return { type: "node", id: selectedNodeId };
  }
  const selectedEdgeId = workspace.selection?.selectedEdgeIds?.[0];
  if (selectedEdgeId) {
    return { type: "edge", id: selectedEdgeId };
  }
  const firstNode = workspace.nodes[0];
  return firstNode ? { type: "node", id: firstNode.id } : null;
}

function inspectNode(viewModel: BuilderWorkspaceViewModel, node: VisualBuilderNode): BuilderInspectorViewModel {
  const markerIds = getNodeMarkerIds(viewModel, node.id);
  const connectedEdgeIds = getNodeConnectedEdgeIds(viewModel, node.id);
  return {
    heading: node.label,
    eyebrow: "Node",
    type: "node",
    rows: compactRows([
      ["Id", node.id],
      ["Kind", formatNodeKind(node.nodeKind)],
      ["Status", formatNodeStatus(node.status)],
      ["Raw status", node.status],
      ["Active", yesNo(node.active)],
      ["Executable", String(node.executable)],
      ["Artifact type", node.referencedArtifactType],
      ["Artifact id", node.referencedArtifactId],
      ["Schema element", node.referencedSchemaElementId],
      ["Connected edges", connectedEdgeIds.length.toString()],
      ["Markers", markerIds.length.toString()]
    ]),
    notes: node.notes ?? [],
    metadataSummary: summarizeMetadata(node.metadata),
    markerIds,
    connectedEdgeIds,
    runtimeLimitation: limitationForNode(node),
    readOnly: true
  };
}

function inspectEdge(viewModel: BuilderWorkspaceViewModel, edge: VisualBuilderEdge): BuilderInspectorViewModel {
  const markerIds = listMarkersForEdge(viewModel.workspace, edge.id).map((marker) => marker.id);
  return {
    heading: edge.label ?? edge.id,
    eyebrow: "Edge",
    type: "edge",
    rows: compactRows([
      ["Id", edge.id],
      ["Kind", splitCamel(edge.edgeKind)],
      ["Source node", edge.sourceNodeId],
      ["Target node", edge.targetNodeId],
      ["Active", yesNo(edge.active)],
      ["Executable", String(edge.executable)],
      ["Markers", markerIds.length.toString()]
    ]),
    notes: edge.notes ?? [],
    metadataSummary: summarizeMetadata(edge.metadata),
    markerIds,
    connectedEdgeIds: [edge.id],
    runtimeLimitation: "Workspace edges are visual and semantic links only; they are not executable dataflow or causal proof.",
    readOnly: true
  };
}

function inspectMarker(marker: VisualBuilderMarker): BuilderInspectorViewModel {
  return {
    heading: marker.label,
    eyebrow: "Marker",
    type: "marker",
    rows: compactRows([
      ["Id", marker.id],
      ["Kind", splitCamel(marker.markerKind)],
      ["Severity", marker.severity],
      ["Target node", marker.targetNodeId],
      ["Target edge", marker.targetEdgeId],
      ["Active", yesNo(marker.active)],
      ["Executable", String(marker.executable)],
      ["Message", marker.message]
    ]),
    notes: marker.notes ?? [],
    metadataSummary: summarizeMetadata(marker.metadata),
    markerIds: [marker.id],
    connectedEdgeIds: marker.targetEdgeId ? [marker.targetEdgeId] : [],
    runtimeLimitation: "Markers are review metadata. They do not activate runtime behavior or prove validity.",
    readOnly: true
  };
}

function inspectArtifactReference(reference: VisualBuilderArtifactReference): BuilderInspectorViewModel {
  return {
    heading: reference.label,
    eyebrow: "Artifact reference",
    type: "artifactReference",
    rows: compactRows([
      ["Id", reference.id],
      ["Artifact type", reference.artifactType],
      ["Artifact id", reference.artifactId],
      ["Primitive", reference.primitiveId],
      ["Role", splitCamel(reference.role)],
      ["Active", yesNo(reference.active)],
      ["Executable", String(reference.executable)]
    ]),
    notes: reference.notes ?? [],
    metadataSummary: summarizeMetadata(reference.metadata),
    markerIds: [],
    connectedEdgeIds: [],
    runtimeLimitation: "Artifact references are structural pointers. Importing or viewing them does not activate model schemas, compatibility reports, or social-learning semantics.",
    readOnly: true
  };
}

function inspectPanel(panel: VisualBuilderPanel): BuilderInspectorViewModel {
  return {
    heading: panel.label,
    eyebrow: "Panel",
    type: "panel",
    rows: compactRows([
      ["Id", panel.id],
      ["Kind", splitCamel(panel.panelKind)],
      ["Node ids", (panel.nodeIds ?? []).join(", ")],
      ["Active", yesNo(panel.active)],
      ["Executable", String(panel.executable)]
    ]),
    notes: panel.notes ?? [],
    metadataSummary: summarizeMetadata(panel.metadata),
    markerIds: [],
    connectedEdgeIds: [],
    runtimeLimitation: "Workspace panels organize structural display only. They are not executable UI modules.",
    readOnly: true
  };
}

function inspectSection(section: VisualBuilderSection): BuilderInspectorViewModel {
  return {
    heading: section.label,
    eyebrow: "Section",
    type: "section",
    rows: compactRows([
      ["Id", section.id],
      ["Kind", splitCamel(section.sectionKind)],
      ["Panel ids", (section.panelIds ?? []).join(", ")],
      ["Node ids", (section.nodeIds ?? []).join(", ")],
      ["Active", yesNo(section.active)],
      ["Executable", String(section.executable)]
    ]),
    notes: section.notes ?? [],
    metadataSummary: summarizeMetadata(section.metadata),
    markerIds: [],
    connectedEdgeIds: [],
    runtimeLimitation: "Workspace sections are navigation metadata only. They do not create runtime behavior.",
    readOnly: true
  };
}

function limitationForNode(node: VisualBuilderNode): string {
  if (node.nodeKind === "socialLearningDescriptor") {
    return "Social-learning descriptor nodes do not implement cognition, Opinion runtime activation, source truth scoring, profiling, protected-class inference, persuasion, or targeting.";
  }
  if (node.nodeKind === "modelSchema" || node.referencedArtifactType === "ortus.modelSchema") {
    return "Model schema references are displayed structurally; they are not compiled, interpreted, converted to templates, or executed.";
  }
  if (node.referencedArtifactType === "ortus.schemaTemplateCompatibilityReport" || node.referencedArtifactType === "ortus.templateMappingProfile") {
    return "Compatibility references describe structural fit only. Strong or templateExact fit is not run readiness.";
  }
  if (node.status === "templateRuntimeSupported") {
    return "This status is only a claim in the workspace unless separate template capability metadata proves runtime support.";
  }
  return "Workspace nodes are visual descriptors, not runtime objects, executable rules, generated templates, scenarios, RunConfigs, snapshots, or engines.";
}

function compactRows(rows: ReadonlyArray<readonly [string, string | undefined]>): readonly BuilderInspectorRow[] {
  return rows
    .filter((row): row is readonly [string, string] => row[1] !== undefined && row[1] !== "")
    .map(([label, value]) => ({ label, value }));
}

function summarizeMetadata(metadata: Record<string, unknown> | undefined): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "No metadata";
  }
  const keys = Object.keys(metadata).sort();
  return `${keys.length} key${keys.length === 1 ? "" : "s"}: ${keys.join(", ")}. JSON length ${JSON.stringify(metadata).length}.`;
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function splitCamel(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").toLowerCase();
}

function clampSize(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}
