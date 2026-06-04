import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ModelDocumentation, ParameterDefinition, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import type { BoundaryMode } from "../spaces/Space";
import { templateDescriptors, renderAgents } from "../../lib/templateVisuals";
import { Position2D, Velocity2D } from "../templates/epidemic.template";
import {
  BoidGroup,
  BoidState,
  FLOCKING_SPACE_ID,
  createBoidMovementSystem,
  createBoidNeighborSensingSystem,
  createBoidSteeringSystem,
  flockingMetrics,
  flockingTemplate,
  type BoidGroupComponent,
  type BoidStateComponent
} from "../templates/flocking.template";

interface Vec2 extends Record<string, number> {
  x: number;
  y: number;
}

describe("flocking boids template", () => {
  it("is registered for UI selection and can create an engine", () => {
    expect(templateDescriptors.map((descriptor) => descriptor.id)).toContain("flocking-boids");

    const engine = new SimulationEngine(flockingTemplate, {
      seed: "flocking-register",
      parameters: params({ agentCount: 25 })
    });
    const snapshot = engine.createSnapshot();

    expect(engine.template.id).toBe("flocking-boids");
    expect(snapshot.spaces.find((space) => space.kind === "continuous2d")).toMatchObject({ width: 100, height: 100 });
    expect(renderAgents(snapshot)).toHaveLength(25);
    expect(renderAgents(snapshot).every((agent) => agent.shape === "directional")).toBe(true);
  });

  it("initializes boids with bounded positions and finite velocities", () => {
    const maxSpeed = 2.4;
    const engine = new SimulationEngine(flockingTemplate, {
      seed: "flocking-init",
      parameters: params({ agentCount: 30, maxSpeed })
    });
    const snapshot = engine.createSnapshot();
    const space = snapshot.spaces.find((candidate) => candidate.kind === "continuous2d");

    expect(snapshot.entities.filter((entity) => entity.alive)).toHaveLength(30);
    expect(space?.kind).toBe("continuous2d");
    if (space?.kind === "continuous2d") {
      for (const position of Object.values(space.positions)) {
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.x).toBeLessThanOrEqual(space.width);
        expect(position.y).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeLessThanOrEqual(space.height);
      }
    }
    for (const value of Object.values(snapshot.components[Velocity2D] ?? {})) {
      const velocity = value as unknown as Vec2;
      expect(Number.isFinite(velocity.x)).toBe(true);
      expect(Number.isFinite(velocity.y)).toBe(true);
      expect(magnitude(velocity)).toBeLessThanOrEqual(maxSpeed + 1e-9);
    }
  });

  it("is deterministic for the same seed and changes for different seeds", () => {
    const parameters = params({ agentCount: 35, noise: 0.02 });
    const left = new SimulationEngine(flockingTemplate, { seed: "flocking-same", parameters });
    const right = new SimulationEngine(flockingTemplate, { seed: "flocking-same", parameters });
    const different = new SimulationEngine(flockingTemplate, { seed: "flocking-different", parameters });

    left.runSteps(100);
    right.runSteps(100);
    different.runSteps(100);

    expect(left.createSnapshot()).toEqual(right.createSnapshot());
    expect(different.createSnapshot()).not.toEqual(left.createSnapshot());
  });

  it("rejects invalid parameter combinations", () => {
    const invalidCases: Array<Record<string, number | string>> = [
      { agentCount: 501 },
      { perceptionRadius: 91 },
      { separationRadius: 46, perceptionRadius: 90 },
      { separationRadius: 60, perceptionRadius: 20 },
      { maxSpeed: 0 },
      { maxForce: 0 },
      { alignmentWeight: -0.01 },
      { cohesionWeight: -0.01 },
      { separationWeight: -0.01 },
      { noise: 0.6 }
    ];

    for (const overrides of invalidCases) {
      expect(() => new SimulationEngine(flockingTemplate, { parameters: params(overrides) })).toThrow();
    }
  });

  it("separation pushes close boids apart", () => {
    const engine = new SimulationEngine(
      manualTemplate(
        [
          { id: "left", position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } },
          { id: "right", position: { x: 52, y: 50 }, velocity: { x: 0, y: 0 } }
        ],
        { systems: "steering" }
      ),
      {
        parameters: params({
          perceptionRadius: 20,
          separationRadius: 10,
          alignmentWeight: 0,
          cohesionWeight: 0,
          separationWeight: 1,
          maxForce: 1,
          maxSpeed: 2,
          noise: 0
        })
      }
    );

    engine.step();

    expect(velocity(engine, "left").x).toBeLessThan(0);
    expect(velocity(engine, "right").x).toBeGreaterThan(0);
  });

  it("alignment changes heading toward nearby boids", () => {
    const engine = new SimulationEngine(
      manualTemplate(
        [
          { id: "east", position: { x: 50, y: 50 }, velocity: { x: 1, y: 0 } },
          { id: "north", position: { x: 55, y: 50 }, velocity: { x: 0, y: 1 } }
        ],
        { systems: "steering" }
      ),
      {
        parameters: params({
          perceptionRadius: 20,
          separationRadius: 2,
          alignmentWeight: 1,
          cohesionWeight: 0,
          separationWeight: 0,
          maxForce: 0.5,
          maxSpeed: 2,
          noise: 0
        })
      }
    );

    engine.step();

    const next = velocity(engine, "east");
    expect(next.y).toBeGreaterThan(0);
    expect(next.x).toBeLessThan(1);
  });

  it("group-aware alignment weights same-group neighbors more strongly than cross-group neighbors", () => {
    const placements = [
      { id: "subject", position: { x: 50, y: 50 }, velocity: { x: 1, y: 0 }, groupId: "group-1" },
      { id: "same-group", position: { x: 55, y: 50 }, velocity: { x: 0, y: 1 }, groupId: "group-1" },
      { id: "cross-group", position: { x: 45, y: 50 }, velocity: { x: 0, y: -1 }, groupId: "group-2" }
    ];
    const runOptions = {
      parameters: params({
        perceptionRadius: 20,
        separationRadius: 2,
        alignmentWeight: 1,
        cohesionWeight: 0,
        separationWeight: 0,
        maxForce: 0.5,
        maxSpeed: 2,
        noise: 0
      })
    };
    const classic = new SimulationEngine(
      manualTemplate(placements.map(({ groupId: _groupId, ...placement }) => placement), { systems: "steering" }),
      runOptions
    );
    const groupAware = new SimulationEngine(manualTemplate(placements, { systems: "steering", behaviorMode: "groupAware" }), runOptions);

    classic.step();
    groupAware.step();

    expect(Math.abs(velocity(classic, "subject").y)).toBeLessThan(1e-9);
    expect(velocity(groupAware, "subject").y).toBeGreaterThan(0.2);
    expect(velocity(groupAware, "subject")).not.toEqual(velocity(classic, "subject"));
  });

  it("group-aware separation still pushes close cross-group boids apart", () => {
    const engine = new SimulationEngine(
      manualTemplate(
        [
          { id: "left", position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 }, groupId: "group-1" },
          { id: "right", position: { x: 51, y: 50 }, velocity: { x: 0, y: 0 }, groupId: "group-2" }
        ],
        { systems: "steering", behaviorMode: "groupAware" }
      ),
      {
        parameters: params({
          perceptionRadius: 20,
          separationRadius: 10,
          alignmentWeight: 0,
          cohesionWeight: 0,
          separationWeight: 1,
          maxForce: 1,
          maxSpeed: 2,
          noise: 0
        })
      }
    );

    engine.step();

    expect(velocity(engine, "left").x).toBeLessThan(0);
    expect(velocity(engine, "right").x).toBeGreaterThan(0);
  });

  it("cohesion steers boids toward the local center", () => {
    const engine = new SimulationEngine(
      manualTemplate(
        [
          { id: "west", position: { x: 40, y: 50 }, velocity: { x: 0, y: 0 } },
          { id: "east", position: { x: 60, y: 50 }, velocity: { x: 0, y: 0 } }
        ],
        { systems: "steering" }
      ),
      {
        parameters: params({
          perceptionRadius: 30,
          separationRadius: 2,
          alignmentWeight: 0,
          cohesionWeight: 1,
          separationWeight: 0,
          maxForce: 1,
          maxSpeed: 2,
          noise: 0
        })
      }
    );

    engine.step();

    expect(velocity(engine, "west").x).toBeGreaterThan(0);
    expect(velocity(engine, "east").x).toBeLessThan(0);
  });

  it("keeps a zero-neighbor boid finite and stable", () => {
    const engine = new SimulationEngine(
      manualTemplate([{ id: "solo", position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } }], { systems: "steering" }),
      { parameters: params({ perceptionRadius: 10, separationRadius: 2, noise: 0 }) }
    );

    engine.step();

    const next = velocity(engine, "solo");
    expect(Number.isFinite(next.x)).toBe(true);
    expect(Number.isFinite(next.y)).toBe(true);
    expect(next).toEqual({ x: 0, y: 0 });
  });

  it("moves boids and keeps positions within boundary modes", () => {
    const normal = new SimulationEngine(
      manualTemplate([{ id: "moving", position: { x: 10, y: 10 }, velocity: { x: 2, y: 3 } }], { systems: "movement" }),
      { parameters: params({ boundaryMode: "wrap" }) }
    );
    normal.step();
    expect(position(normal, "moving")).toEqual({ x: 12, y: 13 });

    const wrapped = new SimulationEngine(
      manualTemplate([{ id: "wrap", position: { x: 99, y: 50 }, velocity: { x: 3, y: 0 } }], { systems: "movement", boundaryMode: "wrap" }),
      { parameters: params({ boundaryMode: "wrap" }) }
    );
    wrapped.step();
    expect(position(wrapped, "wrap").x).toBeCloseTo(2);

    const bounced = new SimulationEngine(
      manualTemplate([{ id: "bounce", position: { x: 99, y: 50 }, velocity: { x: 3, y: 0 } }], { systems: "movement", boundaryMode: "bounce" }),
      { parameters: params({ boundaryMode: "bounce" }) }
    );
    bounced.step();
    expect(position(bounced, "bounce").x).toBeCloseTo(98);
    expect(velocity(bounced, "bounce").x).toBeCloseTo(-3);
  });

  it("senses and steers from the start-of-tick state before movement", () => {
    const engine = new SimulationEngine(
      manualTemplate(
        [
          { id: "traveler", position: { x: 50, y: 50 }, velocity: { x: 10, y: 0 } },
          { id: "target", position: { x: 60, y: 50 }, velocity: { x: 0, y: 0 } }
        ],
        { systems: "all" }
      ),
      {
        parameters: params({
          perceptionRadius: 5,
          separationRadius: 2,
          alignmentWeight: 1,
          cohesionWeight: 1,
          separationWeight: 1,
          maxSpeed: 10,
          maxForce: 1,
          noise: 0
        })
      }
    );

    engine.step();

    expect(position(engine, "traveler")).toEqual({ x: 60, y: 50 });
    expect(velocity(engine, "traveler")).toEqual({ x: 10, y: 0 });
    expect(boidState(engine, "traveler").neighborCount).toBe(0);
  });

  it("produces the same steering result regardless of insertion order", () => {
    const placements = [
      { id: "a", position: { x: 50, y: 50 }, velocity: { x: 1, y: 0 } },
      { id: "b", position: { x: 54, y: 50 }, velocity: { x: 0, y: 1 } },
      { id: "c", position: { x: 58, y: 50 }, velocity: { x: -1, y: 0 } }
    ];
    const first = new SimulationEngine(manualTemplate(placements, { systems: "steering" }), {
      seed: "flocking-order",
      parameters: params({ perceptionRadius: 20, separationRadius: 2, noise: 0 })
    });
    const reversed = new SimulationEngine(manualTemplate([...placements].reverse(), { systems: "steering" }), {
      seed: "flocking-order",
      parameters: params({ perceptionRadius: 20, separationRadius: 2, noise: 0 })
    });

    first.step();
    reversed.step();

    expect(velocityMap(first)).toEqual(velocityMap(reversed));
  });

  it("records finite flock metrics", () => {
    const engine = new SimulationEngine(flockingTemplate, {
      seed: "flocking-metrics",
      parameters: params({ agentCount: 30 })
    });

    engine.runSteps(20);

    const snapshot = engine.createSnapshot();
    const latest = snapshot.metricsHistory.at(-1)?.values;
    expect(latest).toBeDefined();
    expect(latest?.agentCount).toBe(snapshot.entities.filter((entity) => entity.alive).length);
    expect(latest?.averageSpeed).toBeGreaterThanOrEqual(0);
    expect(latest?.averageNeighborCount).toBeGreaterThanOrEqual(0);
    expect(latest?.alignmentScore).toBeGreaterThanOrEqual(0);
    expect(latest?.alignmentScore).toBeLessThanOrEqual(1);
    expect(latest?.dispersion).toBeGreaterThanOrEqual(0);
    expect(latest?.interGroupDistance).toBe(0);
    for (const value of Object.values(latest ?? {})) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("supports deterministic group-aware behavior mode with group composition and visual metadata", () => {
    const scenario = {
      behaviorMode: "groupAware",
      agentComposition: { agentCount: 40, groupCount: 2, primaryGroupRatio: 0.6 },
      environmentOptions: { boundaryMode: "wrap" }
    };
    const first = new SimulationEngine(flockingTemplate, {
      seed: "flocking-group-aware",
      parameters: params({ agentCount: 40, noise: 0 }),
      scenario
    });
    const second = new SimulationEngine(flockingTemplate, {
      seed: "flocking-group-aware",
      parameters: params({ agentCount: 40, noise: 0 }),
      scenario
    });
    const classic = new SimulationEngine(flockingTemplate, {
      seed: "flocking-group-aware",
      parameters: params({ agentCount: 40, noise: 0 })
    });

    const initial = first.createSnapshot();
    const groups = Object.values(initial.components[BoidGroup] ?? {}) as unknown as BoidGroupComponent[];
    expect(groups).toHaveLength(40);
    expect(groups.filter((group) => group.groupId === "group-1")).toHaveLength(24);
    expect(groups.filter((group) => group.groupId === "group-2")).toHaveLength(16);
    expect(renderAgents(initial).some((agent) => agent.label === "Boid group 1")).toBe(true);

    first.runSteps(30);
    second.runSteps(30);
    classic.runSteps(30);

    expect(first.createSnapshot()).toEqual(second.createSnapshot());
    expect(first.createSnapshot()).not.toEqual(classic.createSnapshot());
    expect(first.createSnapshot().metricsHistory.at(-1)?.values.interGroupDistance).toBeGreaterThan(0);
    expect(Object.values(first.createSnapshot().metricsHistory.at(-1)?.values ?? {}).every(Number.isFinite)).toBe(true);
  });

  it("keeps group-aware behavior deterministic and distinct on the spatial-index path", () => {
    const scenario = {
      behaviorMode: "groupAware",
      agentComposition: { agentCount: 120, groupCount: 2, primaryGroupRatio: 0.55 },
      environmentOptions: { boundaryMode: "wrap" }
    };
    const runOptions = {
      seed: "flocking-group-aware-spatial",
      parameters: params({ agentCount: 120, perceptionRadius: 30, separationRadius: 10, noise: 0 }),
      scenario
    };
    const first = new SimulationEngine(flockingTemplate, runOptions);
    const second = new SimulationEngine(flockingTemplate, runOptions);
    const classic = new SimulationEngine(flockingTemplate, {
      seed: runOptions.seed,
      parameters: runOptions.parameters
    });

    first.runSteps(20);
    second.runSteps(20);
    classic.runSteps(20);

    expect(first.createSnapshot()).toEqual(second.createSnapshot());
    expect(first.createSnapshot()).not.toEqual(classic.createSnapshot());
    expect(first.createSnapshot().metricsHistory.at(-1)?.values.interGroupDistance).toBeGreaterThan(0);
  });

  it("rejects unsupported or inconsistent flocking behavior composition", () => {
    expect(
      () =>
        new SimulationEngine(flockingTemplate, {
          parameters: params({ agentCount: 40 }),
          scenario: { behaviorMode: "orbitField", agentComposition: {}, environmentOptions: {} }
        })
    ).toThrow(/Unsupported flocking behavior mode/);
    expect(
      () =>
        new SimulationEngine(flockingTemplate, {
          parameters: params({ agentCount: 40 }),
          scenario: { behaviorMode: "groupAware", agentComposition: { groupCount: 1 }, environmentOptions: {} }
        })
    ).toThrow(/groupCount/);
    expect(
      () =>
        new SimulationEngine(flockingTemplate, {
          parameters: params({ agentCount: 40 }),
          scenario: { behaviorMode: "groupAware", agentComposition: { groupCount: 41 }, environmentOptions: {} }
        })
    ).toThrow(/groupCount/);
  });

  it("exports scenarios and restores snapshots for deterministic continuation", () => {
    const engine = new SimulationEngine(flockingTemplate, {
      seed: "flocking-serialize",
      parameters: params({ agentCount: 30 })
    });
    engine.runSteps(50);
    const scenario = engine.exportScenario();
    const snapshot = engine.exportSnapshot();
    engine.runSteps(50);

    const restarted = SimulationEngine.fromScenario(flockingTemplate, scenario);
    const restored = SimulationEngine.fromSnapshot(flockingTemplate, snapshot);
    restored.runSteps(50);

    expect(restarted.createSnapshot().tick).toBe(0);
    expect(restored.createSnapshot()).toEqual(engine.createSnapshot());
  });

  it("rejects invalid nested Flocking snapshot state", () => {
    const engine = new SimulationEngine(flockingTemplate, {
      seed: "flocking-invalid-nested",
      parameters: params({ agentCount: 25 })
    });
    const parsed = JSON.parse(engine.exportSnapshot()) as {
      world: { components: Record<string, Record<string, Record<string, unknown>>> };
    };
    const firstId = Object.keys(parsed.world.components[BoidState] ?? {})[0] as string;
    expect(firstId).toBeDefined();

    const boidComponents = parsed.world.components[BoidState];
    expect(boidComponents).toBeDefined();
    boidComponents![firstId] = { neighborCount: 0, localDensity: 0, speed: "fast" };
    expect(() => SimulationEngine.fromSnapshot(flockingTemplate, parsed)).toThrow();
  });
});

