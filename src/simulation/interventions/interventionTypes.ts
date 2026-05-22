import type { Command, ParameterDefinition, ParameterValues, TemplateCapabilities } from "../kernel/types";
import type { SimulationEngine } from "../kernel/SimulationEngine";
import type { WorldView } from "../kernel/World";
import type { GridCell, Point2D } from "../spaces/Space";

export type InterventionTargetType = "none" | "selectedEntity" | "worldPoint" | "radius" | "gridCell";
export type InterventionStatus = "applied" | "failed";
export type InterventionMutationKind = "agents" | "environment" | "metrics" | "runConfig";

export interface InterventionTarget {
  entityId?: string;
  point?: Point2D;
  gridCell?: GridCell;
}

export interface InterventionRequest {
  templateId: string;
  interventionId: string;
  parameters?: ParameterValues;
  target?: InterventionTarget;
}

export interface InterventionDefinition {
  id: string;
  templateId: string;
  label: string;
  description: string;
  targetType: InterventionTargetType;
  parameterDefinitions: readonly ParameterDefinition[];
  supportedTemplates: readonly string[];
  capabilityRequirements: readonly (keyof TemplateCapabilities)[];
  mutates: readonly InterventionMutationKind[];
  eventType: "intervention.applied";
  documentation: string;
  build(ctx: InterventionBuildContext): InterventionCommandResult;
}

export interface InterventionBuildContext {
  engine: SimulationEngine;
  world: WorldView;
  params: ParameterValues;
  target: InterventionTarget;
  requestId: string;
  historyIndex: number;
}

export interface InterventionCommandResult {
  commands: Command[];
  targetSummary: string;
  visualMarker?: InterventionVisualMarker;
}

export interface InterventionVisualMarker {
  kind: "point" | "gridCell" | "entity";
  x?: number;
  y?: number;
  row?: number;
  col?: number;
  entityId?: string;
  radius?: number;
}

export interface AppliedInterventionRecord {
  id: string;
  templateId: string;
  interventionId: string;
  label: string;
  tickApplied: number;
  simulationTime: number;
  targetSummary: string;
  parameters: ParameterValues;
  status: InterventionStatus;
  order: number;
  error?: string;
  visualMarker?: InterventionVisualMarker;
}

export interface InterventionExecutionResult {
  record: AppliedInterventionRecord;
  appliedCommandCount: number;
}

export const maxInterventionHistoryLength = 500;
