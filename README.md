# ORTUS

ORTUS is a browser-based complex systems visual modeler backed by a deterministic TypeScript simulation engine.

## Run The App

```bash
npm install
npm run dev
```

The app runs with Next.js. Use `npm run build` for a production build.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

## Roadmap Status

ORTUS has completed Prompt 34: Safe Builder UI Shell V1. The post-30B repository hygiene, durable context, dependency stabilization, and performance/scalability pass is also complete. Prompt 31: Model Schema + Interpreter Foundation V1, Prompt 31B: Model Schema + Interpreter Foundation Audit, Prompt 31C: Knowledge, Memory + Social Learning Semantics V1, Prompt 31D: Knowledge, Memory + Social Learning Audit, Prompt 32, Prompt 32B, Prompt 33, Prompt 33B, Prompt 33C, Prompt 33D, and Prompt 34 are complete; the next roadmap prompt is Prompt 34B: Safe Builder UI Shell Audit.

## Layout

The UI is world-dominant: a compact top status bar, a task-oriented simulation workspace navigator, a selected context panel, a large World Stage rendered with canvas, a right-side inspector for selected entities, and a persistent run-control dock. React and Zustand coordinate UI state only. The simulation engine remains the source of truth for entities, components, spaces, metrics, time, events, and seeded randomness.

## Brand

The sharp ORTUS mark is the primary navigation brand. The soft ORTUS mark is a secondary presentation variant. The primary mark is normally paired with the text `ORTUS` wordmark in the global app shell, using the descriptor `Complex Systems Workbench` only where space supports it. Do not use either mark as a simulation-world or Builder-graph watermark. Builder remains an ORTUS workspace, not a separate branded product. Favicon replacement remains future work until small-size legibility is deliberately optimized.

The current HCI/UX audit is documented in `docs/ui/HCI_AUDIT.md`. HCI findings must distinguish observed defects, inferred risks, subjective style preferences, and unverified concerns. Broad UI changes require dedicated remediation prompts; branding work must not smuggle in a redesign or weaken runtime-honesty language.

Major workspace panels use `CornerFramePanel`, a smoky translucent panel primitive with corner accents instead of full rectangular borders. Simulation tools are grouped by workflow mode: Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug. The selected mode owns the only intended vertical scroll region in the left context panel; persistent run controls stay outside that scroll region.

The visual direction is dark graphic realism: graphite and charcoal foundations, off-white structural UI, acid signal accents, restrained vermilion warnings, and sparse cobalt/violet secondary signals. Template backgrounds are lightweight CSS atmosphere layers only. They provide visual context for Epidemic, Opinion Dynamics, Predator-Prey, Schelling Segregation, Flocking / Boids, and Forest Fire / Landscape Spread runs, but they are not simulation data.

## Template Connection

Production templates are registered in `src/simulation/templates/registry.ts`. The UI descriptor list is aligned to that registry and adds UI-only accent/background/legend metadata. The UI creates a `SimulationEngine`, reads snapshots, renders agents from snapshot spaces/components, and calls engine APIs for stepping, reset, scenario import, and snapshot import.

Canvas rendering is snapshot-driven. The UI stores only `selectedEntityId`, not copied agent state, and the canvas does not mutate engine state. Parameter controls rebuild through engine/template validation rather than editing entities or components directly.

## Concept Vocabulary

The architecture vocabulary is defined in `docs/concepts.md`. In short: templates define model families, scenarios define initial conditions and supported variants, runs execute a template/scenario/seed configuration, snapshots restore exact tick state, run summaries compare bounded outcomes, experiments batch runs, and interventions perturb a live run through validated engine paths.

Production templates also declare capability flags, space definitions, entity/agent type metadata, formal metric metadata, and structured Assumptions, Limits + Ethics profiles. `SimulationRunConfig` is the shared fresh-run recipe for starting a new run from a template, scenario, seed, parameters, and supported variant options; it is distinct from snapshots and run summaries.

