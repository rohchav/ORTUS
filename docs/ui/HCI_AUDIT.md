# ORTUS HCI / UX / Visual-Direction Audit

Date: 2026-06-11  
Updated: 2026-06-30 after Prompt GW3 active intervention boundary and perturbation readiness
Prompt: UI-BRAND-1, UI-REMEDIATION-1, Prompt 34B, Prompt 35, Prompt 35B, Prompt 36, Prompt 36B, Prompt 37, Prompt 37B, Prompt 38, Prompt 38B, Prompt 39, Prompt 39B, Prompt F0, Prompt P0, Prompt UX0, Prompt UX1, Prompt GW0, Prompt UX2, Prompt UX2B, Prompt GW1, Prompt GW1B, Prompt GW2, Prompt GW2B, Prompt GW3, Prompt N1, Prompt N1B, Prompt NUX1, Prompt NUX1B, Prompt N2, Prompt N2B, Prompt MR0
Status: source-based audit, not a formal WCAG audit

## 1. Executive Verdict

ORTUS has the right philosophical foundation for a scientific simulation workbench: it repeatedly separates templates, scenarios, snapshots, run summaries, structural artifacts, and runtime behavior. That is the hard part, and it matters more than visual polish.

Before UI-REMEDIATION-1, the interface was also overloaded: the shell exposed many legitimate workbench surfaces at once, including template selection, file exchange, parameters, metrics, scenarios, assumptions, interventions, experiments, comparisons, timeline, notes, debug, world stage, floating overlays, and Builder. The remediation reduced the reachability defect, but the deeper risk remains: users can still miss which decisions affect the current run, which are fresh-run recipes, which are structural-only artifacts, and which outputs are exploratory model outputs rather than empirical evidence.

Brand integration should stay restrained. The sharp mark helps identity and fits the angular panel language. The soft mark should remain secondary. Neither mark belongs in the world viewport or Builder graph.

Recommended direction: a disciplined hybrid of Technical Systems Workbench and Scientific Instrument Interface. Use the sharp ORTUS geometry for navigation and panel discipline, but bias workflow language, status, provenance, warnings, and metrics toward scientific instrumentation.

UI-REMEDIATION-1 update:
The shell now uses task-oriented workspace modes instead of one permanent scrolling drawer. The confirmed clipping causes were not cosmetic: the header used fixed `50px` height plus `overflow-y: hidden`, and the timeline lived as a sticky control inside the left drawer scroll container. Both were removed. The remaining risk is interpretation and safety, not basic reachability.

Prompt 34B update:
The audit hardened the highest-confidence defects that could be fixed without a redesign: destructive Reset now uses press-and-confirm when meaningful run state exists, workspace tabs have arrow/Home/End keyboard behavior, Setup copy states that model/seed/parameter changes rebuild fresh tick-0 runs, Metric Trace carries local model-output provenance language, and Builder viewport buttons now say they select structural nodes/edges for read-only inspection. Browser screenshot, zoom, and assistive-technology verification still did not happen in this environment.

Prompt 35 update:
The Builder now separates read-only Workspace Inspector from bounded Author Schema forms. The strongest design choice is persistent refusal to equate structural validity with run readiness: status, validation, rule editing, artifact references, and export all repeat the non-runnable boundary. Draft preservation is materially safer than a naive form: mode switches do not unmount the draft, failed imports preserve work, valid dirty imports require confirmation, and destructive removal/reset/restore uses an accessible confirmation surface. The remaining weakness is evidence, not intent: no rendered narrow/short-height pass, screen-reader test, browser keyboard walkthrough, or formal accessibility audit has occurred.

Prompt 35B update:
The audit found real defects rather than treating passing source tests as proof. The three-column authoring minimum could overflow at common medium widths; confirmations were visually prominent but non-modal, so background edits could continue while a destructive replacement was pending; metadata deletion bypassed confirmation; the full validation panel was an overly broad live region; and imported non-text JSON values could be silently coerced by form editing. Prompt 35B adds an earlier stacking breakpoint, a modal focus-cycling confirmation with Escape cancellation, metadata-removal confirmation, roving tab stops, concise validation announcements, pre-read oversized-file rejection, and conservative read-only preservation for imported non-text values. Browser rendering and assistive-technology behavior remain unverified.

Prompt 36 update:
The Builder now has a dedicated Graph View for the loaded visual-workspace artifact. The design deliberately avoids editable ports, handles, drag behavior, animated wires, execution arrows, and runtime language. Node buttons, a grouped outline, and a text edge list provide redundant access to graph structure; selection feeds a read-only inspector; warning, unsupported, future-only, service-only, and missing-capability information stays textual. Visual rendering stops above 120 nodes or 240 edges and retains the outline rather than pretending an unreadable graph is useful. This is a source- and unit-tested information-visualization implementation, not a rendered graph-accessibility or mobile-polish finding.

Prompt 36B update:
The graph audit found and hardened several source-level risks: generic warning counts conflated marker counts with global runtime-boundary notices, filtered inspector links could point at hidden targets as if visible, static runtime-boundary copy used live-region semantics, Fit Graph used fixed assumed dimensions, sanitized node ids could collide, and exact required non-execution copy was incomplete. Prompt 36B separates marker/notice counts, renders filtered connections as hidden-by-filter text, changes the safety block to a note, uses actual surface dimensions for fit when available, adds collision-free DOM ids, strengthens deterministic layout and mutation-isolation tests, and locks the required copy. Browser rendering, zoom behavior, screen-reader behavior, and WCAG conformance remain unverified.

Prompt 37 update:
Author Schema validation is now more usable and more dangerous if misread. The good part: grouped issue cards expose severity, paths, original validation messages, copyable diagnostics, section jumps, manual guidance, and explicit service-only/future-only boundaries. Repair suggestions are intentionally narrow: safe edits require an explicit click, destructive/content-removing edits require confirmation, stale suggestions are rejected, and ambiguous modeling intent remains manual-only. The risk to keep watching is product language: a repaired schema is still not runnable, scientifically validated, calibrated, or semantically correct. Browser rendering, keyboard walkthrough quality, screen-reader behavior, focus-return behavior in actual browsers, and WCAG conformance remain unverified.

Prompt 37B update:
The audit found a real enforcement weakness: confirmation-required repairs were blocked by the visible UI but could still be applied by the shared repair helper. Prompt 37B moves that boundary into the helper itself, adds explicit `canApply` classification, rejects malformed and prototype-like patches, makes group order deterministic, routes unknown validation messages to a safe structural group, adds rule-repair non-execution copy, reports missing/stale focus targets, and proves export-after-repair does not carry repair UI state. This is source- and unit-tested hardening. Browser clipboard behavior, rendered responsive behavior, browser zoom behavior, focus-return behavior, screen-reader behavior, and WCAG conformance remain unverified.

Prompt N1 update:
Neural Excitation Network adds a template-specific canvas graph visualization and legend boundary notes. The UI risk is overinterpretation: a runtime graph can look like a biological connectome or a Builder graph even when it is neither. The implementation keeps graph edges read-only, canvas-only, bounded, and scoped to the Neural template; legend copy states that the runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs or model-schema graphs executable. Inspector rows expose stylized activation, threshold, refractory, and incoming signal state as model variables. Browser rendering, zoom behavior, screen-reader behavior, edge readability at different densities, and WCAG conformance remain unverified.

