# Starter Remix Bridge Audit

Status: S1B COMPLETE; S2 NEXT / UNSTARTED

Date: 2026-09-03

This is the S1B implementation and evidence record. It is subordinate to `../CAPABILITIES.md`, `../ARCHITECTURE.md`, `../SCIENTIFIC_MODEL.md`, and `../ROADMAP.md`. Code and tests remain authoritative for behavior.

## Separate Verdicts

**S1 plumbing: technically accepted after hardening.** The audited bridge supports bounded configuration derivatives of existing immutable Starter-backed scenarios. It does not implement general model construction, executable schemas, executable Builder graphs, arbitrary formulas, or a new runtime.

**Current form-first Workshop UX: not validated as the intended future Workshop.** Passing S1B establishes the safety and integrity of the narrow bridge. It does not establish that the existing Guided/Advanced form editors are understandable, generative, curiosity-driven, or suitable as the primary future modeling experience. They remain structural, non-executable surfaces and potential secondary inspector/advanced surfaces.

The UR0 human comprehension gate remains pending. Browser automation and expert review cannot close it.

## Starting State

- Branch `main` started clean at `b400795` (`feat: bridge starter worlds into remix`), aligned with the observed `origin/main` reference.
- S1 was complete. S1B and S2 were unstarted.
- Production Flocking used one Worker-owned engine/RNG/scheduler authority. The six non-Flocking templates used their established main-thread engines.

## Audit Scope

The audit traced canonical Starter and recipe definitions through source resolution, derivative creation, local candidate editing, scenario validation, accepted runtime replacement, active-World handoff, provenance rendering, reset/rebuild, navigation, malformed URLs, keyboard operation, and both production runtime paths.

The audit also rendered normal Workshop and actual Starter Remix at desktop and mobile sizes. That review checked the product boundary; it was not a human-comprehension study or endorsement of the form-first interface.

## Findings And Fixes

### P0

None found.

### P1

1. **Canonical lineage could be structurally valid but factually inconsistent with its claimed Starter.** A lineage object could carry a changed source configuration or slug while passing its local schema. Lineage reading now resolves the canonical Starter/recipe/template/scenario and requires exact source identity, version, and configuration equality.
2. **Active-World handoff could launder same-template provenance and leave stale handoff state.** The handoff previously checked only template identity and rewrote metadata during consumption. Preparation now clears any older pending handoff first, accepts only a full source-matched accepted `RunConfig`, never rewrites accepted metadata, and remains one-use.
3. **Resulting-World acceptance relied on metadata without requiring the accepted scenario identity.** Launch acceptance now validates the complete accepted `RunConfig`, including template, derivative scenario ID, canonical lineage, and requested source identity. A stale or mismatched run cannot satisfy the URL.
4. **Setup rebuilds could discard executable variant fields and the distinction between an untouched Starter recipe, a derived active configuration, and an accepted Remix.** Rebuilds now start from the accepted validated configuration, synchronize template-owned variant options through the existing scenario contracts, retain exact Remix lineage, and replace direct prepared identity with a narrow validated `derived-active-configuration` Starter-origin marker. Flocking remains config-only in the UI store; legacy rebuilds still create engines through the established scenario/run-config path.

No known S1B P0 or P1 remains after the focused and final gates recorded below.

### P2

1. **Worker readiness copy was premature.** Queuing a Flocking configuration was described as a ready tick-zero run before Worker acceptance. The copy now distinguishes accepted/queued configuration from Worker readiness.
2. **Starter-origin Reset disclosure differed by runtime path.** Worker and legacy reset notices now both distinguish retained active configuration and Starter origin from discarded prepared-recipe identity and run progress.

## Contract Results

