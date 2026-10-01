---
paths:
  - "src/app/builder/**"
  - "src/components/builder/**"
  - "src/lib/workbench/**"
  - "src/simulation/modelSchema/**"
  - "src/simulation/visualBuilderWorkspace/**"
  - "src/simulation/schemaTemplateCompatibility/**"
  - "src/simulation/composition/**"
---

# Workshop: Workbench, Structural Draft, Advanced Builder

AGENTS.md section 4 sets the invariant: every Workshop artifact is structural and non-executable until a dedicated audited milestone implements execution. This file holds the surface-specific rules. Strings marked *test-asserted* are asserted verbatim; change them only together with their tests.

## Surfaces and authority
- The Visual Systems Workbench is the primary `/builder` surface. Structural Draft (Guided Builder) and Advanced Builder are secondary, structural, and immediately reachable. Advanced keeps Workspace Inspector, Author Schema, Graph View, import/export, validation assistance, repair suggestions, fit reports, scenario planning, exact metadata, and accessible graph outlines.
- The only launch path is Starter Remix: `Run Remix` applies a configuration derivative of an existing Starter-backed template through existing scenario validation and runtime paths. Workshop owns no engine, RNG, scheduler, generic composition, compiler, or persistence, never mutates the active World silently, and never subscribes to live ticks.
- Workshop surfaces add no Compile, Preview Simulation, Generate (template, scenario, RunConfig, snapshot, engine, agents), or Apply-to-Simulation actions. Selection, filtering, panning, and zooming are UI-only state that never mutates source artifacts, templates, scenarios, RunConfigs, snapshots, engines, or World.
- Keep Workshop authoring separate from World Setup and active simulation state. Keep structural-validity versus runtime-readiness language, and unsupported, service-only, future-only, and missing-capability markers, visible next to the structure they describe.

## Schemas and authoring
- Model schemas, `VisualBuilderWorkspaceDefinition` workspaces (structural artifacts, not UI), nodes, edges, and rule declarations are descriptive. Never parse, compile, or execute `ruleDescription`, rules, defaults, ranges, names, notes, or node/edge metadata, and never treat edges as dataflow or nodes as runtime objects. Belief, memory, and social-learning declarations are placeholders, not cognition.
- Schemas accept no formulas, code, scripts, function bodies, runtime hooks, expressions, compiler, optimizer, LLM, or external-framework payloads, visual-builder state, or live engine state. Authoring offers no fields for them.
- All import, validation, summary, serialization, and deserialization goes through the headless services (`deserializeVisualBuilderWorkspace` and the model-schema services); React never duplicates validation logic. Reject oversized files before a full browser read, then still run the deserializer. A failed import preserves the current draft and the last valid artifact. Keep imported non-text JSON types rather than coercing them to strings.
- Structural Draft covers a bounded subset of `ortus.modelSchema`: identity and description, limitation notes, entity types, state attributes, zero or one structural space, descriptive rules, parameter declarations, and one starting-condition note. Everything else is Advanced-only or unsupported.
- Structural Draft IDs are deterministic from normalized names, declaration order, static defaults, and collision suffixes, with no timestamps, UUIDs, randomness, or inference, and they fit each target field's bound even at maximum input length. Draft, step, view, and handoff state are page-session only.
- Handoff to Advanced is explicit and validator-approved and replaces only the Advanced draft, after confirmation if that draft holds meaningful content. Cancel preserves both drafts, clears pending status, and is reported truthfully. Start over and destination navigation, Back, reload, or close with a meaningful draft require an accessible data-loss decision. Removing a referenced entity surfaces the broken references instead of silently repairing them.
- Destructive confirmations block background editing and support Escape, focus cycling, and focus return. Repeated-form editing stays keyboard-accessible and focus-aware. At responsive breakpoints, capability guidance follows the active authoring surface in normal flow and never covers controls.

## Validation repairs
- Repairs are structural editing assistance. They mutate only the current Author Schema draft, then revalidate. They never touch the last valid artifact, World, workspaces, templates, scenarios, RunConfigs, snapshots, engines, or compatibility reports, and they imply nothing about correct model behavior.
- Each suggestion states whether it can be applied, and manual-only suggestions render no apply control. Safe repairs need an explicit click; destructive or content-removing repairs need confirmation, including through helper APIs. Ambiguous intent, duplicate semantics, broken references, unsupported choices, and missing runtime capabilities are manual-only. Reject stale suggestions without changing the draft.
- Patches are deterministic, bounded, named, data-only operations. Reject malformed patches and prototype-like targets, and allow no JSON Patch, path interpreter, LLM repair, or model generation. A field jump to a missing target fails visibly with its path text.

## Graph View
- Graph View is a structural outline, not visual programming. It has no drag-and-drop, edge creation, connect handles, or graph mutation until a dedicated milestone scopes them.
- Layout is deterministic, with no force-layout randomness or continuous animation. Use bounded graph thresholds with an outline fallback, keyboard node inspection, and a text edge list. A major graph dependency needs explicit approval. Graph completeness implies no runtime support.

## Fit reports, compatibility, and scenario planning
- Fit scores are structural summaries, not readiness scores. Ranking is deterministic by score, fit label, then template id. Diagnostics keep stale warnings, unsupported concepts, lossy mappings, future-only gaps, rule non-execution copy, and no-runtime-readiness copy.
- A report goes stale when the Author Schema draft changes after it was generated. *Test-asserted* stale warning: "This fit report may be stale because the schema changed after it was generated. Refresh the report before using it." An invalid draft never shows a previous report as current, and refresh recomputes only from the current structurally valid draft.
- Fit findings never mutate schemas or templates, never become repair patches, and never activate runtime.
- Scenario plans are planning aids. They go stale when the schema or fit-report source changes, refresh only from a valid draft and a non-stale report, and never become predictions, policy recommendations, executable controls, or empirical measurements. Assumption checks identify what to clarify; they do not resolve it. No medical, weather, real-human-behavior, persuasion, targeting, or gambling use.
- Compositions validate strictly and conservatively. Attached artifacts are not active runtime, and composition never bypasses template capability limits.
