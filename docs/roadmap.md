# ORTUS Roadmap

This roadmap reserves the major complex-systems pillars that ORTUS must support before it can safely move into visual model authoring, calibration, control, or external framework adaptation. It is a planning document, not a claim that these capabilities already exist.

## Current Foundation

ORTUS has completed through Prompt 37B. Prompts 1-37B established the current foundation:

- Engine/runtime/UI foundation.
- Scenario Builder.
- Behavior modes and agent composition.
- Uncertainty Layer V1.
- Assumptions, Limits + Ethics.
- Networks and relations.
- Resources, stocks, and flows.
- Feedback loops, delays, and events.
- Systems primitive registry and capability map.
- Hybrid model composition as a structural service.
- Multi-scale structure and scale view state as structural/view-state services.
- Boundaries/environment and spatial fields/environmental layers as structural services.
- Observability, causal assumptions, quantity semantics, emergence descriptors, robustness/resilience semantics, strategy/control semantics, model schema declarations, knowledge/memory/social-learning semantics, visual builder workspace schemas, and template/schema compatibility mapping as service-first or metadata-first foundations.
- A narrow Opinion Dynamics social-learning behavior mode owned by that hand-built template, audited in Prompt 33D.
- A safe, read-only visual builder UI shell for structural `ortus.visualBuilderWorkspace` inspection, added in Prompt 34.
- Prompt 34B audit hardening for Reset safety, workspace tab keyboard behavior, Metric Trace provenance language, Builder read-only inspection affordances, and workspace information architecture documentation.
- Prompt 35 bounded, non-executing `ortus.modelSchema` authoring forms inside the Builder.
- Prompt 35B audit hardening for import safety, destructive confirmation, data preservation, tab semantics, validation announcements, responsive stacking, and source-level architecture boundaries.
- Prompt 36 read-only visual graph inspection for loaded workspace artifacts with deterministic layout, accessible outline/edge alternatives, UI-only exploration state, marker preservation, and bounded rendering.
- Prompt 36B graph-view audit hardening for structural-only affordances, explicit marker/notice counts, filtered selection coherence, deterministic layout/DOM ids, text-only metadata, source-level accessibility, and runtime-boundary tests.
- Prompt 37 validation UX and bounded repair suggestions for `ortus.modelSchema` authoring, with grouped issue cards, copyable diagnostics, section jumps, stale-suggestion protection, confirmation for content-removing repairs, and manual-only handling for ambiguous modeling intent.
- Prompt 37B audit hardening for helper-level confirmation enforcement, explicit `canApply` suggestion classification, malformed/prototype-like patch rejection, deterministic issue grouping, rule-repair boundary copy, stale list-target rejection, and export-after-repair tests.

These foundations are deliberately service-first or metadata-first unless documented otherwise. Networks, resources, feedback primitives, boundary/environment models, spatial fields, observability models, causal assumptions, quantity semantics, emergence descriptors, robustness/resilience descriptors, and strategy/control descriptors are headless structural services until a template explicitly uses them at runtime. A template must not claim support for a primitive merely because a service exists.

After Prompt 30B, ORTUS completed a repository hygiene, durable context, dependency stabilization, and performance/scalability pass. That pass added and validated performance instrumentation and spatial-indexing foundations, but it does not turn reserved structural primitives into runtime support and is not evidence for high-scale readiness by itself.

Prompt 31: Model Schema + Interpreter Foundation V1 through Prompt 37B: Schema Validation UX + Repair Suggestions Audit are complete. The next roadmap prompt is Prompt 38: Schema-to-Template Fit Report V1.

## Revised Prompt Sequence

Completed and audited roadmap sequence:

1. 18 - Roadmap Alignment + Missing Pillar Reservation.
2. 18B - Roadmap Alignment Audit.
3. 19 - Systems Primitive Registry + Capability Map.
4. 19B - Registry Audit.
5. 20 - Hybrid Model Composition Layer V1.
6. 20B - Hybrid Composition Audit.
7. 21 - Multi-Scale Systems Architecture V1.
8. 21B - Multi-Scale Architecture Audit.
9. 22 - Multi-Scale Zoom + View System V1.
10. 22B - Multi-Scale Zoom/View Audit.
11. 23 - Boundaries + Environment Layer V1.
12. 23B - Boundaries + Environment Audit.
13. 24 - Spatial Fields + Environmental Layers V1.
14. 24B - Spatial Fields Audit.
15. 25 - Observability + Measurement Model V1.
16. 25B - Observability Audit.
17. 26 - Causal Assumptions + Influence Structure V1.
18. 26B - Causal Assumptions Audit.
19. 27 - Units + Dimensional Consistency V1.
20. 27B - Units Audit.
21. 28 - Emergence Detection Metrics V1.
22. 28B - Emergence Detection Audit.
23. 29 - Robustness, Resilience + Stress Testing Semantics V1.
24. 29B - Robustness/Resilience Audit.
25. 30 - Strategy, Control + Intervention Semantics V1.
26. 30B - Strategy/Control Audit.

