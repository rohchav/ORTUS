import { afterEach, describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { SimulationValidationError } from "../kernel/Errors";
import type {
  ComponentType,
  ComponentValue,
  JsonValue,
  SerializedSpace,
  SimulationEngineOptions,
  SimulationRunConfig,
  SimulationTemplate,
  SnapshotExport
} from "../kernel/types";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Grid2DSpace } from "../spaces/Grid2DSpace";
import { NetworkSpace } from "../spaces/NetworkSpace";
import { assertSpaceHoldsExactly } from "../kernel/Invariants";
import { LocalRuntimeDriver } from "../runtime/LocalRuntimeDriver";
import { RuntimeSession } from "../runtime/RuntimeSession";
import { createFlockingRenderFramePacket } from "../runtime/flockingProjection";
import { createEngineFromRunConfig } from "../runs/engineFromRunConfig";
import { createDefaultRunConfig } from "../runs/runConfig";
import { createDefaultScenario, patchScenarioVariantOptions, updateScenarioPreset } from "../scenarios";
import { epidemicTemplate, EPIDEMIC_SPACE_ID, InfectionState, Position2D, Velocity2D } from "../templates/epidemic.template";
import { BoidGroup, BoidState, flockingTemplate, FLOCKING_SPACE_ID } from "../templates/flocking.template";
import { ForestFireCellPosition, ForestFireCellState, forestFireTemplate, FOREST_FIRE_SPACE_ID } from "../templates/forestFire.template";
import {
  NEURAL_EXCITATION_NETWORK_ID,
  NEURAL_EXCITATION_SPACE_ID,
  neuralExcitationTemplate,
  NeuralNeuronStateComponent,
  neuralSynapsesGlobalKey
} from "../templates/neuralExcitation.template";
import { OPINION_SPACE_ID, OpinionSocialLearningState, OpinionState, opinionTemplate } from "../templates/opinion.template";
import { Energy, PREDATOR_PREY_SPACE_ID, predatorPreyTemplate, Species } from "../templates/predatorPrey.template";
import { productionTemplates } from "../templates/registry";
import { GroupIdentity, PositionGrid, SatisfactionState, schellingTemplate, SCHELLING_SPACE_ID } from "../templates/schelling.template";
import { createImmersiveFlockingRunConfig } from "../../lib/immersiveWorld/scenario";
import { useSimulationStore } from "../../state/simulationStore";

// A restored world must be an executable state of the model its snapshot declares (Phase 3B, P1-A and
// P1-B). Three layers establish that (src/simulation/kernel/Invariants.ts): kernel invariants; each
// template's agent role (every live entity is an agent with its required components, placed exactly in
// its spaces); and, at restore only, agreement with the world the declared configuration builds (spaces
// and their geometry, configuration globals such as behavior-mode markers, parameters, and the entity set
// of a fixed-population model).

interface ModelCase {
  name: string;
  template: SimulationTemplate;
  config?: Partial<SimulationRunConfig>;
  ticks: number;
  label: string;
  // The component that places the agent, which ghosts lose along with their space memberships.
  placement: ComponentType;
  required: readonly ComponentType[];
  spaces: readonly string[];
  // Materially distinct kinds of agent within the model, each recognised from its component values.
  types: Record<string, (snapshot: SnapshotExport, entityId: string) => boolean>;
  // Metrics whose values sum to the number of agents, where the template records one.
  populationMetrics?: readonly string[];
}

const now = "2026-01-01T00:00:00.000Z";
const any = () => true;
const valueOf = (component: string, field: string) => (snapshot: SnapshotExport, entityId: string) =>
  (snapshot.world.components[component]?.[entityId] as Record<string, JsonValue> | undefined)?.[field];

const models: ModelCase[] = [
  {
    name: "Epidemic",
    template: epidemicTemplate,
    ticks: 50,
    label: "Epidemic agent",
    placement: Position2D,
    required: [Position2D, Velocity2D, InfectionState],
    spaces: [EPIDEMIC_SPACE_ID],
    types: {
      susceptible: (s, id) => valueOf(InfectionState, "status")(s, id) === "susceptible",
      infected: (s, id) => valueOf(InfectionState, "status")(s, id) === "infected",
      recovered: (s, id) => valueOf(InfectionState, "status")(s, id) === "recovered"
    },
    populationMetrics: ["susceptibleCount", "infectedCount", "recoveredCount"]
  },
  {
    name: "Opinion",
    template: opinionTemplate,
    ticks: 3,
    label: "Opinion agent",
    placement: Position2D,
    required: [Position2D, OpinionState],
    spaces: [OPINION_SPACE_ID],
    types: { agent: any }
  },
  {
    name: "Opinion socialLearning",
    template: opinionTemplate,
    config: { behaviorMode: "socialLearning" },
    ticks: 3,
    label: "Opinion agent",
    placement: Position2D,
    required: [Position2D, OpinionState, OpinionSocialLearningState],
    spaces: [OPINION_SPACE_ID],
    types: { agent: any }
  },
  {
    name: "Predator-Prey",
    template: predatorPreyTemplate,
    ticks: 3,
    label: "Predator-prey agent",
    placement: Position2D,
    required: [Position2D, Velocity2D, Species],
    spaces: [PREDATOR_PREY_SPACE_ID],
    types: {
      prey: (s, id) => valueOf(Species, "kind")(s, id) === "prey",
      predator: (s, id) => valueOf(Species, "kind")(s, id) === "predator"
    },
    populationMetrics: ["preyCount", "predatorCount"]
  },
  {
    name: "Flocking",
    template: flockingTemplate,
    ticks: 3,
    label: "Boid",
    placement: Position2D,
    required: [Position2D, Velocity2D, BoidState],
    spaces: [FLOCKING_SPACE_ID],
    types: { boid: any },
    populationMetrics: ["agentCount"]
  },
  {
    name: "Flocking groupAware",
    template: flockingTemplate,
    config: { behaviorMode: "groupAware", agentComposition: { agentCount: 160, groupCount: 3, primaryGroupRatio: 0.5 } },
    ticks: 3,
    label: "Boid",
    placement: Position2D,
    required: [Position2D, Velocity2D, BoidState, BoidGroup],
    spaces: [FLOCKING_SPACE_ID],
    types: {
      "group-1": (s, id) => valueOf(BoidGroup, "groupId")(s, id) === "group-1",
      "group-3": (s, id) => valueOf(BoidGroup, "groupId")(s, id) === "group-3"
    },
    populationMetrics: ["agentCount"]
  },
  {
    name: "Schelling",
    template: schellingTemplate,
    ticks: 3,
    label: "Schelling agent",
    placement: PositionGrid,
    required: [PositionGrid, GroupIdentity, SatisfactionState],
    spaces: [SCHELLING_SPACE_ID],
    types: {
      "group A": (s, id) => valueOf(GroupIdentity, "group")(s, id) === "A",
      "group B": (s, id) => valueOf(GroupIdentity, "group")(s, id) === "B"
    },
    populationMetrics: ["groupACount", "groupBCount"]
  },
  {
    name: "Forest Fire",
    template: forestFireTemplate,
    ticks: 6,
    label: "Forest Fire cell",
    placement: ForestFireCellPosition,
    required: [ForestFireCellPosition, ForestFireCellState],
    spaces: [FOREST_FIRE_SPACE_ID],
    types: {
      empty: (s, id) => valueOf(ForestFireCellState, "state")(s, id) === "empty",
      fuel: (s, id) => valueOf(ForestFireCellState, "state")(s, id) === "fuel",
      burning: (s, id) => valueOf(ForestFireCellState, "state")(s, id) === "burning",
      burned: (s, id) => valueOf(ForestFireCellState, "state")(s, id) === "burned"
    }
  },
  {
    name: "Neural",
    template: neuralExcitationTemplate,
    ticks: 3,
    label: "Neural neuron",
    placement: Position2D,
    required: [Position2D, NeuralNeuronStateComponent],
    spaces: [NEURAL_EXCITATION_SPACE_ID, NEURAL_EXCITATION_NETWORK_ID],
    types: { neuron: any }
  }
];

