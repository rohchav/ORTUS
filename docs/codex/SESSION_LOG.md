# ORTUS Codex Session Log

## 2026-07-27 - Prompt C1 Starter World Content Framework + Explore-Worlds Catalog

Goal: turn the seven current production templates into a strict, source-backed, explorable Starter World library without changing simulation behavior, adding persistence, or implying unsupported runtime capability.

Starting state:

- Clean aligned `main` and `origin/main` at `434a214` (`test: audit world layout and interaction`).
- R1, R1B, R2, and R2B complete.
- Baseline rendered Start and World-entry captures recorded before implementation.
- Required R2B baseline had passed 115 UI tests, 75 files / 610 unit tests, typecheck, build, simulation/Atlas performance smoke, and `git diff --check`.

Implemented:

- Strict Zod `StarterWorldDefinition` version `"1"` with bounded identity, runtime status, taxonomy, anatomy, investigation, provenance, remix, and future-expansion data.
- Validated deterministic registry for Collective Motion, Local Contact Outbreaks, Opinion Formation, Predator-Prey Cycles, Neighborhood Patterns, Landscape Spread, and Signal Cascades.
- Runtime-reference checks against production templates, initialization presets, metrics, parameters, and interventions, including authoritative labels and suggested-value bounds.
- Deterministic non-LLM content lint for duplicate/generic content, unsupported claims, raw runtime IDs, unnamed changes, excessive boundaries, and future-as-current language.
- `/worlds` with one featured invitation, seven differentiated deterministic system illustrations, Domain/Mechanism/System form/Complexity filters, normalized AND search, active-filter text, and honest empty/reset state.
- `/worlds/[slug]` with question, premise, represented anatomy, mechanisms, baseline, specific first change, outputs, investigations, verified research connection, one model boundary, full-reference link, and explicit remix readiness.
- Strict ID-only launch adapter and World route validation. Every canonical launch uses the existing scenario path and creates a fresh deterministic paused tick-0 run. Invalid IDs or mismatches stop before constructing World.
- Definition-driven dismissible World nudge with detail back link and focus return to the stage.
- A researched 24-candidate portfolio split exactly into eight Tier A, eight Tier B, and eight Tier C candidates, with explicit engine fit, gaps, risk, multiscale needs, and original fictional-system rules.
- Focused headless and rendered coverage for schema, unsafe data, quality lint, source structure, deterministic query behavior, all seven detail routes and handoffs, six viewports, mobile order, focus, Back/reload semantics, failure boundaries, diagnostics, reduced motion, Axe, and no new storage.

Research process:

- Current-world references were verified at ACM/DOI, APS, Royal Society, Taylor and Francis/DOI, Nature, EPFL, and journal metadata.
- Portfolio-only anchors were checked at INFORMS, APS, Institution of Civil Engineers/Crossref metadata, Cambridge University Press, University of Chicago Press, Oxford University Press, Nature/PubMed, Cell/Elsevier metadata, MIT Press, IPCC, and USGS.
- References are labeled as canonical model, mechanism inspiration, research context, educational context, or historical context. They do not validate or calibrate ORTUS.

Boundaries:

- No simulation implementation, template logic, scenario logic, default, bound, metric, intervention, Experiment Runner, comparison persistence, Atlas execution, Builder execution, backend, dependency, or storage key was added or changed.
- Starter World `defaultScenarioId` identifies an existing authoritative initialization preset; C1 does not create a parallel scenario registry.
- Portfolio items are documentation only. Tier A is an implementation-readiness judgment, not a runtime claim.
- Actual participant comprehension, browser zoom, screen-reader/assistive-technology use, forced colors, complete touch workflow, educational outcomes, and WCAG conformance remain unverified.

Final verification:

- Focused C1 Playwright: 14 passed.
- Required Research World shell Playwright: 53 passed.
- Full UI Playwright against the optimized production build: 129 passed.
- Required catalog, seven detail, and desktop/mobile World-launch screenshots were captured and inspected.
- Typecheck: passed.
- Unit tests: 76 files / 621 tests passed.
- Production build: passed; `/worlds` is static, all seven `/worlds/[slug]` routes are generated, and `/world` remains dynamic.
- Simulation performance: passed.
- Atlas smoke: completed 2 runs / 10 work units at tick 5 in 51.68 ms on this machine; this is not a scalability estimate.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`
- Actual browser zoom, screen-reader/assistive-technology use, forced colors, complete touch workflow, participant comprehension, educational outcomes, and WCAG conformance remain unverified.

Decision: C1 complete and ready for the required independent C1B audit. C1B is next; C2 and F1 remain unstarted.

## 2026-07-15 - Prompt GW9B Ephemeral Landscape Sampling Preview V1 Audit and Hardening

Goal: audit GW9 as a real but narrow Flocking-only runtime slice, fix only demonstrated defects, and block any inference of generic landscape execution, persistence, regime detection, confidence, validation, or broader template support.

Starting state:

- Clean aligned `main` and `origin/main` at `67e2692` (`feat: add ephemeral landscape sampling preview`).
- Baseline focused Playwright: 50 passed; full UI Playwright: 65 passed.
- Baseline typecheck, 70 files / 581 unit tests, production build, simulation/per-preview performance, and `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Audit findings and hardening:

- Canonical seed lists were order-sensitive. Requests now normalize negative zero and sort unique seeds numerically; fixed scenario keys are also sorted.
- Route unmount did not explicitly stop remaining cooperative execution. Cleanup now cancels the active signal and suppresses post-unmount progress/result state updates.
- Provenance omitted request artifact/schema version and planned/attempted/successful counts. Those available fields are now visible; no separate engine version is invented.
- Replacement copy did not identify whether output was current or stale, invalid controls lacked an explicit ARIA error-summary association, and two required epistemic sentences were only paraphrased. All three boundaries are now explicit.
- Adversarial tests now cover forged identity/derived fields, prototype-like keys, exact 5,000/5,001 handling, decimal/integer axes, canonical seeds, exact tick N and N-1/N+1 rejection, factory freshness, failure stages, non-finite metrics, progress, zero versus absence, engine non-retention, registry/source isolation, and roadmap status.
- Rendered tests add integer-axis and matrix-orientation proof, complete provenance, replacement confirmation, zero versus no-value, accessible failed/retry, route-unmount cancellation, literal in-flight reload reset, no-storage checks, and required epistemic copy.
- The required repository-wide scope search classified matches as pre-existing implementation, guardrails/future boundaries, GW9 negative language, or negative tests. No unexpected GW9 persistence, queue, worker, interpolation, regime, confidence, personalization, Builder execution, World mutation, random identity, or publication path was found.

Rendered audit notes:

- A stale Next.js process from before the audit occupied port 3000 and twice left World in its initialization placeholder. Terminating only that stale local process restored clean current-tree runs; no product timeout was changed.
- Completed two-axis output was visually inspected at `900x700` with no document horizontal overflow and correct X-column/Y-row orientation.
- Headless Ctrl-plus attempts did not change browser metrics. Actual browser zoom at 125%, 150%, and 200% was not verified.
- Screen-reader, assistive-technology, forced-colors, mobile-workflow, user-comprehension, and WCAG conformance remain unverified.

Final verification:

- Focused Playwright: 53 passed.
- Full UI Playwright: 68 passed.
- Typecheck: passed.
- Unit tests: 70 files / 590 tests passed.
- Production build: passed; `/atlas` remained a static route.
- Simulation performance: passed.
- Preview smoke: completed 2 runs / 10 work units at tick 5 in 28.07 ms on this machine; this is not a scalability estimate.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Decision: GW9B complete. The next documented roadmap milestone is `F1: Fractal Metrics V1`, ready after commit publication and not started here. Commit locally with `test: audit ephemeral landscape sampling preview`; do not push.

## 2026-07-15 - Prompt GW9 Ephemeral Landscape Sampling Preview V1

Goal: add the first real bounded Atlas sampling capability without turning conceptual probe plans into generic execution or adding persistence, interpolation, regime detection, World mutation, Experiment Runner mutation, Builder execution, or scientific claims.

Starting state:

- Clean `main` at `aea6e01`, aligned with `origin/main` after UX6B.
- Focused Playwright baseline: 43 passed.
- Full UI Playwright baseline: 58 passed.
- Unit baseline: 69 files / 565 tests.
- Typecheck, production build, simulation performance smoke, and `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Implemented:

- Explicit GW9 capability for `flocking-boids`, one bundled validated scenario, five bounded numeric parameters, and three existing final-tick numeric metrics.
- Strict canonical request/result/run/point models, inclusive deterministic axis generation, integer-axis duplicate rejection, explicit ordered seeds, full generated RunConfig validation, 25-point/250-tick/5,000-work-unit limits, and deterministic data-only identity.
- Shared authoritative RunConfig-to-engine factory used by uncertainty execution and Atlas without sharing UI/store state.
- Sequential fresh-engine executor with exact progress, cooperative yields between runs, honest cancellation between samples, typed fatal/sample/metric errors, deterministic Kahan aggregation, partial/failed points, and no retained engines.
- Explicit probe-plan mapping audit and rejection: the existing conceptual artifact has no stable runtime IDs or exact values, so no fields are invented or silently discarded and no handoff action is exposed.
- Atlas component-local configuration, validation/error focus, work estimate, lifecycle states, replacement dialog, stale/clear semantics, exact one-axis table/two-axis matrix, per-seed runs, in-memory provenance, result warnings, reload reset, and capability guidance.
- Focused headless and rendered tests covering deterministic execution, isolation, cancellation, partial errors, accessibility, responsive/short-height behavior, reduced motion, diagnostics, and no new storage.
- A small executor smoke was added to `npm run perf:simulation`; it is not a scalability estimate.

Boundaries:

- Only displayed coordinates are sampled; no values between them are inferred.
- No saved landscape, Atlas history, Lab record, comparison record, publication, interpolation, smoothing, contour, regime/transition detection, confidence estimate, validation, empirical claim, recommendation, personalization, server execution, queue, worker pool, or dependency was added.
- Actual browser zoom at 125%, 150%, and 200% was not verified.
- Screen-reader, assistive-technology, forced-colors, mobile-workflow, user-comprehension, and WCAG conformance remain unverified.

Final verification:

- Focused Playwright: 50 passed.
- Full UI Playwright: 65 passed.
- Typecheck: passed.
- Unit tests: 70 files / 581 tests passed.
- Production build: passed.
- Simulation performance smoke: passed; GW9 preview smoke completed 2 runs / 10 work units in 26.53 ms on this machine.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Decision: Ready for GW9B. GW9 complete. GW9B required next. The final response records the resulting local commit hash.

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

## 2026-06-15 - Prompt 36 Visual Builder Graph View V1

Goal: add bounded, deterministic, read-only structural graph visualization to Builder without graph authoring, schema execution, runtime generation, compatibility conversion, social-learning activation, or simulation-state mutation.

Starting state:

- Branch `main` was clean and ahead of `origin/main` by five commits.
- Latest commit was `7696381 feat: Implement Model Schema Authoring Forms V1`, containing the completed Prompt 35 and Prompt 35B work.
- No unrelated dirty files were present.

Implementation:

- Added a third Builder mode, `Graph View`, for the currently loaded validated `ortus.visualBuilderWorkspace`.
- Added a pure UI presentation adapter that clones validated workspace data, preserves ids, kinds, statuses, references, markers, warnings, notes, and inert metadata, and marks the graph, every node, and every edge non-executable.
- Uses bounded source coordinates where present and deterministic layered fallback coordinates otherwise. No force simulation, randomness, animation loop, canvas, WebGL, or major graph dependency was added.
- Added local-only search, node-kind/status/warning filters, unsupported/future visibility controls, selected-neighborhood highlighting, pan, zoom, fit, reset, node selection, edge selection, and read-only inspection.
- Added HTML node controls, visual-only SVG relationship lines, a grouped keyboard-accessible node outline, and a keyboard-accessible text edge list.
- Added explicit “Workspace claim” presentation for `templateRuntimeSupported` so artifact metadata is not mistaken for proven runtime support.
- Added a visual drawing limit of 120 nodes and 240 edges. Larger artifacts retain the full filtered outline and text edge list.
- Graph View is mounted only while active, does not read or mutate the Author Schema draft, and does not subscribe to simulation ticks.
- Schema-derived graphs and compatibility-report graphs remain deferred. No workspace is generated from a schema.

Boundary preserved:

- Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges.
- Graph selection, filtering, panning, and zooming are UI-only state.
- Graph View is not visual programming, schema execution, or runtime generation.
- A graph that looks complete is still not a runnable model.
- No Run, Compile, Preview, Generate, Apply, drag/drop, connect-handle, graph mutation, formula/code execution, external call, LLM call, template-runtime import, engine import, or simulation-store mutation was added.

Checks:

- Focused graph, Builder, roadmap, brand, workspace-IA, model-schema authoring, and visual-workspace checks passed.
- Cross-feature structural/runtime-boundary regression passed, 15 files and 118 tests.
- `npm run typecheck`: passed.
- `npm run test`: passed on the final uncontended run, 53 files and 409 tests.
- One earlier full-suite run timed out only in the existing uncertainty integration test at its 5-second limit; `npm run test -- uncertainty` then passed, 1 file and 9 tests, and the final full suite passed.
- `npm run build`: passed with Next.js 15.5.19; `/builder` prerendered successfully at 27.7 kB route size and 224 kB first-load JS.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 115.49 ticks/sec, Flocking 500 agents at 20.96 ticks/sec, Forest Fire 80x60 at 33.57 ticks/sec, and Predator-Prey default at 102.19 ticks/sec.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Remaining limitations:

- No Chromium, Firefox, Playwright, screenshot, DOM measurement, screen-reader, or browser zoom tooling was available.
- The sandbox denied local socket access, and the escalated dev-server request was rejected by the environment usage gate. A live `/builder` route probe was therefore unavailable; only the successful production prerender is verified.
- Accessibility, responsive behavior, node/edge hit targets, and SVG/text equivalence are source- and unit-tested, not formally browser-audited or WCAG-certified.
- V1 graphs only the currently loaded visual-builder workspace. It does not graph the in-memory Author Schema draft.
- Fit uses a conservative 10% minimum zoom for widely spaced bounded source coordinates; very large visual graphs use the outline fallback.
- Prompt 36 changes remain uncommitted.

Next roadmap prompt: Prompt 36B Visual Builder Graph View Audit.

## 2026-06-15 - Prompt 36B Visual Builder Graph View Audit

Goal: audit and harden Prompt 36 Graph View without adding graph authoring, drag/drop, connect handles, edge/node creation, schema execution, runtime preview, artifact generation, simulation mutation, or a major graph library.

Starting state:

- Latest commit remained `7696381 feat: Implement Model Schema Authoring Forms V1`.
- Prompt 36 source, tests, CSS, and documentation were dirty and uncommitted.
- No unrelated dirty files were identified beyond the Prompt 36/36B working set.

Confirmed defects:

- Graph summary counts collapsed marker counts and global runtime-boundary report notices under generic warning-style language.
- Inspector connection links could select nodes or edges hidden by the current filters, causing incoherent selection recovery.
- Required persistent copy was incomplete, and static runtime-boundary copy used live-region semantics.
- Fit Graph used fixed assumed dimensions instead of the actual graph surface.
- Sanitized DOM ids could collide for distinct node ids.
- Layout and adapter tests did not fully exercise mutation isolation, edge-threshold fallback, stale selections, single/disconnected/repeated-kind graphs, or collision-free focus ids.

Hardening:

- Separated validation markers, warning markers, unsupported markers, future-only markers, unsupported items, future-only items, service-only items, global notices, and missing runtime capabilities.
- Rendered hidden connected inspector targets as text marked `hidden by current filters`.
- Added exact required Graph View non-execution copy and changed static safety copy to `role="note"`.
- Fit Graph now derives zoom from the actual graph surface dimensions when available.
- Added collision-free graph-node DOM ids, deterministic code-unit sorting, grouped marker lookup, explicit cloning of notes/metadata/position data, and a bounded O(n) fallback layout pass by kind.
- Kept graph metadata text-only and non-executing, with no engine/template/store/runtime imports or graph authoring controls.
- Updated README, roadmap, concepts, simulation docs, HCI audit, workspace IA, current context, AGENTS guardrails, and roadmap tests to mark Prompt 36B complete and Prompt 37 next after commit.

Checks:

- Focused graph tests: passed, 2 files and 16 tests.
- Focused graph/builder/schema/visual-workspace/roadmap/assumptions checks passed, 7 files and 58 tests.
- `npm run test -- modelSchema`: passed, 2 files and 30 tests.
- `npm run test -- schemaTemplateCompatibility`: passed, 1 file and 5 tests.
- `npm run test -- socialLearning opinion primitiveRegistry hybridComposition`: passed, 4 files and 35 tests.
- `npm run typecheck`: passed.
- `npm run test`: passed, 53 files and 412 tests.
- `npm run build`: passed with Next.js 15.5.19; `/builder` prerendered successfully at 28.5 kB route size and 225 kB first-load JS.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 107.61 ticks/sec, Flocking 500 agents at 15.68 ticks/sec, Forest Fire 80x60 at 24.73 ticks/sec, and Predator-Prey default at 72.85 ticks/sec.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`
- Initial sandboxed dev server failed with `listen EPERM`; escalated dev server succeeded on `127.0.0.1:38017`, and escalated `curl -I http://127.0.0.1:38017/builder` returned HTTP 200. The dev server was stopped.

Remaining limitations:

- Browser screenshots, DOM measurement, responsive viewport inspection, browser zoom inspection, and assistive-technology behavior remain unverified.
- The HTTP 200 route probe and production prerender do not prove visual layout, keyboard walkthrough quality, or WCAG conformance.
- Graph View still graphs only the loaded `ortus.visualBuilderWorkspace`; it does not graph the in-memory Author Schema draft, generate workspaces from schemas, or execute compatibility/social-learning artifacts.
- Prompt 36 and Prompt 36B changes remain uncommitted and should be reviewed together.

Next roadmap prompt after commit: Prompt 37 Schema Validation UX + Repair Suggestions V1.

## 2026-06-16 - Prompt 37 Schema Validation UX + Repair Suggestions V1

Goal: add schema validation UX and bounded repair suggestions to Author Schema without adding schema execution, formula/code parsing, compatibility conversion, generated artifacts, visual-builder authoring, runtime preview, LLM repair, or simulation-state mutation.

Starting state:

- Latest commit was `6eeaffe feat: add Builder Graph View and ViewModel`.
- Worktree was clean before Prompt 37 began.
- Prompt 36 and Prompt 36B were already committed.

Implementation:

- Added `src/components/builder/validation/schemaValidationUx.ts` as a pure validation-assistance adapter over the existing model-schema capability report.
- Added grouped issue modeling with structural status, error/warning/suggestion/manual counts, unsupported capability counts, service-only/future-only notices, original validation messages, paths, section mapping, copyable text diagnostics, and persistent repair-boundary phrases.
- Added bounded named repair operations only: top-level string trim, declaration-id trim, unsafe top-level metadata-key removal, and executable-flag reset to false.
- Added stale-suggestion hashing so suggestions computed for an older draft are rejected without mutation.
- Added post-apply validation through the existing model-schema service.
- Kept ambiguous duplicate ids, unknown references, invalid enum/model intent, oversized content, unsupported capabilities, and runtime-boundary warnings manual-only.
- Integrated the Author Schema validation panel with expandable issue groups, issue cards, section/field jumps, confirmation-gated content-removing repairs, disabled reasons, manual guidance, copyable issue details, and a polite status region.
- Preserved current draft/local UI state only. Repair suggestions do not mutate last-valid artifacts, active simulation state, loaded visual workspaces, templates, scenarios, RunConfigs, snapshots, engines, compatibility reports, or social-learning artifacts.
- Updated README, roadmap, concepts, simulation docs, HCI audit, workspace IA, current context, AGENTS guardrails, planned roadmap, and roadmap/model-schema/control tests. Prompt 37 is now marked complete and Prompt 37B is next.

Boundary preserved:

- Repair suggestions are structural editing assistance. They do not make a schema runnable.
- A repaired schema may be structurally valid and still have no runtime implementation.
- ORTUS does not infer the correct model behavior from validation repairs.
- Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines.
- No LLM repair, automatic model generation, arbitrary JSON Patch/path interpreter, schema execution, formula parsing, code/script execution, dynamic import, external API call, compatibility conversion, social-learning artifact execution, visual-builder workspace generation, runtime preview, or simulation mutation was added.

Checks:

- Focused schema validation adapter and authoring tests: passed, 2 files and 27 tests.
- Roadmap alignment test: passed, 1 file and 4 tests.
- Focused regression pack for modelSchema, modelSchemaAuthoring, builderUiShell, visualBuilderWorkspace, schemaTemplateCompatibility, socialLearning, opinion, primitiveRegistry, hybridComposition, and roadmap: passed, 10 files and 87 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 54 files and 421 tests.
- `npm run build`: passed with Next.js 15.5.19; `/builder` prerendered successfully at 34.6 kB route size and 231 kB first-load JS.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 158.4 ticks/sec, Flocking 500 agents at 20.71 ticks/sec, Forest Fire 80x60 at 33.3 ticks/sec, and Predator-Prey default at 96.07 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- Sandboxed dev server failed with `listen EPERM`; escalated `npm run dev -- --hostname 127.0.0.1 --port 38037` succeeded.
- Escalated `curl -I http://127.0.0.1:38037/builder` returned HTTP 200.

Remaining limitations:

- Browser screenshots, DOM measurement, responsive viewport inspection, browser zoom inspection, clipboard behavior, focus-return behavior, and assistive-technology behavior remain unverified.
- Source and unit tests cover the accessibility hooks, but they are not a WCAG conformance claim.
- Prompt 37 validation UX has not yet had the required Prompt 37B audit.
- Prompt 37 changes remain uncommitted.

Next roadmap prompt after commit: Prompt 37B Schema Validation UX + Repair Suggestions Audit.

## 2026-06-16 - Prompt 37B Schema Validation UX + Repair Suggestions Audit

Goal: audit and harden Prompt 37 validation UX and repair suggestions without adding schema execution, rule execution, generated artifacts, compatibility conversion, visual programming, runtime preview, LLM repair, or simulation-state mutation.

Starting state:

- Prompt 37 changes were dirty and uncommitted.
- Dirty worktree files matched the Prompt 37 feature/docs/test band plus the new `src/components/builder/validation/` directory.
- The requested `src/simulation/hybridComposition` path does not exist in this repo; the implemented hybrid composition service is `src/simulation/composition`.
- A local `/builder` route probe before edits returned HTTP 200 through approved unsandboxed `curl -I`.

Audit findings and fixes:

- Found and fixed a real boundary defect: confirmation-required repair suggestions were gated by the UI but could still be applied by the shared helper.
- Added explicit `canApply` classification to repair suggestions and counted suggestions from that applyability contract.
- Required `{ confirmed: true }` for confirmation-level repairs in `applySchemaRepairSuggestion`.
- Rejected malformed fabricated patches and prototype-like metadata patch targets before draft mutation.
- Kept prototype-like unsafe metadata manual-only rather than offering automatic deletion.
- Made issue group order deterministic and routed unknown validation messages to `Other structural issues`.
- Added required rule repair copy: `Rule repair suggestions only edit structural declarations. They do not execute or validate behavior.`
- Added missing/stale field-focus fallback copy for issue jumps.
- Strengthened export/import-after-repair coverage so repaired drafts serialize through the model-schema serializer and do not include repair UI state.
- Updated README, roadmap, concepts, simulation docs, HCI audit, workspace IA, current context, AGENTS guardrails, planned roadmap, and roadmap/model-schema/control tests. Prompt 37B is now marked complete and Prompt 38 is next after commit.

Boundary preserved:

- Repair suggestions are structural editing assistance. They do not make a schema runnable.
- A repaired schema may be structurally valid and still have no runtime implementation.
- ORTUS does not infer the correct model behavior from validation repairs.
- Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines.
- No LLM repair, automatic model generation, arbitrary JSON Patch/path interpreter, schema execution, rule execution, formula parsing, code/script execution, dynamic import, external API call, compatibility conversion, social-learning artifact execution, visual-builder workspace generation, runtime preview, or simulation mutation was added.

Checks:

- Focused validation UX and authoring tests before docs: passed, 2 files and 34 tests.
- Focused audit/doc pack: passed, 5 files and 58 tests.
- Focused regression pack for modelSchema, visualBuilderWorkspace, schemaTemplateCompatibility, socialLearning, opinion, primitiveRegistry, hybridComposition, roadmap, assumptions, builderUiShell, builderGraph, schemaValidationUx, and modelSchemaAuthoring: passed, 14 files and 126 tests.
- `npm run typecheck`: failed once on a widened test fixture type, then passed after the fixture was typed as a model-schema entity declaration.
- `npm test`: passed, 54 files and 428 tests.
- `npm run build`: passed with Next.js 15.5.19; `/builder` prerendered successfully at 35.4 kB route size and 232 kB first-load JS.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 104.36 ticks/sec, Flocking 500 agents at 16.15 ticks/sec, Forest Fire 80x60 at 25.54 ticks/sec, and Predator-Prey default at 74.59 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- Browser binaries checked with `command -v chromium`, `chromium-browser`, `google-chrome`, and `firefox`; none were available.

Remaining limitations:

- Post-edit local HTTP route probing could not be repeated because the escalation request was rejected by the environment usage-limit gate. Earlier same-session `/builder` HTTP probe returned 200, and the post-edit production build prerendered `/builder`.
- Browser screenshots, DOM measurement, responsive viewport inspection, browser zoom inspection, clipboard behavior, focus-return behavior, keyboard walkthrough quality, and assistive-technology behavior remain unverified.
- Source and unit tests cover the accessibility hooks, but they are not a WCAG conformance claim.
- Prompt 37 and 37B changes remain uncommitted.

Next roadmap prompt after commit: Prompt 38 Schema-to-Template Fit Report V1.

## 2026-06-19 - Prompt 38 Schema-to-Template Fit Report V1

