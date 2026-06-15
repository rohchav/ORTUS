# ORTUS Codex Session Log

## 2026-06-04 - R2 Repo Hygiene, Durable Context, Performance Pass Audit

Goal: stabilize the repository after a lost Codex chat so the current uncommitted performance/instrumentation pass can be reviewed, tested, and committed safely.

Starting state:

- Branch is `main`.
- Git history has only two commits.
- No `docs/codex` directory or durable Codex context files existed.
- Worktree is dirty with meaningful source changes plus heavy generated-file noise.
- `.next` and `tsconfig.tsbuildinfo` are tracked and dirty.
- `.gitignore` only ignored `node_modules`.
- Current uncommitted source changes appear centered on runtime performance instrumentation, continuous spatial indexing, Flocking optimization, Forest Fire hot-loop optimization, runtime metadata, tests, docs, and `npm run perf:simulation`.
- `docs/roadmap.md` had prompt-status drift: early roadmap text understated completed prompts while later source/docs indicated Prompt 30 service-first work was present and Prompt 31 remained future.

Session guardrails:

- Do not start Prompt 31.
- Do not start new ORTUS roadmap work.
- Do not rewrite the engine.
- Do not weaken or delete tests.
- Do not discard meaningful source changes.
- Do not commit generated artifacts.
- Do not use `npm audit fix --force`.
- Do not use `--legacy-peer-deps` as a permanent fix.

Planned stabilization phases:

1. Create durable Codex context files.
2. Update `.gitignore` and remove generated artifacts from git tracking without deleting local files.
3. Audit real source changes after generated noise is isolated.
4. Check dependency alignment and repair only dependency issues if needed.
5. Run typecheck, focused tests, full tests, build, performance report, and lint if available.
6. Recommend a commit split without committing.

Completed actions:

- Created `docs/codex/CURRENT_CONTEXT.md` and this session log so repo state survives chat loss.
- Updated `.gitignore` for generated build/typecheck artifacts, local env files, and package-manager debug logs.
- Removed `.next` and `tsconfig.tsbuildinfo` from git tracking with `git rm --cached` while preserving local files.
- Added explicit `vite-node` dev dependency so `npm run perf:simulation` has the binary it invokes.
- Ran `npm install` successfully after the dependency repair.
- Kept Prompt 31 untouched and did not start new ORTUS roadmap work.
- Kept generated artifacts out of the source diff; staged generated cleanup currently covers 226 files and 1097 deletions.
- Made one targeted source stabilization fix after tests exposed runtime cost: Predator-Prey movement and boundary systems now batch movement and position component updates through existing command-buffer batch APIs.
- Split long-running production-template tests into per-template cases and added explicit time budgets to slow smoke/determinism/performance tests without changing assertions.

Checks run:

- `npm run typecheck`: passed.
- `npm run test -- spatialIndex`: passed.
- `npm run test -- flocking`: passed.
- `npm run test -- forest`: passed.
- `npm run test -- predatorPrey`: passed after the Predator-Prey batching fix.
- `npm run test -- template`: passed after per-template test splitting/time budgets.
- `npm run test`: passed, 43 files and 322 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run perf:simulation`: passed.
- `npm run lint`: unavailable; no lint script exists in `package.json`.

Latest local performance report:

- Flocking, 100 agents / 100 ticks: 934.51 ms, 107.01 ticks/sec.
- Flocking, 500 agents / 100 ticks: 5999.08 ms, 16.67 ticks/sec.
- Forest Fire, 80x60 grid / 100 ticks: 3809.50 ms, 26.25 ticks/sec.
- Predator-Prey default / 100 ticks: 1341.89 ms, 74.52 ticks/sec.

Remaining work:

- Review and commit changes intentionally; no commits were made in this session.
- Keep the staged generated cleanup in a hygiene commit rather than mixing generated artifacts into feature work.
- Review the uncommitted performance/instrumentation pass before proceeding to Prompt 31.
- Fix roadmap prompt-status drift in a later docs cleanup if desired.

## 2026-06-05 - R4 Roadmap Status Drift Cleanup

Goal: clean up roadmap/status drift only, without source code or package-file changes.

Starting state:

- Worktree was clean before the docs-only patch.
- Recent commits showed the post-30B stabilization/performance work completed: `dd6c256`, `4949b72`, and `a80d5b7`.
- Prompt 31 had not started.

Docs updated to consistently state:

- ORTUS is completed and audited through Prompt 30B.
- The post-30B repository hygiene, durable context, dependency stabilization, and performance/scalability pass is complete.
- Prompt 31 has not started.
- The next roadmap prompt is Prompt 31: Model Schema + Interpreter Foundation V1.

R4 touched docs plus narrow test-maintenance assertions/time budgets needed to keep roadmap/status checks current. No runtime source or package files were changed.

Checks run:

- `npm run typecheck`: passed.
- `npm run test -- roadmap`: initially failed on the retired 17B roadmap assertion, then passed after updating the roadmap-status assertion.
- `npm run test -- control`: passed after updating the retired Prompt 31 wording assertion.
- `npm run test -- predatorPrey`: passed after adding an explicit time budget to the existing 300-tick smoke test.
- `npm run test -- template.system`: passed after adding an explicit time budget to the existing seed-difference smoke test.
- `npm run test`: passed, 43 files and 322 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run lint`: unavailable; no lint script exists in `package.json`.

## 2026-06-05 - Prompt 31 Model Schema + Interpreter Foundation V1

Goal: add a service-first, structural ModelSchemaDefinition layer without starting Prompt 31C, visual builder work, runtime interpreter work, external framework interop, calibration, control execution, or social-learning runtime.

