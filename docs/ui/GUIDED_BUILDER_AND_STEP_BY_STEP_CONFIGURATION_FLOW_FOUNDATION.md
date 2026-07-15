# Guided Builder And Step-By-Step Configuration Flow Foundation

## 1. Scope

Prompt UX6 adds a bounded, non-executing Guided Builder inside `/builder`. It creates a structural `ortus.modelSchema` draft, validates that draft with the existing model-schema services, reviews the exact candidate artifact, and transfers it to Advanced Author Schema only after an explicit action. UX6 does not implement UX6B or GW9.

## 2. Starting commit

UX6 started from clean, aligned `main` at `c6233ec test: audit progressive disclosure information architecture`; local `HEAD` and `origin/main` matched.

## 3. UX3 through UX5B dependencies

UX3 supplied the blunt comprehension audit, UX4/UX4B supplied the sandbox/workbench visual language, and UX5/UX5B supplied route orientation, capability layering, non-persistent disclosure, and verified expert reachability. UX6 uses those foundations without changing their runtime or evidence semantics.

## 4. Guided Builder purpose

Guided Builder helps a modeler prepare a small, inspectable model-structure draft. The draft is not a model implementation, scientific result, prediction, personal profile, or executable configuration.

## 5. Advanced Builder coexistence

Guided Builder and Advanced Builder are real sibling views in Workshop. Advanced remains one tab action away, remains mounted while Guided is open, and retains Workspace Inspector, Author Schema, Graph View, import/export, validation assistance, repair suggestions, fit reports, scenario planning, exact metadata, and the accessible graph outline.

## 6. Supported-artifact audit

The source artifact supports identity/version fields; scope; entity, component, attribute, space, parameter, metric, rule, and artifact-reference declarations; assumption, limitation, and validation notes; and inert JSON metadata. Every declaration is structural and `executable: false`. Guided exposes only identity, entities, attributes, at most one space, descriptive rules, parameters, one assumption note, and one limitation note. It does not invent intended-use, provenance, initial-population, boundary, observable, scheduler, or runtime fields.

## 7. UX6 support matrix

| Field or concept | Artifact | Existing validator | Advanced | Guided UX6 | Classification |
| --- | --- | --- | --- | --- | --- |
| Model identity and description | Yes | Yes | Exact | Name and description | Guided |
| Version/schema version | Yes | Yes | Exact | Static `1.0.0` / `1` | Documented default |
| Entity types | Yes | Yes | Exact | Bounded names, kinds, descriptions | Guided subset |
| State attributes | Yes | Yes | Exact | Bounded scalar/category kinds and typed default descriptions | Guided subset |
| Components | Yes | Yes | Exact | No | Advanced-only |
| Space | Yes | Yes | Exact | Zero or one selected supported kind | Guided subset |
| Boundary/field/network/scale references | Yes on space/scope | Yes | Exact | No runtime references | Advanced-only |
| Rule declarations | Yes | Yes | Exact | Name, kind, description, source/target entity references | Guided subset, non-executable |
| Parameters | Yes | Yes | Exact | Bounded scalar/category kinds and descriptive defaults/ranges | Guided subset |
| Metrics/observables | Metric declarations only | Yes | Exact | No | Advanced-only |
| Assumptions and limitations | Yes | Yes | Exact | One of each | Guided subset |
| Validation notes, artifact references, scope, metadata | Yes | Yes | Exact | No | Advanced-only |
| Initial entity counts, composition, update order, stochasticity, provenance | No exact Guided mapping | N/A | No invented mapping | No | Unsupported in Guided |
| Runtime template, scenario, RunConfig, engine, snapshot | Separate runtime artifacts | Separate services | Not generated | Not generated | Unsupported |

Guided Builder supports a bounded subset of the structural artifact. Advanced Builder remains available for complete and exact editing.

## 8. Guided flow structure

The six steps are Model purpose, Entities and state, Environment and space, Rules and interactions, Starting conditions, and Review. Direct step buttons remain available; future steps are not locked.

## 9. Mode-selection behavior

An accessible tablist switches actual Guided and Advanced tabpanels. Arrow keys plus Home and End move between the two tabs. Switching views preserves both mounted drafts and does not touch World.

