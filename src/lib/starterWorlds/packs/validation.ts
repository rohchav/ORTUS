import { z } from "zod";
import {
  createDefaultScenario,
  findInitializationPreset,
  getProductionTemplate,
  patchScenarioInitializationOptions,
  patchScenarioParameters,
  updateScenarioPreset,
  type AuthoredScenario,
  type InitializationPresetDefinition,
  type JsonValue,
  type ParameterDefinition,
  type SimulationTemplate
} from "../../../simulation";
import { getStarterWorldById, starterWorlds } from "../registry";
import { assertSafeStarterWorldValue } from "../validation";
import {
  preparedStarterComparisonDeclarationListSchema,
  preparedStarterComparisonSchema,
  starterWorldLaunchRecipeListSchema,
  starterWorldLaunchRecipeSchema,
  starterWorldPackDefinitionListSchema,
  type PreparedRecipeDifference,
  type PreparedRecipeSharedCondition,
  type PreparedStarterComparison,
  type PreparedStarterComparisonDeclaration,
  type StarterWorldLaunchRecipe,
  type StarterWorldPackDefinition
} from "./types";

const recipeTimestamp = "2026-07-31T00:00:00.000Z";
const unsupportedComparisonClaims = [
  /\bthis proves?\b/i,
  /\balways causes?\b/i,
  /\bthis validates?\b/i,
  /\bis robust\b/i,
  /\bempirical experiment\b/i,
  /\bcausal (?:proof|effect|conclusion)\b/i,
  /\bstatistical(?:ly)? significant\b/i
];
const boundedExpectedPatternOpenings = [
  /^compare whether\b/i,
  /^this configuration often produces\b/i,
  /^watch for\b/i,
  /^the runs may differ because\b/i
];

export interface StarterWorldPackValidationIssue {
  code: string;
  path: string;
  message: string;
}

export class StarterWorldPackValidationError extends Error {
  readonly issues: readonly StarterWorldPackValidationIssue[];

  constructor(issues: readonly StarterWorldPackValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
    this.name = "StarterWorldPackValidationError";
    this.issues = issues;
  }
}

export function validateStarterWorldPackDefinitions(input: unknown): readonly StarterWorldPackDefinition[] {
  assertSafeStarterWorldValue(input);
  const parsed = starterWorldPackDefinitionListSchema.safeParse(input);
  if (!parsed.success) {
    throw new StarterWorldPackValidationError(zodIssues(parsed.error));
  }

  const issues: StarterWorldPackValidationIssue[] = [];
  const ids = new Map<string, number>();
  const slugs = new Map<string, number>();

  for (const [index, pack] of parsed.data.entries()) {
    collectUnique(ids, pack.id, index, `[${index}].id`, "duplicate-pack-id", "Pack ID", issues);
    collectUnique(slugs, pack.slug, index, `[${index}].slug`, "duplicate-pack-slug", "Pack slug", issues);
    if (new Set(pack.worldIds).size !== pack.worldIds.length) {
      issues.push({
        code: "duplicate-pack-world",
        path: `[${index}].worldIds`,
        message: "Pack world references must be unique."
      });
    }
    if (new Set(pack.mechanisms).size !== pack.mechanisms.length) {
      issues.push({ code: "duplicate-mechanism", path: `[${index}].mechanisms`, message: "Pack mechanisms must be unique." });
    }
    if (new Set(pack.systemForms).size !== pack.systemForms.length) {
      issues.push({ code: "duplicate-system-form", path: `[${index}].systemForms`, message: "Pack system forms must be unique." });
    }
    for (const [worldIndex, worldId] of pack.worldIds.entries()) {
      const world = getStarterWorldById(worldId);
      if (!world) {
        issues.push({
          code: "unknown-pack-world",
          path: `[${index}].worldIds[${worldIndex}]`,
          message: `Unknown Starter World "${worldId}".`
        });
      } else if (world.runtimeStatus !== "runnable" || !world.runtime) {
        issues.push({
          code: "non-runnable-pack-world",
          path: `[${index}].worldIds[${worldIndex}]`,
          message: `Starter World "${worldId}" is not runnable.`
        });
      }
    }
    if (!pack.worldIds.includes(pack.featuredWorldId)) {
      issues.push({
        code: "featured-world-not-in-pack",
        path: `[${index}].featuredWorldId`,
        message: "The featured Starter World must belong to the pack."
      });
    }
  }

  throwIfIssues(issues);
  return [...parsed.data].sort((left, right) => left.id.localeCompare(right.id));
}

