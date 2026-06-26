# Living Systems Atlas Semantic Foundation Audit

Status: Prompt UX2B rendered browser audit complete; GW1 is conditionally ready.

UX2B verifies and hardens the shared semantic foundation that exists. It does not extend product architecture, add Research World routes, implement GW1, redesign unrelated surfaces, or turn automation into a WCAG, screen-reader, assistive-technology, or browser-zoom claim.

## Harness Added

Dev dependencies:

- `@playwright/test` version `1.61.1`.
- `@axe-core/playwright` version `4.12.1`.

Scripts added:

- `npm run test:ui`
- `npm run test:ui:headed`
- `npm run test:ui:report`

Config and tests:

- `playwright.config.ts`
- `tests/ui/semantic-foundation.spec.ts`

Generated Playwright artifacts are ignored:

- `playwright-report/`
- `test-results/`
- `blob-report/`

The config uses Chromium only, starts the existing Next app with `npm run dev -- --hostname 127.0.0.1 --port 3000`, uses base URL `http://127.0.0.1:3000`, reuses an existing server outside CI, runs with one worker, uses deterministic timeouts, and keeps screenshots, video, and traces as failure artifacts only.

## Covered Audit Plan

The bounded suite targets only existing routes:

- `/`
- `/builder`

Viewport coverage:

- `1440x900`
- `1280x720`
- `1024x768`
- `900x700`
- `1280x600`

Planned rendered checks include route loading, unexpected `pageerror`, console errors, hydration mismatch messages, missing critical assets, document-level horizontal overflow, conservative visible-region clipping checks, keyboard smoke coverage for Tab, Shift+Tab, Enter, Space, Escape, reduced-motion context, shared primitive coverage, rendered status attributes, Builder status badges, no operational completion labeled `Validated`, rendered style distinctions for required status pairs, and Axe scans on `/`, `/builder`, and Builder authoring open state.

Representative primitives in scope:

- `CornerFramePanel`
- shared buttons and icon-bearing controls
- form controls
- `StatusPill`
- `BuilderStatusBadge`

Status distinctions in scope:

- selected versus supported
- completed versus supported
- stale versus unsupported
- planning-only versus future-only
- contradicted versus failed
- unresolved versus disabled
- runnable versus supported

## Commands Run

`npm install --save-dev @playwright/test @axe-core/playwright` completed successfully and reported the existing npm audit state: two moderate vulnerabilities. No `npm audit fix --force` was run.

`npx playwright install chromium` completed without output. The local Playwright cache contains `chromium-1228`, `chromium_headless_shell-1228`, and `ffmpeg-1011`.

The first sandboxed `npm run test:ui` did not reach tests because the sandbox blocked the Next dev server from binding `127.0.0.1:3000` with `listen EPERM`.

The rerun with elevated local-server permissions started the Playwright run, but Chromium failed before any route rendered:

```text
error while loading shared libraries: libnspr4.so: cannot open shared object file: No such file or directory
```

The same failure occurred for both the cached headless shell and the full cached Chromium binary. Therefore the Chromium runtime version could not be verified from a successful launch.

`npx playwright install-deps --dry-run chromium` reported missing host dependencies:

```text
fonts-freefont-ttf
fonts-ipafont-gothic
fonts-liberation
fonts-noto-color-emoji
fonts-tlwg-loma-otf
fonts-unifont
fonts-wqy-zenhei
libasound2-data
libasound2t64
libfontenc1
libice6
libnspr4
libnss3
libsm6
libxaw7
libxfont2
libxkbfile1
libxmu6
libxpm4
libxt6t64
x11-xkb-utils
xfonts-cyrillic
xfonts-encodings
xfonts-scalable
xfonts-utils
xserver-common
xvfb
```

`npx playwright install-deps chromium` could not complete because sudo authentication requires an interactive terminal in this environment.

Continuation result: the host dependency blocker was later resolved outside this Codex run. Playwright Chromium launches successfully. Actual launched Chromium version: `149.0.7827.55`.