const typeCases = models.flatMap((model) => Object.keys(model.types).map((type) => [model.name, type, model] as const));
const byName = (name: string) => models.find((model) => model.name === name)!;

describe("P1-A: every live entity of a template is a complete, placed agent", { timeout: 30_000 }, () => {
  it.each(typeCases)("%s: rejects a %s ghost that lost its placement component and every space but kept its model state", (_name, type, model) => {
    const { snapshot, declared } = genuine(model);
    const entityId = entityOfType(model, snapshot, type);
    makeGhost(snapshot, entityId, model.placement);
    // The ghost still carries the state its systems and metrics read (for example OpinionState).
    expect(componentsOf(snapshot, entityId).length).toBeGreaterThan(0);

    expect(() => restore(model, snapshot, declared)).toThrow(SimulationValidationError);
    expect(() => restore(model, snapshot, declared)).toThrow(`${model.label} ${entityId} is missing ${model.placement}`);
  });

  it.each(typeCases)("%s: rejects a placed %s agent missing any one required component", (_name, type, model) => {
    const { snapshot: genuineSnapshot, declared } = genuine(model);
    const entityId = entityOfType(model, genuineSnapshot, type);

    for (const component of model.required) {
      const snapshot = structuredClone(genuineSnapshot);
      delete snapshot.world.components[component]![entityId];

      expect(() => restore(model, snapshot, declared)).toThrow(`${model.label} ${entityId} is missing ${component}`);
    }
  });

  it.each(typeCases)("%s: rejects a complete %s agent missing from any one of its spaces", (_name, type, model) => {
    const { snapshot: genuineSnapshot, declared } = genuine(model);
    const entityId = entityOfType(model, genuineSnapshot, type);

    for (const spaceId of model.spaces) {
      const snapshot = structuredClone(genuineSnapshot);
      removeMember(spaceIn(snapshot, spaceId), entityId);

      expect(() => restore(model, snapshot, declared)).toThrow(`${model.label} ${entityId} is missing from ${spaceId}`);
    }
  });

  it.each(models.map((model) => [model.name, model] as const))(
    "%s: rejects a live entity stripped of every component and space membership",
    (_name, model) => {
      const { snapshot, declared } = genuine(model);
      const entityId = entityOfType(model, snapshot, Object.keys(model.types)[0]!);
      for (const component of componentsOf(snapshot, entityId)) {
        delete snapshot.world.components[component]![entityId];
      }
      makeGhost(snapshot, entityId, model.placement);

      // Identity is liveness, so even an entity with nothing left is still an agent and still checked.
      expect(() => restore(model, snapshot, declared)).toThrow(new RegExp(`^${model.label} ${entityId} is missing `));
    }
  );

  it("recreates the Phase 3B Opinion ghost: OpinionState kept, Position2D and space entry removed", () => {
    const model = byName("Opinion");
    const { engine, snapshot, declared } = genuine(model);
    const entityId = entityOfType(model, snapshot, "agent");
    delete snapshot.world.components[Position2D]![entityId];
    delete positionsOf(snapshot, OPINION_SPACE_ID)[entityId];
    // Before the repair this imported and ran: averageOpinion counted the ghost, which no neighbour saw
    // and which sensed no neighbour, while the space and renderer showed one agent fewer.
    expect(snapshot.world.components[OpinionState]![entityId]).toBeDefined();

    expect(() => restore(model, snapshot, declared)).toThrow(`Opinion agent ${entityId} is missing Position2D`);
    expect(() => engine.importSnapshot(snapshot)).toThrow(`Opinion agent ${entityId} is missing Position2D`);
  });

  it("rejects agent state that contradicts the world's behavior mode", () => {
    const cases: Array<[string, (snapshot: SnapshotExport, entityId: string) => void, string | RegExp]> = [
      [
        "Opinion",
        (snapshot, entityId) => {
          snapshot.world.components[OpinionSocialLearningState] = { [entityId]: socialLearningStateOf(byName("Opinion socialLearning")) };
        },
        /holds OpinionSocialLearningState, which this model variant does not use/
      ],
      [
        "Flocking",
        (snapshot, entityId) => {
          snapshot.world.components[BoidGroup] = { [entityId]: { groupId: "group-1", groupIndex: 1, groupCount: 2 } };
        },
        /holds BoidGroup, which this model variant does not use/
      ],
      [
        "Flocking groupAware",
        (snapshot, entityId) => {
          snapshot.world.components[BoidGroup]![entityId] = { groupId: "group-4", groupIndex: 4, groupCount: 4 };
        },
        /Invalid BoidGroup component/
      ],
      [
        "Predator-Prey",
        (snapshot) => {
          const prey = entityOfType(byName("Predator-Prey"), snapshot, "prey");
          snapshot.world.components[Energy]![prey] = { value: 10 };
        },
        /^Prey \S+ holds Energy, which only predators have$/
      ],
      [
        "Predator-Prey",
        (snapshot) => {
          const predator = entityOfType(byName("Predator-Prey"), snapshot, "predator");
          delete snapshot.world.components[Energy]![predator];
        },
        /^Invalid Energy component on predator /
      ]
    ];

    for (const [name, tamper, message] of cases) {
      const model = byName(name);
      const { snapshot, declared } = genuine(model);
      tamper(snapshot, entityOfType(model, snapshot, Object.keys(model.types)[0]!));

      expect(() => restore(model, snapshot, declared)).toThrow(message);
    }
  });

  it("fails the run when a command batch leaves a ghost or a partial agent, as for any invalid tick", () => {
    const stripped = createEngineFromRunConfig(runConfigFor(byName("Opinion")));
    expect(() => stripped.applyCommands([{ type: "removeComponent", entityId: "e000001", componentType: Position2D }])).toThrow(
      "Opinion agent e000001 is missing Position2D"
    );
    expect(stripped.failure?.operation).toBe("applyCommands");

    const partial = createEngineFromRunConfig(runConfigFor(byName("Predator-Prey")));
    expect(() =>
      partial.applyCommands([{ type: "createEntity", entityId: "e999999", archetype: "prey", components: { [Species]: { kind: "prey" } } }])
    ).toThrow("Predator-prey agent e999999 is missing Position2D");
    expect(partial.failure?.operation).toBe("applyCommands");
  });

  it("names a missing agent and an unexpected member, for every space kind", () => {
    const spaces = [
      new Continuous2DSpace({ id: "field", width: 10, height: 10, boundaryMode: "wrap" }),
      new Grid2DSpace({ id: "grid", rows: 4, cols: 4, boundaryMode: "clamp" }),
      new NetworkSpace("net")
    ];
    for (const space of spaces) {
      space.addEntity("a", (space.kind === "continuous2d" ? { x: 1, y: 1 } : space.kind === "grid2d" ? { row: 1, col: 1 } : "a") as never);
      space.addEntity("b", (space.kind === "continuous2d" ? { x: 2, y: 2 } : space.kind === "grid2d" ? { row: 2, col: 2 } : "b") as never);

      expect(() => assertSpaceHoldsExactly(space, space.id, ["a", "b"], "Agent")).not.toThrow();
      expect(() => assertSpaceHoldsExactly(space, space.id, ["a", "b", "c"], "Agent")).toThrow(`Agent c is missing from ${space.id}`);
      expect(() => assertSpaceHoldsExactly(space, space.id, ["a"], "Agent")).toThrow(`Space ${space.id} contains unexpected member b`);
      expect(() => assertSpaceHoldsExactly(undefined, space.id, ["a"], "Agent")).toThrow(`Space ${space.id} is missing or has the wrong kind`);
    }
  });

  it("keeps live non-agent entities valid in a template that does not declare an agent role", () => {
    const template = unroledTemplate();
    const engine = new SimulationEngine(template, { seed: "non-agents" });
    engine.runSteps(2);
    const snapshot = engine.snapshotExport();

    const restored = SimulationEngine.fromSnapshot(template, snapshot);
    restored.runSteps(2);
    engine.runSteps(2);

    expect(restored.world.serialize()).toEqual(engine.world.serialize());
    expect(restored.world.view().aliveEntityIds()).toEqual(expect.arrayContaining(["note", "tagged"]));
    expect(restored.world.getSpace("field")?.getLocation("note")).toBeUndefined();
  });

  it.each(models.map((model) => [model.name, model] as const))(
    "%s: every read path sees the same agents in an accepted world, so metrics and renderers agree",
    (_name, model) => {
      const { snapshot, declared } = genuine(model);
      const restored = restore(model, snapshot, declared);
      restored.step();
      const view = restored.world.view();
      const live = sorted(view.aliveEntityIds());

      for (const component of model.required) {
        expect(sorted(view.entitiesWith([component]))).toEqual(live);
      }
      for (const spaceId of model.spaces) {
        expect(sorted(memberIds(restored.world.getSpace(spaceId)!.serialize()))).toEqual(live);
      }
      const latest = restored.metrics.historyRecords().at(-1)!;
      if (model.populationMetrics) {
        expect(model.populationMetrics.reduce((sum, key) => sum + latest.values[key]!, 0)).toBe(live.length);
      }
      if (model.template === flockingTemplate) {
        expect(createFlockingRenderFramePacket(restored, { generation: 1, runId: "count" }, null).entityCount).toBe(live.length);
      }
    }
  );

  describe("rejection before replacement on every import path", () => {
    afterEach(() => {
      useSimulationStore.getState().selectTemplate("epidemic-spread");
    });

    it("direct restore into a live engine leaves the run byte-identical and able to step", () => {
      const model = byName("Opinion");
      const engine = createEngineFromRunConfig(runConfigFor(model));
      engine.runSteps(2);
      const snapshot = engine.snapshotExport();
      makeGhost(snapshot, "e000001", Position2D);
      const before = engine.exportSnapshot();

      expect(() => engine.importSnapshot(JSON.stringify(snapshot))).toThrow("Opinion agent e000001 is missing Position2D");

      expect(engine.exportSnapshot()).toBe(before);
      expect(engine.failure).toBeUndefined();
      engine.step();
      expect(engine.world.tick).toBe(3);
    });

    it("the main-thread paste import refuses and keeps the current run", () => {
      const store = useSimulationStore;
      store.getState().selectTemplate("opinion-dynamics");
      const engine = store.getState().engine!;
      store.getState().runFrameSteps(2);
      store.getState().exportSnapshot();
      const snapshot = JSON.parse(store.getState().exportText) as SnapshotExport;
      makeGhost(snapshot, "e000001", Position2D);

      store.getState().setImportMode("snapshot");
      store.getState().setImportText(JSON.stringify(snapshot));
      store.getState().importJson();

      expect(store.getState().lastError).toEqual({ area: "file", text: "Import failed: Opinion agent e000001 is missing Position2D" });
      expect(store.getState().engine).toBe(engine);
      expect(engine.world.tick).toBe(2);
      store.getState().runFrameSteps(1);
      expect(engine.world.tick).toBe(3);
    });

    it("the Worker session and driver refuse and keep the current run", async () => {
      const session = new RuntimeSession("local", () => 0);
      session.rebuild({ runId: "valid", runConfig: createImmersiveFlockingRunConfig(100) }, { generation: 1, runId: "valid" }, "initialization");
      session.advance(3, "step");
      const snapshot = JSON.parse(session.exportArtifact("snapshot")) as SnapshotExport;
      makeGhost(snapshot, firstMember(spaceIn(snapshot, FLOCKING_SPACE_ID)), Position2D);
      const json = JSON.stringify(snapshot);

      expect(() => session.importArtifact({ runId: "ghost", kind: "snapshot", json }, { generation: 2, runId: "ghost" })).toThrow(/^Boid \S+ is missing Position2D$/);
      expect(session.currentIdentity()).toEqual({ generation: 1, runId: "valid" });
      expect(session.advance(1, "step").frame.tick).toBe(4);

      const driver = new LocalRuntimeDriver();
      await driver.initialize({ runId: "driver", runConfig: createImmersiveFlockingRunConfig(100) });
      await expect(driver.importArtifact({ runId: "driver-ghost", kind: "snapshot", json })).rejects.toThrow(/is missing Position2D/);
      expect(driver).toMatchObject({ generation: 1, state: "ready" });
      await driver.step();
      expect(driver.getLatestUI()).toMatchObject({ generation: 1, runId: "driver", tick: 1 });
      driver.dispose();
    });
  });
});

