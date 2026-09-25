import { expect, test, type Page } from "@playwright/test";

async function openWorld(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".ortus-shell:not(.ortus-shell--hydrating)")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "World" })).toHaveCount(1);
}

async function expectProvenance(page: Page, facts: Record<string, string>) {
  await page.getByRole("button", { name: "Run details" }).click();
  const dialog = page.getByRole("dialog", { name: "Technical run details" });
  for (const [term, value] of Object.entries(facts)) {
    await expect(dialog.locator("dt", { hasText: new RegExp(`^${term}$`) }).locator("xpath=following-sibling::dd[1]")).toHaveText(value);
  }
  await dialog.getByRole("button", { name: "Close run details" }).click();
  await expect(dialog).toHaveCount(0);
}

test("Reset rebuilds an applied scenario's model variant, not the template default", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorld(page, "/world?template=opinion-dynamics");
  const tick = page.locator(".timeline-strip__readout strong").first();

  await page.getByRole("button", { name: "Choose recipe" }).click();
  await page.getByRole("combobox", { name: "Initialization Preset", exact: true }).selectOption("consensus-start");
  await page.getByRole("combobox", { name: "Behavior Mode", exact: true }).selectOption("socialLearning");
  await page.getByRole("button", { name: "Apply Scenario" }).click();
  await expect(tick).toHaveText("0");
  await expectProvenance(page, { Behavior: "Social learning", Initialization: "Consensus Start" });

  const step = page.getByRole("button", { name: "Step exactly one tick" });
  await step.click();
  await step.click();
  await expect(tick).toHaveText("2");

  await page.getByRole("button", { name: /Prepare reset/ }).click();
  await page.getByRole("button", { name: "Confirm reset and discard current run state" }).click();
  await expect(tick).toHaveText("0");
  await expectProvenance(page, { Behavior: "Social learning", Initialization: "Consensus Start" });
});

test("a snapshot that restore refuses leaves the current main-thread run in place", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorld(page, "/world?template=opinion-dynamics&task=compare");
  const tick = page.locator(".timeline-strip__readout strong").first();
  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  await expect(tick).toHaveText("1");

  await page.getByRole("button", { name: "Open exchange" }).click();
  await page.getByRole("button", { name: "Export Snapshot" }).click();
  const exported = await page.getByLabel("Latest exported scenario or snapshot JSON").inputValue();
  const tampered = destroyFirstEntityInPlace(exported);
  await page.getByLabel("Scenario or snapshot JSON to import").fill(tampered.json);
  await page.getByRole("button", { name: "Import Snapshot" }).click();

  await expect(page.locator(".error-banner")).toContainText(`Import failed: Space opinion-space contains destroyed entity ${tampered.entityId}`);
  await expect(tick).toHaveText("1");
  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  await expect(tick).toHaveText("2");
});

// Marks the first entity destroyed while leaving it in its space: schema-valid, rejected on restore.
function destroyFirstEntityInPlace(snapshotJson: string): { json: string; entityId: string } {
  const snapshot = JSON.parse(snapshotJson) as { world: { entities: { entities: Array<Record<string, unknown>> } } };
  const entity = snapshot.world.entities.entities[0]!;
  Object.assign(entity, { alive: false, destroyedAtTick: 1 });
  return { json: JSON.stringify(snapshot), entityId: String(entity.id) };
}