Prompt N1B adds an optional Neural Decision Readout panel in the Legend surface. This is a source-level implementation, not rendered UX evidence. Decision Readout V1 maps labeled output assemblies to bounded categorical choices. It is not cognition or reasoning. Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network. Template RPS payoff is observational and does not train, optimize, mutate synapses, or update biological/plasticity fields. The model does not infer intentions, beliefs, preferences, personality, or human decision-making. The panel labels output assembly activation, selected readout, and observational payoff separately from the canvas graph, which is the right direction. Remaining HCI risk is still serious: users may read “decision,” “confidence,” or “payoff” as understanding, strategy, or evidence unless future rendered testing confirms the boundary language is actually seen and understood.

Prompt NUX1 update:
Neural Runtime Lab UX V1 moves the Neural template toward a scenario-guided workbench instead of a parameter-first wall. That is directionally correct: beginner users get scenario cards, mission/status readouts, live explanations, direct actions, and an RPS shell before exact numeric configuration. The serious risk is overclaiming. The implementation keeps direct actions tied to supported template interventions, plain-English controls mapped to validated parameters, exact numeric controls behind an accessible Advanced config drawer, and event/RPS histories bounded. Required copy states that the lab shows stylized neural excitation dynamics and bounded categorical readouts, does not model cognition or biological neurons, keeps Rock-Paper-Scissors labels as designer-assigned labels, and keeps the runtime graph scoped only to the Neural template rather than Builder graphs. This is still source-tested UX, not rendered evidence; scenario-card layout, scrolling, zoom behavior, keyboard walkthrough quality, screen-reader behavior, and whether users actually understand the caveats remain unverified.

Prompt NUX1B update:
The NUX1 production-build failure was not caused by the lab code. It was a build-time dependency on remote Google font fetches through `next/font/google`; that is a bad fit for a restricted or reproducible build environment. NUX1B removes those loaders and keeps existing local/system CSS fallback stacks. The source audit adds stronger static checks for production imports, browser-free helper logic, bounded histories, explicit discarded-state copy, no unsafe HTML/dynamic import/eval path, and no test-file leakage. Rendered responsive, zoom, and assistive-technology behavior remain unverified unless directly tested.

Prompt N2/N2B update:
Neural Strategy Adaptation V1 turns the RPS shell into an Adaptive RPS Challenge with start/pause, choose Rock/Paper/Scissors, enable adaptation, reset learned strategy, clear round history, and adaptation details controls. Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference. The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time. Learned strategy state is local model state, not a psychological profile. Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning. The source-level HCI risk is still high: users may overread "learning," "confidence," "prediction," or "strategy" as mind-reading or human psychology. Prompt N2B found a real reset/truncation defect: array-index reset state could suppress new learned rounds once bounded history was full. The fix uses round-index reset guards, monotonic round numbering after history truncation, malformed-round filtering, and clearer fresh-run copy stating that local learned strategy is not cleared unless Reset learned strategy is used. The implementation counters overclaim risk with local-state caveats, random-play warnings, text-readable confidence/bias/rolling stats, visible reset/clear controls, and non-anthropomorphic explanations. Rendered responsiveness, keyboard walkthrough quality, browser zoom, screen-reader behavior, assistive-technology behavior, WCAG conformance, and whether users actually notice the caveats remain unverified until a browser/AT audit.

Prompt MR0 update:
MR0 is documentation only and adds no UI. The HCI risk is therefore future-facing rather than rendered: future decision clusters, stimulus-conditioned decisions, observed clusters, and game-decision labs can easily be misread as mind modeling, personality inference, prediction certainty, or live decision advice. The mini-roadmap requires the blunt counter-language now: decision clusters model observable state-action patterns, not thoughts; prediction outputs are probabilities, not certainties; cluster labels are assigned modeling labels, not meanings understood by the system; external stimuli are modeled inputs, not evidence of internal mental state; observed clusters are analytical groupings, not psychological profiles; blackjack work is offline simulation only, not gambling advice, live casino assistance, or wearable card-counting support; and users must not use wearable devices, camera input, or software assistance for live casino play.

Prompt 38 update:
Author Schema now includes a Schema-to-Template Fit Report panel. This is useful and risky: "closest template" and "fit score" can sound like runtime readiness or conversion. The panel counters that with persistent copy: Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models. A strong template fit does not mean a schema can run. Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents. Unsupported and lossy mappings must remain visible; they must not be silently dropped. Rule fits are structural comparisons. Rule declarations are not executed. Fit score is a structural summary, not a runtime readiness score. Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles. Builder graphs remain structural inspection views. Fit reports do not make them executable. Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability. MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report. Source/unit tests cover these boundaries; browser rendering, clipboard behavior, focus return, zoom behavior, screen-reader behavior, and WCAG conformance remain unverified.

Prompt 38B update:
The audit found one real HCI/epistemology defect: a previously generated fit report could silently track the live draft, so the interface had no honest stale-report state after edits, imports, resets, or repairs. Prompt 38B adds source-level stale tracking with the required warning: This fit report may be stale because the schema changed after it was generated. Refresh the report before using it. Invalid current drafts now disable the report instead of showing a previous valid report as if it applied. Candidate rows expose counts for matched, partial, unsupported, lossy, future-only, and runtime-gap concepts, and equal-score ranking is deterministic by score, fit label, then template id. These are source- and unit-tested improvements, not browser-rendered evidence; clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

Prompt 39B update:
Author Schema now includes a Scenario Planning From Schema panel below the fit report. This is valuable but epistemically loaded: candidate scenario questions and conceptual interventions can sound like ORTUS has produced an executable scenario or validated study design. Prompt 39 counters that with persistent copy: Scenario planning from schema is a planning aid. It does not create runnable scenarios. Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state. Scenario questions are hypotheses to explore, not predictions or validated conclusions. A scenario plan can suggest what to inspect, but it does not prove what will happen. Fit reports describe structural resemblance. Scenario plans describe possible study designs. Neither one makes a schema runnable. Conceptual interventions are not executable controls, suggested metrics are not empirical measurements, and data needs do not imply calibration. Prompt 39B hardens stale-source behavior: invalid schemas disable planning, stale fit reports disable planning until refreshed, schema changes or fit-report replacements mark existing scenario plans stale until refreshed, and copied stale reports do not present old output as current. Assumption checks identify what the modeler should clarify. They do not resolve the assumption. MR0 concepts remain future-only planning gaps, Neural Strategy Adaptation remains local to Neural Runtime Lab, and scenario planning does not provide medical/public-health prediction, weather forecasting, real-human-behavior prediction, policy recommendation, persuasion optimization, targeting logic, or gambling assistance. These are source- and unit-tested boundaries; Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.

Prompt F0 update:
F0 adds no UI. The HCI risk is future-facing: fractal metrics, Scale Lens views, network scaling plots, and trajectory motif summaries can easily be overread as proof of hidden laws, causal mechanisms, validation, or cognition. Future F-branch surfaces must keep this copy visible near outputs: Fractal and multiscale tools describe how measured structure changes across scale. They do not prove that a system is fundamentally fractal. A complex-looking, nested, branching, or irregular pattern is not automatically fractal. Visual resemblance to a fractal is not evidence of scale invariance. Coarse-graining changes what is represented. Similar aggregate behavior does not mean the underlying microstates are equivalent. Scale Lens views are analytical projections, not separate validated models. Hierarchical trajectory motifs describe repeated observable state-action sequences. They do not reveal thoughts, intentions, beliefs, personality, or subconscious mental states. Browser rendering, zoom behavior, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified because no F-branch UI exists yet.

Prompt P0 update:
P0 adds no UI. It is a product-philosophy and learning-mission document, not a progression system. The HCI risk is future-facing: Research World, discovery atlases, capability guidance, and grand challenges can easily turn into artificial locks, XP loops, streaks, completionism, or overconfident "discovery" language. Future surfaces should use P0 as a hard product test: ORTUS progression should emerge from building a capable laboratory, discovering system behavior, and reaching new modeling frontiers—not from completing a prescribed checklist. The user progresses by gaining reusable understanding and modeling capability, not by accumulating arbitrary points. Simulation output remains evidence about model behavior, not automatically evidence about the world.

