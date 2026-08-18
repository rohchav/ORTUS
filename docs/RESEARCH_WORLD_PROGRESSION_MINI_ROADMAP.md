# ORTUS Research World Progression Mini-Roadmap

Status: HISTORICAL product-direction record after A0. Use `ROADMAP.md` for current sequencing, `CAPABILITIES.md` for implemented behavior, and `SCIENTIFIC_MODEL.md` for evidence contracts.

Status: historical GW0 planning record, updated after R1 to preserve the route and sequencing reset at that milestone.

GW0 is documentation, product architecture, information architecture, and roadmap planning only.

GW0 is documentation and progression architecture only. It does not implement routes, navigation, World/Lab/Atlas/Workshop pages, persistence, accounts, cloud storage, local storage, database schemas, progression state, unlocks, XP, levels, achievements, badges, streaks, missions, quests, daily rewards, discovery detection, regime classification, behavioral landscapes, contextual recommendations, notebooks, saved research assets, model composition, grand-system scenarios, runtime behavior, simulation behavior, template behavior, dependencies, assets, or mockups. Prompt UX2 later implements shared semantic visual tokens and a bounded shared primitive migration. Prompt GW1 later implements the first shared destination shell only; it still does not implement persistent Lab systems, Discovery Atlas behavior, behavioral landscapes, progression, runtime behavior, or template behavior. Prompt GW2 later implements a live World-only active-run provenance and observation layer; it still does not implement persistence, Lab records, Atlas records, behavioral landscapes, progression, runtime behavior, or template behavior. Prompt GW3 later implements a live World-only intervention readiness and boundary layer; it still does not implement saved intervention plans, Lab intervention records, Atlas discoveries, behavioral landscapes, progression, runtime behavior, or template behavior. Prompt GW3B later audits and hardens that intervention-readiness layer without adding persistence, Lab records, Atlas records, behavioral landscapes, progression, runtime behavior, or template behavior. Prompt GW4 later implements non-persistent Atlas information architecture and evidence semantics without adding saved Discovery Atlas records, persistent evidence maps, behavioral landscapes, Lab records, storage, progression, runtime behavior, or template behavior. Prompt GW5 later implements non-persistent Lab evidence-record semantics without adding saved Lab records, persistent ledgers, notebooks, run history, storage, progression, runtime behavior, or template behavior. Prompt GW6 later implements static source-backed capability guidance without adding saved records, generated guidance, persistence, progression, runtime behavior, or template behavior. Prompt GW7 later implements non-persistent behavioral-landscape vocabulary and a conceptual Atlas scaffold without saved landscapes, sampled maps, run sweeps, regime detection, progression, persistence, runtime behavior, or template behavior. Prompt GW8 later implements non-persistent landscape probe planning vocabulary and a conceptual Atlas scaffold without executable probes, saved plans, samples, run queues, sweeps, regime detection, progression, persistence, runtime behavior, or template behavior. Prompt GW8B later audits and hardens that landscape probe planning foundation without adding executable probes, saved plans, sampled results, run queues, sweeps, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, or template behavior. Prompt UX3 later audits rendered UI/UX comprehension and sandbox-theme fit without implementing production UI changes. Prompt UX4 later implements a bounded sandbox visual-language foundation without adding persistence, records, samples, runtime behavior, template behavior, Builder execution, dependencies, assets, fonts, route aliases, UX5, UX6, or GW9. Prompt UX4B later audits that foundation and marks it ready for UX5 without adding product behavior. Prompt RH1 later verifies local/remote source-of-truth state, records that GitHub was stale before the RH1 continuation push, and clarifies existing World-local comparison persistence and Experiment Runner sweeps without adding product behavior. Prompt GW9 remains future Research World work and must not start until the UX5/UX6 guided-comprehension track is addressed or explicitly waived.

The central principle:

```text
ORTUS progression should emerge from building a capable laboratory, discovering system behavior, and reaching new modeling frontiers—not from completing a prescribed checklist.
```

The product transformation:

```text
ORTUS should move from a collection of sophisticated modeling screens toward a persistent research environment where worlds, experiments, evidence, questions, and reusable capabilities accumulate.
```

The core guardrail:

```text
Progression must organize learning and discovery without implying that the user has mastered reality, proven a mechanism, or completed a scientific domain.
```

## 1. What A Research World Means

A Research World is an organized investigation context.

It is not a literal game world, not a complete real-world domain simulation, not a domain authority, and not evidence that ORTUS has modeled reality. It is a product architecture for keeping related models, runs, comparisons, evidence records, questions, reusable assumptions, and future composition work coherent enough that a user can return to an investigation without pretending the investigation is finished.

A Research World may eventually help the user ask:

- What system is under investigation?
- Which models, scenarios, and runs have been used?
- What behavior has been observed inside those models?
- What interpretations are currently plausible, contradicted, stale, or unsupported?
- Which reusable modeling capabilities have been built?
- Which frontiers would expand the kinds of questions ORTUS can represent?

The answer to those questions must stay model-bounded. A Research World records investigation of ORTUS artifacts and model output. It does not certify real-world discovery, policy correctness, causal proof, calibration, prediction, or scientific closure.

## 2. Core Investigative Loop

The future Research World loop should be:

```text
Observe -> Perturb -> Compare -> Interpret -> Document -> Revisit -> Extend
```

