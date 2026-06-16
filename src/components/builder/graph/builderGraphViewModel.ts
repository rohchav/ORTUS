import {
  getVisualBuilderWorkspaceValidationReport,
  validateVisualBuilderWorkspaceDefinition,
  visualBuilderNodeKinds,
  visualBuilderNodeStatuses,
  visualBuilderWorkspaceArtifactType,
  type VisualBuilderEdgeKind,
  type VisualBuilderMarkerSeverity,
  type VisualBuilderNodeKind,
  type VisualBuilderNodeStatus,
  type VisualBuilderWorkspaceDefinition
} from "../../../simulation/visualBuilderWorkspace";
import type { JsonValue } from "../../../simulation/kernel/types";

export const maxBuilderGraphVisualNodes = 120;
export const maxBuilderGraphVisualEdges = 240;

const graphNodeWidth = 220;
const graphNodeHeight = 92;
const graphColumnGap = 62;
const graphRowGap = 58;
const graphPadding = 30;
const graphCoordinateLimit = 4_000;

export interface BuilderGraphPosition {
  x: number;
  y: number;
}

export interface BuilderGraphSize {
  width: number;
  height: number;
}

export interface BuilderGraphArtifactReferenceView {
  artifactType: string;
  artifactId: string;
  schemaElementId?: string;
}

export interface BuilderGraphNodeView {
  id: string;
  label: string;
  kind: VisualBuilderNodeKind;
  sourceType: "workspaceNode";
  status: VisualBuilderNodeStatus;
  active: boolean;
  executable: false;
  artifactReference?: BuilderGraphArtifactReferenceView;
  markerIds: readonly string[];
  warnings: readonly string[];
  notes: readonly string[];
  metadata?: Record<string, JsonValue>;
  position: BuilderGraphPosition;
  size: BuilderGraphSize;
  searchText: string;
}

export interface BuilderGraphEdgeView {
  id: string;
  label: string;
  kind: VisualBuilderEdgeKind;
  sourceNodeId: string;
  targetNodeId: string;
  active: boolean;
  executable: false;
  markerIds: readonly string[];
  warnings: readonly string[];
  notes: readonly string[];
  metadata?: Record<string, JsonValue>;
  searchText: string;
}

export interface BuilderGraphGroupView {
  id: string;
  label: string;
  kind: VisualBuilderNodeKind;
  nodeIds: readonly string[];
}

export interface BuilderGraphWarningView {
  id: string;
  label: string;
  message: string;
  severity: VisualBuilderMarkerSeverity | "info";
  source: "validation" | "warning" | "unsupported" | "report";
  targetType: "node" | "edge" | "graph";
  targetId?: string;
}

export interface BuilderGraphSummary {
  nodeCount: number;
  edgeCount: number;
  validationMarkerCount: number;
  warningMarkerCount: number;
  unsupportedMarkerCount: number;
  reportNoticeCount: number;
  unsupportedItemCount: number;
  futureOnlyItemCount: number;
  futureOnlyMarkerCount: number;
  serviceOnlyItemCount: number;
  missingRuntimeCapabilityCount: number;
  visualGraphAvailable: boolean;
}

export interface BuilderGraphViewModel {
  sourceArtifactType: typeof visualBuilderWorkspaceArtifactType;
  sourceArtifactId: string;
  sourceArtifactName: string;
  structuralValid: boolean;
  runnableNow: false;
  executable: false;
  nodes: readonly BuilderGraphNodeView[];
  edges: readonly BuilderGraphEdgeView[];
  groups: readonly BuilderGraphGroupView[];
  warnings: readonly BuilderGraphWarningView[];
  missingRuntimeCapabilities: readonly string[];
  availableNodeKinds: readonly VisualBuilderNodeKind[];
  availableNodeStatuses: readonly VisualBuilderNodeStatus[];
  summary: BuilderGraphSummary;
  layout: {
    width: number;
    height: number;
    kind: "deterministicLayered";
  };
}

export interface BuilderGraphFilters {
  query: string;
  nodeKind: VisualBuilderNodeKind | "all";
  nodeStatus: VisualBuilderNodeStatus | "all";
  warningStatus: "all" | "withWarnings";
  showFutureOnly: boolean;
  showUnsupported: boolean;
}

