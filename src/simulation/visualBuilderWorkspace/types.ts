import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const visualBuilderWorkspaceArtifactType = "ortus.visualBuilderWorkspace";
export const maxVisualBuilderWorkspaceJsonLength = 280_000;
export const maxVisualBuilderWorkspaceMetadataJsonLength = 20_000;
export const maxVisualBuilderWorkspaceNoteLength = 1_200;
export const maxVisualBuilderWorkspaceNotes = 48;
export const maxVisualBuilderWorkspaceDescriptionLength = 2_000;
export const maxVisualBuilderWorkspaceItems = 512;
export const maxVisualBuilderWorkspaceMarkers = 512;
export const maxVisualBuilderWorkspaceArtifactReferences = 256;
export const maxVisualBuilderWorkspaceWarnings = 512;

export const visualBuilderNodeKinds = [
  "modelSchema",
  "entityType",
  "componentType",
  "attributeType",
  "space",
  "parameter",
  "metric",
  "ruleDeclaration",
  "artifactReference",
  "assumption",
  "warning",
  "unsupportedFeature",
  "futureCapability",
  "knowledgeItem",
  "beliefVariable",
  "memoryDescriptor",
  "socialLearningDescriptor",
  "observabilityDescriptor",
  "causalDescriptor",
  "quantityDescriptor",
  "networkDescriptor",
  "resourceDescriptor",
  "feedbackDescriptor",
  "controlDescriptor",
  "custom"
] as const;
export type VisualBuilderNodeKind = (typeof visualBuilderNodeKinds)[number];

export const visualBuilderNodeStatuses = [
  "structuralOnly",
  "draft",
  "templateRuntimeSupported",
  "serviceOnly",
  "futureOnly",
  "unsupported",
  "invalid"
] as const;
export type VisualBuilderNodeStatus = (typeof visualBuilderNodeStatuses)[number];

export const visualBuilderEdgeKinds = [
  "contains",
  "references",
  "dependsOn",
  "annotates",
  "warnsAbout",
  "mapsTo",
  "unsupportedBecause",
  "futureDependency",
  "visualGrouping",
  "custom"
] as const;
export type VisualBuilderEdgeKind = (typeof visualBuilderEdgeKinds)[number];

export const visualBuilderPanelKinds = [
  "modelStructure",
  "rules",
  "spaces",
  "parameters",
  "metrics",
  "artifacts",
  "assumptions",
  "measurements",
  "causality",
  "socialLearning",
  "robustness",
  "strategy",
  "warnings",
  "executionEligibility",
  "custom"
] as const;
export type VisualBuilderPanelKind = (typeof visualBuilderPanelKinds)[number];

export const visualBuilderSectionKinds = ["schema", "semantics", "runtimeStatus", "unsupported", "futureWork", "documentation", "custom"] as const;
export type VisualBuilderSectionKind = (typeof visualBuilderSectionKinds)[number];

export const visualBuilderMarkerKinds = ["validation", "warning", "unsupported", "futureOnly", "runtimeUnavailable", "notRunnable", "unsafe", "custom"] as const;
export type VisualBuilderMarkerKind = (typeof visualBuilderMarkerKinds)[number];

export const visualBuilderMarkerSeverities = ["info", "warning", "error"] as const;
export type VisualBuilderMarkerSeverity = (typeof visualBuilderMarkerSeverities)[number];

export const visualBuilderArtifactReferenceRoles = ["source", "context", "annotation", "constraint", "futureDependency", "warningSource", "custom"] as const;
export type VisualBuilderArtifactReferenceRole = (typeof visualBuilderArtifactReferenceRoles)[number];

export const visualBuilderLayoutKinds = ["manual", "hierarchical", "forceDirected", "grid", "custom"] as const;
export type VisualBuilderLayoutKind = (typeof visualBuilderLayoutKinds)[number];

export interface VisualBuilderWorkspaceScope {
  modelSchemaId?: string;
  hybridCompositionId?: string;
  scenarioId?: string;
  templateId?: string;
  knowledgeMemorySocialLearningModelId?: string;
  observabilityModelId?: string;
  causalAssumptionModelId?: string;
  quantitySemanticsModelId?: string;
  networkDefinitionId?: string;
  resourceSystemId?: string;
  feedbackLoopModelId?: string;
  boundaryModelId?: string;
  fieldLayerId?: string;
  scaleModelId?: string;
  controlStrategyModelId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderPoint {
  x: number;
  y: number;
}

export interface VisualBuilderSize {
  width: number;
  height: number;
}

export interface VisualBuilderNode {
  id: string;
  label: string;
  nodeKind: VisualBuilderNodeKind;
  referencedArtifactType?: string;
  referencedArtifactId?: string;
  referencedSchemaElementId?: string;
  status: VisualBuilderNodeStatus;
  position?: VisualBuilderPoint;
  size?: VisualBuilderSize;
  collapsed?: boolean;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderEdge {
  id: string;
  label?: string;
  edgeKind: VisualBuilderEdgeKind;
  sourceNodeId: string;
  targetNodeId: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderPanel {
  id: string;
  label: string;
  panelKind: VisualBuilderPanelKind;
  nodeIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderSection {
  id: string;
  label: string;
  sectionKind: VisualBuilderSectionKind;
  panelIds?: readonly string[];
  nodeIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderMarker {
  id: string;
  label: string;
  markerKind: VisualBuilderMarkerKind;
  targetNodeId?: string;
  targetEdgeId?: string;
  severity: VisualBuilderMarkerSeverity;
  message: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderArtifactReference {
  id: string;
  label: string;
  artifactType: string;
  artifactId: string;
  primitiveId?: PrimitiveId;
  role: VisualBuilderArtifactReferenceRole;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderSelection {
  selectedNodeIds?: readonly string[];
  selectedEdgeIds?: readonly string[];
  focusedPanelId?: string;
  focusedSectionId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderViewport {
  x?: number;
  y?: number;
  zoom?: number;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderLayout {
  layoutKind: VisualBuilderLayoutKind;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderWorkspaceDefinition {
  artifactType: typeof visualBuilderWorkspaceArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  workspaceVersion: "1";
  scope?: VisualBuilderWorkspaceScope;
  modelSchemaId?: string;
  nodes: readonly VisualBuilderNode[];
  edges?: readonly VisualBuilderEdge[];
  panels?: readonly VisualBuilderPanel[];
  sections?: readonly VisualBuilderSection[];
  artifactReferences?: readonly VisualBuilderArtifactReference[];
  validationMarkers?: readonly VisualBuilderMarker[];
  warningMarkers?: readonly VisualBuilderMarker[];
  unsupportedMarkers?: readonly VisualBuilderMarker[];
  selection?: VisualBuilderSelection;
  viewport?: VisualBuilderViewport;
  layout?: VisualBuilderLayout;
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface VisualBuilderWorkspaceSummary {
  id: string;
  name: string;
  nodeCount: number;
  edgeCount: number;
  panelCount: number;
  sectionCount: number;
  artifactReferenceCount: number;
  validationMarkerCount: number;
  warningMarkerCount: number;
  unsupportedMarkerCount: number;
  executableCount: number;
  structuralOnlyNodeCount: number;
  serviceOnlyNodeCount: number;
  futureOnlyNodeCount: number;
  unsupportedNodeCount: number;
  warnings: readonly string[];
}

export interface VisualBuilderWorkspaceValidationReport {
  workspaceId: string;
  valid: boolean;
  runnableNow: false;
  visualBuilderRuntimeAvailable: false;
  schemaExecutionAvailable: false;
  compilerAvailable: false;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly string[];
}
