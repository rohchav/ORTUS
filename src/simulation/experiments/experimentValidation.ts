import { z } from "zod";
import type { MetricDefinition, ParameterDefinition, ParameterValues, SimulationTemplate } from "../kernel/types";
import { SimulationValidationError } from "../kernel/Errors";
import { MetricsCollector } from "../kernel/Metrics";
import { deepClone, jsonValueSchema, resolveParameters, validateParameterValue } from "../kernel/Validation";
import { getProductionTemplate } from "../templates/registry";
import {
  defaultExperimentMaxRuns,
  hardExperimentMaxRuns,
  type ExperimentCondition,
  type ExperimentConfig,
  type ExperimentRunPlan,
  type ExperimentValidationResult,
  type ParameterSweepDimension,
  type SweepValue
} from "./experimentTypes";

const sweepValueSchema = z.union([z.string(), z.number().finite(), z.boolean()]);

const experimentConfigSchema: z.ZodType<ExperimentConfig> = z.object({
  templateId: z.string().min(1),
  baseParameters: z.record(jsonValueSchema),
  parameterSweep: z.object({
    dimensions: z
      .array(
        z.object({
          parameterKey: z.string().min(1),
          values: z.array(sweepValueSchema).optional(),
          range: z
            .object({
              min: z.number().finite(),
              max: z.number().finite(),
              steps: z.number().int().positive()
            })
            .optional()
        })
      )
      .min(1)
      .max(2)
  }),
  seedMode: z.enum(["fixed", "sequential"]),
  seeds: z.array(z.string()),
  baseSeed: z.string().optional(),
  trialsPerCondition: z.number().int().positive(),
  ticksPerRun: z.number().int().positive(),
  metricsToRecord: z.array(z.string()),
  aggregationMode: z.literal("final"),
  maxRuns: z.number().int().positive().max(hardExperimentMaxRuns),
  metadata: z.record(jsonValueSchema).optional()
}) as z.ZodType<ExperimentConfig>;

export function validateExperimentConfig(config: ExperimentConfig): ExperimentValidationResult {
  const shapeResult = experimentConfigSchema.safeParse(config);
  if (!shapeResult.success) {
    throw new SimulationValidationError(`Invalid experiment configuration: ${formatZodIssue(shapeResult.error)}`, { cause: shapeResult.error });
  }

  const template = getProductionTemplate(config.templateId);
  if (!template) {
    throw new SimulationValidationError(`Unknown experiment template: ${config.templateId}`);
  }

  const maxRuns = Math.min(config.maxRuns || defaultExperimentMaxRuns, hardExperimentMaxRuns);
  const metricDefinitions = metricDefinitionsForTemplate(template);
  const metricKeys = new Set(metricDefinitions.map((definition) => definition.key));
  for (const metricKey of config.metricsToRecord) {
    if (!metricKeys.has(metricKey)) {
      throw new SimulationValidationError(`Unknown metric for ${template.id}: ${metricKey}`);
    }
  }

  const baseParameters = validateTemplateParameters(template, config.baseParameters);
  const conditions = generateParameterConditions(template, baseParameters, config.parameterSweep.dimensions);
  if (conditions.length === 0) {
    throw new SimulationValidationError("Experiment sweep did not produce any valid parameter conditions");
  }

  const seeds = effectiveSeeds(config);
  const totalRuns = conditions.length * seeds.length;
  if (totalRuns > hardExperimentMaxRuns) {
    throw new SimulationValidationError(`Experiment would run ${totalRuns} trials, above the V1 hard limit of ${hardExperimentMaxRuns}`);
  }
  if (totalRuns > maxRuns) {
    throw new SimulationValidationError(`Experiment would run ${totalRuns} trials, above the configured maxRuns limit of ${maxRuns}`);
  }

  const runPlans = createRunPlans(conditions, seeds);
  return {
    config: { ...config, baseParameters },
    conditions,
    runPlans,
    metricDefinitions,
    totalRuns
  };
}

export function metricDefinitionsForTemplate(template: SimulationTemplate): MetricDefinition[] {
  const metrics = new MetricsCollector();
  template.registerMetrics(metrics);
  return metrics.definitionsList();
}

export function generateSweepValues(definition: ParameterDefinition, dimension: ParameterSweepDimension): SweepValue[] {
  const rawValues = dimension.values && dimension.values.length > 0 ? [...dimension.values] : valuesFromRangeOrDefinition(definition, dimension);
  const values = uniqueSweepValues(rawValues.map((value) => coerceSweepValue(definition, value)));
  if (values.length === 0) {
    throw new SimulationValidationError(`Sweep for ${definition.key} did not produce any values`);
  }
  for (const value of values) {
    validateParameterValue(definition, value);
  }
  return values;
}

