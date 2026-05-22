import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema, resolveParameters } from "../kernel/Validation";
import type { InitializationConfig, ParameterValues, SimulationTemplate } from "../kernel/types";
import { assumptionItemSchema, validateScenarioAssumptionNotes } from "../assumptions/validation";
import { getProductionTemplate } from "../templates/registry";
import { findInitializationPreset } from "./scenarioPresets";
import {
  applyScenarioVariantParameterOverrides,
  defaultAgentCompositionForTemplate,
  defaultBehaviorModeForTemplate,
  defaultEnvironmentOptionsForTemplate,
  resolveScenarioVariantConfig
} from "./scenarioVariantTypes";
import {
  maxScenarioJsonLength,
  maxScenarioDescriptionLength,
  maxScenarioTags,
  scenarioArtifactType,
  type AuthoredScenario,
  type ScenarioValidationResult
} from "./scenarioTypes";

type RawAuthoredScenario = Omit<AuthoredScenario, "agentComposition" | "behaviorMode" | "environmentOptions"> &
  Partial<Pick<AuthoredScenario, "agentComposition" | "behaviorMode" | "environmentOptions">>;

const scenarioSchema: z.ZodType<RawAuthoredScenario> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(scenarioArtifactType),
    scenarioId: z.string().min(1),
    name: z.string().min(1).max(120),
    description: z.string().max(maxScenarioDescriptionLength),
    tags: z.array(z.string()).max(maxScenarioTags),
    templateId: z.string().min(1),
    templateVersion: z.string().min(1),
    seed: z.string().min(1),
    parameters: z.record(jsonValueSchema),
    initializationPreset: z.string().min(1),
    initializationOptions: z.record(jsonValueSchema),
    agentComposition: z.record(jsonValueSchema).optional(),
    behaviorMode: z.string().min(1).optional(),
    environmentOptions: z.record(jsonValueSchema).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(24).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(24).optional(),
    validationNotes: z.array(assumptionItemSchema).max(24).optional(),
    ethicsNotes: z.array(assumptionItemSchema).max(24).optional(),
    metadata: z.record(jsonValueSchema),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  })
  .strict() as z.ZodType<RawAuthoredScenario>;

export function validateScenario(value: unknown, templateOverride?: SimulationTemplate): ScenarioValidationResult {
  const parsed = scenarioSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid scenario: ${formatZodIssue(parsed.error)}`);
  }
  const scenario = parsed.data;
  assertScenarioPayloadBounds(scenario);
  assertScenarioMetadataIsNotLiveState(scenario.metadata);
  const assumptionNotes = validateScenarioAssumptionNotes({
    assumptionNotes: scenario.assumptionNotes,
    limitationNotes: scenario.limitationNotes,
    validationNotes: scenario.validationNotes,
    ethicsNotes: scenario.ethicsNotes
  });
  const template = templateOverride ?? getProductionTemplate(scenario.templateId);
  if (!template) {
    throw new SimulationValidationError(`Unknown scenario template: ${scenario.templateId}`);
  }
  if (template.id !== scenario.templateId) {
    throw new SimulationValidationError(`Scenario template ${scenario.templateId} does not match ${template.id}`);
  }
  const warnings: string[] = [];
  if (scenario.templateVersion !== template.version) {
    warnings.push(`Scenario was authored for template version ${scenario.templateVersion}; current version is ${template.version}.`);
  }
  if (!scenario.agentComposition || !scenario.behaviorMode || !scenario.environmentOptions) {
    warnings.push("Scenario did not include variant fields; default behavior mode, agent composition, and environment options were applied.");
  }
  const preset = findInitializationPreset(template, scenario.initializationPreset);
  if (!preset) {
    throw new SimulationValidationError(`Unknown initialization preset: ${scenario.initializationPreset}`);
  }
  const initializationOptions = resolveParameters(preset.optionDefinitions ?? [], scenario.initializationOptions);
  const initialization: InitializationConfig = {
    presetId: preset.id,
    options: initializationOptions
  };
  const baseParameters = resolveParameters(template.parameterDefinitions, scenario.parameters);
  const defaultedVariantInput = {
    behaviorMode: scenario.behaviorMode ?? defaultBehaviorModeForTemplate(template).id,
    agentComposition: scenario.agentComposition ?? defaultAgentCompositionForTemplate(template, baseParameters),
    environmentOptions: scenario.environmentOptions ?? defaultEnvironmentOptionsForTemplate(template, baseParameters)
  };
  const prelimVariant = resolveScenarioVariantConfig(template, defaultedVariantInput, baseParameters, initialization);
  const parameters = applyScenarioVariantParameterOverrides(template, baseParameters, prelimVariant);
  template.validateParameters?.(parameters);
  template.validateInitializationOptions?.(initialization, parameters);
  const variant = resolveScenarioVariantConfig(template, defaultedVariantInput, parameters, initialization);
  return {
    scenario: {
      ...scenario,
      parameters,
      initializationOptions,
      agentComposition: variant.agentComposition,
      behaviorMode: variant.behaviorMode,
      environmentOptions: variant.environmentOptions,
      ...assumptionNotes
    },
    warnings
  };
}

const forbiddenScenarioMetadataKeys = new Set([
  "snapshot",
  "world",
  "metricsHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "snapshots",
  "runState",
  "runSummary",
  "runSummaries"
]);

function assertScenarioPayloadBounds(scenario: RawAuthoredScenario): void {
  const serializedLength = JSON.stringify(scenario).length;
  if (serializedLength > maxScenarioJsonLength) {
    throw new SimulationValidationError(`Scenario JSON must be ${maxScenarioJsonLength} characters or less`);
  }
}

function assertScenarioMetadataIsNotLiveState(value: ParameterValues): void {
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
      if (forbiddenScenarioMetadataKeys.has(key)) {
        throw new SimulationValidationError(`Scenario metadata must not embed live run state (${key})`);
      }
      stack.push(child);
    }
  }
}

export function safeParseScenario(value: unknown, templateOverride?: SimulationTemplate): ScenarioValidationResult | null {
  try {
    return validateScenario(value, templateOverride);
  } catch {
    return null;
  }
}

export function parseScenarioJson(json: string): ScenarioValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid scenario JSON", { cause: error });
  }
  return validateScenario(raw);
}

export function validateScenarioParameters(template: SimulationTemplate, parameters: ParameterValues): ParameterValues {
  const resolved = resolveParameters(template.parameterDefinitions, parameters);
  template.validateParameters?.(resolved);
  return resolved;
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