export function validateStarterWorldLaunchRecipes(input: unknown): readonly StarterWorldLaunchRecipe[] {
  assertSafeStarterWorldValue(input);
  const parsed = starterWorldLaunchRecipeListSchema.safeParse(input);
  if (!parsed.success) {
    throw new StarterWorldPackValidationError(zodIssues(parsed.error));
  }

  const issues: StarterWorldPackValidationIssue[] = [];
  const ids = new Map<string, number>();
  for (const [index, recipe] of parsed.data.entries()) {
    collectUnique(ids, recipe.id, index, `[${index}].id`, "duplicate-recipe-id", "Recipe ID", issues);
    issues.push(...validateRecipe(recipe).map((issue) => ({ ...issue, path: `[${index}].${issue.path}` })));
  }

  throwIfIssues(issues);
  const worldOrder = new Map(starterWorlds.map((world, index) => [world.id, index]));
  const roleOrder = { baseline: 0, contrast: 1 } as const;
  return [...parsed.data].sort(
    (left, right) =>
      (worldOrder.get(left.starterWorldId) ?? Number.MAX_SAFE_INTEGER) -
        (worldOrder.get(right.starterWorldId) ?? Number.MAX_SAFE_INTEGER) ||
      roleOrder[left.comparisonRole ?? "contrast"] - roleOrder[right.comparisonRole ?? "contrast"] ||
      left.id.localeCompare(right.id)
  );
}

export function validatePreparedStarterComparisons(
  input: unknown,
  recipes: readonly StarterWorldLaunchRecipe[]
): readonly PreparedStarterComparison[] {
  assertSafeStarterWorldValue(input);
  const parsed = preparedStarterComparisonDeclarationListSchema.safeParse(input);
  if (!parsed.success) {
    throw new StarterWorldPackValidationError(zodIssues(parsed.error));
  }

  const issues: StarterWorldPackValidationIssue[] = [];
  const ids = new Map<string, number>();
  const questions = new Map<string, number>();
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const comparisons: PreparedStarterComparison[] = [];

  for (const [index, declaration] of parsed.data.entries()) {
    const path = `[${index}]`;
    collectUnique(ids, declaration.id, index, `${path}.id`, "duplicate-comparison-id", "Comparison ID", issues);
    collectUnique(
      questions,
      normalizeText(declaration.question),
      index,
      `${path}.question`,
      "duplicate-comparison-question",
      "Comparison question",
      issues
    );
    const comparisonIssues = validateComparisonDeclaration(declaration, recipeMap);
    issues.push(...comparisonIssues.map((issue) => ({ ...issue, path: `${path}.${issue.path}` })));
    if (comparisonIssues.length > 0) {
      continue;
    }

    const baseline = recipeMap.get(declaration.baselineRecipeId)!;
    const contrast = recipeMap.get(declaration.contrastRecipeId)!;
    const derived = deriveRecipeConditions(baseline, contrast);
    if (derived.controlledDifferences.length === 0) {
      issues.push({
        code: "comparison-without-difference",
        path: `${path}.baselineRecipeId`,
        message: "Baseline and contrast recipes must have at least one actual runtime-configuration difference."
      });
      continue;
    }
    const specificityIssues = validateExpectedPatternSpecificity(declaration, derived.controlledDifferences);
    issues.push(...specificityIssues.map((issue) => ({ ...issue, path: `${path}.${issue.path}` })));
    if (specificityIssues.length > 0) {
      continue;
    }
    const finalResult = preparedStarterComparisonSchema.safeParse({
      ...declaration,
      controlledDifferences: derived.controlledDifferences,
      sharedConditions: derived.sharedConditions
    });
    if (!finalResult.success) {
      issues.push(...zodIssues(finalResult.error).map((issue) => ({ ...issue, path: `${path}.${issue.path}` })));
      continue;
    }
    comparisons.push(finalResult.data);
  }

  throwIfIssues(issues);
  const worldOrder = new Map(starterWorlds.map((world, index) => [world.id, index]));
  return comparisons.sort(
    (left, right) =>
      (worldOrder.get(left.starterWorldId) ?? Number.MAX_SAFE_INTEGER) -
        (worldOrder.get(right.starterWorldId) ?? Number.MAX_SAFE_INTEGER) ||
      left.id.localeCompare(right.id)
  );
}

