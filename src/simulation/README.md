# Simulation Engine

This directory contains a headless TypeScript simulation engine for visual complex systems modeling. It is independent from React, browser rendering, DOM APIs, canvas APIs, storage backends, and authentication.

## Philosophy

The engine owns time, scheduling, mutation, seeded randomness, validation, metrics, snapshots, and serialization. Templates own domain behavior and metadata. Rendering layers should consume snapshots later without becoming part of the simulation loop.

Roadmap status: ORTUS has completed Prompt 39B: Scenario Planning From Schema Audit, plus non-roadmap Prompt N1: Neural Excitation Network Template V1, Prompt N1B: Neural Excitation Network Template Audit + Decision Readout V1, Prompt NUX1: Neural Runtime Lab UX V1, Prompt NUX1B: Neural Runtime Lab UX Audit + Build Investigation, Prompt N2: Neural Strategy Adaptation V1, Prompt N2B: Neural Strategy Adaptation Audit, Prompt MR0: Templates + Decision Clusters Mini-Roadmap, docs-only Prompt F0: Fractal and Multiscale Analysis Mini-Roadmap, docs-only Prompt P0: ORTUS Product Philosophy and Learning Mission, docs-only Prompt UX0: Living Systems Atlas Visual Direction, docs-only Prompt UX1: Existing Design Token and Component Audit, docs-only Prompt GW0: ORTUS Research World Progression Mini-Roadmap, Prompt UX2: Living Systems Atlas Semantic Token Foundation, Prompt UX2B: Living Systems Atlas Semantic Foundation Rendered Browser Audit, Prompt GW1: Persistent World / Lab / Atlas / Workshop Shell, Prompt GW1B: Destination Shell Audit and Hardening, Prompt GW2: Active Run Provenance and Observation Layer, Prompt GW2B: Active Run Provenance and Observation Audit and Hardening, Prompt GW3: Active Intervention Boundary and Perturbation Readiness, Prompt GW3B: Active Intervention Boundary Audit and Hardening, Prompt GW4: Discovery Atlas Information Architecture and Non-Persistent Evidence Map Foundation, Prompt GW4B: Discovery Atlas Foundation Audit and Hardening, and Prompt GW5: Lab Evidence Record Information Architecture. GW2, GW3, GW3B, GW4, GW4B, and GW5 are UI/documentation layers over existing engine/snapshot/intervention state; they do not change the headless simulation engine, templates, runtime behavior, scenario behavior, metrics, interventions, storage, model-schema execution, Builder execution, persistent Lab records, or saved Atlas discoveries. The post-30B repository hygiene, durable context, dependency stabilization, and performance/scalability pass is complete. GW5B is the next Research World audit prompt only with explicit approval; do not start GW5B-GW6 Research World implementation, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any further Research World/fractal/multiscale implementation without explicit approval.

Prompt P0 is documentation only. ORTUS models are representations for exploration and comparison, not direct copies of reality. Simulation output is evidence about the model’s behavior, not automatically evidence about the world. P0 does not change the headless engine, add Research World progression, add scoring or unlocks, add templates, add primitives, add UI flows, or alter runtime behavior.

Prompt UX0 is documentation and design planning only. It defines a future Living Systems Atlas visual direction without changing the headless engine, templates, runtime behavior, scenario behavior, metrics, interventions, CSS, UI components, routes, dependencies, or remote-font policy.

Prompt UX1 is documentation and source-level audit only. It inventories existing UI/CSS/component sources and migration risks without changing the headless engine, templates, runtime behavior, scenario behavior, metrics, interventions, CSS, UI components, routes, dependencies, assets, or font configuration.

Prompt GW0 is documentation and progression architecture only. It defines Research World as a future investigation context and records progression, evidence, reusable-asset, expert-access, and destination-responsibility guardrails without changing the headless engine, templates, runtime behavior, scenario behavior, metrics, interventions, persistence, CSS, UI components, routes, dependencies, assets, or font configuration. A Research World artifact, if introduced by a later prompt, must not become hidden engine state or runtime activation by attachment alone.

Prompt UX2 is a UI/CSS semantic-token foundation only. It does not change the headless simulation engine, templates, runtime behavior, scenario behavior, metrics, interventions, model-schema execution, Builder execution, persistence, dependencies, assets, or font configuration. Operational success means a requested software operation completed; it does not mean the modeled conclusion was scientifically validated.

Prompt GW1 is a UI route-shell implementation only. It preserves `/` as World, preserves `/builder` as Workshop, adds `/lab` and `/atlas` as informational routes, and keeps persistence as application structure across routes rather than user research data. It does not change the headless simulation engine, templates, runtime behavior, scenario behavior, metrics, interventions, model-schema execution, Builder execution behavior, persistence/storage, dependencies, assets, or font configuration.

Prompt GW2 is a World UI observation layer only. It derives live provenance and observation summaries from the active engine and latest snapshot so the user can inspect model behavior under the current configuration. It does not create saved records, timestamps, random ids, fingerprints, Lab persistence, Atlas discoveries, runtime observability collection, empirical measurements, validation, or simulation-engine behavior.

Prompt GW3 is a World UI intervention-readiness layer only. It derives live readiness and boundary summaries from existing registered template-owned intervention definitions, target state, active engine presence, and current active-run intervention count. It does not add saved intervention plans, Lab intervention records, Atlas discoveries, behavioral landscapes, storage, timestamps, random ids, fingerprints, new runtime mechanics, template behavior, validation, calibration, real-world causal proof, or simulation-engine behavior.

Prompt GW3B audits and hardens that World UI intervention-readiness layer only. It tightens current-run intervention entry copy, engine-required readiness coverage, validation-language boundaries, and rendered Intervene assertions. It still does not add saved intervention plans, persistent Lab intervention records, Atlas discoveries, behavioral landscapes, storage, timestamps, random ids, fingerprints, runtime mechanics, template behavior, validation, calibration, real-world causal proof, or simulation-engine behavior.

Prompt GW4 is an Atlas UI/documentation foundation only. It defines non-persistent evidence-state semantics and a conceptual `/atlas` scaffold for future model-behavior evidence. It does not ingest active runs, save evidence, create Discovery Atlas records, create behavioral landscapes, add sampled-region maps backed by run data, add Lab records, add storage, change templates, or change simulation-engine behavior.

Prompt GW4B is an Atlas audit/hardening pass only. It keeps sampled evidence unresolved until source-backed Atlas records exist and completes the post-hardening rendered shell/full UI verification gate. It does not change the headless engine, templates, runtime behavior, scenario behavior, metrics, interventions, storage, model-schema execution, Builder execution, Lab records, or saved Atlas discoveries.

Prompt GW5 is a Lab UI/documentation foundation only. It defines non-persistent evidence-record lifecycle semantics and a conceptual experiment-ledger scaffold for future Lab evidence records. It does not save active runs, create persistent evidence records, create experiment ledgers, create notebooks, create saved comparisons, create run history, publish to Atlas, add storage, change templates, or change simulation-engine behavior.

## Architecture

Entities are stable identities. Components are plain serializable data. Systems contain behavior and run through scheduler phases. Spaces provide continuous, grid, or network relationships. Templates register systems, parameters, metrics, documentation, and visual mapping metadata without modifying engine internals.

The cross-cutting vocabulary for templates, scenarios, runs, snapshots, run summaries, experiments, interventions, behavior modes, agent composition, and uncertainty configuration is documented in `../../docs/concepts.md`.

## Scheduler

The fixed phase order is `beforeStep`, `sense`, `decide`, `act`, `resolve`, `afterStep`, and `metrics`. Systems are sorted by phase, priority, then stable system id. The engine supports staged updates by collecting commands during a phase and applying them at controlled boundaries.

## Time

`SimulationClock` advances one fixed timestep per `step()`. `runSteps(n)` advances exactly `n` ticks. The engine does not know about animation frames or rendering cadence.

## Seeded Randomness

All stochastic behavior uses `RandomService` streams derived from a root seed. Stream state is included in snapshots so restored runs can continue deterministically.

Randomness in ORTUS should be explicit, seeded, and reproducible. Hidden randomness makes experiments, comparisons, calibration, and uncertainty analysis unreliable. Template initialization, systems, interventions, and experiment planning must not use `Math.random`; UI-only timestamps or ids are not simulation randomness.

