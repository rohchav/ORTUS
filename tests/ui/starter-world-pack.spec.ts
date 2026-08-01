import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const collectionPath = "/worlds/packs/local-rules-global-patterns";
const flagshipWorlds = [
  {
    id: "coordination-under-sensor-noise",
    slug: "coordination-under-sensor-noise",
    title: "Coordination Under Sensor Noise",
    parent: "Collective Motion",
    templateId: "flocking-boids",
    baseline: { id: "coordination-clear-signals", title: "Clear local signals", preset: "Random Headings", seed: "c2-coordination-001", parameter: "Noise", value: "0.01" },
    contrast: { id: "coordination-noisy-signals", title: "Noisy local signals", preset: "Random Headings", seed: "c2-coordination-001", parameter: "Noise", value: "0.28" },
    outputs: ["Alignment score", "Dispersion"]
  },
  {
    id: "clustered-outbreak-starts",
    slug: "clustered-outbreak-starts",
    title: "Clustered Outbreak Starts",
    parent: "Local Contact Outbreaks",
    templateId: "epidemic-spread",
    baseline: { id: "outbreak-one-cluster", title: "One concentrated cluster", preset: "Single Cluster Outbreak", seed: "c2-outbreak-001", parameter: "Initial infected", value: "9" },
    contrast: { id: "outbreak-separated-hotspots", title: "Several separated hotspots", preset: "Multiple Hotspots", seed: "c2-outbreak-001", parameter: "Initial infected", value: "9" },
    outputs: ["Infected count", "Recovered count"]
  },
  {
    id: "predator-pressure-recovery",
    slug: "predator-pressure-and-recovery",
    title: "Predator Pressure and Recovery",
    parent: "Predator-Prey Cycles",
    templateId: "predator-prey",
    baseline: { id: "predator-recovery-margin", title: "Recovery margin", preset: "Random Ecology", seed: "c2-predator-001", parameter: "Initial predators", value: "2" },
    contrast: { id: "predator-high-pressure", title: "High predator pressure", preset: "Random Ecology", seed: "c2-predator-001", parameter: "Initial predators", value: "12" },
    outputs: ["Prey count", "Predator count"]
  },
  {
    id: "patch-density-firebreaks",
    slug: "patch-density-and-firebreaks",
    title: "Patch Density and Firebreaks",
    parent: "Landscape Spread",
    templateId: "forest-fire",
    baseline: { id: "fire-connected-fuel", title: "Connected fuel", preset: "Central Ignition", seed: "c2-firebreak-001", parameter: "Spread probability", value: "1" },
    contrast: { id: "fire-corridor-break", title: "Firebreak corridor", preset: "Firebreak Corridor", seed: "c2-firebreak-001", parameter: "Spread probability", value: "1" },
    outputs: ["Active fires", "Burned cells"]
  }
] as const;

const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "wide", width: 1280, height: 720 },
  { label: "tablet", width: 1024, height: 768 },
  { label: "narrow", width: 900, height: 700 },
  { label: "short", width: 1280, height: 600 },
  { label: "mobile", width: 390, height: 844 }
] as const;

