import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function pngSize(path: string): { width: number; height: number; colorType: number } {
  const file = readFileSync(path);
  expect(file.toString("hex", 0, 8)).toBe("89504e470d0a1a0a");
  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
    colorType: file[25] ?? -1
  };
}

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("ORTUS brand integration", () => {
  it("moves primary and secondary PNG marks into canonical public branding paths without root duplicates", () => {
    const sharpPath = join(repoRoot, "public", "branding", "ortus-mark-sharp.png");
    const softPath = join(repoRoot, "public", "branding", "ortus-mark-soft.png");

    expect(existsSync(sharpPath)).toBe(true);
    expect(existsSync(softPath)).toBe(true);
    expect(existsSync(join(repoRoot, "sharp_edge_logo.png"))).toBe(false);
    expect(existsSync(join(repoRoot, "soft_edge_logo.png"))).toBe(false);
    expect(pngSize(sharpPath)).toEqual({ width: 451, height: 442, colorType: 6 });
    expect(pngSize(softPath)).toEqual({ width: 465, height: 462, colorType: 6 });
  });

  it("keeps the brand component small, accessible, text-wordmarked, and free of runtime hooks", () => {
    const logoSource = source("src/components/branding/OrtusLogo.tsx");
    const brandSource = source("src/components/branding/OrtusBrand.tsx");
    const combined = `${logoSource}\n${brandSource}`;

    expect(combined).toContain('variant = "sharp"');
    expect(combined).toContain('size = "header"');
    expect(combined).toContain("showWordmark = true");
    expect(combined).toContain("showDescriptor = false");
    expect(combined).toContain("/branding/ortus-mark-sharp.png");
    expect(combined).toContain("/branding/ortus-mark-soft.png");
    expect(combined).toContain("Systems Sandbox");
    expect(combined).toContain("alt={decorative ? \"\" : label}");
    expect(combined).toContain('data-brand-lockup={showWordmark ? "canonical" : "compact"}');
    expect(combined).not.toContain("sharp_edge_logo.png");
    expect(combined).not.toContain("soft_edge_logo.png");
    expect(combined).not.toContain("base64");
    expect(combined).not.toContain("dangerouslySetInnerHTML");
    expect(combined).not.toContain("eval(");
    expect(combined).not.toContain("new Function");
    expect(combined).not.toContain("requestAnimationFrame");
    expect(combined).not.toMatch(/from ["'][^"']*simulation/);
    expect(combined).not.toContain("useSimulationStore");
    expect(combined).not.toMatch(/https?:\/\//);
  });

  it("places one canonical full brand in app shell and keeps the mark out of world and builder graph surfaces", () => {
    const topStatus = source("src/components/TopStatusBar.tsx");
    const appShell = source("src/components/AppShell.tsx");
    const builderHeader = source("src/components/builder/BuilderHeader.tsx");
    const builderViewport = source("src/components/builder/BuilderViewport.tsx");
    const researchShell = source("src/components/researchWorld/ResearchWorldShell.tsx");
    const worldStage = source("src/components/WorldStage.tsx");
    const css = source("src/app/globals.css");

    expect(researchShell).toContain('<OrtusBrand href="/" showDescriptor className="research-shell__brand" />');
    expect(topStatus).not.toContain("OrtusBrand");
    expect(appShell).toContain('<OrtusBrand variant="soft" showDescriptor />');
    expect(builderHeader).not.toContain("OrtusBrand");
    expect(builderHeader).toContain("Builder Workspace / Safe UI Shell V1");
    expect(builderViewport).not.toContain("OrtusBrand");
    expect(builderViewport).not.toContain("/branding/");
    expect(worldStage).not.toContain("OrtusBrand");
    expect(worldStage).not.toContain("/branding/");
    expect(css).toContain(".research-shell__brand .ortus-brand__descriptor");
    expect(css).toContain(".research-shell__brand .ortus-brand__wordmark");
    expect(css).toContain("a:focus-visible");
    expect(css).toContain(".ortus-logo--header");
    expect(css).not.toContain("background-image: url(\"/branding");
  });

  it("documents brand guardrails without claiming favicon optimization or runtime capability", () => {
    const docs = [
      source("README.md"),
      source("docs/concepts.md"),
      source("docs/codex/CURRENT_CONTEXT.md"),
      source("docs/codex/SESSION_LOG.md"),
      source("AGENTS.md")
    ].join("\n");

    expect(docs).toContain("The sharp ORTUS mark is the primary navigation brand.");
    expect(docs).toContain("The soft ORTUS mark is a secondary presentation variant.");
    expect(docs).toContain("Do not use either mark as a simulation-world or Builder-graph watermark.");
    expect(docs).toContain("Builder remains an ORTUS workspace, not a separate branded product.");
    expect(docs).toContain("Favicon replacement remains future work until small-size legibility is deliberately optimized.");
    expect(docs).toContain("HCI findings must distinguish observed defects, inferred risks, subjective style preferences, and unverified concerns.");
  });
});
