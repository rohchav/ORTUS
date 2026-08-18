# ORTUS Canonical Architecture

Status: CURRENT architectural source of truth after A0

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
| Run / Observation | What happened during execution, and what was sampled? | `SimulationRunConfig`, engine/session run identity, snapshots, metrics, events, interventions, `RenderFramePacket`, and `UIProjection` | `InterventionSchedule` as a first-class run input and scientific `CanonicalObservation` records |
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
| `SimulationSnapshot` | Exact continuation/export state including world, clock, RNG, events, metrics, and intervention history | CURRENT through snapshot view/export contracts | Execution-derived state |
| `RenderFramePacket` | Bounded, ephemeral renderer data | CURRENT only for the audited `flocking-v1` runtime projection | Presentation-derived |
| `UIProjection` | Coarse current state for React and semantic UI | CURRENT only for the audited `flocking-v1` runtime projection | Presentation-derived |
| `CanonicalObservation` | Provenance-bearing scientific sample with explicit selection, loss, timing, and uncertainty semantics | PLANNED; deliberately absent | Evidence derived from execution |
| `SystemViewSpec` | Scientific representation with explicit entity/relation semantics and relevant scale/lens/regime scope | PLANNED | Fundamental research representation specification |
| `RepresentationArtifact` | Concrete result produced from particular observations by a stated derivation | PLANNED | Research-derived result |
| `ViewDerivation` | Method, parameters, provenance, and limitations that produce a representation artifact | PLANNED | Research method/provenance |
| `EvidenceReport` | Evidence for and against a stated candidate or claim | PLANNED | Scientific evaluation |
| `CandidateAssessment` | Independent disposition such as supported-within-scope, contradicted, unresolved, or non-identifiable | PLANNED | Scientific evaluation |
| `ResearchContext` | Question, scope, assumptions, inputs, and comparison frame | PLANNED | Fundamental workflow context |
| `ExperimentSpec` | Reproducible research design over supported runs and observations | PLANNED; current experiment definitions are narrower local runtime tooling | Fundamental workflow specification |
| `Investigation` | Provenance-bearing lifecycle tying questions, experiments, evidence, alternatives, and assessments together | PLANNED | Fundamental workflow record |
| `ClaimRecord` | Explicit interpretation with scope, provenance, evidence links, alternatives, and status | PLANNED | Research interpretation record, never model state |

Hard type boundary:

```text
ModelDefinition != RuntimePlan
SimulationSnapshot != RenderFramePacket != UIProjection != CanonicalObservation
representation != question != derivation != evidence != assessment
```

`ModelSchemaDefinition` is not renamed into `ModelDefinition` by documentation. It remains a non-runnable structural artifact. `SystemViewSpec` is not compiler IR. A `RepresentationArtifact` cannot carry its own scientific verdict.

## Authority Map

| Concern | Authority | Consumers and limits |
| --- | --- | --- |
| Modeled entities, state, spaces, clock, events, and globals | `SimulationEngine` and template runtime | UI, renderer, and research code read snapshots/projections only |
| Seed interpretation and RNG streams | Simulation runtime `RandomService` | No UI, renderer, or research mutation; no `Math.random` in authoritative simulation code |
| Tick scheduling and runtime lifecycle | Engine plus current runtime session/scheduler | React may request play/pause/step but is not the simulation clock |
| Model mutation | Validated commands and template-defined interventions | Canvas and components may report targets; they do not mutate engine internals |
| Snapshot/restore | Engine serialization and validation | Snapshots are continuation state, not visual frames or empirical evidence |
| Render data | Read-only snapshot or `RenderFramePacket` projection | Renderers may drop/coalesce only audited ephemeral publications, never model steps or accepted commands |
| Camera, hover, visual selection, DPR, effects, and view mode | World/experience state | Presentation only; no model or scientific-scale authority |
| UI panels, drafts, filters, and task navigation | UI state | May request validated actions; cannot silently become engine state |
| Scientific observation | Future observation layer | Must define sampling, omission, noise, loss, timing, identity, and provenance; not implemented |
| Scientific representation | Future research/representation layer | Derives from observations; cannot rewrite the run being studied |
| Scientific assessment | Future research/evidence layer | Assesses candidates independently; cannot certify its own generator |

