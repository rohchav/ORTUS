import { performance } from "node:perf_hooks";
import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { SimulationTemplate } from "../kernel/types";
import { epidemicTemplate } from "../templates/epidemic.template";
import { flockingTemplate } from "../templates/flocking.template";
import { opinionTemplate } from "../templates/opinion.template";
import { predatorPreyTemplate } from "../templates/predatorPrey.template";
import { schellingTemplate } from "../templates/schelling.template";

interface BaselineResult {
  templateId: string;
  ticks: number;
  elapsedMs: number;
  averageMsPerTick: number;
  finalEntityCount: number;
  metricsHistoryLength: number;
}

describe("simulation performance baseline", () => {
  it("runs default templates for 300 ticks and reports coarse timing", () => {
    const results = [epidemicTemplate, opinionTemplate, predatorPreyTemplate, schellingTemplate, flockingTemplate].map((template) =>
      runBaseline(template, 300)
    );

    console.info(
      "Simulation performance baseline:",
      JSON.stringify(
        results.map((result) => ({
          ...result,
          elapsedMs: Number(result.elapsedMs.toFixed(2)),
          averageMsPerTick: Number(result.averageMsPerTick.toFixed(4))
        })),
        null,
        2
      )
    );

    for (const result of results) {
      expect(result.finalEntityCount).toBeGreaterThanOrEqual(0);
      expect(result.finalEntityCount).toBeLessThan(5000);
      expect(result.metricsHistoryLength).toBeGreaterThan(0);
      expect(result.metricsHistoryLength).toBeLessThanOrEqual(1000);
      expect(Number.isFinite(result.averageMsPerTick)).toBe(true);
    }
  }, 60_000);
});

function runBaseline(template: SimulationTemplate, ticks: number): BaselineResult {
  const engine = new SimulationEngine(template, { seed: `performance-${template.id}` });
  const started = performance.now();
  engine.runSteps(ticks);
  const elapsedMs = performance.now() - started;
  const snapshot = engine.createSnapshot();

  for (const record of snapshot.metricsHistory) {
    for (const value of Object.values(record.values)) {
      expect(Number.isFinite(value)).toBe(true);
    }
  }

  return {
    templateId: template.id,
    ticks,
    elapsedMs,
    averageMsPerTick: elapsedMs / ticks,
    finalEntityCount: snapshot.entities.filter((entity) => entity.alive).length,
    metricsHistoryLength: snapshot.metricsHistory.length
  };
}
