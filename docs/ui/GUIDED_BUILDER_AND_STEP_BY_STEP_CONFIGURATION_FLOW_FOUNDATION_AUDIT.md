# Guided Builder and Step-by-Step Configuration Flow Foundation Audit

Status: UX6B complete in the audited local worktree. Ready to resume GW9 after commit and remote alignment. GW9 has not started.

## 1. Scope

UX6B audits and hardens the UX6 Guided Builder foundation. It covers structural mapping, deterministic assembly, local state, validation, navigation, destructive actions, Advanced handoff, World isolation, accessibility, responsive behavior, capability honesty, and scope boundaries. It does not implement GW9, schema execution, runtime generation, persistence, personalization, Lab/Atlas behavior, or scientific validation.

## 2. Starting commit

The audit started on clean `main` at `bf80137` (`feat: add guided builder configuration flow foundation`), aligned with `origin/main`. The UX6 implementation was committed rather than mixed with an earlier dirty worktree.

## 3. Routes and modes audited

Primary rendered coverage used `/builder`: Guided Builder, Advanced Workspace Inspector, Advanced Author Schema, and Advanced Graph View. `/` was compared before and after Guided workflows for World isolation. The full UI regression suite also covers `/lab` and `/atlas`; UX6B did not change either route.

## 4. Viewports audited

The rendered matrix covered `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`. The matrix exercised all six Guided steps, errors, destructive navigation, Start over, handoff, overwrite protection, and all three Advanced modes.

## 5. Baseline results

Before hardening, focused Playwright passed `41`, full UI Playwright passed `56`, typecheck passed, unit tests passed `69` files and `564` tests, build passed, performance smoke passed, and `git diff --check` passed. `npm run lint: unavailable, package.json has no lint script.`

## 6. UX6 commit/source audit

The UX6 commit changed 30 files and stayed within Workshop Guided authoring, mode selection, local deterministic assembly, validation, navigation, confirmation, Advanced handoff, capability guidance, CSS, tests, and documentation. It added no dependency, route, engine runtime, template runtime, scenario generator, RunConfig generator, storage service, Lab record, Atlas record, sampler, queue, or regime detector.

## 7. Artifact-support matrix findings

| Concept | Guided classification | Audit finding |
| --- | --- | --- |
| Identity, description, limitation | Fully represented | Values map to schema identity/description and one limitation note. |
| Entities and scalar/category state | Fully represented within bounds | Entity and attribute declarations remain structural and non-executable. |
| Zero or one space | Partially represented | Structural space metadata only; network choice does not imply network runtime. |
| Descriptive interactions/rules | Partially represented | Names, references, kind, and description map; text is not parsed or executed. |
| Parameters and one assumption | Fully represented within the Guided subset | They are declarations, not a scenario or active configuration. |
| Components, metrics, exact metadata, artifact/scope references, multiple spaces, boundary/field/network/scale references, provenance | Advanced-only or intentionally omitted | Guided exposes no decorative controls pretending to support them. |
| Template, scenario, RunConfig, engine, snapshot, executable rules | Runtime-only and prohibited | No Guided path creates or mutates them. |

Guided Builder supports a bounded structural subset. Advanced Builder remains the exact structural editing surface. Every assembled declaration keeps `executable: false`; no completeness or fit signal is treated as runtime readiness.

## 8. Guided/Advanced mode findings

Both choices are real tabs with selected tabpanel semantics, arrow keys, Home, End, click access, and no completion gate. Guided is the default. Advanced is one deliberate action away and switching views preserves the mounted Guided draft without implying handoff. UX6B fixed the direct Guided-header switch so focus moves to the visible Advanced tab instead of falling to `BODY`.

## 9. Default-mode findings

Fresh load and reload select Guided and open Model purpose. This is a local presentation default, not a stored beginner identity, recommendation, onboarding stage, achievement, or progression level.

## 10. Local draft-state findings

