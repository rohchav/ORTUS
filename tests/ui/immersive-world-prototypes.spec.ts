import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const prototypePath = "/world/immersive-prototype?concept=living-diorama&agents=100";
const concepts = [
  { id: "living-diorama", label: "Living Diorama" },
  { id: "god-hand", label: "God-Hand" },
  { id: "field-scientist", label: "Field Scientist" }
] as const;

test("validates the isolated prototype route and keeps it out of production navigation", async ({ page }) => {
  await page.goto("/world/immersive-prototype", { waitUntil: "domcontentloaded" });
  await expect(prototypeRoot(page)).toHaveAttribute("data-concept", "living-diorama");
  await expect(prototypeRoot(page)).toHaveAttribute("data-agent-count", "100");
  await expect(page.locator("a[href*='immersive-prototype']")).toHaveCount(0);

  for (const path of [
    "/world/immersive-prototype?concept=unknown&agents=100",
    "/world/immersive-prototype?concept=god-hand&agents=250",
    "/world/immersive-prototype?concept=god-hand&concept=field-scientist&agents=100",
    "/world/immersive-prototype?concept=god-hand&agents=100&template=epidemic-spread",
    "/world/immersive-prototype?concept=god-hand&agents=100&then=unsafe",
    "/world/immersive-prototype?concept=god-hand&agents=100&constructor=unsafe"
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-immersive-prototype-error]"), path).toContainText(/prototype URL (?:accepts|contains)/i);
    await expect(prototypeRoot(page), path).toHaveCount(0);
  }
});

