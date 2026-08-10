# Immersive Rendering Baseline

Date: 2026-08-10
Prompt: I0
Machine scope: local headless Chromium development-server measurements

## Purpose

This record compares the untouched production Flocking World with the three isolated I0 presentation prototypes. It is a machine-specific engineering baseline, not a universal FPS guarantee, scale certification, browser-support claim, or proof of high-scale readiness.

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

## Prototype Results: 100 Boids

| Concept | Ticks/s | FPS | Median / p95 frame | Frames over 50 ms | Long tasks | Median / p95 canvas draw | React commits | Raw heap delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Living Diorama | 23.37 | 59.58 | 16.7 / 16.7 ms | 0 | 0 / 0 ms | 0.6 / 1.1 ms | 54 | +5.14 MiB |
| God-Hand | 23.54 | 58.41 | 16.7 / 16.8 ms | 1 | 1 / 67 ms | 0.3 / 0.7 ms | 57 | -18.19 MiB |
| Field Scientist | 23.65 | 59.19 | 16.7 / 16.8 ms | 0 | 0 / 0 ms | 0.3 / 0.7 ms | 55 | -66.34 MiB |

At 100, all concepts maintained production-equivalent model throughput and approximately 60 browser frames/s on this machine. React committed roughly 6.5 to 7 times/s instead of once per model tick; canvas owned the continuous visual loop.

## Prototype Results: 500 Boids

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

The prototype premium retained after collection was approximately 3.5 MiB above production and stable across concepts. This is consistent with route/component/adapter state and bounded buffers. A 10-second run cannot prove lifetime leak freedom, so longer soak testing remains an I0B/I1 concern.

## React And DOM Observations

At 100, production emitted 198 observed React commits in the baseline window while prototypes emitted 54 to 57. At 500, production emitted 56 and prototypes emitted 56 to 60. The route throttles textual/control notifications to at most roughly once per 120 ms; no boid is a React component. React commit duration values came from a development-hook approximation and are not treated as production profiler truth.

Prototype DOM mutation records were approximately 599 to 614 at 100 and 567 to 625 at 500, primarily coarse tick/readout and audit data-attribute changes. Canvas entity positions do not create DOM mutations.

## Visual Bounds

| Resource | Bound | Observed end state |
| --- | ---: | ---: |
| Tracked trail entities | 32 | 32 in Living Diorama; 0 without selection in other concepts |
| Points per trail | 12 | 12 maximum |
| Total trail points | 384 | 384 maximum |
| Transient effects | 24 | 0 after expiry in measured windows |
| Timing samples per series | 360 | bounded rolling sample |

Effects expire and are dropped. Trail buffers evict old points and untracked ids. Reduced motion draws zero transient effects. Runtime metric history retains the engine's existing bound; I0 adds no snapshot or event-history store.

## Startup And Replacement

Prototype startup-to-interactive across the final six measured cases ranged from `1,035 ms` to `1,997 ms`. A confirmed active 100-to-500 replacement, including fresh engine construction and first canvas readiness, took `263 ms`. The untouched production baseline was `1,687 ms` startup and `113.2/140.3 ms` parameter rebuild. Prototype replacement includes an explicit confirmation/remount contract and should not be described as faster than production rebuild.

## Conclusion

The final measurements show no unexplained material simulation-throughput regression at either required load. At 500, current main-thread Flocking remains visually coarse in both production and prototypes, so a future worker/off-main-thread architecture may be worth investigating only through a dedicated measured prompt. I0 does not claim that support.

**The immersive renderer changes presentation only. Simulation semantics remain unchanged. Visual quality may degrade independently of model fidelity.**
