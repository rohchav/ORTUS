# ORTUS Current Capabilities

Status: CURRENT capability source of truth after S1

This document answers what ORTUS actually supports now. Code and tests remain authoritative for behavior. `src/simulation/registry` is the machine-readable authority for systems primitives, artifact families, and per-template capability summaries. This document summarizes that evidence for contributors and product language.

## Claim Levels

These levels are not interchangeable:

```text
module or structural artifact exists
  != service can validate/query/serialize it
  != a template executes it at runtime
  != a run completed successfully
  != behavior is robust across conditions
  != output is empirically validated
  != a causal or policy claim is warranted
```

Use "runtime support" only when a template actually uses the behavior and focused tests cover it. Global service availability does not grant template support.

## Production Templates

All seven registered production templates support current scenario construction, fresh-run initialization, template-owned behavior/configuration fields, template-defined interventions, metric history, bounded local experiments, run comparison, snapshot export/restore, and deterministic seeded execution. These shared facilities do not imply support for every systems primitive.

| Template id | Executed model slice | Space | Narrow special support | Explicit limit |
| --- | --- | --- | --- | --- |
| `epidemic-spread` | Mobile agents with local infection/recovery rules | Continuous 2D | Template-owned outbreak presets and interventions | Exploratory contagion model, not public-health prediction |
| `opinion-dynamics` | Bounded numeric opinion interaction | Continuous 2D | Template-owned `socialLearning` mode with bounded numeric/symbolic state | Not human cognition, measured belief, truth scoring, profiling, or generic social-learning runtime |
| `predator-prey` | Spatial interacting populations with energy/reproduction/death rules | Continuous 2D | Template-owned ecological interactions and interventions | Not an empirically calibrated ecology |
| `schelling-segregation` | Grid relocation from local similarity rules | Grid 2D | Template-owned initialization and relocation behavior | Model output is not evidence about protected classes or real neighborhoods |
| `flocking-boids` | Mobile local-interaction agents | Continuous 2D | Classic/group-aware modes; only template with audited production `flocking-v1` Worker execution and bounded frame/UI projection | Production adoption remains Flocking-only; tested scale/platform evidence is bounded and not scientific validation |
| `forest-fire` | Cellular local spread, burnout, and optional stylized regrowth | Grid 2D | Deterministic presets including the bounded firebreak corridor | Not wildfire prediction, GIS, weather, field runtime, or boundary-model runtime |
| `neural-excitation-network` | Bounded stylized excitation over a template-owned directed graph | Hybrid continuous layout + runtime network | Only template with registry-recognized runtime network topology; optional bounded decision readout | Not a biological brain, cognition, diagnosis, learning/plasticity, or generic graph runtime |

The registry deliberately keeps the global `socialLearningRuntime` primitive reserved. Opinion's narrow template-owned mode does not implement a generic social/cognitive runtime. Neural's runtime network does not execute Builder graphs, model schemas, or generic network artifacts.

## Runtime And Presentation

**CURRENT production Flocking path**

- Uses `SimulationRuntimePort` and `WorkerRuntimeDriver` only for template `flocking-boids` and projection kind `flocking-v1`.
- The Worker runtime owns the engine, seeded RNG, scheduler, modeled state, and wall-clock tick accumulator. React/Zustand holds product and bounded presentation state, not a duplicate Flocking engine or entity-position array.
- Canvas consumes transferable typed-array `RenderFramePacket` values through a read-only scene adapter. React consumes bounded `UIProjection` values and one selected-detail projection.
- The visual path constructs no continuous full snapshot. Validated scenario/snapshot artifacts cross the boundary only for explicit import, export, restore, or comparison capture.
- Terminal Worker failure is visible, stops execution, and has no hidden Local fallback.
- Recoverable validation rejection is identified separately, leaves the accepted run ready, and does not advance accepted configuration or provenance.
- Generic Reset preserves accepted executable variant fields while removing scenario/prepared provenance that the generic constructor did not earn.
- Reset of an accepted S1 remix preserves that derivative's exact executable configuration and Starter lineage while discarding run progress.

**CURRENT legacy production path and runtime references**

