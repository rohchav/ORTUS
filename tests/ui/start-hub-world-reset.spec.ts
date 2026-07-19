import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "wide-short", width: 1280, height: 720 },
  { label: "tablet", width: 1024, height: 768 },
  { label: "narrow", width: 900, height: 700 },
  { label: "short", width: 1280, height: 600 },
  { label: "mobile", width: 390, height: 844 }
] as const;

for (const viewport of viewports) {
  test(`Start Hub is task-centered and usable at ${viewport.label} ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-start-hub]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Start with a living system" })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Start", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "Open the Flocking starter" })).toHaveAttribute(
      "href",
      "/world?template=flocking-boids&starter=flocking"
    );
    await expect(page.locator(".system-card")).toHaveCount(7);
    await expect(page.locator("[data-capability-guidance-destination]")).toHaveCount(0);
    await expect(page.getByText("Pick a system. Run it. Change something. See what happens. Then go deeper.")).toBeVisible();

    const featuredImage = page.getByRole("img", { name: /ORTUS Flocking runtime/i });
    await expect(featuredImage).toBeVisible();
    const imageState = await featuredImage.evaluate((image) => ({
      complete: (image as HTMLImageElement).complete,
      width: (image as HTMLImageElement).naturalWidth
    }));
    expect(imageState.complete).toBe(true);
    expect(imageState.width).toBeGreaterThan(0);

    const visibleText = await page.getByRole("main").innerText();
    expect(visibleText).not.toMatch(/epidemic-spread|opinion-dynamics|flocking-boids|neural-excitation-network/);
    if (viewport.label === "mobile") {
      await expect(page.locator(".research-shell__brand .ortus-brand__wordmark")).toBeVisible();
    }
    await expectNoHorizontalOverflow(page);
  });
}

test("featured Flocking handoff opens the real World with a local starter nudge and dominant model surface", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Open the Flocking starter" }).click();
  await expect(page).toHaveURL(/\/world\?template=flocking-boids&starter=flocking$/);
  await expect(page.getByLabel("Model template")).toHaveValue("flocking-boids");
  await expect(page.locator("[data-starter-nudge]")).toContainText("Lower Alignment weight");
  await expect(page.getByLabel("Key model parameters").getByText("Alignment weight", { exact: true })).toBeVisible();

  const widths = await page.evaluate(() => {
    const layout = document.querySelector<HTMLElement>(".ortus-layout")!.getBoundingClientRect();
    const workspace = document.querySelector<HTMLElement>(".workspace-center")!.getBoundingClientRect();
    const stage = document.querySelector<HTMLElement>(".world-stage")!.getBoundingClientRect();
    return { layout: layout.width, workspace: workspace.width, stage: stage.width };
  });
  expect(widths.workspace / widths.layout).toBeGreaterThan(0.7);
  expect(widths.stage / widths.layout).toBeGreaterThan(0.7);

  const storageBefore = await readStorage(page);
  await page.getByRole("button", { name: "Dismiss Flocking starter steps" }).click();
  await expect(page.locator("[data-starter-nudge]")).toHaveCount(0);
  expect(await readStorage(page)).toEqual(storageBefore);
});

test("repeated featured-starter launch rebuilds the prepared run without writing storage", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/", { waitUntil: "networkidle" });
  const storageBefore = await readStorage(page);

  await page.getByRole("link", { name: "Open the Flocking starter" }).click();
  const alignment = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  const tick = page.locator(".timeline-strip__readout strong").first();
  await expect(alignment).toHaveValue("0.55");
  await alignment.fill("0.31");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.getByRole("button", { name: "Pause simulation" })).toBeVisible();
  await expect.poll(() => numericText(tick)).toBeGreaterThan(0);

  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Open the Flocking starter" }).click();

  await expect(page.getByLabel("Model template")).toHaveValue("flocking-boids");
  await expect(alignment).toHaveValue("0.55");
  await expect(tick).toHaveText("0");
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
  await expect(page.locator("[data-starter-nudge]")).toContainText("Run the baseline");
  expect(await readStorage(page)).toEqual(storageBefore);
});

test("a key parameter change explains and performs a fresh paused tick-0 rebuild", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/world?template=flocking-boids&starter=flocking", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByText("Changing a key control rebuilds a paused tick-0 run immediately. Choose Run to start the new configuration.")
  ).toBeVisible();
  await expect(page.locator(".run-settings-quick .parameter-control__mode")).toHaveCount(4);

  const tick = page.locator(".timeline-strip__readout strong").first();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(() => numericText(tick)).toBeGreaterThan(0);
  await page.getByRole("spinbutton", { name: "Alignment weight numeric value" }).fill("0.51");

  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
  await expect(tick).toHaveText("0");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(() => numericText(tick)).toBeGreaterThan(0);
});

test("World task changes reset panel scroll, focus selected More content, and synchronize route state", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/world?template=flocking-boids&starter=flocking", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Step exactly one tick" }).click();

  const taskNav = page.getByRole("navigation", { name: "World tasks" });
  const panelScroll = page.locator(".workspace-context-panel__scroll");
  expect(await scrollToEnd(panelScroll)).toBeGreaterThan(0);
  await taskNav.getByRole("button", { name: "Observe", exact: true }).click();
  await expect(page).toHaveURL(/task=observe/);
  await expect.poll(() => panelScroll.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(taskNav.getByRole("button", { name: "Observe", exact: true })).toBeFocused();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");

  expect(await scrollToEnd(panelScroll)).toBeGreaterThan(0);
  await taskNav.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("menuitem", { name: /Understand model/i }).click();
  await expect(page).toHaveURL(/task=understand/);
  await expect(page.getByRole("heading", { level: 2, name: "Understand" })).toBeFocused();
  await expect.poll(() => panelScroll.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");

  await taskNav.getByRole("button", { name: "Setup", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("task")).toBeNull();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "World", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.getByRole("button", { name: "Research tools" })).toHaveAttribute("data-current", "false");
  await expect(page.getByLabel("Current simulation context")).toContainText("Setup");
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
});

test("rapid keyboard navigation remains deterministic in both compact menus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/", { waitUntil: "networkidle" });
  const researchTrigger = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Research tools" });

  for (let attempt = 0; attempt < 8; attempt += 1) {
    await researchTrigger.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Lab" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(researchTrigger).toBeFocused();
    await expect(page.getByRole("menu", { name: "Research tools" })).toHaveCount(0);
  }

  await page.goto("/world", { waitUntil: "networkidle" });
  const moreTrigger = page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "More", exact: true });
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await moreTrigger.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: /Experiments/i })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(moreTrigger).toBeFocused();
    await expect(page.getByRole("menu", { name: "More World tasks" })).toHaveCount(0);
  }
});

test("every production Understand summary stays concise and Neural prioritizes a model limitation", async ({ page }) => {
  test.setTimeout(90_000);
  const templateIds = [
    "epidemic-spread",
    "opinion-dynamics",
    "predator-prey",
    "schelling-segregation",
    "flocking-boids",
    "forest-fire",
    "neural-excitation-network"
  ];

  for (const templateId of templateIds) {
    await page.goto(`/world?template=${templateId}&task=understand`, { waitUntil: "domcontentloaded" });
    const explanation = page.locator("[data-model-explanation]");
    await expect(explanation).toBeVisible();
    await expect(explanation.locator(":scope > section")).toHaveCount(6);
    const defaultText = await explanation.locator(":scope > section").allInnerTexts();
    const summary = defaultText.join("\n");
    expect(summary).not.toContain("See the complete model notes for this item.");
    expect(summary).not.toMatch(/Builder graphs|model-schema|visual programming|NetLogo|Mesa|MASON|LLM/i);

    if (templateId === "neural-excitation-network") {
      expect(summary.match(/biological brain simulation/gi) ?? []).toHaveLength(1);
      expect(summary).toMatch(/does not include learning or plasticity/i);
      await explanation.getByRole("button", { name: "Full model notes" }).click();
      await expect(explanation.getByText(/does not make Builder graphs executable/i)).toBeVisible();
    }
  }
});

test("Atlas keeps its real preview action in the first short desktop viewport", async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1280, height: 600 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/atlas", { waitUntil: "domcontentloaded" });
    const runButton = page.getByRole("button", { name: "Run ephemeral preview" });
    await expect(
      runButton.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' corner-panel ')][1]")
    ).toContainText("Execution Status");
    await expectWithinViewport(page, runButton);
    await expectNoHorizontalOverflow(page);
  }

  await page.getByRole("button", { name: "Run ephemeral preview" }).click();
  await expect(page.locator("#ephemeral-preview-error-summary")).toBeFocused();
});

test("World Setup exposes four key controls while preserving every exact parameter and scenario tool", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/world?template=flocking-boids", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  await expect(page.getByLabel("Model template")).toHaveValue("flocking-boids");
  await expect(page.locator("#ortus-setup-seed")).toBeVisible();
  await expect(page.locator(".run-settings-quick .parameter-control")).toHaveCount(4);
  await expect(page.locator("#all-model-parameters")).toBeHidden();
  await page.getByRole("button", { name: /All parameters/i }).click();
  await expect(page.locator("#all-model-parameters")).toBeVisible();
  const exactControlCount = await page.locator(".run-settings-panel .parameter-control").count();
  expect(exactControlCount).toBeGreaterThan(4);
  await expect(page.getByText("Scenarios define initial conditions", { exact: false })).toBeHidden();
  await page.getByRole("button", { name: "Scenarios and starting recipes" }).click();
  await expect(page.getByText("Scenarios define initial conditions", { exact: false })).toBeVisible();
});

test("Understand model is concise by default, de-duplicates source notes, and keeps unrelated guardrails out", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/world?template=epidemic-spread", { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "More" }).click();
  await page.getByRole("menuitem", { name: /Understand model/i }).click();

  for (const heading of ["Question", "How the model works", "What to watch", "Try changing", "Key assumptions", "Main limitation"]) {
    await expect(page.getByRole("heading", { level: 3, name: heading })).toBeVisible();
  }
  await expect(page.locator("[data-capability-guidance-destination='world']")).toHaveCount(0);
  await expect(page.getByText("Recovered agents do not become infected again in V1.")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Technical provenance" })).toBeHidden();
  await page.getByRole("button", { name: "Full model notes" }).click();
  await expect(page.getByRole("heading", { name: "Technical provenance" })).toBeVisible();
  await expect(page.getByText("Recovered agents do not become infected again in V1.")).toHaveCount(1);
  const explanationText = await page.locator("[data-model-explanation]").innerText();
  expect(explanationText).not.toMatch(/LLM|visual builder|model schema|Mesa|NetLogo|MASON/i);
});

test("World task query links open existing Experiment and Compare surfaces without new runtime behavior", async ({ page }) => {
  await page.goto("/world?task=experiment", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Experiment", level: 2 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Research tools" })).toHaveAttribute(
    "data-current",
    "true"
  );
  await page.goto("/world?task=compare", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Compare", level: 2 })).toBeVisible();
  await expect(page.getByText("Capture the current run", { exact: false })).toBeVisible();
});

test("Workshop starts quietly with guidance and support matrices disclosed on demand", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/builder", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".guided-builder__field-error")).toHaveCount(0);
  await expect(page.locator(".guided-builder__steps em", { hasText: /error/i })).toHaveCount(0);
  await expect(page.getByText("Guided Builder supports a bounded subset of the structural artifact.")).toBeHidden();
  await expect(page.locator("[data-capability-guidance-destination='workshop']")).toBeHidden();
  await expect(page.getByRole("textbox", { name: /Model name/i })).toHaveAttribute("placeholder", /Neighborhood resource exchange/);

  const stepPanel = page.locator(".guided-builder__steps > .corner-panel");
  const eyebrowBox = await stepPanel.locator(".corner-panel__eyebrow").boundingBox();
  const titleBox = await stepPanel.locator(".corner-panel__title").boundingBox();
  expect(eyebrowBox).not.toBeNull();
  expect(titleBox).not.toBeNull();
  expect((eyebrowBox?.y ?? 0) + (eyebrowBox?.height ?? 0)).toBeLessThanOrEqual(titleBox?.y ?? 0);
});

test("Start Hub and default World states are Axe-clean", async ({ page }) => {
  for (const path of ["/", "/world"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    if (path === "/world") {
      await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((violation) => violation.id), `${path} Axe violations`).toEqual([]);
  }
});

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth
    }))
  ).toMatchObject({
    documentWidth: page.viewportSize()!.width,
    bodyWidth: page.viewportSize()!.width,
    viewportWidth: page.viewportSize()!.width
  });
}

async function numericText(locator: ReturnType<Page["locator"]>): Promise<number> {
  return Number((await locator.textContent())?.replace(/,/g, "") ?? Number.NaN);
}

async function scrollToEnd(locator: ReturnType<Page["locator"]>): Promise<number> {
  return locator.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollTop;
  });
}

async function expectWithinViewport(page: Page, locator: ReturnType<Page["locator"]>) {
  await expect(locator).toBeVisible();
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(-2);
  expect(bounds!.y).toBeGreaterThanOrEqual(-2);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 2);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 2);
}

async function readStorage(page: Page) {
  return page.evaluate(() => ({
    local: Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]),
    session: Object.keys(sessionStorage).sort().map((key) => [key, sessionStorage.getItem(key)])
  }));
}
