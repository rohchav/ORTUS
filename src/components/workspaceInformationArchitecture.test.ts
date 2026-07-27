import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { simulationWorkspaceModes } from "../lib/workspaceModes";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

function cssBlocks(selector: string): string {
  const css = source("src/app/globals.css");
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
  return [...css.matchAll(new RegExp(`${escaped}\\s*\\{(?<body>[^}]*)\\}`, "gm"))]
    .map((match) => match.groups?.body ?? "")
    .join("\n");
}

describe("simulation workspace information architecture", () => {
  it("defines the required workflow modes and assigns each retained tool surface to one mode", () => {
    expect(simulationWorkspaceModes.map((mode) => mode.id)).toEqual([
      "setup",
      "observe",
      "intervene",
      "compare",
      "understand",
      "experiment",
      "debug"
    ]);

    const panels = new Set(simulationWorkspaceModes.flatMap((mode) => mode.panelIds));
    expect(panels).toEqual(
      new Set([
        "neuralLab",
        "runSettings",
        "scenarios",
        "assumptions",
        "notes",
        "metrics",
        "legend",
        "interventions",
        "experiments",
        "comparisons",
        "file",
        "debug"
      ])
    );
  });

  it("uses direct task controls plus a keyboard-operable More menu and renders only the selected mode group", () => {
    const leftStack = source("src/components/LeftInstrumentStack.tsx");

    expect(leftStack).toContain('aria-label="World tasks"');
    expect(leftStack).toContain("aria-pressed={candidate.id === activeMode}");
    expect(leftStack).toContain('aria-haspopup="menu"');
    expect(leftStack).toContain('role="menu"');
    expect(leftStack).toContain('role="menuitem"');
    expect(leftStack).toContain('event.key === "ArrowDown"');
    expect(leftStack).toContain('event.key === "ArrowUp"');
    expect(leftStack).toContain('event.key === "ArrowLeft"');
    expect(leftStack).toContain('event.key === "ArrowRight"');
    expect(leftStack).toContain('event.key === "Home"');
    expect(leftStack).toContain('event.key === "End"');
    expect(leftStack).toContain('event.key === "Escape"');
    expect(leftStack).toContain("moreTriggerRef.current?.focus()");
    expect(leftStack).toContain("renderWorkspaceMode(activeMode, chooseMode, !toolsHidden)");
    expect(leftStack).toContain('{ id: "understand", label: "Explain" }');
    expect(leftStack).toContain('group: "Investigate"');
    expect(leftStack).toContain('group: "Inspect"');
    expect(leftStack).toContain('case "setup"');
    expect(leftStack).toContain('case "understand"');
    expect(leftStack).toContain('case "observe"');
    expect(leftStack).toContain('case "intervene"');
    expect(leftStack).toContain('case "experiment"');
    expect(leftStack).toContain('case "compare"');
    expect(leftStack).toContain('case "debug"');
    expect(leftStack).not.toContain("<TimelineControlStrip");
    expect(leftStack).not.toContain("useSimulationStore");
    expect(leftStack).not.toContain("latestSnapshot");
    expect(leftStack).not.toContain("SimulationEngine");
  });

  it("keeps navigation state local and preserves the world while switching modes", () => {
    const appShell = source("src/components/AppShell.tsx");

    expect(appShell).toContain("useState<SimulationWorkspaceModeId>(");
    expect(appShell).toContain("initialWorkspaceMode ?? defaultSimulationWorkspaceModeId");
    expect(appShell).toContain("activeMode={activeWorkspaceMode}");
    expect(appShell).toContain("onModeChange={changeWorkspaceMode}");
    expect(appShell).toContain("toolsHidden={toolsHidden}");
    expect(appShell).toContain("function changeWorkspaceMode(mode: SimulationWorkspaceModeId)");
    expect(appShell).toContain("simulationWorkspaceModeQueryValue(mode)");
    expect(appShell).toContain('query.set("task", task)');
    expect(appShell).toContain('query.delete("task")');
    expect(appShell).toContain('window.history.pushState(window.history.state, "", nextHref)');
    expect(appShell).toContain('window.addEventListener("popstate", syncWorkspaceModeFromHistory)');
    expect(appShell).not.toContain("router.replace(");
    expect(appShell).toContain("<WorldStage />");
    expect(appShell).toContain("<RightContextDrawer />");
    expect(appShell).toContain("<TimelineControlStrip />");
    expect(appShell).toContain('data-tools-state={toolsHidden ? "hidden" : "visible"}');
    expect(appShell).toContain("<ModalSurface");
    expect(appShell).toContain("<RunProvenanceObservationPanel embedded />");
    expect(appShell.indexOf("<WorldStage />")).toBeLessThan(appShell.indexOf("<LeftInstrumentStack"));
    expect(appShell.indexOf("<TimelineControlStrip />")).toBeLessThan(appShell.indexOf("<LeftInstrumentStack"));
    expect(appShell).not.toContain("setActiveWorkspaceMode: useSimulationStore");
  });

  it("moves model, seed, parameter, and export work out of the crowded header without removing them", () => {
    const topStatus = source("src/components/TopStatusBar.tsx");
    const destinationNav = source("src/components/researchWorld/ResearchDestinationNavigation.tsx");
    const runSettings = source("src/components/RunSettingsPanel.tsx");
    const compare = source("src/components/WorldComparePanel.tsx");

    expect(destinationNav).toContain('aria-label="Primary navigation"');
    expect(destinationNav).toContain("primaryDestinations.map");
    expect(destinationNav).toContain("researchTools.map");
    expect(destinationNav).toContain("aria-current={current ? \"page\" : undefined}");
    expect(topStatus).toContain("Current simulation context");
    expect(topStatus).not.toContain("OrtusBrand");
    expect(topStatus).not.toContain('href="/builder"');
    expect(topStatus).toContain("descriptor.template.name");
    expect(topStatus).toContain("scenarioName");
    expect(topStatus).toContain("StatusPill");
    expect(topStatus).toContain("Run details");
    expect(topStatus).not.toContain("FileActions");
    expect(topStatus).not.toContain("seedDraft");
    expect(topStatus).not.toContain("regenerateSeed");
    expect(topStatus).not.toContain("selectTemplate");

    expect(runSettings).toContain("selectTemplate");
    expect(runSettings).toContain("setSeed");
    expect(runSettings).toContain("generateUiSeed");
    expect(runSettings).toContain("Rebuild run with parameter drafts");
    expect(runSettings).toContain("<ParameterPanel");
    expect(runSettings).toContain("includeKeys={quickParameterKeys}");
    expect(runSettings).toContain("excludeKeys={quickParameterKeys}");
    expect(runSettings).toContain("<NeuralRuntimeLabPanel active={active && view === \"neural\"} />");
    expect(runSettings).toContain("<ScenarioBuilderPanel />");
    expect(compare).toContain("<FileActions />");
  });

  it("keeps persistent run controls accessible, visible, and outside scrollable workspace content", () => {
    const timeline = source("src/components/TimelineControlStrip.tsx");
    const css = source("src/app/globals.css");

    expect(timeline).toContain('data-workspace-region="runControlDock"');
    expect(timeline).toContain("Persistent simulation playback controls");
    expect(timeline).toContain('label={isRunning ? "Pause" : "Run"}');
    expect(timeline).toContain('label="Step"');
    expect(timeline).toContain('label={resetArmed ? "Confirm Reset" : "Reset"}');
    expect(timeline).toContain("const resetIsDestructive");
    expect(timeline).toContain("interventionHistory.length");
    expect(timeline).toContain("Confirm reset and discard current run state");
    expect(timeline).toContain("Confirm Reset to rebuild a fresh tick-0 run");
    expect(timeline).toContain("ariaLabel");
    expect(cssBlocks(".timeline-strip")).toContain("position: relative;");
    expect(cssBlocks(".timeline-strip")).not.toContain("position: sticky;");
    expect(cssBlocks(".timeline-strip__warning")).toContain("grid-column: 1 / -1;");
    expect(css).not.toMatch(/\.left-instruments\s*\{[^}]*overflow-y:\s*auto;/m);
  });

  it("removes fixed-height header clipping sources and preserves visible global navigation", () => {
    const topStatus = cssBlocks(".top-status");
    const topStatusSource = source("src/components/TopStatusBar.tsx");
    const destinationNavSource = source("src/components/researchWorld/ResearchDestinationNavigation.tsx");

    expect(topStatus).toContain("min-height: 44px;");
    expect(topStatus).toContain("overflow: visible;");
    expect(topStatus).not.toContain("height: 50px;");
    expect(topStatus).not.toContain("overflow-y: hidden;");
    expect(destinationNavSource).toContain("primaryDestinations.map");
    expect(destinationNavSource).toContain('aria-label="Primary navigation"');
    expect(topStatusSource).toContain("Current simulation context");
    expect(topStatusSource).toContain("Current run status");
    expect(topStatusSource).not.toContain("Simulate");
    expect(topStatusSource).not.toContain('href="/builder"');
    expect(topStatusSource).not.toContain(">Run Model<");
    expect(topStatusSource).not.toContain(">Compile<");
    expect(topStatusSource).not.toContain(">Apply to Template<");
  });

  it("keeps Apply, Regenerate, Reset, and metric-trace semantics explicit", () => {
    const runSettings = source("src/components/RunSettingsPanel.tsx");
    const parameterPanel = source("src/components/ParameterPanel.tsx");
    const metricGraph = source("src/components/MetricGraphPanel.tsx");

    expect(runSettings).toContain("New Seed");
    expect(runSettings).toContain("aria-label=\"Apply Seed and rebuild a fresh run\"");
    expect(runSettings).toContain("aria-label=\"New Seed: generate a seed draft\"");
    expect(parameterPanel).toContain("Parameter edits remain drafts until you explicitly rebuild");
    expect(parameterPanel).toContain("unsupported combinations are rejected before the engine is replaced");
    expect(metricGraph).toContain("bounded model-output history over simulated ticks");
    expect(metricGraph).toContain("not empirical measurement");
    expect(metricGraph).toContain("Metric history line chart of model-output values over simulated ticks");
  });
});
