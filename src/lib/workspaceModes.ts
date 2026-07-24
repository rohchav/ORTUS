export const simulationWorkspaceModeIds = ["setup", "observe", "intervene", "compare", "understand", "experiment", "debug"] as const;

export type SimulationWorkspaceModeId = (typeof simulationWorkspaceModeIds)[number];

export interface SimulationWorkspaceModeDefinition {
  id: SimulationWorkspaceModeId;
  label: string;
  eyebrow: string;
  description: string;
  panelIds: readonly string[];
}

export const defaultSimulationWorkspaceModeId: SimulationWorkspaceModeId = "setup";

export const simulationWorkspaceModes: readonly SimulationWorkspaceModeDefinition[] = [
  {
    id: "setup",
    label: "Setup",
    eyebrow: "Prepare the world",
    description: "Choose the world, starting recipe, seed, and high-value controls for a fresh run.",
    panelIds: ["neuralLab", "runSettings", "scenarios"]
  },
  {
    id: "observe",
    label: "Observe",
    eyebrow: "Read the run",
    description: "Follow the most useful current outputs, bounded traces, and visual signals.",
    panelIds: ["metrics", "legend"]
  },
  {
    id: "intervene",
    label: "Change",
    eyebrow: "Perturb the run",
    description: "Apply supported current-run changes and distinguish them from fresh-run setup.",
    panelIds: ["interventions"]
  },
  {
    id: "compare",
    label: "Compare",
    eyebrow: "Inspect differences",
    description: "Capture bounded run summaries, compare outcomes, and reach scenario or snapshot exchange.",
    panelIds: ["comparisons", "file"]
  },
  {
    id: "understand",
    label: "Explain",
    eyebrow: "Model reference",
    description: "Read the question, mechanism, signals, assumptions, and primary limitation.",
    panelIds: ["assumptions", "notes"]
  },
  {
    id: "experiment",
    label: "Experiments",
    eyebrow: "Investigate",
    description: "Run bounded local parameter sweeps with fresh engines and final-metric results.",
    panelIds: ["experiments"]
  },
  {
    id: "debug",
    label: "Diagnostics",
    eyebrow: "Inspect",
    description: "Inspect exact runtime counters and instrumentation without changing the model.",
    panelIds: ["debug"]
  }
] as const;

export function getSimulationWorkspaceMode(id: SimulationWorkspaceModeId): SimulationWorkspaceModeDefinition {
  return simulationWorkspaceModes.find((mode) => mode.id === id) ?? simulationWorkspaceModes[0]!;
}

export function isSimulationWorkspaceModeId(value: unknown): value is SimulationWorkspaceModeId {
  return typeof value === "string" && (simulationWorkspaceModeIds as readonly string[]).includes(value);
}

export function simulationWorkspaceModeFromQuery(value: string | undefined): SimulationWorkspaceModeId | undefined {
  if (value === "change") {
    return "intervene";
  }
  return isSimulationWorkspaceModeId(value) ? value : undefined;
}

export function simulationWorkspaceModeQueryValue(mode: SimulationWorkspaceModeId): string | null {
  if (mode === "setup") {
    return null;
  }
  return mode === "intervene" ? "change" : mode;
}