Implemented boundaries:

- Added `src/simulation/modelSchema` as a headless service for validating, serializing, querying, summarizing, and reporting capability gaps for `ortus.modelSchema` artifacts.
- Model schemas declare entity, component, attribute, space, parameter, metric, rule-declaration, and artifact-reference structure.
- Model schemas declare model structure; they do not execute rules or create runnable simulations.
- A valid model schema is not a template, scenario, RunConfig, or snapshot.
- Rule declarations are descriptive metadata, not parsed formulas or executable behavior.
- Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.
- Prompt 31C/31D social/cognitive semantics remained future work during Prompt 31.
- Prompt 32 visual model-builder planning remains future work.

Registry and docs status:

- `modelSchema` is service-only in the primitive registry.
- `ortus.modelSchema` is implemented with service-level import/export support.
- Compiler/interpreter runtime, visual builder, validation/calibration, external framework interop, social-learning runtime, full human cognition, and LLM-per-agent runtime remain unavailable.
- Current production templates remain hand-built runtime models and do not runtime-support ModelSchemaDefinition.

Next recommended prompt: Prompt 31B: Model Schema + Interpreter Foundation Audit.

## 2026-06-05 - Prompt 31B Model Schema + Interpreter Foundation Audit

Goal: audit and harden Prompt 31 without starting Prompt 31C, visual builder work, runtime interpreter/compiler work, schema-to-template generation, external framework interop, social-learning runtime, or LLM agents.

Audit results:

- Confirmed `ModelSchemaDefinition` remains a bounded plain-JSON structural artifact.
- Strengthened unsafe-key validation for external-framework import/export, framework adapter, NetLogo/Mesa/MASON import/export, and prototype/function/class-shaped payload keys.
- Strengthened model schema warnings for structural `stateTransition` and `eventEmission` declarations.
- Strengthened model schema tests for the full live-state and unsafe-key families, other artifact-family rejection, template-source separation, and assumption-profile distinctions.
- Confirmed `modelSchema` remains service-only, `ortus.modelSchema` remains service import/export, and current production templates remain unsupported for modelSchema runtime behavior.
- Confirmed hybrid compositions may reference model schemas structurally without becoming runnable.

Boundary preserved:

- Model schemas declare model structure; they do not execute rules or create runnable simulations.
- A valid model schema is not a template, scenario, RunConfig, or snapshot.
- Rule declarations are descriptive metadata, not parsed formulas or executable behavior.
- Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.
- Prompt 31C/31D social/cognitive semantics remained future work during Prompt 31B.

Next recommended prompt: Prompt 31C: Knowledge, Memory + Social Learning Semantics V1.

## 2026-06-05 - Prompt 31C Knowledge, Memory + Social Learning Semantics V1

Goal: add a service-first structural semantic family for bounded knowledge, belief, memory, attention, trust/source, exposure, social signals, background priors, roles, norms, and learning-rule descriptors without starting Prompt 31D or implementing runtime social learning.

Implemented boundaries:

- Added `src/simulation/socialLearning` as a headless service for validating, serializing, querying, summarizing, warning about, and reporting capability gaps for `ortus.knowledgeMemorySocialLearningModel` artifacts.
- Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition.
- Background profiles are compressed prior descriptors, not simulated life histories.
- Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals.
- LLM-per-agent runtime is not implemented and must not be implied.
- The service does not execute social learning, update runtime beliefs or memory, sample social exposure, infer real-person traits, support protected-class inference, validate psychology, predict people, optimize persuasion, provide policy targeting, or mutate Opinion Dynamics.

Registry and docs status:

- `knowledgeMemorySocialLearning` is service-only in the primitive registry.
- `socialLearningRuntime` remains reserved/future.
- `ortus.knowledgeMemorySocialLearningModel` is implemented with service-level import/export support.
- Current production templates remain unsupported for knowledge/memory/social-learning runtime behavior.
- At the time of Prompt 31C, Opinion Dynamics Social Learning Runtime remained future work; Prompt 33C later added the narrow template-owned mode and Prompt 33D audited it.

Next recommended prompt: Prompt 31D: Knowledge, Memory + Social Learning Audit.

## 2026-06-07 - Prompt 31D Knowledge, Memory + Social Learning Audit

Goal: audit and harden Prompt 31C without starting Prompt 32, visual builder work, runtime social learning, Opinion Dynamics mutation, full human cognition, LLM agents, unbounded memory, real-person profiling, protected-class inference, psychological diagnosis, persuasion/microtargeting optimization, policy guidance, validation/calibration, or arbitrary code/formula execution.

Audit results:

- Strengthened `src/simulation/socialLearning` unsafe-key validation for additional runtime-hook, compiler, LLM-agent, prompt-chain, embedding/vector, model-weight, training-data, dataset, biography/runtime-memory, real-person, protected-attribute, diagnosis, targeting/recommender, policy-guidance, causal/treatment-effect, calibration/validation-claim, proof/certification, operational-safety, and risk/safety-score payload shapes.
- Strengthened social-learning warnings and validation reports so valid descriptors still report `runnableNow: false`, no runtime social learning, no belief/memory updates, no exposure sampling, no human cognition runtime, no LLM-agent runtime, no psychological validity, no empirical validation, no policy guidance, and no real-person/protected-class/persuasion support.
- Strengthened tests for malformed arrays, duplicate ids across descriptor families, executable flags across descriptor families, unsafe social/cognitive/ML payload keys, warning coverage, helper non-mutation, validation reports, serialization rejection, registry status, hybrid composition attachment boundaries, model schema linkage, Opinion Dynamics separation, documentation phrases, and headless architecture constraints.
- Confirmed `knowledgeMemorySocialLearning` remains service-only in the primitive registry, `socialLearningRuntime` remains reserved/future, and current production templates do not runtime-support knowledge/memory/social-learning semantics.
- Confirmed model schemas may declare `socialLearning`, `memoryUpdate`, and `beliefUpdate` rule kinds and can reference a social-learning semantics artifact structurally, but neither artifact executes those rules or becomes runnable.
- Confirmed Opinion Dynamics remains a hand-built stylized scalar-opinion template; it was not mutated into social-learning runtime.

