import type { JsonValue, ParameterValues, SimulationSnapshotView } from "../simulation";
import { formatNumber } from "../lib/format";
import { renderNeuralDecisionReadout, type NeuralDecisionReadoutView } from "../lib/templateVisuals";

export const neuralRuntimeLabTemplateId = "neural-excitation-network";
export const neuralRuntimeLabTimelineLimit = 60;
export const neuralRuntimeLabRpsHistoryLimit = 200;

export type NeuralRpsChoice = "rock" | "paper" | "scissors";
export type NeuralRpsReadoutChoice = NeuralRpsChoice | "undecided" | "conflicted";
export type NeuralRpsOutcome = "win" | "loss" | "draw" | "none";

export const neuralRpsChoices = ["rock", "paper", "scissors"] as const satisfies readonly NeuralRpsChoice[];

export const neuralRuntimeLabBoundaryCopy = [
  "This lab shows stylized neural excitation dynamics and bounded categorical readouts. It does not model cognition, biological neurons, or learning.",
  "Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation.",
  "Activation is a model variable, not measured membrane voltage.",
  "Synapse weights are abstract influence strengths, not biological synaptic measurements.",
  "The model does not simulate ion channels, neurotransmitters, morphology, learning, consciousness, or cognition.",
  "Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference.",
  "The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time.",
  "Learned strategy state is local model state, not a psychological profile.",
  "Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning.",
  "Adaptation adjusts bounded readout bias. It does not rewrite the neural graph or simulate biological synaptic learning.",
  "Rock-Paper-Scissors labels are assigned to output assemblies by the model designer; the network does not understand the labels.",
  "This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable."
] as const;

export const neuralStrategyAdaptationMetricsBoundary =
  "Adaptation metrics describe local game-state updates, not beliefs, intentions, or personality.";

export const neuralStrategyRandomPlayBoundary =
  "Against truly random play, Rock-Paper-Scissors has no exploitable pattern. The adaptive readout should not be expected to win above chance over time.";

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
    title: "Adaptive RPS Challenge",
    objective: "Try to keep the network win rate below 40% over the last 30 non-draw rounds while the lab tracks bounded local pattern statistics.",
    setupImpact: "Apply setup regenerates a fresh tick-0 RPS readout run. Local strategy state is visible and resettable; it is not cleared unless Reset learned strategy is used.",
    actionHint: "Choose Rock, Paper, or Scissors each round. Repeated patterns can shift bounded readout bias; random optimal play has no exploitable pattern.",
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

export type NeuralStrategyAdaptationPlainControlId = "learningSpeed" | "exploration" | "memoryLength" | "adaptationStrength";

export interface NeuralStrategyAdaptationPlainControl {
  id: NeuralStrategyAdaptationPlainControlId;
  label: string;
  helper: string;
  options: readonly NeuralStrategyAdaptationPlainControlOption[];
}

export interface NeuralStrategyAdaptationPlainControlOption {
  id: string;
  label: string;
  description: string;
  configPatch: Partial<NeuralStrategyAdaptationConfig>;
}

export interface NeuralStrategyAdaptationConfig {
  enabled: boolean;
  learningRate: number;
  explorationRate: number;
  historyWindow: number;
  patternWindow: number;
  maxBiasMagnitude: number;
  decayRate: number;
  minPatternConfidence: number;
}

export interface NeuralStrategyAdaptationState {
  enabled: boolean;
  roundCount: number;
  choiceBias: Record<NeuralRpsChoice, number>;
  opponentChoiceCounts: Record<NeuralRpsChoice, number>;
  networkChoiceCounts: Record<NeuralRpsChoice, number>;
  transitionCounts: Record<NeuralRpsChoice, Record<NeuralRpsChoice, number>>;
  predictedOpponentChoice: NeuralRpsChoice | "unknown";
  predictedCounterChoice: NeuralRpsChoice | "unknown";
  patternConfidence: number;
  explorationRate: number;
  rollingWinRate: number;
  rollingDrawRate: number;
  rollingLossRate: number;
  rollingNonDrawWinRate: number;
  strategyEntropy: number;
  transitionStability: number;
  lastUpdatedRound?: number;
  lastExplorationActive: boolean;
  lastUpdateSummary: string;
}

