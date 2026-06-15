# ORTUS Current Context

Last updated: 2026-06-12 after Prompt 34B Safe Builder UI Shell Audit

## Project Identity

ORTUS is a browser-based complex-systems visual modeler backed by a deterministic TypeScript simulation engine. The app uses Next.js, React, and Zustand for UI state, while the simulation engine under `src/simulation` owns time, scheduling, seeded randomness, validation, metrics, snapshots, spaces, and template runtime behavior.

The sharp ORTUS mark is the primary navigation brand. The soft ORTUS mark is a secondary presentation variant. The primary mark is paired with the text `ORTUS` wordmark in the global app shell, while Builder remains an ORTUS workspace rather than a separate branded product. Do not use either mark as a simulation-world or Builder-graph watermark. Favicon replacement remains future work until small-size legibility is deliberately optimized.

The HCI audit is in `docs/ui/HCI_AUDIT.md`. HCI findings must distinguish observed defects, inferred risks, subjective style preferences, and unverified concerns. Broad UI remediation should be handled in dedicated prompts rather than mixed into branding integration.

UI-REMEDIATION-1 replaced the monolithic simulation left drawer with a task-oriented workspace shell. The simulation workspace modes are Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug. The World Stage remains mounted while switching modes, workspace mode state is local React state in `AppShell`, and persistent Run/Pause, Step, Reset, tick/time, and speed controls live in a shell-level dock outside scrollable workspace content. Model/seed/parameter editing lives in Setup; scenario/snapshot exchange lives in Compare; assumptions and notes live in Understand; metrics and legend live in Observe; interventions live in Intervene; sweeps live in Experiment; debug diagnostics live in Debug.

Prompt 34B audited and hardened the safe Builder shell plus workspace information architecture. Reset now requires press-and-confirm when current run state would be discarded. Workspace tabs support arrow/Home/End keyboard behavior. Setup copy states that model, parameter, Apply Seed, and Regenerate Seed actions rebuild fresh tick-0 runs. Metric Trace states near the chart that traces are bounded model-output history over simulated ticks, not empirical measurements, calibrated probabilities, or validation evidence. Builder viewport node and edge buttons select structural items for read-only inspection only.

Confirmed UI layout defects fixed in UI-REMEDIATION-1:

- The header used fixed `height: 50px` with `overflow-y: hidden`, which could clip crowded lower header content.
- The timeline was rendered inside the scrollable left drawer and styled as sticky bottom content, which could cover or clip lower drawer content.

The prompt attachment directory for UI-REMEDIATION-1 did not contain a screenshot file, and local browser screenshot tooling was unavailable. Route availability was probed through HTTP, and layout causes were confirmed from source/CSS. Real rendered desktop/narrow/zoom screenshots still need a future browser-tooling audit.

The engine must remain headless: no React, Zustand, DOM, Canvas, browser storage, backend, auth, or database dependencies in simulation code. The UI consumes engine snapshots and renders batched canvas/world views. Templates are registered through the template API and own domain behavior.

Built-in production templates currently include Epidemic Spread, Opinion Dynamics, Predator-Prey, Schelling Segregation, Flocking / Boids, and Forest Fire / Landscape Spread. These are exploratory model structures, not calibrated predictive tools.

## Completed Prompt State

Durable docs and source indicate completed roadmap work through Prompt 34B. Prompt 31: Model Schema + Interpreter Foundation V1, Prompt 31B: Model Schema + Interpreter Foundation Audit, Prompt 31C: Knowledge, Memory + Social Learning Semantics V1, Prompt 31D: Knowledge, Memory + Social Learning Audit, Prompt 32: Visual Model Builder Planning + Workspace Schema V1, Prompt 32B: Visual Builder Workspace Audit, Prompt 33: Template/Schema Compatibility Mapping V1, Prompt 33B: Template/Schema Compatibility Mapping Audit, Prompt 33C: Opinion Dynamics Social Learning Runtime V1, Prompt 33D: Opinion Dynamics Social Learning Runtime Audit, Prompt 34: Safe Builder UI Shell V1, and Prompt 34B: Safe Builder UI Shell Audit are complete.

The post-30B repository hygiene, dependency stabilization, durable context, and performance/scalability pass has also been completed. Recent commits include `dd6c256` for repo context/generated-artifact hygiene, `4949b72` for dependency and performance script stabilization, and `a80d5b7` for simulation performance instrumentation and spatial indexing foundations.

The next roadmap prompt is Prompt 35: Model Schema Authoring Forms V1. A separate rendered responsive/design-system audit is still recommended before making mobile-readiness, WCAG, or polished visual-workbench claims.

