import type {
  ComponentValue,
  EntityTypeDefinition,
  InitializationPresetDefinition,
  JsonValue,
  MetricDefinition,
  ModelDocumentation,
  ParameterDefinition,
  ParameterValues,
  SimulationSnapshotView,
  SimulationTemplate,
  System,
  TemplateCapabilities,
  TemplateSpaceDefinition
} from "../kernel/types";
import { SimulationValidationError } from "../kernel/Errors";
import type { RandomStream } from "../kernel/Random";
import { World, type WorldView } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { NetworkSpace } from "../spaces/NetworkSpace";
import { Position2D } from "./epidemic.template";
import { createTemplateAssumptionProfile } from "../assumptions/profiles";

export const NEURAL_EXCITATION_SPACE_ID = "neural-excitation-field";
export const NEURAL_EXCITATION_NETWORK_ID = "neural-excitation-runtime-network";
export const NeuralNeuronStateComponent = "NeuralNeuronState";

export const neuralExcitationBoundaryPhrases = [
  "Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation.",
  "Activation is a model variable, not measured membrane voltage.",
  "Synapse weights are abstract influence strengths, not biological synaptic measurements.",
  "The model does not simulate ion channels, neurotransmitters, morphology, learning, consciousness, or cognition.",
  "This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable."
] as const;

export type NeuralNeuronVisibleState = "resting" | "charging" | "firing" | "refractory" | "inhibited";
export type NeuralSynapseKind = "excitatory" | "inhibitory";
export type NeuralTopology = "random" | "clustered" | "smallWorld" | "ring";
export type NeuralDecisionChoice = "rock" | "paper" | "scissors";
export type NeuralDecisionState = "undecided" | NeuralDecisionChoice | "conflicted";
export type NeuralOpponentChoiceMode = "fixed" | "seededRandom";
export type NeuralRpsOutcome = "none" | "win" | "loss" | "draw";

export interface NeuralNeuronState extends Record<string, JsonValue> {
  groupId: string;
  state: NeuralNeuronVisibleState;
  activation: number;
  threshold: number;
  incomingExcitatory: number;
  incomingInhibitory: number;
  refractoryRemaining: number;
  baselineExcitability: number;
  lastFiredTick: number;
}

export interface NeuralSynapse extends Record<string, JsonValue> {
  id: string;
  sourceId: string;
  targetId: string;
  kind: NeuralSynapseKind;
  weight: number;
  delayTicks: number;
  enabled: boolean;
}

export interface NeuralSignal extends Record<string, JsonValue> {
  id: string;
  sourceId: string;
  targetId: string;
  kind: NeuralSynapseKind;
  amount: number;
  arrivalTick: number;
}

export interface NeuralDecisionAssembly extends Record<string, JsonValue> {
  id: string;
  label: string;
  choice: NeuralDecisionChoice;
  neuronIds: string[];
  activation: number;
}

export interface NeuralDecisionReadout extends Record<string, JsonValue> {
  enabled: boolean;
  mode: "rockPaperScissors";
  choices: NeuralDecisionAssembly[];
  selected: NeuralDecisionState;
  selectedAssemblyId: string;
  confidence: number;
  winnerMargin: number;
  conflictScore: number;
  threshold: number;
  margin: number;
  windowTicks: number;
  decisionTick: number;
  boundaryNote: string;
}

export interface NeuralRpsReadout extends Record<string, JsonValue> {
  enabled: boolean;
  networkChoice: NeuralDecisionState;
  opponentChoice: NeuralDecisionChoice;
  outcome: NeuralRpsOutcome;
  payoff: number;
  boundaryNote: string;
}

interface NeuralRecentFiringRecord extends Record<string, JsonValue> {
  tick: number;
  count: number;
}

interface NeuralParams {
  neuronCount: number;
  networkTopology: NeuralTopology;
  connectionDensity: number;
  excitatoryRatio: number;
  averageSynapseWeight: number;
  weightVariance: number;
  activationDecay: number;
  globalThreshold: number;
  thresholdVariance: number;
  refractoryTicks: number;
  signalDelayMin: number;
  signalDelayMax: number;
  baselineExcitability: number;
  noiseLevel: number;
  externalStimulusRate: number;
  externalStimulusStrength: number;
  initialActiveRatio: number;
  maxSignalQueueSize: number;
  maxFiringFraction: number;
  decisionReadoutEnabled: boolean;
  decisionThreshold: number;
  decisionMargin: number;
  decisionWindowTicks: number;
  outputBias: number;
  opponentChoiceMode: NeuralOpponentChoiceMode;
  fixedOpponentChoice: NeuralDecisionChoice;
}

interface NeuralEdgePair {
  sourceIndex: number;
  targetIndex: number;
}

const worldWidth = 100;
const worldHeight = 100;
const maxSynapseCount = 12_000;
const maxActivation = 8;
const maxDecisionAssemblySize = 8;
const cascadeWindowTicks = 6;
const firingEpsilon = 0.000_001;
const nonPredictiveNote = "These models are exploratory simulations, not calibrated predictive tools.";
const decisionReadoutBoundary =
  "Decision Readout V1 maps labeled output assemblies to bounded categorical choices. It is not cognition or reasoning.";
const rpsLabelBoundary = "Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network.";
const rpsPayoffBoundary =
  "Template RPS payoff is observational and does not train, optimize, mutate synapses, or update biological/plasticity fields.";
const neuralStrategyAdaptationBoundary =
  "Neural Strategy Adaptation V1 is local to the Neural Runtime Lab RPS/readout mode and adjusts bounded readout bias only.";
const decisionInferenceBoundary = "The model does not infer intentions, beliefs, preferences, personality, or human decision-making.";
const neuralDecisionChoices = ["rock", "paper", "scissors"] as const satisfies readonly NeuralDecisionChoice[];

export const neuralSynapsesGlobalKey = "neuralSynapses";
export const neuralSignalQueueGlobalKey = "neuralSignalQueue";
export const neuralDecisionReadoutGlobalKey = "neuralDecisionReadout";
export const neuralRpsReadoutGlobalKey = "neuralRpsReadout";
const neuralRecentFiringGlobalKey = "neuralRecentFiringWindow";
export const neuralExternalStimulusGlobalKey = "neuralExternalStimulusEnabled";
export const neuralExcitationScaleGlobalKey = "neuralExcitationScale";
export const neuralInhibitionScaleGlobalKey = "neuralInhibitionScale";
const neuralMaxSignalQueueSizeGlobalKey = "neuralMaxSignalQueueSize";
const neuralDecisionSwitchCountGlobalKey = "neuralDecisionSwitchCount";

const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "neuronCount",
    label: "Neuron count",
    type: "integer",
    defaultValue: 80,
    min: 20,
    max: 250,
    step: 1,
    description: "Number of runtime neuron nodes. UI V1 is intentionally bounded.",
    liveUpdate: false
  },
  {
    key: "networkTopology",
    label: "Network topology",
    type: "select",
    defaultValue: "clustered",
    options: ["random", "clustered", "smallWorld", "ring"],
    description: "Template-owned runtime topology generator for this Neural template only.",
    liveUpdate: false
  },
  {
    key: "connectionDensity",
    label: "Connection density",
    type: "number",
    defaultValue: 0.12,
    min: 0.01,
    max: 0.3,
    step: 0.01,
    description: "Approximate directed synapse density before the V1 synapse cap is applied.",
    liveUpdate: false
  },
  {
    key: "excitatoryRatio",
    label: "Excitatory ratio",
    type: "number",
    defaultValue: 0.8,
    min: 0.5,
    max: 0.95,
    step: 0.01,
    description: "Approximate fraction of synapses that carry excitatory model influence.",
    liveUpdate: false
  },
  {
    key: "averageSynapseWeight",
    label: "Average synapse weight",
    type: "number",
    defaultValue: 0.5,
    min: 0.05,
    max: 2,
    step: 0.05,
    description: "Mean abstract influence strength for generated synapses.",
    liveUpdate: false
  },
  {
    key: "weightVariance",
    label: "Weight variance",
    type: "number",
    defaultValue: 0.2,
    min: 0,
    max: 1,
    step: 0.05,
    description: "Bounded seeded variation around average synapse weight.",
    liveUpdate: false
  },
  {
    key: "activationDecay",
    label: "Activation decay",
    type: "number",
    defaultValue: 0.18,
    min: 0,
    max: 0.9,
    step: 0.01,
    description: "Fraction of activation that leaks away per tick.",
    liveUpdate: true
  },
  {
    key: "globalThreshold",
    label: "Global threshold",
    type: "number",
    defaultValue: 1,
    min: 0.1,
    max: 5,
    step: 0.05,
    description: "Base firing threshold before bounded seeded neuron-level variation.",
    liveUpdate: false
  },
  {
    key: "thresholdVariance",
    label: "Threshold variance",
    type: "number",
    defaultValue: 0.2,
    min: 0,
    max: 1,
    step: 0.05,
    description: "Bounded seeded variation around the global threshold.",
    liveUpdate: false
  },
  {
    key: "refractoryTicks",
    label: "Refractory ticks",
    type: "integer",
    defaultValue: 3,
    min: 0,
    max: 20,
    step: 1,
    description: "Ticks after firing during which the neuron cannot fire again.",
    liveUpdate: true
  },
  {
    key: "signalDelayMin",
    label: "Signal delay min",
    type: "integer",
    defaultValue: 1,
    min: 1,
    max: 10,
    step: 1,
    description: "Minimum delayed-signal travel time in ticks.",
    liveUpdate: false
  },
  {
    key: "signalDelayMax",
    label: "Signal delay max",
    type: "integer",
    defaultValue: 4,
    min: 1,
    max: 20,
    step: 1,
    description: "Maximum delayed-signal travel time in ticks.",
    liveUpdate: false
  },
  {
    key: "baselineExcitability",
    label: "Baseline excitability",
    type: "number",
    defaultValue: 0.02,
    min: 0,
    max: 0.5,
    step: 0.01,
    description: "Small stylized baseline activation added per tick.",
    liveUpdate: true
  },
  {
    key: "noiseLevel",
    label: "Noise level",
    type: "number",
    defaultValue: 0.015,
    min: 0,
    max: 1,
    step: 0.005,
    description: "Seeded activation perturbation strength.",
    liveUpdate: true
  },
  {
    key: "externalStimulusRate",
    label: "External stimulus rate",
    type: "number",
    defaultValue: 0.015,
    min: 0,
    max: 0.2,
    step: 0.005,
    description: "Per-neuron chance of external model stimulus each tick when enabled.",
    liveUpdate: true
  },
  {
    key: "externalStimulusStrength",
    label: "External stimulus strength",
    type: "number",
    defaultValue: 1.2,
    min: 0,
    max: 5,
    step: 0.05,
    description: "Activation added by a seeded external model stimulus event.",
    liveUpdate: true
  },
  {
    key: "initialActiveRatio",
    label: "Initial active ratio",
    type: "number",
    defaultValue: 0.03,
    min: 0,
    max: 0.5,
    step: 0.01,
    description: "Fraction of neurons initialized as firing at tick 0.",
    liveUpdate: false
  },
  {
    key: "maxSignalQueueSize",
    label: "Max signal queue",
    type: "integer",
    defaultValue: 2000,
    min: 100,
    max: 5000,
    step: 50,
    description: "Hard cap for delayed signals retained in the runtime queue.",
    liveUpdate: true
  },
  {
    key: "maxFiringFraction",
    label: "Max firing fraction",
    type: "number",
    defaultValue: 0.45,
    min: 0.05,
    max: 1,
    step: 0.05,
    description: "Per-tick saturation guard limiting the fraction of neurons allowed to fire.",
    liveUpdate: true
  },
  {
    key: "decisionReadoutEnabled",
    label: "Decision readout",
    type: "boolean",
    defaultValue: false,
    description: "Enable a bounded categorical readout from labeled output assemblies. It is not cognition or reasoning.",
    liveUpdate: false
  },
  {
    key: "decisionThreshold",
    label: "Decision threshold",
    type: "number",
    defaultValue: 0.75,
    min: 0.1,
    max: 5,
    step: 0.05,
    description: "Minimum output assembly activation required before a selected readout is reported.",
    liveUpdate: true
  },
  {
    key: "decisionMargin",
    label: "Decision margin",
    type: "number",
    defaultValue: 0.15,
    min: 0,
    max: 2,
    step: 0.05,
    description: "Required activation gap between the highest and second-highest output assemblies.",
    liveUpdate: true
  },
  {
    key: "decisionWindowTicks",
    label: "Decision window ticks",
    type: "integer",
    defaultValue: 4,
    min: 1,
    max: 20,
    step: 1,
    description: "Bounded recent-firing window used by the output assembly readout.",
    liveUpdate: true
  },
  {
    key: "outputBias",
    label: "Output assembly bias",
    type: "number",
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.05,
    description: "Optional equal initialization bias for labeled output assemblies; it does not train or mutate the network.",
    liveUpdate: false
  },
  {
    key: "opponentChoiceMode",
    label: "Opponent choice mode",
    type: "select",
    defaultValue: "fixed",
    options: ["fixed", "seededRandom"],
    description: "RPS demonstration opponent source. Seeded random uses engine RNG and does not adapt.",
    liveUpdate: true
  },
  {
    key: "fixedOpponentChoice",
    label: "Fixed opponent choice",
    type: "select",
    defaultValue: "rock",
    options: ["rock", "paper", "scissors"],
    description: "Fixed opponent label for observational Rock-Paper-Scissors payoff.",
    liveUpdate: true
  }
];

