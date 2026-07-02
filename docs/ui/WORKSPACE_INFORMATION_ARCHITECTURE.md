# ORTUS Workspace Information Architecture

Date: 2026-07-01
Prompt: UI-REMEDIATION-1, audited and hardened by Prompt 34B, extended by Prompt 35, audited by Prompt 35B, extended by Prompt 36, audited by Prompt 36B, extended by Prompt 37, audited by Prompt 37B, extended by Prompt 38, audited by Prompt 38B, extended by Prompt 39, audited by Prompt 39B, extended by Prompt NUX1, audited by Prompt NUX1B, extended by Prompt N2, audited by Prompt N2B, documented by Prompt MR0, documented by Prompt F0, documented by Prompt P0, documented by Prompt UX0, audited by Prompt UX1, documented by Prompt GW0, visually founded by Prompt UX2, rendered-audited by Prompt UX2B, structurally extended by Prompt GW1, audited/hardened by Prompt GW1B, extended by Prompt GW2, audited/hardened by Prompt GW2B, extended by Prompt GW3, audited/hardened by Prompt GW3B, extended by Prompt GW4, audited/hardened by Prompt GW4B, extended by Prompt GW5, and audited by Prompt GW5B
Status: implemented, source-audited, and rendered-smoke-tested by the GW1/GW1B Playwright shell suite; broader mobile-readiness, actual browser-zoom, screen-reader, assistive-technology, forced-colors, and WCAG claims remain unverified

## Problem

The previous simulation shell put nearly every tool into one long left drawer: Micro Field, Macro Field, Metric Trace, Scenario Builder, Assumptions, Interventions, Experiment Runner, Run Comparison, Timeline, Field Notes, and File Exchange. That was not a workspace architecture. It forced users to scan unrelated tasks, made lower content vulnerable to clipping, and mixed setup, execution, observation, analysis, export, and debug controls.

Two concrete layout defects were confirmed from source:

- The top status header used a fixed `50px` height with `overflow-y: hidden`, so crowded header content could be clipped at the lower edge.
- The timeline controls were rendered inside the same vertically scrolling left drawer and styled as `position: sticky; bottom: 0`, so they competed with drawer scrolling and could cover or clip lower drawer content.

The attachment directory for this prompt did not include a screenshot file, and local browser screenshot tools were not installed. Route availability was verified through HTTP probing, and clipping causes were confirmed from source and CSS.

## New Hierarchy

ORTUS now uses three levels:

- Global destinations: World, Lab, Atlas, and Workshop.
- Simulation workspace modes: Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug.
- Builder modes: Workspace Inspector, Author Schema, and Graph View.
- Panels inside the selected mode.

GW1 route contract:

```text
/         -> World
/lab      -> Lab informational foundation
/atlas    -> Atlas non-persistent foundation
/builder  -> Workshop
```

Lab is a reachable non-persistent GW5 foundation, not a saved evidence-record system. Atlas is a reachable non-persistent GW4 foundation. They do not contain persistent experiments, notebooks, saved Discovery Atlas records, behavioral landscapes, progression, fake counts, fake maps, fake records, or fake user activity.

The World Stage remains mounted while the user changes simulation workspace modes. Workspace mode selection is local React UI state in `AppShell`; it is not simulation state and does not reset, regenerate, or mutate the engine.

## Feature Mapping

- Setup: Neural Runtime Lab when Neural Excitation Network is selected, Run Settings, model template selection, seed controls, parameter controls, Scenario Builder.
- Understand: Assumptions + Limits, Field Notes.
- Observe: Active Run Context, Macro Field, Micro Field, Metric Trace, Legend.
- Intervene: Interventions plus live intervention readiness and model-response boundaries.
- Experiment: Experiment Runner.
- Compare: Run Comparison, Scenario/Snapshot Exchange.
- Debug: Debug diagnostics and performance counters.
- Persistent dock: Run/Pause, Step, Reset, tick, model time, speed.
- Right context drawer: selected entity inspection.

Service-only primitives are not exposed as runnable controls by this IA change.

Builder `Workspace Inspector` remains read-only for `ortus.visualBuilderWorkspace` artifacts. Builder `Author Schema` edits only structural `ortus.modelSchema` drafts through bounded forms. It is intentionally separate from simulation Setup, which configures hand-built runnable templates.

