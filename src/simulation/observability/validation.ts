import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import {
  maxMeasurementProcesses,
  maxMeasurements,
  maxObservableVariables,
  maxObservabilityMetadataJsonLength,
  maxObservabilityModelJsonLength,
  maxObservabilityNoteLength,
  maxObservabilityNotes,
  maxObservationSchedules,
  maxScheduleTicks,
  measurementKinds,
  measurementProcessTypes,
  measurementSourceTypes,
  observabilityLevels,
  observabilityModelArtifactType,
  observationScheduleTypes,
  variableKinds,
  type MeasurementDefinition,
  type MeasurementProcess,
  type ObservableVariable,
  type ObservabilityModel,
  type ObservabilityScope,
  type ObservationSchedule
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(2_000).optional();
const noteSchema = z.string().min(1).max(maxObservabilityNoteLength);
const notesSchema = z.array(noteSchema).max(maxObservabilityNotes);

const scopeSchema: z.ZodType<ObservabilityScope> = z
  .object({
    templateId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    runConfigId: boundedString(240).optional(),
    scaleModelId: boundedString(160).optional(),
    boundaryModelId: boundedString(160).optional(),
    fieldLayerId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const observableVariableSchema: z.ZodType<ObservableVariable> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    variableKind: z.enum(variableKinds),
    observability: z.enum(observabilityLevels),
    targetPath: z.string().min(1).max(400).optional(),
    unit: z.string().min(1).max(80).optional(),
    scaleId: boundedString(160).optional(),
    entityTypeId: boundedString(160).optional(),
    fieldId: boundedString(160).optional(),
    metricId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const measurementDefinitionSchema: z.ZodType<MeasurementDefinition> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    variableId: boundedString(160),
    measurementKind: z.enum(measurementKinds),
    sourceType: z.enum(measurementSourceTypes),
    scheduleId: boundedString(160).optional(),
    processId: boundedString(160).optional(),
    unit: z.string().min(1).max(80).optional(),
    aggregation: z.string().min(1).max(240).optional(),
    lagTicks: z.number().int().nonnegative().optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const observationScheduleSchema: z.ZodType<ObservationSchedule> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    scheduleType: z.enum(observationScheduleTypes),
    intervalTicks: z.number().int().positive().optional(),
    ticks: z.array(z.number().int().nonnegative()).max(maxScheduleTicks).optional(),
    eventDescription: z.string().min(1).max(400).optional(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const measurementProcessSchema: z.ZodType<MeasurementProcess> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    processType: z.enum(measurementProcessTypes),
    noiseDescription: z.string().min(1).max(400).optional(),
    biasDescription: z.string().min(1).max(400).optional(),
    missingnessDescription: z.string().min(1).max(400).optional(),
    samplingDescription: z.string().min(1).max(400).optional(),
    transformationDescription: z.string().min(1).max(400).optional(),
    uncertaintyDescription: z.string().min(1).max(400).optional(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const observabilityModelSchema: z.ZodType<ObservabilityModel> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(observabilityModelArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    scope: scopeSchema.optional(),
    variables: z.array(observableVariableSchema).min(1).max(maxObservableVariables),
    measurements: z.array(measurementDefinitionSchema).max(maxMeasurements).optional(),
    schedules: z.array(observationScheduleSchema).max(maxObservationSchedules).optional(),
    measurementProcesses: z.array(measurementProcessSchema).max(maxMeasurementProcesses).optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxObservabilityNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxObservabilityNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxObservabilityNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenObservabilityKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
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
  "code",
  "script",
  "functionBody",
  "callback",
  "calibrationData",
  "externalData",
  "rawData",
  "dataset",
  "datasets",
  "dataTable",
  "dataTables",
  "observations",
  "observedData",
  "observationData",
  "timeSeries",
  "timeSeriesData",
  "measurementValues",
  "sampleRows",
  "records"
]);

export function validateObservabilityModel(value: unknown): ObservabilityModel {
  assertPlainObservabilityJson(value, "Observability model");
  const parsed = observabilityModelSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid observability model: ${formatZodIssue(parsed.error)}`);
  }
  const model = normalizeObservabilityModel(parsed.data);
  assertObservabilityJsonBound(model, maxObservabilityModelJsonLength, "Observability model");
  validateNotes(model);
  validateMetadataBounds(model);
  validateUniqueIds("variable", model.variables);
  validateUniqueIds("measurement", model.measurements ?? []);
  validateUniqueIds("schedule", model.schedules ?? []);
  validateUniqueIds("measurement process", model.measurementProcesses ?? []);
  validateSchedules(model.schedules ?? []);
  validateReferences(model);
  return model;
}

export function parseObservabilityModelJson(json: string | unknown): ObservabilityModel {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxObservabilityModelJsonLength) {
      throw new SimulationSerializationError(`Observability model JSON must be ${maxObservabilityModelJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid observability model JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== observabilityModelArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${observabilityModelArtifactType}`);
  }
  return validateObservabilityModel(raw);
}

export function normalizeObservabilityModel(model: ObservabilityModel): ObservabilityModel {
  return {
    ...model,
    ...(model.scope ? { scope: cloneRecord(model.scope) } : {}),
    variables: model.variables.map((variable) => cloneRecord(variable)),
    ...(model.measurements ? { measurements: model.measurements.map((measurement) => cloneRecord(measurement)) } : {}),
    ...(model.schedules ? { schedules: model.schedules.map((schedule) => cloneRecord(schedule)) } : {}),
    ...(model.measurementProcesses ? { measurementProcesses: model.measurementProcesses.map((process) => cloneRecord(process)) } : {}),
    ...(model.assumptionNotes ? { assumptionNotes: validateAssumptionItems("observability assumption notes", model.assumptionNotes) } : {}),
    ...(model.limitationNotes ? { limitationNotes: validateAssumptionItems("observability limitation notes", model.limitationNotes) } : {}),
    ...(model.validationNotes ? { validationNotes: validateAssumptionItems("observability validation notes", model.validationNotes) } : {}),
    ...(model.metadata ? { metadata: JSON.parse(JSON.stringify(model.metadata)) as Record<string, JsonValue> } : {})
  };
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function validateNotes(model: ObservabilityModel): void {
  for (const [section, notes] of [
    ["assumptionNotes", model.assumptionNotes],
    ["limitationNotes", model.limitationNotes],
    ["validationNotes", model.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`observability ${section}`, notes);
    }
  }
}

function validateMetadataBounds(model: ObservabilityModel): void {
  for (const [label, values] of [
    ["scope", model.scope ? [model.scope] : []],
    ["variable", model.variables],
    ["measurement", model.measurements ?? []],
    ["schedule", model.schedules ?? []],
    ["measurement process", model.measurementProcesses ?? []]
  ] as const) {
    for (const value of values) {
      if (value.metadata) {
        assertObservabilityJsonBound(value.metadata, maxObservabilityMetadataJsonLength, `${label} metadata`);
      }
    }
  }
  if (model.metadata) {
    assertObservabilityJsonBound(model.metadata, maxObservabilityMetadataJsonLength, "Observability model metadata");
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

function validateSchedules(schedules: readonly ObservationSchedule[]): void {
  for (const schedule of schedules) {
    if (schedule.scheduleType === "fixedInterval" && !schedule.intervalTicks) {
      throw new SimulationValidationError(`Observation schedule ${schedule.id} with fixedInterval requires positive intervalTicks`);
    }
    if (schedule.scheduleType === "specificTicks") {
      if (!schedule.ticks || schedule.ticks.length === 0) {
        throw new SimulationValidationError(`Observation schedule ${schedule.id} with specificTicks requires ticks`);
      }
      const seen = new Set<number>();
      for (const tick of schedule.ticks) {
        if (seen.has(tick)) {
          throw new SimulationValidationError(`Observation schedule ${schedule.id} has duplicate tick ${tick}`);
        }
        seen.add(tick);
      }
    }
  }
}

function validateReferences(model: ObservabilityModel): void {
  const variableIds = new Set(model.variables.map((variable) => variable.id));
  const scheduleIds = new Set((model.schedules ?? []).map((schedule) => schedule.id));
  const processIds = new Set((model.measurementProcesses ?? []).map((process) => process.id));
  for (const measurement of model.measurements ?? []) {
    if (!variableIds.has(measurement.variableId)) {
      throw new SimulationValidationError(`Measurement ${measurement.id} references unknown variableId: ${measurement.variableId}`);
    }
    if (measurement.scheduleId && !scheduleIds.has(measurement.scheduleId)) {
      throw new SimulationValidationError(`Measurement ${measurement.id} references unknown scheduleId: ${measurement.scheduleId}`);
    }
    if (measurement.processId && !processIds.has(measurement.processId)) {
      throw new SimulationValidationError(`Measurement ${measurement.id} references unknown processId: ${measurement.processId}`);
    }
  }
}

export function assertObservabilityJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainObservabilityJson(value: unknown, label: string): void {
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
      if (forbiddenObservabilityKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not contain live-state, executable-shaped, calibration, or external-data key ${key}`);
      }
      stack.push(child);
    }
  }
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
