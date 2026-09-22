# S2 — Visual Systems Workbench

Status: COMPLETE — Visual Systems Workbench is the primary Workshop surface; S2B is NEXT / UNSTARTED.

Continuation base: `main` at `fbc0622274df59a7472b042478ad33e8fe0e5831` (`test: audit starter remix bridge`). Resume verification preserved all existing S2 changes and found no partial S2 commit. The accepted 2026-09-14 primary Workbench rendered review remains applicable. The secondary-editor CSS repair passed its affected browser matrix on 2026-09-22.

S2 makes the assembled system the primary Workshop object. A normal `/builder` visit opens the Workbench, with a worked Flocking system ready for inspection. Starter → Remix uses the same bench with source lineage and editable derivative properties. The existing Guided Builder is now **Structural Draft**; **Advanced Builder** remains reachable as secondary, non-executable structural tooling.

## Information architecture

Three entry intentions share one bench: **Take apart a system**, **Browse building blocks**, and **Start from a question**. The first presents current worked examples; the second connects recurring materials to examples that use them; the third offers four deterministic, product-authored questions and relevant examples. Question selection does not infer intent, generate a model, or choose a model for the user.

The spatial bench groups a model's population or cells/nodes, template-owned dynamics, environment, and seeded variation. Nested groups expose finer pieces with expand/collapse. Selecting a piece opens its definition, read/affect descriptions, connected pieces, capability, fixed structure, and existing editable properties. Relationship controls move to the connected piece and reveal its context. The decomposition path returns toward the whole. Layout, glyphs, selection, and nesting are explanatory presentation, never live simulation or scientific coarse-graining.

Large layouts pair the bench with an inspector. A compact heading and secondary-tool tabs leave the assembled system dominant; short-height desktop uses an example picker to preserve working space. At narrow widths a two-by-two system overview leads into hierarchical navigation: system → group → piece → inspector, with explicit return controls. Starter entry without an explicit property target opens the assembly; an explicit target opens its piece. One content region scrolls while the derivative validation/launch actions remain outside it. Major panels use `CornerFramePanel`; the existing ORTUS navigation brand remains unchanged.

## Presentation representation and authority

`src/lib/workbench` owns pure deterministic `WorkbenchModel`, `WorkbenchPiece`, `WorkbenchRelationship`, control-reference, and materials derivation. Explanatory, template-specific descriptions map current Starter anatomy and existing runtime semantics into a shared presentation shape. This is deliberately not a canonical scientific ontology or a second executable registry.

```text
Workbench representation != ModelDefinition != RuntimePlan != SystemViewSpec
source Starter != derivative draft != accepted run
presentation hierarchy != scientific scale
visual relationship != real-world causal proof
structural validity != executable support != scientific validation
```

Control references contain only existing group/key identities. Labels, defaults, bounds, allowed values, initialization options, composition options, environment options, and behavior modes resolve from existing typed template/scenario contracts. The Workbench stores no executable rules, ports, parameter ranges, engine, snapshots, RNG, scheduler, or live entity arrays. Model derivation is memoized against stable example metadata rather than keystrokes or simulation ticks.

Primitive-backed material status uses `src/simulation/registry` and per-template `runtimeActive` support. A pictured template feature cannot upgrade a global service into executable support. Explanatory materials without a primitive entry name current template-owned behavior or remain reference vocabulary; they do not become dispatchable primitives.

Workshop owns only presentation and unsaved draft state. Explicit Run Remix uses the existing S1/S1B scenario acceptance path. Flocking retains one Worker-owned engine/RNG/scheduler authority; the other six templates retain their established legacy runtime paths. S2 adds no shadow preview, runtime subscription, compiler, arbitrary graph execution, `eval`, `Function`, generated code, persistence, SystemView, SA0, S3, O1, E1, or I2.

## Cross-system proof and reusable vocabulary

