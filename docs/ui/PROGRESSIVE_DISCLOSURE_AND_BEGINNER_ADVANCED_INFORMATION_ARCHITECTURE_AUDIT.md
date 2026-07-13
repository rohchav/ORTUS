# UX5B: Progressive Disclosure and Beginner/Advanced Information Architecture Audit

## 1. Scope

UX5B audits the committed UX5 information architecture in source and rendered browsers. It tests whether route entry is easier to understand without hiding technical detail, weakening capability boundaries, or slowing expert access. UX5B does not implement UX6, Guided Builder, GW9, persistence, personalization, progression, runtime behavior, template behavior, Builder execution, Lab records, Atlas discoveries, sampling, or probe execution.

This is an expert review plus automated browser evidence. It is not a user-comprehension study.

## 2. Starting commit

Starting commit: `7938e67 feat: add progressive disclosure information architecture`.

The audit started on `main` with `HEAD` and `origin/main` both at `7938e67` and a clean worktree.

## 3. Routes audited

- `/` as World.
- `/builder` as Workshop and the Advanced Builder.
- `/lab` as the non-persistent Lab foundation.
- `/atlas` as the non-persistent Atlas foundation.

No route alias or new route was added.

## 4. Viewports audited

Rendered checks covered every route at `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`, for 20 route/viewport combinations. Representative default and expanded screenshots were also inspected directly.

## 5. Baseline results

Before UX5B edits:

- Focused shell Playwright: `34 passed`.
- Full UI Playwright: `49 passed`.
- Typecheck: passed.
- Unit tests: `68` files and `548` tests passed.
- Production build: passed.
- Simulation performance smoke: passed.
- `git diff --check`: passed.
- `npm run lint: unavailable, package.json has no lint script.`

The sandboxed Playwright server failed before tests. A direct sandboxed server attempt confirmed `listen EPERM` on `127.0.0.1:3000`; the required browser checks then passed through the allowed local-server permission path. This is an environment restriction, not an ORTUS failure.

## 6. UX5 commit/source audit

The UX5 commit remained inside information architecture, route orientation, progressive disclosure, two-tier language, component-local state, accessibility/layout corrections, rendered tests, and documentation. Production changes were limited to route UI, shared UI components, route-orientation data, and CSS.

No simulation, template, registry, engine, store, persistence, dependency, asset, font, icon, or route file changed. The commit added no storage key, personalization, recommendation, onboarding, progression, runtime behavior, Builder execution, Guided Builder, Lab record, Atlas discovery, landscape sampling, probe execution, or regime detection.

## 7. Shared disclosure architecture findings

Classification: `Clear` in the covered routes.

The rendered sequence is coherent: orientation first, current work next, an immediate visible caveat, and explicit expandable technical detail. Route purpose precedes implementation history. Critical valid-vs-runnable, model-vs-world, and non-persistence limits remain visible when disclosures are closed. Expanded content is grouped, readable, and one deliberate control away; closing a disclosure retains focus on its trigger.

Progressive disclosure reduces first-read density, but it does not solve every density problem. Workshop remains deliberately advanced, and expanded Lab/Atlas content remains documentation-heavy because those routes are conceptual foundations rather than working research systems.

## 8. Beginner-entry findings

- World: `Strong first-read orientation`. The active modeled system, selected workspace, model surface, and run controls remain primary.
- Workshop: `Adequate first-read orientation`. Purpose, structural-only status, first action, and runtime boundary are clear, but the surface remains technically dense by design.
- Lab: `Adequate first-read orientation`. The future evidence-record purpose and current non-persistent status are clear; the route still has no working Lab task beyond inspecting conceptual material.
- Atlas: `Adequate first-read orientation`. Model-space purpose, sampled/unsampled boundary, and non-executable probe meaning are clear; the route still has no working Atlas investigation.

These are expert judgments, not observed beginner usability results.

## 9. Two-tier language findings