const capabilities: TemplateCapabilities = {
  supportsScenarioBuilder: true,
  supportsInitializationPresets: true,
  supportsAgentComposition: true,
  supportsBehaviorModes: true,
  supportsEnvironmentOptions: false,
  supportsInterventions: true,
  supportsMetricHistory: true,
  supportsRunComparison: true,
  supportsExperimentRunner: true,
  supportsSnapshotExport: true,
  supportsContinuousSpace: true,
  supportsGridSpace: false,
  supportsNetworkSpace: true,
  supportsNetworkOptions: false,
  supportsNetworkMetrics: true,
  supportsResources: false,
  supportsStocks: false,
  supportsFlows: false,
  supportsResourceMetrics: false,
  supportsEvents: false,
  supportsDelays: false,
  supportsFeedbackLoops: false,
  supportsFeedbackMetrics: false,
  supportsEnvironmentLayers: false,
  supportsUncertaintyConfig: true
};

const spaceDefinition: TemplateSpaceDefinition = {
  type: "hybrid",
  spaceId: NEURAL_EXCITATION_NETWORK_ID,
  description:
    "A template-owned runtime graph plus continuous node layout. The graph belongs only to the Neural Excitation Network template.",
  boundaryMode: "clamp",
  dimensions: { width: worldWidth, height: worldHeight }
};

const runtimeMetadata = {
  expectedScaleClass: "medium",
  neighborSearchStrategy: "templateSpecific",
  hotLoopNotes: [
    "Neural Excitation uses sorted template-owned synapse lists for signal emission rather than all-pairs scans.",
    "Delayed signals live in a bounded queue stored as plain JSON globals for deterministic snapshots.",
    "Largest active component metrics scan bounded active synapses; V1 caps UI neuron count and total synapse count.",
    "Decision Readout V1 scans three bounded output assemblies and computes trivial observational RPS payoff when enabled."
  ],
  defaultEntityCount: 80,
  stressEntityCount: 250,
  knownPerformanceLimits: [
    "High density and low thresholds can saturate the queue and trigger the firing-fraction guard.",
    "This is not connectome-scale simulation and makes no neuroscience-scale performance claim.",
    "Canvas edge drawing is bounded and simplified for UI readability.",
    "Decision Readout V1 is a bounded categorical readout, not cognition, reasoning, learning, or strategy adaptation."
  ]
} as const;

const entityTypeDefinitions: EntityTypeDefinition[] = [
  {
    typeId: "neuralNeuron",
    label: "Neuron node",
    description: "Runtime graph node with stylized activation, threshold, group, and refractory state.",
    components: [Position2D, NeuralNeuronStateComponent],
    representedAs: "entity",
    configurableCount: true,
    countParameterKey: "neuronCount",
    defaultVisual: { color: "#d8ff3e", glyph: "N", label: "Neuron node" }
  },
  {
    typeId: "neuralSynapse",
    label: "Runtime synapse",
    description: "Directed weighted runtime edge stored in the template-owned network graph.",
    representedAs: "state",
    configurableCount: true,
    countParameterKey: "connectionDensity",
    defaultVisual: { color: "#7bd7c7", glyph: "->", label: "Runtime synapse" }
  },
  {
    typeId: "neuralOutputAssembly",
    label: "Output assembly readout",
    description:
      "Optional labeled output groups used for bounded categorical readout. Labels are assigned by the model designer and are not understood by the network.",
    representedAs: "state",
    configurableCount: false,
    defaultVisual: { color: "#ffd37a", glyph: "RPS", label: "Selected readout" }
  }
];

