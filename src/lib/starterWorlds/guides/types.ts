import { z } from "zod";

export const guidedInvestigationSchemaVersion = "1" as const;
export const guidedInvestigationModes = ["prepared-pair-reading"] as const;
export const guidedInvestigationActionTypes = [
  "open-task",
  "inspect-start",
  "run-prepared-world",
  "inspect-outputs",
  "open-compare",
  "launch-paired-recipe",
  "review-differences",
  "reflect",
  "exit-guide"
] as const;
export const guidedInvestigationTechnicalChecks = [
  "correct-recipe-loaded",
  "run-is-paused",
  "tick-is-zero",
  "tick-reached-horizon",
  "task-is-visible",
  "metric-is-available",
  "comparison-summary-exists",
  "paired-recipe-loaded"
] as const;
export const guidedInvestigationNextActions = [
  "open-setup",
  "open-flagship",
  "open-collection",
  "exit-guide"
] as const;

const idSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const runtimeReferenceSchema = z.string().trim().min(2).max(120).regex(/^[A-Za-z][A-Za-z0-9]*(?:[-_.][A-Za-z0-9]+)*$/);
const boundedText = (min: number, max: number) => z.string().trim().min(min).max(max);

const openTaskActionSchema = z
  .object({
    type: z.literal("open-task"),
    task: z.enum(["setup", "observe", "compare"])
  })
  .strict();

const noPayloadActionSchema = z
  .object({
    type: z.enum([
      "inspect-start",
      "run-prepared-world",
      "inspect-outputs",
      "open-compare",
      "launch-paired-recipe",
      "review-differences",
      "reflect",
      "exit-guide"
    ])
  })
  .strict();

export const guidedInvestigationActionSchema = z.union([
  openTaskActionSchema,
  noPayloadActionSchema
]);

export const guidedInvestigationStepSchema = z
  .object({
    id: idSchema,
    title: boundedText(4, 120),
    summary: boundedText(20, 520),
    actions: z.array(guidedInvestigationActionSchema).min(1).max(5),
    technicalChecks: z.array(z.enum(guidedInvestigationTechnicalChecks)).max(5),
    prompts: z.array(boundedText(8, 260)).max(4).optional()
  })
  .strict();

export const guidedInvestigationPhaseSchema = z
  .object({
    id: idSchema,
    recipeRole: z.enum(["baseline", "contrast"]),
    title: boundedText(4, 120),
    steps: z.array(guidedInvestigationStepSchema).min(1).max(4)
  })
  .strict();

export const guidedInvestigationDefinitionSchema = z
  .object({
    id: idSchema,
    version: z.literal(guidedInvestigationSchemaVersion),
    slug: idSchema,
    title: boundedText(4, 120),
    shortTitle: boundedText(2, 80),
    hookQuestion: boundedText(12, 240).refine((value) => value.endsWith("?"), {
      message: "Guided investigation hooks must end with a question mark."
    }),
    summary: boundedText(30, 700),
    estimatedMinutes: z.number().int().min(3).max(30),
    mode: z.literal("prepared-pair-reading"),
    packId: idSchema,
    starterWorldId: idSchema,
    preparedComparisonId: idSchema,
    focusOutputIds: z.array(runtimeReferenceSchema).min(2).max(4),
    opening: z.array(boundedText(8, 240)).min(2).max(4),
    phases: z.array(guidedInvestigationPhaseSchema).min(2).max(2),
    reflectionPrompts: z.array(boundedText(12, 320)).min(2).max(5),
    modelBoundary: boundedText(40, 520),
    nextActions: z.array(z.enum(guidedInvestigationNextActions)).min(1).max(4)
  })
  .strict();

export const guidedInvestigationDefinitionListSchema = z
  .array(guidedInvestigationDefinitionSchema)
  .min(1)
  .max(24);

export type GuidedInvestigationMode = (typeof guidedInvestigationModes)[number];
export type GuidedInvestigationActionType = (typeof guidedInvestigationActionTypes)[number];
export type GuidedInvestigationTechnicalCheck = (typeof guidedInvestigationTechnicalChecks)[number];
export type GuidedInvestigationNextAction = (typeof guidedInvestigationNextActions)[number];
export type GuidedInvestigationAction = z.infer<typeof guidedInvestigationActionSchema>;
export type GuidedInvestigationStep = z.infer<typeof guidedInvestigationStepSchema>;
export type GuidedInvestigationPhase = z.infer<typeof guidedInvestigationPhaseSchema>;
export type GuidedInvestigationDefinition = z.infer<typeof guidedInvestigationDefinitionSchema>;
