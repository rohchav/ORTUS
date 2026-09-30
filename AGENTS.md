# ORTUS Agent Instructions

Canonical instructions for every coding agent (Codex, Claude Code, and others). This file holds standing invariants only. Milestone status and dependency order live in `docs/ROADMAP.md`. The retired 742-rule log is preserved as history, not guidance, at `docs/history/AGENTS_RULE_LOG_THROUGH_I1.md`.

Unit tests under `src/simulation/__tests__/` and `src/components/branding/` read this file and assert some sentences verbatim. Edit those sentences only together with their assertions.

## 1. Authority and scope

- Authority order: code and tests first, then `docs/CAPABILITIES.md` (what exists now), `docs/ARCHITECTURE.md`, `docs/SCIENTIFIC_MODEL.md`, and `docs/ROADMAP.md` (status and dependency order). Audit records, `docs/codex/`, and `docs/history/` are evidence and continuity, never competing authority.
- Work from one dedicated prompt per milestone. Every feature milestone is followed by an independent adversarial audit, and later capability is never inferred from an unaudited milestone. Roadmap items start only when a prompt names them.
- Prefer small audited phases over broad rewrites. Implement the prompt's scope, not neighbouring audit recommendations.
- When architecture changes, update `docs/ARCHITECTURE.md` and `src/simulation/README.md` in the same change.
- Record durable decisions in repository documents: canonical docs, milestone records, and `docs/engineering/HARDENING.md` for hardening passes. Agent-private memory is not a project record.

## 2. Engine boundary and determinism

- `src/simulation` is headless: no React, Zustand, DOM, Canvas, browser-storage, or renderer imports. UI consumes snapshots and projections; simulation rules live only in `src/simulation`.
- All simulation randomness comes from seeded RNG streams owned by the engine, so the same seed and configuration reproduce the same run. Simulation code never calls `Math.random`.
- Validate every boundary with Zod: imports, snapshots, scenarios, parameters, commands, events, spaces, templates, Worker messages, and public query input.
- Keep all behavior in reviewable static source: no `eval`, `new Function`, string timers, runtime dynamic imports, user-authored formulas, expression evaluation, or script and plugin execution.
- Templates are plugins registered through the template API and own their rules, parameters, interventions, and metrics.
- Ship focused tests with every behavior-changing engine update. Neighbor-search changes (`Continuous2DSpace.queryNeighbors`, spatial indexes) need brute-force parity tests for ordering, wrap and boundary cases, radius edges, and full deterministic trajectories before adoption.
- Movement-heavy all-pairs search needs a documented reason plus tests or benchmark evidence. Scalability claims need benchmarks from the current runtime; renderer or camera optimisation is not engine scalability.
- Keep the non-equivalences `ModelDefinition != RuntimePlan` and `SimulationSnapshot != RenderFramePacket != UIProjection != CanonicalObservation`. `SimulationSnapshotView` is a detached read model; only a validated `SnapshotExport` carries RNG and queued-event state for exact continuation, and it is built on demand, never per visual frame.
- The host owns wall-clock cadence; the engine owns step semantics. UI code never gains step, RNG, or mutation authority.

## 3. Runtime authority and bounded state

- Each run has exactly one executing engine authority. UI, canvas, renderers, adapters, Workshop, Lab, Atlas, and research code read projections; they never mutate agents, spaces, components, or engine internals.
- Interventions are template-defined, validated, and applied through the headless intervention executor or the engine command buffer. UI may report a target; selection never moves or mutates an entity.
- `SimulationRuntimePort` is the execution ownership boundary: validated deterministic requests in, identified publications out. `LocalRuntimeDriver` and `WorkerRuntimeDriver` share `RuntimeSession`, the validated RunConfig and template path, the scheduler contract, and projection code, so no second simulation implementation exists.
- Accept publications only for the active generation, run, template, and projection kind with strictly increasing revisions, and drop stale ones deterministically. Bound Worker ingress and reject overflow before a command is accepted.
- Deliver every accepted command, step, intervention, comparison capture, and evidence record exactly once. Only ephemeral frame and UI publications may coalesce to the latest value.
- Worker failure is explicit, fails closed, and is terminal for that driver: no silent restart, Local fallback, or new seed.
- Transferred buffers are one-way ownership. `SharedArrayBuffer`, `OffscreenCanvas`, and shared mutable engine state need a dedicated measured milestone.
- Worker support is declared per registered projection kind and currently covers Flocking only; a generic port or adapter base is not cross-template support. Numeric limits and lifecycle details live in `.claude/rules/runtime-worker.md`.
- Under load, degrade presentation (effects, trails, cadence, DPR) and keep agent count, deterministic steps, rules, RNG, metrics, and scenario fidelity unchanged.
- Keep every history, trail, timeline, queue, and sample set bounded. Draw entities with a batched renderer; React never renders one updating component per entity.
- Experiment, comparison, Atlas preview, and scenario-preview runs create fresh engines through the template registry and validated RunConfig path, store bounded summaries rather than full snapshots, run chunked and cancellable, and never touch the active World run. Leaving an active runner requests cooperative cancellation and publishes no abandoned result.
- Setup edits that rebuild a run stay drafts until an explicit Apply creates a fresh paused tick-0 run; Change actions affect the current run. Keep the two visibly distinct.

