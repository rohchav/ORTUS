import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("simulation package architecture boundary", () => {
  it("does not import UI, state, DOM, or canvas APIs from simulation implementation files", () => {
    const files = simulationFiles(join(process.cwd(), "src", "simulation")).filter((file) => !file.endsWith(".test.ts"));
    const banned = [
      /from\s+["']react["']/,
      /from\s+["']zustand["']/,
      /\bdocument\./,
      /\bwindow\./,
      /\blocalStorage\b/,
      /\bnavigator\./,
      /\brequestAnimationFrame\b/,
      /\bCanvasRenderingContext2D\b/,
      /\bHTMLCanvasElement\b/,
      /from\s+["'][^"']*components/,
      /from\s+["'][^"']*state/,
      /from\s+["'][^"']*app/
    ];
    const offenders = files.filter((file) => banned.some((pattern) => pattern.test(readFileSync(file, "utf8"))));

    expect(offenders).toEqual([]);
  });

  it("does not use dynamic code execution in simulation implementation files", () => {
    const files = simulationFiles(join(process.cwd(), "src", "simulation")).filter((file) => !file.endsWith(".test.ts"));
    const banned = [/\beval\s*\(/, /\bnew\s+Function\b/];
    const offenders = files.filter((file) => banned.some((pattern) => pattern.test(readFileSync(file, "utf8"))));

    expect(offenders).toEqual([]);
  });

  it("documents the core concept boundaries and lifecycle vocabulary", () => {
    const concepts = readFileSync(join(process.cwd(), "docs", "concepts.md"), "utf8");

    expect(concepts).toContain("TemplateDefinition");
    expect(concepts).toContain("+ Scenario / RunConfig");
    expect(concepts).toContain("-> Fresh engine instance");
    expect(concepts).toContain("Uncertainty Config");
    expect(concepts).toContain("validated `SnapshotExport` preserves exact continuation state for restore");
    expect(concepts).toContain("`SimulationSnapshotView` does not");
    expect(concepts).toContain("None of these should be treated as real-world prediction");
  });
});

function simulationFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return simulationFiles(path);
    }
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}
