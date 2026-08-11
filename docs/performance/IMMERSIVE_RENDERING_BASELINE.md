# Immersive Rendering Baseline

Date: 2026-08-11
Prompts: I0 and I0B
Machine scope: local headless Chromium development-server measurements

## Purpose

This record preserves the I0 production/prototype baseline and the independent I0B reproduction, profiling, hardening, final matched measurements, and one-minute soaks. It is a machine-specific engineering record, not a universal FPS guarantee, scale certification, browser-support claim, or proof of high-scale readiness.

The largest existing bounded Flocking parameter case is 500 boids, so the required 100 and 500 cases cover the practical current range.

## Method

Before any repository edit:

- ran `npm run perf:simulation`;
- measured production `/world?starter=flocking&task=setup` at 100 and 500 boids;
- used the existing 24 ticks/s production scheduler;
- sampled browser `requestAnimationFrame`, Long Tasks, precise-memory heap, React commit-hook observations, DOM mutation records, startup-to-interactive, and parameter rebuild time;
- ran each browser case for approximately eight seconds.

After implementation:

- ran the same approximately eight-second instrumented window for each concept and load at `1280x720`;
- used one fixed validated random-headings scenario and seed;
- measured exact runtime ticks through the route audit API and canvas frames through both the canvas monitor and browser rAF;
- measured a separate 10-second 500-boid retained-heap comparison in a fresh browser context per target, with forced garbage collection before and after;
- made no agent-count, rule, RNG, metric, or scenario-fidelity reduction.

Development compilation, garbage collection, CPU contention, the Next development overlay, React instrumentation, and run order can affect these values. The measurements are suitable for relative local comparison only.

## Untouched Engine Baseline

`npm run perf:simulation` before edits:

| Case | Throughput | Mean engine step | Snapshot | Render-model preparation |
| --- | ---: | ---: | ---: | ---: |
| Flocking 100 | 118.68 ticks/s | 8.398 ms | 1.405 ms | 0.630 ms |
| Flocking 500 | 20.90 ticks/s | 47.812 ms | 2.434 ms | 0.722 ms |

The raw benchmark runs headlessly and is not the same workload as a browser trying to maintain a 24 ticks/s model clock while also rendering and committing UI state.

## Untouched Production Browser Baseline

| Case | Browser ticks/s | FPS | Median frame | p95 frame | Frames over 50 ms | Long tasks | React commits | Raw heap delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Flocking 100 | 23.49 | 57.84 | 16.7 ms | 16.8 ms | 2 | 2 / 158 ms | 198 | +23.72 MB |
| Flocking 500 | 23.15 | 6.23 | 183.4 ms | 216.7 ms | 53 | 54 / 9,849 ms | 56 | +30.96 MB |

Production startup-to-interactive was approximately `1,687 ms`. Parameter rebuild was `113.2 ms` at 100 and `140.3 ms` at 500.

The baseline already shows the current product tradeoff at 500: the elapsed-time accumulator keeps the model near 24 ticks/s by allowing rendered frames to become sparse.

## I0 Prototype Results: 100 Boids

| Concept | Ticks/s | FPS | Median / p95 frame | Frames over 50 ms | Long tasks | Median / p95 canvas draw | React commits | Raw heap delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Living Diorama | 23.37 | 59.58 | 16.7 / 16.7 ms | 0 | 0 / 0 ms | 0.6 / 1.1 ms | 54 | +5.14 MiB |
| God-Hand | 23.54 | 58.41 | 16.7 / 16.8 ms | 1 | 1 / 67 ms | 0.3 / 0.7 ms | 57 | -18.19 MiB |
| Field Scientist | 23.65 | 59.19 | 16.7 / 16.8 ms | 0 | 0 / 0 ms | 0.3 / 0.7 ms | 55 | -66.34 MiB |

At 100, all concepts maintained production-equivalent model throughput and approximately 60 browser frames/s on this machine. React committed roughly 6.5 to 7 times/s instead of once per model tick; canvas owned the continuous visual loop.

## I0 Prototype Results: 500 Boids

| Concept | Ticks/s | FPS | Median / p95 frame | Frames over 50 ms | Long tasks | Median / p95 canvas draw | React commits | Raw heap delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Living Diorama | 23.16 | 6.72 | 166.7 / 233.3 ms | 52 | 53 / 9,087 ms | 1.4 / 2.8 ms | 56 | +139.31 MiB |
| God-Hand | 23.29 | 8.08 | 133.3 / 216.6 ms | 65 | 66 / 9,236 ms | 0.8 / 2.3 ms | 58 | +56.06 MiB |
| Field Scientist | 23.38 | 9.20 | 116.7 / 183.4 ms | 69 | 69 / 8,564 ms | 0.8 / 1.9 ms | 60 | +119.78 MiB |

