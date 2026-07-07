# ORTUS Living Systems Atlas Visual Direction

Status: Prompt UX0 documentation, design-system planning, and UX-principle definition only, updated after Prompt UX4B. UX0 does not implement routes, navigation, a World/Lab/Atlas/Workshop shell, component redesigns, CSS rewrites, typography changes, color-token changes, icons, animations, persistent lab state, progression, unlocks, discoveries, behavioral landscapes, model composition, runtime behavior, template behavior, dependencies, remote fonts, image assets, or generated mockups. Prompt UX1 audits the existing UI source in `EXISTING_DESIGN_TOKEN_AND_COMPONENT_AUDIT.md` without implementing UX0. Prompt GW0 defines Research World progression architecture in `../RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md` without implementing UX0, GW1, routes, navigation, persistence, discovery logic, behavioral landscapes, UI shell behavior, runtime behavior, or template behavior. Prompt UX2 implements shared semantic token foundations in `LIVING_SYSTEMS_ATLAS_SEMANTIC_TOKEN_FOUNDATION.md`. Prompt GW1 implements the first bounded destination shell in `RESEARCH_WORLD_DESTINATION_SHELL.md`; it still does not implement persistent lab state, Discovery Atlas behavior, behavioral landscapes, progression, runtime behavior, template behavior, dependencies, remote fonts, image assets, or generated mockups. Prompt UX3 records a rendered full UI/UX comprehension and sandbox-theme audit in `FULL_UI_UX_COMPREHENSION_AND_SANDBOX_THEME_AUDIT.md`; it did not implement the visual-direction changes. Prompt UX4 implements the first bounded sandbox visual-language foundation in `SANDBOX_VISUAL_LANGUAGE_FOUNDATION.md` without adding product capability. Prompt UX4B audits that foundation in `SANDBOX_VISUAL_LANGUAGE_FOUNDATION_AUDIT.md`, finds it ready for UX5, and adds no product capability.

## Purpose

UX0 defines the replacement visual and interaction direction for ORTUS before Research World progression work begins.

Prompt UX4 applies the first bounded visual-language slice toward this direction: softer workbench surfaces, calmer status/caveat treatment, less tactical panel framing, and stronger World/Workshop/Lab/Atlas route hierarchy. Prompt UX4B audits that slice and finds it ready for UX5. GW9 remains paused. Next recommended prompt: UX5. UX4/UX4B do not implement progressive disclosure, Guided Builder, persistence, records, samples, runtime behavior, template behavior, Builder execution, dependencies, assets, fonts, icon libraries, UX5, UX6, or GW9.

The direction is:

```text
ORTUS Living Systems Atlas
```

The goal is a future interface where:

```text
Worlds feel alive.
Tools feel precise.
Knowledge feels accumulated.
Unknowns remain visible.
Progress feels earned through understanding.
```

Central transformation:

```text
from:
a sophisticated modeling dashboard

to:
a persistent living laboratory where users explore systems,
build research capability, map behavioral territory,
and accumulate reusable understanding
```

Required framing:

```text
ORTUS should feel like a living system observed through precise scientific instruments, not a system under tactical command.
```

```text
The interface should preserve wonder without hiding uncertainty, assumptions, or model limits.
```

```text
Visual progression should correspond to real modeling capability and accumulated understanding, not arbitrary status or engagement rewards.
```

## Design Identity

The ORTUS Living Systems Atlas combines four visual ideas:

```text
Living Systems Observatory
+ Scientific Expedition Atlas
+ Modular Research Workshop
+ Persistent Model Laboratory
```

### Living Systems Observatory

Used primarily for active simulation worlds, intervention, time, metrics, state changes, emergence, and environmental behavior.

Qualities: immediate, alive, spatial, responsive, visually immersive, instrumented but not overloaded.

### Scientific Expedition Atlas

Used primarily for behavioral landscapes, discovery maps, regime maps, explored versus unexplored regions, scale views, model-family relationships, and research history.

Qualities: cartographic, layered, archival, exploratory, annotated, evidence-aware.