## Command Buffer

Systems receive read-only world access and emit commands. `CommandBuffer` validates commands, applies them in deterministic order, and records debug metadata. Commands cover entity lifecycle, components, spaces, events, and globals.

## Event Queue

`EventQueue` schedules typed events by tick. Due events are popped at the start of each engine step and exposed to systems through context. Same-tick events are ordered by scheduled tick, priority, created tick, and id.

## Spaces

`Continuous2DSpace`, `Grid2DSpace`, and `NetworkSpace` implement real placement and neighbor behavior. They serialize into snapshot state and can be cloned for deterministic restore.

## Metrics

Templates register metric definitions. `MetricsCollector` records finite numeric metrics at a configurable interval and keeps bounded history, defaulting to 1000 records.

Metric definitions are formal model metadata: id/key, label, description, value type, optional range/unit/display metadata, history support, run-comparability, source, and formatting hints. Metric emissions remain numeric in V1 and are rejected if they produce `NaN` or infinity.

## Snapshots And Import/Export

Scenario export stores template id, parameters, seed, and metadata for restarting from initial conditions. Snapshot export stores current time, world state, events, RNG stream states, metrics history, applied intervention history, and metadata for deterministic continuation. JSON import validates nested state and rejects invalid data.

## Scenarios

`src/simulation/scenarios` contains headless Scenario Builder utilities. An authored scenario is an initial-condition and supported model-variant recipe with scenario id, name, description, tags, template id/version, seed, validated parameters, initialization preset/options, agent composition, behavior mode, environment options, metadata, and creation/update timestamps. It is not a snapshot and does not store live world state, current tick state, metric history, intervention history, or run outcome data.

Templates may expose `initializationPresets`, `behaviorModes`, `agentCompositionDefinitions`, `environmentOptionDefinitions`, and validation hooks for initialization or scenario options. The engine accepts optional initialization and scenario-variant context and passes it to `createInitialWorld`; this is a general extension point for template-owned setup and future model-family variants, not a UI or engine hard-code. Behavior modes are template-defined rule variants. They are not arbitrary user-authored rules. Full custom rule authoring will require the future Model Definition Schema, Rule Primitive Library, Model Compiler, and Visual Model Builder. Applying a scenario creates a fresh engine at tick 0. Preview generation also creates a separate temporary engine at tick 0, so it does not mutate the active run or advance simulation time.

Scenario Builder is not a full model/rule editor. Custom model authoring will require the future Model Definition Schema, Rule Primitive Library, Model Compiler, and Visual Model Builder.

Forest Fire / Landscape Spread is a template-owned abstract local-spread grid model. It demonstrates fuel density, local neighbor ignition, burnout, optional stylized regrowth, and landscape-level metrics, but it is not a wildfire predictor and does not use GIS, real terrain, wind, humidity, weather, suppression, firefighting, or calibrated fire probabilities. Its grid coordinates are implementation geometry, not SpatialFieldModel runtime support, and its boundary mode is not BoundaryEnvironmentModel runtime support.

Neural Excitation Network is a template-owned stylized runtime network model. It uses a bounded hybrid space: continuous node layout plus a template-owned runtime `NetworkSpace` for directed abstract synapses. Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation. Activation is a model variable, not measured membrane voltage. Synapse weights are abstract influence strengths, not biological synaptic measurements. The model does not simulate ion channels, neurotransmitters, morphology, learning, consciousness, or cognition. This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable.

Decision Readout V1 maps labeled output assemblies to bounded categorical choices. It is not cognition or reasoning. Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network. Template RPS payoff is observational and does not train, optimize, mutate synapses, or update biological/plasticity fields. The model does not infer intentions, beliefs, preferences, personality, or human decision-making. Decision metrics are model-output readouts from labeled neuron groups, not evidence of reasoning. Decision Readout V1 is template-local readout state, not a global decision-support primitive, social-learning runtime, model-schema runtime, or Builder graph runtime.

Neural Runtime Lab UX V1 is a React workbench layer around existing Neural template parameters, snapshots, and template-scoped interventions. Prompt N2 adds Neural Strategy Adaptation V1 only to the lab's RPS/readout challenge, and Prompt N2B audits/hardens that local slice. Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference. The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time. Learned strategy state is local model state, not a psychological profile. Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning. The adaptation layer is bounded UI/view-model state plus bounded output-assembly stimulus/readout-bias behavior; Prompt N2B keeps reset state round-index based, keeps round numbering monotonic after history truncation, and filters malformed round objects before statistics. It does not change the headless simulation engine, add a new primitive, execute model schemas, execute Builder graphs, persist a user profile, infer beliefs/intentions/preferences/personality, or update core synapse weights from RPS payoff. Prompt NUX1B fixes a Next production-build failure caused by build-time remote font fetches; it does not change engine semantics.

Prompt MR0 is documentation only. It records future template and decision-cluster direction only; it does not implement runtime behavior. It does not change the headless simulation engine, add a template, add a primitive, add external-stimulus runtime, add blackjack logic, add observed cluster discovery, execute Builder graphs, or make Model Schemas runnable. Decision clusters model observable state-action patterns, not thoughts. Prediction outputs are probabilities, not certainties. Cluster labels are assigned modeling labels, not meanings understood by the system. External stimuli are modeled inputs, not evidence of internal mental state. Observed clusters are analytical groupings, not psychological profiles. Blackjack work is offline simulation only, not gambling advice, live casino assistance, or wearable card-counting support. Do not use wearable devices, camera input, or software assistance for live casino play.

Prompt F0 is documentation only. It records future fractal and multiscale analysis direction only; it does not change the headless simulation engine, add a template, add a primitive, add registry support, add fractal metrics, add fractal spatial generators, add Scale Lens UI, add network scaling analytics, add trajectory motif analytics, execute Builder graphs, or make Model Schemas runnable. Measure multiscale structure before generating synthetic fractal structure. Fractal and multiscale tools describe how measured structure changes across scale. They do not prove that a system is fundamentally fractal. A complex-looking, nested, branching, or irregular pattern is not automatically fractal. Power-law behavior may indicate scale-free structure, but a power-law fit alone does not establish fractality. Finite-resolution fractal dimensions are estimators over a chosen scale range, not intrinsic truths about the modeled system. Fractal analysis requires a defined object, scale operation, and measurement. ORTUS must not apply one generic fractal score to unrelated spatial, network, temporal, and trajectory data. Fractal and multiscale metrics are structural summaries, not causal explanations, forecasts, validation results, or proof of universal laws.

Agent composition defines the initial mix of agents, groups, or types for a run. It should not be confused with live engine state or snapshots. Current composition fields are template-owned parameter definitions. Flocking adds a `groupAware` behavior mode with deterministic boid group assignment and group-weighted alignment/cohesion. Ring Formation is an initialization preset only unless an orbit behavior mode is selected. Initial circular placement does not guarantee persistent circular motion.

V1 behavior/composition support remains deliberately narrow: most templates are default-mode only, composition is template-owned setup metadata, and custom rule authoring still requires future model-definition and compiler work. `groupAware` Flocking is a real runtime variant that reuses the same deterministic boid neighbor summaries as classic flocking. The template may use a spatial hash to reduce local-radius neighbor checks, but that is an implementation detail, not a new modeling primitive.

`SimulationRunConfig` is the generic fresh-run recipe shared by scenario authoring and experiment/uncertainty paths. It contains template id, seed, parameters, optional scenario id/name, initialization preset/options, agent composition, behavior mode, environment options, optional uncertainty config metadata for ensemble setup, and metadata. It is explicitly distinct from snapshots and run summaries.

Scenario JSON uses the `ortus.scenario` artifact type and is distinct from snapshot JSON and run-summary export. Scenario validation rejects unknown top-level fields, enforces a serialized-size bound, and rejects metadata that embeds snapshot-like live run state such as world, component, space, RNG, event, metric-history, or intervention-history blobs. Scenario storage lives outside the engine in `src/lib/localScenarioStorage.ts`; it validates loaded records, salvages valid records from partially malformed libraries, and enforces a V1 limit of 50 saved scenarios.

