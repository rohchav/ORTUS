# World Layout and Interaction Reclaim Audit

Date: 2026-07-27

## 1. Scope

R2B independently audited and hardened the completed R2 `/world` shell. It covered layout, stage dominance and stability, task and browser history, Setup draft semantics, metric and intervention hierarchy, comparisons, model reference completeness, expert-tool lifecycle, responsive behavior, accessibility, diagnostics, runtime integrity, and persistence integrity. It did not add starter content, simulation rules, template capabilities, routes, storage families, dependencies, or C1 behavior.

## 2. Starting commit

The audit started on `main` at `7f5c51d` (`feat: reclaim world layout and interaction`). `HEAD` and `origin/main` matched, and the worktree was clean after `git fetch origin`.

## 3. Baseline

Before production edits, the focused destination-shell suite passed `53` tests in `6.6m`; the full rendered suite passed `110` tests in `11.3m`; unit verification passed `75` files and `610` tests in `87.95s`; typecheck, build, performance smoke, Atlas smoke, and `git diff --check` passed. Lint was unavailable because `package.json` has no lint script.

## 4. Audit roles

The review combined ABM and complex-systems scrutiny, computational social-science and cognitive-modeling boundaries, simulation and algorithm engineering, architecture, HCI, validation/calibration risk, safety/ethics, and product engineering. The standard was functional and epistemic honesty, not visual polish alone.

## 5. Source inventory

The audit traced the World route, `AppShell`, persistent stage and playback, task rail, Setup/Observe/Change/Compare/Explain surfaces, More tools, dialogs, Zustand UI orchestration, comparison storage, experiment cancellation, system presentation metadata, template documentation, all seven renderers, CSS layout contracts, and existing source/rendered tests.

## 6. Rendered inventory

Rendered checks covered the complete shell, context bar, stage, playback, task navigation, active tool, Setup summary and exact parameters, Observe summary and full metrics, Change targeting and feedback, Compare empty/saved/corrupt states, Explain summary and full reference, More, Experiment Runner, Diagnostics, collapse/restore, dialogs, and responsive variants.

## 7. Templates audited

The seven production templates were Epidemic Spread, Opinion Dynamics, Predator-Prey, Schelling Segregation, Flocking / Boids, Forest Fire / Landscape Spread, and Neural Excitation Network. Each stage rendered nonblank; each full reference exposes model-output metrics with explicit non-empirical language.

## 8. Tasks audited

Direct tasks were Setup, Observe, Change, Compare, and Explain. More exposed Experiments under Investigate and Diagnostics under Inspect. Browser history, keyboard entry, focus transfer, scroll reset, stage persistence, and run-state preservation were checked across task transitions.

## 9. States audited

States included initial paused, stepped, running, paused after progress, parameter draft pending, parameter draft applied, seed draft pending, seed applied, valid and target-blocked interventions, empty and populated comparisons, corrupt comparison storage, closed and open dialogs, collapsed and restored tools, running and abandoned experiment sweeps, invalid task query, reduced motion, short height, and mobile.

## 10. Viewports audited

Rendered Chromium audit sizes were `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844`.

## 11. Workspace-frame findings

The R2 three-part desktop frame is sound: a compact task rail, a flexible stage/playback region, and one bounded active-tool surface. Mobile preserves stage-first order, then playback, horizontal tasks, and the bounded tool. No document-width overflow was measured.

## 12. Stage dimensions

Measured stage sizes were `994x730`, `834x550`, `624x598`, `500x530`, `834x444.453`, and `374x335.453` at the six viewports in audit order. Playback remained directly below the stage.

## 13. Stage dominance

The stage remains the largest working surface at every desktop width and remains the first substantial interactive surface on mobile. The tool rail does not displace or remount it.

## 14. Stage persistence

A DOM mount sentinel and tick state survived direct task transitions, More transitions, collapse/restore, and browser Back/Forward. R2B replaced task-query rewriting with same-document history entries and popstate synchronization.

## 15. Stage stability

Stage width and height remained stable within one pixel while switching among all World tasks for representative Flocking, Epidemic, and Neural runs. Tool content length did not change stage geometry.

## 16. Context-bar findings

World, template, scenario context, run status, tick, and seed stayed synchronized with the active engine. Setup drafts do not falsely appear as active values. Applying a seed rebuild updates the active-run status explicitly.

## 17. Task-navigation findings

The direct order and More grouping are coherent. Invalid `task` values now canonicalize to Setup; `intervene` canonicalizes to public `change`; task clicks create history entries; Back/Forward restores task state without leaving `/world` or resetting the run.

## 18. Tool-surface findings

One intentional active-tool scroll owns long configuration content. Task changes reset that scroll. Setup remains mounted but hidden to preserve local drafts; tick-heavy surfaces remain inactive or unmounted when they are not the visible task.

## 19. Collapse and restore findings

