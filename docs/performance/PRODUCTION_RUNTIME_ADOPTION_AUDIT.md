# I1B Production Runtime Adoption Audit

Historical milestone audit. Current capability, architecture, scientific, and sequencing authority remains in `../CAPABILITIES.md`, `../ARCHITECTURE.md`, `../SCIENTIFIC_MODEL.md`, and `../ROADMAP.md`.

Date: 2026-08-27
Milestone: I1B - Production Runtime + Immersive Shell Audit
Starting commit: `bda117e73f705082cbe86e833221bf1c0416617f` (`feat: adopt runtime architecture in production world`)
Status: COMPLETE; final gates passed

## Verdict

The I1 production claim did not survive the audit unchanged. The happy path had one Worker-owned Flocking engine, but replacement acceptance, recoverable rejection, completion ordering, Reset construction, active-config presentation, and comparison capture contained authority defects. One path even reconstructed a temporary main-thread `SimulationEngine` from a Worker export to build a comparison read model. That violated the stated one-authority boundary even though the reconstructed engine was not stepped.

The defects are now fixed in the commit candidate. Production Flocking has one executing engine in the dedicated Worker; the production UI consumes identified projections and explicit artifacts through the public runtime boundary. No Local fallback, second production runtime, additional Worker-supported template, new model behavior, or future research object was added. No known I1B P0 or P1 remains after focused source, deterministic, protocol, and real-browser verification.

This is an audited software/runtime result, not evidence that Flocking is empirically valid, scientifically observed, high-scale, or universally performant.

## Findings

| Severity | Count | Disposition |
| --- | ---: | --- |
| P0 | 1 | Fixed and regression-tested |
| P1 | 8 | Fixed and regression-tested |
| P2 | 3 | Bounded fixes or verification added |
| P3 | Not enumerated | Out-of-scope cosmetic/history cleanup was not pursued |

### P0

1. Comparison capture reconstructed a temporary main-thread Flocking `SimulationEngine` from the authoritative Worker snapshot export. That created a second engine representation for the active modeled run and made future accidental mutation/stepping too easy. Capture now parses the validated runtime artifact and creates a detached `SimulationSnapshotView` through a pure data projector. Intervention history comes from the artifact globals. Production capture imports no `SimulationEngine` and never evolves a shadow run.

### P1

1. Rapid replacement acceptance was inferred from lifecycle state instead of an authoritative generation change. While accepted replacement A was initializing, rejected replacement B could be treated as accepted and overwrite the controller's current request/config. Lifecycle acceptance now requires the port generation to advance, only an accepted lifecycle replaces `whenReady`, and store reconciliation waits for the accepted operation before restoring accepted configuration.
2. A completion carrying a divergent UI value at an already accepted same-generation revision could resolve the request with different state, and the product controller allowed equal revisions. The driver now resolves from the already accepted UI projection; both runtime and product gates require strictly newer same-generation revisions plus active generation/run/template identity.
3. A malformed response from a provably stale generation was parsed as a current protocol failure and could terminate the healthy replacement run. The strict parser remains authoritative, while a separate bounded failure-context parser may identify and ignore only older malformed generations. Malformed current, future, or unidentifiable responses remain terminal.
4. Invalid intervention, speed, or selection requests terminally failed otherwise healthy Local and Worker runtimes. The protocol now has a strict bounded `runtime.rejected` response for validation failures. Matching promises reject, a current bounded UI projection is returned where applicable, and the accepted run remains ready and step-capable. Real runtime failures remain terminal.
5. Generic Reset discarded executable variant semantics such as initialization, behavior mode, composition, and environment while retaining the displayed seed/parameters. Reset now derives a validated configuration from the accepted runtime config, preserves executable variant fields, and removes scenario/prepared provenance and metadata that the generic constructor did not earn.
6. Setup drafts, status, guide authority checks, run details, comparison context, and diagnostics could present mutable desired Zustand seed/parameters as active Worker provenance before acceptance. `ActiveWorldRuntime` now exposes accepted seed/parameters; active-run consumers use those values while draft setters remain UI/store state.
7. Speed changes were sent once directly by the setter and again by the synchronization effect. The setter now changes desired store state only; one effect sends the bounded runtime control.
8. Post-initialization speed/selection synchronization could throw under backpressure and convert a successful run lifecycle into apparent initialization failure. Desired presentation controls now use recoverable control handling and cannot revoke an already accepted run.

### P2

