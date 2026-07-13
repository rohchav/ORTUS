# UX4B: Sandbox Visual Language Foundation Audit

## 1. Scope

UX4B audits the committed UX4 sandbox visual-language foundation. It validates workbench fit, command-console reduction, status/caveat treatment, rendered behavior, accessibility smoke evidence, and no-fake-functionality boundaries. UX4B does not implement UX5, UX6, GW9, persistence, records, sampling, route aliases, runtime behavior, template behavior, Builder execution, dependencies, assets, fonts, icon libraries, or user-configurable themes.

## 2. Starting commit

Starting commit: `9e7aaef feat: add sandbox visual language foundation`.

The starting worktree was clean. Ignored Playwright artifacts were not part of `git status`.

## 3. Routes audited

- `/` World
- `/builder` Workshop
- `/lab` Lab
- `/atlas` Atlas

## 4. Viewports audited

Rendered tests covered:

- `1440x900`
- `1280x720`
- `1024x768`
- `900x700`
- `1280x600`

Additional screenshot inspection used `1280x720` for all four routes.

## 5. Baseline check results

The first sandboxed `npm run test:ui` failed before tests because the sandbox blocked the local Next server. Manual `npm run dev -- --hostname 127.0.0.1 --port 3000` showed `listen EPERM`; this is an environment local-socket restriction, not an app crash.

Escalated `npm run test:ui` passed, 45 tests. `npm run typecheck` passed. `npm test` passed, 67 files and 543 tests. `npm run build` passed. `npm run perf:simulation` passed. `git diff --check` passed. `npm run lint: unavailable, package.json has no lint script.`

## 6. UX4 source/token audit

The UX4 commit changed one production file: `src/app/globals.css`. The diff adds semantic workbench, instrument, caveat, radius, border, and elevation tokens, plus route-level visual styling. It does not add storage, state models, runtime code, simulation code, template code, Builder execution code, dependencies, assets, fonts, icon libraries, or route aliases.

The token names are semantic enough for this phase. They describe surface roles rather than fake product capability. Focus-ring tokens remain visible. Status categories and states are still exposed through text and `data-status-category` / `data-state` attributes.

## 7. Sandbox/workbench fit findings

World: Strong sandbox/workbench fit. The model surface is dominant, run controls are reachable, and caveats remain near the active model context.

Workshop: Partial sandbox/workbench fit. It is less command-console-like, but it remains Advanced Builder rather than a guided construction flow. That is acceptable before UX5/UX6.

Lab: Partial sandbox/workbench fit. It reads more like a quiet future evidence scaffold, but it is still mostly explanatory and not a working Lab.

Atlas: Partial sandbox/workbench fit. It reads more like model-space orientation, but it remains text-heavy and conceptual. It does not fake a map or discovery surface.

## 8. Command-console reduction findings

Excessive uppercase: Improved.

Hard border density: Improved.

All-panels-equal hierarchy: Improved.

High badge competition: Improved, still a concern in Workshop because the boundary badges are necessarily dense.

Tactical/HUD framing: Improved.

Permanent glow: Improved.

Cold monotone surfaces: Improved.

Warning-wall rhythm: Improved, but not resolved in advanced Builder contexts.

Route surfaces that look like command decks: Improved.

## 9. Surface hierarchy findings

The rendered hierarchy now reads as:

1. Primary model/work area.
2. Instrument/control surfaces.
3. Workbench/card surfaces.
4. Caveat/boundary surfaces.
5. Status chips/badges.
6. Decorative/supporting details.

World has the strongest hierarchy. Workshop is still dense but not misleading. Lab and Atlas group static scaffolds without making them look like saved records, maps, samples, or databases.

## 10. Status/caveat treatment findings

Status labels remain visible and text-based. Status attributes remain present. Future-only does not look like locked progression. Unresolved evidence does not look like software failure. Static caveats are calmer but not hidden. Caveats are not all styled as danger states.

This is the right direction. The remaining risk is comprehension: quieter caveats can be skipped by users who do not yet understand ORTUS' model-vs-world boundary.

## 11. World route findings

World is the best current sandbox surface. The canvas/model stage dominates, the persistent run controls remain outside scrollable configuration content, Observe/Intervene/Experiment/Compare remain clear, and model-output caveats remain visible. No sampling, run queue, probe, saved Lab record, or Atlas discovery behavior appears.

## 12. Workshop route findings

Workshop reads as a modular modeling bench, but it is still an expert surface. It keeps structural-only, not-runnable, no-compiler, no-schema-execution, no-template-generation, no-scenario-generation, and no-RunConfig-generation boundaries visible. No Guided Builder, schema execution, graph execution, compile action, run action, preview, or apply-to-simulation behavior was added.

## 13. Lab route findings

Lab reads as a non-persistent future evidence notebook scaffold. It does not present fake saved records, timestamps, IDs, ledgers, notebooks, history tables, or database behavior. Non-persistence remains explicit.

## 14. Atlas route findings

Atlas reads as model-space orientation rather than a fake map. It does not present fake heatmaps, contours, discoveries, sampled regions, scores, confidence values, saved plans, or run queues. Behavioral landscape and probe planning remain conceptual, non-persistent, and non-executable.

## 15. Accessibility findings

Rendered suites verify one route-level H1 per route, a shared main landmark, visible skip-link focus, keyboard-reachable navigation, visible status text, no color-only status meaning, reduced-motion contexts, and Axe smoke checks.

This is not a screen-reader certification, assistive-technology verification, forced-colors audit, actual browser-zoom proof, or full WCAG conformance claim.

## 16. Keyboard/focus findings

