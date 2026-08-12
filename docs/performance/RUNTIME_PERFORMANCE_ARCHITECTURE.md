# Runtime Performance Architecture

Date: 2026-08-12
Milestone: PERF1
Status: implemented; PERF1B audit is next

## Decision

PERF1 separates authoritative simulation execution from ephemeral rendering and coarse React state. The isolated Flocking prototype now runs a real ORTUS engine in a dedicated browser Worker and publishes bounded typed-array `RenderFramePacket` values plus lower-frequency `UIProjection` values. Production `/world` is unchanged.

This is a runtime architecture result, not a high-scale claim. The supported prototype remains one fixed Flocking scenario at 100 or 500 boids. No cross-template Worker support, production immersive shell, evidence persistence, `CanonicalObservation`, `OffscreenCanvas`, shared memory, WebGL, Wasm, or new simulation capability is implied.

## Representation Boundaries

```text
Authoritative Simulation State
        |
        +-- RenderFramePacket
        |     ephemeral renderer projection
        |
        +-- UIProjection
        |     coarse React/accessibility projection
        |
        +-- CanonicalObservation
              reserved future research/evidence boundary
```

`SimulationEngine` and its template-owned world remain authoritative. `RenderFramePacket` is neither a snapshot nor an observation/evidence schema. `UIProjection` is neither engine state nor a persistence format. `CanonicalObservation` remains deliberately unimplemented.

## Untouched Baseline

The baseline started clean and aligned at `fd54941`. Typecheck, 657 unit tests, a 23-page production build, focused prototype tests, all 183 UI/Axe tests, and the existing performance smoke passed before runtime edits.

The existing headless smoke measured:

| Case | Ticks/s | Average step | Snapshot | Render-model preparation |
| --- | ---: | ---: | ---: | ---: |
| Flocking 100 | 138.88 | 7.165 ms | 0.917 ms | 0.615 ms |
| Flocking 500 | 21.51 | 46.393 ms | 2.268 ms | 0.759 ms |
| Forest Fire 80x60 | 35.07 | 28.466 ms | 16.500 ms | 6.533 ms |
| Predator-Prey default | 103.06 | 9.683 ms | 1.480 ms | 0.527 ms |

Three controlled eight-second baseline browser repetitions used the same immersive scenario and seed. At 100, local execution held about `23.85` ticks/s and `57.60..59.06` FPS. At 500, it held `23.46..23.78` ticks/s but only `6.67..12.97` FPS, with median frames of `66.7..166.6 ms`, p95 frames of `116.8..233.3 ms`, and `49..85` render long frames. Baseline Worker-invalid runs that never advanced beyond tick zero were rejected rather than counted.

## Performance Vocabulary

The bounded development/test recorder recognizes:

```text
ortus.sim.step
ortus.sim.neighbors
ortus.sim.snapshot
ortus.runtime.publish
ortus.scene.project
ortus.render.draw
ortus.ui.publish
ortus.run.rebuild
```

Each enabled measure retains at most its configured sample bound and reports count, median, p95, maximum, and total duration. The disabled path avoids reading the clock. Measurements are non-persistent diagnostics and do not enter model state, metrics, snapshots, or scientific semantics.

## Runtime Port

`SimulationRuntimePort` owns run generation, run id, initialization/replacement/reset, play/pause/manual step, validated deterministic commands, selected detail, frame/UI publication, and disposal. It exposes no engine or mutable world object.

`LocalRuntimeDriver` and `WorkerRuntimeDriver` use the same `RuntimeSession`, template registry, validated `SimulationRunConfig`, engine construction path, scheduler contract, and frame/UI projectors. The local driver remains available for unit tests, scientific regression, differential tests, and headless profiling. There are not two model implementations.

The Worker imports only the static ORTUS runtime module. Requests and responses use strict Zod protocol envelopes. There is no `eval`, user-authored script, dynamic runtime URL, plugin execution, shell execution, implicit retry with a new seed, or silent local fallback.

## Scheduler

Both drivers use the established external model-clock policy: target about 24 ticks/s, elapsed-time accumulation, at most 250 ms added per cycle, and at most the engine's `maxStepsPerFrame` steps per cycle. Catch-up batches may publish one latest visual frame after several ordered model steps. They never omit required simulation steps.

Manual-step tests compare the same seed, scenario, command sequence, and step count. Local, in-process structured-clone/transfer Worker, real browser Worker reset/replay, and direct authoritative engine projections match exactly.

## Generation And Failure Safety

Every request and publication carries generation and run identity. Replacement increments generation before sending work. Both host and driver reject or drop stale generations. Request ids separate concurrent completions; frame publication ids and UI revisions make acknowledgements unambiguous.

