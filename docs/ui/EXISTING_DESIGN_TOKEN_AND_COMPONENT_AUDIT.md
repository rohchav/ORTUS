# UX1: Existing Design Token And Component Audit

Status: Prompt UX1 source-level audit and documentation only, updated after Prompt GW0. UX1 does not redesign the interface, add design tokens, modify CSS, restyle components, change routes, add dependencies, add assets, change font configuration, implement World/Lab/Atlas/Workshop, start UX2, or claim rendered accessibility/responsive verification. Prompt GW0 later adds Research World progression architecture in `../RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md` without changing the UX1 source audit evidence.

Required framing:

```text
UX1 audits the current interface. It does not redesign it.
```

```text
The audit must distinguish production evidence from assumptions and unverified visual behavior.
```

```text
The migration target is the Living Systems Atlas, but the audit must preserve current workflows and validated functionality.
```

## 1. Purpose And Scope

UX1 inventories the production UI that exists after UX0, before any token migration, shell restructuring, or component redesign. The audit is intentionally blunt: the current interface has useful scientific-workbench structure, but it also has raw-value drift, tactical ornament, fixed-grid assumptions, duplicated local component treatments, and accessibility/responsive claims that remain unverified.

UX1 evidence is source evidence unless marked otherwise. No browser screenshots, assistive-technology pass, zoom pass, color-contrast calculations, or visual regression infrastructure were run for this document.

## 2. Audit Methodology

Evidence categories used below:

- verified from source: directly visible in repository source.
- documented elsewhere: stated in existing ORTUS docs or tests.
- inferred from source structure: probable behavior or migration risk based on source organization.
- requires rendered verification: cannot be confirmed without rendering the UI.
- requires browser verification: needs browser layout, keyboard, zoom, clipboard, or route interaction.
- requires assistive-technology verification: needs screen reader or comparable AT testing.

Inspected source groups:

- Documentation: `README.md`, `planned_roadmap.md`, `docs/roadmap.md`, `docs/concepts.md`, `docs/PRODUCT_PHILOSOPHY_AND_LEARNING_MISSION.md`, `docs/RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md`, `docs/ui/LIVING_SYSTEMS_ATLAS_VISUAL_DIRECTION.md`, `docs/ui/HCI_AUDIT.md`, `docs/ui/WORKSPACE_INFORMATION_ARCHITECTURE.md`, `docs/codex/CURRENT_CONTEXT.md`, `docs/codex/SESSION_LOG.md`, `src/simulation/README.md`, and `AGENTS.md`.
- Styling: `src/app/globals.css`; no CSS modules were present.
- Shell and navigation: `src/components/AppShell.tsx`, `src/components/TopStatusBar.tsx`, `src/components/LeftInstrumentStack.tsx`, `src/components/TimelineControlStrip.tsx`, `src/components/WorldStage.tsx`, `src/components/RightContextDrawer.tsx`.
- Builder: `src/components/builder/BuilderShell.tsx`, `BuilderHeader.tsx`, `BuilderModeTabs.tsx`, `BuilderViewport.tsx`, `ModelSchemaAuthoringShell.tsx`, `ModelSchemaSectionEditor.tsx`, and `src/components/builder/graph/BuilderGraphView.tsx`.
- Specialized surfaces: `src/components/NeuralRuntimeLabPanel.tsx`, `src/components/MetricGraphPanel.tsx`, `src/components/RunComparisonPanel.tsx`, `src/components/ExperimentPanel.tsx`, `src/components/ScenarioBuilderPanel.tsx`, `src/components/SimulationCanvas.tsx`, `src/components/Legend.tsx`, and `src/lib/templateVisuals.ts`.
- Shared primitives: `src/components/ui/CornerFramePanel.tsx`, `StatusPill.tsx`, `IconButton.tsx`, `SectionLabel.tsx`, plus branding components.
- Dependencies and scripts: `package.json`.
- Tests: roadmap, control, workspace IA, Builder, graph, schema authoring, fit-report, scenario-planning, Neural Runtime Lab, and branding tests.

## 3. Source Inventory

