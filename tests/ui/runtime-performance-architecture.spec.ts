import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const prototypeUrl = "/world/immersive-prototype?concept=field-scientist&agents=100";

test.describe("PERF1 runtime performance architecture", () => {
  test("runs in a real Worker and reproduces the same manual-step sequence after reset", async ({ page }) => {
    await page.goto(prototypeUrl);
    await expectWorkerReady(page, 100);
    await expect.poll(() => page.workers().length).toBe(1);

    const initialSignature = await prototypeRoot(page).getAttribute("data-runtime-signature");
    await stepTo(page, 8);
    const firstSignature = await prototypeRoot(page).getAttribute("data-runtime-signature");
    expect(firstSignature).not.toBe(initialSignature);

    await page.getByRole("button", { name: "Inspect next boid" }).click();
    await expect(page.getByRole("heading", { name: "Boid 1" })).toBeVisible();
    await expect(page.getByText(/in model state$/)).toBeVisible();

    await page.getByRole("button", { name: "Restore prepared prototype run" }).click();
    await page.getByRole("button", { name: "Confirm restore and discard current prototype run state" }).click();
    await expect(prototypeRoot(page)).toHaveAttribute("data-tick", "0");
    await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-generation", "2");
    await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-signature", initialSignature ?? "");

    await stepTo(page, 8);
    await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-signature", firstSignature ?? "");
    await expect(page.getByText(/^Runtime stopped:/)).toHaveCount(0);
  });

  test("bounds Worker ownership across repeated run replacement and route disposal", async ({ page }) => {
    await page.goto(prototypeUrl);
    await expectWorkerReady(page, 100);

    for (let replacement = 0; replacement < 10; replacement += 1) {
      const count = replacement % 2 === 0 ? 500 : 100;
      await page.getByLabel("Scene load").selectOption(String(count));
      await expectWorkerReady(page, count);
      await expect.poll(() => page.workers().length).toBe(1);
      await page.getByRole("button", { name: "Inspect next boid" }).click();
      await expect(page.getByRole("heading", { name: "Boid 1" })).toBeVisible();
    }

    await page.goto("/world");
    await expect(page.getByRole("main")).toBeVisible();
    await expect.poll(() => page.workers().length).toBe(0);

    await page.goBack();
    await expectWorkerReady(page, 100);
    await expect.poll(() => page.workers().length).toBe(1);
  });

  test("bounds Worker ownership across 25 mounts and 20 Back/Forward transitions", async ({ page }) => {
    test.setTimeout(300_000);
    for (let cycle = 0; cycle < 25; cycle += 1) {
      await page.goto(prototypeUrl, { waitUntil: "domcontentloaded" });
      await expectWorkerReady(page, 100);
      await expect.poll(() => page.workers().length).toBe(1);
      await page.goto("/world", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("main")).toBeVisible();
      await expect.poll(() => page.workers().length).toBe(0);
    }

    await page.goto(prototypeUrl, { waitUntil: "domcontentloaded" });
    await expectWorkerReady(page, 100);
    for (let transition = 0; transition < 20; transition += 1) {
      await page.goBack({ waitUntil: "domcontentloaded" });
      await expect(page.getByRole("main")).toBeVisible();
      await expect.poll(() => page.workers().length).toBe(0);
      await page.goForward({ waitUntil: "domcontentloaded" });
      await expectWorkerReady(page, 100);
      await expect.poll(() => page.workers().length).toBe(1);
    }
  });

  test("retains truthful status and operable controls across the six audit viewports", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(prototypeUrl, { waitUntil: "domcontentloaded" });
    await expectWorkerReady(page, 100);
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
      { width: 900, height: 700 },
      { width: 1280, height: 600 },
      { width: 390, height: 844 }
    ]) {
      await page.setViewportSize(viewport);
      await expect(page.getByLabel("Prototype state")).toContainText("Paused");
      await expect(page.getByRole("button", { name: "Step", exact: true })).toBeVisible();
      await expect(page.getByRole("img", { name: /Immersive Flocking world/ })).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        rootWidth: document.querySelector("[data-immersive-prototype]")?.getBoundingClientRect().width ?? 0
      }));
      expect(dimensions.scrollWidth, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(dimensions.innerWidth);
      expect(dimensions.rootWidth, `${viewport.width}x${viewport.height}`).toBeGreaterThan(0);
      await page.getByRole("button", { name: "Step", exact: true }).click();
      await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-state", "paused");
    }
    await expect.poll(() => page.workers().length).toBe(1);
  });

  test("keeps reduced motion and high-DPR presentation independent from simulation", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(prototypeUrl, { waitUntil: "domcontentloaded" });
    await expectWorkerReady(page, 100);
    await expect(prototypeRoot(page)).toHaveAttribute("data-reduced-motion", "true");
    expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2);
    await stepTo(page, 4);
    await expect(page.getByRole("img", { name: /Immersive Flocking world/ })).toHaveAttribute("data-effect-count", "0");
    await expect.poll(() => page.workers().length).toBe(1);
    await context.close();
  });

  test("announces Worker initialization failure without fallback or false preparing state", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "Worker", { configurable: true, value: undefined });
    });
    await page.goto(prototypeUrl, { waitUntil: "domcontentloaded" });
    const root = prototypeRoot(page);
    await expect(root).toHaveAttribute("data-runtime-state", "failed");
    await expect(root).toHaveAttribute("data-runtime-ready", "false");
    await expect(page.getByLabel("Prototype state")).toContainText("Failed");
    await expect(root.getByRole("alert")).toContainText(/cannot initialize.*Worker.*no implicit local fallback/i);
    await expect(page.getByRole("button", { name: "Run immersive simulation" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Step", exact: true })).toBeDisabled();
    await expect.poll(() => page.workers().length).toBe(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((violation) => violation.id)).toEqual([]);
  });
});

async function expectWorkerReady(page: Page, agentCount: 100 | 500): Promise<void> {
  const root = prototypeRoot(page);
  await expect(root).toHaveAttribute("data-agent-count", String(agentCount));
  await expect(root).toHaveAttribute("data-runtime-kind", "worker");
  await expect(root).toHaveAttribute("data-runtime-ready", "true");
  await expect(root).toHaveAttribute("data-tick", "0");
}

async function stepTo(page: Page, tick: number): Promise<void> {
  for (let nextTick = 1; nextTick <= tick; nextTick += 1) {
    await page.getByRole("button", { name: "Step", exact: true }).click();
    await expect(prototypeRoot(page)).toHaveAttribute("data-tick", String(nextTick));
  }
}

function prototypeRoot(page: Page) {
  return page.locator("[data-immersive-prototype]");
}