Builder `Graph View` visualizes the currently loaded validated workspace artifact through a presentation-only view model. It does not merge that artifact with the Author Schema draft, create workspace artifacts from schemas, or mutate either source. Graph selection, filtering, panning, zooming, and neighborhood highlighting are local UI state.

Prompt 36B hardens Graph View as inspection rather than authoring. Marker counts distinguish validation, warning, unsupported, future-only, service-only, global runtime-boundary notices, and missing runtime capabilities. Filtered-out connected nodes and edges are disclosed as hidden by current filters rather than selectable visible graph targets. Fit Graph, selection, filtering, panning, and zooming remain UI-only and do not mutate the loaded workspace or simulation state.

Prompt 37 extends only the Builder `Author Schema` validation region. It groups structural validation issues, warnings, missing capabilities, manual-review items, and bounded repair suggestions for the current UI-local schema draft. Repair suggestions do not activate the loaded workspace, simulation Setup, templates, scenarios, RunConfigs, snapshots, engines, compatibility reports, social-learning artifacts, or Graph View.

Prompt 37B hardens that validation region without changing the workspace hierarchy. Repair suggestions are structural editing assistance. They do not make a schema runnable. A repaired schema may be structurally valid and still have no runtime implementation. ORTUS does not infer the correct model behavior from validation repairs. Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines. Confirmation-required repairs are enforced by the repair helper, `canApply` is explicit, malformed/prototype-like patches are rejected, stale list-item patches fail safely, and rule repair suggestions state that they only edit structure.

Prompt 38 extends only the Builder `Author Schema` side column with a Schema-to-Template Fit Report. The fit report operates on the current structurally valid draft, wraps the existing compatibility service, and remains separate from simulation Setup, active runtime state, the loaded Visual Builder workspace, Graph View, templates, scenarios, RunConfigs, snapshots, engines, and validation repairs. Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Rule fits are structural comparisons. Rule declarations are not executed. Fit score is a structural summary, not a runtime readiness score. Builder graphs remain structural inspection views. Fit reports do not make them executable. Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability. MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report.

Prompt 38B hardens that side-column report without changing workspace hierarchy. A report generated from a prior draft is marked stale after schema edits, imports, resets, or repairs until refreshed. The required stale copy is visible: This fit report may be stale because the schema changed after it was generated. Refresh the report before using it. Invalid current drafts disable report generation rather than falling back to a previous valid report. Refresh recomputes from the current structurally valid draft only. The report still does not create scenarios, RunConfigs, snapshots, templates, engines, agents, Builder graphs, or runtime state.

Prompt 39 extends only the Builder `Author Schema` side column with Scenario Planning From Schema below the fit report, and Prompt 39B audits that surface. Scenario planning from schema is a planning aid. It does not create runnable scenarios. Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state. Scenario questions are hypotheses to explore, not predictions or validated conclusions. A scenario plan can suggest what to inspect, but it does not prove what will happen. Assumption checks identify what the modeler should clarify. They do not resolve the assumption. The panel derives bounded planning questions, conceptual interventions, metrics, assumption checks, data needs, gaps, and claim boundaries from the current structurally valid draft plus current non-stale fit-report context when available. It does not change Builder navigation, simulation Setup, active runtime state, the loaded visual workspace, Graph View, templates, scenarios, RunConfigs, snapshots, engines, validation repairs, or fit reports. Stale fit reports disable planning until refreshed; schema or fit-report source changes mark dependent scenario plans stale until refreshed. MR0 concepts remain future-only planning gaps, and Neural Strategy Adaptation remains local to Neural Runtime Lab. Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

Prompt NUX1 extends Setup only when the Neural Excitation Network template is selected. The Neural Runtime Lab is scenario-first: scenario cards, mission/status readouts, live explanations, direct actions, plain-English controls, an Advanced config drawer, bounded timeline, and RPS shell appear before exact numeric Neural parameters. This lab shows stylized neural excitation dynamics and bounded categorical readouts. It does not model cognition or biological neurons. Rock-Paper-Scissors labels are assigned to output assemblies by the model designer; the network does not understand the labels. This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable. The panel does not alter Builder modes, execute Model Schemas, or turn visual graphs into runtime graphs.

