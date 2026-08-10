import { z } from "zod";
import { getProductionTemplate } from "../../../simulation";
import { getStarterWorldById } from "../registry";
import { assertSafeStarterWorldValue } from "../validation";
import {
  getPreparedStarterComparisonById,
  getStarterWorldLaunchRecipeById,
  getStarterWorldPackById
} from "../packs";
import { deriveRequiredGuidedInvestigationFacts } from "./authority";
import {
  guidedInvestigationDefinitionListSchema,
  type GuidedInvestigationDefinition
} from "./types";

export interface GuidedInvestigationValidationIssue {
  code: string;
  path: string;
  message: string;
}

export class GuidedInvestigationValidationError extends Error {
  readonly issues: readonly GuidedInvestigationValidationIssue[];

  constructor(issues: readonly GuidedInvestigationValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
    this.name = "GuidedInvestigationValidationError";
    this.issues = issues;
  }
}

const prohibitedClaims = [
  /\b(?:guarantees?|proves?|validated?|causes? in reality)\b/i,
  /\b(?:statistical(?:ly)? significant|robust(?:ness)? evidence|causal (?:proof|effect))\b/i,
  /\b(?:completed the lesson|mastered|learning outcome achieved|you learned|you understood)\b/i,
  /\b(?:always fragments?|must increase)\b/i
];
const prohibitedOperationalLanguage = [
  /\b(?:auto-?run|automatically runs?|auto-?save|automatically saves?)\b/i,
  /\b(?:progress record|learner profile)\b/i,
  /\b(?:RunConfig|parameterOverrides|initializationOptions|expected result)\b/i
];
const authoredNumericResult = /(?:^|\s)[+-]?(?:\d+\.?\d*|\.\d+)(?:\s|$|[.,;:!?])/;

export function validateGuidedInvestigationDefinitions(
  input: unknown
): readonly GuidedInvestigationDefinition[] {
  assertSafeStarterWorldValue(input);
  rejectExecutableValues(input);
  const parsed = guidedInvestigationDefinitionListSchema.safeParse(input);
  if (!parsed.success) {
    throw new GuidedInvestigationValidationError(zodIssues(parsed.error));
  }

  const issues: GuidedInvestigationValidationIssue[] = [];
  const ids = new Map<string, number>();
  const slugs = new Map<string, number>();
  for (const [index, guide] of parsed.data.entries()) {
    collectUnique(ids, guide.id, index, `[${index}].id`, "duplicate-guide-id", "Guide ID", issues);
    collectUnique(slugs, guide.slug, index, `[${index}].slug`, "duplicate-guide-slug", "Guide slug", issues);
    issues.push(...referenceIssues(guide).map((issue) => ({ ...issue, path: `[${index}].${issue.path}` })));
    issues.push(...structureIssues(guide).map((issue) => ({ ...issue, path: `[${index}].${issue.path}` })));
    issues.push(...contentIssues(guide).map((issue) => ({ ...issue, path: `[${index}].${issue.path}` })));
  }

  throwIfIssues(issues);
  return [...parsed.data].sort((left, right) => left.id.localeCompare(right.id));
}

export function guidedInvestigationReferenceIssues(
  guide: GuidedInvestigationDefinition
): GuidedInvestigationValidationIssue[] {
  return referenceIssues(guide);
}

