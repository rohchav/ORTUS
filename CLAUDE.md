@AGENTS.md

# Claude Code workflow

AGENTS.md (imported above) is the canonical instruction set for every agent. This file adds only Claude Code workflow. Path-scoped rules in `.claude/rules/` load automatically when you work on matching files.

## Plan before sensitive changes
Enter plan mode and get approval before changing anything under `src/simulation/kernel/`, `src/simulation/runtime/`, `src/workers/`, `src/simulation/spaces/`, `src/simulation/spatialIndex/`, or a template's step logic. The same applies to any change that touches RNG streams, scheduling order, snapshot and export formats, or Worker protocol messages. The plan names the determinism and authority invariants at risk and the tests that will prove them.

## Audits and reviews
Use the `ortus-audit` skill (`.claude/skills/ortus-audit/SKILL.md`) for every audit, B-milestone, hardening pass, and PR review, including responses to Codex review comments. It fixes the order: invariants, code, and rendered UI first, the implementer's claims only afterwards.

## Continuation checkpoints
- At milestone close, and whenever a session may end mid-milestone, update `docs/codex/CURRENT_CONTEXT.md`. Record the branch, HEAD, what is committed, what is uncommitted and intended, the next concrete step, and the gates still to run. Append a dated entry to `docs/codex/SESSION_LOG.md`.
- On resume, read both files and `git status` before acting. Continue from the recorded state; do not restart, reset, stash, or clean a preserved worktree.

## Memory
Auto memory is disabled for this project (`.claude/settings.json`). Durable decisions, corrections, and conventions go into the repository: AGENTS.md or a `.claude/rules/` file for standing rules, the canonical docs for capability, architecture, and roadmap facts, and milestone records or `docs/engineering/HARDENING.md` for evidence. If it isn't in the repository, the next session doesn't know it.
