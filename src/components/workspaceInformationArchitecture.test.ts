import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { simulationWorkspaceModes } from "../lib/workspaceModes";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

function cssBlock(selector: string): string {
  const css = source("src/app/globals.css");
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
  const match = css.match(new RegExp(`${escaped}\\s*\\{(?<body>[^}]*)\\}`, "m"));
  return match?.groups?.body ?? "";
}

describe("simulation workspace information architecture", () => {
  it("defines the required workflow modes and maps every former drawer feature to a reachable mode", () => {
    expect(simulationWorkspaceModes.map((mode) => mode.id)).toEqual([
      "setup",
      "understand",
      "observe",
      "intervene",
      "experiment",
      "compare",
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
        "runProvenance",
        "macro",
        "micro",
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

  it("uses semantic workspace tabs and renders only the selected mode group", () => {
    const leftStack = source("src/components/LeftInstrumentStack.tsx");

    expect(leftStack).toContain('role="tablist"');
    expect(leftStack).toContain('role="tab"');
    expect(leftStack).toContain("aria-selected={candidate.id === activeMode}");
    expect(leftStack).toContain('role="tabpanel"');
    expect(leftStack).toContain("onKeyDown={(event) => handleModeKeyDown(event, candidate.id)}");
    expect(leftStack).toContain('event.key === "ArrowRight"');
    expect(leftStack).toContain('event.key === "ArrowLeft"');
    expect(leftStack).toContain('event.key === "Home"');
    expect(leftStack).toContain('event.key === "End"');
    expect(leftStack).toContain("focusModeTab(nextMode.id)");
    expect(leftStack).toContain("renderWorkspaceMode(activeMode)");
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

    expect(appShell).toContain("useState<SimulationWorkspaceModeId>(defaultSimulationWorkspaceModeId)");
    expect(appShell).toContain("<LeftInstrumentStack activeMode={activeWorkspaceMode} onModeChange={setActiveWorkspaceMode} />");
    expect(appShell).toContain("<WorldStage />");
    expect(appShell).toContain("<RightContextDrawer />");
    expect(appShell).toContain("<TimelineControlStrip />");
    expect(appShell).not.toContain("setActiveWorkspaceMode: useSimulationStore");
  });

  it("moves model, seed, parameter, and export work out of the crowded header without removing them", () => {
    const topStatus = source("src/components/TopStatusBar.tsx");
    const destinationNav = source("src/components/researchWorld/ResearchDestinationNavigation.tsx");
    const runSettings = source("src/components/RunSettingsPanel.tsx");
    const leftStack = source("src/components/LeftInstrumentStack.tsx");

    expect(destinationNav).toContain('aria-label="Research World destinations"');
    expect(destinationNav).toContain("aria-current={current ? \"page\" : undefined}");
    expect(topStatus).toContain("World runtime");
    expect(topStatus).not.toContain("OrtusBrand");
    expect(topStatus).not.toContain('href="/builder"');
    expect(topStatus).toContain("descriptor.template.name");
    expect(topStatus).toContain("scenarioName");
    expect(topStatus).toContain("StatusPill");
    expect(topStatus).not.toContain("FileActions");
    expect(topStatus).not.toContain("seedDraft");
    expect(topStatus).not.toContain("regenerateSeed");
    expect(topStatus).not.toContain("selectTemplate");

    expect(runSettings).toContain("selectTemplate");
    expect(runSettings).toContain("setSeed");
    expect(runSettings).toContain("regenerateSeed");
    expect(runSettings).toContain("<ParameterPanel />");
    expect(leftStack).toContain("<NeuralRuntimeLabPanel />");
    expect(leftStack).toContain("<FileActions />");
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
    expect(cssBlock(".timeline-strip")).toContain("position: relative;");
    expect(cssBlock(".timeline-strip")).not.toContain("position: sticky;");
    expect(cssBlock(".timeline-strip__warning")).toContain("grid-column: 1 / -1;");
    expect(css).not.toMatch(/\.left-instruments\s*\{[^}]*overflow-y:\s*auto;/m);
  });

  it("removes fixed-height header clipping sources and preserves visible global navigation", () => {
    const topStatus = cssBlock(".top-status");
    const topStatusSource = source("src/components/TopStatusBar.tsx");
    const destinationNavSource = source("src/components/researchWorld/ResearchDestinationNavigation.tsx");

    expect(topStatus).toContain("min-height: 58px;");
    expect(topStatus).toContain("overflow: visible;");
    expect(topStatus).not.toContain("height: 50px;");
    expect(topStatus).not.toContain("overflow-y: hidden;");
    expect(destinationNavSource).toContain("researchDestinations.map");
    expect(destinationNavSource).toContain('aria-label="Research World destinations"');
    expect(topStatusSource).toContain("World runtime");
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

    expect(runSettings).toContain("Apply Seed rebuilds with the typed seed");
    expect(runSettings).toContain("Regenerate Seed");
    expect(runSettings).toContain("creates a new seed and fresh run");
    expect(runSettings).toContain("aria-label=\"Apply typed seed and rebuild a fresh run\"");
    expect(runSettings).toContain("aria-label=\"Generate a new seed and rebuild a fresh run\"");
    expect(parameterPanel).toContain("Parameter changes rebuild a fresh tick-0 run immediately");
    expect(metricGraph).toContain("Current aggregate values live in Macro Field");
    expect(metricGraph).toContain("bounded model-output history over simulated ticks");
    expect(metricGraph).toContain("not empirical measurement");
    expect(metricGraph).toContain("Metric history line chart of model-output values over simulated ticks");
  });
});