Prompt UX0 update:
UX0 adds no UI. It defines ORTUS Living Systems Atlas as the future visual and interaction target: living systems observatory, scientific expedition atlas, modular research workshop, and persistent model laboratory. The important HCI correction is blunt: ORTUS should feel like a living system observed through precise scientific instruments, not a system under tactical command. Future work should retire tactical HUD framing, military/combat-console metaphors, crosshairs, targeting language, warning saturation, scan lines, permanent glow, and fake terminal affect. It should preserve hierarchy, precision, contrast, disciplined spacing, strong silhouettes, high-quality motion, dark-mode capability, and distinctive identity. UX0 does not claim rendered responsive, zoom, keyboard, screen-reader, assistive-technology, reduced-motion, or WCAG verification.

Prompt UX1 update:
UX1 adds no UI. It audits the existing source implementation before visual migration. The blunt finding is that ORTUS has useful workbench structure, but its visual system is not yet a coherent design system: global CSS variables are overloaded, raw colors repeat as coincidence rather than semantics, status/evidence states are fragmented, template accents are useful but under-governed, and dense tactical ornament remains entangled with real hierarchy. UX1 records source-visible responsive and accessibility risks only. It does not claim rendered responsive behavior, contrast, keyboard completeness, screen-reader compatibility, assistive-technology readiness, reduced-motion equivalence, or WCAG conformance.

Prompt GW0 update:
GW0 adds no UI. It is Research World product architecture, information architecture, and roadmap planning only. The HCI risk is future-facing and serious: progression can easily become XP, badges, locks, streaks, completion pressure, fake discovery states, or psychological profiling if the product language drifts. GW0 sets the blunt alternative: progress = reusable understanding + modeling capability + investigative depth, not progress = clicks + time + completed tasks. A Discovery Atlas records investigated model behavior, not certified real-world discoveries. A behavioral landscape maps what has been investigated and must not imply that unsampled regions are known. Contextual guidance may respond to model/workspace state, but it must not become psychological profiling of the user. Expert access and current `/` and `/builder` workflows must survive the future shell. GW0 does not claim rendered responsive, zoom, keyboard, screen-reader, assistive-technology, reduced-motion, or WCAG verification.

Prompt UX2 update:
UX2 adds a real semantic token foundation and migrates a bounded shared primitive set. This is useful, but it is not a rendered accessibility audit, not a Research World shell, and not runtime support. The most important correction is status semantics: a visual state must communicate whether it is operational, interaction, evidence, uncertainty, or capability state. Operational success means the requested software operation completed; it does not mean the modeled conclusion was scientifically validated. Selected is not supported, active is not validated, hovered is not important, contradicted is not failure, unresolved is not error, stale is not unsupported, planning-only is not non-runnable for the same reason, and future-only is not disabled functionality. UX2 does not claim rendered responsive, browser zoom, screen-reader, assistive-technology, forced-colors, or WCAG verification.

Prompt UX2B continuation update:
UX2B adds a dev-only Playwright/Axe rendered audit harness and tests for `/` and `/builder`, the specified viewport set, reduced-motion context, console/pageerror/hydration/asset failures, overflow checks, keyboard smoke coverage, shared primitives, status semantics, Builder badges, and Axe scans. The initial Chromium dependency blocker is resolved, and the full rendered suite now passes. The audit exposed and fixed real defects: `Paused` rendered with `data-state="idle"`, Builder fallback badges defaulted to `unverified`, `/` lacked an `h1`, and the reduced-motion harness needed explicit media emulation. This is meaningful rendered evidence for the UX2 shared foundation, but it is still not actual browser zoom verification, screen-reader verification, assistive-technology verification, forced-colors verification, complete WCAG conformance, or user-comprehension evidence. GW1/GW1B has since implemented and audited the dedicated destination shell.

Prompt GW1/GW1B update:
GW1 implements the shared World / Lab / Atlas / Workshop destination shell. The HCI win is structural clarity: `/` remains World, `/builder` remains Workshop, and Lab/Atlas become reachable future-only informational routes instead of hidden roadmap promises. The HCI risk is also obvious: a persistent shell can make Lab and Atlas feel implemented merely by existing. GW1 counters that with future-only capability status, explicit non-implementation copy, no fake experiments, no fake discoveries, no fake maps, no fake counts, no progress mechanics, and no storage. The global shell owns ORTUS identity and destination navigation; World runtime status and Builder controls remain route-specific. The rendered continuation found a real keyboard defect: the active skip link was focused while still offscreen during its reveal transition. GW1 fixes that by revealing the fixed-position skip link immediately on `:focus` and `:focus-visible`. GW1B hardens the evidence without adding product behavior: unique shell landmarks, clean destination links, exactly one current nav item, no disabled future-only nav links, no `/world` or `/workshop` aliases, query/hash route normalization, visible skip-link focus, reduced-motion focus smoke, and stricter Lab/Atlas fake-data exclusions. This is rendered smoke, source, and Axe evidence, not actual browser zoom, screen-reader, assistive-technology, forced-colors, full WCAG, or user-comprehension evidence.

Prompt GW2/GW2B update:
GW2 adds an Observe-mode Active Run Context panel in World. The HCI gain is real: current model, scenario label, seed, parameter count, runtime state, tick/time, model-output metrics, and interpretation boundary now sit near observation rather than being scattered across chrome and panels. The HCI risk is also real: provenance language can easily imply a saved record or evidence record. GW2 counters that with explicit copy that the provenance summary is not a saved experiment record, observed values are model state rather than measured real-world data, and visual patterns are evidence about the model/configuration rather than automatically about the real system. The continuation fixed a rendered focus-contract mistake: `.active-run-context` is static readable content, not a normal Tab stop, so `tabIndex={0}` was removed and the rendered test now verifies visible focus on meaningful controls around the panel. GW2B fixes a narrower honesty issue: missing snapshots now display `No snapshot` labels rather than zero-like observed values. It also hardens rendered assertions for no fake tab stop, Shift+Tab behavior, and Lab/Atlas absence. This remains Playwright/Axe smoke evidence, not screen-reader, assistive-technology, forced-colors, actual browser-zoom, full WCAG, or user-comprehension evidence.

Prompt GW3 update:
GW3 adds an Intervene-mode Intervention Readiness panel in World. The HCI gain is that registered template-owned perturbation controls, selected-target readiness, active-run intervention count, and model-response boundaries are visible near the existing intervention controls instead of left implicit. The HCI risk is high: "intervention" can sound like real-world causal power or policy effectiveness. GW3 counters that with explicit copy that readiness is not a saved intervention plan or experiment record, that intervention in ORTUS means changing or inspecting model conditions, and that a response is evidence about this model under this configuration rather than automatic proof the same intervention would work in the real system. The panel is static readable content rather than a fake Tab stop. The GW3 continuation fixed an ambiguous rendered locator and improved the selector's visible/accessibility label from `Intervention` to `Intervention type`, then verified the focused World shell test, the 30-test shell suite, and the 45-test full UI suite. Lab and Atlas copy remains future-only and explicitly denies persistent intervention records and Discovery Atlas records from intervention responses. This is source and Playwright/Axe smoke evidence, not screen-reader, assistive-technology, forced-colors, actual browser-zoom, full WCAG, or user-comprehension evidence.

## 2. Audit Scope

Inspected surfaces:

- Global app shell, top status bar, workspace mode navigator, selected context panel, world stage, right drawer, persistent run-control dock.
- Template selection, parameter controls, simulation controls, file exchange, scenario builder, assumptions panel, interventions, experiments, run comparison, metric trace, legend, debug panel.
- Safe Builder UI Shell files added in Prompt 34.
- Model Schema Authoring Forms files added in Prompt 35.
- Visual Builder Graph View components, pure graph adapter, keyboard outline, text edge list, bounded layout, and Prompt 36B source-level audit hardening.
- Schema validation assistance adapter and Author Schema validation panel changes added in Prompt 37 and hardened in Prompt 37B.
- Schema-to-template fit report adapter and Author Schema fit-report panel added in Prompt 38 and source-audited/hardened in Prompt 38B.
- Scenario planning adapter and Author Schema scenario-planning panel added in Prompt 39.
- Prompt F0 docs-only fractal and multiscale mini-roadmap. No rendered UI, Scale Lens surface, fractal metric output, generator control, network scaling plot, or trajectory motif surface exists yet.
- Prompt P0 docs-only product philosophy and learning mission. No Research World progression, mission, scoring, unlock, persistence, social, onboarding, or UI flow exists yet.
- Prompt UX0 docs-only visual direction and UX principles. No World/Lab/Atlas/Workshop shell, route, navigation, design tokens, component redesign, discovery logic, behavioral landscape, progression, icon, animation, dependency, remote font, or mockup exists yet.
- Prompt UX1 docs-only existing design-token and component audit. No CSS, production UI component, route, dependency, asset, font, token, rendered-verification, or World/Lab/Atlas/Workshop implementation exists from UX1.
- Prompt GW0 docs-only Research World progression mini-roadmap. No route, navigation, World/Lab/Atlas/Workshop shell, persistence, discovery logic, behavioral landscape, contextual guidance, progression state, notebook, saved asset, model composition, grand challenge, CSS, UI component, dependency, asset, runtime behavior, template behavior, or rendered-verification implementation exists yet.
- Prompt UX2 semantic token foundation. Shared CSS tokens and four shared primitive families are migrated, but no World/Lab/Atlas/Workshop shell, persistence, discovery logic, behavioral landscape, contextual guidance, progression state, runtime behavior, template behavior, dependency, asset, font, or rendered-verification implementation is added.
- Prompt GW1 destination shell. The shared World/Lab/Atlas/Workshop shell, `/lab`, and `/atlas` exist; persistent research data, Discovery Atlas behavior, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, dependencies, assets, and fonts do not.
- Prompt GW2 active-run provenance and observation layer. World Observe now shows live active-run context; persistent Lab records, Discovery Atlas records, saved experiments, notebooks, reusable assets, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, timestamps, random ids, storage, dependencies, assets, and fonts do not.
- Prompt GW3 active intervention boundary and readiness layer. World Intervene now shows live readiness and model-response boundaries over existing template-owned controls; saved intervention plans, persistent Lab intervention records, Discovery Atlas records, behavioral landscapes, progression, runtime behavior, template behavior, Builder execution behavior, timestamps, random ids, storage, dependencies, assets, and fonts do not.
- Neural Excitation Network template-specific canvas edge rendering, legend notes, inspector rows, and atmosphere styling added in Prompt N1.
- Neural Decision Readout Legend panel, output assembly activation bars, selected readout, and observational RPS payoff copy added in Prompt N1B.
- Neural Runtime Lab scenario cards, mission/status readouts, live explanations, direct actions, plain-English controls, Advanced config drawer, bounded timeline, and RPS shell added in Prompt NUX1.
- Neural Runtime Lab build and source-boundary hardening added in Prompt NUX1B.
- Neural Runtime Lab Adaptive RPS Challenge, bounded local strategy state, reset/clear controls, adaptation details, and source-boundary tests added in Prompt N2; reset/truncation hardening and malformed-round filtering added in Prompt N2B.
- Prompt MR0 docs-only mini-roadmap and guardrails for future template, decision-cluster, stimulus-conditioned, offline blackjack, and observed-cluster work.
- Global CSS, typography tokens, responsive rules, focus styles, animation/reduced-motion rules.
- Metadata and favicon/icon configuration.
- Existing component and simulation tests.
- Two supplied ORTUS PNG assets.

Out of scope:

- Runtime simulation behavior changes.
- Broad navigation redesign.
- Visual Builder execution, editing, graph programming, schema execution, or generation.
- Drag/drop graph authoring, node or edge mutation, force-layout animation, schema-derived workspace generation, or runtime graph execution.
- Model schema compiler/interpreter behavior, simulation preview, template/scenario/RunConfig/snapshot generation, or compatibility conversion.
- LLM repair, automatic model generation, arbitrary patch interpretation, or validation repairs that infer model behavior.
- Formal WCAG conformance certification.
- User testing.

## 3. Evidence And Limitations

Evidence:

- Source inspection of `src/app`, `src/components`, `src/state`, `src/simulation`, `src/app/globals.css`, docs, tests, and package scripts.
- PNG header and alpha-bounds inspection for `ortus-mark-sharp.png` and `ortus-mark-soft.png`.
- Visual inspection of source PNGs through local image viewer.
- Generated small-size preview grid for the sharp mark at approximately 16, 24, 32, and 48 px.
- Local Next route probe was previously available with approval for `/builder`; browser screenshot tooling is not installed in this environment.
- For UI-REMEDIATION-1, the prompt attachment directory did not contain an actual screenshot file; route availability was verified by HTTP probing and layout causes were confirmed from source/CSS.
- For Prompt 34B, HTTP route probes returned 200 for `/` and `/builder`. Local socket access required an approved unsandboxed `curl` because the sandbox blocks local sockets.
- Playwright and Axe dependencies now exist for dev audit tooling. The UX2B suite rendered `/` and `/builder` successfully. The GW1/GW1B shell suite renders `/`, `/lab`, `/atlas`, and `/builder`, including shell landmarks, destination navigation, route aliases, viewport automation, reduced-motion checks, keyboard/focus smoke coverage, status-semantic checks, shared-primitive checks, destination-shell checks, and Axe scans. GW2 extends the World shell coverage to render the Observe active-run provenance panel across the established viewport set. GW3 extends the same World shell coverage to render the Intervene readiness and boundary panel. Actual browser UI zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, complete WCAG conformance, and user-comprehension evidence remain unverified.

Limitations:

- Earlier no-browser limitations are superseded for Playwright-covered routes by the UX2B and GW1/GW1B rendered harnesses. Dedicated screenshot review, actual browser zoom, screen-reader behavior, assistive-technology behavior, forced-colors behavior, and complete WCAG conformance remain unverified.
- Findings about visual overlap, target size, and responsive rendering are source-based unless explicitly marked as rendered.
- Accessibility findings are implementation-visible issues, not a formal assistive-technology audit.
- Performance findings are source and architecture risks, not profiler traces.
- Route probes verify that pages respond; they do not verify rendered layout, zoom behavior, focus movement, or screen-reader comprehension.

## 4. Product And User-Task Model

Primary user tasks:

- Select a model template.
- Set seed and parameters.
- Run, pause, step, reset, and interpret model time.
- Inspect the world and agent state.
- Read assumptions, limitations, warnings, and validation status.
- Export/import scenarios or snapshots without confusing them.
- Build and preview initial-condition scenarios.
- Compare bounded run summaries and experiments.
- Inspect structural Builder workspaces without mistaking them for runnable models.

Core conceptual distinctions the UI must protect:

- Configuration is not execution.
- Structural validity is not runtime readiness.
- Runtime output is not empirical truth.
- Scenario is not snapshot.
- Run summary is not snapshot.
- Compatibility is not conversion.
- Builder graph is not executable dataflow.

## 5. Strongest Current UI Decisions

