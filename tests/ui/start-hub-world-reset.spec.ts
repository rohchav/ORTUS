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
    await expect(page.getByRole("link", { name: "Explore Collective Motion" })).toHaveAttribute(
      "href",
      "/worlds/collective-motion"
    );
    await expect(page.locator(".start-world-index > a")).toHaveCount(7);
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
  await page.getByRole("link", { name: "Explore Collective Motion" }).click();
  await expect(page).toHaveURL(/\/worlds\/collective-motion$/);
  await page.getByRole("link", { name: "Launch this world" }).click();
  await expect(page).toHaveURL(/\/world\?starter=flocking$/);
  await expect(page.getByLabel("World template")).toHaveValue("flocking-boids");
  await expect(page.locator("[data-starter-nudge]")).toContainText("Lower Alignment weight to 0.20");
  await expect(page.getByLabel("Key model parameters").getByText("Alignment weight", { exact: true })).toBeVisible();

  const widths = await page.evaluate(() => {
    const layout = document.querySelector<HTMLElement>(".ortus-layout")!.getBoundingClientRect();
    const workspace = document.querySelector<HTMLElement>(".workspace-center")!.getBoundingClientRect();
    const stage = document.querySelector<HTMLElement>(".world-stage")!.getBoundingClientRect();
    return { layout: layout.width, workspace: workspace.width, stage: stage.width };
  });
  expect(widths.workspace / widths.layout).toBeGreaterThan(0.6);
  expect(widths.stage / widths.layout).toBeGreaterThan(0.6);

  const storageBefore = await readStorage(page);
  await page.getByRole("button", { name: "Dismiss Collective Motion starter steps" }).click();
  await expect(page.locator("[data-starter-nudge]")).toHaveCount(0);
  expect(await readStorage(page)).toEqual(storageBefore);
});

test("repeated featured-starter launch rebuilds the prepared run without writing storage", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/", { waitUntil: "networkidle" });
  const storageBefore = await readStorage(page);

  await page.getByRole("link", { name: "Explore Collective Motion" }).click();
  await page.getByRole("link", { name: "Launch this world" }).click();
  const alignment = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  const tick = page.locator(".timeline-strip__readout strong").first();
  await expect(alignment).toHaveValue("0.55");
  await alignment.fill("0.31");
  await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.getByRole("button", { name: "Pause simulation" })).toBeVisible();
  await expect.poll(() => numericText(tick)).toBeGreaterThan(0);

  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Explore Collective Motion" }).click();
  await page.getByRole("link", { name: "Launch this world" }).click();

  await expect(page.getByLabel("World template")).toHaveValue("flocking-boids");
  await expect(alignment).toHaveValue("0.55");
  await expect(tick).toHaveText("0");
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
  await expect(page.locator("[data-starter-nudge]")).toContainText("Begin with Random Headings");
  expect(await readStorage(page)).toEqual(storageBefore);
});

test("a key parameter edit remains a draft until an explicit paused tick-0 rebuild", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/world?starter=flocking", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByText(/Parameter and seed edits stay as Setup drafts/)
  ).toBeVisible();
  await expect(page.locator(".run-settings-quick .parameter-control__mode")).toHaveCount(4);

  const tick = page.locator(".timeline-strip__readout strong").first();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(() => numericText(tick)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Pause simulation" }).click();
  const tickBeforeDraft = await numericText(tick);
  await page.getByRole("spinbutton", { name: "Alignment weight numeric value" }).fill("0.51");

  await expect(page.locator(".run-settings-quick").getByText("1 parameter draft differs from the active run. Rebuild required.")).toBeVisible();
  await expect(page.locator(".timeline-strip__label strong")).toHaveText("Paused");
  expect(await numericText(tick)).toBe(tickBeforeDraft);
  await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
  await expect(tick).toHaveText("0");
  await expect(page.locator(".run-settings-quick").getByText("Parameter drafts match the active run.")).toBeVisible();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect.poll(() => numericText(tick)).toBeGreaterThan(0);
});