The draft contains only bounded structural form data, local collection keys, validation presentation, current step, confirmation state, and handoff status. It contains no engine, active World, template installation, scenario, RunConfig, seed, tick, snapshot, run queue, Lab record, Atlas record, account, or analytics-derived state. Collection maxima and input bounds are explicit.

## 11. Non-persistence findings

UX6 adds no Guided Builder persistence.

Guided draft, step, and mode reset on reload.

Existing bounded World comparison and UI storage remain unchanged.

The storage search found only pre-existing World comparison/scenario and UI preference/instrumentation storage plus negative guardrails. Lab and Atlas research persistence remain unimplemented.

## 12. Reload-default findings

Rendered coverage edits the draft, changes view, reloads, accepts the native loss decision, and observes an empty Model-purpose draft in Guided mode with no new storage key. Reload is deliberately destructive because no Guided persistence exists.

## 13. Deterministic identifier findings

Local collection keys are monotonic within the bounded page draft. Structural ids derive from normalized labels, stable source order, and deterministic collision suffixes. The audit found that assumption and limitation ids had incorrectly inherited a model name that may be 180 characters although note ids are capped at 80. They now use fixed semantic bases and pass the authoritative validator at the maximum model-name length. No Guided identifier uses time, randomness, UUIDs, React identity, or hidden inference.

## 14. Deterministic assembly findings

Assembly is pure and ordered from the visible draft plus documented static schema defaults. Repeated equivalent input produces equivalent candidates, service reports, JSON ordering, ids, and handoff artifacts. Renaming deliberately changes semantic structural ids; collisions use deterministic suffixes. No canonical serializer, AI transform, or behavior-derived recommendation is hidden in the path.

## 15. Model-purpose findings

Name and short description are required; limitation is optional but warned when absent. Required/duplicate checks normalize whitespace for comparison and id derivation while the user-entered structural text is preserved rather than silently rewritten. Input prose is never converted into rules or scientific claims. The UI states that purpose text describes intended structure and does not establish scientific validity or real-world accuracy. It offers no profiling, protected-class inference, or persuasion workflow.

## 16. Entity/state findings

Add, rename, remove, typed-default, duplicate, reserved-name, long-name, blank-value, and broken-reference paths are bounded and deterministic. Numeric, integer, and Boolean defaults are checked as descriptions without becoming runtime values. Removing a referenced entity leaves an explicit broken reference and blocks handoff; it is not silently deleted or repaired. Removal confirmations preserve keyboard and focus contracts.

## 17. Environment/space findings

Guided permits zero or one structural space from its documented set. Current space choice deterministically controls emitted `spaceIds`; removing it removes those derived references on the next pure assembly. Network and coordinate wording is structural metadata only. The UI states that runtime support depends on implemented templates and engines.

## 18. Rule/interaction findings

Rules map names, kinds, descriptions, and optional source/target entity references. Descriptions map verbatim to `ruleDescription`; there is no parser, compiler, evaluator, formula engine, code generator, dynamic import, worker, or AI rule generation. Removed references are visible errors. Workshop does not execute authored rules.

## 19. Starting-condition findings

Guided maps parameter declarations and at most one starting-condition assumption note. It does not create a seed, scenario, active parameter configuration, RunConfig, runtime composition, active network, World configuration, or snapshot. Defaults and ranges remain descriptive text checked for bounded representability. Starting-condition structure is not an executable scenario.

## 20. Step-navigation findings

All six steps are directly reachable. Back, Continue, direct selection, and Review preserve values; future steps are not permanently locked. Continue exposes current-step errors, direct Review can show incomplete structure, and successful movement focuses the destination heading. Browser Back and destination links require an explicit decision for meaningful local data. Browser Forward was not treated as a separate persisted workflow.

## 21. Back-navigation retention findings