Boundary preserved:

- Knowledge, memory, and social-learning descriptors are structural semantics; they do not implement human cognition.
- Background profiles are compressed prior descriptors, not simulated life histories.
- Crowd and stranger exposure should usually be modeled as aggregate signals, representative agents, or fields rather than thousands of throwaway individuals.
- LLM-per-agent runtime is not implemented and must not be implied.
- Prompt 32 visual model-builder planning remains future work.

Next recommended prompt: Prompt 32: Visual Model Builder Planning + Workspace Schema V1.

## 2026-06-07 - Prompt 32 Visual Model Builder Planning + Workspace Schema V1

Goal: add a service-first, headless Visual Builder Workspace Schema V1 without implementing the visual builder UI, a node editor, drag/drop, graph rendering, schema execution, rule execution, formula/code/script execution, visual programming, compiler/interpreter runtime, schema-to-template/scenario/RunConfig/snapshot generation, external framework interop, social-learning runtime, or LLM-agent runtime.

Implemented boundaries:

- Added `src/simulation/visualBuilderWorkspace` as a headless service for validating, serializing, deserializing, querying, summarizing, warning about, and reporting capability gaps for `ortus.visualBuilderWorkspace` artifacts.
- Visual builder workspaces are structural planning artifacts; Prompt 32 did not implement the visual builder UI, and Prompt 34 later added only a read-only shell.
- Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior.
- A valid visual builder workspace does not make a model schema runnable.
- Prompt 32 does not add drag-and-drop modeling, visual programming, or schema execution.
- Workspace artifacts can reference model schemas, social-learning semantics, observability, causality, networks, resources, feedback, quantities, control, hybrid compositions, scenarios, or templates structurally, but they do not execute node graphs, generate scenarios, generate RunConfigs, produce snapshots, create templates, create engines, add external framework interop, implement social-learning runtime, or add LLM agents.

Registry and composition status:

- `visualBuilderWorkspace` is service-only in the primitive registry.
- `ortus.visualBuilderWorkspace` is implemented with service-level import/export support.
- `visualModelBuilder`, `safeInterpreterCompiler`, `customModelRuntime`, `llmAgents`, `externalFrameworkInterop`, `validationCalibration`, and `socialLearningRuntime` remain reserved/future.
- Hybrid compositions may reference `ortus.visualBuilderWorkspace` structurally, but attachment does not make a composition runnable and does not satisfy visual model builder, schema execution, compiler/interpreter, validation/calibration, external interop, social-learning runtime, custom runtime, or LLM-agent capabilities.
- Current production templates remain hand-built runtime models and do not runtime-support visual builder workspaces.

Next recommended prompt: Prompt 32B: Visual Builder Workspace Audit.

## 2026-06-07 - Prompt 32B Visual Builder Workspace Audit

Goal: audit and harden Prompt 32 without adding visual builder UI, React graph-builder components, drag/drop, node canvas, toolbar/palette/save-load UI, Run Model actions, schema authoring forms, graph execution, schema execution, compiler/interpreter runtime, scenario/RunConfig/snapshot/template generation, external framework interop, social-learning runtime, or LLM agents.

Audit results:

- Confirmed `src/simulation/visualBuilderWorkspace` remains a headless structural service for `ortus.visualBuilderWorkspace` artifacts only.
- Strengthened visual workspace validation to reject cyclic direct-validation payloads and additional UI/runtime-shaped metadata keys such as React component refs, DOM/canvas refs, node editor, graph renderer, toolbar/palette, save-load UI, Run Model button, schema authoring form, and drag/drop runtime payloads.
- Strengthened warning output to state that artifact references are structural references only and do not activate behavior, and that no node editor, graph editing, or graph execution exists in V1.
- Strengthened tests for required live-state and unsafe-key families, malformed arrays/objects, cyclic and non-plain payloads, namespaced query helpers, clone-safe helper output, serialization rejection, per-doc exact boundary phrases, registry status, composition attachment boundaries, model-schema/social-learning separation, current UI absence, template capability separation, assumptions, and architecture constraints.
- Confirmed `visualBuilderWorkspace` remains service-only in the primitive registry, `ortus.visualBuilderWorkspace` remains service-level import/export, and current production templates do not runtime-support visual builder workspaces.
- Confirmed hybrid compositions may reference a visual builder workspace structurally, but the attachment does not make a composition runnable and does not satisfy visual model builder, schema execution, compiler/interpreter, validation/calibration, external interop, social-learning runtime, custom runtime, or LLM-agent capabilities.

Boundary preserved:

- Visual builder workspaces are structural planning artifacts; Prompt 32B did not implement the visual builder UI, and Prompt 34 later added only a read-only shell.
- Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior.
- A valid visual builder workspace does not make a model schema runnable.
- Prompt 32 does not add drag-and-drop modeling, visual programming, or schema execution.
- Prompt 33 template/schema compatibility mapping remains future work.
- At the time of this audit entry, Prompt 34 safe builder UI shell remained future work; it is superseded by the Prompt 34 completion entry below.