### Modular Research Workshop

Used primarily for schemas, model graphs, structural composition, compatibility reports, scenario planning, reusable model parts, and advanced configuration.

Qualities: architectural, constructive, modular, inspectable, technically precise.

### Persistent Model Laboratory

Used primarily for saved worlds, experiments, comparison boards, notebooks, regimes, reusable networks, uncertainty profiles, and persistent research assets.

Qualities: accumulated, organized, evolving, personal without becoming profile-driven, visibly more capable over time.

Required principle:

```text
The metaphor may organize the experience, but precise scientific labels must remain visible.
```

Use:

```text
Observatory
Metrics, distributions, uncertainty, and comparison tools
```

Not only:

```text
Observatory
```

## Design Pillars

### Pillar A: Alive Worlds

Simulation surfaces should communicate motion, flow, interaction, formation, fragmentation, feedback, and change over time.

The system world is the primary visual subject.

### Pillar B: Precise Instruments

Controls and analytical surfaces should communicate bounded inputs, current state, explicit units, deterministic seed, active assumptions, uncertainty, and provenance.

### Pillar C: Accumulated Knowledge

Saved work should look persistent and connected: notebook entries, saved regimes, model specimens, comparison boards, mapped regions, and supporting evidence.

### Pillar D: Visible Unknowns

The interface should visibly represent unexplored parameter regions, stale reports, unsupported concepts, lossy mappings, future-only capabilities, weak evidence, incomplete data, and uncertainty intervals.

### Pillar E: Contextual Depth

Advanced tools should appear when relevant while remaining directly accessible to expert users.

### Pillar F: Scientific Wonder

The product should retain surprise, beauty, discovery, visual richness, experimentation, and creative construction.

It must pair those qualities with caveats, inspectability, evidence, model boundaries, and honest uncertainty.

## Retired Marathon Conventions

The previous Marathon-inspired direction contributed useful hierarchy, sharp typography, bold icon silhouettes, disciplined spacing, high-quality motion, and distinctive dark-mode identity.

It also carried the wrong associations for P0-era ORTUS: tactical command interfaces, military framing, warning-heavy orange/red systems, compressed HUD layouts, aggressive control language, constant neon illumination, scan-line and combat-terminal ornament, and the impression that the user controls a system from above.

Required copy:

```text
ORTUS is an exploratory laboratory, not a tactical command interface.
```

Retire or substantially reduce:

- Tactical HUD framing.
- Military mission language.
- Combat-console metaphors.
- Crosshairs and targeting reticles.
- Warning-triangle saturation.
- Dominant hazard orange/red.
- Ultra-condensed sci-fi typography.
- Excessive uppercase.
- Scan lines.
- Animated borders.
- Decorative data noise.
- Permanent glowing UI chrome.
- Fake terminal commands.
- Compressed control walls.
- "Command," "target," "deploy," or "engage" language where ordinary scientific language is appropriate.

Preserve selected strengths:

- Sharp hierarchy.
- Precise state presentation.
- Strong silhouettes.
- Disciplined spacing.
- Clear contrast.
- High-quality motion.
- Distinctive identity.
- Dark-mode capability.
- Bold but readable typography.

## World, Lab, Atlas, Workshop Direction

UX0 defines these destinations conceptually. It does not create routes, tabs, navigation, persistence, or runtime behavior.

### World

Primary purpose:

```text
Observe and perturb an active system.
```

Visual direction: largest simulation canvas, minimal permanent chrome, contextual instruments, active timeline, direct manipulation where supported, environmental/domain cues, current-regime summary, and immediate model caveats.

### Lab

Primary purpose:

```text
Organize experiments and reusable research assets.
```

Visual direction: comparison boards, saved configurations, notebooks, run histories, parameter regimes, uncertainty sets, reusable components, and evidence chains.

### Atlas

Primary purpose:

```text
Map accumulated understanding and unexplored behavioral territory.
```

Visual direction: cartographic layers, contour regions, discovery relationships, parameter landscapes, evidence states, explored/unexplored space, and scale/hierarchy views.

