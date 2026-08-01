import { z } from "zod";
import {
  createDefaultScenario,
  findInitializationPreset,
  getProductionTemplate,
  updateScenarioPreset,
  validateScenario,
  type AuthoredScenario
} from "../../simulation";
import {
  isSimulationWorkspaceModeId,
  simulationWorkspaceModeFromQuery,
  type SimulationWorkspaceModeId
} from "../workspaceModes";
import { getStarterWorldById } from "./registry";
import { assertSafeStarterWorldValue, validateRuntimeReferences } from "./validation";
import { getGuidedInvestigationById } from "./guides/registry";
import { guidedInvestigationReferenceIssues } from "./guides/validation";
import {
  buildValidatedRecipeScenario,
  getPreparedStarterComparisonById,
  getStarterWorldLaunchRecipeById,
  getStarterWorldPackForWorld
} from "./packs";

const launchTimestamp = "2026-07-27T00:00:00.000Z";

const launchRequestSchema = z
  .object({
    starterId: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    recipeId: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    guideId: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    task: z.string().trim().min(1).max(40).optional()
  })
  .strict();

export const starterWorldLaunchSchema = z
  .object({
    starterWorldId: z.string().trim().min(1).max(120),
    starterWorldVersion: z.literal("1"),
    recipeId: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    guideId: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    slug: z.string().trim().min(1).max(120),
    templateId: z.string().trim().min(1).max(120),
    scenarioId: z.string().trim().min(1).max(120),
    task: z.enum(["setup", "observe", "intervene", "compare", "understand", "experiment", "debug"]),
    href: z.string().startsWith("/world?")
  })
  .strict();

export type StarterWorldLaunch = z.infer<typeof starterWorldLaunchSchema>;

export type StarterWorldLaunchResult =
  | { ok: true; launch: StarterWorldLaunch }
  | {
      ok: false;
      code: StarterWorldLaunchErrorCode;
      message: string;
    };

type StarterWorldLaunchErrorCode =
  | "invalid-request"
  | "unknown-starter"
  | "not-runnable"
  | "runtime-mismatch"
  | "unknown-scenario"
  | "missing-recipe"
  | "unknown-recipe"
  | "recipe-mismatch"
  | "unknown-guide"
  | "missing-guide-recipe"
  | "guide-mismatch"
  | "invalid-task";

export function resolveStarterWorldLaunch(input: unknown): StarterWorldLaunchResult {
  try {
    assertSafeStarterWorldValue(input);
  } catch {
    return failure("invalid-request", "The Starter World launch request contains unsupported data.");
  }
  const parsed = launchRequestSchema.safeParse(input);
  if (!parsed.success) {
    return failure("invalid-request", "The Starter World launch request is malformed.");
  }

  const definition = getStarterWorldById(parsed.data.starterId);
  if (!definition) {
    return failure("unknown-starter", "That Starter World is not available.");
  }
  if (definition.runtimeStatus !== "runnable" || !definition.runtime) {
    return failure("not-runnable", "That Starter World does not have an approved runtime launch.");
  }
  if (validateRuntimeReferences(definition).length > 0) {
    return failure("runtime-mismatch", "The Starter World runtime reference is no longer authoritative.");
  }

  const template = getProductionTemplate(definition.runtime.templateId);
  if (!template) {
    return failure("runtime-mismatch", "The Starter World runtime template is unavailable.");
  }

  const recipe = parsed.data.recipeId
    ? getStarterWorldLaunchRecipeById(parsed.data.recipeId)
    : undefined;
  if (parsed.data.recipeId && !recipe) {
    return failure("unknown-recipe", "That prepared Starter World recipe is not available.");
  }
  if (recipe && recipe.starterWorldId !== definition.id) {
    return failure("recipe-mismatch", "That prepared recipe does not belong to this Starter World.");
  }
  if (recipe && recipe.templateId !== template.id) {
    return failure("runtime-mismatch", "The prepared recipe no longer matches the authoritative runtime template.");
  }

  const guide = parsed.data.guideId
    ? getGuidedInvestigationById(parsed.data.guideId)
    : undefined;
  if (parsed.data.guideId && !guide) {
    return failure("unknown-guide", "That guided investigation is not available.");
  }
  if (guide && !recipe) {
    return failure("missing-guide-recipe", "A guided investigation must identify one of its prepared recipes.");
  }
  if (!recipe && getStarterWorldPackForWorld(definition.id)) {
    return failure("missing-recipe", "Choose the baseline or contrast recipe before launching this flagship Starter World.");
  }
  if (guide && recipe) {
    const referenceIssues = guidedInvestigationReferenceIssues(guide);
    const comparison = getPreparedStarterComparisonById(guide.preparedComparisonId);
    const belongsToPair = comparison && [comparison.baselineRecipeId, comparison.contrastRecipeId].includes(recipe.id);
    if (
      referenceIssues.length > 0 ||
      guide.starterWorldId !== definition.id ||
      !belongsToPair
    ) {
      return failure("guide-mismatch", "That guide does not belong to this Starter World recipe.");
    }
  }

  const scenarioId = recipe?.initializationPresetId ?? definition.runtime.defaultScenarioId;
  if (
    !definition.runtime.supportedScenarioIds.includes(scenarioId) ||
    !findInitializationPreset(template, scenarioId)
  ) {
    return failure("unknown-scenario", "The requested Starter World scenario is unavailable.");
  }

  const task = parsed.data.task
    ? simulationWorkspaceModeFromQuery(parsed.data.task)
    : recipe?.recommendedTask ?? definition.runtime.recommendedTask;
  if (!task || !isSimulationWorkspaceModeId(task)) {
    return failure("invalid-task", "The requested World task is unavailable.");
  }

  const launchWithoutHref = {
    starterWorldId: definition.id,
    starterWorldVersion: definition.version,
    ...(recipe ? { recipeId: recipe.id } : {}),
    ...(guide ? { guideId: guide.id } : {}),
    slug: definition.slug,
    templateId: template.id,
    scenarioId,
    task
  } as const;
  const launch = starterWorldLaunchSchema.parse({
    ...launchWithoutHref,
    href: starterWorldLaunchHref(definition.id, recipe?.id, guide?.id)
  });
  return { ok: true, launch };
}

