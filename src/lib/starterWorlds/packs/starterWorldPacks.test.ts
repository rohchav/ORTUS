import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createEngineFromScenario,
  productionTemplates,
  type ParameterValues,
  type SimulationSnapshotView
} from "../../../simulation";
import { Position2D, Velocity2D, InfectionState } from "../../../simulation/templates/epidemic.template";
import { Species } from "../../../simulation/templates/predatorPrey.template";
import {
  ForestFireCellPosition,
  ForestFireCellState,
  type ForestFireCellStateComponent
} from "../../../simulation/templates/forestFire.template";
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
    for (const value of [
      starterWorldPacks,
      pack,
      pack.worldIds,
      pack.mechanisms,
      starterWorldLaunchRecipes,
      recipe,
      recipe.parameterOverrides,
      preparedStarterComparisons,
      comparison,
      comparison.controlledDifferences,
      comparison.controlledDifferences[0],
      comparison.sharedConditions,
      comparison.sharedConditions[0],
      comparison.outputsToCompare,
      comparison.suggestedProcedure
    ]) {
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

    const baselineTwice = cloneComparisons();
    baselineTwice[0].contrastRecipeId = baselineTwice[0].baselineRecipeId;
    expect(() => validatePreparedStarterComparisons(baselineTwice, starterWorldLaunchRecipes)).toThrow(/different recipes/i);

    const contrastTwice = cloneComparisons();
    contrastTwice[0].baselineRecipeId = contrastTwice[0].contrastRecipeId;
    expect(() => validatePreparedStarterComparisons(contrastTwice, starterWorldLaunchRecipes)).toThrow(/different recipes/i);

    const differentWorlds = cloneComparisons();
    differentWorlds[0].contrastRecipeId = "outbreak-separated-hotspots";
    expect(() => validatePreparedStarterComparisons(differentWorlds, starterWorldLaunchRecipes)).toThrow(/Starter World|template IDs/i);

    const differentTemplates = structuredClone(starterWorldLaunchRecipes) as any[];
    differentTemplates[1].templateId = "epidemic-spread";
    expect(() => validatePreparedStarterComparisons([cloneComparisons()[0]], differentTemplates)).toThrow(/template IDs must match/i);

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

    const unsafe = cloneComparisons();
    Object.defineProperty(unsafe[0], "__proto__", { value: { polluted: true }, enumerable: true });
    expect(() => validatePreparedStarterComparisons(unsafe, starterWorldLaunchRecipes)).toThrow(/Unsafe object key/i);

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
      expect(scenario.initializationPreset).toBe(expectedRecipeScenarios[recipe.id]!.preset);
      expect(scenario.parameters).toEqual(expectedRecipeScenarios[recipe.id]!.parameters);
      expect(scenario.initializationOptions).toEqual(expectedRecipeScenarios[recipe.id]!.initializationOptions);
      expect(engine.createSnapshot().tick).toBe(0);
      expect(engine.clock.running).toBe(false);
      for (const [key, value] of Object.entries(recipe.parameterOverrides)) {
        expect(scenario.parameters[key]).toBe(value);
      }
    }
  });

  it("audits the material tick-0 state of every prepared pair", () => {
    const snapshots = new Map(
      starterWorldLaunchRecipes.map((recipe) => [recipe.id, snapshotForRecipe(recipe.id)] as const)
    );

    const clear = snapshots.get("coordination-clear-signals")!;
    const noisy = snapshots.get("coordination-noisy-signals")!;
    expect(clear.entities).toHaveLength(160);
    expect(clear.entities).toEqual(noisy.entities);
    expect(clear.components).toEqual(noisy.components);
    expect(clear.spaces).toEqual(noisy.spaces);
    expect(spaceGeometry(clear)).toEqual([
      { id: "flocking-space", kind: "continuous2d", width: 100, height: 100, boundaryMode: "wrap" }
    ]);

    const cluster = snapshots.get("outbreak-one-cluster")!;
    const hotspots = snapshots.get("outbreak-separated-hotspots")!;
    expect(cluster.entities).toHaveLength(80);
    expect(cluster.components[Position2D]).toEqual(hotspots.components[Position2D]);
    expect(cluster.components[Velocity2D]).toEqual(hotspots.components[Velocity2D]);
    expect(cluster.spaces).toEqual(hotspots.spaces);
    expect(infectionCounts(cluster)).toEqual({ susceptible: 71, infected: 9, recovered: 0 });
    expect(infectionCounts(hotspots)).toEqual({ susceptible: 71, infected: 9, recovered: 0 });
    const clusterPoints = infectedPositions(cluster);
    const hotspotPoints = infectedPositions(hotspots);
    expect(Math.max(...clusterPoints.map((point) => distance(point, { x: 50, y: 50 })))).toBeLessThan(18);
    expect(connectedComponentCount(hotspotPoints, 20)).toBe(3);
    expect(infectedEntityIds(cluster)).not.toEqual(infectedEntityIds(hotspots));
    expect(spaceGeometry(cluster)).toEqual([
      { id: "epidemic-space", kind: "continuous2d", width: 100, height: 100, boundaryMode: "wrap" }
    ]);

    const recovery = snapshots.get("predator-recovery-margin")!;
    const pressure = snapshots.get("predator-high-pressure")!;
    expect(speciesCounts(recovery)).toEqual({ prey: 160, predator: 2 });
    expect(speciesCounts(pressure)).toEqual({ prey: 160, predator: 12 });
    expect(recovery.entities).toHaveLength(162);
    expect(pressure.entities).toHaveLength(172);
    expect(spaceGeometry(recovery)).toEqual(spaceGeometry(pressure));
    for (const [component, baselineValues] of Object.entries(recovery.components)) {
      for (const entity of recovery.entities) {
        expect(pressure.components[component]?.[entity.id]).toEqual(baselineValues[entity.id]);
      }
    }

    const connected = snapshots.get("fire-connected-fuel")!;
    const corridor = snapshots.get("fire-corridor-break")!;
    expect(forestFireCounts(connected)).toEqual({ empty: 0, fuel: 2399, burning: 1, burned: 0 });
    expect(forestFireCounts(corridor)).toEqual({ empty: 40, fuel: 2359, burning: 1, burned: 0 });
    expect(spaceGeometry(connected)).toEqual([
      { id: "forest-fire-grid", kind: "grid2d", rows: 40, cols: 60, boundaryMode: "clamp" }
    ]);
    expect(spaceGeometry(corridor)).toEqual(spaceGeometry(connected));
    const corridorStates = forestFireStatesByPoint(corridor);
    for (let row = 0; row < 40; row += 1) {
      expect(corridorStates.get(`40,${row}`)).toBe("empty");
    }
    expect(burningPoints(connected)).toEqual([{ x: 29, y: 19 }]);
    expect(burningPoints(corridor)).toEqual([{ x: 29, y: 19 }]);
  });

  it("runs both members of every pair to the documented horizon with exact deterministic model evidence", () => {
    const completed = new Map<string, SimulationSnapshotView>();
    for (const recipe of starterWorldLaunchRecipes) {
      const scenario = scenarioForRecipe(recipe.id);
      const engine = createEngineFromScenario(scenario).engine;
      engine.runSteps(recipe.suggestedRunHorizon);
      const snapshot = engine.createSnapshot();
      expect(snapshot.tick).toBe(recipe.suggestedRunHorizon);
      expect(metricSummary(snapshot, recipe.outputsToWatch)).toEqual(expectedMetricSummaries[recipe.id]);
      expect(snapshot.metricsHistory.every((entry) =>
        recipe.outputsToWatch.every((output) => Number.isFinite(entry.values[output]))
      )).toBe(true);
      completed.set(recipe.id, snapshot);

      const repeat = createEngineFromScenario(scenario).engine;
      repeat.runSteps(recipe.suggestedRunHorizon);
      expect(repeat.createSnapshot().metricsHistory).toEqual(snapshot.metricsHistory);
    }

    for (const comparison of preparedStarterComparisons) {
      const baselineRecipe = getStarterWorldLaunchRecipeById(comparison.baselineRecipeId)!;
      const contrastRecipe = getStarterWorldLaunchRecipeById(comparison.contrastRecipeId)!;
      expect(baselineRecipe.suggestedRunHorizon).toBe(contrastRecipe.suggestedRunHorizon);
      expect(completed.get(baselineRecipe.id)?.metricsHistory).not.toEqual(
        completed.get(contrastRecipe.id)?.metricsHistory
      );
    }

    const corridor = completed.get("fire-corridor-break")!;
    expect(forestFireCounts(corridor)).toEqual({ empty: 40, fuel: 760, burning: 0, burned: 1600 });
    const states = forestFireStatesByPoint(corridor);
    for (let row = 0; row < 40; row += 1) {
      expect(states.get(`40,${row}`)).toBe("empty");
      for (let column = 41; column < 60; column += 1) {
        expect(states.get(`${column},${row}`)).toBe("fuel");
      }
    }
  }, 120_000);

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

