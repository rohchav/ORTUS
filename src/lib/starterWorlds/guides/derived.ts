import {
  getPreparedStarterComparisonById,
  requireStarterWorldLaunchRecipeById,
  requireStarterWorldPackById
} from "../packs/registry";
import { requireStarterWorldById } from "../registry";
import { starterWorldLaunchHref } from "../launch";
import { getGuidedInvestigationById } from "./registry";
import type { GuidedInvestigationDefinition, GuidedInvestigationPhase } from "./types";
import { deriveRequiredGuidedInvestigationFacts } from "./authority";

export { deriveRequiredGuidedInvestigationFacts } from "./authority";

export function deriveGuidedInvestigationAuthority(
  guideOrId: GuidedInvestigationDefinition | string
) {
  const guide = typeof guideOrId === "string" ? getGuidedInvestigationById(guideOrId) : guideOrId;
  if (!guide) {
    throw new Error(`Unknown guided investigation: ${guideOrId}`);
  }
  const pack = requireStarterWorldPackById(guide.packId);
  const world = requireStarterWorldById(guide.starterWorldId);
  const comparison = getPreparedStarterComparisonById(guide.preparedComparisonId);
  if (!comparison || comparison.starterWorldId !== world.id || !pack.worldIds.includes(world.id)) {
    throw new Error("Guided investigation references are stale.");
  }
  const baselineRecipe = requireStarterWorldLaunchRecipeById(comparison.baselineRecipeId);
  const contrastRecipe = requireStarterWorldLaunchRecipeById(comparison.contrastRecipeId);
  const facts = deriveRequiredGuidedInvestigationFacts({
    guide,
    pack,
    world,
    comparison,
    baselineRecipe,
    contrastRecipe
  });

  return deepFreeze({
    guide,
    pack,
    world,
    comparison,
    baselineRecipe,
    contrastRecipe,
    controlledDifference: facts.controlledDifference,
    sharedConditions: comparison.sharedConditions,
    sharedSeed: facts.sharedSeed,
    sharedEntityCount: facts.sharedEntityCount,
    tickZeroSummary: comparison.tickZeroSummary,
    focusOutputs: facts.focusOutputs,
    suggestedRunHorizon: facts.suggestedRunHorizon,
    baselineParameters: facts.baselineParameters,
    contrastParameters: facts.contrastParameters,
    baselineRunReference: facts.baselineRunReference,
    contrastRunReference: facts.contrastRunReference,
    baselineHref: starterWorldLaunchHref(world.id, baselineRecipe.id, guide.id),
    contrastHref: starterWorldLaunchHref(world.id, contrastRecipe.id, guide.id),
    unguidedBaselineHref: starterWorldLaunchHref(world.id, baselineRecipe.id),
    unguidedContrastHref: starterWorldLaunchHref(world.id, contrastRecipe.id),
    landingHref: `/worlds/guides/${guide.slug}`,
    flagshipHref: `/worlds/${world.slug}`,
    collectionHref: `/worlds/packs/${pack.slug}`
  });
}

export type GuidedInvestigationAuthority = ReturnType<typeof deriveGuidedInvestigationAuthority>;

export function phaseForGuidedRecipe(
  authority: GuidedInvestigationAuthority,
  recipeId: string
): GuidedInvestigationPhase {
  const role = recipeId === authority.baselineRecipe.id
    ? "baseline"
    : recipeId === authority.contrastRecipe.id
      ? "contrast"
      : undefined;
  const phase = role
    ? authority.guide.phases.find((candidate) => candidate.recipeRole === role)
    : undefined;
  if (!phase) {
    throw new Error("The active recipe does not belong to this guided investigation.");
  }
  return phase;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}
