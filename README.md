# ORTUS

ORTUS is a browser-based complex systems visual modeler backed by a deterministic TypeScript simulation engine.

## What Exists Now

- A deterministic TypeScript simulation engine with seeded randomness, templates, scenarios, snapshots, metrics, interventions, experiments, and bounded run-comparison summaries.
- A task-centered Start Hub at `/` with one featured Starter World, four ways to begin, and direct access to the runnable-world library.
- An eleven-world Explore Worlds catalog at `/worlds` with deterministic search and bounded filters, source-backed details at `/worlds/[slug]`, and the four-world `Local Rules, Global Patterns` collection at `/worlds/packs/local-rules-global-patterns`.
- Eight strict prepared launch recipes with derived configuration comparisons. Recipe launches create fresh paused tick-0 runs; they are not experiment results, empirical evidence, or saved progress.
- One optional guided investigation, `Reading a Flock`, at `/worlds/guides/reading-a-flock`. It organizes the existing clear/noisy Flocking pair, World tasks, playback, outputs, and Compare workflow without auto-running, auto-saving, scoring, or storing progress.
- A browser World route at `/world` for running and observing hand-built template-owned simulations, with the live model dominant and persistent playback controls.
- Local Experiment tooling for bounded parameter/seed sweeps and model-output comparison where already implemented.
- A Workshop route with a default six-step Guided Builder and the preserved Advanced Builder for structural schema/workspace authoring and inspection. Workshop artifacts are not executable models.
- A Lab foundation for future evidence-record semantics. It is not a saved Lab record system today.
- An Atlas route with model-evidence semantics, behavioral-landscape and probe-planning vocabulary, plus one bounded ephemeral Flocking sampling preview. It is not a saved discovery map or general sampler.
- Contextual progressive disclosure on World, Workshop, Lab, and Atlas: active work first, one relevant capability note nearby, and the full source-backed technical reference one explicit control away.
- Playwright/Axe rendered route checks for the current shell and semantic foundations.
- Strong model-vs-real-world boundaries: model output is evidence about model behavior, not automatic evidence about the world.

Existing local World comparison storage may preserve bounded run summaries for comparison. This is not persistent Lab evidence, not Atlas discovery storage, not saved behavioral landscapes, not saved probe plans, and not real-world validation.

## What Is Future / Not Implemented Yet

- Persistent Lab evidence records, research notebooks, Lab-to-Atlas publication, or saved Lab experiment ledgers.
- Atlas discoveries, saved evidence maps, saved behavioral landscapes, saved sampled regions, or saved probe plans.
- General landscape/probe execution, saved or unbounded Atlas sampling sweeps, run queues, persistent sampled landscapes, interpolation, or regime detection. GW9 supports only its explicit local preview contract.
- Stored beginner/advanced preferences, saved Guided drafts, onboarding state, progression, XP, locks, or achievements.
- Validation/calibration, real-world discovery certification, causal proof, robustness proof, policy recommendation, or operational readiness claims.
- Model-schema execution, visual-builder execution, graph execution, formula/script execution, or schema-to-template conversion.

## Run The App

```bash
npm install
npm run dev
```

The app runs with Next.js. Use `npm run build` for a production build.

## Checks

```bash
npm run typecheck
npm test
npm run test:ui
npm run build
```

`npm run lint: unavailable, package.json has no lint script.` Lint is intentionally unavailable until a dedicated lint/tooling prompt adds it; do not treat missing lint as a failing gate.

`npm run test:ui` is a dev-only Playwright/Axe rendered audit harness for `/`, `/worlds`, `/worlds/[slug]`, `/worlds/packs/[slug]`, `/worlds/guides/[slug]`, `/world`, `/builder`, `/lab`, and `/atlas`. R1/R1B cover the Start Hub and first-run handoff; R2/R2B cover the stable World stage and task architecture; C1/C1B cover the original seven-world framework; C2/C2B cover the first flagship collection and eight strict recipe handoffs; C3 covers the optional `Reading a Flock` landing and guided baseline/contrast World flow. These checks are not a beginner user study, educational-outcome test, screen-reader, assistive-technology, forced-colors, actual browser-zoom, complete mobile-workflow, or WCAG conformance claim.

## Roadmap Status

ORTUS has completed Prompt 39B plus the documented neural, Research World, and UI work through GW9B, followed by R1, R1B, R2, R2B, C1, C1B, C2, C2B, and `C3: Guided Investigation / Tutorial World`. `C3B: Guided Investigation Audit` is next and has not started. The active product sequence is documented in `docs/product/ORTUS_PRODUCT_EXPERIENCE_RESET_ROADMAP.md`. The F0 fractal branch remains documented but F1 is paused under the future E3 Analytical Lenses milestone.

## Product Philosophy

The product philosophy source of truth is `docs/PRODUCT_PHILOSOPHY_AND_LEARNING_MISSION.md`. ORTUS is a sandbox for exploring how interacting mechanisms, constraints, feedback, stochasticity, adaptation, selection, and history can produce complex, path-dependent, and sometimes chaotic system-level behavior. ORTUS helps users explore those mechanisms while remaining honest about uncertainty, scale, evidence, and the limits of models. Prompt P0 is documentation only; it does not implement Research World progression, XP, streaks, unlocks, scoring, missions, persistence, social features, runtime behavior, templates, or UI flows.

The future visual-direction source of truth is `docs/ui/LIVING_SYSTEMS_ATLAS_VISUAL_DIRECTION.md`. Prompt UX0 defines ORTUS Living Systems Atlas as documentation and design planning only. ORTUS should feel like a living system observed through precise scientific instruments, not a system under tactical command. It does not implement World/Lab/Atlas/Workshop routes, navigation, shell redesign, CSS tokens, components, persistence, discovery logic, behavioral landscapes, progression, runtime behavior, dependencies, remote fonts, icons, animations, or mockups.

The current source-level design-token and component audit is `docs/ui/EXISTING_DESIGN_TOKEN_AND_COMPONENT_AUDIT.md`. UX1 audits the existing interface; it does not redesign it, add tokens, modify CSS, restyle components, change routes, add dependencies, add assets, or claim rendered accessibility/responsive verification.

The current shared visual-semantics source of truth is `docs/ui/LIVING_SYSTEMS_ATLAS_SEMANTIC_TOKEN_FOUNDATION.md`. UX2 establishes shared visual semantics; it does not perform the Research World shell transformation. It adds semantic tokens in `src/app/globals.css`, preserves legacy compatibility aliases, and migrates only a small shared primitive set: panels, shared buttons/icon controls, form controls, and status badges.

The current rendered-audit record is `docs/ui/LIVING_SYSTEMS_ATLAS_SEMANTIC_FOUNDATION_AUDIT.md`. It records the resolved Chromium dependency blocker, rendered UX2B findings/fixes, full Playwright/Axe results, representative contrast samples, and remaining unverified behavior. The harness does not establish WCAG conformance, screen-reader readiness, assistive-technology readiness, forced-colors readiness, or actual browser-zoom behavior.