| Source | Responsibility | Styling approach | Shared/local | Hardcoded values | Migration risk |
| --- | --- | --- | --- | --- | --- |
| `src/app/globals.css` | Global tokens, shell, Builder, schema forms, charts, panels, responsive rules | CSS custom properties plus broad selectors and local feature blocks | Shared/global | Extensive raw RGBA/hex, sizes, clip paths, grids | Critical |
| `src/app/layout.tsx` | Root layout, global background, metadata | Imports `globals.css`, renders `TemplateBackgroundLayer` | Shared | None in JSX | Low |
| `src/components/AppShell.tsx` | Simulation shell and run loop | Global class names; local React state for workspace mode | Shared shell | No visual literals | High |
| `src/components/TopStatusBar.tsx` | Brand, global routes, current model/scenario/workspace, run status | Global classes plus `StatusPill` | Shared shell | No visual literals | Medium |
| `src/components/LeftInstrumentStack.tsx` | Simulation workspace modes and selected panel stack | Global classes; ARIA tabs; panel composition | Shared shell | No visual literals | High |
| `src/components/TimelineControlStrip.tsx` | Persistent run controls | Global classes; text glyph icons | Shared shell | Text glyph icons | Medium |
| `src/components/WorldStage.tsx` | World viewport, background, canvas frame, error overlay | Global classes | Shared shell | Text close glyph | High |
| `src/components/SimulationCanvas.tsx` | Batched simulation rendering, selection/target overlays, neural runtime edges | Canvas drawing with raw colors and template visuals | Local visualization | Many raw RGBA/hex literals | High |
| `src/lib/templateVisuals.ts` | Template descriptors, legends, render-model mapping, template accents | TypeScript descriptors and raw color values | Shared UI data | Extensive raw hex colors | High |
| `src/components/ui/CornerFramePanel.tsx` | Main panel primitive | Global CSS classes; decorative spans | Shared | No visual literals in TSX | High |
| `src/components/ui/StatusPill.tsx` | Status chip/pill | Tone class maps to global CSS | Shared | Tone names only | Medium |
| `src/components/ui/IconButton.tsx` | Icon-style button shell | Text/ReactNode icon, title, aria-label | Shared | No visual literals | Low |
| `src/components/builder/*` | Builder shell, workspace inspector, Author Schema, validation, fit, planning | Global CSS blocks plus component-local ARIA/state | Mixed shared/local | Inline graph geometry, many feature classes | Critical |
| `src/components/builder/graph/BuilderGraphView.tsx` | Read-only structural graph view | HTML buttons and SVG paths; inline position/size/transform | Local visualization | Inline geometry; CSS raw colors | High |
| `src/components/MetricGraphPanel.tsx` | Metric history chart | Hand-built SVG; local color array | Local visualization | Raw chart colors and SVG gradient stops | Medium |
| `src/components/RunComparisonPanel.tsx` | Run library, comparison tables, trace chart | Global classes; hand-built SVG; local color array | Local feature | Raw trace colors | Medium |
| `src/components/ExperimentPanel.tsx` | Sweep controls, progress, chart/table | Global classes; SVG; inline progress width | Local feature | SVG raw colors | Medium |
| `src/components/ScenarioBuilderPanel.tsx` | Scenario authoring and preview canvas | Global classes; canvas preview | Local feature | Canvas raw RGBA | Medium |
| `src/components/NeuralRuntimeLabPanel.tsx` | Neural setup/lab, RPS/adaptation controls | Global classes; dense feature block | Local specialized surface | Mostly class-based, relies on CSS raw values | High |
| `public/branding/*.png` | Sharp and soft ORTUS marks | Static assets | Shared brand | Asset files only | Low |
| `package.json` | Framework and dependency constraints | No styling framework or icon/chart deps | Shared | No style values | Medium constraint |

No Tailwind configuration, CSS module files, Storybook, component-library package, icon package, chart package, graph package, animation package, local font files, or remote-font package was found.

## 4. Existing Token Inventory

### Color

Global color variables in `src/app/globals.css`:

| Token/value | Source evidence | Current meaning | Consistency | Evidence state |
| --- | --- | --- | --- | --- |
| `--bg-primary: #070808` | root token | App background | Mostly consistent | verified from source; contrast unverified |
| `--bg-secondary: #111314` | root token | Secondary surface | Lightly used | verified from source; contrast unverified |
| `--bg-panel`, `--bg-panel-strong` | root tokens | Smoky/translucent panels | Consistent for panels, mixed with raw RGBA elsewhere | verified from source |
| `--text-primary`, `--text-secondary`, `--text-muted` | root tokens | Main text hierarchy | Mostly consistent, but raw off-whites repeat | verified from source; contrast unverified |
| `--accent-primary: #d8ff3e` | root token | Active/selected/signal/focus/success-like emphasis | Overloaded | verified from source |
| `--accent-secondary` and `--danger: #ff4a2e` | root tokens | Warning/danger/epidemic/burning/action emphasis | Overloaded | verified from source |
| `--accent-tertiary: #6c72ff`, `--accent-rare: #c34dff` | root tokens | Cobalt/violet secondary signals | Partly semantic, partly decorative/template | verified from source |
| `--frame-corner`, `--structure-line`, `--shadow` | root tokens | HUD-like frames, dividers, shadows | Mostly consistent | verified from source |
| `--field-*` | root tokens | Atmospheric background texture | Centralized base, locally overridden by template classes | verified from source |

Hardcoded color clusters:

- Repeated acid green: `rgba(216, 255, 62, ...)` and `#d8ff3e` appear in selection, focus, active controls, info notes, chart lines, neural activation, legend entries, and template accents. This is systemic. It is not one clean semantic token.
- Repeated vermilion/orange: `rgba(255, 74, 46, ...)`, `#ff4a2e`, and `#ff5a24` appear in warnings, danger pills, invalid schema states, epidemic infected, forest fire burning, neural firing, and tactical boundary accents. This is systemic and semantically overloaded.
- Repeated off-white: `#f3f1e8` and `rgba(243, 241, 232, ...)` are used for text, grid lines, borders, chart points, strokes, and decoration. This is systemic.
- Cobalt/violet values (`#6c72ff`, `#c34dff`) cover template accents, graph future-only, chart traces, inhibitory signal, and Opinion negative/secondary state. The meaning is inconsistent.
- Template-specific colors live in `src/lib/templateVisuals.ts` and production-template metadata; the same domain may have different runtime metadata and UI-render colors.
- Source bug/risk: `.legend-notes p`, `.decision-readout__bars > span`, and `.decision-readout p` use `var(--muted)`, but the defined token is `--text-muted`. This is verified from source and should be fixed in a later implementation prompt, not UX1.

