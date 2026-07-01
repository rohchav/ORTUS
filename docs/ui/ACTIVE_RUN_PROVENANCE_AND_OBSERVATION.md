# Active Run Provenance And Observation

Status: Prompt GW2 implementation source of truth, audited and hardened by Prompt GW2B, with Prompt GW3 adding and Prompt GW3B auditing a separate Intervene-mode intervention-readiness layer and Prompt GW4 adding a separate non-persistent Atlas foundation. GW2 adds a live, non-persistent World-only provenance and observation layer for the active run. GW2B fixes missing-snapshot observation labeling and hardens rendered focus/placement evidence. This slice does not create persistent Lab records, Discovery Atlas records, behavioral landscapes, saved experiments, notebooks, reusable assets, progression systems, runtime behavior, template behavior, Builder execution behavior, routes, storage, dependencies, or external analytics.

## 1. Core Principle

```text
A run must be inspectable as model behavior under a known configuration, not treated as empirical truth about the real world.
```

GW2 exists because a visible run without provenance is too easy to overread. The layer states which template/configuration is active, what the UI can currently observe, and what claims remain unsupported.

## 2. Scope Boundary

```text
GW2 creates live provenance and observation context. It does not create persistent Lab records or Atlas discoveries.
```

The active run context is a read-only World UI surface. It is not a run archive, research notebook, discovery ledger, saved experiment, reusable asset, comparison set, or evidence record.

## 3. Source Of Truth

The panel derives from existing World state:

- selected template id and template descriptor;
- active engine seed, parameters, scenario, initialization, and metadata when mounted;
- latest engine snapshot;
- current operational `isRunning` state;
- current speed multiplier;
- current intervention-history count.

The layer does not introduce global mutable provenance state, persistent ids, timestamps, storage, or a hidden interpreter.

## 4. Provenance Summary

The provenance summary displays model/configuration facts such as template, template id, scenario label, runtime surface, behavior mode, seed, parameter count, initialization, composition, environment options, and playback speed.

Required copy:

```text
This provenance summary describes the active model configuration. It is not a saved experiment record.
```

This is configuration context, not proof that the configuration is scientifically valid.

## 5. Observation Summary

The observation summary displays operational state, lifecycle state, tick, model time, advancing state, living entity count, metric-record count, intervention count, and bounded latest metric rows when available. If no current snapshot is available, observation labels say `No snapshot` rather than presenting zero-like values as observed model state.

Required copy:

```text
Observed values describe the model’s current state, not measured real-world data.
```

Runtime metrics and visible state are model output. They are not empirical observations, calibrated probabilities, or validation evidence by themselves.

## 6. Interpretation Boundary

The interpretation boundary keeps evidence status unresolved unless later validation work earns more.

Required copy:

```text
A visual pattern in this run is evidence about this model under this configuration. It is not automatically evidence about the real system.
```

The panel also states that configuration, seed, assumptions, and template limits shape output; runnable behavior does not equal validation; interventions are model perturbations, not externally validated causal effects; and uncertainty/stochastic variation are model conditions, not calibrated real-world probabilities.

## 7. World-Only Placement

GW2 lives in the World route Observe mode as `Active Run Context`. It does not appear in the shared destination shell, Lab, Atlas, Workshop, Builder, Graph View, Author Schema, fit reports, scenario planning, or simulation engine.

The World canvas and persistent run controls remain visible and remain the primary functional surface.

Prompt GW3 lives separately in World Intervene mode. It describes live intervention readiness and model-response boundaries; it does not replace GW2 observation or turn active-run provenance into an intervention plan.

## 8. Status Semantics

Operational run status remains `Paused` or `Running` through the existing run-status semantic helper:

```text
category: operational
state: paused | running
```

Evidence status for the interpretation boundary is:

```text
category: evidence
state: unresolved
```

Active run, selected destination, selected model object, supported evidence, validation, and future-only capability are separate states.

## 9. Non-Persistence

GW2 does not write to localStorage, sessionStorage, IndexedDB, cookies, a database, server storage, accounts, cloud storage, or route state.

