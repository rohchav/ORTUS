# ORTUS Canonical Architecture

Status: CURRENT architectural source of truth after I1B

This document defines ORTUS architectural vocabulary, authority, ownership, and dependency direction. It describes current implementation where it exists and labels future contracts explicitly. It does not make a planned type, service, or model family real.

## Documentation Authority

Use this precedence when sources disagree:

1. Executable code and tests determine actual current behavior.
2. `CAPABILITIES.md` states current supported product and runtime capability.
3. `ARCHITECTURE.md` defines architectural intent, ownership, and boundaries.
4. `SCIENTIFIC_MODEL.md` defines scientific and epistemic contracts.
5. `ROADMAP.md` defines future sequencing and milestone status.
6. Milestone implementation and audit reports preserve historical evidence.
7. `CURRENT_CONTEXT.md`, `SESSION_LOG.md`, and prompt roadmaps provide development continuity only.

Every consequential statement should be read as one of:

- **CURRENT**: implemented and supported by current code/tests.
- **PLANNED**: accepted direction with no current implementation claim.
- **PROPOSED**: a candidate that still needs an explicit decision.
- **DEPRECATED/HISTORICAL**: preserved evidence or vocabulary that no longer directs new work.

Architecture prose cannot override behavior. A mismatch is a defect to expose, not a reason to relabel unsupported behavior as implemented.

## Four Planes

| Plane | Question | CURRENT | PLANNED |
| --- | --- | --- | --- |
| Model | What dynamics are declared and executable? | Hand-built `SimulationTemplate` definitions, template-owned systems, parameters, spaces, metrics, and validated run configuration | Declarative `ModelDefinition` compiled or mapped into a validated executable `RuntimePlan` |
| Run / Observation | What happened during execution, and what was sampled? | `SimulationRunConfig`, engine/session run identity, exact `SnapshotExport` continuation artifacts, detached `SimulationSnapshotView` read models, metrics, events, interventions, `RenderFramePacket`, and `UIProjection` | `InterventionSchedule` as a first-class run input and scientific `CanonicalObservation` records |
| Research / Representation | How is modeled evidence represented, analyzed, compared, and assessed? | Bounded experiments, run summaries, uncertainty result services, and non-persistent planning/UI foundations | `ResearchContext`, `SystemViewSpec`, `ScaleSpec`, `LensSpec`, `RegimeSpec`, `ViewDerivation`, `RepresentationArtifact`, `ViewMapping`, `EvidenceReport`, `CandidateAssessment`, `ExperimentSpec`, `Investigation`, and `ClaimRecord` |
| Experience | How does a person work with ORTUS? | Start, World, Workshop, Lab foundation, Atlas foundation, Explore Worlds, and Guides | Deeper evidence, representation, and research workflows only after their lower-plane contracts exist |

Experience metaphors never define scientific ontology:

```text
camera zoom != ScaleSpec
Follow mode != scientific scale transition
Atlas layout != representation topology
UI selection != model intervention
```

## Fundamental And Derived Objects

"Fundamental" means the object has its own identity and lifecycle in its plane. It does not mean the object is implemented today or ontologically fundamental in the real world.

