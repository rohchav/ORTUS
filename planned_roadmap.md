# ORTUS Full Prompt Roadmap

*Last updated after Prompt 34 Safe Builder UI Shell V1.*

## Current Status

ORTUS has completed the core runtime/template foundation, scenario system, uncertainty layer, assumptions/limits layer, systems primitive registry, hybrid composition, multi-scale structure, scale-view state, boundary/environment models, spatial fields, observability, causality, quantity semantics, emergence pattern descriptors, robustness/resilience semantics, strategy/control semantics, model schema declarations, knowledge/memory/social-learning semantics, visual builder workspace schemas, template/schema compatibility mapping, the template/schema compatibility mapping audit, a narrow Opinion Dynamics social-learning behavior mode, the Opinion Dynamics social-learning runtime audit, and Safe Builder UI Shell V1.

Current project status:

```text
Completed roadmap prompt: Prompt 34 — Safe Builder UI Shell V1
Post-30B stabilization completed: repo hygiene, durable Codex context, dependency repair, generated-artifact cleanup, and runtime performance/scalability baseline
Next roadmap prompt: Prompt 34B — Safe Builder UI Shell Audit
```

Critical global boundary:

```text
Most advanced ORTUS primitives are structural/service-first.
They do not become runtime template behavior unless explicitly wired and tested.
Valid artifacts are not automatically runnable artifacts.
Template support must never be inferred from global service availability.
```

Current production templates:

```text
Epidemic
Opinion Dynamics
Predator-Prey
Schelling Segregation
Flocking
Forest Fire / Landscape Spread
```

Current major guardrails:

```text
No arbitrary code execution.
No formula/expression execution.
No runnable visual model builder runtime yet.
No model schema interpreter/runtime yet.
No custom model execution yet.
No NetLogo/Mesa/MASON interop yet.
No validation/calibration claims unless explicitly implemented.
No causal-proof claims.
No robustness/safety/certification claims.
No strategy/control/optimality claims.
No template runtime support claims unless the runtime actually uses that primitive.
```

## Expert Audit Additions and Roadmap Corrections

Manual review after the expert audit found the social/cognitive roadmap insertion
missing from this full roadmap. Prompt 31C and Prompt 31D are now corrected below
after Prompt 31B and before Prompt 32, with a later narrow Opinion Dynamics
social-learning runtime slice placed after template/schema compatibility mapping.
The social/cognitive semantics insertion was corrected after manual review, and
Prompt 31C, Prompt 31D, Prompt 32, Prompt 32B, Prompt 33, Prompt 33B, Prompt 33C, Prompt 33D, and Prompt 34 are now marked complete while Prompt 34B remains future safe-builder shell audit work.

Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges. The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime. A structurally valid workspace is still not a runnable model. Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics.

---

# Phase 0 — Repo Recovery, Dependency, and Performance Stabilization

These are non-roadmap stabilization prompts used after the laptop/context reset.

## Prompt R1 — Repository Re-Orientation + Runtime Performance Triage

Purpose:

* Rebuild Codex’s understanding from repo files.
* Read durable context docs if present.
* Inspect simulation architecture, runtime templates, store, renderer, and tests.
* Diagnose why flocking/movement-heavy simulations struggle.
* Add lightweight performance instrumentation if needed.
* Do not start Prompt 31.

Key output:

* Repo understanding summary.
* Bottleneck list.
* Performance instrumentation plan.
* Recommendation to stabilize runtime before continuing the roadmap.

Status:

```text
Completed conceptually / superseded by R2 and performance pass.
```

## Prompt 31X — Engine Scalability Architecture Audit + Spatial Index Foundation

Purpose:

* Add a reusable deterministic continuous spatial hash/index.
* Integrate Flocking with spatial index.
* Add simulation performance reporting.
* Add template runtime metadata.
* Preserve determinism.
* Do not add new templates or structural primitives.

Key output:

* `ContinuousSpatialHashIndex`
* spatial index tests
* Flocking spatial-index path
* `npm run perf:simulation`
* runtime metadata such as expected scale class and neighbor strategy

Status:

```text
Completed as post-30B performance/scalability baseline.
```

## Prompt 31Y — Hot Loop Algorithm Engineering: Generic Spatial Queries, Forest-Fire Frontier Updates + Snapshot Cost Audit

Purpose:

* Improve generic continuous-space neighbor queries.
* Optimize forest-fire hot-loop behavior.
* Add/extend performance counters.
* Separate compute, snapshot, metrics, and render-model cost where practical.
* Avoid broad engine rewrite.

Status:

```text
Partially represented in current performance pass.
Future follow-up may still be useful for deeper snapshot/render optimization.
```

## Prompt R2 — Repo Hygiene + Durable Context + Performance Pass Audit

Purpose:

* Create durable Codex context files.
* Ignore generated artifacts such as `.next/` and `tsconfig.tsbuildinfo`.
* Remove generated files from Git tracking.
* Audit dirty worktree after context loss.
* Run dependency sanity checks.
* Confirm performance pass status.

Key outputs:

```text
docs/codex/CURRENT_CONTEXT.md
docs/codex/SESSION_LOG.md
.gitignore cleanup
generated artifact untracking
dependency sanity review
```

Status:

```text
Completed.
```

## Prompt R3 — Review and Commit Performance Baseline

Purpose:

* Review dirty performance source changes.
* Confirm generated artifacts are not tracked.
* Verify dependency/package changes.
* Run checks.
* Recommend clean commit split.

Recommended commit split:

```text
Commit 1: repo hygiene + durable context + generated artifact cleanup
Commit 2: dependency/test stabilization
Commit 3: performance instrumentation + spatial indexing foundation
```

Status:

```text
Completed or in progress depending on local commits.
```

## Prompt R4 — Roadmap Status Drift Cleanup

Purpose:

* Clean up roadmap/status drift after performance pass.
* Make docs consistently say:

  * completed through Prompt 30B
  * performance stabilization completed after Prompt 30B
  * Prompt 31 not started
  * next roadmap prompt is Prompt 31

Status:

```text
Recommended before Prompt 31.
```

---

# Phase 1 — Core Engine + Early Template Foundation

Early prompts were less formally named, but this is the effective roadmap history.

## Prompt 1 — Initial Engine Foundation

Purpose:

* Establish deterministic TypeScript simulation engine.
* Define early template runtime structure.
* Establish simulation state, tick loop, and snapshot concepts.
* Keep engine headless and separate from React.

Status:

```text
Completed.
```

## Prompt 2 — Core Runtime Correctness

Purpose:

* Harden basic engine stepping.
* Improve deterministic behavior.
* Stabilize snapshot/run behavior.
* Add early tests for engine correctness.

Status:

```text
Completed.
```

## Prompt 3 — Initial UI + Layout Direction

Purpose:

* Establish first ORTUS UI shell.
* Add basic simulation display and control surfaces.
* Begin separating UI concerns from simulation services.

Status:

```text
Completed.
```

## Prompt 4 — Visual Direction + UI Refinement

Purpose:

* Improve visual identity.
* Refine layout, control panels, world stage, and instrumentation surfaces.
* Maintain renderer/runtime separation.

Status:

```text
Completed.
```

## Prompt 5 — Template Architecture Improvements

Purpose:

* Harden template definitions.
* Improve template metadata and validation.
* Keep template logic owned by templates, not React.

Status:

```text
Completed.
```

## Prompt 6 — Scenario Builder Foundations

Purpose:

* Introduce early scenario configuration model.
* Separate template defaults from user-configurable scenario data.
* Start scenario validation flow.

Status:

```text
Completed.
```

## Prompt 7 — Template/Scenario Validation Hardening

Purpose:

* Strengthen scenario/template validation.
* Reject malformed or unsupported inputs.
* Preserve deterministic initialization.

Status:

```text
Completed.
```

## Prompt 8 — Flocking / Template Expansion Work

Purpose:

* Expand or harden Flocking behavior.
* Improve visual/runtime template support.
* Add tests for deterministic template behavior.

Status:

```text
Completed.
```

## Prompt 8B — Prompt 8 Audit

Purpose:

* Audit Flocking/template behavior.
* Verify no fake support claims.
* Preserve deterministic tests.

Status:

```text
Completed.
```

## Prompt 9 — Scenario Builder / Behavior Groundwork

Purpose:

* Improve scenario builder and template-owned options.
* Prepare for behavior modes and agent composition.

Status:

```text
Completed.
```

## Prompt 9B — Prompt 9 Audit

Purpose:

* Audit scenario builder and behavior groundwork.
* Verify validation boundaries.

Status:

```text
Completed.
```

## Prompt 10 — UI System + ORTUS Visual Identity

Purpose:

* Refine ORTUS workspace UI.
* Improve layout containment.
* Prepare for future panels/drawers/workspaces.

Status:

```text
Completed.
```

---

# Phase 2 — Scenario Builder, Behavior Modes, Uncertainty, and Transparency

## Prompt 11B — Scenario Schema Hardening + Import/Export

Purpose:

* Harden scenario schema.
* Add size bounds.
* Reject snapshot/live-state smuggling through scenarios.
* Preserve Scenario → RunConfig distinction.
* Ensure scenario apply creates a fresh engine and clears stale state.

Status:

```text
Completed.
```

## Prompt 12 — Behavior Modes + Agent Composition Framework

Purpose:

* Add behavior-mode metadata framework.
* Add agent-composition metadata framework.
* Implement real Flocking `groupAware` behavior mode.
* Keep other templates honest as default-mode only.

Status:

```text
Completed.
```

## Prompt 12B — Behavior Modes + Agent Composition Audit

Purpose:

* Audit behavior-mode metadata.
* Confirm Flocking `groupAware` is real runtime behavior, not visual-only.
* Confirm unsupported behavior modes are rejected.
* Confirm no generic engine template-specific branching.

Status:

```text
Completed.
```

## Prompt 13 — Uncertainty Layer V1

Purpose:

* Add service-first uncertainty config.
* Support fixed, uniform, integerRange, categorical, and seedEnsemble distributions.
* Generate deterministic concrete RunConfigs.
* Add headless ensemble execution and summary stats.

Boundary:

```text
No calibration.
No MCMC.
No data assimilation.
No probability claims.
No UI dashboard yet.
```

Status:

```text
Completed.
```

## Prompt 13B — Uncertainty Layer Audit

Purpose:

* Audit uncertainty as distinct from scenarios/snapshots/experiments.
* Harden bounds.
* Reject unsafe target paths and live-state payloads.
* Confirm generated runs are concrete deterministic RunConfigs.

Status:

```text
Completed.
```

## Prompt 14 — Assumptions, Limits + Ethics Panel

Purpose:

* Add structured assumption profiles.
* Add assumptions/limits/ethics panel.
* Add scenario assumption/limitation/validation/ethics notes.
* Add assumption provenance to run summaries.

Boundary:

```text
Assumptions are metadata only.
They do not affect runtime dynamics.
```

Status:

```text
Completed.
```

## Prompt 14B — Assumptions, Limits + Ethics Audit

Purpose:

* Audit profile quality and validation status.
* Confirm internally tested does not mean real-world validated.
* Confirm assumptions panel does not claim safety, certification, or prediction.

Status:

```text
Completed.
```

---

# Phase 3 — Systems Primitive Foundation

## Prompt 15 — Networks + Relations V1

Purpose:

* Add service-first network data model.
* Support nodes, edges, relation types, directed/undirected edges, weighted edges.
* Add generators: empty, complete, ring, deterministic random Erdős-Rényi.
* Add metrics and query helpers.

Boundary:

```text
Networks are service-only.
No current template runtime uses networks.
No graph editor.
No network runtime behavior.
```

Status:

```text
Completed.
```

## Prompt 15B — Networks + Relations Audit

Purpose:

* Harden network validation.
* Confirm no current template falsely claims network runtime support.
* Confirm RunConfig/scenario reject unsupported network fields.
* Confirm no network uncertainty or graph visualizer yet.

Status:

```text
Completed.
```

## Prompt 16 — Resources, Stocks + Flows V1

Purpose:

* Add service-first resources/stocks/flows model.
* Add produce, consume, transfer, regenerate, decay, deplete operations.
* Add stock/flow metrics and query helpers.

Boundary:

```text
Resources are service-only.
No current template runtime uses resource state.
No feedback loops, delayed flows, or arbitrary formulas.
```

Status:

```text
Completed.
```

