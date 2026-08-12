import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const canvasName = "Immersive Flocking world rendered from the current runtime frame";

test("keeps camera labels coherent when selection is released or System view is zoomed", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.goto("/world/immersive-prototype?concept=field-scientist&agents=100", { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  await page.getByRole("button", { name: "Step" }).click();
  await inspectBoid(page, 1);
  const signature = await prototypeRoot(page).getAttribute("data-runtime-signature");

  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("Follow");
  const canvas = page.getByRole("img", { name: canvasName });
  await canvas.focus();
  await canvas.press("Escape");
  await expect(page.getByRole("heading", { level: 2, name: "No boid selected" })).toBeVisible();
  await expect(page.getByLabel("Prototype state")).toContainText("System");
  await expect(canvas).toBeFocused();

  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("Free pan");
  await expect(page.getByRole("button", { name: "System", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "System", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("System");
  await expectRuntimeUnchanged(page, signature, 1);
  await expectNoDiagnostics(diagnostics);
});

test("replaces the unsupported Hand metaphor with distinct read-only tools", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.goto("/world/immersive-prototype?concept=god-hand&agents=100", { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  const signature = await prototypeRoot(page).getAttribute("data-runtime-signature");
  const tools = page.getByLabel("God-Hand tool");
  const canvas = page.getByRole("img", { name: canvasName });

  await expect(tools.getByRole("button", { name: "Navigate", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(tools.getByRole("button", { name: "Hand", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Prototype state")).toContainText("Navigate");
  expect(await canvas.evaluate((element) => getComputedStyle(element).cursor)).toBe("grab");

  await tools.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("Inspect");
  expect(await canvas.evaluate((element) => getComputedStyle(element).cursor)).toBe("crosshair");
  await tools.getByRole("button", { name: "Measure", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText(/Measure[\s\S]*Alignment active/);
  await tools.getByRole("button", { name: "Navigate", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText(/Navigate[\s\S]*Off/);
  await expectRuntimeUnchanged(page, signature, 0);
  await expectNoDiagnostics(diagnostics);
});

test("uses bounded adaptive detail and prepares trajectories only for the selected boid", async ({ page }) => {
  test.setTimeout(90_000);
  const diagnostics = observePageDiagnostics(page);

  await page.goto("/world/immersive-prototype?concept=living-diorama&agents=100", { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  await expect(page.getByRole("img", { name: canvasName })).toHaveAttribute("data-render-quality", "high");

  await page.goto("/world/immersive-prototype?concept=living-diorama&agents=500", { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  const canvas = page.getByRole("img", { name: canvasName });
  await expect(canvas).toHaveAttribute("data-render-quality", /balanced|performance/);
  await startMeasurement(page);
  await activateByKeyboard(page.getByRole("button", { name: "Run immersive simulation" }));
  await page.waitForTimeout(1_200);
  await expect(canvas).toHaveAttribute("data-trail-points", "0");
  await activateByKeyboard(page.getByRole("button", { name: "Pause immersive simulation" }));

  await inspectBoid(page, 1);
  await activateByKeyboard(page.getByRole("button", { name: "Run immersive simulation" }));
  await page.waitForTimeout(1_200);
  await activateByKeyboard(page.getByRole("button", { name: "Pause immersive simulation" }));
  const measurement = await readMeasurement(page);
  expect(measurement.runtime.ticksAdvanced).toBeGreaterThan(0);
  expect(measurement.runtime.medianEngineStepMs).toBeGreaterThan(0);
  expect(measurement.runtime.medianSnapshotMs).toBeGreaterThanOrEqual(0);
  expect(measurement.runtime.medianAdapterMs).toBeGreaterThanOrEqual(0);
  expect(measurement.render?.trailPointCount ?? 0).toBeGreaterThan(0);
  expect(measurement.render?.trailPointCount ?? 0).toBeLessThanOrEqual(8);
  expect(measurement.render?.renderQuality).toMatch(/balanced|performance/);
  await expect(prototypeRoot(page)).toHaveAttribute("data-agent-count", "500");
  await expectNoDiagnostics(diagnostics);
});

test("survives rapid playback, concept, lens, focus, restore, and runtime replacement churn", async ({ page }) => {
  test.setTimeout(90_000);
  const diagnostics = observePageDiagnostics(page);
  await page.goto("/world/immersive-prototype?concept=living-diorama&agents=500", { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await activateByKeyboard(page.getByRole("button", { name: "Run immersive simulation" }));
    await page.waitForTimeout(120);
    await activateByKeyboard(page.getByRole("button", { name: "Pause immersive simulation" }));
  }
  await inspectBoid(page, 2);
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  const tick = Number(await prototypeRoot(page).getAttribute("data-tick"));
  const signature = await prototypeRoot(page).getAttribute("data-runtime-signature");

  await page.getByRole("tab", { name: "God-Hand" }).click();
  await page.getByRole("button", { name: "Measure", exact: true }).click();
  await page.getByRole("tab", { name: "Field Scientist" }).click();
  await page.getByRole("button", { name: "Alignment lens" }).click();
  await expectRuntimeUnchanged(page, signature, tick);

  await page.getByRole("button", { name: "Restore prepared prototype run" }).click();
  await page.getByRole("button", { name: "Confirm restore and discard current prototype run state" }).click();
  await expect(prototypeRoot(page)).toHaveAttribute("data-tick", "0");
  await expect(page.getByRole("heading", { level: 2, name: "No boid selected" })).toBeVisible();
  await expect(page.getByRole("img", { name: canvasName })).toHaveAttribute("data-trail-points", "0");

  await page.getByLabel("Scene load").selectOption("100");
  await expect(prototypeRoot(page)).toHaveAttribute("data-agent-count", "100");
  await waitForPrototypeReady(page);
  await expect(page.getByRole("img", { name: canvasName })).toHaveAttribute("data-render-quality", "high");
  await expectNoDiagnostics(diagnostics);
});

test("keeps core controls operable in mobile and short-height browser emulation", async ({ page }) => {
  test.setTimeout(120_000);
  const diagnostics = observePageDiagnostics(page);
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 600 }]) {
    await page.setViewportSize(viewport);
    for (const concept of ["living-diorama", "god-hand", "field-scientist"] as const) {
      await page.goto(`/world/immersive-prototype?concept=${concept}&agents=100`, { waitUntil: "domcontentloaded" });
      await waitForPrototypeReady(page);
      await inspectBoid(page, 1);
      await page.getByRole("button", { name: "Zoom in" }).click();
      await page.getByRole("button", { name: "Reset camera" }).click();
      if (concept === "god-hand") {
        await page.getByRole("button", { name: "Measure", exact: true }).click();
      } else {
        await page.getByRole("button", { name: "Alignment lens" }).click();
        await page.getByRole("button", { name: "Follow", exact: true }).click();
        await page.getByRole("button", { name: "System view" }).click();
      }
      await page.getByRole("button", { name: "Step" }).click();
      await expectNoDocumentOverflow(page, `${concept} ${viewport.width}x${viewport.height}`);
    }
  }
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.map((violation) => violation.id)).toEqual([]);
  await expectNoDiagnostics(diagnostics);
});

function prototypeRoot(page: Page) {
  return page.locator("[data-immersive-prototype]");
}

async function waitForPrototypeReady(page: Page) {
  await page.waitForFunction(() => {
    const api = (window as Window & { __ORTUS_IMMERSIVE_AUDIT__?: { readMeasurement?: unknown; whenReady?: unknown } }).__ORTUS_IMMERSIVE_AUDIT__;
    return typeof api?.readMeasurement === "function" && typeof api.whenReady === "function";
  });
  await page.evaluate(() => (window as Window & {
    __ORTUS_IMMERSIVE_AUDIT__: { whenReady(): Promise<void> };
  }).__ORTUS_IMMERSIVE_AUDIT__.whenReady());
  await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-ready", "true");
  await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-kind", "worker");
  const canvas = page.getByRole("img", { name: canvasName });
  await expect(canvas).toHaveAttribute("data-tick", /\d+/);
  await expect(canvas).toHaveAttribute("data-render-quality", /high|balanced|performance/);
}

async function inspectBoid(page: Page, number: number) {
  await page.getByRole("spinbutton", { name: "Boid number" }).fill(String(number));
  await page.getByLabel("Selected boid inspector").getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: `Boid ${number}` })).toBeVisible();
}

async function activateByKeyboard(locator: Locator) {
  await locator.focus();
  await locator.press("Enter");
}

async function expectRuntimeUnchanged(page: Page, signature: string | null, tick: number) {
  await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-signature", signature ?? "");
  await expect(prototypeRoot(page)).toHaveAttribute("data-tick", String(tick));
}

async function startMeasurement(page: Page) {
  await page.evaluate(() => (window as Window & {
    __ORTUS_IMMERSIVE_AUDIT__: { startMeasurement(): void };
  }).__ORTUS_IMMERSIVE_AUDIT__.startMeasurement());
}

async function readMeasurement(page: Page) {
  return page.evaluate(() => (window as Window & {
    __ORTUS_IMMERSIVE_AUDIT__: { readMeasurement(): {
      runtime: {
        ticksAdvanced: number;
        medianEngineStepMs: number;
        medianSnapshotMs: number;
        medianAdapterMs: number;
      };
      render: { trailPointCount: number; renderQuality: string } | null;
    } };
  }).__ORTUS_IMMERSIVE_AUDIT__.readMeasurement());
}

async function expectNoDocumentOverflow(page: Page, label: string) {
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  }));
  expect(dimensions.documentWidth, label).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.documentHeight, label).toBeLessThanOrEqual(dimensions.viewportHeight);
}

interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  badResponses: string[];
  failedRequests: string[];
}

function observePageDiagnostics(page: Page): PageDiagnostics {
  const diagnostics: PageDiagnostics = { consoleErrors: [], pageErrors: [], badResponses: [], failedRequests: [] };
  const criticalTypes = new Set(["document", "script", "stylesheet", "font", "image"]);
  page.on("console", (message) => {
    const messageText = message.text();
    if (message.type() === "error" || /hydration|did not match|server html|client html/i.test(messageText)) {
      diagnostics.consoleErrors.push(`${message.type()}: ${messageText}`);
    }
  });
  page.on("pageerror", (error) => diagnostics.pageErrors.push(error.stack ?? error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && criticalTypes.has(response.request().resourceType())) {
      diagnostics.badResponses.push(`${response.status()} ${response.request().resourceType()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (criticalTypes.has(request.resourceType())) {
      diagnostics.failedRequests.push(`${request.resourceType()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
    }
  });
  return diagnostics;
}

async function expectNoDiagnostics(diagnostics: PageDiagnostics) {
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.badResponses).toEqual([]);
  expect(diagnostics.failedRequests).toEqual([]);
}