describe("P1-B: a restored world matches the model configuration its snapshot declares", { timeout: 30_000 }, () => {
  const continuousCases = [
    ["Opinion", OPINION_SPACE_ID],
    ["Epidemic", EPIDEMIC_SPACE_ID],
    ["Predator-Prey", PREDATOR_PREY_SPACE_ID],
    ["Flocking", FLOCKING_SPACE_ID],
    ["Neural", NEURAL_EXCITATION_SPACE_ID]
  ] as const;

  it.each(continuousCases)("%s: rejects continuous extents and boundary mode that differ from the configuration", (name, spaceId) => {
    const model = byName(name);
    const { snapshot: genuineSnapshot, declared } = genuine(model);
    const space = continuousIn(genuineSnapshot, spaceId);
    const otherBoundary = space.boundaryMode === "wrap" ? "bounce" : "wrap";
    const tamperings: Array<[string, (value: Extract<SerializedSpace, { kind: "continuous2d" }>) => void]> = [
      [`width ${space.width / 2}`, (value) => { value.width = space.width / 2; }],
      [`width ${space.width * 4}`, (value) => { value.width = space.width * 4; }],
      [`height ${space.height + 1}`, (value) => { value.height = space.height + 1; }],
      [`boundaryMode ${otherBoundary}`, (value) => { value.boundaryMode = otherBoundary; }]
    ];

    for (const [property, tamper] of tamperings) {
      const snapshot = structuredClone(genuineSnapshot);
      tamper(continuousIn(snapshot, spaceId));

      expect(() => restore(model, snapshot, declared)).toThrow(`Space ${spaceId} ${property} does not match the configured model`);
    }
  });

  it.each([
    ["Schelling", SCHELLING_SPACE_ID],
    ["Forest Fire", FOREST_FIRE_SPACE_ID]
  ] as const)("%s: rejects grid extents and boundary mode that differ from the configuration", (name, spaceId) => {
    const model = byName(name);
    const { snapshot: genuineSnapshot, declared } = genuine(model);
    const grid = gridIn(genuineSnapshot, spaceId);
    const otherBoundary = grid.boundaryMode === "wrap" ? "clamp" : "wrap";
    const tamperings: Array<[string, (value: Extract<SerializedSpace, { kind: "grid2d" }>) => void]> = [
      [`rows ${grid.rows + 1}`, (value) => { value.rows = grid.rows + 1; }],
      [`cols ${grid.cols + 5}`, (value) => { value.cols = grid.cols + 5; }],
      [`boundaryMode ${otherBoundary}`, (value) => { value.boundaryMode = otherBoundary; }]
    ];

    for (const [property, tamper] of tamperings) {
      const snapshot = structuredClone(genuineSnapshot);
      tamper(gridIn(snapshot, spaceId));

      expect(() => restore(model, snapshot, declared)).toThrow(`Space ${spaceId} ${property} does not match the configured model`);
    }
  });

  it("rejects a malicious Schelling extent before any tick, while parameters bound every other entry path", () => {
    const model = byName("Schelling");
    const { snapshot, declared } = genuine(model);
    Object.assign(gridIn(snapshot, SCHELLING_SPACE_ID), { rows: 1_000_000, cols: 1_000_000 });
    // Before the repair this imported; each tick then scanned 10^12 cells for empty places.
    expect(() => restore(model, snapshot, declared)).toThrow(`Space ${SCHELLING_SPACE_ID} rows 1000000 does not match the configured model`);

    // The same extent through parameters is refused for a new run, a scenario, and a snapshot alike.
    const oversized = { ...snapshot.parameters, rows: 1_000_000 };
    expect(() => new SimulationEngine(schellingTemplate, { seed: "big", parameters: oversized })).toThrow("Parameter rows must be <= 80");
    const engine = new SimulationEngine(schellingTemplate, { seed: "big" });
    expect(() => engine.importScenario({ schemaVersion: "1", templateId: schellingTemplate.id, seed: "big", parameters: oversized, metadata: {} })).toThrow(
      "Parameter rows must be <= 80"
    );
    expect(() => SimulationEngine.fromSnapshot(schellingTemplate, { ...snapshot, parameters: oversized })).toThrow("Parameter rows must be <= 80");
  });

  it("rejects a space the configuration does not have, a configured space that is missing, and a space of another kind", () => {
    const opinion = byName("Opinion");
    const extra = genuine(opinion);
    extra.snapshot.world.spaces.push({ id: "extra", kind: "continuous2d", width: 10, height: 10, boundaryMode: "wrap", positions: {} });
    expect(() => restore(opinion, extra.snapshot, extra.declared)).toThrow("Space extra is not part of the configured model");

    const neural = byName("Neural");
    const missing = genuine(neural);
    missing.snapshot.world.spaces = missing.snapshot.world.spaces.filter((space) => space.id !== NEURAL_EXCITATION_NETWORK_ID);
    expect(() => restore(neural, missing.snapshot, missing.declared)).toThrow(`Configured space ${NEURAL_EXCITATION_NETWORK_ID} is missing`);

    const kind = genuine(opinion);
    kind.snapshot.world.spaces = [{ id: OPINION_SPACE_ID, kind: "network", nodes: [], edges: [] }];
    expect(() => restore(opinion, kind.snapshot, kind.declared)).toThrow(`Space ${OPINION_SPACE_ID} kind network does not match the configured model (continuous2d)`);
  });

  describe("model variant", () => {
    it("rejects a consistent socialLearning Opinion world declared as the default model, and the reverse", () => {
      const social = genuine(byName("Opinion socialLearning"));
      // The world is a complete, self-consistent socialLearning state; only the declaration disagrees.
      expect(() => restore(byName("Opinion socialLearning"), social.snapshot, social.declared)).not.toThrow();
      expect(() => SimulationEngine.fromSnapshot(opinionTemplate, social.snapshot)).toThrow(
        'Global opinionBehaviorMode "socialLearning" does not match the configured model ("default")'
      );

      const plain = genuine(byName("Opinion"));
      expect(() => restore(byName("Opinion"), plain.snapshot, social.declared)).toThrow(
        'Global opinionBehaviorMode "default" does not match the configured model ("socialLearning")'
      );
    });

    it("rejects a default Opinion world whose behavior-mode markers alone were flipped", () => {
      const model = byName("Opinion");
      const { snapshot, declared } = genuine(model);
      Object.assign(snapshot.world.globals, {
        opinionBehaviorMode: "socialLearning",
        opinionInformationSourceCount: 2,
        opinionSocialLearningRuntimeScope: "template-owned-opinion-only"
      });

      expect(() => restore(model, snapshot, declared)).toThrow(/^Global opinion\w+ .* does not match the configured model/);
    });

    it("rejects Flocking worlds whose behavior mode or group count differ from the declaration", () => {
      const grouped = genuine(byName("Flocking groupAware"));
      expect(() => SimulationEngine.fromSnapshot(flockingTemplate, grouped.snapshot)).toThrow(
        'Global flockingBehaviorMode "groupAware" does not match the configured model ("default")'
      );

      const twoGroups = { ...grouped.declared.scenario!, agentComposition: { ...grouped.declared.scenario!.agentComposition, groupCount: 2 } };
      expect(() => SimulationEngine.fromSnapshot(flockingTemplate, grouped.snapshot, { scenario: twoGroups })).toThrow(
        "Global flockingGroupCount 3 does not match the configured model (2)"
      );

      const plain = genuine(byName("Flocking"));
      expect(() => SimulationEngine.fromSnapshot(flockingTemplate, plain.snapshot, grouped.declared)).toThrow(
        'Global flockingBehaviorMode "default" does not match the configured model ("groupAware")'
      );
    });

    it("rejects a Neural world whose configured signal-queue bound was changed", () => {
      const model = byName("Neural");
      const { snapshot, declared } = genuine(model);
      snapshot.world.globals.neuralMaxSignalQueueSize = 5000;

      expect(() => restore(model, snapshot, declared)).toThrow(/^Global neuralMaxSignalQueueSize 5000 does not match the configured model/);
    });

    it("builds the reference world from the declared initialization, so a preset that shaped structure would be checked", () => {
      const template = presetShapedTemplate();
      const large = new SimulationEngine(template, { seed: "preset", initialization: { presetId: "large", options: {} } });
      large.step();
      const snapshot = large.snapshotExport();

      expect(() => SimulationEngine.fromSnapshot(template, snapshot, { initialization: { presetId: "large", options: {} } })).not.toThrow();
      expect(() => SimulationEngine.fromSnapshot(template, snapshot)).toThrow("Space board rows 8 does not match the configured model (4)");
    });

    it("finds no production preset that changes what the configuration fixes, so initialization is initial state only", () => {
      for (const template of productionTemplates) {
        const base = createDefaultRunConfig({ template, seed: `preset-shape-${template.id}` });
        const shapes = (template.initializationPresets ?? []).map((preset) =>
          configurationShape(template, createEngineFromRunConfig({ ...base, initializationPreset: preset.id, initializationOptions: {} }).world)
        );
        expect(new Set(shapes.map((shape) => JSON.stringify(shape))).size).toBe(1);
      }
    });
  });

  describe("parameters and population", () => {
    it("rejects a snapshot whose parameters are not the engine's model parameters", () => {
      const engine = createEngineFromRunConfig(runConfigFor(byName("Opinion")));
      const other = createEngineFromRunConfig({ ...runConfigFor(byName("Opinion")), parameters: { ...engine.parameters, influenceStrength: 0.5 } });
      other.runSteps(2);
      const before = engine.exportSnapshot();

      expect(() => engine.importSnapshot(other.exportSnapshot())).toThrow("Parameter influenceStrength 0.5 does not match the configured model (0.18)");
      expect(engine.exportSnapshot()).toBe(before);
    });

    it("rejects an agent removed entirely, or destroyed, from a model that never creates or destroys entities", () => {
      // Every template except Predator-Prey has a population fixed by its configuration.
      const fixedPopulation = models.filter((candidate) => candidate.template !== predatorPreyTemplate);
      expect(fixedPopulation).toHaveLength(8);
      for (const model of fixedPopulation) {
        const removed = genuine(model);
        const entityId = entityOfType(model, removed.snapshot, Object.keys(model.types)[0]!);
        removeEntity(removed.snapshot, entityId);
        expect(() => restore(model, removed.snapshot, removed.declared)).toThrow(`Configured entity ${entityId} is missing`);

        const destroyed = genuine(model);
        const entity = destroyed.snapshot.world.entities.entities.find((candidate) => candidate.id === entityId)!;
        Object.assign(entity, { alive: false, destroyedAtTick: destroyed.snapshot.tick });
        for (const space of destroyed.snapshot.world.spaces) {
          removeMember(space, entityId);
        }
        expect(() => restore(model, destroyed.snapshot, destroyed.declared)).toThrow(
          `Entity ${entityId} is destroyed, but the configured model never destroys entities`
        );
      }
    });

    it("keeps Predator-Prey populations free to change through births and deaths", () => {
      const model = byName("Predator-Prey");
      const { snapshot, declared } = genuine(model);
      removeEntity(snapshot, entityOfType(model, snapshot, "prey"));
      snapshot.world.entities.entities.push({ id: "e999999", archetype: "prey", alive: true, createdAtTick: snapshot.tick });
      snapshot.world.components[Position2D]!.e999999 = { x: 5, y: 5 };
      snapshot.world.components[Velocity2D]!.e999999 = { x: 0, y: 0 };
      snapshot.world.components[Species]!.e999999 = { kind: "prey" };
      positionsOf(snapshot, PREDATOR_PREY_SPACE_ID).e999999 = { x: 5, y: 5 };

      expect(() => restore(model, snapshot, declared).runSteps(3)).not.toThrow();
    });
  });

  it("rejects a Flocking world combining changed extents, boundary, and behavior mode, and each one alone", () => {
    const model = byName("Flocking groupAware");
    const attacks: Record<string, (snapshot: SnapshotExport) => void> = {
      width: (snapshot) => { continuousIn(snapshot, FLOCKING_SPACE_ID).width = 60; },
      boundary: (snapshot) => { continuousIn(snapshot, FLOCKING_SPACE_ID).boundaryMode = "clamp"; },
      mode: (snapshot) => { snapshot.world.globals.flockingBehaviorMode = "default"; }
    };
    const combined = genuine(model);
    for (const attack of Object.values(attacks)) {
      attack(combined.snapshot);
    }
    expect(() => restore(model, combined.snapshot, combined.declared)).toThrow(SimulationValidationError);

    for (const [name, attack] of Object.entries(attacks)) {
      const single = genuine(model);
      attack(single.snapshot);
      expect(() => restore(model, single.snapshot, single.declared), name).toThrow(/does not match the configured model/);
    }
  });

  describe("every import path", () => {
    afterEach(() => {
      useSimulationStore.getState().selectTemplate("epidemic-spread");
    });

    it("direct restore into a live engine refuses a changed extent and leaves the run untouched", () => {
      const engine = createEngineFromRunConfig(runConfigFor(byName("Opinion")));
      engine.runSteps(2);
      const snapshot = engine.snapshotExport();
      continuousIn(snapshot, OPINION_SPACE_ID).width = 25;
      const before = engine.exportSnapshot();

      expect(() => engine.importSnapshot(snapshot)).toThrow(`Space ${OPINION_SPACE_ID} width 25 does not match the configured model (100)`);

      expect(engine.exportSnapshot()).toBe(before);
      expect(engine.failure).toBeUndefined();
      engine.step();
      expect(engine.world.tick).toBe(3);
    });

    it("the main-thread paste import refuses geometry, variant, and self-contradictory declarations, keeping the run", () => {
      const store = useSimulationStore;
      const attempts: Array<[string, (snapshot: SnapshotExport) => void, string]> = [
        ["schelling-segregation", (snapshot) => { gridIn(snapshot, SCHELLING_SPACE_ID).rows += 3; }, `Space ${SCHELLING_SPACE_ID} rows`],
        ["opinion-dynamics", (snapshot) => { delete snapshot.metadata.behaviorMode; }, "Global opinionBehaviorMode"],
        ["opinion-dynamics", (snapshot) => { snapshot.metadata.agentComposition = { agentCount: 40 }; }, "Parameter agentCount 100 does not match the configured model (40)"]
      ];

      for (const [templateId, tamper, message] of attempts) {
        store.getState().selectTemplate(templateId as never);
        if (templateId === "opinion-dynamics") {
          store.getState().applyScenario(
            patchScenarioVariantOptions(createDefaultScenario({ template: opinionTemplate, seed: "paste-variant", now }), { behaviorMode: "socialLearning" }, now)
          );
        }
        const engine = store.getState().engine!;
        store.getState().runFrameSteps(2);
        store.getState().exportSnapshot();
        const snapshot = JSON.parse(store.getState().exportText) as SnapshotExport;
        tamper(snapshot);

        store.getState().setImportMode("snapshot");
        store.getState().setImportText(JSON.stringify(snapshot));
        store.getState().importJson();

        expect(store.getState().lastError?.text).toContain(`Import failed: ${message}`);
        expect(store.getState().engine).toBe(engine);
        expect(engine.world.tick).toBe(2);
        store.getState().runFrameSteps(1);
        expect(engine.world.tick).toBe(3);
      }
    });

    it("the Worker session and driver refuse boundary, variant, and self-contradictory declarations, keeping the run", async () => {
      const session = new RuntimeSession("local", () => 0);
      session.rebuild({ runId: "valid", runConfig: createImmersiveFlockingRunConfig(100) }, { generation: 1, runId: "valid" }, "initialization");
      session.advance(3, "step");
      const exported = session.exportArtifact("snapshot");
      const recipe = (snapshot: SnapshotExport) =>
        (snapshot.metadata.ortusRuntimeRunConfigV1 as { runConfig: Record<string, JsonValue> }).runConfig;
      const attempts: Array<[(snapshot: SnapshotExport) => void, RegExp]> = [
        // The hybrid a reviewer found: movement reads the parameter, neighbour search the space.
        [(snapshot) => { continuousIn(snapshot, FLOCKING_SPACE_ID).boundaryMode = "bounce"; }, /^Space flocking-space boundaryMode bounce does not match/],
        [(snapshot) => { recipe(snapshot).behaviorMode = "groupAware"; }, /^Global flockingBehaviorMode "default" does not match the configured model \("groupAware"\)$/],
        [(snapshot) => { recipe(snapshot).environmentOptions = { boundaryMode: "bounce" }; }, /^Parameter boundaryMode "wrap" does not match the configured model \("bounce"\)$/]
      ];
      const driver = new LocalRuntimeDriver();
      await driver.initialize({ runId: "driver", runConfig: createImmersiveFlockingRunConfig(100) });

      for (const [tamper, message] of attempts) {
        const snapshot = JSON.parse(exported) as SnapshotExport;
        tamper(snapshot);
        const json = JSON.stringify(snapshot);

        expect(() => session.importArtifact({ runId: "tampered", kind: "snapshot", json }, { generation: 2, runId: "tampered" })).toThrow(message);
        expect(session.currentIdentity()).toEqual({ generation: 1, runId: "valid" });
        await expect(driver.importArtifact({ runId: "driver-tampered", kind: "snapshot", json })).rejects.toThrow(message);
        expect(driver).toMatchObject({ generation: 1, state: "ready" });
      }
      expect(session.advance(1, "step").frame.tick).toBe(4);
      await driver.step();
      expect(driver.getLatestUI()).toMatchObject({ generation: 1, runId: "driver", tick: 1 });
      driver.dispose();
    });
  });

  describe("preservation", () => {
    afterEach(() => {
      useSimulationStore.getState().selectTemplate("epidemic-spread");
    });

    it.each(productionTemplates.map((template) => [template.id, template] as const))(
      "%s: every behavior mode and initialization preset restores its evolved world and continues deterministically",
      (_templateId, template) => {
        expect(template.initializationPresets?.length).toBeGreaterThan(0);
        for (const preset of template.initializationPresets ?? []) {
          for (const mode of template.behaviorModes ?? [{ id: "default" }]) {
            const config = {
              ...createDefaultRunConfig({ template, seed: `round-${preset.id}-${mode.id}` }),
              initializationPreset: preset.id,
              initializationOptions: {},
              behaviorMode: mode.id
            };
            const original = createEngineFromRunConfig(config);
            original.runSteps(12);
            const restored = SimulationEngine.fromSnapshot(template, original.snapshotExport(), {
              initialization: original.initialization!,
              scenario: original.scenario!
            });
            original.runSteps(3);
            restored.runSteps(3);
            expect(restored.createSnapshot()).toEqual(original.createSnapshot());
          }
        }
      },
      60_000
    );

    it("restores Flocking wrap, bounce, and clamp worlds through the Worker path with one boundary authority", () => {
      for (const boundaryMode of ["wrap", "bounce", "clamp"] as const) {
        const session = new RuntimeSession("local", () => 0);
        const runConfig = { ...createImmersiveFlockingRunConfig(100), environmentOptions: { boundaryMode } };
        session.rebuild({ runId: boundaryMode, runConfig }, { generation: 1, runId: boundaryMode }, "initialization");
        for (let batch = 0; batch < 4; batch += 1) {
          session.advance(5, "step");
        }
        const exported = session.exportArtifact("snapshot");

        session.importArtifact({ runId: `${boundaryMode}-restored`, kind: "snapshot", json: exported }, { generation: 2, runId: `${boundaryMode}-restored` });

        const restored = JSON.parse(session.exportArtifact("snapshot")) as SnapshotExport;
        expect(restored.parameters.boundaryMode).toBe(boundaryMode);
        expect(continuousIn(restored, FLOCKING_SPACE_ID).boundaryMode).toBe(boundaryMode);
        expect(restored.tick).toBe(20);
      }
    });

    it("imports every main-thread behavior mode and preset through the paste path", () => {
      const store = useSimulationStore;
      let imported = 0;
      for (const template of productionTemplates.filter((candidate) => candidate !== flockingTemplate)) {
        for (const preset of template.initializationPresets ?? []) {
          for (const mode of template.behaviorModes ?? [{ id: "default" }]) {
            let scenario = createDefaultScenario({ template, seed: `paste-${preset.id}-${mode.id}`, now });
            scenario = updateScenarioPreset(scenario, preset.id, now);
            scenario = patchScenarioVariantOptions(scenario, { behaviorMode: mode.id }, now);
            store.getState().applyScenario(scenario);
            store.getState().runFrameSteps(3);
            store.getState().exportSnapshot();

            store.getState().setImportMode("snapshot");
            store.getState().setImportText(store.getState().exportText);
            store.getState().importJson();

            expect(store.getState().lastError, `${template.id} ${preset.id} ${mode.id}`).toBeNull();
            expect(store.getState().engine!.world.tick).toBe(3);
            expect(store.getState().engine!.scenario?.behaviorMode).toBe(mode.id);
            imported += 1;
          }
        }
      }
      // Six main-thread templates, each with at least one preset; Opinion adds a second behavior mode.
      expect(imported).toBeGreaterThan(12);
    }, 60_000);

    it("keeps the declared model through Reset after a restore, in the kernel and in the Worker session", () => {
      for (const name of ["Opinion socialLearning", "Flocking groupAware"]) {
        const model = byName(name);
        const { snapshot, declared } = genuine(model);
        const restored = restore(model, snapshot, declared);
        restored.reset();
        expect(tickZeroWorld(restored)).toEqual(tickZeroWorld(createEngineFromRunConfig({ ...runConfigFor(model), seed: snapshot.seed })));
      }

      const runConfig = { ...createImmersiveFlockingRunConfig(100), behaviorMode: "groupAware" };
      const session = new RuntimeSession("local", () => 0);
      session.rebuild({ runId: "grouped", runConfig }, { generation: 1, runId: "grouped" }, "initialization");
      session.advance(4, "step");
      const exported = session.exportArtifact("snapshot");
      session.importArtifact({ runId: "restored", kind: "snapshot", json: exported }, { generation: 2, runId: "restored" });
      session.reset({ generation: 3, runId: "restored" });
      const reset = JSON.parse(session.exportArtifact("snapshot")) as SnapshotExport;
      expect(reset.tick).toBe(0);
      expect(reset.world.globals.flockingBehaviorMode).toBe("groupAware");
      expect(Object.keys(reset.world.components[BoidGroup] ?? {})).toHaveLength(100);
    });
  });
});

