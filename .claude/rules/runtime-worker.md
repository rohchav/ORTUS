---
paths:
  - "src/simulation/runtime/**"
  - "src/workers/**"
  - "src/components/runtime/**"
  - "src/lib/immersiveWorld/**"
  - "src/simulation/spatialIndex/**"
  - "src/simulation/spaces/**"
  - "src/simulation/testing/**"
---

# Runtime port, Worker protocol, and projections

These details implement the runtime-authority invariants in AGENTS.md section 3. Record any change to a limit below with measured evidence in the milestone audit.

## Protocol limits
- Worker ingress, including promise requests and fire-and-forget controls, is capped at 128 unconsumed messages. Capacity is released only when the host acknowledges consumption. Overflow is rejected before a command is accepted or the generation changes.
- Visual backpressure allows one in-flight and one newest pending frame or UI publication. Visual coalescing may drop obsolete packets but never skips steps, commands, interventions, comparison captures, or evidence.
- Requests and publications are strictly validated and identified by generation, run, and tick, plus request or publication identity. A stale publication from the current generation never becomes current.
- Recoverable validation failures (bad intervention, speed, or selection) answer with a bounded `runtime.rejected`, leaving the accepted run ready. Real runtime failures stay terminal.

## Lifecycle
- Driver lifecycle is explicit: idle, initializing, ready, failed, disposed. Commands sent before first readiness are rejected, not queued, and readiness is never inferred from Worker construction.
- Workers start from a mounted lifecycle, never a React render-time initializer. On replacement or unmount, dispose schedulers, listeners, pending requests, publication gates, and the Worker itself, without relying on stale closure timing.
- On failure: remove listeners, terminate the Worker, reject pending work, release frame and UI references, and keep the last complete publication where safe. No `eval`, user-authored Worker scripts, arbitrary script URLs, or plugin execution.

## Projections
- Projection support is explicit and registered per kind. Only `flocking-v1` is implemented. Other templates keep their main-thread path until a dedicated milestone adds and audits an adapter; Forest Fire, Schelling, and Neural also need new rendering primitives.
- `RenderFramePacket` is ephemeral renderer state holding only bounded presentation values: no engine objects, full metric history, RNG state, or methods. `UIProjection` is coarse React and accessibility state; per-entity motion arrays never flow through React. Exact inspection values come from the authoritative projection, not rounded renderer arrays.
- Transferred buffers are never mutated by renderer, camera, or lens code, never recycled after detaching, never listed twice in one transfer, and never kept in an unbounded history.
- At the audited 500-boid bound, engine work and snapshot allocation dominated main-thread cost, not Canvas drawing. Worker execution evidence covers Flocking only, not other templates, browser or mobile diversity, or high scale.

## Neighbor search and performance reports
- Flocking automatic neighbor execution keeps the pre-PERF1 spatial-hash threshold, nominal-cell behavior, and all-pairs fallback. The `uniformCoverage` index path is differential and benchmark-only; adopting it needs an explicit semantic migration, a repeatable measured benefit, and exact wrap, order, and trajectory evidence.
- Neighbor-index correctness covers non-divisible dimensions, wrap corners and edges, exact, inside, and outside radii, same-position agents, duplicate and self behavior, stable pair order, 500-agent generated states, and full deterministic evolution. Prefer reusable spatial-index services over template-specific hacks.
- Performance reports keep scheduler compute, metrics, snapshot creation, and render-model preparation separate where practical.
