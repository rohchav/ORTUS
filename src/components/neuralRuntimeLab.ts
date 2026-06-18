import type { JsonValue, ParameterValues, SimulationSnapshotView } from "../simulation";
import { formatNumber } from "../lib/format";
import { renderNeuralDecisionReadout, type NeuralDecisionReadoutView } from "../lib/templateVisuals";

export const neuralRuntimeLabTemplateId = "neural-excitation-network";
export const neuralRuntimeLabTimelineLimit = 60;
export const neuralRuntimeLabRpsHistoryLimit = 40;

export const neuralRuntimeLabBoundaryCopy = [
  "This lab shows stylized neural excitation dynamics and bounded categorical readouts. It does not model cognition, biological neurons, or learning.",
  "Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation.",
  "Activation is a model variable, not measured membrane voltage.",
  "Synapse weights are abstract influence strengths, not biological synaptic measurements.",
  "The model does not simulate ion channels, neurotransmitters, morphology, learning, consciousness, or cognition.",
  "RPS payoff is observational in this version and does not update weights, biases, or future choices.",
  "Rock-Paper-Scissors labels are assigned to output assemblies by the model designer; the network does not understand the labels.",
  "This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable."
] as const;

export type NeuralLabScenarioId =
  | "cascade-spread"
  | "stabilize-runaway"
  | "synchronize-clusters"
  | "silence-hub"
  | "rps-readout-demo"
  | "stay-unpredictable";

export interface NeuralLabScenarioCard {
  id: NeuralLabScenarioId;
  title: string;
  objective: string;
  setupImpact: string;
  actionHint: string;
  parameterPatch: ParameterValues;
  disabledReason?: string;
}