export interface FilteredBuilderGraph {
  nodes: readonly BuilderGraphNodeView[];
  edges: readonly BuilderGraphEdgeView[];
  hiddenNodeCount: number;
  hiddenEdgeCount: number;
}

export type BuilderGraphSelection = { type: "node" | "edge"; id: string };

export interface BuilderGraphInspectorView {
  heading: string;
  eyebrow: "Structural node" | "Structural edge";
  id: string;
  kind: string;
  status: string;
  sourceArtifact: string;
  executable: false;
  rows: readonly { label: string; value: string }[];
  warnings: readonly string[];
  notes: readonly string[];
  connectedNodeIds: readonly string[];
  connectedEdgeIds: readonly string[];
  metadataText: string;
  limitation: string;
}

export const defaultBuilderGraphFilters: BuilderGraphFilters = {
  query: "",
  nodeKind: "all",
  nodeStatus: "all",
  warningStatus: "all",
  showFutureOnly: true,
  showUnsupported: true
};

export function createBuilderGraphViewModel(workspace: VisualBuilderWorkspaceDefinition): BuilderGraphViewModel {
  const valid = validateVisualBuilderWorkspaceDefinition(workspace);
  const report = getVisualBuilderWorkspaceValidationReport(valid);
  const markers = collectMarkers(valid);
  const markersByNodeId = groupMarkersByTarget(markers, "targetNodeId");
  const markersByEdgeId = groupMarkersByTarget(markers, "targetEdgeId");
  const sortedNodes = [...valid.nodes].sort(compareWorkspaceNodes);
  const laidOutNodes = layoutNodes(sortedNodes);
  const nodes = laidOutNodes.map((node) => {
    const nodeMarkers = markersByNodeId.get(node.id) ?? [];
    const artifactReference =
      node.referencedArtifactType && node.referencedArtifactId
        ? {
            artifactType: node.referencedArtifactType,
            artifactId: node.referencedArtifactId,
            ...(node.referencedSchemaElementId ? { schemaElementId: node.referencedSchemaElementId } : {})
          }
        : node.referencedSchemaElementId
          ? {
              artifactType: "ortus.modelSchemaElement",
              artifactId: node.referencedSchemaElementId,
              schemaElementId: node.referencedSchemaElementId
            }
          : undefined;

    const warnings = [
      ...nodeMarkers.map((marker) => marker.message),
      ...(node.status === "unsupported" || node.status === "invalid"
        ? [`Node status is ${formatGraphLabel(node.status)}; this item is not runnable.`]
        : []),
      ...(node.status === "futureOnly" ? ["Node status is future only; the capability is not implemented."] : []),
      ...(node.status === "serviceOnly" ? ["Node is service-only; global service availability is not template runtime support."] : []),
      ...(node.status === "templateRuntimeSupported"
        ? ["Template runtime support is only a workspace claim unless actual template runtime metadata and tests prove it."]
        : [])
    ];

    return {
      id: node.id,
      label: node.label,
      kind: node.nodeKind,
      sourceType: "workspaceNode" as const,
      status: node.status,
      active: node.active,
      executable: false as const,
      ...(artifactReference ? { artifactReference } : {}),
      markerIds: nodeMarkers.map((marker) => marker.id),
      warnings,
      notes: [...(node.notes ?? [])],
      ...(node.metadata ? { metadata: cloneJson(node.metadata) } : {}),
      position: { ...node.position },
      size: { ...node.size },
      searchText: normalizeSearchText(
        [
          node.id,
          node.label,
          node.nodeKind,
          node.status,
          formatGraphStatus(node.status),
          node.referencedArtifactType,
          node.referencedArtifactId,
          node.referencedSchemaElementId,
          ...warnings
        ].filter(isString)
      )
    };
  });

  const edges = [...(valid.edges ?? [])].sort((left, right) => compareText(left.id, right.id)).map((edge) => {
    const edgeMarkers = markersByEdgeId.get(edge.id) ?? [];
    const warnings = edgeMarkers.map((marker) => marker.message);
    return {
      id: edge.id,
      label: edge.label ?? formatGraphLabel(edge.edgeKind),
      kind: edge.edgeKind,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      active: edge.active,
      executable: false as const,
      markerIds: edgeMarkers.map((marker) => marker.id),
      warnings,
      notes: [...(edge.notes ?? [])],
      ...(edge.metadata ? { metadata: cloneJson(edge.metadata) } : {}),
      searchText: normalizeSearchText(
        [edge.id, edge.label, edge.edgeKind, edge.sourceNodeId, edge.targetNodeId, ...warnings].filter(isString)
      )
    };
  });

  const warnings: BuilderGraphWarningView[] = [
    ...markers.map((marker) => ({
      id: marker.id,
      label: marker.label,
      message: marker.message,
      severity: marker.severity,
      source: marker.source,
      targetType: marker.targetNodeId ? ("node" as const) : marker.targetEdgeId ? ("edge" as const) : ("graph" as const),
      ...(marker.targetNodeId || marker.targetEdgeId ? { targetId: marker.targetNodeId ?? marker.targetEdgeId } : {})
    })),
    ...report.warnings.map((message, index) => ({
      id: `graph-report-warning-${index + 1}`,
      label: "Structural warning",
      message,
      severity: "info" as const,
      source: "report" as const,
      targetType: "graph" as const
    }))
  ];

  const groups = visualBuilderNodeKinds.flatMap((kind) => {
    const nodeIds = nodes.filter((node) => node.kind === kind).map((node) => node.id);
    return nodeIds.length > 0
      ? [
          {
            id: `graph-group-${kind}`,
            label: formatGraphLabel(kind),
            kind,
            nodeIds
          }
        ]
      : [];
  });
  const visualGraphAvailable = nodes.length <= maxBuilderGraphVisualNodes && edges.length <= maxBuilderGraphVisualEdges;
  const layoutBounds = getLayoutBounds(nodes);
  const validationMarkerCount = valid.validationMarkers?.length ?? 0;
  const warningMarkerCount = valid.warningMarkers?.length ?? 0;
  const unsupportedMarkerCount = valid.unsupportedMarkers?.length ?? 0;

  return {
    sourceArtifactType: visualBuilderWorkspaceArtifactType,
    sourceArtifactId: valid.id,
    sourceArtifactName: valid.name,
    structuralValid: report.valid,
    runnableNow: false,
    executable: false,
    nodes,
    edges,
    groups,
    warnings,
    missingRuntimeCapabilities: [...report.missingCapabilities],
    availableNodeKinds: visualBuilderNodeKinds.filter((kind) => nodes.some((node) => node.kind === kind)),
    availableNodeStatuses: visualBuilderNodeStatuses.filter((status) => nodes.some((node) => node.status === status)),
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      validationMarkerCount,
      warningMarkerCount,
      unsupportedMarkerCount,
      reportNoticeCount: report.warnings.length,
      unsupportedItemCount: nodes.filter((node) => node.status === "unsupported" || node.status === "invalid").length,
      futureOnlyItemCount: nodes.filter((node) => node.status === "futureOnly").length,
      futureOnlyMarkerCount: markers.filter((marker) => marker.markerKind === "futureOnly").length,
      serviceOnlyItemCount: nodes.filter((node) => node.status === "serviceOnly").length,
      missingRuntimeCapabilityCount: report.missingCapabilities.length,
      visualGraphAvailable
    },
    layout: {
      ...layoutBounds,
      kind: "deterministicLayered"
    }
  };
}