Next recommended prompt: Prompt 33: Template/Schema Compatibility Mapping V1.

## 2026-06-07 - Prompt 33 Template/Schema Compatibility Mapping V1

Goal: add a service-first, headless compatibility mapping layer between `ModelSchemaDefinition` artifacts and production template metadata without adding schema execution, conversion, generation, runnable visual builder runtime/editor support, external framework interop, social-learning runtime, validation, or calibration.

Implemented boundaries:

- Added `src/simulation/schemaTemplateCompatibility` as a headless service for `ortus.schemaTemplateCompatibilityReport` and `ortus.templateMappingProfile` artifacts.
- Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models.
- A strong template fit does not mean a schema can run.
- Unsupported and lossy mappings must remain visible; they must not be silently dropped.
- Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines.
- The mapper inspects validated model schema structure and static template metadata only; it does not instantiate engines, parse `ruleDescription`, execute rules, mutate templates, or create runtime artifacts.

Registry and composition status:

- `schemaTemplateCompatibility` is service-only in the primitive registry.
- `ortus.schemaTemplateCompatibilityReport` and `ortus.templateMappingProfile` are implemented with service-level import/export support.
- Current production templates remain unsupported for schemaTemplateCompatibility runtime behavior.
- Hybrid compositions may reference compatibility reports and mapping profiles structurally, but those attachments do not make a composition runnable and do not satisfy model schema execution, visual builder runtime, conversion, generation, validation, calibration, external interop, or social-learning runtime capabilities.

Boundary preserved:

- Model schemas remain structural declarations, not executable models.
- Visual builder workspaces remain structural planning artifacts, not UI or graph execution.
- Compatibility reports do not imply NetLogo, Mesa, or MASON interop.
- Compatibility reports do not validate, calibrate, prove causality/emergence/robustness/safety, or recommend strategy/control actions.
- Social-learning, memory, and belief descriptors remain structural semantics, not human cognition or runtime social learning.

Next recommended prompt: Prompt 33B: Template/Schema Compatibility Mapping Audit.

## 2026-06-08 - Prompt 33B Template/Schema Compatibility Mapping Audit

Goal: audit and harden Prompt 33 without adding schema execution, schema-to-template conversion, scenario generation, RunConfig generation, snapshot generation, template generation, engine creation, runnable visual builder runtime/editor support, external framework interop, social-learning runtime, validation, calibration, or scientific-truth claims.

Audit results:

- Added explicit compatibility artifact fields for audit clarity: template mapping profiles now carry `name`, `version`, `supportedParameterKinds`, `unsupportedConcepts`, `capabilityNotes`, and `limitationNotes`; compatibility reports now carry `name`, `version`, `schemaId`, explicit scenario/RunConfig/snapshot/template/engine generation false flags, and bounded error/assumption/limitation notes.
- Strengthened validation so `schemaId` must match `modelSchemaId`, all generation/execution fields are forced false, executable-true payloads are rejected recursively, and additional runtime/generation/conversion payload keys are rejected.
- Strengthened warning output for structural-only profiles, structurally active mappings, no scenario/RunConfig/snapshot/template/engine generation, no compiler/interpreter, future-only primitives, visual-builder workspace separation, and external-framework non-interop.
- Split the registry limitations for `schemaTemplateCompatibility` into explicit no-conversion, no-execution, no-generation, no-visual-builder-runtime, no-external-interop, no-validation/calibration/proof, and no-social-learning-runtime boundaries.
- Strengthened compatibility tests for required artifact fields, duplicate ids, invalid enums, score bounds, unsafe payloads, wrong artifact-family imports, query/summary validation reports, registry status, hybrid-composition attachment boundaries, docs phrases, assumption-profile phrases, and architecture constraints.

Boundary preserved:

- Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models.
- A strong template fit does not mean a schema can run.
- Unsupported and lossy mappings must remain visible; they must not be silently dropped.
- Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines.
- Model schemas remain structural declarations; visual builder workspaces remain planning artifacts; social-learning descriptors remain structural semantics; current production templates remain hand-built runtime models.

Next recommended prompt: Prompt 33C: Opinion Dynamics Social Learning Runtime V1, after a commit/repo hygiene checkpoint for the Prompt 33B audit work.

## 2026-06-08 - Prompt 33C Opinion Dynamics Social Learning Runtime V1

Goal: add a narrow deterministic social-learning runtime slice to the hand-built Opinion Dynamics template without adding generic social/cognitive runtime support, executing `KnowledgeMemorySocialLearningModel` artifacts, executing model schemas, changing compatibility reports into runtime conversion, adding runnable visual builder runtime/editor support, adding LLM agents, unbounded memory, real-person profiling, protected-class inference, persuasion/microtargeting optimization, psychological diagnosis, validation/calibration, or external framework interop.

Implemented behavior:

- Added a template-owned `socialLearning` behavior mode to Opinion Dynamics.
- Added bounded fixed source exposure, aggregate crowd signal exposure, scalar memory, salience, trust, confirmation, and per-tick max-shift logic inside `src/simulation/templates/opinion.template.ts`.
- Added bounded `OpinionSocialLearningState` components only for the `socialLearning` behavior mode.
- Added model-output metrics for social-learning shift, neighbor/source/crowd/memory contributions, confirmation/trust weights, credibility-weighted exposure, active social-learning agents, and active information-source count.
- Added strict fixed-source validation: source ids must be unique, labels bounded, categories enumerated, numeric values bounded, and arbitrary payload fields rejected.