Implemented runtime foundations include scenarios, snapshots, template-defined behavior modes, agent composition, interventions, experiments, run summaries/comparison, seeded randomness, metrics, spaces, template metadata, and a narrow Opinion Dynamics `socialLearning` behavior mode audited in Prompt 33D.

Implemented service-first or metadata-first foundations include uncertainty, assumptions/limits/ethics, networks/relations, resources/stocks/flows, feedback/delays/events, systems primitive registry, hybrid composition, multi-scale structure, scale view state, boundaries/environment, spatial fields/environmental layers, observability/measurement models, causal assumptions/influence models, quantity semantics, emergence pattern descriptors, robustness/resilience semantics, strategy/control/intervention semantics, model schema declarations, knowledge/memory/social-learning semantics, visual builder workspace schemas, and template/schema compatibility mapping.

Model schemas declare model structure; they do not execute rules or create runnable simulations. A valid model schema is not a template, scenario, RunConfig, or snapshot. Rule declarations are descriptive metadata, not parsed formulas or executable behavior. Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.

Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition. Background profiles are compressed prior descriptors, not simulated life histories. Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals. LLM-per-agent runtime is not implemented and must not be implied. `ortus.knowledgeMemorySocialLearningModel` artifacts describe bounded symbolic semantics only; they do not execute social learning, update beliefs or memory, sample exposure, infer real-person traits, support protected-class inference, validate psychology, predict people, optimize persuasion, provide policy targeting, or mutate Opinion Dynamics.

Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition. Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template. Opinion values and social-learning metrics are model outputs, not measured human beliefs. Information-source credibility is a model parameter, not a verified truth score. No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.

Visual builder workspaces are structural planning artifacts; they do not implement runnable visual model authoring. `ortus.visualBuilderWorkspace` artifacts describe future workspace identity, referenced model schemas and artifacts, visual nodes, visual edges, panels, sections, markers, layout, selection, viewport metadata, summaries, and validation reports only. Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior. A valid visual builder workspace does not make a model schema runnable. Prompt 32 does not add drag-and-drop modeling, visual programming, or schema execution. Workspaces do not generate scenarios, RunConfigs, snapshots, templates, or engines, do not add external framework interop, and do not implement social-learning runtime or LLM agents.

Prompt 34 adds a separate `/builder` UI shell for safe, read-only structural inspection of `ortus.visualBuilderWorkspace` artifacts. Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges. The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime. A structurally valid workspace is still not a runnable model. Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics. The shell imports and exports only visual-builder workspace artifacts through existing serializer/deserializer services, stores only UI-local selection/filter/viewport/import/export state, and does not subscribe to live snapshots, create engines, mutate templates, generate scenarios/RunConfigs/snapshots/templates, or activate social-learning artifacts.

Template/schema compatibility mapping is a structural fit-analysis service only. `ortus.schemaTemplateCompatibilityReport` and `ortus.templateMappingProfile` artifacts compare `ModelSchemaDefinition` structure against static production-template metadata. Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines. Compatibility reports do not execute schemas, parse rule descriptions, mutate templates, create engines, implement visual builder runtime, add external framework interop, run social-learning/cognitive behavior, validate science, calibrate outputs, or prove causality, emergence, robustness, strategy effectiveness, safety, or operational readiness. Prompt 33B audited these boundaries and kept compatibility mapping structural only.

These foundations are not automatic runtime support for templates. A template must explicitly declare and actually use a primitive at runtime before ORTUS can claim template runtime support.

## Package And Dependency State

Current local toolchain observed during stabilization:

- Node: `v24.16.0`
- npm: `11.13.0`
- Installed top-level packages include `next@15.5.19`, `react@19.2.7`, `react-dom@19.2.7`, `vitest@4.1.8`, and `vite-node@6.0.0`.
- `package.json` currently defines `next`, `react`, `react-dom`, `zod`, `zustand`, TypeScript, Vitest, and `vite-node`.
- `npm install` completed cleanly after adding explicit `vite-node` support for `npm run perf:simulation`.
- `npm run lint` is unavailable because `package.json` has no lint script.

Dependency audit note: npm reports two moderate vulnerabilities and recommends `npm audit fix --force`; that force repair is prohibited for this stabilization pass and was not run.

## Performance And Scalability Work Status

The post-30B performance/instrumentation pass is complete and committed. It includes:

- `SimulationPerformanceMonitor` and engine timing/counter hooks.
- Debug panel display of performance samples when instrumentation is enabled.
- Runtime performance metadata on production templates.
- Continuous 2D query diagnostics and a continuous spatial hash index path.
- Flocking local-radius spatial-hash neighbor-pair queries with deterministic fallback.
- Forest Fire hot-loop changes using cached grid-neighbor indices, compact per-tick state arrays, active burning-cell indices, changed-component updates, and state-count globals.
- Focused tests for spatial indexing, performance instrumentation, runtime metadata, Flocking behavior, and Forest Fire counters.
- A non-asserting `npm run perf:simulation` report script.