At 500, all concepts remained within `0.23 ticks/s` of the untouched production measurement. Render cadence degraded instead, as required. Field Scientist was the least expensive visual concept; Living Diorama paid for depth ordering, shadows, and 384 trail points. Canvas drawing itself remained a small part of long frames; deterministic engine work and snapshot/adapter publication dominate the main-thread cost at this bound.

## Scheduler Integrity

The first prototype scheduler measurement exposed a real mismatch: a one-step-per-timeout driver could not catch up after a slow step and produced only `16.44..19.60 ticks/s` at 500. That result was treated as blocking and was not accepted as the final architecture.

The corrected route-local driver mirrors production World's contract:

- target model rate: 24 ticks/s;
- elapsed-time accumulator;
- at most 250 ms accumulated per frame;
- at most `engine.clock.maxStepsPerFrame` deterministic catch-up steps;
- one snapshot and scene-adapter publication after a catch-up batch;
- visual frame rate allowed to fall independently.

The final `23.16..23.38 ticks/s` results explain the improvement and remove the unexplained simulation-throughput regression. No core scheduler, engine clock, template, or simulation source changed.

## Memory

Raw sampled heap deltas are included above because they were requested, but they are dominated by allocation timing and garbage collection. Negative values do not mean the route uses negative memory; large positive values do not by themselves prove retained growth.

The isolated 500-boid retained-heap pass provides the more responsible comparison:

| Target | Elapsed | Final tick | Allocated delta before GC | Retained delta after GC |
| --- | ---: | ---: | ---: | ---: |
| Production World | 11.06 s | 257 | +113.64 MiB | +0.85 MiB |
| Living Diorama | 11.89 s | 269 | +134.56 MiB | +4.40 MiB |
| God-Hand | 12.00 s | 272 | +171.08 MiB | +4.35 MiB |
| Field Scientist | 11.00 s | 255 | +31.13 MiB | +4.45 MiB |

The prototype premium retained after collection was approximately 3.5 MiB above production and stable across concepts. This is consistent with route/component/adapter state and bounded buffers. This short I0 pass did not prove lifetime leak freedom; I0B therefore ran all six required one-minute cases.

## React And DOM Observations

At 100, production emitted 198 observed React commits in the I0 baseline window while prototypes emitted 54 to 57. At 500, production emitted 56 and prototypes emitted 56 to 60. I0 throttled textual/control notifications to roughly once per 120 ms; no boid was a React component. React commit duration values came from a development-hook approximation and are not treated as production profiler truth.

Prototype DOM mutation records were approximately 599 to 614 at 100 and 567 to 625 at 500, primarily coarse tick/readout and audit data-attribute changes. Canvas entity positions do not create DOM mutations.

## Visual Bounds

| Resource | Bound | Observed end state |
| --- | ---: | ---: |
| Tracked trail entities | 1 | Selected entity only |
| Points per trail | 12 / 8 / 5 | High / Balanced / Performance maximum |
| Total trail points | 12 | 5 observed under 500-boid Performance quality |
| Transient effects | 24 / 12 / 0 | High / Balanced / Performance maximum |
| Timing samples per series | 360 | bounded rolling sample |

Effects expire and are dropped. Trail buffers evict old points and untracked ids, and storage enforces the active quality bound rather than merely drawing a subset. Reduced motion draws zero transient effects. Runtime metric history retains the engine's existing bound; I0/I0B add no snapshot or event-history store.

## Startup And Replacement

Prototype startup-to-interactive across the final six measured cases ranged from `1,035 ms` to `1,997 ms`. A confirmed active 100-to-500 replacement, including fresh engine construction and first canvas readiness, took `263 ms`. The untouched production baseline was `1,687 ms` startup and `113.2/140.3 ms` parameter rebuild. Prototype replacement includes an explicit confirmation/remount contract and should not be described as faster than production rebuild.

## I0B Independent Reproduction

Before I0B edits, a fresh eight-case run at `1280x720` measured:

| Target | Boids | Ticks/s | FPS | Median / p95 frame | Long frames | React commits |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Production | 100 | 23.79 | 59.84 | 16.7 / 16.7 ms | 0 | 196 |
| Living | 100 | 23.75 | 59.94 | 16.7 / 16.7 ms | 0 | 51 |
| God-Hand | 100 | 23.86 | 59.52 | 16.7 / 16.8 ms | 0 | 50 |
| Field | 100 | 23.84 | 59.85 | 16.7 / 16.8 ms | 0 | 52 |
| Production | 500 | 23.67 | 35.13 | 33.3 / 50.1 ms | 15 | 191 |
| Living | 500 | 23.70 | 41.35 | 16.7 / 49.9 ms | 6 | 60 |
| God-Hand | 500 | 23.73 | 46.09 | 16.7 / 33.4 ms | 6 | 59 |
| Field | 500 | 23.70 | 47.88 | 16.7 / 33.4 ms | 4 | 59 |

This untouched reproduction was dramatically faster than the I0 record despite equivalent development conditions. It disproves any claim that one local FPS figure is stable enough to be a product threshold.

## I0B Phase Profile

Headless phase timing at 500 boids measured `58.515 ms` mean / `82.316 ms` p95 engine step, `2.690 / 4.604 ms` snapshot publication, and `0.568 / 1.088 ms` scene-adapter projection. Selected relationship preparation, depth sorting, and trail preparation each averaged about `0.11 ms`.

An eight-second Chrome CPU profile ranked `queryPairsWithinRadius` at about `1,156.5 ms` self time; two validation/runtime deep-clone paths at about `924.5 ms` and `856 ms`; and GC at about `469 ms`, followed by Flocking tick-data/pair-query preparation. Canvas draw did not appear among the dominant CPU entries.

The top three main-thread cost families are therefore:

1. Flocking neighbor search and engine stepping.
2. Snapshot/validation deep cloning and publication.
3. Allocation reclamation plus tick/adapter preparation.

Canvas-specific drawing remained about `0.9..1.3 ms` median and at most `2.5 ms` p95 in the final 500-boid cases. Rendering-platform replacement alone would not address the dominant costs.

## I0B Hardening

I0B reduced coarse runtime publication from roughly 120 ms to 250 ms, memoized the Canvas boundary, stabilized callbacks, made Alignment vectors and deterministic signatures lazy, localized proximity and trajectory detail to one selected entity, removed arbitrary first-32-boid trails, and eliminated repeated full trail maps when no entity is tracked.

Automatic High/Balanced/Performance quality uses bounded p95/hysteresis and degrades DPR, grid density, shadows, strokes, selected trail density/frequency, and transient effects. It does not change model ticks or fidelity and is not persisted.

A five-second 500-boid React profile observed running commit counts changing from `34/45/39/43/34` for unselected/selected/lens/follow/trails before hardening to `25/22/18/23/20` after hardening. Idle remained five commits. The development profile hook itself changes throughput, so the count comparison is directional rather than production profiler evidence.

## I0B Final Matched Run

The final eight-case run used the same approximately eight-second window:

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

The matched final prototype FPS was about 6%, 10%, and 56% above final production at 500, while only Field improved p95 frame time. Because unchanged production fell from `35.13 FPS` in the untouched I0B run to `4.88 FPS` in the final run, cross-run frame-time improvement is not defensible. The credible gains are bounded adaptive work, fewer React commits, selected-only detail, and clearer phase evidence.

## I0B One-Minute Soaks

All concepts ran for at least 60 seconds at both required loads. Forced-GC retained deltas and final bounded selected-trail state were:

| Concept | 100 retained delta | 500 retained delta | 500 selected trail |
| --- | ---: | ---: | ---: |
| Living | -6.53 MiB | +4.86 MiB | 5 |
| God-Hand | -6.51 MiB | +4.50 MiB | 5 |
| Field | -6.49 MiB | +4.88 MiB | 5 |

The 500 checkpoints were non-monotonic and reclaimed transient allocation. Active listener count stayed flat at `586` in the instrumented page; running had two active rAF callbacks, paused had one renderer callback, and route navigation removed the prototype callbacks. Trail and effect storage stayed bounded through selection and concept changes. No continuing unbounded growth was observed. These local one-minute runs do not establish multi-hour leak freedom or GPU/browser diversity.

## Conclusion

I0B found no unexplained simulation-semantic change and no unbounded renderer state. It did not establish acceptable universal 500-boid interactivity or a stable raw FPS improvement. Current main-thread Flocking is dominated by engine neighbor search, cloning/snapshot work, and allocation pressure, not Canvas drawing.

I1 should investigate worker/scheduler isolation and snapshot-publication cost in a dedicated measured scope before assuming stronger Canvas LOD or WebGL is the answer. I0B does not implement or authorize those systems.

**The immersive renderer changes presentation only. Simulation semantics remain unchanged. Visual quality may degrade independently of model fidelity.**