The current full UI/UX comprehension and sandbox-theme audit is `docs/ui/FULL_UI_UX_COMPREHENSION_AND_SANDBOX_THEME_AUDIT.md`. UX3 records rendered route inventory for World, Workshop, Lab, and Atlas; concludes that ORTUS remains too console-like for the sandbox/workbench mission; and recommends UX4, UX4B, UX5, UX5B, UX6, and UX6B before GW9 unless that pause is explicitly waived.

The current sandbox visual-language foundation is `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION.md`, with the UX4B audit in `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION_AUDIT.md`. UX4 softens workbench surfaces, status/caveat treatment, route hierarchy, and panel/frame styling while preserving runtime-honesty language and product boundaries. UX4B finds the foundation ready for UX5, but it is not a user-comprehension study, browser-zoom verification, screen-reader verification, assistive-technology verification, forced-colors audit, or WCAG conformance claim.

The current progressive-disclosure source of truth is `docs/ui/PROGRESSIVE_DISCLOSURE_AND_BEGINNER_ADVANCED_INFORMATION_ARCHITECTURE.md`, with the UX5B audit in `docs/ui/PROGRESSIVE_DISCLOSURE_AND_BEGINNER_ADVANCED_INFORMATION_ARCHITECTURE_AUDIT.md`. UX5/UX5B preserve shared orientation, exact technical detail, and direct expert access.

The Guided Builder source of truth is `docs/ui/GUIDED_BUILDER_AND_STEP_BY_STEP_CONFIGURATION_FLOW_FOUNDATION.md`, with the UX6B audit in `docs/ui/GUIDED_BUILDER_AND_STEP_BY_STEP_CONFIGURATION_FLOW_FOUNDATION_AUDIT.md`. UX6 makes Guided the local default while preserving Advanced one action away. Its six steps author only a bounded `ortus.modelSchema` subset, use deterministic ids and existing validation, and require explicit overwrite-protected handoff. UX6B audits and hardens note-id bounds, mode-switch focus, canceled-handoff status, responsive Workshop flow, and Advanced accessibility. A structurally valid Guided draft remains non-runnable and does not mutate World.

The Research World progression source of truth is `docs/RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md`. GW0 is documentation and progression architecture only. It defines Research World as a model-bounded investigation context, not a literal game world or real-world domain simulation. Progression is reusable understanding, modeling capability, and investigative depth, not XP, levels, streaks, hard locks, or achievement loops. GW0 does not implement World/Lab/Atlas/Workshop routes, persistence, discovery logic, behavioral landscapes, contextual guidance, runtime behavior, UI changes, CSS, dependencies, or assets.

The historical Research World shell source of truth is `docs/ui/RESEARCH_WORLD_DESTINATION_SHELL.md`, with the GW1B audit record in `docs/ui/RESEARCH_WORLD_DESTINATION_SHELL_AUDIT.md`. R1 supersedes its route hierarchy: `/` is Start, `/worlds` is the Start-adjacent runnable-world catalog, `/world` is World, `/builder` is Workshop, `/atlas` is Atlas, and `/lab` is Lab. This route reset and C1 content layer change product packaging, not persistent user research data or template behavior. The R1 implementation record is `docs/ui/START_HUB_AND_WORLD_FIRST_PRODUCT_RESET.md`; the R1B rendered audit and hardening record is `docs/ui/FIRST_RUN_AND_WORLD_FIRST_SHELL_AUDIT.md`; the R2 World-layout record is `docs/ui/WORLD_LAYOUT_AND_INTERACTION_RECLAIM.md`; C1 is documented in `docs/product/STARTER_WORLD_CONTENT_FRAMEWORK.md`, `docs/product/STARTER_WORLD_PORTFOLIO.md`, and `docs/ui/EXPLORE_WORLDS_CATALOG.md`; C3 is documented in `docs/product/GUIDED_INVESTIGATION_TUTORIAL_WORLD.md` and `docs/ui/GUIDED_INVESTIGATION_WORLD_EXPERIENCE.md`.

The active-run provenance source of truth is `docs/ui/ACTIVE_RUN_PROVENANCE_AND_OBSERVATION.md`, with the GW2B audit record in `docs/ui/ACTIVE_RUN_PROVENANCE_AND_OBSERVATION_AUDIT.md`. GW2 exposes live model configuration and observation context in the World Observe rail only. A run is inspectable as model behavior under a known configuration, not empirical truth about the real world. The provenance summary is not a saved experiment record, observed values are model state rather than measured real-world data, and visual patterns are evidence about the current model/configuration rather than automatic evidence about the real system.

The active intervention readiness source of truth is `docs/ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS.md`, with the GW3B audit record in `docs/ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS_AUDIT.md`. GW3 exposes live intervention readiness and model-response boundaries in the World Intervene rail only. GW3B audits and hardens current-run entry copy, engine-required semantics, validation-language boundaries, and rendered Intervene assertions. This describes registered template-owned perturbation controls and target readiness, not saved intervention plans, Lab intervention records, Atlas discoveries, validation, calibration, policy effectiveness, or real-world causal proof.

The Discovery Atlas foundation source of truth is `docs/ui/DISCOVERY_ATLAS_INFORMATION_ARCHITECTURE.md`, with the GW4B audit record in `docs/ui/DISCOVERY_ATLAS_INFORMATION_ARCHITECTURE_AUDIT.md`. GW4/GW4B established non-persistent evidence semantics. GW9 now adds an ephemeral exact-coordinate preview, but no Discovery Atlas record, saved landscape, sampled-region map, evidence-linked regime, Lab record, validation, or calibration. Atlas previews model behavior; it does not certify discoveries about the real world.

The Behavioral Landscape foundation source of truth is `docs/ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION.md`, with the GW7B audit record in `docs/ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION_AUDIT.md`. GW7 adds non-persistent Atlas-side vocabulary for parameter space, outcome space, sampled/unsampled areas, model regimes, transition zones, sensitivity zones, and externally unvalidated areas. GW7B audits and hardens that vocabulary/scaffold boundary. A behavioral landscape describes how model behavior may vary across model conditions. It is not a real-world map, empirical proof, or Discovery Atlas record. The GW7 scaffold is text-only and not sampled run data.

The Landscape Probe Planning foundation source of truth is `docs/ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION.md`, with the GW8B audit record in `docs/ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION_AUDIT.md`. GW8 adds non-persistent Atlas-side planning vocabulary for probe intent, candidate axes, candidate ranges, candidate outcomes, constraints, sampling intent, planned comparisons, unresolved feasibility, externally unvalidated hypotheses, non-executable plans, and future sampled probes. GW8B audits and hardens that vocabulary/scaffold boundary. A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery.

