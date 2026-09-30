---
paths:
  - "src/app/**"
  - "src/components/**"
---

# UI design system and accessibility

Applies to all route and component code. World-specific layout lives in `world-ui.md`; brand rules live in `brand.md`.

## Direction
- ORTUS is a living laboratory: a living system observed through precise scientific instruments, not a system under tactical command. Military, targeting, tactical-HUD, and combat-console metaphors are retired. Keep the useful parts of the earlier direction (hierarchy, precision, contrast, disciplined spacing, strong silhouettes, dark-mode strengths) without flattening into generic SaaS, and avoid a generic cold blue/cyan dashboard palette.
- A metaphor may organize the experience, but precise scientific labels stay visible. Organic backgrounds never reduce readability. World backgrounds are visual context, not simulation data, unless the engine explicitly wires them.
- Softer sandbox styling, rounded panels, route accents, and quieter caveats are presentation only. They create no runtime, Builder, Lab, Atlas, persistence, or validation capability.
- Migrate UI incrementally, preserving working behavior. Branding and redesign work do not absorb unrelated audit recommendations.

## Tokens and components
- `src/app/globals.css` is the one canonical semantic-token source. Keep raw palette values, semantic tokens, component-role tokens, and component styles distinct. Keep legacy variables until their consumers are migrated.
- Use `CornerFramePanel` for major panels. Domain accents identify modeled content and stay subordinate to the shared semantic system.
- A visual state says what kind of state it is: operational, interaction, evidence, uncertainty, or capability. Operational success means the software operation completed, not that a conclusion is validated. Selected is not supported, active is not validated, and hovered is not important. Contradicted is not failure, unresolved is not error, stale is not unsupported, and future-only is not disabled. Future-only is a capability status, not evidence support.
- Discovery styling shows evidence accumulating, never achievements. Unexplored or weakly sampled behavior never looks like established knowledge.
- No styling frameworks, component, icon, chart, graph, or animation libraries, Tailwind, Sass, CSS-in-JS, theme providers, token build steps, remote fonts, font files, or `next/font/google` without explicit approval.

## Layout and accessibility
- Use one intentional vertical scroll region per workspace panel, and never nest vertical scroll regions inside a panel that already scrolls. Fixed headers and footers never cover scrollable content. Fix layout errors instead of hiding them with `overflow: hidden`. Responsive stacking alone is not a mobile workflow.
- Keep keyboard operation complete and focus visible, keyboard-reachable, and distinct from selection. Skip links and focused controls are fully visible on focus, never hidden behind reveal transitions. When an action hides the panel that holds focus, move focus to a visible, documented target, never to `BODY`.
- Color is never the only status cue; pair it with text and a non-color cue. Honor reduced motion by removing nonessential interface motion without erasing modeled information. Motion communicates state, information flow, or system change; it is not decoration.
- Modal surfaces trap focus, return it on close, support Escape, and mount no live tick-subscribing children while closed. Hidden panels do no expensive tick-based rendering. Navigation components avoid unnecessary simulation-store subscriptions.
- Use one global header, navigation, and main landmark, with no duplicate route-level headings. Destination links are native links with `aria-current="page"`. Repeated report landmarks get unique accessible names, and intentional scroll regions are keyboard-scrollable.
- Keep plain-language orientation first, with exact technical language visible or one explicit disclosure away. Disclosure state is component-local and never persisted. No introductory sequence gates expert tools.
- HCI findings must distinguish observed defects, inferred risks, subjective style preferences, and unverified concerns. Keep HCI evidence separate from aesthetic preference.
- No clipboard, zoom, responsive, focus-return, screen-reader, assistive-technology, forced-colors, or WCAG readiness claim without direct verification. Use the existing Playwright/Axe harness for rendered checks.