### Workshop

Primary purpose:

```text
Construct and inspect model structure.
```

Visual direction: architectural grids, schemas, graphs, structural mappings, scenario plans, reusable components, composition, and explicit unsupported boundaries.

## Information Hierarchy

The simulation world should normally be the dominant surface.

Support hierarchy:

```text
1. System world
2. Current state and time
3. Contextual action or intervention
4. Evidence and metrics
5. Explanation and caveats
6. Advanced configuration
```

Avoid:

```text
1. Configuration form
2. More configuration
3. Secondary panels
4. Tiny simulation viewport
```

The first user-facing question should often be:

```text
What is happening here?
```

before:

```text
How do I configure every field?
```

Advanced configuration must remain available through direct access.

## Contextual Interaction

The contextual panel should change according to selection:

- Select an agent → state, history, relationships.
- Select a cluster → composition, boundaries, metrics.
- Select a network node → degree, neighbors, signals.
- Select a field region → values, gradients, thresholds.
- Select an intervention → scope, bounds, expected model effect.
- Select a timeline event → what changed and why it was recorded.
- Select a discovery → evidence and caveats.
- Select a behavioral region → supporting runs.
- Select empty world space → overall world summary.

Required principle:

```text
Contextual tools should respond to the modeled object under inspection instead of presenting every control permanently.
```

UX0 does not define unsupported direct manipulation as implemented.

## Color Direction

UX0 defines semantic color families, not final production tokens.

Foundation colors should use a grounded base inspired by charcoal, forest slate, mineral gray, warm off-white, parchment gray, muted stone, and dark soil/brown-black. Avoid pure black as the only background foundation.

Domain accents may eventually include:

- Ecology: moss, fern, amber.
- Epidemic: coral, ochre, restrained crimson.
- Neural: violet, indigo, controlled cyan.
- Atmospheric: blue-gray, teal, cloud white.
- Urban: rust, concrete, sodium yellow.
- Networks: copper, plum, sea green.
- Uncertainty: muted lavender-gray or desaturated yellow.

Domain colors should appear through nodes, traces, selected regions, metric lines, legends, subtle border accents, and environmental cues. Do not recolor entire applications or screens for each template.

Future semantic roles: current/active, selected, observed, uncertain, stale, unsupported, lossy, future-only, warning, failure, success, and unverified.

Required accessibility principle:

```text
Color must reinforce meaning, never carry it alone.
```

UX0 does not finalize exact color values.

## Typography Direction

Typography should be wide rather than condensed, architectural, sharp, stable, human-readable, serious without becoming sterile, and distinctive without looking military.

Possible hierarchy:

- Display/headings: geometric or humanist sans.
- Body/interface: highly readable sans.
- Metrics/seeds/logs: restrained monospace.

Avoid stencil fonts, military lettering, ultra-condensed faces, excessive uppercase, tiny all-caps microcopy, and decorative scientific notation styling. Preserve bold headings where useful.

Critical technical guardrail:

```text
Do not reintroduce next/font/google or any remote font dependency.
```

The production build was previously fixed by removing remote Google font fetching. Any future font change must use system stacks, locally bundled project-safe assets, or another explicitly offline-safe approach.

UX0 must not add or distribute font files.

## Shape Language

UX0 defines three complementary shape systems.

### Structural Geometry

Used for panels, controls, tables, navigation, and tool surfaces.

Characteristics: clear rectangles, restrained clipped corners, disciplined alignment, visible grouping, strong but not aggressive borders.

### Organic Contours

Used for fields, clusters, uncertainty regions, behavioral landscapes, system boundaries, and emergence.

Characteristics: irregular, smooth or branching, data-driven, never arbitrary decorative blobs.

### Cartographic Lines

Used for trajectories, flows, links, contours, regime boundaries, scale transitions, and dependency paths.

Core contrast:

```text
human-built instrument frame
around
organic system behavior
```

Avoid using organic shapes for every interface panel.

## Panel Families

### Instrument Panels