function runConfigFor(model: ModelCase): SimulationRunConfig {
  return { ...createDefaultRunConfig({ template: model.template, seed: `validity-${model.name}` }), ...model.config };
}

function genuine(model: ModelCase): {
  engine: SimulationEngine;
  snapshot: SnapshotExport;
  declared: Pick<SimulationEngineOptions, "initialization" | "scenario">;
} {
  const engine = createEngineFromRunConfig(runConfigFor(model));
  engine.runSteps(model.ticks);
  return {
    engine,
    snapshot: engine.snapshotExport(),
    declared: {
      ...(engine.initialization ? { initialization: engine.initialization } : {}),
      ...(engine.scenario ? { scenario: engine.scenario } : {})
    }
  };
}

function restore(model: ModelCase, snapshot: SnapshotExport, declared: Pick<SimulationEngineOptions, "initialization" | "scenario">): SimulationEngine {
  return SimulationEngine.fromSnapshot(model.template, structuredClone(snapshot), declared);
}

function entityOfType(model: ModelCase, snapshot: SnapshotExport, type: string): string {
  const matches = model.types[type]!;
  const entity = snapshot.world.entities.entities.find((candidate) => candidate.alive && matches(snapshot, candidate.id));
  if (!entity) {
    throw new Error(`${model.name} snapshot has no live ${type} entity`);
  }
  return entity.id;
}

