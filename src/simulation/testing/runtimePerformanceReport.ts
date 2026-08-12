import { performance } from "node:perf_hooks";
import { isDeepStrictEqual } from "node:util";
import { createImmersiveFlockingRunConfig, type ImmersiveAgentCount } from "../../lib/immersiveWorld";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { InitializationConfig, SimulationTemplate } from "../kernel/types";
import { createFlockingRenderFramePacket } from "../runtime";
import {
  flockingTemplate,
  registerFlockingSystemsWithNeighborStrategy,
  type FlockingNeighborExecutionStrategy
} from "../templates/flocking.template";

const repetitions = 3;
const warmupTicks = 5;
const measuredTicks = 40;
const projectionSamples = 12;
const agentCounts: readonly ImmersiveAgentCount[] = [100, 500];
const strategies: readonly FlockingNeighborExecutionStrategy[] = ["automatic", "allPairsReference", "spatialHash"];

interface StrategySample {
  elapsedMs: number;
  ticksPerSecond: number;
  stepMedianMs: number;
  stepP95Ms: number;
  neighborsMedianMs: number;
  neighborsP95Ms: number;
  candidateChecksPerTick: number;
  spatialHashActive: boolean;
}

const strategyReports = agentCounts.flatMap((agentCount) => strategies.map((strategy) => {
  const samples = Array.from({ length: repetitions }, () => measureStrategy(agentCount, strategy));
  return {
    agentCount,
    strategy,
    repetitions,
    warmupTicks,
    measuredTicks,
    ticksPerSecondMedian: median(samples.map((sample) => sample.ticksPerSecond)),
    ticksPerSecondMin: Math.min(...samples.map((sample) => sample.ticksPerSecond)),
    stepMedianMs: median(samples.map((sample) => sample.stepMedianMs)),
    stepP95Ms: median(samples.map((sample) => sample.stepP95Ms)),
    neighborsMedianMs: median(samples.map((sample) => sample.neighborsMedianMs)),
    neighborsP95Ms: median(samples.map((sample) => sample.neighborsP95Ms)),
    candidateChecksPerTick: median(samples.map((sample) => sample.candidateChecksPerTick)),
    spatialHashActive: samples.every((sample) => sample.spatialHashActive),
    elapsedMsMedian: median(samples.map((sample) => sample.elapsedMs))
  };
}));

const projectionReports = agentCounts.map(measureProjectionBoundary);
const equivalence = agentCounts.map((agentCount) => ({
  agentCount,
  ticks: 24,
  exactSnapshotExport: exactEvolutionMatches(agentCount, 24)
}));

console.info("ORTUS runtime performance report:");
console.info(JSON.stringify({
  methodology: {
    repetitions,
    warmupTicks,
    measuredTicks,
    projectionSamples,
    note: "Node/headless measurements are comparative development evidence, not universal browser performance claims."
  },
  strategyReports: strategyReports.map(roundRecord),
  projectionReports: projectionReports.map(roundRecord),
  equivalence
}, null, 2));

if (equivalence.some((result) => !result.exactSnapshotExport)) {
  throw new Error("Runtime performance report detected Flocking semantic divergence");
}

function measureStrategy(agentCount: ImmersiveAgentCount, strategy: FlockingNeighborExecutionStrategy): StrategySample {
  const engine = createEngine(agentCount, strategy);
  engine.runSteps(warmupTicks);
  engine.performanceMonitor.clear();
  const started = performance.now();
  engine.runSteps(measuredTicks);
  const elapsedMs = performance.now() - started;
  const performanceData = engine.performanceData();
  const step = performanceData.measures.find((measure) => measure.name === "ortus.sim.step");
  const neighbors = performanceData.measures.find((measure) => measure.name === "ortus.sim.neighbors");
  const pairwiseChecks = performanceData.tickSamples.reduce(
    (sum, sample) => sum + (sample.counters.flockingPairwiseChecks ?? 0),
    0
  );
  const spatialTicks = performanceData.tickSamples.reduce(
    (sum, sample) => sum + (sample.counters.flockingSpatialHashActive ?? 0),
    0
  );
  return {
    elapsedMs,
    ticksPerSecond: measuredTicks / elapsedMs * 1_000,
    stepMedianMs: step?.medianMs ?? 0,
    stepP95Ms: step?.p95Ms ?? 0,
    neighborsMedianMs: neighbors?.medianMs ?? 0,
    neighborsP95Ms: neighbors?.p95Ms ?? 0,
    candidateChecksPerTick: pairwiseChecks / measuredTicks,
    spatialHashActive: spatialTicks === measuredTicks
  };
}

