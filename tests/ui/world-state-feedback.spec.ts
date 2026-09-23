import { expect, test, type Page } from "@playwright/test";

async function openWorld(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "World" })).toHaveCount(1);
}

function worldTask(page: Page, name: "Setup" | "Compare") {
  return page.getByRole("navigation", { name: "World tasks" }).getByRole("button", { name, exact: true });
}

test("shows a main-thread error on the stage with its area, and an unrelated success does not dismiss it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorld(page, "/world?template=epidemic-spread&task=compare");
  await page.getByRole("button", { name: "Open exchange" }).click();
  await page.getByLabel("Scenario or snapshot JSON to import").fill("null");
  await page.getByRole("button", { name: "Import Snapshot" }).click();

  const banner = page.locator(".error-banner");
  await expect(banner).toHaveAttribute("role", "alert");
  await expect(banner).toContainText("Import and export");
  await expect(banner).toContainText("Import failed: Invalid snapshot payload");

  await page.getByRole("button", { name: "Back to Compare" }).click();
  await page.getByRole("button", { name: "Capture Run" }).click();
  await expect(page.getByText("Saved comparison runs")).toBeVisible();
  await expect(banner).toContainText("Import failed: Invalid snapshot payload");

  await banner.getByRole("button", { name: "Dismiss error" }).click();
  await expect(banner).toHaveCount(0);
});

test("labels a retained sweep from another model before it is added to comparison", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorld(page, "/world?template=epidemic-spread&task=experiment");
  await page.getByLabel("Trials").fill("1");
  await page.getByLabel("Ticks/run").fill("5");
  await page.getByRole("button", { name: "Start Sweep" }).click();
  await expect(page.getByText("Experiment complete.")).toBeVisible({ timeout: 30_000 });

  await worldTask(page, "Compare").click();
  await expect(page.getByRole("button", { name: "Add Experiment Runs" })).toBeEnabled();
  await expect(page.locator("#comparison-sweep-source")).toHaveCount(0);

  await worldTask(page, "Setup").click();
  await page.getByLabel("World template").selectOption("opinion-dynamics");
  await worldTask(page, "Compare").click();

  const add = page.getByRole("button", { name: "Add Epidemic Sweep Runs" });
  await expect(add).toBeEnabled();
  await expect(page.getByRole("button", { name: "Add Experiment Runs" })).toHaveCount(0);
  await expect(page.locator("#comparison-sweep-source")).toContainText("The latest parameter sweep ran the Epidemic model, not the current world.");
  await add.click();
  const newest = page.locator(".run-library li").first();
  await expect(newest.locator(".run-library__label input")).toHaveValue(/^Epidemic /);
  await expect(newest.locator(".run-library__meta")).toContainText("Epidemic Spread");
});
