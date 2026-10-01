---
paths:
  - "src/app/lab/**"
  - "src/app/atlas/**"
  - "src/components/atlas/**"
  - "src/components/researchWorld/**"
  - "src/lib/capabilityGuidance.ts"
  - "src/simulation/atlasPreview/**"
---

# Lab, Atlas, and capability guidance

Strings marked *test-asserted* appear verbatim in production copy and in tests.

## Lab
- Lab is a non-persistent foundation route. `LabRecordLifecycleState` and ledger scaffolds are information architecture, not saved records, histories, notebooks, comparisons, or evidence. Lab records will organize evidence about model investigations; they never certify real-world discoveries.
- Keep the visible boundary exactly (*test-asserted*): `Nothing on this route is a saved experiment, evidence record, notebook, or run history.`
- Actions such as `Save this run`, `Send to Lab`, `Create evidence record`, `Record experiment`, `Open notebook`, `Publish to Atlas`, `Create discovery`, and `Map evidence` wait for a dedicated implementation milestone and its audit.

## Atlas
- Atlas is non-persistent evidence semantics. Evidence states describe model-behavior interpretation, not real-world truth, and sampled concepts stay unresolved until a source-backed record system exists. Near the preview, Atlas copy says the preview is a bounded, ephemeral model sample and not a complete landscape, regime map, saved discovery, validated result, or real-world claim.
- Behavioral-landscape vocabulary and probe plans are conceptual scaffolds. They are not sampled data, saved plans, run queues, or evidence, and a planned comparison is not a result. Landscapes distinguish sampled, sparse, unsampled, stale, contradictory, and unsupported regions, and never imply that unsampled regions are known. Contradictory runs are evidence.
- No fake maps, heatmaps, contours, regions, scores, confidence, coverage, regimes, histories, timestamps, ids, or discovery counts, and no progress, unlocks, or achievements. Model regions are not real-world regimes, policy effects, or validation.

## Atlas preview execution
- The preview executes only capabilities declared in `src/simulation/atlasPreview/capabilities.ts`, not every numeric parameter, metric, template, or scenario. Probe plans stay non-executable and are never silently mapped into preview requests.
- Requests are canonical and strictly validated: one or two axes, canonical ascending explicit seeds, a final-tick numeric observation, and the declared grid, tick, and work limits.
- Each sample runs in a fresh headless engine through the validated RunConfig path, sequentially, yielding only between samples and retaining no engines. It never touches World, Experiment Runner, comparison, Builder, scenario, registry, or browser-storage state.
- Results are exact sampled coordinates held in component memory. No storage, history, publication, interpolation, smoothing, contours, inferred values, regime or tipping-point detection, or scores. Multiple seeds show deterministic model variation, not confidence intervals.
- Cancellation copy stays honest (*test-asserted*): `Cancel after current sample` means the running synchronous sample finishes first. Unstarted runs stay unsampled, partial results stay visibly partial, and unmount cancels remaining work and suppresses late updates. Keep the real preview action visible in the first short desktop viewport.

## Capability guidance
- Guidance is source-backed and non-personalized. It responds to model, workspace, and artifact state, never to user profiling or inferred psychology. It describes capabilities without creating them, and never offers save-to-Lab, publish-to-Atlas, or create-discovery actions.
- Lead with one relevant contextual note and keep the complete matrix (available, planning-only, not-implemented, do-not-assume, related destination) reachable. Never remove a limitation where it affects interpretation.
- No persistent guidance, dismissed-tip state, onboarding progress, analytics, missions, streaks, XP, levels, or smart-recommendation language. Lab and Atlas are never described as locked, and essential tools are never gated.