Existing older run-comparison storage elsewhere in the app remains outside GW2. GW2 does not call that path, depend on saved runs, or create a new saved-run surface.

## 10. Fingerprint Decision

GW2 does not generate a configuration fingerprint. A deterministic fingerprint may become useful later, but adding a decorative id before a stable persistence or comparison contract would invite fake provenance.

The UI says `Not generated in GW2` rather than minting an unstable identifier.

## 11. Lab And Atlas Relationship

Lab copy acknowledges:

```text
GW2 exposes live run provenance in World. Persistent Lab records are still not implemented.
```

Atlas copy acknowledges:

```text
GW2 does not create Discovery Atlas records. GW4 Atlas may define evidence semantics later, but GW2 does not save or map runs.
```

Those statements are boundaries, not feature claims.

## 12. Accessibility

The panel has a visible `Active Run Provenance` section heading, text status labels, text-only boundary copy, and semantic section labeling through `aria-labelledby`.

Continuation decision: `.active-run-context` is a static readable region, not a normal keyboard Tab stop. `tabIndex={0}` was removed. Keyboard users reach meaningful controls such as the Observe tab and subsequent workspace tabs; they are not forced through a non-interactive content block.

GW2 rendered tests cover panel visibility, heading/readability, keyboard focus on meaningful controls around the panel, no page overflow, and Axe scans for affected routes. This is still not a screen-reader, assistive-technology, forced-colors, actual browser-zoom, full WCAG, or user-comprehension claim.

## 13. Responsive Scope

GW2 uses the established rendered viewport set:

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 900 x 700
- 1280 x 600

The panel is tested inside the existing Observe rail. This is not a full mobile workflow certification.

## 14. Tests

Focused tests cover:

- deterministic derivation from existing run fields;
- live non-persistent provenance copy;
- missing optional field handling;
- no generated fingerprint;
- no GW2 storage, timestamp, random-id, UUID, or random API use;
- `Paused` as operational/paused;
- unresolved evidence status and interpretation copy;
- Lab and Atlas future-only boundaries;
- rendered World provenance presence, model/config visibility, semantic readable-region behavior, keyboard focus on meaningful controls, no overflow, run controls, and Axe coverage.

## 15. Verification Notes

Required GW2 verification includes `npm run test:ui`, `npm run typecheck`, `npm test`, `npm run build`, `npm run perf:simulation`, `git diff --check`, focused provenance/observation tests, and `npx playwright test tests/ui/research-world-shell.spec.ts`.

Pre-edit sequential baseline passed for `npm run test:ui`, `npm run typecheck`, `npm test`, `npm run build`, `npm run perf:simulation`, and `git diff --check`. After implementation, source-level verification passed for `npm test -- provenance observation`, `npm run typecheck`, full `npm test`, `npm run build`, `npm run perf:simulation`, and `git diff --check`.

Continuation rendered verification found the first World shell test failing because the test expected the static `.active-run-context` section to receive ordinary Tab focus. A temporary diagnostic showed that after `Observe` + `Tab`, the active element was the next workspace tab, `Intervene`, which is the meaningful control in DOM order. The production fix removed `tabIndex={0}` from `.active-run-context`; the test now verifies panel readability plus visible focus on real controls.

Continuation verification passed: `npx playwright test tests/ui/research-world-shell.spec.ts -g "World shell contract holds at desktop 1440x900"` passed, and full `npm run test:ui` passed with 45 passed, 0 failed, 0 skipped.

`npm run lint` remains unavailable because `package.json` has no lint script.

## 16. GW3 Relationship

GW3 is documented in `docs/ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS.md` and audited in `docs/ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS_AUDIT.md`. It adds live intervention readiness in World Intervene and must not treat GW2 observation as saved Lab persistence, Atlas discovery, behavioral landscape evidence, validation, or empirical truth.

## 17. Next Audit

Prompt GW2B is recorded in `docs/ui/ACTIVE_RUN_PROVENANCE_AND_OBSERVATION_AUDIT.md`. Prompt GW3B is recorded in `docs/ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS_AUDIT.md`.
