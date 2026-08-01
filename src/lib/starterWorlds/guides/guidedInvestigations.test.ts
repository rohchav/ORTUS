import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createEngineFromScenario } from "../../../simulation";
import { createStarterWorldScenario, resolveStarterWorldLaunch } from "../launch";
import { rawGuidedInvestigationDefinitions } from "./definitions";
import {
  deriveGuidedInvestigationAuthority,
  deriveRequiredGuidedInvestigationFacts,
  phaseForGuidedRecipe
} from "./derived";
import { guidedInvestigations } from "./registry";
import {
  guidedInvestigationActionTypes,
  guidedInvestigationDefinitionSchema,
  guidedInvestigationModes,
  guidedInvestigationSchemaVersion,
  guidedInvestigationTechnicalChecks
} from "./types";
import { validateGuidedInvestigationDefinitions } from "./validation";

describe("Reading a Flock guided investigation", () => {
  it("registers one strict versioned prepared-pair guide deterministically", () => {
    expect(guidedInvestigationSchemaVersion).toBe("1");
    expect(guidedInvestigationModes).toEqual(["prepared-pair-reading"]);
    expect(guidedInvestigations).toHaveLength(1);
    expect(guidedInvestigations[0]).toMatchObject({
      id: "reading-a-flock",
      slug: "reading-a-flock",
      title: "Reading a Flock",
      version: "1",
      mode: "prepared-pair-reading",
      packId: "local-rules-global-patterns",
      starterWorldId: "coordination-under-sensor-noise",
      preparedComparisonId: "coordination-noise-comparison"
    });
    expect(validateGuidedInvestigationDefinitions(cloneGuides())).toEqual(guidedInvestigations);
  });

  it("recursively freezes every registry object, phase, step, action, and check list", () => {
    expectRecursivelyFrozen(guidedInvestigations);
    const guide = guidedInvestigations[0]!;
    expect(Reflect.set(guide, "title", "Changed")).toBe(false);
    expect(Reflect.set(guide.phases[0]!.steps[0]!, "title", "Changed")).toBe(false);
    expect(guide.title).toBe("Reading a Flock");
  });

  it("derives recipes, values, shared facts, outputs, horizons, and canonical URLs from audited authorities", () => {
    const authority = deriveGuidedInvestigationAuthority("reading-a-flock");
    expect(authority.baselineRecipe.id).toBe("coordination-clear-signals");
    expect(authority.contrastRecipe.id).toBe("coordination-noisy-signals");
    expect(authority.controlledDifference).toEqual({
      field: "parameters.noise",
      label: "Noise",
      baselineValue: 0.01,
      contrastValue: 0.28
    });
    expect(authority.sharedSeed).toBe("c2-coordination-001");
    expect(authority.sharedEntityCount).toBe(160);
    expect(authority.tickZeroSummary).toMatch(/160 boids have matching positions and headings/i);
    expect(authority.focusOutputs).toEqual([
      {
        metricId: "alignmentScore",
        label: "Alignment score",
        description: "Compare the model-output heading-similarity history; it is not a measurement of animal coordination."
      },
      {
        metricId: "dispersion",
        label: "Dispersion",
        description: "Follow how broadly the abstract moving agents occupy the field."
      }
    ]);
    expect(authority.suggestedRunHorizon).toBe(240);
    expect(authority.baselineHref).toBe(
      "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock"
    );
    expect(authority.contrastHref).toBe(
      "/world?starter=coordination-under-sensor-noise&recipe=coordination-noisy-signals&guide=reading-a-flock"
    );
    expect(phaseForGuidedRecipe(authority, authority.baselineRecipe.id).recipeRole).toBe("baseline");
    expect(phaseForGuidedRecipe(authority, authority.contrastRecipe.id).recipeRole).toBe("contrast");
    expect(() => phaseForGuidedRecipe(authority, "outbreak-one-cluster")).toThrow(/does not belong/i);
  });

  it("fails closed when the audited comparison no longer supplies a required guide fact", () => {
    const authority = deriveGuidedInvestigationAuthority("reading-a-flock");
    const source = () => ({
      guide: structuredClone(authority.guide),
      world: structuredClone(authority.world),
      comparison: structuredClone(authority.comparison),
      baselineRecipe: structuredClone(authority.baselineRecipe),
      contrastRecipe: structuredClone(authority.contrastRecipe)
    });
    const cases: Array<{ name: string; mutate: (value: ReturnType<typeof source>) => void; message: RegExp }> = [
      {
        name: "Noise difference",
        mutate: (value) => { value.comparison.controlledDifferences = []; },
        message: /Noise difference/i
      },
      {
        name: "shared seed",
        mutate: (value) => { value.comparison.sharedConditions = value.comparison.sharedConditions.filter((item) => item.field !== "seed"); },
        message: /shared seed/i
      },
      {
        name: "entity count",
        mutate: (value) => { value.comparison.sharedConditions = value.comparison.sharedConditions.filter((item) => item.field !== "parameters.agentCount"); },
        message: /entity count/i
      },
      {
        name: "tick-zero match",
        mutate: (value) => { value.comparison.tickZeroSummary = "The prepared starts are undocumented."; },
        message: /tick-zero/i
      },
      {
        name: "output authority",
        mutate: (value) => { value.comparison.outputsToCompare = ["alignmentScore"]; },
        message: /no longer authoritative/i
      },
      {
        name: "shared horizon",
        mutate: (value) => { value.contrastRecipe.suggestedRunHorizon += 1; },
        message: /shared prepared run horizon/i
      }
    ];
    for (const testCase of cases) {
      const drifted = source();
      testCase.mutate(drifted);
      expect(() => deriveRequiredGuidedInvestigationFacts(drifted), testCase.name).toThrow(testCase.message);
    }
  });

  it("rejects broken references, duplicate structure, unbounded actions, runtime payloads, expected results, and persistence fields", () => {
    const cases: Array<{ name: string; mutate: (guides: any[]) => void; message: RegExp }> = [
      { name: "duplicate id", mutate: (guides) => guides.push({ ...structuredClone(guides[0]), slug: "other-guide" }), message: /Guide ID.*duplicates/i },
      { name: "duplicate slug", mutate: (guides) => guides.push({ ...structuredClone(guides[0]), id: "other-guide" }), message: /Guide slug.*duplicates/i },
      { name: "unknown pack", mutate: (guides) => { guides[0].packId = "missing-pack"; }, message: /Unknown Starter World pack/i },
      { name: "unknown world", mutate: (guides) => { guides[0].starterWorldId = "missing-world"; }, message: /Unknown Starter World/i },
      { name: "world outside pack", mutate: (guides) => { guides[0].starterWorldId = "flocking"; }, message: /does not belong|another Starter World/i },
      { name: "unknown comparison", mutate: (guides) => { guides[0].preparedComparisonId = "missing-comparison"; }, message: /Unknown prepared comparison/i },
      { name: "unrelated comparison", mutate: (guides) => { guides[0].preparedComparisonId = "outbreak-geometry-comparison"; }, message: /another Starter World|guided Starter World/i },
      { name: "unsupported output", mutate: (guides) => { guides[0].focusOutputIds[0] = "infectedCount"; }, message: /not in the prepared comparison|not available/i },
      { name: "duplicate output", mutate: (guides) => { guides[0].focusOutputIds[1] = guides[0].focusOutputIds[0]; }, message: /must be unique/i },
      { name: "empty phases", mutate: (guides) => { guides[0].phases = []; }, message: /at least 2|too small/i },
      { name: "duplicate phase", mutate: (guides) => { guides[0].phases[1].id = guides[0].phases[0].id; }, message: /Phase ID.*duplicated/i },
      { name: "duplicate phase role", mutate: (guides) => { guides[0].phases[1].recipeRole = "baseline"; }, message: /role.*duplicated|baseline and one contrast/i },
      { name: "duplicate step", mutate: (guides) => { guides[0].phases[1].steps[0].id = guides[0].phases[0].steps[0].id; }, message: /Step ID.*duplicated/i },
      { name: "invalid action", mutate: (guides) => { guides[0].phases[0].steps[0].actions[0] = { type: "run-code" }; }, message: /Invalid|union/i },
      { name: "unsupported task", mutate: (guides) => { guides[0].phases[0].steps[0].actions[1].task = "debug"; }, message: /Invalid input|Invalid enum value|Invalid option/i },
      { name: "invalid check", mutate: (guides) => { guides[0].phases[0].steps[0].technicalChecks[0] = "learner-understood"; }, message: /Invalid enum value|Invalid option/i },
      { name: "arbitrary condition", mutate: (guides) => { guides[0].phases[0].steps[0].condition = { when: "tick > 10" }; }, message: /Unrecognized key/i },
      { name: "arbitrary runtime", mutate: (guides) => { guides[0].runConfig = { ticks: 240 }; }, message: /Unrecognized key/i },
      { name: "parameter payload", mutate: (guides) => { guides[0].parameterOverrides = { noise: 0.5 }; }, message: /Unrecognized key/i },
      { name: "expected result payload", mutate: (guides) => { guides[0].expectedResults = { alignment: 1 }; }, message: /Unrecognized key/i },
      { name: "progress storage", mutate: (guides) => { guides[0].progressionStorage = { key: "guide" }; }, message: /Unrecognized key/i },
      { name: "numeric expected result copy", mutate: (guides) => { guides[0].summary = "The expected Alignment result is 0.9 after the prepared run finishes."; }, message: /numeric recipe values or expected results/i },
      { name: "unsupported claim", mutate: (guides) => { guides[0].summary = "This proves that the flock always fragments and validates a causal effect in reality."; }, message: /prohibited scientific or learning claim/i },
      { name: "callback", mutate: (guides) => { guides[0].onComplete = () => true; }, message: /data values only/i }
    ];
    for (const testCase of cases) {
      const guides = cloneGuides();
      testCase.mutate(guides);
      expect(() => validateGuidedInvestigationDefinitions(guides), testCase.name).toThrow(testCase.message);
    }

    const unsafe = cloneGuides();
    Object.defineProperty(unsafe[0], "__proto__", { value: { polluted: true }, enumerable: true });
    expect(() => validateGuidedInvestigationDefinitions(unsafe)).toThrow(/Unsafe object key/i);
    expect(guidedInvestigationDefinitionSchema.safeParse({ ...guidedInvestigations[0], score: 1 }).success).toBe(false);
  });

  it("accepts only baseline and contrast guided handoffs and constructs fresh paused tick-zero worlds", () => {
    const authorities = deriveGuidedInvestigationAuthority("reading-a-flock");
    const launches = [
      resolveStarterWorldLaunch({
        starterId: authorities.world.id,
        recipeId: authorities.baselineRecipe.id,
        guideId: authorities.guide.id
      }),
      resolveStarterWorldLaunch({
        starterId: authorities.world.id,
        recipeId: authorities.contrastRecipe.id,
        guideId: authorities.guide.id
      })
    ];
    for (const result of launches) {
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.message);
      expect(result.launch.guideId).toBe("reading-a-flock");
      expect(result.launch.templateId).toBe("flocking-boids");
      expect(result.launch.task).toBe("observe");
      const scenario = createStarterWorldScenario(result.launch);
      const engine = createEngineFromScenario(scenario).engine;
      expect(engine.createSnapshot().tick).toBe(0);
      expect(engine.clock.running).toBe(false);
      expect(scenario.seed).toBe(authorities.sharedSeed);
      expect(scenario.metadata).not.toHaveProperty("guideId");
    }
    const baselineResult = launches[0]!;
    const contrastResult = launches[1]!;
    if (!baselineResult.ok || !contrastResult.ok) throw new Error("Expected valid launches");
    expect(createStarterWorldScenario(baselineResult.launch)).not.toBe(createStarterWorldScenario(contrastResult.launch));
  });

  it("rejects unknown, malformed, incomplete, unrelated, and payload-bearing guided launches", () => {
    const baseline = {
      starterId: "coordination-under-sensor-noise",
      recipeId: "coordination-clear-signals",
      guideId: "reading-a-flock"
    };
    expect(resolveStarterWorldLaunch({ ...baseline, guideId: "missing-guide" })).toMatchObject({ ok: false, code: "unknown-guide" });
    expect(resolveStarterWorldLaunch({ ...baseline, guideId: "Bad Guide" })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(resolveStarterWorldLaunch({ starterId: baseline.starterId, guideId: baseline.guideId })).toMatchObject({ ok: false, code: "missing-guide-recipe" });
    expect(resolveStarterWorldLaunch({ ...baseline, starterId: "clustered-outbreak-starts", recipeId: "outbreak-one-cluster" })).toMatchObject({ ok: false, code: "guide-mismatch" });
    expect(resolveStarterWorldLaunch({ ...baseline, recipeId: "outbreak-one-cluster" })).toMatchObject({ ok: false, code: "recipe-mismatch" });
    expect(resolveStarterWorldLaunch({ ...baseline, step: 2 })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(resolveStarterWorldLaunch({ ...baseline, progress: "complete" })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(resolveStarterWorldLaunch({ ...baseline, parameters: { noise: 0.5 } })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(resolveStarterWorldLaunch({ ...baseline, guideState: { step: 2 } })).toMatchObject({ ok: false, code: "invalid-request" });
  });

  it("keeps the audited tick-zero match and fixed-seed output distinction intact without exposing expected values in guide copy", () => {
    const authority = deriveGuidedInvestigationAuthority("reading-a-flock");
    const baselineLaunch = resolveStarterWorldLaunch({
      starterId: authority.world.id,
      recipeId: authority.baselineRecipe.id,
      guideId: authority.guide.id
    });
    const contrastLaunch = resolveStarterWorldLaunch({
      starterId: authority.world.id,
      recipeId: authority.contrastRecipe.id,
      guideId: authority.guide.id
    });
    if (!baselineLaunch.ok || !contrastLaunch.ok) throw new Error("Expected valid guide launches");
    const baselineEngine = createEngineFromScenario(createStarterWorldScenario(baselineLaunch.launch)).engine;
    const contrastEngine = createEngineFromScenario(createStarterWorldScenario(contrastLaunch.launch)).engine;
    const baselineStart = baselineEngine.createSnapshot();
    const contrastStart = contrastEngine.createSnapshot();
    expect(baselineStart.entities).toHaveLength(authority.sharedEntityCount);
    expect(baselineStart.entities).toEqual(contrastStart.entities);
    expect(baselineStart.components).toEqual(contrastStart.components);
    expect(baselineStart.spaces).toEqual(contrastStart.spaces);

    baselineEngine.runSteps(authority.suggestedRunHorizon);
    contrastEngine.runSteps(authority.suggestedRunHorizon);
    const baselineMetrics = baselineEngine.createSnapshot().metricsHistory.at(-1)!.values;
    const contrastMetrics = contrastEngine.createSnapshot().metricsHistory.at(-1)!.values;
    expect(baselineMetrics.alignmentScore).toBeCloseTo(0.992133, 6);
    expect(contrastMetrics.alignmentScore).toBeCloseTo(0.647431, 6);
    expect(baselineMetrics.dispersion).toBeCloseTo(37.678772, 6);
    expect(contrastMetrics.dispersion).toBeCloseTo(38.055022, 6);
    expect(Math.abs(baselineMetrics.alignmentScore! - contrastMetrics.alignmentScore!)).toBeGreaterThan(0.3);
    expect(Math.abs(baselineMetrics.dispersion! - contrastMetrics.dispersion!)).toBeLessThan(1);

    const guideCopy = JSON.stringify(rawGuidedInvestigationDefinitions);
    expect(guideCopy).not.toContain("0.992133");
    expect(guideCopy).not.toContain("0.647431");
    expect(guideCopy).not.toContain("37.678772");
    expect(guideCopy).not.toContain("38.055022");
    expect(guideCopy).not.toMatch(/guaranteed fragmentation|guaranteed spread increase|statistical significance|causal proof|robustness evidence/i);
  }, 60_000);

  it("keeps the guide source data-only, non-executable, and free of persistence paths", () => {
    expect(guidedInvestigationActionTypes).toEqual([
      "open-task", "inspect-start", "run-prepared-world", "inspect-outputs", "open-compare",
      "launch-paired-recipe", "review-differences", "reflect", "exit-guide"
    ]);
    expect(guidedInvestigationTechnicalChecks).toEqual([
      "correct-recipe-loaded", "run-is-paused", "tick-is-zero", "tick-reached-horizon",
      "task-is-visible", "metric-is-available", "comparison-summary-exists", "paired-recipe-loaded"
    ]);
    const source = ["definitions.ts", "derived.ts", "registry.ts", "types.ts", "validation.ts"]
      .map((file) => readFileSync(join(process.cwd(), "src", "lib", "starterWorlds", "guides", file), "utf8"))
      .join("\n");
    expect(source).not.toMatch(/localStorage|sessionStorage|IndexedDB|document\.cookie|createJSONStorage|persist\(|storageKey/);
    expect(source).not.toMatch(/Math\.random|eval\(|new Function|dynamic import|compilerPayload|formulaPayload|LLM/);
  });
});

function cloneGuides(): any[] {
  return structuredClone(rawGuidedInvestigationDefinitions) as any[];
}

function expectRecursivelyFrozen(value: unknown, seen = new WeakSet<object>()): void {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value as Record<string, unknown>)) {
    expectRecursivelyFrozen(child, seen);
  }
}
