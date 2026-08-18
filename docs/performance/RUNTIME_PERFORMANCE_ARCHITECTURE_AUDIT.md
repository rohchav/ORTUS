# Runtime Performance Architecture Audit

Date: 2026-08-18
Milestone: PERF1B
Starting commit: `64a03e1 perf: add runtime performance architecture`
Verdict: `CONDITIONALLY READY FOR FUTURE I1 CONSUMPTION`

## Decision

PERF1's direction survives an adversarial audit, but its first implementation did not. The audit found one P0 resource-bound family and twelve P1 correctness or lifecycle families. All are fixed. No known P0 or P1 remains.

The repaired boundary is deterministic under the tested Local, fake-Worker, structured-transfer, and real-browser Worker paths. It rejects stale generations and same-generation revisions, makes Worker failure terminal, bounds all accepted Worker ingress, keeps transferable ownership one-way, preserves ordered model steps under visual coalescing, and exposes only explicit Flocking projection support. Production `/world` is still not migrated.

The verdict is conditional only because broad browser/hardware coverage, actual mobile devices, faithfully throttled background tabs, multi-hour or Worker-heap profiling, direct screen-reader/assistive-technology use, forced colors, and formal WCAG conformance remain unverified. Those external gaps do not conceal a known runtime P0/P1.

## Defects And Repairs

| Severity | Families | Audit finding and repair |
| --- | ---: | --- |
| P0 | 1 | Promise requests were bounded only by caller patience, while fire-and-forget controls could accumulate in the browser-to-Worker queue without an authoritative bound. All requests and controls now share a maximum of 128 unconsumed transport messages. The host acknowledges consumption before execution; overflow is rejected rather than coalescing or losing an accepted command. |
| P1 | 12 | Same-generation stale frames/UI could become current; completion identity/projection kind was under-validated; completion-first ordering could strand UI readiness; Worker failures were not uniformly terminal; startup commands had ambiguous semantics; rapid play-then-step could outrun playback acknowledgement and fail the host; malformed stale-generation input could pause the current scheduler while its stale failure was ignored; Local and Worker failure cleanup diverged; internal runtime authorities were publicly exported; dead entities could remain projected; initialization failure could be swallowed by readiness; and selected semantic values were rounded renderer values rather than authoritative engine values. Strict ordering, synchronous playback intent, stale malformed-message consumption, lifecycle, export, alive-entity, readiness, and exact projection repairs close these families. |
| P2 | 9 | Failure DOM semantics, cross-publication UI signatures, coalescing counters, scheduler option validation, implicit generic/Flocking boundaries, an unused density array, ambiguous publication diagnostics, a 500-boid browser-smoke startup race, and protocol-counter bounds were hardened. |
| P3 | 0 | No polish work was used to pad the audit. |

## Authority And Support Boundary

`SimulationRuntimePort` exposes validated initialize/replace/reset, play/pause/manual-step, selection, publication subscriptions, state, and disposal. It exposes no engine, world, RNG, scheduler, command buffer, component table, or mutable simulation object. Runtime internals such as the session, host, protocol schemas, scheduler, and gates are no longer part of the public barrel.

The runtime now requires an explicit projection kind. The only implemented kind is `flocking-v1`, and both drivers reject unsupported templates. A generic port or packet base is an interface boundary, not proof that every template has a Worker projector or renderer.

```text
idle -> initializing -> ready
                    \-> failed
any non-disposed state -> disposed
```

Commands before the first ready publication reject explicitly. A later ready run may remain visible while an explicit replacement initializes, but generation identity prevents old messages from mutating the replacement. Worker failure is terminal: listeners are removed, the Worker is terminated, pending operations reject, no local fallback starts, no new seed is chosen, and no partial completion is fabricated.

## Deterministic Equivalence

The audit compares authoritative results rather than pixels. For multiple seeds at 100 and 500 boids, Local manual steps, Worker manual steps, and direct engine steps produced the same authoritative modeled state and exact Flocking projection. Selected and unselected projection states did not alter engine output. Reset/replay, rapid play/pause/step, triple reset, replacement A/B/C, replacement followed by delayed completion, selection changes, and disposal with delayed messages preserved generation and step identity.

The Worker contains transport and scheduling concerns only. `RuntimeSession` remains the shared engine-construction, stepping, command, metric, and projection authority. No simulation rule is duplicated in Worker-only code. Seed interpretation, stream creation, RNG consumption, Flocking rules, metrics, intervention semantics, and the established elapsed-time scheduler remain unchanged.

