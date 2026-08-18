# ORTUS Scientific Model And Evidence Contracts

Status: CURRENT epistemic and scientific source of truth after A0B

ORTUS is an exploratory complex-systems modeling sandbox. It can establish what specified mechanisms do inside a specified model under specified conditions. It does not automatically establish what caused, will cause, or should be done about a real system.

## Claims Ladder

These are separate claims requiring separate evidence:

```text
model structure
  != runtime support
  != successful execution
  != robust modeled behavior
  != empirical validation
  != causal proof
  != policy authority
```

Also:

- Same modeled pattern does not establish the same mechanism.
- Prediction does not establish explanation.
- Statistical relation does not establish causation.
- Parameter manipulation in a model is not a real-world causal intervention.
- Camera zoom is not scientific scale.
- A learned latent variable is not automatically a natural entity.
- A cluster is not automatically an emergent scale.
- A visually compelling pattern is not proof of emergence, robustness, intelligence, or truth.

## Model And World

A model is a deliberately limited representation. It has chosen entities or state variables, boundaries, processes, schedules, parameters, omissions, and abstractions. Simulation output is evidence about that model's behavior. Applying it to the world additionally requires relevant data, provenance, measurement semantics, calibration, validation, alternatives, and domain review.

`SimulationTemplate`, future `ModelDefinition`, and future `RuntimePlan` describe modeled machinery. None is a copy of reality. The entity/component/system engine is a computational substrate, not a claim that all real systems consist of agents or that every visible entity corresponds to a natural kind.

Template documentation and assumption profiles must state what is represented, what is omitted, and what use is unsupported. A source citation can motivate a model; it does not validate ORTUS's implementation.

## Observation Is Not Presentation

Current snapshots and projections have operational purposes:

- A `SimulationSnapshotView` is a detached broad read model for rendering and inspection; it omits RNG and queued-event state.
- A validated `SnapshotExport` preserves exact continuation/export state.
- A `RenderFramePacket` supplies ephemeral Canvas data.
- A `UIProjection` supplies coarse current semantic/UI data.
- Runtime metrics are numeric model outputs.

None is automatically a scientific observation. Future `CanonicalObservation` must identify at least the source run/model/version, modeled time, collection method, selected variables/entities, sampling cadence, aggregation, omissions, measurement or proxy status, noise/loss transformations, uncertainty, and provenance. It must distinguish simulated state from synthetic, measured, partial, noisy, proxy, or empirical observations.

Visual latest-value coalescing is allowed only for audited presentation channels. Scientific observations and evidence cannot inherit dropped-frame semantics by convenience. A presentation publication id is not research provenance.

## Representation As Hypothesis

A representation is a way to describe evidence, not a verdict embedded in a graph.

- `SystemViewSpec` states entity/relation semantics and relevant scale/lens/regime scope.
- `ScaleSpec` states effective resolution or degrees of freedom and may be multidimensional or partially ordered.
- `LensSpec` states an analytical/descriptive representation over observations.
- `RegimeSpec` states where a dynamical characterization is claimed to apply.
- `ViewDerivation` records the method and provenance used to construct a result.
- `RepresentationArtifact` is the concrete result for identified observations.
- `EvidenceReport` records evidence for, against, and missing.
- `CandidateAssessment` records an independent evaluation.
- `ViewMapping` states how views relate, including loss, uncertainty, and intervention realization where supported.

The canonical future topology is a SystemView graph, not a universal micro/meso/macro hierarchy and not a mandatory `Scale x Lens x Regime` cube. Existing multi-scale structural services remain historical/current service artifacts, not scientific proof or runtime scale support.

Hard separation:

```text
research question
  -> candidate representation
  -> derivation over identified observations
  -> representation artifact
  -> evidence report
  -> independent candidate assessment
```

Candidate generation is not validation. Automatic methods may eventually propose candidates. Independent evaluators must assess them. A generator must never certify its own output.

## Research Workflow And Provenance

The planned research flow is:

```text
CanonicalObservation + ResearchContext
  -> candidate SystemViews / ViewDerivations
  -> RepresentationArtifacts
  -> EvidenceReports
  -> CandidateAssessments
  -> alternatives and identifiability analysis
  -> ViewMappings
  -> World / Lab / Atlas presentation
```

`ExperimentSpec` describes a reproducible investigation design. `Investigation` ties questions, configurations, runs, observations, derivations, artifacts, alternatives, evidence, and assessments into one provenance-bearing lifecycle. A planned `ClaimRecord` may record an interpretation, but it must include scope, status, evidence links, counterevidence, alternatives, limitations, and invalidation. It is not model state and cannot activate runtime behavior.