export interface NeuralAdaptiveCuePlan {
  cueChoice: NeuralRpsChoice;
  strength: number;
  explorationActive: boolean;
  reason: string;
}

export const neuralStrategyAdaptationConfigBounds = {
  learningRate: { min: 0, max: 0.5, step: 0.01 },
  explorationRate: { min: 0, max: 0.5, step: 0.01 },
  historyWindow: { min: 5, max: 200, step: 1 },
  patternWindow: { min: 3, max: 50, step: 1 },
  maxBiasMagnitude: { min: 0, max: 2, step: 0.05 },
  decayRate: { min: 0, max: 0.5, step: 0.01 },
  minPatternConfidence: { min: 0, max: 1, step: 0.01 }
} as const;

export const defaultNeuralStrategyAdaptationConfig: NeuralStrategyAdaptationConfig = {
  enabled: true,
  learningRate: 0.18,
  explorationRate: 0.08,
  historyWindow: 80,
  patternWindow: 20,
  maxBiasMagnitude: 1.25,
  decayRate: 0.08,
  minPatternConfidence: 0.34
};

export const neuralStrategyAdaptationPlainControls: readonly NeuralStrategyAdaptationPlainControl[] = [
  {
    id: "learningSpeed",
    label: "Learning speed",
    helper: "Maps to the local bias update rate.",
    options: [
      { id: "off", label: "Off", description: "No adaptive bias update.", configPatch: { learningRate: 0, enabled: false } },
      { id: "slow", label: "Slow", description: "Small updates from repeated patterns.", configPatch: { learningRate: 0.08, enabled: true } },
      { id: "balanced", label: "Balanced", description: "Moderate updates for visible adaptation.", configPatch: { learningRate: 0.18, enabled: true } },
      { id: "fast", label: "Fast", description: "Faster local bias shifts while staying bounded.", configPatch: { learningRate: 0.32, enabled: true } }
    ]
  },
  {
    id: "exploration",
    label: "Exploration",
    helper: "Deterministically ignores the strongest counter-bias on some rounds.",
    options: [
      { id: "none", label: "None", description: "Always use the current counter-bias when confidence is high enough.", configPatch: { explorationRate: 0 } },
      { id: "low", label: "Low", description: "Occasional deterministic exploration.", configPatch: { explorationRate: 0.05 } },
      { id: "balanced", label: "Balanced", description: "Moderate deterministic exploration.", configPatch: { explorationRate: 0.12 } },
      { id: "high", label: "High", description: "Frequent deterministic exploration.", configPatch: { explorationRate: 0.28 } }
    ]
  },
  {
    id: "memoryLength",
    label: "Memory length",
    helper: "Controls the bounded local round window.",
    options: [
      { id: "short", label: "Short", description: "Recent rounds dominate.", configPatch: { historyWindow: 20, patternWindow: 8 } },
      { id: "medium", label: "Medium", description: "Balanced recent history.", configPatch: { historyWindow: 80, patternWindow: 20 } },
      { id: "long", label: "Long", description: "Use more local rounds, capped at 200.", configPatch: { historyWindow: 160, patternWindow: 40 } }
    ]
  },
  {
    id: "adaptationStrength",
    label: "Adaptation strength",
    helper: "Caps the output-assembly stimulus bias.",
    options: [
      { id: "subtle", label: "Subtle", description: "Small maximum readout bias.", configPatch: { maxBiasMagnitude: 0.5, decayRate: 0.12 } },
      { id: "balanced", label: "Balanced", description: "Moderate readout bias.", configPatch: { maxBiasMagnitude: 1.25, decayRate: 0.08 } },
      { id: "strong", label: "Strong", description: "Larger but still bounded readout bias.", configPatch: { maxBiasMagnitude: 2, decayRate: 0.04 } }
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

export function createNeuralLabMission(
  snapshot: SimulationSnapshotView | null | undefined,
  scenario?: NeuralLabScenarioCard,
  adaptation?: NeuralStrategyAdaptationState
): NeuralLabMission {
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
      ? [
          "Choose Rock, Paper, or Scissors for the next local round.",
          "Compare adaptive play against a non-adaptive observational baseline.",
          neuralStrategyRandomPlayBoundary
        ]
      : ["Stimulate a cluster.", "Raise inhibition.", "Lower threshold in Advanced config or apply a cascade-prone setup."],
    rpsRows: createRpsRows(readout, adaptation),
    cascadeStatus
  };
}

export function createNeuralLiveExplanations(
  snapshot: SimulationSnapshotView | null | undefined,
  adaptation?: NeuralStrategyAdaptationState
): string[] {
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
    explanations.push(adaptationExplanation(adaptation));
    if (adaptation?.roundCount && adaptation.enabled && adaptation.patternConfidence > 0) {
      explanations.push("Bias decay applied so older patterns matter less over time.");
    }
    if (adaptation?.lastExplorationActive) {
      explanations.push("Exploration active: the network did not fully follow the strongest counter-bias this round.");
    }
    explanations.push("This is game-state adaptation, not cognition or human intention inference.");
  }

  return explanations.slice(0, 8);
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
  | "rps"
  | "adaptation";

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
      detail: `${titleCase(nextReadout.rps.outcome)} / ${formatNumber(nextReadout.rps.payoff, 0)}. Template payoff stays separate from learned strategy state.`
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
  roundIndex: number;
  tick: number;
  userChoice: NeuralRpsChoice;
  networkChoice: NeuralRpsReadoutChoice;
  opponentChoice: NeuralRpsChoice;
  outcome: NeuralRpsOutcome;
  payoff: number;
  readoutConfidence: number;
  winnerMargin: number;
  confidence: number;
  explorationActive?: boolean;
}

export function createNeuralRpsRound(
  snapshot: SimulationSnapshotView,
  userChoice: NeuralRpsChoice,
  roundIndex = 1,
  explorationActive = false
): NeuralRpsRound | null {
  if (!isRpsChoice(userChoice)) {
    return null;
  }
  const readout = renderNeuralDecisionReadout(snapshot);
  if (!readout?.enabled) {
    return null;
  }
  const networkChoice = normalizeReadoutChoice(readout.selected);
  const outcome = scoreRpsOutcome(networkChoice, userChoice);
  const payoff = rpsPayoff(outcome);
  return {
    id: `rps-${roundIndex}-${snapshot.tick}-${userChoice}-${networkChoice}-${outcome}`,
    roundIndex,
    tick: snapshot.tick,
    userChoice,
    networkChoice,
    opponentChoice: userChoice,
    outcome,
    payoff,
    readoutConfidence: readout.confidence,
    winnerMargin: readout.winnerMargin,
    confidence: readout.confidence,
    explorationActive
  };
}

export function boundNeuralRpsRounds(rounds: readonly NeuralRpsRound[], limit = neuralRuntimeLabRpsHistoryLimit): NeuralRpsRound[] {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, neuralRuntimeLabRpsHistoryLimit) : neuralRuntimeLabRpsHistoryLimit;
  return rounds.filter(isValidNeuralRpsRound).slice(-safeLimit);
}