const initializationPresets: InitializationPresetDefinition[] = [
  {
    id: "inhibition-stabilized-cascade",
    label: "Inhibition-Stabilized Cascade",
    description: "Recommended default. Inhibitory edges help prevent runaway excitation while still allowing cascades.",
    parameterOverrides: {
      neuronCount: 80,
      networkTopology: "clustered",
      connectionDensity: 0.12,
      excitatoryRatio: 0.8,
      globalThreshold: 1,
      activationDecay: 0.18,
      refractoryTicks: 3,
      signalDelayMin: 1,
      signalDelayMax: 4,
      externalStimulusRate: 0.015,
      initialActiveRatio: 0.03
    }
  },
  {
    id: "quiet-network",
    label: "Quiet Network",
    description: "Mostly resting, with sparse cascades and low external stimulus.",
    parameterOverrides: {
      connectionDensity: 0.06,
      averageSynapseWeight: 0.3,
      globalThreshold: 1.4,
      activationDecay: 0.32,
      externalStimulusRate: 0.004,
      initialActiveRatio: 0.01,
      noiseLevel: 0.005
    }
  },
  {
    id: "cascade-prone-network",
    label: "Cascade-Prone Network",
    description: "Small stimuli can produce larger bursts through high excitation and lower thresholds.",
    parameterOverrides: {
      connectionDensity: 0.16,
      excitatoryRatio: 0.9,
      averageSynapseWeight: 0.75,
      globalThreshold: 0.75,
      activationDecay: 0.08,
      externalStimulusRate: 0.025,
      initialActiveRatio: 0.06,
      maxFiringFraction: 0.55
    }
  },
  {
    id: "oscillating-network",
    label: "Oscillating Network",
    description: "Small-world loops and delays can create periodic bursts in the stylized runtime variables.",
    parameterOverrides: {
      networkTopology: "smallWorld",
      connectionDensity: 0.14,
      averageSynapseWeight: 0.62,
      activationDecay: 0.12,
      globalThreshold: 0.95,
      refractoryTicks: 4,
      signalDelayMin: 3,
      signalDelayMax: 8,
      externalStimulusRate: 0.01
    }
  },
  {
    id: "fragmented-network",
    label: "Fragmented Network",
    description: "Clustered modules keep most activity local unless cross-cluster links align.",
    parameterOverrides: {
      networkTopology: "clustered",
      connectionDensity: 0.08,
      excitatoryRatio: 0.78,
      averageSynapseWeight: 0.45,
      globalThreshold: 1.05,
      activationDecay: 0.22,
      externalStimulusRate: 0.018,
      initialActiveRatio: 0.04
    }
  },
  {
    id: "rock-paper-scissors-readout",
    label: "Rock-Paper-Scissors Readout",
    description:
      "Enables three labeled output assemblies and observational RPS payoff. This demonstrates bounded readout only, not cognition or biological learning.",
    parameterOverrides: {
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
];

const behaviorModes = [
  {
    id: "default",
    label: "Stylized excitation",
    description: "Neurons accumulate model input, fire above threshold, enter refractory cooldown, and emit delayed signals.",
    templateId: "neural-excitation-network",
    supportedCompositionFields: ["neuronCount"],
    supportedParameters: parameterDefinitions.map((definition) => definition.key),
    documentation:
      "Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation.",
    limitations: [
      "No learning or plasticity is implemented in V1.",
      decisionReadoutBoundary,
      rpsPayoffBoundary,
      neuralStrategyAdaptationBoundary,
      "This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable."
    ],
    metricNotes:
      "Metrics are model-output history, not empirical neural recordings. Activation and synchrony are stylized runtime variables, not biological measurements."
  }
] as const;

const agentCompositionDefinitions: ParameterDefinition[] = [parameterDefinition("neuronCount")];

const documentation: ModelDocumentation = {
  purpose:
    "Explore stylized threshold cascades, delays, inhibition, synchrony, stability, and optional bounded output-assembly readout in a directed network.",
  entities: [
    "Runtime neuron nodes with activation state.",
    "Directed weighted runtime synapses.",
    "Optional labeled output assemblies for bounded categorical readout."
  ],
  stateVariables: ["Position2D", "NeuralNeuronState", "neuralSynapses", "neuralSignalQueue", "neuralDecisionReadout", "neuralRpsReadout"],
  processOverview:
    "Neurons accumulate excitatory and inhibitory input, leak activation, fire above threshold when not refractory, emit delayed signals through outgoing synapses, and record bounded model-output metrics. If enabled, Decision Readout V1 maps activity in three labeled output assemblies to a bounded categorical choice.",
  scheduling:
    "A single template-owned act-phase system processes due delayed signals, external stimulus, activation decay, firing, refractory cooldown, signal emission, queue bounds, optional bounded decision readout, observational RPS payoff, and runtime summary globals before metrics are collected.",
  designConcepts: {
    emergence: "Cascades, bursts, and local synchrony can emerge from thresholded directed influence and delay.",
    interaction: "Interaction occurs through template-owned directed synapses, not Builder graph edges or model-schema graph structure.",
    stochasticity: "Topology, initial activity, threshold variation, external stimulus, and noise use deterministic seeded RNG streams.",
    observation:
      "Metrics are model-output history, not empirical neural recordings. Decision metrics are model-output readouts from labeled neuron groups, not evidence of reasoning."
  },
  initialization:
    "Neurons are placed in a continuous layout, runtime synapses are generated deterministically from the selected topology, and a bounded initial firing set can seed delayed signals.",
  submodels: [
    "Runtime topology generation",
    "Activation accumulation and decay",
    "Excitatory and inhibitory signaling",
    "Delayed signal queue",
    "Refractory cooldown",
    "Optional bounded categorical Decision Readout V1",
    "Optional observational Rock-Paper-Scissors payoff",
    "Bounded cascade and synchrony metrics"
  ],
  assumptions: [
    "This is a stylized neural excitation network, not a biological brain simulation.",
    neuralExcitationBoundaryPhrases[0],
    neuralExcitationBoundaryPhrases[1],
    neuralExcitationBoundaryPhrases[2],
    neuralExcitationBoundaryPhrases[3],
    decisionReadoutBoundary,
    "The Neural Decision Readout maps activity in labeled output assemblies to a bounded categorical choice. It does not reason, understand, learn, or model cognition.",
    rpsLabelBoundary,
    rpsPayoffBoundary,
    neuralStrategyAdaptationBoundary,
    decisionInferenceBoundary,
    "Outputs are model behavior, not neuroscience evidence.",
    "Synapses are template-owned runtime relations in this one hand-built model."
  ],
  limitations: [
    neuralExcitationBoundaryPhrases[4],
    "The model does not include learning or plasticity in V1.",
    decisionReadoutBoundary,
    rpsLabelBoundary,
    rpsPayoffBoundary,
    neuralStrategyAdaptationBoundary,
    decisionInferenceBoundary,
    "Decision metrics are model-output readouts from labeled neuron groups, not evidence of reasoning.",
    "RPS payoff is observational and does not train, mutate synapses, or adapt the core neural graph in V1.",
    "The model does not import real connectomes, brain-region anatomy, clinical data, or external neuroscience data.",
    "The model is not a cognitive model and does not simulate consciousness, memory formation, emotion, personality, diagnosis, or human behavior.",
    "Metrics are model-output history, not empirical neural recordings.",
    "Activation and synchrony are stylized runtime variables, not biological measurements.",
    "This runtime graph belongs only to the Neural Excitation Network template.",
    "It does not make Builder graphs or model-schema graphs executable.",
    "Node positions and runtime synapse layout are not spatial field, field layer, or environmental field runtime support.",
    "The template does not define an explicit system boundary or environment layer, and it does not execute external forcing or exogenous shocks.",
    nonPredictiveNote
  ],
  notRepresented: [
    "biological neurons",
    "measured membrane voltage",
    "ion channels",
    "neurotransmitters",
    "cell morphology",
    "brain regions",
    "biological learning or plasticity",
    "STDP",
    "backpropagation",
    "machine-learning training",
    "RPS strategy learning inside the core neural graph",
    "persistent opponent profiles",
    "semantic understanding of Rock-Paper-Scissors labels",
    "human decision-making inference",
    "intent, belief, preference, or personality inference",
    "consciousness",
    "cognition",
    "clinical seizure modeling",
    "diagnosis",
    "real connectome import",
    "neuroscience validation",
    "Builder graph execution",
    "model schema execution",
    "schema-to-template generation"
  ],
  appropriateUse: [
    "Exploring stylized network cascades, inhibition, delayed propagation, local synchrony, seed-dependent stability, and bounded output-assembly readout in an abstract model."
  ],
  inappropriateUse: [
    "Biological brain simulation, clinical interpretation, seizure prediction, diagnosis, cognition claims, consciousness claims, medical decisions, real-person inference, human decision-making claims, strategy recommendation, persuasion optimization, or neuroscience evidence claims."
  ]
};

const assumptionProfile = createTemplateAssumptionProfile({
  templateId: "neural-excitation-network",
  assumptions: documentation.assumptions,
  limitations: documentation.limitations,
  notRepresented: documentation.notRepresented ?? [],
  appropriateUse: documentation.appropriateUse ?? [],
  inappropriateUse: documentation.inappropriateUse ?? [],
  ethicsNotes: [
    "Do not describe this template as a brain simulator or evidence about biological neural systems.",
    "Do not use activation, synchrony, or cascade outputs for clinical, diagnostic, cognitive, psychological, or real-person claims.",
    decisionReadoutBoundary,
    rpsLabelBoundary,
    rpsPayoffBoundary,
    neuralStrategyAdaptationBoundary,
    decisionInferenceBoundary,
    "This runtime graph is template-owned and must not be generalized into Builder graph execution or model-schema execution."
  ],
  validationStatus: "internallyTested",
  validationNotes:
    "Internally tested through deterministic generation, runtime update, bounded queue, intervention, registry, and boundary tests. Not calibrated, biologically validated, clinically validated, or externally validated."
});

const metricDefinitions = neuralExcitationMetrics();

export const neuralExcitationTemplate: SimulationTemplate = {
  id: "neural-excitation-network",
  name: "Neural Excitation Network",
  description:
    "A stylized neural-network dynamics template where nodes accumulate input, fire when threshold is crossed, enter refractory cooldown, and propagate delayed excitatory or inhibitory signals through weighted synapses.",
  version: "1.0.0",
  capabilities,
  spaceDefinition,
  entityTypeDefinitions,
  runtimeMetadata,
  parameterDefinitions,
  metricDefinitions,
  initializationPresets,
  behaviorModes,
  agentCompositionDefinitions,
  documentation,
  assumptionProfile,
  createInitialWorld(ctx) {
    const params = neuralExcitationParams(ctx.params);
    const world = new World({ globals: initialNeuralRuntimeGlobals(params, [], []) });
    const field = new Continuous2DSpace({
      id: NEURAL_EXCITATION_SPACE_ID,
      width: worldWidth,
      height: worldHeight,
      boundaryMode: "clamp"
    });
    const network = new NetworkSpace(NEURAL_EXCITATION_NETWORK_ID);
    world.addSpace(field);
    world.addSpace(network);

    const initRng = ctx.rng.fork("neural:init");
    const neurons = createNeurons(params, initRng);
    const decisionAssemblies = createDecisionAssemblies(
      neurons.map((neuron) => neuron.id),
      params
    );
    const outputAssemblyNeuronIds = new Set(decisionAssemblies.flatMap((assembly) => assembly.neuronIds));
    const activeNeuronIds = new Set(initialActiveNeuronIds(neurons.map((neuron) => neuron.id), params, initRng));
    for (const neuron of neurons) {
      const entity = world.entityStore.create("neural-neuron", {
        id: neuron.id,
        createdAtTick: 0,
        label: neuron.label
      });
      const baseState =
        params.decisionReadoutEnabled && outputAssemblyNeuronIds.has(entity.id) && params.outputBias > 0
          ? { ...neuron.state, activation: roundMetricValue(params.outputBias), state: "charging" as const }
          : neuron.state;
      const initialState = activeNeuronIds.has(entity.id)
        ? {
            ...baseState,
            state: "firing" as const,
            activation: 0,
            refractoryRemaining: params.refractoryTicks,
            lastFiredTick: 0
          }
        : baseState;
      world.componentStore.add(entity.id, Position2D, { x: neuron.x, y: neuron.y });
      world.componentStore.add(entity.id, NeuralNeuronStateComponent, initialState);
      field.addEntity(entity.id, { x: neuron.x, y: neuron.y });
      network.addEntity(entity.id);
    }

    const synapses = generateSynapses(neurons, params, initRng);
    for (const synapse of synapses) {
      network.addEdge(synapse.sourceId, synapse.targetId, synapse.weight, true);
    }
    const signalQueue = emitSignalsForFiring([...activeNeuronIds], synapses, 0, params, 0, params.maxSignalQueueSize).queue;
    world.globals = initialNeuralRuntimeGlobals(params, synapses, signalQueue, activeNeuronIds.size, decisionAssemblies);
    return world;
  },
  registerSystems(registry) {
    registry.register(createNeuralExcitationSystem());
  },
  registerMetrics(registry) {
    for (const metric of metricDefinitions) {
      registry.register(metric);
    }
  },
  getVisuals(_snapshot: SimulationSnapshotView) {
    return {
      components: {
        positionComponent: Position2D,
        neuronStateComponent: NeuralNeuronStateComponent,
        runtimeNetworkSpace: NEURAL_EXCITATION_NETWORK_ID,
        runtimeSynapseGlobal: neuralSynapsesGlobalKey,
        signalQueueGlobal: neuralSignalQueueGlobalKey
      },
      colors: {
        resting: "#848a80",
        charging: "#d8ff3e",
        firing: "#ff5a24",
        refractory: "#f3f1e8",
        inhibited: "#6c72ff",
        excitatory: "#d8ff3e",
        inhibitory: "#6c72ff"
      },
      labels: {
        resting: "Resting neuron",
        charging: "Stylized activation",
        firing: "Firing this tick",
        refractory: "Refractory cooldown",
        inhibited: "Inhibitory signal",
        excitatory: "Excitatory signal",
        runtimeSynapse: "Runtime synapse"
      },
      description:
        "Runtime synapses are directed template-owned relations for Neural Excitation only; they do not make Builder graphs or model-schema graphs executable."
    };
  },
  validateWorld(world) {
    validateNeuralExcitationWorld(world);
  },
  validateParameters(params) {
    neuralExcitationParams(params);
  },
  validateInitializationOptions(initialization) {
    if (!initializationPresets.some((preset) => preset.id === initialization.presetId)) {
      throw new SimulationValidationError(`Unknown Neural Excitation initialization preset: ${initialization.presetId}`);
    }
    if (Object.keys(initialization.options ?? {}).length > 0) {
      throw new SimulationValidationError("Neural Excitation initialization presets do not accept custom options in V1");
    }
  },
  validateScenarioOptions(options) {
    if (options.behaviorMode !== "default") {
      throw new SimulationValidationError(`Unsupported Neural Excitation behavior mode: ${options.behaviorMode}`);
    }
  }
};

function parameterDefinition(key: string): ParameterDefinition {
  const definition = parameterDefinitions.find((candidate) => candidate.key === key);
  if (!definition) {
    throw new Error(`Missing Neural Excitation parameter definition: ${key}`);
  }
  return definition;
}

export function neuralExcitationParams(params: ParameterValues): NeuralParams {
  const values: NeuralParams = {
    neuronCount: Number(params.neuronCount),
    networkTopology: String(params.networkTopology) as NeuralTopology,
    connectionDensity: Number(params.connectionDensity),
    excitatoryRatio: Number(params.excitatoryRatio),
    averageSynapseWeight: Number(params.averageSynapseWeight),
    weightVariance: Number(params.weightVariance),
    activationDecay: Number(params.activationDecay),
    globalThreshold: Number(params.globalThreshold),
    thresholdVariance: Number(params.thresholdVariance),
    refractoryTicks: Number(params.refractoryTicks),
    signalDelayMin: Number(params.signalDelayMin),
    signalDelayMax: Number(params.signalDelayMax),
    baselineExcitability: Number(params.baselineExcitability),
    noiseLevel: Number(params.noiseLevel),
    externalStimulusRate: Number(params.externalStimulusRate),
    externalStimulusStrength: Number(params.externalStimulusStrength),
    initialActiveRatio: Number(params.initialActiveRatio),
    maxSignalQueueSize: Number(params.maxSignalQueueSize),
    maxFiringFraction: Number(params.maxFiringFraction),
    decisionReadoutEnabled: Boolean(params.decisionReadoutEnabled),
    decisionThreshold: Number(params.decisionThreshold),
    decisionMargin: Number(params.decisionMargin),
    decisionWindowTicks: Number(params.decisionWindowTicks),
    outputBias: Number(params.outputBias),
    opponentChoiceMode: String(params.opponentChoiceMode) as NeuralOpponentChoiceMode,
    fixedOpponentChoice: String(params.fixedOpponentChoice) as NeuralDecisionChoice
  };
  if (typeof params.decisionReadoutEnabled !== "boolean") {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: decisionReadoutEnabled must be boolean");
  }
  if (!Number.isInteger(values.neuronCount) || values.neuronCount < 20 || values.neuronCount > 250) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: neuronCount must be an integer from 20 to 250");
  }
  if (!isNeuralTopology(values.networkTopology)) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: networkTopology must be random, clustered, smallWorld, or ring");
  }
  assertRange(values.connectionDensity, "connectionDensity", 0.01, 0.3);
  assertRange(values.excitatoryRatio, "excitatoryRatio", 0.5, 0.95);
  assertRange(values.averageSynapseWeight, "averageSynapseWeight", 0.05, 2);
  assertRange(values.weightVariance, "weightVariance", 0, 1);
  assertRange(values.activationDecay, "activationDecay", 0, 0.9);
  assertRange(values.globalThreshold, "globalThreshold", 0.1, 5);
  assertRange(values.thresholdVariance, "thresholdVariance", 0, 1);
  if (!Number.isInteger(values.refractoryTicks) || values.refractoryTicks < 0 || values.refractoryTicks > 20) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: refractoryTicks must be an integer from 0 to 20");
  }
  if (!Number.isInteger(values.signalDelayMin) || values.signalDelayMin < 1 || values.signalDelayMin > 10) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: signalDelayMin must be an integer from 1 to 10");
  }
  if (!Number.isInteger(values.signalDelayMax) || values.signalDelayMax < 1 || values.signalDelayMax > 20) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: signalDelayMax must be an integer from 1 to 20");
  }
  if (values.signalDelayMin > values.signalDelayMax) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: signalDelayMin must be <= signalDelayMax");
  }
  assertRange(values.baselineExcitability, "baselineExcitability", 0, 0.5);
  assertRange(values.noiseLevel, "noiseLevel", 0, 1);
  assertRange(values.externalStimulusRate, "externalStimulusRate", 0, 0.2);
  assertRange(values.externalStimulusStrength, "externalStimulusStrength", 0, 5);
  assertRange(values.initialActiveRatio, "initialActiveRatio", 0, 0.5);
  if (!Number.isInteger(values.maxSignalQueueSize) || values.maxSignalQueueSize < 100 || values.maxSignalQueueSize > 5000) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: maxSignalQueueSize must be an integer from 100 to 5000");
  }
  assertRange(values.maxFiringFraction, "maxFiringFraction", 0.05, 1);
  assertRange(values.decisionThreshold, "decisionThreshold", 0.1, 5);
  assertRange(values.decisionMargin, "decisionMargin", 0, 2);
  if (!Number.isInteger(values.decisionWindowTicks) || values.decisionWindowTicks < 1 || values.decisionWindowTicks > 20) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: decisionWindowTicks must be an integer from 1 to 20");
  }
  assertRange(values.outputBias, "outputBias", 0, 1);
  if (!isOpponentChoiceMode(values.opponentChoiceMode)) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: opponentChoiceMode must be fixed or seededRandom");
  }
  if (!isDecisionChoice(values.fixedOpponentChoice)) {
    throw new SimulationValidationError("Invalid Neural Excitation parameters: fixedOpponentChoice must be rock, paper, or scissors");
  }
  return values;
}

