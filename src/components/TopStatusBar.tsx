"use client";

import type { RefObject } from "react";
import { getRunStatusPillModel } from "./runStatusSemantics";
import { StatusPill } from "./ui/StatusPill";
import { formatTick } from "../lib/format";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface TopStatusBarProps {
  onOpenRunDetails: () => void;
  runDetailsTriggerRef: RefObject<HTMLButtonElement | null>;
}

export function TopStatusBar({ onOpenRunDetails, runDetailsTriggerRef }: TopStatusBarProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const engine = useSimulationStore((state) => state.engine);
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const seed = useSimulationStore((state) => state.seed);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const lastError = useSimulationStore((state) => state.lastError);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const scenarioName = metadataText(engine?.metadata.scenarioName) ?? "Default run";
  const runStatus = getRunStatusPillModel(isRunning);

  return (
    <header className="top-status">
      <div className="top-status__context" aria-label="Current simulation context">
        <div className="top-status__world">
          <span>World</span>
          <strong>{descriptor.template.name}</strong>
          <em>{scenarioName}</em>
        </div>
      </div>
      <div className="top-status__run" aria-label="Current run status">
        <StatusPill label={runStatus.label} tone={runStatus.tone} category={runStatus.category} state={runStatus.state} />
        <span className="top-status__fact">Tick <strong>{formatTick(snapshot?.tick ?? 0)}</strong></span>
        <span className="top-status__fact">Seed <strong>{engine?.seed ?? seed}</strong></span>
        <button ref={runDetailsTriggerRef} type="button" className="top-status__details" onClick={onOpenRunDetails}>
          Run details
        </button>
        {lastError ? <StatusPill label="Warning" tone="danger" /> : null}
      </div>
    </header>
  );
}

function metadataText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
