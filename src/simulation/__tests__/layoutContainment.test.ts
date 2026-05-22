import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isWorkspacePanelPlacement, workspacePanelDefinitions, workspacePlacements, workspacePanelSizes } from "../../lib/workspacePanels";

const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
const appShellSource = readFileSync(new URL("../../components/AppShell.tsx", import.meta.url), "utf8");
const worldStageSource = readFileSync(new URL("../../components/WorldStage.tsx", import.meta.url), "utf8");

function cssBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
  const match = css.match(new RegExp(`${escaped}\\s*\\{(?<body>[^}]*)\\}`, "m"));
  return match?.groups?.body ?? "";
}

function expectDeclarations(block: string, declarations: string[]): void {
  for (const declaration of declarations) {
    expect(block).toContain(declaration);
  }
}

describe("viewport layout containment", () => {
  it("locks the app shell to the viewport and prevents document-level scroll", () => {
    expectDeclarations(cssBlock("html,\nbody"), ["height: 100%;", "overflow: hidden;"]);
    expectDeclarations(cssBlock(".ortus-shell"), [
      "height: 100dvh;",
      "overflow: hidden;",
      "display: grid;",
      "grid-template-rows: auto minmax(0, 1fr);"
    ]);
  });

  it("keeps expanded left panels inside the left rail scroll area", () => {
    expectDeclarations(cssBlock(".ortus-layout"), ["min-height: 0;", "overflow: hidden;", "display: grid;"]);
    expectDeclarations(cssBlock(".left-instruments"), ["min-height: 0;", "height: 100%;", "overflow-x: hidden;", "overflow-y: auto;"]);
  });

  it("defines future workspace regions without putting them in document flow", () => {
    expect(appShellSource).toContain("<TopStatusBar />");
    expect(appShellSource).toContain("<LeftInstrumentStack />");
    expect(appShellSource).toContain("<WorldStage />");
    expect(appShellSource).toContain("<RightContextDrawer />");
    expect(appShellSource).toContain("<BottomAnalysisDock />");
    expect(appShellSource).toContain("<WorkspaceMode />");

    expectDeclarations(cssBlock(".workspace-center"), ["min-height: 0;", "overflow: hidden;", "display: grid;"]);
    expectDeclarations(cssBlock(".world-workspace"), ["min-height: 0;", "overflow: hidden;", "display: grid;"]);
    expectDeclarations(cssBlock(".right-context-drawer"), ["position: absolute;", "overflow-y: auto;", "pointer-events: none;"]);
    expect(css).toContain('.bottom-analysis-dock[data-state="collapsed"]');
    expect(css).toContain("display: none;");
  });

  it("keeps the world stage and simulation canvas sized by their container", () => {
    const worldStage = cssBlock(".world-stage");
    expectDeclarations(worldStage, ["min-height: 0;", "height: 100%;", "overflow: hidden;"]);
    expect(worldStage).not.toContain("calc(100vh");

    expectDeclarations(cssBlock(".world-stage__frame"), ["min-height: 0;", "overflow: hidden;"]);
    expectDeclarations(cssBlock(".canvas-shell,\n.simulation-canvas"), ["width: 100%;", "height: 100%;"]);
  });

  it("keeps floating overlays absolute inside the world stage", () => {
    expect(worldStageSource).toContain('data-workspace-region="floatingOverlay"');
    expect(worldStageSource).toContain("<Legend />");
    expect(worldStageSource).toContain("<DebugPanel floating />");
    expect(worldStageSource).not.toContain("<AgentInspector");
    expectDeclarations(cssBlock(".floating-overlay-layer"), ["position: absolute;", "inset: 0;", "pointer-events: none;"]);
  });
});

describe("workspace panel placement metadata", () => {
  it("gives every panel a valid default placement, size, and supported placement list", () => {
    const ids = new Set<string>();

    for (const panel of workspacePanelDefinitions) {
      expect(panel.id).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
      expect(panel.label.trim()).toBe(panel.label);
      expect(panel.label.length).toBeGreaterThan(2);
      expect(panel.eyebrow.length).toBeGreaterThan(1);
      expect(isWorkspacePanelPlacement(panel.defaultPlacement)).toBe(true);
      expect(panel.supportedPlacements).toContain(panel.defaultPlacement);
      expect(workspacePanelSizes).toContain(panel.defaultSize);
      expect(panel.supportedSizes).toContain(panel.defaultSize);
      expect(panel.order).toBeGreaterThan(0);
      expect(ids.has(panel.id)).toBe(false);
      ids.add(panel.id);
    }

    expect(workspacePlacements).toEqual(["leftRail", "leftDrawer", "rightDrawer", "bottomDock", "floatingOverlay", "workspace"]);
  });

  it("marks large analytical modules as drawer, dock, or workspace capable without moving them out of the rail by default", () => {
    const byId = new Map(workspacePanelDefinitions.map((panel) => [panel.id, panel]));

    expect(byId.get("scenarios")?.defaultPlacement).toBe("leftRail");
    expect(byId.get("scenarios")?.supportedPlacements).toEqual(expect.arrayContaining(["leftDrawer", "workspace"]));
    expect(byId.get("assumptions")?.defaultPlacement).toBe("leftRail");
    expect(byId.get("assumptions")?.supportedPlacements).toEqual(expect.arrayContaining(["leftDrawer", "workspace"]));
    expect(byId.get("experiments")?.supportedPlacements).toEqual(expect.arrayContaining(["leftDrawer", "workspace"]));
    expect(byId.get("comparisons")?.supportedPlacements).toEqual(expect.arrayContaining(["bottomDock", "workspace"]));
    expect(byId.get("metrics")?.supportedPlacements).toEqual(expect.arrayContaining(["bottomDock"]));
    expect(byId.get("agentInspector")?.defaultPlacement).toBe("rightDrawer");
    expect(byId.get("agentInspector")?.selectionContextual).toBe(true);
  });
});
