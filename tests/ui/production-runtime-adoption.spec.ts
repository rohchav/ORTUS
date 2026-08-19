import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const flockingPath = "/world?template=flocking-boids";
const guidePath = "/world?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&guide=reading-a-flock";

test.describe("I1 production runtime adoption", () => {
  test("uses one Worker for production Flocking controls, inspection, and task history", async ({ page }) => {
    await page.goto(flockingPath, { waitUntil: "domcontentloaded" });
    const root = await expectProductionReady(page, 160);
    await expect.poll(() => page.workers().length).toBe(1);
    await expect(page.locator("canvas.immersive-world-canvas")).toHaveCount(1);
    await expect(page.locator("canvas.simulation-canvas")).toHaveCount(0);
    await expect(page.getByLabel("Current run status")).toContainText("Runtime Worker");
    await expectCanvasPixels(page);

    const initialGeneration = Number(await root.getAttribute("data-runtime-generation"));
    await page.getByRole("button", { name: "Step exactly one tick" }).click();
    await expect(root).toHaveAttribute("data-runtime-tick", "1");

    const canvas = page.getByRole("img", { name: /Immersive Flocking world/ });
    await canvas.focus();
    await canvas.press("ArrowRight");
    await expect(page.getByRole("complementary", { name: "Right context drawer" })).toContainText("Boid Inspector");
    await expect(page.getByText("Exact bounded detail for the selected simulated boid.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Local" })).toBeEnabled();
    await page.getByRole("button", { name: "Local" }).click();
    await expect(page.getByRole("button", { name: "Local" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Follow" }).click();
    await expect(page.getByRole("button", { name: "Follow" })).toHaveAttribute("aria-pressed", "true");

    await page.locator(".speed-control input").fill("8");
    await page.getByRole("button", { name: "Run simulation" }).click();
    await expect.poll(() => runtimeTick(root), { timeout: 15_000 }).toBeGreaterThan(8);
    await page.getByRole("button", { name: "Pause simulation" }).click();
    await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();
    const pausedTick = await runtimeTick(root);
    await page.waitForTimeout(350);
    expect(await runtimeTick(root)).toBe(pausedTick);

    await page.getByRole("button", { name: /Prepare reset/ }).click();
    await expect(page.getByText(/Confirm Reset to rebuild a fresh tick-0 run/)).toBeVisible();
    await page.getByRole("button", { name: "Confirm reset and discard current run state" }).click();
    await expect(root).toHaveAttribute("data-runtime-tick", "0");
    await expect.poll(async () => Number(await root.getAttribute("data-runtime-generation"))).toBeGreaterThan(initialGeneration);
    await expect(page.getByRole("complementary", { name: "Right context drawer" })).toHaveCount(0);

    const generationBeforeHistory = await root.getAttribute("data-runtime-generation");
    await page.getByRole("button", { name: "Observe", exact: true }).click();
    await expect(page).toHaveURL(/task=observe/);
    await page.goBack();
    await expect(page).toHaveURL(flockingPath);
    await expect(root).toHaveAttribute("data-runtime-generation", generationBeforeHistory ?? "");
    await expect.poll(() => page.workers().length).toBe(1);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByLabel("Simulation world stage")).toBeVisible();
    await expect(page.getByLabel("Persistent simulation playback controls")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("preserves prepared Flocking semantics and isolates legacy templates", async ({ page }) => {
    await page.goto(guidePath, { waitUntil: "domcontentloaded" });
    const guideRoot = await expectProductionReady(page, 160);
    await expect(guideRoot).toHaveAttribute("data-runtime-tick", "0");
    await expect(page.getByLabel("Current simulation context")).toContainText("Clear local signals");
    const guide = page.locator("[data-guided-investigation-panel='reading-a-flock']");
    await expect(guide).toContainText("Prepared Noise0.01");
    await expect(guide).toContainText("c2-coordination-001");
    await page.getByRole("button", { name: "Step exactly one tick" }).click();
    await expect(guideRoot).toHaveAttribute("data-runtime-tick", "1");
    await expect.poll(() => page.workers().length).toBe(1);

    await page.goto("/world?template=epidemic-spread", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".production-flocking-world")).toHaveCount(0);
    await expect(page.locator("canvas.simulation-canvas")).toBeVisible();
    await expect(page.getByLabel("Current run status")).toContainText("Runtime Main thread");
    await expect.poll(() => page.workers().length).toBe(0);
    const tick = page.locator(".timeline-strip__readout strong").first();
    await page.getByRole("button", { name: "Run simulation" }).click();
    await expect.poll(async () => Number(await tick.textContent())).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Pause simulation" }).click();
  });

  test("stops visibly when Worker startup is unavailable and never starts a local fallback", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "Worker", { configurable: true, value: undefined });
    });
    await page.goto(flockingPath, { waitUntil: "domcontentloaded" });

    const root = productionRoot(page);
    await expect(root).toHaveAttribute("data-runtime-state", "failed");
    await expect(root).toHaveAttribute("data-runtime-ready", "false");
    await expect(root.getByRole("alert")).toContainText("Worker runtime stopped");
    await expect(root.getByRole("alert")).toContainText(/no local fallback/i);
    await expect(page.getByLabel("Current run status")).toContainText("Stopped");
    await expect(page.getByRole("button", { name: "Run simulation" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Step exactly one tick" })).toBeDisabled();
    await expect(page.locator("canvas.simulation-canvas")).toHaveCount(0);
    await expect.poll(() => page.workers().length).toBe(0);

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("characterizes the production route at 100 and 500 boids", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.goto(flockingPath, { waitUntil: "domcontentloaded" });
    await expectProductionReady(page, 160);
    await page.getByRole("button", { name: /All parameters/ }).click();

    const evidence = [];
    for (const agentCount of [100, 500] as const) {
      const root = productionRoot(page);
      const priorGeneration = Number(await root.getAttribute("data-runtime-generation"));
      await page.getByRole("spinbutton", { name: "Agent count numeric value" }).fill(String(agentCount));
      const startupStartedAt = Date.now();
      await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
      await expectProductionReady(page, agentCount);
      const startupMs = Date.now() - startupStartedAt;
      await expect.poll(async () => Number(await root.getAttribute("data-runtime-generation"))).toBeGreaterThan(priorGeneration);
      await expect.poll(() => page.workers().length).toBe(1);

      await page.evaluate(() => window.__ORTUS_PRODUCTION_RUNTIME_AUDIT__?.startMeasurement());
      const startTick = await runtimeTick(root);
      await page.locator(".speed-control input").fill("8");
      await page.getByRole("button", { name: "Run simulation" }).click();
      const responsiveness = await measureResponsiveness(page, 1_500);
      await expect.poll(() => runtimeTick(root), { timeout: 20_000 }).toBeGreaterThanOrEqual(startTick + 40);
      await page.getByRole("button", { name: "Pause simulation" }).click();
      await page.waitForTimeout(350);

      const measurement = await readProductionMeasurement(page);
      expect(measurement.agentCount).toBe(agentCount);
      expect(measurement.runtime?.publications.framesPublished ?? 0).toBeGreaterThan(0);
      expect(measurement.runtime?.publications.uiPublished ?? 0).toBeGreaterThan(0);
      expect(measurement.runtime?.publications.framesPublished ?? 0).toBeGreaterThan(measurement.runtime?.publications.uiPublished ?? 0);
      expect(measurement.render?.frameCount ?? 0).toBeGreaterThan(0);
      expect(measurement.render?.fps ?? 0).toBeGreaterThan(10);
      expect(Number(await root.getAttribute("data-metric-record-count"))).toBeGreaterThan(1);
      await expectCanvasPixels(page);

      evidence.push({ agentCount, startupMs, responsiveness, measurement });
    }

    console.info(`I1_PRODUCTION_PERFORMANCE ${JSON.stringify(evidence)}`);
    await testInfo.attach("i1-production-performance.json", {
      body: JSON.stringify(evidence, null, 2),
      contentType: "application/json"
    });
  });
});

async function expectProductionReady(page: Page, agentCount: number) {
  const root = productionRoot(page);
  await expect(root).toHaveAttribute("data-production-runtime", "worker");
  await expect(root).toHaveAttribute("data-runtime-state", "ready");
  await expect(root).toHaveAttribute("data-runtime-ready", "true");
  await expect(root).toHaveAttribute("data-agent-count", String(agentCount));
  return root;
}

function productionRoot(page: Page) {
  return page.locator("[data-production-runtime='worker']");
}

async function runtimeTick(root: ReturnType<typeof productionRoot>): Promise<number> {
  return Number(await root.getAttribute("data-runtime-tick"));
}

async function expectCanvasPixels(page: Page): Promise<void> {
  const changedPixels = await page.locator("canvas.immersive-world-canvas").evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context || canvas.width === 0 || canvas.height === 0) return 0;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const corner = [pixels[0], pixels[1], pixels[2]];
    let changed = 0;
    for (let index = 0; index < pixels.length; index += 64) {
      if (pixels[index] !== corner[0] || pixels[index + 1] !== corner[1] || pixels[index + 2] !== corner[2]) changed += 1;
    }
    return changed;
  });
  expect(changedPixels).toBeGreaterThan(100);
}

async function measureResponsiveness(page: Page, durationMs: number) {
  return page.evaluate(async (duration) => {
    const lags: number[] = [];
    const interval = 25;
    const startedAt = performance.now();
    let expectedAt = startedAt + interval;
    while (performance.now() - startedAt < duration) {
      await new Promise<void>((resolve) => setTimeout(resolve, interval));
      const now = performance.now();
      lags.push(Math.max(0, now - expectedAt));
      expectedAt = now + interval;
    }
    const sorted = [...lags].sort((left, right) => left - right);
    return {
      samples: lags.length,
      medianTimerLagMs: sorted[Math.max(0, Math.ceil(sorted.length * 0.5) - 1)] ?? 0,
      p95TimerLagMs: sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0,
      maxTimerLagMs: sorted.at(-1) ?? 0
    };
  }, durationMs);
}

async function readProductionMeasurement(page: Page) {
  return page.evaluate(() => {
    const audit = window.__ORTUS_PRODUCTION_RUNTIME_AUDIT__;
    if (!audit) throw new Error("Production runtime audit API is unavailable");
    return audit.readMeasurement();
  });
}