| Worked family | Meaningful pieces and relationships | Limit made explicit |
| --- | --- | --- |
| Flocking | Boids, position/velocity, neighborhood, alignment/cohesion/separation, movement, boundary, initialized groups, seeded noise; position → neighborhood → steering → velocity → movement → position | Spatial proximity is not a persistent network; group-aware steering is a bounded existing variant |
| Predator–Prey | Prey and predators, predator energy, predation, reproduction/death, motion and encounters | Prey have no energy component; predator energy is not generic stocks/flows |
| Epidemic | Susceptible/infected/recovered states, local transmission, recovery clock, movement/contact and initial outbreak placement | Spatial contact is not a persistent network or public-health prediction |
| Forest Fire | Landscape cells, categorical fuel/burning/empty state, adjacent spread, burnout, regrowth and lightning | Categorical fuel is not a resource field; this does not implement wildfire or field dynamics |
| Schelling | Two abstract groups, satisfaction, local composition, similarity threshold, relocation and cell occupancy | Group labels are not real social identities |
| Opinion Dynamics | Scalar opinion, fixed positions, nearby influence, optional bounded social-learning/source/crowd terms, noise | Model values are not measured beliefs or generic cognition/social-learning runtime |
| Neural Excitation Network | Abstract excitable nodes, activation, refractory counter, weighted directed propagation, bounded delayed signals and optional readout | Only this template executes its network; signals/readouts are not biological measurements or cognition |

The shelf connects **agents & populations**, **state**, **local neighborhood**, **movement**, **consumption**, **birth & death**, **transmission**, **grid**, **network**, and **seeded variation** across applicable examples. **Spatial fields**, **stocks & flows**, **feedback & delays**, and **system composition** preserve their structural/service boundary. No new model family is introduced to populate the shelf.

## Capability language and supported manipulation

Capability combines a visible text label and a shape marker, never color alone:

- **Executable in this template**: describes behavior an identified existing template implements; the pictured piece does not execute independently.
- **Structural only · not executable**: a structural declaration/service exists, but this assembly does not execute it.
- **Reference · not executable**: explanatory vocabulary absent from this model's runtime pieces.
- **Future · not implemented**: reserved capability when indicated by the registry.

The inspector edits existing seed, parameters, initialization, behavior, composition, and environment fields through S1 scenario helpers. Examples include changing cohesion strength, substituting an existing initial arrangement or behavior, selecting Flocking's group-aware variant, and editing its bounded group count/ratio. This is configuration of an existing template, not arbitrary population splitting. Reset property restores an available source value while preserving unrelated draft edits. Exact configuration remains a secondary disclosure for the complete existing S1 control set.

Source identity and unsaved derivative status stay visible. Invalid numeric/raw edits persist across piece selection and block launch; changing the inspected piece does not repair or discard them. Reset to source and leaving meaningful work retain staged confirmation. Engine-checked input is not scientific validation. `Run Remix` launches only a valid supported derivative through the established runtime path; fixed entities, state shapes, processes, rules, metrics, topology, and template identity cannot be rewired here.

## Accessibility and rendered acceptance

The bench uses semantic nested lists, named inspect buttons, separate `aria-expanded` disclosure controls, selected-state text/semantics, and named relationship navigation. There is no precision drag requirement, hover-only essential information, or Canvas-only semantic experience. The existing keyboard-operated outer tabs keep Structural Draft and Advanced Builder reachable. Narrow navigation and explicit focus movement preserve the selected context. Motion must respect reduced-motion preferences.

The implementation owner inspected rendered normal Workshop and the browser Starter detail → Remix path, including Flocking, Predator–Prey, Epidemic, Forest Fire's grid, and Neural Excitation Network. Viewports reviewed were `1440 × 900` desktop, `1280 × 600` short-height desktop, `900 × 700`, and `390 × 844` narrow/mobile. On 2026-09-14, direct browser exercises passed keyboard operation of the secondary tabs, mobile drill-in/edit/return navigation, DPR-2 rendering and reduced motion. These observations support a product/design judgment; they do not establish participant comprehension, screen-reader/AT behavior, actual browser zoom, hardware coverage, or formal WCAG conformance. UR0 human comprehension remains pending.

### Rendered iterations

The pre-S2 baseline was form-first: a read-only anatomy strip accompanied Guided forms, while Starter → Remix presented a large configuration editor. It did not make decomposition the primary interaction.

