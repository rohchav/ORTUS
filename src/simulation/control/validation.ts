import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  constraintKinds,
  controlStrategyModelArtifactType,
  controlInterventionKinds,
  effectKinds,
  maxConstraints,
  maxControlStrategyMetadataJsonLength,
  maxControlStrategyModelJsonLength,
  maxControlStrategyNoteLength,
  maxControlStrategyNotes,
  maxExpectedEffects,
  maxInterventionOptions,
  maxObjectives,
  maxPolicyRules,
  maxStoppingRules,
  maxStrategies,
  maxTriggerConditions,
  objectiveKinds,
  policyKinds,
  stoppingKinds,
  strategyKinds,
  strategyStatuses,
  triggerKinds,
  type ConstraintDefinition,
  type ControlScope,
  type ControlStrategyModel,
  type ExpectedEffect,
  type InterventionOption,
  type ObjectiveDefinition,
  type PolicyRule,
  type StoppingRule,
  type StrategyDescriptor,
  type TriggerCondition
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxControlStrategyNoteLength);
const notesSchema = z.array(noteSchema).max(maxControlStrategyNotes);
const stringIdArraySchema = z.array(boundedString(160)).max(256);

const scopeSchema: z.ZodType<ControlScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    runConfigId: boundedString(240).optional(),
    uncertaintyConfigId: boundedString(160).optional(),
    uncertaintyResultId: boundedString(160).optional(),
    robustnessResilienceModelId: boundedString(160).optional(),
    emergencePatternModelId: boundedString(160).optional(),
    causalAssumptionModelId: boundedString(160).optional(),
    observabilityModelId: boundedString(160).optional(),
    resourceSystemId: boundedString(160).optional(),
    feedbackLoopModelId: boundedString(160).optional(),
    networkDefinitionId: boundedString(160).optional(),
    quantitySemanticsModelId: boundedString(160).optional(),
    boundaryModelId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const strategySchema: z.ZodType<StrategyDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    strategyKind: z.enum(strategyKinds),
    status: z.enum(strategyStatuses),
    targetDescription: z.string().min(1).max(800).optional(),
    interventionIds: stringIdArraySchema.optional(),
    triggerIds: stringIdArraySchema.optional(),
    objectiveIds: stringIdArraySchema.optional(),
    constraintIds: stringIdArraySchema.optional(),
    policyIds: stringIdArraySchema.optional(),
    stoppingRuleIds: stringIdArraySchema.optional(),
    expectedEffectIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const interventionSchema: z.ZodType<InterventionOption> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    interventionKind: z.enum(controlInterventionKinds),
    targetPath: z.string().min(1).max(400).optional(),
    targetDescription: z.string().min(1).max(800).optional(),
    templateInterventionId: boundedString(160).optional(),
    magnitudeDescription: z.string().min(1).max(800).optional(),
    timingDescription: z.string().min(1).max(800).optional(),
    durationDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const triggerSchema: z.ZodType<TriggerCondition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    triggerKind: z.enum(triggerKinds),
    conditionDescription: z.string().min(1).max(800),
    metricId: boundedString(160).optional(),
    observationId: boundedString(160).optional(),
    quantityId: boundedString(160).optional(),
    eventType: boundedString(160).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const objectiveSchema: z.ZodType<ObjectiveDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    objectiveKind: z.enum(objectiveKinds),
    targetDescription: z.string().min(1).max(800),
    metricId: boundedString(160).optional(),
    quantityId: boundedString(160).optional(),
    priorityDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const constraintSchema: z.ZodType<ConstraintDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    constraintKind: z.enum(constraintKinds),
    constraintDescription: z.string().min(1).max(800),
    hardConstraint: z.boolean().optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const policySchema: z.ZodType<PolicyRule> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    policyKind: z.enum(policyKinds),
    ruleDescription: z.string().min(1).max(800),
    triggerIds: stringIdArraySchema.optional(),
    interventionIds: stringIdArraySchema.optional(),
    constraintIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const stoppingRuleSchema: z.ZodType<StoppingRule> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    stoppingKind: z.enum(stoppingKinds),
    ruleDescription: z.string().min(1).max(800),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const expectedEffectSchema: z.ZodType<ExpectedEffect> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    effectKind: z.enum(effectKinds),
    affectedTargetDescription: z.string().min(1).max(800),
    evidenceDescription: z.string().min(1).max(800).optional(),
    uncertaintyDescription: z.string().min(1).max(800).optional(),
    riskDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const controlStrategyModelSchema: z.ZodType<ControlStrategyModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(controlStrategyModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    scope: scopeSchema.optional(),
    strategies: z.array(strategySchema).min(1).max(maxStrategies),
    interventions: z.array(interventionSchema).max(maxInterventionOptions).optional(),
    triggers: z.array(triggerSchema).max(maxTriggerConditions).optional(),
    objectives: z.array(objectiveSchema).max(maxObjectives).optional(),
    constraints: z.array(constraintSchema).max(maxConstraints).optional(),
    policies: z.array(policySchema).max(maxPolicyRules).optional(),
    stoppingRules: z.array(stoppingRuleSchema).max(maxStoppingRules).optional(),
    expectedEffects: z.array(expectedEffectSchema).max(maxExpectedEffects).optional(),
    riskNotes: z.array(assumptionItemSchema).max(maxControlStrategyNotes).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxControlStrategyNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxControlStrategyNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxControlStrategyNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenControlKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "metricHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "runState",
  "runSummary",
  "runSummaries",
  "template",
  "activeEngine",
  "formula",
  "formulas",
  "expression",
  "expressions",
  "equation",
  "equations",
  "algorithm",
  "algorithms",
  "optimizer",
  "optimizers",
  "controller",
  "controllers",
  "controlEngine",
  "controlEngines",
  "policyEngine",
  "policyEngines",
  "policyExecutor",
  "policyExecutors",
  "policyExecution",
  "policyExecutions",
  "policyResult",
  "policyResults",
  "controlPolicy",
  "controlPolicies",
  "reinforcementLearning",
  "rewardFunction",
  "rewardFunctions",
  "agentPolicy",
  "agentPolicies",
  "modelPredictiveControl",
  "mpc",
  "optimalPolicy",
  "optimalPolicies",
  "policyRecommendation",
  "policyRecommendations",
  "recommendedAction",
  "recommendedActions",
  "actionRanking",
  "actionRankings",
  "rankedPolicies",
  "rankedPolicy",
  "causalEffect",
  "causalEffects",
  "effectEstimate",
  "effectEstimates",
  "treatmentEffect",
  "treatmentEffects",
  "riskScore",
  "riskScores",
  "safetyScore",
  "safetyScores",
  "certification",
  "certifications",
  "certified",
  "proof",
  "proofs",
  "pValue",
  "pValues",
  "significance",
  "significanceTest",
  "confidenceInterval",
  "confidenceIntervals",
  "calibration",
  "calibrationResult",
  "calibrationResults",
  "likelihood",
  "likelihoods",
  "dataset",
  "datasets",
  "observedData",
  "observationData",
  "timeSeries",
  "timeSeriesData",
  "rawData",
  "dataFrame",
  "csv",
  "table",
  "tables",
  "executedRuns",
  "executedRun",
  "experimentResults",
  "experimentResult",
  "interventionResults",
  "interventionResult",
  "resultRows",
  "code",
  "script",
  "functionBody",
  "callback"
]);