## 4. Capability honesty

- Claim only what runs. Check `src/simulation/registry` before claiming primitive or template support. Distinguish global service availability from template runtime support. `runtimeActive` is true only when the template runtime uses the primitive, and `runnableNow` only when capability checks prove it. Update the registry and its audit tests with every real support-status change. Reserved artifact families get no import or export.
- Service-level primitives stay headless and non-executing until a template declares and uses them: networks, resources, stocks and flows, feedback, delays and events, boundaries, spatial fields, observability, causal assumptions, quantities, emergence, robustness, control strategy, multi-scale and scale views, and knowledge or social-learning descriptors. A service-only primitive is never presented as a runtime control.
- Template capability claims follow the runtime:
  - Do not mark templates causal-assumption-capable unless runtime uses `CausalAssumptionModel`.
  - Do not mark templates quantity-semantics-capable unless runtime uses `QuantitySemanticsModel`.
  - Do not mark templates emergence-detection-capable unless runtime uses `EmergencePatternModel`.
  - Do not mark templates robustness/resilience-capable unless runtime uses `RobustnessResilienceModel`.
  - Do not mark templates controlStrategy/interventionStrategy-capable unless runtime uses `ControlStrategyModel`.
  - The same rule covers `BoundaryEnvironmentModel`, `SpatialFieldModel`, `ObservabilityModel`, `ModelSchemaDefinition`, multi-scale, network, resource, and feedback support, and the reserved `socialLearningRuntime` and `visualModelBuilder` primitives.
- Structural artifacts are non-executable today: model schemas, Builder workspaces and graphs, the Visual Systems Workbench, hybrid compositions, compatibility and fit reports, scenario plans, and landscape probe plans. Execution arrives only through a dedicated audited milestone with explicit runtime vocabulary, capability checks, determinism, and no arbitrary code. Until then nothing parses or executes `ruleDescription`, node or edge metadata, or declared rules, and no structural artifact generates templates, scenarios, RunConfigs, snapshots, engines, or agents.
- Valid is not runnable, and runnable is not scientifically validated. Artifact attachment is not runtime activation. A connected graph is not proof that coupled runtime is meaningful. Do not treat HybridModelComposition as a compiler.
- Builder shell boundaries (asserted per document by tests):
  - Safe Builder UI Shell V1 displays structural workspace artifacts; it does not execute workspace nodes or edges.
  - The builder shell is not a compiler, interpreter, visual programming environment, or custom simulation runtime.
  - A structurally valid workspace is still not a runnable model.
  - Importing a workspace artifact does not activate model schemas, compatibility mappings, or social-learning semantics.
- Compatibility boundaries (asserted per document by tests):
  - Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models.
  - A strong template fit does not mean a schema can run.
  - Unsupported and lossy mappings must remain visible; they must not be silently dropped.
  - Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines.
  - Do not treat templateExact fit as runnable. Do not hide unsupported concepts. Do not silently drop lossy mappings. Do not generate scenarios/RunConfigs/snapshots/templates/engines from compatibility reports.
- Workshop may launch only Starter Remix configuration derivatives of existing Starter-backed templates, through the established scenario path. That is not generic model execution.
- Adapter contracts may describe future Mesa, NetLogo, or MASON work. No control, copy, or claim implies that those runtimes or interop exist.

## 5. Scientific and epistemic honesty

