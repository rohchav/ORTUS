# Discovery Atlas Information Architecture

Status: Prompt GW4 implementation source of truth, audited and hardened by Prompt GW4B, updated during Prompt GW5B. GW4 creates a non-persistent Atlas information architecture and evidence-state vocabulary on `/atlas`. GW4B keeps sampled evidence unresolved until source-backed Atlas records exist. GW5 adds non-persistent Lab evidence-record information architecture, not Lab-to-Atlas publication. GW5B audits the Lab side of that boundary without adding publication. This Atlas foundation does not create saved discoveries, saved evidence records, behavioral landscapes, sampled-region maps backed by run data, persistent Lab records, run history, storage, progression, validation, calibration, real-world discovery certification, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

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

GW4 does not add persistence, storage, records, run ingestion, evidence scoring, Atlas save actions, behavioral landscapes, new routes, redirects, dependencies, or simulation behavior.

## 3. What Atlas Means In GW4

Atlas is a non-persistent foundation in GW4.

It is an orientation surface for future evidence about model behavior. It is not yet a Discovery Atlas product surface with stored records.

Discovery records, behavioral landscapes, sampled-region maps, and evidence-linked model regimes are not implemented yet.

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
- behavioral landscapes;
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

Deferred work includes persistent Lab records, real Discovery Atlas evidence records, source-backed sampled-region maps, behavioral landscapes, stale-record handling, provenance-preserving Atlas records, comparison-backed contradictions, validation/calibration workflows, screen-reader walkthroughs, assistive-technology walkthroughs, forced-colors checks, actual browser-zoom verification, and user-comprehension testing.

## 16. GW4B Audit Result

GW4B audit record:

```text
docs/ui/DISCOVERY_ATLAS_INFORMATION_ARCHITECTURE_AUDIT.md
```

GW4B inspected evidence-state semantics, non-persistence clarity, sampled/unsampled honesty, model-vs-real-world boundaries, absence of fake discoveries/maps/scores, Lab/World relationships, keyboard/focus/reflow behavior, Axe results, status semantics, and scope-creep risk.

GW4B changed `Sampled` from evidence / observed to evidence / unresolved because the current Atlas route has no source-backed Atlas records. The GW4B continuation completed the post-hardening rendered shell and full UI Playwright/Axe gates. GW5 remains a future prompt only; GW4B does not implement persistence, behavioral landscapes, Lab records, validation, calibration, or real-world discovery certification.
