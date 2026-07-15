import { z } from "zod";
import { SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { ParameterValues, SimulationRunConfig, SimulationTemplate } from "../kernel/types";
import { runConfigFromScenario, validateRunConfig } from "../runs/runConfig";
import { synchronizeVariantOptionsWithParameters } from "../scenarios/scenarioVariantTypes";
import type { AuthoredScenario } from "../scenarios/scenarioTypes";
import { getProductionTemplate } from "../templates/registry";
import {
  ephemeralLandscapePreviewCapabilities,
  getEphemeralLandscapePreviewCapability,
  getEphemeralLandscapePreviewMetric,
  getEphemeralLandscapePreviewParameter,
  getEphemeralLandscapePreviewScenario
} from "./capabilities";
import {
  defaultEphemeralPreviewSeeds,
  ephemeralLandscapePreviewCapabilityVersion,
  ephemeralLandscapePreviewRequestArtifactType,
  maxEphemeralPreviewAxisPoints,
  maxEphemeralPreviewGridPoints,
  maxEphemeralPreviewSeed,
  maxEphemeralPreviewSeeds,
  maxEphemeralPreviewTickHorizon,
  maxEphemeralPreviewWorkUnits,
  minEphemeralPreviewAxisPoints,
  minEphemeralPreviewSeed,
  minEphemeralPreviewSeeds,
  minEphemeralPreviewTickHorizon,
  type EphemeralLandscapePreviewConfigurationInput,
  type EphemeralLandscapePreviewRequest,
  type PreviewAxis,
  type PreviewAxisInput,
  type PreviewNumericParameterType,
  type PreviewPlannedRun,
  type PreviewSampleCoordinate,
  type PreviewValidationIssue,
  type PreviewValidationOutcome
} from "./types";

const canonicalNumberDecimals = 8;

const axisInputSchema = z
  .object({
    parameterId: z.string(),
    minimum: z.number().finite(),
    maximum: z.number().finite(),
    pointCount: z.number().int()
  })
  .strict();

const configurationInputSchema = z
  .object({
    templateId: z.string(),
    scenarioId: z.string(),
    xAxis: axisInputSchema,
    yAxis: axisInputSchema.optional(),
    seeds: z.array(z.number().int()),
    tickHorizon: z.number().int(),
    metricId: z.string()
  })
  .strict();

const previewAxisSchema = axisInputSchema
  .extend({
    parameterType: z.enum(["number", "integer"]),
    values: z.array(z.number().finite())
  })
  .strict();

const previewRequestSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(ephemeralLandscapePreviewRequestArtifactType),
    capabilityVersion: z.literal(ephemeralLandscapePreviewCapabilityVersion),
    templateId: z.string().min(1),
    scenarioId: z.string().min(1),
    xAxis: previewAxisSchema,
    yAxis: previewAxisSchema.optional(),
    seeds: z.array(z.number().int()),
    tickHorizon: z.number().int(),
    metricId: z.string().min(1),
    observation: z.literal("finalTick"),
    fixedParameters: z.record(jsonValueSchema),
    workEstimate: z
      .object({
        gridPointCount: z.number().int(),
        sampleRunCount: z.number().int(),
        tickHorizon: z.number().int(),
        workUnits: z.number().int(),
        maximumWorkUnits: z.literal(maxEphemeralPreviewWorkUnits)
      })
      .strict()
  })
  .strict();

export class PreviewConfigurationValidationError extends SimulationValidationError {
  readonly issues: readonly PreviewValidationIssue[];

  constructor(issues: readonly PreviewValidationIssue[]) {
    super(issues[0]?.message ?? "Invalid ephemeral landscape preview configuration");
    this.name = "PreviewConfigurationValidationError";
    this.issues = issues;
  }
}

export function createEphemeralLandscapePreviewRequest(
  input: EphemeralLandscapePreviewConfigurationInput
): EphemeralLandscapePreviewRequest {
  const parsed = configurationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new PreviewConfigurationValidationError(zodIssues(parsed.error));
  }
  return buildRequest(parsed.data);
}

export function safeCreateEphemeralLandscapePreviewRequest(
  input: EphemeralLandscapePreviewConfigurationInput
): PreviewValidationOutcome {
  try {
    return { request: createEphemeralLandscapePreviewRequest(input), issues: [] };
  } catch (error) {
    if (error instanceof PreviewConfigurationValidationError) {
      return { request: null, issues: error.issues };
    }
    return {
      request: null,
      issues: [{ path: "configuration", message: userMessage(error) }]
    };
  }
}