function measureProjectionBoundary(agentCount: ImmersiveAgentCount) {
  const engine = createEngine(agentCount, "automatic");
  engine.runSteps(24);
  engine.performanceMonitor.clear();
  let snapshot = engine.createSnapshot();
  const snapshotDurations: number[] = [];
  const packetDurations: number[] = [];
  let packet = createFlockingRenderFramePacket(engine, { generation: 1, runId: `perf1-${agentCount}` }, null);

  for (let sample = 0; sample < projectionSamples; sample += 1) {
    const snapshotStarted = performance.now();
    snapshot = engine.createSnapshot();
    snapshotDurations.push(performance.now() - snapshotStarted);
    const packetStarted = performance.now();
    packet = createFlockingRenderFramePacket(engine, { generation: 1, runId: `perf1-${agentCount}` }, null, sample + 1);
    packetDurations.push(performance.now() - packetStarted);
  }

  return {
    agentCount,
    samples: projectionSamples,
    snapshotMedianMs: percentile(snapshotDurations, 0.5),
    snapshotP95Ms: percentile(snapshotDurations, 0.95),
    packetMedianMs: percentile(packetDurations, 0.5),
    packetP95Ms: percentile(packetDurations, 0.95),
    snapshotJsonBytes: Buffer.byteLength(JSON.stringify(snapshot)),
    packetTypedArrayBytes: packetBytes(packet),
    packetContainsMetricHistory: Object.hasOwn(packet, "metricsHistory")
  };
}

function exactEvolutionMatches(agentCount: ImmersiveAgentCount, ticks: number): boolean {
  const reference = createEngine(agentCount, "allPairsReference");
  const indexed = createEngine(agentCount, "spatialHash");
  reference.runSteps(ticks);
  indexed.runSteps(ticks);
  return isDeepStrictEqual(indexed.snapshotExport(), reference.snapshotExport());
}

function createEngine(agentCount: ImmersiveAgentCount, strategy: FlockingNeighborExecutionStrategy): SimulationEngine {
  const config = createImmersiveFlockingRunConfig(agentCount);
  const initialization: InitializationConfig | undefined = config.initializationPreset
    ? { presetId: config.initializationPreset, options: config.initializationOptions ?? {} }
    : undefined;
  return new SimulationEngine(templateFor(strategy), {
    seed: config.seed,
    parameters: config.parameters,
    ...(initialization ? { initialization } : {}),
    scenario: {
      behaviorMode: config.behaviorMode ?? "default",
      agentComposition: config.agentComposition ?? {},
      environmentOptions: config.environmentOptions ?? {},
      ...(initialization ? { initialization } : {})
    },
    metadata: config.metadata ?? {},
    performance: { enabled: true, maxSamples: 360 }
  });
}

function templateFor(strategy: FlockingNeighborExecutionStrategy): SimulationTemplate {
  return {
    ...flockingTemplate,
    registerSystems(registry) {
      registerFlockingSystemsWithNeighborStrategy(registry, strategy);
    }
  };
}

function packetBytes(packet: ReturnType<typeof createFlockingRenderFramePacket>): number {
  return packet.entityIds.byteLength
    + packet.positions.byteLength
    + packet.velocities.byteLength
    + packet.neighborCounts.byteLength
    + packet.localDensities.byteLength
    + packet.groupCodes.byteLength
    + (packet.selectedDetail?.neighborIds.byteLength ?? 0)
    + (packet.selectedDetail?.neighborOffsets.byteLength ?? 0)
    + (packet.selectedDetail?.neighborDistances.byteLength ?? 0);
}

function median(values: readonly number[]): number {
  return percentile(values, 0.5);
}

function percentile(values: readonly number[], fraction: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return sorted[index] ?? 0;
}

function roundRecord<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [
    key,
    typeof value === "number" && !Number.isInteger(value) ? Number(value.toFixed(3)) : value
  ])) as T;
}