test("World task changes reset panel scroll, focus selected More content, and synchronize route state", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/world?starter=flocking", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Step exactly one tick" }).click();

  const taskNav = page.getByRole("navigation", { name: "World tasks" });
  const panelScroll = page.locator(".workspace-context-panel__scroll");
  expect(await scrollToEnd(panelScroll)).toBeGreaterThan(0);
  await taskNav.getByRole("button", { name: "Observe", exact: true }).click();
  await expect(page).toHaveURL(/task=observe/);
  await expect.poll(() => panelScroll.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page.getByRole("heading", { level: 2, name: "Observe" })).toBeFocused();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");

  expect(await scrollToEnd(panelScroll)).toBeGreaterThan(0);
  await taskNav.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(page).toHaveURL(/task=understand/);
  await expect(page.getByRole("heading", { level: 2, name: "Explain" })).toBeFocused();
  await expect.poll(() => panelScroll.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");

  await taskNav.getByRole("button", { name: "Setup", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("task")).toBeNull();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "World", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.getByRole("button", { name: "Research tools" })).toHaveAttribute("data-current", "false");
  await expect(page.getByLabel("Current simulation context")).toContainText("Flocking");
  await expect(page.getByLabel("Current simulation context")).not.toContainText("Setup");
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
    await expect(page.getByRole("menuitem", { name: /Diagnostics/i })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(moreTrigger).toBeFocused();
    await expect(page.getByRole("menu", { name: "More World tasks" })).toHaveCount(0);
  }
});

test("every production Explain summary stays concise and Neural prioritizes a model limitation", async ({ page }) => {
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
    await expect(explanation.locator(".model-explanation__summary > section")).toHaveCount(6);
    const defaultText = await explanation.locator(".model-explanation__summary > section").allInnerTexts();
    const summary = defaultText.join("\n");
    expect(summary).not.toContain("See the complete model notes for this item.");
    expect(summary).not.toMatch(/Builder graphs|model-schema|visual programming|NetLogo|Mesa|MASON|LLM/i);

    await explanation.getByRole("button", { name: "Full model notes" }).click();
    const reference = page.getByRole("dialog");
    await expect(reference.getByRole("heading", { name: "Model-output metrics" })).toBeVisible();
    await expect(reference.getByText(/not empirical observations, calibrated estimates, or validation evidence/)).toBeVisible();

    if (templateId === "neural-excitation-network") {
      expect(summary.match(/biological brain simulation/gi) ?? []).toHaveLength(1);
      expect(summary).toMatch(/does not include learning or plasticity/i);
      await expect(reference).toHaveAccessibleName("Neural Excitation Network");
      await expect(reference.getByText(/does not make Builder graphs executable/i)).toHaveCount(0);
    }
    await reference.getByRole("button", { name: "Close model reference" }).click();
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
  await expect(page.getByLabel("World template")).toHaveValue("flocking-boids");
  await expect(page.locator("#ortus-setup-seed")).toBeVisible();
  await expect(page.locator(".run-settings-quick .parameter-control")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "All parameters" })).toBeHidden();
  await page.getByRole("button", { name: /All parameters/i }).click();
  await expect(page.getByRole("heading", { name: "All parameters" })).toBeFocused();
  const exactControlCount = await page.locator(".world-task-subview:not([hidden]) .parameter-control").count();
  expect(exactControlCount).toBeGreaterThan(4);
  await expect(page.getByRole("button", { name: "Back to Setup" })).toBeVisible();
  await page.getByRole("button", { name: "Back to Setup" }).click();
  await expect(page.getByText("Scenarios define initial conditions", { exact: false })).toBeHidden();
  await page.getByRole("button", { name: "Choose recipe" }).click();
  await expect(page.getByRole("heading", { name: "Starting recipes and model variants" })).toBeFocused();
  await expect(page.getByText("Scenarios define initial conditions", { exact: false })).toBeVisible();
});

test("Explain is concise by default, de-duplicates source notes, and keeps unrelated guardrails out", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/world?template=epidemic-spread", { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Explain" }).click();

  for (const heading of ["Question", "How it works", "What to watch", "Try changing", "Key assumptions", "Main limitation"]) {
    await expect(page.getByRole("heading", { level: 3, name: heading })).toBeVisible();
  }
  await expect(
    page.locator("[data-model-explanation] [data-capability-guidance-destination='world']")
  ).toHaveCount(0);
  await expect(page.locator("[data-capability-guidance-destination='world']")).toBeHidden();
  await expect(
    page.locator("[data-model-explanation] .model-explanation__summary").getByText(
      "Recovered agents do not become infected again in V1."
    )
  ).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Technical provenance" })).toBeHidden();
  const notesTrigger = page.getByRole("button", { name: "Full model notes" });
  await notesTrigger.click();
  const reference = page.getByRole("dialog", { name: "Epidemic Spread" });
  await expect(reference.getByRole("heading", { name: "Technical provenance" })).toBeVisible();
  await expect(reference.getByText("Recovered agents do not become infected again in V1.")).toHaveCount(1);
  expect(await reference.innerText()).not.toMatch(/LLM|visual builder|model schema|Mesa|NetLogo|MASON/i);
  await reference.getByRole("button", { name: "Close model reference" }).click();
  await expect(notesTrigger).toBeFocused();
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
