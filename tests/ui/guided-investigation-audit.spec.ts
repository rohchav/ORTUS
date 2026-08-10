import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const baselinePath = "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock";
const contrastPath = "/world?starter=coordination-under-sensor-noise&recipe=coordination-noisy-signals&guide=reading-a-flock";

test("an unrelated rebuild suspends the prepared-pair claim and offers an explicit restore", async ({ page }) => {
  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");

  await panel.getByRole("button", { name: "Open Setup" }).click();
  await page.getByRole("button", { name: /All parameters/ }).click();
  await page.getByRole("spinbutton", { name: "Alignment weight numeric value" }).fill("0.51");
  await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();

  await expect(panel).toHaveAttribute("data-guide-runtime-state", "modified");
  await expect(panel.getByRole("heading", { name: "Prepared-pair context changed" })).toBeFocused();
  await expect(panel).toContainText("The controlled-pair claim no longer applies to this active run.");
  await expect(panel).toContainText("Alignment weight");

  await panel.getByRole("button", { name: /2 Watch coordinated motion form/ }).click();
  await expect(panel.getByRole("heading", { name: "Prepared-pair context changed" })).toBeVisible();
  await expect(panel).toContainText("Continue exploring this modified run without the controlled-pair claim");

  await panel.getByRole("button", { name: "Restore prepared recipe" }).click();
  await expect(panel).toContainText("Restoring replaces the active run with a fresh paused tick-0 prepared run");
  await panel.getByRole("button", { name: "Keep modified run" }).click();
  await expect(panel.getByRole("button", { name: "Restore prepared recipe" })).toBeFocused();
  await expect(panel).toHaveAttribute("data-guide-runtime-state", "modified");
  await panel.getByRole("button", { name: "Restore prepared recipe" }).click();
  await panel.getByRole("button", { name: "Confirm restore prepared recipe" }).click();

  await expect(panel).toHaveAttribute("data-guide-runtime-state", "prepared");
  await expect(panel.getByRole("heading", { name: "Prepared-pair context changed" })).toHaveCount(0);
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
});

test("Noise, seed, entity count, and template changes remain advisory and visibly suspend prepared provenance", async ({ page }) => {
  const cases: Array<{
    label: string;
    changedContext: string;
    apply: (page: Page) => Promise<void>;
  }> = [
    {
      label: "Noise",
      changedContext: "Noise",
      apply: async (activePage) => {
        await openAllParameters(activePage);
        await activePage.getByRole("spinbutton", { name: "Noise numeric value" }).fill("0.2");
        await activePage.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
      }
    },
    {
      label: "Seed",
      changedContext: "Seed",
      apply: async (activePage) => {
        await activePage.locator("#ortus-setup-seed").fill("c3b-modified-seed");
        await activePage.getByRole("button", { name: "Apply Seed and rebuild a fresh run" }).click();
      }
    },
    {
      label: "Agent count",
      changedContext: "Agent count",
      apply: async (activePage) => {
        await openAllParameters(activePage);
        await activePage.getByRole("spinbutton", { name: "Agent count numeric value" }).fill("120");
        await activePage.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
      }
    },
    {
      label: "World template",
      changedContext: "World template",
      apply: async (activePage) => {
        await activePage.getByLabel("World template").selectOption("forest-fire");
      }
    },
    {
      label: "Reset outside the recipe constructor",
      changedContext: "Prepared recipe provenance",
      apply: async (activePage) => {
        await activePage.getByRole("button", { name: "Reset from current model, parameters, and seed" }).click();
      }
    }
  ];

  for (const testCase of cases) {
    await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
    const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
    await panel.getByRole("button", { name: "Open Setup" }).click();
    await testCase.apply(page);

    await expect(panel, testCase.label).toHaveAttribute("data-guide-runtime-state", "modified");
    await expect(panel.getByRole("heading", { name: "Prepared-pair context changed" }), testCase.label).toBeFocused();
    await expect(panel, testCase.label).toContainText(testCase.changedContext);
    await expect(panel.getByRole("button", { name: /Continue without check: Watch coordinated motion form/ }), testCase.label).toBeEnabled();
    await expect(page).not.toHaveURL(/(?:step|phase|completed|progress|score)=/);
    expect(await guideStorageKeys(page), testCase.label).toEqual([]);
  }
});

test("landing and output steps use exact bounded metric semantics", async ({ page }) => {
  await page.goto("/worlds/guides/reading-a-flock", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-guided-investigation='reading-a-flock']")).toContainText("Estimated time: 8 minutes");
  await expect(page.locator("[data-guided-investigation='reading-a-flock']")).toContainText("same initialized positions and headings twice");
  await expect(page.locator("[data-guided-investigation='reading-a-flock']")).toContainText("Magnitude of the mean normalized heading vector, from 0 to 1");
  await expect(page.locator("[data-guided-investigation='reading-a-flock']")).toContainText("Mean distance in world units from the flock's current center of mass");

  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await panel.getByRole("button", { name: /3 Alignment is not dispersion/ }).click();
  await expect(panel).toContainText("Higher values mean more similar model headings, not animal coordination or spatial cohesion.");
  await expect(panel).toContainText("Higher values mean wider spread around that center, not necessarily fragmentation.");
  await expect(panel).toContainText("These bounded outputs do not exhaustively describe flock structure.");
  await expect(panel).not.toContainText(/visual (?:proof|confirmation)|empirical observation|animal behavior measured/i);
});

