import { z } from "zod";
import { simulationWorkspaceModeIds } from "../../workspaceModes";
import { starterWorldMechanisms, starterWorldSystemForms } from "../types";

export const starterWorldPackSchemaVersion = "1" as const;
export const starterWorldLaunchRecipeSchemaVersion = "1" as const;
export const preparedStarterComparisonSchemaVersion = "1" as const;

const idSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const runtimeReferenceKeySchema = z.string().trim().min(2).max(120).regex(/^[A-Za-z][A-Za-z0-9]*(?:[-_.][A-Za-z0-9]+)*$/);
const boundedText = (min: number, max: number) => z.string().trim().min(min).max(max);
const primitiveValueSchema = z.union([z.string().max(160), z.number().finite(), z.boolean()]);
const conditionValueSchema = z.union([primitiveValueSchema, z.null()]);

export const starterWorldPackDefinitionSchema = z
  .object({
    id: idSchema,
    version: z.literal(starterWorldPackSchemaVersion),
    slug: idSchema,
    title: boundedText(4, 120),
    shortTitle: boundedText(2, 80),
    hook: boundedText(12, 220).refine((value) => value.endsWith("?"), {
      message: "Starter World pack hooks must be questions."
    }),
    summary: boundedText(40, 700),
    theme: boundedText(20, 420),
    featuredWorldId: idSchema,
    worldIds: z.array(idSchema).min(2).max(12),
    mechanisms: z.array(z.enum(starterWorldMechanisms)).min(2).max(12),
    systemForms: z.array(z.enum(starterWorldSystemForms)).min(1).max(5),
    comparisonPurpose: boundedText(20, 420),
    researchBoundary: boundedText(30, 520)
  })
  .strict();

export const starterWorldPackDefinitionListSchema = z
  .array(starterWorldPackDefinitionSchema)
  .min(1)
  .max(24);

export const starterWorldLaunchRecipeSchema = z
  .object({
    id: idSchema,
    version: z.literal(starterWorldLaunchRecipeSchemaVersion),
    starterWorldId: idSchema,
    title: boundedText(2, 120),
    shortDescription: boundedText(20, 360),
    purpose: boundedText(20, 420),
    templateId: idSchema,
    initializationPresetId: idSchema,
    parameterOverrides: z.record(primitiveValueSchema),
    initializationOptions: z.record(primitiveValueSchema).optional(),
    seed: idSchema,
    recommendedTask: z.enum(simulationWorkspaceModeIds),
    suggestedRunHorizon: z.number().int().min(1).max(100_000),
    outputsToWatch: z.array(runtimeReferenceKeySchema).min(1).max(8),
    modelBoundary: boundedText(30, 520),
    visualCue: boundedText(12, 280).optional(),
    comparisonRole: z.enum(["baseline", "contrast"]).optional()
  })
  .strict();

export const starterWorldLaunchRecipeListSchema = z
  .array(starterWorldLaunchRecipeSchema)
  .min(1)
  .max(96);

export const preparedRecipeDifferenceSchema = z
  .object({
    field: boundedText(2, 180),
    label: boundedText(2, 140),
    baselineValue: conditionValueSchema,
    contrastValue: conditionValueSchema
  })
  .strict();

export const preparedRecipeSharedConditionSchema = z
  .object({
    field: boundedText(2, 180),
    label: boundedText(2, 140),
    value: primitiveValueSchema
  })
  .strict();

export const preparedStarterComparisonSchema = z
  .object({
    id: idSchema,
    version: z.literal(preparedStarterComparisonSchemaVersion),
    starterWorldId: idSchema,
    title: boundedText(4, 140),
    question: boundedText(12, 240).refine((value) => value.endsWith("?"), {
      message: "Prepared comparison questions must end with a question mark."
    }),
    baselineRecipeId: idSchema,
    contrastRecipeId: idSchema,
    controlledDifferences: z.array(preparedRecipeDifferenceSchema).min(1).max(64),
    sharedConditions: z.array(preparedRecipeSharedConditionSchema).min(1).max(64),
    outputsToCompare: z.array(runtimeReferenceKeySchema).min(1).max(8),
    suggestedProcedure: z.array(boundedText(12, 320)).min(3).max(6),
    tickZeroSummary: boundedText(30, 520),
    expectedPattern: boundedText(30, 520),
    interpretationBoundary: boundedText(30, 520)
  })
  .strict();

export const preparedStarterComparisonDeclarationSchema = preparedStarterComparisonSchema.omit({
  controlledDifferences: true,
  sharedConditions: true
});

export const preparedStarterComparisonDeclarationListSchema = z
  .array(preparedStarterComparisonDeclarationSchema)
  .min(1)
  .max(48);

export type StarterWorldPackDefinition = z.infer<typeof starterWorldPackDefinitionSchema>;
export type StarterWorldLaunchRecipe = z.infer<typeof starterWorldLaunchRecipeSchema>;
export type PreparedRecipeDifference = z.infer<typeof preparedRecipeDifferenceSchema>;
export type PreparedRecipeSharedCondition = z.infer<typeof preparedRecipeSharedConditionSchema>;
export type PreparedStarterComparison = z.infer<typeof preparedStarterComparisonSchema>;
export type PreparedStarterComparisonDeclaration = z.infer<
  typeof preparedStarterComparisonDeclarationSchema
>;
