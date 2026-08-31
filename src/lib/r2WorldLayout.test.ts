import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  defaultSimulationWorkspaceModeId,
  simulationWorkspaceModeFromQuery,
  simulationWorkspaceModeQueryValue,
  simulationWorkspaceModes
} from "./workspaceModes";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

const r2ProductionFiles = [
  "src/app/world/page.tsx",
  "src/components/AppShell.tsx",
  "src/components/LeftInstrumentStack.tsx",
  "src/components/RunSettingsPanel.tsx",
  "src/components/WorldObservePanel.tsx",
  "src/components/InterventionPanel.tsx",
  "src/components/WorldComparePanel.tsx",
  "src/components/ModelExplanationPanel.tsx",
  "src/components/ui/ModalSurface.tsx",
  "src/lib/worldPresentation.ts",
  "src/lib/worldExplanation.ts"
] as const;

describe("R2 World layout and interaction reclaim contracts", () => {
  it("keeps the common task order direct and expert tools grouped by purpose", () => {
    expect(simulationWorkspaceModes.map(({ id, label }) => ({ id, label }))).toEqual([
      { id: "setup", label: "Setup" },
      { id: "observe", label: "Observe" },
      { id: "intervene", label: "Change" },
      { id: "compare", label: "Compare" },
      { id: "understand", label: "Explain" },
      { id: "experiment", label: "Experiments" },
      { id: "debug", label: "Diagnostics" }
    ]);

    const ownership = Object.fromEntries(simulationWorkspaceModes.map((mode) => [mode.id, mode.panelIds]));
    expect(ownership).toMatchObject({
      setup: ["neuralLab", "runSettings", "scenarios"],
      observe: ["metrics", "legend"],
      intervene: ["interventions"],
      compare: ["comparisons", "file"],
      understand: ["assumptions", "notes"],
      experiment: ["experiments"],
      debug: ["debug"]
    });
  });

  it("parses task URLs conservatively and preserves the public Change query alias", () => {
    expect(defaultSimulationWorkspaceModeId).toBe("setup");
    expect(simulationWorkspaceModeFromQuery(undefined)).toBeUndefined();
    expect(simulationWorkspaceModeFromQuery("change")).toBe("intervene");
    expect(simulationWorkspaceModeFromQuery("understand")).toBe("understand");
    expect(simulationWorkspaceModeFromQuery("invalid-task")).toBeUndefined();
    expect(simulationWorkspaceModeQueryValue("setup")).toBeNull();
    expect(simulationWorkspaceModeQueryValue("intervene")).toBe("change");
    expect(simulationWorkspaceModeQueryValue("understand")).toBe("understand");

    const route = source("src/app/world/page.tsx");
    expect(route).toContain("simulationWorkspaceModeFromQuery(task)");
    expect(route).not.toContain('task === "');
  });

  it("keeps the stage and playback mounted outside task rendering while collapse remains local", () => {
    const shell = source("src/components/AppShell.tsx");
    const tasks = source("src/components/LeftInstrumentStack.tsx");

    expect(shell.indexOf("<WorldStage />")).toBeLessThan(shell.indexOf("<LeftInstrumentStack"));
    expect(shell.indexOf("<TimelineControlStrip />")).toBeLessThan(shell.indexOf("<LeftInstrumentStack"));
    expect(shell).toContain("const [toolsHidden, setToolsHidden] = useState(false)");
    expect(shell).toContain('data-tools-state={toolsHidden ? "hidden" : "visible"}');
    expect(shell).toContain('window.history.pushState(window.history.state, "", nextHref)');
    expect(shell).toContain('window.addEventListener("popstate", syncWorkspaceModeFromHistory)');
    expect(shell).toContain('window.history.replaceState(window.history.state, "", canonicalHref)');
    expect(shell).not.toContain("router.replace(");
    expect(tasks).toContain("hidden={toolsHidden}");
    expect(tasks).toContain("Focus world");
    expect(tasks).toContain("Show tools");
    expect(tasks).toContain("renderWorkspaceMode(activeMode, chooseMode, !toolsHidden)");
    expect(source("src/components/WorldObservePanel.tsx")).toContain("active ? runtime.metricsHistory : []");
    expect(source("src/components/NeuralRuntimeLabPanel.tsx")).toContain("if (!active)");
    expect(tasks).not.toContain("localStorage");
    expect(tasks).not.toContain("sessionStorage");
  });

  it("adds no persistence or arbitrary execution path to the R2 presentation layer", () => {
    const combined = r2ProductionFiles.map(source).join("\n");

    expect(combined).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|createJSONStorage|persist\(/i);
    expect(combined).not.toMatch(/eval\(|new Function|Math\.random|dynamic import|chatCompletion|embedding/i);
    expect(source("src/lib/worldPresentation.ts")).not.toMatch(/setParameter|setSeed|createEngine|SimulationEngine|runSteps|executeIntervention/);
  });

  it("keeps the medium workspace side by side and mobile stage first", () => {
    const css = source("src/app/globals.css");

    expect(css).toContain('grid-template-areas: "tasks stage tools";');
    expect(css).toContain('grid-template-areas: "tasks stage";');
    expect(css).toContain("grid-template-columns: 64px minmax(0, 1fr) minmax(320px, 350px);");
    expect(css).toContain("grid-template-columns: 56px minmax(0, 1fr) minmax(290px, 312px);");
    expect(css).toContain('"stage"\n      "tasks"\n      "tools"');
    expect(css).toContain("@media (max-height: 650px) and (min-width: 761px)");
    expect(css).toContain("@media (max-width: 430px)");
  });

  it("keeps full notes and technical run details in focus-managed modal surfaces", () => {
    const modal = source("src/components/ui/ModalSurface.tsx");
    const explanation = source("src/components/ModelExplanationPanel.tsx");
    const shell = source("src/components/AppShell.tsx");

    expect(modal).toContain("dialog.showModal()");
    expect(modal).toContain("onCancel=");
    expect(modal).toContain("returnFocusRef?.current?.focus()");
    expect(modal).toContain("onKeyDown={containKeyboardFocus}");
    expect(modal).toContain("{open ? children : null}");
    expect(modal).toContain("tabIndex={0}");
    expect(modal).toContain('aria-label={`${title} content`}');
    expect(explanation).toContain('eyebrow="Full model reference"');
    expect(explanation).toContain("Complete assumptions");
    expect(explanation).toContain("Complete limitations");
    expect(explanation).toContain("Model-output metrics");
    expect(shell).toContain('title="Technical run details"');
  });

  it("preserves historical roadmap evidence while recording the completed A0B handoff", () => {
    const roadmap = source("planned_roadmap.md");
    const context = source("docs/codex/CURRENT_CONTEXT.md");

    for (const record of [roadmap, context]) {
      expect(record).toContain("R1 complete");
      expect(record).toContain("R1B complete");
      expect(record).toContain("R2 complete");
      expect(record).toContain("R2B complete");
      expect(record).toContain("C1 complete");
      expect(record).toContain("C1B complete");
      expect(record).toContain("C2 complete");
      expect(record).toContain("C2B complete");
      expect(record).toContain("C3 complete");
      expect(record).toContain("C3B complete");
      expect(record).toContain("I0 complete");
      expect(record).toContain("I0B complete");
      expect(record).toContain("PERF1 complete");
    }
    expect(context).toContain("WORLD_LAYOUT_AND_INTERACTION_RECLAIM_AUDIT.md");
    expect(context).toContain("STARTER_WORLD_CONTENT_FRAMEWORK_AUDIT.md");
    expect(context).toContain("IMMERSIVE_WORLD_DIRECTION_AUDIT.md");
    expect(context).toContain("PERF1B complete.");
    expect(context).toContain("A0: Canonical Architecture + Source-of-Truth Consolidation is complete");
    expect(context).toContain("A0B: Canonical Architecture + Source-of-Truth Audit is complete");
    expect(context).toContain("I1: Production Runtime Migration + Immersive Shell Foundation is complete");
    expect(context).toContain("I1B: Production Runtime + Immersive Shell Audit is complete");
    expect(context).toContain("UR0 technical/expert gate: complete. UR0 human comprehension gate: pending.");
    expect(context).toContain("S1 Starter -> Remix Bridge is complete.");
    expect(context).toContain("S1B Starter -> Remix Bridge Audit is next / unstarted.");
    expect(context).toContain("I2 through I5B are not an unconditional contiguous sequence; C4 has no I5B dependency");
    expect(context).not.toMatch(/F1 (?:is next|resumed|in progress)/i);
  });
});