export function buildValidatedRecipeScenario(input: unknown): AuthoredScenario {
  assertSafeStarterWorldValue(input);
  const parsed = starterWorldLaunchRecipeSchema.safeParse(input);
  if (!parsed.success) {
    throw new StarterWorldPackValidationError(zodIssues(parsed.error));
  }
  const issues = validateRecipe(parsed.data);
  throwIfIssues(issues);
  return buildRecipeScenarioUnchecked(parsed.data);
}

export function deriveRecipeConditions(
  baseline: StarterWorldLaunchRecipe,
  contrast: StarterWorldLaunchRecipe
): {
  controlledDifferences: PreparedRecipeDifference[];
  sharedConditions: PreparedRecipeSharedCondition[];
} {
  const baselineConditions = recipeConditions(baseline);
  const contrastConditions = recipeConditions(contrast);
  const fields = [...new Set([...baselineConditions.keys(), ...contrastConditions.keys()])].sort();
  const controlledDifferences: PreparedRecipeDifference[] = [];
  const sharedConditions: PreparedRecipeSharedCondition[] = [];

  for (const field of fields) {
    const baselineCondition = baselineConditions.get(field);
    const contrastCondition = contrastConditions.get(field);
    const baselineValue = baselineCondition?.value ?? null;
    const contrastValue = contrastCondition?.value ?? null;
    const label = baselineCondition?.label ?? contrastCondition?.label ?? field;
    if (baselineValue === contrastValue && baselineValue !== null) {
      sharedConditions.push({ field, label, value: baselineValue });
    } else {
      controlledDifferences.push({ field, label, baselineValue, contrastValue });
    }
  }

  return { controlledDifferences, sharedConditions };
}

