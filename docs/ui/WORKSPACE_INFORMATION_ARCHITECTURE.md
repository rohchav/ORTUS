# ORTUS Workspace Information Architecture

Date: 2026-07-27
Prompt: UI-REMEDIATION-1 through C1
Status: implemented and rendered-audited; broader mobile-readiness, actual browser-zoom, screen-reader, assistive-technology, forced-colors, user-comprehension, and WCAG claims remain unverified

## Problem

The first remediation replaced one long drawer with task modes, but the resulting product still opened directly into an expert workbench. Four equal-weight destinations, seven equal task cards, broad guidance, and a wide configuration rail competed with the live model. R1 treats that as an information-architecture defect, not a copy problem.

Two concrete layout defects were confirmed from source:

- The top status header used a fixed `50px` height with `overflow-y: hidden`, so crowded header content could be clipped at the lower edge.
- The timeline controls were rendered inside the same vertically scrolling left drawer and styled as `position: sticky; bottom: 0`, so they competed with drawer scrolling and could cover or clip lower drawer content.

The attachment directory for this prompt did not include a screenshot file, and local browser screenshot tools were not installed. Route availability was verified through HTTP probing, and clipping causes were confirmed from source and CSS.

## New Hierarchy

ORTUS now uses four levels:

- Product entry: Start Hub at `/`, with its runnable-world catalog at `/worlds`.
- Primary destinations: World and Workshop, with Atlas, Lab, Experiments, and Compare runs grouped under Research tools.
- World task navigation: direct Setup, Observe, Change, and Compare controls plus a More menu for Understand model, Experiments, and Diagnostics.
- Builder modes: Workspace Inspector, Author Schema, and Graph View.
- Panels inside the selected mode.

Current R1 route contract:

```text
/         -> Start Hub
/world    -> World
/lab      -> Lab informational foundation
/atlas    -> Atlas non-persistent evidence foundations plus bounded ephemeral preview
/builder  -> Workshop
```

Lab is a reachable non-persistent GW5 foundation, not a saved evidence-record system. Atlas is a reachable non-persistent route with GW4/GW7/GW8 foundations and the bounded GW9 ephemeral preview. Atlas includes behavioral-landscape vocabulary, non-executable probe planning, and one exact-coordinate Flocking sampler. Lab and Atlas still do not contain persistent experiments, notebooks, saved Discovery Atlas records, saved landscapes or probe plans, run queues, generic sweeps, interpolation, regime detection, progression, fake counts, fake maps, fake records, or fake user activity.

RH1 clarifies that existing local World comparison storage may preserve bounded run summaries for comparison. That is World-local UI workspace state, not persistent Lab evidence, Atlas discovery storage, saved behavioral landscapes, saved probe plans, or real-world validation. RH1 also clarifies that existing World Experiment Runner sweeps are bounded local model-comparison tooling, not Atlas landscape sampling, landscape probe execution, saved sampled regions, run queues, or regime detection.

Prompt UX3 audits the rendered hierarchy and concludes that the current routes are honest but still too console-like for the Living Systems Atlas sandbox/workbench mission. Prompt UX4 applies the first bounded visual-language foundation: softer workbench surfaces, quieter status/caveat treatment, less tactical framing, and stronger route identity. Prompt UX4B audits that foundation, finds it ready for UX5, and keeps GW9 paused. Prompt RH1 completes a local source-of-truth hygiene pass and records that GitHub was stale before the RH1 continuation push. UX4B/RH1 do not create Beginner Mode, Advanced Mode, Guided Builder, preferences, new persistence features, new route behavior, runtime behavior, template behavior, Builder execution, Lab records, Atlas discoveries, samples, run queues, or progression.

The World Stage remains mounted while the user changes simulation workspace modes. Workspace mode selection is local React UI state in `AppShell`; it is not simulation state and does not reset, regenerate, or mutate the engine.

## Feature Mapping