Focus World expands the stage and hides the tool without discarding Setup subview, search, or draft state. Show tools remains visible and returns focus to the task heading. Hiding an active experiment requests cancellation.

## 20. Setup findings

Setup still exposes the current authoritative template, seed, four high-value controls, starting recipes, every exact parameter, and Neural Runtime Lab access where applicable. Template switching remains an immediate destructive trajectory replacement and now says so beside the selector.

## 21. Quick-control findings

Quick controls are derived from authoritative system metadata. R2B fixed the renderer so `includeKeys` order is honored, including Flocking alignment/cohesion/separation/perception and Neural threshold/decay/stimulus/connection order.

## 22. Active-versus-draft findings

R2's immediate parameter rebuild was a P1 honesty defect. Parameter and seed inputs now edit local Setup drafts. Every parameter row shows the exact active-run value beside the edited draft state. Pending status names how many parameter drafts differ; seed status distinguishes its draft from the active run; task changes, collapse, and seed-only rebuilds preserve unrelated parameter drafts.

## 23. Rebuild-semantics findings

Parameter drafts require an explicit `Rebuild run with parameter drafts` action. Seed drafts require `Apply Seed`. Blur no longer rebuilds. Applying either path creates the established fresh paused tick-0 engine; unsupported parameter combinations still pass through the authoritative template validator before replacement.

## 24. All Parameters findings

All template parameter definitions remain inspectable and searchable. The full view uses the same draft object and explicit rebuild action as Quick Setup, so there is no split active value or shadow default.

## 25. Observe findings

Observe still prioritizes two to four meaningful existing outputs, bounded history, selected-model guidance, and access to all exact metrics and the visual key. No new metric or measurement process was invented.

## 26. Metric-hierarchy findings

Primary metric ordering remains metadata-driven. Copy consistently describes traces as model output over simulated ticks, not empirical measurement or validation evidence.

## 27. Change findings

Change clearly separates current-run, engine-checked template interventions from Setup changes that rebuild a fresh run. Target requirements and disabled states remain visible.

## 28. Intervention findings

Supported interventions still pass through existing template definitions and the headless executor. Feedback reports the applied change and tick without claiming real-world effectiveness, validation, or causal proof.

## 29. Compare findings

Compare leads with the current run, then bounded capture, saved local summaries, and differences. Scenario/snapshot exchange remains subordinate. Empty, populated, and malformed-storage states were rendered.

## 30. Comparison-storage findings

The existing `ortus.runComparison.v1` key, schema, cap, and local-summary scope are unchanged. A previously hidden load warning is now visible in Compare, invalid records are not loaded as evidence, and an explicit user action can discard the stored library. No automatic destructive recovery was introduced.

## 31. Explain findings

The default Explain surface retains exactly six concise, model-specific sections: Question, How it works, What to watch, Try changing, Key assumptions, and Main limitation.

## 32. Full-reference findings

Every template reference now includes a `Model-output metrics` section populated from registered metric definitions. It states that outputs are not empirical observations, calibrated estimates, or validation evidence. The modal traps Tab and Shift+Tab, supports Escape, returns focus, and unmounts live children while closed.

## 33. More findings

More remains a two-group keyboard menu rather than a miscellaneous drawer: Experiments under Investigate and Diagnostics under Inspect. Arrow, Home, End, Escape, and focus return remain deterministic.

## 34. Experiment Runner findings

The existing bounded local sweep remains functional and unchanged in simulation meaning. R2B adds UI lifecycle protection: task exit, collapse, or unmount requests cancellation, suppresses hidden progress updates, and permanently marks that invocation abandoned so immediate restore cannot publish its result. Cancellation remains cooperative between runs and does not interrupt one synchronous engine run mid-run.

## 35. Diagnostics findings

Diagnostics remains directly reachable and inactive when hidden. It continues to expose exact runtime counters and instrumentation without modifying model state.

## 36. Playback findings

Run, Pause, Step, staged destructive Reset, tick/time readouts, and speed remain outside the scrolling tool surface and visible across tasks. Setup draft edits no longer pause or reset playback before explicit apply.

## 37. Stage-renderer findings

All seven Canvas renderers produced nontransparent, multi-color pixels and legible model-specific stages. R2B found no renderer implementation defect and made no renderer or simulation change.

## 38. Scroll-ownership findings

Desktop and mobile have one intentional vertical scroll region inside the active tool, plus a dedicated dialog-body scroll when a modal is open. The document itself did not become a fallback workspace scroller.

## 39. Responsive findings

All six required sizes retained coherent regions, no horizontal overflow, no fixed-header overlap, and reachable playback/tasks/tools. The new draft action fits the tool width; inactive rebuild buttons are omitted to avoid needless default density.

## 40. Short-height findings

At `1280x600`, the stage remained `834x444.453`, playback stayed visible, and pending draft rebuild plus seed controls remained reachable in the bounded tool scroll.

## 41. Mobile-smoke findings

