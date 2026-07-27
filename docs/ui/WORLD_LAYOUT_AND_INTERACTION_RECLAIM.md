# World Layout and Interaction Reclaim

Date: 2026-07-24
Prompt: R2
Status: implementation complete; R2B audit and hardening complete; C1 complete; C1B next

## 1. Scope

R2 reclaims `/world` around the existing live simulation. It changes workspace composition, presentation metadata, task ownership, local view state, focus behavior, and responsive layout. It does not change simulation semantics or add product capability.

## 2. Starting commit

- Branch: `main`.
- Starting `HEAD`: `a7f9c29`.
- Starting `origin/main`: `a7f9c29`.
- The existing uncommitted R2 implementation was preserved and audited in place.
- The untouched baseline passed `53` focused rendered tests, `86` full UI tests, `72 files / 599 tests`, typecheck, production build, simulation performance smoke, and `git diff --check`.

## 3. Previous World problems

The R1 World correctly made the model the primary object, but its interaction layer still behaved like a compressed expert console. A `370px` task column stacked headings, provenance, readiness, configuration, notes, and actions into one long surface. Setup cut off controls in common viewports, complete notes reduced useful stage space, task ownership remained muddy, and the mobile stack did not reserve a usable height for the active tool.

The problem was not missing engine behavior. It was poor ownership and hierarchy around behavior that already existed.

## 4. New workspace frame

Desktop World now uses three explicit regions:

```text
compact World context
┌──────┬───────────────────────────────┬────────────────────┐
│ task │          LIVE WORLD           │ one active tool    │
│ rail │                               │ surface            │
│      ├───────────────────────────────┤                    │
│      │ playback / tick / speed       │                    │
└──────┴───────────────────────────────┴────────────────────┘
```

The task rail is `64px` on wide desktop and `56px` on medium desktop. The active tool is bounded to `320-350px` wide on wide desktop and `290-312px` on medium desktop. The stage receives the remaining width.

## 5. Stage hierarchy

`WorldStage` and `TimelineControlStrip` remain mounted outside task rendering. Task changes replace only the active tool content, so they do not recreate the canvas, reset the engine, or shift the desktop stage. The stage precedes task content in DOM order and remains the largest rendered World region at every audited desktop viewport.

This is a presentation guarantee, not evidence that the modeled system is empirically valid or that its visual patterns prove emergence.

## 6. Context bar

The compact context bar shows the current world, starting recipe or run context, run status, tick, seed, and one `Run details` action. Full provenance and technical context open in a focus-managed modal instead of permanently consuming stage width.

The bar does not present validation, calibration, causal proof, or runtime support that the selected template has not earned.

## 7. Task architecture

The direct task order is:

```text
Setup -> Observe -> Change -> Compare -> Explain -> More
```

The public `task=change` query remains an alias for the existing internal intervention workspace. `Experiments` and `Diagnostics` are preserved under `More`; they remain existing tools, not newly implemented behavior. Task buttons, the query string, visible task heading, and navigation current state stay synchronized.

## 8. Tool-surface behavior

Only one active task surface is presented at a time. It owns one bounded vertical scroll region, resets to its top when the task changes, and receives heading focus when navigation moves through `More`. Persistent playback stays outside this scroll region.

`Focus world` collapses the active tool locally. `Show tools` restores it immediately below the task choices. Collapse does not write storage, reset task-local controls, or alter the simulation.

## 9. Setup layering

Setup leads with the current world and four deterministic, source-backed quick parameters selected from the existing parameter definitions. Displayed values are the executed values; R2 does not introduce alternate defaults, shadow configuration, or hidden parameter transforms.

Parameter, seed, template, and recipe changes are explicitly labeled as fresh paused tick-0 rebuilds. `All parameters`, starting recipes/model variants, and Neural Runtime Lab remain reachable as deeper Setup views with a persistent Back action.

## 10. Observe hierarchy

Observe leads with two to four presentation-priority metrics, a compact bounded trace, and one model-specific `What to watch` note. `All metrics` and `Visual key and display` remain deliberate deeper views.

The values are current simulation state and model-output metrics. They are not measured human beliefs, empirical observations, calibrated probabilities, or validation evidence.

## 11. Change semantics

Change leads with the selected template's existing registered intervention when one is available. Copy distinguishes a current-run, engine-checked command from Setup actions that rebuild a fresh run. Detailed readiness and response boundaries remain reachable without leading the task.

Unsupported intervention states remain explicit. R2 does not add interventions, targets, effects, policy claims, persuasion controls, or causal-effect claims.

## 12. Compare hierarchy

Compare orders:

1. Current run.
2. Saved comparison runs.
3. Differences.
4. Scenario and snapshot exchange.

