import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const worlds = [
  {
    id: "flocking",
    slug: "collective-motion",
    title: "Collective Motion",
    templateId: "flocking-boids",
    scenarioId: "random-headings",
    scenarioLabel: "Random Headings",
    scenarioName: "Flocking baseline",
    firstChange: "Alignment weight",
    suggestedValue: "0.2",
    outputLabel: "Alignment score"
  },
  {
    id: "epidemic",
    slug: "local-contact-outbreaks",
    title: "Local Contact Outbreaks",
    templateId: "epidemic-spread",
    scenarioId: "random-outbreak",
    scenarioLabel: "Random Outbreak",
    scenarioName: "Epidemic Spread baseline",
    firstChange: "Infection probability",
    suggestedValue: "0.1",
    outputLabel: "Infected"
  },
  {
    id: "opinion-dynamics",
    slug: "opinion-formation",
    title: "Opinion Formation",
    templateId: "opinion-dynamics",
    scenarioId: "random-opinions",
    scenarioLabel: "Random Opinions",
    scenarioName: "Opinion Dynamics baseline",
    firstChange: "Influence strength",
    suggestedValue: "0.35",
    outputLabel: "Polarization score"
  },
  {
    id: "predator-prey",
    slug: "predator-prey-cycles",
    title: "Predator-Prey Cycles",
    templateId: "predator-prey",
    scenarioId: "random-ecology",
    scenarioLabel: "Random Ecology",
    scenarioName: "Predator-Prey baseline",
    firstChange: "Predator energy loss",
    suggestedValue: "0.45",
    outputLabel: "Prey count"
  },
  {
    id: "schelling",
    slug: "neighborhood-patterns",
    title: "Neighborhood Patterns",
    templateId: "schelling-segregation",
    scenarioId: "random-neighborhood",
    scenarioLabel: "Random Neighborhood",
    scenarioName: "Schelling Segregation baseline",
    firstChange: "Similarity threshold",
    suggestedValue: "0.5",
    outputLabel: "Satisfaction rate"
  },
  {
    id: "forest-spread",
    slug: "landscape-spread",
    title: "Landscape Spread",
    templateId: "forest-fire",
    scenarioId: "random-forest",
    scenarioLabel: "Random Forest",
    scenarioName: "Forest Fire baseline",
    firstChange: "Spread probability",
    suggestedValue: "0.25",
    outputLabel: "Active fires"
  },
  {
    id: "neural-excitation",
    slug: "signal-cascades",
    title: "Signal Cascades",
    templateId: "neural-excitation-network",
    scenarioId: "inhibition-stabilized-cascade",
    scenarioLabel: "Inhibition-Stabilized Cascade",
    scenarioName: "Neural Excitation Network baseline",
    firstChange: "Global threshold",
    suggestedValue: "1.4",
    outputLabel: "Cascade size"
  }
] as const;

const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "wide-short", width: 1280, height: 720 },
  { label: "tablet", width: 1024, height: 768 },
  { label: "narrow", width: 900, height: 700 },
  { label: "short", width: 1280, height: 600 },
  { label: "mobile", width: 390, height: 844 }
] as const;

