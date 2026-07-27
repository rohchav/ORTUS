# First-Run And World-First Shell Audit

Date: 2026-07-19
Prompt: R1B
Historical decision: Conditionally ready for R2: World Layout and Interaction Reclaim
Current handoff: R2 and R2B are complete; C1 Starter World Content Framework is next

## 1. Scope

R1B audited the rendered R1 product reset as a first-time sandbox flow, not as a route or selector inventory. It covered entry, starter launch, first execution, first parameter change, model explanation, deeper-tool reachability, recovery, responsive layout, keyboard/focus behavior, accessibility automation, diagnostics, runtime isolation, and persistence boundaries.

R1B changed only shell presentation and UI state coordination. It did not implement R2, new runtime content, starter packs, Guided Investigation, Recipe-First Builder, persistence, analytics, or new dependencies.

## 2. Starting commit

- Branch: `main`.
- Starting `HEAD`: `d2af908 feat: reset ORTUS start and world-first experience`.
- Starting `origin/main`: `d2af908` after `git fetch origin`.
- Starting worktree: clean.

## 3. Baseline

- Focused `research-world-shell.spec.ts`: one run failed at the Research tools rapid Arrow Down flow after `43` passes; `9` tests did not run. Three isolated repetitions produced two passes and one failure, confirming a timing-sensitive focus defect rather than a deterministic product failure.
- Full UI Playwright: `80 passed` on the untouched baseline.
- Typecheck: passed.
- Unit tests: `72 files / 599 tests` passed.
- Production build: passed.
- Simulation performance smoke: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

## 4. Routes audited

- Start `/`.
- World `/world`, including Setup, Understand, Observe, Change, Compare, Experiments, Diagnostics, paused, running, starter, direct-query, Back, reload, and repeat-launch states.
- Workshop `/builder`, including default Guided entry and direct Advanced access.
- Atlas `/atlas`, including default, invalid request, running, cancellation, result, replacement, stale, clear, and reload states through the existing suite.
- Lab `/lab` default and technical disclosure states.

## 5. Viewports audited

Rendered inspection covered `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844` where required. Start, World Setup, World Understand, World running, Workshop, Atlas, Lab, Start mobile, and World mobile were captured before and after hardening in uncommitted `/tmp` evidence.

## 6. Audit roles

The review used seven lenses: first-time sandbox user, interaction/information-architecture designer, game-onboarding designer, scientific-software UX designer, accessibility reviewer, experienced ORTUS user seeking direct access, and frontend engineer responsible for layout integrity.

This was an expert audit with automated browser evidence. It was not a participant study and does not validate usability or comprehension.

## 7. First-run Task A findings

Final rating: **Pass**.

The first viewport identifies ORTUS as an interactive complex-systems sandbox, gives one dominant Flocking starter, exposes its concrete question and change, and leaves alternative pathways visible. A person can reach a running model with one choice and two activations: open the featured starter, then choose Run. No scrolling or route-taxonomy knowledge is required.

## 8. First-change Task B findings

Baseline rating: **Serious friction**. Final rating: **Pass** for the audited flow.

The suggested change and Alignment weight control were visible without opening All parameters, but the baseline did not explain that any key-parameter change immediately discarded the current trajectory and rebuilt a paused tick-0 run. The final Setup surface states that behavior beside the controls, labels numeric controls `Fresh-run rebuild`, and distinguishes the two template-owned `mid-run changes` from setup parameters. A rendered regression verifies run, change, tick-0 pause, and rerun behavior.

## 9. Understanding Task C findings

Final rating: **Friction**, not blocking.

All seven production templates expose six model-specific default sections without opening full notes. The default summary still requires a modest task-panel scroll at `1280x720`; Neural measured `750px` content in a `467px` scroll viewport. Full assumptions, appropriate/inappropriate use, validation record, and provenance remain one disclosure away. Neural's duplicate biological-boundary wording and unrelated Builder limitation were corrected.

## 10. Advanced-tool Task D findings

Final rating: **Pass**.

