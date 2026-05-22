import { validateCausalAssumptionModel } from "./validation";
import type {
  CausalAssumption,
  CausalAssumptionModel,
  CausalAssumptionSummary,
  CausalVariable,
  EvidenceItem,
  InfluenceEdge,
  InterventionLink
} from "./types";
import { maxCausalWarnings } from "./types";

export function listCausalVariables(model: CausalAssumptionModel): readonly CausalVariable[] {
  return clone(validateCausalAssumptionModel(model).variables);
}

export function getCausalVariable(model: CausalAssumptionModel, variableId: string): CausalVariable | undefined {
  const variable = validateCausalAssumptionModel(model).variables.find((candidate) => candidate.id === variableId);
  return variable ? clone(variable) : undefined;
}

export function listLatentCausalVariables(model: CausalAssumptionModel): readonly CausalVariable[] {
  return clone(
    validateCausalAssumptionModel(model).variables.filter(
      (variable) => variable.variableKind === "latent" || variable.observabilityStatus === "latent"
    )
  );
}

export function listExogenousVariables(model: CausalAssumptionModel): readonly CausalVariable[] {
  return clone(validateCausalAssumptionModel(model).variables.filter((variable) => variable.variableKind === "exogenous"));
}

export function listInfluences(model: CausalAssumptionModel): readonly InfluenceEdge[] {
  return clone(validateCausalAssumptionModel(model).influences ?? []);
}

export function listActiveInfluences(model: CausalAssumptionModel): readonly InfluenceEdge[] {
  return clone((validateCausalAssumptionModel(model).influences ?? []).filter((influence) => influence.active));
}

export function getInfluence(model: CausalAssumptionModel, influenceId: string): InfluenceEdge | undefined {
  const influence = validateCausalAssumptionModel(model).influences?.find((candidate) => candidate.id === influenceId);
  return influence ? clone(influence) : undefined;
}

export function getInfluencesFromVariable(model: CausalAssumptionModel, variableId: string): readonly InfluenceEdge[] {
  return clone((validateCausalAssumptionModel(model).influences ?? []).filter((influence) => influence.sourceVariableId === variableId));
}

export function getInfluencesToVariable(model: CausalAssumptionModel, variableId: string): readonly InfluenceEdge[] {
  return clone((validateCausalAssumptionModel(model).influences ?? []).filter((influence) => influence.targetVariableId === variableId));
}

export function listCausalAssumptionEdges(model: CausalAssumptionModel): readonly InfluenceEdge[] {
  return clone((validateCausalAssumptionModel(model).influences ?? []).filter((influence) => influence.influenceType === "causalAssumption"));
}

export function listCorrelationEdges(model: CausalAssumptionModel): readonly InfluenceEdge[] {
  return clone((validateCausalAssumptionModel(model).influences ?? []).filter((influence) => influence.influenceType === "correlation"));
}

export function listFeedbackEdges(model: CausalAssumptionModel): readonly InfluenceEdge[] {
  return clone((validateCausalAssumptionModel(model).influences ?? []).filter((influence) => influence.influenceType === "feedback"));
}

export function listConfoundingEdges(model: CausalAssumptionModel): readonly InfluenceEdge[] {
  return clone((validateCausalAssumptionModel(model).influences ?? []).filter((influence) => influence.influenceType === "confounding"));
}

export function listCausalAssumptions(model: CausalAssumptionModel): readonly CausalAssumption[] {
  return clone(validateCausalAssumptionModel(model).assumptions ?? []);
}

export function getCausalAssumption(model: CausalAssumptionModel, assumptionId: string): CausalAssumption | undefined {
  const assumption = validateCausalAssumptionModel(model).assumptions?.find((candidate) => candidate.id === assumptionId);
  return assumption ? clone(assumption) : undefined;
}

export function listEvidenceItems(model: CausalAssumptionModel): readonly EvidenceItem[] {
  return clone(validateCausalAssumptionModel(model).evidenceItems ?? []);
}

export function getEvidenceItem(model: CausalAssumptionModel, evidenceId: string): EvidenceItem | undefined {
  const evidence = validateCausalAssumptionModel(model).evidenceItems?.find((candidate) => candidate.id === evidenceId);
  return evidence ? clone(evidence) : undefined;
}

export function listInterventionLinks(model: CausalAssumptionModel): readonly InterventionLink[] {
  return clone(validateCausalAssumptionModel(model).interventionLinks ?? []);
}

export function listActiveInterventionLinks(model: CausalAssumptionModel): readonly InterventionLink[] {
  return clone((validateCausalAssumptionModel(model).interventionLinks ?? []).filter((link) => link.active));
}

export function getInterventionLinksForVariable(model: CausalAssumptionModel, variableId: string): readonly InterventionLink[] {
  return clone((validateCausalAssumptionModel(model).interventionLinks ?? []).filter((link) => link.targetVariableId === variableId));
}

