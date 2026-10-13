# Visual Systems Workbench Audit

Status: S2B COMPLETE; SA0 NEXT / UNSTARTED

Date: 2026-10-07 to 2026-10-13

This is the S2B independent adversarial audit record for S2, the Visual Systems Workbench at `/builder`. It is subordinate to `../CAPABILITIES.md`, `../ARCHITECTURE.md`, `../SCIENTIFIC_MODEL.md`, and `../ROADMAP.md`. Code and tests remain authoritative for behavior. The S2 implementation record is `VISUAL_SYSTEMS_WORKBENCH.md`.

## Separate Verdicts

**Technical and authority result: accepted after two P2 fixes.** No P0 or P1 was found. The Workbench owns no engine, store subscription, RNG, scheduler, Worker, storage, composition, or execution path. Run Remix remains the single S1/S1B scenario-acceptance path. A modified derivative replays identically at the same configuration and seed for all eleven runnable Starters. Hostile `/builder` and `/world` Remix queries fail closed.

**Product and HCI result: accepted with recorded P3 items.** Core flows complete by keyboard alone, narrow drill-in and return work, there is no horizontal overflow at 320, 768, 1280 or 390 px, reduced motion zeroes transitions, and Axe reports zero violations. Two observed P2 defects were fixed: relationship-trace buttons had run-together accessible names, and orientation copy overstated what Remix changes. Participant comprehension, screen-reader behavior, forced colors, and real browser zoom remain unverified.

The UR0 human comprehension gate remains pending. Browser automation and expert review cannot close it.

## Starting State

- Branch `main` at `4a0a1e7` (`chore(rules): widen path scopes flagged in PR #10 review`). This was the S2B starting commit, after the S2B prompt's docs-only resync (`6ba2479`) and rule-scope carry-over. `main` matched `origin/main` at `c4c5980` before those two local commits. The tree was clean. Node 24.16.0, npm 11.13.0.
- S2 was complete (`8114043`). S2B was NEXT / UNSTARTED. S3 was blocked; SA0, O1, E1 and I2 were unstarted.
- After S2, hardening Phase 2 (`2bb7bdc`) had narrowed `StarterRemixWorkspace.runRemix()` so that only a `setup`-area store error counts as a rejected apply. This audit covers that change.
- Production Flocking used one Worker-owned engine/RNG/scheduler authority. The six non-Flocking templates used their established main-thread engines.

## Audit Scope And Method

The audit followed the `ortus-audit` procedure across five areas: authority, material honesty, determinism and provenance, HCI, and hostile input.

**Partial blindness.** Before the audit started, the S2B prompt's orientation step required reading the S2 record `VISUAL_SYSTEMS_WORKBENCH.md`. The procedure normally builds findings blind, so the blind phase was only partly blind. Findings were still derived from invariants, source, and rendered checks. The S2 claims were compared against those findings only afterwards (see "S2 Claim Results").

**Sources traced:**
- the Workbench model and materials, `src/lib/workbench/`
- `VisualSystemsWorkbench.tsx`
- `StarterRemixWorkspace.tsx`
- `BuilderShell.tsx` and `BuilderExperienceTabs.tsx`
- the `/builder` page and its query parser
- `src/lib/starterWorlds/remix.ts`
- `simulationStore.applyScenario`
- the `AppShell` Remix acceptance and active-World handoff
- the `StarterActionNudge` handoff capture
- the root layout and `TemplateBackgroundLayer`

**Copy check.** A dedicated pass checked every runtime claim in the seven per-template Workbench descriptions against the template rule implementations.

**Rendered checks.** These used a throwaway Playwright diagnostic spec against the production build and were deleted before closure:
- accessible names, landmarks and the heading outline at 1280 px
- relationship-trace focus
- the materials and questions views
- keyboard-only completion from the Workbench through piece inspection, numeric edit, and Run Remix into World
- a forged World Remix identifier
- 320×640 and 768×1024 at DPR 2, 1280×800 at DPR 2, and 390×844, all with reduced motion
- narrow drill-in, Back, and material Back
- Axe on every state

I inspected screenshots of the Workbench at 1280 and 320 and of the resulting World run.

