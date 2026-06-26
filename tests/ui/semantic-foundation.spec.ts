import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "wide-short", width: 1280, height: 720 },
  { label: "tablet", width: 1024, height: 768 },
  { label: "narrow-workbench", width: 900, height: 700 },
  { label: "short-desktop", width: 1280, height: 600 }
] as const;

const routes = [
  {
    label: "simulate",
    path: "/",
    readySelector: ".ortus-shell:not(.ortus-shell--hydrating)",
    landmarkName: "Simulation workspace"
  },
  {
    label: "builder",
    path: "/builder",
    readySelector: "main.builder-shell",
    landmarkName: "Safe visual builder shell"
  }
] as const;

type Route = (typeof routes)[number];

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

async function openRoute(page: Page, route: Route) {
  await page.goto(route.path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
  await expect(page.locator(route.readySelector), `${route.path} should render its route shell`).toBeVisible();
  if (route.path === "/") {
    await expect(page.getByRole("region", { name: route.landmarkName }), `${route.path} should expose its workspace landmark`).toBeVisible();
  } else {
    await expect(page.getByRole("main", { name: route.landmarkName }), `${route.path} should expose its main landmark`).toBeVisible();
  }
}

async function expectNoDiagnostics(diagnostics: PageDiagnostics) {
  expect(diagnostics.pageErrors, "unexpected pageerror events").toEqual([]);
  expect(diagnostics.consoleErrors, "unexpected console errors or hydration mismatch messages").toEqual([]);
  expect(diagnostics.badResponses, "unexpected missing critical assets or failing critical responses").toEqual([]);
  expect(diagnostics.failedRequests, "unexpected failed critical asset requests").toEqual([]);
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const tolerance = 2;
    const documentWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    const visibleWideElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main, header, nav, section, aside, .corner-panel, .status-pill, .builder-status-badge, .timeline-strip, .builder-header"
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

  expect(overflow, "page should not create document-level horizontal overflow or viewport-clipped critical regions").toMatchObject({
    documentOverflow: false,
    bodyOverflow: false,
    visibleWideElements: []
  });
}

async function expectSharedPrimitiveCoverage(page: Page, route: Route) {
  await expect(page.locator(".corner-panel").first(), `${route.path} should render CornerFramePanel`).toBeVisible();
  await expect(page.locator("button").first(), `${route.path} should render button controls`).toBeVisible();
  await expect(page.locator("input, select, textarea").first(), `${route.path} should render form controls`).toBeAttached();

  if (route.path === "/") {
    await expect(page.locator(".status-pill").first(), "simulate route should render StatusPill").toBeVisible();
    await expect(page.locator(".timeline-strip__button span[aria-hidden='true']").first(), "run controls should include icon-bearing controls").toBeVisible();
  } else {
    await expect(page.locator(".builder-status-badge").first(), "builder route should render Builder status badges").toBeVisible();
  }

  const unlabeledIconControls = await page
    .locator(".icon-button, .timeline-strip__button")
    .evaluateAll((buttons) =>
      buttons
        .filter((button) => {
          const rect = button.getBoundingClientRect();
          const style = window.getComputedStyle(button);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
        })
        .filter((button) => !button.getAttribute("aria-label")?.trim() && !button.getAttribute("title")?.trim())
        .map((button) => button.textContent?.trim() ?? button.className.toString())
    );
  expect(unlabeledIconControls, "icon controls must expose accessible names").toEqual([]);
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
      ariaLabel: active.getAttribute("aria-label") ?? "",
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
  expect(focusState?.width ?? 0, "focused element should have a visible width").toBeGreaterThan(0);
  expect(focusState?.height ?? 0, "focused element should have a visible height").toBeGreaterThan(0);
  expect(focusState?.left ?? -1, "focused element should not be clipped off the left edge").toBeGreaterThanOrEqual(-2);
  expect(focusState?.top ?? -1, "focused element should not be clipped off the top edge").toBeGreaterThanOrEqual(-2);
  expect(focusState?.right ?? Number.POSITIVE_INFINITY, "focused element should not be clipped off the right edge").toBeLessThanOrEqual(
    (await page.viewportSize())!.width + 2
  );
  expect(
    focusState?.outlineStyle !== "none" || focusState?.outlineWidth !== "0px" || focusState?.boxShadow !== "none",
    "focused element should retain a visible focus treatment"
  ).toBe(true);
}

async function runKeyboardSmoke(page: Page, route: Route) {
  if (route.path === "/") {
    await page.getByRole("tab", { name: /Setup/i }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Understand/i })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: /Setup/i })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /Understand/i }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("tab", { name: /Understand/i })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /Setup/i }).focus();
    await page.keyboard.press(" ");
    await expect(page.getByRole("tab", { name: /Setup/i })).toHaveAttribute("aria-selected", "true");
  } else {
    await page.getByRole("tab", { name: /Workspace Inspector/i }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Author Schema/i })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: /Workspace Inspector/i })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /Author Schema/i }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("tab", { name: /Author Schema/i })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /Workspace Inspector/i }).focus();
    await page.keyboard.press(" ");
    await expect(page.getByRole("tab", { name: /Workspace Inspector/i })).toHaveAttribute("aria-selected", "true");
  }

  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  await expectFocusedElementVisible(page);
  await page.keyboard.press("Shift+Tab");
}

