# ORTUS Research World Destination Shell

Status: HISTORICAL/SUBORDINATE Prompt GW1 implementation record, audited by GW1B and updated through GW9. R1 superseded its route hierarchy: Start is `/`, World is `/world`, Lab is `/lab`, Atlas is `/atlas`, and Workshop is `/builder`. Defer current architecture, capability, scientific, and sequencing claims to `../ARCHITECTURE.md`, `../CAPABILITIES.md`, `../SCIENTIFIC_MODEL.md`, and `../ROADMAP.md`. GW9 changes only Atlas content/capability: one bounded ephemeral Flocking preview is now available. The shell still adds no persistent research data, saved Lab/Atlas records, saved landscapes or probe plans, generic probe execution, progression, Builder execution, dependency, asset, font, or storage path.

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

World and Workshop are available destinations. Lab is a non-persistent foundation route after GW5. Atlas is a non-persistent foundation route after GW4. Future-only capability status does not mean locked destination.

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

GW3 adds `Intervention Readiness` in the World Intervene rail. GW3B audits and hardens it. It is live UI context over existing registered template-owned intervention definitions, target state, active engine presence, and current active-run intervention count. Current-run intervention entries are engine/snapshot state, not persistent Lab records. The readiness layer does not save an intervention plan, create a persistent Lab intervention record, create a Discovery Atlas record, certify causal power, or validate model output.

## 9. Workshop Integration

`/builder` remains the direct expert route and becomes the Workshop destination. The internal surface remains Builder because that name is precise for current structural authoring and inspection tools.

Workshop preserves Builder modes, Author Schema, Graph View, validation and repair suggestions, fit reports, scenario planning, status badges, and current local Builder state. It does not add execution, model composition, persistent assets, or runtime activation.

## 10. Lab Non-Persistent Foundation

`/lab` is a non-persistent GW5 foundation route. It documents future Lab evidence-record responsibility and does not simulate persistence.

Required boundary:

```text
Lab is a non-persistent foundation in GW5.
Persistent evidence records, experiment ledgers, notebooks, saved comparisons, and run history are not implemented yet.
Lab records will organize evidence about model investigations. They will not certify discoveries about the real world.
Nothing on this Lab route is a saved experiment, saved evidence record, or persistent run history.
World currently exposes live provenance, observation, and intervention readiness. GW5 Lab does not save those runs or convert them into evidence records.
Atlas currently defines non-persistent evidence-state semantics. GW5 Lab does not publish records to Atlas or create discoveries.
```

The page renders evidence-record lifecycle semantics and a conceptual scaffold labeled `Conceptual scaffold - not saved Lab data.` It renders no fake saved experiments, fake evidence records, fake notebooks, fake counts, fake timestamps, fake recent activity, fake charts, fake storage, save/send/publish actions, or disabled controls.

## 11. Atlas Non-Persistent Foundation

`/atlas` remains non-persistent. GW4/GW4B provide evidence semantics, GW7/GW7B provide behavioral-landscape vocabulary, GW8/GW8B provide non-executable probe planning, and GW9 provides one bounded ephemeral exact-coordinate preview without saved discovery infrastructure.

Required boundary:

```text
Atlas is a non-persistent route with one GW9 in-memory preview capability.
Discovery records, saved behavioral landscape maps, sampled-region maps, and evidence-linked model regimes are not implemented yet.
Atlas will organize evidence about model behavior. It will not certify discoveries about the real world.
Nothing on this Atlas route is a saved discovery, saved evidence record, or persistent map.
```

The page renders evidence semantics and conceptual scaffolds separately from the real GW9 preview form/results. Preview values come only from executed isolated runs and disappear on reload. The route renders no saved map, discovery, inferred sampled region, evidence score, regime label, achievement, locked region, recent activity, or fake progress percentage.

## 12. Status Semantics

Lab uses capability / planning-only status for the GW5 foundation route. Persistent evidence records, experiment ledgers, notebooks, saved comparisons, and run history remain capability / future-only when referenced. Evidence-record lifecycle states use evidence statuses such as unresolved and unverified. Future-only is not evidence support.

```text
category: capability
state: planning-only
```

Atlas uses capability / planning-only status for the GW4 foundation route. Atlas records, sampled maps, saved behavioral landscapes, and saved probe plans remain capability / future-only when referenced. Atlas evidence states use evidence category statuses such as unresolved, supported, contradicted, unsupported, and unverified. GW7 adds behavioral-landscape vocabulary with future sampled landscape as capability / future-only and externally unvalidated as evidence / unresolved. GW8 adds landscape probe planning vocabulary with candidate axes/outcomes/ranges, non-executable plans, and future sampled probes as capability / future-only, plus unresolved feasibility and externally unvalidated hypotheses as evidence / unresolved. Future-only is not evidence support or locked progression. GW4B keeps sampled evidence unresolved because the current Atlas route has no source-backed run provenance.

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

GW1B hardens that suite with route-alias, unique-landmark, clean-navigation, single-current-destination, no-disabled-future-link, skip-link focus, reduced-motion focus, and stricter Lab/Atlas honesty checks. It also hardens destination-registry tests for query/hash normalization and `/world`/`/workshop` alias rejection. GW3 extends the same rendered shell suite to cover the World Intervene readiness layer and absence of that layer on Lab/Atlas. GW3B hardens the rendered Intervene assertions for control labels, current-run entry copy, and disabled clear-entry state. GW4 extends Atlas rendered assertions for the evidence-state legend, non-persistence copy, model-vs-world boundary, no fake save/map actions, and Atlas foundation status. GW4B hardens sampled-state assertions so sampled evidence remains unresolved until source-backed Atlas records exist. GW6 extends rendered route assertions for static source-backed capability guidance on World, Workshop, Lab, and Atlas without adding fake actions or static guidance Tab stops.

Focused rerun passed: `npx playwright test tests/ui/research-world-shell.spec.ts -g "World shell contract holds at desktop 1440x900"`.

Full shell suite passed after GW1B hardening: `npx playwright test tests/ui/research-world-shell.spec.ts`, 30 passed, 0 failed, 0 skipped.

The existing UX2B rendered suite remains in `tests/ui/semantic-foundation.spec.ts`. Full UI suite passed after GW1B hardening: `npm run test:ui`, 45 passed, 0 failed, 0 skipped.

## 19. Deferred Work

Deferred to future prompts:

- persistent research notebook and reusable assets;
- persistent intervention records;
- saved Discovery Atlas behavior;
- saved behavioral landscape maps;
- GW6B audit of contextual capability guidance;
- GW7B audit of behavioral landscape vocabulary and scaffold honesty;
- GW8 landscape probe planning foundation and required GW8B audit;
- model composition frontiers;
- Grand Systems Challenges;
- actual browser zoom and assistive-technology audits.

## 20. GW1B Requirements

GW1B audited route clarity, duplicate shell chrome, World canvas allocation, Builder workspace allocation, short-height behavior, narrow-width behavior, keyboard order, focus smoke, nav comprehension, Lab/Atlas honesty, status semantics, Axe results, browser zoom limitations, screen-reader/AT limitations, and regression risk.

Actual browser zoom at 125%, 150%, and 200% was not verified. Screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user comprehension remain unverified.

## 21. Non-Goals And Guardrails

GW1-GW8 destination work must not modify simulation runtime, template runtime, Builder execution, schema execution, model-schema runtime, graph execution, persistence, storage, dependencies, assets, font configuration, progression, saved Lab record logic, saved Discovery Atlas logic, saved behavioral landscape logic, saved probe plan logic, fake research data, fake intervention outcomes, fake probe results, fake counts, generated guidance, or fake user activity.