1. Recoverable request rejection had no truthful healthy-run presentation and could be confused with terminal Worker failure. The shell now reports `Runtime request not accepted` while explicitly retaining the accepted Worker run and last valid scene.
2. The migration browser gate did not directly cover high-DPR Canvas sizing, reduced motion, constrained desktop/tablet/mobile viewports, horizontal containment, and Axe on the production Worker shell. One real-browser test now covers those bounded conditions and verifies nonblank Canvas pixels.
3. Public current-status/runtime prose still described production World as wholly main-thread and I1 as unstarted. Current README and canonical records now describe the Flocking-only split accurately. Historical milestone records remain historical rather than being rewritten as if they were current authority.

## Authority Result

| Concern | Audited production Flocking authority |
| --- | --- |
| Modeled state and RNG | Worker-owned `SimulationEngine` and deterministic runtime services |
| Wall-clock scheduling and accepted modeled operations | Worker `RuntimeSession`, scheduler, protocol, and command path |
| Render positions | Identified transferable `RenderFramePacket` values |
| Coarse semantic UI | Identified bounded `UIProjection` values |
| Selected detail | Bounded runtime projection for one current entity |
| Camera, DPR, hover, and visual quality | Presentation/UI only |
| Configuration drafts | UI/store only until a generation-advancing runtime operation accepts them |
| Snapshot/comparison artifacts | Explicit validated runtime artifact export; no continuous snapshot loop |
| Scientific evidence | Not implemented; `CanonicalObservation` remains future O1 work |

Source inspection and regression coverage confirm that the production Provider does not import or construct `SimulationEngine` or `LocalRuntimeDriver`. Production Flocking has no React animation-frame stepping path. The six unsupported templates retain the explicit legacy main-thread engine/snapshot path and do not create Workers.

## Determinism And Ordering

The existing direct-engine, Local driver, structured Worker, and real browser Worker equivalence evidence remains intact. I1B added exact post-rejection artifact equivalence between healthy Local and Worker runtimes after the same invalid intervention and one subsequent step. Selection and invalid presentation requests do not change modeled output. No random stream, model rule, parameter default/bound, initialization algorithm, tick order, or scheduler semantic changed.

Deterministic fake transport now directly covers the newly exposed same-revision divergent completion, malformed stale response, invalid recoverable operation, and rapid accepted-A/rejected-B replacement cases. Existing PERF1B coverage continues to force old generations, lower same-generation revisions, completion/UI reordering, replacement/reset/control bursts, stale selection, terminal failure, backpressure, detached-buffer ownership, and disposal.

Presentation coalescing remains limited to obsolete frame and coarse UI publications. Accepted commands, model steps, replacements, resets, and interventions are not silently coalesced or dropped. Browser-to-Worker ingress remains bounded to 128 unconsumed messages.

## Transactionality And Provenance

A new active config/run identity is adopted only when the runtime operation advances generation. A rejected concurrent operation cannot replace the accepted request, accepted config, readiness promise, or visible run identity. Provider reconciliation is revision-checked and waits for the accepted lifecycle to settle before restoring the accepted store configuration.

Generic Reset now preserves the accepted run's executable seed, parameters, initialization preset/options, behavior mode, agent composition, and environment options. It clears scenario name/id and arbitrary metadata, including prepared-recipe provenance, because Reset is a generic fresh-run constructor. Browser coverage verifies that Reset from the prepared noisy Flocking recipe retains Noise `0.01` and seed `c2-coordination-001` while the guide truthfully reports changed prepared-pair context and the run context reports `Default run`.

Snapshot and comparison provenance is derived from the validated exported artifact, not mutable store state at asynchronous completion. Internal runtime-artifact metadata collision protection from I1 remains intact. `SnapshotExport`, `SimulationSnapshotView`, `RenderFramePacket`, and `UIProjection` remain distinct; none is `CanonicalObservation` or empirical evidence.

## Failure, Lifecycle, And Boundedness

Terminal Worker or protocol failure remains visible, terminates authoritative execution, rejects pending work, disposes transport resources, publishes no fabricated continuation, and never creates a Local fallback or silently reseeds. Removing browser Worker support still produces the explicit unavailable state with no fallback.

Validation rejection is now a different protocol outcome. It is bounded, identified by generation/run/message id, cannot mutate accepted identity, and leaves a healthy runtime ready. A failed intervention remains represented in bounded intervention history; both Local and Worker then produce identical exported state.

Existing lifecycle churn evidence remains applicable: one Worker for one mounted supported production runtime, zero after disposal, idempotent cleanup, generation/revision gates, one in-flight plus one newest pending frame/UI value, and no detached-buffer reuse. The focused browser gate reconfirms one Worker through navigation and explicit Worker absence behavior.

