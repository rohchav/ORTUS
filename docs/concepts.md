# ORTUS Concepts And Architecture Vocabulary

ORTUS is organized around a small set of simulation concepts. Keeping these boundaries explicit prevents model-family definitions, live run state, exploratory comparisons, and UI workspace data from collapsing into one ambiguous artifact.

## Core Vocabulary

### Template

A template is a model family definition. It defines the engine-facing model contract: space type, entity and agent archetypes, parameter definitions, metrics, visual mappings, initialization presets, scenario variant metadata, behavior modes, interventions, assumptions, limitations, and capabilities. A template is not a single saved run; it is the reusable model family from which runs are created.

Templates own domain behavior. Template-specific rules should live in template systems, initialization hooks, intervention definitions, or future template-owned behavior-mode implementations, not in React components.

Production templates expose formal metadata through the `SimulationTemplate` shape: capability flags, `spaceDefinition`, `entityTypeDefinitions`, `parameterDefinitions`, formal metric metadata, documentation, initialization presets, behavior modes, agent composition definitions, environment option definitions, and engine factory hooks such as `createInitialWorld`, `registerSystems`, and `registerMetrics`.

Forest Fire / Landscape Spread is a production template, not a generic spatial-field runtime. It is an abstract local-spread grid model for qualitative spread, threshold, fragmentation, and emergence exploration. It is not a wildfire predictor, does not use GIS, real terrain, wind, humidity, weather, suppression, firefighting, or calibrated fire probabilities, and its grid coordinates are not SpatialFieldModel runtime support. Its template-owned boundary mode is not BoundaryEnvironmentModel runtime support.

Forest-fire runtime optimizations are implementation details inside that template: cached grid-neighbor indices, compact per-tick state arrays, active burning-cell indices, changed-component updates, and current state-count globals for metrics. They do not add SpatialFieldModel runtime support, BoundaryEnvironmentModel runtime support, wildfire prediction, or calibrated fire behavior. Snapshot creation, render-model preparation, and UI publication remain separate runtime costs.

### Scenario

A scenario is an initial-condition and model-variant recipe for starting a fresh run. It contains a seed, validated parameters, initialization preset/options, agent composition, behavior mode, environment options, metadata, and notes. Applying a scenario creates a fresh engine instance at tick 0.

A scenario does not normally contain live post-run state, metric history, applied intervention history, or serialized world/component/space state. Scenario Builder previews also use temporary tick-0 engines, not the active run.

Scenario JSON uses the `ortus.scenario` artifact type, is size-bounded, rejects unknown top-level fields, and rejects metadata that embeds snapshot-like live run state such as world, component, space, RNG, event, metric-history, or intervention-history blobs. Imported scenario template-version mismatches produce warnings and are validated against the current registered template before they can be applied.

### Run

A run is one execution of a template/scenario/run configuration with a specific seed and parameter set. A run may be driven interactively, created from a scenario, produced as one trial in an experiment, or restored from a snapshot.

### RunConfig

A RunConfig is the normalized recipe needed to start a fresh run. It contains a template id, seed, parameters, optional scenario id/name, initialization preset/options, agent composition, behavior mode, environment options, optional uncertainty config metadata for ensemble setup, and metadata.

RunConfig is not a snapshot and not a run summary. It is the common fresh-run input for scenarios, experiments, and uncertainty sampling.

### Snapshot

A snapshot is exact saved simulation state at a specific tick. It includes enough state to restore deterministic continuation, such as the world, component stores, spaces, scheduled events, RNG streams, metrics history, and snapshot metadata.

Snapshots are for restoring a running state. They are not scenario recipes and should not be used as bounded comparison summaries.

### Run Summary

A run summary is a bounded outcome artifact for comparison. It records metadata, seed, parameters, final metrics, optional bounded metric traces, and bounded intervention summaries. It does not normally store full simulation state.

Run summaries are local comparison workspace data, not authoritative engine state and not snapshots.

### Experiment

An experiment is a batch of runs across controlled variations. V1 varies parameters and seeds while creating fresh engine instances through the template registry. Uncertainty Layer V1 adds a headless ensemble service that generates deterministic concrete RunConfigs from a base RunConfig plus uncertainty assumptions; the interactive Experiment Runner UI can call that service later without owning sampling logic.

