export const workspacePlacements = ["leftRail", "modePanel", "leftDrawer", "rightDrawer", "bottomDock", "floatingOverlay", "workspace"] as const;

export type WorkspacePanelPlacement = (typeof workspacePlacements)[number];

export const workspacePanelSizes = ["collapsed", "compact", "expanded", "drawer", "dock", "workspace"] as const;

export type WorkspacePanelSize = (typeof workspacePanelSizes)[number];

export interface WorkspacePanelDefinition {
  id: string;
  label: string;
  eyebrow: string;
  description?: string;
  defaultPlacement: WorkspacePanelPlacement;
  supportedPlacements: readonly WorkspacePanelPlacement[];
  defaultSize: WorkspacePanelSize;
  supportedSizes: readonly WorkspacePanelSize[];
  glyph?: string;
  order: number;
  workspaceCapable: boolean;
  analysisOriented: boolean;
  selectionContextual: boolean;
}

export const workspacePanelDefinitions: readonly WorkspacePanelDefinition[] = [
  {
    id: "runSettings",
    label: "Run Settings",
    eyebrow: "Fresh Run Setup",
    description: "Model, seed, and parameter controls that rebuild a fresh run through validation.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel"],
    defaultSize: "compact",
    supportedSizes: ["compact"],
    glyph: "RS",
    order: 5,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "micro",
    label: "Micro Field",
    eyebrow: "Local Rules",
    description: "Local agent rules and canvas avatar display preferences.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact"],
    glyph: "MI",
    order: 10,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "macro",
    label: "Macro Field",
    eyebrow: "Emergence",
    description: "Current aggregate metrics and model-level readouts.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact"],
    glyph: "MA",
    order: 20,
    workspaceCapable: false,
    analysisOriented: true,
    selectionContextual: false
  },
  {
    id: "metrics",
    label: "Metric Trace",
    eyebrow: "History",
    description: "Bounded metric history for the active run.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel", "bottomDock"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "dock"],
    glyph: "TR",
    order: 30,
    workspaceCapable: false,
    analysisOriented: true,
    selectionContextual: false
  },
  {
    id: "scenarios",
    label: "Scenario Builder",
    eyebrow: "Initial Conditions",
    description: "Author and apply initial-condition recipes for fresh runs.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel", "workspace"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "drawer", "workspace"],
    glyph: "SC",
    order: 40,
    workspaceCapable: true,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "interventions",
    label: "Interventions",
    eyebrow: "Perturb",
    description: "Apply validated deterministic perturbations during a run.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "drawer"],
    glyph: "IV",
    order: 50,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "assumptions",
    label: "Assumptions + Limits",
    eyebrow: "Model Boundary",
    description: "Structured assumptions, exclusions, validation status, and ethics notes.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel", "workspace"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "drawer", "workspace"],
    glyph: "AL",
    order: 55,
    workspaceCapable: true,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "experiments",
    label: "Experiment Runner",
    eyebrow: "Sweeps",
    description: "Run controlled local sweeps across seeds and parameters.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel", "workspace"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "drawer", "workspace"],
    glyph: "EX",
    order: 60,
    workspaceCapable: true,
    analysisOriented: true,
    selectionContextual: false
  },
  {
    id: "comparisons",
    label: "Run Comparison",
    eyebrow: "Workspace",
    description: "Compare saved run summaries, parameters, metrics, and interventions.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel", "bottomDock", "workspace"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "dock", "workspace"],
    glyph: "RC",
    order: 70,
    workspaceCapable: true,
    analysisOriented: true,
    selectionContextual: false
  },
  {
    id: "timeline",
    label: "Timeline",
    eyebrow: "Run Control",
    description: "Playback controls for the active run.",
    defaultPlacement: "bottomDock",
    supportedPlacements: ["bottomDock"],
    defaultSize: "dock",
    supportedSizes: ["compact", "dock"],
    glyph: "TL",
    order: 80,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "notes",
    label: "Field Notes",
    eyebrow: "Model Explanation",
    description: "Template assumptions, use notes, and limitations.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "drawer"],
    glyph: "FN",
    order: 90,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "file",
    label: "File Exchange",
    eyebrow: "JSON",
    description: "Import and export scenarios and snapshots.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "drawer"],
    glyph: "JS",
    order: 100,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "legend",
    label: "Legend",
    eyebrow: "Visual Key",
    description: "Template-specific visual mapping key.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel", "floatingOverlay"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact"],
    glyph: "LK",
    order: 110,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "debug",
    label: "Debug",
    eyebrow: "Runtime",
    description: "Headless engine runtime diagnostics.",
    defaultPlacement: "modePanel",
    supportedPlacements: ["modePanel", "rightDrawer"],
    defaultSize: "compact",
    supportedSizes: ["collapsed", "compact", "drawer"],
    glyph: "DB",
    order: 120,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: false
  },
  {
    id: "agentInspector",
    label: "Agent Inspector",
    eyebrow: "Selection",
    description: "Contextual details for the selected entity or future selected world object.",
    defaultPlacement: "rightDrawer",
    supportedPlacements: ["rightDrawer", "floatingOverlay"],
    defaultSize: "drawer",
    supportedSizes: ["drawer", "compact"],
    glyph: "AI",
    order: 130,
    workspaceCapable: false,
    analysisOriented: false,
    selectionContextual: true
  }
] as const;

export function getWorkspacePanelDefinition(panelId: string): WorkspacePanelDefinition | undefined {
  return workspacePanelDefinitions.find((panel) => panel.id === panelId);
}

export function panelsForPlacement(placement: WorkspacePanelPlacement): WorkspacePanelDefinition[] {
  return workspacePanelDefinitions
    .filter((panel) => panel.supportedPlacements.includes(placement))
    .sort((left, right) => left.order - right.order);
}

export function isWorkspacePanelPlacement(value: unknown): value is WorkspacePanelPlacement {
  return typeof value === "string" && (workspacePlacements as readonly string[]).includes(value);
}