| Object | Role | Status | Classification |
| --- | --- | --- | --- |
| `ModelDefinition` | Declarative model intent, structure, assumptions, and supported configuration | PLANNED; current `ModelSchemaDefinition` is structural and non-executable | Fundamental model contract |
| `RuntimePlan` | Validated, executable representation accepted by a runtime | PLANNED; no compiler or generic interpreter exists | Fundamental execution contract, constructed from supported model intent |
| `RunConfig` | Concrete template/model, parameters, initialization, seed, and supported variants | CURRENT as `SimulationRunConfig` and scenario-derived configuration | Fundamental run input |
| `SimulationRun` | One identified runtime lifecycle over one supported executable model/configuration | CURRENT as a concept distributed across engine/session/store state; no single canonical persisted `SimulationRun` artifact exists | Fundamental execution instance |
| `SimulationSnapshot` | Conceptual family for execution-derived state captured at a modeled time | CURRENT umbrella term only; current read and continuation products are distinct | Execution-derived state family |
| `SimulationSnapshotView` | Detached broad read model containing entities, components, spaces, globals, and metric history for rendering/inspection | CURRENT; not exact continuation state and not runtime-deep-frozen | Execution-derived read projection |
| `SnapshotExport` | Validated exact continuation artifact containing configuration, world, clock, RNG, queued events, metrics, and world-held intervention history | CURRENT through explicit snapshot export/restore | Execution-derived continuation artifact |
| `RenderFramePacket` | Bounded, ephemeral renderer data | CURRENT only for the audited `flocking-v1` runtime projection | Presentation-derived |
| `UIProjection` | Coarse current state for React and semantic UI | CURRENT only for the audited `flocking-v1` runtime projection | Presentation-derived |
| `CanonicalObservation` | Provenance-bearing scientific sample with explicit selection, loss, timing, and uncertainty semantics | PLANNED; deliberately absent | Evidence derived from execution |
| `SystemViewSpec` | Scientific representation with explicit entity/relation semantics and relevant scale/lens/regime scope | PLANNED | Fundamental research representation specification |
| `RepresentationArtifact` | Concrete result produced from particular observations by a stated derivation | PLANNED | Research-derived result |
| `ViewDerivation` | Method, parameters, provenance, and limitations that produce a representation artifact | PLANNED | Research method/provenance |
| `EvidenceReport` | Evidence for and against a stated candidate or claim | PLANNED | Scientific evaluation |
| `CandidateAssessment` | Independent disposition such as supported-within-scope, rejected-within-scope, inconclusive, or non-identifiable | PLANNED | Scientific evaluation |
| `ResearchContext` | Question, scope, assumptions, inputs, and comparison frame | PLANNED | Fundamental workflow context |
| `ExperimentSpec` | Reproducible research design over supported runs and observations | PLANNED; current experiment definitions are narrower local runtime tooling | Fundamental workflow specification |
| `Investigation` | Provenance-bearing lifecycle tying questions, experiments, evidence, alternatives, and assessments together | PLANNED | Fundamental workflow record |
| `ClaimRecord` | Explicit interpretation with scope, provenance, evidence links, alternatives, and status | PLANNED | Research interpretation record, never model state |

Hard type boundary:

```text
ModelDefinition != RuntimePlan
SimulationSnapshot != RenderFramePacket != UIProjection != CanonicalObservation
SimulationSnapshotView != SnapshotExport
representation != question != derivation != evidence != assessment
```

`SimulationSnapshotView` is not exact continuation state: it deliberately omits RNG and queued-event state and cannot be passed to snapshot restore. Only validated `SnapshotExport` data is continuation-complete. Both are detached from engine mutation; neither is a scientific observation. `ModelSchemaDefinition` is not renamed into `ModelDefinition` by documentation. It remains a non-runnable structural artifact. `SystemViewSpec` is not compiler IR. A `RepresentationArtifact` cannot carry its own scientific verdict.

## Authority Map