Workshop is a direct top-level link. Atlas, Lab, Experiments, and Compare runs remain in Research tools. Diagnostics and Understand remain in World More. No advanced route requires opening a novice tutorial or learning an internal artifact id.

## 11. Recovery Task E findings

Baseline rating: **Friction**. Final rating: **Pass** for the covered interactions.

Start remains one action away, browser Back returns coherently, Escape closes both menus and returns focus, disclosures retain surrounding position, and direct task buttons preserve focus. R1B also resets task-panel scroll on task changes and moves focus from a selected More item to the new panel heading instead of `BODY`.

## 12. Heuristic evaluation

| Heuristic | Result |
| --- | --- |
| Visibility of status | Pass after task/query synchronization and explicit rebuild state. |
| Match to user intent | Pass; direct labels remain Setup, Observe, Change, Compare, More. |
| User control and freedom | Pass in covered Back, Escape, disclosure, reset, and task-switch flows. |
| Consistency | Pass after fresh-run terminology and current-navigation correction. |
| Error prevention | Pass for destructive run reset and Atlas request validation; no new runtime path. |
| Recognition over recall | Pass; suggested change and deeper destinations are visible by name. |
| Expert flexibility | Pass; Workshop, Atlas, Lab, Experiments, Compare, and Diagnostics remain direct. |
| Minimalist presentation | Pass with one remaining dense World Setup rail. |
| Error recovery | Pass in covered menu, disclosure, Atlas, and wrong-task flows. |
| Contextual help | Pass; model and route boundaries remain local rather than global walls. |
| Visual hierarchy | Pass; the live model remains the largest World region. |
| Information scent | Pass after Atlas action placement and plain Start pathway copy. |
| Spatial stability | Pass after scroll reset; the model surface does not resize across tasks. |
| Progressive disclosure | Pass; full notes and technical capability references remain available. |
| Immediate feedback | Pass after fresh-run rebuild explanation and paused tick-0 readout. |
| Next-action clarity | Pass for Start and starter World; Lab remains intentionally limited. |

## 13. Start Hub findings

The primary action is fully visible at every required viewport. At `1280x720`, it ends at `y=474`; alternative pathways begin at `y=601`, leaving their first row visibly signposted. At `390x844`, the action ends at `y=670` and pathways begin at `y=687`. Internal template ids are absent from visible catalog copy.

R1B simplified two pathway labels that read like implementation status. It did not add a second hero action, tutorial state, or catalog capability claim.

## 14. Featured-starter launch findings

Direct navigation and reload opened Flocking at tick 0, paused, with Run, the nudge, and Alignment weight visible. The baseline repeat-launch path was wrong: after changing Alignment weight to `0.31`, running to a later tick, returning to Start, and reopening the starter, World resumed the modified running state while the nudge said `Run the baseline`.

The handoff now explicitly rebuilds the existing Flocking template from its authoritative defaults once per starter-page mount. Repeat launch returns Alignment weight to `0.55`, tick to `0`, and status to Paused. No seed algorithm, template rule, scenario, or storage contract changed.

## 15. Navigation findings

Start, World, Workshop, and Research tools remain compact and discoverable. Both popup menus support pointer input, Arrow Up/Down, Home, End, and Escape. Focus requests are now coupled to the rendered menu state instead of competing animation-frame callbacks.

The mobile global header retains the sharp mark and visible ORTUS wordmark. At `390px`, all four navigation controls remain visible with no document horizontal overflow.

## 16. World spatial-hierarchy findings

At `1440x900`, the workspace is `1040x780`, the stage is `1040x718`, and the task rail is `370x780`. At `1280x720`, the workspace is `880x600`, the stage is `880x538`, and the rail is `370x600`. At `1280x600`, the stage remains `880x434` and persistent controls remain fully visible at `y=543-593`.

At `900px` and mobile widths, World stacks model and persistent playback before task configuration. The active task never overtakes the model surface in the audited desktop states.

## 17. Model-surface allocation

