# A0B Canonical Architecture Audit

Status: HISTORICAL A0B adversarial audit record. The current authorities are `ARCHITECTURE.md`, `CAPABILITIES.md`, `SCIENTIFIC_MODEL.md`, and `ROADMAP.md`; code and tests remain authoritative for behavior.

Date: 2026-08-18

Baseline: `722498c docs: consolidate canonical ORTUS architecture`

## Verdict

A0's direction was defensible, but several claims were cleaner than the code deserved. In particular, A0 blurred wall-clock cadence with engine step semantics and treated two different snapshot products as one continuation artifact. Those were material architecture defects, not editorial polish.

A0B found and fixed one P0, six P1, and three bounded P2 finding families. No template rule, parameter, RNG sequence, modeled step, runtime driver, renderer, route, or persistence behavior changed. No I1 work was implemented.

Within A0B scope, no known unmitigated P0/P1 remains. Production React cadence is still real architecture debt; A0B exposes and gates it rather than pretending a documentation prompt migrated it.

## Findings

| Severity | Finding | Disposition |
| --- | --- | --- |
| P0 | The static gate could be bypassed with re-exports, CommonJS loading, runtime `import()`, callable aliases of `eval`/`Function`, string timers, bracketed or escaped `Math.random`, and bracketed/destructured browser globals. | Fixed with AST checks and adversarial fixtures. No current production violation was found. |
| P1 | A0 said runtime owned scheduling without admitting that production `AppShell` computes elapsed-time catch-up and decides how many steps to request through Zustand. | Fixed in canonical/current docs. Engine authority is now limited precisely to step semantics, modeled time, system order, command application, mutation, and seeded RNG. External production cadence remains an I1-gated debt. |
| P1 | `SimulationSnapshotView` and `SnapshotExport` were conflated as an immutable exact snapshot. The view omits RNG and queued-event state and is not deep-frozen. | Fixed by defining `SimulationSnapshot` as an umbrella, the view as detached read state, and only validated `SnapshotExport` as exact continuation state. A runtime regression test checks the distinction. |
| P1 | The dependency diagram's arrows were ambiguous and could make future `ModelDefinition` depend on concrete ECS kernel types, leaking substrate into scientific ontology. | Fixed by defining arrow meaning and making model/kernel siblings around neutral contracts; runtime translation is the kernel-specific bridge. |
| P1 | README and AGENTS created competing authorities through subordinate “source of truth” labels and stale current-milestone sequencing. | Fixed. README names scoped records as records, AGENTS keeps durable rules, historical roadmaps remain visibly historical, and only `ROADMAP.md` owns current sequence. |
| P1 | Static authority checks did not cover export declarations, research imports through the broad simulation barrel/runtime, or private runtime projection modules imported by product code. | Fixed with bounded import/re-export checks and regression fixtures. The gate remains syntax-level, not transitive dependency analysis. |
| P1 | Product/SystemView language could imply an executable visual modeler or a scientific SystemView from the immersive prototype's presentation-only “System view” camera control. | Fixed. ORTUS is described as a simulation sandbox; Workshop remains structural/non-executable; the camera control is explicitly not `SystemViewSpec`. |
| P2 | Planned object lifecycles did not state enough about creator, identity, mutability, persistence, staleness, and invalidation. | Fixed for model, runtime, snapshot, observation, representation, evidence, experiment, and investigation objects without inventing storage schemas. |
| P2 | Planned scientific assessment language did not explicitly preserve supported, rejected, inconclusive, and non-identifiable outcomes. | Fixed as semantic contracts only. No assessment enum, evaluator, or scientific runtime was added. |
| P2 | The JSX smoke check accepted obviously inert roles and negative tab order on click surfaces. | Fixed for those high-signal cases. Existing focused simulation canvases retain an explicit `role="img"` exception, so semantic keyboard equivalence, browser behavior, screen-reader use, and WCAG conformance remain unverified. |

## Authority Audit

- `SimulationEngine` and template systems own modeled state and deterministic step semantics.
- Production `AppShell` currently owns wall-clock cadence. Zustand holds the active engine reference and invokes engine APIs. That coupling is current truth, not the target architecture.
- Interventions flow through template definitions and the engine-backed intervention path. Canvas reports selection/targets but does not mutate entities, components, spaces, RNG, or engine internals.
- The isolated runtime port owns cadence/lifecycle only for its explicit Local/Worker prototype path.
- No `src/research` implementation exists. The new gate reserves future research imports to public observation/experiment contracts and rejects broad simulation/runtime authority.
- No renderer-to-engine, research-to-engine, or presentation-to-RNG mutation path was found in current production source.

## Object And Evidence Audit

The canonical object inequalities now hold:

```text
ModelDefinition != RuntimePlan
SimulationSnapshot != RenderFramePacket != UIProjection != CanonicalObservation
SimulationSnapshotView != SnapshotExport
SystemViewSpec != RuntimePlan != RepresentationArtifact
RepresentationArtifact != EvidenceReport != CandidateAssessment
ResearchContext != representation != verdict
ExperimentSpec != Investigation
```

`SimulationSnapshotView`, `RenderFramePacket`, `UIProjection`, runtime metrics, comparison summaries, and Atlas preview results are model/run or presentation products. None is `CanonicalObservation` or empirical evidence. Visual latest-value coalescing does not define future scientific sampling.

## Capability Audit

- Seven hand-built production templates are registered and runnable through the current main-thread World path.
- Only `flocking-boids` has the audited `flocking-v1` Local/Worker frame/UI projection, and production World is not migrated.
- Only Neural Excitation has registry-recognized template-owned runtime network topology. This does not execute generic network artifacts or Builder graphs.
- Opinion's `socialLearning` behavior mode remains bounded, numeric/symbolic, template-owned, and non-generic. It is not human cognition, profiling, truth scoring, persuasion optimization, or semantic-artifact execution.
- Workshop authoring/graph/fit/planning features remain structural and non-executable.
- Lab remains non-persistent information architecture. Atlas remains non-persistent vocabulary plus one bounded in-memory Flocking preview.
- Global service artifacts remain structural/service-only unless a production template actually executes them.
- Runtime support, successful execution, robustness, empirical validation, and causal/policy authority remain separate claim levels.

## SystemView And Substrate Audit

The current ECS-shaped engine is a computational substrate, not the scientific ontology. Future model contracts must not expose concrete ECS internals merely because the current kernel uses entities, components, systems, and spaces.

Legacy `MultiScaleModel` and `ScaleViewState` services may retain micro/meso/macro vocabulary as structural artifacts. They are not runtime scale support and do not govern future representation. The canonical future direction is a graph of explicit `SystemViewSpec` objects and `ViewMapping` relations; Scale, Lens, and Regime are not a mandatory Cartesian cube. No SystemView schema/runtime/mapping executor exists.

## Scientific And Safety Audit

The canonical contract preserves:

- model result is not real-world fact;
- prediction is not explanation;
- dependency, network edge, feedback label, metric, or perturbation is not causal proof;
- candidate generation is not validation and cannot certify itself;
- latent variables and clusters are not automatically natural entities or emergent scales;
- software validation is not scientific validation;
- supported/rejected/inconclusive/non-identifiable dispositions remain scoped to stated model/evidence conditions;
- no LLM-per-agent runtime, arbitrary code/formula execution, real-person profiling, protected-class inference, psychological diagnosis, persuasion/microtargeting, or hidden operational targeting.

## Static Gate Scope

The gate now checks production TypeScript syntax for:

- static imports and re-exports across protected boundaries;
- CommonJS and runtime dynamic loading;
- direct, bracketed, destructured, and escaped global `Math` randomness paths in authoritative simulation source;
- direct and captured `eval`/`Function`, plus string-evaluated timers;
- selected browser/rendering/storage globals in simulation source;
- broad research-to-simulation authority imports;
- product imports of named private runtime modules;
- obvious intrinsic-JSX alt/title, inert-role, keyboard-handler, and tab-order failures, with a named legacy `canvas[role="img"]` exception.

It does not resolve transitive re-export graphs, follow arbitrary value aliases, prove data flow, understand runtime semantics, replace ESLint, or establish rendered accessibility. Test and performance-fixture directories remain outside the production architecture scan.

## Roadmap And Remaining Limits

A0 and A0B are complete. I1 is next and unstarted. I1 must address the production cadence/store/publication boundary through its own prompt; A0B does not pre-authorize a migration design. I2-I5B are not an automatic sequence, and C4 has no I5B dependency.

Remaining non-blocking evidence gaps include direct screen-reader/assistive-technology use, forced colors, actual browser zoom, broader browser/device performance, user comprehension, and full WCAG conformance. No browser or performance suite was required for A0B because rendered behavior and simulation/runtime semantics did not change.

## Verification

- Focused architecture checks passed, including `2 files / 17 tests` for the canonical and package-boundary contracts.
- `npm run lint` passed unused-symbol TypeScript checks and the architecture gate over `381` production TypeScript files.
- `npm run typecheck` passed.
- `npm test` passed `83 files / 717 tests`.
- `npm run build` compiled in `3.4s` and generated `23` pages.
- `git diff --check` passed at the final review gate.
- Performance and browser suites were not rerun because A0B changed documentation, static tooling, and tests only; it changed no simulation/runtime or rendered behavior.