export function nextNeuralRpsRoundIndex(rounds: readonly NeuralRpsRound[]): number {
  const latest = rounds.reduce((max, round) => (Number.isInteger(round.roundIndex) && round.roundIndex > max ? round.roundIndex : max), 0);
  return latest + 1;
}

export function roundsAfterNeuralStrategyReset(
  rounds: readonly NeuralRpsRound[],
  resetAfterRoundIndex: number
): NeuralRpsRound[] {
  const safeResetIndex = Number.isFinite(resetAfterRoundIndex) ? Math.max(0, Math.floor(resetAfterRoundIndex)) : 0;
  return boundNeuralRpsRounds(rounds).filter((round) => round.roundIndex > safeResetIndex);
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
    if (isRpsReadoutChoice(round.networkChoice)) {
      counts.set(round.networkChoice, (counts.get(round.networkChoice) ?? 0) + 1);
    }
  }
  return [...counts].map(([choice, count]) => ({ choice, count }));
}

export function validateNeuralStrategyAdaptationConfig(config: NeuralStrategyAdaptationConfig): NeuralStrategyAdaptationConfig {
  if (typeof config.enabled !== "boolean") {
    throw new Error("Strategy adaptation enabled must be boolean");
  }
  validateBoundedNumber(config.learningRate, "learningRate", neuralStrategyAdaptationConfigBounds.learningRate);
  validateBoundedNumber(config.explorationRate, "explorationRate", neuralStrategyAdaptationConfigBounds.explorationRate);
  validateBoundedInteger(config.historyWindow, "historyWindow", neuralStrategyAdaptationConfigBounds.historyWindow);
  validateBoundedInteger(config.patternWindow, "patternWindow", neuralStrategyAdaptationConfigBounds.patternWindow);
  validateBoundedNumber(config.maxBiasMagnitude, "maxBiasMagnitude", neuralStrategyAdaptationConfigBounds.maxBiasMagnitude);
  validateBoundedNumber(config.decayRate, "decayRate", neuralStrategyAdaptationConfigBounds.decayRate);
  validateBoundedNumber(config.minPatternConfidence, "minPatternConfidence", neuralStrategyAdaptationConfigBounds.minPatternConfidence);
  if (config.patternWindow > config.historyWindow) {
    throw new Error("patternWindow must be less than or equal to historyWindow");
  }
  return { ...config };
}

