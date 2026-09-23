# ORTUS Hardening Ledger

This ledger has two parts. **Phase 2 — Execution** (immediately below) records the repairs made
against the Phase 1 findings. **Phase 1 — Forensic Investigation** (further below) is the original
audit, preserved as evidence; where Phase 2 changed a conclusion, the Phase 2 entry says so.

## Phase 2 — Execution

Baseline for Phase 2: branch `main`, commit `28dca70` (adds only this ledger on top of the audited
`8114043`), clean working tree, npm with `package-lock.json`, Node v24.16.0.

Finding map used below: F1 = K1, F2 = K2, F3 = K3, F4 = K8, F5 = SEC1, F6 = SEC2, F7 = GOV1,
F8 = RUNTIME1, F9 = K5. STATE1/STATE2 are the WP6 items.

| Package | Status |
| --- | --- |
| WP1 — Kernel tick/command failure semantics (F1–F4) | VERIFIED |
| WP2 — Space/command kind safety (F9) | VERIFIED |
| WP3 — Hostile-input depth hardening (F5) | VERIFIED |
| Worker detached-buffer repair (F8) | VERIFIED |
| WP4 — CI enforcement and dependency hygiene (F6, F7) | CI GREEN ON GITHUB (run 35808522808); required checks NOT enforced on `main` |
| WP5 — Kernel deep-clone cost (K6) | MEASURED; OPTIMIZED (19–50% ms/tick); further reduction deferred |
| WP6 — Application-state cleanup (STATE1, STATE2) | VERIFIED |

Final disposition and verification: see **Phase 2 — Final Disposition** at the end of Phase 2.

### WP1 — Kernel tick and command failure semantics — VERIFIED

**Revalidation.** F1–F3 reproduced on current code by the new regression tests (18 of 19 failed
before the repair; the one that passed pins reset-equals-fresh and guards the refactor). One further
manifestation was found: `RuntimeWorkerHost` classified any `SimulationValidationError` from
`runtime.step` as a recoverable `runtime.rejected`. A probe using finite-but-extreme Flocking
velocities showed a mid-tick failure reported as a rejection with playback still `paused`, and the
next step ran on top of the partial tick (tick 1 → 2). That is F1 reaching the production Worker
path. `LocalRuntimeDriver` already treated step failures as terminal, so the two drivers disagreed.
A second F2 path was also found: `applyCommands` queued each command before validating the next, so
a batch rejected by shape validation on command N left commands 1..N−1 pending for the next tick.

**Contract.**
- `step()`/`applyCommands()` failing after mutation may have begun marks the run failed:
  `engine.failure = { operation, tick, error }`, pending commands are cleared, the clock pauses.
- A failed engine refuses `step`, `runSteps`, `applyCommands`, `play`, `snapshotExport`/`exportSnapshot`,
  and `executeIntervention` with `SimulationEngineFailedError` (cause = original error, message
  names tick, operation, and original reason). Views (`createSnapshot`, `debugData`, `world`) stay
  readable for inspection; `exportScenario` (initial conditions only) stays available.
- Clock: remains at the failed tick. Events due in the failed tick: consumed, never re-queued.
  RNG: draws stay drawn and are unreachable (no snapshot export). Metrics: collected only after
  invariants and `validateWorld` pass, so history never contains a failed tick.
- `applyCommands` batches are shape-validated as a whole before any command applies; a rejected batch
  changes nothing, queues nothing, and does not fail the run. A failure during application fails the
  run; commands after the failing one never apply; commands before it are not rolled back.
- A single multi-mutation command (`setComponents`, `moveEntities`, `createEntity`) that fails part-way
  follows the same rule: the run fails and the partial effect is inspectable only.
- Template post-validation failure (`validateWorld`) follows the same model for ticks and batches.
- `reset`/`restoreSnapshot`/`importScenario` build and validate the replacement world, parameters,
  and RNG before committing anything. They either replace the run and clear the failure, or throw
  and leave the engine exactly as it was (healthy or failed).
- Runtime drivers treat a failed run as terminal even when the original error is a
  `SimulationValidationError`.

**Design chosen: C (poison on execution failure) plus validate-then-commit lifecycle.**
Rejected A/B (rollback or copy/commit): either needs a full world + RNG + event-queue + metrics copy
per tick on the hot path, where every kernel read already pays a JSON clone (see WP5). The partial
state has no legitimate use after failure, so rollback would buy only the ability to continue a run
after a bug, which is not a product requirement. Rejected per-command prevalidation of arbitrary
batches: commands within a batch depend on each other (create then add component), so it would need a
dry-run interpreter. Considered and rejected rollback only for external batches: apply-time failures
of external batches are bugs (intervention preconditions are checked in `build()` before
`applyCommands`), and a second failure model would add a concept for no user-visible benefit.

**Files changed.** `kernel/SimulationEngine.ts` (failure state, guards, validate-then-commit lifecycle,
metrics after validation, shared `buildInitialWorld` replacing duplicated constructor/reset code),
`kernel/Errors.ts` (`SimulationFailure`, `SimulationEngineFailedError`), `kernel/Scheduler.ts`
(wrapped system errors now include the original message, which previously reached the UI only as
"System X failed"), `interventions/interventionExecutor.ts` (refuse on failed engine; do not try to
record into an engine the intervention just failed), `runtime/RuntimeSession.ts` (`runFailed`),
`runtime/RuntimeWorkerHost.ts` and `runtime/LocalRuntimeDriver.ts` (failed run is never a recoverable
rejection), `state/simulationStore.ts` (`play`, `clearInterventions`, `exportSnapshot` surface refusal
as `lastError` instead of throwing out of UI handlers), `simulation/README.md` (Failure Semantics).

**Tests added.** `src/simulation/__tests__/engine.failureSemantics.test.ts` (19) and
`src/state/simulationStore.failure.test.ts` (1). They detect: stepping, running, applying, playing,
or exporting a failed engine; a failed tick's queued command surviving; a partially validated external
batch leaking into the next tick; metrics recorded for a failed tick; due events redelivered;
RNG draws from a failed tick shifting a rebuilt run; `validateWorld` failures continuing; a restore
that half-commits before failing validation; a failed rebuild clearing the failure; a Worker mid-tick
validation failure reported as recoverable; UI actions throwing on a failed engine. Tests removed:
none.

**Mutation exercise.** Ten single-point mutations were each detected by at least one test and then
reverted byte-identical: allow step on failed engine (11 tests failed), omit pending-command cleanup
(1), collect metrics before validation (2), keep a partially-validated batch pending (1), no failure
on applyCommands (3), restore committing before validation (1), allow play (1), allow snapshot export
(3), Worker host treating a failed run as recoverable (1), reset not clearing failure (6).

**Verification.** `npm run typecheck` PASS; `npm run lint` PASS (397 files); full `npx vitest run`
92 files / 793 tests PASS.

**Remaining risk.** P3: `engine.world`, `engine.commandBuffer`, and `engine.registry` remain public
fields, so code can still mutate a failed engine directly; no production caller does. P3:
`CommandBuffer.history` (K7) is still not cleared by rebuilds and still has no production consumer.
P3: the failure-time Worker UI projection reads the selected entity from the failed engine's partial
world; it is labelled `playback: "failed"`, so it does not present as a successful tick.

### WP2 — Space and command kind safety — VERIFIED

**Revalidation.** Space kinds and accepted locations: `Continuous2DSpace` ↔ finite `{x, y}` (checked
internally by `assertPoint`), `Grid2DSpace` ↔ integer `{row, col}` (checked by `normalizeCell`),
`NetworkSpace` ↔ no location. Its `addEntity(entityId, location = entityId)` added `location`, not
`entityId`, as the node, so any non-default location corrupted membership. Network membership is created
only by templates calling `network.addEntity(entity.id)` directly (Neural); no template or
intervention sends network membership through commands, and the command schema could not express a
string node id anyway. The generic path could therefore only ever send a wrong-shaped value to a
network. The regression test reproduced the exact Phase 1 crash
(`TypeError: left.localeCompare is not a function`). Two further pre-mutation gaps: `createEntity`
created the entity and its components before resolving its spaces, so a missing space or a
wrong-kind location left a half-created entity; `moveEntities` could move some entities before
rejecting a later wrong-kind location. `SpaceLocation`'s third arm `Record<string, unknown>` (and the
matching schema/hot-path arm) accepted any JSON object as a location.

**Contract.** A location is `Point2D | GridCell`; networks have no locations. `createEntity`,
`moveEntity`, and `moveEntities` resolve the target space and check the location against its kind
before mutating anything; missing spaces and wrong-kind locations (including any placement into a
network) throw a named error before the command mutates. Locations that are neither points nor cells
are rejected at command validation, so an external batch containing one is rejected without applying
or failing the run (WP1). `NetworkSpace.addEntity` refuses a location other than the entity's own id.
Apply-time rejections inside a batch still fail the run under WP1; the difference is that the world
is no longer corrupted and stays inspectable.

**Design.** Chose D + B-lite: network membership is kept off the placement path, and one function,
`isLocationForSpaceKind(kind, location)` in `spaces/Space.ts`, is the single kind↔shape rule, applied
in `CommandBuffer` via `requireSpace` + `assertLocationFits`. Rejected: per-space command variants and
a dedicated network-placement command, because nothing would use them; redesigning `Space<TLocation>`
(`NetworkSpace.moveEntity` remains an unreachable interface stub); kind-aware validation at
`CommandBuffer.add` time, which would need world access in the buffer, although spaces are fixed per
world. The now-redundant shape checks in `SystemCommandSink.moveEntity/moveEntities` were deleted
because command validation performs the same check.

**Files changed.** `spaces/Space.ts`, `spaces/NetworkSpace.ts`, `kernel/Validation.ts`
(`spaceLocationSchema`, `isSpaceLocationValue`), `kernel/CommandBuffer.ts`, `simulation/README.md`.

**Tests added.** `src/simulation/__tests__/engine.spaceKindSafety.test.ts` (10). They detect: the
Phase 1 network corruption path; wrong-kind continuous and grid locations creating an entity or
components; one invalid location among several creating or placing anything; placement into a
missing space creating the entity; movement into a network; a batch move partially applying before a
wrong-kind location; non-point/non-cell locations passing validation; a network node differing from
its entity id. They also pin that valid placement, edge commands, and schema rejection of wrong-shaped
imported space state still work. Old code failed 7 of 10. Five mutations (network accepts
locations, grid accepts points, network stores the location, Record escape hatch restored, no batch
kind check) were each detected and reverted. Tests removed: none.

**Verification.** `npm run typecheck` PASS; `npm run lint` PASS; full Vitest 93 files / 803 tests
PASS, including Flocking neighbor-equivalence and determinism suites (trajectories unchanged).

**Remaining risk.** P2 (pre-existing, not F9): `assertWorldInvariants` still does not check that
space and network entries refer to existing entities; an imported snapshot can reference an absent
entity id in a space. Kind and representation are schema-checked; membership coherence is not.

### WP3 — Hostile-input depth hardening — VERIFIED

**Revalidation.** Recursion paths over untrusted data: (1) `jsonValueSchema`, the only recursive Zod
schema in the codebase (`z.lazy` union), shared by the kernel scenario/snapshot/command schemas, the
Worker protocol, RunConfig/experiment/comparison validation, and about 20 Builder/service artifact
validators; (2) `serializableIssue` (`assertSerializableValue`/`assertComponentValue`), which the Worker
protocol reaches on raw message data through `validateCommand`'s hot path and `validateRunConfig`;
(3) `JSON.stringify`/`structuredClone` clones, which in V8 overflow at extreme depth (measured:
`JSON.parse` handles 200,000 levels, while `JSON.stringify` and `structuredClone` throw `RangeError`).
The Builder key scanners are already iterative, and every Builder deserializer clones only after schema
validation. Reproduced before the fix: `RangeError` from scenario, snapshot, runtime-artifact, Worker
protocol, RunConfig, command, and **Builder model-schema** imports; infinite recursion on cyclic
programmatic input; and the pasted-import path reporting `Cannot read properties of null` for `null`.

**Measured legitimate depth.** All seven production templates, run with every applicable
intervention applied: whole snapshot depth 7; deepest JSON-valued field 4 (globals event log and
intervention history); components 1; parameters 1.

**Contract / design.** One constant, `maxJsonValueDepth = 64` (`kernel/Validation.ts`). That is 16× the
measured legitimate maximum, and well under the measured overflow point of the old recursive schema: it
overflowed Node's default stack between 1,000 and 2,000 nested arrays (2,000–4,000 nested objects), far
below the 50,000 used in Phase 1, so ordinary hostile input was enough. `jsonValueSchema` is now a
`z.custom` depth gate piped into the unchanged recursive schema. Zod's pipeline does not run the
recursive stage on a failed gate, so recursion is bounded, output shape is unchanged, and every consumer of
`jsonValueSchema` is covered without per-deserializer preflights. The gate function's own recursion is
bounded by its depth budget, which also rejects cycles. `serializableIssue` got the same bound. Fixed
positions (non-JSON-value schema fields) already reject nesting at the first mismatch without
recursing. Rejected: a global size cap on the main-thread import path (not needed for the verified
defect; the Worker path already has `maxRuntimeArtifactJsonLength`); replacing the Zod schema with a
hand-written validator (changes output identity and error paths across ~24 modules); per-deserializer
preflights (easy to miss a path).

