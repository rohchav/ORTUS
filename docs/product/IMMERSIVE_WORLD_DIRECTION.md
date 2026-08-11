# Immersive World Direction

Date: 2026-08-11
Prompts: I0 and I0B
Status: I0 and I0B complete; I1 Immersive World Shell next but unstarted

## Product Objective

I0 tests one product proposition: the simulated world should become ORTUS's primary interface. It does not replace production World. The isolated `/world/immersive-prototype` route compares three presentation concepts over the same real Flocking engine, fixed seed, random-headings initialization, parameters, metrics, and entity count.

Immersion remains subordinate to runtime truth. Atmosphere, camera, hover, selection, and lenses may change how the model is presented. They do not add model events, forces, fields, terrain, relationships, agent intent, or evidence about real flocks.

## Concepts Tested

### Living Diorama

Living Diorama presents Flocking as a bounded miniature system with a skewed 2.5D surface, depth ordering, soft model-agent shadows, restrained atmosphere, one selected recent trajectory, camera easing, zoom, selection, and follow mode.

Rating: **Strong**.

- Strongest spatial presence and clearest break from a dashboard-contained chart.
- The boundary, depth, and selected trail remain distinguishable from model-derived heading and proximity overlays.
- Whole-system and follow movement are coherent, but exact inspection still depends on the contextual inspector.
- At 500 boids it is the most visually elaborate prototype. Automatic quality degradation removes nonessential detail before model fidelity, but local cadence remains hardware-sensitive and can still be poor.

### God-Hand Sandbox

The I0 God-Hand concept made the pointer visibly present in the model surface. I0B renamed its modes to Navigate, Inspect, and Measure, removed the hand metaphor, and gave each mode shape-distinct feedback. Navigate pans and selects; Inspect exposes authoritative boid state; Measure activates the read-only Alignment lens. Selection never moves a boid and no unsupported manipulation tool exists.

Rating: **Promising with issues**.

- Strongest directness and immediate hover/press/selection feedback.
- The explicit tool state is discoverable and can scale to template-owned actions later.
- The original name and ring-like pointer presence implied more control than ORTUS supports. The production direction therefore retains direct feedback but retires the God-Hand/Hand metaphor.
- Performance is better than Living Diorama at 500 boids, but directness alone does not supply enough scientific orientation.

### Field Scientist

Field Scientist organizes observation around System, Local, and Follow camera modes, with selected proximity markers, heading vectors, exact DOM inspection, and a clear return to System view. These are camera modes, not model-scale or multi-scale runtime support.

Rating: **Strong**.

- Best scientific clarity, state legibility, and correspondence between canvas interaction and textual authority.
- Best measured 500-boid rendered performance of the three prototypes.
- Local and Follow provide a useful observer position without claiming boid awareness, intention, or a literal point of view.
- It is less spatially evocative than Living Diorama and less immediately tactile than God-Hand.

## Comparative Findings

| Dimension | Living Diorama | God-Hand | Field Scientist |
| --- | --- | --- | --- |
| Presence | Strongest | Strong | Moderate-strong |
| Agency/directness | Moderate | Strongest | Moderate |
| Scientific clarity | Strong | Moderate-strong | Strongest |
| Interface mediation | Some inspector travel | Lowest for mode changes | Low for observation, higher for setup |
| Cross-template potential | Strong for spatial/grid worlds | Useful only with strict template-owned actions | Strong for all inspectable worlds |
| Precise tool depth | Preserved in DOM inspector | Preserved in DOM inspector | Central to the concept |
| I0 100-boid rendering | 59.58 FPS measured | 58.41 FPS measured | 59.19 FPS measured |
| I0 500-boid rendering | 6.72 FPS measured | 8.08 FPS measured | 9.20 FPS measured |
| Accessibility viability | DOM and keyboard mirror | DOM and keyboard mirror | Most naturally aligned |
| Responsive viability | Passed six tested sizes | Passed six tested sizes | Passed six tested sizes |

These are historical I0 measurements. I0B observed roughly order-of-magnitude variation across equivalent 500-boid development runs, so they are not product guarantees or reliable cross-run optimization evidence. Full methodology and caveats are in `docs/performance/IMMERSIVE_RENDERING_BASELINE.md`.

## Decision

**I0B decision: Revise hybrid.**

The I0 `50/20/30` percentages are retired. They conveyed precision the prototype evidence did not earn. The replacement is an exact responsibility model:

- **Living Diorama:** owns the primary world surface, restrained bounded depth, visible model boundary, whole-system camera, camera easing, and selected-only truthful trajectory.
- **Field Scientist:** owns observation information architecture, System/Local/Follow semantics, exact model-state inspection, selected proximity framing, model-output lenses, runtime-honesty language, and the accessible textual authority.
- **Direct interaction contribution formerly tested as God-Hand:** owns immediate pointer feedback, selection, and contextual instrument switching only. The God-Hand/Hand metaphor does not migrate to production and never authorizes generic manipulation, arbitrary perturbation, or entity dragging.