1. **First Workbench pass:** introduced the shared assembly, nested pieces, relationships, contextual inspector, examples and materials. Rendering exposed excessive introductory/header and panel padding, a partially displaced assembly, and weak primary-action contrast. Architecture alone did not pass the product gate.
2. **Second pass:** tightened panel layout, arranged steering as distinct inspectable tiles, differentiated glyphs, corrected action contrast and lineage spacing, and fixed relationship navigation to expand the actual ancestry before focusing a target. Further rendering showed that the header and default expanded detail still consumed too much of the first viewport.
3. **Closure design pass:** combined the desktop heading and secondary-tool tabs, collapsed secondary groups by default, placed a real relationship trace above the assembly, introduced the short-height example picker, and made narrow entry a two-by-two overview with hierarchical drill-in. A mobile Starter with no explicit focus now opens the assembled system, rather than inheriting the suggested property and opening the inspector. Explicit property links retain targeted inspection.
4. **Secondary-editor layout repair, 2026-09-21:** the resumed shell matrix exposed Advanced Builder header content overlapping the mode tabs at `1024 × 768` and intercepting pointer clicks. Below `1120px`, the secondary-only shell now uses four `max-content` rows and vertical scrolling so the editor keeps its natural height. An initial automatic-row adjustment still compressed the outer header and was corrected before acceptance. Direct Chromium ordinary-click and bounding-box checks passed at `1024 × 768`, `900 × 700` and `390 × 844`; the owner also inspected the corrected `1024 × 768` render. The primary Workbench layout is unaffected. The complete Guided/Advanced viewport matrix and all serial skips passed on 2026-09-22.

The reviewed result puts worked systems and their pieces ahead of configuration. The owner accepted the third rendered pass and judged the initial Workshop and Starter → Remix materially different from the baseline, with contextual editing reached through the assembly. The direct interaction exercises also passed. This product/design judgment is distinct from automated verification and does not establish participant comprehension.

### Product thesis verification

| Required thesis | Reviewed result |
| --- | --- |
| Normal `/builder` no longer defaults to old form-first Guided Builder | The initial route displays a worked Flocking assembly in Workbench. |
| Visual Systems Workbench is the primary Workshop surface | Examples, pieces, relationships and the contextual inspector occupy the main surface. |
| Starters open as assembled/decomposable systems | Starter → Remix enters the same assembly; default entry preserves the whole-system overview. |
| Structurally different models fit one representation | Boid motion, predator/prey populations, epidemic states, grid-cell spread and template-owned neural networks use the shared presentation contracts. |
| Pieces and relationships are meaningful | Read/affect descriptions and named relationship paths connect template-specific states, processes and spaces. |
| Expand/collapse/drill-in is coherent | Nested branches preserve ancestry; narrow navigation moves from overview to group to piece, with return controls. Direct keyboard and mobile drill-in/edit/return exercises passed. |
| Systems-material vocabulary is reusable | The shared shelf locates agents, state, movement, neighborhood, grid, network and other materials across applicable examples. |
| Capability states are explicit and non-color-only | Text and shape markers distinguish executable, structural, reference and future states near relevant pieces/materials. |
| S1 controls appear through selected pieces | The inspector resolves selected control references against existing authoritative typed contracts; complete configuration is secondary. |
| Starter → Remix feels like modifying a system | Selecting a behavior or constituent exposes its supported properties, variant substitution and property reset while source lineage remains visible. |
| Guided/Advanced remain reachable and secondary | Structural Draft and Advanced Builder remain keyboard-operated secondary tabs. |
| Unsupported composition never appears executable | Structural/reference materials expose limits; explanatory relationships do not offer connection or execution controls. |
| Rendered Workshop is materially different from pre-S2 | The reviewed initial viewport is organized around an assembled system and decomposition, rather than a form with an appended diagram. |

### Findings and disposition

- **P0:** none found.
- **P1, fixed:** relationship navigation could focus a descendant hidden by a collapsed ancestor; responsive rendering could duplicate piece IDs; mobile Starter entry implicitly selected a suggested property and bypassed the assembled overview. Ancestry expansion, exclusive responsive rendering, and explicit-only initial property focus address those defects. The resumed browser gate also found Advanced Builder header overlap blocking mode-tab clicks at `1024 × 768`; the secondary-only natural-height grid repair passed direct rendered/click checks and the complete automated viewport matrix.
- **P2, fixed:** Predator–Prey explanatory copy misstated wrapping and implied prey energy; primary-action contrast was weak; excessive header/panel density displaced the assembly; insufficiently distinct glyphs and sparse panel areas weakened piece recognition. Copy, contrast, layout, collapse defaults and glyph refinements address these findings.
- **Test maintenance:** scoped an ambiguous composition-boundary assertion to the Workbench footer, updated stale form/capability/status assertions, and made a secondary-tab test wait for the existing hydration-ready signal before clicking. These repairs preserve the tested product contracts.
- **Remaining:** no known unresolved S2 product defect. The independent S2B audit is next and unstarted; UR0 participant comprehension remains pending.