for (const viewport of viewports) {
  test(`Explore Worlds preserves its hierarchy at ${viewport.label} ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const diagnostics = observePageDiagnostics(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/worlds", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-worlds-catalog]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Explore Worlds" })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Local Rules, Global Patterns" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open collection: Local Rules, Global Patterns" })).toHaveAttribute(
      "href",
      "/worlds/packs/local-rules-global-patterns"
    );
    await expect(page.locator("[data-starter-card]")).toHaveCount(11);
    await expect(page.getByLabel("Explore Worlds filters")).toBeVisible();
    await expect(page.getByLabel("Search worlds")).toBeVisible();
    await expect(page.getByText("Active filters:")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const firstCard = page.locator("[data-starter-card]").first();
    const firstCardBounds = await firstCard.boundingBox();
    expect(firstCardBounds).not.toBeNull();
    expect(firstCardBounds!.y).toBeLessThan(viewport.height);
    await expectNoDiagnostics(diagnostics);
  });
}

test("mobile catalog keeps search immediate and filters explicitly disclosable without persistence", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/worlds", { waitUntil: "networkidle" });
  const toggle = page.getByRole("button", { name: "Filters", exact: true });
  const domain = page.getByLabel("Domain", { exact: true });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByLabel("Search worlds")).toBeVisible();
  await expect(domain).not.toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(domain).toBeVisible();
  await domain.selectOption("population-dynamics");
  await expect(page.locator("[data-starter-card='predator-pressure-recovery']")).toBeVisible();
  await toggle.click();
  await expect(domain).not.toBeVisible();
  await expect(page.getByText("Domain: Population dynamics")).toBeVisible();
});

test("catalog card actions have world-specific accessible names and visuals remain non-quantitative", async ({ page }) => {
  await page.goto("/worlds", { waitUntil: "domcontentloaded" });
  for (const world of worlds) {
    await expect(
      page.locator(`[data-starter-card='${world.id}']`).getByRole("link", { name: `Explore ${world.title}`, exact: true })
    ).toHaveAttribute("href", `/worlds/${world.slug}`);
  }
  const ecologyVisual = page.locator("[data-starter-card='predator-prey'] [data-starter-visual='population-cycle']");
  await expect(ecologyVisual.locator(".starter-world-visual__prey")).not.toHaveCount(0);
  await expect(ecologyVisual.locator(".starter-world-visual__predator")).not.toHaveCount(0);
  await expect(ecologyVisual.locator(".starter-world-visual__cycle-bar")).toHaveCount(0);
});

test("catalog filters, combined filters, search, empty state, reset, keyboard input, and session-only state are deterministic", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/worlds", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  const storageBefore = await readStorage(page);

  await page.getByLabel("Domain", { exact: true }).selectOption("networks-and-signals");
  await expect(page.locator("[data-starter-card]")).toHaveCount(1);
  await expect(page.locator("[data-starter-card='neural-excitation']")).toBeVisible();
  await expect(page.getByText("Domain: Networks and signals")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await page.getByLabel("Mechanism", { exact: true }).selectOption("threshold");
  await expect(page.locator("[data-starter-card]")).toHaveCount(2);
  await expect(page.locator("[data-starter-card='schelling']")).toBeVisible();
  await expect(page.locator("[data-starter-card='neural-excitation']")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await page.getByLabel("System form", { exact: true }).selectOption("grid");
  await expect(page.locator("[data-starter-card]")).toHaveCount(3);
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await page.getByLabel("Complexity", { exact: true }).selectOption("quick-start");
  await expect(page.locator("[data-starter-card]")).toHaveCount(2);
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await page.getByLabel("Domain", { exact: true }).selectOption("living-systems");
  await page.getByLabel("System form", { exact: true }).selectOption("grid");
  await page.getByLabel("Complexity", { exact: true }).selectOption("layered");
  await expect(page.locator("[data-starter-card]")).toHaveCount(2);
  await expect(page.locator("[data-starter-card='forest-spread']")).toBeVisible();
  await expect(page.locator("[data-starter-card='patch-density-firebreaks']")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  const search = page.getByLabel("Search worlds");
  await search.focus();
  await expect(search).toBeFocused();
  await search.fill("delayed excitation");
  await expect(page.locator("[data-starter-card]")).toHaveCount(1);
  await expect(page.locator("[data-starter-card='neural-excitation']")).toBeVisible();
  await search.fill("  DELAYED---EXCITATION!!!  ");
  await expect(page.locator("[data-starter-card='neural-excitation']")).toBeVisible();
  await search.fill("future unicorn economy");
  await expect(page.locator("[data-starter-card]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No runnable worlds match this combination" })).toBeVisible();
  await expect(page.getByText(/does not add planned or imaginary results/i)).toBeVisible();
  await page.getByRole("button", { name: "Reset browse controls" }).press("Enter");
  await expect(page.locator("[data-starter-card]")).toHaveCount(11);
  await expect(page.getByText("Active filters: None")).toBeVisible();
  expect(await readStorage(page)).toEqual(storageBefore);
});

test("every detail route exposes the required invitation, anatomy, investigation, evidence boundary, remix path, and launch", async ({ page }) => {
  test.setTimeout(90_000);
  for (const world of worlds) {
    const diagnostics = observePageDiagnostics(page);
    await page.goto(`/worlds/${world.slug}`, { waitUntil: "networkidle" });
    const detail = page.locator(`[data-world-detail='${world.id}']`);
    await expect(detail).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: world.title })).toHaveCount(1);
    for (const heading of [
      "Inside this world",
      "How the system works",
      "Start here",
      "Things to investigate",
      "Research connection",
      "What this world leaves out",
      "Remix directions"
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    }
    await expect(detail.getByText(world.firstChange, { exact: false }).first()).toBeVisible();
    await expect(detail.locator(".world-detail__anatomy > section")).not.toHaveCount(0);
    await expect(detail.locator(".world-detail__prompts > li")).toHaveCount(world.id === "neural-excitation" ? 4 : 3);
    await expect(detail.locator(".world-detail__research li")).not.toHaveCount(0);
    await expect(detail.locator(".world-detail__research-boundary")).toHaveCount(1);
    await expect(detail.getByText(/do not validate or calibrate this implementation/i)).toBeVisible();
    await expect(detail).not.toContainText(world.scenarioId);
    await expect(detail.locator(".world-detail__boundary > div > p")).toBeVisible();
    await expect(detail.locator(".world-detail__remix-list > section")).not.toHaveCount(0);
    const launch = detail.getByRole("link", { name: "Launch this world" });
    await expect(launch).toHaveAttribute("href", `/world?starter=${world.id}`);
    await expectNoHorizontalOverflow(page);
    await expectNoDiagnostics(diagnostics);
  }
});

test("research links are visibly external and use safe new-tab attributes", async ({ page }) => {
  await page.goto("/worlds/collective-motion", { waitUntil: "domcontentloaded" });
  const sources = page.locator(".world-detail__research a");
  await expect(sources).toHaveCount(2);
  for (const source of await sources.all()) {
    await expect(source).toContainText("external source");
    await expect(source).toHaveAttribute("target", "_blank");
    await expect(source).toHaveAttribute("rel", /noreferrer/);
    await expect(source).toHaveAttribute("rel", /noopener/);
    await expect(source).toHaveAttribute("href", /^https:\/\//);
  }
  await expect(page.locator(".world-detail__research")).toContainText("Conference paper");
  await expect(page.locator(".world-detail__research")).toContainText("Canonical model");
});

test("mobile detail keeps the launch ahead of research and avoids nested scroll traps", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/worlds/signal-cascades", { waitUntil: "domcontentloaded" });
  const launch = page.getByRole("link", { name: "Launch this world" });
  await expect(launch).toBeVisible();
  const launchBounds = await launch.boundingBox();
  const researchBounds = await page.getByRole("heading", { level: 2, name: "Research connection" }).boundingBox();
  expect(launchBounds).not.toBeNull();
  expect(researchBounds).not.toBeNull();
  expect(launchBounds!.y).toBeLessThan(researchBounds!.y);
  expect(launchBounds!.y).toBeLessThan(844);
  await expectNoHorizontalOverflow(page);
  expect(
    await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".world-detail *")].filter((element) => {
        const style = getComputedStyle(element);
        return style.overflowY === "auto" || style.overflowY === "scroll";
      }).length
    )
  ).toBe(0);
});

test("all seven strict handoffs prepare the intended scenario as a fresh paused tick-0 run", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 720 });

  for (const world of worlds) {
    const diagnostics = observePageDiagnostics(page);
    await page.goto(`/world?starter=${world.id}`, { waitUntil: "domcontentloaded" });
    expect(new URL(page.url()).search).toBe(`?starter=${world.id}`);
    await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
    await expect(page.getByLabel("World template")).toHaveValue(world.templateId);
    await expect(page.locator("[data-starter-nudge]")).toHaveAttribute("data-starter-world-id", world.id);
    await expect(page.locator("[data-starter-nudge]")).toContainText(world.title);
    await expect(page.locator("[data-starter-nudge]")).toContainText(world.firstChange);
    await expect(page.locator("[data-starter-nudge]")).not.toContainText(world.scenarioId);
    await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
    await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
    await expect(page.getByRole("heading", { name: world.scenarioName })).toBeVisible();
    await expect(page.getByRole("button", { name: "Setup", exact: true })).toHaveAttribute("aria-current", "page");

    await page.getByRole("button", { name: "Run details" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText(world.scenarioName);
    await expect(dialog).toContainText(world.scenarioLabel);
    await dialog.getByRole("button", { name: "Close run details" }).click();
    await expectNoDiagnostics(diagnostics);
  }
});

test("all seven first activities run, rebuild with the stated control, and expose the named output", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 720 });

  for (const world of worlds) {
    await page.goto(`/worlds/${world.slug}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Launch this world" }).click();
    await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
    await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");

    for (let step = 0; step < 3; step += 1) {
      await page.getByRole("button", { name: "Step exactly one tick" }).click();
    }
    await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("3");

    const parameter = page.getByRole("spinbutton", { name: `${world.firstChange} numeric value` });
    await parameter.fill(world.suggestedValue);
    await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
    await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
    await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
    await expect(parameter).toHaveValue(world.suggestedValue);

    await page.getByRole("button", { name: "Step exactly one tick" }).click();
    await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Observe" }).click();
    await expect(page.locator("[data-observe-view='summary']")).toContainText(world.outputLabel);
  }
});

