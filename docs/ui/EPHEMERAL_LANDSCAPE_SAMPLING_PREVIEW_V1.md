# Ephemeral Landscape Sampling Preview V1

Status: Prompt GW9 implementation record. GW9 is complete and Prompt GW9B has audited and hardened this bounded slice.

## 1. Scope

GW9 adds the first real Atlas sampling capability: a small, deterministic, isolated, non-persistent preview of exact model outputs. It does not add a complete landscape, discovery, regime map, saved research record, validation result, or real-world claim.

## 2. Starting commit

Work started on clean `main` at `aea6e01`, aligned with `origin/main` after UX6B.

## 3. Prior Atlas foundations

GW4/GW4B established Atlas evidence semantics; GW7/GW7B established behavioral-landscape vocabulary; GW8/GW8B established non-executable probe-planning vocabulary. Those artifacts remain useful conceptual foundations and do not become generic execution instructions.

## 4. UX-track dependency

UX3 through UX6B were complete, committed, and remotely aligned before GW9 began. GW9 reuses their route orientation, progressive disclosure, semantic status, focus, responsive, and accessibility conventions.

## 5. Product capability introduced

Atlas can now configure and explicitly run a supported one- or two-axis preview, inspect exact final-tick numeric values, inspect in-memory provenance, cancel between samples, and clear the local result.

## 6. Ephemeral-preview definition

An ephemeral landscape preview is a sparse bounded collection of executed model outputs held in component memory. It disappears on reload and creates no Atlas, Lab, World-comparison, or Experiment Runner record.

## 7. Probe-plan versus preview-request distinction

A probe plan is a non-executable planning artifact. A preview request is a separate canonical, validated, bounded runtime request created from explicit supported form inputs. The current probe-plan foundation lacks stable template, scenario, parameter, metric, seed, and tick values, so no safe handoff is offered.

## 8. Supported V1 execution contract

Preview V1 samples one or two numeric parameters on a small explicit grid and observes one implemented numeric metric at the final configured tick. Runs are sequential, local, deterministic, and isolated; only one preview runs at a time.

## 9. Unsupported capabilities

V1 does not support categorical axes, more than two axes, formulas, composite metrics, adaptive sampling, hidden baselines, automatic selections, interpolation, smoothing, contours, regime or transition detection, confidence analysis, persistence, server execution, queues, workers, Builder execution, or scientific validation.

## 10. Existing execution-service audit

| Concern | Existing implementation | Safe for Atlas preview | Requires bounded adapter | Must not reuse |
| --- | --- | --- | --- | --- |
| Engine construction | RunConfig validation, template registry, scenario-to-RunConfig service | Yes | Shared headless `createEngineFromRunConfig` boundary | Active World engine/store |
| Template resolution | Production template registry | Yes | Explicit preview capability allowlist | Display-name inference |
| Scenario resolution | Scenario validators and `runConfigFromScenario` | Yes | One bundled, validated preview scenario | Builder or active World scenario state |
| Parameter overrides | Validated RunConfig parameters | Yes | Canonical axis generation and scenario composition synchronization | Arbitrary numeric-template inference |
| Seed application | Engine RunConfig seed path | Yes | Explicit signed integer seed list | Random or time-derived seed generation |
| Tick advancement | Headless engine `runSteps` | Yes | Fixed horizon, one synchronous sample at a time | Active World scheduler |
| Metric observation | Template numeric metric history | Yes | Exact final-tick finite-value check | Formula or UI-derived metrics |
| Teardown | Engine becomes unreachable after each run | Yes | Executor retains only data records | Engines or snapshots in result state |
| Errors | Typed validation and ordinary engine errors | Yes | Fatal, sample, metric, and cancellation classifications | Zero coercion or hidden failure |
| Cancellation | Experiment Runner has separate local cancellation | Concept only | Preview-owned signal checked between samples | Experiment Runner state/UI |
| Progress | Executor callback | Yes | Completed-run counts only | Fake elapsed percentages |
| World/storage | Existing stores and persistence are unrelated | No | No access from headless executor | All World, comparison, and browser-storage writes |

## 11. Execution-reuse decision

GW9 extracted the authoritative RunConfig-to-engine construction path from the uncertainty runner into `src/simulation/runs/engineFromRunConfig.ts`. The uncertainty runner and Atlas executor share that headless service; Atlas does not reuse Experiment Runner UI state, World state, or storage.

