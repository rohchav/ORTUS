import type { InterventionDefinition, InterventionTargetType, SimulationTemplate } from "../simulation";
import { formatNumber } from "../lib/format";
import type { StatusPillCategory, StatusPillState, StatusPillTone } from "./ui/statusPillSemantics";

export const INTERVENTION_READINESS_NON_PERSISTENT_COPY =
  "Intervention readiness describes available model perturbation controls. It is not a saved intervention plan or experiment record.";

export const INTERVENTION_MODEL_BOUNDARY_COPY =
  "Intervention in ORTUS means changing or inspecting model conditions. It does not certify real-world causal power, policy effectiveness, or empirical truth.";

export const INTERVENTION_RESPONSE_BOUNDARY_COPY =
  "A response to an intervention is evidence about this model under this configuration. It is not automatic proof that the same intervention would work in the real system.";

export type InterventionAvailability = "available" | "unavailable" | "future-only" | "conceptual";

export interface InterventionStatusModel {
  label: string;
  tone: StatusPillTone;
  category: StatusPillCategory;
  state: StatusPillState;
  description: string;
}

export interface InterventionReadinessSummary {
  templateId: string;
  templateLabel: string;
  worldModeLabel: string;
  availability: InterventionAvailability;
  availabilityStatus: InterventionStatusModel;
  registeredControlCount: number;
  registeredControlLabel: string;
  selectedControlLabel: string;
  applicationTimingLabel: string;
  runtimePathLabel: string;
  activeRunRecordLabel: string;
  persistenceBoundaryLabel: string;
  labBoundaryLabel: string;
  atlasBoundaryLabel: string;
  readinessCopy: string;
  modelBoundaryCopy: string;
}

export interface InterventionTargetSummary {
  id: string;
  label: string;
  availability: InterventionAvailability;
  availabilityStatus: InterventionStatusModel;
  targetKindLabel: string;
  targetStatusLabel: string;
  targetReady: boolean;
  parameterSummaryLabel: string;
  mutatesLabel: string;
  documentation: string;
}

export interface InterventionBoundarySummary {
  evidenceStatus: InterventionStatusModel;
  responseBoundaryCopy: string;
  claimBoundaries: readonly string[];
}

export interface ActiveInterventionReadiness {
  readiness: InterventionReadinessSummary;
  selectedTarget: InterventionTargetSummary | null;
  targets: readonly InterventionTargetSummary[];
  boundary: InterventionBoundarySummary;
}

export interface ActiveInterventionReadinessInput {
  selectedTemplateId: string;
  template?: Pick<SimulationTemplate, "id" | "name" | "capabilities">;
  templateLabel?: string;
  definitions: readonly InterventionDefinition[];
  selectedInterventionId?: string;
  selectedEntityId: string | null;
  targetPoint: { x: number; y: number } | null;
  targetCell: { row: number; col: number } | null;
  hasActiveEngine: boolean;
  activeInterventionCount: number;
}

export function deriveActiveInterventionReadiness(input: ActiveInterventionReadinessInput): ActiveInterventionReadiness {
  const templateId = input.template?.id ?? input.selectedTemplateId;
  const templateLabel = input.templateLabel ?? input.template?.name ?? templateId;
  const definitions = input.definitions.filter((definition) => definition.templateId === templateId);
  const selectedDefinition =
    definitions.find((definition) => definition.id === input.selectedInterventionId) ?? definitions[0] ?? null;
  const targets = definitions.map((definition) => deriveTargetSummary(definition, input));
  const availability = deriveReadinessAvailability(definitions, input);

  return {
    readiness: {
      templateId,
      templateLabel,
      worldModeLabel: "World / Intervene",
      availability,
      availabilityStatus: readinessStatus(availability, definitions.length, input.hasActiveEngine),
      registeredControlCount: definitions.length,
      registeredControlLabel: controlCountLabel(definitions.length),
      selectedControlLabel: selectedDefinition?.label ?? "No selected intervention control",
      applicationTimingLabel: definitions.length > 0 ? "Immediate live-run perturbation; does not advance model time." : "No live perturbation control is registered.",
      runtimePathLabel: definitions.length > 0 ? "Template-defined control through the headless intervention executor." : "No template-owned executor path is exposed.",
      activeRunRecordLabel: activeRunRecordLabel(input.activeInterventionCount),
      persistenceBoundaryLabel: "No saved intervention plan, experiment record, notebook entry, or reusable Lab asset is created by this panel.",
      labBoundaryLabel: "Persistent Lab intervention records are still not implemented.",
      atlasBoundaryLabel: "Discovery Atlas records are not created from intervention responses.",
      readinessCopy: INTERVENTION_READINESS_NON_PERSISTENT_COPY,
      modelBoundaryCopy: INTERVENTION_MODEL_BOUNDARY_COPY
    },
    selectedTarget: selectedDefinition ? targets.find((target) => target.id === selectedDefinition.id) ?? null : null,
    targets,
    boundary: deriveInterventionBoundarySummary()
  };
}

export function describeInterventionTarget(
  targetType: InterventionTargetType | string | undefined,
  selectedEntityId: string | null,
  point: { x: number; y: number } | null,
  gridCell: { row: number; col: number } | null
): string {
  if (!targetType || targetType === "none") {
    return "No target required";
  }
  if (targetType === "selectedEntity") {
    return selectedEntityId ? `Selected entity ${selectedEntityId}` : "No entity selected";
  }
  if (targetType === "gridCell") {
    return gridCell ? `Cell ${gridCell.row}, ${gridCell.col}` : "No grid cell selected";
  }
  if (point) {
    return `Point ${formatNumber(point.x, 1)}, ${formatNumber(point.y, 1)}`;
  }
  return selectedEntityId ? `Selected entity ${selectedEntityId}` : "No point selected";
}

