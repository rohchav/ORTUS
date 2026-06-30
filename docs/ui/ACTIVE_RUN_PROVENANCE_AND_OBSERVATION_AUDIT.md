# Active Run Provenance And Observation Audit

Status: Prompt GW2B audit and bounded hardening record.

## 1. Scope

GW2B audits the committed GW2 live provenance and observation layer. It validates the World-only active-run context, non-persistence boundary, status semantics, Lab/Atlas honesty, rendered shell behavior, and scope-control integrity. It does not add saved runs, Lab records, Atlas discoveries, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, routes, dependencies, assets, or fonts.

## 2. Starting Commit

Start commit:

```text
51743b1
```

Starting `git status --short` was clean.

## 3. Routes Audited

- `/`
- `/builder`
- `/lab`
- `/atlas`

## 4. Viewports Audited

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 900 x 700
- 1280 x 600

## 5. Provenance Derivation Findings

`src/components/activeRunProvenanceObservation.ts` derives provenance from supplied active World inputs: selected template id, template descriptor, active engine seed/parameters/scenario/initialization/metadata, latest snapshot, speed, status, and intervention count.

No storage reads, storage writes, timestamps, UUIDs, random ids, fake fingerprints, server calls, hidden mutation, global provenance singleton, historical record list, generated run id, fake version, or empirical validation claim was found in the GW2 derivation path.

The fingerprint decision remains correct: GW2 does not generate a configuration fingerprint. The UI says `Not generated in GW2`.

## 6. Observation Derivation Findings

Observation remains separate from provenance. It describes current model state: run status, lifecycle status, runtime status, tick, model time, advancing state, living entity count, metric-record count, latest bounded metric rows, and intervention count.

Defect found: the no-snapshot branch formatted tick, time, living entities, and metric records as zero-like values. That was too easy to read as an observed tick-0 snapshot. GW2B fixes this by showing `No snapshot` labels when no snapshot is available while preserving numeric counts for source-backed snapshots.

The required copy remains visible:

```text
Observed values describe the model's current state, not measured real-world data.
```

## 7. Interpretation-Boundary Findings

The panel preserves the required model-boundary copy:

```text
A visual pattern in this run is evidence about this model under this configuration. It is not automatically evidence about the real system.
```

The boundary also states that configuration, seed, assumptions, template limits, stochastic variation, and external validation matter. It does not claim empirical truth, causal proof, calibrated probability, policy authority, or validation.

## 8. Non-Persistence Findings

GW2B found no GW2 localStorage, sessionStorage, IndexedDB, cookie, database, server call, route-state storage, timestamp, UUID, random id, or fingerprint path.

Existing older run-comparison and scenario-library persistence remains outside GW2. GW2 does not call those capture/save paths.

## 9. World Integration Findings

The panel appears only in World Observe through `LeftInstrumentStack`. It is registered as the `runProvenance` mode-panel slot and does not appear in the global destination shell, Lab, Atlas, Workshop, Builder, simulation runtime, or template runtime.

The World canvas, run controls, metric panels, and caveats remain reachable.

## 10. Active Run Context Accessibility Contract

GW2B preserves the GW2 continuation decision:

```text
.active-run-context is a static readable region, not a normal Tab stop.
```

The section has `aria-labelledby`, no `tabIndex={0}`, no fake interactive role, text headings, text status labels, text boundary copy, and no hover-only content.

## 11. Keyboard/Focus Findings

Rendered tests verify that Observe is keyboard reachable, `.active-run-context` is not forced into Tab order, focus moves from Observe to the next meaningful workspace tab, Shift+Tab returns sensibly, and focused elements remain visible.

The skip link remains visible on focus and targets the shared main landmark.

## 12. Status Semantics Findings

Paused remains:

```text
category: operational
state: paused
```

The active-run context keeps operational run state, evidence state, destination state, selected object state, and future-only capability state separate. The interpretation badge remains evidence/unresolved. Lab and Atlas remain capability/future-only.

## 13. Lab Future-Only Findings

Lab remains an informational future-only route. It states that live provenance exists in World and persistent Lab records are not implemented.

No saved experiments, notebooks, comparison sets, reusable asset records, fake run history, fake timestamps, activity feeds, disabled fake controls, or send-to-Lab behavior was added.

## 14. Atlas Future-Only Findings

Atlas remains an informational future-only route. It states that GW2 creates no Discovery Atlas records and that Atlas will not certify real-world discoveries.

No Discovery Atlas records, behavioral landscapes, sampled-region maps, evidence scores, fake discoveries, coverage percentages, or map-this-run behavior was added.

## 15. Responsive Findings