## 12. Template support

Only production template `flocking-boids` (`Flocking / Boids`, template version `1.0.0`) is explicitly preview-capable. Capability is allowlisted and audited against the actual template registry and parameter/metric definitions.

## 13. Scenario support

Only `atlas-preview-flocking-random-headings-v1` (`Bounded random-headings flock`) is supported. It is a bundled data-only scenario recipe validated through the existing scenario service against `flocking-boids`.

## 14. Parameter support

The explicit axis allowlist is `agentCount`, `alignmentWeight`, `cohesionWeight`, `separationWeight`, and `noise`. Bounds and integer semantics are narrower where needed and checked against actual runtime parameter definitions. Other numeric Flocking parameters are not inferred as safe automatically.

## 15. Metric support

The explicit numeric metric allowlist is `alignmentScore`, `dispersion` (`world units`), and `averageSpeed` (`units/tick`). The executor reads only the selected finite metric value from the record for the exact final tick.

## 16. One-axis sampling

One-axis requests generate two to five inclusive X values. Result rows retain the exact coordinate, mean, minimum, maximum, successful seed count, failed count, and sampled/partial/failed text state.

## 17. Two-axis sampling

Two-axis requests generate the Cartesian product of distinct X and Y parameters. Ordering is deterministic with Y outermost, X inside each row, and canonical ascending seed order inside each coordinate.

## 18. Axis-generation rules

Minimum and maximum must be finite and ordered, point count must be 2 through 5, inclusive endpoints are retained, generated values must stay in capability/runtime bounds, and canonical numeric values use at most eight decimal places. A two-axis grid may contain at most 25 points.

## 19. Seed rules

The documented static default is `[101]`. Users provide one to three unique signed 32-bit integer seeds; GW9B canonicalizes them into ascending numeric order so reordered equivalent sets have identical requests. Duplicate, empty, non-integer, random, UUID, crypto, and time-derived seeds are rejected or absent.

## 20. Tick-horizon rules

Tick horizon is an explicit integer from 1 through 250. Each sample advances exactly that many ticks; there are no arbitrary stop expressions or hidden extra runs.

## 21. Work-budget rules

Work units equal `grid points x seeds x tick horizon`. Requests are rejected before execution if they exceed 25 grid points, 3 seeds, 250 ticks, or 5,000 work units. The UI displays points, runs, ticks, units, and budget status without silently reducing the request.

## 22. Preview-request model

`EphemeralLandscapePreviewRequest` contains schema/artifact/capability versions, stable template and scenario IDs, canonical axes and exact values, canonical ascending seeds, tick horizon, metric ID, `finalTick` observation semantics, sorted fixed scenario parameters, and the recomputed work estimate. Full canonical validation rejects forged derived fields.

## 23. Sample-run model

Each planned run has deterministic run and point IDs, exact coordinate, exact seed, and a fully validated `SimulationRunConfig`. Attempted runs retain success/failure, completed ticks, final tick, metric value or explicit error, and never use a timestamp or random identity.

## 24. Sample-point model

A point aggregates attempted runs for one exact coordinate. It records planned, attempted, successful, failed, and unstarted counts plus `sampled`, `partial`, or `failed` status and nullable mean/minimum/maximum.

## 25. Result model

The result retains the exact validated request, attempted points and runs, status, partial flag, run counts, cancellation state, typed errors, and epistemic warnings. It contains no engine, snapshot, confidence, evidence score, coverage score, regime, interpolation, persistence ID, database ID, timestamp, or duration.

## 26. Determinism guarantees

Canonical request validation, stable point/run ordering, explicit seeds, fresh engines, exact ticks, deterministic runtime RNG, and stable Kahan aggregation make equal supported requests produce equivalent result data for the same engine version. Wall-clock time is not result identity.

## 27. Isolated execution behavior

Every sample creates a fresh engine from its own validated RunConfig, advances synchronously, reads one final metric, records plain data, and releases the engine reference before a cooperative yield. Execution is sequential and bounded.

## 28. World-isolation result

Rendered tests compare World template, seed, context, runtime status, storage, and route state before and after an Atlas run. Atlas preview sampling runs in isolated engine instances and does not mutate World state or comparison history.