### Intervention

An intervention is a deterministic perturbation applied during a run. It is template-defined, validated, and executed through the headless intervention executor or engine command APIs. UI and canvas code may collect targets, but they should not mutate agents, components, spaces, or engine internals.

### Behavior Mode

A behavior mode is a template-defined rule variant. Unsupported modes must be rejected. Scenario Builder may select supported modes, but it is not a no-code rule editor.

Behavior modes are template-defined rule variants. They are not arbitrary user-authored rules. Full custom rule authoring will require the future Model Definition Schema, Rule Primitive Library, Model Compiler, and Visual Model Builder.

Scenario Builder is not a full model/rule editor. Custom model authoring will require the future Model Definition Schema, Rule Primitive Library, Model Compiler, and Visual Model Builder.

### Agent Composition

Agent composition describes the initial mix, count, groups, or types of agents/entities for a scenario. It is validated using template-defined parameter definitions and may map to existing model parameters.

Agent composition defines the initial mix of agents, groups, or types for a run. It should not be confused with live engine state or snapshots.

Flocking currently includes a `groupAware` behavior mode. In that mode, initialized boid groups weigh same-group neighbors more strongly for alignment and cohesion while separation still avoids all nearby boids. Ring Formation is an initialization preset only unless an orbit behavior mode is selected. Initial circular placement does not guarantee persistent circular motion.

Current limitations are intentional: most production templates expose only `default` behavior mode, composition fields are still template-owned parameter definitions rather than a standalone model-builder schema, and no user-authored rule graph exists. `groupAware` reuses the same boid neighbor summaries as classic flocking. The flocking implementation may use a deterministic spatial hash for local-radius neighbor queries, but that is a runtime optimization detail, not a new modeling primitive or evidence of spatial-field support.

### Uncertainty Config

An uncertainty config is a plain JSON sampling recipe attached to a RunConfig or ensemble setup. It describes uncertain variables, target fields, a deterministic sampler seed, sample count, output metrics, and notes about assumptions. It is not a scenario, snapshot, run summary, or live engine state.

Uncertainty Layer V1 supports fixed values, continuous uniform ranges, integer ranges, categorical options, and explicit seed ensembles. It prioritizes parameter and seed uncertainty and can safely target template-defined agent composition, environment options, initialization options, or behavior mode only when validation proves the target exists and the sampled values are supported.

An uncertainty ensemble is generated from a base RunConfig plus an uncertainty config. Generated runs are ordinary deterministic RunConfigs with concrete values; unresolved distributions are not carried into generated runs except as provenance metadata. Result sets store final metric summaries and per-run final metrics, not snapshots or full metric history by default.

`baseSeed` is the sampler seed: it controls sampled assumption values. A seed uncertainty variable changes generated run seeds. For `seedEnsemble`, `sampleCount` is the total number of generated samples; explicit seeds are used in declared order and cycle if `sampleCount` exceeds the seed list. Duplicate seeds are retained intentionally, which can be useful for explicit repeated-run provenance.

When a sampled parameter also appears in template-defined agent composition, environment options, or initialization options, V1 synchronizes that overlapping field before RunConfig validation so one sampled value cannot be immediately overwritten by variant defaults. Generated run metadata records `syncedTargetPaths` for this behavior. This is a compatibility bridge for the current parameter-definition-based composition schema, not a general arbitrary nested-object mutation system.

Uncertainty ranges in ORTUS are assumptions unless calibrated against data. Ensemble results show behavior across the specified assumptions; they do not prove real-world probabilities.

Uncertainty Layer V1 does not implement Bayesian calibration, MCMC, data assimilation, full sensitivity analysis, or scenario discovery. Those require later validation, observation, and calibration phases.

Uncertainty Layer V1 is service-first. It supports deterministic ensemble generation and summary statistics, but it is not yet a full uncertainty workbench, calibration system, or sensitivity-analysis dashboard.

There is no dedicated UI panel yet, no time-series envelope export, no grid or Latin-hypercube sampler, and no confidence-interval claim. Percentiles such as p05 and p95 are summaries across user-specified samples, not real-world probability bands.

### Assumptions, Limits + Ethics