Prompt NUX1B keeps that workspace structure unchanged while fixing production buildability and source-level audit gaps. The Neural Runtime Lab remains a Setup-only UI layer; it is not a new workspace mode, runtime primitive, schema interpreter, Builder graph executor, or learning system. Rendered responsive, zoom, and assistive-technology behavior remain unverified unless directly tested.

Prompt N2 keeps the same Setup-only IA and upgrades only the Neural lab RPS shell into an Adaptive RPS Challenge. Prompt N2B audits and hardens that shell without adding a workspace mode. Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference. The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time. Learned strategy state is local model state, not a psychological profile. Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning. Prompt N2B keeps reset semantics round-index based, keeps round numbering monotonic after bounded-history truncation, filters malformed round objects before statistics, and documents that fresh-run rebuilds do not clear local learned strategy unless Reset learned strategy is used. Adaptation details, local exact adaptation values, reset learned strategy, and clear round history controls stay inside the Neural lab panel. They do not create a new workspace mode, persist a user strategy profile, mutate Builder artifacts, execute Model Schemas, make Builder graphs executable, update core neural synapse weights, or activate social-learning artifacts.

Prompt MR0 is documentation only and does not change the workspace hierarchy. It does not add a new workspace mode, UI surface, runtime template, decision-cluster runtime, stimulus-conditioned runtime, blackjack lab, observed-cluster analytics, wearable/camera/live-card input, casino assistance, or gambling-advice flow. Future T1/T2/DC1/DC2/G1/DC3 work must arrive through dedicated prompts and audits before it appears in Setup, Observe, Experiment, Compare, Builder, or any other workspace area.

Prompt F0 is documentation only and does not change the workspace hierarchy. It does not add a new workspace mode, UI surface, Scale Lens, fractal metric output, fractal spatial generator controls, network scaling plots, trajectory motif analytics, template support, schema execution, Builder graph execution, or runtime behavior. Future Scale Lens / Coarse-Graining work, if explicitly prompted later, belongs in analytical observation/comparison surfaces and must distinguish visual zoom, spatial resampling, aggregation, coarse-graining, and model reduction. Scale Lens views are analytical projections, not separate validated models; coarse-graining may discard information and alter apparent dynamics.

Prompt P0 is documentation only and does not change the workspace hierarchy. It does not add Research World progression, persistent model labs, discovery atlases, behavioral landscapes, contextual capability guidance, model composition frontiers, grand challenges, missions, XP, streaks, unlocks, scoring, achievements, persistence, accounts, social features, onboarding, or UI flows. Future Research World work, if explicitly prompted later, should use soft contextual guidance rather than artificial feature locks and must reward reusable understanding, reproducibility, comparison, and honest interpretation rather than arbitrary points.

Prompt UX0 is documentation only and does not change the workspace hierarchy. It defines the future World, Lab, Atlas, and Workshop destinations conceptually: World observes and perturbs active systems, Lab organizes experiments and reusable research assets, Atlas maps accumulated understanding and unexplored behavioral territory, and Workshop constructs and inspects model structure. UX0 does not add routes, tabs, navigation, shell state, persistence, CSS tokens, component redesigns, discovery logic, behavioral landscapes, model composition, or runtime behavior. Future migration must be incremental and preserve existing workflows.

Prompt UX1 is documentation and source-level audit only and does not change the workspace hierarchy. It inventories the existing shell, Builder, Neural Runtime Lab, template-specific views, forms, validation UI, cards, panels, drawers, tabs, badges, charts, graph/canvas surfaces, global CSS, inline styling, dependency constraints, responsive source risks, and accessibility source risks. UX1 identifies current shell constraints that UX2 and GW1 must account for, but it does not add routes, navigation, World/Lab/Atlas/Workshop, CSS tokens, component redesigns, responsive behavior, runtime behavior, dependencies, assets, or rendered verification.

