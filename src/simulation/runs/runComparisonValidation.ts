import { z } from "zod";
import { SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { SavedRunSummary } from "./runSummaryTypes";
import { maxRunEventSummaryLength, maxRunInterventionSummaryLength, maxRunMetricHistoryLength } from "./runSummaryTypes";

const finiteNumberSchema = z.number().finite();

const runMetricRecordSchema = z.object({
  tick: z.number().int().min(0),
  time: finiteNumberSchema.min(0),
  values: z.record(finiteNumberSchema)
});

const runInterventionSummarySchema = z.object({
  interventionId: z.string().min(1),
  label: z.string().min(1),
  tickApplied: z.number().int().min(0),
  targetSummary: z.string(),
  status: z.enum(["applied", "failed"])
});

const runEventSummarySchema = z.object({
  type: z.string().min(1),
  tick: z.number().int().min(0),
  source: z.string().min(1),
  label: z.string().optional(),
  severity: z.enum(["info", "warning", "error"]).optional(),
  category: z.string().optional()
});

export const savedRunSummarySchema: z.ZodType<SavedRunSummary> = z.object({
  schemaVersion: z.literal("1"),
  runId: z.string().min(1),
  label: z.string().min(1),
  templateId: z.string().min(1),
  templateName: z.string().min(1),
  templateVersion: z.string().min(1),
  seed: z.string().min(1),
  parameters: z.record(jsonValueSchema),
  capturedAt: z.string().datetime(),
  ticksRun: z.number().int().min(0),
  time: finiteNumberSchema.min(0),
  finalMetrics: z.record(finiteNumberSchema),
  metricHistory: z.array(runMetricRecordSchema).max(maxRunMetricHistoryLength),
  interventions: z.array(runInterventionSummarySchema).max(maxRunInterventionSummaryLength),
  events: z.array(runEventSummarySchema).max(maxRunEventSummaryLength).optional(),
  source: z.enum(["manual", "experiment", "imported"]),
  notes: z.string(),
  tags: z.array(z.string()),
  metadata: z.record(jsonValueSchema).optional()
}) as z.ZodType<SavedRunSummary>;

export function validateRunSummary(value: unknown): SavedRunSummary {
  const result = savedRunSummarySchema.safeParse(value);
  if (!result.success) {
    throw new SimulationValidationError(`Invalid run summary: ${formatZodIssue(result.error)}`);
  }
  return result.data;
}

export function safeParseRunSummary(value: unknown): SavedRunSummary | null {
  const result = savedRunSummarySchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseRunSummaryArray(value: unknown): SavedRunSummary[] {
  const result = z.array(savedRunSummarySchema).safeParse(value);
  if (!result.success) {
    throw new SimulationValidationError(`Invalid run library: ${formatZodIssue(result.error)}`);
  }
  return result.data;
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