export function generateParameterConditions(
  template: SimulationTemplate,
  baseParameters: ParameterValues,
  dimensions: readonly ParameterSweepDimension[]
): ExperimentCondition[] {
  const definitionByKey = new Map(template.parameterDefinitions.map((definition) => [definition.key, definition]));
  const prepared = dimensions.map((dimension) => {
    const definition = definitionByKey.get(dimension.parameterKey);
    if (!definition) {
      throw new SimulationValidationError(`Unknown sweep parameter: ${dimension.parameterKey}`);
    }
    return {
      definition,
      values: generateSweepValues(definition, dimension)
    };
  });

  const conditions: ExperimentCondition[] = [];
  if (prepared.length === 1) {
    const only = prepared[0]!;
    const { definition, values } = only;
    for (const value of values) {
      const parameterValues = validateTemplateParameters(template, { ...baseParameters, [definition.key]: value });
      conditions.push({
        key: stableConditionKey({ [definition.key]: value }),
        parameterValues,
        sweptValues: { [definition.key]: value }
      });
    }
    return conditions;
  }

  const [first, second] = prepared;
  if (!first || !second) {
    return conditions;
  }
  for (const firstValue of first.values) {
    for (const secondValue of second.values) {
      const sweptValues = {
        [first.definition.key]: firstValue,
        [second.definition.key]: secondValue
      };
      const parameterValues = validateTemplateParameters(template, { ...baseParameters, ...sweptValues });
      conditions.push({
        key: stableConditionKey(sweptValues),
        parameterValues,
        sweptValues
      });
    }
  }
  return conditions;
}

export function effectiveSeeds(config: ExperimentConfig): string[] {
  if (config.seedMode === "fixed") {
    if (config.seeds.length === 0) {
      throw new SimulationValidationError("Fixed seed mode requires at least one seed");
    }
    const seeds = config.seeds.map((seed) => seed.trim());
    if (seeds.some((seed) => seed.length === 0)) {
      throw new SimulationValidationError("Fixed seed entries cannot be empty");
    }
    return seeds;
  }
  const base = (config.baseSeed || config.seeds[0] || "experiment-seed").trim() || "experiment-seed";
  return Array.from({ length: config.trialsPerCondition }, (_, index) => `${base}-${index + 1}`);
}

export function createRunPlans(conditions: readonly ExperimentCondition[], seeds: readonly string[]): ExperimentRunPlan[] {
  const plans: ExperimentRunPlan[] = [];
  for (let conditionIndex = 0; conditionIndex < conditions.length; conditionIndex += 1) {
    const condition = conditions[conditionIndex]!;
    for (let seedIndex = 0; seedIndex < seeds.length; seedIndex += 1) {
      plans.push({
        runId: `run-${conditionIndex + 1}-${seedIndex + 1}`,
        condition,
        seed: seeds[seedIndex]!,
        trialIndex: seedIndex
      });
    }
  }
  return plans;
}

export function validateTemplateParameters(template: SimulationTemplate, parameters: ParameterValues): ParameterValues {
  const resolved = resolveParameters(template.parameterDefinitions, parameters);
  template.validateParameters?.(resolved);
  return deepClone(resolved);
}

function valuesFromRangeOrDefinition(definition: ParameterDefinition, dimension: ParameterSweepDimension): SweepValue[] {
  if (dimension.range) {
    return rangeValues(definition, dimension.range.min, dimension.range.max, dimension.range.steps);
  }
  if (definition.type === "boolean") {
    return [false, true];
  }
  if (definition.type === "select") {
    return [...(definition.options ?? [])].filter((value): value is SweepValue => isSweepValue(value));
  }
  const min = definition.min ?? 0;
  const max = definition.max ?? min;
  return rangeValues(definition, min, max, 5);
}

function rangeValues(definition: ParameterDefinition, min: number, max: number, steps: number): SweepValue[] {
  if (steps <= 0 || !Number.isInteger(steps)) {
    throw new SimulationValidationError(`Sweep ${definition.key} steps must be a positive integer`);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new SimulationValidationError(`Sweep ${definition.key} range must have finite min <= max`);
  }
  if (steps === 1) {
    return [coerceSweepValue(definition, min)];
  }
  const delta = (max - min) / (steps - 1);
  return Array.from({ length: steps }, (_, index) => coerceSweepValue(definition, min + delta * index));
}

function coerceSweepValue(definition: ParameterDefinition, value: SweepValue): SweepValue {
  if (definition.type === "integer") {
    if (typeof value !== "number") {
      throw new SimulationValidationError(`Sweep ${definition.key} values must be numeric integers`);
    }
    return Math.round(value);
  }
  if (definition.type === "number") {
    if (typeof value !== "number") {
      throw new SimulationValidationError(`Sweep ${definition.key} values must be numeric`);
    }
    return Number(value.toFixed(8));
  }
  if (definition.type === "boolean") {
    if (typeof value !== "boolean") {
      throw new SimulationValidationError(`Sweep ${definition.key} values must be boolean`);
    }
    return value;
  }
  return value;
}

function uniqueSweepValues(values: readonly SweepValue[]): SweepValue[] {
  const seen = new Set<string>();
  const unique: SweepValue[] = [];
  for (const value of values) {
    const key = `${typeof value}:${String(value)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(value);
    }
  }
  return unique;
}

function stableConditionKey(values: Record<string, SweepValue>): string {
  return JSON.stringify(Object.fromEntries(Object.entries(values).sort(([left], [right]) => left.localeCompare(right))));
}

function isSweepValue(value: unknown): value is SweepValue {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "configuration shape is invalid";
  }
  const path = issue.path.length > 0 ? issue.path.join(".") : "root";
  return `${path} ${issue.message}`;
}
