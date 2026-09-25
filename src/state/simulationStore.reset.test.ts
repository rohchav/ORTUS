import { afterEach, describe, expect, it } from "vitest";
import {
  createDefaultScenario,
  createEngineFromScenario,
  patchScenarioInitializationOptions,
  patchScenarioVariantOptions,
  simulationEventLogGlobalKey,
  SimulationEngine,
  updateScenarioPreset,
  type AuthoredScenario,
  type SimulationTemplate
} from "../simulation";
import { epidemicTemplate } from "../simulation/templates/epidemic.template";
import { flockingTemplate } from "../simulation/templates/flocking.template";
import { opinionTemplate } from "../simulation/templates/opinion.template";
import { productionTemplates } from "../simulation/templates/registry";
import { useSimulationStore } from "./simulationStore";

const now = "2026-01-01T00:00:00.000Z";

// Reset means: the accepted model and scenario variant, the current parameters, and the current seed,
// rebuilt at tick 0. Only run progress is discarded.
describe("Reset rebuilds the accepted run", () => {
  afterEach(() => {
    useSimulationStore.getState().selectTemplate("epidemic-spread");
  });

  it("keeps an applied Opinion scenario's behavior mode, preset, preset options, parameters, and seed", () => {
    let scenario = createDefaultScenario({ template: opinionTemplate, seed: "reset-variant", now });
    scenario = updateScenarioPreset(scenario, "consensus-start", now);
    scenario = patchScenarioInitializationOptions(scenario, { ...scenario.initializationOptions, meanOpinion: 0.6 }, now);
    scenario = patchScenarioVariantOptions(scenario, { behaviorMode: "socialLearning" }, now);
    const store = useSimulationStore;
    store.getState().applyScenario(scenario);
    const applied = store.getState().engine!;
    expect(applied.scenario?.behaviorMode).toBe("socialLearning");
    store.getState().runFrameSteps(5);
    expect(applied.world.tick).toBe(5);

    store.getState().reset();

    const reset = store.getState().engine!;
    expect(reset).not.toBe(applied);
    expect(reset.world.tick).toBe(0);
    expect(reset.seed).toBe(applied.seed);
    expect(reset.parameters).toEqual(applied.parameters);
    expect(reset.scenario?.behaviorMode).toBe("socialLearning");
    expect(reset.initialization).toEqual(applied.initialization);
    expect(reset.initialization).toMatchObject({ presetId: "consensus-start", options: { meanOpinion: 0.6 } });
    expect(reset.world.globals.opinionBehaviorMode).toBe("socialLearning");
    expect(tickZeroWorld(reset)).toEqual(tickZeroWorld(createEngineFromScenario(scenario).engine));
    expect(store.getState().lastError).toBeNull();
  });

  it("keeps a non-default Epidemic preset with its options", () => {
    const presetId = epidemicTemplate.initializationPresets!.find((preset) => preset.optionDefinitions?.length)!.id;
    let scenario = createDefaultScenario({ template: epidemicTemplate, seed: "reset-preset", now });
    scenario = updateScenarioPreset(scenario, presetId, now);
    const store = useSimulationStore;
    store.getState().applyScenario(scenario);
    store.getState().runFrameSteps(3);

    store.getState().reset();

    const reset = store.getState().engine!;
    expect(reset.world.tick).toBe(0);
    expect(reset.initialization).toEqual({ presetId, options: scenario.initializationOptions });
    expect(tickZeroWorld(reset)).toEqual(tickZeroWorld(createEngineFromScenario(scenario).engine));
  });

  it("keeps the variant across repeated resets and after a seed change", () => {
    const scenario = patchScenarioVariantOptions(createDefaultScenario({ template: opinionTemplate, seed: "reset-repeat", now }), { behaviorMode: "socialLearning" }, now);
    const store = useSimulationStore;
    store.getState().applyScenario(scenario);
    store.getState().reset();
    store.getState().setSeed("reset-repeat-2");
    store.getState().runFrameSteps(2);
    store.getState().reset();

    const reset = store.getState().engine!;
    expect(reset.seed).toBe("reset-repeat-2");
    expect(reset.world.tick).toBe(0);
    expect(reset.world.globals.opinionBehaviorMode).toBe("socialLearning");
  });

  it.each(productionTemplates.filter((template) => template.id !== "flocking-boids").map((template) => [template.id, template] as const))(
    "resets a default %s run to the same tick-0 world as before",
    (_templateId, template) => {
      const store = useSimulationStore;
      store.getState().selectTemplate(template.id as never);
      store.getState().setSeed(`reset-default-${template.id}`);
      const before = store.getState().engine!;
      store.getState().runFrameSteps(2);

      store.getState().reset();

      const reset = store.getState().engine!;
      expect(reset.world.tick).toBe(0);
      expect(reset.seed).toBe(before.seed);
      expect(reset.parameters).toEqual(before.parameters);
      // The rebuild a default run always had: template, parameters, and seed only.
      expect(tickZeroWorld(reset)).toEqual(tickZeroWorld(new SimulationEngine(template as SimulationTemplate, { seed: before.seed, parameters: before.parameters })));
    },
    30_000
  );

  it("imports a scenario as the run its file declares, and Reset keeps that model", () => {
    const scenario = patchScenarioVariantOptions(createDefaultScenario({ template: opinionTemplate, seed: "reset-import", now }), { behaviorMode: "socialLearning" }, now);
    const store = useSimulationStore;
    store.getState().applyScenario(scenario);
    store.getState().exportScenario();
    const exported = store.getState().exportText;
    store.getState().selectTemplate("epidemic-spread");

    store.getState().setImportMode("scenario");
    store.getState().setImportText(exported);
    store.getState().importJson();

    const imported = store.getState().engine!;
    expect(store.getState().lastError).toBeNull();
    expect(imported.template.id).toBe("opinion-dynamics");
    expect(imported.world.globals.opinionBehaviorMode).toBe("socialLearning");
    const importedTickZero = tickZeroWorld(imported);
    expect(importedTickZero).toEqual(tickZeroWorld(createEngineFromScenario(scenario).engine));

    store.getState().runFrameSteps(2);
    store.getState().reset();
    expect(store.getState().engine!.world.globals.opinionBehaviorMode).toBe("socialLearning");
    expect(tickZeroWorld(store.getState().engine!)).toEqual(importedTickZero);
  });

  it.each(productionTemplates.filter((template) => template.id !== "flocking-boids").map((template) => [template.id, template] as const))(
    "imports a scenario exported from a default %s run as the same tick-0 world as before",
    (_templateId, template) => {
      const store = useSimulationStore;
      store.getState().selectTemplate(template.id as never);
      store.getState().setSeed(`reset-import-default-${template.id}`);
      const source = store.getState().engine!;
      store.getState().exportScenario();

      store.getState().setImportMode("scenario");
      store.getState().setImportText(store.getState().exportText);
      store.getState().importJson();

      expect(store.getState().lastError).toBeNull();
      const expected = new SimulationEngine(template as SimulationTemplate, { seed: source.seed, parameters: source.parameters });
      expect(tickZeroWorld(store.getState().engine!)).toEqual(tickZeroWorld(expected));
    },
    30_000
  );

  it("keeps a restored snapshot's recorded model when Reset rebuilds it", () => {
    const scenario = patchScenarioVariantOptions(createDefaultScenario({ template: opinionTemplate, seed: "reset-snapshot", now }), { behaviorMode: "socialLearning" }, now);
    const store = useSimulationStore;
    store.getState().applyScenario(scenario);
    store.getState().runFrameSteps(4);
    store.getState().exportSnapshot();

    store.getState().setImportMode("snapshot");
    store.getState().setImportText(store.getState().exportText);
    store.getState().importJson();
    expect(store.getState().engine!.world.tick).toBe(4);

    store.getState().reset();

    expect(store.getState().engine!.world.tick).toBe(0);
    expect(tickZeroWorld(store.getState().engine!)).toEqual(tickZeroWorld(createEngineFromScenario(scenario).engine));
  });

  it("keeps a Flocking scenario's variant in the Worker reset configuration", () => {
    const scenario: AuthoredScenario = patchScenarioVariantOptions(
      createDefaultScenario({ template: flockingTemplate, seed: "reset-flocking", now }),
      { behaviorMode: flockingTemplate.behaviorModes!.find((mode) => mode.id !== "default")!.id },
      now
    );
    const store = useSimulationStore;
    store.getState().applyScenario(scenario);
    const accepted = store.getState().flockingRuntimeConfig!;
    const revision = store.getState().flockingRuntimeRevision;

    store.getState().reset();

    const reset = store.getState().flockingRuntimeConfig!;
    expect(store.getState().flockingRuntimeRevision).toBe(revision + 1);
    expect(reset).toMatchObject({
      seed: accepted.seed,
      parameters: accepted.parameters,
      behaviorMode: scenario.behaviorMode,
      initializationPreset: accepted.initializationPreset
    });
  });
});

// Tick-0 world state without the event log, whose entries name how the run was created.
function tickZeroWorld(engine: SimulationEngine) {
  const world = engine.world.serialize();
  const { [simulationEventLogGlobalKey]: _log, ...globals } = world.globals;
  return { tick: world.tick, entities: world.entities, components: world.components, spaces: world.spaces, events: world.events, globals };
}