function validateRecipe(recipe: StarterWorldLaunchRecipe): StarterWorldPackValidationIssue[] {
  const issues: StarterWorldPackValidationIssue[] = [];
  const add = (code: string, path: string, message: string) => issues.push({ code, path, message });
  const world = getStarterWorldById(recipe.starterWorldId);
  if (!world || world.runtimeStatus !== "runnable" || !world.runtime) {
    add("unknown-recipe-world", "starterWorldId", `Unknown runnable Starter World "${recipe.starterWorldId}".`);
    return issues;
  }
  if (world.runtime.templateId !== recipe.templateId) {
    add("recipe-template-mismatch", "templateId", "Recipe template does not match its Starter World's authoritative template.");
    return issues;
  }
  const template = getProductionTemplate(recipe.templateId);
  if (!template) {
    add("unknown-recipe-template", "templateId", `Unknown production template "${recipe.templateId}".`);
    return issues;
  }
  if (!world.runtime.supportedScenarioIds.includes(recipe.initializationPresetId)) {
    add("unsupported-recipe-preset", "initializationPresetId", "Recipe preset is not permitted by its Starter World.");
  }
  const preset = findInitializationPreset(template, recipe.initializationPresetId);
  if (!preset) {
    add("unknown-recipe-preset", "initializationPresetId", `Unknown initialization preset "${recipe.initializationPresetId}".`);
    return issues;
  }

  if (Object.keys(recipe.parameterOverrides).length > 32) {
    add("too-many-parameter-overrides", "parameterOverrides", "Recipes may override at most 32 authoritative parameters.");
  }
  const parameterDefinitions = new Map(template.parameterDefinitions.map((definition) => [definition.key, definition]));
  for (const [key, value] of Object.entries(recipe.parameterOverrides)) {
    const definition = parameterDefinitions.get(key);
    if (!definition) {
      add("unknown-recipe-parameter", `parameterOverrides.${key}`, `Unknown parameter "${key}".`);
    } else if (!parameterAcceptsValue(definition, value)) {
      add("invalid-recipe-parameter", `parameterOverrides.${key}`, `Value is outside the authoritative contract for "${key}".`);
    }
  }

  const optionDefinitions = new Map((preset.optionDefinitions ?? []).map((definition) => [definition.key, definition]));
  if (Object.keys(recipe.initializationOptions ?? {}).length > 16) {
    add("too-many-initialization-options", "initializationOptions", "Recipes may set at most 16 preset-owned options.");
  }
  for (const [key, value] of Object.entries(recipe.initializationOptions ?? {})) {
    const definition = optionDefinitions.get(key);
    if (!definition) {
      add("unknown-recipe-option", `initializationOptions.${key}`, `Unknown option "${key}" for the selected preset.`);
    } else if (!parameterAcceptsValue(definition, value)) {
      add("invalid-recipe-option", `initializationOptions.${key}`, `Value is outside the authoritative contract for option "${key}".`);
    }
  }

  const metricIds = new Set((template.metricDefinitions ?? []).map((metric) => metric.key));
  if (new Set(recipe.outputsToWatch).size !== recipe.outputsToWatch.length) {
    add("duplicate-recipe-output", "outputsToWatch", "Recipe outputs must be unique.");
  }
  for (const [index, output] of recipe.outputsToWatch.entries()) {
    if (!metricIds.has(output)) {
      add("unknown-recipe-output", `outputsToWatch[${index}]`, `Unknown template metric "${output}".`);
    }
  }

  const userFacingText = [
    recipe.title,
    recipe.shortDescription,
    recipe.purpose,
    recipe.modelBoundary,
    recipe.visualCue ?? ""
  ].join("\n");
  const exposedInternalId = [recipe.id, recipe.starterWorldId, recipe.templateId].find((id) =>
    userFacingText.toLowerCase().includes(id.toLowerCase())
  );
  if (exposedInternalId) {
    add("raw-recipe-id", "content", `Recipe copy must not expose internal ID "${exposedInternalId}".`);
  }
  if (userFacingText.toLowerCase().includes(recipe.initializationPresetId.toLowerCase())) {
    add("raw-recipe-preset-id", "title", `Recipe labels must not expose preset ID "${recipe.initializationPresetId}".`);
  }
  if (/\b(?:guarantees?|proves?|validates?|causes? in reality|empirical experiment)\b/i.test(userFacingText)) {
    add("unsupported-recipe-claim", "content", "Recipe content contains guaranteed, causal-proof, validation, or empirical-experiment language.");
  }

  if (issues.length === 0) {
    try {
      buildRecipeScenarioUnchecked(recipe);
    } catch (error) {
      add("invalid-recipe-scenario", "parameterOverrides", error instanceof Error ? error.message : "Recipe scenario validation failed.");
    }
  }
  return issues;
}