At `390x844`, the document matched the viewport, the stage remained `374x335.453`, playback was `374x88.547`, tasks were `374x50`, and the tool was `374x210.609`. Deeper Setup content remained reachable through the tool's intentional scroll.

## 42. Browser-zoom status

Chromium keyboard zoom was attempted at the nominal 125%, 150%, and 200% steps, but headless Chromium reported unchanged viewport, device-pixel ratio, visual scale, stage geometry, and overflow. Actual browser zoom at 125%, 150%, and 200% was not verified.

## 43. Accessibility findings

Landmarks, labels, task state, dialog naming, visible focus, and reachable controls were retained. Automated Axe checks cover representative tasks and open dialogs. This is not screen-reader, assistive-technology, forced-colors, complete touch-workflow, WCAG-conformance, or user-comprehension evidence.

## 44. Keyboard and focus findings

Task navigation, More, panel entry, collapse/restore, subview return, modal containment, Escape, and focus return were exercised. The baseline modal allowed focus to escape to `body`; R2B added an explicit edge trap and repeated forward/reverse Tab assertions.

## 45. Reduced-motion findings

Reduced-motion emulation preserved task changes, playback, dialogs, Escape return, collapse/restore, and tick state. R2B added no motion-dependent control.

## 46. Axe findings

Representative Setup, Observe, Change, Compare, Explain, full-reference, and run-details states remained free of automated Axe violations in the rendered suite. Axe does not establish full accessibility conformance.

## 47. Diagnostic findings

The audit instrumentation recorded no unexpected console error, page error, hydration mismatch, or failed critical document/script/style/font/image request in the checked states.

## 48. Runtime-integrity findings

No production file under `src/simulation` changed. Scheduling, deterministic RNG, engine stepping, templates, scenarios, metrics, intervention execution, snapshots, comparison calculations, registry support, Atlas sampling, and Builder execution boundaries are unchanged.

## 49. Persistence findings

No storage key, schema, cap, persistence destination, or automatic save behavior was added. Setup drafts and warning state are component/store memory only. Existing World comparisons remain bounded local summaries, not Lab evidence or Atlas discoveries.

## 50. P0 defects

None found.

## 51. P1 defects

Three were found and fixed: Setup's active-versus-draft boundary applied edits early, omitted exact active values, and could discard unrelated drafts; task changes replaced one URL entry so Back left World; modal Tab focus could escape to the document body.

## 52. P2 defects

Five defect families were found and fixed: quick-control metadata order was ignored; closed run-details content retained a tick subscription; abandoned experiments lacked irreversible lifecycle cancellation; full references omitted explicit metric inventory; malformed comparison storage warnings were invisible in Compare.

## 53. P3 defects

None recorded.

## 54. Defects fixed

All R2B P1 and P2 defects were fixed without broadening runtime support. The default no-draft action density discovered during hardening was also reduced before final verification.

## 55. Production files changed

Production changes are limited to World UI orchestration/components, the shared modal, CSS, the UI seed helper, and Zustand UI state: `AppShell`, `LeftInstrumentStack`, `RunSettingsPanel`, `ParameterPanel`, `ExperimentPanel`, `RunComparisonPanel`, `ModelExplanationPanel`, `ModalSurface`, `globals.css`, `uiSeed.ts`, and `simulationStore.ts`.

## 56. Test files changed

Rendered and source contracts were strengthened in the R2 World suite, Start Hub/World reset suite, World layout contracts, workspace information-architecture contracts, product-reset roadmap contracts, and canonical roadmap contracts. Assertions were not weakened to hide failures.

## 57. Documentation files changed

R2B updates this audit, the R2 and R1B records, README, canonical and product roadmaps, HCI and workspace-IA records, Codex current context/session log, and durable AGENTS guardrails.

## 58. Remaining limitations

No participant study, actual browser-zoom verification, screen-reader/assistive-technology test, forced-colors audit, complete touch workflow, complete WCAG audit, or user-comprehension study was performed. Experiment cancellation remains cooperative between bounded runs. Simulation output remains model output, not empirical truth.

## 59. C1 readiness

No blocking shell defect remains for source-backed starter-content architecture. C1 may build only over implemented template behavior and must not turn model outputs into empirical claims, add hidden defaults, or imply generic schema/Builder execution.

## 60. Final decision

Conditionally ready for `C1: Starter World Content Framework`. The conditions are the explicitly unverified external accessibility/zoom/comprehension areas above, not an unresolved World P0/P1 defect.

Final verification passed `29` dedicated R2/R2B browser tests in `2.8m`, `53` focused destination-shell tests in `6.3m`, and the complete `115`-test UI suite in `12.1m`, without retries or skips. Typecheck passed in `2.12s`; unit tests passed `75` files / `610` tests in `75.46s`; the production build passed in `30.59s`; performance smoke passed in `12.86s`; and `git diff --check` passed. `npm run lint: unavailable, package.json has no lint script.`
