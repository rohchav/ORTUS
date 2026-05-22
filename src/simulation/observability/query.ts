import { validateObservabilityModel } from "./validation";
import type {
  MeasurementDefinition,
  MeasurementProcess,
  ObservableVariable,
  ObservabilityModel,
  ObservabilitySummary,
  ObservationSchedule
} from "./types";
import { maxObservabilityWarnings } from "./types";

export function listObservableVariables(model: ObservabilityModel): readonly ObservableVariable[] {
  return clone(
    validateObservabilityModel(model).variables.filter((variable) => variable.observability === "direct" || variable.observability === "indirect")
  );
}

export function listLatentVariables(model: ObservabilityModel): readonly ObservableVariable[] {
  return clone(validateObservabilityModel(model).variables.filter((variable) => variable.observability === "latent" || variable.variableKind === "latent"));
}

export function listUnobservedVariables(model: ObservabilityModel): readonly ObservableVariable[] {
  return clone(validateObservabilityModel(model).variables.filter((variable) => variable.observability === "unobserved"));
}

export function getObservableVariable(model: ObservabilityModel, variableId: string): ObservableVariable | undefined {
  const variable = validateObservabilityModel(model).variables.find((candidate) => candidate.id === variableId);
  return variable ? clone(variable) : undefined;
}

export function listMeasurements(model: ObservabilityModel): readonly MeasurementDefinition[] {
  return clone(validateObservabilityModel(model).measurements ?? []);
}

export function listActiveMeasurements(model: ObservabilityModel): readonly MeasurementDefinition[] {
  return clone((validateObservabilityModel(model).measurements ?? []).filter((measurement) => measurement.active));
}

export function getMeasurementsForVariable(model: ObservabilityModel, variableId: string): readonly MeasurementDefinition[] {
  return clone((validateObservabilityModel(model).measurements ?? []).filter((measurement) => measurement.variableId === variableId));
}

export function listEmpiricalMeasurements(model: ObservabilityModel): readonly MeasurementDefinition[] {
  return clone((validateObservabilityModel(model).measurements ?? []).filter((measurement) => measurement.sourceType === "empirical"));
}

export function listSyntheticMeasurements(model: ObservabilityModel): readonly MeasurementDefinition[] {
  return clone((validateObservabilityModel(model).measurements ?? []).filter((measurement) => measurement.sourceType === "synthetic"));
}

export function listModelOutputMeasurements(model: ObservabilityModel): readonly MeasurementDefinition[] {
  return clone((validateObservabilityModel(model).measurements ?? []).filter((measurement) => measurement.sourceType === "modelOutput"));
}

export function listObservationSchedules(model: ObservabilityModel): readonly ObservationSchedule[] {
  return clone(validateObservabilityModel(model).schedules ?? []);
}

export function getObservationSchedule(model: ObservabilityModel, scheduleId: string): ObservationSchedule | undefined {
  const schedule = validateObservabilityModel(model).schedules?.find((candidate) => candidate.id === scheduleId);
  return schedule ? clone(schedule) : undefined;
}

export function listMeasurementProcesses(model: ObservabilityModel): readonly MeasurementProcess[] {
  return clone(validateObservabilityModel(model).measurementProcesses ?? []);
}

export function getMeasurementProcess(model: ObservabilityModel, processId: string): MeasurementProcess | undefined {
  const process = validateObservabilityModel(model).measurementProcesses?.find((candidate) => candidate.id === processId);
  return process ? clone(process) : undefined;
}

export function modelHasEmpiricalMeasurements(model: ObservabilityModel): boolean {
  return (validateObservabilityModel(model).measurements ?? []).some((measurement) => measurement.sourceType === "empirical");
}

export function modelHasLatentVariables(model: ObservabilityModel): boolean {
  return validateObservabilityModel(model).variables.some((variable) => variable.observability === "latent" || variable.variableKind === "latent");
}

export function summarizeObservabilityModel(model: ObservabilityModel): ObservabilitySummary {
  const valid = validateObservabilityModel(model);
  const variables = valid.variables;
  const measurements = valid.measurements ?? [];
  return {
    id: valid.id,
    name: valid.name,
    variableCount: variables.length,
    directlyObservableCount: variables.filter((variable) => variable.observability === "direct").length,
    indirectlyObservableCount: variables.filter((variable) => variable.observability === "indirect").length,
    latentCount: variables.filter((variable) => variable.observability === "latent" || variable.variableKind === "latent").length,
    unobservedCount: variables.filter((variable) => variable.observability === "unobserved").length,
    measurementCount: measurements.length,
    activeMeasurementCount: measurements.filter((measurement) => measurement.active).length,
    empiricalMeasurementCount: measurements.filter((measurement) => measurement.sourceType === "empirical").length,
    syntheticMeasurementCount: measurements.filter((measurement) => measurement.sourceType === "synthetic").length,
    modelOutputMeasurementCount: measurements.filter((measurement) => measurement.sourceType === "modelOutput").length,
    scheduleCount: (valid.schedules ?? []).length,
    processCount: (valid.measurementProcesses ?? []).length,
    executableCount: 0,
    warnings: getObservabilityWarnings(valid)
  };
}

