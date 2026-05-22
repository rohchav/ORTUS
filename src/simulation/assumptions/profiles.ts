import type { AssumptionConfidence, AssumptionItem, AssumptionSeverity, ModelAssumptionProfile, ValidationStatus } from "./types";
import { assumptionProfileArtifactType } from "./types";
import { validateAssumptionProfile } from "./validation";

export interface CreateTemplateAssumptionProfileOptions {
  templateId: string;
  assumptions: readonly string[];
  limitations: readonly string[];
  notRepresented: readonly string[];
  appropriateUse: readonly string[];
  inappropriateUse: readonly string[];
  ethicsNotes?: readonly string[];
  validationStatus: ValidationStatus;
  validationNotes: string;
}

export function createTemplateAssumptionProfile(options: CreateTemplateAssumptionProfileOptions): ModelAssumptionProfile {
  return validateAssumptionProfile({
    schemaVersion: "1",
    artifactType: assumptionProfileArtifactType,
    id: `assumption-profile:${options.templateId}`,
    ownerType: "template",
    ownerId: options.templateId,
    assumptions: assumptionItems("assumption", options.assumptions),
    limitations: assumptionItems(
      "limitation",
      [
        ...options.limitations,
        "Runtime metrics are model outputs, not empirical observations or calibration evidence.",
        "Runtime rules and interactions are model design assumptions, not empirical evidence of causality.",
        "Template parameter labels, metric labels, and numeric bounds are not full runtime unit or dimension semantics; per-tick rates use model time unless explicitly mapped.",
        "Templates may visually or metrically exhibit patterns, but ORTUS does not perform runtime emergence detection; visual patterns and metric traces are model outputs, not empirical proof.",
        "Templates may visually or metrically show persistence, collapse, recovery, or sensitivity, but ORTUS does not perform runtime robustness/resilience testing; visual patterns and metric traces are model outputs, not empirical robustness evidence.",
        "Uncertainty ensembles are not robustness validation by themselves.",
        "Templates may have runtime interventions or controllable-looking parameters, but ORTUS does not perform strategy/control evaluation; template-owned interventions are not general strategy/control support.",
        "Visual patterns and metric traces are model outputs, not empirical evidence that a strategy works; uncertainty ensembles and robustness descriptors are not policy validation by themselves."
      ],
      "caution"
    ),
    notRepresented: assumptionItems("not-represented", options.notRepresented, "caution"),
    appropriateUse: assumptionItems("appropriate-use", options.appropriateUse),
    inappropriateUse: assumptionItems("inappropriate-use", options.inappropriateUse, "critical"),
    ethicsNotes: assumptionItems("ethics", options.ethicsNotes ?? [], "caution", "medium"),
    validationStatus: options.validationStatus,
    validationNotes: options.validationNotes
  });
}

function assumptionItems(
  prefix: string,
  values: readonly string[],
  severity: AssumptionSeverity = "info",
  confidence: AssumptionConfidence = "unknown"
): AssumptionItem[] {
  return values.map((description, index) => ({
    id: `${prefix}-${index + 1}`,
    label: sentenceLabel(description),
    description,
    severity,
    confidence
  }));
}

function sentenceLabel(value: string): string {
  const trimmed = value.trim().replace(/\.$/, "");
  if (trimmed.length <= 72) {
    return trimmed;
  }
  return `${trimmed.slice(0, 69).trim()}...`;
}