Rendered coverage confirms exact entity, state-field, and typed-default text survives Continue then Back. Canceling destination navigation and client-side browser Back keeps the local draft and returns focus logically. No route guard writes the draft to history or storage.

## 22. Validation-authority findings

Guided field checks address required input, duplicates, typed-default syntax, bounds, and reference usability. The Zod-backed model-schema service remains authoritative for structural validity and handoff. There is no second schema interpreter, hidden repair, coercion, error suppression, or silent deletion. Repair suggestions remain in Advanced and require their existing explicit actions.

## 23. Error/warning findings

Errors block invalid handoff; warnings disclose omitted limitations/assumptions, missing rules, structural network semantics, and runtime gaps without masquerading as execution readiness. Error summaries identify fields and move focus. Unsupported and Advanced-only gaps remain distinct from field errors and warnings.

## 24. Review findings

Review reflects the current identity, limitation, entities, fields, space, rules, parameters, assumption, errors, warnings, gaps, and exact candidate JSON. It exposes a non-runnable service report and the visible boundary `Structural validity does not mean runtime support or real-world validity.` No Ready-to-run, scientifically valid, production-ready, or similar claim exists.

## 25. Start-over findings

Start over is disabled when the draft is empty. Meaningful data opens a named modal describing local unsaved loss. Tab cycling and Escape are bounded to the dialog; Cancel preserves draft and step and returns focus; Confirm resets only Guided state and focuses Model purpose. Advanced and World remain unchanged, and no stale dialog state survives repeated use.

## 26. Advanced-handoff findings

`Open draft in Advanced Builder` is the only transfer action. It requires a click, revalidates through the headless schema service, transfers the exact supported artifact once, opens Advanced Author Schema, labels the result local/unsaved/non-runnable, and creates no export, save, template, scenario, RunConfig, engine, or World mutation. Invalid handoff is unit-tested to return no artifact and preserve errors; the rendered action is disabled until valid.

## 27. Overwrite-protection findings

An empty Advanced draft accepts the explicit handoff directly. Any meaningful Advanced draft triggers a modal naming both drafts and stating that only Advanced Author Schema will be replaced. Cancel preserves both; Confirm replaces only that draft and clears analyses that would otherwise be stale. Source inspection shows the same nonempty-draft predicate covers minimally edited, imported, equal-content, different-content, and repeated requests; rendered coverage explicitly exercises empty, different/repeated, Cancel, and Confirm. UX6B fixed canceled handoffs so a later Advanced visit says the handoff was canceled instead of falsely claiming one remains staged.

## 28. Advanced Builder preservation findings

Workspace Inspector, Author Schema, Graph View, JSON import/export, validation, repair suggestions, fit reports, scenario planning, exact metadata, and the graph outline remain directly reachable without Guided completion. UX6 changed no import/export or graph execution semantics. UX6B removed nested scenario-list scroll regions in favor of the intentional parent scroll, gave repeated fit-report landmarks unique names, and made the Graph controls/outline scroll region keyboard-focusable.

## 29. World-isolation findings

Guided Builder and Advanced handoff do not mutate World.

Rendered comparison preserves active template, scenario context, seed, tick, run status, runtime/snapshot presentation, experiment configuration, comparison storage, and all observed storage entries across authoring, handoff, navigation cancellation, and return. No Guided action runs a simulation.

## 30. No-execution findings

The execution search found pre-existing template/runtime intervention execution, regular-expression `.exec` calls, and explicit non-execution guardrails. Guided hits are boundary copy and negative tests only. Guided does not execute rules, formulas, graphs, code, templates, scenarios, RunConfigs, World changes, Lab publication, or Atlas publication. No unexpected execution path was found.

## 31. Capability-guidance findings

Workshop guidance accurately distinguishes available Guided/Advanced structural authoring and import/export, structural/planning-only declarations and reports, unavailable runtime generation/execution/World mutation/scientific validation, and do-not-assume boundaries. It does not rank choices, infer intent, personalize content, award completion, or recommend scientific claims.