async function expectNoValidatedOperationalStatuses(page: Page) {
  const validatedStatuses = await page
    .locator(".status-pill, .builder-status-badge")
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .map((element) => element.textContent?.trim() ?? "")
        .filter((text) => /\bvalidated\b/i.test(text))
    );
  expect(validatedStatuses, "operational completion must not be labeled Validated").toEqual([]);
}

async function expectRenderedStatusAttributes(page: Page) {
  const statuses = await page.locator(".status-pill, .builder-status-badge").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .map((element) => ({
        label: element.textContent?.trim() ?? "",
        category: element.getAttribute("data-status-category") ?? "",
        state: element.getAttribute("data-state") ?? "",
        ariaLabel: element.getAttribute("aria-label") ?? ""
      }))
  );

  expect(statuses.length, "routes should expose rendered status semantics").toBeGreaterThan(0);
  expect(statuses.filter((status) => !status.label || !status.category || !status.state || !status.ariaLabel)).toEqual([]);
}

async function expectBuilderBadgeSemantics(page: Page) {
  const expectedBadges: Record<string, { category: string; state: string }> = {
    "Structural only": { category: "capability", state: "planning-only" },
    "Not runnable": { category: "capability", state: "non-runnable" },
    "No compiler": { category: "capability", state: "unsupported" },
    "No schema execution": { category: "capability", state: "unsupported" },
    "No template generation": { category: "capability", state: "unsupported" },
    "No scenario generation": { category: "capability", state: "unsupported" },
    "No RunConfig generation": { category: "capability", state: "unsupported" }
  };

  for (const [label, expected] of Object.entries(expectedBadges)) {
    const badge = page.locator(".builder-status-badge", { hasText: label }).first();
    await expect(badge, `${label} badge should render`).toBeVisible();
    await expect(badge, `${label} should expose the expected status category`).toHaveAttribute("data-status-category", expected.category);
    await expect(badge, `${label} should expose the expected status state`).toHaveAttribute("data-state", expected.state);
  }
}

async function expectSimulationRunStatusSemantics(page: Page) {
  const paused = page.locator(".status-pill", { hasText: "Paused" }).first();
  await expect(paused).toHaveAttribute("data-status-category", "operational");
  await expect(paused).toHaveAttribute("data-state", "paused");

  await page.getByRole("button", { name: "Run simulation" }).click();
  const running = page.locator(".status-pill", { hasText: "Running" }).first();
  await expect(running).toHaveAttribute("data-status-category", "operational");
  await expect(running).toHaveAttribute("data-state", "running");
  await page.getByRole("button", { name: "Pause simulation" }).click();
}