Post-30B stabilization:

- Repository hygiene and durable Codex context.
- Dependency stabilization for the performance report script.
- Simulation performance instrumentation and spatial-indexing foundation.
- Local typecheck/test/build/performance validation.

Completed Prompt 31 audit band:

1. 31 - Model Schema + Interpreter Foundation V1.
2. 31B - Model Schema + Interpreter Foundation Audit.
3. 31C - Knowledge, Memory + Social Learning Semantics V1.
4. 31D - Knowledge, Memory + Social Learning Audit.

Completed Prompt 32 planning and audit foundation:

1. 32 - Visual Model Builder Planning + Workspace Schema V1.
2. 32B - Visual Builder Workspace Audit.

Completed Prompt 33 compatibility foundation:

1. 33 - Template/Schema Compatibility Mapping V1.
2. 33B - Template/Schema Compatibility Mapping Audit.
3. 33C - Opinion Dynamics Social Learning Runtime V1.
4. 33D - Opinion Dynamics Social Learning Runtime Audit.

Completed Prompt 34 shell and audit foundation:

1. 34 - Safe Builder UI Shell V1.
2. 34B - Safe Builder UI Shell Audit.

Completed Prompt 35 authoring and audit foundation:

1. 35 - Model Schema Authoring Forms V1.
2. 35B - Model Schema Authoring Forms Audit.

Completed Prompt 36 graph-view foundation and audit:

1. 36 - Visual Builder Graph View V1.
2. 36B - Visual Builder Graph View Audit.

Completed Prompt 37 validation-assistance foundation and audit:

1. 37 - Schema Validation UX + Repair Suggestions V1.
2. 37B - Schema Validation UX + Repair Suggestions Audit.

Next roadmap prompt:

1. 38 - Schema-to-Template Fit Report V1.

Later roadmap bands:

- Post-31 audit: validation schema, versioning/migration, rule primitive library, execution safety hardening, trace inspection, error budgets, phase/tipping tools, attractor/basin tools, agent internal state, adaptive agents, and heterogeneity.
- Later: runnable visual model builder, human-in-the-loop critique, pattern libraries and domain packs, validation/calibration/sensitivity/MCMC/data assimilation, intervention strategy/counterfactual/control work, external framework adaptation, performance/runtime infrastructure, security/import/save/accessibility/recovery UX, and productization.

## Ordering Rationale

Multi-scale architecture comes before visual builder because a visual builder must know whether it is editing agents, groups, regions, fields, or system-level variables. Camera zoom is not enough; model-scale zoom requires explicit scale levels, aggregation rules, disaggregation rules, and cross-scale coupling.

Observability and causal assumptions come before serious calibration, data assimilation, and control because calibration requires a measurement model, and control requires explicit intervention assumptions. Model state is not observed reality, and a feedback loop or network edge is not causal evidence by itself.

The visual builder must wait until schema, interpreter, and execution-safety foundations exist. A visual rule editor without a model definition schema would either be fake or unsafe.

Predictive claims are prohibited until validation, calibration, and domain review phases exist. Current ORTUS outputs are exploratory simulations under stated assumptions.

## Capability Policy

Prompt 19 adds `src/simulation/registry` as the unified primitive registry and capability map. Future pillars remain reserved in documentation and validation boundaries, while current template capability flags remain focused on implemented contracts.

Service-first primitives are foundations, not active model behavior. A template should not claim support for a primitive until its runtime actually uses that primitive.

Global service availability is not template support. A primitive can exist as a headless service while every current template still reports no runtime support for it.

Reserved primitives are roadmap commitments, not implemented behavior.

Current production templates must not claim multi-scale systems, observability runtime support, causal-assumption runtime support, boundary/environment runtime modeling, spatial-field runtime support, quantity-semantics runtime support, emergence-detection runtime support, robustness/resilience runtime support, strategy/control runtime support, model schema runtime support, multi-rate time, adaptive agents, heterogeneity, phase transition analysis, attractor analysis, trace inspection, error budgets, compiler/interpreter runtime, visual builder, calibration, data assimilation, MCMC, or external framework interop.