Randomness in simulation code is seeded through `RandomService`; hidden `Math.random` calls are not allowed in the simulation layer. Metrics have formal definitions aligned with emitted values, interventions are declarative template-owned definitions, and a bounded structured event log records run initialization, scenario application, and intervention outcomes without becoming event sourcing.

Forest Fire / Landscape Spread is an abstract local-spread grid template. It is not a wildfire predictor, does not use GIS, real terrain, wind, humidity, weather, suppression, firefighting, or calibrated fire probabilities, and is useful only for exploring local spread, thresholds, fragmentation, and qualitative emergent patterns. Its grid coordinates are not SpatialFieldModel runtime support, and its boundary modes are not BoundaryEnvironmentModel runtime support.

Every ORTUS model is an abstraction. The Assumptions, Limits + Ethics panel shows what the model includes, what it excludes, and what uses would be misleading without validation. Validation status describes evidence about the model, not truth about the real world; internally tested means software and invariant checks, not calibration or external validation.

Network primitives are service-level in V1. They define bounded plain-JSON nodes, edges, relation types, deterministic generators, query helpers, metrics, and import/export artifacts, but current production templates do not claim network runtime behavior yet. Network metrics are structural summaries, not causal proof or real-world relational evidence.

Resource, stock, and flow primitives are service-level in V1. They define bounded plain-JSON resources, stocks, flows, deterministic update helpers, metrics, and import/export artifacts, but current production templates do not claim resource or stock-flow runtime behavior yet. Resource metrics are structural summaries, not proof of real-world economic, ecological, or health outcomes.

Feedback, delay, and event primitives are service-level in V1. They define bounded plain-JSON scheduled events, delay queues, feedback loop metadata, deterministic scheduling/release helpers, simple clamp-based feedback adjustments, metrics, and import/export artifacts, but current production templates do not claim feedback, delay, or event runtime behavior yet.

Feedback, delay, and event primitives represent model structure. They do not by themselves prove causal relationships, real-world feedback loops, or predictive validity.

Prompt 17 adds service-level feedback/delay/event primitives. Full visual feedback-loop editing, delayed resource/network dynamics, and causal validation require later model schema, rule primitive, validation, and visual builder phases.

Observability/measurement models are service-level in V1. They define observable, latent, and unobserved variables plus structural measurements, schedules, and measurement processes, but they do not collect runtime data or ingest external data. Runtime metrics are model outputs; they are not automatically empirical observations. An observability model defines how something could be measured; it does not collect, calibrate, or validate data. Synthetic observations are generated or declared model-side; they must not be treated as observed evidence.

Causal assumptions/influence models are service-level in V1. These causal assumptions are structural metadata. They declare variables, influence edges, assumptions, evidence items, and intervention relevance without discovering, proving, inferring, solving structural equations, optimizing, validating, or calibrating causality. Causal assumption models declare influence assumptions; they do not prove causality. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves. Active causal influences are structural declarations, not runtime-executed behavior.

Units, dimensions, and quantity semantics are service-level in V1. They declare dimensions, units, quantities, ranges, and compatibility rules without enforcing runtime units, converting values, solving equations, calibrating, or validating values. Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics. Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency. Per-tick rates are model-time rates unless a physical time mapping is explicitly defined.

Emergence/pattern descriptors are service-level in V1. They declare candidate patterns, signatures, thresholds, time windows, variables, and scale links without detecting patterns at runtime, proving emergence, performing statistical significance testing, running ML clustering/anomaly detection, validating model output against reality, or making current templates emergence-aware. Emergence pattern descriptors describe candidate patterns; they do not prove emergence. Visual patterns and runtime metrics are model outputs, not empirical proof of emergence. Active pattern descriptors are structural declarations, not runtime-detected results.

Robustness/resilience/stress testing semantics are service-level in V1. They declare stressors, response criteria, failure modes, and stress-test plans without executing stress tests at runtime, perturbing active simulations, proving robustness or resilience, performing statistical validation, certifying safety or operational readiness, or making current templates robustness-aware. Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient. Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations. Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves.