export function resolveBuilderGraphSelection(
  selection: BuilderGraphSelection | null,
  filtered: Pick<FilteredBuilderGraph, "nodes" | "edges">
): BuilderGraphSelection | null {
  if (
    selection &&
    (selection.type === "node"
      ? filtered.nodes.some((node) => node.id === selection.id)
      : filtered.edges.some((edge) => edge.id === selection.id))
  ) {
    return selection;
  }
  if (filtered.nodes[0]) {
    return { type: "node", id: filtered.nodes[0].id };
  }
  if (filtered.edges[0]) {
    return { type: "edge", id: filtered.edges[0].id };
  }
  return null;
}

export function filterBuilderGraph(viewModel: BuilderGraphViewModel, filters: BuilderGraphFilters): FilteredBuilderGraph {
  const query = normalizeSearchText([filters.query]);
  const edgeMatches = new Set(
    viewModel.edges.filter((edge) => query.length > 0 && edge.searchText.includes(query)).flatMap((edge) => [edge.sourceNodeId, edge.targetNodeId])
  );
  const warnedEdgeEndpoints = new Set(
    viewModel.edges.filter((edge) => edge.warnings.length > 0).flatMap((edge) => [edge.sourceNodeId, edge.targetNodeId])
  );
  const nodes = viewModel.nodes.filter((node) => {
    if (filters.nodeKind !== "all" && node.kind !== filters.nodeKind) {
      return false;
    }
    if (filters.nodeStatus !== "all" && node.status !== filters.nodeStatus) {
      return false;
    }
    if (!filters.showFutureOnly && node.status === "futureOnly") {
      return false;
    }
    if (!filters.showUnsupported && (node.status === "unsupported" || node.status === "invalid")) {
      return false;
    }
    if (
      filters.warningStatus === "withWarnings" &&
      node.warnings.length === 0 &&
      !warnedEdgeEndpoints.has(node.id)
    ) {
      return false;
    }
    return query.length === 0 || node.searchText.includes(query) || edgeMatches.has(node.id);
  });
  const visibleNodeIds = new Set(nodes.map((node) => node.id));
  const edges = viewModel.edges.filter((edge) => {
    if (!visibleNodeIds.has(edge.sourceNodeId) || !visibleNodeIds.has(edge.targetNodeId)) {
      return false;
    }
    if (filters.warningStatus === "withWarnings" && edge.warnings.length === 0) {
      return false;
    }
    return true;
  });

  return {
    nodes,
    edges,
    hiddenNodeCount: viewModel.nodes.length - nodes.length,
    hiddenEdgeCount: viewModel.edges.length - edges.length
  };
}