function params(overrides: Record<string, number | string> = {}) {
  return {
    agentCount: 25,
    perceptionRadius: 55,
    separationRadius: 18,
    alignmentWeight: 0.55,
    cohesionWeight: 0.35,
    separationWeight: 0.9,
    maxSpeed: 2.4,
    maxForce: 0.08,
    noise: 0.01,
    boundaryMode: "wrap",
    ...overrides
  };
}

function manualTemplate(
  placements: Array<{ id: string; position: Vec2; velocity: Vec2; groupId?: string }>,
  options: { systems: "steering" | "movement" | "all"; boundaryMode?: BoundaryMode; behaviorMode?: "default" | "groupAware" }
): SimulationTemplate {
  return {
    id: `manual-flocking-${options.systems}`,
    name: "Manual Flocking",
    description: "Flocking test fixture.",
    version: "1.0.0",
    parameterDefinitions: flockingParameterDefinitions(),
    documentation: docs(),
    createInitialWorld() {
      const groupCount = new Set(placements.map((placement) => placement.groupId).filter((groupId): groupId is string => typeof groupId === "string")).size;
      const world = new World({
        globals: {
          flockingBehaviorMode: options.behaviorMode ?? "default",
          flockingGroupCount: Math.max(1, groupCount)
        }
      });
      const space = new Continuous2DSpace({
        id: FLOCKING_SPACE_ID,
        width: 100,
        height: 100,
        boundaryMode: options.boundaryMode ?? "wrap"
      });
      world.addSpace(space);
      for (const placement of placements) {
        world.entityStore.create("boid", { id: placement.id, createdAtTick: 0, label: placement.id });
        world.componentStore.add(placement.id, Position2D, placement.position);
        world.componentStore.add(placement.id, Velocity2D, placement.velocity);
        world.componentStore.add(placement.id, BoidState, {
          neighborCount: 0,
          localDensity: 0,
          speed: magnitude(placement.velocity)
        });
        if (placement.groupId) {
          const groupIndex = Number(placement.groupId.replace("group-", ""));
          world.componentStore.add(placement.id, BoidGroup, {
            groupId: placement.groupId,
            groupIndex: Number.isInteger(groupIndex) ? groupIndex : 0,
            groupCount: Math.max(1, groupCount)
          });
        }
        space.addEntity(placement.id, placement.position);
      }
      return world;
    },
    registerSystems(registry) {
      if (options.systems === "all") {
        registry.register(createBoidNeighborSensingSystem());
        registry.register(createBoidSteeringSystem());
        registry.register(createBoidMovementSystem());
        return;
      }
      if (options.systems === "steering") {
        registry.register(createBoidSteeringSystem());
        return;
      }
      registry.register(createBoidMovementSystem());
    },
    registerMetrics(registry) {
      for (const metric of flockingMetrics()) {
        registry.register(metric);
      }
    },
    getVisuals: () => ({ components: {} })
  };
}

