# ORTUS Research Capability Map

> **THIS IS A CONCEPTUAL / RESEARCH REFERENCE.**
>
> Current capability truth: [`docs/CAPABILITIES.md`](../CAPABILITIES.md)
> Architecture authority: [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)
> Scientific contracts: [`docs/SCIENTIFIC_MODEL.md`](../SCIENTIFIC_MODEL.md)
> Roadmap sequencing: [`docs/ROADMAP.md`](../ROADMAP.md)

This document organizes research questions, representation choices, method families, evidence requirements, and failure modes discussed for ORTUS. It is not a fifth roadmap, a capability registry, an implementation promise, or evidence that a named algorithm is suitable. When this reference and a canonical source differ, the canonical source controls.

Names such as `ModelDefinition`, `RuntimePlan`, `CanonicalObservation`, `ResearchContext`, `ExperimentSpec`, `Investigation`, and `SystemViewSpec` describe architectural or research directions unless [`CAPABILITIES.md`](../CAPABILITIES.md) explicitly says they exist. Existing structural service primitives are not automatically executed by templates. A valid artifact is not necessarily runnable; a runnable model is not necessarily calibrated or validated.

## How To Read This Map

Every research area is evaluated through the same chain:

```text
question
  -> representation and method family
  -> explicit estimator or execution contract
  -> held-out / cross-seed / intervention evidence
  -> failure and alternative explanations
  -> bounded claim
```

Shared standards:

| Standard | Required interpretation |
| --- | --- |
| Runtime support | Earned by identified model-family/template execution and tests, never inferred from schema, registry presence, UI, or a service primitive. |
| Reproducibility | Seed, RNG stream, ordering, schedule, initialization, implementation version, parameters, intervention, observation policy, and numerical method must be recoverable at the required fidelity. |
| Evidence | A result must name its input observations, derivation, estimator, uncertainty, comparison set, and scope. Render frames are not scientific evidence records. |
| Falsification | Every candidate representation or claim needs a test that could reject it, produce an inconclusive result, or expose non-identifiability. |
| Separation of roles | Candidate generators propose. Independent evaluators assess. Product surfaces present; they do not define scientific ontology or mutate runtime authority. |
| Status | `docs/CAPABILITIES.md` alone answers what currently executes or persists. This map uses future language for everything else. |
| Safety | No protected-class inference, real-person profiling, persuasion/microtargeting, operational targeting, arbitrary code execution, or hidden LLM runtime mutation. |

## Capability Relationships

```text
MODEL PLANE                        RESEARCH PLANE
ModelDefinition (future)           ResearchContext (future)
  -> RuntimePlan (future)             -> ExperimentSpec (future)
  -> authoritative execution          -> runs + CanonicalObservations (future)
  -> events / snapshots                -> derivations + representations
                                        -> evidence + assessments + claims

EXPERIENCE PLANE
World      live modeled system and bounded interaction
Workshop   construction / decomposition / remix
Lab        durable investigation and scientific memory
Atlas      map of questions, representations, evidence, alternatives, findings
Guides     structured learning and investigation
```

The experience plane may request model or research operations through explicit contracts. It must not define engine rules, relabel UI projections as observations, or certify scientific claims.

## A. Model Construction + Simulation

**Scientific purpose.** Make executable assumptions explicit enough that another implementation can reproduce, inspect, test, and challenge them. The central distinction is:

```text
ModelDefinition != RuntimePlan
```

A `ModelDefinition` would state scientific structure and supported configuration. A `RuntimePlan` would resolve that structure into an executable schedule, implementation choices, memory layout, solvers, RNG streams, and observation hooks. Neither object is implemented merely because this distinction is documented.

| Construction concern | Representation direction | Evidence and failure tests |
| --- | --- | --- |
| Entities and state | Typed entity kinds, bounded component/state definitions, identity and lifecycle rules | Initialization invariants, lifecycle tests, state bounds, forbidden-state rejection |
| Processes and interactions | Named, ordered rules with declared read/write sets and model-time semantics | Reference trajectories, order-perturbation tests, conservation/bound checks |
| Relations | Typed weighted/directed or higher-order participation, with provenance | Topology invariants, edge/event identity, no causal inference from adjacency alone |
| Events and schedules | Explicit clocks, event queues, priorities, cancellation, delays, and stopping rules | Same-seed replay, tie-order tests, queue bounds, missed/duplicate-event tests |
| Constraints and boundaries | State constraints, admissible transitions, geometry, boundary exchange, external forcings | Boundary-condition benchmarks, invariant checks, mass/entity accounting |
| Spaces and fields | Discrete/continuous spaces, coordinate systems, interpolation/discretization contracts | Resolution and convergence studies; synthetic fields never relabeled as observations |
| Resources, stocks, and flows | Quantities, ownership, transfer, production/consumption, conservation or leakage | Balance equations, unit consistency, conservation residuals, explicit open-system terms |
| Ports, interfaces, couplings | Typed inputs/outputs, cadence, transformation, authority, and failure behavior | Contract tests, latency/order tests, dimension checks, coupling stability |
| Clocks and timescales | Model time, wall-clock scheduling, event time, solver step, sampling cadence | Clock-separation tests, multi-rate error studies, replay independent of wall-clock jitter |
| Quantities, units, dimensions | Explicit quantity semantics rather than labels or slider ranges | Dimensional checks, conversion tests, no physical-time claim without mapping |
| Observation models | Observable/latent distinction, sampling, censoring, proxy, noise, missingness | Recovery on synthetic truth, bias/coverage studies, provenance-preserving loss disclosure |
| Model forms | ABM, grid, network, field, reaction, event, hybrid, and coupled families | Family-specific reference problems and differential tests |
| Interventions | Template/model-family-defined admissible commands with targets, timing, and discard semantics | Executor/command-buffer tests, intervention identity, baseline comparison, no UI mutation |
| Composition | Explicit capability-compatible coupling, not attached metadata or graph appearance | Interface checks, scheduling tests, stability, no bypass of component limitations |

Deterministic execution requires more than a single seed. ORTUS must make RNG stream partitioning, entity and relation iteration order, event priority, floating-point reduction order, initialization, intervention timing, and implementation version explicit. Reference implementations should favor auditability and direct scientific correspondence. Optimized implementations may use spatial indexes, packed arrays, workers, vectorization, or accelerated kernels only when differential tests and performance evidence show that semantics remain within the declared numerical contract.

A future `CapabilityManifest` should report required and provided runtime capabilities at model-family and instantiated-model scope. It must not infer support from a schema field, UI control, structural registry entry, or globally available service. Complexity evidence should identify asymptotic expectations, observed scale ranges, hardware/browser context, memory growth, packet sizes, and degradation policy. A fast animation is not performance evidence.

**Dependencies and surfaces.** Workshop would author/decompose definitions; the model plane would validate and resolve plans; World would run them; Lab would retain protocol and result provenance. Current hand-built template/runtime truth remains exactly what [`CAPABILITIES.md`](../CAPABILITIES.md) states.

## B. Model Families

**Scientific purpose.** Reuse a small number of well-audited computational bases across many scientific definitions and product-facing worlds.

```text
few reusable model families
  + many ModelDefinitions
  + many hook worlds
```

A **model family** defines executable mathematical/computational semantics. A **hook family** packages a compelling phenomenon, question, and visual language. `Flocking`, `fireflies`, or `phantom traffic` may be hooks; mobile local-interaction agents, coupled oscillators, and car-following/event systems are computational families. Sharing a theme does not imply sharing runtime semantics.

Potential hooks include flocking/schooling, fireflies, ant pheromone trails, slime-mold-like search, animal pattern formation, phantom traffic, queues, contagion, cascades, ecosystems, cooperation/competition, self-organization, and tipping points. This list is research/product vocabulary, not a claim that ORTUS currently implements those systems.