- `1440x900`: workspace is `72.2%` of viewport width and `73.2%` of the two-column content width; stage area is about `2.59x` task-rail area.
- `1280x720`: workspace is `68.8%` of viewport width; stage area is about `2.13x` task-rail area.
- `1024x768`: measured stage area remained about `1.53x` task-rail area before the responsive stack threshold.
- `1280x600`: stage area is about `2.10x` task-rail area.

These are rendered geometry measurements, not a claim that the layout has been user-validated.

## 18. Task-navigation findings

Task selection preserves the live World engine and tick. The baseline allowed a query-opened Experiment task to switch visually to Setup while the URL retained `task=experiment`, leaving Research tools current and World not current. Task controls now synchronize the `task` query, current-navigation semantics, and visible task without resetting runtime state.

Direct task controls retain button focus. More selections focus the selected task heading and reset the shared task scroll to its origin.

## 19. Setup findings

Setup exposes current system, starting recipe, seed, two template-owned mid-run changes, and four high-value exact parameters. All parameters and Scenario Builder remain reachable by disclosure. The default panel is still dense and scrollable, but the common controls appear before rare configuration.

No value is duplicated into a second execution path. Parameter changes continue to use the existing validated engine-replacement path.

## 20. Understand findings

Every production template rendered exactly six concise default sections. Full notes retain technical scheduling, additional assumptions/limitations, represented scope, appropriate/inappropriate use, ethics, validation status, and provenance.

Neural now displays one biological-brain boundary in Key assumptions and uses `The model does not include learning or plasticity in V1.` as the main limitation. The Builder-graph boundary remains in full notes where it belongs.

## 21. Guidance-placement findings

World keeps route-level capability guidance in Setup rather than Understand. Workshop, Atlas, and Lab keep compact contextual notes near current work and full technical inventories behind explicit disclosures. No permanent route-wide matrix competes with the primary action.

R1B added no new disclaimer layer.

## 22. Starter-nudge findings

The nudge names four concrete steps, points to a real control and metric, can be dismissed, does not block the model, and has no completion persistence. It remains visible on desktop, short desktop, and mobile.

The repeat-launch correction prevents the nudge from contradicting a resumed running state. Reload and a new starter page session restore the nudge as documented.

## 23. Atlas findings

The baseline source order was correct, but Run sat below the initial viewport because it followed the full configuration form. The same form-owned submit action now appears in the Execution Status panel without changing request validation or execution.

At `1280x720`, Run measures `x=884-1050`, `y=447-483`; it is also fully visible at `1280x600`. Existing validation focus, cancellation, replacement, stale-result, clear, reload, provenance, work-bound, World isolation, and storage tests remain green.

## 24. Lab findings

Lab is honest and sparse. It says persistent evidence records are unavailable, gives useful World, Compare, and Atlas actions first, and leaves technical record semantics behind disclosure. It does not use fake records or repeated cards to manufacture activity.

At `1280x720`, the default Lab route required no scroll.

## 25. Workshop findings

Guided and Advanced remain immediate choices. The first viewport contains no premature validation errors, and Advanced remains one keyboard or pointer action away. Capability and support detail stays disclosed and does not imply runnable custom models.

The existing Guided authoring region owns the required vertical scroll at `1280x720`; no new nested route scroll was added.

## 26. Typography findings

Page titles, workspace headings, panel titles, body text, metadata, and technical monospace remain visibly differentiated in the audited screenshots. No negative letter spacing is present in the R1 surface. R1B did not shrink text to fit more content.

Uppercase micro-labels remain numerous but subordinate. This is a style limitation, not a task blocker.

## 27. Panel-hierarchy findings

World distinguishes the unframed live stage, persistent playback dock, and one framed task rail. Start uses one framed featured system and repeated catalog cards without nesting cards. Atlas separates configuration from execution status; Lab avoids empty card grids; Workshop distinguishes route choice, draft status, steps, and active form.

No low-priority explanatory wrapper was found to justify a broad structural rewrite in R1B.

## 28. Scrolling findings

