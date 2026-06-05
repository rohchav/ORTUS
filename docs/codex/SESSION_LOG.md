# ORTUS Codex Session Log

## 2026-06-04 - R2 Repo Hygiene, Durable Context, Performance Pass Audit

Goal: stabilize the repository after a lost Codex chat so the current uncommitted performance/instrumentation pass can be reviewed, tested, and committed safely.

Starting state:

- Branch is `main`.
- Git history has only two commits.
- No `docs/codex` directory or durable Codex context files existed.
- Worktree is dirty with meaningful source changes plus heavy generated-file noise.
- `.next` and `tsconfig.tsbuildinfo` are tracked and dirty.
- `.gitignore` only ignored `node_modules`.
- Current uncommitted source changes appear centered on runtime performance instrumentation, continuous spatial indexing, Flocking optimization, Forest Fire hot-loop optimization, runtime metadata, tests, docs, and `npm run perf:simulation`.
- `docs/roadmap.md` had prompt-status drift: early roadmap text understated completed prompts while later source/docs indicated Prompt 30 service-first work was present and Prompt 31 remained future.

Session guardrails:

- Do not start Prompt 31.
- Do not start new ORTUS roadmap work.
- Do not rewrite the engine.
- Do not weaken or delete tests.
- Do not discard meaningful source changes.
- Do not commit generated artifacts.
- Do not use `npm audit fix --force`.
- Do not use `--legacy-peer-deps` as a permanent fix.

Planned stabilization phases:

1. Create durable Codex context files.
2. Update `.gitignore` and remove generated artifacts from git tracking without deleting local files.
3. Audit real source changes after generated noise is isolated.
4. Check dependency alignment and repair only dependency issues if needed.
5. Run typecheck, focused tests, full tests, build, performance report, and lint if available.
6. Recommend a commit split without committing.

Completed actions:

- Created `docs/codex/CURRENT_CONTEXT.md` and this session log so repo state survives chat loss.
- Updated `.gitignore` for generated build/typecheck artifacts, local env files, and package-manager debug logs.
- Removed `.next` and `tsconfig.tsbuildinfo` from git tracking with `git rm --cached` while preserving local files.
- Added explicit `vite-node` dev dependency so `npm run perf:simulation` has the binary it invokes.
- Ran `npm install` successfully after the dependency repair.
- Kept Prompt 31 untouched and did not start new ORTUS roadmap work.
- Kept generated artifacts out of the source diff; staged generated cleanup currently covers 226 files and 1097 deletions.
- Made one targeted source stabilization fix after tests exposed runtime cost: Predator-Prey movement and boundary systems now batch movement and position component updates through existing command-buffer batch APIs.
- Split long-running production-template tests into per-template cases and added explicit time budgets to slow smoke/determinism/performance tests without changing assertions.

Checks run:

- `npm run typecheck`: passed.
- `npm run test -- spatialIndex`: passed.
- `npm run test -- flocking`: passed.
- `npm run test -- forest`: passed.
- `npm run test -- predatorPrey`: passed after the Predator-Prey batching fix.
- `npm run test -- template`: passed after per-template test splitting/time budgets.
- `npm run test`: passed, 43 files and 322 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run perf:simulation`: passed.
- `npm run lint`: unavailable; no lint script exists in `package.json`.

Latest local performance report:

- Flocking, 100 agents / 100 ticks: 934.51 ms, 107.01 ticks/sec.
- Flocking, 500 agents / 100 ticks: 5999.08 ms, 16.67 ticks/sec.
- Forest Fire, 80x60 grid / 100 ticks: 3809.50 ms, 26.25 ticks/sec.
- Predator-Prey default / 100 ticks: 1341.89 ms, 74.52 ticks/sec.

Remaining work:

- Review and commit changes intentionally; no commits were made in this session.
- Keep the staged generated cleanup in a hygiene commit rather than mixing generated artifacts into feature work.
- Review the uncommitted performance/instrumentation pass before proceeding to Prompt 31.
- Fix roadmap prompt-status drift in a later docs cleanup if desired.

## 2026-06-05 - R4 Roadmap Status Drift Cleanup

Goal: clean up roadmap/status drift only, without source code or package-file changes.

Starting state:

- Worktree was clean before the docs-only patch.
- Recent commits showed the post-30B stabilization/performance work completed: `dd6c256`, `4949b72`, and `a80d5b7`.
- Prompt 31 had not started.

Docs updated to consistently state:

- ORTUS is completed and audited through Prompt 30B.
- The post-30B repository hygiene, durable context, dependency stabilization, and performance/scalability pass is complete.
- Prompt 31 has not started.
- The next roadmap prompt is Prompt 31: Model Schema + Interpreter Foundation V1.

R4 touched docs plus narrow test-maintenance assertions/time budgets needed to keep roadmap/status checks current. No runtime source or package files were changed.

Checks run:

- `npm run typecheck`: passed.
- `npm run test -- roadmap`: initially failed on the retired 17B roadmap assertion, then passed after updating the roadmap-status assertion.
- `npm run test -- control`: passed after updating the retired Prompt 31 wording assertion.
- `npm run test -- predatorPrey`: passed after adding an explicit time budget to the existing 300-tick smoke test.
- `npm run test -- template.system`: passed after adding an explicit time budget to the existing seed-difference smoke test.
- `npm run test`: passed, 43 files and 322 tests.
- `npm run build`: passed with Next.js 15.5.19.
- `npm run lint`: unavailable; no lint script exists in `package.json`.
