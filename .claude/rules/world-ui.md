---
paths:
  - "src/app/world/**"
  - "src/components/World*.tsx"
  - "src/components/SimulationCanvas.tsx"
  - "src/components/ExperimentPanel.tsx"
  - "src/components/ScenarioBuilderPanel.tsx"
  - "src/components/runtime/**"
  - "src/components/immersive/**"
  - "src/lib/immersiveWorld/**"
  - "src/state/**"
---

# World workspace and immersive presentation

## Layout and tasks
- The world viewport is the primary visual focus and stays structurally dominant. World Stage and persistent playback stay mounted outside task rendering and outside every scrollable configuration panel. Task switching preserves active runtime state and stable desktop stage geometry.
- Direct World tasks are Setup, Observe, Change, Compare, and Explain. Experiment Runner and Diagnostics sit under More. These labels do not change workspace-mode or runtime semantics. Organize tools by user task and workflow stage rather than one permanent drawer, and distinguish setup, execution, observation, intervention, experimentation, and comparison.
- Keep one bounded active-tool scroll region, and reset its scroll when the task changes. Direct task controls keep focus; choosing a More task moves focus to the panel heading. Research-tools and More menus stay deterministic under rapid Arrow input and Escape/reopen, and never focus unmounted content.
- The visible task, the `task` query, the top-navigation current state, and the task heading stay coherent. Task query changes create same-document history entries, and Back/Forward preserves the mounted stage and active run.
- Full model references and technical run details open in focus-managed modals instead of shrinking the live stage.
- World runtime controls stay in World; Builder controls stay in Workshop. Builder navigation is distinct from simulation actions.

## Setup, Change, and destructive actions
- Setup parameter and seed edits are drafts until an explicit Apply/Rebuild, which produces a fresh paused tick-0 run. Show exact active values, keep unrelated drafts across a rebuild, and never let blur or task navigation replace the active engine. Compact Setup controls use the same authoritative parameter definitions and executed values as All parameters.
- Change actions act on the current run and stay visibly distinct from Setup rebuilds.
- Destructive run controls state what is discarded and use staged confirmation when non-trivial run state exists.

## Observe, Change, Compare, Explain
- Active-run provenance and observations belong only in World Observe. They describe the current model configuration and state, not saved experiments or measured data. Without a current snapshot, show missing-snapshot labels, never fabricated zero values. Paused is an operational state.
- Intervention readiness belongs only in World Change and derives only from registered template-owned intervention definitions, the selected target, engine presence, and the current-run intervention count. Current-run intervention history is engine and snapshot state, not a saved plan. Snapshot export may carry that history; scenario export does not claim mid-run replay.
- Run comparison keeps bounded summaries (`ortus.runComparison.v1`) for local comparison, not full snapshots, Lab evidence, or Atlas storage. Experiment Runner sweeps are bounded local model-comparison tooling, not Atlas sampling or regime detection.
- Explain (Understand) stays model-specific: selected-model questions, mechanisms, assumptions, and limitations first. Complete notes, exact parameters, scenarios, and diagnostics stay one disclosure or navigation away.
- Scenario Builder scenarios are initial-condition and template-defined variant recipes, not snapshots or run summaries. Preview and apply create fresh engines.

## Immersive presentation
- Every immersive view reads the authoritative template runtime through a canonical snapshot or an audited bounded projection. Adapters contain no model rules, mutate nothing, and imply no cross-template support. The generic scene-adapter base is an interface boundary only.
- Camera, hover, selection, focus, pointer presence, tool state, and output lenses are presentation state. They never change ticks, parameters, metrics, RNG, snapshots, scenarios, comparisons, or persistence. System, Local, and Follow are camera modes, not scale, point of view, or perception.
- Interaction semantics are Navigate, Inspect, and Measure; the retired God-Hand metaphor implies no grab, force, or control. Perturbation happens only through template-defined interventions.
- Overlays separate snapshot-derived information from decoration. Never invent collisions, wind, forces, terrain, emotions, intent, awareness, or relationships the runtime does not expose; a proximity query is not a relationship or causal edge.
- Automatic quality is presentation-only: it may cap DPR and reduce grid, shadows, strokes, trails, and effects, never agent count, steps, rules, RNG, metrics, or fidelity. Keep trails and effects bounded and selection-oriented: the audited Flocking view retains at most one selected trajectory, bounded to 12/8/5 points by High/Balanced/Performance quality.
- The immersive prototype route is isolated presentation evidence. Keep it out of normal navigation, and never treat it as the production renderer.