export function createNeuralStrategyAdaptationConfig(
  patch: Partial<NeuralStrategyAdaptationConfig> = {},
  base: NeuralStrategyAdaptationConfig = defaultNeuralStrategyAdaptationConfig
): NeuralStrategyAdaptationConfig {
  return validateNeuralStrategyAdaptationConfig({ ...base, ...patch });
}

export function createInitialNeuralStrategyAdaptationState(
  config: NeuralStrategyAdaptationConfig = defaultNeuralStrategyAdaptationConfig
): NeuralStrategyAdaptationState {
  const valid = validateNeuralStrategyAdaptationConfig(config);
  return {
    enabled: valid.enabled,
    roundCount: 0,
    choiceBias: emptyChoiceRecord(),
    opponentChoiceCounts: emptyChoiceRecord(),
    networkChoiceCounts: emptyChoiceRecord(),
    transitionCounts: emptyTransitionCounts(),
    predictedOpponentChoice: "unknown",
    predictedCounterChoice: "unknown",
    patternConfidence: 0,
    explorationRate: valid.explorationRate,
    rollingWinRate: 0,
    rollingDrawRate: 0,
    rollingLossRate: 0,
    rollingNonDrawWinRate: 0,
    strategyEntropy: 0,
    transitionStability: 0,
    lastExplorationActive: false,
    lastUpdateSummary: valid.enabled
      ? "No adaptation update: no RPS rounds recorded yet."
      : "No adaptation update: adaptation is disabled."
  };
}

export function updateNeuralStrategyAdaptation(
  rounds: readonly NeuralRpsRound[],
  config: NeuralStrategyAdaptationConfig = defaultNeuralStrategyAdaptationConfig
): NeuralStrategyAdaptationState {
  const valid = validateNeuralStrategyAdaptationConfig(config);
  const boundedRounds = boundNeuralRpsRounds(rounds, valid.historyWindow);
  const counts = countOpponentChoices(boundedRounds);
  const networkCounts = countNetworkChoices(boundedRounds);
  const transitionCounts = countTransitions(boundedRounds.slice(-valid.patternWindow));
  const prediction = computePatternPrediction(boundedRounds, valid);
  const rolling = computeRollingRates(boundedRounds);
  const bias = valid.enabled ? computeChoiceBias(boundedRounds, valid) : emptyChoiceRecord();
  const activePrediction =
    valid.enabled && prediction.confidence >= valid.minPatternConfidence && prediction.predictedOpponentChoice !== "unknown"
      ? prediction
      : { predictedOpponentChoice: "unknown" as const, predictedCounterChoice: "unknown" as const, confidence: 0, transitionStability: prediction.transitionStability };
  const lastRound = boundedRounds[boundedRounds.length - 1];
  return {
    enabled: valid.enabled,
    roundCount: boundedRounds.length,
    choiceBias: bias,
    opponentChoiceCounts: counts,
    networkChoiceCounts: networkCounts,
    transitionCounts,
    predictedOpponentChoice: activePrediction.predictedOpponentChoice,
    predictedCounterChoice: activePrediction.predictedCounterChoice,
    patternConfidence: clamp(activePrediction.confidence, 0, 1),
    explorationRate: valid.explorationRate,
    rollingWinRate: rolling.win,
    rollingDrawRate: rolling.draw,
    rollingLossRate: rolling.loss,
    rollingNonDrawWinRate: rolling.nonDrawWin,
    strategyEntropy: computeChoiceEntropy(counts),
    transitionStability: clamp(activePrediction.transitionStability, 0, 1),
    ...(lastRound ? { lastUpdatedRound: lastRound.roundIndex } : {}),
    lastExplorationActive: Boolean(lastRound?.explorationActive),
    lastUpdateSummary: formatAdaptationUpdateSummary(activePrediction.predictedOpponentChoice, activePrediction.predictedCounterChoice, valid.enabled)
  };
}

