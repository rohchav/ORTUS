import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { assertSerializableValue, jsonValueSchema, validateParameterValue } from "../kernel/Validation";
import type { JsonValue, ParameterDefinition, SimulationRunConfig, SimulationTemplate } from "../kernel/types";
import { validateRunConfig } from "../runs/runConfig";
import { findInitializationPreset } from "../scenarios/scenarioPresets";
import {
  agentCompositionDefinitionsForTemplate,
  behaviorModesForTemplate,
  environmentOptionDefinitionsForTemplate
} from "../scenarios/scenarioVariantTypes";
import { getProductionTemplate } from "../templates/registry";
import {
  maxUncertaintyConfigJsonLength,
  maxUncertaintyOutputMetrics,
  maxUncertaintySampleCount,
  maxUncertaintySeedLength,
  maxUncertaintyTotalRuns,
  maxUncertaintyVariableCount,
  uncertaintyConfigArtifactType,
  type UncertaintyConfig,
  type UncertaintyDistribution,
  type UncertaintyTargetType,
  type UncertaintyValidationResult,
  type UncertaintyVariable
} from "./types";

const distributionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("fixed"), value: jsonValueSchema }),
  z.object({ type: z.literal("uniform"), min: z.number().finite(), max: z.number().finite() }),
  z.object({ type: z.literal("integerRange"), min: z.number().int(), max: z.number().int() }),
  z.object({ type: z.literal("categorical"), options: z.array(jsonValueSchema).min(1) }),
  z.object({ type: z.literal("seedEnsemble"), seeds: z.array(z.string().min(1).max(maxUncertaintySeedLength)).min(1) })
]);

const uncertaintyVariableSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
    target: z.enum(["parameter", "seed", "agentComposition", "environmentOptions", "initializationOptions", "behaviorMode"]),
    targetPath: z.string().min(1),
    distribution: distributionSchema,
    defaultValue: jsonValueSchema.optional(),
    enabled: z.boolean(),
    notes: z.string().optional()
  })
  .strict();

const uncertaintyConfigSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(uncertaintyConfigArtifactType),
    id: z.string().min(1).optional(),
    label: z.string().optional(),
    description: z.string().optional(),
    baseSeed: z.string().min(1).max(maxUncertaintySeedLength),
    samplingMethod: z.literal("randomMonteCarlo"),
    sampleCount: z.number().int().min(1).max(maxUncertaintySampleCount),
    runsPerSample: z.number().int().min(1).optional(),
    includeSeedEnsemble: z.boolean().optional(),
    variables: z.array(uncertaintyVariableSchema).min(1).max(maxUncertaintyVariableCount),
    outputMetrics: z.array(z.string().min(1)).max(maxUncertaintyOutputMetrics),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenUncertaintyKeys = new Set([
  "snapshot",
  "world",
  "metricsHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "finalMetrics",
  "engine",
  "template",
  "snapshots",
  "runState"
]);

