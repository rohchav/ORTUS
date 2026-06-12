"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileActions } from "./FileActions";
import { PhaseStateReadout } from "./PhaseStateReadout";
import { OrtusBrand } from "./branding";
import { StatusPill } from "./ui/StatusPill";
import { templateDescriptors, type TemplateId } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

export function TopStatusBar() {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const selectTemplate = useSimulationStore((state) => state.selectTemplate);
  const seed = useSimulationStore((state) => state.seed);
  const setSeed = useSimulationStore((state) => state.setSeed);
  const regenerateSeed = useSimulationStore((state) => state.regenerateSeed);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const lastError = useSimulationStore((state) => state.lastError);
  const [seedDraft, setSeedDraft] = useState(seed);

  useEffect(() => {
    setSeedDraft(seed);
  }, [seed]);

  return (
    <header className="top-status">
      <OrtusBrand href="/" showDescriptor className="top-status__brand" />
      <Link href="/builder" className="top-status__builder-link">
        Builder Shell
      </Link>
      <FileActions compact />
      <label className="top-status__field">
        <span>Model</span>
        <select value={selectedTemplateId} onChange={(event) => selectTemplate(event.target.value as TemplateId)} suppressHydrationWarning>
          {templateDescriptors.map((descriptor) => (
            <option key={descriptor.id} value={descriptor.id}>
              {descriptor.template.name}
            </option>
          ))}
        </select>
      </label>
      <form
        className="top-status__seed"
        onSubmit={(event) => {
          event.preventDefault();
          setSeed(seedDraft);
        }}
      >
        <label htmlFor="ortus-seed">Seed</label>
        <input
          id="ortus-seed"
          value={seedDraft}
          onChange={(event) => setSeedDraft(event.target.value)}
          onBlur={() => setSeed(seedDraft)}
          suppressHydrationWarning
        />
        <button type="submit" suppressHydrationWarning>
          Apply
        </button>
        <button type="button" onClick={regenerateSeed} suppressHydrationWarning>
          Regenerate
        </button>
      </form>
      <PhaseStateReadout />
      <StatusPill label={isRunning ? "Running" : "Paused"} tone={isRunning ? "moss" : "neutral"} />
      {lastError ? <StatusPill label="Warning" tone="danger" /> : null}
    </header>
  );
}