## 10. Default-mode decision

Guided Builder is the default on each fresh `/builder` page load. Advanced is immediately available and no tutorial or completion gate precedes it. The selected view is not stored.

## 11. Local draft-state model

The typed React-local draft contains supported field values and deterministic local keys. Separate local state tracks the current step, attempted steps, touched fields, validation-summary visibility, confirmations, and status text. It contains no engine, template, scenario, RunConfig, snapshot, queue, research record, profile, or account state.

## 12. Non-persistence boundary

The Guided Builder draft exists only in the current page session. Reloading resets the draft, current step, and selected authoring view. UX6 adds no localStorage, sessionStorage, IndexedDB, cookie, persistence middleware, database, saved draft, or autosave behavior.

## 13. Deterministic artifact assembly

Assembly is a pure mapping from visible draft fields plus static `artifactType`, version, schema version, `active: true`, and `executable: false` defaults. Declaration order follows visible draft order. The same logical input produces equivalent JSON and handoff content. No AI, timestamps, behavioral recommendations, hidden inference, or randomness participates.

## 14. Deterministic identifier policy

IDs derive from normalized user labels and stable declaration prefixes. Duplicate normalized bases receive stable ordering suffixes. Blank invalid labels use an `untitled` placeholder only in the review candidate and cannot pass handoff validation. UX6 uses neither `Math.random`, `Date.now`, UUIDs, nor cryptographic random identifiers.

## 15. Model-purpose step

The step maps model name and description directly to schema identity and one optional limitation to `limitationNotes`. Copy states that descriptive text establishes neither scientific validity nor real-world accuracy and is not parsed into behavior, protected classes, profiles, or persuasion targets.

## 16. Entities-and-state step

The step supports up to 12 entity types and 12 state fields per entity. It validates required, duplicate, reserved, length, and typed-default cases. Removal is confirmation-protected, and references to a removed entity remain visible as errors instead of being silently deleted.

## 17. Environment-and-space step

The step supports no explicit space, abstract space, grid2d, continuous2d, or network space plus a structural coordinate description. A network selection is explicitly structural and does not claim network runtime, causal edges, or template support. Boundaries, fields, multiscale references, resources, and exact scope references remain Advanced-only.

## 18. Rules-and-interactions step

The step supports up to 16 named rule declarations with a schema-supported kind, literal description, and optional source/target entity references. `ruleDescription` is copied as text and is not parsed, compiled, evaluated, synthesized, or executed. No formula, script, code, scheduler, or hidden interpreter exists.

## 19. Starting-conditions step

The step supports up to 16 parameter declarations and one assumption note. Defaults and ranges are descriptive schema fields, not active World configuration. It creates no entity population, seed, executable scenario, RunConfig, composition, template, or snapshot.

## 20. Review step

Review shows entered identity, entities/state, space, rules, parameters, assumption, limitation, deterministic id, warnings, structural errors, Advanced-only gaps, and the exact assembled JSON artifact. It says `Runnable now: no` and repeats: Structural validity does not mean runtime support or real-world validity.

## 21. Structural-validation behavior

Guided field/step checks protect the bounded form contract. Final readiness additionally uses `createModelSchemaDraftView` and `validateModelSchemaDefinition`; those existing services remain authoritative. Handoff is enabled only when the bounded checks and existing schema validation both accept the candidate.

## 22. Error and warning behavior

Errors block step continuation or handoff when the artifact cannot be represented validly. Warnings remain distinct for omitted limitations, omitted starting-condition assumptions, no rules, and structural network semantics. No repair is auto-applied, no value is silently coerced, and no referenced content is silently removed.

## 23. Step-navigation behavior

The current step is exposed as `Step n of 6` and `aria-current="step"`. Back, Continue, Review, direct step buttons, Start over, and direct Advanced access are always bounded local controls. A successful change focuses the new step heading; a blocked change focuses the error summary.

## 24. Start-over behavior

Start over is disabled for the untouched default draft. Meaningful data triggers an accessible alert dialog stating that the draft is local and unsaved. Cancel preserves data and returns focus; confirmation resets only Guided state. Advanced and World remain unchanged.

## 25. Advanced Builder handoff