## Prompt 16B — Resources, Stocks + Flows Audit

Purpose:

* Audit resource semantics.
* Confirm flow behavior and deterministic operation order.
* Confirm no template runtime resource support.
* Confirm no resource uncertainty or UI.

Status:

```text
Completed.
```

## Prompt 17 — Feedback Loops, Delays + Events V1

Purpose:

* Add service-first event schedules.
* Add delay queues.
* Add feedback-loop descriptors and simple adjustment semantics.
* Add metrics and serialization.

Boundary:

```text
Feedback/delays/events are service-only.
No current template runtime uses them.
No causal inference.
No arbitrary formulas.
```

Status:

```text
Completed.
```

## Prompt 17B — Feedback Loops, Delays + Events Audit

Purpose:

* Harden validation.
* Clarify release semantics.
* Confirm feedback classifications are metadata only.
* Confirm no template/runtime execution of feedback/delay/event models.

Status:

```text
Completed.
```

## Prompt 18 — Roadmap Alignment + Missing Pillar Reservation

Purpose:

* Add revised roadmap and missing-pillars docs.
* Reserve future pillars:

  * multi-scale
  * observability
  * causal assumptions
  * emergence
  * robustness
  * explainability
  * units
  * model schema/compiler
  * visual builder
  * calibration
  * external interop
  * and others
* Add tests rejecting unsupported future top-level fields.

Status:

```text
Completed.
```

## Prompt 18B — Roadmap Alignment Audit

Purpose:

* Audit roadmap and missing-pillar docs.
* Confirm future capabilities remain reserved.
* Confirm docs distinguish current vs future capability.

Status:

```text
Completed.
```

## Prompt 19 — Systems Primitive Registry + Capability Map

Purpose:

* Add registry for primitives, artifact families, and template capabilities.
* Mark implemented, serviceOnly, metadataOnly, reserved, unsupported.
* Make registry the source of truth for current vs future capability.

Boundary:

```text
Registry is metadata only.
It does not change runtime behavior.
```

Status:

```text
Completed.
```

## Prompt 19B — Primitive Registry + Capability Map Audit

Purpose:

* Harden registry status/support validation.
* Confirm global service availability does not mean template runtime support.
* Confirm reserved artifacts do not claim import/export support.

Status:

```text
Completed.
```

---

# Phase 4 — Hybrid Composition, Multi-Scale, Spatial/Environment Foundations

## Prompt 20 — Hybrid Model Composition Layer V1

Purpose:

* Add structural hybrid composition artifact.
* Allow attachment/reference of multiple service artifacts.
* Add capability reports and valid-vs-runnable distinction.

Boundary:

```text
Hybrid compositions validate and summarize.
They do not compile or execute hybrid models.
```

Status:

```text
Completed.
```

## Prompt 20B — Hybrid Model Composition Audit

Purpose:

* Audit attachment semantics.
* Confirm attachment is not activation.
* Confirm reserved primitives cannot become active.
* Confirm current templates do not runtime-support hybrid composition.

Status:

```text
Completed.
```

## Prompt 21 — Multi-Scale Systems Architecture V1

Purpose:

* Add structural multi-scale model.
* Declare scale levels, entity types, aggregation/disaggregation rules, cross-scale links.
* Surface information-loss and synthetic-detail warnings.

Boundary:

```text
No runtime aggregation/disaggregation.
No zoom UI.
No template multi-scale execution.
```

Status:

```text
Completed.
```

## Prompt 21B — Multi-Scale Architecture Audit

Purpose:

* Audit structural-only scale semantics.
* Confirm aggregation/disaggregation rules are not executable.
* Confirm synthetic disaggregation warnings.
* Confirm no template runtime support.

Status:

```text
Completed.
```

## Prompt 22 — Multi-Scale Zoom + View System V1

Purpose:

* Add headless scale-view state.
* Distinguish model-scale zoom from camera zoom.
* Track scale transitions, camera state, selection, warnings.

Boundary:

```text
Scale view is navigation metadata only.
No renderer integration.
No runtime aggregation/disaggregation.
```

Status:

```text
Completed.
```

## Prompt 22B — Multi-Scale Zoom + View System Audit

Purpose:

* Audit scale-view state.
* Confirm camera zoom is not multi-scale modeling.
* Confirm transitions do not execute rules or create entities.

Status:

```text
Completed.
```

## Prompt 23 — Boundaries + Environment Layer V1

Purpose:

* Add structural boundary/environment model.
* Declare system scope, environment scope, boundary surfaces, exchanges, external forcings, shocks.

Boundary:

```text
Boundary/environment declarations are structural only.
They do not execute exchanges, forcings, or shocks.
```

Status:

```text
Completed.
```

## Prompt 23B — Boundaries + Environment Audit

Purpose:

* Audit boundary warnings and validation.
* Confirm world bounds/grid edges are not full boundary models.
* Confirm no template boundary runtime support.

Status:

```text
Completed.
```

## Prompt 24 — Spatial Fields / Environmental Field Layers V1

Purpose:

* Add structural spatial field model.
* Declare coordinate spaces, extents, resolutions, fields, layers, sampling rules.

Boundary:

```text
Spatial fields are structural only.
No sampling, interpolation, diffusion, advection, GIS, or rendering.
```

Status:

```text
Completed.
```

## Prompt 24B — Spatial Fields Audit

Purpose:

* Harden spatial-field validation.
* Reject raster/value-grid payloads.
* Confirm coordinates/grids/positions are not full environmental field layers.
* Confirm no template spatial-field runtime support.

Status:

```text
Completed.
```

## Prompt 24C — Forest Fire / Landscape Spread Template V1

Purpose:

* Add new production template: Forest Fire / Landscape Spread.
* Implement deterministic grid local spread.
* Support empty/fuel/burning/burned states.
* Add spread, lightning, regrowth, burn duration, boundary mode, presets.
* Add metrics and minimal `forestFire.igniteCell` intervention.

Boundary:

```text
Abstract local-spread model.
Not a wildfire predictor.
No GIS, wind, terrain, humidity, suppression, or calibrated fire behavior.
```

Status:

```text
Completed.
```

## Prompt 24D — Forest Fire Template Audit

Purpose:

* Audit forest-fire behavior.
* Confirm deterministic state transitions.
* Confirm assumptions avoid wildfire prediction claims.
* Confirm grid/boundary behavior is template-owned, not full spatial/boundary primitive runtime support.

