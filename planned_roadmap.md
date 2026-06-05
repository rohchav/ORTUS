# ORTUS Planned Roadmap

Status as of June 5, 2026: ORTUS is completed through Prompt 30B. The
post-30B repository hygiene, dependency stabilization, durable context, and
performance/scalability stabilization pass is also complete. Prompt 31 has not
started. Do not start Prompt 31 from this audit document.

This document extends `docs/roadmap.md`, `docs/missing-pillars.md`, and
`docs/codex/CURRENT_CONTEXT.md`. It is a planning and audit correction document,
not a claim that future capabilities already exist.

## Audit Thesis

ORTUS is not allowed to become a pretty pseudo-ABM tool.
Structural semantics are valuable only if they eventually connect to narrow,
tested runtime slices.
Runtime support must be earned, not implied.

The current architecture has a strong headless simulation core, strict
validation culture, deterministic seeded randomness, a conservative primitive
registry, and clear separation between simulation state and UI rendering. The
largest risk is not a single bug. The largest risk is letting rich structural
metadata, visual polish, and future-looking names sound like executed science
before runtime behavior, calibration boundaries, benchmarks, and audit tests
exist.

## Current Support Boundaries

Current runtime-supported foundations:

- Headless simulation engine in `src/simulation`.
- Deterministic seeded RNG streams, engine snapshots, event queue, command
  buffer, metric collection, and bounded histories.
- Template registry with production templates for Epidemic, Opinion Dynamics,
  Predator-Prey, Schelling Segregation, Flocking, and Forest Fire / Landscape
  Spread.
- Template-defined parameters, scenarios, behavior modes, interventions,
  experiments, run summaries, and template-specific runtime metrics.
- Continuous and grid space services used by production templates. `NetworkSpace`
  exists as a headless space module, but production templates do not claim
  network primitive runtime support.
- Performance instrumentation and selected spatial-indexing/runtime hot-loop
  optimizations from the post-30B stabilization pass.

Current structural or service-level foundations, not template runtime support
unless a template explicitly uses them:

- Uncertainty configuration.
- Assumption profiles.
- Network relation artifacts.
- Resources, stocks, and flows.
- Feedback loops, delays, and events.
- Hybrid model composition.
- Multi-scale structure and scale view state.
- Boundary/environment models.
- Spatial fields/environmental layers.
- Observability models.
- Causal assumption models.
- Quantity semantics.
- Emergence pattern descriptors.
- Robustness/resilience semantics.
- Strategy/control semantics.

Reserved future foundations:

- Model definition schema and interpreter.
- Rule primitive library.
- Trace inspection and error budgets.
- Visual model builder.
- Validation, calibration, sensitivity, MCMC, and data assimilation.
- External framework interoperability.
- Runtime infrastructure, security hardening, project persistence, and
  productization.

## Expert Audit Additions and Roadmap Corrections

1. Insert Prompt 31C: Knowledge, Memory + Social Learning Semantics V1 after
   Prompt 31B and before Prompt 32.
2. Insert Prompt 31D: Knowledge, Memory + Social Learning Audit immediately
   after Prompt 31C.
3. Keep Prompt 31 itself scoped to model schema and interpreter foundations.
   Prompt 31 must not introduce a visual builder, arbitrary formulas, arbitrary
   code execution, backend behavior, or runtime support for existing structural
   primitives.
4. Add explicit social/cognitive guardrails to the working instructions:
   bounded representations only, no LLM-per-agent runtime, no unbounded memory,
   no real-person inference, no human prediction claims, and no protected-class
   stereotype modeling without explicit ethical review and purpose.
5. Schedule at least one narrow runtime integration slice before broad visual
   authoring. Structural semantics should not pile up indefinitely without
   executed, tested examples.
6. Prioritize Opinion Dynamics for the first social-learning runtime slice,
   because it already has a bounded scalar opinion state and local influence
   mechanics. It must be upgraded carefully, not rebranded as human cognition.