export function validateControlStrategyModel(value: unknown): ControlStrategyModel {
  assertPlainControlStrategyJson(value, "Control strategy model");
  const parsed = controlStrategyModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid control strategy model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeControlStrategyModel(parsed.data);
  assertControlStrategyJsonBound(model, maxControlStrategyModelJsonLength, "Control strategy model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("strategy", model.strategies);
  validateUniqueIds("intervention", model.interventions ?? []);
  validateUniqueIds("trigger", model.triggers ?? []);
  validateUniqueIds("objective", model.objectives ?? []);
  validateUniqueIds("constraint", model.constraints ?? []);
  validateUniqueIds("policy", model.policies ?? []);
  validateUniqueIds("stopping rule", model.stoppingRules ?? []);
  validateUniqueIds("expected effect", model.expectedEffects ?? []);
  validateReferences(model);
  return model;
}

export function parseControlStrategyModelJson(json: string | unknown): ControlStrategyModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxControlStrategyModelJsonLength) {
      throw new SimulationSerializationError(`Control strategy model JSON must be ${maxControlStrategyModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid control strategy model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== controlStrategyModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${controlStrategyModelArtifactType}`);
  }
  return validateControlStrategyModel(raw);
}

export function normalizeControlStrategyModel(model: ControlStrategyModel): ControlStrategyModel {
  return {
    ...model,
    ...(model.scope ? { scope: cloneRecord(model.scope) } : {}),
    strategies: model.strategies.map((strategy) => cloneRecord(strategy)),
    ...(model.interventions ? { interventions: model.interventions.map((intervention) => cloneRecord(intervention)) } : {}),
    ...(model.triggers ? { triggers: model.triggers.map((trigger) => cloneRecord(trigger)) } : {}),
    ...(model.objectives ? { objectives: model.objectives.map((objective) => cloneRecord(objective)) } : {}),
    ...(model.constraints ? { constraints: model.constraints.map((constraint) => cloneRecord(constraint)) } : {}),
    ...(model.policies ? { policies: model.policies.map((policy) => cloneRecord(policy)) } : {}),
    ...(model.stoppingRules ? { stoppingRules: model.stoppingRules.map((rule) => cloneRecord(rule)) } : {}),
    ...(model.expectedEffects ? { expectedEffects: model.expectedEffects.map((effect) => cloneRecord(effect)) } : {}),
    ...(model.riskNotes ? { riskNotes: validateAssumptionItems("control strategy risk notes", model.riskNotes) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("control strategy assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("control strategy limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("control strategy validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(model: ControlStrategyModel): void {
  const interventionIds = new Set((model.interventions ?? []).map((intervention) => intervention.id));
  const triggerIds = new Set((model.triggers ?? []).map((trigger) => trigger.id));
  const objectiveIds = new Set((model.objectives ?? []).map((objective) => objective.id));
  const constraintIds = new Set((model.constraints ?? []).map((constraint) => constraint.id));
  const policyIds = new Set((model.policies ?? []).map((policy) => policy.id));
  const stoppingRuleIds = new Set((model.stoppingRules ?? []).map((rule) => rule.id));
  const expectedEffectIds = new Set((model.expectedEffects ?? []).map((effect) => effect.id));

  for (const strategy of model.strategies) {
    validateReferenceSet(`Strategy ${strategy.id}`, "interventionId", strategy.interventionIds ?? [], interventionIds);
    validateReferenceSet(`Strategy ${strategy.id}`, "triggerId", strategy.triggerIds ?? [], triggerIds);
    validateReferenceSet(`Strategy ${strategy.id}`, "objectiveId", strategy.objectiveIds ?? [], objectiveIds);
    validateReferenceSet(`Strategy ${strategy.id}`, "constraintId", strategy.constraintIds ?? [], constraintIds);
    validateReferenceSet(`Strategy ${strategy.id}`, "policyId", strategy.policyIds ?? [], policyIds);
    validateReferenceSet(`Strategy ${strategy.id}`, "stoppingRuleId", strategy.stoppingRuleIds ?? [], stoppingRuleIds);
    validateReferenceSet(`Strategy ${strategy.id}`, "expectedEffectId", strategy.expectedEffectIds ?? [], expectedEffectIds);
  }

  for (const intervention of model.interventions ?? []) {
    if (intervention.interventionKind === "templateInterventionReference" && !intervention.templateInterventionId) {
      throw new SimulationValidationError(`Intervention ${intervention.id} is templateInterventionReference but missing templateInterventionId`);
    }
  }

  for (const policy of model.policies ?? []) {
    validateReferenceSet(`Policy ${policy.id}`, "triggerId", policy.triggerIds ?? [], triggerIds);
    validateReferenceSet(`Policy ${policy.id}`, "interventionId", policy.interventionIds ?? [], interventionIds);
    validateReferenceSet(`Policy ${policy.id}`, "constraintId", policy.constraintIds ?? [], constraintIds);
  }
}

function validateReferenceSet(label: string, field: string, ids: readonly string[], knownIds: ReadonlySet<string>): void {
  for (const id of ids) {
    if (!knownIds.has(id)) {
      throw new SimulationValidationError(`${label} references unknown ${field}: ${id}`);
    }
  }
}

function validateUniqueIds(label: string, values: readonly { id: string }[]): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new SimulationValidationError(`Duplicate ${label} id: ${value.id}`);
    }
    ids.add(value.id);
  }
}

function validateNotes(model: ControlStrategyModel): void {
  for (const [section, notes] of [
    ["riskNotes", model.riskNotes],
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`control strategy ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: ControlStrategyModel): void {
  for (const [label, values] of [
    ["scope", model.scope ? [model.scope] : []],
    ["strategy", model.strategies],
    ["intervention", model.interventions ?? []],
    ["trigger", model.triggers ?? []],
    ["objective", model.objectives ?? []],
    ["constraint", model.constraints ?? []],
    ["policy", model.policies ?? []],
    ["stopping rule", model.stoppingRules ?? []],
    ["expected effect", model.expectedEffects ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertControlStrategyJsonBound(value.metadata, maxControlStrategyMetadataJsonLength, `${label} metadata`);
      }
    }
  }
  if (model.metadata) {
    assertControlStrategyJsonBound(model.metadata, maxControlStrategyMetadataJsonLength, "Control strategy model metadata");
  }
}

export function assertControlStrategyJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainControlStrategyJson(value: unknown, label: string): void {
  const stack: unknown[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || current === undefined) {
      continue;
    }
    if (typeof current === "function" || typeof current === "symbol" || typeof current === "bigint") {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    if (typeof current !== "object") {
      if (typeof current === "number" && !Number.isFinite(current)) {
        throw new SimulationValidationError(`${label} must not contain non-finite numbers`);
      }
      continue;
    }
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }
    if (!isPlainRecord(current)) {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    for (const [key, child] of Object.entries(current)) {
      if (forbiddenControlKeys.has(key)) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable-shaped, formula, optimizer, controller, policy-engine, reinforcement-learning, model-predictive-control, causal-effect, treatment-effect, recommendation, ranking, statistical-significance, safety, risk, certification, proof, calibration, experiment-result, intervention-result, or external-data key ${key}`
        );
      }
      stack.push(child);
    }
  }
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainRecord(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
