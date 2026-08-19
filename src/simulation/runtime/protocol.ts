import { z } from "zod";
import type { Command, SimulationRunConfig } from "../kernel/types";
import { performanceMeasureNames } from "../kernel/Performance";
import { jsonValueSchema, validateCommand } from "../kernel/Validation";
import type { InterventionRequest } from "../interventions/interventionTypes";
import { validateRunConfig } from "../runs/runConfig";
import {
  maxRenderFrameEntities,
  maxRuntimeArtifactJsonLength,
  maxRuntimeInterventionHistory,
  maxRuntimeMetricHistory,
  maxSelectedNeighborCount,
  type RenderFramePacket,
  type RuntimeArtifactKind,
  type RuntimeFailure,
  type UIProjection
} from "./types";
import { parseRuntimeArtifact } from "./artifacts";

const generationSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const requestIdSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const commandIdSchema = requestIdSchema;
const publicationIdSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const runIdSchema = z.string().min(1).max(128).regex(/^[a-zA-Z0-9._:-]+$/);
const entityIdSchema = z.string().regex(/^e\d{1,10}$/).max(16);
const finiteNonNegativeSchema = z.number().finite().nonnegative();
const boundedCounterSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const speedMultiplierSchema = z.number().finite().min(0.25).max(8);
const artifactKindSchema = z.enum(["scenario", "snapshot"]);
const artifactJsonSchema = z.string().min(1).max(maxRuntimeArtifactJsonLength);
const typedArray = <T>(constructor: { new (...args: any[]): T }) => z.custom<T>((value) => value instanceof constructor);

const identityShape = {
  generation: generationSchema,
  runId: runIdSchema
};

const initializeSchema = z.object({
  type: z.literal("runtime.initialize"),
  requestId: requestIdSchema,
  ...identityShape,
  runConfig: z.unknown(),
  instrumentation: z.boolean().optional()
}).strict();

const replaceSchema = initializeSchema.extend({ type: z.literal("runtime.replace") }).strict();
const resetSchema = z.object({
  type: z.literal("runtime.reset"),
  requestId: requestIdSchema,
  ...identityShape
}).strict();
const generationCommandShape = { generation: generationSchema };
const playSchema = z.object({ type: z.literal("runtime.play"), commandId: commandIdSchema, ...generationCommandShape }).strict();
const pauseSchema = z.object({ type: z.literal("runtime.pause"), commandId: commandIdSchema, ...generationCommandShape }).strict();
const stepSchema = z.object({ type: z.literal("runtime.step"), requestId: requestIdSchema, ...generationCommandShape }).strict();
const applyCommandsSchema = z.object({
  type: z.literal("runtime.applyCommands"),
  requestId: requestIdSchema,
  ...generationCommandShape,
  commands: z.array(z.unknown()).max(1_000)
}).strict();
const speedSchema = z.object({
  type: z.literal("runtime.speed"),
  commandId: commandIdSchema,
  ...generationCommandShape,
  value: speedMultiplierSchema
}).strict();
const interventionTargetSchema = z.object({
  entityId: entityIdSchema.optional(),
  point: z.object({ x: z.number().finite(), y: z.number().finite() }).strict().optional(),
  gridCell: z.object({ row: z.number().int(), col: z.number().int() }).strict().optional()
}).strict();
const interventionRequestSchema = z.object({
  templateId: z.string().min(1).max(100),
  interventionId: z.string().min(1).max(100),
  parameters: z.record(jsonValueSchema).optional(),
  target: interventionTargetSchema.optional()
}).strict();
const applyInterventionSchema = z.object({
  type: z.literal("runtime.applyIntervention"),
  requestId: requestIdSchema,
  ...generationCommandShape,
  intervention: interventionRequestSchema
}).strict();
const clearInterventionsSchema = z.object({
  type: z.literal("runtime.clearInterventions"),
  requestId: requestIdSchema,
  ...generationCommandShape
}).strict();
const exportArtifactSchema = z.object({
  type: z.literal("runtime.exportArtifact"),
  requestId: requestIdSchema,
  ...generationCommandShape,
  kind: artifactKindSchema
}).strict();
const importArtifactSchema = z.object({
  type: z.literal("runtime.importArtifact"),
  requestId: requestIdSchema,
  ...identityShape,
  kind: artifactKindSchema,
  json: artifactJsonSchema
}).strict();
const selectionSchema = z.object({
  type: z.literal("runtime.selection"),
  commandId: commandIdSchema,
  ...generationCommandShape,
  entityId: entityIdSchema.nullable()
}).strict();
const resetPerformanceSchema = z.object({
  type: z.literal("runtime.resetPerformance"),
  commandId: commandIdSchema,
  ...generationCommandShape
}).strict();
const frameConsumedSchema = z.object({
  type: z.literal("runtime.frameConsumed"),
  ...generationCommandShape,
  publicationId: publicationIdSchema
}).strict();
const uiConsumedSchema = z.object({
  type: z.literal("runtime.uiConsumed"),
  ...generationCommandShape,
  revision: publicationIdSchema
}).strict();
const disposeSchema = z.object({ type: z.literal("runtime.dispose"), ...generationCommandShape }).strict();

