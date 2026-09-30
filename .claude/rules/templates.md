---
paths:
  - "src/simulation/templates/**"
  - "src/simulation/socialLearning/**"
  - "src/components/NeuralRuntimeLabPanel.tsx"
  - "src/components/neuralRuntimeLab.ts"
---

# Template-specific rules

AGENTS.md sections 4–6 set the general invariants. Each template's assumption profile must stay consistent with these rules; tests assert several of the profile phrases.

## Neural Excitation Network
- A stylized runtime network model. It is not a biological brain, neuron, cognitive, consciousness, clinical, seizure, connectome, neuroscience-evidence, or mental-health model. Activation is a model variable, not membrane voltage. Synapse weights are abstract influence strengths. There are no ion channels, neurotransmitters, morphology, plasticity, STDP, backpropagation, or real brain regions.
- Its runtime graph belongs only to this template. It never generalizes into Builder-graph, schema, network-artifact, or generic graph execution, or into template generation.
- State stays bounded, deterministic, numeric or symbolic, and validated: no unbounded signal queues, documents, embeddings, external calls, or biological data imports. Metrics are model-output history, not neural recordings.
- Interventions are template-defined perturbations through the executor or command buffer. There is no clinical control, persuasion optimization, or selected-synapse control without an explicit selectable-edge contract and audit.
- Decision Readout maps labelled output assemblies to bounded categorical choices, and its metrics are readouts. Rock-Paper-Scissors labels are assigned by the model designer; the network understands none of them. RPS payoff is observational and never trains, mutates synapses, or updates biological fields.
- Strategy adaptation is local RPS/readout game-state adaptation only. Learned state stays local, bounded, resettable, and non-persistent. The reset-learned-strategy and clear-round-history controls stay visible, and reset never rehydrates old history or suppresses new rounds. Explanations are metric- and snapshot-derived and never anthropomorphic. Never claim the readout beats truly random play over time, and never generalize adaptation into generic adaptive agents, social learning, strategy runtime, or schema or Builder execution.
- Neural Runtime Lab stays scenario-first and scientifically honest, keeps Advanced config reachable, bounds timelines and histories, and scopes direct actions to supported interventions or explicit fresh-run rebuilds.

## Opinion Dynamics social learning
- The `socialLearning` behavior mode is a stylized, template-owned runtime mode, not human cognition. Social-learning semantic artifacts are not executed by it, and the global `socialLearningRuntime` primitive stays reserved unless an audited registry change adds template-specific nuance.
- Opinion values and metrics are model outputs, not measured beliefs. Source credibility is a model parameter, not a truth score. Source labels are display labels only, never identity, profiling, targeting, or truth-scoring fields.
- State stays bounded, numeric or symbolic, deterministic, and validated. No source payloads, documents, biographies, embeddings, model weights, misinformation detection, recommendation, targeting, or persuasion logic. Crowd and stranger exposure is modeled as aggregate signals or representative agents, and background initialization is compressed prior seeding, not life history.

## Forest Fire / Landscape Spread
- It is not wildfire prediction or GIS, weather, wind, humidity, terrain, suppression, or firefighting modeling, and not calibrated fire behavior or operational fire safety. Probabilities are model parameters.
- Grid boundaries and cell positions are implementation geometry, not `BoundaryEnvironmentModel` or `SpatialFieldModel` runtime support. Hot-loop optimizations are template implementation details.
- The `firebreak-corridor` preset is a bounded template-owned initialization arrangement using existing empty-cell state and spread mechanics. It does not imply environmental-field, suppression, terrain, or safety support.

## Flocking
- Flocking is the only Worker-capable template; see `runtime-worker.md` for the neighbor-execution compatibility rules. The alignment lens is a model-output view, not measured animal coordination.
