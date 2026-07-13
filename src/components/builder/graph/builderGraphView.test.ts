import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

describe("Visual Builder Graph View UI", () => {
  it("integrates a third accessible Builder mode without replacing Workspace Inspector or Author Schema", () => {
    const source = readGraphAndBuilderSource();
    expect(source).toContain("Workspace Inspector");
    expect(source).toContain("Author Schema");
    expect(source).toContain("Graph View");
    expect(source).toContain('id="builder-mode-panel-graph"');
    expect(source).toContain('role="tabpanel"');
    expect(source).toContain('aria-labelledby="builder-mode-tab-graph"');
    expect(source).toContain('{activeMode === "graph" ? <BuilderGraphView workspace={workspace} /> : null}');
    expect(source).toContain("<ModelSchemaAuthoringShell");
    expect(source).toContain('hidden={activeMode !== "authorSchema"}');
  });

  it("keeps structural-only and non-runnable language adjacent to the graph", () => {
    const source = readGraphAndBuilderSource();
    for (const phrase of [
      "Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges.",
      "Graph View is read-only. It visualizes structural relationships and does not execute nodes or edges.",
      "Graph View is not visual programming, schema execution, or runtime generation.",
      "Workspace nodes and edges are visual descriptors, not executable dataflow.",
      "A structurally valid workspace is still not a runnable model.",
      "A graph that looks complete is still not a runnable model.",
      "Graph selection, filtering, panning, and zooming are UI-only state.",
      "Edges are never executable dataflow.",
      "not executable"
    ]) {
      expect(source).toContain(phrase);
    }
    expect(source).toContain('role="note"');
    expect(source).not.toContain('aria-label="Graph View runtime boundary" role="status"');
  });

  it("provides labeled search, filters, viewport controls, outline, edge list, inspector, and honest counts", () => {
    const source = readGraphAndBuilderSource();
    for (const phrase of [
      "Search id, label, kind, or status",
      "Node kind",
      "Node status",
      "Warning status",
      "Show future-only items",
      "Show unsupported items",
      "Highlight selected connections",
      "Reset Filters",
      "Pan graph left",
      "Pan graph right",
      "Pan graph up",
      "Pan graph down",
      "Zoom graph out",
      "Zoom graph in",
      "Fit Graph",
      "Reset View",
      "Visual viewport controls are unavailable in outline-only mode.",
      "Graph Outline",
      "Accessible relationship list",
      "Graph Inspector",
      "Validation markers",
      "Warning markers",
      "Unsupported items",
      "Unsupported markers",
      "Future-only items / markers",
      "Service-only items",
      "Runtime-boundary notices",
      "Markers, notices, and unavailable capabilities"
    ]) {
      expect(source).toContain(phrase);
    }
  });

  it("exposes keyboard and text alternatives instead of relying on SVG or color alone", () => {
    const source = readGraphAndBuilderSource();
    expect(source).toContain("ArrowRight");
    expect(source).toContain("ArrowLeft");
    expect(source).toContain('aria-label="Graph outline grouped by node kind"');
    expect(source).toContain('aria-label="Structural graph edges as text"');
    expect(source).toContain('aria-label="Selected graph item inspector"');
    expect(source).toContain("tabIndex={0}");
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-describedby="builder-graph-description"');
    expect(source).toContain('aria-pressed={selected}');
    expect(source).toContain("warning markers");
    expect(source).toContain("structural relation");
    expect(source).toContain("Structural node ·");
    expect(source).toContain("Structural relation ·");
    expect(source).toContain("hidden by current filters");
    expect(source).toContain('className="sr-only"');
  });

  it("has bounded visual fallback and responsive single-column source styling", () => {
    const source = readGraphAndBuilderSource();
    const css = readFileSync(join(repoRoot, "src", "app", "globals.css"), "utf8");
    expect(source).toContain("Visual graph limited for this artifact");
    expect(source).toContain("Use the filtered Graph Outline and Edges list.");
    expect(css).toMatch(/@media \(max-width: 1120px\)[\s\S]*?\.builder-graph-mode__layout[\s\S]*?grid-template-columns: 1fr/);
    expect(css).toContain(".builder-graph-sidebar");
    expect(css).toContain(".builder-graph-inspector-column");
    expect(css).toContain(".builder-graph-node.is-dimmed");
    expect(css).toContain(".builder-graph-edge-layer path.is-dimmed");
    expect(css).toContain(".builder-graph-inspector:focus-visible");
    expect(css).toContain("min-height: 38px");
  });

  it("contains no authoring, execution, runtime, unsafe rendering, external call, or major graph-library hooks", () => {
    const source = readGraphSource();
    const packageJson = readFileSync(join(repoRoot, "package.json"), "utf8");

    for (const forbidden of [
      "dangerouslySetInnerHTML",
      "eval(",
      "new Function",
      "URL.createObjectURL",
      "<iframe",
      "fetch(",
      "XMLHttpRequest",
      "WebSocket",
      "SimulationEngine",
      "useSimulationStore",
      "latestSnapshot",
      "socialLearning/",
      "simulation/templates",
      "simulation/scenarios",
      "simulation/snapshots",
      "onDrag",
      "draggable=",
      "connectHandle",
      "createEdge",
      "deleteNode",
      "deleteEdge"
    ]) {
      expect(source).not.toContain(forbidden);
    }
    expect(source).not.toMatch(/from ["']\.\.\/\.\.\/\.\.\/simulation["']/);
    expect(source).not.toMatch(/from ["'][^"']*schemaTemplateCompatibility[^"']*["']/);
    expect(source).not.toMatch(/from ["'][^"']*(reactflow|react-flow|cytoscape|d3|dagre|elkjs|mermaid)[^"']*["']/i);
    expect(packageJson).not.toMatch(/reactflow|react-flow|cytoscape|d3|dagre|elkjs|mermaid/i);
    expect(source).not.toMatch(/>\s*Run(?: Model)?\s*</);
    expect(source).not.toMatch(/>\s*Compile\s*</);
    expect(source).not.toMatch(/>\s*Preview\s*</);
    expect(source).not.toMatch(/>\s*Generate(?: Scenario| RunConfig| Template| Snapshot)?\s*</);
    expect(source).not.toMatch(/>\s*Apply(?: to Simulation)?\s*</);
  });
});

function readGraphAndBuilderSource(): string {
  return [
    readFileSync(join(repoRoot, "src", "components", "builder", "BuilderShell.tsx"), "utf8"),
    readFileSync(join(repoRoot, "src", "components", "builder", "BuilderHeader.tsx"), "utf8"),
    readFileSync(join(repoRoot, "src", "components", "builder", "BuilderModeTabs.tsx"), "utf8"),
    readGraphSource()
  ].join("\n");
}

function readGraphSource(): string {
  return readSourceTree(join(repoRoot, "src", "components", "builder", "graph"));
}

function readSourceTree(directory: string): string {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        return [readSourceTree(path)];
      }
      return (entry.endsWith(".ts") || entry.endsWith(".tsx")) && !entry.endsWith(".test.ts")
        ? [readFileSync(path, "utf8")]
        : [];
    })
    .join("\n");
}