Scenarios define initial conditions and supported model variants. They do not guarantee outcomes; complex systems can behave differently across seeds, parameters, behavior modes, agent compositions, and future uncertainty settings.

## Experiments

`src/simulation/experiments` contains a headless experiment runner that consumes the same production template registry and creates a fresh `SimulationEngine` for each trial. It supports single-parameter sweeps and two-parameter grid sweeps, generated numeric/integer ranges, manual values for select/boolean/numeric parameters, fixed seed lists in supplied order, sequential seed generation, validation against template parameter rules, cancellation between runs, finite final-metric capture, aggregation, and progress callbacks.

Experiment result sets store run metadata and final numeric metrics. They do not store snapshots or full metric histories per run by default. This keeps local browser exploration bounded while preserving deterministic behavior for a repeated experiment config.

Experiment results are exploratory and depend on model assumptions, parameter choices, and random seeds. They are not calibrated predictions.

## Uncertainty

`src/simulation/uncertainty` contains the headless Uncertainty Layer V1. An uncertainty config is a plain JSON sampling recipe with artifact type `ortus.uncertaintyConfig`; it names uncertain variables, target paths, distributions, a deterministic sampler seed, sample count, selected output metrics, and assumption metadata. It is not a scenario, snapshot, run summary, or live engine state.

Supported V1 distributions are `fixed`, `uniform`, `integerRange`, `categorical`, and `seedEnsemble`. V1 prioritizes parameter and seed uncertainty. Agent composition, environment options, initialization options, and behavior mode targets are accepted only when they reference template-defined fields and generated values pass the same RunConfig/template validation as ordinary runs.

`generateUncertaintyRunConfigs` turns a base `SimulationRunConfig` plus uncertainty config into concrete deterministic RunConfigs. Generated runs do not retain unresolved distributions by default; provenance lives in metadata. `runUncertaintyEnsemble` executes those generated RunConfigs through fresh engines and records final metric summaries without storing snapshots or full metric history.

`baseSeed` is the sampler seed, while a seed uncertainty variable changes generated run seeds. For `seedEnsemble`, `sampleCount` is the total number of generated samples; explicit seeds are consumed in declared order and cycle if there are fewer seeds than samples. Duplicate seeds are retained intentionally for explicit repeated-run provenance.

If a sampled parameter overlaps a template-defined agent-composition, environment-option, or initialization-option field, V1 synchronizes that overlapping field and records the sync under generated run metadata. This avoids sampled parameters being overwritten by existing variant defaults, but it is a compatibility bridge rather than a general nested-object mutation system.

Uncertainty ranges in ORTUS are assumptions unless calibrated against data. Ensemble results show behavior across the specified assumptions; they do not prove real-world probabilities.

Uncertainty Layer V1 does not implement Bayesian calibration, MCMC, data assimilation, full sensitivity analysis, or scenario discovery. Those require later validation, observation, and calibration phases.

Uncertainty Layer V1 is service-first. It supports deterministic ensemble generation and summary statistics, but it is not yet a full uncertainty workbench, calibration system, or sensitivity-analysis dashboard. There is no dedicated UI panel yet, no time-series envelopes, no grid or Latin-hypercube sampling, and p05/p95 summaries are sample percentiles rather than confidence intervals or real-world probability bands.

## Assumptions, Limits + Ethics

`src/simulation/assumptions` contains structured assumption profile types, validation, serialization, template-profile helpers, and summary helpers. An assumption profile uses artifact type `ortus.assumptionProfile` and records assumptions, limitations, not represented fields, appropriate use, inappropriate use, ethics notes, validation status, and validation notes.

Every ORTUS model is an abstraction. The Assumptions, Limits + Ethics panel shows what the model includes, what it excludes, and what uses would be misleading without validation.

Validation status describes evidence about the model, not truth about the real world. A model marked internally tested has passed software and invariant checks; it has not necessarily been calibrated or externally validated.

Scenario-specific assumption, limitation, validation, and ethics notes are optional plain JSON fields on authored scenarios. They are exported/imported with scenario JSON when present, but they do not overwrite template profiles. Assumption summaries combine template profiles with scenario notes; the compact UI panel currently shows the selected template profile only. Applying a scenario records lightweight assumption provenance in run metadata through template id/version, profile id, validation status, and note counts instead of copying full profile documents into every run.

Uncertainty variable notes and uncertainty metadata assumptions can be surfaced in service-level assumption summaries. Uncertainty ranges are user-specified assumptions unless calibrated against data, and uncertainty result percentiles are summaries across specified samples, not real-world probability bands.

Assumption profiles are modeling-transparency artifacts. They are not simulation state, do not affect engine dynamics, do not certify predictions, and are distinct from scenario, snapshot, uncertainty, and run-summary exports. Assumption profile import/export is service-level in V1 through `ortus.assumptionProfile` helpers; there is no dedicated export UI yet.

## Networks + Relations

`src/simulation/networks` contains service-level network primitives. A network definition uses artifact type `ortus.networkDefinition` and stores plain JSON nodes, edges, optional relation types, weights, direction flags, and bounded metadata. Network metrics use artifact type `ortus.networkMetrics`.

Network primitives represent relational structure inside a model. A network can describe who is connected to whom, but it does not by itself prove causal influence or real-world social structure.

Prompt 15 adds service-level network primitives. Full visual network editing, network-based behavior modes, and hybrid models require later model schema, rule primitive, and visual builder phases.

Supported V1 generators are `empty`, `complete`, `randomErdosRenyi`, and `ring`. Random generation is deterministic through `RandomService`; complete and ring generation are deterministic from options alone. Network validation rejects duplicate nodes, duplicate edge or relation type ids, missing endpoints, unsupported relation types, invalid weights, self-loops unless explicitly allowed, live-state-shaped payloads, non-plain objects, and oversized definitions.

Network definitions are bounded to 500 nodes, 20,000 edges, 200 relation types, and bounded metadata/JSON payloads. `directed` on the network is the default for edges; relation-type defaults and edge-level `directed` values can make individual relations directed. Multiple edges between the same node pair are rejected unless they use different relation types. Query helpers are service-level only: `getNeighbors` returns incident neighbors, while incoming/outgoing helpers expose direction-sensitive traversal.

V1 network metrics include node count, edge count, density, average degree, min/max degree, connected component count, and largest component size. Directed graphs use weak connected components for component metrics. These metrics are bounded structural summaries, not causal proof or real-world social-network evidence. Full graph layout, visual network editing, centrality dashboards, all-pairs path analysis, network uncertainty, and network-backed template behavior are future work.

Neural Excitation Network is the only current production template with runtime network support, and that support is limited to its template-owned runtime `NetworkSpace` synapses. `supportsNetworkOptions` remains false because RunConfig/scenario network artifact wiring is not implemented. Its optional Decision Readout V1 uses labeled neuron groups inside the same template only; it does not make network artifacts executable or imply generic graph runtime. Other production templates remain spatial/grid templates; their `supportsNetworkSpace` and `supportsNetworkMetrics` flags are false until a template actually uses network topology. Epidemic and Opinion may later use contact or influence networks, and Predator-Prey may later use food-web relations, but service-level network primitives do not change those runtime dynamics.

RunConfig and scenario schemas intentionally reject unsupported network fields in V1, including for Neural Excitation. Future network-configurable templates should introduce `networkOptions` or inline network-definition references only behind explicit capability flags and should validate them with `src/simulation/networks`.

## Resources, Stocks + Flows

`src/simulation/resources` contains service-level resource, stock, and flow primitives. A resource system uses artifact type `ortus.resourceSystem` and stores plain JSON resource definitions, stock definitions, flow definitions, current stock states, optional bounded ledger entries, and bounded metadata. Current bounds are 200 resources, 1,000 stocks, 1,000 flows, 1,000 ledger entries, and bounded JSON/metadata payloads. Resource metrics use artifact type `ortus.resourceMetrics`.

Resource, stock, and flow primitives represent quantities and movement of quantities inside a model. They do not by themselves prove real-world economic, ecological, or health outcomes.

Prompt 16 adds service-level resource/stock/flow primitives. Full visual stock-flow editing, feedback loops, delayed flows, and hybrid resource-network models require later model schema, rule primitive, feedback, and visual builder phases.

