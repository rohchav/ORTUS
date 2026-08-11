# Immersive World Direction Audit

Date: 2026-08-11
Prompt: I0B
Status: complete; I1 Immersive World Shell is next but unstarted
Decision: **Revise hybrid**
Readiness: **Conditionally ready for I1**

## Scope And Starting State

I0B independently audited the isolated I0 Flocking prototypes at `/world/immersive-prototype`. It did not migrate them into production World, add another concept, alter simulation behavior, add persistence, or start I1.

The audit began from clean aligned `main` at `5719c9d feat: prototype immersive world directions`. `HEAD` and `origin/main` matched after fetch.

The untouched I0 baseline reproduced:

- typecheck passed;
- unit tests passed `79 files / 655 tests`;
- production build passed with `23` pages;
- focused I0 Playwright passed `8/8`;
- complete Playwright/Axe passed `178/178` with no failures, retries, or skips;
- simulation and bounded Atlas smoke passed;
- no prototype storage key or production World migration was present.

## Independent Performance Reproduction

An untouched eight-case browser run used fresh Chromium contexts, the same approximately eight-second window, and `1280x720`:

| Target | 100 boids ticks/s / FPS | 500 boids ticks/s / FPS |
| --- | ---: | ---: |
| Production World | 23.79 / 59.84 | 23.67 / 35.13 |
| Living Diorama | 23.75 / 59.94 | 23.70 / 41.35 |
| God-Hand | 23.86 / 59.52 | 23.73 / 46.09 |
| Field Scientist | 23.84 / 59.85 | 23.70 / 47.88 |

This did not reproduce I0's reported `6.23..9.20 FPS` at 500. A later equivalent final run measured `4.88..7.64 FPS`. The approximately order-of-magnitude spread occurred without a production renderer change. Development-server compilation, thermal state, CPU contention, garbage collection, instrumentation, and run order materially affect this workload. Raw cross-run FPS is therefore not defensible evidence of an optimization win.

The audit uses matched-run comparison, phase timings, CPU profiles, draw timings, bounded state, and soak behavior. It does not invent a hardware-independent target.

## Findings And Fixes

I0B found no P0, one P1 architecture family, and fourteen bounded P2 families. All P1 and in-scope P2 findings were fixed. No known P0 or P1 remains.

The P1 was a Flocking-shaped adapter contract presented as the future renderer seam. The implementation now exposes a generic typed read-only base with explicit `templateId`; the current `WorldSceneAdapter` remains the Flocking specialization. This creates a credible adapter boundary. It does not implement another template adapter or cross-template rendering support.

The P2 findings covered:

1. runtime publication every roughly 120 ms and avoidable broad React commits;
2. canvas reconciliation when coarse parent state changed despite imperative entity drawing;
3. eager all-entity Alignment-vector preparation while the lens was hidden;
4. eager deterministic-signature construction on every runtime publication;
5. arbitrary trajectories for the first 32 boids rather than selected detail;
6. trail Map construction, array churn, and storage bounds disconnected from active quality;
7. fixed DPR, shadows, strokes, effects, and trail density under severe frame pressure;
8. deselection retaining a hidden Local/Follow camera target and misleading System zoom state;
9. camera interpolation crossing the whole toroidal world when a followed boid wrapped;
10. the `Hand` name and ring-like pointer marks implying unsupported manipulation or force;
11. initialization/step rings and radial neighborhood spokes resembling waves or causal forces;
12. anthropomorphic `Last sensed` wording and imprecise proximity semantics;
13. mobile readout overlap with the concept toolbar;
14. insufficient engine/snapshot/adapter phase evidence and a soak-discovered mismatch between drawn and retained trail bounds.

The final implementation:

- publishes coarse React-visible runtime state at approximately 250 ms;
- memoizes the canvas boundary and stabilizes parent callbacks;
- prepares Alignment vectors and runtime signatures lazily;
- computes selected proximity geometry only for one selected entity;
- retains only the selected trajectory, with the active quality tier enforcing its storage bound;
- adds deterministic automatic `high`, `balanced`, and `performance` quality with hysteresis;
- makes DPR, grid, shadows, strokes, trails, and effects independently degradable;
- records engine-step, snapshot, adapter, frame, and draw phase summaries;
- releases Local/Follow on deselection and handles toroidal follow without a world-width sweep;
- renames `Hand` to `Navigate` and uses shape-distinct Navigate, Inspect, and Measure marks;
- removes initialization/step pulses and replaces radial relationship spokes with small target-position proximity markers;
- labels current model-state neighbor count and proximity checks without agent-perception language;
- fixes the compact-viewport readout collision.

Simulation ticks, deterministic steps, agent count, rules, RNG, metrics, parameters, scenario, and snapshot authority are unchanged.

## Measured Cost Ranking

At 500 boids, headless phase timing measured:

| Phase | Mean | p95 |
| --- | ---: | ---: |
| Engine step | 58.515 ms | 82.316 ms |
| Snapshot publication | 2.690 ms | 4.604 ms |
| Scene adapter | 0.568 ms | 1.088 ms |

The top main-thread costs affecting rendered cadence were:

1. Flocking neighbor search: `queryPairsWithinRadius` used about `1,156.5 ms` self time in an eight-second CPU profile.
2. Validation/runtime deep cloning: two deep-clone paths used about `924.5 ms` and `856 ms` self time.
3. Allocation reclamation and tick-data preparation: GC used about `469 ms`, followed by Flocking tick-data and pair-query preparation.

Canvas was not the dominant bottleneck. At 500, selected relationship preparation, depth sorting, and trail work each measured about `0.11 ms` mean in isolated phase checks; matched final canvas draw medians were `0.9..1.3 ms`. WebGL would not remove engine neighbor search, snapshot cloning, or GC pressure.

The credible I1 performance path is to investigate scheduler/worker isolation and snapshot-publication cost under a dedicated prompt before changing rendering platform. This is not worker support, an engine optimization, or a WebGL authorization.

## Adaptive Visual Quality

Quality state is automatic, local, bounded, and non-persistent. It changes presentation only.

| Tier | DPR ceiling | Grid | Shadows | Strokes | Selected trail | Effects |
| --- | ---: | ---: | --- | --- | --- | ---: |
| High | 2 | 10 | all | all | 12 points, every tick | 24 |
| Balanced | 1.5 | 20 | selected | selected | 8 points, every 2 ticks | 12 |
| Performance | 1 | 20 | none | selected | 5 points, every 4 ticks | 0 |

One hundred boids starts at High and 500 starts at Balanced. A bounded rolling p95 frame interval and hysteresis can degrade or recover quality. Quality never changes simulation cadence or fidelity, and there is no graphics-settings UI or storage key.

## Visual Truth Audit

| Visual | Classification | Audit result |
| --- | --- | --- |
| Boid position, heading, speed | model-derived | Authoritative snapshot state. |
| Alignment value and vectors | model-derived | Template metric/current velocity; lazy and read-only. |
| Selected proximity check | model-derived query | Current snapshot positions, active radius, and wrap geometry; not a causal edge or recorded perception. |
| Selected trajectory | snapshot-derived presentation history | Bounded recent positions for the selected boid only; not engine memory. |
| Perspective, depth ordering, shadows, grid | presentation-only | Retained, bounded, and quality-degradable. |
| Camera, follow, pointer marks, selection corners | presentation-only | Do not enter model state or imply agent perspective. |
| Initialization and step rings | misleading | Removed; they resembled waves or forces. |
| Radial neighborhood spokes | misleading | Removed; they resembled causal influence. |
| `Hand` tool and common pointer ring | misleading/ambiguous | Replaced by Navigate and shape-distinct tool feedback. |

No overlay claims wind, collision, field, probability, intent, awareness, or causal influence.

## Concept Verdicts

