# Research World Destination Shell Audit

Status: Prompt GW1B audit and hardening record, updated after Prompt GW3. This audit reviews the GW1 destination shell. GW2 later adds live World-only active-run provenance and observation context, and GW3 later adds live World-only intervention readiness context. They do not change this GW1B shell audit into a persistence, Lab intervention record, Discovery Atlas, behavioral landscape, progression, runtime, template, Builder-execution, dependency, asset, font, `/world`, `/workshop`, or redirect implementation record.

## 1. Scope

GW1B inspected the shared World / Lab / Atlas / Workshop destination shell, route contract, navigation, Lab and Atlas future-only pages, World integration, Workshop integration, keyboard behavior, responsive/short-height behavior, status semantics, console diagnostics, Axe results, persistence boundaries, and regression risk.

This was an audit and hardening pass. Production behavior was not expanded.

## 2. Starting Repository State

Start commit:

```text
380755d
```

Starting worktree:

```text
git status --short
```

returned no tracked changes.

Recent history:

```text
380755d feat: Implement ORTUS Research World shell with future-only destinations
1a94375 feat: add Playwright for UI testing and accessibility audits
e3e08c9 feat: Enhance BuilderStatusBadge and StatusPill components with additional accessibility and semantic attributes
f632e79 Refactor documentation and roadmap to incorporate GW0: Research World Progression Mini-Roadmap
714751e Update documentation and audit reports for UX1 and related prompts
```

Ignored Playwright artifacts may exist in `test-results/` or `playwright-report/`; they are not tracked source.

## 3. Baseline Before Edits

Required checks were run before hardening edits:

- `npm run test:ui`: passed, 44 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 60 files and 485 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Baseline local performance smoke:

```text
Flocking 100 agents: 216.94 ticks/sec
Flocking 500 agents: 30.23 ticks/sec
Forest Fire 80x60: 46.56 ticks/sec
Predator-Prey default: 142.02 ticks/sec
```

## 4. Sources Reviewed

Reviewed source and docs included:

- `README.md`
- `planned_roadmap.md`
- `docs/roadmap.md`
- `docs/concepts.md`
- `src/simulation/README.md`
- `docs/codex/CURRENT_CONTEXT.md`
- `docs/codex/SESSION_LOG.md`
- `AGENTS.md`
- `docs/ui/RESEARCH_WORLD_DESTINATION_SHELL.md`
- `docs/ui/HCI_AUDIT.md`
- `docs/ui/WORKSPACE_INFORMATION_ARCHITECTURE.md`
- `src/lib/researchDestinations.ts`
- `src/lib/researchDestinations.test.ts`
- `src/components/researchWorld/*`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/lab/page.tsx`
- `src/app/atlas/page.tsx`
- `src/app/builder/page.tsx`
- `src/components/AppShell.tsx`
- `src/components/builder/BuilderShell.tsx`
- `tests/ui/research-world-shell.spec.ts`
- `tests/ui/semantic-foundation.spec.ts`
- relevant `src/app/globals.css` shell, focus, responsive, and reduced-motion rules

## 5. Route Contract

Canonical routes remain:

```text
/         -> World
/lab      -> Lab
/atlas    -> Atlas
/builder  -> Workshop
```

`/world` and `/workshop` are not app routes and must not become aliases or redirects. GW1B hardening adds explicit rendered coverage that these legacy-looking paths stay unavailable instead of silently redirecting to canonical destinations.

## 6. Destination Registry

The route registry remains the source of truth for destination order, availability, labels, and routes. Query strings and hash fragments are ignored for current-route matching, but they do not create `/world` or `/workshop` aliases.

Hardening added focused unit coverage for query/hash normalization and alias rejection.

## 7. Shell Architecture

The shared shell continues to live in the root layout and provides one skip link, one named header/banner, one ORTUS home brand link, one destination-navigation landmark, one current-destination context region, and one primary `main` landmark.

`AppShell` and `BuilderShell` remain route surfaces inside the shared `main` landmark. They do not own duplicate primary `main` landmarks.

## 8. Duplicate Chrome Audit

No duplicate global ORTUS destination shell was found on canonical routes. World-specific runtime status remains inside World. Workshop-specific Builder controls remain inside Workshop. Lab and Atlas do not render fake route-specific operational chrome.

Hardening adds rendered assertions for unique shell landmarks and the single global ORTUS home link.

## 9. Destination Navigation

Navigation remains native links with this order:

```text
World, Lab, Atlas, Workshop
```

Hardening asserts that there are exactly four links, no query/hash payloads, exactly one `aria-current="page"`, no disabled or `aria-disabled` navigation items, and text-visible `Future` labels for Lab and Atlas.

## 10. Current Destination Context

The current destination context communicates route location and future-only capability status where relevant. It does not communicate simulation tick state, Builder mode, saved-world counts, XP, discoveries, or fabricated user state.

Unknown routes show an unrecognized-route context rather than masquerading as a canonical destination.

## 11. Skip Link And Focus

GW1 already fixed the real skip-link focus defect: the active skip link could initially sit outside the viewport because its reveal transition had not settled.

GW1B verifies the fixed-position skip link remains keyboard-focusable and visible immediately on focus in the rendered shell suite. Hardening also checks visible focus under reduced-motion contexts.

## 12. Keyboard Operation

Rendered tests cover first-tab focus visibility, skip-link activation to `#research-world-main`, native keyboard navigation from World to Lab and then Workshop, and focus visibility under reduced motion.