Strategy/control/intervention semantics are service-level in V1. They declare strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, and expected effects without executing strategies at runtime, executing template interventions, running closed-loop control, optimizing policies, proving intervention effectiveness, estimating treatment effects, certifying safety or operational readiness, or making current templates strategy/control-aware. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops. Validation/calibration remains future work.

Model schemas are service-level in V1. `ModelSchemaDefinition` artifacts declare entity, component, attribute, space, parameter, metric, rule-declaration, and artifact-reference structure. Model schemas declare model structure; they do not execute rules or create runnable simulations. A valid model schema is not a template, scenario, RunConfig, or snapshot. Rule declarations are descriptive metadata, not parsed formulas or executable behavior. Active means structurally active, not runtime-executed. Production templates are hand-built runtime models, not generated from model schemas. Runtime interpreter/compiler, runnable visual model builder support, external framework interop, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, LLM-per-agent runtime, validation, and calibration remain future work. Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.

Knowledge, memory, and social-learning semantics are service-level in V1. `ortus.knowledgeMemorySocialLearningModel` artifacts describe symbolic knowledge items, belief variables, belief-state descriptors, bounded memory traces, attention/salience descriptors, trust/source profiles, exposure channels, social signals, background priors, relationship roles, norms, and learning-rule descriptors. Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition. Background profiles are compressed prior descriptors, not simulated life histories. Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals. LLM-per-agent runtime is not implemented and must not be implied. They do not execute social learning, update beliefs or memory at runtime, sample exposure, infer real-person traits, support protected-class inference, validate psychology, predict people, optimize persuasion, provide policy targeting, or mutate Opinion Dynamics.

Opinion Dynamics now has a narrow template-owned `socialLearning` behavior mode. Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition. Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template. Opinion values and social-learning metrics are model outputs, not measured human beliefs. Information-source credibility is a model parameter, not a verified truth score. No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.

Visual Builder Workspace V1 is service-level in V1. `ortus.visualBuilderWorkspace` artifacts describe future visual-builder workspace identity, referenced model schemas and artifacts, visual nodes, visual edges, panels, sections, validation markers, warning markers, unsupported/future-only markers, layout metadata, selection metadata, viewport metadata, notes, summaries, and validation reports. Prompt 34 adds a dedicated `/builder` UI shell that can import, validate, inspect, filter, and export these artifacts with read-only structural navigation. Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges. The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime. A structurally valid workspace is still not a runnable model. Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics. The shell does not implement drag-and-drop model construction, visual programming, model schema execution, compatibility conversion, template generation, scenario generation, RunConfig generation, snapshot generation, engine creation, external framework interop, generic social-learning runtime, or LLM agents. Active means structurally active, not runtime-executed. Prompt 34B safe builder shell audit is next.

Template/Schema Compatibility Mapping V1 is service-level in V1. `ortus.schemaTemplateCompatibilityReport` and `ortus.templateMappingProfile` artifacts compare `ModelSchemaDefinition` structure with static production-template metadata. Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines. Compatibility mapping does not execute schemas, parse rule descriptions, mutate templates, create engines, implement visual builder runtime, provide external framework interop, run social-learning/cognitive behavior, validate science, calibrate outputs, or prove causality, emergence, robustness, strategy effectiveness, safety, or operational readiness. Prompt 33B audited these boundaries; Prompt 33C added only the narrow Opinion Dynamics `socialLearning` behavior mode, and Prompt 33D audited that slice without expanding it.

## Current Capability Vs Reserved Future Capability

Currently implemented as service-first primitives: networks/relations, resources/stocks/flows, feedback/delays/events, uncertainty, assumptions/limits/ethics, hybrid composition, multi-scale structure, scale view state, boundaries/environment, spatial fields/environmental layers, observability/measurement models, causal assumption/influence models, units/dimensions/quantity semantics, emergence/pattern descriptors, robustness/resilience/stress-test semantics, strategy/control/intervention semantics, model schema declarations, knowledge/memory/social-learning semantics, visual builder workspace schemas, and template/schema compatibility mapping.

