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
