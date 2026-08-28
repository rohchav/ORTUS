# UR0R Product Comprehension And Exploration Repair

Date: 2026-08-28

Starting commit: `a146ec346ff2d6d787a00e0b250cf945b5e3a599` (`research: evaluate product leverage and comprehension`)

Status:

```text
UR0 TECHNICAL/EXPERT GATE: COMPLETE
UR0 HUMAN COMPREHENSION GATE: PENDING
UR0R: COMPLETE
S1: NEXT / UNSTARTED
```

UR0R repairs demonstrated comprehension and exploration defects. It does not complete the human gate, establish usability for beginners, validate learning outcomes, or implement general remix, persistent research records, SystemViews, or new simulation semantics.

## Evidence And Bias

The evidence combines the UR0 expert audit with one formative pilot conducted by a participant who is highly familiar with ORTUS. That participant is unusually informed about the product's intended concepts, terminology, history, and boundaries. The session is useful for finding workflow defects and expectation mismatches. It is not an unbiased first-time-user test, a representative sample, or statistical evidence.

What mostly worked in the pilot:

- ORTUS read as a complex-systems sandbox and World read as the live simulation surface.
- The local-rule to global-pattern account in Flocking was understandable.
- Setup draft, explicit rebuild, Reset, and basic comparison semantics were understandable.
- The World remained the dominant visual surface.

What failed or created material friction:

- boids were weakly identified as directional agents;
- the domain looked like an unexplained box inside the World;
- terminology preceded intuition and questions did not connect to controls;
- qualitatively different Flocking outcomes were difficult to discover;
- controls and metrics required too much vertical context switching;
- the core experience could not be completed meaningfully keyboard-only;
- Starter curiosity had no convincing example-to-decomposition-to-remix bridge;
- Workshop looked like blank schema entry rather than model construction;
- Lab had little current task value and Atlas looked like another experiment surface;
- Atlas's nested scroll regions made upper content difficult to recover and left a misleading empty lower area.

The participant's familiarity likely masks first-run failures. A less informed participant may have more difficulty with model scope, active versus draft state, parameter meaning, evidence language, and destination identity. The UR0 human-comprehension gate therefore remains pending broader formative work using `UR0_STUDY_OBSERVATION_TEMPLATE.md`.

## Severity And Disposition

| Severity | Finding | Disposition |
| --- | --- | --- |
| P0 | Essential Canvas inspection lacked a bounded semantic keyboard equivalent, so the pilot could not complete the core flow keyboard-only. | Fixed with previous/next, inspect, and clear semantic controls; focus returns from the inspector; keyboard browser coverage now exercises launch, playback, inspection, configuration, rebuild, comparison, Reset, and destination navigation. This is automated evidence, not screen-reader or AT validation. |
| P1 | Flocking questions and technical controls were disconnected; the default/preset space appeared behaviorally narrow. | Fixed with question-to-mechanism-to-change-to-watch cues and four exact, deterministic, regression-protected exploration targets. Unsupported sustained milling remains explicit. |
| P1 | Metrics and comparison lost context because the right rail required repeated scrolling. | Fixed with a compact persistent observation dock outside the task panel's scroll region. It reports a bounded primary subset and links to the full Observe task. |
| P1 | The bounded domain and perspective mapping created a second unexplained parallelogram. | Presentation mapping fixed; actual `100 x 100` wrapped model-domain semantics preserved and named. Domain configurability remains future modeling work. |
| P1 | Workshop, Lab, and Atlas visual hierarchy contradicted their intended roles. | Fixed with read-only Workshop decomposition, explicit current/future Lab boundary, and identity-first Atlas hierarchy. No future capability was fabricated. |
| P1 | Atlas had two competing vertical scroll owners at constrained desktop height. | Fixed with one destination-owned scroll region at the affected breakpoints; top/bottom recovery and no horizontal overflow are browser-tested. |
| P2 | Boids read as particles more than directional moving agents. | Fixed in the read-only renderer with larger restrained directional glyphs; dynamics and engine state are unchanged. |
| P2 | The first-run question named an investigation but did not explain entities, mechanism, change, or observable consequence. | Fixed through a compact contextual nudge. The ordinary sandbox remains directly available. |
| P2 | Workshop's blank-entry mental model obscured the future Starter-to-remix direction. | Fixed only as orientation: an existing Flocking system is decomposed into entities, state, interactions, space/boundary, and stochasticity. No editing or execution action was added. |

## World Repair

### Comprehension Path

The Flocking Setup surface now provides this bounded progression:

```text
what is present
  -> how local interactions work
  -> a concrete model question
  -> the relevant mechanism
  -> one exact supported change
  -> the output and visible structure to watch
```

Boids are described as simplified moving agents. Alignment, cohesion, and separation retain their scientific names, but each has a short intuitive explanation before the full parameter surface. The contextual material is optional; it does not force a tutorial or conceal exact controls.

Applying an exploration target uses the existing validated scenario and template authorities. It creates a fresh paused tick-zero engine, states that the current trajectory will be discarded, and requires staged confirmation. It does not patch the active engine, execute a schema, or add a parallel runtime path.

### Observation Context

The observation dock is persistent beside the stage and outside the selected task's vertical scroll region. It exposes tick and at most three primary current model-output metrics, with a direct Observe action for the complete surface. It does not pin arbitrary windows, retain observations, create Lab evidence, or call model output measured data.

### Entity And Keyboard Representation

Directional glyphs are a rendering choice only. Position, velocity, heading, rules, and boundaries remain engine-owned. The Canvas still supports spatial pointer inspection, while a bounded semantic control set provides keyboard inspection without creating one DOM node per boid.

Automated evidence covers logical focus movement and focus return. It does not establish screen-reader comprehension, assistive-technology compatibility, actual browser zoom, forced-colors quality, touch completeness, or WCAG conformance.

## Deterministic Flocking Breadth Audit

All targets use `agentCount=160`, `maxSpeed=2.4`, `maxForce=0.08`, `boundaryMode=wrap`, and the production Flocking engine. The values below are exact product fixtures, not universal regime claims.

| Target | Exact seed and initialization | Material parameters | Reproduced bounded evidence | Product claim boundary |
| --- | --- | --- | --- | --- |
| Coordinate quickly | `ur0r-aligned`; `aligned-flock`; heading `0` degrees, spread `12` | perception `30`; separation radius `10`; alignment `0.8`; cohesion `0.45`; separation `0.9`; noise `0.01` | alignment score greater than `0.99` at tick `90` | One exact seeded trajectory; not proof of a universal coordinated regime. |
| Keep motion noisy | `ur0r-noisy`; `random-headings` | perception `18`; separation radius `10`; alignment `0.12`; cohesion `0.12`; separation `1.2`; noise `0.32` | alignment score less than `0.2` at tick `180` | Weak alignment in this run; noise is modeled seeded steering, not measured disturbance. |
| Form local fragments | `ur0r-fragments`; `random-headings` | perception `9`; separation radius `4`; alignment `0.45`; cohesion `0.7`; separation `0.9`; noise `0.015` | at tick `180`, a declared toroidal distance-`10` audit heuristic finds at least three components of size at least three, with the largest below `100` | The engine has no fragment detector. The component calculation is a test heuristic, not a runtime metric or emergence proof. |
| Start in opposition | `ur0r-opposing`; `two-opposing-flocks` | perception `30`; alignment `0.55`; cohesion `0.35`; separation `1.1`; noise `0.01` | tick `0` contains exactly `80` left-side agents with positive horizontal velocity and `80` right-side agents with negative horizontal velocity | Opposition is an initial condition and is temporary; this model tends toward shared direction by about tick `90` in the audited run. |

The bundled Ring Formation preset produces a strong initial circulation arrangement, but the circulation decays and the run trends toward common alignment. Sustained milling/circular motion is therefore not advertised as supported behavior. Split/merge dynamics and cohesive wandering were not promoted because the current audit did not establish stable, defensible product fixtures for them. Those remain model-capability questions, not renderer opportunities.

No Flocking update rule, parameter bound, metric, seeded RNG stream, engine schedule, intervention, or boundary behavior changed in UR0R.

## Domain And Boundary Diagnosis

Disposition: **C, both actual model space and presentation mapping contributed.**

- The production Flocking model genuinely occupies a bounded `100 x 100` continuous domain with wrap behavior. That confinement is scientifically relevant and remains unchanged.
- The Living Diorama camera added perspective skew and generous inset padding, causing that real domain to read as a second parallelogram floating inside another World frame.
- UR0R removes the skew for the production Living Diorama projection and uses a small stable inset so the active domain reads as the World surface.
- The renderer still maps model coordinates into available screen space; this is presentation geometry, not a change to distance, neighbor search, wrapping, or motion.
- The UI names both the exact domain and the camera/presentation distinction. It does not imply open air or an unbounded model.

Domain-size authoring/configuration is not added. If later model work makes domain size configurable, it must be an explicit model parameter with audited consequences for density, neighborhood statistics, and comparability.

## Destination Identity Repair

### Workshop

