import { z } from "zod";
import {
  defaultInitializationPresetForTemplate,
  getInterventionDefinition,
  getProductionTemplate,
  initializationPresetsForTemplate,
  type ParameterDefinition
} from "../../simulation";
import {
  starterWorldDefinitionListSchema,
  starterWorldDefinitionSchema,
  type StarterWorldDefinition
} from "./types";

export interface StarterWorldValidationIssue {
  code: string;
  message: string;
  path: string;
}

export class StarterWorldValidationError extends Error {
  readonly issues: readonly StarterWorldValidationIssue[];

  constructor(issues: readonly StarterWorldValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
    this.name = "StarterWorldValidationError";
    this.issues = issues;
  }
}

const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);
const genericSummaryPatterns = [
  /^explore (a|the) complex system\.?$/i,
  /^change a parameter and see what happens\.?$/i,
  /^run the model and observe the results\.?$/i
];
const prohibitedResearchClaims = [
  /\bscientifically proven\b/i,
  /\bvalidated by research\b/i,
  /\brealistic model of\b/i,
  /\bthis (?:world|model|starter) (?:proves|predicts|validates|accurately reproduces)\b/i,
  /\bdiscovers? the real cause\b/i
];
const unsupportedRuntimeClaims = [
  /\bexecutes? (?:a )?(?:model )?schema\b/i,
  /\bruns? arbitrary (?:code|formulas?|scripts?)\b/i,
  /\bgenerates? a runnable template\b/i,
  /\bforecasts? real-world\b/i
];

export function parseStarterWorldDefinition(input: unknown): StarterWorldDefinition {
  assertSafeStarterWorldValue(input);
  const result = starterWorldDefinitionSchema.safeParse(input);
  if (!result.success) {
    throw new StarterWorldValidationError(zodIssues(result.error));
  }
  const issues = [
    ...validateRuntimeReferences(result.data),
    ...evaluateStarterWorldQuality(result.data)
  ];
  if (issues.length > 0) {
    throw new StarterWorldValidationError(issues);
  }
  return result.data;
}

export function validateStarterWorldDefinitions(input: unknown): readonly StarterWorldDefinition[] {
  assertSafeStarterWorldValue(input);
  const parsed = starterWorldDefinitionListSchema.safeParse(input);
  if (!parsed.success) {
    throw new StarterWorldValidationError(zodIssues(parsed.error));
  }

  const issues: StarterWorldValidationIssue[] = [];
  const ids = new Map<string, number>();
  const slugs = new Map<string, number>();
  const sourceIds = new Map<string, string>();
  const hooks = new Map<string, string>();
  const limitations = new Map<string, string>();
  let featuredRunnableCount = 0;

  for (const [index, definition] of parsed.data.entries()) {
    const path = `[${index}]`;
    collectUniqueIssue(ids, definition.id, index, `${path}.id`, "duplicate-id", "Starter World ID", issues);
    collectUniqueIssue(slugs, definition.slug, index, `${path}.slug`, "duplicate-slug", "Starter World slug", issues);

    const normalizedHook = normalizeText(definition.hookQuestion);
    const previousHook = hooks.get(normalizedHook);
    if (previousHook) {
      issues.push({
        code: "duplicate-hook",
        path: `${path}.hookQuestion`,
        message: `Hook duplicates Starter World "${previousHook}".`
      });
    } else {
      hooks.set(normalizedHook, definition.id);
    }

    const normalizedLimitation = normalizeText(definition.mainLimitation);
    const previousLimitation = limitations.get(normalizedLimitation);
    if (previousLimitation) {
      issues.push({
        code: "repeated-limitation",
        path: `${path}.mainLimitation`,
        message: `Main limitation repeats Starter World "${previousLimitation}".`
      });
    } else {
      limitations.set(normalizedLimitation, definition.id);
    }

    for (const source of definition.sources) {
      const previousSource = sourceIds.get(source.sourceId);
      if (previousSource) {
        issues.push({
          code: "duplicate-source-id",
          path: `${path}.sources`,
          message: `Source ID "${source.sourceId}" is already used by Starter World "${previousSource}".`
        });
      } else {
        sourceIds.set(source.sourceId, definition.id);
      }
    }

    if (definition.featured && definition.runtimeStatus === "runnable") {
      featuredRunnableCount += 1;
    }

    issues.push(
      ...validateRuntimeReferences(definition).map((issue) => ({ ...issue, path: `${path}.${issue.path}` })),
      ...evaluateStarterWorldQuality(definition).map((issue) => ({ ...issue, path: `${path}.${issue.path}` }))
    );
  }

  if (featuredRunnableCount !== 1) {
    issues.push({
      code: "featured-count",
      path: "featured",
      message: `Exactly one runnable Starter World must be featured; found ${featuredRunnableCount}.`
    });
  }

  if (issues.length > 0) {
    throw new StarterWorldValidationError(issues);
  }

  return [...parsed.data].sort((left, right) => left.catalogOrder - right.catalogOrder || left.id.localeCompare(right.id));
}