export function validateUncertaintyConfig(value: unknown, baseRunConfig: SimulationRunConfig): UncertaintyValidationResult {
  const parsed = uncertaintyConfigSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid uncertainty config: ${formatZodIssue(parsed.error)}`);
  }
  const config = parsed.data as UncertaintyConfig;
  assertUncertaintyPayloadBounds(config);
  assertNoLiveState(config);

  const base = validateRunConfig(baseRunConfig);
  const template = getProductionTemplate(base.templateId);
  if (!template) {
    throw new SimulationValidationError(`Unknown uncertainty template: ${base.templateId}`);
  }
  const totalRuns = config.sampleCount * (config.runsPerSample ?? 1);
  if (totalRuns > maxUncertaintyTotalRuns) {
    throw new SimulationValidationError(`Uncertainty ensemble must produce ${maxUncertaintyTotalRuns} runs or fewer`);
  }

  const variableIds = new Set<string>();
  for (const variable of config.variables) {
    if (variableIds.has(variable.id)) {
      throw new SimulationValidationError(`Duplicate uncertainty variable id: ${variable.id}`);
    }
    variableIds.add(variable.id);
    validateUncertaintyVariable(variable, template, base);
  }

  const metricKeys = new Set((template.metricDefinitions ?? []).map((definition) => definition.key));
  for (const metric of config.outputMetrics) {
    if (!metricKeys.has(metric)) {
      throw new SimulationValidationError(`Unknown output metric: ${metric}`);
    }
  }

  return {
    config: {
      ...config,
      metadata: config.metadata ?? {}
    },
    warnings: []
  };
}

export function parseUncertaintyConfigJson(json: string, baseRunConfig: SimulationRunConfig): UncertaintyValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid uncertainty config JSON", { cause: error });
  }
  return validateUncertaintyConfig(raw, baseRunConfig);
}

export function validateSampledRunConfig(config: SimulationRunConfig): SimulationRunConfig {
  return validateRunConfig(config);
}

function validateUncertaintyVariable(
  variable: UncertaintyVariable,
  template: SimulationTemplate,
  baseRunConfig: SimulationRunConfig
): void {
  const target = resolveTarget(variable, template, baseRunConfig);
  validateDistributionForTarget(variable.distribution, target, variable);
  if (variable.defaultValue !== undefined) {
    validateTargetValue(target, variable.defaultValue, variable);
  }
}

interface ResolvedTarget {
  kind: UncertaintyTargetType;
  field: string;
  definition?: ParameterDefinition;
  allowedValues?: readonly JsonValue[];
}

function resolveTarget(
  variable: UncertaintyVariable,
  template: SimulationTemplate,
  baseRunConfig: SimulationRunConfig
): ResolvedTarget {
  if (variable.target === "seed") {
    if (variable.targetPath !== "seed") {
      throw new SimulationValidationError(`Seed uncertainty targetPath must be "seed"`);
    }
    return { kind: "seed", field: "seed" };
  }

  if (variable.target === "behaviorMode") {
    if (variable.targetPath !== "behaviorMode") {
      throw new SimulationValidationError(`Behavior mode uncertainty targetPath must be "behaviorMode"`);
    }
    return {
      kind: "behaviorMode",
      field: "behaviorMode",
      allowedValues: behaviorModesForTemplate(template).map((mode) => mode.id)
    };
  }

  const prefix = targetPathPrefix(variable.target);
  if (!variable.targetPath.startsWith(prefix)) {
    throw new SimulationValidationError(`Uncertainty targetPath ${variable.targetPath} must start with ${prefix}`);
  }
  const field = variable.targetPath.slice(prefix.length);
  const definition = findTargetDefinition(variable.target, field, template, baseRunConfig);
  if (!definition) {
    throw new SimulationValidationError(`Unknown uncertainty targetPath: ${variable.targetPath}`);
  }
  return { kind: variable.target, field, definition };
}

function targetPathPrefix(target: Exclude<UncertaintyTargetType, "seed" | "behaviorMode">): string {
  return target === "parameter" ? "parameters." : `${target}.`;
}

function findTargetDefinition(
  target: Exclude<UncertaintyTargetType, "seed" | "behaviorMode">,
  field: string,
  template: SimulationTemplate,
  baseRunConfig: SimulationRunConfig
): ParameterDefinition | undefined {
  if (target === "parameter") {
    return template.parameterDefinitions.find((definition) => definition.key === field);
  }
  if (target === "agentComposition") {
    return agentCompositionDefinitionsForTemplate(template).find((definition) => definition.key === field);
  }
  if (target === "environmentOptions") {
    return environmentOptionDefinitionsForTemplate(template).find((definition) => definition.key === field);
  }
  const preset = baseRunConfig.initializationPreset ? findInitializationPreset(template, baseRunConfig.initializationPreset) : undefined;
  return preset?.optionDefinitions?.find((definition) => definition.key === field);
}

function validateDistributionForTarget(
  distribution: UncertaintyDistribution,
  target: ResolvedTarget,
  variable: UncertaintyVariable
): void {
  if (distribution.type === "fixed") {
    validateTargetValue(target, distribution.value, variable);
    return;
  }
  if (distribution.type === "seedEnsemble") {
    if (target.kind !== "seed") {
      throw new SimulationValidationError(`seedEnsemble distribution can only target seed`);
    }
    return;
  }
  if (target.kind === "seed") {
    if (distribution.type === "categorical") {
      for (const value of distribution.options) {
        validateTargetValue(target, value, variable);
      }
      return;
    }
    throw new SimulationValidationError(`Seed target ${variable.id} only supports fixed, categorical, or seedEnsemble distributions`);
  }
  if (target.kind === "behaviorMode") {
    if (distribution.type !== "categorical") {
      throw new SimulationValidationError(`Behavior mode target ${variable.id} only supports categorical distributions`);
    }
    for (const value of distribution.options) {
      validateTargetValue(target, value, variable);
    }
    return;
  }

  const definition = target.definition;
  if (!definition) {
    throw new SimulationValidationError(`Missing target definition for ${variable.targetPath}`);
  }
  if (distribution.type === "uniform") {
    if (definition.type !== "number") {
      throw new SimulationValidationError(`Uniform distribution requires a number target: ${variable.targetPath}`);
    }
    if (distribution.min >= distribution.max) {
      throw new SimulationValidationError(`Uniform distribution ${variable.id} requires min < max`);
    }
    validateParameterValue(definition, distribution.min);
    validateParameterValue(definition, distribution.max);
    return;
  }
  if (distribution.type === "integerRange") {
    if (definition.type !== "integer") {
      throw new SimulationValidationError(`integerRange distribution requires an integer target: ${variable.targetPath}`);
    }
    if (distribution.min > distribution.max) {
      throw new SimulationValidationError(`integerRange distribution ${variable.id} requires min <= max`);
    }
    validateParameterValue(definition, distribution.min);
    validateParameterValue(definition, distribution.max);
    return;
  }
  for (const value of distribution.options) {
    validateTargetValue(target, value, variable);
  }
}

function validateTargetValue(target: ResolvedTarget, value: unknown, variable: UncertaintyVariable): void {
  assertSerializableValue(value, `uncertainty variable ${variable.id}`);
  if (target.kind === "seed") {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new SimulationValidationError(`Seed uncertainty variable ${variable.id} must sample non-empty strings`);
    }
    return;
  }
  if (target.kind === "behaviorMode") {
    if (typeof value !== "string" || !(target.allowedValues ?? []).includes(value)) {
      throw new SimulationValidationError(`Unsupported behavior mode option for uncertainty variable ${variable.id}: ${String(value)}`);
    }
    return;
  }
  if (!target.definition) {
    throw new SimulationValidationError(`Missing target definition for uncertainty variable ${variable.id}`);
  }
  validateParameterValue(target.definition, value);
}

function assertUncertaintyPayloadBounds(config: UncertaintyConfig): void {
  const length = JSON.stringify(config).length;
  if (length > maxUncertaintyConfigJsonLength) {
    throw new SimulationValidationError(`Uncertainty config JSON must be ${maxUncertaintyConfigJsonLength} characters or less`);
  }
}

function assertNoLiveState(value: unknown): void {
  const stack: unknown[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") {
      continue;
    }
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }
    for (const [key, child] of Object.entries(current)) {
      if (forbiddenUncertaintyKeys.has(key)) {
        throw new SimulationValidationError(`Uncertainty config must not embed live run state (${key})`);
      }
      stack.push(child);
    }
  }
}

export function serializeUncertaintyConfig(config: UncertaintyConfig, baseRunConfig: SimulationRunConfig): string {
  return JSON.stringify(validateUncertaintyConfig(config, baseRunConfig).config, null, 2);
}

export function deserializeUncertaintyConfig(json: string, baseRunConfig: SimulationRunConfig): UncertaintyConfig {
  return parseUncertaintyConfigJson(json, baseRunConfig).config;
}

export function defaultOutputMetricsForTemplate(template: SimulationTemplate): string[] {
  return (template.metricDefinitions ?? [])
    .filter((definition) => definition.valueType === "number" || definition.valueType === "integer")
    .map((definition) => definition.key);
}

export function normalizeOutputMetrics(config: UncertaintyConfig, template: SimulationTemplate): string[] {
  return config.outputMetrics.length > 0 ? [...config.outputMetrics] : defaultOutputMetricsForTemplate(template);
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