The GW9 implementation record is `docs/ui/EPHEMERAL_LANDSCAPE_SAMPLING_PREVIEW_V1.md`; its GW9B audit is `docs/ui/EPHEMERAL_LANDSCAPE_SAMPLING_PREVIEW_V1_AUDIT.md`. Preview V1 supports only the explicit `flocking-boids` capability, one bundled scenario, one or two bounded numeric axes, one final-tick metric, one to three canonical explicit seeds, and at most 5,000 work units. Every sample uses a fresh engine and results stay in component memory. The current conceptual probe plan has no stable runtime identifiers or values and is deliberately not converted or executed.

The Lab evidence record foundation source of truth is `docs/ui/LAB_EVIDENCE_RECORD_INFORMATION_ARCHITECTURE.md`, with the GW5B audit record in `docs/ui/LAB_EVIDENCE_RECORD_INFORMATION_ARCHITECTURE_AUDIT.md`. GW5 exposes a non-persistent `/lab` information architecture for future model-investigation evidence records. Lab records will organize evidence about model investigations; they will not certify discoveries about the real world. Persistent evidence records, experiment ledgers, notebooks, saved comparisons, run history, Lab-to-Atlas publication, storage, and validation/calibration remain unimplemented.

The contextual capability guidance source of truth is `docs/ui/CONTEXTUAL_CAPABILITY_GUIDANCE.md`, with the GW6B audit record in `docs/ui/CONTEXTUAL_CAPABILITY_GUIDANCE_AUDIT.md`. GW6 exposes static source-backed guidance on World, Workshop, Lab, and Atlas, and GW6B audits/hardens that layer. Capability guidance describes current product capability; it does not create capability. It is not persistence, onboarding, user-derived routing, behavior-derived task ordering, Lab records, Atlas discoveries, validation, calibration, or runtime support.

## Layout

The UI uses a shared shell with ORTUS identity, native Start/World/Workshop links, a keyboard-operated Research tools menu, a skip link, and one primary `main` landmark. Inside `/world`, source and visual order are the large canvas World Stage, compact persistent run controls, and one selected task workspace. Direct tasks are Setup, Observe, Change, Compare, and Explain; More groups Experiments and Diagnostics. The active tool owns one bounded scroll region while playback stays outside it. React and Zustand coordinate UI state only. The simulation engine remains the source of truth for entities, components, spaces, metrics, time, events, and seeded randomness.

## Brand

The sharp ORTUS mark is the primary navigation brand. The soft ORTUS mark is a secondary presentation variant. The primary mark is normally paired with the text `ORTUS` wordmark and the descriptor `Systems Sandbox` where space supports it. Do not use either mark as a simulation-world or Builder-graph watermark. Builder remains an ORTUS workspace, not a separate branded product. Favicon replacement remains future work until small-size legibility is deliberately optimized.

The current HCI/UX audit is documented in `docs/ui/HCI_AUDIT.md`. HCI findings must distinguish observed defects, inferred risks, subjective style preferences, and unverified concerns. Broad UI changes require dedicated remediation prompts; branding work must not smuggle in a redesign or weaken runtime-honesty language.

Major detailed tools still use `CornerFramePanel`, but R1 removes decorative corner treatment from the primary product hierarchy. Simulation tools retain the underlying modes Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug while presenting the user-intent labels Setup, Observe, Change, Compare, and More. The selected task owns the only intended task-panel scroll region; persistent run controls stay outside it.

The current semantic visual foundation uses warm charcoal, forest-slate/mineral-gray surfaces, warm off-white text, and restrained teal, moss, copper, amber, violet, and crimson state accents. Template backgrounds are lightweight CSS atmosphere layers only. They provide visual context for Epidemic, Opinion Dynamics, Predator-Prey, Schelling Segregation, Flocking / Boids, Forest Fire / Landscape Spread, and Neural Excitation Network runs, but they are not simulation data.

UX0 retires the tactical/HUD interpretation of that direction for future work while preserving useful hierarchy, precision, contrast, disciplined spacing, strong silhouettes, high-quality motion, dark-mode capability, and distinctive identity. Future migration should be incremental and bounded; do not rewrite the interface at once.

UX1 identifies the current source-level migration risks: centralized-but-overloaded global CSS tokens, repeated raw color and spacing values, duplicated local component treatments, source-visible responsive and accessibility risks, and the need to distinguish semantic tokens from repeated raw values. It does not change production UI/CSS or dependencies.

UX2 begins the bounded migration by establishing raw palette -> semantic token -> component-role token -> component style layering. A visual state must communicate whether it is operational, interaction, evidence, uncertainty, or capability state. Operational success means the requested software operation completed; it does not mean the modeled conclusion was scientifically validated. Domain color identifies modeled content. Semantic color communicates interface and evidence state.

## Template Connection

Production templates are registered in `src/simulation/templates/registry.ts`. The UI descriptor list is aligned to that registry and adds UI-only accent/background/legend metadata. The UI creates a `SimulationEngine`, reads snapshots, renders agents from snapshot spaces/components, and calls engine APIs for stepping, reset, scenario import, and snapshot import.

Canvas rendering is snapshot-driven. The UI stores only `selectedEntityId`, not copied agent state, and the canvas does not mutate engine state. Parameter controls rebuild through engine/template validation rather than editing entities or components directly.

## Concept Vocabulary

The architecture vocabulary is defined in `docs/concepts.md`. In short: templates define model families, scenarios define initial conditions and supported variants, runs execute a template/scenario/seed configuration, snapshots restore exact tick state, run summaries compare bounded outcomes, experiments batch runs, and interventions perturb a live run through validated engine paths.

Production templates also declare capability flags, space definitions, entity/agent type metadata, formal metric metadata, and structured Assumptions, Limits + Ethics profiles. `SimulationRunConfig` is the shared fresh-run recipe for starting a new run from a template, scenario, seed, parameters, and supported variant options; it is distinct from snapshots and run summaries.

Randomness in simulation code is seeded through `RandomService`; hidden `Math.random` calls are not allowed in the simulation layer. Metrics have formal definitions aligned with emitted values, interventions are declarative template-owned definitions, and a bounded structured event log records run initialization, scenario application, and intervention outcomes without becoming event sourcing.

Forest Fire / Landscape Spread is an abstract local-spread grid template. It is not a wildfire predictor, does not use GIS, real terrain, wind, humidity, weather, suppression, firefighting, or calibrated fire probabilities, and is useful only for exploring local spread, thresholds, fragmentation, and qualitative emergent patterns. Its grid coordinates are not SpatialFieldModel runtime support, and its boundary modes are not BoundaryEnvironmentModel runtime support.

Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation. Activation is a model variable, not measured membrane voltage. Synapse weights are abstract influence strengths, not biological synaptic measurements. The model does not simulate ion channels, neurotransmitters, morphology, learning, consciousness, or cognition. This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable. Outputs are model behavior, not neuroscience evidence.