const workerRequestSchema = z.discriminatedUnion("type", [
  initializeSchema,
  replaceSchema,
  resetSchema,
  playSchema,
  pauseSchema,
  stepSchema,
  applyCommandsSchema,
  speedSchema,
  applyInterventionSchema,
  clearInterventionsSchema,
  exportArtifactSchema,
  importArtifactSchema,
  selectionSchema,
  resetPerformanceSchema,
  frameConsumedSchema,
  uiConsumedSchema,
  disposeSchema
]);

export type RuntimeWorkerRequest =
  | { type: "runtime.initialize" | "runtime.replace"; requestId: number; generation: number; runId: string; runConfig: SimulationRunConfig; instrumentation?: boolean }
  | { type: "runtime.reset"; requestId: number; generation: number; runId: string }
  | { type: "runtime.play" | "runtime.pause" | "runtime.resetPerformance"; commandId: number; generation: number }
  | { type: "runtime.speed"; commandId: number; generation: number; value: number }
  | { type: "runtime.dispose"; generation: number }
  | { type: "runtime.step"; requestId: number; generation: number }
  | { type: "runtime.applyCommands"; requestId: number; generation: number; commands: readonly Command[] }
  | { type: "runtime.applyIntervention"; requestId: number; generation: number; intervention: InterventionRequest }
  | { type: "runtime.clearInterventions"; requestId: number; generation: number }
  | { type: "runtime.exportArtifact"; requestId: number; generation: number; kind: RuntimeArtifactKind }
  | { type: "runtime.importArtifact"; requestId: number; generation: number; runId: string; kind: RuntimeArtifactKind; json: string }
  | { type: "runtime.selection"; commandId: number; generation: number; entityId: string | null }
  | { type: "runtime.frameConsumed"; generation: number; publicationId: number }
  | { type: "runtime.uiConsumed"; generation: number; revision: number };

export function parseRuntimeWorkerRequest(value: unknown): RuntimeWorkerRequest {
  const parsed = workerRequestSchema.parse(value);
  if (parsed.type === "runtime.initialize" || parsed.type === "runtime.replace") {
    return {
      ...parsed,
      runConfig: validateRunConfig(parsed.runConfig as SimulationRunConfig)
    };
  }
  if (parsed.type === "runtime.applyCommands") {
    return {
      ...parsed,
      commands: parsed.commands.map((command) => validateCommand(command as Command))
    };
  }
  if (parsed.type === "runtime.importArtifact") {
    validateRuntimeArtifactJson(parsed.kind, parsed.json);
  }
  return parsed;
}

export function validateRuntimeArtifactJson(kind: RuntimeArtifactKind, json: string): void {
  artifactJsonSchema.parse(json);
  const artifact = parseRuntimeArtifact(kind, json);
  if (artifact.templateId !== "flocking-boids") {
    throw new Error(`Worker runtime artifact support is limited to flocking-boids, not ${artifact.templateId}`);
  }
}

const workerRequestFailureContextSchema = z.object({
  generation: generationSchema,
  runId: runIdSchema.optional(),
  requestId: requestIdSchema.optional(),
  commandId: commandIdSchema.optional()
}).passthrough();