function componentsOf(snapshot: SnapshotExport, entityId: string): string[] {
  return Object.keys(snapshot.world.components).filter((component) => snapshot.world.components[component]?.[entityId] !== undefined);
}

// The ghost the Phase 3B review built: the placing component and every space membership removed, the rest
// of the agent's state kept. Neural synapses to the neuron are removed as well, so nothing else refers to it.
function makeGhost(snapshot: SnapshotExport, entityId: string, placement: ComponentType): void {
  delete snapshot.world.components[placement]?.[entityId];
  for (const space of snapshot.world.spaces) {
    removeMember(space, entityId);
  }
  const synapses = snapshot.world.globals[neuralSynapsesGlobalKey];
  if (Array.isArray(synapses)) {
    snapshot.world.globals[neuralSynapsesGlobalKey] = synapses.filter(
      (synapse) => (synapse as { sourceId: string }).sourceId !== entityId && (synapse as { targetId: string }).targetId !== entityId
    );
  }
}

function removeEntity(snapshot: SnapshotExport, entityId: string): void {
  makeGhost(snapshot, entityId, Position2D);
  for (const component of componentsOf(snapshot, entityId)) {
    delete snapshot.world.components[component]![entityId];
  }
  snapshot.world.entities.entities = snapshot.world.entities.entities.filter((entity) => entity.id !== entityId);
  snapshot.world.events.events = snapshot.world.events.events.filter((event) => event.target !== entityId);
}