export function createNeuralExcitationSystem(): System {
  return {
    id: "NeuralExcitationPropagationSystem",
    phase: "act",
    priority: 0,
    query: [NeuralNeuronStateComponent],
    update(ctx) {
      const params = neuralExcitationParams(ctx.params);
      const entityIds = [...(ctx.entityIds ?? [])].sort((left, right) => left.localeCompare(right));
      if (entityIds.length === 0) {
        return;
      }

      const synapses = readNeuralSynapses(ctx.world.globals);
      const signalQueue = readSignalQueue(ctx.world.globals);
      const excitationScale = finiteGlobal(ctx.world.globals[neuralExcitationScaleGlobalKey], 1);
      const inhibitionScale = finiteGlobal(ctx.world.globals[neuralInhibitionScaleGlobalKey], 1);
      const externalStimulusEnabled = ctx.world.globals[neuralExternalStimulusGlobalKey] !== false;
      const dueSignals = signalQueue
        .filter((signal) => signal.arrivalTick <= ctx.tick)
        .sort((left, right) => left.arrivalTick - right.arrivalTick || left.id.localeCompare(right.id));
      const remainingSignals = signalQueue
        .filter((signal) => signal.arrivalTick > ctx.tick)
        .sort((left, right) => left.arrivalTick - right.arrivalTick || left.id.localeCompare(right.id));

      const incomingExcitatory = new Map<string, number>();
      const incomingInhibitory = new Map<string, number>();
      const states = new Map<string, NeuralNeuronState>();
      for (const entityId of entityIds) {
        const state = ctx.world.getComponent<NeuralNeuronState>(entityId, NeuralNeuronStateComponent);
        if (!isNeuralNeuronState(state)) {
          throw new SimulationValidationError(`Invalid NeuralNeuronState component on ${entityId}`);
        }
        states.set(entityId, state);
        incomingExcitatory.set(entityId, 0);
        incomingInhibitory.set(entityId, 0);
      }

      for (const signal of dueSignals) {
        if (!states.has(signal.targetId)) {
          continue;
        }
        const bucket = signal.kind === "excitatory" ? incomingExcitatory : incomingInhibitory;
        bucket.set(signal.targetId, (bucket.get(signal.targetId) ?? 0) + signal.amount);
      }

      let externalStimulusCount = 0;
      if (externalStimulusEnabled && params.externalStimulusRate > 0 && params.externalStimulusStrength > 0) {
        const stimulusRng = ctx.rng.fork("neural:externalStimulus");
        for (const entityId of entityIds) {
          if (stimulusRng.bool(params.externalStimulusRate)) {
            incomingExcitatory.set(entityId, (incomingExcitatory.get(entityId) ?? 0) + params.externalStimulusStrength);
            externalStimulusCount += 1;
          }
        }
      }

      const noiseRng = ctx.rng.fork("neural:noise");
      const nextCandidates = entityIds.map((entityId) => {
        const current = states.get(entityId);
        if (!current) {
          throw new SimulationValidationError(`Missing NeuralNeuronState component on ${entityId}`);
        }
        const excitatory = incomingExcitatory.get(entityId) ?? 0;
        const inhibitory = incomingInhibitory.get(entityId) ?? 0;
        const noise = params.noiseLevel > 0 ? (noiseRng.float() * 2 - 1) * params.noiseLevel : 0;
        const activation = clamp(
          current.activation * (1 - params.activationDecay) + excitatory - inhibitory + current.baselineExcitability + noise,
          0,
          maxActivation
        );
        const canFire = current.refractoryRemaining <= 0;
        return {
          entityId,
          current,
          activation,
          excitatory,
          inhibitory,
          canFire,
          inhibited: inhibitory > excitatory + firingEpsilon
        };
      });

      const firingLimit = Math.max(1, Math.floor(entityIds.length * params.maxFiringFraction));
      const firingSet = new Set(
        nextCandidates
          .filter((candidate) => candidate.canFire && candidate.activation >= candidate.current.threshold)
          .sort((left, right) => right.activation - left.activation || left.entityId.localeCompare(right.entityId))
          .slice(0, firingLimit)
          .map((candidate) => candidate.entityId)
      );

      const stateUpdates: Record<string, ComponentValue> = {};
      let firingCount = 0;
      let refractoryCount = 0;
      let inhibitedCount = 0;
      let activeNeuronCount = 0;
      let totalExcitatory = 0;
      let totalInhibitory = 0;

      for (const candidate of nextCandidates) {
        totalExcitatory += candidate.excitatory;
        totalInhibitory += candidate.inhibitory;
        const fires = firingSet.has(candidate.entityId);
        let nextState: NeuralNeuronVisibleState;
        let nextActivation = candidate.activation;
        let nextRefractory = Math.max(0, candidate.current.refractoryRemaining - 1);
        let lastFiredTick = candidate.current.lastFiredTick;
        if (fires) {
          firingCount += 1;
          nextState = "firing";
          nextActivation = 0;
          nextRefractory = params.refractoryTicks;
          lastFiredTick = ctx.tick;
        } else if (candidate.current.refractoryRemaining > 0) {
          nextState = "refractory";
        } else if (candidate.inhibited) {
          nextState = "inhibited";
          inhibitedCount += 1;
        } else if (candidate.activation > firingEpsilon) {
          nextState = "charging";
        } else {
          nextState = "resting";
        }
        if (nextState === "refractory") {
          refractoryCount += 1;
        }
        if (nextState !== "resting") {
          activeNeuronCount += 1;
        }
        stateUpdates[candidate.entityId] = {
          ...candidate.current,
          state: nextState,
          activation: roundMetricValue(nextActivation),
          incomingExcitatory: roundMetricValue(candidate.excitatory),
          incomingInhibitory: roundMetricValue(candidate.inhibitory),
          refractoryRemaining: nextRefractory,
          lastFiredTick
        };
      }
      const nextStates = new Map(
        Object.entries(stateUpdates)
          .map(([entityId, value]): [string, NeuralNeuronState] | undefined =>
            isNeuralNeuronState(value) ? [entityId, value] : undefined
          )
          .filter((entry): entry is [string, NeuralNeuronState] => entry !== undefined)
      );

      const emitted = emitSignalsForFiring(
        [...firingSet],
        synapses,
        ctx.tick,
        params,
        remainingSignals.length,
        params.maxSignalQueueSize,
        excitationScale,
        inhibitionScale
      );
      const queued = [...remainingSignals, ...emitted.queue].sort(
        (left, right) => left.arrivalTick - right.arrivalTick || left.id.localeCompare(right.id)
      );
      const boundedQueue = queued.slice(0, params.maxSignalQueueSize);
      const droppedSignalCount = emitted.dropped + Math.max(0, queued.length - boundedQueue.length);
      const recent = nextRecentFiring(ctx.world.globals, ctx.tick, firingCount);
      const nextLargestComponent = largestActiveComponent(stateUpdates, synapses);
      const saturation = (firingCount + refractoryCount) / entityIds.length;
      const balance = excitationInhibitionBalance(totalExcitatory, totalInhibitory);
      const previousDecisionReadout = readNeuralDecisionReadout(ctx.world.globals);
      const decisionAssemblies =
        previousDecisionReadout.choices.length > 0 ? previousDecisionReadout.choices : createDecisionAssemblies(entityIds, params);
      const decisionReadout = computeDecisionReadout(params, decisionAssemblies, nextStates, previousDecisionReadout, ctx.tick);
      const choiceSwitched =
        isDecisionChoice(previousDecisionReadout.selected) &&
        isDecisionChoice(decisionReadout.selected) &&
        previousDecisionReadout.selected !== decisionReadout.selected;
      const decisionSwitchCount =
        Math.max(0, Math.floor(finiteGlobal(ctx.world.globals[neuralDecisionSwitchCountGlobalKey], 0))) + (choiceSwitched ? 1 : 0);
      const rpsReadout = computeRpsReadout(params, decisionReadout, ctx.rng.fork("neural:rpsOpponent"));
      const decisionActivationByChoice = decisionActivationsByChoice(decisionReadout.choices);

      ctx.commands.setComponents(NeuralNeuronStateComponent, stateUpdates, "neural activation update");
      ctx.commands.setGlobal(neuralSignalQueueGlobalKey, boundedQueue, "neural bounded delayed signal queue");
      ctx.commands.setGlobal(neuralRecentFiringGlobalKey, recent, "neural recent firing window");
      ctx.commands.setGlobal(neuralDecisionReadoutGlobalKey, decisionReadout, "neural bounded decision readout");
      ctx.commands.setGlobal(neuralRpsReadoutGlobalKey, rpsReadout, "neural observational RPS readout");
      ctx.commands.setGlobal(neuralDecisionSwitchCountGlobalKey, decisionSwitchCount, "neural selected readout switch count");
      ctx.commands.setGlobal("neuralDecisionSelectedCode", decisionStateCode(decisionReadout.selected), "neural selected readout code");
      ctx.commands.setGlobal("neuralDecisionConfidence", decisionReadout.confidence, "neural decision confidence");
      ctx.commands.setGlobal("neuralDecisionWinnerMargin", decisionReadout.winnerMargin, "neural decision winner margin");
      ctx.commands.setGlobal("neuralDecisionConflictScore", decisionReadout.conflictScore, "neural decision conflict score");
      ctx.commands.setGlobal("neuralDecisionRockActivation", decisionActivationByChoice.rock, "neural rock output activation");
      ctx.commands.setGlobal("neuralDecisionPaperActivation", decisionActivationByChoice.paper, "neural paper output activation");
      ctx.commands.setGlobal("neuralDecisionScissorsActivation", decisionActivationByChoice.scissors, "neural scissors output activation");
      ctx.commands.setGlobal("neuralRpsPayoff", rpsReadout.payoff, "neural observational RPS payoff");
      ctx.commands.setGlobal("neuralRpsOutcomeCode", rpsOutcomeCode(rpsReadout.outcome), "neural observational RPS outcome code");
      ctx.commands.setGlobal("neuralFiringCount", firingCount, "neural firing count");
      ctx.commands.setGlobal("neuralActiveNeuronCount", activeNeuronCount, "neural active neuron count");
      ctx.commands.setGlobal("neuralRefractoryCount", refractoryCount, "neural refractory count");
      ctx.commands.setGlobal("neuralInhibitedCount", inhibitedCount, "neural inhibited count");
      ctx.commands.setGlobal("neuralSignalQueueSize", boundedQueue.length, "neural signal queue size");
      ctx.commands.setGlobal("neuralDroppedSignalCount", droppedSignalCount, "neural dropped signal count");
      ctx.commands.setGlobal("neuralExternalStimulusCount", externalStimulusCount, "neural external stimulus count");
      ctx.commands.setGlobal("neuralCascadeSize", recent.reduce((sum, item) => sum + item.count, 0), "neural cascade size");
      ctx.commands.setGlobal("neuralSynchronyScore", roundMetricValue(firingCount / Math.max(1, firingLimit)), "neural synchrony score");
      ctx.commands.setGlobal("neuralExcitationInhibitionBalance", balance, "neural excitation inhibition balance");
      ctx.commands.setGlobal("neuralLargestActiveComponent", nextLargestComponent, "neural largest active component");
      ctx.commands.setGlobal("neuralNetworkSaturation", roundMetricValue(saturation), "neural network saturation");
      ctx.performance.recordCounter("neuralDueSignals", dueSignals.length);
      ctx.performance.recordCounter("neuralEmittedSignals", emitted.queue.length);
      ctx.performance.recordCounter("neuralSignalQueueSize", boundedQueue.length);
      ctx.performance.recordCounter("neuralDroppedSignals", droppedSignalCount);
      ctx.performance.recordCounter("neuralFiringCount", firingCount);
    }
  };
}

