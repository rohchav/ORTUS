# Ephemeral Landscape Sampling Preview V1 Audit

Status: Prompt GW9B audit and bounded hardening record.

## 1. Scope

GW9B audits the GW9 Flocking-only, exact-coordinate, component-memory preview. It does not add template support, probe-plan execution, persistence, interpolation, regime detection, scientific interpretation, parallel execution, queues, or the next roadmap milestone.

## 2. Starting commit

The audit started from clean, aligned `main` and `origin/main` at `67e2692` (`feat: add ephemeral landscape sampling preview`). The GW9 commit changed 49 files with 4,333 insertions and 179 deletions; no package, dependency, asset, font, icon, or route was added.

## 3. Routes and states audited

Rendered review covered `/atlas` in unsampled, configured, invalid, running, cancelling, completed, completed-with-errors, failed, cancelled, stale, replacement-dialog, cleared, remounted, and reloaded states. `/` was checked before and after Atlas execution for World and Experiment Runner isolation; `/builder` and `/lab` boundaries were checked through source, registry, shell, and full-suite evidence.

## 4. Viewports audited

Automated coverage used `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`. A completed two-axis result was also visually inspected at `900x700`.

## 5. Baseline results

Before hardening, focused Playwright passed 50 tests, the full UI harness passed 65, typecheck passed, 581 unit tests passed, build passed, simulation performance passed, and `git diff --check` passed. The baseline preview smoke completed 2 points, 2 runs, tick 5, and 10 work units in 24.65 ms on this machine. Lint was unavailable because `package.json` has no lint script.

## 6. GW9 commit/source audit

GW9 is a bounded runtime feature, not a structural artifact pretending to execute. Its executor invokes the production Flocking template through validated RunConfigs and fresh engines. The source audit found no generic Atlas runtime, hidden probe-plan interpreter, schema interpreter, Builder execution, persistence, or scientific-readiness claim.

## 7. Shared engine-factory findings

`createEngineFromRunConfig` is a direct extraction of the former uncertainty-runner factory. It validates the RunConfig, resolves only the production template registry, creates a new `SimulationEngine`, and does not retain or mutate the input. Tests prove distinct tick-0 engines and equivalent initial snapshots for the same config. The uncertainty runner changed factory location, not contract.

## 8. Support-descriptor findings

The allowlist contains only `flocking-boids`, template version `1.0.0`, one bundled validated random-headings scenario, five bounded numeric parameters, and three numeric runtime metrics. Parameter types and ranges remain within authoritative template definitions. Numeric fields on other templates do not become supported by inference.

## 9. Request-validation findings

Strict Zod schemas reject unknown top-level and nested keys. Validation rebuilds the canonical request from supported identity fields and rejects forged schema/artifact/capability versions, template, scenario, parameter type or bounds, generated values, counts, seeds, tick horizon, metric, observation mode, fixed values, work fields, axis/fixed conflicts, and prototype-like keys before engine construction.

## 10. Canonicalization findings

Axes use inclusive deterministic generation and eight-decimal numeric normalization with negative zero mapped to zero. Fixed-parameter keys are now sorted. Unique seeds are now normalized and sorted numerically, so reordered equivalent seed sets produce the same request, plans, and aggregate order.

## 11. One-axis findings

One-axis generation is inclusive, bounded to two through five points, deterministic, and represented as X values with seed runs nested inside each point. Only attempted coordinates enter results.

## 12. Two-axis findings

Two-axis generation uses distinct parameters and deterministic Cartesian ordering with Y outermost and X inside each row. Rendered headers prove X columns `0.2, 0.5, 0.8` and Y rows `0.1, 0.7`; the matrix is not transposed.

## 13. Integer-axis findings

Integer endpoints must be integers. Intermediate values use documented `Math.round` behavior; `20..23` at three points becomes `20, 22, 23`. Ranges that collapse to duplicate canonical integers are rejected rather than silently deduplicated.

## 14. Fixed-parameter findings

Fixed values come only from the validated bundled scenario after axis fields are removed. They are copied into each RunConfig, sorted canonically in the request, and not mutated. Forged fixed values and fixed/axis conflicts are rejected.

