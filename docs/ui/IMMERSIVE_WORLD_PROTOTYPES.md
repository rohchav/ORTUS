# Immersive World Prototypes

Date: 2026-08-10
Prompt: I0
Status: implemented on an isolated internal route; production World unchanged

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
- selected heading and authoritative local-neighborhood geometry;
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
- Up to 32 tracked trajectories with at most 12 points each.
- Alignment vectors only when the lens is active.

The perspective grid, shadows, and selection pulse are presentation. Boid position, velocity, heading, radius, neighborhood, and Alignment come from the snapshot adapter.

### God-Hand

- A pointer ring provides visible spatial presence and pressed-state feedback.
- Hand pans and selects; it does not move agents.
- Inspect supports selection and authoritative contextual geometry.
- Measure activates the same read-only Alignment lens.
- Cursor shape, active segment, text state, and stroke treatment make tool state more than a color cue.

There is no manipulate, attract, repel, wind, drag-agent, paint, or arbitrary perturbation tool.

### Field Scientist

- System shows the full flock.
- Local centers the camera on a selected boid's model neighborhood.
- Follow eases toward the selected boid as the model advances.
- Neighborhood relationships and headings are derived from the current snapshot.
- System is always available as the explicit return path.

System, Local, and Follow are observation-camera modes. They are not ORTUS multi-scale runtime, boid perception, agent point of view, or evidence of awareness.

## Scene Adapter Boundary

`WorldSceneAdapter` is the narrow I0 rendering seam:

```ts
interface WorldSceneAdapter {
  getBounds(): ImmersiveWorldBounds;
  getEntities(): readonly ImmersiveSceneEntity[];
  getRelationships(entityId: string | null): readonly ImmersiveSceneRelationship[];
  getInspectableState(entityId: string | null): ImmersiveInspectableState | null;
  getSelectionGeometry(entityId: string | null): ImmersiveSelectionGeometry | null;
  getLensData(): ImmersiveLensData;
  getRuntimeSignature(): string;
}
```

The Flocking adapter reads positions, velocities, `BoidState`, world bounds, parameters, and metric history from an authoritative snapshot. Its selected-neighborhood query is a bounded O(n) read for one selected entity, not an all-pairs visual pass. It applies wrap-aware minimum-image geometry because that is the template's active boundary behavior. It creates no model rule and writes nothing back.

This interface proves a boundary; it is not the complete future I2 scene framework and does not imply support for other templates.

## Render Loop Boundary

The canvas performs batched imperative drawing in `requestAnimationFrame`. It reads the latest immutable adapter from the route-local runtime. React does not map boids into components and does not receive a state update per entity or per visual frame.

The runtime mirrors production World's 24 Hz elapsed-time accumulator and engine `maxStepsPerFrame` catch-up cap. It may execute several deterministic engine steps and publish one snapshot when rendering stalls. React notifications are throttled to a coarse 120 ms interval for text/control state. Canvas still reads the latest adapter directly.

This makes degradation explicit:

```text
engine ticks and model semantics: preserved
snapshot/scene projection: authoritative
canvas frame cadence: allowed to fall
atmosphere/trails/effects: independently bounded
React control updates: coarse, not per boid
```

## Camera

The reusable I0 camera state contains position, zoom, mode, and focus target. Position is clamped to world bounds and zoom is clamped to `0.72..4`. Modes are `system`, `free`, `local`, and `follow`. Missing focus targets fall back to System. Pointer picking uses the displayed camera so eased Local/Follow views remain spatially correct.

Camera interpolation occurs only in the renderer. With `prefers-reduced-motion: reduce`, the displayed camera moves immediately to its target and transient visual effects are not drawn. Neither path changes runtime state or metrics.

## Selection And Inspection

Canvas hover and click select by projected entity geometry. Arrow keys on the canvas cycle the deterministically ordered boid list; Escape clears; Home restores System; plus/minus zoom. The inspector also accepts a bounded boid number and includes previous/next buttons.

The DOM inspector is the textual authority for:

- selected boid label;
- position;
- heading in degrees;
- speed in model units per tick;
- template-reported last sensed neighbor count;
- currently computed neighborhood count and radius;
- current Alignment value;
- playback, camera, tool, and lens state.

Missing or replaced entity ids produce `No boid selected`; no copied biography or stale entity object is retained.

## Lens Semantics

Alignment is the magnitude of the mean normalized heading vector emitted by the Flocking template. Direction vectors normalize current model velocity. Selected heading and neighborhood geometry are current model state. The lens does not change rules, weights, velocities, metrics, or agent state.

Alignment is a model output, not measured animal coordination, cohesion, intent, intelligence, validation, or empirical truth. At tick 0, the UI says `Awaiting tick` rather than fabricating a value.

## Bounded Visual State

- Trail entities: maximum 32.
- Trail points per entity: maximum 12.
- Total trail points: maximum 384.
- Transient effects: maximum 24.
- Performance timing samples per bounded series: maximum 360.
- Initialization, selection, and step effects expire by time.
- Reduced motion draws zero transient effects.
- No full snapshot, arbitrary event payload, document, biography, or unbounded history is retained by the renderer.

## Responsive And Accessibility Evidence

All concepts were rendered and checked at `1440x900`, `1280x720`, `1024x768`, `900x700`, `1280x600`, and `390x844`. The stage occupied more than 58% of the prototype root at every checked size, playback and camera reset remained visible, active concepts/tools remained explicit, canvases were nonblank, and no document-level horizontal or vertical overflow was found. Mobile keeps the world in the dominant stage and places exact inspection in one bounded internal region rather than stacking dashboard cards through the document.

Focused browser coverage verifies keyboard concept tabs, canvas selection, camera reset, Escape clearing, rubric focus return, staged replacement, reduced motion, Axe, diagnostics, six viewports, 500-boid smoke, no storage, and production `/world` regression.

This evidence does not establish formal WCAG conformance, screen-reader or other assistive-technology behavior, forced-colors quality, actual browser-zoom quality, complete touch ergonomics, or participant comprehension.

## Scope Boundary

I0 adds no production navigation, production World migration, template mechanic, parameter, preset, metric, intervention, snapshot shape, comparison shape/key, Experiment Runner behavior, Starter World contract, Atlas behavior, Lab behavior, Builder execution, persistence, dependency, remote asset, 3D engine, model-scale zoom, or cross-template renderer claim.
