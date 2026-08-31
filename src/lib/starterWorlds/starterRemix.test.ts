import { describe, expect, it } from "vitest";
import {
  runConfigFromScenario,
  supportsWorkerRuntime,
  validateRunConfig,
  validateScenario
} from "../../simulation";
import {
  classifyStarterRemixEligibility,
  consumeStarterRemixActiveWorldHandoff,
  createAcceptedLegacyRunConfig,
  createRemixAwareResetRunConfig,
  createStarterRemixDraftFromActiveRun,
  createStarterRemixWorldLaunch,
  prepareStarterRemixActiveWorldHandoff,
  readStarterRemixLineage,
  resolveStarterRemixRequest,
  resolveStarterRemixWorldLaunch,
  starterRemixLaunchMatchesMetadata,
  starterRemixMetadataKey,
  starterRemixWorkshopHref,
  starterRemixWorldHref
} from "./remix";
import { starterWorldLaunchRecipesForWorld } from "./packs";
import { starterWorlds } from "./registry";

const fixedNow = "2026-08-29T12:00:00.000Z";

describe("Starter to Remix contract", () => {
  it("classifies every current runnable Starter World from authoritative template controls", () => {
    const classifications = starterWorlds.map((world) => ({
      id: world.id,
      ...classifyStarterRemixEligibility(world)
    }));

    expect(classifications).toHaveLength(11);
    expect(classifications.every((classification) => classification.category === "A")).toBe(true);
    expect(classifications.every((classification) => classification.eligible)).toBe(true);
    expect(classifications.every((classification) => classification.editableParameterCount > 0)).toBe(true);
  });

  it("keeps every Starter derivative on its template's established runtime path", () => {
    const paths = starterWorlds.flatMap((world) => {
      const recipes = starterWorldLaunchRecipesForWorld(world.id);
      const recipeIds: Array<string | undefined> = recipes.length > 0
        ? recipes.map((recipe) => recipe.id)
        : [undefined];
      return recipeIds.map((recipeId) => {
        const result = resolveStarterRemixRequest({
          starterId: world.id,
          ...(recipeId ? { recipeId } : {})
        }, { now: fixedNow });
        expect(result.ok).toBe(true);
        if (!result.ok) {
          throw new Error(result.message);
        }
        const config = runConfigFromScenario(result.source.draft);
        return {
          starterWorldId: world.id,
          templateId: config.templateId,
          workerManaged: supportsWorkerRuntime(config.templateId)
        };
      });
    });

    expect(paths.every((path) => path.workerManaged === (path.templateId === "flocking-boids"))).toBe(true);
    expect([...new Set(paths.filter((path) => path.workerManaged).map((path) => path.templateId))]).toEqual([
      "flocking-boids"
    ]);
    expect(paths.some((path) => !path.workerManaged)).toBe(true);
  });

  it("forks an immutable Starter scenario into a distinct validated page-session draft", () => {
    const before = JSON.stringify(starterWorlds);
    const result = resolveStarterRemixRequest(
      { starterId: "flocking", focusParameterId: "alignmentWeight" },
      { now: fixedNow }
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }

    const { source } = result;
    expect(source.sourceScenario.scenarioId).not.toBe(source.draft.scenarioId);
    expect(source.sourceScenario.name).toBe("Flocking baseline");
    expect(source.draft.name).toBe("Unsaved remix of Flocking baseline");
    expect(source.draft.metadata).not.toHaveProperty("starterWorldId");
    expect(source.draft.metadata).not.toHaveProperty("starterWorldRecipeId");
    expect(source.draft.metadata).toHaveProperty(starterRemixMetadataKey);
    expect(source.lineage).toMatchObject({
      kind: "ortus-starter-remix",
      status: "unsaved",
      entry: "starter",
      source: {
        starterWorldId: "flocking",
        starterWorldVersion: "1",
        templateId: "flocking-boids",
        scenarioId: source.sourceScenario.scenarioId,
        configuration: {
          seed: "ortus-field-001",
          parameters: source.sourceScenario.parameters
        }
      }
    });
    expect(validateScenario(source.draft).scenario).toEqual(source.draft);
    expect(JSON.stringify(starterWorlds)).toBe(before);
    expect(Object.isFrozen(starterWorlds[0])).toBe(true);
  });

  it("preserves collection and recipe lineage without presenting the derivative as the prepared recipe", () => {
    const result = resolveStarterRemixRequest(
      {
        starterId: "coordination-under-sensor-noise",
        recipeId: "coordination-clear-signals"
      },
      { now: fixedNow }
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }

    expect(result.source.lineage.source).toMatchObject({
      collectionId: "local-rules-global-patterns",
      collectionVersion: "1",
      starterWorldId: "coordination-under-sensor-noise",
      recipeId: "coordination-clear-signals"
    });
    expect(result.source.draft.metadata).toEqual({
      [starterRemixMetadataKey]: result.source.lineage
    });
  });

  it("loads a matching accepted World configuration while retaining canonical source configuration", () => {
    const result = resolveStarterRemixRequest(
      { starterId: "flocking", entry: "world" },
      { now: fixedNow }
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    const sourceConfig = runConfigFromScenario(result.source.sourceScenario);
    const activeConfig = validateRunConfig({
      ...sourceConfig,
      parameters: {
        ...sourceConfig.parameters,
        alignmentWeight: 0.2
      }
    });
    const draft = createStarterRemixDraftFromActiveRun(result.source, activeConfig);
    const lineage = readStarterRemixLineage(draft.metadata);

    expect(draft.parameters.alignmentWeight).toBe(0.2);
    expect(lineage?.entry).toBe("world");
    expect(lineage?.parentScenarioId).toBe(sourceConfig.scenarioId);
    expect(lineage?.source.configuration.parameters.alignmentWeight).toBe(
      result.source.sourceScenario.parameters.alignmentWeight
    );

    const mismatched = validateRunConfig({
      ...activeConfig,
      metadata: { starterWorldId: "epidemic", starterWorldVersion: "1" }
    });
    expect(() => createStarterRemixDraftFromActiveRun(result.source, mismatched)).toThrow(/no longer carries/i);
  });

  it("uses a one-use ID-matched handoff for materially changed accepted World configuration", () => {
    const result = resolveStarterRemixRequest(
      { starterId: "flocking", entry: "world" },
      { now: fixedNow }
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    const activeConfig = validateRunConfig({
      ...runConfigFromScenario(result.source.sourceScenario),
      parameters: {
        ...result.source.sourceScenario.parameters,
        alignmentWeight: 0.2
      },
      metadata: {}
    });

    prepareStarterRemixActiveWorldHandoff(result.source.launch, activeConfig);
    const draft = consumeStarterRemixActiveWorldHandoff(result.source);
    expect(draft?.parameters.alignmentWeight).toBe(0.2);
    expect(readStarterRemixLineage(draft?.metadata)?.source.starterWorldId).toBe("flocking");
    expect(consumeStarterRemixActiveWorldHandoff(result.source)).toBeNull();

    const epidemic = resolveStarterRemixRequest(
      { starterId: "epidemic", entry: "world" },
      { now: fixedNow }
    );
    expect(epidemic.ok).toBe(true);
    if (!epidemic.ok) {
      throw new Error(epidemic.message);
    }
    prepareStarterRemixActiveWorldHandoff(result.source.launch, activeConfig);
    expect(consumeStarterRemixActiveWorldHandoff(epidemic.source)).toBeNull();
    expect(consumeStarterRemixActiveWorldHandoff(result.source)).toBeNull();
  });

  it("builds strict ID-only Workshop and resulting World launch URLs", () => {
    expect(starterRemixWorkshopHref("flocking", {
      entry: "world",
      focusParameterId: "alignmentWeight"
    })).toBe("/builder?starter=flocking&from=world&focus=alignmentWeight");
    expect(starterRemixWorldHref("flocking", "remix-flocking-abc", { task: "observe" })).toBe(
      "/world?starter=flocking&remix=remix-flocking-abc&task=observe"
    );

    expect(resolveStarterRemixRequest({
      starterId: "flocking",
      parameters: { alignmentWeight: 3 }
    })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(resolveStarterRemixRequest({
      starterId: "flocking",
      focusParameterId: "missingParameter"
    })).toMatchObject({ ok: false, code: "unsupported-focus" });
    expect(resolveStarterRemixRequest({
      starterId: "coordination-under-sensor-noise"
    })).toMatchObject({ ok: false, code: "source-mismatch" });
  });

  it("requires active derivative metadata before accepting the unsaved World URL", () => {
    const result = resolveStarterRemixRequest({ starterId: "flocking" }, { now: fixedNow });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    const launch = createStarterRemixWorldLaunch(result.source.draft);
    const resolved = resolveStarterRemixWorldLaunch({
      starterId: "flocking",
      draftId: result.source.draft.scenarioId,
      task: "setup"
    });

    expect(resolved).toEqual({ ok: true, launch });
    expect(starterRemixLaunchMatchesMetadata(result.source.draft.metadata, launch)).toBe(true);
    expect(starterRemixLaunchMatchesMetadata({}, launch)).toBe(false);
    expect(resolveStarterRemixWorldLaunch({
      starterId: "flocking",
      draftId: result.source.draft.scenarioId,
      parameters: { noise: 0.5 }
    })).toEqual({ ok: false, message: "The remix launch request is malformed." });
  });

  it("preserves derivative provenance on Reset but retains generic prepared-source Reset semantics", () => {
    const result = resolveStarterRemixRequest({ starterId: "flocking" }, { now: fixedNow });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    const remixConfig = runConfigFromScenario(result.source.draft);
    const remixReset = createRemixAwareResetRunConfig(remixConfig);
    expect(remixReset.scenarioId).toBe(result.source.draft.scenarioId);
    expect(remixReset.scenarioName).toBe(result.source.draft.name);
    expect(readStarterRemixLineage(remixReset.metadata)?.draftId).toBe(result.source.draft.scenarioId);
    expect(remixReset.parameters).toEqual(remixConfig.parameters);
    expect(remixReset.seed).toBe(remixConfig.seed);

    const preparedConfig = runConfigFromScenario(result.source.sourceScenario);
    const preparedReset = createRemixAwareResetRunConfig(preparedConfig);
    expect(preparedReset.scenarioId).toBeUndefined();
    expect(preparedReset.scenarioName).toBeUndefined();
    expect(preparedReset.metadata).toEqual({});
  });

  it("reconstructs accepted legacy configuration fields without live state", () => {
    const result = resolveStarterRemixRequest({ starterId: "epidemic" }, { now: fixedNow });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    const source = result.source.sourceScenario;
    const metadata = {
      ...source.metadata,
      scenarioId: source.scenarioId,
      scenarioName: source.name,
      initializationPreset: source.initializationPreset,
      initializationOptions: source.initializationOptions,
      behaviorMode: source.behaviorMode,
      agentComposition: source.agentComposition,
      environmentOptions: source.environmentOptions
    };
    const reconstructed = createAcceptedLegacyRunConfig({
      templateId: source.templateId,
      seed: source.seed,
      parameters: source.parameters,
      metadata
    });

    expect(reconstructed).toMatchObject({
      scenarioId: source.scenarioId,
      scenarioName: source.name,
      initializationPreset: source.initializationPreset,
      behaviorMode: source.behaviorMode,
      parameters: source.parameters
    });
    expect(JSON.stringify(reconstructed)).not.toMatch(/world|snapshot|entities|metricsHistory/);
  });
});