Plain-language terms accurately map to technical terms for active runs, scenarios, deterministic seeds, snapshots, model schemas, visual-builder workspaces, fit summaries, scenario plans, behavioral landscapes, and probe plans. Plain language does not imply execution or persistence. Technical terms remain available. `valid`, `supported`, `available`, and `runnable` remain distinct, as do `sampled`, `observed`, `validated`, and `real-world`.

`Saved` is used only for real existing World-local state or explicit statements that Lab/Atlas artifacts are not saved. Existing World-local storage is not presented as Lab or Atlas persistence.

## 10. World findings

World still leads with the active modeled system, simulation surface, current model/scenario/workspace state, and persistent run controls. Setup, Understand, Observe, Intervene, Experiment, Compare, and Debug remain direct. Template selection, scenario setup, seed, parameters, snapshots, metrics, import/export, comparison summaries, and existing Experiment Runner sweeps remain reachable through their existing modes.

Orientation stays inside the existing workspace rail and does not cover the World Stage or run dock. It does not change simulation behavior, scroll ownership, provenance, or the model-vs-world boundary.

Existing Experiment Runner sweeps remain local experiment functionality. They are not Atlas landscape sampling or probe execution.

## 11. Workshop findings

Workshop clearly states that it describes and inspects structure, that valid structure is not automatically runnable, and that no compiler, schema execution, scenario generation, template generation, or RunConfig generation exists. Graph View remains inspection rather than visual programming; fit reports remain structural summaries; scenario plans remain questions rather than generated scenarios.

Workspace Inspector, Author Schema, Graph View, JSON import/export, validation, repair suggestions, fit reports, scenario planning, exact metadata, and the accessible graph outline remain directly reachable. The UX5 ordering fix keeps the active expert workspace before capability guidance. Focused controls passed visibility checks at `1280x720` and `1280x600`; expanded disclosure did not cover expert controls.

## 12. Lab findings

Lab clearly presents a future evidence-record purpose, current conceptual foundation, model-only evidence boundaries, and non-persistence. The required visible boundary remains:

`Nothing on this route is a saved experiment, evidence record, notebook, or run history.`

The concise default is easier to scan, while the complete lifecycle and ledger vocabulary remains available. Conceptual examples do not look like stored records. The route contains no fake record controls, timestamps, generated ids, editable notes, activity feed, save, publish, or transfer action.

## 13. Atlas findings

Atlas clearly presents model-space orientation, current conceptual status, sampled-versus-unsampled meaning, behavioral-landscape vocabulary, non-executable probe planning, and the model-vs-real-world boundary. The required visible boundary remains:

`No sampled landscape, saved map, probe execution, regime detection, or discovery record exists here yet.`

The full landscape and probe vocabulary remains reachable. The route contains no fake heatmap, contour, sampled-region visualization, confidence score, coverage score, probe execution, queue, regime detection, or discovery record.

## 14. Capability-guidance findings

The default layer exposes the route boundary, `Available here`, and a nearby `Do not assume` item. One explicit disclosure exposes the remaining available items plus `Planning-only`, `Not implemented`, additional `Do not assume`, and `Related destination` content. Status pills retain their operational/evidence/capability semantics.

Capability guidance describes capability. It does not create capability or infer user needs. No recommendation, behavior-derived ordering, task score, completion state, or mission framing exists.

## 15. Advanced-user preservation findings

No expert tool requires an introductory sequence, completion marker, or beginner gate. No expert tool was removed or permanently hidden. World tools remain one existing workspace mode away, and route technical detail is at most one explicit disclosure away. Workshop advanced modes and file/status actions remain available immediately, with no forced overview completion.

## 16. Disclosure-state findings

`Disclosure.tsx` uses component-local `useState(false)`. Each control is a native text button with a route-local id relationship. Opening one disclosure does not mutate simulation state, Builder artifacts, route data, capability data, or another disclosure.

