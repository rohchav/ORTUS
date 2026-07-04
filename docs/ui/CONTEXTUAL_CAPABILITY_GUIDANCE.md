# Contextual Capability Guidance

Status: Prompt GW6 implementation source of truth, audited by Prompt GW6B in `docs/ui/CONTEXTUAL_CAPABILITY_GUIDANCE_AUDIT.md` and updated after Prompt GW8. GW6 adds source-backed route-local capability guidance to World, Workshop, Lab, and Atlas. It does not create saved records, Atlas discoveries, Lab experiments, saved behavioral landscapes, saved probe plans, progression, user-derived routing, behavior-derived task ordering, persistence, validation, calibration, runtime behavior, template behavior, or Builder execution behavior.

## 1. Boundary

Capability guidance describes current product capability. It does not create capability.

GW6 creates source-backed guidance and capability orientation. It does not create saved records, Atlas discoveries, Lab experiments, saved behavioral landscapes, progression, user-derived routing, or behavior-derived task ordering.

The visible guidance copy says:

```text
Guidance describes current ORTUS capabilities. It does not create saved records, validation, discoveries, or persistence.
```

## 2. Source Model

The source model is `src/lib/capabilityGuidance.ts`.

It defines:

- `CapabilityGuidanceSummary`
- `CapabilityGuidanceItem`
- `CapabilityBoundary`
- `CapabilityDestinationRole`
- `CapabilityAvailability`

The route contract is:

- `/` -> World
- `/builder` -> Workshop
- `/lab` -> Lab
- `/atlas` -> Atlas

`/world` and `/workshop` remain absent aliases.

## 3. UI Placement

The shared route-local panel is `src/components/researchWorld/CapabilityGuidancePanel.tsx`.

World renders compact guidance inside the existing World workspace rail so the canvas remains dominant. Workshop renders compact guidance below Builder mode tabs. Lab and Atlas render fuller guidance below each route header.

The panel is static readable content. It is not a modal, command palette, onboarding checklist, quest log, dismissed-tip system, stored preference, analytics surface, user-routing system, behavior-derived task-ordering system, or generated guidance surface.

## 4. Status Semantics

GW6 uses the existing UX2 status model:

- Available here: `capability / supported`
- Planning-only: `capability / planning-only`
- Not implemented: `capability / future-only`
- Do not assume: `capability / planning-only` or `evidence / unresolved`
- Related destination: `capability / planning-only`

Guidance must not use operational status to imply a feature is implemented, active, completed, validated, or scientifically supported.

## 5. Route Boundaries

World guidance clarifies that World is the live local modeling surface. Active-run observations and current-run interventions remain live engine/snapshot state, not Lab saved data or Atlas records.

Workshop guidance clarifies that authoring, validation assistance, graph inspection, fit reports, and scenario planning are structural/planning surfaces. They do not compile schemas, execute graphs, generate templates, create scenarios, produce RunConfigs, or mutate active simulation state.

Lab guidance clarifies that `/lab` is a non-persistent evidence-record foundation. Persistent evidence records, experiment ledgers, notebooks, saved comparisons, run history, and Lab-to-Atlas publication are not implemented.

Atlas guidance clarifies that `/atlas` is a non-persistent evidence-orientation foundation. Discovery Atlas records, persistent evidence maps, sampled-region displays backed by run data, saved behavioral landscape maps, saved probe plans, executable probes, and evidence-rating surfaces are not implemented. GW7 adds behavioral-landscape vocabulary and a conceptual scaffold; it does not make sampled landscapes or saved maps available. GW8 adds landscape probe planning vocabulary and a conceptual scaffold; it does not make executable probes, saved plans, samples, run queues, or regime detection available.

## 6. Tests

Focused source tests live in `src/lib/capabilityGuidance.test.ts`.

Rendered route coverage is in `tests/ui/research-world-shell.spec.ts` and checks guidance visibility, route-specific copy, status semantics, absence of fake action language, absence of static Tab stops in the guidance panel, viewport behavior, reduced motion, and Axe scans.

GW6B continuation resolved the timing-sensitive uncertainty-test blocker by splitting the aggregate production-template numeric-parameter coverage into per-template cases without weakening assertions. It also resolved a stale local Next.js dev-server blocker that served missing app chunks before hydration.

Final GW6B rendered verification passed: `npx playwright test tests/ui/research-world-shell.spec.ts` reported 30 passed, 0 failed, 0 skipped; `npm run test:ui` reported 45 passed, 0 failed, 0 skipped.

GW6 rendered verification is smoke evidence only. It does not prove actual browser zoom behavior, screen-reader readiness, assistive-technology readiness, forced-colors readiness, WCAG conformance, user comprehension, scientific validation, calibration, or real-world truth.

## 7. GW6B Gate

Prompt GW6B audited this layer before future Research World expansion. The audit re-checked non-persistence, route placement, status semantics, no user-derived guidance behavior, no fake progression, no fake records/actions, accessibility smoke coverage, viewport behavior, and copy that might imply capability creation.