function neuralExcitationMetrics(): MetricDefinition[] {
  return [
    {
      key: "activeNeuronCount",
      id: "activeNeuronCount",
      label: "Active neurons",
      description: "Neurons not in resting state. Metrics are model-output history, not empirical neural recordings.",
      valueType: "integer",
      displayUnit: "neurons",
      range: { min: 0 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 0,
      displayFormat: "integer",
      collect(world) {
        return Number(world.globals.neuralActiveNeuronCount ?? countNeuralStates(world, (state) => state.state !== "resting"));
      }
    },
    {
      key: "firingRate",
      id: "firingRate",
      label: "Firing rate",
      description: "Fraction of neurons firing this tick. Activation is a model variable, not measured membrane voltage.",
      valueType: "number",
      range: { min: 0, max: 1 },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "derived",
      precision: 3,
      displayFormat: "percent",
      collect(world) {
        const total = world.entitiesWith([NeuralNeuronStateComponent]).length;
        const firing = Number(world.globals.neuralFiringCount ?? countNeuralStates(world, (state) => state.state === "firing"));
        return total === 0 ? 0 : firing / total;
      }
    },
    {
      key: "averageActivation",
      id: "averageActivation",
      label: "Average activation",
      description: "Mean stylized activation across neurons; not measured membrane voltage.",
      valueType: "number",
      range: { min: 0, max: maxActivation },
      supportsHistory: true,
      comparableAcrossRuns: true,
      source: "modelState",
      precision: 3,
      displayFormat: "decimal",
      collect(world) {
        const states = neuralStates(world);
        return states.length === 0 ? 0 : mean(states.map((state) => state.activation));
      }
    },
    numberGlobalMetric("cascadeSize", "Cascade size", "Recent firing events over a bounded propagation interval. Outputs are model behavior, not neuroscience evidence.", "neuralCascadeSize"),
    numberGlobalMetric(
      "synchronyScore",
      "Synchrony score",
      "Stylized same-tick firing concentration relative to the saturation guard; not a biological synchrony measurement.",
      "neuralSynchronyScore",
      { min: 0, max: 1 },
      "percent"
    ),
    numberGlobalMetric(
      "excitationInhibitionBalance",
      "Excitation/inhibition balance",
      "Share of delivered input that was excitatory this tick; synapse weights are abstract influence strengths.",
      "neuralExcitationInhibitionBalance",
      { min: 0, max: 1 },
      "decimal"
    ),
    numberGlobalMetric("signalQueueSize", "Signal queue size", "Delayed signals currently retained in the bounded runtime queue.", "neuralSignalQueueSize"),
    numberGlobalMetric("refractoryCount", "Refractory neurons", "Neurons in refractory cooldown after firing.", "neuralRefractoryCount"),
    numberGlobalMetric("inhibitedCount", "Inhibited neurons", "Neurons whose visible state is inhibited by stronger inhibitory input this tick.", "neuralInhibitedCount"),
    numberGlobalMetric(
      "largestActiveComponent",
      "Largest active component",
      "Largest weak component among active neurons in this template-owned runtime graph.",
      "neuralLargestActiveComponent"
    ),
    numberGlobalMetric(
      "networkSaturation",
      "Network saturation",
      "Fraction of neurons firing or refractory. Activation and synchrony are stylized runtime variables, not biological measurements.",
      "neuralNetworkSaturation",
      { min: 0, max: 1 },
      "percent"
    ),
    numberGlobalMetric(
      "outputRockActivation",
      "Output Rock activation",
      "Output assembly activation for the Rock label. Decision metrics are model-output readouts from labeled neuron groups, not evidence of reasoning.",
      "neuralDecisionRockActivation",
      { min: 0, max: maxActivation },
      "decimal"
    ),
    numberGlobalMetric(
      "outputPaperActivation",
      "Output Paper activation",
      "Output assembly activation for the Paper label. Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network.",
      "neuralDecisionPaperActivation",
      { min: 0, max: maxActivation },
      "decimal"
    ),
    numberGlobalMetric(
      "outputScissorsActivation",
      "Output Scissors activation",
      "Output assembly activation for the Scissors label. Decision Readout V1 maps labeled output assemblies to bounded categorical choices.",
      "neuralDecisionScissorsActivation",
      { min: 0, max: maxActivation },
      "decimal"
    ),
    numberGlobalMetric(
      "decisionSelectedCode",
      "Selected readout code",
      "Numeric code for selected readout: 0 undecided, 1 rock, 2 paper, 3 scissors, 4 conflicted. It is not cognition or reasoning.",
      "neuralDecisionSelectedCode"
    ),
    numberGlobalMetric(
      "decisionConfidence",
      "Readout confidence",
      "Bounded activation-gap score for the selected readout. Decision metrics are model-output readouts from labeled neuron groups, not evidence of reasoning.",
      "neuralDecisionConfidence",
      { min: 0, max: 1 },
      "percent"
    ),
    numberGlobalMetric(
      "decisionWinnerMargin",
      "Readout winner margin",
      "Activation gap between the highest and second-highest output assemblies.",
      "neuralDecisionWinnerMargin",
      { min: 0, max: maxActivation },
      "decimal"
    ),
    numberGlobalMetric(
      "decisionSwitchCount",
      "Readout switch count",
      "Deterministic count of selected readout changes between Rock, Paper, and Scissors choices.",
      neuralDecisionSwitchCountGlobalKey
    ),
    numberGlobalMetric(
      "rpsPayoff",
      "Observational RPS payoff",
      "RPS payoff is observational and does not train, mutate synapses, or adapt the core neural graph in V1.",
      "neuralRpsPayoff",
      { min: -1, max: 1 },
      "decimal"
    )
  ];
}

function numberGlobalMetric(
  key: string,
  label: string,
  description: string,
  globalKey: string,
  range: { min?: number; max?: number } = { min: 0 },
  displayFormat: "integer" | "decimal" | "percent" = "integer"
): MetricDefinition {
  return {
    key,
    id: key,
    label,
    description,
    valueType: displayFormat === "integer" ? "integer" : "number",
    range,
    supportsHistory: true,
    comparableAcrossRuns: true,
    source: "derived",
    precision: displayFormat === "integer" ? 0 : 3,
    displayFormat,
    collect(world) {
      const value = world.globals[globalKey];
      return typeof value === "number" && Number.isFinite(value) ? value : 0;
    }
  };
}

interface GeneratedNeuron {
  id: string;
  label: string;
  x: number;
  y: number;
  state: NeuralNeuronState;
}

function createNeurons(params: NeuralParams, rng: RandomStream): GeneratedNeuron[] {
  const groupCount = neuralGroupCount(params.neuronCount, params.networkTopology);
  const centers = groupCenters(groupCount);
  return Array.from({ length: params.neuronCount }, (_, index) => {
    const groupIndex = index % groupCount;
    const groupId = `cluster-${groupIndex + 1}`;
    const position = initialNeuronPosition(index, params.neuronCount, params.networkTopology, centers[groupIndex] ?? { x: 50, y: 50 }, rng);
    const threshold = clamp(params.globalThreshold + (rng.float() * 2 - 1) * params.thresholdVariance, 0.05, 6);
    const baseline = clamp(params.baselineExcitability * (0.75 + rng.float() * 0.5), 0, 0.75);
    return {
      id: neuralNeuronId(index),
      label: `Neuron ${index + 1}`,
      x: position.x,
      y: position.y,
      state: {
        groupId,
        state: "resting",
        activation: 0,
        threshold: roundMetricValue(threshold),
        incomingExcitatory: 0,
        incomingInhibitory: 0,
        refractoryRemaining: 0,
        baselineExcitability: roundMetricValue(baseline),
        lastFiredTick: -1
      }
    };
  });
}

function initialNeuronPosition(
  index: number,
  neuronCount: number,
  topology: NeuralTopology,
  center: { x: number; y: number },
  rng: RandomStream
): { x: number; y: number } {
  if (topology === "smallWorld" || topology === "ring") {
    const angle = (index / neuronCount) * Math.PI * 2;
    const radius = topology === "ring" ? 38 : 30 + (index % 5) * 1.8;
    return {
      x: clamp(50 + Math.cos(angle) * radius, 4, 96),
      y: clamp(50 + Math.sin(angle) * radius, 4, 96)
    };
  }
  if (topology === "clustered") {
    return {
      x: clamp(center.x + (rng.float() * 2 - 1) * 12, 4, 96),
      y: clamp(center.y + (rng.float() * 2 - 1) * 12, 4, 96)
    };
  }
  return { x: 5 + rng.float() * 90, y: 5 + rng.float() * 90 };
}

function groupCenters(groupCount: number): { x: number; y: number }[] {
  return Array.from({ length: groupCount }, (_, index) => {
    const angle = (index / groupCount) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(angle) * 28, y: 50 + Math.sin(angle) * 28 };
  });
}