Status:

```text
Completed.
```

---

# Phase 5 — Measurement, Causality, Units, Emergence, Robustness, Strategy

## Prompt 25 — Observability + Measurement Model V1

Purpose:

* Add structural observability/measurement model.
* Declare variables, observation channels, measurement processes, uncertainty notes, visibility/coverage.

Boundary:

```text
Observability does not measure runtime data.
Measurement structure does not imply measurement validity.
```

Status:

```text
Completed.
```

## Prompt 25B — Observability + Measurement Audit

Purpose:

* Audit observability semantics.
* Confirm no data ingestion, no validation, no calibration.
* Confirm runtime metrics are not empirical measurements.

Status:

```text
Completed.
```

## Prompt 26 — Causal Assumptions + Influence Model V1

Purpose:

* Add structural causal assumption model.
* Declare variables, influences, assumptions, evidence notes, intervention links.

Boundary:

```text
No causal discovery.
No do-calculus.
No structural equation solving.
No causal proof.
```

Status:

```text
Completed.
```

## Prompt 26B — Causal Assumptions Audit

Purpose:

* Harden validation against inference/proof payloads.
* Confirm networks, feedback labels, runtime metrics, and observations are not causal evidence by themselves.
* Confirm no causal execution.

Status:

```text
Completed.
```

## Prompt 27 — Units, Dimensions + Quantity Semantics V1

Purpose:

* Add structural units/dimensions/quantity semantics.
* Declare dimensions, units, quantities, numeric roles, ranges, compatibility rules.

Boundary:

```text
No runtime unit enforcement.
No automatic conversion.
No symbolic algebra.
No dimensional equation solving.
No calibration.
```

Status:

```text
Completed.
```

## Prompt 27B — Units, Dimensions + Quantity Semantics Audit

Purpose:

* Audit unit/quantity validation.
* Confirm parameter labels, metric labels, and numeric bounds are not full unit semantics.
* Confirm per-tick rates are model-time unless explicitly mapped.

Status:

```text
Completed.
```

## Prompt 28 — Emergence Detection + Pattern Descriptors V1

Purpose:

* Add structural emergence/pattern descriptor model.
* Declare candidate patterns, variables, signatures, thresholds, time windows, scale links.

Boundary:

```text
No runtime pattern detection.
No ML/statistics/anomaly detection.
No proof of emergence.
```

Status:

```text
Completed.
```

## Prompt 28B — Emergence Detection + Pattern Descriptors Audit

Purpose:

* Audit emergence claims.
* Confirm visual patterns and runtime metrics are model outputs, not empirical proof.
* Confirm active descriptors are structural, not runtime-detected.

Status:

```text
Completed.
```

## Prompt 29 — Robustness, Resilience + Stress Testing Semantics V1

Purpose:

* Add structural robustness/resilience model.
* Declare stressors, response criteria, failure modes, stress-test plans.

Boundary:

```text
No runtime stress testing.
No perturbing active simulations.
No safety certification.
No robustness proof.
```

Status:

```text
Completed.
```

## Prompt 29B — Robustness, Resilience + Stress Testing Audit

Purpose:

* Harden validation against control, execution, risk, safety, and experiment-result payloads.
* Confirm uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation.

Status:

```text
Completed.
```

## Prompt 30 — Strategy, Control + Intervention Semantics V1

Purpose:

* Add structural strategy/control/intervention semantics.
* Declare strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, expected effects.
* Allow structural references to template-owned interventions.

Boundary:

```text
No runtime control.
No policy execution.
No template-intervention execution.
No optimization.
No strategy proof.
```

Status:

```text
Completed.
```

## Prompt 30B — Strategy, Control + Intervention Semantics Audit

Purpose:

* Harden treatment-effect, recommendation, ranking, policy-execution, and safety payload rejection.
* Confirm template-owned interventions are not general strategy/control support.
* Confirm active policies/triggers/objectives are structural only.

Status:

```text
Completed.
```

---

# Phase 6 — Model Schema + Visual Builder Foundations

## Prompt 31 — Model Schema + Interpreter Foundation V1

Purpose:

* Add structural model schema artifact.
* Declare:

  * entity types
  * component types
  * attribute types
  * spaces
  * parameters
  * metrics
  * rule declarations
  * artifact references
* Add interpreter capability report.

Boundary:

```text
Model schemas declare model structure.
A valid model schema is not a template, scenario, RunConfig, or snapshot.
Model schemas declare model structure; they do not execute rules or create runnable simulations.
Rule declarations are descriptive metadata, not parsed formulas or executable behavior.
They do not generate scenarios, RunConfigs, snapshots, or templates.
Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.
Prompt 31C structural social/cognitive semantics and Prompt 31D audit hardening are complete; generic social-learning runtime remains unavailable outside the narrow Opinion Dynamics behavior mode added in Prompt 33C.
Prompt 32 visual model-builder workspace planning is complete; Prompt 34 safe builder UI shell is complete; runnable visual model authoring, schema execution, and runtime compiler/interpreter work remain future.
No compiler/interpreter runtime yet.
```

Status:

```text
Completed.
```

## Prompt 31B — Model Schema + Interpreter Foundation Audit

Purpose:

* Audit model schema as structural only.
* Confirm rule declarations are descriptive metadata, not parsed formulas or executable behavior.
* Confirm valid schema is not a template, scenario, RunConfig, or snapshot.
* Confirm no visual builder or external interop claims.

Status:

```text
Completed.
```

## Prompt 31C — Knowledge, Memory + Social Learning Semantics V1

Purpose:

* Add structural semantics for bounded knowledge, bounded memory, and social learning.
* Define validation boundaries for social/cognitive modeling.
* Preserve explicit limitation language before visual builder planning begins.

Boundary:

```text
Knowledge, memory, and social learning semantics are structural only.
No full human cognition.
No LLM-per-agent runtime.
No unbounded memory.
No real-person inference.
No Opinion Dynamics runtime changes yet.
Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition.
Background profiles are compressed prior descriptors, not simulated life histories.
Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals.
LLM-per-agent runtime is not implemented and must not be implied.
Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.
Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template.
Opinion values and social-learning metrics are model outputs, not measured human beliefs.
Information-source credibility is a model parameter, not a verified truth score.
No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.
```