export function validateEphemeralLandscapePreviewRequest(value: unknown): EphemeralLandscapePreviewRequest {
  const parsed = previewRequestSchema.safeParse(value);
  if (!parsed.success) {
    throw new PreviewConfigurationValidationError(zodIssues(parsed.error));
  }

  const expected = buildRequest({
    templateId: parsed.data.templateId,
    scenarioId: parsed.data.scenarioId,
    xAxis: axisInputFromAxis(parsed.data.xAxis),
    ...(parsed.data.yAxis ? { yAxis: axisInputFromAxis(parsed.data.yAxis) } : {}),
    seeds: parsed.data.seeds,
    tickHorizon: parsed.data.tickHorizon,
    metricId: parsed.data.metricId
  });

  if (stableSerialize(parsed.data) !== stableSerialize(expected)) {
    throw new PreviewConfigurationValidationError([
      {
        path: "request",
        message: "Preview request must match the canonical supported axis values, fixed parameters, and work estimate."
      }
    ]);
  }
  return expected;
}

export function buildEphemeralLandscapePreviewRunPlans(
  requestValue: EphemeralLandscapePreviewRequest
): readonly PreviewPlannedRun[] {
  const request = validateEphemeralLandscapePreviewRequest(requestValue);
  const scenario = requireScenario(request.templateId, request.scenarioId);
  return buildRunPlansUnchecked(request, scenario);
}

export function generateEphemeralPreviewAxisValues(
  minimum: number,
  maximum: number,
  pointCount: number,
  parameterType: PreviewNumericParameterType
): readonly number[] {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
    throw new SimulationValidationError("Axis minimum and maximum must be finite numbers.");
  }
  if (minimum >= maximum) {
    throw new SimulationValidationError("Axis minimum must be less than its maximum.");
  }
  if (!Number.isInteger(pointCount) || pointCount < minEphemeralPreviewAxisPoints || pointCount > maxEphemeralPreviewAxisPoints) {
    throw new SimulationValidationError(
      `Axis point count must be an integer from ${minEphemeralPreviewAxisPoints} to ${maxEphemeralPreviewAxisPoints}.`
    );
  }
  if (parameterType === "integer" && (!Number.isInteger(minimum) || !Number.isInteger(maximum))) {
    throw new SimulationValidationError("Integer axes require integer minimum and maximum values.");
  }

  const values = Array.from({ length: pointCount }, (_, index) => {
    if (index === 0) {
      return canonicalPreviewNumber(minimum);
    }
    if (index === pointCount - 1) {
      return canonicalPreviewNumber(maximum);
    }
    const raw = minimum + ((maximum - minimum) * index) / (pointCount - 1);
    return parameterType === "integer" ? Math.round(raw) : canonicalPreviewNumber(raw);
  });

  if (new Set(values).size !== values.length) {
    throw new SimulationValidationError(
      "Generated axis values are not unique after numeric normalization. Increase the range or reduce the point count."
    );
  }
  return values;
}

export function canonicalPreviewNumber(value: number): number {
  const canonical = Number(value.toFixed(canonicalNumberDecimals));
  return Object.is(canonical, -0) ? 0 : canonical;
}

export function formatEphemeralPreviewNumber(value: number, precision = canonicalNumberDecimals): string {
  if (!Number.isFinite(value)) {
    return "Unavailable";
  }
  const boundedPrecision = Math.max(0, Math.min(canonicalNumberDecimals, Math.trunc(precision)));
  const fixed = canonicalPreviewNumber(value).toFixed(boundedPrecision);
  return fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
}

export function ephemeralLandscapePreviewRequestsEqual(
  left: EphemeralLandscapePreviewRequest,
  right: EphemeralLandscapePreviewRequest
): boolean {
  return stableSerialize(left) === stableSerialize(right);
}

export function defaultEphemeralLandscapePreviewConfiguration(): EphemeralLandscapePreviewConfigurationInput {
  const capability = ephemeralLandscapePreviewCapabilities[0]!;
  return {
    templateId: capability.templateId,
    scenarioId: capability.scenario.id,
    xAxis: { parameterId: "", minimum: 0, maximum: 1, pointCount: 3 },
    seeds: [...defaultEphemeralPreviewSeeds],
    tickHorizon: 50,
    metricId: ""
  };
}