Every evidence-bearing artifact needs stable identity, source versions, creation method, relevant configuration/seed, scope, and staleness rules. Derived output must become stale or invalid when a material source, method, mapping, or assumption changes. Copying an artifact must not silently present old provenance as current.

## Identifiability And Alternatives

ORTUS must preserve competing plausible explanations. Aggregate or visual similarity can be produced by different mechanisms; one fit does not identify the generating mechanism. Future research tooling must support at least these semantic assessment outcomes. These labels are contracts, not an implemented enum:

- `SUPPORTED_WITHIN_MODEL_SCOPE`
- `REJECTED_WITHIN_MODEL_SCOPE`
- `INCONCLUSIVE`
- `UNIDENTIFIABLE` or `NON_IDENTIFIABLE`

Supported means the stated candidate survived a stated evaluation within model/evidence scope; rejected means it did not. Inconclusive means available evidence cannot decide under the stated method. `UNIDENTIFIABLE` is a legitimate result and a stronger statement: competing explanations cannot be distinguished from the available evidence and assumptions. None of these dispositions validates or rejects a real-world mechanism without an external empirical argument. Uncertainty, sparse support, incompatible alternatives, and sensitivity to assumptions should remain visible.

## Causality And Intervention

Network edges, feedback labels, temporal order, correlations, observations, runtime metrics, and successful perturbations do not establish real-world causality by themselves. Current causal-assumption artifacts are structural declarations. Current template interventions are validated model perturbations.

An intervention response supports only a statement of the form: under this model, configuration, seed/ensemble, intervention definition, and observation method, the modeled output changed in the reported way. It does not establish treatment effect, policy effectiveness, safety, optimality, or transfer to a real system.

Future causal claims require explicit assumptions, intervention semantics, competing structures, identifiability conditions, evidence, and independent validation. Discovery, do-calculus, structural equation solving, and intervention optimization are not current capabilities.

## Uncertainty, Robustness, And Validation

Seed or parameter ensembles explore modeled sensitivity. User-selected ranges are assumptions unless calibrated. Ensemble frequencies are not calibrated probabilities by default. A single successful run is not robustness; persistence on screen is not resilience; a prepared comparison is not a controlled empirical experiment.

Scientific validation requires an explicit target, measurement model, provenance-bearing data, evaluation method, held-out or otherwise independent evidence where appropriate, uncertainty treatment, and documented failure criteria. Software schema validation means an input is structurally accepted. It does not mean a model or conclusion is scientifically valid.

## Human And Social Modeling Boundary

Social and cognitive descriptors are stylized bounded variables, not human minds. Current Opinion social learning is template-owned numeric/symbolic dynamics. Current Neural excitation/readout/adaptation is a stylized template and local game-state slice. Neither supports human prediction, beliefs/intentions inference, personality, diagnosis, consciousness, biological validity, or real-person reconstruction.

ORTUS must not provide infrastructure for:

- real-person profiling or psychological diagnosis;
- protected-class inference or stereotype encoding without explicit ethical review and scientific necessity;
- persuasion optimization or microtargeting;
- operational targeting or hidden recommendation/control objectives;
- unbounded biographies, memory, documents, embeddings, or model weights as agent state;
- LLM-per-agent or hidden LLM-generated simulation runtime.

Information-source labels are display/model labels, not identity, protected-class, credibility truth, recommender, or targeting fields. Crowd exposure should generally use bounded aggregate signals or representative structure rather than disposable pseudo-persons.

## Execution And Adapter Safety

- No arbitrary user code, formulas, scripts, function bodies, `eval`, or dynamic model modules.
- No hidden schema interpreter or visual graph execution.
- No research adapter authority over engine state, RNG, scheduling, or mutation.
- No unsupported capability activated by artifact attachment.
- No external framework compatibility claim without an implemented, tested adapter.
- No renderer, UI, candidate generator, or report writer may become the authority for scientific truth.

Capability absence should fail closed or remain visibly absent. Product language must not simulate scientific authority the runtime and evidence cannot support.

## Long-Term Research Separation

The System Discovery program is PLANNED research only. Its ordering preserves independent evidence and evaluation:

1. SD1 research observation/export.
2. SD2 trusted research adapters.
3. SD3 candidate/evidence model.
4. SD4 synthetic benchmarks with known ground truth.
5. SD5 scale inference.
6. SD6 regime inference.
7. SD7 lens inference.
8. SD8 effective dynamics and memory.
9. SD9 intervention/causal validation.
10. SD10 learned scale.
11. SD11 learned lens/relation.
12. SD12 joint SystemView search.
13. SD13 explorer.

No SD capability, discovery algorithm, research adapter, or CanonicalObservation implementation is created by A0 or A0B.