Status:

```text
Completed.
```

## Prompt 31D — Knowledge, Memory + Social Learning Audit

Purpose:

* Audit social/cognitive semantics as structural only.
* Confirm bounded representations and validation boundaries.
* Confirm no full cognition, LLM-per-agent runtime, unbounded memory, or real-person inference claims.
* Confirm runtime social learning starts narrowly with Opinion Dynamics later.

Status:

```text
Completed.
```

## Prompt 32 — Visual Model Builder Planning + Workspace Schema V1

Purpose:

* Add structural visual builder workspace artifact.
* Declare workspace nodes, edges, layout metadata, selection state, validation state, warnings.
* Allow references to ModelSchemaDefinition.

Boundary:

```text
Visual builder workspaces are structural planning artifacts; they do not implement runnable visual model authoring.
Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior.
A valid visual builder workspace does not make a model schema runnable.
Prompt 32 does not add drag-and-drop modeling, visual programming, or schema execution.
```

Status:

```text
Completed.
```

## Prompt 32B — Visual Builder Workspace Audit

Purpose:

* Audit visual workspace as non-executable.
* Confirm no formula/code/script blocks.
* Confirm no scenario/RunConfig/snapshot/template generation.
* Confirm no renderer rewrite.

Status:

```text
Completed.
```

## Prompt 33 — Template/Schema Compatibility Mapping V1

Purpose:

* Add headless compatibility mapping between model schemas and existing templates.
* Report closest template matches, unsupported schema concepts, mapping losses, and missing capabilities.

Boundary:

```text
Schema/template similarity is not runtime compatibility.
No schema-to-template generation.
No scenario generation.
Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models.
A strong template fit does not mean a schema can run.
Unsupported and lossy mappings must remain visible; they must not be silently dropped.
Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines.
```

Status:

```text
Completed.
```

## Prompt 33B — Template/Schema Compatibility Mapping Audit

Purpose:

* Confirm compatibility mapping does not become fake compilation.
* Confirm closest-template does not mean executable.
* Confirm no automatic scenario/RunConfig/snapshot generation.

Status:

```text
Completed.
```

## Prompt 33C — Opinion Dynamics Social Learning Runtime V1

Purpose:

* Add a narrow social-learning runtime slice to Opinion Dynamics after schema/template compatibility mapping.
* Use only template-defined, bounded, symbolic or numeric social-learning state.

Boundary:

```text
Opinion Dynamics is the only initial runtime target for social learning.
No full human cognition.
No LLM-per-agent runtime.
No unbounded memory.
No real-person inference.
No human prediction claims.
```

Status:

```text
Completed.
```

## Prompt 33D — Opinion Dynamics Social Learning Runtime Audit

Purpose:

* Audit the Opinion Dynamics social-learning runtime slice.
* Confirm deterministic bounded state and template-defined behavior.
* Confirm no broader social/cognitive runtime support is implied.

Status:

```text
Completed.
```

## Prompt 34 — Safe Builder UI Shell V1

Purpose:

* Add initial non-executing builder UI shell.
* Let users view/organize schema pieces and artifact references.
* Show warnings and unsupported/future-only statuses.

Boundary:

```text
No Run Model button.
No custom runtime.
No schema execution.
No scenario generation.
Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges.
The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime.
A structurally valid workspace is still not a runnable model.
Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics.
```

Status:

```text
Completed.
```

## Prompt 34B — Safe Builder UI Shell Audit

Purpose:

* Audit UI copy and affordances.
* Confirm UI does not imply custom models can run.
* Confirm no hidden compiler or engine mutation.

Status:

```text
Planned.
```

## Prompt 35 — Model Schema Authoring Forms V1

Purpose:

* Add form-based editing for model schema parts:

  * entities
  * components
  * attributes
  * spaces
  * parameters
  * metrics
  * rule declarations
  * artifact references

Boundary:

```text
Forms edit structure only.
No code/formula/script input.
No executable behavior.
```

Status:

```text
Planned.
```

## Prompt 35B — Model Schema Authoring Forms Audit

Purpose:

* Audit form validation.
* Confirm no unsafe fields can be inserted.
* Confirm rule descriptions remain prose.

Status:

```text
Planned.
```

## Prompt 36 — Visual Builder Graph View V1

Purpose:

* Add graph visualization of model schema/workspace.
* Show entities, components, attributes, spaces, parameters, metrics, rules, artifact references.
* Show warnings/badges for unsupported features.

Boundary:

```text
Graph explains schema.
Graph does not run schema.
Edges are not executable behavior.
```

Status:

```text
Planned.
```

## Prompt 36B — Visual Builder Graph View Audit

Purpose:

* Audit graph view.
* Confirm no node graph execution.
* Confirm no visual programming semantics.
* Confirm no formula/code/script execution.

Status:

```text
Planned.
```

---

# Phase 7 — Builder Usability, Mapping, Scenario Drafting, Experiments

## Prompt 37 — Schema Validation UX + Repair Suggestions V1

Purpose:

* Add user-facing validation panel for schemas and workspaces.
* Show missing, unsafe, unsupported, future-only parts.
* Suggest safe repairs.

Boundary:

```text
Suggestions are advisory only.
No automatic executable rule generation.
```

Status:

```text
Planned.
```

## Prompt 38 — Schema-to-Template Fit Report V1

Purpose:

* Report which current ORTUS template a schema resembles.
* Explain fit, gaps, unsupported concepts, and mapping losses.

Boundary:

```text
Resembles does not mean can run as.
No conversion yet.
```

Status:

```text
Planned.
```

## Prompt 39 — Scenario Planning From Schema V1

Purpose:

* Produce scenario planning drafts from schemas.
* Identify what a real scenario would need.

Boundary:

```text
Scenario planning draft is not executable.
No actual Scenario generation.
No RunConfig generation.
```

Status:

```text
Planned.
```

## Prompt 40 — Safe Scenario Draft Workspace V1

Purpose:

* Add UI/workspace for viewing and editing scenario drafts.
* Connect schema ideas to future template-constrained scenario proposals.

Boundary:

```text
Scenario drafts are not applied to the engine.
```

Status:

```text
Planned.
```

## Prompt 41 — Template-Constrained Scenario Generator V1