function buildRequest(input: EphemeralLandscapePreviewConfigurationInput): EphemeralLandscapePreviewRequest {
  const issues: PreviewValidationIssue[] = [];
  const capability = getEphemeralLandscapePreviewCapability(input.templateId);
  const template = getProductionTemplate(input.templateId);

  if (!capability) {
    issues.push({ path: "templateId", message: "Select a template with explicit ephemeral-preview support." });
  }
  if (!template) {
    issues.push({ path: "templateId", message: "The selected template does not have an implemented production runtime." });
  }
  if (capability && template) {
    auditCapabilityAgainstRuntime(capability.templateVersion, capability.parameters, capability.metrics, template, issues);
  }

  const scenario = capability ? getEphemeralLandscapePreviewScenario(input.templateId, input.scenarioId) : undefined;
  if (!scenario) {
    issues.push({ path: "scenarioId", message: "Select the implemented preview scenario belonging to this template." });
  }

  const xAxis = capability ? resolveAxis("xAxis", input.xAxis, capability, template, issues) : undefined;
  const yAxis = capability && input.yAxis ? resolveAxis("yAxis", input.yAxis, capability, template, issues) : undefined;
  if (input.yAxis && input.xAxis.parameterId && input.xAxis.parameterId === input.yAxis.parameterId) {
    issues.push({ path: "yAxis.parameterId", message: "X and Y axes must use different parameters." });
  }

  const metric = capability ? getEphemeralLandscapePreviewMetric(capability, input.metricId) : undefined;
  if (!metric) {
    issues.push({ path: "metricId", message: "Select one explicitly supported numeric runtime metric." });
  } else if (template) {
    const definition = template.metricDefinitions?.find((candidate) => candidate.key === metric.id);
    if (!definition || (definition.valueType !== "number" && definition.valueType !== "integer")) {
      issues.push({ path: "metricId", message: "The selected metric is not an implemented numeric metric for this template." });
    }
  }

  validateSeeds(input.seeds, issues);
  if (
    !Number.isInteger(input.tickHorizon) ||
    input.tickHorizon < minEphemeralPreviewTickHorizon ||
    input.tickHorizon > maxEphemeralPreviewTickHorizon
  ) {
    issues.push({
      path: "tickHorizon",
      message: `Tick horizon must be an integer from ${minEphemeralPreviewTickHorizon} to ${maxEphemeralPreviewTickHorizon}.`
    });
  }

  if (issues.length > 0 || !capability || !template || !scenario || !xAxis || !metric) {
    throw new PreviewConfigurationValidationError(issues);
  }

  const axisIds = new Set([xAxis.parameterId, ...(yAxis ? [yAxis.parameterId] : [])]);
  const fixedParameters = Object.fromEntries(
    Object.entries(scenario.parameters)
      .filter(([parameterId]) => !axisIds.has(parameterId))
      .sort(([left], [right]) => left.localeCompare(right))
  ) as ParameterValues;
  const canonicalSeeds = input.seeds
    .map((seed) => (Object.is(seed, -0) ? 0 : seed))
    .sort((left, right) => left - right);
  const gridPointCount = xAxis.values.length * (yAxis?.values.length ?? 1);
  const sampleRunCount = gridPointCount * canonicalSeeds.length;
  const workUnits = sampleRunCount * input.tickHorizon;
  if (gridPointCount > maxEphemeralPreviewGridPoints) {
    issues.push({ path: "workEstimate.gridPointCount", message: `Preview grid must not exceed ${maxEphemeralPreviewGridPoints} points.` });
  }
  if (workUnits > maxEphemeralPreviewWorkUnits) {
    issues.push({
      path: "workEstimate.workUnits",
      message: `Preview request uses ${workUnits} work units; the maximum is ${maxEphemeralPreviewWorkUnits}.`
    });
  }
  if (issues.length > 0) {
    throw new PreviewConfigurationValidationError(issues);
  }

  const request: EphemeralLandscapePreviewRequest = {
    schemaVersion: "1",
    artifactType: ephemeralLandscapePreviewRequestArtifactType,
    capabilityVersion: ephemeralLandscapePreviewCapabilityVersion,
    templateId: capability.templateId,
    scenarioId: scenario.scenarioId,
    xAxis,
    ...(yAxis ? { yAxis } : {}),
    seeds: canonicalSeeds,
    tickHorizon: input.tickHorizon,
    metricId: metric.id,
    observation: "finalTick",
    fixedParameters,
    workEstimate: {
      gridPointCount,
      sampleRunCount,
      tickHorizon: input.tickHorizon,
      workUnits,
      maximumWorkUnits: maxEphemeralPreviewWorkUnits
    }
  };

  const runConfigIssues = validateGeneratedRunConfigs(request, scenario);
  if (runConfigIssues.length > 0) {
    throw new PreviewConfigurationValidationError(runConfigIssues);
  }
  return request;
}

