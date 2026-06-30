import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const destinations = [
  { label: "World", path: "/", readySelector: ".ortus-shell:not(.ortus-shell--hydrating)" },
  { label: "Lab", path: "/lab", readySelector: "[data-destination-surface='lab']" },
  { label: "Atlas", path: "/atlas", readySelector: "[data-destination-surface='atlas']" },
  { label: "Workshop", path: "/builder", readySelector: "section.builder-shell" }
] as const;

const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "wide-short", width: 1280, height: 720 },
  { label: "tablet", width: 1024, height: 768 },
  { label: "narrow-workbench", width: 900, height: 700 },
  { label: "short-desktop", width: 1280, height: 600 }
] as const;

interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  badResponses: string[];
  failedRequests: string[];
}

function observePageDiagnostics(page: Page): PageDiagnostics {
  const diagnostics: PageDiagnostics = {
    consoleErrors: [],
    pageErrors: [],
    badResponses: [],
    failedRequests: []
  };
  const criticalResourceTypes = new Set(["document", "script", "stylesheet", "font", "image"]);

  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" || /hydration|did not match|server html|client html/i.test(text)) {
      diagnostics.consoleErrors.push(`${message.type()}: ${text}`);
    }
  });
  page.on("pageerror", (error) => {
    diagnostics.pageErrors.push(error.stack ?? error.message);
  });
  page.on("response", (response) => {
    const request = response.request();
    if (response.status() >= 400 && criticalResourceTypes.has(request.resourceType()) && !isDataLikeUrl(response.url())) {
      diagnostics.badResponses.push(`${response.status()} ${request.resourceType()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (criticalResourceTypes.has(request.resourceType()) && !isDataLikeUrl(request.url())) {
      diagnostics.failedRequests.push(`${request.resourceType()} ${request.url()} ${request.failure()?.errorText ?? "request failed"}`);
    }
  });

  return diagnostics;
}

async function openDestination(page: Page, destination: (typeof destinations)[number]) {
  await page.goto(destination.path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
  await expect(page.locator(destination.readySelector), `${destination.path} should render the destination surface`).toBeVisible();
  await expectShellStructure(page, destination.label);
}

async function expectShellStructure(page: Page, destinationLabel: string) {
  await expect(page.getByRole("link", { name: "Skip to destination content" })).toHaveCount(1);
  await expect(page.getByRole("banner", { name: "ORTUS Research World shell" })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "ORTUS home" })).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Research World destinations" })).toHaveCount(1);
  await expect(page.getByRole("main"), "each destination should expose one shared main landmark").toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: destinationLabel }), "each route should expose exactly one route h1").toHaveCount(1);
}

async function expectNoDiagnostics(diagnostics: PageDiagnostics) {
  expect(diagnostics.pageErrors, "unexpected pageerror events").toEqual([]);
  expect(diagnostics.consoleErrors, "unexpected console errors or hydration mismatch messages").toEqual([]);
  expect(diagnostics.badResponses, "unexpected missing critical assets or failing critical responses").toEqual([]);
  expect(diagnostics.failedRequests, "unexpected failed critical asset requests").toEqual([]);
}

async function expectDestinationNavContract(page: Page, currentPath: string) {
  const nav = page.getByRole("navigation", { name: "Research World destinations" });
  await expect(nav).toBeVisible();

  const links = nav.getByRole("link");
  await expect(links).toHaveCount(4);
  const linkModels = await links.evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      label: anchor.querySelector("[data-destination-label]")?.textContent?.trim() ?? "",
      path: new URL((anchor as HTMLAnchorElement).href).pathname,
      search: new URL((anchor as HTMLAnchorElement).href).search,
      hash: new URL((anchor as HTMLAnchorElement).href).hash,
      current: anchor.getAttribute("aria-current") === "page",
      ariaLabel: anchor.getAttribute("aria-label") ?? "",
      ariaDisabled: anchor.getAttribute("aria-disabled") ?? "",
      disabled: anchor.hasAttribute("disabled"),
      text: anchor.textContent?.trim() ?? ""
    }))
  );

  expect(linkModels.map((link) => link.label)).toEqual(["World", "Lab", "Atlas", "Workshop"]);
  expect(linkModels.map((link) => link.path)).toEqual(["/", "/lab", "/atlas", "/builder"]);
  expect(linkModels.map((link) => link.search)).toEqual(["", "", "", ""]);
  expect(linkModels.map((link) => link.hash)).toEqual(["", "", "", ""]);
  expect(linkModels.filter((link) => link.current).map((link) => link.path)).toEqual([currentPath]);
  expect(linkModels.filter((link) => link.current)).toHaveLength(1);
  expect(linkModels.some((link) => link.disabled || link.ariaDisabled === "true")).toBe(false);
  expect(linkModels.find((link) => link.label === "Lab")).toMatchObject({ ariaLabel: "Lab, future-only destination" });
  expect(linkModels.find((link) => link.label === "Atlas")).toMatchObject({ ariaLabel: "Atlas, future-only destination" });
  expect(linkModels.find((link) => link.label === "Lab")?.text).toContain("Future");
  expect(linkModels.find((link) => link.label === "Atlas")?.text).toContain("Future");
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const tolerance = 2;
    const documentWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    const visibleWideElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main, header, nav, section, aside, .research-shell__header, .research-destination-nav, .future-destination, .corner-panel, .builder-header, .top-status, .timeline-strip"
      )
    )
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.top <= window.innerHeight &&
          (rect.left < -tolerance || rect.right > viewportWidth + tolerance)
        );
      })
      .slice(0, 12)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: element.className.toString(),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          viewportWidth
        };
      });

    return {
      documentOverflow: documentWidth > viewportWidth + tolerance,
      bodyOverflow: bodyWidth > viewportWidth + tolerance,
      documentWidth,
      bodyWidth,
      viewportWidth,
      visibleWideElements
    };
  });

  expect(overflow, "page should not create document-level horizontal overflow or viewport-clipped shell regions").toMatchObject({
    documentOverflow: false,
    bodyOverflow: false,
    visibleWideElements: []
  });
}

async function expectFocusedElementVisible(page: Page) {
  const focusState = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    if (!active || active === document.body) {
      return null;
    }
    const rect = active.getBoundingClientRect();
    const style = window.getComputedStyle(active);
    return {
      tag: active.tagName.toLowerCase(),
      text: active.textContent?.trim().slice(0, 80) ?? "",
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow
    };
  });

  expect(focusState, "keyboard navigation should move focus to a real element").not.toBeNull();
  expect(focusState?.width ?? 0).toBeGreaterThan(0);
  expect(focusState?.height ?? 0).toBeGreaterThan(0);
  expect(focusState?.left ?? -1).toBeGreaterThanOrEqual(-2);
  expect(focusState?.top ?? -1).toBeGreaterThanOrEqual(-2);
  expect(focusState?.right ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((await page.viewportSize())!.width + 2);
  expect(focusState?.outlineStyle !== "none" || focusState?.outlineWidth !== "0px" || focusState?.boxShadow !== "none").toBe(true);
}

async function expectWorldPreserved(page: Page) {
  await expect(page.getByRole("region", { name: "Simulation workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();
  const paused = page.locator(".status-pill", { hasText: "Paused" }).first();
  await expect(paused).toHaveAttribute("data-status-category", "operational");
  await expect(paused).toHaveAttribute("data-state", "paused");
}

async function expectWorldProvenanceLayer(page: Page) {
  const observeTab = page.getByRole("tab", { name: /Observe/i });
  await observeTab.click();

  const panel = page.locator(".active-run-context");
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute("tabindex", "0");
  await expect(panel).not.toHaveAttribute("role", /button|link|tab/);
  await expect(page.getByRole("heading", { name: "Active Run Provenance" })).toBeVisible();
  await expect(page.getByText("This provenance summary describes the active model configuration. It is not a saved experiment record.")).toBeVisible();
  await expect(page.getByText("Observed values describe the model’s current state, not measured real-world data.")).toBeVisible();
  await expect(
    page.getByText("A visual pattern in this run is evidence about this model under this configuration. It is not automatically evidence about the real system.")
  ).toBeVisible();
  await expect(panel.getByText("Epidemic Spread")).toBeVisible();
  await expect(panel.getByText("epidemic-spread")).toBeVisible();
  await expect(panel.getByText("Default run")).toBeVisible();
  await expect(panel.getByText("Not generated in GW2")).toBeVisible();

  const runStatus = panel.locator(".status-pill", { hasText: "Paused" }).first();
  await expect(runStatus).toHaveAttribute("data-status-category", "operational");
  await expect(runStatus).toHaveAttribute("data-state", "paused");
  const evidenceStatus = panel.locator(".status-pill", { hasText: "Model output" }).first();
  await expect(evidenceStatus).toHaveAttribute("data-status-category", "evidence");
  await expect(evidenceStatus).toHaveAttribute("data-state", "unresolved");

  await expect(page.getByRole("region", { name: "Simulation workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();

  await observeTab.focus();
  await expect(observeTab).toBeFocused();
  await expectFocusedElementVisible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tab", { name: /Intervene/i })).toBeFocused();
  await expectFocusedElementVisible(page);
  await page.keyboard.press("Shift+Tab");
  await expect(observeTab).toBeFocused();
  await expectFocusedElementVisible(page);
}

async function expectWorkshopPreserved(page: Page) {
  await expect(page.getByRole("region", { name: "Builder structural shell" })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Workspace Inspector/i })).toBeVisible();
  const badge = page.locator(".builder-status-badge", { hasText: "Not runnable" }).first();
  await expect(badge).toHaveAttribute("data-status-category", "capability");
  await expect(badge).toHaveAttribute("data-state", "non-runnable");
}

async function expectFutureDestinationBoundaries(page: Page, destination: "Lab" | "Atlas") {
  await expect(page.getByRole("heading", { level: 1, name: destination })).toBeVisible();
  const status = page.locator(".status-pill", { hasText: "Future-only" }).first();
  await expect(status).toBeVisible();
  await expect(status).toHaveAttribute("data-status-category", "capability");
  await expect(status).toHaveAttribute("data-state", "future-only");
  await expect(page.locator(".active-run-context")).toHaveCount(0);

  if (destination === "Lab") {
    await expect(page.getByText("Persistent experiments, notebooks, comparison sets, and reusable research assets are not implemented in GW1 or GW2.")).toBeVisible();
    await expect(page.getByText("The Lab route documents destination responsibility. It does not simulate persistence.")).toBeVisible();
    await expect(page.getByText("GW2 exposes live run provenance in World. Persistent Lab records are still not implemented.")).toBeVisible();
  } else {
    await expect(
      page.getByText("Discovery records, behavioral landscapes, sampled-region maps, and evidence-linked model regimes are not implemented in GW1 or GW2.")
    ).toBeVisible();
    await expect(page.getByText("Atlas will map investigated model behavior. It will not certify discoveries about the real world.")).toBeVisible();
    await expect(page.getByText("GW2 does not create Discovery Atlas records. Atlas remains future-only.")).toBeVisible();
  }

  const mainText = await page.getByRole("main").innerText();
  expect(mainText).not.toMatch(
    /saved worlds|saved experiments|recent activity|storage usage|\bxp\b|unlock|achievement|locked|progress percentage|evidence score|locked territory/i
  );
  await expect(page.getByRole("link", { name: "Return to World" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Open Workshop" })).toHaveAttribute("href", "/builder");
}

async function expectAxeClean(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map((node) => node.target.join(" "))
    })),
    "Axe violations"
  ).toEqual([]);
}

function isDataLikeUrl(url: string): boolean {
  return /^(data|blob|about):/i.test(url);
}

for (const destination of destinations) {
  for (const viewport of viewports) {
    test(`${destination.label} shell contract holds at ${viewport.label} ${viewport.width}x${viewport.height}`, async ({ page }) => {
      const diagnostics = observePageDiagnostics(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openDestination(page, destination);
      await expectDestinationNavContract(page, destination.path);
      await expectNoDocumentHorizontalOverflow(page);

      if (destination.path === "/") {
        await expectWorldPreserved(page);
        await expectWorldProvenanceLayer(page);
        await expectNoDocumentHorizontalOverflow(page);
      }
      if (destination.path === "/builder") {
        await expectWorkshopPreserved(page);
      }
      if (destination.path === "/lab" || destination.path === "/atlas") {
        await expectFutureDestinationBoundaries(page, destination.label as "Lab" | "Atlas");
      }

      await page.keyboard.press("Tab");
      await expectFocusedElementVisible(page);
      await page.keyboard.press("Shift+Tab");
      await expectNoDiagnostics(diagnostics);
    });
  }
}

test("skip link and destination links preserve native keyboard route navigation", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await openDestination(page, destinations[0]);

  const skip = page.getByRole("link", { name: "Skip to destination content" });
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expectFocusedElementVisible(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("#research-world-main")).toBeFocused();

  const nav = page.getByRole("navigation", { name: "Research World destinations" });
  await nav.getByRole("link", { name: "Lab, future-only destination" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/lab$/);
  await expectDestinationNavContract(page, "/lab");

  await page.getByRole("link", { name: "Open Workshop" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/builder$/);
  await expectDestinationNavContract(page, "/builder");
  await expectNoDiagnostics(diagnostics);
});

test("legacy destination aliases do not redirect into canonical destinations", async ({ page }) => {
  for (const path of ["/world", "/workshop"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
    expect(new URL(page.url()).pathname, `${path} should not redirect`).toBe(path);
    expect(response?.status(), `${path} should remain an unavailable route rather than an alias`).toBe(404);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Research World destinations" })).toHaveCount(1);
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const destination of destinations) {
    test(`${destination.label} shell remains functional under reduced motion`, async ({ page }) => {
      const diagnostics = observePageDiagnostics(page);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openDestination(page, destination);
      await expectDestinationNavContract(page, destination.path);
      await expect(
        page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches),
        "browser context should expose reduced motion preference"
      ).resolves.toBe(true);
      await page.keyboard.press("Tab");
      await expectFocusedElementVisible(page);
      await expectNoDiagnostics(diagnostics);
    });
  }
});

test.describe("axe accessibility scans", () => {
  for (const destination of destinations) {
    test(`${destination.label} shell has no Axe violations in default rendered state`, async ({ page }) => {
      const diagnostics = observePageDiagnostics(page);
      await page.setViewportSize({ width: 1280, height: 720 });
      await openDestination(page, destination);
      if (destination.path === "/") {
        await expectWorldProvenanceLayer(page);
      }
      await expectAxeClean(page);
      await expectNoDiagnostics(diagnostics);
    });
  }
});