export const neuralLabScenarioCards: readonly NeuralLabScenarioCard[] = [
  {
    id: "cascade-spread",
    title: "Watch a cascade spread",
    objective: "Start with a cascade-prone stylized network and observe whether a small pulse propagates beyond its local cluster.",
    setupImpact: "Apply setup regenerates a fresh tick-0 network with higher excitatory ratio, stronger abstract influence, and lower threshold.",
    actionHint: "Stimulate a random neuron or selected cluster, then watch cascade status move from local to spreading if the run supports it.",
    parameterPatch: {
      networkTopology: "clustered",
      connectionDensity: 0.16,
      excitatoryRatio: 0.88,
      averageSynapseWeight: 0.75,
      activationDecay: 0.12,
      globalThreshold: 0.85,
      externalStimulusRate: 0.02,
      initialActiveRatio: 0.05,
      decisionReadoutEnabled: false
    }
  },
  {
    id: "stabilize-runaway",
    title: "Stabilize runaway excitation",
    objective: "Compare spreading activity against stronger inhibition and faster decay without treating the output as clinical control.",
    setupImpact: "Apply setup regenerates a fresh tick-0 network with lower excitatory ratio, faster decay, and a higher threshold.",
    actionHint: "Use Increase Global Inhibition, then inspect whether saturation falls and signal queue growth slows.",
    parameterPatch: {
      networkTopology: "smallWorld",
      connectionDensity: 0.12,
      excitatoryRatio: 0.64,
      averageSynapseWeight: 0.42,
      activationDecay: 0.32,
      globalThreshold: 1.35,
      externalStimulusRate: 0.01,
      initialActiveRatio: 0.04,
      decisionReadoutEnabled: false
    }
  },
  {
    id: "synchronize-clusters",
    title: "Make two clusters synchronize",
    objective: "Use clustered topology and short bounded delays to watch same-tick firing concentration, not biological synchrony.",
    setupImpact: "Apply setup regenerates a fresh tick-0 clustered network with short delays and moderate thresholds.",
    actionHint: "Stimulate a selected cluster and compare synchrony score with cascade size.",
    parameterPatch: {
      networkTopology: "clustered",
      connectionDensity: 0.11,
      excitatoryRatio: 0.78,
      averageSynapseWeight: 0.62,
      activationDecay: 0.18,
      globalThreshold: 1,
      signalDelayMin: 1,
      signalDelayMax: 4,
      externalStimulusRate: 0.012,
      initialActiveRatio: 0.03,
      decisionReadoutEnabled: false
    }
  },
  {
    id: "silence-hub",
    title: "Break the network by removing/silencing a hub",
    objective: "V1 does not support selected-edge or hub removal. This card guides a supported cluster-silencing intervention only.",
    setupImpact: "Apply setup regenerates a fresh tick-0 clustered network. It does not add edge editing or hub deletion.",
    actionHint: "Select a visible node, then use Silence selected cluster. This is a template-scoped perturbation, not a clinical or biological claim.",
    parameterPatch: {
      networkTopology: "clustered",
      connectionDensity: 0.14,
      excitatoryRatio: 0.8,
      averageSynapseWeight: 0.58,
      activationDecay: 0.2,
      globalThreshold: 1,
      externalStimulusRate: 0.015,
      initialActiveRatio: 0.04,
      decisionReadoutEnabled: false
    }
  },
  {
    id: "rps-readout-demo",
    title: "Rock-Paper-Scissors Readout Demo",
    objective: "Enable designer-labeled Rock, Paper, and Scissors output assemblies and observe bounded readout/payoff.",
    setupImpact: "Apply setup regenerates a fresh tick-0 network with Decision Readout V1 enabled.",
    actionHint: "Stimulate an output assembly and step one tick to compute an observational payoff. Payoff does not update weights or future choices.",
    parameterPatch: {
      neuronCount: 60,
      networkTopology: "clustered",
      connectionDensity: 0.1,
      excitatoryRatio: 0.82,
      averageSynapseWeight: 0.55,
      globalThreshold: 0.9,
      activationDecay: 0.16,
      externalStimulusRate: 0,
      initialActiveRatio: 0,
      decisionReadoutEnabled: true,
      decisionThreshold: 0.75,
      decisionMargin: 0.15,
      decisionWindowTicks: 4,
      outputBias: 0,
      opponentChoiceMode: "fixed",
      fixedOpponentChoice: "rock"
    }
  },
  {
    id: "stay-unpredictable",
    title: "Stay unpredictable challenge shell",
    objective: "Show a non-learning RPS history and distribution shell. It records outcomes only; it does not adapt strategy.",
    setupImpact: "Apply setup regenerates a fresh tick-0 RPS readout run with seeded-random opponent choice and no learning.",
    actionHint: "Use assembly cues to create observed rounds. Distribution is a readout summary, not strategy, intent, or adaptation.",
    parameterPatch: {
      neuronCount: 60,
      networkTopology: "clustered",
      connectionDensity: 0.1,
      excitatoryRatio: 0.82,
      averageSynapseWeight: 0.55,
      globalThreshold: 0.9,
      activationDecay: 0.16,
      externalStimulusRate: 0,
      initialActiveRatio: 0,
      decisionReadoutEnabled: true,
      decisionThreshold: 0.75,
      decisionMargin: 0.15,
      decisionWindowTicks: 4,
      outputBias: 0,
      opponentChoiceMode: "seededRandom",
      fixedOpponentChoice: "rock"
    }
  }
] as const;

export type NeuralPlainControlId = "structure" | "excitationBalance" | "timing" | "noiseStimulus" | "decisionReadout";

export interface NeuralPlainEnglishControl {
  id: NeuralPlainControlId;
  label: string;
  helper: string;
  options: readonly NeuralPlainEnglishControlOption[];
}

export interface NeuralPlainEnglishControlOption {
  id: string;
  label: string;
  description: string;
  parameterPatch: ParameterValues;
}