Purpose:

* Generate scenario proposals only for existing validated templates.
* Use only template-owned parameter definitions, presets, behavior modes, composition fields, and environment options.

Boundary:

```text
Generated scenarios are proposals.
They require validation and user approval.
They cannot invent unsupported behavior.
No custom schema execution.
```

Status:

```text
Planned.
```

## Prompt 42 — Scenario Generator Apply Flow V1

Purpose:

* Add safe apply flow for generated template-constrained scenarios.
* Show mapped fields, ignored fields, unsupported fields, assumptions, and limitations.

Boundary:

```text
Only existing template scenarios can be applied.
No custom schema execution.
```

Status:

```text
Planned.
```

## Prompt 43 — Builder-to-Experiment Plan V1

Purpose:

* Produce experiment plans from schemas/scenario drafts.
* Describe parameter sweeps, uncertainty runs, metrics, and comparison goals.

Boundary:

```text
Planning only.
No automatic experiment execution.
```

Status:

```text
Planned.
```

## Prompt 44 — Experiment Plan Execution for Existing Templates V1

Purpose:

* Execute experiment plans only when every run maps to existing validated template scenarios/RunConfigs.

Boundary:

```text
No schema execution.
Only template-backed runs.
```

Status:

```text
Planned.
```

## Prompt 45 — Results Interpretation Workspace V1

Purpose:

* Compare run outputs against schema declarations, scenario drafts, experiment plans, assumptions, robustness descriptors, emergence descriptors, and strategy descriptors.

Boundary:

```text
Interpretation is descriptive.
It does not prove causality, validation, robustness, emergence, or strategy effectiveness.
```

Status:

```text
Planned.
```

## Prompt 46 — Provenance Threading Across Builder → Scenario → Experiment → Results V1

Purpose:

* Link:

  * model schema
  * visual workspace
  * scenario draft
  * generated scenario proposal
  * applied scenario
  * RunConfig
  * experiment plan
  * experiment results
  * assumptions
  * warnings
  * unsupported fields

Boundary:

```text
Provenance distinguishes declared, mapped, ignored, executed, and observed.
```

Status:

```text
Planned.
```

---

# Phase 8 — Execution Gating, Explanations, Projects, Documentation

## Prompt 47 — Execution Eligibility Gate V1

Purpose:

* Add formal gate classifying artifacts as:

  * structural only
  * draft only
  * template-constrained executable
  * blocked
  * future-only

Boundary:

```text
Gate does not execute anything.
It only explains whether execution is allowed and why.
```

Status:

```text
Planned.
```

## Prompt 48 — Unsupported Feature Explanation Engine V1

Purpose:

* Explain why schema/workspace/model parts cannot run yet.
* Give precise missing-capability explanations.

Boundary:

```text
Explanations are descriptive.
No repair automation.
```

Status:

```text
Planned.
```

## Prompt 49 — Safe Model Simplification Suggestions V1

Purpose:

* Suggest how complex schemas could simplify into existing template-supported behavior.
* Explicitly list what is lost.

Boundary:

```text
No silent downgrade.
No executable conversion.
```

Status:

```text
Planned.
```

## Prompt 50 — Template-Constrained Mapping Profiles V1

Purpose:

* Define formal mapping profiles for each production template:

  * entities
  * spaces
  * parameters
  * metrics
  * scenario fields
  * unsupported concepts
  * warnings

Boundary:

```text
Mapping profiles describe possible mappings.
They do not create custom behavior.
```

Status:

```text
Planned.
```

## Prompt 51 — Builder Import/Export Bundle V1

Purpose:

* Package builder project artifacts together:

  * model schema
  * workspace
  * assumptions
  * quantities
  * observability
  * causality
  * robustness
  * strategy
  * scenario draft
  * provenance

Boundary:

```text
Bundle import does not activate runtime behavior.
```

Status:

```text
Planned.
```

## Prompt 52 — Builder Project Library V1

Purpose:

* Add local project library for builder bundles.
* Support save/load/duplicate/delete.
* Enforce size bounds and corruption handling.

Boundary:

```text
Loading a project does not apply scenarios or start runs.
```

Status:

```text
Planned.
```

## Prompt 53 — Workspace Diff + Change Review V1

Purpose:

* Compare versions of builder projects.
* Show structural changes.

Boundary:

```text
Diff is structural only.
No behavioral equivalence claims.
```

Status:

```text
Planned.
```

## Prompt 54 — Model Documentation Generator V1

Purpose:

* Generate readable documentation report from builder project.
* Include declarations, runnable/not-runnable status, assumptions, limitations, unsupported features, provenance, mapping losses, warnings.

Boundary:

```text
Documentation is not validation.
```

Status:

```text
Planned.
```

## Prompt 55 — Shareable Model Report Export V1

Purpose:

* Export documentation reports as Markdown and JSON.

Boundary:

```text
Exported reports must preserve not-runnable/not-validated/not-predictive language.
```

Status:

```text
Planned.
```

## Prompt 56 — Builder Workspace Navigation + Information Architecture V1

Purpose:

* Organize builder workspace into clear zones:

  * Model Structure
  * Rules
  * Spaces
  * Assumptions
  * Measurements
  * Causality
  * Robustness
  * Strategy
  * Mapping
  * Execution Eligibility
  * Results/Provenance

Boundary:

```text
Navigation and information architecture only.
No runtime capability.
```

Status:

```text
Planned.
```

---

# Phase 9 — Backend / Full-Stack Transition

The backend should start only after builder projects, provenance, execution eligibility, and reports are stable.

## Prompt 57 — Backend Architecture Plan + Data Boundary Audit

Purpose:

* Plan backend architecture.
* Define what remains local vs server-side.
* Define trust boundaries.
* Decide what server accepts and validates.

Boundary:

```text
No backend simulation execution yet.
```

Status:

```text
Planned.
```

## Prompt 58 — Project Persistence API V1

Purpose:

* Add backend storage for validated builder bundles/projects.

Boundary:

```text
Project storage only.
No server-side simulation execution.
```

Status:

```text
Planned.
```

## Prompt 59 — User Accounts + Project Ownership V1

Purpose:

* Add authentication, ownership, private/public flags, and project access control.

Boundary:

```text
Auth does not change model execution semantics.
```

Status:

```text
Planned.
```

## Prompt 60 — Cloud Project Library V1

Purpose:

* Add optional cloud sync for builder projects.

Boundary:

```text
Cloud library stores validated documents.
It does not execute them.
```

Status:

```text
Planned.
```

## Prompt 61 — Server-Side Validation Mirror V1

Purpose:

* Mirror strict artifact validation server-side before accepting uploaded projects.

Boundary:

```text
Server validation does not imply empirical validation or model correctness.
```

Status:

```text
Planned.
```

## Prompt 62 — Cloud Builder Bundle Sync V1

Purpose:

* Sync project bundles between local and cloud state.
* Preserve provenance and version metadata.

Boundary:

```text
Sync does not apply scenarios or run simulations.
```

Status:

```text
Planned.
```

## Prompt 63 — Project Version History V1

Purpose:

* Add project version history, restore points, and change metadata.

Boundary:

```text
Version history is document history, not behavioral equivalence.
```

Status:

```text
Planned.
```

## Prompt 64 — Shareable Project Links V1

Purpose:

* Add shareable links for projects or reports.

Boundary:

```text
Shared projects remain bounded, validated documents.
```

Status:

```text
Planned.
```

## Prompt 65 — Public/Private Model Library V1

Purpose:

* Add public/private library for model projects and reports.

Boundary:

```text
Published model does not mean validated or predictive.
```

Status:

```text
Planned.
```

## Prompt 66 — Backend Artifact Security + Abuse Audit

Purpose:

* Audit backend artifact acceptance, validation, storage, sharing, permissions, and abuse risks.

Boundary:

```text
No unsafe executable payloads.
No trust in client-side validation alone.
```

Status:

```text
Planned.
```

---

# Phase 10 — Server-Side Jobs, Compute, Collaboration

## Prompt 67 — Server-Side Experiment Job Planning V1

Purpose:

* Define server-side experiment job descriptors for template-backed runs.

Boundary:

```text
Planning only.
No custom schema execution.
```

Status:

```text
Planned.
```

## Prompt 68 — Server-Side Experiment Queue V1

Purpose:

* Add queue for validated template-backed experiment jobs.

Boundary:

```text
Only existing template-backed RunConfigs.
No arbitrary user model execution.
```

Status:

```text
Planned.
```

## Prompt 69 — Job Result Storage + Provenance V1

Purpose:

* Store job results and provenance links.

Boundary:

```text
Results are model outputs, not empirical validation.
```

Status:

```text
Planned.
```

## Prompt 70 — Compute Limits, Quotas + Cancellation V1

Purpose:

* Add job limits, quotas, cancellation, and failure handling.

Boundary:

```text
Prevents runaway compute.
Does not expand model capability.
```

Status:

```text
Planned.
```

## Prompt 71 — Collaborative Project Review V1

Purpose:

* Add collaboration/review workflow for project artifacts.

Boundary:

```text
Review notes are not validation.
```

Status:

```text
Planned.
```

## Prompt 72 — Comments + Model Review Notes V1

Purpose:

* Add comments, annotations, review notes, and threadable feedback.

Boundary:

```text
Comments are documentation.
They do not alter runtime semantics unless explicitly applied through validated artifacts.
```

Status:

```text
Planned.
```

## Prompt 73 — Team / Shared Workspace Permissions V1

Purpose:

* Add team permissions and shared project access.

Boundary:

```text
Permissions do not change artifact validity.
```

Status:

```text
Planned.
```

## Prompt 74 — Published Model Reports V1

Purpose:

* Publish model reports with assumptions, limitations, provenance, and runnable/not-runnable status.

Boundary:

```text
Publication is not validation.
```

Status:

```text
Planned.
```

## Prompt 75 — Reproducible Cloud Runs V1

Purpose:

* Make server-side template-backed runs reproducible with seeds, versions, and artifact hashes.

Boundary:

```text
Template-backed only.
No custom schema runtime.
```

Status:

```text
Planned.
```

## Prompt 76 — Cloud Execution Audit

Purpose:

* Audit queue execution, reproducibility, limits, provenance, and security.

Boundary:

```text
No arbitrary custom model execution.
No unsafe payloads.
```

Status:

```text
Planned.
```

---

# Phase 11 — Validation, Calibration, Sensitivity, Data Assimilation

## Prompt 77 — Validation Dataset Descriptor V1

Purpose:

* Add structural descriptor for validation datasets.

Boundary:

```text
Dataset descriptor does not validate a model.
No ingestion/execution unless explicitly implemented.
```

Status:

```text
Planned.
```

## Prompt 78 — Calibration Target Descriptor V1

Purpose:

* Add structural calibration target descriptor.

Boundary:

```text
Calibration target is a declaration, not calibration.
```

Status:

```text
Planned.
```

## Prompt 79 — Model/Data Fit Report V1

Purpose:

* Compare model outputs to declared data/targets where explicitly supported.

Boundary:

```text
Fit report is descriptive.
No broad model validity claim.
```

Status:

```text
Planned.
```

## Prompt 80 — Sensitivity Analysis Plan V1

Purpose:

* Declare sensitivity analysis plans.

Boundary:

```text
Plan only.
No execution yet.
```

Status:

```text
Planned.
```

## Prompt 81 — Sensitivity Execution for Existing Templates V1

Purpose:

* Execute sensitivity analyses only for validated existing template-backed runs.

Boundary:

```text
No custom schema execution.
No statistical overclaiming.
```

Status:

```text
Planned.
```

## Prompt 82 — Calibration Plan V1

Purpose:

* Declare calibration plan for supported template/data combinations.

Boundary:

```text
Plan only.
No calibration execution yet.
```

Status:

```text
Planned.
```

## Prompt 83 — Calibration Execution for Existing Templates V1

Purpose:

* Execute bounded calibration only for explicitly supported existing templates and declared data.

Boundary:

```text
Calibration claim applies only to exact template/data/artifact context.
No global validity claim.
```

Status:

```text
Planned.
```

## Prompt 84 — Data Assimilation Plan V1

Purpose:

* Declare data assimilation plan.

Boundary:

```text
Plan only.
No assimilation execution yet.
```

Status:

```text
Planned.
```

## Prompt 85 — Data Assimilation Execution V1

Purpose:

* Execute bounded data assimilation only where explicitly supported.

