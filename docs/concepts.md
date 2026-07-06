# ORTUS Concepts And Architecture Vocabulary

ORTUS is organized around a small set of simulation concepts. Keeping these boundaries explicit prevents model-family definitions, live run state, exploratory comparisons, and UI workspace data from collapsing into one ambiguous artifact.

Roadmap status: ORTUS has completed Prompt 39B: Scenario Planning From Schema Audit, plus non-roadmap Prompt N1: Neural Excitation Network Template V1, Prompt N1B: Neural Excitation Network Template Audit + Decision Readout V1, Prompt NUX1: Neural Runtime Lab UX V1, Prompt NUX1B: Neural Runtime Lab UX Audit + Build Investigation, Prompt N2: Neural Strategy Adaptation V1, Prompt N2B: Neural Strategy Adaptation Audit, Prompt MR0: Templates + Decision Clusters Mini-Roadmap, docs-only Prompt F0: Fractal and Multiscale Analysis Mini-Roadmap, docs-only Prompt P0: ORTUS Product Philosophy and Learning Mission, docs-only Prompt UX0: Living Systems Atlas Visual Direction, docs-only Prompt UX1: Existing Design Token and Component Audit, docs-only Prompt GW0: ORTUS Research World Progression Mini-Roadmap, Prompt UX2: Living Systems Atlas Semantic Token Foundation, Prompt UX2B: Living Systems Atlas Semantic Foundation Rendered Browser Audit, Prompt GW1: Persistent World / Lab / Atlas / Workshop Shell, Prompt GW1B: Destination Shell Audit and Hardening, Prompt GW2: Active Run Provenance and Observation Layer, Prompt GW2B: Active Run Provenance and Observation Audit and Hardening, Prompt GW3: Active Intervention Boundary and Perturbation Readiness, Prompt GW3B: Active Intervention Boundary Audit and Hardening, Prompt GW4: Discovery Atlas Information Architecture and Non-Persistent Evidence Map Foundation, Prompt GW4B: Discovery Atlas Foundation Audit and Hardening, Prompt GW5: Lab Evidence Record Information Architecture, Prompt GW5B: Lab Evidence Record Information Architecture Audit, Prompt GW6: Contextual Capability Guidance, Prompt GW6B: Contextual Capability Guidance Audit, Prompt GW7: Behavioral Landscape Exploration Foundation, Prompt GW7B: Behavioral Landscape Foundation Audit and Hardening, Prompt GW8: Landscape Probe Planning Foundation, Prompt GW8B: Landscape Probe Planning Audit and Hardening, and Prompt UX3: Full UI/UX Comprehension and Sandbox-Theme Audit. The post-30B repository hygiene, durable context, dependency stabilization, and performance/scalability pass is complete. UX3 complete. GW9 paused until the sandbox-theme and guided-comprehension track is addressed or explicitly waived. Next recommended prompt: UX4. Do not start GW9, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any further Research World/fractal/multiscale implementation without explicit approval.

## Product Philosophy And Learning Mission

The canonical product philosophy is documented in `PRODUCT_PHILOSOPHY_AND_LEARNING_MISSION.md`. The world is neither perfectly ordered nor merely random. Complex patterns emerge from constrained interactions, feedback, adaptation, stochasticity, and history. ORTUS models are representations for exploration and comparison, not direct copies of reality. Simulation output is evidence about the model’s behavior, not automatically evidence about the world.

Prompt P0 is documentation only. It records ORTUS as an exploratory complex-systems sandbox and reserves future Research World direction without implementing progression, missions, XP, streaks, unlocks, persistent labs, discovery atlases, grand challenges, runtime behavior, templates, UI flows, social systems, accounts, or persistence.

Prompt UX0 is documentation and design planning only. The canonical future visual direction is `ui/LIVING_SYSTEMS_ATLAS_VISUAL_DIRECTION.md`: ORTUS Living Systems Atlas. ORTUS should feel like a living system observed through precise scientific instruments, not a system under tactical command. UX0 does not create World/Lab/Atlas/Workshop routes, tabs, navigation, persistence, discovery logic, behavioral landscapes, CSS tokens, component redesigns, runtime behavior, or dependencies.

Prompt UX1 is documentation only. The canonical existing-interface audit is `ui/EXISTING_DESIGN_TOKEN_AND_COMPONENT_AUDIT.md`. UX1 inventories current source-level tokens, hardcoded values, component families, duplication, accessibility and responsive risks, dependency constraints, future token candidates, and migration waves. It does not modify production CSS or UI components, add tokens, add routes, add dependencies, add font files, or verify rendered accessibility/responsive behavior.

Prompt UX2 is a bounded implementation prompt. The canonical shared visual-semantics source is `ui/LIVING_SYSTEMS_ATLAS_SEMANTIC_TOKEN_FOUNDATION.md`. UX2 establishes shared visual semantics for surfaces, text, borders, interaction states, operational states, evidence states, focus, typography roles, spacing, shape, elevation, motion, and reduced motion. It preserves legacy visual variable aliases and migrates only a small shared primitive set. UX2 establishes shared visual semantics. It does not perform the Research World shell transformation.

Prompt GW0 is documentation and progression architecture only. The canonical Research World progression roadmap is `RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md`. A Research World is a model-bounded investigation context, not a literal game world, complete real-world domain simulation, achievement layer, persistence implementation, or runtime capability. GW0 defines World/Lab/Atlas/Workshop destination responsibilities, progression without XP, Discovery Atlas and Behavioral Landscape boundaries, reusable-asset provenance, expert access, and the sequence now completed through UX3, with GW9 paused until the sandbox-theme and guided-comprehension track is addressed or explicitly waived. It does not implement routes, navigation, persistence, discovery logic, saved behavioral landscapes, contextual guidance, UI/CSS changes, dependencies, assets, runtime behavior, or template behavior.

Prompt GW1 is a bounded implementation prompt. The canonical destination-shell source is `ui/RESEARCH_WORLD_DESTINATION_SHELL.md`. GW1 implements the shared World / Lab / Atlas / Workshop application shell only: `/` remains World, `/builder` remains Workshop, `/lab` began as a future-only Lab informational foundation, and `/atlas` began as a future-only Atlas informational foundation. GW1 persistence refers to persistent application structure across routes, not persistent user research data. It adds no storage, saved experiments, notebooks, reusable assets, Discovery Atlas logic, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Prompt GW1B is an audit and hardening prompt. It verifies the destination shell, route aliases, landmarks, navigation state, skip-link focus, reduced-motion focus smoke, and future-only Lab/Atlas honesty without expanding product behavior.

Prompt GW2 is a bounded World-only implementation prompt. The canonical active-run provenance source is `ui/ACTIVE_RUN_PROVENANCE_AND_OBSERVATION.md`. GW2 adds an Observe-mode active-run context panel that derives live provenance and observation summaries from the existing selected template, active engine, latest snapshot, seed, parameters, scenario metadata, status, speed, and intervention count. It does not create saved experiments, Lab records, Atlas discoveries, notebooks, reusable assets, storage, timestamps, random ids, fingerprints, runtime observability measurement collection, empirical observations, validation, calibration, runtime behavior, template behavior, or Builder execution behavior.

Prompt GW3 is a bounded World-only implementation prompt. The canonical active-intervention source is `ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS.md`. GW3 adds an Intervene-mode readiness and boundary panel that derives live intervention context from existing registered template-owned intervention definitions, target state, active engine presence, and active-run intervention count. It does not create saved interventions, Lab intervention records, Atlas discoveries, behavioral landscapes, storage, timestamps, random ids, fingerprints, new runtime mechanics, template behavior, validation, calibration, real-world causal proof, or Builder execution behavior.

Prompt GW3B is the audit and bounded hardening pass for the GW3 layer. The audit record is `ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS_AUDIT.md`. GW3B hardens current-run intervention entry copy, engine-required readiness coverage, validation-language boundaries, and rendered Intervene assertions. Current-run intervention entries are engine/snapshot state, not saved intervention plans, persistent Lab records, Atlas discoveries, or validation evidence.

