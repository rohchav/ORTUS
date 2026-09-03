import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("S1B Starter Remix audit handoff", () => {
  it("separates the audited plumbing verdict from the future Workshop product direction", () => {
    const audit = source("docs/product/STARTER_REMIX_BRIDGE_AUDIT.md");
    const capabilities = source("docs/CAPABILITIES.md");

    expect(audit).toContain("S1 plumbing: technically accepted after hardening");
    expect(audit).toContain("Current form-first Workshop UX: not validated as the intended future Workshop");
    expect(audit).toContain("The UR0 human comprehension gate remains pending");
    expect(capabilities).toContain("S1B validates this narrow plumbing, not the current form-first Workshop");
    expect(capabilities).toContain("The default Guided/Advanced forms remain structural and non-executable");
  });

  it("records S2 as an unimplemented example-first Visual Systems Workbench", () => {
    const roadmap = source("docs/ROADMAP.md");
    const audit = source("docs/product/STARTER_REMIX_BRIDGE_AUDIT.md");
    const combined = `${roadmap}\n${audit}`;

    expect(roadmap).toContain("S1B - Starter -> Remix Bridge Audit | COMPLETE");
    expect(roadmap).toContain("S2 - Visual Systems Workbench | NEXT / UNSTARTED");
    for (const phrase of [
      "taking working systems apart visually",
      "agents, cells, nodes, edges, fields, spaces, processes, and interactions",
      "expand/collapse decomposition",
      "relationship inspection",
      "split, duplicate, substitute, and merge",
      "Starter Worlds as worked modeling examples",
      "curiosity-driven Remix",
      "secondary inspector or advanced surfaces"
    ]) {
      expect(combined).toContain(phrase);
    }
    for (const capabilityState of [
      "EXECUTABLE NOW",
      "STRUCTURALLY REPRESENTABLE",
      "REFERENCE",
      "FUTURE"
    ]) {
      expect(roadmap).toContain(capabilityState);
    }
    expect(audit).toContain("S1B implements none of that S2 UI");
  });

  it("keeps the audit subordinate and rejects capability inflation", () => {
    const audit = source("docs/product/STARTER_REMIX_BRIDGE_AUDIT.md");

    for (const canonical of [
      "../CAPABILITIES.md",
      "../ARCHITECTURE.md",
      "../SCIENTIFIC_MODEL.md",
      "../ROADMAP.md"
    ]) {
      expect(audit).toContain(canonical);
    }
    expect(audit).toContain("It does not implement general model construction");
    expect(audit).toContain("provenance is strict, bounded, schema-checked application metadata");
    expect(audit).toContain("It is not a cryptographic signature");
  });
});
