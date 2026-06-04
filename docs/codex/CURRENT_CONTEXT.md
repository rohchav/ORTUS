# ORTUS Current Context

Last updated: 2026-06-04 after R2 stabilization

## Project Identity

ORTUS is a browser-based complex-systems visual modeler backed by a deterministic TypeScript simulation engine. The app uses Next.js, React, and Zustand for UI state, while the simulation engine under `src/simulation` owns time, scheduling, seeded randomness, validation, metrics, snapshots, spaces, and template runtime behavior.

The engine must remain headless: no React, Zustand, DOM, Canvas, browser storage, backend, auth, or database dependencies in simulation code. The UI consumes engine snapshots and renders batched canvas/world views. Templates are registered through the template API and own domain behavior.

Built-in production templates currently include Epidemic Spread, Opinion Dynamics, Predator-Prey, Schelling Segregation, Flocking / Boids, and Forest Fire / Landscape Spread. These are exploratory model structures, not calibrated predictive tools.

## Completed Prompt State

Durable docs and source indicate completed/audited roadmap work through Prompt 30B, with Prompt 31 not started.

Implemented runtime foundations include scenarios, snapshots, template-defined behavior modes, agent composition, interventions, experiments, run summaries/comparison, seeded randomness, metrics, spaces, and template metadata.

Implemented service-first or metadata-first foundations include uncertainty, assumptions/limits/ethics, networks/relations, resources/stocks/flows, feedback/delays/events, systems primitive registry, hybrid composition, multi-scale structure, scale view state, boundaries/environment, spatial fields/environmental layers, observability/measurement models, causal assumptions/influence models, quantity semantics, emergence pattern descriptors, robustness/resilience semantics, and strategy/control/intervention semantics.

These foundations are not automatic runtime support for templates. A template must explicitly declare and actually use a primitive at runtime before ORTUS can claim template runtime support.

## Package And Dependency State

Current local toolchain observed during stabilization:

- Node: `v24.16.0`
- npm: `11.13.0`
- Installed top-level packages include `next@15.5.19`, `react@19.2.7`, `react-dom@19.2.7`, `vitest@4.1.8`, and `vite-node@6.0.0`.
- `package.json` currently defines `next`, `react`, `react-dom`, `zod`, `zustand`, TypeScript, Vitest, and `vite-node`.
- `npm install` completed cleanly after adding explicit `vite-node` support for `npm run perf:simulation`.
- `npm run lint` is unavailable because `package.json` has no lint script.

Dependency audit note: npm reports two moderate vulnerabilities and recommends `npm audit fix --force`; that force repair is prohibited for this stabilization pass and was not run.

## Performance And Scalability Work Status

The current dirty worktree contains an uncommitted performance/instrumentation pass. It appears to include:

- `SimulationPerformanceMonitor` and engine timing/counter hooks.
- Debug panel display of performance samples when instrumentation is enabled.
- Runtime performance metadata on production templates.
- Continuous 2D query diagnostics and a continuous spatial hash index path.
- Flocking local-radius spatial-hash neighbor-pair queries with deterministic fallback.
- Forest Fire hot-loop changes using cached grid-neighbor indices, compact per-tick state arrays, active burning-cell indices, changed-component updates, and state-count globals.
- Focused tests for spatial indexing, performance instrumentation, runtime metadata, Flocking behavior, and Forest Fire counters.
- A non-asserting `npm run perf:simulation` report script.

This work must be reviewed and tested before commit. It must not be described as SpatialFieldModel, BoundaryEnvironmentModel, multi-scale, or high-scale runtime support.

Latest observed `npm run perf:simulation` smoke results from this machine:

- Flocking, 100 agents / 100 ticks: 934.51 ms, 107.01 ticks/sec, spatial index reported.
- Flocking, 500 agents / 100 ticks: 5999.08 ms, 16.67 ticks/sec, spatial index reported.
- Forest Fire, 80x60 grid / 100 ticks: 3809.50 ms, 26.25 ticks/sec.
- Predator-Prey default / 100 ticks: 1341.89 ms, 74.52 ticks/sec, continuous spatial index reported.

These are local smoke numbers only. They are not benchmark evidence for scalability or scientific validity.

## Repo Hygiene Status

Generated artifacts have been removed from git tracking without deleting local files:

- `.gitignore` now ignores `node_modules/`, `.next/`, `tsconfig.tsbuildinfo`, local env files, and package-manager debug logs.
- `git rm --cached -r .next tsconfig.tsbuildinfo` staged removal of the previously tracked generated artifacts.
- `git ls-files .next tsconfig.tsbuildinfo` now returns no tracked files.
- The local `.next` directory and local `tsconfig.tsbuildinfo` still exist after build/typecheck activity, but they are ignored.
- The staged generated cleanup currently accounts for 226 generated files and 1097 deletions.

Real source changes are now reviewable separately from generated build/cache noise.

## Current Blockers

- `docs/roadmap.md` has prompt numbering/status drift: the "Current Foundation" section still references Prompts 1-17B while later docs/source describe Prompt 30.
- The performance/instrumentation pass is still uncommitted and needs human review before it becomes the new baseline.
- npm reports two moderate audit findings; no force fix was run.
- Prompt 31 remains blocked until the stabilization/performance work is reviewed and committed intentionally.

## Next Recommended Prompt After Stabilization

Next recommended prompt: review and commit the current stabilization/performance work in a clean split, starting with repo hygiene and durable context, then dependency/test stabilization, then the performance/instrumentation pass. Only after that should ORTUS proceed toward Prompt 31.

## Critical Guardrails

- Structural primitives are not runtime support.
- Templates do not runtime-support reserved primitives unless explicitly wired into the template runtime and registry.
- Do not add arbitrary code execution, user-authored formulas, expression evaluation, or unsafe model execution.
- Do not add visual builder, compiler, runtime model schema execution, or schema-backed rule execution yet.
- Do not claim validation, calibration, prediction proof, causal proof, robustness proof, safety certification, operational readiness, or policy recommendation.
- Do not treat network edges, feedback labels, observations, runtime metrics, uncertainty ensembles, visible patterns, or interventions as proof.
- Do not treat camera zoom as multi-scale modeling.
- Do not describe Forest Fire / Landscape Spread as wildfire prediction, GIS/weather/wind/humidity/terrain/suppression/firefighting modeling, calibrated fire behavior, SpatialFieldModel runtime support, BoundaryEnvironmentModel runtime support, or generic control strategy support.