Stock ownership is descriptive metadata in V1. `ownerType` and `ownerId` identify whether a stock is associated with a system, agent, group, region, or environment, but resource services do not bind stocks to live engine entities unless a future template explicitly does so. Stock bounds use the most restrictive applicable upper bound across resource max, stock max, and stock capacity. Minimums default to zero unless the resource or stock explicitly allows negative values.

Supported V1 operations are `produce`, `consume`, `transfer`, `regenerate`, `decay`, and `deplete`. Flow rates are numeric constants only. `produce` and `regenerate` require a target stock and add up to capacity/max. `consume`, `decay`, and `deplete` require a source stock and remove down to min/zero unless negatives are allowed. `transfer` requires source and target stocks with the same resource id and is constrained by source availability and target capacity. In V1, `decay` and `deplete` intentionally share the same constant-rate removal mechanics; they are separate flow types for future template-specific semantics.

Operations are deterministic, clamp against stock minimums, maximums, and capacity, return flow results and warnings, and do not mutate their input state. There are no arbitrary equations, delayed flows, feedback-loop editors, or user-authored formulas in V1.

V1 stock-flow metrics include resource count, stock count, flow count, total stock by resource, min/max stock value, depleted stock count, over-capacity stock count, total requested/applied flow by resource, net flow by resource, insufficient-stock flow count, and clamped-flow count. Metrics are finite structural summaries, not predictive evidence.

Current production templates do not use these primitives at runtime. Their `supportsResources`, `supportsStocks`, `supportsFlows`, and `supportsResourceMetrics` flags are false until a template actually uses resource state or stock-flow logic. RunConfig and scenario schemas intentionally reject unsupported resource fields in V1. Future resource-capable templates should introduce resource options or resource-system references only behind explicit capability flags and validate them with `src/simulation/resources`.

Resource uncertainty and resource-network hybrids are future work. Later phases may support stock/flow rate uncertainty, flows across network edges, supply chains, transportation networks, resource diffusion, and capacity-constrained networks, but Prompt 16 does not wire those concepts into runtime dynamics.

## Feedback Loops, Delays + Events

`src/simulation/feedback` contains service-level feedback, delay, and event primitives. Event schedules use artifact type `ortus.eventSchedule`, delay queues use `ortus.delayQueue`, feedback loop lists use `ortus.feedbackLoops`, and feedback/event metrics use `ortus.feedbackEventMetrics`. These artifacts store plain JSON scheduled events, delay queue items, feedback loop metadata, optional bounded ledgers, and bounded metadata. Current bounds are 1,000 scheduled events, 1,000 delay queue items, 500 feedback loops, 1,000 ledger entries, and bounded JSON/payload sizes.

Feedback, delay, and event primitives represent model structure. They do not by themselves prove causal relationships, real-world feedback loops, or predictive validity.

Prompt 17 adds service-level feedback/delay/event primitives. Full visual feedback-loop editing, delayed resource/network dynamics, and causal validation require later model schema, rule primitive, validation, and visual builder phases.

Scheduled events are sorted deterministically by tick, priority, and id. Release helpers return due events with `tick <= requestedTick` and remove them from the returned queue; exact-tick lookup is available through query helpers. Events do not execute arbitrary payloads and do not mutate engine state in V1; callers receive application results for template-owned interpretation. Delay helpers schedule bounded payloads for `releaseTick = scheduledAtTick + delayTicks`, release or peek due items with `releaseTick <= requestedTick`, and never mutate input queues. Exact delay release-tick lookup is available through query helpers.

Feedback loops are declared as `reinforcing`, `balancing`, or `unknown`. That classification is metadata, not causal discovery. V1 feedback helpers accept caller-provided finite numeric signals, compute `requestedAdjustment = signalValue * gain`, apply optional clamp bounds, and return adjustment results. A loop `delayTicks` value is bounded metadata for future scheduling; templates must explicitly use the delay helpers if they want delayed feedback. There are no arbitrary equations, expression parsers, feedback-loop editors, event timeline editors, causal discovery tools, or control optimization in V1.

V1 metrics include scheduled/released event counts, delay queue size, released delay item count, feedback loop counts by type, enabled loop count, average/max delay ticks, ledger counts, event/delay type counts, feedback adjustments by target, and clamped feedback count. Metrics are finite structural and operational summaries, not causal proof.

Current production templates do not use these primitives at runtime. Their `supportsEvents`, `supportsDelays`, `supportsFeedbackLoops`, and `supportsFeedbackMetrics` flags are false until a template actually uses event, delay, or feedback services. RunConfig and scenario schemas intentionally reject unsupported event/delay/feedback fields in V1. Future feedback-capable templates should introduce event, delay, or feedback options only behind explicit capability flags and validate them with `src/simulation/feedback`.

Resource-feedback, network-feedback, feedback/delay uncertainty, delayed resource flows, network diffusion delays, edge-mediated events, and feedback-adjusted rates are future work. Prompt 17 does not wire those concepts into current runtime dynamics.

## Current Capability Vs Reserved Future Capability

Currently implemented as service-first primitives: networks/relations, resources/stocks/flows, feedback/delays/events, uncertainty, assumptions/limits/ethics, hybrid composition, multi-scale structure, scale view state, boundaries/environment, spatial fields/environmental layers, observability/measurement models, causal assumption/influence models, units/dimensions/quantity semantics, emergence/pattern descriptors, robustness/resilience/stress-test semantics, strategy/control/intervention semantics, model schema declarations, knowledge/memory/social-learning semantics, visual builder workspace schemas, and template/schema compatibility mapping.

Currently not implemented: true multi-scale runtime, scale-aware renderer/UI, Scale Lens / Coarse-Graining, fractal metrics, fractal spatial generators, network scaling analytics, hierarchical trajectory motif analytics, runtime observability measurement collection, runtime causal influence execution, runtime emergence detection, runtime robustness/resilience stress testing, runtime strategy/control execution, model schema runtime execution, model schema compiler/interpreter runtime, schema-to-template conversion, compatibility-based runtime execution, runnable visual model builder, graph editor UI, drag-and-drop model execution, visual programming, schema execution, scenario/RunConfig/snapshot/template generation from workspace schemas, compatibility reports, or scenario plans, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, LLM-per-agent runtime, real-person inference, protected-class inference, causal discovery/proof/inference/do-calculus/intervention optimization, runtime spatial-field sampling/diffusion/advection, runtime unit enforcement, automatic unit conversion, dimensional equation solving, multi-rate time, generic adaptive agents beyond the narrow Neural RPS/readout lab slice, heterogeneity layer, phase transition tools, attractor/basin tools, trace inspection, error budgets, calibration/data assimilation/MCMC, and external framework interop.

Service-first primitives are foundations, not active model behavior. A template should not claim support for a primitive until its runtime actually uses that primitive.

Zooming the camera is not the same as multi-scale modeling. Multi-scale ORTUS models will require explicit scale levels, aggregation rules, disaggregation rules, cross-scale coupling, and warnings when detail is synthetic or lost.

Model state is not the same as observable reality. Observability V1 distinguishes internal simulated state and runtime metrics from measured, partial, noisy, proxy, synthetic, or empirical observation definitions, but it does not execute measurement, calibration, validation, inference, or data assimilation.

`src/simulation/observability` contains Observability + Measurement Model V1. It validates, serializes, queries, and summarizes `ObservabilityModel` artifacts that declare observable, latent, and unobserved variables plus measurements, schedules, and measurement processes. Runtime metrics are model outputs; they are not automatically empirical observations. An observability model defines how something could be measured; it does not collect, calibrate, or validate data. Synthetic observations are generated or declared model-side; they must not be treated as observed evidence. Active measurements are structural declarations, not runtime-executed data collection. Current templates do not runtime-support observability, and validation/calibration remains future work.

Relations, feedback loops, and events can encode model assumptions, but they do not by themselves prove causal relationships in the real world.

`src/simulation/causality` contains Causal Assumptions + Influence Structure V1. It validates, serializes, queries, and summarizes `CausalAssumptionModel` artifacts that declare variables, influence edges, assumptions, evidence items, and intervention links. Causal assumption models declare influence assumptions; they do not prove causality. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves. Active causal influences are structural declarations, not runtime-executed behavior.