Goal: add a user-facing schema-to-template fit report for valid Author Schema drafts without adding schema execution, schema-to-template conversion, scenario/RunConfig/snapshot/template/engine/agent generation, runtime preview, rule parsing, Builder graph execution, Neural Strategy Adaptation generalization, MR0 runtime implementation, validation/calibration claims, LLM behavior, external APIs, or simulation-state mutation.

Initial state:

- `git status --short` was clean before Prompt 38 began.
- Latest commit observed before edits: `5552428 docs: add templates and decision clusters mini-roadmap`.
- Prompt MR0 was committed, so Prompt 38 was the next roadmap prompt.

Implemented:

- Added `src/components/builder/fitReport/schemaTemplateFitReportUx.ts` as a pure report adapter over the existing headless `schemaTemplateCompatibility` service.
- Added `SchemaTemplateFitReportPanel` inside Builder `Author Schema`, in the existing side column below validation.
- Fit reports operate only on the current structurally valid draft. Invalid drafts stay editable and show the required unavailable state.
- Reports show closest templates, structural score, matched concepts, partial concepts, unsupported concepts, lossy mappings, future-only gaps, runtime gaps, template assumptions, refresh, section jumps, and copyable diagnostics.
- Empty template-profile sets show `No template mapping profiles are available. This does not make the schema invalid.`
- MR0 terms such as decision clusters, Atmospheric Field Dynamics, and Blackjack Sequential Decision Lab are surfaced only as future-only fit gaps.
- Added focused tests for deterministic reports, invalid/empty states, unknown valid profiles, mutation isolation, weak-fit language, unsupported/lossy/future/runtime gap preservation, source guardrails, and Author Schema integration.
- Updated README, concepts, roadmap, planned roadmap, simulation README, HCI audit, workspace IA, current context, AGENTS guardrails, and roadmap/model-schema/control tests. Prompt 38 is now marked complete and Prompt 38B is next.

Required boundary copy:

- Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models.
- A strong template fit does not mean a schema can run.
- Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents.
- Unsupported and lossy mappings must remain visible; they must not be silently dropped.
- Rule fits are structural comparisons. Rule declarations are not executed.
- Fit score is a structural summary, not a runtime readiness score.
- Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles.
- Builder graphs remain structural inspection views. Fit reports do not make them executable.
- Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability.
- MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report.

Non-goals preserved:

- No schema execution, rule execution, formula parsing, code execution, compatibility conversion, template mutation, generated artifacts, hidden interpreter, simulation-store subscription, runtime preview, Builder graph execution, social-learning runtime, Neural Strategy Adaptation activation, MR0 capability implementation, LLM behavior, external API call, validation/calibration claim, or scientific-truth claim was added.
- The report does not mutate drafts, last-valid artifacts, active simulation state, loaded visual workspaces, templates, scenarios, RunConfigs, snapshots, engines, compatibility reports, or social-learning artifacts.

Checks:

- `npm test -- roadmap modelSchema control schemaTemplateFitReportUx modelSchemaAuthoring schemaValidationUx workspaceInformationArchitecture`: passed, 7 files and 75 tests.
- `npm run typecheck`: passed.
- `npm test -- schemaTemplateCompatibility`: passed after restoring the legacy exact compatibility phrase in audited docs, 1 file and 5 tests.
- `npm test -- assumptions`: passed, 1 file and 8 tests.
- `npm test -- neural`: passed, 2 files and 19 tests.
- `npm test -- builderGraphView`: passed, 2 files and 16 tests.
- `npm test`: passed, 57 files and 459 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 107.20 ticks/sec, Flocking 500 agents at 12.71 ticks/sec, Forest Fire 80x60 at 23.17 ticks/sec, and Predator-Prey default at 56.44 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser-rendered layout, browser clipboard behavior, focus-return behavior, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- Prompt 38 changes remain uncommitted.

Next roadmap prompt after commit: Prompt 38B Schema-to-Template Fit Report Audit.

## 2026-06-19 - Prompt MR0 Templates + Decision Clusters Mini-Roadmap

Goal: add a documentation-only mini-roadmap for near-term runtime templates, decision-cluster generalization, stimulus-conditioned decision clusters, a later offline blackjack/sequential decision lab, and a later observed-cluster analytics layer before returning to Prompt 38.

Starting state:

- `git status --short`: clean.
- Latest commit before MR0 was `1a8eda0 feat: add neural strategy adaptation`, confirming Prompt N2 and Prompt N2B were committed.
- Prompt MR0 was explicitly scoped to docs/roadmap updates only. It did not authorize runtime code, UI behavior, new templates, new primitives, decision-cluster execution, blackjack execution, external-stimulus runtime, observed cluster discovery, wearable support, camera input, live-card input, casino assistance, or gambling advice.

Documentation updates:

- Updated planned roadmap, public roadmap, README, concepts, current context, simulation README, HCI audit, workspace IA, AGENTS guardrails, and roadmap status tests.
- Documented the required order: MR0, Prompt 38, Prompt 38B, T1/T1B Urban Daily Routine / Activity Choice, T2/T2B Atmospheric Field Dynamics, DC1/DC1B Cluster-Based Decision Readout Generalization, DC2/DC2B Stimulus-Conditioned Decision Clusters, G1/G1B Blackjack Sequential Decision Lab, and DC3/DC3B Observed Cluster Discovery / Decision-Space Analytics.
- Added exact guardrails that decision clusters model observable state-action patterns rather than thoughts, outputs are probabilities rather than certainties, labels are assigned modeling labels, external stimuli are modeled inputs rather than evidence of internal mental state, observed clusters are analytical groupings rather than psychological profiles, and blackjack work is offline simulation only.
- Preserved Prompt N2/N2B constraints: no generic decision analytics runtime, no external-stimulus runtime, no blackjack implementation, no wearable/camera/live-casino functionality, no cognition/biological-plasticity claims, no Builder graph execution, no Model Schema execution, and no social-learning runtime expansion.

Checks:

- `npm run test -- roadmap`: passed, 1 file and 4 tests.
- `npm run test -- roadmap assumptions`: passed, 2 files and 12 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 56 files and 449 tests.
- `npm run build`: passed; Next.js prerendered `/` and `/builder`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 111.42 ticks/sec, Flocking 500 agents at 16.88 ticks/sec, Forest Fire 80x60 at 27.18 ticks/sec, and Predator-Prey default at 78.74 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- MR0 is documentation only. No future template, decision-cluster, stimulus-conditioned, blackjack, or observed-cluster runtime is implemented by this work.
- Prompt 38 remains the next roadmap prompt after the MR0 commit checkpoint.

## 2026-06-19 - Prompt N2B Neural Strategy Adaptation Audit

Goal: audit and harden Prompt N2 Neural Strategy Adaptation without broadening beyond the Neural Runtime Lab RPS/readout mode, without starting Prompt 38, and without adding cognition, biological plasticity, profiling, Builder graph execution, Model Schema execution, social-learning runtime, blackjack, generic decision analytics, or external stimuli.

Starting state:

- Prompt N2 changes were still uncommitted because `.git` was read-only in the sandbox and the prior `git add` escalation had been rejected.
- Dirty files were N2-related only.
- Prompt N2 reported typecheck, focused Neural tests, full suite, build, perf smoke, and `git diff --check` passing before N2B.

Audit findings and hardening:

- Found a real reset/truncation defect: N2 used an array-position reset cursor. If the RPS history window was full, Reset learned strategy could set the cursor to the bounded array length; future rounds were then sliced away because the bounded array never grew past that cursor.
- Replaced the reset guard with round-index semantics through `roundsAfterNeuralStrategyReset`, so old bounded history cannot rehydrate learned state and new rounds after reset are counted even after truncation.
- Replaced `rpsRounds.length + 1` round numbering with `nextNeuralRpsRoundIndex`, so round indexes remain monotonic when history is capped.
- Filtered malformed RPS round objects before distribution/statistics/adaptation updates and rejected arbitrary RPS action labels in adaptive cue helpers.
- Made fresh-run/rebuild timeline copy explicit: scenario setup, plain-English setup, Reset activity, and Regenerate network do not clear local learned strategy unless Reset learned strategy is used.
- Preserved the existing boundary: adaptation remains local UI/view-model RPS/readout state and bounded output-assembly stimulus/readout-bias behavior only. It does not mutate core synapse weights, update topology, persist a user profile, infer beliefs/intentions/preferences/personality, execute Builder graphs, execute Model Schemas, activate social-learning artifacts, or add a hidden interpreter.
- Updated README, roadmap docs, concepts, current context, HCI audit, workspace IA, simulation README, planned roadmap, AGENTS guardrails, and roadmap tests to mark Prompt N2B complete and Prompt 38 next after the N2/N2B commit checkpoint.

Checks:

- `git status --short`: dirty N2/N2B files only.
- `npm run test -- neuralRuntimeLab template.neuralExcitation`: passed, 2 files and 19 tests.
- `npm run typecheck`: passed.
- `npm run test -- roadmap workspaceInformationArchitecture neuralRuntimeLab template.neuralExcitation`: passed, 4 files and 30 tests.
- `npm run test -- neural templates modelSchema visualBuilderWorkspace schemaTemplateCompatibility socialLearning opinion primitiveRegistry hybridComposition roadmap assumptions builderUiShell workspaceInformationArchitecture`: passed, 14 files and 122 tests.
- Static privacy/boundary scan found only tests and guardrail/docs mentions for banned terms; no forbidden implementation path was found in the Neural Lab source.
- `npm test`: passed, 56 files and 449 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 147.89 ticks/sec, Flocking 500 agents at 20.88 ticks/sec, Forest Fire 80x60 at 31.57 ticks/sec, and Predator-Prey default at 78.62 ticks/sec.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Rendered responsive, zoom, keyboard walkthrough, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- N2/N2B remain a narrow Neural Runtime Lab RPS/readout slice only, not generic adaptive agents, reinforcement learning, biological plasticity, human cognition, user profiling, model-schema execution, Builder graph execution, or social-learning runtime.

Next roadmap prompt after the N2/N2B commit checkpoint: Prompt 38 Schema-to-Template Fit Report V1.

## 2026-06-18 - Prompt N2 Neural Strategy Adaptation V1

Goal: add bounded Neural Runtime Lab Rock-Paper-Scissors strategy adaptation without adding cognition, biological plasticity, hidden schema/builder execution, persistent user profiling, or core synapse-weight updates.

Implemented:

- Upgraded the RPS shell into an Adaptive RPS Challenge with Start adaptive challenge, Pause challenge, Choose Rock/Paper/Scissors, Enable adaptation, Reset learned strategy, Clear round history, and Show/Hide adaptation details controls.
- Added local lab-specific adaptation types/config/state for bounded RPS history, choice counts, transition counts, pattern confidence, rolling win/draw/loss metrics, readout-bias values, deterministic exploration, and reset/clear behavior.
- Changed local challenge scoring to use the explicit player choice as the opponent choice for the round; template fixed-opponent payoff remains separate.
- Added deterministic frequency/transition prediction and counter-choice mapping. Repeated Rock shifts bounded tendency toward Paper; repeated Paper shifts toward Scissors; repeated Scissors shifts toward Rock.
- Applied adaptation through bounded output-assembly stimulus/readout-bias behavior rather than mutating core synapse weights.
- Kept learned strategy state in React/view-model memory only; no browser storage, external API, user identity, protected-class field, psychological field, biography, document, embedding, model weight, or profile persistence was added.
- Added mission rows, live explanations, timeline events, and adaptation details for active mode, round count, rolling results, predicted move/counter-choice, confidence, exploration rate, bias summary, choice counts, transition summary, entropy, and reset controls.
- Updated Neural template/intervention wording so template RPS payoff is still observational and does not train, optimize, mutate synapses, or update biological/plasticity fields, while N2 lab adaptation is explicitly local readout-bias state.
- Updated README, roadmap docs, concepts, current context, HCI/IA docs, simulation README, and AGENTS guardrails for N2.

Required boundary copy added:

- Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference.
- The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time.
- Learned strategy state is local model state, not a psychological profile.
- Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning.
- Adaptation adjusts bounded readout bias. It does not rewrite the neural graph or simulate biological synaptic learning.
- Against truly random play, Rock-Paper-Scissors has no exploitable pattern. The adaptive readout should not be expected to win above chance over time.
- Adaptation metrics describe local game-state updates, not beliefs, intentions, or personality.

Checks:

- `git status --short`: clean before edits.
- Baseline `npm run test -- neuralRuntimeLab template.neuralExcitation`: passed before edits, 2 files and 15 tests.
- `npm run typecheck`: passed.
- `npm run test -- neuralRuntimeLab template.neuralExcitation`: passed, 2 files and 17 tests.
- `npm run test -- roadmap workspaceInformationArchitecture neuralRuntimeLab template.neuralExcitation`: passed, 4 files and 28 tests.
- `npm run test -- neural templates modelSchema visualBuilderWorkspace schemaTemplateCompatibility socialLearning opinion primitiveRegistry hybridComposition roadmap assumptions builderUiShell workspaceInformationArchitecture`: passed, 14 files and 120 tests.
- `npm test`: passed, 56 files and 447 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 88.48 ticks/sec, Flocking 500 agents at 15.64 ticks/sec, Forest Fire 80x60 at 24.24 ticks/sec, and Predator-Prey default at 75.84 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser screenshots, rendered responsive inspection, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified unless directly tested.
- N2 adaptation is a narrow local RPS/readout slice only. It is not generic adaptive agents, reinforcement learning, biological plasticity, human cognition, user profiling, model-schema execution, Builder graph execution, or social-learning runtime.

Next prompt: Prompt N2B Neural Strategy Adaptation Audit. After N2B, ORTUS should return to Prompt 38 Schema-to-Template Fit Report V1.

## 2026-06-17 - Prompt N1 Neural Excitation Network Template V1

Goal: add a hand-built Neural Excitation Network production template without biological brain-simulation claims, Builder graph execution, model-schema graph execution, learning/plasticity, LLM agents, arbitrary formulas, or generic graph runtime.

Starting state:

- Worktree was clean before edits.
- Current branch was `main`.
- Creating a feature branch failed because this environment exposes `.git` as read-only for branch ref writes, so the work remained on `main`.
- Latest committed state before edits was Prompt 37B (`801b1aa feat: add schema validation UX and repair suggestions`).

Implemented:

- Added `neural-excitation-network` as a production template with deterministic topology generation, continuous node layout, template-owned runtime `NetworkSpace` synapses, bounded stylized activation state, refractory cooldown, delayed signal queue, seeded noise/external stimulus, firing saturation guard, and finite model-output metrics.
- Added template docs, assumptions, limitations, presets, behavior mode metadata, runtime metadata, parameter validation, world validation, and exact neuroscience/runtime boundary copy.
- Added Neural-specific interventions for selected/random/cluster stimulation, selected/cluster inhibition, global excitation/inhibition scale changes, and external stimulus toggling. Synapse-specific interventions were intentionally not added because the UI has no selectable-edge contract.
- Updated the primitive capability registry so `networks` remains service-only globally, while Neural Excitation has the single narrow runtime-active template capability. Other templates remain unsupported for network runtime.
- Added read-only canvas edge rendering, legend notes, metric labels/notes, Neural inspector rows, and a Neural atmosphere style. The canvas graph is visual-only and bounded; it does not mutate simulation state.
- Updated docs and guardrails to state that Neural Excitation is stylized model behavior, not neuroscience evidence, not a clinical/cognitive model, and not Builder/model-schema graph execution.

Boundary preserved:

- Neural Excitation Network Template V1 is a stylized runtime network model, not a biological brain simulation.
- Activation is a model variable, not measured membrane voltage.
- Synapse weights are abstract influence strengths, not biological synaptic measurements.
- The model does not simulate ion channels, neurotransmitters, morphology, learning, consciousness, or cognition.
- This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable.
- Metrics are model-output history, not empirical neural recordings.
- No visual builder runtime, model-schema runtime, network artifact execution, schema-to-template generation, LLM agent, arbitrary code execution, formula execution, or learning/plasticity was added.

Checks:

- `npm run test -- neural`: passed, 1 file and 4 tests.
- `npm run test -- template primitiveRegistry networks interventions`: passed, 14 files and 131 tests.
- `npm run test -- modelSchema visualBuilderWorkspace schemaTemplateCompatibility socialLearning opinion roadmap assumptions hybridComposition`: passed, 9 files and 84 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 55 files and 434 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 263.13 ticks/sec, Flocking 500 agents at 32.97 ticks/sec, Forest Fire 80x60 at 54.04 ticks/sec, and Predator-Prey default at 152.25 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser screenshots, rendered responsive inspection, browser zoom behavior, screen-reader behavior, graph-edge readability at varied densities, and WCAG conformance remain unverified.
- Prompt N1 changes remain uncommitted.

Next roadmap prompt after commit: Prompt 38 Schema-to-Template Fit Report V1.

## 2026-06-18 - Prompt N1B Neural Excitation Network Template Audit + Decision Readout V1

Goal: audit and harden Prompt N1, then add a bounded optional Neural Decision Readout with Rock-Paper-Scissors demonstration semantics without cognition, reasoning, learning, strategy adaptation, Builder graph execution, model-schema execution, or social-learning artifact execution.

Starting state:

- Prompt N1 changes were still uncommitted in the dirty worktree.
- Dirty files were the N1 neural template, registry/UI/intervention/test updates, docs, and guardrails.
- `npm run lint` remains unavailable because `package.json` has no lint script.

Implemented:

- Added optional Decision Readout V1 to `neural-excitation-network`.
- Added three bounded output assemblies labeled Rock, Paper, and Scissors when `decisionReadoutEnabled` is true.
- Added RPS readout preset with readout enabled and no learning/adaptation.
- Added threshold, margin, bounded recent-window, output-bias, opponent mode, and fixed-opponent parameters.
- Added deterministic selected readout states: `undecided`, `rock`, `paper`, `scissors`, and `conflicted`.
- Added observational RPS payoff globals and numeric metrics without feeding payoff into weights, thresholds, topology, future bias, or synapse state.
- Added readout metrics for output assembly activation, selected readout code, confidence, winner margin, switch count, and observational payoff.
- Added read-only Legend panel rendering for output assembly activation, selected readout, and observational payoff.
- Added bounded output-assembly stimulation interventions; no selected-synapse controls, clinical controls, threshold-control interventions, opponent-control interventions, or training controls were added.
- Added validation for duplicate choices, missing choices, empty output assemblies, oversized assemblies, and missing neuron ids.

Boundary preserved:

- Decision Readout V1 maps labeled output assemblies to bounded categorical choices. It is not cognition or reasoning.
- Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network.
- RPS payoff is observational in V1 and does not train, adapt, or optimize the network.
- The model does not infer intentions, beliefs, preferences, personality, or human decision-making.
- Decision metrics are model-output readouts from labeled neuron groups, not evidence of reasoning.
- The Neural runtime graph remains scoped only to the Neural template and does not make Builder graphs, model-schema graphs, network artifacts, or social-learning artifacts executable.
- No LLM agents, arbitrary code execution, formula execution, real-person profiling, protected-class inference, persuasion optimization, learning/plasticity, STDP, backpropagation, cognition, consciousness, diagnosis, treatment, or real brain-region modeling was added.

Checks:

- `npm run test -- neural`: passed, 1 file and 8 tests.
- `npm run test -- template primitiveRegistry networks interventions`: passed, 14 files and 135 tests.
- `npm run test -- modelSchema visualBuilderWorkspace schemaTemplateCompatibility socialLearning opinion roadmap assumptions hybridComposition builderGraphView modelSchemaAuthoring schemaValidationUx workspace`: passed, 13 files and 121 tests.
- `npm run test -- ortusBrand workspaceInformationArchitecture builderUiShell layoutContainment`: passed, 4 files and 23 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 55 files and 438 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 98.01 ticks/sec, Flocking 500 agents at 16.22 ticks/sec, Forest Fire 80x60 at 26.08 ticks/sec, and Predator-Prey default at 77.77 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser screenshots, rendered responsive inspection, browser zoom behavior, screen-reader behavior, readout panel layout at varied viewports, and WCAG conformance remain unverified.
- Prompt N1 + N1B changes remain uncommitted.

Next roadmap prompt after commit: Prompt 38 Schema-to-Template Fit Report V1.

## 2026-06-18 - Prompt NUX1 Neural Runtime Lab UX V1

Goal: add a scenario-guided Neural Runtime Lab around the existing Neural Excitation Network template without adding learning/adaptation, cognition, biological-neuron claims, Builder graph execution, Model Schema execution, generic graph runtime, selected-edge editing, LLM agents, external APIs, or payoff-driven weight/bias updates.

Initial state:

- `git status --short` was clean before edits.
- Latest commit observed: `3b50266 Add neural excitation network template to production templates`.
- Prompt N1 and Prompt N1B were committed before this prompt began.

Implemented:

- Added `NeuralRuntimeLabPanel` in Setup mode when `neural-excitation-network` is selected.
- Added scenario cards for Watch a cascade spread, Stabilize runaway excitation, Make two clusters synchronize, Break the network by removing/silencing a hub, Rock-Paper-Scissors Readout Demo, and Stay unpredictable challenge shell.
- Added mission/status readouts for firing neurons, refractory neurons, signal queue, excitation/inhibition balance, cascade status, and RPS readout/payoff status.
- Added live explanations derived from current metrics/snapshot state. Explanations avoid anthropomorphic cognition language and keep outputs as model readouts.
- Added direct UI actions over supported Neural interventions: seeded random/selected/cluster stimulation, selected-cluster silencing, RPS assembly stimulation, external stimulus toggle, reset activity, regenerate network, and show Advanced config.
- Added plain-English controls that deterministically map to existing Neural parameters and rebuild a fresh tick-0 run through template validation.
- Added a Neural-only Advanced config drawer around exact numeric parameters with `aria-expanded`/`aria-controls`; exact parameters remain available.
- Added a bounded latest-events timeline with a 60-event limit and a bounded non-adaptive RPS challenge history with a 40-round limit.
- Added a store-level `setParameters` batch setter so presets rebuild once through existing validation.

Required boundary copy preserved:

- This lab shows stylized neural excitation dynamics and bounded categorical readouts. It does not model cognition, biological neurons, or learning.
- RPS payoff is observational in this version and does not update weights, biases, or future choices.
- Rock-Paper-Scissors labels are assigned to output assemblies by the model designer; the network does not understand the labels.
- This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable.
- Training and adaptation are deferred to Neural Strategy Adaptation V1.

Checks:

- `npm run test -- neuralRuntimeLab`: passed, 1 file and 5 tests.
- `npm run test -- neuralRuntimeLab workspaceInformationArchitecture layoutContainment neural`: passed, 4 files and 27 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 56 files and 443 tests.
- `git diff --check`: passed.
- `npm run build`: failed with Next.js 15.5.19 after "Creating an optimized production build ..." and then only `Build failed because of webpack errors`. The same generic failure remained after moving `.next` to `/tmp`, temporarily unmounting `NeuralRuntimeLabPanel`, temporarily removing the new CSS, temporarily reverting the Neural Advanced config drawer, and temporarily removing the store batch setter. Next did not print a module-level webpack diagnostic in this environment.

Remaining limitations:

- Browser screenshots, rendered responsive inspection, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- Production build failure remains unresolved because Next emitted only the generic webpack error banner despite clean cache and isolation attempts.

Next roadmap prompt after commit: Prompt 38 Schema-to-Template Fit Report V1.

## 2026-06-18 - Prompt NUX1B Neural Runtime Lab UX Audit + Build Investigation

Goal: audit the Neural Runtime Lab UX V1 work, diagnose the generic Next/webpack production-build failure, keep the lab source-honest and bounded, and avoid starting Neural Strategy Adaptation V1.

Build investigation:

- Reproduced the reported `npm run build` failure: Next emitted only `Build failed because of webpack errors`.
- Temporary source isolation showed the failure was not caused by `NeuralRuntimeLabPanel`, the new Neural lab CSS, the Advanced config drawer, the store batch setter, or the new lab helper/tests.
- A clean HEAD copy also failed, which ruled out NUX1 as the direct root cause.
- Temporary webpack-error instrumentation revealed the real cause: `next/font/google` in `src/app/layout.tsx` tried to fetch IBM Plex Mono, IBM Plex Sans, and Space Grotesk during production build in a network-restricted environment.
- NUX1B removes the `next/font/google` loaders and leaves the existing CSS fallback stacks as the build-safe font path.

Implemented hardening:

- Added explicit Neural Runtime Lab discarded-state copy: Apply setup rebuilds a fresh tick-0 run and discards current tick, metric trace, selection, intervention target, and intervention history.
- Strengthened Neural lab static tests for production-import hygiene, no test-file leakage, browser-free helper logic, no unsafe HTML/dynamic import, bounded timeline/RPS histories, and source-level accessibility hooks.
- Updated docs and guardrails for NUX1B, including the build root cause and the exact unverified-rendering boundary.
- Added AGENTS guardrail: production build must pass before committing NUX1/NUX1B.

Required boundary copy preserved:

- This lab shows stylized neural excitation dynamics and bounded categorical readouts. It does not model cognition, biological neurons, or learning.
- RPS payoff is observational in this version and does not update weights, biases, or future choices.
- Rock-Paper-Scissors labels are assigned to output assemblies by the model designer; the network does not understand the labels.
- This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable.
- Training and adaptation are deferred to Neural Strategy Adaptation V1.
- Rendered responsive, zoom, and assistive-technology behavior remain unverified unless directly tested.

Checks:

- `npm run test -- neuralRuntimeLab`: passed, 1 file and 7 tests.
- `npm run test -- neural`: passed, 2 files and 15 tests.
- `npm run test -- template modelSchema visualBuilderWorkspace schemaTemplateCompatibility socialLearning opinion primitiveRegistry hybridComposition roadmap assumptions builderUiShell workspaceInformationArchitecture`: passed, 21 files and 198 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 56 files and 445 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 112.35 ticks/sec, Flocking 500 agents at 15.89 ticks/sec, Forest Fire 80x60 at 26.38 ticks/sec, and Predator-Prey default at 75.13 ticks/sec.
- `git diff --check`: passed.
- `npm run dev`: failed in the sandbox with `listen EPERM`; an escalated dev-server run started successfully and local HTTP HEAD probes returned `200 OK` for `/` and `/builder`.
- `npm run lint`: unavailable, package.json has no lint script.
- Final doc/Neural rerun after log ordering: `npm run test -- roadmap workspaceInformationArchitecture neuralRuntimeLab` passed, 3 files and 18 tests.