Prompt GW4 is the first Atlas-focused implementation prompt. The canonical source is `ui/DISCOVERY_ATLAS_INFORMATION_ARCHITECTURE.md`. GW4 turns `/atlas` into a non-persistent foundation for evidence-state vocabulary and model-investigation information architecture. Atlas maps investigated model behavior; it does not certify discoveries about the real world. GW4 defines unsampled, sampled, unresolved, supported within model, contradicted within model, unsupported, externally unvalidated, and future-only capability semantics. It does not create saved Discovery Atlas records, persistent evidence maps, behavioral landscapes, sampled-region maps backed by run data, Lab records, run history, save/map actions, storage, progression, runtime behavior, template behavior, Builder execution, validation, calibration, or real-world discovery certification.

Prompt GW4B is the audit and bounded hardening pass for the GW4 Atlas foundation. The audit record is `ui/DISCOVERY_ATLAS_INFORMATION_ARCHITECTURE_AUDIT.md`. GW4B keeps sampled evidence unresolved until a future source-backed Atlas record system exists, confirms non-persistence and model-vs-world boundaries, documents the actual browser-zoom limitation, and completes the post-hardening rendered shell/full UI verification gate. It does not add saved records, behavioral landscapes, Lab records, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Prompt GW5 is the first Lab-focused implementation prompt. The canonical source is `ui/LAB_EVIDENCE_RECORD_INFORMATION_ARCHITECTURE.md`. GW5 turns `/lab` into a non-persistent foundation for future Lab evidence-record lifecycle semantics and experiment-ledger information architecture. Lab records will organize evidence about model investigations; they will not certify discoveries about the real world. GW5 defines draft schema, awaiting capture, not persisted, unresolved, model-only, externally unvalidated, comparison-not-implemented, notebook-not-implemented, and future-only capability/evidence semantics. It does not create persistent evidence records, experiment ledgers, notebooks, saved comparisons, run history, Lab-to-Atlas publication, save/send/publish actions, storage, progression, runtime behavior, template behavior, Builder execution, validation, calibration, or real-world discovery certification.

Prompt GW6 is a bounded capability-guidance implementation prompt. The canonical source is `ui/CONTEXTUAL_CAPABILITY_GUIDANCE.md`. GW6 adds static source-backed guidance to World, Workshop, Lab, and Atlas for available, planning-only, not implemented, do-not-assume, and related-destination boundaries. Capability guidance describes current product capability; it does not create capability. It does not create saved records, Atlas discoveries, Lab experiments, behavioral landscapes, progression, generated guidance, persistence, runtime behavior, template behavior, Builder execution, validation, calibration, or real-world discovery certification.

Prompt GW6B audits and hardens contextual capability guidance. The canonical audit record is `ui/CONTEXTUAL_CAPABILITY_GUIDANCE_AUDIT.md`. GW6B resolves the timing-sensitive uncertainty-test timeout, resolves a stale local dev-server rendered-verification blocker, completes focused shell and full UI Playwright/Axe verification, and hardens guidance copy away from advice-system vocabulary. It adds no saved records, Atlas discoveries, Lab experiments, behavioral landscapes, progression, user-derived routing, behavior-derived task ordering, persistence, runtime behavior, template behavior, Builder execution, validation, calibration, dependencies, assets, or fonts.

Prompt GW7 is a bounded Atlas-side implementation prompt. The canonical source is `ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION.md`. GW7 adds behavioral-landscape vocabulary and a text-only conceptual scaffold for parameter space, outcome space, sampled and unsampled areas, model regimes, transition zones, sensitivity zones, and externally unvalidated areas. A behavioral landscape describes how model behavior may vary across model conditions. It is not a real-world map, empirical proof, or Discovery Atlas record. GW7 does not create saved landscapes, sampled-region maps, evidence records, Atlas discoveries, Lab experiments, run sweeps, batch execution, regime detection, progression, persistence, runtime behavior, template behavior, Builder execution, validation, calibration, dependencies, assets, or fonts.

Prompt GW7B is the audit and bounded hardening pass for the GW7 Behavioral Landscape foundation. The canonical audit record is `ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION_AUDIT.md`. GW7B hardens vocabulary, status-semantics, rendered copy, and static-scaffold keyboard boundaries without adding persistent maps, sampled data, run sweeps, regime detection, Atlas discoveries, Lab records, progression, runtime behavior, template behavior, Builder execution, validation, calibration, dependencies, assets, or fonts.

Prompt GW8 is a bounded Atlas-side implementation prompt. The canonical source is `ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION.md`. GW8 adds landscape probe planning vocabulary and a conceptual probe-plan scaffold for probe intent, candidate axes, candidate ranges, candidate outcomes, constraints, sampling intent, planned comparisons, unresolved feasibility, externally unvalidated hypotheses, non-executable plans, and future sampled probes. A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery. GW8 does not create executable probes, saved probe plans, sampled landscapes, run queues, parameter sweeps, batch execution, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, template behavior, Builder execution, validation, calibration, dependencies, assets, or fonts.

Prompt GW8B audits and hardens landscape probe planning. The canonical audit record is `ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION_AUDIT.md`. GW8B hardens the planned-comparison distinction, source/rendered non-execution and non-persistence checks, status semantics, scope-creep search, and zero-Tab-stop scaffold contract without adding executable probes, saved plans, sampled results, run queues, sweeps, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, template behavior, Builder execution, validation, calibration, dependencies, assets, or fonts.

## Brand And Workbench Identity

The sharp ORTUS mark is the primary navigation brand. The soft ORTUS mark is a secondary presentation variant. The primary mark should normally appear beside the text `ORTUS` wordmark in the global app shell; the soft mark is reserved for restrained presentation states such as loading or empty states. Do not use either mark as a simulation-world or Builder-graph watermark. Builder remains an ORTUS workspace, not a separate branded product.

After GW1, the global app shell owns the canonical ORTUS identity and destination navigation. World runtime status and Builder controls remain route-specific surfaces rather than duplicate global headers.

Branding is not evidence of scientific validity. Favicon replacement remains future work until small-size legibility is deliberately optimized. HCI findings must distinguish observed defects, inferred risks, subjective style preferences, and unverified concerns.

## Core Vocabulary

### Model Schema

A ModelSchemaDefinition is a service-level structural artifact with artifact type `ortus.modelSchema`. It declares entity types, component types, attribute types, spaces, parameters, metrics, rule declarations, and artifact references in plain JSON.

Model schemas declare model structure; they do not execute rules or create runnable simulations. A valid model schema is not a template, scenario, RunConfig, or snapshot. Rule declarations are descriptive metadata, not parsed formulas or executable behavior. Active means structurally active, not runtime-executed.

Production templates are hand-built runtime models, not generated from model schemas. Model schemas do not create templates, produce snapshots, generate RunConfigs, power runnable visual model authoring, compile rules, parse formulas, or execute custom simulations. Runtime interpreter/compiler work remains future. External framework interop, validation/calibration, runnable visual model builder support, and generic social-learning runtime outside the narrow Opinion Dynamics behavior mode remain future work.

Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.

Prompt 35 adds bounded model-schema authoring forms inside the existing Builder area. The current draft, last valid imported/exported artifact, validation report, and file-exchange state are local UI state; they do not enter the simulation store or engine. Import/export uses the existing model-schema service, invalid drafts remain editable, and failed imports preserve the current draft.

Model Schema Authoring Forms V1 creates structural model-schema artifacts; it does not execute schemas. Rule declarations authored in the Builder are descriptive only and remain non-executable. A valid authored schema is not a runnable simulation. The schema authoring UI does not generate templates, scenarios, RunConfigs, snapshots, or engines. Prompt 36 Graph View does not read, convert, or mutate the Author Schema draft.

Prompt 35B hardened import size checks, unsafe profiling/persuasion/targeting payload rejection, destructive confirmations, tab semantics, validation announcements, non-text JSON preservation, and medium-width layout behavior. The audit did not add schema execution, compatibility conversion, graph authoring, runtime preview, or simulation-state mutation.

Prompt 36 adds a read-only structural Graph View for a loaded `ortus.visualBuilderWorkspace`. The graph adapter validates and clones the workspace, preserves node/edge ids, statuses, artifact references, markers, warnings, and missing-capability language, and assigns deterministic display coordinates without force simulation. Search, filters, neighborhood highlighting, selection, pan, and zoom remain local presentation state. The visual plane is bounded to 120 nodes and 240 edges; larger artifacts retain a filtered outline and text edge list instead of attempting an unbounded drawing. Author Schema drafts are not converted into workspaces or graph artifacts in V1.

Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges. Graph selection, filtering, panning, and zooming are UI-only state. Graph View is not visual programming, schema execution, or runtime generation. A graph that looks complete is still not a runnable model.