Finding:
The world stage is visually dominant in the desktop layout.

Evidence:
`AppShell` uses a compact header, task-mode workspace panel, center world workspace, right inspector, and a persistent run-control dock. `WorldStage` owns the center region and the canvas is batched rather than per-agent React components.

HCI principle:
Visual hierarchy; task focus; scientific-workbench distinction between model state and controls.

User impact:
The simulation remains the primary object of attention.

Severity:
Low positive finding.

Confidence:
High from source.

Recommended remedy:
Preserve this world-first structure when adding future panels.

Effort:
XS.

Timing:
Ongoing guardrail.

Finding:
Runtime-honesty language is unusually strong.

Evidence:
Docs and Builder shell repeatedly state structural-only, not runnable, no compiler, no schema execution, no social-learning artifact activation.

HCI principle:
Error prevention; match between system and real-world modeling limits.

User impact:
Reduces pseudo-ABM overreading if language remains visible near decisions.

Severity:
High positive finding.

Confidence:
High from source.

Recommended remedy:
Do not let visual polish bury this language.

Effort:
XS.

Timing:
Ongoing guardrail.

## 6. Highest-Risk HCI Violations

Finding:
The workbench previously exposed too many primary surfaces at once.

Evidence:
Before UI-REMEDIATION-1, `LeftInstrumentStack` included Micro, Macro, Metrics, Scenario Builder, Assumptions, Interventions, Experiments, Comparisons, Timeline, Notes, and File Exchange. Header also included file actions, template selection, seed controls, phase readout, status, and Builder link. After remediation, `LeftInstrumentStack` renders task modes and only the selected mode's panel group.

HCI principle:
Cognitive load; Hick-Hyman choice complexity; progressive disclosure; recognition over recall.

User impact:
New users must infer a workflow from many simultaneous panels. Experienced users may still lose track of which controls affect fresh runs, live runs, scenarios, or saved summaries.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Implemented in UI-REMEDIATION-1 as Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug modes. Continue to audit whether users understand the mode boundaries.

Effort:
L.

Timing:
Implemented, with follow-up validation still needed.

Finding:
The top header previously had a real clipping defect.

Evidence:
Before UI-REMEDIATION-1, `.top-status` used fixed `height: 50px`, `min-height: 50px`, horizontal overflow, and `overflow-y: hidden` while hosting brand, Builder, file actions, model selection, seed form, phase readout, run status, and warning state. UI-REMEDIATION-1 replaced that with grouped global/context/status regions, removed seed/export controls from the header, and removed fixed-height vertical clipping.

HCI principle:
Reachability; responsive resilience; status legibility.

User impact:
Header content no longer depends on one monitor-height assumption or hidden vertical overflow.

Severity:
High before remediation.

Confidence:
High from source.

Recommended remedy:
Do not reintroduce fixed-height crowded headers for mixed navigation, configuration, export, and status controls.

Effort:
Completed.

Timing:
UI-REMEDIATION-1.

Finding:
The bottom timeline previously had a real clipping and scroll-trap risk.

Evidence:
Before UI-REMEDIATION-1, `TimelineControlStrip` was rendered as a rail panel inside `LeftInstrumentStack`, and `.timeline-strip` used `position: sticky; bottom: 0` inside the same scroll container as configuration, scenario, experiment, and comparison tools. UI-REMEDIATION-1 moves it to a shell-level run-control dock outside the workspace context scroll region.

HCI principle:
Control persistence; scroll containment; keyboard reachability.

User impact:
Run/Pause, Step, Reset, tick/time, and speed controls remain visible and cannot cover lower workspace content.

Severity:
High before remediation.

Confidence:
High from source.

Recommended remedy:
Keep persistent run controls outside scrollable configuration/content panels.

Effort:
Completed.

Timing:
UI-REMEDIATION-1.

Finding:
Reset is easy to trigger but not visibly staged.

Evidence:
`TimelineControlStrip` uses an icon button with accessible label "Reset from current model, parameters, and seed"; no confirmation or visible consequence preview appears in the control itself.

HCI principle:
Error prevention; user control and freedom; destructive action clarity.

User impact:
Users can discard current run state accidentally, especially because scenarios, snapshots, and current run state are conceptually distinct.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Prompt 34B added press-and-confirm reset when current run state would be discarded. A true undo/recovery path remains future work.

Effort:
S.

Timing:
Prompt 34B for staged reset; future prompt for undo/recovery.

Finding:
Metrics can be mistaken for empirical measurements.

Evidence:
`MetricGraphPanel` renders metric traces and legends, but per-chart evidence disclaimers and units/provenance are limited. Docs are strong, but the chart surface itself is sparse.

HCI principle:
Metric interpretation; prevention of causal/predictive overreading; proximity of warnings.

User impact:
Users may read model output as measured evidence or validated prediction, especially in demos.

Severity:
High.

Confidence:
Medium-high from source.

Recommended remedy:
Prompt 34B added compact model-output provenance language near Metric Trace. Richer model-time and unit semantics should wait for a dedicated chart/quantity-semantics pass.

Effort:
M.

Timing:
Prompt 34B for provenance copy; future design-system/chart prompt for richer units and axis semantics.

## 6A. Prompt 34B Significant Findings

Finding:
One-click Reset was destructive for non-trivial runs.

Evidence:
`TimelineControlStrip` called `reset` directly. `simulationStore.reset()` replaces the engine with a fresh tick-0 engine from the current template, parameters, and seed, clears selection and intervention targets, clears current intervention history through the new engine, and loses current metric history.

HCI principle:
Error prevention; destructive action clarity; user control and freedom.

User impact:
A user could accidentally discard the current run while thinking Reset was a reversible view action.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Use staged confirmation when tick, metric history, or intervention history indicates meaningful state.

Effort:
S.

Timing:
Prompt 34B.

Status:
Fixed for non-trivial run state with press-and-confirm reset. No undo stack was added.

Finding:
Workspace tabs used tab roles without tab-style keyboard behavior.

Evidence:
`LeftInstrumentStack` used `role="tablist"` and `role="tab"` but only click handlers before Prompt 34B.

HCI principle:
Keyboard accessibility; semantic consistency; focus predictability.

User impact:
Keyboard users could tab through controls, but arrow-key expectations for tabs were not met.

Severity:
Medium.

Confidence:
High from source.

Recommended remedy:
Add Arrow Left/Right/Up/Down plus Home/End navigation and move focus to the selected tab.

Effort:
S.

Timing:
Prompt 34B.

Status:
Fixed in source and covered by focused tests. This is still not a screen-reader audit.

Finding:
Metric Trace lacked local provenance language.

Evidence:
`MetricGraphPanel` previously displayed a chart or empty-state text without saying the trace is model-output history over simulated ticks.

HCI principle:
Proximity of warnings; metric interpretation; prevention of empirical overclaiming.

User impact:
Users could read chart traces as empirical measurement, calibrated probability, or validation evidence.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Add compact provenance language near the chart and distinguish current Macro values from historical traces.

Effort:
S.

Timing:
Prompt 34B.

Status:
Partially fixed. The chart now says it is bounded model-output history over simulated ticks, not empirical measurement, calibrated probability, or validation evidence. Richer units/quantity semantics remain future work.

Finding:
Builder graph controls risked looking executable.

Evidence:
Builder viewport nodes and edge-list rows were buttons, while safety language lived mostly in the header, inspector, and validation panel.

HCI principle:
Affordance clarity; prevention of mode errors; runtime honesty.

User impact:
Users could mistake selecting a graph item for executing or activating a node/edge.

Severity:
High.

Confidence:
Medium-high from source; rendered user perception remains untested.

Recommended remedy:
Keep buttons but label them as read-only structural inspection controls.