for (const viewport of viewports) {
  test(`featured collection and direct route remain coherent at ${viewport.label} ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const diagnostics = observePageDiagnostics(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/worlds", { waitUntil: "domcontentloaded" });
    const feature = page.locator("[data-featured-collection='local-rules-global-patterns']");
    await expect(feature).toBeVisible();
    await expect(feature.getByRole("heading", { name: "Local Rules, Global Patterns" })).toBeVisible();
    await expect(feature.getByRole("listitem")).toHaveCount(4);
    await expect(feature.getByRole("link", { name: "Open collection: Local Rules, Global Patterns" })).toBeVisible();
    await expect(page.locator("[data-starter-card]")).toHaveCount(11);
    await expectNoHorizontalOverflow(page);
    await page.waitForLoadState("networkidle");

    await page.goto(collectionPath, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-starter-pack='local-rules-global-patterns']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Local Rules, Global Patterns" })).toHaveCount(1);
    await expect(page.locator("[data-pack-world]")).toHaveCount(4);
    await expect(page.getByText(/not empirical experiments/i)).toHaveCount(1);
    await expectNoHorizontalOverflow(page);
    await page.waitForLoadState("networkidle");
    await expectNoDiagnostics(diagnostics);
  });
}

test("catalog search and every existing filter include the four flagship worlds without hiding the original seven", async ({ page }) => {
  await page.goto("/worlds", { waitUntil: "networkidle" });
  for (const world of flagshipWorlds) {
    await page.getByLabel("Search worlds").fill(world.title);
    await expect(page.locator("[data-starter-card]")).toHaveCount(1);
    await expect(page.locator(`[data-starter-card='${world.id}']`)).toBeVisible();
  }
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Domain", { exact: true }).selectOption("population-dynamics");
  await expect(page.locator("[data-starter-card='clustered-outbreak-starts']")).toBeVisible();
  await expect(page.locator("[data-starter-card='predator-pressure-recovery']")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Mechanism", { exact: true }).selectOption("stochastic-transition");
  for (const world of flagshipWorlds) {
    await expect(page.locator(`[data-starter-card='${world.id}']`)).toBeVisible();
  }
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("System form", { exact: true }).selectOption("grid");
  await expect(page.locator("[data-starter-card='patch-density-firebreaks']")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Complexity", { exact: true }).selectOption("layered");
  for (const world of flagshipWorlds) {
    await expect(page.locator(`[data-starter-card='${world.id}']`)).toBeVisible();
  }
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("[data-starter-card]")).toHaveCount(11);
});

test("collection route gives each system a specific question, controlled difference, output, and direct action", async ({ page }) => {
  await page.goto(collectionPath, { waitUntil: "domcontentloaded" });
  for (const world of flagshipWorlds) {
    const item = page.locator(`[data-pack-world='${world.id}']`);
    await expect(item).toContainText(world.title);
    await expect(item.getByText("Controlled difference", { exact: true })).toBeVisible();
    await expect(item.getByText("Compare", { exact: true })).toBeVisible();
    await expect(item.getByRole("link", { name: `Open ${world.title}` })).toHaveAttribute("href", `/worlds/${world.slug}`);
  }
  const outbreak = page.locator("[data-pack-world='clustered-outbreak-starts']");
  await expect(outbreak).toContainText("Starting arrangement: Single Cluster Outbreak versus Multiple Hotspots");
  await expect(outbreak).not.toContainText("Center X");
  await expect(page.getByText(/do not share one mathematical model/i)).toBeVisible();
  await expect(page.getByText(/no progress is stored/i)).toBeVisible();
});

test("all four flagship details preserve action-first hierarchy and expose exact prepared pairs", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const world of flagshipWorlds) {
    const diagnostics = observePageDiagnostics(page);
    await page.goto(`/worlds/${world.slug}`, { waitUntil: "networkidle" });
    const detail = page.locator(`[data-world-detail='${world.id}']`);
    await expect(detail).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: world.title })).toBeVisible();
    await expect(detail.getByText(`A focused investigation built on ${world.parent}.`)).toBeVisible();
    for (const heading of [
      "Inside this world",
      "How the system works",
      "Prepared comparison",
      "What to watch",
      "Things to investigate",
      "Research connection",
      "Main model boundary",
      "Remix directions"
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    }
    await expect(detail.locator(`[data-starter-recipe='${world.baseline.id}']`)).toContainText("Baseline");
    await expect(detail.locator(`[data-starter-recipe='${world.contrast.id}']`)).toContainText("Contrast");
    await expect(detail.getByRole("link", { name: `Launch baseline: ${world.baseline.title}` }).first()).toHaveAttribute(
      "href",
      `/world?starter=${world.id}&recipe=${world.baseline.id}`
    );
    await expect(detail.getByRole("link", { name: `Launch contrast: ${world.contrast.title}` })).toHaveAttribute(
      "href",
      `/world?starter=${world.id}&recipe=${world.contrast.id}`
    );
    await expect(detail.getByText(/what remains controlled/i).first()).toBeVisible();
    await expect(detail.getByText("Tick-0 state", { exact: true })).toBeVisible();
    for (const output of world.outputs) {
      await expect(detail.getByText(output, { exact: true }).first()).toBeVisible();
    }
    await expect(detail.getByText(/does not establish robustness, causality, or empirical validity/i)).toBeVisible();
    if (world.id === "clustered-outbreak-starts") {
      const outbreakSides = detail.locator("[data-starter-visual='clustered-outbreaks'] .starter-world-visual__paired > div");
      await expect(outbreakSides).toHaveCount(2);
      await expect(outbreakSides.nth(0).locator(".starter-world-visual__outbreak-node")).toHaveCount(9);
      await expect(outbreakSides.nth(1).locator(".starter-world-visual__outbreak-node")).toHaveCount(9);
    }
    if (world.id === "patch-density-firebreaks") {
      await expect(detail.getByText(/2,399 fuel cells and 1 burning cell/i)).toBeVisible();
      await expect(detail.getByText(/changes both fuel arrangement and fuel quantity/i)).toBeVisible();
      for (const recipeId of [world.baseline.id, world.contrast.id]) {
        const recipe = detail.locator(`[data-starter-recipe='${recipeId}']`);
        await expect(recipe).toContainText("Spread probability1");
        await expect(recipe).toContainText("Neighbor modevonNeumann");
        await expect(recipe).toContainText("Boundary modeclosed");
        await expect(recipe).toContainText("Seedc2-firebreak-001");
      }
    }
    await expectNoHorizontalOverflow(page);
    await expectNoDiagnostics(diagnostics);
  }
});

test("mobile flagship detail keeps baseline, contrast cue, visual, and recipe actions reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/worlds/coordination-under-sensor-noise", { waitUntil: "domcontentloaded" });
  const hero = page.locator(".world-detail__hero");
  await expect(hero.getByRole("link", { name: "Launch baseline: Clear local signals" })).toBeVisible();
  await expect(hero.getByText("Paired contrast available: Noisy local signals")).toBeVisible();
  await expect(hero.locator("[data-starter-visual='coordination-noise']")).toBeVisible();
  await expect(page.getByRole("link", { name: "Launch contrast: Noisy local signals" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(await countNestedScrollRegions(page, ".world-detail")).toBe(0);
});

test("all eight recipe URLs create the intended fresh paused run and compact definition-backed context", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const world of flagshipWorlds) {
    for (const recipe of [world.baseline, world.contrast]) {
      const diagnostics = observePageDiagnostics(page);
      await page.goto(`/world?starter=${world.id}&recipe=${recipe.id}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
      await expect(page.getByLabel("World template")).toHaveValue(world.templateId);
      await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
      await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
      await expect(page.getByRole("button", { name: "Observe", exact: true })).toHaveAttribute("aria-current", "page");
      const nudge = page.locator(`[data-starter-nudge][data-starter-recipe-id='${recipe.id}']`);
      await expect(nudge).toContainText(`Exploring: ${world.title}`);
      await expect(nudge).toContainText(`Recipe: ${recipe.title}`);
      await expect(nudge.getByRole("link", { name: "Back to collection" })).toHaveAttribute("href", collectionPath);
      const sibling = recipe.id === world.baseline.id ? world.contrast : world.baseline;
      await expect(nudge.getByRole("link", { name: new RegExp(`Launch .*${escapeRegex(sibling.title)}`) })).toHaveAttribute(
        "href",
        `/world?starter=${world.id}&recipe=${sibling.id}`
      );
      await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Setup" }).click();
      await page.getByRole("button", { name: /All parameters/ }).click();
      await expect(page.getByRole("spinbutton", { name: `${recipe.parameter} numeric value` })).toHaveValue(recipe.value);
      await page.getByRole("button", { name: "Run details" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toContainText(recipe.title);
      await expect(dialog).toContainText(recipe.preset);
      await expect(dialog).toContainText(recipe.seed);
      await dialog.getByRole("button", { name: "Close run details" }).click();
      await expectNoDiagnostics(diagnostics);
    }
  }
});

