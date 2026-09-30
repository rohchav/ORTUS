import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const maxAgentsLines = 200;
const maxAgentsBytes = 24 * 1024;

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

// A backticked token is treated as a repository path when it contains a slash or ends in a
// source/document extension. Routes (leading "/"), glob patterns, and installed package
// specifiers such as `next/font/google` are not repository paths.
function citedRepoPaths(markdown: string): string[] {
  const tokens = [...markdown.matchAll(/`([^`\s]+)`/g)].map((match) => match[1] ?? "");
  return [...new Set(tokens)].filter(
    (token) =>
      !token.startsWith("/") &&
      !/[*?[\]{}<>"=]/.test(token) &&
      (token.includes("/") || /\.(md|ts|tsx|mjs|js|json|css)$/.test(token)) &&
      !isPackageSpecifier(token)
  );
}

function isPackageSpecifier(token: string): boolean {
  const segments = token.split("/");
  const packageName = token.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0] ?? token;
  return existsSync(join(repoRoot, "node_modules", packageName, "package.json"));
}

function globStaticPrefix(glob: string): string {
  const firstMagic = glob.search(/[*?[{]/);
  const prefix = firstMagic === -1 ? glob : glob.slice(0, firstMagic);
  return firstMagic === -1 ? prefix : prefix.slice(0, prefix.lastIndexOf("/") + 1) || ".";
}

describe("agent instruction budget", () => {
  it("keeps AGENTS.md within the line and byte budget", () => {
    const agents = source("AGENTS.md");
    const lines = agents.endsWith("\n") ? agents.split("\n").length - 1 : agents.split("\n").length;

    expect(lines, "AGENTS.md line count").toBeLessThanOrEqual(maxAgentsLines);
    expect(Buffer.byteLength(agents, "utf8"), "AGENTS.md size in bytes").toBeLessThanOrEqual(maxAgentsBytes);
  });

  it("cites only repository paths that exist", () => {
    const missing = citedRepoPaths(source("AGENTS.md")).filter((path) => !existsSync(join(repoRoot, path)));

    expect(missing).toEqual([]);
  });

  it("scopes every path-specific rule file to existing locations", () => {
    const rulesDir = join(repoRoot, ".claude", "rules");
    const ruleFiles = readdirSync(rulesDir).filter((file) => file.endsWith(".md"));
    expect(ruleFiles.length).toBeGreaterThan(0);

    for (const file of ruleFiles) {
      const text = readFileSync(join(rulesDir, file), "utf8");
      const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? "";
      const globs = [...frontmatter.matchAll(/^\s+-\s+"([^"]+)"\s*$/gm)].map((match) => match[1] ?? "");

      expect(globs.length, `${file} declares paths`).toBeGreaterThan(0);
      for (const glob of globs) {
        expect(existsSync(join(repoRoot, globStaticPrefix(glob))), `${file}: ${glob}`).toBe(true);
      }
      expect(source("AGENTS.md"), `AGENTS.md lists ${file}`).toContain(`.claude/rules/${file}`);
    }
  });
});
