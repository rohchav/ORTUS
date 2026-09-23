import { afterEach, describe, expect, it } from "vitest";
import { compareRunSummaries, runExperiment, type ExperimentConfig } from "../simulation";
import { defaultParameters } from "../lib/templateVisuals";
import { epidemicTemplate } from "../simulation/templates/epidemic.template";
import { useSimulationStore } from "./simulationStore";

describe("simulation store error ownership", () => {
  afterEach(() => {
    const store = useSimulationStore.getState();
    store.clearSavedRuns();
    store.setLatestExperimentResultSet(null);
    store.dismissError();
    store.selectTemplate("epidemic-spread");
  });

  it("keeps a Setup error visible through successes in other areas until Setup succeeds", () => {
    const store = useSimulationStore;
    store.getState().selectTemplate("epidemic-spread");

    store.getState().setSeed("   ");
    expect(store.getState().lastError).toEqual({ area: "setup", text: "Seed cannot be empty." });

    store.getState().captureCurrentRun({ label: "unrelated capture" });
    store.getState().exportScenario();
    store.getState().setSpeedMultiplier(2);
    store.getState().stepOnce();
    expect(store.getState().savedRuns).toHaveLength(1);
    expect(store.getState().lastError).toEqual({ area: "setup", text: "Seed cannot be empty." });

    store.getState().setSeed("valid-seed");
    expect(store.getState().lastError).toBeNull();
  });

  it("keeps a failed-run error visible until the run is rebuilt", () => {
    const store = useSimulationStore;
    store.getState().selectTemplate("epidemic-spread");
    expect(() => store.getState().engine!.applyCommands([{ type: "destroyEntity", entityId: "missing-entity" }])).toThrow();
    store.getState().stepOnce();
    const runError = store.getState().lastError;
    expect(runError).toMatchObject({ area: "run", text: expect.stringMatching(/run failed at tick 0/) });

    store.getState().setSpeedMultiplier(4);
    store.getState().captureCurrentRun({ label: "capture after failure" });
    store.getState().exportScenario();
    store.getState().clearSavedRuns();
    expect(store.getState().lastError).toBe(runError);

    store.getState().reset();
    expect(store.getState().lastError).toBeNull();
    expect(store.getState().engine?.failure).toBeUndefined();
  });

  it("clears an area's stale error when that same area later succeeds", () => {
    const store = useSimulationStore;
    store.getState().selectTemplate("epidemic-spread");

    store.getState().applyIntervention("epidemic.not-a-real-intervention", {});
    expect(store.getState().lastError).toMatchObject({ area: "intervention" });

    const world = store.getState().engine!.world.view();
    const susceptible = world
      .entitiesWith(["InfectionState"])
      .find((entityId) => world.getComponent<{ status: string }>(entityId, "InfectionState")?.status === "susceptible");
    store.getState().selectEntity(susceptible!);
    store.getState().applyIntervention("epidemic.infectSelected", {});
    expect(store.getState().lastError).toBeNull();
  });
});

describe("experiment results retained across a model change", () => {
  afterEach(() => {
    const store = useSimulationStore.getState();
    store.clearSavedRuns();
    store.setLatestExperimentResultSet(null);
    store.selectTemplate("epidemic-spread");
  });

  it("keeps the sweep, and imports it under its own model with a model-labelled notice", async () => {
    const store = useSimulationStore;
    store.getState().selectTemplate("epidemic-spread");
    const sweep = await runExperiment(epidemicSweep());
    store.getState().setLatestExperimentResultSet(sweep);

    store.getState().selectTemplate("opinion-dynamics");
    expect(store.getState().latestExperimentResultSet).toBe(sweep);
    store.getState().captureCurrentRun({ label: "opinion baseline" });

    store.getState().importLatestExperimentRuns();

    const imported = store.getState().savedRuns.filter((run) => run.tags.includes("experiment"));
    expect(imported).toHaveLength(sweep.runs.filter((run) => run.status === "success").length);
    expect(new Set(imported.map((run) => run.templateId))).toEqual(new Set(["epidemic-spread"]));
    expect(imported.every((run) => run.label.startsWith("Epidemic "))).toBe(true);
    expect(store.getState().lastNotice).toBe(`Imported ${imported.length} Epidemic experiment run summaries for comparison.`);

    const opinionRun = store.getState().savedRuns.find((run) => run.templateId === "opinion-dynamics")!;
    const mixed = compareRunSummaries([opinionRun, imported[0]!], null);
    expect(mixed.warnings).toContain("Selected runs use different templates. Metric comparison is limited to overlapping numeric metric keys.");
  });
});

function epidemicSweep(): ExperimentConfig {
  return {
    templateId: "epidemic-spread",
    baseParameters: { ...defaultParameters(epidemicTemplate), agentCount: 14, initialInfected: 1 },
    parameterSweep: { dimensions: [{ parameterKey: "infectionProbability", values: [0, 1] }] },
    seedMode: "fixed",
    seeds: ["sweep-a"],
    trialsPerCondition: 1,
    ticksPerRun: 4,
    metricsToRecord: ["infectedCount"],
    aggregationMode: "final",
    maxRuns: 10
  };
}