This is useful keyboard smoke evidence. It is not a complete screen-reader or assistive-technology audit.

## 13. World Integration

World remains `/`. The simulation workspace remains the primary functional surface. Runtime status, template controls, canvas rendering, metrics, model caveats, interventions, experiments, comparison, and run controls remain World-specific.

GW1B found no evidence that the destination shell moved runtime state into the global shell.

## 14. Workshop Integration

Workshop remains `/builder`. Builder modes, Author Schema, Graph View, validation/repair suggestions, fit reports, scenario planning, and Builder status badges remain inside the Workshop route.

GW1B found no new Builder execution behavior, model-schema execution, graph execution, or template activation through the destination shell.

## 15. Lab Future-Only Boundary

Lab remains reachable and future-only. It documents planned responsibilities such as experiments, notebooks, comparison sets, and reusable research assets without pretending they exist.

The page does not render fake saved experiments, fake notebooks, fake counts, fake timestamps, fake recent activity, fake charts, fake storage UI, disabled future controls, XP, unlocks, achievements, locked state, or progress percentages.

## 16. Atlas Future-Only Boundary

Atlas remains reachable and future-only. It documents future Discovery Atlas responsibilities without implementing discovery records, behavioral landscapes, sampled-region maps, evidence-linked regimes, fake maps, fake discoveries, fake sampled regions, fake evidence scores, locked territories, achievements, or progress percentages.

Atlas copy continues to say it will not certify discoveries about the real world.

After GW2, Lab and Atlas additionally state that live run provenance exists in World only. After GW3, they additionally state that live intervention readiness exists in World only. Persistent Lab records, persistent Lab intervention records, and Discovery Atlas records remain unimplemented.

## 17. Status Semantics

Lab and Atlas status remains:

```text
category: capability
state: future-only
```

GW1B found no disabled, failed, locked, unavailable, supported, validated, or operational-success status misuse in the destination records or rendered future-only status pills.

## 18. Persistence And Storage

GW1B found no destination-shell localStorage, sessionStorage, IndexedDB, cookie, database, account, cloud, saved-navigation-state, saved-world, saved-experiment, notebook, reusable-asset-storage, visit-history, or cross-route research-context implementation.

Existing unrelated local browser storage for older run-comparison features remains outside GW1/GW1B destination-shell scope and is not new shell persistence.

## 19. Progression And Gamification

GW1B found no destination-shell XP, levels, ranks, streaks, missions, hard locks, unlocks, achievements, progress bars, daily rewards, route-discovery effects, psychological progression profiling, or fabricated research progress.

Lab and Atlas are reachable future-only destinations, not locked game areas.

## 20. Runtime, Template, And Builder Boundaries

The shell still does not:

- execute model schemas;
- execute visual builder graphs;
- execute social/cognitive semantic artifacts;
- generate scenarios, RunConfigs, snapshots, templates, or engines;
- activate template runtime behavior from route selection;
- convert compatibility reports into runtime behavior;
- add a hidden interpreter or compiler.

World and Workshop preserve their existing workflows without widening runtime capability claims.

## 21. Responsive And Short-Height Checks

Rendered shell coverage includes:

```text
1440 x 900
1280 x 720
1024 x 768
900 x 700
1280 x 600
```