Currently not implemented: true multi-scale runtime, scale-aware renderer/UI, runtime observability measurement collection, runtime causal influence execution, runtime emergence detection, runtime robustness/resilience stress testing, runtime strategy/control execution, model schema runtime execution, model schema compiler/interpreter runtime, schema-to-template conversion, compatibility-based runtime execution, runnable visual model builder, graph editor UI, drag-and-drop model execution, visual programming, schema execution, scenario/RunConfig/snapshot/template generation from workspace schemas or compatibility reports, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, LLM-per-agent runtime, real-person inference, protected-class inference, causal discovery/proof/inference/do-calculus/structural equation solving/intervention optimization, runtime spatial-field sampling/diffusion/advection, runtime unit enforcement, automatic unit conversion, dimensional equation solving, multi-rate time, adaptive agents, heterogeneity layer, phase transition tools, attractor/basin tools, trace inspection, error budgets, calibration/data assimilation/MCMC, and external framework interop.

Service-first primitives are foundations, not active model behavior. A template should not claim support for a primitive until its runtime actually uses that primitive.

Zooming the camera is not the same as multi-scale modeling. Multi-scale ORTUS models will require explicit scale levels, aggregation rules, disaggregation rules, cross-scale coupling, and warnings when detail is synthetic or lost.

Model state is not the same as observable reality. Observability V1 distinguishes internal simulated state and runtime metrics from measured, partial, noisy, proxy, synthetic, or empirical observation definitions, but it does not execute measurement, calibration, validation, inference, or data assimilation. Causal Assumptions V1 is structural only and does not make observations, metrics, networks, or feedback labels causal evidence. Units/Dimensions V1 is structural only and does not make current templates quantity-aware. Emergence Pattern Descriptors V1 is structural only and does not prove emergence, execute detection, or make visible model patterns empirical evidence. Robustness/Resilience V1 is structural only and does not execute stress tests, certify safety, validate operational risk, or prove the system is robust. Strategy/Control V1 is structural only and does not execute policies, triggers, objectives, stopping rules, or template interventions.

Relations, feedback loops, and events can encode model assumptions, but they do not by themselves prove causal relationships in the real world.

The revised roadmap is in `docs/roadmap.md`; reserved missing pillars are in `docs/missing-pillars.md`.

## Systems Primitive Registry

`src/simulation/registry` is the source of truth for current vs reserved systems primitives, artifact families, and production-template capability summaries.

Global service availability is not template support. A primitive can exist as a headless service while every current template still reports no runtime support for it.

Reserved primitives are roadmap commitments, not implemented behavior. Runtime-active support must only be claimed when a template actually uses the primitive, and reserved future pillars must not be exposed as active features. Prompt 20 will use the registry for hybrid composition planning.

The registry does not change runtime behavior by itself. No current template runtime uses networks, resources/stocks/flows, or feedback/events/delays.

## Hybrid Composition

`src/simulation/composition` defines Hybrid Model Composition V1 as a service-first structural layer. A hybrid composition can reference scenarios, assumptions, uncertainty configs, network definitions, resource systems, event schedules, delay queues, and feedback loop artifacts, plus declared future primitives.

Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented.

Attaching a primitive artifact to a composition does not automatically make a template use that primitive. V1 does not compile custom models, execute attached artifacts, wire networks/resources/feedback into templates, or create visual-builder behavior.

Hybrid compositions may reference template/schema compatibility reports and template mapping profiles structurally. Such attachments do not make a composition runnable and do not satisfy model schema execution, visual builder runtime, conversion, generation, validation, calibration, external interop, or social-learning runtime capabilities.

## Multi-Scale Architecture

`src/simulation/multiscale` defines Multi-Scale Systems Architecture V1 as a service-first structural layer. Scale models can describe scale levels, entity types, aggregation rules, disaggregation rules, and cross-scale links, but current templates do not execute multi-scale dynamics.

Camera zoom is not multi-scale modeling. Model-scale representation requires explicit scale levels, aggregation/disaggregation rules, cross-scale links, and warnings about what detail is lost or synthetic.

