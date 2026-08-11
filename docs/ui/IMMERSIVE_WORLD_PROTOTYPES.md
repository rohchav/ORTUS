# Immersive World Prototypes

Date: 2026-08-11
Prompts: I0 and I0B
Status: implemented and audited on an isolated internal route; production World unchanged

## Route

The comparison surface is:

```text
/world/immersive-prototype?concept=living-diorama&agents=100
/world/immersive-prototype?concept=god-hand&agents=100
/world/immersive-prototype?concept=field-scientist&agents=100
```

`agents` accepts only `100` or `500`. Unknown, duplicated, or extra query fields fail closed. The route is marked `noindex` and is not linked from normal navigation, Starter Worlds, production World URLs, comparison storage, Atlas, Lab, or Workshop.

## Authoritative Prepared State

All concepts use one validated authored scenario and the registered `flocking-boids` template:

```text
scenario: i0-immersive-flocking-v1
seed: i0-immersive-flocking-seed-v1
initialization: random-headings
agent load: 100 or 500
```

Changing concepts preserves the mounted engine, tick, metric history, and runtime signature. Changing 100/500 creates a fresh paused tick-0 engine after explicit confirmation when run state exists. Reload reconstructs a fresh engine from the URL. Nothing is persisted.

## Shared Controls

Each concept provides:

- live real-engine Flocking;
- run and pause;
- exactly one deterministic step;
- staged restore that states what is discarded;
- bounded pan/zoom and System reset;
- hover and selection;
- numeric and keyboard entity inspection;
- selected heading and a current snapshot proximity check;
- exact selected-entity DOM values;
- the existing Alignment model output as a lens;
- current tick, playback state, agent load, preset, and seed;
- a concise ten-item comparison rubric;
- an exit to normal Flocking World.

Camera, selection, hover, active lens, active tool, rubric, and confirmation state are presentation state. They do not enter snapshots, run summaries, comparisons, local storage, session storage, scenarios, or engine state.

## Concept Surfaces

### Living Diorama

- Skewed 2.5D bounded surface and depth-sorted boids.
- Soft visual shadows and restrained non-model atmosphere.
- Pan, zoom, System, and selected-boid Follow.
- Only the selected boid's trajectory, with 5, 8, or 12 points according to automatic quality.
- Alignment vectors only when the lens is active.

The perspective grid, shadows, and selection pulse are presentation. Boid position, velocity, heading, radius, neighborhood, and Alignment come from the snapshot adapter.

### God-Hand

- Navigate uses a horizontal navigation mark and pressed-state feedback.
- Navigate pans and selects; it does not move agents.
- Inspect supports selection and authoritative contextual geometry.
- Measure activates the same read-only Alignment lens.
- Navigate, Inspect, and Measure use distinct arrow, corner-bracket, and ruler shapes as well as active text and stroke treatment.

There is no manipulate, attract, repel, wind, drag-agent, paint, or arbitrary perturbation tool.

### Field Scientist

- System shows the full flock.
- Local centers the camera on a selected boid's model neighborhood.
- Follow eases toward the selected boid as the model advances.
- Selected proximity markers and headings are derived from the current snapshot.
- System is always available as the explicit return path.

System, Local, and Follow are observation-camera modes. They are not ORTUS multi-scale runtime, boid perception, agent point of view, or evidence of awareness.

## Scene Adapter Boundary

I0B separates the reusable read-only contract from the current Flocking specialization:

```ts
interface ReadOnlyWorldSceneAdapter<Entity, Inspectable, Selection, Lens> {
  readonly templateId: string;
  readonly tick: number;
  readonly parameters: Readonly<ParameterValues>;
  getBounds(): ImmersiveWorldBounds;
  getEntities(): readonly Entity[];
  getInspectableState(entityId: string | null): Inspectable | null;
  getSelectionGeometry(entityId: string | null): Selection | null;
  getLensData(): Lens;
  getRuntimeSignature(): string;
}

interface WorldSceneAdapter extends ReadOnlyWorldSceneAdapter<
  ImmersiveSceneEntity,
  ImmersiveInspectableState,
  ImmersiveSelectionGeometry,
  ImmersiveLensData
> {
  getRelationships(entityId: string | null): readonly ImmersiveSceneRelationship[];
  getAlignment(): number | null;
}
```

The Flocking adapter reads positions, velocities, `BoidState`, world bounds, parameters, and metric history from an authoritative snapshot. Its current-proximity query is a bounded O(n) read for one selected entity, not an all-pairs visual pass or a causal relationship. It applies wrap-aware minimum-image geometry because that is the template's active boundary behavior. Alignment vectors and the deterministic audit signature are lazy and cached only for that immutable snapshot. The adapter creates no update rule and writes nothing back.

This interface proves a boundary; it is not a complete production scene framework and does not imply support for other templates. Grid worlds and the Neural network require new rendering primitives, while the other continuous-agent templates require their own audited adapters.

## Render Loop Boundary

The canvas performs batched imperative drawing in `requestAnimationFrame`. It reads the latest immutable adapter from the route-local runtime. React does not map boids into components and does not receive a state update per entity or per visual frame.