export function createDefaultStarterWorldLaunch(starterWorldId: string): StarterWorldLaunch {
  const result = resolveStarterWorldLaunch({ starterId: starterWorldId });
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.launch;
}

export function createStarterWorldScenario(input: unknown): AuthoredScenario {
  assertSafeStarterWorldValue(input);
  const launch = starterWorldLaunchSchema.parse(input);
  const resolved = resolveStarterWorldLaunch({
    starterId: launch.starterWorldId,
    ...(launch.recipeId ? { recipeId: launch.recipeId } : {}),
    ...(launch.guideId ? { guideId: launch.guideId } : {}),
    task: launch.task
  });
  if (!resolved.ok || !sameLaunchIdentity(launch, resolved.launch)) {
    throw new Error("Starter World launch context is stale or invalid.");
  }

  const definition = getStarterWorldById(launch.starterWorldId);
  const template = getProductionTemplate(launch.templateId);
  if (!definition || !template) {
    throw new Error("Starter World runtime is unavailable.");
  }

  const recipe = launch.recipeId ? getStarterWorldLaunchRecipeById(launch.recipeId) : undefined;
  const scenario = recipe
    ? buildValidatedRecipeScenario(recipe)
    : updateScenarioPreset(
        createDefaultScenario({
          template,
          now: launchTimestamp,
          seed: "ortus-field-001",
          name: `${definition.shortTitle} baseline`
        }),
        launch.scenarioId,
        launchTimestamp
      );
  return validateScenario({
    ...scenario,
    metadata: {
      ...scenario.metadata,
      starterWorldId: definition.id,
      starterWorldSlug: definition.slug,
      starterWorldVersion: definition.version,
      ...(recipe ? { starterWorldRecipeId: recipe.id } : {})
    }
  }).scenario;
}

export function starterWorldLaunchHref(starterWorldId: string, recipeId?: string, guideId?: string): string {
  const query = new URLSearchParams();
  query.set("starter", starterWorldId);
  if (recipeId) {
    query.set("recipe", recipeId);
  }
  if (guideId) {
    query.set("guide", guideId);
  }
  return `/world?${query.toString()}`;
}

function sameLaunchIdentity(left: StarterWorldLaunch, right: StarterWorldLaunch): boolean {
  return (
    left.starterWorldId === right.starterWorldId &&
    left.starterWorldVersion === right.starterWorldVersion &&
    left.recipeId === right.recipeId &&
    left.guideId === right.guideId &&
    left.slug === right.slug &&
    left.templateId === right.templateId &&
    left.scenarioId === right.scenarioId &&
    left.task === right.task &&
    left.href === right.href
  );
}

function failure(code: StarterWorldLaunchErrorCode, message: string) {
  return { ok: false, code, message } as const;
}
