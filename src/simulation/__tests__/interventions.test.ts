import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { appendSimulationEventLogToWorld, maxSimulationEventLogLength, readSimulationEventLog } from "../kernel/EventLog";
import { executeIntervention } from "../interventions/interventionExecutor";
import { boundInterventionHistory, clearInterventionHistory, maxInterventionHistoryLength, readInterventionHistory } from "../interventions";
import { getInterventionDefinition, getInterventionDefinitions } from "../interventions/interventionRegistry";
import { productionTemplates } from "../templates/registry";
import { epidemicTemplate, EPIDEMIC_SPACE_ID, InfectionState, type InfectionStateComponent } from "../templates/epidemic.template";
import { opinionTemplate, OpinionState, type OpinionStateComponent } from "../templates/opinion.template";
import { predatorPreyTemplate, PREDATOR_PREY_SPACE_ID, Species, type SpeciesComponent } from "../templates/predatorPrey.template";
import { schellingTemplate, GroupIdentity, type GroupIdentityComponent } from "../templates/schelling.template";
import { FLOCKING_SPACE_ID, flockingTemplate } from "../templates/flocking.template";
import { Velocity2D } from "../templates/epidemic.template";

describe("intervention framework", () => {
  it("registers template interventions with unique ids", () => {
    for (const template of productionTemplates) {
      const definitions = getInterventionDefinitions(template.id);
      expect(definitions.length).toBeGreaterThan(0);
      expect(new Set(definitions.map((definition) => definition.id)).size).toBe(definitions.length);
      expect(definitions.every((definition) => definition.templateId === template.id)).toBe(true);
      for (const definition of definitions) {
        expect(definition.label.length).toBeGreaterThan(0);
        expect(definition.description.length).toBeGreaterThan(0);
        expect(definition.documentation.length).toBeGreaterThan(0);
        expect(definition.supportedTemplates).toContain(template.id);
        expect(definition.capabilityRequirements).toContain("supportsInterventions");
        expect(definition.mutates.length).toBeGreaterThan(0);
        expect(definition.eventType).toBe("intervention.applied");
        expect(["none", "selectedEntity", "worldPoint", "radius", "gridCell"]).toContain(definition.targetType);
        for (const parameter of definition.parameterDefinitions) {
          expect(parameter.label.length).toBeGreaterThan(0);
          expect(parameter.description.length).toBeGreaterThan(0);
        }
      }
    }
    expect(getInterventionDefinitions("missing-template")).toEqual([]);
    expect(getInterventionDefinition("epidemic-spread", "missing")).toBeUndefined();
  });

  it("rejects unsupported, missing-target, destroyed-target, and invalid-parameter interventions", () => {
    const epidemic = new SimulationEngine(epidemicTemplate, { seed: "intervention-validation" });
    expect(() =>
      executeIntervention(epidemic, { templateId: epidemic.template.id, interventionId: "missing", target: {} })
    ).toThrow(/Unsupported intervention/);
    expect(() =>
      executeIntervention(epidemic, { templateId: epidemic.template.id, interventionId: "epidemic.infectSelected", target: {} })
    ).toThrow(/Select an entity/);
    expect(() =>
      executeIntervention(epidemic, {
        templateId: epidemic.template.id,
        interventionId: "epidemic.infectRadius",
        target: { point: { x: 50, y: 50 } },
        parameters: { radius: -1 }
      })
    ).toThrow(/must be >= 0.1/);
    expect(() =>
      executeIntervention(epidemic, {
        templateId: epidemic.template.id,
        interventionId: "epidemic.infectRadius",
        target: { point: { x: Number.NaN, y: 50 } },
        parameters: { radius: 5 }
      })
    ).toThrow(/Expected finite 2D point/);

    const infectedEngine = new SimulationEngine(epidemicTemplate, {
      seed: "already-infected-validation",
      parameters: { agentCount: 6, initialInfected: 1 }
    });
    const infectedEntity = firstEntityMatching(infectedEngine, InfectionState, (state: InfectionStateComponent) => state.status === "infected");
    expect(() =>
      executeIntervention(infectedEngine, {
        templateId: infectedEngine.template.id,
        interventionId: "epidemic.infectSelected",
        target: { entityId: infectedEntity }
      })
    ).toThrow(/already infected/);

    const opinion = new SimulationEngine(opinionTemplate, { seed: "intervention-validation", parameters: { agentCount: 3 } });
    const opinionEntity = firstEntityWith(opinion, OpinionState);
    expect(() =>
      executeIntervention(opinion, {
        templateId: opinion.template.id,
        interventionId: "opinion.setSelected",
        target: { entityId: opinionEntity },
        parameters: { opinionValue: 2 }
      })
    ).toThrow(/must be <= 1/);

    const predatorPrey = new SimulationEngine(predatorPreyTemplate, {
      seed: "destroyed-validation",
      parameters: { initialPrey: 1, initialPredators: 0 }
    });
    const prey = firstEntityWith(predatorPrey, Species);
    executeIntervention(predatorPrey, {
      templateId: predatorPrey.template.id,
      interventionId: "predatorPrey.removeSelected",
      target: { entityId: prey }
    });
    expect(() =>
      executeIntervention(predatorPrey, {
        templateId: predatorPrey.template.id,
        interventionId: "predatorPrey.removeSelected",
        target: { entityId: prey }
      })
    ).toThrow(/missing or destroyed/);
    expect(readInterventionHistory(predatorPrey).at(-1)?.status).toBe("failed");
    const failureEvent = readSimulationEventLog(predatorPrey).at(-1);
    expect(failureEvent).toMatchObject({
      tick: predatorPrey.world.tick,
      type: "intervention.failed",
      source: "intervention:predatorPrey.removeSelected",
      category: "intervention",
      severity: "error"
    });
  });

  it("infects selected and radius targets without advancing time", () => {
    const engine = new SimulationEngine(epidemicTemplate, {
      seed: "infect-selected",
      parameters: { agentCount: 8, initialInfected: 0, recoveryTicks: 5 }
    });
    const entityId = firstEntityWith(engine, InfectionState);
    const startingTick = engine.world.tick;
    executeIntervention(engine, {
      templateId: engine.template.id,
      interventionId: "epidemic.infectSelected",
      target: { entityId }
    });

    expect(engine.world.tick).toBe(startingTick);
    expect(engine.world.time).toBe(0);
    expect(engine.world.view().getComponent<InfectionStateComponent>(entityId, InfectionState)?.status).toBe("infected");
    expect(engine.snapshotExport().world.events.events.some((event) => event.type === "epidemic.recover" && event.target === entityId)).toBe(true);
    expect(readInterventionHistory(engine).at(-1)?.status).toBe("applied");
    expect(readSimulationEventLog(engine).at(-1)).toMatchObject({
      tick: startingTick,
      type: "intervention.applied",
      source: "intervention:epidemic.infectSelected",
      label: "Infect Selected Agent",
      category: "intervention",
      severity: "info"
    });

    const radiusEngine = new SimulationEngine(epidemicTemplate, {
      seed: "infect-radius",
      parameters: { agentCount: 10, initialInfected: 0, recoveryTicks: 5 }
    });
    const targetEntity = firstEntityWith(radiusEngine, InfectionState);
    const space = radiusEngine.world.view().continuous2D(EPIDEMIC_SPACE_ID);
    const targetPoint = space?.getPosition(targetEntity);
    if (!space || !targetPoint) {
      throw new Error("Expected epidemic continuous space and target position");
    }
    const affected = new Set(space.queryRadius(targetPoint, 0.1).map((result) => result.entityId));
    executeIntervention(radiusEngine, {
      templateId: radiusEngine.template.id,
      interventionId: "epidemic.infectRadius",
      target: { point: targetPoint },
      parameters: { radius: 0.1 }
    });
    for (const candidate of radiusEngine.world.view().entitiesWith([InfectionState])) {
      const infection = radiusEngine.world.view().getComponent<InfectionStateComponent>(candidate, InfectionState);
      expect(infection?.status).toBe(affected.has(candidate) ? "infected" : "susceptible");
    }
  });

  it("updates opinion, predator-prey, Schelling, and Flocking state through interventions", () => {
    const opinion = new SimulationEngine(opinionTemplate, { seed: "set-opinion", parameters: { agentCount: 3 } });
    const opinionEntity = firstEntityWith(opinion, OpinionState);
    executeIntervention(opinion, {
      templateId: opinion.template.id,
      interventionId: "opinion.setSelected",
      target: { entityId: opinionEntity },
      parameters: { opinionValue: -0.75 }
    });
    expect(opinion.world.view().getComponent<OpinionStateComponent>(opinionEntity, OpinionState)?.value).toBe(-0.75);

    const predatorPrey = new SimulationEngine(predatorPreyTemplate, {
      seed: "add-prey",
      parameters: { initialPrey: 1, initialPredators: 0 }
    });
    const beforePrey = predatorPrey.world.view().entitiesWith([Species]).length;
    executeIntervention(predatorPrey, {
      templateId: predatorPrey.template.id,
      interventionId: "predatorPrey.addPrey",
      target: { point: { x: 50, y: 50 } },
      parameters: { count: 2 }
    });
    const afterPrey = predatorPrey.world.view().entitiesWith([Species]).length;
    expect(afterPrey).toBe(beforePrey + 2);
    expect(predatorPrey.world.view().entitiesWith([Species]).every((entityId) => predatorPrey.world.view().getComponent<SpeciesComponent>(entityId, Species)?.kind === "prey")).toBe(true);
    const predatorSpace = predatorPrey.world.view().continuous2D(PREDATOR_PREY_SPACE_ID);
    for (const entityId of predatorPrey.world.view().entitiesWith([Species])) {
      expect(predatorSpace?.getPosition(entityId)).toBeDefined();
    }

    const schelling = new SimulationEngine(schellingTemplate, {
      seed: "swap-group",
      parameters: { rows: 10, cols: 10, density: 0.5 }
    });
    const schellingEntity = firstEntityWith(schelling, GroupIdentity);
    const beforeGroup = schelling.world.view().getComponent<GroupIdentityComponent>(schellingEntity, GroupIdentity)?.group;
    executeIntervention(schelling, {
      templateId: schelling.template.id,
      interventionId: "schelling.swapSelectedGroup",
      target: { entityId: schellingEntity }
    });
    const afterGroup = schelling.world.view().getComponent<GroupIdentityComponent>(schellingEntity, GroupIdentity)?.group;
    expect(afterGroup).toBe(beforeGroup === "A" ? "B" : "A");

    const flocking = new SimulationEngine(flockingTemplate, { seed: "impulse", parameters: { agentCount: 20 } });
    const boid = firstEntityWith(flocking, Velocity2D);
    const beforeVelocity = flocking.world.view().getComponent<{ x: number; y: number }>(boid, Velocity2D);
    executeIntervention(flocking, {
      templateId: flocking.template.id,
      interventionId: "flocking.applyImpulse",
      target: { entityId: boid },
      parameters: { impulseX: 1, impulseY: 0.5, strength: 1.5 }
    });
    const afterVelocity = flocking.world.view().getComponent<{ x: number; y: number }>(boid, Velocity2D);
    expect(afterVelocity).not.toEqual(beforeVelocity);
    expect(Number.isFinite(afterVelocity?.x)).toBe(true);
    expect(Number.isFinite(afterVelocity?.y)).toBe(true);

    const scatterEngine = new SimulationEngine(flockingTemplate, { seed: "scatter", parameters: { agentCount: 20, maxSpeed: 10 } });
    const scatterBoid = firstEntityWith(scatterEngine, Velocity2D);
    const flockingSpace = scatterEngine.world.view().continuous2D(FLOCKING_SPACE_ID);
    const scatterPoint = flockingSpace?.getPosition(scatterBoid);
    const beforeScatter = scatterEngine.world.view().getComponent<{ x: number; y: number }>(scatterBoid, Velocity2D);
    if (!flockingSpace || !scatterPoint || !beforeScatter) {
      throw new Error("Expected flocking space, position, and velocity");
    }
    executeIntervention(scatterEngine, {
      templateId: scatterEngine.template.id,
      interventionId: "flocking.scatterRadius",
      target: { point: scatterPoint },
      parameters: { radius: 0.1, strength: 1.5 }
    });
    const afterScatter = scatterEngine.world.view().getComponent<{ x: number; y: number }>(scatterBoid, Velocity2D);
    expect(afterScatter).not.toEqual(beforeScatter);
    expect(Number.isFinite(afterScatter?.x)).toBe(true);
    expect(Number.isFinite(afterScatter?.y)).toBe(true);
    expect(Math.hypot(afterScatter?.x ?? 0, afterScatter?.y ?? 0)).toBeLessThanOrEqual(10);
  });

  it("continues deterministically after the same intervention sequence and restored intervention snapshot", () => {
    const options = { seed: "intervention-determinism", parameters: { agentCount: 8, initialInfected: 0, recoveryTicks: 10 } };
    const left = new SimulationEngine(epidemicTemplate, options);
    const right = new SimulationEngine(epidemicTemplate, options);
    left.runSteps(50);
    right.runSteps(50);
    const target = firstEntityWith(left, InfectionState);
    executeIntervention(left, { templateId: left.template.id, interventionId: "epidemic.infectSelected", target: { entityId: target } });
    executeIntervention(right, { templateId: right.template.id, interventionId: "epidemic.infectSelected", target: { entityId: target } });
    left.runSteps(50);
    right.runSteps(50);
    expect(right.createSnapshot()).toEqual(left.createSnapshot());

    const original = new SimulationEngine(opinionTemplate, { seed: "intervention-restore", parameters: { agentCount: 8 } });
    original.runSteps(50);
    const opinionEntity = firstEntityWith(original, OpinionState);
    executeIntervention(original, {
      templateId: original.template.id,
      interventionId: "opinion.setSelected",
      target: { entityId: opinionEntity },
      parameters: { opinionValue: 0.9 }
    });
    const restored = SimulationEngine.fromSnapshot(opinionTemplate, original.exportSnapshot());
    original.runSteps(50);
    restored.runSteps(50);
    expect(restored.createSnapshot()).toEqual(original.createSnapshot());
  });

  it("keeps bounded history and restores it through snapshots", () => {
    const bounded = boundInterventionHistory(
      Array.from({ length: maxInterventionHistoryLength + 5 }, (_, index) => historyRecord(index + 1))
    );
    expect(bounded).toHaveLength(maxInterventionHistoryLength);
    expect(bounded[0]?.order).toBe(6);

    const engine = new SimulationEngine(opinionTemplate, { seed: "history-bound", parameters: { agentCount: 1 } });
    const entityId = firstEntityWith(engine, OpinionState);
    for (let index = 0; index < 3; index += 1) {
      executeIntervention(engine, {
        templateId: engine.template.id,
        interventionId: "opinion.setSelected",
        target: { entityId },
        parameters: { opinionValue: (index % 3) / 3 }
      });
    }
    const history = readInterventionHistory(engine);
    expect(history).toHaveLength(3);

    const restored = SimulationEngine.fromSnapshot(opinionTemplate, engine.exportSnapshot());
    expect(readInterventionHistory(restored)).toEqual(history);
    const restarted = SimulationEngine.fromScenario(opinionTemplate, engine.exportScenario());
    expect(readInterventionHistory(restarted)).toEqual([]);
    clearInterventionHistory(restored);
    expect(readInterventionHistory(restored)).toEqual([]);

    const invalidHistorySnapshot = engine.snapshotExport();
    invalidHistorySnapshot.world.globals.interventionHistory = [
      historyRecord(1),
      { id: "bad", templateId: "opinion-dynamics", interventionId: "bad", label: "Bad", tickApplied: 0, simulationTime: 0, targetSummary: "bad", parameters: null, status: "applied", order: 2 }
    ];
    const sanitized = SimulationEngine.fromSnapshot(opinionTemplate, invalidHistorySnapshot);
    expect(readInterventionHistory(sanitized)).toEqual([historyRecord(1)]);
  });

  it("keeps structured event logs bounded and deterministic", () => {
    const left = new SimulationEngine(opinionTemplate, { seed: "event-log-bound", parameters: { agentCount: 1 } });
    const right = new SimulationEngine(opinionTemplate, { seed: "event-log-bound", parameters: { agentCount: 1 } });
    for (let index = 0; index < maxSimulationEventLogLength + 5; index += 1) {
      appendSimulationEventLogToWorld(left.world, { type: "test.event", source: "test", label: `event ${index}`, category: "system" });
      appendSimulationEventLogToWorld(right.world, { type: "test.event", source: "test", label: `event ${index}`, category: "system" });
    }
    const leftLog = readSimulationEventLog(left);
    expect(leftLog).toHaveLength(maxSimulationEventLogLength);
    expect(leftLog[0]?.order).toBe(7);
    expect(leftLog.at(-1)).toMatchObject({ type: "test.event", source: "test", tick: 0 });
    expect(readSimulationEventLog(right)).toEqual(leftLog);
  });
});

function firstEntityWith(engine: SimulationEngine, componentType: string): string {
  const [entityId] = engine.world.view().entitiesWith([componentType]);
  if (!entityId) {
    throw new Error(`No entity with ${componentType}`);
  }
  return entityId;
}

function firstEntityMatching<T>(engine: SimulationEngine, componentType: string, predicate: (value: T) => boolean): string {
  for (const entityId of engine.world.view().entitiesWith([componentType])) {
    const value = engine.world.view().getComponent<T>(entityId, componentType);
    if (value && predicate(value)) {
      return entityId;
    }
  }
  throw new Error(`No matching entity with ${componentType}`);
}

function historyRecord(order: number) {
  return {
    id: `intervention-${order}`,
    templateId: "opinion-dynamics",
    interventionId: "opinion.setSelected",
    label: "Set Selected Opinion",
    tickApplied: 0,
    simulationTime: 0,
    targetSummary: "test",
    parameters: { opinionValue: 0 },
    status: "applied" as const,
    order
  };
}