Malformed messages terminate the driver. Initialization errors publish no fabricated frame. Worker runtime exceptions reject the responsible request and preserve the last complete frame. Worker error signals remove listeners and terminate without local fallback. Runtime failures remain visible in semantic DOM and do not get cleared by late UI publications.

Worker creation occurs in the React mount lifecycle, not during render. This avoids development Strict Mode leaking discarded render-time Workers. The real-browser stress holds one Worker through ten run replacements, drops to zero on route disposal, and creates one fresh Worker after Back navigation.

## RenderFramePacket

The Flocking V1 frame contains generation/run/publication identity, template/tick/time, entity count, world bounds and boundary mode, perception radius, Alignment readout, runtime signature, and compact arrays:

```text
Uint32Array entity ids
Float32Array positions
Float32Array velocities
Uint16Array neighbor counts
Float32Array local densities
Uint8Array group codes
```

It contains no entities, component map, spaces, event queue, RNG state, metric history, snapshot history, methods, or mutable engine references. At 100/500 boids the arrays occupy about `2.7/13.5 KB`, versus about `41.4/182.0 KB` for JSON-encoded full snapshots in the controlled headless comparison.

Worker buffers transfer ownership rather than cloning nested world objects. One frame may be in flight and only one newest frame may wait. The same bound applies independently to UI publication. No `SharedArrayBuffer` or cross-origin isolation is required.

## UIProjection And Selection

React receives generation/run identity, tick/time, playback, last advance kind, entity count, Alignment, runtime signature, warnings, selected summary, bounded performance summaries, and publication counts. Continuous positions never flow through React state. Default running UI projection is limited to roughly 250 ms intervals; explicit commands, selection, reset, and manual step publish immediately.

The normal frame carries no per-agent neighborhood collections, trajectories, labels, or histories. Selecting one boid adds only that boid's bounded current neighbor ids, offsets, and distances. The selected semantic DOM summary remains exact model state plus a separately labelled current proximity calculation.

## Snapshot Audit

The canonical snapshot API is retained for restore/export/comparison and other authoritative consumers. Snapshot construction clones entities, every component table, spaces, globals/events, RNG/export state, and bounded metric history. That breadth is appropriate for continuation and export but wasteful for every visual frame.

The continuous Worker prototype performs zero full snapshots. Across twelve headless samples, packet projection versus snapshot construction measured:

| Agents | Snapshot median / p95 | Packet median / p95 |
| --- | ---: | ---: |
| 100 | 0.257 / 0.357 ms | 0.055 / 0.128 ms |
| 500 | 1.135 / 5.735 ms | 0.123 / 2.589 ms |

These are current-machine comparative measurements, not universal timing guarantees.

## Neighbor Search Audit

The inherited automatic Flocking path used a tick-local `ContinuousSpatialHashIndex` at 100 or more boids for radii below half the world dimension. Candidate pairs were sorted back into stable entity insertion order before floating-point accumulation. Tiny/global-radius cases used the older deterministic all-pairs path. Intended complexity was approximately `O(n + candidates)` versus `O(n^2)` for all-pairs.

Differential testing found the inherited index was not actually equivalent for wrap worlds when a world dimension was not divisible by cell size. Its final narrow wrap bucket could be jumped across by a legal radius while lying outside the searched cell range. Normalization also perturbed already-in-range floating-point coordinates. An explicit `uniformCoverage` experiment uses equal effective cell dimensions and avoids needless modulo operations; it exactly matches brute force for zero/one agent, sparse/dense/same-position states, exact/inside/outside radii, corners, wrapped edges, 500 generated agents, and multiple radii. Existing callers retain the pre-PERF1 nominal-cell behavior by default.

The corrected index was then benchmarked, not assumed faster. With radius 30, a tuned grid cut 500-agent comparisons from `124,750` to about `62,064` per tick but cost a median `12.456 ms` in neighbor work versus `2.775 ms` for all-pairs. Overall it measured `28.836` versus `43.964` ticks/s. At 100 it also lost, `268.195` versus `296.996` ticks/s, with neighbor medians `0.526` versus `0.083 ms`. The preserved automatic path measured `264.867` ticks/s at 100 and `33.959` at 500. An independent preceding report showed the same corrected-versus-reference direction. Object buckets, cell traversal, maps, sorting, and allocation outweighed distance-check savings at the current maximum of 500.

Therefore the corrected spatial index remains an explicit, headless differential path for future profiling; it is not adopted as the production optimization. Exact 100-agent/40-tick and 500-agent/16-tick snapshot exports match between corrected index and all-pairs reference. Automatic Flocking retains the inherited threshold, nominal-cell index, fallback, ordering, and output behavior so PERF1 does not silently migrate historical deterministic runs. That also preserves a known non-divisible-wrap limitation for a later explicit migration audit; corrected and inherited trajectories are not claimed to be identical.