function flockingParameterDefinitions(): ParameterDefinition[] {
  return flockingTemplate.parameterDefinitions.map((definition) => ({ ...definition }));
}

function docs(): ModelDocumentation {
  return {
    purpose: "Test Flocking behavior.",
    entities: ["Boids"],
    stateVariables: ["Position2D", "Velocity2D", "BoidState"],
    processOverview: "Sense, steer, move.",
    scheduling: "Steering before movement.",
    designConcepts: { emergence: "Test fixture." },
    initialization: "Manual placement.",
    submodels: ["Steering", "Movement"],
    assumptions: [],
    limitations: []
  };
}

function velocity(engine: SimulationEngine, entityId: string): Vec2 {
  const value = engine.world.view().getComponent<Vec2>(entityId, Velocity2D);
  expect(value).toBeDefined();
  return value!;
}

function position(engine: SimulationEngine, entityId: string): Vec2 {
  const value = engine.world.view().getComponent<Vec2>(entityId, Position2D);
  expect(value).toBeDefined();
  return value!;
}

function boidState(engine: SimulationEngine, entityId: string): BoidStateComponent {
  const value = engine.world.view().getComponent<BoidStateComponent>(entityId, BoidState);
  expect(value).toBeDefined();
  return value!;
}

function velocityMap(engine: SimulationEngine): Record<string, Vec2> {
  const snapshot = engine.createSnapshot();
  const result: Record<string, Vec2> = {};
  for (const [entityId, value] of Object.entries(snapshot.components[Velocity2D] ?? {})) {
    result[entityId] = value as unknown as Vec2;
  }
  return result;
}

function magnitude(value: Vec2): number {
  return Math.hypot(value.x, value.y);
}