**Hostile input.** `curl` probes against the production server covered:
- prototype-like keys (`__proto__`, `constructor`, `prototype`) and promise-like keys (`then`, `catch`, `finally`)
- `Object.prototype` names
- duplicate, unknown, empty and over-long values
- uppercase and NUL-containing identifiers
- the literal middleware sentinel
- forged `focus` values
- a recipe that belongs to another Starter
- `from` values other than `world`
- forged, duplicate and prototype-like World `remix` identifiers
- `task`, `guide` and payload companions

## Findings And Fixes

| ID | Area | Class | Severity | Reproduction | Disposition |
| --- | --- | --- | --- | --- | --- |
| F1 | HCI | Observed defect | P2 | At 1280 px on `/builder`, the "Follow a relationship" buttons expose accessible names such as `PositionNearby neighbors`, because the arrow between the labels is `aria-hidden` | Fixed (`cbede3d`) |
| F2 | Material honesty | Observed defect | P2 | The Workshop tagline says "Change what it can do", and four orientation strings say Remix changes "supported pieces". The Workbench fixes rules, metrics and piece structure and edits only existing configuration | Fixed (`6adf036`) |
| F3 | HCI | Observed defect | P3 | At 320 or 390 px: Browse building blocks → Movement → Back. The overview returns, but the path still ends in "Movement", the material stays selected, and focus goes to the previously selected piece | Recorded |
| F4 | HCI (shared shell, outside S2) | Observed defect | P3 | At 320 px the global header's ORTUS wordmark overlaps the Start link | Recorded |
| F5 | HCI | Observed defect | P3 | Axe "needs review" `aria-prohibited-attr` (2–3 nodes): `aria-label` sits on generic `div`s (Workbench scroll region, decomposition path, Remix lineage) | Recorded |
| F6 | HCI | Observed defect | P3 | Shared `CornerFramePanel` titles render as disabled buttons, not headings. The visible outline is H1 Workshop → H2 system → H3 piece → H4 | Recorded |
| F7 | Hostile input (S1-era) | Observed defect | P3 | `/builder` is outside the middleware matcher. `then`, `catch` and `finally` cannot be caught before `await searchParams`: they are ignored without a Remix key and rejected afterwards as "unsupported configuration data" with one. This is fail-closed, takes 0.02–0.04 s in production, and was not checked on the dev server | Recorded |
| F8 | Hostile input | Observed defect | P3 | Typing the middleware sentinel `?starter=unsafe-query-key` shows the "unsafe query key" message | Recorded |
| F9 | Material honesty | Observed wording | P3 | Accurate but loose descriptions: Forest Fire "Optional regrowth" is on by default (0.002); predators reproduce at, not strictly above, the threshold; the event queue delivers Epidemic recovery and the template applies it | Recorded |
| F10 | Authority (S1-era) | Inferred risk | P3 | The module-level active-World handoff could outlive a preparation that never mounts Workshop, then be consumed by a later Forward navigation to `?from=world` | Recorded |
| F11 | Authority | Inferred risk | P3 | For Flocking, `runRemix()` checks the queued configuration it just wrote, not a Worker-accepted one. Readiness is decided on `/world` by the I1B/Phase 3 Worker path | Recorded |
| F12 | HCI | Inferred risk | P3 | Run Remix replaces the current World run without saying that the active trajectory is discarded | Recorded |
| F13 | HCI | Unverified | P3 | On desktop, clicking a piece updates the inspector without moving focus or announcing the change. Screen-reader impact is not verified | Recorded |
| F14 | Robustness | Inferred risk | P3 | Hard-coded question Starter IDs and a non-null template assertion throw during render with no error boundary. Neither is reachable from input today | Recorded |
| F15 | HCI | Subjective preference | P3 | Every example link opens an unsaved Remix draft labelled "Your derivative" before any edit. At 320 px the fixed Remix footer takes about a quarter of the viewport. "Draft contract checked" uses a warning-like hue for a passing state | Recorded |

### P0

None found.

### P1

None found.

### P2

