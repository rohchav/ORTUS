import { performance } from "node:perf_hooks";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterValues, SimulationSnapshotView, SimulationTemplate } from "../kernel/types";
import { flockingTemplate } from "../templates/flocking.template";
import { forestFireTemplate } from "../templates/forestFire.template";
import { predatorPreyTemplate } from "../templates/predatorPrey.template";
import { renderAgents, renderGrid } from "../../lib/templateVisuals";

interface PerformanceScenario {
  label: string;
  template: SimulationTemplate;
  ticks: number;
  parameters?: ParameterValues;
  notes?: string;
}

interface PerformanceReportRow {
  label: string;
  templateId: string;
  ticks: number;
  entityOrCellCount: number;
  elapsedMs: number;
  ticksPerSecond: number;
  avgStepMs: number;
  avgTickComputeMs: number;
  avgMetricsMs: number;
  avgValidationAndOverheadMs: number;
  snapshotMs: number;
  renderModelMs: number;
  neighborSearchStrategy: string;
  spatialIndexUsed: boolean | null;
  neighborQueries: number;
  allPairsQueries: number;
  spatialIndexQueries: number;
  neighborDistanceChecks: number;
  spatialIndexCandidateChecks: number;
  spatialIndexVisitedCells: number;
  flockingPairwiseChecks: number;
  forestFireChangedCellCount: number | null;
  forestFireComponentUpdates: number | null;
  forestFireNeighborChecks: number | null;
  metricsHistoryLength: number;
  notes: string;
}

const scenarios: PerformanceScenario[] = [
  {
    label: "flocking 100 agents / 100 ticks",
    template: flockingTemplate,
    ticks: 100,
    parameters: { agentCount: 100, noise: 0 },
    notes: "Flocking local-radius baseline near the spatial-index activation threshold."
  },
  {
    label: "flocking 500 agents / 100 ticks",
    template: flockingTemplate,
    ticks: 100,
    parameters: { agentCount: 500, noise: 0 },
    notes: "Flocking stress run inside the template's validated parameter bounds."
  },
  {
    label: "forest-fire medium grid / 100 ticks",
    template: forestFireTemplate,
    ticks: 100,
    parameters: { gridWidth: 80, gridHeight: 60 },
    notes: "Grid-local local-spread run; this is not spatial-field runtime support."
  },
  {
    label: "predator-prey default / 100 ticks",
    template: predatorPreyTemplate,
    ticks: 100,
    notes: "Movement-heavy continuous-space run using the generic spatial-index path when the predation radius is local."
  }
];

const results = scenarios.map(runScenario);

console.info(
  "Simulation performance report:",
  JSON.stringify(
    results.map((result) => ({
      ...result,
      elapsedMs: Number(result.elapsedMs.toFixed(2)),
      ticksPerSecond: Number(result.ticksPerSecond.toFixed(2)),
      avgStepMs: Number(result.avgStepMs.toFixed(3)),
      avgTickComputeMs: Number(result.avgTickComputeMs.toFixed(3)),
      avgMetricsMs: Number(result.avgMetricsMs.toFixed(3)),
      avgValidationAndOverheadMs: Number(result.avgValidationAndOverheadMs.toFixed(3)),
      snapshotMs: Number(result.snapshotMs.toFixed(3)),
      renderModelMs: Number(result.renderModelMs.toFixed(3))
    })),
    null,
    2
  )
);

function runScenario(scenario: PerformanceScenario): PerformanceReportRow {
  const engine = new SimulationEngine(scenario.template, {
    seed: `perf-report-${scenario.template.id}-${scenario.label}`,
    parameters: scenario.parameters,
    performance: { enabled: true, maxSamples: Math.min(5000, scenario.ticks + 5) }
  });
  const started = performance.now();
  engine.runSteps(scenario.ticks);
  const elapsedMs = performance.now() - started;
  const snapshot = engine.createSnapshot();
  const renderStarted = performance.now();
  prepareRenderModel(snapshot);
  const renderModelMs = performance.now() - renderStarted;
  const performanceData = engine.performanceData();
  const tickSamples = performanceData.tickSamples;
  const latestTick = tickSamples.at(-1);
  const snapshotMs = performanceData.snapshotSamples.at(-1)?.snapshotMs ?? 0;
  const continuousSpatialQueries = sumCounter(tickSamples, "continuous2DSpatialIndexQueries");
  const flockingSpatialTicks = sumCounter(tickSamples, "flockingSpatialHashActive");
  const spatialIndexUsed =
    continuousSpatialQueries > 0 || flockingSpatialTicks > 0
      ? true
      : latestTick?.counters.flockingSpatialHashActive === undefined && latestTick?.counters.continuous2DSpatialIndexQueries === undefined
        ? null
        : false;
  const avgStepMs = average(tickSamples.map((sample) => sample.stepMs));
  const avgSchedulerMs = average(tickSamples.map((sample) => sample.schedulerMs));
  const avgMetricsMs = average(tickSamples.map((sample) => sample.metricsMs));

  return {
    label: scenario.label,
    templateId: scenario.template.id,
    ticks: scenario.ticks,
    entityOrCellCount: snapshot.entities.filter((entity) => entity.alive).length,
    elapsedMs,
    ticksPerSecond: elapsedMs > 0 ? (scenario.ticks / elapsedMs) * 1000 : 0,
    avgStepMs,
    avgTickComputeMs: avgSchedulerMs,
    avgMetricsMs,
    avgValidationAndOverheadMs: Math.max(0, avgStepMs - avgSchedulerMs - avgMetricsMs),
    snapshotMs,
    renderModelMs,
    neighborSearchStrategy: scenario.template.runtimeMetadata?.neighborSearchStrategy ?? "unknown",
    spatialIndexUsed,
    neighborQueries: sumCounter(tickSamples, "continuous2DNeighborQueries"),
    allPairsQueries: sumCounter(tickSamples, "continuous2DAllPairsQueries"),
    spatialIndexQueries: continuousSpatialQueries,
    neighborDistanceChecks: sumCounter(tickSamples, "continuous2DNeighborDistanceChecks") + sumCounter(tickSamples, "flockingPairwiseChecks"),
    spatialIndexCandidateChecks: sumCounter(tickSamples, "continuous2DSpatialIndexCandidateChecks"),
    spatialIndexVisitedCells: sumCounter(tickSamples, "continuous2DSpatialIndexVisitedCells"),
    flockingPairwiseChecks: sumCounter(tickSamples, "flockingPairwiseChecks"),
    forestFireChangedCellCount: numericGlobal(snapshot, "forestFireChangedCellCount"),
    forestFireComponentUpdates: numericGlobal(snapshot, "forestFireComponentUpdateCount"),
    forestFireNeighborChecks: numericGlobal(snapshot, "forestFireNeighborCheckCount"),
    metricsHistoryLength: snapshot.metricsHistory.length,
    notes: scenario.notes ?? ""
  };
}

function prepareRenderModel(snapshot: SimulationSnapshotView): void {
  if (snapshot.spaces.some((space) => space.kind === "grid2d")) {
    renderGrid(snapshot);
    return;
  }
  renderAgents(snapshot);
}

function sumCounter(samples: readonly { counters: Record<string, number> }[], counterId: string): number {
  return samples.reduce((sum, sample) => sum + (sample.counters[counterId] ?? 0), 0);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function numericGlobal(snapshot: SimulationSnapshotView, key: string): number | null {
  const value = snapshot.globals[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