Remaining limitations:

- Browser screenshots, rendered responsive inspection, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- The dev-server route probes confirm HTTP availability only; they are not rendered UI, zoom, keyboard walkthrough, or assistive-technology verification.

Next roadmap prompt after commit: Prompt 38 Schema-to-Template Fit Report V1.

## 2026-06-20 - Prompt 38B Schema-to-Template Fit Report Audit

Goal: audit and harden Prompt 38 without committing Prompt 38 first, and without adding schema execution, schema-to-template conversion, rule parsing, formula execution, generated artifacts, runtime preview, template mutation, Builder graph execution, social-learning runtime, Neural Strategy Adaptation generalization, MR0 runtime implementation, LLM repair, external API calls, validation claims, calibration claims, or scientific-truth claims.

Initial state:

- Prompt 38 changes were still uncommitted in the worktree.
- The fit-report UI existed under `src/components/builder/fitReport` and was wired into Builder `Author Schema`.
- Focused Prompt 38 checks had previously passed, but the audit had not started.

Implemented:

- Added source-snapshot based stale handling for generated schema-to-template fit reports.
- Reports now become visibly stale when the current Author Schema draft changes after edits, imports, resets, or repair applications.
- Added the required stale warning: `This fit report may be stale because the schema changed after it was generated. Refresh the report before using it.`
- Invalid current drafts now show the unavailable state instead of falling back to a previous valid report.
- Refresh recomputes from the current structurally valid draft only.
- Candidate rows now expose matched, partial, unsupported, lossy, future-only, and runtime-gap counts.
- Equal-score candidates now rank deterministically by score, compatibility fit label, fit level, then template id, so `templateExact` does not lose to a lexically earlier `strong` candidate.
- MR0 future-only gap detection now includes Urban Exposure + Resilience, Cluster-Based Decision Readout Generalization, and Stimulus-Conditioned Decision Clusters.
- Strengthened focused fit-report tests for stale edit/import/repair-style changes, invalid-current-draft behavior, exact-fit tie ranking, stable-id tie ranking, MR0 future gaps, source guardrails, and Author Schema integration.
- Updated README, roadmap docs, concepts, simulation README, HCI audit, workspace IA, current context, planned roadmap, AGENTS guardrails, and roadmap/model-schema/control tests to mark Prompt 38B complete and Prompt 39 next.

Required boundary copy preserved:

- Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models.
- A strong template fit does not mean a schema can run.
- Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents.
- Unsupported and lossy mappings must remain visible; they must not be silently dropped.
- Rule fits are structural comparisons. Rule declarations are not executed.
- Fit score is a structural summary, not a runtime readiness score.
- Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles.
- Builder graphs remain structural inspection views. Fit reports do not make them executable.
- Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability.
- MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report.

Non-goals preserved:

- No schema execution, rule execution, formula parsing, code execution, compatibility conversion, template mutation, generated artifacts, hidden interpreter, simulation-store subscription, runtime preview, Builder graph execution, social-learning runtime, Neural Strategy Adaptation activation, MR0 capability implementation, LLM behavior, external API call, validation/calibration claim, or scientific-truth claim was added.
- The report still does not mutate schemas, last-valid artifacts, active simulation state, loaded visual workspaces, templates, scenarios, RunConfigs, snapshots, engines, compatibility reports, or social-learning artifacts.

Checks:

- `npm test -- schemaTemplateFitReportUx`: passed, 1 file and 14 tests.
- `npm test -- roadmap modelSchema control schemaTemplateFitReportUx modelSchemaAuthoring schemaValidationUx workspaceInformationArchitecture builderGraphView schemaTemplateCompatibility neural assumptions`: passed, 13 files and 127 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 57 files and 463 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 248.95 ticks/sec, Flocking 500 agents at 31.76 ticks/sec, Forest Fire 80x60 at 53.95 ticks/sec, and Predator-Prey default at 154.99 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable because `package.json` has no lint script. npm also could not write its missing-script log under `/home/rohchav/.npm/_logs`.
- Final doc-alignment rerun after session-log edits: `npm test -- roadmap modelSchema control` passed, 4 files and 44 tests.

Remaining limitations:

- Browser rendering, responsive behavior, browser clipboard behavior, focus return, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

Next roadmap prompt after commit: Prompt 39 Scenario Planning From Schema V1.

## 2026-06-20 - Prompt 39 Scenario Planning From Schema V1

Goal: add a non-runnable scenario-planning report in Builder Author Schema without adding schema execution, scenario generation, RunConfig generation, snapshot generation, engine/agent/template/code generation, simulation-state mutation, fit-report mutation, repair patch generation, Builder graph execution, Model Schema runtime, Neural Strategy Adaptation activation, MR0 runtime behavior, LLM behavior, external APIs, calibration, validation, policy recommendation, or scientific-truth claims.

Implemented:

- Added `src/components/builder/scenarioPlanning` with a pure bounded planning adapter, serializable UX model, plain-text copied report, React panel, and focused tests.
- The planning adapter consumes the current structurally valid `ModelSchemaDefinition` plus the resolved current non-stale fit-report UX model when available. It does not import the simulation engine, simulation store, template runtimes, compatibility internals, repair helpers, scenarios, RunConfigs, snapshots, or external APIs.
- The planning report lists candidate scenario questions, conceptual interventions, observable metrics, parameter families, assumption checks, data/calibration needs, fit-linked template candidates, unsupported/lossy/runtime gaps, future-only gaps, claim boundaries, and next modeling steps.
- Builder Author Schema now shows Scenario Planning below Fit Report, with Refresh scenario plan, Copy planning report, View fit report, section expand/collapse, and Jump to schema section controls.
- Invalid schemas disable scenario planning with the required invalid copy. Stale fit reports disable scenario planning with the required stale-fit copy. Missing fit context is handled as incomplete planning context rather than runtime readiness.
- Updated README, concepts, roadmap, planned roadmap, simulation README, HCI audit, workspace IA, current context, AGENTS guardrails, and roadmap/model-schema/control tests to mark Prompt 39 complete and Prompt 39B next.

Required boundary copy preserved:

- Scenario planning from schema is a planning aid. It does not create runnable scenarios.
- Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state.
- Scenario questions are hypotheses to explore, not predictions or validated conclusions.
- A scenario plan can suggest what to inspect, but it does not prove what will happen.
- Fit reports describe structural resemblance. Scenario plans describe possible study designs. Neither one makes a schema runnable.
- A strong fit can guide planning, but it is not runtime readiness.
- Conceptual interventions describe what a future scenario might vary. They are not executable controls.
- Suggested metrics describe what to observe if a future runtime exists. They are not empirical measurements.
- Data needs identify what would be required for calibration or validation. They do not imply the current schema is calibrated.
- Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic scenario-planning capability.
- MR0 roadmap concepts may appear as future-only planning gaps. They are not implemented scenario capabilities.
- Blackjack work is offline simulation only in the roadmap. Prompt 39 does not add gambling advice, live casino assistance, wearable input, camera input, or card-counting support.

Checks:

- `git status --short`: worktree was clean before Prompt 39 edits.
- `npm test -- schemaScenarioPlanningUx schemaTemplateFitReportUx modelSchemaAuthoring schemaValidationUx schemaTemplateCompatibility roadmap assumptions`: passed, 7 files and 75 tests.
- `npm run typecheck`: passed.
- First `npm test`: failed only on stale doc-status assertions still expecting `ORTUS has completed Prompt 38B` in `control.test.ts` and `modelSchema.test.ts`; assertions were updated to Prompt 39 and strengthened with Prompt 39 boundary copy.
- `npm test -- control modelSchema roadmap schemaScenarioPlanningUx`: passed, 5 files and 54 tests.
- Final `npm test`: passed, 58 files and 473 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 250.8 ticks/sec, Flocking 500 agents at 32.98 ticks/sec, Forest Fire 80x60 at 54.15 ticks/sec, and Predator-Prey default at 163.69 ticks/sec.
- `git diff --check`: passed.
- `npm run test -- fitReport`: passed, 1 file and 14 tests.
- `npm run test -- scenarioPlanning`: passed, 1 file and 10 tests.
- `npm run test -- schemaTemplateCompatibility modelSchema roadmap assumptions schemaValidationUx modelSchemaAuthoring`: passed, 6 files and 63 tests.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser rendering, responsive behavior, browser clipboard behavior, focus return, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- Scenario plans remain planning reports only. They do not create scenarios, RunConfigs, snapshots, engines, agents, templates, code, or simulation state.

Next roadmap prompt after commit: Prompt 39B Scenario Planning From Schema Audit.

## 2026-06-20 - Prompt 39B Scenario Planning From Schema Audit

Goal: audit and harden Prompt 39 scenario planning without adding scenario generation, RunConfig generation, snapshot generation, engine/agent/template/code generation, simulation-state mutation, schema execution, rule execution, policy recommendation, calibration, validation, Neural Strategy Adaptation activation, MR0 runtime capability, F0/fractal work, LLM behavior, external APIs, or scientific-truth claims.

Implemented:

- Marked stored scenario plans stale when the current schema hash or fit-report hash no longer matches the plan snapshot.
- Included fit-report diagnostics in the scenario-plan fit hash so fit-report replacements invalidate dependent planning output.
- Kept stale scenario plans unavailable until explicit refresh, and kept copied stale reports from presenting old planning output as current.
- Added visible/report copy: Assumption checks identify what the modeler should clarify. They do not resolve the assumption.
- Added visible/report copy: Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- Strengthened claim boundaries against medical/public-health prediction, weather forecasting, real-human-behavior prediction, policy recommendation, persuasion optimization, targeting logic, and gambling assistance.
- Strengthened scenario-planning tests for changed schema snapshots, changed fit-report snapshots, stale copied report text, serializable output, forbidden runtime hooks, required copy, and documentation alignment.
- Updated README, concepts, roadmap, planned roadmap, simulation README, HCI audit, workspace IA, current context, AGENTS guardrails, and roadmap/model-schema/control tests to mark Prompt 39B complete and next work pending user direction.

Required boundary copy preserved:

- Scenario planning from schema is a planning aid. It does not create runnable scenarios.
- Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state.
- Scenario questions are hypotheses to explore, not predictions or validated conclusions.
- A scenario plan can suggest what to inspect, but it does not prove what will happen.
- Assumption checks identify what the modeler should clarify. They do not resolve the assumption.
- Fit reports describe structural resemblance. Scenario plans describe possible study designs. Neither one makes a schema runnable.
- A strong fit can guide planning, but it is not runtime readiness.
- Conceptual interventions describe what a future scenario might vary. They are not executable controls.
- Suggested metrics describe what to observe if a future runtime exists. They are not empirical measurements.
- Data needs identify what would be required for calibration or validation. They do not imply the current schema is calibrated.
- Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic scenario-planning capability.
- MR0 roadmap concepts may appear as future-only planning gaps. They are not implemented scenario capabilities.
- Blackjack work is offline simulation only in the roadmap. Prompt 39 does not add gambling advice, live casino assistance, wearable input, camera input, or card-counting support.
- Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

Checks:

- `npm test -- src/components/builder/scenarioPlanning/schemaScenarioPlanningUx.test.ts`: passed, 1 file and 12 tests.
- `npm test -- roadmap modelSchema control schemaScenarioPlanningUx`: first run failed because the exact stale-plan audit sentence was present only in the roadmap, not in the README/concepts/simulation README/AGENTS doc set checked by `roadmap.test.ts`; AGENTS was updated with the exact sentence.
- `npm test -- roadmap modelSchema control schemaScenarioPlanningUx`: passed after the AGENTS update, 5 files and 56 tests.
- `npm run typecheck`: passed.
- First `npm test`: failed only because `src/simulation/__tests__/uncertainty.test.ts` timed out in the full suite on `supports uncertainty over one safe numeric parameter for every production template`.
- `npm test -- src/simulation/__tests__/uncertainty.test.ts`: passed, 1 file and 9 tests.
- Second `npm test`: passed, 58 files and 475 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 103.41 ticks/sec, Flocking 500 agents at 14.36 ticks/sec, Forest Fire 80x60 at 23.24 ticks/sec, and Predator-Prey default at 70.75 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser rendering, responsive behavior, browser clipboard behavior, focus return, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- Scenario plans remain planning reports only. They do not create scenarios, RunConfigs, snapshots, engines, agents, templates, code, or simulation state.
- Performance smoke numbers were lower than some prior session notes on this machine; Prompt 39B did not touch runtime execution paths, and the performance command still passed as a smoke check rather than a scalability claim.

Next prompt after that commit was pending user direction for possible F0/fractal/multiscale roadmap work.

## 2026-06-22 - Prompt F0 Fractal and Multiscale Analysis Mini-Roadmap

Goal: add a documentation-only fractal and multiscale analysis mini-roadmap without implementing fractal metrics, fractal spatial generators, Scale Lens UI, network scaling analytics, trajectory motif analytics, runtime behavior, schema fields, template capabilities, Builder graph execution, Model Schema execution, or registry support.

Implemented:

- Added Prompt F0 to `planned_roadmap.md` and `docs/roadmap.md` with future branch order: F1 Fractal Metrics, F1B audit, F2 Fractal Spatial Generators, F2B audit, F3 Scale Lens / Coarse-Graining, F3B audit, F4 Network Scaling Metrics, F4B audit, F5 Hierarchical Trajectory Motif Analytics, and F5B audit.
- Documented the recommended implementation priority: F1 measurement -> F3 scale comparison -> F2 synthetic generation -> F4 network scaling -> F5 abstract trajectory analysis.
- Documented that the numbering identifies the branch, but implementation sequencing may put F3 before F2.
- Added the core design principle: Measure multiscale structure before generating synthetic fractal structure.
- Added required boundary language for visual resemblance, power-law evidence, finite-resolution dimension estimates, statistical self-similarity, scale-free versus geometric fractality, synthetic generators, coarse-graining, Scale Lens projections, network scaling, trajectory motifs, clustering, and causal/forecast/validation overclaims.
- Updated README, concepts, simulation README, HCI audit, workspace IA, current context, and AGENTS guardrails to mark F0 complete as documentation only and keep F1-F5 unimplemented.
- Updated focused documentation tests in roadmap, model-schema, control, multiscale, and social-learning suites to preserve F0 boundaries.

Required boundary copy preserved:

- Fractal and multiscale tools describe how measured structure changes across scale. They do not prove that a system is fundamentally fractal.
- A complex-looking, nested, branching, or irregular pattern is not automatically fractal.
- Power-law behavior may indicate scale-free structure, but a power-law fit alone does not establish fractality.
- Finite-resolution fractal dimensions are estimators over a chosen scale range, not intrinsic truths about the modeled system.
- Statistical self-similarity must be supported across an explicit scale range; it should not be inferred from visual resemblance alone.
- Scale-free distributional evidence is not identical to geometric fractality.
- Visual resemblance to a fractal is not evidence of scale invariance.
- Fractal metrics are structural summaries of simulation output. They are not proof of biological, ecological, social, meteorological, or empirical validity.
- Fractal spatial generators create synthetic structure. They do not reproduce real geography, ecology, urban form, climate, terrain, or weather without calibration and validation.
- Coarse-graining changes what is represented. Similar aggregate behavior does not mean the underlying microstates are equivalent.
- Scale Lens views are analytical projections, not separate validated models.
- A scale-free degree distribution is not the same as a fractal network.
- A hierarchical community structure is not automatically self-similar.
- Network fractality requires a defined network-scale method and evidence across a supported scale range.
- Hierarchical trajectory motifs describe repeated observable state-action sequences. They do not reveal thoughts, intentions, beliefs, personality, or subconscious mental states.
- Repeated motifs across time windows are not automatically evidence of temporal fractality.
- Fractal analysis requires a defined object, scale operation, and measurement. ORTUS must not apply one generic fractal score to unrelated spatial, network, temporal, and trajectory data.
- Clustering groups similar observations. Fractal analysis measures how structure changes across scale. One does not imply the other.
- Synthetic fractal generators create model inputs, not observed reality.
- Coarse-graining may discard information and alter apparent dynamics.
- Fractal and multiscale metrics are structural summaries, not causal explanations, forecasts, validation results, or proof of universal laws.

Non-goals preserved:

- No runtime source, template source, simulation engine source, Builder feature source, fit-report source, scenario-planning source, Neural Runtime Lab source, visual graph source, dependency file, registry support, import/export support, or package dependency was changed.
- No F1-F5 capability is marked implemented.
- Prompt 39 scenario planning remains a planning report only; it may mention future fractal metrics as possible future observation targets but does not compute them.
- Builder graphs remain non-executable and Model Schemas remain non-runnable.

Checks:

- `git status --short`: clean before Prompt F0 edits.
- `npm test -- roadmap modelSchema control socialLearning multiScale`: passed, 6 files and 59 tests.
- `npm run typecheck`: passed.
- First `npm test`: failed only on the known timing-sensitive `src/simulation/__tests__/uncertainty.test.ts` test `supports uncertainty over one safe numeric parameter for every production template` timing out at the 5000ms limit.
- First standalone `npm test -- src/simulation/__tests__/uncertainty.test.ts`: failed on the same 5000ms timeout at 5204ms.
- Second standalone `npm test -- src/simulation/__tests__/uncertainty.test.ts`: passed, 1 file and 9 tests.
- Second full `npm test`: passed, 58 files and 475 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 140.34 ticks/sec, Flocking 500 agents at 20.65 ticks/sec, Forest Fire 80x60 at 33.24 ticks/sec, and Predator-Prey default at 95.39 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- Browser rendering, responsive behavior, browser clipboard behavior, focus return, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.
- F0 is documentation only. Fractal metrics, fractal generators, Scale Lens / Coarse-Graining, network scaling analytics, and hierarchical trajectory motif analytics remain future work.

Next prompt after commit: pending user direction. Do not start F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any fractal/multiscale implementation without explicit approval.

## 2026-06-22 - Prompt P0 ORTUS Product Philosophy and Learning Mission

Goal: add a documentation-only product philosophy and learning mission source of truth without implementing runtime behavior, UI progression, unlocks, missions, scoring, achievements, discovery detection, model composition, templates, simulation features, fractal metrics, Research World state, persistence, accounts, social features, onboarding flows, dependencies, or new capability flags.

Implemented:

- Added `docs/PRODUCT_PHILOSOPHY_AND_LEARNING_MISSION.md` as the canonical P0 source of truth.
- Documented ORTUS as an exploratory complex-systems sandbox, visual modeling workbench, exploratory simulation environment, systems-thinking learning environment, mechanism/assumption comparison tool, and platform for experiencing emergence.
- Preserved the core mission: ORTUS is a sandbox for exploring how interacting mechanisms, constraints, feedback, stochasticity, adaptation, selection, and history can produce complex, path-dependent, and sometimes chaotic system-level behavior.
- Preserved the central product statement: The world is neither perfectly ordered nor merely random. Complex patterns emerge from constrained interactions, feedback, adaptation, stochasticity, and history.
- Preserved the product-purpose statement: ORTUS helps users explore those mechanisms while remaining honest about uncertainty, scale, evidence, and the limits of models.
- Preserved the guardrail that ORTUS should expand the user’s range of plausible explanations without implying that complexity makes explanation, evidence, responsibility, or intervention impossible.
- Documented complexity as interacting rules, constraints, feedback, and history rather than rulelessness.
- Documented historical contingency, stochasticity within constraints, local/conditional adaptation, non-teleological evolution, epistemic tolerance, model-output limits, and model-versus-world boundaries.
- Added 20 core learning outcomes, recurring learning experiences, product experience principles, product-language guidance, values/non-goals, and a 12-question product decision test.
- Reserved the future Research World branch: GW0 Research World Progression Mini-Roadmap, GW1 Persistent Model Lab, GW2 Discovery Atlas, GW3 Behavioral Landscape Exploration, GW4 Contextual Capability Guidance, GW5 Model Composition Frontiers, and GW6 Grand Systems Challenges.
- Updated README, concepts, simulation README, roadmap, planned roadmap, HCI audit, workspace IA, current context, and AGENTS guardrails to mark P0 complete as documentation only.
- Updated roadmap/control/social-learning/multiscale documentation tests to protect P0 boundaries without adding fake runtime coverage.

Required boundary copy preserved:

- Complexity does not mean the absence of rules. It means that interacting rules, constraints, feedback, and history can produce outcomes that cannot be understood from one mechanism in isolation.
- ORTUS should challenge context-free certainty, not the existence of evidence, mechanisms, or constraints.
- Outcomes can be historically contingent without being causeless or arbitrary.
- Chance operates within structural, environmental, and historical constraints.
- Adaptation is local and conditional. It does not guarantee global improvement, fairness, efficiency, stability, or progress.
- Evolutionary processes have no required destination and may produce both resilience and fragility.
- Be tolerant of uncertainty, heterogeneity, and competing plausible mechanisms while remaining strict about evidence, harm, and unsupported claims.
- ORTUS should reward better questions, stronger comparisons, and more honest interpretation—not confidence, certainty, or favorable outcomes.
- Matching an observed pattern does not establish that the modeled mechanism caused it.
- Changing scale can reveal structure while hiding variation and mechanism.
- A model can show what follows from its assumptions. It cannot establish that those assumptions fully describe reality.
- Simulation output is evidence about the model’s behavior, not automatically evidence about the world.
- ORTUS progression should emerge from building a capable laboratory, discovering system behavior, and reaching new modeling frontiers—not from completing a prescribed checklist.
- The user progresses by gaining reusable understanding and modeling capability, not by accumulating arbitrary points.
- ORTUS progression is both technical and intellectual: users acquire tools while learning why simple explanations often fail.
- The advanced ORTUS challenge is to construct, interrogate, and explain a complex model without losing scientific discipline.
- Complexity should increase analytical humility, not eliminate accountability.

Non-goals preserved:

- No runtime source, template source, simulation engine source, Builder feature source, fit-report source, scenario-planning source, Neural Runtime Lab source, visual graph source, dependency file, registry support, import/export support, or package dependency was changed.
- No GW0-GW6 Research World capability is marked implemented.
- No XP, streaks, grinding, engagement manipulation, scoring, unlocks, missions, achievements, persistence, accounts, social features, onboarding flow, or Research World state was implemented.
- Builder graphs remain non-executable and Model Schemas remain non-runnable.

Checks:

- `git status --short`: clean before Prompt P0 edits.
- `npm test -- roadmap modelSchema control socialLearning multiScale`: passed, 6 files and 59 tests.
- `npm run typecheck`: passed.
- First `npm test`: failed only on timing-sensitive 5000ms timeouts in `src/simulation/__tests__/uncertainty.test.ts` and `src/simulation/__tests__/template.predatorPrey.test.ts`.
- `npm test -- src/simulation/__tests__/template.predatorPrey.test.ts`: passed, 1 file and 5 tests.
- First standalone `npm test -- src/simulation/__tests__/uncertainty.test.ts`: failed on the same 5000ms timeout at 5034ms.
- Second standalone `npm test -- src/simulation/__tests__/uncertainty.test.ts`: passed, 1 file and 9 tests.
- Second full `npm test`: passed, 58 files and 475 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 130.49 ticks/sec, Flocking 500 agents at 18.99 ticks/sec, Forest Fire 80x60 at 26.96 ticks/sec, and Predator-Prey default at 78.81 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- P0 is documentation only. Research World progression, persistent labs, discovery atlas, behavioral landscapes, contextual guidance, model composition frontiers, grand challenges, XP, streaks, scoring, missions, achievements, unlocks, accounts, persistence, social features, UI flows, templates, dependencies, and runtime behavior remain unimplemented.
- Browser rendering, responsive behavior, browser clipboard behavior, focus return, browser zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

Next prompt after commit: pending user direction. Do not start GW0-GW6 Research World progression, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any Research World/fractal/multiscale implementation without explicit approval.

## 2026-06-22 - Prompt UX0 ORTUS Living Systems Atlas Visual Direction

Goal: add a documentation-only visual direction and UX-principle source of truth before Research World progression prompts, without implementing routes, navigation, World/Lab/Atlas/Workshop shell behavior, component redesigns, CSS rewrites, typography changes, color-token changes, icons, animations, persistent lab state, progression, unlocks, discoveries, behavioral landscapes, model composition, runtime behavior, template behavior, dependencies, remote fonts, image assets, or generated mockups.

Implemented:

- Added `docs/ui/LIVING_SYSTEMS_ATLAS_VISUAL_DIRECTION.md` as the UX0 source of truth.
- Defined the ORTUS Living Systems Atlas identity as Living Systems Observatory + Scientific Expedition Atlas + Modular Research Workshop + Persistent Model Laboratory.
- Documented the central transformation from a sophisticated modeling dashboard to a persistent living laboratory where users explore systems, build research capability, map behavioral territory, and accumulate reusable understanding.
- Preserved required framing that ORTUS should feel like a living system observed through precise scientific instruments, not a system under tactical command.
- Documented the six design pillars: alive worlds, precise instruments, accumulated knowledge, visible unknowns, contextual depth, and scientific wonder.
- Explicitly retired tactical HUD framing, military mission language, combat-console metaphors, crosshairs/targeting reticles, warning saturation, dominant hazard orange/red, ultra-condensed sci-fi typography, excessive uppercase, scan lines, animated borders, decorative data noise, permanent glowing chrome, fake terminal commands, compressed control walls, and command/target/deploy/engage language where scientific wording is appropriate.
- Preserved useful prior strengths: hierarchy, precision, strong silhouettes, disciplined spacing, clear contrast, high-quality motion, distinctive identity, dark-mode capability, and bold but readable typography.
- Documented future World, Lab, Atlas, and Workshop directions as conceptual destinations only.
- Documented information hierarchy, contextual interaction model, semantic color families, typography/offline-font guardrails, shape language, panel families, material/texture direction, environmental-canvas direction, motion/reduced-motion principles, iconography direction, Atlas/discovery styling, visual progression, responsive/accessibility principles, product-language guidance, migration strategy, Research World relationship, and existing-feature conceptual mapping.
- Updated README, concepts, simulation README, roadmap, planned roadmap, P0 philosophy doc, HCI audit, workspace IA, current context, and AGENTS guardrails.
- Updated roadmap and control documentation tests for UX0 boundaries.