Every ORTUS model is an abstraction. The Assumptions, Limits + Ethics panel shows what the model includes, what it excludes, and what uses would be misleading without validation.

An assumption profile is structured plain metadata owned by a template, scenario, uncertainty config, run, or result. For production templates it includes assumptions, limitations, not represented fields, appropriate use, inappropriate use, ethics notes, validation status, and validation notes. Assumption profiles are not simulation state and do not affect engine dynamics.

Validation status describes evidence about the model, not truth about the real world. A model marked internally tested has passed software and invariant checks; it has not necessarily been calibrated or externally validated.

Scenario-specific assumption notes may be saved with scenario JSON, but they do not silently overwrite the template profile. Assumption summaries combine template assumptions plus scenario notes; the current compact UI panel shows the active template profile only, while richer scenario-note editing and display remain future workspace work. Applying a scenario preserves lightweight assumption provenance in run metadata rather than copying large profiles into every run.

Uncertainty variable notes are treated as assumption notes by service-level summary helpers. The compact Assumptions panel does not yet act as an uncertainty workbench. Uncertainty ranges are user-specified assumptions unless calibrated against data, and p05/p95 summaries are sample percentiles rather than real-world probability intervals.

Assumption profile export/import is currently service-level through `ortus.assumptionProfile` serialization helpers. There is no dedicated assumption-profile export button in the UI yet, and assumption profile artifacts are distinct from scenario, snapshot, uncertainty config/result, and run-summary artifacts.

The Assumptions, Limits + Ethics layer is a modeling-transparency layer. It is not a legal/compliance system, not a prediction-certification system, and not a blocking warning modal.

### Networks + Relations

Network primitives represent relational structure inside a model. A network can describe who is connected to whom, but it does not by itself prove causal influence or real-world social structure.

Prompt 15 adds service-level network primitives. Full visual network editing, network-based behavior modes, and hybrid models require later model schema, rule primitive, and visual builder phases.

The headless network layer defines plain JSON network definitions with nodes, directed or undirected edges, optional weights, relation types, and metadata. V1 supports deterministic synthetic generators for empty, complete, random Erdos-Renyi, and ring networks. Random generation uses seeded `RandomService`; ring and complete generation are deterministic without RNG dependence.

Network definitions are bounded to 500 nodes, 20,000 edges, 200 relation types, and bounded metadata/JSON payloads. A network-level `directed` flag supplies the default directedness for edges; an edge-level `directed` value or relation-type directed default can make a specific relation directed. Multiple edges between the same node pair are rejected unless they represent distinct relation types. Query helpers treat `getNeighbors` as incident-neighbor lookup, while `getOutgoingNeighbors` and `getIncomingNeighbors` expose direction-sensitive traversal.

V1 network metrics include node count, edge count, density, average degree, min/max degree, weak connected component count, and largest component size. Directed graph component metrics are reported as weak components. These are structural summaries only; they are not causal evidence or validation against real relational data. Expensive all-pairs path metrics, graph layout, centrality dashboards, network uncertainty, and graph editing are intentionally deferred.

Current production templates do not claim network runtime support. Their `supportsNetworkSpace`, `supportsNetworkOptions`, and `supportsNetworkMetrics` flags remain false until a template actually uses relational topology in initialization or runtime behavior. Epidemic and Opinion are future candidates for contact/influence networks, Predator-Prey is a future candidate for food-web relations, and Schelling/Flocking remain spatial/grid-first in V1.

RunConfig and scenario JSON do not yet include `networkOptions` or inline network definitions. Future network-capable templates should add those fields behind explicit capability flags and validate them through the headless network services. Uncertainty target validation does not treat network generator options as active V1 targets; network uncertainty is future work.

### Resources, Stocks + Flows

Resource, stock, and flow primitives represent quantities and movement of quantities inside a model. They do not by themselves prove real-world economic, ecological, or health outcomes.

Prompt 16 adds service-level resource/stock/flow primitives. Full visual stock-flow editing, feedback loops, delayed flows, and hybrid resource-network models require later model schema, rule primitive, feedback, and visual builder phases.