Decision Readout V1 maps labeled output assemblies to bounded categorical choices. It is not cognition or reasoning. Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network. Template RPS payoff is observational and does not train, optimize, mutate synapses, or update biological/plasticity fields. The model does not infer intentions, beliefs, preferences, personality, or human decision-making.

Neural Runtime Lab UX V1 adds a scenario-first Setup panel for the Neural template. Prompt N2 adds Neural Strategy Adaptation V1 to the lab's Rock-Paper-Scissors readout mode, and Prompt N2B audits/hardens that slice. Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference. The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time. Learned strategy state is local model state, not a psychological profile. Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning. It uses bounded RPS round history, choice counts, transition counts, deterministic exploration, rolling results, and bounded readout-bias/stimulus adjustment. Prompt N2B fixed round-index reset semantics so bounded history cannot rehydrate or swallow learned state after Reset learned strategy, keeps round numbering monotonic after history truncation, filters malformed round objects before statistics, and documents that fresh-run rebuilds do not clear local learned strategy unless the visible reset control is used. It does not persist a user profile, infer intentions, beliefs, preferences, personality, or human decision-making, update core synapse weights from payoff, make Builder graphs executable, or make Model Schemas runnable. Prompt NUX1B traced the production-build failure to build-time remote font fetches and removed the Next Google font loaders in favor of the existing CSS fallback stacks. Rendered responsive, zoom, keyboard walkthrough, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified unless directly tested.

Prompt MR0 is documentation only. It records future template and decision-cluster direction only; it does not implement runtime behavior. Planned directions include Urban Daily Routine / Activity Choice, Atmospheric Field Dynamics, cluster-based decision readout generalization, stimulus-conditioned decision clusters, an offline Blackjack Sequential Decision Lab, and later observed cluster discovery / decision-space analytics. Decision clusters model observable state-action patterns, not thoughts. Prediction outputs are probabilities, not certainties. Cluster labels are assigned modeling labels, not meanings understood by the system. External stimuli are modeled inputs, not evidence of internal mental state. Observed clusters are analytical groupings, not psychological profiles. Blackjack work is offline simulation only, not gambling advice, live casino assistance, or wearable card-counting support. Do not use wearable devices, camera input, or software assistance for live casino play.

Prompt F0 is documentation only. It records future fractal and multiscale analysis direction; it does not implement fractal metrics, fractal spatial generators, Scale Lens UI, network scaling analytics, trajectory motif analytics, template support, registry support, schema execution, Builder graph execution, or runtime behavior. Measure multiscale structure before generating synthetic fractal structure. Fractal and multiscale tools describe how measured structure changes across scale. They do not prove that a system is fundamentally fractal. A complex-looking, nested, branching, or irregular pattern is not automatically fractal. Power-law behavior may indicate scale-free structure, but a power-law fit alone does not establish fractality. Finite-resolution fractal dimensions are estimators over a chosen scale range, not intrinsic truths about the modeled system. Statistical self-similarity must be supported across an explicit scale range; it should not be inferred from visual resemblance alone. Scale-free distributional evidence is not identical to geometric fractality. Visual resemblance to a fractal is not evidence of scale invariance. Fractal and multiscale metrics are structural summaries, not causal explanations, forecasts, validation results, or proof of universal laws.

Every ORTUS model is an abstraction. The Assumptions, Limits + Ethics panel shows what the model includes, what it excludes, and what uses would be misleading without validation. Validation status describes evidence about the model, not truth about the real world; internally tested means software and invariant checks, not calibration or external validation.

Network primitives are service-level in V1. They define bounded plain-JSON nodes, edges, relation types, deterministic generators, query helpers, metrics, and import/export artifacts. Neural Excitation is the one current production template with template-owned runtime `NetworkSpace` synapses; this does not make Builder graphs, model-schema graphs, network artifacts, or other templates executable. Network metrics are structural or model-output summaries, not causal proof or real-world relational evidence.

Resource, stock, and flow primitives are service-level in V1. They define bounded plain-JSON resources, stocks, flows, deterministic update helpers, metrics, and import/export artifacts, but current production templates do not claim resource or stock-flow runtime behavior yet. Resource metrics are structural summaries, not proof of real-world economic, ecological, or health outcomes.

Feedback, delay, and event primitives are service-level in V1. They define bounded plain-JSON scheduled events, delay queues, feedback loop metadata, deterministic scheduling/release helpers, simple clamp-based feedback adjustments, metrics, and import/export artifacts, but current production templates do not claim feedback, delay, or event runtime behavior yet.

Feedback, delay, and event primitives represent model structure. They do not by themselves prove causal relationships, real-world feedback loops, or predictive validity.

Prompt 17 adds service-level feedback/delay/event primitives. Full visual feedback-loop editing, delayed resource/network dynamics, and causal validation require later model schema, rule primitive, validation, and visual builder phases.

Observability/measurement models are service-level in V1. They define observable, latent, and unobserved variables plus structural measurements, schedules, and measurement processes, but they do not collect runtime data or ingest external data. Runtime metrics are model outputs; they are not automatically empirical observations. An observability model defines how something could be measured; it does not collect, calibrate, or validate data. Synthetic observations are generated or declared model-side; they must not be treated as observed evidence.

Causal assumptions/influence models are service-level in V1. These causal assumptions are structural metadata. They declare variables, influence edges, assumptions, evidence items, and intervention relevance without discovering, proving, inferring, solving structural equations, optimizing, validating, or calibrating causality. Causal assumption models declare influence assumptions; they do not prove causality. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves. Active causal influences are structural declarations, not runtime-executed behavior.

Units, dimensions, and quantity semantics are service-level in V1. They declare dimensions, units, quantities, ranges, and compatibility rules without enforcing runtime units, converting values, solving equations, calibrating, or validating values. Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics. Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency. Per-tick rates are model-time rates unless a physical time mapping is explicitly defined.

Emergence/pattern descriptors are service-level in V1. They declare candidate patterns, signatures, thresholds, time windows, variables, and scale links without detecting patterns at runtime, proving emergence, performing statistical significance testing, running ML clustering/anomaly detection, validating model output against reality, or making current templates emergence-aware. Emergence pattern descriptors describe candidate patterns; they do not prove emergence. Visual patterns and runtime metrics are model outputs, not empirical proof of emergence. Active pattern descriptors are structural declarations, not runtime-detected results.

Robustness/resilience/stress testing semantics are service-level in V1. They declare stressors, response criteria, failure modes, and stress-test plans without executing stress tests at runtime, perturbing active simulations, proving robustness or resilience, performing statistical validation, certifying safety or operational readiness, or making current templates robustness-aware. Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient. Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations. Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves.

Strategy/control/intervention semantics are service-level in V1. They declare strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, and expected effects without executing strategies at runtime, executing template interventions, running closed-loop control, optimizing policies, proving intervention effectiveness, estimating treatment effects, certifying safety or operational readiness, or making current templates strategy/control-aware. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops. Validation/calibration remains future work.