**Files changed.** `kernel/Validation.ts`, `state/simulationStore.ts` (`importJson` reads `templateId`
only from a plain object), `simulation/README.md`.

**Tests added.** `src/simulation/__tests__/engine.hostileInput.test.ts` (8), covering: at-limit
acceptance with round trip and continuation; limit + 1 rejection naming the limit; 100,000-level arrays,
objects, and mixed nesting in scenario metadata, snapshot globals, and event payloads; hostile nesting in
non-JSON-value positions; cyclic programmatic input; runtime artifact, Worker protocol, RunConfig,
`setGlobal`, and hot-path `setComponents`; Builder model-schema import; and store paste import of
`null`/`[]`/`42`/deep JSON reporting a payload error while keeping the current engine. Old code failed
6 of 8. Mutations detected: accept limit + 1, reject at limit, unbounded `serializableIssue`. Tests
removed: none.

**Verification.** `npm run typecheck` PASS; `npm run lint` PASS; full Vitest 94 files / 811 tests PASS.

**Remaining risk.** P3: the main-thread paste import has no size cap (a very large paste stalls the
main thread in `JSON.parse`; it does not crash). P3: `assertSafeStarterWorldValue` is recursive, but
it only sees static module content and ID-only launch queries, never nested user input.

### F8 — Flocking Worker detached-buffer read — VERIFIED

**Revalidation / reproduction.** `RuntimeSession` cached the last `RenderFramePacket` and reused it for
UI-only publications (`play`, `pause`, `setSpeedMultiplier`, `fail`). The host transfers a frame's
eight buffers on publication, so the cached frame's `selectedDetail.neighborIds` was often detached and
read as length 0. New end-to-end test (`WorkerRuntimeDriver` over the host-backed transport, which
uses `structuredClone` with a real transfer list): select `e000001` in a 500-boid run (true
proximity count 155), then pause. The published UI reported `currentProximityCount: 0`.

**Contract.** Once `projectFrame()` returns a frame, the session never reads it again. The session
keeps a plain `FrameFacts` copy (template id, tick, time, entity count, alignment, signature, and
selected entity id + proximity count), taken at projection time, and UI projections read only that.

**Design.** Rejected "always re-project a frame for UI-only updates": it would add a full 500-entity
projection and a phantom `framesProjected`/publication id per pause/play/speed change. Rejected copying
buffers before transfer: unnecessary allocation. No change to Worker generation, backpressure,
coalescing, or transfer lists (R1–R5 remain rejected).

**Files changed.** `runtime/RuntimeSession.ts`, `runtime/flockingProjection.ts`
(`createFlockingSelectedUIProjection` takes `SelectedProximity` rather than the transferable detail;
`selectedProximityOf` reads it before transfer).

**Tests added.** `runtime.performanceArchitectureAudit.test.ts`: "keeps the selected proximity count
exact in UI updates published after the frame was transferred" (fails with 0 ≠ 155 before the fix,
and checks that each UI revision advanced, so it cannot pass on a stale UI). Tests removed: none.

**Verification.** Runtime/immersive/production-adoption suites: 72 tests PASS; typecheck PASS.

### WP4 — CI enforcement and dependency hygiene — VERIFIED LOCALLY; GITHUB ENFORCEMENT UNVERIFIED

**State found at session recovery.** `.github/workflows/ci.yml`, `.github/dependabot.yml`, and `.nvmrc`
existed, but the workflow's main step ran `npm run verify`, which did not exist in `package.json`, so the
`verify` job would have failed on every run. No dependency had been upgraded: the lockfile was still at
the `28dca70` versions, so the workflow's `npm audit --audit-level=high` job would also have failed.

**Dependency remediation.** `npm audit fix` (semver-compatible only) moved `next` 15.5.19 → 15.5.26,
`sharp` 0.34.5 → 0.35.4, `nanoid` 3.3.12 → 3.3.19, `vitest`/`@vitest/*` 4.1.8 → 4.1.11, and Vite's
`postcss` 8.5.15 → 8.5.28. That left `postcss@8.4.31` (high), which every `next@15.5.x` pins exactly, and
`next` itself reported moderate only through that dependency; `npm audit fix --force` would have
installed Next 16 (major). Instead `package.json` has a scoped override, `overrides.next.postcss =
^8.5.28`, so Next's PostCSS is the patched release of the same major line. Next 15 loads the real
`postcss` package at build time (`require('postcss')` in its CSS config) through the PostCSS 8 plugin
API, which 8.5 keeps; the production build and the full Playwright suite below ran on the overridden
version. The `next` and `vitest` ranges were raised to `^15.5.26` and `^4.1.11` so an install without the
lockfile cannot resolve a vulnerable version. The lockfile diff against `28dca70` contains only those
packages, their platform binaries (`@next/swc-*`, `@img/sharp-*`), and three transitive patch bumps
(`semver` 7.8.5, `tinyrainbow` 3.1.1, `@jridgewell/sourcemap-codec` 1.6.0). No major version changed.

**Dependency state after remediation (`npm audit`, clean `npm ci`):** 0 vulnerabilities (Phase 2 start:
1 critical, 3 high, 2 moderate).

**CI definition (`.github/workflows/ci.yml`).** Triggers: every `pull_request`, `push` to `main`, and
manual dispatch. Permissions are read-only. Node comes from `.nvmrc` (`24`, a major-version pin; local
verification used 24.16.0). Every job installs with `npm ci` from the lockfile. No step or job uses
`continue-on-error`; every step is a plain command, so a non-zero exit fails the job. Concurrency cancels
superseded runs of the same PR only. The npm cache (`setup-node` `cache: npm`) caches the download cache,
not `node_modules`, so it cannot change what `npm ci` installs.

| Job | Runs on | Command | What it gates |
| --- | --- | --- | --- |
| `verify` | every PR and `main` push | `npm run verify` = `typecheck` → `lint` (`lint:types`, `lint:architecture`) → `vitest run` → `next build` | types, unused symbols, architecture boundaries and seeded-randomness rule, full unit suite, production build |
| `e2e` | every PR and `main` push, after `verify` passes | `npx playwright install --with-deps chromium`, `npm run test:ui` | full Playwright + Axe suite (Chromium, against `next dev` started by Playwright's `webServer`); report and traces uploaded on failure |
| `audit` | every PR and `main` push | `npm audit --audit-level=high` | no high or critical advisory in the lockfile |

With `CI=true`, `playwright.config.ts` forbids `.only`, retries a failed test once, and always starts
its own server. A test that fails and then passes on retry is reported as flaky but does not fail the job.
Dependabot opens weekly grouped npm minor/patch PRs (majors separately) and monthly GitHub Actions PRs.
Nothing runs on a schedule, so a newly published advisory surfaces on the next PR or `main` push, where
the `audit` job fails even when the PR does not touch dependencies (intended: fail closed).

**Acceptance evidence (local).** Appending `export const injectedNoise = Math.random();` to
`src/simulation/kernel/EntityStore.ts` made `npm run verify` exit 1 at `lint:architecture`
("authoritative simulation code must use seeded RandomService streams, not Math.random") before tests
or build ran; the file was restored. The workflow YAML parses, and every `npm run` target it invokes
exists in `package.json`.

**Not verified.** The workflow has never run on GitHub: the Phase 2 changes are uncommitted, and `gh` is
not installed here. Whether `verify`, `e2e`, and `audit` block merges depends on branch protection
(required status checks on `main`), a repository setting that is not visible from the repository.
Until one run completes green on GitHub and those checks are marked required, CI reports failures but
is not proven to block them.

**Baseline audit (Phase 2 start, `npm audit`, lockfile at `28dca70`), kept for comparison:** 6 vulnerabilities
(1 critical, 3 high, 2 moderate). The set differs from Phase 1: `nanoid` and `vitest` are now listed.

| Package | Installed | Path | Severity | Advisories (fixed in) | Exercised by ORTUS? |
| --- | --- | --- | --- | --- | --- |
| `next` | 15.5.19 | direct | critical | GHSA-2xp9-vwfh-vxw4 image-optimizer AVIF RCE, GHSA-p293-qw3h-jr36 Windows RCE (≥15.5.24); GHSA-m99w-x7hq-7vfj Server Actions DoS, GHSA-89xv-2m56-2m9x / GHSA-p9j2-gv94-2wf4 SSRF, 4 moderate cache/Server-Function/SVG issues (≥15.5.21) | Yes: `StartHub` uses `next/image` (Image Optimization API under `next start`); middleware issues a same-origin `NextResponse.rewrite`. No Server Actions (`"use server"` absent). |
| `postcss` | 8.4.31 (pinned exactly by every `next@15.5.x`), 8.5.15 (via `vite`) | transitive | high | GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849, GHSA-fxqj-rqcc-2cmp source-map file read, GHSA-qx2v-qp2m-jg93 XSS (≥8.5.23) | Build-time only, on first-party CSS. Exploitation needs attacker-controlled CSS in the build input. |
| `sharp` | 0.34.5 | transitive (optional dep of `next`) | high | libvips/libheif CVEs (≥0.35.4) | Yes: backs `next/image` optimization. |
| `nanoid` | 3.3.12 | transitive (via `postcss`) | high | GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8 infinite loop on non-positive size (≥3.3.18) | Not with attacker-controlled sizes. |
| `vitest` / `@vitest/mocker` | 4.1.8 | direct (dev) | moderate | GHSA-82fw-gwwq-j7x9 path traversal via redirect mock (≥4.1.11) | Dev/test only. |

Upgrade constraints: the newest Next 15 patch (15.5.26) still pins `postcss@8.4.31`; only Next 16
(major) moves to `postcss@8.5.23`. `next@15.5.24+` widens `sharp` to `^0.34.3 || ^0.35.4`. (Resolved
above with the scoped `postcss` override instead of a Next 16 upgrade.)

### WP5 — Kernel deep-clone cost (K6) — MEASURED; OPTIMIZED 19–50% MS/TICK; FURTHER REDUCTION DEFERRED

**Benchmark review.** The first `npm run perf:clone` reported `msPerTick` measured while the 100 µs
sampling profiler was running, from one sample per scenario; two runs of that version differed by up to
49% on the same workload (Flocking 500: 71.7 vs 48.2 ms/tick). It was rewritten: 10 warmup ticks, then the
median of 5 unprofiled blocks (fastest–slowest block reported as `range`), then a separate profiled pass
used only for attribution. Engine construction and warmup are excluded. Neural and Schelling were added so
all seven production templates are covered, and each top clone caller is shown with its own caller. The
report writes no files. Profiler sample shares are labelled as such and are not wall-time savings.

**Isolation method (A vs B).** A scratch harness outside the repository ran the same deterministic
workloads, with the same seeds and tick counts, in a fresh process per variant, over 5 interleaved rounds.
The reported figure is the median of the per-round medians. A SHA-256 of each run's final
`exportSnapshot()` compares behaviour. Variants: pre-WP5 code (a snapshot of `src/simulation` served by a
Vite `load` hook), post-WP5 code, and two measurement-only builds that rewrite code at transform time and
never exist in the repository: `deepClone` as identity (all clone cost removed) and `ComponentStore.get`
without its copy. Before any change, disabling every clone cut ms/tick by 47–74% on every workload with
byte-identical final snapshots. Clone cost was therefore the largest single cost in the step, and no
template's results depended on the copies in these runs. A per-site pass (one round, indicative only)
ranked the liveness `EntityStore.get`, `ComponentStore.get`, and Neural's `globals` reads highest.

**Per-call-site decisions.**

| Call site | Why it copied | Guarantee needed? | Decision |
| --- | --- | --- | --- |
| `EntityStore.get` in `WorldView.entitiesWith` (alive filter, runs for every system query) and `CommandBuffer.requireAlive` | read `.alive` from a copy | No: the copy was discarded after reading one boolean | `EntityStore.isAlive(id)`, no copy |
| `CommandBuffer.add` | hot-path validation returns the caller's own object; the copy isolates the queued payload | Yes | Kept; now the only copy of an entry |
| `CommandBuffer.drain` | copy entries being handed over | No: after `splice` the buffer holds no reference to entries it already owns | Removed |
| `CommandBuffer.apply` → `history`; `SimulationRuntime.recordCommands` → `lastCommands` | keep records independent of callers; each copied every applied command, then trimmed to the last 200 | Only against mutation after read-out | Retain owned entries; copy at the read-outs: `recent()` and `debugData()` (already copying) and `SimulationEngine.applyCommands`' return value (new; external batches are small) |
| `ComponentStore.add/set/patch`, `EventQueue.schedule`, `setGlobal`, space normalizers | the store owns its values | Yes; it is also what keeps recorded entries from aliasing world state | Kept |
| `ComponentStore.get` (`getComponent`) | systems may mutate what they read; world changes only through commands | Yes, as the current public contract | Deferred (below) |
| `EntityStore.all()` (`allEntities`, `aliveEntities`, `serialize`) | same, for entity metadata | Yes | Deferred (below) |
| `WorldView.globals` | private copy of all globals | Yes, but Neural read it about 30 times per tick (8 in the activation system, 18 in metrics, 4 in `validateWorld`), each copying all globals including up to 12,000 synapses, to use one key | New `WorldView.getGlobal(key)` (private copy of one own-property global). Neural metrics use it; Neural's activation system and world validation read `globals` once per call. Each later read in those functions uses a different key, and different keys of one JSON copy are disjoint, so results are identical |
| `EventQueue.popDue`, `SimulationRuntime.setDueEvents/due`, `MetricsCollector.collect` | redundant or boundary copies | Partly | Unchanged: within noise |

**What each removed copy was preventing, and what prevents it now.**
- Liveness copy: nothing (boolean read).
- `drain` copy: nothing (entries already exclusively owned).
- `history`/`lastCommands` copies: a caller mutating an entry obtained from `applyCommands`, `recent()`, or
  `debugData()` would have rewritten the record. The three read-outs now copy. Store writes copy, so an
  in-place change to a stored value (for example through the trusted `getMutable`) cannot reach a record.
- Neural `globals`: each function still works on its own private copy.

**Tests added.** `src/simulation/__tests__/engine.ownership.test.ts` (4) makes the previously implicit
contract explicit:
- a payload mutated after `setComponents`/`moveEntities` (the hot validation path) applies as queued;
- a system mutating every read (`getComponent`, `getEntity`, `allEntities`, `aliveEntities`, `globals`,
  `getGlobal`, `events.due`) changes nothing;
- destroyed entities are excluded from queries and skipped under `allowMissing`;
- recorded commands are unchanged by later world updates, by in-place store mutation, and by mutating
  `recent()`, `debugData()`, or `applyCommands` output.

The pre-`getGlobal` part passed on the pre-WP5 code. Nine single-point mutations were each detected and
reverted byte-identical: enqueue copy removed (3 tests failed); `applyCommands`, `recent()`, or
`debugData()` returning retained entries (1 each); component store keeping the payload reference (1);
`isAlive` ignoring the destroyed flag (2); `getGlobal` returning the live value (1) or reading inherited
keys (1); `getComponent` returning the live value (3). Tests removed: none.

**Result (5 interleaved rounds; median ms/tick; final snapshot hash identical in all 20 runs per workload
across the four variants).**

| Workload | Entities | Before | After | Improvement | Paired per round | Clone cost left (share of after) | of which `getComponent` copy |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| Epidemic 80 | 80 | 9.86 | 7.69 | 22.0% | −3% to 26% | 32% | 18% |
| Flocking 160 | 160 | 10.32 | 6.83 | 33.8% | 30% to 44% | 51% | 25% |
| Neural default | 80 | 36.27 | 18.28 | 49.6% | 45% to 52% | 15% | 1% |
| Opinion 300 | 300 | 30.48 | 23.69 | 22.3% | 15% to 26% | 47% | 25% |
| Schelling default | 1,339 | 39.23 | 24.90 | 36.5% | 28% to 43% | 59% | 39% |
| Forest Fire 60×40 | 2,400 | 15.50 | 12.49 | 19.4% | 16% to 25% | 61% | 31% |
| Flocking 500 | 500 | 49.01 | 34.87 | 28.9% | 24% to 31% | 27% | 12% |
| Epidemic 1000 | 1,000 | 139.66 | 108.10 | 22.6% | 16% to 26% | 33% | 18% |
| Predator-Prey 1000 prey | 1,283 | 66.31 | 40.10 | 39.5% | 33% to 45% | 57% | 31% |
| Forest Fire 160×120 | 19,200 | 130.34 | 102.71 | 21.2% | 12% to 37% | 56% | 29% |

The improvement holds as scale grows: Flocking 34% at 160 boids and 29% at 500; Epidemic 22% at 80 agents
and 23% at 1,000; Forest Fire 19% at 2,400 cells and 21% at 19,200. One of 50 paired rounds was negative
(Epidemic 80, −3%). Machine: WSL2, Node 24.16.0; absolute numbers are machine-specific. The committed
`npm run perf:clone` after WP5 shows Neural's clone sample share at 5.4%; before WP5, disabling every clone
cut Neural's ms/tick by 57%. Its top remaining clone callers are `ComponentStore.get` via `getComponent`, `EntityStore.all`,
and `CommandBuffer.add`.

**Production changes.** `kernel/EntityStore.ts` (`isAlive`), `kernel/World.ts` (`entitiesWith` uses
`isAlive`; `getGlobal`), `kernel/CommandBuffer.ts` (ownership comment, no `drain`/`history` copies,
`requireAlive` uses `isAlive`), `kernel/SimulationRuntime.ts` (no `lastCommands` copy),
`kernel/SimulationEngine.ts` (`applyCommands` returns copies), `templates/neuralExcitation.template.ts`
(read-once `globals`, `getGlobal` in metrics), `simulation/README.md` (ownership contract and
`perf:clone`), `testing/clonePerformanceReport.ts`.

**Deferred, with reasons.**
1. The `ComponentStore.get` copy, 12–39% of post-WP5 time on nine of ten workloads (1% on Neural). Returning shared
   references is safe only with enforced immutability: stored values deep-frozen and `getComponent`
   returning deep-readonly types. That changes the contract for about 100 read sites across seven
   templates plus the UI, intervention, and metric consumers of `WorldView`. Any code that mutates its
   read copy today would throw at runtime. It needs its own design and audit, not a hardening patch.
2. The `EntityStore.all()` copies behind templates' per-tick `validateWorld` (`componentEntityIds` via
   `allEntities`). A type-guarded shallow copy of the flat entity record, or template use of
   `entitiesWith`, would help. The second changes semantics, since `allEntities` includes destroyed
   entities.