For time, seed, parameters, interventions, and current metrics. They should be compact, precise, numerically legible, explicit about state, units, and bounds, and use restrained tick/grid cues.

### Field-Note Panels

For observations, assumptions, interpretations, limitations, and notebook entries. They should have more breathing room, prose-friendly layout, light or warm-neutral variants, subtle accessible rule/grid texture, and no decorative script fonts.

### Atlas Panels

For behavioral landscapes, discovery maps, scale views, and model-family relations. They should be layered, map-like, legend-rich, coordinate-aware where meaningful, explicit about explored/unexplored distinction, and evidence-level aware.

### Specimen Cards

For saved models, regimes, discoveries, networks, components, and scenario plans. Potential contents include thumbnail, source/provenance, evidence status, relevant metrics, linked experiments, caveats, modified timestamp, and reusable scope.

### Workshop Panels

For schemas, graphs, compatibility, composition, and structure. They should be modular, architectural, dependency-aware, and explicit about validation and runtime boundaries.

## Material And Texture

Use restrained material cues inspired by paper grain, matte metal, map texture, mineral surfaces, biological microstructure, scientific grids, ink-like contours, and translucent overlays only where layering matters.

Avoid heavy glassmorphism, glossy game-menu plastic, chrome, steampunk machinery, fake screws, decorative gauges, holographic panels, laboratory cosplay, and texture that harms text clarity.

Required principle:

```text
Material cues should support hierarchy and metaphor without reducing readability or suggesting false physical controls.
```

## Environmental Canvases

Future subtle domain-aware world canvases may include:

- Predator-Prey: terrain, resource patches, topographic cues.
- Epidemic: abstract population/mobility field.
- Opinion Dynamics: relational constellation or network field.
- Schelling: spatial neighborhood fabric.
- Flocking: atmospheric/terrain gradient with motion traces.
- Neural: dark tissue-like field with bounded signal glow.
- Urban Routine: street/transit/land-use structure.
- Atmospheric Field: contour layers and flow lines.

Rules:

- Backgrounds must remain functional.
- Backgrounds must not obscure agents or metrics.
- Decorative contrast must remain low.
- Visual cues must not imply real geographic or biological fidelity.
- No full-screen template image should compete with the simulation.
- No stylized canvas should be treated as empirical data.

## Motion

Motion should explain state change, flow, propagation, emergence, intervention, selection, discovery, spatial transformation, and progression between analytical levels.

Good uses: network signals propagating, fields flowing, clusters forming, metric traces updating, intervention extent appearing, explored regions being revealed, and panels reorganizing when destination/context changes.

Avoid constant pulsing, idle glow, random particles, scan lines, moving borders, decorative parallax, excessive entrance animations, and motion with no informational role.

Required principle:

```text
Motion should communicate state, information flow, or system change—not decorate an otherwise static interface.
```

Reduced-motion requirements:

- No loss of information when motion is disabled.
- Transitions become immediate or simplified.
- Propagation state remains text/shape-readable.
- Animated discoveries retain a static representation.
- No essential timed hover-only information.

## Iconography

Future icons should draw from lenses, maps, layers, boundaries, samples, trajectories, networks, fields, notebooks, flows, comparison, scales, and instruments.

Avoid guns, shields, ranks, tactical chevrons, targeting marks, crosshairs, combat insignia, trophy/XP-first imagery, and warning symbols as decorative motifs.

Icons must have text labels where meaning is not obvious, work at small sizes, not carry status through color alone, preserve strong silhouettes, and remain distinguishable at zoom.

## Atlas And Discoveries

The Atlas is a major future visual identity.

Potential components: regime maps, contour surfaces, parameter-space terrain, uncertainty overlays, explored paths, saved experiment markers, transition ridges, stable basins, unknown regions, and evidence states.

Important distinction:

```text
Behavioral landscapes are scientific maps of investigated model behavior, not fantasy overworlds.
```

Do not depict unsupported parameter-space classifications as known territory.

Evidence states should distinguish unexplored, weakly sampled, possible regime, supported modeled regime, robust across tested conditions, contradicted, and stale. These must be shown through text, pattern, outline, and labels, not color alone.