export function validateObservabilityModelForRuntime(model: ObservabilityModel) {
  const valid = validateObservabilityModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "An observability model defines how something could be measured; it does not collect, calibrate, or validate data.",
      ...getObservabilityWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "observability" as const,
        requiredSupportLevel: "runtime" as const,
        reason:
          "Observability V1 is structural only; current templates do not execute measurement schedules/processes, collect runtime observations, ingest external data, infer, calibrate, or assimilate data."
      }
    ]
  };
}

export function getObservabilityWarnings(model: ObservabilityModel): readonly string[] {
  const valid = validateObservabilityModel(model);
  const warnings: string[] = [];
  const variablesById = new Map(valid.variables.map((variable) => [variable.id, variable]));
  const schedules = valid.schedules ?? [];
  const processes = valid.measurementProcesses ?? [];

  for (const variable of valid.variables) {
    if (variable.targetPath && unsupportedTargetPath(variable.targetPath)) {
      warnings.push(`Variable ${variable.id} targetPath points into unsupported runtime/internal state; observability V1 is structural only.`);
    }
  }

  for (const measurement of valid.measurements ?? []) {
    const variable = variablesById.get(measurement.variableId);
    if (measurement.sourceType === "empirical" && !hasProvenanceNote(measurement.notes)) {
      warnings.push(`Empirical measurement ${measurement.id} has no provenance notes.`);
    }
    if (measurement.sourceType === "empirical") {
      warnings.push(`Empirical measurement ${measurement.id} is a source declaration, not evidence by itself.`);
    }
    if (measurement.sourceType === "synthetic" && !hasSyntheticNote(measurement.notes)) {
      warnings.push(`Synthetic measurement ${measurement.id} has no synthetic-detail notes.`);
    }
    if (measurement.measurementKind === "proxy" && !hasProxyExplanation(measurement.notes)) {
      warnings.push(`Proxy measurement ${measurement.id} has no proxy explanation.`);
    }
    if (isLatent(variable) && (measurement.measurementKind === "exact" || variable?.observability === "direct")) {
      warnings.push(`Latent variable ${measurement.variableId} has a direct/exact measurement declaration; this is structural, not proof of observability.`);
    }
    if (variable?.observability === "unobserved" && measurement.active) {
      warnings.push(`Unobserved variable ${measurement.variableId} has active measurement ${measurement.id}; active is structural only.`);
    }
    if (measurement.sourceType === "externalPlaceholder") {
      warnings.push(`Measurement ${measurement.id} uses externalPlaceholder; no external data ingestion is implemented.`);
    }
    if (measurement.active) {
      warnings.push(`Active measurement ${measurement.id} is a structural declaration, not runtime-executed observation collection.`);
    }
    if (variable?.unit && measurement.unit && variable.unit !== measurement.unit) {
      warnings.push(`Measurement ${measurement.id} unit ${measurement.unit} differs from variable ${variable.id} unit ${variable.unit}.`);
    }
  }

  for (const schedule of schedules) {
    if (schedule.scheduleType === "unknown") {
      warnings.push(`Observation schedule ${schedule.id} has unknown timing semantics.`);
    }
    if (schedule.scheduleType === "eventTriggered" && !schedule.eventDescription) {
      warnings.push(`Event-triggered observation schedule ${schedule.id} has no event description.`);
    }
  }

  for (const process of processes) {
    if (process.processType === "noise" && !process.noiseDescription) {
      warnings.push(`Measurement process ${process.id} declares noise without a noise description.`);
    }
    if (process.processType === "bias" && !process.biasDescription) {
      warnings.push(`Measurement process ${process.id} declares bias without a bias description.`);
    }
    if (process.processType === "missingness" && !process.missingnessDescription) {
      warnings.push(`Measurement process ${process.id} declares missingness without a missingness description.`);
    }
    if (process.processType === "sampling" && !process.samplingDescription) {
      warnings.push(`Measurement process ${process.id} declares sampling without a sampling description.`);
    }
    if (process.processType === "proxy" && !process.transformationDescription) {
      warnings.push(`Measurement process ${process.id} declares proxy transformation without a transformation description.`);
    }
  }

  if (valid.scope?.metadata && referencesReservedArtifact(valid.scope.metadata)) {
    warnings.push("Observability scope metadata references a reserved or unsupported artifact family; V1 remains structural only.");
  }

  return warnings.slice(0, maxObservabilityWarnings);
}

function isLatent(variable: ObservableVariable | undefined): boolean {
  return Boolean(variable && (variable.observability === "latent" || variable.variableKind === "latent"));
}

function hasProvenanceNote(notes: readonly string[] | undefined): boolean {
  return Boolean(notes?.some((note) => /provenance|source|measured|measurement|empirical/i.test(note)));
}

function hasSyntheticNote(notes: readonly string[] | undefined): boolean {
  return Boolean(notes?.some((note) => /synthetic|model-side|model output|generated/i.test(note)));
}

function hasProxyExplanation(notes: readonly string[] | undefined): boolean {
  return Boolean(notes?.some((note) => /proxy|represents|stand-in|surrogate|transform/i.test(note)));
}

function unsupportedTargetPath(targetPath: string): boolean {
  return /(^|\.)(world|snapshot|snapshots|entities|components|spaces|engine|activeEngine|runState|runSummary|runSummaries)(\.|$)/.test(targetPath);
}

function referencesReservedArtifact(metadata: Record<string, unknown>): boolean {
  const text = JSON.stringify(metadata);
  return /ortus\.(causalAssumptions|validationReport|modelDefinition|visualModel|traceReport|patternLibrary|domainPack)/.test(text);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