V1 does not discover causality, perform do-calculus, infer hidden state, solve structural equations, optimize interventions, calibrate, validate, ingest external data, or make current templates causal-assumption-aware. Evidence items and empirical claims are provenance metadata, not proof.

`src/simulation/quantities` contains Units, Dimensions + Quantity Semantics V1. It validates, serializes, queries, and summarizes `QuantitySemanticsModel` artifacts that declare dimensions, units, quantities, ranges, and compatibility rules. Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics. Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency. Per-tick rates are model-time rates unless a physical time mapping is explicitly defined.

V1 does not enforce runtime units, automatically convert values, solve equations, run symbolic algebra, calibrate, validate, or make current templates quantity-aware. Observability measurement units do not imply measurement validity, causal unit consistency does not imply causal proof, and resource/flow or feedback metadata is not unit-enforced unless future runtime work explicitly wires it in.

`src/simulation/emergence` contains Emergence Detection + Pattern Descriptors V1. It validates, serializes, queries, and summarizes `EmergencePatternModel` artifacts that declare candidate patterns, signatures, thresholds, time windows, variables, and scale links. Emergence pattern descriptors describe candidate patterns; they do not prove emergence. Visual patterns and runtime metrics are model outputs, not empirical proof of emergence. Active pattern descriptors are structural declarations, not runtime-detected results.

V1 does not detect patterns at runtime, compute over snapshots or metric histories, perform statistical significance testing, run ML clustering/anomaly detection, validate model output against reality, calibrate, or make current templates emergence-aware. Multi-scale structure, observability references, causal assumptions, and quantity consistency do not prove emergence.

`src/simulation/robustness` contains Robustness, Resilience + Stress Testing Semantics V1. It validates, serializes, queries, and summarizes `RobustnessResilienceModel` artifacts that declare stressors, response criteria, failure modes, and stress-test plans. Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient. Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations. Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves.

V1 does not execute stress tests at runtime, perturb active simulations, run experiments, compute over snapshots or metric histories, perform statistical validation, certify safety or operational readiness, optimize controls, calibrate, validate, or make current templates robustness-aware. Existing interventions are not general stress testing unless explicitly modeled and evaluated.

`src/simulation/control` contains Strategy, Control + Intervention Semantics V1. It validates, serializes, queries, and summarizes `ControlStrategyModel` artifacts that declare strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, and expected effects. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops.

V1 does not execute strategies at runtime, execute template interventions, run closed-loop control, optimize policies, prove intervention effectiveness, estimate causal or treatment effects, certify safety or operational readiness, calibrate, validate, or make current templates strategy/control-aware. Runtime metrics are model outputs, not empirical strategy evidence. Causal assumptions do not prove intervention effects, robustness descriptors do not prove strategy robustness, and uncertainty ensembles are not policy validation by themselves.

## Model Schema

`src/simulation/modelSchema` contains Model Schema + Interpreter Foundation V1 as a headless structural service. A `ModelSchemaDefinition` artifact uses artifact type `ortus.modelSchema` and declares entity, component, attribute, space, parameter, metric, rule-declaration, and artifact-reference structure in bounded plain JSON.

Model schemas declare model structure; they do not execute rules or create runnable simulations. A valid model schema is not a template, scenario, RunConfig, or snapshot. Rule declarations are descriptive metadata, not parsed formulas or executable behavior. Active means structurally active, not runtime-executed.

The service validates, serializes, deserializes, queries, summarizes, and reports interpreter capability gaps. It does not parse formulas, compile models, create templates, generate scenarios, generate RunConfigs, produce snapshots, call template constructors, or mutate runtime state. Current production templates are hand-built runtime models, not generated from model schemas.

Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or generic social-learning runtime. Runtime interpreter/compiler work, runnable visual model builder support, external framework interop, validation/calibration, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, and LLM agents remain future work.

Prompt 35 adds a React authoring surface under `src/components/builder`; the simulation service remains headless. Model Schema Authoring Forms V1 creates structural model-schema artifacts; it does not execute schemas. Rule declarations authored in the Builder are descriptive only and remain non-executable. A valid authored schema is not a runnable simulation. The schema authoring UI does not generate templates, scenarios, RunConfigs, snapshots, or engines.

The authoring adapter calls the existing model-schema validator, interpreter-capability report, summary, serializer, deserializer, and registry query helpers. Invalid drafts remain UI-local and editable; only valid artifacts can be exported through `serializeModelSchema`. Failed imports preserve the current draft and last valid artifact. The UI does not import `SimulationEngine`, template runtimes, the simulation store, compatibility execution, or social-learning runtime. Prompt 36 Graph View does not read, convert, or mutate the Author Schema draft.

Prompt 37 adds UI-only validation assistance under `src/components/builder/validation`. The adapter consumes the existing model-schema validation/capability report and current draft, then derives grouped issue cards, counts, section jumps, original validation messages, copyable diagnostics, and bounded repair suggestions. Repair suggestions are structural editing assistance only. They do not make a schema runnable, infer correct model behavior, validate scientific meaning, execute rules, parse formulas, generate templates, scenarios, RunConfigs, snapshots, engines, compatibility conversions, visual-builder workspaces, or activate social-learning runtime. Repairs mutate only the current UI draft through named structural operations, reject stale suggestions, and re-run validation afterward; they do not mutate engine state, templates, loaded workspaces, last-valid artifacts, scenarios, snapshots, or other simulation artifacts.

Prompt 37B hardens that UI-only validation assistance without changing the headless simulation engine. Repair suggestions are structural editing assistance. They do not make a schema runnable. A repaired schema may be structurally valid and still have no runtime implementation. ORTUS does not infer the correct model behavior from validation repairs. Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines. Confirmation-required repairs require an explicit confirmation option in the helper API, suggestions expose `canApply`, malformed and prototype-like patches are rejected, issue groups are deterministic, rule repair copy remains non-executing, and repaired drafts export only through the existing model-schema serializer.

Prompt 38 adds UI-only schema-to-template fit reporting under `src/components/builder/fitReport`, and Prompt 38B audits/hardens that UI/report layer. The adapter wraps the existing headless `src/simulation/schemaTemplateCompatibility` service and compares only the current structurally valid Author Schema draft against static template mapping profiles. Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents. Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Rule fits are structural comparisons. Rule declarations are not executed. Fit score is a structural summary, not a runtime readiness score. Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles. Builder graphs remain structural inspection views. Fit reports do not make them executable. Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability. MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report. This fit report may be stale because the schema changed after it was generated. Refresh the report before using it. Invalid current drafts disable report generation instead of falling back to a previous valid draft.

Prompt 39 adds UI-only scenario planning under `src/components/builder/scenarioPlanning`, and Prompt 39B audits/hardens that slice. The adapter consumes the current structurally valid Author Schema draft and the resolved current non-stale fit-report UX model when available, then emits bounded serializable planning data and plain-text diagnostics. Scenario planning from schema is a planning aid. It does not create runnable scenarios. Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state. Scenario questions are hypotheses to explore, not predictions or validated conclusions. A scenario plan can suggest what to inspect, but it does not prove what will happen. Conceptual interventions are not executable controls. Suggested metrics are not empirical measurements. Data needs do not imply the current schema is calibrated. Assumption checks identify what the modeler should clarify. They do not resolve the assumption. Fit reports describe structural resemblance. Scenario plans describe possible study designs. Neither one makes a schema runnable. Invalid schemas disable planning, stale fit reports disable planning until refreshed, schema or fit-report source changes mark dependent scenario plans stale until refreshed, MR0 concepts remain future-only planning gaps, and Neural Strategy Adaptation remains local to Neural Runtime Lab. Scenario planning does not provide medical/public-health prediction, weather forecasting, policy recommendation, persuasion optimization, targeting logic, real-human-behavior prediction, or gambling assistance. Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified. This adds no simulation-engine behavior.

Prompt 35B keeps unsafe-content enforcement in the headless model-schema validator and broadens rejected profiling, protected-class inference, diagnosis, persuasion, and targeting payload keys. UI hardening remains outside the engine: pre-read file-size checks, modal confirmations, tab semantics, validation announcement scope, conservative preservation of imported non-text JSON values, and responsive layout changes do not alter simulation behavior.

## Knowledge, Memory + Social Learning Semantics