test("starter nudge dismissal, direct reload, Back, and normal task navigation preserve their explicit boundaries", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/worlds/collective-motion", { waitUntil: "domcontentloaded" });
  const detailUrl = page.url();
  await page.getByRole("link", { name: "Launch this world" }).click();
  await expect(page).toHaveURL(/starter=flocking/);
  const storageBefore = await readStorage(page);
  const nudge = page.locator("[data-starter-nudge]");
  await expect(nudge).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(nudge).toBeVisible();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await page.getByRole("button", { name: "Dismiss Collective Motion starter steps" }).click();
  await expect(nudge).toHaveCount(0);
  await expect(page.getByLabel("Simulation world stage")).toBeFocused();
  expect(await readStorage(page)).toEqual(storageBefore);

  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page.url()).toBe(detailUrl);
  await expect(page.locator("[data-world-detail='flocking']")).toBeVisible();

  await page.getByRole("link", { name: "Launch this world" }).click();
  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Observe" }).click();
  await expect(page).toHaveURL(/task=observe/);
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 2, name: "Observe" })).toBeVisible();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
});

test("invalid, empty, duplicate, and runtime-mismatched launches stop before constructing a World", async ({ page }) => {
  for (const path of [
    "/world?starter=missing",
    "/world?starter=",
    "/world?starter=flocking&starter=epidemic",
    "/world?starter=flocking&template=epidemic-spread",
    "/world?starter=flocking&scenario=missing",
    "/world?starter=flocking&task=observe&task=setup",
    "/world?starter=flocking&unexpected=runtime"
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-starter-launch-error]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "This world could not be prepared safely" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Explore Worlds" })).toHaveAttribute("href", "/worlds");
    await expect(page.locator(".ortus-shell")).toHaveCount(0);
    await expect(page.locator(".world-stage")).toHaveCount(0);
  }
});

test("catalog, representative details, and launch are Axe-clean with quiet diagnostics under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/worlds",
    "/worlds/collective-motion",
    "/worlds/signal-cascades",
    "/world?starter=missing",
    "/world?starter=flocking"
  ]) {
    const diagnostics = observePageDiagnostics(page);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    if (path === "/world?starter=flocking") {
      await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((violation) => violation.id), `${path} Axe violations`).toEqual([]);
    await expectNoDiagnostics(diagnostics);
  }

  const diagnostics = observePageDiagnostics(page);
  await page.goto("/worlds", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Mechanism", { exact: true }).selectOption("threshold");
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
  await page.getByLabel("Search worlds").fill("nothing can match this");
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
  await expectNoDiagnostics(diagnostics);
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
  expect(
    await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth
    }))
  ).toEqual({
    documentWidth: page.viewportSize()!.width,
    bodyWidth: page.viewportSize()!.width,
    viewportWidth: page.viewportSize()!.width
  });
}

async function readStorage(page: Page) {
  return page.evaluate(() => ({
    local: Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]),
    session: Object.keys(sessionStorage).sort().map((key) => [key, sessionStorage.getItem(key)])
  }));
}