export function parseRuntimeWorkerRequestFailureContext(value: unknown): {
  generation: number;
  runId?: string;
  requestId?: number;
  messageId?: number;
} | null {
  const parsed = workerRequestFailureContextSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  return {
    generation: parsed.data.generation,
    ...(parsed.data.runId !== undefined ? { runId: parsed.data.runId } : {}),
    ...(parsed.data.requestId !== undefined ? { requestId: parsed.data.requestId } : {}),
    ...(parsed.data.requestId !== undefined || parsed.data.commandId !== undefined
      ? { messageId: parsed.data.requestId ?? parsed.data.commandId }
      : {})
  };
}

const selectedDetailSchema = z.object({
  entityId: z.number().int().positive().max(0xffff_ffff),
  neighborIds: typedArray(Uint32Array),
  neighborOffsets: typedArray(Float32Array),
  neighborDistances: typedArray(Float32Array)
}).strict();

const renderFrameSchema = z.object({
  schemaVersion: z.literal("1"),
  projectionKind: z.literal("flocking-v1"),
  publicationId: publicationIdSchema,
  templateId: z.string().min(1).max(100),
  ...identityShape,
  tick: z.number().int().nonnegative(),
  time: finiteNonNegativeSchema,
  entityCount: z.number().int().nonnegative().max(maxRenderFrameEntities),
  entityIds: typedArray(Uint32Array),
  positions: typedArray(Float32Array),
  velocities: typedArray(Float32Array),
  neighborCounts: typedArray(Uint16Array),
  groupCodes: typedArray(Uint8Array),
  worldWidth: z.number().finite().positive(),
  worldHeight: z.number().finite().positive(),
  boundaryMode: z.enum(["wrap", "bounce", "clamp"]),
  perceptionRadius: finiteNonNegativeSchema,
  alignment: z.number().finite().nullable(),
  runtimeSignature: z.string().min(1).max(100),
  selectedDetail: selectedDetailSchema.optional()
}).strict().superRefine((frame, context) => {
  const count = frame.entityCount;
  const expectedLengths: Array<[string, number, number]> = [
    ["entityIds", frame.entityIds.length, count],
    ["positions", frame.positions.length, count * 2],
    ["velocities", frame.velocities.length, count * 2],
    ["neighborCounts", frame.neighborCounts.length, count],
    ["groupCodes", frame.groupCodes.length, count]
  ];
  for (const [field, actual, expected] of expectedLengths) {
    if (actual !== expected) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${field} length must be ${expected}` });
    }
  }
  if (frame.selectedDetail) {
    const neighborCount = frame.selectedDetail.neighborIds.length;
    if (neighborCount > maxSelectedNeighborCount) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["selectedDetail", "neighborIds"], message: "Selected neighbor detail exceeds its bound" });
    }
    if (frame.selectedDetail.neighborDistances.length !== neighborCount || frame.selectedDetail.neighborOffsets.length !== neighborCount * 2) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["selectedDetail"], message: "Selected neighbor arrays have inconsistent lengths" });
    }
  }
});

const performanceMeasureSchema = z.object({
  name: z.enum(performanceMeasureNames),
  count: z.number().int().positive().max(5_000),
  medianMs: finiteNonNegativeSchema,
  p95Ms: finiteNonNegativeSchema,
  maxMs: finiteNonNegativeSchema,
  totalMs: finiteNonNegativeSchema
}).strict();

const publicationStatsSchema = z.object({
  ticksSimulated: boundedCounterSchema,
  framesProjected: boundedCounterSchema,
  framesPublished: boundedCounterSchema,
  framesCoalesced: boundedCounterSchema,
  uiProjected: boundedCounterSchema,
  uiPublished: boundedCounterSchema,
  uiCoalesced: boundedCounterSchema
}).strict();

const selectedUISchema = z.object({
  entityId: z.number().int().positive().max(0xffff_ffff),
  label: z.string().min(1).max(100),
  x: z.number().finite(),
  y: z.number().finite(),
  velocityX: z.number().finite(),
  velocityY: z.number().finite(),
  speed: finiteNonNegativeSchema,
  headingDegrees: finiteNonNegativeSchema.max(360),
  neighborCount: z.number().int().nonnegative().max(0xffff),
  localDensity: finiteNonNegativeSchema,
  currentProximityCount: z.number().int().nonnegative().max(maxSelectedNeighborCount).nullable()
}).strict();

const metricRecordSchema = z.object({
  tick: z.number().int().nonnegative(),
  time: finiteNonNegativeSchema,
  values: z.record(z.number().finite()).superRefine((values, context) => {
    if (Object.keys(values).length > 64) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Runtime metric records may contain at most 64 values" });
    }
  })
}).strict();

const interventionSummarySchema = z.object({
  id: z.string().min(1).max(160),
  interventionId: z.string().min(1).max(100),
  label: z.string().min(1).max(160),
  tickApplied: z.number().int().nonnegative(),
  targetSummary: z.string().min(1).max(360),
  status: z.enum(["applied", "failed"]),
  error: z.string().min(1).max(360).optional()
}).strict();

const uiProjectionSchema = z.object({
  schemaVersion: z.literal("1"),
  projectionKind: z.literal("flocking-v1"),
  revision: publicationIdSchema,
  templateId: z.string().min(1).max(100),
  ...identityShape,
  executionKind: z.enum(["local", "worker"]),
  tick: z.number().int().nonnegative(),
  time: finiteNonNegativeSchema,
  entityCount: z.number().int().nonnegative().max(maxRenderFrameEntities),
  playback: z.enum(["initializing", "paused", "running", "failed", "disposed"]),
  lastAdvanceKind: z.enum(["initialization", "run", "step", "command", "restore", "replacement"]),
  speedMultiplier: speedMultiplierSchema,
  alignment: z.number().finite().nullable(),
  runtimeSignature: z.string().min(1).max(100),
  selected: selectedUISchema.nullable(),
  warnings: z.array(z.string().max(240)).max(16),
  metricHistory: z.array(metricRecordSchema).max(maxRuntimeMetricHistory),
  metricRecordCount: boundedCounterSchema,
  interventions: z.array(interventionSummarySchema).max(maxRuntimeInterventionHistory),
  interventionCount: boundedCounterSchema,
  appliedInterventionCount: boundedCounterSchema,
  performance: z.object({
    measures: z.array(performanceMeasureSchema).max(performanceMeasureNames.length),
    publications: publicationStatsSchema
  }).strict()
}).strict().superRefine((projection, context) => {
  if (projection.metricHistory.length > projection.metricRecordCount) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Runtime metric tail cannot exceed its total record count" });
  }
  if (projection.interventions.length > projection.interventionCount) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Runtime intervention tail cannot exceed its total record count" });
  }
  if (projection.appliedInterventionCount > projection.interventionCount) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Applied intervention count cannot exceed total intervention count" });
  }
});

const failureSchema: z.ZodType<RuntimeFailure> = z.object({
  ...identityShape,
  code: z.enum(["initialization", "runtime", "protocol", "worker", "disposed"]),
  message: z.string().min(1).max(2_000),
  requestId: requestIdSchema.optional()
}).strict();

const workerResponseSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("runtime.frame"), frame: renderFrameSchema }).strict(),
  z.object({ type: z.literal("runtime.ui"), ui: uiProjectionSchema }).strict(),
  z.object({
    type: z.literal("runtime.complete"),
    requestId: requestIdSchema,
    generation: generationSchema,
    ui: uiProjectionSchema
  }).strict(),
  z.object({
    type: z.literal("runtime.artifact"),
    requestId: requestIdSchema,
    generation: generationSchema,
    kind: artifactKindSchema,
    json: artifactJsonSchema
  }).strict(),
  z.object({
    type: z.literal("runtime.messageConsumed"),
    messageId: requestIdSchema,
    generation: generationSchema
  }).strict(),
  z.object({ type: z.literal("runtime.failure"), failure: failureSchema }).strict()
]);

export type RuntimeWorkerResponse =
  | { type: "runtime.frame"; frame: RenderFramePacket }
  | { type: "runtime.ui"; ui: UIProjection }
  | { type: "runtime.complete"; requestId: number; generation: number; ui: UIProjection }
  | { type: "runtime.artifact"; requestId: number; generation: number; kind: RuntimeArtifactKind; json: string }
  | { type: "runtime.messageConsumed"; messageId: number; generation: number }
  | { type: "runtime.failure"; failure: RuntimeFailure };

export function parseRuntimeWorkerResponse(value: unknown): RuntimeWorkerResponse {
  const parsed = workerResponseSchema.parse(value) as RuntimeWorkerResponse;
  if (parsed.type === "runtime.complete" && parsed.ui.generation !== parsed.generation) {
    throw new Error("Runtime completion generation must match its UI projection generation");
  }
  return parsed;
}
