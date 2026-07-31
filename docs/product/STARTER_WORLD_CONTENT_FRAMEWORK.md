# Starter World Content Framework

Date: 2026-07-27
Status: C1 and C1B complete; C2 next

## 1. Scope

C1 adds a versioned, validated, data-only content layer over ORTUS's seven existing production templates. It adds the Explore Worlds catalog, directly linkable detail pages, strict launch context, source provenance, deterministic content lint, and a future-world portfolio.

C1 does not add simulation mechanics, templates, scenarios, parameters, metrics, interventions, persistence, Builder execution, schema execution, multiscale runtime, or empirical validation. The content layer describes and launches supported runtime slices; it does not become a hidden runtime.

## 2. Product Purpose

Starter Worlds introduce runnable systems through questions, represented parts, interactions, and investigations. They are:

- an onboarding surface;
- a capability showcase;
- an inspiration and conceptual-learning library;
- a launch point into the existing World workbench;
- a documented bridge toward later remix and Builder work.

The invitation order is question, premise, anatomy, first action, observation, research connection, model boundary, and full technical detail. Internal IDs and configuration tables remain subordinate.

## 3. Starter World Definition

The source model is `src/lib/starterWorlds/types.ts`. `StarterWorldDefinition` is validated by strict Zod schemas and currently uses schema version `"1"`.

Identity includes `id`, `version`, `slug`, `title`, `shortTitle`, `hookQuestion`, `oneSentencePremise`, `summary`, and `runtimeStatus`. Status is bounded to `runnable`, `planned`, or `concept-only`. Only runnable definitions may carry runtime references or launch.

Definitions are plain, bounded data. Unknown fields, non-plain objects, circular values, and prototype-like keys are rejected. A definition is not a template, scenario, RunConfig, Model Schema, visual-builder workspace, or executable rule.

## 4. Runtime Boundary

Runnable definitions reference only:

- an existing production `templateId`;
- the template's authoritative default initialization preset as `defaultScenarioId`;
- a bounded list of authoritative `supportedScenarioIds`;
- one existing World task;
- one existing metric;
- one existing parameter;
- an existing intervention only when used as the first change.

`src/lib/starterWorlds/validation.ts` checks these references against production template, initialization-preset, metric, parameter, and intervention registries. It also verifies labels and suggested parameter values against authoritative type and range contracts.

The word `scenario` in Starter World content refers to the production template initialization presets used by existing scenario services. C1 does not create a second scenario registry and does not alter scenario logic.

Valid content does not imply new runtime support. Launching a Starter World executes the referenced production template through the existing scenario path.

## 5. Content Taxonomy

Taxonomies are bounded in `types.ts`.

- Domain: Living systems, Collective behavior, Information and society, Networks and signals, Environment and spread, Population dynamics.
- Mechanism: local-neighbor, spatial-contact, network-influence, resource-consumption, predation, contagion, threshold, competition, cooperation, signal-propagation, feedback, adaptation, event-resolution, stochastic-transition.
- System form: spatial-agents, grid, network, population, hybrid.
- Complexity: quick-start, layered, advanced.

Complexity describes interaction depth. It does not classify or profile users.

## 6. System Anatomy

Anatomy may describe entities, groups, environment, resources, networks, fields, boundaries, scales, feedback loops, delays, adaptation, selection, stochasticity, and observables.

At least one represented facet is required. Each facet is optional otherwise, bounded to concise text entries, and rendered only when present. Absence is not inflated into an unsupported-capability matrix. Anatomy describes what the current model represents, not everything the real system contains.

## 7. Investigation Structure

Every runnable definition includes:

- `firstRun`: a plain-language baseline action, what it demonstrates, and the initial World task;
- `firstChange`: one authoritative parameter or intervention, an explicit direction or value, rebuild/current-run semantics, and a named difference to inspect;
- `whatToWatch`: visible behavior and existing metrics where applicable;
- `investigationPrompts`: two to four model-specific questions.

Parameter changes retain the existing draft-then-rebuild contract. Current-run interventions retain the existing template-defined command path. Starter content adds neither control type.

## 8. Research Provenance

Sources are structured with `sourceId`, title, authors or organization, year, source type, HTTPS URL or DOI, relationship, and a model-specific note.

Allowed source types include peer-reviewed paper, conference paper, book, official institution, research project, educational reference, and historical source. Relationships distinguish canonical model, mechanism inspiration, research context, educational context, and historical context. Source IDs are slug-safe, source URLs use HTTPS, and `doi.org` links must contain a DOI-shaped path.

Each runnable world has one to three checked sources. The detail page states:

> These sources connect the Starter World to related ideas and research. They do not validate or calibrate this implementation.

Research connection is not calibration, reproduction, prediction, causal proof, or empirical validation.

## 9. Fictional-World Policy

Original fictional systems are valid future modeling contexts when they specify entities, rules, resources, scales, feedbacks, observables, and boundaries. Fiction does not excuse incoherent mechanics. Product content must avoid shallow franchise imitation and copyrighted universes as default identity.

Fictional candidates stay in the documented portfolio until dedicated runtime support and an audit exist. They do not appear as disabled runnable cards.