## 15. Seed findings

Requests require one through three unique signed 32-bit integers. Boundary values are accepted; empty, duplicate, fractional, non-finite, excessive, and out-of-range lists are rejected. Seed order is canonical ascending order, not execution-order input metadata. Multiple deterministic seeds do not establish statistical confidence.

## 16. Tick-horizon findings

The horizon must be an integer from 1 through 250. Each engine starts at tick 0, receives exactly `N` steps once, must end at `N`, and must expose a final metric record at `N`. Both engine-clock and metric-record `N-1`/`N+1` cases fail explicitly.

## 17. Work-budget findings

Work is exactly `grid points x seeds x tick horizon`, with independent limits of 25 points, 3 seeds, 250 ticks, and 5,000 units. Exactly 5,000 is accepted. A forged 5,001 estimate is rejected, and the first representable 25-point overage, 5,025, is rejected without truncation or automatic reduction.

## 18. RunConfig-assembly findings

Every plan contains deterministic point/run IDs, exact canonical seed, copied fixed values, exact axis overrides, synchronized agent composition for the integer `agentCount` axis, scenario initialization, behavior mode, and Atlas-only metadata. Every config passes the authoritative RunConfig/template validator.

## 19. Isolated-execution findings

Each sample constructs a fresh engine and runs sequentially. No active World engine is reused. Result objects contain plain request, point, run, error, warning, cancellation, and aggregate data; they contain no engine or snapshot reference.

## 20. World-isolation findings

Rendered tests compare World template, seed, current context, run status, and storage before and after Atlas execution. They remain unchanged. Static imports confirm no simulation-store dependency in the preview path.

## 21. Experiment Runner isolation findings

Experiment controls and the absence of an experiment result table are captured before Atlas execution and remain identical afterward. GW9 does not call the Experiment Runner or comparison library. Sharing the headless engine factory does not share UI state.

## 22. Builder/Lab/registry isolation findings

The executor has no Builder or Lab store dependency. Real execution leaves the capability descriptor, scenario, template object identity, parameter definitions, metric definitions, and production registry unchanged. No Lab record or Builder artifact is created.

## 23. Metric-semantics findings

Only explicitly declared numeric runtime metrics are selectable. `alignmentScore`, `dispersion`, and `averageSpeed` were observed as finite values at the exact requested tick in real engines. These values are model outputs, not empirical measurements or scientific validation.

## 24. Determinism findings

Equivalent canonical requests produce equivalent plans and result data for the same engine version. Identity is based on request data, deterministic IDs, seeded engines, and ordered arithmetic, not timestamps, random UUIDs, or wall-clock duration.

## 25. Lifecycle findings

Rendered coverage exercises idle/unsampled, configured, invalid, running, cancelling, completed, completed-with-errors, failed, cancelled, stale, replacement, clear, route unmount, and reload. Invalid requests do not start. Existing results require explicit replacement confirmation.

## 26. Progress findings

Progress begins at zero, reports terminal attempted runs monotonically, separates successful and failed counts, and ends in `complete`, `cancelled`, or `failed`. It does not report tick-level pseudo-progress or count unstarted work as complete.

## 27. Cancellation findings

Cancellation is cooperative between samples. The current sample may finish; later samples remain unstarted and absent from the matrix. Repeated cancellation is disabled. Component unmount now marks the active signal cancelled and suppresses post-unmount state updates.

## 28. Sample-failure findings

Engine-construction failures, tick failures, missing metric records, non-numeric values, `NaN`, and infinities become explicit per-run failures. Later samples continue. Failed values remain null and are never fabricated as zero.

## 29. Fatal-failure findings

A cooperative-yield failure produces a `failed` result with completed-run provenance, a bounded technical error, and all remaining runs unstarted. A pre-result executor rejection renders an accessible failed status and permits explicit retry after the fault is removed.

## 30. Aggregation findings

Successful per-seed values retain exact run provenance and use deterministic compensated summation for mean plus explicit minimum and maximum. Mixed outcomes are partial; points with no success have null aggregates. No interpolation or unsampled aggregate is generated.