export const neuralPlainEnglishControls: readonly NeuralPlainEnglishControl[] = [
  {
    id: "structure",
    label: "Network structure",
    helper: "Changes topology and size for a fresh generated network.",
    options: [
      {
        id: "compact-clustered",
        label: "Compact clusters",
        description: "60 clustered nodes with moderate density.",
        parameterPatch: { neuronCount: 60, networkTopology: "clustered", connectionDensity: 0.1 }
      },
      {
        id: "wide-small-world",
        label: "Wide small-world",
        description: "120 nodes with small-world shortcuts.",
        parameterPatch: { neuronCount: 120, networkTopology: "smallWorld", connectionDensity: 0.08 }
      },
      {
        id: "bounded-random",
        label: "Bounded random",
        description: "80 nodes with a sparse random directed graph.",
        parameterPatch: { neuronCount: 80, networkTopology: "random", connectionDensity: 0.07 }
      }
    ]
  },
  {
    id: "excitationBalance",
    label: "Excitation balance",
    helper: "Maps to excitatory ratio, threshold, average abstract weight, and decay.",
    options: [
      {
        id: "contained",
        label: "Contained",
        description: "More inhibition and decay; cascades are harder to sustain.",
        parameterPatch: { excitatoryRatio: 0.62, averageSynapseWeight: 0.4, activationDecay: 0.32, globalThreshold: 1.35 }
      },
      {
        id: "balanced",
        label: "Balanced",
        description: "Moderate excitation and threshold.",
        parameterPatch: { excitatoryRatio: 0.78, averageSynapseWeight: 0.55, activationDecay: 0.2, globalThreshold: 1 }
      },
      {
        id: "cascade-prone",
        label: "Cascade-prone",
        description: "Higher excitation and lower threshold; useful for observing spread.",
        parameterPatch: { excitatoryRatio: 0.9, averageSynapseWeight: 0.75, activationDecay: 0.12, globalThreshold: 0.8 }
      }
    ]
  },
  {
    id: "timing",
    label: "Timing",
    helper: "Maps to refractory ticks and bounded signal delay.",
    options: [
      {
        id: "fast",
        label: "Fast response",
        description: "Short delays and a short refractory period.",
        parameterPatch: { signalDelayMin: 1, signalDelayMax: 3, refractoryTicks: 2 }
      },
      {
        id: "mixed",
        label: "Mixed timing",
        description: "A middle setting for propagation and cooldown.",
        parameterPatch: { signalDelayMin: 1, signalDelayMax: 6, refractoryTicks: 3 }
      },
      {
        id: "slow",
        label: "Slow signals",
        description: "Longer signal delays and cooldown.",
        parameterPatch: { signalDelayMin: 3, signalDelayMax: 9, refractoryTicks: 5 }
      }
    ]
  },
  {
    id: "noiseStimulus",
    label: "Noise and external stimulus",
    helper: "Maps to seeded noise level and external stimulus rate.",
    options: [
      {
        id: "quiet",
        label: "Quiet",
        description: "No background noise and no external stimulus.",
        parameterPatch: { noiseLevel: 0, externalStimulusRate: 0 }
      },
      {
        id: "light",
        label: "Light",
        description: "Low seeded perturbation rate.",
        parameterPatch: { noiseLevel: 0.01, externalStimulusRate: 0.01 }
      },
      {
        id: "busy",
        label: "Busy",
        description: "More seeded background activity while staying bounded.",
        parameterPatch: { noiseLevel: 0.04, externalStimulusRate: 0.035 }
      }
    ]
  },
  {
    id: "decisionReadout",
    label: "Decision readout",
    helper: "Enables or disables designer-labeled output assemblies.",
    options: [
      {
        id: "off",
        label: "Off",
        description: "No RPS output assembly readout.",
        parameterPatch: { decisionReadoutEnabled: false, outputBias: 0 }
      },
      {
        id: "rps-balanced",
        label: "RPS balanced",
        description: "Enable bounded RPS readout with fixed opponent choice.",
        parameterPatch: { decisionReadoutEnabled: true, decisionThreshold: 0.75, decisionMargin: 0.15, outputBias: 0, opponentChoiceMode: "fixed" }
      },
      {
        id: "rps-random-opponent",
        label: "RPS seeded opponent",
        description: "Enable bounded RPS readout with seeded-random opponent choice.",
        parameterPatch: { decisionReadoutEnabled: true, decisionThreshold: 0.75, decisionMargin: 0.15, outputBias: 0, opponentChoiceMode: "seededRandom" }
      }
    ]
  }
] as const;