Effort:
S.

Timing:
Prompt 34B.

Status:
Fixed in accessible labels and edge-list visible text. A broader visual-language study is still needed.

Finding:
Rendered responsive and zoom behavior remains unverified.

Evidence:
The app responded with HTTP 200 on `/` and `/builder`, but this environment lacks Chromium, Chrome, Firefox, `wkhtmltoimage`, and Playwright.

HCI principle:
Evidence labeling; responsive resilience; accessibility humility.

User impact:
Source/CSS can prevent obvious defects, but it cannot prove 125%, 150%, or 200% zoom readability, actual overlap, or keyboard task success.

Severity:
High for claims, medium for current implementation risk.

Confidence:
High.

Recommended remedy:
Run a dedicated rendered responsive and accessibility pass with browser tooling before claiming mobile or WCAG readiness.

Effort:
M.

Timing:
Next UI/design-system prompt.

Status:
Unverified.

## 7. Product Identity And Branding Findings

Finding:
Before this prompt, ORTUS identity was text-only and easy to miss.

Evidence:
`TopStatusBar` used a text `brand-mark` and descriptor. No image asset or reusable brand component existed.

HCI principle:
Information scent; global orientation; consistency.

User impact:
Users could identify the app name, but the brand lacked a stable visual anchor.

Severity:
Medium.

Confidence:
High from source.

Recommended remedy:
Use the sharp mark plus text wordmark in the persistent top header. Keep descriptor restrained.

Effort:
S.

Timing:
Fix during logo integration.

Finding:
The descriptor must not overclaim.

Evidence:
Existing descriptor used "Complex Systems Observatory"; repo README says "visual modeler." The prompt suggests "Complex Systems Workbench."

HCI principle:
Match between system and real-world capability; runtime honesty.

User impact:
"Workbench" is safer than language that implies empirical observation or validation.

Severity:
Medium.

Confidence:
Medium.

Recommended remedy:
Use `Complex Systems Workbench`.

Effort:
XS.

Timing:
Fix during logo integration.

Answers:

- Is it immediately clear what ORTUS is? Partially. The name is visible; the scientific-workbench purpose still requires surrounding context.
- Does the logo help communicate identity? Yes, as a sharp technical mark. It does not by itself explain ABM or complex systems.
- Is the descriptor accurate? `Complex Systems Workbench` is accurate enough and avoids predictive claims.
- Does branding consume too much room? With header sizing only, no.

## 8. Global Navigation Findings

Finding:
Navigation is stable but crowded.

Evidence:
Before UI-REMEDIATION-1, the header contained brand, Builder link, file actions, model select, seed form, phase readout, run status, and warning status. After remediation it contains brand, Simulate/Builder global navigation, current model, scenario, workspace mode, and compact run status.

HCI principle:
Discoverability; visual hierarchy; Fitts's Law; information scent.

User impact:
Primary destinations are discoverable, but top-level workflow priority is not obvious.

Severity:
Medium.

Confidence:
High from source.

Recommended remedy:
Completed for UI-REMEDIATION-1. Keep exports and seed editing out of the primary header unless a future design prompt adds a deliberate menu.

Effort:
M.

Timing:
Implemented, with visual validation still needed.

Finding:
The app now uses a top header and task-mode workspace navigator.

Evidence:
`AppShell` renders `TopStatusBar`, `LeftInstrumentStack` as a mode navigator/context panel, `WorldStage`, `RightContextDrawer`, and `TimelineControlStrip` as a persistent dock.

HCI principle:
Spatial consistency.

User impact:
The top-left header is the correct canonical brand location.

Severity:
Low positive finding.

Confidence:
High from source.

Recommended remedy:
Keep one canonical full brand lockup in the header. Use compact mark-only only when necessary.

Effort:
XS.

Timing:
Fix during logo integration.

## 9. Simulation-Control Findings

Finding:
Run, pause, step, and reset are accessible by label but compact in visible form.

Evidence:
`IconButton` receives labels, but visible controls are symbols: play/pause, arrow, reset.

HCI principle:
Recognition over recall; affordances; error prevention.

User impact:
Screen readers get labels, but sighted first-time users must learn icon meanings.

Severity:
Medium.

Confidence:
High from source.

Recommended remedy:
Add visible text labels at wider widths or tooltips/help text; add confirmation for reset.

Effort:
S.

Timing:
Dedicated UI-remediation prompt.

Finding:
Parameter changes are honestly described but still live-rebuild the run.

Evidence:
`ParameterPanel` states controls rebuild the current run through validation. `setParameter` replaces the engine.

HCI principle:
Feedback; conceptual model; distinction between configuration and execution.

User impact:
This is safer than silent mutation, but users may not notice that changing a slider restarts/rebuilds the run.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Prominently label fresh-run-only or rebuild behavior near controls and show a transient status when the run is rebuilt.

Effort:
M.

Timing:
Dedicated UI-remediation prompt.

Answers:

- Run/Pause/Step/Reset states are accessible but not visually self-explanatory enough.
- Seed is visible in the header and debug panel.
- Disabled controls are not consistently explained.
- Units and parameter ranges are partially visible; full quantity semantics are not runtime-enforced.
- Structural artifact activation risk is mostly controlled in Builder, but less obvious in file/scenario surfaces.

## 10. World-Viewport Findings

Finding:
The world is correctly dominant, but overlays can compete.

Evidence:
`Legend`, floating `DebugPanel`, error banner, and right drawer can occupy world space.

HCI principle:
Inattentional blindness; visual hierarchy; interruption management.

User impact:
When debug or inspector is open, world interpretation may be partially obscured.

Severity:
Medium.

Confidence:
Medium-high from source.

Recommended remedy:
Use explicit overlay placement rules and collision avoidance in a later prompt.

Effort:
M.

Timing:
Dedicated UI-remediation prompt.

Finding:
The logo must not enter the world viewport.

Evidence:
World stage already has template background and model graphics; logo geometry could resemble a path, boundary, or graph edge.

HCI principle:
Avoid false signifiers; model interpretability.

User impact:
A watermark would risk being mistaken for model structure.

Severity:
Critical if violated.

Confidence:
High.

Recommended remedy:
Keep brand only in shell/header/loading/empty states, not world stage.

Effort:
XS.

Timing:
Fix during logo integration.

Answers:

- World is visually dominant enough on desktop.
- Side panels reduce width but remain outside the world stage.
- Zoom/pan discoverability is unclear from source.
- Legends exist, but high-density readability remains a future evaluation item.
- Selection should not rely only on color; current implementation needs a dedicated interaction audit.

## 11. Scenario And Parameter Findings

Finding:
Scenario Builder is conceptually honest but dense.

Evidence:
The panel explains scenarios vs snapshots and validates imports, but it contains many controls, library actions, preview behavior, import/export, and variant options.

HCI principle:
Progressive disclosure; working-memory burden; error diagnosis and recovery.

User impact:
Users may confuse draft scenario, active run, preview, saved library item, imported JSON, and exported JSON.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Split scenario workflow into Draft, Preview, Apply, Library, Import/Export sections with stronger status and provenance.

Effort:
M.

Timing:
Dedicated UI-remediation prompt.

Finding:
Parameter grouping is template-defined but visually flat.

Evidence:
`ParameterPanel` maps definitions linearly.

HCI principle:
Gestalt grouping; recognition over recall.

User impact:
Users must scan all parameters even when some are setup-only, behavior-specific, or live-sensitive.

Severity:
Medium.

Confidence:
High from source.

Recommended remedy:
Group parameters by setup, dynamics, environment, behavior mode, and interventions where metadata supports it.

Effort:
M.

Timing:
Long-term design-system work.

## 12. Metrics And Evidence Findings