Aggregation can lose information, and disaggregation can create synthetic detail. Synthetic detail must not be treated as observed or already modeled detail.

A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics. Model schema/compiler work remains future.

## Scale View State

`src/simulation/scaleView` defines Multi-Scale Zoom + View System V1 as service-first model-scale view state. It can track the current scale level, view mode, visual camera state, selected entity reference, transition history, and warnings for a referenced scale model.

Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.

Scale transitions in V1 do not execute aggregation or disaggregation rules. They only change `currentScaleId`, preserve camera state, record transition history, and surface information-loss or synthetic-detail warnings.

A scale view state can navigate a scale model, but it does not make a template multi-scale capable. Current templates do not runtime-use scale view state, and runtime compiler/interpreter work remains future.

## Boundaries + Environment

`src/simulation/boundaries` defines Boundaries + Environment Layer V1 as a service-first structural layer. Boundary models declare system scope, environment scope, boundary surfaces, exchanges, external forcings, and exogenous shocks.

Active boundary exchanges are structural declarations, not runtime-executed flows.

World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model.

A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open. V1 does not execute exchanges, forcings, shocks, or spatial fields, and does not make current templates boundary/environment aware. Model schema/compiler work remains future.

Closed/open boundary contradictions are surfaced as structural warnings for review, not as proof that the model can execute environmental dynamics.

## Spatial Fields + Environmental Layers

`src/simulation/spatialFields` defines Spatial Fields + Environmental Layers V1 as a service-first structural layer. Field-layer models declare coordinate spaces, field definitions, environmental layers, and sampling rules.

Spatial fields are structural layer definitions, not runtime diffusion or GIS engines.

World coordinates, grids, and positions are not the same as explicit environmental field layers.

A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.

V1 does not execute diffusion, interpolation, advection, field sampling, agent-field coupling, resource-field coupling, or terrain rendering. Active fields, layers, and sampling rules are structural declarations only. Measured fields need provenance to be trustworthy, synthetic fields must not be treated as observed detail, and current templates do not runtime-support spatial fields. Boundary models and spatial fields are related but distinct: boundary models describe system scope and exchanges, while field layers describe spatial/environmental context. Prompt 25 adds Observability + Measurement Model V1 as structural measurement metadata. Model schema/compiler work remains future.

## Product Notes

The World Stage is the primary workspace. Agents are rendered as a single canvas layer over template-specific atmospheric backgrounds. The right-side inspector summarizes template-specific state such as infection status, opinion/stubbornness, species, energy, Schelling group, grid cell, satisfaction state, and Flocking speed/neighbor density, with raw component payloads available for debugging. Legend and debug diagnostics are available through the Observe and Debug workspace modes so they do not cover the world by default.

Parameter controls are generated from template definitions. Numeric controls show current values and ranges, and changes are applied by rebuilding the run through engine validation so invalid parameter combinations do not enter the engine. The Micro panel also includes an agent avatar display preference for canvas-only rendering styles: glyphs, arrows, initials, or head markers. File exchange reports whether a scenario or snapshot export/import succeeded.

## Scenario Builder

The Scenario Builder lives in the Setup workspace mode as an initial-condition and model-variant workspace. It authors Scenario Builder JSON artifacts with scenario id, name, description, tags, template id/version, seed, validated parameters, initialization preset/options, agent composition, behavior mode, environment options, metadata, and timestamps. These scenarios do not store tick state, world snapshots, metric history, intervention history, or run outcomes.

Each production template exposes initialization presets and a supported default behavior mode through template metadata. V1 presets include outbreak layouts for Epidemic, opinion distributions for Opinion Dynamics, ecology layouts for Predator-Prey, neighborhood layouts for Schelling, heading/position layouts for Flocking, and abstract fuel/ignition layouts for Forest Fire / Landscape Spread. Agent composition fields are template-defined and backed by existing validated parameters such as agent count, predator/prey counts, density, group ratio, boid count, fuel density, or ignition count. Environment options are exposed only where there is a clean existing template option, such as Schelling grid dimensions, Flocking boundary mode, or Forest Fire grid and neighbor settings. The builder previews the initial world by creating a separate temporary engine at tick 0; preview does not mutate or advance the active simulation.