export function modelHasEmpiricalEvidence(model: CausalAssumptionModel): boolean {
  return (validateCausalAssumptionModel(model).evidenceItems ?? []).some((evidence) =>
    ["empiricalDataset", "calibrationResult", "externalValidation"].includes(evidence.evidenceType)
  );
}

export function modelHasActiveInterventionLinks(model: CausalAssumptionModel): boolean {
  return (validateCausalAssumptionModel(model).interventionLinks ?? []).some((link) => link.active);
}

export function summarizeCausalAssumptionModel(model: CausalAssumptionModel): CausalAssumptionSummary {
  const valid = validateCausalAssumptionModel(model);
  const variables = valid.variables;
  const influences = valid.influences ?? [];
  const evidenceItems = valid.evidenceItems ?? [];
  return {
    id: valid.id,
    name: valid.name,
    variableCount: variables.length,
    influenceCount: influences.length,
    activeInfluenceCount: influences.filter((influence) => influence.active).length,
    causalAssumptionEdgeCount: influences.filter((influence) => influence.influenceType === "causalAssumption").length,
    correlationEdgeCount: influences.filter((influence) => influence.influenceType === "correlation").length,
    feedbackEdgeCount: influences.filter((influence) => influence.influenceType === "feedback").length,
    confoundingEdgeCount: influences.filter((influence) => influence.influenceType === "confounding").length,
    latentVariableCount: variables.filter((variable) => variable.variableKind === "latent" || variable.observabilityStatus === "latent").length,
    exogenousVariableCount: variables.filter((variable) => variable.variableKind === "exogenous").length,
    evidenceItemCount: evidenceItems.length,
    empiricalEvidenceCount: evidenceItems.filter((evidence) =>
      ["empiricalDataset", "calibrationResult", "externalValidation"].includes(evidence.evidenceType)
    ).length,
    assumptionCount: (valid.assumptions ?? []).length,
    interventionLinkCount: (valid.interventionLinks ?? []).length,
    executableCount: 0,
    warnings: getCausalAssumptionWarnings(valid)
  };
}

export function validateCausalAssumptionModelForRuntime(model: CausalAssumptionModel) {
  const valid = validateCausalAssumptionModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "Causal assumption models declare influence assumptions; they do not prove causality.",
      "Active causal influences are structural declarations, not runtime-executed behavior.",
      ...getCausalAssumptionWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "causalAssumptions" as const,
        requiredSupportLevel: "runtime" as const,
        reason:
          "Causal Assumptions V1 is structural only; current templates do not execute causal edges, intervention links, discovery, do-calculus, inference, optimization, validation, or calibration."
      }
    ]
  };
}