- Start: one `.start-hub` route scroll.
- World desktop: one intentional `.workspace-context-panel__scroll`; stage and controls do not scroll with configuration.
- World mobile: one `main` route scroll after stacking; no nested task scroll.
- Workshop default: one Guided authoring scroll.
- Atlas default: one route scroll; result matrices retain their bounded labelled scroll when present.
- Lab default at `1280x720`: no scroll.

Task switches now reset the shared World panel scroll instead of carrying an unrelated offset into the new task.

## 29. Responsive findings

All required viewports passed without document-level horizontal overflow, clipped persistent controls, overlapping sticky regions, hidden Run actions, or incoherent content order. Desktop preserves model-first side-by-side layout; `900px` and mobile use model-first stacking.

Responsive evidence covers the named states, not every device or input mode.

## 30. Short-height findings

At `1280x600`, the World stage remains `434px` high, the run dock remains visible, and the task rail owns its scroll. Atlas Run is visible in the Execution Status panel. Workshop's existing short-height focus/reachability tests remain green.

No short-height defect remains at P0 or P1 severity in the covered states.

## 31. Mobile-smoke findings

At `390x844`, Start communicates identity, purpose, featured starter, main action, and the first alternative pathway in the first viewport. World shows context, status, nudge, model, and persistent Run/Step/Reset before Setup. The ORTUS wordmark remains visible, and document width equals viewport width.

This is one mobile viewport smoke test, not full mobile-workflow validation.

## 32. Browser-zoom status

Headless Chromium received keyboard commands intended to exercise 125%, 150%, and 200% zoom, but device pixel ratio, viewport dimensions, and visual viewport scale did not change. **Actual browser zoom at 125%, 150%, and 200% was not verified.**

## 33. Accessibility findings

Covered routes retain one H1, one primary `main`, a skip link, labelled navigation, current-page semantics, menu roles, labelled controls, disclosure state, visible status text, and a contextual canvas alternative. Current state is not color-only.

Automated browser coverage does not establish screen-reader, assistive-technology, forced-colors, or WCAG conformance.

## 34. Reduced-motion findings

The required World, Lab, Atlas, and Workshop reduced-motion tests passed. Atlas execution and Workshop review remain usable with reduced motion. R1B added no decorative or required motion.

## 35. Axe findings

Representative Start, World, Lab, Atlas, Workshop, Guided/Advanced, Atlas-result, and reduced-motion states produced zero unexpected Axe violations in the existing and expanded suites.

Axe is a useful automated detector, not accessibility certification.

## 36. Diagnostics

Post-change captures reported no console errors or page errors. The full rendered suite reported no hydration mismatch, duplicate landmark, critical failed response, missing critical asset, unresolved Suspense, or post-unmount Atlas update defect.

Aborted image/HMR requests observed during rapid pre-change navigation were development-server navigation artifacts and were not counted as production asset failures.

## 37. State and storage findings

Task switching preserves engine tick and parameters. Featured-starter entry intentionally creates a fresh prepared run. Atlas remains isolated from World, Experiment Runner, and browser storage. The nudge and disclosures remain component-local.

`R1/R1B add no new persistence. Existing bounded World comparison and UI storage remain unchanged.` Existing production storage hits are bounded comparison storage, scenario storage, panel state, avatar preference, and opt-in performance instrumentation; none was added or repurposed by R1B.

## 38. Defects found

| ID | Severity | Defect |
| --- | --- | --- |
| R1B-01 | P1 | Reopening the featured starter resumed modified running state while showing baseline instructions. |
| R1B-02 | P1 | Key-parameter controls did not explain their immediate paused tick-0 rebuild. |
| R1B-03 | P1 | World task UI could diverge from the query and top-navigation current state. |
| R1B-04 | P1 | Rapid Research tools keyboard input had a reproduced timing-sensitive focus failure. |
| R1B-05 | P2 | Selecting a More task left focus on `BODY`. |
| R1B-06 | P2 | Task-panel scroll offset carried into unrelated task content. |
| R1B-07 | P2 | Neural default Understand duplicated one boundary and promoted an unrelated Builder limitation. |
| R1B-08 | P2 | Atlas Run was below the first short desktop viewport. |
| R1B-09 | P2 | The mobile primary brand lockup hid the ORTUS wordmark. |
| R1B-10 | P3 | Two Start labels exposed implementation-status language instead of user intent. |