## Blocked operations: evidence for a later SA0/S3 scope

| High-value operation | Current boundary | Missing contract before executable support |
| --- | --- | --- |
| Split a population into independently governed systems | Existing Flocking group count/ratio configures initialized groups only | Reusable executable population/process primitives, typed interfaces, composition validation and runtime dispatch |
| Duplicate a population or process | No independent executable instance can be created from a pictured piece | Instance identity/state ownership, typed ports, compatible multiplicity and runtime dispatch |
| Merge systems or populations | Current templates are not interchangeable executable components | Compatibility contracts, state/space reconciliation, composition validation and compilation |
| Remove an interaction or process | Parameter adjustment is not structural deletion | Dependency/required-port rules, valid reduced assemblies and capability dispatch |
| Connect processes, or substitute a network for proximity | Explanatory relationships are navigation links only | Typed ports/interfaces, compatibility, scheduling semantics, executable primitives and composition validation |
| Substitute a field for an existing interaction/environment | Field artifacts remain structural; no template consumes them here | Field execution/sampling primitives, units/coupling contracts, compatible ports, validated runtime dispatch |
| Compile a new assembled system | No generic executable composition exists | Validated `ModelDefinition` → `RuntimePlan` compilation after the above foundations |

These are product/architecture observations from S2, not implemented operations or empirical human-study findings. They record useful questions while keeping unsupported controls absent. S3 remains blocked pending its dedicated foundations and prompt; SA0 and S2B are not begun by S2.

## Verification and disposition

Final verification on 2026-09-22:

- `npm run lint` passed its scoped baseline over `397` production TypeScript files. This is the repository's TypeScript, unused-symbol, architecture, randomness, dynamic-execution and intrinsic-JSX baseline, not full ESLint or accessibility conformance.
- Standalone `npm run typecheck` passed after the final browser-test repair.
- `npm run build` passed after the secondary-editor CSS repair: compilation in `17.5s`, `23` generated pages.
- `npm test` passed `90 files / 773 tests` in `84.64s` against the final closure documentation. Earlier focused Workbench model `9` and acceptance `27` tests also passed; the earlier full run's six documentation assertions were corrected or addressed by the final status update.
- `npm run test:ui` completed all `213` distinct cases across resumed runs. This is aggregate coverage, not a single uninterrupted clean run: `86` confirmed passes were preserved from 2026-09-15; the 2026-09-21 continuation passed `111/127` in `22.3m`, with two failures and `14` serial skips; the remaining `16/16` passed in `3.3m` on 2026-09-22 with no retries or skips. Current test inventory exactly matches those three disjoint sets. No failed, skipped or unconfirmed case remains.
- The interrupted first UI run exposed an ambiguous footer/reference locator and stale capability-copy assertions. The second exposed the secondary-editor overlap and a pre-hydration tab click in a migrated test. The layout fix, scoped assertions and hydration-ready wait passed their affected checks. Prior completed tests were preserved where subsequent source changes did not invalidate them.
- Focused Workbench browser `9/9 (1.3m)` and S1 Starter Remix browser `7/7` had already passed; both also passed in the resumed full inventory. Rendered review and direct keyboard/mobile/reduced-motion exercises are documented above.
- `git diff --check` passed. Final pre-commit status, diff/stat and staging review cover only intentional S2 implementation, tests and documentation.

Working verification manifests and logs are retained under ignored `blob-report/s2-verification/`; generated browser reports, screenshots and build outputs are not source deliverables. The earlier interrupted temporary log did not survive; its confirmed test manifest preserves the continuation accounting.

No simulation/runtime production code changed, and no concrete runtime regression concern was identified. Standalone `perf:runtime` and `perf:simulation` were therefore not run. Existing runtime authority and scientific boundaries remain unchanged.

S3 remains blocked. S2B is the next independent audit and has not begun. The local closure commit is `feat: build visual systems workbench`; no push is authorized or performed.

```text
S2: COMPLETE
S2B: NEXT / UNSTARTED
PRIMARY WORKSHOP: VISUAL SYSTEMS WORKBENCH
FORM-FIRST GUIDED/ADVANCED: SECONDARY STRUCTURAL TOOLING
GENERAL EXECUTABLE COMPOSITION: NOT IMPLEMENTED
UR0 HUMAN COMPREHENSION GATE: PENDING
```