function socialLearningStateOf(model: ModelCase): ComponentValue {
  const { snapshot } = genuine(model);
  return Object.values(snapshot.world.components[OpinionSocialLearningState]!)[0]!;
}

function spaceIn(snapshot: SnapshotExport, spaceId: string): SerializedSpace {
  const space = snapshot.world.spaces.find((candidate) => candidate.id === spaceId);
  if (!space) {
    throw new Error(`No space ${spaceId}`);
  }
  return space;
}

function continuousIn(snapshot: SnapshotExport, spaceId: string): Extract<SerializedSpace, { kind: "continuous2d" }> {
  const space = spaceIn(snapshot, spaceId);
  if (space.kind !== "continuous2d") {
    throw new Error(`${spaceId} is not continuous`);
  }
  return space;
}

function gridIn(snapshot: SnapshotExport, spaceId: string): Extract<SerializedSpace, { kind: "grid2d" }> {
  const space = spaceIn(snapshot, spaceId);
  if (space.kind !== "grid2d") {
    throw new Error(`${spaceId} is not a grid`);
  }
  return space;
}

function positionsOf(snapshot: SnapshotExport, spaceId: string): Record<string, { x: number; y: number }> {
  return continuousIn(snapshot, spaceId).positions;
}

function memberIds(space: SerializedSpace): string[] {
  return space.kind === "continuous2d" ? Object.keys(space.positions) : space.kind === "grid2d" ? Object.keys(space.cells) : space.nodes;
}