Required boundary copy preserved:

- ORTUS should feel like a living system observed through precise scientific instruments, not a system under tactical command.
- The interface should preserve wonder without hiding uncertainty, assumptions, or model limits.
- Visual progression should correspond to real modeling capability and accumulated understanding, not arbitrary status or engagement rewards.
- The metaphor may organize the experience, but precise scientific labels must remain visible.
- ORTUS is an exploratory laboratory, not a tactical command interface.
- UX0 defines these destinations conceptually. It does not create routes, tabs, navigation, persistence, or runtime behavior.
- Contextual tools should respond to the modeled object under inspection instead of presenting every control permanently.
- Color must reinforce meaning, never carry it alone.
- Do not reintroduce next/font/google or any remote font dependency.
- Material cues should support hierarchy and metaphor without reducing readability or suggesting false physical controls.
- Motion should communicate state, information flow, or system change—not decorate an otherwise static interface.
- Behavioral landscapes are scientific maps of investigated model behavior, not fantasy overworlds.
- Discovery styling should represent evidence accumulation, not achievement acquisition.
- visible lab growth = accumulated modeling capability
- visible lab growth = decorative XP reward
- Visual richness must not make scientific state, uncertainty, or controls harder to perceive.
- Do not rewrite the entire interface at once. Migrate through bounded, testable surfaces while preserving current workflows.
- UX0 defines the visual and interaction target. Research World prompts will determine how that target is implemented.

Non-goals preserved:

- No runtime source, template source, simulation engine source, Builder feature source, Neural Runtime Lab source, global CSS, design-token file, component source, route, dependency file, package lock, branding asset, icon, image asset, or mockup was changed.
- No World/Lab/Atlas/Workshop route, shell, navigation, persistence, discovery logic, behavioral landscape, progression, unlock, mission, scoring, achievement, remote font, or runtime behavior was implemented.
- UX0 does not start GW0-GW6 or a token/component migration.

Checks:

- `git status --short`: clean before Prompt UX0 edits.
- `npm test -- roadmap modelSchema control socialLearning multiScale`: first run failed only because a negative roadmap-test assertion matched correct non-goal wording for World/Lab/Atlas/Workshop shell; the assertion was narrowed.
- `npm test -- roadmap modelSchema control socialLearning multiScale`: passed after the test correction, 6 files and 59 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 58 files and 475 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 87.81 ticks/sec, Flocking 500 agents at 12.90 ticks/sec, Forest Fire 80x60 at 18.25 ticks/sec, and Predator-Prey default at 52.14 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- UX0 is documentation and design planning only. It has not verified rendered responsive behavior, browser zoom behavior, keyboard walkthroughs, screen-reader behavior, assistive-technology behavior, reduced-motion behavior, color contrast, or WCAG conformance.
- Performance smoke numbers were lower than recent P0/F0 runs on this machine; UX0 touched no runtime or UI source paths, so this is not evidence of a UX0 runtime regression.

Next prompt after commit: pending user direction. Do not start GW0-GW6 Research World progression, a design-token/component audit, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any Research World/fractal/multiscale implementation without explicit approval.

## 2026-06-25 - Prompt UX1 Existing Design Token and Component Audit

Goal: add a documentation-only, source-level audit of ORTUS's existing design tokens, component patterns, hardcoded values, accessibility risks, responsive risks, dependency constraints, and migration sequence toward the Living Systems Atlas, without implementing UX2, GW0, GW1, routes, navigation, World/Lab/Atlas/Workshop, CSS changes, token changes, production UI component changes, dependencies, assets, font files, mockups, visual regression tooling, or runtime behavior.

Implemented:

- Added `docs/ui/EXISTING_DESIGN_TOKEN_AND_COMPONENT_AUDIT.md` as the UX1 source of truth.
- Documented source inventory for global CSS, CSS-module absence, inline styles, canvas/SVG/chart styling, template visual descriptors, shell/navigation, Builder, Neural Runtime Lab, template-specific views, forms, validation UI, cards, panels, drawers, tabs, badges, tooltips, dialogs, tables, icon usage, motion, responsive rules, dependency constraints, and existing docs/tests.
- Recorded current token findings: useful global CSS variables, but overloaded acid green, vermilion/orange, off-white borders, chart/domain colors, dense all-caps typography, clipped HUD geometry, repeated raw spacing, and a source-visible `var(--muted)` versus `--text-muted` mismatch.
- Classified major patterns as retain, adapt, replace, or retire. Retained task-oriented workspace modes, the persistent run dock, runtime-honesty copy, ORTUS brand lockup, and graph outline/text alternatives. Adapted shared panels, domain accents, charts, graph/canvas surfaces, forms, and Marathon-derived geometry. Replaced the fragmented status/evidence-state system as a future target. Retired or reduced decorative scan/sweep/jitter/tactical ornament as future work.
- Documented responsive and accessibility risks as source-level findings only, with browser, zoom, contrast, keyboard, reduced-motion, screen-reader, assistive-technology, and WCAG verification still unperformed.
- Updated README, concepts, simulation README, roadmap, planned roadmap, UX0 visual direction, HCI audit, workspace IA, product philosophy, current context, AGENTS guardrails, and roadmap/control tests.

Required boundary copy preserved:

- UX1 audits the current interface. It does not redesign it.
- The audit must distinguish production evidence from assumptions and unverified visual behavior.
- The migration target is the Living Systems Atlas, but the audit must preserve current workflows and validated functionality.
- Retire tactical framing without flattening ORTUS into generic SaaS.
- Source inspection indicates a potential risk. Rendered verification has not been performed.
- successful operation is not the same as scientifically validated result
- Templates may have domain accents, but they should not behave like unrelated products.
- Migrate shared foundations before specialized surfaces, but do not block necessary feature work on a total redesign.
- UX1 provides implementation evidence. GW0 provides progression architecture. UX2 provides visual foundations. GW1 provides the first structural transformation.

Non-goals preserved:

- No production UI source, CSS source, package dependency, font configuration, or asset file was changed.
- No semantic tokens, colors, typography, routes, navigation, World/Lab/Atlas/Workshop shell, responsive behavior, animation behavior, persistence, Research World progression, UX2, GW0-GW6, runtime behavior, template behavior, schema execution, or Builder execution was implemented.

Checks:

- `git status --short`: UX1 docs/tests dirty; no production UI/CSS/dependency/font/asset paths dirty.
- `git log -1 --oneline`: `9c73ebc Add ORTUS Living Systems Atlas Visual Direction documentation and update related files`, confirming UX0 was committed before UX1 work.
- `npm test -- roadmap control modelSchema socialLearning multiScale`: passed, 6 files and 59 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 58 files and 475 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 85.63 ticks/sec, Flocking 500 agents at 14.07 ticks/sec, Forest Fire 80x60 at 29.58 ticks/sec, and Predator-Prey default at 54.46 ticks/sec.
- `git diff --check`: passed after the session-log append.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- UX1 is documentation and source-level audit only. Rendered responsive behavior, browser zoom behavior, keyboard walkthroughs, screen-reader behavior, assistive-technology behavior, reduced-motion behavior, color contrast, and WCAG conformance remain unverified.
- UX2, GW0, and GW1 should not start without explicit user direction.

Next prompt after commit: pending user direction. Do not start UX2, GW0-GW6 Research World progression, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any Research World/fractal/multiscale/design-system implementation without explicit approval.

## 2026-06-25 - Prompt GW0 ORTUS Research World Progression Mini-Roadmap

Goal: add a documentation-only Research World progression mini-roadmap after UX1, without implementing UX2, GW1-GW6, routes, navigation, World/Lab/Atlas/Workshop pages, persistence, accounts, cloud/local storage, database schemas, progression state, unlocks, XP, levels, achievements, badges, streaks, missions, quests, daily rewards, discovery detection, regime classification, behavioral landscapes, contextual recommendations, notebooks, saved research assets, model composition, grand-system scenarios, design tokens, CSS, components, runtime behavior, simulation behavior, template behavior, dependencies, assets, or mockups.

Implemented:

- Added `docs/RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md` as the GW0 source of truth.
- Defined Research World as a model-bounded investigation context, not a literal game world, complete real-world domain simulation, reward economy, discovery-certification engine, or runtime capability.
- Preserved the core loop: Observe -> Perturb -> Compare -> Interpret -> Document -> Revisit -> Extend.
- Defined World, Lab, Atlas, and Workshop as future destination responsibilities only.
- Documented progression without XP: progress = reusable understanding + modeling capability + investigative depth, not progress = clicks + time + completed tasks.
- Documented Discovery Atlas evidence states, Behavioral Landscape sampled/unsampled boundaries, Persistent Model Lab provenance/stale-state expectations, reusable-asset compatibility limits, open questions/failure as progress, modeling frontiers, composition frontiers, Grand Systems Challenges, expert access, responsible engagement, personalization boundaries, artifact/runtime boundaries, accessibility/non-spatial navigation principles, and the UX2/GW1 relationship.
- Updated README, concepts, roadmap, planned roadmap, product philosophy, UX0 visual direction, UX1 source audit, HCI audit, workspace IA, current Codex context, simulation README, and AGENTS guardrails.
- Updated roadmap/control documentation tests to cover GW0 boundaries and future-only status.

Required boundary copy preserved:

- ORTUS should move from a collection of sophisticated modeling screens toward a persistent research environment where worlds, experiments, evidence, questions, and reusable capabilities accumulate.
- ORTUS progression should emerge from building a capable laboratory, discovering system behavior, and reaching new modeling frontiers—not from completing a prescribed checklist.
- Progression must organize learning and discovery without implying that the user has mastered reality, proven a mechanism, or completed a scientific domain.
- GW0 defines destination responsibilities. It does not implement destination navigation or persistence.
- Research World progression is a flexible expansion of investigative capability, not a universal curriculum or player-level system.
- Contextual capability guidance is not the same as hard-locking tools.
- Progressive guidance and expert access must coexist.
- A Discovery Atlas records investigated model behavior. It does not certify discoveries about the real world.
- A behavioral landscape maps what has been investigated. It must not imply that unsampled regions are known.
- Persistence must preserve provenance and model boundaries.
- Reusable does not mean universally compatible.
- Finding that the model cannot support a conclusion is meaningful progress.
- A new modeling frontier expands the questions ORTUS can represent. It does not guarantee better answers.
- Grand Systems Challenges should test model construction, interrogation, comparison, and scientific discipline—not optimization toward a scripted victory state.
- Beginners should receive a clear investigative starting point. Experts should not be forced through a simulated beginner journey.
- Research continuity should be supported without manufacturing urgency.
- Contextual guidance may respond to the state of the model and workspace. It must not become psychological profiling of the user.
- The Research World architecture must wrap and reorganize validated workflows before attempting to replace them.
- GW0 defines what the product must communicate. UX2 defines how shared design foundations communicate it. GW1 implements the first structural shell using both.

Artifact/runtime boundaries preserved:

```text
artifact attachment ≠ activation
valid artifact ≠ runnable artifact
runnable artifact ≠ scientifically validated model
successful run ≠ robust result
structural fit ≠ semantic correctness
scenario plan ≠ executable scenario
simulation output ≠ empirical truth
```

Non-goals preserved:

- No production UI source, CSS source, runtime source, persistence source, route, asset, dependency file, package-lock file, or font configuration was changed.
- No World/Lab/Atlas/Workshop route, shell, page, navigation, persistence, discovery logic, behavioral landscape, contextual guidance, progression state, notebook, saved asset, model composition, grand challenge, runtime behavior, template behavior, dependency, asset, token, CSS, or component was implemented.
- Current `/` and `/builder` workflows remain the implemented surfaces.
- UX2 and GW1-GW6 remain future prompts and must not start without explicit user direction.

Checks:

- `git status --short`: clean before Prompt GW0 edits.
- `npm test -- roadmap control modelSchema`: first run failed on exact GW0 documentation guardrail wording; the standalone `Persistence must preserve provenance and model boundaries.` line and future-only wording were added.
- `npm test -- roadmap control modelSchema`: passed, 4 files and 44 tests.
- `npm test -- roadmap modelSchema control socialLearning multiScale`: passed, 6 files and 59 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 58 files and 475 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 97.25 ticks/sec, Flocking 500 agents at 12.87 ticks/sec, Forest Fire 80x60 at 19.95 ticks/sec, and Predator-Prey default at 58.50 ticks/sec.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limitations:

- GW0 is documentation, product architecture, information architecture, and roadmap planning only.
- Rendered responsive behavior, browser zoom behavior, keyboard walkthroughs, screen-reader behavior, assistive-technology behavior, reduced-motion behavior, color contrast, and WCAG conformance remain unverified.
- Research World progression, persistent destination shell, notebooks, reusable assets, Discovery Atlas, Behavioral Landscape, contextual capability guidance, composition frontiers, Grand Systems Challenges, persistence, routes, navigation, UI, CSS, runtime behavior, and template behavior remain unimplemented.

Next prompt after commit: pending user direction. Recommended sequence is GW0 -> UX2 -> GW1 -> GW1B -> GW2 -> GW2B -> GW3 -> GW3B -> GW4 -> GW4B -> GW5 -> GW5B -> GW6 -> GW6B, but do not start UX2, GW1-GW6, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any Research World/fractal/multiscale/design-system implementation without explicit approval.

## 2026-06-25 - Prompt UX2 Living Systems Atlas Semantic Token Foundation

Goal: add a bounded shared visual-semantics foundation after GW0, without performing the Research World shell transformation, adding World/Lab/Atlas/Workshop routes or navigation, adding persistence, notebooks, Discovery Atlas, behavioral landscapes, contextual guidance, progression, onboarding, runtime behavior, simulation behavior, template behavior, model-schema execution, Builder graph execution, dependencies, assets, local fonts, remote fonts, `next/font/google`, styling frameworks, component libraries, icon/chart/graph/animation libraries, theme providers, token-generation build steps, light-mode controls, or broad specialized-surface redesign.

Implemented:

- Added `docs/ui/LIVING_SYSTEMS_ATLAS_SEMANTIC_TOKEN_FOUNDATION.md` as the UX2 canonical source of truth.
- Added raw palette, semantic surface/text/border/interaction/status/type/spacing/shape/elevation/motion tokens in the canonical CSS source, `src/app/globals.css`.
- Preserved legacy compatibility aliases for existing visual variables such as `--bg-primary`, `--bg-secondary`, `--bg-panel`, `--bg-panel-strong`, `--accent-primary`, `--accent-secondary`, `--accent-tertiary`, `--accent-rare`, `--danger`, `--frame-corner`, `--structure-line`, and `--motion-tight`.
- Migrated the bounded shared primitive set: `CornerFramePanel`, shared/global buttons and icon controls, shared form controls, and shared status badges.
- Extended `StatusPill` with explicit semantic category/state, accessible label, optional description, and size while preserving legacy tone props.
- Added `statusPillSemantics.ts` as a browser-free helper for status semantics tests.
- Extended Builder status badges with semantic category/state data attributes and accessible labels without changing Builder runtime behavior.
- Updated roadmap, concepts, product philosophy, Research World roadmap, UX0, UX1, HCI audit, workspace IA, simulation README, current Codex context, AGENTS guardrails, README, planned roadmap, and roadmap tests.
- Added `src/components/ui/semanticTokenFoundation.test.ts` for token, route, dependency, status, and no-overclaim guardrails.

Required boundary copy preserved:

- UX2 establishes shared visual semantics. It does not perform the Research World shell transformation.
- UX2 prepares the visual language. GW1 performs the structural shell transformation.
- A visual state must communicate what kind of state it represents: operational, interaction, evidence, uncertainty, or capability.
- Operational success means the requested software operation completed. It does not mean the modeled conclusion was scientifically validated.
- selected != supported; active != validated; hovered != important.
- contradicted is not failure; unresolved is not error; stale is not unsupported; planning-only is not non-runnable for the same reason; future-only is not disabled functionality.
- Domain color identifies modeled content. Semantic color communicates interface and evidence state.
- Reduced motion should remove nonessential interface motion without erasing the modeled information the user is studying.

Non-goals preserved:

- No World/Lab/Atlas/Workshop routes, destination shell, destination navigation, persistence, notebooks, reusable assets, Discovery Atlas, behavioral landscapes, contextual guidance, progression state, onboarding, runtime behavior, template behavior, model-schema execution, Builder graph execution, dependency, asset, local font, remote font, or `next/font/google` change was added.
- Current `/` and `/builder` remain the implemented routes.
- Specialized simulation canvas, template visual descriptors, charts, Builder graph visuals, schema cards, Neural Runtime Lab surfaces, and template backgrounds remain deferred unless they safely inherit shared variables.
- UX2 does not claim rendered responsive behavior, browser zoom behavior, keyboard walkthrough completion, screen-reader behavior, assistive-technology behavior, forced-colors readiness, WCAG conformance, or complete accessibility.

Checks:

- `git status --short`: clean before Prompt UX2 edits.
- Current pre-UX2 commit: `f632e79 Refactor documentation and roadmap to incorporate GW0: Research World Progression Mini-Roadmap`.
- `npm test -- semanticTokenFoundation roadmap`: first run failed because Vitest could not import a TSX component helper directly; the status semantics helper was moved into `statusPillSemantics.ts`.
- `npm test -- semanticTokenFoundation roadmap`: passed, 2 files and 8 tests.
- `npm run typecheck`: first run failed because the UX2 test used an incomplete `VisualBuilderWorkspaceValidationReport` fixture; the fixture was expanded to the real type.
- `npm run typecheck`: passed.
- `npm test -- semanticTokenFoundation roadmap control modelSchema socialLearning multiScale`: passed, 7 files and 63 tests.
- `npm test`: passed, 59 files and 479 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 115.23 ticks/sec, Flocking 500 agents at 16.73 ticks/sec, Forest Fire 80x60 at 26.58 ticks/sec, and Predator-Prey default at 79.02 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Rendered verification:

- Route availability was verified through `npm run build` static output for `/` and `/builder`.
- Browser viewport screenshots, browser focus walkthroughs, disabled/selected/warning-state visual inspection, browser zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, and WCAG conformance were not verified because no browser/rendered verification tooling was available in this environment.

Remaining limitations:

- UX2 is a semantic foundation and bounded shared-primitive migration, not a full design system.
- Old raw acid/vermillion values remain in deferred specialized surfaces, template atmospheres, charts, schema/graph/card variants, and domain visualizations.
- A dedicated rendered responsive, zoom, keyboard, reduced-motion, contrast, screen-reader, assistive-technology, and visual-regression audit remains needed before making polished Living Systems Atlas readiness claims.

Next prompt after commit: pending user direction. Do not start GW1-GW6, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any Research World/fractal/multiscale implementation without explicit approval.

## 2026-06-25 - Prompt UX2B Amendment Rendered Browser Audit Harness

Goal: add a minimal dev-only rendered browser audit harness for the UX2 shared semantic foundation after the previous UX2B attempt stopped because no rendered browser tooling existed. The amendment authorizes Playwright and Axe only as audit tooling, not production behavior.

Implemented:

- Added `@playwright/test` and `@axe-core/playwright` as dev dependencies.
- Added `test:ui`, `test:ui:headed`, and `test:ui:report` scripts.
- Added `playwright.config.ts` with Chromium-only execution, existing Next app web server on `127.0.0.1:3000`, base URL `http://127.0.0.1:3000`, server reuse outside CI, one worker, deterministic timeouts, failure-only screenshots/video/traces, and HTML/list reporters.
- Added `.gitignore` entries for `playwright-report/`, `test-results/`, and `blob-report/`.
- Added `tests/ui/semantic-foundation.spec.ts` covering existing routes `/` and `/builder`, specified viewport sizes, reduced-motion context, console/pageerror/hydration/asset failure detection, conservative overflow checks, keyboard smoke checks, shared primitives, rendered status attributes, Builder status badges, status-pair distinction fixtures, and Axe scans.
- Added `docs/ui/LIVING_SYSTEMS_ATLAS_SEMANTIC_FOUNDATION_AUDIT.md` as the UX2B rendered-audit record.

Commands and results:

- `npm install --save-dev @playwright/test @axe-core/playwright`: passed; packages were already satisfied and npm still reports two moderate vulnerabilities. No `npm audit fix --force` was run.
- `npx playwright install chromium`: passed with no output; local cache contains `chromium-1228`, `chromium_headless_shell-1228`, and `ffmpeg-1011`.
- `npm run test:ui` in the sandbox: failed before tests because Next dev server could not bind `127.0.0.1:3000` (`listen EPERM`).
- `npm run test:ui` with elevated local-server permissions: reached the Playwright runner, but Chromium launch failed before any route rendered because `libnspr4.so` is missing. The first test failed and the remaining 14 tests did not run.
- A direct launch of the full cached Chromium binary failed with the same missing `libnspr4.so`.
- `npx playwright install-deps --dry-run chromium`: reported 27 missing host packages, including `libnspr4`, `libnss3`, X11/font packages, and `xvfb`.
- `npx playwright install-deps chromium`: failed because sudo authentication requires an interactive terminal.
- `npx playwright test --list`: passed and listed 15 UI tests.
- `npm run typecheck`: passed.
- `npm test -- roadmap`: passed after updating the roadmap-status assertion for the UX2B blocked state.
- `npm test`: passed, 59 files and 479 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 115.39 ticks/sec, Flocking 500 agents at 16.49 ticks/sec, Forest Fire 80x60 at 26.94 ticks/sec, and Predator-Prey default at 82.17 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Result:

- No rendered UX2 baseline was produced.
- No Axe scan results were produced.
- No route-level console, hydration, overflow, keyboard, reduced-motion, status-semantic, or missing-asset findings can be claimed from the browser run.
- No production UI source fixes were attempted because the required rendered baseline did not execute.

Current blocker:

- Playwright Chromium cannot launch until host system dependencies are installed outside this non-interactive Codex session.

Next prompt:

- Resolve the UX2B host dependency blocker or wait for user direction. Do not start GW1 from this state.

## 2026-06-26 - Prompt UX2B Continuation Rendered Audit Completion

Goal: continue UX2B from the existing dirty worktree after the host Chromium dependency blocker was resolved. Fix the first rendered semantic defect, add focused regression coverage, run all 15 rendered tests, complete UX2B documentation, and decide GW1 readiness without starting GW1.

Starting state:

- Current commit: `e3e08c9`.
- Starting dirty worktree contained the expected UX2B harness, package, documentation, roadmap-test, and related audit files from the prior amendment.
- Prompt UX2B was not restarted and no existing harness/package/doc work was discarded.

Root cause and decision:

- The first rendered failure showed visible label `Paused`, ARIA label `Paused`, category `operational`, and `data-state="idle"`.
- Source inspection showed the simulation has an initialized engine and snapshot at tick 0, time is not advancing, and Run advances from that displayed state.
- Interpretation selected: Paused. The correct rendered contract is `Paused / Paused / operational / paused`.
- Root cause was `TopStatusBar` rendering `Paused` from `isRunning === false` while omitting explicit semantic state, causing `StatusPill` to fall back from legacy neutral tone to `idle`.

Implemented:

- Added `src/components/runStatusSemantics.ts` as the source of truth for `Running`/`Paused` status pill label, tone, category, and state.
- Updated `TopStatusBar` to pass explicit operational `running`/`paused` state to `StatusPill`.
- Updated `BuilderHeader` fallback/no-generation badges to pass explicit capability states instead of defaulting to `unverified`.
- Added a visually hidden route `h1` in `AppShell` and defined `.sr-only` in global CSS after Axe found `/` had no level-one heading.
- Updated the reduced-motion Playwright test to call `page.emulateMedia({ reducedMotion: "reduce" })`; the assertion still requires reduced-motion context.
- Extended `semanticTokenFoundation.test.ts` to cover the run-status semantic model, StatusPill data/ARIA source contract, explicit operational-state preservation, Builder fallback badge states, and the hidden route heading utility.
- Updated README, planned roadmap, roadmap, UX2 docs, HCI audit, current context, AGENTS guardrails, the UX2B audit doc, and roadmap tests so they no longer claim UX2B is blocked.

Rendered audit results:

- Focused original failure rerun passed: `simulate loads without console, hydration, asset, or overflow failures at desktop 1440x900`.
- Focused Builder fallback badge case passed.
- Focused reduced-motion case passed.
- Focused simulate Axe case passed.
- Full `npm run test:ui` passed: 15 tests run, 15 passed, 0 failed, 0 skipped.
- Routes covered: `/` and `/builder`.
- Viewports covered: `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`.
- Rendered checks passed for console/page errors, hydration mismatch messages, critical asset failures, document overflow, conservative clipping, representative keyboard traversal, visible focus, icon-control names, shared panels/buttons/forms, StatusPill, BuilderStatusBadge, semantic status distinctions, reduced-motion context, and Axe scans.
- The only repeated warnings were Node web-server warnings that `NO_COLOR` was ignored because `FORCE_COLOR` was set; these were not page console errors.

Final checks:

- `npm test -- semanticTokenFoundation roadmap`: passed, 2 files and 10 tests after updating stale roadmap expectations and one test tuple type.
- `npm run test:ui`: passed, 15 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 59 files and 481 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 116.54 ticks/sec, Flocking 500 agents at 16.02 ticks/sec, Forest Fire 80x60 at 26.97 ticks/sec, and Predator-Prey default at 82.48 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Non-goals preserved:

- No GW1, GW2-GW6, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, new routes, Research World shell, runtime behavior, simulation behavior, persistence, assets, fonts, production dependency, Builder execution, schema execution, route generation, or broad redesign was added.
- Playwright and Axe remain dev audit tooling only.
- UX2B does not verify actual browser zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, or user comprehension.

Result:

- UX2B rendered browser audit is complete.
- GW1 readiness decision: conditionally ready. GW1 still requires an explicit prompt and its own audit.
- The worktree remains intentionally dirty and uncommitted for user review.

## 2026-06-26 - Prompt GW1 Persistent Destination Shell

Goal: implement the first bounded Research World destination shell without adding persistence, progression, fake Lab/Atlas data, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, fonts, `/world`, `/workshop`, redirects, or visual-builder/runtime overclaims.

Starting state:

- Current commit: `1a94375`.
- Starting worktree was clean.
- Baseline `npm run test:ui` passed before GW1 work: 15 tests passed for the UX2B `/` and `/builder` rendered suite, with only repeated Node `NO_COLOR`/`FORCE_COLOR` warnings.
- Baseline `npm test -- roadmap control` passed: 2 files and 12 tests.

Implemented:

- Added `src/lib/researchDestinations.ts` and focused registry tests for the canonical destination model.
- Added the shared Research World shell with ORTUS identity, skip link, native destination navigation, current destination context, and one shared primary `main` landmark.
- Kept `/` as World and `/builder` as Workshop; added `/lab` and `/atlas` as reachable future-only informational routes.
- Converted `AppShell` and `BuilderShell` from route-level `main` owners into route surfaces inside the shared shell.
- Kept `TopStatusBar` World-specific and `BuilderHeader` Workshop-specific.
- Added Lab and Atlas informational pages with explicit no-persistence, no-discovery-infrastructure, no-real-world-certification, and future-only copy.
- Added `docs/ui/RESEARCH_WORLD_DESTINATION_SHELL.md` as the GW1 source of truth.
- Added `tests/ui/research-world-shell.spec.ts` for four-route shell coverage, destination navigation, route preservation, Lab/Atlas boundary copy, responsive viewport checks, keyboard smoke, reduced motion, and Axe scans.
- Updated README, planned roadmap, roadmap/concepts docs, simulation README, UI docs, current context, AGENTS guardrails, workspace IA docs, and source tests so they identify GW1 as a bounded shell implementation and GW1B as the next required audit.

Boundaries preserved:

- GW1 persistence means persistent application structure across routes, not persistent user research data.
- Lab and Atlas are reachable future-only destinations, not locked destinations.
- No saved experiments, notebooks, reusable-asset storage, Discovery Atlas logic, behavioral landscapes, progression state, XP, achievements, fake counts, fake activity, fake maps, storage, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, fonts, `/world`, or `/workshop` were added.
- Model schemas, Builder graphs, fit reports, scenario plans, visual-builder workspaces, and social/cognitive semantics remain structural/non-executable.

Checks:

- Focused source tests passed: `npm test -- researchDestinations semanticTokenFoundation workspaceInformationArchitecture ortusBrand builderUiShell modelSchemaAuthoring roadmap control`, 8 files and 58 tests.
- Required focused roadmap/control check passed: `npm test -- roadmap control`, 2 files and 12 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 60 files and 485 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes include `/`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 102.29 ticks/sec, Flocking 500 agents at 14.32 ticks/sec, Forest Fire 80x60 at 23.5 ticks/sec, and Predator-Prey default at 66.85 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable; npm reported `Missing script: "lint"` and could not write logs under `/home/rohchav/.npm/_logs`.

Rendered UI check status:

- Required post-GW1 `npm run test:ui` was not completed in this run.
- Attempting the focused Playwright shell test with elevated local-server/Chromium permissions was rejected by the approval layer because the session hit a usage limit.
- No workaround was attempted after that rejection.
- The added GW1 Playwright suite remains unexecuted in this run, so GW1 must not claim rendered shell audit completion.

Result:

- Prompt GW1 implementation is complete in source, docs, and non-browser verification.
- Prompt GW1B remains the next required Research World prompt before hardened-shell readiness claims.
- The worktree remains intentionally dirty and uncommitted for user review.

## 2026-06-29 - Prompt GW1 Continuation Skip-Link Focus Fix And Rendered Audit Completion

Goal: fix the GW1 destination-shell focus-visibility defect exposed by the new Playwright shell suite, complete the rendered shell audit, rerun the full UI suite, and decide whether GW1 is commit-ready.

Starting state:

- Current commit: `1a94375`.
- Worktree contained the expected dirty GW1 implementation files, docs, tests, and bounded shell changes.
- Ignored Playwright artifacts were present under `test-results/` and `playwright-report/`; no generated Playwright artifact appeared in `git status --short`.

Rendered failure investigated:

- Failing test: `World shell contract holds at desktop 1440x900`.
- Failure assertion: focused element top was expected to be at least `-2`, but received `-44`.
- Active element at failure: `a.research-shell__skip`, text `Skip to destination content`, href `#research-world-main`.
- Classification: Case A with transition timing. The skip link was focused while still offscreen because its hidden transform/reveal transition had not settled immediately after keyboard focus.
- Root cause: `.research-shell__skip` only revealed through a transform transition on `:focus-visible`, so the active focused element could be temporarily outside the viewport.

Fix:

- Updated shell CSS only.
- Made the skip link `position: fixed` with a high z-index, removed the reveal transition, and revealed it immediately on both `:focus` and `:focus-visible`.
- Added explicit focus outline on the skip link focused state.
- Added an AGENTS guardrail requiring shell skip links and focused destination controls to be visible inside the viewport immediately on focus.

Rendered verification:

- Focused shell rerun passed: `npx playwright test tests/ui/research-world-shell.spec.ts -g "World shell contract holds at desktop 1440x900"`, 1 passed.
- Full GW1 shell suite passed: `npx playwright test tests/ui/research-world-shell.spec.ts`, 29 passed, 0 failed, 0 skipped.
- Full UI suite passed: `npm run test:ui`, 44 passed, 0 failed, 0 skipped.
- The only repeated warnings were Node web-server warnings that `NO_COLOR` was ignored because `FORCE_COLOR` was set; these were not page console errors.

Final integrity checks:

- `npm run typecheck`: passed.
- `npm test`: passed, 60 files and 485 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes include `/`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 256.07 ticks/sec, Flocking 500 agents at 32.09 ticks/sec, Forest Fire 80x60 at 53.12 ticks/sec, and Predator-Prey default at 155.6 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.

Documentation updated:

- Updated `docs/ui/RESEARCH_WORLD_DESTINATION_SHELL.md`, `docs/ui/HCI_AUDIT.md`, `docs/ui/WORKSPACE_INFORMATION_ARCHITECTURE.md`, `docs/codex/CURRENT_CONTEXT.md`, `README.md`, `planned_roadmap.md`, `docs/roadmap.md`, `AGENTS.md`, and this session log.
- Documentation records the initial rendered failure, active focused element, root cause, production fix, focused shell pass, full shell pass, full UI pass, remaining limitations, and GW1 commit readiness.

Remaining limitations:

- GW1B has not been performed.
- Actual browser UI zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user-comprehension evidence remain unverified.
- Focus-return behavior beyond covered smoke paths remains unverified.

Result:

- Prompt GW1 is now commit-ready from the requested verification standpoint.
- No persistence, fake Lab content, fake Atlas content, progression, discovery logic, behavioral landscapes, `/world`, `/workshop`, redirects, simulation runtime behavior, Builder execution behavior, template behavior, dependencies, assets, or fonts were added.
- The worktree remains intentionally dirty and uncommitted for user review.

## 2026-06-29 - Prompt GW1B Destination Shell Audit And Hardening

Goal: audit and harden the completed GW1 destination shell without starting GW2 or adding persistence, fake Lab/Atlas content, Discovery Atlas logic, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, fonts, `/world`, `/workshop`, or redirects.

Starting state:

- Current commit: `380755d`.
- Starting worktree was clean.
- Recent commits included `380755d feat: Implement ORTUS Research World shell with future-only destinations`.
- Ignored Playwright artifacts were present but did not appear in `git status --short`.

Baseline before edits:

- `npm run test:ui`: passed, 44 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 60 files and 485 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 216.94 ticks/sec, Flocking 500 agents at 30.23 ticks/sec, Forest Fire 80x60 at 46.56 ticks/sec, and Predator-Prey default at 142.02 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.

Audit findings:

- No new production shell defect was found.
- The existing rendered suite covered the main route-shell behavior, but it did not explicitly assert unique shell landmarks, clean nav URLs, absence of disabled future-only navigation links, or `/world`/`/workshop` non-alias behavior.
- Actual browser zoom at 125%, 150%, and 200% was not verified.
- Screen-reader behavior, assistive-technology behavior, forced-colors behavior, full WCAG conformance, and user-comprehension evidence remain unverified.

Hardening:

- Strengthened `tests/ui/research-world-shell.spec.ts` with unique shell landmark checks, single ORTUS home link, clean destination navigation URLs, exactly one current nav item, no disabled future-only nav links, visible skip-link focus, reduced-motion focus visibility, stricter Lab/Atlas fake-data exclusions, and explicit `/world` and `/workshop` non-redirect/404 coverage.
- Strengthened `src/lib/researchDestinations.test.ts` with query/hash normalization and alias-rejection coverage.
- Added `docs/ui/RESEARCH_WORLD_DESTINATION_SHELL_AUDIT.md`.
- Updated README, planned roadmap, roadmap, Research World shell docs, HCI audit, workspace IA, current context, and roadmap tests so GW1B is complete and GW2 remains future work requiring explicit approval.

Boundaries preserved:

- No GW2 implementation was started.
- No persistence, fake Lab content, fake Atlas content, progression, Discovery Atlas logic, behavioral landscapes, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, fonts, `/world`, `/workshop`, redirects, model-schema execution, visual-builder execution, or hidden interpreter behavior was added.
- AGENTS.md was not changed because no new durable guardrail was needed beyond existing route-shell and runtime-honesty rules.

Rendered verification:

- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed.
- `npm run test:ui`: passed, 45 passed.
- The only repeated warnings were Node web-server warnings that `NO_COLOR` was ignored because `FORCE_COLOR` was set; these were not page console errors.

Final integrity checks:

- `npm run typecheck`: passed.
- `npm test`: passed, 60 files and 485 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes include `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 216.14 ticks/sec, Flocking 500 agents at 30.15 ticks/sec, Forest Fire 80x60 at 43.94 ticks/sec, and Predator-Prey default at 139.18 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.

Result:

- Prompt GW1B is complete.
- Readiness decision: ready for GW2 only as a route-shell prerequisite, with strict boundaries and only after explicit user approval.
- The worktree remains intentionally dirty and uncommitted for user review.

## 2026-06-30 - Prompt GW2 Active Run Provenance And Observation Layer

Goal: add live, non-persistent active-run provenance and observation context in World only, without creating persistent Lab records, Atlas discoveries, saved experiments, notebooks, reusable assets, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, routes, dependencies, storage, timestamps, random ids, fingerprints, validation, calibration, or empirical-truth claims.

Starting state:

- Current commit: `f71db6c`.
- Starting worktree was clean.
- Recent history showed GW1 and GW1B committed.

Baseline before edits:

- `npm run typecheck`: passed.
- `npm test`: passed, 60 files and 485 tests.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.
- `npm run perf:simulation`: passed.
- A concurrent baseline mistake ran `npm run build` while Playwright's web server was still using `.next`, causing a temporary `.next/routes-manifest.json` failure. Rerunning sequentially classified this as command-concurrency noise.
- Sequential `npm run build`: passed.
- Sequential `npm run test:ui`: passed, 45 passed.

Implemented:

- Added a pure active-run derivation adapter with `RunProvenanceSummary`, `RunObservationSummary`, and `RunInterpretationBoundary`.
- Added the World Observe `Active Run Context` panel.
- Derived live context only from existing selected template, active engine, latest snapshot, seed, parameters, scenario metadata, run status, speed, and intervention count.
- Preserved `Paused` as operational/paused.
- Added unresolved evidence status and required model-boundary copy.
- Did not generate a configuration fingerprint in GW2.
- Updated Lab and Atlas copy to state that GW2 live provenance exists only in World and does not create persistent Lab records or Atlas records.
- Added focused derivation, source-guardrail, destination-registry, and rendered Playwright coverage.
- Added `docs/ui/ACTIVE_RUN_PROVENANCE_AND_OBSERVATION.md` and updated durable roadmap/context docs.

Boundaries preserved:

- No persistent Lab records, Discovery Atlas records, saved experiments, notebooks, reusable assets, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, routes, dependencies, storage, timestamps, random ids, UUIDs, fingerprints, validation, calibration, causal proof, empirical measurement, or real-world evidence claim was added.

Final verification:

- `npm test -- provenance observation`: passed, 1 file and 5 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 61 files and 490 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes include `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 121.57 ticks/sec, Flocking 500 agents at 18.43 ticks/sec, Forest Fire medium grid at 30.79 ticks/sec, and Predator-Prey default at 97.92 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.
- Required post-implementation `npx playwright test tests/ui/research-world-shell.spec.ts` was blocked by the approval layer because the session hit its usage limit. It was not rerun after implementation.

Result:

- Prompt GW2 source implementation and non-browser verification are complete.
- Post-implementation rendered Playwright verification remains blocked/unrun in this session.
- Prompt GW2B is the next required audit prompt.

## 2026-06-30 - Prompt GW2 Continuation Focus Contract And Rendered Verification

Goal: fix the active-run context focus-contract failure and complete rendered GW2 verification without starting GW2B.

Failure:

- `npm run test:ui` failed in `tests/ui/research-world-shell.spec.ts`, `World shell contract holds at desktop 1440x900`.
- The failing assertion expected `.active-run-context` to be focused after `Observe` + `Tab`.

Diagnostic:

- Trace error context showed the panel was visible and readable.
- Temporary Playwright diagnostic after `Observe` + `Tab` reported the active element as `BUTTON#workspace-mode-tab-intervene`, role `tab`, text `IntervenePerturb`.

Root cause:

- The test forced an accessibility contract that static provenance/observation content should not have.
- `.active-run-context` had `tabIndex={0}` even though it contains read-only explanatory/model-output context and no primary interaction.

Fix:

- Removed `tabIndex={0}` from `.active-run-context`.
- Removed the matching focus-visible CSS for the static section.
- Updated the Playwright helper to verify panel visibility/readability and visible focus on real workspace controls around the panel.
- Added a source guard that `.active-run-context` remains semantic readable content rather than a fake tab stop.

Rendered verification:

- `npx playwright test tests/ui/research-world-shell.spec.ts -g "World shell contract holds at desktop 1440x900"`: passed, 1 passed.
- `npm run test:ui`: passed, 45 passed, 0 failed, 0 skipped.

Accessibility decision:

- `.active-run-context` is Case A: static readable region.
- It is not a normal Tab stop and is not a programmatic skip target in GW2.
- Keyboard focus moves from the Observe tab to the next meaningful workspace tab, and focus remains visible.

Boundaries preserved:

- No persistence, storage, timestamps, UUIDs, random ids, fingerprints, Lab records, Atlas records, Discovery Atlas behavior, behavioral landscapes, progression, routes, redirects, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, fonts, validation, calibration, or empirical-truth claim was added.

Result:

- GW2 rendered verification is complete.
- Prompt GW2B remains the next required audit prompt after GW2 is committed.

## 2026-06-30 - Prompt GW2B Active Run Provenance And Observation Audit And Hardening

Goal: audit and harden the committed GW2 active-run provenance and observation layer without starting GW3 or adding saved runs, Lab records, Atlas discoveries, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, routes, dependencies, assets, or fonts.

Starting state:

- Current commit: `51743b1`.
- Starting worktree was clean.
- Recent history showed GW2 committed after GW1B.

Baseline before edits:

- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 61 files and 491 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes include `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.

Audit findings:

- Provenance derivation remains pure active-state/configuration derivation. No storage, timestamps, random ids, UUIDs, generated run ids, fake fingerprints, server calls, hidden mutation, or empirical-validation claims were found in the GW2 derivation path.
- Observation remains distinct from provenance and keeps the required model-state copy.
- Interpretation boundary keeps evidence status unresolved and does not claim validation, calibration, causal proof, or empirical truth.
- `.active-run-context` remains static readable content, not a normal Tab stop.
- Lab and Atlas remain future-only informational routes; no persistent Lab records or Discovery Atlas records were added.
- Scope-creep search produced expected hits in docs/tests/older run-comparison or scenario persistence, but the GW2 production surfaces have no storage/time/random/fingerprint APIs.

Defects fixed:

- Missing-snapshot observation labels previously fell back to zero-like tick/time/entity/metric values. GW2B now renders `No snapshot` labels instead.
- Panel heading/subheading rows now wrap so status pills cannot force clipped single-row layout.
- Rendered tests now assert no active-run `tabindex="0"`, no fake interactive role, Shift+Tab behavior around Observe/Intervene, and absence of `.active-run-context` on Lab/Atlas.

Browser zoom:

- Attempted local Chromium keyboard zoom checks at 125%, 150%, and 200% for `/`, `/builder`, `/lab`, and `/atlas`.
- In this headless Playwright environment, `devicePixelRatio`, viewport width, client width, and `visualViewport.scale` did not change, so actual browser zoom was not verified.

Post-hardening verification:

- `npm test -- provenance observation`: passed, 1 file and 6 tests.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed.
- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 61 files and 491 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes include `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 95.64 ticks/sec, Flocking 500 agents at 12.41 ticks/sec, Forest Fire medium grid at 19.47 ticks/sec, and Predator-Prey default at 54.28 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.

Remaining limits:

- No screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, actual browser zoom verification, full WCAG conformance audit, or user-comprehension validation was completed.

Readiness decision:

- Ready for GW3 after GW2B is committed, with strict boundaries.
- GW3 must arrive through a dedicated future prompt and must not treat GW2 live provenance as Lab persistence, Atlas discovery, behavioral landscape evidence, validation, or empirical truth.

## 2026-06-30 - Prompt GW3 Active Intervention Boundary And Perturbation Readiness

Goal: add a bounded live intervention-readiness and model-response boundary layer in World Intervene without adding saved intervention plans, Lab intervention records, Atlas discoveries, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, routes, dependencies, storage, timestamps, random ids, fingerprints, validation, calibration, policy-effectiveness claims, or real-world causal proof.

Starting state:

- Current commit: `c13840b`.
- Starting worktree was clean.
- Recent history showed GW2B committed after GW2.

Baseline before edits:

- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 61 files and 491 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Implemented:

- Added `src/components/activeInterventionReadiness.ts` as a pure derivation adapter for live intervention readiness, selected-control target readiness, and response-boundary copy.
- Added the World Intervene `Intervention Readiness` static readable section above existing template-owned intervention controls.
- Derived GW3 context only from existing registered template-owned intervention definitions, selected target state, active engine presence, and current active-run intervention count.
- Kept existing intervention application behavior unchanged: controls still apply through existing template-owned definitions and the headless intervention executor/command-buffer path.
- Updated Lab and Atlas copy to state that GW3 exposes live readiness in World only and does not create persistent Lab intervention records or Discovery Atlas records.
- Added `docs/ui/ACTIVE_INTERVENTION_BOUNDARY_AND_READINESS.md` and updated durable roadmap/context docs.
- Updated roadmap tests for the revised GW3/GW3B/GW4-GW6 sequence.

Required boundary copy preserved:

- `Intervention readiness describes available model perturbation controls. It is not a saved intervention plan or experiment record.`
- `Intervention in ORTUS means changing or inspecting model conditions. It does not certify real-world causal power, policy effectiveness, or empirical truth.`
- `A response to an intervention is evidence about this model under this configuration. It is not automatic proof that the same intervention would work in the real system.`
- `GW3 exposes live intervention readiness in World. Persistent Lab intervention records are still not implemented.`
- `GW3 does not create Discovery Atlas records from intervention responses. Atlas remains future-only.`

Boundaries preserved:

- No saved intervention plans, persistent Lab intervention records, Discovery Atlas records, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, routes, dependencies, storage, timestamps, UUIDs, random ids, fingerprints, validation, calibration, policy-effectiveness claim, or real-world causal proof was added.
- Existing bounded active-run/snapshot intervention history predates GW3. GW3 did not expand it into saved plans, Lab records, Atlas records, or replay.
- Scope-creep search produced expected hits in docs/tests and older run-summary or storage features, but the GW3 production readiness path has no storage/time/random/fingerprint APIs.

Verification:

- `npm test -- intervention readiness`: passed, 2 files and 13 tests.
- `npm test -- roadmap`: passed, 1 file and 4 tests.
- `npm run typecheck`: passed after removing an unnecessary fake template fixture from the GW3 test.
- `npm test`: passed, 62 files and 497 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes include `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 77.47 ticks/sec, Flocking 500 agents at 12.59 ticks/sec, Forest Fire medium grid at 18.85 ticks/sec, and Predator-Prey default at 57.14 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script. npm reported `Missing script: "lint"`.

Rendered verification and continuation:

- Initial post-GW3 rendered verification failed in `tests/ui/research-world-shell.spec.ts`, `World shell contract holds at desktop 1440x900`.
- Root cause: the test used broad `page.getByLabel("Intervention")`, which matched the new `Intervention Readiness` region, status pills, subsections, the intervention selector, and the radius intervention input.
- Product accessibility finding: the intervention selector's visible/accessibility label was too generic for the richer Intervene surface, so it was changed from `Intervention` to `Intervention type`.
- Rendered test fix: the helper now targets `getByRole("region", { name: "Intervention Readiness" })`, scopes readiness/boundary assertions to that region, and targets the actual selector with `getByRole("combobox", { name: "Intervention type" })`.
- Focused rendered test passed: `npx playwright test tests/ui/research-world-shell.spec.ts -g "World shell contract holds at desktop 1440x900"`, 1 passed.
- Full shell rendered suite passed: `npx playwright test tests/ui/research-world-shell.spec.ts`, 30 passed, 0 failed, 0 skipped.
- Full UI rendered suite passed: `npm run test:ui`, 45 passed, 0 failed, 0 skipped.

Remaining limits:

- No screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, actual browser zoom verification, full WCAG conformance audit, or user-comprehension validation was completed.

Readiness decision:

- GW3 source implementation, rendered verification, and non-browser verification are complete.
- GW3 is ready to commit.
- Prompt GW3B is the next required Research World prompt after GW3 is committed.

## 2026-06-30 - Prompt GW3B Active Intervention Boundary Audit And Hardening

Goal: audit and harden the committed GW3 active intervention-readiness layer without starting GW4 or adding saved intervention plans, Lab intervention records, Atlas discoveries, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, routes, dependencies, assets, or fonts.

Starting state:

- Current commit: `8962c7f`.
- Starting worktree was clean.
- Ignored Playwright artifacts existed in `playwright-report/` and `test-results/` only.

Baseline before edits:

- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 62 files and 497 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 102.13 ticks/sec, Flocking 500 agents at 17.42 ticks/sec, Forest Fire medium grid at 29.67 ticks/sec, and Predator-Prey default at 88.58 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Audit findings:

- The pure readiness adapter still derives only from existing selected template, registered template-owned intervention definitions, target state, active-engine presence, and active-run intervention count.
- No hidden runtime expansion, schema execution, Builder execution, Lab persistence, Atlas discovery, storage, timestamps, random ids, fingerprints, validation/calibration claim, policy-effectiveness claim, or real-world causal claim was found.
- Status semantics remained correct: control availability is capability status, target readiness is interaction status, model response is evidence/unresolved, and Lab/Atlas remain capability/future-only.
- Lab and Atlas remain future-only informational routes and do not render fake intervention records, fake Discovery Atlas records, fake counts, evidence scores, recent activity, maps, progression, XP, or route locks.
- The main hardening targets were language and test coverage, not behavior.

Defects or risks hardened:

- Added explicit coverage for registered controls with a present target but no active engine; readiness and selected target now prove `Engine required` capability/unsupported semantics.
- Changed adjacent intervention list copy from `Recent interventions` to `Current run intervention entries`.
- Changed the empty state to `No interventions applied in the current run yet.` and the clear button to `Clear entries`.
- Changed the clear notice to `Current-run intervention entries cleared.`
- Changed active-run readiness copy from active-run intervention records to current-run intervention entries in engine/snapshot state, not saved Lab records.
- Changed visible command-path copy from `engine-validated` or `validated deterministic perturbations` to `engine-checked` language to avoid confusing software checks with scientific validation.
- Added source guards against regressing to `Recent interventions` or `engine-validated commands`.
- Added rendered assertions for `Intervention type`, `Radius intervention value`, current-run entry copy, empty-state copy, and the disabled `Clear entries` control.
- Added durable AGENTS guardrails that user-facing intervention copy must not imply scientific validation and current-run intervention entries are not saved plans, Lab records, Atlas discoveries, or validation evidence.

Browser zoom:

- Attempted actual Chromium keyboard zoom checks at target 125%, 150%, and 200% on `/`, `/builder`, `/lab`, and `/atlas` against a local dev server.
- In headless Playwright, `devicePixelRatio`, `innerWidth`, `clientWidth`, `visualViewport.scale`, `visualViewport.width`, and `scrollWidth` did not change after zoom attempts.
- Actual browser zoom at 125%, 150%, and 200% was attempted but not verified. Viewport automation is not browser zoom.

Focused post-hardening verification:

- `npm test -- intervention readiness`: passed, 2 files and 14 tests.
- `npx playwright test tests/ui/research-world-shell.spec.ts -g "World shell contract holds at desktop 1440x900"`: passed, 1 passed.

Full post-hardening verification:

- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 62 files and 498 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 93.53 ticks/sec, Flocking 500 agents at 14.08 ticks/sec, Forest Fire medium grid at 21.64 ticks/sec, and Predator-Prey default at 56.97 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limits:

- No screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, actual browser zoom verification, full WCAG conformance audit, or user-comprehension validation was completed.

Readiness decision:

- Ready for GW4 after GW3B is committed, with strict boundaries.
- GW4 must arrive through an explicit future prompt and must not treat GW3/GW3B as Lab persistence, saved intervention plans, Atlas discoveries, behavioral landscapes, validation/calibration, policy effectiveness, real-world causal proof, or general intervention-strategy runtime.

## 2026-07-01 - Prompt GW4 Discovery Atlas Information Architecture And Non-Persistent Evidence Map Foundation

Goal: add a bounded Atlas foundation on `/atlas` without saved discoveries, persistent evidence records, behavioral landscapes, sampled-region maps backed by run data, Lab records, run history, storage, progression, validation, calibration, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit: `270a169`.
- Starting worktree was clean.
- GW3B was committed.

Baseline before edits:

- `npm run test:ui`: initial sandbox run failed because the Playwright web server could not bind `127.0.0.1:3000` with `listen EPERM`; rerun with escalation passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 62 files and 498 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 92.96 ticks/sec, Flocking 500 agents at 13.10 ticks/sec, Forest Fire medium grid at 19.53 ticks/sec, and Predator-Prey default at 60.15 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Implementation:

- Added `src/lib/atlasFoundation.ts` as the small source model for Atlas foundation semantics.
- Added evidence states: unsampled, sampled, unresolved, supported within model, contradicted within model, unsupported, and externally unvalidated.
- Kept future-only as capability status, not evidence support.
- Changed Atlas destination availability from future-only to foundation while leaving Lab future-only.
- Replaced the old generic `/atlas` future-only surface with a bespoke non-persistent Atlas foundation route.
- Added evidence-state legend, required model-vs-world boundary copy, non-persistence copy, World relationship copy, Lab relationship copy, and a text-only conceptual scaffold labeled as not run data.
- Updated Lab copy to state that GW4 defines Atlas evidence semantics while persistent Lab evidence records remain unimplemented.
- Added `docs/ui/DISCOVERY_ATLAS_INFORMATION_ARCHITECTURE.md`.
- Updated roadmap, concept, HCI, shell, workspace IA, durable context, simulation README, README, and AGENTS references.

Boundaries preserved:

- No saved Discovery Atlas records, saved evidence records, persistent maps, behavioral landscapes, sampled-region maps backed by run data, Lab records, run history, save/map actions, storage, progression, runtime behavior, template behavior, Builder execution behavior, validation, calibration, or real-world discovery certification were added.
- Atlas maps investigated model behavior. It does not certify discoveries about the real world.
- Nothing on the Atlas route is a saved discovery, saved evidence record, or persistent map.

Focused verification during implementation:

- `npm test -- atlas foundation researchDestinations`: passed, 3 files and 16 tests.
- `npm run typecheck`: passed.
- `npx playwright test tests/ui/research-world-shell.spec.ts -g "Atlas shell contract holds at desktop"`: passed, 1 passed.
- `npm test -- roadmap atlas foundation researchDestinations activeInterventionReadiness`: passed, 5 files and 27 tests.
- `npm test -- atlas evidence`: passed, 1 file and 6 tests.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed.

Full post-implementation verification:

- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 63 files and 504 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 88.01 ticks/sec, Flocking 500 agents at 13.09 ticks/sec, Forest Fire medium grid at 20.70 ticks/sec, and Predator-Prey default at 57.67 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- Scope-creep search found expected hits in docs/tests/guardrails and pre-existing unrelated saved-run/scenario/runtime code. The new Atlas source and route did not introduce storage APIs, timestamps, generated ids, fake evidence scores, fake sampled-region counts, recent activity, or persistent records.

Remaining limits before GW4B:

- GW4 has not been audited by GW4B.
- Actual browser zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user comprehension remain unverified.

## 2026-07-01 - Prompt GW4B Discovery Atlas Foundation Audit And Hardening

Goal: audit and harden the committed GW4 Atlas foundation without starting GW5 or adding persistent Atlas records, behavioral landscapes, Lab records, saved evidence, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit: `c051334`.
- Starting worktree was clean.
- GW4 was committed.

Baseline before edits:

- `npm run test:ui`: passed, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 63 files and 504 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 95.74 ticks/sec, Flocking 500 agents at 15.08 ticks/sec, Forest Fire medium grid at 24.87 ticks/sec, and Predator-Prey default at 74.35 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Audit findings:

- `src/lib/atlasFoundation.ts` remains a bounded static Atlas information-architecture source model, not a persistent Discovery Atlas.
- No Atlas persistence, storage API, saved discovery, saved evidence record, saved map, run history, Lab record, timestamp, UUID, random id, fingerprint, fake data ingestion, generated evidence score, fake sampled-region count, progression mechanic, runtime behavior, template behavior, Builder execution behavior, dependency, asset, or font was added.
- One semantic defect was found: `Sampled` used evidence / observed even though the current Atlas route has no source-backed Atlas records.
- The defect mattered: `observed` could make a structural future evidence-state concept look like current sampled data.

Hardening:

- Changed `Sampled` from evidence / observed to evidence / unresolved.
- Updated sampled copy to state that source-backed model-run evidence would be needed before a future Atlas item could be treated as sampled.
- Removed `observed` from the Atlas evidence-state type surface.
- Added unit assertions that sampled remains unresolved and that Atlas evidence states do not use `observed`.
- Updated rendered assertions so the Atlas sampled pill must be `data-state="unresolved"` and the future-concept copy must be visible.
- Updated the Atlas audit record and concise roadmap/status references.
- Added a durable AGENTS guardrail that Atlas sampled evidence remains unresolved until a future source-backed Atlas record system exists.

Scope-creep search:

- The required broad search returned expected hits in docs, tests, guardrails, and pre-existing unrelated run/scenario/runtime code.
- Atlas-specific production source did not introduce persistence, storage, saved discoveries, saved evidence, fake records, fake maps, fake scores, progression, behavioral landscapes, evidence maps backed by fake data, timestamps, random IDs, UUIDs, or fingerprints.

Browser zoom:

- Attempted actual Chromium keyboard zoom checks at target 125%, 150%, and 200% on `/`, `/builder`, `/lab`, and `/atlas` against a local dev server.
- In headless Playwright, `devicePixelRatio`, `innerWidth`, `clientWidth`, `visualViewport.scale`, `visualViewport.width`, and `scrollWidth` did not change after zoom attempts.
- Actual browser zoom at 125%, 150%, and 200% was attempted but not verified.

Post-hardening verification:

- `npm test -- atlas evidence researchDestinations roadmap`: passed, 3 files and 15 tests.
- `npm run typecheck`: passed.
- `git diff --check`: passed.
- `npm test`: passed, 63 files and 505 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 92.73 ticks/sec, Flocking 500 agents at 10.91 ticks/sec, Forest Fire medium grid at 22.50 ticks/sec, and Predator-Prey default at 58.88 ticks/sec.
- `npm run lint`: unavailable, package.json has no lint script.

Blocked rendered verification:

- Required `npx playwright test tests/ui/research-world-shell.spec.ts` post-hardening rerun was blocked before execution by the local tool escalation usage limit after the sandbox path required Playwright/localhost escalation.
- Required `npm run test:ui` post-hardening rerun was not attempted again because it depends on the same local Playwright/localhost escalation path and the escalation was blocked.
- This is not a passing rendered result.

Remaining limits:

- No screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, actual browser zoom verification, full WCAG conformance audit, or user-comprehension validation was completed.

Readiness decision:

- Not ready for GW5 under the GW4B prompt gate until the required post-hardening rendered shell suite and full UI Playwright/Axe suite can run and pass.
- GW4B is not ready to commit under the prompt gate while those rendered checks remain blocked.

## 2026-07-01 - Prompt GW4B Continuation Rendered Verification And Commit Gate

Goal: complete the previously blocked GW4B post-hardening rendered verification gate, rerun final integrity checks, update docs, and commit only if all gates pass.

Starting state:

- Current commit: `c051334`.
- Worktree contained only expected uncommitted GW4B audit/hardening changes.
- The Atlas semantic fix was present: `Sampled` is evidence / unresolved, not evidence / observed.
- `/atlas` still states that Atlas is non-persistent, Discovery records are not implemented, behavioral landscapes are not implemented, sampled-region maps are not implemented, evidence-linked regimes are not implemented, and model behavior is not real-world certification.

Rendered verification:

- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed.
- `npm run test:ui`: passed, 45 passed.
- The full UI suite covered Research World shell routes, `/atlas`, `/lab`, `/`, `/builder`, reduced motion, Axe scans, semantic foundation routes, and status semantics.
- Dev-server `NO_COLOR` / `FORCE_COLOR` warnings appeared again and remain classified as expected dev-server noise.

Final integrity checks:

- `npm run typecheck`: passed.
- `npm test`: passed, 63 files and 505 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 97.69 ticks/sec, Flocking 500 agents at 12.87 ticks/sec, Forest Fire medium grid at 19.65 ticks/sec, and Predator-Prey default at 50.75 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Scope-creep search:

- The required broad search returned expected hits in docs, tests, guardrails, and pre-existing unrelated run/scenario/runtime code.
- Atlas-specific production source still did not introduce persistence, storage, saved discoveries, saved evidence, fake records, fake maps, fake scores, progression, behavioral landscapes, timestamps, random IDs, UUIDs, or fingerprints.

Documentation updates:

- Updated the GW4B audit record, README, roadmap/status docs, concepts, simulation README, current context, and planned roadmap so they no longer describe the rendered gate as blocked.
- Remaining limitations still include no screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, actual browser zoom verification, full WCAG conformance audit, or user-comprehension validation.

Readiness decision:

- Ready for GW5 after GW4B is committed, with strict boundaries.
- GW5 remains a future prompt only with explicit user approval.
- GW5 must not treat GW4/GW4B Atlas as persistence, behavioral landscapes, validation, real-world discovery, or sampled run-backed evidence.

## 2026-07-01 - Prompt GW5 Lab Evidence Record Information Architecture

Goal: add a bounded, non-persistent `/lab` information architecture for future Lab evidence-record lifecycle semantics and experiment-ledger scaffolding without adding saved records, experiment history, notebooks, comparisons, run history, storage, Lab-to-Atlas publication, progression, runtime behavior, template behavior, Builder execution, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `d4fb2fc`.
- Worktree was clean.
- Baseline checks passed before editing: `npm run test:ui`, `npm run typecheck`, `npm test`, `npm run build`, `npm run perf:simulation`, and `git diff --check`.
- `npm run lint` remained unavailable because `package.json` has no lint script.

Implementation:

- Added `src/lib/labFoundation.ts` as a bounded source model for Lab route status, evidence-record lifecycle states, experiment-ledger scaffold states, and World/Atlas/model-vs-world/non-persistence boundaries.
- Updated `/lab` from a generic future-only destination page to a structured non-persistent GW5 foundation route with `Lab` H1, capability/planning-only route status, lifecycle legend, conceptual scaffold labeled as not saved Lab data, and explicit World/Atlas relationship copy.
- Updated the destination registry so Lab is a foundation route rather than a future-only route while still denying persistent Lab records.
- Updated Atlas relationship copy so Atlas no longer says Lab remains future-only, while still denying Lab-to-Atlas publication.
- Added/updated unit and rendered tests for Lab lifecycle semantics, route contracts, status categories, no fake actions, no storage/timestamps/random ids, and no runtime/persistence expansion.
- Added `docs/ui/LAB_EVIDENCE_RECORD_INFORMATION_ARCHITECTURE.md` and updated roadmap/status/context docs and durable AGENTS guardrails.

Verification:

- `npm test -- lab evidence researchDestinations atlas roadmap activeInterventionReadiness`: passed, 6 files and 40 tests.
- `npm run typecheck`: passed.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests.
- `npm test`: passed, 64 files and 512 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 128.68 ticks/sec, Flocking 500 agents at 19.48 ticks/sec, Forest Fire medium grid at 28.81 ticks/sec, and Predator-Prey default at 83.93 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- `npm run test:ui`: passed, 45 tests.

Scope-creep search:

- The required broad search returned expected hits in docs, tests, guardrails, pre-existing run-summary/store code, and pre-existing performance/time helpers.
- Narrow changed-production-source search across Lab, Atlas, and destination registry files found no storage APIs, timestamps, random ids, fake score fields, fake recent activity, or save/send/publish/create actions.

Boundaries preserved:

- GW5 did not save active World runs, import active-run provenance, create persistent Lab evidence records, create experiment ledgers, create notebooks, create saved comparisons, create run history, publish records to Atlas, create discoveries, add storage, add generated ids or timestamps, add progression, change simulation/template runtime behavior, or change Builder execution behavior.
- Lab records are described as future evidence about model investigations, not certification of real-world discoveries.

Next prompt:

- Prompt GW5B: Lab Evidence Record Information Architecture Audit, only with explicit user approval.

## 2026-07-01 - Prompt GW5B Lab Evidence Record Foundation Audit

Goal: audit and harden the committed GW5 Lab foundation without adding persistent Lab storage, saved experiments, notebooks, run history, Atlas publication, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `7d60b32`.
- Starting worktree was clean.
- GW5 was committed.

Baseline before edits:

- `npm run test:ui`: blocked before execution by environment/tooling escalation usage limits. Classified as an environment issue, not a detected GW5 regression.
- `npm run typecheck`: passed.
- `npm test`: passed, 64 files and 512 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 121.96 ticks/sec, Flocking 500 agents at 15.38 ticks/sec, Forest Fire medium grid at 25.87 ticks/sec, and Predator-Prey default at 68.72 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Audit findings:

- The Lab source model remains bounded static information architecture, not saved evidence-record storage.
- `/lab` keeps route status capability/planning-only, persistent record capabilities future-only, model-only evidence unresolved, and externally unvalidated evidence unverified.
- The route keeps the conceptual ledger labeled as not saved Lab data and contains no fake save/send/publish controls, fake records, fake notebooks, fake comparisons, fake counts, evidence scores, recent activity, progression, storage, timestamps, generated ids, or Lab-to-Atlas publication path.
- The concrete defect found was stale durable context/roadmap tail wording that named `Prompt GW5 Behavioral Landscape Exploration` as next and skipped the required GW5B audit gate.

Hardening:

- Added `docs/ui/LAB_EVIDENCE_RECORD_INFORMATION_ARCHITECTURE_AUDIT.md`.
- Corrected stale next-prompt wording in durable context and planned roadmap docs.
- Added a roadmap regression assertion against the stale audit-skipping phrase.

Post-hardening verification:

- `npm test -- roadmap labFoundation`: passed, 2 files and 11 tests.
- `npm run typecheck`: passed.
- `git diff --check`: passed.
- `npm test`: passed, 64 files and 512 tests.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 117.38 ticks/sec, Flocking 500 agents at 15.00 ticks/sec, Forest Fire medium grid at 25.30 ticks/sec, and Predator-Prey default at 74.11 ticks/sec.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run lint`: unavailable, package.json has no lint script.

Continuation rendered verification:

- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed.
- `npm run test:ui`: passed, 45 passed.
- Dev-server `NO_COLOR` / `FORCE_COLOR` warnings appeared again and remain classified as expected dev-server noise.

Final integrity checks:

- `npm run typecheck`: passed.
- `npm test`: passed, 64 files and 512 tests.
- `npm run build`: passed with Next.js 15.5.19; static routes included `/`, `/_not-found`, `/atlas`, `/builder`, and `/lab`.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 228.42 ticks/sec, Flocking 500 agents at 31.11 ticks/sec, Forest Fire medium grid at 52.09 ticks/sec, and Predator-Prey default at 148.11 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Scope-creep search:

- The required broad search returned expected hits in docs, tests, guardrails, and pre-existing unrelated Scenario/Run Comparison/Experiment/Neural Runtime Lab/performance code.
- Lab-specific production source still did not introduce persistence, storage, saved experiments, evidence records, notebooks, run histories, Lab-to-Atlas publication, behavioral landscapes, progression, timestamps, random IDs, UUIDs, fingerprints, fake scores, fake recent activity, or save/send/publish/create actions.

Remaining limits:

- Actual browser zoom at 125%, 150%, and 200% was not verified.
- No screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, full WCAG conformance audit, or user-comprehension validation was completed.

Readiness decision:

- GW5B is ready for the requested commit gate after final rerun checks remain passing.
- GW6 remains a future prompt only with explicit user approval after GW5B is committed.

## 2026-07-02 - Prompt GW6 Contextual Capability Guidance

Goal: implement bounded source-backed contextual capability guidance for World, Workshop, Lab, and Atlas without creating persistence, saved records, Atlas discoveries, Lab experiments, behavioral landscapes, progression, generated guidance, runtime behavior, template behavior, Builder execution behavior, validation, calibration, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `f97371d`.
- Starting worktree was clean.
- GW5B was committed.

Baseline before edits:

- `npm run test:ui`: passed, 45 passed. The sandboxed first attempt failed because Next could not bind `127.0.0.1:3000`; the escalated rerun passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 64 files and 512 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Implementation:

- Added `src/lib/capabilityGuidance.ts` with `CapabilityGuidanceSummary`, `CapabilityGuidanceItem`, `CapabilityBoundary`, `CapabilityDestinationRole`, and `CapabilityAvailability`.
- Added `src/components/researchWorld/CapabilityGuidancePanel.tsx` as a static route-local panel.
- Added guidance to World, Workshop, Lab, and Atlas.
- Kept World and Workshop guidance compact so World remains canvas-dominant and Builder remains usable.
- Made the existing Builder inspector scroll region keyboard-focusable with a visible focus style after the added Workshop guidance exposed an Axe `scrollable-region-focusable` issue.
- Added `src/lib/capabilityGuidance.test.ts` and extended `tests/ui/research-world-shell.spec.ts`.
- Added `docs/ui/CONTEXTUAL_CAPABILITY_GUIDANCE.md` and updated durable roadmap/context/guardrail docs.

Boundary decisions:

- Capability guidance describes current product capability. It does not create capability.
- GW6 creates source-backed guidance and capability orientation. It does not create saved records, Atlas discoveries, Lab experiments, behavioral landscapes, progression, user-derived routing, or behavior-derived task ordering.
- The visible panel copy says: `Guidance describes current ORTUS capabilities. It does not create saved records, validation, discoveries, or persistence.`
- Guidance has no storage, dismissal state, analytics, timestamps, random ids, generated ids, user-derived routing, behavior-derived task ordering, generated guidance, or route-local fake actions.

Verification:

- `npm test -- capability guidance`: passed, 1 file and 7 tests.
- `npm run typecheck`: passed.
- `git diff --check`: passed.
- `npm test`: passed, 65 files and 519 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 153.46 ticks/sec, Flocking 500 agents at 18.57 ticks/sec, Forest Fire medium grid at 28.94 ticks/sec, and Predator-Prey default at 88.53 ticks/sec.
- `npm run lint`: unavailable, package.json has no lint script.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed earlier in the turn after the UI changes, 30 passed.
- Continuation final `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 passed, 0 failed, 0 skipped.
- Continuation final `npm run test:ui`: passed, 45 passed, 0 failed, 0 skipped.
- Continuation final `npm run typecheck`: passed.
- Continuation final `npm test`: passed, 65 files and 519 tests.
- Continuation final `npm run build`: passed with Next.js 15.5.19.
- Continuation final `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 78.43 ticks/sec, Flocking 500 agents at 10.31 ticks/sec, Forest Fire medium grid at 19.06 ticks/sec, and Predator-Prey default at 54.05 ticks/sec.
- Continuation final `git diff --check`: passed.
- Continuation final `npm run lint`: unavailable, package.json has no lint script.

Scope search:

- The required broad scope-creep search returned expected hits in docs, tests, guardrails, and pre-existing unrelated Scenario/Run Comparison/Experiment/Neural Runtime Lab/performance code.
- GW6 production additions did not introduce storage APIs, timestamps, random ids, UUIDs, fingerprints, fake save/send/publish/create actions, generated guidance behavior, persistent guidance state, Lab persistence, Atlas persistence, runtime behavior, template behavior, or Builder execution behavior.

Remaining limits:

- The final focused shell and full UI Playwright/Axe reruns passed after documentation updates.
- Actual browser zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user-comprehension evidence remain unverified.

Readiness decision:

- GW6 was ready to commit based on final focused rendered shell verification, final full UI rendered verification, source, unit, typecheck, build, performance, diff, and scope-creep checks.

## 2026-07-02 - Prompt GW6B Contextual Capability Guidance Audit And Hardening

Goal: audit and harden the committed GW6 contextual capability guidance layer without starting GW7, adding persistence, recommendations, onboarding, fake actions, Lab records, Atlas discoveries, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `c594546`.
- Starting worktree was clean.
- GW6 was committed.

Baseline blockers:

- `npm test` reproduced a timeout in `src/simulation/__tests__/uncertainty.test.ts` for the production-template numeric-parameter coverage.
- The prompt-supplied focused filter initially skipped because the old test name did not contain `production-template numeric-parameter`.
- The first rendered shell Playwright attempts reused a stale local Next.js dev server on port 3000. The page SSR output loaded, but CSS and JavaScript app chunks returned 404, so the World route stayed in the hydrating shell.

Hardening:

- Split the aggregate uncertainty production-template numeric-parameter test into per-template `it.each` cases without weakening generated-run, determinism, snapshot-equality, or finite-metric assertions.
- Renamed the split cases so `npm test -- src/simulation/__tests__/uncertainty.test.ts -t "production-template numeric-parameter"` exercises the intended coverage.
- Stopped the stale Next.js dev server and reran rendered verification against a fresh server.
- Added `docs/ui/CONTEXTUAL_CAPABILITY_GUIDANCE_AUDIT.md`.
- Hardened capability-guidance source and docs away from advice-system vocabulary. Guidance remains static route-local capability orientation, not user-derived routing, behavior-derived task ordering, or generated guidance.
- Updated README, planned roadmap, roadmap, HCI audit, workspace IA, current context, contextual-guidance docs, Lab/Atlas foundation references, and session log.

Verification:

- `npm test -- src/simulation/__tests__/uncertainty.test.ts`: passed, 1 file and 15 tests.
- `npm test -- src/simulation/__tests__/uncertainty.test.ts -t "production-template numeric-parameter"`: passed, 7 tests exercised and 8 skipped.
- `npm test`: passed, 65 files and 525 tests.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: first fresh-server rerun passed, 30 passed.
- `npm run test:ui`: passed, 45 passed.
- `npm test -- capabilityGuidance`: passed, 1 file and 7 tests.

Remaining limits:

- Actual browser zoom at 125%, 150%, and 200% was not verified.
- No screen-reader walkthrough, assistive-technology walkthrough, forced-colors audit, full WCAG conformance audit, or user-comprehension validation was completed.
- Playwright/Axe evidence is rendered smoke evidence, not accessibility certification.

Readiness decision:

- GW6B was ready for GW7 after typecheck, full unit, build, performance smoke, diff check, lint availability, scope-creep search, and final documentation state remained clean.
- At GW6B close, GW7 still required explicit user approval.

## 2026-07-02 - Prompt GW7 Behavioral Landscape Exploration Foundation

Goal: implement a bounded behavioral-landscape foundation without creating saved landscapes, sampled-region maps, evidence records, Atlas discoveries, Lab experiments, run sweeps, batch execution, regime detection, progression, persistence, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `b90d655`.
- Starting worktree was clean.
- GW6B was committed.

Baseline:

- `npm run test:ui`: passed after rerun against an available fresh dev-server context, 45 passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 65 files and 525 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Implementation:

- Added `src/lib/behavioralLandscapeFoundation.ts` as the source model for behavioral-landscape vocabulary, axes, region states, scaffold summary, and boundaries.
- Added `src/lib/behavioralLandscapeFoundation.test.ts` for uniqueness, status semantics, future-only/evidence-state boundaries, non-persistence, no fake score/storage/time/random fields, and route-contract checks.
- Extended `/atlas` with a text-only `Behavioral Landscape Foundation` section.
- Extended rendered shell tests for Atlas behavioral-landscape visibility, required non-persistence/model-vs-world copy, status semantics, no fake heatmap/contour/score/action language, and World/Lab/Builder non-action boundaries.
- Added `docs/ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION.md`.
- Updated roadmap, concept, Atlas, Lab, guidance, HCI, workspace IA, AGENTS, and Codex context references.

Boundary:

- A behavioral landscape describes how model behavior may vary across model conditions. It is not a real-world map, empirical proof, or Discovery Atlas record.
- GW7 creates behavioral-landscape vocabulary and non-persistent exploration scaffolding. It does not create saved landscapes, sampled-region maps, evidence records, Atlas discoveries, Lab experiments, regime detection, or real-world validation.
- The scaffold is text-only because a plot-like placeholder would be too easy to misread as sampled data.

Verification:

- `npm test -- behavioralLandscapeFoundation`: passed, 1 file and 9 tests.
- `npm test -- behavioral landscape`: passed, 1 file and 9 tests.
- `npm test -- atlasFoundation capabilityGuidance researchDestinations roadmap`: passed, 4 files and 22 tests.
- Initial `npx playwright test tests/ui/research-world-shell.spec.ts`: blocked in sandbox with `Process from config.webServer exited early`; manual `npm run dev -- --hostname 127.0.0.1 --port 3000` classified the cause as sandbox `listen EPERM`, not an app crash.
- Continuation `npx playwright test tests/ui/research-world-shell.spec.ts` with local-server permission: passed, 30 tests.
- Continuation `npm run test:ui` with local-server permission: passed, 45 tests.
- Continuation `npm run typecheck`: passed.
- Continuation `npm test`: passed, 66 files and 534 tests.
- Continuation `npm run build`: passed with Next.js 15.5.19.
- Continuation `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 108.15 ticks/sec, Flocking 500 agents at 13.67 ticks/sec, Forest Fire medium grid at 20.18 ticks/sec, and Predator-Prey default at 62.34 ticks/sec.
- Continuation `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- Required broad scope-creep search returned expected hits in docs/tests/guardrails and pre-existing unrelated experiment/run/performance code. GW7 production additions did not introduce persistence, fake maps, fake sampled regions, fake scores, run sweeps, batch execution, regime detection, discoveries, progression, timestamps, random IDs, UUIDs, or fingerprints.

Remaining limits:

- GW7 is not validated by GW7B yet.
- Rendered Playwright/Axe smoke verification passed in the July 3 continuation. This is not accessibility certification.
- Actual browser zoom at 125%, 150%, and 200%, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user-comprehension evidence remain unverified.

Next:

- GW7B: Behavioral Landscape Foundation Audit and Hardening followed this work and is recorded in the next session-log entry.