## Legacy And Product Workflows

The audit did not migrate the six legacy templates or change their engine, scheduler, snapshot, intervention, comparison, initialization, RNG, rendering, or persistence semantics. Complete browser coverage passed for all seven templates and the established Start, Starter, recipe, guide, World, Workshop, Lab, and Atlas workflows.

The focused production Worker browser suite covers direct Flocking launch, keyboard playback/selection, browser Back/Forward, reset, prepared noisy recipe semantics, guide disclosure, legacy-to-Flocking transition, Worker unavailability, 100/500 performance characterization, high DPR, reduced motion, constrained viewports, Axe, and nonblank Canvas pixels.

## Performance Evidence

The final complete local development-Chromium gate used the production shell and the existing aggressive `8x` request. It is a short machine-specific sample, not a portable benchmark:

| Agents | Ready | Achieved model ticks/s | Engine step median / p95 | Canvas FPS | Draw median / p95 | Timer lag median / p95 / max |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 173 ms | about 125.7 | 2.3 / 4.5 ms | 59.42 | 0.4 / 0.6 ms | 0.2 / 8.7 / 10.8 ms |
| 500 | 195 ms | about 31.3 | 21.0 / 31.5 ms | 59.71 | 0.6 / 0.9 ms | 0.2 / 3.1 / 18.9 ms |

An earlier valid focused run on the same machine was materially slower: about `80.0/20.1` ticks/s and `57.66/58.60 FPS` at 100/500. That variance is why I1B does not market the more favorable final sample as a speed guarantee. Across both runs, Canvas draw remains inexpensive and the measured main thread remains responsive, while 500-agent model computation is the bottleneck. Worker adoption is pressure isolation, not universal acceleration or a 60 FPS guarantee.

## Final Verification

- Focused adoption/runtime unit coverage passed `2 files / 39 tests` after the final source changes.
- Focused real-Worker production Playwright passed `5/5` in about `1.1m`, with zero failures, retries, or skips.
- `npm run lint` passed TypeScript unused-symbol checks and the architecture/accessibility smoke scan over `385` production TypeScript files. Standalone typecheck passed.
- The first complete unit run exposed one stale handoff assertion that still required Current Context to call I1 unstarted. After that documentation-contract test was corrected, focused replay passed `1/1 file / 7 tests` and the complete unit gate passed `84 files / 734 tests` in `78.86s`. No runtime test failed.
- The optimized production build compiled in `9.3s` and generated `23` pages.
- `npm run perf:simulation` passed with exact automatic Flocking pair checks of `316,971/7,721,264` at 100/500. It measured Flocking `124.13/19.19` ticks/s, Forest Fire `36.13`, Predator-Prey `102.48`, and the bounded Atlas smoke `2` runs / `10` work units / horizon `5` in `40.33ms`.
- `npm run perf:runtime` passed exact 100/500 corrected-index/reference snapshot equivalence. Automatic medians were `137.530/22.892` ticks/s at 100/500; unselected packets remained `2,300/11,500` typed bytes and contained no metric history.
- Complete Playwright/Axe passed `194/194` in `21.2m` with zero product retries and zero skips. One earlier invocation was terminated after its first passing test when the chat interruption dropped the PTY; that infrastructure interruption produced no completed result and the gate was restarted from scratch.
- `git diff --check` passed before and after the final evidence update.

## Remaining Limits

- Production Worker execution remains Flocking-only with projection kind `flocking-v1`.
- The six other templates remain on the explicit main-thread legacy path.
- 500-agent Flocking computation remains expensive and timing remains machine-dependent.
- Browser evidence is bounded to local Chromium and tested viewport/DPR/motion conditions; it is not browser, CPU, GPU, OS, or actual-device certification.
- Actual browser zoom, forced colors, direct screen-reader/assistive-technology use, complete touch workflow, multi-hour/Worker-heap/native/GPU leak testing, participant comprehension, and formal WCAG conformance remain unverified.
- `CanonicalObservation`, SystemView, research persistence, broader immersive capability, UR0 outcomes, and I2 remain unimplemented.

## Handoff

At successful commit-gate closure:

```text
I1: COMPLETE
I1B: COMPLETE
UR0: NEXT / UNSTARTED
```

I2 is not next. This audit does not authorize UR0 implementation, additional Worker templates, broader immersive behavior, scientific observations, or future research architecture.