| Model family | Typical primitives and algorithms | Questions / validation targets | Example hooks, not capability claims |
| --- | --- | --- | --- |
| Mobile local-interaction agents | Continuous position/velocity, neighbor index, bounded steering, collisions | Coordination, segregation, transport; compare against reference neighbor search and known limits | flocking, schooling, pedestrian flow, traffic |
| Grids / cellular automata | Cells, neighborhoods, synchronous/asynchronous updates, boundary rules | Propagation, percolation, pattern persistence; exact small-grid trajectories and finite-size studies | fires, neighborhoods, excitable media |
| Spatial interacting populations | Movement, local contact, birth/death, competition, resource coupling | Invasion, coexistence, spatial correlation; mean-field limits and spatial benchmarks | contagion, ecosystems, cooperation |
| Static networks | Typed nodes/edges, network-local state updates, graph processes | Cascades, diffusion, synchronization; graph invariants and analytical special cases | contagion, opinion, signal cascades |
| Coupled oscillators | Phase/amplitude, coupling graph/kernel, integration | Entrainment, synchronization, phase locking; analytical limits and solver convergence | fireflies, rhythmic systems |
| Continuous fields | Mesh/grid/basis, PDE operators, boundary conditions, solvers | Transport, waves, diffusion; manufactured solutions and convergence | temperature, chemical fields, flow context |
| Reaction-diffusion | Species fields, reaction terms, diffusion, numerical integration | Pattern formation and stability; linear analysis and discretization studies | animal patterns, morphogenesis-inspired systems |
| Agent-field coupling | Agent sampling/deposition plus field evolution | Chemotaxis, trail following, resource feedback; mass balance and coupled convergence | ant trails, slime-mold-like search |
| Adaptive/temporal networks | Edge events, rewiring, time-stamped topology, coevolution | Feedback between state and relation; temporal null models and topology provenance | adaptive cooperation, changing contacts |
| Reaction networks | Species/counts, stoichiometry, deterministic or stochastic kinetics | Pathways, oscillation, extinction; conservation and Gillespie/ODE benchmarks | chemistry/ecology motifs |
| Event-driven systems | Queues, events, service policies, resources, priorities | Congestion, waiting, cascades; queueing special cases and event-order tests | queues, supply chains, failure propagation |
| Hybrid systems | Discrete modes plus continuous/agent dynamics and guards | Switching, safety envelopes, mixed-timescale behavior; guard and solver consistency | infrastructure, ecological management |
| Multi-timescale systems | Explicit fast/slow processes, averaging or multirate integration | Effective dynamics and lag; scale-separation and error studies | adaptation, seasonal ecology, control |

Failure modes include one bespoke engine per world, visual theme being mistaken for model ontology, shared parameter names masking different semantics, and a family API so generic that it becomes an untestable hidden interpreter. Family expansion should proceed through narrow reference models and independent audits, not through a universal formula executor.

## C. Stochasticity, Heterogeneity + Uncertainty

These concepts must remain separate:

| Concept | Meaning | Required evidence |
| --- | --- | --- |
| **Stochasticity** | The modeled process contains random variables or events. | Reproducible RNG streams plus distributional checks across seeds. |
| **Heterogeneity** | Entities or contexts have persistent differences. | Provenance for assignment/distribution and tests that persistence behaves as specified. |
| **Parameter uncertainty** | The modeler is uncertain which value or distribution is appropriate. | Justified prior/range, sensitivity, calibration where possible, and uncertainty propagation. |
| **Observation noise** | Recorded measurement differs from modeled latent state. | Explicit observation model, bias/noise assumptions, and recovery/coverage tests. |
| **Seed ensemble** | Multiple realizations of an already stochastic model. | Sampling statement and interval/distribution summary; not parameter calibration. |

Stochastic mechanisms can enter initialization, persistent heterogeneity, process evolution, sensing, action, interaction occurrence, environmental variation, common shocks, or observation. Randomness may be independent or correlated across entity, space, time, and mechanism. Spatial covariance, temporally colored/persistent noise, state-dependent variance, shared latent factors, and rare shocks have different scientific meanings and should not collapse into interchangeable sliders.

One noise slider per parameter is the wrong target architecture because it hides where randomness acts and often changes the implied model. Progressive UI should move from:

```text
simple named noise control
  -> mechanism category (sensing / action / process / environment / observation)
  -> explicit distribution, correlation, cadence, and RNG stream
```

Validation should include fixed-seed trajectories, RNG stream isolation, distribution moments/quantiles, autocorrelation and spatial-correlation recovery, common-shock covariance, and sensitivity to stochastic-model choice. A visually varied run does not prove the stochastic mechanism is correct. World may expose simple mechanisms; Workshop may define them; Lab should own ensemble and uncertainty protocols.

## D. Experimental Science + Investigation

**Scientific purpose.** Turn curiosity into a reproducible protocol and then into a durable, revisable body of evidence.

```text
ResearchContext  = question, scope, assumptions, provenance, ethical boundary
ExperimentSpec   = protocol
Investigation    = durable scientific workflow and evolving context
```

These are future research-plane contracts, not current persisted objects.

An `ExperimentSpec` should declare hypotheses, manipulated and observed variables, controls, held-constant values, parameter domain, seed strategy, sampling policy, stopping rule, work budget, primary comparisons, uncertainty summary, and planned analysis. It must separate planned analyses from post-hoc exploration. A protocol can fail, be canceled, or return insufficient evidence without being silently rewritten.

An `Investigation` should organize questions, hypotheses, experiment versions, runs, observations, evidence and counterevidence, interpretations, failed experiments, contradictory findings, open questions, and candidate assessments. It should preserve why a run was performed and how a conclusion changed, rather than treating the latest chart as the truth.

**Evidence and falsification.** Reproduction uses fresh runtime instances and exact protocol provenance. Controls and baselines must be explicit. Stopping rules and exclusions should be recorded before execution where possible. Post-hoc analyses stay labeled. Contradictory and null results remain first-class. Reproducibility means another compatible implementation can repeat the declared protocol, not that one seed repeats on one machine.

World can execute bounded protocols; Lab is the intended durable investigation surface; Atlas can later relate questions and evidence across investigations. Current local Experiment and comparison tooling remains bounded model-output tooling, not a persisted `Investigation`.

## E. Canonical Observation + Provenance

The non-equivalence is foundational:

```text
SimulationSnapshot
  != RenderFramePacket
  != UIProjection
  != CanonicalObservation
```

- A `SimulationSnapshot` represents engine state at a modeled time and may or may not be exact continuation state depending on its contract.
- A `RenderFramePacket` is bounded presentation data and may be coalesced, interpolated, downsampled, or dropped.
- A `UIProjection` is a coarse task-oriented read model.
- A future `CanonicalObservation` would be a provenance-bearing scientific sample created under an explicit observation policy.

A canonical observation should carry durable run identity, model/plan/version identity, modeled time or window, sampling policy, observable definition, unit/quantity meaning, source state or event references, estimator/aggregation, missingness, precision/loss, intervention context, and observation-model provenance. `SystemEvent` and interaction participation should preserve multi-participant identity before any network projection. Environment observations and interventions need the same identity discipline.

Scientific evidence cannot inherit visual-frame coalescing. A renderer may drop intermediate packets for responsiveness; a canonical sampler must either record every required sample or declare the loss. Observation windows, cadence, trigger policy, burn-in, censoring, and versioning are part of the result. Durable run identity must distinguish restart, exact continuation, repeated configuration, derived view, and copied summary.

Validation includes exact sample-count/time tests, missing-window detection, version compatibility, source-to-observation traceability, loss accounting, and differential checks against engine state. World presents live projections; Lab would own durable observations; Atlas would reference rather than duplicate them.