test("sibling navigation replaces running state, preserves explicit drafts and comparisons, moves focus, and keeps Back coherent", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/worlds/coordination-under-sensor-noise", { waitUntil: "domcontentloaded" });
  const detailUrl = page.url();
  await page.getByRole("link", { name: "Launch baseline: Clear local signals" }).first().click();
  await expect(page.locator("[data-starter-recipe-id='coordination-clear-signals']")).toBeVisible();

  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Compare" }).click();
  await page.getByLabel("Run label").fill("Existing comparison summary");
  await page.getByRole("button", { name: "Capture Run" }).click();
  await expect(page.getByLabel("Label", { exact: true })).toHaveValue("Existing comparison summary");

  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Setup" }).click();
  await page.getByRole("button", { name: /All parameters/ }).click();
  const noiseDraft = page.getByRole("spinbutton", { name: "Noise numeric value" });
  await noiseDraft.fill("0.2");
  await expect(noiseDraft.locator("xpath=ancestor::label").locator(".parameter-control__mode")).toHaveText(
    "Active run: 0.01. Draft pending."
  );

  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Change" }).click();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(async () => Number(await page.locator(".timeline-strip__readout strong").first().textContent())).toBeGreaterThan(2);
  const storageBeforeSibling = await readStorage(page);
  const sibling = page.getByRole("link", { name: "Launch contrast: Noisy local signals" });
  await sibling.focus();
  await sibling.press("Enter");
  const contrastNudge = page.locator("[data-starter-recipe-id='coordination-noisy-signals']");
  await expect(contrastNudge).toBeVisible();
  await expect(contrastNudge).toBeFocused();
  await expect(page).toHaveURL(/starter=coordination-under-sensor-noise&recipe=coordination-noisy-signals/);
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");

  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Setup" }).click();
  const allParameters = page.getByRole("button", { name: /All parameters/ });
  if (await allParameters.isVisible()) {
    await allParameters.click();
  }
  const contrastNoise = page.getByRole("spinbutton", { name: "Noise numeric value" });
  await expect(contrastNoise).toHaveValue("0.2");
  await expect(contrastNoise.locator("xpath=ancestor::label").locator(".parameter-control__mode")).toHaveText(
    "Active run: 0.28. Draft pending."
  );
  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Compare" }).click();
  await expect(page.getByLabel("Label", { exact: true })).toHaveValue("Existing comparison summary");
  expect(await readStorage(page)).toEqual(storageBeforeSibling);

  await page.goBack();
  await expect(page.locator("[data-starter-recipe-id='coordination-noisy-signals']")).toBeVisible();
  await page.goBack();
  await expect(page.locator("[data-starter-recipe-id='coordination-noisy-signals']")).toBeVisible();
  await page.goBack();
  await expect(page.locator("[data-starter-recipe-id='coordination-clear-signals']")).toBeVisible();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  for (let index = 0; index < 4 && page.url() !== detailUrl; index += 1) {
    await page.goBack();
    if (page.url() !== detailUrl) {
      await expect(page.locator("[data-starter-recipe-id='coordination-clear-signals']")).toBeVisible();
    }
  }
  await expect(page.url()).toBe(detailUrl);

  await page.getByRole("link", { name: "Launch baseline: Clear local signals" }).first().click();
  const storageBefore = await readStorage(page);
  await page.getByRole("button", { name: "Dismiss Coordination Under Sensor Noise starter steps" }).click();
  await expect(page.locator("[data-starter-nudge]")).toHaveCount(0);
  await expect(page.getByLabel("Simulation world stage")).toBeFocused();
  expect(await readStorage(page)).toEqual(storageBefore);
});