function neuralGroupCount(neuronCount: number, topology: NeuralTopology): number {
  if (topology === "random" || topology === "ring") {
    return Math.min(4, Math.max(2, Math.floor(neuronCount / 32)));
  }
  return Math.min(5, Math.max(2, Math.round(Math.sqrt(neuronCount) / 2)));
}

function generateSynapses(neurons: readonly GeneratedNeuron[], params: NeuralParams, rng: RandomStream): NeuralSynapse[] {
  const pairs =
    params.networkTopology === "clustered"
      ? clusteredPairs(neurons, params, rng)
      : params.networkTopology === "smallWorld"
        ? smallWorldPairs(neurons, params, rng)
        : params.networkTopology === "ring"
          ? ringPairs(neurons, params)
          : randomPairs(neurons, params, rng);
  return materializeSynapses(pairs, neurons, params, rng);
}

function randomPairs(neurons: readonly GeneratedNeuron[], params: NeuralParams, rng: RandomStream): NeuralEdgePair[] {
  const pairs: NeuralEdgePair[] = [];
  for (let sourceIndex = 0; sourceIndex < neurons.length; sourceIndex += 1) {
    for (let targetIndex = 0; targetIndex < neurons.length; targetIndex += 1) {
      if (sourceIndex === targetIndex) {
        continue;
      }
      if (rng.bool(params.connectionDensity)) {
        pairs.push({ sourceIndex, targetIndex });
        if (pairs.length >= maxSynapseCount) {
          return pairs;
        }
      }
    }
  }
  return pairs;
}

function clusteredPairs(neurons: readonly GeneratedNeuron[], params: NeuralParams, rng: RandomStream): NeuralEdgePair[] {
  const pairs: NeuralEdgePair[] = [];
  const withinProbability = clamp(params.connectionDensity * 1.85, 0.02, 0.75);
  const betweenProbability = clamp(params.connectionDensity * 0.28, 0.001, 0.12);
  for (let sourceIndex = 0; sourceIndex < neurons.length; sourceIndex += 1) {
    for (let targetIndex = 0; targetIndex < neurons.length; targetIndex += 1) {
      if (sourceIndex === targetIndex) {
        continue;
      }
      const sourceGroup = neurons[sourceIndex]?.state.groupId;
      const targetGroup = neurons[targetIndex]?.state.groupId;
      const probability = sourceGroup === targetGroup ? withinProbability : betweenProbability;
      if (rng.bool(probability)) {
        pairs.push({ sourceIndex, targetIndex });
        if (pairs.length >= maxSynapseCount) {
          return pairs;
        }
      }
    }
  }
  return pairs;
}

function smallWorldPairs(neurons: readonly GeneratedNeuron[], params: NeuralParams, rng: RandomStream): NeuralEdgePair[] {
  const localSpan = Math.max(1, Math.min(neurons.length - 1, Math.round(params.connectionDensity * (neurons.length - 1))));
  const rewireProbability = clamp(params.connectionDensity * 1.2, 0.03, 0.42);
  const pairs: NeuralEdgePair[] = [];
  const seen = new Set<string>();
  for (let sourceIndex = 0; sourceIndex < neurons.length; sourceIndex += 1) {
    for (let offset = 1; offset <= localSpan; offset += 1) {
      let targetIndex = (sourceIndex + offset) % neurons.length;
      if (rng.bool(rewireProbability)) {
        targetIndex = randomTargetIndex(sourceIndex, neurons.length, seen, rng) ?? targetIndex;
      }
      addPair(pairs, seen, sourceIndex, targetIndex);
      if (pairs.length >= maxSynapseCount) {
        return pairs;
      }
    }
  }
  return pairs;
}

function ringPairs(neurons: readonly GeneratedNeuron[], params: NeuralParams): NeuralEdgePair[] {
  const localSpan = Math.max(1, Math.min(4, Math.round(params.connectionDensity * 16)));
  const pairs: NeuralEdgePair[] = [];
  const seen = new Set<string>();
  for (let sourceIndex = 0; sourceIndex < neurons.length; sourceIndex += 1) {
    for (let offset = 1; offset <= localSpan; offset += 1) {
      addPair(pairs, seen, sourceIndex, (sourceIndex + offset) % neurons.length);
    }
  }
  return pairs;
}

