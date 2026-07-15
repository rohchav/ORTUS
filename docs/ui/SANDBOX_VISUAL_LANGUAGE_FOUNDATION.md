# UX4: Sandbox Visual Language Foundation

## 1. Scope

UX4 implements the first bounded sandbox visual-language foundation for ORTUS. It changes presentation only: semantic tokens, surface hierarchy, panel frames, status/caveat treatment, route visual hierarchy, and rendered visual-contract coverage.

UX4 does not add persistence, preferences, onboarding, progression, Guided Builder, beginner/advanced modes, route aliases, Lab records, Atlas discoveries, saved maps, saved probe plans, sampled results, run queues, sweeps, regime detection, runtime behavior, template behavior, Builder execution, schema execution, graph execution, dependencies, assets, fonts, or icon libraries.

## 2. Starting commit

Starting commit: `f1c2a5a docs: audit UI comprehension and sandbox theme`.

The starting worktree was clean before UX4 edits. Baseline checks were run before editing. The sandbox blocked local Playwright web-server startup with `Process from config.webServer exited early`; the same rendered checks passed when rerun through the allowed local-server escalation path.

## 3. UX3 findings addressed

UX3 found that ORTUS was honest and precise but still too command-console-like. World was closest to the intended sandbox feel. Workshop read as an expert Advanced Builder surface. Lab was truthful but mostly conceptual scaffolding. Atlas was truthful but dense and static.

UX4 addresses only the visual-language layer of those findings. It does not solve progressive disclosure, Guided Builder flow, persistence, sampling, records, or broader product comprehension.

## 4. Design objective

The objective is to move the rendered interface toward a serious systems sandbox and modeling workbench: tactile, modular, construct-and-test oriented, spatial, approachable, safe to explore, and clearer before advanced.

The objective is not to make ORTUS toy-like, hide technical terms, or pretend structural scaffolds are executed behavior.

## 5. Visual-language principles

Change visual language, not product capability.

Runtime support must be earned, not implied. Visual hierarchy may make a surface more legible, but it must not create a claim that a feature is implemented, persistent, validated, calibrated, executable, sampled, or saved.

Status and caveat text stays visible. UX4 makes it less visually dominant where it had become a warning wall.

## 6. Token changes

UX4 extends the semantic token layer with workbench, instrument, caveat, border, radius, and elevation tokens in `src/app/globals.css`. The new tokens are:

- `--surface-workbench`
- `--surface-workbench-raised`
- `--surface-workbench-inset`
- `--surface-instrument`
- `--surface-caveat`
- `--border-workbench`
- `--border-instrument`
- `--radius-control`
- `--radius-chip`
- `--radius-panel`
- `--elevation-workbench`
- `--elevation-instrument`

Existing panel and status tokens were softened. Focus-ring tokens were preserved. No new font family, remote font, image asset, icon pack, or dependency was introduced.

## 7. Surface hierarchy changes

Major panels now use a calmer workbench frame with softer borders and more stable radii. Instrument-like controls are visually distinct from static caveats. Corner-frame ornament was reduced so panels read less like tactical HUD modules.

The visual hierarchy now favors the active model surface and primary work areas over route status scaffolding. This is useful, but it also increases the risk that static scaffolds feel more finished than they are; UX4B must audit that risk.

## 8. Status/caveat treatment

Status pills retain text labels, status categories, and state attributes. UX4 makes them calmer, rounder, and less uppercase-heavy. Static caveats use neutral caveat surfaces rather than high-intensity warning treatment.

Capability guidance remains source-backed static copy. It does not create capability. Evidence, planning-only, future-only, unsupported, and do-not-assume states remain visible.

## 9. Route-level changes

World, Workshop, Lab, and Atlas keep their route contracts and navigation destinations. UX4 changes route feel through CSS only.

World is emphasized as the live model surface. Workshop is styled as a modeling bench while remaining the current advanced Builder. Lab is styled more like a non-persistent evidence notebook scaffold. Atlas is styled more like a model-space orientation scaffold.

## 10. World findings

World remains the primary live simulation surface. The world stage now reads as a model surface instead of a HUD screen, and adjacent run/control surfaces read more like instruments around the sandbox.

Observe, Intervene, Experiment, and Compare styling is softened so these areas read more like lenses/tools than mission tabs. No runtime, command, template, intervention, experiment, comparison, or snapshot behavior changed.