`Open draft in Advanced Builder` is available only from a structurally valid review. The action validates the exact candidate, switches to Advanced Author Schema, preserves supported values, labels the result local/unsaved/non-runnable, and does not run or install anything.

## 26. Workspace-overwrite protection

An empty Advanced Author Schema accepts the explicit handoff directly. A meaningful Advanced draft triggers an alert dialog naming both affected drafts. Cancel preserves both and returns to Guided; confirmation replaces only the Advanced Author Schema draft. Existing fit/scenario views are cleared so stale analyses cannot masquerade as applying to the replacement.

## 27. Advanced-user preservation

Advanced remains independently usable before any Guided work. Its three internal modes, complete schema forms, file exchange, validation assistance, graph inspection, fit reporting, and scenario planning retain their existing semantics. The UX6 semantic smoke suite now enters Advanced explicitly before testing Advanced-only badges.

## 28. Capability-guidance updates

Workshop guidance now distinguishes available Guided/Advanced structural authoring and explicit handoff; planning-only rule, parameter, scenario-question, and compatibility structure; unavailable execution/generation/World mutation/scientific validation; and the do-not-assume boundaries for runnability and correctness.

## 29. Runtime-isolation boundary

Guided files import only model-schema and presentation services. They do not import the simulation store, engine, template registry, scenario services, RunConfig services, snapshots, command buffers, Lab, or Atlas state. Branding and Builder-local state remain outside simulation runtime state.

## 30. World-isolation verification

Rendered tests capture active World context and storage before Guided editing and explicit Advanced handoff, then confirm the same template, scenario, seed, tick, status, comparison storage, experiment state, and storage entries afterward. No Guided action navigates to or imports into World.

## 31. No-execution boundary

No Guided path executes a rule, compiles a schema/graph, runs a simulation, creates an engine, generates a template/scenario/RunConfig, or applies to World. Source searches found only pre-existing runtime behavior and explicit prohibited-language guardrails outside the Guided implementation.

## 32. Accessibility considerations

The route retains one H1 and one shared main. Guided uses a real form, labeled controls, fieldsets and legends, connected descriptions/errors, `aria-invalid`, semantic step status, error summaries, status announcements, keyboard-operable tabs and controls, and text labels for destructive actions. This is rendered smoke evidence, not screen-reader certification or WCAG conformance.

## 33. Keyboard and focus behavior

Mode tabs support roving focus. Validation failure focuses the summary; issue links focus exact fields; successful navigation focuses headings. Guided and handoff confirmations support Escape, bounded Tab cycling, Cancel, and focus return. The rendered suite covers these paths but does not constitute an assistive-technology walkthrough.

## 34. Responsive behavior

Rendered checks pass at `1440x900`, `1280x720`, `1024x768`, `900x700`, and `1280x600`. The step list stacks before the form at narrower widths, action groups wrap, review JSON remains bounded, and no tested route creates document-level horizontal overflow. This is not mobile-workflow validation.

## 35. Short-height behavior

The `1280x600` gate found the existing Advanced workspace-import textarea could remain focused partly below the viewport after Guided switched to Advanced. UX6 bounds that textarea to 96px in short layouts; the exact failure and the full matrix pass after the correction.

## 36. Browser zoom status

Headless Chromium received keyboard zoom commands targeting 125%, 150%, and 200% on `/builder`. `devicePixelRatio`, `innerWidth`, document width, and `visualViewport.scale` remained unchanged, so the environment did not provide trustworthy browser-zoom evidence. Viewport resizing was not substituted for zoom.

Actual browser zoom at 125%, 150%, and 200% was not verified.

## 37. Reduced-motion behavior

The Guided review and both Builder views remain operable under `prefers-reduced-motion: reduce`. UX6 adds no required animation or motion-dependent meaning.

## 38. Axe results

The Guided review Axe scan and route-level Workshop Axe scan report zero violations in the covered UX6 states. UX6B expands this to every Guided step, validation errors, Review, leave/Start-over/overwrite dialogs, successful handoff, and all Advanced modes. It found and fixed repeated fit-report landmark names, nested non-focusable scenario-plan scrolling, and a non-focusable Graph sidebar scroll region. Axe cannot establish user comprehension, assistive-technology quality, or WCAG conformance.

