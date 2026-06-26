# Living Systems Atlas Semantic Token Foundation

Status: Prompt UX2 implementation source of truth.

UX2 establishes shared visual semantics.
It does not perform the Research World shell transformation.

UX2 prepares the visual language.
GW1 performs the structural shell transformation.

## Purpose And Scope

UX2 introduces a bounded semantic token foundation for the existing ORTUS UI. It creates shared semantics for surfaces, text, borders, interaction states, operational states, evidence states, focus, typography roles, spacing, shape, elevation, motion, and reduced motion.

It also migrates a small shared primitive set so the tokens are not merely decorative names:

- `CornerFramePanel` panel styling.
- Shared button and icon-button styling.
- Shared form-control foundation.
- Shared `StatusPill` and Builder status-badge semantics.

The intent is not to make ORTUS visually finished. The intent is to stop the current raw-value drift from turning into a permanent pseudo-design system.

Required migration strategy:

```text
introduce semantic tokens
→ preserve legacy compatibility
→ migrate a small shared primitive set
→ verify current workflows
→ defer specialized surfaces
```

## Constraints

UX2 does not add World, Lab, Atlas, or Workshop routes, navigation, shell behavior, persistence, notebooks, saved assets, Discovery Atlas, behavioral landscapes, contextual capability guidance, progression, onboarding, templates, simulation runtime behavior, model-schema runtime behavior, graph execution, external framework interop, icon libraries, chart libraries, graph libraries, animation libraries, Tailwind, Sass, CSS-in-JS, component libraries, local font files, remote fonts, token generation, theme providers, or runtime styling dependencies.

The implemented routes remain:

```text
/
/builder
```

Current specialized simulation, chart, graph, schema, Neural Runtime Lab, template-background, and Builder feature surfaces are not broadly redesigned by UX2. They may inherit legacy aliases where they already consume shared variables.

## Token Architecture

The canonical token source is `src/app/globals.css`.

The token layer is:

```text
raw palette values
→ semantic tokens
→ component-role tokens where necessary
→ component styles
```

Raw palette values use `--palette-*` names. Semantic tokens describe meaning such as `--surface-root`, `--text-primary`, `--border-focus`, `--interaction-selected-surface`, `--operational-running-surface`, and `--evidence-stale-surface`. Component-role tokens are used only where shared primitives need local contracts, such as `--component-panel-surface`, `--component-button-selected-border`, `--component-form-border`, and `--component-status-surface`.

Legacy variables are preserved and aliased where safe. `--bg-primary`, `--bg-secondary`, `--bg-panel`, `--bg-panel-strong`, `--accent-primary`, `--accent-secondary`, `--accent-tertiary`, `--accent-rare`, `--danger`, `--frame-corner`, `--structure-line`, and `--motion-tight` remain available for current consumers.

Do not remove an existing visual variable merely because a better name now exists.
Remove it only when its consumers are known and migrated.

No circular aliases are intentional. The legacy aliases point into semantic or raw palette values; migrated shared primitives consume semantic or component-role tokens.

## Raw Palette

The raw palette moves ORTUS away from acid-green/hazard-orange identity while preserving a dark, precise, high-contrast foundation:

- Warm charcoal and graphite roots: `--palette-charcoal-*`.
- Forest-slate and mineral gray surfaces: `--palette-forest-slate-*`, `--palette-mineral-*`.
- Warm off-white and stone text: `--palette-warm-off-white`, `--palette-stone-*`.
- Restrained accents: teal, moss, copper, amber, violet, and crimson.

Domain colors remain allowed for modeled content and data visualization, but shared interface state should use semantic tokens.

## Surface Tokens

Minimum implemented surface concepts:

- `--surface-root`
- `--surface-canvas`
- `--surface-panel`
- `--surface-panel-raised`
- `--surface-panel-inset`
- `--surface-overlay`
- `--surface-note`
- `--surface-selected`
- `--surface-disabled`

Destination-ready reserved concepts:

- `--surface-world`
- `--surface-lab`
- `--surface-atlas`
- `--surface-workshop`

These destination tokens do not create destination UI. They are shared visual semantics only.

## Text Tokens

Minimum implemented text concepts:

- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--text-inverse`
- `--text-interactive`
- `--text-disabled`
- `--text-warning`
- `--text-failure`

Text tokens should communicate hierarchy or state. They must not be treated as empirical status or scientific truth.

## Border Tokens

Minimum implemented border concepts:

- `--border-subtle`
- `--border-default`
- `--border-strong`
- `--border-selected`
- `--border-focus`
- `--border-warning`
- `--border-failure`
- `--border-stale`
- `--border-unsupported`

Focus, selection, evidence, warning, stale, and unsupported borders are distinct because they represent different kinds of state.

## Interaction States

Shared controls define default, hover, pressed, selected, keyboard focus, and disabled states.

Required distinctions:

```text
selected ≠ supported
active ≠ validated
hovered ≠ important
```

Selected state is an interaction state. It is not evidence support, runtime readiness, scientific validation, or model correctness.

## Operational Status

Operational status describes software operation state, not empirical or scientific validity.

Implemented operational concepts include idle, ready, active, running, paused, completed, failed, disabled, runnable, and non-runnable.

Required copy:

```text
Operational success means the requested software operation completed.
It does not mean the modeled conclusion was scientifically validated.
```

Avoid `Validated` for operational completion. Use labels such as `Completed`, `Ready`, `Failed`, `Runnable`, or `Not runnable` only when the underlying software capability warrants them.

## Evidence And Epistemic Status

Evidence and epistemic status describes what kind of evidence or uncertainty a claim carries. It is not the same as software operation state.

Implemented evidence concepts include observed, supported, contradicted, unresolved, uncertain, stale, unsupported, lossy, planning-only, future-only, and unverified.

Required distinction:

```text
contradicted is not failure
unresolved is not error
stale is not unsupported
planning-only is not non-runnable for the same reason
future-only is not disabled functionality
```

Every rendered status must include explicit text. Color alone is not enough. Green alone must not imply support, validation, or truth.

## Status Presentation Contract

`src/components/ui/StatusPill.tsx` now resolves every pill to:

- visible label text,
- semantic category,
- semantic state,
- optional description,
- accessible label,
- non-color visual cue,
- compact or standard size.

Variant categories:

- operational
- interaction
- evidence
- capability

The legacy `tone` prop remains for compatibility, but it maps into explicit semantics. Builder status badges now expose `data-status-category`, `data-state`, and an explicit accessible label.

This does not replace every badge in ORTUS. Specialized statuses remain a deferred migration area.

## Typography

UX2 keeps the existing offline-safe font stacks in CSS. It does not add `next/font/google`, remote fetching, local font files, package fonts, or a theme provider.

Tokenized type roles include display, page title, section title, panel title, body, control, label, caption, and annotation.

Migrated status and button primitives reduce all-caps saturation. Global headings are not broadly changed.

## Spacing

The shared spacing scale is:

```text
4, 8, 12, 16, 24, 32, 48 px
```

Implemented as `--space-1` through `--space-7`.

Only bounded shared primitives use the new spacing tokens in UX2. Specialized dense surfaces remain deferred.

## Shape

UX2 preserves sharp ORTUS geometry while reducing tactical ornament in migrated primitives. Shape tokens define control, chip, and panel cuts without introducing rounded SaaS cards or a new component library.

The shape language remains precise and instrument-like, but it should not imply targeting, combat, command, or hidden runtime authority.

## Elevation

Implemented elevation concepts:

- `--elevation-flat`
- `--elevation-inset`
- `--elevation-raised`
- `--elevation-overlay`
- `--elevation-modal`

Glow is not the elevation model. Elevation separates stacked UI layers without pretending the interface has physical instrumentation state.

## Focus

Shared focus uses `:focus-visible` and `--interaction-focus-outline`. Focus must remain visible, keyboard-reachable, and distinct from selection.

Do not globally remove outlines. Do not use `outline: none` without an equally visible replacement.

## Motion And Reduced Motion

Motion tokens define fast, control, panel, data, and reduced durations plus standard enter/exit easing.

Required principle:

```text
Reduced motion should remove nonessential interface motion without erasing the modeled information the user is studying.
```

The existing reduced-motion media query remains, now tied to `--motion-duration-reduced`. It reduces interface animation and transition duration. It does not disable simulation stepping or erase model state.

## Destination-Ready Semantics

World, Lab, Atlas, and Workshop tokens are reserved as shared visual semantics only.

UX2 does not implement the World/Lab/Atlas/Workshop shell. It does not add route files, tabs, destination pages, destination navigation, persistent destination state, Discovery Atlas, behavioral landscapes, notebooks, or reusable assets.

## Domain Accents

Required principle:

```text
Domain color identifies modeled content.
Semantic color communicates interface and evidence state.
```

Template and visualization accents may continue to identify modeled entities, fields, species, states, or traces. They must not be reused to imply operational success, evidence support, validation, runtime readiness, or scientific truth.

## Migrated Primitives

UX2 migrates no more than four shared primitive families:

- `CornerFramePanel`: shared panel surface, highlight, shape, elevation, and focus semantics.
- Buttons and `IconButton`: shared default/hover/pressed/selected/disabled semantics.
- Form controls: shared background, border, focus, invalid, and disabled semantics.
- Status badges: `StatusPill` and `BuilderStatusBadge` expose semantic category/state, explicit labels, non-color cues, and accessible labels.

Specialized simulation, chart, graph, schema, and template-specific UI remains deferred unless it safely inherits legacy aliases.

## Legacy Compatibility

Legacy variables remain present because unknown or unmigrated consumers still depend on them. UX2 deliberately avoids a flag-day CSS rewrite.

Legacy variable preservation is not a claim that the old names are semantically ideal. It is a safety boundary while the product migrates from overloaded raw values to explicit semantics.

## Accessibility And Contrast

Representative contrast calculations were performed against UX2 token values. These are implementation checks, not a full WCAG conformance claim and not a screen-reader or assistive-technology audit.

| Pair | Ratio |
| --- | ---: |
| Primary text on root | 17.72:1 |
| Primary text on panel | 16.92:1 |
| Secondary text on panel | 13.02:1 |
| Interactive text on panel | 11.30:1 |
| Inverse text on primary teal button | 11.83:1 |
| Warning text on note surface | 9.73:1 |
| Failure text on failure surface | 7.05:1 |
| Focus ring on root | 11.88:1 |
| Focus ring on panel | 11.34:1 |

Keyboard operability for shared controls is source-preserved through native buttons, inputs, selects, textareas, and visible `:focus-visible` styles. Browser keyboard walkthrough, focus-return behavior, rendered target sizes, screen-reader behavior, assistive-technology behavior, forced-colors behavior, and WCAG readiness remain unverified unless directly tested.

## Rendered Verification

UX2 source and build verification should cover `/` and `/builder` so existing workflows remain reachable. Browser-rendered viewport screenshots at 1440x900, 1280x720, approximately 900px width, and short-height desktop remain desirable but were not available through repository tooling at implementation time unless separately reported in the session log.

Prompt UX2B adds a dev-only Playwright/Axe audit harness in `playwright.config.ts` and `tests/ui/semantic-foundation.spec.ts`. The harness targets `/` and `/builder`, the UX2 viewport set, reduced-motion context, console/pageerror/hydration/asset checks, conservative overflow checks, keyboard smoke coverage, shared primitive rendering, rendered status distinctions, Builder badges, and Axe scans. The continuation run completed successfully after the host Chromium dependency blocker was resolved: all 15 rendered tests passed. See `LIVING_SYSTEMS_ATLAS_SEMANTIC_FOUNDATION_AUDIT.md`.

Do not claim rendered responsive behavior, browser zoom behavior, screen-reader behavior, assistive-technology behavior, forced-colors readiness, or WCAG conformance from UX2 source tests alone.

Viewport automation is not actual browser UI zoom. Browser zoom remains unverified unless explicitly tested.

## Deferred Migration

Deferred:

- Specialized simulation canvas colors.
- Template visual descriptor color governance.
- Chart and trace color systems.
- Builder graph node/edge visual refinements.
- Schema validation/fit/scenario-planning card systems beyond inherited tokens.
- Neural Runtime Lab specialized panels.
- Responsive and actual browser-zoom remediation.
- A full tooltip primitive.
- Full screen-reader, assistive-technology, forced-colors, actual browser-zoom, and WCAG verification beyond the UX2B automated rendered harness.
- GW1 destination shell work.

The next implementation branch should not treat these deferred areas as already solved by UX2.

## GW1 Relationship

UX2 defines how shared design foundations communicate interface, evidence, uncertainty, and capability state.

GW1 must decide how the structural destination shell wraps current validated workflows. It must preserve current `/` and `/builder` access until a dedicated implementation and audit prove replacement safe.

GW1 is conditionally ready after UX2B, but it must still begin only from a dedicated prompt and must preserve `/` and `/builder` until its own implementation and audit prove replacement safe.

Required boundary:

```text
UX2 prepares the visual language.
GW1 performs the structural shell transformation.
```

## Non-Goals And Guardrails

A visual state must communicate what kind of state it represents:
operational, interaction, evidence, uncertainty, or capability.

UX2 must not be used to claim runtime support, schema execution, visual builder execution, compatibility conversion, scientific validation, empirical truth, causal proof, robustness proof, policy authority, psychological profiling, persuasion optimization, or human cognition.

UX2 does not make structurally valid artifacts runnable. It does not make runnable artifacts scientifically validated. It does not make model output empirical truth.
