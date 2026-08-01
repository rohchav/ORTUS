import {
  rawPreparedStarterComparisonDeclarations,
  rawStarterWorldLaunchRecipes,
  rawStarterWorldPackDefinitions
} from "./definitions";
import type {
  PreparedStarterComparison,
  StarterWorldLaunchRecipe,
  StarterWorldPackDefinition
} from "./types";
import {
  validatePreparedStarterComparisons,
  validateStarterWorldLaunchRecipes,
  validateStarterWorldPackDefinitions
} from "./validation";

const validatedPacks = validateStarterWorldPackDefinitions(rawStarterWorldPackDefinitions).map(deepFreeze);
const validatedRecipes = validateStarterWorldLaunchRecipes(rawStarterWorldLaunchRecipes).map(deepFreeze);
const validatedComparisons = validatePreparedStarterComparisons(
  rawPreparedStarterComparisonDeclarations,
  validatedRecipes
).map(deepFreeze);

validatePackExperienceCoverage(validatedPacks, validatedRecipes, validatedComparisons);

export const starterWorldPacks: readonly StarterWorldPackDefinition[] = deepFreeze([...validatedPacks]);
export const starterWorldLaunchRecipes: readonly StarterWorldLaunchRecipe[] = deepFreeze([...validatedRecipes]);
export const preparedStarterComparisons: readonly PreparedStarterComparison[] = deepFreeze([
  ...validatedComparisons
]);

export function getStarterWorldPackById(id: string): StarterWorldPackDefinition | undefined {
  return starterWorldPacks.find((pack) => pack.id === id);
}

export function getStarterWorldPackBySlug(slug: string): StarterWorldPackDefinition | undefined {
  return starterWorldPacks.find((pack) => pack.slug === slug);
}

export function requireStarterWorldPackById(id: string): StarterWorldPackDefinition {
  const pack = getStarterWorldPackById(id);
  if (!pack) {
    throw new Error(`Unknown Starter World pack: ${id}`);
  }
  return pack;
}

export function getStarterWorldLaunchRecipeById(id: string): StarterWorldLaunchRecipe | undefined {
  return starterWorldLaunchRecipes.find((recipe) => recipe.id === id);
}

export function requireStarterWorldLaunchRecipeById(id: string): StarterWorldLaunchRecipe {
  const recipe = getStarterWorldLaunchRecipeById(id);
  if (!recipe) {
    throw new Error(`Unknown Starter World recipe: ${id}`);
  }
  return recipe;
}

export function starterWorldLaunchRecipesForWorld(starterWorldId: string): readonly StarterWorldLaunchRecipe[] {
  return starterWorldLaunchRecipes.filter((recipe) => recipe.starterWorldId === starterWorldId);
}

export function getPreparedStarterComparisonById(id: string): PreparedStarterComparison | undefined {
  return preparedStarterComparisons.find((comparison) => comparison.id === id);
}

export function getPreparedStarterComparisonForWorld(starterWorldId: string): PreparedStarterComparison | undefined {
  return preparedStarterComparisons.find((comparison) => comparison.starterWorldId === starterWorldId);
}

export function getStarterWorldPackForWorld(starterWorldId: string): StarterWorldPackDefinition | undefined {
  return starterWorldPacks.find((pack) => pack.worldIds.includes(starterWorldId));
}

export function getSiblingStarterWorldRecipe(recipeId: string): StarterWorldLaunchRecipe | undefined {
  const recipe = getStarterWorldLaunchRecipeById(recipeId);
  const comparison = recipe ? getPreparedStarterComparisonForWorld(recipe.starterWorldId) : undefined;
  if (!recipe || !comparison) {
    return undefined;
  }
  const siblingId =
    comparison.baselineRecipeId === recipe.id
      ? comparison.contrastRecipeId
      : comparison.contrastRecipeId === recipe.id
        ? comparison.baselineRecipeId
        : undefined;
  return siblingId ? getStarterWorldLaunchRecipeById(siblingId) : undefined;
}

function validatePackExperienceCoverage(
  packs: readonly StarterWorldPackDefinition[],
  recipes: readonly StarterWorldLaunchRecipe[],
  comparisons: readonly PreparedStarterComparison[]
): void {
  for (const pack of packs) {
    for (const worldId of pack.worldIds) {
      const worldRecipes = recipes.filter((recipe) => recipe.starterWorldId === worldId);
      const worldComparisons = comparisons.filter((comparison) => comparison.starterWorldId === worldId);
      if (
        worldRecipes.length !== 2 ||
        worldRecipes.filter((recipe) => recipe.comparisonRole === "baseline").length !== 1 ||
        worldRecipes.filter((recipe) => recipe.comparisonRole === "contrast").length !== 1 ||
        worldComparisons.length !== 1
      ) {
        throw new Error(`Starter World pack "${pack.id}" requires one baseline, one contrast, and one comparison for "${worldId}".`);
      }
    }
  }
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.isFrozen(value) ? value : Object.freeze(value);
}
