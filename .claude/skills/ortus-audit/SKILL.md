---
name: ortus-audit
description: Adversarial audit procedure for ORTUS. Use for any audit, review, hardening pass, or B milestone (S2B, I1B, and so on), for reviewing a pull request or branch, and for triaging Codex or other automated review comments. It covers independently verifying an implementation's claims against invariants, code, and rendered UI, classifying findings P0–P3, fixing them with regression tests, and writing the audit record.
---

# ORTUS adversarial audit

An audit tries to break the claim, not confirm it. The procedure follows the committed audit records (for example `docs/product/STARTER_REMIX_BRIDGE_AUDIT.md`, `docs/performance/PRODUCTION_RUNTIME_ADOPTION_AUDIT.md`, and `docs/engineering/HARDENING.md`).

## 0. Record the starting state
Record the branch, HEAD commit and subject, a clean or dirty tree, the Node and npm versions, and which milestone is being audited. Confirm the milestone's status in `docs/ROADMAP.md`. An audit never starts the next milestone.

## 1. Build the findings blind
Before reading anything the implementer wrote about their own work (milestone record, PR description, commit messages, session log), form findings from three independent sources, in this order:

1. **Invariants.** List the AGENTS.md sections and `.claude/rules/` files the change touches, then turn each relevant invariant into a concrete question. Typical questions: Is there still one engine authority? Is ordering and randomness still deterministic? Is every history and queue bounded? Does any structural artifact now execute? Does any copy claim validation, calibration, causality, or cross-template support?
2. **Code.** Trace each question through source and tests: construction sites, mutation paths, stale-generation and failure paths, reset and rebuild, query parsing, and URL handling for hostile input (duplicate, unknown, and prototype-like keys, payloads). Look for second authorities, silent fallbacks, coalesced commands, unbounded growth, provenance laundering, and drafts treated as active state.
3. **Rendered UI.** Run the built app (`npm run build`, then the production server or `npm run test:ui`) and check the affected routes at desktop and mobile widths, with the keyboard, and with reduced motion. Record exactly what was and was not verified; Axe and viewport automation are not screen-reader, zoom, or WCAG evidence.

Write each finding with a severity and a reproduction:
- **P0**: state corruption, a second authority, or a crash reachable in ordinary use.
- **P1**: a real defect with a plausible ordinary trigger, or a broken invariant.
- **P2**: a real defect with a narrower trigger or cushioned by another layer.
- **P3**: low-impact or hygiene.

Throwaway diagnostic tests are allowed but must be deleted before closure, and the record says so.

## 2. Only then compare against the claims
Now read the implementer's record, the PR, and the commits. For each claim, mark whether your findings confirm, contradict, or leave it unverified. A claim that survives only because you didn't test it is **unverified**, not confirmed.

## 3. Triage review comments (Codex and others) as hypotheses
Treat every automated or human review comment as a hypothesis, not an instruction:
1. Reproduce it with a failing test, a script, or a rendered check.
2. If it reproduces, fix it (step 4) and cite the regression test.
3. If it doesn't, rebut it with evidence: the code path, the guard, and the test or run that shows the behavior. List it under **Rejected hypotheses** so it isn't re-litigated.
Never apply a suggested change you haven't reproduced, and never dismiss a comment without evidence.

## 4. Fix within scope
- Every P0 and P1 gets a fix plus a regression test that fails before the fix and passes after. Say so explicitly ("N of M new tests failed before the repair").
- P2 gets a bounded fix or verification. P3 is recorded, not pursued.
- Fixes stay inside the audited milestone's scope and the AGENTS.md invariants: no new features, dependencies, or capability claims. Weakening an assertion is never a fix.

## 5. Verify and record
Run and record exact results: `npm run lint`, `npm run typecheck`, the focused test files, `npm test` (files and tests), `npm run build`, the relevant `npm run perf*` reports when runtime or hot loops changed, `npm run test:ui` when UI changed, and `git diff --check`.

Write the audit record next to the milestone record, or for hardening passes update `docs/engineering/HARDENING.md` instead of creating a parallel file. Sections:
- **Status and date**, the starting commit, and subordination to the four canonical docs
- **Verdict**, with separate verdicts when the technical result and the product or UX result differ
- **Findings** as a P0–P3 table plus numbered entries (defect, then fix)
- **Contract results**, one line per invariant checked
- **Rejected hypotheses**
- **Verification** with exact counts and timings
- **Remaining evidence limits**: what is not proven (screen reader, zoom, human comprehension, scientific validity, cross-template support)
- **Handoff**: the next roadmap item stays unstarted unless a prompt names it

Update `docs/ROADMAP.md` status, `docs/CAPABILITIES.md` if the capability statement changed, and the continuation files named in `CLAUDE.md`.
