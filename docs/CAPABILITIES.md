# ORTUS Current Capabilities

Status: CURRENT capability source of truth after A0

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
| `flocking-boids` | Mobile local-interaction agents | Continuous 2D | Classic/group-aware modes; only template with audited `flocking-v1` Local/Worker frame/UI projection | Worker path is isolated prototype support, not production or cross-template support |
| `forest-fire` | Cellular local spread, burnout, and optional stylized regrowth | Grid 2D | Deterministic presets including the bounded firebreak corridor | Not wildfire prediction, GIS, weather, field runtime, or boundary-model runtime |
| `neural-excitation-network` | Bounded stylized excitation over a template-owned directed graph | Hybrid continuous layout + runtime network | Only template with registry-recognized runtime network topology; optional bounded decision readout | Not a biological brain, cognition, diagnosis, learning/plasticity, or generic graph runtime |

The registry deliberately keeps the global `socialLearningRuntime` primitive reserved. Opinion's narrow template-owned mode does not implement a generic social/cognitive runtime. Neural's runtime network does not execute Builder graphs, model schemas, or generic network artifacts.

## Runtime And Presentation

**CURRENT production World**

- Runs all seven hand-built templates through the deterministic main-thread engine.
- Uses fixed model ticks, seeded RNG streams, validated commands/interventions, broad snapshots, Zustand publication, and batched Canvas rendering.
- Keeps renderer and React downstream of engine state.

**CURRENT isolated runtime prototype**

- `SimulationRuntimePort`, `LocalRuntimeDriver`, and `WorkerRuntimeDriver` are implemented and audited.
- Support is restricted to projection kind `flocking-v1` and template `flocking-boids`.
- `RenderFramePacket` uses bounded typed arrays for Canvas; `UIProjection` carries coarse semantic/UI state.
- Visual channels may keep one in-flight and one newest pending publication. Model steps and accepted commands are not coalesced.
- Worker ingress is bounded to 128 unconsumed messages; lifecycle and terminal failure are explicit.
- Production `/world` is not migrated.

Default entity counts and local performance reports are not engine limits, high-scale certification, or hardware-independent performance guarantees.

## Run Artifacts And Persistence

| Capability | CURRENT behavior | Not implied |
| --- | --- | --- |
| Scenario import/export | Validated initial-condition and supported-variant recipe; apply/preview creates a fresh tick-0 engine | Snapshot, outcome, mid-run intervention replay, or custom model execution |
| Snapshot import/export | Validated exact run continuation including world, clock, RNG streams, events, metric history, and applied intervention history | Empirical observation or cross-version migration guarantee |
| Experiment Runner | Bounded, chunked/cancellable local sweeps over supported templates; stores outcomes/metrics | Server jobs, Atlas probe execution, calibration, causal proof, or robustness validation |
| Run comparison | At most 50 browser-local summaries, each with bounded metrics/history/intervention summaries rather than full snapshots | Persistent Lab evidence, Atlas discoveries, or external validation |
| Scenario library | At most 50 validated browser-local authored scenarios | Accounts, cloud persistence, model definitions, or run history |
| Panel/avatar preferences | Narrow browser-local presentation preferences | Research or learner profiles |
| Atlas preview | In-memory, deterministic, exact-coordinate Flocking preview with one/two axes, bounded seeds/points/ticks/work, sequential fresh engines, and cancellation | Saved landscape, interpolation, regime detection, general probe execution, or evidence certification |

Lab and Atlas foundations do not persist research records. Guided investigations do not persist progress, score learning, or infer comprehension. Workshop drafts are local UI state unless explicitly exported or saved through an existing bounded scenario facility.

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
| World `/world` | Setup, playback, observation, template perturbation, compare, explain, bounded experiments, scenario/snapshot exchange | Production Worker runtime, scientific observation records, Lab persistence, or model authoring |
| Workshop `/builder` | Guided structural schema draft, advanced schema forms, read-only workspace/graph inspection, validation repair assistance, structural fit and scenario planning | Compile, run, preview simulation, generate template/RunConfig, executable graph, arbitrary formula/code, or active World mutation |
| Lab `/lab` | Non-persistent information architecture and evidence vocabulary | Saved investigations, evidence records, notebooks, or validation |
| Atlas `/atlas` | Non-persistent evidence/landscape/probe vocabulary plus one bounded ephemeral Flocking preview | Saved maps, general sampling, discovery, regime inference, or real-world certification |
| Guides | One optional `Reading a Flock` workflow over existing recipes/tasks | Auto-run, hard gates, learner profile, scoring, or educational-outcome evidence |

## Explicitly Unsupported Or Future

- Generic `ModelDefinition -> RuntimePlan` compilation or interpretation.
- Executable model schemas, hybrid compositions, visual-builder graphs, or rule descriptions.
- Arbitrary formulas, scripts, dynamic code, `eval`, or user-provided runtime modules.
- `CanonicalObservation`, persistent `Investigation`, `EvidenceReport`, `CandidateAssessment`, `ClaimRecord`, or research provenance graph.
- `SystemViewSpec`, `ScaleSpec`, `LensSpec`, `RegimeSpec`, `ViewMapping`, representation runtime, or automatic discovery.
- True multi-scale execution, runtime aggregation/disaggregation, cross-scale coupling, or scale-aware renderer behavior.
- Continuous-field/reaction-diffusion, agent-field, adaptive-network, reaction-network, generic event-driven, or multi-rate model families.
- Runtime observability collection, causal inference/discovery, do-calculus, dimensional solving, emergence detection, stress-test execution, control optimization, calibration, validation, sensitivity inference, or data assimilation.
- Persistent Lab/Atlas research storage, cloud/backend/accounts, external framework execution, Python research adapters, Arrow/Parquet export, Wasm, WebGPU, shared memory, or `OffscreenCanvas`.
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