This loop is intentionally slower and more disciplined than a completion loop. It rewards returning to evidence, comparing runs, documenting uncertainty, and extending the laboratory only when a new modeling question needs it.

The loop should support users who:

- notice a pattern in a run,
- perturb assumptions or parameters,
- compare behavior across seeds or scenarios,
- interpret what the model did and did not show,
- document what remains unknown,
- revisit prior evidence after new runs or model changes,
- extend the model frontier when current tools cannot answer the question.

It must not turn model output into empirical truth or turn a pleasing pattern into a validated mechanism.

## 3. Four Conceptual Destinations

GW0 defines destination responsibilities. It does not implement destination navigation or persistence.

The four conceptual destinations are information-architecture responsibilities, not current routes, tabs, React components, or pages.

### World

World is the investigation context. It frames the modeled system, current template or model family, current scenario context, current question, and the major open uncertainties. It should keep the active model and its boundaries visible.

World must not claim to be the real system. It is the user-facing frame around a model-bounded investigation.

### Lab

Lab is where runnable model work happens. It contains setup, execution, perturbation, experiment, comparison, and runtime inspection workflows. Current `/` simulation workflows already cover much of this responsibility and must be preserved.

Lab must distinguish configuration, active runtime state, model-output history, run summaries, and interpretations.

### Atlas

Atlas is the evidence-oriented record of investigated model behavior. It can eventually organize observations, possible patterns, supported modeled regimes, contradictions, stale evidence, and unresolved questions.

Atlas is not an achievement board and not a real-world discovery ledger.

### Workshop

Workshop is where reusable artifacts and modeling capabilities are prepared, inspected, adapted, and evaluated before use. Current `/builder` workflows already cover parts of this responsibility through schema authoring, structural graph inspection, fit reports, and scenario planning.

Workshop must preserve the valid-versus-runnable distinction. Stored or attached artifacts do not become active runtime behavior merely because they exist.

## 4. Current Workflow Preservation

Current implemented workflows include the Start Hub at `/`, the live World at `/world`, Workshop at `/builder`, Atlas at `/atlas`, Lab at `/lab`, template selection/runtime, Builder modes, schema authoring, graph inspection, validation/repair suggestions, structural fit reporting, scenario planning, Neural Runtime Lab, and current run controls/metrics.

The Research World architecture must wrap and reorganize validated workflows before attempting to replace them.

GW0 does not authorize a flag-day rewrite. GW1 preserves direct access to the existing `/` and `/builder` surfaces and adds `/lab` and `/atlas` as future-only informational foundations.

Prompt UX2 prepares the visual language for this future shell by distinguishing operational, interaction, evidence, uncertainty, and capability states. UX2 does not create destination routes, destination navigation, persistence, notebooks, Discovery Atlas, behavioral landscapes, contextual guidance, or progression state.

Prompt GW1 historically implemented this route contract:

```text
/         -> World
/lab      -> Lab informational foundation
/atlas    -> Atlas informational foundation
/builder  -> Workshop
```

In GW1, persistent shell means structurally present across routes, not persistent user data. Lab and Atlas are reachable destinations, not locked destinations. GW1 does not add saved experiments, notebooks, reusable asset storage, Discovery Atlas logic, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, fonts, `/world`, or `/workshop`.

Prompt GW2 adds live active-run context inside World Observe. It makes the current model configuration and observed model state easier to inspect, but it deliberately stops before the future Lab/Atlas accumulation loop. GW2 does not save run records, document discoveries, classify behavioral landscapes, create notebooks, create reusable assets, or turn model output into empirical evidence.

Prompt GW3 adds live active-intervention readiness inside World Intervene. Prompt GW3B audits and hardens that layer. It makes registered perturbation controls, target readiness, current-run intervention entries, and response boundaries easier to inspect, but it deliberately stops before saved intervention plans, persistent Lab records, Discovery Atlas entries, behavioral landscapes, and real-world causal claims.

Prompt GW4 adds non-persistent Atlas information architecture on `/atlas`. It defines evidence-state vocabulary, sampled/unsampled interpretation, a conceptual scaffold labeled as not run data, model-vs-world boundaries, and World/Lab relationship copy. It deliberately stops before saved Discovery Atlas records, persistent evidence maps, behavioral landscapes, sampled-region maps backed by run data, Lab records, run history, save/map actions, storage, progression, validation, calibration, or real-world discovery certification.

Prompt GW5 adds non-persistent Lab evidence-record information architecture on `/lab`. It defines record lifecycle vocabulary, model-only and externally unvalidated evidence interpretation, a conceptual experiment-ledger scaffold labeled as not saved Lab data, model-vs-world boundaries, and World/Atlas relationship copy. It deliberately stops before persistent evidence records, experiment ledgers, notebooks, saved comparisons, run history, Lab-to-Atlas publication, save/send/publish actions, storage, progression, validation, calibration, or real-world discovery certification.

## 5. Progression Without XP

Progression in ORTUS must not be a reward economy.

The intended equation is:

```text
progress = reusable understanding + modeling capability + investigative depth
```

Not:

```text
progress = clicks + time + completed tasks
```

The user progresses by becoming better able to represent, compare, question, and revisit complex system behavior. That can include stronger reusable assumptions, clearer model boundaries, better comparison habits, richer evidence records, and more precise questions.

