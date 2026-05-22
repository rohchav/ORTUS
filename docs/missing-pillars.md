# Reserved Complex-Systems Pillars

This document reserves cross-cutting complex-systems capabilities that ORTUS must not accidentally design around. These are future pillars unless a later prompt explicitly implements and audits them.

Prompt 19 records these reservations in the Systems Primitive Registry. Global service availability is not template support. A primitive can exist as a headless service while every current template still reports no runtime support for it.

Reserved primitives are roadmap commitments, not implemented behavior.

Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented. Attaching a primitive artifact to a composition does not automatically make a template use that primitive.

Prompt 21 adds a service-first scale-model artifact for multi-scale structure only. Camera zoom is not multi-scale modeling. Aggregation can lose information, and disaggregation can create synthetic detail. A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics.

Prompt 22 adds service-first scale view state for structural navigation only. Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification. Scale transitions in V1 do not execute aggregation or disaggregation rules. A scale view state can navigate a scale model, but it does not make a template multi-scale capable.

Prompt 23 adds service-first boundary/environment models for structural scope declarations only. Active boundary exchanges are structural declarations, not runtime-executed flows. World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model. A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open.

Prompt 24 adds service-first spatial field/environmental layer models for structural field declarations only. Spatial fields are structural layer definitions, not runtime diffusion or GIS engines. World coordinates, grids, and positions are not the same as explicit environmental field layers. A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.

Prompt 25 adds service-first observability/measurement models for structural measurement declarations only. Runtime metrics are model outputs; they are not automatically empirical observations. An observability model defines how something could be measured; it does not collect, calibrate, or validate data. Synthetic observations are generated or declared model-side; they must not be treated as observed evidence.

Prompt 26 adds service-first causal assumption/influence models for structural influence declarations only. Causal assumption models declare influence assumptions; they do not prove causality. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves. Active causal influences are structural declarations, not runtime-executed behavior.

## 1. Multi-Scale Systems

- Definition: explicit micro, meso, macro, and possibly regional or institutional scale levels, with aggregation, disaggregation, and cross-scale coupling.
- Why it matters: complex systems often change behavior when individual-level rules aggregate into group or system-level patterns.
- Current status: structural service exists for scale declarations, aggregation/disaggregation metadata, cross-scale links, and scale-model import/export; no runtime execution exists.
- Future implementation: executable cross-scale update contracts, template runtime integration, renderer/view integration, and stronger synthetic detail warnings.
- Must not claim yet: executable cross-scale runtime, zoom UI support, real multi-scale validation, or synthetic detail as observed detail.

## 2. Scale-Aware Zoom/View

- Definition: model-scale zoom across agent, group, region, and system views, distinct from camera zoom.
- Why it matters: visual zoom can mislead users into thinking hidden detail is modeled.
- Current status: structural scale view state exists for model-scale transition metadata; no renderer integration or template runtime support exists.
- Future implementation: scale-aware UI controls, renderer integration, aggregation-loss warnings in the workspace, and explicit transitions between detail levels.
- Must not claim yet: camera zoom as model-scale zoom, executable scale transitions, or template scale-aware support.

## 3. Observability And Measurement

- Definition: observed variables, hidden variables, measurement noise, sampling frequency, proxies, missing data, and observer bias.
- Why it matters: model state is not the same as measured reality.
- Current status: structural observability service exists for observable, latent, and unobserved variables, measurements, schedules, measurement processes, warnings, and import/export; no runtime measurement execution exists.
- Future implementation: runtime measurement collection, proxy metadata execution, sensor/survey sampling, observation uncertainty, and validation/calibration integration.
- Must not claim yet: runtime data measurement, external data ingestion, real-world observation, calibrated evidence, validation, inference, data assimilation, or synthetic observations as observed evidence.

## 4. Causal Assumptions

- Definition: explicit causal links, confounder notes, intervention assumptions, and causal versus correlational distinctions.
- Why it matters: interventions and control require assumptions about mechanisms, not just correlations.
- Current status: structural causal-assumption service exists for variables, influence edges, assumptions, evidence items, intervention links, warnings, and import/export; no runtime execution exists.
- Future implementation: runtime causal reasoning, intervention-safety review, validation/calibration integration, and control workflows only after later prompts.
- Must not claim yet: causal discovery, do-calculus execution, inference, structural equation solving, intervention optimization, calibration, validation, or proof of real-world causation. Prompt 27 quantity semantics is structural only and does not validate causal claims.

## 5. Boundaries And Environment

