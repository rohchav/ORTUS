import { performance } from "node:perf_hooks";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { flockingTemplate } from "../templates/flocking.template";

interface FlockingBaselineRun {
  label: string;
  ticks: number;
  agentCount: number;
  elapsedMs: number;
  averageMsPerTick: number;
  finalEntityCount: number;
  metricsHistoryLength: number;
}

const scenarios = [
  { label: "100 ticks / 180 boids", ticks: 100, agentCount: 180 },
  { label: "300 ticks / 180 boids", ticks: 300, agentCount: 180 },
  { label: "300 ticks / 300 boids", ticks: 300, agentCount: 300 }
];

const results = scenarios.map(runScenario);

console.info(
  "Flocking performance baseline:",
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

function runScenario(scenario: { label: string; ticks: number; agentCount: number }): FlockingBaselineRun {
  const engine = new SimulationEngine(flockingTemplate, {
    seed: `flocking-baseline-${scenario.agentCount}-${scenario.ticks}`,
    parameters: { agentCount: scenario.agentCount }
  });
  const started = performance.now();
  engine.runSteps(scenario.ticks);
  const elapsedMs = performance.now() - started;
  const snapshot = engine.createSnapshot();
  return {
    label: scenario.label,
    ticks: scenario.ticks,
    agentCount: scenario.agentCount,
    elapsedMs,
    averageMsPerTick: elapsedMs / scenario.ticks,
    finalEntityCount: snapshot.entities.filter((entity) => entity.alive).length,
    metricsHistoryLength: snapshot.metricsHistory.length
  };
}
