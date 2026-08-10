import type { StarterWorldDefinition } from "../types";
import type {
  PreparedStarterComparison,
  StarterWorldLaunchRecipe,
  StarterWorldPackDefinition
} from "../packs/types";
import { buildValidatedRecipeScenario } from "../packs/validation";
import type { GuidedInvestigationDefinition } from "./types";

export function deriveRequiredGuidedInvestigationFacts({
  guide,
  pack,
  world,
  comparison,
  baselineRecipe,
  contrastRecipe
}: {
  guide: GuidedInvestigationDefinition;
  pack: StarterWorldPackDefinition;
  world: StarterWorldDefinition;
  comparison: PreparedStarterComparison;
  baselineRecipe: StarterWorldLaunchRecipe;
  contrastRecipe: StarterWorldLaunchRecipe;
}) {
  if (
    guide.packId !== pack.id ||
    guide.starterWorldId !== world.id ||
    guide.preparedComparisonId !== comparison.id
  ) {
    throw new Error("Reading a Flock authority references are stale.");
  }
  if (!pack.worldIds.includes(world.id) || pack.featuredWorldId !== world.id) {
    throw new Error("Reading a Flock requires its authoritative flagship pack membership.");
  }
  if (comparison.starterWorldId !== world.id) {
    throw new Error("Reading a Flock comparison ownership is stale.");
  }
  if (
    comparison.baselineRecipeId !== baselineRecipe.id ||
    comparison.contrastRecipeId !== contrastRecipe.id
  ) {
    throw new Error("Reading a Flock prepared recipe references are stale.");
  }
  if (baselineRecipe.comparisonRole !== "baseline" || contrastRecipe.comparisonRole !== "contrast") {
    throw new Error("Reading a Flock requires authoritative baseline and contrast recipe roles.");
  }
  if (
    baselineRecipe.starterWorldId !== world.id ||
    contrastRecipe.starterWorldId !== world.id ||
    !world.runtime ||
    baselineRecipe.templateId !== world.runtime.templateId ||
    contrastRecipe.templateId !== world.runtime.templateId
  ) {
    throw new Error("Reading a Flock prepared recipes no longer belong to the authoritative runtime.");
  }

  const baselineScenario = buildValidatedRecipeScenario(baselineRecipe);
  const contrastScenario = buildValidatedRecipeScenario(contrastRecipe);
  const controlledDifferences = comparison.controlledDifferences;
  const controlledDifference = controlledDifferences[0];
  if (
    controlledDifferences.length !== 1 ||
    controlledDifference?.field !== "parameters.noise" ||
    typeof controlledDifference.baselineValue !== "number" ||
    typeof controlledDifference.contrastValue !== "number"
  ) {
    throw new Error("Reading a Flock requires exactly one numeric, comparison-derived Noise difference.");
  }
  if (
    !sameDataValue(baselineScenario.parameters.noise, controlledDifference.baselineValue) ||
    !sameDataValue(contrastScenario.parameters.noise, controlledDifference.contrastValue) ||
    !onlyParameterDifferenceIsNoise(baselineScenario.parameters, contrastScenario.parameters)
  ) {
    throw new Error("Reading a Flock prepared scenarios must differ only in Noise.");
  }
  if (
    baselineScenario.templateId !== contrastScenario.templateId ||
    baselineScenario.seed !== contrastScenario.seed ||
    baselineScenario.initializationPreset !== contrastScenario.initializationPreset ||
    !sameDataValue(baselineScenario.initializationOptions, contrastScenario.initializationOptions) ||
    !sameDataValue(baselineScenario.agentComposition, contrastScenario.agentComposition) ||
    baselineScenario.behaviorMode !== contrastScenario.behaviorMode ||
    !sameDataValue(baselineScenario.environmentOptions, contrastScenario.environmentOptions)
  ) {
    throw new Error("Reading a Flock requires matching prepared initialization and runtime conditions.");
  }

  const sharedSeed = comparison.sharedConditions.find((condition) => condition.field === "seed");
  const sharedEntityCount = comparison.sharedConditions.find(
    (condition) => condition.field === "parameters.agentCount"
  );
  if (
    !sharedSeed ||
    typeof sharedSeed.value !== "string" ||
    sharedSeed.value !== baselineScenario.seed
  ) {
    throw new Error("Reading a Flock requires a comparison-derived shared seed.");
  }
  if (
    !sharedEntityCount ||
    typeof sharedEntityCount.value !== "number" ||
    sharedEntityCount.value !== baselineScenario.parameters.agentCount ||
    sharedEntityCount.value !== contrastScenario.parameters.agentCount
  ) {
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
    if (
      !observation ||
      !comparison.outputsToCompare.includes(metricId) ||
      !baselineRecipe.outputsToWatch.includes(metricId) ||
      !contrastRecipe.outputsToWatch.includes(metricId)
    ) {
      throw new Error(`Guided output "${metricId}" is no longer authoritative.`);
    }
    return { metricId, label: observation.label, description: observation.description };
  });

  return {
    controlledDifference,
    sharedSeed: sharedSeed.value,
    sharedEntityCount: sharedEntityCount.value,
    focusOutputs,
    suggestedRunHorizon: baselineRecipe.suggestedRunHorizon,
    baselineParameters: { ...baselineScenario.parameters },
    contrastParameters: { ...contrastScenario.parameters },
    baselineRunReference: preparedRunReference(world.id, baselineRecipe.id, baselineScenario),
    contrastRunReference: preparedRunReference(world.id, contrastRecipe.id, contrastScenario)
  };
}

function preparedRunReference(
  starterWorldId: string,
  recipeId: string,
  scenario: ReturnType<typeof buildValidatedRecipeScenario>
) {
  return {
    starterWorldId,
    recipeId,
    templateId: scenario.templateId,
    seed: scenario.seed,
    parameters: { ...scenario.parameters },
    initializationPreset: scenario.initializationPreset,
    initializationOptions: { ...scenario.initializationOptions },
    agentComposition: { ...scenario.agentComposition },
    behaviorMode: scenario.behaviorMode,
    environmentOptions: { ...scenario.environmentOptions }
  };
}

function onlyParameterDifferenceIsNoise(
  baseline: Readonly<Record<string, unknown>>,
  contrast: Readonly<Record<string, unknown>>
): boolean {
  const keys = new Set([...Object.keys(baseline), ...Object.keys(contrast)]);
  const differences = [...keys].filter((key) => !sameDataValue(baseline[key], contrast[key]));
  return differences.length === 1 && differences[0] === "noise";
}

function sameDataValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => sameDataValue(value, right[index]));
  }
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") {
    return false;
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] && sameDataValue(leftRecord[key], rightRecord[key]));
}