- Definition: system boundaries, open versus closed systems, external forcing, inflows/outflows, and exogenous shocks.
- Why it matters: boundary choices determine what is inside the model and what is imposed from outside.
- Current status: structural boundary/environment service exists for system scope, environment scope, boundary surfaces, exchanges, external forcings, shocks, warnings, and import/export; no runtime execution exists.
- Future implementation: runtime boundary exchange contracts, forcing inputs, shock handling, open-system metadata, and spatial-field integration.
- Must not claim yet: complete environmental representation, executed boundary flows, or proof that a real system is closed or open.

## 6. Spatial Fields And Environmental Layers

- Definition: scalar fields, vector fields, gradients, diffusion, terrain/friction, density/risk/resource fields.
- Why it matters: many systems are shaped by continuous context, not only agent positions.
- Current status: structural spatial field/environmental layer service exists for coordinate spaces, fields, layers, sampling metadata, warnings, and import/export; no runtime execution exists.
- Future implementation: executable field sampling contracts, interpolation/diffusion/advection helpers, layer metrics, renderer/GIS integration, and template field coupling.
- Must not claim yet: template spatial-field runtime support, executed terrain/risk/resource field effects, environmental diffusion, calibrated probability fields, or synthetic fields as observed data.

## 7. Temporal Scale And Multi-Rate Time

- Definition: fast/slow variables, different update frequencies, event time versus tick time, seasonality, and lagged effects.
- Why it matters: coupled systems often evolve at different rates.
- Current status: fixed tick clock plus service-level delays/events.
- Future implementation: multi-rate schedules, explicit time units, event-time semantics, and seasonality contracts.
- Must not claim yet: full multi-rate simulation.

## 8. Adaptive Agents And Internal State

- Definition: memory, perception, strategy switching, bounded rationality, local information, and learning placeholders.
- Why it matters: adaptive behavior changes system dynamics over time.
- Current status: templates have simple component state, not a general adaptive-agent layer.
- Future implementation: internal-state schemas, memory stores, perception contracts, and strategy switching rules.
- Must not claim yet: learning, cognition, or strategic adaptation unless a template actually implements it.

## 9. Heterogeneity

- Definition: agent types, group differences, parameter distributions, structural heterogeneity, and behavioral heterogeneity.
- Why it matters: averages can hide mechanisms and risks.
- Current status: some templates have simple group/species/state categories, but no general heterogeneity layer.
- Future implementation: heterogeneity schemas, distribution-backed parameters, group-specific rules, and fairness/bias warnings.
- Must not claim yet: full population heterogeneity.

## 10. Emergence Detection

- Definition: cluster detection, synchronization, order parameters, segregation indices, and macro-pattern detection.
- Why it matters: users need help distinguishing visible patterns from measured emergent structure.
- Current status: Prompt 28 adds service-first emergence pattern descriptors for candidate patterns, signatures, thresholds, time windows, variables, and scale links. Emergence pattern descriptors describe candidate patterns; they do not prove emergence.
- Future implementation: runtime pattern detection, bounded pattern metrics, order parameters, cluster summaries, statistical review, and false-positive warnings.
- Must not claim yet: runtime pattern detection, automatic emergence interpretation, proof of emergence, statistical significance, ML clustering/anomaly detection, external validation, calibration, consciousness, or intelligence. Visual patterns and runtime metrics are model outputs, not empirical proof of emergence. Active pattern descriptors are structural declarations, not runtime-detected results.

## 11. Phase Transitions And Tipping Points

- Definition: threshold sweeps, regime changes, hysteresis, critical slowing down, and early warning indicators.
- Why it matters: small parameter changes can produce qualitative shifts.
- Current status: parameter sweeps exist, but no phase transition tools.
- Future implementation: controlled sweeps, regime classifiers, hysteresis experiments, and indicator warnings.
- Must not claim yet: detected tipping points or critical thresholds.

## 12. Attractors And Basins

- Definition: trajectory comparison, convergence, cycles, recurrence, basin mapping, and sensitivity to initial conditions.
- Why it matters: long-run behavior can depend on starting conditions.
- Current status: deterministic runs and comparisons exist, but no attractor/basin analysis.
- Future implementation: trajectory embeddings, recurrence checks, convergence metrics, and basin maps.
- Must not claim yet: attractor discovery.

## 13. Robustness And Resilience