Model schemas are service-level in V1. `ModelSchemaDefinition` artifacts declare entity, component, attribute, space, parameter, metric, rule-declaration, and artifact-reference structure. Model schemas declare model structure; they do not execute rules or create runnable simulations. A valid model schema is not a template, scenario, RunConfig, or snapshot. Rule declarations are descriptive metadata, not parsed formulas or executable behavior. Active means structurally active, not runtime-executed. Production templates are hand-built runtime models, not generated from model schemas. Runtime interpreter/compiler, runnable visual model builder support, external framework interop, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, LLM-per-agent runtime, validation, and calibration remain future work. Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.

Schema Validation UX + Repair Suggestions V1 adds grouped issue cards, counts, section jumps, copyable diagnostics, and bounded repair suggestions to Author Schema. Repair suggestions are structural editing assistance. They do not make a schema runnable. A repaired schema may be structurally valid and still have no runtime implementation. ORTUS does not infer the correct model behavior from validation repairs. Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines. Prompt 37B hardens confirmation enforcement, `canApply` classification, stale-patch rejection, malformed/prototype-like patch rejection, deterministic issue grouping, rule-repair boundary copy, and export-after-repair tests. Browser clipboard behavior, rendered responsive behavior, zoom behavior, focus-return behavior, assistive-technology behavior, and WCAG-level readiness remain unverified until browser and assistive-technology testing is available.

Knowledge, memory, and social-learning semantics are service-level in V1. `ortus.knowledgeMemorySocialLearningModel` artifacts describe symbolic knowledge items, belief variables, belief-state descriptors, bounded memory traces, attention/salience descriptors, trust/source profiles, exposure channels, social signals, background priors, relationship roles, norms, and learning-rule descriptors. Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition. Background profiles are compressed prior descriptors, not simulated life histories. Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals. LLM-per-agent runtime is not implemented and must not be implied. They do not execute social learning, update beliefs or memory at runtime, sample exposure, infer real-person traits, support protected-class inference, validate psychology, predict people, optimize persuasion, provide policy targeting, or mutate Opinion Dynamics.

Opinion Dynamics now has a narrow template-owned `socialLearning` behavior mode. Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition. Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template. Opinion values and social-learning metrics are model outputs, not measured human beliefs. Information-source credibility is a model parameter, not a verified truth score. No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.

Visual Builder Workspace V1 is service-level in V1. `ortus.visualBuilderWorkspace` artifacts describe future visual-builder workspace identity, referenced model schemas and artifacts, visual nodes, visual edges, panels, sections, validation markers, warning markers, unsupported/future-only markers, layout metadata, selection metadata, viewport metadata, notes, summaries, and validation reports. Prompt 34 adds a dedicated `/builder` UI shell that can import, validate, inspect, filter, and export these artifacts with read-only structural navigation. Prompt 34B audited and hardened the shell and simulation workspace IA without adding execution. Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges. The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime. A structurally valid workspace is still not a runnable model. Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics. The shell does not implement drag-and-drop model construction, visual programming, model schema execution, compatibility conversion, template generation, scenario generation, RunConfig generation, snapshot generation, engine creation, external framework interop, generic social-learning runtime, or LLM agents. Active means structurally active, not runtime-executed.

Prompt 35 adds an `Author Schema` mode beside the existing Builder workspace inspector. It uses bounded forms and the existing model-schema validation, warning, summary, serialization, and deserialization services to edit `ortus.modelSchema` identity, entities, components, attributes, spaces, parameters, metrics, rule declarations, artifact references, notes, and inert metadata. Drafts remain in memory, failed imports preserve current work, dirty imports/reset/removals require confirmation where destructive, and valid export produces only a model-schema artifact.

Model Schema Authoring Forms V1 creates structural model-schema artifacts; it does not execute schemas. Rule declarations authored in the Builder are descriptive only and remain non-executable. A valid authored schema is not a runnable simulation. The schema authoring UI does not generate templates, scenarios, RunConfigs, snapshots, or engines. Prompt 36 Graph View does not read, convert, or mutate the Author Schema draft.

Prompt 35B audited and hardened the forms without adding execution. It added pre-read file-size rejection, broader profiling/persuasion/targeting payload rejection, modal destructive confirmations, metadata-removal confirmation, roving tab stops, concise validation announcements, preservation of imported non-text JSON value types, and a medium-width stacking breakpoint. These are source- and unit-tested behaviors, not a rendered accessibility or mobile-polish claim.

Prompt 36 adds a dedicated read-only Graph View for the currently loaded `ortus.visualBuilderWorkspace` artifact. It uses a pure presentation adapter, deterministic coordinates, HTML node controls, SVG relationship lines, a keyboard-accessible graph outline, a text edge list, local search/filter/highlight/pan/zoom state, read-only inspection, warning and unsupported/future/service-only markers, and an outline-only fallback above 120 nodes or 240 edges. Schema-derived graph viewing remains deferred; Graph View does not create a workspace from an Author Schema draft.

Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges. Graph selection, filtering, panning, and zooming are UI-only state. Graph View is not visual programming, schema execution, or runtime generation. A graph that looks complete is still not a runnable model.

Prompt 36B audits and hardens Graph View without adding authoring or runtime semantics. It separates warning markers from global runtime-boundary notices, preserves unsupported/future-only/service-only counts, keeps filtered inspector links honest, uses actual graph-surface dimensions for Fit Graph, hardens deterministic DOM ids and layout behavior, and adds source-level accessibility and boundary tests. Rendered responsive behavior and WCAG-level accessibility remain unverified until browser and assistive-technology testing is available.

Template/Schema Compatibility Mapping V1 is service-level in V1. `ortus.schemaTemplateCompatibilityReport` and `ortus.templateMappingProfile` artifacts compare `ModelSchemaDefinition` structure with static production-template metadata. Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models. Prompt 38 adds a Builder Author Schema fit-report panel over the existing headless compatibility service for the current structurally valid draft only, and Prompt 38B audits/hardens that panel. Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents. Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Rule fits are structural comparisons. Rule declarations are not executed. Fit score is a structural summary, not a runtime readiness score. Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles. Builder graphs remain structural inspection views. Fit reports do not make them executable. Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability. MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report. This fit report may be stale because the schema changed after it was generated. Refresh the report before using it. Invalid current drafts do not fall back to a previous valid report. Prompt 38B also keeps equal-score ranking deterministic by score, fit label, then template id. Compatibility mapping does not execute schemas, parse rule descriptions, mutate templates, create engines, implement visual builder runtime, provide external framework interop, run social-learning/cognitive behavior, validate science, calibrate outputs, or prove causality, emergence, robustness, strategy effectiveness, safety, or operational readiness.