export function evaluateStarterWorldQuality(definition: StarterWorldDefinition): StarterWorldValidationIssue[] {
  const issues: StarterWorldValidationIssue[] = [];
  const add = (code: string, path: string, message: string) => issues.push({ code, path, message });

  if (genericSummaryPatterns.some((pattern) => pattern.test(definition.summary.trim()))) {
    add("generic-summary", "summary", "Summary is generic rather than model-specific.");
  }
  if (definition.summary.trim().split(/\s+/).length < 12) {
    add("thin-summary", "summary", "Summary needs enough model-specific detail to orient an investigation.");
  }

  const userFacingText = [
    definition.title,
    definition.shortTitle,
    definition.hookQuestion,
    definition.oneSentencePremise,
    definition.summary,
    definition.interactionPattern,
    definition.systemDynamics,
    definition.firstRun.action,
    definition.firstRun.demonstrates,
    definition.firstChange.action,
    definition.firstChange.differenceToLookFor,
    definition.mainLimitation,
    ...definition.investigationPrompts,
    ...definition.whatToWatch.flatMap((item) => [item.label, item.description]),
    ...definition.remixIdeas.flatMap((item) => [item.title, item.description]),
    ...definition.futureExpansion.flatMap((item) => [item.title, item.description])
  ].join("\n");

  for (const pattern of prohibitedResearchClaims) {
    if (pattern.test(userFacingText)) {
      add("unsupported-research-claim", "content", `Unsupported research-validity language matched ${pattern}.`);
    }
  }
  for (const pattern of unsupportedRuntimeClaims) {
    if (pattern.test(userFacingText)) {
      add("unsupported-runtime-claim", "content", `Unsupported runtime language matched ${pattern}.`);
    }
  }
  if (
    /\bbiological brain simulation\b/i.test(userFacingText) &&
    !/\bnot a biological brain simulation\b/i.test(userFacingText)
  ) {
    add("unsupported-runtime-claim", "content", "Biological brain-simulation language must remain explicitly negated.");
  }

  const headingText = [definition.title, definition.shortTitle, definition.hookQuestion].join(" ");
  for (const rawId of [
    "epidemic-spread",
    "opinion-dynamics",
    "predator-prey",
    "schelling-segregation",
    "flocking-boids",
    "forest-fire",
    "neural-excitation-network"
  ]) {
    if (headingText.includes(rawId)) {
      add("raw-runtime-id", "title", `User-facing heading exposes runtime ID "${rawId}".`);
    }
  }

  if (new Set(definition.investigationPrompts.map(normalizeText)).size !== definition.investigationPrompts.length) {
    add("duplicate-investigation", "investigationPrompts", "Investigation prompts must be distinct.");
  }
  if (new Set(definition.catalogIndicators.map(normalizeText)).size !== definition.catalogIndicators.length) {
    add("duplicate-indicator", "catalogIndicators", "Catalog indicators must be distinct.");
  }
  if (new Set(definition.sources.map((source) => source.sourceId)).size !== definition.sources.length) {
    add("duplicate-source-id", "sources", "Source IDs must be distinct within a Starter World.");
  }
  if (new Set(definition.remixIdeas.map((idea) => normalizeText(idea.title))).size !== definition.remixIdeas.length) {
    add("duplicate-remix", "remixIdeas", "Remix directions must be distinct.");
  }
  if (/change (?:a|the) parameter and see what happens/i.test(definition.firstChange.action)) {
    add("generic-first-change", "firstChange.action", "First change must name a supported control and observable difference.");
  }
  if (definition.mainLimitation.split(/\s+/).length > 65) {
    add("excessive-limitation", "mainLimitation", "The main limitation should stay compact; full boundaries belong in template notes.");
  }
  if (definition.runtimeStatus === "runnable" && definition.sources.length === 0) {
    add("missing-context", "sources", "Runnable Starter Worlds need a research or conceptual context.");
  }
  if (definition.primaryMechanisms.length === 0) {
    add("missing-mechanism", "primaryMechanisms", "At least one primary mechanism is required.");
  }
  if (definition.whatToWatch.length === 0) {
    add("missing-observable", "whatToWatch", "At least one observable target is required.");
  }
  if (definition.investigationPrompts.length < 2) {
    add("missing-investigations", "investigationPrompts", "At least two investigation prompts are required.");
  }
  if (definition.remixIdeas.length === 0 || definition.futureExpansion.length === 0) {
    add("missing-expansion-path", "remixIdeas", "At least one current remix and one future expansion are required.");
  }
  for (const [index, idea] of definition.remixIdeas.entries()) {
    if (idea.status === "future-capability" && /\b(?:available|works|supported) now\b/i.test(idea.description)) {
      add("future-presented-as-current", `remixIdeas[${index}]`, "Future capability language conflicts with its future-only status.");
    }
  }

  return issues;
}