`src/simulation/socialLearning` contains Knowledge, Memory + Social Learning Semantics V1 as a headless structural service. A `KnowledgeMemorySocialLearningModel` artifact uses artifact type `ortus.knowledgeMemorySocialLearningModel` and declares symbolic knowledge items, belief variables, belief-state descriptors, bounded memory traces, attention/salience profiles, trust/source profiles, exposure channels, social signals, learning-rule descriptors, background prior profiles, relationship roles, norm descriptors, and decision couplings.

Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition. Background profiles are compressed prior descriptors, not simulated life histories. Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals. LLM-per-agent runtime is not implemented and must not be implied.

The service validates, serializes, deserializes, queries, summarizes, and reports capability gaps. It does not execute social learning, update runtime beliefs or memory, sample social exposure, infer real-person traits, support protected-class inference, validate psychology, predict people, optimize persuasion, provide policy targeting, or mutate Opinion Dynamics.

Opinion Dynamics now has a narrow template-owned `socialLearning` behavior mode. Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition. Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template. Opinion values and social-learning metrics are model outputs, not measured human beliefs. Information-source credibility is a model parameter, not a verified truth score. No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.

## Visual Builder Workspace

`src/simulation/visualBuilderWorkspace` contains Visual Model Builder Workspace Schema V1 as a headless structural service. A `VisualBuilderWorkspaceDefinition` artifact uses artifact type `ortus.visualBuilderWorkspace` and declares future workspace identity, referenced model schema and artifact ids, visual nodes, visual edges, panels, sections, validation markers, warning markers, unsupported/future-only markers, layout metadata, selection metadata, viewport metadata, notes, summaries, and validation reports in bounded plain JSON.

Visual builder workspaces are structural planning artifacts; they do not implement runnable visual model authoring. Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior. A valid visual builder workspace does not make a model schema runnable. Prompt 32 does not add drag-and-drop modeling, visual programming, or schema execution.

The service validates, serializes, deserializes, queries, summarizes, and reports capability gaps. It does not render a graph, mutate the current UI, execute node graphs, parse formulas, run rule descriptions, compile schemas, create templates, generate scenarios, generate RunConfigs, produce snapshots, create engines, add external framework interop, implement social-learning runtime, or add LLM agents. Active means structurally active, not runtime-executed.

Prompt 34 adds a separate React UI shell under `src/components/builder` and route `/builder`; the simulation service itself remains headless. Prompt 34B audits and hardens that UI shell plus workspace information architecture without changing simulation behavior. Prompt 35 adds a sibling Author Schema mode while keeping workspace inspection read-only. Prompt 36 adds a sibling read-only Graph View that consumes only the already-validated loaded workspace through a UI presentation adapter. Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges. The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime. A structurally valid workspace is still not a runnable model. Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics. Workspace import also does not replace or activate schema-authoring state. The workspace inspector imports and exports only `ortus.visualBuilderWorkspace` artifacts through the existing serializer/deserializer, keeps selection and viewport state separate from simulation state, and does not create engines, mutate templates, generate scenarios/RunConfigs/snapshots/templates, or subscribe to live simulation ticks.

Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges. Graph selection, filtering, panning, and zooming are UI-only state. Graph View is not visual programming, schema execution, or runtime generation. A graph that looks complete is still not a runnable model. Graph layout is deterministic and presentation-only, warning and unsupported/future/service-only markers remain visible, metadata is rendered as text, and oversized visual graphs fall back to the accessible outline. The graph view does not import the engine, templates, simulation store, compatibility execution, or social-learning runtime.

Prompt 36B hardens the Graph View audit boundary. Warning markers, validation markers, unsupported markers, future-only markers, service-only items, global notices, and missing runtime capabilities are counted explicitly rather than collapsed into a generic warning count. Selection, filtering, panning, zooming, and Fit Graph remain React UI state only and do not mutate source artifacts or simulation state. Rendered responsive behavior, browser zoom behavior, and assistive-technology behavior are not claimed as verified from source tests alone.

## Template/Schema Compatibility Mapping

`src/simulation/schemaTemplateCompatibility` contains Template/Schema Compatibility Mapping V1 as a headless structural service. `ortus.schemaTemplateCompatibilityReport` and `ortus.templateMappingProfile` artifacts compare validated `ModelSchemaDefinition` structure with static production-template metadata.

Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, engines, or agents. Prompt 38 is a UI/report view over this service, not a hidden schema interpreter, conversion engine, repair system, template mutator, or runtime activation path. Prompt 38B keeps stale-state tracking, copy diagnostics, and deterministic ranking in the UI/report adapter only; it does not change engine runtime semantics.

The service validates, serializes, deserializes, queries, summarizes, and reports capability gaps. It does not execute schemas, parse formulas, run `ruleDescription`, compile model definitions, mutate templates, generate runtime artifacts, create engines, implement runnable visual builder runtime, add external framework interop, run social-learning/cognitive behavior, infer real-person traits, support protected-class inference, optimize persuasion, validate science, calibrate outputs, or prove causality, emergence, robustness, strategy effectiveness, safety, or operational readiness. Prompt 33B audited these boundaries; Prompt 33C added only the narrow Opinion Dynamics `socialLearning` behavior mode, and Prompt 33D audited that slice without expanding it.

Prompt 18 reserves these pillars in `../../docs/roadmap.md` and `../../docs/missing-pillars.md`.

## Systems Primitive Registry

`src/simulation/registry` is a headless source of truth for primitive status, support level, artifact families, and production-template capability summaries. It records implemented runtime primitives, service-only primitives, metadata-only primitives, and reserved future pillars without changing engine dynamics.

Global service availability is not template support. A primitive can exist as a headless service without making templates runtime-capable; only explicitly wired and tested template slices may claim runtime support.

Reserved primitives are roadmap commitments, not implemented behavior. A template capability is runtime-active only when the template runtime actually uses that primitive. Prompt 20 should use the registry for hybrid composition planning and must not infer support from module presence alone.

The registry does not change runtime behavior by itself. Neural Excitation uses its own runtime network graph; no current production template runtime uses resource/stock/flow services or feedback/event/delay services.

## Hybrid Model Composition

`src/simulation/composition` contains Hybrid Model Composition V1. It validates, serializes, summarizes, and checks capability requirements for structural primitive combinations. It can describe a base template plus scenario, assumption, uncertainty, network, resource, event, delay, feedback, or declared future primitive attachments.

Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented.

Attaching a primitive artifact to a composition does not automatically make a template use that primitive. The composition layer does not execute attached artifacts, does not compile custom models, and does not silently wire networks, resources, feedback, or events into current templates.

Hybrid compositions may reference template/schema compatibility reports and template mapping profiles structurally. Those references do not make a composition runnable and do not satisfy model schema execution, visual builder runtime, conversion, generation, validation, calibration, external interop, or social-learning runtime capabilities.

## Multi-Scale Systems Architecture

`src/simulation/multiscale` contains Multi-Scale Systems Architecture V1. It validates, serializes, summarizes, and queries structural scale models with scale levels, entity types, aggregation rules, disaggregation rules, and cross-scale links.

Camera zoom is not multi-scale modeling. Camera zoom changes rendering; model-scale architecture requires explicit scale levels, aggregation/disaggregation rules, cross-scale links, and warnings about lost or synthetic detail.

Aggregation can lose information, and disaggregation can create synthetic detail. Synthetic detail must not be treated as observed or already modeled detail.

A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics. Aggregation rules, disaggregation rules, and cross-scale links must have `executable: false` in V1. Current templates do not runtime-support multi-scale, and runtime compiler/interpreter work remains future.

## Scale View State

`src/simulation/scaleView` contains Multi-Scale Zoom + View System V1. It validates, serializes, summarizes, and derives deterministic model-scale transitions for a `ScaleViewState` that references a `MultiScaleModel` by id.

Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.

Scale transitions in V1 do not execute aggregation or disaggregation rules. They only change `currentScaleId`, preserve camera metadata by default, record bounded transition history, and surface information-loss or synthetic-detail warnings.

A scale view state can navigate a scale model, but it does not make a template multi-scale capable. Current templates do not runtime-support scale-aware views, no renderer rewrite is included, and runtime compiler/interpreter work remains future.

## Boundaries + Environment

