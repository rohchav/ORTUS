import { validateVisualBuilderWorkspaceDefinition } from "./validation";
import type {
  VisualBuilderArtifactReference,
  VisualBuilderArtifactReferenceRole,
  VisualBuilderEdge,
  VisualBuilderEdgeKind,
  VisualBuilderMarker,
  VisualBuilderNode,
  VisualBuilderNodeKind,
  VisualBuilderNodeStatus,
  VisualBuilderPanel,
  VisualBuilderPanelKind,
  VisualBuilderSection,
  VisualBuilderSectionKind,
  VisualBuilderWorkspaceDefinition
} from "./types";

export function listWorkspaceNodes(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderNode[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).nodes);
}

export function getWorkspaceNode(workspace: VisualBuilderWorkspaceDefinition, nodeId: string): VisualBuilderNode | undefined {
  const node = validateVisualBuilderWorkspaceDefinition(workspace).nodes.find((candidate) => candidate.id === nodeId);
  return node ? clone(node) : undefined;
}

export function listWorkspaceNodesByKind(workspace: VisualBuilderWorkspaceDefinition, nodeKind: VisualBuilderNodeKind): readonly VisualBuilderNode[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).nodes.filter((node) => node.nodeKind === nodeKind));
}

export function listWorkspaceNodesByStatus(workspace: VisualBuilderWorkspaceDefinition, status: VisualBuilderNodeStatus): readonly VisualBuilderNode[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).nodes.filter((node) => node.status === status));
}

export function listActiveWorkspaceNodes(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderNode[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).nodes.filter((node) => node.active));
}

export function listWorkspaceEdges(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderEdge[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).edges ?? []);
}

export function getWorkspaceEdge(workspace: VisualBuilderWorkspaceDefinition, edgeId: string): VisualBuilderEdge | undefined {
  const edge = validateVisualBuilderWorkspaceDefinition(workspace).edges?.find((candidate) => candidate.id === edgeId);
  return edge ? clone(edge) : undefined;
}

export function listWorkspaceEdgesByKind(workspace: VisualBuilderWorkspaceDefinition, edgeKind: VisualBuilderEdgeKind): readonly VisualBuilderEdge[] {
  return clone((validateVisualBuilderWorkspaceDefinition(workspace).edges ?? []).filter((edge) => edge.edgeKind === edgeKind));
}

export function getEdgesForNode(workspace: VisualBuilderWorkspaceDefinition, nodeId: string): readonly VisualBuilderEdge[] {
  return clone((validateVisualBuilderWorkspaceDefinition(workspace).edges ?? []).filter((edge) => edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId));
}

export function listPanels(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderPanel[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).panels ?? []);
}

export function getPanel(workspace: VisualBuilderWorkspaceDefinition, panelId: string): VisualBuilderPanel | undefined {
  const panel = validateVisualBuilderWorkspaceDefinition(workspace).panels?.find((candidate) => candidate.id === panelId);
  return panel ? clone(panel) : undefined;
}

export function listPanelsByKind(workspace: VisualBuilderWorkspaceDefinition, panelKind: VisualBuilderPanelKind): readonly VisualBuilderPanel[] {
  return clone((validateVisualBuilderWorkspaceDefinition(workspace).panels ?? []).filter((panel) => panel.panelKind === panelKind));
}

export function listSections(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderSection[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).sections ?? []);
}

export function getSection(workspace: VisualBuilderWorkspaceDefinition, sectionId: string): VisualBuilderSection | undefined {
  const section = validateVisualBuilderWorkspaceDefinition(workspace).sections?.find((candidate) => candidate.id === sectionId);
  return section ? clone(section) : undefined;
}

export function listSectionsByKind(workspace: VisualBuilderWorkspaceDefinition, sectionKind: VisualBuilderSectionKind): readonly VisualBuilderSection[] {
  return clone((validateVisualBuilderWorkspaceDefinition(workspace).sections ?? []).filter((section) => section.sectionKind === sectionKind));
}

export function listValidationMarkers(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderMarker[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).validationMarkers ?? []);
}

export function listWarningMarkers(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderMarker[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).warningMarkers ?? []);
}

export function listUnsupportedMarkers(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderMarker[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).unsupportedMarkers ?? []);
}

export function getMarker(workspace: VisualBuilderWorkspaceDefinition, markerId: string): VisualBuilderMarker | undefined {
  const marker = allMarkers(validateVisualBuilderWorkspaceDefinition(workspace)).find((candidate) => candidate.id === markerId);
  return marker ? clone(marker) : undefined;
}

export function listMarkersForNode(workspace: VisualBuilderWorkspaceDefinition, nodeId: string): readonly VisualBuilderMarker[] {
  return clone(allMarkers(validateVisualBuilderWorkspaceDefinition(workspace)).filter((marker) => marker.targetNodeId === nodeId));
}

export function listMarkersForEdge(workspace: VisualBuilderWorkspaceDefinition, edgeId: string): readonly VisualBuilderMarker[] {
  return clone(allMarkers(validateVisualBuilderWorkspaceDefinition(workspace)).filter((marker) => marker.targetEdgeId === edgeId));
}

export function listArtifactReferences(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderArtifactReference[] {
  return clone(validateVisualBuilderWorkspaceDefinition(workspace).artifactReferences ?? []);
}

export function getArtifactReference(workspace: VisualBuilderWorkspaceDefinition, referenceId: string): VisualBuilderArtifactReference | undefined {
  const reference = validateVisualBuilderWorkspaceDefinition(workspace).artifactReferences?.find((candidate) => candidate.id === referenceId);
  return reference ? clone(reference) : undefined;
}

export function listArtifactReferencesByType(workspace: VisualBuilderWorkspaceDefinition, artifactType: string): readonly VisualBuilderArtifactReference[] {
  return clone((validateVisualBuilderWorkspaceDefinition(workspace).artifactReferences ?? []).filter((reference) => reference.artifactType === artifactType));
}

export function listArtifactReferencesByRole(
  workspace: VisualBuilderWorkspaceDefinition,
  role: VisualBuilderArtifactReferenceRole
): readonly VisualBuilderArtifactReference[] {
  return clone((validateVisualBuilderWorkspaceDefinition(workspace).artifactReferences ?? []).filter((reference) => reference.role === role));
}

export function workspaceHasNodeKind(workspace: VisualBuilderWorkspaceDefinition, nodeKind: VisualBuilderNodeKind): boolean {
  return validateVisualBuilderWorkspaceDefinition(workspace).nodes.some((node) => node.nodeKind === nodeKind);
}

export function workspaceHasNodeStatus(workspace: VisualBuilderWorkspaceDefinition, status: VisualBuilderNodeStatus): boolean {
  return validateVisualBuilderWorkspaceDefinition(workspace).nodes.some((node) => node.status === status);
}

export function workspaceReferencesArtifactType(workspace: VisualBuilderWorkspaceDefinition, artifactType: string): boolean {
  const valid = validateVisualBuilderWorkspaceDefinition(workspace);
  return (
    (valid.artifactReferences ?? []).some((reference) => reference.artifactType === artifactType) ||
    valid.nodes.some((node) => node.referencedArtifactType === artifactType)
  );
}

function allMarkers(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderMarker[] {
  return [...(workspace.validationMarkers ?? []), ...(workspace.warningMarkers ?? []), ...(workspace.unsupportedMarkers ?? [])];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