## F. Evidence + Scientific Claims

The intended chain is:

```text
run
  -> CanonicalObservation
  -> ViewDerivation
  -> RepresentationArtifact
  -> EvidenceReport
  -> CandidateAssessment
  -> ClaimRecord / InterpretationRecord
```

| Object direction | Responsibility | Must not do |
| --- | --- | --- |
| `RepresentationArtifact` | Preserve a graph, field, trajectory embedding, regime partition, summary, or other view plus derivation provenance. | Pretend the representation is natural or uniquely correct. |
| `ViewDerivation` | Declare inputs, transformations, estimator, parameters, loss, and implementation version. | Hide filtering/coalescing or mutate the authoritative run. |
| `EvidenceReport` | Report a defined test, result, uncertainty, alternatives, and scope. | Promote a candidate automatically. |
| `CandidateAssessment` | Evaluate a candidate against independent criteria and competing candidates. | Let the candidate generator certify itself. |
| `ClaimRecord` / `InterpretationRecord` | State a bounded conclusion, supporting/opposing evidence, scope, author, and revision lineage. | Turn model evidence into empirical or policy authority. |

Assessment outcomes should include `SUPPORTED`, `REJECTED`, `INCONCLUSIVE`, and `NON_IDENTIFIABLE`, mapped carefully to the canonical terminology in [`SCIENTIFIC_MODEL.md`](../SCIENTIFIC_MODEL.md). Competing explanations are required whenever observations do not uniquely determine mechanism or representation.

Falsification asks what observation, held-out run, perturbation, null model, or alternative representation would weaken the claim. Candidate generation and candidate assessment should use separate data partitions and, where practical, separate implementations. A visually persuasive representation is not evidence of validity.

## G. Uncertainty Quantification + Sensitivity

**Questions.** Which conclusions vary with seed, parameter, model form, calibration, observation process, or numerical method? Which inputs dominate, and which interactions make local intuition unreliable?

Method families include seed-distribution summaries, local derivatives or finite differences, screening, Morris-style elementary effects, variance-based global sensitivity, Sobol-style decompositions, distributional/quantile sensitivity, uncertainty propagation, robust response surfaces, Bayesian or frequentist intervals where assumptions justify them, and explicit model-form ensembles.

Required distinctions:

- seed variability is not parameter uncertainty;
- assumed parameter ranges are not calibrated distributions;
- a confidence interval and credible interval answer different questions;
- robustness across chosen seeds/ranges is not real-world robustness;
- surrogate uncertainty must include emulator error;
- calibration uncertainty and model-form uncertainty do not disappear after selecting one fitted model.

Global sensitivity should precede flashy learned-discovery claims because a latent representation can look stable while merely encoding one dominant parameter or narrow training region. Validation should use independent seed sets, held-out parameter regions, convergence with sample count, estimator replication, interaction-effect checks, and sensitivity to parameter-distribution assumptions. Lab is the natural protocol/evidence surface; Atlas may later map sensitivity regions without calling them validated regimes.

## H. Scale

Scale means **effective degrees of freedom and resolution**, not camera zoom.

Scale can vary along partially ordered dimensions:

- spatial resolution;
- temporal resolution;
- entity resolution;
- state resolution;
- interaction resolution.

These do not necessarily form one micro-to-meso-to-macro ladder. One representation can be coarse in space but fine in state, or aggregate entities while retaining event timing. A future `ScaleSpec` should declare what is retained, aggregated, omitted, inferred, or synthesized.

Restriction/coarse-graining maps fine evidence to a coarser representation. Lifting maps coarse state to a distribution over compatible finer states; it is generally probabilistic and must label synthetic detail. Both require information-loss accounting. Emergent entities need lineage across time, including split/merge and overlapping collectives; a hard partition is not always scientifically defensible.

Candidate methods include spatial and trajectory clustering, community detection, metastability analysis, spectral/transfer-operator approaches, collective-variable search, information-bottleneck objectives, manifold learning, and learned latent dynamics. Evaluation asks:

| Criterion | Test direction |
| --- | --- |
| Closure | Can coarse state predict its evolution without repeatedly consulting omitted fine state? |
| Memory | How much history is required after coarse-graining? |
| Predictive sufficiency | Does the representation retain held-out future information relevant to the question? |
| Compression | How much complexity is reduced at an acceptable loss? |
| Cross-seed stability | Does a comparable representation recur across independent realizations? |
| Intervention consistency | Can admissible coarse interventions be realized and predict fine-model response? |
| Lineage | Are collective identities stable enough to track without forced one-to-one matching? |

Scale candidates are hypotheses. Synthetic disaggregation is not observation, aggregate metrics are not multi-scale runtime support, and camera controls remain presentation state. Scale work depends on canonical observations, derivation provenance, and independent assessment.

## I. Lens

A lens is a descriptive or analytical representation of the same modeled evidence. It does not mutate the simulation.

```text
CanonicalObservation(s)
  -> LensOperator
  -> RepresentationArtifact
```

| Lens family | Representation | Question and principal failure mode |
| --- | --- | --- |
| Spatial | Positions, densities, neighborhoods, spatial statistics | Where is structure? Sampling resolution or boundary effects can create artifacts. |
| Interaction network | Typed pairwise relations derived from actual interactions | Who interacted? Projection can erase timing, multiplicity, or context. |
| Higher-order / hypergraph | Multi-participant interaction events or groups | Does group participation matter beyond pairs? Sparse data can make order unidentifiable. |
| Information-flow | Lagged dependence or directed predictive information | Where does predictive dependence travel? Dependence is not causal effect. |
| Resource / flow | Stocks, transfers, paths, conservation residuals | How do quantities move? Missing flows can fabricate sinks/sources. |
| State-space | Trajectories, embeddings, recurrence, local dynamics | Which dynamical structures recur? Coordinate choice can manufacture separation. |
| Field | Sampled or estimated spatial/temporal fields | What continuous organization is useful? Interpolation can hide unsampled uncertainty. |
| Topological | Connectivity, holes, persistence, higher-order shape | Which structures survive scale changes? Metric and filtration choices dominate. |
| Causal-candidate | Explicit modeled graph or candidate abstraction | Which intervention relationships might hold? Observational fit cannot prove them. |
| Observation-dependent | Representation conditioned on sensor/proxy/sampling model | What can the declared observer recover? Results may be properties of measurement, not system. |

Lens selection should be justified by the research question, model structure, observability, and known estimator behavior. Competing lenses should be compared on predictive, descriptive, interventional, stability, and complexity criteria without forcing one universal view. Later learned lens discovery may propose graphs, coordinates, fields, or relations, but every result remains a candidate `RepresentationArtifact` with derivation provenance and held-out tests.

World can render a bounded lens for interaction. Lab should retain derivations and evidence. Atlas may compare lenses and alternatives. The current Flocking camera and Alignment lens are presentation controls, not this future scientific lens pipeline.

## J. Regime

A regime is a domain in time, state, parameter, or space where a particular dynamical characterization is applicable. It is not merely a time segment, cluster, or attractor synonym.

Possible regimes include stable modes, metastable regions, parameter phases, local spatial states, transient switching modes, and coexisting probabilistic memberships. Boundaries may be uncertain, path-dependent, or hysteretic. One trajectory may traverse regimes; one parameter point may support several outcomes depending on initialization and noise.

Candidate methods include changepoint detection, hidden/semi-Markov and switching dynamical models, metastability analysis, state-space clustering, order parameters, bifurcation/phase-transition analysis, local spatial segmentation, and probabilistic mode models. Evidence should test held-out likelihood/prediction, dwell-time behavior, boundary stability, cross-seed recurrence, null models, initialization dependence, and intervention response.