Disproving an interpretation, documenting uncertainty, finding that a result is not robust, or discovering that the current model cannot support a conclusion are all meaningful progress.

GW0 rejects XP, levels, ranks, badges, streaks, daily rewards, randomized rewards, grinding loops, completion pressure, leaderboards, and status mechanics that reward time-on-task more than disciplined investigation.

## 6. Flexible Investigative Maturity

Research World progression is a flexible expansion of investigative capability, not a universal curriculum or player-level system.

Progression states are overlapping forms of investigative maturity, not player levels:

- Initial observation: the user can identify what the model is doing and what it is not claiming.
- Controlled experimentation: the user can vary seeds, parameters, scenarios, or interventions while preserving provenance.
- Uncertainty-aware investigation: the user can compare stochastic variation and avoid treating one run as the answer.
- Structural investigation: the user can inspect model structure, schema declarations, assumptions, limits, and fit gaps.
- Adaptive/historical investigation: the user can reason about history, local adaptation, path dependence, and stale artifacts without anthropomorphizing model state.
- Multiscale investigation: the user can ask how behavior changes across scale without confusing camera zoom for model scale.
- Composition investigation: the user can evaluate whether components can be meaningfully connected without treating attachment as coherence.

These states may coexist. An expert user may begin with structural or composition questions. A beginner may return to initial observation after encountering a new model family.

## 7. Contextual Capability Guidance

Contextual capability guidance is not the same as hard-locking tools.

Future guidance may suggest a next useful capability based on the state of the model, workspace, evidence record, stale artifacts, unsupported gaps, or unresolved questions. It must not behave as a lock that hides essential controls or forces a universal path.

Expert users retain direct access. Guidance can explain risk, surface prerequisites, and recommend a disciplined next step, but it must not block legitimate work merely because the user has not completed a beginner checklist.

Progressive guidance and expert access must coexist.

## 8. Discovery Atlas

A Discovery Atlas records investigated model behavior.
It does not certify discoveries about the real world.

The Discovery Atlas should be evidence-oriented, not achievement-oriented. A record should show what was observed, under which model/scenario/run conditions, what comparison supports it, what contradicts it, and what remains unresolved.

Candidate evidence states:

```text
observation -> possible pattern -> supported modeled regime -> robust across tested conditions
```

Guardrails:

- The Atlas records investigated model behavior, not certified real-world discoveries.
- A visually compelling pattern is not automatically supported.
- Contradictory runs are evidence.
- A supported modeled regime is still model-bounded.
- Robust across tested conditions means robust across the tested assumptions, not robust in the world.
- Evidence records must preserve provenance, stale status, and model boundaries.

The Atlas must not implement discovery detection or regime classification in GW0.

## 9. Behavioral Landscape

A behavioral landscape maps what has been investigated.
It must not imply that unsampled regions are known.

A future Behavioral Landscape can map regions of investigated model behavior across parameters, seeds, scenarios, uncertainty settings, or comparison dimensions. It should distinguish sampled, sparsely sampled, unsampled, stale, contradictory, and unsupported regions.

It must not imply that the map is the territory. It must not infer behavior for unsampled regions without explicit modeling and warnings. It must not convert visual continuity into evidence of real-world continuity.

GW0 does not implement behavioral landscapes, regime classification, discovery logic, map UI, landscape storage, or recommendation logic.

## 10. Persistent Model Lab

Persistent Model Lab is conceptual in GW0. It does not define storage technology, schemas, database tables, local-storage keys, account systems, cloud sync, notebook files, saved-asset formats, or persistence APIs.

Persistence must preserve provenance and model boundaries.

Persistence, when a later prompt designs it, must preserve provenance and model boundaries. It must distinguish:

- configuration recipes,
- runtime output,
- bounded run summaries,
- snapshots,
- interpretations,
- evidence records,
- reusable artifacts,
- stale artifacts,
- planning-only artifacts.

Persistence must make stale artifacts visible. A saved fit report, scenario plan, comparison, evidence note, or reusable asset should not silently present itself as current after its source model, schema, fit context, template, scenario, or assumptions change.

## 11. Reusable Assets

Reusable does not mean universally compatible.

Future reusable assets may include assumptions, parameter recipes, scenario planning notes, fit reports, comparison summaries, evidence records, templates or template references, and structured questions. They need compatibility status, provenance, source versions, runnable-versus-planning-only state, and stale status.

Required boundaries:

- valid artifact does not mean runnable artifact,
- stored artifact does not mean active artifact,
- reusable artifact does not mean universal artifact,
- attached artifact does not mean runtime activation,
- compatible artifact does not mean scientifically correct artifact.

The Workshop should eventually help users understand reuse risk before acting on an artifact.

## 12. Open Questions And Failure As Progress

Unresolved questions should remain visible.

Finding that the model cannot support a conclusion is meaningful progress.

ORTUS should treat the following as productive outcomes:

- a hypothesis contradicted by later runs,
- a pattern that fails under seed variation,
- a model that lacks the primitive needed for a question,
- a scenario plan that reveals unmodeled assumptions,
- a fit report that exposes unsupported or lossy mappings,
- a comparison that shows the result is not robust,
- a question that remains open because evidence is insufficient.

This is not softness. It is the difference between a serious modeling workbench and a pretty pseudo-ABM toy.

## 13. Modeling Frontiers

A new modeling frontier expands the questions ORTUS can represent. It does not guarantee better answers.

