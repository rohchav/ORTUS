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

async function readStorage(page: Page) {
  return page.evaluate(() => ({
    local: Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]),
    session: Object.keys(sessionStorage).sort().map((key) => [key, sessionStorage.getItem(key)])
  }));
}