Existing bounded comparison summaries keep their established local-storage contract. They are not persistent Lab evidence, Atlas discoveries, empirical validation, or full saved simulations. R2 adds no comparison field or storage key.

## 13. Explain/full-reference behavior

Explain presents exactly six concise, selected-model sections: Question, How it works, What to watch, Try changing, Key assumptions, and Main limitation. Product-global implementation boundaries no longer displace the selected model's main limitation.

`Full model notes` opens a dedicated native dialog with one focusable scroll region. It contains complete assumptions, limitations, appropriate and inappropriate use, ethics, validation record, provenance, and relevant implementation boundaries without shrinking the stage. Escape and close return focus to the trigger.

## 14. More organization

`More` has two stable groups:

- `Investigate`: Experiment Runner.
- `Inspect`: Diagnostics and compact technical run context.

Scenario/snapshot exchange belongs to Compare and is not duplicated. More does not advertise starter packs, persistence, generic Atlas sampling, schema execution, multiscale runtime, or other future capability.

## 15. Playback controls

Run/Pause, Step, staged Reset, tick/time, and speed remain attached directly below the stage. They are outside task scrolling and remain visible at the audited `1280x600` short-height viewport.

R2 changes placement and responsive sizing only. Scheduler, tick, seed, reset, and speed semantics are unchanged.

## 16. Stage collapse/restore

On desktop, collapse changes the layout from `tasks + stage + tools` to `tasks + stage`. The tool surface remains mounted under the native `hidden` contract, preserving local form and disclosure state while preventing hidden focus.

At `1280x720`, the stage expands from `834px` to `1192px` wide and returns to `834px` after restore. A quick parameter value of `0.75` remained intact through that cycle.

## 17. Responsive behavior

The responsive composition is:

```text
>= 1180px: 64px tasks | flexible stage | 320-350px tools
761-1179px: 56px tasks | flexible stage | 290-312px tools
<= 760px: stage | playback | horizontal tasks | bounded active tool
```

At `390x844`, the stage is `374x335`, playback is `374x89`, tasks are `374x50`, and the active tool is `374x211`. The route fits the `390x844` document; the active tool owns its internal scroll and `All parameters` remains reachable. This is one mobile smoke viewport, not a complete mobile or touch-workflow claim.

## 18. Accessibility behavior

Task navigation exposes current state and supports Arrow, Home, and End movement. Direct task changes retain task-button focus; More selections focus the new panel heading. Task changes reset tool scroll. Dialogs use native modal behavior, Escape cancellation, focus return, an explicitly labeled focusable content region, and a visible focus ring.

The rendered suite covers keyboard paths, reduced-motion emulation, and Axe automation. It does not establish screen-reader, assistive-technology, forced-colors, browser-zoom, or WCAG conformance.

## 19. Presentation metadata

`worldPresentation.ts` contains deterministic UI-only priority metadata for quick parameters, headline/supporting/technical metrics, and concise observation guidance. It may choose what appears first. It cannot alter parameter definitions, defaults, bounds, validation, metric calculations, intervention support, templates, registry claims, or runtime behavior.

`worldExplanation.ts` derives bounded selected-model summaries from existing template documentation and removes duplicate or unrelated default boundaries. It does not generate cognition, execute schemas, infer support, or call an external model.

## 20. Runtime boundaries

R2 changes no simulation scheduling, deterministic RNG, engine state contract, template rule, scenario behavior, metric calculation, intervention execution, snapshot semantics, Experiment Runner execution, comparison behavior, Atlas execution, Builder behavior, or registry capability.

No simulation implementation file changed. The only `src/simulation` change is a layout/source contract test. R2 does not turn structural artifacts into executed behavior and does not generalize any template-specific capability.

## 21. Persistence boundaries

R2 adds no storage key. Tool visibility, nested task views, modal state, selected task presentation, and presentation metadata are local or URL-derived UI state. Existing bounded World comparison storage remains unchanged.

No Lab record, Atlas discovery, saved landscape, onboarding state, personalization, analytics, or user profile is created.

## 22. Rendered findings

Final measured desktop geometry:

| Viewport | Stage | Playback | Tasks | Tools |
| --- | --- | --- | --- | --- |
| `1440x900` | `994x730` | `994x50` | `64x786` | `350x786` |
| `1280x720` | `834x550` | `834x50` | `64x606` | `350x606` |
| `1024x768` | `624x598` | `624x50` | `56x654` | `312x654` |
| `900x700` | `500x530` | `500x50` | `56x586` | `312x586` |
| `1280x600` | `834x444` | `834x46` | `64x496` | `350x496` |
| `390x844` | `374x335` | `374x89` | `374x50` | `374x211` |

All seven production templates rendered nonblank, legible stage states in the audited Chromium session. Setup, Observe, Change, Compare, Explain, More, Experiments, Diagnostics, running, paused-after-running, fresh rebuild, live and unsupported intervention, saved comparison, full reference, collapse, restore, short-height, and mobile-smoke states were inspected. Task switching preserved tick and parameter state; full reference did not resize the stage.