- Setup: selected template, active scenario/starting recipe, seed, four model-specific quick controls, all-parameter disclosure, Scenario Builder disclosure, and Neural Runtime Lab when Neural Excitation Network is selected.
- Understand model: concise question, mechanism, watch target, suggested change, key assumptions, main limitation, and full model notes disclosure.
- Observe: Active Run Context, Macro Field, Micro Field, Metric Trace, Legend.
- Change (`intervene` internally): Interventions plus live intervention readiness and model-response boundaries.
- Experiments (`experiment` internally): Experiment Runner.
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

Prompt GW0 is documentation and progression architecture only and does not change the workspace hierarchy. It defines future Research World destination responsibilities for World, Lab, Atlas, and Workshop while preserving current `/` and `/builder` access. GW0 defines destination responsibilities. It does not implement destination navigation or persistence. The Research World architecture must wrap and reorganize validated workflows before attempting to replace them. GW0 does not add routes, shell state, persistence, discovery logic, behavioral landscapes, contextual guidance, progression state, notebooks, saved assets, CSS, components, runtime behavior, or template behavior. The current sequence is complete through GW8B; GW9 remains future Research World work only with explicit direction.

Prompt UX2 changes shared visual semantics, not workspace IA. It adds the Living Systems Atlas Semantic Token Foundation, preserves legacy CSS variable compatibility, and migrates only shared panels, buttons/icon controls, form controls, and status badges. UX2 establishes shared visual semantics. It does not perform the Research World shell transformation. UX2 does not add routes, destination navigation, persistence, discovery logic, behavioral landscapes, contextual guidance, progression state, notebooks, saved assets, runtime behavior, template behavior, or new workspace modes.

Prompt GW1 adds the shared Research World destination shell. `/` remains World, `/builder` remains Workshop, `/lab` is a Lab informational foundation, and `/atlas` begins as an Atlas informational foundation. Lab and Atlas are reachable destinations, not locked routes, and GW1 adds no persistence, discovery logic, behavioral landscapes, progression, runtime behavior, or template behavior.

The GW1 rendered continuation fixed a shell-level focus defect: the skip link was the active element but could remain partially or fully offscreen during its reveal transition. The skip link now reveals immediately on focus and remains in the viewport in the Playwright shell suite.

Prompt GW1B audits and hardens that same destination hierarchy without changing it. The audit adds route-alias, unique-landmark, clean-navigation, single-current-destination, no-disabled-future-link, skip-link focus, reduced-motion focus, query/hash normalization, and future-only honesty checks. It does not add persistence, Discovery Atlas behavior, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, `/world`, `/workshop`, redirects, dependencies, assets, or fonts.

Prompt GW2 extends Observe only. Active Run Context appears before Macro Field so model configuration, operational status, current snapshot observations, and interpretation boundaries are visible near model outputs. It is a live, non-persistent surface over existing World state. It is semantic readable content, not a fake interactive Tab stop. Prompt GW2B hardens the no-snapshot labels and rendered focus/placement assertions without changing the IA. It does not create a new workspace mode, mutate simulation state, save run records, create Lab artifacts, create Atlas discoveries, add storage, or change template/runtime behavior.

Prompt GW3 extends Intervene only, and Prompt GW3B audits/hardens that slice. Intervention Readiness appears above the existing intervention controls so registered template-owned perturbation controls, selected-target readiness, current active-run intervention count, and model-response boundaries are visible near actions that can perturb model state. It is live, non-persistent context over existing World state and intervention definitions. It is semantic readable content, not a fake interactive Tab stop. Current-run intervention entries are engine/snapshot state, not saved Lab records. The Intervene panel uses engine-checked copy for command paths rather than language that could imply scientific validation. It does not create a new workspace mode, mutate simulation state by itself, save intervention plans, create Lab artifacts, create Atlas discoveries, add storage, or change template/runtime behavior.