function validateComparisonDeclaration(
  declaration: PreparedStarterComparisonDeclaration,
  recipes: ReadonlyMap<string, StarterWorldLaunchRecipe>
): StarterWorldPackValidationIssue[] {
  const issues: StarterWorldPackValidationIssue[] = [];
  const add = (code: string, path: string, message: string) => issues.push({ code, path, message });
  const baseline = recipes.get(declaration.baselineRecipeId);
  const contrast = recipes.get(declaration.contrastRecipeId);
  if (!baseline) {
    add("unknown-baseline-recipe", "baselineRecipeId", `Unknown baseline recipe "${declaration.baselineRecipeId}".`);
  }
  if (!contrast) {
    add("unknown-contrast-recipe", "contrastRecipeId", `Unknown contrast recipe "${declaration.contrastRecipeId}".`);
  }
  if (!baseline || !contrast) {
    return issues;
  }
  if (baseline.id === contrast.id) {
    add("duplicate-comparison-recipe", "contrastRecipeId", "Baseline and contrast must reference different recipes.");
  }
  if (baseline.comparisonRole !== "baseline") {
    add("invalid-baseline-role", "baselineRecipeId", "The baseline recipe must declare the baseline role.");
  }
  if (contrast.comparisonRole !== "contrast") {
    add("invalid-contrast-role", "contrastRecipeId", "The contrast recipe must declare the contrast role.");
  }
  if (baseline.starterWorldId !== declaration.starterWorldId || contrast.starterWorldId !== declaration.starterWorldId) {
    add("comparison-world-mismatch", "starterWorldId", "Both recipes must belong to the comparison's Starter World.");
  }
  if (baseline.templateId !== contrast.templateId) {
    add("comparison-template-mismatch", "contrastRecipeId", "Baseline and contrast template IDs must match.");
  }
  if (new Set(declaration.outputsToCompare).size !== declaration.outputsToCompare.length) {
    add("duplicate-comparison-output", "outputsToCompare", "Comparison outputs must be unique.");
  }
  for (const [index, output] of declaration.outputsToCompare.entries()) {
    if (!baseline.outputsToWatch.includes(output) || !contrast.outputsToWatch.includes(output)) {
      add("unsupported-comparison-output", `outputsToCompare[${index}]`, `Output "${output}" must exist in both recipes.`);
    }
  }
  if (!boundedExpectedPatternOpenings.some((pattern) => pattern.test(declaration.expectedPattern))) {
    add("unbounded-expected-pattern", "expectedPattern", "Expected patterns must open with bounded comparison language.");
  }
  const allText = [
    declaration.title,
    declaration.question,
    declaration.expectedPattern,
    declaration.interpretationBoundary,
    ...declaration.suggestedProcedure
  ].join("\n");
  if (unsupportedComparisonClaims.some((pattern) => pattern.test(allText))) {
    add("unsupported-comparison-claim", "content", "Prepared comparison contains prohibited guarantee, causal, empirical, or validation language.");
  }
  if (
    /\b(?:automatically save|auto-save|create (?:a )?Lab|create (?:an )?Atlas|auto-run)\b/i.test(allText) ||
    /\b(?:publish|send|map|save)\b[^\n.]{0,80}\b(?:Lab|Atlas)\b/i.test(allText)
  ) {
    add("unavailable-comparison-function", "suggestedProcedure", "Comparison instructions must use only the existing explicit World workflow.");
  }
  if (/\bsame seed(?:ed)?\b/i.test(allText) && baseline.seed !== contrast.seed) {
    add("mismatched-shared-seed", "content", "Comparison copy claims a shared seed but the recipe seeds differ.");
  }
  return issues;
}

function validateExpectedPatternSpecificity(
  declaration: PreparedStarterComparisonDeclaration,
  differences: readonly PreparedRecipeDifference[]
): StarterWorldPackValidationIssue[] {
  const expectedTokens = referenceTokens([declaration.expectedPattern]);
  const outputTokens = referenceTokens(declaration.outputsToCompare);
  const differenceTokens = referenceTokens(
    differences.flatMap((difference) => [
      difference.label,
      typeof difference.baselineValue === "string" ? difference.baselineValue : "",
      typeof difference.contrastValue === "string" ? difference.contrastValue : ""
    ])
  );
  const namesOutput = [...outputTokens].some((token) => expectedTokens.has(token));
  const namesDifference = [...differenceTokens].some((token) => expectedTokens.has(token));
  if (namesOutput && namesDifference) {
    return [];
  }
  return [
    {
      code: "generic-expected-pattern",
      path: "expectedPattern",
      message: "Expected patterns must name at least one referenced output and one actual controlled difference."
    }
  ];
}

function buildRecipeScenarioUnchecked(recipe: StarterWorldLaunchRecipe): AuthoredScenario {
  const world = getStarterWorldById(recipe.starterWorldId);
  const template = getProductionTemplate(recipe.templateId);
  if (!world?.runtime || !template) {
    throw new Error("Recipe runtime is unavailable.");
  }
  let scenario = createDefaultScenario({
    template,
    now: recipeTimestamp,
    seed: recipe.seed,
    name: `${world.shortTitle}: ${recipe.title}`
  });
  scenario = updateScenarioPreset(scenario, recipe.initializationPresetId, recipeTimestamp);
  scenario = patchScenarioParameters(
    scenario,
    { ...scenario.parameters, ...recipe.parameterOverrides },
    recipeTimestamp
  );
  if (recipe.initializationOptions) {
    scenario = patchScenarioInitializationOptions(
      scenario,
      { ...scenario.initializationOptions, ...recipe.initializationOptions },
      recipeTimestamp
    );
  }
  return scenario;
}

