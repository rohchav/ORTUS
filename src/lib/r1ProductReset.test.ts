import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("R1 Start Hub and World-first product reset contracts", () => {
  it("assigns the root route to Start and the live workbench to World", () => {
    const rootRoute = source("src/app/page.tsx");
    const worldRoute = source("src/app/world/page.tsx");
    const layout = source("src/app/layout.tsx");

    expect(rootRoute).toContain('import { StartHub } from "../components/start/StartHub"');
    expect(rootRoute).toContain("return <StartHub />");
    expect(rootRoute).not.toContain("<AppShell");
    expect(worldRoute).toContain('import { AppShell } from "../../components/AppShell"');
    expect(worldRoute).toContain("<AppShell");
    expect(layout).toContain("<ResearchWorldShell>{children}</ResearchWorldShell>");
  });

  it("keeps the entry catalog and starter guidance presentation-only", () => {
    const startSource = [
      source("src/components/start/StartHub.tsx"),
      source("src/components/StarterActionNudge.tsx"),
      source("src/components/starterWorlds/ExploreWorldsCatalog.tsx"),
      source("src/components/starterWorlds/StarterWorldDetail.tsx")
    ].join("\n");

    expect(startSource).toContain("featured.hookQuestion");
    expect(startSource).toContain("runnableStarterWorlds.map");
    expect(startSource).toContain("world.investigationPrompts.map");
    expect(startSource).toContain("world.sources.map");
    expect(startSource).not.toMatch(
      /localStorage|sessionStorage|indexedDB|document\.cookie|createJSONStorage|persist\(|Date\.now|Math\.random|crypto\.randomUUID/i
    );
    expect(startSource).not.toMatch(
      /createEngine|runFrameSteps|selectTemplate\(|setParameters?|execute|compile|generateRunConfig|simulationStore/i
    );
  });

  it("defines the compact navigation hierarchy and complete keyboard menus", () => {
    const navigation = source("src/components/researchWorld/ResearchDestinationNavigation.tsx");
    const shell = source("src/components/researchWorld/ResearchWorldShell.tsx");
    const tasks = source("src/components/LeftInstrumentStack.tsx");

    for (const entry of [
      '{ label: "Start", href: "/", pathname: "/" }',
      '{ label: "World", href: "/world", pathname: "/world" }',
      '{ label: "Workshop", href: "/builder", pathname: "/builder" }',
      '{ label: "Atlas", href: "/atlas", pathname: "/atlas" }',
      '{ label: "Lab", href: "/lab", pathname: "/lab" }',
      'href: "/world?task=experiment"',
      'href: "/world?task=compare"'
    ]) {
      expect(navigation).toContain(entry);
    }
    expect(navigation).toContain('aria-haspopup="menu"');
    expect(navigation).toContain('event.key === "Escape"');
    expect(navigation).toContain("triggerRef.current?.focus()");
    expect(shell).toContain('import { Suspense, type ReactNode } from "react"');
    expect(shell).toContain("<Suspense fallback=");
    expect(shell).toContain("<ResearchDestinationNavigation />");

    for (const label of ["Setup", "Observe", "Change", "Compare", "Explain", "More", "Experiments", "Diagnostics"]) {
      expect(tasks).toContain(label);
    }
    expect(tasks).toContain('aria-label="World tasks"');
    expect(tasks).toContain('aria-label="More World tasks"');
  });

  it("keeps the live model and persistent controls ahead of the selected task workspace", () => {
    const shell = source("src/components/AppShell.tsx");
    const tasks = source("src/components/LeftInstrumentStack.tsx");
    const worldStageIndex = shell.indexOf("<WorldStage />");
    const timelineIndex = shell.indexOf("<TimelineControlStrip />");
    const taskIndex = shell.indexOf("<LeftInstrumentStack");

    expect(worldStageIndex).toBeGreaterThan(-1);
    expect(timelineIndex).toBeGreaterThan(worldStageIndex);
    expect(taskIndex).toBeGreaterThan(timelineIndex);
    expect(shell).toContain("const [activeWorkspaceMode, setActiveWorkspaceMode] = useState");
    expect(tasks).not.toMatch(/simulationStore|useSimulationStore/);
  });

  it("keeps Explain concise, model-specific, deduplicated, and available as a dedicated reference", () => {
    const explanation = source("src/components/ModelExplanationPanel.tsx");
    const renderedSurface = explanation.slice(explanation.indexOf("return ("), explanation.indexOf("function ExplanationSection"));

    for (const heading of ["Question", "How it works", "What to watch", "Try changing", "Key assumptions", "Main limitation"]) {
      expect(explanation).toContain(heading);
    }
    expect(explanation).toContain("Full model notes");
    expect(explanation).toContain("<ModalSurface");
    expect(explanation).toContain("const seen = new Set<string>()");
    expect(explanation).toContain("normalizeText");
    expect(renderedSurface).not.toMatch(
      /LLM agents|schema execution|visual builder|NetLogo|Mesa|MASON|template generation|social-learning artifacts/i
    );
  });

  it("preserves the product-reset record while deferring current status to the canonical roadmap", () => {
    const roadmap = source("docs/product/ORTUS_PRODUCT_EXPERIENCE_RESET_ROADMAP.md");
    const canonicalRoadmap = source("docs/ROADMAP.md");
    const milestones = [
      "R1", "R1B", "R2", "R2B",
      "C1", "C1B", "C2", "C2B", "C3", "C3B",
      "I0", "I0B", "PERF1", "PERF1B", "A0", "A0B", "I1", "I1B", "I2", "I2B", "I3", "I3B", "I4", "I4B", "I5", "I5B",
      "C4", "C4B",
      "S1", "S1B", "S2", "S2B", "S3", "S3B", "S4", "S4B", "S5", "S5B",
      "E1", "E1B", "E2", "E2B", "E3", "E3B"
    ];
    const positions = milestones.map((milestone) => roadmap.indexOf(`| ${milestone} |`));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(roadmap).toContain("Status: DEPRECATED/HISTORICAL for forward sequencing after A0");
    expect(roadmap).toContain("`../ROADMAP.md` is the canonical milestone/status source.");
    expect(roadmap).toContain("`C1B: Starter World Content Framework Audit` is complete.");
    expect(roadmap).toContain("`C2: Flagship Starter Pack One` is complete.");
    expect(roadmap).toContain("`C2B: Flagship Starter Pack One Audit + Hardening` is complete.");
    expect(roadmap).toContain("`C3: Guided Investigation / Tutorial World` and `C3B: Guided Investigation Audit + Hardening` are complete.");
    expect(roadmap).toContain("`PERF1B: Runtime Performance Architecture Audit + Hardening`, and A0 are complete.");
    expect(roadmap).toContain("A0B is next and unstarted.");
    expect(roadmap).toContain("I1 remains planned and unstarted after A0B.");
    expect(roadmap).toContain("C4 has no I5B dependency");
    expect(canonicalRoadmap).toContain("A0 - Canonical Architecture + Source-of-Truth Consolidation | COMPLETE");
    expect(canonicalRoadmap).toContain("A0B - Canonical Architecture + Source-of-Truth Audit | COMPLETE");
    expect(canonicalRoadmap).toContain("I1 - Production Runtime Migration + Immersive Shell Foundation | NEXT / UNSTARTED");
    expect(roadmap).toContain("F1 and the rest of the F branch are paused beneath E3 Analytical Lenses.");
  });
});
