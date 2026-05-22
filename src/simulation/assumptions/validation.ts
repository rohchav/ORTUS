import { z } from "zod";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import {
  assumptionProfileArtifactType,
  maxAssumptionItemDescriptionLength,
  maxAssumptionProfileJsonLength,
  maxAssumptionSummaryJsonLength,
  maxScenarioAssumptionNotes,
  type AssumptionSummary,
  type AssumptionItem,
  type ModelAssumptionProfile,
  type ScenarioAssumptionNotes
} from "./types";

export const assumptionItemSchema = z
  .object({
    id: z.string().min(1).max(80),
    label: z.string().min(1).max(140),
    description: z.string().min(1).max(maxAssumptionItemDescriptionLength),
    severity: z.enum(["info", "caution", "critical"]).optional(),
    category: z.string().max(80).optional(),
    source: z.string().max(180).optional(),
    confidence: z.enum(["low", "medium", "high", "unknown"]).optional()
  })
  .strict();

const assumptionProfileSchema = z
  .object({
    schemaVersion: z.literal("1"),
    artifactType: z.literal(assumptionProfileArtifactType),
    id: z.string().min(1).max(120),
    ownerType: z.enum(["template", "scenario", "uncertaintyConfig", "run", "result"]),
    ownerId: z.string().min(1).max(180),
    assumptions: z.array(assumptionItemSchema).min(1),
    limitations: z.array(assumptionItemSchema).min(1),
    notRepresented: z.array(assumptionItemSchema).min(1),
    appropriateUse: z.array(assumptionItemSchema).min(1),
    inappropriateUse: z.array(assumptionItemSchema).min(1),
    ethicsNotes: z.array(assumptionItemSchema),
    validationStatus: z.enum(["illustrative", "internallyTested", "patternValidated", "calibrated", "externallyValidated", "unknown"]),
    validationNotes: z.string().min(1).max(1200),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
  })
  .strict();

const scenarioAssumptionNotesSchema = z
  .object({
    assumptionNotes: z.array(assumptionItemSchema).max(maxScenarioAssumptionNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxScenarioAssumptionNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxScenarioAssumptionNotes).optional(),
    ethicsNotes: z.array(assumptionItemSchema).max(maxScenarioAssumptionNotes).optional()
  })
  .strict();

const forbiddenAssumptionKeys = new Set([
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
  "template",
  "snapshots",
  "runState",
  "runSummary",
  "runSummaries"
]);

export function validateAssumptionProfile(value: unknown): ModelAssumptionProfile {
  const parsed = assumptionProfileSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid assumption profile: ${formatZodIssue(parsed.error)}`);
  }
  const profile = parsed.data;
  assertJsonBound(profile, maxAssumptionProfileJsonLength, "Assumption profile");
  assertNoLiveState(profile, "Assumption profile");
  for (const section of ["assumptions", "limitations", "notRepresented", "appropriateUse", "inappropriateUse", "ethicsNotes"] as const) {
    assertUniqueItemIds(section, profile[section]);
  }
  return profile;
}

export function validateAssumptionItems(section: string, value: unknown): readonly AssumptionItem[] {
  const parsed = z.array(assumptionItemSchema).safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid assumption items in ${section}: ${formatZodIssue(parsed.error)}`);
  }
  assertNoLiveState(parsed.data, section);
  assertUniqueItemIds(section, parsed.data);
  return parsed.data;
}

export function validateScenarioAssumptionNotes(value: unknown): ScenarioAssumptionNotes {
  const parsed = scenarioAssumptionNotesSchema.safeParse(value ?? {});
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid scenario assumption notes: ${formatZodIssue(parsed.error)}`);
  }
  const notes = parsed.data;
  assertNoLiveState(notes, "Scenario assumption notes");
  for (const section of ["assumptionNotes", "limitationNotes", "validationNotes", "ethicsNotes"] as const) {
    assertUniqueItemIds(section, notes[section] ?? []);
  }
  return notes;
}

export function parseAssumptionProfileJson(json: string): ModelAssumptionProfile {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    throw new SimulationSerializationError("Invalid assumption profile JSON", { cause: error });
  }
  return validateAssumptionProfile(raw);
}

export function serializeAssumptionProfile(profile: ModelAssumptionProfile): string {
  return JSON.stringify(validateAssumptionProfile(profile), null, 2);
}

export function assertAssumptionSummaryBounds(summary: AssumptionSummary): void {
  assertJsonBound(summary, maxAssumptionSummaryJsonLength, "Assumption summary");
  assertNoLiveState(summary, "Assumption summary");
}

function assertUniqueItemIds(section: string, items: readonly AssumptionItem[]): void {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) {
      throw new SimulationValidationError(`Duplicate assumption item id in ${section}: ${item.id}`);
    }
    ids.add(item.id);
  }
}

function assertJsonBound(value: unknown, maxLength: number, label: string): void {
  if (JSON.stringify(value).length > maxLength) {
    throw new SimulationValidationError(`${label} JSON must be ${maxLength} characters or less`);
  }
}

function assertNoLiveState(value: unknown, label: string): void {
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
      if (forbiddenAssumptionKeys.has(key)) {
        throw new SimulationValidationError(`${label} must not embed live run state (${key})`);
      }
      stack.push(child);
    }
  }
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