The headless resource layer defines plain JSON resource definitions, stock definitions, flow definitions, stock states, bounded ledgers, metrics, and serialization artifacts. Current bounds are 200 resources, 1,000 stocks, 1,000 flows, 1,000 ledger entries, and bounded JSON/metadata payloads. A resource is something that can be produced, consumed, stored, depleted, transferred, regenerated, or constrained. A stock is a quantity of a resource held by a system, agent, group, region, or environment. A flow is a deterministic per-tick movement or change in stock.

Stock ownership is descriptive metadata in V1: `ownerType` and `ownerId` say who holds a stock, but they do not bind the stock to live engine entities unless a future template explicitly does so. Stock bounds use the most restrictive applicable upper bound across resource max, stock max, and stock capacity. Minimums default to zero unless the resource or stock explicitly allows negative values.

Supported V1 operations are constant-rate `produce`, `consume`, `transfer`, `regenerate`, `decay`, and `deplete`. `produce` and `regenerate` require a target stock and add up to capacity/max. `consume`, `decay`, and `deplete` require a source stock and remove down to min/zero unless negatives are allowed. `transfer` requires source and target stocks with the same resource id and is constrained by both source availability and target capacity. In V1, `decay` and `deplete` intentionally share the same constant-rate removal mechanics; they are separate flow types so future templates can give them distinct semantics without changing artifact shape.

Operations clamp against stock minimums, maximums, and capacities, return deterministic flow results and warnings, and do not mutate their input state. Arbitrary equations, feedback loops, delayed flows, external data assimilation, and user-authored formula execution are intentionally not supported.

V1 resource metrics include resource count, stock count, flow count, total stock by resource, min/max stock value, depleted stock count, over-capacity stock count, total requested/applied flow by resource, net flow by resource, insufficient-stock flow count, and clamped-flow count. These are bounded structural summaries, not predictive evidence.

Current production templates do not claim resource, stock, flow, or resource-metric runtime support. Their `supportsResources`, `supportsStocks`, `supportsFlows`, and `supportsResourceMetrics` flags remain false until a template actually uses these primitives. Predator-Prey may later use energy, food, grass, or habitat resources; Epidemic may later use hospital capacity, medication supply, or staffing capacity; Opinion may later use attention, trust, or media-resource abstractions.

RunConfig and scenario JSON do not yet include `resourceOptions` or inline resource-system definitions. Future resource-capable templates should add those fields behind explicit capability flags and validate them through the headless resource services. Resource uncertainty and network-resource hybrid flows, such as supply chains, transportation networks, resource diffusion, and capacity-constrained networks, are future work.

### Feedback Loops, Delays + Events

Feedback, delay, and event primitives represent model structure. They do not by themselves prove causal relationships, real-world feedback loops, or predictive validity.

Prompt 17 adds service-level feedback/delay/event primitives. Full visual feedback-loop editing, delayed resource/network dynamics, and causal validation require later model schema, rule primitive, validation, and visual builder phases.

The headless feedback layer defines plain JSON scheduled events, delay queue items, feedback loop definitions, event application results, feedback application results, metrics, and serialization artifacts. V1 artifact types are `ortus.eventSchedule`, `ortus.delayQueue`, `ortus.feedbackLoops`, and `ortus.feedbackEventMetrics`. Current bounds are 1,000 scheduled events, 1,000 delay queue items, 500 feedback loops, 1,000 ledger entries, and bounded JSON/payload sizes.

Scheduled events are discrete tick-labeled records sorted deterministically by tick, priority, and id. Release helpers return due events with `tick <= requestedTick` and remove them from the returned queue; exact-tick lookup is available through query helpers. Event application results summarize caller decisions but do not execute payloads or mutate engine state in V1. Delays schedule bounded plain-JSON payloads for `releaseTick = scheduledAtTick + delayTicks`; delay release helpers return due items with `releaseTick <= requestedTick`, while exact release-tick lookup is available through query helpers. Feedback loops are metadata-declared as `reinforcing`, `balancing`, or `unknown`; V1 classification is declared metadata, not causal inference.

Supported V1 feedback math is intentionally narrow: `requestedAdjustment = signalValue * gain`, followed by optional clamp min/max. Signal values are caller-provided finite numbers from safe sources; ORTUS does not accept arbitrary equations, expression parsers, executable formulas, causal discovery, or control optimization in this layer. A loop `delayTicks` value is bounded metadata for future scheduling; templates must explicitly use the delay helpers if they want delayed feedback.