Prompt 24C adds Forest Fire / Landscape Spread as a production template. It is an abstract local-spread grid model for qualitative spread, threshold, fragmentation, and emergence exploration; it is not a wildfire predictor, does not use GIS, wind, humidity, weather, terrain, suppression, firefighting, or calibrated fire probabilities, and does not make spatialFields or boundariesEnvironment runtime-active.

The registry does not change runtime behavior by itself. It records current support and reserved future work so Prompt 20 can plan hybrid composition without inferring support from service-module presence alone.

Prompt 20 adds Hybrid Model Composition V1 as a structural service, not a runtime compiler. Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented. Attaching a primitive artifact to a composition does not automatically make a template use that primitive.

Prompt 21 adds Multi-Scale Systems Architecture V1 as a structural service, not a zoom UI or runtime aggregation engine. Camera zoom is not multi-scale modeling. Aggregation can lose information, and disaggregation can create synthetic detail. A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics.

Prompt 22 adds Multi-Scale Zoom + View System V1 as structural scale view state, not a renderer rewrite. Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification. Scale transitions in V1 do not execute aggregation or disaggregation rules. A scale view state can navigate a scale model, but it does not make a template multi-scale capable.

Prompt 23 adds Boundaries + Environment Layer V1 as structural scope and environment metadata, not a runtime environment simulator. Active boundary exchanges are structural declarations, not runtime-executed flows. World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model. A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open.

Prompt 24 adds Spatial Fields + Environmental Layers V1 as structural field-layer metadata, not runtime diffusion, advection, interpolation, field sampling, or a GIS/renderer engine. Spatial fields are structural layer definitions, not runtime diffusion or GIS engines. World coordinates, grids, and positions are not the same as explicit environmental field layers. A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.

Prompt 25 adds Observability + Measurement Model V1 as structural measurement metadata. Runtime metrics are model outputs; they are not automatically empirical observations. An observability model defines how something could be measured; it does not collect, calibrate, or validate data. Synthetic observations are generated or declared model-side; they must not be treated as observed evidence. It does not execute measurement schedules/processes, ingest external data, calibrate, infer, assimilate data, or make templates observability-aware.

Prompt 26 adds Causal Assumptions + Influence Structure V1 as structural influence metadata. Causal assumption models declare influence assumptions; they do not prove causality. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves. Active causal influences are structural declarations, not runtime-executed behavior. It does not discover causality, execute do-calculus, perform inference, solve structural equations, optimize interventions, calibrate, validate, or make current templates causal-assumption-aware.

Prompt 27 adds Units, Dimensions + Quantity Semantics V1 as structural quantity metadata. Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics. Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency. Per-tick rates are model-time rates unless a physical time mapping is explicitly defined. It does not run symbolic algebra, solve dimensional equations, convert runtime values, calibrate, validate, or make current templates quantity-aware.

Prompt 28 adds Emergence Detection + Pattern Descriptors V1 as structural pattern metadata. Emergence pattern descriptors describe candidate patterns; they do not prove emergence. Visual patterns and runtime metrics are model outputs, not empirical proof of emergence. Active pattern descriptors are structural declarations, not runtime-detected results. It does not detect patterns at runtime, compute over snapshots or metric histories, run statistical significance tests, perform ML clustering/anomaly detection, validate model output against reality, calibrate, or make current templates emergence-aware.

Prompt 29 adds Robustness, Resilience + Stress Testing Semantics V1 as structural stress metadata. Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient. Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations. Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves. It does not execute stress tests at runtime, perturb active simulations, run experiments, perform statistical validation, certify safety or operational readiness, optimize controls, validate, calibrate, or make current templates robustness-aware.

Prompt 30 adds Strategy, Control + Intervention Semantics V1 as structural strategy metadata. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops. It does not execute strategies at runtime, execute template interventions, run closed-loop control, optimize policies, prove intervention effectiveness, estimate causal or treatment effects, certify safety or operational readiness, validate, calibrate, or make current templates strategy/control-aware.

Prompt 31 adds Model Schema + Interpreter Foundation V1 as a service-level structural schema layer. Model schemas declare model structure; they do not execute rules or create runnable simulations. A valid model schema is not a template, scenario, RunConfig, or snapshot. Rule declarations are descriptive metadata, not parsed formulas or executable behavior. `active` means structurally active, not runtime-executed. Production templates are hand-built runtime models, not generated from model schemas. It does not compile models, parse formulas, generate templates, generate RunConfigs, produce snapshots, power runnable visual model authoring, implement external framework interop, implement social-learning runtime, implement full human cognition, or add LLM agents. Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime. Runtime interpreter/compiler, validation/calibration, runnable visual model authoring, and external framework interop remain future work.