test("exit from a running modified run removes only guide presentation", async ({ page }) => {
  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await panel.getByRole("button", { name: "Open Setup" }).click();
  await openAllParameters(page);
  await page.getByRole("spinbutton", { name: "Noise numeric value" }).fill("0.2");
  await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(() => currentTick(page)).toBeGreaterThan(2);
  const tickBeforeExit = await currentTick(page);

  await panel.locator(".world-guide__divergence").getByRole("button", { name: "Exit guide" }).click();
  await expect(page.locator("[data-guided-investigation-panel]")).toHaveCount(0);
  await expect(page).toHaveURL("/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&task=setup");
  await expect(page.getByLabel("Simulation world stage")).toBeFocused();
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Running");
  await expect.poll(() => currentTick(page)).toBeGreaterThan(tickBeforeExit);
  await expect(page.getByRole("spinbutton", { name: "Noise numeric value" })).toHaveValue("0.2");
  await page.getByRole("button", { name: "Pause simulation" }).click();
});

test("comparison availability stays generic across unrelated, stale, wrong-seed, wrong-horizon, and multiple summaries", async ({ page }) => {
  await page.goto(contrastPath, { waitUntil: "domcontentloaded" });
  const cases = [
    { label: "none", runs: [] },
    { label: "unrelated template", runs: [summary("unrelated", "Forest summary", "forest-fire", "Forest Fire", "other-seed", 240)] },
    { label: "different recipe", runs: [summary("contrast", "Noisy recipe summary", "flocking-boids", "Flocking / Boids", "c2-coordination-001", 240, "coordination-noisy-signals")] },
    { label: "baseline", runs: [summary("baseline", "Clear recipe summary", "flocking-boids", "Flocking / Boids", "c2-coordination-001", 240, "coordination-clear-signals")] },
    { label: "wrong seed", runs: [summary("wrong-seed", "Wrong seed summary", "flocking-boids", "Flocking / Boids", "different-seed", 240, "coordination-clear-signals")] },
    { label: "wrong horizon", runs: [summary("wrong-horizon", "Short baseline summary", "flocking-boids", "Flocking / Boids", "c2-coordination-001", 12, "coordination-clear-signals")] },
    {
      label: "multiple",
      runs: [
        summary("multiple-a", "Older unrelated summary", "epidemic-spread", "Epidemic Spread", "other-seed", 80),
        summary("multiple-b", "Possible baseline summary", "flocking-boids", "Flocking / Boids", "c2-coordination-001", 240, "coordination-clear-signals")
      ]
    }
  ];

  for (const testCase of cases) {
    await page.evaluate(({ key, value }) => {
      if (value.length === 0) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    }, { key: "ortus.runComparison.v1", value: testCase.runs });
    await page.reload({ waitUntil: "domcontentloaded" });
    const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
    await panel.getByRole("button", { name: /4 Compare without overgeneralizing/ }).click();

    if (testCase.runs.length === 0) {
      await expect(panel, testCase.label).toContainText("No comparison summary is available in the existing comparison workspace.");
    } else {
      await expect(panel, testCase.label).toContainText("Availability alone does not identify a prepared baseline or establish a controlled pair.");
      await expect(panel, testCase.label).toContainText("Available summaries are not attributed to this guide.");
      for (const run of testCase.runs) {
        await expect(panel, testCase.label).toContainText(run.label);
        await expect(panel, testCase.label).toContainText(`seed ${run.seed} · ${run.ticksRun} ticks`);
      }
    }
    await expect(panel, testCase.label).not.toContainText(/baseline completed|baseline step passed|lesson completed|guide-owned summary/i);
  }
});

test("recipe replacement remains coherent from every primary World task and through Back and Forward", async ({ page }) => {
  test.setTimeout(150_000);
  const tasks = [
    { query: "setup", heading: "Setup" },
    { query: undefined, heading: "Observe" },
    { query: "change", heading: "Change" },
    { query: "compare", heading: "Compare" },
    { query: "understand", heading: "Explain" },
    { query: "experiment", heading: "Experiments" },
    { query: "debug", heading: "Diagnostics" }
  ] as const;

  for (const task of tasks) {
    const sourcePath = task.query ? `${baselinePath}&task=${task.query}` : baselinePath;
    await page.goto(sourcePath, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 2, name: task.heading })).toBeVisible();
    await page.locator("[data-starter-nudge]").getByRole("link", { name: "Launch contrast: Noisy local signals" }).click();

    const contrastPanel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
    await expect(page).toHaveURL(contrastPath);
    await expect(page.getByRole("heading", { level: 2, name: "Observe" })).toBeVisible();
    await expect(contrastPanel).toHaveAttribute("data-guide-phase", "contrast");
    await expect(contrastPanel).toHaveAttribute("data-guide-step", "confirm-paired-reset");
    await expect(contrastPanel).toBeFocused();
    await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
    await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");

    await page.goBack();
    await expect(page).toHaveURL(sourcePath);
    await expect(page.getByRole("heading", { level: 2, name: task.heading })).toBeVisible();
    await expect(page.locator("[data-guide-phase='baseline']")).toHaveAttribute("data-guide-step", "confirm-prepared-start");
    await page.goForward();
    await expect(page).toHaveURL(contrastPath);
    await expect(page.getByRole("heading", { level: 2, name: "Observe" })).toBeVisible();
  }
});