## Controlled Worker Results

Three independent eight-second Chromium repetitions after PERF1 measured:

| Agents | Ticks/s range | Engine median / p95 | Scene projection median / p95 | FPS range | Frame median / p95 | UI publications |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 23.85..23.88 | 2.4..2.6 / 3.6..7.1 ms | 0.1 / 0.2 ms | 59.95..60.04 | 16.7 / 16.8 ms | 30..31 |
| 500 | 23.66..23.69 | 24.3..25.0 / 30.3..33.4 ms | 0.2 / 0.3 ms | 59.84..59.99 | 16.7 / 16.8 ms | 31 |

At 500, baseline main-thread rendering was `6.67..12.97 FPS` with `49..85` long render frames. Worker-backed rendering was `59.84..59.99 FPS` with zero long render frames in all three controlled samples. Startup compilation/loading still produced `2..4` browser long tasks per run, so PERF1 does not claim a long-task-free application. Post-start p95 event-loop delay was about `2.7..4.3 ms` at 500 instead of baseline `131.8..266.5 ms`.

The Worker does not make engine computation free or universally faster. It moves engine pressure off the UI thread. It also removes continuous snapshot construction and cuts React publications to coarse state. Canvas draw remains cheap and stays on the main thread.

## Soak And Memory

Independent 60-second Worker soaks completed without page errors or console errors:

| Agents | Ordered ticks | Ticks/s | FPS | Frame p95 | Render long frames | UI publications | Post-GC heap reading |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 1,445 | 23.98 | 59.99 | 16.7 ms | 0 | 215 | unchanged at 81.4 MB |
| 500 | 1,444 | 23.96 | 60.00 | 16.8 ms | 0 | 223 | unchanged at 86.4 MB |

Instrumentation remained capped at 360 samples per measure. Frame/UI gates remained one-in-flight plus one-pending. Visual packets were coalesced only when a consumer lagged; ordered model steps were not skipped. The Chromium heap API was coarse and quantized, so an unchanged reading is only evidence against obvious growth in this interval, not proof of leak freedom. Multi-hour, mobile-device, browser-diversity, and production-build memory profiling remain open.

## Production And Scientific Boundaries

- Production `/world`, its stage, tasks, setup/rebuild, Observe, Compare, Experiment Runner, playback, history, starter/recipe/guide handoffs, and persistence are not migrated to the Worker in PERF1.
- Forest Fire and Predator-Prey retain their existing runtime behavior. Their existing performance smoke remains required.
- No automatic neighbor policy, seed interpretation, random stream, draw order, initialization randomization, metric definition, intervention, scenario field, or agent-count bound was changed.
- The exact corrected wrap implementation is opt-in for differential tests only. The inherited automatic path remains unchanged; ORTUS does not falsely call its trajectories equivalent to the corrected experiment.
- A frame is ephemeral presentation state, not empirical observation, evidence, validation, calibration, causality, or prediction.

## I1 Handoff

I1 may consume `SimulationRuntimePort`, `RenderFramePacket`, `UIProjection`, generation-safe Worker execution, selected-only detail, and the existing Canvas frame adapter. It must keep the engine authoritative, keep React coarse, keep packet queues bounded, retain semantic DOM status/inspection, and add template adapters or rendering primitives only when their runtime support is real.

I1 must not turn `RenderFramePacket` into `CanonicalObservation`, migrate production World implicitly, add a Worker toggle, hide Worker failure behind a different run, infer cross-template support, adopt the corrected spatial-hash experiment without a separate semantic migration and new performance evidence, or claim browser/mobile/high-scale readiness from these local measurements.

PERF1B is the next required audit. I1 remains unstarted until that audit is complete.

## Final Verification

- Focused runtime/neighbor/index/roadmap coverage passed `6 files / 54 tests`; focused real-Worker Playwright passed `2/2`.
- Complete Playwright/Axe passed `185/185` in `16.6m` with zero failures, retries, or skips.
- Typecheck passed; unit verification passed `81 files / 678 tests`; the production build compiled successfully and generated `23` pages.
- Final simulation smoke measured Flocking-100 `236.93` ticks/s, Flocking-500 `31.65`, Forest Fire `50.24`, and Predator-Prey `140.64`; bounded Atlas smoke completed `2` runs / `10` work units / horizon `5` in `38.84 ms`.
- Flocking automatic-path pair checks remained exactly `316,971` at 100 and `7,721,264` at 500, matching the untouched PERF1 baseline operation counts. This is stronger semantic evidence than volatile wall-clock timing.
- `npm run perf:runtime` passed with exact corrected-index/reference snapshot equivalence at 100 and 500. `git diff --check` passed at the final commit gate.
- `npm run lint: unavailable, package.json has no lint script.`