Boundary:

```text
No general inference engine.
No universal validity.
```

Status:

```text
Planned.
```

## Prompt 86 — Validation / Calibration Audit

Purpose:

* Audit validation, calibration, sensitivity, and assimilation claims.
* Confirm no overclaiming.

Status:

```text
Planned.
```

---

# Phase 12 — External Framework Interop

## Prompt 87 — External Framework Interop Planning V1

Purpose:

* Plan safe interop boundaries for NetLogo, Mesa, MASON, and possibly Repast.

Boundary:

```text
Planning only.
No import/export yet.
No compatibility claims.
```

Status:

```text
Planned.
```

## Prompt 88 — NetLogo Conceptual Mapping V1

Purpose:

* Map NetLogo concepts to ORTUS concepts:

  * turtles
  * patches
  * links
  * observer
  * topology
  * procedures

Boundary:

```text
Conceptual mapping only.
No NetLogo import/export.
No code execution.
```

Status:

```text
Planned.
```

## Prompt 89 — Mesa Conceptual Mapping V1

Purpose:

* Map Mesa concepts to ORTUS:

  * agents
  * model
  * scheduler
  * spaces
  * data collection
  * visualization

Boundary:

```text
Conceptual mapping only.
No Mesa import/export.
```

Status:

```text
Planned.
```

## Prompt 90 — MASON Conceptual Mapping V1

Purpose:

* Map MASON concepts to ORTUS:

  * model/schedule
  * fields
  * portrayals
  * simulation/visualization separation

Boundary:

```text
Conceptual mapping only.
No MASON import/export.
```

Status:

```text
Planned.
```

## Prompt 91 — External Model Import Descriptor V1

Purpose:

* Add descriptor for external model import metadata.

Boundary:

```text
Descriptor only.
No parser.
No executable imported models.
```

Status:

```text
Planned.
```

## Prompt 92 — External Model Export Descriptor V1

Purpose:

* Add descriptor for external model export metadata.

Boundary:

```text
Descriptor only.
No code generation.
No real export yet.
```

Status:

```text
Planned.
```

## Prompt 93 — Safe External Interop Validation V1

Purpose:

* Validate interop descriptors and reject unsafe code/data payloads.

Boundary:

```text
Validation of descriptors only.
No framework execution.
```

Status:

```text
Planned.
```

## Prompt 94 — Limited NetLogo Export Prototype V1

Purpose:

* Experiment with highly constrained export of simple ORTUS model schemas to NetLogo-like conceptual output.

Boundary:

```text
Prototype only.
No arbitrary code generation.
No import.
No compatibility claim.
```

Status:

```text
Planned.
```

## Prompt 95 — Limited Mesa Export Prototype V1

Purpose:

* Experiment with highly constrained export of simple ORTUS model schemas to Mesa-like conceptual output.

Boundary:

```text
Prototype only.
No arbitrary Python code execution.
No compatibility claim.
```

Status:

```text
Planned.
```

## Prompt 96 — External Interop Audit

Purpose:

* Audit all external interop work.
* Confirm no unsafe code execution, unsupported compatibility claims, or import/export overreach.

Status:

```text
Planned.
```

---

# Phase 13 — Runtime Schema Interpreter / Custom Models

## Prompt 97 — Safe Runtime Interpreter Feasibility Study

Purpose:

* Study feasibility of a restricted ORTUS runtime interpreter.
* Identify safe rule vocabulary, sandboxing, performance, and validation requirements.

Boundary:

```text
Study only.
No interpreter execution yet.
```

Status:

```text
Planned.
```

## Prompt 98 — Restricted Rule Vocabulary V1

Purpose:

* Define a safe non-arbitrary rule vocabulary.

Boundary:

```text
No arbitrary formulas.
No JavaScript/Python/user code.
No execution yet unless explicitly scoped.
```

Status:

```text
Planned.
```

## Prompt 99 — Non-Arbitrary Rule Interpreter Prototype V1

Purpose:

* Prototype interpreter for a tiny, safe, restricted rule vocabulary.

Boundary:

```text
Prototype only.
No general-purpose programming.
No arbitrary expressions.
No external code.
```

Status:

```text
Planned.
```

## Prompt 100 — Custom Model Runtime Sandbox V1

Purpose:

* Add sandboxed runtime environment for restricted custom models if previous prompts prove feasible.

Boundary:

```text
Restricted ORTUS vocabulary only.
No arbitrary user code.
No external code execution.
Strict resource limits.
```

Status:

```text
Planned.
```

## Prompt 100B — Custom Model Runtime Sandbox Audit

Purpose:

* Audit sandbox safety, determinism, limits, and non-arbitrary execution boundary.

Status:

```text
Planned.
```

## Prompt 101 — Custom Model Runtime Audit

Purpose:

* Audit custom runtime correctness, capability claims, validation boundaries, performance, and UI language.

Status:

```text
Planned.
```

## Prompt 102 — ORTUS Capability Review + V2 Planning

Purpose:

* Review all implemented capabilities.
* Separate:

  * runtime-supported
  * service-only
  * metadata-only
  * reserved
  * unsupported
* Plan ORTUS V2.

Status:

```text
Planned.
```

---

# Global Audit Rule

Every major feature prompt that introduces a new artifact family, runtime behavior, UI affordance, backend behavior, or capability claim should be followed by an audit prompt.

Audit prompts must verify:

```text
No weakened tests.
No unsafe payloads.
No false runtime support claims.
No predictive/causal/validation/calibration overclaims.
No executable behavior unless explicitly implemented and tested.
No artifact activation by attachment alone.
No global service availability treated as template runtime support.
```

---

# Current Next Steps

Recommended immediate next steps:

```text
1. Review and commit the Prompt 34 Safe Builder UI Shell V1 work.
2. Prepare Prompt 34B — Safe Builder UI Shell Audit.
3. Keep Prompt 34B audit-focused: no Run Model button, no schema execution, no scenario generation, no hidden compiler, no custom runtime, and no builder editing.
```

Do not start any builder editing or runtime-mapping prompt until the repo status and roadmap docs clearly reflect:

```text
Completed through Prompt 34.
Performance stabilization completed after Prompt 30B.
Prompt 34 safe builder shell is complete.
Next roadmap prompt: Prompt 34B.
```