Prompt 36B audits and hardens the Graph View as a structural inspection surface. It keeps marker counts explicit, treats global runtime-boundary notices separately from warning markers, prevents filtered-out inspector connections from masquerading as selectable visible targets, bounds deterministic layout and DOM ids, and preserves text-only metadata. It still does not add graph authoring, node/edge creation, drag/drop, scenario generation, RunConfig generation, template generation, snapshot generation, engine creation, schema execution, or simulation preview. Rendered responsive and accessibility behavior remain source-tested but browser-unverified.

Prompt 37 adds validation UX and bounded repair suggestions to Author Schema. It groups issues by category, exposes severity/counts, links issues back to fields or sections, preserves original validation messages, offers copyable diagnostics, and shows persistent service-only/future-only/runtime-boundary notices. Repair suggestions are structural editing assistance only. They do not make a schema runnable, infer correct model behavior, validate scientific meaning, execute rules, parse formulas, generate templates, scenarios, RunConfigs, snapshots, engines, compatibility conversions, visual-builder workspaces, or activate social-learning runtime. Safe suggestions require explicit clicks, content-removing repairs require confirmation, stale suggestions are rejected, and ambiguous modeling intent remains manual-only.

Prompt 37B audits and hardens repair suggestions before the combined commit. Repair suggestions are structural editing assistance. They do not make a schema runnable. A repaired schema may be structurally valid and still have no runtime implementation. ORTUS does not infer the correct model behavior from validation repairs. Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines. Confirmation-required repairs are enforced by the repair helper, each suggestion exposes whether it can apply, malformed and prototype-like patches are rejected, issue grouping is deterministic, rule repair suggestions state that they do not execute or validate behavior, and export-after-repair remains ordinary model-schema serialization. Browser clipboard behavior, rendered responsive behavior, browser zoom behavior, focus-return behavior, assistive-technology behavior, and WCAG-level readiness remain unverified.

### Knowledge, Memory + Social Learning Semantics

Knowledge, Memory + Social Learning Semantics V1 is a service-level structural artifact family with artifact type `ortus.knowledgeMemorySocialLearningModel`. It describes symbolic knowledge items, belief variables, belief-state descriptors, bounded memory trace descriptors, attention/salience descriptors, trust/source profiles, exposure channels, social signal descriptors, background prior profiles, relationship roles, norm descriptors, and social learning rule descriptors.

Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition. Background profiles are compressed prior descriptors, not simulated life histories. Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals. LLM-per-agent runtime is not implemented and must not be implied.

This artifact family does not execute social learning, update beliefs, update memory, sample exposure, infer real-person traits, support protected-class inference, validate psychology, predict people, optimize persuasion, provide policy targeting, or mutate Opinion Dynamics.

Opinion Dynamics now has a narrow template-owned `socialLearning` behavior mode. Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition. Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template. Opinion values and social-learning metrics are model outputs, not measured human beliefs. Information-source credibility is a model parameter, not a verified truth score. No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.

### Visual Builder Workspace

Visual Builder Workspace V1 is a service-level structural artifact family with artifact type `ortus.visualBuilderWorkspace`. It describes a future visual-builder workspace: workspace identity, referenced model schema and artifact ids, visual nodes, visual edges, panels, sections, validation markers, warning markers, unsupported/future-only markers, layout metadata, selection metadata, viewport metadata, notes, summaries, and validation reports.

Visual builder workspaces are structural planning artifacts; they do not implement runnable visual model authoring. Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior. A valid visual builder workspace does not make a model schema runnable. Prompt 32 does not add drag-and-drop modeling, visual programming, or schema execution.

Prompt 34 adds a dedicated safe UI shell for displaying and inspecting `ortus.visualBuilderWorkspace` artifacts, Prompt 34B audits and hardens that shell plus the simulation workspace information architecture, and Prompt 35 adds a separate structural schema-authoring mode without turning the workspace inspector into an editor. Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges. The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime. A structurally valid workspace is still not a runnable model. Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics. Workspace import also does not replace or activate the separate schema-authoring draft.

Workspace references to model schemas, social-learning semantics, observability, causality, networks, resources, feedback, quantities, control, hybrid compositions, scenarios, or templates are structural references only. They do not generate scenarios, RunConfigs, snapshots, templates, or engines; they do not execute node graphs; they do not add external framework interop; and they do not implement social-learning runtime or LLM agents. Active means structurally active, not runtime-executed. The shell does not add drag-and-drop model construction, arbitrary schema editing, rule editing, formula editing, node/edge execution, compatibility conversion, template mutation, or runtime state mutation.

Builder viewport node and edge controls select read-only structural items for inspection only. They do not execute graph dataflow, activate model schemas, activate compatibility mappings, mutate templates, or mutate simulation runtime state.

### Template/Schema Compatibility Mapping

Template/Schema Compatibility Mapping V1 is a service-level structural artifact family with artifact types `ortus.schemaTemplateCompatibilityReport` and `ortus.templateMappingProfile`. It compares a `ModelSchemaDefinition` against static production-template metadata such as entity kinds, space kind, parameter kinds, metric kinds, behavior-mode metadata, and recognized artifact families.

Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models. Prompt 38 exposes a Schema-to-Template Fit Report panel in Builder Author Schema for the current structurally valid draft only, and Prompt 38B audits/hardens that panel. Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents. Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Rule fits are structural comparisons. Rule declarations are not executed. Fit score is a structural summary, not a runtime readiness score. Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles. Builder graphs remain structural inspection views. Fit reports do not make them executable. Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability. MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report. This fit report may be stale because the schema changed after it was generated. Refresh the report before using it.

Compatibility reports do not execute schemas, parse `ruleDescription`, mutate templates, create engines, generate scenarios, generate RunConfigs, generate snapshots, generate templates, generate agents, run visual builder graphs, infer external framework interop, validate model output, calibrate parameters, prove causality or emergence, prove robustness, estimate strategy effectiveness, or implement social-learning/cognitive runtime. A template mapping profile is a static metadata profile, not a runtime adapter or template support claim. Invalid current drafts do not fall back to a previous valid fit report, and equal-score candidates are ranked deterministically by score, fit label, then template id.

### Scenario Planning From Schema

Scenario Planning From Schema V1 is a Builder Author Schema planning/reporting layer over the current structurally valid schema and current non-stale fit-report context when available. It produces bounded plain-text/data planning reports with candidate scenario questions, conceptual intervention levers, observable metric ideas, parameter families, assumption checks, data/calibration needs, fit-linked template candidates, unsupported/lossy/future-only gaps, claim boundaries, and next modeling steps.

Scenario planning from schema is a planning aid. It does not create runnable scenarios. Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state. Scenario questions are hypotheses to explore, not predictions or validated conclusions. A scenario plan can suggest what to inspect, but it does not prove what will happen. Conceptual interventions describe what a future scenario might vary; they are not executable controls. Suggested metrics describe what to observe if a future runtime exists; they are not empirical measurements. Data needs identify what would be required for calibration or validation; they do not imply the current schema is calibrated. Assumption checks identify what the modeler should clarify. They do not resolve the assumption.

Fit reports describe structural resemblance. Scenario plans describe possible study designs. Neither one makes a schema runnable. Invalid schemas disable planning. Stale fit reports disable planning until refreshed. Prompt 39B also marks existing scenario plans stale when the schema or fit-report source changes, so copied stale reports cannot present old output as current. MR0 roadmap concepts may appear as future-only planning gaps, not implemented scenario capabilities. Neural Strategy Adaptation remains a local Neural Runtime Lab feature, not a generic scenario-planning capability. Blackjack remains offline simulation only in the roadmap; Prompt 39 does not add gambling advice, live casino assistance, wearable input, camera input, or card-counting support. Scenario planning does not provide medical/public-health prediction, weather forecasting, policy recommendation, persuasion optimization, targeting logic, real-human-behavior prediction, or gambling assistance. Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

### Fractal And Multiscale Analysis Roadmap

Prompt F0 is a docs-only mini-roadmap for future fractal and multiscale analysis. It does not implement fractal metrics, fractal spatial generators, Scale Lens UI, network scaling analytics, trajectory motif analytics, template support, primitive support, Builder graph execution, model-schema execution, or runtime behavior.