The suite checks that canonical routes render, no document-level horizontal overflow appears, key shell regions remain inside the viewport, World remains usable, Workshop remains usable, and Lab/Atlas scroll their informational surfaces instead of clipping the whole page.

This is viewport automation, not a complete mobile workflow claim.

## 22. Reduced Motion

Rendered reduced-motion checks pass for all four canonical destinations. The browser context is explicitly set to `prefers-reduced-motion: reduce`, destination navigation remains functional, and keyboard focus remains visible.

This does not verify every animation in the broader application.

## 23. Axe Accessibility

Axe scans pass for the default rendered state of `/`, `/lab`, `/atlas`, and `/builder` in the shell suite.

Axe passing is not WCAG conformance, screen-reader readiness, assistive-technology readiness, user-comprehension evidence, or a guarantee that every workflow is accessible.

## 24. Console, Hydration, And Asset Diagnostics

The Playwright diagnostics watch for page errors, console errors, hydration mismatch text, failed critical requests, and failing critical document/script/stylesheet/font/image responses on canonical route tests.

The repeated Node warning that `NO_COLOR` is ignored because `FORCE_COLOR` is set is a test-server warning, not a page console failure.

## 25. Visual Review Limits

Rendered Playwright checks cover layout overflow, viewport presence, route surfaces, and Axe. They do not provide a human screenshot-comparison review, visual-polish certification, or full mobile ergonomics proof.

Actual browser zoom at 125%, 150%, and 200% was not verified.

## 26. Screen Reader And Assistive Technology Limits

No screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, complete WCAG audit, or user-comprehension test was performed.

Do not claim screen-reader readiness, assistive-technology readiness, forced-colors readiness, full WCAG conformance, or user comprehension from GW1B.

## 27. Hardening Performed

Hardening was intentionally bounded:

- `tests/ui/research-world-shell.spec.ts` now asserts unique shell landmarks, the single ORTUS home brand link, clean destination navigation URLs, exactly one current nav item, no disabled future-only nav links, visible skip-link focus, reduced-motion focus visibility, legacy route non-redirect behavior, and stricter fake-future-data exclusions.
- `src/lib/researchDestinations.test.ts` now asserts query/hash normalization and rejects `/world` and `/workshop` aliases with query/hash variants.
- Documentation now records the GW1B audit result and remaining unverified areas.

No production runtime, route, UI feature, persistence, dependency, asset, font, template behavior, Builder execution behavior, model-schema execution behavior, saved intervention plan, Lab intervention record, Atlas discovery, or Lab/Atlas functionality was added by this GW1B audit.

## 28. Findings And Defects

Confirmed production defects found in GW1B:

```text
None.
```

Evidence defects found in GW1B:

```text
The existing rendered suite proved the main shell behaviors, but it did not explicitly assert landmark uniqueness, clean nav URLs, disabled-state absence, or no `/world`/`/workshop` alias behavior. GW1B hardened those tests.
```

The prior GW1 continuation skip-link defect remains fixed and is covered by the hardened shell suite.

Rendered hardening verification:

- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed.
- `npm run test:ui`: passed, 45 passed.
- Repeated `NO_COLOR` / `FORCE_COLOR` warnings came from the Node web server process, not page console diagnostics.

Final integrity verification:

- `npm run typecheck`: passed.
- `npm test`: passed, 60 files and 485 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Final local performance smoke:

```text
Flocking 100 agents: 216.14 ticks/sec
Flocking 500 agents: 30.15 ticks/sec
Forest Fire 80x60: 43.94 ticks/sec
Predator-Prey default: 139.18 ticks/sec
```

## 29. Readiness Decision

Decision: ready for GW2 only as a route-shell prerequisite, with strict boundaries.

Meaning:

- The destination shell is audited enough to stop blocking the next explicitly approved Research World prompt.
- GW2 must still arrive through its own implementation prompt and audit.
- GW1B does not make Lab persistent, Atlas functional, Discovery Atlas implemented, behavioral landscapes implemented, progression implemented, templates changed, Builder executable, schemas runnable, visual builder graphs executable, or model output empirical truth.
- Later GW3 intervention-readiness work remains a separate World Intervene layer and does not make Lab persistent, Atlas functional, intervention outcomes causal proof, or model output empirical truth.
- Actual browser zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, full WCAG conformance, and user-comprehension evidence remain open.
