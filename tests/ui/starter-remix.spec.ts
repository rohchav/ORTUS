import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("Starter detail and prepared recipe links open a strict immutable Remix workspace", async ({ page }) => {
  await page.goto("/worlds/collective-motion", { waitUntil: "domcontentloaded" });
  const remixLink = page.getByRole("link", { name: "Remix this system", exact: true });
  await expect(remixLink).toHaveAttribute("href", "/builder?starter=flocking&focus=alignmentWeight");
  await remixLink.click();

  await expect(page).toHaveURL(/\/builder\?starter=flocking&focus=alignmentWeight$/);
  await page.waitForLoadState("networkidle");
  const workspace = page.locator("[data-starter-remix-workspace]");
  await expect(workspace).toBeVisible();
  await expect(page.getByRole("tab", { name: /Starter Remix/ })).toHaveAttribute("aria-selected", "true");
  await expect(workspace).toContainText("Source Starter: Flocking baseline");
  await expect(workspace).toContainText("Unsaved remix");
  await expect(workspace).toContainText("Fixed in this remix");
  await expect(workspace).toContainText("Future composition");
  await expect(workspace).toContainText("Executing schemas, formulas, scripts, or custom code");
  const desktopAxe = await new AxeBuilder({ page }).analyze();
  expect(desktopAxe.violations, JSON.stringify(desktopAxe.violations, null, 2)).toEqual([]);

  const primary = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  const sourceValue = await primary.inputValue();
  await primary.fill("999");
  await expect(primary).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator('[role="alert"]').filter({ hasText: "Alignment weight must be at most" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Run Remix" })).toBeDisabled();

  await page.getByRole("button", { name: "Reset to source" }).click();
  await expect(primary).toHaveValue(sourceValue);
  await expect(primary).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByRole("button", { name: "Run Remix" })).toBeEnabled();

  await page.getByRole("button", { name: "Edit exact run configuration" }).click();
  const seed = page.getByLabel(/Seed/);
  await seed.fill("");
  await expect(seed).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Behavior mode").selectOption({ index: 1 });
  await expect(seed).toHaveValue("");
  await expect(seed).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("button", { name: "Run Remix" })).toBeDisabled();
  await page.getByRole("button", { name: "Reset to source" }).click();

  await page.goto("/worlds/coordination-under-sensor-noise", { waitUntil: "domcontentloaded" });
  const recipeRemix = page.getByRole("link", { name: "Remix baseline: Clear local signals" });
  await expect(recipeRemix).toHaveAttribute(
    "href",
    "/builder?starter=coordination-under-sensor-noise&recipe=coordination-clear-signals&focus=noise"
  );
});

test("Flocking Remix launches only through the Worker path, exposes lineage, resets honestly, and expires on reload", async ({ page }) => {
  await page.goto("/builder?starter=flocking&focus=alignmentWeight", { waitUntil: "domcontentloaded" });
  await page.getByRole("spinbutton", { name: "Alignment weight numeric value" }).fill("0.2");
  await page.getByRole("button", { name: "Run Remix" }).click();

  await expect(page).toHaveURL(/\/world\?starter=flocking&remix=remix-flocking-[a-z0-9]+/);
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  await expect(page.getByLabel("World template")).toHaveValue("flocking-boids");
  await expect(page.getByRole("heading", { name: "Unsaved remix of Flocking baseline" })).toBeVisible();
  await page.getByRole("button", { name: "Run details" }).click();
  const details = page.getByRole("dialog");
  await expect(details).toContainText("WorkerRuntimeDriver / flocking-v1");
  await expect(details).toContainText("Source Starter");
  await expect(details).toContainText("Collective Motion");
  await expect(details).toContainText("Derivative");
  await expect(details).toContainText("Unsaved remix");
  await details.getByRole("button", { name: "Close run details" }).click();

  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
  await page.getByRole("button", { name: /Prepare reset; current tick/ }).click();
  await expect(page.getByText(/Confirm Reset to rebuild a fresh tick-0 run from the current model, parameters, and seed/)).toBeVisible();
  await page.getByRole("button", { name: "Confirm reset and discard current run state" }).click();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await expect(page.getByRole("spinbutton", { name: "Alignment weight numeric value" })).toHaveValue("0.2");
  await expect(page.getByRole("heading", { name: "Unsaved remix of Flocking baseline" })).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-remix-resume-error]")).toBeVisible();
  await expect(page.getByText(/did not substitute the source Starter or a generic run/i)).toBeVisible();
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toHaveCount(0);
});

test("a legacy Starter Remix retains the established main-thread runtime path", async ({ page }) => {
  await page.goto("/builder?starter=epidemic&focus=infectionProbability", { waitUntil: "domcontentloaded" });
  await page.getByRole("spinbutton", { name: "Infection probability numeric value" }).fill("0.1");
  await page.getByRole("button", { name: "Run Remix" }).click();

  await expect(page).toHaveURL(/\/world\?starter=epidemic&remix=remix-epidemic-[a-z0-9]+/);
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  await expect(page.getByLabel("World template")).toHaveValue("epidemic-spread");
  await page.getByRole("button", { name: "Run details" }).click();
  const details = page.getByRole("dialog");
  await expect(details).toContainText("Active World engine");
  await expect(details).not.toContainText("WorkerRuntimeDriver");
  await expect(details).toContainText("Local Contact Outbreaks");
  await details.getByRole("button", { name: "Close run details" }).click();

  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  await page.getByRole("button", { name: /Prepare reset; current tick/ }).click();
  await page.getByRole("button", { name: "Confirm reset and discard current run state" }).click();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("0");
  await expect(page.getByRole("heading", { name: "Unsaved remix of Epidemic Spread baseline" })).toBeVisible();
});

