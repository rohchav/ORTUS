# ORTUS HCI / UX / Visual-Direction Audit

Date: 2026-06-11  
Prompt: UI-BRAND-1  
Status: source-based audit with limited rendered HTTP verification, not a formal WCAG audit

## 1. Executive Verdict

ORTUS has the right philosophical foundation for a scientific simulation workbench: it repeatedly separates templates, scenarios, snapshots, run summaries, structural artifacts, and runtime behavior. That is the hard part, and it matters more than visual polish.

The interface is also overloaded. The current shell exposes many legitimate workbench surfaces at once: template selection, file exchange, parameters, metrics, scenarios, assumptions, interventions, experiments, comparisons, timeline, notes, debug, world stage, floating overlays, and Builder. The risk is not that ORTUS looks unfinished. The risk is that users can miss which decisions affect the current run, which are fresh-run recipes, which are structural-only artifacts, and which outputs are exploratory model outputs rather than empirical evidence.

Brand integration should stay restrained. The sharp mark helps identity and fits the angular panel language. The soft mark should remain secondary. Neither mark belongs in the world viewport or Builder graph.

Recommended direction: a disciplined hybrid of Technical Systems Workbench and Scientific Instrument Interface. Use the sharp ORTUS geometry for navigation and panel discipline, but bias workflow language, status, provenance, warnings, and metrics toward scientific instrumentation.

## 2. Audit Scope

Inspected surfaces:

- Global app shell, top status bar, left instrument stack, world stage, right drawer, bottom dock, workspace mode.
- Template selection, parameter controls, simulation controls, file exchange, scenario builder, assumptions panel, interventions, experiments, run comparison, metric trace, legend, debug panel.
- Safe Builder UI Shell files added in Prompt 34.
- Global CSS, typography tokens, responsive rules, focus styles, animation/reduced-motion rules.
- Metadata and favicon/icon configuration.
- Existing component and simulation tests.
- Two supplied ORTUS PNG assets.

Out of scope:

- Runtime simulation behavior changes.
- Broad navigation redesign.
- Visual Builder execution, editing, graph programming, schema execution, or generation.
- Formal WCAG conformance certification.
- User testing.

## 3. Evidence And Limitations

Evidence:

- Source inspection of `src/app`, `src/components`, `src/state`, `src/simulation`, `src/app/globals.css`, docs, tests, and package scripts.
- PNG header and alpha-bounds inspection for `ortus-mark-sharp.png` and `ortus-mark-soft.png`.
- Visual inspection of source PNGs through local image viewer.
- Generated small-size preview grid for the sharp mark at approximately 16, 24, 32, and 48 px.
- Local Next route probe was previously available with approval for `/builder`; browser screenshot tooling is not installed in this environment.

Limitations:

- No automated browser screenshot pass was available: no Chromium, Playwright binary, `wkhtmltoimage`, or image conversion tooling was installed.
- Findings about visual overlap, target size, and responsive rendering are source-based unless explicitly marked as rendered.
- Accessibility findings are implementation-visible issues, not a formal assistive-technology audit.
- Performance findings are source and architecture risks, not profiler traces.

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
`AppShell` uses a compact header, left instrument stack, center world workspace, and overlays. `WorldStage` owns the center region and the canvas is batched rather than per-agent React components.

HCI principle:
Visual hierarchy; task focus; scientific-workbench distinction between model state and controls.

User impact:
The simulation remains the primary object of attention.

Severity:
Low positive finding.

Confidence:
High from source.

Recommended remedy:
Preserve this world-first structure when adding branding or future panels.

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
The workbench exposes too many primary surfaces at once.

Evidence:
`LeftInstrumentStack` includes Micro, Macro, Metrics, Scenario Builder, Assumptions, Interventions, Experiments, Comparisons, Timeline, Notes, and File Exchange. Header also includes file actions, template selection, seed controls, phase readout, status, and Builder link.

HCI principle:
Cognitive load; Hick-Hyman choice complexity; progressive disclosure; recognition over recall.

User impact:
New users must infer a workflow from many simultaneous panels. Experienced users may still lose track of which controls affect fresh runs, live runs, scenarios, or saved summaries.

Severity:
High.

Confidence:
High from source.

Recommended remedy:
Create a dedicated UI-remediation prompt for workflow grouping: Start/Configure, Run/Observe, Analyze/Compare, Audit/Assumptions, File/Provenance.

Effort:
L.

Timing:
Dedicated UI-remediation prompt.

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
Add a reset confirmation affordance or two-step reset for non-tick-0 runs; keep it separate from Prompt UI-BRAND-1.

Effort:
S.

Timing:
Dedicated UI-remediation prompt.

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
Add compact metric provenance labels, model-time semantics, and "model output, not empirical measurement" near chart headings.

Effort:
M.

Timing:
Dedicated UI-remediation prompt.

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
The header contains brand, Builder link, file actions, model select, seed form, phase readout, run status, warning status.

HCI principle:
Discoverability; visual hierarchy; Fitts's Law; information scent.

User impact:
Primary destinations are discoverable, but top-level workflow priority is not obvious.

Severity:
Medium.

Confidence:
High from source.

Recommended remedy:
Future prompt should separate navigation from high-frequency run controls and file exchange, or introduce a clearer workbench mode grouping.

Effort:
M.

Timing:
Dedicated UI-remediation prompt.

Finding:
The app uses a top header and a left instrument stack, not a permanent navigation sidebar.

Evidence:
`AppShell` renders `TopStatusBar`, `LeftInstrumentStack`, and `WorldStage`.

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
| 1 | Reset lacks staged/destructive-state clarity | High | S | Dedicated UI-remediation prompt |
| 2 | Metrics can be overread as empirical evidence | High | M | Dedicated UI-remediation prompt |
| 3 | Parameter changes rebuild runs but could be missed | High | M | Dedicated UI-remediation prompt |
| 4 | Too many primary surfaces visible at once | High | L | Dedicated UI-remediation prompt |
| 5 | Builder nodes/edges may still imply executable graphs | High | S | Prompt 34B audit |
| 6 | Mobile is compressed desktop | High/Medium | L | Dedicated responsive prompt |
| 7 | Scenario Builder mixes draft, preview, apply, library, import/export | High | M | Dedicated UI-remediation prompt |
| 8 | Header hierarchy is crowded | Medium | M | Dedicated UI-remediation prompt |
| 9 | Chart semantics need units/provenance/model-time labels | High | M | Dedicated UI-remediation prompt |
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

- Add visible reset text or confirmation for non-tick-0 runs.
- Add model-output note beside Metric Trace.
- Add "rebuilds run" transient notice when parameters change.
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
`UI-REMEDIATION-1: Runtime-Honest Workflow Clarity Audit + Targeted Fixes`

Scope:

- Reset confirmation/status.
- Parameter-change rebuild visibility.
- Metric provenance and model-output labeling.
- Header control hierarchy.
- Scenario/snapshot/run-summary distinction in UI.
- Builder edge/node non-execution visual language audit.

Hard boundaries:

- No simulation behavior changes.
- No schema execution.
- No Builder editing or graph execution.
- No broad redesign.
- No validation/calibration claims.

