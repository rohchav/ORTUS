# ORTUS Full UI/UX Comprehension And Sandbox Theme Audit

## 1. Scope

Prompt UX3 audits the current rendered ORTUS interface for comprehension, sandbox/workbench fit, beginner access, advanced-user preservation, information density, language layering, and readiness to continue the Research World sequence.

This audit is documentation and planning only. It does not redesign the UI, add CSS tokens, add components, add routes, add preferences, add onboarding, add progression, add persistence, add Builder execution, add Lab records, add Atlas discoveries, add landscape sampling, add dependencies, or change simulation/runtime behavior.

## 2. Starting Commit

Starting commit: `466213b test: audit landscape probe planning foundation`.

The starting worktree was clean. UX3 began after Prompt GW8B had been committed.

## 3. Routes Audited

Rendered routes audited:

- `/` World
- `/builder` Workshop
- `/lab` Lab
- `/atlas` Atlas

## 4. Viewports Audited

Rendered route inventory used these viewport sizes for every route:

- `1440x900`
- `1280x720`
- `1024x768`
- `900x700`
- `1280x600`

Representative screenshots were captured to `/tmp/ortus-ux3/`. They are audit evidence, not committed product assets.

## 5. Baseline Check Results

Pre-edit baseline gates were green except the unavailable lint script:

- `npx playwright test tests/ui/research-world-shell.spec.ts`: passed, 30 tests, after local-server permission was granted.
- `npm run test:ui`: passed, 45 tests, after local-server permission was granted.
- `npm run typecheck`: passed in the prior UX3 baseline.
- `npm test`: passed in the prior UX3 baseline, 67 files and 543 tests.
- `npm run build`: passed in the prior UX3 baseline.
- `npm run perf:simulation`: passed in the prior UX3 baseline.
- `git diff --check`: passed in the prior UX3 baseline.
- `npm run lint`: unavailable, package.json has no lint script.

The sandboxed local server failed with `listen EPERM` / configured web-server early exit. This was a sandbox local-socket permission issue, not an observed app crash.

## 6. Executive Verdict

ORTUS is runtime-honest, structurally disciplined, and much less fake than most ABM/workbench projects at this stage. That is the good news.

The bad news is that the interface still reads too much like an expert command console. It is dense, status-heavy, uppercase-heavy, and caveat-heavy. The caveats are necessary, but their current presentation makes first-run comprehension pay too high a tax. World is the closest to a sandbox because the simulation is visible and controllable. Workshop is precise but not beginner-friendly. Lab and Atlas are honest but mostly conceptual scaffolding.

Decision: pause GW9. The next prompt should be UX4, followed by UX4B, UX5, UX5B, UX6, and UX6B unless the pause is explicitly waived.

UX3 complete.
GW9 paused until the sandbox-theme and guided-comprehension track is addressed or explicitly waived.
Next recommended prompt: UX4.

Post-UX4 note: `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION.md` records the first bounded sandbox visual-language implementation. UX4 complete. GW9 remains paused.

Post-UX4B note: `docs/ui/SANDBOX_VISUAL_LANGUAGE_FOUNDATION_AUDIT.md` audits the UX4 foundation, finds it ready for UX5, and keeps GW9 paused. UX4B complete. Next recommended prompt: UX5.

## 7. Sandbox-Theme Fit Findings

World partially fits the sandbox target. The canvas dominates at wide viewports, run controls are visible, and the current model/scenario/run state is clear. At `900x700`, World becomes more approachable because the operational controls and world surface are visible without the full left context wall.

Workshop is not currently a sandbox. It is an expert structural inspection and authoring workbench. That is acceptable for advanced users, but it should become explicitly two-tiered: Guided Builder for first construction flow, Advanced Builder for direct schema/workspace/graph tools.

Lab is a truthful foundation, not a lab experience yet. The page says what it does not save, but there is little beginner sense of "what would I do here later?" without reading dense evidence vocabulary.

Atlas is honest but abstract. It avoids fake maps, scores, and discoveries, which is correct. It also looks like a static evidence-policy board rather than a navigable atlas or sandbox.

