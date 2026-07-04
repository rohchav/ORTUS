# Contextual Capability Guidance Audit

Status: Prompt GW6B audit and hardening record, updated after Prompt GW8. GW6B audits the static contextual capability guidance added in GW6. It does not add persistence, recommendations, onboarding, Lab records, Atlas discoveries, saved behavioral landscapes, saved probe plans, progression, runtime behavior, template behavior, or Builder execution behavior. GW7 later adds Atlas-side behavioral-landscape vocabulary and a conceptual scaffold without changing the GW6B guidance audit result. GW8 later adds Atlas-side landscape probe planning vocabulary and a conceptual scaffold without creating executable probes, saved plans, samples, run queues, or regime detection.

## 1. Scope

GW6B audited `src/lib/capabilityGuidance.ts`, `src/lib/capabilityGuidance.test.ts`, `src/components/researchWorld/CapabilityGuidancePanel.tsx`, route integration for `/`, `/builder`, `/lab`, and `/atlas`, the Builder inspector scroll region, rendered shell coverage, semantic-foundation rendered coverage, roadmap/context documentation, and scope-creep search results.

## 2. Starting Commit

Starting commit: `c594546 feat: add contextual capability guidance`.

The worktree was clean at the start of GW6B continuation.

## 3. Routes Audited

- `/` -> World
- `/builder` -> Workshop
- `/lab` -> Lab
- `/atlas` -> Atlas

`/world` and `/workshop` remain unavailable aliases rather than redirects.

## 4. Viewports Audited

Rendered Playwright coverage audited:

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 900 x 700
- 1280 x 600

## 5. Baseline Blocker Resolution

Two blockers were found before GW6B could close:

- The uncertainty unit suite timed out in the aggregate production-template numeric-parameter test.
- Rendered verification initially reused a stale Next.js dev server on port 3000 that served HTML while critical CSS and JavaScript chunk requests returned 404, leaving the World route in the hydration shell.

The stale server was stopped and Playwright was rerun against a fresh dev server.

## 6. Unit Timeout Investigation

The failing uncertainty test bundled all production templates into one Vitest case, then generated uncertainty configs, created paired engines, stepped each engine, compared snapshots, and inspected finite metrics. The assertion was valid, but the single test case exceeded the default 5-second Vitest budget on this machine.

GW6B split that aggregate case into per-template cases using `it.each`, preserved the generated-run, determinism, snapshot-equality, and finite-metric assertions, and aligned the focused test name with the requested `production-template numeric-parameter` filter.

Classification: pre-existing timing-sensitive test-design issue, not a GW6 capability-guidance regression.

## 7. Source-Model Findings

The guidance model is static and source-backed. It has no storage reads or writes, no browser storage, no database or cloud persistence, no timestamps, no UUIDs, no random IDs, no analytics, no user profiling, no server calls, no hidden mutation, no fake action model, and no runtime/template coupling.

GW6B hardened negated advice-system vocabulary out of the guidance source and documentation. The source now avoids recommendation-like and user-profiling vocabulary in capability-guidance copy.

## 8. Destination Capability Matrix Findings

World guidance describes the live local modeling surface, active run context, model outputs, and template-defined command paths. It does not imply saved runs, save-to-Lab, Atlas discovery creation, or real-world proof.

Workshop guidance describes structural authoring and inspection. It does not imply schema execution, graph execution, hidden runtime mutation, saved Lab records, Atlas discoveries, or generated templates.

Lab guidance describes non-persistent evidence-record information architecture and lifecycle vocabulary. It does not imply saved experiments, notebooks, stored run history, or durable comparison records.

Atlas guidance describes non-persistent evidence-state information architecture for investigated model behavior. It does not imply Discovery Atlas records, saved maps, saved behavioral landscapes, or discovery certification.

## 9. Route Integration Findings

Rendered shell coverage confirms capability guidance appears in the intended route contexts and stays inside the shared `main`. The routes do not add duplicate `main` landmarks or route-level duplicate H1s. Guidance does not render as a modal, command palette, generated-guidance surface, tour, checklist, or fake action surface.

## 10. Non-Personalization Findings

GW6 guidance remains static route-local capability orientation. It does not read usage state, infer user needs, store preferences, profile users, route users based on behavior, or generate suggestions.

## 11. Non-Persistence Findings

The required visible boundary remains present:

```text
Guidance describes current ORTUS capabilities. It does not create saved records, validation, discoveries, or persistence.
```

No saved guidance state, dismissed-tip state, Lab persistence, Atlas persistence, browser storage, database behavior, or cloud persistence was added.

## 12. Fake Action Audit

No fake save-to-Lab, publish-to-Atlas, create-discovery, record-evidence, map-this-run, guided-workflow, completion, or disabled action controls were found in the guidance layer.

## 13. Progression And Onboarding Audit

No onboarding state, progress bars, tutorial completion state, achievements, badges, unlocks, levels, ranks, XP, streaks, or mission language was added.

## 14. Builder Inspector Accessibility Findings

Rendered shell tests confirm the Workshop route remains usable after `.builder-side` became the keyboard-focusable scroll region. The region has an accessible label, visible focus styling, and is covered by the viewport/focus shell matrix.

## 15. Static Guidance Accessibility Findings

Capability guidance panels remain static readable sections. Rendered tests confirm the panels do not add route-local fake controls or static Tab stops. Status labels are visible text, not color-only state.