export function getBuilderGraphInspector(
  viewModel: BuilderGraphViewModel,
  selection: BuilderGraphSelection | null
): BuilderGraphInspectorView | null {
  if (!selection) {
    return null;
  }
  if (selection.type === "node") {
    const node = viewModel.nodes.find((candidate) => candidate.id === selection.id);
    if (!node) {
      return null;
    }
    const connectedEdges = viewModel.edges.filter((edge) => edge.sourceNodeId === node.id || edge.targetNodeId === node.id);
    const connectedNodeIds = Array.from(
      new Set(
        connectedEdges.map((edge) => (edge.sourceNodeId === node.id ? edge.targetNodeId : edge.sourceNodeId))
      )
    ).sort();
    return {
      heading: node.label,
      eyebrow: "Structural node",
      id: node.id,
      kind: formatGraphLabel(node.kind),
      status: formatGraphStatus(node.status),
      sourceArtifact: `${viewModel.sourceArtifactType} · ${viewModel.sourceArtifactId}`,
      executable: false,
      rows: compactRows([
        ["Source artifact", `${viewModel.sourceArtifactType} · ${viewModel.sourceArtifactId}`],
        ["Id", node.id],
        ["Kind", formatGraphLabel(node.kind)],
        ["Status", formatGraphStatus(node.status)],
        ["Active", node.active ? "Yes, structurally active" : "No"],
        ["Executable", "No"],
        ["Artifact type", node.artifactReference?.artifactType],
        ["Artifact id", node.artifactReference?.artifactId],
        ["Schema element", node.artifactReference?.schemaElementId],
        ["Connected nodes", connectedNodeIds.length.toString()],
        ["Connected edges", connectedEdges.length.toString()],
        ["Markers", node.markerIds.length.toString()]
      ]),
      warnings: node.warnings,
      notes: node.notes,
      connectedNodeIds,
      connectedEdgeIds: connectedEdges.map((edge) => edge.id).sort(),
      metadataText: formatMetadataText(node.metadata),
      limitation: limitationForNode(node)
    };
  }

  const edge = viewModel.edges.find((candidate) => candidate.id === selection.id);
  if (!edge) {
    return null;
  }
  return {
    heading: edge.label,
    eyebrow: "Structural edge",
    id: edge.id,
    kind: formatGraphLabel(edge.kind),
    status: "Structural relation",
    sourceArtifact: `${viewModel.sourceArtifactType} · ${viewModel.sourceArtifactId}`,
    executable: false,
    rows: compactRows([
      ["Source artifact", `${viewModel.sourceArtifactType} · ${viewModel.sourceArtifactId}`],
      ["Id", edge.id],
      ["Kind", formatGraphLabel(edge.kind)],
      ["Source node", edge.sourceNodeId],
      ["Target node", edge.targetNodeId],
      ["Active", edge.active ? "Yes, structurally active" : "No"],
      ["Executable", "No"],
      ["Markers", edge.markerIds.length.toString()]
    ]),
    warnings: edge.warnings,
    notes: edge.notes,
    connectedNodeIds: [edge.sourceNodeId, edge.targetNodeId],
    connectedEdgeIds: [edge.id],
    metadataText: formatMetadataText(edge.metadata),
    limitation: "This edge describes a structural relationship. It is not executable dataflow, a causal claim, or runtime behavior."
  };
}