`npx playwright test --list` passed and enumerated 15 tests in `tests/ui/semantic-foundation.spec.ts`.

## Rendered Findings And Fixes

First rendered defect:

```text
Visible label: Paused
ARIA label: Paused
Status category: operational
data-state: idle
```

Root cause: `TopStatusBar` rendered `Paused` from `isRunning === false` but did not pass an explicit semantic state, so `StatusPill` fell back through the legacy neutral tone to `idle`.

Chosen interpretation: Paused. The simulator has an initialized engine and snapshot at tick 0, time is not advancing, and pressing Run advances from the displayed state. The visible label, accessible label, semantic category, semantic state, and runtime meaning now agree:

```text
Paused / Paused / operational / paused / initialized run not advancing
Running / Running / operational / running / initialized run advancing
```

Second rendered defect: Builder fallback status badges displayed meaningful labels such as `Structural only` and `Not runnable` but omitted explicit states, so `BuilderStatusBadge` defaulted them to `unverified`.

Fix: `BuilderHeader` now supplies explicit category/state values for fallback and no-generation badges:

- `Structural only`: `capability/planning-only`
- `Not runnable`: `capability/non-runnable`
- `No compiler`, `No schema execution`, `No template generation`, `No scenario generation`, `No RunConfig generation`: `capability/unsupported`

Third rendered defect: Axe reported `page-has-heading-one` on `/`. The simulation route had no `h1`.

Fix: added a visually hidden `h1` to `AppShell` and defined the existing `.sr-only` utility in `src/app/globals.css`.

Harness defect fixed: the reduced-motion test now explicitly calls `page.emulateMedia({ reducedMotion: "reduce" })` before route load. The assertion still requires the browser to expose reduced motion.

Production files changed for UX2B remediation:

- `src/components/TopStatusBar.tsx`
- `src/components/runStatusSemantics.ts`
- `src/components/builder/BuilderHeader.tsx`
- `src/components/AppShell.tsx`
- `src/app/globals.css`

Focused regression coverage:

- `src/components/ui/semanticTokenFoundation.test.ts` now checks the run-status semantic model, `StatusPill` data/ARIA source contract, Builder fallback badge states, and the hidden simulation route heading utility.

## Rendered Results

Focused reruns:

- Original failed case, `simulate loads without console, hydration, asset, or overflow failures at desktop 1440x900`: passed.
- Builder fallback badge case, `builder loads without console, hydration, asset, or overflow failures at desktop 1440x900`: passed.
- Reduced-motion simulate case: passed.
- Simulate Axe case: passed.

Full rendered suite:

```text
npm run test:ui
15 passed
0 failed
0 skipped
```

Routes tested:

- `/`
- `/builder`

Viewports tested:

- `1440x900`
- `1280x720`
- `1024x768`
- `900x700`
- `1280x600`

Rendered checks passed for route loading, unexpected page errors, console errors, hydration mismatch messages, missing critical assets, document-level horizontal overflow, conservative visible-region clipping, representative keyboard traversal, visible focus, icon-control accessible names, shared panels, shared buttons, shared forms, status pills, Builder badges, reduced-motion contexts, semantic status distinctions, and Axe scans.

Axe results:

- `/`: no violations after the hidden `h1` repair.
- `/builder`: no violations in Workspace Inspector and Author Schema states.

Console/hydration/page findings:

- No unexpected `pageerror` events.
- No unexpected console errors.
- No hydration mismatch messages.
- No failed critical document/script/stylesheet/font/image responses.

## Contrast Samples

These are representative UX2 token and migrated-primitive samples, not whole-application compliance claims.

Panel background is `rgba(13, 17, 16, 0.86)` composited over root `#070808`, yielding `rgb(12, 16, 15)`.

