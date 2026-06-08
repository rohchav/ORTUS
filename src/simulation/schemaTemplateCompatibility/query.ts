import type {
  LossyMappingNote,
  SchemaConceptMapping,
  SchemaTemplateCompatibilityReport,
  TemplateCompatibilityResult,
  UnsupportedSchemaConcept
} from "./types";
import { validateSchemaTemplateCompatibilityReport, validateTemplateCompatibilityResult } from "./validation";

export function getBestTemplateFit(report: SchemaTemplateCompatibilityReport): TemplateCompatibilityResult | undefined {
  const valid = validateSchemaTemplateCompatibilityReport(report);
  const best = valid.bestTemplateId
    ? valid.templateResults.find((result) => result.templateId === valid.bestTemplateId)
    : [...valid.templateResults].sort((a, b) => b.score - a.score || fitRank(b.fit) - fitRank(a.fit) || a.templateId.localeCompare(b.templateId))[0];
  return best ? clone(best) : undefined;
}

export function listTemplateResults(report: SchemaTemplateCompatibilityReport): readonly TemplateCompatibilityResult[] {
  return clone(validateSchemaTemplateCompatibilityReport(report).templateResults);
}

export function getTemplateResult(report: SchemaTemplateCompatibilityReport, templateId: string): TemplateCompatibilityResult | undefined {
  const result = validateSchemaTemplateCompatibilityReport(report).templateResults.find((candidate) => candidate.templateId === templateId);
  return result ? clone(result) : undefined;
}

export function listMappedConcepts(result: TemplateCompatibilityResult): readonly SchemaConceptMapping[] {
  return clone(validateTemplateCompatibilityResult(result).mappedConcepts);
}

export function listUnsupportedConcepts(result: TemplateCompatibilityResult): readonly UnsupportedSchemaConcept[] {
  return clone(validateTemplateCompatibilityResult(result).unsupportedConcepts);
}

export function listLossyMappings(result: TemplateCompatibilityResult): readonly LossyMappingNote[] {
  return clone(validateTemplateCompatibilityResult(result).lossyMappings);
}

function fitRank(fit: TemplateCompatibilityResult["fit"]): number {
  switch (fit) {
    case "templateExact":
      return 4;
    case "strong":
      return 3;
    case "partial":
      return 2;
    case "weak":
      return 1;
    case "none":
      return 0;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