## 16. Status Semantics Findings

GW6 guidance uses UX2 capability/evidence semantics:

- `Available here` -> capability / supported
- `Planning-only` -> capability / planning-only
- `Not implemented` -> capability / future-only
- `Do not assume` -> capability / planning-only or evidence / unresolved
- `Related destination` -> capability / planning-only

The guidance does not use operational status to imply implementation, validation, completion, empirical truth, or active run state.

## 17. Relationship Boundary Findings

The audited source and rendered routes preserve these boundaries:

- World live state is not Lab saved data.
- Lab planning semantics are not saved experiments.
- Atlas evidence IA is not Discovery Atlas persistence.
- Workshop authoring is not hidden runtime mutation.
- Model output is not real-world validation.
- Guidance is not user-specific advice.

## 18. Route Contract Findings

The route contract remains unchanged:

- `/` -> World
- `/builder` -> Workshop
- `/lab` -> Lab
- `/atlas` -> Atlas

No `/world`, `/workshop`, destination query state, hash navigation, or redirects were added.

## 19. Keyboard And Focus Findings

Rendered shell coverage confirms skip-link behavior, destination-link keyboard navigation, visible focused elements, and Builder inspector focus behavior across the audited shell paths. This is keyboard/focus smoke evidence, not a full assistive-technology audit.

## 20. Responsive Findings

Rendered shell coverage passed at the established viewport set. The guidance did not create page-level horizontal overflow in the rendered checks, and World, Workshop, Lab, and Atlas remained usable under the tested viewport matrix.

## 21. Short-Height Findings

Rendered shell coverage passed at `1280 x 600` for World, Workshop, Lab, and Atlas. The guidance did not dominate those routes or hide the primary destination content in the tested short-height viewport.

## 22. Browser Zoom Status

Actual browser zoom at 125%, 150%, and 200% was not verified.

Viewport resizing is not treated as browser zoom evidence.

## 23. Reduced-Motion Findings

Rendered Playwright coverage passed with reduced motion for World, Workshop, Lab, and Atlas. Guidance remained visible and route navigation remained functional.

## 24. Axe Findings

Rendered Axe scans passed for World, Workshop, Lab, Atlas, the semantic foundation simulate route, and the Builder route. This is automated Axe smoke evidence, not WCAG conformance.

## 25. Console, Hydration, And Asset Findings

Initial rendered verification failed because a stale dev server served missing CSS/JavaScript chunks. After stopping that stale server and rerunning against a fresh server, the shell suite and full UI suite passed without reported console, hydration, critical asset, or route-load failures.

## 26. Visual-Direction Findings

The guidance remains a restrained scientific capability orientation layer. It is not a quest log, mission planner, progress checklist, generated-guidance system, fake console, or achievement surface.

## 27. Scope-Creep Search Findings

Scope-creep search found expected hits in docs, tests, and pre-existing non-GW6 production surfaces. The GW6 guidance layer did not introduce storage, persistence, saved guidance state, dismissed-tip state, onboarding progress, analytics, user profiling, fake actions, Lab records, Atlas discoveries, behavioral landscapes, timestamps, random IDs, UUIDs, fingerprints, runtime behavior, template behavior, or Builder execution behavior.

## 28. Defects Found

- Pre-existing timing-sensitive uncertainty test design: one aggregate test case exceeded the default Vitest budget.
- Environment/test-runner blocker: stale Next.js dev server on port 3000 served missing app chunks and prevented hydration.
- Copy risk: negated advice-system vocabulary in capability guidance and docs could still sound like a guidance/recommendation product.

## 29. Defects Fixed

- Split the uncertainty production-template numeric-parameter coverage into per-template cases without weakening assertions.
- Stopped the stale dev server and reran rendered checks against a fresh server.
- Hardened capability-guidance copy away from advice-system vocabulary.

## 30. Deferred Issues

- Actual browser zoom remains unverified.
- Screen-reader behavior remains unverified.
- Assistive-technology behavior remains unverified.
- Forced-colors behavior remains unverified.
- Full WCAG conformance is not claimed.
- User-comprehension validation is not claimed.
- Scientific validation, calibration, and real-world discovery claims remain out of scope.

## 31. Verification Commands

Passed during GW6B:

```bash
npm test -- src/simulation/__tests__/uncertainty.test.ts
npm test -- src/simulation/__tests__/uncertainty.test.ts -t "production-template numeric-parameter"
npm test
npx playwright test tests/ui/research-world-shell.spec.ts
npm run test:ui
npm test -- capabilityGuidance
npm run typecheck
npm run build
npm run perf:simulation
git diff --check
```

`npm run lint`: unavailable, package.json has no lint script.

## 32. Remaining Limitations

GW6B establishes source and rendered smoke evidence for the contextual capability guidance layer. It does not establish actual browser zoom behavior, screen-reader readiness, assistive-technology readiness, forced-colors readiness, full WCAG conformance, user-comprehension evidence, scientific validation, calibration, or empirical truth.

## 33. GW7 Readiness Decision

GW6B is ready for GW7 after the final check set remains green at commit time. GW7 still requires an explicit future prompt and must not be inferred from this audit.

GW8 later adds non-persistent landscape probe planning vocabulary on Atlas. That later planning layer does not change this GW6B audit result: contextual guidance still describes capability and does not create capability.