export interface NeuralLabMission {
  title: string;
  objective: string;
  statusRows: Array<{ label: string; value: string }>;
  tryNext: string[];
  rpsRows: Array<{ label: string; value: string }>;
  cascadeStatus: NeuralCascadeStatus;
}

export type NeuralCascadeStatus = "quiet" | "local" | "spreading" | "saturated";

export function createNeuralLabMission(snapshot: SimulationSnapshotView | null | undefined, scenario?: NeuralLabScenarioCard): NeuralLabMission {
  const cascadeStatus = classifyNeuralCascade(snapshot);
  const readout = renderNeuralDecisionReadout(snapshot);
  const firing = metricNumber(snapshot, "neuralFiringCount", "firingRate");
  const total = Math.max(1, snapshot?.entities.length ?? 1);
  const firingCount = metricNumber(snapshot, "neuralFiringCount", "activeNeuronCount");
  const refractory = metricNumber(snapshot, "neuralRefractoryCount", "refractoryCount");
  const queue = metricNumber(snapshot, "neuralSignalQueueSize", "signalQueueSize");
  const balance = metricNumber(snapshot, "neuralExcitationInhibitionBalance", "excitationInhibitionBalance");

  return {
    title: readout?.enabled ? "RPS readout mission" : "Neural cascade mission",
    objective: readout?.enabled
      ? "Observe output assembly activation to Rock/Paper/Scissors; selected readout, confidence, winner margin, and outcome remain bounded model outputs."
      : scenario?.objective ?? "Trigger a small cascade and observe whether inhibition contains it.",
    statusRows: [
      { label: "Firing neurons", value: `${formatNumber(firingCount, 0)} / ${formatNumber(total, 0)} (${formatNumber(firing, 3)})` },
      { label: "Refractory", value: formatNumber(refractory, 0) },
      { label: "Signal queue", value: formatNumber(queue, 0) },
      { label: "Excitation/inhibition balance", value: formatNumber(balance, 3) },
      { label: "Cascade status", value: cascadeStatus }
    ],
    tryNext: readout?.enabled
      ? ["Stimulate a Rock/Paper/Scissors assembly.", "Step one tick to compute the observational payoff.", "Compare confidence with winner margin."]
      : ["Stimulate a cluster.", "Raise inhibition.", "Lower threshold in Advanced config or apply a cascade-prone setup."],
    rpsRows: createRpsRows(readout),
    cascadeStatus
  };
}

export function createNeuralLiveExplanations(snapshot: SimulationSnapshotView | null | undefined): string[] {
  if (!snapshot || snapshot.templateId !== neuralRuntimeLabTemplateId) {
    return ["Select Neural Excitation Network to use the runtime lab."];
  }

  const explanations: string[] = [];
  const cascadeStatus = classifyNeuralCascade(snapshot);
  const firing = metricNumber(snapshot, "neuralFiringCount", "activeNeuronCount");
  const refractory = metricNumber(snapshot, "neuralRefractoryCount", "refractoryCount");
  const queue = metricNumber(snapshot, "neuralSignalQueueSize", "signalQueueSize");
  const saturation = metricNumber(snapshot, "neuralNetworkSaturation", "networkSaturation");
  const balance = metricNumber(snapshot, "neuralExcitationInhibitionBalance", "excitationInhibitionBalance");
  const inhibited = metricNumber(snapshot, "neuralInhibitedCount", "inhibitedCount");

  if (cascadeStatus === "saturated") {
    explanations.push("A saturation guard is visible: many nodes are firing or refractory, so treat this as bounded model-output saturation, not biological evidence.");
  } else if (cascadeStatus === "spreading") {
    explanations.push(`Cascade detected: recent firing and queue activity indicate propagation beyond a local pulse at tick ${snapshot.tick}.`);
  } else if (cascadeStatus === "local") {
    explanations.push("Activity is local: firing exists, but the bounded cascade metrics do not show broad propagation.");
  } else {
    explanations.push("The network is quiet or nearly quiet under the current threshold, stimulus, and decay settings.");
  }

  if (inhibited > 0 || balance < 0.45) {
    explanations.push("Inhibition is suppressing part of the run: inhibited nodes or low excitation balance are reducing stylized activation.");
  }
  if (queue > 0) {
    explanations.push(`Delayed signal queue has ${formatNumber(queue, 0)} entries; future ticks may change firing without any hidden external data.`);
  }
  if (refractory > 0 && firing === 0) {
    explanations.push("Recent firing is cooling down in the refractory state, so the next few ticks may show suppressed firing.");
  }
  if (saturation > 0.5 && balance > 0.65) {
    explanations.push("High saturation with excitation-heavy balance is a runaway-excitation warning inside this stylized template.");
  }

  const readout = renderNeuralDecisionReadout(snapshot);
  if (readout?.enabled) {
    if (readout.selected === "conflicted") {
      explanations.push("RPS readout is conflicted because the top labeled assemblies are too close under the configured winner margin.");
    } else if (readout.selected === "undecided") {
      explanations.push("RPS readout is undecided because no labeled output assembly clears the configured threshold and margin.");
    } else {
      explanations.push(
        `RPS readout selected ${titleCase(readout.selected)} because that labeled output assembly currently has the strongest bounded activation.`
      );
    }
    explanations.push("RPS payoff is observational in this version and does not update weights, biases, or future choices.");
  }

  return explanations.slice(0, 6);
}