Color verdict: useful foundation exists, but the current palette is not a clean semantic token system. A raw value reused repeatedly is not automatically a semantic token.

### Typography

Source evidence:

- `--font-display`, `--font-ui`, and `--font-signal` are declared in `src/app/globals.css` with CSS variable hooks and local/system fallbacks: `"Space Grotesk"`, `"IBM Plex Sans"`, `"IBM Plex Mono"`, Inter/Segoe/Roboto Mono/Arial/sans/monospace fallbacks.
- `src/app/layout.tsx` does not import `next/font/google`.
- `package.json` has no font package.
- No local font files were found in `public`.

Typography patterns:

- Display headings use `var(--font-display)`, `font-weight: 700`, uppercase, and tight line height.
- Labels use `var(--font-label)` with uppercase and positive letter spacing.
- Signal/metric/code text uses `var(--font-signal)`.
- Body/microcopy uses `var(--font-ui)` with smaller sizes and normal letter spacing.
- Font sizes are mostly hardcoded at component-class level: `8.5px`, `9px`, `9.5px`, `10px`, `10.5px`, `11px`, `11.5px`, `12px`, `12.5px`, `13px`, `14px`, `16px`, `18px`, `20px`, `22px`.

Typography verdict: offline-safe font loading is currently source-supported, but the typography system is still a dense tactical label system with many small all-caps labels. UX0 wants wider, human-readable scientific instrumentation, so UX2 should define roles before changing values.

### Spacing

Recurring values: `4px`, `5px`, `6px`, `7px`, `8px`, `9px`, `10px`, `11px`, `12px`, `14px`, `18px`, `22px`, and panel-specific offsets like `34px`, `42px`, `58px`, `86px`, `120px`, `180px`, `390px`.

There is a rough compact scale, but it is not formalized. Many values are likely accumulated by feature need rather than semantic spacing roles. Dense feature panels such as schema validation, graph view, Neural Runtime Lab, experiments, and run comparison repeat similar but not identical spacing.

### Borders And Shape

Source evidence:

- Most controls use hard-edged clipped corners through repeated `clip-path: polygon(...)`.
- `CornerFramePanel` adds decorative edge code, ticks, and corner marks.
- Borders are mostly `1px` or `2px`, using raw off-white, acid, warning, and danger RGBA.
- Selected states use inset box-shadows rather than a single selected token.
- Focus outlines use `2px solid var(--accent-primary)` globally for buttons, links, fields, textareas, and canvas.

Verdict: structural geometry is reusable, but it still reads tactical/HUD. UX0 says retire tactical framing without flattening ORTUS into generic SaaS. The right future move is controlled adaptation, not total removal.

### Elevation And Surfaces

Current surface language:

- Translucent dark panels: `rgba(7, 8, 8, 0.9)`, `rgba(13, 16, 17, 0.82)`, `rgba(9, 12, 13, 0.88)`.
- Shadows: `0 8px 22px`, `0 10px 28px`, `0 24px 80px`, plus inset border shadows.
- Blur: `backdrop-filter: blur(5px/6px)`.
- Background atmospheres: radial gradients, repeated grid lines, scan-like overlays, terrain blobs.

Functional surface depth helps panel separation. Decorative glow/scan/terrain layers need reduction or tighter purpose under UX0.

### Motion

Motion sources:

- `--motion-tight: 140ms cubic-bezier(...)`.
- Transitions for buttons, panels, right drawer, active states.
- `signalSweep` active button animation.
- `signalJitter` danger pill animation.
- Reduced-motion media query sets animation duration and transition duration to `0.001ms`.
- Simulation motion itself comes from canvas redraws driven by engine snapshots and the app run loop.

Classification:

- Informational/feedback: right drawer entrance, button active transitions, canvas updates.
- Unclear/decorative: active button sweep, danger jitter, scan-line background texture.
- Source-supported reduced-motion rule exists, but rendered reduced-motion equivalence is unverified.

## 5. Hardcoded Values

| Cluster | Scope | Representative evidence | Label | Future token candidate |
| --- | --- | --- | --- | --- |
| Acid green `#d8ff3e` / `rgba(216, 255, 62, ...)` | CSS, charts, canvas, template visuals | active controls, focus, chart traces, neural activation | systemic; overloaded | `state.active`, `focus.ring`, domain accent |
| Vermilion/orange `#ff4a2e` / `#ff5a24` | CSS, template visuals, canvas | danger, warning, infected, burning, neural firing | systemic; overloaded | `state.warning`, `state.failure`, domain accent |
| Off-white `#f3f1e8` / `rgba(243, 241, 232, ...)` | CSS, SVG/canvas, template visuals | text, grid, border, symbol stroke | systemic | `text.primary`, `border.default`, `grid.subtle` |
| Tiny font sizes `8.5px` to `12.5px` | CSS | labels, badges, captions, tables | repeated | `font.label`, `font.caption`, `font.micro` |
| Clipped polygons | CSS | buttons, panels, cards, tables | systemic; likely intentional but tactical | `shape.instrument`, `shape.workshop` |
| Fixed grids/min widths | CSS | `.top-status`, `.builder-shell__body`, `.builder-graph-mode__layout`, `.schema-authoring-shell` | systemic responsive risk | layout tokens and container strategies |
| Inline geometry | Builder viewport/graph | `left`, `top`, `width`, `height`, `transform` style props | intentional for graph layout | graph layout API, not visual token |
| Inline color style | Legend/charts | `style={{ background: item.color }}`; chart color arrays | template-specific and repeated | domain accent registry |
| Z-indexes | CSS | background 0, shell 1, timeline 2, overlays 4-8, modal 80 | repeated | layer tokens |
| Motion durations | CSS | `140ms`, `1.6s`, `1.8s` | repeated/unclear | motion role tokens |