export function getBuilderGraphNeighborhood(
  viewModel: BuilderGraphViewModel,
  selection: BuilderGraphSelection | null
): { nodeIds: ReadonlySet<string>; edgeIds: ReadonlySet<string> } {
  if (!selection) {
    return { nodeIds: new Set(), edgeIds: new Set() };
  }
  if (selection.type === "edge") {
    const edge = viewModel.edges.find((candidate) => candidate.id === selection.id);
    return edge
      ? { nodeIds: new Set([edge.sourceNodeId, edge.targetNodeId]), edgeIds: new Set([edge.id]) }
      : { nodeIds: new Set(), edgeIds: new Set() };
  }
  const connectedEdges = viewModel.edges.filter((edge) => edge.sourceNodeId === selection.id || edge.targetNodeId === selection.id);
  return {
    nodeIds: new Set([
      selection.id,
      ...connectedEdges.flatMap((edge) => [edge.sourceNodeId, edge.targetNodeId])
    ]),
    edgeIds: new Set(connectedEdges.map((edge) => edge.id))
  };
}

export function createBuilderGraphEdgePath(
  source: BuilderGraphNodeView,
  target: BuilderGraphNodeView
): string {
  const sourceX = source.position.x + source.size.width / 2;
  const sourceY = source.position.y + source.size.height / 2;
  const targetX = target.position.x + target.size.width / 2;
  const targetY = target.position.y + target.size.height / 2;
  const middleX = Number(((sourceX + targetX) / 2).toFixed(2));
  return `M ${sourceX} ${sourceY} H ${middleX} V ${targetY} H ${targetX}`;
}

export function getBuilderGraphFitZoom(
  viewModel: BuilderGraphViewModel,
  viewportWidth = 900,
  viewportHeight = 520
): number {
  const horizontalFit = Math.max(1, viewportWidth - 32) / Math.max(1, viewModel.layout.width);
  const verticalFit = Math.max(1, viewportHeight - 32) / Math.max(1, viewModel.layout.height);
  return clampNumber(Math.min(horizontalFit, verticalFit, 1), 0.1, 1.6);
}

export function formatGraphLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatGraphStatus(status: VisualBuilderNodeStatus): string {
  return status === "templateRuntimeSupported"
    ? "Workspace Claim: Template Runtime Supported"
    : formatGraphLabel(status);
}

export function getBuilderGraphNodeDomId(nodeId: string): string {
  const encoded = Array.from(nodeId, (character) => character.codePointAt(0)?.toString(16) ?? "0").join("-");
  return `builder-graph-node-${encoded}`;
}

function collectMarkers(workspace: VisualBuilderWorkspaceDefinition) {
  return [
    ...(workspace.validationMarkers ?? []).map((marker) => ({ ...marker, source: "validation" as const })),
    ...(workspace.warningMarkers ?? []).map((marker) => ({ ...marker, source: "warning" as const })),
    ...(workspace.unsupportedMarkers ?? []).map((marker) => ({ ...marker, source: "unsupported" as const }))
  ];
}