const expectedRecipeScenarios: Record<
  string,
  { preset: string; parameters: ParameterValues; initializationOptions: ParameterValues }
> = {
  "coordination-clear-signals": {
    preset: "random-headings",
    parameters: {
      agentCount: 160,
      perceptionRadius: 30,
      separationRadius: 10,
      alignmentWeight: 0.55,
      cohesionWeight: 0.35,
      separationWeight: 0.9,
      maxSpeed: 2.4,
      maxForce: 0.08,
      noise: 0.01,
      boundaryMode: "wrap"
    },
    initializationOptions: {}
  },
  "coordination-noisy-signals": {
    preset: "random-headings",
    parameters: {
      agentCount: 160,
      perceptionRadius: 30,
      separationRadius: 10,
      alignmentWeight: 0.55,
      cohesionWeight: 0.35,
      separationWeight: 0.9,
      maxSpeed: 2.4,
      maxForce: 0.08,
      noise: 0.28,
      boundaryMode: "wrap"
    },
    initializationOptions: {}
  },
  "outbreak-one-cluster": {
    preset: "single-cluster-outbreak",
    parameters: {
      agentCount: 80,
      initialInfected: 9,
      infectionRadius: 8,
      infectionProbability: 0.22,
      recoveryTicks: 45,
      movementSpeed: 1.1
    },
    initializationOptions: { initialInfectedCount: 9, centerX: 50, centerY: 50 }
  },
  "outbreak-separated-hotspots": {
    preset: "multiple-hotspots",
    parameters: {
      agentCount: 80,
      initialInfected: 9,
      infectionRadius: 8,
      infectionProbability: 0.22,
      recoveryTicks: 45,
      movementSpeed: 1.1
    },
    initializationOptions: { initialInfectedCount: 9, hotspotCount: 3 }
  },
  "predator-recovery-margin": {
    preset: "random-ecology",
    parameters: {
      initialPrey: 160,
      initialPredators: 2,
      preyReproductionProbability: 0.015,
      predatorEnergyLoss: 0.25,
      predatorEnergyGain: 8,
      predatorReproductionThreshold: 18,
      predationRadius: 1.5,
      movementSpeed: 1
    },
    initializationOptions: {}
  },
  "predator-high-pressure": {
    preset: "random-ecology",
    parameters: {
      initialPrey: 160,
      initialPredators: 12,
      preyReproductionProbability: 0.015,
      predatorEnergyLoss: 0.25,
      predatorEnergyGain: 8,
      predatorReproductionThreshold: 18,
      predationRadius: 1.5,
      movementSpeed: 1
    },
    initializationOptions: {}
  },
  "fire-connected-fuel": {
    preset: "central-ignition",
    parameters: {
      gridWidth: 60,
      gridHeight: 40,
      initialFuelDensity: 1,
      initialIgnitionCount: 1,
      spreadProbability: 1,
      lightningProbability: 0,
      regrowthProbability: 0,
      neighborMode: "vonNeumann",
      boundaryMode: "closed",
      burnDuration: 1
    },
    initializationOptions: {}
  },
  "fire-corridor-break": {
    preset: "firebreak-corridor",
    parameters: {
      gridWidth: 60,
      gridHeight: 40,
      initialFuelDensity: 1,
      initialIgnitionCount: 1,
      spreadProbability: 1,
      lightningProbability: 0,
      regrowthProbability: 0,
      neighborMode: "vonNeumann",
      boundaryMode: "closed",
      burnDuration: 1
    },
    initializationOptions: {}
  }
};