## 11. Workshop findings

Workshop keeps the current advanced Builder functionality. UX4 softens Builder headers, mode tabs, graph-view frames, schema cards, validation panels, and related controls so the route reads more like a structural modeling bench.

Workshop still does not execute schemas, execute graphs, compile models, generate templates, generate scenarios, or activate runtime behavior from structural artifacts.

## 12. Lab findings

Lab remains non-persistent. UX4 styles Lab evidence-record and experiment-ledger scaffolds with quieter notebook-like grouping and non-color border cues.

No Lab records, saved notes, ledgers, timestamps, identifiers, persistence, storage, publication, or Atlas transfer behavior was added.

## 13. Atlas findings

Atlas remains non-persistent and static. UX4 styles Atlas evidence, landscape, and probe-planning scaffolds with quieter map/workbench grouping while avoiding fake heatmaps, contours, scores, sampled regions, saved landscapes, saved probe plans, or discoveries.

The visual presentation is more approachable, but it is still only a conceptual model-space scaffold.

## 14. Accessibility considerations

UX4 preserves shared shell landmarks, route-level H1 structure, skip-link presence, status text visibility, and non-color grouping cues. The rendered shell suite still checks Axe smoke coverage for the established route/viewport matrix.

This is not a screen-reader, assistive-technology, forced-colors, or full WCAG conformance claim.

## 15. Keyboard/focus considerations

Focus-ring styling was preserved. Existing keyboard routes, shell navigation, skip-link behavior, Builder controls, and static scaffold Tab-stop boundaries remain covered by the rendered shell tests.

UX4 does not add fake Tab stops to static Lab/Atlas/GW7/GW8 scaffolds.

## 16. Responsive considerations

UX4 keeps the established rendered viewport matrix: `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600` across `/`, `/builder`, `/lab`, and `/atlas`.

The focused shell rendered suite checks no horizontal overflow across the established route/viewport matrix. This is not a mobile-first readiness claim.

## 17. Browser zoom status

Actual browser zoom at 125%, 150%, and 200% was not verified.

The headless automation route has not provided trustworthy browser-zoom metrics. Viewport resizing is not counted as browser zoom. UX4 continuation did not add a trustworthy browser-zoom verification.

## 18. Reduced-motion considerations

UX4 avoids adding continuous animation. The pre-existing danger pulse on status pills was disabled in the UX4 styling layer. Existing reduced-motion rendered checks remain in the shell suite.

## 19. Axe results

The focused shell Playwright suite includes Axe scans for World, Workshop, Lab, and Atlas across the established viewport matrix. The final focused shell and full UI Playwright/Axe reruns passed through the local-server permission path.

Axe smoke success does not mean full WCAG conformance.

## 20. Console/hydration findings

The rendered shell suite observes page errors, critical failed requests, bad critical responses, browser console errors, and hydration mismatch strings. The final focused shell and full UI Playwright reruns passed without reported console, page, asset, or hydration failures.

## 21. Scope-creep search findings

The required broad scope-creep search was inspected manually after implementation. Expected hits appeared in docs/tests/guardrails and pre-existing product code, including older run/scenario storage vocabulary, performance timing fallbacks, experiment progress, structural control-model rejection vocabulary, and rendered-test forbidden-copy assertions.

The UX4-changed production file `src/app/globals.css` contained only pre-existing class-name hits such as `experiment-progress` and `neural-lab__mission`; UX4 did not introduce storage APIs, preferences, personalization, onboarding state, progression, wizard state, Guided Builder state, runtime execution, fake results, records, discoveries, timestamps, random IDs, UUIDs, or fingerprints.

## 22. Production behavior boundary

UX4 changes CSS and rendered test contracts. It does not change production data models, engine state, simulation logic, template definitions, stores, imports, exports, scenarios, run configs, snapshots, commands, interventions, experiments, comparisons, or runtime services.

## 23. Runtime/template/Builder execution boundary

No runtime/template/Builder execution was added. Model schemas remain structural and non-runnable. Visual Builder workspaces remain structural and non-executable. Builder graphs remain structural inspection views.

The Opinion, Neural, and other template runtimes were not changed.

## 24. Non-persistence/non-progression boundary