function resolveAxis(
  path: "xAxis" | "yAxis",
  axis: PreviewAxisInput,
  capability: NonNullable<ReturnType<typeof getEphemeralLandscapePreviewCapability>>,
  template: SimulationTemplate | undefined,
  issues: PreviewValidationIssue[]
): PreviewAxis | undefined {
  const parameter = getEphemeralLandscapePreviewParameter(capability, axis.parameterId);
  if (!parameter) {
    issues.push({ path: `${path}.parameterId`, message: `Select a supported numeric ${path === "xAxis" ? "X" : "Y"}-axis parameter.` });
    return undefined;
  }
  const definition = template?.parameterDefinitions.find((candidate) => candidate.key === parameter.id);
  if (!definition || (definition.type !== "number" && definition.type !== "integer") || definition.type !== parameter.type) {
    issues.push({ path: `${path}.parameterId`, message: "The selected parameter no longer matches the implemented runtime definition." });
    return undefined;
  }
  if (axis.minimum < parameter.minimum || axis.minimum > parameter.maximum) {
    issues.push({
      path: `${path}.minimum`,
      message: `${parameter.label} minimum must be from ${parameter.minimum} to ${parameter.maximum}.`
    });
  }
  if (axis.maximum < parameter.minimum || axis.maximum > parameter.maximum) {
    issues.push({
      path: `${path}.maximum`,
      message: `${parameter.label} maximum must be from ${parameter.minimum} to ${parameter.maximum}.`
    });
  }
  let values: readonly number[] | undefined;
  try {
    values = generateEphemeralPreviewAxisValues(axis.minimum, axis.maximum, axis.pointCount, parameter.type);
  } catch (error) {
    issues.push({ path, message: userMessage(error) });
  }
  if (!values) {
    return undefined;
  }
  return {
    parameterId: parameter.id,
    parameterType: parameter.type,
    minimum: canonicalPreviewNumber(axis.minimum),
    maximum: canonicalPreviewNumber(axis.maximum),
    pointCount: axis.pointCount,
    values
  };
}

function validateSeeds(seeds: readonly number[], issues: PreviewValidationIssue[]): void {
  if (seeds.length < minEphemeralPreviewSeeds || seeds.length > maxEphemeralPreviewSeeds) {
    issues.push({ path: "seeds", message: `Provide from ${minEphemeralPreviewSeeds} to ${maxEphemeralPreviewSeeds} explicit integer seeds.` });
    return;
  }
  if (new Set(seeds).size !== seeds.length) {
    issues.push({ path: "seeds", message: "Duplicate seeds are not allowed." });
  }
  seeds.forEach((seed, index) => {
    if (!Number.isSafeInteger(seed) || seed < minEphemeralPreviewSeed || seed > maxEphemeralPreviewSeed) {
      issues.push({
        path: `seeds.${index}`,
        message: `Seed ${index + 1} must be an integer from ${minEphemeralPreviewSeed} to ${maxEphemeralPreviewSeed}.`
      });
    }
  });
}

function auditCapabilityAgainstRuntime(
  templateVersion: string,
  parameters: readonly { id: string; type: PreviewNumericParameterType; minimum: number; maximum: number }[],
  metrics: readonly { id: string }[],
  template: SimulationTemplate,
  issues: PreviewValidationIssue[]
): void {
  if (template.version !== templateVersion) {
    issues.push({ path: "templateId", message: "Preview capability version does not match the implemented template version." });
  }
  for (const parameter of parameters) {
    const definition = template.parameterDefinitions.find((candidate) => candidate.key === parameter.id);
    if (
      !definition ||
      definition.type !== parameter.type ||
      (definition.min !== undefined && parameter.minimum < definition.min) ||
      (definition.max !== undefined && parameter.maximum > definition.max)
    ) {
      issues.push({ path: "templateId", message: `Preview parameter capability ${parameter.id} is inconsistent with the runtime template.` });
    }
  }
  for (const metric of metrics) {
    const definition = template.metricDefinitions?.find((candidate) => candidate.key === metric.id);
    if (!definition || (definition.valueType !== "number" && definition.valueType !== "integer")) {
      issues.push({ path: "templateId", message: `Preview metric capability ${metric.id} is inconsistent with the runtime template.` });
    }
  }
}