Measure multiscale structure before generating synthetic fractal structure. Fractal and multiscale tools describe how measured structure changes across scale. They do not prove that a system is fundamentally fractal. A complex-looking, nested, branching, or irregular pattern is not automatically fractal. Power-law behavior may indicate scale-free structure, but a power-law fit alone does not establish fractality. Finite-resolution fractal dimensions are estimators over a chosen scale range, not intrinsic truths about the modeled system. Statistical self-similarity must be supported across an explicit scale range; it should not be inferred from visual resemblance alone. Scale-free distributional evidence is not identical to geometric fractality. Visual resemblance to a fractal is not evidence of scale invariance.

The terminology ladder is exact self-similarity, statistical self-similarity, scale-free behavior, multiscale structure, hierarchical or recursive structure, then visual fractal appearance. ORTUS must not collapse that ladder into one vague "fractal" label.

Future F1 Fractal Metrics V1 should measure bounded structural summaries over supported simulation outputs such as 2D occupancy masks, agent-position rasterizations, activation footprints, scalar-field threshold masks if a field template exists, and cluster boundaries. It may later report box-counting dimension estimates, lacunarity, occupied-cell fraction by scale, boundary roughness estimates, cluster-size distribution summaries, scale-similarity summaries, supported scale ranges, fit quality/residual summaries, and sample-size/resolution warnings. Fractal metrics are structural summaries of simulation output. They are not proof of biological, ecological, social, meteorological, or empirical validity.

Future F2 Fractal Spatial Generators V1 is a synthetic initialization branch only. Fractal spatial generators create synthetic structure. They do not reproduce real geography, ecology, urban form, climate, terrain, or weather without calibration and validation. Synthetic fractal generators create model inputs, not observed reality.

Future F3 Scale Lens / Coarse-Graining V1 should distinguish visual zoom, spatial resampling, aggregation, coarse-graining, and model reduction. Coarse-graining changes what is represented. Similar aggregate behavior does not mean the underlying microstates are equivalent. Coarse-graining may discard information and alter apparent dynamics. Scale Lens views are analytical projections, not separate validated models.

Future F4 Network Scaling Metrics V1 should distinguish network scaling evidence from ordinary network summary plots. A scale-free degree distribution is not the same as a fractal network. A hierarchical community structure is not automatically self-similar. Network fractality requires a defined network-scale method and evidence across a supported scale range.

Future F5 Hierarchical Trajectory Motif Analytics V1 must remain about bounded observable state-action sequences. Hierarchical trajectory motifs describe repeated observable state-action sequences. They do not reveal thoughts, intentions, beliefs, personality, or subconscious mental states. Repeated motifs across time windows are not automatically evidence of temporal fractality.

Fractal analysis requires a defined object, scale operation, and measurement. ORTUS must not apply one generic fractal score to unrelated spatial, network, temporal, and trajectory data. Clustering groups similar observations. Fractal analysis measures how structure changes across scale. One does not imply the other. Fractal and multiscale metrics are structural summaries, not causal explanations, forecasts, validation results, or proof of universal laws.

### Template

A template is a model family definition. It defines the engine-facing model contract: space type, entity and agent archetypes, parameter definitions, metrics, visual mappings, initialization presets, scenario variant metadata, behavior modes, interventions, assumptions, limitations, and capabilities. A template is not a single saved run; it is the reusable model family from which runs are created.

Templates own domain behavior. Template-specific rules should live in template systems, initialization hooks, intervention definitions, or future template-owned behavior-mode implementations, not in React components.

Production templates expose formal metadata through the `SimulationTemplate` shape: capability flags, `spaceDefinition`, `entityTypeDefinitions`, `parameterDefinitions`, formal metric metadata, documentation, initialization presets, behavior modes, agent composition definitions, environment option definitions, and engine factory hooks such as `createInitialWorld`, `registerSystems`, and `registerMetrics`.

Forest Fire / Landscape Spread is a production template, not a generic spatial-field runtime. It is an abstract local-spread grid model for qualitative spread, threshold, fragmentation, and emergence exploration. It is not a wildfire predictor, does not use GIS, real terrain, wind, humidity, weather, suppression, firefighting, or calibrated fire probabilities, and its grid coordinates are not SpatialFieldModel runtime support. Its template-owned boundary mode is not BoundaryEnvironmentModel runtime support.

Neural Excitation Network is a production template, not a biological brain simulation, cognitive model, clinical model, or generic graph runtime. Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation. Activation is a model variable, not measured membrane voltage. Synapse weights are abstract influence strengths, not biological synaptic measurements. The model does not simulate ion channels, neurotransmitters, morphology, learning, consciousness, or cognition. This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable. Outputs are model behavior, not neuroscience evidence.

Decision Readout V1 maps labeled output assemblies to bounded categorical choices. It is not cognition or reasoning. Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network. Template RPS payoff is observational and does not train, optimize, mutate synapses, or update biological/plasticity fields. The model does not infer intentions, beliefs, preferences, personality, or human decision-making. The RPS readout preset is a bounded demonstration of output-group activation and observational payoff, not semantic understanding, biological learning, persuasion, or human decision simulation.

Neural Runtime Lab UX V1 is a scenario-guided workbench panel for that template, not generic runtime semantics. Prompt N2 adds Neural Strategy Adaptation V1 only to the lab's Rock-Paper-Scissors readout mode, and Prompt N2B audits/hardens it. Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference. The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time. Learned strategy state is local model state, not a psychological profile. Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning. It uses bounded local choice history, frequency/transition statistics, deterministic exploration, rolling win/draw/loss metrics, and bounded readout-bias/stimulus adjustment. Prompt N2B adds round-index reset guards so old bounded history cannot rehydrate learned state or suppress new rounds after reset, keeps round numbering monotonic after truncation, and filters malformed rounds before statistics. It does not persist a user profile, infer beliefs/intentions/preferences/personality, update core synapse weights, make Builder graphs executable, make model schemas runnable, or validate any biological/cognitive claim. Prompt NUX1B fixes production buildability by removing build-time remote font fetches. Rendered responsive, zoom, keyboard walkthrough, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified unless directly tested.

Prompt MR0 adds a documentation-only mini-roadmap for future template and decision-cluster work. It does not implement runtime behavior, UI behavior, templates, primitives, external-stimulus runtime, blackjack logic, or observed cluster discovery. Decision clusters model observable state-action patterns, not thoughts. Prediction outputs are probabilities, not certainties. Cluster labels are assigned modeling labels, not meanings understood by the system. External stimuli are modeled inputs, not evidence of internal mental state. Observed clusters are analytical groupings, not psychological profiles. Blackjack work is offline simulation only, not gambling advice, live casino assistance, or wearable card-counting support. Do not use wearable devices, camera input, or software assistance for live casino play.

Forest-fire runtime optimizations are implementation details inside that template: cached grid-neighbor indices, compact per-tick state arrays, active burning-cell indices, changed-component updates, and current state-count globals for metrics. They do not add SpatialFieldModel runtime support, BoundaryEnvironmentModel runtime support, wildfire prediction, or calibrated fire behavior. Snapshot creation, render-model preparation, and UI publication remain separate runtime costs.

### Scenario

A scenario is an initial-condition and model-variant recipe for starting a fresh run. It contains a seed, validated parameters, initialization preset/options, agent composition, behavior mode, environment options, metadata, and notes. Applying a scenario creates a fresh engine instance at tick 0.

A scenario does not normally contain live post-run state, metric history, applied intervention history, or serialized world/component/space state. Scenario Builder previews also use temporary tick-0 engines, not the active run.

Scenario JSON uses the `ortus.scenario` artifact type, is size-bounded, rejects unknown top-level fields, and rejects metadata that embeds snapshot-like live run state such as world, component, space, RNG, event, metric-history, or intervention-history blobs. Imported scenario template-version mismatches produce warnings and are validated against the current registered template before they can be applied.

### Run

A run is one execution of a template/scenario/run configuration with a specific seed and parameter set. A run may be driven interactively, created from a scenario, produced as one trial in an experiment, or restored from a snapshot.

### RunConfig

A RunConfig is the normalized recipe needed to start a fresh run. It contains a template id, seed, parameters, optional scenario id/name, initialization preset/options, agent composition, behavior mode, environment options, optional uncertainty config metadata for ensemble setup, and metadata.

RunConfig is not a snapshot and not a run summary. It is the common fresh-run input for scenarios, experiments, and uncertainty sampling.

### Snapshot

