# Start Hub And World-First Product Reset

Date: 2026-07-19
Prompt: R1
Status: implemented and audited by R1B; R2 and R2B complete; C1 is next

## Purpose

R1 resets ORTUS around the shortest useful loop:

```text
Pick a system -> run it -> change one thing -> observe the result -> go deeper
```

The previous shell led with four equally weighted destinations, dense route orientation, and broad capability boundaries. The live simulation was real, but it was visually compressed by configuration and explanation. R1 changes the product hierarchy without changing simulation behavior.

## Route And Navigation Reset

The current route contract is:

```text
/         -> Start Hub
/world    -> live World workbench
/builder  -> Workshop
/atlas    -> bounded Atlas preview and technical foundations
/lab      -> concise non-persistent Lab foundation
```

Primary navigation is `Start`, `World`, `Workshop`, and `Research tools`. The keyboard-operated Research tools menu provides Atlas, Lab, Experiments, and Compare runs. It supports Arrow Up/Down, Home, End, Escape, focus return, pointer use, and current-location state. There are no hover-only or unavailable destinations.

## Start Hub

The root route now answers what a user can do immediately. Its first viewport contains ORTUS identity, one product sentence, a featured Flocking starter, a primary action, and four plain-language pathways:

1. Explore a starter world.
2. Change a working system.
3. Build a system.
4. Open advanced tools.

Flocking is featured because the registered production runtime already produces legible motion quickly, exposes meaningful local-interaction parameters, and visibly connects neighbor-level rules with aggregate movement. The hero uses an actual ORTUS Flocking runtime capture, not a conceptual mockup or remote asset.

The current seven-system catalog is derived from `templateDescriptors`. `src/lib/systemCatalog.ts` adds presentation-only questions, manipulation summaries, visible-output summaries, and compact-control choices. It does not register templates, infer runtime support, or change engine behavior. Internal template ids are kept out of visible card copy.

The featured handoff opens `/world?template=flocking-boids&starter=flocking`. It selects the existing Flocking template and displays a dismissible page-session nudge:

1. Run the baseline.
2. Lower Alignment weight.
3. Run again.
4. Watch flock shape and Alignment score.

The nudge has no completion state, storage, analytics, personalization, lock, XP, or achievement behavior.

## World Reclaim

World moved from `/` to `/world`. At `1440x900`, the model workspace occupies roughly 74% of the application layout width; the active task rail occupies the remainder. The source order is model first, persistent run controls second, and task controls third. At narrower widths the model and controls stack before task content.

The former seven equal task cards are replaced by four direct controls and one secondary menu:

```text
Setup | Observe | Change | Compare | More
```

`More` contains Understand model, Experiments, and Diagnostics. Task selection is local React state and does not enter the simulation store. Only the selected task workspace renders. The World Stage stays mounted.

Persistent Run/Pause, Step, Reset, tick/time, and speed controls retain their existing semantics. Reset confirmation still describes discarded run state. R1 changes placement and density, not execution.

## Compact Setup

Setup now leads with the selected runtime template, active scenario/starting recipe, seed, intervention count, and four high-value controls selected from the existing template parameter definitions. Every compact control edits the same authoritative parameter used by the engine.

All remaining exact parameters stay available through `All parameters`. Scenario Builder remains available through `Scenarios and starting recipes`. Neither disclosure creates alternative defaults or a hidden configuration path.

## Model Explanation

Understand model now defaults to six model-specific sections:

```text
Question
How the model works
What to watch
Try changing
Key assumptions
Main limitation
```

`ModelExplanationPanel` derives this copy from the selected production template documentation, assumption profile, and presentation catalog. Normalized rendered de-duplication removes punctuation-only repeats without mutating source documentation. Full model notes retain entities, state, scheduling, initialization, submodels, assumptions, limitations, represented scope, appropriate and inappropriate use, ethics, validation record, and technical provenance.

Unrelated product boundaries about Builder execution, LLM agents, schema execution, external frameworks, or other templates are not rendered in the model-specific default explanation.

## Guidance Hierarchy

Large permanent capability matrices no longer lead World, Workshop, Lab, or Atlas. The shared guidance hierarchy is now:

1. One route-specific capability note.
2. An explicit capability-reference disclosure.
3. The complete source-backed technical inventory inside that disclosure.

World shows its note in Setup, not Understand. Workshop places the entire capability surface behind `Workshop capability reference`. Atlas and Lab keep concise notes beside their actual route content. Limitations that affect interpretation remain near model outputs, comparisons, and preview results.

## Route-Level Changes

Atlas places the implemented bounded sampler before conceptual model-space orientation. Preview method, orientation, complete capability reference, and historical technical foundations remain available through disclosures. GW9/GW9B request validation, execution, cancellation, provenance, staleness, storage isolation, and result semantics are unchanged.