## Ordering And Race Safety

Every accepted response must match active generation, run id, template id, and projection kind. Frame and UI publications also require positive, strictly increasing same-generation revisions; frames may not regress tick. Completion messages must match the request's generation and runtime identity and cannot claim an impossible generation relationship.

The deterministic race suite covers:

- `play -> pause -> step`, `play -> reset -> play`, and `play -> replace -> pause`;
- `reset -> reset -> reset` and `replace A -> B -> C`;
- delayed step completion after replacement;
- delayed frame/UI after navigation or disposal;
- same-generation frame revisions `101 -> 102 -> 100` and equivalent UI ordering;
- selection `A -> B -> C`, deselection, reset, replacement, dead selection, and disposal;
- initialization delay/failure and commands before ready;
- completion arriving before the matching UI channel.

Stale messages are ignored and cannot resurrect playback, warnings, selection, tick, frame, or active identity. Accepted authoritative commands are never coalesced. Repeated disposal is idempotent.

## Scheduler And Delivery Semantics

Both drivers retain the same target 24 ticks/s elapsed accumulator, maximum 250 ms elapsed contribution, engine `maxStepsPerFrame` catch-up ceiling, and ordered deterministic steps. Scheduler construction now rejects invalid elapsed, speed, or step bounds. A large delay may make the runtime fall behind; it does not invent, reorder, or pretend to have executed model steps.

Slow-consumer tests prove that all model steps still execute while ephemeral frame/UI publications coalesce. Pause, reset, and replacement stop obsolete catch-up through explicit generation ownership. Background behavior was emulated with delayed consumers, delayed Worker delivery, and large elapsed intervals. Playwright does not faithfully prove every browser's real background-tab throttling or visibility policy, so no such claim is made.

Only these channels use latest-value semantics:

```text
RenderFramePacket: ephemeral presentation
UIProjection: coarse current UI/accessibility state
```

Commands, interventions, model steps, future events, comparison captures, and future `CanonicalObservation`/evidence channels are not eligible for visual coalescing. Neither runtime generation nor a visual publication is scientific provenance.

## Packet And Buffer Bounds

The Flocking packet now transfers only ids, positions, velocities, neighbor counts, group codes, bounded scalar/frame identity, and optional selected-only neighbor detail. The unused per-entity local-density array was removed. The frame adapter derives its display value from neighbor count and active entity count, while selected semantic UI reads the authoritative template-owned `BoidState.localDensity`. Dead entities are excluded.

| Case | Typed bytes |
| --- | ---: |
| 100, unselected | 2,300 |
| 500, unselected | 11,500 |
| 100, maximum selected detail | 3,884 |
| 500, maximum selected detail | 19,484 |
| Protocol maximum: 10,000 entities plus 2,048 selected neighbors | 262,768 |

An unselected packet owns five unique transferable buffers; a selected packet owns at most eight. Every buffer is unique within the transfer list. `postMessage` detaches sent Worker-side buffers, and the host never reuses or mutates them. Renderer/camera/lens paths read packet arrays without source writes; no deep clone was added.

Each frame channel and UI channel has at most one in-flight plus one newest pending publication. Selected detail is part of the bounded frame/UI projection rather than a third unbounded response queue. Across two maximum-detail frame slots there are at most 16 buffer slots; after transfer, the in-flight Worker's buffers are detached and only the pending packet remains Worker-owned. The main driver retains only the latest accepted frame and UI value.

The separate authoritative transport bound is 128 unconsumed messages shared by promise requests and fire-and-forget controls. Host receipt acknowledgements release capacity. The bound survives replacement instead of being reset around old unconsumed messages. Overflow rejects before changing generation or accepting a command.

## Five-Run Browser Matrix

Five independent matched production-browser samples ran for approximately eight seconds per case at `1280x720`. Values are local evidence, not CI thresholds or hardware guarantees.

