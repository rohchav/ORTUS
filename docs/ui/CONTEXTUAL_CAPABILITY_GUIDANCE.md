# Contextual Capability Guidance

Status: Prompt GW6 implementation source of truth, audited by GW6B and updated through GW9. Guidance describes the newly available bounded Atlas preview separately from planning-only probe artifacts and unimplemented persistence/analysis. Guidance itself still creates no runtime, record, persistence, validation, personalization, progression, or Builder behavior.

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

The guidance content is static and source-backed. UX5 adds one component-local disclosure control to layer the complete inventory; that control changes presentation only. The panel is not a modal, command palette, onboarding checklist, quest log, dismissed-tip system, stored preference, analytics surface, user-routing system, behavior-derived task-ordering system, or generated guidance surface.

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

Atlas guidance now distinguishes available GW9 behavior from adjacent concepts. Available here: configure a bounded ephemeral Flocking preview, run fresh deterministic sample engines, inspect exact final-tick numeric values and in-memory provenance, and cancel or clear the local result. Planning-only: broader probe plans, unsupported plan fields, investigation framing, and future research-record structure. Not implemented: saved landscapes/probe executions, Atlas history, interpolation, regime/transition detection, Discovery Atlas records, Lab publication, calibration, scientific validation, server execution, or unbounded sweeps. Users must not infer a complete landscape, continuous values, confidence from seeds, a regime from a pattern, real-world applicability, or generic plan execution.

## 6. Tests

Focused source tests live in `src/lib/capabilityGuidance.test.ts`.

Rendered route coverage is in `tests/ui/research-world-shell.spec.ts` and checks concise default guidance, full-detail disclosure, `aria-expanded`, keyboard toggling, route-specific copy, status semantics, absence of fake action language, exactly one guidance disclosure Tab stop, reload reset, storage-key stability, viewport behavior, reduced motion, and Axe scans.

GW6B continuation resolved the timing-sensitive uncertainty-test blocker by splitting the aggregate production-template numeric-parameter coverage into per-template cases without weakening assertions. It also resolved a stale local Next.js dev-server blocker that served missing app chunks before hydration.

Final GW6B rendered verification passed: `npx playwright test tests/ui/research-world-shell.spec.ts` reported 30 passed, 0 failed, 0 skipped; `npm run test:ui` reported 45 passed, 0 failed, 0 skipped.

GW6 rendered verification is smoke evidence only. It does not prove actual browser zoom behavior, screen-reader readiness, assistive-technology readiness, forced-colors readiness, WCAG conformance, user comprehension, scientific validation, calibration, or real-world truth.

## 7. GW6B Gate

Prompt GW6B audited this layer before future Research World expansion. The audit re-checked non-persistence, route placement, status semantics, no user-derived guidance behavior, no fake progression, no fake records/actions, accessibility smoke coverage, viewport behavior, and copy that might imply capability creation.
