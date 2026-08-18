# Guided Investigation World Experience

Prompt: C3 / C3B

Status: C3 and C3B complete; C4 unstarted. `../ROADMAP.md` owns current sequencing.

## 1. Guide landing route

`/worlds/guides/reading-a-flock` is a directly linkable static route. Its first viewport presents the question, concise premise, estimated time, deterministic Flocking comparison motif, derived Noise difference, two existing outputs, primary baseline launch, and flagship return. The remaining order is Question, What changes, What stays controlled, What you will inspect, Start, Outline, Model boundary, and Continue without the guide.

## 2. Discovery links

One subordinate `Reading a Flock` callout appears on the `Local Rules, Global Patterns` collection and `Coordination Under Sensor Noise` detail page. It identifies the question, time, outputs, and guide action without displacing the ordinary baseline or contrast actions. The guide is not a Starter World card, search result, filter item, or runtime-count entry; the catalog remains eleven worlds.

## 3. World guide placement

The guide renders inside the existing active-tool scroll surface, after the normal World tasks. It does not add a permanent column or modal overlay. The live stage and persistent playback remain mounted and visually dominant, while Setup, Observe, Change, Compare, Explain, and More stay reachable.

## 4. Guide header

The header names `Reading a Flock`, the current recipe, and `Step N of 4` in text. Landing, flagship, collapse or expand, and Exit guide controls use specific accessible names. It shows no percent, score, streak, mastery, achievement, or course-completion treatment.

## 5. Step navigation

All four phase steps are visible as native buttons. Users can jump, move Previous or Next, skip unmet checks, use normal World tasks, or exit at any time. User-initiated step movement focuses the new step heading. Phase and step identity are exposed as programmatic data attributes for bounded testing, not stored progress.

## 6. Technical status

Technical checks report prepared-run match, paused/running state, tick, horizon, metric availability, task visibility, and generic summary availability with neutral language. Horizon status uses a bounded announcement and never announces every tick. Checks orient the workflow; they do not infer learning, correctness, or completion and never disable forward movement. C3B adds a persistent modified-run state when template, recipe provenance, initialization, seed, parameters, or interventions diverge.

## 7. Baseline flow

Baseline step one shows the active `Clear local signals` recipe, derived Noise value, seed, entity count, current tick/state, and outputs with an existing Open Setup action. Step two points to playback and the derived horizon without automatic execution. Step three opens Observe and explains the implemented Alignment and Dispersion outputs. Step four opens Compare and links to the paired contrast; capture remains explicit existing behavior.

## 8. Contrast flow

Contrast step one shows a fresh paused tick-0 `Noisy local signals` run, both Noise values, shared seed/count, and the audited matching initialized state. Step two requests the same horizon without calling the pair statistical evidence. Step three opens Observe for the same outputs. Step four opens Compare, preserves a truthful no-summary fallback, shows bounded existing summary metadata without assigning guide provenance, and offers a direct baseline reopen.

## 9. Reflection

The final contrast step includes non-scored questions about relative output change, visual versus numeric interpretation, another seed, and an intermediate Noise value. It offers existing Setup, flagship, collection, baseline, and exit actions. There is no answer form, stored text, completion badge, or claim that a lesson was completed.

## 10. Exit and collapse

Collapse unmounts hidden guide content, preserves the mounted-page step and active run, closes staged restore confirmation, and focuses the Expand guide control. Exit removes only guide presentation and the `guide` URL parameter with same-document history replacement. It preserves tick, playback, Setup drafts, current task where possible, and existing comparison summaries, then focuses stable World stage context.

## 11. Direct contrast entry

A strict contrast URL opens contrast step one directly. The copy says direct entry does not assume the baseline was run and offers a baseline route. Reload reconstructs a fresh paused tick-0 contrast run and resets the mounted step. It never redirects through baseline or fabricates a saved summary.

## 12. Focus management

Existing task actions focus the selected task heading. Playback focus lands on the current Run or Pause control. User step changes focus the current step heading. Paired-recipe navigation focuses replacement recipe context. Material rebuild divergence focuses its warning; staged restore and cancellation have deterministic focus return. Collapse focuses Expand, expansion preserves logical location, and exit focuses the World stage. Hidden guide content is unmounted and cannot remain tabbable.

## 13. Responsive behavior

The landing and guided World were designed for `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844`. Short-height landing composition keeps the primary action visible and hints at the next section. World preserves the established responsive stage, playback, task, and single active-tool flow without horizontal document overflow or a second guide column.

## 14. Accessibility

Routes use one H1, coherent headings, visible recipe and step text, native controls, non-color-only baseline/contrast labels, specific link/button names, restrained live status, keyboard-operable steps, reduced-motion behavior, and text alternatives for the decorative comparison motif. Automated checks are not screen-reader, assistive-technology, forced-colors, complete-touch, or WCAG certification.

## 15. Error states

Unknown, malformed, duplicated, owner-mismatched, recipe-mismatched, recipe-missing, guide-state, runtime-override, object-payload, and unsafe-key query forms fail on the existing announced Starter launch error. C3B adds a `/world` middleware boundary for promise/prototype-like query names that Next may interpret before page code. The invalid route provides Explore Worlds and Start return paths and mounts no AppShell, stage, template, or engine.

## 16. Verification

`tests/ui/guided-investigation.spec.ts` preserves the C3 happy paths. `tests/ui/guided-investigation-audit.spec.ts` adds parameter/seed/population/template divergence, restore/cancel, generic summary provenance, all primary task replacements, Back/Forward, reload/new tab, hostile query keys, responsive modified states, reduced motion, Axe, overflow, and diagnostics. Headless guide and authority-drift contracts live with `src/lib/starterWorlds/guides` tests; C3B evidence is in `docs/product/GUIDED_INVESTIGATION_TUTORIAL_WORLD_AUDIT.md` and final gates are recorded in `docs/codex/SESSION_LOG.md`.
