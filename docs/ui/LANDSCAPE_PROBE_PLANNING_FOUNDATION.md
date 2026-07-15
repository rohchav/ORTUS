# Landscape Probe Planning Foundation

Status: Prompt GW8 implementation source of truth, audited by GW8B and updated after GW9. GW8/GW8B define non-persistent conceptual probe planning and do not execute probes. GW9 uses a separate explicit preview request because the planning scaffold cannot map safely to runtime IDs and exact values. Probe plans remain non-executable and unsaved; no generic probe execution, regime detection, validation, Builder execution, persistence, dependency, asset, or font support was added.

## 1. Purpose

GW8 gives ORTUS a truthful language for framing future behavioral-landscape probe investigations before ORTUS has landscape sampling, probe execution, persistent maps, or evidence promotion.

A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery.

## 2. Scope

GW8 creates non-persistent landscape probe planning semantics. It does not execute probes, run parameter sweeps, generate samples, save plans, create Lab records, create Atlas discoveries, detect regimes, or validate real-world claims.

The source model is `src/lib/landscapeProbePlanningFoundation.ts`. The rendered integration is a bounded `/atlas` section titled `Landscape Probe Planning`.

## 3. What Landscape Probe Planning Means In GW8

Landscape probe planning means naming a possible future model-space investigation: why a probe might exist, which candidate axes could be varied, which candidate outcomes could be inspected, and which constraints must be resolved before execution could ever be considered.

It is not a sampler, scheduler, run queue, experiment database, saved plan, sampled map, confidence layer, or regime detector.

## 4. Probe Intent

Probe intent names why a future investigation might compare model conditions.

Probe plan is not an executed probe. A written intent does not select parameters, start runs, capture provenance, or create evidence.

## 5. Candidate Axes

Candidate axes name model conditions that a future probe might vary, such as template-supported parameters, model variants, seeds, or scenario recipes.

Candidate axis is not a sampled parameter. A named axis does not prove that a parameter range is valid, sampled, supported by a template, or ready for execution.

## 6. Candidate Outcome Measures

Candidate outcome measures name model-output summaries that a future probe might inspect.

Planned outcome is not observed evidence. A future outcome idea is not a metric result, empirical measurement, validation finding, or claim about the real world.

## 7. Candidate Ranges And Constraints

Candidate ranges describe possible future variation boundaries without selecting values or claiming coverage.

Candidate range is not an explored range. Constraints such as template capability, provenance, sampling design, and external-validation needs are boundaries to resolve, not disabled controls or queue states.

## 8. Sampling Intent Versus Sampled Result

Sampling intent names what a future probe might try to compare.

Sampling intent is not a sampling result. GW8 produces no sample list, sampled region, coverage percentage, heatmap, contour, cluster, score, or regime label.

Planned comparison is not a comparison result. It names future framing only and does not imply completed analysis, sampled evidence, or detected regimes.

## 9. Conceptual Plan Versus Executable Plan

The rendered scaffold is labeled:

```text
Conceptual probe plan - not executable and not saved.
```

The scaffold names intent, axis candidates, outcome candidates, and constraints. It has no selected parameter values, no samples, no run queue, no saved plan, no probe result, and no detected regime.

## 10. Relationship To World

World is where live model behavior is observed. GW8 does not execute landscape probes or turn World runs into planned samples.

World does not gain probe planner controls, run-probe actions, run-sweep actions, landscape previews, sampled-region data, save-to-Atlas actions, save-to-Lab actions, map-this-run actions, or discovery controls.

## 11. Relationship To Lab

Lab describes how future evidence records could be organized. GW8 does not create probe records, experiment ledgers, notebooks, or run history.

Lab remains non-persistent. GW8 adds no probe plans, probe records, landscape records, evidence records, notebooks, comparison sets, fake ledger rows, timestamps, record ids, or Lab-to-Atlas publication.

## 12. Relationship To Atlas

Landscape probe planning is non-executable in GW8. No probe plans are saved, no samples are generated, and no landscape regions are promoted to evidence.

Atlas remains a non-persistent evidence-orientation foundation. GW8 adds probe planning semantics next to the behavioral landscape vocabulary, not Discovery Atlas records, persistent maps, evidence-linked discoveries, or sampled probe output.

## 13. Model Behavior Versus Real-World Validation

A planned probe can frame a future model-space investigation. It does not show that sampled behavior exists, that a regime has been detected, or that any real-world claim is supported.

Model hypothesis is not a real-world claim. A future model-space probe would still need explicit provenance, bounded sampling design, template support checks, and later validation/calibration work before anyone could responsibly discuss external claims.