3. Per-tick `assertWorldInvariants` serializes every space (`Grid2DSpace.serialize` ← `step` was 6% of
   samples on Forest Fire 160×120). That is invariant-checking cost, not clone ownership.

**Rejected.** `structuredClone`, a custom recursive copier, Immer, persistent structures, and
copy-on-write worlds. No correctness requirement calls for them. A structural copier would also change
value semantics: the JSON round trip turns `-0` into `0` and drops `undefined`, while
`Math.atan2(-0, -1) ≠ Math.atan2(0, -1)`. That would need its own determinism migration.

**Verification.** `npm run typecheck`, `npm run lint` PASS. Full Vitest 96 files / 820 tests PASS (816
before WP5 + 4 ownership tests). Neural, determinism, failure-semantics, space-kind, validation, and event
suites PASS with trajectories unchanged.

### WP6 — Application-state error scoping and stale sweep labelling (STATE1, STATE2) — VERIFIED

**Revalidation.** STATE1 confirmed on `28dca70`: `lastError` was one string, and 21 success paths set it to
`null` (speed change, step, frame advance, run capture, comparison delete/clear, scenario/snapshot export,
experiment import, intervention clear, and others), so an unread Setup or import error disappeared when
the user did something unrelated in another panel. The stage banner labelled every error "Engine
message". STATE2 confirmed: `latestExperimentResultSet` survives `selectTemplate`, and "Add Experiment
Runs" gave no sign that the sweep came from another model (the imported summaries were already tagged
with the sweep's own `templateId`, so this was an honesty gap, not data corruption).

**Contract.** `lastError` is `{ area, text }` with area `run | setup | intervention | comparison | file`. A
successful action clears only an error in its own area; a rebuilt run (reset, seed/parameter/template
change, scenario apply, import) also clears `run` and `intervention` errors, which referred to the
discarded run. A failure in any area still replaces the current error (one error slot, not a queue); what
changed is that successes no longer dismiss other areas' errors. The banner names the area. A retained
sweep from another model stays available (clearing it would discard the user's sweep on a model
switch), but the button reads "Add <Model> Sweep Runs", an adjacent note says the sweep ran a different
model and that cross-model comparison is limited to shared metrics, imported labels start with the
sweep's model name, and the notice names the model.

**Consequential fixes.** `StarterRemixWorkspace.runRemix` treated any `lastError` after `applyScenario`
as a remix rejection; with scoping, an unrelated retained error would have blocked a valid remix, so it
now checks only the `setup` area. The banner's existing suppression of a message already shown by the
Worker failure alert is kept, now limited to a failed Worker run.

**Files changed.** `state/simulationStore.ts`, `components/WorldStage.tsx`,
`components/RunComparisonPanel.tsx`, `components/runtime/ProductionRuntimeProvider.tsx` (area on every
runtime feedback call), `components/builder/remix/StarterRemixWorkspace.tsx`,
`components/runtime/productionRuntimeAdoption.test.ts` (assertion reads `.text`).

**Tests added.** `src/state/simulationStore.messages.test.ts` (4): a Setup error survives capture, export,
speed change, and step until Setup succeeds; a failed-run error survives unrelated successes until the
run is rebuilt; an area's own success clears its stale error; a retained sweep imports under its own
model with a model-labelled notice and mixed-model comparison warns. `tests/ui/world-state-feedback.spec.ts`
(2, Playwright): the banner names the area and survives an unrelated Capture Run; after a model switch the
sweep button, note, and imported run label name the sweep's model. Mutations detected: successes clear
every area (2 tests fail); a rebuild no longer clears run errors (1 fails). Tests removed: none.

**Remaining risk.** P3: `lastNotice` is still one unscoped slot, so one panel's success notice replaces
another's (notices are transient information, not unread failures). P3: one error slot means a second
failure replaces the first; it is replaced visibly, not silently cleared.

### K4 — Same-tick event timing — DOCUMENTED

WP1's plan included deciding the K4 contract, and the ledger had no entry for it. Existing behaviour is
kept and made explicit: due events are collected once per step before any system runs, so an event
emitted during tick `t` for tick `t` is delivered at the start of tick `t + 1`. Delivering it later in the
same tick would change the timing of every event-driven template. Documented in `src/simulation/README.md`
(Event Queue); pinned by `engine.events.test.ts` "delivers an event emitted for the current tick at the
start of the next step, not later in the same tick".

## Phase 2 — Final Disposition

### Phase 1 findings

| Finding | Disposition | Executable evidence |
| --- | --- | --- |
| F1 (K1) failed tick left partial state and the run continued | FIXED | The failed run is poisoned: step/runSteps/applyCommands/play/export/intervention refuse with `SimulationEngineFailedError`; the partial world is inspectable only. `engine.failureSemantics.test.ts` (19) plus the Worker-host test; 10 mutations detected. No rollback, by design (WP1). |
| F2 (K2) failed tick's queued commands leaked into the next tick | FIXED | Pending commands are cleared on failure and the failed engine refuses to step. Covered by the failure-semantics tests for leaked queued commands and partially validated batches. |
| F3 (K3) command batch applied an arbitrary prefix and continued | FIXED | Batches are shape-validated as a whole before any command applies (a rejected batch changes nothing and leaves the run usable). An apply-time failure fails the run; commands before it are not rolled back (documented contract, `src/simulation/README.md` Failure Semantics). |
| F4 (K8) no adversarial kernel tests | FIXED | 19 failure-semantics + 10 space-kind + 8 hostile-input + 4 ownership kernel tests, and the K4 timing pin; 27 single-point kernel mutations detected (WP1 10, WP2 5, WP3 3, WP5 9). |
| F5 (SEC1) hostile nested import overflowed the stack | FIXED | `maxJsonValueDepth = 64` depth gate in front of the recursive schema and serializability check. `engine.hostileInput.test.ts` (8): 100,000-level payloads rejected cleanly on every import path. |
| F6 (SEC2) vulnerable dependencies | FIXED | `npm audit`: 0 vulnerabilities after clean `npm ci` (Phase 2 start: 1 critical, 3 high, 2 moderate). Semver-compatible upgrades plus one scoped `postcss` override; build and full Playwright on the upgraded tree (WP4). |
| F7 (GOV1) no CI | PARTIALLY VERIFIED | Workflow (`verify`, `e2e`, `audit`) and Dependabot defined; `npm run verify` fails on an injected `Math.random`. All three jobs ran green on GitHub for `2bb7bdc` (Phase 2 — GitHub CI Evidence). `main` has no branch protection and no ruleset, so nothing yet blocks a merge that fails these checks. |
| F8 (RUNTIME1) Flocking UI read a transferred (detached) frame buffer | FIXED | `RuntimeSession` keeps a plain `FrameFacts` copy. `runtime.performanceArchitectureAudit.test.ts` "keeps the selected proximity count exact…" (0 ≠ 155 before the fix). |
| F9 (K5) wrong-kind locations corrupted a network space | FIXED | Kind-checked placement and movement before any mutation; the `Record<string, unknown>` location arm removed. `engine.spaceKindSafety.test.ts` (10). |

Also closed: STATE1/STATE2 (WP6, VERIFIED), K6 (WP5, measured and partly optimized), K4 (documented).

### Final verification (working tree with all Phase 2 changes, uncommitted; Node 24.16.0, npm 11.13.0)

| Command | Result |
| --- | --- |
| `rm -rf node_modules && npm ci` | PASS; `found 0 vulnerabilities` |
| `npm run verify` (canonical local and CI gate) | PASS, exit 0 |
| ↳ `npm run typecheck` | PASS |
| ↳ `npm run lint` (`lint:types`, `lint:architecture`) | PASS; "Architecture lint passed (397 production TypeScript files checked)" |
| ↳ `npm test` (full Vitest) | PASS; 96 files / 821 tests |
| ↳ `npm run build` | PASS; Next.js 15.5.26, 23/23 static pages |
| `npx playwright test` (full Playwright + Axe, Chromium) | PASS; 215/215 in 36.2 min, 16 spec files, no retries or flaky results |
| Focused regression suites: failure semantics, store failure, space kinds, hostile input, runtime audit (F8), store messages, ownership, events, determinism, Flocking neighbor equivalence | PASS; 10 files / 91 tests |
| `npm run perf:clone` | Runs; results in WP5 |
| `npm audit` / `npm audit --audit-level=high` | 0 vulnerabilities / exit 0 |
| `npm run verify` with `Math.random` injected into `kernel/EntityStore.ts` | exit 1 at `lint:architecture` (expected; reverted) |
| Diff scan (new `.only`, `.skip`, `ts-ignore`, `ts-expect-error`, `as any`, debug logging, empty catch, TODO/FIXME) | none; two `Space<any>` signatures follow the existing `World.spaces` idiom |
| Profiler/benchmark artifacts in the tree | none; benchmark harnesses and snapshots stayed in the session scratch directory |