export function validateRuntimeReferences(definition: StarterWorldDefinition): StarterWorldValidationIssue[] {
  if (definition.runtimeStatus !== "runnable" || !definition.runtime) {
    return [];
  }

  const issues: StarterWorldValidationIssue[] = [];
  const runtime = definition.runtime;
  const template = getProductionTemplate(runtime.templateId);
  const add = (code: string, path: string, message: string) => issues.push({ code, path, message });

  if (!template) {
    add("unknown-template", "runtime.templateId", `Unknown production template "${runtime.templateId}".`);
    return issues;
  }

  const presets = initializationPresetsForTemplate(template);
  const presetIds = new Set(presets.map((preset) => preset.id));
  const defaultPreset = defaultInitializationPresetForTemplate(template);
  if (!presetIds.has(runtime.defaultScenarioId)) {
    add("unknown-default-scenario", "runtime.defaultScenarioId", `Unknown initialization scenario "${runtime.defaultScenarioId}".`);
  }
  if (runtime.defaultScenarioId !== defaultPreset.id) {
    add(
      "non-default-scenario",
      "runtime.defaultScenarioId",
      `C1 launches must use the template's authoritative default initialization scenario "${defaultPreset.id}".`
    );
  }
  if (!runtime.supportedScenarioIds.includes(runtime.defaultScenarioId)) {
    add("default-scenario-not-supported", "runtime.supportedScenarioIds", "The default scenario must appear in supportedScenarioIds.");
  }
  if (new Set(runtime.supportedScenarioIds).size !== runtime.supportedScenarioIds.length) {
    add("duplicate-scenario", "runtime.supportedScenarioIds", "Supported scenario IDs must be unique.");
  }
  for (const scenarioId of runtime.supportedScenarioIds) {
    if (!presetIds.has(scenarioId)) {
      add("unknown-scenario", "runtime.supportedScenarioIds", `Unknown initialization scenario "${scenarioId}" for template "${template.id}".`);
    }
  }

  const metricIds = new Set((template.metricDefinitions ?? []).map((metric) => metric.key));
  if (!metricIds.has(runtime.recommendedMetricId)) {
    add("unknown-metric", "runtime.recommendedMetricId", `Unknown metric "${runtime.recommendedMetricId}" for template "${template.id}".`);
  }
  for (const [index, observation] of definition.whatToWatch.entries()) {
    if (observation.metricId && !metricIds.has(observation.metricId)) {
      add("unknown-observation-metric", `whatToWatch[${index}].metricId`, `Unknown metric "${observation.metricId}".`);
    }
  }
  if (!definition.whatToWatch.some((observation) => observation.metricId === runtime.recommendedMetricId)) {
    add("recommended-metric-not-observed", "whatToWatch", "The recommended metric must appear in whatToWatch.");
  }

  const parameter = template.parameterDefinitions.find((candidate) => candidate.key === runtime.recommendedParameterId);
  if (!parameter) {
    add(
      "unknown-parameter",
      "runtime.recommendedParameterId",
      `Unknown parameter "${runtime.recommendedParameterId}" for template "${template.id}".`
    );
  }

  if (definition.firstRun.recommendedTask !== runtime.recommendedTask) {
    add("task-mismatch", "firstRun.recommendedTask", "First-run task must match the runtime launch recommendation.");
  }

  if (definition.firstChange.targetType === "parameter") {
    const changeParameter = template.parameterDefinitions.find((candidate) => candidate.key === definition.firstChange.targetId);
    if (!changeParameter) {
      add("unknown-change-parameter", "firstChange.targetId", `Unknown parameter "${definition.firstChange.targetId}".`);
    } else {
      if (definition.firstChange.targetId !== runtime.recommendedParameterId) {
        add("recommended-parameter-mismatch", "firstChange.targetId", "First change must use the recommended runtime parameter.");
      }
      if (definition.firstChange.targetLabel !== changeParameter.label) {
        add("parameter-label-mismatch", "firstChange.targetLabel", `Expected authoritative label "${changeParameter.label}".`);
      }
      if (definition.firstChange.suggestedValue !== undefined && !parameterAcceptsValue(changeParameter, definition.firstChange.suggestedValue)) {
        add("invalid-parameter-value", "firstChange.suggestedValue", "Suggested value is outside the authoritative parameter contract.");
      }
    }
  } else {
    const intervention = getInterventionDefinition(template.id, definition.firstChange.targetId);
    if (!intervention) {
      add("unknown-intervention", "firstChange.targetId", `Unknown intervention "${definition.firstChange.targetId}".`);
    } else if (definition.firstChange.targetLabel !== intervention.label) {
      add("intervention-label-mismatch", "firstChange.targetLabel", `Expected authoritative label "${intervention.label}".`);
    }
  }

  return issues;
}