Future discovery evidence progression:

```text
unconfirmed observation
→ possible pattern
→ supported modeled regime
→ robust across tested conditions
```

Every discovery specimen should eventually show supporting runs, parameter ranges, seeds, initial conditions, evidence strength, contradictions, caveats, linked worlds, and unresolved questions.

Avoid achievement language such as unlocked, mastered, completed, earned, and defeated.

Prefer observed, documented, supported, under investigation, contradicted, and unresolved.

Required principle:

```text
Discovery styling should represent evidence accumulation, not achievement acquisition.
```

## Visual Progression

Future visual growth may appear as empty shelves gaining reusable assets, model collections gaining relationships, Atlas regions gaining detail, notebooks accumulating evidence, laboratory sections gaining actual tools, comparison boards becoming populated, and composition maps gaining new supported structures.

Required equation:

```text
visible lab growth = accumulated modeling capability
```

Not:

```text
visible lab growth = decorative XP reward
```

Cosmetic personalization may exist later but should remain secondary.

Core tools must not be hidden solely to manufacture progression.

## Responsive Behavior

UX0 defines density modes conceptually only:

- Focused world view.
- Standard research view.
- Dense expert view.

UX0 does not implement a density selector.

Responsive principles:

- Simulation world remains useful at narrower widths.
- Contextual panels may become drawers.
- Timeline may collapse into a lower sheet.
- World/Lab/Atlas/Workshop navigation remains reachable when implemented.
- No horizontal scrolling for ordinary workflows.
- Long analytical tables receive intentional containment.
- Primary warning/caveat text stays visible.
- Controls remain at least accessible target size.
- Content does not disappear solely because of width.

Short-height layouts must preserve time controls, pause, current state, warnings, and escape/close controls.

## Accessibility

Future implementation requirements:

- All text and controls require accessible contrast.
- Textured/organic backgrounds must not reduce readability.
- Domain accents cannot replace semantic contrast testing.
- Future usability targets include 125%, 150%, 200%, narrow widths, and short-height desktop.
- All contextual tools must be keyboard reachable.
- Visible focus must remain obvious.
- No canvas-only essential action.
- No hover-only essential information.
- Logical focus return after drawers/dialogs.
- System state has text equivalents.
- Visual discoveries expose evidence/state text.
- Charts/maps require summaries.
- Simulation state requires bounded descriptions.
- Color/shape encodings receive legends.
- Reduced-motion support is required.
- No flashing.
- No essential information only in animation.
- Progressive disclosure, stable terminology, contextual explanations, direct advanced access, no forced tutorial overlays, and no artificial urgency.

Required copy:

```text
Visual richness must not make scientific state, uncertainty, or controls harder to perceive.
```

Do not claim WCAG conformance during UX0.

## Product Language

Align interface tone with P0.

Preferred: observe, inspect, compare, explore, perturb, compose, document, map, investigate, estimate, supported, uncertain, modeled, possible, unresolved.

Avoid tactical language: target, engage, deploy, command, threat, mission critical, hostile, eliminate, dominate, operation complete.

Avoid fake certainty: proven, exact, true result, solved, validated reality, optimal policy, definitive prediction.

Use metaphor carefully.

Use:

```text
Atlas — Map investigated model behavior
```

rather than:

```text
Atlas — Reveal the truth of the system
```

## Migration Strategy

### Stage 0 — UX0

Documentation and visual direction only.

### Stage 1 — Token And Component Audit

Prompt UX1 completes the source-level inventory of current colors, typography, spacing, borders, elevation, panel variants, motion, accessibility and responsive risks, hardcoded values, dependencies, and Marathon-specific ornament in `EXISTING_DESIGN_TOKEN_AND_COMPONENT_AUDIT.md`. UX1 does not implement shell redesign, CSS changes, token changes, component changes, routes, dependencies, assets, or rendered verification.

### Stage 2 — UX2 Core Design Foundations

