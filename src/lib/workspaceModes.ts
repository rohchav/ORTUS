export const simulationWorkspaceModeIds = ["setup", "understand", "observe", "intervene", "experiment", "compare", "debug"] as const;

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
    eyebrow: "Model + scenario",
    description: "Choose the template, seed, parameters, and initial-condition recipe for a fresh run.",
    panelIds: ["runSettings", "scenarios"]
  },
  {
    id: "understand",
    label: "Understand",
    eyebrow: "Assumptions",
    description: "Read model boundaries, limitations, validation status, ethics notes, and explanatory field notes.",
    panelIds: ["assumptions", "notes"]
  },
  {
    id: "observe",
    label: "Observe",
    eyebrow: "Runtime output",
    description: "Inspect current run outputs, metric traces, local rules, and the visual legend.",
    panelIds: ["macro", "micro", "metrics", "legend"]
  },
  {
    id: "intervene",
    label: "Intervene",
    eyebrow: "Perturb",
    description: "Apply template-defined perturbations through validated engine paths.",
    panelIds: ["interventions"]
  },
  {
    id: "experiment",
    label: "Experiment",
    eyebrow: "Sweeps",
    description: "Run bounded local parameter sweeps with fresh engines and final-metric results.",
    panelIds: ["experiments"]
  },
  {
    id: "compare",
    label: "Compare",
    eyebrow: "Results + export",
    description: "Capture run summaries, compare saved outcomes, and exchange scenario or snapshot artifacts.",
    panelIds: ["comparisons", "file"]
  },
  {
    id: "debug",
    label: "Debug",
    eyebrow: "Diagnostics",
    description: "Inspect runtime diagnostics and performance counters without covering the world viewport.",
    panelIds: ["debug"]
  }
] as const;

export function getSimulationWorkspaceMode(id: SimulationWorkspaceModeId): SimulationWorkspaceModeDefinition {
  return simulationWorkspaceModes.find((mode) => mode.id === id) ?? simulationWorkspaceModes[0]!;
}

export function isSimulationWorkspaceModeId(value: unknown): value is SimulationWorkspaceModeId {
  return typeof value === "string" && (simulationWorkspaceModeIds as readonly string[]).includes(value);
}
