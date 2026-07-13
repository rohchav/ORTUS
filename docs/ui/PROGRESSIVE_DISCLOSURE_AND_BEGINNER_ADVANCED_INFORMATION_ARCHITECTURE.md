# UX5: Progressive Disclosure And Beginner/Advanced Information Architecture

## 1. Scope

UX5 changes information architecture, copy layering, disclosure, and component-local view state on World, Workshop, Lab, and Atlas. It adds no runtime capability, template behavior, Builder execution, persistence, personalization, recommendation, progression, Guided Builder, Lab record, Atlas record, landscape sample, probe execution, validation, or calibration.

## 2. Starting Commit

UX5 started from clean, remote-aligned `main` at `be3e05f docs: align remote state and product mission hygiene`. `HEAD` and `origin/main` matched before edits.

## 3. UX3 Findings Addressed

UX3 found that first-run comprehension was too expensive: World was the strongest sandbox, Workshop was an expert Advanced Builder, and Lab and Atlas were honest but concept-heavy. UX5 addresses the reading order and density problem. It does not claim that beginner comprehension has been validated with users.

## 4. UX4/UX4B Visual Foundation Dependency

UX5 uses the audited UX4 workbench surfaces, semantic status treatment, softened panels, and route hierarchy. It does not reopen the UX4 palette or add a broad redesign.

## 5. RH1 Clarification Dependency

RH1 established two boundaries that UX5 preserves: bounded local World comparison storage is not Lab or Atlas persistence, and existing Experiment Runner sweeps are not Atlas landscape sampling or landscape probe execution.

## 6. Progressive-Disclosure Principles

The implemented order is plain-language orientation, primary current work, nearby capability and evidence caveats, then expandable technical detail. Technical precision is layered, not deleted. No introductory sequence gates expert tools.

## 7. Disclosure State Model

`Disclosure` uses component-local `useState(false)`. Controls are buttons with visible text, `aria-expanded`, and `aria-controls`; controlled content uses `hidden` when collapsed. Route orientation, capability detail, and Lab/Atlas technical sections use the same bounded primitive.

## 8. Non-Persistence Boundary

UX5 adds no new persistence. Existing bounded World comparison and UI storage remain unchanged. Lab and Atlas research persistence remain unimplemented. UX5 does not use `localStorage`, `sessionStorage`, IndexedDB, cookies, Zustand persistence, or existing panel-storage helpers for disclosure state.

## 9. Beginner/Advanced IA Model

"Beginner" means a comprehensible default reading order, not a user classification or stored mode. "Advanced" means exact existing controls and metadata remain directly reachable. Workshop remains the Advanced Builder; UX5 does not create Guided Builder.

## 10. Two-Tier Language Model

The shared orientation model pairs plain terms with exact vocabulary one disclosure away: this run / active local run, starting recipe / scenario, repeatable randomness / deterministic seed, exact saved tick state / engine snapshot restore point, model structure draft / `ortus.modelSchema`, structure map / `ortus.visualBuilderWorkspace`, structural resemblance / compatibility rather than conversion, questions to investigate / non-runnable scenario planning, model-behavior evidence state, behavioral landscape, and non-executable landscape probe plan.

## 11. Shared Route Orientation

Every canonical route now shows its name, one-sentence purpose, current starting point, concise model or capability boundary, and technical-detail disclosure. The orientation source is `src/lib/routeOrientation.ts`; it does not inspect user behavior or simulation state.

## 12. World Changes

World receives a compact orientation at the top of the selected workspace rail. The current mode's real controls appear before the collapsed capability inventory. The World Stage and persistent run dock remain unchanged and world-dominant. Template, scenario, seed, parameters, snapshots, metrics, Observe, Intervene, Experiment, Compare, Debug, import/export, comparison storage, and existing experiment sweeps remain reachable.

## 13. Workshop Changes

Workshop leads with a plain Advanced Builder orientation and preserves Workspace Inspector, Author Schema, Graph View, JSON import/export, validation, repair suggestions, fit reports, scenario planning, exact metadata, and graph outlines. A valid structure remains non-runnable; Graph View remains inspection rather than visual programming; fit remains analysis rather than conversion; plans remain questions rather than generated scenarios.

## 14. Lab Changes