function validateGeneratedRunConfigs(request: EphemeralLandscapePreviewRequest, scenario: AuthoredScenario): PreviewValidationIssue[] {
  try {
    buildRunPlansUnchecked(request, scenario);
    return [];
  } catch (error) {
    return [{ path: "configuration", message: `Generated preview run configuration is invalid: ${userMessage(error)}` }];
  }
}

function buildRunPlansUnchecked(
  request: EphemeralLandscapePreviewRequest,
  scenario: AuthoredScenario
): readonly PreviewPlannedRun[] {
  const template = requireTemplate(request.templateId);
  const coordinates = buildCoordinates(request);
  const plans: PreviewPlannedRun[] = [];

  coordinates.forEach((coordinate, pointIndex) => {
    const pointId = `point-${String(pointIndex + 1).padStart(2, "0")}`;
    request.seeds.forEach((seed) => {
      const runId = `sample-${String(plans.length + 1).padStart(3, "0")}`;
      plans.push({
        runId,
        pointId,
        coordinate,
        seed,
        runConfig: assembleRunConfig(request, scenario, template, coordinate, seed, pointId, runId)
      });
    });
  });
  return plans;
}

function buildCoordinates(request: EphemeralLandscapePreviewRequest): readonly PreviewSampleCoordinate[] {
  const coordinates: PreviewSampleCoordinate[] = [];
  const yValues = request.yAxis?.values ?? [undefined];
  for (const yValue of yValues) {
    for (const xValue of request.xAxis.values) {
      coordinates.push({
        x: { parameterId: request.xAxis.parameterId, value: xValue },
        ...(request.yAxis && yValue !== undefined
          ? { y: { parameterId: request.yAxis.parameterId, value: yValue } }
          : {})
      });
    }
  }
  return coordinates;
}

function assembleRunConfig(
  request: EphemeralLandscapePreviewRequest,
  scenario: AuthoredScenario,
  template: SimulationTemplate,
  coordinate: PreviewSampleCoordinate,
  seed: number,
  pointId: string,
  runId: string
): SimulationRunConfig {
  const base = runConfigFromScenario(scenario);
  const parameters: ParameterValues = {
    ...request.fixedParameters,
    [coordinate.x.parameterId]: coordinate.x.value,
    ...(coordinate.y ? { [coordinate.y.parameterId]: coordinate.y.value } : {})
  };
  const synchronized = synchronizeVariantOptionsWithParameters(
    template,
    {
      agentComposition: base.agentComposition ?? {},
      environmentOptions: base.environmentOptions ?? {}
    },
    parameters
  );

  return validateRunConfig(
    {
      ...base,
      seed: String(seed),
      parameters,
      agentComposition: synchronized.agentComposition,
      environmentOptions: synchronized.environmentOptions,
      metadata: {
        ...(base.metadata ?? {}),
        atlasEphemeralPreview: {
          capabilityVersion: request.capabilityVersion,
          observation: request.observation,
          metricId: request.metricId,
          pointId,
          runId
        }
      }
    },
    template
  );
}

function requireTemplate(templateId: string): SimulationTemplate {
  const template = getProductionTemplate(templateId);
  if (!template) {
    throw new SimulationValidationError(`Unknown preview template: ${templateId}`);
  }
  return template;
}

function requireScenario(templateId: string, scenarioId: string): AuthoredScenario {
  const scenario = getEphemeralLandscapePreviewScenario(templateId, scenarioId);
  if (!scenario) {
    throw new SimulationValidationError(`Unknown preview scenario: ${scenarioId}`);
  }
  return scenario;
}

function axisInputFromAxis(axis: PreviewAxis): PreviewAxisInput {
  return {
    parameterId: axis.parameterId,
    minimum: axis.minimum,
    maximum: axis.maximum,
    pointCount: axis.pointCount
  };
}

function zodIssues(error: z.ZodError): PreviewValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "configuration",
    message: issue.message
  }));
}

function userMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 360 ? `${message.slice(0, 357)}...` : message;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${stableSerialize(child)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
