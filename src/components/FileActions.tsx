"use client";

import { useSimulationStore } from "../state/simulationStore";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

interface FileActionsProps {
  compact?: boolean;
}

export function FileActions({ compact = false }: FileActionsProps) {
  const runtime = useActiveWorldRuntime();
  const importMode = useSimulationStore((state) => state.importMode);
  const setImportMode = useSimulationStore((state) => state.setImportMode);
  const importText = useSimulationStore((state) => state.importText);
  const setImportText = useSimulationStore((state) => state.setImportText);
  const exportText = useSimulationStore((state) => state.exportText);
  const clearExchangeText = useSimulationStore((state) => state.clearExchangeText);
  const lastNotice = useSimulationStore((state) => state.lastNotice);
  const panelState = useSimulationStore((state) => state.panelState);
  const togglePanel = useSimulationStore((state) => state.togglePanel);

  if (compact) {
    return (
      <div className="file-actions file-actions--compact">
        <button type="button" onClick={() => void runtime.exportArtifact("scenario")} disabled={!runtime.isReady} suppressHydrationWarning>
          Export Scenario
        </button>
        <button type="button" onClick={() => void runtime.exportArtifact("snapshot")} disabled={!runtime.isReady} suppressHydrationWarning>
          Export Snapshot
        </button>
        <button type="button" onClick={() => togglePanel("file")} aria-expanded={panelState.file} suppressHydrationWarning>
          Import Scenario/Snapshot
        </button>
      </div>
    );
  }

  return (
    <div className="file-actions">
      <div className="file-actions__row">
        <button type="button" onClick={() => void runtime.exportArtifact("scenario")} disabled={!runtime.isReady} suppressHydrationWarning>
          Export Scenario
        </button>
        <button type="button" onClick={() => void runtime.exportArtifact("snapshot")} disabled={!runtime.isReady} suppressHydrationWarning>
          Export Snapshot
        </button>
        <button type="button" onClick={clearExchangeText} suppressHydrationWarning>
          Clear File Exchange
        </button>
      </div>
      {lastNotice ? (
        <p className="exchange-notice" role="status">
          {lastNotice}
        </p>
      ) : null}
      <div className="file-actions__mode" role="radiogroup" aria-label="Import type">
        <label>
          <input type="radio" name="import-mode" checked={importMode === "scenario"} onChange={() => setImportMode("scenario")} suppressHydrationWarning />
          Import Scenario
        </label>
        <label>
          <input type="radio" name="import-mode" checked={importMode === "snapshot"} onChange={() => setImportMode("snapshot")} suppressHydrationWarning />
          Import Snapshot
        </label>
      </div>
      {exportText ? (
        <label className="json-field">
          <span>Latest Scenario/Snapshot Export</span>
          <textarea className="json-box" value={exportText} readOnly aria-label="Latest exported scenario or snapshot JSON" suppressHydrationWarning />
        </label>
      ) : null}
      <label className="json-field">
        <span>Import Scenario/Snapshot JSON</span>
        <textarea
          className="json-box"
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="Paste scenario or snapshot JSON here."
          aria-label="Scenario or snapshot JSON to import"
          suppressHydrationWarning
        />
      </label>
      <div className="file-actions__row">
        <button type="button" onClick={() => void runtime.importArtifact(importMode, importText.trim())} disabled={!runtime.isReady} suppressHydrationWarning>
          {importMode === "scenario" ? "Import Scenario" : "Import Snapshot"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (exportText) {
              void navigator.clipboard?.writeText(exportText);
            }
          }}
          suppressHydrationWarning
        >
          Copy Scenario/Snapshot Export
        </button>
      </div>
      <p className="microcopy">
        Scenario restarts from template, parameters, seed, and metadata. Snapshot restores current tick, world, events, RNG streams, and metrics.
      </p>
    </div>
  );
}