Failure modes include treating an arbitrary time window as a regime, naming a cluster after inspecting an attractive plot, erasing coexistence with hard assignments, and calling a sharp finite-size crossover a phase transition without scaling evidence. A future `RegimeSpec` should record domain, membership rule/probability, uncertainty, applicable dynamics, transition definition, and provenance.

## K. SystemViews

A `SystemView` is a scientific hypothesis about how modeled evidence should be represented for a question.

```text
SystemViewSpec
  -> ScaleSpec
  -> LensSpec
  -> RegimeSpec
  -> ViewMapping(s)
  -> RepresentationArtifact(s)
```

`scale x lens x regime` is a useful thinking aid, not a mandatory Cartesian cube. Scale, lens, and regime may be partly undefined, coupled, nested, overlapping, or discovered jointly. The canonical direction is a graph of explicit mappings among representations.

```text
[fine spatial agents, contact lens, transient regime]
           | restriction + declared loss
           v
[group entities, flow lens, metastable regime]
           | alternative mapping
           v
[field estimate, spatial lens, parameter domain]
```

`ViewMapping` should state source and target specs, derivation, invertibility or lifting distribution, loss, applicable domain, uncertainty, and evidence. Mappings may connect scales, lenses, regimes, or combinations. Representations can compete rather than form a single hierarchy.

Assessment asks whether a view is compressive, predictive, stable, interpretable enough for the task, and intervention-consistent. A complete-looking graph does not make a view correct or executable. Existing structural multi-scale services and camera modes do not implement SystemViews.

## L. Effective Dynamics + Memory

**Question.** After choosing a representation, can ORTUS describe its dynamics without replaying every omitted microscopic variable?

Reduced-order and coarse dynamics may be Markovian, approximately Markovian at a chosen lag, or explicitly non-Markovian. Coarse-graining generally produces memory and unresolved-variable noise. A Mori-Zwanzig-style interpretation separates projected dynamics, memory kernel, and orthogonal/unresolved forcing; it is a conceptual guide, not a commitment to one solver.

Method families include linear/nonlinear reduced-order models, state-space models, generalized Langevin or memory-kernel models, delay embeddings, sparse effective equations, equation-free/coarse-timestepper methods, operator approximations, and learned latent dynamics. Required tests include held-out multi-horizon prediction, residual autocorrelation, memory-order selection, stability, invariant/statistical reproduction, response to interventions, and comparison with simpler baselines.

Equation-free methods may estimate coarse evolution by lift -> run fine model -> restrict, but lifting uncertainty and healing time must be explicit. A discovered effective representation is not an automatic runtime replacement:

```text
discovered representation != validated coarse simulator
validated coarse simulator != authoritative replacement without a dedicated capability decision
```

Coarse simulation is warranted only after applicability, closure, error, memory, intervention, and provenance are validated for the claimed domain.

## M. Emergence

Emergence is not established by visual surprise, a cluster, or a multiscale label. ORTUS should treat emergence as a contested assessment over explicit criteria.

Candidate criteria include:

- persistence across a meaningful time window;
- compression relative to fine description;
- predictive autonomy or added macro-level predictive value;
- approximate effective closure;
- recurrence across runs or conditions;
- robustness within a declared model domain;
- relevance to admissible interventions;
- coherent entity lineage, including split/merge;
- consistency across compatible scale mappings.

No single criterion is sufficient in general. For example, a persistent cluster may be imposed by a boundary; a predictive aggregate may be a trivial conserved quantity; a robust pattern may disappear under a different observation model. Null models and alternative representations are essential.

An emergence assessment should declare candidate entity/pattern, observation and derivation, scale/lens/regime scope, criteria, thresholds, counterexamples, uncertainty, and outcome. `cluster found = emergent entity` is specifically rejected. Current visible patterns and runtime metrics are model outputs, not empirical proof of emergence.

## N. Networks + Higher-Order Structure

Network representations may be static, temporal, adaptive, multilayer, weighted, directed, signed where scientifically justified, or higher-order. The representation must distinguish persistent model topology from interactions observed during a run.

Important objects and operations:

- node/entity identity and lifecycle;
- relation type, direction, weight, uncertainty, and validity interval;
- temporal contact/event sequence;
- adaptive rewiring rule and state-topology feedback;
- layer identity and interlayer coupling;
- hyperedges or simplices for genuine multi-participant interactions;
- community/mesoscale candidates and their stability;
- propagation paths and relational provenance.

Raw multi-participant interactions should be preserved before pairwise projection. Converting one five-participant event into ten edges changes the object, dependence structure, and often inferred mechanism. Every projection should declare loss and duplicate/event weighting.

Method families include centrality and paths, communities/block models, temporal reachability, motif analysis, diffusion/cascade models, spectral methods, multilayer operators, hypergraph/simplicial methods, and dynamic topology models. Validation uses topology invariants, temporal null models, held-out edge/event prediction where relevant, sensitivity to projection/window choices, and comparison with non-network baselines.

Network edges are not causal edges. Communities are not social identities. Information propagation is not persuasion effectiveness. The current global network service does not grant network runtime support to templates; only explicit runtime use recorded by [`CAPABILITIES.md`](../CAPABILITIES.md) counts.

## O. Dynamical Systems Analysis

**Purpose.** Characterize modeled evolution, stability, transitions, recurrence, and response beyond single-run visual inspection.

| Question | Candidate methods | Evidence / common failure |
| --- | --- | --- |
| What states recur? | State-space reconstruction, recurrence analysis, attractor/metastability methods | Embedding and finite-data sensitivity; a cloud is not automatically an attractor. |
| Where does behavior change with parameters? | Continuation, bifurcation analysis, finite-size scaling, order parameters | Sparse sweeps can miss coexistence/hysteresis; finite systems blur transitions. |
| Do components synchronize? | Phase extraction, order parameters, cross-spectral/coherence measures | Common forcing and filtering can mimic coupling. |
| Are there oscillations? | Spectral analysis, autocorrelation, phase portraits, cycle detection | Trends and windowing can create apparent periodicity. |
| Is the system near criticality? | Susceptibility/correlation scaling, avalanche statistics, finite-size studies | Heavy tails or visual variability alone do not establish criticality. |
| Is a tipping point approaching? | Stability indicators, recovery rates, variance/autocorrelation, model-based forecasts | Early-warning indicators have false positives and require mechanism/domain evidence. |
| What delays or feedback matter? | Lag analysis, transfer functions, explicit loop perturbations | Lagged dependence and labels do not prove causal feedback. |
| Can fast and slow processes separate? | Singular perturbation, averaging, homogenization, multirate methods | Invalid scale separation produces biased effective dynamics. |

Analyses must declare sampling cadence, transient removal, state variables, metric/embedding, finite-size assumptions, noise model, and numerical error. Atlas may eventually map parameter regimes; Lab should own analyses and alternatives. Current charts do not implement this analytical suite.

## P. Information-Theoretic Analysis

Information-theoretic measures can quantify uncertainty and statistical dependence in modeled observations:

- entropy and entropy rate;
- mutual and conditional mutual information;
- predictive information;
- transfer entropy / directed predictive dependence;
- active information storage;
- multiscale information summaries;
- candidate collective-variable objectives.

These estimators require declared variables, discretization or density estimator, lag/window, conditioning set, bias correction, sample-size analysis, and uncertainty. High-dimensional estimation is fragile; finite-sample bias can dominate. Comparisons should include shuffled/surrogate nulls and estimator sensitivity.

Information flow is not causal effect. Transfer entropy can reflect common causes, omitted state, observation filtering, or synchronized clocks. A high-mutual-information latent variable is not a natural ontology. Information bottleneck or predictive-information objectives may generate candidate compressed representations, but independent predictive and intervention tests must assess them.