The rendered shell suite covers the established viewport set across `/`, `/builder`, `/lab`, and `/atlas`. It checks document-level horizontal overflow, route surfaces, World usability, Lab/Atlas future-only copy, Workshop preservation, and the Observe active-run panel.

GW2B also hardens panel heading/subheading wrapping so status pills do not force clipped single-row layout inside the rail.

## 16. Short-Height Findings

The 1280 x 600 short-height route checks pass. The active-run panel remains inside the intentional workspace scroll region rather than becoming a global overlay or blocking run controls.

## 17. Browser Zoom Status

Actual browser zoom was attempted against a local dev server with Chromium keyboard zoom shortcuts at 125%, 150%, and 200% for `/`, `/builder`, `/lab`, and `/atlas`. In this headless Playwright environment, `devicePixelRatio`, `innerWidth`, `clientWidth`, and `visualViewport.scale` did not change, so the attempt did not produce reliable actual browser-zoom evidence.

Actual browser zoom at 125%, 150%, and 200% was not verified.

Viewport automation is not browser zoom.

## 18. Reduced-Motion Findings

Rendered reduced-motion checks pass for World, Lab, Atlas, and Workshop. The shell navigation remains functional, the browser context reports `prefers-reduced-motion: reduce`, and visible focus remains intact.

No informational state in the active-run context depends on animation.

## 19. Axe Findings

Axe scans pass for the default rendered states of `/`, `/builder`, `/lab`, and `/atlas` in the shell suite. World scans include the Observe active-run panel.

Axe passing is not WCAG conformance, screen-reader readiness, assistive-technology readiness, forced-colors readiness, browser-zoom readiness, or user-comprehension evidence.

## 20. Console/Hydration/Asset Findings

The Playwright diagnostics reported no page errors, unexpected console errors, hydration mismatch messages, missing critical assets, failed critical document/script/stylesheet/font/image responses, or route-load failures.

The repeated Node warning that `NO_COLOR` is ignored because `FORCE_COLOR` is set is test-server noise, not a page console failure.

## 21. Visual-Direction Findings

The active-run panel reads as a compact scientific observation/provenance surface. It does not use mission-log, command-console, game-stat, fake terminal, archive, achievement, or Discovery Atlas styling.

No fonts, images, icons, remote assets, CSS frameworks, UI libraries, permanent glow effects, scanlines, or tactical vocabulary were added.

## 22. Scope-Creep Search Findings

The required broad search found expected hits in docs, tests, older scenario/run-comparison persistence, planned future concepts, and guardrail text.

The narrowed GW2 production-surface search found no storage/time/random/fingerprint APIs in:

- `src/components/activeRunProvenanceObservation.ts`
- `src/components/RunProvenanceObservationPanel.tsx`
- `src/app/lab/page.tsx`
- `src/app/atlas/page.tsx`
- `src/lib/workspaceModes.ts`
- `src/lib/workspacePanels.ts`

Production GW2 hits for `saved`, `Discovery Atlas`, and `behavioral landscapes` are boundary copy, not implemented behavior.

## 23. Defects Found

- Missing-snapshot observation values used zero-like labels that could be misread as source-backed model state.
- Rendered tests did not explicitly assert the active-run section has no `tabindex`/fake role, Shift+Tab behavior around Observe/Intervene, or absence of the panel on Lab/Atlas.

## 24. Defects Fixed

- No-snapshot tick, time, living-entity, and metric-record display labels now say `No snapshot`.
- Active-run panel heading/subheading rows now wrap.
- Rendered tests now assert no fake active-run tab stop, no fake interactive role, Shift+Tab focus behavior, and no active-run context on Lab/Atlas.

## 25. Deferred Issues

- Actual browser zoom remains unverified.
- No screen-reader walkthrough was performed.
- No assistive-technology walkthrough was performed.
- No forced-colors audit was performed.
- No full WCAG conformance audit was performed.
- No user-comprehension validation was performed.

## 26. Verification Commands

Baseline before edits:

- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 61 files and 491 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Post-hardening verification:

- `npm test -- provenance observation`: passed, 1 file and 6 tests.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed.
- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 61 files and 491 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

## 27. Remaining Limitations

GW2B gives rendered Playwright/Axe smoke evidence and source-level hardening. It does not prove scientific validity, empirical truth, calibration, causal effects, screen-reader readiness, assistive-technology readiness, forced-colors readiness, actual browser-zoom readiness, complete WCAG conformance, or user comprehension.

## 28. GW3 Readiness Decision

Decision: ready for GW3 after GW2B is committed, with strict boundaries.

Meaning: GW2B does not itself implement GW3. GW3 may begin only through an explicit future prompt and must not treat GW2 live provenance as saved Lab records, Atlas discoveries, behavioral landscapes, persistence, validation evidence, or empirical truth.
