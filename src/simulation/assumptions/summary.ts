import type { JsonValue, SimulationTemplate } from "../kernel/types";
import type { AuthoredScenario } from "../scenarios/scenarioTypes";
import type { UncertaintyConfig } from "../uncertainty/types";
import { createTemplateAssumptionProfile } from "./profiles";
import type { AssumptionItem, AssumptionSummary, ModelAssumptionProfile, ScenarioAssumptionNotes } from "./types";
import { assertAssumptionSummaryBounds, validateAssumptionItems, validateAssumptionProfile, validateScenarioAssumptionNotes } from "./validation";

type ScenarioAssumptionSource = Pick<AuthoredScenario, "assumptionNotes" | "limitationNotes" | "validationNotes" | "ethicsNotes"> & {
  scenarioId?: string;
};

export function templateAssumptionProfile(template: SimulationTemplate): ModelAssumptionProfile {
  if (template.assumptionProfile) {
    return validateAssumptionProfile(template.assumptionProfile);
  }
  return createTemplateAssumptionProfile({
    templateId: template.id,
    assumptions: template.documentation.assumptions,
    limitations: template.documentation.limitations,
    notRepresented: template.documentation.notRepresented ?? ["No structured not-represented metadata was supplied."],
    appropriateUse: template.documentation.appropriateUse ?? ["Exploratory model inspection."],
    inappropriateUse: template.documentation.inappropriateUse ?? ["Prediction or decision-making without validation."],
    ethicsNotes: [],
    validationStatus: "unknown",
    validationNotes: "No structured validation status metadata was supplied."
  });
}

export function buildAssumptionSummary(options: {
  template: SimulationTemplate;
  scenario?: ScenarioAssumptionSource;
  uncertaintyConfig?: Pick<UncertaintyConfig, "id" | "label" | "variables" | "metadata">;
}): AssumptionSummary {
  const templateProfile = templateAssumptionProfile(options.template);
  const scenarioNotes = validateScenarioAssumptionNotes({
    assumptionNotes: options.scenario?.assumptionNotes,
    limitationNotes: options.scenario?.limitationNotes,
    validationNotes: options.scenario?.validationNotes,
    ethicsNotes: options.scenario?.ethicsNotes
  });
  const uncertaintyNotes = uncertaintyAssumptionNotes(options.uncertaintyConfig);
  const summary = {
    templateProfile,
    scenarioNotes,
    uncertaintyNotes,
    provenance: buildAssumptionProvenance({
      template: options.template,
      scenario: options.scenario,
      uncertaintyConfig: options.uncertaintyConfig
    })
  };
  assertAssumptionSummaryBounds(summary);
  return summary;
}

export function buildAssumptionProvenance(options: {
  template: SimulationTemplate;
  scenario?: ScenarioAssumptionSource;
  uncertaintyConfig?: Pick<UncertaintyConfig, "id" | "label" | "variables" | "metadata">;
}): Record<string, JsonValue> {
  const templateProfile = templateAssumptionProfile(options.template);
  const scenarioNoteCounts = scenarioAssumptionNoteCounts(options.scenario);
  const uncertaintyNoteCount = uncertaintyAssumptionNotes(options.uncertaintyConfig).length;
  return {
    templateId: options.template.id,
    templateVersion: options.template.version,
    templateProfileId: templateProfile.id,
    templateValidationStatus: templateProfile.validationStatus,
    ...(options.scenario?.scenarioId ? { scenarioId: options.scenario.scenarioId } : {}),
    scenarioNoteCounts,
    ...(options.uncertaintyConfig
      ? {
          uncertaintyConfigId: options.uncertaintyConfig.id ?? null,
          uncertaintyConfigLabel: options.uncertaintyConfig.label ?? null,
          uncertaintyVariableNoteCount: options.uncertaintyConfig.variables.filter((variable) => Boolean(variable.notes?.trim())).length,
          uncertaintyAssumptionNoteCount: uncertaintyNoteCount
        }
      : {})
  };
}

export function scenarioAssumptionNoteCounts(
  scenario?: ScenarioAssumptionSource
): Record<string, JsonValue> {
  return {
    assumptionNotes: scenario?.assumptionNotes?.length ?? 0,
    limitationNotes: scenario?.limitationNotes?.length ?? 0,
    validationNotes: scenario?.validationNotes?.length ?? 0,
    ethicsNotes: scenario?.ethicsNotes?.length ?? 0
  };
}

export function uncertaintyAssumptionNotes(
  config?: Pick<UncertaintyConfig, "variables" | "metadata">
): AssumptionItem[] {
  if (!config) {
    return [];
  }
  const variableNotes = config.variables
    .filter((variable) => Boolean(variable.notes?.trim()))
    .map((variable): AssumptionItem => ({
      id: `uncertainty-${variable.id}`,
      label: variable.label,
      description: variable.notes?.trim() ?? "",
      severity: "caution",
      category: "uncertainty",
      confidence: "unknown"
    }));
  const assumption = typeof config.metadata?.assumption === "string" ? config.metadata.assumption.trim() : "";
  const notes = assumption
    ? [
        ...variableNotes,
        {
          id: "uncertainty-metadata-assumption",
          label: "Uncertainty assumption",
          description: assumption,
          severity: "caution",
          category: "uncertainty",
          confidence: "unknown"
        }
      ]
    : variableNotes;
  return [...validateAssumptionItems("uncertainty assumption notes", notes)];
}

export function hasScenarioAssumptionNotes(notes: ScenarioAssumptionNotes): boolean {
  return (
    (notes.assumptionNotes?.length ?? 0) +
      (notes.limitationNotes?.length ?? 0) +
      (notes.validationNotes?.length ?? 0) +
      (notes.ethicsNotes?.length ?? 0) >
    0
  );
}