test("recipe reload remains fresh and task navigation preserves the mounted active run", async ({ page }) => {
  await page.goto("/world?starter=predator-pressure-recovery&recipe=predator-recovery-margin", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Compare" }).click();
  await expect(page).toHaveURL(/task=compare/);
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 2, name: "Compare" })).toBeVisible();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await expect(page.locator("[data-starter-recipe-id='predator-recovery-margin']")).toBeVisible();
});

test("invalid recipe requests are announced and stop before any World construction", async ({ page }) => {
  const invalidPaths = [
    "/world?starter=coordination-under-sensor-noise",
    "/world?recipe=coordination-clear-signals",
    "/world?starter=missing-starter&recipe=coordination-clear-signals",
    "/world?starter=coordination-under-sensor-noise&recipe=missing-recipe",
    "/world?starter=coordination-under-sensor-noise&recipe=outbreak-one-cluster",
    "/world?starter=coordination-under-sensor-noise&starter=clustered-outbreak-starts&recipe=coordination-clear-signals",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&recipe=coordination-noisy-signals",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&noise=0.5",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&preset=stale-preset",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&task=predict",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&template=epidemic-spread",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&scenario=random-headings",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&parameters=%7B%22noise%22%3A0.5%7D",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&runConfig=%7B%7D",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&payload=%7B%22templateId%22%3A%22flocking-boids%22%7D",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&__proto__=%7B%22polluted%22%3Atrue%7D",
    "/world?starter=%20&recipe=coordination-clear-signals",
    "/world?starter=coordination-under-sensor-noise&recipe=Bad%20Recipe",
    "/world?starter=coordination-under-sensor-noise&recipe="
  ];
  for (const path of invalidPaths) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-starter-launch-error]")).toBeVisible();
    await expect(page.locator("[role='alert']")).toContainText("This world could not be prepared safely");
    await expect(page.locator(".ortus-shell")).toHaveCount(0);
    await expect(page.locator(".world-stage")).toHaveCount(0);
  }

  await page.goto(
    "/world?recipe=coordination-clear-signals&starter=coordination-under-sensor-noise",
    { waitUntil: "domcontentloaded" }
  );
  await expect(page.locator("[data-starter-recipe-id='coordination-clear-signals']")).toBeVisible();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
});

