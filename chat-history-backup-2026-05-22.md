# ORTUS Prompt Session Backup

Date: 2026-05-22  
Workspace: `/home/chavanro/abm`

This Markdown file is a handoff backup generated from the chat context available to Codex, including compacted conversation context. It is not a platform-native verbatim export of every hidden UI message, but it preserves the engineering history, guardrails, files changed, checks run, and current repo state needed to continue on another laptop.

## High-Level Thread

The conversation progressed through ORTUS service-first structural primitives and audits:

1. Prompt 27B: Units, Dimensions + Quantity Semantics Audit.
2. Prompt 28: Emergence Detection + Pattern Descriptors V1.
3. Prompt 28B: Emergence Detection + Pattern Descriptors Audit.
4. Prompt 29: Robustness, Resilience + Stress Testing Semantics V1.
5. Prompt 29B: Robustness, Resilience + Stress Testing Semantics Audit.
6. Prompt 30: Strategy, Control + Intervention Semantics V1.
7. Prompt 30B: Strategy, Control + Intervention Semantics Audit.

The latest completed prompt is Prompt 30B.

## Persistent Guardrails

- Do not redesign the UI.
- Do not rewrite the renderer.
- Do not rewrite the generic engine.
- Do not add new templates.
- Do not weaken or delete tests.
- Do not implement model schema/compiler yet.
- Do not implement visual builder yet.
- Do not implement calibration, MCMC, data assimilation, sensitivity dashboards, causal discovery, dimensional solvers, symbolic algebra engines, statistical significance engines, ML clustering, anomaly detection, runtime stress testing, runtime control, policy optimization, reinforcement learning, model predictive control, or automatic intervention execution yet.
- Do not force current templates to use service primitives at runtime.
- Do not make predictive, causal-proof, validation, calibration, safety-certification, operational-policy, treatment-effect, robustness-proof, emergence-proof, or optimal-strategy claims.
- Preserve valid-vs-runnable distinctions.
- Service primitives are structural/headless unless a later runtime prompt explicitly wires them.

## Prompt 30 Completed State

Prompt 30 added service-first Strategy, Control + Intervention Semantics V1.

Added files:

- `src/simulation/control/types.ts`
- `src/simulation/control/validation.ts`
- `src/simulation/control/query.ts`
- `src/simulation/control/summary.ts`
- `src/simulation/control/serialization.ts`
- `src/simulation/control/index.ts`
- `src/simulation/__tests__/control.test.ts`

Updated files:

- `src/simulation/index.ts`
- `src/simulation/registry/artifacts.ts`
- `src/simulation/registry/primitives.ts`
- `src/simulation/registry/templateCapabilities.ts`
- `src/simulation/registry/query.ts`
- `src/simulation/composition/types.ts`
- `src/simulation/composition/validation.ts`
- `src/simulation/assumptions/profiles.ts`
- `src/simulation/templates/forestFire.template.ts`
- `README.md`
- `docs/concepts.md`
- `src/simulation/README.md`
- `docs/roadmap.md`
- `docs/missing-pillars.md`
- `AGENTS.md`
- affected semantic tests

Prompt 30 made:

- Existing primitive `interventionStrategy` service-only.
- Artifact `ortus.controlStrategyModel` implemented/import/export supported as service-only.
- Current production templates remain not runtime-capable for `interventionStrategy`.
- Template-owned runtime interventions remain separate from general strategy/control support.

Prompt 30 does not:

- Execute strategies.
- Execute template interventions.
- Monitor triggers.
- Optimize objectives.
- Enforce constraints.
- Execute policies.
- Enforce stopping rules.
- Measure expected effects.
- Run closed-loop control.
- Run reinforcement learning or model predictive control.
- Estimate causal or treatment effects.
- Validate, certify, recommend, or prove strategies.

Prompt 30 verification passed:

- `npm run typecheck`
- `npm run test -- control`
- `npm run test -- primitiveRegistry`
- `npm run test -- hybridComposition`
- `npm run test -- roadmap`
- `npm run test -- assumptions`
- `npm run test -- robustness`
- `npm run test -- emergence`
- `npm run test -- quantities`
- `npm run test -- causality`
- `npm run test -- observability`
- `npm run test -- forest`
- `npm run test -- interventions`
- `npm run test`: 39 files / 285 tests
- `npm run build`
- `npm run lint` unavailable because `package.json` has no lint script

## Prompt 30B Completed State

Prompt 30B audited and hardened Prompt 30.

Changed files during the audit:

- `src/simulation/control/validation.ts`
- `src/simulation/control/query.ts`
- `src/simulation/__tests__/control.test.ts`
- `README.md`
- `docs/concepts.md`
- `src/simulation/README.md`
- `docs/roadmap.md`
- `docs/missing-pillars.md`
- `AGENTS.md`

Prompt 30B hardening:

- Added validation rejection for treatment-effect payloads.
- Added validation rejection for policy recommendation payloads.
- Added validation rejection for recommended action payloads.
- Added validation rejection for action ranking and ranked policy payloads.
- Added warnings that `evidenceDescription` is documentation only, not proof or measured effect.
- Added warnings that policy `ruleDescription` is descriptive text, not parsed or executed.
- Added warnings that objective `priorityDescription` is descriptive only, not optimized.
- Added warnings that safety/ethical constraint declarations are not certification or enforcement.
- Tightened docs around treatment-effect boundaries.
- Tightened `AGENTS.md` to guard against marking templates `controlStrategy/interventionStrategy` capable unless runtime uses `ControlStrategyModel`.

Prompt 30B final checks:

- `npm run typecheck`: passed.
- `npm run test -- control`: passed.
- `npm run test -- primitiveRegistry`: passed.
- `npm run test -- hybridComposition`: passed.
- `npm run test -- roadmap`: passed.
- `npm run test -- assumptions`: passed.
- `npm run test -- robustness`: passed.
- `npm run test -- emergence`: passed.
- `npm run test -- quantities`: passed.
- `npm run test -- causality`: passed.
- `npm run test -- observability`: passed.
- `npm run test -- forest`: passed.
- `npm run test -- interventions`: passed.
- `npm run test`: passed, 39 files / 285 tests.
- `npm run build`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

Prompt 30B final statement:

Strategy/Control V1 is structural only. Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies. Template-owned runtime interventions are not the same as general strategy/control support. Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops.

ORTUS was reported ready for Prompt 31: Model Schema + Interpreter Foundation V1.

## Key Architecture Boundaries Verified

- `src/simulation/control` imports no React, Zustand, DOM, Canvas, browser storage, renderer, UI component, experiment runner, intervention executor, optimizer, controller, RL, MPC, causal-effect, statistical/significance, safety/risk, calibration/MCMC/filtering, compiler, or visual-builder code.
- `src/simulation/control` does not use `Math.random`, `eval`, or `new Function`.
- The control model serializes and validates only structural JSON.
- Hybrid composition can attach `controlStrategyModel` structurally, but attachment does not make a composition runnable.
- Template capabilities still report service availability but no runtime support for `interventionStrategy`.

## Current Continuation Point

The next requested feature/audit should start from:

Prompt 31: Model Schema + Interpreter Foundation V1.

Important: do not treat Prompt 31 as permission to build a visual builder or arbitrary execution engine unless the exact prompt explicitly allows it. The repo guardrails still require strict safety foundations, no arbitrary code execution, no fake runtime support, and no claims beyond implemented behavior.
