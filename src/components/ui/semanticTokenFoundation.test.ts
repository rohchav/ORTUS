import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getWorkspaceStatusBadges } from "../builder/builderViewModel";
import { resolveStatusPillSemantics } from "./statusPillSemantics";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

function listFiles(dir: string): string[] {
  const absolute = join(repoRoot, dir);
  return readdirSync(absolute).flatMap((entry) => {
    const path = join(absolute, entry);
    const relative = path.slice(repoRoot.length + 1);
    return statSync(path).isDirectory() ? listFiles(relative) : [relative];
  });
}

describe("Living Systems Atlas semantic token foundation", () => {
  it("defines semantic token layers in the canonical global CSS source while preserving legacy aliases", () => {
    const css = source("src/app/globals.css");
    const requiredTokens = [
      "--palette-charcoal-960",
      "--surface-root",
      "--surface-canvas",
      "--surface-panel",
      "--surface-panel-raised",
      "--surface-panel-inset",
      "--surface-overlay",
      "--surface-note",
      "--surface-selected",
      "--surface-disabled",
      "--surface-world",
      "--surface-lab",
      "--surface-atlas",
      "--surface-workshop",
      "--text-primary",
      "--text-secondary",
      "--text-muted",
      "--text-inverse",
      "--text-interactive",
      "--text-disabled",
      "--text-warning",
      "--text-failure",
      "--border-subtle",
      "--border-default",
      "--border-strong",
      "--border-selected",
      "--border-focus",
      "--border-warning",
      "--border-failure",
      "--border-stale",
      "--border-unsupported",
      "--interaction-default-surface",
      "--interaction-hover-surface",
      "--interaction-pressed-surface",
      "--interaction-selected-surface",
      "--interaction-focus-outline",
      "--operational-running-surface",
      "--operational-completed-surface",
      "--operational-non-runnable-surface",
      "--evidence-supported-surface",
      "--evidence-contradicted-surface",
      "--evidence-unresolved-surface",
      "--evidence-stale-surface",
      "--evidence-unsupported-surface",
      "--evidence-planning-only-surface",
      "--evidence-future-only-surface",
      "--motion-duration-reduced"
    ];

    for (const token of requiredTokens) {
      expect(css).toContain(`${token}:`);
    }

    expect(css).toContain("Raw palette values: semantic and component-role tokens below should consume these.");
    expect(css).toContain("--bg-primary: var(--surface-root);");
    expect(css).toContain("--bg-secondary: var(--surface-canvas);");
    expect(css).toContain("--bg-panel: var(--surface-panel);");
    expect(css).toContain("--accent-primary: var(--interaction-accent);");
    expect(css).toContain("--danger: var(--text-failure);");
    expect(css).toContain("selected != supported, active != validated, hovered != important");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(":focus-visible");
    expect(css).not.toContain("--accent-primary: #d8ff3e;");
  });

  it("keeps UX2 bounded to existing routes, CSS, dependencies, and offline-safe typography", () => {
    const packageJson = JSON.parse(source("package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const packageNames = new Set([...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.devDependencies ?? {})]);
    const forbiddenPackages = [
      "tailwindcss",
      "sass",
      "styled-components",
      "@emotion/react",
      "@fontsource/inter",
      "lucide-react",
      "framer-motion",
      "d3",
      "cytoscape"
    ];
    for (const packageName of forbiddenPackages) {
      expect(packageNames.has(packageName)).toBe(false);
    }

    expect(existsSync(join(repoRoot, "src", "app", "page.tsx"))).toBe(true);
    expect(existsSync(join(repoRoot, "src", "app", "builder", "page.tsx"))).toBe(true);
    for (const futureRoute of ["world", "lab", "atlas", "workshop"]) {
      expect(existsSync(join(repoRoot, "src", "app", futureRoute))).toBe(false);
    }
    for (const forbiddenPath of ["src/persistence", "src/discovery", "src/researchWorld", "src/progression"]) {
      expect(existsSync(join(repoRoot, forbiddenPath))).toBe(false);
    }

    const appSources = listFiles("src/app")
      .filter((path) => /\.(css|ts|tsx)$/.test(path))
      .map(source)
      .join("\n");
    expect(appSources).not.toContain("next/font/google");
    expect(appSources).not.toMatch(/@import\s+url|https?:\/\//i);
  });

  it("keeps status categories explicit and distinct from scientific validation claims", () => {
    const selected = resolveStatusPillSemantics({
      label: "Selected",
      category: "interaction",
      state: "selected",
      description: "Current UI selection only."
    });
    const supported = resolveStatusPillSemantics({
      label: "Supported",
      category: "evidence",
      state: "supported",
      description: "Evidence supports this modeled finding."
    });
    const completed = resolveStatusPillSemantics({
      label: "Export complete",
      category: "operational",
      state: "completed",
      description: "The file export operation completed."
    });

    expect(selected).toEqual({
      category: "interaction",
      state: "selected",
      ariaLabel: "Selected: Current UI selection only."
    });
    expect(supported.category).toBe("evidence");
    expect(supported.state).toBe("supported");
    expect(selected).not.toEqual(supported);
    expect(completed.ariaLabel.toLowerCase()).not.toContain("validated");

    const css = source("src/app/globals.css");
    for (const state of ["stale", "unsupported", "planning-only", "future-only"]) {
      expect(css).toContain(`data-state="${state}"`);
    }
    expect(css).toContain("--evidence-stale-surface");
    expect(css).toContain("--evidence-unsupported-surface");
    expect(css).toContain("--evidence-planning-only-surface");
    expect(css).toContain("--evidence-future-only-surface");
  });

  it("renders builder badge semantics without implying runnable or validated workspace behavior", () => {
    const badges = getWorkspaceStatusBadges({
      workspaceId: "ux2-status-test",
      valid: true,
      runnableNow: false,
      visualBuilderRuntimeAvailable: false,
      schemaExecutionAvailable: false,
      compilerAvailable: false,
      errors: [],
      warnings: [],
      missingCapabilities: []
    });
    expect(badges.map((badge) => badge.label)).toEqual([
      "Structural only",
      "Structurally valid",
      "Not runnable",
      "Service only",
      "No compiler",
      "No schema execution"
    ]);
    expect(badges.find((badge) => badge.label === "Structural only")).toMatchObject({
      category: "capability",
      state: "planning-only"
    });
    expect(badges.find((badge) => badge.label === "Structurally valid")).toMatchObject({
      category: "operational",
      state: "ready"
    });
    expect(badges.find((badge) => badge.label === "Not runnable")).toMatchObject({
      category: "capability",
      state: "non-runnable"
    });
    expect(badges.find((badge) => badge.label === "Service only")).toMatchObject({
      category: "capability",
      state: "unsupported"
    });
    expect(badges.map((badge) => badge.label.toLowerCase())).not.toContain("validated");

    const componentSource = source("src/components/builder/BuilderStatusBadge.tsx");
    expect(componentSource).toContain("data-status-category={badge.category ?? \"capability\"}");
    expect(componentSource).toContain("data-state={badge.state ?? \"unverified\"}");
    expect(componentSource).toContain("aria-label={`${badge.label}: ${badge.description}`}");
  });
});