Prompt GW4 extends Atlas only. `/atlas` now renders non-persistent Discovery Atlas information architecture: evidence-state legend, sampled/unsampled explanation, model-vs-world boundary, non-persistence boundary, World/Lab relationship copy, and a conceptual scaffold labeled as not run data. Prompt GW4B audits and hardens that layer by keeping sampled evidence unresolved until source-backed Atlas records exist. It does not create a new World workspace mode, mutate simulation state, ingest active runs, save evidence records, create Lab artifacts, create behavioral landscapes, add storage, add save/map actions, or change template/runtime/Builder behavior.

Prompt GW7 extends Atlas only, and Prompt GW7B audits/hardens that slice. `/atlas` now renders behavioral-landscape vocabulary and a text-only conceptual scaffold. It explains parameter space, outcome space, sampled and unsampled areas, model regimes, transition zones, sensitivity zones, externally unvalidated areas, and future sampled landscapes without plotting data or saving anything. GW7B hardens the vocabulary copy and verifies the scaffold remains static readable content with zero local Tab stops. It does not create a new World workspace mode, mutate simulation state, ingest active runs, create run sweeps, save evidence records, create Lab artifacts, create Atlas discoveries, detect regimes, add storage, add save/map actions, or change template/runtime/Builder behavior.

Prompt GW8 extends Atlas only. `/atlas` now renders landscape probe planning vocabulary and a text-only conceptual probe-plan scaffold. It explains probe intent, candidate axes, candidate ranges, candidate outcomes, constraints, sampling intent, planned comparisons, unresolved feasibility, externally unvalidated hypotheses, non-executable plans, and future sampled probes without executing probes or saving plans. It does not create a new World workspace mode, mutate simulation state, ingest active runs, create run queues, create parameter sweeps, save probe plans, save evidence records, create Lab artifacts, create Atlas discoveries, detect regimes, add storage, add save/map/run actions, or change template/runtime/Builder behavior.

Prompt GW8B audits and hardens that Atlas-only probe planning slice. It sharpens planned comparison as not a comparison result and preserves the static, zero-Tab-stop scaffold contract without adding workspace modes, probe execution, saved plans, samples, queues, sweeps, regime detection, Lab records, Atlas discoveries, storage, runtime behavior, template behavior, or Builder execution.

Prompt UX3 does not change the workspace hierarchy. It records that Workshop currently functions as an advanced structural workbench rather than a beginner guided flow. Future UX6 may add a step-by-step Guided Builder over existing safe schema-authoring services, while the current Builder remains Advanced Builder. That future flow must not run, compile, preview, generate, or apply schemas/workspaces, and it must not execute formulas, code, scripts, rule descriptions, graph edges, or arbitrary metadata.

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
- The desktop task rail does not vertically scroll as a whole.
- The workspace context body is the one intentional vertical scroll container.
- Persistent controls live outside scrollable configuration content.
- The header no longer uses fixed `50px` height or `overflow-y: hidden`.

Do not reintroduce sticky run controls inside scrollable configuration panels.

## Responsive Behavior

Wide desktop:

- World Stage and persistent run controls occupy the dominant left area.
- Compact task navigation and one context panel remain visible on the right.
- Right inspector overlays only when a selection exists.
- Run-control dock remains visible below the main workspace row.

Medium and narrow viewports:

- The layout stacks world-first.
- The World Stage and run controls precede task navigation and task content.
- The workspace navigator becomes horizontally scrollable only at the smallest widths.
- The run dock stacks its controls into rows.
- Builder mode tabs become horizontally scrollable.
- Schema authoring stacks outline/import, form editor, and validation regions without hiding errors.
- Schema validation issue cards, copyable diagnostics, and repair controls remain in the validation region when the Builder stacks.
- Prompt 35B moves Builder stacking to `1120px`, before the three-column minimum tracks can force horizontal overflow.
- Graph View uses controls/outline, graph, and inspector columns on wide screens and stacks them at `1120px`.
- Narrow users retain the node outline, text edge list, warnings, and inspector even when the visual relationship plane is constrained.