export function resetNeuralStrategyAdaptation(
  config: NeuralStrategyAdaptationConfig = defaultNeuralStrategyAdaptationConfig
): NeuralStrategyAdaptationState {
  return createInitialNeuralStrategyAdaptationState(config);
}

export function clearNeuralRpsHistory(): NeuralRpsRound[] {
  return [];
}

export function rpsCounterChoice(choice: NeuralRpsChoice): NeuralRpsChoice {
  if (choice === "rock") {
    return "paper";
  }
  if (choice === "paper") {
    return "scissors";
  }
  return "rock";
}

export function chooseNeuralAdaptiveCue(
  userChoice: NeuralRpsChoice,
  state: NeuralStrategyAdaptationState,
  config: NeuralStrategyAdaptationConfig,
  seed: string,
  roundIndex: number
): NeuralAdaptiveCuePlan {
  if (!isRpsChoice(userChoice)) {
    throw new Error("Invalid RPS choice for adaptive cue");
  }
  const valid = validateNeuralStrategyAdaptationConfig(config);
  if (!valid.enabled || !state.enabled || state.predictedCounterChoice === "unknown" || state.patternConfidence < valid.minPatternConfidence) {
    return {
      cueChoice: userChoice,
      strength: 2,
      explorationActive: false,
      reason: "No stable pattern detected; local round uses the selected assembly as an observational baseline."
    };
  }
  const explorationActive = deterministicExploration(seed, roundIndex, valid.explorationRate);
  const cueChoice = explorationActive ? deterministicExplorationChoice(userChoice, seed, roundIndex) : state.predictedCounterChoice;
  const biasMagnitude = Math.max(0, state.choiceBias[cueChoice] ?? 0);
  return {
    cueChoice,
    strength: clamp(2 + biasMagnitude, 0.1, 5),
    explorationActive,
    reason: explorationActive
      ? "Exploration active: the strongest counter-bias is ignored for this round."
      : `Recent rounds suggest ${titleCase(state.predictedOpponentChoice)} is more likely; cueing ${titleCase(cueChoice)} as the counter-choice.`
  };
}

export function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function createRpsRows(
  readout: NeuralDecisionReadoutView | undefined,
  adaptation?: NeuralStrategyAdaptationState
): Array<{ label: string; value: string }> {
  if (!readout?.enabled) {
    return [];
  }
  const rows = [
    { label: "Selected readout", value: titleCase(readout.selected) },
    { label: "Confidence", value: formatNumber(readout.confidence, 3) },
    { label: "Winner margin", value: formatNumber(readout.winnerMargin, 3) },
    { label: "Outcome", value: readout.rps ? `${titleCase(readout.rps.outcome)} / ${formatNumber(readout.rps.payoff, 0)}` : "None / 0" },
    { label: "Payoff boundary", value: "Template RPS payoff does not update core synapse weights or biological plasticity fields." }
  ];
  if (!adaptation) {
    return rows;
  }
  return [
    ...rows,
    { label: "Challenge mode", value: adaptation.enabled ? "Adaptive" : "Observational" },
    { label: "Rounds recorded", value: formatNumber(adaptation.roundCount, 0) },
    { label: "Rolling network win/draw/loss", value: `${percent(adaptation.rollingWinRate)} / ${percent(adaptation.rollingDrawRate)} / ${percent(adaptation.rollingLossRate)}` },
    {
      label: "Pattern status",
      value: adaptation.predictedOpponentChoice === "unknown" ? "No stable pattern detected." : "Repeated choice pattern detected in recent rounds."
    },
    {
      label: "Recent rounds suggest",
      value: adaptation.predictedOpponentChoice === "unknown" ? "Unknown" : titleCase(adaptation.predictedOpponentChoice)
    },
    {
      label: "Predicted counter-choice",
      value: adaptation.predictedCounterChoice === "unknown" ? "Unknown" : titleCase(adaptation.predictedCounterChoice)
    },
    { label: "Pattern confidence", value: formatNumber(adaptation.patternConfidence, 3) },
    { label: "Exploration rate", value: percent(adaptation.explorationRate) },
    { label: "Readout bias", value: formatBiasSummary(adaptation.choiceBias) },
    { label: "Strategy-state caveat", value: "Local strategy state only." },
    { label: "Metric boundary", value: neuralStrategyAdaptationMetricsBoundary }
  ];
}