V1 metrics include scheduled and released event counts, delay queue size, released delay item count, feedback loop counts by type, enabled loop count, average/max delay ticks, ledger counts, events by type, delays by type, feedback adjustments by target, and clamped feedback count. These are bounded structural and operational summaries, not causal strength metrics.

Current production templates do not claim event, delay, feedback-loop, or feedback-metric runtime support. Their `supportsEvents`, `supportsDelays`, `supportsFeedbackLoops`, and `supportsFeedbackMetrics` flags remain false until a template actually uses these primitives. Epidemic may later use delayed recovery/policy effects, Predator-Prey may later use delayed resource regeneration and population feedback, Opinion may later use media feedback cycles, Schelling may later use institutional response delays, and Flocking may later use delayed perception/control feedback.

RunConfig and scenario JSON do not yet include `eventScheduleOptions`, `delayOptions`, or `feedbackLoopOptions`. Future feedback-capable templates should add those fields behind explicit capability flags and validate them through the headless feedback services. Feedback targets for resource flows, network diffusion, event timing, gain, and delay uncertainty are future work; Prompt 17 does not wire those concepts into runtime dynamics.

### Current Capability Vs Reserved Future Capability

Currently implemented as service-first primitives: networks/relations, resources/stocks/flows, feedback/delays/events, uncertainty, assumptions/limits/ethics, hybrid composition, multi-scale structure, scale view state, boundaries/environment, spatial fields/environmental layers, observability/measurement models, causal assumption/influence models, units/dimensions/quantity semantics, emergence/pattern descriptors, robustness/resilience/stress-test semantics, and strategy/control/intervention semantics.

Currently not implemented: true multi-scale runtime, scale-aware renderer/UI, runtime observability measurement collection, runtime causal influence execution, runtime emergence detection, runtime robustness/resilience stress testing, runtime strategy/control execution, causal discovery/proof/inference/do-calculus/intervention optimization, runtime spatial-field sampling/diffusion/advection, runtime unit enforcement, automatic unit conversion, dimensional equation solving, multi-rate time, adaptive agents, heterogeneity layer, phase transition tools, attractor/basin tools, trace inspection, error budgets, custom model schema/compiler, visual model builder, calibration/data assimilation/MCMC, and external framework interop.

Service-first primitives are foundations, not active model behavior. A template should not claim support for a primitive until its runtime actually uses that primitive.

Zooming the camera is not the same as multi-scale modeling. Multi-scale ORTUS models will require explicit scale levels, aggregation rules, disaggregation rules, cross-scale coupling, and warnings when detail is synthetic or lost.

Model state is not the same as observable reality. Observability V1 distinguishes internal simulated state and runtime metrics from measured, partial, noisy, proxy, synthetic, or empirical observation definitions, but it does not execute measurement, calibration, validation, inference, or data assimilation.

Runtime metrics are model outputs; they are not automatically empirical observations.

An observability model defines how something could be measured; it does not collect, calibrate, or validate data.

Synthetic observations are generated or declared model-side; they must not be treated as observed evidence.

Empirical measurements need provenance to be trustworthy. Active measurements, schedules, and measurement processes are structural declarations, not runtime-executed data collection. Current templates do not runtime-support observability, and existing uncertainty summaries are not observations. Validation/calibration remains future work.

Relations, feedback loops, and events can encode model assumptions, but they do not by themselves prove causal relationships in the real world.

Causal Assumptions + Influence Structure V1 is a headless structural service for declaring variables, influence edges, assumptions, evidence items, and intervention relevance. Causal assumption models declare influence assumptions; they do not prove causality. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves. Active causal influences are structural declarations, not runtime-executed behavior. V1 does not discover causality, run do-calculus, perform inference, solve structural equations, optimize interventions, calibrate, validate, or make current templates causal-assumption-aware.

Units, Dimensions + Quantity Semantics V1 is a headless structural service for declaring dimensions, units, quantities, ranges, and compatibility rules. It does not enforce runtime units, automatically convert values, solve equations, run symbolic algebra, calibrate, validate, or make current templates quantity-aware. Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics. Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency. Per-tick rates are model-time rates unless a physical time mapping is explicitly defined. Observability measurement units do not imply measurement validity, and causal unit consistency does not imply causal proof.

