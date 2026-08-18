import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { productionTemplateIds } from "../templates/registry";

const repoRoot = process.cwd();
const canonicalPaths = {
  architecture: join(repoRoot, "docs", "ARCHITECTURE.md"),
  capabilities: join(repoRoot, "docs", "CAPABILITIES.md"),
  scientificModel: join(repoRoot, "docs", "SCIENTIFIC_MODEL.md"),
  roadmap: join(repoRoot, "docs", "ROADMAP.md")
} as const;
const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("A0 canonical architecture and source hierarchy", () => {
  it("establishes four canonical sources with explicit precedence", () => {
    const architecture = source(canonicalPaths.architecture);
    const capabilities = source(canonicalPaths.capabilities);
    const scientificModel = source(canonicalPaths.scientificModel);
    const roadmap = source(canonicalPaths.roadmap);

    expect(architecture).toContain("Status: CURRENT architectural source of truth after A0");
    expect(capabilities).toContain("Status: CURRENT capability source of truth after A0");
    expect(scientificModel).toContain("Status: CURRENT epistemic and scientific source of truth after A0");
    expect(roadmap).toContain("Status: CURRENT future-sequencing source of truth after A0");

    const precedence = [
      "Executable code and tests",
      "`CAPABILITIES.md`",
      "`ARCHITECTURE.md`",
      "`SCIENTIFIC_MODEL.md`",
      "`ROADMAP.md`",
      "Milestone implementation and audit reports",
      "`CURRENT_CONTEXT.md`, `SESSION_LOG.md`, and prompt roadmaps"
    ].map((phrase) => architecture.indexOf(phrase));
    expect(precedence.every((position) => position >= 0)).toBe(true);
    expect(precedence).toEqual([...precedence].sort((left, right) => left - right));
  });

  it("separates fundamental, execution-derived, presentation-derived, and research objects", () => {
    const architecture = source(canonicalPaths.architecture);

    for (const object of [
      "ModelDefinition",
      "RuntimePlan",
      "RunConfig",
      "SimulationRun",
      "SimulationSnapshot",
      "RenderFramePacket",
      "UIProjection",
      "CanonicalObservation",
      "SystemViewSpec",
      "RepresentationArtifact",
      "ViewDerivation",
      "EvidenceReport",
      "CandidateAssessment",
      "ResearchContext",
      "ExperimentSpec",
      "Investigation",
      "ClaimRecord"
    ]) {
      expect(architecture).toContain(`\`${object}\``);
    }

    expect(architecture).toContain("ModelDefinition != RuntimePlan");
    expect(architecture).toContain("SimulationSnapshot != RenderFramePacket != UIProjection != CanonicalObservation");
    expect(architecture).toContain("representation != question != derivation != evidence != assessment");
    expect(architecture).toContain("`CanonicalObservation` | Provenance-bearing scientific sample");
    expect(architecture).toContain("PLANNED; deliberately absent");
  });

  it("keeps authority downward and the computational substrate distinct from scientific ontology", () => {
    const architecture = source(canonicalPaths.architecture);

    expect(architecture).toContain("No lower-authority consumer may silently acquire higher-layer authority.");
    expect(architecture).toContain("The current engine is entity/component/system shaped.");
    expect(architecture).toContain("This is a useful computational substrate, not a universal claim");
    expect(architecture).toContain("renderer to model mutation");
    expect(architecture).toContain("research to mutable engine internals");
    expect(architecture).toContain("candidate generator to its own validation authority");
  });

  it("freezes future SystemView direction without claiming a hierarchy or implementation", () => {
    const architecture = source(canonicalPaths.architecture);
    const roadmap = source(canonicalPaths.roadmap);

    expect(architecture).toContain("Future research representation is a SystemView graph");
    expect(architecture).toContain("not a universal micro-to-meso-to-macro hierarchy");
    expect(architecture).toContain("not a mandatory `Scale x Lens x Regime` Cartesian cube");
    expect(architecture).toContain("No SystemView schema, runtime, mapping executor, or discovery algorithm is implemented by A0.");
    expect(roadmap).toContain("old hierarchy-first multi-scale roadmap is superseded");
  });

  it("matches the production template registry and exposes narrow runtime exceptions", () => {
    const capabilities = source(canonicalPaths.capabilities);

    for (const templateId of productionTemplateIds) {
      expect(capabilities).toContain(`\`${templateId}\``);
    }
    expect(capabilities).toContain("restricted to projection kind `flocking-v1` and template `flocking-boids`");
    expect(capabilities).toContain("Only template with registry-recognized runtime network topology");
    expect(capabilities).toContain("Opinion's narrow template-owned mode does not implement a generic social/cognitive runtime.");
    expect(capabilities).toContain("Global service availability does not grant template support.");
  });

  it("records the post-A0 handoff without restoring obsolete sequencing", () => {
    const roadmap = source(canonicalPaths.roadmap);
    const activeStatus = [
      source(join(repoRoot, "README.md")),
      source(join(repoRoot, "docs", "codex", "CURRENT_CONTEXT.md")),
      source(join(repoRoot, "planned_roadmap.md")),
      roadmap
    ].join("\n");

    expect(roadmap).toContain("A0 - Canonical Architecture + Source-of-Truth Consolidation | COMPLETE");
    expect(roadmap).toContain("A0B - Canonical Architecture + Source-of-Truth Audit | NEXT / UNSTARTED");
    expect(roadmap).toContain("I1 - Production Runtime Migration + Immersive Shell Foundation | PLANNED / UNSTARTED");
    expect(roadmap).toContain("UR0 - Product Leverage + Comprehension Gate | PLANNED / UNSTARTED");
    expect(roadmap).toContain("C4 is not deferred until I5B.");
    expect(roadmap).toContain("MF-series milestones create reusable computational/scientific execution families");
    expect(activeStatus).not.toContain("A0 is next and unstarted");
    expect(activeStatus).not.toContain("A0: Canonical Architecture + Source-of-Truth Consolidation is next");
    expect(activeStatus).not.toContain("C4 is deferred until I5B");
  });

  it("preserves scientific non-equivalence, identifiability, and safety contracts", () => {
    const scientificModel = source(canonicalPaths.scientificModel);

    expect(scientificModel).toContain("model structure");
    expect(scientificModel).toContain("!= runtime support");
    expect(scientificModel).toContain("!= empirical validation");
    expect(scientificModel).toContain("!= policy authority");
    expect(scientificModel).toContain("Candidate generation is not validation.");
    expect(scientificModel).toContain("A generator must never certify its own output.");
    expect(scientificModel).toContain("`UNIDENTIFIABLE` is a legitimate result");
    expect(scientificModel).toContain("protected-class inference");
    expect(scientificModel).toContain("persuasion optimization or microtargeting");
    expect(scientificModel).toContain("LLM-per-agent");
  });
});