Prompt GW0 is documentation and progression architecture only and does not change the workspace hierarchy. It defines future Research World destination responsibilities for World, Lab, Atlas, and Workshop while preserving current `/` and `/builder` access. GW0 defines destination responsibilities. It does not implement destination navigation or persistence. The Research World architecture must wrap and reorganize validated workflows before attempting to replace them. GW0 does not add routes, shell state, persistence, discovery logic, behavioral landscapes, contextual guidance, progression state, notebooks, saved assets, CSS, components, runtime behavior, or template behavior. The required future sequence is GW0 -> UX2 -> GW1 -> GW1B -> GW2 -> GW2B -> GW3 -> GW3B -> GW4 -> GW4B -> GW5 -> GW5B -> GW6 -> GW6B.

Prompt UX2 changes shared visual semantics, not workspace IA. It adds the Living Systems Atlas Semantic Token Foundation, preserves legacy CSS variable compatibility, and migrates only shared panels, buttons/icon controls, form controls, and status badges. UX2 establishes shared visual semantics. It does not perform the Research World shell transformation. UX2 does not add routes, destination navigation, persistence, discovery logic, behavioral landscapes, contextual guidance, progression state, notebooks, saved assets, runtime behavior, template behavior, or new workspace modes.

Prompt GW1 adds the shared Research World destination shell. `/` remains World, `/builder` remains Workshop, `/lab` is a Lab informational foundation, and `/atlas` begins as an Atlas informational foundation. Lab and Atlas are reachable destinations, not locked routes, and GW1 adds no persistence, discovery logic, behavioral landscapes, progression, runtime behavior, or template behavior.

The GW1 rendered continuation fixed a shell-level focus defect: the skip link was the active element but could remain partially or fully offscreen during its reveal transition. The skip link now reveals immediately on focus and remains in the viewport in the Playwright shell suite.

Prompt GW1B audits and hardens that same destination hierarchy without changing it. The audit adds route-alias, unique-landmark, clean-navigation, single-current-destination, no-disabled-future-link, skip-link focus, reduced-motion focus, query/hash normalization, and future-only honesty checks. It does not add persistence, Discovery Atlas behavior, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, `/world`, `/workshop`, redirects, dependencies, assets, or fonts.

Prompt GW2 extends Observe only. Active Run Context appears before Macro Field so model configuration, operational status, current snapshot observations, and interpretation boundaries are visible near model outputs. It is a live, non-persistent surface over existing World state. It is semantic readable content, not a fake interactive Tab stop. Prompt GW2B hardens the no-snapshot labels and rendered focus/placement assertions without changing the IA. It does not create a new workspace mode, mutate simulation state, save run records, create Lab artifacts, create Atlas discoveries, add storage, or change template/runtime behavior.

Prompt GW3 extends Intervene only, and Prompt GW3B audits/hardens that slice. Intervention Readiness appears above the existing intervention controls so registered template-owned perturbation controls, selected-target readiness, current active-run intervention count, and model-response boundaries are visible near actions that can perturb model state. It is live, non-persistent context over existing World state and intervention definitions. It is semantic readable content, not a fake interactive Tab stop. Current-run intervention entries are engine/snapshot state, not saved Lab records. The Intervene panel uses engine-checked copy for command paths rather than language that could imply scientific validation. It does not create a new workspace mode, mutate simulation state by itself, save intervention plans, create Lab artifacts, create Atlas discoveries, add storage, or change template/runtime behavior.

Prompt GW4 extends Atlas only. `/atlas` now renders non-persistent Discovery Atlas information architecture: evidence-state legend, sampled/unsampled explanation, model-vs-world boundary, non-persistence boundary, World/Lab relationship copy, and a conceptual scaffold labeled as not run data. Prompt GW4B audits and hardens that layer by keeping sampled evidence unresolved until source-backed Atlas records exist. It does not create a new World workspace mode, mutate simulation state, ingest active runs, save evidence records, create Lab artifacts, create behavioral landscapes, add storage, add save/map actions, or change template/runtime/Builder behavior.

Prompt GW5 extends Lab only. `/lab` now renders non-persistent Lab evidence-record information architecture: lifecycle legend, model-only and externally unvalidated interpretation, non-persistence boundary, World/Atlas relationship copy, and a conceptual experiment-ledger scaffold labeled as not saved Lab data. It does not create a new World workspace mode, mutate simulation state, ingest active runs, save evidence records, create experiment ledgers, create notebooks, create saved comparisons, create run history, publish to Atlas, add storage, add save/send/publish actions, or change template/runtime/Builder behavior.