| Concern | Authority | Consumers and limits |
| --- | --- | --- |
| Modeled entities, state, spaces, clock, events, and globals | `SimulationEngine` and template runtime | UI, renderer, and research code read snapshots/projections only |
| Seed interpretation and RNG streams | Simulation runtime `RandomService` | No UI, renderer, or research mutation; no `Math.random` in authoritative simulation code |
| Model-step semantics, fixed modeled time, system order, and command application | `SimulationEngine` and kernel scheduler | Callers may request steps but cannot redefine a step, phase order, RNG use, or mutation semantics |
| Production Flocking wall-clock cadence and runtime lifecycle | Dedicated Worker `RuntimeSession` and runtime scheduler | React requests bounded lifecycle operations through `SimulationRuntimePort`; it does not own the engine, RNG, scheduler, or tick accumulator |
| Legacy production template wall-clock cadence | Mounted React `AppShell` animation-frame accumulator plus Zustand-held run controls | This explicit coupling remains for the six templates not migrated in I1; it does not imply Worker support |
| Model mutation | Validated commands and template-defined interventions | Canvas and components may report targets; they do not mutate engine internals |
| Snapshot read view | Engine snapshot projection | `SimulationSnapshotView` is detached broad state for consumers, not exact continuation or evidence |
| Snapshot export/restore | Engine serialization and validation | `SnapshotExport` is exact continuation state, not a visual frame or empirical evidence |
| Render data | `RenderFramePacket` for production Flocking; read-only snapshot projections for legacy templates | Renderers may drop/coalesce only bounded ephemeral publications, never model steps or accepted commands |
| Camera, hover, visual selection, DPR, effects, and view mode | World/experience state | Presentation only; no model or scientific-scale authority |
| UI panels, drafts, filters, and task navigation | UI state | May request validated actions; cannot silently become engine state |
| Scientific observation | Future observation layer | Must define sampling, omission, noise, loss, timing, identity, and provenance; not implemented |
| Scientific representation | Future research/representation layer | Derives from observations; cannot rewrite the run being studied |
| Scientific assessment | Future research/evidence layer | Assesses candidates independently; cannot certify its own generator |

No lower-authority consumer may silently acquire higher-layer authority. Renderers do not mutate modeled state. Research adapters do not alter RNG or engine state. Discovery methods do not rewrite the model they study. Presentation data does not masquerade as evidence. Production React no longer owns Flocking cadence, but it still owns cadence for the six legacy template paths. That remaining coupling is explicit and must not be mistaken for generic Worker migration.

## Current Runtime Flows

Production Flocking currently uses:

```text
validated Flocking RunConfig
  -> SimulationRuntimePort
  -> dedicated WorkerRuntimeDriver
  -> Worker RuntimeSession + authoritative SimulationEngine/RNG/scheduler
  -> RenderFramePacket -> read-only scene adapter -> batched Canvas
  -> bounded UIProjection/selected detail -> React semantic UI
```

The migrated visual path does not continuously construct or publish `SimulationSnapshotView`. Full validated scenario or snapshot artifacts cross the runtime boundary only for explicit semantic operations such as import, export, restore, or comparison capture. Comparison capture projects the validated export into a detached read view with a pure data helper; it does not reconstruct a main-thread engine. Visual and UI publications may coalesce obsolete values; accepted commands and ordered model steps may not. Terminal Worker failure is visible and does not switch to `LocalRuntimeDriver` or fabricate continued execution. Recoverable validation rejection remains identified and bounded without relabeling the healthy runtime as failed.

Replacement/reset/import configuration becomes active only after the runtime port advances generation. A rejected concurrent operation cannot replace the accepted request, config, readiness promise, or provenance. Generic Reset preserves accepted executable variant fields but clears scenario/prepared metadata because the generic constructor did not execute that prepared handoff.

The other six production templates retain the legacy path:

```text
validated template + RunConfig + seeded RNG
  -> SimulationEngine on the main thread
  -> React AppShell animation-frame accumulator requests fixed model ticks
  -> detached SimulationSnapshotView publication through Zustand
  -> React controls/semantic state + batched Canvas rendering
```

`LocalRuntimeDriver` remains a reference/test implementation. The production migration supports only template `flocking-boids` with projection kind `flocking-v1`; it does not establish cross-template Worker support or a scientific observation channel.

## Computational Substrate Is Not Scientific Ontology

The current engine is entity/component/system shaped. Entities have stable identity, components hold serializable data, systems execute in deterministic phases, and spaces provide continuous, grid, or network relations. This is a useful computational substrate, not a universal claim that every scientific system fundamentally consists of agents.