- Simulation output is evidence about the model under its configuration, not automatically about the world. Do not treat runtime metrics as empirical observations. Make no claim of prediction accuracy, calibration, validation, causal proof, statistical significance, robustness, policy effectiveness, or real-world applicability for any template or output.
- Probabilities, rates, and labels are model parameters. Do not treat uncertainty ensembles as calibrated probabilities. Per-tick rates are not physical-time rates without an explicit mapping. Do not treat parameter labels/ranges as full unit semantics.
- Do not treat network edges as causal edges. Feedback labels and loop metadata are not causal proof. Do not treat visible patterns as emergence proof. Do not treat quantity consistency as proof of emergence. Do not treat visible persistence, collapse, or recovery as resilience proof. Do not treat template-owned interventions as general strategy/control support. One successful run is not a robust result, and aggregate similarity does not prove mechanism.
- Camera zoom is not model scale. Aggregation loses information and disaggregation creates synthetic detail. Visual resemblance or a power-law fit does not establish fractality; measure multiscale structure before generating synthetic structure.
- Epistemic stance (full text in `docs/PRODUCT_PHILOSOPHY_AND_LEARNING_MISSION.md`): ORTUS is an exploratory complex-systems sandbox, not an oracle. Complexity means interacting rules, constraints, feedback, and history, not rulelessness. Stay tolerant of competing plausible mechanisms and strict about evidence and harm. Do not treat all explanations as equally supported. Do not use complexity to dismiss evidence, responsibility, causality, or intervention. Adaptation and evolution guarantee no progress, optimality, fairness, or stability.
- Keep uncertainty, scale, assumptions, unsupported claims, and validation needs visible near the controls and outputs they affect. Software checks are "engine-checked" or "command-checked", never "validated".
- An imported empirical `sourceType` needs provenance and later calibration work before it is trusted. Synthetic observations and fields are not observed data. Assumption profiles are transparency metadata and never change dynamics.

## 6. Safety and ethics

- Agents carry bounded symbolic or numeric state with explicit validation. LLM-per-agent runtime, per-tick natural-language reasoning, external model calls, unbounded memory, biographies, embeddings, model weights, and arbitrary documents are not agent state.
- Opinion, belief, decision, and neural outputs are stylized model variables. Describe them without anthropomorphism: no cognition, understanding, intention, personality, mind-simulation, biological, clinical, or diagnostic claims.
- Never build or suggest profiling, real-person trait inference, protected-class inference, persuasion or microtargeting optimization, manipulation guidance, or psychological diagnosis, in models, guidance, or product copy. Encoding stereotypes or protected attributes needs explicit ethical review, purpose, and modeling need.
- Out of scope: medical or public-health prediction, weather forecasting, real-human-behavior prediction, gambling advice, and live casino, wearable, or camera assistance. Any blackjack-style work is offline simulation only.
- Schemas, scenarios, imports, and URLs carry no code, formulas, scripts, compiler, optimizer, or LLM payloads, and no live engine state. Render imported metadata, validation messages, and labels as text, never as trusted HTML.

## 7. Persistence, progression, and product integrity

- No backend, auth, accounts, database, cloud storage, analytics, or telemetry. Browser storage is limited to audited existing uses such as bounded run-comparison summaries; a new storage key needs a dedicated milestone.
- Progression means reusable understanding and modeling capability. Do not add XP, streaks, grinding, or engagement manipulation by default. Levels, badges, achievements, unlocks, scores, completion percentages, and locks on essential scientific tools are out as well.
- Never fabricate experiments, discoveries, maps, evidence, counts, scores, coverage, regimes, timestamps, ids, or user activity. When data is missing, show that it is missing.
- In GW1, Lab and Atlas were future-only informational destinations; after GW4, Atlas is a non-persistent foundation route; after GW5, Lab is a non-persistent foundation route. A Discovery Atlas records investigated model behavior, not certified real-world discoveries. Save-to-Lab, publish-to-Atlas, and create-discovery actions wait for a dedicated storage milestone.
- Starter Worlds, packs, recipes, and guides are strict, versioned, frozen data over existing runtime and add no mechanics or hidden defaults. Public URLs carry only strict IDs, never parameter or RunConfig payloads.
- Capability guidance is source-backed and non-personalized. It describes capabilities; it never creates them or recommends from user profiling.
- Route contract: `/` Start, `/worlds` catalog, `/world` World, `/lab` Lab, `/atlas` Atlas. Preserve `/builder` as Workshop. `/workshop` stays absent.