## 6. Component Inventory

| Family | Current implementations | Shared? | Semantics | Keyboard/focus evidence | Responsive evidence | UX0 fit | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| App shell | `AppShell`, `TopStatusBar`, `LeftInstrumentStack`, `WorldStage`, `TimelineControlStrip` | Shared | Strong current model/run/workspace structure | Partially evident | Source-defined breakpoints; rendered unverified | Partly supports World focus | Adapt |
| Navigation/tabs | Workspace modes, Builder modes | Shared patterns, separate code | Mostly clear | Source-defined arrow/Home/End behavior | Horizontal overflow on narrow | Supports workflow staging | Retain/adapt |
| Panels | `CornerFramePanel`, many local feature panels | Shared primitive plus local variants | Good grouping, tactical ornament | Focus partly defined | Source-based only | Useful instrument structure | Adapt |
| Cards | Builder nodes, graph nodes, schema declarations, fit candidates, scenario items, neural cards | Duplicated | Mixed: structural, warning, scenario, metric | Partially evident | Varies by surface | Workshop/specimen fit possible | Adapt/consolidate |
| Buttons/icon buttons | Global button CSS, `IconButton`, local button styles | Partly shared | Mostly command buttons; some text glyph icons | Focus-visible source-defined | Target sizes unverified | Usable but visually tactical | Adapt |
| Forms | Run settings, parameters, schema fields, scenario/expt/intervention forms | Duplicated local rows | Generally labeled | Schema strongest; others partial | Medium/narrow source rules | Needed instruments | Adapt |
| Status badges/pills | `StatusPill`, `BuilderStatusBadge`, local status/warning/error notes | Duplicated | Text labels exist, color still overloaded | Partially evident | Source only | Critical for unknowns | Replace with shared status system |
| Tooltips | Mostly `title` attributes in status badges/icon button | Minimal | Weak | Not enough | Unknown | Needs accessible primitive | Replace/add later |
| Dialogs | Schema confirmation modal | Local | Strong destructive copy | Source-defined alertdialog/focus cycling in tests/docs | Rendered unverified | Keep behavior | Retain/adapt |
| Tables | Experiment table, run table using div roles or grid divs | Local | Some role=table | Partially evident | Overflow risk varies | Data dense | Adapt |
| Charts | Metric, experiment, run comparison SVG | Local | Role img and labels, limited axes/units | Partially evident | Resize source-defined height/width only | Observatory fit | Adapt |
| Graphs | Builder viewport, Graph View, neural runtime canvas graph | Local/specialized | Strong non-execution copy for Builder | Graph outline/text edges source-defined | Bounded fallback source-defined | Workshop fit | Retain/adapt |
| Canvas | Simulation canvas, scenario preview canvas | Local | Role img labels; canvas-only visual detail | Focusable canvas source-defined | Resize source-defined | World fit | Adapt with text equivalents |
| Empty/loading/error states | `EmptyState`, error banners, graph fallback, schema empty states | Mixed | Mostly textual | Partially evident | Source only | Useful | Retain/adapt |

Do not infer full keyboard or screen-reader usability from these source hooks. Source-defined is not the same as browser-verified.

## 7. Retain / Adapt / Replace / Retire Matrix

| Component/pattern | Classification | Reason | Future destination |
| --- | --- | --- | --- |
| Task-oriented simulation workspace modes | Retain | Better than one permanent drawer; maps to setup/understand/observe/intervene/experiment/compare/debug | World/Lab bridge |
| Persistent run-control dock | Retain | Keeps Run/Pause/Step/Reset/time outside scrollable panels | World |
| Runtime-honesty copy in Builder/schema/fit/scenario planning | Retain | Protects against pseudo-ABM claims | Workshop |
| `CornerFramePanel` behavior and grouping | Adapt | Useful shared grouping, but tactical edge code/ticks/corner marks need a less combat-HUD expression | Instrument/workshop panels |
| ORTUS brand lockup | Retain | Shared navigation identity, not runtime state | Global shell |
| Template visual descriptor registry | Adapt | Centralizes domain accents/legends, but still raw-color heavy and not fully aligned to semantic roles | Domain accent system |
| Metric and run trace SVG charts | Adapt | Lightweight and honest copy exists, but axes/scales/units/provenance are thin | Observatory charts |
| Builder Graph View outline and edge list | Retain/adapt | Accessible alternatives and bounded fallback are structurally sound | Workshop graph viewer |
| Permanent left control stack as primary architecture | Replace gradually | Current workflow grouping is useful, but still makes controls dominate beside the world at desktop | Contextual instruments |
| Local status note styles | Replace | Too many parallel warning/info/success treatments and overloaded colors | Shared status/evidence primitive |
| Decorative scan lines, active sweeps, jitter, edge ticks as mood | Retire/adapt | Some motion/texture is purely atmosphere and conflicts with UX0 unless tied to state | None or data-driven texture |
| Crosshair/target overlays in intervention and selection visuals | Adapt carefully | Selection/targeting is functional but language/shape can look tactical | Scientific selection/extent markers |
| All-caps micro-label saturation | Adapt | Helps scanning but can become tiny tactical instrumentation | Scientific label hierarchy |

