import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("normal Workshop presents an assembled immutable system and Remix changes its selected piece", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openWorkbench(page, "/builder");
  const bench = page.locator("[data-visual-workbench]");
  await expect(bench).toHaveAttribute("data-workbench-template", "flocking-boids");
  await expect(page.getByRole("tab", { name: /Workbench/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("form", { name: "Model purpose" })).toHaveCount(0);
  await expect(page.locator("[data-workshop-decomposition]")).toHaveCount(0);
  await expect(bench.getByText("Immutable Starter", { exact: true })).toBeVisible();
  await expect(bench.getByRole("spinbutton")).toHaveCount(0);
  await expect(bench.getByRole("button", { name: "Run Remix", exact: true })).toHaveCount(0);

  await ensureAssemblyExpanded(page, "Steering balance");
  await page.getByRole("button", { name: "Inspect Alignment", exact: true }).click();
  const inspector = page.locator("[data-workbench-inspector]");
  await expect(inspector.getByRole("heading", { name: "Alignment", exact: true })).toBeVisible();
  await expect(inspector).toContainText("Neighbor velocity");
  await inspector.getByRole("link", { name: /Remix this system to change it/ }).click();
  await expect(page).toHaveURL(/\/builder\?starter=flocking&focus=alignmentWeight$/);
  await expect(page.locator("[data-starter-remix-workspace] [data-visual-workbench]")).toHaveAttribute("data-workbench-ready", "true");
  const alignment = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  await expect(alignment).toBeVisible();
  await alignment.fill("0.2");
  await expect(page.getByRole("button", { name: "Inspect Alignment", exact: true })).toContainText("Alignment weight: 0.2");
  await expect(page.getByLabel("Starter remix lineage")).toContainText("Source Starter: Flocking baseline");
  await expect(page.getByLabel("Starter remix lineage")).toContainText("Unsaved remix");
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeEnabled();
});

test("different Starter systems expose their actual populations, transitions, grid, and network pieces", async ({ page }) => {
  test.setTimeout(90_000);
  const examples = [
    { id: "flocking", template: "flocking-boids", piece: "Nearby neighbors", detail: "spatial proximity, not a persistent network" },
    { id: "predator-prey", template: "predator-prey", piece: "Predation encounter", detail: "at most one nearby prey per tick" },
    { id: "epidemic", template: "epidemic-spread", piece: "Transmission", detail: "susceptible neighbor to infected" },
    { id: "forest-spread", template: "forest-fire", piece: "Neighbor ignition", detail: "adjacent fuel cells" },
    { id: "neural-excitation", template: "neural-excitation-network", piece: "Weighted propagation", detail: "directed synapses" }
  ];
  for (const example of examples) {
    await openWorkbench(page, `/builder?starter=${example.id}`);
    const bench = page.locator("[data-visual-workbench]");
    await expect(bench).toHaveAttribute("data-workbench-template", example.template);
    await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: `Inspect ${example.piece}`, exact: true }).click();
    const inspector = page.locator("[data-workbench-inspector]");
    await expect(inspector.getByRole("heading", { name: example.piece, exact: true })).toBeVisible();
    await expect(inspector).toContainText(example.detail);
    await expect(inspector).toContainText("Executable in this template");
    await expect(inspector.getByRole("region", { name: `Relationships for ${example.piece}` })).toBeVisible();
    await expect(page.getByRole("form", { name: "Model purpose" })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  }
});

test("nested decomposition and relationship navigation preserve inspectable pieces and keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWorkbench(page, "/builder");
  for (const assembly of ["Population", "Boids", "Motion state"]) {
    await ensureAssemblyExpanded(page, assembly);
    const collapse = page.getByRole("button", { name: `Collapse ${assembly}`, exact: true });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");
    await collapse.click();
    await expect(page.getByRole("button", { name: `Expand ${assembly}`, exact: true })).toHaveAttribute("aria-expanded", "false");
    await ensureAssemblyExpanded(page, assembly);
  }
  const position = page.getByRole("button", { name: "Inspect Position", exact: true });
  await position.focus();
  await page.keyboard.press("Enter");
  const inspector = page.locator("[data-workbench-inspector]");
  await expect(inspector.getByRole("heading", { name: "Position", exact: true })).toBeVisible();
  await expect(page.getByLabel("System decomposition path")).toContainText("Population");
  await expect(page.getByLabel("System decomposition path")).toContainText("Motion state");
  await page.getByRole("button", { name: "Collapse Motion state", exact: true }).click();
  await expect(position).toBeHidden();
  await page.getByRole("button", { name: "Expand Motion state", exact: true }).click();
  await expect(position).toBeVisible();
  await inspector.getByRole("region", { name: "Relationships for Position" }).getByRole("button", { name: /Nearby neighbors/ }).click();
  await expect(page.getByRole("button", { name: "Inspect Nearby neighbors", exact: true })).toBeFocused();
  await expect(inspector.getByRole("heading", { name: "Nearby neighbors", exact: true })).toBeVisible();
  await expect(inspector).toContainText("supplies local inputs");
  await page.getByRole("button", { name: "Collapse Population", exact: true }).click();
  await page.getByRole("button", { name: "Inspect Movement", exact: true }).click();
  await inspector.getByRole("region", { name: "Relationships for Movement" }).getByRole("button", { name: /Position/ }).click();
  await expect(position).toBeVisible();
  await expect(position).toBeFocused();
  await expect(inspector.getByRole("heading", { name: "Position", exact: true })).toBeVisible();
});