Prompt 31C adds Knowledge, Memory + Social Learning Semantics V1 as a service-level structural semantic layer. Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition. Background profiles are compressed prior descriptors, not simulated life histories. Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals. LLM-per-agent runtime is not implemented and must not be implied. It does not execute social learning, update beliefs or memory at runtime, sample exposure, infer real-person traits, support protected-class inference, validate psychology, predict people, optimize persuasion, provide policy targeting, or mutate Opinion Dynamics.

Prompt 31D audits Knowledge, Memory + Social Learning Semantics as structural only. It hardens the no-runtime, no-cognition, no-LLM-agent, no-unbounded-memory, no-real-person-profiling, no-protected-class-inference, no-psychological-diagnosis, no-persuasion/microtargeting, no-policy-guidance, and valid-vs-runnable boundaries. Prompt 31D is audit-only; it does not start visual builder UI work, implement runtime social learning, or mutate Opinion Dynamics.

Prompt 32 adds Visual Model Builder Workspace Schema V1 as a service-level structural workspace-planning layer. Visual builder workspaces are structural planning artifacts; they do not implement runnable visual model authoring. Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior. A valid visual builder workspace does not make a model schema runnable. Prompt 32 does not add drag-and-drop modeling, visual programming, or schema execution. Workspace artifacts can reference model schemas, social-learning semantics, observability, causality, networks, resources, feedback, quantities, control, hybrid compositions, scenarios, or templates structurally, but they do not execute node graphs, generate scenarios, generate RunConfigs, produce snapshots, create templates, create engines, add external framework interop, implement social-learning runtime, or add LLM agents.

Prompt 33 adds Template/Schema Compatibility Mapping V1 as a service-level structural fit-analysis layer. Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines. It does not execute schemas, parse rule descriptions, mutate templates, create engines, implement visual builder runtime, add external framework interop, run social-learning/cognitive behavior, validate science, calibrate outputs, or prove causality, emergence, robustness, strategy effectiveness, safety, or operational readiness. Prompt 33B audited these boundaries and kept compatibility mapping structural only.

Prompt 33C adds a narrow Opinion Dynamics social-learning runtime mode inside the hand-built Opinion template. Prompt 33D audits that slice without expanding it. Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition. Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template. Opinion values and social-learning metrics are model outputs, not measured human beliefs. Information-source credibility is a model parameter, not a verified truth score. No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented. Generic social-learning runtime, semantic artifact execution, model schema execution, runnable visual builder runtime, validation/calibration, and external framework interop remain unavailable.

Prompt 34 adds Safe Builder UI Shell V1 as a dedicated read-only UI surface for `ortus.visualBuilderWorkspace` artifacts. Prompt 34B audits and hardens this shell and the simulation workspace information architecture. Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges. The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime. A structurally valid workspace is still not a runnable model. Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics. The shell can import, validate, display, filter, select, inspect, and export a visual-builder workspace artifact, but it does not add drag-and-drop model construction, arbitrary node/edge authoring, graph execution, schema execution, compatibility conversion, template generation, scenario generation, RunConfig generation, snapshot generation, engine creation, external framework interop, generic social-learning runtime, LLM agents, real-person profiling, protected-class inference, or persuasion/targeting logic.

Prompt 35 adds a separate `Author Schema` Builder mode for bounded `ortus.modelSchema` form authoring. It uses the existing model-schema service for validation, warnings, summaries, import, and export; keeps drafts and last-valid checkpoints in local UI state; preserves dirty work across Builder mode switches; and confirms destructive replacement/removal. Model Schema Authoring Forms V1 creates structural model-schema artifacts; it does not execute schemas. Rule declarations authored in the Builder are descriptive only and remain non-executable. A valid authored schema is not a runnable simulation. The schema authoring UI does not generate templates, scenarios, RunConfigs, snapshots, or engines.

Prompt 35B audits and hardens the form surface without adding runtime behavior. It rejects oversized files before full reads, extends headless unsafe-key rejection for profiling/diagnosis/persuasion/targeting payloads, makes destructive confirmations modal and focus-contained, confirms metadata removal, preserves imported non-text JSON values without silent coercion, scopes validation announcements, adds roving tab stops, and stacks the Builder before three-column minimum tracks overflow.