function adaptationExplanation(adaptation: NeuralStrategyAdaptationState | undefined): string {
  if (!adaptation) {
    return "No adaptation update: local strategy state is not initialized.";
  }
  if (!adaptation.enabled) {
    return "No adaptation update: adaptation is off and the RPS shell remains observational.";
  }
  if (adaptation.roundCount === 0 || adaptation.predictedOpponentChoice === "unknown" || adaptation.predictedCounterChoice === "unknown") {
    return "No adaptation update: the latest round was conflicted or no stable pattern was detected.";
  }
  return `Adaptation update: recent rounds favored ${titleCase(adaptation.predictedOpponentChoice)}, so the readout bias shifted toward ${titleCase(
    adaptation.predictedCounterChoice
  )}.`;
}

function validateBoundedNumber(value: number, key: string, bounds: { min: number; max: number }): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < bounds.min || value > bounds.max) {
    throw new Error(`${key} must be between ${bounds.min} and ${bounds.max}`);
  }
}

function validateBoundedInteger(value: number, key: string, bounds: { min: number; max: number }): void {
  if (!Number.isInteger(value) || value < bounds.min || value > bounds.max) {
    throw new Error(`${key} must be an integer between ${bounds.min} and ${bounds.max}`);
  }
}

function normalizeReadoutChoice(value: string): NeuralRpsReadoutChoice {
  return isRpsChoice(value) ? value : value === "conflicted" ? "conflicted" : "undecided";
}

function isRpsChoice(value: unknown): value is NeuralRpsChoice {
  return value === "rock" || value === "paper" || value === "scissors";
}

function isRpsReadoutChoice(value: unknown): value is NeuralRpsReadoutChoice {
  return isRpsChoice(value) || value === "undecided" || value === "conflicted";
}

function isRpsOutcome(value: unknown): value is NeuralRpsOutcome {
  return value === "win" || value === "loss" || value === "draw" || value === "none";
}

function isScoredRpsOutcome(value: unknown): value is Exclude<NeuralRpsOutcome, "none"> {
  return value === "win" || value === "loss" || value === "draw";
}

function isValidNeuralRpsRound(round: NeuralRpsRound): boolean {
  return (
    typeof round.id === "string" &&
    Number.isInteger(round.roundIndex) &&
    round.roundIndex > 0 &&
    Number.isInteger(round.tick) &&
    isRpsChoice(round.userChoice) &&
    isRpsChoice(round.opponentChoice) &&
    isRpsReadoutChoice(round.networkChoice) &&
    isRpsOutcome(round.outcome) &&
    Number.isFinite(round.payoff) &&
    Number.isFinite(round.readoutConfidence) &&
    Number.isFinite(round.winnerMargin) &&
    Number.isFinite(round.confidence)
  );
}

function scoreRpsOutcome(networkChoice: NeuralRpsReadoutChoice, opponentChoice: NeuralRpsChoice): NeuralRpsOutcome {
  if (!isRpsChoice(networkChoice)) {
    return "none";
  }
  if (networkChoice === opponentChoice) {
    return "draw";
  }
  return rpsCounterChoice(opponentChoice) === networkChoice ? "win" : "loss";
}

function rpsPayoff(outcome: NeuralRpsOutcome): number {
  if (outcome === "win") {
    return 1;
  }
  if (outcome === "loss") {
    return -1;
  }
  return 0;
}

