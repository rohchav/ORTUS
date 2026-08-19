"use client";

import type { RefObject } from "react";
import { getRunStatusPillModel } from "./runStatusSemantics";
import { StatusPill } from "./ui/StatusPill";
import { formatTick } from "../lib/format";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

interface TopStatusBarProps {
  onOpenRunDetails: () => void;
  runDetailsTriggerRef: RefObject<HTMLButtonElement | null>;
}

export function TopStatusBar({ onOpenRunDetails, runDetailsTriggerRef }: TopStatusBarProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const seed = useSimulationStore((state) => state.seed);
  const lastError = useSimulationStore((state) => state.lastError);
  const runtime = useActiveWorldRuntime();
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const scenarioName = metadataText(runtime.metadata.scenarioName) ?? "Default run";
  const runStatus = getRunStatusPillModel(runtime.isRunning);

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
        {runtime.state === "initializing"
          ? <StatusPill label="Initializing" tone="neutral" category="operational" state="idle" />
          : runtime.state === "failed"
            ? <StatusPill label="Stopped" tone="danger" category="operational" state="failed" />
            : <StatusPill label={runStatus.label} tone={runStatus.tone} category={runStatus.category} state={runStatus.state} />}
        <span className="top-status__fact">Tick <strong>{formatTick(runtime.tick)}</strong></span>
        <span className="top-status__fact">Seed <strong>{seed}</strong></span>
        <span className="top-status__fact">Runtime <strong>{runtime.workerManaged ? "Worker" : "Main thread"}</strong></span>
        <button ref={runDetailsTriggerRef} type="button" className="top-status__details" onClick={onOpenRunDetails}>
          Run details
        </button>
        {lastError || runtime.error ? <StatusPill label="Warning" tone="danger" /> : null}
      </div>
    </header>
  );
}

function metadataText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