Prompt 39 adds Scenario Planning From Schema V1 in Builder Author Schema near the fit report. Prompt 39B audits and hardens stale-source handling, copy honesty, forbidden actions, accessibility copy, and runtime boundaries. Scenario planning from schema is a planning aid. It does not create runnable scenarios. Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state. Scenario questions are hypotheses to explore, not predictions or validated conclusions. A scenario plan can suggest what to inspect, but it does not prove what will happen. Conceptual interventions are not executable controls, suggested metrics are not empirical measurements, and data needs do not imply the current schema is calibrated. Assumption checks identify what the modeler should clarify. They do not resolve the assumption. Fit reports describe structural resemblance. Scenario plans describe possible study designs. Neither one makes a schema runnable. Invalid schemas disable planning, stale fit reports must be refreshed before use, schema or fit-report changes mark existing scenario plans stale until refreshed, MR0 concepts remain future-only planning gaps, and Neural Strategy Adaptation remains local to Neural Runtime Lab. Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

## Current Capability Vs Reserved Future Capability

Currently implemented as service-first primitives: networks/relations, resources/stocks/flows, feedback/delays/events, uncertainty, assumptions/limits/ethics, hybrid composition, multi-scale structure, scale view state, boundaries/environment, spatial fields/environmental layers, observability/measurement models, causal assumption/influence models, units/dimensions/quantity semantics, emergence/pattern descriptors, robustness/resilience/stress-test semantics, strategy/control/intervention semantics, model schema declarations, knowledge/memory/social-learning semantics, visual builder workspace schemas, and template/schema compatibility mapping.

Currently not implemented: true multi-scale runtime, scale-aware renderer/UI, Scale Lens / Coarse-Graining, fractal metrics, fractal spatial generators, network scaling analytics, hierarchical trajectory motif analytics, generic landscape probe execution, saved probe plans, persistent or unbounded Atlas landscape/probe sampling sweeps, interpolation, regime detection, runtime observability measurement collection, runtime causal influence execution, runtime emergence detection, runtime robustness/resilience stress testing, runtime strategy/control execution, model schema runtime execution, model schema compiler/interpreter runtime, schema-to-template conversion, compatibility-based runtime execution, runnable visual model builder, graph editor UI, drag-and-drop model execution, visual programming, schema execution, scenario/RunConfig/snapshot/template generation from workspace schemas, compatibility reports, or scenario plans, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, LLM-per-agent runtime, real-person inference, protected-class inference, causal discovery/proof/inference/do-calculus/structural equation solving/intervention optimization, runtime spatial-field sampling/diffusion/advection, runtime unit enforcement, automatic unit conversion, dimensional equation solving, multi-rate time, generic adaptive agents beyond the narrow Neural RPS/readout lab slice, heterogeneity layer, phase transition tools, attractor/basin tools, trace inspection, error budgets, calibration/data assimilation/MCMC, and external framework interop.

Service-first primitives are foundations, not active model behavior. A template should not claim support for a primitive until its runtime actually uses that primitive.

Zooming the camera is not the same as multi-scale modeling. Multi-scale ORTUS models will require explicit scale levels, aggregation rules, disaggregation rules, cross-scale coupling, and warnings when detail is synthetic or lost.

Model state is not the same as observable reality. Observability V1 distinguishes internal simulated state and runtime metrics from measured, partial, noisy, proxy, synthetic, or empirical observation definitions, but it does not execute measurement, calibration, validation, inference, or data assimilation. Causal Assumptions V1 is structural only and does not make observations, metrics, networks, or feedback labels causal evidence. Units/Dimensions V1 is structural only and does not make current templates quantity-aware. Emergence Pattern Descriptors V1 is structural only and does not prove emergence, execute detection, or make visible model patterns empirical evidence. Robustness/Resilience V1 is structural only and does not execute stress tests, certify safety, validate operational risk, or prove the system is robust. Strategy/Control V1 is structural only and does not execute policies, triggers, objectives, stopping rules, or template interventions.

Relations, feedback loops, and events can encode model assumptions, but they do not by themselves prove causal relationships in the real world.

The revised roadmap is in `docs/roadmap.md`; reserved missing pillars are in `docs/missing-pillars.md`.

## Systems Primitive Registry

`src/simulation/registry` is the source of truth for current vs reserved systems primitives, artifact families, and production-template capability summaries.

Global service availability is not template support. A primitive can exist as a headless service without making templates runtime-capable; only explicitly wired and tested template slices may claim runtime support.

Reserved primitives are roadmap commitments, not implemented behavior. Runtime-active support must only be claimed when a template actually uses the primitive, and reserved future pillars must not be exposed as active features. Prompt 20 will use the registry for hybrid composition planning.

The registry does not change runtime behavior by itself. Neural Excitation uses its own runtime network graph; no current template runtime uses resource/stock/flow services or feedback/event/delay services.

## Hybrid Composition

`src/simulation/composition` defines Hybrid Model Composition V1 as a service-first structural layer. A hybrid composition can reference scenarios, assumptions, uncertainty configs, network definitions, resource systems, event schedules, delay queues, and feedback loop artifacts, plus declared future primitives.

Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented.

Attaching a primitive artifact to a composition does not automatically make a template use that primitive. V1 does not compile custom models, execute attached artifacts, wire networks/resources/feedback into templates, or create visual-builder behavior.

Hybrid compositions may reference template/schema compatibility reports and template mapping profiles structurally. Such attachments do not make a composition runnable and do not satisfy model schema execution, visual builder runtime, conversion, generation, validation, calibration, external interop, or social-learning runtime capabilities.

## Multi-Scale Architecture

`src/simulation/multiscale` defines Multi-Scale Systems Architecture V1 as a service-first structural layer. Scale models can describe scale levels, entity types, aggregation rules, disaggregation rules, and cross-scale links, but current templates do not execute multi-scale dynamics.

Camera zoom is not multi-scale modeling. Model-scale representation requires explicit scale levels, aggregation/disaggregation rules, cross-scale links, and warnings about what detail is lost or synthetic.

Aggregation can lose information, and disaggregation can create synthetic detail. Synthetic detail must not be treated as observed or already modeled detail.

A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics. Model schema/compiler work remains future.

## Scale View State

`src/simulation/scaleView` defines Multi-Scale Zoom + View System V1 as service-first model-scale view state. It can track the current scale level, view mode, visual camera state, selected entity reference, transition history, and warnings for a referenced scale model.

Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.

Scale transitions in V1 do not execute aggregation or disaggregation rules. They only change `currentScaleId`, preserve camera state, record transition history, and surface information-loss or synthetic-detail warnings.

A scale view state can navigate a scale model, but it does not make a template multi-scale capable. Current templates do not runtime-use scale view state, and runtime compiler/interpreter work remains future.

## Boundaries + Environment

