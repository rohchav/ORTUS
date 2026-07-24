"use client";

import { useState } from "react";
import { FileActions } from "./FileActions";
import { RunComparisonPanel } from "./RunComparisonPanel";

type CompareView = "summary" | "exchange";

export function WorldComparePanel({ active = true }: { active?: boolean } = {}) {
  const [view, setView] = useState<CompareView>("summary");

  function openView(next: CompareView) {
    setView(next);
    const targetId = next === "summary" ? "comparison-current-run-title" : "world-exchange-title";
    window.requestAnimationFrame(() => document.getElementById(targetId)?.focus());
  }

  return (
    <div className="world-compare" data-compare-view={view}>
      <div hidden={view !== "summary"}>
        <RunComparisonPanel embedded active={active} />
        <section className="world-tool-entry" aria-labelledby="comparison-exchange-entry-title">
          <div>
            <span>Exchange</span>
            <h3 id="comparison-exchange-entry-title">Scenario and snapshot tools</h3>
            <p>Import or export existing JSON artifacts after comparison work.</p>
          </div>
          <button type="button" onClick={() => openView("exchange")}>Open exchange</button>
        </section>
      </div>
      <div className="world-task-subview" hidden={view !== "exchange"}>
        <button type="button" className="world-task-back" onClick={() => openView("summary")}>Back to Compare</button>
        <h3 id="world-exchange-title" tabIndex={-1}>Scenario and snapshot exchange</h3>
        <FileActions />
      </div>
    </div>
  );
}