Emergence Detection + Pattern Descriptors V1 is a headless structural service for declaring candidate patterns, signatures, thresholds, time windows, variables, and scale links. It does not detect patterns at runtime, compute over snapshots or metric histories, prove emergence, perform statistical significance testing, run ML clustering/anomaly detection, validate model output against reality, or make current templates emergence-aware. Emergence pattern descriptors describe candidate patterns; they do not prove emergence. Visual patterns and runtime metrics are model outputs, not empirical proof of emergence. Active pattern descriptors are structural declarations, not runtime-detected results. Multi-scale structure does not prove emergence, causal assumptions do not prove emergence, and quantity consistency does not prove emergence.

Robustness, Resilience + Stress Testing Semantics V1 is a headless structural service for declaring stressors, response criteria, failure modes, and stress-test plans. It does not execute stress tests at runtime, perturb active simulations, prove robustness or resilience, perform statistical validation, certify safety or operational readiness, or make current templates robustness-aware. Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient. Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations. Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves. Existing interventions are not general stress testing unless explicitly modeled and evaluated. Validation/calibration remains future work.

Strategy, Control + Intervention Semantics V1 is a headless structural service for declaring strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, and expected effects. It does not execute strategies at runtime, execute template interventions, run closed-loop control, optimize policies, prove intervention effectiveness, estimate treatment effects, certify safety or operational readiness, or make current templates strategy/control-aware. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops. Runtime metrics are model outputs, not empirical strategy evidence. Causal assumptions do not prove intervention effects, robustness descriptors do not prove strategy robustness, and uncertainty ensembles are not policy validation by themselves. Prompt 31 model schema/interpreter foundation remains future work unless roadmap says otherwise. Validation/calibration remains future work.

Prompt 18 reserves these missing pillars in `docs/roadmap.md` and `docs/missing-pillars.md`. Prompt 19 adds `src/simulation/registry` as the unified systems primitive registry and capability map.

The Systems Primitive Registry is the source of truth for current vs reserved capabilities, artifact families, and template capability summaries. Global service availability is not template support. A primitive can exist as a headless service while every current template still reports no runtime support for it.

Reserved primitives are roadmap commitments, not implemented behavior. Runtime-active support must only be claimed when a template actually uses the primitive. Prompt 20 should use the registry for hybrid composition planning rather than inferring support from docs or service modules alone.

The registry does not change runtime behavior by itself. No current template runtime uses networks, resources/stocks/flows, or feedback/events/delays.

### Hybrid Model Composition

Hybrid Model Composition V1 is a headless structural description of intended primitive combinations. It can reference a base template and attach primitive artifact references or bounded inline service artifacts where validation is already available.

Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented.

Attaching a primitive artifact to a composition does not automatically make a template use that primitive. Composition validation reports missing capabilities when, for example, a composition requires network runtime behavior from a template that only has global network services available.

V1 does not execute custom hybrid models, compile model schemas, evaluate formulas, perform causal discovery, or turn service-only primitives into template runtime behavior.

### Multi-Scale Systems Architecture

Multi-Scale Systems Architecture V1 is a headless structural description of model-scale levels and relationships. It can define micro/meso/macro or custom scale levels, entity types, aggregation rules, disaggregation rules, and cross-scale links.

Camera zoom is not multi-scale modeling. Camera zoom changes visual scale; model-scale representation requires explicit scale levels, aggregation rules, disaggregation rules, cross-scale links, and warnings when detail is lost or synthetic.

Aggregation can lose information, and disaggregation can create synthetic detail. Synthetic detail must not be treated as observed or already modeled detail.

A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics. V1 scale rules are not executable, current templates do not runtime-use multi-scale services, and model schema/compiler work remains future.

### Scale View State

Multi-Scale Zoom + View System V1 is a headless view-state service for navigating explicit scale levels in a `MultiScaleModel`. It can derive zoom-in and zoom-out transitions from aggregation rules, disaggregation rules, and cross-scale links.

Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.