- Canonical Starter, recipe, pack, and guide registries remain recursively frozen. Remix creation deep-validates and creates derivative state; it never mutates registry content.
- Workshop Remix controls come from production template parameter definitions plus existing initialization, behavior, composition, environment, scenario-validation, and scenario-application services. No parallel parameter registry exists.
- Invalid candidates remain local to the Workshop draft. Launch is disabled until validation succeeds, and a rejected candidate cannot replace the accepted World run.
- `flocking-boids` retains exactly one executing Worker authority. React does not create a Flocking `SimulationEngine`; no Local fallback or duplicate RNG/scheduler was introduced.
- Epidemic, Opinion, Predator-Prey, Schelling, Forest Fire, and Neural remain on their established main-thread runtime path. S1B does not claim cross-template Worker support.
- Active-World transfer is bounded, in-memory, one-use, accepted-config-only, source-matched, and invalidated before every new preparation attempt. A failed preparation cannot expose an older handoff.
- Accepted Remix Reset returns the same derivative configuration and lineage at tick zero. Reset to source in Workshop restores the canonical source draft. Rebuilding a direct Starter run drops untouched prepared identity while retaining only validated Starter origin. Reload of an unsaved derivative fails closed; Back/Forward and source switching create isolated page-session drafts.
- Missing, empty, duplicate, unsupported, stale, payload-bearing, and prototype-like Remix query input fails before constructing a runnable surface. The built production app returned the explicit unsafe-query stop state for `constructor` input and completed the response normally.
- The architecture smoke gate and source review found no `eval`, `Function`, string timer, arbitrary formula, runtime module, or dynamic execution path in S1/S1B.
- The core Remix flow remains keyboard-operable, including source entry, grouped controls, validation, Reset to source, leave confirmation, and explicit launch. Focused Chromium/Axe and responsive evidence is not direct screen-reader, assistive-technology, actual-zoom, forced-colors, touch-device, formal-WCAG, or human-comprehension evidence.

## Provenance Limit

Starter and Remix provenance is strict, bounded, schema-checked application metadata tied to canonical current Starter definitions. It is not a cryptographic signature, external chain of custody, empirical evidence, or proof that an imported user-controlled artifact has an independently verified history. Product language must not promote it beyond that contract.

## Product Boundary

S1B validates only this path:

```text
canonical existing Starter/recipe
  -> unsaved configuration derivative
  -> explicit validation
  -> established template runtime
```

It does not validate this claim:

```text
current form-first Workshop
  -> intended future modeling experience
```

The current Guided/Advanced Workshop remains structural and non-runnable. The current Remix workspace remains configuration-oriented and template-bound. Neither is generic model composition.

## S2 Handoff

S2 is next and unstarted: **S2 - Visual Systems Workbench**.

Its dedicated prompt must explore an example-first workbench centered on taking working systems apart visually; explicit agents, cells, nodes, edges, fields, spaces, processes, and interactions; expand/collapse decomposition; relationship inspection; and split, duplicate, substitute, or merge concepts only where an explicit supported contract exists. Starter examples should act as worked modeling examples, Remix should support curiosity-driven exploration, and existing forms should become secondary inspector or advanced surfaces where appropriate.

Every S2 object and operation must visibly distinguish `EXECUTABLE NOW`, `STRUCTURALLY REPRESENTABLE`, `REFERENCE`, and `FUTURE`. S2 must not infer runtime behavior from a diagram, execute Builder edges, compile `ModelSchemaDefinition`, bypass template capability checks, or imply that visually represented fields, networks, processes, or relations are runtime-supported.

S1B implements none of that S2 UI.

## Verification

Focused verification before closure passed:

- Starter Remix and production-adoption unit coverage: `2 files / 27 tests`.
- Focused active-World and strict malformed-query Playwright coverage, including empty and prototype-like query keys.
- Desktop/mobile normal Workshop and actual Remix rendered review.
- A current-source typecheck and production build with `23` generated pages.
- The built production malformed-query probe returned the explicit unsafe-query stop state in `0.084s`.

Final closure verification passed:

- `npm run lint`: passed, including unused-symbol checks and the scoped architecture/accessibility gate over `391` production TypeScript files.
- `npm run typecheck`: passed.
- Focused post-fix contracts: `7 files / 60 tests` passed.
- `npm test`: `89 files / 764 tests` passed in `104.29s`.
- `npm run build`: compiled in `35.1s` and generated `23` pages.
- `npm run perf:runtime`: passed exact 100/500 Flocking snapshot-export equivalence, automatic medians of `141.724/20.251` ticks/s, unchanged `2,300/11,500`-byte packets, and no packet metric history.
- `npm run perf:simulation`: passed unchanged exact Flocking pair counts `316,971/7,721,264`; the bounded Atlas smoke completed `2` runs / `10` work units / horizon `5` in `46.68ms`.
- `npm run test:ui`: `204/204` passed in `34.5m`, with no failures, retries, or skips. This includes all seven Starter Remix tests.
- `git diff --check`: passed at closure.

## Remaining Evidence Limits

- UR0 human comprehension remains pending broader formative evidence.
- No direct screen-reader, assistive-technology, actual browser-zoom, forced-colors, complete touch-device, browser-diversity, formal WCAG, or participant-comprehension conclusion is warranted.
- No scientific validation, calibration, empirical truth, causal proof, robustness proof, policy recommendation, or real-world effectiveness claim is warranted.
- S1B adds no durable model persistence, backend, account state, general composition, schema execution, visual programming, new template family, or cross-template runtime migration.