A snapshot is exact saved simulation state at a specific tick. It includes enough state to restore deterministic continuation, such as the world, component stores, spaces, scheduled events, RNG streams, metrics history, and snapshot metadata.

Snapshots are for restoring a running state. They are not scenario recipes and should not be used as bounded comparison summaries.

### Run Summary

A run summary is a bounded outcome artifact for comparison. It records metadata, seed, parameters, final metrics, optional bounded metric traces, and bounded intervention summaries. It does not normally store full simulation state.

Run summaries are local comparison workspace data, not authoritative engine state and not snapshots.

### Experiment

An experiment is a batch of runs across controlled variations. V1 varies parameters and seeds while creating fresh engine instances through the template registry. Uncertainty Layer V1 adds a headless ensemble service that generates deterministic concrete RunConfigs from a base RunConfig plus uncertainty assumptions; the interactive Experiment Runner UI can call that service later without owning sampling logic.

### Intervention

An intervention is a deterministic perturbation applied during a run. It is template-defined, validated, and executed through the headless intervention executor or engine command APIs. UI and canvas code may collect targets, but they should not mutate agents, components, spaces, or engine internals.

GW3 intervention readiness is a live World UI summary of existing template-owned controls and current target readiness. GW3B audits and hardens that summary without changing runtime behavior. Current-run intervention entries are engine/snapshot state, not saved intervention plans or persistent Lab records. Intervention readiness is not a saved intervention plan, experiment record, Lab artifact, Atlas discovery, policy recommendation, validation result, or proof that an intervention would work in the real system.

### Atlas Foundation

The GW4 Atlas foundation is a non-persistent route-level information architecture for future evidence about investigated model behavior.

Atlas evidence states are interpretive vocabulary, not stored evidence records. `Unsampled` means no source-backed model-space sample is attached. `Sampled` means future source-backed model-run evidence exists inside model space, not that the real world has been validated. `Supported within model`, `contradicted within model`, `unsupported`, and `externally unvalidated` describe evidence status inside explicit boundaries; they are not operational success, route availability, empirical proof, or real-world discovery certification.

The GW4 conceptual Atlas scaffold is labeled as not run data. It is not a parameter-space map, heatmap, contour, sampled-region display, Discovery Atlas record, saved behavioral landscape, evidence score, run history, or Lab record.

The GW7 Behavioral Landscape foundation is a non-persistent vocabulary layer for model-space exploration. It distinguishes parameter space, outcome space, sampled and unsampled areas, model regimes, transition zones, sensitivity zones, and externally unvalidated areas. Conceptual landscape anatomy is not sampled run data, and a future sampled landscape would still describe model behavior rather than empirical truth.

The GW8 Landscape Probe Planning foundation is a non-persistent vocabulary layer for framing future model-space investigations. It distinguishes probe intent, candidate axes, candidate ranges, candidate outcomes, constraints, sampling intent, planned comparisons, unresolved feasibility, externally unvalidated hypotheses, non-executable plans, and future sampled probes. A conceptual probe plan is not executable, not saved, not a run queue, not sampled output, not a Lab record, and not an Atlas discovery. A planned comparison is not a comparison result.

### Behavior Mode

A behavior mode is a template-defined rule variant. Unsupported modes must be rejected. Scenario Builder may select supported modes, but it is not a no-code rule editor.

Behavior modes are template-defined rule variants. They are not arbitrary user-authored rules. Full custom rule authoring will require the future Model Definition Schema, Rule Primitive Library, Model Compiler, and Visual Model Builder.

Scenario Builder is not a full model/rule editor. Custom model authoring will require the future Model Definition Schema, Rule Primitive Library, Model Compiler, and Visual Model Builder.

### Agent Composition

Agent composition describes the initial mix, count, groups, or types of agents/entities for a scenario. It is validated using template-defined parameter definitions and may map to existing model parameters.

Agent composition defines the initial mix of agents, groups, or types for a run. It should not be confused with live engine state or snapshots.

Flocking currently includes a `groupAware` behavior mode. In that mode, initialized boid groups weigh same-group neighbors more strongly for alignment and cohesion while separation still avoids all nearby boids. Ring Formation is an initialization preset only unless an orbit behavior mode is selected. Initial circular placement does not guarantee persistent circular motion.

Current limitations are intentional: most production templates expose only `default` behavior mode, composition fields are still template-owned parameter definitions rather than a standalone model-builder schema, and no user-authored rule graph exists. `groupAware` reuses the same boid neighbor summaries as classic flocking. The flocking implementation may use a deterministic spatial hash for local-radius neighbor queries, but that is a runtime optimization detail, not a new modeling primitive or evidence of spatial-field support.

### Uncertainty Config

An uncertainty config is a plain JSON sampling recipe attached to a RunConfig or ensemble setup. It describes uncertain variables, target fields, a deterministic sampler seed, sample count, output metrics, and notes about assumptions. It is not a scenario, snapshot, run summary, or live engine state.

Uncertainty Layer V1 supports fixed values, continuous uniform ranges, integer ranges, categorical options, and explicit seed ensembles. It prioritizes parameter and seed uncertainty and can safely target template-defined agent composition, environment options, initialization options, or behavior mode only when validation proves the target exists and the sampled values are supported.

An uncertainty ensemble is generated from a base RunConfig plus an uncertainty config. Generated runs are ordinary deterministic RunConfigs with concrete values; unresolved distributions are not carried into generated runs except as provenance metadata. Result sets store final metric summaries and per-run final metrics, not snapshots or full metric history by default.

`baseSeed` is the sampler seed: it controls sampled assumption values. A seed uncertainty variable changes generated run seeds. For `seedEnsemble`, `sampleCount` is the total number of generated samples; explicit seeds are used in declared order and cycle if `sampleCount` exceeds the seed list. Duplicate seeds are retained intentionally, which can be useful for explicit repeated-run provenance.

When a sampled parameter also appears in template-defined agent composition, environment options, or initialization options, V1 synchronizes that overlapping field before RunConfig validation so one sampled value cannot be immediately overwritten by variant defaults. Generated run metadata records `syncedTargetPaths` for this behavior. This is a compatibility bridge for the current parameter-definition-based composition schema, not a general arbitrary nested-object mutation system.

Uncertainty ranges in ORTUS are assumptions unless calibrated against data. Ensemble results show behavior across the specified assumptions; they do not prove real-world probabilities.

Uncertainty Layer V1 does not implement Bayesian calibration, MCMC, data assimilation, full sensitivity analysis, or scenario discovery. Those require later validation, observation, and calibration phases.

Uncertainty Layer V1 is service-first. It supports deterministic ensemble generation and summary statistics, but it is not yet a full uncertainty workbench, calibration system, or sensitivity-analysis dashboard.

There is no dedicated UI panel yet, no time-series envelope export, no grid or Latin-hypercube sampler, and no confidence-interval claim. Percentiles such as p05 and p95 are summaries across user-specified samples, not real-world probability bands.

### Assumptions, Limits + Ethics

Every ORTUS model is an abstraction. The Assumptions, Limits + Ethics panel shows what the model includes, what it excludes, and what uses would be misleading without validation.

An assumption profile is structured plain metadata owned by a template, scenario, uncertainty config, run, or result. For production templates it includes assumptions, limitations, not represented fields, appropriate use, inappropriate use, ethics notes, validation status, and validation notes. Assumption profiles are not simulation state and do not affect engine dynamics.

Validation status describes evidence about the model, not truth about the real world. A model marked internally tested has passed software and invariant checks; it has not necessarily been calibrated or externally validated.

Scenario-specific assumption notes may be saved with scenario JSON, but they do not silently overwrite the template profile. Assumption summaries combine template assumptions plus scenario notes; the current compact UI panel shows the active template profile only, while richer scenario-note editing and display remain future workspace work. Applying a scenario preserves lightweight assumption provenance in run metadata rather than copying large profiles into every run.

Uncertainty variable notes are treated as assumption notes by service-level summary helpers. The compact Assumptions panel does not yet act as an uncertainty workbench. Uncertainty ranges are user-specified assumptions unless calibrated against data, and p05/p95 summaries are sample percentiles rather than real-world probability intervals.

Assumption profile export/import is currently service-level through `ortus.assumptionProfile` serialization helpers. There is no dedicated assumption-profile export button in the UI yet, and assumption profile artifacts are distinct from scenario, snapshot, uncertainty config/result, and run-summary artifacts.