## 29. Experiment Runner isolation result

Rendered tests compare Experiment Runner controls and absence of result rows before and after an Atlas run. Preview execution does not use or write Experiment Runner configuration or results.

## 30. Lifecycle and status model

The UI exposes `idle`, `configured`, `invalid`, `running`, `cancelling`, `completed`, `completed_with_errors`, `cancelled`, `failed`, and `stale`. Configuration changes never trigger execution, and replacing an existing result requires an explicit modal acknowledgement.

## 31. Cancellation behavior

The exact action is `Cancel after current sample`. The signal is checked between sample runs because one synchronous tick loop cannot be interrupted honestly. Completed attempts remain visible; unstarted runs remain unsampled; cancellation is not completion.

## 32. Error behavior

Configuration errors block execution and focus the error summary. Fatal executor errors stop execution. Individual engine or final-metric failures are retained and allow later samples to continue. A terminal preview with run failures is `Completed with errors`; missing/non-finite values remain absent rather than becoming zero.

## 33. Aggregation behavior

Successful per-seed values use deterministic Kahan summation for arithmetic mean and retain minimum and maximum. Failed seeds remain visible. A point with no successes has null aggregate values and failed status; one success has equal mean/minimum/maximum.

## 34. One-axis presentation

The one-axis result is a semantic numeric table in a labelled scroll region. It displays exact X values, status text, aggregate values, successful/planned seeds, and failures.

## 35. Two-axis presentation

The two-axis result is a semantic matrix with X column headers, Y row headers, exact numeric values, seed counts, and text statuses. The matrix has a labelled, keyboard-focusable internal scroll region on constrained viewports.

## 36. Color and numeric-value semantics

GW9 deliberately uses no interpolated heatmap. Numeric values and status text carry the result; color is supplementary surface styling and never the sole cue.

## 37. Sampled-versus-unsampled semantics

Only attempted coordinates appear in a result. Every displayed successful value came from an executed run. The UI states: `Only the displayed coordinates were sampled. No values between them were inferred.` Unstarted cancelled work remains unsampled.

## 38. Provenance

An explicit disclosure shows request artifact/schema version, template/scenario IDs and names, capability/template version, axis IDs and exact values, fixed parameters, seeds, tick horizon, metric ID/name/unit, final-tick semantics, work units, planned points/runs, attempted/successful/failed counts, cancellation, and status. Provenance remains bound to the original request when controls change.

## 39. Stale-result behavior

Changing completed-preview configuration keeps the old result visible but marks it `Stale preview`. It states that the result and provenance still describe the original request. No hidden rerun or relabeling occurs.

## 40. Clear behavior

`Clear preview` removes only the component-local preview result and returns focus to `Run ephemeral preview`. It does not clear the form, probe-planning scaffold, World, Experiment Runner, or storage.

## 41. Non-persistence boundary

GW9 adds no Atlas preview storage, cookie, IndexedDB, server, saved record, autosave, history, or publication path. Existing bounded World/UI storage is untouched and remains semantically separate. GW9B also cancels remaining cooperative work when the Atlas component unmounts and suppresses post-unmount state updates.

## 42. Reload behavior

Rendered tests run a preview, reload `/atlas`, and verify the route returns to the unsampled idle state with no result and no new storage entry.

## 43. Accessibility considerations

The route keeps one H1 and one shared main. The preview uses one semantic form, labelled controls, fieldsets/legends, descriptions, `aria-invalid`, a focused error summary, restrained live progress, semantic tables, row/column headers, text failures, and color-independent values.

## 44. Keyboard and focus behavior

Validation focuses the summary. The replacement alert dialog supports Tab/Shift+Tab cycling, Escape, blocked background editing, initial action focus, and trigger focus return. Matrix scrolling is keyboard reachable; clear returns focus to the run action; progress updates do not steal focus.

## 45. Responsive behavior

Rendered coverage exercises `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`. Forms wrap, actions remain reachable, matrices scroll internally, and no page-level horizontal overflow was found. This is not a mobile-workflow-readiness claim.

## 46. Short-height behavior

The `1280x600` checks cover configuration, execution/cancellation, numeric results, internal matrix scrolling, reachable controls, and visible focused elements without fixed-shell occlusion.

## 47. Browser zoom status