1. **Relationship-trace buttons had run-together accessible names.** Each button rendered `{from}<i aria-hidden>→</i>{to}`, so assistive technology received names like `PositionNearby neighbors`. A visually hidden " to " now separates the labels, giving `Position to Nearby neighbors`. Activation still inspects the origin piece and focuses it in the assembly. Regression: `tests/ui/visual-systems-workbench.spec.ts` "relationship trace buttons name both connected pieces as separate words".
2. **Orientation copy overstated Remix.** "Open a working system. Discover its pieces. Change what it can do." implied that Remix changes capabilities. "Remix supported pieces" in the Workshop tab description, route metadata, route orientation and research destinations implied that pieces can be swapped. The Workbench itself says rules, metrics and piece structure stay fixed, and that only existing seed, parameter, initialization, behavior, composition and environment values change. The copy now reads "Open a working system. Take it apart. Remix its supported properties." and "remix supported properties". The three existing assertions on the old destination string were updated to the corrected string with equal strength. Regression: `src/lib/workbench/workbenchAudit.test.ts` "describes Remix as changing supported properties, never pieces or what a system can do".

2 of 2 new regression tests failed before their repairs and pass after them.

### P3

F3–F15 are recorded and not pursued, per the audit procedure. F7 and F10 belong to the S1 surface and suit a later hardening pass. F4 belongs to the shared shell.

## Contract Results

- **One authority.** The Workbench model, materials, types, component and glyph files import no store, zustand, engine, scenario application, runtime driver, Worker, browser storage, `eval` or `Function` (contract test). `StarterRemixWorkspace.runRemix()` is the only store write.
- **No ticking on `/builder`.** The World cadence loop lives only in `AppShell`, which mounts only on `/world`. `TemplateBackgroundLayer` reads `selectedTemplateId` and writes nothing. The legacy `applyScenario` branch does not pause the replaced engine, but nothing steps engines on `/builder` and the replaced engine is unreachable.
- **Setup-only rejection filter.** The Phase 2 filter cannot mask a failed apply: `applyScenario`'s catch always records a `setup`-area error, and success clears setup, run and intervention errors.
- **Flocking stays Worker-only.** Run Remix queues configuration and leaves the store without a main-thread Flocking engine (contract test). The six other templates build a fresh main-thread engine through `createEngineFromScenario`.
- **Paused tick 0 with lineage.** For all eleven runnable Starters, a modified derivative is accepted as a paused tick-0 run whose accepted configuration carries the modified value and the derivative draft lineage, and matches the launch identity (contract test). Rendered: an Epidemic Remix completed by keyboard alone opened World as "Paused · Tick 0 · Unsaved remix of Epidemic Spread baseline · Main thread".
- **Determinism.** The same modified configuration and seed produce identical tick-0 snapshots and identical snapshot exports after twelve steps, on fresh engines, for all eleven runnable Starters (contract test). The existing engine and per-template same-seed determinism tests are unchanged. The repository has no trajectory-hash test; same-seed checks compare snapshots directly.
- **Capability states.** Text labels with shape markers distinguish executable, structural and reference material. Material status comes from the registry. Pieces of a runnable template are marked "Executable in this template" because each describes template-owned behavior, and each states that the piece itself does not execute. "Future · not implemented" cannot appear today because no linked primitive is `reserved`. No Compile, Connect, Run model or Add material control exists.
- **Explanatory copy.** Every runtime claim in the seven template decompositions matched template source. Only the F9 wording looseness was found.
- **Hostile `/builder` queries.** Every probe rendered the explicit stop state or, without a Remix key, the plain Workbench. This covered prototype-like, duplicate, unknown, empty, over-long, uppercase, NUL, forged-focus, cross-Starter recipe and unsupported-entry input. See F7 and F8.
- **Hostile `/world` Remix queries.** Duplicate, empty, prototype-like, payload-bearing and guide-combined input renders explicit errors. A well-formed but unknown draft identifier renders "Unsaved remix unavailable" without substituting the source Starter or a generic run.
- **Advanced import.** The import paths reachable from `/builder` (workspace and model-schema JSON) predate S2. They were not re-audited here; their existing headless deserializer tests remain in force.
- **Layout and motion.** There is no horizontal overflow at 320, 768, 1280 or 390 px. Reduced motion yields a `0s` transition duration on Workbench pieces. The Workbench uses inline SVG glyphs marked `aria-hidden`, and no Canvas.
- **Axe.** Zero violations on the Workbench, materials, questions, Remix and narrow states. The "needs review" items are color contrast (Axe cannot decide over layered backgrounds) and F5.

## S2 Claim Results