Future modeling frontiers include:

- stochastic variation,
- feedback and delays,
- networks,
- spatial fields,
- heterogeneity,
- adaptation,
- resources,
- interventions,
- resilience,
- scales,
- composition,
- uncertainty and robustness.

Opening a frontier means ORTUS can represent a new kind of question or comparison. It does not mean the model is calibrated, externally validated, policy-relevant, or scientifically complete.

## 14. Composition Frontiers

Composition is not automatic scientific coherence.

Two valid components can be incompatible. A connected graph is not proof that the coupled runtime is meaningful. Shared labels, matched ids, visual proximity, or structural fit are not semantic correctness.

Future composition work must preserve:

- component provenance,
- incompatible assumptions,
- scale and unit mismatches,
- unsupported couplings,
- stale attachments,
- distinction between planning references and runtime coupling.

GW0 does not implement composition, composition UI, model coupling, runtime composition, composition persistence, or grand-system scenarios.

## 15. Grand Systems Challenges

Grand Systems Challenges should test model construction, interrogation, comparison, and scientific discipline—not optimization toward a scripted victory state.

Future Grand Systems Challenges may frame open-ended advanced investigations across multiple frontiers. They should not become scripted victories, policy games, leaderboards, score maximizers, puzzle locks, or optimization tracks that reward finding a pleasing output.

A good challenge asks whether the user can build and interrogate a model without losing the distinction between model behavior, evidence, interpretation, and reality.

## 16. Entry Experience

Beginners should receive a clear investigative starting point. Experts should not be forced through a simulated beginner journey.

The first Research World loop should help a beginner observe a model, perturb it, compare outcomes, and document an honest interpretation. It should avoid fake onboarding spectacle, required missions, progress bars, and hidden locks.

Experts should be able to jump directly to existing advanced surfaces, including current simulation controls, Builder modes, fit reporting, scenario planning, and Neural Runtime Lab where relevant.

## 17. Responsible Engagement

Research continuity should be supported without manufacturing urgency.

ORTUS should help users resume investigations, see stale items, remember open questions, and maintain provenance. It should not use streaks, FOMO, randomized rewards, daily chores, leaderboards, ranking pressure, or loss-aversion loops.

Returning to ORTUS should feel like returning to a lab notebook, not maintaining a compulsion loop.

## 18. Personalization Boundary

Contextual guidance may respond to the state of the model and workspace. It must not become psychological profiling of the user.

Guidance can use model state, artifact state, workspace mode, stale status, unsupported gaps, unresolved evidence questions, and available template capabilities. It must not infer user personality, protected classes, psychological traits, diagnoses, beliefs, intentions, vulnerabilities, or real-world identities.

Do not use Research World progression for persuasion optimization, microtargeting, protected-class inference, manipulation guidance, psychological diagnosis, or real-person profiling.

## 19. Artifact And Runtime Boundaries

These boundaries must remain visible in future Research World work:

```text
artifact attachment ≠ activation
valid artifact ≠ runnable artifact
runnable artifact ≠ scientifically validated model
successful run ≠ robust result
structural fit ≠ semantic correctness
scenario plan ≠ executable scenario
simulation output ≠ empirical truth
```

Research World structure must not create a hidden interpreter, hidden compiler, hidden schema executor, hidden visual-builder runtime, or hidden artifact activation path.

## 20. Accessibility And Non-Spatial Navigation

Progression must not rely only on color, maps, animation, drag/drop, hover, or decorative metaphor.

Major state must have:

- a textual name,
- status,
- available action,
- summary,
- evidence/provenance where relevant,
- a non-spatial navigation path.

Future map, atlas, landscape, or destination metaphors need equivalent text outlines and keyboard-accessible inspection. GW0 does not claim rendered accessibility, responsiveness, browser zoom quality, screen-reader behavior, assistive-technology behavior, or WCAG conformance.

## 21. UX2 And GW1 Relationship

GW0 defines what the product must communicate. UX2 defines how shared design foundations communicate it. GW1 implements the first structural shell using both.

UX2 establishes shared visual semantics.
It does not perform the Research World shell transformation.

UX2 prepares the visual language.
GW1 performs the structural shell transformation.

GW0 must not define final token names, final token values, CSS implementation, component APIs, route structure, or navigation behavior. Those belong to dedicated future prompts and audits.

The required sequence is:

```text
GW0 -> UX2 -> GW1 -> GW1B -> GW2 -> GW2B -> GW3 -> GW3B -> GW4 -> GW4B -> GW5 -> GW5B -> GW6 -> GW6B -> GW7 -> GW7B -> GW8 -> GW8B -> UX3 -> UX4 -> UX4B -> RH1 -> UX5 -> UX5B -> UX6 -> UX6B -> GW9 -> GW9B
```

UX2, GW1, GW1B, GW2, GW2B, GW3, GW3B, GW4, GW4B, GW5, GW5B, GW6, GW6B, GW7, GW7B, GW8, GW8B, UX3, UX4, UX4B, RH1, UX5, UX5B, UX6, UX6B, GW9, and GW9B are complete.

UX6 complete.
UX6B complete.
GW9 complete.
GW9B complete.
R1 later superseded the route hierarchy and forward sequence. R1 and R1B are complete; R2 World Layout and Interaction Reclaim is next. F1 is paused under E3 Analytical Lenses.

