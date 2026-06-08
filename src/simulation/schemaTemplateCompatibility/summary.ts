import {
  maxSchemaTemplateCompatibilityWarnings,
  type SchemaTemplateCompatibilityReport,
  type SchemaTemplateCompatibilitySummary,
  type TemplateCompatibilityResult
} from "./types";
import { validateSchemaTemplateCompatibilityReport } from "./validation";

export const requiredSchemaTemplateCompatibilityWarnings = [
  "Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models.",
  "A strong template fit does not mean a schema can run.",
  "Unsupported and lossy mappings must remain visible; they must not be silently dropped.",
  "Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines."
] as const;

export function summarizeSchemaTemplateCompatibility(report: SchemaTemplateCompatibilityReport): SchemaTemplateCompatibilitySummary {
  const valid = validateSchemaTemplateCompatibilityReport(report);
  const best = getBestResult(valid);
  return {
    reportId: valid.id,
    modelSchemaId: valid.modelSchemaId,
    templateResultCount: valid.templateResults.length,
    ...(best ? { bestTemplateId: best.templateId } : {}),
    bestFit: best?.fit ?? "none",
    mappedConceptCount: valid.templateResults.reduce((count, result) => count + result.mappedConcepts.length, 0),
    unsupportedConceptCount: valid.templateResults.reduce((count, result) => count + result.unsupportedConcepts.length, 0),
    lossyMappingCount: valid.templateResults.reduce((count, result) => count + result.lossyMappings.length, 0),
    runnableNow: false,
    warnings: getSchemaTemplateCompatibilityWarnings(valid),
    requiredRuntimeCapabilities: valid.requiredRuntimeCapabilities
  };
}

export function getSchemaTemplateCompatibilityWarnings(report: SchemaTemplateCompatibilityReport): readonly string[] {
  const valid = validateSchemaTemplateCompatibilityReport(report);
  const warnings: string[] = [
    ...requiredSchemaTemplateCompatibilityWarnings,
    "Valid compatibility reports are not runnable simulations.",
    "Template mapping profiles are structural metadata only; they are not runtime adapters, template factories, or template support claims.",
    "Active mappings are structurally active only; they are not runtime-executed.",
    "No ModelSchemaDefinition execution, formula parsing, compiler, interpreter, arbitrary code execution, or ruleDescription execution is available.",
    "No scenario generation, RunConfig generation, snapshot generation, template generation, engine creation, compiler, or interpreter is available.",
    "No scientific validation, calibration, causal proof, emergence proof, robustness proof, strategy effectiveness proof, safety certification, or operational readiness is provided by compatibility mapping.",
    "Global service availability is not template runtime support.",
    "Service-only primitives in schemas or profiles remain service-only; they are not template runtime support.",
    "Future-only primitives remain unsupported until explicit runtime work implements and tests them.",
    "Social-learning, belief, and memory descriptors are structural semantics; they do not implement human cognition, belief updates, memory updates, or social-learning runtime.",
    "Visual-builder workspace references are structural planning references, not visual-builder UI or runtime support.",
    "External framework references do not imply interop; NetLogo, Mesa, and MASON interop is not implemented.",
    "Broad compatible/convert/generate wording must be qualified as structural fit only."
  ];

  if (valid.templateResults.some((result) => result.fit === "strong" || result.fit === "templateExact")) {
    warnings.push("Strong or templateExact fit is still structural compatibility only, not runtime execution.");
    warnings.push("templateExact fit is still structural compatibility only; it does not make a schema runnable.");
  }
  if (valid.templateResults.some((result) => result.unsupportedConcepts.length > 0)) {
    warnings.push("At least one template result has unsupported schema concepts that must remain visible.");
  }
  if (valid.templateResults.some((result) => result.lossyMappings.length > 0)) {
    warnings.push("At least one template result has lossy mappings that must remain visible.");
  }
  if (valid.templateResults.some((result) => result.missingTemplateCapabilities.length > 0)) {
    warnings.push("At least one template result is missing template/runtime capabilities required for runnable behavior.");
  }

  const text = JSON.stringify(valid).toLowerCase();
  if (mentionsGeneration(text)) {
    warnings.push("Generation wording is present; compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines.");
  }
  if (mentionsConversion(text)) {
    warnings.push("Conversion wording is present; compatibility mapping does not convert schemas into runnable templates.");
  }
  if (mentionsValidationOrCalibration(text)) {
    warnings.push("Validation or calibration wording is present; compatibility mapping is not empirical validation or calibration.");
  }
  if (mentionsCausalOrProof(text)) {
    warnings.push("Proof or causality wording is present; compatibility mapping does not prove causality, emergence, robustness, or safety.");
  }
  if (mentionsExternalFramework(text)) {
    warnings.push("External framework wording is present; compatibility mapping does not implement NetLogo, Mesa, or MASON interop.");
  }
  if (mentionsSocialCognitiveRuntime(text)) {
    warnings.push("Social/cognitive runtime wording is present; compatibility mapping does not implement cognition, belief updates, memory updates, or social learning.");
  }
  if (mentionsLlmOrProfileRisk(text)) {
    warnings.push("LLM, embedding, real-person, protected-class, persuasion, or microtargeting wording is unsupported in compatibility mapping.");
  }

  for (const result of valid.templateResults) {
    warnings.push(...templateResultWarnings(result));
  }

  return Array.from(new Set(warnings)).slice(0, maxSchemaTemplateCompatibilityWarnings);
}

