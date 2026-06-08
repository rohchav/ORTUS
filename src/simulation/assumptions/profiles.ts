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
        "Visual patterns and metric traces are model outputs, not empirical evidence that a strategy works; uncertainty ensembles and robustness descriptors are not policy validation by themselves.",
        "Production templates are hand-built runtime models; they are not generated from ModelSchemaDefinition artifacts.",
        "Template parameters, metrics, and interventions are template-owned runtime metadata, not automatically ModelSchemaDefinition declarations or executable schema rules.",
        "Forest Fire / Landscape Spread is a hand-built local-spread template, not evidence of a generic model-schema interpreter.",
        "ModelSchemaDefinition artifacts are structural and not executable; valid schemas do not imply visual-builder support, compiler/runtime support, or scenario/RunConfig/snapshot generation.",
        "Belief, memory, or social-learning schema rule declarations do not implement social-learning runtime, human cognition, or LLM agents.",
        "Current templates do not implement social-learning runtime.",
        "Opinion Dynamics is a stylized opinion model, not a full cognitive or social-learning model.",
        "Knowledge, memory, and social-learning descriptors are structural only; they do not implement full human cognition, LLM agents, real-person profiling, protected-class inference, persuasion, or policy guidance.",
        "Visual builder workspace schemas are structural only; current templates are not generated from builder workspaces.",
        "Builder workspaces do not execute schemas or rules; workspace graph edges are not dataflow or runtime behavior.",
        "No visual builder UI or custom runtime exists yet.",
        "Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models.",
        "A strong template fit does not mean a schema can run.",
        "Unsupported and lossy mappings must remain visible; they must not be silently dropped.",
        "Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines."
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