The full defect, performance, visual-truth, soak, and cross-template evidence is in `docs/product/IMMERSIVE_WORLD_DIRECTION_AUDIT.md`.

## Common Interaction Contract

Every future immersive World slice should preserve:

1. A real template-owned runtime and validated prepared scenario.
2. Persistent run/pause, one-tick step, and explicit destructive restore.
3. A bounded camera with system position, zoom, focus target, mode, reset, and reduced-motion behavior.
4. Immediate hover plus selection that never mutates model state.
5. An accessible selection path outside the canvas.
6. A selected-entity inspector derived from the latest authoritative snapshot.
7. A model-derived lens with exact semantics and a visible active state.
8. Current tick, playback state, scenario identity, and a clear exit.
9. Visual effects that are bounded, truthful, and independently degradable.
10. No persistence unless a later prompt explicitly introduces and audits it.

## Rendering And Runtime Boundary

The engine remains authoritative. A generic typed read-only scene-adapter base exposes snapshot-derived rendering data; the current `WorldSceneAdapter` is still its Flocking specialization. It does not mutate the engine, evolve independent state, or contain a Flocking update rule. Canvas owns batched entity drawing and bounded visual history. React owns controls, inspector text, mode state, confirmation state, and coarse runtime notifications; it is not the per-boid render loop.

At 500 boids, the route-local driver uses the same 24 Hz elapsed-time accumulator and five-step catch-up ceiling as production World. When main-thread pressure rises, automatic High/Balanced/Performance presentation quality can reduce DPR, decorative shadows/strokes, trail density/frequency, effects, and grid detail. It never silently reduces agent count, deterministic steps, rule execution, RNG work, metrics, or scenario fidelity. Quality state is bounded and non-persistent.

## Accessibility Strategy

Canvas interaction has a semantic mirror: selected boid, position, heading, speed, neighbor count recorded in model state, current proximity check, camera mode, active tool, active lens, playback, and Alignment are exposed in DOM text. A numeric boid selector and arrow-key canvas path provide non-pointer inspection. Tools, tabs, playback, modals, focus return, and camera controls are keyboard reachable. Reduced motion removes transient effects and makes camera transitions immediate without removing information or controls.

The I0/I0B Axe and keyboard checks passed. This is not formal WCAG conformance, screen-reader certification, assistive-technology certification, forced-colors verification, actual browser-zoom verification, or a user-comprehension study.

## Rejected Approaches

- **Immediate production World replacement:** rejected because I0 is comparison and measurement, not migration.
- **Three.js or full 3D:** rejected because Canvas 2D demonstrated presence, depth, and directness without a new dependency or a 3D scene tax.
- **React components per boid:** rejected because React must not become the continuously updating entity renderer.
- **Pure God-Hand direction:** rejected because implied omnipotence would outpace template-owned intervention support.
- **Pure Field Scientist direction:** rejected because it preserves rigor but undershoots the desired sense of inhabiting a live system.
- **Pure Living Diorama direction:** rejected because atmosphere and camera alone do not sufficiently reduce interface mediation.
- **Arbitrary dragging or flock manipulation:** rejected because Flocking exposes no such template-owned mechanic.
- **Decorative forces, wind, collisions, emotions, or turbulence:** rejected because the runtime does not expose them.
- **Unbounded trails, particles, biographies, or event history:** rejected on performance and truthfulness grounds.
- **Persisted prototype preferences, selections, runs, or comparison votes:** rejected as outside I0.

## I1 Handoff

I1 should migrate the revised ownership model incrementally, beginning with Flocking and preserving the existing production `/world` contract until the audited replacement is ready.

Required I1 boundaries:

- Extract a production-ready renderer host around the proven snapshot-to-scene adapter boundary.
- Keep the responsibility boundaries explicit; do not restore unsupported percentage weights or the God-Hand/Hand metaphor.
- Preserve production scheduler semantics and measure 100/500 before and after each renderer migration.
- Keep visual cadence, effect density, trails, shadows, and distant detail independently degradable.
- Investigate worker/scheduler isolation and snapshot-publication cost before assuming WebGL solves the 500-boid bottleneck.
- Introduce only template-derived relationships, lenses, and actions.
- Preserve exact DOM inspection and current World task reachability.
- Add no new Flocking mechanics, persistence, generic manipulation, 3D dependency, or cross-template support claim.
- Treat Epidemic, Predator-Prey, Forest Fire, Schelling, Opinion, and Neural adapters as future audited slices, not automatic consequences of the Flocking prototype.

## Status

C3B, I0, and I0B are complete. `I1: Immersive World Shell` is next and has not started. I2 through I5B have not started. C4 is deferred until I5B and has not started.
