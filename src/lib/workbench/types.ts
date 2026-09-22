import type { PrimitiveId } from "../../simulation/registry";

/** Explanatory presentation metadata. These objects are never executable artifacts. */
export type WorkbenchCapability = "executable" | "structural" | "reference" | "future";
export type WorkbenchPieceKind = "group" | "population" | "state" | "interaction" | "process" | "space" | "variation";
export type WorkbenchControlGroup = "parameters" | "initializationOptions" | "agentComposition" | "environmentOptions" | "run";

export interface WorkbenchControlReference {
  group: WorkbenchControlGroup;
  key: string;
}

export interface WorkbenchPiece {
  id: string;
  parentId?: string;
  label: string;
  description: string;
  kind: WorkbenchPieceKind;
  motif: string;
  capability: WorkbenchCapability;
  capabilityReason: string;
  controls: WorkbenchControlReference[];
  materialIds: string[];
  reads: string[];
  affects: string[];
  fixed: string;
}

export interface WorkbenchRelationship {
  id: string;
  from: string;
  to: string;
  label: string;
  description: string;
}

export interface WorkbenchModel {
  templateId: string;
  templateName: string;
  starterId: string;
  title: string;
  summary: string;
  visualKind: string;
  rootIds: string[];
  pieces: WorkbenchPiece[];
  relationships: WorkbenchRelationship[];
}

export interface WorkbenchMaterial {
  id: string;
  label: string;
  description: string;
  motif: string;
  primitiveId?: PrimitiveId;
}

export interface WorkbenchMaterialUsage extends WorkbenchMaterial {
  capability: WorkbenchCapability;
  capabilityReason: string;
  pieceIds: string[];
}
