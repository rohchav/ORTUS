# Discovery Atlas Information Architecture

Status: Prompt GW4 implementation source of truth, audited by GW4B and updated through GW9. GW4/GW4B define non-persistent Atlas evidence semantics and keep persistent sampled evidence unresolved until source-backed Atlas records exist. GW7/GW7B add behavioral-landscape vocabulary; GW8/GW8B add non-executable probe-planning vocabulary. GW9 separately adds one bounded ephemeral exact-coordinate preview. It does not create saved discoveries, evidence records, saved landscapes or probe plans, persistent sampled-region maps, Lab records/publication, run history, storage, progression, validation, calibration, real-world discovery certification, Builder execution, dependencies, assets, or fonts.

## 1. Purpose

GW4 turns `/atlas` from a purely future-only informational route into a bounded Atlas foundation.

The Atlas foundation explains how ORTUS should eventually organize investigated model behavior while keeping model output separate from real-world discovery claims.

Required principle:

```text
Atlas maps investigated model behavior.
It does not certify discoveries about the real world.
```

## 2. Scope

GW4 adds:

- a small source model in `src/lib/atlasFoundation.ts`;
- a bespoke `/atlas` page rendered from that model;
- evidence-state legend semantics;
- a text-only conceptual scaffold labeled as not run data;
- explicit World and Lab relationship boundaries;
- tests for Atlas semantics and route behavior;
- documentation and durable guardrails.

GW4 does not add persistence, storage, records, run ingestion, evidence scoring, Atlas save actions, saved behavioral landscapes, new routes, redirects, dependencies, or simulation behavior.

## 3. What Atlas Means In GW4

Atlas is a non-persistent foundation in GW4.

It is an orientation surface for future evidence about model behavior. It is not yet a Discovery Atlas product surface with stored records.

Discovery records, saved behavioral landscape maps, sampled-region maps, and evidence-linked model regimes are not implemented yet.

## 4. Evidence-State Vocabulary

The Atlas evidence vocabulary is defined in `src/lib/atlasFoundation.ts`.

Current evidence states:

- `Unsampled`: evidence / unresolved.
- `Sampled`: evidence / unresolved.
- `Unresolved`: evidence / unresolved.
- `Supported within model`: evidence / supported.
- `Contradicted within model`: evidence / contradicted.
- `Unsupported`: evidence / unsupported.
- `Externally unvalidated`: evidence / unverified.

The legend also includes `Future-only` as capability / future-only. It is not an evidence state and must not be used as evidence support.

## 5. Sampled Versus Unsampled Distinction

Sampled in model space is not validated in the real world.

Unsampled means no source-backed model-space sample is attached. It does not mean the software failed, the region is locked, or the future result is known.

GW4 does not display sampled regions from run data. The route only defines how future sampled and unsampled states should be interpreted. A sampled state remains unresolved in GW4 because no current Atlas record is backed by run provenance.

## 6. Model Behavior Versus Real-World Discovery

Atlas will organize evidence about model behavior.

It will not certify discoveries about the real world.

Supported within a model is not empirical proof. Contradiction inside a model is useful evidence. Externally unvalidated model behavior remains externally unvalidated even when it is visually interesting or internally supported.

## 7. Non-Persistence Boundary

Nothing on the GW4 Atlas route is a saved discovery, saved evidence record, or persistent map.

GW4 adds no localStorage, sessionStorage, IndexedDB, cookies, database storage, cloud storage, accounts, export/import behavior, generated ids, timestamps, fingerprints, or route-state persistence.

## 8. Relationship To World

World currently exposes live provenance, observation, and intervention readiness.

GW4 Atlas does not save those runs, ingest current-run state, map current-run intervention entries, or convert live model behavior into discoveries.

No `Map this run`, `Save to Atlas`, `Create discovery`, or `Record evidence` action exists.

## 9. Relationship To Lab

Lab is a non-persistent GW5 foundation.

GW5 defines Lab evidence-record lifecycle semantics. Persistent Lab evidence records and Lab-to-Atlas publication are still not implemented.

GW4 does not create Lab records, experiment records, notebooks, saved interventions, reusable research assets, or run history.

## 10. Status Semantics

Atlas evidence state is separate from:

- current destination state;
- active run state;
- intervention readiness;
- operational software status;
- real-world validation;
- future-only capability status.

Supported, contradicted, unsupported, unresolved, and unverified are evidence states. Future-only is capability status. Foundation is capability / planning-only route status. GW4B keeps sampled evidence unresolved because no current Atlas record is source-backed by run provenance.

## 11. Accessibility And Keyboard Behavior

The Atlas route has one route-level H1: `Atlas`.

The route stays inside the shared `main`, uses section headings, renders status text rather than color-only meaning, keeps World and Workshop links as native anchors, and adds no fake interactive controls or focus traps.

The route uses existing visible focus styles. Axe passing is rendered smoke evidence only, not screen-reader readiness, assistive-technology readiness, forced-colors readiness, browser-zoom readiness, WCAG conformance, or user-comprehension validation.

## 12. Responsive Behavior

The rendered shell suite covers the established viewport set:

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 900 x 700
- 1280 x 600

Atlas content is a scrollable route surface inside the existing destination shell. The evidence legend and conceptual scaffold use responsive grid/list layouts and avoid page-level horizontal overflow in the rendered shell contract.