The changes were later committed and pushed straight to `main` (see Phase 2 — GitHub CI Evidence),
and the three jobs ran green on GitHub for that exact commit. Phase 2 is still **not complete** under
its own standard until those three checks are required on `main`.

### Phase 2 — GitHub CI Evidence

**Git state.** The Phase 2 changes are in two commits on `main`, both already pushed to `origin/main`:
`28dca70` (this ledger) and `2bb7bdc2a1019b6416117ccf28f6e889682ca64b` (all Phase 2 code, tests,
workflow, Dependabot, dependency upgrades, ledger results). They were pushed to `main` directly, not
through a hardening branch, and their subject lines ("Implement feature X…", "Refactor neural
excitation…") do not describe their contents. History was not rewritten because it is published on
`main`. This entry is carried on branch `phase2/ci-evidence`.

**Workflow run.** `CI` run 35808522808 (push to `main`, head `2bb7bdc`),
https://github.com/rohchav/ORTUS/actions/runs/35808522808 — conclusion **success**.

| Workflow job id | Check name (as GitHub reports it) | Result | Duration |
| --- | --- | --- | --- |
| `verify` | `Verify (types, lint, unit, build)` | success (`npm ci`, `npm run verify`) | 3m22s |
| `e2e` (needs `verify`) | `Browser and accessibility (Playwright + Axe)` | success (`npm run test:ui`; failure-artifact upload skipped) | 26m45s |
| `audit` | `Dependency audit (high and critical)` | success (`npm audit --audit-level=high`) | 7s |

The verification method was the public GitHub REST API without authentication, because `gh` is not installed on the
handoff machine. Job logs return HTTP 403 without authentication, so the per-test Playwright output and
any retry/flaky count on GitHub were **not** inspected. The job passed, but a test that failed once
and passed on its retry would not show at this level. No CI-only repairs were needed.

**Annotations (all three jobs).** Warning: `actions/checkout@v4` and `actions/setup-node@v4` target the
deprecated Node.js 20 Actions runtime and are forced onto Node.js 24. Notice: `ubuntu-latest` migrates to
Ubuntu 26 from 2026-10-19. Dependabot has opened update branches for `actions/checkout`,
`actions/setup-node`, and `actions/upload-artifact` v7. These branches are not merged or evaluated here.

**Main protection.** As of this entry, `GET /repos/rohchav/ORTUS/branches/main` reports
`protected: false`, and `GET /repos/rohchav/ORTUS/rules/branches/main` returns no rules. Required
status checks are **not enforced**. Configuring them needs repository-admin access, which the handoff
machine lacks. Remaining action: require the three check names above on `main`, through a ruleset or
branch protection.

### Remaining risks (no P0 or P1 known)

- P2 (governance): CI ran green on GitHub (run 35808522808), but `main` has no required status checks,
  so F7 is partially verified, not fixed. Phase 2 commits went to `main` without passing through CI first.
- P3: GitHub Playwright retry/flaky count for run 35808522808 not inspected (logs need authentication).
- P3: `actions/checkout@v4` / `actions/setup-node@v4` run on the deprecated Node.js 20 Actions runtime
  (GitHub forces Node.js 24); `ubuntu-latest` moves to Ubuntu 26 from 2026-10-19.
- P2: `assertWorldInvariants` does not check that space and network entries refer to existing entities
  (WP2 remaining risk, pre-existing).
- P2 (performance): after WP5, remaining clone cost is 15–61% of per-tick time. The largest part is the
  `getComponent` read-copy contract (WP5 deferred item 1), then `allEntities` copies and per-tick space
  serialization in invariant checks.
- P3: `engine.world`, `engine.commandBuffer`, `engine.registry` are public; `getMutable` accessors are
  trusted-code-only by convention (README), not by type.
- P3: `CommandBuffer.history` (K7) is still not cleared by rebuilds and has no production consumer.
- P3: main-thread paste import has no size cap (stalls, does not crash).
- P3: `lastNotice` is one unscoped slot; one error slot (WP6).
- P3: CI retries a failed Playwright test once, so a flaky test passes as flaky rather than failing.
  Actions are pinned by major tag, not commit SHA.
- P3: STATE3 (three hand-written fresh-run paths in `simulationStore.ts`) and ARCH2 unchanged.

---

# Phase 1 — Forensic Investigation

Status: Phase 1 (investigation only). No production code was modified by this pass. Three throwaway
diagnostic test files were created under `src/simulation/__tests__/zzz-diagnostic-*.test.ts` to obtain
executable evidence for specific hypotheses, run, and then deleted; none remain in the tree.

This document is the canonical engineering ledger for the hardening program. Update it rather than
creating parallel audit files.

---

## Baseline

- Branch: `main`. Commit: `8114043` ("feat: build visual systems workbench"). Working tree clean at
  investigation start and at time of writing.
- Environment: Node v24.16.0, npm 11.13.0, Linux (WSL2). Package manager: npm (`package-lock.json`
  present, no other lockfile). No `.nvmrc`/engines field pinning Node version.
- Dependencies are minimal: runtime deps are `next`, `react`, `react-dom`, `zod`, `zustand` (5 packages);
  dev deps add `@playwright/test`, `@axe-core/playwright`, `typescript`, `vitest`, `vite-node`.

| Command | Purpose | Result |
| --- | --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | Strict TS typecheck | **PASS**, ~3s, 0 errors |
| `npm run lint:types` (`tsc --noEmit --noUnusedLocals --noUnusedParameters`) | Unused-symbol lint | **PASS**, ~15s, 0 errors |
| `npm run lint:architecture` (`node scripts/lint-architecture.mjs`) | Custom static lint: import boundaries, `Math.random` ban in authoritative sim code, dynamic-execution ban, intrinsic-JSX a11y baseline | **PASS** — "Architecture lint passed (397 production TypeScript files checked)" |
| `npx vitest run` | Unit/behavior suite | **PASS** — 773 tests / 90 files, 0 failures, 86.3s wall |
| `npm run build` (`next build`) | Production build | **PASS** — compiles, generates 23 routes (static/dynamic/SSG mix), no type/lint errors surfaced by Next's own pass |
| `npx playwright test` | e2e + Axe accessibility suite, 213 tests / 15 spec files | **PASS** — 213/213 passed, 0 failures, 35.9 minutes wall (Chromium only; `research-world-shell.spec.ts` alone took 7.6 minutes) |
| `npm audit` | Dependency vulnerability scan | **6 vulnerabilities: 1 critical, 3 high, 2 moderate** (see Risk Register SEC2) |

No CI configuration exists anywhere in the repository: no `.github/workflows`, no other CI YAML, no
Dependabot/Renovate config (confirmed by direct filesystem search). None of the commands above are
enforced by any automated merge gate — they are documented developer commands only (see H10 / GOV1).

`npm run lint` is the union of `lint:types` + `lint:architecture` only. Per AGENTS.md's own instruction
this must not be described as full ESLint, browser, screen-reader, assistive-technology, or WCAG
coverage, and it is not: there is no ESLint configuration in the repository at all: `lint:types` is a
stricter `tsc` pass, and `lint:architecture` is a hand-written 517-line AST-walking script, not ESLint.

---

## Architecture Map

### Simulation kernel (`src/simulation/kernel/`, 21 files, 3,616 lines)

Authority for all modeled state. Verified independent of React/Zustand/DOM/Canvas (architecture lint
enforces this; confirmed by reading every kernel file — no disallowed imports found).

- `SimulationEngine` is the single authoritative object per run: owns `World`, `SimulationClock`,
  `RandomService`, `SystemRegistry`, `MetricsCollector`, `CommandBuffer`, `SimulationRuntime` (per-tick
  debug/event-window state), and `SimulationPerformanceMonitor`.
- `step()` sequence: `clock.advanceOne()` → set `world.tick`/`world.time` → `runtime.resetStep()` →
  `runtime.setDueEvents(world.eventQueue.popDue(world.tick))` (destructive dequeue) →
  `scheduler.runTick(...)` (executes systems phase-ordered: `beforeStep, sense, decide, act, resolve,
  afterStep, metrics`; in `"staged"` mode, `CommandBuffer.apply()` runs once per phase after all systems
  in that phase have executed; in `"immediate"` mode, after every system) → `metrics.collect(world)` →
  `assertWorldInvariants(world)` → `template.validateWorld?.(...)`. **No try/catch wraps any of this** —
  see Risk Register K1/K2/K3.
- `CommandBuffer.apply(world)` drains `pending` and applies each `BufferedCommand` via a plain `for` loop
  calling `applyOne(world, entry)` with no per-command or per-batch transaction boundary.
- `assertWorldInvariants` (Invariants.ts) checks: no duplicate entity ids, every component references a
  live entity, every space's serialized form is finite-deep, every queued event matches `eventSchema`. It
  does **not** cross-check space/network node or edge membership against `EntityStore` liveness (that
  coherence is instead enforced ad hoc at specific command sites: `addEdge`/`moveEntity`/etc. call
  `requireAlive`, and `destroyEntity` cascades via `world.removeEntityFromSpaces`).
- `RandomService`/`RandomStream`: named streams keyed by `${seed}:${name}`, xorshift-style PRNG,
  deterministic `hashString` seeding, full `getState()`/`setState()` round trip with sorted stream-name
  iteration for determinism. This is a genuine strength (see Verified Guarantees).
- `deepClone` (Validation.ts:403) is `JSON.parse(JSON.stringify(value))`, used pervasively: every
  `ComponentStore.get/add/set/patch`, every `EntityStore.create/get/all`, every `EventQueue`
  schedule/popDue/all, every `CommandBuffer.add/drain`, `World.serialize`. This is the most expensive
  possible deep-clone strategy, applied on hot read paths, not just writes (see Risk Register K6).
- Error taxonomy (`Errors.ts`): `SimulationError` base with `SimulationValidationError`,
  `SimulationInvariantError`, `SimulationTemplateError`, `SimulationSerializationError` subclasses, each
  carrying `tick`/`phase`/`systemId`/`entityId`/`command`/`cause`. Good observability; does not by itself
  provide recovery.
- Serialization: `Snapshot.ts`/`Serialization.ts`/`Validation.ts` build `ScenarioExport` and
  `SnapshotExport` through Zod schemas (`parseScenario`/`parseSnapshot`). `restoreSnapshot` cross-checks
  `templateId`, `tick === world.tick`, `time === world.time`, and `rng.seed === seed` before accepting —
  a genuinely defensive round-trip contract.

### Spaces (`src/simulation/spaces/`, 5 files, 1,031 lines)

`Continuous2DSpace`, `Grid2DSpace`, `NetworkSpace` all implement the shared `Space<TLocation =
SpaceLocation>` interface, where `SpaceLocation = Point2D | GridCell | Record<string, unknown>` (a broad
escape-hatch third union arm) and the command-layer `spaceLocationSchema` mirrors that same three-way
union with no space-kind awareness. `NetworkSpace`'s `TLocation` is actually `EntityId` (a string), which
does not fit `SpaceLocation` at all; `World.getSpace<TSpace extends Space<any>>` erases the type
parameter to `any`, so nothing at the type or schema level prevents a Point2D/GridCell-shaped location
from being routed into a `NetworkSpace` (see Risk Register K5). `Continuous2DSpace.queryNeighbors` has a
real spatial-hash-index/all-pairs-fallback split (`shouldUseSpatialIndex`), diagnostic counters
(`allPairsQueries`, `distanceChecks`, etc.), and brute-force parity tests exist (see Test Credibility).

### S2 "Recipe-First Builder" — corrected: Visual Systems Workbench + Starter World launch recipes

**The audit brief's premise does not match current HEAD.** Per `docs/ROADMAP.md:20,104-123` and
`docs/CAPABILITIES.md:88`, S2 is the **Visual Systems Workbench**: an example-first, read-only,
non-executable explanatory presentation layer over existing production templates inside
Workshop/Builder. It is COMPLETE and its rendered product review is accepted. There is no "recipe-first
model-authoring system" anywhere in the code. Separately, "recipe" in this codebase means exactly one
thing — `StarterWorldLaunchRecipe` (`src/lib/starterWorlds/packs/types.ts:41-61`) — a Starter World
*launch configuration*, unrelated to the Builder/Workbench. Both were independently reconstructed from
source by a dedicated subagent; see Verified Guarantees and Risk Register ARCH1/ARCH2 for the
consequences of this correction.

- **Workbench** (`src/lib/workbench/model.ts`, `src/components/builder/workbench/VisualSystemsWorkbench.tsx`):
  `WorkbenchModel`/`WorkbenchPiece` are pure, derived structures built by `deriveWorkbenchModel()` from
  the *real* production template (`getProductionTemplate`), binding each piece's control references to
  actual `parameterDefinitions`/preset option definitions through a `bindOwner()` guard that throws on
  any unknown/duplicate key — so control references cannot silently drift from the schema. Per-template
  narrative text (labels, descriptions, relationship prose) is hand-authored per template in a large
  `switch (template.id)` block and is **not** mechanically derived from the template's rule
  implementation — a latent, currently-harmless documentation-drift risk. Capability status
  (executable/structural/reference/future) shown per material is always live-queried from
  `src/simulation/registry`, never hard-coded or cached. The Workbench component tree has zero imports
  of `RunConfig`/`SimulationEngine`/`applyScenario`/`useSimulationStore`/zustand — selecting, expanding,
  and browsing pieces is 100% local React state with no engine or global-store interaction. The single
  sanctioned bridge to the engine is `StarterRemixWorkspace.tsx`'s `runRemix()`, gated behind full
  scenario validation and an explicit "Run Remix" click.
- **Starter World recipes** (`src/lib/starterWorlds/`): `StarterWorldLaunchRecipe` is the single
  canonical Zod schema; there is no second/competing shape. Recipes, packs, comparisons, and guides are
  cross-validated against each other and against the live template registry at three independent
  checkpoints (module load, launch resolution, guide-authority derivation), and unsafe keys
  (`__proto__`, `prototype`, `constructor`) are explicitly rejected before Zod parsing. Every
  launch/rebuild path (`createEngineFromScenario`, `createEngineFromRunConfig`, and every
  `simulationStore.ts` engine-replacement path) unconditionally constructs a **new** `SimulationEngine`;
  no engine/session identity is ever reused across launches. `grep` of `src/simulation/templates`,
  `src/simulation/registry`, `src/simulation/kernel` for `starterWorldId`/`StarterWorld` returns zero
  hits — Starter World identity never leaks into engine/template/registry code.

### Runtime / Worker layer (`src/simulation/runtime/`, `src/workers/`, `src/components/runtime/`)

Two parallel execution paths exist in production:

1. **Legacy main-thread `SimulationEngine`**, driven directly by `simulationStore.ts`'s
   `requestAnimationFrame` loop in `AppShell.tsx` — used for 6 of 7 production templates
   (epidemic-spread, opinion-dynamics, predator-prey, schelling-segregation, forest-fire,
   neural-excitation-network).
2. **`SimulationRuntimePort` / dedicated Worker (`RuntimeSession`, `WorkerRuntimeDriver`,
   `RuntimeWorkerHost`, `LatestPublicationGate`)** — used in production **only** for `flocking-boids`,
   via `ProductionFlockingRuntime` → `ProductionRuntimeProvider`. `LocalRuntimeDriver` (the same-thread
   implementation of the same port) is confirmed test/prototype-only, never constructed in production
   code paths.

The Worker path is genuinely well-engineered for concurrency discipline (see Verified Guarantees) but is
Flocking-only via eight independent hardcoded literal/import checks scattered across
`types.ts`/`RuntimeSession.ts`/`flockingProjection.ts`/`protocol.ts`/`WorkerRuntimeDriver.ts` — there is
no registry or pluggable-projection mechanism (H7 confirmed as an accurate description of the code, but
`docs/ARCHITECTURE.md:133` and AGENTS.md already explicitly disclaim generic cross-template support, so
this is not a case of misleading documentation).

### Application state (`src/state/simulationStore.ts`, 1,068 lines, single Zustand store)

The only `create(...)` call in the repository. 25 state fields / 39 actions spanning five distinct
authority categories: engine/runtime lifecycle, accepted scenario config, canvas/UI presentation (12-way
panel-collapse object, import/export textareas, avatar mode), a single global `lastError`/`lastNotice`
toast slot, and bounded run-comparison/experiment-sweep history. Selector hygiene across 46 consumer
files / 253 call sites is uniformly narrow (no whole-store subscriptions found anywhere). For
Worker-managed Flocking, the live engine/session lives **outside** this store in
`ProductionFlockingRuntime` (a documented second, intentional authority); the store's own `engine` field
is always `null` while that path is active. Lab/Atlas/guide/progression state is confirmed absent from
this store — those routes read only their own static `lib/*Foundation.ts` modules.

### Registry / capability governance (`src/simulation/registry/`)

`primitives.ts` and `templateCapabilities.ts` implement an unusually disciplined non-overclaiming system:
every primitive is labeled `implemented` / `serviceOnly` / `metadataOnly` / `reserved` with explicit
`currentScope`, `futureScope`, `limitations`, and `mustNotClaimYet` arrays. Per-template
`runtimeActive` flags are computed from real template capability booleans, not asserted centrally — spot
checked directly (`networks` is `runtimeActive: true` only where `template.id ===
"neural-excitation-network" && capabilities?.supportsNetworkSpace && capabilities?.supportsNetworkMetrics`
literally guards the claim).

---

## Verified Guarantees

Evidence-backed, not asserted from documentation:

1. **Deterministic RNG.** `RandomService`/`RandomStream` produce identical output for identical seed +
   step count (exercised by `engine.determinism.test.ts`, corroborated by architecture reading: named
   streams, sorted-key state serialization, full get/set-state round trip).
2. **Fresh engine per launch, everywhere.** Every scenario/recipe/experiment/reset code path constructs
   a brand-new `SimulationEngine` (or, for Worker-managed Flocking, a brand-new Worker+session pair via
   generation bump); confirmed by source reading across `simulationStore.ts`, `engineFromRunConfig.ts`,
   `scenarioBuilder.ts`, `experimentRunner.ts`, and by a live non-identity probe
   (`createStarterWorldScenario` called twice returns two distinct, deep-equal object references).
3. **Bounded, metrics-only comparison/experiment storage.** `SavedRunSummary` and `ExperimentRunResult`
   store `finalMetrics`/sliced history/interventions/events only — never `snapshot.entities`/grid state.
   Hard caps exist and are enforced at every write site (`maxSavedRunSummaries=50`,
   `hardExperimentMaxRuns=100`, per-run history/intervention/event slicing).
4. **Experiment Runner cancellation is genuinely cooperative.** `runExperiment()` checks a cancellation
   flag at the top of every loop iteration (not just at the UI layer), and the component-side
   abandoned-token guard prevents any result from reaching the global store after unmount/hide. Traced
   concretely end-to-end by a subagent, not inferred from naming.
5. **Worker runtime concurrency discipline.** Generation/revision guards are synchronous with no
   `await` inside state-mutating driver methods (no interleaving window); the 128-message ingress cap is
   a hard rejection (thrown `Error` or rejected `Promise`), never a silent drop; coalescing via
   `LatestPublicationGate` is wired only to frame/UI publications, never to commands/interventions;
   Worker failure is terminal with zero retry/fallback code anywhere in the tree, verified by two
   independent real-browser Playwright specs asserting `page.workers().length === 0` after a stubbed
   Worker-construction failure with no fallback UI.
6. **Starter World recipe pipeline fails closed.** Live-executed probes (not just code reading) confirm
   an unknown initialization preset, an unknown parameter key, a stale/tampered launch identity, and a
   prototype-pollution-shaped payload (`__proto__` key) are all rejected with structured error codes
   before any partial scenario/engine construction.
7. **No unrelated simulation-store subscription in primary navigation.** The actual primary navigation
   component (`ResearchDestinationNavigation.tsx`) has zero `useSimulationStore` usage; it derives
   current-destination state from `usePathname()`/`useSearchParams()`. `AppShell.tsx`'s subscription to
   `isRunning`/`speedMultiplier`/`engine` is the World workspace shell's own RAF-loop plumbing, not
   navigation chrome.
8. **Registry claims are structurally honest where spot-checked.** `networks` runtime-active status,
   Workbench material capability labels, and template-capability booleans are all live-derived from the
   same registry data at read time, not duplicated/cached copies that could drift.
9. **Reset does not leak engine-owned run history across rebuild**, for the fields that matter to
   provenance/interventions: all three `reset()` code branches build a genuinely new engine/session and
   explicitly zero `interventionHistory`, `interventionTargetPoint/Cell`, and `selectedEntityId`; unrelated
   drafts (`savedRuns`, comparison selection, import/export text, avatar mode, panel state) are correctly
   preserved across a rebuild, matching AGENTS.md's explicit contract.

## Unverified Claims

- **Screen-reader / assistive-technology behavior.** Playwright/Axe coverage (many passing specs observed
  live in this pass) verifies automated accessibility-tree scanning only, not actual screen-reader or
  browser-zoom behavior, exactly as AGENTS.md itself repeatedly insists. Not independently verified here.
- **Cross-browser / mobile-device behavior.** All e2e evidence is Chromium-only (`playwright.config.ts`
  hardcodes the `chromium` project); no WebKit/Firefox/real-device evidence exists.
- **The precise magnitude of `deepClone`'s contribution to `ortus.sim.step` cost.** Strong inferential
  evidence exists (the pattern is used on every kernel read/write, and measured Flocking step time is
  high — see K6), but no isolated micro-benchmark in this repository attributes step-time cost
  specifically to `JSON.parse(JSON.stringify())` versus scheduler/neighbor-query cost.
- **Whether the React tick-loop consumer of `simulationStore`'s `engine` field always re-subscribes to a
  replaced engine reference rather than holding a stale closure.** Zustand's standard subscription model
  makes a stale closure unlikely, but this specific path was not executed/traced in this pass.

---

## Risk Register

Severity scale: P0 (state corruption / crash reachable in ordinary use, no safeguard) · P1 (real defect
with a plausible ordinary-use trigger, and/or dependency-level security exposure) · P2 (real defect,
narrower trigger or was cushioned by another layer) · P3 (low-impact / hygiene).

### K1 — P1 — Tick failure has no rollback or poisoned-engine semantics

**Contract implied:** a tick either fully completes or leaves the engine in a clearly invalid,
recoverable state. **Evidence:** `SimulationEngine.step()` (kernel/SimulationEngine.ts:117-150) has no
try/catch around `clock.advanceOne()`, the destructive `eventQueue.popDue()`, `scheduler.runTick(...)`,
`metrics.collect(...)`, or `assertWorldInvariants(...)`. Constructed and ran a throwaway diagnostic
(`minimalTemplate` fixture + a `beforeStep`-phase system that mutates `world.globals` unconditionally,
plus a `sense`-phase system that throws): after the failing `step()` call, `world.tick` had already
advanced to 1 and the `beforeStep`-phase mutation had already committed, even though the tick as a whole
threw. **Affected:** `SimulationEngine.step`, `Scheduler.runTick`, `CommandBuffer.apply`. **Root cause:**
no tick-level transaction boundary; clock/tick mutation happens before any system runs, and command
application happens incrementally per-phase rather than being staged and committed atomically at the end
of a successful tick. **Required end-state:** either (a) an explicit poisoned/failed flag on
`SimulationEngine` that fails closed on any subsequent `step()`/`applyCommands()` call until an explicit
reset, or (b) true tick-level snapshot/rollback. Option (a) is far cheaper and matches the codebase's
existing "fail closed, name the state" idiom used elsewhere (Worker runtime terminal-failure design is a
good precedent).

### K2 — P1 — Cross-tick command leakage from a failed tick into a later successful tick

**Contract implied (from K1):** at minimum, a failed tick's unintended side effects should not
contaminate a later, ostensibly clean tick. **Evidence:** executable diagnostic confirmed that a command
pushed by a system in the same phase as (but before) a throwing system remains in
`CommandBuffer.pending` after the failing `step()` returns (never cleared — `CommandBuffer.clear()` is
only called from `SimulationEngine.reset()`/`restoreSnapshot()`, not after a caught step failure). On the
**next**, unrelated, successful `step()` call, that stale command was drained and applied together with
the new tick's own commands — i.e. a tick-1 command actually took effect during tick 2's phase-apply, with
`entry.metadata.tick` still reading "1" despite being applied under tick 2. **Affected:**
`CommandBuffer.pending`/`apply`/`drain`, `SimulationEngine.step`. **Root cause:** same as K1 — no
per-tick buffer isolation or explicit discard of a failed tick's queued-but-unapplied commands.
**Required end-state:** on tick failure, either discard `CommandBuffer.pending` explicitly before
allowing any further ticking, or refuse further `step()` calls until reset (ties directly to K1's
poisoned-flag design).

### K3 — P1 — Command batch application is not atomic

**Contract implied:** a single `apply()` call over one phase's buffered commands should either fully
apply or leave a clearly bounded, well-understood partial state — not an arbitrary prefix determined by
iteration order. **Evidence:** `CommandBuffer.apply()` (kernel/CommandBuffer.ts:37-47) drains all pending
commands then applies them one at a time in a plain `for` loop with no per-command or per-batch
try/catch. Diagnostic: a single system issued three commands
(`setGlobal("first",...)`, `addComponent(<missing entity>, ...)`, `setGlobal("third",...)`) in one
`update()` call; after the resulting throw, `world.globals.first === "applied"` but
`world.globals.third === undefined` — the first command's mutation persisted, the third (queued after the
failing command) never ran. Independently confirmed via static analysis by a separate subagent with no
knowledge of this diagnostic, and confirmed to have **zero existing test coverage**: every current
`CommandBuffer.apply().toThrow()` test uses a single-command buffer, never a batch where an earlier
command succeeds and a later one in the same call fails. **Required end-state:** either validate all
commands in a batch before applying any (fail the whole batch atomically), or explicitly document and
test partial-batch semantics as an intentional, bounded contract (least-favored option, since it is
surprising and currently unspecified anywhere).