function materializeSynapses(
  pairs: readonly NeuralEdgePair[],
  neurons: readonly GeneratedNeuron[],
  params: NeuralParams,
  rng: RandomStream
): NeuralSynapse[] {
  const shuffled = rng.shuffle(pairs.map((_, index) => index));
  const excitatoryCount = Math.round(pairs.length * params.excitatoryRatio);
  const excitatoryIndices = new Set(shuffled.slice(0, excitatoryCount));
  return pairs
    .map((pair, index) => {
      const source = neurons[pair.sourceIndex];
      const target = neurons[pair.targetIndex];
      if (!source || !target) {
        throw new SimulationValidationError("Neural synapse pair references missing neuron");
      }
      const kind: NeuralSynapseKind = excitatoryIndices.has(index) ? "excitatory" : "inhibitory";
      const variance = (rng.float() * 2 - 1) * params.weightVariance;
      const weight = clamp(params.averageSynapseWeight + variance, 0.01, 3);
      const delayTicks = rng.int(params.signalDelayMin, params.signalDelayMax);
      return {
        id: `synapse-${source.id}-to-${target.id}`,
        sourceId: source.id,
        targetId: target.id,
        kind,
        weight: roundMetricValue(weight),
        delayTicks,
        enabled: true
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function addPair(pairs: NeuralEdgePair[], seen: Set<string>, sourceIndex: number, targetIndex: number): void {
  if (sourceIndex === targetIndex) {
    return;
  }
  const key = `${sourceIndex}->${targetIndex}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  pairs.push({ sourceIndex, targetIndex });
}

function randomTargetIndex(sourceIndex: number, length: number, seen: ReadonlySet<string>, rng: RandomStream): number | undefined {
  for (let attempt = 0; attempt < Math.min(16, length * 2); attempt += 1) {
    const targetIndex = rng.int(0, length - 1);
    if (targetIndex !== sourceIndex && !seen.has(`${sourceIndex}->${targetIndex}`)) {
      return targetIndex;
    }
  }
  return undefined;
}

function initialActiveNeuronIds(entityIds: readonly string[], params: NeuralParams, rng: RandomStream): string[] {
  const count = Math.min(entityIds.length, Math.floor(entityIds.length * params.initialActiveRatio));
  if (count <= 0) {
    return [];
  }
  return rng.shuffle(entityIds).slice(0, count).sort((left, right) => left.localeCompare(right));
}

function createDecisionAssemblies(entityIds: readonly string[], params: NeuralParams): NeuralDecisionAssembly[] {
  if (!params.decisionReadoutEnabled) {
    return [];
  }
  const sorted = [...entityIds].sort((left, right) => left.localeCompare(right));
  const assemblySize = Math.max(1, Math.min(maxDecisionAssemblySize, Math.floor(sorted.length / 12)));
  const outputIds = sorted.slice(-assemblySize * neuralDecisionChoices.length);
  return neuralDecisionChoices.map((choice, index) => {
    const neuronIds = outputIds.slice(index * assemblySize, (index + 1) * assemblySize);
    if (neuronIds.length === 0) {
      throw new SimulationValidationError(`Neural Decision Readout output assembly ${choice} cannot be empty`);
    }
    return {
      id: `decision-output-${choice}`,
      label: titleCaseChoice(choice),
      choice,
      neuronIds,
      activation: 0
    };
  });
}

function computeDecisionReadout(
  params: NeuralParams,
  assemblies: readonly NeuralDecisionAssembly[],
  states: ReadonlyMap<string, NeuralNeuronState>,
  previous: NeuralDecisionReadout,
  tick: number
): NeuralDecisionReadout {
  if (!params.decisionReadoutEnabled) {
    return disabledDecisionReadout(params);
  }
  const scoredAssemblies = validateAndScoreDecisionAssemblies(assemblies, states, params, tick);
  const byActivation = [...scoredAssemblies].sort(
    (left, right) => right.activation - left.activation || left.choice.localeCompare(right.choice)
  );
  const top = byActivation[0];
  const second = byActivation[1];
  if (!top || !second) {
    throw new SimulationValidationError("Neural Decision Readout requires three bounded output assemblies");
  }
  const winnerMargin = roundMetricValue(Math.max(0, top.activation - second.activation));
  const selected: NeuralDecisionState =
    top.activation < params.decisionThreshold
      ? "undecided"
      : winnerMargin <= params.decisionMargin
        ? "conflicted"
        : top.choice;
  const selectedAssemblyId = isDecisionChoice(selected) ? top.id : "";
  const confidence = roundMetricValue(clamp(winnerMargin / Math.max(params.decisionThreshold, top.activation, firingEpsilon), 0, 1));
  const conflictScore = roundMetricValue(clamp(second.activation / Math.max(top.activation, firingEpsilon), 0, 1));
  const decisionTick = isDecisionChoice(selected)
    ? previous.selected === selected && previous.decisionTick >= 0
      ? previous.decisionTick
      : tick
    : -1;
  return {
    enabled: true,
    mode: "rockPaperScissors",
    choices: scoredAssemblies,
    selected,
    selectedAssemblyId,
    confidence,
    winnerMargin,
    conflictScore,
    threshold: params.decisionThreshold,
    margin: params.decisionMargin,
    windowTicks: params.decisionWindowTicks,
    decisionTick,
    boundaryNote: decisionReadoutBoundary
  };
}

function validateAndScoreDecisionAssemblies(
  assemblies: readonly NeuralDecisionAssembly[],
  states: ReadonlyMap<string, NeuralNeuronState>,
  params: NeuralParams,
  tick: number
): NeuralDecisionAssembly[] {
  const choices = new Set<NeuralDecisionChoice>();
  const scored = assemblies.map((assembly) => {
    if (!isDecisionChoice(assembly.choice)) {
      throw new SimulationValidationError(`Invalid Neural Decision Readout choice: ${String(assembly.choice)}`);
    }
    if (choices.has(assembly.choice)) {
      throw new SimulationValidationError(`Duplicate Neural Decision Readout choice: ${assembly.choice}`);
    }
    choices.add(assembly.choice);
    if (assembly.neuronIds.length === 0) {
      throw new SimulationValidationError(`Neural Decision Readout output assembly ${assembly.choice} cannot be empty`);
    }
    if (assembly.neuronIds.length > maxDecisionAssemblySize) {
      throw new SimulationValidationError(`Neural Decision Readout output assembly ${assembly.choice} exceeds its bounded V1 size`);
    }
    let totalActivation = 0;
    for (const neuronId of assembly.neuronIds) {
      const state = states.get(neuronId);
      if (!state) {
        throw new SimulationValidationError(`Neural Decision Readout assembly ${assembly.choice} references missing neuron ${neuronId}`);
      }
      const recentFiringBoost = state.lastFiredTick >= 0 && tick - state.lastFiredTick < params.decisionWindowTicks ? state.threshold : 0;
      totalActivation += clamp(state.activation + recentFiringBoost, 0, maxActivation);
    }
    return {
      ...assembly,
      activation: roundMetricValue(totalActivation / assembly.neuronIds.length)
    };
  });
  for (const choice of neuralDecisionChoices) {
    if (!choices.has(choice)) {
      throw new SimulationValidationError(`Neural Decision Readout is missing ${choice} output assembly`);
    }
  }
  return scored.sort((left, right) => neuralDecisionChoices.indexOf(left.choice) - neuralDecisionChoices.indexOf(right.choice));
}

function computeRpsReadout(params: NeuralParams, decision: NeuralDecisionReadout, rng: RandomStream): NeuralRpsReadout {
  const opponentChoice = params.opponentChoiceMode === "seededRandom" ? rng.choice([...neuralDecisionChoices]) : params.fixedOpponentChoice;
  if (!params.decisionReadoutEnabled || !isDecisionChoice(decision.selected)) {
    return {
      enabled: params.decisionReadoutEnabled,
      networkChoice: decision.selected,
      opponentChoice,
      outcome: "none",
      payoff: 0,
      boundaryNote: rpsPayoffBoundary
    };
  }
  const outcome = rpsOutcome(decision.selected, opponentChoice);
  return {
    enabled: true,
    networkChoice: decision.selected,
    opponentChoice,
    outcome,
    payoff: rpsPayoff(outcome),
    boundaryNote: rpsPayoffBoundary
  };
}

function rpsOutcome(networkChoice: NeuralDecisionChoice, opponentChoice: NeuralDecisionChoice): NeuralRpsOutcome {
  if (networkChoice === opponentChoice) {
    return "draw";
  }
  if (
    (networkChoice === "rock" && opponentChoice === "scissors") ||
    (networkChoice === "paper" && opponentChoice === "rock") ||
    (networkChoice === "scissors" && opponentChoice === "paper")
  ) {
    return "win";
  }
  return "loss";
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

function initialDecisionReadout(params: NeuralParams, assemblies: readonly NeuralDecisionAssembly[]): NeuralDecisionReadout {
  if (!params.decisionReadoutEnabled) {
    return disabledDecisionReadout(params);
  }
  return {
    enabled: true,
    mode: "rockPaperScissors",
    choices: [...assemblies].map((assembly) => ({ ...assembly, neuronIds: [...assembly.neuronIds], activation: 0 })),
    selected: "undecided",
    selectedAssemblyId: "",
    confidence: 0,
    winnerMargin: 0,
    conflictScore: 0,
    threshold: params.decisionThreshold,
    margin: params.decisionMargin,
    windowTicks: params.decisionWindowTicks,
    decisionTick: -1,
    boundaryNote: decisionReadoutBoundary
  };
}

function disabledDecisionReadout(params: NeuralParams): NeuralDecisionReadout {
  return {
    enabled: false,
    mode: "rockPaperScissors",
    choices: [],
    selected: "undecided",
    selectedAssemblyId: "",
    confidence: 0,
    winnerMargin: 0,
    conflictScore: 0,
    threshold: params.decisionThreshold,
    margin: params.decisionMargin,
    windowTicks: params.decisionWindowTicks,
    decisionTick: -1,
    boundaryNote: decisionReadoutBoundary
  };
}

function initialRpsReadout(params: NeuralParams): NeuralRpsReadout {
  return {
    enabled: params.decisionReadoutEnabled,
    networkChoice: "undecided",
    opponentChoice: params.fixedOpponentChoice,
    outcome: "none",
    payoff: 0,
    boundaryNote: rpsPayoffBoundary
  };
}

function decisionActivationsByChoice(assemblies: readonly NeuralDecisionAssembly[]): Record<NeuralDecisionChoice, number> {
  return {
    rock: assemblies.find((assembly) => assembly.choice === "rock")?.activation ?? 0,
    paper: assemblies.find((assembly) => assembly.choice === "paper")?.activation ?? 0,
    scissors: assemblies.find((assembly) => assembly.choice === "scissors")?.activation ?? 0
  };
}

function decisionStateCode(state: NeuralDecisionState): number {
  if (state === "rock") {
    return 1;
  }
  if (state === "paper") {
    return 2;
  }
  if (state === "scissors") {
    return 3;
  }
  if (state === "conflicted") {
    return 4;
  }
  return 0;
}

function rpsOutcomeCode(outcome: NeuralRpsOutcome): number {
  if (outcome === "win") {
    return 1;
  }
  if (outcome === "loss") {
    return -1;
  }
  return 0;
}

function titleCaseChoice(choice: NeuralDecisionChoice): string {
  return choice.slice(0, 1).toUpperCase() + choice.slice(1);
}

function emitSignalsForFiring(
  firingIds: readonly string[],
  synapses: readonly NeuralSynapse[],
  tick: number,
  params: NeuralParams,
  currentQueueSize: number,
  maxQueueSize: number,
  excitationScale = 1,
  inhibitionScale = 1
): { queue: NeuralSignal[]; dropped: number } {
  const remainingCapacity = Math.max(0, maxQueueSize - currentQueueSize);
  if (remainingCapacity <= 0 || firingIds.length === 0) {
    return { queue: [], dropped: outgoingSynapses(firingIds, synapses).length };
  }
  const firing = new Set(firingIds);
  const signals: NeuralSignal[] = [];
  let dropped = 0;
  let sequence = 0;
  for (const synapse of synapses) {
    if (!synapse.enabled || !firing.has(synapse.sourceId)) {
      continue;
    }
    if (signals.length >= remainingCapacity) {
      dropped += 1;
      continue;
    }
    const scale = synapse.kind === "excitatory" ? excitationScale : inhibitionScale;
    signals.push({
      id: `signal-${tick}-${synapse.id}-${sequence}`,
      sourceId: synapse.sourceId,
      targetId: synapse.targetId,
      kind: synapse.kind,
      amount: roundMetricValue(synapse.weight * scale),
      arrivalTick: tick + synapse.delayTicks
    });
    sequence += 1;
  }
  return { queue: signals, dropped };
}

function outgoingSynapses(firingIds: readonly string[], synapses: readonly NeuralSynapse[]): NeuralSynapse[] {
  const firing = new Set(firingIds);
  return synapses.filter((synapse) => synapse.enabled && firing.has(synapse.sourceId));
}

function initialNeuralRuntimeGlobals(
  params: NeuralParams,
  synapses: readonly NeuralSynapse[],
  signalQueue: readonly NeuralSignal[],
  initialActiveCount = 0,
  decisionAssemblies: readonly NeuralDecisionAssembly[] = []
): Record<string, JsonValue> {
  const decisionReadout = initialDecisionReadout(params, decisionAssemblies);
  const activations = decisionActivationsByChoice(decisionReadout.choices);
  return {
    [neuralSynapsesGlobalKey]: [...synapses],
    [neuralSignalQueueGlobalKey]: [...signalQueue],
    [neuralDecisionReadoutGlobalKey]: decisionReadout,
    [neuralRpsReadoutGlobalKey]: initialRpsReadout(params),
    [neuralRecentFiringGlobalKey]: initialActiveCount > 0 ? [{ tick: 0, count: initialActiveCount }] : [],
    [neuralExternalStimulusGlobalKey]: true,
    [neuralExcitationScaleGlobalKey]: 1,
    [neuralInhibitionScaleGlobalKey]: 1,
    [neuralMaxSignalQueueSizeGlobalKey]: params.maxSignalQueueSize,
    [neuralDecisionSwitchCountGlobalKey]: 0,
    neuralDecisionSelectedCode: 0,
    neuralDecisionConfidence: 0,
    neuralDecisionWinnerMargin: 0,
    neuralDecisionConflictScore: 0,
    neuralDecisionRockActivation: activations.rock,
    neuralDecisionPaperActivation: activations.paper,
    neuralDecisionScissorsActivation: activations.scissors,
    neuralRpsPayoff: 0,
    neuralRpsOutcomeCode: 0,
    neuralInitialActiveCount: initialActiveCount,
    neuralFiringCount: initialActiveCount,
    neuralActiveNeuronCount: initialActiveCount,
    neuralRefractoryCount: initialActiveCount,
    neuralInhibitedCount: 0,
    neuralSignalQueueSize: signalQueue.length,
    neuralDroppedSignalCount: 0,
    neuralExternalStimulusCount: 0,
    neuralCascadeSize: initialActiveCount,
    neuralSynchronyScore: 0,
    neuralExcitationInhibitionBalance: 0.5,
    neuralLargestActiveComponent: initialActiveCount,
    neuralNetworkSaturation: initialActiveCount / Math.max(1, params.neuronCount),
    neuralRuntimeBoundary:
      "This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable."
  };
}

function nextRecentFiring(globals: Record<string, JsonValue>, tick: number, firingCount: number): NeuralRecentFiringRecord[] {
  const previous = readRecentFiring(globals);
  return [...previous.filter((entry) => tick - entry.tick < cascadeWindowTicks), { tick, count: firingCount }];
}

function readRecentFiring(globals: Record<string, JsonValue>): NeuralRecentFiringRecord[] {
  const value = globals[neuralRecentFiringGlobalKey];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecentFiringRecord).sort((left, right) => left.tick - right.tick);
}

function readNeuralSynapses(globals: Record<string, JsonValue>): NeuralSynapse[] {
  const value = globals[neuralSynapsesGlobalKey];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isNeuralSynapse).sort((left, right) => left.id.localeCompare(right.id));
}

function readSignalQueue(globals: Record<string, JsonValue>): NeuralSignal[] {
  const value = globals[neuralSignalQueueGlobalKey];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isNeuralSignal).sort((left, right) => left.arrivalTick - right.arrivalTick || left.id.localeCompare(right.id));
}

export function readNeuralDecisionReadout(globals: Record<string, JsonValue>): NeuralDecisionReadout {
  const value = globals[neuralDecisionReadoutGlobalKey];
  if (!isNeuralDecisionReadout(value)) {
    return disabledDecisionReadout(neuralExcitationParams(Object.fromEntries(parameterDefinitions.map((definition) => [definition.key, definition.defaultValue]))));
  }
  return {
    ...value,
    choices: value.choices.map((assembly) => ({ ...assembly, neuronIds: [...assembly.neuronIds] }))
  };
}

function validateNeuralExcitationWorld(world: WorldView): void {
  const field = world.continuous2D(NEURAL_EXCITATION_SPACE_ID);
  const network = world.network(NEURAL_EXCITATION_NETWORK_ID);
  if (!field || !network) {
    throw new SimulationValidationError("Neural Excitation world must include continuous field and runtime network spaces");
  }
  const entityIds = world.entitiesWith([Position2D, NeuralNeuronStateComponent]);
  if (entityIds.length === 0 || entityIds.length > 250) {
    throw new SimulationValidationError("Neural Excitation world must contain 1 to 250 neuron entities");
  }
  for (const entityId of entityIds) {
    const position = world.getComponent<{ x: number; y: number }>(entityId, Position2D);
    const state = world.getComponent<NeuralNeuronState>(entityId, NeuralNeuronStateComponent);
    if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
      throw new SimulationValidationError(`Invalid Position2D component on ${entityId}`);
    }
    if (!isNeuralNeuronState(state)) {
      throw new SimulationValidationError(`Invalid NeuralNeuronState component on ${entityId}`);
    }
    if (!field.getPosition(entityId)) {
      throw new SimulationValidationError(`Neural neuron ${entityId} is missing from continuous field`);
    }
    if (!network.getLocation(entityId)) {
      throw new SimulationValidationError(`Neural neuron ${entityId} is missing from runtime network`);
    }
  }
  validateSynapses(readNeuralSynapses(world.globals), new Set(entityIds));
  const queue = readSignalQueue(world.globals);
  const maxQueue = finiteGlobal(world.globals[neuralMaxSignalQueueSizeGlobalKey], 5000);
  if (queue.length > maxQueue || queue.length > 5000) {
    throw new SimulationValidationError("Neural signal queue exceeds its bounded V1 limit");
  }
  validateDecisionReadoutGlobal(world.globals[neuralDecisionReadoutGlobalKey], new Set(entityIds));
}

function validateDecisionReadoutGlobal(value: JsonValue | undefined, entityIds: ReadonlySet<string>): void {
  if (!isNeuralDecisionReadout(value)) {
    throw new SimulationValidationError("Neural Decision Readout global is malformed");
  }
  if (!value.enabled) {
    return;
  }
  validateAndScoreDecisionAssemblies(value.choices, new Map([...entityIds].map((entityId) => [entityId, blankDecisionState()])), {
    ...neuralExcitationParams(Object.fromEntries(parameterDefinitions.map((definition) => [definition.key, definition.defaultValue]))),
    decisionReadoutEnabled: true
  }, 0);
}

function validateSynapses(synapses: readonly NeuralSynapse[], entityIds: ReadonlySet<string>): void {
  const ids = new Set<string>();
  const pairs = new Set<string>();
  for (const synapse of synapses) {
    if (ids.has(synapse.id)) {
      throw new SimulationValidationError(`Duplicate neural synapse id: ${synapse.id}`);
    }
    ids.add(synapse.id);
    if (!entityIds.has(synapse.sourceId) || !entityIds.has(synapse.targetId)) {
      throw new SimulationValidationError(`Neural synapse ${synapse.id} references missing endpoint`);
    }
    if (synapse.sourceId === synapse.targetId) {
      throw new SimulationValidationError(`Neural synapse ${synapse.id} uses an unsupported self-loop`);
    }
    const pair = `${synapse.sourceId}->${synapse.targetId}`;
    if (pairs.has(pair)) {
      throw new SimulationValidationError(`Duplicate neural synapse endpoint pair: ${pair}`);
    }
    pairs.add(pair);
  }
}

function largestActiveComponent(stateUpdates: Record<string, ComponentValue>, synapses: readonly NeuralSynapse[]): number {
  const active = new Set(
    Object.entries(stateUpdates)
      .filter(([, value]) => {
        const state = value as NeuralNeuronState;
        return state.state === "firing" || state.state === "charging" || state.state === "inhibited" || state.activation >= state.threshold * 0.5;
      })
      .map(([entityId]) => entityId)
  );
  if (active.size === 0) {
    return 0;
  }
  const adjacency = new Map<string, string[]>();
  for (const entityId of active) {
    adjacency.set(entityId, []);
  }
  for (const synapse of synapses) {
    if (!synapse.enabled || !active.has(synapse.sourceId) || !active.has(synapse.targetId)) {
      continue;
    }
    adjacency.get(synapse.sourceId)?.push(synapse.targetId);
    adjacency.get(synapse.targetId)?.push(synapse.sourceId);
  }
  const visited = new Set<string>();
  let largest = 0;
  for (const entityId of [...active].sort((left, right) => left.localeCompare(right))) {
    if (visited.has(entityId)) {
      continue;
    }
    let size = 0;
    const stack = [entityId];
    visited.add(entityId);
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }
      size += 1;
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
    largest = Math.max(largest, size);
  }
  return largest;
}

function neuralStates(world: WorldView): NeuralNeuronState[] {
  return world
    .entitiesWith([NeuralNeuronStateComponent])
    .map((entityId) => world.getComponent<NeuralNeuronState>(entityId, NeuralNeuronStateComponent))
    .filter(isNeuralNeuronState);
}

function countNeuralStates(world: WorldView, predicate: (state: NeuralNeuronState) => boolean): number {
  return neuralStates(world).filter(predicate).length;
}

function excitationInhibitionBalance(excitatory: number, inhibitory: number): number {
  const total = excitatory + inhibitory;
  if (total <= 0) {
    return 0.5;
  }
  return roundMetricValue(excitatory / total);
}

function isNeuralTopology(value: string): value is NeuralTopology {
  return value === "random" || value === "clustered" || value === "smallWorld" || value === "ring";
}

function isDecisionChoice(value: unknown): value is NeuralDecisionChoice {
  return value === "rock" || value === "paper" || value === "scissors";
}

function isDecisionState(value: unknown): value is NeuralDecisionState {
  return value === "undecided" || value === "conflicted" || isDecisionChoice(value);
}

function isOpponentChoiceMode(value: unknown): value is NeuralOpponentChoiceMode {
  return value === "fixed" || value === "seededRandom";
}

function isNeuralNeuronState(value: unknown): value is NeuralNeuronState {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as NeuralNeuronState;
  return (
    typeof candidate.groupId === "string" &&
    (candidate.state === "resting" ||
      candidate.state === "charging" ||
      candidate.state === "firing" ||
      candidate.state === "refractory" ||
      candidate.state === "inhibited") &&
    finiteInRange(candidate.activation, 0, maxActivation) &&
    finiteInRange(candidate.threshold, 0.01, 10) &&
    finiteInRange(candidate.incomingExcitatory, 0, Number.POSITIVE_INFINITY) &&
    finiteInRange(candidate.incomingInhibitory, 0, Number.POSITIVE_INFINITY) &&
    Number.isInteger(candidate.refractoryRemaining) &&
    candidate.refractoryRemaining >= 0 &&
    finiteInRange(candidate.baselineExcitability, 0, 1) &&
    Number.isInteger(candidate.lastFiredTick)
  );
}

function isNeuralSynapse(value: unknown): value is NeuralSynapse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as NeuralSynapse;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.sourceId === "string" &&
    typeof candidate.targetId === "string" &&
    (candidate.kind === "excitatory" || candidate.kind === "inhibitory") &&
    finiteInRange(candidate.weight, 0.000_001, 10) &&
    Number.isInteger(candidate.delayTicks) &&
    candidate.delayTicks >= 1 &&
    candidate.delayTicks <= 20 &&
    typeof candidate.enabled === "boolean"
  );
}

function isNeuralSignal(value: unknown): value is NeuralSignal {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as NeuralSignal;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.sourceId === "string" &&
    typeof candidate.targetId === "string" &&
    (candidate.kind === "excitatory" || candidate.kind === "inhibitory") &&
    finiteInRange(candidate.amount, 0, 100) &&
    Number.isInteger(candidate.arrivalTick) &&
    candidate.arrivalTick >= 0
  );
}

function isNeuralDecisionReadout(value: unknown): value is NeuralDecisionReadout {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as NeuralDecisionReadout;
  return (
    typeof candidate.enabled === "boolean" &&
    candidate.mode === "rockPaperScissors" &&
    Array.isArray(candidate.choices) &&
    candidate.choices.every(isNeuralDecisionAssembly) &&
    isDecisionState(candidate.selected) &&
    typeof candidate.selectedAssemblyId === "string" &&
    finiteInRange(candidate.confidence, 0, 1) &&
    finiteInRange(candidate.winnerMargin, 0, maxActivation) &&
    finiteInRange(candidate.conflictScore, 0, 1) &&
    finiteInRange(candidate.threshold, 0.1, 5) &&
    finiteInRange(candidate.margin, 0, 2) &&
    Number.isInteger(candidate.windowTicks) &&
    candidate.windowTicks >= 1 &&
    candidate.windowTicks <= 20 &&
    Number.isInteger(candidate.decisionTick) &&
    typeof candidate.boundaryNote === "string"
  );
}

function isNeuralDecisionAssembly(value: unknown): value is NeuralDecisionAssembly {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as NeuralDecisionAssembly;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    isDecisionChoice(candidate.choice) &&
    Array.isArray(candidate.neuronIds) &&
    candidate.neuronIds.every((id) => typeof id === "string") &&
    finiteInRange(candidate.activation, 0, maxActivation)
  );
}

function isRecentFiringRecord(value: unknown): value is NeuralRecentFiringRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as NeuralRecentFiringRecord;
  return Number.isInteger(candidate.tick) && candidate.tick >= 0 && Number.isInteger(candidate.count) && candidate.count >= 0;
}

function blankDecisionState(): NeuralNeuronState {
  return {
    groupId: "decision-validation",
    state: "resting",
    activation: 0,
    threshold: 1,
    incomingExcitatory: 0,
    incomingInhibitory: 0,
    refractoryRemaining: 0,
    baselineExcitability: 0,
    lastFiredTick: -1
  };
}

function assertRange(value: number, key: string, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new SimulationValidationError(`Invalid Neural Excitation parameters: ${key} must be between ${min} and ${max}`);
  }
}

function finiteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function finiteGlobal(value: JsonValue | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundMetricValue(value: number): number {
  return Number(value.toFixed(6));
}

function neuralNeuronId(index: number): string {
  return `neuron-${String(index + 1).padStart(3, "0")}`;
}