function layoutNodes(nodes: readonly VisualBuilderWorkspaceDefinition["nodes"][number][]) {
  const kinds = visualBuilderNodeKinds.filter((kind) => nodes.some((node) => node.nodeKind === kind));
  const byKindIndex = new Map(kinds.map((kind, index) => [kind, index]));
  const nextColumnByKind = new Map<VisualBuilderNodeKind, number>();
  const raw = nodes.map((node) => {
    const column = nextColumnByKind.get(node.nodeKind) ?? 0;
    nextColumnByKind.set(node.nodeKind, column + 1);
    const row = byKindIndex.get(node.nodeKind) ?? 0;
    const width = clampNumber(node.size?.width ?? graphNodeWidth, 180, 300);
    const height = clampNumber(node.size?.height ?? graphNodeHeight, 78, 140);
    const fallbackX = column * (graphNodeWidth + graphColumnGap);
    const fallbackY = row * (graphNodeHeight + graphRowGap);
    return {
      ...node,
      position: {
        x: clampNumber(node.position?.x ?? fallbackX, -graphCoordinateLimit, graphCoordinateLimit),
        y: clampNumber(node.position?.y ?? fallbackY, -graphCoordinateLimit, graphCoordinateLimit)
      },
      size: { width, height }
    };
  });
  const minX = Math.min(0, ...raw.map((node) => node.position.x));
  const minY = Math.min(0, ...raw.map((node) => node.position.y));
  return raw.map((node) => ({
    ...node,
    position: {
      x: Number((node.position.x - minX + graphPadding).toFixed(2)),
      y: Number((node.position.y - minY + graphPadding).toFixed(2))
    }
  }));
}

function compareWorkspaceNodes(
  left: VisualBuilderWorkspaceDefinition["nodes"][number],
  right: VisualBuilderWorkspaceDefinition["nodes"][number]
): number {
  const leftKind = visualBuilderNodeKinds.indexOf(left.nodeKind);
  const rightKind = visualBuilderNodeKinds.indexOf(right.nodeKind);
  return leftKind - rightKind || compareText(left.label, right.label) || compareText(left.id, right.id);
}

function getLayoutBounds(nodes: readonly BuilderGraphNodeView[]): { width: number; height: number } {
  return {
    width: Math.max(440, ...nodes.map((node) => node.position.x + node.size.width + graphPadding)),
    height: Math.max(340, ...nodes.map((node) => node.position.y + node.size.height + graphPadding))
  };
}

function normalizeSearchText(values: readonly string[]): string {
  return values.join(" ").trim().toLowerCase();
}

function formatMetadataText(metadata: Record<string, JsonValue> | undefined): string {
  return metadata && Object.keys(metadata).length > 0 ? JSON.stringify(metadata, null, 2) : "No metadata.";
}

function limitationForNode(node: BuilderGraphNodeView): string {
  if (node.kind === "socialLearningDescriptor") {
    return "Social-learning references are structural descriptors only. They do not model human cognition, profile people, infer protected classes, or optimize persuasion.";
  }
  if (node.kind === "modelSchema" || node.artifactReference?.artifactType === "ortus.modelSchema") {
    return "A model-schema node is a structural reference. It is not compiled, interpreted, converted into a template, or executed.";
  }
  if (
    node.artifactReference?.artifactType === "ortus.schemaTemplateCompatibilityReport" ||
    node.artifactReference?.artifactType === "ortus.templateMappingProfile"
  ) {
    return "Compatibility information describes structural fit only. A strong fit does not make a model runnable.";
  }
  if (node.status === "templateRuntimeSupported") {
    return "This workspace status is only a display claim unless separate template metadata and runtime tests prove actual support.";
  }
  return "This node is a visual descriptor, not a runtime object, executable rule, generated artifact, or active simulation element.";
}

function compactRows(rows: ReadonlyArray<readonly [string, string | undefined]>): readonly { label: string; value: string }[] {
  return rows
    .filter((row): row is readonly [string, string] => row[1] !== undefined && row[1] !== "")
    .map(([label, value]) => ({ label, value }));
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function groupMarkersByTarget<T extends { targetNodeId?: string; targetEdgeId?: string }>(
  markers: readonly T[],
  targetKey: "targetNodeId" | "targetEdgeId"
): ReadonlyMap<string, readonly T[]> {
  const grouped = new Map<string, T[]>();
  for (const marker of markers) {
    const targetId = marker[targetKey];
    if (!targetId) {
      continue;
    }
    const group = grouped.get(targetId) ?? [];
    group.push(marker);
    grouped.set(targetId, group);
  }
  return grouped;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function isString(value: string | undefined): value is string {
  return typeof value === "string";
}