The Assumptions, Limits + Ethics layer is a modeling-transparency layer. It is not a legal/compliance system, not a prediction-certification system, and not a blocking warning modal.

### Networks + Relations

Network primitives represent relational structure inside a model. A network can describe who is connected to whom, but it does not by itself prove causal influence or real-world social structure.

Prompt 15 adds service-level network primitives. Full visual network editing, network-based behavior modes, and hybrid models require later model schema, rule primitive, and visual builder phases.

The headless network layer defines plain JSON network definitions with nodes, directed or undirected edges, optional weights, relation types, and metadata. V1 supports deterministic synthetic generators for empty, complete, random Erdos-Renyi, and ring networks. Random generation uses seeded `RandomService`; ring and complete generation are deterministic without RNG dependence.

Network definitions are bounded to 500 nodes, 20,000 edges, 200 relation types, and bounded metadata/JSON payloads. A network-level `directed` flag supplies the default directedness for edges; an edge-level `directed` value or relation-type directed default can make a specific relation directed. Multiple edges between the same node pair are rejected unless they represent distinct relation types. Query helpers treat `getNeighbors` as incident-neighbor lookup, while `getOutgoingNeighbors` and `getIncomingNeighbors` expose direction-sensitive traversal.

V1 network metrics include node count, edge count, density, average degree, min/max degree, weak connected component count, and largest component size. Directed graph component metrics are reported as weak components. These are structural summaries only; they are not causal evidence or validation against real relational data. Expensive all-pairs path metrics, graph layout, centrality dashboards, network uncertainty, and graph editing are intentionally deferred.

Neural Excitation Network is the only current production template that claims runtime network support, and that support is limited to its template-owned runtime `NetworkSpace` synapses. `supportsNetworkOptions` remains false because fresh-run network artifact wiring is not implemented. Its optional Decision Readout V1 is template-local readout state, not a global decision-support primitive and not evidence that Builder graphs, model-schema graphs, network artifacts, or social-learning artifacts execute. Other production templates do not claim network runtime support; their `supportsNetworkSpace` and `supportsNetworkMetrics` flags remain false until a template actually uses relational topology in initialization or runtime behavior. Epidemic and Opinion are future candidates for contact/influence networks, Predator-Prey is a future candidate for food-web relations, and Schelling/Flocking remain spatial/grid-first in V1.

RunConfig and scenario JSON do not yet include `networkOptions` or inline network definitions. Future network-capable templates should add those fields behind explicit capability flags and validate them through the headless network services. Uncertainty target validation does not treat network generator options as active V1 targets; network uncertainty is future work.

### Resources, Stocks + Flows

Resource, stock, and flow primitives represent quantities and movement of quantities inside a model. They do not by themselves prove real-world economic, ecological, or health outcomes.

Prompt 16 adds service-level resource/stock/flow primitives. Full visual stock-flow editing, feedback loops, delayed flows, and hybrid resource-network models require later model schema, rule primitive, feedback, and visual builder phases.

The headless resource layer defines plain JSON resource definitions, stock definitions, flow definitions, stock states, bounded ledgers, metrics, and serialization artifacts. Current bounds are 200 resources, 1,000 stocks, 1,000 flows, 1,000 ledger entries, and bounded JSON/metadata payloads. A resource is something that can be produced, consumed, stored, depleted, transferred, regenerated, or constrained. A stock is a quantity of a resource held by a system, agent, group, region, or environment. A flow is a deterministic per-tick movement or change in stock.

Stock ownership is descriptive metadata in V1: `ownerType` and `ownerId` say who holds a stock, but they do not bind the stock to live engine entities unless a future template explicitly does so. Stock bounds use the most restrictive applicable upper bound across resource max, stock max, and stock capacity. Minimums default to zero unless the resource or stock explicitly allows negative values.

Supported V1 operations are constant-rate `produce`, `consume`, `transfer`, `regenerate`, `decay`, and `deplete`. `produce` and `regenerate` require a target stock and add up to capacity/max. `consume`, `decay`, and `deplete` require a source stock and remove down to min/zero unless negatives are allowed. `transfer` requires source and target stocks with the same resource id and is constrained by both source availability and target capacity. In V1, `decay` and `deplete` intentionally share the same constant-rate removal mechanics; they are separate flow types so future templates can give them distinct semantics without changing artifact shape.

Operations clamp against stock minimums, maximums, and capacities, return deterministic flow results and warnings, and do not mutate their input state. Arbitrary equations, feedback loops, delayed flows, external data assimilation, and user-authored formula execution are intentionally not supported.

V1 resource metrics include resource count, stock count, flow count, total stock by resource, min/max stock value, depleted stock count, over-capacity stock count, total requested/applied flow by resource, net flow by resource, insufficient-stock flow count, and clamped-flow count. These are bounded structural summaries, not predictive evidence.

Current production templates do not claim resource, stock, flow, or resource-metric runtime support. Their `supportsResources`, `supportsStocks`, `supportsFlows`, and `supportsResourceMetrics` flags remain false until a template actually uses these primitives. Predator-Prey may later use energy, food, grass, or habitat resources; Epidemic may later use hospital capacity, medication supply, or staffing capacity; Opinion may later use attention, trust, or media-resource abstractions.

RunConfig and scenario JSON do not yet include `resourceOptions` or inline resource-system definitions. Future resource-capable templates should add those fields behind explicit capability flags and validate them through the headless resource services. Resource uncertainty and network-resource hybrid flows, such as supply chains, transportation networks, resource diffusion, and capacity-constrained networks, are future work.

### Feedback Loops, Delays + Events

Feedback, delay, and event primitives represent model structure. They do not by themselves prove causal relationships, real-world feedback loops, or predictive validity.

Prompt 17 adds service-level feedback/delay/event primitives. Full visual feedback-loop editing, delayed resource/network dynamics, and causal validation require later model schema, rule primitive, validation, and visual builder phases.

The headless feedback layer defines plain JSON scheduled events, delay queue items, feedback loop definitions, event application results, feedback application results, metrics, and serialization artifacts. V1 artifact types are `ortus.eventSchedule`, `ortus.delayQueue`, `ortus.feedbackLoops`, and `ortus.feedbackEventMetrics`. Current bounds are 1,000 scheduled events, 1,000 delay queue items, 500 feedback loops, 1,000 ledger entries, and bounded JSON/payload sizes.

Scheduled events are discrete tick-labeled records sorted deterministically by tick, priority, and id. Release helpers return due events with `tick <= requestedTick` and remove them from the returned queue; exact-tick lookup is available through query helpers. Event application results summarize caller decisions but do not execute payloads or mutate engine state in V1. Delays schedule bounded plain-JSON payloads for `releaseTick = scheduledAtTick + delayTicks`; delay release helpers return due items with `releaseTick <= requestedTick`, while exact release-tick lookup is available through query helpers. Feedback loops are metadata-declared as `reinforcing`, `balancing`, or `unknown`; V1 classification is declared metadata, not causal inference.

Supported V1 feedback math is intentionally narrow: `requestedAdjustment = signalValue * gain`, followed by optional clamp min/max. Signal values are caller-provided finite numbers from safe sources; ORTUS does not accept arbitrary equations, expression parsers, executable formulas, causal discovery, or control optimization in this layer. A loop `delayTicks` value is bounded metadata for future scheduling; templates must explicitly use the delay helpers if they want delayed feedback.

V1 metrics include scheduled and released event counts, delay queue size, released delay item count, feedback loop counts by type, enabled loop count, average/max delay ticks, ledger counts, events by type, delays by type, feedback adjustments by target, and clamped feedback count. These are bounded structural and operational summaries, not causal strength metrics.

Current production templates do not claim event, delay, feedback-loop, or feedback-metric runtime support. Their `supportsEvents`, `supportsDelays`, `supportsFeedbackLoops`, and `supportsFeedbackMetrics` flags remain false until a template actually uses these primitives. Epidemic may later use delayed recovery/policy effects, Predator-Prey may later use delayed resource regeneration and population feedback, Opinion may later use media feedback cycles, Schelling may later use institutional response delays, and Flocking may later use delayed perception/control feedback.

RunConfig and scenario JSON do not yet include `eventScheduleOptions`, `delayOptions`, or `feedbackLoopOptions`. Future feedback-capable templates should add those fields behind explicit capability flags and validate them through the headless feedback services. Feedback targets for resource flows, network diffusion, event timing, gain, and delay uncertainty are future work; Prompt 17 does not wire those concepts into runtime dynamics.

