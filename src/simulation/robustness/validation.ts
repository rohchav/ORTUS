import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  failureKinds,
  maxFailureModes,
  maxResponseCriteria,
  maxRobustnessDescriptors,
  maxRobustnessResilienceMetadataJsonLength,
  maxRobustnessResilienceModelJsonLength,
  maxRobustnessResilienceNoteLength,
  maxRobustnessResilienceNotes,
  maxStressors,
  maxStressTestPlans,
  responseCriterionKinds,
  robustnessDescriptorStatuses,
  robustnessKinds,
  robustnessResilienceModelArtifactType,
  stressorKinds,
  stressTestPlanKinds,
  type FailureMode,
  type ResponseCriterion,
  type RobustnessDescriptor,
  type RobustnessResilienceModel,
  type RobustnessScope,
  type StressorDefinition,
  type StressTestPlan
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxRobustnessResilienceNoteLength);
const notesSchema = z.array(noteSchema).max(maxRobustnessResilienceNotes);
const stringIdArraySchema = z.array(boundedString(160)).max(256);

const scopeSchema: z.ZodType<RobustnessScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    runConfigId: boundedString(240).optional(),
    uncertaintyConfigId: boundedString(160).optional(),
    uncertaintyResultId: boundedString(160).optional(),
    emergencePatternModelId: boundedString(160).optional(),
    boundaryModelId: boundedString(160).optional(),
    resourceSystemId: boundedString(160).optional(),
    feedbackLoopModelId: boundedString(160).optional(),
    scaleModelId: boundedString(160).optional(),
    quantitySemanticsModelId: boundedString(160).optional(),
    observabilityModelId: boundedString(160).optional(),
    causalAssumptionModelId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const descriptorSchema: z.ZodType<RobustnessDescriptor> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    robustnessKind: z.enum(robustnessKinds),
    status: z.enum(robustnessDescriptorStatuses),
    targetDescription: z.string().min(1).max(800).optional(),
    stressorIds: stringIdArraySchema.optional(),
    responseCriterionIds: stringIdArraySchema.optional(),
    failureModeIds: stringIdArraySchema.optional(),
    stressTestPlanIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const stressorSchema: z.ZodType<StressorDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    stressorKind: z.enum(stressorKinds),
    targetPath: z.string().min(1).max(400).optional(),
    targetDescription: z.string().min(1).max(800).optional(),
    magnitudeDescription: z.string().min(1).max(800).optional(),
    durationDescription: z.string().min(1).max(800).optional(),
    timingDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const responseCriterionSchema: z.ZodType<ResponseCriterion> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    criterionKind: z.enum(responseCriterionKinds),
    metricId: boundedString(160).optional(),
    quantityId: boundedString(160).optional(),
    thresholdDescription: z.string().min(1).max(800).optional(),
    timeWindowId: boundedString(160).optional(),
    successDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const failureModeSchema: z.ZodType<FailureMode> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    failureKind: z.enum(failureKinds),
    triggerDescription: z.string().min(1).max(800).optional(),
    consequenceDescription: z.string().min(1).max(800).optional(),
    recoveryDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const stressTestPlanSchema: z.ZodType<StressTestPlan> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    planKind: z.enum(stressTestPlanKinds),
    stressorIds: stringIdArraySchema.optional(),
    responseCriterionIds: stringIdArraySchema.optional(),
    scenarioIds: stringIdArraySchema.optional(),
    uncertaintyConfigId: boundedString(160).optional(),
    timeWindowDescription: z.string().min(1).max(800).optional(),
    replicationDescription: z.string().min(1).max(800).optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const robustnessResilienceModelSchema: z.ZodType<RobustnessResilienceModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(robustnessResilienceModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    scope: scopeSchema.optional(),
    descriptors: z.array(descriptorSchema).min(1).max(maxRobustnessDescriptors),
    stressors: z.array(stressorSchema).max(maxStressors).optional(),
    responseCriteria: z.array(responseCriterionSchema).max(maxResponseCriteria).optional(),
    failureModes: z.array(failureModeSchema).max(maxFailureModes).optional(),
    stressTestPlans: z.array(stressTestPlanSchema).max(maxStressTestPlans).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxRobustnessResilienceNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxRobustnessResilienceNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxRobustnessResilienceNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenRobustnessKeys = new Set([
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
  "policy",
  "policies",
  "controlPolicy",
  "controlPolicies",
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
  "stressTestResult",
  "stressTestResults",
  "stressTestExecution",
  "stressTestExecutions",
  "executedRuns",
  "executedRun",
  "experimentResults",
  "experimentResult",
  "experimentRuns",
  "experimentRun",
  "experimentExecution",
  "experimentExecutions",
  "resultRows",
  "code",
  "script",
  "functionBody",
  "callback"
]);

export function validateRobustnessResilienceModel(value: unknown): RobustnessResilienceModel {
  assertPlainRobustnessResilienceJson(value, "Robustness/resilience model");
  const parsed = robustnessResilienceModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid robustness/resilience model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeRobustnessResilienceModel(parsed.data);
  assertRobustnessResilienceJsonBound(model, maxRobustnessResilienceModelJsonLength, "Robustness/resilience model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("descriptor", model.descriptors);
  validateUniqueIds("stressor", model.stressors ?? []);
  validateUniqueIds("response criterion", model.responseCriteria ?? []);
  validateUniqueIds("failure mode", model.failureModes ?? []);
  validateUniqueIds("stress test plan", model.stressTestPlans ?? []);
  validateReferences(model);
  return model;
}

export function parseRobustnessResilienceModelJson(json: string | unknown): RobustnessResilienceModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxRobustnessResilienceModelJsonLength) {
      throw new SimulationSerializationError(`Robustness/resilience model JSON must be ${maxRobustnessResilienceModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid robustness/resilience model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== robustnessResilienceModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${robustnessResilienceModelArtifactType}`);
  }
  return validateRobustnessResilienceModel(raw);
}