const expectedMetricSummaries: Record<string, Record<string, MetricSummary>> = {
  "coordination-clear-signals": {
    alignmentScore: { first: 0.052665, final: 0.992133, peak: 0.994385, peakTick: 220 },
    dispersion: { first: 38.042608, final: 37.678772, peak: 41.258838, peakTick: 114 }
  },
  "coordination-noisy-signals": {
    alignmentScore: { first: 0.048271, final: 0.647431, peak: 0.647431, peakTick: 240 },
    dispersion: { first: 38.05548, final: 38.055022, peak: 39.748028, peakTick: 49 }
  },
  "outbreak-one-cluster": {
    infectedCount: { first: 9, final: 0, peak: 61, peakTick: 42 },
    recoveredCount: { first: 0, final: 80, peak: 80, peakTick: 133 }
  },
  "outbreak-separated-hotspots": {
    infectedCount: { first: 9, final: 0, peak: 70, peakTick: 44 },
    recoveredCount: { first: 0, final: 80, peak: 80, peakTick: 103 }
  },
  "predator-recovery-margin": {
    preyCount: { first: 161, final: 0, peak: 420, peakTick: 82 },
    predatorCount: { first: 2, final: 0, peak: 325, peakTick: 131 }
  },
  "predator-high-pressure": {
    preyCount: { first: 158, final: 519, peak: 519, peakTick: 400 },
    predatorCount: { first: 15, final: 0, peak: 163, peakTick: 115 }
  },
  "fire-connected-fuel": {
    activeFireCount: { first: 4, final: 0, peak: 80, peakTick: 21 },
    burnedTotalCount: { first: 1, final: 2400, peak: 2400, peakTick: 51 },
    extinguished: { first: 0, final: 1, peak: 1, peakTick: 51 }
  },
  "fire-corridor-break": {
    activeFireCount: { first: 4, final: 0, peak: 60, peakTick: 20 },
    burnedTotalCount: { first: 1, final: 1600, peak: 1600, peakTick: 50 },
    extinguished: { first: 0, final: 1, peak: 1, peakTick: 50 }
  }
};