`src/simulation/boundaries` contains Boundaries + Environment Layer V1. It validates, serializes, queries, and summarizes `BoundaryEnvironmentModel` artifacts that declare system scope, environment scope, boundary surfaces, exchanges, external forcings, and exogenous shocks.

Active boundary exchanges are structural declarations, not runtime-executed flows.

World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model.

A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open. V1 does not execute exchanges, forcings, shocks, or spatial fields, and current templates do not runtime-support boundaries/environment. Model schema/compiler work remains future.

Closed/open boundary contradictions are surfaced as structural warnings for review, not as proof that the model can execute environmental dynamics.

## Spatial Fields + Environmental Layers

`src/simulation/spatialFields` contains Spatial Fields + Environmental Layers V1. It validates, serializes, queries, and summarizes `SpatialFieldModel` artifacts that declare coordinate spaces, spatial fields, environmental layers, and sampling rules.

Spatial fields are structural layer definitions, not runtime diffusion or GIS engines.

World coordinates, grids, and positions are not the same as explicit environmental field layers.

A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.

V1 does not execute diffusion, interpolation, advection, field sampling, terrain rendering, agent-field coupling, resource-field coupling, or boundary exchange coupling. Active fields, layers, and sampling rules are structural declarations, not runtime behavior. Measured fields require provenance to be trustworthy, synthetic fields must not be treated as observed detail, and current templates do not runtime-support spatial fields. Boundary models and spatial fields are related but distinct. Prompt 25 adds Observability + Measurement Model V1 as structural measurement metadata, and runtime compiler/interpreter work remains future.

## Interventions

`src/simulation/interventions` contains a headless intervention framework. Templates expose intervention definitions with ids, labels, target requirements, parameter definitions, validation, documentation, and a command builder. `executeIntervention` validates the requested template/intervention, resolves intervention parameters, builds commands from a read-only world view, and applies them through `SimulationEngine.applyCommands`.

Interventions apply immediately at the current tick and do not advance engine time. They are different from parameter changes: parameters rebuild or configure a run, while interventions perturb the current run state through validated commands. Same initial snapshot plus the same intervention sequence and seed should continue deterministically.

Validation rejects unsupported intervention ids, stale or destroyed selected entities, missing required components, invalid parameter ranges, non-finite points/vectors, malformed history records, and invalid template-specific transitions. Radius target sets are computed only at apply time. Intervention definitions also declare supported templates, capability requirements, mutation kinds, and event-log type metadata.

V1 template interventions:

- Epidemic Spread: infect selected susceptible agent; infect susceptible agents in radius.
- Opinion Dynamics: set selected opinion; broadcast an opinion pulse in radius.
- Predator-Prey: add prey near a target point; remove selected predator/prey.
- Schelling Segregation: swap selected agent group. Relocation is deferred until empty-cell target workflows are stronger.
- Flocking / Boids: apply impulse to selected boid; scatter boids in radius.

Applied and failed interventions are recorded as bounded world history under engine globals, with a default maximum of 500 records. Snapshot export/import preserves applied intervention history because snapshots include world globals. Scenario export/import does not replay mid-run interventions in V1; it restarts from initial template, parameter, seed, and metadata state.

## Structured Event Log

`src/simulation/kernel/EventLog.ts` provides a bounded structured event log under world globals. It records run/session audit entries such as `run.initialized`, `scenario.applied`, `intervention.applied`, and `intervention.failed`. Event entries include event id, tick, type, source, deterministic order, optional target/label/payload, severity, and category.

The event log is not event sourcing, not a snapshot replacement, and not authoritative simulation state. It is a bounded audit trail for explainability, run summaries, and future shocks or delayed effects. Snapshot restore sanitizes and bounds the log; run summaries may include bounded event summaries.

Interventions are exploratory perturbations. They help users study model behavior under controlled changes, but they are not real-world policy predictions.

## Run Summaries And Comparison

`src/simulation/runs` contains headless run-summary and comparison utilities. A saved run summary is a bounded comparison artifact, not a scenario or snapshot. It records template id/name/version, seed, parameters, ISO capture timestamp, captured tick/time, finite final metrics, bounded metric history, bounded intervention summaries, source (`manual`, `experiment`, or `imported`), labels, notes, tags, and optional metadata. It does not store full world state by default.

Run summaries can be built from an interactive snapshot or converted from an experiment run result. Manual summaries can include bounded metric traces from the engine snapshot. Experiment summaries preserve final metrics and swept parameter metadata, but no metric history unless a future experiment mode explicitly captures bounded history.

`compareRunSummaries` chooses the first selected run as the default baseline unless a baseline id is supplied. It reports metadata, differing parameters, finite final metric deltas, percent deltas only when the baseline is nonzero, warnings for mismatched templates, and overlapping numeric metric comparison for mixed-template selections. Missing or nonnumeric metric values are kept out of numeric deltas so comparison output does not produce `NaN`.

The browser storage helper lives outside the engine in `src/lib/localRunStorage.ts`. It validates loaded records, ignores corrupted storage gracefully, salvages valid records from partially malformed libraries, and enforces a V1 library limit of 50 saved summaries. This storage is UI workspace state and is not authoritative simulation state.

Run comparisons are exploratory. Differences between runs can suggest patterns, but they do not prove causal relationships without careful experimental design.

## Template Definition API

A template exports a `SimulationTemplate` model-family definition with capability flags, explicit space metadata, entity/agent type metadata, parameter definitions, formal metric definitions, optional initialization presets, optional behavior-mode metadata, optional agent-composition and environment-option definitions, documentation, `createInitialWorld`, system registration, metric registration, visual metadata, and optional validation hooks. Production templates are listed in `src/simulation/templates/registry.ts`; UI descriptors must stay aligned with that registry but remain outside the engine.

Capability flags make support explicit. Current production templates support Scenario Builder, initialization presets, behavior mode metadata, metric history, run comparison, experiment runner, snapshot export, interventions, and Uncertainty Layer V1 through RunConfig-level sampling. Future-facing capabilities such as resources, stocks, flows, resource metrics, events, delays, feedback loops, feedback metrics, and environment layers are false unless actually implemented. Runtime network support is true only for Neural Excitation Network and only for its template-owned runtime graph.

Space metadata declares the model field shape (`continuous2d`, `grid2d`, or a narrowly owned `hybrid` field in V1). Entity/agent type metadata declares the user-facing agent categories without becoming simulation truth. Metric definitions now include history/comparison/display metadata so charts and run comparison can rely on declared metric semantics rather than guessing.

Built-in templates currently include Epidemic Spread, Opinion Dynamics, Predator-Prey, Schelling Segregation, Flocking / Boids, Forest Fire / Landscape Spread, and Neural Excitation Network.

Schelling is a grid-based template that uses `Grid2DSpace`, command-buffered movement, seeded initialization and movement selection, and metrics for satisfaction, similarity, group counts, movement, and empty cells. Its one-agent-per-cell rule is enforced as a template invariant so the generic grid space can remain reusable for other models.

Flocking / Boids is a continuous-space template that uses `Continuous2DSpace`, command-buffered velocity and position updates, deterministic seeded initialization/noise, and metrics for speed, neighbor count, local density, alignment, dispersion, and living boid count. It demonstrates that another movement-heavy model can be added through the same plugin API without a new simulation loop or engine-specific changes.

Neural Excitation Network is a hybrid-space template that uses deterministic topology generation, bounded abstract activation state, a bounded delayed signal queue, refractory cooldown, excitatory/inhibitory signal scaling, optional bounded Decision Readout V1, and model-output metrics. Metrics are model-output history, not empirical neural recordings. Activation and synchrony are stylized runtime variables, not biological measurements. Decision metrics are readouts from labeled output assemblies, not evidence of reasoning.

To add a template:

1. Create a new file under `src/simulation/templates`.
2. Export a `SimulationTemplate`.
3. Build initial state with `World`, entity stores, component stores, spaces, and seeded RNG from the template context.
4. Add initialization presets only when they are meaningful for initial-condition authoring.
5. Add behavior modes only when they are real, template-owned variants; unsupported modes must be rejected.
6. Add agent-composition or environment-option definitions only when they map to validated template setup choices.
7. Declare capabilities, space definition, entity/agent type definitions, metric definitions, and honest assumptions/limitations metadata.
8. Register behavior systems through `SystemRegistry`.
9. Register metrics through `MetricsCollector`.
10. Add the template to `src/simulation/templates/registry.ts`.
11. Add UI descriptor metadata in `src/lib/templateVisuals.ts` for labels, legend entries, accent, and background atmosphere.
12. Add behavior, determinism, import/export, scenario, and visual render-model tests.