Applying a scenario validates the recipe, creates a fresh `SimulationEngine`, clears stale selection/intervention target state, and starts the active run at tick 0. The local scenario library is browser-local, bounded to 50 scenarios, validates loaded records, and ignores corrupted stored data without crashing the app. Scenario Builder import/export is separate from snapshot import/export and run comparison export.

Scenarios define initial conditions and supported model variants. They do not guarantee outcomes; complex systems can behave differently across seeds, parameters, behavior modes, and agent compositions.

## Experiment Runner

The Experiment Runner lives in the Experiment workspace mode. It creates fresh headless engine instances for the selected template, runs parameter sweeps locally in the browser, records final numeric metrics, aggregates results by condition, and exports JSON or CSV. The interactive World Stage engine is not reused for experiment trials.

V1 supports single-parameter sweeps in the UI with generated numeric ranges or manual value lists. The headless experiment module also supports one- or two-parameter grid sweeps, fixed seed lists, sequential seeds from a base seed, cancellation between runs, and a default `maxRuns` limit of 100 with a hard V1 limit of 500. Fixed seed lists are used in the supplied order. Results store metrics and run metadata only; full snapshots are not stored per trial by default.

Experiment results are exploratory and depend on model assumptions, parameter choices, and random seeds. They are not calibrated predictions.

## Intervention Tools

The Interventions instrument lets users apply controlled perturbations to the current run without editing agents or components from the UI. Each intervention is defined per template, validated by the headless intervention executor, and applied through the engine command buffer. Interventions apply immediately at the current tick and do not advance simulation time; the next normal step continues from the perturbed state.

V1 interventions include infect selected/radius for Epidemic, set selected/broadcast opinion for Opinion Dynamics, add prey/remove selected for Predator-Prey, swap selected group for Schelling, apply impulse/scatter radius for Flocking, and ignite a selected fuel cell for Forest Fire. Canvas clicks only report target entity, world point, or grid-cell information to UI state. The canvas does not mutate simulation state.

Validation rejects stale or destroyed selected entities, unsupported intervention ids, invalid parameter ranges, non-finite world points/vectors, and invalid template-specific transitions such as reinfecting an already infected selected epidemic agent. Radius interventions compute affected agents only when applied.

Applied and failed interventions are recorded in a bounded history of 500 items. Snapshot export preserves the applied intervention history because it is part of world state. Scenario export remains an initial-condition restart and does not replay mid-run interventions in V1.

Interventions are exploratory perturbations. They help users study model behavior under controlled changes, but they are not real-world policy predictions.

## Run Comparison Workspace

The Run Comparison workspace lives in the Compare workspace mode. It captures bounded run summaries from the current interactive simulation and can import successful completed experiment runs into the same summary format. A run summary is not a scenario and is not a snapshot: it stores template metadata, seed, parameters, current tick/time, final numeric metrics, bounded metric history when available, intervention summaries, labels, notes, tags, and source metadata. It does not store full world snapshots by default.

Saved runs are kept in local browser storage under a bounded V1 library of 50 summaries. Malformed stored data is ignored with a friendly notice rather than crashing the app; when possible, valid stored records are salvaged and invalid records are skipped. Users can label, annotate, select, baseline, delete, clear, compare, and export saved summaries. Comparison shows metadata, differing parameters, final metric deltas relative to the baseline run, limited metric traces on shared tick/value axes when bounded history exists, and bounded intervention summaries. Experiment-derived summaries usually have final metrics only, so trace comparison is available mainly for captured manual runs.

Comparison export supports JSON and CSV. JSON includes selected run summaries, comparison configuration, baseline id, metric deltas, parameter differences, timestamp, and app version metadata. CSV exports one row per selected run with parameter and final metric columns. Full snapshots are not exported by default.

