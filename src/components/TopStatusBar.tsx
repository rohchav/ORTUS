"use client";

import Link from "next/link";
import { PhaseStateReadout } from "./PhaseStateReadout";
import { OrtusBrand } from "./branding";
import { getRunStatusPillModel } from "./runStatusSemantics";
import { StatusPill } from "./ui/StatusPill";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { getSimulationWorkspaceMode, type SimulationWorkspaceModeId } from "../lib/workspaceModes";
import { useSimulationStore } from "../state/simulationStore";

interface TopStatusBarProps {
  activeWorkspaceMode: SimulationWorkspaceModeId;
}

export function TopStatusBar({ activeWorkspaceMode }: TopStatusBarProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const engine = useSimulationStore((state) => state.engine);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const lastError = useSimulationStore((state) => state.lastError);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const mode = getSimulationWorkspaceMode(activeWorkspaceMode);
  const scenarioName = metadataText(engine?.metadata.scenarioName) ?? "Default run";
  const runStatus = getRunStatusPillModel(isRunning);

  return (
    <header className="top-status">
      <div className="top-status__global">
        <OrtusBrand href="/" showDescriptor className="top-status__brand" />
        <nav className="top-status__routes" aria-label="Global destinations">
          <Link href="/" className="top-status__route is-active" aria-current="page">
            Simulate
          </Link>
          <Link href="/builder" className="top-status__route" aria-label="Open Builder structural shell">
            Builder
          </Link>
        </nav>
      </div>
      <div className="top-status__context" aria-label="Current simulation context">
        <div>
          <span>Model</span>
          <strong>{descriptor.template.name}</strong>
        </div>
        <div>
          <span>Scenario</span>
          <strong>{scenarioName}</strong>
        </div>
        <div>
          <span>Workspace</span>
          <strong>{mode.label}</strong>
        </div>
      </div>
      <div className="top-status__run" aria-label="Current run status">
        <PhaseStateReadout />
        <StatusPill label={runStatus.label} tone={runStatus.tone} category={runStatus.category} state={runStatus.state} />
        {lastError ? <StatusPill label="Warning" tone="danger" /> : null}
      </div>
    </header>
  );
}

function metadataText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