7. Keep visual builder work after schema, interpreter, execution safety,
   capability checks, trace/error reporting, and at least one audited runtime
   semantic slice.
8. Add performance follow-ups before any high-scale, custom-runtime, or visual
   builder claims. Current perf work is useful local evidence, not a scalability
   certificate.
9. Correct roadmap/registry prompt-number drift in a future documentation and
   registry cleanup. Some registry future-scope wording still reflects older
   prompt ordering and should be reconciled without weakening capability tests.
10. Keep validation/calibration after observability, quantity semantics, causal
    assumptions, run summaries, and runtime slices have enough structure to make
    validation meaningful.

## Prompt Sequence From 31 Forward

This is the corrected planning sequence. It preserves audit prompts after risky
feature prompts and keeps "valid" distinct from "runnable".

| Prompt | Scope | Runtime claim allowed |
| --- | --- | --- |
| 31 | Model Schema + Interpreter Foundation V1 | No template runtime expansion. Defines safe schemas, interpreter boundaries, capability checks, and non-executable model definitions. |
| 31B | Model Schema + Interpreter Audit | No new features. Audits schemas, interpreter safety, registry alignment, and unsupported-runtime claims. |
| 31C | Knowledge, Memory + Social Learning Semantics V1 | Structural only. Adds bounded social/cognitive semantics and validation, not full cognition or LLM agents. |
| 31D | Knowledge, Memory + Social Learning Audit | No new features. Audits overclaim, ethical boundaries, bounded state, and template capability flags. |
| 32 | Model Definition Versioning + Migration V1 | Structural/project layer only. Versioned definitions and migrations, no custom runtime execution by default. |
| 32B | Versioning + Migration Audit | No new features. Tests round trips, migrations, invalid legacy states, and capability drift. |
| 33 | Rule Primitive Library V1 | Defines a small audited library of safe rule primitives, not arbitrary user formulas. |
| 33B | Rule Primitive Audit | No new features. Audits determinism, validation, forbidden expression paths, and template compatibility. |
| 34 | Safe Interpreter Execution Boundary V1 | Executes only approved rule primitives in a bounded sandboxed engine path. No general code execution. |
| 34B | Execution Safety Audit | No new features. Audits determinism, command validation, runtime budgets, and failure modes. |
| 35 | Trace Inspection + Error Budgets V1 | Adds explainable runtime traces and budget accounting for interpreted rules. |
| 35B | Trace/Error Budget Audit | No new features. Audits bounded storage, reproducibility, and user-facing claims. |
| 36 | Opinion Dynamics Social Learning Runtime V1 | Narrow runtime slice only. Uses bounded knowledge, memory, exposure, trust, and social learning in Opinion Dynamics. |
| 36B | Social Learning Runtime Audit | No new features. Audits deterministic behavior, ethical framing, non-human-prediction claims, and performance. |
| 37 | Snapshot + Render Buffer Optimization V1 | Runtime/UI boundary optimization. Reduces full snapshot/render-model churn without changing simulation semantics. |
| 37B | Snapshot/Render Optimization Audit | No new features. Audits determinism, export boundaries, UI consumption, and perf reports. |
| 38 | Worker-Friendly Runtime Loop V1 | Local runtime infrastructure only. Chunked/cancellable execution and worker boundaries, no backend. |
| 38B | Worker Runtime Audit | No new features. Audits cancellation, determinism, serialization, and local-only scope. |
| 39 | Narrow Observability Runtime Slice V1 | Executes a limited measurement process for one template. Does not validate against reality. |
| 39B | Observability Runtime Audit | No new features. Audits state-vs-observation distinction and synthetic/empirical labeling. |
| 40 | Resource/Feedback Runtime Slice V1 | Narrow template runtime slice, likely Predator-Prey or another explicitly chosen template. |
| 40B | Resource/Feedback Runtime Audit | No new features. Audits capability flags, stability, bounded ledgers, and non-causal claims. |
| 41 | Visual Model Builder Foundation V1 | UI authoring only for schema-backed, capability-checked definitions. Not a fake runtime builder. |
| 41B | Visual Builder Audit | No new features. Audits unsupported claims, schema fidelity, safety, and round trips. |