Do not classify everything as replace. The interaction architecture contains useful workbench bones. The debt is mostly semantic, visual, and consistency debt.

## 8. Marathon-Derived Conventions

| Convention | Evidence | Function vs mood | Keep/adapt/retire | Replacement direction |
| --- | --- | --- | --- | --- |
| Dark tactical surfaces | Global backgrounds and panels | Functional contrast plus mood | Adapt | Living laboratory dark foundation with warmer/more grounded surfaces |
| Acid signal green | Active/focus/chart/neural states | Functional but overloaded | Adapt | Semantic active/focus/selected/observed split |
| Hazard orange/red dominance | Danger, warnings, epidemic, fire, neural firing | Sometimes domain-meaningful, often overused | Adapt | Warning/failure separate from domain coral/amber |
| Clipped HUD corners | Buttons, panels, rows | Structure plus tactical identity | Adapt | Restrained instrument/workshop geometry |
| Scan/grid texture | Template backgrounds, Builder surfaces | Sometimes spatial context, often decorative | Adapt/retire | Cartographic or evidence-aware texture |
| Text glyph icons | Run controls, viewport pan/zoom | Functional, dependency-free | Adapt | Consistent accessible icon primitives later |
| Crosshair/target motifs | Canvas target overlays and legend glyphs | Functional selection/targeting | Adapt | Selection extents/sampling markers |
| Animated sweep/jitter | Active controls/status danger | Mostly mood | Retire unless state-informational | Static state plus reduced-motion equivalent |
| Dense all-caps labels | Most panels | Scannable but tactical | Adapt | Wider scientific label hierarchy |

Required distinction:

```text
Retire tactical framing without flattening ORTUS into generic SaaS.
```

## 9. Information Density

| Surface | Density classification | Evidence | Future mode fit |
| --- | --- | --- | --- |
| World stage | Appropriately dense to under-dense depending overlay state | Canvas dominant; legend/debug/inspector overlays are optional | Focused world view |
| Left workspace panel | Dense but functional | One selected workflow mode, scroll body, many compact panels | Standard/expert research view |
| Top status | Dense but functional | Brand/routes/context/run status in fixed grid with narrow breakpoints | Standard view |
| Timeline dock | Appropriately dense | Persistent run controls plus tick/time/speed | Focused/standard view |
| Builder Workspace Inspector | Dense but functional | Three columns with nav/viewport/inspector | Workshop expert view |
| Author Schema | Unnecessarily dense at first contact, functional for experts | Three-column authoring/validation/fit/planning stack | Workshop expert view |
| Graph View | Dense but functional | Controls/outline/graph/inspector/edge list | Workshop expert view |
| Neural Runtime Lab | Dense but guided | Scenario cards, status, actions, RPS, adaptation details | Specialized lab |
| Experiment/Run Comparison | Dense but functional | Forms, progress, tables/charts | Lab/expert view |

UX1 does not implement density modes. Source inspection indicates that a future focused world view and dense expert view are both needed.

## 10. Responsive Risks

Inventory:

- `html, body`, `.ortus-shell`, `.builder-shell` use viewport-height assumptions and `overflow: hidden`.
- Main simulation layout switches to world-first stacking at `max-width: 980px`.
- Builder and schema layouts stack at `max-width: 1120px` and also at `980px`.
- Graph View has fixed/minimum visual surface heights (`420px`, `500px`, `560px`) and multi-column wide layouts.
- Header limits at narrow width: `.top-status` uses `max-height: 38dvh` and `overflow-y: auto`.
- Several tables/charts have fixed heights or minimum widths.
- Short-height desktop rule exists at `max-height: 720px` and `min-width: 981px`, but only compacts Builder header/status areas.

Likely risks:

```text
Source inspection indicates a potential risk. Rendered verification has not been performed.
```

- Short-height desktop may squeeze world, timeline, and left panel despite the 720px rule.
- Header `max-height: 38dvh` could create nested scrolling in narrow layouts.
- The world can collapse to a relatively short band in stacked mode.
- Builder graph and schema surfaces may require long scrolling and lose context.
- Tables and SVG charts may become hard to read at 125%, 150%, or 200% zoom.
- Fixed-size graph/canvas surfaces may be technically reachable but visually cramped.

## 11. Accessibility Risks

Source-supported:

- Global `:focus-visible` outlines for buttons, links, fields, and canvas.
- Workspace and Builder tabs use ARIA tab roles and arrow/Home/End handlers.
- Graph View provides grouped outline and text edge list in addition to SVG lines.
- Schema fields use labels, error descriptions, `aria-invalid`, and alert/status regions.
- Schema destructive confirmations are documented/source-tested as modal alertdialog behavior.
- Canvas has `role="img"` and focusability in `SimulationCanvas.tsx`.
- Many warnings/errors are text, not color alone.

Source-risk:

- `CornerFramePanel` renders decorative corner-mark spans without `aria-hidden`, while other decorative spans are hidden.
- `StatusPill` and `BuilderStatusBadge` use a colored dot plus text; color is not alone, but status tone semantics are inconsistent.
- `title` is used as a lightweight tooltip on status badges/icon buttons; accessible tooltip behavior is not established.
- Canvas visual encodings have limited text alternatives beyond high-level labels and legends.
- Chart SVGs have role/labels but no data table or axis/unit summaries.
- Raw color reliance remains heavy in charts, graph warnings, selected states, and canvas overlays.
- Text can be very small and uppercase-heavy.
- Decorative backgrounds and overlays may affect contrast; contrast ratios were not calculated.

Unknown without rendering/browser/AT:

- Keyboard focus order through dense Builder/schema/graph surfaces.
- Focus visibility on textured panels and selected states.
- Screen-reader behavior for SVG charts, canvas descriptions, status updates, graph controls, and modal confirmations.
- Zoom/reflow at 125%, 150%, and 200%.
- Target sizes and pointer interaction comfort.
- Reduced-motion equivalence.

UX1 does not claim WCAG compliance, screen-reader compatibility, keyboard completeness, focus correctness, zoom correctness, or contrast compliance.

## 12. Status And Evidence States

Current state vocabulary:

- Active/selected: `is-active`, `aria-selected`, `aria-pressed`, inset acid outlines.
- Success/current: moss/accent pills, clean draft, generated report states.
- Warning: orange/yellow borders/notes, warning summaries, stale report notices.
- Failure/error: danger pills, red/orange borders, `role="alert"` messages.
- Stale: fit/scenario planning source warnings.
- Unsupported/future-only/service-only: Builder and Graph View statuses, markers, fit report gaps.
- Disabled: opacity and `cursor: not-allowed`.
- Informational: microcopy, boundary notes, empty states.

Findings:

- Text labels often exist; this is good.
- Colors are overloaded: green/acid can mean active, focus, success-ish, information, neural activation, chart trace, or domain accent.
- Red/orange can mean danger, warning, invalid, infected, burning, neural firing, or boundary caveat.
- Stale, unsupported, lossy, future-only, and invalid are textually distinct in stronger Builder surfaces but not yet part of a unified visual status system.
- Success styling must not imply scientific validation.

Required distinction:

```text
successful operation is not the same as scientifically validated result
```

Surfaces where green/success styling may overstate confidence: schema valid/export states, fit-report generated states, experiment complete notices, and active/selected metric/chart traces.

## 13. Template-Specific Styling

Current evidence:

- `src/lib/templateVisuals.ts` defines template descriptor accents and legend entries.
- Production template metadata also defines visual colors, sometimes different from UI rendering colors.
- `TemplateBackgroundLayer` assigns atmosphere classes from descriptors.
- Neural runtime uses template-owned network edge drawing in `SimulationCanvas.tsx`; this is not Builder graph support.

Findings:

- Some template colors are domain-meaningful: epidemic infected, forest burning, predator/prey, neural excitatory/inhibitory, opinion polarity.
- Some differences are decorative atmosphere: background blooms, line angles, scan opacity, terrain blobs.
- Same shared values are reused across unrelated domains: acid green as positive, active, firing/activation, chart trace, selected state.
- Domain accents are useful but currently behave like raw palettes, not a governed domain-accent layer.

Required principle:

```text
Templates may have domain accents, but they should not behave like unrelated products.
```

## 14. Canvas, Graph, And Data-Visualization Surfaces

Simulation canvas:

- Snapshot-driven; no per-agent React rendering.
- Uses raw canvas fills/strokes, template render agents, selection rings, intervention target overlays, neural runtime edges.
- Has `role="img"` and keyboard selection-clearing logic.
- Visual encodings rely on legend and glyphs but still need a richer text alternative strategy.

Builder/Graph View:

- Graph nodes are HTML buttons; SVG edges are hidden from AT and backed by text edge lists.
- Visual graph rendering is bounded with outline fallback.
- Graph selection/filter/pan/zoom is UI-only state.
- Inline geometry is intentional layout data, not general styling.

Charts:

- Metric, experiment, and run comparison charts are hand-rolled SVG.
- Role/labels exist; chart scales, units, and data tables are limited.
- Color arrays are raw and repeated.

Atlas-relevant primitives already present: canvas world stage, legends, structural graph, edge lists, run trace charts, fit/scenario reports, bounded experiment/run summaries, and template domain accents. These are not Atlas implementation.

## 15. Shell And Layout Architecture

Current route model:

- `/` simulation workspace.
- `/builder` structural Builder.
- No World/Lab/Atlas/Workshop routes exist.

Current shell assumptions:

- Simulation shell is world-plus-left-workflow-panel-plus-run-dock.
- Builder is an isolated structural workspace with Workspace Inspector, Author Schema, and Graph View modes.
- Neural Runtime Lab is a specialized Setup panel, not a route.
- Fit report and scenario planning live in Author Schema side column.

Conflicts with UX0 destinations:

- World: current world is dominant, but controls still sit as a persistent left workbench rather than contextual instruments.
- Lab: experiments/run comparison exist, but no persistent model lab or notebook exists.
- Atlas: no accumulated behavioral map, discovery surface, regime map, or explored/unexplored state exists.
- Workshop: Builder/schema/graph/fit/planning strongly map to Workshop but visual language remains tactical and dense.

UX1 must not implement the four-destination shell.

## 16. Duplication And Consistency

Duplication clusters:

- Panel containers: `CornerFramePanel` plus many local card/note wrappers.
- Buttons: global button styles, timeline buttons, schema buttons, Builder buttons, neural buttons, experiment/run/scenario/intervention buttons.
- Status chips: `StatusPill`, `BuilderStatusBadge`, schema notes, fit/scenario stale notes, warning/error paragraphs.
- Tabs: workspace tabs, Builder mode tabs, schema section nav.
- Form rows: run settings, parameter controls, schema fields, experiment fields, scenario fields, intervention fields.
- Tables: experiment table and run table implement separate grid-table patterns.
- Charts: Metric, experiment, and run comparison each own chart assumptions/colors.
- Empty states: shared `EmptyState` plus local fallbacks.
- Close/dismiss controls: text glyphs and ordinary buttons.

Likely shared future primitives:

- `StatusEvidencePill` or status row with explicit evidence state.
- `InstrumentPanel`, `FieldNotePanel`, `WorkshopPanel` variants over a cleaned panel primitive.
- Shared form field row and helper/error text styles.
- Shared chart frame/legend/axis summary.
- Shared compact table/list primitive.

Migration risk is high where behavior is mixed with local state and source-tested guardrails. Do not refactor first; define tokens and primitives first.

## 17. Dependency Constraints

`package.json` dependencies:

- Runtime: `next`, `react`, `react-dom`, `zod`, `zustand`.
- Dev: TypeScript, Vitest, vite-node, React/Node types.

Absent:

- CSS framework.
- Component library.
- Icon library.
- Chart library.
- Graph library.
- Animation library.
- Font package.
- Tailwind.
- Storybook.
- Visual regression infrastructure.

Build/offline implications:

- Remote fonts are absent.
- `next/font/google` is absent in app source.
- No local font files are distributed.
- Hand-built SVG/canvas avoids graph/chart dependencies but raises consistency and accessibility workload.

UX1 adds no dependencies and removes none.

## 18. Future Semantic Token Candidates

UX1 identifies categories only. It does not define final values.

Color categories:

- `surface.world`, `surface.lab`, `surface.atlas`, `surface.workshop`, `surface.panel`, `surface.overlay`, `surface.canvas`
- `text.primary`, `text.secondary`, `text.muted`, `text.inverse`
- `border.default`, `border.strong`, `border.focus`, `border.warning`
- `state.active`, `state.selected`, `state.observed`, `state.uncertain`, `state.stale`, `state.unsupported`, `state.lossy`, `state.future`, `state.warning`, `state.failure`, `state.success`, `state.unverified`
- `focus.ring`
- `domain.ecology`, `domain.epidemic`, `domain.neural`, `domain.opinion`, `domain.fire`, `domain.network`

Typography categories:

- display, section heading, panel heading, body, label, metric, code/seed, caption, annotation, warning copy.

Spacing categories:

- compact, control, panel, section, workspace, canvas inset, graph node gap, table cell, status gap.

Shape categories:

- instrument, field note, atlas, specimen, workshop, dialog, focus, selection extent.

Motion categories:

- immediate, feedback, panel transition, data update, discovery reveal, reduced-motion equivalent.

Density categories:

- focused, standard, expert.

## 19. Migration Risk Matrix

Criteria:

- User importance: how central the surface is to current workflows.
- Styling debt: raw values, tactical ornament, duplication, token mismatch.
- Behavior complexity: local state, validation, runtime or import/export coupling.
- Accessibility risk: source risks plus need for browser/AT verification.
- Migration priority: what should move earlier to reduce later risk.

| Surface | User importance | Styling debt | Behavior complexity | Accessibility risk | Migration priority | Recommended strategy |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Global shell | critical | high | medium | high | high | Adapt after semantic foundations; preserve workflows |
| Navigation/tabs | high | medium | medium | medium | medium | Retain behavior, retokenize and verify |
| Template runner/world | critical | high | high | high | high | Preserve canvas/runtime boundary; migrate overlays carefully |
| Builder | high | high | high | high | medium | Treat as Workshop; avoid behavior refactor during token work |
| Neural Runtime Lab | medium | high | high | high | low/medium | Specialized pass after shared primitives |
| Schema forms/validation | high | high | critical | high | medium | Preserve source-tested safety; retokenize slowly |
| Graph View | medium | high | high | high | medium | Keep outline/text fallback; verify rendered graph |
| Fit report/scenario planning | medium | medium | high | medium | low/medium | Consolidate report/status primitives |
| Cards/panels | high | high | medium | medium | high | Define shared panel/card/status primitives |
| Buttons/forms | critical | high | medium | high | high | UX2 primitive migration target |
| Status system | critical | critical | medium | high | critical | UX2 should split semantic states |
| Drawers/dialogs | high | medium | high | high | medium | Preserve modal/focus behavior; verify |
| Timelines/charts | high | medium | medium | high | medium | Add scale/summary conventions later |
| Template backgrounds | medium | high | low | medium | low | Reduce decorative texture after tokens |

