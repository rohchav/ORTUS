---
paths:
  - "src/app/**/page.tsx"
  - "src/app/worlds/**"
  - "src/lib/starterWorlds/**"
  - "src/components/starterWorlds/**"
  - "src/components/start/**"
  - "public/starters/**"
---

# Routes, Starter Worlds, and guided investigations

## Route contract
- `/` is Start, `/worlds` is the runnable-world catalog, `/worlds/[slug]` is Starter World detail, `/world` is World, `/lab` is Lab, `/atlas` is Atlas, `/builder` is Workshop, and `/workshop` stays absent.
- Start is task-centered. Keep equal-weight destination grids, capability matrices, artifact taxonomy, and disclaimer walls out of the space above the featured starter.
- Public queries carry strict IDs only. `/world` accepts `starter` with optional `recipe`, `guide`, `remix`, and `task`, each owned by and revalidated against the frozen registries. `/builder` accepts `starter`, `recipe`, `from`, and `focus` for Starter Remix. Reject template, scenario, RunConfig, parameter-payload, duplicate, unknown, encoded-object, and promise- or prototype-like keys before Next.js async search-parameter access, and before constructing AppShell, a stage, a template, or an engine.

## Starter World content
- Starter World definitions, packs, launch recipes, prepared comparisons, and guides are strict, versioned, data-only, deterministically ordered, and recursively frozen. They are not templates, scenarios, RunConfigs, schemas, results, evidence, or runtime capability, and they add no hidden defaults, mechanics, analytics, personalization, or persistence.
- Only `runnable` definitions launch, and `/worlds` lists only those. Planned and concept-only candidates belong in documentation, not disabled cards. Availability derives from definitions that revalidate template, preset, metric, parameter, and intervention references against production registries, with visible failure and no fallback.
- Every launch, recipe launch, and sibling navigation builds a fresh paused tick-0 run through existing scenario services, once per page mount. Never resume modified parameters or a running state, and never auto-run or auto-save. Sibling-recipe activation moves focus to the new recipe context and keeps any Setup draft distinct from the new active value.
- Derive prepared-comparison differences and shared conditions from effective validated scenarios, and disclose material tick-zero differences in counts, geometry, topology, or state. Matching scenario fields do not prove matching initialized worlds. A prepared pair is not a result, controlled experiment, or causal finding.
- User-facing content uses authoritative preset, parameter, intervention, and metric labels, never internal IDs. Verify source type, relationship, destination, and DOI metadata; research connections are context, not validation. A documented first activity needs a deterministic engine regression and a rendered control, rebuild, and output path. Static visuals are illustrative and never mimic quantitative output.
- Browsing, filters, search, nudge dismissal, launch context, and remix state are page-session only. Remix status is explicit: runtime-now, current structural tools, or future capability.

## Guided investigations
- A guide is instructional metadata over existing packs, worlds, recipes, tasks, outputs, and horizons. It derives recipe roles, controlled differences, shared settings, tick-zero claims, labels, and URLs from the source registries, and rejects authority drift instead of falling back to stale copy.
- Support only scoped modes, actions, and factual checks: no arbitrary conditions, callbacks, auto-execution, auto-pause, auto-capture, hard gates, scoring, quizzes, completion, profiles, or learning inference. Guide step and collapse state live on the mounted page only.
- Guide exit removes only guide presentation and URL state, preserving run, tick, playback, drafts, task, and comparison summaries. Reload rebuilds the recipe as a fresh paused tick-0 run.
- Once template, recipe, initialization, seed, parameters, or interventions diverge, the prepared reference is no longer the active runtime: suspend the controlled-pair claim and keep continue, restore, and exit available. Never infer a baseline, guide ownership, or a controlled pair from a saved comparison summary. Direct contrast entry claims no baseline.
- Guides use only the existing explicit Compare workflow, and their copy claims no learning, mastery, causality, robustness, significance, validation, or universal threshold. Guided UI stays optional and compact inside the active-tool flow.