`src/simulation/boundaries` defines Boundaries + Environment Layer V1 as a service-first structural layer. Boundary models declare system scope, environment scope, boundary surfaces, exchanges, external forcings, and exogenous shocks.

Active boundary exchanges are structural declarations, not runtime-executed flows.

World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model.

A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open. V1 does not execute exchanges, forcings, shocks, or spatial fields, and does not make current templates boundary/environment aware. Model schema/compiler work remains future.

Closed/open boundary contradictions are surfaced as structural warnings for review, not as proof that the model can execute environmental dynamics.

## Spatial Fields + Environmental Layers

`src/simulation/spatialFields` defines Spatial Fields + Environmental Layers V1 as a service-first structural layer. Field-layer models declare coordinate spaces, field definitions, environmental layers, and sampling rules.

Spatial fields are structural layer definitions, not runtime diffusion or GIS engines.

World coordinates, grids, and positions are not the same as explicit environmental field layers.

A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.

V1 does not execute diffusion, interpolation, advection, field sampling, agent-field coupling, resource-field coupling, or terrain rendering. Active fields, layers, and sampling rules are structural declarations only. Measured fields need provenance to be trustworthy, synthetic fields must not be treated as observed detail, and current templates do not runtime-support spatial fields. Boundary models and spatial fields are related but distinct: boundary models describe system scope and exchanges, while field layers describe spatial/environmental context. Prompt 25 adds Observability + Measurement Model V1 as structural measurement metadata. Model schema/compiler work remains future.

## Product Notes

The World Stage is the primary workspace. Agents are rendered as a single canvas layer over template-specific atmospheric backgrounds. The right-side inspector summarizes template-specific state such as infection status, opinion/stubbornness, species, energy, Schelling group, grid cell, satisfaction state, Flocking speed/neighbor density, and Neural stylized activation/refractory/inhibition state, with raw component payloads available for debugging. Legend and debug diagnostics are available through the Observe and Debug workspace modes so they do not cover the world by default.

Parameter controls are generated from template definitions. Numeric controls show current values and ranges, and changes are applied by rebuilding the run through engine validation so invalid parameter combinations do not enter the engine. When Neural Excitation is selected, Setup also shows the Neural Runtime Lab before exact numeric parameters; the lab provides scenario cards, mission/status readouts, bounded live explanations, direct template-scoped actions, plain-English setup mappings, a bounded timeline, and an Adaptive RPS Challenge with local bounded strategy adaptation. Exact Neural parameters remain available in Advanced config, and exact adaptation parameters remain local to the lab challenge. The Micro panel also includes an agent avatar display preference for canvas-only rendering styles: glyphs, arrows, initials, or head markers. File exchange reports whether a scenario or snapshot export/import succeeded.

## Scenario Builder

The Scenario Builder lives in the Setup workspace mode as an initial-condition and model-variant workspace. It authors Scenario Builder JSON artifacts with scenario id, name, description, tags, template id/version, seed, validated parameters, initialization preset/options, agent composition, behavior mode, environment options, metadata, and timestamps. These scenarios do not store tick state, world snapshots, metric history, intervention history, or run outcomes.

Each production template exposes initialization presets and a supported default behavior mode through template metadata. V1 presets include outbreak layouts for Epidemic, opinion distributions for Opinion Dynamics, ecology layouts for Predator-Prey, neighborhood layouts for Schelling, heading/position layouts for Flocking, abstract fuel/ignition layouts for Forest Fire / Landscape Spread, and stylized topology/excitation presets for Neural Excitation Network, including an optional Rock-Paper-Scissors readout demonstration preset. The RPS preset maps labeled output assemblies to a bounded selected readout and observational template payoff only; it is not cognition, semantic understanding, biological learning, or human decision-making. Neural Strategy Adaptation V1 is a separate lab-local RPS/readout layer that adjusts bounded readout bias from explicit local rounds and does not update core synapse weights. Agent composition fields are template-defined and backed by existing validated parameters such as agent count, predator/prey counts, density, group ratio, boid count, fuel density, ignition count, or neuron count. Environment options are exposed only where there is a clean existing template option, such as Schelling grid dimensions, Flocking boundary mode, or Forest Fire grid and neighbor settings. The builder previews the initial world by creating a separate temporary engine at tick 0; preview does not mutate or advance the active simulation.

Applying a scenario validates the recipe, creates a fresh `SimulationEngine`, clears stale selection/intervention target state, and starts the active run at tick 0. The local scenario library is browser-local, bounded to 50 scenarios, validates loaded records, and ignores corrupted stored data without crashing the app. Scenario Builder import/export is separate from snapshot import/export and run comparison export.

Scenarios define initial conditions and supported model variants. They do not guarantee outcomes; complex systems can behave differently across seeds, parameters, behavior modes, and agent compositions.

## Experiment Runner

The Experiment Runner lives in the Experiment workspace mode. It creates fresh headless engine instances for the selected template, runs parameter sweeps locally in the browser, records final numeric metrics, aggregates results by condition, and exports JSON or CSV. The interactive World Stage engine is not reused for experiment trials.

V1 supports single-parameter sweeps in the UI with generated numeric ranges or manual value lists. The headless experiment module also supports one- or two-parameter grid sweeps, fixed seed lists, sequential seeds from a base seed, cancellation between runs, and a default `maxRuns` limit of 100 with a hard V1 limit of 500. Fixed seed lists are used in the supplied order. Results store metrics and run metadata only; full snapshots are not stored per trial by default.

Experiment results are exploratory and depend on model assumptions, parameter choices, and random seeds. They are not calibrated predictions.

## Intervention Tools

The Interventions instrument lets users apply controlled perturbations to the current run without editing agents or components from the UI. Each intervention is defined per template, validated by the headless intervention executor, and applied through the engine command buffer. Interventions apply immediately at the current tick and do not advance simulation time; the next normal step continues from the perturbed state.

V1 interventions include infect selected/radius for Epidemic, set selected/broadcast opinion for Opinion Dynamics, add prey/remove selected for Predator-Prey, swap selected group for Schelling, apply impulse/scatter radius for Flocking, ignite a selected fuel cell for Forest Fire, and bounded node/cluster/global/output-assembly stimulus controls for Neural Excitation Network. Neural interventions do not edit selected synapses, train RPS choices, run clinical controls, infer intentions or beliefs, or make Builder graphs executable. Canvas clicks only report target entity, world point, or grid-cell information to UI state. The canvas does not mutate simulation state.

Neural Runtime Lab direct actions are discoverable UI shortcuts over supported template interventions or fresh-run rebuilds. They do not add selected-edge editing, hidden schema execution, Builder graph execution, Model Schema execution, biological learning, opponent identity modeling, or payoff-driven core weight updates. Neural Strategy Adaptation V1 is limited to local RPS/readout challenge state and resettable bounded readout-bias adjustment.