Later prompt bands remain reserved until the above foundations are complete:

- Phase/tipping tools and attractor/basin descriptors.
- Adaptive agents and heterogeneity.
- Pattern libraries and domain packs.
- Robustness/stress execution slices.
- Strategy/control execution slices.
- Validation/calibration/sensitivity/MCMC/data assimilation.
- External framework adapter contracts.
- Backend/cloud collaboration, if still justified after local runtime, worker,
  project persistence, security, accessibility, and recovery foundations.
- Productization.

## Risks That Would Make ORTUS Pseudo-Scientific

- Treating structural metadata as executed runtime behavior.
- Treating template runtime metrics as empirical measurements.
- Treating uncertainty ensembles as calibrated probabilities.
- Treating causal assumption labels, network edges, feedback labels, or
  intervention descriptors as causal proof.
- Treating visual persistence, collapse, recovery, or clustering as proof of
  emergence, robustness, resilience, or policy effectiveness.
- Treating camera zoom, canvas optimization, or aggregate metrics as multi-scale
  modeling.
- Treating Forest Fire / Landscape Spread as wildfire prediction, GIS/weather
  modeling, suppression modeling, or calibrated fire behavior.
- Treating Schelling-style groups as real social groups without ethical framing
  and limitation warnings.
- Adding LLM-per-agent behavior, free-text biographies, unbounded memories, or
  pseudo-personality state and calling it cognition.
- Inferring real-person traits or encoding stereotypes/protected attributes
  without explicit ethical review and purpose.
- Shipping a visual builder before schema, interpreter, execution-safety,
  trace, and capability foundations exist.
- Claiming scalability, high-scale readiness, or operational readiness without
  benchmark evidence from the current runtime.
- Presenting external framework adapter contracts as implemented Mesa, NetLogo,
  or MASON runtimes.

## Runtime Integration Priorities

1. Opinion Dynamics Social Learning Runtime V1.
   - Add bounded knowledge, memory, trust, attention, source exposure, and social
     learning dynamics to the existing Opinion Dynamics template.
   - Keep runtime state numeric/symbolic, bounded, validated, and deterministic.
   - Do not claim human prediction, persuasion optimization, or psychological
     realism.

2. Snapshot + Render Buffer Optimization.
   - Current UI consumes full engine snapshots and rebuilds render models
     frequently. Optimize the boundary without letting renderer state mutate the
     engine.
   - Preserve snapshot export semantics and deterministic replay boundaries.

3. Resource/Feedback Runtime Slice.
   - Pick one template and make resource or feedback behavior real at runtime,
     with template capability flags updated only when runtime usage exists.
   - Predator-Prey is a plausible candidate, but only after a narrow design
     prompt defines the exact resource or feedback semantics.

4. Observability Runtime Slice.
   - Execute a limited measurement process for one template.
   - Preserve the difference between simulated state, runtime metrics, synthetic
     observations, empirical observations, and validation evidence.

5. Robustness/Stress Runtime Slice.
   - Execute bounded stress plans against a template after observability and
     resource/feedback runtime examples exist.
   - Do not call results robustness validation or operational safety.

6. Strategy/Control Runtime Slice.
   - Execute bounded policies only after causal assumptions, observability,
     robustness semantics, and template-defined interventions are ready.
   - Do not claim policy optimality, treatment effects, safety certification, or
     real-world recommendations.

## Social/Cognitive Modeling Plan