function referenceIssues(guide: GuidedInvestigationDefinition): GuidedInvestigationValidationIssue[] {
  const issues: GuidedInvestigationValidationIssue[] = [];
  const add = (code: string, path: string, message: string) => issues.push({ code, path, message });
  const pack = getStarterWorldPackById(guide.packId);
  const world = getStarterWorldById(guide.starterWorldId);
  const comparison = getPreparedStarterComparisonById(guide.preparedComparisonId);

  if (!pack) {
    add("unknown-guide-pack", "packId", `Unknown Starter World pack "${guide.packId}".`);
  }
  if (!world) {
    add("unknown-guide-world", "starterWorldId", `Unknown Starter World "${guide.starterWorldId}".`);
  } else if (world.runtimeStatus !== "runnable" || !world.runtime) {
    add("non-runnable-guide-world", "starterWorldId", "Guided investigations require a runnable Starter World.");
  }
  if (pack && !pack.worldIds.includes(guide.starterWorldId)) {
    add("guide-world-outside-pack", "starterWorldId", "The guided Starter World does not belong to the referenced pack.");
  } else if (pack && pack.featuredWorldId !== guide.starterWorldId) {
    add("guide-world-not-featured", "starterWorldId", "The guided Starter World is no longer the referenced pack's flagship world.");
  }
  if (!comparison) {
    add("unknown-guide-comparison", "preparedComparisonId", `Unknown prepared comparison "${guide.preparedComparisonId}".`);
    return issues;
  }
  if (comparison.starterWorldId !== guide.starterWorldId) {
    add("guide-comparison-world-mismatch", "preparedComparisonId", "The prepared comparison belongs to another Starter World.");
  }

  const baseline = getStarterWorldLaunchRecipeById(comparison.baselineRecipeId);
  const contrast = getStarterWorldLaunchRecipeById(comparison.contrastRecipeId);
  if (!baseline || baseline.comparisonRole !== "baseline") {
    add("missing-guide-baseline", "preparedComparisonId", "The prepared comparison has no valid baseline recipe.");
  }
  if (!contrast || contrast.comparisonRole !== "contrast") {
    add("missing-guide-contrast", "preparedComparisonId", "The prepared comparison has no valid contrast recipe.");
  }
  if (!baseline || !contrast || !world?.runtime) {
    return issues;
  }
  if (baseline.starterWorldId !== world.id || contrast.starterWorldId !== world.id) {
    add("guide-recipe-world-mismatch", "preparedComparisonId", "Both prepared recipes must belong to the guided Starter World.");
  }
  if (baseline.templateId !== world.runtime.templateId || contrast.templateId !== world.runtime.templateId) {
    add("guide-template-mismatch", "preparedComparisonId", "Prepared recipes must use the Starter World's authoritative template.");
  }
  const template = getProductionTemplate(world.runtime.templateId);
  if (!template) {
    add("missing-guide-template", "starterWorldId", "The guided runtime template is unavailable.");
    return issues;
  }

  try {
    if (!pack) {
      return issues;
    }
    deriveRequiredGuidedInvestigationFacts({
      guide,
      pack,
      world,
      comparison,
      baselineRecipe: baseline,
      contrastRecipe: contrast
    });
  } catch (error) {
    add(
      "stale-guide-authority",
      "preparedComparisonId",
      error instanceof Error ? error.message : "The prepared recipe runtime is invalid."
    );
  }

  const metricIds = new Set((template.metricDefinitions ?? []).map((metric) => metric.key));
  const worldOutputIds = new Set(world.whatToWatch.flatMap((output) => output.metricId ? [output.metricId] : []));
  for (const [index, outputId] of guide.focusOutputIds.entries()) {
    if (!comparison.outputsToCompare.includes(outputId)) {
      add("guide-output-outside-comparison", `focusOutputIds[${index}]`, `Output "${outputId}" is not in the prepared comparison.`);
    }
    if (!baseline.outputsToWatch.includes(outputId) || !contrast.outputsToWatch.includes(outputId)) {
      add("guide-output-outside-recipes", `focusOutputIds[${index}]`, `Output "${outputId}" is not available in both recipes.`);
    }
    if (!metricIds.has(outputId) || !worldOutputIds.has(outputId)) {
      add("unsupported-guide-output", `focusOutputIds[${index}]`, `Output "${outputId}" is not an authoritative guided-world output.`);
    }
  }
  return issues;
}

