# ORTUS Workspace Information Architecture

Date: 2026-06-12  
Prompt: UI-REMEDIATION-1  
Status: implemented as a source-level UI layout remediation; rendered screenshot tooling was unavailable in this environment

## Problem

The previous simulation shell put nearly every tool into one long left drawer: Micro Field, Macro Field, Metric Trace, Scenario Builder, Assumptions, Interventions, Experiment Runner, Run Comparison, Timeline, Field Notes, and File Exchange. That was not a workspace architecture. It forced users to scan unrelated tasks, made lower content vulnerable to clipping, and mixed setup, execution, observation, analysis, export, and debug controls.

Two concrete layout defects were confirmed from source:

- The top status header used a fixed `50px` height with `overflow-y: hidden`, so crowded header content could be clipped at the lower edge.
- The timeline controls were rendered inside the same vertically scrolling left drawer and styled as `position: sticky; bottom: 0`, so they competed with drawer scrolling and could cover or clip lower drawer content.

The attachment directory for this prompt did not include a screenshot file, and local browser screenshot tools were not installed. Route availability was verified through HTTP probing, and clipping causes were confirmed from source and CSS.

## New Hierarchy

ORTUS now uses three levels:

- Global destinations: Simulate and Builder.
- Simulation workspace modes: Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug.
- Panels inside the selected mode.

The World Stage remains mounted while the user changes simulation workspace modes. Workspace mode selection is local React UI state in `AppShell`; it is not simulation state and does not reset, regenerate, or mutate the engine.

## Feature Mapping

- Setup: Run Settings, model template selection, seed controls, parameter controls, Scenario Builder.
- Understand: Assumptions + Limits, Field Notes.
- Observe: Macro Field, Micro Field, Metric Trace, Legend.
- Intervene: Interventions.
- Experiment: Experiment Runner.
- Compare: Run Comparison, Scenario/Snapshot Exchange.
- Debug: Debug diagnostics and performance counters.
- Persistent dock: Run/Pause, Step, Reset, tick, model time, speed.
- Right context drawer: selected entity inspection.

Service-only primitives are not exposed as runnable controls by this IA change.

## Header

The top header now contains:

- ORTUS brand.
- Global route links for Simulate and Builder.
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

Reset is still a one-click reset from current model, parameters, and seed. That remains a red-flag candidate for a later safety prompt because non-tick-0 reset can discard current run state.

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

This is a source/CSS implementation. Browser zoom at 125% and 200% still needs a real rendered audit.

## Accessibility Behavior

- Workspace modes use semantic tab controls with `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and a `role="tabpanel"` context panel.
- Current mode is communicated by text and ARIA state.
- Run controls have visible text labels and accessible names.
- The header and dock state use text, not color alone.
- Focus styles remain global through existing focus-visible CSS.

This is not a formal WCAG conformance claim.

## State Separation

- Workspace mode lives in local React state.
- Workspace navigation does not import `SimulationEngine`, subscribe to snapshots, or mutate the simulation store.
- Hidden workspace panels are not rendered, reducing tick-driven subscriptions from inactive Macro, Metric, Debug, Experiment, and Comparison panels.
- The world renderer and simulation stepping loop are unchanged.

## Unresolved Limitations

- No browser screenshot/DOM measurement pass was possible in this environment.
- Reset still lacks a staged confirmation.
- Metric traces still need stronger units/provenance and "model output, not empirical measurement" labeling.
- Canvas agent states still rely partly on color/glyph conventions and need a dedicated visualization accessibility pass.
- The dense technical visual language still needs a broader design-system pass.
- Pending-change detection is not implemented because the current runtime immediately rebuilds for template, seed, and parameter changes.

## Future Design-System Work

A dedicated visual design-system prompt is still recommended after Prompt 34B. It should address typography scale, color-independent state encoding, chart semantics, reset confirmation, responsive screenshot testing, keyboard walkthroughs, and zoom behavior without changing simulation semantics.
