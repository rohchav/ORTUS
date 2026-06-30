# ORTUS Research World Destination Shell

Status: Prompt GW1 implementation source of truth, audited and hardened by Prompt GW1B, updated after Prompt GW2. GW1 introduces a persistent World / Lab / Atlas / Workshop destination shell across routes. GW1B hardens the shell evidence without expanding product behavior. GW2 adds live active-run provenance inside World only. This destination shell does not implement persistent research data, Discovery Atlas logic, behavioral landscapes, progression systems, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, fonts, or storage.

## 1. Purpose And Scope

GW1 creates the first structural Research World shell around workflows that already exist. GW1B audits and hardens that shell. The GW1B audit record is `docs/ui/RESEARCH_WORLD_DESTINATION_SHELL_AUDIT.md`.

Required principle:

```text
The Research World shell must wrap and organize validated workflows before attempting to replace them.
```

## 2. Meaning Of Persistent Shell

GW1 persistence refers to persistent application structure across routes, not persistent user research data.

The shell is persistent because the same ORTUS identity, destination navigation, current-destination context, skip link, main landmark, and content boundary appear across the supported routes.

It does not save experiments, notebooks, comparison sets, reusable assets, user preferences, visit history, worlds, discoveries, progress, or cross-route research state.

## 3. Destination Model

The canonical destination model lives in `src/lib/researchDestinations.ts`.

Destination order:

1. World
2. Lab
3. Atlas
4. Workshop

World and Workshop are available destinations. Lab and Atlas are future-only informational foundations. Future-only destination does not mean locked destination.

## 4. Route Contract

Canonical routes:

```text
/         -> World
/lab      -> Lab
/atlas    -> Atlas
/builder  -> Workshop
```

GW1 does not add `/world` or `/workshop`, and it does not redirect `/` or `/builder`.

## 5. Shell Architecture

The shared shell is mounted from the root layout and contains:

- skip link;
- ORTUS identity using the canonical sharp mark and wordmark;
- primary destination navigation;
- current destination context;
- one primary `main` landmark;
- a stable route-content boundary.

`AppShell` and `BuilderShell` are route surfaces inside that shared main landmark. They no longer own primary `main` landmarks. World keeps `TopStatusBar` as a route-specific operational surface. Workshop keeps `BuilderHeader` as a route-specific Builder control surface.

## 6. Global Header

The global header communicates product identity, destination structure, and current location. It does not communicate simulation tick, run status, Builder mode, saved-world counts, XP, discoveries, or fabricated user state.

## 7. Destination Navigation

The primary navigation is a native-link landmark:

```html
<nav aria-label="Research World destinations">
```

Links preserve ordinary route behavior and expose `aria-current="page"` only for the current route. Current destination is not the same as active simulation, selected model object, supported evidence, or validation.

## 8. World Integration

`/` remains the World route. It preserves template selection, simulation configuration, canvas/world rendering, run controls, pause/run status, metrics, model caveats, and current state behavior.

World has a route-level `h1` of `World` and receives the shared destination shell. The World canvas remains the primary functional surface.

GW2 adds `Active Run Context` in the World Observe rail. It is live UI context over the active engine and latest snapshot. It does not save a run, create a Lab record, create an Atlas record, or validate model output.

## 9. Workshop Integration

`/builder` remains the direct expert route and becomes the Workshop destination. The internal surface remains Builder because that name is precise for current structural authoring and inspection tools.

Workshop preserves Builder modes, Author Schema, Graph View, validation and repair suggestions, fit reports, scenario planning, status badges, and current local Builder state. It does not add execution, model composition, persistent assets, or runtime activation.

## 10. Lab Informational Foundation

`/lab` is an honest future-only route. It documents Lab responsibility and does not simulate persistence.

Required boundary:

```text
Lab is a future Research World destination. Persistent experiments, notebooks, comparison sets, and reusable research assets are not implemented in GW1 or GW2.
The Lab route documents destination responsibility. It does not simulate persistence.
GW2 exposes live run provenance in World. Persistent Lab records are still not implemented.
```

The page lists planned artifact categories only as future responsibilities. It renders no fake saved experiments, fake notebooks, fake counts, fake timestamps, fake recent activity, fake charts, fake storage, or disabled controls.

## 11. Atlas Informational Foundation

`/atlas` is an honest future-only route. It documents Atlas responsibility and does not simulate discovery infrastructure.

Required boundary:

```text
Atlas is a future Research World destination. Discovery records, behavioral landscapes, sampled-region maps, and evidence-linked model regimes are not implemented in GW1 or GW2.
Atlas will map investigated model behavior. It will not certify discoveries about the real world.
GW2 does not create Discovery Atlas records. Atlas remains future-only.
```

The page lists future Atlas concepts only as planned responsibilities. It renders no fake maps, fake discoveries, fake sampled regions, fake evidence scores, fake regime labels, achievements, locked regions, or progress percentages.

## 12. Status Semantics

Lab and Atlas use UX2 status semantics:

```text
category: capability
state: future-only
```

They do not use disabled, failed, locked, unavailable, supported, or validated states.

## 13. Responsive Behavior

The shell is designed for the existing UX2B viewport set:

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 900 x 700
- 1280 x 600

The navigation remains text-based and visible. GW1 does not certify mobile workflow quality.

## 14. Keyboard And Accessibility

GW1 uses native links, visible focus styles, a skip link to the shared main landmark, one primary main landmark, route-level `h1` headings, and text-visible future-only status.

Rendered continuation finding: the first shell Playwright run found that the focused skip link could still report `top = -44` immediately after keyboard focus because the reveal transition had not settled. The active element was the `Skip to destination content` anchor. GW1 fixes this in production CSS by making the skip link fixed-position, revealing it immediately on both `:focus` and `:focus-visible`, and keeping an explicit focus outline.

Axe or Playwright passing is not a screen-reader audit. GW1 does not claim screen-reader, assistive-technology, forced-colors, browser-zoom, full WCAG, or user-comprehension verification.

## 15. Current Workflow Preservation

A user who knows `/` and `/builder` can still reach and operate those workflows directly. Lab and Atlas are reachable but do not gate current workflows.

## 16. Persistence Boundary

No localStorage, IndexedDB, cookies, database, server storage, accounts, cloud storage, saved navigation state, saved worlds, saved experiments, notebooks, reusable asset storage, or cross-route research context is introduced by GW1.

Current route unmount/remount behavior remains ordinary React/Next route behavior unless a specific future persistence prompt changes it.

## 17. Progression Boundary

GW1 adds no XP, levels, ranks, achievements, badges, unlocks, progress bars, first-visit tutorials, missions, route discovery effects, contextual recommendations, or progression state.

## 18. Playwright Verification

GW1 adds `tests/ui/research-world-shell.spec.ts` to cover all four routes, destination navigation, `aria-current`, route preservation, Lab/Atlas boundaries, viewports, keyboard focus, reduced motion, and Axe scans.

GW1B hardens that suite with route-alias, unique-landmark, clean-navigation, single-current-destination, no-disabled-future-link, skip-link focus, reduced-motion focus, and stricter Lab/Atlas honesty checks. It also hardens destination-registry tests for query/hash normalization and `/world`/`/workshop` alias rejection.

Focused rerun passed: `npx playwright test tests/ui/research-world-shell.spec.ts -g "World shell contract holds at desktop 1440x900"`.

Full shell suite passed after GW1B hardening: `npx playwright test tests/ui/research-world-shell.spec.ts`, 30 passed, 0 failed, 0 skipped.

The existing UX2B rendered suite remains in `tests/ui/semantic-foundation.spec.ts`. Full UI suite passed after GW1B hardening: `npm run test:ui`, 45 passed, 0 failed, 0 skipped.

## 19. Deferred Work

Deferred to future prompts:

- persistent research notebook and reusable assets;
- Discovery Atlas behavior;
- behavioral landscapes;
- contextual capability guidance;
- model composition frontiers;
- Grand Systems Challenges;
- actual browser zoom and assistive-technology audits.

## 20. GW1B Requirements

GW1B audited route clarity, duplicate shell chrome, World canvas allocation, Builder workspace allocation, short-height behavior, narrow-width behavior, keyboard order, focus smoke, nav comprehension, Lab/Atlas honesty, status semantics, Axe results, browser zoom limitations, screen-reader/AT limitations, and regression risk.

Actual browser zoom at 125%, 150%, and 200% was not verified. Screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user comprehension remain unverified.

## 21. Non-Goals And Guardrails

GW1 must not modify simulation runtime, template runtime, Builder execution, schema execution, model-schema runtime, graph execution, persistence, storage, dependencies, assets, font configuration, progression, Discovery Atlas logic, behavioral landscapes, fake research data, fake counts, or fake user activity.