Actual browser zoom at 125%, 150%, and 200% was not verified.

## 48. Reduced-motion behavior

The reduced-motion browser path executes a two-axis request and exposes the same numeric matrix without required animation. No completion celebration, pulse, continuous sampling animation, or transition-dependent focus exists.

## 49. Axe results

Axe is exercised in default, invalid, running, cancelling, completed one-axis, completed two-axis, completed-with-errors, stale, replacement-dialog, and expanded-provenance states. All covered scans passed with zero unexpected violations; focused Playwright passed 50 tests and the full UI harness passed 65.

## 50. Diagnostics

Rendered tests observe console errors, page errors, hydration failures, and critical request/asset failures. The representative manual Chromium run completed a real four-point Flocking preview without those diagnostics, and both final rendered suites remained clean.

## 51. Performance-smoke result

`npm run perf:simulation` includes a two-point, one-seed, five-tick executor smoke after the existing benchmarks. The final run completed both samples (10 work units) in 26.53 ms on this machine. Elapsed time is diagnostic only and explicitly not a scalability estimate.

## 52. Persistence search

The required storage-API search finds pre-existing World/UI persistence and guardrail text, but no storage access in `src/simulation/atlasPreview` or `src/components/atlas/EphemeralLandscapePreview.tsx`. GW9 adds no storage key.

## 53. Determinism search

The required random/time search finds pre-existing UI/export/performance uses elsewhere. The GW9 deterministic executor/request/result path contains no `Date.now`, `performance.now`, `Math.random`, random UUID, Nano ID, or time-derived seed. Performance timing exists only in the non-semantic performance report.

## 54. Scope-creep search

Matches classify as pre-existing implemented behavior, guardrails, future/non-implementation language, GW9 negative boundary copy, or negative tests. No unexpected GW9 persistence, queue, worker, interpolation, regime, confidence, recommendation, personalization, Builder execution, World mutation, or publication path was found.

## 55. Production files changed

GW9 adds `src/simulation/atlasPreview/*`, `src/simulation/runs/engineFromRunConfig.ts`, and `src/components/atlas/EphemeralLandscapePreview.tsx`; it integrates them through simulation exports, `/atlas`, route/foundation/capability sources, CSS, and the simulation performance report. The uncertainty runner now uses the shared engine factory without changing its contract.

## 56. Test files changed

`src/simulation/__tests__/atlasPreview.test.ts` adds headless coverage. Atlas/foundation/guidance/route/roadmap source tests and `tests/ui/research-world-shell.spec.ts` cover the new claims and rendered states.

## 57. Documentation files changed

This record plus README, roadmaps, concepts, Research World progression, Atlas/landscape/probe/progressive-disclosure/HCI/workspace/capability records, Codex context/log, `AGENTS.md`, and `src/simulation/README.md` are updated to make GW9 current and GW9B next.

## 58. Verification commands

Final verification passed: focused Playwright `50 passed`; full UI Playwright `65 passed`; typecheck passed; unit tests `70 files / 581 tests` passed; production build passed; simulation and preview performance smoke passed; and `git diff --check` passed. `npm run lint: unavailable, package.json has no lint script.`

## 59. Remaining limitations

Only one template and one bundled scenario are supported. Sampling is sequential on the main browser thread, cancellation occurs only between samples, the work cap is a safety limit rather than benchmark proof, probe plans cannot map safely, results are temporary, and actual browser zoom, screen readers, assistive technology, forced colors, mobile workflow, user comprehension, and WCAG conformance remain unverified.

## 60. GW9B audit

GW9B audits and hardens this implementation in `EPHEMERAL_LANDSCAPE_SAMPLING_PREVIEW_V1_AUDIT.md`. It fixes canonical seed/fixed ordering, unmount cancellation, provenance completeness, replacement/error semantics, and exact epistemic copy without inferring persistence, broader template support, plan execution, interpolation, regime detection, validation, or scientific readiness.

## 61. Final decision

GW9B finds the bounded implementation ready for the next documented roadmap milestone after commit publication. It remains deterministic, isolated, non-persistent, exact-coordinate only, and explicit about its epistemic limits. Actual browser zoom and assistive-technology gaps remain documented limitations.

GW9 complete.

GW9B complete. The next documented roadmap milestone is F1: Fractal Metrics V1, not started here.