## 31. One-axis presentation findings

The semantic table exposes exact X row headers, mean, minimum, maximum, successful/planned seeds, failed runs, and textual point status in a labelled focusable region.

## 32. Two-axis presentation findings

The semantic matrix uses X column headers and Y row headers, exact numeric cell values, textual status, and success/failure counts. It has an internal labelled focusable scroll region and no inferred cells.

## 33. Color/legend findings

Color is supplementary. Sampled, partial, failed, cancelled, stale, and operational states have visible text. GW9 deliberately has no heatmap, contour, confidence legend, or color-only regime encoding.

## 34. Provenance findings

The disclosure now includes request artifact and schema version, preview capability version, template/scenario identity and template version, exact axes, sorted fixed values, canonical seeds, horizon, metric and unit, final-tick observation, work, planned points/runs, attempted/successful/failed counts, cancellation, and result status. No separate engine version exists beyond the runtime template version.

## 35. Stale-result findings

Changing configuration keeps the prior result visible, marks it stale, and keeps its original request/provenance. It does not relabel old output as current or rerun automatically.

## 36. Clear-result findings

Clear removes only the current component-memory preview, resets progress, and returns focus to Run. It does not touch World, Experiment Runner, probe plans, comparison data, or storage.

## 37. Replacement-run findings

Replacement requires a modal alert dialog with Escape, focus cycling, focus return on cancel, and explicit destructive scope. The copy now identifies whether the discarded preview is current or stale. Confirm starts only the newly validated request.

## 38. Probe-plan non-execution findings

The current conceptual probe plan is explicitly `not-mappable`. Its fields are neither copied nor silently ignored, and conversion throws. No plan node, question, or comparison descriptor is executed.

## 39. Non-persistence findings

The preview path has no localStorage, sessionStorage, IndexedDB, cookie, network, database, autosave, saved map, publication, or history code. Storage keys and values remain unchanged in rendered tests.

## 40. Reload-during-execution findings

Rendered coverage starts bounded work, reloads while the executor is between samples, and verifies a fresh unsampled Atlas state with no result and no new storage. Client-side navigation likewise stops further metric observations once unmount completes.

## 41. Resource-release findings

Executor locals release each engine reference after observation/failure; result identity scans find no retained engine. The component cleanup cancels remaining cooperative work. No snapshots, workers, intervals, queues, or subscriptions are created by GW9.

## 42. Performance findings

The documented smoke is 2 points, 2 runs, tick 5, and 10 work units. The final audit run completed in 28.07 ms on this machine. This is a regression smoke, not evidence of browser scalability or scientific adequacy.

## 43. Configuration-UI findings

The form exposes only the allowlisted template/scenario, supported axes, one optional Y axis, one through three explicit seeds, bounded horizon, and supported metric. It displays the exact estimate before an explicit Run action. No control implies discovery, confidence, save, publish, or generic probe execution.

## 44. Accessibility findings

Native labels, fieldsets, legends, tables, disclosures, status text, and dialog semantics are present. Invalid controls now reference the visible error summary through `aria-errormessage`. This is automated accessibility evidence, not assistive-technology certification or WCAG conformance.

## 45. Keyboard/focus findings

Validation focuses the error summary; result regions are keyboard-focusable; replacement traps focus, supports Escape, and returns focus; clear returns focus to Run. Focus remained visible across the audited viewport matrix.

## 46. Responsive findings

All five required viewports rendered without document-level horizontal overflow. The matrix contains horizontal overflow inside its labelled region when needed. Configuration and result text remained readable without incoherent overlap.

## 47. Short-height findings

`1280x600` and `900x700` states preserve access to controls and results through page flow and local table scrolling. The small bottom-left marker seen in dev screenshots was the Next.js development portal, not product UI.

## 48. Browser zoom status

Headless Chromium received Ctrl-plus attempts corresponding to 125%, 150%, and 200%, but device pixel ratio, inner width, visual viewport scale, and visual viewport width did not change. Actual browser zoom at 125%, 150%, and 200% was not verified.

## 49. Reduced-motion findings