| S2 claim (`VISUAL_SYSTEMS_WORKBENCH.md`) | Result |
| --- | --- |
| Normal `/builder` opens a worked Flocking assembly | Confirmed (rendered) |
| Workbench is the primary Workshop surface | Confirmed (rendered, tab state) |
| Starters open as assembled, decomposable systems | Confirmed (rendered at 320 and 1280) |
| Structurally different models share one representation | Confirmed (unit tests, existing browser tests, copy check) |
| Pieces and relationships are meaningful | Confirmed for runtime accuracy (copy check); comprehension unverified |
| Expand/collapse/drill-in is coherent, with return controls | Confirmed; F3 is a P3 material-return nit |
| Materials vocabulary is reusable | Confirmed |
| Capability states are explicit and non-color-only | Confirmed |
| S1 controls appear through selected pieces | Confirmed (keyboard flow) |
| Starter → Remix feels like modifying a system | Unverified; it is a product judgment needing participant evidence |
| Guided/Advanced remain reachable and secondary | Confirmed (keyboard tab order) |
| Unsupported composition never appears executable | Confirmed |
| Named relationship navigation | Contradicted for the trace buttons (F1); fixed |
| No hover-only essential information or Canvas-only semantics | Confirmed |
| Motion respects reduced-motion preferences | Confirmed (computed transition) |
| Workshop owns only presentation and unsaved draft state; Run Remix uses the S1/S1B path | Confirmed |
| Flocking keeps one Worker authority; legacy paths unchanged | Confirmed |
| S2's own gate counts | Not re-run as historical claims; current gates below |

## Rejected Hypotheses

- **"Phase 2's setup-only filter lets a failed apply through."** Rejected. The `applyScenario` catch always writes a `setup` error (`simulationStore.ts`).
- **"Run Remix on `/builder` leaves a second live engine ticking."** Rejected. No cadence mounts on `/builder`, and the replaced engine is unreferenced.
- **"Background layer subscription grants authority."** Rejected. It is a read-only selector.
- **"Explanatory copy misstates template rules."** Rejected. No inaccurate runtime claim was found (F9 wording only).
- **"Forged Remix identifiers substitute a run."** Rejected. The explicit resume error renders.
- **"Prototype keys reach the registry lookup."** Rejected. They are refused before parsing, and registry lookup uses `Array.find`.

## Verification

Gate results for the final S2B tree. An earlier complete-browser invocation on 2026-10-09 passed its first 60 cases, then was cut off when the session and machine ended. It produced no result and counts as neither a pass nor a retry.

| Gate | Result |
| --- | --- |
| `npm run typecheck` | PASS (18.1s) |
| `npm run lint` | PASS; scoped TypeScript/unused-symbol baseline plus "Architecture lint passed (397 production TypeScript files checked)" (20.0s) |
| `npm test` | PASS; `103 files / 1,034 tests` (68.9s); determinism and per-template same-seed tests unchanged since `c4c5980` |
| `npm run build` | PASS; Next.js 15.5.26 compiled in 8.0s; 23/23 pages |
| `CI=1 npm run test:ui` (production server, 1 retry, flaky fails) | PASS; `221/221` in 13.4m; 0 retries, 0 flaky, 0 failed, 0 skipped; exit 0 |
| `npm run perf:runtime` | Not run: no runtime, Worker, kernel, template or simulation file changed |
| `git diff --check` | Clean |

Focused checks: the S2B contract file passed `5/5`. The new relationship-trace browser test failed on the pre-fix build and passed on the fixed build. The affected unit suites passed `13 files / 124 tests` after the copy fix. The throwaway diagnostic spec (`7/7`) was deleted before closure. Its screenshots lived only in the session scratch directory, which no longer exists.

## Remaining Evidence Limits

- **Not verified directly:**
  - screen-reader and assistive-technology behavior, including F13
  - forced colors and high-contrast modes
  - real browser zoom (viewport automation is not zoom)
  - touch hardware
  - participant comprehension
  - formal WCAG conformance
- **Not exercised in S2B:**
  - The Flocking Worker-rejection path after Run Remix. It is covered by the I1B and Phase 3 runtime tests, not re-run here.
- **Not proven by this audit:**
  - cross-template Worker support
  - generic composition
  - scientific validity

## Handoff

S2B is complete. SA0 (Scientific Architecture contract pass for model, run, and research artifacts) is NEXT / UNSTARTED and requires its own dedicated prompt. S3 remains blocked, and general executable composition remains unimplemented. The P3 items above, particularly F7 (extend the unsafe-key middleware to `/builder`) and F10 (stale active-World handoff), are candidates for a later hardening pass and are not started here.