## 8. Beginner Comprehension Findings

World beginner comprehension: fair. A beginner can probably find Run, Step, Reset, speed, current model, and the visible world. The user still has to parse "active modeled system", "model output is exploratory", "workspace setup", and capability guidance before they know the first task.

Workshop beginner comprehension: weak. "No workspace loaded" is clear, but the page quickly becomes a wall of structural-only, not-runnable, no-compiler, no-schema-execution, no-template-generation labels. Correct, but intimidating.

Lab beginner comprehension: weak to fair. It clearly says Lab is not a database, not persisted, and not validation. A beginner may still wonder why the page exists today.

Atlas beginner comprehension: weak to fair. It explains boundaries well but introduces evidence-state, sampled/unsampled, landscape, probe planning, and discovery-certification language before giving a simple first action.

## 9. Advanced-User Preservation Findings

Do not dumb down the advanced surfaces. ORTUS needs expert access to exact templates, seeds, parameters, runtime status, schema structure, graph inspection, fit reports, scenario planning, capability boundaries, and non-persistence warnings.

The fix is layering, not removal. Keep advanced copy and controls available, but stop forcing every user to read the full epistemic contract before they can identify the next useful action.

Advanced Builder should remain direct, dense, and precise. Guided Builder should be a separate flow over existing safe structural services, not a replacement and not a hidden interpreter.

## 10. Two-Tier Language Inventory

Recommended two-tier labels:

- Current run: plain "This run" plus technical "active local run".
- Model output: plain "what this model does" plus technical "exploratory model output, not empirical truth".
- Scenario: plain "starting recipe" plus technical "initial-condition and supported variant recipe".
- Seed: plain "repeatable randomness" plus technical "deterministic seed".
- Snapshot: plain "exact saved tick state" plus technical "engine snapshot restore point".
- Schema: plain "model structure draft" plus technical "`ortus.modelSchema` structural artifact".
- Workspace: plain "structure map" plus technical "`ortus.visualBuilderWorkspace` artifact".
- Fit report: plain "resembles existing templates" plus technical "structural compatibility summary, not conversion".
- Scenario plan: plain "questions to investigate" plus technical "non-runnable study-plan artifact".
- Evidence state: plain "what this model evidence can and cannot support" plus technical "model-behavior interpretation state".
- Behavioral landscape: plain "where model behavior changes across conditions" plus technical "non-persistent model-space vocabulary".
- Probe plan: plain "future investigation sketch" plus technical "non-executable landscape probe scaffold".

## 11. Information-Density Findings

Rendered DOM inventory showed high status-copy density on all routes. At `1440x900`, World exposed 30 status snippets, Workshop exposed 30, Lab exposed 30, and Atlas exposed 30. At `900x700`, Workshop still exposed 30 status snippets while narrowing to 15 visible controls.

This density protects runtime honesty but harms comprehension. The next design pass should separate:

- Always visible orientation: where am I, what can I do now, what is current.
- Nearby caveat: what this result/control does not mean.
- Expandable technical layer: exact artifact family, runtime boundaries, unsupported features, audit caveats.

## 12. Icon/Symbol Findings

The ORTUS mark is clear in navigation and should remain paired with the wordmark. The compass-like lower-left route decoration is visually distinctive but competes with actual navigation affordance at small sizes.

Status badges use color, text, and borders, which is good. The issue is not missing text. The issue is that many badges compete at once.

Future UX4 icon/symbol work should introduce a restrained sandbox/instrument visual language for state types, but it must not rely on icons alone or create fake scientific states.

## 13. Builder-Flow Findings

The current Builder is really Workshop Advanced Mode. It is a valid structural workspace, not a guided modeling entry point.

The first screen says "No workspace loaded" and then presents import/load/export, validation panel, warnings panel, Workspace Inspector, Author Schema, Graph View, JSON import, navigation filters, graph viewport, and inspector. That is powerful, but it is not an introduction to building a model.

The required future Builder split:

