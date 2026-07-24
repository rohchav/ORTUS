import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const frameViewports = [
  { label: "large desktop", width: 1440, height: 900 },
  { label: "desktop", width: 1280, height: 720 },
  { label: "medium", width: 1024, height: 768 },
  { label: "narrow desktop", width: 900, height: 700 },
  { label: "short desktop", width: 1280, height: 600 },
  { label: "mobile smoke", width: 390, height: 844 }
] as const;

const templateIds = [
  "epidemic-spread",
  "opinion-dynamics",
  "predator-prey",
  "schelling-segregation",
  "flocking-boids",
  "forest-fire",
  "neural-excitation-network"
] as const;

interface Diagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  failedCriticalRequests: string[];
}

function observeDiagnostics(page: Page): Diagnostics {
  const diagnostics: Diagnostics = { consoleErrors: [], pageErrors: [], failedCriticalRequests: [] };
  const critical = new Set(["document", "script", "stylesheet", "font", "image"]);
  page.on("console", (message) => {
    if (message.type() === "error" || /hydration|did not match|server html|client html/i.test(message.text())) {
      diagnostics.consoleErrors.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => diagnostics.pageErrors.push(error.stack ?? error.message));
  page.on("requestfailed", (request) => {
    if (critical.has(request.resourceType()) && !/^(data|blob|about):/i.test(request.url())) {
      diagnostics.failedCriticalRequests.push(`${request.resourceType()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
    }
  });
  return diagnostics;
}

async function openWorld(page: Page, path = "/world?template=flocking-boids") {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "World" })).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
}

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

async function expectNoDocumentOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 2);
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 2);
}

async function expectDiagnosticsClean(diagnostics: Diagnostics) {
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.failedCriticalRequests).toEqual([]);
}

for (const viewport of frameViewports) {
  test(`canvas-first frame remains usable at ${viewport.label} ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const diagnostics = observeDiagnostics(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openWorld(page);

    const stage = page.locator(".world-stage");
    const workspace = page.locator(".workspace-center");
    const tasks = page.getByRole("navigation", { name: "World tasks" });
    const tools = page.getByRole("complementary", { name: "Active World tool surface" });
    const playback = page.getByRole("region", { name: "Persistent simulation playback controls" });
    const context = page.getByLabel("Current simulation context");
    const stageBox = await bounds(stage);
    const workspaceBox = await bounds(workspace);
    const taskBox = await bounds(tasks);
    const toolBox = await bounds(tools);
    const playbackBox = await bounds(playback);

    await expect(context).toContainText("Flocking");
    await expect(page.getByLabel("Current run status")).toContainText(/Paused.*Tick.*Seed/s);
    await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Step exactly one tick" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reset from current model/ })).toBeVisible();
    await expect(page.getByRole("slider", { name: /Speed/i })).toBeVisible();

    expect(stageBox.width).toBeGreaterThan(300);
    expect(stageBox.height).toBeGreaterThan(250);
    expect(playbackBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height - 2);
    expect(playbackBox.y + playbackBox.height).toBeLessThanOrEqual(workspaceBox.y + workspaceBox.height + 2);

    if (viewport.width > 760) {
      expect(taskBox.width).toBeGreaterThanOrEqual(48);
      expect(taskBox.width).toBeLessThanOrEqual(72);
      expect(toolBox.width).toBeGreaterThanOrEqual(285);
      expect(toolBox.width).toBeLessThanOrEqual(380);
      expect(stageBox.width).toBeGreaterThan(toolBox.width);
      expect(stageBox.x + stageBox.width).toBeLessThanOrEqual(toolBox.x + 2);
      if (viewport.height === 600) {
        await expect(page.getByRole("button", { name: "Apply Seed" })).toBeVisible();
      }
    } else {
      expect(stageBox.y).toBeLessThan(taskBox.y);
      expect(taskBox.y).toBeLessThan(toolBox.y);
      expect(toolBox.y + toolBox.height).toBeLessThanOrEqual(viewport.height + 2);
      const toolScroll = tools.locator(".workspace-context-panel__scroll");
      const toolScrollMetrics = await toolScroll.evaluate((element) => ({
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowY: getComputedStyle(element).overflowY,
        documentHeight: document.documentElement.scrollHeight
      }));
      expect(toolScrollMetrics.clientHeight).toBeGreaterThan(80);
      expect(toolScrollMetrics.scrollHeight).toBeGreaterThan(toolScrollMetrics.clientHeight);
      expect(toolScrollMetrics.overflowY).toBe("auto");
      expect(toolScrollMetrics.documentHeight).toBeLessThanOrEqual(viewport.height + 2);
      await toolScroll.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      await expect(page.getByRole("button", { name: /All parameters/i })).toBeVisible();
      const more = tasks.getByRole("button", { name: "More", exact: true });
      await more.click();
      const menuBox = await bounds(page.getByRole("menu", { name: "More World tasks" }));
      expect(menuBox.x).toBeGreaterThanOrEqual(-2);
      expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewport.width + 2);
      await page.keyboard.press("Escape");
      await expect(more).toBeFocused();
      await page.getByRole("button", { name: "Focus world" }).click();
      await expect(tasks.getByRole("button", { name: "Show tools" })).toBeVisible();
      await expectNoDocumentOverflow(page);
      await tasks.getByRole("button", { name: "Show tools" }).click();
    }

    await expectNoDocumentOverflow(page);
    await expectDiagnosticsClean(diagnostics);
  });
}

test("task switching preserves the mounted stage and run state while collapse preserves tool state", async ({ page }) => {
  const diagnostics = observeDiagnostics(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page);
  const tasks = page.getByRole("navigation", { name: "World tasks" });
  const stage = page.locator(".world-stage");
  await stage.evaluate((element) => element.setAttribute("data-r2-mount-sentinel", "persistent"));
  await page.getByRole("button", { name: "Step exactly one tick" }).click();

  for (const task of ["Observe", "Change", "Compare", "Explain"] as const) {
    await tasks.getByRole("button", { name: task, exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: task })).toBeFocused();
    await expect(stage).toHaveAttribute("data-r2-mount-sentinel", "persistent");
    await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
  }

  for (const task of ["Experiments", "Diagnostics"] as const) {
    await tasks.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("menuitem", { name: new RegExp(task) }).click();
    await expect(page.getByRole("heading", { level: 2, name: task })).toBeFocused();
    await expect(stage).toHaveAttribute("data-r2-mount-sentinel", "persistent");
  }

  await tasks.getByRole("button", { name: "Setup", exact: true }).click();
  await page.getByRole("button", { name: /All parameters/i }).click();
  await page.getByRole("searchbox", { name: "Find a parameter" }).fill("alignment");
  const stageWidthBefore = (await bounds(stage)).width;
  await page.getByRole("button", { name: "Focus world" }).click();
  await expect(page.getByRole("complementary", { name: "Active World tool surface" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Show tools" })).toBeFocused();
  expect((await bounds(stage)).width).toBeGreaterThan(stageWidthBefore);
  await page.getByRole("button", { name: "Show tools" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Setup" })).toBeFocused();
  await expect(page.getByRole("searchbox", { name: "Find a parameter" })).toHaveValue("alignment");
  await expect(stage).toHaveAttribute("data-r2-mount-sentinel", "persistent");
  await expectDiagnosticsClean(diagnostics);
});

test("task keyboard order, URL aliases, focus entry, and scroll reset are deterministic", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page, "/world?template=flocking-boids&task=not-a-task");
  const tasks = page.getByRole("navigation", { name: "World tasks" });
  const setup = tasks.getByRole("button", { name: "Setup", exact: true });
  await expect(setup).toHaveAttribute("aria-pressed", "true");

  await setup.focus();
  await page.keyboard.press("End");
  await expect(tasks.getByRole("button", { name: "More", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tasks.getByRole("button", { name: "Explain", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(setup).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(tasks.getByRole("button", { name: "Observe", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "Observe" })).toBeFocused();
  await expect(page).toHaveURL(/task=observe/);

  await tasks.getByRole("button", { name: "Setup", exact: true }).click();
  await page.getByRole("button", { name: /All parameters/i }).click();
  const scroll = page.locator(".workspace-context-panel__scroll");
  await scroll.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  expect(await scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await tasks.getByRole("button", { name: "Change", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Change" })).toBeFocused();
  await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page).toHaveURL(/task=change/);

  const more = tasks.getByRole("button", { name: "More", exact: true });
  await more.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: /Experiments/ })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: /Diagnostics/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();
});

test("Setup layers quick controls, exact parameters, and starting recipes without hiding executed values", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page);
  await expect(page.getByRole("heading", { name: "Quick setup" })).toBeVisible();
  await expect(page.getByText(/Changing a key control rebuilds a paused tick-0 run immediately/)).toBeVisible();
  await expect(page.locator(".run-settings-quick .parameter-control")).toHaveCount(4);
  const allParametersButton = page.getByRole("button", { name: /All parameters/ });
  const expectedCount = Number((await allParametersButton.innerText()).match(/(\d+) exact values/)?.[1]);
  expect(expectedCount).toBeGreaterThan(4);

  await allParametersButton.click();
  await expect(page.getByRole("heading", { name: "All parameters" })).toBeFocused();
  await expect(page.locator(".world-task-subview:not([hidden]) .parameter-control")).toHaveCount(expectedCount);
  const search = page.getByRole("searchbox", { name: "Find a parameter" });
  await search.fill("alignment");
  expect(await page.locator(".world-task-subview:not([hidden]) .parameter-control").count()).toBeGreaterThan(0);
  expect(await page.locator(".world-task-subview:not([hidden]) .parameter-control").count()).toBeLessThan(expectedCount);
  await page.getByRole("button", { name: "Back to Setup" }).click();

  await page.getByRole("button", { name: "Choose recipe" }).click();
  await expect(page.getByRole("heading", { name: "Starting recipes and model variants" })).toBeFocused();
  await expect(page.getByText(/Scenarios define initial conditions/)).toBeVisible();
  await page.getByRole("button", { name: "Back to Setup" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Flocking / Boids" })).toBeFocused();
});

test("Observe prioritizes current metrics and keeps exact metrics and the visual key reachable", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page, "/world?template=epidemic-spread&task=observe");
  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  const primaryRows = page.locator("[data-observe-view='summary'] .world-metric-row");
  expect(await primaryRows.count()).toBeGreaterThanOrEqual(2);
  expect(await primaryRows.count()).toBeLessThanOrEqual(4);
  await expect(page.getByText(/Bounded traces are model output over simulated ticks/)).toHaveCount(1);

  const primaryCount = await primaryRows.count();
  await page.getByRole("button", { name: "All metrics" }).click();
  await expect(page.getByRole("heading", { name: "All model metrics" })).toBeFocused();
  expect(await page.locator("[data-observe-view='all'] .world-metric-row").count()).toBeGreaterThanOrEqual(primaryCount);
  await expect(page.getByText(/not empirical measurements or validation evidence/)).toBeVisible();
  await page.getByRole("button", { name: "Back to Observe" }).click();
  await page.getByRole("button", { name: "Visual key and display" }).click();
  await expect(page.getByRole("heading", { name: "Visual key and display" })).toBeFocused();
  await expect(page.locator(".legend-panel-shell")).toBeVisible();
});

test("Change distinguishes current-run perturbations from fresh-run setup and reports feedback", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page, "/world?template=neural-excitation-network&task=change");
  await expect(page.getByText("Live change", { exact: true })).toBeVisible();
  await expect(page.getByText(/Applies to the current run through engine-checked commands without advancing time/)).toBeVisible();
  await expect(page.getByText("Setup change", { exact: true })).toBeVisible();
  await expect(page.getByText(/rebuild a fresh run at tick 0/)).toBeVisible();
  await expect(page.getByText(/does not establish real-world effectiveness or causal proof/)).toBeVisible();
  await page.getByRole("button", { name: "Apply Increase Global Excitation" }).click();
  await expect(page.locator(".world-action-feedback")).toContainText("Change applied: Increase Global Excitation at tick 0");

  await page.getByRole("button", { name: "Open Setup" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Setup" })).toBeFocused();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");

  await page.goto("/world?template=epidemic-spread&task=change", { waitUntil: "domcontentloaded" });
  await page.getByRole("combobox", { name: "Intervention type" }).selectOption({ label: "Infect Selected Agent" });
  await expect(page.getByRole("button", { name: "Apply Infect Selected Agent" })).toBeDisabled();
  await expect(page.getByText(/Select the required target in the World Stage/)).toBeVisible();
  const setupChangeLabel = await bounds(page.locator(".world-setup-change-link strong"));
  const setupChangeCopy = await bounds(page.locator(".world-setup-change-link span"));
  expect(setupChangeLabel.y + setupChangeLabel.height).toBeLessThanOrEqual(setupChangeCopy.y);
});

test("Compare leads with run purpose while preserving bounded local comparison storage", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page, "/world?template=flocking-boids&task=compare");
  const storageKeysBefore = await page.evaluate(() => Object.keys(localStorage).sort());
  await expect(page.getByRole("heading", { name: "Current run", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saved comparison runs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Differences" })).toBeVisible();
  await page.getByRole("textbox", { name: "Run label" }).fill("R2 baseline");
  await page.getByRole("button", { name: "Capture Run" }).click();
  await expect(page.locator(".run-library").getByRole("textbox", { name: "Label" })).toHaveValue("R2 baseline");
  const storageAfterCapture = await page.evaluate(() => ({
    keys: Object.keys(localStorage).sort(),
    comparison: localStorage.getItem("ortus.runComparison.v1")
  }));
  expect(storageAfterCapture.keys.filter((key) => !storageKeysBefore.includes(key))).toEqual(["ortus.runComparison.v1"]);
  expect(storageAfterCapture.comparison).toContain("R2 baseline");
  expect(storageAfterCapture.comparison).not.toContain("\"world\"");
  await expect(page.getByText(/Saved World comparisons are local run summaries/)).toHaveCount(1);

  await page.getByRole("button", { name: "Open exchange" }).click();
  await expect(page.getByRole("heading", { name: "Scenario and snapshot exchange" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Export Scenario", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to Compare" }).click();
  await expect(page.getByRole("heading", { name: "Current run", exact: true })).toBeFocused();
});

test("Explain uses six concise sections and a focus-managed complete model reference", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page, "/world?template=opinion-dynamics&task=understand");
  for (const heading of ["Question", "How it works", "What to watch", "Try changing", "Key assumptions", "Main limitation"]) {
    await expect(page.getByRole("heading", { name: heading, level: 3 })).toBeVisible();
  }
  const trigger = page.getByRole("button", { name: "Full model notes" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Opinion Dynamics" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Complete assumptions" })).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Complete limitations" })).toBeVisible();
  expect(await dialog.innerText()).not.toMatch(/Builder graphs|model-schema graphs|NetLogo|Mesa|MASON/i);
  await dialog.getByRole("button", { name: "Close model reference" }).click();
  await expect(trigger).toBeFocused();

  await page.getByRole("button", { name: "Run details" }).click();
  const runDetails = page.getByRole("dialog", { name: "Technical run details" });
  await expect(runDetails.getByRole("heading", { name: "Active Run Provenance" })).toBeVisible();
  await runDetails.getByRole("button", { name: "Close run details" }).click();
  await expect(page.getByRole("button", { name: "Run details" })).toBeFocused();
});

test("More is a structured two-group menu and expert tools remain functional", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page);
  const more = page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "More", exact: true });
  await more.click();
  const menu = page.getByRole("menu", { name: "More World tasks" });
  await expect(menu).toContainText("Investigate");
  await expect(menu).toContainText("Inspect");
  await expect(menu.getByRole("menuitem")).toHaveCount(2);
  await menu.getByRole("menuitem", { name: /Experiments/ }).click();
  await expect(page.locator(".experiment-panel")).toBeVisible();
  await more.click();
  await menu.getByRole("menuitem", { name: /Diagnostics/ }).click();
  await expect(page.locator(".debug-panel-embedded")).toBeVisible();
  await expect(page.getByText("Template", { exact: true })).toBeVisible();
});

test("Flocking, Epidemic, and Neural keep one stable stage across every World task", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const templateId of ["flocking-boids", "epidemic-spread", "neural-excitation-network"] as const) {
    await openWorld(page, `/world?template=${templateId}`);
    const tasks = page.getByRole("navigation", { name: "World tasks" });
    const stage = page.locator(".world-stage");
    const initial = await bounds(stage);

    for (const task of ["Setup", "Observe", "Change", "Compare", "Explain"] as const) {
      await tasks.getByRole("button", { name: task, exact: true }).click();
      await expect(page.getByRole("heading", { level: 2, name: task })).toBeVisible();
      const current = await bounds(stage);
      expect(Math.abs(current.width - initial.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(current.height - initial.height)).toBeLessThanOrEqual(1);
    }

    for (const task of ["Experiments", "Diagnostics"] as const) {
      await tasks.getByRole("button", { name: "More", exact: true }).click();
      await page.getByRole("menuitem", { name: new RegExp(task) }).click();
      await expect(page.getByRole("heading", { level: 2, name: task })).toBeVisible();
      const current = await bounds(stage);
      expect(Math.abs(current.width - initial.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(current.height - initial.height)).toBeLessThanOrEqual(1);
    }
  }
});

for (const templateId of templateIds) {
  test(`${templateId} renders a nonblank bounded World stage`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openWorld(page, `/world?template=${templateId}`);
    const canvas = page.getByRole("img", { name: "Simulation world. Agents are rendered from the latest engine snapshot." });
    const pixels = await canvas.evaluate((element) => {
      const target = element as HTMLCanvasElement;
      const context = target.getContext("2d");
      if (!context || target.width === 0 || target.height === 0) return { colors: 0, nonTransparent: 0 };
      const data = context.getImageData(0, 0, target.width, target.height).data;
      const colors = new Set<string>();
      let nonTransparent = 0;
      const stride = Math.max(4, Math.floor((target.width * target.height) / 8_000) * 4);
      for (let index = 0; index < data.length; index += stride) {
        if ((data[index + 3] ?? 0) > 0) nonTransparent += 1;
        colors.add(`${data[index]},${data[index + 1]},${data[index + 2]},${data[index + 3]}`);
      }
      return { colors: colors.size, nonTransparent };
    });
    expect(pixels.colors).toBeGreaterThan(2);
    expect(pixels.nonTransparent).toBeGreaterThan(50);
    expect((await bounds(page.locator(".world-stage"))).width).toBeGreaterThan(500);
  });
}

test("representative World states are Axe-clean with no duplicate IDs or hidden focus targets", async ({ page }) => {
  const diagnostics = observeDiagnostics(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorld(page);
  const tasks = page.getByRole("navigation", { name: "World tasks" });

  for (const task of ["Setup", "Observe", "Change", "Compare", "Explain"] as const) {
    await tasks.getByRole("button", { name: task, exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: task })).toBeFocused();
    await expect(page).toHaveTitle("World | ORTUS");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((violation) => violation.id), `${task} Axe violations`).toEqual([]);
  }

  await page.getByRole("button", { name: "Full model notes" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
  await page.getByRole("button", { name: "Close model reference" }).click();
  await page.getByRole("button", { name: "Run details" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
  await page.getByRole("button", { name: "Close run details" }).click();

  const structuralState = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>("[id]")).map((element) => element.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    const visibleInsideHidden = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[hidden] a[href], [hidden] button:not([disabled]), [hidden] input:not([disabled]), [hidden] select:not([disabled]), [hidden] textarea:not([disabled]), [hidden] [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length > 0).length;
    return { duplicateIds: [...new Set(duplicateIds)], visibleInsideHidden };
  });
  expect(structuralState).toEqual({ duplicateIds: [], visibleInsideHidden: 0 });
  await expectDiagnosticsClean(diagnostics);
});

test.describe("R2 reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("task, collapse, playback, and modal interactions remain usable", async ({ page }) => {
    const diagnostics = observeDiagnostics(page);
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openWorld(page);
    await expect(page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).resolves.toBe(true);
    await page.getByRole("button", { name: "Step exactly one tick" }).click();
    await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Explain" }).click();
    await page.getByRole("button", { name: "Full model notes" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Full model notes" })).toBeFocused();
    await page.getByRole("button", { name: "Focus world" }).click();
    await page.getByRole("button", { name: "Show tools" }).click();
    await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
    await expectDiagnosticsClean(diagnostics);
  });
});
