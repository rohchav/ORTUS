import { afterEach, describe, expect, it } from "vitest";
import { useSimulationStore } from "./simulationStore";

describe("simulation store with a failed run", () => {
  afterEach(() => {
    useSimulationStore.getState().selectTemplate("epidemic-spread");
  });

  it("reports refused run actions as errors instead of throwing, and reset rebuilds a usable run", () => {
    const store = useSimulationStore;
    store.getState().selectTemplate("epidemic-spread");
    const engine = store.getState().engine!;
    expect(() => engine.applyCommands([{ type: "destroyEntity", entityId: "missing-entity" }])).toThrow(/missing-entity/);
    const exportTextBefore = store.getState().exportText;

    expect(() => store.getState().play()).not.toThrow();
    expect(store.getState().isRunning).toBe(false);
    expect(store.getState().lastError?.text).toMatch(/run failed at tick 0/);

    store.getState().stepOnce();
    expect(store.getState().lastError?.text).toMatch(/Cannot step/);
    expect(engine.world.tick).toBe(0);

    expect(() => store.getState().clearInterventions()).not.toThrow();
    expect(store.getState().lastError?.text).toMatch(/run failed/);

    expect(() => store.getState().exportSnapshot()).not.toThrow();
    expect(store.getState().exportText).toBe(exportTextBefore);
    expect(store.getState().lastError).toMatchObject({ area: "run", text: expect.stringMatching(/Snapshot export failed/) });

    store.getState().reset();
    expect(store.getState().engine).not.toBe(engine);
    expect(store.getState().engine?.failure).toBeUndefined();
    store.getState().stepOnce();
    expect(store.getState().latestSnapshot?.tick).toBe(1);
    expect(store.getState().lastError).toBeNull();
  });
});