function emptyChoiceRecord(): Record<NeuralRpsChoice, number> {
  return { rock: 0, paper: 0, scissors: 0 };
}

function emptyTransitionCounts(): Record<NeuralRpsChoice, Record<NeuralRpsChoice, number>> {
  return {
    rock: emptyChoiceRecord(),
    paper: emptyChoiceRecord(),
    scissors: emptyChoiceRecord()
  };
}

function countOpponentChoices(rounds: readonly NeuralRpsRound[]): Record<NeuralRpsChoice, number> {
  const counts = emptyChoiceRecord();
  for (const round of rounds) {
    if (isRpsChoice(round.opponentChoice)) {
      counts[round.opponentChoice] += 1;
    }
  }
  return counts;
}

function countNetworkChoices(rounds: readonly NeuralRpsRound[]): Record<NeuralRpsChoice, number> {
  const counts = emptyChoiceRecord();
  for (const round of rounds) {
    if (isRpsChoice(round.networkChoice)) {
      counts[round.networkChoice] += 1;
    }
  }
  return counts;
}

function countTransitions(rounds: readonly NeuralRpsRound[]): Record<NeuralRpsChoice, Record<NeuralRpsChoice, number>> {
  const counts = emptyTransitionCounts();
  for (let index = 1; index < rounds.length; index += 1) {
    const previous = rounds[index - 1]?.opponentChoice;
    const next = rounds[index]?.opponentChoice;
    if (isRpsChoice(previous) && isRpsChoice(next)) {
      counts[previous][next] += 1;
    }
  }
  return counts;
}

function computeChoiceBias(rounds: readonly NeuralRpsRound[], config: NeuralStrategyAdaptationConfig): Record<NeuralRpsChoice, number> {
  const bias = emptyChoiceRecord();
  for (let index = 0; index < rounds.length; index += 1) {
    for (const choice of neuralRpsChoices) {
      bias[choice] = clamp(bias[choice] * (1 - config.decayRate), -config.maxBiasMagnitude, config.maxBiasMagnitude);
    }
    const prefix = rounds.slice(0, index + 1);
    const prediction = computePatternPrediction(prefix, config);
    if (prediction.predictedCounterChoice !== "unknown" && prediction.confidence >= config.minPatternConfidence) {
      bias[prediction.predictedCounterChoice] = clamp(
        bias[prediction.predictedCounterChoice] + config.learningRate * prediction.confidence,
        -config.maxBiasMagnitude,
        config.maxBiasMagnitude
      );
    }
  }
  return bias;
}

function computePatternPrediction(
  rounds: readonly NeuralRpsRound[],
  config: NeuralStrategyAdaptationConfig
): {
  predictedOpponentChoice: NeuralRpsChoice | "unknown";
  predictedCounterChoice: NeuralRpsChoice | "unknown";
  confidence: number;
  transitionStability: number;
} {
  const recent = boundNeuralRpsRounds(rounds, config.historyWindow);
  if (recent.length === 0) {
    return { predictedOpponentChoice: "unknown", predictedCounterChoice: "unknown", confidence: 0, transitionStability: 0 };
  }
  const frequency = distributionPrediction(countOpponentChoices(recent), recent.length);
  const transitionRounds = recent.slice(-config.patternWindow);
  const transitions = countTransitions(transitionRounds);
  const lastChoice = transitionRounds[transitionRounds.length - 1]?.opponentChoice;
  const transitionTotal = lastChoice ? sumChoiceRecord(transitions[lastChoice]) : 0;
  const transition = lastChoice && transitionTotal > 0 ? distributionPrediction(transitions[lastChoice], transitionTotal) : null;
  const transitionStability = transition ? transition.confidence : 0;
  const selected = transition && transition.confidence > frequency.confidence ? transition : frequency;
  if (!selected.choice) {
    return { predictedOpponentChoice: "unknown", predictedCounterChoice: "unknown", confidence: 0, transitionStability };
  }
  return {
    predictedOpponentChoice: selected.choice,
    predictedCounterChoice: rpsCounterChoice(selected.choice),
    confidence: selected.confidence,
    transitionStability
  };
}