Prompt GW5B audits that Lab-only foundation without changing workspace hierarchy. It hardens stale roadmap/context wording that skipped the GW5B audit gate and completes the focused shell and full UI rendered verification gate. It does not add persistence, saved records, experiment history, notebooks, saved comparisons, run history, Lab-to-Atlas publication, behavioral landscapes, progression, runtime behavior, template behavior, or Builder execution.

## Header

The shared Research World header now contains:

- ORTUS brand.
- Destination links for World, Lab, Atlas, and Workshop.
- Current destination context and capability status.

The World-specific `TopStatusBar` now contains:

- Current model.
- Current scenario when engine metadata provides one, otherwise `Default run`.
- Current workspace mode.
- Compact run status with tick/time/phase readout and warning state.

Lower-frequency actions moved out of the header:

- Model, seed, and parameter editing moved to Setup.
- Scenario/snapshot import/export moved to Compare.
- Debug diagnostics moved to Debug.

## Run Controls

Playback controls live in a persistent shell-level run-control dock outside the workspace context scroll region. The dock has visible labels and accessible names for Run/Pause, Step, and Reset. It does not cover world content and is not sticky inside the drawer.

Reset rebuilds a fresh tick-0 run from the current model, parameters, and seed. That clears the current tick, metric history, selection, intervention targets, and intervention history. Prompt 34B added press-and-confirm behavior when the current run has advanced, accumulated more than initial metric history, or recorded interventions. Reset remains one-click only when there is no meaningful run state to discard.

Regenerate Seed is separate from Reset. It creates a new seed and rebuilds a fresh tick-0 run. Apply Seed rebuilds with the typed seed. Model and parameter changes also rebuild a fresh tick-0 run immediately through template validation; there is no reliable pending-change state in the current architecture.

## Scrolling Rules

- The app shell owns viewport height.
- The main workspace row uses `min-height: 0`.
- The left workspace column does not vertically scroll as a whole.
- The workspace context body is the one intentional vertical scroll container.
- Persistent controls live outside scrollable configuration content.
- The header no longer uses fixed `50px` height or `overflow-y: hidden`.

Do not reintroduce sticky run controls inside scrollable configuration panels.

## Responsive Behavior

Wide desktop:

- Workspace navigator and context panel remain visible on the left.
- World Stage remains dominant.
- Right inspector overlays only when a selection exists.
- Run-control dock remains visible below the main workspace row.

Medium and narrow viewports:

- The layout stacks world-first.
- The workspace navigator becomes horizontally scrollable.
- The selected workspace context becomes a sheet below the world.
- The run dock stacks its controls into rows.
- Builder mode tabs become horizontally scrollable.
- Schema authoring stacks outline/import, form editor, and validation regions without hiding errors.
- Schema validation issue cards, copyable diagnostics, and repair controls remain in the validation region when the Builder stacks.
- Prompt 35B moves Builder stacking to `1120px`, before the three-column minimum tracks can force horizontal overflow.
- Graph View uses controls/outline, graph, and inspector columns on wide screens and stacks them at `1120px`.
- Narrow users retain the node outline, text edge list, warnings, and inspector even when the visual relationship plane is constrained.

This is a source/CSS implementation. Browser zoom at 125% and 200% still needs a real rendered audit.

## Accessibility Behavior