Finding:
Metric charts need stronger labels and provenance.

Evidence:
`MetricGraphPanel` uses an SVG with an accessible image label, but chart axes, units, and model-time semantics are minimal.

HCI principle:
Measurement clarity; provenance; metric interpretation.

User impact:
Users may overread trends as empirical evidence or causal proof.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Add metric definition snippets, units where available, model-time note, and "model output" status near charts.

Effort:
M.

Timing:
Dedicated UI-remediation prompt.

Finding:
Current and historical values are present but not fully differentiated.

Evidence:
Macro/Micro panels show current values, Metric Trace shows history, Run Comparison shows bounded summaries.

HCI principle:
Distinction between current state and historical results.

User impact:
A user may mix live state, metric history, run summary, and experiment result.

Severity:
Medium.

Confidence:
Medium.

Recommended remedy:
Use consistent chips: Live run, Metric history, Saved summary, Experiment result.

Effort:
S.

Timing:
Dedicated UI-remediation prompt.

## 13. Builder-Workspace Findings

Finding:
The Builder shell strongly preserves "structural only / not runnable."

Evidence:
`BuilderHeader` and view-model badges include Structural only, Not runnable, No compiler, No schema execution.

HCI principle:
Error prevention; constraints; scientific-workbench distinction between valid and runnable.

User impact:
Good. This is the correct first UI step.

Severity:
High positive finding.

Confidence:
High from source and tests.

Recommended remedy:
Keep these badges persistent. Do not move them behind a collapsed panel.

Effort:
XS.

Timing:
Prompt 34B audit.

Finding:
Nodes can still visually resemble executable blocks.

Evidence:
Viewport renders node cards and edge lines. Even with labels, many users associate node graphs with execution.

HCI principle:
Affordances; false signifiers; conceptual model.

User impact:
Users may assume edges are dataflow and nodes are executable blocks.

Severity:
High.

Confidence:
High inferred from common graph UI conventions and source.

Recommended remedy:
Keep text edge list, badges, and read-only labels; consider non-dataflow visual styling and stronger "descriptor" vocabulary.

Effort:
S.

Timing:
Prompt 34B audit.

Answers:

- `Structural only / Not runnable` is persistently visible.
- Nodes could still be mistaken for executable blocks.
- Edges could still be mistaken for dataflow.
- Statuses are text-labeled, not color-only.
- Builder is now part of ORTUS branding and should not get a separate logo.

## 14. Accessibility Findings

Finding:
Focus visibility exists for many controls but did not cover anchors before this prompt.

Evidence:
Global CSS targeted buttons, inputs, selects, textareas, and canvas. Links had local focus in some places but not a global rule.

HCI principle:
Keyboard operation; visible focus.

User impact:
Keyboard users need visible focus on brand and navigation links.

Severity:
Medium.

Confidence:
High from source.

Recommended remedy:
Add global `a:focus-visible`.

Effort:
XS.

Timing:
Fix during logo integration.

Finding:
Continuous animation exists but reduced-motion is handled globally.

Evidence:
`signalSweep` and `signalJitter` animations exist. `prefers-reduced-motion: reduce` reduces animation duration and iteration.

HCI principle:
Reduced motion; interruption management.

User impact:
Good baseline, but warning jitter may still be distracting.

Severity:
Low.

Confidence:
High from source.

Recommended remedy:
Audit warning animation in a dedicated accessibility pass.

Effort:
S.

Timing:
Dedicated UI-remediation prompt.

Finding:
Icon-only controls have accessible labels but limited visual labels.

Evidence:
`IconButton` uses `aria-label`; visible text is only symbols.

HCI principle:
Recognition over recall; screen-reader comprehensibility.

User impact:
Screen-reader path is better than visual novice path.

Severity:
Medium.

Confidence:
High.

Recommended remedy:
Use text labels or tooltips for primary controls at wider widths.

Effort:
S.

Timing:
Dedicated UI-remediation prompt.

## 15. Responsive / Mobile Findings

Finding:
Mobile layout is mostly compressed desktop, not a mobile-first workflow.

Evidence:
At max-width 980px, header becomes a one-column scrollable area and layout stacks left instruments above world.

HCI principle:
Responsive task fit; progressive disclosure.

User impact:
Core workflow remains technically available, but the world may lose dominance and controls become a long scroll.

Severity:
High for mobile use, medium for desktop-first workbench.

Confidence:
High from CSS.

Recommended remedy:
Create a mobile/narrow workflow prompt with mode tabs: Configure, Run, Inspect, Analyze.

Effort:
L.

Timing:
Dedicated UI-remediation prompt.

Finding:
Header overflow is handled by scrolling rather than prioritization.

Evidence:
`.top-status` has horizontal overflow on desktop and vertical overflow on narrow widths.

HCI principle:
Information hierarchy; Fitts's Law; spatial consistency.

User impact:
Controls stay reachable but hierarchy degrades.

Severity:
Medium.

Confidence:
High from CSS.

Recommended remedy:
Prioritize brand, model, run status, and playback; move file exchange and secondary controls into a menu/drawer later.

Effort:
M.

Timing:
Dedicated UI-remediation prompt.

## 16. UI-Performance Findings

Finding:
Several panels subscribe directly to high-frequency snapshot state.

Evidence:
Metric graph, macro/micro panels, debug, legend, and world-related panels read `latestSnapshot` or engine/debug state.

HCI principle:
Responsiveness; interruption management.

User impact:
At high tick rates, non-world panels may rerender more often than necessary.

Severity:
Medium.

Confidence:
Medium from source; needs profiling.

Recommended remedy:
Add selector-level memoization and update throttling for analysis panels where feasible.

Effort:
M.

Timing:
Long-term performance/UI prompt.

Finding:
Metric chart recomputes SVG points from recent history on render.

Evidence:
`MetricGraphPanel` slices history and builds polyline strings.

HCI principle:
Efficiency; visual stability.

User impact:
Likely fine now, but may become visible overhead with more metrics/history.

Severity:
Low-medium.

Confidence:
Medium.

Recommended remedy:
Memoize chart data and cap visible metrics explicitly.

Effort:
S.

Timing:
Dedicated UI-remediation prompt.

Finding:
Branding should not add runtime overhead.

Evidence:
Brand component imports no simulation state and uses static public PNGs.

HCI principle:
Performance; architecture separation.

User impact:
Good. Branding does not subscribe to ticks.

Severity:
Positive finding.

Confidence:
High from source.

Recommended remedy:
Keep it that way.

Effort:
XS.

Timing:
Ongoing guardrail.

## 17. Visual-Consistency Findings

Finding:
The angular UI language matches the sharp mark.

Evidence:
Corner panels, clipped controls, sharp stage frame, and technical typography align with the primary mark geometry.

HCI principle:
Consistency; visual hierarchy.

User impact:
The mark can clarify identity without new decoration.

Severity:
Low positive finding.

Confidence:
High.

Recommended remedy:
Use the mark sparingly; do not repeat it as a motif in panels.

Effort:
XS.

Timing:
Fix during logo integration.

Finding:
The palette is not generic cold enterprise blue, but cyan logo can pull attention.

Evidence:
Current palette uses graphite, off-white, acid green, vermilion, cobalt/violet. Logo uses bright cyan.

HCI principle:
Preattentive cues; color role consistency.

User impact:
If cyan spreads into UI status language, it may compete with existing accent semantics.

Severity:
Medium.

Confidence:
Medium.

Recommended remedy:
Keep cyan mostly inside the mark. Do not make it the general action/status color without a design-system prompt.

Effort:
XS.

Timing:
Ongoing guardrail.

## 18. Branding-Integration Findings

Logo asset observations:

- Original sharp filename discovered: `sharp_edge_logo.png`.
- Original soft filename discovered: `soft_edge_logo.png`.
- Canonical sharp path: `public/branding/ortus-mark-sharp.png`.
- Canonical soft path: `public/branding/ortus-mark-soft.png`.
- Sharp PNG: 451 x 442 RGBA; visible alpha bounds approximately 408 x 408; transparent padding left 19, top 20, right 24, bottom 14.
- Soft PNG: 465 x 462 RGBA; visible alpha bounds approximately 409 x 409; transparent padding left 26, top 27, right 30, bottom 26.

Finding:
The sharp mark is appropriate for primary navigation.

Evidence:
Its angular geometry matches the existing clipped panels and technical shell.

HCI principle:
Consistency; brand recognition.

User impact:
Improves orientation without changing workflow.

Severity:
Medium positive finding.

Confidence:
High.

Recommended remedy:
Use sharp mark in header next to text `ORTUS`.

Effort:
S.

Timing:
Fix during logo integration.

Finding:
The soft mark should stay secondary.

Evidence:
Its curves do not match the angular workbench as strongly and could become a competing identity.

HCI principle:
Consistency; error prevention in brand identity.

User impact:
If used as a coequal nav logo, ORTUS would look less coherent.

Severity:
Medium.

Confidence:
High.

Recommended remedy:
Use soft mark only in loading or restrained empty/presentation states.

Effort:
XS.

Timing:
Fix during logo integration.

Favicon decision:

The sharp mark is not replacing favicon metadata in this prompt. Generated small-size preview shows the 16 px version becomes a thin abstract cyan stroke. It is somewhat clearer at 32 and 48 px, but not enough to claim a dedicated optimized favicon exists. Favicon replacement remains future work until small-size legibility is deliberately optimized.

## 19. Visual-Style Options

### Direction A - Technical Systems Workbench

Strengths:
Matches the sharp mark, current angular panels, and high-density modeling surface.

Risks:
Can become harsh, overly dense, and dashboard-like if every element uses hard edges and signal styling.

ORTUS fit:
Strong.

Implementation cost:
Medium, because the current UI already leans this way.

Affected components:
Header, panels, controls, Builder, metric/chart language.

Builder-workspace suitability:
Strong if graph execution cues are suppressed.

### Direction B - Scientific Instrument Interface

Strengths:
Best supports provenance, model-time clarity, warning semantics, metric interpretation, and runtime honesty.

Risks:
Can become dry or bureaucratic if every control gets explanatory text.

ORTUS fit:
Very strong as a governing discipline.

Implementation cost:
Medium-large, because it requires status and evidence semantics across panels.

Affected components:
Metrics, controls, assumptions, scenario builder, debug, run comparison.

Builder-workspace suitability:
Strong, especially for structural-only status.

### Direction C - Graphic Complex-Systems Studio

Strengths:
Could make template worlds more expressive and appealing.

Risks:
Highest risk of decorative pseudo-science, visual overreading, and branding competing with model content.

ORTUS fit:
Useful only as a restrained layer around template visuals, not as global UI strategy.

Implementation cost:
Large.

Affected components:
World backgrounds, template cards, landing/empty states, charts.

Builder-workspace suitability:
Weak unless heavily constrained.

## 20. Recommended Visual Direction

Recommended direction:
A disciplined hybrid: Technical Systems Workbench structure plus Scientific Instrument Interface semantics.

Reason:
ORTUS needs to look technically coherent, but the product risk is epistemic, not decorative. The interface must make model scope, runtime state, assumptions, validation limits, seeds, and provenance more obvious than visual flair.

Implementation posture:

- Keep the sharp mark and angular shell.
- Keep the world as the primary visual focus.
- Keep cyan mostly inside the brand mark.
- Use acid green for action/status only where already established.
- Strengthen model-output and validation-warning language near charts and controls.
- Make workflow modes clearer before adding more panels.

## 21. Prioritized Remediation Backlog

| Priority | Finding | Severity | Effort | Timing |
| --- | --- | --- | --- | --- |
| 1 | Reset lacks staged/destructive-state clarity | High | S | Fixed in Prompt 34B for non-trivial run state; undo remains future |
| 2 | Metrics can be overread as empirical evidence | High | M | Partially fixed in Prompt 34B; richer units remain future |
| 3 | Parameter changes rebuild runs but could be missed | High | M | Partially fixed in Prompt 34B with explicit Setup copy |
| 4 | Too many primary surfaces visible at once | High | L | Dedicated UI-remediation prompt |
| 5 | Builder nodes/edges may still imply executable graphs | High | S | Partially fixed in Prompt 34B; rendered perception remains untested |
| 6 | Mobile is compressed desktop | High/Medium | L | Dedicated responsive prompt |
| 7 | Scenario Builder mixes draft, preview, apply, library, import/export | High | M | Dedicated UI-remediation prompt |
| 8 | Header hierarchy is crowded | Medium | M | Dedicated UI-remediation prompt |
| 9 | Chart semantics need units/provenance/model-time labels | High | M | Provenance copy added in Prompt 34B; unit semantics remain future |
| 10 | Panel subscriptions may cause avoidable rerenders | Medium | M | Long-term performance/UI prompt |

## 22. Quick Wins

Applied or safe in this prompt:

- Add sharp ORTUS mark plus wordmark to top header.
- Use soft mark only in hydration/loading state.
- Use same ORTUS brand in Builder header.
- Add global anchor focus-visible styling.
- Keep logo out of world and Builder viewport.
- Preserve no-favicon-change decision.

Recommended next quick wins, not implemented here:

- Add transient rebuild notices if the UI later gains reliable pending/change-state detection.
- Add visible tooltips/help text for playback icons.

## 23. Deferred Architectural Changes

Deferred intentionally:

- Navigation regrouping.
- Mobile workflow redesign.
- Scenario Builder workflow split.
- Metric chart provenance system.
- Overlay collision management.
- Builder graph visual-language redesign.
- Design-token overhaul.
- Favicon redesign.
- Any runtime Builder execution or schema execution.

## 24. Questions Requiring User Research

- Do users understand "scenario" versus "snapshot" after one task?
- Do users notice parameter changes rebuild the run?
- Do users read Builder nodes as executable even with "read-only" labels?
- Which panels do users need during the first five minutes?
- Are users interpreting metric traces as empirical measurements?
- Does the angular visual language feel precise or noisy?
- Is mobile use a real target or only a narrow-window fallback?

## 25. What This Audit Cannot Conclude

This audit cannot conclude:

- Full WCAG compliance.
- Actual screen-reader comprehension.
- Actual keyboard-only task success.
- Real user comprehension of scenario/snapshot/run distinctions.
- Runtime performance under all user workflows.
- Visual overlap in every viewport.
- Scientific validity, calibration, or empirical accuracy.

No model output is empirical truth merely because the UI is polished.

## 26. Recommended Next UI Prompt

Recommended prompt:
`UI-DESIGN-SYSTEM-1: Rendered Responsive, Typography + Visualization Accessibility Audit`

Scope:

- Install or provide browser inspection tooling and capture desktop, short-height, medium, narrow, and 125%/150%/200% zoom evidence.
- Audit typography scale, dense uppercase usage, focus visibility, target sizes, and scroll behavior against actual rendered screens.
- Audit canvas state encoding for color-independent interpretation and agent-label density.
- Extend metric chart semantics only where template metric definitions provide real units or quantity metadata.
- Revisit Scenario Builder workflow splitting and header density using rendered evidence.

Hard boundaries:

- No simulation behavior changes.
- No schema execution.
- No Builder editing or graph execution.
- No broad redesign.
- No validation/calibration claims.