No lower-authority consumer may silently acquire higher-layer authority. Renderers do not mutate modeled state. React does not schedule ticks authoritatively. Research adapters do not alter RNG or engine state. Discovery methods do not rewrite the model they study. Presentation data does not masquerade as evidence.

## Current Runtime Flows

Production World currently uses:

```text
validated template + RunConfig + seeded RNG
  -> SimulationEngine on the main thread
  -> fixed model ticks
  -> snapshot publication through Zustand
  -> React controls/semantic state + batched Canvas rendering
```

The isolated Flocking immersive prototype currently uses:

```text
validated flocking RunConfig
  -> SimulationRuntimePort
  -> LocalRuntimeDriver or dedicated WorkerRuntimeDriver
  -> shared RuntimeSession + authoritative SimulationEngine
  -> RenderFramePacket (ephemeral Canvas channel)
  -> UIProjection (coarse React/accessibility channel)
```

The second flow supports only the explicit `flocking-v1` projection and does not mean production World, other templates, or research observation use the Worker runtime.

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

This is not a universal micro-to-meso-to-macro hierarchy and not a mandatory `Scale x Lens x Regime` Cartesian cube. No SystemView schema, runtime, mapping executor, or discovery algorithm is implemented by A0.

## Dependency Direction

Target dependency direction, introduced incrementally rather than through a wholesale folder move:

```text
simulation/kernel          lowest-level deterministic execution contracts
simulation/model           declarative model contracts and validation
simulation/runtime         kernel + supported model/template construction
simulation/observation     immutable runtime outputs; no mutation authority
simulation/experiment      public model/runtime/observation contracts

research/representation   observation and research contracts only
research/evidence         representation + provenance + evidence contracts
research/inference        proposes candidates; never self-certifies
research/validation       evaluates candidates independently

ui/world                  public runtime ports and read models
ui/workshop               model-authoring services, not runtime internals
ui/lab                    research workflow/evidence services
ui/atlas                  representation/evidence query services
```

Allowed dependencies point downward or through explicit public ports. Forbidden directions include renderer to model mutation, UI to RNG mutation, research to mutable engine internals, representation to React components, kernel to UI/browser storage, and a candidate generator to its own validation authority.

## Current Boundary Risks

A0 records rather than disguises these risks:

- The target `simulation/model`, `simulation/observation`, and `research/*` namespaces do not exist yet. Structural scientific services currently live beside runtime code under `src/simulation`, which can invite false execution claims.
- Production World still publishes broad snapshots through Zustand and UI code knows concrete simulation contracts. I1 may narrow that boundary, but A0 does not migrate it.
- `src/simulation/runtime` includes browser Worker transport types. This is intentional for the audited runtime port but means the runtime package is not yet a platform-neutral package boundary.
- `SimulationRun` ownership is real but distributed across engine, runtime session, and UI/store lifecycle. A future explicit run record must not duplicate or compete with those authorities.
- Current local experiments and Atlas preview produce model-output summaries, not the planned observation/evidence architecture.

The A0 static gate enforces current truths only: simulation implementation cannot import React/Zustand/UI/state/app modules or use browser rendering/storage globals; authoritative simulation code cannot call `Math.random`; unsafe dynamic execution is forbidden; and future research code cannot import mutable engine authorities. A0B must attack gaps and false confidence in these checks.

## Ownership And Invalidation

| Object | Creator/owner | Lifetime | Invalidated by |
| --- | --- | --- | --- |
| Template definition | Template registry | Application version | Registry/version change |
| RunConfig | Scenario/setup services | Until replaced or discarded | Explicit rebuild/replacement |
| Active run | Engine/runtime session | Initialization to disposal | Replacement, terminal failure, disposal |
| Snapshot | Engine | Immutable exported value | Never mutated; compatibility may fail on import |
| RenderFramePacket/UIProjection | Runtime projector/driver | Latest identified publication | Newer revision, generation change, failure, disposal |
| Camera/selection/tool state | UI | Mounted workflow or documented local persistence | Navigation, explicit reset, target destruction, unmount |
| CanonicalObservation | Future observation authority | Immutable research input | Staleness/provenance rules, not presentation replacement |
| Representation/evidence/assessment | Future research authority | Investigation lifecycle | Source change, method change, explicit supersession |

Attachment is never activation. Structural validity is never runtime support. Successful execution is never scientific validation.