The runtime mirrors production World's 24 Hz elapsed-time accumulator and engine `maxStepsPerFrame` catch-up cap. It may execute several deterministic engine steps and publish one snapshot when rendering stalls. React-visible notifications are throttled to a coarse 250 ms interval for text/control state. The memoized Canvas boundary still reads the latest adapter directly.

This makes degradation explicit:

```text
engine ticks and model semantics: preserved
snapshot/scene projection: authoritative
canvas frame cadence: allowed to fall
atmosphere/trails/effects: independently bounded
React control updates: coarse, not per boid
```

The route records bounded engine-step, snapshot, adapter, frame, and Canvas-draw timings. I0B profiling found engine neighbor search and cloning/snapshot publication dominate 500-boid main-thread pressure; Canvas drawing is not the primary bottleneck.

## Automatic Render Quality

One hundred boids starts at High quality and 500 starts at Balanced. A bounded p95 frame window with hysteresis may select High, Balanced, or Performance. The policy caps DPR at 2, 1.5, or 1; progressively removes unselected shadows/strokes; reduces the selected trail to 12, 8, or 5 points and updates it less often; and reduces effects from 24 to 12 to 0. The world grid also becomes coarser.

Quality is local presentation state. It has no settings panel, storage key, model input, or effect on agent count, ticks, deterministic steps, rules, RNG, metrics, or scenario fidelity.

## Camera

The reusable camera state contains position, zoom, mode, and focus target. Position is clamped to world bounds and zoom is clamped to `0.72..4`. Modes are `system`, `free`, `local`, and `follow`. User zoom correctly enters Free mode. Missing or deselected focus targets fall back to System. Follow interpolation handles toroidal wrap without crossing the whole displayed world. Pointer picking uses the displayed camera so eased Local/Follow views remain spatially correct.

Camera interpolation occurs only in the renderer. With `prefers-reduced-motion: reduce`, the displayed camera moves immediately to its target and transient visual effects are not drawn. Neither path changes runtime state or metrics.

## Selection And Inspection

Canvas hover and click select by projected entity geometry. Arrow keys on the canvas cycle the deterministically ordered boid list; Escape clears; Home restores System; plus/minus zoom. The inspector also accepts a bounded boid number and includes previous/next buttons.

The DOM inspector is the textual authority for:

- selected boid label;
- position;
- heading in degrees;
- speed in model units per tick;
- neighbor count stored in current model state;
- current proximity-check count and radius;
- current Alignment value;
- playback, camera, tool, and lens state.

Missing or replaced entity ids produce `No boid selected`; no copied biography or stale entity object is retained.

## Lens Semantics

Alignment is the magnitude of the mean normalized heading vector emitted by the Flocking template. Direction vectors normalize current model velocity. Selected heading and neighborhood geometry are current model state. The lens does not change rules, weights, velocities, metrics, or agent state.

Alignment is a model output, not measured animal coordination, cohesion, intent, intelligence, validation, or empirical truth. At tick 0, the UI says `Awaiting tick` rather than fabricating a value.

## Bounded Visual State

- Trail entities: maximum 1 selected entity.
- Trail points: maximum 12 at High, 8 at Balanced, and 5 at Performance.
- Total trail points: maximum 12.
- Transient effects: maximum 24.
- Performance timing samples per bounded series: maximum 360.
- Selection feedback expires by time; initialization and step pulses were removed because they resembled model forces or waves.
- Reduced motion draws zero transient effects.
- No full snapshot, arbitrary event payload, document, biography, or unbounded history is retained by the renderer.

## Responsive And Accessibility Evidence

All concepts were rechecked at `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844`. The stage remains dominant, playback and camera reset remain visible, active concepts/tools are explicit, canvases are nonblank, and no document-level overflow or nested-scroll trap was found. I0B moved the compact readout below the concept toolbar after reproducing a mobile overlap. Mobile keeps exact inspection in one bounded internal region rather than stacking dashboard cards through the document.

Focused browser coverage verifies keyboard concept tabs and tool switching, canvas selection, truthful camera labels, Follow exit, camera reset, Escape clearing, rubric focus return, staged replacement, rapid state churn, adaptive quality, selected-only bounds, reduced motion, Axe, diagnostics, required viewports, 500-boid behavior, no storage, and production `/world` regression.

This evidence does not establish formal WCAG conformance, screen-reader or other assistive-technology behavior, forced-colors quality, actual browser-zoom quality, complete touch ergonomics, or participant comprehension.

## Scope Boundary

I0/I0B add no production navigation, production World migration, template mechanic, parameter, preset, metric, intervention, snapshot shape, comparison shape/key, Experiment Runner behavior, Starter World contract, Atlas behavior, Lab behavior, Builder execution, persistence, dependency, remote asset, 3D engine, model-scale zoom, or cross-template renderer claim. The I0B decision and evidence are recorded in `docs/product/IMMERSIVE_WORLD_DIRECTION_AUDIT.md`.