function firstMember(space: SerializedSpace): string {
  return sorted(memberIds(space))[0]!;
}

function sorted(ids: readonly string[]): string[] {
  return [...ids].sort();
}

function removeMember(space: SerializedSpace, entityId: string): void {
  if (space.kind === "continuous2d") {
    delete space.positions[entityId];
  } else if (space.kind === "grid2d") {
    delete space.cells[entityId];
  } else {
    space.nodes = space.nodes.filter((node) => node !== entityId);
    space.edges = space.edges.filter((edge) => edge.source !== entityId && edge.target !== entityId);
  }
}

// What a configuration fixes in a world: space shapes, configuration globals, and a fixed entity set.
function configurationShape(template: SimulationTemplate, world: World): JsonValue {
  const fixed = template.fixedByConfiguration ?? {};
  return {
    spaces: world.serialize().spaces.map((space) => {
      const { positions: _positions, cells: _cells, nodes: _nodes, edges: _edges, ...shape } = space as Record<string, JsonValue>;
      return shape;
    }),
    globals: (fixed.globals ?? []).map((key) => world.globals[key] ?? null),
    entities: fixed.population ? world.entityStore.aliveIds() : []
  };
}

// Tick-0 world state without the event log, whose entries name how the run was created.
function tickZeroWorld(engine: SimulationEngine) {
  const world = engine.world.serialize();
  const { simulationEventLog: _log, ...globals } = world.globals;
  return { tick: world.tick, entities: world.entities, components: world.components, spaces: world.spaces, events: world.events, globals };
}