function templateResultWarnings(result: TemplateCompatibilityResult): readonly string[] {
  const warnings: string[] = [
    `Template ${result.templateId} compatibility result is structural only; runnableNow is false.`,
    `Template ${result.templateId} result does not claim schema execution, conversion, generation, validation, or calibration.`
  ];
  if (result.fit === "strong" || result.fit === "templateExact") {
    warnings.push(`Template ${result.templateId} has ${result.fit} fit, but that does not mean the schema can run.`);
  }
  if (result.unsupportedConcepts.length > 0) {
    warnings.push(`Template ${result.templateId} has unsupported schema concepts that must not be hidden.`);
  }
  if (result.lossyMappings.length > 0) {
    warnings.push(`Template ${result.templateId} has lossy mappings that must not be silently dropped.`);
  }
  return warnings;
}

function getBestResult(report: SchemaTemplateCompatibilityReport): TemplateCompatibilityResult | undefined {
  if (report.bestTemplateId) {
    return report.templateResults.find((result) => result.templateId === report.bestTemplateId);
  }
  return [...report.templateResults].sort((a, b) => b.score - a.score || fitRank(b.fit) - fitRank(a.fit) || a.templateId.localeCompare(b.templateId))[0];
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

function mentionsGeneration(text: string): boolean {
  return /\bgenerate\b|\bgeneration\b|\bgenerated\b|\bcreate engine\b|\bcreateengine\b|\brunconfig\b|\bsnapshot\b|\bscenario\b|\btemplate factory\b/.test(text);
}

function mentionsConversion(text: string): boolean {
  return /\bconvert\b|\bconversion\b|\bconverter\b/.test(text);
}

function mentionsValidationOrCalibration(text: string): boolean {
  return /\bvalidation\b|\bvalidate\b|\bcalibration\b|\bcalibrated\b/.test(text);
}

function mentionsCausalOrProof(text: string): boolean {
  return /\bcausal\b|\bcausality\b|\bproof\b|\bprove\b|\bemergence proof\b|\brobustness proof\b|\bsafety\b|\bcertification\b|\boperational readiness\b/.test(text);
}

function mentionsExternalFramework(text: string): boolean {
  return /\bnetlogo\b|\bmesa\b|\bmason\b|\bexternal framework\b|\binterop\b/.test(text);
}

function mentionsSocialCognitiveRuntime(text: string): boolean {
  return /\bsocial-learning runtime\b|\bsocial learning runtime\b|\bhuman cognition\b|\bmind simulation\b|\bbelief update\b|\bmemory update\b/.test(text);
}

function mentionsLlmOrProfileRisk(text: string): boolean {
  return /\bllm\b|\blarge language model\b|\bembedding\b|\bmodel weight\b|\breal person\b|\bprotected class\b|\bprotected-class\b|\bpersuasion\b|\bmicrotargeting\b/.test(text);
}