- Guided Builder: step-by-step structural authoring and explanation over existing non-executing services.
- Advanced Builder: current direct Workspace Inspector, Author Schema, Graph View, fit report, and scenario-planning surfaces.

Guided Builder must not add Run, Compile, Preview Simulation, Generate Scenario, Generate RunConfig, Generate Template, Apply to Simulation, formulas, scripts, or code execution.

## 14. Route-By-Route Task Model Findings

World task model: observe and perturb an active modeled system. It has the clearest current task loop: choose setup, run, observe, intervene, experiment, compare.

Workshop task model: construct and inspect structural artifacts. It currently serves advanced import, validation, authoring, graph inspection, fit reporting, and scenario planning.

Lab task model: structure future evidence records and experiment ledgers. Current page is conceptual and non-persistent, not a working lab.

Atlas task model: orient future evidence and behavioral territory. Current page is conceptual and non-persistent, not a map, discovery list, sampler, or evidence ledger.

## 15. Progressive-Disclosure Findings

ORTUS has disclosure by route and mode, but not enough disclosure by user intent. It already separates Setup, Understand, Observe, Intervene, Experiment, Compare, Debug, and Builder modes. It does not yet provide a beginner-first path through those modes.

UX5 should add progressive disclosure without persistence or profiles. Use local view state only. Avoid preferences, personalization, recommendations, stored onboarding state, XP, locks, or achievements.

## 16. Sandbox Visual-Language Plan

UX4 should shift the first impression from command console to living modeling sandbox while preserving precision.

Plan:

- Preserve dark, precise, scientific identity.
- Reduce tactical/HUD overtones: saturation, constant uppercase, command-console density, and warning-wall rhythm.
- Make World feel like the primary living surface, with instruments around it.
- Make Workshop feel like a modular modeling bench, not a compiler.
- Make Lab feel like a future research ledger scaffold, not a database.
- Make Atlas feel like a map of questions and model-behavior territory, not a discovery-certification board.
- Keep all runtime-honesty copy close to relevant controls and outputs.
- Add no dependencies, remote fonts, asset packs, or broad CSS rewrite.

## 17. Beginner/Advanced IA Plan

UX5 should create a beginner/advanced information architecture while preserving expert access.

Beginner layer:

- "Start here" orientation for World.
- Plain-language summaries before technical labels.
- "What changes the run" vs "what only describes structure".
- Small number of next actions per route.

Advanced layer:

- Direct access to exact parameters, schema authoring, validation diagnostics, fit reports, scenario plans, graph view, and copyable details.
- No forced tutorial, no account, no persistent preference, no profile.

## 18. Guided Builder Plan

UX6 should introduce a non-executing Guided Builder flow over existing Author Schema services.

The flow should help a user name the model, define entities/components/attributes, define space/parameters/metrics, write non-executable rule descriptions, review unsupported/future-only gaps, and export a structural schema.

It must not run the model, compile schemas, generate templates, generate scenarios, generate RunConfigs, generate snapshots, mutate the active simulation, execute Builder graphs, interpret formulas, or call external models.

## 19. Accessibility Findings

The rendered suites include Axe smoke checks across `/`, `/builder`, `/lab`, and `/atlas`, plus route landmarks, focus smoke, overflow checks, reduced-motion checks, and static-scaffold Tab-stop checks.

That is useful evidence, not certification. No screen-reader walkthrough, assistive-technology verification, forced-colors audit, or full WCAG conformance audit was performed.

## 20. Keyboard/Focus Findings

The current route shell has rendered focus and skip-link coverage. Builder mode tabs and graph alternatives have source/test coverage from prior prompts. Lab and Atlas scaffolds are intentionally static readable regions with zero local Tab stops.

Remaining risk: a beginner keyboard-only walkthrough has not been observed end to end. Passing focus smoke tests does not prove the workflow is easy to understand.

## 21. Responsive Findings

Across the UX3 rendered inventory, all audited route/viewport pairs reported `horizontalOverflow: false`.