| Criterion | Living Diorama | God-Hand prototype | Field Scientist |
| --- | --- | --- | --- |
| Presence | strongest | strong | moderate-strong |
| Agency | moderate | strongest, but over-signaled | moderate |
| Scientific clarity | strong after cleanup | weakest | strongest |
| Discoverability | moderate | strong | strong |
| Performance | viable; effects degrade | viable | least visual overhead |
| Accessibility | viable with DOM mirror | metaphor needed revision | strongest fit |
| Responsive viability | passed checked sizes | passed after toolbar fix | passed checked sizes |
| Cross-template scalability | surface useful, primitives vary | only template-owned actions | observation contract broadly useful |
| Implementation complexity | moderate | low-moderate | moderate |
| Migration risk | manageable | high if manipulation metaphor survives | manageable |

Living Diorama remains the best world-surface direction. Depth helps presence without changing coordinates, but it must remain restrained and exact state must stay available in text.

The God-Hand prototype does not survive as a production metaphor. Its useful contribution is immediate pointer/selection feedback and contextual instrument switching. `Navigate`, `Inspect`, and `Measure` are now behaviorally and visually distinct; none mutates an entity.

Field Scientist remains the strongest observation architecture. System, Local, and Follow are camera modes only. Follow is not boid perception, and the inspector reports model state rather than a mind or point of view.

## Camera, Selection, Lens, And Adapter Verdicts

- Camera: passes after truthful Free/System semantics, focus release, wrap-aware follow, bounded zoom/pan, predictable reset, and immediate reduced-motion transitions.
- Selection: presentation-only, keyboard and numeric alternatives remain available, missing entities fail closed, and expensive detail is localized to one selected boid.
- Lens: Alignment remains a read-only stylized Flocking model output. It does not change the run or represent measured animal behavior.
- Adapter: reads immutable authoritative snapshots, contains no evolution, caches only facts from its own snapshot, rejects the wrong template, and writes nothing. Its proximity query is a read-only current-state calculation, not an engine relationship or causal edge.

Adversarial coverage exercises restore, entity-count replacement, invalid/missing selection, rapid pause/play, lens/focus changes, concept switching, and runtime-signature stability.

## Memory And Lifecycle Soak

Each concept ran for at least 60 seconds at both 100 and 500 boids. Fresh contexts used forced-GC checkpoints where available; ordinary transient heap movement was not called a leak.

| Concept | 100 retained heap | 500 retained heap | 500 final selected trail |
| --- | ---: | ---: | ---: |
| Living Diorama | -6.53 MiB | +4.86 MiB | 5 points |
| God-Hand | -6.51 MiB | +4.50 MiB | 5 points |
| Field Scientist | -6.49 MiB | +4.88 MiB | 5 points |

The negative 100-boid deltas mean earlier allocations were collected, not negative memory use. The 500-boid checkpoints were non-monotonic and returned to about `4.5..4.9 MiB` retained growth after 60 seconds. Active listener count stayed flat at `586` in the instrumented page. Running used two active rAF callbacks, paused used one renderer callback, and route navigation cleaned up the prototype callbacks. Trail/effect counts stayed bounded, focus cleared on deselection/concept change, and no continuing unbounded growth was observed.

This is a six-case one-minute local soak, not proof against a multi-hour leak or behavior on every browser/GPU.

## Final Matched Browser Measurements

The final eight-case run used the same approximately eight-second conditions. Raw heap deltas are allocation-timing observations, not retained-memory conclusions.

| Target | Boids | Ticks/s | FPS | Median / p95 frame | Long frames | React commits | Quality |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Production | 100 | 23.61 | 54.37 | 16.7 / 33.3 ms | 4 | 196 | n/a |
| Living | 100 | 23.67 | 58.42 | 16.7 / 16.8 ms | 0 | 31 | High |
| God-Hand | 100 | 23.72 | 59.32 | 16.7 / 16.8 ms | 1 | 31 | High |
| Field | 100 | 23.76 | 59.43 | 16.7 / 16.8 ms | 0 | 31 | High |
| Production | 500 | 20.97 | 4.88 | 233.2 / 266.7 ms | 39 | 41 | n/a |
| Living | 500 | 21.88 | 5.19 | 216.5 / 283.4 ms | 40 | 25 | Performance |
| God-Hand | 500 | 22.11 | 5.36 | 200.0 / 283.4 ms | 42 | 28 | Performance |
| Field | 500 | 23.54 | 7.64 | 149.9 / 250.0 ms | 47 | 26 | Performance |