- Workspace modes use semantic tab controls with `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and a `role="tabpanel"` context panel.
- Current mode is communicated by text and ARIA state.
- Workspace tabs support Arrow Left/Right/Up/Down plus Home/End navigation and move focus to the selected tab.
- Builder mode tabs and schema section tabs use roving tab stops and support Arrow Left/Right/Up/Down plus Home/End navigation.
- Graph nodes support Arrow Left/Right/Up/Down plus Home/End navigation; all nodes also appear in a grouped button outline.
- Graph edges are available as keyboard-reachable text buttons rather than relying on SVG line focus.
- Graph source, status counts, warnings, missing capabilities, selected item, and non-executable state are text-readable.
- Schema fields use associated labels, textual required/error state, and a linked error summary where the service error maps to a field.
- Schema validation groups use expandable buttons with `aria-expanded`, text severity/counts, section-jump buttons, disabled/manual guidance, copyable text diagnostics, and a polite validation status region.
- Dirty reset/import/restore, repeated-item removal, and metadata removal use a modal `alertdialog` with focus cycling, Escape cancellation, and focus return.
- Prompt 37 content-removing repairs use the same modal confirmation pattern; Prompt 37B also enforces confirmation inside the repair helper, so stale or unconfirmed destructive repairs are rejected before mutation.
- Run controls have visible text labels and accessible names.
- The header and dock state use text, not color alone.
- Focus styles remain global through existing focus-visible CSS.

This is not a formal WCAG conformance claim.

## State Separation

- Workspace mode lives in local React state.
- Workspace navigation does not import `SimulationEngine`, subscribe to snapshots, or mutate the simulation store.
- Hidden workspace panels are not rendered, reducing tick-driven subscriptions from inactive Macro, Metric, Debug, Experiment, and Comparison panels.
- The world renderer and simulation stepping loop are unchanged.
- Builder viewport node and edge buttons select structural items for read-only inspection only; they do not execute nodes or edges.
- Builder schema drafts, last-valid checkpoints, active form section, and import/export text are local React state and do not mutate the simulation store.
- Prompt 37 repair suggestions patch only the current schema draft through named structural operations and re-run validation. Prompt 37B rejects malformed patches, prototype-like metadata targets, and stale list-target patches. Repairs never mutate last-valid artifacts, active simulation state, loaded visual workspaces, templates, scenarios, RunConfigs, snapshots, engines, compatibility reports, or social-learning artifacts.
- Builder mode panels stay mounted but hidden so switching between Workspace Inspector and Author Schema does not discard an in-memory draft.
- Graph View is mounted only while active, preventing hidden graph layout/filter work; entering or leaving it does not mutate the loaded workspace or schema draft.
- Hidden Builder panels have no simulation tick subscriptions or engine work.
- Metric Trace now states near the chart that trace values are bounded model-output history over simulated ticks, not empirical measurements, calibrated probabilities, or validation evidence.
- Prompt GW6 capability guidance is static route-local UI orientation from `src/lib/capabilityGuidance.ts`. Prompt GW6B audits and hardens that layer. Guidance does not subscribe to simulation ticks, mutate active simulation state, execute Builder structures, persist guidance state, create Lab records, create Atlas records, route users from behavior, order tasks from behavior, or create generated guidance.

## Unresolved Limitations

- No browser screenshot/DOM measurement pass was possible in this environment.
- Canvas agent states still rely partly on color/glyph conventions and need a dedicated visualization accessibility pass.
- The dense technical visual language still needs a broader design-system pass.
- Pending-change detection is not implemented because the current runtime immediately rebuilds for template, seed, and parameter changes.
- Browser zoom at 125%, 150%, and 200% remains unverified.
- Prompt 35B form focus behavior is source-tested but not verified with a screen reader or real browser keyboard walkthrough.
- Prompt 36/36B graph keyboard, responsive, SVG/text equivalence, target sizing, fit behavior, filtered-selection behavior, and zoom behavior are source-tested but not verified in a real browser or screen reader.
- Prompt 37/37B validation group expansion, repair confirmation, clipboard fallback, focus return, missing-focus fallback, and keyboard walkthrough behavior are source-tested but not verified in a real browser or screen reader.
- Prompt UX1 documents source-visible token, component, responsive, and accessibility risks; it does not verify rendered behavior.

## Future Design-System Work

A dedicated visual design-system prompt should start from Prompt UX1 evidence and should not begin without explicit UX2 direction. It should address semantic tokens, typography scale, color-independent state encoding, richer chart semantics and units where model definitions support them, responsive screenshot testing, keyboard walkthroughs, and zoom behavior without changing simulation semantics or implementing World/Lab/Atlas/Workshop by accident.

Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges. Graph selection, filtering, panning, and zooming are UI-only state. Graph View is not visual programming, schema execution, or runtime generation. A graph that looks complete is still not a runnable model.