## 17. Non-persistence findings

UX5 adds no new persistence. Existing bounded World comparison and UI storage remain unchanged. Lab and Atlas research persistence remain unimplemented.

The repository-wide storage search found only pre-existing bounded World run-summary storage, scenario/panel/avatar UI storage, tests, and guardrail language. No UX5 production file introduces a storage path or key.

## 18. Reload-default findings

Rendered route tests open disclosures, reload, and confirm that each returns to its documented collapsed default. Navigation and remount behavior do not restore prior disclosure state. Reload does not alter existing World comparison or UI storage.

## 19. Accessibility findings

Disclosure controls use native buttons with visible text, accurate `aria-expanded`, and valid `aria-controls` targets. Collapsed content is hidden and cannot retain an invisible focus target. Headings remain ordered, each route has one H1, the shared skip link remains present, and static conceptual scaffolds gain no unnecessary Tab stops.

This evidence does not establish screen-reader support, assistive-technology support, forced-colors readiness, or WCAG conformance.

## 20. Keyboard/focus findings

Enter and Space open and close disclosure controls. Focus remains on the trigger after closing. Focus rings were visible in the covered browser checks, no focus trap appeared, and expanded content remained reachable. Workshop expert focus targets were not clipped or obscured at the two short-height regression sizes.

## 21. Landmark findings

Every route renders one shared `main` landmark and one route H1. Lab and Atlas do not reintroduce the duplicate named landmark defect fixed during UX5. Expanded-state Axe scans reported no duplicate landmark or duplicate-id violation.

## 22. Responsive findings

All 20 route/viewport combinations passed with no document-level horizontal overflow. Orientation and disclosure labels wrapped cleanly. Expanded details remained reachable and did not overlap fixed controls. World remained model-surface dominant, Workshop retained expert-control access, and Lab/Atlas remained readable conceptual routes rather than fake operational dashboards.

This is established viewport coverage, not mobile-first workflow validation.

## 23. Short-height findings

World's run dock remained visible outside the workspace scroll region. Workshop at `1280x720` and `1280x600` preserved its expert workspace and focused controls. Lab and Atlas kept content in route scroll without fixed-height clipping. Direct screenshot inspection found no hidden content under the shared header or fixed controls at the default scroll position.

## 24. Browser zoom status

Keyboard zoom commands were attempted in headless Chromium. Metrics remained unchanged at the nominal 125%, 150%, and 200% steps, so the attempt does not count as browser-zoom evidence.

Actual browser zoom at 125%, 150%, and 200% was not verified.

## 25. Reduced-motion findings

Disclosure does not depend on animation and adds no continuous motion. Existing reduced-motion coverage passed on all four routes. Focus and content meaning remained stable with reduced motion enabled.

## 26. Axe findings

The committed default-state Axe coverage passed. UX5B also expanded every disclosure and ran Axe on all 20 route/viewport combinations; all scans reported zero violations. Axe is automated rule coverage, not proof of complete accessibility or usability.

## 27. Console/page/asset/hydration findings

The focused and full suites passed their diagnostic contracts. The additional 20-combination expanded-state audit reported no console errors, page errors, critical failed responses, failed critical requests, missing critical assets, or hydration mismatch messages. The initial direct audit script used the wrong Axe browser-page API and was corrected to explicit browser contexts; that harness error was not an application diagnostic.

## 28. No-fake-functionality findings

UX5 presentation does not imply new runtime or research behavior. World does not claim Lab publication, Atlas sampling, research persistence, or real-world validation. Workshop does not claim runnable authored schemas, graph execution, conversion, compilation, generation, or active-run mutation. Lab and Atlas do not present records, maps, scores, samples, execution, queues, regimes, or discoveries. Disclosure has no tutorial completion, certification, personalization, unlock, or mission state.

## 29. Scope-creep search findings

Broad search hits classified as:

- Pre-existing implemented behavior: bounded World storage, existing UI preferences, and existing local Experiment Runner sweeps.
- Expected guardrail language: prohibitions and runtime-honesty contracts in docs, tests, and AGENTS.
- Expected future/non-implementation language: Lab, Atlas, UX6, and GW9 planning boundaries.
- UX5 disclosure copy: explicit statements that records, plans, maps, sampling, execution, and persistence do not exist.
- Unexpected scope drift: none.

No valid implemented behavior or guardrail was deleted to make the search quieter.

## 30. Defects found

No UX5 production defect was found in the audited source or rendered paths. The known unverified areas remain verification gaps, not evidence of correctness and not invented defects.

The direct audit harness initially created pages through an Axe-incompatible convenience API. That was an audit-script error, corrected before evidence was recorded; it was not an ORTUS defect.

## 31. Defects fixed

No production defect was fixed because no bounded production defect was demonstrated. UX5B updates audit records and roadmap contracts only. This avoids turning an audit into an unjustified redesign.

## 32. Production files changed

None. UX5B changes no UI, CSS, route, simulation, runtime, template, store, persistence, dependency, or asset file.

## 33. Test files changed

`src/simulation/__tests__/roadmap.test.ts` is updated only to require the UX5B audit record and durable completion/readiness boundaries. No rendered assertion was weakened and no UI test was changed.

## 34. Documentation files changed

UX5B adds this audit and updates concise status/handoff references in README, planned and canonical roadmaps, concepts, Research World progression, prior UX handoff records, UX5, HCI/workspace IA, current context, session log, and AGENTS. Product philosophy is unchanged because the product mission did not change.

## 35. Verification commands

The audit ran:

```text
npx playwright test tests/ui/research-world-shell.spec.ts
npm run test:ui
npm run typecheck
npm test
npm run build
npm run perf:simulation
git diff --check
npm run lint
```

It also ran direct expanded-state Axe, diagnostics, screenshot, geometry, reduced-motion, and keyboard-zoom probes against all four routes and the established viewport set. Final focused and full rendered suites remain `34 passed` and `49 passed`; final non-UI gates pass.

`npm run lint: unavailable, package.json has no lint script.`

## 36. Remaining limitations

No observed beginner session or user-comprehension study was performed. No screen-reader, assistive-technology, or forced-colors verification was performed. Actual browser zoom at 125%, 150%, and 200% was not verified. Mobile workflow readiness and full WCAG conformance remain unverified. Axe and Playwright cannot establish comprehension or scientific validity.

Lab and Atlas remain static, non-persistent conceptual foundations. Workshop remains an advanced technical surface. Model output remains evidence about model behavior, not empirical truth.

## 37. UX6 readiness decision

Ready for UX6.

All blocking UX5B gates pass in the covered paths: coherent orientation, visible caveats, reachable technical detail, preserved expert tools, accessible local disclosure semantics, reload defaults, no new storage key, correct landmarks, responsive/short-height coverage, passing rendered tests and Axe, no fake functionality, and no runtime, persistence, personalization, UX6, or GW9 leakage.

## 38. GW9 pause decision

GW9 remains paused.

UX5B does not implement ephemeral landscape sampling, probe execution, saved plans, sampled regions, regimes, discoveries, or any other GW9 behavior. GW9 remains behind UX6 and UX6B unless the sequence is explicitly waived.

## 39. UX6 acceptance notes

UX6 may add a step-by-step Guided Builder flow only through its dedicated prompt. It must preserve the current Advanced Builder, use existing bounded schema-authoring and validation services, keep structural artifacts non-executable, and avoid compilation, runtime preview, schema/graph execution, template/scenario/RunConfig generation, active World mutation, persistence, profiling, recommendations, completion scoring, or onboarding state. A guided flow must not claim that a valid schema is runnable or scientifically validated.

## 40. Final decision

UX5B complete.

UX6 is next.

GW9 remains paused.