export function normalizeRobustnessResilienceModel(model: RobustnessResilienceModel): RobustnessResilienceModel {
  return {
    ...model,
    ...(model.scope ? { scope: cloneRecord(model.scope) } : {}),
    descriptors: model.descriptors.map((descriptor) => cloneRecord(descriptor)),
    ...(model.stressors ? { stressors: model.stressors.map((stressor) => cloneRecord(stressor)) } : {}),
    ...(model.responseCriteria ? { responseCriteria: model.responseCriteria.map((criterion) => cloneRecord(criterion)) } : {}),
    ...(model.failureModes ? { failureModes: model.failureModes.map((failureMode) => cloneRecord(failureMode)) } : {}),
    ...(model.stressTestPlans ? { stressTestPlans: model.stressTestPlans.map((plan) => cloneRecord(plan)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("robustness/resilience assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("robustness/resilience limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("robustness/resilience validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(model: RobustnessResilienceModel): void {
  const stressorIds = new Set((model.stressors ?? []).map((stressor) => stressor.id));
  const responseCriterionIds = new Set((model.responseCriteria ?? []).map((criterion) => criterion.id));
  const failureModeIds = new Set((model.failureModes ?? []).map((failureMode) => failureMode.id));
  const stressTestPlanIds = new Set((model.stressTestPlans ?? []).map((plan) => plan.id));

  for (const descriptor of model.descriptors) {
    for (const stressorId of descriptor.stressorIds ?? []) {
      if (!stressorIds.has(stressorId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown stressorId: ${stressorId}`);
      }
    }
    for (const responseCriterionId of descriptor.responseCriterionIds ?? []) {
      if (!responseCriterionIds.has(responseCriterionId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown responseCriterionId: ${responseCriterionId}`);
      }
    }
    for (const failureModeId of descriptor.failureModeIds ?? []) {
      if (!failureModeIds.has(failureModeId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown failureModeId: ${failureModeId}`);
      }
    }
    for (const stressTestPlanId of descriptor.stressTestPlanIds ?? []) {
      if (!stressTestPlanIds.has(stressTestPlanId)) {
        throw new SimulationValidationError(`Descriptor ${descriptor.id} references unknown stressTestPlanId: ${stressTestPlanId}`);
      }
    }
  }

  for (const plan of model.stressTestPlans ?? []) {
    for (const stressorId of plan.stressorIds ?? []) {
      if (!stressorIds.has(stressorId)) {
        throw new SimulationValidationError(`Stress test plan ${plan.id} references unknown stressorId: ${stressorId}`);
      }
    }
    for (const responseCriterionId of plan.responseCriterionIds ?? []) {
      if (!responseCriterionIds.has(responseCriterionId)) {
        throw new SimulationValidationError(`Stress test plan ${plan.id} references unknown responseCriterionId: ${responseCriterionId}`);
      }
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

function validateNotes(model: RobustnessResilienceModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`robustness/resilience ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: RobustnessResilienceModel): void {
  for (const [label, values] of [
    ["scope", model.scope ? [model.scope] : []],
    ["descriptor", model.descriptors],
    ["stressor", model.stressors ?? []],
    ["response criterion", model.responseCriteria ?? []],
    ["failure mode", model.failureModes ?? []],
    ["stress test plan", model.stressTestPlans ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertRobustnessResilienceJsonBound(value.metadata, maxRobustnessResilienceMetadataJsonLength, `${label} metadata`);
      }
    }
  }
  if (model.metadata) {
    assertRobustnessResilienceJsonBound(model.metadata, maxRobustnessResilienceMetadataJsonLength, "Robustness/resilience model metadata");
  }
}

export function assertRobustnessResilienceJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainRobustnessResilienceJson(value: unknown, label: string): void {
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
      if (forbiddenRobustnessKeys.has(key)) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable-shaped, formula, optimizer, controller, policy, statistical-significance, safety, risk, certification, proof, calibration, stress-result, or external-data key ${key}`
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