Run comparisons are exploratory. Differences between runs can suggest patterns, but they do not prove causal relationships without careful experimental design.

## Scenario vs Snapshot

- Scenario Builder export stores an authored initial-condition and supported-variant recipe: template, seed, parameters, initialization preset/options, agent composition, behavior mode, environment options, metadata, and notes.
- File Exchange scenario export stores the current template id, parameters, seed, and engine metadata for a basic initial-condition restart.
- Snapshot export stores current tick/time, world state, events, RNG streams, metrics history, applied intervention history, and metadata. Importing a snapshot restores the current run.
- Run summary capture stores comparison metadata and bounded metrics only. It is for comparing outcomes and does not restore or replay a run.

## Runtime Performance

Interactive runs step the headless engine through a fixed-tick loop, create one snapshot per animation frame when ticks advance, publish that snapshot through Zustand, and render agents through a single canvas pass. The Debug panel can show developer-only timing data when performance instrumentation is enabled with `localStorage.setItem("ortus.performanceInstrumentation.v1", "enabled")`; remove that key or set any other value to disable it. Instrumentation records bounded tick, metric, snapshot, frame/update, entity-count, neighbor-query, forest-fire, and flocking counters without changing simulation semantics.

Service primitives are not runtime support unless a template explicitly uses them. Default entity counts are UX defaults, not engine limits, and scalability claims require benchmark evidence. Generic `Continuous2DSpace.queryNeighbors` uses a versioned lazy `ContinuousSpatialHashIndex` for finite local-radius queries in non-tiny worlds, with deterministic all-pairs fallback for tiny or broad/global-radius cases. Flocking uses its own deterministic tick-local pair summaries on top of the same headless spatial-index service. The spatial index is an implementation detail, not a SpatialFieldModel runtime primitive.

Forest Fire / Landscape Spread uses cached grid-neighbor indices, compact numeric state arrays, active burning-cell indices, changed-component updates, and current state-count globals for metrics. It is still an abstract local-spread template, not wildfire prediction or BoundaryEnvironmentModel/SpatialFieldModel runtime support. Full snapshots, engine invariant checks, template validation, Zustand publication, and render-model rebuilding remain separate runtime costs.

Run `npm run perf:simulation` for a local non-asserting performance report covering flocking, forest-fire, and predator-prey scenarios. The report includes elapsed time, ticks/sec, scheduler compute time, metrics time, validation/overhead remainder, snapshot time, render-model preparation time where accessible, entity/cell counts, neighbor counters, and forest-fire changed-cell counters.

## Limitations

- Continuous-space templates can still have pairwise interaction costs. Flocking now avoids the default-count all-pairs path for local-radius queries, but global-radius settings and other templates may remain CPU-bound.
- Schelling uses the existing grid space and batched canvas grid rendering; V1 still favors moderate grid sizes over very large city-scale maps.
- Flocking uses the existing continuous space, deterministic tick-local neighbor summaries, batched command-buffer updates, and directional canvas glyphs; V1 does not include obstacles, leaders, vision cones, or trails.
- Experiment runs are local and chunked between completed trials, not Web Worker backed. Large sweeps can still consume CPU, so the UI blocks configurations above the V1 run limits.
- Intervention history is preserved in snapshots, but V1 does not implement scenario-level intervention replay or undo.
- Scenario Builder previews initial worlds only and does not run forward or predict outcomes. Behavior modes remain template-owned and bounded; richer custom rule authoring is future work. Experiment Runner integration with saved scenarios is future work.
- Run comparison storage is browser-local, bounded to 50 summaries, stores at most 240 metric history records and 100 intervention summaries per run, and does not store full snapshots. V1 does not import external comparison files back into the library.
- Canvas rendering is intentionally simple and batched.
- The UI has no timeline rewind or pan/zoom in V1.
- Mesa, NetLogo, and MASON files are future adapter contracts only. There is no external runtime integration in V1.
- Built-in models are exploratory simulations, not calibrated predictive tools.