This is not mobile workflow certification.

## 13. Testing

GW4 adds focused unit and contract coverage for:

- unique Atlas evidence states;
- category/state semantics;
- future-only as capability, not evidence;
- supported/contradicted/unsupported as evidence, not operational status;
- absence of persistence-shaped fields;
- absence of storage APIs, timestamps, random ids, UUIDs, fingerprints, fake scores, and fake map data in Atlas sources;
- route contract preservation and absence of `/world` and `/workshop` aliases;
- Lab remaining future-only while Atlas becomes a foundation route;
- rendered Atlas legend, non-persistence copy, model-vs-world copy, World/Lab relationships, links, status attributes, overflow, focus, reduced motion, diagnostics, and Axe scans.

## 14. Non-Goals

GW4 does not implement:

- saved Discovery Atlas records;
- persistent evidence maps;
- saved behavioral landscape maps;
- sampled-region maps backed by real run data;
- regime detection;
- evidence-linked discoveries;
- discovery history;
- run history;
- notebooks or Lab records;
- saved interventions;
- storage;
- export/import;
- Atlas save/map actions;
- progression, XP, achievements, unlocks, levels, ranks, or streaks;
- route aliases or redirects;
- runtime/template/Builder execution behavior;
- validation/calibration or real-world certification.

## 15. Deferred Work

Deferred work includes persistent Lab records, real Discovery Atlas evidence records, source-backed sampled-region maps, saved behavioral landscapes, executable landscape probes, saved probe plans, stale-record handling, provenance-preserving Atlas records, comparison-backed contradictions, validation/calibration workflows, screen-reader walkthroughs, assistive-technology walkthroughs, forced-colors checks, actual browser-zoom verification, and user-comprehension testing.

## 16. GW4B Audit Result

GW4B audit record:

```text
docs/ui/DISCOVERY_ATLAS_INFORMATION_ARCHITECTURE_AUDIT.md
```

GW4B inspected evidence-state semantics, non-persistence clarity, sampled/unsampled honesty, model-vs-real-world boundaries, absence of fake discoveries/maps/scores, Lab/World relationships, keyboard/focus/reflow behavior, Axe results, status semantics, and scope-creep risk.

GW4B changed `Sampled` from evidence / observed to evidence / unresolved because the current Atlas route has no source-backed Atlas records. The GW4B continuation completed the post-hardening rendered shell and full UI Playwright/Axe gates. GW5 later adds non-persistent Lab evidence-record semantics, not Lab-to-Atlas publication. GW6 later adds static capability guidance to Atlas. GW7 later adds non-persistent behavioral-landscape vocabulary and a conceptual scaffold. GW7B audits and hardens that scaffold without creating saved maps, sampled data, run sweeps, regime detection, Lab records, validation, calibration, or real-world discovery certification. GW8 later adds non-persistent landscape probe planning vocabulary and a conceptual probe-plan scaffold without executing probes, saving plans, generating samples, or detecting regimes.

## 17. GW6 Capability Guidance Relationship

Prompt GW6 adds static capability guidance to the Atlas route from `src/lib/capabilityGuidance.ts`.

That guidance describes current Atlas capability. It does not create Atlas capability. It does not create Discovery Atlas records, persistent evidence maps, sampled-region displays backed by run data, saved behavioral landscape maps, evidence-rating surfaces, validation, calibration, storage, generated guidance, or real-world discovery certification.

## Prompt GW7 Update

GW7 adds `docs/ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION.md`, `src/lib/behavioralLandscapeFoundation.ts`, and a bounded Atlas section for behavioral-landscape vocabulary. A behavioral landscape describes how model behavior may vary across model conditions. It is not a real-world map, empirical proof, or Discovery Atlas record. The GW7 conceptual scaffold is text-only and not sampled run data.

## Prompt GW7B Update

GW7B adds `docs/ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION_AUDIT.md` and hardens source/rendered checks for vocabulary honesty, evidence/capability status semantics, non-persistence, and the zero-Tab-stop conceptual scaffold. It does not add saved behavioral landscape maps, sampled-region maps, persistent Atlas records, run sweeps, regime detection, Lab records, runtime behavior, template behavior, Builder execution, validation, calibration, or real-world discovery certification.

## Prompt GW8 Update

GW8 adds `docs/ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION.md`, `src/lib/landscapeProbePlanningFoundation.ts`, and a bounded Atlas section for landscape probe planning vocabulary. A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery. The GW8 conceptual scaffold is text-only and not executable or saved.

## Prompt GW8B Update

GW8B adds `docs/ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION_AUDIT.md` and hardens the planned-comparison distinction plus source/rendered boundary checks. It does not create executable probes, saved plans, sampled results, run queues, sweeps, regime detection, Lab records, Atlas discoveries, persistence, progression, runtime behavior, template behavior, Builder execution, validation, calibration, or real-world discovery certification.

## Prompt GW9 Update

GW9 adds one bounded, deterministic, isolated, component-memory-only sampling preview. Exact executed coordinates may now be labeled sampled within that request, with final-tick numeric values and in-memory provenance. This does not create a saved Atlas evidence record, persistent sampled-region map, complete landscape, regime, Lab publication, validation result, or real-world discovery. The GW4/GW4B record semantics remain future work.