interface MetricSummary {
  first: number;
  final: number;
  peak: number;
  peakTick: number;
}

interface Point {
  x: number;
  y: number;
}

function scenarioForRecipe(recipeId: string) {
  const recipe = getStarterWorldLaunchRecipeById(recipeId)!;
  const launch = resolveStarterWorldLaunch({ starterId: recipe.starterWorldId, recipeId });
  if (!launch.ok) {
    throw new Error(launch.message);
  }
  return createStarterWorldScenario(launch.launch);
}

function snapshotForRecipe(recipeId: string): SimulationSnapshotView {
  return createEngineFromScenario(scenarioForRecipe(recipeId)).engine.createSnapshot();
}

function spaceGeometry(snapshot: SimulationSnapshotView) {
  return snapshot.spaces.map((space) => {
    if (space.kind === "continuous2d") {
      return {
        id: space.id,
        kind: space.kind,
        width: space.width,
        height: space.height,
        boundaryMode: space.boundaryMode
      };
    }
    if (space.kind === "grid2d") {
      return {
        id: space.id,
        kind: space.kind,
        rows: space.rows,
        cols: space.cols,
        boundaryMode: space.boundaryMode
      };
    }
    return { id: space.id, kind: space.kind };
  });
}

function infectionCounts(snapshot: SimulationSnapshotView) {
  const counts = { susceptible: 0, infected: 0, recovered: 0 };
  for (const state of Object.values(snapshot.components[InfectionState] ?? {}) as Array<{ status: keyof typeof counts }>) {
    counts[state.status] += 1;
  }
  return counts;
}

