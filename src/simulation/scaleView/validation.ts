import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import { getScaleLevel, validateMultiScaleModel } from "../multiscale";
import type { MultiScaleModel } from "../multiscale/types";
import {
  maxScaleCameraZoom,
  maxScaleTransitionHistory,
  maxScaleViewMetadataJsonLength,
  maxScaleViewStateJsonLength,
  maxScaleViewWarningLength,
  maxScaleViewWarnings,
  scaleTransitionDirections,
  scaleTransitionTypes,
  scaleViewModes,
  scaleViewStateArtifactType,
  type ScaleTransition,
  type ScaleViewState
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const warningSchema = z.string().min(1).max(maxScaleViewWarningLength);

const cameraSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
    zoom: z.number().finite().positive().max(maxScaleCameraZoom),
    rotation: z.number().finite().optional()
  })
  .strict();

const transitionSchema: z.ZodType<ScaleTransition> = z
  .object({
    id: boundedString(180),
    fromScaleId: boundedString(160),
    toScaleId: boundedString(160),
    direction: z.enum(scaleTransitionDirections),
    transitionType: z.enum(scaleTransitionTypes),
    ruleId: boundedString(160).optional(),
    linkId: boundedString(160).optional(),
    available: z.boolean(),
    informationLossWarning: warningSchema.optional(),
    syntheticDetailWarning: warningSchema.optional(),
    unavailableReason: warningSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const scaleViewStateSchema: z.ZodType<ScaleViewState> = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(scaleViewStateArtifactType),
    id: boundedString(160),
    name: z.string().min(1).max(180).optional(),
    version: boundedString(80),
    scaleModelId: boundedString(160),
    currentScaleId: boundedString(160),
    viewMode: z.enum(scaleViewModes),
    camera: cameraSchema.optional(),
    selectedEntityTypeId: boundedString(160).optional(),
    selectedEntityId: boundedString(240).optional(),
    transitionHistory: z.array(transitionSchema).max(maxScaleTransitionHistory).optional(),
    warnings: z.array(warningSchema).max(maxScaleViewWarnings).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenScaleViewKeys = new Set([
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
  "scaleModel",
  "scaleLevels",
  "aggregationRules",
  "disaggregationRules",
  "crossScaleLinks",
  "formula",
  "formulas",
  "expression",
  "expressions",
  "equation",
  "equations",
  "code",
  "script",
  "functionBody"
]);

export function validateScaleViewState(value: unknown): ScaleViewState {
  assertPlainScaleViewJson(value, "Scale view state");
  const parsed = scaleViewStateSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid scale view state: ${formatZodIssue(parsed.error)}`);
  }
  const viewState = normalizeScaleViewState(parsed.data);
  assertScaleViewJsonBound(viewState, maxScaleViewStateJsonLength, "Scale view state");
  validateTransitionHistory(viewState.transitionHistory ?? []);
  validateMetadataBounds(viewState);
  return viewState;
}

export function validateScaleViewStateForModel(model: MultiScaleModel, value: unknown): ScaleViewState {
  const validModel = validateMultiScaleModel(model);
  const viewState = validateScaleViewState(value);
  if (viewState.scaleModelId !== validModel.id) {
    throw new SimulationValidationError(`Scale view state references scaleModelId ${viewState.scaleModelId}, expected ${validModel.id}`);
  }
  const currentScale = getScaleLevel(validModel, viewState.currentScaleId);
  if (!currentScale) {
    throw new SimulationValidationError(`Unknown currentScaleId: ${viewState.currentScaleId}`);
  }
  if (viewState.selectedEntityTypeId && !currentScale.entityTypes.some((entityType) => entityType.id === viewState.selectedEntityTypeId)) {
    throw new SimulationValidationError(`Unknown selectedEntityTypeId ${viewState.selectedEntityTypeId} for scale ${viewState.currentScaleId}`);
  }
  validateTransitionHistoryScaleRefs(validModel, viewState.transitionHistory ?? []);
  return viewState;
}

export function parseScaleViewStateJson(json: string | unknown): ScaleViewState {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxScaleViewStateJsonLength) {
      throw new SimulationSerializationError(`Scale view state JSON must be ${maxScaleViewStateJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid scale view state JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== scaleViewStateArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${scaleViewStateArtifactType}`);
  }
  return validateScaleViewState(raw);
}

export function normalizeScaleViewState(viewState: ScaleViewState): ScaleViewState {
  return {
    ...viewState,
    ...(viewState.camera ? { camera: { ...viewState.camera } } : {}),
    ...(viewState.transitionHistory ? { transitionHistory: viewState.transitionHistory.map((transition) => ({ ...transition })) } : {}),
    ...(viewState.warnings ? { warnings: [...viewState.warnings] } : {}),
    ...(viewState.metadata ? { metadata: JSON.parse(JSON.stringify(viewState.metadata)) as Record<string, JsonValue> } : {})
  };
}

function validateTransitionHistory(transitionHistory: readonly ScaleTransition[]): void {
  const ids = new Set<string>();
  for (const transition of transitionHistory) {
    if (ids.has(transition.id)) {
      throw new SimulationValidationError(`Duplicate transition history id: ${transition.id}`);
    }
    ids.add(transition.id);
    if (transition.metadata) {
      assertScaleViewJsonBound(transition.metadata, maxScaleViewMetadataJsonLength, `Transition ${transition.id} metadata`);
    }
  }
}

function validateTransitionHistoryScaleRefs(model: MultiScaleModel, transitionHistory: readonly ScaleTransition[]): void {
  const scaleIds = new Set(model.scaleLevels.map((level) => level.id));
  for (const transition of transitionHistory) {
    if (!scaleIds.has(transition.fromScaleId)) {
      throw new SimulationValidationError(`Transition history ${transition.id} references unknown fromScaleId: ${transition.fromScaleId}`);
    }
    if (!scaleIds.has(transition.toScaleId)) {
      throw new SimulationValidationError(`Transition history ${transition.id} references unknown toScaleId: ${transition.toScaleId}`);
    }
  }
}

function validateMetadataBounds(viewState: ScaleViewState): void {
  if (viewState.metadata) {
    assertScaleViewJsonBound(viewState.metadata, maxScaleViewMetadataJsonLength, "Scale view state metadata");
  }
}

export function assertScaleViewJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainScaleViewJson(value: unknown, label: string): void {
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
      if (forbiddenScaleViewKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not contain live-state, model-definition, or executable-shaped key ${key}`);
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