No P0 defect was found.

## 39. Defects fixed

All four P1 defects and all five bounded P2 defects were fixed. The small P3 copy defect was corrected in the same Start component. No known R1-attributable P0 or P1 defect remains in the audited states.

The fixes are protected by rendered repeat-launch, rebuild, task-state, scroll, focus, rapid-menu, all-template Understand, Atlas short-height, mobile brand, Axe, and existing cross-route execution tests.

## 40. Production files changed

- `src/components/AppShell.tsx`.
- `src/components/LeftInstrumentStack.tsx`.
- `src/components/researchWorld/ResearchDestinationNavigation.tsx`.
- `src/components/RunSettingsPanel.tsx`.
- `src/components/ParameterPanel.tsx`.
- `src/components/ModelExplanationPanel.tsx`.
- `src/components/atlas/EphemeralLandscapePreview.tsx`.
- `src/components/start/StartHub.tsx`.
- `src/app/globals.css`.

No production simulation implementation file changed. The only `src/simulation` change is a roadmap-status test.

## 41. Test files changed

- `tests/ui/start-hub-world-reset.spec.ts` adds six behavior-level rendered regressions and strengthens the mobile contract.
- `src/lib/r1ProductReset.test.ts` advances the reset-roadmap contract to R2.
- `src/simulation/__tests__/roadmap.test.ts` advances the source-of-truth status contract to R2.
- `src/components/workspaceInformationArchitecture.test.ts` requires task/query route coordination instead of a raw local setter.
- `src/simulation/__tests__/layoutContainment.test.ts` preserves the shell containment contract with the coordinated task handler.

The final focused destination-shell suite remains `53` tests; the R1/R1B first-run suite grows from `12` to `18` tests.

## 42. Documentation files changed

The audit adds this record and updates `AGENTS.md`, `README.md`, `planned_roadmap.md`, `docs/roadmap.md`, `docs/product/ORTUS_PRODUCT_EXPERIENCE_RESET_ROADMAP.md`, `docs/RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md`, `docs/ui/START_HUB_AND_WORLD_FIRST_PRODUCT_RESET.md`, `docs/ui/HCI_AUDIT.md`, `docs/ui/WORKSPACE_INFORMATION_ARCHITECTURE.md`, `docs/codex/CURRENT_CONTEXT.md`, and `docs/codex/SESSION_LOG.md`.

## 43. Remaining limitations

- The audit is expert review, not a participant study; first-time comprehension and task success remain unvalidated.
- Actual browser zoom, screen-reader use, assistive-technology use, forced colors, touch behavior, and full WCAG conformance remain unverified.
- Only one mobile viewport received full smoke coverage.
- Understand summaries require a modest internal scroll at desktop.
- World Setup remains dense, Lab remains non-persistent, Workshop remains structural/schema-first, and Atlas remains a Flocking-only bounded sampler.
- Built-in model output remains exploratory model output, not empirical truth or validated prediction.

## 44. R2 readiness decision

**Conditionally ready for R2: World Layout and Interaction Reclaim.**

No blocking first-run or shell defect remains in the covered states. The remaining verification gaps are explicitly suitable for R2 or later dedicated accessibility/user-research work. R2 must not reinterpret this decision as runtime, scientific-validation, mobile-readiness, or WCAG readiness.

## 45. Final decision

R1B complete.

R2 subsequently completed its dedicated World Layout and Interaction Reclaim scope. Its implementation record is `WORLD_LAYOUT_AND_INTERACTION_RECLAIM.md`.

R2 complete.

R2B subsequently completed its dedicated World Layout and Interaction Audit + Hardening scope. Its evidence record is `WORLD_LAYOUT_AND_INTERACTION_RECLAIM_AUDIT.md`.

R2B complete.

C1: Starter World Content Framework is next and has not started.

F1 remains paused under E3 Analytical Lenses.