function infectedEntityIds(snapshot: SimulationSnapshotView): string[] {
  return Object.entries(snapshot.components[InfectionState] ?? {})
    .filter(([, value]) => value.status === "infected")
    .map(([entityId]) => entityId);
}

function infectedPositions(snapshot: SimulationSnapshotView): Point[] {
  const positions = snapshot.components[Position2D] ?? {};
  return infectedEntityIds(snapshot).map((entityId) => positions[entityId] as unknown as Point);
}

function connectedComponentCount(points: readonly Point[], maximumDistance: number): number {
  const remaining = new Set(points.map((_, index) => index));
  let count = 0;
  while (remaining.size > 0) {
    count += 1;
    const first = remaining.values().next().value as number;
    remaining.delete(first);
    const pending = [first];
    while (pending.length > 0) {
      const current = pending.pop()!;
      for (const candidate of [...remaining]) {
        if (distance(points[current]!, points[candidate]!) <= maximumDistance) {
          remaining.delete(candidate);
          pending.push(candidate);
        }
      }
    }
  }
  return count;
}

function distance(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function speciesCounts(snapshot: SimulationSnapshotView) {
  const counts = { prey: 0, predator: 0 };
  for (const value of Object.values(snapshot.components[Species] ?? {}) as Array<{ kind: keyof typeof counts }>) {
    counts[value.kind] += 1;
  }
  return counts;
}

function forestFireCounts(snapshot: SimulationSnapshotView) {
  const counts = { empty: 0, fuel: 0, burning: 0, burned: 0 };
  for (const value of Object.values(snapshot.components[ForestFireCellState] ?? {}) as ForestFireCellStateComponent[]) {
    counts[value.state] += 1;
  }
  return counts;
}

function forestFireStatesByPoint(snapshot: SimulationSnapshotView): Map<string, ForestFireCellStateComponent["state"]> {
  const positions = snapshot.components[ForestFireCellPosition] ?? {};
  const states = snapshot.components[ForestFireCellState] ?? {};
  return new Map(
    Object.entries(states).map(([entityId, value]) => {
      const point = positions[entityId] as unknown as Point;
      return [`${point.x},${point.y}`, (value as ForestFireCellStateComponent).state];
    })
  );
}

function burningPoints(snapshot: SimulationSnapshotView): Point[] {
  const positions = snapshot.components[ForestFireCellPosition] ?? {};
  return Object.entries(snapshot.components[ForestFireCellState] ?? {})
    .filter(([, value]) => value.state === "burning")
    .map(([entityId]) => positions[entityId] as unknown as Point);
}

function metricSummary(snapshot: SimulationSnapshotView, keys: readonly string[]): Record<string, MetricSummary> {
  return Object.fromEntries(
    keys.map((key) => {
      const values = snapshot.metricsHistory.map((entry) => entry.values[key]!);
      const peak = Math.max(...values);
      return [
        key,
        {
          first: round(values[0]!),
          final: round(values.at(-1)!),
          peak: round(peak),
          peakTick: snapshot.metricsHistory[values.indexOf(peak)]!.tick
        }
      ];
    })
  );
}

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