## Q. Topological / Geometric Analysis

Topological and geometric methods may reveal organization that is not captured by coordinates or pairwise summaries. Candidate directions include manifold structure, diffusion geometry, persistent homology and other TDA methods, geometric organization of state space, topological transitions, and higher-order organization.

A topology pipeline requires an explicit object and metric: raw system state, trajectory windows, interaction complexes, density fields, or learned embeddings are not interchangeable. Filtration, scale parameter, coefficient choices, temporal window, subsampling, and noise treatment must be provenance-bearing.

Evidence should include stability under perturbation/subsampling, synthetic benchmarks with known structure, null comparisons, cross-seed recurrence, held-out relation to prediction or intervention, and sensitivity to metric/embedding choices. A persistent feature is a mathematically persistent feature of a declared construction, not automatically a persistent real system entity. Topological transitions require more than changes in one visualization.

This work depends on canonical observations and representation derivations. It belongs primarily in Lab and Atlas; it must not become decorative geometry in World or an unsupported graph claim in Workshop.

## R. Causal + Intervention Analysis

ORTUS must distinguish modeled causal structure from causal claims about the world.

| Level | Question | Minimum test |
| --- | --- | --- |
| Modeled causal structure | What dependencies and intervention semantics are explicitly encoded by the model? | Source/model audit plus command-level intervention tests. |
| Causal candidate | Could one representation support an intervention-consistent abstraction of modeled dynamics? | Held-out interventions, alternative candidates, and confounding analysis. |
| Real-world causal claim | Does an intervention cause an effect in the represented external system? | Empirical identification, provenance, assumptions, validation, and domain-specific ethics beyond simulation alone. |

Three sufficiency tests should remain separate:

- **observational sufficiency:** the representation explains or predicts declared observational distributions;
- **predictive sufficiency:** it retains information needed for held-out future outcomes;
- **interventional sufficiency:** interventions expressible at the coarse/view level can be realized at the authoritative model level and reproduce response distributions within scope.

Intervention validation may compare do-like modeled perturbations, natural variation, and observational estimates, but model-internal intervention is not real-world randomization. Confounding can exist inside observational analyses of simulation output when omitted model state affects both candidate cause and outcome. Coarse interventions require explicit realization mappings; changing a macro label without a fine-level command is not an intervention.

Causal abstraction should test consistency across levels and interventions, not infer causality from network edges, feedback labels, transfer entropy, or predictive accuracy. ORTUS does not claim causal discovery, do-calculus, structural equation solving, treatment-effect validity, policy recommendation, or intervention optimization merely from structural causal descriptors.

## S. Prediction

Prediction targets may include short-horizon state, collective trajectories, regime transitions, tipping/failure events, and effective macro-dynamics. The target, horizon, observation set, loss, decision context, and baseline must be declared before evaluating performance.

Evidence requires train/validation/test separation where learning occurs, held-out seeds and parameter regions, time-respecting splits, calibration diagnostics, uncertainty coverage, baseline comparison, and degradation tests outside the training domain. For rare transitions, precision/recall, lead time, false-alarm cost, and event-definition uncertainty matter more than aggregate accuracy.

Prediction can be useful without explanation. Conversely, an appealing mechanism may predict poorly. ORTUS must preserve:

```text
prediction != explanation
```

A predictor trained on model output predicts that model distribution unless empirical validation says more. Latent-state prediction does not reveal beliefs, intentions, natural kinds, or causal mechanisms. World may show bounded forecasts only after a dedicated capability exists; Lab should own evaluation and calibration evidence.

## T. Calibration + Validation

Calibration estimates parameters or latent state under a model and observation contract. Validation tests whether model behavior is adequate for a declared purpose and domain. Neither turns a model into truth.

| Validation dimension | Question | Typical evidence |
| --- | --- | --- |
| Numerical | Does the implementation approximate its declared equations/rules? | Reference solutions, convergence, invariants, differential tests |
| Internal/model | Does behavior match known consequences and constraints of the model? | Analytical limits, synthetic benchmarks, unit/property tests |
| Cross-seed | Are claims stable across stochastic realizations? | Independent ensembles and uncertainty summaries |
| Held-out parameter/scenario | Does the claim survive outside fitted/explored configurations? | Predeclared holdouts and stress regions |
| Model form | Could a materially different model explain the same evidence? | Competing models, posterior/predictive checks, identifiability assessment |
| Empirical | Does the model reproduce relevant external data for a declared purpose? | Provenanced data, observation mapping, out-of-sample checks, domain review |

Calibration methods may include optimization, likelihood-free/simulation-based approaches, Bayesian inference, approximate Bayesian computation, or other domain-appropriate estimators. This map makes no premature commitment. Identifiability, prior/range sensitivity, observation error, model discrepancy, calibration uncertainty, and computational approximation must be reported.

Pattern reproduction is weaker than mechanism validation. Matching a curve, distribution, or visual pattern does not show that the model's mechanism is correct. Held-out validation, out-of-distribution testing, and competing model forms are required for proportional claims.

```text
simulation success != empirical truth
```

Current ORTUS output is not empirically calibrated or validated unless a specific canonical capability record says otherwise.

## U. Data Assimilation

Data assimilation is a later capability for combining observations with a dynamic model to update beliefs about hidden state and/or parameters:

```text
observations + model + uncertainty assumptions
  -> state / parameter belief update
```

The output is a conditional estimate under the model and observation assumptions. Observed data remains distinct from modeled state. Candidate families include ensemble filters, particle methods, variational approaches, sequential Monte Carlo, Bayesian filtering/smoothing, and hybrid learned estimators.

Required contracts include observation timing and mapping, missingness, measurement error, model error, prior/initial ensemble, update cadence, localization/inflation if used, and posterior provenance. Validation should use synthetic truth recovery, coverage and calibration, filter-divergence tests, held-out observations, sensitivity to misspecification, and comparison with persistence/no-update baselines.

Assimilation must not silently overwrite authoritative model state. An assimilated continuation should be a distinct run lineage with explicit update events. Empirical data ingestion, privacy, units, and provenance require domain-specific review.

## V. Robustness + Resilience

Robustness asks whether a declared function or property persists under variation. Resilience asks how a system responds to disturbance, including degradation, recovery, reorganization, or irreversible change. Neither is established by a trajectory that looks stable.

Candidate analyses include perturbation-response curves, recovery time, overshoot and loss, basin stability, failure/cascade distributions, robustness across parameter/noise/model-form variation, topology perturbation, resilience surfaces, and bounded intervention stress tests.

Every metric needs a function, baseline, perturbation class, magnitude/domain, observation window, success/failure criterion, and uncertainty statement. Recovery to the original state, recovery of function, and transition to an alternative acceptable state are different. A system can be robust to one disturbance and fragile to another.

Evidence should span independent seeds, perturbation distributions, initial states, parameter/model-form uncertainty, and adversarial boundary cases. Structural robustness requires topology/model-form variation, not only parameter sweeps. Basin estimates need explicit sampling and finite-budget uncertainty.

Simulation stress tests are evidence about the model. They are not certification of operational safety, reliability, or real-world resilience. Current robustness/resilience descriptors are structural service artifacts unless [`CAPABILITIES.md`](../CAPABILITIES.md) says a runtime executes them.

## W. Control + Intervention Design

Control research asks which admissible model interventions can move modeled outcomes toward declared objectives under constraints and uncertainty. The problem should state:

- objective and horizon;
- admissible interventions and realization path;
- state/observation availability;
- intervention timing and cost;
- hard safety and resource constraints;
- uncertainty and robustness requirements;
- stopping and fallback behavior.