## 2026-07-03 - Prompt GW7B Behavioral Landscape Foundation Audit and Hardening

Goal: audit and harden the GW7 Behavioral Landscape Exploration Foundation without adding persistent maps, sampled data, run sweeps, regime detection, Atlas discoveries, Lab records, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `3da99c3`.
- Starting worktree was clean.
- Prompt GW7 was committed.

Baseline:

- `npm run test:ui` failed in the sandbox because the local dev server could not bind to `127.0.0.1:3000` (`listen EPERM`), not because of an app crash.
- Escalated `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 66 files and 534 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Audit and hardening:

- Added `docs/ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION_AUDIT.md`.
- Hardened `src/lib/behavioralLandscapeFoundation.test.ts` around high-risk vocabulary: sampled areas, model regimes, transition zones, sensitivity zones, conceptual scaffold, and future sampled landscape status.
- Expanded forbidden structural-key/source checks for sampled-region counts, sample counts, coverage percentages, regime confidence, and score values.
- Hardened `tests/ui/research-world-shell.spec.ts` with rendered assertions for high-risk Atlas vocabulary and a zero-Tab-stop contract for the behavioral landscape scaffold.
- Updated roadmap, concepts, Atlas, HCI, workspace IA, AGENTS, README, current context, and session-log references so GW7B is complete and GW8 is the next Research World prompt only with explicit approval.

Browser zoom:

- A Playwright keyboard-zoom probe against `/`, `/builder`, `/lab`, and `/atlas` did not change `devicePixelRatio`, viewport width, or `visualViewport.scale` in headless Chromium.
- Actual browser zoom at 125%, 150%, and 200% remains unverified.

Verification:

- `npm test -- behavioralLandscapeFoundation roadmap`: passed, 2 files and 14 tests.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests.
- `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 66 files and 535 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed. Local smoke results: Flocking 100 agents at 111.7 ticks/sec, Flocking 500 agents at 16.58 ticks/sec, Forest Fire medium grid at 26.23 ticks/sec, and Predator-Prey default at 87.89 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- Scoped source search found no storage/runtime coupling in the behavioral-landscape source or Atlas route. Saved-landscape/regime hits were explicit non-implementation copy.

Remaining limits:

- GW7B is automated source/rendered smoke evidence and documentation audit, not user-comprehension validation.
- Actual browser zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, full WCAG conformance, and scientific validation remain unverified.

Readiness decision:

- Ready for GW8 only after this work is committed, and only if GW8 arrives through an explicit future prompt.
- GW8 must not treat GW7/GW7B as sampled data, saved maps, runtime support, validation, empirical evidence, or progression.

## 2026-07-03 - Prompt GW8 Landscape Probe Planning Foundation

Goal: implement a bounded landscape probe planning foundation without creating executable probes, saved probe plans, sampled landscapes, run queues, parameter sweeps, batch execution, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `c69a878`.
- Starting worktree was clean.
- Prompt GW7B was committed.

Baseline:

- `npm run test:ui` failed in the sandbox because the local dev server exited early, consistent with the known sandbox local-socket limitation.
- Escalated `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 66 files and 535 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Implementation:

- Added `src/lib/landscapeProbePlanningFoundation.ts` as the source model for landscape probe planning vocabulary, candidate axes, candidate outcomes, constraints, conceptual scaffold, and relationship boundaries.
- Added `src/lib/landscapeProbePlanningFoundation.test.ts` for uniqueness, UX2 status semantics, required distinctions, non-execution/non-persistence, no fake storage/time/random/result fields, route-contract checks, and source-coupling checks.
- Extended `/atlas` with a static `Landscape Probe Planning` section.
- Extended rendered shell tests for Atlas probe-planning visibility, conceptual probe-plan copy, non-execution, non-persistence, model-vs-real-world boundaries, status semantics, no fake run-probe/sweep/save/result/score actions, and zero local Tab stops.
- Added `docs/ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION.md`.
- Updated roadmap, concept, Atlas, Lab, guidance, HCI, workspace IA, AGENTS, README, current context, and session-log references.

Boundary:

- A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery.
- GW8 creates non-persistent landscape probe planning semantics. It does not execute probes, run parameter sweeps, generate samples, save plans, create Lab records, create Atlas discoveries, detect regimes, or validate real-world claims.
- The scaffold is text/cards only because a table or queue-like surface would invite users to see fake saved plans or fake samples.

Verification:

- `npm test -- landscapeProbePlanningFoundation roadmap`: passed, 2 files and 12 tests.
- Sandboxed `npx playwright test tests/ui/research-world-shell.spec.ts`: blocked because the local dev server exited early under sandboxed local-socket restrictions.
- Escalated `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests, after tightening two false-positive rendered assertions.
- Escalated `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 193.92 ticks/sec, Flocking 500 agents at 29.7 ticks/sec, Forest Fire medium grid at 39.52 ticks/sec, and Predator-Prey default at 114.28 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- Required broad scope-creep search returned expected hits in docs/tests/guardrails and pre-existing unrelated run-comparison/store/runtime code. A focused production-source search on `src/lib/landscapeProbePlanningFoundation.ts` and `src/app/atlas/page.tsx` found no storage APIs, timestamps/random IDs/fingerprints, fake run actions, runtime coupling, compilers, or interpreters.

Remaining limits:

- At GW8 close, GW8 had not yet been audited by GW8B.
- Rendered Playwright/Axe smoke verification is not accessibility certification.
- Actual browser zoom at 125%, 150%, and 200%, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user-comprehension evidence remain unverified.

Next:

- GW8B: Landscape Probe Planning Audit and Hardening followed with explicit user approval and is recorded in the next session-log entry.

## 2026-07-06 - Prompt GW8B Landscape Probe Planning Audit and Hardening

Goal: audit and harden the committed GW8 Landscape Probe Planning foundation without adding executable probes, saved plans, sampled results, run queues, sweeps, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, or fonts.

Starting state:

- Current commit before work: `798e3dc`.
- Starting worktree was clean.
- Prompt GW8 was committed.

Baseline:

- `npm run test:ui` failed in the sandbox because the configured local web server exited early, consistent with the known sandbox local-server limitation.
- Escalated `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Audit and hardening:

- Added `docs/ui/LANDSCAPE_PROBE_PLANNING_FOUNDATION_AUDIT.md`.
- Found one bounded vocabulary defect: `Planned comparison is not a completed analysis.` was true but too weak for the required result boundary.
- Hardened the source wording to `Planned comparison is not a comparison result.`
- Added unit and rendered assertions for the planned-comparison distinction.
- Updated roadmap, concepts, Research World mini-roadmap, README, Atlas, Lab, guidance, destination shell, behavioral landscape, HCI, workspace IA, current context, session log, and AGENTS references so GW8B is complete and GW9 is the next Research World prompt only with explicit approval.

Browser zoom:

- A headless Chromium keyboard-zoom attempt visited `/`, `/builder`, `/lab`, and `/atlas`, pressed Ctrl+plus repeatedly, and measured `devicePixelRatio`, `innerWidth`, and `visualViewport.scale`.
- Those metrics did not change, so actual browser zoom was not verified.
- Actual browser zoom at 125%, 150%, and 200% was not verified.

Verification:

- `npm test -- landscapeProbePlanningFoundation roadmap`: passed, 2 files and 12 tests.
- Sandboxed `npx playwright test tests/ui/research-world-shell.spec.ts`: blocked because the local dev server exited early under sandboxed local-socket restrictions.
- Escalated `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests.
- Sandboxed `npm run test:ui`: blocked because the local dev server exited early under sandboxed local-socket restrictions.
- Escalated `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 107.86 ticks/sec, Flocking 500 agents at 16.08 ticks/sec, Forest Fire medium grid at 23.85 ticks/sec, and Predator-Prey default at 72.54 ticks/sec.
- `npm run lint`: unavailable, package.json has no lint script.
- Required broad scope-creep search returned expected hits in docs/tests/guardrails and pre-existing unrelated run-comparison/store/runtime/performance code. Focused GW8 production-source inspection found no storage APIs, timestamps/random IDs/fingerprints, fake run actions, runtime coupling, compilers, interpreters, saved plans, queues, sampled results, scores, sweeps, or regime detection.

Remaining limits:

- Rendered Playwright/Axe smoke verification is not accessibility certification.
- Actual browser zoom at 125%, 150%, and 200%, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, user-comprehension evidence, scientific validation, and calibration remain unverified.

Readiness decision:

- Ready for GW9 after commit, only if GW9 arrives through an explicit future prompt.
- GW9 must not inherit executable probes, saved plans, sampled results, sweeps, regime detection, Lab records, Atlas discoveries, progression, persistence, runtime behavior, template behavior, Builder execution behavior, validation, calibration, or real-world discovery claims from GW8/GW8B.

## 2026-07-06 - Prompt UX3 Full UI/UX Comprehension and Sandbox-Theme Audit

Goal: complete a rendered UI/UX comprehension and sandbox-theme audit across World, Workshop, Lab, and Atlas without implementing production redesign, theme tokens, component changes, route changes, preferences, onboarding, progression, guided Builder behavior, persistence, runtime behavior, Lab records, Atlas discoveries, probes, sweeps, sampling, or GW9.

Starting state:

- Current commit before work: `466213b`.
- Starting worktree was clean.
- Prompt GW8B was committed.

Rendered evidence:

- Sandboxed local-server checks failed with the known local-socket restriction: `Process from config.webServer exited early` and manual server start showed `listen EPERM`.
- Escalated `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests.
- Escalated `npm run test:ui`: passed, 45 tests.
- Rendered route inventory covered `/`, `/builder`, `/lab`, and `/atlas` at `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`.
- All 20 route/viewport inventory entries reported no horizontal overflow, no page errors, and no browser console error/warning messages.
- Screenshot inspection found World closest to a sandbox, Workshop functioning as an expert Advanced Builder surface, and Lab/Atlas remaining honest but concept-heavy static scaffolds.
- A headless Chromium keyboard-zoom attempt did not change `devicePixelRatio`, `innerWidth`, or `visualViewport.scale`.

Audit result:

- Added `docs/ui/FULL_UI_UX_COMPREHENSION_AND_SANDBOX_THEME_AUDIT.md`.
- Updated README, roadmap, HCI, workspace IA, visual-direction, current-context, session-log, AGENTS, and roadmap tests with the UX3 pause decision.
- UX3 complete.
- GW9 paused until the sandbox-theme and guided-comprehension track is addressed or explicitly waived.
- Next recommended prompt: UX4.

Recommended sequence:

- UX4: Sandbox Visual Language Foundation.
- UX4B: Sandbox Visual Language Audit and Hardening.
- UX5: Progressive Disclosure and Beginner/Advanced Information Architecture.
- UX5B: Progressive Disclosure Audit and Hardening.
- UX6: Step-by-Step Builder and Configuration Flow Foundation.
- UX6B: Builder Flow Audit and Hardening.
- GW9: Ephemeral Landscape Sampling Preview V1.

Scope-creep findings:

- The required broad search returned expected hits in docs/tests/guardrails and pre-existing production code for local run/scenario/panel storage, avatar/performance instrumentation localStorage, UI timestamp ids, experiment progress, and rejection vocabulary.
- UX3 added no production storage, preferences, onboarding, progression, recommendations, saved Lab/Atlas behavior, run queues, sampling, regime detection, fake scores, random runtime behavior, or Builder/runtime execution path.

Verification:

- `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 257.18 ticks/sec, Flocking 500 agents at 32.28 ticks/sec, Forest Fire medium grid at 52.81 ticks/sec, and Predator-Prey default at 160.78 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Remaining limits:

- UX3 is rendered smoke evidence and expert review, not a user-comprehension study.
- Actual browser zoom at 125%, 150%, and 200% was not verified.
- Screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user-comprehension evidence remain unverified.

### Prompt UX4: Sandbox Visual Language Foundation

Starting state:

- Current commit before work: `f1c2a5a`.
- Starting worktree was clean.
- Prompt UX3 was committed.

Implementation:

- Added `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION.md` with the required 30-section UX4 implementation record.
- Retuned shared sandbox/workbench visual tokens in `src/app/globals.css`.
- Softened panel, chip, route, World surface, Workshop bench, Lab scaffold, Atlas scaffold, status/caveat, and capability-guidance presentation without changing route behavior.
- Added rendered visual-contract checks in `tests/ui/research-world-shell.spec.ts` for UX4 semantic tokens, softened status/panel treatment, World model-surface framing, Workshop bench styling, and Lab/Atlas non-color grouping cues.
- Updated roadmap/context docs and durable AGENTS guardrails so UX4 is complete, GW9 remains paused, and UX4B is next.

Boundary result:

- UX4 changes visual language only.
- UX4 adds no persistence, preferences, onboarding, progression, Guided Builder, beginner/advanced modes, route aliases, Lab records, Atlas discoveries, saved maps, saved probe plans, sampled results, run queues, sweeps, regime detection, runtime behavior, template behavior, Builder execution, schema execution, graph execution, dependencies, assets, fonts, or icon libraries.
- Actual browser zoom at 125%, 150%, and 200% was not verified.

Rendered evidence:

- Sandboxed local-server checks hit the known local-server restriction: `Process from config.webServer exited early`.
- Escalated focused `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests, after correcting inherited uppercase status-pill styling.
- In the continuation verification pass, sandboxed `npx playwright test tests/ui/research-world-shell.spec.ts` again hit `Process from config.webServer exited early`; manual `npm run dev -- --hostname 127.0.0.1 --port 3000` showed `listen EPERM`, classifying this as a sandbox local-server permission issue.
- Continuation escalated `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests.
- Sandboxed `npm run test:ui` also hit `Process from config.webServer exited early`.
- Continuation escalated `npm run test:ui`: passed, 45 tests.
- Actual browser zoom at 125%, 150%, and 200% was not verified.

Verification:

- `npm run typecheck`: passed after rerunning alone. An earlier concurrent run raced with `next build` while `.next/types` were being regenerated and was not a source defect.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 81.55 ticks/sec, Flocking 500 agents at 10.75 ticks/sec, Forest Fire medium grid at 18.92 ticks/sec, and Predator-Prey default at 53.82 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.
- UX4 is commit-ready after the rendered continuation gate.

Roadmap result:

- UX4 complete.
- GW9 remains paused.

- Next recommended prompt: UX4B.

### Prompt UX4B: Sandbox Visual Language Audit and Hardening

Starting state:

- Starting commit: `9e7aaef feat: add sandbox visual language foundation`.
- Starting worktree was clean.
- Prompt UX4 was committed.

Audit result:

- Added `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION_AUDIT.md`.
- Audited the UX4 `src/app/globals.css` token/style diff and confirmed it is visual-only production work.
- Performed rendered screenshot inspection for `/`, `/builder`, `/lab`, and `/atlas` at `1280x720`.
- Classified World as strong sandbox/workbench fit.
- Classified Workshop, Lab, and Atlas as partial sandbox/workbench fit.
- Found command-console feel improved but not fully resolved in dense advanced Builder contexts.
- Found status/caveat treatment quieter while preserving visible text and status attributes.
- Found no bounded production CSS/component defect requiring hardening.

Boundary result:

- UX4B adds documentation/audit state and roadmap-test contract updates only.
- UX4B adds no runtime behavior, template behavior, Builder execution, persistence, progression, onboarding, Lab records, Atlas discoveries, samples, run queues, sweeps, route aliases, dependencies, assets, fonts, icon libraries, UX5, UX6, or GW9 implementation.
- Actual browser zoom at 125%, 150%, and 200% was not verified.
- Screen-reader behavior, assistive-technology behavior, forced-colors behavior, full WCAG conformance, and user-comprehension evidence remain unverified.

Baseline and verification:

- Sandboxed `npm run test:ui` hit the known local-server restriction: `Process from config.webServer exited early`.
- Manual sandboxed `npm run dev -- --hostname 127.0.0.1 --port 3000` showed `listen EPERM`, classifying the UI blocker as sandbox local-socket permission rather than app failure.
- Escalated `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 117.32 ticks/sec, Flocking 500 agents at 16.74 ticks/sec, Forest Fire medium grid at 26.12 ticks/sec, and Predator-Prey default at 78.95 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Roadmap result:

- UX4B complete.
- Ready for UX5.
- GW9 remains paused.
- Next recommended prompt: UX5.

### Prompt RH1: Remote State and Mission-Alignment Hygiene Check

Starting state:

- Starting commit: `5713b79 test: audit sandbox visual language foundation`.
- Starting worktree was clean.
- Local branch: `main`.

Remote-state result:

- `git fetch origin` succeeded.
- `origin/main` was `9e7aaef feat: add sandbox visual language foundation`.
- Local `main` was ahead of `origin/main` by one commit at RH1 start.
- `f1c2a5a` and `9e7aaef` were visible locally and remotely.
- `5713b79` was visible locally only.
- Remote is stale relative to local UX4B.
- No push was performed; RH1 did not explicitly authorize pushing.
- Required command after RH1 is committed: `git push origin main`.

Baseline:

- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests, through the local-server permission path.
- `npm run test:ui`: passed, 45 tests, through the local-server permission path.
- `npm run lint`: unavailable, package.json has no lint script.

Hygiene result:

- Added `docs/RH1_REMOTE_STATE_AND_MISSION_ALIGNMENT_HYGIENE.md`.
- Added public README "What exists now" and "What is future / not implemented yet" sections.
- Clarified that existing local World run-comparison storage is not persistent Lab evidence, Atlas discovery storage, saved behavioral landscapes, saved probe plans, or real-world validation.
- Clarified that existing local Experiment Runner sweeps are not Atlas landscape sampling, landscape probe execution, saved sampled regions, run queues, or regime detection.
- Chose documentation-only for package-name drift: `package.json` remains `abm-simulation-engine`.
- Chose not to add lint tooling; missing lint remains an explicitly reported unavailable gate until a dedicated tooling prompt.
- Added durable AGENTS guardrails for the persistence/sweep/lint distinctions.

Boundary result:

- RH1 adds no production behavior, runtime behavior, template behavior, Builder execution, persistence features, progression, onboarding, Lab records, Atlas discoveries, samples, route aliases, dependencies, assets, fonts, icon libraries, UX5, UX6, or GW9 implementation.
- RH1 complete locally, but GitHub remote remains stale until pushed.
- UX5 remains next.
- GW9 remains paused.

### Prompt RH1 Continuation: Rendered Verification And Remote Alignment

Continuation starting state:

- Local branch: `main` at `5713b79 test: audit sandbox visual language foundation`.
- Worktree contained only the expected uncommitted RH1 documentation and roadmap-contract changes.
- `origin/main` remained `9e7aaef`, was an ancestor of local `main`, and did not yet contain UX4B.

Rendered verification:

- The sandboxed focused Playwright run exited before tests because the configured Next.js server reported `listen EPERM` on `127.0.0.1:3000`.
- Classification: sandbox local-server permission issue, not an application crash.
- Escalated `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests, 0 failed, 0 skipped.
- Escalated `npm run test:ui`: passed, 45 tests, 0 failed, 0 skipped.
- This is rendered Playwright/Axe smoke evidence, not screen-reader, assistive-technology, forced-colors, actual browser-zoom, full WCAG, or user-comprehension validation.

Final local gates before commit:

- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Continuation boundary:

- RH1 remains documentation, durable guardrails, and one roadmap documentation-contract test only.
- No product behavior, runtime/template behavior, Builder execution, persistence feature, progression, onboarding, dependency, asset, font, icon, route, UX5, UX6, or GW9 implementation was added.
- The continuation explicitly authorizes a normal fast-forward push of UX4B and RH1 after commit; force-push remains prohibited.
- UX5 remains next after remote alignment is confirmed.
- GW9 remains paused.

### Prompt UX5: Progressive Disclosure and Beginner/Advanced Information Architecture

Starting state:

- Starting commit: `be3e05f docs: align remote state and product mission hygiene`.
- Local branch: `main`.
- Starting worktree was clean and `HEAD` matched `origin/main`.
- UX5B, UX6, and GW9 had not started.

Implementation:

- Added `src/components/ui/Disclosure.tsx` with component-local `useState(false)`, native button semantics, `aria-expanded`, `aria-controls`, and hidden collapsed content.
- Added source-backed route orientation for World, Workshop, Lab, and Atlas through `src/lib/routeOrientation.ts` and `RouteOrientationPanel`.
- Layered capability guidance so concise available/current-boundary content remains visible and the complete source-backed inventory remains one disclosure away.
- Kept World controls before capability detail and kept the World Stage and run dock dominant.
- Kept Workshop as the Advanced Builder. The final rendered correction places the active expert workspace before capability guidance.
- Added concise non-persistent Lab and Atlas defaults while keeping their complete existing vocabularies behind explicit technical-detail disclosures.
- Added focused source contracts and expanded the rendered shell suite from 30 to 34 tests with one reload/non-persistence case per route.

Rendered blocker and defect classification:

- The initial post-change rendered gate was blocked by exhausted automatic local-server escalation quota. The UX5 continuation explicitly authorized focused/full Playwright outside the sandbox.
- The first focused failure counted the Next.js development-toolbar button as a Lab action. Classification: UX5 test-locator brittleness. The assertion was scoped to application `main` without weakening the no-fake-action count.
- The next focused failure matched Atlas sampled-state copy in both the concise preview and expanded technical legend. Classification: UX5 test-locator brittleness. The assertion was scoped to the expanded technical region.
- Workshop at `1280x720` left the import editor focus target below the viewport because explanatory rows preceded the active expert workspace. Classification: genuine UX5 responsive/focus defect. Workshop now orders orientation, current actions, active expert workspace, then capability caveats; short-height shells provide a bounded workspace row and vertical scroll path. The import editor passes full focus-visibility checks at the tested sizes.
- Axe found duplicate named `Lab` and `Atlas` landmarks because outer page wrappers repeated the route-orientation names. Classification: genuine UX5 accessibility defect. Removing the redundant outer accessible names preserved one H1 and one named orientation landmark per route.
- No test was skipped, quarantined, weakened, or broadly suppressed.

Rendered evidence:

- Escalated focused `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 34 tests.
- Escalated full `npm run test:ui`: passed, 49 tests.
- All four routes passed at `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`.
- Disclosure keyboard semantics, visible focus, expanded-content reachability, no horizontal overflow, reload-reset defaults, storage-key stability, reduced motion, Axe, and console/page/request/hydration diagnostics passed.
- Direct Chromium screenshot inspection covered all four routes at `1280x720` and `1280x600`.
- Headless Chromium keyboard zoom attempts at 125%, 150%, and 200% did not change browser metrics on any route. Actual browser zoom at 125%, 150%, and 200% was not verified.

Boundary result:

- UX5 adds no new persistence. Existing bounded World comparison and UI storage remain unchanged. Lab and Atlas research persistence remain unimplemented.
- Existing local experiment sweeps remain implemented. Atlas landscape sampling and landscape probe execution remain unimplemented.
- UX5 adds no Guided Builder, saved beginner/advanced mode, preference, personalization, recommendation, onboarding state, progression, runtime behavior, template behavior, Builder/schema/graph execution, Lab record, Atlas discovery, saved map, sample, probe execution, regime detection, run queue, dependency, asset, font, icon library, route, or alias.
- Model output remains model output, not empirical truth.

Final verification:

- `npm run typecheck`: passed.
- `npm test`: passed, 68 files and 548 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Roadmap result:

- UX5 complete.
- UX5B required next.
- GW9 remains paused.

### Prompt UX5B: Progressive Disclosure and Beginner/Advanced Information Architecture Audit and Hardening

Starting state:

- Starting commit: `7938e67 feat: add progressive disclosure information architecture`.
- Local branch: `main`.
- `HEAD` matched `origin/main`.
- Starting worktree was clean.
- UX6 and GW9 had not started.

Baseline:

- Sandboxed focused Playwright exited before tests because the configured server could not bind.
- A direct sandboxed dev-server attempt confirmed `listen EPERM` on `127.0.0.1:3000`; classification: sandbox local-socket restriction, not an application failure.
- Escalated focused Playwright: passed, 34 tests.
- Escalated full UI Playwright: passed, 49 tests.
- Typecheck: passed.
- Unit tests: passed, 68 files and 548 tests.
- Production build: passed.
- Simulation performance smoke: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Audit result:

- Added `docs/ui/PROGRESSIVE_DISCLOSURE_AND_BEGINNER_ADVANCED_INFORMATION_ARCHITECTURE_AUDIT.md` with the required 40-section audit record.
- Audited the UX5 commit and confirmed its production changes are limited to route UI, shared disclosure/orientation/capability components, route-orientation data, and CSS.
- Classified the shared hierarchy as clear in the covered routes: orientation, current work, visible caveat, then explicit technical disclosure.
- Found strong first-read orientation on World and adequate first-read orientation on Workshop, Lab, and Atlas. This is expert review, not a user study.
- Confirmed exact plain/technical term pairing, direct expert access, visible valid-vs-runnable and model-vs-world boundaries, and complete source-backed capability detail.
- Confirmed component-local disclosure state, reload-reset defaults, no new storage key, and no Lab/Atlas persistence.
- Confirmed existing bounded World comparison storage and existing Experiment Runner sweeps remain unchanged and are not relabeled as Lab/Atlas capability.
- Found no UX5 production defect in the audited paths. No production or UI-test file changed.

Rendered evidence:

- All four routes were audited at `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`.
- Direct expanded-state Axe scans passed with zero violations for all 20 route/viewport combinations.
- Every combination had one `main`, one H1, no document horizontal overflow, keyboard-focusable disclosure controls, active reduced-motion semantics, and no console/page/request/critical-response/hydration diagnostic.
- Default and expanded screenshots were inspected directly, including Workshop at `1280x720` and `1280x600`.
- The first direct Axe script used an incompatible browser-page convenience API. It was corrected to explicit browser contexts before evidence was recorded; this was an audit-harness error, not an ORTUS defect.
- Headless `Ctrl++` attempts for 125%, 150%, and 200% left browser metrics unchanged. Actual browser zoom at 125%, 150%, and 200% was not verified.

Boundary result:

- UX5 adds no new persistence. Existing bounded World comparison and UI storage remain unchanged. Lab and Atlas research persistence remain unimplemented.
- UX5B adds documentation, durable guardrails, and roadmap contract assertions only.
- UX5B adds no Guided Builder, saved disclosure state, preferences, onboarding, personalization, recommendation, progression, runtime behavior, template behavior, Builder/schema/graph execution, Lab records, Atlas discoveries, saved maps, sampling, probe execution, queues, regimes, dependencies, assets, fonts, icons, routes, aliases, UX6 implementation, or GW9 implementation.
- User-comprehension, screen-reader, assistive-technology, forced-colors, actual browser-zoom, mobile-workflow, and full WCAG claims remain unverified.

Roadmap result:

- UX5B complete.
- UX6 is next.
- GW9 remains paused.

### Prompt UX6: Guided Builder and Step-by-Step Configuration Flow Foundation

Date: 2026-07-13

Goal: add a beginner-accessible but capability-honest Guided Builder to Workshop, preserve the complete Advanced Builder, and stop before schema execution, runtime generation, World mutation, persistence, personalization, progression, Lab/Atlas behavior, or GW9.

Starting state:

- Branch `main` at clean, aligned `c6233ec test: audit progressive disclosure information architecture`.
- Baseline focused Playwright `34 passed`; full UI `49 passed`; typecheck passed; unit tests `68 files / 548 tests`; build passed; performance smoke passed; `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Implementation:

- Added a real Guided/Advanced outer tablist to `/builder`; Guided is the non-persistent reload default and Advanced remains one action away.
- Added a typed, bounded six-step draft for identity, entities/scalar state, zero-or-one space, descriptive rules/entity references, parameters/assumption, and exact review.
- Added deterministic normalized ids with stable collision suffixes and static non-executable schema defaults. No timestamps, random ids, AI, inference, formulas, or executable expressions participate.
- Reused the existing model-schema draft view and validator as final authority. The review says structural validity is neither runnability nor real-world validity.
- Added immediate/step/final error handling, warnings, field focus, Back retention, direct review, accessible confirmations for Start over/removals, and exact JSON preview.
- Added explicit handoff to Advanced Author Schema. Existing Advanced work triggers a named overwrite confirmation; Cancel preserves both drafts and returns focus; confirm replaces only the Advanced schema draft.
- Added data-loss decisions for destination links, reload/close, and client-side browser Back while meaningful Guided data exists.
- Preserved Workspace Inspector, Author Schema, Graph View, import/export, validation assistance, repair suggestions, fit reports, scenario planning, exact metadata, and accessible graph outline.
- Updated Workshop capability/orientation copy and responsive styling. The rendered gate found and fixed an existing short-height Advanced import-textarea focus/clipping defect at `1280x600`.

Evidence and boundaries:

- Guided assembly and explicit handoff leave active World context and all existing storage entries unchanged.
- Reload resets Guided draft, current step, and selected outer mode without adding a storage key.
- Source searches found no Guided execution, runtime generation, nondeterministic identity, persistence, personalization, progression, Lab/Atlas, sampling, or probe path.
- Headless Chromium received keyboard zoom commands targeting 125%, 150%, and 200%, but all browser metrics remained unchanged. Actual browser zoom at 125%, 150%, and 200% was not verified.
- Focused Playwright passed `41` tests and full UI Playwright passed `56` tests after correcting one stale Advanced-only semantic assertion to enter Advanced explicitly.
- Typecheck passed; full unit tests passed `69 files / 564 tests`; production build passed; simulation performance smoke passed; and `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Roadmap result:

- UX6 complete.
- UX6B required next.
- GW9 remains paused.

### Prompt UX6B: Guided Builder and Step-by-Step Configuration Flow Audit and Hardening

Date: 2026-07-15

Goal: independently audit and harden the UX6 Guided Builder foundation, preserve Advanced Builder and World, reject execution/persistence/personalization/GW9 creep, and issue a GW9 readiness decision.

Starting state:

- Branch `main` at clean, aligned `bf80137 feat: add guided builder configuration flow foundation`.
- Baseline focused Playwright `41 passed`; full UI `56 passed`; typecheck passed; unit tests `69 files / 564 tests`; build passed; performance smoke passed; `git diff --check` passed.
- The UX6 commit changed only Workshop Guided/Advanced authoring, validation, handoff, CSS, tests, and documentation. It added no dependency, route, engine runtime, template runtime, storage, Lab/Atlas behavior, or GW9 behavior.
- `npm run lint: unavailable, package.json has no lint script.`

Findings and hardening:

- Fixed generated assumption/limitation ids that could exceed the authoritative 80-character note-id bound when the valid model name approached 180 characters. Note ids now use fixed deterministic semantic bases.
- Fixed the Guided header's direct Advanced action losing focus to `BODY`; focus now lands on the visible selected Advanced tab, and the mounted Guided draft remains intact.
- Fixed canceled Advanced overwrite leaving stale `Guided handoff staged` status; the status now truthfully reports cancellation and preservation.
- Found rendered responsive guidance overlay/interception at `1024x768`; responsive Workshop grid rows now size to content so guidance follows authoring in the shell scroll flow.
- The final focused gate then exposed a partially clipped Workspace Inspector import textarea at `1024x768`; the existing bounded short-height textarea sizing now applies across the responsive Workshop breakpoint.
- Fixed duplicate Advanced fit-report landmark names, removed nested scenario-plan scroll regions in favor of the intentional parent scroll, and made the Graph controls/outline scroll region keyboard-focusable.
- Added a maximum-name deterministic model regression and expanded rendered coverage to every Guided step, validation, destructive dialogs, handoff/overwrite states, all Advanced modes, all five required viewports, Axe, and diagnostics.

Evidence and boundaries:

- Storage, nondeterminism, execution, and broad scope-creep searches found no unexpected Guided path. Existing World/UI storage, runtime execution, timing/UI event ids, future guardrails, and negative tests were classified separately.
- Guided Builder and Advanced handoff do not mutate World. Reload resets Guided draft, step, and mode and adds no storage key.
- The five-viewport matrix passes with no document horizontal overflow or clipped/unreachable audited controls. Representative-state Axe scans report zero unexpected violations after hardening.
- Headless Chromium keyboard commands aimed at 125%, 150%, and 200% left all measured zoom signals unchanged. Actual browser zoom at 125%, 150%, and 200% was not verified.
- No schema/rule/graph execution, template/scenario/RunConfig generation, persistence, personalization, progression, Lab/Atlas behavior, landscape sampling, probe execution, dependency, asset, font, icon, route, or GW9 implementation was added.

Final verification:

- Focused Playwright `43 passed`; full UI Playwright `58 passed`.
- Typecheck passed; full unit tests passed `69 files / 565 tests`; production build passed; simulation performance smoke passed; and `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Roadmap result:

- Decision: Ready to resume GW9 after commit and remote alignment.
- UX6B complete.
- GW9 is next.
- GW9 remains paused until UX6B is committed and remotely aligned.

### Prompt R1: Start Hub and World-First Product Reset

Date: 2026-07-17

Goal: replace the equal-destination research-console entry with a task-centered Start Hub, move the existing workbench to `/world`, reclaim World for the live system, demote broad capability walls, and preserve every established runtime, Builder, Atlas, Experiment, comparison, and persistence boundary.

Starting state:

- Branch `main` at clean, aligned `98e6bb4 test: audit ephemeral landscape sampling preview`; `HEAD` matched `origin/main`.
- Baseline focused Playwright passed `53` tests; full UI passed `68`; typecheck passed; unit tests passed `70 files / 590 tests`; build, performance smoke, and `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Implementation:

- Made `/` a real Start Hub and moved the unchanged live workbench to `/world`. Added Start, World, Workshop, and a keyboard-operated Research tools menu for Atlas, Lab, Experiments, and Compare runs.
- Featured the implemented Flocking runtime with an actual ORTUS runtime capture, explicit question/mechanism/change/scope copy, four plain-language pathways, and a dismissible page-session-only action nudge.
- Derived the seven-system Start catalog from authoritative production template descriptors. Added presentation-only question, change, output, watch, and compact-control metadata without registering or inferring runtime support.
- Made World model-first with the canvas and persistent controls before one compact task rail. Setup, Observe, Change, and Compare are direct; Understand model, Experiments, and Diagnostics are under More.
- Reduced Setup to the selected template, starting recipe, seed, intervention count, and four source-backed controls while retaining all exact parameters and Scenario Builder behind disclosures.
- Replaced the default Understand dump with six model-specific sections and expandable full notes. Normalized rendered de-duplication removes punctuation-only repeats; unrelated global Builder, schema, LLM, and cross-template boundaries stay out.
- Put the real Atlas sampler first, made Lab concise and action-oriented, and kept Workshop Guided/Advanced access direct while disclosing capability matrices and technical foundations.
- Added the active R/RB, C/CB, S/SB, and E/EB product-reset roadmap. R1B is next; F1 remains documented but is paused under E3 Analytical Lenses.

Rendered findings and hardening:

- Fixed a genuine 900-pixel World stacking overlap and two genuine 1280x600 Workshop focus-visibility defects in the Workspace Inspector and Author Schema import textareas.
- Final screenshot review found a broad `.guided-builder__steps button` selector styling the panel title button as a numbered step, visibly colliding `Step 1 of 6` with `Draft Steps`. Rules are now scoped to `nav button`, and a rendered bounding-box assertion rejects recurrence.
- The first production build compiled but every static route failed page generation. The new shared navigation's `useSearchParams` lacked a Suspense boundary. `ResearchWorldShell` now owns the boundary; a normal build prerenders Start, Atlas, Lab, and Workshop and keeps query-driven World dynamic.
- Direct screenshot inspection covered Start and World at the required viewport matrix, Start at `390x844`, and Atlas, Lab, and Workshop first viewports. No incoherent overlap or document horizontal overflow remains in the covered states.
- Axe, reduced motion, menu keyboard behavior, Escape focus return, current location, reload-reset disclosure state, focus visibility, short-height reachability, console/page/request/asset/hydration diagnostics, and one-main/one-H1 contracts pass in covered states.

Integrity result:

- Simulation scheduling, engine semantics, template behavior, scenario behavior, metrics, interventions, Experiment Runner, comparisons, Atlas execution, Builder structural behavior, and persistence are unchanged.
- No new template, primitive, backend, account, analytics, remote asset, AI guidance, personalization, saved tutorial, Lab record, Atlas record, generic sampler, schema execution, arbitrary code/formula execution, or generated RunConfig was added.
- The starter nudge and disclosures are component-local. Reload resets them and no storage key is added.
- Runtime support remains derived from existing production templates. Structural validity, runnability, scientific validation, and empirical truth remain separate claims.

Final verification:

- Focused Playwright: `53 passed`.
- Full UI Playwright: `80 passed`.
- Typecheck: passed.
- Unit tests: `72 files / 599 tests` passed.
- Production build: passed after the shared-navigation Suspense fix.
- Simulation performance smoke: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Roadmap result:

- R1 complete.
- R1B First-Run and Shell Audit is next.
- F1 remains paused under E3 Analytical Lenses.

### Prompt R1B: First-Run and World-First Shell Audit + Hardening

Date: 2026-07-19

Goal: audit the R1 reset as a rendered first-time product flow, fix every evidenced R1-attributable P0/P1 and bounded P2 defect, preserve runtime and persistence semantics, and issue an R2 readiness decision.

Starting state:

- Branch `main` at clean, aligned `d2af908 feat: reset ORTUS start and world-first experience`; `HEAD` matched `origin/main` after fetch.
- Untouched focused Playwright failed once after `43` passes in the rapid Research tools Arrow Down flow; `9` tests did not run. Three isolated repetitions yielded two passes and one failure, confirming a timing-sensitive focus defect.
- Untouched full UI Playwright passed `80` tests. Typecheck passed; unit tests passed `72 files / 599 tests`; build, performance smoke, and `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Rendered audit:

- Task A passed: one decision and two activations reach a running featured Flocking world without scrolling or route-taxonomy knowledge.
- Task B initially had serious friction because parameter changes silently rebuilt a paused tick-0 run. The final Setup explains that behavior beside four source-backed key controls.
- Task C remains minor friction because the six-section default Understand summary needs modest panel scrolling; every production template is model-specific and full notes remain disclosed.
- Task D passed: Workshop, Atlas, Lab, Experiments, comparisons, and Diagnostics remain directly reachable.
- Task E passed after hardening focus return, More-to-panel focus, panel scroll reset, Back/current-state coherence, and wrong-path recovery.
- Before/after screenshots covered Start, World Setup, World Understand, World running, Workshop, Atlas, Lab, and mobile Start/World. Screenshots remain uncommitted in `/tmp`.

Defects and hardening:

- No P0 defect was found.
- Fixed four P1 defects: repeated featured launch resumed a modified running trajectory; key controls omitted rebuild semantics; World task UI diverged from query/current-navigation state; rapid keyboard menu input had a reproduced focus race.
- Fixed five P2 defects: More selection focused `BODY`; task scroll offset leaked between modes; Neural default Understand duplicated a boundary and promoted a Builder limitation; Atlas Run was below the initial short viewport; mobile primary branding hid the ORTUS wordmark.
- Fixed one bounded P3 Start copy defect by replacing implementation-status language with user intent.
- Featured starter launch now invokes the existing template-selection rebuild once per starter page mount. Parameter, tick, and paused state reset; no template, seed algorithm, scenario, or persistence contract changes.
- Task selection synchronizes the `task` query and current-navigation semantics while preserving engine tick/parameters. More selection focuses the panel heading and each task starts at scroll origin.
- Research tools and More use render-coupled focus requests. The stress regression passes five repeated browser runs after waiting for hydration.
- Atlas exposes the existing form-owned submit action in Execution Status. Existing validation, execution, cancellation, replacement, result, storage-isolation, and unmount contracts remain unchanged.

Measured evidence:

- At `1440x900`, World workspace is `1040x780`, stage is `1040x718`, and task rail is `370x780`; stage area is about `2.59x` rail area.
- At `1280x720`, World workspace is `880x600`, stage is `880x538`, and rail is `370x600`; stage area is about `2.13x` rail area.
- At `1280x600`, stage remains `880x434` and run controls remain fully visible.
- Atlas Run is visible at `x=884-1050`, `y=447-483` in `1280x720` and remains visible at `1280x600`.
- Desktop World has one task-panel scroll; responsive World has one main scroll. Start, Workshop, and Atlas each have one intentional primary scroll in covered defaults; Lab needs none at `1280x720`.
- Post-change captures produced no console/page diagnostics or horizontal overflow.

Integrity and limits:

- No production simulation implementation file changed; the only `src/simulation` change is a roadmap-status test. Simulation scheduling, template/scenario behavior, seeds, metrics, interventions, snapshots, experiments, comparisons, Atlas execution, and Builder structural semantics remain unchanged.
- R1/R1B add no new persistence. Existing bounded World comparison and UI storage remain unchanged.
- Actual browser zoom at 125%, 150%, and 200% was not verified.
- Screen-reader use, assistive-technology use, forced colors, complete mobile workflow, participant comprehension, and WCAG conformance remain unverified.

Final verification:

- Focused destination-shell Playwright: `53 passed`.
- First-run/reset Playwright: `18 passed`.
- Full UI Playwright: `86 passed`.
- Typecheck: passed.
- Unit tests: `72 files / 599 tests` passed.
- Production build: passed.
- Simulation performance smoke: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

Roadmap result:

- R1 complete.
- R1B complete.
- Decision: conditionally ready for R2.
- R2 World Layout and Interaction Reclaim is next.
- F1 remains paused under E3 Analytical Lenses.

### Prompt R2: World Layout and Interaction Reclaim

Date: 2026-07-24

Goal: rebuild `/world` around a stable, dominant live stage; give each common task one predictable owner; keep playback and runtime state stable; preserve complete expert access; and change no simulation or persistence semantics.

Starting state:

- Branch `main` at aligned base `a7f9c29`; `HEAD` matched `origin/main`.
- The continuation inherited an intentionally uncommitted R2 implementation. It was preserved and audited in place; no reset, restore, stash, or recreation was used.
- Baseline evidence from R1B was `53` focused destination-shell tests, `86` full UI tests, `72 files / 599 tests`, typecheck, build, performance smoke, and `git diff --check`.
- The user explicitly authorized Playwright outside the sandbox.

Implemented World frame:

- `WorldStage` and `TimelineControlStrip` stay mounted outside task rendering.
- Desktop uses a `64px` or `56px` task rail, the flexible stage/playback region, and one `290-350px` active tool.
- Direct tasks are Setup, Observe, Change, Compare, and Explain; More groups Experiment Runner under Investigate and Diagnostics under Inspect.
- The compact context bar exposes world, recipe/context, run status, tick, seed, and one focus-managed Run-details action.
- The active tool owns one bounded scroll, resets scroll on task changes, and supports local collapse/restore without storage or state loss.
- Setup exposes four authoritative quick parameters plus deeper All parameters, recipes/model variants, and Neural Runtime Lab views.
- Observe prioritizes two to four existing model-output metrics, a bounded trace, and selected-model guidance.
- Change distinguishes current-run engine-checked commands from fresh paused tick-0 Setup rebuilds.
- Compare preserves existing bounded summary storage and keeps scenario/snapshot exchange subordinate.
- Explain uses six concise model-specific sections and a focus-managed full-reference dialog.

Measured rendered evidence:

- `1440x900`: stage `994x730`, playback `994x50`, tasks `64x786`, tools `350x786`.
- `1280x720`: stage `834x550`, playback `834x50`, tasks `64x606`, tools `350x606`.
- `1024x768`: stage `624x598`, playback `624x50`, tasks `56x654`, tools `312x654`.
- `900x700`: stage `500x530`, playback `500x50`, tasks `56x586`, tools `312x586`.
- `1280x600`: stage `834x444`, playback `834x46`, tasks `64x496`, tools `350x496`.
- `390x844`: stage `374x335`, playback `374x89`, horizontal tasks `374x50`, tools `374x211`; the document fits the viewport and the tool scroll reaches All parameters.
- Collapse at `1280x720` expands stage width from `834px` to `1192px`; restore returns to `834px` and preserves the edited `0.75` parameter value.
- All seven production-template stages rendered nonblank and legible in the audited Chromium session.

Defects found and fixed:

- Seed-action accessible names omitted their visible labels.
- Neural concise explanation leaked an unrelated Builder boundary.
- Modal scroll content was not keyboard-focusable for Axe.
- framework route replacement could transiently remove the document title under load.
- Mobile active-tool height clipped deeper Setup content.
- `Setup change` label and copy collapsed into one inline run.
- Collapsed-tool restore sat where the development overlay could obstruct it.
- The compact Change rewrite dropped the prior `engine-checked commands` software-path wording.
- Several old/new tests used hidden-modal global counts, a removed World `CornerFramePanel`, obsolete explanation labels/APIs, noncanonical template/action assumptions, implicit reduced-motion state, and stale comparison-storage expectations.
- Production fixes added label-in-name semantics, bounded explanation filtering, focusable/labeled modal content, same-document history synchronization, mobile tool containment, deliberate Setup-change geometry, reachable restore placement, and restored engine-checked Change copy.
- Tests now assert visible behavioral surfaces, scope hidden modal content correctly, and preserve the stronger runtime/persistence contracts.

Integrity:

- No simulation implementation changed. The `src/simulation` changes are source/roadmap contract tests only.
- Simulation scheduling, deterministic RNG, tick semantics, template/scenario behavior, metrics, interventions, snapshots, Experiment Runner, comparisons, Atlas execution, Builder behavior, and registries are unchanged.
- No dependency, route, template, scenario, metric, intervention, primitive, storage key, persistence system, analytics, personalization, AI guidance, starter content, C1 work, or R2B implementation was added.
- Existing bounded World comparison storage is unchanged and remains neither Lab evidence nor Atlas discovery storage.

Final verification:

- Dedicated R2 rendered suite: `24 passed`.
- Focused destination-shell Playwright: `53 passed` in `4.4m`.
- Complete Playwright/Axe suite: `110 passed` in `7.6m`, with no retry or skipped test in the final invocation.
- Manual six-viewport/seven-template rendered audit: `4` temporary harness cases passed; screenshots remained in `/tmp` and the temporary test was removed.
- Browser diagnostics: no unexpected console error, page error, hydration failure, or failed critical request.
- Typecheck: passed.
- Unit tests: `75 files / 610 tests` passed.
- Production build: passed.
- Simulation performance smoke: Flocking-100 `226.53` tps, Flocking-500 `31.45` tps, Forest Fire `49.12` tps, Predator-Prey `149.49` tps; bounded Atlas smoke completed `2` runs / `10` work units in `26.23ms`. These are local smoke results, not scale certification.
- `git diff --check`: passed before commit.
- `npm run lint: unavailable, package.json has no lint script.`

Roadmap result:

- R1 complete.
- R1B complete.
- R2 complete.
- R2B: World Layout and Interaction Audit is next and has not started.
- C1 and F1 remain unstarted; F1 remains paused under E3 Analytical Lenses.

### Prompt R2B: World Layout and Interaction Audit + Hardening

Date: 2026-07-27

Goal: independently audit the completed R2 World shell, fix every evidenced P0/P1 and bounded P2 defect without broadening runtime or persistence, and decide whether the product shell is stable enough for C1 starter-content architecture.

Starting state:

- Branch `main` was clean and aligned at `7f5c51d feat: reclaim world layout and interaction`; `HEAD` matched `origin/main` after fetch.
- Untouched focused destination-shell Playwright passed `53` tests in `6.6m`.
- Untouched full UI Playwright passed `110` tests in `11.3m`.
- Untouched unit verification passed `75` files / `610` tests in `87.95s`; typecheck, production build, simulation/Atlas performance smoke, and `git diff --check` passed.
- `npm run lint: unavailable, package.json has no lint script.`

Defects and hardening:

- No P0 or P3 defect was found.
- Three P1 defect families were fixed. Setup's active-versus-draft boundary rebuilt parameter/seed edits before explicit apply and initially omitted exact active values or composable draft preservation; task clicks replaced one history entry so browser Back could leave World; and modal Tab navigation could escape to `body`.
- Five P2 defect families were fixed. Quick controls ignored presentation-metadata order; closed run-details content retained live tick-subscribing children; abandoned experiments lacked irreversible task/collapse/unmount lifecycle cancellation; full model references omitted explicit model-output inventory; and malformed comparison-storage warnings were hidden from Compare.
- Setup parameter and seed inputs are now local drafts. Every parameter row exposes the exact active-run value, parameter drafts survive task/collapse and seed-only rebuilds, blur does not rebuild, and explicit apply/rebuild uses the existing validator and fresh paused tick-0 engine path.
- World task clicks create same-document history entries. Back/Forward restores the task/query without remounting the stage or resetting tick, run status, template, seed, applied parameters, or Setup drafts.
- Modal surfaces explicitly contain forward/reverse Tab, support Escape/focus return, and unmount live children while closed.
- Experiment task exit, collapse, or unmount requests cooperative cancellation, suppresses hidden progress, and permanently marks that invocation abandoned so immediate restore cannot publish it. Cancellation still occurs between bounded synchronous runs.
- Compare exposes corrupt-library recovery without treating invalid records as evidence or changing the existing storage key, schema, cap, or persistence scope.
- Every production template's full reference now lists registered model-output metrics and states that they are not empirical observations, calibrated estimates, or validation evidence.

Rendered evidence:

- Audited `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844`.
- Measured stage sizes were `994x730`, `834x550`, `624x598`, `500x530`, `834x444.453`, and `374x335.453`; the stage remained dominant/stable and playback remained reachable.
- All seven production-template stages rendered nonblank and legible. Task transitions, More, collapse/restore, dialogs, and browser history preserved the mounted stage and active run.
- Automated coverage exercised exact active/draft values, explicit rebuilds, metric/intervention hierarchy, comparison recovery, model reference, modal focus, abandoned sweeps, reduced motion, Axe, diagnostics, storage, and seven-template rendering.
- Actual browser zoom at 125%, 150%, and 200% was not verified.
- Screen-reader use, assistive-technology use, forced colors, complete touch workflow, participant comprehension, and WCAG conformance remain unverified.

Integrity:

- No production simulation implementation file changed. Simulation scheduling, deterministic RNG, engine stepping, template/scenario behavior, metrics, interventions, snapshots, comparison calculations, registry support, Atlas execution, and Builder non-execution boundaries are unchanged.
- No route, dependency, template, scenario, metric, intervention, primitive, storage key, persistence destination, backend, analytics, personalization, or C1 content was added.
- Existing World comparisons remain bounded local summaries, not Lab evidence or Atlas discoveries. Setup drafts and warning state remain in memory only.
- Simulation output remains model output, not empirical truth.

Final verification:

- Dedicated R2/R2B Playwright: `29 passed (2.8m)`.
- Focused destination-shell Playwright: `53 passed (6.3m)`, `376.10s` wall-clock.
- Complete Playwright/Axe suite: `115 passed (12.1m)`, with no retries or skips.
- Typecheck: passed in `2.12s`.
- Unit tests: `75 files / 610 tests` passed in `75.46s` (`76.01s` wall-clock).
- Production build: passed in `30.59s`; Next compiled in `7.4s`, and `/world` remains dynamic.
- Simulation performance smoke: Flocking-100 `161.10` ticks/sec, Flocking-500 `19.22`, Forest Fire `28.81`, and Predator-Prey `89.63`.
- Bounded Atlas smoke: `2` runs / `10` work units in `42.47ms`.
- Performance command elapsed: `12.86s`.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`
- Long browser commands were rerun in a persistent process host after the ordinary command wrapper sent SIGTERM to otherwise passing partial runs. Only terminally completed invocations are reported above.
- One stale source-format unit assertion was strengthened to check authoritative definitions, filtering, exact active values, and draft status; the final complete unit invocation passed.

Roadmap result:

- R1 complete.
- R1B complete.
- R2 complete.
- R2B complete.
- Decision: conditionally ready for C1 because only external zoom/accessibility/comprehension verification remains.
- C1: Starter World Content Framework is next and has not started.
- F1 remains paused under E3 Analytical Lenses.