No engine internals should need edits for a new template.

## Adapter Strategy

Adapter files are contracts only. Mesa, NetLogo, and MASON support is future work for schema mapping or external execution. V1 does not include runtime bridges or product features for those platforms.

## Runtime Performance Model

Service primitives such as networks, resources, feedback, spatial fields, observability, causality, quantities, emergence, robustness, and control remain service-only or metadata-only unless a production template runtime explicitly uses them. Runtime performance metadata describes current hot loops and conservative stress targets; it does not turn reserved or service primitives into active template behavior.

Default entity counts are UX defaults, not engine limits. Stress counts in `runtimeMetadata` are local benchmark targets that need evidence before being treated as safe product limits. ORTUS should not claim high-scale support without benchmark data from the current runtime and template configuration.

Interactive UI runs advance the headless engine through fixed ticks, create a fresh snapshot when an animation frame has one or more completed ticks, publish that snapshot through Zustand, and render the World Stage with a batched canvas pass. The engine state remains the source of truth; snapshots are cloned/serialized views for UI consumption and import/export safety.

Optional performance instrumentation is available through `SimulationEngine` options or, in the browser UI, by setting `localStorage.setItem("ortus.performanceInstrumentation.v1", "enabled")` before creating/resetting a run. Removing that key disables it. Instrumentation records bounded last-N tick, metric, snapshot, frame/update, entity-count, and operation-counter samples. It does not alter model semantics and does not log every frame.

Movement-heavy templates need explicit spatial/projection services when local interactions dominate runtime. `Grid2DSpace` already supports local grid neighborhoods. `src/simulation/spatialIndex` provides the headless `ContinuousSpatialHashIndex` for deterministic continuous 2D local-radius lookup. Generic `Continuous2DSpace.queryNeighbors` now uses a versioned lazy `ContinuousSpatialHashIndex` for finite local-radius queries in non-tiny worlds, reusing the index across repeated queries until positions change. Tiny worlds and broad/global-radius queries keep deterministic all-pairs fallback. Arbitrary external `queryRadius` calls remain linear so existing boundary semantics are not silently changed.

Schelling uses `Grid2DSpace` with a per-tick occupancy map, so neighbor lookups do not scan every entity for every neighbor. It still validates and serializes a moderate grid each tick, so V1 defaults are designed for thousands of cells, not large city-scale maps.

Forest Fire / Landscape Spread uses template-owned grid-local spread logic, not SpatialFieldModel or BoundaryEnvironmentModel runtime support. Its tick path uses cached neighbor-index lookup tables, compact numeric state arrays, active burning-cell indices, and changed-component updates. Metrics read current state counts from bounded world globals when available instead of rescanning every cell for every metric. Lightning and regrowth still scan bounded grid cells when enabled. Full engine invariant checks, template validation, snapshot serialization, Zustand publication, and render-grid model creation remain separate scalability costs.

Flocking computes deterministic pair summaries once per tick for separation, alignment, cohesion, neighbor count, and local density. Those summaries are reused by steering, and Flocking emits batched command-buffer commands for velocity, position, and space movement updates. For local-radius queries with at least 100 boids and a perception radius smaller than half the world width/height, Flocking builds a headless `ContinuousSpatialHashIndex` and queries candidate pairs. Tiny flocks and global-radius settings use the all-pairs fallback because the grid overhead or coverage is not helpful. Pair order remains deterministic by sorted entity id.

The Flocking `dispersion` metric is a center-of-mass spread metric, computed as mean distance from the flock center. It is intentionally O(n) and is an approximate flock spread summary, not an average pairwise distance.

Neural Excitation uses sorted template-owned synapse lists for signal emission, a bounded delayed signal queue in world globals, a per-tick firing-fraction saturation guard, and an optional scan over three bounded output assemblies for Decision Readout V1. Template RPS payoff computation is a trivial observational lookup and does not train, optimize, adapt the core neural graph, or mutate synapse weights. Prompt N2 lab adaptation is a separate bounded local RPS/readout layer that uses explicit round history to bias future output-assembly stimulus/readout behavior only. Prompt N2B hardens that UI layer's reset/truncation semantics and malformed-round handling without changing engine behavior. Its UI edge drawing and readout panel are bounded and read-only. This runtime graph belongs only to the Neural Excitation Network template. It does not make Builder graphs or model-schema graphs executable.

The dedicated Flocking baseline script can be run with:

```bash
./node_modules/.bin/vite-node src/simulation/testing/flockingPerformanceBaseline.ts
```

The broader local performance report can be run with:

```bash
npm run perf:simulation
```

The report is non-asserting and intended for diagnosis. It includes elapsed time, ticks/sec, average scheduler compute time, average metrics time, validation/overhead remainder, snapshot creation time, render-model preparation time where accessible, entity/cell count, metrics-history length, continuous-space query counters, flocking pair checks, and forest-fire changed-cell counters. Timing varies by machine; use operation counters and repeated runs before making scalability claims.

Latest direct Flocking baseline:

| Scenario | Elapsed ms | Avg ms/tick | Final entities | Metrics records |
| --- | ---: | ---: | ---: | ---: |
| 100 ticks / 180 boids | 2162.74 | 21.6274 | 180 | 100 |
| 300 ticks / 180 boids | 4237.02 | 14.1234 | 180 | 300 |
| 300 ticks / 300 boids | 8423.42 | 28.0781 | 300 | 300 |

These are coarse regression baselines, not portable performance guarantees. Structural counters are more reliable than timing for this optimization: in one default-radius run, 160 boids had 12,720 theoretical all-pairs checks and 7,278 spatial-hash candidate checks; 300 boids had 44,850 theoretical all-pairs checks and 25,847 spatial-hash candidate checks. UI layers should avoid React component-per-agent rendering and should render from snapshots with batching or canvas/WebGL-style primitives.

Experiment runs execute locally and are chunked between completed trials so the browser can update progress and respond to cancellation. V1 does not use Web Workers, does not store per-run snapshots, and enforces run-count limits to avoid accidental long synchronous sweeps.

Interventions add no per-frame engine work. Radius target sets are computed only when the intervention is applied, and recent visual/target state stays in the UI layer.

Run comparison adds no per-frame simulation work. The UI captures summaries only on explicit user actions, stores bounded metric histories and intervention summaries, plots traces on shared tick/value axes, and writes to local storage only on capture, import, edit, delete, or clear operations.

Scenario Builder previews instantiate a separate tick-0 engine after a short UI debounce. They do not run the simulation forward, do not write to local storage while editing, and do not mutate the active engine until the user applies a validated scenario. Scenario variant fields are bounded JSON setup metadata and are not full world state.

## Known Limitations

- Continuous-space templates can still have pairwise interaction costs. Flocking avoids the default-count all-pairs path for local-radius queries, but global-radius settings and other templates may remain CPU-bound.
- Schelling has a simplified binary group identity and movement rule. It omits income, policy, housing price, road networks, institutional constraints, and history.
- Flocking has simplified forces, shared rules for all boids, no obstacles, no leaders, no predation, no energy/fatigue, and no vision cones in V1.
- Component validation is generic JSON/finite-number validation, not per-template scientific calibration.
- The experiment runner aggregates numeric final metrics only in V1; time-series comparison, heatmaps, and Web Worker execution are future work.
- Intervention history is inspectable and snapshot-preserved, but V1 does not include undo, scheduled future interventions, or scenario replay of intervention sequences.
- Scenario Builder does not store snapshots by default, does not replay interventions, does not include a no-code rule editor, and is not yet wired as a base-config source for Experiment Runner.
- Run comparison stores bounded summaries for local comparison only. It does not restore saved runs, replay histories, import external comparison files, or infer causality from deltas.
- Templates are educational model structures and should not be treated as predictive scientific tools.
- Rendering, interaction, dashboards, storage, and external model runtimes are intentionally outside this prompt.