R1 rendered this hierarchy at `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`; Start also passed at `390x844`. Browser zoom at 125% and 200% still needs a real rendered audit.

## Accessibility Behavior

- Direct World tasks use native buttons with `aria-pressed` and `aria-controls`; the secondary More tasks use a native-button menu with Arrow Up/Down, Home, End, Escape, and focus return.
- Current task is communicated by visible text, `aria-pressed`, or `aria-current`, never color alone.
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
- Prompt GW7/GW7B behavioral-landscape foundation is static Atlas-side vocabulary from `src/lib/behavioralLandscapeFoundation.ts`, audited in `docs/ui/BEHAVIORAL_LANDSCAPE_EXPLORATION_FOUNDATION_AUDIT.md`. It does not subscribe to simulation ticks, mutate active simulation state, execute Builder structures, run sweeps, persist landscape state, create Lab records, create Atlas records, or detect regimes.
- Prompt GW8 landscape probe planning foundation is static Atlas-side vocabulary from `src/lib/landscapeProbePlanningFoundation.ts`. It does not subscribe to simulation ticks, mutate active simulation state, execute Builder structures, run probes, run sweeps, create run queues, persist probe plans, create Lab records, create Atlas records, or detect regimes.

## Unresolved Limitations

- UX5B adds rendered screenshot, DOM, focus, overflow, landmark, and expanded-state Axe evidence for the shared route/disclosure architecture; it does not validate every legacy workspace task.
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

## UX5 Progressive-Disclosure Update

World, Workshop, Lab, and Atlas now share source-backed route orientation and component-local disclosure. World keeps current mode controls before capability detail. Workshop remains the Advanced Builder and retains direct access to Workspace Inspector, Author Schema, Graph View, imports/exports, validation, repairs, fit reports, scenario plans, metadata, and graph outlines. Lab and Atlas remain non-persistent conceptual routes; disclosure reorganizes their existing semantics but creates no records, maps, samples, probes, or runtime behavior.

No disclosure state is stored. Existing bounded World comparison storage, panel/avatar preferences, and Experiment Runner sweeps remain unchanged and are not reused by UX5.

## UX5B Progressive-Disclosure Audit Update

UX5B audits the shared hierarchy in source and rendered browsers. World retains direct task-mode and run-control access; Workshop retains direct access to every Advanced Builder mode and its exact structural metadata; Lab and Atlas remain conceptual and non-persistent. All 20 established route/viewport combinations pass expanded-state overflow, landmark, Axe, reduced-motion, and diagnostics checks. No production workspace defect was found, so UX5B changes no production UI or workspace state logic.

Actual browser zoom, screen-reader/assistive-technology behavior, forced-colors behavior, mobile-workflow readiness, and full WCAG conformance remain unverified. UX5B complete. UX6 followed and is now complete. GW9 remains paused.

## UX6 Guided-Builder Update

Workshop now has two real outer authoring views. Guided is the local default and provides six bounded structural steps; Advanced remains immediately available and retains Workspace Inspector, Author Schema, Graph View, exact import/export, validation assistance, fit reports, scenario planning, and the accessible graph outline. Switching views preserves mounted local work. Explicit handoff replaces only Advanced Author Schema after any required confirmation and never mutates World.

Guided state is typed, local, deterministic, and reset on reload. Start over, destination links, client-side browser Back, and Advanced overwrite are protected where meaningful data could be lost. UX6 adds no stored mode, saved draft, progression, recommendation, runtime/schema/graph execution, template/scenario/RunConfig generation, or Lab/Atlas behavior. UX6 complete.

## UX6B Guided-Builder Audit Update

UX6B preserves the two-view Workshop architecture while hardening generated note-id bounds, visible-tab focus, canceled-handoff status, responsive content flow and import visibility, unique Advanced fit-report landmarks, intentional parent scrolling for scenario plans, and a keyboard-focusable Graph sidebar. The Guided subset, Advanced ownership boundaries, active World state, storage, routes, and runtime behavior are unchanged. UX6B complete. GW9 is next. GW9 remains paused until UX6B is committed and remotely aligned.