export type NeuralTimelineEventKind =
  | "scenario"
  | "network"
  | "run"
  | "intervention"
  | "cascade"
  | "saturation"
  | "containment"
  | "readout"
  | "rps";

export interface NeuralTimelineEvent {
  id: string;
  tick: number;
  kind: NeuralTimelineEventKind;
  label: string;
  detail: string;
}

export function boundNeuralTimelineEvents(events: readonly NeuralTimelineEvent[], limit = neuralRuntimeLabTimelineLimit): NeuralTimelineEvent[] {
  return events.slice(-limit);
}

export function deriveNeuralRuntimeEvents(
  previous: SimulationSnapshotView | null | undefined,
  next: SimulationSnapshotView | null | undefined
): NeuralTimelineEvent[] {
  if (!next || next.templateId !== neuralRuntimeLabTemplateId) {
    return [];
  }
  const events: NeuralTimelineEvent[] = [];
  const previousStatus = classifyNeuralCascade(previous);
  const nextStatus = classifyNeuralCascade(next);
  const idPrefix = `tick-${next.tick}`;

  if (previous && previous.tick > next.tick) {
    events.push({
      id: `${idPrefix}-network-regenerated`,
      tick: next.tick,
      kind: "network",
      label: "Network regenerated",
      detail: "Fresh tick-0 Neural run created through template validation."
    });
  }
  if (!previous && next.tick === 0) {
    events.push({
      id: `${idPrefix}-network-ready`,
      tick: next.tick,
      kind: "network",
      label: "Network ready",
      detail: "Template-owned runtime graph initialized; Builder graphs remain non-executable."
    });
  }
  if (previousStatus !== nextStatus && nextStatus !== "quiet") {
    events.push({
      id: `${idPrefix}-cascade-${nextStatus}`,
      tick: next.tick,
      kind: nextStatus === "saturated" ? "saturation" : "cascade",
      label: nextStatus === "saturated" ? "Saturation warning" : "Cascade status changed",
      detail: `Cascade status is now ${nextStatus}.`
    });
  }
  if ((previousStatus === "spreading" || previousStatus === "saturated") && (nextStatus === "quiet" || nextStatus === "local")) {
    events.push({
      id: `${idPrefix}-contained`,
      tick: next.tick,
      kind: "containment",
      label: "Activity contained",
      detail: "Cascade metrics fell back to local or quiet output."
    });
  }

  const previousReadout = renderNeuralDecisionReadout(previous);
  const nextReadout = renderNeuralDecisionReadout(next);
  if (nextReadout?.enabled && previousReadout?.selected !== nextReadout.selected) {
    events.push({
      id: `${idPrefix}-readout-${nextReadout.selected}`,
      tick: next.tick,
      kind: "readout",
      label: "Readout changed",
      detail: `Selected readout is ${titleCase(nextReadout.selected)}; this is bounded categorical output, not understanding.`
    });
  }
  if (nextReadout?.rps?.enabled && nextReadout.rps.outcome !== "none" && previousReadout?.rps?.outcome !== nextReadout.rps.outcome) {
    events.push({
      id: `${idPrefix}-rps-${nextReadout.rps.outcome}`,
      tick: next.tick,
      kind: "rps",
      label: "RPS payoff computed",
      detail: `${titleCase(nextReadout.rps.outcome)} / ${formatNumber(nextReadout.rps.payoff, 0)}. Payoff is observational and non-adaptive.`
    });
  }
  return events;
}