Method families may include open-loop search, constrained optimization, dynamic programming, model predictive/receding-horizon control, robust or stochastic control, adaptive control, and carefully bounded policy learning. Choice depends on model structure, differentiability, horizon, observability, and compute budget.

Evidence requires baseline policies, held-out seeds/parameters/model forms, constraint-violation accounting, intervention cost, sensitivity, failure cases, and causal/interventional validity within the model. Optimized average outcome is insufficient if tails or constraint violations are unacceptable. A learned controller must not exploit simulator artifacts or hidden reward channels.

Strong boundaries:

- template-owned perturbations are not generic control capability;
- modeled strategy effectiveness is not real-world policy effectiveness;
- causal assumptions do not prove intervention effects;
- no real-person persuasion, microtargeting, profiling, protected-class inference, or operational targeting;
- no hidden objectives, arbitrary formulas/code, or LLM-driven mutation;
- safety/operational deployment requires external domain governance and validation not supplied by ORTUS simulation.

## X. Machine Learning + Deep Representation Learning

Machine learning may serve three bounded roles:

```text
candidate generator
approximation / surrogate
analysis engine
```

It is not scientific authority. A learned representation, relation, regime, equation, predictor, or controller remains conditional on data, objective, architecture, and training procedure. ORTUS should prefer the simplest adequate baseline and require independent evaluation before presenting a learned object as scientifically useful.

### X.1 Representation Families

| Family | Potential role | Required evidence | Characteristic failure |
| --- | --- | --- | --- |
| Autoencoders | Compress state or observation windows; propose collective variables | Held-out reconstruction plus prediction/intervention tests and latent stability | Reconstructs irrelevant detail; arbitrary rotations/scales make factors unstable |
| Variational representation learning | Learn probabilistic latent summaries and uncertainty under a generative model | Posterior predictive checks, calibration, prior sensitivity, collapse diagnostics | Latent prior/objective imposes apparent structure |
| Self-supervised learning | Learn invariances or predictive features without hand labels | Pretext-to-scientific-task transfer, augmentations audited for semantic validity | Augmentation erases scientifically meaningful variation |
| Temporal representation learning | Encode trajectories, history, or multi-horizon state | Held-out temporal prediction, memory tests, time-shift/null baselines | Learns clock/seed/configuration shortcuts |
| Neural state-space models | Approximate latent transitions and observation processes | Multi-step stability, uncertainty, held-out trajectories, simpler state-space baselines | Good one-step fit drifts or becomes dynamically unstable |
| Graph neural networks | Approximate dynamics or learn representations over declared graphs | Graph baseline, permutation tests, topology holdouts, relation provenance | Treats supplied graph as correct causal structure |
| Hypergraph / higher-order neural models | Represent genuine group interactions | Compare against pairwise projection, group-order ablation, sparse-data uncertainty | Higher-order capacity overfits and invents group effects |
| Neural operators | Approximate maps between functions/fields or solution operators | Resolution transfer, PDE/reference comparisons, boundary-condition holdouts | Interpolates training family but fails outside discretization/domain |
| Learned collective variables | Propose compressed coordinates useful for dynamics | Predictive closure, cross-seed alignment, intervention consistency | Latent variable is useful but not unique or interpretable |
| Latent dynamics | Model evolution in compressed state | Long-horizon/statistical fidelity, memory residuals, stability | Encoder hides non-Markov memory or decoder error |
| Switching latent dynamics | Propose regimes and regime-conditioned transitions | Held-out mode evidence, probabilistic calibration, changepoint baselines | Modes become arbitrary clustering of noise or parameters |
| Learned embeddings | Organize states/runs/representations for retrieval or comparison | Neighborhood stability, task relevance, out-of-domain tests | Distance reflects training artifacts, not scientific similarity |
| Sparse/structured model discovery | Propose equations, terms, interactions, or operators | Recovery on benchmarks, stability selection, held-out dynamics, unit/invariant checks | Correlated libraries yield non-identifiable or spurious terms |

### X.2 Objective Design

Training loss is an encoded preference, not neutral discovery. Reconstruction, one-step prediction, contrastive agreement, sparsity, disentanglement, information bottleneck, intervention response, and stability objectives favor different representations. Objectives and weights must be preserved as provenance and included in sensitivity analysis.

Useful objective components may include:

- future prediction across several horizons;
- reconstruction only where retaining fine detail matters;
- compression/complexity penalties;
- residual-memory minimization;
- cross-seed/run alignment without leaking labels;
- intervention-response preservation;
- invariants, symmetry, units, or conservation where valid;
- calibrated predictive uncertainty.

No scalar loss establishes scientific validity. Multi-objective work should expose tradeoffs rather than hide them behind one score.

### X.3 Data And Evaluation Contract

ML training data generated by ORTUS remains simulated model output. Dataset identity should include model/runtime version, parameter and seed sampling, intervention policy, observation/derivation, split policy, preprocessing, and known losses. Splits should prevent leakage across nearby times, duplicated initial states, seeds, parameter neighborhoods, and derived views of the same run.

Evaluation should include:

1. non-learned and simpler learned baselines;
2. held-out seeds, trajectories, parameters, initial conditions, and interventions;
3. out-of-distribution and stress tests;
4. uncertainty calibration and failure detection;
5. cross-run representation alignment/stability;
6. ablations for objective, architecture, input lens, and observation model;
7. independent candidate assessment using data not used for selection;
8. computational cost, scaling, reproducibility, and random-training-seed variance.

When many architectures/hyperparameters are searched, the selection process itself creates multiple-comparison and overfitting risk. The winning candidate must be evaluated on untouched evidence.

### X.4 Interpretability And Scientific Status

Interpretability is task-relative. A sparse coordinate, named component, saliency map, attention weight, embedding direction, or decoded prototype does not automatically correspond to a mechanism. Post-hoc explanation should be tested for faithfulness and stability.

Learned candidate status should progress only through explicit stages:

```text
generated
  -> screened
  -> independently assessed
  -> supported / rejected / inconclusive / non-identifiable
```

Several equally predictive representations may remain observationally indistinguishable. ORTUS should preserve alternatives instead of forcing one canonical latent ontology.

### X.5 Runtime And Safety Boundary

Learned surrogates or controllers may later accelerate bounded research workloads only with authoritative model provenance and error controls. They must not silently replace the engine, alter model semantics under performance pressure, execute user-authored code, or mutate runs through an undisclosed model call.

This research direction does not authorize LLM-per-agent runtime, natural-language reasoning per tick, embeddings or biographies as agent minds, real-person inference, protected-class inference, psychological diagnosis, persuasion optimization, or microtargeting. Existing symbolic/numeric social-learning and Neural Runtime slices remain exactly as bounded in [`CAPABILITIES.md`](../CAPABILITIES.md).

## Y. Learned Scale Discovery

The long-term problem is:

```text
high-dimensional observed state
  -> learned compressed variables
  -> candidate effective scale
```

Compression alone is insufficient. Candidate variables should be evaluated through combinations of future prediction, reconstruction where needed, compression, memory minimization, intervention response, and cross-run stability.

Multi-horizon representations may expose distinct characteristic timescales:

```text
Z_fast    preserves short-horizon transients
Z_medium  preserves mesoscopic organization
Z_slow    preserves long-lived collective state
```

These labels are analytical placeholders, not a guaranteed three-level hierarchy. Characteristic timescales may overlap, vary by regime, or form a continuum. Models may use temporal contrastive objectives, slow-feature concepts, predictive bottlenecks, Koopman/operator-inspired objectives, recurrent/state-space encoders, or spectral methods.

Assessment asks whether learned variables are stable under independent seeds and equivalent symmetries, whether omitted state produces memory, whether the representation transfers across parameter neighborhoods, and whether coarse interventions can be realized. Compare with hand-defined aggregates and classical dimensional reduction. A learned latent is a candidate `ScaleSpec`, not evidence of a natural level or permission to replace runtime state.