## GW9 Atlas Preview Update

Atlas now owns one route-local, component-memory preview form and result surface. The form produces a validated request for an explicit `flocking-boids` capability; the headless executor creates fresh engines without accessing World or Experiment Runner stores. Probe-planning scaffolds remain separate and non-executable. The result is temporary, exact-coordinate only, numeric, provenance-bearing, cancellable between samples and on route unmount, and stale-aware. It creates no new route, workspace mode, store, storage key, Lab record, Atlas history, comparison entry, interpolation, or regime analysis. GW9B has audited and hardened this boundary.

## R1 Start And World-First Reset

R1 adds a product-entry layer without adding onboarding state. C1 deepens that layer with one featured implemented world, four intent paths, a compact seven-world index, `/worlds`, and seven directly linkable detail pages. The shortest path is Start -> Starter World detail -> strict World launch -> Run; users do not need to understand destination taxonomy or artifact families first.

Within World, the DOM and visual hierarchy are model surface, persistent playback controls, then the selected task workspace. At `1440x900`, the model workspace is approximately 74% of the application layout width. Setup exposes four exact existing parameters and keeps all other parameters and Scenario Builder one disclosure away. No compact control has a second default or alternate execution path.

The former Understand panel composition is replaced by a model-specific explanation. Full assumptions, limitations, appropriate/inappropriate use, ethics, validation record, and provenance remain available, but unrelated global capability boundaries do not occupy that panel. Capability guidance itself is a concise route note plus an explicit full-reference disclosure; Workshop hides the complete guidance surface behind an outer disclosure.

Atlas puts the real GW9 preview before conceptual orientation. Lab puts useful World/Compare/Atlas links before its technical foundation. Workshop keeps Guided and Advanced direct while withholding required-field error counts until an attempted progression and hiding the support matrix by default.

R1 preserves local workspace-mode state, hidden-panel rendering behavior, active World state, Atlas isolation, Builder non-execution, and existing storage semantics. The starter nudge is page-session-only and dismissible.

## R1B First-Run And Shell Audit

R1B confirms the user-facing hierarchy and hardens state recovery. A featured starter page mount creates a fresh prepared Flocking run instead of resuming prior in-memory state. Parameter controls state their immediate paused tick-0 rebuild. World task selection keeps visible task, query, current-navigation semantics, and active run state coherent. Direct task controls retain focus; More selections focus the new panel heading; each task begins at scroll origin.

The rendered desktop hierarchy remains model surface, persistent controls, then one task rail. The rail owns one intentional scroll. At responsive stack widths, `main` owns the single route scroll and model/run controls precede task content. Atlas keeps configuration first but places Run in its visible Execution Status panel. Default Understand prioritizes model-specific meaning; cross-tool boundaries remain in full notes.

R1B is complete and passed its R2 handoff. Recipe-first Builder, starter packs, persistent evidence, broader Atlas mapping, composition, multiscale runtime, adaptive-system generalization, and analytical lenses remain future milestones.

## R2 World Layout And Interaction Reclaim

R2 replaces the compressed desktop task column with three explicit owners: a `64px` or `56px` task rail, a flexible stage with attached playback, and one `290-350px` active tool. The stage and playback remain mounted outside task rendering. Changing tasks therefore preserves the active engine, stage geometry, and playback reachability.

The direct sequence is Setup, Observe, Change, Compare, Explain, and More. Setup layers four authoritative quick parameters over complete configuration; Observe leads with a bounded model-output summary; Change separates current-run commands from fresh-run rebuilds; Compare preserves existing bounded summaries and exchange; Explain puts six selected-model sections before a focus-managed full reference; More groups Experiment Runner under Investigate and Diagnostics under Inspect.