Boundary preserved:

- Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.
- Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template.
- Opinion values and social-learning metrics are model outputs, not measured human beliefs.
- Information-source credibility is a model parameter, not a verified truth score.
- No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.
- `knowledgeMemorySocialLearning` remains a service-level structural primitive; `socialLearningRuntime` remains reserved in the global primitive registry.
- Model schemas, compatibility reports, visual builder workspaces, and hybrid compositions remain structural and do not generate or execute Opinion runtime behavior.

## 2026-06-12 - UI-REMEDIATION-1 Workspace Information Architecture + Drawer Layout Refactor

Goal: restructure the simulation shell around user workflow stages without changing simulation engine behavior, templates, visual builder runtime boundaries, or scientific/runtime-honesty language.

Starting state:

- Branch `main` was clean and ahead of `origin/main` by two commits.
- Latest commit was `357c08c feat: Introduce Safe Builder UI Shell V1 and update roadmap`, which also contained the Prompt 34 Safe Builder UI Shell and brand/HCI audit files.
- Route probes confirmed `/` and `/builder` returned HTTP 200 from the local Next dev server on port 3000.
- The prompt attachment directory did not contain an actual screenshot file, so clipping diagnosis used source/CSS plus route probing rather than screenshot measurement.

Confirmed defects:

- The header used fixed `height: 50px`, `min-height: 50px`, and `overflow-y: hidden` while hosting brand, Builder navigation, file actions, model selection, seed controls, status, and warnings.
- `TimelineControlStrip` lived inside the left drawer and `.timeline-strip` used `position: sticky; bottom: 0` inside the same vertical scroll container as the other tools.
- The left drawer mounted all workflow panels together, so hidden/collapsed or unrelated panels could keep unnecessary subscriptions and the user had to scan setup, observation, assumptions, interventions, experiments, comparison, timeline, notes, and file exchange in one column.

Implemented:

- Added task-oriented workspace modes: Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug.
- Added `RunSettingsPanel` for model template, seed, and parameter setup.
- Refactored `LeftInstrumentStack` into a workspace mode navigator plus selected context panel with one intentional scroll container.
- Moved the timeline/run controls into a persistent shell-level run-control dock outside the workspace scroll region.
- Simplified the top header to brand, Simulate/Builder global navigation, current model, current scenario when available, current workspace mode, and compact run status.
- Moved legend and debug diagnostics out of the world overlay and into Observe/Debug workspace modes.
- Kept selected-entity inspection in the right context drawer.
- Updated workspace panel placement metadata so timeline is bottom-dock content and simulation tools are mode-panel content.
- Added source-level regression tests for workspace IA, drawer clipping, header clipping, accessibility semantics, state separation, and hidden panel reachability.
- Added `docs/ui/WORKSPACE_INFORMATION_ARCHITECTURE.md` and updated HCI, README, concepts, AGENTS, and current context docs.

Boundaries preserved:

- No simulation engine behavior changed.
- No template behavior changed.
- No visual builder execution, drag/drop authoring, schema execution, scenario generation, RunConfig generation, template generation, or engine creation was added.
- Workspace mode state remains local React UI state and does not mutate simulation state.
- Service-only primitives were not exposed as runnable controls.

Checks:

- `npm run test -- workspaceInformationArchitecture layoutContainment assumptions ortusBrand builderUiShell`: passed, 5 files and 30 tests.
- `npm run test -- template.opinion socialLearning`: passed, 2 files and 21 tests.
- `npm run typecheck`: passed.
- `npm run test`: passed, 50 files and 377 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 118.82 ticks/sec, Flocking 500 agents at 16.88 ticks/sec, Forest Fire 80x60 grid at 26.86 ticks/sec, and Predator-Prey default at 81.06 ticks/sec.
- `git diff --check`: passed after removing two trailing spaces in the HCI audit frontmatter.
- `npm run lint`: unavailable, package.json has no lint script.

Known limitations:

- No real browser screenshot, DOM measurement, or zoom audit was possible in this environment.
- Reset remains a one-click destructive run-state reset and should receive a later safety affordance.
- Metric trace provenance/units and color-independent canvas state encoding still need dedicated visual/a11y work.

Next recommended prompt: Prompt 34B: Safe Builder UI Shell Audit.

## 2026-06-11 - Prompt 33D Opinion Dynamics Social Learning Runtime Audit

Goal: audit the narrow Opinion Dynamics `socialLearning` behavior mode without adding generic social/cognitive runtime support, executing `KnowledgeMemorySocialLearningModel` artifacts, executing model schemas, activating compatibility reports or visual builder workspaces, adding LLM agents, unbounded memory, real-person profiling, protected-class inference, persuasion/microtargeting, psychological diagnosis, validation/calibration, or external framework interop.

Audit hardening:

- Kept the social-learning update rule inside `src/simulation/templates/opinion.template.ts`; it does not import `src/simulation/socialLearning`, model schema, schema/template compatibility, or visual builder services as executors.
- Avoided unnecessary default-mode source-object construction so classic Opinion mode remains inactive for social-learning state and source exposure.
- Strengthened fixed information-source validation to reject non-plain objects in addition to unknown unsafe fields.
- Strengthened Opinion tests for inactive default mode, zero exposure edge cases, source-weighted influence bounds, invalid social-learning parameters, malformed/unsafe source payload fields, arbitrary social state rejection, and static architecture boundaries.

Boundary preserved:

- Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.
- Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template.
- Opinion values and social-learning metrics are model outputs, not measured human beliefs.
- Information-source credibility is a model parameter, not a verified truth score.
- No LLM agents, real-person profiling, protected-class inference, persuasion optimization, or psychological diagnosis are implemented.
- `knowledgeMemorySocialLearning` remains service-only and `socialLearningRuntime` remains reserved in the global primitive registry.
- Model schemas, compatibility reports, visual builder workspaces, and hybrid compositions remain structural and do not generate or execute Opinion runtime behavior.

Next recommended prompt after repo hygiene: Prompt 34: Safe Builder UI Shell V1.

## 2026-06-11 - Prompt 34 Safe Builder UI Shell V1

Goal: implement the first safe UI step toward future visual model building without adding graph execution, schema execution, visual programming, drag-and-drop authoring, compatibility conversion, template/scenario/RunConfig/snapshot generation, engine creation, external framework interop, generic social-learning runtime, LLM agents, real-person profiling, protected-class inference, persuasion/microtargeting, validation/calibration, or scientific-truth claims.

Implemented behavior:

- Added a dedicated `/builder` route and local `src/components/builder` shell for `ortus.visualBuilderWorkspace` artifacts.
- Added read-only workspace identity/status display, structural status badges, import/export text flow, file import, clear action, validation/warnings toggles, navigation/filtering, node/edge viewport, text edge list, read-only inspector, and validation/warning panels.
- Added a deterministic UI view-model layer that consumes existing `deserializeVisualBuilderWorkspace`, `serializeVisualBuilderWorkspace`, validation, query, summary, and validation-report services without duplicating validation in React.
- Added focused UI-shell tests for view-model behavior, import/export preservation, selection/inspector output, filters, accessibility hooks, forbidden action labels, dependency boundaries, and simulation-state separation.
- Added a small navigation link from the simulation top bar to the safe Builder Shell without mutating simulation state.

Boundary preserved:

- Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges.
- The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime.
- A structurally valid workspace is still not a runnable model.
- Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics.
- The shell does not create engines, mutate active simulation state, subscribe to live snapshots/ticks, generate scenarios/RunConfigs/snapshots/templates, execute compatibility reports, activate social-learning semantic artifacts, add LLM agents, or mark `visualModelBuilder` implemented.
- `visualBuilderWorkspace` remains service-only in the primitive registry, and `visualModelBuilder` remains reserved.

Next recommended prompt: Prompt 34B: Safe Builder UI Shell Audit.

## 2026-06-11 - UI-BRAND-1 ORTUS Brand Integration + HCI Audit

Goal: integrate the supplied ORTUS PNG marks into the app shell and Builder shell while keeping branding restrained, accessible, and isolated from simulation runtime state; produce a durable HCI/UX/visual-direction audit without redesigning the application or changing simulation behavior.

Implemented behavior:

- Moved the sharp primary mark and soft secondary mark into canonical public branding assets.
- Added a reusable ORTUS brand component with text wordmark support, descriptor support, mark-only accessibility, and sharp/soft variants.
- Placed the primary sharp mark in the global top header and reused the same ORTUS brand in the Builder header without creating a separate Builder identity.
- Kept logos out of the simulation world and Builder graph viewport.
- Preserved favicon metadata because small-size preview makes the current mark too thin/ambiguous at 16 px.
- Added `docs/ui/HCI_AUDIT.md` for evidence-labeled HCI findings and visual-direction recommendations.

Boundary preserved:

- The sharp ORTUS mark is the primary navigation brand.
- The soft ORTUS mark is a secondary presentation variant.
- Do not use either mark as a simulation-world or Builder-graph watermark.
- Builder remains an ORTUS workspace, not a separate branded product.
- Favicon replacement remains future work until small-size legibility is deliberately optimized.
- HCI findings must distinguish observed defects, inferred risks, subjective style preferences, and unverified concerns.

## 2026-06-12 - Prompt 34B Safe Builder UI Shell + Workspace Information Architecture Audit

Goal: audit and harden the Safe Builder UI Shell and simulation workspace information architecture without adding visual-builder execution, graph execution, schema execution, drag/drop authoring, compiler/interpreter behavior, scenario/RunConfig/snapshot/template generation, engine creation, simulation behavior changes, or broad design-system redesign.

Starting state:

- Branch `main` was clean and ahead of `origin/main` by three commits.
- Latest commit was `9bf264d Refactor workspace panel structure and improve component flexibility`.
- Prompt 34 Safe Builder UI Shell V1, ORTUS brand integration, and UI-REMEDIATION-1 workspace IA changes were committed.
- Local route probes returned HTTP 200 for `/` and `/builder` from the running Next app on port 3000. Sandbox local socket access required approved unsandboxed `curl`.
- No Chromium, Chrome, Firefox, `wkhtmltoimage`, or Playwright dependency was available, so rendered viewport, browser zoom, and screenshot inspection remained unverified.

Audit results and hardening:

- Confirmed the task-oriented workspace modes remain Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug.
- Confirmed the World Stage remains mounted across workspace-mode changes and workspace mode state remains local React UI state.
- Confirmed persistent run controls live outside the scrollable workspace context panel and the top header no longer uses the old fixed `50px`/`overflow-y: hidden` clipping pattern.
- Added press-and-confirm Reset behavior when the current run has advanced, accumulated more than initial metric history, or recorded interventions. Reset still rebuilds a fresh tick-0 run from the current model, parameters, and seed and clears current tick, metric history, selection, targets, and intervention history.
- Added Arrow Left/Right/Up/Down plus Home/End behavior for workspace tabs.
- Clarified Setup copy: model, parameter, Apply Seed, and Regenerate Seed actions rebuild fresh tick-0 runs through template validation.
- Added Metric Trace provenance text: traces are bounded model-output history over simulated ticks, not empirical measurements, calibrated probabilities, or validation evidence.
- Tightened Builder viewport node and edge controls so they select structural items for read-only inspection and do not imply executable dataflow.
- Updated HCI, workspace IA, roadmap/status, current context, session log, simulation README, README, concepts, planned roadmap, and AGENTS guardrails.