## 22. GW Roadmap Branch

### GW0: Research World Progression Mini-Roadmap

Documentation, product architecture, information architecture, and roadmap planning only.

### UX2: Shared Design Foundations

Future design-token/component foundation work informed by UX0, UX1, and GW0. UX2 must not be started without a dedicated prompt.

### GW1: Persistent Destination Shell

Future shell work for World/Lab/Atlas/Workshop destination responsibilities, preserving `/` and `/builder`, current feature placement, labels, and runtime-honesty boundaries. GW1 must not implement full persistence, discovery, behavioral landscapes, or unsupported runtime behavior.

### GW1B: Persistent Destination Shell Audit

Audit GW1 boundaries, access preservation, labels, accessibility source behavior, and runtime honesty.

### GW2: Active Run Provenance And Observation Layer

Implemented live World-only active-run provenance and observation context. It derives current model configuration and observed model state from existing active run fields. It does not create saved records, Lab persistence, Atlas discoveries, notebooks, reusable assets, storage, or empirical evidence.

### GW2B: Active Run Provenance And Observation Layer Audit

Future audit of GW2 persistence boundaries, evidence language, accessibility, viewport behavior, Lab/Atlas non-implementation, storage absence, and runtime activation risk.

### GW3: Active Intervention Boundary And Perturbation Readiness

Implemented live World-only intervention readiness and response-boundary context. It derives current perturbation capability and target readiness from existing template-owned intervention definitions and active World state. It does not create saved intervention plans, Lab records, Atlas discoveries, behavioral landscapes, storage, or real-world causal evidence.

### GW3B: Active Intervention Boundary Audit And Hardening

Future audit of GW3 readiness accuracy, no-fake-target boundaries, non-persistence, status semantics, accessibility, viewport behavior, Lab/Atlas non-implementation, storage absence, and causal-overclaim risk.

### GW4: Discovery Atlas

Implemented non-persistent Atlas information architecture and evidence-state semantics. It does not implement saved Discovery Atlas records, persistent evidence maps, behavioral landscapes, sampled-region maps backed by run data, Lab records, run history, save/map actions, storage, progression, validation, calibration, or real-world discovery certification.

### GW4B: Discovery Atlas Audit

Completed audit and hardening of GW4 evidence-state semantics, non-persistence clarity, sampled/unsampled honesty, model-vs-real-world boundaries, absence of fake discoveries/maps/scores, Lab/World relationships, keyboard/focus/reflow behavior, Axe results, status semantics, and scope-creep risk. GW4B keeps sampled evidence unresolved until source-backed Atlas records exist and does not add saved Atlas records, persistent evidence maps, behavioral landscapes, Lab records, storage, progression, runtime behavior, template behavior, Builder execution, dependencies, assets, or fonts.

### GW5: Lab Evidence Record Information Architecture

Completed non-persistent Lab evidence-record lifecycle semantics and conceptual experiment-ledger scaffold. It does not implement persistent evidence records, experiment ledgers, notebooks, saved comparisons, run history, Lab-to-Atlas publication, storage, progression, runtime behavior, template behavior, Builder execution, dependencies, assets, or fonts.

### GW5B: Lab Evidence Record Information Architecture Audit

Completed audit and hardening of GW5 record semantics, non-persistence clarity, fake-record exclusions, status semantics, accessibility, viewport behavior, World/Atlas relationship boundaries, storage absence, and validation-overclaim risk. GW5B corrected stale audit-gate wording and completed the focused shell and full UI rendered verification gate without adding persistence, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution, dependencies, assets, or fonts.

### GW6: Contextual Capability Guidance

Implemented static source-backed capability guidance on World, Workshop, Lab, and Atlas. It labels available, planning-only, not implemented, do-not-assume, and related-destination guidance using existing status semantics. Capability guidance describes current product capability; it does not create capability. It does not add saved records, Atlas discoveries, Lab experiments, behavioral landscapes, progression, generated guidance, persistence, runtime behavior, template behavior, Builder execution, validation, calibration, or real-world discovery certification.

### GW6B: Contextual Capability Guidance Audit

Completed audit and hardening of GW6 source-backed guidance, status semantics, route placement, non-persistence, absence of fake actions, accessibility smoke coverage, viewport behavior, no user profiling, no persuasion optimization, no protected-class inference, no generated guidance, and no false learning-path claims. GW6B does not add persistence, recommendations, onboarding, fake actions, Lab records, Atlas discoveries, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution, dependencies, assets, or fonts.

### GW7: Behavioral Landscape Exploration Foundation

Implemented non-persistent Atlas-side behavioral-landscape vocabulary and a conceptual scaffold. A behavioral landscape describes how model behavior may vary across model conditions. It is not a real-world map, empirical proof, or Discovery Atlas record. GW7 names parameter space, outcome space, sampled/unsampled areas, unresolved regions, model regimes, transition zones, sensitivity zones, externally unvalidated areas, and future sampled landscapes with UX2 status semantics. It does not add saved landscapes, sampled-region maps, evidence records, Atlas discoveries, Lab experiments, run sweeps, batch execution, regime detection, progression, persistence, runtime behavior, template behavior, Builder execution, dependencies, assets, or fonts.

### GW7B: Behavioral Landscape Foundation Audit