## 32. Accessibility findings

The route retains one H1 and one shared main. Forms use labels, descriptions, fieldsets, legends, `aria-invalid`, linked errors, error summaries, semantic tabs/panels, named confirmation dialogs, and visible textual status. No nested form, duplicate id, hidden focused panel, icon-only meaning, or uncontrolled modal focus escape remained in the audited states. This is automated and expert evidence, not screen-reader, assistive-technology, forced-colors, or WCAG certification.

## 33. Keyboard/focus findings

Rendered tests cover validation failure, issue jumps, successful Continue/Back/direct steps, arrow/Home/End mode switching, direct Advanced access, canceled and confirmed Start over, successful handoff, canceled overwrite, and confirmed overwrite. UX6B fixed direct Advanced access losing focus to `BODY`. Focus now lands on a visible selected tab, and canceled overwrite returns to the Guided handoff control.

## 34. Responsive findings

All required states passed at all five required viewports with no document-level horizontal overflow, unreachable actions, fixed-height form clipping, clipped focus, or dialog viewport escape. UX6B found a real `1024x768`/narrow Workshop grid defect where capability guidance overlaid and intercepted the Guided step rail. Responsive shell rows now size to content so guidance follows the authoring surface in the single shell scroll flow.

## 35. Short-height findings

At `1280x600`, Guided steps, errors, Review, dialogs, mode tabs, Advanced Workspace Inspector, Advanced Author Schema, Graph View, and the Advanced import textarea remain reachable. The final focused gate also found that the Workspace Inspector import textarea could be partially below the viewport at `1024x768` after the responsive-flow fix; the existing bounded short-height textarea sizing now applies across the responsive Workshop breakpoint. Focused controls remain fully visible and are not covered by footer actions or capability guidance.

## 36. Browser zoom status

Headless Chromium received keyboard zoom commands aimed at 125%, 150%, and 200% on `/builder`. `devicePixelRatio`, `innerWidth`, `clientWidth`, `scrollWidth`, `visualViewport.scale`, and `visualViewport.width` remained unchanged, so the environment produced no trustworthy actual-zoom evidence. Viewport resizing was not substituted for browser zoom.

Actual browser zoom at 125%, 150%, and 200% was not verified.

## 37. Reduced-motion findings

The existing reduced-motion rendered path remains usable. Step and mode changes rely on state and focus rather than animation timing; dialogs remain operable; no continuous animation, completion celebration, or motion-only status was added.

## 38. Axe findings

Axe scans cover Guided default, every step, validation errors, Review, leave and Start-over dialogs, successful handoff, Advanced Author Schema, Workspace Inspector, Graph View, and overwrite dialog. UX6B exposed and fixed duplicate fit-report landmark names, nested non-focusable scenario-list scrolling, and a non-focusable Graph sidebar scroll region. The post-fix sweep reports zero unexpected violations in those states.

## 39. Console/page/asset/hydration findings

The rendered matrix and accessibility sweep observed no console errors, page errors, hydration mismatches, failed critical requests, failing critical responses, or missing critical assets. The `NO_COLOR` warning comes from the test server environment and is not a page diagnostic.

## 40. No-fake-functionality findings

No Guided action says or performs Run model, Run in World, Preview simulation, Compile model, Generate runtime template, Generate scenario, Generate RunConfig, Publish to Lab/Atlas, scientific validation, automatic calibration, AI rule generation, or recommendation. The allowed handoff remains structural only, and Review remains visibly non-runnable.

## 41. Scope-creep search findings

The broad search was classified as pre-existing implemented behavior, expected guardrail/future language, UX6 local navigation wording, or negative tests. No unexpected UX6 persistence, autosave, database, personalization, recommendation, onboarding progression, score, random identity, command-center framing, deployment, landscape sampling, probe execution, saved sample, regime detection, Lab/Atlas publication, or GW9 behavior was found.