The final matched prototypes delivered about 6%, 10%, and 56% more frames than final production at 500, but Living and God-Hand had worse p95 frame time and the machine state differed radically from the untouched run. There is no defensible cross-run material frame-time improvement claim. The hardening result is lower bounded visual work, substantially fewer React commits, truthful degradation, and a credible next architecture, not acceptable universal 500-boid interactivity.

A five-second React profile at 500 observed running commit counts changing from `34/45/39/43/34` for unselected/selected/lens/follow/trails before hardening to `25/22/18/23/20` after hardening. The profiler itself reduced throughput, so these are comparative development observations only. React remains a coarse control/readout layer; Canvas remains the entity animation loop.

## Cross-Template Feasibility

No immersive support was added for another template.

| Template | Classification | Required work |
| --- | --- | --- |
| Epidemic | requires template adapter | Continuous entities, status styling, and template-specific inspection/lens semantics. |
| Predator-Prey | requires template adapter | Continuous two-population entities and template-specific observation semantics. |
| Opinion Dynamics | requires template adapter | Continuous entities and bounded opinion-state semantics; no invented social or causal edges. |
| Forest Fire | requires new rendering primitive | Grid/cell rendering and cell inspection. |
| Schelling | requires new rendering primitive | Grid/occupancy rendering and neighborhood inspection. |
| Neural | requires new rendering primitive | Template-owned network nodes/edges plus a Neural-specific adapter and readout semantics. |

These are feasibility classifications, not support claims. The generic read-only base is an interface boundary, not a renderer implementation.

## Final Decision And I1 Ownership

**Revise hybrid.** The 50/20/30 percentages are retired because they implied precision unsupported by the comparison evidence.

Exact I1 ownership is:

- **Living Diorama:** primary world surface, spatial presence, restrained bounded depth, visible boundary, whole-system camera, camera easing, and selected-only truthful trajectory.
- **Field Scientist:** observation information architecture, System/Local/Follow camera semantics, exact DOM inspection, selected proximity framing, model-output lenses, runtime-honesty language, and accessibility authority.
- **Direct interaction contribution formerly tested as God-Hand:** immediate pointer feedback, selection, and contextual instrument switching only. Retire the God-Hand/Hand metaphor; do not imply manipulation.

I0B is **Conditionally ready for I1**. No P0/P1 remains; runtime semantics and isolation are intact; state is bounded; React is not the entity renderer; and the 500-boid bottleneck has a credible dedicated investigation path. I1 must still be separately scoped and must not infer cross-template support.

Remaining limitations are participant immersion/comprehension, actual touch devices, screen-reader and assistive-technology use, actual browser zoom, forced colors, multi-hour soak, GPU/browser diversity, production-build profiling, and formal WCAG review. Model output remains evidence about the model, not empirical truth.

## Final Verification

- Focused I0/I0B Playwright: `13 passed (3.0m)` after the final implementation edit.
- Complete Playwright/Axe: `183 passed (25.5m)` with zero failures, retries, or skips.
- Typecheck: passed.
- Unit tests: `79 files / 657 tests passed (82.99s)`.
- Production build: passed; Next compiled in `8.9s` and generated `23` pages.
- Simulation smoke: Flocking 100 `113.87` ticks/s, Flocking 500 `15.87`, Forest Fire `23.35`, and Predator-Prey `72.26`.
- Bounded Atlas smoke: `2` runs / `10` work units / horizon `5` completed in `54.03 ms`; this is not a scalability or validation claim.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

## Scope Integrity

I0B changes no `src/simulation` source, template rule, scheduler, RNG contract, scenario, parameter, preset, metric, intervention, comparison storage, Experiment Runner, Starter World, Atlas, Lab, Workshop execution, dependency, route, public asset, backend, or persistence key. Production `/world` is not migrated. I1, I2-I5B, and C4 remain unstarted.
