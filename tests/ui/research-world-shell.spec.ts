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
  expect(linkModels.find((link) => link.label === "Lab")).toMatchObject({ ariaLabel: "Lab" });
  expect(linkModels.find((link) => link.label === "Atlas")).toMatchObject({ ariaLabel: "Atlas" });
  expect(linkModels.find((link) => link.label === "Lab")?.text).not.toContain("Future");
  expect(linkModels.find((link) => link.label === "Atlas")?.text).not.toContain("Future");
}

async function expectCapabilityGuidance(page: Page, destination: (typeof destinations)[number]) {
  const destinationId =
    destination.path === "/"
      ? "world"
      : destination.path === "/builder"
        ? "workshop"
        : destination.path === "/lab"
          ? "lab"
          : "atlas";
  const guidance = page.locator(`[data-capability-guidance-destination="${destinationId}"]`);
  await expect(guidance).toHaveCount(1);
  await expect(guidance).toBeVisible();
  await expect(guidance).toHaveAttribute("data-capability-guidance-route", destination.path);
  await expect(guidance.getByRole("heading", { name: "Capability Guidance" })).toHaveCount(1);
  await expect(guidance.getByText("Guidance describes current ORTUS capabilities. It does not create saved records, validation, discoveries, or persistence.")).toBeVisible();
  await expect(guidance.getByText("Capability guidance describes current product capability. It does not create capability.")).toBeVisible();
  await expect(guidance.getByRole("heading", { name: "Available here" })).toBeVisible();
  await expect(guidance.getByRole("heading", { name: "Planning-only" })).toBeVisible();
  await expect(guidance.getByRole("heading", { name: "Not implemented" })).toBeVisible();
  await expect(guidance.getByRole("heading", { name: "Do not assume" })).toBeVisible();
  await expect(guidance.getByRole("heading", { name: "Related destination" })).toBeVisible();

  const availableStatus = guidance.locator(".status-pill", { hasText: "Available here" }).first();
  await expect(availableStatus).toHaveAttribute("data-status-category", "capability");
  await expect(availableStatus).toHaveAttribute("data-state", "supported");
  const planningStatus = guidance.locator(".status-pill", { hasText: "Planning-only" }).first();
  await expect(planningStatus).toHaveAttribute("data-status-category", "capability");
  await expect(planningStatus).toHaveAttribute("data-state", "planning-only");
  const notImplementedStatus = guidance.locator(".status-pill", { hasText: "Not implemented" }).first();
  await expect(notImplementedStatus).toHaveAttribute("data-status-category", "capability");
  await expect(notImplementedStatus).toHaveAttribute("data-state", "future-only");
  await expect(guidance.locator(".status-pill[data-status-category='operational']")).toHaveCount(0);
  await expect(guidance.locator(".status-pill[data-status-category='interaction']")).toHaveCount(0);

  const routeSpecificCopy =
    destinationId === "world"
      ? "World hosts the active simulation surface, run controls, snapshots, metrics, and template-defined command paths for the current local run."
      : destinationId === "workshop"
        ? "Workshop supports structural schema authoring, validation assistance, graph inspection, fit reports, and scenario planning as planning surfaces."
        : destinationId === "lab"
          ? "Lab exposes non-persistent lifecycle semantics, model-only evidence boundaries, and a conceptual experiment-ledger scaffold."
          : "Atlas exposes non-persistent evidence states, sampled/unsampled interpretation, behavioral-landscape vocabulary, and conceptual scaffolds for investigated model behavior.";
  const routeCopy = guidance.getByText(routeSpecificCopy);
  await routeCopy.scrollIntoViewIfNeeded();
  await expect(routeCopy).toBeVisible();

  const tabStops = await guidance.evaluate((element) =>
    Array.from(
      element.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((candidate) => {
      const style = window.getComputedStyle(candidate);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length
  );
  expect(tabStops, "capability guidance should not add route-local fake controls or static Tab stops").toBe(0);

  const guidanceText = await guidance.innerText();
  expect(guidanceText).not.toMatch(
    /Recommended for you|Next mission|Unlocked|Progress|Complete this step|AI suggestion|Smart recommendation|Personalized/i
  );
  expect(guidanceText).not.toMatch(
    /Save this run|Send to Lab|Create evidence record|Record experiment|Publish to Atlas|Create discovery|Map this run|Save to Atlas|Save discovery|evidence score|coverage percentage|confidence score/i
  );
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const tolerance = 2;
    const documentWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    const visibleWideElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main, header, nav, section, aside, .research-shell__header, .research-destination-nav, .future-destination, .atlas-foundation, .behavioral-landscape-foundation, .landscape-probe-planning-foundation, .lab-foundation, .corner-panel, .builder-header, .top-status, .timeline-strip"
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
  await expect(page.getByRole("main")).not.toContainText(/Map this run|Save to Atlas|Create discovery|Save discovery/i);
  await expect(page.getByRole("main")).not.toContainText(/Save this run|Send to Lab|Create evidence record|Record experiment/i);
  await expect(page.getByRole("main")).not.toContainText(
    /Run probe|Run sweep|Map this run|Save landscape|Save map|Save probe|Create landscape|Generate landscape|probe action/i
  );
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

async function expectWorldInterventionReadinessLayer(page: Page) {
  const interveneTab = page.getByRole("tab", { name: /Intervene/i });
  await interveneTab.click();

  const interventionRegion = page.getByRole("region", { name: "Intervention Readiness" });
  const readinessSection = page.locator(".intervention-readiness");
  await expect(interventionRegion).toBeVisible();
  await expect(readinessSection).toHaveCount(1);
  await expect(readinessSection).not.toHaveAttribute("tabindex", "0");
  await expect(readinessSection).not.toHaveAttribute("role", /button|link|tab/);
  await expect(interventionRegion.getByRole("heading", { name: "Intervention Readiness" })).toBeVisible();
  await expect(
    interventionRegion.getByText(
      "Intervention readiness describes available model perturbation controls. It is not a saved intervention plan or experiment record."
    )
  ).toBeVisible();
  await expect(
    interventionRegion.getByText(
      "Intervention in ORTUS means changing or inspecting model conditions. It does not certify real-world causal power, policy effectiveness, or empirical truth."
    )
  ).toBeVisible();
  await expect(
    interventionRegion.getByText(
      "A response to an intervention is evidence about this model under this configuration. It is not automatic proof that the same intervention would work in the real system."
    )
  ).toBeVisible();
  await expect(interventionRegion.getByText("No saved intervention plan, experiment record, notebook entry, or reusable Lab asset is created by this panel.")).toBeVisible();
  await expect(interventionRegion.getByText("Persistent Lab intervention records are still not implemented.")).toBeVisible();
  await expect(interventionRegion.getByText("Discovery Atlas records are not created from intervention responses.")).toBeVisible();

  const availabilityStatus = interventionRegion.getByLabel(/Controls available:/);
  await expect(availabilityStatus).toHaveAttribute("data-status-category", "capability");
  await expect(availabilityStatus).toHaveAttribute("data-state", "supported");
  const evidenceStatus = interventionRegion.getByLabel(/Model response:/);
  await expect(evidenceStatus).toHaveAttribute("data-status-category", "evidence");
  await expect(evidenceStatus).toHaveAttribute("data-state", "unresolved");

  await expect(page.getByRole("combobox", { name: "Intervention type" })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Radius intervention value" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Apply Infect Radius|Apply Infect Selected Agent/ })).toBeVisible();
  await expect(page.getByText("Current run intervention entries")).toBeVisible();
  await expect(page.getByText("No interventions applied in the current run yet.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear entries" })).toBeDisabled();
  await expect(page.getByRole("region", { name: "Simulation workspace" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Simulation world. Agents are rendered from the latest engine snapshot." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();

  await interveneTab.focus();
  await expect(interveneTab).toBeFocused();
  await expectFocusedElementVisible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tab", { name: /Experiment/i })).toBeFocused();
  await expectFocusedElementVisible(page);
  await page.keyboard.press("Shift+Tab");
  await expect(interveneTab).toBeFocused();
  await expectFocusedElementVisible(page);
}

async function expectWorkshopPreserved(page: Page) {
  await expect(page.getByRole("region", { name: "Builder structural shell" })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Workspace Inspector/i })).toBeVisible();
  const badge = page.locator(".builder-status-badge", { hasText: "Not runnable" }).first();
  await expect(badge).toHaveAttribute("data-status-category", "capability");
  await expect(badge).toHaveAttribute("data-state", "non-runnable");
  await expect(page.getByRole("main")).not.toContainText(/Run probe|Generate probe|Probe generation|Landscape probe/i);
}

async function expectLabFoundation(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: "Lab" })).toBeVisible();
  await expect(page.locator(".active-run-context")).toHaveCount(0);
  await expect(page.locator(".intervention-readiness")).toHaveCount(0);

  const foundationStatus = page.getByLabel(/GW5 foundation:/);
  await expect(foundationStatus).toBeVisible();
  await expect(foundationStatus).toHaveAttribute("data-status-category", "capability");
  await expect(foundationStatus).toHaveAttribute("data-state", "planning-only");

  await expect(page.getByText("Lab is a non-persistent foundation in GW5.")).toBeVisible();
  await expect(
    page.getByText(
      "Persistent evidence records, experiment ledgers, notebooks, saved comparisons, and run history are not implemented yet."
    )
  ).toBeVisible();
  await expect(page.getByText("Lab records will organize evidence about model investigations. They will not certify discoveries about the real world.").first()).toBeVisible();
  await expect(page.getByText("Nothing on this Lab route is a saved experiment, saved evidence record, or persistent run history.")).toBeVisible();
  await expect(page.getByText("Conceptual scaffold - not saved Lab data.")).toBeVisible();
  await expect(
    page.getByText(
      "World currently exposes live provenance, observation, and intervention readiness. GW5 Lab does not save those runs or convert them into evidence records."
    )
  ).toBeVisible();
  await expect(
    page.getByText("Atlas currently defines non-persistent evidence-state semantics. GW5 Lab does not publish records to Atlas or create discoveries.")
  ).toBeVisible();

  const draft = page.getByLabel(/Draft schema:/).first();
  await expect(draft).toHaveAttribute("data-status-category", "capability");
  await expect(draft).toHaveAttribute("data-state", "future-only");
  const modelOnly = page.getByLabel(/Model-only:/).first();
  await expect(modelOnly).toHaveAttribute("data-status-category", "evidence");
  await expect(modelOnly).toHaveAttribute("data-state", "unresolved");
  const externallyUnvalidated = page.getByLabel(/Externally unvalidated:/).first();
  await expect(externallyUnvalidated).toHaveAttribute("data-status-category", "evidence");
  await expect(externallyUnvalidated).toHaveAttribute("data-state", "unverified");
  const comparisonNotImplemented = page.getByLabel(/Comparison not implemented:/).first();
  await expect(comparisonNotImplemented).toHaveAttribute("data-status-category", "capability");
  await expect(comparisonNotImplemented).toHaveAttribute("data-state", "future-only");
  const notebookNotImplemented = page.getByLabel(/Notebook not implemented:/).first();
  await expect(notebookNotImplemented).toHaveAttribute("data-status-category", "capability");
  await expect(notebookNotImplemented).toHaveAttribute("data-state", "future-only");

  const mainText = await page.getByRole("main").innerText();
  expect(mainText).not.toMatch(
    /Save this run|Send to Lab|Create evidence record|Record experiment|Open notebook|Publish to Atlas|Create discovery|Map evidence|recent activity|\bxp\b|achievement|rank|streak|evidence score|coverage percentage|confidence score|experiment complete|Experiment #|Run #|Notebook entry #|saved landscape record|landscape ledger|run history notebook|probe record|landscape record|saved probe plan|probe ledger/i
  );
  await expect(page.getByRole("link", { name: "Return to World" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Open Workshop" })).toHaveAttribute("href", "/builder");
  await expect(page.getByRole("link", { name: "Open Atlas" })).toHaveAttribute("href", "/atlas");
}

async function expectAtlasFoundation(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: "Atlas" })).toBeVisible();
  await expect(page.locator(".active-run-context")).toHaveCount(0);
  await expect(page.locator(".intervention-readiness")).toHaveCount(0);

  const foundationStatus = page.getByLabel(/GW4 foundation:/);
  await expect(foundationStatus).toBeVisible();
  await expect(foundationStatus).toHaveAttribute("data-status-category", "capability");
  await expect(foundationStatus).toHaveAttribute("data-state", "planning-only");

  await expect(page.getByText("Atlas is a non-persistent foundation in GW4.")).toBeVisible();
  await expect(
    page.getByText("Discovery records, saved behavioral landscape maps, sampled-region maps, and evidence-linked model regimes are not implemented yet.")
  ).toBeVisible();
  await expect(page.getByText("Atlas will organize evidence about model behavior. It will not certify discoveries about the real world.")).toBeVisible();
  await expect(page.getByText("Nothing on this Atlas route is a saved discovery, saved evidence record, or persistent map.")).toBeVisible();
  await expect(page.getByText("Conceptual scaffold - not run data.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atlas Boundaries" })).toBeVisible();
  await expect(
    page.getByText("World currently exposes live provenance, observation, and intervention readiness. GW4 Atlas does not save those runs or convert them into discoveries.")
  ).toBeVisible();
  await expect(
    page.getByText(
      "GW5 Lab defines non-persistent evidence-record semantics. Persistent Lab evidence records and Lab-to-Atlas publication are still not implemented."
    )
  ).toBeVisible();

  const unsampled = page.getByLabel(/Unsampled:/).first();
  await expect(unsampled).toHaveAttribute("data-status-category", "evidence");
  await expect(unsampled).toHaveAttribute("data-state", "unresolved");
  const sampled = page.getByLabel(/Sampled:/).first();
  await expect(sampled).toHaveAttribute("data-status-category", "evidence");
  await expect(sampled).toHaveAttribute("data-state", "unresolved");
  await expect(page.getByText("Sampled is a future model-space evidence concept in GW4, not current data or real-world validation.")).toBeVisible();
  const supported = page.getByLabel(/Supported within model:/).first();
  await expect(supported).toHaveAttribute("data-status-category", "evidence");
  await expect(supported).toHaveAttribute("data-state", "supported");
  const contradicted = page.getByLabel(/Contradicted within model:/).first();
  await expect(contradicted).toHaveAttribute("data-status-category", "evidence");
  await expect(contradicted).toHaveAttribute("data-state", "contradicted");
  const unsupported = page.getByLabel(/Unsupported:/).first();
  await expect(unsupported).toHaveAttribute("data-status-category", "evidence");
  await expect(unsupported).toHaveAttribute("data-state", "unsupported");
  const futureOnly = page.getByLabel(/Future-only:/).first();
  await expect(futureOnly).toHaveAttribute("data-status-category", "capability");
  await expect(futureOnly).toHaveAttribute("data-state", "future-only");

  const landscape = page.locator("[data-behavioral-landscape-foundation='conceptual']");
  await expect(landscape).toBeVisible();
  await expect(landscape.getByRole("heading", { name: "Behavioral Landscape Foundation" })).toBeVisible();
  await expect(landscape.getByText("Conceptual scaffold - not sampled run data.")).toBeVisible();
  await expect(
    landscape.getByText(
      "A behavioral landscape describes how model behavior may vary across model conditions. It is not a real-world map, empirical proof, or Discovery Atlas record."
    )
  ).toBeVisible();
  await expect(
    landscape.getByText(
      "GW7 creates behavioral-landscape vocabulary and non-persistent exploration scaffolding. It does not create saved landscapes, sampled-region maps, evidence records, Atlas discoveries, Lab experiments, regime detection, or real-world validation."
    ).first()
  ).toBeVisible();
  await expect(
    landscape.getByText(
      "Behavioral landscapes are not implemented as saved Atlas maps in GW7. This section describes the vocabulary and boundaries for future model-space exploration."
    )
  ).toBeVisible();
  await expect(
    landscape.getByText(
      "A landscape region can describe model behavior only after source-backed sampling. It does not certify real-world regimes or policy effects."
    )
  ).toBeVisible();
  await expect(landscape.getByText("Sampled in model space is not empirically validated.")).toBeVisible();
  await expect(landscape.getByText("Model regime is not a real-world law.")).toBeVisible();
  await expect(landscape.getByText("A model regime is not a real-world law or policy effect.")).toBeVisible();
  await expect(landscape.getByText("Transition zone is not a proven tipping point.")).toBeVisible();
  await expect(landscape.getByText("A transition zone is not a proven real-world tipping point.")).toBeVisible();
  await expect(landscape.getByText("Sensitivity is not causal certainty.").first()).toBeVisible();
  await expect(landscape.getByText("Sampling in model space would still not validate real-world claims.")).toBeVisible();
  await expect(landscape.getByText("Future-only is not locked progression and not current evidence support.")).toBeVisible();
  await expect(
    landscape.getByText("World is where live model behavior is observed. GW7 does not turn World runs into sampled landscape data.")
  ).toBeVisible();
  await expect(
    landscape.getByText("Lab describes how future evidence records could be organized. GW7 does not create landscape records or experiment ledgers.")
  ).toBeVisible();

  const landscapeStatus = landscape.getByLabel(/GW7 foundation:/);
  await expect(landscapeStatus).toHaveAttribute("data-status-category", "capability");
  await expect(landscapeStatus).toHaveAttribute("data-state", "planning-only");
  const parameterAxis = landscape.getByLabel(/Parameter axis:/).first();
  await expect(parameterAxis).toHaveAttribute("data-status-category", "capability");
  await expect(parameterAxis).toHaveAttribute("data-state", "planning-only");
  const futureLandscape = landscape.getByLabel(/Future sampled landscape:/).first();
  await expect(futureLandscape).toHaveAttribute("data-status-category", "capability");
  await expect(futureLandscape).toHaveAttribute("data-state", "future-only");
  const externallyUnvalidatedArea = landscape.getByLabel(/Externally unvalidated area:/).first();
  await expect(externallyUnvalidatedArea).toHaveAttribute("data-status-category", "evidence");
  await expect(externallyUnvalidatedArea).toHaveAttribute("data-state", "unresolved");
  const landscapeSupported = landscape.getByLabel(/Supported within model:/).first();
  await expect(landscapeSupported).toHaveAttribute("data-status-category", "evidence");
  await expect(landscapeSupported).toHaveAttribute("data-state", "supported");
  const landscapeContradicted = landscape.getByLabel(/Contradicted within model:/).first();
  await expect(landscapeContradicted).toHaveAttribute("data-status-category", "evidence");
  await expect(landscapeContradicted).toHaveAttribute("data-state", "contradicted");
  await expect(landscape.locator(".status-pill[data-status-category='operational']")).toHaveCount(0);
  await expect(landscape.locator(".status-pill[data-status-category='interaction']")).toHaveCount(0);

  const landscapeTabStops = await landscape.evaluate((element) =>
    Array.from(
      element.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((candidate) => {
      const style = window.getComputedStyle(candidate);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length
  );
  expect(landscapeTabStops, "behavioral landscape scaffold should remain static readable content with no fake controls").toBe(0);

  const probePlanning = page.locator("[data-landscape-probe-planning-foundation='conceptual']");
  await expect(probePlanning).toBeVisible();
  await expect(probePlanning.getByRole("heading", { level: 2, name: "Landscape Probe Planning" })).toBeVisible();
  await expect(probePlanning.getByText("Conceptual probe plan - not executable and not saved.")).toBeVisible();
  await expect(
    probePlanning.getByText(
      "A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery."
    )
  ).toBeVisible();
  await expect(
    probePlanning.getByText(
      "GW8 creates non-persistent landscape probe planning semantics. It does not execute probes, run parameter sweeps, generate samples, save plans, create Lab records, create Atlas discoveries, detect regimes, or validate real-world claims."
    ).first()
  ).toBeVisible();
  await expect(
    probePlanning.getByText(
      "This scaffold has no selected parameter values, no samples, no run queue, no saved plan, no probe result, and no detected regime."
    )
  ).toBeVisible();
  await expect(probePlanning.getByText("Probe plan is not an executed probe.")).toBeVisible();
  await expect(probePlanning.getByText("Candidate axis is not a sampled parameter.")).toBeVisible();
  await expect(probePlanning.getByText("Candidate range is not an explored range.")).toBeVisible();
  await expect(probePlanning.getByText("Planned outcome is not observed evidence.")).toBeVisible();
  await expect(probePlanning.getByText("Sampling intent is not a sampling result.")).toBeVisible();
  await expect(probePlanning.getByText("Planned comparison is not a comparison result.")).toBeVisible();
  await expect(probePlanning.getByText("Model hypothesis is not a real-world claim.")).toBeVisible();
  await expect(probePlanning.getByText("Planning scaffold is not a run queue.")).toBeVisible();
  await expect(probePlanning.getByText("Future-only is not locked progression.")).toBeVisible();
  await expect(
    probePlanning.getByText("World is where live model behavior is observed. GW8 does not execute landscape probes or turn World runs into planned samples.")
  ).toBeVisible();
  await expect(
    probePlanning.getByText("Lab describes how future evidence records could be organized. GW8 does not create probe records, experiment ledgers, notebooks, or run history.")
  ).toBeVisible();
  await expect(
    probePlanning.getByText(
      "Landscape probe planning is non-executable in GW8. No probe plans are saved, no samples are generated, and no landscape regions are promoted to evidence."
    )
  ).toBeVisible();
  await expect(
    probePlanning.getByText(
      "A planned probe can frame a future model-space investigation. It does not show that sampled behavior exists, that a regime has been detected, or that any real-world claim is supported."
    )
  ).toBeVisible();

  const probeStatus = probePlanning.getByLabel(/GW8 foundation:/);
  await expect(probeStatus).toHaveAttribute("data-status-category", "capability");
  await expect(probeStatus).toHaveAttribute("data-state", "planning-only");
  const candidateAxis = probePlanning.getByLabel(/Candidate parameter axis:/).first();
  await expect(candidateAxis).toHaveAttribute("data-status-category", "capability");
  await expect(candidateAxis).toHaveAttribute("data-state", "future-only");
  const candidateOutcome = probePlanning.getByLabel(/Candidate outcome measure:/).first();
  await expect(candidateOutcome).toHaveAttribute("data-status-category", "capability");
  await expect(candidateOutcome).toHaveAttribute("data-state", "future-only");
  const unresolvedFeasibility = probePlanning.getByLabel(/Unresolved feasibility:/).first();
  await expect(unresolvedFeasibility).toHaveAttribute("data-status-category", "evidence");
  await expect(unresolvedFeasibility).toHaveAttribute("data-state", "unresolved");
  const externallyUnvalidatedHypothesis = probePlanning.getByLabel(/Externally unvalidated hypothesis:/).first();
  await expect(externallyUnvalidatedHypothesis).toHaveAttribute("data-status-category", "evidence");
  await expect(externallyUnvalidatedHypothesis).toHaveAttribute("data-state", "unresolved");
  const nonExecutablePlan = probePlanning.getByLabel(/Non-executable plan:/).first();
  await expect(nonExecutablePlan).toHaveAttribute("data-status-category", "capability");
  await expect(nonExecutablePlan).toHaveAttribute("data-state", "future-only");
  await expect(probePlanning.locator(".status-pill[data-status-category='operational']")).toHaveCount(0);
  await expect(probePlanning.locator(".status-pill[data-status-category='interaction']")).toHaveCount(0);

  const probePlanningTabStops = await probePlanning.evaluate((element) =>
    Array.from(
      element.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((candidate) => {
      const style = window.getComputedStyle(candidate);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length
  );
  expect(probePlanningTabStops, "landscape probe planning scaffold should remain static readable content with no fake controls").toBe(0);

  const mainText = await page.getByRole("main").innerText();
  expect(mainText).not.toMatch(
    /Map this run|Save to Atlas|Create discovery|Save discovery|Publish finding|Save probe now|Save probe plan|Run probe now|Run sweep now|Run sweep control|Ready to execute|Probe complete|discovery unlocked|recent activity|\bxp\b|achievement|rank|streak|Evidence score \d|Coverage percentage \d|regime confidence|batch simulation job|confidence value|fake heatmap|fake contour|fake cluster|sampled region record|Sampled result #|Saved plan #/i
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

async function expectSandboxVisualLanguageFoundation(page: Page, destination: (typeof destinations)[number]) {
  const visualContract = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const readStyle = (selector: string, pseudo?: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) {
        return null;
      }
      const style = getComputedStyle(element, pseudo);
      return {
        borderLeftWidth: style.borderLeftWidth,
        borderRadius: style.borderRadius,
        clipPath: style.clipPath,
        content: style.content,
        textTransform: style.textTransform
      };
    };

    return {
      tokens: {
        workbench: rootStyle.getPropertyValue("--surface-workbench").trim(),
        instrument: rootStyle.getPropertyValue("--surface-instrument").trim(),
        caveat: rootStyle.getPropertyValue("--surface-caveat").trim(),
        panelRadius: rootStyle.getPropertyValue("--radius-panel").trim()
      },
      navLink: readStyle(".research-destination-nav__link"),
      statusPill: readStyle(".status-pill, .builder-status-badge"),
      cornerPanel: readStyle(".corner-panel"),
      capabilityGroup: readStyle(".capability-guidance__group"),
      worldStage: readStyle(".world-stage"),
      worldStageLabel: readStyle(".world-stage", "::before"),
      timeline: readStyle(".timeline-strip"),
      builderModeButton: readStyle(".builder-mode-tabs button"),
      labNote: readStyle(".lab-record-legend li, .lab-ledger-scaffold li, .lab-boundary-card"),
      atlasNote: readStyle(".atlas-evidence-legend li, .atlas-map-scaffold li, .atlas-boundary-card")
    };
  });

  expect(visualContract.tokens, "UX4 workbench semantic tokens should be available").toEqual({
    workbench: expect.stringMatching(/\S/),
    instrument: expect.stringMatching(/\S/),
    caveat: expect.stringMatching(/\S/),
    panelRadius: expect.stringMatching(/\S/)
  });
  expect(visualContract.navLink?.borderRadius, "destination nav should render as workbench navigation, not hard-edged HUD controls").not.toBe("0px");
  expect(visualContract.statusPill?.textTransform, "status pills should keep visible labels without shouting").toBe("none");
  expect(visualContract.statusPill?.borderRadius, "status pills should be secondary chips, not command panels").not.toBe("0px");
  expect(visualContract.cornerPanel?.borderRadius, "CornerFramePanel should keep the shared panel primitive but soften the frame").not.toBe("0px");
  expect(visualContract.capabilityGroup?.borderRadius, "capability caveat groups should have inspectable workbench grouping").not.toBe("0px");

  if (destination.path === "/") {
    expect(visualContract.worldStage?.borderRadius, "World remains the primary rounded model surface").not.toBe("0px");
    expect(visualContract.worldStage?.clipPath, "World surface should not use a tactical clipped viewport shape").toBe("none");
    expect(visualContract.worldStageLabel?.content, "World surface label should identify the model surface").toContain("MODEL SURFACE");
    expect(visualContract.timeline?.borderRadius, "persistent run controls should read as instruments").not.toBe("0px");
  }

  if (destination.path === "/builder") {
    expect(visualContract.builderModeButton?.borderRadius, "Workshop mode tabs should read as bench tools").not.toBe("0px");
  }

  if (destination.path === "/lab") {
    expect(visualContract.labNote?.borderRadius, "Lab scaffold items should read as notebook-like structural notes").not.toBe("0px");
    expect(parseFloat(visualContract.labNote?.borderLeftWidth ?? "0"), "Lab scaffold items should keep a non-color grouping cue").toBeGreaterThanOrEqual(3);
  }

  if (destination.path === "/atlas") {
    expect(visualContract.atlasNote?.borderRadius, "Atlas scaffold items should read as model-space orientation notes").not.toBe("0px");
    expect(parseFloat(visualContract.atlasNote?.borderLeftWidth ?? "0"), "Atlas scaffold items should keep a non-color grouping cue").toBeGreaterThanOrEqual(3);
  }
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
      await expectCapabilityGuidance(page, destination);
      await expectNoDocumentHorizontalOverflow(page);
      await expectSandboxVisualLanguageFoundation(page, destination);

      if (destination.path === "/") {
        await expectWorldPreserved(page);
        await expectWorldProvenanceLayer(page);
        await expectWorldInterventionReadinessLayer(page);
        await expectNoDocumentHorizontalOverflow(page);
      }
      if (destination.path === "/builder") {
        await expectWorkshopPreserved(page);
      }
      if (destination.path === "/lab") {
        await expectLabFoundation(page);
      }
      if (destination.path === "/atlas") {
        await expectAtlasFoundation(page);
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
  await nav.getByRole("link", { name: "Lab" }).focus();
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
        await expectWorldInterventionReadinessLayer(page);
      }
      await expectAxeClean(page);
      await expectNoDiagnostics(diagnostics);
    });
  }
});