## Z. Learned Lens Discovery

Learned lens discovery asks which relational or coordinate representation makes a declared task simpler or more predictive. Candidate outputs include:

- learned graphs or edge probabilities;
- learned higher-order relations;
- latent coordinate systems or manifolds;
- field-like representations from discrete observations;
- relational structures conditioned on regime or scale;
- transformations between learned and predefined lenses.

Methods may include structure learning, attention/edge inference with strict interpretability limits, graph/hypergraph latent models, equivariant representations, manifold learning, neural fields/operators, and relational state-space models.

Evaluation must compare learned versus predefined lenses on held-out prediction, compression, stability, uncertainty, intervention response, and complexity. Learned edges are not interactions unless tied to source events, and they are not causal edges without intervention evidence. Field-like outputs are estimates with sampling/interpolation uncertainty, not observed fields. Non-identifiable lenses should remain competing candidates in Atlas rather than being collapsed into one answer.

## AA. Learned Regime Discovery

Learned regime discovery may use neural switching state-space models, latent mode models, segmentation networks, regime-conditioned dynamics, or probabilistic transition models to propose domains with distinct dynamics.

A candidate should provide probabilistic membership, transition uncertainty, applicable state/parameter/time/space domain, and regime-conditioned predictive model. Evaluation then returns to classical and scientific tests:

- held-out predictive gain over a non-switching model;
- calibration of membership and transitions;
- stability across training seeds and data subsets;
- comparison with changepoint, metastability, and clustering baselines;
- parameter/initial-condition dependence and coexistence;
- intervention response and transition prediction;
- null tests against noise, trends, and observation artifacts.

Mode labels are assigned analytical labels, not meanings understood by the system. A model that separates runs by seed or parameter ID has not discovered a dynamical regime. Learned regime candidates require independent assessment before Atlas presents them as supported.

## AB. Joint SystemView Discovery

The long-term research problem is:

```text
observations
  -> candidate representation search
  -> scale + lens + regime proposal
  -> effective dynamics
  -> independent validation
  -> competing SystemViews
```

Scale, lens, and regime are not truly independent. A useful collective variable may exist only under one interaction lens and one regime; a regime boundary may appear only after choosing a scale; a lens may require entities discovered by coarse-graining. Brute-force Cartesian search would waste compute, multiply false discoveries, and obscure these dependencies.

A defensible strategy is staged:

1. generate candidates from scientific priors, simple baselines, and bounded learned methods;
2. screen for validity, invariants, obvious leakage, minimum stability, and compute budget;
3. fit candidate effective dynamics and estimate memory/error;
4. retain Pareto frontiers over prediction, compression, stability, intervention fidelity, interpretability, and cost;
5. spend expensive cross-seed, held-out, perturbation, and alternative-model validation only on survivors;
6. preserve competing explanations and non-identifiability.

Search provenance must include every candidate tried, data reuse, tuning decisions, and rejection reason. Otherwise the apparent best view is biased by hidden multiple testing. The result is a set of assessed SystemView candidates, not an automatically discovered true decomposition of the system.

## AC. Active Experiment Design / Value Of Information

Active experiment design closes a research loop:

```text
simulate
  -> learn
  -> identify consequential uncertainty
  -> select an informative experiment
  -> simulate again
  -> update evidence
```

The research plane proposes an `ExperimentSpec`; it does not secretly mutate an active runtime. Selection objectives may include expected information gain, posterior/ensemble uncertainty reduction, discrimination among competing explanations, boundary/regime refinement, sensitivity estimation, or expected decision relevance under a bounded scientific question.

Candidate methods include sequential design, Bayesian optimization used for information rather than unsupported outcome maximization, adaptive sampling, optimal experimental design, active learning, bandit-like allocation under explicit non-human targets, and hypothesis-discrimination designs. Compute cost, run failure, parallelism, and stopping budgets must be part of the objective.

Validation can use synthetic benchmarks where the informative region or true candidate is known, regret/information-gain comparisons with random and space-filling baselines, calibration of uncertainty, and held-out confirmation of selected findings. Selection bias must be preserved: adaptively chosen samples are not an iid survey of model space. The final assessment should use independent confirmation runs where feasible.

No design engine may request prohibited human targeting, infer protected traits, optimize persuasion, or bypass intervention/capability constraints. World or backend execution accepts only explicit validated protocols; Lab retains rationale and results; Atlas may expose unresolved regions and competing candidates.

## AD. Surrogates + Multifidelity

Surrogates and emulators approximate expensive model outputs or transitions. Multifidelity methods combine coarse, fine, reference, optimized, analytical, and learned approximations while preserving which source produced each result.

Possible uses include accelerating ensembles, sensitivity, calibration, active design, rare-event screening, and candidate SystemView evaluation. Families include Gaussian-process or kernel emulators, polynomial/sparse response surfaces, reduced-order models, neural surrogates/operators, control variates, multilevel Monte Carlo, co-kriging, and discrepancy models.

An authoritative provenance chain should identify:

```text
scientific model definition
  -> authoritative/reference or accepted optimized runtime
  -> surrogate training dataset
  -> surrogate version and applicability domain
  -> surrogate prediction + uncertainty + error evidence
```

Evidence requires held-out error across the claimed domain, calibration/coverage, tail and transition-region tests, monotonicity/invariant checks where applicable, error propagation into downstream estimates, and comparison with additional authoritative runs. Adaptive error checks should fall back or stop when outside the surrogate's support.

A fast surrogate result is not an authoritative model run unless a dedicated contract says so. Approximation error must not disappear inside an uncertainty band that only represents stochastic variation. Learned approximations must not silently replace model semantics under load.

## AE. Formal Verification + Numerical Science

As ORTUS expands beyond agent rules, scientific correctness increasingly depends on numerical methods and formal properties.

Required concerns include:

- invariants, conservation, positivity, bounds, and admissible states;
- solver stability and stiffness;
- discretization and mesh/time-step dependence;
- convergence and order-of-accuracy evidence;
- truncation, roundoff, reduction-order, and statistical error;
- event/guard correctness in hybrid systems;
- deadlock, reachability, liveness, and safety properties where applicable;
- reference implementations and differential testing;
- deterministic replay under the declared numerical contract.

Method families include property-based tests, invariant monitors, manufactured solutions, grid/time refinement, convergence studies, interval or exact methods where feasible, temporal logic/model checking for bounded systems, static contracts, metamorphic tests, and cross-implementation differential tests.

Formal verification proves a stated property of a stated abstraction under stated assumptions. It does not validate the model's empirical adequacy. Numerical convergence to the wrong equations is still wrong science; empirical fit with an unstable solver is still unreliable.

Reference implementations should remain simple enough to audit. Optimized CPU/Worker/GPU/WASM paths require declared tolerances and differential evidence against the reference. Performance gates must report when numerical choices change and cannot silently trade semantics for frame rate.

## AF. Scientific Interoperability

Interoperability should use explicit adapters and standards where they fit, without pretending universal conversion.

Potential future boundaries include:

| Standard / concept | Possible ORTUS relationship | Critical boundary |
| --- | --- | --- |
| ODD-style descriptions | Human/machine-readable model description and assumptions | Documentation is not executable equivalence. |
| SBML | Reaction-network model exchange where semantics overlap | No support claim until units, kinetics, events, and validation are mapped and tested. |
| SED-ML | Simulation experiment/protocol exchange | Protocol mapping may be lossy and does not create runtime family support. |
| FMI / Modelica concepts | Typed component interfaces, co-simulation, hybrid/physical modeling | Coupling, clocks, units, rollback, and solver authority require explicit contracts. |
| Arrow / Parquet | Columnar research export for observations/results | Schema/version/provenance and loss semantics must accompany bulk data. |
| PROV / RO-Crate-style concepts | Provenance graphs and research-object packaging | Referencing a concept is not standards compliance. |

