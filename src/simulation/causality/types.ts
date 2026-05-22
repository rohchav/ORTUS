import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const causalAssumptionModelArtifactType = "ortus.causalAssumptionModel";
export const maxCausalAssumptionModelJsonLength = 220_000;
export const maxCausalAssumptionMetadataJsonLength = 20_000;
export const maxCausalAssumptionNoteLength = 1_200;
export const maxCausalAssumptionNotes = 48;
export const maxCausalVariables = 256;
export const maxInfluenceEdges = 512;
export const maxCausalAssumptions = 256;
export const maxEvidenceItems = 256;
export const maxInterventionLinks = 256;
export const maxCausalRefs = 128;
export const maxCausalWarnings = 512;

export const causalVariableKinds = [
  "state",
  "metric",
  "parameter",
  "event",
  "resource",
  "network",
  "field",
  "aggregate",
  "latent",
  "exogenous",
  "intervention",
  "custom"
] as const;
export type CausalVariableKind = (typeof causalVariableKinds)[number];

export const causalObservabilityStatuses = ["direct", "indirect", "latent", "unobserved", "unknown"] as const;
export type CausalObservabilityStatus = (typeof causalObservabilityStatuses)[number];

export const influenceDirections = ["directed", "bidirectional", "undirected", "unknown"] as const;
export type InfluenceDirection = (typeof influenceDirections)[number];

export const influenceTypes = [
  "causalAssumption",
  "correlation",
  "mechanistic",
  "constraint",
  "feedback",
  "confounding",
  "mediation",
  "moderation",
  "association",
  "unknown",
  "custom"
] as const;
export type InfluenceType = (typeof influenceTypes)[number];

export const influencePolarities = ["positive", "negative", "mixed", "nonMonotonic", "unknown"] as const;
export type InfluencePolarity = (typeof influencePolarities)[number];

export const causalAssumptionTypes = [
  "directionality",
  "noUnmeasuredConfounding",
  "mechanism",
  "linearity",
  "monotonicity",
  "timeOrdering",
  "exclusionRestriction",
  "measurementValidity",
  "stationarity",
  "custom"
] as const;
export type CausalAssumptionType = (typeof causalAssumptionTypes)[number];

export const causalConfidenceLevels = ["low", "medium", "high", "unknown"] as const;
export type CausalConfidence = (typeof causalConfidenceLevels)[number];

export const causalAssumptionStatuses = [
  "hypothetical",
  "modelAssumed",
  "internallyTested",
  "literatureBased",
  "empiricalClaim",
  "externallyValidated",
  "unknown"
] as const;
export type CausalAssumptionStatus = (typeof causalAssumptionStatuses)[number];

export const evidenceTypes = [
  "none",
  "modelDesign",
  "internalTest",
  "expertJudgment",
  "literature",
  "empiricalDataset",
  "calibrationResult",
  "externalValidation",
  "unknown",
  "custom"
] as const;
export type EvidenceType = (typeof evidenceTypes)[number];

export const interventionKinds = ["setValue", "changeParameter", "removeEdge", "addEdge", "shock", "policy", "resourceChange", "custom"] as const;
export type InterventionKind = (typeof interventionKinds)[number];

export const interventionExpectedDirections = ["increase", "decrease", "mixed", "unknown"] as const;
export type InterventionExpectedDirection = (typeof interventionExpectedDirections)[number];

export interface CausalScope {
  templateId?: string;
  scenarioId?: string;
  runConfigId?: string;
  observabilityModelId?: string;
  scaleModelId?: string;
  boundaryModelId?: string;
  fieldLayerId?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface CausalVariable {
  id: string;
  label: string;
  variableKind: CausalVariableKind;
  observabilityStatus?: CausalObservabilityStatus;
  targetPath?: string;
  unit?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface InfluenceEdge {
  id: string;
  label: string;
  sourceVariableId: string;
  targetVariableId: string;
  direction: InfluenceDirection;
  influenceType: InfluenceType;
  polarity?: InfluencePolarity;
  strengthDescription?: string;
  lagDescription?: string;
  mechanismDescription?: string;
  evidenceIds?: readonly string[];
  assumptionIds?: readonly string[];
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface CausalAssumption {
  id: string;
  label: string;
  assumptionType: CausalAssumptionType;
  statement: string;
  confidence: CausalConfidence;
  status: CausalAssumptionStatus;
  evidenceIds?: readonly string[];
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface EvidenceItem {
  id: string;
  label: string;
  evidenceType: EvidenceType;
  provenance?: string;
  citation?: string;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface InterventionLink {
  id: string;
  label: string;
  targetVariableId: string;
  interventionKind: InterventionKind;
  expectedDirection?: InterventionExpectedDirection;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface CausalAssumptionModel {
  schemaVersion: "1";
  artifactType: typeof causalAssumptionModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  scope?: CausalScope;
  variables: readonly CausalVariable[];
  influences?: readonly InfluenceEdge[];
  assumptions?: readonly CausalAssumption[];
  evidenceItems?: readonly EvidenceItem[];
  interventionLinks?: readonly InterventionLink[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface CausalAssumptionMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface CausalAssumptionValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly CausalAssumptionMissingCapability[];
}

export interface CausalAssumptionSummary {
  id: string;
  name: string;
  variableCount: number;
  influenceCount: number;
  activeInfluenceCount: number;
  causalAssumptionEdgeCount: number;
  correlationEdgeCount: number;
  feedbackEdgeCount: number;
  confoundingEdgeCount: number;
  latentVariableCount: number;
  exogenousVariableCount: number;
  evidenceItemCount: number;
  empiricalEvidenceCount: number;
  assumptionCount: number;
  interventionLinkCount: number;
  executableCount: number;
  warnings: readonly string[];
}