At smaller and shorter viewports, the interface avoids horizontal breakage but compresses comprehension. The content remains technically present; it does not become a mobile-first workflow.

Do not treat responsive stacking as complete mobile UX readiness.

## 22. Browser Zoom Status

A headless Chromium keyboard-zoom attempt visited `/`, `/builder`, `/lab`, and `/atlas`, pressed Ctrl+plus repeatedly, and measured `devicePixelRatio`, `innerWidth`, and `visualViewport.scale`. Those metrics did not change.

Actual browser zoom at 125%, 150%, and 200% was not verified.

## 23. Reduced-Motion Findings

The Playwright rendered suites include reduced-motion checks. They passed in the focused shell suite and full UI suite.

This does not prove every future animation is acceptable, and it does not replace manual review of motion meaning. UX4 should keep motion informational and reduced-motion compliant.

## 24. Axe Findings

The focused shell suite and full UI suite passed their Axe smoke checks after local-server permission was granted.

This is automated accessibility smoke evidence only. It is not a screen-reader, assistive-technology, forced-colors, actual browser-zoom, or WCAG conformance claim.

## 25. Console/Hydration Findings

The rendered route inventory captured zero page errors and zero browser console error/warning messages for all 20 route/viewport combinations.

The Playwright web server emitted `NO_COLOR env is ignored due to FORCE_COLOR` noise. That is dev-server output, not observed page hydration failure.

## 26. Copy Inventory And Rewrite Plan

Copy to preserve:

- Model output is exploratory, not empirical truth.
- Valid is not runnable.
- Structural-only / no compiler / no schema execution / no template generation.
- Lab is not a database.
- Atlas is not discovery certification.
- Planned comparison is not a comparison result.

Copy to layer:

- "active modeled system"
- "evidence-state vocabulary"
- "behavioral landscape"
- "landscape probe planning"
- "structurally valid"
- "template-owned"
- "non-persistent foundation"

UX4/UX5 should keep exact technical language available, but lead with plain task language.

## 27. Screen Setup/Layout Findings

World at `1440x900`: strong world dominance, useful run dock, but the left context and capability guidance compete with the first impression.

World at `900x700`: clearer immediate run loop, but context guidance is mostly pushed away.

Workshop at `1440x900`: powerful, highly instrumented, dense. It reads as expert mode.

Workshop at `900x700`: still dense; badge row and capability guidance dominate before a beginner gets a construction path.

Lab and Atlas at `1280x600`: page summaries and capability panels remain visible, but lower conceptual scaffolds are cut off. The surfaces stay honest; they do not yet feel like working destinations.

## 28. Scope-Creep Search Findings

The required search command was run:

```bash
rg -n "localStorage|sessionStorage|IndexedDB|cookie|database|saved|preference|personalized|recommend|recommended|onboarding|achievement|XP|level|rank|unlock|locked|streak|progress|wizard|guided builder|advanced builder|run queue|job queue|run sweep|batch simulation|sampled result|regime detection|confidence score|coverage percentage|evidence score|publish to Atlas|create discovery|send to Lab|Date\\.now|Math\\.random|crypto.randomUUID|uuid|fingerprint" src docs tests
```

The search returned many expected hits in docs, tests, and guardrails. Production-source hits were pre-existing and mostly fell into known categories: local run/scenario/panel storage, avatar/performance instrumentation localStorage, UI timestamp ids, experiment progress, social-learning rejection vocabulary, and explicit negative tests.

UX3 added no production storage, no preferences, no onboarding, no progression system, no recommendations, no saved Atlas/Lab behavior, no run queues, no sampling, no regime detection, no fake scores, no random runtime behavior, and no Builder/runtime execution path.

## 29. Recommended Next Prompt Sequence

Recommended sequence:

```text
UX4: Sandbox Visual Language Foundation
UX4B: Sandbox Visual Language Audit and Hardening
UX5: Progressive Disclosure and Beginner/Advanced Information Architecture
UX5B: Progressive Disclosure Audit and Hardening
UX6: Step-by-Step Builder and Configuration Flow Foundation
UX6B: Builder Flow Audit and Hardening
GW9: Ephemeral Landscape Sampling Preview V1
```

