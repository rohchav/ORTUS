import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { epidemicTemplate } from "../templates/epidemic.template";
import { flockingTemplate } from "../templates/flocking.template";
import { opinionTemplate } from "../templates/opinion.template";
import { predatorPreyTemplate } from "../templates/predatorPrey.template";
import { schellingTemplate } from "../templates/schelling.template";

const defaultSmokeTemplateCases = [epidemicTemplate, opinionTemplate, predatorPreyTemplate, schellingTemplate, flockingTemplate].map(
  (template) => [template.id, template] as const
);

describe("template extensibility and default smoke", () => {
  it("runs a minimal plugin template without modifying engine internals", () => {
    const template: SimulationTemplate = {
      id: "plugin-template",
      name: "Plugin Template",
      description: "Minimal plugin test.",
      version: "1.0.0",
      parameterDefinitions: [
        {
          key: "increment",
          label: "Increment",
          type: "integer",
          defaultValue: 1,
          min: 1,
          max: 5,
          step: 1,
          description: "Tick increment.",
          liveUpdate: true
        }
      ],
      documentation: {
        purpose: "Prove plugin extensibility.",
        entities: [],
        stateVariables: ["globals.count"],
        processOverview: "A system increments a global value through commands.",
        scheduling: "act phase.",
        designConcepts: { observation: "Count metric." },
        initialization: "Global count starts at zero.",
        submodels: ["Counter"],
        assumptions: [],
        limitations: []
      },
      createInitialWorld() {
        return new World({ globals: { count: 0 } });
      },
      registerSystems(registry) {
        registry.register({
          id: "CounterSystem",
          phase: "act",
          priority: 0,
          update(ctx) {
            const current = Number(ctx.world.globals.count);
            const increment = Number(ctx.params.increment);
            ctx.commands.setGlobal("count", current + increment);
          }
        });
      },
      registerMetrics(registry) {
        registry.register({
          key: "count",
          label: "Count",
          description: "Current count.",
          valueType: "number",
          collect: (world) => Number(world.globals.count)
        });
      },
      getVisuals: () => ({ components: {} })
    };

    const engine = new SimulationEngine(template, { parameters: { increment: 2 } });
    engine.runSteps(10);

    expect(engine.world.globals.count).toBe(20);
    expect(engine.createSnapshot().metricsHistory.at(-1)?.values.count).toBe(20);
  });

  it.each(defaultSmokeTemplateCases)(
    "default template %s runs 300 ticks with finite metrics and bounded populations",
    (_templateId, template) => {
      const engine = new SimulationEngine(template, { seed: `default-${template.id}` });
      expect(() => engine.runSteps(300)).not.toThrow();
      const snapshot = engine.createSnapshot();
      const aliveCount = snapshot.entities.filter((entity) => entity.alive).length;
      expect(aliveCount).toBeGreaterThan(0);
      expect(aliveCount).toBeLessThan(5000);
      for (const record of snapshot.metricsHistory) {
        for (const value of Object.values(record.values)) {
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    },
    30_000
  );
});