Prompt 36 adds a third Builder mode for read-only visualization of the currently loaded `ortus.visualBuilderWorkspace`. A pure UI adapter preserves ids, kinds, statuses, artifact references, validation/warning/unsupported markers, and missing-capability information; assigns deterministic display coordinates; and never mutates the source artifact. The view provides search, node-kind/status/warning filters, selected-neighborhood highlighting, pan, zoom, fit/reset, a keyboard-accessible node outline, a text edge list, and a read-only inspector. Visual drawing is bounded to 120 nodes and 240 edges with an outline fallback above that threshold. Model-schema draft graphing, compatibility-report graphing, graph authoring, drag/drop, schema conversion, runtime generation, and execution remain unavailable.

Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges. Graph selection, filtering, panning, and zooming are UI-only state. Graph View is not visual programming, schema execution, or runtime generation. A graph that looks complete is still not a runnable model.

Prompt 36B audits and hardens the graph-view surface without adding graph authoring, edge creation, drag/drop, schema execution, runtime preview, generated scenarios, generated RunConfigs, generated templates, generated snapshots, or engine creation. It separates marker counts from global notices, keeps hidden filtered connections from acting like visible graph targets, derives Fit Graph from the actual graph surface when available, preserves deterministic text-only inspection, and adds source/static tests for unsafe rendering and runtime-boundary drift. Rendered responsive behavior and WCAG-level accessibility remain unverified until browser and assistive-technology testing is available.

Prompt 37 adds Schema Validation UX + Repair Suggestions V1 to Author Schema without adding runtime behavior. It presents structural status, error/warning/suggestion/manual counts, grouped issue cards, section jumps, original validation messages, copyable text diagnostics, and explicit service-only/future-only/runtime-boundary notices. Repair suggestions are structural editing assistance only. They do not make a schema runnable, infer correct model behavior, validate scientific meaning, or generate templates, scenarios, RunConfigs, snapshots, engines, compatibility conversions, visual-builder workspaces, or social-learning runtime. Safe repairs require an explicit click, destructive/content-removing repairs require confirmation, stale suggestions are rejected, and ambiguous modeling intent remains manual-only.

Prompt 37B audits and hardens the validation-assistance surface without adding schema execution or generation. Repair suggestions are structural editing assistance. They do not make a schema runnable. A repaired schema may be structurally valid and still have no runtime implementation. ORTUS does not infer the correct model behavior from validation repairs. Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines. Confirmation-required repairs are now enforced by the repair helper itself, suggestions expose `canApply`, malformed and prototype-like patches are rejected, unknown issues fall into a safe structural group, and rule repair copy states that rule suggestions do not execute or validate behavior. Rendered responsive behavior, clipboard behavior, browser zoom behavior, focus-return behavior, assistive-technology behavior, and WCAG-level accessibility remain unverified until browser and assistive-technology testing is available.

## Reserved Artifact Families

Future artifact families may include:

- `ortus.modelDefinition`
- `ortus.validationReport`
- `ortus.traceReport`
- `ortus.patternLibrary`
- `ortus.domainPack`

These artifact types are reserved names only except `ortus.scaleModel`, which Prompt 21 implements as a service-level structural artifact, `ortus.scaleViewState`, which Prompt 22 implements as a service-level view-state artifact, `ortus.boundaryModel`, which Prompt 23 implements as a service-level boundary/environment artifact, `ortus.fieldLayer`, which Prompt 24 implements as a service-level spatial field/environmental layer artifact, `ortus.observabilityModel`, which Prompt 25 implements as a service-level observability artifact, `ortus.causalAssumptionModel`, which Prompt 26 implements as a service-level causal-assumption artifact, `ortus.quantitySemanticsModel`, which Prompt 27 implements as a service-level quantity-semantics artifact, `ortus.emergencePatternModel`, which Prompt 28 implements as a service-level emergence-pattern artifact, `ortus.robustnessResilienceModel`, which Prompt 29 implements as a service-level robustness/resilience artifact, `ortus.controlStrategyModel`, which Prompt 30 implements as a service-level strategy/control artifact, `ortus.modelSchema`, which Prompt 31 implements as a service-level structural model schema artifact, `ortus.knowledgeMemorySocialLearningModel`, which Prompt 31C implements as a service-level structural social/cognitive semantics artifact, `ortus.visualBuilderWorkspace`, which Prompt 32 implements as a service-level structural visual-builder workspace artifact, and `ortus.schemaTemplateCompatibilityReport` plus `ortus.templateMappingProfile`, which Prompt 33 implements and Prompt 33B audits as service-level structural compatibility artifacts. The remaining future artifacts do not have import/export support yet.