## 39. Console/page/asset/hydration results

The complete semantic suite observed no console errors, page errors, failed critical requests, failing critical responses, missing assets, or hydration mismatches across the tested routes and viewports.

## 40. Persistence search results

The required storage search finds pre-existing bounded World comparison/UI storage and guardrail text. UX6 production paths add no storage API or key. Rendered reload tests confirm the Guided draft, step, and selected view reset while existing storage entries remain unchanged; Lab and Atlas research persistence remain unimplemented.

## 41. Determinism search results

The nondeterminism search classifies hits as pre-existing runtime/test behavior or guardrails. Guided assembly and handoff contain no `Date.now`, `Math.random`, `crypto.randomUUID`, UUID helper, or nanoid. Unit tests compare repeated assembly, ids, ordering, defaults, validation messages, and handoff output.

## 42. Execution-path search results

The execution search finds pre-existing template/runtime functions and explicit non-execution copy. No Guided module imports or calls simulation start/run, apply-to-World, template generation, scenario generation, RunConfig creation, compiler, eval, dynamic Function, worker, child process, or WebAssembly paths.

## 43. Production files changed

UX6 adds `BuilderExperienceTabs.tsx` and the `guided` Builder module, and updates `BuilderShell.tsx`, `ModelSchemaAuthoringShell.tsx`, `modelSchemaAuthoring.ts`, `globals.css`, `capabilityGuidance.ts`, and `routeOrientation.ts`. Simulation engine and template runtime files are unchanged.

## 44. Test files changed

UX6 adds `guidedBuilderModel.test.ts`, expands `research-world-shell.spec.ts`, updates `semantic-foundation.spec.ts` for the new default plus explicit Advanced coverage, updates one Graph View source assertion, and updates roadmap contracts.

## 45. Documentation files changed

UX6 updates README, planned/canonical roadmaps, concepts, Research World progression, prior UX handoffs, HCI/workspace IA, CURRENT_CONTEXT, SESSION_LOG, and AGENTS. Product philosophy is unchanged because UX6 does not alter the product mission.

## 46. Verification commands

Baseline: focused Playwright `34 passed`; full UI `49 passed`; typecheck passed; unit tests `68 files / 548 tests`; build passed; performance smoke passed; `git diff --check` passed.

Post-change gates: focused Playwright `41 passed`; full UI Playwright `56 passed`; typecheck passed; full unit tests passed `69 files / 564 tests`; production build passed; simulation performance smoke passed; and `git diff --check` passed.

UX6B final gates: focused Playwright `43 passed`; full UI Playwright `58 passed`; typecheck passed; full unit tests passed `69 files / 565 tests`; production build passed; simulation performance smoke passed; and `git diff --check` passed.

`npm run lint: unavailable, package.json has no lint script.`

## 47. Remaining limitations

No beginner user study, mobile workflow validation, screen-reader walkthrough, assistive-technology audit, forced-colors audit, actual browser-zoom verification, or WCAG conformance assessment was performed. Guided covers only a small schema subset, does not author initial entity counts, and cannot establish model correctness. UX6B source-audited imported/equal-content overwrite variants but did not add a separate rendered case for each provenance/equality combination.

## 48. UX6B requirement

UX6B is complete in `GUIDED_BUILDER_AND_STEP_BY_STEP_CONFIGURATION_FLOW_FOUNDATION_AUDIT.md`. It independently audited deterministic mapping, loss/overwrite paths, route-leave behavior, accessibility/focus, short layouts, capability honesty, Advanced preservation, and absence of runtime or persistence leakage. It found and fixed eight bounded defects without broadening capability.

## 49. GW9 pause decision

GW9 remains paused until UX6B is committed and remotely aligned. UX6/UX6B add no sampling, probes, queues, regimes, saved landscapes, Lab records, Atlas discoveries, or Research World persistence.

## 50. Final decision

UX6B finds the Guided foundation ready for GW9 after commit and remote alignment, subject to the explicitly documented verification limits. Structural support has been earned only for drafting and validation; no runtime support has been added or implied.

UX6 complete.

UX6B complete.

GW9 is next.

GW9 remains paused until UX6B is committed and remotely aligned.
