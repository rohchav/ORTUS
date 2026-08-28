import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import { flockingTemplate } from "../templates/flocking.template";
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

    expect(architecture).toContain("Status: CURRENT architectural source of truth after I1B");
    expect(capabilities).toContain("Status: CURRENT capability source of truth after I1B");
    expect(scientificModel).toContain("Status: CURRENT epistemic and scientific source of truth after A0B");
    expect(roadmap).toContain("Status: CURRENT future-sequencing source of truth after the UR0R product repair");

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
    expect(architecture).toContain("SimulationSnapshotView != SnapshotExport");
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
    expect(architecture).toContain("research to mutable engine/runtime internals");
    expect(architecture).toContain("candidate generator to its own validation authority");
    expect(architecture).toContain("`ModelDefinition` must not import or expose concrete ECS kernel internals");
    expect(architecture).toContain("`A -> B` means A may import B");
  });

  it("states the split production cadence authority without pretending every template is migrated", () => {
    const architecture = source(canonicalPaths.architecture);
    const appShell = source(join(repoRoot, "src", "components", "AppShell.tsx"));

    expect(appShell).toContain("requestAnimationFrame(loop)");
    expect(appShell).toContain("state.runFrameSteps(cappedSteps)");
    expect(appShell).toContain("ProductionRuntimeProvider");
    expect(architecture).toContain("Production React no longer owns Flocking cadence");
    expect(architecture).toContain("six legacy template paths");
    expect(architecture).toContain("Dedicated Worker `RuntimeSession` and runtime scheduler");
  });

  it("separates the detached snapshot read view from exact continuation state", () => {
    const architecture = source(canonicalPaths.architecture);
    const capabilities = source(canonicalPaths.capabilities);
    const engine = new SimulationEngine(flockingTemplate, { seed: "a0b-snapshot-contract", parameters: { agentCount: 20 } });
    const view = engine.createSnapshot();
    const continuation = engine.snapshotExport();

    expect("rng" in view).toBe(false);
    expect("world" in view).toBe(false);
    expect(continuation.rng.seed).toBe("a0b-snapshot-contract");
    expect(continuation.world.events).toBeDefined();

    view.globals.a0bDetachedMutation = true;
    expect(engine.createSnapshot().globals.a0bDetachedMutation).toBeUndefined();
    expect(architecture).toContain("`SimulationSnapshotView` is not exact continuation state");
    expect(capabilities).toContain("Only `SnapshotExport` is accepted as exact continuation state");
  });

  it("freezes future SystemView direction without claiming a hierarchy or implementation", () => {
    const architecture = source(canonicalPaths.architecture);
    const roadmap = source(canonicalPaths.roadmap);

    expect(architecture).toContain("Future research representation is a SystemView graph");
    expect(architecture).toContain("not a universal micro-to-meso-to-macro hierarchy");
    expect(architecture).toContain("not a mandatory `Scale x Lens x Regime` Cartesian cube");
    expect(architecture).toContain("Production Flocking's System camera mode and Alignment lens are presentation controls");
    expect(architecture).toContain("No SystemView schema, runtime, mapping executor, or discovery algorithm is implemented by I1.");
    expect(roadmap).toContain("old hierarchy-first multi-scale roadmap is superseded");
  });

  it("matches the production template registry and exposes narrow runtime exceptions", () => {
    const capabilities = source(canonicalPaths.capabilities);

    for (const templateId of productionTemplateIds) {
      expect(capabilities).toContain(`\`${templateId}\``);
    }
    expect(capabilities).toContain("only for template `flocking-boids` and projection kind `flocking-v1`");
    expect(capabilities).toContain("does not grant Worker support to another template");
    expect(capabilities).toContain("Only template with registry-recognized runtime network topology");
    expect(capabilities).toContain("Opinion's narrow template-owned mode does not implement a generic social/cognitive runtime.");
    expect(capabilities).toContain("Global service availability does not grant template support.");
  });

  it("records the human-pending UR0R to S1 handoff without restoring obsolete sequencing", () => {
    const roadmap = source(canonicalPaths.roadmap);
    const activeStatus = [
      source(join(repoRoot, "README.md")),
      source(join(repoRoot, "docs", "codex", "CURRENT_CONTEXT.md")),
      roadmap
    ].join("\n");

    expect(roadmap).toContain("A0 - Canonical Architecture + Source-of-Truth Consolidation | COMPLETE");
    expect(roadmap).toContain("A0B - Canonical Architecture + Source-of-Truth Audit | COMPLETE");
    expect(roadmap).toContain("I1 - Production Runtime Migration + Immersive Shell Foundation | COMPLETE");
    expect(roadmap).toContain("I1B - Production Runtime Migration Audit | COMPLETE");
    expect(roadmap).toContain("UR0 - Product Leverage + Comprehension Gate | TECHNICAL/EXPERT COMPLETE; HUMAN PENDING");
    expect(roadmap).toContain("UR0R - Product Comprehension + Exploration Repair | COMPLETE");
    expect(roadmap).toContain("S1 - Starter -> Remix Bridge | NEXT / UNSTARTED");
    expect(roadmap).toContain("UR0 HUMAN COMPREHENSION PENDING");
    expect(roadmap).toContain("S1 NEXT / UNSTARTED");
    expect(roadmap).toContain("C4 is not deferred until I5B.");
    expect(roadmap).toContain("MF-series milestones create reusable computational/scientific execution families");
    expect(activeStatus).not.toContain("A0 is next and unstarted");
    expect(activeStatus).not.toContain("A0: Canonical Architecture + Source-of-Truth Consolidation is next");
    expect(activeStatus).not.toContain("C4 is deferred until I5B");
    expect(activeStatus).not.toContain("UR0: Product Leverage + Comprehension Gate is next and unstarted");
  });

  it("does not let README or contributor instructions create competing current authorities", () => {
    const readme = source(join(repoRoot, "README.md"));
    const agents = source(join(repoRoot, "AGENTS.md"));

    expect(readme).toContain("browser-based complex-systems simulation sandbox");
    expect(readme).not.toContain("visual modeler backed");
    expect(readme).not.toMatch(/The [^\n.]* source of truth is `docs\//);
    expect(readme).not.toContain("The revised roadmap is in `docs/roadmap.md`");
    expect(agents).not.toMatch(/(?:A0B|GW9) is next/);
    expect(agents).not.toContain("GW9 remains paused");
  });

  it("reserves current source-of-truth status labels for the four canonical documents", () => {
    const authorities = markdownFiles(join(repoRoot, "docs"))
      .filter((path) => /^Status: .*source of truth/m.test(source(path)))
      .map((path) => path.slice(repoRoot.length + 1))
      .sort();

    expect(authorities).toEqual([
      "docs/ARCHITECTURE.md",
      "docs/CAPABILITIES.md",
      "docs/ROADMAP.md",
      "docs/SCIENTIFIC_MODEL.md"
    ]);
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
    expect(scientificModel).toContain("`SUPPORTED_WITHIN_MODEL_SCOPE`");
    expect(scientificModel).toContain("`REJECTED_WITHIN_MODEL_SCOPE`");
    expect(scientificModel).toContain("`INCONCLUSIVE`");
    expect(scientificModel).toContain("protected-class inference");
    expect(scientificModel).toContain("persuasion optimization or microtargeting");
    expect(scientificModel).toContain("LLM-per-agent");
  });
});

describe("A0 scoped architecture lint", () => {
  it("passes a clean bounded fixture", async () => {
    const root = fixtureRoot();
    write(root, "src/simulation/kernel/clean.ts", "setTimeout(() => undefined, 0); export const deterministicValue = Math.max(1, 0);\n");
    write(
      root,
      "src/components/Clean.tsx",
      "export function Clean() { return <><img alt=\"Model state\" /><div role=\"button\" tabIndex={0} onClick={() => undefined} onKeyDown={() => undefined}>Open</div></>; }\n"
    );

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
    expect(output).toContain("research code imports simulation authority");
    expect(output).toContain("requires role, tabIndex, and a keyboard handler");
  });

  it("rejects realistic re-export, module-load, indirect-execution, randomness, platform, research, and focus bypasses", async () => {
    const root = fixtureRoot();
    write(root, "src/simulation/reexport.ts", 'export { AppShell } from "../components/AppShell.tsx";\n');
    write(root, "src/simulation/required.ts", 'export const ui = require("../components/AppShell");\n');
    write(
      root,
      "src/simulation/random.ts",
      [
        'export const bracketed = Math["random"]();',
        "export const globalBracketed = globalThis.Math.random();",
        "export const { random: aliasedRandom } = Math;",
        "const mathAlias = Math; export const escapedRandom = mathAlias.random();",
        'export const storage = globalThis["localStorage"];',
        "export const { document: documentAlias } = globalThis;"
      ].join("\n")
    );
    write(
      root,
      "src/components/Dynamic.ts",
      [
        'globalThis.eval("void 0");',
        'globalThis["Function"]("return 1")();',
        'const evalAlias = eval; evalAlias("void 0");',
        'const functionAlias = globalThis.Function; functionAlias("return 1")();',
        "const requireAlias = require; void requireAlias;",
        'setTimeout("void 0", 0);',
        'globalThis["setInterval"]("void 0", 0);',
        'module["require"]("./legacy");',
        'export const deferred = import("./payload");'
      ].join("\n")
    );
    write(root, "src/research/barrel.ts", 'import { SimulationEngine } from "../simulation"; export { SimulationEngine };\n');
    write(root, "src/research/runtime.ts", 'export * from "../simulation/runtime/RuntimeSession.ts";\n');
    write(
      root,
      "src/components/BadFocus.tsx",
      'export function BadFocus() { return <div role="presentation" tabIndex={-1} onClick={() => undefined} onKeyDown={() => undefined}>Open</div>; }\n'
    );

    const result = await runArchitectureLint(root);
    const output = result.issues.join("\n");

    expect(output).toContain("simulation implementation imports forbidden UI layer");
    expect(output).toContain("CommonJS require is forbidden");
    expect(output).toContain("runtime dynamic imports are forbidden");
    expect(output.match(/seeded RandomService streams/g)?.length).toBeGreaterThanOrEqual(4);
    expect(output).toContain("browser-storage globals");
    expect(output.match(/dynamic code execution is forbidden/g)?.length).toBeGreaterThanOrEqual(6);
    expect(output.match(/research code imports simulation authority/g)?.length).toBe(2);
    expect(output).toContain("requires an interactive role");
    expect(output).toContain("requires a non-negative tabIndex");
  });
});

function source(path: string): string {
  return readFileSync(path, "utf8");
}

function markdownFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() ? markdownFiles(path) : path.endsWith(".md") ? [path] : [];
  });
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