export function assertSafeStarterWorldValue(value: unknown, path = "$", seen = new WeakSet<object>()): void {
  if (value === null || typeof value !== "object") {
    return;
  }
  if (seen.has(value)) {
    throw new StarterWorldValidationError([{ code: "circular-value", path, message: "Circular content values are not allowed." }]);
  }
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeStarterWorldValue(item, `${path}[${index}]`, seen));
    return;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new StarterWorldValidationError([{ code: "non-plain-object", path, message: "Only plain data objects are allowed." }]);
  }
  for (const [key, child] of Object.entries(value)) {
    if (unsafeKeys.has(key)) {
      throw new StarterWorldValidationError([{ code: "unsafe-key", path: `${path}.${key}`, message: `Unsafe object key "${key}" is not allowed.` }]);
    }
    assertSafeStarterWorldValue(child, `${path}.${key}`, seen);
  }
}

function collectUniqueIssue(
  values: Map<string, number>,
  value: string,
  index: number,
  path: string,
  code: string,
  label: string,
  issues: StarterWorldValidationIssue[]
): void {
  const previous = values.get(value);
  if (previous !== undefined) {
    issues.push({ code, path, message: `${label} "${value}" duplicates entry ${previous}.` });
  } else {
    values.set(value, index);
  }
}

function parameterAcceptsValue(definition: ParameterDefinition, value: string | number | boolean): boolean {
  if (definition.type === "boolean") {
    return typeof value === "boolean";
  }
  if (definition.type === "select") {
    return typeof value === "string" && Boolean(definition.options?.includes(value));
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return false;
  }
  if (definition.type === "integer" && !Number.isInteger(value)) {
    return false;
  }
  return (definition.min === undefined || value >= definition.min) && (definition.max === undefined || value <= definition.max);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function zodIssues(error: z.ZodError): StarterWorldValidationIssue[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    path: issue.path.length > 0 ? issue.path.join(".") : "$",
    message: issue.message
  }));
}