// A template without an agent role, whose world has live entities that are not placed and hold no model
// state: a note with no components and a tagged entity outside the field.
function unroledTemplate(): SimulationTemplate {
  return {
    id: "unroled",
    name: "Unroled",
    description: "Live non-agent entities test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    documentation: minimalDocumentation(),
    createInitialWorld: () => {
      const world = new World();
      const field = new Continuous2DSpace({ id: "field", width: 10, height: 10, boundaryMode: "wrap" });
      world.addSpace(field);
      world.entityStore.create("agent", { id: "walker", createdAtTick: 0 });
      world.componentStore.add("walker", "Step", { dx: 1 });
      field.addEntity("walker", { x: 1, y: 1 });
      world.entityStore.create("note", { id: "note", createdAtTick: 0 });
      world.entityStore.create("tagged", { id: "tagged", createdAtTick: 0 });
      world.componentStore.add("tagged", "Tag", { value: 1 });
      return world;
    },
    registerSystems: (registry) => {
      registry.register({
        id: "walk",
        phase: "act",
        priority: 0,
        update: (ctx) => {
          const location = ctx.spaces.continuous2D("field")!.getPosition("walker")!;
          ctx.commands.moveEntity("field", "walker", { x: location.x + 1, y: location.y });
        }
      });
    },
    registerMetrics: () => undefined,
    getVisuals: () => ({ components: {} })
  };
}

// A template whose "large" preset builds a bigger board, standing in for a preset that shapes structure.
function presetShapedTemplate(): SimulationTemplate {
  return {
    id: "preset-shaped",
    name: "Preset Shaped",
    description: "Structural initialization preset test template.",
    version: "1.0.0",
    parameterDefinitions: [],
    initializationPresets: [
      { id: "small", label: "Small", description: "A 4 x 4 board." },
      { id: "large", label: "Large", description: "An 8 x 8 board." }
    ],
    documentation: minimalDocumentation(),
    createInitialWorld: (ctx) => {
      const size = ctx.initialization?.presetId === "large" ? 8 : 4;
      const world = new World();
      world.addSpace(new Grid2DSpace({ id: "board", rows: size, cols: size, boundaryMode: "clamp" }));
      return world;
    },
    registerSystems: () => undefined,
    registerMetrics: () => undefined,
    getVisuals: () => ({ components: {} })
  };
}

function minimalDocumentation(): SimulationTemplate["documentation"] {
  return {
    purpose: "Exercise model-validity checks.",
    entities: [],
    stateVariables: [],
    processOverview: "Minimal.",
    scheduling: "None.",
    designConcepts: {},
    initialization: "Fixed.",
    submodels: [],
    assumptions: [],
    limitations: []
  };
}