This work must not be described as SpatialFieldModel, BoundaryEnvironmentModel, multi-scale, or high-scale runtime support.

Latest observed `npm run perf:simulation` smoke results from this machine:

- Flocking, 100 agents / 100 ticks: 934.51 ms, 107.01 ticks/sec, spatial index reported.
- Flocking, 500 agents / 100 ticks: 5999.08 ms, 16.67 ticks/sec, spatial index reported.
- Forest Fire, 80x60 grid / 100 ticks: 3809.50 ms, 26.25 ticks/sec.
- Predator-Prey default / 100 ticks: 1341.89 ms, 74.52 ticks/sec, continuous spatial index reported.

These are local smoke numbers only. They are not benchmark evidence for scalability or scientific validity.

## Repo Hygiene Status

Generated artifacts have been removed from git tracking without deleting local files:

- `.gitignore` now ignores `node_modules/`, `.next/`, `tsconfig.tsbuildinfo`, local env files, and package-manager debug logs.
- `git rm --cached -r .next tsconfig.tsbuildinfo` removed the previously tracked generated artifacts from git tracking.
- `git ls-files .next tsconfig.tsbuildinfo` now returns no tracked files.
- The local `.next` directory and local `tsconfig.tsbuildinfo` still exist after build/typecheck activity, but they are ignored.
- The generated cleanup accounted for 226 generated files and 1097 deletions before commit.

Real source changes are now reviewable separately from generated build/cache noise.

## Current Blockers

- npm reports two moderate audit findings; no force fix was run.
- No browser screenshot/DOM measurement/zoom audit was possible in this environment, so rendered layout and 125%/150%/200% zoom behavior remain unverified.
- Prompt 35 must remain structural-only form authoring: no schema execution, compatibility conversion, runtime mapping, compiler/interpreter behavior, or visual-builder execution.

## Next Recommended Prompt After Stabilization

Next roadmap prompt after a commit/repo hygiene checkpoint: Prompt 35: Model Schema Authoring Forms V1.

Next recommended UI/design-system prompt: `UI-DESIGN-SYSTEM-1: Rendered Responsive, Typography + Visualization Accessibility Audit`.

## Critical Guardrails

- Structural primitives are not runtime support.
- Templates do not runtime-support reserved primitives unless explicitly wired into the template runtime and registry.
- Do not add arbitrary code execution, user-authored formulas, expression evaluation, or unsafe model execution.
- Do not treat ModelSchemaDefinition as executable, and do not parse, compile, or execute ruleDescription.
- Do not treat the Prompt 34 builder UI shell as runnable visual model authoring, runtime graph execution, schema execution, or visual programming.
- Do not treat compatibility as conversion.
- Do not treat strong fit as runnable.
- Do not hide unsupported concepts or silently drop lossy mappings.
- Do not generate scenarios, RunConfigs, snapshots, templates, or engines from compatibility reports.
- Do not mutate templates from compatibility reports.
- Do not add builder editing, drag-and-drop authoring, compiler/interpreter behavior, runtime model schema execution, schema-backed rule execution, scenario/RunConfig/template/snapshot generation, or Apply-to-Template behavior yet.
- Do not treat knowledge/memory/social-learning descriptors as runtime behavior, human cognition, social prediction, LLM agents, unbounded memory, or real-person inference.
- Do not treat the Opinion Dynamics `socialLearning` behavior mode as a generic social/cognitive runtime, semantic artifact interpreter, measured-belief model, truth-scoring system, persuasion optimizer, psychological diagnosis tool, or real-person/protected-class inference system.
- Do not claim validation, calibration, prediction proof, causal proof, robustness proof, safety certification, operational readiness, or policy recommendation.
- Do not place all simulation tools in one permanent drawer; organize them by setup, understanding, observation, intervention, experimentation, comparison, and debug workflow stages.
- Keep persistent run controls outside scrollable configuration panels.
- Hidden workspace panels should not subscribe to tick-heavy snapshot/debug state.
- Do not treat network edges, feedback labels, observations, runtime metrics, uncertainty ensembles, visible patterns, or interventions as proof.
- Do not treat camera zoom as multi-scale modeling.
- Do not describe Forest Fire / Landscape Spread as wildfire prediction, GIS/weather/wind/humidity/terrain/suppression/firefighting modeling, calibrated fire behavior, SpatialFieldModel runtime support, BoundaryEnvironmentModel runtime support, or generic control strategy support.