Scale transitions in V1 do not execute aggregation or disaggregation rules. They only update structural view state, retain visual camera metadata, and carry information-loss or synthetic-detail warnings.

A scale view state can navigate a scale model, but it does not make a template multi-scale capable. Current templates do not runtime-use scale view state, and model schema/compiler work remains future.

### Boundaries + Environment

Boundaries + Environment Layer V1 is a headless structural service for declaring what is inside a model, what remains outside it, and which exchanges, external forcings, or exogenous shocks are represented as assumptions.

Active boundary exchanges are structural declarations, not runtime-executed flows.

World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model.

A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open. V1 does not execute exchanges, forcings, shocks, or spatial fields, and does not make current templates boundary/environment aware. Closed/open contradictions are surfaced as warnings for review.

### Spatial Fields + Environmental Layers

Spatial Fields + Environmental Layers V1 is a headless structural service for declaring coordinate spaces, field definitions, environmental layers, and sampling rules.

Spatial fields are structural layer definitions, not runtime diffusion or GIS engines.

World coordinates, grids, and positions are not the same as explicit environmental field layers.

A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.

V1 does not execute diffusion, interpolation, advection, field sampling, terrain rendering, agent-field coupling, resource-field coupling, or boundary exchange coupling. Active fields, layers, and sampling rules are structural declarations only. Measured fields require provenance to be trustworthy, and synthetic fields must not be treated as observed detail. Boundary models and field layers are related but distinct: a boundary model declares model scope and exchanges, while a field layer declares spatial/environmental context. Current templates do not runtime-support spatial fields. Prompt 25 adds Observability + Measurement Model V1 as structural measurement metadata, and model schema/compiler work remains future.

## Template Definition Metadata

Template metadata is intentionally declarative. It documents model-family capability and setup contracts without becoming a separate model compiler.

- Capability flags say which ORTUS workspaces a template currently supports and explicitly mark unsupported future concepts, such as resources, stock-flow behavior, or network space, as false. `supportsUncertaintyConfig` is true for current templates because Uncertainty Layer V1 can sample their validated RunConfig inputs.
- Space definitions identify whether a template uses `continuous2d`, `grid2d`, future `network`, or future `hybrid` spaces.
- Entity type definitions describe the agent/entity categories users should reason about. They may map to entity archetypes, component states, or cell states, depending on the current template.
- Metric definitions describe metric id/key, label, description, numeric type, optional range/unit/display metadata, history support, comparability across runs, and source.
- Structured assumption profiles and legacy documentation fields describe the model boundary so templates do not imply predictive scope they do not have.
- Network primitives are service-level relational artifacts until a template explicitly declares network support and uses them.
- Resource, stock, and flow primitives are service-level quantity artifacts until a template explicitly declares support and uses them.
- Feedback, delay, and event primitives are service-level timing and loop artifacts until a template explicitly declares support and uses them.

## Lifecycle

```text
TemplateDefinition
  + Scenario / RunConfig
  + Seeded RNG
  -> Fresh engine instance
  -> Snapshots + metrics + events
  -> Run summaries / experiments / uncertainty summaries / network summaries / comparison
```

Operationally:

1. A template defines the model family and capabilities.
2. A scenario or run config selects initial conditions and supported variants.
3. A seeded RNG makes initialization and stochastic behavior deterministic.
4. A fresh engine instance runs the model.
5. Snapshots preserve exact run state for restore.
6. Metrics, events, and intervention history describe what happened during the run.
7. Run summaries, experiment result sets, and uncertainty result sets compare outcomes without storing full world state by default.

## Current Architecture Boundaries

- `src/simulation` is headless and should not import React, Zustand, DOM APIs, Canvas APIs, or browser storage.
- Template logic lives in templates and template-owned extension points, not in UI components.
- Scenario logic in `src/simulation/scenarios` validates and builds recipes; browser persistence lives in `src/lib/localScenarioStorage.ts`.
- Experiment logic creates fresh engines from template APIs and should not treat React state as the source of truth.
- Uncertainty sampling in `src/simulation/uncertainty` validates plain JSON configs, uses seeded RNG streams, and generates concrete RunConfigs without mutating templates, base configs, active engines, browser storage, or UI state.
- Network services in `src/simulation/networks` validate, generate, query, summarize, and serialize relational structures without importing React, browser APIs, or active engine state.
- The comparison workspace consumes snapshots, metrics, metadata, and experiment results; it does not mutate the active engine.
- Local storage is bounded UI workspace persistence. It is not authoritative simulation state.