function structureIssues(guide: GuidedInvestigationDefinition): GuidedInvestigationValidationIssue[] {
  const issues: GuidedInvestigationValidationIssue[] = [];
  const add = (code: string, path: string, message: string) => issues.push({ code, path, message });
  if (new Set(guide.focusOutputIds).size !== guide.focusOutputIds.length) {
    add("duplicate-guide-output", "focusOutputIds", "Guide output references must be unique.");
  }
  if (new Set(guide.nextActions).size !== guide.nextActions.length) {
    add("duplicate-next-action", "nextActions", "Guide next actions must be unique.");
  }

  const phaseIds = new Set<string>();
  const stepIds = new Set<string>();
  const roles = new Set<string>();
  if (guide.phases[0]?.recipeRole !== "baseline" || guide.phases[1]?.recipeRole !== "contrast") {
    add("invalid-phase-order", "phases", "Prepared-pair reading requires baseline first and contrast second.");
  }
  for (const [phaseIndex, phase] of guide.phases.entries()) {
    if (phaseIds.has(phase.id)) {
      add("duplicate-phase-id", `phases[${phaseIndex}].id`, `Phase ID "${phase.id}" is duplicated.`);
    }
    phaseIds.add(phase.id);
    if (roles.has(phase.recipeRole)) {
      add("duplicate-phase-role", `phases[${phaseIndex}].recipeRole`, `Recipe role "${phase.recipeRole}" is duplicated.`);
    }
    roles.add(phase.recipeRole);
    if (phase.steps.length !== 4) {
      add("invalid-phase-step-count", `phases[${phaseIndex}].steps`, "Prepared-pair reading requires exactly four steps per phase.");
    }
    for (const [stepIndex, step] of phase.steps.entries()) {
      if (stepIds.has(step.id)) {
        add("duplicate-step-id", `phases[${phaseIndex}].steps[${stepIndex}].id`, `Step ID "${step.id}" is duplicated.`);
      }
      stepIds.add(step.id);
      if (new Set(step.technicalChecks).size !== step.technicalChecks.length) {
        add("duplicate-technical-check", `phases[${phaseIndex}].steps[${stepIndex}].technicalChecks`, "Technical checks must be unique within a step.");
      }
      const actionKeys = step.actions.map((action) => action.type === "open-task" ? `${action.type}:${action.task}` : action.type);
      if (new Set(actionKeys).size !== actionKeys.length) {
        add("duplicate-step-action", `phases[${phaseIndex}].steps[${stepIndex}].actions`, "Actions must be unique within a step.");
      }
    }
  }
  if (!roles.has("baseline") || !roles.has("contrast")) {
    add("missing-prepared-pair-phase", "phases", "Prepared-pair reading requires one baseline and one contrast phase.");
  }
  return issues;
}

function contentIssues(guide: GuidedInvestigationDefinition): GuidedInvestigationValidationIssue[] {
  const values = [
    guide.title,
    guide.shortTitle,
    guide.hookQuestion,
    guide.summary,
    ...guide.opening,
    guide.modelBoundary,
    ...guide.reflectionPrompts,
    ...guide.phases.flatMap((phase) => [
      phase.title,
      ...phase.steps.flatMap((step) => [step.title, step.summary, ...(step.prompts ?? [])])
    ])
  ];
  const text = values.join("\n");
  const issues: GuidedInvestigationValidationIssue[] = [];
  if (prohibitedClaims.some((pattern) => pattern.test(text))) {
    issues.push({ code: "unsupported-guide-claim", path: "content", message: "Guide copy contains a prohibited scientific or learning claim." });
  }
  if (prohibitedOperationalLanguage.some((pattern) => pattern.test(text))) {
    issues.push({ code: "unsupported-guide-operation", path: "content", message: "Guide copy contains persistence, automatic execution, or runtime-configuration language." });
  }
  const numericContent = values.find((value) => authoredNumericResult.test(value));
  if (numericContent) {
    issues.push({ code: "authored-numeric-result", path: "content", message: "Guide copy must not author numeric recipe values or expected results." });
  }
  return issues;
}

function rejectExecutableValues(value: unknown, path = "$", seen = new WeakSet<object>()): void {
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    throw new GuidedInvestigationValidationError([
      { code: "non-data-guide-value", path, message: "Guided investigations accept data values only." }
    ]);
  }
  if (value === null || typeof value !== "object" || seen.has(value)) {
    return;
  }
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((child, index) => rejectExecutableValues(child, `${path}[${index}]`, seen));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    rejectExecutableValues(child, `${path}.${key}`, seen);
  }
}

function collectUnique(
  values: Map<string, number>,
  value: string,
  index: number,
  path: string,
  code: string,
  label: string,
  issues: GuidedInvestigationValidationIssue[]
): void {
  const previous = values.get(value);
  if (previous !== undefined) {
    issues.push({ code, path, message: `${label} "${value}" duplicates entry ${previous}.` });
  } else {
    values.set(value, index);
  }
}

function zodIssues(error: z.ZodError): GuidedInvestigationValidationIssue[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    path: issue.path.length > 0 ? issue.path.join(".") : "$",
    message: issue.message
  }));
}

function throwIfIssues(issues: GuidedInvestigationValidationIssue[]): void {
  if (issues.length > 0) {
    throw new GuidedInvestigationValidationError(issues);
  }
}