Current capability remains structural drafting and inspection. A valid schema or workspace is not runnable. A read-only Flocking decomposition now shows how an existing system can be understood as entities, state, interactions, space/boundary, and stochasticity before the Guided and Advanced authoring surfaces. It does not load, generate, wire, compile, preview, or execute anything.

### Lab

The route now states the intended relationship directly:

```text
World = live experimental surface
Lab   = future durable scientific memory
```

Future record categories are grouped around questions, hypotheses, experiments, runs, comparisons, evidence/counterevidence, interpretations, failed or contradictory findings, SystemViews, assessments, and open questions. No record is currently saved, and none of this information is presented as already existing.

### Atlas

Atlas now leads with its intended map identity:

```text
questions
  -> representations
  -> evidence and alternatives
  -> findings and open gaps
  -> explicit relationships
```

The existing bounded Flocking sampler remains available below that orientation and is labeled as a page-local inspection tool that does not populate the future map. At `900 x 700`, the previous outer-shell plus inner-Atlas overflow produced two vertical scroll owners. A targeted responsive layout now gives the destination one scroll owner; browser checks exercise top/bottom recovery and horizontal containment.

## S1 Starter-To-Remix Requirements

S1 remains unstarted. The pilot establishes these product requirements for its dedicated scope:

1. Entry must support a question, phenomenon, example, or existing system; blank formal authoring cannot be the only default.
2. A Starter World needs an inspectable `How it works` decomposition before remix.
3. The decomposition must identify model-owned entities, state, processes/interactions, relations, space/boundary, stochasticity, parameters, and outputs without implying every primitive is universally supported.
4. `Remix` must name whether the result is a parameter recipe, supported template variant, structural draft, or runnable derivative. Those are not interchangeable.
5. Any runnable derivative must use an explicit bounded runtime vocabulary and template/model-family capability checks. Visual completeness or structural validity cannot earn execution.
6. Unsupported, lossy, future-only, and service-only elements must remain visible through handoff.
7. The source Starter, exact recipe/configuration, and transformation provenance must remain recoverable.
8. Workshop should offer example-first and question-first entry while retaining exact advanced structure access.
9. S1 must not execute `ModelSchemaDefinition`, Visual Builder nodes/edges, rule descriptions, formulas, scripts, or arbitrary code.
10. S1 must not imply that S2, S3, persistent Lab records, or a generic model compiler already exist.

Desired future path, not current behavior:

```text
Starter World -> How it works -> See model pieces -> Remix -> Workshop -> bounded runnable derivative
```

## Scope Boundaries

UR0R does not add or claim:

- general runnable remix, S1/S2/S3, or a custom-model runtime;
- `CanonicalObservation`, `Investigation`, persistent Lab records, or Lab-to-Atlas publication;
- Atlas discoveries, SystemViews, regime detection, or general landscape execution;
- new Flocking rules, pretty-motion dynamics, synthetic model events, or hidden boundary changes;
- per-agent LLM calls, real-person modeling, protected-class inference, profiling, persuasion, or targeting;
- screen-reader, assistive-technology, actual browser-zoom, empirical comprehension, or WCAG validation.

## Verification Record

- `npm run lint` passed TypeScript unused-symbol checks and the scoped architecture/accessibility baseline over `389` production TypeScript files.
- `npm run typecheck` passed.
- `npm test` passed `87` files / `744` tests, including deterministic Flocking fixtures and research-map/canonical-roadmap contracts.
- `npm run build` passed with `23` generated pages; `/world` remains dynamic.
- Dedicated UR0R Playwright/Axe passed `3/3`, covering Start-to-World, exact Flocking exploration, keyboard configuration/rebuild/playback/inspection/compare/reset/navigation, responsive World, Workshop, Lab, Atlas, one-scroll ownership, reduced motion, Canvas pixels, and representative Axe states.
- Final complete Playwright/Axe passed `197/197` in `20.7m` with no retries or skips.
- `git diff --check` passed at the closure gate.

Standalone performance suites were intentionally excluded because UR0R changes no simulation semantics, runtime scheduling/protocol, or render-loop behavior. The complete browser suite still exercised its inherited bounded production/runtime characterization cases.

## Handoff

```text
UR0 TECHNICAL/EXPERT GATE: COMPLETE
UR0 HUMAN COMPREHENSION GATE: PENDING
UR0R: COMPLETE
S1: NEXT / UNSTARTED

S1 mission:
Starter -> Remix Bridge
```

S2 remains planned. O1/E1 remain high-priority scientific infrastructure, but UR0R authorizes S1 as the exact next milestone rather than automatically selecting O1/E1. I2 remains deferred.