## 30. UX4 Acceptance Criteria

UX4 acceptance criteria:

- Establish sandbox/workbench visual-language refinements without broad redesign.
- Preserve ORTUS brand, current routes, current runtime behavior, and current Builder behavior.
- Reduce command-console/tactical impression while preserving precision.
- Keep World visually dominant.
- Keep runtime-honesty copy visible near relevant controls and outputs.
- Add no dependencies, remote fonts, asset packs, backend, persistence, or preferences.
- Pass focused rendered route checks and full UI suite.

## 31. UX5 Acceptance Criteria

UX5 acceptance criteria:

- Add progressive disclosure and beginner/advanced IA using non-persistent local UI state only.
- Preserve direct expert access to advanced controls.
- Avoid stored preferences, personalization, recommendations, onboarding state, progression, XP, locks, achievements, or user profiling.
- Keep exact technical language available behind or near plain-language summaries.
- Do not remove runtime-honesty caveats.
- Pass focused rendered route checks and full UI suite.

## 32. UX6 Acceptance Criteria

UX6 acceptance criteria:

- Add a step-by-step Guided Builder flow over existing safe schema-authoring services.
- Keep the current Builder available as Advanced Builder.
- Do not run, compile, preview, generate, or apply schemas/workspaces.
- Do not execute formulas, code, scripts, rule descriptions, graph edges, or arbitrary metadata.
- Preserve draft safety, import validation, repair boundaries, and structural-validity vs runtime-readiness language.
- Pass focused rendered route checks and full UI suite.

## 33. Risks

Main risks:

- The interface is honest but can exhaust users before they understand the task.
- Static Lab/Atlas foundations may be mistaken for implemented research systems because they are visually polished.
- "Landscape" and "probe" language can sound like sampled data unless guarded.
- "Fit report" and "scenario plan" can sound like conversion/generation unless guarded.
- A Guided Builder could easily become a hidden compiler if future prompts are sloppy.
- Product language can drift from sandbox/workbench into tactical command or pseudo-scientific authority.

## 34. Non-Goals

UX3 does not implement:

- UX4, UX5, UX6, GW9, F1, or any future prompt.
- Theme tokens, production CSS redesign, component library, icon library, fonts, assets, or dependency changes.
- Preferences, personalization, onboarding, stored beginner mode, advanced mode persistence, achievements, progression, XP, locks, recommendations, analytics, telemetry, or user profiling.
- Lab records, Atlas discoveries, saved landscapes, saved probe plans, sampling, run queues, sweeps, regime detection, or evidence scores.
- Runtime/template changes, Builder execution, schema execution, graph execution, formula parsing, code execution, external API calls, or LLM agents.

## 35. Verification Commands

Required final verification commands:

```bash
npm run test:ui
npm run typecheck
npm test
npm run build
npm run perf:simulation
git diff --check
npm run lint
```

`npm run lint` is expected to be unavailable unless a lint script is added separately. UX3 does not add that script.

Final UX3 verification result:

- `npm run test:ui`: passed, 45 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 67 files and 543 tests.
- `npm run build`: passed.
- `npm run perf:simulation`: passed.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

## 36. Remaining Limitations

No user study was performed. No beginner comprehension test was performed. No screen-reader walkthrough was performed. No assistive-technology audit was performed. No forced-colors audit was performed. Full WCAG conformance was not established.

Actual browser zoom at 125%, 150%, and 200% was not verified.

Rendered inspection covered the route/viewports listed in this document and the existing Playwright/Axe suites. It does not prove every possible viewport, OS/browser setting, browser zoom level, or content combination.

## 37. Final Decision Before GW9

UX3 complete.
GW9 paused until the sandbox-theme and guided-comprehension track is addressed or explicitly waived.
Post-UX4B next recommended prompt: UX5.

Do not start GW9 from the current state unless the user explicitly waives the UX5/UX6 track.