### K4 — P2 — Same-tick event scheduling is silently delayed by exactly one tick

**Contract implied:** unclear/undocumented — this is a gap in specification as much as implementation.
**Evidence:** `SimulationRuntime.dueEvents` is computed exactly once per `step()`, before any system
runs (`runtime.setDueEvents(world.eventQueue.popDue(world.tick))`), and is never refreshed mid-tick
(`SimulationRuntime.due()` reads the same frozen array for the whole tick). Diagnostic: a `sense`-phase
system scheduled an event with `scheduledTick: ctx.tick` (the current tick); a `resolve`-phase system
in the **same** step() call observed `events.due("test-event").length === 0`; on the **next** `step()`
call (tick+1), the same query returned `length === 1`. **Affected:** `SimulationRuntime`,
`SimulationEngine.step`. **Root cause:** `popDue` runs before scheduling for the tick has happened, and
`dueEvents` is not re-derived after each phase's `CommandBuffer.apply()`. **Required end-state:** decide
and document the intended contract (either "same-tick emission is always deferred to next tick, and this
is documented" or "same-tick emission with `scheduledTick === currentTick` is delivered later in the same
tick", which would require re-popping due events after each phase's apply). The current state is an
undocumented behavior that could surprise template authors relying on `events.due()` to see
same-tick-emitted events from an earlier phase.

### K5 — P2 — Generic space/command contract does not validate location shape against space kind

**Contract implied:** the shared `Space<TLocation>`/command-buffer interface should not let
structurally-valid-but-semantically-wrong data corrupt a space's internal representation (H5).
**Evidence:** `spaceLocationSchema` (kernel/Validation.ts:52-56) is `Point2D | GridCell |
Record<string, unknown>` for every space kind; `CommandBuffer.applyOne`'s `"createEntity"` case
(kernel/CommandBuffer.ts:66-79) calls `space.addEntity(entity.id, location)` for whatever `space` a
`spaceId` resolves to, with **no check that `location`'s shape matches `space.kind`**. Diagnostic:
routing two `Point2D`-shaped locations (`{x,y}`, schema-valid) into a `NetworkSpace` via the generic
`createEntity` command silently corrupted its internal `Set<EntityId>` with two `{x,y}` objects instead
of string node ids (`NetworkSpace.addEntity` does `this.addNode(location)`, not
`this.addNode(entityId)`), then crashed on the very same tick — not with a domain validation error, but
with an opaque `TypeError: left.localeCompare is not a function` thrown deep inside
`NetworkSpace.serialize()`'s sort comparator (triggered by the mandatory post-tick
`assertWorldInvariants` call). Additionally, `NetworkSpace.moveEntity()` is a permanent throw-stub
(`"NetworkSpace does not support moveEntity"`) that can never legitimately succeed, since the
`SystemCommandSink.moveEntity` validation layer already rejects any location that is not
Point2D/GridCell-shaped (a plain `EntityId` string, which is what `NetworkSpace` actually needs, fails
that check) — the generic interface does not coherently unify all three space kinds (H5 confirmed).
**Affected:** `Space<TLocation>` interface, `spaceLocationSchema`, `CommandBuffer.applyOne`
("createEntity"/"moveEntity" cases), `NetworkSpace`. **Root cause:** a shared, kind-agnostic
`SpaceLocation` union used for schema validation with no dispatch on `space.kind` before delegating to
the concrete space implementation. **Required end-state:** either make `spaceLocationSchema` (and the
`createEntity`/`moveEntity` command handlers) kind-aware — validating the location shape against the
actual resolved space's kind before calling `addEntity`/`moveEntity` — or give `NetworkSpace` its own
dedicated placement command distinct from the generic Point2D/GridCell-oriented `moveEntity`/`spaceLocations`
path (edges already have this: `addEdge`/`removeEdge`).

