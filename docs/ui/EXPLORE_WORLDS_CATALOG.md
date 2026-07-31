# Explore Worlds Catalog

Date: 2026-07-27
Status: C1 and C1B complete; C2 next

## 1. Route Structure

- `/worlds` is the runnable Starter World catalog.
- `/worlds/[slug]` is a directly linkable detail route.
- `/world?starter=<id>` is the strict canonical launch destination.
- `/` remains Start, and `/world` remains the live workbench.

Explore Worlds is reachable from Start without becoming another equal-weight global destination. On `/worlds`, primary navigation keeps Start current because the catalog belongs to the entry and discovery flow.

## 2. Catalog Hierarchy

The first viewport presents:

1. `Explore Worlds`;
2. one concise product sentence;
3. one featured runnable world led by a question;
4. browse controls;
5. at least the beginning of the runnable catalog.

The page does not explain the registry, schemas, or internal IDs before showing a system. Planned and concept-only candidates remain in documentation.

## 3. Card Anatomy

Each of seven cards shows:

- a hook question;
- user-facing title;
- concise premise;
- deterministic system-derived visual;
- two to four anatomy or mechanism indicators;
- estimated first activity;
- one `Explore world` action.

Tags remain secondary to the hook and premise. Internal template IDs are absent. Card order comes from validated `catalogOrder`.

## 4. Filters

Four bounded native-select filters cover Domain, Mechanism, System form, and Complexity. Filters combine with logical AND and operate only over the seven runnable definitions.

Current filter state is repeated in text. Reset clears all filter and search state. Complexity describes the depth of the modeled interaction, not the intelligence or expertise of a person.

## 5. Search

Search is deterministic and client-side. Normalized terms are matched with AND semantics across title, short title, hook, premise, summary, domain, mechanisms, system forms, catalog indicators, primary mechanisms, and represented anatomy.

Search makes no network request, stores no query, profiles no person, and generates no recommendation.

## 6. Detail-Page Hierarchy

The detail first viewport includes the hook, title, premise, represented system signals, deterministic visual, baseline invitation, and primary Launch action.

The remaining reading order is:

1. The question
2. Inside this world
3. How the system works
4. Start here
5. Things to investigate
6. Research connection
7. What this world leaves out
8. Remix directions

Only represented anatomy facets render. Research stays below action. One main boundary appears before a direct link to the existing full model reference.

## 7. Visual Identity

`StarterWorldVisual` provides seven deterministic, local CSS/DOM diagrams:

- moving directional agents;
- contact rings and state nodes;
- opinions along a bounded axis;
- a spatial predator/prey encounter scene;
- neighborhood cells;
- landscape spread cells;
- excitation/inhibition network nodes and links.

They are illustrative system identities, not screenshots, live engines, measured output, or empirical results. Meaningful textual indicators accompany them, and the diagrams are hidden from assistive technology.

## 8. Launch Behavior

The primary detail action uses a canonical URL containing only the Starter World ID. World derives and revalidates the template, default initialization preset, task, and runtime references server-side, then constructs a fresh paused tick-0 scenario through existing scenario services. Template, scenario, RunConfig, and unknown query overrides fail before World construction.

The selected template, initialization preset, recommended task, and Starter World identity remain inspectable. A compact definition-driven nudge links back to detail and identifies the first run, first change, and outputs to watch.

No arbitrary parameter object, RunConfig, template mutation, or stored progress enters the handoff.

## 9. Error States

No catalog matches show active filters, explain that no future entries are invented, and provide an explicit reset.

Unknown starter IDs, template mismatches, unsupported initialization presets, malformed requests, and invalid tasks show `This world could not be prepared safely`. The route offers paths to Explore Worlds and Start and renders no World shell or stage.

Unknown detail slugs use the normal Next.js not-found boundary.

## 10. Responsive Behavior

The catalog was designed and inspected at 1440x900, 1280x720, 1024x768, 900x700, 1280x600, and 390x844.

Desktop uses a featured system band and three-column catalog. Medium widths compact the feature before reducing the catalog to two columns. Mobile uses one document scroll, compact split visuals, a single catalog column, and no nested detail scroll. The launch remains in the first mobile detail viewport and precedes research.

World's established R2B responsive shell is unchanged.

## 11. Accessibility

- Native search and select controls have stable labels.
- Active filter count and text use polite live regions.
- Every page has one H1 and meaningful section headings.
- Link names communicate actions and external-source behavior.
- External links use HTTPS, `target="_blank"`, and `rel="noopener noreferrer"`.
- Nudge dismissal has a model-specific accessible name and moves focus to the World stage.
- The failure state is a named alert.
- Keyboard interaction, focus, reduced motion, horizontal overflow, and representative Axe states are covered by Playwright.

No screen-reader, assistive-technology, forced-colors, browser-zoom, WCAG, or complete mobile-workflow certification is claimed.

## 12. Verification

Focused tests cover the strict schema, versions, recursive registry immutability, taxonomy, anatomy, quality lint, source structure and DOI shape, unsafe keys, duplicate identities, production registry references, deterministic query behavior, ID-only launch context, override rejection, every fresh paused tick-0 handoff, all seven first-change control paths, no storage, six catalog viewports, all detail routes, mobile order, focus, Back/reload semantics, diagnostics, reduced motion, and Axe.

The required final C1 gate also runs the established destination-shell suite, full UI suite, typecheck, unit suite, production build, simulation performance smoke, Atlas preview smoke, and `git diff --check`.

## 13. Remaining Limitations

- The diagrams are authored illustrations, not live previews.
- Catalog controls reset on reload by design.
- No saved tutorial progress or personalization exists.
- Starter definitions currently wrap only the seven production templates.
- Remix directions are explanatory and do not execute Builder handoffs.
- Source connections do not calibrate or validate the implementations.
- Actual participant comprehension, browser zoom, screen readers, assistive technology, forced colors, complete touch workflow, and WCAG conformance remain unverified.

- R1 complete.
- R1B complete.
- R2 complete.
- R2B complete.
- C1 complete.
C1B final focused and complete browser verification passed. C1B is complete. C2: Flagship Starter Pack One is next and has not started.