Lab defaults to purpose, exact non-persistence boundary, model-only evidence boundary, and a three-state conceptual lifecycle preview. The complete lifecycle vocabulary, ledger anatomy, and extended boundaries remain under `Show Lab technical details`. Nothing on this route is a saved experiment, evidence record, notebook, or run history.

## 15. Atlas Changes

Atlas defaults to model-space orientation, exact no-sampling boundary, sampled-versus-unsampled distinction, and a compact conceptual map. The full evidence legend, behavioral-landscape vocabulary, probe-plan anatomy, regime/transition/sensitivity terms, and extended boundaries remain under `Show Atlas technical details`. No sampled landscape, saved map, probe execution, regime detection, or discovery record exists here yet.

## 16. Capability Guidance Changes

Capability guidance remains backed by `src/lib/capabilityGuidance.ts`. The route boundary, principle, available capability, and first do-not-assume boundary remain visible. Additional available items, planning-only items, not-implemented items, remaining boundaries, and related destinations remain available through `Show all capabilities`. Guidance describes capability; it does not create capability or infer user needs.

## 17. Advanced-User Preservation

No expert tool requires an introductory sequence. World workflow tabs and run controls remain direct. Workshop's three advanced modes and file/status actions remain direct. Technical language is visible by default where operationally necessary or one disclosure away where explanatory.

## 18. Accessibility Considerations

The disclosure control is a native button with text, `aria-expanded`, and `aria-controls`. Content remains in logical DOM order. Each route retains one H1, the shared skip link, semantic headings, and existing route landmarks. Lab and Atlas gain only the three intentional disclosure controls; their conceptual scaffolds gain no fake controls.

## 19. Keyboard/Focus Behavior

Enter and Space toggle disclosures through native button behavior. The trigger retains focus after toggling. Existing visible-focus styles apply, no focus trap is introduced, and hidden disclosure content contains no focused element.

## 20. Responsive Behavior

The orientation and technical-term grids use bounded responsive tracks and wrapping text. Post-change rendered verification passed all four routes at `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`: 20 route/viewport combinations. The contracts found no horizontal overflow. Responsive coverage is automated browser evidence, not a mobile-workflow or actual-zoom claim.

## 21. Short-Height Behavior

World orientation stays inside the existing workspace rail rather than covering the World Stage or run dock. The rendered gate found a genuine Workshop defect at `1280x720`: explanatory rows left too little height for the first expert-workspace focus target. Workshop now renders the active expert workspace before capability guidance and gives the short-height workspace a bounded minimum row inside a scrollable shell. The import editor then passed full-focus-visibility checks at `1280x720` and `1280x600`. Lab and Atlas keep expanded detail in route scroll rather than fixed-height containers.

## 22. Browser Zoom Status

Actual browser zoom at 125%, 150%, and 200% was not verified.

## 23. Reduced-Motion Behavior

Disclosure has no custom animation. Existing reduced-motion CSS still collapses global transition and animation durations. Reduced-motion browser checks passed on World, Workshop, Lab, and Atlas.

## 24. Axe Results

The post-change gate initially found duplicate named `Lab` and `Atlas` landmarks because each outer page wrapper repeated the orientation landmark name. Removing the redundant outer accessible names preserved the single H1 and route-orientation landmark. Focused default-state Axe scans then passed on World, Workshop, Lab, and Atlas; the full UI suite also passed its existing World and Builder Axe scans. This is not screen-reader certification or WCAG conformance.

## 25. Console/Hydration Results

The final focused and full rendered suites reported no console, page, hydration, failed-request, critical-response, or asset diagnostics. The production build prerendered all four routes after the UX5 source change.

## 26. World Comparison-Storage Boundary

Existing bounded local World run-summary comparison storage remains unchanged. It is not persistent Lab evidence, Atlas discovery storage, a saved behavioral landscape, a saved probe plan, or real-world validation.

## 27. Experiment-Sweep Boundary

Existing local experiment sweeps remain implemented. Atlas landscape sampling and landscape probe execution remain unimplemented. UX5 does not rename or route World Experiment Runner sweeps into Atlas.

## 28. No-Fake-Functionality Boundary

UX5 adds disclosure controls only. It adds no Lab forms, record ids, timestamps, saves, notebooks, publication actions, World transfers, Atlas heatmaps, contours, coordinates, scores, samples, probe controls, sweep controls, queues, regimes, discoveries, or generated data.

## 29. Production Files Changed