Prompt 31C should add Knowledge, Memory + Social Learning Semantics V1 before
visual builder work because ORTUS needs a principled boundary between legitimate
bounded social-learning models and pseudo-cognitive agent theater.

Allowed V1 semantic concepts:

- Bounded belief or opinion variables.
- Bounded knowledge items or topic states.
- Bounded memory slots with age, decay, source, salience, confidence, and topic.
- Bounded trust or credibility weights.
- Aggregate exposure signals for strangers, crowds, media-like pressure, or
  ambient social context.
- Template-defined update rules that consume these bounded representations.
- Explicit limitations, provenance labels, and ethical metadata.

Disallowed V1 concepts:

- Full human cognition.
- LLM-per-agent runtime.
- Natural-language reasoning per tick.
- Free-text biographies as active runtime state.
- Unbounded memory, embeddings, external documents, or model weights as agent
  state.
- Real-person reconstruction or trait inference.
- Protected-attribute stereotype modeling without explicit ethical review,
  purpose, and modeling need.
- Human prediction, manipulation guidance, psychological diagnosis, or policy
  recommendation claims.

Background initialization is compressed prior seeding. It can initialize bounded
beliefs, memories, or trust weights, but it is not life-history simulation,
pretraining, or a substitute for empirical validation.

Crowd and stranger exposure can be represented as aggregate exposure signals or
future structural field-style metadata. That must not imply `SpatialFieldModel`
runtime support unless the selected template actually uses the spatial-field
runtime.

The later runtime slice should be Opinion Dynamics Social Learning Runtime V1.
That slice should demonstrate ORTUS can connect social/cognitive semantics to a
small, audited, deterministic runtime without overclaiming human realism.

## Engine And Algorithm Priorities

Immediate follow-ups:

- Bound or evict long-lived template caches, especially Forest Fire dimension
  and neighbor-index caches, before large parameter sweeps or custom world sizes.
- Keep `Continuous2DSpace.queryNeighbors` parity tests whenever changing spatial
  index behavior.
- Consider a reusable grid occupancy/projection service so generic
  `Grid2DSpace` queries do not rely on repeated full scans.
- Batch more high-frequency template updates where semantics permit, especially
  continuous movement and component patches.
- Measure scheduler compute, metrics, snapshot creation, render-model
  preparation, and canvas rendering separately where practical.
- Optimize snapshot/render boundaries before claiming high-scale runtime
  support.

Before custom runtime execution:

- Define deterministic runtime budgets.
- Define failure and rollback semantics.
- Keep command validation strict.
- Keep interpreter primitives finite and testable.
- Keep traces bounded.
- Keep all execution headless and independent from React, Zustand, DOM, Canvas,
  browser storage, backend APIs, and rendering.

Before backend/cloud work:

- Finish local worker-safe execution and cancellation.
- Store run summaries and metrics by default, not full per-run snapshots.
- Define project import/export, recovery, security, and accessibility semantics.
- Prove deterministic serialization boundaries locally.

## Product And UX Priorities

ORTUS should continue to make capability status visible. The product experience
must help users understand the difference between:

- Runnable template behavior.
- Valid structural artifacts.
- Reserved future capabilities.
- Runtime metrics.
- Synthetic observations.
- Empirical observations.
- Validation evidence.

The UI should never make service-only primitives look live. Visual builder
controls must be disabled, hidden, or explicitly marked unsupported until schema,
interpreter, execution safety, and template capability checks prove they can run.

## Recommended Next Prompt

The next prompt should remain:

Prompt 31: Model Schema + Interpreter Foundation V1.

It should explicitly preserve the corrected sequence:

1. Prompt 31.
2. Prompt 31B.
3. Prompt 31C: Knowledge, Memory + Social Learning Semantics V1.
4. Prompt 31D.
5. Prompt 32.

Do not skip Prompt 31B or Prompt 31D. Do not start visual builder work before
the schema, interpreter, execution-safety, and social/cognitive audit boundaries
are in place.