### Current Capability Vs Reserved Future Capability

Currently implemented as service-first primitives or UI-only structural report layers: networks/relations, resources/stocks/flows, feedback/delays/events, uncertainty, assumptions/limits/ethics, hybrid composition, multi-scale structure, scale view state, boundaries/environment, spatial fields/environmental layers, observability/measurement models, causal assumption/influence models, units/dimensions/quantity semantics, emergence/pattern descriptors, robustness/resilience/stress-test semantics, strategy/control/intervention semantics, model schema declarations, knowledge/memory/social-learning semantics, visual builder workspace schemas, template/schema compatibility mapping, and scenario planning from schema.

Currently not implemented: true multi-scale runtime, scale-aware renderer/UI, Scale Lens / Coarse-Graining, fractal metrics, fractal spatial generators, network scaling analytics, hierarchical trajectory motif analytics, runtime observability measurement collection, runtime causal influence execution, runtime emergence detection, runtime robustness/resilience stress testing, runtime strategy/control execution, model schema runtime execution, model schema compiler/interpreter runtime, schema-to-template conversion, compatibility-based runtime execution, scenario/RunConfig/snapshot/template/engine/agent/code generation from scenario plans, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, LLM-per-agent runtime, real-person inference, protected-class inference, causal discovery/proof/inference/do-calculus/intervention optimization, runtime spatial-field sampling/diffusion/advection, runtime unit enforcement, automatic unit conversion, dimensional equation solving, multi-rate time, adaptive agents, heterogeneity layer, phase transition tools, trace inspection, error budgets, runnable visual model builder, graph editor UI, drag-and-drop model execution, visual programming, calibration/data assimilation/MCMC, and external framework interop.

Service-first primitives are foundations, not active model behavior. A template should not claim support for a primitive until its runtime actually uses that primitive.

Zooming the camera is not the same as multi-scale modeling. Multi-scale ORTUS models will require explicit scale levels, aggregation rules, disaggregation rules, cross-scale coupling, and warnings when detail is synthetic or lost.

Model state is not the same as observable reality. Observability V1 distinguishes internal simulated state and runtime metrics from measured, partial, noisy, proxy, synthetic, or empirical observation definitions, but it does not execute measurement, calibration, validation, inference, or data assimilation.

Runtime metrics are model outputs; they are not automatically empirical observations.

An observability model defines how something could be measured; it does not collect, calibrate, or validate data.

Synthetic observations are generated or declared model-side; they must not be treated as observed evidence.

Empirical measurements need provenance to be trustworthy. Active measurements, schedules, and measurement processes are structural declarations, not runtime-executed data collection. Current templates do not runtime-support observability, and existing uncertainty summaries are not observations. Validation/calibration remains future work.

Relations, feedback loops, and events can encode model assumptions, but they do not by themselves prove causal relationships in the real world.

Causal Assumptions + Influence Structure V1 is a headless structural service for declaring variables, influence edges, assumptions, evidence items, and intervention relevance. Causal assumption models declare influence assumptions; they do not prove causality. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves. Active causal influences are structural declarations, not runtime-executed behavior. V1 does not discover causality, run do-calculus, perform inference, solve structural equations, optimize interventions, calibrate, validate, or make current templates causal-assumption-aware.

Units, Dimensions + Quantity Semantics V1 is a headless structural service for declaring dimensions, units, quantities, ranges, and compatibility rules. It does not enforce runtime units, automatically convert values, solve equations, run symbolic algebra, calibrate, validate, or make current templates quantity-aware. Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics. Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency. Per-tick rates are model-time rates unless a physical time mapping is explicitly defined. Observability measurement units do not imply measurement validity, and causal unit consistency does not imply causal proof.

Emergence Detection + Pattern Descriptors V1 is a headless structural service for declaring candidate patterns, signatures, thresholds, time windows, variables, and scale links. It does not detect patterns at runtime, compute over snapshots or metric histories, prove emergence, perform statistical significance testing, run ML clustering/anomaly detection, validate model output against reality, or make current templates emergence-aware. Emergence pattern descriptors describe candidate patterns; they do not prove emergence. Visual patterns and runtime metrics are model outputs, not empirical proof of emergence. Active pattern descriptors are structural declarations, not runtime-detected results. Multi-scale structure does not prove emergence, causal assumptions do not prove emergence, and quantity consistency does not prove emergence.

Robustness, Resilience + Stress Testing Semantics V1 is a headless structural service for declaring stressors, response criteria, failure modes, and stress-test plans. It does not execute stress tests at runtime, perturb active simulations, prove robustness or resilience, perform statistical validation, certify safety or operational readiness, or make current templates robustness-aware. Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient. Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations. Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves. Existing interventions are not general stress testing unless explicitly modeled and evaluated. Validation/calibration remains future work.

Strategy, Control + Intervention Semantics V1 is a headless structural service for declaring strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, and expected effects. It does not execute strategies at runtime, execute template interventions, run closed-loop control, optimize policies, prove intervention effectiveness, estimate treatment effects, certify safety or operational readiness, or make current templates strategy/control-aware. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops. Runtime metrics are model outputs, not empirical strategy evidence. Causal assumptions do not prove intervention effects, robustness descriptors do not prove strategy robustness, and uncertainty ensembles are not policy validation by themselves. Validation/calibration remains future work.

Prompt 18 reserves these missing pillars in `docs/roadmap.md` and `docs/missing-pillars.md`. Prompt 19 adds `src/simulation/registry` as the unified systems primitive registry and capability map.

The Systems Primitive Registry is the source of truth for current vs reserved capabilities, artifact families, and template capability summaries. Global service availability is not template support. A primitive can exist as a headless service without making templates runtime-capable; only explicitly wired and tested template slices may claim runtime support.

Reserved primitives are roadmap commitments, not implemented behavior. Runtime-active support must only be claimed when a template actually uses the primitive. Prompt 20 should use the registry for hybrid composition planning rather than inferring support from docs or service modules alone.

The registry does not change runtime behavior by itself. Neural Excitation uses its own runtime network graph; no current template runtime uses resource/stock/flow services or feedback/event/delay services.

### Hybrid Model Composition

Hybrid Model Composition V1 is a headless structural description of intended primitive combinations. It can reference a base template and attach primitive artifact references or bounded inline service artifacts where validation is already available.

Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented.

Attaching a primitive artifact to a composition does not automatically make a template use that primitive. Composition validation reports missing capabilities when, for example, a composition requires network runtime behavior from a template that only has global network services available.

V1 does not execute custom hybrid models, compile model schemas, evaluate formulas, perform causal discovery, or turn service-only primitives into template runtime behavior.

Hybrid compositions may reference template/schema compatibility reports and template mapping profiles structurally. Those attachments do not make a composition runnable and do not satisfy model schema execution, visual builder runtime, conversion, generation, validation, calibration, external interop, or social-learning runtime capabilities.

### Multi-Scale Systems Architecture

Multi-Scale Systems Architecture V1 is a headless structural description of model-scale levels and relationships. It can define micro/meso/macro or custom scale levels, entity types, aggregation rules, disaggregation rules, and cross-scale links.

Camera zoom is not multi-scale modeling. Camera zoom changes visual scale; model-scale representation requires explicit scale levels, aggregation rules, disaggregation rules, cross-scale links, and warnings when detail is lost or synthetic.

Aggregation can lose information, and disaggregation can create synthetic detail. Synthetic detail must not be treated as observed or already modeled detail.

A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics. V1 scale rules are not executable, current templates do not runtime-use multi-scale services, and runtime compiler/interpreter work remains future.

### Scale View State

Multi-Scale Zoom + View System V1 is a headless view-state service for navigating explicit scale levels in a `MultiScaleModel`. It can derive zoom-in and zoom-out transitions from aggregation rules, disaggregation rules, and cross-scale links.

Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.

Scale transitions in V1 do not execute aggregation or disaggregation rules. They only update structural view state, retain visual camera metadata, and carry information-loss or synthetic-detail warnings.

A scale view state can navigate a scale model, but it does not make a template multi-scale capable. Current templates do not runtime-use scale view state, and runtime compiler/interpreter work remains future.

### Boundaries + Environment

Boundaries + Environment Layer V1 is a headless structural service for declaring what is inside a model, what remains outside it, and which exchanges, external forcings, or exogenous shocks are represented as assumptions.