No persistence, saved preferences, onboarding state, account state, XP, achievements, locks, ranks, streaks, missions, personalized recommendations, Lab records, Atlas discoveries, saved maps, saved probe plans, sampled results, run queues, or progression system was added.

UX4 does not start UX5, UX6, or GW9.

## 25. Files changed

UX4 changed:

- `src/app/globals.css`
- `tests/ui/research-world-shell.spec.ts`
- `README.md`
- `planned_roadmap.md`
- `docs/roadmap.md`
- `docs/concepts.md`
- `docs/RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md`
- `docs/ui/LIVING_SYSTEMS_ATLAS_VISUAL_DIRECTION.md`
- `docs/ui/HCI_AUDIT.md`
- `docs/ui/WORKSPACE_INFORMATION_ARCHITECTURE.md`
- `docs/ui/FULL_UI_UX_COMPREHENSION_AND_SANDBOX_THEME_AUDIT.md`
- `docs/codex/CURRENT_CONTEXT.md`
- `docs/codex/SESSION_LOG.md`
- `AGENTS.md`
- `src/simulation/__tests__/roadmap.test.ts`

UX4 added this document: `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION.md`.

## 26. Tests updated

`tests/ui/research-world-shell.spec.ts` now includes sandbox visual-language contract checks for workbench tokens, softened chips/panels, World model-surface framing, Workshop bench controls, and Lab/Atlas non-color grouping cues.

`src/simulation/__tests__/roadmap.test.ts` is updated to require the UX4 documentation boundary. Prompt UX4B later updates that contract for UX4B completion, UX5 next status, and GW9 pause.

## 27. Verification commands

Baseline before editing:

- `npm run test:ui`: passed after local-server escalation, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Focused post-change rendered check passed earlier after the status-pill casing fix:

- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed after local-server escalation, 30 tests.

Final continuation verification:

- `npx playwright test tests/ui/research-world-shell.spec.ts`: sandboxed run blocked with `Process from config.webServer exited early`; manual `npm run dev -- --hostname 127.0.0.1 --port 3000` showed `listen EPERM`, so the blocker was classified as a sandbox local-server permission issue.
- Escalated `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests.
- `npm run test:ui`: sandboxed run blocked with `Process from config.webServer exited early`.
- Escalated `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed after rerunning alone. An earlier concurrent run raced with `next build` while `.next/types` were being regenerated and was not a source defect.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 81.55 ticks/sec, Flocking 500 agents at 10.75 ticks/sec, Forest Fire medium grid at 18.92 ticks/sec, and Predator-Prey default at 53.82 ticks/sec.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

UX4 is commit-ready after the rendered continuation gate.

## 28. Remaining limitations

UX4 is not the final visual overhaul. It does not solve progressive disclosure, guided modeling flow, beginner comprehension, route restructuring, persistence, sampling, evidence records, Atlas discoveries, browser-zoom verification, screen-reader verification, assistive-technology verification, forced-colors behavior, or full WCAG conformance.

The blunt risk: better styling can make static scaffolds feel more capable than they are. UX4B needs to attack that risk directly.

## 29. UX4B audit result

UX4 was followed by UX4B: Sandbox Visual Language Audit and Hardening.

The UX4B audit record is `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION_AUDIT.md`. UX4B audited sandbox/workbench fit, command-console reduction, route visual hierarchy, status/caveat treatment, accessibility, keyboard/focus, responsive behavior, browser zoom status, Axe results, console/hydration, no fake functionality, no runtime/template/Builder behavior changes, no persistence/progression, and no UX5/UX6/GW9 creep.

UX4B found the foundation ready for UX5. It did not add production behavior, runtime behavior, template behavior, Builder execution, persistence, progression, onboarding, records, samples, route aliases, dependencies, assets, fonts, icon libraries, UX5, UX6, or GW9 implementation.

## 30. Final decision

UX4 complete.
GW9 remains paused.
UX4B complete.
UX5 followed and is now complete.
UX5B followed, found no production defect in the covered progressive-disclosure paths, and is now complete.
UX6 and its UX6B audit followed and are now complete. UX6B preserves the sandbox/workbench and capability-honesty boundaries while hardening bounded Guided/Advanced focus, responsive flow, and accessibility defects. GW9 is next. GW9 remains paused until UX6B is committed and remotely aligned.