The skip link, destination links, World workspace tabs, Builder mode tabs, and major controls remain keyboard reachable in the rendered smoke checks. Focus rings are visible and not clipped in the tested viewport matrix. Static Lab/Atlas conceptual scaffolds do not create fake local Tab stops.

## 17. Responsive findings

The rendered suite found no document-level horizontal overflow across the route/viewport matrix. Panels wrap or scroll inside intended regions. World still prioritizes the model surface. Workshop remains dense but usable for an advanced surface. Lab and Atlas remain readable.

This is not mobile-first readiness.

## 18. Short-height findings

The `1280x600` route checks passed. Persistent run controls stayed reachable on World, destination navigation stayed usable, and no route created document-level horizontal overflow. Dense content still requires vertical scrolling; that is acceptable for this phase.

## 19. Browser zoom status

Actual browser zoom at 125%, 150%, and 200% was not verified.

Viewport resizing and Playwright screenshots were not treated as browser zoom evidence.

## 20. Reduced-motion findings

No new continuous animation was found. The prior danger status pulse remains disabled by UX4 styling. Existing reduced-motion Playwright coverage passed for World, Workshop, Lab, and Atlas. Informational state does not depend on animation.

## 21. Axe findings

The full rendered UI suite passed Axe smoke scans for World, Workshop, Lab, and Atlas, plus the semantic-foundation scans for World and Builder states. Axe passing is useful smoke evidence only; it is not full WCAG conformance.

## 22. Console/hydration findings

The rendered suites reported no unexpected page errors, browser console errors, hydration mismatch strings, failed critical requests, missing critical assets, or route load failures. The `NO_COLOR` / `FORCE_COLOR` messages are dev-server noise, not page runtime errors.

## 23. No-fake-functionality findings

UX4B found no new fake map, fake landscape result, fake saved record, fake Lab entry, fake Atlas discovery, fake sample, fake run queue, fake execution console, ready-to-run claim, mission-control framing, deploy framing, objective/tactical route framing, or progression/unlock framing introduced by UX4.

## 24. Scope-creep search findings

The required broad search returned expected hits in docs, tests, guardrails, and pre-existing production code. Production hits include existing local run/scenario storage, panel persistence, workspace avatar-display preference copy, Scenario Builder `Date.now` ids, the kernel performance fallback, Neural lab mission wording, experiment progress, saved-run comparison, and explicit boundary copy such as "not saved" or "not a run queue."

The UX4-changed production file is `src/app/globals.css`. Its hits are class names such as `experiment-progress` and `neural-lab__mission`, not new UX4 behavior. UX4B did not find new storage, personalization, onboarding, progression, fake records, discoveries, samples, queues, sweeps, regime detection, random IDs, UUIDs, fingerprints, or tactical command-center vocabulary introduced by UX4.

## 25. Defects found

No bounded UX4 production defect was found that warranted CSS, component, route, runtime, template, or test hardening.

The real blocker encountered was environmental: sandboxed local-server binding fails with `listen EPERM`.

## 26. Defects fixed

No production defect was fixed. UX4B adds this audit record and updates roadmap/context documentation to mark UX4B complete and UX5 next.

## 27. Production files changed

None.

## 28. Test files changed

Only the roadmap documentation contract test was updated to recognize the UX4B audit document, UX4B completion state, UX5 as next, and GW9 pause.

## 29. Documentation files changed

UX4B adds `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION_AUDIT.md` and updates concise roadmap/context references in README, roadmap, concept, HCI, workspace IA, visual-direction, UX3, UX4, Codex context, and session documentation.

## 30. Verification commands

- `npm run test:ui`: sandboxed run blocked by local-server permission; escalated run passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

## 31. Remaining limitations

No screen-reader walkthrough was performed. No assistive-technology verification was performed. No forced-colors verification was performed. Actual browser zoom at 125%, 150%, and 200% was not verified. No full WCAG conformance claim is made. No user-comprehension study was performed.

UX4B also does not solve UX5 progressive disclosure or UX6 Guided Builder. Workshop remains advanced. Lab and Atlas remain conceptual and non-persistent.

## 32. UX5 readiness decision

Ready for UX5.

The visual-language foundation is improved enough to support the next comprehension layer. UX5 should add progressive disclosure and beginner/advanced information architecture without adding persistence, saved preferences, onboarding state, recommendations, progression, runtime behavior, template behavior, Builder execution, or GW9 behavior.

## 33. GW9 pause decision

GW9 remains paused.

GW9 should not start until UX5, UX5B, UX6, and UX6B are completed or the pause is explicitly waived.

## 34. UX5 acceptance notes

UX5 must preserve direct expert access while making first-run orientation less punishing. It should layer plain task language above technical exactness, separate "what can I do now" from "what this does not mean", and avoid preferences, profiles, saved onboarding, XP, locks, achievements, route aliases, runtime execution, Builder execution, Lab records, Atlas discoveries, samples, queues, sweeps, and regime detection.

## 35. Final decision

Ready for UX5.
GW9 remains paused.

## 36. Post-UX5/UX5B status

UX5 followed this audit with source-backed route orientation, component-local non-persistent disclosure, layered capability guidance, and concise Lab/Atlas defaults. It did not add Guided Builder, persistence, personalization, progression, runtime/template/Builder execution, Lab/Atlas records, sampling, or probe execution.

UX5B then audited that layer in source and rendered browsers, found no production defect in the covered paths, and added no product behavior. UX5B complete. UX6 is next. GW9 remains paused.

## 37. Post-UX6 Status

UX6 now adds the bounded, non-persistent Guided Builder over existing structural schema services while preserving Advanced Builder. It does not broaden the UX4 visual-language claim into runtime support, persistence, progression, or scientific validation. UX6 complete. UX6B required next. GW9 remains paused.
