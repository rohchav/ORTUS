# Active Intervention Boundary And Readiness

Status: HISTORICAL/SUBORDINATE Prompt GW3 implementation record, audited and hardened by Prompt GW3B. Defer current architecture, capability, scientific, and sequencing claims to `../ARCHITECTURE.md`, `../CAPABILITIES.md`, `../SCIENTIFIC_MODEL.md`, and `../ROADMAP.md`. Prompt GW3 adds a live, non-persistent World-only intervention-readiness and interpretation-boundary layer in Intervene mode. The GW3B audit record is `ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS_AUDIT.md`.

## 1. Purpose

GW3 makes the existing World intervention surface harder to overread. It tells the user what template-owned perturbation controls are available, what target state they require, and what an intervention response can and cannot mean.

Required principle:

```text
Intervention in ORTUS means changing or inspecting model conditions.
It does not certify real-world causal power, policy effectiveness, or empirical truth.
```

## 2. Scope

GW3 lives in the World route Intervene rail. It does not change simulation algorithms, template behavior, Builder behavior, routes, dependencies, storage, or exported artifact formats.

GW3 does not create saved interventions, saved intervention plans, experiment records, notebooks, comparison sets, persistent Lab assets, Discovery Atlas records, behavioral landscapes, sampled-region maps, progression, XP, achievements, unlocks, route aliases, external analytics, user profiles, or real-world causal claims.

## 3. What Intervention Readiness Means

Intervention readiness means whether the active World model exposes registered template-owned perturbation controls through the existing headless intervention executor.

Required copy:

```text
Intervention readiness describes available model perturbation controls. It is not a saved intervention plan or experiment record.
```

Readiness is derived from:

- selected template id and template descriptor;
- registered intervention definitions for that template;
- whether an active World engine is mounted;
- selected intervention id;
- selected entity, point, or grid-cell target state;
- current active-run intervention count.

Readiness is not a hidden interpreter and not a new mutable intervention store.

## 4. What Intervention Target Means

An intervention target is the model condition required by the selected registered control. GW3 only describes target kinds already present in `InterventionDefinition.targetType`:

- no target;
- selected entity;
- world point;
- radius around point or selected entity;
- grid cell.

The UI may say a control is registered while the current target is not ready. That distinction matters: missing target selection is not the same as missing runtime support.

## 5. What Intervention Boundary Means

An intervention boundary states what an intervention response can and cannot imply.

Required copy:

```text
A response to an intervention is evidence about this model under this configuration. It is not automatic proof that the same intervention would work in the real system.
```

Intervention responses are model behavior shaped by assumptions, seed, starting state, stochasticity, and template design. They are not calibrated predictions, policy recommendations, causal proof, robustness proof, safety certification, or empirical evidence by themselves.

## 6. World Route Integration

GW3 appears only inside World Intervene mode, above the existing intervention controls.

The new section is static readable content. It is not forced into the normal Tab order and does not add a fake interactive role. The existing intervention selector, parameter controls, target status, apply button, and current-run intervention entry list remain the actionable controls.

## 7. Relationship To GW2 Observation

GW2 observation answers:

```text
What am I seeing in the model right now?
```

GW3 intervention readiness answers:

```text
What can I change or perturb in the model, and what would that mean?
```

GW3 does not merge the Observe and Intervene panels into one generic research-context surface. Observation remains model-output/state context; intervention readiness remains perturbation capability and interpretation context.

## 8. Non-Persistence Boundary

GW3 adds no localStorage, sessionStorage, IndexedDB, cookies, database storage, cloud storage, accounts, timestamps, UUIDs, random ids, fingerprints, export/import behavior, or route state.

ORTUS already had bounded active-run/snapshot intervention history before GW3. GW3 does not expand that into saved intervention plans or persistent Lab records. Snapshot preservation of applied intervention history remains existing snapshot state behavior, not a new GW3 persistence feature. GW3B hardens visible UI copy to call these current-run intervention entries rather than recent intervention records.

## 9. Lab Relationship

At GW3 time, Lab was future-only. After GW5, Lab is a non-persistent evidence-record foundation, but GW3 current-run intervention entries still are not persistent Lab records. GW3 may state:

```text
GW3 exposes live intervention readiness in World.
Persistent Lab intervention records are still not implemented.
```

No Lab intervention records, notebooks, experiment records, reusable assets, fake recent activity, fake counts, or send-to-Lab behavior are implemented.

## 10. Atlas Relationship

Atlas now has a non-persistent GW4 foundation, but GW3 did not create Atlas records. GW3 may state:

```text
GW3 does not create Discovery Atlas records from intervention responses.
Atlas does not save or map intervention responses.
```

No Discovery Atlas records, maps, evidence scores, sampled-region maps, regime detection, or map-to-Atlas behavior are implemented.

## 11. Status Semantics

Intervention readiness uses capability status for control availability:

```text
category: capability
state: supported | unsupported
```

Selected target readiness uses interaction status:

```text
category: interaction
state: active | idle
```

Intervention interpretation uses evidence status:

```text
category: evidence
state: unresolved
```

These statuses are separate from active run state, selected destination, selected model object, validation, and future-only destination status.

## 12. Accessibility And Keyboard Behavior

The readiness layer has a visible `Intervention Readiness` heading, text status labels, semantic description lists, text boundary copy, and a semantic list of claim boundaries.

The readiness section is static readable content and does not use `tabIndex={0}`. Keyboard users reach meaningful controls such as the Intervene tab, subsequent workspace tabs, the intervention selector, parameter controls, and apply button.

The GW3 continuation fixed an ambiguous rendered-test locator that used `getByLabel("Intervention")` after the new readiness region made multiple accessible names legitimately contain `Intervention`. The rendered contract now targets the `Intervention Readiness` region by role/name, scopes readiness assertions to that region, and targets the actual selector as the `Intervention type` combobox. The visible selector label was changed from `Intervention` to `Intervention type` for a more precise accessible name.

Playwright/Axe coverage is rendered smoke evidence only. It is not screen-reader readiness, assistive-technology readiness, forced-colors readiness, actual browser-zoom readiness, full WCAG conformance, or user-comprehension validation.

## 13. Responsive Behavior

GW3 is tested inside the established rendered viewport set:

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 900 x 700
- 1280 x 600

The panel stays inside the existing intentional World workspace scroll region. It does not cover the world viewport or persistent run controls. This is not a mobile workflow certification.

## 14. Testing

GW3 adds focused unit/contract coverage for:

- readiness derivation from registered intervention definitions;
- missing controls labeled honestly;
- no fake targets or future controls;
- target readiness separate from control availability;
- required non-persistence copy;
- required causal-boundary copy;
- evidence/unresolved model-response status;
- no GW3 storage, timestamps, random ids, UUIDs, or fake tab stops;
- Lab and Atlas future-only copy.

Rendered Playwright coverage verifies World Intervene visibility, heading, non-persistence copy, causal-boundary copy, status semantics, run controls, canvas visibility, focus movement, no page overflow, Lab/Atlas future-only copy, and Axe scans. GW3B adds rendered checks for the precise `Intervention type` combobox, the `Radius intervention value` input, current-run entry copy, and the disabled `Clear entries` control.

The GW3 continuation rendered checks passed:

- focused World shell rendered test: 1 passed;
- full `tests/ui/research-world-shell.spec.ts`: 30 passed, 0 failed, 0 skipped;
- full `npm run test:ui`: 45 passed, 0 failed, 0 skipped.

## 15. Non-Goals

GW3 does not add saved interventions, intervention-history persistence, undo/replay, Lab records, Atlas discoveries, behavioral landscapes, evidence scores, progression, runtime algorithms, template behavior, Builder execution, model-schema execution, schema-to-template conversion, visual-builder execution, validation, calibration, policy guidance, real-world causal claims, persuasion optimization, user profiling, or protected-class inference.

## 16. Deferred Work

Deferred work includes persistent Lab intervention records, Atlas evidence records, behavioral landscapes, reusable research assets, richer intervention comparison, validation/calibration support, actual browser zoom verification, screen-reader walkthroughs, assistive-technology walkthroughs, forced-colors checks, and user-comprehension testing.

## 17. GW3B Audit Result

Prompt GW3B audited and hardened this slice in `ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS_AUDIT.md`.

GW3B found no hidden runtime expansion, false runtime-support claim, Lab persistence, Atlas discovery, Builder execution, schema execution, or causal/validation claim in the readiness layer.

Bounded hardening included:

- explicit engine-required readiness coverage when registered controls exist without an active engine;
- current-run intervention entry copy for the adjacent applied-intervention list;
- visible copy changed from `validated` to `engine-checked` where the intended meaning is command-path checking rather than scientific validation;
- source guards against regressing to `Recent interventions` or `engine-validated commands`;
- rendered Intervene assertions for labels and current-run entry controls.

Actual browser zoom at 125%, 150%, and 200% was attempted but not verified because headless Chromium metrics did not change under keyboard zoom shortcuts. Screen-reader, assistive-technology, forced-colors, complete WCAG, and user-comprehension validation remain unverified.

GW3B audited whether:

- readiness fields accurately reflect existing controls;
- unavailable controls and missing targets are labeled honestly;
- intervention and observation remain distinct;
- no fake targets or outcomes were added;
- non-persistence is clear;
- Lab persistence, Lab intervention records, and Atlas records remain unimplemented;
- status semantics are correct;
- keyboard/focus/reflow behavior remains acceptable;
- copy avoids real-world causal overclaim.

Decision: GW3/GW3B remained ready for GW4 after commit. GW4 has since added only non-persistent Atlas information architecture, GW4B audited that foundation, and GW5 has since added only non-persistent Lab evidence-record information architecture. No future prompt may treat GW3/GW3B as Lab persistence, saved intervention plans, Atlas discoveries, behavioral landscapes, validation/calibration, policy effectiveness, real-world causal proof, or general strategy/control runtime.