Scenario previews create temporary fresh engines at tick 0 and render a read-only initial-world preview. Preview does not mutate the active engine, replace the active snapshot, clear selected entities, clear metrics, write to local storage, or run the simulation forward.

## Workspace Layout Regions

ORTUS uses a fixed-height simulation workspace so the WorldStage remains the dominant stable viewport. The left rail is a compact module launcher, not the permanent home for every future complex-systems tool.

Current and future workspace regions are:

- Top Command Bar: model selection, seed controls, import/export commands, and run state.
- Left Instrument Rail: compact operational modules such as Micro Field, Macro Field, Scenario Builder, Interventions, Experiment Runner, Run Comparison, Field Notes, and File Exchange.
- Center WorldStage: the primary simulation viewport and canvas-sized world field.
- Right Context Drawer: contextual inspection for selected agents now, and selected cells, network nodes/edges, resources, regions, or rules later.
- Bottom Analysis Dock: future home for metric traces, event logs, sensitivity analysis, emergence summaries, and larger run comparison views.
- Floating Overlays: bounded WorldStage overlays such as Legend, Debug, warnings, and future lightweight target overlays.
- Full Workspace Mode: future surface for large tools such as Scenario Builder expansion, Visual Model Builder, Rule Editor, Calibration, Report Builder, or Custom Template Library.

Panel placement metadata describes each module's default placement, supported placements, size modes, and whether it is analysis-oriented, selection-contextual, or workspace-capable. This metadata is UI architecture only; it does not become simulation state.

Intended future homes:

- Uncertainty Config -> drawer or workspace.
- Assumptions and Limits -> drawer.
- Metrics, Event Log, Sensitivity, and Emergence -> bottom dock.
- Agent, Node, and Resource Inspectors -> right context drawer.
- Visual Model Builder, Rule Editor, and Calibration -> full workspace mode.

## Randomness

Randomness in ORTUS should be explicit, seeded, and reproducible. Hidden randomness makes experiments, comparisons, calibration, and uncertainty analysis unreliable.

Simulation code, template initialization, experiments, and interventions must use `RandomService` or deterministic logic instead of `Math.random`. The current RNG service supports floats, integer ranges, booleans, choices, shuffles, normal values, and named/forked streams. Snapshots preserve RNG stream state so restored runs continue deterministically.

UI-only ids, timestamps, exports, and storage metadata may use browser time or crypto APIs because they are not simulation randomness.

## Metrics

Metric definitions are the declared measurement contract; metric values are the observed emissions for a run. Definitions include ids/keys, labels, descriptions, value type, optional range/unit/display metadata, history support, run-comparability, source, and formatting hints.

Metric collection rejects non-finite numeric values. Run comparison filters missing or nonnumeric values so partial result sets do not produce `NaN` deltas.

## Intervention Definitions And Events

Interventions are declarative template-owned actions, not UI button behavior. Each definition declares id, label, description, target type, parameter definitions, supported templates, capability requirements, mutation kind, event type, documentation, and a deterministic command builder.

Applying or failing an intervention appends a structured event-log entry. The intervention history remains the human-facing intervention record, while the event log is a broader audit trail for run lifecycle and future shocks/delayed effects.

## Event Log

The structured event log is a bounded run/session audit trail stored with world globals. It is useful for interventions, scenario application, future shocks, delayed effects, explainability, and run summaries. It is not event sourcing, not a snapshot replacement, and not the source of truth for simulation state.

Event records include event id, tick, type, source, order, optional target/label/payload, severity, and category. The log is bounded and sanitized on snapshot restore.

## Warning

ORTUS simulations are exploratory models. Scenarios define initial conditions and supported model variants; snapshots restore exact run state; run summaries compare outcomes. None of these should be treated as real-world prediction without validation, uncertainty analysis, and clear assumptions.

Scenarios define initial conditions and supported model variants. They do not guarantee outcomes; complex systems can behave differently across seeds, parameters, behavior modes, agent compositions, and future uncertainty settings.