| Runtime / agents | Ticks/s median (range) | FPS median (range) | Engine median/p95 | Neighbor median/p95 | Project median/p95 | Draw median/p95 | Event-loop median/p95 | Long tasks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local / 100 | 23.721 (23.698..23.732) | 59.863 (59.810..59.920) | 2.3 / 3.4 ms | 0.3 / 0.6 ms | 0.1 / 0.2 ms | 0.2 / 0.3 ms | 0.0 / 1.2 ms | 0 |
| Worker / 100 | 23.628 (23.514..23.707) | 59.866 (59.699..59.899) | 6.6 / 10.4 ms | 0.9 / 1.5 ms | 0.3 / 0.7 ms | 0.5 / 1.0 ms | 0.0 / 3.3 ms | 0 |
| Local / 500 | 23.654 (23.601..23.704) | 57.163 (55.191..57.747) | 23.2 / 32.8 ms | 6.7 / 13.4 ms | 0.4 / 0.6 ms | 0.5 / 0.8 ms | 10.2 / 27.6 ms | 4 median (4..12) |
| Worker / 500 | 22.536 (21.773..23.033) | 59.788 (59.725..59.893) | 38.4 / 48.1 ms | 13.2 / 19.7 ms | 0.6 / 1.4 ms | 0.8 / 2.0 ms | 0.0 / 5.8 ms | 0 |

Local 100 was cheaper than Worker 100. Worker 500 was not faster in model throughput and showed meaningful short-run variance. Its credible benefit was separation: it preserved an approximately 60 FPS canvas loop and removed observed main-thread long tasks while the local driver put engine work on the main thread. The 500 Worker was near its 41.7 ms per-tick budget in some samples, so there is no large Worker-side headroom claim.

Local frame publications were 192 per sample and UI publications were 31..32. Worker 100 sent 193 frames and 31..32 UI values. Worker 500 sent 37..45 frame batches (median 41) and 20..24 UI values (median 22), with zero gate coalesces. The lower frame-publication count is scheduler batching of multiple ordered ticks into one projection, not skipped model work; Canvas can redraw the latest packet independently.

## Three-Minute Soaks

| Agents | Ordered ticks / elapsed | Ticks/s | FPS | Event-loop p95 / max | Engine median/p95 | Neighbor median/p95 | Project median/p95 | Draw median/p95 | Frame / UI publications | Long tasks/frames |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 4,321 / 180.154 s | 23.985 | 59.999 | 3.4 / 17.4 ms | 5.2 / 8.6 ms | 0.7 / 1.0 ms | 0.2 / 0.5 ms | 0.5 / 0.8 ms | 4,321 / 664 | 0 / 0 |
| 500 | 4,244 / 180.227 s | 23.548 | 59.963 | 5.9 / 39.3 ms | 23.6 / 30.8 ms | 7.8 / 13.3 ms | 0.5 / 1.4 ms | 0.5 / 0.7 ms | 850 / 442 | 0 / 0 |

Both soaks retained one Worker, zero gate coalesces, and at most 360 samples per instrumentation series. The longer 500 run improved after warm-up, which is consistent with JIT/runtime variance; it does not erase the five-run short-sample range.

A separate 60-second 500-boid production-build heap check, with explicit main-page garbage collection, changed from `6,854,104` to `7,601,068` bytes (`+746,964`). This excludes Worker heap, native Canvas, and GPU memory and is not leak proof. A CDP metric unavailable in the environment was rejected rather than reported. Twenty-five runtime mount/dispose cycles, 25 host replacements, and 20 browser Back/Forward transitions held exactly one Worker while mounted and zero after disposal. No monotonic runtime-object or Worker-count growth was observed.

## Startup Ownership

Five warm-ish Start route readiness samples were `210..258 ms` after one `357 ms` cold first load. Worker 100 readiness was `283..331 ms`, with fresh-run rebuild `5.1..8.4 ms`; one 55 ms main-thread long task occurred across five samples. Worker 500 readiness was `276..320 ms`, with rebuild `9.7..14.5 ms` and no main-thread long task across five samples.

Earlier cold navigations produced one to three long tasks. The bounded investigation attributes most startup cost to route/module loading, Next/React hydration, and Canvas initialization, not engine rebuild. PERF1B found no bounded runtime startup defect worth a broad application optimization.

## UI, Accessibility, And Production Isolation

Semantic DOM now distinguishes initializing, ready/running, paused, failed, replaced, lost selection, and disposed behavior. Tick, active runtime identity, playback, selected summary, and failure remain available outside Canvas. Selected values come from authoritative engine doubles rather than Float32 frame data. Runtime/UI signatures are generated together so the semantic summary cannot combine incompatible publications.

Reduced motion changes presentation only; it does not change commands, ticks, queue bounds, or simulation fidelity. The Worker route was exercised at `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844`, plus high-DPR emulation, with no status loss or unusable controls. Axe and keyboard/focus checks passed. This is not direct screen-reader, AT, forced-colors, browser-zoom, actual-device, or formal WCAG evidence.