test("active World entry copies only a matching accepted configuration and Reset to source is explicit", async ({ page }) => {
  await page.goto("/world?starter=flocking", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  const activeParameter = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  const sourceValue = await activeParameter.inputValue();
  await activeParameter.fill("0.2");
  await page.getByRole("button", { name: "Rebuild run with parameter drafts" }).click();
  await expect(
    page.getByLabel("Key model parameters").getByText("Active run: 0.2. Draft matches.", { exact: true })
  ).toBeVisible();
  await page.getByRole("link", { name: "Remix this system" }).click();

  await expect(page).toHaveURL(/\/builder\?starter=flocking&from=world&focus=alignmentWeight/);
  const remixParameter = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  await expect(remixParameter).toHaveValue("0.2");
  await expect(page.getByText(/Drafted from the accepted active World configuration/i)).toBeVisible();
  await page.getByRole("button", { name: "Reset to source" }).click();
  await expect(remixParameter).toHaveValue(sourceValue);
  await expect(page.getByText(/No active run was changed/i)).toBeVisible();

  await remixParameter.fill("0.3");
  const reviewSourceLink = page.getByRole("link", { name: "Review source Starter" });
  await reviewSourceLink.click();
  const leaveDialog = page.getByRole("alertdialog");
  await expect(leaveDialog).toBeVisible();
  await expect(leaveDialog.getByRole("button", { name: "Leave Workshop" })).toBeFocused();
  await leaveDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(reviewSourceLink).toBeFocused();
  await expect(remixParameter).toHaveValue("0.3");
});

test("strict remix URLs reject payload overrides, stale IDs, and duplicate sources", async ({ page }) => {
  await page.goto("/builder?starter=flocking&parameters=alignmentWeight", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-remix-error]")).toContainText("unsupported configuration data");

  await page.goto("/builder?starter=flocking&starter=epidemic", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-remix-error]")).toContainText("duplicate values");

  await page.goto("/world?starter=flocking&remix=", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-launch-error]")).toContainText("remix identifier is malformed");
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toHaveCount(0);

  await page.goto("/world?starter=flocking&remix=remix-flocking-stale", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-remix-resume-error]")).toBeVisible();
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toHaveCount(0);
});

test("Back, Forward, and source switching do not resurrect or cross-contaminate discarded drafts", async ({ page }) => {
  await page.goto("/builder?starter=flocking&focus=alignmentWeight", { waitUntil: "domcontentloaded" });
  const flockingParameter = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  await flockingParameter.fill("0.31");
  await page.getByRole("link", { name: "Review source Starter" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Leave Workshop" }).click();
  await expect(page).toHaveURL(/\/worlds\/collective-motion$/);

  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/builder\?starter=flocking&focus=alignmentWeight$/);
  await expect(page.locator("[data-starter-remix-workspace]")).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Alignment weight numeric value" })).toHaveValue("0.55");

  await page.goForward({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/worlds\/collective-motion$/);
  await page.goto("/builder?starter=epidemic&focus=infectionProbability", { waitUntil: "domcontentloaded" });
  const epidemicWorkspace = page.locator("[data-starter-remix-workspace]");
  await expect(epidemicWorkspace).toContainText("Source Starter: Epidemic Spread baseline");
  await expect(page.getByRole("spinbutton", { name: "Alignment weight numeric value" })).toHaveCount(0);
  await expect(page.getByRole("spinbutton", { name: "Infection probability numeric value" })).not.toHaveValue("0.31");
});

test("core Remix workflow is keyboard-operable and responsive without critical Axe findings", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/builder?starter=flocking&focus=alignmentWeight", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-remix-workspace]")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("tab", { name: /Starter Remix/ }).focus();
  await tabUntilFocused(page, "starter-remix-primary-control");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("0.2");
  await tabUntilButton(page, "Run Remix");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/world\?starter=flocking&remix=/);

  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-starter-remix-workspace]")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  await expectNoHorizontalOverflow(page);
});

async function tabUntilFocused(page: Page, id: string): Promise<void> {
  for (let index = 0; index < 80; index += 1) {
    await page.keyboard.press("Tab");
    if (await page.evaluate((targetId) => document.activeElement?.id === targetId, id)) {
      return;
    }
  }
  throw new Error(`Keyboard focus did not reach #${id}.`);
}

async function tabUntilButton(page: Page, name: string): Promise<void> {
  for (let index = 0; index < 120; index += 1) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      text: document.activeElement?.textContent?.trim()
    }));
    if (focused.tag === "BUTTON" && focused.text === name) {
      return;
    }
  }
  throw new Error(`Keyboard focus did not reach ${name}.`);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