The completed two-axis path remains usable under `prefers-reduced-motion: reduce`; the result subtree reported no active CSS animation. Core meaning does not depend on motion.

## 50. Axe findings

Automated Axe scans cover default, invalid, running, cancelling, completed one-axis, completed two-axis, completed-with-errors, failed, cancelled, stale, replacement, provenance, and reduced-motion states with no unexpected violations.

## 51. Console/page/asset/hydration findings

Final rendered tests record no unexpected console errors, page errors, critical asset failures, bad critical responses, or hydration mismatches. Two intermediate runs reused a stale Next.js server from before the audit and stalled in the World placeholder; terminating only that stale process restored clean current-tree runs. This was an environment issue, not a product fix.

## 52. No-fake-functionality findings

The UI exposes Run, cancel-after-current-sample, clear, inspect, and replace only. It exposes no save/publish, complete-landscape, regime/transition/tipping-point detection, confidence, recommendation, AI interpretation, or real-world validation action. Required exact-coordinate, seed-confidence, and model-vs-world boundaries are visible.

## 53. Scope-creep search findings

The required repository-wide search produced pre-existing implemented storage/performance behavior, structural primitive vocabulary, guardrail/future language, GW9 negative boundaries, and negative tests. The GW9-targeted search found no unexpected persistence, queue, worker, interpolation, regime, confidence, personalization, Builder execution, World mutation, random identity, or publication path.

## 54. Defects found

Seven bounded defects were demonstrated: order-sensitive seed canonicalization; non-explicit fixed-key ordering; no unmount cancellation/state guard; incomplete provenance counts/versions; replacement copy that did not distinguish stale/current output; invalid fields without an explicit ARIA error association; and required epistemic limits conveyed without the exact audit wording.

## 55. Defects fixed

Seeds and fixed keys are canonicalized; active work cancels on unmount; post-unmount updates are suppressed; provenance is complete for available fields; replacement scope names stale/current state; invalid fields reference the summary; and exact seed-confidence/model-vs-world language is visible. No capability was broadened.

## 56. Production files changed

- `src/simulation/atlasPreview/request.ts`
- `src/components/atlas/EphemeralLandscapePreview.tsx`

## 57. Test files changed

- `src/simulation/__tests__/atlasPreview.test.ts`
- `tests/ui/research-world-shell.spec.ts`

## 58. Documentation files changed

This audit, the GW9 implementation record, roadmap/status sources, Atlas/landscape/probe/workspace/capability/HCI records, README files, and durable Codex context/log receive concise GW9B status updates. No product-philosophy or AGENTS guardrail change was necessary.

## 59. Verification commands

Final verification: focused Playwright `53 passed`; full UI Playwright `68 passed`; typecheck passed; unit tests `70 files / 590 tests` passed; production build passed with `/atlas` statically generated; simulation performance passed; the preview smoke completed 2 runs and 10 work units in 28.07 ms; and `git diff --check` passed. `npm run lint: unavailable, package.json has no lint script.`

## 60. Remaining limitations

GW9 still supports one template, one scenario, at most two axes, at most 25 points, at most three seeds, one final-tick metric, sequential local execution, and component-memory results. It has no general probe execution, saved research records, interpolation, regime detection, uncertainty calibration, statistical confidence, validation, screen-reader study, forced-colors audit, real browser-zoom evidence, mobile workflow study, or scalability claim.

## 61. Next-roadmap-milestone readiness decision

Ready for the next documented roadmap milestone after commit publication. The existing F0 branch names `F1: Fractal Metrics V1` next. F1 is not started by GW9B and must preserve its own measurement, estimator, scale-range, uncertainty, and audit boundaries.

## 62. Publication boundary

GW9B may be committed locally with the required audit commit message after every final gate passes. This prompt does not push. Until the commit exists, roadmap wording treats readiness as contingent on commit publication.

## 63. Final decision

GW9B complete. The next documented roadmap milestone is ready after commit publication. GW9 remains a narrow, tested runtime preview and does not justify a claim that ORTUS has a complete behavioral-landscape system or validated scientific result.
