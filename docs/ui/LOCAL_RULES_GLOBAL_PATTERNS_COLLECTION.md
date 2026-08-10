# Local Rules, Global Patterns Collection

Prompt: C2 / C2B

Status: C2, C2B, C3, and C3B complete; C4 next

## 1. Catalog Integration

`/worlds` now opens with one featured collection region followed by all eleven runnable Starter Worlds. The region names the pack, states its question, shows the four included experiences and comparison questions, and offers one `Open collection` action. All original seven worlds remain in the same searchable catalog.

## 2. Collection Route

`/worlds/packs/local-rules-global-patterns` is directly linkable. It opens with the collection identity and primary world, then presents four system questions, mechanism distinctions, a non-persistent usage sequence, and one research boundary.

## 3. Collection Hierarchy

The collection emphasizes systems and actions before caveats. It does not make pack membership another taxonomy wall, imply a shared mathematical model, lock order, or track completion. The opening leaves later content discoverable at required desktop and mobile sizes.

## 4. Detail-Page Changes

The four flagship details retain the C1 anatomy, mechanisms, investigations, research connection, boundary, and remix structure. Their first viewport adds an explicit baseline action and a visible paired-contrast cue. Each page links to its broader parent world and the collection.

## 5. Recipe Cards

Each `Prepared comparison` section contains one Baseline and one Contrast card. Text labels distinguish roles independently of color. A comparison-wide tick-zero row states material initialized-state equality and difference. Cards show the recipe title, role-specific scenario differences, a bounded subset of shared scenario settings, recommended task, run horizon, named outputs, visual cue, and specific launch action.

## 6. Controlled Differences

Card values come from `PreparedStarterComparison.controlledDifferences`, which is derived from validated scenario configurations. Shared settings are likewise generated. C2B established that this configuration diff does not exhaust initialized-world differences, so material tick-zero state is separately disclosed and engine-tested; Firebreak now states its 40-cell fuel-quantity change directly.

## 7. World Handoff

Recipe actions use `/world?starter=<starterWorldId>&recipe=<recipeId>`. Registry construction validates ownership, template, preset, task, seed, parameters, options, and outputs. At request time, World revalidates both strict IDs and their immutable registry relationship before scenario construction validates the effective scenario again. Missing, malformed, unknown, duplicate, mismatched, or override-bearing requests render an announced error before the World shell mounts.

## 8. Recipe Context

World shows the flagship title, recipe title, concise purpose, bounded run horizon, named outputs, detail link, collection link, and sibling action in a dismissible mounted-page nudge. Recommended task activation is preserved on first load while ordinary task navigation keeps the active run mounted.

## 9. Sibling Navigation

The sibling action is an explicit link to the paired recipe. Activation creates a fresh paused tick-0 scenario; it never mutates the current run in place. Focus moves to the newly loaded recipe context instead of remaining on a link whose action has reversed. Browser Back remains coherent, and dismissal does not create storage or progress state.

## 10. Visual Identity

Deterministic local CSS/DOM motifs show aligned versus scattered motion, one cluster versus separate hotspots, coupled prey/predator traces, and a connected grid interrupted by a marked corridor. The visuals contain no live engine, fabricated metric value, remote asset, third-party screenshot, or color-only semantic distinction.

## 11. Responsive Behavior

Rendered C2B checks cover `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844`. The collection, details, tick-zero disclosure, recipe cards, and World context avoid horizontal document overflow and keep actions reachable. World retains its dominant batched-render stage.

## 12. Accessibility

Routes retain one H1, meaningful section order, specific card and action names, visible role text, keyboard-operable links and controls, focus return after dismissal, focus transfer after sibling activation, reduced-motion usability, and expanded Axe-clean states. This is rendered automated evidence, not screen-reader, AT, forced-colors, touch, or WCAG certification.

## 13. Error States

Invalid recipe requests use the existing Starter launch error surface with `role=alert`, a single explanatory H1, and links back to Explore Worlds and Start. No template, stage, engine, or partial run is mounted.

## 14. Verification

`tests/ui/starter-world-pack.spec.ts` covers catalog integration, collection hierarchy, all four details, all eight launches, recipe values, tick-zero disclosure, reload, Back, running/draft/comparison sibling replacement, focus, dismissal, hostile requests, six viewports, mobile operation, reduced motion, diagnostics, and Axe. C2B's audit is `docs/product/FLAGSHIP_STARTER_PACK_ONE_AUDIT.md`; full final gates are recorded in `docs/codex/SESSION_LOG.md`.

## 15. Guided Investigation Integration

C3 adds one subordinate `Reading a Flock` callout to this collection and the Coordination detail page. It links to `/worlds/guides/reading-a-flock`, derives the prepared pair and output names from the audited pack, and leaves all ordinary recipe actions prominent. C3B verifies that source drift fails closed and that modified active runs cannot retain the prepared-pair claim. The guide is not a fifth pack world or a twelfth catalog world, does not participate in search/filter/counts, and adds no progress, automatic execution, automatic capture, comparison store, or runtime behavior. C3B is complete; C4 is next.
