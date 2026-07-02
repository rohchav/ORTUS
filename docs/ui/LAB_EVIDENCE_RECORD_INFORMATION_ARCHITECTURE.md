# Lab Evidence Record Information Architecture

Status: Prompt GW5 implementation source of truth. GW5 turns `/lab` into a non-persistent Lab information architecture for future evidence records and experiment-ledger semantics. It does not create persistent evidence records, experiment ledgers, notebooks, saved comparisons, run history, Lab-to-Atlas publication, storage, timestamps, generated ids, fake records, fake scores, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

## 1. Purpose

GW5 defines how Lab records should eventually be interpreted without pretending that records exist today.

Required principle:

```text
Lab records will organize evidence about model investigations.
They will not certify discoveries about the real world.
```

## 2. Scope

GW5 adds:

- a small source model in `src/lib/labFoundation.ts`;
- a bespoke `/lab` page rendered from that model;
- evidence-record lifecycle semantics;
- a conceptual experiment-ledger scaffold labeled as not saved Lab data;
- explicit World, Atlas, model-vs-world, and non-persistence boundaries;
- tests for Lab semantics and rendered route behavior;
- documentation and durable guardrails.

GW5 does not add persistence, saved Lab records, experiment history, notebooks, comparison sets, run-history ingestion, evidence scoring, save/send/publish actions, new routes, redirects, dependencies, or simulation behavior.

## 3. What Lab Means In GW5

Lab is a non-persistent foundation in GW5.

It is an information-architecture surface for future model-investigation evidence records. It is not a saved experiment database.

Persistent evidence records, experiment ledgers, notebooks, saved comparisons, and run history are not implemented yet.

## 4. Record Lifecycle Vocabulary

The Lab lifecycle vocabulary is defined in `src/lib/labFoundation.ts`.

Current lifecycle states:

- `Draft schema`: capability / future-only.
- `Awaiting capture`: capability / future-only.
- `Not persisted`: capability / future-only.
- `Unresolved`: evidence / unresolved.
- `Model-only`: evidence / unresolved.
- `Externally unvalidated`: evidence / unverified.
- `Comparison not implemented`: capability / future-only.
- `Notebook not implemented`: capability / future-only.
- `Future-only`: capability / future-only.

Future-only is capability status. It is not evidence support and it is not a locked route.

## 5. Experiment Ledger Scaffold

The experiment-ledger scaffold is conceptual record anatomy only.

Required label:

```text
Conceptual scaffold - not saved Lab data.
```

The scaffold names possible future slots for record schema, run provenance, comparison, and interpretation. It does not create an experiment history, notebook, saved comparison, or reusable Lab asset.

## 6. Model Evidence Versus Real-World Validation

Model-only means the future evidence would describe model behavior under assumptions.

Externally unvalidated means the future interpretation lacks external calibration or validation.

Neither state certifies real-world discovery, causal proof, policy authority, operational readiness, or empirical truth.

## 7. Non-Persistence Boundary

Nothing on the GW5 Lab route is a saved experiment, saved evidence record, or persistent run history.

GW5 adds no localStorage, sessionStorage, IndexedDB, cookies, database storage, cloud storage, accounts, export/import behavior, generated ids, timestamps, fingerprints, or route-state persistence.

## 8. Relationship To World

World currently exposes live provenance, observation, and intervention readiness.

GW5 Lab does not save those runs or convert them into evidence records.

No `Save this run`, `Send to Lab`, `Create evidence record`, or `Record experiment` action exists.

## 9. Relationship To Atlas

Atlas currently defines non-persistent evidence-state semantics.

GW5 Lab does not publish records to Atlas or create discoveries.

No `Publish to Atlas`, `Create discovery`, or `Map evidence` action exists.

## 10. Status Semantics

Lab route status is capability / planning-only.

Evidence-record lifecycle states must keep capability status separate from evidence status. Draft schema, awaiting capture, not persisted, comparison-not-implemented, notebook-not-implemented, and future-only are capability / future-only. Unresolved and model-only are evidence / unresolved. Externally unvalidated is evidence / unverified.

## 11. Accessibility And Keyboard Behavior

The Lab route has one route-level H1: `Lab`.

The route stays inside the shared `main`, uses section headings, renders status text rather than color-only meaning, keeps World, Workshop, and Atlas links as native anchors, and adds no fake interactive controls or focus traps.

Axe passing is rendered smoke evidence only, not screen-reader readiness, assistive-technology readiness, forced-colors readiness, browser-zoom readiness, WCAG conformance, or user-comprehension validation.

## 12. Testing

GW5 adds unit contracts for `src/lib/labFoundation.ts` and extends `tests/ui/research-world-shell.spec.ts` for rendered Lab foundation semantics.

Required checks include typecheck, unit tests, rendered UI tests, production build, performance smoke, `git diff --check`, lint availability reporting, and a scope-creep search for persistence, fake records, fake scores, progression, timestamps, random ids, and Lab/Atlas publication actions.