Validation rejects stale or destroyed selected entities, unsupported intervention ids, invalid parameter ranges, non-finite world points/vectors, and invalid template-specific transitions such as reinfecting an already infected selected epidemic agent. Radius interventions compute affected agents only when applied.

Applied and failed interventions are recorded in a bounded history of 500 items. Snapshot export preserves the applied intervention history because it is part of world state. Scenario export remains an initial-condition restart and does not replay mid-run interventions in V1.

Interventions are exploratory perturbations. They help users study model behavior under controlled changes, but they are not real-world policy predictions.

GW3 adds an Intervene-mode readiness and boundary layer around these existing controls. GW3B audits and hardens that layer without changing runtime behavior. Intervention readiness describes available model perturbation controls; it is not a saved intervention plan or experiment record. Current-run intervention entries are engine/snapshot state, not persistent Lab records. A response to an intervention is evidence about this model under this configuration, not automatic proof that the same intervention would work in the real system.

## Run Comparison Workspace

The Run Comparison workspace lives in the Compare workspace mode. It captures bounded run summaries from the current interactive simulation and can import successful completed experiment runs into the same summary format. A run summary is not a scenario and is not a snapshot: it stores template metadata, seed, parameters, current tick/time, final numeric metrics, bounded metric history when available, intervention summaries, labels, notes, tags, and source metadata. It does not store full world snapshots by default.

Saved runs are kept in local browser storage under a bounded V1 library of 50 summaries. Malformed stored data is ignored with a friendly notice rather than crashing the app; when possible, valid stored records are salvaged and invalid records are skipped. Users can label, annotate, select, baseline, delete, clear, compare, and export saved summaries. Comparison shows metadata, differing parameters, final metric deltas relative to the baseline run, limited metric traces on shared tick/value axes when bounded history exists, and bounded intervention summaries. Experiment-derived summaries usually have final metrics only, so trace comparison is available mainly for captured manual runs.

Comparison export supports JSON and CSV. JSON includes selected run summaries, comparison configuration, baseline id, metric deltas, parameter differences, timestamp, and app version metadata. CSV exports one row per selected run with parameter and final metric columns. Full snapshots are not exported by default.

Run comparisons are exploratory. Differences between runs can suggest patterns, but they do not prove causal relationships without careful experimental design.

## Scenario vs Snapshot

- Scenario Builder export stores an authored initial-condition and supported-variant recipe: template, seed, parameters, initialization preset/options, agent composition, behavior mode, environment options, metadata, and notes.
- File Exchange scenario export stores the current template id, parameters, seed, and engine metadata for a basic initial-condition restart.
- Snapshot export stores current tick/time, world state, events, RNG streams, metrics history, applied intervention history, and metadata. Importing a snapshot restores the current run.
- Run summary capture stores comparison metadata and bounded metrics only. It is for comparing outcomes and does not restore or replay a run.

## Runtime Performance

Interactive runs step the headless engine through a fixed-tick loop, create one snapshot per animation frame when ticks advance, publish that snapshot through Zustand, and render agents through a single canvas pass. The Debug panel can show developer-only timing data when performance instrumentation is enabled with `localStorage.setItem("ortus.performanceInstrumentation.v1", "enabled")`; remove that key or set any other value to disable it. Instrumentation records bounded tick, metric, snapshot, frame/update, entity-count, neighbor-query, forest-fire, and flocking counters without changing simulation semantics.

Service primitives are not runtime support unless a template explicitly uses them. Default entity counts are UX defaults, not engine limits, and scalability claims require benchmark evidence. Generic `Continuous2DSpace.queryNeighbors` uses a versioned lazy `ContinuousSpatialHashIndex` for finite local-radius queries in non-tiny worlds, with deterministic all-pairs fallback for tiny or broad/global-radius cases. Flocking uses its own deterministic tick-local pair summaries on top of the same headless spatial-index service. The spatial index is an implementation detail, not a SpatialFieldModel runtime primitive.

Forest Fire / Landscape Spread uses cached grid-neighbor indices, compact numeric state arrays, active burning-cell indices, changed-component updates, and current state-count globals for metrics. It is still an abstract local-spread template, not wildfire prediction or BoundaryEnvironmentModel/SpatialFieldModel runtime support. Full snapshots, engine invariant checks, template validation, Zustand publication, and render-model rebuilding remain separate runtime costs.

Neural Excitation Network uses a bounded template-owned runtime graph, deterministic topology generation, a bounded delayed signal queue, per-tick firing saturation guards, and an optional bounded Decision Readout V1. Decision metrics are model-output readouts from labeled neuron groups, not evidence of reasoning. Template RPS payoff is observational and does not train, mutate synapses, or adapt the core neural graph in V1. Neural Strategy Adaptation V1 uses bounded UI-local RPS history and pattern statistics to adjust readout-bias/stimulus behavior only; it is not empirical evidence, cognition, biological plasticity, or a user profile. Prompt N2B hardened reset/truncation semantics, deterministic round numbering, and malformed-round filtering. The Neural Runtime Lab timeline and RPS history are bounded UI histories, not engine event sourcing or empirical evidence. This is a stylized neural excitation network, not a biological brain simulation, and the runtime graph does not make Builder graphs or model-schema graphs executable.

Run `npm run perf:simulation` for a local non-asserting performance report covering flocking, forest-fire, and predator-prey scenarios. The report includes elapsed time, ticks/sec, scheduler compute time, metrics time, validation/overhead remainder, snapshot time, render-model preparation time where accessible, entity/cell counts, neighbor counters, and forest-fire changed-cell counters.

## Limitations

- Continuous-space templates can still have pairwise interaction costs. Flocking now avoids the default-count all-pairs path for local-radius queries, but global-radius settings and other templates may remain CPU-bound.
- Schelling uses the existing grid space and batched canvas grid rendering; V1 still favors moderate grid sizes over very large city-scale maps.
- Flocking uses the existing continuous space, deterministic tick-local neighbor summaries, batched command-buffer updates, and directional canvas glyphs; V1 does not include obstacles, leaders, vision cones, or trails.
- Experiment runs are local and chunked between completed trials, not Web Worker backed. Large sweeps can still consume CPU, so the UI blocks configurations above the V1 run limits.
- Intervention history is preserved in snapshots, but V1 does not implement scenario-level intervention replay or undo.
- Scenario Builder previews initial worlds only and does not run forward or predict outcomes. Behavior modes remain template-owned and bounded; richer custom rule authoring is future work. Experiment Runner integration with saved scenarios is future work.
- Run comparison storage is browser-local, bounded to 50 summaries, stores at most 240 metric history records and 100 intervention summaries per run, and does not store full snapshots. V1 does not import external comparison files back into the library.
- Canvas rendering is intentionally simple and batched.
- The UI has no timeline rewind or pan/zoom in V1.
- Mesa, NetLogo, and MASON files are future adapter contracts only. There is no external runtime integration in V1.
- Built-in models are exploratory simulations, not calibrated predictive tools.