Future ORTUS may support agent systems, grids/cellular systems, networks, continuous fields, reaction networks, continuous dynamical systems, event-driven systems, and hybrids. Those model families are PLANNED direction only. Each must earn executable support through a dedicated runtime contract, implementation, tests, and audit.

## System Representation Direction

The hierarchy-centric `MultiScaleModel` and `ScaleViewState` services remain CURRENT structural services where used. They do not execute aggregation/disaggregation or make a template multi-scale. Their micro/meso/macro vocabulary is not the canonical universal topology for future work.

Future research representation is a SystemView graph:

- `ScaleSpec`: effective resolution or degrees of freedom; potentially multidimensional and partially ordered.
- `LensSpec`: a descriptive or analytical representation over observations.
- `RegimeSpec`: the support or validity domain of a dynamical characterization.
- `SystemViewSpec`: explicit entity/relation semantics plus relevant scale, lens, and regime scope.
- `ViewMapping`: an explicit relation between views, eventually recording restriction, lifting, information loss, uncertainty, and intervention realization.
- `RepresentationArtifact`: a concrete result derived from identified evidence by an identified method.

This is not a universal micro-to-meso-to-macro hierarchy and not a mandatory `Scale x Lens x Regime` Cartesian cube. Production Flocking's System camera mode and Alignment lens are presentation controls, not `SystemViewSpec`, `ScaleSpec`, or `LensSpec` implementations. No SystemView schema, runtime, mapping executor, or discovery algorithm is implemented by I1.

## Dependency Direction

Target dependency direction, introduced incrementally rather than through a wholesale folder move. In the diagram, `A -> B` means A may import B:

```text
simulation/model        -> neutral value/validation contracts only
simulation/kernel       -> neutral value/validation contracts only
simulation/runtime      -> simulation/model + simulation/kernel + public observation contracts
simulation/observation  -> neutral run/model identity contracts only
simulation/experiment   -> public model/runtime/observation contracts

research/representation -> observation + research contracts only
research/evidence       -> representation + provenance + evidence contracts
research/inference      -> representation/evidence contracts; proposes candidates
research/validation     -> representation/evidence contracts; evaluates independently

ui/world                -> public runtime ports + read models
ui/workshop             -> model-authoring services, not runtime internals
ui/lab                  -> research workflow/evidence services
ui/atlas                -> representation/evidence query services
```

`ModelDefinition` must not import or expose concrete ECS kernel internals. The model and kernel sides are siblings around neutral value contracts; the runtime translation/construction boundary is where supported model intent becomes a kernel-specific `RuntimePlan`. This prevents the current ECS substrate from becoming the scientific ontology by dependency accident. `SystemViewSpec` likewise uses research semantics rather than kernel entity/component types.

Allowed dependencies follow the explicit arrows or public ports. Forbidden directions include model definitions to mutable ECS internals, renderer to model mutation, UI to RNG mutation, research to mutable engine/runtime internals or the broad simulation barrel, representation to React components, kernel to UI/browser storage, and a candidate generator to its own validation authority.

## Current Boundary Risks

The canonical architecture records rather than disguises these risks:

- The target `simulation/model`, `simulation/observation`, and `research/*` namespaces do not exist yet. Structural scientific services currently live beside runtime code under `src/simulation`, which can invite false execution claims.
- The six non-Flocking production paths still publish broad snapshot views through Zustand, and their cadence remains computed in a mounted React animation-frame effect. I1 deliberately did not claim or simulate cross-template Worker support.
- Production Flocking uses an I1B-audited product integration controller around the public runtime port, while the underlying browser transport remains template-specific. Generation-based lifecycle acceptance, strict same-generation revision ordering, recoverable rejection, pure artifact projection, and accepted-config provenance are covered, but the boundary remains Flocking-specific.
- `src/simulation/runtime` includes browser Worker transport types. This is intentional for the audited runtime port but means the runtime package is not yet a platform-neutral package boundary.
- `SimulationRun` ownership is real but distributed across engine, runtime session, and UI/store lifecycle. A future explicit run record must not duplicate or compete with those authorities.
- Current local experiments and Atlas preview produce model-output summaries, not the planned observation/evidence architecture.