test("switches all concepts around one authoritative run without camera, selection, or lens mutation", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.goto(prototypePath, { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  await page.getByRole("button", { name: "Step" }).click();
  await expect(prototypeRoot(page)).toHaveAttribute("data-tick", "1");

  const picker = page.getByRole("spinbutton", { name: "Boid number" });
  await picker.fill("1");
  await page.getByLabel("Selected boid inspector").getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Boid 1" })).toBeVisible();
  const signature = await prototypeRoot(page).getAttribute("data-runtime-signature");

  await page.getByRole("button", { name: "Alignment lens" }).click();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("Follow");
  await expectRuntimeUnchanged(page, signature, 1);

  await page.getByRole("tab", { name: "God-Hand" }).click();
  await expect(page).toHaveURL(/concept=god-hand&agents=100/);
  await expect(prototypeRoot(page)).toHaveAttribute("data-concept", "god-hand");
  await expectRuntimeUnchanged(page, signature, 1);
  await page.getByLabel("God-Hand tool").getByRole("button", { name: "Inspect" }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("Inspect");
  await page.getByRole("button", { name: "Measure" }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("Alignment active");
  await expectRuntimeUnchanged(page, signature, 1);

  await page.getByRole("tab", { name: "Field Scientist" }).click();
  await expect(page).toHaveURL(/concept=field-scientist&agents=100/);
  await expect(prototypeRoot(page)).toHaveAttribute("data-concept", "field-scientist");
  await page.getByRole("button", { name: "Local", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("Local");
  await page.getByRole("button", { name: "System", exact: true }).click();
  await expect(page.getByLabel("Prototype state")).toContainText("System");
  await expectRuntimeUnchanged(page, signature, 1);
  await page.goBack();
  await expect(prototypeRoot(page)).toHaveAttribute("data-concept", "god-hand");
  await expectRuntimeUnchanged(page, signature, 1);
  await page.goForward();
  await expect(prototypeRoot(page)).toHaveAttribute("data-concept", "field-scientist");
  await expectRuntimeUnchanged(page, signature, 1);
  await expectNoDiagnostics(diagnostics);
});

test("provides truthful playback, staged restore, and staged scene replacement", async ({ page }) => {
  await page.goto(prototypePath, { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  await activateByKeyboard(page.getByRole("button", { name: "Run immersive simulation" }));
  await expect.poll(() => prototypeTick(page)).toBeGreaterThan(1);
  await activateByKeyboard(page.getByRole("button", { name: "Pause immersive simulation" }));
  await expect(page.getByLabel("Current prototype run")).toContainText("Paused");

  await page.getByRole("button", { name: "Restore prepared prototype run" }).click();
  await expect(page.getByRole("status")).toContainText("discards current tick, metric history, selection, camera focus, trails, and effects");
  await page.getByRole("button", { name: "Confirm restore and discard current prototype run state" }).click();
  await expect(prototypeRoot(page)).toHaveAttribute("data-tick", "0");
  await expect(page.getByText("Awaiting tick", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Step" }).click();
  await page.getByLabel("Scene load").selectOption("500");
  const replacement = page.getByRole("dialog", { name: "Load 500 boids" });
  await expect(replacement).toContainText("fresh paused tick-0 engine");
  await replacement.getByRole("button", { name: "Confirm replacement" }).click();
  await expect(prototypeRoot(page)).toHaveAttribute("data-agent-count", "500");
  await expect(prototypeRoot(page)).toHaveAttribute("data-tick", "0");
  await expect(page.getByRole("heading", { level: 2, name: "No boid selected" })).toBeVisible();
  await expect(page).toHaveURL(/concept=living-diorama&agents=500/);
});

test("keeps keyboard inspection, focus return, and reduced-motion equivalents available", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(prototypePath, { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  await expect(prototypeRoot(page)).toHaveAttribute("data-reduced-motion", "true");

  const livingTab = page.getByRole("tab", { name: "Living Diorama" });
  await livingTab.focus();
  await livingTab.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "God-Hand" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(prototypeRoot(page)).toHaveAttribute("data-concept", "god-hand");

  const canvas = page.getByRole("img", { name: "Immersive Flocking world rendered from the current runtime frame" });
  await canvas.focus();
  await canvas.press("ArrowRight");
  await expect(page.getByRole("heading", { level: 2, name: "Boid 1" })).toBeVisible();
  await canvas.press("+");
  await canvas.press("Home");
  await canvas.press("Escape");
  await expect(page.getByRole("heading", { level: 2, name: "No boid selected" })).toBeVisible();

  const rubricTrigger = page.getByRole("button", { name: "Rubric" });
  await rubricTrigger.click();
  const rubric = page.getByRole("dialog", { name: "Immersive concept rubric" });
  await expect(rubric).toContainText("Cross-template potential");
  await page.keyboard.press("Escape");
  await expect(rubricTrigger).toBeFocused();

  await page.getByRole("button", { name: "Step" }).click();
  await expect.poll(() => canvas.getAttribute("data-effect-count")).toBe("0");
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.map((violation) => violation.id)).toEqual([]);
  await expectNoDiagnostics(diagnostics);
});

test("keeps all concepts world-dominant and reachable at the six required viewports", async ({ page }) => {
  test.setTimeout(180_000);
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 900, height: 700 },
    { width: 1280, height: 600 },
    { width: 390, height: 844 }
  ];

  for (const viewport of viewports) {
      await page.setViewportSize(viewport);
    for (const concept of concepts) {
      await page.goto(`/world/immersive-prototype?concept=${concept.id}&agents=100`, { waitUntil: "domcontentloaded" });
      await waitForPrototypeReady(page);
      const root = prototypeRoot(page);
      const stage = page.locator("[data-world-dominant-stage]");
      await expect(root, `${concept.id} ${viewport.width}x${viewport.height}`).toHaveAttribute("data-concept", concept.id);
      await expect(page.getByRole("tab", { name: concept.label }), `${concept.id} ${viewport.width}x${viewport.height}`).toHaveAttribute("aria-selected", "true");
      await expect(page.getByLabel("Immersive prototype playback controls"), `${concept.id} ${viewport.width}x${viewport.height}`).toBeVisible();
      await expect(page.getByRole("button", { name: "Reset camera" }), `${concept.id} ${viewport.width}x${viewport.height}`).toBeVisible();
      await expectNoDocumentOverflow(page, `${concept.id} ${viewport.width}x${viewport.height}`);

      const geometry = await stage.evaluate((element) => {
        const root = element.closest("[data-immersive-prototype]")!;
        return {
          stageHeight: element.getBoundingClientRect().height,
          rootHeight: root.getBoundingClientRect().height
        };
      });
      expect(geometry.stageHeight / geometry.rootHeight, `${concept.id} ${viewport.width}x${viewport.height}`).toBeGreaterThan(0.58);
      expect(await sampledCanvasColorCount(page), `${concept.id} ${viewport.width}x${viewport.height}`).toBeGreaterThan(12);
    }
  }
});

test("runs bounded 500-boid performance smoke for each concept without runtime or rendering errors", async ({ page }) => {
  test.setTimeout(90_000);
  const diagnostics = observePageDiagnostics(page);
  for (const concept of concepts) {
    await page.goto(`/world/immersive-prototype?concept=${concept.id}&agents=500`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean((window as Window & { __ORTUS_IMMERSIVE_AUDIT__?: unknown }).__ORTUS_IMMERSIVE_AUDIT__));
    await page.evaluate(() => (window as Window & { __ORTUS_IMMERSIVE_AUDIT__: { startMeasurement(): void } }).__ORTUS_IMMERSIVE_AUDIT__.startMeasurement());
    await activateByKeyboard(page.getByRole("button", { name: "Run immersive simulation" }));
    await page.waitForTimeout(1_800);
    await activateByKeyboard(page.getByRole("button", { name: "Pause immersive simulation" }));
    const result = await page.evaluate(() => (window as Window & {
      __ORTUS_IMMERSIVE_AUDIT__: { readMeasurement(): {
        runtime: { ticksAdvanced: number; ticksPerSecond: number; sampleCount: number };
        render: {
          frameCount: number;
          trailPointCount: number;
          effectCount: number;
          renderQuality: string;
        } | null;
      } };
    }).__ORTUS_IMMERSIVE_AUDIT__.readMeasurement());

    expect(result.runtime.ticksAdvanced, concept.id).toBeGreaterThan(0);
    expect(result.runtime.ticksPerSecond, concept.id).toBeGreaterThan(0);
    expect(result.runtime.sampleCount, concept.id).toBeGreaterThan(0);
    expect(result.render?.frameCount, concept.id).toBeGreaterThan(0);
    expect(result.render?.trailPointCount ?? 0, concept.id).toBeLessThanOrEqual(12);
    expect(result.render?.effectCount ?? 0, concept.id).toBeLessThanOrEqual(24);
    expect(result.render?.renderQuality, concept.id).toMatch(/high|balanced|performance/);
  }
  await expectNoDiagnostics(diagnostics);
});

test("does not create prototype persistence across interactions or reload", async ({ page }) => {
  await page.goto(prototypePath, { waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  const before = await browserStorageKeys(page);
  await page.getByRole("button", { name: "Step" }).click();
  await page.getByRole("tab", { name: "Field Scientist" }).click();
  await page.getByRole("button", { name: "Alignment lens" }).click();
  expect(await browserStorageKeys(page)).toEqual(before);

  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForPrototypeReady(page);
  await expect(prototypeRoot(page)).toHaveAttribute("data-concept", "field-scientist");
  await expect(prototypeRoot(page)).toHaveAttribute("data-tick", "0");
  await expect(page.getByRole("button", { name: "Alignment lens" })).toHaveAttribute("aria-pressed", "false");
  expect(await browserStorageKeys(page)).toEqual(before);
});

test("leaves the production Flocking World behavior and navigation surface intact", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.goto("/world?template=flocking-boids", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Simulation world stage")).toBeVisible();
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();
  await expect(page.locator("[data-immersive-prototype]")).toHaveCount(0);
  await expect(page.locator("a[href*='immersive-prototype']")).toHaveCount(0);
  await page.getByRole("button", { name: "Step exactly one tick" }).click();
  await expect(page.locator(".timeline-strip__readout strong").first()).toHaveText("1");
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
  await expect(page.getByRole("img", { name: "Immersive Flocking world rendered from the current runtime frame" }))
    .toHaveAttribute("data-tick", /\d+/);
}

async function prototypeTick(page: Page): Promise<number> {
  return Number(await prototypeRoot(page).getAttribute("data-tick"));
}

async function expectRuntimeUnchanged(page: Page, signature: string | null, tick: number) {
  await expect(prototypeRoot(page)).toHaveAttribute("data-tick", String(tick));
  await expect(prototypeRoot(page)).toHaveAttribute("data-runtime-signature", signature ?? "");
}

async function activateByKeyboard(locator: Locator) {
  await locator.focus();
  await locator.press("Enter");
}

async function sampledCanvasColorCount(page: Page): Promise<number> {
  return page.getByRole("img", { name: "Immersive Flocking world rendered from the current runtime frame" }).evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set<string>();
    const stride = Math.max(4, Math.floor(pixels.length / 2_000 / 4) * 4);
    for (let index = 0; index < pixels.length; index += stride) {
      colors.add(`${pixels[index]}:${pixels[index + 1]}:${pixels[index + 2]}:${pixels[index + 3]}`);
    }
    return colors.size;
  });
}

async function browserStorageKeys(page: Page): Promise<{ local: string[]; session: string[] }> {
  return page.evaluate(() => ({
    local: Object.keys(localStorage).sort(),
    session: Object.keys(sessionStorage).sort()
  }));
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
    const text = message.text();
    if (message.type() === "error" || /hydration|did not match|server html|client html/i.test(text)) {
      diagnostics.consoleErrors.push(`${message.type()}: ${text}`);
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