- `src/components/ui/Disclosure.tsx`
- `src/lib/routeOrientation.ts`
- `src/components/researchWorld/RouteOrientationPanel.tsx`
- `src/components/researchWorld/CapabilityGuidancePanel.tsx`
- `src/components/LeftInstrumentStack.tsx`
- `src/components/builder/BuilderShell.tsx`
- `src/app/lab/page.tsx`
- `src/app/atlas/page.tsx`
- `src/app/globals.css`

No simulation, template, registry, engine, store, persistence, route, dependency, asset, font, or icon file changed.

Rendered hardening reordered Workshop so its active expert workspace precedes capability guidance, added a short-height workspace minimum and scroll path, and removed duplicate outer Lab/Atlas landmark names. These are UX5 layout and accessibility corrections, not Builder execution or route behavior.

## 30. Test Files Changed

- `src/lib/routeOrientation.test.ts`
- `tests/ui/research-world-shell.spec.ts`
- `src/simulation/__tests__/roadmap.test.ts`

The focused shell suite grew from 30 to 34 tests by adding one disclosure reload/non-persistence case per route. Final focused result: `34 passed`. The full UI suite grew from 45 to 49 tests. Final full UI result: `49 passed`.

## 31. Documentation Files Changed

UX5 updates this record plus README, planned and canonical roadmaps, concepts, Research World progression, prior UX handoff docs, HCI/workspace IA, current context, session log, and durable AGENTS guardrails. Product philosophy is unchanged because UX5 does not alter its mission.

## 32. Verification Commands

Baseline before edits: focused Playwright `30 passed`; full UI `45 passed`; typecheck passed; `67` unit files and `543` tests passed; build passed; performance smoke passed; `git diff --check` passed. The sandboxed Playwright start was classified only after manual `listen EPERM` confirmation, then rerun through the allowed local-server path.

Final post-change verification: focused Playwright passed `34` tests; full UI Playwright passed `49` tests; typecheck passed; full unit tests passed `68` files and `548` tests; build passed; simulation performance smoke passed; and `git diff --check` passed. Direct screenshot inspection covered all four routes at `1280x720` and `1280x600`. Headless Chromium keyboard shortcuts did not change zoom metrics on any route, so no actual browser-zoom claim is made.

`npm run lint: unavailable, package.json has no lint script.`

## 33. Remaining Limitations

UX5 is expert design work plus automated contracts, not a user-comprehension study. Actual browser zoom at 125%, 150%, and 200% was not verified. Screen-reader behavior, assistive-technology behavior, forced-colors behavior, full WCAG conformance, and mobile workflow readiness remain unverified. Model output remains model output, not empirical truth.

## 34. UX5B Requirement And Completion

UX5B was required to audit the implemented hierarchy, disclosure defaults, expert efficiency, language precision, rendered accessibility evidence, and any layout defects. That audit is now complete in `PROGRESSIVE_DISCLOSURE_AND_BEGINNER_ADVANCED_INFORMATION_ARCHITECTURE_AUDIT.md` and must not be retroactively treated as optional merely because UX5 tests passed.

## 35. GW9 Pause Decision

GW9 remains paused. UX5 does not implement ephemeral landscape sampling, probe execution, saved plans, sampled regions, regimes, or discoveries.

## 36. Final Decision

The post-change rendered and full verification gates pass. The bounded responsive and landmark defects found by those gates are fixed and reverified. No blocking UX5 accessibility, hierarchy, scope, persistence, or runtime defect remains in the covered paths. UX5 complete. UX5B followed and is now complete. UX6 is next. GW9 remains paused.

## 37. UX5B Audit Result

UX5B audits this implementation in source and rendered browsers. The canonical audit record is `PROGRESSIVE_DISCLOSURE_AND_BEGINNER_ADVANCED_INFORMATION_ARCHITECTURE_AUDIT.md`. It classifies the shared hierarchy as clear in the covered paths, preserves exact technical language and direct expert access, verifies reload-reset local state and expanded-state Axe results across all 20 route/viewport combinations, and finds no production defect requiring hardening.

UX5B changes audit records and roadmap contracts only. It does not add Guided Builder, persistence, personalization, progression, runtime/template/Builder execution, Lab/Atlas behavior, sampling, probe execution, or GW9 behavior. User-comprehension, actual browser zoom, screen-reader, assistive-technology, forced-colors, mobile-workflow, and WCAG claims remain unverified.

UX5B complete. UX6 is next. GW9 remains paused.