- The other six production templates retain the deterministic main-thread engine, mounted React animation-frame accumulator, Zustand run controls, detached broad `SimulationSnapshotView`, and batched Canvas rendering.
- `LocalRuntimeDriver` remains a reference/test implementation; it is not a production recovery path.
- Visual channels may keep one in-flight and one newest pending publication. Model steps and accepted commands are not coalesced.
- Worker ingress is bounded to 128 unconsumed messages; lifecycle and terminal failure are explicit.
- The existence of a generic port does not grant Worker support to another template.

Default entity counts and local performance reports are not engine limits, high-scale certification, or hardware-independent performance guarantees.

## Run Artifacts And Persistence

| Capability | CURRENT behavior | Not implied |
| --- | --- | --- |
| Scenario import/export | Validated initial-condition and supported-variant recipe; apply/preview creates a fresh tick-0 engine | Snapshot, outcome, mid-run intervention replay, or custom model execution |
| Snapshot read view | `SimulationSnapshotView` is a detached broad model-state projection for rendering and inspection; it omits RNG and queued-event state | Exact continuation, persistence, or scientific observation |
| Snapshot import/export | Only `SnapshotExport` is accepted as exact continuation state, including configuration, world, clock, RNG streams, queued events, metric history, and world-held intervention history | Empirical observation or cross-version migration guarantee |
| Experiment Runner | Bounded, chunked/cancellable local sweeps over supported templates; stores outcomes/metrics | Server jobs, Atlas probe execution, calibration, causal proof, or robustness validation |
| Run comparison | At most 50 browser-local summaries, each with bounded metrics/history/intervention summaries rather than full snapshots | Persistent Lab evidence, Atlas discoveries, or external validation |
| Scenario library | At most 50 validated browser-local authored scenarios | Accounts, cloud persistence, model definitions, or run history |
| Panel/avatar preferences | Narrow browser-local presentation preferences | Research or learner profiles |
| Atlas preview | In-memory, deterministic, exact-coordinate Flocking preview with one/two axes, bounded seeds/points/ticks/work, sequential fresh engines, and cancellation | Saved landscape, interpolation, regime detection, general probe execution, or evidence certification |
| Starter remix | Unsaved derivative scenario built from one strict Starter/recipe identity, edited through existing template configuration definitions, and launched through the established runtime path | Mutation of canonical Starter content, durable model storage, generic model construction, schema/graph execution, or a new runtime |

Lab and Atlas foundations do not persist research records. Guided investigations do not persist progress, score learning, or infer comprehension. Workshop drafts are local UI state unless explicitly exported or saved through an existing bounded scenario facility.

## Starter Remix Boundary

All eleven current runnable Starter World definitions classify as cleanly remixable through their existing executable contracts. The four flagship collection worlds still require one of their eight strict recipe identities; this does not create a second scenario or parameter registry.

S1 derives an unsaved scenario from the immutable source Starter. Workshop may edit the seed, template-defined numeric parameters, and supported initialization, behavior, composition, or environment options exposed by the authoritative template contract. Template identity, entity/state/process/space structure, rules, metrics, graph topology, schemas, and code remain fixed. Invalid draft values remain local and cannot replace the accepted World run.

`Run Remix` applies the derivative through the existing scenario validation and launch path. `flocking-boids` remains the sole Worker-capable runtime template, including Starter recipes backed by that template; every other template stays on its established main-thread path. Source Starter, unsaved derivative, and resulting run remain distinct provenance identities.

Remix state is page-session only. Strict URLs carry source and draft IDs rather than configuration payloads. A current World may transfer its matching accepted configuration through a bounded one-use in-memory handoff; reload expires an unsaved World derivative instead of substituting its source or a generic run. This is not model persistence.

## Structural And Service-Only Capability

The following have validated headless services or metadata, but are not generic executable model behavior:

- uncertainty configuration and deterministic ensemble generation;
- assumptions, limits, ethics, and validation-status metadata;
- network definitions/query/metrics/serialization, except Neural's separate template-owned runtime topology;
- resources, stocks, and flows;
- feedback-loop, delay, and scheduled-event artifacts;
- hybrid composition reports;
- `MultiScaleModel` structure and `ScaleViewState` navigation metadata;
- boundaries/environment declarations;
- spatial fields/environmental layer declarations;
- observability/measurement declarations;
- causal-assumption/influence declarations;
- units/dimensions/quantity semantics;
- emergence-pattern descriptors;
- robustness/resilience/stress-test semantics;
- strategy/control/intervention semantics;
- `ModelSchemaDefinition` structural authoring, validation, serialization, summaries, and capability reports;
- knowledge/memory/social-learning structural semantics;
- visual-builder workspace validation and read-only graph inspection;
- schema-to-template structural fit reports;
- scenario planning from schema.

These services do not execute attached declarations, generate a runtime, prove a mechanism, or validate a real-world claim. A valid artifact may remain non-runnable.

## Experience Surfaces

| Surface | CURRENT | Not implemented there |
| --- | --- | --- |
| Start `/` | Task-centered entry and featured paths | Progression engine or account state |
| Explore Worlds `/worlds` | Eleven validated runnable content definitions over existing templates | Eleven distinct runtime families |
| World `/world` | Setup, playback, observation, template perturbation, compare, explain, bounded experiments, scenario/snapshot exchange, and a Remix route for an identified Starter-backed run; Flocking uses the production Worker-backed immersive shell while other templates retain the legacy path | Cross-template Worker support, scientific observation records, Lab persistence, or model authoring inside World |
| Workshop `/builder` | Default Guided/Advanced structural authoring remains non-executable; Starter entry adds a bounded Remix workspace that inspects fixed structure, edits only supported executable configuration, validates a derivative scenario, and explicitly launches it | General model composition, executable schemas/graphs, arbitrary entities/processes/relations/formulas/code, or silent active-World mutation |
| Lab `/lab` | Non-persistent information architecture and evidence vocabulary | Saved investigations, evidence records, notebooks, or validation |
| Atlas `/atlas` | Non-persistent evidence/landscape/probe vocabulary plus one bounded ephemeral Flocking preview | Saved maps, general sampling, discovery, regime inference, or real-world certification |
| Guides | One optional `Reading a Flock` workflow over existing recipes/tasks | Auto-run, hard gates, learner profile, scoring, or educational-outcome evidence |

## Explicitly Unsupported Or Future

- Generic `ModelDefinition -> RuntimePlan` compilation or interpretation.
- Durable remix drafts, reusable composition blocks, arbitrary structural editing, or question-to-model generation.
- Executable model schemas, hybrid compositions, visual-builder graphs, or rule descriptions.
- Arbitrary formulas, scripts, dynamic code, `eval`, or user-provided runtime modules.
- `CanonicalObservation`, persistent `Investigation`, `EvidenceReport`, `CandidateAssessment`, `ClaimRecord`, or research provenance graph.
- `SystemViewSpec`, `ScaleSpec`, `LensSpec`, `RegimeSpec`, `ViewMapping`, representation runtime, or automatic discovery.
- True multi-scale execution, runtime aggregation/disaggregation, cross-scale coupling, or scale-aware renderer behavior.
- Continuous-field/reaction-diffusion, agent-field, adaptive-network, reaction-network, generic event-driven, or multi-rate model families.
- Runtime observability collection, causal inference/discovery, do-calculus, dimensional solving, emergence detection, stress-test execution, control optimization, calibration, validation, sensitivity inference, or data assimilation.
- Persistent Lab/Atlas research storage, cloud/backend/accounts, external framework execution, Python research adapters, Arrow/Parquet export, Wasm, WebGPU, shared memory, or `OffscreenCanvas`.
- Worker-backed production execution for templates other than Flocking.
- LLM-per-agent execution, full cognition, real-person profiling, protected-class inference, persuasion/microtargeting, operational targeting, or hidden recommendation/control objectives.

## Capability Change Rule

A capability moves from planned/service-only to runtime-supported only when all are true:

1. A dedicated prompt defines a bounded behavior and owner.
2. Validation and failure behavior are explicit.
3. A template/runtime actually uses the behavior.
4. Registry status and template capability entries agree with implementation.
5. Determinism, mutation authority, serialization, and focused behavior tests pass.
6. An audit prompt attacks overclaiming and boundary leakage.
7. Product copy states remaining scientific and platform limits.

Runnable does not mean validated. Validated software input does not mean scientifically validated output.