- Definition: shocks, recovery time, fragility, redundancy, adaptive capacity, and resilience curves.
- Why it matters: systems can fail or recover under perturbation.
- Current status: Prompt 29 adds service-first robustness/resilience semantics for stressors, response criteria, failure modes, and stress-test plans. Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient.
- Future implementation: runtime stress-test execution, shock protocols, recovery metrics, fragility summaries, and resilience comparison artifacts. Strategy/control semantics are structural in Prompt 30 and do not execute stress tests or optimize controls.
- Must not claim yet: runtime stress testing, automatic perturbation, statistical validation, safety certification, operational readiness, operational risk assessment, control optimization, or robustness/resilience proof. Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations. Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves.

## 14. Control/Intervention Strategy

- Definition: intervention schedules, counterfactuals, adaptive policies, tradeoffs, and cost/benefit metadata.
- Why it matters: strategy analysis requires explicit goals, constraints, costs, and causal assumptions.
- Current status: Prompt 30 adds service-first strategy/control semantics for strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, and expected effects. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies.
- Future implementation: runtime policy execution, scheduled intervention execution, counterfactual run sets, policy comparison, and optimization only after later runtime and validation prompts.
- Must not claim yet: runtime strategy execution, template intervention execution from `ControlStrategyModel`, closed-loop control, control optimization, reinforcement learning, model predictive control, policy recommendation, causal or treatment effect estimation, statistical validation, safety certification, operational readiness, or proof that an intervention works. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops.

## 15. Explainability And Trace Inspection

- Definition: why an agent changed, which rule fired, which event applied, which resource constrained behavior, and which feedback loop adjusted something.
- Why it matters: users need traceable mechanisms, not only final metrics.
- Current status: event logs and intervention history exist, but no rule-level trace inspector.
- Future implementation: bounded trace records, rule firing summaries, constraint explanations, and inspection UI.
- Must not claim yet: full explainability.

## 16. Error Budgets And Approximation Warnings

- Definition: aggregation loss, synthetic reconstruction, sampling error, model simplifications, omitted variables, and approximation risk.
- Why it matters: visual and analytical outputs can imply more precision than the model supports.
- Current status: assumption profiles and docs warn about limitations, but no error-budget system.
- Future implementation: approximation metadata, warning thresholds, and reportable uncertainty/error budgets.
- Must not claim yet: quantified model error.

## 17. Units And Dimensional Consistency

- Definition: units, compatible operations, dimensional checks, rate versus stock compatibility, and timestep units.
- Why it matters: invalid unit mixing creates meaningless model behavior.
- Current status: Prompt 27 adds service-first quantity semantics declarations for dimensions, units, quantities, ranges, and compatibility rules. Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics.
- Future implementation: runtime unit enforcement, automatic conversion, symbolic algebra, dimensional equation solving, physical time mapping, schema/compiler integration, and validation/calibration remain future work.
- Must not claim yet: runtime unit conversion, runtime dimensional consistency, symbolic algebra, equation solving, calibration, validation, or template quantity-awareness. Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency. Per-tick rates are model-time rates unless a physical time mapping is explicitly defined.

## 18. Model Versioning And Migration

- Definition: model schema versions, scenario migrations, artifact compatibility, and reproducibility metadata.
- Why it matters: saved artifacts must remain interpretable as schemas evolve.
- Current status: existing artifacts have schema versions, but no general model migration framework.
- Future implementation: migration registries, compatibility reports, and reproducibility manifests.
- Must not claim yet: migration support for future model schemas.

## 19. Pattern Libraries

- Definition: reusable model patterns such as contagion, diffusion, threshold adoption, preferential attachment, flocking, segregation, resource depletion, network cascades, coordination failure, and predator-prey cycling.
- Why it matters: templates and visual authoring need reusable, validated primitives.
- Current status: built-in templates demonstrate patterns, but no reusable pattern library.
- Future implementation: pattern definitions, validation, assumptions, examples, and compatibility metadata.
- Must not claim yet: drag-and-drop pattern composition.

## 20. Domain Packs

- Definition: curated domain packages for ecology, epidemiology, social influence, supply chains, infrastructure, urban systems, and organizational systems.
- Why it matters: domain modeling requires assumptions, terms, validation expectations, and appropriate-use boundaries.
- Current status: no domain pack system.
- Future implementation: domain-specific defaults, terminology, assumptions, metrics, and critique prompts.
- Must not claim yet: domain-grade modeling.

## 21. Human-In-The-Loop Model Critique

- Definition: missing-variable challenges, boundary challenges, scale challenges, observability questions, falsification questions, and skeptic questions.
- Why it matters: complex models need structured criticism before use.
- Current status: assumption profiles exist, but no critique workflow.
- Future implementation: guided critique panels, exportable critique records, and prompts tied to model artifacts.
- Must not claim yet: model review, certification, or ethical approval.