| Sample | Foreground | Background | Ratio | Target | Result |
| --- | --- | --- | ---: | --- | --- |
| Primary text on root | `rgb(243, 241, 232)` | `rgb(7, 8, 8)` | 17.72:1 | AA normal | Pass |
| Primary text on panel | `rgb(243, 241, 232)` | `rgb(12, 16, 15)` | 16.92:1 | AA normal | Pass |
| Secondary text on panel | `rgb(215, 213, 204)` | `rgb(12, 16, 15)` | 13.02:1 | AA normal | Pass |
| Muted text on panel | `rgb(154, 155, 148)` | `rgb(12, 16, 15)` | 6.83:1 | AA normal | Pass |
| Primary/default button text on default button surface | `rgb(243, 241, 232)` | `rgb(35, 39, 37)` | 13.37:1 | AA normal | Pass |
| Secondary/selected button text on selected button surface | `rgb(243, 241, 232)` | `rgb(30, 48, 44)` | 12.25:1 | AA normal | Pass |
| Warning text on note surface | `rgb(229, 196, 107)` | `rgb(34, 31, 25)` | 9.73:1 | AA normal | Pass |
| Failure text on failure surface | `rgb(255, 143, 123)` | `rgb(44, 33, 29)` | 7.05:1 | AA normal | Pass |
| Focus ring against root | `rgb(220, 188, 103)` | `rgb(7, 8, 8)` | 10.92:1 | 3:1 non-text | Pass |
| Focus ring against panel | `rgb(220, 189, 103)` | `rgb(12, 16, 15)` | 10.50:1 | 3:1 non-text | Pass |
| Selected boundary against panel surface | `rgb(74, 127, 118)` | `rgb(12, 16, 15)` | 4.18:1 | 3:1 non-text | Pass |
| Operational running text/surface | `rgb(123, 215, 199)` | `rgb(32, 52, 48)` | 7.76:1 | AA normal | Pass |
| Operational paused text/surface | `rgb(229, 196, 107)` | `rgb(38, 38, 26)` | 9.05:1 | AA normal | Pass |
| Evidence supported text/surface | `rgb(174, 199, 144)` | `rgb(33, 40, 32)` | 8.19:1 | AA normal | Pass |
| Evidence contradicted text/surface | `rgb(255, 143, 123)` | `rgb(41, 31, 28)` | 7.24:1 | AA normal | Pass |
| Evidence unresolved text/surface | `rgb(168, 161, 255)` | `rgb(31, 33, 44)` | 7.02:1 | AA normal | Pass |

## Repository Check Results

- `npx playwright test --list`: passed, 15 tests listed.
- `npm test -- semanticTokenFoundation roadmap`: passed, 2 files and 10 tests. Earlier focused reruns failed only on stale roadmap-test wording and one test tuple typing issue; both were corrected.
- `npm run test:ui`: passed, 15 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 59 files and 481 tests.
- `npm run build`: passed with Next.js 15.5.19; `/` and `/builder` prerendered successfully.
- `npm run perf:simulation`: passed. Local smoke results included Flocking 100 agents at 116.54 ticks/sec, Flocking 500 agents at 16.02 ticks/sec, Forest Fire 80x60 at 26.97 ticks/sec, and Predator-Prey default at 82.48 ticks/sec.
- `git diff --check`: passed.
- `npm run lint`: unavailable, package.json has no lint script.

## Limitations

Automation here does not verify actual browser UI zoom. Viewport checks are not browser zoom checks. Browser zoom at 125%, 150%, and 200% remains unverified.

Automation here does not verify screen-reader behavior, assistive-technology behavior, forced-colors behavior, user comprehension, complete WCAG conformance, or scientific/model validity.

Do not disable Axe rules to obtain a passing suite without narrow documented justification.

## Readiness

UX2B rendered browser audit is complete.

GW1 readiness decision: conditionally ready. The UX2 shared semantic foundation now has rendered route, viewport, reduced-motion, keyboard/focus, shared-primitive, status-semantic, contrast-sample, and Axe coverage. Remaining limits are nonblocking for GW1 if GW1 preserves `/` and `/builder`, does not claim actual browser zoom, screen-reader, assistive-technology, forced-colors, or complete WCAG verification, and keeps future shell work bounded by a dedicated GW1B audit.