async function expectRenderedStatusPairDistinctions(page: Page) {
  const pairResults = await page.evaluate(() => {
    const pairs = [
      ["selected", "supported"],
      ["completed", "supported"],
      ["stale", "unsupported"],
      ["planning-only", "future-only"],
      ["contradicted", "failed"],
      ["unresolved", "disabled"],
      ["runnable", "supported"]
    ] as const;
    const categories: Record<string, string> = {
      selected: "interaction",
      completed: "operational",
      failed: "operational",
      disabled: "operational",
      runnable: "capability",
      supported: "evidence",
      stale: "evidence",
      unsupported: "evidence",
      "planning-only": "evidence",
      "future-only": "evidence",
      contradicted: "evidence",
      unresolved: "evidence"
    };
    const host = document.createElement("div");
    host.setAttribute("data-playwright-status-fixture", "true");
    host.style.cssText = "position: absolute; left: 0; top: 0; z-index: -1; display: flex; gap: 4px;";
    document.body.append(host);

    const signatureFor = (state: string) => {
      const element = document.createElement("span");
      element.className = "status-pill";
      element.dataset.statusCategory = categories[state] ?? "evidence";
      element.dataset.state = state;
      element.textContent = state;
      host.append(element);
      const style = window.getComputedStyle(element);
      return {
        state,
        category: element.dataset.statusCategory,
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor
      };
    };

    const result = pairs.map(([left, right]) => {
      const leftSignature = signatureFor(left);
      const rightSignature = signatureFor(right);
      return {
        left,
        right,
        leftSignature,
        rightSignature,
        distinct:
          leftSignature.category !== rightSignature.category ||
          leftSignature.backgroundColor !== rightSignature.backgroundColor ||
          leftSignature.color !== rightSignature.color ||
          leftSignature.borderColor !== rightSignature.borderColor
      };
    });

    host.remove();
    return result;
  });

  expect(
    pairResults.filter((pair) => !pair.distinct),
    "required status pairs should remain semantically or visually distinct when rendered"
  ).toEqual([]);
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

for (const route of routes) {
  for (const viewport of viewports) {
    test(`${route.label} loads without console, hydration, asset, or overflow failures at ${viewport.label} ${viewport.width}x${viewport.height}`, async ({
      page
    }) => {
      const diagnostics = observePageDiagnostics(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openRoute(page, route);
      await expectSharedPrimitiveCoverage(page, route);
      await expectRenderedStatusAttributes(page);
      await expectNoValidatedOperationalStatuses(page);
      await expectNoDocumentHorizontalOverflow(page);
      await runKeyboardSmoke(page, route);

      if (route.path === "/") {
        await expectSimulationRunStatusSemantics(page);
      } else {
        await expectBuilderBadgeSemantics(page);
      }

      await expectNoDiagnostics(diagnostics);
    });
  }
}

test("rendered status styles keep UX2 semantic distinctions separate", async ({ page }) => {
  const diagnostics = observePageDiagnostics(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await openRoute(page, routes[1]);
  await expectRenderedStatusPairDistinctions(page);
  await expectNoDiagnostics(diagnostics);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const route of routes) {
    test(`${route.label} honors reduced-motion context while preserving visible route state`, async ({ page }) => {
      const diagnostics = observePageDiagnostics(page);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openRoute(page, route);
      await expect(page.locator(route.readySelector)).toBeVisible();
      await expect(
        page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches),
        "browser context should expose reduced motion preference"
      ).resolves.toBe(true);
      await expectNoDiagnostics(diagnostics);
    });
  }
});

test.describe("axe accessibility scans", () => {
  test("simulate route has no Axe violations in default rendered state", async ({ page }) => {
    const diagnostics = observePageDiagnostics(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await openRoute(page, routes[0]);
    await expectAxeClean(page);
    await expectNoDiagnostics(diagnostics);
  });

  test("builder route has no Axe violations in workspace inspector and authoring states", async ({ page }) => {
    const diagnostics = observePageDiagnostics(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await openRoute(page, routes[1]);
    await expectAxeClean(page);
    await page.getByRole("tab", { name: /Author Schema/i }).click();
    await expect(page.getByRole("tab", { name: /Author Schema/i })).toHaveAttribute("aria-selected", "true");
    await expectAxeClean(page);
    await expectNoDiagnostics(diagnostics);
  });
});
