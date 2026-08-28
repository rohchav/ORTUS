import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("keyboard flow reaches an exact Flocking exploration, inspection, rebuild, comparison, and reset", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const exploreStarter = page.getByRole("link", { name: "Explore Collective Motion" });
  await exploreStarter.focus();
  await page.keyboard.press("Enter");
  const launch = page.getByRole("link", { name: "Launch this world" });
  await launch.focus();
  await page.keyboard.press("Enter");
  const runtime = await expectFlockingReady(page);

  const dismiss = page.getByRole("button", { name: "Dismiss Collective Motion starter steps" });
  await dismiss.focus();
  await page.keyboard.press("Enter");

  const inspect = page.locator("[data-boid-inspect-control]");
  await inspect.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByRole("complementary", { name: "Right context drawer" });
  await expect(drawer).toContainText("Boid Inspector");
  const closeInspector = drawer.getByRole("button", { name: "Close" });
  await closeInspector.focus();
  await page.keyboard.press("Enter");
  await expect(inspect).toBeFocused();

  const exploreBehavior = page.getByRole("button", { name: "Explore behavior" });
  await exploreBehavior.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Explore Flocking behavior" })).toBeFocused();
  await expect(page.getByText("Directional agents responding to nearby neighbors")).toBeVisible();
  await expect(page.getByText("Sustained milling is not implemented")).toBeAttached();

  const noisyPrepare = page.locator('[data-flocking-target="noisy"]').getByRole("button", { name: "Prepare" });
  await noisyPrepare.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Prepare Keep motion noisy" })).toBeVisible();
  const loadRun = page.getByRole("button", { name: "Load fresh run" });
  await expect(loadRun).toBeFocused();
  const keepRun = page.getByRole("button", { name: "Keep current run" });
  await page.keyboard.press("Tab");
  await expect(keepRun).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(noisyPrepare).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(loadRun).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(noisyPrepare).toBeFocused();

  await page.keyboard.press("Enter");
  const priorGeneration = Number(await runtime.getAttribute("data-runtime-generation"));
  await expect(loadRun).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(async () => Number(await runtime.getAttribute("data-runtime-generation"))).toBeGreaterThan(priorGeneration);
  await expectFlockingReady(page);
  await expect(page.getByLabel("Current run status")).toContainText("ur0r-noisy");
  await expect(page.getByLabel("Current simulation context")).toContainText("Flocking exploration: Keep motion noisy");
  await expect(noisyPrepare).toBeFocused();

  const back = page.getByRole("button", { name: "Back to Setup" });
  await back.focus();
  await page.keyboard.press("Enter");
  const alignment = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  await alignment.focus();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("0.2");
  const rebuild = page.getByRole("button", { name: "Rebuild run with parameter drafts" });
  await rebuild.focus();
  await page.keyboard.press("Enter");
  await expectFlockingReady(page);

  const run = page.getByRole("button", { name: "Run simulation" });
  await run.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => runtimeTick(runtime)).toBeGreaterThan(3);
  const pause = page.getByRole("button", { name: "Pause simulation" });
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-world-observation-dock]")).toContainText("Alignment score");

  const compare = page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name: "Compare", exact: true });
  await compare.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "Compare" })).toBeFocused();
  await expect(page.locator("[data-world-observation-dock]")).toBeVisible();
  const capture = page.getByRole("button", { name: "Capture Run" });
  await capture.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".run-library li")).toHaveCount(1);

  const reset = page.getByRole("button", { name: /Prepare reset/ });
  await reset.focus();
  await page.keyboard.press("Enter");
  const confirmReset = page.getByRole("button", { name: "Confirm reset and discard current run state" });
  await expect(confirmReset).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(runtime).toHaveAttribute("data-runtime-tick", "0");

  const workshop = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Workshop" });
  await workshop.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Workshop" })).toBeVisible();
});

test("responsive World keeps the model dominant, bounded, readable, and reduced-motion compatible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 900, height: 700 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/world?starter=flocking", { waitUntil: "domcontentloaded" });
    await expectFlockingReady(page);
    await page.getByRole("button", { name: "Dismiss Collective Motion starter steps" }).click();
    await expect(page.getByLabel("Flocking model-output readout")).toContainText("Edges Wrap");
    await expect(page.getByRole("button", { name: "Inspect a boid" })).toBeVisible();
    await expect(page.locator("[data-world-observation-dock]")).toBeVisible();

    const geometry = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>(".world-stage")!.getBoundingClientRect();
      const layout = document.querySelector<HTMLElement>(".ortus-layout")!.getBoundingClientRect();
      const canvas = document.querySelector<HTMLCanvasElement>(".immersive-world-canvas")!;
      const context = canvas.getContext("2d")!;
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let changed = 0;
      for (let index = 0; index < pixels.length; index += Math.max(4, Math.floor(pixels.length / 4000 / 4) * 4)) {
        if (pixels[index] !== 0 || pixels[index + 1] !== 0 || pixels[index + 2] !== 0) changed += 1;
      }
      return {
        stageRatio: stage.width / layout.width,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        changed
      };
    });
    expect(geometry.stageRatio).toBeGreaterThan(viewport.width <= 430 ? 0.9 : 0.5);
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(0);
    expect(geometry.changed).toBeGreaterThan(100);

    const motion = await page.locator(".production-flocking-world__instrument").evaluate((element) => ({
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      transitionSeconds: Number.parseFloat(getComputedStyle(element).transitionDuration)
    }));
    expect(motion.reduced).toBe(true);
    expect(motion.transitionSeconds).toBeLessThanOrEqual(0.001);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((violation) => violation.id)).toEqual([]);
  }
});

test("Workshop, Lab, and Atlas state their bounded roles and Atlas owns one vertical scroll region", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });

  await page.goto("/builder", { waitUntil: "domcontentloaded" });
  const decomposition = page.locator('[data-workshop-decomposition="flocking"]');
  await expect(decomposition).toContainText("Flocking, decomposed into model pieces");
  await expect(decomposition).toContainText("Current structural drafting");
  await expect(decomposition).toContainText("Not yet runnable visual composition");
  await expect(decomposition).toContainText("does not load a workspace, generate a template, rewire rules, or execute a model");
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);

  await page.goto("/lab", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Orientation today, scientific memory later" })).toBeVisible();
  await expect(page.getByText("Nothing on this Lab route saves, receives, or assesses those summaries.", { exact: false })).toBeVisible();
  await expect(page.getByText("evidence and counterevidence")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);

  await page.goto("/atlas", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "A scientific map, not another experiment surface" })).toBeVisible();
  await expect(page.getByText("one bounded, page-local Flocking sampler", { exact: false })).toBeVisible();
  const scrollOwners = await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((element) => /(auto|scroll)/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight + 2)
      .map((element) => element.className)
  );
  expect(scrollOwners).toEqual(["atlas-foundation"]);
  const atlas = page.locator(".atlas-foundation");
  await atlas.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
  await expect(page.getByRole("button", { name: "Show Atlas technical details" })).toBeVisible();
  await atlas.evaluate((element) => element.scrollTo({ top: 0 }));
  await expect(page.getByRole("heading", { level: 1, name: "Atlas" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations.map((violation) => violation.id)).toEqual([]);
});

async function expectFlockingReady(page: Page) {
  const root = page.locator(".production-flocking-world");
  await expect(root).toHaveAttribute("data-runtime-ready", "true", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-agent-count", "160");
  return root;
}

async function runtimeTick(root: ReturnType<Page["locator"]>): Promise<number> {
  return Number(await root.getAttribute("data-runtime-tick"));
}