Lab opens with one short current-state statement and direct links to World, Compare runs, and Atlas. Its evidence-record lifecycle and experiment-ledger foundations remain behind `Lab technical foundation`. No record is saved.

Workshop uses a shorter header, preserves Guided and Advanced as direct choices, hides the full capability wall and support matrix by default, and does not show required-field error counts before the user attempts progression. Guided placeholders provide examples. All structural authoring, validation assistance, import/export, Graph View, fit reporting, and scenario planning remain non-executable and available.

## Visual And Responsive Decisions

R1 raises the practical type hierarchy, removes negative letter spacing, reduces decorative corner/console treatment, distinguishes primary workspace from supporting detail, and reduces equal-weight panel framing. The live model is the dominant World object; Atlas's real preview is its dominant tool; Lab's useful links dominate its conceptual foundation; and Workshop's active authoring choice dominates its capability reference.

Rendered review covered `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`, plus a `390x844` Start Hub check. R1 fixed a 900-pixel World stacking overlap, two real 1280x600 Workshop focus-visibility defects, and a broad Guided Builder selector that visually collided the Draft Steps title with its step-count eyebrow. The final Workshop geometry assertion rejects that title collision. Document horizontal overflow is rejected by tests.

## Accessibility Behavior

The reset preserves one `main` and one H1 per route, native links, visible text labels, color-independent current state, reduced-motion handling, global focus-visible styling, keyboard menus, Escape focus return, and disclosure reload reset. Playwright/Axe verifies covered rendered states, including Start, World, route shells, Guided/Advanced Builder paths, Atlas states, and short-height focus visibility.

This is automated browser and expert-review evidence. It is not a user-comprehension study, screen-reader or assistive-technology certification, forced-colors verification, actual browser-zoom verification, mobile-workflow validation, or WCAG conformance claim.

## Integrity And Non-Goals

R1 does not change simulation scheduling, engine state, template rules, scenarios, metrics, interventions, Experiment Runner execution, run comparison semantics, Atlas execution, Builder structural semantics, or persistence behavior. It adds no template, primitive, backend, account, analytics, remote asset, AI guidance, personalization, saved tutorial, Lab record, Atlas record, generic sampler, schema execution, or generated RunConfig.

The final production-build gate found one shared-shell defect: the new query-aware navigation used `useSearchParams` without a Suspense boundary, so every static route failed prerendering after compilation. `ResearchWorldShell` now owns that boundary, the normal production build prerenders Start, Atlas, Lab, and Workshop successfully, and the R1 source contract protects the boundary. This is render/build containment only; it does not change navigation destinations or runtime state.

The Start catalog and quick-control mapping are presentation metadata only. A card says runnable only because it wraps an existing registered production template. Runtime support remains earned by the template implementation and registry, never inferred from presentation copy.

## Known Limits

- R1/R1B do not prove that first-time users understand ORTUS; the R1B evidence is expert review and automated browser testing, not a participant study.
- R2 subsequently reclaimed the World frame, but deeper expert tools remain technically dense and require bounded internal scrolling.
- Lab is still mostly a technical foundation, not an evidence workspace.
- Guided Builder remains schema-oriented; recipe-first construction belongs to S2.
- Atlas supports only the explicit bounded Flocking preview contract.
- Canvas interpretation, actual browser zoom, forced colors, screen-reader use, and assistive-technology use require later audits.

## R1B Audit Outcome

The evidence record is `FIRST_RUN_AND_WORLD_FIRST_SHELL_AUDIT.md`. R1B found no P0 defect, fixed all four R1-attributable P1 defects, and fixed five bounded P2 defects. Featured starter relaunch now creates a fresh paused tick-0 Flocking run, parameter-rebuild semantics are explicit, World task/query/current state stays aligned, keyboard menu focus is deterministic after hydration, More selections focus the new panel and reset its scroll, Neural Understand prioritizes a model limitation, Atlas Run is visible at short desktop height, and the mobile ORTUS wordmark remains visible.

R1/R1B add no new persistence. Existing bounded World comparison and UI storage remain unchanged. Simulation, template, scenario, metric, intervention, experiment, comparison, Atlas execution, and Builder structural semantics remain unchanged.

## Subsequent R2 Handoff

R2 preserves the R1/R1B fresh-starter and runtime boundaries while replacing the compressed World task column with a stable stage, persistent playback, direct task navigation, and one bounded active tool. Its implementation record is `WORLD_LAYOUT_AND_INTERACTION_RECLAIM.md`.

R1 complete. R1B complete. R2 complete. R2B complete. `C1: Starter World Content Framework` is next and has not started. F1 and the fractal branch remain paused under the future E3 Analytical Lenses milestone.