Completed audit and hardening of GW7 vocabulary accuracy, conceptual-scaffold honesty, sampled/unsampled clarity, absence of fake maps/scores/regions, non-persistence clarity, model-vs-real-world boundaries, World/Lab/Atlas relationships, keyboard/focus/reflow behavior, Axe results, status semantics, and scope-creep risk.

### GW8: Landscape Probe Planning Foundation

Implemented non-persistent Atlas-side landscape probe planning vocabulary and a conceptual probe-plan scaffold. A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery. GW8 names probe intent, candidate axes, candidate ranges, candidate outcomes, constraints, sampling intent, planned comparisons, unresolved feasibility, externally unvalidated hypotheses, non-executable plans, and future sampled probes with UX2 status semantics. It does not add executable probes, saved probe plans, sampled landscapes, run queues, parameter sweeps, batch execution, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, template behavior, Builder execution, dependencies, assets, or fonts.

### GW8B: Landscape Probe Planning Audit

Completed audit and hardening of GW8 vocabulary accuracy, non-execution clarity, non-persistence clarity, candidate-axis/outcome/range honesty, absence of fake samples/results/queues, absence of run sweeps and regime detection, model-vs-real-world boundaries, World/Lab/Atlas relationships, keyboard/focus/reflow behavior, Axe results, status semantics, and scope-creep risk. GW8B hardens the planned-comparison distinction: planned comparison is not a comparison result. GW8B does not add executable probes, saved plans, sampled results, run queues, sweeps, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

### UX3: Full UI/UX Comprehension And Sandbox-Theme Audit

Completed rendered full UI/UX comprehension and sandbox-theme audit across World, Workshop, Lab, and Atlas. UX3 finds that ORTUS is honest and precise but still too command-console-like for the sandbox/workbench mission. It recommends UX4, UX4B, UX5, UX5B, UX6, and UX6B before GW9 unless explicitly waived. UX3 does not add production redesign, theme tokens, guided Builder behavior, persistence, runtime behavior, probes, sampling, Lab records, Atlas discoveries, or GW9 implementation.

### UX4: Sandbox Visual Language Foundation

Completed first bounded sandbox visual-language foundation. UX4 retunes semantic workbench surfaces, panel frames, route hierarchy, status/caveat treatment, World model-surface framing, Workshop bench styling, and Lab/Atlas static scaffold grouping. UX4 changes visual language only. It does not add progressive disclosure, Guided Builder, preferences, onboarding, persistence, Lab records, Atlas discoveries, samples, run queues, sweeps, regime detection, runtime behavior, template behavior, Builder execution, route aliases, dependencies, assets, fonts, icon libraries, UX5, UX6, or GW9 implementation.

UX4 complete.
GW9 remains paused.
UX4B complete.
UX5 followed and is now complete.

### UX4B: Sandbox Visual Language Audit and Hardening

Completed audit of the UX4 sandbox visual-language foundation. UX4B finds the foundation ready for UX5. World is the strongest sandbox/workbench fit; Workshop is improved but still Advanced Builder; Lab and Atlas remain honest non-persistent conceptual scaffolds. UX4B adds no progressive disclosure, Guided Builder, preferences, onboarding, persistence, Lab records, Atlas discoveries, samples, run queues, sweeps, regime detection, runtime behavior, template behavior, Builder execution, route aliases, dependencies, assets, fonts, icon libraries, UX5, UX6, or GW9 implementation.

UX4B complete.
GW9 remains paused.
UX5 followed and is now complete.

### RH1: Remote State and Mission-Alignment Hygiene Check

Completed local source-of-truth hygiene checkpoint. RH1 records that local `main` contained UX4B while `origin/main` was stale before the RH1 continuation push. RH1 clarifies that existing local World run-comparison storage is not persistent Lab evidence, Atlas discovery storage, saved behavioral landscapes, saved probe plans, or real-world validation. RH1 also clarifies that existing World Experiment Runner sweeps are bounded local model-comparison tooling, not Atlas landscape sampling, landscape probe execution, saved sampled regions, run queues, or regime detection. RH1 adds no product behavior.

RH1 is complete; the GitHub remote was stale before the RH1 continuation push.
UX5 followed and is now complete.
GW9 remains paused.

### UX5: Progressive Disclosure and Beginner/Advanced Information Architecture

Completed bounded information-architecture implementation. UX5 adds source-backed route orientation to World, Workshop, Lab, and Atlas; component-local non-persistent disclosure; layered capability guidance; and concise Lab/Atlas defaults. Exact technical vocabulary and all existing expert tools remain reachable. Workshop remains the Advanced Builder.

UX5 adds no Guided Builder, saved mode, preference, personalization, recommendation, onboarding state, progression, runtime/template/Builder execution, Lab/Atlas persistence, landscape sampling, probe execution, dependency, asset, font, icon, or route.

UX5 complete. UX5B followed and is now complete. GW9 remains paused.

### UX5B: Progressive Disclosure and Beginner/Advanced Information Architecture Audit and Hardening

Completed source and rendered audit of UX5. UX5B verifies coherent route orientation, accurate plain/technical language pairing, visible capability caveats, direct expert access, component-local disclosure state, reload defaults, correct landmarks, responsive and short-height behavior, expanded-state Axe results, and no fake functionality. It finds no production defect in the covered paths.

