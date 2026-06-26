import type { StatusPillCategory, StatusPillState, StatusPillTone } from "./ui/statusPillSemantics";

export interface RunStatusPillModel {
  label: "Running" | "Paused";
  tone: StatusPillTone;
  category: StatusPillCategory;
  state: Extract<StatusPillState, "running" | "paused">;
}

export function getRunStatusPillModel(isRunning: boolean): RunStatusPillModel {
  return {
    label: isRunning ? "Running" : "Paused",
    tone: isRunning ? "accent" : "neutral",
    category: "operational",
    state: isRunning ? "running" : "paused"
  };
}