export type NeuralDirectActionId =
  | "stimulate-random"
  | "raise-inhibition"
  | "stimulate-selected-neuron"
  | "stimulate-selected-cluster"
  | "silence-selected-cluster"
  | "stimulate-rock"
  | "stimulate-paper"
  | "stimulate-scissors"
  | "toggle-external-stimulus"
  | "reset-activity"
  | "regenerate-network"
  | "show-advanced-config";

export interface NeuralDirectAction {
  id: NeuralDirectActionId;
  label: string;
  description: string;
  interventionId?: string;
  requiresSelection?: boolean;
  requiresReadout?: boolean;
}

export const neuralDirectActions: readonly NeuralDirectAction[] = [
  {
    id: "stimulate-random",
    label: "Stimulate random neuron",
    description: "Seeded bounded pulse to one stylized neuron.",
    interventionId: "neural.stimulateRandomNeuron"
  },
  {
    id: "raise-inhibition",
    label: "Raise inhibition",
    description: "Increase the future inhibitory signal multiplier inside this template.",
    interventionId: "neural.increaseGlobalInhibition"
  },
  {
    id: "stimulate-selected-neuron",
    label: "Stimulate selected neuron",
    description: "Bounded pulse to the selected stylized neuron node.",
    interventionId: "neural.stimulateSelectedNeuron",
    requiresSelection: true
  },
  {
    id: "stimulate-selected-cluster",
    label: "Stimulate selected cluster",
    description: "Bounded pulse to nodes sharing the selected cluster label.",
    interventionId: "neural.stimulateSelectedCluster",
    requiresSelection: true
  },
  {
    id: "silence-selected-cluster",
    label: "Silence selected cluster",
    description: "Supported safe proxy for the hub-removal scenario; no edge deletion is implemented.",
    interventionId: "neural.silenceSelectedCluster",
    requiresSelection: true
  },
  {
    id: "stimulate-rock",
    label: "Stimulate Rock assembly",
    description: "Bounded pulse to the designer-labeled Rock output assembly.",
    interventionId: "neural.stimulateRockAssembly",
    requiresReadout: true
  },
  {
    id: "stimulate-paper",
    label: "Stimulate Paper assembly",
    description: "Bounded pulse to the designer-labeled Paper output assembly.",
    interventionId: "neural.stimulatePaperAssembly",
    requiresReadout: true
  },
  {
    id: "stimulate-scissors",
    label: "Stimulate Scissors assembly",
    description: "Bounded pulse to the designer-labeled Scissors output assembly.",
    interventionId: "neural.stimulateScissorsAssembly",
    requiresReadout: true
  },
  {
    id: "toggle-external-stimulus",
    label: "Toggle external stimulus",
    description: "Toggles the template-owned seeded stimulus source.",
    interventionId: "neural.toggleExternalStimulus"
  },
  {
    id: "reset-activity",
    label: "Reset activity",
    description: "Rebuilds the current Neural setup at tick 0 with the same seed and parameters."
  },
  {
    id: "regenerate-network",
    label: "Regenerate network",
    description: "Creates a new seed and fresh validated Neural network."
  },
  {
    id: "show-advanced-config",
    label: "Show advanced config",
    description: "Opens exact numeric Neural parameters for expert setup."
  }
] as const;