UX5B adds audit records and roadmap contracts only. It adds no UX6 Guided Builder, persistence, personalization, recommendation, onboarding, progression, runtime/template/Builder execution, Lab/Atlas behavior, sampling, probe execution, dependency, asset, font, icon, route, or GW9 behavior.

UX5B complete. UX6 followed and is now complete. GW9 remains paused.

### UX6: Guided Builder and Step-by-Step Configuration Flow Foundation

Completed bounded Workshop implementation. Guided Builder is the local default, Advanced Builder remains immediately available, and six structural steps deterministically assemble a supported `ortus.modelSchema` subset. Existing schema validation remains authoritative. Handoff to Advanced Author Schema is explicit and overwrite-protected, while reload resets Guided state.

UX6 adds no schema execution, runtime template, scenario, RunConfig, active World mutation, persistence, personalization, onboarding, progression, Lab/Atlas record, landscape sampling, probe execution, dependency, asset, font, icon, or route. Structural validity remains distinct from runnability and real-world validity.

UX6 complete. UX6B followed and is now complete. GW9 remains paused until UX6B is committed and remotely aligned.

### UX6B: Guided Builder and Step-by-Step Configuration Flow Audit and Hardening

Completed source, deterministic-model, rendered, responsive, accessibility, World-isolation, storage, and no-execution audit of UX6. UX6B fixes bounded note-id, focus, stale-status, responsive-flow, landmark, and scroll-region defects without broadening the Guided artifact subset or changing runtime capability.

UX6B adds no GW9 sampling, probe execution, persistence, personalization, progression, runtime/template/schema execution, Lab/Atlas records, dependency, asset, font, icon, or route. GW9 remains paused until this audit is committed and remotely aligned.

## 23. Implementation Dependencies

GW0 depends on completed P0, UX0, and UX1 documentation. It points to UX2 before GW1 because shared design foundations should absorb the Living Systems Atlas direction and the existing source audit before destination-shell implementation begins.

Later GW prompts may depend on:

- rendered responsive/accessibility audits before polished UX claims,
- persistence design before notebooks and reusable assets,
- artifact stale-state contracts before evidence records,
- current template capability checks before contextual guidance,
- future composition audits before grand-system challenges.

None of those dependencies are implemented by GW0.

## 24. Product Language Risks

Avoid language that implies:

- mastery of reality,
- completed scientific domains,
- certified discoveries,
- psychological profiling,
- hidden cognition,
- persuasion optimization,
- policy recommendation,
- gameplay victory,
- unlocked truth,
- validated mechanisms,
- empirical proof from simulation output.

Prefer language that says:

- investigated model behavior,
- supported under tested assumptions,
- open question,
- contradicted by these runs,
- stale after source change,
- reusable with compatibility limits,
- planning-only artifact,
- runnable but not validated,
- model-output evidence, not empirical truth.

## 25. Non-Goals Checklist

GW0 does not implement:

- World, Lab, Atlas, or Workshop routes, pages, tabs, shells, navigation, or components,
- research notebooks or saved assets,
- persistence, accounts, cloud sync, local-storage changes, database schemas, or file formats,
- XP, levels, achievements, badges, streaks, missions, quests, daily rewards, leaderboards, grinding, or randomized rewards,
- discovery detection, regime classification, behavioral landscapes, or contextual recommendations,
- visual design tokens, CSS, typography, icons, animations, assets, mockups, or dependencies,
- runtime behavior, template behavior, schema execution, Builder graph execution, composition runtime, or model coupling,
- validation, calibration, prediction, causal proof, policy recommendation, or real-world authority.

## 26. What Tests Should Protect

GW0 documentation tests should confirm:

- this source-of-truth doc exists,
- GW0 is documentation-only,
- Research World is an investigation context,
- World/Lab/Atlas/Workshop are responsibilities only,
- progression avoids XP and rewards reusable understanding,
- contextual guidance is not hard locking,
- direct expert access remains available,
- Discovery Atlas and Behavioral Landscape boundaries are preserved,
- persistence and reusable assets preserve provenance and stale state,
- open questions, contradictions, unsupported conclusions, and failed hypotheses count as progress,
- artifact/runtime boundaries remain literal,
- current `/` and `/builder` workflows are preserved,
- GW1 is implemented only as the bounded destination shell,
- GW2/GW2B, GW3, and GW3B are implemented only as bounded World live-context/audit layers,
- GW4 is implemented only as a bounded non-persistent Atlas foundation,
- GW5, GW5B, and GW6 are implemented only as bounded non-persistent information/guidance layers,
- UX2 prepared the visual foundation between GW0 and GW1,
- no production UI, CSS, runtime, persistence, route, asset, dependency, or package file is changed by GW0.

## 27. Summary Boundary

GW0 gives ORTUS a sharper spine for future Research World work:

- progression is investigative capability,
- evidence is model-bounded,
- uncertainty stays visible,
- expert access survives,
- reusable artifacts remain provenance-bound,
- composition remains suspect until proven coherent,
- current workflows are wrapped before they are replaced.

Anything beyond that belongs to a dedicated future implementation prompt and audit.

## 28. UX5 Implementation Status

UX5 implements progressive disclosure and beginner/advanced information architecture without changing the GW0 progression model. World, Workshop, Lab, and Atlas now lead with plain-language route orientation and preserve exact technical terms through explicit local disclosures. Capability guidance layers available capability and a nearby do-not-assume boundary before the full source-backed inventory. Lab and Atlas show concise conceptual overviews before their complete future-oriented vocabularies.