The complete browser regression covers normal production Flocking, all seven templates, Starter and recipe launches, `Reading a Flock`, Setup rebuild, Observe, Change, Compare, Explain, Experiment Runner, task history, Back/Forward, Atlas, Lab, Builder, reduced motion, six runtime viewports, and DPR 2. Production `/world` still uses its established main-thread engine/snapshot/Zustand path. PERF1B does not migrate or partly activate the Worker there.

## Neighbor And Experimental Integrity

The historical automatic Flocking policy remains unchanged: inherited nominal-cell indexing at its existing threshold and the deterministic all-pairs fallback. The inherited non-divisible-wrap limitation is still documented; inherited trajectories are not falsely equated with a mathematical all-pairs reference.

The corrected `uniformCoverage` path remains opt-in headless differential/benchmark code. It is not user-selectable, query-selectable, persisted, used by a Starter recipe, or activated by production World or the Worker prototype. PERF1B did not silently migrate Flocking semantics to the corrected path.

## Future I1 Runtime Handoff

I1 may depend on:

```text
SimulationRuntimePort
WorkerRuntimeDriver
LocalRuntimeDriver for reference/testing
RenderFramePacket
UIProjection
selected-detail projection
generation/run/projection-kind identity
strictly increasing publication revisions
bounded visual backpressure
128-message unconsumed transport bound
explicit idle/initializing/ready/failed/disposed lifecycle
explicit terminal Worker failure with no fallback
```

I1 must not:

```text
reintroduce continuous full-snapshot rendering
render or animate entities as React components
mutate engine/world/RNG/command state from renderer or Canvas
make Canvas, RenderFramePacket, or UIProjection authoritative
couple camera, selection, DPR, resize, or reduced motion to model state
change seeded RNG or established scheduler semantics
coalesce accepted commands, interventions, model steps, or evidence
infer cross-template support from the generic port or base packet
accept a template without an explicit tested projection kind
merge RenderFramePacket/UIProjection with future CanonicalObservation
hide Worker failure behind local fallback, restart, or a new seed
activate the corrected Flocking index without a separate migration audit
```

I1 remains planned and unstarted. A0/A0B must first consolidate the canonical architecture and source-of-truth boundaries. Template expansion, production migration details, scene primitives, and user-facing immersive behavior still belong to I1's dedicated prompt and audit.

## Remaining Limits

- Chromium on one local machine is not a broad browser, CPU, GPU, operating-system, or device matrix.
- Playwright delay emulation is not faithful proof of every background-tab/visibility-throttling policy.
- Three-minute soaks and a separate 60-second main-page heap sample are not multi-hour, Worker-heap, native Canvas, or GPU leak proof.
- Actual mobile hardware, complete touch workflows, browser zoom, direct screen-reader/AT use, forced colors, user comprehension, and formal WCAG conformance remain unverified.
- Flocking at 500 is the largest tested implementation bound, not a general high-scale certification. Worker-side step time can approach the 24 Hz budget.
- Only the isolated Flocking prototype has a runtime projection. Other templates remain unsupported by this Worker path until explicitly implemented and audited.

## Verification

- Focused runtime/immersive/roadmap coverage passed `6 files / 67 tests`, including 25 new adversarial tests. The core runtime/immersive subset contains `3 files / 50 tests`.
- Post-final-fix focused real-Worker Playwright passed `6/6 (2.6m)`. Post-final-fix complete Playwright/Axe passed `189/189 (19.7m)` with zero failures, retries, or skips.
- Typecheck passed; complete unit verification passed `82 files / 703 tests (70.74s)` after the final race fixes.
- The optimized production build compiled in `10.7s` and generated `23` pages after the final race fixes.
- Final simulation smoke measured Flocking-100 `207.04` ticks/s, Flocking-500 `28.32`, Forest Fire `44.57`, and Predator-Prey `126.47`; bounded Atlas smoke completed `2` runs / `10` work units / horizon `5` in `36.21 ms`.
- Automatic Flocking retained exact pair-check totals `316,971` and `7,721,264` at 100/500. `npm run perf:runtime` passed exact corrected-index/reference snapshot equivalence, measured automatic medians `229.007/26.914` ticks/s, and measured unselected packet sizes `2,300/11,500` bytes.
- Final `git diff --check` passed before this record update and is required again at staging. `npm run lint: unavailable, package.json has no lint script.`

PERF1B is complete. Its runtime architecture is conditionally ready for future I1 consumption. A0 - Canonical Architecture + Source-of-Truth Consolidation is next and unstarted; A0B, I1, and all later milestones remain unstarted.