export function getCausalAssumptionWarnings(model: CausalAssumptionModel): readonly string[] {
  const valid = validateCausalAssumptionModel(model);
  const warnings: string[] = [];
  const evidenceById = new Map((valid.evidenceItems ?? []).map((evidence) => [evidence.id, evidence]));
  const variablesById = new Map(valid.variables.map((variable) => [variable.id, variable]));
  const causalLanguageUsed =
    (valid.influences ?? []).some((influence) =>
      ["causalAssumption", "mechanistic", "feedback", "confounding", "mediation", "moderation"].includes(influence.influenceType)
    ) || (valid.assumptions ?? []).some((assumption) => assumption.status === "empiricalClaim" || assumption.assumptionType === "noUnmeasuredConfounding");

  for (const variable of valid.variables) {
    if (variable.targetPath && /(^|\.)(metrics|metricHistory)(\.|$)/.test(variable.targetPath)) {
      warnings.push(`Variable ${variable.id} references runtime metrics; metrics are model outputs, not causal evidence by themselves.`);
    }
  }

  for (const influence of valid.influences ?? []) {
    if (influence.active) {
      warnings.push(`Active influence ${influence.id} is a structural declaration, not runtime-executed behavior.`);
    }
    if (influence.influenceType === "causalAssumption" && !influence.mechanismDescription) {
      warnings.push(`Causal assumption influence ${influence.id} has no mechanismDescription.`);
    }
    if (influence.influenceType === "causalAssumption" && (influence.evidenceIds ?? []).length === 0) {
      warnings.push(`Causal assumption influence ${influence.id} has no evidenceIds; this is not causal proof.`);
    }
    if (influence.influenceType === "correlation") {
      warnings.push(`Correlation influence ${influence.id} is a structural association; correlation is not causation.`);
    }
    if (influence.influenceType === "unknown") {
      warnings.push(`Influence ${influence.id} has unknown influenceType.`);
    }
    if (influence.direction === "unknown") {
      warnings.push(`Influence ${influence.id} has unknown direction.`);
    }
    if (influence.polarity === "unknown") {
      warnings.push(`Influence ${influence.id} has unknown polarity.`);
    }
    if (influence.influenceType === "feedback") {
      warnings.push(`Feedback influence ${influence.id} is a structural label, not inferred dynamics or causal proof.`);
    }
    if (influence.influenceType === "confounding" && !hasConfounderExplanation(influence)) {
      warnings.push(`Confounding influence ${influence.id} has no confounder explanation.`);
    }
    if ((influence.influenceType === "mediation" || influence.influenceType === "moderation") && !influence.mechanismDescription) {
      warnings.push(`Influence ${influence.id} declares ${influence.influenceType} without mechanismDescription.`);
    }
    for (const evidenceId of influence.evidenceIds ?? []) {
      const evidence = evidenceById.get(evidenceId);
      if (evidence && ["empiricalDataset", "calibrationResult", "externalValidation"].includes(evidence.evidenceType)) {
        warnings.push(`Influence ${influence.id} references ${evidence.evidenceType}; evidence items do not prove causality in V1.`);
      }
    }
  }

  for (const assumption of valid.assumptions ?? []) {
    if (assumption.status === "empiricalClaim" && (assumption.evidenceIds ?? []).length === 0) {
      warnings.push(`Causal assumption ${assumption.id} is an empiricalClaim without evidenceIds or provenance.`);
    }
    if (assumption.confidence === "high" && (assumption.evidenceIds ?? []).length === 0) {
      warnings.push(`High confidence causal assumption ${assumption.id} has no evidenceIds.`);
    }
    if (assumption.assumptionType === "noUnmeasuredConfounding" && assumption.confidence === "high") {
      warnings.push(`No-unmeasured-confounding assumption ${assumption.id} has high confidence; V1 does not prove absence of hidden confounding.`);
    }
    for (const evidenceId of assumption.evidenceIds ?? []) {
      const evidence = evidenceById.get(evidenceId);
      if (assumption.status === "empiricalClaim" && evidence && !hasEvidenceProvenance(evidence)) {
        warnings.push(`Empirical claim assumption ${assumption.id} references evidence ${evidenceId} without provenance.`);
      }
    }
  }

  for (const evidence of valid.evidenceItems ?? []) {
    if (evidence.evidenceType === "empiricalDataset" && !hasEvidenceProvenance(evidence)) {
      warnings.push(`Evidence item ${evidence.id} is empiricalDataset without provenance.`);
    }
    if (evidence.evidenceType === "calibrationResult" && !hasEvidenceProvenance(evidence)) {
      warnings.push(`Evidence item ${evidence.id} is calibrationResult without provenance; calibration is not implemented by causal assumptions V1.`);
    }
    if (evidence.evidenceType === "externalValidation" && !hasEvidenceProvenance(evidence)) {
      warnings.push(`Evidence item ${evidence.id} is externalValidation without provenance; validation is not implemented by causal assumptions V1.`);
    }
  }

  for (const link of valid.interventionLinks ?? []) {
    const variable = variablesById.get(link.targetVariableId);
    if (link.active) {
      warnings.push(`Active intervention link ${link.id} is structural only and is not executed.`);
    }
    if (variable?.variableKind !== "intervention" && link.interventionKind === "setValue") {
      warnings.push(`Intervention link ${link.id} targets ${link.targetVariableId}; V1 records relevance only and does not make intervention decisions safe.`);
    }
  }

  if (valid.scope?.observabilityModelId) {
    warnings.push("Causal scope references an observability model; observability is measurement structure, not validation or causal proof.");
  }
  if (valid.scope?.metadata && referencesUnsupportedScope(valid.scope.metadata)) {
    warnings.push("Causal scope metadata references reserved/future artifacts; V1 remains structural and non-runnable.");
  }
  if (causalLanguageUsed && (valid.evidenceItems ?? []).length === 0) {
    warnings.push("Causal language is used with no evidence items declared; the model is assumptions metadata, not causal proof.");
  }

  return warnings.slice(0, maxCausalWarnings);
}

function hasEvidenceProvenance(evidence: EvidenceItem): boolean {
  return Boolean(evidence.provenance || evidence.citation || evidence.notes?.some((note) => /provenance|source|citation|dataset|evidence/i.test(note)));
}

function hasConfounderExplanation(influence: InfluenceEdge): boolean {
  return Boolean(
    influence.mechanismDescription ||
      influence.notes?.some((note) => /confound|hidden|common cause|third variable|omitted/i.test(note)) ||
      influence.metadata?.confounder ||
      influence.metadata?.confounderDescription
  );
}

function referencesUnsupportedScope(metadata: Record<string, unknown>): boolean {
  const text = JSON.stringify(metadata);
  return /ortus\.(validationReport|modelDefinition|visualModel|traceReport|patternLibrary|domainPack)/.test(text);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