test("shared materials and curated questions expose capability boundaries without executable composition", async ({ page }) => {
  await openWorkbench(page, "/builder");
  await page.getByRole("button", { name: /Browse building blocks/ }).click();
  const shelf = page.getByRole("region", { name: "Systems materials shelf" });
  const inspector = page.locator("[data-workbench-inspector]");
  await shelf.getByRole("button", { name: "Agents & populations In this template", exact: true }).click();
  await expect(inspector).toContainText("Executable in this template");
  await expect(inspector.getByRole("link", { name: /Collective Motion/ })).toBeVisible();
  await expect(inspector.getByRole("link", { name: /Local Contact Outbreaks/ })).toBeVisible();
  await shelf.getByRole("button", { name: "Spatial fields Structural only", exact: true }).click();
  await expect(inspector).toContainText("Structural only · not executable");
  await expect(inspector).toContainText("No current worked example executes this material.");
  await shelf.getByRole("button", { name: "Birth & death Reference only", exact: true }).click();
  await expect(inspector).toContainText("Reference · not executable");
  await expect(inspector).toContainText("cannot be dragged into a runnable custom model");
  await expect(page.getByRole("button", { name: /^(Run Remix|Run model|Compile|Connect|Add material)$/ })).toHaveCount(0);

  await page.getByRole("button", { name: /Start from a question/ }).click();
  await page.getByRole("button", { name: "How does something spread?", exact: true }).click();
  const questionExamples = page.getByRole("navigation", { name: "Examples for this question" });
  await expect(questionExamples.getByRole("link", { name: /Local Contact Outbreaks/ })).toHaveAttribute("href", "/builder?starter=epidemic");
  await expect(questionExamples.getByRole("link", { name: "Open Landscape Spread", exact: true })).toHaveAttribute("href", "/builder?starter=forest-spread");
  await expect(page.locator("[data-visual-workbench]")).toHaveAttribute("data-workbench-template", "flocking-boids");
});

test("contextual invalid edits survive piece and variant changes and property reset preserves unrelated drafts", async ({ page }) => {
  await openWorkbench(page, "/builder?starter=flocking&focus=alignmentWeight");
  const alignment = page.getByRole("spinbutton", { name: "Alignment weight numeric value" });
  await alignment.fill("999");
  await expect(alignment).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Inspect Nearby neighbors", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Perception radius numeric value" }).fill("60");
  await page.getByRole("button", { name: "Edit exact run configuration", exact: true }).click();
  const seed = page.getByRole("textbox", { name: /^Seed/ });
  await seed.fill("s2-preserved-seed");
  await page.getByRole("combobox", { name: /^Behavior mode/ }).selectOption({ index: 1 });
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeDisabled();
  const alignmentPiece = page.getByRole("button", { name: "Inspect Alignment", exact: true });
  if (!(await alignmentPiece.isVisible())) await page.getByRole("button", { name: "Expand Steering balance", exact: true }).click();
  await alignmentPiece.click();
  await expect(alignment).toHaveValue("999");
  await expect(alignment).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Reset Alignment weight to source", exact: true }).click();
  await expect(alignment).toHaveValue("0.55");
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Inspect Nearby neighbors", exact: true }).click();
  await expect(page.getByRole("spinbutton", { name: "Perception radius numeric value" })).toHaveValue("60");
  const exact = page.getByRole("button", { name: "Edit exact run configuration", exact: true });
  if (await exact.isVisible()) await exact.click();
  await expect(seed).toHaveValue("s2-preserved-seed");

  const reset = page.getByRole("button", { name: "Reset to source", exact: true });
  await reset.click();
  const dialog = page.getByRole("dialog", { name: "Reset this remix to its source?" });
  await expect(dialog).toBeVisible();
  const keepEditing = dialog.getByRole("button", { name: "Keep editing", exact: true });
  const confirmReset = dialog.getByRole("button", { name: "Discard draft changes and reset to source", exact: true });
  await expect(keepEditing).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(confirmReset).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(keepEditing).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(reset).toBeFocused();
  await expect(seed).toHaveValue("s2-preserved-seed");
});