## 8. Verification and evidence claims

- `npm run verify` (typecheck, lint, unit tests, production build) passes before every commit. `npm run lint` is the scoped TypeScript, unused-symbol, architecture-boundary, seeded-randomness, dynamic-execution, and intrinsic-JSX accessibility baseline; do not describe it as full ESLint, browser, screen-reader, or WCAG coverage.
- Playwright and Axe (`npm run test:ui`) are development audit tooling. Harness routes and controls never ship in production UI, their output folders stay git-ignored, and Axe rules are silenced only with a narrow documented reason.
- Claim only what was directly verified. Distinguish source evidence from rendered behavior. Do not claim accessibility, responsiveness, contrast, keyboard, screen-reader, reduced-motion, or WCAG verification from source inspection alone. Viewport automation is not browser zoom, and Axe is not screen-reader or assistive-technology evidence.
- Keep tests at least as strong as they are; fix the code or document why an assertion is wrong.
- Do not add dependencies. A new dependency, including remote fonts or `next/font/google`, needs explicit approval in its milestone prompt.
- Keep keyboard operation, visible focus distinct from selection, non-color status cues, and reduced-motion support. Distinguish semantic tokens from repeated raw values.

## 9. Where the other rules live

Codex loads only this file. Claude Code also loads `CLAUDE.md`, plus each path-scoped file below when it works on matching paths. Other agents should read the matching file before editing that area.

- `.claude/rules/ui-design-a11y.md`: tokens, panels, palette, layout, focus, and motion for `src/app` and `src/components`.
- `.claude/rules/brand.md`: ORTUS mark, wordmark, and favicon rules.
- `.claude/rules/world-ui.md`: World stage, tasks, playback, Setup drafts, Observe and Change, and immersive presentation.
- `.claude/rules/routes-starter-worlds.md`: route contract, query strictness, Starter Worlds, recipes, packs, and guided investigations.
- `.claude/rules/workshop-builder.md`: Workbench, Structural Draft, Advanced Builder, Graph View, repairs, fit reports, and scenario planning.
- `.claude/rules/lab-atlas.md`: Lab and Atlas boundaries and Atlas preview execution limits.
- `.claude/rules/runtime-worker.md`: Worker protocol limits, lifecycle, and projection details.
- `.claude/rules/templates.md`: template-specific rules for Neural, Opinion, Forest Fire, and Flocking.
- `.claude/skills/ortus-audit/SKILL.md`: the adversarial audit and PR-review procedure.

## 10. Test-anchored historical phrases

The quotes below record completed milestone scopes. They are not current guidance: where they conflict with the sections above or with `docs/ROADMAP.md`, those win. Unit tests still assert them in this file, so remove one only together with its assertion.

- UX0: "Treat UX0 as documentation and design planning only." and "Do not implement World/Lab/Atlas/Workshop without a dedicated prompt." All four destinations now exist.
- GW0: "Do not implement World, Lab, Atlas, Workshop, routes, navigation, pages, shell behavior, persistence, …"
- UX1: "Do not modify production CSS or UI components during UX1." and "Do not treat UX1 as UX2 or GW1, and do not start GW1 without a dedicated prompt."
- GW1: "In GW1, "persistent" means structurally present across routes, not persistent user data." and "Preserve `/` as World." The latter is superseded: `/` is Start and `/world` is World.
- Prompt 39B: "Prompt 39B marks existing scenario plans stale when the schema or fit-report source changes, and copied stale reports must not present old output as current."
- GW7 and GW7B: "GW7 behavioral landscape foundation is non-persistent Atlas vocabulary and conceptual scaffolding only." "GW7B audits and hardens the behavioral landscape foundation; it does not add persistent maps, sampled data, run sweeps, regime detection, runtime behavior, template behavior, Builder execution behavior, validation, calibration, or real-world discovery certification." "Do not add fake maps, heatmaps, contours, sampled regions, evidence scores, confidence scores, coverage percentages, run sweeps, batch execution, or regime detection from GW7."
- GW8: "GW8 landscape probe planning is non-executable and non-persistent." and "Do not add run-probe, run-sweep, save-probe, save-landscape, send-to-Lab, or publish-to-Atlas actions from GW8."