test("step and collapse state remain mounted-page only across reload and a separate tab", async ({ page, context }) => {
  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await panel.getByRole("button", { name: /3 Alignment is not dispersion/ }).click();
  await panel.getByRole("button", { name: "Collapse guide" }).click();
  await expect(panel.locator("#world-guide-content")).toHaveCount(0);
  expect(await guideStorageKeys(page)).toEqual([]);

  const secondPage = await context.newPage();
  await secondPage.goto(baselinePath, { waitUntil: "domcontentloaded" });
  await expect(secondPage.locator("[data-guided-investigation-panel]"))
    .toHaveAttribute("data-guide-step", "confirm-prepared-start");
  await expect(secondPage.locator("[data-guided-investigation-panel]"))
    .toHaveAttribute("data-guide-collapsed", "false");
  await secondPage.close();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-guided-investigation-panel]"))
    .toHaveAttribute("data-guide-step", "confirm-prepared-start");
  await expect(page.locator("[data-guided-investigation-panel]"))
    .toHaveAttribute("data-guide-collapsed", "false");
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
});

test("additional hostile guide query fields fail before AppShell construction", async ({ page }) => {
  const invalidFields = [
    "phase=baseline",
    "completed=true",
    "score=1",
    "taskState=observe",
    "template=flocking-boids",
    "scenario=random-headings",
    "runConfig=%7B%22ticks%22%3A240%7D",
    "payload=%7B%22recipe%22%3A%22coordination-clear-signals%22%7D",
    "constructor=polluted",
    "prototype=polluted",
    "then=polluted",
    "catch=polluted",
    "finally=polluted"
  ];
  for (const field of invalidFields) {
    await page.goto(`${baselinePath}&${field}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("alert"), field).toContainText("This world could not be prepared safely");
    if (/constructor|prototype|then|catch|finally/.test(field)) {
      await expect(page.getByRole("alert"), field).toContainText("unsafe query key");
    }
    await expect(page.locator(".ortus-shell"), field).toHaveCount(0);
    await expect(page.locator(".world-stage"), field).toHaveCount(0);
  }
});

test("modified-run and restore-confirmation states remain responsive, Axe-clean, and diagnostically quiet", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto(baselinePath, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-guided-investigation-panel='reading-a-flock']");
  await panel.getByRole("button", { name: "Open Setup" }).click();
  await openAllParameters(page);
  await page.getByRole("spinbutton", { name: "Alignment weight numeric value" }).fill("0.51");
  await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();

  await expect(panel.getByRole("heading", { name: "Prepared-pair context changed" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
  await panel.getByRole("button", { name: "Restore prepared recipe" }).click();
  await expect(panel.getByRole("group", { name: "Confirm prepared recipe restore" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(panel.getByRole("heading", { name: "Prepared-pair context changed" })).toBeVisible();
  await expect(page.getByLabel("Simulation world stage")).toBeVisible();
  await expect(page.getByLabel("Persistent simulation playback controls")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
  await expectNoDiagnostics(diagnostics);
});

async function openAllParameters(page: Page) {
  const heading = page.getByRole("heading", { level: 3, name: "All parameters" });
  if (!(await heading.isVisible())) {
    await page.getByRole("button", { name: /All parameters/ }).click();
  }
  await expect(heading).toBeVisible();
}

function summary(
  runId: string,
  label: string,
  templateId: string,
  templateName: string,
  seed: string,
  ticksRun: number,
  recipeId?: string
) {
  return {
    schemaVersion: "1",
    runId,
    label,
    templateId,
    templateName,
    templateVersion: "1.0.0",
    seed,
    parameters: {},
    capturedAt: "2026-08-01T00:00:00.000Z",
    ticksRun,
    time: ticksRun,
    finalMetrics: {},
    metricHistory: [],
    interventions: [],
    source: "manual",
    notes: "",
    tags: [],
    ...(recipeId ? { metadata: { starterWorldRecipeId: recipeId } } : {})
  };
}

async function guideStorageKeys(page: Page): Promise<string[]> {
  return page.evaluate(() => Object.keys(localStorage).filter((key) => /guide|reading-a-flock|progress|completion/i.test(key)));
}

async function currentTick(page: Page): Promise<number> {
  return Number(await page.locator(".timeline-strip__readout strong").first().textContent());
}

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
    if (response.status() >= 400 && criticalTypes.has(response.request().resourceType())) {
      diagnostics.badResponses.push(`${response.status()} ${response.request().resourceType()} ${response.url()}`);
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