test("preset changes retain invalid option drafts and only explicit discard clears them", async ({ page }) => {
  await openWorkbench(page, "/builder?starter=flocking");
  await ensureAssemblyExpanded(page, "Population");
  await page.getByRole("button", { name: "Inspect Starting arrangement", exact: true }).click();
  const preset = page.getByRole("combobox", { name: /^Initialization preset/ });
  await preset.selectOption("aligned-flock");
  await ensureAssemblyExpanded(page, "Boids");
  await ensureAssemblyExpanded(page, "Motion state");
  await page.getByRole("button", { name: "Inspect Velocity", exact: true }).click();
  const spread = page.getByRole("spinbutton", { name: "Heading spread numeric value" });
  await spread.fill("999");
  await expect(spread).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Inspect Starting arrangement", exact: true }).click();
  await preset.selectOption("random-headings");
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeDisabled();
  const discard = page.getByRole("button", { name: "Discard invalid edit: initializationOptions.headingSpread", exact: true });
  await expect(discard).toBeVisible();
  await preset.selectOption("aligned-flock");
  await page.getByRole("button", { name: "Inspect Velocity", exact: true }).click();
  await expect(spread).toHaveValue("999");
  await expect(spread).toHaveAttribute("aria-invalid", "true");
  await discard.click();
  await expect(spread).toHaveValue("12");
  await expect(spread).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeEnabled();
});

test("group substitution uses the existing checked variant and exact controls avoid duplicate aliases", async ({ page }) => {
  await openWorkbench(page, "/builder?starter=flocking");
  await ensureAssemblyExpanded(page, "Population");
  await page.getByRole("button", { name: "Inspect Initialized groups", exact: true }).click();
  const groupCount = page.getByRole("spinbutton", { name: "Group count numeric value" });
  await groupCount.fill("1");
  const substitute = page.getByRole("button", { name: "Substitute group-aware boids", exact: true });
  await substitute.click();
  await expect(substitute).toBeVisible();
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeDisabled();
  await groupCount.fill("2");
  await substitute.click();
  await expect(page.getByText("Group-aware boids selected", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Edit exact run configuration", exact: true }).click();
  await expect(page.getByRole("combobox", { name: /^Behavior mode/ })).toHaveValue("groupAware");
  await expect(groupCount).toHaveCount(1);
  const controls = await page.locator("[data-workbench-control]").evaluateAll(elements => elements.map(element => element.getAttribute("data-workbench-control")));
  expect(new Set(controls).size).toBe(controls.length);
});

test("short desktop keeps run actions visible while the system panel scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await openWorkbench(page, "/builder?starter=flocking&focus=alignmentWeight");
  const content = page.locator('[data-intentional-scroll-region="workbench"]');
  const run = page.getByRole("button", { name: "Run Remix", exact: true });
  await expect(run).toBeInViewport();
  await page.getByRole("button", { name: "Edit exact run configuration", exact: true }).click();
  await content.evaluate(element => element.scrollTo({ top: element.scrollHeight }));
  await expect(run).toBeInViewport();
  await expectNoHorizontalOverflow(page);
  const scrollOwners = await page.locator("[data-visual-workbench]").evaluate(element => [...element.querySelectorAll("*")]
    .filter(node => /(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 2)
    .map(node => node.getAttribute("data-intentional-scroll-region")));
  expect(scrollOwners).toEqual(["workbench"]);
});

test("narrow reduced-motion navigation drills into a system and returns to the visible piece", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openWorkbench(page, "/builder");
  for (const assembly of ["Population", "Boids", "Motion state"]) {
    const piece = page.getByRole("button", { name: `Inspect ${assembly}`, exact: true });
    await piece.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#workbench-level-title")).toHaveText(assembly);
    await expect(page.locator("#workbench-level-title")).toBeFocused();
    await expectNoHorizontalOverflow(page);
  }
  const position = page.getByRole("button", { name: "Inspect Position", exact: true });
  await position.focus();
  await page.keyboard.press("Enter");
  const inspector = page.locator("[data-workbench-inspector]");
  await expect(inspector).toBeFocused();
  await expect(inspector.getByRole("heading", { name: "Position", exact: true })).toBeVisible();
  await inspector.getByRole("button", { name: /Back to Motion state/ }).click();
  await expect(position).toBeFocused();
  await expect(position).toBeInViewport();
  await expectNoHorizontalOverflow(page);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  const activeAnimations = await page.locator("[data-visual-workbench]").evaluate(element =>
    [...element.querySelectorAll("*")].filter(node => {
      const style = getComputedStyle(node);
      return style.animationName !== "none" && style.animationDuration !== "0s";
    }).length
  );
  expect(activeAnimations).toBe(0);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);

  await openWorkbench(page, "/builder?starter=flocking");
  await expect(page.locator("[data-visual-workbench]")).toHaveAttribute("data-narrow-mode", "browse");
  await expect(page.getByRole("button", { name: "Inspect Local steering", exact: true })).toBeVisible();
  for (const assembly of ["Local steering", "Steering balance"]) {
    await page.getByRole("button", { name: `Inspect ${assembly}`, exact: true }).click();
    await expect(page.locator("#workbench-level-title")).toHaveText(assembly);
  }
  await page.getByRole("button", { name: "Inspect Alignment", exact: true }).click();
  await expect(page.getByRole("spinbutton", { name: "Alignment weight numeric value" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run Remix", exact: true })).toBeEnabled();
});

async function openWorkbench(page: Page, href: string) {
  await page.goto(href, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-visual-workbench]")).toHaveAttribute("data-workbench-ready", "true");
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

async function ensureAssemblyExpanded(page: Page, label: string) {
  const expand = page.getByRole("button", { name: `Expand ${label}`, exact: true });
  if (await expand.isVisible()) await expand.click();
}