Active boundary exchanges are structural declarations, not runtime-executed flows.

World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model.

A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open. V1 does not execute exchanges, forcings, shocks, or spatial fields, and does not make current templates boundary/environment aware. Closed/open contradictions are surfaced as warnings for review.

### Spatial Fields + Environmental Layers

Spatial Fields + Environmental Layers V1 is a headless structural service for declaring coordinate spaces, field definitions, environmental layers, and sampling rules.

Spatial fields are structural layer definitions, not runtime diffusion or GIS engines.

World coordinates, grids, and positions are not the same as explicit environmental field layers.

A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.

V1 does not execute diffusion, interpolation, advection, field sampling, terrain rendering, agent-field coupling, resource-field coupling, or boundary exchange coupling. Active fields, layers, and sampling rules are structural declarations only. Measured fields require provenance to be trustworthy, and synthetic fields must not be treated as observed detail. Boundary models and field layers are related but distinct: a boundary model declares model scope and exchanges, while a field layer declares spatial/environmental context. Current templates do not runtime-support spatial fields. Prompt 25 adds Observability + Measurement Model V1 as structural measurement metadata, and runtime compiler/interpreter work remains future.

## Template Definition Metadata

Template metadata is intentionally declarative. It documents model-family capability and setup contracts without becoming a separate model compiler.

- Capability flags say which ORTUS workspaces a template currently supports and explicitly mark unsupported future concepts, such as resources, stock-flow behavior, or network space, as false. `supportsUncertaintyConfig` is true for current templates because Uncertainty Layer V1 can sample their validated RunConfig inputs.
- Space definitions identify whether a template uses `continuous2d`, `grid2d`, future `network`, or future `hybrid` spaces.
- Entity type definitions describe the agent/entity categories users should reason about. They may map to entity archetypes, component states, or cell states, depending on the current template.
- Metric definitions describe metric id/key, label, description, numeric type, optional range/unit/display metadata, history support, comparability across runs, and source.
- Structured assumption profiles and legacy documentation fields describe the model boundary so templates do not imply predictive scope they do not have.
- Network primitives are service-level relational artifacts until a template explicitly declares network support and uses them.
- Resource, stock, and flow primitives are service-level quantity artifacts until a template explicitly declares support and uses them.
- Feedback, delay, and event primitives are service-level timing and loop artifacts until a template explicitly declares support and uses them.

## Lifecycle

```text
TemplateDefinition
  + Scenario / RunConfig
  + Seeded RNG
  -> Fresh engine instance
  -> Snapshots + metrics + events
  -> Run summaries / experiments / uncertainty summaries / network summaries / comparison
```

Operationally:

1. A template defines the model family and capabilities.
2. A scenario or run config selects initial conditions and supported variants.
3. A seeded RNG makes initialization and stochastic behavior deterministic.
4. A fresh engine instance runs the model.
5. Snapshots preserve exact run state for restore.
6. Metrics, events, and intervention history describe what happened during the run.
7. Run summaries, experiment result sets, and uncertainty result sets compare outcomes without storing full world state by default.

## Current Architecture Boundaries

- `src/simulation` is headless and should not import React, Zustand, DOM APIs, Canvas APIs, or browser storage.
- Template logic lives in templates and template-owned extension points, not in UI components.
- Scenario logic in `src/simulation/scenarios` validates and builds recipes; browser persistence lives in `src/lib/localScenarioStorage.ts`.
- Experiment logic creates fresh engines from template APIs and should not treat React state as the source of truth.
- Uncertainty sampling in `src/simulation/uncertainty` validates plain JSON configs, uses seeded RNG streams, and generates concrete RunConfigs without mutating templates, base configs, active engines, browser storage, or UI state.
- Network services in `src/simulation/networks` validate, generate, query, summarize, and serialize relational structures without importing React, browser APIs, or active engine state.
- The comparison workspace consumes snapshots, metrics, metadata, and experiment results; it does not mutate the active engine.
- Local storage is bounded UI workspace persistence. It is not authoritative simulation state.

Scenario previews create temporary fresh engines at tick 0 and render a read-only initial-world preview. Preview does not mutate the active engine, replace the active snapshot, clear selected entities, clear metrics, write to local storage, or run the simulation forward.

## Workspace Layout Regions

ORTUS uses a fixed-height simulation workspace so the WorldStage remains the dominant stable viewport. The simulation shell is organized by task mode rather than one permanent scrolling drawer.

Current and future workspace regions are:

- Top Status Header: ORTUS brand, global route navigation, current model, current scenario when available, current workspace mode, and compact run state.
- Workspace Navigator: task modes for Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug.
- Workspace Context Panel: the selected mode's tools, with one intentional vertical scroll region.
- Center WorldStage: the primary simulation viewport and canvas-sized world field.
- Right Context Drawer: contextual inspection for selected agents now, and selected cells, network nodes/edges, resources, regions, or rules later.
- Persistent Run-Control Dock: run/pause, step, reset, tick, model time, and speed controls outside scrollable configuration panels.
- Floating Overlays: bounded WorldStage overlays such as warnings and future lightweight target overlays. Legend and Debug are workspace-mode panels by default.
- Full Workspace Mode: future surface for large tools such as Visual Model Builder, Rule Editor, Calibration, Report Builder, or Custom Template Library.

Panel placement metadata describes each module's default placement, supported placements, size modes, and whether it is analysis-oriented, selection-contextual, or workspace-capable. This metadata is UI architecture only; it does not become simulation state.

Current mode grouping:

- Setup -> run settings, model selection, seed, parameters, and Scenario Builder.
- Understand -> assumptions, limitations, validation status, ethics notes, and field notes.
- Observe -> macro/micro readings, metric trace, and legend.
- Intervene -> template-defined validated perturbations.
- Experiment -> local parameter sweeps and bounded results.
- Compare -> run summaries plus scenario/snapshot exchange.
- Debug -> developer diagnostics and performance counters.

Intended future homes:

- Uncertainty Config -> Experiment or a dedicated future workspace mode.
- Event Log, Sensitivity, and Emergence -> Observe, Compare, or a future analysis workspace depending on runtime support.
- Agent, Node, and Resource Inspectors -> right context drawer.
- Visual Model Builder, Rule Editor, and Calibration -> full workspace mode.

## Randomness

Randomness in ORTUS should be explicit, seeded, and reproducible. Hidden randomness makes experiments, comparisons, calibration, and uncertainty analysis unreliable.

Simulation code, template initialization, experiments, and interventions must use `RandomService` or deterministic logic instead of `Math.random`. The current RNG service supports floats, integer ranges, booleans, choices, shuffles, normal values, and named/forked streams. Snapshots preserve RNG stream state so restored runs continue deterministically.

UI-only ids, timestamps, exports, and storage metadata may use browser time or crypto APIs because they are not simulation randomness.

## Metrics

Metric definitions are the declared measurement contract; metric values are the observed emissions for a run. Definitions include ids/keys, labels, descriptions, value type, optional range/unit/display metadata, history support, run-comparability, source, and formatting hints.

Metric collection rejects non-finite numeric values. Run comparison filters missing or nonnumeric values so partial result sets do not produce `NaN` deltas.

## Intervention Definitions And Events

Interventions are declarative template-owned actions, not UI button behavior. Each definition declares id, label, description, target type, parameter definitions, supported templates, capability requirements, mutation kind, event type, documentation, and a deterministic command builder.

Applying or failing an intervention appends a structured event-log entry. The intervention history remains the human-facing intervention record, while the event log is a broader audit trail for run lifecycle and future shocks/delayed effects.

## Event Log

The structured event log is a bounded run/session audit trail stored with world globals. It is useful for interventions, scenario application, future shocks, delayed effects, explainability, and run summaries. It is not event sourcing, not a snapshot replacement, and not the source of truth for simulation state.

Event records include event id, tick, type, source, order, optional target/label/payload, severity, and category. The log is bounded and sanitized on snapshot restore.

## Warning

ORTUS simulations are exploratory models. Scenarios define initial conditions and supported model variants; snapshots restore exact run state; run summaries compare outcomes. None of these should be treated as real-world prediction without validation, uncertainty analysis, and clear assumptions.

Scenarios define initial conditions and supported model variants. They do not guarantee outcomes; complex systems can behave differently across seeds, parameters, behavior modes, agent compositions, and future uncertainty settings.
