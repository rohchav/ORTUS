# Guided Investigation Tutorial World

Prompt: C3 / C3B

Status: C3 and C3B complete; C4 Flagship Starter Pack Two next

## 1. Scope

C3 adds one optional guided investigation, `Reading a Flock`, over the audited `Coordination Under Sensor Noise` Starter World. It combines one static landing route with a compact World guide for the existing clear-signals baseline and noisy-signals contrast. It does not create another simulation, recipe, metric, comparison engine, or persistent learning system.

## 2. Product objective

The experience helps a first-time user identify one controlled configuration difference, inspect a prepared start, run both existing configurations, read Alignment and Dispersion separately, use the existing Compare task explicitly, and formulate a follow-up question. It organizes real controls and outputs without claiming that a person learned, understood, or proved anything.

## 3. Why Reading a Flock

The selected pair changes only the audited Noise setting while preserving the same seed and matching initialized positions and headings for 160 boids. Motion is immediately visible, Alignment and Dispersion are existing numeric outputs, and the comparison requires no new runtime mechanics or sensitive human interpretation. The pair is still only two fixed stylized model runs.

## 4. Guide contract

`GuidedInvestigationDefinition` version `"1"` lives in `src/lib/starterWorlds/guides`. The strict Zod contract contains bounded instructional metadata and references existing pack, world, comparison, output, task, and recipe authority. Validation rejects duplicate identities, broken ownership, unsupported references, executable values, arbitrary conditions, runtime payloads, persistence fields, unsafe keys, authored recipe values, and numeric expected-result claims. The deterministic registry is recursively frozen and data-only.

## 5. Prepared-pair-reading mode

C3 supports exactly one mode: `prepared-pair-reading`. Its actions and technical checks come from closed enumerations. They can orient a user to existing tasks, playback, outputs, comparison summaries, and paired-recipe links; they cannot branch arbitrarily, execute a run, score a learner, or establish completion.

## 6. Guide phases

The current recipe role determines the phase. The baseline and contrast phases each contain exactly four visible steps. Step selection is mounted-page presentation state, every step remains directly reachable, factual checks are advisory, and no step is a hard gate. Direct contrast entry starts at contrast step one without assuming a baseline run.

## 7. Baseline phase

The baseline uses the existing `Clear local signals` recipe. Its four steps confirm the prepared start, point to existing playback, distinguish Alignment from Dispersion through the Observe task, and explain explicit capture through the existing Compare task. The guide does not auto-run, auto-pause, auto-advance, auto-capture, reveal fixed-seed final values in advance, or create a guide-owned baseline record.

## 8. Contrast phase

The contrast uses the existing `Noisy local signals` recipe and always enters as a fresh paused tick-0 run. Its four steps identify the controlled Noise difference, request equal runtime without calling the pair an experiment, revisit the same outputs, and use the existing Compare task. When no suitable saved summary is available, the guide states that absence and offers a baseline link instead of fabricating values.

## 9. Reflection

The final contrast surface asks which output changed more, whether visual motion and numeric outputs suggest the same interpretation, what another seed could reveal, and which intermediate Noise setting could be investigated next. Responses are not collected or stored. Existing Setup, flagship, collection, baseline, and exit actions remain optional.

## 10. Runtime authority

The renderer derives baseline and contrast recipes, controlled differences, shared effective settings, seed, entity count, tick-zero claims, output labels, horizon, and canonical URLs from the audited C2 registries. C3B centralizes the strict cross-check for pack flagship membership, comparison/recipe ownership, exact roles, validated initialization, exactly one numeric Noise difference, shared conditions, outputs, and horizon. Production derivation constructs no engine and fails closed rather than falling back to stale copy when authority drifts. World revalidates guide, world, comparison, recipe role, template, preset, task, outputs, seed, and parameters before runtime construction.

## 11. Comparison boundary

C3 uses only the existing World Compare workflow and `ortus.runComparison.v1`. A user must explicitly capture a bounded run summary. C3B keeps availability generic and exposes existing label/template/seed/tick metadata instead of claiming guide ownership or a valid baseline without proof. It does not alter the schema or cap, auto-name, overwrite, add statistics, or create evidence.

## 12. Learning-inference boundary

The guide reports software and model facts, not a learner state. It does not infer comprehension, confusion, expertise, intent, correctness, learning, or mastery. It does not claim causality, robustness, significance, calibration, animal behavior, autonomous-vehicle safety, or a universal coordination threshold. Its single visible boundary is: `This guide compares two fixed, stylized model runs. It helps inspect model behavior; it does not establish a universal threshold, real-world validity, or learning outcome.`

## 13. Persistence boundary

C3/C3B add no persistence and no storage key. The guide definition is static content, the guide identifier is URL state, and the current phase step, collapse, and restore-confirmation state are mounted-page state only. Reload reconstructs the selected recipe as a fresh paused tick-0 run and resets to that phase's first step. Existing World comparison persistence is unchanged.

## 14. Non-goals

C3/C3B do not add a curriculum engine, multiple guides, progress, completion, quizzes, grades, profiles, recommendations, adaptive tutoring, analytics, AI explanations, automatic interpretation, automatic execution, automatic capture, runtime metrics, Flocking behavior, recipes, comparisons, engine primitives, Lab evidence, Atlas discoveries, Builder execution, dependencies, or remote assets. C4 is not implemented here.

## 15. Verification

Headless coverage locks the schema, strict parsing, registry determinism and freezing, adversarial authority drift, canonical launches, fresh paused tick-zero construction, invalid-launch rejection, exact initialized-state equality, fixed-seed horizon regression, forbidden copy, and persistence/runtime isolation. Rendered coverage exercises landing, baseline, contrast, direct contrast, parameter/seed/population/template divergence, restore/cancel, summary provenance, all primary task histories, collapse, exit, reload/new tab, hostile query keys, focus, reduced motion, six viewports, Axe, diagnostics, and the unchanged eleven-world catalog. The evidence record is `docs/product/GUIDED_INVESTIGATION_TUTORIAL_WORLD_AUDIT.md`.

## 16. Remaining limitations

Automated and expert browser checks do not establish participant comprehension, educational outcomes, actual browser zoom, screen-reader or other assistive-technology behavior, forced-colors support, complete touch operation, formal WCAG conformance, robustness across seeds, calibration, or empirical validity.

## 17. C3B audit result

C3B found and fixed one P0 unsafe public-handoff family, two P1 authority/runtime-identity families, and five bounded P2 comprehension/focus/language families. No known P0 or P1 remains. External participant, educational-outcome, zoom, screen-reader/AT, forced-colors, touch, multi-seed, empirical, and formal WCAG evidence remains absent, so the result is `Conditionally ready for C4: Flagship Starter Pack Two`. C3B is complete; C4 is next and has not started.