### K6 — P2 — Pervasive `JSON.parse(JSON.stringify())` deep-cloning on kernel hot paths

**Evidence:** `deepClone` (kernel/Validation.ts:403-405) is used on nearly every kernel read *and*
write: `ComponentStore.get/add/set/patch`, `EntityStore.create/get/all`, `EventQueue.schedule/popDue/all`,
`CommandBuffer.add/drain`, `World.serialize`, `MetricsCollector.collect`. This is the most expensive
available deep-clone strategy (full string serialize + re-parse) applied even to simple reads that could
return frozen/shared references. This audit's own Playwright performance run (live-executed, not a doc
claim) recorded, at 500 Flocking agents: `ortus.sim.step` median 37.6ms / p95 90.6ms per tick, and
`ortus.sim.neighbors` median 13.4ms / p95 30.1ms — a large fraction of a 16.7ms (60fps) frame budget for
a template with a genuinely optimized spatial-hash neighbor index. **Root cause (inference, high
confidence, not isolated by micro-benchmark):** `deepClone`'s use on every `ComponentStore.get()` call
(not just writes) means every system reading every agent's component data every tick pays a full
JSON round-trip allocation. **Required end-state:** benchmark `deepClone` in isolation against a
structural-sharing/freeze-based alternative before optimizing (per AGENTS.md's own "never claim
scalability... without benchmark evidence" and "keep performance reports separated across scheduler
compute, metrics, snapshot creation" instructions) — this is a work package, not a blind optimization.

### K7 — P3 — `CommandBuffer.history` is not cleared by reset, but is also dead state

**Evidence:** `SimulationEngine.reset()` calls `this.commandBuffer.clear()`, which empties `pending`
only (kernel/CommandBuffer.ts:49-51); the separate `history` array (up to `maxHistory=200` past applied
commands, used by `recent()`) is never cleared by `reset()` or `restoreSnapshot()`. Grep of
`src/simulation`, `src/state`, `src/components` for consumers of `.recent()`/`commandBuffer.` outside the
kernel itself found **no production consumer** — this is currently inert, unread state. **Required
end-state:** low priority; either clear `history` on reset for correctness-in-principle, or remove it if
genuinely unused, but do not treat as urgent given zero current blast radius.

### K8 — P2 — Zero adversarial/failure-injection test coverage in the kernel for K1/K2/K3, and zero direct test coverage of `SimulationEngine.reset()`

**Evidence:** independently confirmed by a dedicated test-credibility subagent via static analysis (no
knowledge of the K1-K3 diagnostics constructed in this same investigation): every existing
`CommandBuffer.apply().toThrow()` test uses a single-command buffer; `engine.scheduler.test.ts` only
orders non-throwing systems; repo-wide grep for `atomic|rollback|mid-tick|mid-command` across all
`*.test.ts` under `src/simulation` returned zero hits; `SimulationEngine.reset()` has no direct test
anywhere (the only `.reset()` calls in tests target an unrelated runtime-driver reset concept). This is
exactly the coverage gap that let K1-K3 go undetected. **Required end-state:** the specific new tests are
listed in Work Package WP1 below.

### SEC1 — P1 — Hostile deeply-nested import JSON crashes with an uncaught `RangeError` instead of a clean rejection

**Evidence:** live diagnostic — a scenario-shaped payload with a `metadata` field nested 50,000 arrays
deep, passed to `parseScenario` (used by both scenario and snapshot import), threw `RangeError: Maximum
call stack size exceeded` rather than a `SimulationSerializationError`/`SimulationValidationError`. Root
cause: `jsonValueSchema` (kernel/Validation.ts:19-28) is a `z.lazy()`-recursive Zod schema with no depth
limit, and Zod v3's lazy-schema validation is itself recursive (one JS call frame per nesting level).
Reachable from the user-facing Import panel (`FileActions.tsx` per the frontend subagent's file index)
via `simulationStore.ts`'s `importJson` action, which does wrap the call in a generic `try/catch` — so the
application does not fully crash, but surfaces a confusing, non-domain error message, and a
large-enough payload could cause a noticeable synchronous main-thread stall before failing. **Required
end-state:** enforce an explicit maximum nesting depth (and/or a maximum serialized-size check) before
handing untrusted import text to the recursive Zod schema, so hostile input fails fast and cleanly.

### SEC2 — P1 — Known critical/high-severity CVEs in installed dependencies, no CI or automated dependency monitoring

**Evidence:** `npm audit` on the installed tree (Next.js 15.5.19, postcss 8.4.31, sharp 0.34.5) reports
6 vulnerabilities: 1 critical (Next.js Server Actions DoS, GHSA-m99w-x7hq-7vfj — present in the
audited range for the installed version per `npm audit`'s "all" scan) and multiple high-severity
advisories including SSRF via rewrites, unauthenticated RCE on Windows-hosted servers, and RCE via AVIF
image optimization, plus high-severity postcss (XSS/path-traversal via source maps) and sharp
(libvips/libheif CVEs) issues. No `.github/workflows`, no other CI config, and no
Dependabot/Renovate configuration exist anywhere in the repository to catch or gate this
automatically — confirms H10/GOV1 from the dependency-security angle specifically, not just the
"tests aren't gated" angle. **Required end-state:** run `npm audit fix` / upgrade Next.js to a patched
release and re-run the full baseline (build/tests) to confirm no regression; add Dependabot or
equivalent as part of the CI work package (WP4).

### GOV1 — P1 — No CI configuration exists; nothing enforces local checks before merge

**Evidence:** confirmed absence of `.github/workflows` or any other CI YAML/config in the repository
root or subdirectories. `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, and
`npm run build` are all developer-invoked commands only. Given the repository's extensive (700+-rule)
AGENTS.md architectural contract, and given this audit's own finding that a real, previously-undetected
kernel defect (K1-K3) has apparently existed through many prior "audit" commits without being caught,
this is a concrete governance gap, not a theoretical one: a future change (human- or agent-authored)
that violates any currently-passing check has no automated backstop before landing on `main`. **Required
end-state:** see Work Package WP4 (Quality Gate).

### RUNTIME1 — P2 — Newly discovered: stale ArrayBuffer-backed frame reuse after Worker transfer

**Evidence (from the runtime/worker subagent, independently derived, not in the original H1-H10 list):**
`RuntimeSession.play()`/`pause()`/`setSpeedMultiplier()` (runtime/RuntimeSession.ts:101-145) reuse a
cached `this.latestFrame` via `this.latestFrame ?? this.projectFrame()`. `RuntimeWorkerHost.postFrame()`
posts that same frame object with a transfer list synchronously in the same call stack that produced it;
per the repository's own transfer-detach test (`structuredClone(source, {transfer})` detaches the
sender-side typed arrays immediately), the cached `this.latestFrame`'s buffers may already be detached by
the time one of the three methods above reuses it. A detached `Uint32Array`'s `.length` reads `0` (no
throw), so `createFlockingSelectedUIProjection()` silently reports `currentProximityCount: 0` instead of
the real neighbor count for one UI update — e.g. select a boid, then immediately pause/play/change speed
without an intervening tick. Self-corrects on the next tick; never crashes; confined to the Worker path
(`LocalRuntimeDriver` never transfers buffers). Zero test coverage exists for this exact sequence.
**Required end-state:** have `play()`/`pause()`/`setSpeedMultiplier()` always call `projectFrame()` fresh
rather than reusing a potentially-detached cached frame, or null out `latestFrame` immediately after
handing it to the host for transfer.

### STATE1 — P2 — `simulationStore.ts` aggregates five distinct product concerns in one flat store (H8, partially confirmed)

**Evidence:** 25 fields / 39 actions spanning engine/runtime lifecycle, accepted scenario config,
canvas/UI presentation (12-way panel-collapse object, import/export text, avatar mode), a single global
`lastError`/`lastNotice` toast slot, and bounded comparison/experiment history. Selector hygiene is
uniformly good (no whole-store subscriptions found across 253 call sites), which caps the practical
re-render cost, but the `lastError`/`lastNotice` slot is overwritten or cleared as a side effect by
roughly 25 of the 39 actions with no queue and inconsistent clearing behavior — e.g. capturing a run for
comparison in one panel silently dismisses a still-unread validation error from an unrelated Setup
action. **Required end-state:** out of scope for a blind rewrite; recommend a scoped notification
queue (even a small bounded array) as a low-risk follow-up, and note the god-store shape as
architectural debt (see below) rather than an urgent defect given confirmed correct selector hygiene.

### STATE2 — P3 — Stale cross-template Experiment Runner result remains actionable with no staleness indicator

**Evidence:** `latestExperimentResultSet` is never cleared by `reset()` or `selectTemplate()`;
`RunComparisonPanel`'s "Add Experiment Runs" button enables purely on `Boolean(latestExperimentResultSet)`
with no check that its `templateId` matches the active template. Not a data-corruption bug (the import
action itself correctly tags the imported summary with the experiment's own `templateId`), but a
UX-honesty gap: switching templates after a sweep leaves a stale, unlabeled action available.

### STATE3 — P3 — Three hand-duplicated "build a fresh run" code paths in `simulationStore.ts`

**Evidence:** `replaceEngine()`, `applyScenario()`, and `reset()`'s remix/starter branch each
independently construct/replace the same conceptual "fresh engine + cleared workspace fields" state.
Diffed field-by-field: currently consistent, no divergence found. Flagged as a maintainability risk (a
future field addition to one path could silently miss the others), not a present defect.

### ARCH1 — Informational — The audit brief's "S2 = Recipe-First Builder" premise is incorrect for current HEAD

Recorded for the record, not as a defect: S2 is the Visual Systems Workbench (see Architecture Map). Any
future roadmap prompt phrased against "the Recipe-First Builder" would be targeting a subsystem that does
not exist in this codebase under that name.

### ARCH2 — P3 — Future-composition rigidity baked into the Starter World recipe schema (informational, not a current defect)

**Evidence:** `StarterWorldLaunchRecipe` hard-bakes exactly one `templateId` + one
`initializationPresetId` per recipe, a flat `Record<string, string|number|boolean>` for
`parameterOverrides`, and `PreparedStarterComparison`/pack validation hard-requires exactly two recipes
(baseline/contrast) per packed world. These are reasonable, intentional bounds for the current C1/C2
milestone (and explicitly acceptable per AGENTS.md's current scope), but any future multi-template,
multi-scale, or N-way sweep composition will require a schema version migration, not just new data.
Recorded per the audit's explicit "future architecture contamination" question; **no action requested
in this phase**.

---

## Rejected Hypotheses

Each of these was actively investigated (source reading plus, where feasible, live execution) and
disproven. Recorded so they are not silently re-litigated by a future pass.

- **Generation/revision TOCTOU race in the Worker runtime** (a stale generation-1 message misapplied
  after driver replacement/disposal): rejected. Every generation guard is synchronous with no `await`
  inside state-mutating driver methods; disposal removes listeners before terminating the Worker;
  cross-driver contamination is structurally impossible (one Worker per driver, never shared).
- **Same ArrayBuffer transferred twice**: rejected for the within-a-frame case (each frame allocates 8
  unique buffers, verified unique via `Set` size check in the repo's own test); distinct from RUNTIME1,
  which is a read-after-transfer bug, not a double-transfer.
- **128-message backpressure cap silently dropping messages**: rejected — every overflow path returns a
  rejected `Promise` or throws a descriptive `Error`, never a silent drop.
- **Command/intervention messages sharing the frame/UI coalescing gate**: rejected —
  `LatestPublicationGate` is wired to exactly two gates (`frameGate`, `uiGate`) inside
  `RuntimeWorkerHost`; every other message type uses direct, uncoalesced `postMessage`.
- **Worker failure silently falling back to `LocalRuntimeDriver` or continuing in a half-failed state**:
  rejected — no retry/fallback code exists anywhere in the runtime or component tree; confirmed by
  source grep and two independent real-browser Playwright specs asserting zero Workers and no fallback
  UI after a stubbed construction failure.
- **`LocalRuntimeDriver` as a silently-diverging second production execution path**: rejected — grep of
  all construction sites shows test-only and isolated-prototype usage; `docs/ARCHITECTURE.md` already
  explicitly labels it a reference/test implementation.
- **Starter World identity leaking into engine/template/registry code as an implicit scientific
  ontology**: rejected — zero references to `starterWorldId`/`StarterWorld` anywhere under
  `src/simulation/templates`, `src/simulation/registry`, `src/simulation/kernel`.
- **Multiple divergent "recipe" schemas across `definitions.ts`/`packs/`/`guides/`**: rejected — exactly
  one canonical Zod schema, cross-validated at three independent checkpoints (module load, launch
  resolution, guide-authority derivation), which reject on any disagreement rather than silently
  reconciling.
- **Workbench capability labels hard-coded and drift-prone from the registry**: rejected for the
  capability *classification* itself (always live-queried); true only, and at low severity, for
  hand-authored descriptive prose that parallels (but is not mechanically derived from) template rule
  implementations — recorded as a documentation-drift risk, not a functional defect.
- **Lab/Atlas/guide/progression state creep into `simulationStore`**: rejected — confirmed absent by
  full-file read and consumer grep; those routes read only their own static data modules.
- **Navigation components subscribing to simulation tick-level state** (the specific AGENTS.md warning):
  rejected — the actual primary navigation component has zero `useSimulationStore` usage; the component
  that does subscribe to tick-relevant fields (`AppShell.tsx`) is the World workspace shell, not
  navigation chrome, and needs that state to drive its RAF loop.
- **Reset leaving stale engine-owned intervention history/diagnostics behind** (H6, for the fields that
  matter to users): rejected for `interventionHistory`/`engine`/`latestSnapshot` — every reset path
  builds a genuinely new engine and explicitly zeroes the client-side mirrors. (Narrowly true only for
  the unrelated, low-severity `lastPerformanceFrameMark` dev-diagnostics module variable and for
  `latestExperimentResultSet` staleness, both captured separately as STATE2 and a P3 item, not as a
  general H6 confirmation.)
- **Experiment Runner cancellation being cosmetic** (hiding the UI while a stale async loop keeps
  running and could still commit a result): rejected — traced a concrete unmount-during-run sequence
  end-to-end; the abandoned-token guard prevents any store mutation after unmount.
- **Comparison/experiment storage retaining full snapshots or engine references, risking memory growth
  across many runs**: rejected — confirmed bounded, metrics-only shapes with hard caps enforced at every
  write site.
- **A second store or singleton silently competing with Zustand for "active engine" authority**:
  rejected as an accidental bug — the one real second authority found (`ProductionFlockingRuntime` for
  Worker-managed Flocking) is intentional, documented PERF1/PERF1B architecture, not a stray duplicate.
- **H7 as evidence of misleading/concealed genericity**: rejected — the Flocking-only hardcoding is real
  and is not centralized behind a single seam, but `docs/ARCHITECTURE.md` and AGENTS.md already
  explicitly disclaim generic cross-template Worker support, so the code matches its own documentation's
  (narrow) claim rather than contradicting a broader one.

---

## Test Credibility

**H9 verdict: partially confirmed, localized rather than repo-wide.** A real, identifiable cluster of
"roadmap/product-reset/audit" test files (`roadmap.test.ts` — the single largest concentration, 346
`toContain/toMatch` assertions against 44 `toBe/toEqual/toThrow` in one 1,133-line file — plus
`ur0ProductLeverage.test.ts`, `starterRemixAudit.test.ts`, and the first `describe` block of
`canonicalArchitecture.test.ts`) consists substantially of doc-text-vs-doc-text assertions: reading a
Markdown file and asserting that a sentence copied verbatim into the test literally appears in it. These
would pass regardless of runtime correctness and fail only if someone edits prose. 127 of 723 substantial
AGENTS.md sentences were found reproduced verbatim inside `*.test.ts` files, split between this
zero-behavioral-value category and a legitimate category (asserting that *real computed output*, e.g.
`createBuilderWorkspaceViewModel(...).validationReport.warnings`, contains required disclaimer text —
this is a reasonable regression guard given AGENTS.md's explicit "preserve exact visible boundary text"
requirements, not theater).

This does **not** generalize to the engine core. Kernel/template/spatial-index/experiment/comparison
tests, the Guided Builder logic, and most Playwright specs contain substantial genuine behavioral,
contract, and even property/adversarial testing:

- `flocking.neighborEquivalence.test.ts` is the strongest test in the repo: a seeded LCG generates 500
  agents checked against a brute-force reference across 2 topologies × 6 radii, plus full 40/16-tick
  trajectory equivalence between an all-pairs reference and the production spatial-hash strategy.
- `atlasPreview.test.ts` has the best failure-injection coverage in the repo (engine-construction
  failure, tick failure, non-finite-metric failure, cooperative-cancellation mid-loop, fatal
  cooperative-yield error) — proving the team can and does write this kind of test; it is simply never
  pointed at `CommandBuffer`/`Scheduler`/`SimulationEngine.step` (see K8).
- Brute-force neighbor-query parity genuinely exists in three files, but uses either zero randomization
  or exactly one fixed seed — real, but short of a true multi-seed fuzz sweep.
- **The kernel has zero adversarial/failure-injection tests for tick atomicity, command-batch atomicity,
  or same-tick event timing** (repo-wide grep for `atomic|rollback|mid-tick|mid-command` under
  `src/simulation/*.test.ts` returns zero hits), and **zero direct tests for `SimulationEngine.reset()`**
  — independently confirmed by static analysis with no foreknowledge of this investigation's K1-K3
  diagnostics, which is itself the strongest evidence that K1-K3 are real, previously-undetected gaps
  rather than artifacts of this session's specific test construction.
- No `.skip`/`.only`/`.todo`/environment-conditional suppression was found anywhere in `src` or `tests`.
- Playwright specs generally drive real rendered DOM, keyboard/focus interaction, and Axe scans (strong);
  a minority of unit tests (e.g. `builderGraphView.test.ts`) assert on literal JSX source-text strings
  rather than rendered behavior (implementation-coupled, would pass even if the asserted branch were
  unreachable due to a logic bug elsewhere).

**Net assessment:** the 773-test, 90-file count should not be read as uniform evidence of behavioral
assurance. Treat kernel/template/spatial/experiment/atlas-preview coverage as genuinely strong; treat
roadmap/product-reset/audit-named files as governance/regression documentation with real but narrower
value; and treat the complete absence of kernel failure-mode tests as the most consequential gap this
audit found, precisely because it is what let K1-K3 go unnoticed.

---

## Architectural Debt

Conceptual, not cosmetic:

1. **No tick/command transaction boundary in the kernel** (K1-K3) is the deepest architectural gap:
   every other correctness property in this codebase (determinism, snapshot fidelity, bounded history)
   assumes ticks either succeed or don't happen; there is currently no engine-level concept of "this run
   is now invalid" once a tick has partially executed.
2. **`Space<TLocation = SpaceLocation>`'s shared, kind-agnostic location type** (K5) is a generic
   abstraction that does not actually generalize across its three implementations cleanly — `NetworkSpace`
   fits the interface only by accepting a location type (`EntityId`) that the shared command-validation
   schema cannot express, and by leaving `moveEntity` a permanent no-op/throw. This is the "fake
   genericity" pathology named in the audit brief, though currently disclosed by NetworkSpace's edge-based
   commands being the real, working alternative path.
2b. Follow-up: the `SpaceLocation` union's third arm, `Record<string, unknown>`, is a broad escape hatch
   that defeats the purpose of the other two precise arms; combined with `Space<any>` erasure at
   `World.getSpace()`, no compile-time signal exists that a location was routed to the wrong space kind.
3. **`simulationStore.ts` as a single 1,068-line, 25-field, 39-action Zustand slice** (STATE1) — current
   selector hygiene keeps this from being an active performance problem, but it is a single point of
   coupling across unrelated product concerns, and the shared `lastError`/`lastNotice` singleton slot is
   architecturally under-scoped for a store this broad.
4. **No CI enforcement of any local check** (GOV1) is a governance-layer debt that compounds every other
   finding: the extensive AGENTS.md rule set and the genuinely disciplined registry/documentation system
   both rely entirely on manual discipline (human or AI-agent) rather than an automated backstop.
5. **`deepClone` via `JSON.parse(JSON.stringify())` as the universal cloning primitive** (K6) was
   presumably chosen for simplicity/correctness (guarantees a true structural copy with no shared
   references, trivially satisfies "must be JSON-serializable"), but its use on hot *read* paths (not
   just writes) conflates a validation concern (serializability) with a performance concern
   (defensive copying) that could be served far more cheaply once inputs are already known-valid.

---

## Work Packages

Ordered per the mandated priority (state corruption/failure semantics first). Each includes explicit
non-goals to prevent scope creep into S3/roadmap territory.

### WP1 — Kernel tick/command failure semantics (addresses K1, K2, K3, K8)

- **Objective:** give `SimulationEngine` an explicit, testable contract for what happens when a tick or
  command batch fails, and close the zero-coverage gap for it.
- **Affected contracts:** `SimulationEngine.step`, `SimulationEngine.applyCommands`, `Scheduler.runTick`,
  `CommandBuffer.apply`.
- **Dependency:** none; this is the highest-priority, most self-contained fix.
- **Implementation strategy (for a future phase, not this one):** add an explicit engine-level
  failed/poisoned state that `step()`/`applyCommands()`/`runSteps()` check and fail closed on until an
  explicit `reset()`/`restoreSnapshot()`; on tick failure, discard `CommandBuffer.pending` before
  returning; decide and document the intended same-tick event-timing contract (K4) as part of this
  package since it touches the same call sequence.
- **Explicit non-goals:** no general command-sourcing/event-sourcing rewrite; no attempt at true
  mid-tick rollback of already-applied world mutations (poisoning + requiring reset is the cheaper,
  acceptable contract); no change to the `staged`/`immediate` update-mode semantics themselves.
- **Adversarial acceptance tests:** (1) a same-phase system pair where the second throws after the first
  emits commands — assert the engine is now poisoned and rejects further `step()`/`applyCommands()`
  calls with a named error until reset; (2) a batch with a failing command in the middle — assert either
  full-batch atomicity or an explicitly documented and tested partial-application contract; (3) a
  same-tick `emitEvent` visibility test with an explicit assertion of the chosen contract; (4) a direct
  `SimulationEngine.reset()` completeness test (run N ticks with entity/component/space/event mutation,
  reset, assert structural/RNG parity with a fresh same-seed engine).
- **Verification commands:** `npx vitest run src/simulation/__tests__/engine.*.test.ts`,
  `npm run lint:architecture`, `npm run typecheck`.
- **Regression risks:** any template system currently relying on the undocumented "partial tick effects
  survive a caught step() exception" behavior (none found in this audit, but not exhaustively proven
  absent) would need to be re-verified against the new poisoned-engine contract.
- **Completion condition:** the four adversarial tests above exist, pass, and are added to the permanent
  suite; `SimulationEngine`'s failure contract is documented in `src/simulation/README.md`.

### WP2 — Space/command contract kind-safety (addresses K5)

- **Objective:** prevent schema-valid-but-wrong-shaped locations from corrupting a space's internal
  representation, and replace the opaque crash with a clear domain error.
- **Affected contracts:** `spaceLocationSchema`, `CommandBuffer.applyOne` ("createEntity"/"moveEntity"),
  `Space<TLocation>` interface, `NetworkSpace`.
- **Dependency:** none; independent of WP1.
- **Implementation strategy:** validate the resolved space's `kind` against the location shape before
  delegating to `addEntity`/`moveEntity` in `CommandBuffer.applyOne`, raising a
  `SimulationValidationError` naming the mismatch; consider a dedicated network-placement command
  distinct from the Point2D/GridCell-oriented `spaceLocations`/`moveEntity` path (paralleling
  `addEdge`/`removeEdge`).
- **Explicit non-goals:** no redesign of `Space<TLocation>`'s generic shape; no new space kinds; no
  change to `Continuous2DSpace`/`Grid2DSpace` behavior.
- **Adversarial acceptance tests:** routing a Point2D-shaped location into a `NetworkSpace` (and a
  network-node-shaped location into a `Continuous2DSpace`) must raise a clear, specific validation error
  at command-apply time, never a generic crash inside `serialize()`; `NetworkSpace.moveEntity` behavior
  must be explicitly tested and documented (either genuinely removed from the interface for network
  spaces or given a real, reachable semantics).
- **Verification commands:** `npx vitest run src/simulation/__tests__/engine.spaces.test.ts
  src/simulation/kernel`, `npm run lint:architecture`.
- **Regression risks:** any existing template relying on today's silent pass-through behavior for
  mismatched locations (none found).
- **Completion condition:** new adversarial tests pass; `assertWorldInvariants` or the command layer
  never surfaces a raw `TypeError` for a schema-valid command.

### WP3 — Hostile-input hardening for scenario/snapshot import (addresses SEC1)

- **Objective:** make import parsing fail fast and cleanly on adversarial deeply-nested/oversized JSON.
- **Affected contracts:** `parseScenario`, `parseSnapshot`, `jsonValueSchema`.
- **Dependency:** none.
- **Implementation strategy:** add an explicit maximum nesting-depth check (and/or serialized-size cap)
  ahead of the recursive Zod parse for user-imported scenario/snapshot text; return a
  `SimulationSerializationError` rather than letting a `RangeError` escape.
- **Explicit non-goals:** no general rewrite of the Zod schema architecture; no change to legitimate
  scenario/snapshot shapes.
- **Adversarial acceptance tests:** a scenario/snapshot import payload nested 50,000+ levels deep must
  be rejected with a clean, typed error, not a `RangeError`.
- **Verification commands:** `npx vitest run src/simulation/kernel`.
- **Regression risks:** none expected; legitimate scenario/snapshot payloads are shallow.
- **Completion condition:** the adversarial test passes; the depth/size limit is documented next to
  `jsonValueSchema`.

### WP4 — CI enforcement and dependency hygiene (addresses GOV1, SEC2, H10)

- **Objective:** make the existing local checks a mandatory merge gate, and patch the currently-known
  critical/high dependency vulnerabilities.
- **Affected contracts:** none in application code; repository governance only.
- **Dependency:** none; can run in parallel with WP1-WP3.
- **Implementation strategy:** add a CI workflow running `npm run lint`, `npm run typecheck`, `npm test`,
  and `npm run build` on every PR (Playwright/e2e can be a separate, possibly non-blocking or
  scheduled job given its ~15-20 minute runtime observed live in this audit); add Dependabot or
  equivalent for `npm audit`-tracked advisories; run `npm audit fix`/upgrade Next.js and re-run the full
  baseline to confirm no regression before merging the version bump.
- **Explicit non-goals:** no change to what the checks themselves verify (that's WP1-WP3); no new
  linters/frameworks beyond what already exists; no attempt to add screen-reader/AT/WCAG automation
  beyond the existing Axe/Playwright harness.
- **Adversarial acceptance tests:** a PR that fails `npm run lint:architecture` or introduces a
  `Math.random` call in authoritative simulation code must be blocked by CI before merge (this is
  precisely the class of violation the 700+-rule AGENTS.md contract currently has no automated backstop
  for).
- **Verification commands:** the CI workflow itself; `npm audit` returning 0 critical/high after the
  dependency bump.
- **Regression risks:** Next.js version bump could change build/runtime behavior; must re-run the full
  baseline (typecheck/lint/vitest/playwright/build) before merging.
- **Completion condition:** CI is green on a representative PR that intentionally introduces a known
  violation (and blocks it), and `npm audit` reports zero critical/high vulnerabilities.

### WP5 — Kernel hot-loop cloning benchmark (addresses K6)

- **Objective:** determine, with isolated benchmark evidence (not inference), how much of measured
  step-time cost is attributable to `deepClone`, before deciding whether/how to optimize it.
- **Affected contracts:** none yet — this is a measurement package, not a code-change package.
- **Dependency:** none.
- **Implementation strategy:** extend `src/simulation/testing/simulationPerformanceReport.ts` (the
  existing perf-report script) with a microbenchmark isolating `ComponentStore.get()`/`deepClone` cost
  from scheduler/neighbor-query cost, per AGENTS.md's explicit instruction to keep performance reports
  separated across scheduler compute, metrics, snapshot creation, and render-model preparation.
- **Explicit non-goals:** no blind replacement of `deepClone` with a structural-sharing scheme in this
  package; no claim of scalability improvement without the benchmark evidence this package produces.
- **Adversarial acceptance tests:** N/A (measurement package); the deliverable is a benchmark report,
  reviewed before any follow-up optimization package is scoped.
- **Verification commands:** `npm run perf:simulation`.
- **Regression risks:** none (read-only instrumentation).
- **Completion condition:** a benchmark report exists attributing step-time cost across
  clone/scheduler/neighbor-query/metrics, committed under `docs/performance/`.

### WP6 — `simulationStore` notification-slot scoping (addresses STATE1, STATE2)

- **Objective:** stop one feature's unread error/notice from being silently clobbered by an unrelated
  action, and label stale cross-template experiment results.
- **Affected contracts:** `simulationStore`'s `lastError`/`lastNotice` fields and the ~25 actions that
  touch them; `latestExperimentResultSet` consumers.
- **Dependency:** none.
- **Implementation strategy:** scope error/notice state per feature area (or a small bounded queue) so
  clearing one panel's notice cannot silently dismiss another's unread error; gate
  `RunComparisonPanel`'s "Add Experiment Runs" action (or label it) on `templateId` match with the
  active template.
- **Explicit non-goals:** no full store decomposition/rewrite into multiple stores in this package (that
  is a larger architectural decision outside this hardening phase's scope); no new persistence.
- **Adversarial acceptance tests:** trigger a Setup validation error, then perform an unrelated
  run-capture action in another panel — the original error must remain visible/un-clobbered (or the
  clobbering must be an explicit, intentional UX decision, not an accidental side effect); switch
  templates after an Experiment Runner sweep and confirm the stale result is either cleared or visibly
  labeled as belonging to a different template.
- **Verification commands:** `npx vitest run`, targeted Playwright spec additions.
- **Regression risks:** low; purely additive/narrowing of existing side effects.
- **Completion condition:** adversarial tests above pass.

---

## Quality Gate

Proposed canonical merge gate (ties directly to WP4):

1. `npm ci` (reproducible install from lockfile).
2. `npm run lint` (`lint:types` + `lint:architecture`).
3. `npm run typecheck`.
4. `npx vitest run`.
5. `npm run build`.
6. `npx playwright test` (may run as a separate, longer-running required or scheduled job given its
   observed ~15-20 minute runtime; should not be optional given it is the only real-browser
   Worker/accessibility evidence this repository has).
7. `npm audit` reporting zero critical/high vulnerabilities (or an explicitly reviewed, time-boxed
   exception).

None of the above currently runs anywhere except a developer's local machine on demand.

---

## Quality Scores

Each score reflects evidence gathered in this pass; "confidence" reflects how much of the relevant
surface was directly inspected/executed versus sampled.

| Dimension | Score | Confidence | What prevents a higher score |
| --- | --- | --- | --- |
| Correctness | 6/10 | High | K1-K3, K5 are executable, verified defects in core mutation/failure paths, even though ordinary happy-path behavior is solid and well-tested. |
| Failure semantics | 4/10 | High | No tick/command atomicity, no rollback, no poisoned-engine flag; a thrown `step()`/`applyCommands()` leaves partially-mutated, un-invariant-checked state that the app layer only pauses on, never discards. |
| Architecture | 7/10 | High | Genuinely disciplined layering, authority map, and non-overclaiming registry; docked for the god-store shape (STATE1) and the non-pluggable-but-generic-looking runtime port (H7). |
| Type safety | 7/10 | High | Strict TS, clean typecheck/lint; docked for `Space<any>` erasure and the `Record<string, unknown>` escape hatch in `SpaceLocation` defeating compile-time safety exactly where K5 lives. |
| Validation/invariants | 6/10 | High | Extensive, well-layered Zod validation everywhere else; `assertWorldInvariants` does not cross-check space/network membership against entity liveness, and location validation is not space-kind-aware. |
| Deterministic reproducibility | 8/10 | High | `RandomService` is genuinely well-designed and verified; snapshot restore cross-checks tick/time/seed consistency; neighbor-query parity tests are real (if single-seed). |
| S2 recipe/builder architecture | 8/10 | High | Exceptionally well-isolated, single-canonical-schema, fail-closed, fresh-engine-per-launch design (once "S2" is correctly identified as the Workbench, and "recipe" as the Starter World launch artifact); docked only for intentional, disclosed future-composition rigidity (ARCH2). |
| Testing credibility | 6/10 | Medium-High (stakes-weighted sample, not a full census) | Genuine strength in kernel/template/spatial/experiment/atlas-preview layers and real-browser Worker/Axe coverage; a real, sizeable doc-to-doc test-theater cluster inflates the 773-test count, and zero adversarial coverage existed for exactly the failure modes this audit found defects in. |
| Security/robustness | 5/10 | High | Critical/high npm-audit findings unaddressed with no automated monitoring; a demonstrated uncaught `RangeError` from adversarial import JSON; offset by a genuinely minimal dependency surface and disciplined Starter-World input validation elsewhere. |
| Performance/scalability | 5/10 | Medium (live numbers gathered, root cause is high-confidence inference not isolated benchmark) | Real executed performance numbers exist (500-agent Flocking: ~37.6ms median step) and a real spatial-hash/all-pairs split exists, but the pervasive `deepClone` pattern is an unaddressed, unbenchmarked-in-isolation cost center. |
| Worker/runtime design | 8/10 | High | Excellent, independently-verified concurrency discipline (synchronous guards, hard backpressure, correct coalescing scope, terminal-only failure, real-browser-verified disposal); docked for RUNTIME1 (newly found) and total non-pluggability. |
| Frontend/state architecture | 6/10 | High | Uniformly excellent selector hygiene and correctly-honored draft/apply pattern; docked for the god-store aggregation and the unscoped global error/notice slot (STATE1). |
| Accessibility | 7/10 | Medium (automated Axe/Playwright evidence observed live; no manual AT/screen-reader verification performed) | Extensive passing Axe-scan coverage observed in this pass's own Playwright run; explicitly not verified against real screen-reader/AT/zoom behavior, consistent with AGENTS.md's own caveat. |
| Developer experience | 7/10 | High | Fast, clear npm scripts and a genuinely useful custom architecture lint; docked for the complete absence of CI (so "passes locally" is the only available signal) and the long Playwright runtime. |
| Documentation | 8/10 | High | Unusually disciplined CURRENT/PLANNED/PROPOSED/DEPRECATED labeling and an explicit documentation-authority precedence order that this audit's own findings did not contradict; docked for sheer volume (700+ AGENTS.md rules) as its own maintainability risk. |
| Scientific integrity | 8/10 | High | Extraordinarily disciplined non-overclaiming primitive/template-capability registry, spot-verified structurally accurate rather than merely asserted. |
| Maintainability | 6/10 | Medium-High | Individually clean, small kernel files; docked for the 1,068-line god-store, the 1,133-line largest test file, and three hand-duplicated engine-reset code paths (STATE3). |
| CI/governance | 2/10 | High | No CI configuration exists anywhere in the repository; nothing enforces any local check before merge. This is the single clearest, most unambiguous gap found in this audit. |

---

## Remaining Investigation (explicitly out of scope for this pass, not forgotten)

- A true multi-seed fuzz sweep for `queryNeighbors`/`ContinuousSpatialHashIndex` (currently single-seed).
- Manual/real screen-reader and browser-zoom verification (Axe/Playwright evidence only exists today).
- Cross-browser (non-Chromium) and real-mobile-device verification.
- An isolated `deepClone`-cost microbenchmark (K6/WP5) — currently a high-confidence inference from live
  step-time numbers, not a directly isolated measurement.
- Whether the React tick-loop consumer of `simulationStore`'s `engine` field could ever hold a stale
  closure across a replacement (flagged UNVERIFIED RISK by the frontend subagent, not executed).
