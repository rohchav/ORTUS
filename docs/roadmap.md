# ORTUS Roadmap

This roadmap reserves the major complex-systems pillars that ORTUS must support before it can safely move into visual model authoring, calibration, control, or external framework adaptation. It is a planning document, not a claim that these capabilities already exist.

## Current Foundation

Prompts 1-17B established the current foundation:

- Engine/runtime/UI foundation.
- Scenario Builder.
- Behavior modes and agent composition.
- Uncertainty Layer V1.
- Assumptions, Limits + Ethics.
- Networks and relations.
- Resources, stocks, and flows.
- Feedback loops, delays, and events.

These foundations are deliberately service-first. Networks, resources, and feedback primitives are headless structural services until a template explicitly uses them at runtime. A template must not claim support for a primitive merely because a service exists.

## Revised Prompt Sequence

Immediate roadmap:

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
23. 29 - Phase Transitions + Tipping Point Tools V1.
24. 29B - Phase Transition Audit.
25. 30 - Attractors + Basins of Attraction V1.
26. 30B - Attractor/Basin Audit.
27. 31 - Robustness, Resilience + Shock Testing V1.
28. 31B - Robustness/Resilience Audit.
29. 32 - Agent Internal State + Memory V1.
30. 32B - Agent Internal State Audit.
31. 33 - Adaptive Agents + Strategy Switching V1.
32. 33B - Adaptive Agents Audit.
33. 34 - Heterogeneity Layer V1.
34. 34B - Heterogeneity Audit.
35. 35 - Explainability + Trace Inspection V1.
36. 35B - Explainability Audit.
37. 36 - Error Budgets + Approximation Warnings V1.
38. 36B - Error Budget Audit.

Later roadmap bands:

- 38-42: first primitive-backed template upgrades.
- 43-48: model definition schema, validation schema, versioning/migration, rule primitive library, safe model interpreter/compiler, and execution safety.
- 49-59: visual model builder.
- 60-62: human-in-the-loop model critique.
- 63-68: pattern libraries and domain packs.
- 69-75: validation, calibration, sensitivity analysis, MCMC, and data assimilation.
- 76-80: intervention strategy, counterfactuals, and control.
- 81-85: external framework adaptation.
- 86-91: performance, scale, and runtime infrastructure.
- 92-96: security, imports, save/load, accessibility, and recovery UX.
- 97-102: productization.

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

Current production templates must not claim multi-scale systems, observability runtime support, causal-assumption runtime support, boundary/environment runtime modeling, spatial-field runtime support, quantity-semantics runtime support, emergence-detection runtime support, robustness/resilience runtime support, strategy/control runtime support, multi-rate time, adaptive agents, heterogeneity, phase transition analysis, attractor analysis, trace inspection, error budgets, model schema/compiler, visual builder, calibration, data assimilation, MCMC, or external framework interop.

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

Prompt 30 adds Strategy, Control + Intervention Semantics V1 as structural strategy metadata. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops. It does not execute strategies at runtime, execute template interventions, run closed-loop control, optimize policies, prove intervention effectiveness, estimate causal or treatment effects, certify safety or operational readiness, validate, calibrate, or make current templates strategy/control-aware. Prompt 31 model schema/interpreter foundation remains future work unless roadmap says otherwise.

## Reserved Artifact Families

Future artifact families may include:

- `ortus.modelDefinition`
- `ortus.validationReport`
- `ortus.traceReport`
- `ortus.patternLibrary`
- `ortus.domainPack`

These artifact types are reserved names only except `ortus.scaleModel`, which Prompt 21 implements as a service-level structural artifact, `ortus.scaleViewState`, which Prompt 22 implements as a service-level view-state artifact, `ortus.boundaryModel`, which Prompt 23 implements as a service-level boundary/environment artifact, `ortus.fieldLayer`, which Prompt 24 implements as a service-level spatial field/environmental layer artifact, `ortus.observabilityModel`, which Prompt 25 implements as a service-level observability artifact, `ortus.causalAssumptionModel`, which Prompt 26 implements as a service-level causal-assumption artifact, `ortus.quantitySemanticsModel`, which Prompt 27 implements as a service-level quantity-semantics artifact, `ortus.emergencePatternModel`, which Prompt 28 implements as a service-level emergence-pattern artifact, `ortus.robustnessResilienceModel`, which Prompt 29 implements as a service-level robustness/resilience artifact, and `ortus.controlStrategyModel`, which Prompt 30 implements as a service-level strategy/control artifact. The remaining future artifacts do not have import/export support yet.