This is not stored beginner mode, personalization, recommendation, onboarding state, progression, Guided Builder, runtime support, Lab/Atlas persistence, landscape sampling, or probe execution. Existing bounded World comparison storage remains World-local, and existing Experiment Runner sweeps remain local experiment tooling rather than Atlas sampling.

UX5B audits that implementation in source and rendered browsers. It finds the hierarchy clear in the covered paths, retains direct expert access, verifies local reload-reset disclosure state and expanded-state Axe results, and finds no production defect. This remains expert and automated evidence, not a beginner user study, browser-zoom verification, screen-reader/assistive-technology verification, mobile-workflow validation, or WCAG conformance claim.

UX5B complete. UX6 and UX6B followed and are now complete. GW9 remains paused until UX6B is committed and remotely aligned.

## 29. UX6 Implementation Status

UX6 implements a deterministic, typed, page-session-only Guided Builder over the existing model-schema services. It authors a bounded structural subset, keeps unsupported concepts visible as Advanced-only or unavailable, protects Start over and Advanced workspace replacement, and leaves World state and existing storage unchanged. Rendered coverage includes the established five viewports, keyboard/focus behavior, reload reset, browser-Back and destination-link decisions, handoff, overwrite cancellation/confirmation, short-height behavior, reduced motion, diagnostics, and Axe.

This is automated and expert evidence, not proof of beginner comprehension, mobile workflow readiness, actual browser zoom, screen-reader or assistive-technology quality, forced-colors behavior, WCAG conformance, model correctness, or scientific validity.

UX6 complete. UX6B complete. GW9 is next. GW9 remains paused until UX6B is committed and remotely aligned.

## 30. UX6B Audit Status

UX6B audits deterministic artifact mapping, authoritative validation, local non-persistent state, loss/overwrite protection, explicit Advanced handoff, Advanced preservation, World isolation, non-execution, capability honesty, keyboard/focus behavior, all required viewports, reduced motion, diagnostics, and representative-state Axe results. The canonical record is `ui/GUIDED_BUILDER_AND_STEP_BY_STEP_CONFIGURATION_FLOW_FOUNDATION_AUDIT.md`.

The audit is ready for GW9 after commit and remote alignment. It does not make Guided schemas runnable or scientifically valid, and it does not implement any GW9 behavior. Actual browser zoom, screen-reader/assistive-technology use, forced colors, mobile-workflow readiness, WCAG conformance, and beginner user comprehension remain unverified.

UX6B complete.

GW9 and its required GW9B audit are complete.

## 31. GW9 Implementation Status

GW9 follows the cleared UX6B gate and adds one narrowly declared Atlas capability: a bounded ephemeral preview for the production Flocking runtime and one bundled scenario. Users choose one or two supported numeric axes, one supported final-tick metric, one to three declared deterministic seeds, and a bounded tick horizon. Every sample uses a fresh engine; execution is sequential, cancellation occurs between samples, results remain in component memory, and reload restores the unsampled state.

This is a real but deliberately narrow model-sampling slice. It is not generic landscape-probe execution, a saved landscape, a Discovery Atlas record, a Lab record, interpolation, regime detection, confidence analysis, scientific validation, or progression. The existing probe-planning scaffold remains non-executable because it lacks stable runtime identifiers and exact values.

GW9 complete.

GW9B complete.

## 32. R1 Product Reset Status

R1 makes `/` a task-centered Start Hub and moves the unchanged live World workbench to `/world`. Primary navigation is now Start, World, Workshop, and a keyboard-operated Research tools menu for Atlas, Lab, Experiments, and Compare runs. This supersedes the first GW1 equal-destination hierarchy; it does not erase the historical GW records or change their runtime and persistence boundaries.

The Start Hub leads with an implemented Flocking world and derives all seven runnable system entries from authoritative production template metadata. World presents the canvas model first, persistent run controls second, and one task workspace third. Setup, Observe, Change, and Compare are direct; Understand model, Experiments, and Diagnostics remain under More. Capability matrices and historical technical foundations remain available through disclosures instead of leading the routes.

R1 does not implement the persistent Research World imagined by GW0. Lab still saves nothing; Atlas still supports only the explicit bounded ephemeral Flocking preview; Workshop artifacts remain structural and non-executable; existing local comparisons and Experiment Runner sweeps keep their previous semantics.

The active product sequence is now `docs/product/ORTUS_PRODUCT_EXPERIENCE_RESET_ROADMAP.md`. Earlier statements in this historical mini-roadmap that name GW9 or F1 as next record the sequencing at that time and are superseded. R1 and R1B are complete; R2 World Layout and Interaction Reclaim is next. F1 is paused under E3 Analytical Lenses.

## 33. R1B First-Run Audit Status

R1B audits the reset through rendered first-run, first-change, explanation, advanced-tool, and recovery tasks. It fixes fresh featured-starter launch, parameter-rebuild explanation, task/query/current-state coherence, keyboard focus, task-panel scroll recovery, model-specific Understand content, Atlas action visibility, and the mobile ORTUS lockup without changing Research World runtime or persistence semantics.

R1B complete. Decision: conditionally ready for R2. Actual user testing, browser zoom, screen-reader/assistive-technology use, forced colors, complete mobile workflow, and WCAG conformance remain unverified.