## 20. Migration Waves

Required migration principle:

```text
Migrate shared foundations before specialized surfaces, but do not block necessary feature work on a total redesign.
```

Wave A - Shared semantic foundations:

- UX2 should define semantic colors, typography hierarchy, spacing categories, borders, status states, focus treatment, and motion principles.
- Do not build World/Lab/Atlas/Workshop here.

Wave B - Low-risk shared primitives:

- Buttons, inputs, labels, badges, cards, panel containers, headings, status/evidence notes.
- Migrate only representative surfaces first.

Wave C - Shell and navigation:

- Coordinate with GW1.
- Preserve current `/` and `/builder` workflows.

Wave D - Contextual inspection:

- Replace permanent control-wall assumptions gradually.
- Keep expert access direct.

Wave E - Specialized surfaces:

- Builder, Neural Runtime Lab, fit reports, scenario planning, Graph View, charts.

Wave F - Atlas and persistence:

- Only after data models exist.

## 21. UX2 Entry Criteria

UX2 should not start until the following are accepted as UX1 findings:

- Current token sources and raw-value hotspots are documented.
- Shared/local component inventory exists.
- Retain/adapt/replace/retire classifications exist.
- Status/evidence-state inconsistencies are documented.
- Accessibility and responsive risks are explicitly source-level only.
- Dependency constraints and offline-font constraints are documented.
- Migration priority is defined.
- Prompt GW0 Research World progression architecture is available as product-architecture input.
- Production UI, CSS, dependencies, assets, and font configuration remain unchanged by UX1.

UX2 should be limited to semantic token foundations and bounded primitive migration. UX2 must not automatically implement the four-destination shell.

## 22. GW0/GW1 Relationship

```text
UX1
-> audits the existing interface

GW0
-> defines Research World progression architecture

UX2
-> establishes shared semantic design foundations

GW1
-> introduces the persistent destination shell
```

Required copy:

```text
UX1 provides implementation evidence. GW0 provides progression architecture. UX2 provides visual foundations. GW1 provides the first structural transformation.
GW0 defines what the product must communicate. UX2 defines how shared design foundations communicate it. GW1 implements the first structural shell using both.
```

Current constraints UX2/GW1 must account for:

- Existing workflows are not disposable.
- Builder Workshop behavior is already extensive and must keep non-execution boundaries.
- The simulation shell already has task modes and a persistent run dock.
- No persistent Lab/Atlas data model exists yet.
- Current visual density cannot be solved by route names alone.
- GW0 defines destination responsibilities. It does not implement destination navigation or persistence.
- Research World progression must remain investigative capability, not XP, achievements, hard locks, or evidence-free discovery claims.

## 23. Verification Backlog

Future verification matrix:

| Verification | Required checks | Current evidence |
| --- | --- | --- |
| Keyboard | Full task walkthrough for `/`, `/builder`, schema forms, graph, dialogs, Neural lab | Source hooks only |
| Focus | Visible focus and logical return in drawers/dialogs/tabs/graph | Source hooks and tests only |
| 125% zoom | Header, left panel, world, timeline, Builder | Not performed |
| 150% zoom | Same as above plus dense forms/charts | Not performed |
| 200% zoom | Reflow, scroll containment, target reachability | Not performed |
| Narrow desktop | 980px and below, world-first layout, Builder tabs | Source CSS only |
| Short-height desktop | 720px and below, run dock/world/header | Source CSS only |
| Reduced motion | Active sweep/jitter, drawer transitions, canvas information equivalence | Source media query only |
| Screen reader | Tabs, graph, canvas labels, chart labels, dialogs, status messages | Not performed |
| High contrast | Panels, text, charts, status states | Not performed |
| Color-blind differentiation | Domain accents, chart traces, status colors | Not performed |
| Contrast ratios | Text, warnings, small labels, textured surfaces | Not calculated |
| Rendered screenshots | Desktop, narrow, short-height, Builder, Graph View, Neural lab | Not performed |

## 24. Non-Goals And Guardrails

UX1 is not a redesign, style guide implementation, token implementation, mockup, browser audit, accessibility certification, responsive verification, visual regression pass, component refactor, dependency cleanup, GW0 implementation, UX2 implementation, or GW1 implementation.

UX1 must not modify production CSS or UI components. It must not change colors, typography, routes, navigation, component behavior, dependencies, assets, fonts, or package metadata. It must not claim rendered behavior from source inspection. It must not claim WCAG or assistive-technology verification.

This audit is deliberately not nice for its own sake. ORTUS has a real workbench architecture worth preserving, but if the next step skips semantic foundations and jumps straight to visual spectacle, the product will drift toward a pretty pseudo-ABM interface with better lighting and the same unresolved evidence problems.