The A0B static gate enforces current truths only: simulation implementation cannot import or re-export React/Zustand/UI/state/app modules or use browser rendering/storage globals; authoritative simulation code cannot reference direct or bracketed `Math.random`; runtime dynamic imports, CommonJS `require`, `eval`, `Function`, and string-evaluated timers are forbidden; future research code may import only public observation/experiment contracts from simulation; product/UI code cannot import private runtime internals; and the intrinsic-JSX accessibility check rejects obvious missing keyboard contracts, inert click roles, and negative tab order. Existing focused simulation canvases retain an explicit `role="img"` smoke-gate exception; that exception is not keyboard-equivalence or accessibility evidence. The gate remains scoped AST analysis, not full dependency resolution, data-flow analysis, ESLint, browser verification, or accessibility conformance.

## Ownership And Invalidation

| Object | Creator/owner | Lifetime | Invalidated by |
| --- | --- | --- | --- |
| Template definition | Template registry | Application version | Registry/version change |
| RunConfig | Scenario/setup services | Until replaced or discarded | Explicit rebuild/replacement |
| Active run | Engine/runtime session | Initialization to disposal | Replacement, terminal failure, disposal |
| `SimulationSnapshotView` | Engine snapshot projector | Detached value for a particular tick; consumers must treat it as read-only, but it is not deep-frozen | Becomes stale when the run advances; never persisted implicitly |
| `SnapshotExport` | Engine serializer | Detached explicit export for exact restore | Import may fail on schema/template/compatibility checks; never produced by visual publication |
| RenderFramePacket/UIProjection | Runtime projector/driver | Latest identified publication | Newer revision, generation change, failure, disposal |
| Camera/selection/tool state | UI | Mounted workflow or documented local persistence | Navigation, explicit reset, target destruction, unmount |
| `ModelDefinition` | PLANNED model-authoring/import authority | Versioned declarative artifact; immutable once identified | Explicit validated import/export only; source/schema/capability change creates a new version |
| `RuntimePlan` | PLANNED trusted runtime translator/compiler | Immutable executable plan tied to model id/version, runtime version, and declared capabilities | Rebuilt when model, runtime, capability, or translation version changes; not user-authored runtime code and not persisted as scientific authority by default |
| `CanonicalObservation` | PLANNED observation authority | Immutable provenance-bearing research input | Explicit research persistence only; source run/sampling contract changes make downstream work stale |
| `SystemViewSpec` | PLANNED research/representation authority | Versioned declarative representation proposal, separate from artifacts and verdicts | Explicit research persistence only; ontology/scope change creates a new version |
| `ViewDerivation` | PLANNED research derivation authority | Identified method/configuration record | Method/configuration/source changes invalidate derived artifacts |
| `RepresentationArtifact` | PLANNED derivation service | Immutable result tied to observations and a derivation id/version | Source or derivation change makes it stale; it never contains its own verdict |
| `EvidenceReport` / `CandidateAssessment` | PLANNED independent evidence/validation authorities | Versioned evaluation records; generator and assessor authority remain separate | Evidence, candidate, scope, or evaluator-method changes require reassessment |
| `ExperimentSpec` | PLANNED research workflow authority; distinct from current bounded experiment config | Versioned reproducible design | Explicit research persistence only; input/model/observation changes create a new version |
| `Investigation` | PLANNED research workflow authority | Provenance-bearing lifecycle that references, rather than embeds mutable copies of, runs/observations/artifacts | Explicit persistence only; closed records are superseded, not silently rewritten |

Attachment is never activation. Structural validity is never runtime support. Successful execution is never scientific validation.