The active tool owns one intentional vertical scroll. Desktop collapse/restore hides that surface without unmounting local state. At `390x844`, World stacks stage, playback, horizontal tasks, and a bounded tool row inside the viewport; the tool, not the document, scrolls to deeper controls. This R2 behavior supersedes the earlier R1B responsive-scroll description.

R2 changes UI presentation and state coordination only. R2B audits and hardens that frame: Setup values remain drafts until explicit apply/rebuild, task clicks create same-document history entries while Back/Forward preserve the mounted stage and run, closed dialogs do not retain live children, and hidden or abandoned experiment work requests cooperative cancellation. R2B adds no simulation capability, template support, scenario, metric, intervention, comparison format, Atlas behavior, Builder behavior, route, dependency, or storage key.

## C1 Starter World Content Layer

C1 owns content discovery before World, not a new permanent World drawer. Its original `/worlds` layer provides deterministic search and bounded filters over seven validated runnable definitions. `/worlds/[slug]` introduces question, premise, represented anatomy, baseline, specific first change, outputs, research connection, one main boundary, and non-executable remix directions before launching. C2 later expands that catalog to eleven definitions.

The launch URL contains stable IDs only. World revalidates those IDs, uses existing scenario services, and creates a fresh paused tick-0 run. The existing compact context remains authoritative; a dismissible nudge supplies local Starter World context without progress, locks, storage, or task replacement.

R1 complete. R1B complete. R2 complete. R2B complete. C1 complete. C1B complete. C2 complete. C2B complete. C3: Guided Investigation / Tutorial World is next.

## C1B Starter World Content Hardening

C1B keeps Explore Worlds outside the live World task architecture and preserves the existing World shell. Canonical detail actions now navigate with only `starter=<id>`. The World route derives and revalidates template, default preset, and recommended task from the recursively frozen Starter World registry. A later ordinary World task query can change the visible task but cannot provide or override runtime identity.

The audit also aligns user-facing preset, control, and metric labels with authoritative registries; adds visible source type and relationship metadata; keeps research subordinate to action; and verifies all seven first-change paths without adding a second control system. Catalog search, filters, detail browsing, and the nudge remain URL or component-session state only. No storage key, progress model, recommendation system, profile, runtime mechanic, Builder handoff, Atlas record, or Lab record was added.

C1B final focused and complete browser verification passed. C1B is complete.

## C2 Flagship Collection Layer

C2 extends entry-side content rather than adding a permanent World tool. `/worlds` now presents one featured `Local Rules, Global Patterns` collection before the complete eleven-world catalog, and `/worlds/packs/local-rules-global-patterns` provides a directly linkable route across four model-specific questions. The collection does not track order, completion, profiles, or learning state.

Each flagship detail owns its prepared-comparison explanation. Baseline and contrast actions use strict `starter` and `recipe` IDs; World revalidates both and creates a fresh paused tick-0 scenario. The mounted World shell remains unchanged and dominant. A compact recipe nudge provides purpose, horizon, outputs, back links, and an explicit sibling link without mutating the current run or replacing the existing Compare task.

Pack, recipe, and prepared-comparison artifacts are data-only content. Derived differences describe configuration, not results. Existing comparison summaries remain bounded World-local storage and do not become curriculum progress, Lab evidence, or Atlas discovery. C2 is complete.

## C2B Flagship Collection Hardening

C2B preserves the C2 route and workspace ownership while correcting its comparison boundary. Effective scenario configuration and initialized tick-zero state are separate layers: the detail page now states material tick-zero equality and difference explicitly, including the Firebreak pair's changed fuel quantity. Matching scenario fields are no longer presented as an exhaustive claim about initialized worlds.

Explicit sibling activation still replaces the current recipe with a fresh paused tick-zero run through the same mounted World route. Focus moves to the replacement recipe context, while an existing Setup edit remains a visible draft distinct from the new active value. Existing bounded World comparisons survive unchanged; no automatic capture, progress state, Lab/Atlas record, or new storage path exists. C2B is complete. C3: Guided Investigation / Tutorial World is next and has not started.