Boundary preserved:

- No simulation engine or template behavior changed.
- No Builder execution, schema execution, compatibility conversion, visual programming, drag/drop authoring, template mutation, engine creation, scenario generation, RunConfig generation, snapshot generation, or LLM-agent behavior was added.
- Builder remains a read-only shell for `ortus.visualBuilderWorkspace` artifacts.
- Structural validity remains distinct from runtime readiness.

Checks:

- `git status --short`: dirty only with Prompt 34B source/docs/test files.
- `npm run test -- workspaceInformationArchitecture builderUiShell layoutContainment ortusBrand`: passed, 4 files and 23 tests.
- `npm run typecheck`: passed.
- `npm run test -- visualBuilderWorkspace roadmap assumptions`: passed, 3 files and 19 tests.
- `npm run test`: passed, 50 files and 378 tests.
- `npm run test -- ortusBrand roadmap`: passed after the session-log update, 2 files and 8 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 99.61 ticks/sec, Flocking 500 agents at 16.24 ticks/sec, Forest Fire 80x60 grid at 22.73 ticks/sec, and Predator-Prey default at 71.76 ticks/sec.
- `git diff --check`: passed after removing one trailing-space line in the workspace IA doc.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser screenshot, DOM measurement, and 125%/150%/200% zoom inspection were not possible in this environment.
- No formal WCAG, screen-reader, or user-study evidence was produced.
- Canvas color/glyph state encoding, dense typography, target sizing, and mobile workflow still need rendered design-system work.
- Metric unit semantics remain limited to what template metric definitions actually provide; no units were invented.

Next roadmap prompt: Prompt 35: Model Schema Authoring Forms V1, provided it remains structural-only and non-executing.

Next recommended UI/design-system prompt: `UI-DESIGN-SYSTEM-1: Rendered Responsive, Typography + Visualization Accessibility Audit`.

## 2026-06-15 - Prompt 35 Model Schema Authoring Forms V1

Goal: add bounded, non-executing `ModelSchemaDefinition` authoring inside the existing Builder without adding schema execution, rule execution, formulas, code/script editors, graph authoring, drag/drop, compiler/interpreter behavior, template/scenario/RunConfig/snapshot/engine generation, compatibility conversion, external framework interop, social-learning artifact execution, LLM agents, backend persistence, or active simulation mutation.

Starting state:

- Branch `main` was clean and ahead of `origin/main` by four commits.
- Latest commit was `6ba4d75 feat: Complete Prompt 34B - Safe Builder UI Shell Audit and enhancements`.
- Prompt 34B was committed; no unrelated dirty files existed.

Implemented:

- Added accessible Builder modes for `Workspace Inspector` and `Author Schema`, including Arrow/Home/End keyboard behavior.
- Kept both Builder mode panels mounted but hidden so in-memory authoring drafts survive mode switches.
- Added bounded form sections for schema identity/scope, entities, components, attributes, spaces, parameters, metrics, descriptive rule declarations, artifact references, assumptions, limitations, validation notes, and inert metadata.
- Added a pure UI adapter using existing model-schema validation, interpreter-capability report, summary, serializer, deserializer, and registry query helpers.
- Added continuous structural validation, linked error summary, warnings, missing-runtime-capability display, declaration counts, fixed `executable: false` fields, and persistent non-runnable/no-generation language.
- Added current-draft versus last-valid-artifact separation, dirty-state display, `beforeunload` warning, valid-only export, failed-import preservation, staged dirty import replacement, reset/restore confirmation, repeated-item removal confirmation, and focus return.
- Added structural artifact status display for registry-known references without treating service availability as template runtime support.
- Added responsive wide/medium/narrow/short-height source styling with one intentional scroll region per Builder column at desktop widths.
- Updated roadmap, concepts, current context, HCI, workspace IA, simulation architecture docs, README, and AGENTS guardrails.

Boundary preserved:

- Model Schema Authoring Forms V1 creates structural model-schema artifacts; it does not execute schemas.
- Rule declarations authored in the Builder are descriptive only and remain non-executable.
- A valid authored schema is not a runnable simulation.
- The schema authoring UI does not generate templates, scenarios, RunConfigs, snapshots, or engines.
- Workspace inspection remains read-only and separate from schema authoring.
- Compatibility reports are not generated or executed.
- Social-learning rule kinds remain structural placeholders and do not activate Opinion Dynamics or social-learning semantic artifacts.
- Authoring components import no engine, template runtime, simulation store, compiler/parser/codegen, LLM, or external framework adapter.

Checks:

- `npm run test -- modelSchemaAuthoring builderUiShell modelSchema roadmap assumptions`: passed, 5 files and 43 tests.
- `npm run test -- visualBuilderWorkspace schemaTemplateCompatibility socialLearning opinion primitiveRegistry hybridComposition roadmap assumptions builderUiShell ortusBrand workspaceInformationArchitecture`: passed, 11 files and 75 tests.
- `npm run test -- control`: passed, 1 file and 8 tests.
- `npm run test -- uncertainty`: passed, 1 file and 9 tests. A prior run timed out only while the full suite competed with a concurrent production build; the isolated rerun and later full-suite rerun passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 51 files and 392 tests.
- `npm run build`: passed with Next.js 15.5.19; `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 83.22 ticks/sec, Flocking 500 agents at 16.32 ticks/sec, Forest Fire 80x60 grid at 26.17 ticks/sec, and Predator-Prey default at 78.23 ticks/sec.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Remaining limitations:

- No Chromium/Playwright/browser screenshot, DOM measurement, screen-reader, or zoom audit was available.
- Accessibility behavior is source- and unit-tested, not a formal WCAG claim.
- Metadata form editing is deliberately conservative: imported complex JSON metadata is preserved and displayed as inert read-only text.
- Invalid drafts remain in memory only and are not exportable or persisted across reloads.
- Prompt 36 Visual Builder Graph View remains future work.

Next roadmap prompt: Prompt 35B: Model Schema Authoring Forms Audit.

## 2026-06-15 - Prompt 35B Model Schema Authoring Forms Audit

Goal: audit and harden Model Schema Authoring Forms V1 without adding schema or rule execution, formulas/code/scripts, compiler/interpreter behavior, simulation preview, graph authoring, generated runtime artifacts, active simulation mutation, backend persistence, or broader visual-builder claims.

Starting state:

- Branch `main` was ahead of `origin/main` by four commits.
- Latest commit was `6ba4d75 feat: Complete Prompt 34B - Safe Builder UI Shell Audit and enhancements`.
- Prompt 35 source, documentation, and tests were staged but intentionally uncommitted; no unrelated dirty files were present.
- The running Prompt 35 development server returned HTTP 200 for `/builder`.
- No Chromium, Chrome, Firefox, Playwright, or equivalent browser inspection tool was available.

Confirmed defects:

- The three-column authoring layout could remain active below its practical minimum width and force horizontal overflow at common medium viewports.
- Destructive confirmations were visually prominent but non-modal, allowing background editing while replacement or removal was pending.
- Metadata removal bypassed the repeated-item confirmation used elsewhere.
- The full validation report acted as a live region, creating excessively broad announcements.
- Imported non-text metadata and allowed values could be silently coerced into strings by ordinary form edits.
- Unsafe schema-key validation used exact spelling and did not cover several profiling, protected-class inference, diagnosis, persuasion, targeting, and microtargeting payload names.
- The file input had no gross pre-read size rejection before handing content to the authoritative deserializer.

Audit hardening:

- Moved the Builder stacking breakpoint to `1120px`, before the three-column minimum tracks can overflow.
- Made destructive confirmation a blocking modal with focus cycling, Escape cancellation, and focus return; metadata removal now uses the same confirmation path.
- Added roving tab stops to Builder mode and schema-section tabs.
- Scoped live announcements to a concise validation status and retained text-readable field and summary errors.
- Added gross pre-read file-size rejection while keeping exact character limits and all schema authority in `deserializeModelSchema`.
- Preserved imported non-text metadata and allowed values as inert read-only JSON rather than silently changing their types.
- Expanded and normalized headless unsafe-key rejection for real-person profiling, protected-class inference, psychological diagnosis, persuasion, recommendation targeting, and microtargeting payloads.
- Kept formula/code payload rejection, artifact-family rejection, import/export validation, and runtime boundary checks in headless services and architecture tests rather than duplicating schema validation in React.

Boundary preserved:

- Model Schema Authoring Forms V1 creates structural model-schema artifacts; it does not execute schemas.
- Rule declarations authored in the Builder are descriptive only and remain non-executable.
- A valid authored schema is not a runnable simulation.
- The schema authoring UI does not generate templates, scenarios, RunConfigs, snapshots, or engines.
- The audit added no execution controls, graph authoring, compatibility conversion, social-learning activation, simulation-store mutation, template runtime import, LLM call, external API call, unsafe HTML rendering, or external framework adapter.

Checks:

- Focused cross-feature regression: passed, 14 files and 113 tests.
- `npm run test`: passed, 51 files and 396 tests.
- `npm run typecheck`: passed.
- `npm run build`: passed with Next.js 15.5.19; `/builder` prerendered successfully at 21.3 kB route size and 218 kB first-load JS.
- `npm run perf:simulation`: passed as a smoke check. Local results included Flocking 100 agents at 114.9 ticks/sec, Flocking 500 agents at 16.59 ticks/sec, Forest Fire 80x60 at 26.99 ticks/sec, and Predator-Prey default at 81.23 ticks/sec.
- `git diff --check` and `git diff --cached --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Remaining limitations:

- Browser rendering, screenshots, DOM measurement, real keyboard walkthroughs, screen-reader behavior, and 125%/150%/200% zoom remain unverified.
- Accessibility and responsive conclusions are source- and unit-test evidence, not WCAG conformance or rendered mobile-readiness claims.
- Imported non-text values are preserved read-only; V1 does not provide a general structured JSON editor.
- Invalid drafts remain memory-only and are not persisted across reloads.
- Natural-language rule descriptions remain inert text and are never parsed or executed; the UI does not pretend a heuristic code-language classifier provides an execution-security boundary.
- Performance smoke does not prove Builder performance or engine scalability. The 500-agent flocking smoke still recorded 7.72 million pairwise checks and only 16.59 ticks/sec.
- Prompt 35 and Prompt 35B remain uncommitted in a mixed staged/unstaged worktree.

Next roadmap prompt: Prompt 36 Visual Builder Graph View V1 only after reviewing and committing the combined Prompt 35/35B work and restoring a clean repository checkpoint.