## 23. Defects found

The initial focused suite passed `53/53`. The first full run passed `68`, failed `3`, and left `39` unrun. Continued rendered iteration found:

- Apply/New Seed controls whose accessible names did not include their visible labels.
- An unrelated Builder boundary promoted into the Neural default explanation.
- A native dialog scroll region that Axe could not focus.
- URL synchronization through framework navigation that could transiently remove the document title under load.
- A mobile tool surface taller than the reserved viewport row, clipping deeper Setup content.
- `Setup change` metadata rendered inline with its explanatory copy.
- `Show tools` placed at the bottom of the rail where a development overlay could obstruct it.
- The compact Change rewrite dropped the prior `engine-checked commands` software-path language.
- Several strict-locator, hidden-modal, obsolete-panel, reduced-motion setup, canonical-label, intervention-selection, comparison-storage, and old explanation-label assumptions in source and rendered tests.

No simulation, template, scenario, or persistence defect was found.

## 24. Defects fixed

- Seed action accessible names now include `Apply Seed` and `New Seed`.
- Explanation filtering keeps sentence-shaped cross-tool implementation boundaries out of the concise selected-model summary.
- Modal content is keyboard-focusable, labeled, and visibly focused.
- Task URL state uses same-document `history.replaceState`, preserving runtime state and eliminating route-render title flicker.
- Mobile World now bounds the shell and active tool row; the tool owns scrolling and the document remains viewport-sized.
- Setup-change label and explanation use deliberate block geometry.
- `Show tools` sits immediately below task choices.
- Change again states that the current-run action uses engine-checked commands without advancing time.
- Source and rendered tests now select canonical templates/actions, target visible active surfaces, distinguish hidden modal content from default-visible content, emulate reduced motion explicitly, and preserve the established comparison storage contract.

Every production defect has a regression that would fail against the pre-fix implementation.

## 25. Verification

Final pre-commit R2 verification:

- Focused World rendered suite: `53 passed`.
- R2 rendered regression suite: `24 passed`.
- Complete rendered Playwright/Axe suite: `110 passed` in `7.6m`; no retries or skipped tests in the final invocation.
- Manual rendered audit harness: `4 passed`; temporary screenshots stayed in `/tmp` and the temporary test was removed.
- Browser diagnostics: no unexpected console error, page error, hydration failure, or failed critical request.
- Typecheck: passed.
- Unit tests: `75 files / 610 tests` passed.
- Production build: passed; all static routes prerendered and `/world` built as the intended dynamic route.
- Simulation performance smoke: passed at `226.53`, `31.45`, `49.12`, and `149.49` ticks/second for the recorded Flocking-100, Flocking-500, Forest Fire, and Predator-Prey cases. The bounded Atlas smoke completed `2` runs / `10` work units in `26.23ms`. These figures are local smoke evidence, not scale certification.
- `git diff --check`: passed before commit.
- `npm run lint: unavailable, package.json has no lint script.`

## 26. Remaining limitations

- R2 is expert review plus automated Chromium evidence, not participant research or demonstrated beginner comprehension.
- One mobile viewport received smoke and deep-scroll coverage; touch ergonomics and a complete mobile workflow remain unverified.
- Actual browser zoom at 125%, 150%, and 200%, screen-reader use, assistive-technology use, forced colors, and WCAG conformance remain unverified.
- Canvas legibility was inspected visually, not validated against empirical domain data.
- Dense expert controls still require internal scrolling on short and mobile viewports.
- Model output remains exploratory model output, not empirical truth, validated prediction, causal proof, robustness proof, or policy guidance.

## 27. R2B result and C1/C1B handoff

R1 complete.

R1B complete.

R2 complete.

R2B complete.

R2B independently challenged model dominance, task ownership, URL/state coherence, collapse preservation, active-tool scroll, short-height and mobile reachability, focus return, all seven stage renderings, interpretation boundaries, and runtime/persistence integrity. It fixed explicit draft/rebuild semantics, browser task history, modal focus containment, hidden-work lifecycle, quick-control order, comparison recovery visibility, and full-reference metric inventory. The evidence record is `WORLD_LAYOUT_AND_INTERACTION_RECLAIM_AUDIT.md`.

C1 is complete. Its strict Starter World handoff reuses R2/R2B's existing scenario apply path to create fresh paused tick-0 runs and adds only a compact dismissible definition-driven nudge over the stage. It does not redesign World, change template runtime, or add persistence.

`C1B: Starter World Content Framework Audit` is next and has not started. R2/R2B/C1 tests are not proof of user comprehension, accessibility conformance, scientific validation, or new runtime support.
