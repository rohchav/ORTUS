// Attributes simulation step time to kernel deep cloning. Run with `npm run perf:clone`.
// Output is a measurement for this machine, not a threshold.
//
// Two separate passes per scenario, both after warmup and never including engine construction:
// - msPerTick: median wall time per tick over several unprofiled blocks (range = fastest-slowest block).
// - deepCloneShare/gcShare/topCloneCallers: from a separate pass under the V8 sampling profiler. They
//   are shares of profiler samples, not wall-time savings: removing a clone does not save its share.
import { Session, type Profiler } from "node:inspector";
import { performance } from "node:perf_hooks";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterValues, SimulationTemplate } from "../kernel/types";
import { epidemicTemplate } from "../templates/epidemic.template";
import { flockingTemplate } from "../templates/flocking.template";
import { forestFireTemplate } from "../templates/forestFire.template";
import { neuralExcitationTemplate } from "../templates/neuralExcitation.template";
import { opinionTemplate } from "../templates/opinion.template";
import { predatorPreyTemplate } from "../templates/predatorPrey.template";
import { schellingTemplate } from "../templates/schelling.template";

interface CloneScenario {
  scale: "small" | "medium" | "upper";
  label: string;
  template: SimulationTemplate;
  parameters: ParameterValues;
  ticksPerBlock: number;
}

const warmupTicks = 10;
const timedBlocks = 5;
const samplingIntervalMicros = 100;

const scenarios: CloneScenario[] = [
  { scale: "small", label: "epidemic 80 agents", template: epidemicTemplate, parameters: {}, ticksPerBlock: 30 },
  { scale: "small", label: "flocking 160 agents", template: flockingTemplate, parameters: {}, ticksPerBlock: 30 },
  { scale: "small", label: "neural default", template: neuralExcitationTemplate, parameters: {}, ticksPerBlock: 30 },
  { scale: "medium", label: "opinion 300 agents", template: opinionTemplate, parameters: { agentCount: 300 }, ticksPerBlock: 20 },
  { scale: "medium", label: "schelling default", template: schellingTemplate, parameters: {}, ticksPerBlock: 20 },
  { scale: "medium", label: "forest-fire 60x40", template: forestFireTemplate, parameters: {}, ticksPerBlock: 20 },
  { scale: "upper", label: "flocking 500 agents", template: flockingTemplate, parameters: { agentCount: 500 }, ticksPerBlock: 10 },
  { scale: "upper", label: "epidemic 1000 agents", template: epidemicTemplate, parameters: { agentCount: 1000 }, ticksPerBlock: 6 },
  { scale: "upper", label: "predator-prey 1000 prey", template: predatorPreyTemplate, parameters: { initialPrey: 1000 }, ticksPerBlock: 6 },
  { scale: "upper", label: "forest-fire 160x120", template: forestFireTemplate, parameters: { gridWidth: 160, gridHeight: 120 }, ticksPerBlock: 6 }
];

const session = new Session();
session.connect();

const rows = [];
for (const scenario of scenarios) {
  rows.push(await measure(scenario));
}
session.disconnect();

console.table(rows);
console.info(
  [
    `msPerTick = median unprofiled wall time per tick over ${timedBlocks} blocks after ${warmupTicks} warmup ticks; range = fastest-slowest block.`,
    "deepCloneShare = profiler samples with deepClone on the stack / all samples, from a separate profiled pass; gcShare = garbage-collector samples / all samples.",
    "Top clone callers = function that called deepClone (and its caller), by share of samples. Sample shares are not wall-time savings."
  ].join("\n")
);

async function measure(scenario: CloneScenario) {
  const engine = new SimulationEngine(scenario.template, { seed: `clone-${scenario.label}`, parameters: scenario.parameters });
  engine.runSteps(warmupTicks);

  const blockMsPerTick: number[] = [];
  for (let block = 0; block < timedBlocks; block += 1) {
    const started = performance.now();
    engine.runSteps(scenario.ticksPerBlock);
    blockMsPerTick.push((performance.now() - started) / scenario.ticksPerBlock);
  }
  blockMsPerTick.sort((left, right) => left - right);

  await post("Profiler.enable");
  await post("Profiler.setSamplingInterval", { interval: samplingIntervalMicros });
  await post("Profiler.start");
  engine.runSteps(scenario.ticksPerBlock * 2);
  const { profile } = (await post("Profiler.stop")) as Profiler.StopReturnType;
  await post("Profiler.disable");
  const attribution = attribute(profile);

  return {
    scale: scenario.scale,
    scenario: scenario.label,
    entities: engine.world.entityStore.aliveCount(),
    msPerTick: round(blockMsPerTick[Math.floor(blockMsPerTick.length / 2)] ?? Number.NaN),
    range: `${round(blockMsPerTick[0] ?? Number.NaN)}-${round(blockMsPerTick.at(-1) ?? Number.NaN)}`,
    deepCloneShare: percent(attribution.cloneSamples, attribution.totalSamples),
    gcShare: percent(attribution.gcSamples, attribution.totalSamples),
    topCloneCallers: attribution.topCallers
      .slice(0, 3)
      .map(([caller, samples]) => `${caller} ${percent(samples, attribution.totalSamples)}`)
      .join("; ")
  };
}

function attribute(profile: Profiler.Profile) {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const parent = new Map<number, number>();
  for (const node of profile.nodes) {
    for (const child of node.children ?? []) {
      parent.set(child, node.id);
    }
  }
  const callers = new Map<string, number>();
  let cloneSamples = 0;
  let gcSamples = 0;
  const samples = profile.samples ?? [];
  for (const sample of samples) {
    const leaf = nodes.get(sample);
    if (leaf?.callFrame.functionName === "(garbage collector)") {
      gcSamples += 1;
    }
    // Find the outermost deepClone frame on this sample's stack and remember who called it.
    let cloneCaller: string | undefined;
    for (let id: number | undefined = sample; id !== undefined; id = parent.get(id)) {
      if (nodes.get(id)?.callFrame.functionName === "deepClone") {
        const callerId = parent.get(id);
        const grandCallerId = callerId === undefined ? undefined : parent.get(callerId);
        cloneCaller = callerId === undefined ? "(root)" : `${describe(nodes.get(callerId))} <- ${describe(nodes.get(grandCallerId ?? -1))}`;
      }
    }
    if (cloneCaller) {
      cloneSamples += 1;
      callers.set(cloneCaller, (callers.get(cloneCaller) ?? 0) + 1);
    }
  }
  return {
    totalSamples: samples.length,
    cloneSamples,
    gcSamples,
    topCallers: [...callers.entries()].sort((left, right) => right[1] - left[1])
  };
}

function describe(node: Profiler.ProfileNode | undefined): string {
  if (!node) {
    return "(unknown)";
  }
  const file = node.callFrame.url.split("/").pop() ?? "";
  return `${node.callFrame.functionName || "(anonymous)"}@${file}`;
}

function post(method: string, params?: object): Promise<unknown> {
  return new Promise((resolve, reject) => {
    session.post(method, params ?? {}, (error, result) => (error ? reject(error) : resolve(result)));
  });
}

function percent(part: number, whole: number): string {
  return whole === 0 ? "n/a" : `${((part / whole) * 100).toFixed(1)}%`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
