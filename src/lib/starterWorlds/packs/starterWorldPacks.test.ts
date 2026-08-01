import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createEngineFromScenario, productionTemplates } from "../../../simulation";
import { createStarterWorldScenario, resolveStarterWorldLaunch, starterWorldLaunchHref } from "../launch";
import {
  rawPreparedStarterComparisonDeclarations,
  rawStarterWorldLaunchRecipes,
  rawStarterWorldPackDefinitions
} from "./definitions";
import {
  getPreparedStarterComparisonForWorld,
  getSiblingStarterWorldRecipe,
  getStarterWorldLaunchRecipeById,
  getStarterWorldPackBySlug,
  preparedStarterComparisons,
  starterWorldLaunchRecipes,
  starterWorldPacks
} from "./registry";
import {
  preparedStarterComparisonSchemaVersion,
  starterWorldLaunchRecipeSchema,
  starterWorldLaunchRecipeSchemaVersion,
  starterWorldPackDefinitionSchema,
  starterWorldPackSchemaVersion
} from "./types";
import {
  deriveRecipeConditions,
  validatePreparedStarterComparisons,
  validateStarterWorldLaunchRecipes,
  validateStarterWorldPackDefinitions
} from "./validation";

describe("flagship Starter World pack contracts", () => {
  it("registers one versioned pack, eight recipes, and four derived comparisons deterministically", () => {
    expect(starterWorldPackSchemaVersion).toBe("1");
    expect(starterWorldLaunchRecipeSchemaVersion).toBe("1");
    expect(preparedStarterComparisonSchemaVersion).toBe("1");
    expect(starterWorldPacks.map((pack) => pack.id)).toEqual(["local-rules-global-patterns"]);
    expect(starterWorldLaunchRecipes).toHaveLength(8);
    expect(preparedStarterComparisons).toHaveLength(4);
    expect(starterWorldLaunchRecipes.map((recipe) => recipe.comparisonRole)).toEqual([
      "baseline", "contrast", "baseline", "contrast", "baseline", "contrast", "baseline", "contrast"
    ]);
    expect(preparedStarterComparisons.map((comparison) => comparison.starterWorldId)).toEqual(
      starterWorldPacks[0]!.worldIds
    );
  });

  it("recursively freezes pack, recipe, comparison, and derived-condition data", () => {
    const pack = starterWorldPacks[0]!;
    const recipe = starterWorldLaunchRecipes[0]!;
    const comparison = preparedStarterComparisons[0]!;
    for (const value of [starterWorldPacks, pack, pack.worldIds, starterWorldLaunchRecipes, recipe, recipe.parameterOverrides, preparedStarterComparisons, comparison, comparison.controlledDifferences, comparison.controlledDifferences[0]]) {
      expect(Object.isFrozen(value)).toBe(true);
    }
    expect(Reflect.set(recipe.parameterOverrides, "noise", 0.5)).toBe(false);
    expect(recipe.parameterOverrides.noise).toBe(0.01);
  });

  it("validates pack membership, runnable references, unique IDs and slugs, and unsafe keys", () => {
    expect(getStarterWorldPackBySlug("local-rules-global-patterns")?.worldIds).toHaveLength(4);
    expect(starterWorldPackDefinitionSchema.safeParse({ ...starterWorldPacks[0], progression: true }).success).toBe(false);

    const duplicateId = clonePacks();
    duplicateId.push({ ...structuredClone(duplicateId[0]), slug: "other-pack" });
    expect(() => validateStarterWorldPackDefinitions(duplicateId)).toThrow(/Pack ID.*duplicates/i);

    const duplicateSlug = clonePacks();
    duplicateSlug.push({ ...structuredClone(duplicateSlug[0]), id: "other-pack" });
    expect(() => validateStarterWorldPackDefinitions(duplicateSlug)).toThrow(/Pack slug.*duplicates/i);

    const duplicateWorld = clonePacks();
    duplicateWorld[0].worldIds[1] = duplicateWorld[0].worldIds[0];
    expect(() => validateStarterWorldPackDefinitions(duplicateWorld)).toThrow(/world references must be unique/i);

    const unknownWorld = clonePacks();
    unknownWorld[0].worldIds[0] = "missing-world";
    expect(() => validateStarterWorldPackDefinitions(unknownWorld)).toThrow(/Unknown Starter World/i);

    const absentFeatured = clonePacks();
    absentFeatured[0].featuredWorldId = "flocking";
    expect(() => validateStarterWorldPackDefinitions(absentFeatured)).toThrow(/must belong to the pack/i);

    const unsafe = clonePacks();
    Object.defineProperty(unsafe[0], "__proto__", { value: { polluted: true }, enumerable: true });
    expect(() => validateStarterWorldPackDefinitions(unsafe)).toThrow(/Unsafe object key/i);
  });

  it("revalidates recipe ownership, templates, presets, parameters, options, tasks, seeds, and outputs", () => {
    expect(() => validateStarterWorldLaunchRecipes(cloneRecipes())).not.toThrow();
    expect(starterWorldLaunchRecipeSchema.safeParse({ ...starterWorldLaunchRecipes[0], runConfig: {} }).success).toBe(false);

    const duplicateId = cloneRecipes();
    duplicateId[1].id = duplicateId[0].id;
    expect(() => validateStarterWorldLaunchRecipes(duplicateId)).toThrow(/Recipe ID.*duplicates/i);

    const cases: Array<{ mutate: (recipes: any[]) => void; message: RegExp }> = [
      { mutate: (recipes) => { recipes[0].starterWorldId = "missing-world"; }, message: /Unknown runnable Starter World/i },
      { mutate: (recipes) => { recipes[0].templateId = "epidemic-spread"; }, message: /authoritative template/i },
      { mutate: (recipes) => { recipes[0].initializationPresetId = "aligned-flock"; }, message: /not permitted/i },
      { mutate: (recipes) => { recipes[0].initializationPresetId = "missing-preset"; }, message: /not permitted|Unknown initialization preset/i },
      { mutate: (recipes) => { recipes[0].parameterOverrides = { missingParameter: 1 }; }, message: /Unknown parameter/i },
      { mutate: (recipes) => { recipes[0].parameterOverrides.noise = "loud"; }, message: /outside the authoritative contract/i },
      { mutate: (recipes) => { recipes[0].parameterOverrides.noise = 1; }, message: /outside the authoritative contract/i },
      { mutate: (recipes) => { recipes[2].initializationOptions.extra = 1; }, message: /Unknown option/i },
      { mutate: (recipes) => { recipes[0].outputsToWatch = ["missingMetric"]; }, message: /Unknown template metric/i },
      { mutate: (recipes) => { recipes[0].recommendedTask = "predict"; }, message: /Invalid enum value|Invalid option/i },
      { mutate: (recipes) => { recipes[0].seed = "unsafe seed"; }, message: /Invalid/i },
      { mutate: (recipes) => { recipes[0].parameterOverrides.noise = Number.POSITIVE_INFINITY; }, message: /finite|Invalid/i },
      { mutate: (recipes) => { recipes[0].capabilities = { customRuntime: true }; }, message: /Unrecognized key|Invalid/i }
    ];
    for (const testCase of cases) {
      const recipes = cloneRecipes();
      testCase.mutate(recipes);
      expect(() => validateStarterWorldLaunchRecipes(recipes)).toThrow(testCase.message);
    }
  });

  it("derives exact controlled differences and shared conditions from effective recipe scenarios", () => {
    const expectedDifferences: Record<string, string[]> = {
      "coordination-under-sensor-noise": ["parameters.noise"],
      "clustered-outbreak-starts": [
        "initializationOptions.centerX",
        "initializationOptions.centerY",
        "initializationOptions.hotspotCount",
        "initializationPresetId"
      ],
      "predator-pressure-recovery": ["parameters.initialPredators"],
      "patch-density-firebreaks": ["initializationPresetId"]
    };
    for (const comparison of preparedStarterComparisons) {
      expect(comparison.controlledDifferences.map((difference) => difference.field)).toEqual(
        expectedDifferences[comparison.starterWorldId]
      );
      expect(comparison.sharedConditions.some((condition) => condition.field === "seed")).toBe(true);
      expect(comparison.sharedConditions.some((condition) => condition.field.startsWith("parameters."))).toBe(true);
      const baseline = getStarterWorldLaunchRecipeById(comparison.baselineRecipeId)!;
      const contrast = getStarterWorldLaunchRecipeById(comparison.contrastRecipeId)!;
      expect(deriveRecipeConditions(baseline, contrast)).toEqual({
        controlledDifferences: comparison.controlledDifferences,
        sharedConditions: comparison.sharedConditions
      });
    }
    const outbreak = getPreparedStarterComparisonForWorld("clustered-outbreak-starts")!;
    expect(outbreak.sharedConditions).toContainEqual({
      field: "initializationOptions.initialInfectedCount",
      label: "Initial infected count",
      value: 9
    });
  });

  it("rejects invalid comparison roles, ownership, output references, empty differences, claims, and supplied derivations", () => {
    const duplicateId = cloneComparisons();
    duplicateId[1].id = duplicateId[0].id;
    expect(() => validatePreparedStarterComparisons(duplicateId, starterWorldLaunchRecipes)).toThrow(/Comparison ID.*duplicates/i);

    const duplicateQuestion = cloneComparisons();
    duplicateQuestion[1].question = duplicateQuestion[0].question;
    expect(() => validatePreparedStarterComparisons(duplicateQuestion, starterWorldLaunchRecipes)).toThrow(/Comparison question.*duplicates/i);

    const wrongRoleRecipes = cloneRecipes();
    wrongRoleRecipes[0].comparisonRole = "contrast";
    const wrongRoles = validateStarterWorldLaunchRecipes(wrongRoleRecipes);
    expect(() => validatePreparedStarterComparisons(cloneComparisons(), wrongRoles)).toThrow(/baseline role/i);

    const unsupportedOutput = cloneComparisons();
    unsupportedOutput[0].outputsToCompare = ["predatorCount"];
    expect(() => validatePreparedStarterComparisons(unsupportedOutput, starterWorldLaunchRecipes)).toThrow(/must exist in both recipes/i);

    const guaranteed = cloneComparisons();
    guaranteed[0].expectedPattern = "This proves that noise always causes fragmentation in every moving group.";
    expect(() => validatePreparedStarterComparisons(guaranteed, starterWorldLaunchRecipes)).toThrow(/bounded comparison language|prohibited/i);

    const generic = cloneComparisons();
    generic[0].expectedPattern = "Watch for changes in model behavior across these two prepared configurations.";
    expect(() => validatePreparedStarterComparisons(generic, starterWorldLaunchRecipes)).toThrow(/referenced output.*controlled difference/i);

    const unavailable = cloneComparisons();
    unavailable[0].suggestedProcedure[2] = "Publish the baseline result to Atlas before running the contrast.";
    expect(() => validatePreparedStarterComparisons(unavailable, starterWorldLaunchRecipes)).toThrow(/existing explicit World workflow/i);

    const supplied = cloneComparisons();
    supplied[0].controlledDifferences = [{ field: "fake", label: "Fake", baselineValue: 0, contrastValue: 1 }];
    expect(() => validatePreparedStarterComparisons(supplied, starterWorldLaunchRecipes)).toThrow(/Unrecognized key|Invalid/i);

    const sameConfiguration = cloneRecipes();
    sameConfiguration[1].initializationPresetId = sameConfiguration[0].initializationPresetId;
    sameConfiguration[1].parameterOverrides = structuredClone(sameConfiguration[0].parameterOverrides);
    delete sameConfiguration[1].initializationOptions;
    const validatedSame = validateStarterWorldLaunchRecipes(sameConfiguration);
    expect(() => validatePreparedStarterComparisons([cloneComparisons()[0]], validatedSame)).toThrow(/at least one actual/i);

    const seedMismatchRecipes = cloneRecipes();
    seedMismatchRecipes[1].seed = "different-seed-001";
    const validatedMismatch = validateStarterWorldLaunchRecipes(seedMismatchRecipes);
    expect(() => validatePreparedStarterComparisons([cloneComparisons()[0]], validatedMismatch)).toThrow(/claims a shared seed/i);
  });

  it("constructs all eight canonical recipe handoffs as fresh paused tick-0 scenarios", () => {
    for (const recipe of starterWorldLaunchRecipes) {
      const result = resolveStarterWorldLaunch({ starterId: recipe.starterWorldId, recipeId: recipe.id });
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(result.message);
      }
      expect(result.launch.href).toBe(`/world?starter=${recipe.starterWorldId}&recipe=${recipe.id}`);
      expect(result.launch.recipeId).toBe(recipe.id);
      expect(result.launch.scenarioId).toBe(recipe.initializationPresetId);
      expect(result.launch.task).toBe(recipe.recommendedTask);
      const scenario = createStarterWorldScenario(result.launch);
      const { engine } = createEngineFromScenario(scenario);
      expect(scenario.templateId).toBe(recipe.templateId);
      expect(scenario.seed).toBe(recipe.seed);
      expect(scenario.metadata.starterWorldRecipeId).toBe(recipe.id);
      expect(engine.createSnapshot().tick).toBe(0);
      expect(engine.clock.running).toBe(false);
      for (const [key, value] of Object.entries(recipe.parameterOverrides)) {
        expect(scenario.parameters[key]).toBe(value);
      }
    }
  });

  it("runs every prepared pair for its stated horizon with deterministic, inspectable output differences", () => {
    for (const comparison of preparedStarterComparisons) {
      const baselineRecipe = getStarterWorldLaunchRecipeById(comparison.baselineRecipeId)!;
      const contrastRecipe = getStarterWorldLaunchRecipeById(comparison.contrastRecipeId)!;
      const baselineScenario = scenarioForRecipe(baselineRecipe.id);
      const contrastScenario = scenarioForRecipe(contrastRecipe.id);
      const baselineEngine = createEngineFromScenario(baselineScenario).engine;
      const contrastEngine = createEngineFromScenario(contrastScenario).engine;
      baselineEngine.runSteps(baselineRecipe.suggestedRunHorizon);
      contrastEngine.runSteps(contrastRecipe.suggestedRunHorizon);
      const baselineSnapshot = baselineEngine.createSnapshot();
      const contrastSnapshot = contrastEngine.createSnapshot();
      const baselineHistory = baselineSnapshot.metricsHistory.map((entry) =>
        comparison.outputsToCompare.map((output) => entry.values[output])
      );
      const contrastHistory = contrastSnapshot.metricsHistory.map((entry) =>
        comparison.outputsToCompare.map((output) => entry.values[output])
      );
      expect(baselineHistory).not.toEqual(contrastHistory);
      for (const history of [baselineHistory, contrastHistory]) {
        expect(history.flat().every((value) => typeof value === "number" && Number.isFinite(value))).toBe(true);
      }
      const repeat = createEngineFromScenario(baselineScenario).engine;
      repeat.runSteps(baselineRecipe.suggestedRunHorizon);
      expect(repeat.createSnapshot().metricsHistory).toEqual(baselineSnapshot.metricsHistory);
    }

    const connected = engineAfterRecipe("fire-connected-fuel");
    const corridor = engineAfterRecipe("fire-corridor-break");
    expect(Number(connected.metricsHistory.at(-1)?.values.burnedTotalCount)).toBeGreaterThan(
      Number(corridor.metricsHistory.at(-1)?.values.burnedTotalCount)
    );
  }, 60_000);

  it("rejects missing, unknown, mismatched, malformed, and arbitrary recipe launch inputs", () => {
    expect(resolveStarterWorldLaunch({ starterId: "coordination-under-sensor-noise" })).toMatchObject({ ok: false, code: "missing-recipe" });
    expect(resolveStarterWorldLaunch({ starterId: "coordination-under-sensor-noise", recipeId: "missing-recipe" })).toMatchObject({ ok: false, code: "unknown-recipe" });
    expect(resolveStarterWorldLaunch({ starterId: "coordination-under-sensor-noise", recipeId: "outbreak-one-cluster" })).toMatchObject({ ok: false, code: "recipe-mismatch" });
    expect(resolveStarterWorldLaunch({ starterId: "coordination-under-sensor-noise", recipeId: "Bad Recipe" })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(resolveStarterWorldLaunch({ starterId: "coordination-under-sensor-noise", recipeId: "coordination-clear-signals", parameters: { noise: 0.5 } })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(starterWorldLaunchHref("coordination-under-sensor-noise", "coordination-clear-signals")).toBe(
      "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals"
    );
  });

  it("keeps paired navigation explicit and does not mutate the current recipe", () => {
    for (const recipe of starterWorldLaunchRecipes) {
      const sibling = getSiblingStarterWorldRecipe(recipe.id)!;
      expect(sibling.id).not.toBe(recipe.id);
      expect(sibling.starterWorldId).toBe(recipe.starterWorldId);
      expect(sibling.comparisonRole).not.toBe(recipe.comparisonRole);
      expect(getSiblingStarterWorldRecipe(sibling.id)?.id).toBe(recipe.id);
    }
  });

  it("does not mutate authoritative parameter defaults, bounds, or preset definitions while constructing recipes", () => {
    const before = JSON.stringify(productionTemplates.map((template) => ({
      id: template.id,
      parameters: template.parameterDefinitions,
      presets: template.initializationPresets
    })));
    for (const recipe of starterWorldLaunchRecipes) {
      const launch = resolveStarterWorldLaunch({ starterId: recipe.starterWorldId, recipeId: recipe.id });
      if (!launch.ok) {
        throw new Error(launch.message);
      }
      createStarterWorldScenario(launch.launch);
    }
    const after = JSON.stringify(productionTemplates.map((template) => ({
      id: template.id,
      parameters: template.parameterDefinitions,
      presets: template.initializationPresets
    })));
    expect(after).toBe(before);
  });

  it("adds no persistence, arbitrary execution, runtime capability, or storage-key path", () => {
    const source = ["definitions.ts", "registry.ts", "types.ts", "validation.ts"]
      .map((file) => readFileSync(join(process.cwd(), "src", "lib", "starterWorlds", "packs", file), "utf8"))
      .join("\n");
    expect(source).not.toMatch(/localStorage|sessionStorage|IndexedDB|document\.cookie|createJSONStorage|persist\(|storageKey/);
    expect(source).not.toMatch(/Math\.random|eval\(|new Function|compilerPayload|formulaPayload|capabilityFlags|RunConfig/);
  });

  it("preserves strict direct schemas and rejects unsafe prototype-like values", () => {
    const recipe = cloneRecipes()[0];
    Object.defineProperty(recipe.parameterOverrides, "__proto__", { value: { polluted: true }, enumerable: true });
    expect(() => validateStarterWorldLaunchRecipes([recipe])).toThrow(/Unsafe object key/i);

    const exposedId = cloneRecipes();
    exposedId[0].title = exposedId[0].id;
    expect(() => validateStarterWorldLaunchRecipes(exposedId)).toThrow(/must not expose internal ID/i);
  });
});

function clonePacks(): any[] {
  return structuredClone(rawStarterWorldPackDefinitions) as any[];
}

function cloneRecipes(): any[] {
  return structuredClone(rawStarterWorldLaunchRecipes) as any[];
}

function cloneComparisons(): any[] {
  return structuredClone(rawPreparedStarterComparisonDeclarations) as any[];
}

function scenarioForRecipe(recipeId: string) {
  const recipe = getStarterWorldLaunchRecipeById(recipeId)!;
  const launch = resolveStarterWorldLaunch({ starterId: recipe.starterWorldId, recipeId });
  if (!launch.ok) {
    throw new Error(launch.message);
  }
  return createStarterWorldScenario(launch.launch);
}

function engineAfterRecipe(recipeId: string) {
  const recipe = getStarterWorldLaunchRecipeById(recipeId)!;
  const engine = createEngineFromScenario(scenarioForRecipe(recipeId)).engine;
  engine.runSteps(recipe.suggestedRunHorizon);
  return engine.createSnapshot();
}