test("catalog, collection, every detail, recipe states, and invalid state are Axe-clean and diagnostically quiet", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/worlds",
    collectionPath,
    "/worlds/coordination-under-sensor-noise",
    "/worlds/clustered-outbreak-starts",
    "/worlds/predator-pressure-and-recovery",
    "/worlds/patch-density-and-firebreaks",
    "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals",
    "/world?starter=clustered-outbreak-starts&recipe=outbreak-separated-hotspots",
    "/world?starter=patch-density-firebreaks&recipe=fire-corridor-break",
    "/world?starter=coordination-under-sensor-noise&recipe=missing-recipe"
  ]) {
    const diagnostics = observePageDiagnostics(page);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    if (path.includes("recipe=") && !path.includes("missing")) {
      await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
    }
    expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id), path).toEqual([]);
    await expectNoHorizontalOverflow(page);
    await expectNoDiagnostics(diagnostics);
  }
});

test("mobile recipe World keeps the stage reachable and recipe actions keyboard-operable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/world?starter=patch-density-firebreaks&recipe=fire-corridor-break", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Simulation world stage")).toBeVisible();
  const sibling = page.getByRole("link", { name: "Launch baseline: Connected fuel" });
  await sibling.focus();
  await expect(sibling).toBeFocused();
  await sibling.press("Enter");
  const baselineNudge = page.locator("[data-starter-recipe-id='fire-connected-fuel']");
  await expect(baselineNudge).toBeVisible();
  await expect(baselineNudge).toBeFocused();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await expectNoHorizontalOverflow(page);
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

async function countNestedScrollRegions(page: Page, selector: string): Promise<number> {
  return page.locator(selector).evaluate((root) =>
    [...root.querySelectorAll<HTMLElement>("*")].filter((element) => {
      const style = getComputedStyle(element);
      return style.overflowY === "auto" || style.overflowY === "scroll";
    }).length
  );
}

async function readStorage(page: Page) {
  return page.evaluate(() => ({
    local: Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]),
    session: Object.keys(sessionStorage).sort().map((key) => [key, sessionStorage.getItem(key)])
  }));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