Adapters should declare supported subset, version, direction, loss, units, identity mapping, execution authority, and round-trip behavior. Unsupported constructs must remain visible. Import validation cannot guarantee semantic equivalence, and export success cannot prove another runtime will reproduce behavior.

Mesa, NetLogo, MASON, or other framework adapters remain future contracts until implemented and audited. Model schemas, compatibility reports, and Builder graphs do not earn interoperability.

## AG. Research Infrastructure + Persistence

ORTUS should separate the interactive local runtime from later backend research execution.

```text
interactive local runtime
  low-latency exploration, bounded local experiments, explicit local state

backend research execution (future)
  durable jobs, larger ensembles, sweeps, sensitivity, analysis, ML training
```

Structured metadata will likely benefit from relational-style persistence; bulk observations, checkpoints, arrays, models, figures, and derived artifacts will likely need artifact/object/chunk storage. This is an architectural direction, not a selected production database schema.

Potential durable objects include:

- models and immutable versions;
- runtime plans and implementation versions;
- runs and continuation/restart lineage;
- experiment protocols and executions;
- investigations and research contexts;
- canonical observations and event partitions;
- derivations and representation artifacts;
- evidence reports, candidate assessments, claims, and interpretations;
- exported bundles and external provenance references.

Later job infrastructure may support ensembles, sweeps, sensitivity, expensive analysis, surrogate fitting, and ML training. It needs idempotent requests, bounded work estimates, cancellation, retries with lineage, partial/failure state, resource quotas, artifact checksums, version pinning, and result publication that cannot race or overwrite a newer request.

Persistence must define deletion, retention, schema migration, privacy, access, and reproducibility. Storing full per-tick state by default is usually wasteful and can create unbounded biography-like data. Research jobs should store observations, metrics, and artifacts justified by the protocol, with full snapshots/checkpoints only when explicitly required.

Current browser-local comparison summaries, page-local Atlas previews, and structural Lab scaffolds are not this infrastructure.

## AH. Product Surfaces

The intended scientific roles are:

| Surface | Scientific role | Authority and present boundary |
| --- | --- | --- |
| **World** | Interact with a live modeled system, observe current model outputs, and apply supported commands. | UI requests actions; model/runtime owns state and dynamics. Current output is not automatically canonical observation or evidence. |
| **Workshop** | Construct, decompose, and remix model definitions and supported variants. | Current Workshop is structural and non-runnable. Future execution must be earned through explicit model-family/runtime capability. |
| **Lab** | Durable scientific memory: questions, protocols, runs, observations, evidence, alternatives, assessments, failed results, and interpretations. | Current Lab persists none of these records. |
| **Atlas** | Map questions, representations, evidence, alternatives, findings, uncertainty, and relationships. | Current Atlas has one bounded page-local Flocking sampler and planning vocabulary, not a saved map or discovery system. |
| **Guides** | Structured learning and investigation over supported model behavior. | Current guides are bounded workflows, not progress storage, learning validation, or scientific certification. |

The experience layer must never define scientific ontology. A panel label cannot create an entity type, a graph cannot create runtime relations, a camera cannot create scale, a chart cannot create canonical observations, and a badge cannot validate a claim.

Cross-surface handoffs should preserve source identity and capability boundaries:

```text
Starter / Guide
  -> World exact supported configuration
  -> Workshop decomposition or bounded remix (future)
  -> Lab protocol/evidence record (future)
  -> Atlas referenced question/view/evidence map (future)
```

No handoff should silently convert one object family into another.

## AI. Epistemic + Safety Boundaries

These invariants govern every research area:

```text
model                         != reality
prediction                    != explanation
dependency                    != causality
network edge                  != causal edge
cluster                       != emergent entity
latent variable               != natural ontology
candidate                     != validated representation
simulation intervention       != real-world causal proof
camera zoom                   != scientific scale
structural validity           != runtime support
runtime support               != empirical validation
empirical pattern match       != mechanism validation
uncertainty ensemble          != calibrated probability
rendered output               != CanonicalObservation
```

### Prohibited Or Reserved Uses

ORTUS research capabilities must not become infrastructure for:

- protected-class inference or proxy reconstruction;
- real-person profiling, psychological diagnosis, mind/trait inference, or biography reconstruction;
- persuasion optimization, microtargeting, behavioral manipulation, or operational targeting;
- recommendation or control systems aimed at exploiting identifiable people;
- hidden objectives or undisclosed intervention policies;
- arbitrary formula, script, function-body, compiler payload, dynamic import, or code execution;
- LLM-per-agent runtime, natural-language reasoning per tick, or hidden LLM mutation of model state;
- policy, clinical, safety, or operational claims unsupported by external evidence and governance.

Social/cognitive descriptors are bounded symbolic/numeric model semantics, not minds. Opinion values are model variables, not measured human beliefs. Neural template activations and readouts are stylized model variables, not biological recordings, cognition, diagnosis, or treatment evidence. These current safety boundaries remain controlling as research infrastructure expands.

### Proportional Claim Rule

Every user-facing conclusion should name:

1. the modeled system and version;
2. observation and derivation scope;
3. estimator/method and uncertainty;
4. tested domain, seeds, parameters, and interventions;
5. supporting and opposing evidence;
6. alternatives and identifiability status;
7. what the result does not establish.

When evidence is insufficient, `INCONCLUSIVE` or `NON_IDENTIFIABLE` is a successful scientific outcome. ORTUS should make uncertainty and competing explanations visible rather than manufacture certainty for product polish.

## Dependency Index

This table summarizes conceptual dependencies, not roadmap order.

| Capability | Depends most directly on | Cannot be inferred from |
| --- | --- | --- |
| Experimental science | model/run identity, explicit protocols, reproducible execution | ad hoc parameter changes |
| Canonical observation | observation model, sampling, provenance, durable identity | snapshots, render packets, charts |
| Evidence and claims | canonical observations, derivations, independent assessment | visual patterns or metric labels |
| Sensitivity/UQ | explicit uncertainty sources, ensembles, sampling design | one noisy trajectory |
| Scale/lens/regime/SystemViews | canonical observations, mappings, held-out tests | camera, aggregate metrics, graph completeness |
| Effective dynamics/emergence | assessed representations, memory/closure/intervention tests | clustering alone |
| Causal analysis | explicit interventions, confounding assumptions, abstraction tests | dependence, networks, information flow |
| Prediction/calibration/validation | held-out evidence, uncertainty, model/observation contracts | simulation success |
| Data assimilation | empirical observations, units, observation model, uncertainty | overwriting model state with data |
| Robustness/control | admissible perturbations, objectives, constraints, stress evidence | template intervention availability |
| ML discovery | provenance-rich datasets, baselines, independent assessment | a trained model or latent plot |
| Active design/surrogates | calibrated uncertainty and authoritative-run checks | optimizer confidence |
| Interoperability/persistence | strict adapters, versioning, loss and provenance contracts | matching field names or exported JSON |

## Reference Outcome

The research ambition is not a catalog of impressive algorithms. It is a disciplined system in which a user can ask a question, construct or select an explicit model, run a reproducible protocol, derive competing representations, test them, preserve uncertainty and failures, and make a claim whose scope can be challenged.

That ambition remains subordinate to runtime truth. Planned objects and methods become ORTUS capabilities only through dedicated implementation, capability registration, focused scientific tests, rendered workflow verification where applicable, and independent audit under [`docs/ROADMAP.md`](../ROADMAP.md).
