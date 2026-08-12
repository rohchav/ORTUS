import { z } from "zod";
import type { Command, SimulationRunConfig } from "../kernel/types";
import { performanceMeasureNames } from "../kernel/Performance";
import { validateCommand } from "../kernel/Validation";
import { validateRunConfig } from "../runs/runConfig";
import {
  maxRenderFrameEntities,
  maxSelectedNeighborCount,
  type RenderFramePacket,
  type RuntimeFailure,
  type UIProjection
} from "./types";

const generationSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const requestIdSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const publicationIdSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const runIdSchema = z.string().min(1).max(128).regex(/^[a-zA-Z0-9._:-]+$/);
const entityIdSchema = z.string().regex(/^e\d{1,10}$/).max(16);
const finiteNonNegativeSchema = z.number().finite().nonnegative();
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
const playSchema = z.object({ type: z.literal("runtime.play"), ...generationCommandShape }).strict();
const pauseSchema = z.object({ type: z.literal("runtime.pause"), ...generationCommandShape }).strict();
const stepSchema = z.object({ type: z.literal("runtime.step"), requestId: requestIdSchema, ...generationCommandShape }).strict();
const applyCommandsSchema = z.object({
  type: z.literal("runtime.applyCommands"),
  requestId: requestIdSchema,
  ...generationCommandShape,
  commands: z.array(z.unknown()).max(1_000)
}).strict();
const selectionSchema = z.object({
  type: z.literal("runtime.selection"),
  ...generationCommandShape,
  entityId: entityIdSchema.nullable()
}).strict();
const resetPerformanceSchema = z.object({ type: z.literal("runtime.resetPerformance"), ...generationCommandShape }).strict();
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
  selectionSchema,
  resetPerformanceSchema,
  frameConsumedSchema,
  uiConsumedSchema,
  disposeSchema
]);

export type RuntimeWorkerRequest =
  | { type: "runtime.initialize" | "runtime.replace"; requestId: number; generation: number; runId: string; runConfig: SimulationRunConfig; instrumentation?: boolean }
  | { type: "runtime.reset"; requestId: number; generation: number; runId: string }
  | { type: "runtime.play" | "runtime.pause" | "runtime.resetPerformance" | "runtime.dispose"; generation: number }
  | { type: "runtime.step"; requestId: number; generation: number }
  | { type: "runtime.applyCommands"; requestId: number; generation: number; commands: readonly Command[] }
  | { type: "runtime.selection"; generation: number; entityId: string | null }
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
  return parsed;
}

const selectedDetailSchema = z.object({
  entityId: z.number().int().positive().max(0xffff_ffff),
  neighborIds: typedArray(Uint32Array),
  neighborOffsets: typedArray(Float32Array),
  neighborDistances: typedArray(Float32Array)
}).strict();

const renderFrameSchema = z.object({
  schemaVersion: z.literal("1"),
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
  localDensities: typedArray(Float32Array),
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
    ["localDensities", frame.localDensities.length, count],
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
  ticksSimulated: z.number().int().nonnegative(),
  framesProjected: z.number().int().nonnegative(),
  framesPublished: z.number().int().nonnegative(),
  framesCoalesced: z.number().int().nonnegative(),
  uiProjected: z.number().int().nonnegative(),
  uiPublished: z.number().int().nonnegative(),
  uiCoalesced: z.number().int().nonnegative()
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

const uiProjectionSchema = z.object({
  schemaVersion: z.literal("1"),
  revision: publicationIdSchema,
  templateId: z.string().min(1).max(100),
  ...identityShape,
  executionKind: z.enum(["local", "worker"]),
  tick: z.number().int().nonnegative(),
  time: finiteNonNegativeSchema,
  entityCount: z.number().int().nonnegative().max(maxRenderFrameEntities),
  playback: z.enum(["initializing", "paused", "running", "failed", "disposed"]),
  lastAdvanceKind: z.enum(["initialization", "run", "step", "command", "restore", "replacement"]),
  alignment: z.number().finite().nullable(),
  runtimeSignature: z.string().min(1).max(100),
  selected: selectedUISchema.nullable(),
  warnings: z.array(z.string().max(240)).max(16),
  performance: z.object({
    measures: z.array(performanceMeasureSchema).max(performanceMeasureNames.length),
    publications: publicationStatsSchema
  }).strict()
}).strict();

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
  z.object({ type: z.literal("runtime.failure"), failure: failureSchema }).strict()
]);

export type RuntimeWorkerResponse =
  | { type: "runtime.frame"; frame: RenderFramePacket }
  | { type: "runtime.ui"; ui: UIProjection }
  | { type: "runtime.complete"; requestId: number; generation: number; ui: UIProjection }
  | { type: "runtime.failure"; failure: RuntimeFailure };

export function parseRuntimeWorkerResponse(value: unknown): RuntimeWorkerResponse {
  return workerResponseSchema.parse(value) as RuntimeWorkerResponse;
}
