import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const landingPath = "/worlds/guides/reading-a-flock";
const collectionPath = "/worlds/packs/local-rules-global-patterns";
const flagshipPath = "/worlds/coordination-under-sensor-noise";
const baselinePath = "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock";
const contrastPath = "/world?starter=coordination-under-sensor-noise&recipe=coordination-noisy-signals&guide=reading-a-flock";

const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "wide", width: 1280, height: 720 },
  { label: "tablet", width: 1024, height: 768 },
  { label: "narrow", width: 900, height: 700 },
  { label: "short", width: 1280, height: 600 },
  { label: "mobile", width: 390, height: 844 }
] as const;

for (const viewport of viewports) {
  test(`guide landing keeps its first action, authority, and next-section cue visible at ${viewport.label} ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const diagnostics = observePageDiagnostics(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(landingPath, { waitUntil: "domcontentloaded" });
    const guide = page.locator("[data-guided-investigation='reading-a-flock']");
    await expect(guide).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Reading a Flock" })).toBeVisible();
    await expect(guide).toContainText("When local steering becomes noisy, do alignment and dispersion change in the same way?");
    await expect(guide).toContainText("Noise: 0.01 versus 0.28");
    await expect(guide).toContainText("Alignment score and Dispersion");
    await expect(guide).toContainText("c2-coordination-001");
    await expect(guide).toContainText(/160 boids have matching positions and headings/i);
    const primary = page.getByRole("link", { name: "Start with clear local signals" });
    await expect(primary.first()).toBeVisible();
    await expect(primary.first()).toHaveAttribute("href", baselinePath);
    await expect(page.getByRole("link", { name: "Back to Coordination Under Sensor Noise" })).toHaveAttribute("href", flagshipPath);
    await expect(page.locator("[data-starter-visual='coordination-noise']")).toBeVisible();
    const firstActionBox = await primary.first().boundingBox();
    expect(firstActionBox?.y ?? viewport.height).toBeLessThan(viewport.height);
    const questionSection = page.locator("#guide-question-title").locator("xpath=ancestor::section");
    const questionBox = await questionSection.boundingBox();
    expect(questionBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(viewport.height);
    await expectNoHorizontalOverflow(page);
    await page.waitForLoadState("networkidle");
    await expectNoDiagnostics(diagnostics);
  });
}

test("collection and flagship detail expose one subordinate guide entry without changing the eleven-world catalog", async ({ page }) => {
  await page.goto("/worlds", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-card]")).toHaveCount(11);
  await expect(page.locator("[data-guide-callout]")).toHaveCount(0);

  await page.goto(collectionPath, { waitUntil: "domcontentloaded" });
  const collectionCallout = page.locator("[data-guide-callout='reading-a-flock']");
  await expect(collectionCallout).toHaveCount(1);
  await expect(collectionCallout).toContainText("Reading a Flock");
  await expect(collectionCallout).toContainText("Alignment score and Dispersion");
  await expect(collectionCallout.getByRole("link", { name: "Try the guided investigation" })).toHaveAttribute("href", landingPath);
  await expect(page.locator("[data-pack-world]")).toHaveCount(4);

  await page.goto(flagshipPath, { waitUntil: "domcontentloaded" });
  const detailCallout = page.locator("[data-guide-callout='reading-a-flock']");
  await expect(detailCallout).toHaveCount(1);
  await expect(detailCallout.getByRole("link", { name: "Try the guided investigation" })).toHaveAttribute("href", landingPath);
  await expect(page.getByRole("link", { name: "Launch baseline: Clear local signals" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Launch contrast: Noisy local signals" })).toBeVisible();
});

test("baseline guide supports optional steps, existing tasks, explicit comparison capture, collapse, and exit without reset", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  await expect(panel).toHaveAttribute("data-guide-phase", "baseline");
  await expect(panel).toHaveAttribute("data-guide-step", "confirm-prepared-start");
  await expect(panel).toContainText("Clear local signals");
  await expect(panel).toContainText("Prepared Noise0.01");
  await expect(panel).toContainText("c2-coordination-001");
  await expect(panel).toContainText("Entities now160");
  await expect(panel).toContainText("Alignment score and Dispersion");
  await expect(panel).toContainText("it does not establish a universal threshold, real-world validity, or learning outcome");
  await expect(page.getByLabel("Simulation world stage")).toBeVisible();
  await expect(page.getByLabel("Persistent simulation playback controls")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "World tasks" })).toContainText("Setup");
  await expect(page.getByRole("navigation", { name: "World tasks" })).toContainText("More");
  await expectStageDominance(page);
  expect(await page.evaluate(() => localStorage.getItem("ortus.runComparison.v1"))).toBeNull();

  await panel.getByRole("button", { name: "Open Setup" }).click();
  await expect(page).toHaveURL(/guide=reading-a-flock.*task=setup|task=setup.*guide=reading-a-flock/);
  await expect(page.getByRole("heading", { level: 2, name: "Setup" })).toBeFocused();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");

  await panel.getByRole("button", { name: /2 Watch coordinated motion form/ }).click();
  await expect(panel.getByRole("heading", { level: 3, name: "Watch coordinated motion form" })).toBeFocused();
  await expect(panel).toContainText("The run has not reached the suggested horizon yet.");
  await panel.getByRole("button", { name: "Focus playback controls" }).click();
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeFocused();
  await page.locator(".speed-control input").fill("8");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(async () => Number(await page.locator(".timeline-strip__readout strong").first().textContent()), { timeout: 15_000 }).toBeGreaterThanOrEqual(240);
  await expect(panel).toContainText("Suggested horizon reached.");
  await expect(page.getByRole("button", { name: "Pause simulation" })).toBeVisible();
  await page.getByRole("button", { name: "Pause simulation" }).click();

  await panel.getByRole("button", { name: /3 Alignment is not dispersion/ }).click();
  await expect(panel.getByRole("heading", { level: 3, name: "Alignment is not dispersion" })).toBeFocused();
  await expect(panel).toContainText("The two values do not have to change together.");
  await panel.getByRole("button", { name: "Open Observe" }).click();
  await expect(page).toHaveURL(baselinePath);
  await expect(page.getByRole("heading", { level: 2, name: "Observe" })).toBeFocused();

  await panel.getByRole("button", { name: /4 Keep the baseline available/ }).click();
  await panel.getByRole("button", { name: "Open Compare" }).click();
  await expect(page).toHaveURL(/task=compare/);
  await expect(page.getByRole("heading", { level: 2, name: "Compare" })).toBeFocused();
  await page.getByLabel("Run label").fill("C3 explicit baseline summary");
  await page.getByRole("button", { name: "Capture Run" }).click();
  await expect(page.getByLabel("Label", { exact: true })).toHaveValue("C3 explicit baseline summary");
  await expect(panel).toContainText("A comparison summary is available.");
  await expect(panel.getByRole("link", { name: "Open Noisy local signals" })).toHaveAttribute("href", contrastPath);

  const tickBeforeCollapse = await currentTick(page);
  await panel.getByRole("button", { name: "Collapse guide" }).click();
  await expect(panel).toHaveAttribute("data-guide-collapsed", "true");
  await expect(panel.locator("#world-guide-content")).toHaveCount(0);
  await expect(panel.getByRole("button", { name: "Expand guide" })).toBeFocused();
  expect(await currentTick(page)).toBe(tickBeforeCollapse);
  await panel.getByRole("button", { name: "Expand guide" }).click();
  await expect(panel).toHaveAttribute("data-guide-step", "capture-baseline-summary");

  const storageBeforeExit = await page.evaluate(() => localStorage.getItem("ortus.runComparison.v1"));
  const tickBeforeExit = await currentTick(page);
  await panel.getByRole("button", { name: "Exit guide" }).first().click();
  await expect(page.locator("[data-guided-investigation-panel]")).toHaveCount(0);
  await expect(page).not.toHaveURL(/guide=/);
  await expect(page).toHaveURL(/task=compare/);
  await expect(page.getByLabel("Simulation world stage")).toBeFocused();
  expect(await currentTick(page)).toBe(tickBeforeExit);
  expect(await page.evaluate(() => localStorage.getItem("ortus.runComparison.v1"))).toBe(storageBeforeExit);
});

test("guide exit preserves a running world and an unrelated Setup draft", async ({ page }) => {
  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await panel.getByRole("button", { name: "Open Setup" }).click();
  await page.getByRole("button", { name: /All parameters/ }).click();
  const draft = page.getByRole("spinbutton", { name: "Noise numeric value" });
  await draft.fill("0.2");
  await expect(draft.locator("xpath=ancestor::label").locator(".parameter-control__mode")).toHaveText("Active run: 0.01. Draft pending.");
  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Observe" }).click();
  await expect(page).toHaveURL(baselinePath);
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(() => currentTick(page)).toBeGreaterThan(2);
  await panel.getByRole("button", { name: "Exit guide" }).first().click();
  await expect(page).not.toHaveURL(/guide=/);
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Running");
  const firstTick = await currentTick(page);
  await expect.poll(() => currentTick(page)).toBeGreaterThan(firstTick);
  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Setup" }).click();
  const allParameters = page.getByRole("button", { name: /All parameters/ });
  if (await allParameters.isVisible()) await allParameters.click();
  await expect(page.getByRole("spinbutton", { name: "Noise numeric value" })).toHaveValue("0.2");
  await page.getByRole("button", { name: "Pause simulation" }).click();
});

test("paired navigation, direct contrast, missing-baseline fallback, reflection, Back, and reload stay honest", async ({ page }) => {
  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  let panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await panel.getByRole("button", { name: /4 Keep the baseline available/ }).click();
  const paired = panel.getByRole("link", { name: "Open Noisy local signals" });
  await paired.focus();
  await paired.press("Enter");
  panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await expect(page).toHaveURL(contrastPath);
  await expect(panel).toHaveAttribute("data-guide-phase", "contrast");
  await expect(panel).toHaveAttribute("data-guide-step", "confirm-paired-reset");
  await expect(panel).toBeFocused();
  await expect(panel).toContainText("Prepared Noise0.28");
  await expect(panel).toContainText("Paired baseline Noise0.01");
  await expect(panel).toContainText("This is a fresh run, not a continuation of the baseline.");
  await expect(panel).toContainText("does not assume that the baseline was run");
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");

  await panel.getByRole("button", { name: /2 Give the contrast equal runtime/ }).click();
  await expect(panel).toContainText("It does not turn the pair into a statistical experiment.");
  await panel.getByRole("button", { name: /3 Read alignment and spread again/ }).click();
  await expect(panel).toContainText("Did directional alignment change?");
  await panel.getByRole("button", { name: /4 Compare without overgeneralizing/ }).click();
  await expect(panel).toContainText("No comparison summary is available in the existing comparison workspace.");
  await expect(panel.getByRole("link", { name: "Reopen Clear local signals" })).toHaveAttribute("href", baselinePath);
  await expect(panel.getByRole("heading", { level: 4, name: "Questions for the next run" })).toBeVisible();
  await expect(panel).toContainText("What intermediate Noise setting would you investigate next?");
  await expect(panel).not.toContainText(/completed the lesson|mastered|proved the hypothesis/i);

  await page.goBack();
  await expect(page).toHaveURL(baselinePath);
  await expect(page.locator("[data-guide-phase='baseline']")).toHaveAttribute("data-guide-step", "confirm-prepared-start");
  await page.goForward();
  await expect(page).toHaveURL(contrastPath);
  await expect(page.locator("[data-guide-phase='contrast']")).toHaveAttribute("data-guide-step", "confirm-paired-reset");

  panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await panel.getByRole("button", { name: /3 Read alignment and spread again/ }).click();
  await expect(panel).toHaveAttribute("data-guide-step", "read-contrast-outputs");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-guide-phase='contrast']")).toHaveAttribute("data-guide-step", "confirm-paired-reset");
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");

  await page.locator("[data-guided-investigation-panel]").getByRole("button", { name: "Exit guide" }).first().click();
  await expect(page).toHaveURL("/world?starter=coordination-under-sensor-noise&recipe=coordination-noisy-signals");
  await expect(page.locator("[data-guided-investigation-panel]")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(baselinePath);
  await expect(page.locator("[data-guide-phase='baseline']")).toHaveAttribute("data-guide-step", "confirm-prepared-start");
});

test("guided World baseline, direct contrast, collapsed, exited, and invalid states remain reachable at every required viewport", async ({ page }) => {
  test.setTimeout(180_000);
  for (const viewport of viewports) {
    const diagnostics = observePageDiagnostics(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Simulation world stage")).toBeVisible();
    await expect(page.getByLabel("Persistent simulation playback controls")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "World tasks" })).toBeVisible();
    await expect(page.locator("[data-guided-investigation-panel='reading-a-flock']")).toBeVisible();
    await expect(page.locator(".ortus-layout")).toHaveCSS("grid-template-areas", viewport.width <= 760 ? /stage/ : /tasks stage tools/);
    await expectNoHorizontalOverflow(page);
    await page.waitForLoadState("networkidle");

    await page.goto(contrastPath, { waitUntil: "domcontentloaded" });
    const contrastPanel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
    await expect(contrastPanel).toHaveAttribute("data-guide-phase", "contrast");
    await expect(contrastPanel).toHaveAttribute("data-guide-step", "confirm-paired-reset");
    await expect(contrastPanel).toContainText("does not assume that the baseline was run");
    await expect(page.getByLabel("Simulation world stage")).toBeVisible();
    await expect(page.getByLabel("Persistent simulation playback controls")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.waitForLoadState("networkidle");

    await contrastPanel.getByRole("button", { name: "Collapse guide" }).click();
    await expect(contrastPanel).toHaveAttribute("data-guide-collapsed", "true");
    await expect(contrastPanel.locator("#world-guide-content")).toHaveCount(0);
    await expect(contrastPanel.getByRole("button", { name: "Expand guide" })).toBeFocused();
    await expectNoHorizontalOverflow(page);

    await contrastPanel.getByRole("button", { name: "Exit guide" }).click();
    await expect(page.locator("[data-guided-investigation-panel]")).toHaveCount(0);
    await expect(page).not.toHaveURL(/guide=/);
    await expect(page.getByLabel("Simulation world stage")).toBeFocused();
    await expectNoHorizontalOverflow(page);

    await page.goto(`${baselinePath}&step=2`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-starter-launch-error]")).toContainText("This world could not be prepared safely");
    await expect(page.locator(".ortus-shell")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    await page.waitForLoadState("networkidle");
    await expectNoDiagnostics(diagnostics);
  }
});

test("invalid guided URLs are announced before AppShell or World construction", async ({ page }) => {
  const invalidPaths = [
    "/world?guide=reading-a-flock",
    "/world?starter=coordination-under-sensor-noise&guide=reading-a-flock",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=missing-guide",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=Bad%20Guide",
    "/world?starter=clustered-outbreak-starts&recipe=outbreak-one-cluster&guide=reading-a-flock",
    "/world?starter=coordination-under-sensor-noise&recipe=outbreak-one-cluster&guide=reading-a-flock",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock&guide=reading-a-flock",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock&step=2",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock&progress=complete",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock&noise=0.5",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock&parameters=%7B%22noise%22%3A0.5%7D",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=%7B%22id%22%3A%22reading-a-flock%22%7D",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock&__proto__=%7B%7D"
  ];
  for (const path of invalidPaths) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-starter-launch-error]")).toBeVisible();
    await expect(page.locator("[data-starter-launch-error]")).toContainText("This world could not be prepared safely");
    await expect(page.getByRole("link", { name: "Back to Explore Worlds" })).toHaveAttribute("href", "/worlds");
    await expect(page.locator(".ortus-shell")).toHaveCount(0);
    await expect(page.locator(".world-stage")).toHaveCount(0);
  }
});

test("landing, baseline, contrast, collapsed, exited, and invalid guide states are Axe-clean and diagnostically quiet", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const paths = [landingPath, baselinePath, contrastPath, `${baselinePath}&task=compare`, `${baselinePath}&step=2`];
  for (const path of paths) {
    const diagnostics = observePageDiagnostics(page);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    if (!path.includes("&step=")) {
      await expect(page.locator(path === landingPath ? "[data-guided-investigation]" : ".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
    }
    expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id), path).toEqual([]);
    await expectNoHorizontalOverflow(page);
    await expectNoDiagnostics(diagnostics);
  }

  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel]");
  await panel.getByRole("button", { name: "Collapse guide" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
  await panel.getByRole("button", { name: "Exit guide" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
});

interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  badResponses: string[];
  failedRequests: string[];
}

function observePageDiagnostics(page: Page): PageDiagnostics {
  const diagnostics: PageDiagnostics = { consoleErrors: [], pageErrors: [], badResponses: [], failedRequests: [] };
  const criticalTypes = new Set(["document", "script", "stylesheet", "font", "image"]);
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" || /hydration|did not match|server html|client html/i.test(text)) {
      diagnostics.consoleErrors.push(`${message.type()}: ${text}`);
    }
  });
  page.on("pageerror", (error) => diagnostics.pageErrors.push(error.stack ?? error.message));
  page.on("response", (response) => {
    const request = response.request();
    if (response.status() >= 400 && criticalTypes.has(request.resourceType())) {
      diagnostics.badResponses.push(`${response.status()} ${request.resourceType()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (criticalTypes.has(request.resourceType())) {
      diagnostics.failedRequests.push(`${request.resourceType()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
    }
  });
  return diagnostics;
}

async function expectNoDiagnostics(diagnostics: PageDiagnostics) {
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.badResponses).toEqual([]);
  expect(diagnostics.failedRequests).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.viewportWidth);
  expect(widths.bodyWidth).toBeLessThanOrEqual(widths.viewportWidth);
}

async function expectStageDominance(page: Page) {
  const stage = await page.getByLabel("Simulation world stage").boundingBox();
  const guide = await page.locator("[data-guided-investigation-panel]").boundingBox();
  expect(stage).not.toBeNull();
  expect(guide).not.toBeNull();
  expect((stage?.width ?? 0) * (stage?.height ?? 0)).toBeGreaterThan((guide?.width ?? 0) * (guide?.height ?? 0));
}

async function currentTick(page: Page): Promise<number> {
  return Number(await page.locator(".timeline-strip__readout strong").first().textContent());
}