function distributionPrediction(
  counts: Record<NeuralRpsChoice, number>,
  total: number
): { choice: NeuralRpsChoice | null; confidence: number } {
  if (total <= 0) {
    return { choice: null, confidence: 0 };
  }
  const sorted = neuralRpsChoices
    .map((choice) => ({ choice, count: counts[choice] }))
    .sort((left, right) => right.count - left.count || neuralRpsChoices.indexOf(left.choice) - neuralRpsChoices.indexOf(right.choice));
  const top = sorted[0]!;
  const second = sorted[1]?.count ?? 0;
  if (top.count <= 0 || top.count === second) {
    return { choice: null, confidence: 0 };
  }
  const maxShare = top.count / total;
  const secondShare = second / total;
  const sampleFactor = clamp(total / 4, 0, 1);
  const confidence = clamp((maxShare - secondShare) * 1.5 * sampleFactor, 0, 1);
  return { choice: top.choice, confidence };
}

function computeRollingRates(rounds: readonly NeuralRpsRound[]): { win: number; draw: number; loss: number; nonDrawWin: number } {
  const scored = rounds.filter((round) => isScoredRpsOutcome(round.outcome)).slice(-30);
  if (scored.length === 0) {
    return { win: 0, draw: 0, loss: 0, nonDrawWin: 0 };
  }
  const wins = scored.filter((round) => round.outcome === "win").length;
  const draws = scored.filter((round) => round.outcome === "draw").length;
  const losses = scored.filter((round) => round.outcome === "loss").length;
  const nonDrawTotal = wins + losses;
  return {
    win: wins / scored.length,
    draw: draws / scored.length,
    loss: losses / scored.length,
    nonDrawWin: nonDrawTotal > 0 ? wins / nonDrawTotal : 0
  };
}

function computeChoiceEntropy(counts: Record<NeuralRpsChoice, number>): number {
  const total = sumChoiceRecord(counts);
  if (total <= 0) {
    return 0;
  }
  const entropy = neuralRpsChoices.reduce((sum, choice) => {
    const count = counts[choice];
    if (count <= 0) {
      return sum;
    }
    const probability = count / total;
    return sum - probability * Math.log2(probability);
  }, 0);
  return clamp(entropy / Math.log2(neuralRpsChoices.length), 0, 1);
}

function sumChoiceRecord(counts: Record<NeuralRpsChoice, number>): number {
  return neuralRpsChoices.reduce((sum, choice) => sum + counts[choice], 0);
}

function formatAdaptationUpdateSummary(
  predictedOpponentChoice: NeuralRpsChoice | "unknown",
  predictedCounterChoice: NeuralRpsChoice | "unknown",
  enabled: boolean
): string {
  if (!enabled) {
    return "No adaptation update: adaptation is disabled.";
  }
  if (predictedOpponentChoice === "unknown" || predictedCounterChoice === "unknown") {
    return "No adaptation update: no stable pattern was detected.";
  }
  return `Adaptation update: recent rounds favored ${titleCase(predictedOpponentChoice)}, so the readout bias shifted toward ${titleCase(
    predictedCounterChoice
  )}.`;
}

function deterministicExploration(seed: string, roundIndex: number, explorationRate: number): boolean {
  return deterministicUnit(`${seed}:explore:${roundIndex}`) < explorationRate;
}

function deterministicExplorationChoice(userChoice: NeuralRpsChoice, seed: string, roundIndex: number): NeuralRpsChoice {
  const unit = deterministicUnit(`${seed}:choice:${roundIndex}`);
  const offset = Math.floor(unit * neuralRpsChoices.length) % neuralRpsChoices.length;
  const start = neuralRpsChoices.indexOf(userChoice);
  return neuralRpsChoices[(start + offset) % neuralRpsChoices.length] ?? userChoice;
}

function deterministicUnit(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4_294_967_295;
}

function formatBiasSummary(choiceBias: Record<NeuralRpsChoice, number>): string {
  return neuralRpsChoices.map((choice) => `${titleCase(choice)} ${formatSigned(choiceBias[choice])}`).join(" · ");
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}`;
}

function percent(value: number): string {
  return `${formatNumber(clamp(value, 0, 1) * 100, 0)}%`;
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