describe("A0 scoped architecture lint", () => {
  it("passes a clean bounded fixture", async () => {
    const root = fixtureRoot();
    write(root, "src/simulation/kernel/clean.ts", "export const deterministicValue = 1;\n");
    write(root, "src/components/Clean.tsx", "export function Clean() { return <img alt=\"Model state\" />; }\n");

    const result = await runArchitectureLint(root);

    expect(result.issues).toEqual([]);
    expect(result.sourceFileCount).toBe(2);
  });

  it("rejects hidden randomness, UI coupling, dynamic execution, private runtime imports, and inaccessible click surfaces", async () => {
    const root = fixtureRoot();
    write(
      root,
      "src/simulation/bad.ts",
      [
        'import React from "react";',
        "export const random = Math.random();",
        'export const generated = new Function("return 1");',
        "export const stored = window.localStorage;"
      ].join("\n")
    );
    write(
      root,
      "src/components/Bad.tsx",
      [
        'import { RuntimeSession } from "../simulation/runtime/RuntimeSession";',
        "export function Bad() {",
        "  return <div onClick={() => RuntimeSession}>Open</div>;",
        "}"
      ].join("\n")
    );
    write(
      root,
      "src/research/bad.ts",
      'import { SimulationEngine } from "../simulation/kernel/SimulationEngine";\nexport { SimulationEngine };\n'
    );

    const result = await runArchitectureLint(root);
    const output = result.issues.join("\n");

    expect(result.issues.length).toBeGreaterThanOrEqual(7);
    expect(output).toContain("must use seeded RandomService streams");
    expect(output).toContain("imports forbidden UI layer");
    expect(output).toContain("dynamic code execution is forbidden");
    expect(output).toContain("browser-storage globals");
    expect(output).toContain("imports private runtime authority");
    expect(output).toContain("research code imports mutable simulation authority");
    expect(output).toContain("requires role, tabIndex, and a keyboard handler");
  });
});

function source(path: string): string {
  return readFileSync(path, "utf8");
}

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "ortus-a0-lint-"));
  temporaryRoots.push(root);
  return root;
}

function write(root: string, path: string, contents: string): void {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, contents, "utf8");
}

async function runArchitectureLint(root: string): Promise<{ issues: string[]; sourceFileCount: number }> {
  const moduleUrl = new URL("../../../scripts/lint-architecture.mjs", import.meta.url).href;
  const module = await import(moduleUrl) as {
    lintArchitecture(targetRoot: string): { issues: string[]; sourceFileCount: number };
  };
  return module.lintArchitecture(root);
}
