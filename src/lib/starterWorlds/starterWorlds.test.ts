import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createEngineFromScenario,
  getProductionTemplate,
  productionTemplates
} from "../../simulation";
import { rawStarterWorldDefinitions } from "./definitions";
import {
  createDefaultStarterWorldLaunch,
  createStarterWorldScenario,
  resolveStarterWorldLaunch,
  starterWorldLaunchSchema
} from "./launch";
import { queryStarterWorlds } from "./query";
import { runnableStarterWorlds, starterWorlds } from "./registry";
import {
  starterWorldDefinitionSchema,
  starterWorldDomains,
  starterWorldMechanisms,
  starterWorldSystemForms
} from "./types";
import {
  evaluateStarterWorldQuality,
  parseStarterWorldDefinition,
  StarterWorldValidationError,
  validateRuntimeReferences,
  validateStarterWorldDefinitions
} from "./validation";

describe("Starter World content framework", () => {
  it("validates seven versioned runnable definitions in deterministic catalog order", () => {
    expect(starterWorlds).toHaveLength(7);
    expect(runnableStarterWorlds).toHaveLength(7);
    expect(starterWorlds.map((world) => world.catalogOrder)).toEqual([10, 20, 30, 40, 50, 60, 70]);
    expect(starterWorlds.map((world) => world.id)).toEqual([
      "flocking",
      "epidemic",
      "opinion-dynamics",
      "predator-prey",
      "schelling",
      "forest-spread",
      "neural-excitation"
    ]);
    expect(new Set(starterWorlds.map((world) => world.id)).size).toBe(7);
    expect(new Set(starterWorlds.map((world) => world.slug)).size).toBe(7);
    expect(starterWorlds.every((world) => world.version === "1" && world.runtimeStatus === "runnable")).toBe(true);
  });

  it("rejects unsupported versions, statuses, missing content, taxonomy values, and empty anatomy", () => {
    const invalidVersion = cloneDefinition(0);
    invalidVersion.version = "2";
    expect(() => parseStarterWorldDefinition(invalidVersion)).toThrow(StarterWorldValidationError);

    const invalidStatus = cloneDefinition(0);
    invalidStatus.runtimeStatus = "almost-runnable";
    expect(() => parseStarterWorldDefinition(invalidStatus)).toThrow(StarterWorldValidationError);

    const missingHook = cloneDefinition(0);
    delete missingHook.hookQuestion;
    expect(() => parseStarterWorldDefinition(missingHook)).toThrow(StarterWorldValidationError);

    const invalidDomain = cloneDefinition(0);
    invalidDomain.domain = ["made-up-domain"];
    expect(() => parseStarterWorldDefinition(invalidDomain)).toThrow(StarterWorldValidationError);

    const invalidMechanism = cloneDefinition(0);
    invalidMechanism.mechanisms = ["mind-reading"];
    expect(() => parseStarterWorldDefinition(invalidMechanism)).toThrow(StarterWorldValidationError);

    const emptyAnatomy = cloneDefinition(0);
    emptyAnatomy.anatomy = {};
    expect(() => parseStarterWorldDefinition(emptyAnatomy)).toThrow(/at least one system facet/i);
  });

  it("rejects duplicate IDs, slugs, hooks, limitations, source IDs, and unsafe object keys", () => {
    const duplicate = cloneDefinitions();
    duplicate[1]!.id = duplicate[0]!.id;
    expect(() => validateStarterWorldDefinitions(duplicate)).toThrow(/duplicates entry/i);

    const duplicateSlug = cloneDefinitions();
    duplicateSlug[1]!.slug = duplicateSlug[0]!.slug;
    expect(() => validateStarterWorldDefinitions(duplicateSlug)).toThrow(/slug/i);

    const duplicateHook = cloneDefinitions();
    duplicateHook[1]!.hookQuestion = duplicateHook[0]!.hookQuestion;
    expect(() => validateStarterWorldDefinitions(duplicateHook)).toThrow(/Hook duplicates/i);

    const duplicateLimitation = cloneDefinitions();
    duplicateLimitation[1]!.mainLimitation = duplicateLimitation[0]!.mainLimitation;
    expect(() => validateStarterWorldDefinitions(duplicateLimitation)).toThrow(/Main limitation repeats/i);

    const duplicateSource = cloneDefinitions();
    duplicateSource[1]!.sources[0].sourceId = duplicateSource[0]!.sources[0].sourceId;
    expect(() => validateStarterWorldDefinitions(duplicateSource)).toThrow(/Source ID/i);

    const unsafe = cloneDefinition(0);
    Object.defineProperty(unsafe, "__proto__", { value: { polluted: true }, enumerable: true });
    expect(() => parseStarterWorldDefinition(unsafe)).toThrow(/Unsafe object key/i);
  });

  it("revalidates every template, scenario, metric, parameter, and optional intervention reference", () => {
    for (const world of starterWorlds) {
      expect(validateRuntimeReferences(world)).toEqual([]);
      const template = getProductionTemplate(world.runtime!.templateId);
      expect(template).toBeDefined();
      expect(world.runtime!.supportedScenarioIds).toContain(world.runtime!.defaultScenarioId);
    }

    for (const [field, value, message] of [
      ["templateId", "missing-template", /Unknown production template/i],
      ["defaultScenarioId", "missing-scenario", /Unknown initialization scenario/i],
      ["recommendedMetricId", "missing-metric", /Unknown metric/i],
      ["recommendedParameterId", "missing-parameter", /Unknown parameter/i]
    ] as const) {
      const definition = cloneDefinition(0);
      definition.runtime[field] = value;
      if (field === "defaultScenarioId") {
        definition.runtime.supportedScenarioIds[0] = value;
      }
      if (field === "recommendedParameterId") {
        definition.firstChange.targetId = value;
      }
      expect(() => parseStarterWorldDefinition(definition)).toThrow(message);
    }

    const validIntervention = cloneDefinition(1);
    validIntervention.firstChange = {
      targetType: "intervention",
      targetId: "epidemic.infectSelected",
      targetLabel: "Infect Selected Agent",
      action: "Select a susceptible model agent and apply Infect Selected Agent.",
      direction: "apply",
      runSemantics: "current-run",
      differenceToLookFor: "Watch the infected model-agent count change at the current tick."
    };
    expect(() => parseStarterWorldDefinition(validIntervention)).not.toThrow();

    validIntervention.firstChange.targetId = "epidemic.missing";
    expect(() => parseStarterWorldDefinition(validIntervention)).toThrow(/Unknown intervention/i);
  });

  it("validates source URLs, DOI links, relationships, counts, and investigation uniqueness", () => {
    for (const world of starterWorlds) {
      expect(world.sources.length).toBeGreaterThanOrEqual(1);
      expect(world.sources.length).toBeLessThanOrEqual(3);
      for (const source of world.sources) {
        expect(new URL(source.urlOrDoi).protocol).toBe("https:");
        expect(source.relationship.length).toBeGreaterThan(0);
      }
    }

    const malformedUrl = cloneDefinition(0);
    malformedUrl.sources[0].urlOrDoi = "doi:made-up";
    expect(() => parseStarterWorldDefinition(malformedUrl)).toThrow();

    const duplicateSource = cloneDefinition(0);
    duplicateSource.sources.push(structuredClone(duplicateSource.sources[0]));
    expect(() => parseStarterWorldDefinition(duplicateSource)).toThrow(/Source IDs must be distinct/i);

    const duplicatePrompt = cloneDefinition(0);
    duplicatePrompt.investigationPrompts[1] = duplicatePrompt.investigationPrompts[0];
    expect(() => parseStarterWorldDefinition(duplicatePrompt)).toThrow(/Investigation prompts must be distinct/i);
  });

  it("reports deterministic quality-lint failures without an LLM or executable content path", () => {
    for (const world of starterWorlds) {
      expect(evaluateStarterWorldQuality(world)).toEqual([]);
    }

    const generic = {
      ...starterWorlds[0]!,
      summary: "Explore a complex system."
    };
    expect(evaluateStarterWorldQuality(generic).map((issue) => issue.code)).toContain("generic-summary");

    const overclaim = {
      ...starterWorlds[0]!,
      summary: "This world proves the real cause of coordinated movement in living animals."
    };
    expect(evaluateStarterWorldQuality(overclaim).map((issue) => issue.code)).toContain("unsupported-research-claim");
  });

  it("filters and searches deterministically across all required bounded dimensions", () => {
    expect(starterWorldDomains).toContain("living-systems");
    expect(starterWorldMechanisms).toContain("threshold");
    expect(starterWorldSystemForms).toContain("network");

    expect(queryStarterWorlds(starterWorlds, { domain: "networks-and-signals" }, "").map((world) => world.id)).toEqual([
      "neural-excitation"
    ]);
    expect(queryStarterWorlds(starterWorlds, { mechanism: "threshold" }, "").map((world) => world.id)).toEqual([
      "schelling",
      "neural-excitation"
    ]);
    expect(queryStarterWorlds(starterWorlds, { systemForm: "grid" }, "").map((world) => world.id)).toEqual([
      "schelling",
      "forest-spread"
    ]);
    expect(queryStarterWorlds(starterWorlds, { complexity: "quick-start" }, "").map((world) => world.id)).toEqual([
      "flocking",
      "schelling"
    ]);
    expect(
      queryStarterWorlds(starterWorlds, { domain: "living-systems", systemForm: "grid", complexity: "layered" }, "")
        .map((world) => world.id)
    ).toEqual(["forest-spread"]);
    expect(queryStarterWorlds(starterWorlds, {}, "delayed excitation").map((world) => world.id)).toEqual(["neural-excitation"]);
    expect(queryStarterWorlds(starterWorlds, {}, "local grid").map((world) => world.id)).toEqual(["schelling", "forest-spread"]);
    expect(queryStarterWorlds(starterWorlds, {}, "no matching future world")).toEqual([]);
  });

  it("builds strict ID-only launch contexts and rejects stale, mismatched, or arbitrary payloads", () => {
    const launch = createDefaultStarterWorldLaunch("flocking");
    expect(launch).toEqual({
      starterWorldId: "flocking",
      starterWorldVersion: "1",
      slug: "collective-motion",
      templateId: "flocking-boids",
      scenarioId: "random-headings",
      task: "setup",
      href: "/world?starter=flocking&template=flocking-boids&scenario=random-headings"
    });
    expect(starterWorldLaunchSchema.safeParse({ ...launch, parameters: { alignmentWeight: 3 } }).success).toBe(false);
    expect(resolveStarterWorldLaunch({ starterId: "missing" })).toMatchObject({ ok: false, code: "unknown-starter" });
    expect(resolveStarterWorldLaunch({ starterId: "flocking", templateId: "epidemic-spread" })).toMatchObject({
      ok: false,
      code: "runtime-mismatch"
    });
    expect(resolveStarterWorldLaunch({ starterId: "flocking", scenarioId: "missing" })).toMatchObject({
      ok: false,
      code: "unknown-scenario"
    });
    expect(resolveStarterWorldLaunch({ starterId: "flocking", task: "invent" })).toMatchObject({ ok: false, code: "invalid-task" });
    expect(resolveStarterWorldLaunch({ starterId: "flocking", runConfig: { parameters: {} } })).toMatchObject({
      ok: false,
      code: "invalid-request"
    });
  });

  it("uses existing scenario construction for fresh paused tick-0 runs without mutating runtime defaults or bounds", () => {
    const runtimeContractsBefore = JSON.stringify(
      productionTemplates.map((template) => ({
        id: template.id,
        parameters: template.parameterDefinitions,
        presets: template.initializationPresets
      }))
    );

    for (const world of starterWorlds) {
      const launch = createDefaultStarterWorldLaunch(world.id);
      const scenario = createStarterWorldScenario(launch);
      const { engine, validation } = createEngineFromScenario(scenario);
      const snapshot = engine.createSnapshot();
      expect(validation.scenario.templateId).toBe(world.runtime!.templateId);
      expect(validation.scenario.initializationPreset).toBe(world.runtime!.defaultScenarioId);
      expect(validation.scenario.metadata.starterWorldId).toBe(world.id);
      expect(snapshot.tick).toBe(0);
      expect(engine.clock.running).toBe(false);
    }

    const runtimeContractsAfter = JSON.stringify(
      productionTemplates.map((template) => ({
        id: template.id,
        parameters: template.parameterDefinitions,
        presets: template.initializationPresets
      }))
    );
    expect(runtimeContractsAfter).toBe(runtimeContractsBefore);
  });

  it("adds no persistence API or storage key to the Starter World implementation", () => {
    const implementation = [
      "definitions.ts",
      "launch.ts",
      "query.ts",
      "registry.ts",
      "types.ts",
      "validation.ts"
    ]
      .map((file) => readFileSync(join(process.cwd(), "src", "lib", "starterWorlds", file), "utf8"))
      .join("\n");
    expect(implementation).not.toMatch(
      /localStorage|sessionStorage|IndexedDB|document\.cookie|createJSONStorage|persist\(|storageKey/
    );
    expect(implementation).not.toMatch(/RunConfig|Math\.random|eval\(|new Function|LLM/i);
  });

  it("keeps the direct Zod model strict for unknown fields", () => {
    const definition = cloneDefinition(0);
    definition.compilerPayload = "not allowed";
    const result = starterWorldDefinitionSchema.safeParse(definition);
    expect(result.success).toBe(false);
  });
});

type MutableDefinition = Record<string, any>;

function cloneDefinition(index: number): MutableDefinition {
  return structuredClone(rawStarterWorldDefinitions[index]) as MutableDefinition;
}

function cloneDefinitions(): MutableDefinition[] {
  return structuredClone(rawStarterWorldDefinitions) as unknown as MutableDefinition[];
}