export function isInterventionTargetReady(
  targetType: InterventionTargetType | string | undefined,
  selectedEntityId: string | null,
  point: { x: number; y: number } | null,
  gridCell: { row: number; col: number } | null
): boolean {
  if (!targetType || targetType === "none") {
    return true;
  }
  if (targetType === "selectedEntity") {
    return Boolean(selectedEntityId);
  }
  if (targetType === "worldPoint" || targetType === "radius") {
    return Boolean(point || selectedEntityId);
  }
  if (targetType === "gridCell") {
    return Boolean(gridCell);
  }
  return false;
}

export function deriveInterventionBoundarySummary(): InterventionBoundarySummary {
  return {
    evidenceStatus: {
      label: "Model response",
      tone: "neutral",
      category: "evidence",
      state: "unresolved",
      description: "Intervention responses need external evidence before they can support real-world causal claims."
    },
    responseBoundaryCopy: INTERVENTION_RESPONSE_BOUNDARY_COPY,
    claimBoundaries: [
      "Interventions change model conditions; they do not act on the real system.",
      "Observed changes after an intervention are model behavior shaped by assumptions, seed, starting state, stochasticity, and template design.",
      "No Lab experiment record or Atlas discovery is created by applying a World intervention control."
    ]
  };
}

function deriveTargetSummary(definition: InterventionDefinition, input: ActiveInterventionReadinessInput): InterventionTargetSummary {
  const targetReady = isInterventionTargetReady(definition.targetType, input.selectedEntityId, input.targetPoint, input.targetCell);
  const availability: InterventionAvailability = input.hasActiveEngine && targetReady ? "available" : "unavailable";

  return {
    id: definition.id,
    label: definition.label,
    availability,
    availabilityStatus: targetAvailabilityStatus(availability, definition.targetType, input.hasActiveEngine),
    targetKindLabel: targetKindLabel(definition.targetType),
    targetStatusLabel: describeInterventionTarget(definition.targetType, input.selectedEntityId, input.targetPoint, input.targetCell),
    targetReady,
    parameterSummaryLabel:
      definition.parameterDefinitions.length === 0
        ? "No parameters"
        : `${definition.parameterDefinitions.length} parameter${definition.parameterDefinitions.length === 1 ? "" : "s"}`,
    mutatesLabel: definition.mutates.length === 0 ? "No declared mutation scope" : definition.mutates.join(", "),
    documentation: definition.documentation
  };
}

function deriveReadinessAvailability(
  definitions: readonly InterventionDefinition[],
  input: Pick<ActiveInterventionReadinessInput, "hasActiveEngine" | "template">
): InterventionAvailability {
  if (!input.hasActiveEngine) {
    return "unavailable";
  }
  if (definitions.length > 0) {
    return "available";
  }
  return "unavailable";
}

function readinessStatus(
  availability: InterventionAvailability,
  registeredControlCount: number,
  hasActiveEngine: boolean
): InterventionStatusModel {
  if (availability === "available") {
    return {
      label: "Controls available",
      tone: "moss",
      category: "capability",
      state: "supported",
      description: `${registeredControlCount} template-owned intervention control${registeredControlCount === 1 ? "" : "s"} available for the active World run.`
    };
  }
  if (!hasActiveEngine) {
    return {
      label: "Engine required",
      tone: "neutral",
      category: "capability",
      state: "unsupported",
      description: "World does not currently expose an active engine for intervention controls."
    };
  }
  return {
    label: "No controls",
    tone: "neutral",
    category: "capability",
    state: "unsupported",
    description: "No template-owned intervention controls are registered for this model."
  };
}

function targetAvailabilityStatus(
  availability: InterventionAvailability,
  targetType: InterventionTargetType,
  hasActiveEngine: boolean
): InterventionStatusModel {
  if (!hasActiveEngine) {
    return {
      label: "Engine required",
      tone: "neutral",
      category: "capability",
      state: "unsupported",
      description: "This control needs an active World engine before it can be applied."
    };
  }
  if (availability === "available") {
    return {
      label: targetType === "none" ? "No target needed" : "Target ready",
      tone: "moss",
      category: "interaction",
      state: "active",
      description: targetType === "none" ? "This control can apply without a selected world target." : "The required World target is available."
    };
  }
  return {
    label: "Target needed",
    tone: "neutral",
    category: "interaction",
    state: "idle",
    description: "Select the required World target before applying this control."
  };
}

function targetKindLabel(targetType: InterventionTargetType): string {
  switch (targetType) {
    case "none":
      return "No target";
    case "selectedEntity":
      return "Selected entity";
    case "worldPoint":
      return "World point";
    case "radius":
      return "Radius around point or selected entity";
    case "gridCell":
      return "Grid cell";
  }
}

function controlCountLabel(count: number): string {
  if (count === 0) {
    return "No registered template controls";
  }
  return `${count} registered template control${count === 1 ? "" : "s"}`;
}

function activeRunRecordLabel(count: number): string {
  if (count === 0) {
    return "No interventions applied in the current active run.";
  }
  return `${count} active-run intervention record${count === 1 ? "" : "s"} in current engine/snapshot state; not a saved Lab record.`;
}