Prompt UX2 introduced semantic colors, typography roles, shape tokens, material/elevation tokens, motion tokens, reduced-motion semantics, and status patterns. It uses UX0, UX1, and GW0 as inputs, keeps the production build offline-safe, preserves legacy compatibility aliases, and migrates only a bounded shared primitive set.

### Stage 3 — GW1 Destination Shell

GW1 introduces the shared World, Lab, Atlas, and Workshop destination shell after UX2. It preserves `/` as World and `/builder` as Workshop, adds `/lab` and `/atlas` as reachable future-only informational routes, and avoids persistence, discovery logic, behavioral landscapes, progression, fake data, and unsupported runtime claims. GW1B audited and hardened this shell; GW2 adds live active-run context in World Observe only, and GW2B must audit that context before later Research World implementation.

### Stage 4 — Active Run Context And Contextual Panels

GW2 adds live active-run provenance and observation context in World Observe. Future contextual panels should continue to replace permanent control walls without implying saved Lab records, Atlas discoveries, runtime support, or empirical validation.

### Stage 5 — Atlas And Persistent Lab Surfaces

Only after data models exist.

Required migration rule:

```text
Do not rewrite the entire interface at once. Migrate through bounded, testable surfaces while preserving current workflows.
```

## Research World Relationship

Recommended order:

```text
P0: Product Philosophy and Learning Mission
UX0: Living Systems Atlas Visual Direction
UX1: Existing Design Token and Component Audit
GW0: Research World Progression Mini-Roadmap
UX2: Shared Design Foundations
UX2B: Semantic Foundation Rendered Browser Audit
GW1: Persistent Destination Shell
GW1B: Persistent Destination Shell Audit
GW2: Active Run Provenance and Observation Layer
GW2B: Active Run Provenance and Observation Layer Audit
GW3: Active Intervention Boundary and Perturbation Readiness
GW3B: Active Intervention Boundary Audit and Hardening
GW4: Discovery Atlas
GW4B: Discovery Atlas Audit
GW5: Lab Evidence Record Information Architecture
GW5B: Lab Evidence Record Information Architecture Audit
GW6: Contextual Capability Guidance
GW6B: Contextual Capability Guidance Audit
```

Composition frontiers and Grand Systems Challenges remain future directions beyond this near-term branch unless a dedicated roadmap prompt reintroduces them with explicit scope and audit gates.

UX0 must not implement GW0-GW6.

GW0 defines Research World progression as investigation architecture, not XP, achievements, hard locks, profiling, persistence, discovery certification, or runtime behavior. It defines destination responsibilities only; GW0 defines destination responsibilities. It does not implement destination navigation or persistence.

Required copy:

```text
UX0 defines the visual and interaction target. Research World prompts will determine how that target is implemented.
GW0 defines what the product must communicate. UX2 defines how shared design foundations communicate it. GW1 implements the first structural shell using both.
```

## Existing-Feature Mapping

These mappings are conceptual only. Do not rename current UI in UX0.

| Existing capability | Future role |
| --- | --- |
| Template setup | World creation |
| Parameters | Instruments |
| Metrics | Observatory |
| Interventions | Experiment controls |
| Run history | Research notebook |
| Fit report | Structural comparison desk |
| Scenario planning | Planning table |
| Schema authoring | Model workshop |
| Graph view | Structure viewer |
| Neural Runtime Lab | Specialized laboratory |
| F0 future metrics | Scale observatory |
| Future hybrid composition | Systems assembly area |

## Non-Goals And Guardrails

UX0 does not implement new routes, new navigation, a World/Lab/Atlas/Workshop shell, component redesigns, CSS rewrites, typography changes, color-token changes, icons, animations, persistent lab state, progression, unlocks, discoveries, behavioral landscapes, model composition, runtime behavior, template behavior, dependencies, remote fonts, image assets, or generated mockups.

UX0 must not weaken runtime-honesty language, hide uncertainty, replace precise labels with metaphor, claim visual/accessibility verification, make color the only status cue, add decorative motion, or depict unexplored/weakly sampled behavior as established knowledge.
