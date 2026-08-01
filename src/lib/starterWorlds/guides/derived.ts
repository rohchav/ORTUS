import { buildValidatedRecipeScenario } from "../packs/validation";
import {
  getPreparedStarterComparisonById,
  requireStarterWorldLaunchRecipeById,
  requireStarterWorldPackById
} from "../packs/registry";
import { requireStarterWorldById } from "../registry";
import { starterWorldLaunchHref } from "../launch";
import { getGuidedInvestigationById } from "./registry";
import type { PreparedStarterComparison, StarterWorldLaunchRecipe } from "../packs/types";
import type { StarterWorldDefinition } from "../types";
import type { GuidedInvestigationDefinition, GuidedInvestigationPhase } from "./types";

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
  const baselineScenario = buildValidatedRecipeScenario(baselineRecipe);
  const contrastScenario = buildValidatedRecipeScenario(contrastRecipe);
  const facts = deriveRequiredGuidedInvestigationFacts({
    guide,
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
    baselineParameters: { ...baselineScenario.parameters },
    contrastParameters: { ...contrastScenario.parameters },
    baselineHref: starterWorldLaunchHref(world.id, baselineRecipe.id, guide.id),
    contrastHref: starterWorldLaunchHref(world.id, contrastRecipe.id, guide.id),
    unguidedBaselineHref: starterWorldLaunchHref(world.id, baselineRecipe.id),
    unguidedContrastHref: starterWorldLaunchHref(world.id, contrastRecipe.id),
    landingHref: `/worlds/guides/${guide.slug}`,
    flagshipHref: `/worlds/${world.slug}`,
    collectionHref: `/worlds/packs/${pack.slug}`
  });
}

export function deriveRequiredGuidedInvestigationFacts({
  guide,
  world,
  comparison,
  baselineRecipe,
  contrastRecipe
}: {
  guide: GuidedInvestigationDefinition;
  world: StarterWorldDefinition;
  comparison: PreparedStarterComparison;
  baselineRecipe: StarterWorldLaunchRecipe;
  contrastRecipe: StarterWorldLaunchRecipe;
}) {
  const controlledDifference = comparison.controlledDifferences.find(
    (difference) => difference.field === "parameters.noise"
  );
  const sharedSeed = comparison.sharedConditions.find((condition) => condition.field === "seed");
  const sharedEntityCount = comparison.sharedConditions.find(
    (condition) => condition.field === "parameters.agentCount"
  );
  if (!controlledDifference || typeof controlledDifference.baselineValue !== "number" || typeof controlledDifference.contrastValue !== "number") {
    throw new Error("Reading a Flock requires one numeric, comparison-derived Noise difference.");
  }
  if (!sharedSeed || typeof sharedSeed.value !== "string") {
    throw new Error("Reading a Flock requires a comparison-derived shared seed.");
  }
  if (!sharedEntityCount || typeof sharedEntityCount.value !== "number") {
    throw new Error("Reading a Flock requires a comparison-derived shared entity count.");
  }
  if (
    !comparison.tickZeroSummary.includes(String(sharedEntityCount.value)) ||
    !/matching positions and headings/i.test(comparison.tickZeroSummary)
  ) {
    throw new Error("Reading a Flock requires an audited tick-zero entity and matching-state statement.");
  }
  if (baselineRecipe.suggestedRunHorizon !== contrastRecipe.suggestedRunHorizon) {
    throw new Error("Reading a Flock requires a shared prepared run horizon.");
  }

  const focusOutputs = guide.focusOutputIds.map((metricId) => {
    const observation = world.whatToWatch.find((candidate) => candidate.metricId === metricId);
    if (!observation || !comparison.outputsToCompare.includes(metricId)) {
      throw new Error(`Guided output "${metricId}" is no longer authoritative.`);
    }
    return { metricId, label: observation.label, description: observation.description };
  });
  return {
    controlledDifference,
    sharedSeed: sharedSeed.value,
    sharedEntityCount: sharedEntityCount.value,
    focusOutputs,
    suggestedRunHorizon: baselineRecipe.suggestedRunHorizon
  };
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