function recipeConditions(
  recipe: StarterWorldLaunchRecipe
): Map<string, { label: string; value: string | number | boolean }> {
  const template = getProductionTemplate(recipe.templateId);
  if (!template) {
    throw new StarterWorldPackValidationError([
      { code: "unknown-recipe-template", path: "templateId", message: `Unknown template "${recipe.templateId}".` }
    ]);
  }
  const scenario = buildValidatedRecipeScenario(recipe);
  const preset = findInitializationPreset(template, scenario.initializationPreset);
  if (!preset) {
    throw new StarterWorldPackValidationError([
      { code: "unknown-recipe-preset", path: "initializationPresetId", message: "Recipe preset is unavailable." }
    ]);
  }
  const conditions = new Map<string, { label: string; value: string | number | boolean }>();
  conditions.set("seed", { label: "Seed", value: scenario.seed });
  conditions.set("initializationPresetId", { label: "Starting arrangement", value: preset.label });
  for (const definition of [...template.parameterDefinitions].sort((left, right) => left.key.localeCompare(right.key))) {
    const value = scenario.parameters[definition.key];
    conditions.set(`parameters.${definition.key}`, {
      label: definition.label,
      value: conditionPrimitive(value, `parameters.${definition.key}`)
    });
  }
  const optionLabels = optionLabelMap(template, preset);
  for (const [key, value] of Object.entries(scenario.initializationOptions).sort(([left], [right]) => left.localeCompare(right))) {
    conditions.set(`initializationOptions.${key}`, {
      label: optionLabels.get(key) ?? key,
      value: conditionPrimitive(value, `initializationOptions.${key}`)
    });
  }
  return conditions;
}

function optionLabelMap(
  _template: SimulationTemplate,
  preset: InitializationPresetDefinition
): Map<string, string> {
  return new Map((preset.optionDefinitions ?? []).map((definition) => [definition.key, definition.label]));
}

function conditionPrimitive(value: JsonValue | undefined, path: string): string | number | boolean {
  if (typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
    return value;
  }
  throw new StarterWorldPackValidationError([
    { code: "unsupported-condition-value", path, message: "Prepared comparisons support only bounded primitive recipe conditions." }
  ]);
}

function parameterAcceptsValue(definition: ParameterDefinition, value: JsonValue): boolean {
  if (definition.type === "boolean") {
    return typeof value === "boolean";
  }
  if (definition.type === "select") {
    return definition.options?.some((option) => option === value) ?? false;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return false;
  }
  if (definition.type === "integer" && !Number.isInteger(value)) {
    return false;
  }
  return (definition.min === undefined || value >= definition.min) && (definition.max === undefined || value <= definition.max);
}

function collectUnique(
  values: Map<string, number>,
  value: string,
  index: number,
  path: string,
  code: string,
  label: string,
  issues: StarterWorldPackValidationIssue[]
): void {
  const previous = values.get(value);
  if (previous !== undefined) {
    issues.push({ code, path, message: `${label} "${value}" duplicates entry ${previous}.` });
  } else {
    values.set(value, index);
  }
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

const genericReferenceTokens = new Set([
  "arrangement",
  "count",
  "initial",
  "initialization",
  "metric",
  "model",
  "option",
  "parameter",
  "run",
  "score",
  "seed",
  "starting",
  "state",
  "total",
  "value"
]);

function referenceTokens(values: readonly string[]): Set<string> {
  const tokens = values.flatMap((value) =>
    value
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? []
  );
  return new Set(
    tokens
      .map(stemReferenceToken)
      .filter((token) => token.length >= 3 && !genericReferenceTokens.has(token))
  );
}

function stemReferenceToken(token: string): string {
  if (token.length > 4 && token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }
  return token;
}

function zodIssues(error: z.ZodError): StarterWorldPackValidationIssue[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    path: issue.path.length > 0 ? issue.path.join(".") : "$",
    message: issue.message
  }));
}

function throwIfIssues(issues: StarterWorldPackValidationIssue[]): void {
  if (issues.length > 0) {
    throw new StarterWorldPackValidationError(issues);
  }
}