export interface NeuralRpsRound {
  id: string;
  tick: number;
  userChoice: "rock" | "paper" | "scissors";
  networkChoice: string;
  opponentChoice: string;
  outcome: string;
  payoff: number;
  confidence: number;
}

export function createNeuralRpsRound(snapshot: SimulationSnapshotView, userChoice: "rock" | "paper" | "scissors"): NeuralRpsRound | null {
  const readout = renderNeuralDecisionReadout(snapshot);
  if (!readout?.enabled || !readout.rps || readout.rps.outcome === "none") {
    return null;
  }
  return {
    id: `rps-${snapshot.tick}-${userChoice}-${readout.rps.outcome}`,
    tick: snapshot.tick,
    userChoice,
    networkChoice: readout.rps.networkChoice,
    opponentChoice: readout.rps.opponentChoice,
    outcome: readout.rps.outcome,
    payoff: readout.rps.payoff,
    confidence: readout.confidence
  };
}

export function boundNeuralRpsRounds(rounds: readonly NeuralRpsRound[]): NeuralRpsRound[] {
  return rounds.slice(-neuralRuntimeLabRpsHistoryLimit);
}

export function neuralRpsDistribution(rounds: readonly NeuralRpsRound[]): Array<{ choice: string; count: number }> {
  const counts = new Map<string, number>([
    ["rock", 0],
    ["paper", 0],
    ["scissors", 0],
    ["undecided", 0],
    ["conflicted", 0]
  ]);
  for (const round of rounds) {
    counts.set(round.networkChoice, (counts.get(round.networkChoice) ?? 0) + 1);
  }
  return [...counts].map(([choice, count]) => ({ choice, count }));
}

export function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function createRpsRows(readout: NeuralDecisionReadoutView | undefined): Array<{ label: string; value: string }> {
  if (!readout?.enabled) {
    return [];
  }
  return [
    { label: "Selected readout", value: titleCase(readout.selected) },
    { label: "Confidence", value: formatNumber(readout.confidence, 3) },
    { label: "Winner margin", value: formatNumber(readout.winnerMargin, 3) },
    { label: "Outcome", value: readout.rps ? `${titleCase(readout.rps.outcome)} / ${formatNumber(readout.rps.payoff, 0)}` : "None / 0" },
    { label: "Payoff boundary", value: "RPS payoff is observational in this version and does not update weights, biases, or future choices." }
  ];
}

function classifyNeuralCascade(snapshot: SimulationSnapshotView | null | undefined): NeuralCascadeStatus {
  if (!snapshot || snapshot.templateId !== neuralRuntimeLabTemplateId) {
    return "quiet";
  }
  const cascade = metricNumber(snapshot, "neuralCascadeSize", "cascadeSize");
  const queue = metricNumber(snapshot, "neuralSignalQueueSize", "signalQueueSize");
  const firing = metricNumber(snapshot, "neuralFiringCount", "activeNeuronCount");
  const saturation = metricNumber(snapshot, "neuralNetworkSaturation", "networkSaturation");
  const total = Math.max(1, snapshot.entities.length);
  if (saturation >= 0.55 || firing / total >= 0.35) {
    return "saturated";
  }
  if (cascade >= Math.max(8, total * 0.16) || queue >= Math.max(20, total * 0.5)) {
    return "spreading";
  }
  if (cascade > 0 || firing > 0 || queue > 0) {
    return "local";
  }
  return "quiet";
}

function metricNumber(snapshot: SimulationSnapshotView | null | undefined, globalKey: string, metricKey: string): number {
  if (!snapshot) {
    return 0;
  }
  const fromGlobal = numberValue(snapshot.globals[globalKey]);
  if (fromGlobal !== undefined) {
    return fromGlobal;
  }
  const lastMetric = snapshot.metricsHistory[snapshot.metricsHistory.length - 1]?.values[metricKey];
  return numberValue(lastMetric) ?? 0;
}

function numberValue(value: JsonValue | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