## 42. Defects found

Eight bounded defects were demonstrated: note ids could exceed their authoritative bound; direct Advanced access lost focus; canceled overwrite left stale staged copy; responsive guidance could cover the Guided step rail; the responsive Advanced import textarea could remain partly below the viewport; repeated fit groups shared landmark names; scenario-plan lists created inaccessible nested scroll regions; and the Graph controls/outline scroll region was not keyboard-focusable.

## 43. Defects fixed

All eight defects were fixed without changing artifact meaning, import/export behavior, runtime/template behavior, route structure, storage, dependencies, or product scope. Each fix is covered by a pure-model or rendered regression, with Axe serving as the semantic regression for the three Advanced accessibility findings.

## 44. Production files changed

Production hardening is limited to `guidedBuilderModel.ts`, `BuilderShell.tsx`, `ModelSchemaAuthoringShell.tsx`, `SchemaTemplateFitReportPanel.tsx`, `BuilderGraphView.tsx`, and bounded rules in `globals.css`. No simulation engine, template, registry, store, route, package, dependency, or persistence file changed.

## 45. Test files changed

`guidedBuilderModel.test.ts` adds the maximum-name/note-id regression. `research-world-shell.spec.ts` adds direct-switch focus and canceled-status assertions plus all-state viewport and Axe/diagnostic matrices. Focused Playwright therefore increases from `41` to `43`; full UI increases from `56` to `58`.

## 46. Documentation files changed

UX6B adds this audit and updates the UX6 foundation, README, planned/canonical roadmaps, concepts, Research World progression, prior UX handoffs, HCI/workspace architecture, Codex context/session records, roadmap contracts, and durable AGENTS guardrails. Product philosophy is unchanged because the mission and epistemic boundaries did not change.

## 47. Verification commands

The audit ran the required UX6 commit diffs, nondeterminism/storage/execution/scope searches, focused model tests, targeted interaction regressions, the five-viewport rendered matrix, representative-state Axe/diagnostics, reduced motion, `npx playwright test tests/ui/research-world-shell.spec.ts`, `npm run test:ui`, `npm run typecheck`, `npm test`, `npm run build`, `npm run perf:simulation`, `npm run lint`, and `git diff --check`.

Final gates after documentation contracts: focused Playwright `43 passed`; full UI Playwright `58 passed`; unit tests `69` files and `565` tests; typecheck, build, performance smoke, and diff check pass.

`npm run lint: unavailable, package.json has no lint script.`

## 48. Remaining limitations

Guided still authors only a small schema subset and cannot establish correct model behavior. It does not author initial entity counts/composition, multiple spaces, exact metadata, components, metrics, observability, provenance, or runtime semantics. No observed beginner study, mobile-workflow validation, screen-reader walkthrough, assistive-technology audit, forced-colors audit, actual browser-zoom verification, or WCAG conformance assessment was performed. Imported/equal-content overwrite variants were source-audited rather than each receiving a separate rendered case.

## 49. GW9 readiness decision

Decision: Ready to resume GW9 after commit and remote alignment. The audited structural mapping, determinism, validation authority, loss protection, explicit handoff, Advanced preservation, World isolation, non-execution, non-persistence, accessibility automation, responsive behavior, and final gates have no blocking defect. Unverified user, AT, forced-colors, mobile-workflow, and actual-zoom evidence remains nonblocking only because it is stated accurately and no readiness claim is made for it.

## 50. GW9 pause/publication boundary

GW9 remains paused until UX6B is committed and remotely aligned. This audit does not implement or authorize landscape sampling, probe execution, saved plans, sampled regions, run queues, regime detection, Lab records, Atlas discoveries, runtime changes, or scientific-validation claims. Publication alignment is repository hygiene, not product capability.

## 51. Final decision

UX6B complete.

GW9 is next.

GW9 remains paused until UX6B is committed and remotely aligned.