## 14. Non-Execution Boundary

GW8 does not execute probes, compile probe plans, schedule parameter sweeps, run batch simulations, detect regimes, or call the simulation runtime.

The source model is static typed vocabulary. The Atlas route renders readable content only.

## 15. Non-Persistence Boundary

GW8 stores no probe plans, no landscapes, no records, no sampled areas, no histories, no ledgers, no timestamps, no generated ids, no fingerprints, and no user activity.

The route remains product information. Nothing on `/atlas` becomes a durable research asset.

## 16. Status Semantics

GW8 uses the UX2 status model:

- Probe planning foundation: `capability / planning-only`
- Candidate axis: `capability / future-only`
- Candidate outcome: `capability / future-only`
- Candidate range: `capability / future-only`
- Sampling intent: `capability / future-only`
- Non-executable plan: `capability / future-only`
- Future sampled probe: `capability / future-only`
- Unresolved feasibility: `evidence / unresolved`
- Externally unvalidated hypothesis: `evidence / unresolved`

No operational statuses are used for epistemic support. Future-only is not a locked progression state.

## 17. Accessibility And Keyboard Behavior

The Atlas integration uses one section heading, semantic lists and cards, visible status text, and the existing `StatusPill` accessible labels.

GW8 adds no fake interactive controls, focus traps, static Tab stops, route aliases, duplicate H1s, or duplicate `main` landmarks.

## 18. Responsive Behavior

The section uses existing layout tokens and responsive grids so it wraps inside the established Playwright viewport set:

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 900 x 700
- 1280 x 600

This is rendered smoke evidence from the Playwright viewport set. It is not mobile certification.

## 19. Testing

Focused unit coverage lives in `src/lib/landscapeProbePlanningFoundation.test.ts`.

Rendered route coverage lives in `tests/ui/research-world-shell.spec.ts` and verifies Atlas visibility, conceptual scaffold copy, non-execution copy, non-persistence copy, model-vs-real-world copy, status semantics, zero local Tab stops, no fake run-probe/sweep/save/result/score actions, no page-level overflow, keyboard focus smoke coverage, and Axe scans.

These tests are software and rendered smoke checks. They are not screen-reader, assistive-technology, forced-colors, full WCAG, actual browser-zoom, scientific-validation, calibration, or user-comprehension evidence.

## 20. Non-Goals

GW8 does not implement:

- executable probe plans;
- saved probe plans;
- saved landscape maps;
- persistent behavioral landscapes;
- sampled-region maps;
- parameter sweeps or batch simulation;
- run queues, job queues, or scheduler behavior;
- regime detection or transition detection;
- sensitivity-analysis execution;
- confidence scores, coverage percentages, or evidence scores;
- fake sampled data, fake maps, fake heatmaps, fake contours, fake clusters, fake model regimes, or fake probe results;
- Lab records, notebooks, saved experiments, saved evidence records, run history, or Atlas discovery records;
- storage, accounts, analytics, personalization, onboarding progress, achievements, XP, unlocks, levels, ranks, or route aliases;
- runtime, template, schema, or Builder execution behavior.

## 21. Deferred Work

Deferred work includes executable probe-plan design, source-backed landscape sampling, parameter-sweep execution, provenance-preserving probe records, persistent landscape records, Lab evidence integration, Atlas publication rules, stale-probe handling, comparison-backed interpretation, regime-detection design if ever scoped, validation/calibration workflows, browser zoom verification, screen-reader and assistive-technology walkthroughs, forced-colors checks, and user-comprehension testing.

Deferred does not mean promised or locked. Future-only is not progression.

## 22. GW8B Audit Result

GW8B is complete in `docs/ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION_AUDIT.md`.

GW8B found no production runtime, persistence, route-contract, or fake-result defect. It hardened the planned-comparison vocabulary to state that planned comparison is not a comparison result, verified source and rendered boundaries, and documents that actual browser zoom at 125%, 150%, and 200% remains unverified.

Decision: ready for GW9. GW9 must still arrive only through an explicit future prompt and must not inherit executable probes, saved plans, sampled results, sweeps, regime detection, Lab records, Atlas discoveries, progression, runtime behavior, template behavior, Builder execution behavior, validation, calibration, or real-world discovery claims from GW8/GW8B.

## Prompt GW9 Result

GW9 followed through a separate explicit preview form and request model. The current probe-plan foundation has no stable template, scenario, parameter, metric, seed, or tick values, so a handoff would invent or silently discard execution fields. No `Run probe plan` action exists; the original plan remains unchanged and non-executable. GW9 complete. GW9B required next.