## 10. Quality Standard

`evaluateStarterWorldQuality` is a deterministic, non-LLM evaluator. Runnable content requires a question, clear premise, authoritative runtime reference, baseline action, specific first change, observable, at least two investigations, primary mechanism, represented anatomy, compact limitation, source context, and expansion path.

Lint detects duplicate hooks, repeated limitations, duplicate prompts or source IDs, generic summaries, raw runtime IDs in headings, unsupported research or runtime claims, unnamed first changes, excessive boundary copy, and future capabilities presented as current.

Passing lint means the content satisfies C1's structural and editorial contract. It does not mean the model is empirically valid, pedagogically effective, or scientifically calibrated.

## 11. Launch Handoff

`src/lib/starterWorlds/launch.ts` accepts strict Starter World requests. Canonical detail links carry only `starter=<id>`. Template and initialization preset are never accepted as public handoff inputs; they are derived from the recursively frozen, validated definition. Unknown fields such as template overrides, scenario overrides, parameter payloads, or RunConfigs are rejected.

The World route re-resolves the starter, template, initialization preset, and task. Ordinary World task navigation may add a validated `task` query after launch, but it cannot override runtime identity. `createStarterWorldScenario` then uses `createDefaultScenario`, `updateScenarioPreset`, and `validateScenario` to create a fresh deterministic paused tick-0 run. Starter identity is retained as scenario metadata.

Malformed, stale, unknown, or mismatched context stops at an accessible error. It never silently selects another template or creates a partial World.

## 12. World Integration

World keeps its established R2B shell. A compact dismissible nudge is generated from the selected definition and links back to the detail route. It names the baseline action, the specific first change, and the observations to watch.

Dismissal is component-local and moves focus to the World stage. It does not write progress, completion, achievement, or storage state. Normal task navigation preserves the active run. A direct page reload intentionally creates a fresh run from the URL contract.

## 13. Remix and Builder Relationship

Remix directions distinguish:

- `runtime-now`: changes already available through current World controls;
- `advanced-tools`: structural exploration possible through current non-executable Advanced tools;
- `future-capability`: missing runtime or Builder support.

No remix item executes from the detail page. C1 does not generate templates, schemas, scenarios, RunConfigs, or Builder workspaces. Later S-series prompts must define and audit any real handoff.

## 14. Accessibility

Catalog and detail routes use one H1, named regions, native labelled inputs, coherent heading order, keyboard-operable links and controls, text equivalents for visual characteristics, visible active-filter text, and explicit external-link wording. Decorative deterministic diagrams are hidden from assistive technology.

The launch error is announced as an alert. Nudge dismissal returns focus to the stage. Representative routes passed automated Axe checks and reduced-motion browser checks.

This is not screen-reader, assistive-technology, forced-colors, browser-zoom, touch-workflow, WCAG, or educational-outcome certification.

## 15. Content Maintenance

To add or change a Starter World:

1. Verify actual runtime support in production template and initialization registries.
2. Add or update the data definition.
3. Use only bounded taxonomy terms and represented anatomy.
4. Verify every source at a primary, canonical, university, or institutional location.
5. Run definition validation and deterministic quality lint.
6. Add focused tests for references, filtering, search, route rendering, and launch behavior.
7. Inspect all required viewport states.
8. Update framework, catalog, portfolio, roadmap, and Codex records.
9. Follow the implementation with its required audit prompt.

Catalog order is explicit and then deterministically tie-broken by ID. IDs, slugs, hooks, limitations, and source IDs are collection-unique.

## 16. Non-Goals

C1 does not implement new mechanics, new templates, runtime composition, multiscale coupling, user-authored execution, formulas, arbitrary code, LLM agents, profiling, persuasion optimization, recommendation generation, saved learning progress, backend storage, Atlas or Lab persistence, scientific validation, C2 content, or F1 analysis.

Seven current worlds are richer content surfaces over seven existing runtimes. They are not seven claims of real-world fidelity.

## 17. C1B Audit

C1B independently audited:

- every runtime reference and suggested control against current registries;
- source accuracy and relationship wording;
- content-lint coverage and adversarial inputs;
- strict URL and fresh-run semantics;
- all seven rendered handoffs;
- first-viewport hierarchy and visual differentiation;
- keyboard, focus, responsive, short-height, diagnostics, and Axe evidence;
- no runtime, persistence, Builder, Atlas, Lab, or research-validity creep.

The audit found and fixed a nested-registry mutation path, canonical handoff override fields, inaccurate source-type classifications, weak DOI/source-ID checks, repetitive and internal-ID content, incomplete content/runtime cross-checks, generic card action names, a quantitative-looking Predator-Prey illustration, an unsupported bounded-confidence portfolio claim, incomplete Tier C multiscale fields, and one displayed metric-label mismatch. `docs/product/STARTER_WORLD_CONTENT_FRAMEWORK_AUDIT.md` records the evidence and remaining external validation limits.

- R1 complete.
- R1B complete.
- R2 complete.
- R2B complete.
- C1 complete.
C1B final focused and complete browser verification passed. C1B is complete. C2: Flagship Starter Pack One is next and has not started.
