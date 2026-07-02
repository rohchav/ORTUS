import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityGuidancePanel } from "../../components/researchWorld/CapabilityGuidancePanel";
import { CornerFramePanel } from "../../components/ui/CornerFramePanel";
import { StatusPill } from "../../components/ui/StatusPill";
import {
  labBoundarySummaries,
  labFoundationSummary,
  labLedgerScaffoldStates,
  labRecordLifecycleStates
} from "../../lib/labFoundation";
import { getResearchDestinationById } from "../../lib/researchDestinations";

export const metadata: Metadata = {
  title: "Lab | ORTUS",
  description: "Non-persistent Lab foundation for model investigation evidence records and experiment ledger semantics."
};

export default function LabPage() {
  const destination = getResearchDestinationById("lab");

  return (
    <section className="lab-foundation" aria-labelledby="lab-title" data-destination-surface="lab">
      <div className="lab-foundation__header">
        <span className="lab-foundation__eyebrow">Research World destination</span>
        <div className="lab-foundation__title-row">
          <h1 id="lab-title">{labFoundationSummary.routeLabel}</h1>
          <StatusPill
            label={labFoundationSummary.statusLabel}
            tone="neutral"
            category={labFoundationSummary.category}
            state={labFoundationSummary.state}
            description="Non-persistent evidence-record information architecture only."
          />
        </div>
        <p>{destination.purpose}</p>
      </div>

      <CapabilityGuidancePanel destinationId="lab" className="capability-guidance--route" />

      <div className="lab-foundation__grid">
        <CornerFramePanel title="Current Boundary" eyebrow="GW5 scope" variant="standard" className="lab-foundation__panel">
          <h2 className="sr-only">Current Boundary</h2>
          <p>{labFoundationSummary.currentBoundary}</p>
          <p>{labFoundationSummary.epistemicBoundary}</p>
          <p>{labFoundationSummary.nonPersistenceBoundary}</p>
          <StatusPill
            label="Records not implemented"
            tone="neutral"
            category="capability"
            state="future-only"
            description="Persistent evidence records, experiment ledgers, notebooks, saved comparisons, and run history are future work."
          />
        </CornerFramePanel>

        <CornerFramePanel title="Evidence Record Lifecycle" eyebrow="Future interpretation" variant="standard" className="lab-foundation__panel">
          <h2 className="sr-only">Evidence Record Lifecycle</h2>
          <p>
            These states define how future Lab evidence records should be read. They do not create saved records, logs,
            notebooks, comparison results, or real-world validation.
          </p>
          <ul className="lab-record-legend">
            {labRecordLifecycleStates.map((recordState) => (
              <li key={recordState.id}>
                <div className="lab-record-legend__head">
                  <StatusPill
                    label={recordState.label}
                    tone="neutral"
                    category={recordState.category}
                    state={recordState.state}
                    description={recordState.summary}
                  />
                  <span>
                    {recordState.category} / {recordState.state}
                  </span>
                </div>
                <p>{recordState.interpretation}</p>
              </li>
            ))}
          </ul>
        </CornerFramePanel>

        <CornerFramePanel title="Experiment Ledger Scaffold" eyebrow="Not saved data" variant="standard" className="lab-foundation__panel">
          <h2 className="sr-only">Experiment Ledger Scaffold</h2>
          <p>{labFoundationSummary.ledgerBoundary}</p>
          <ol className="lab-ledger-scaffold">
            {labLedgerScaffoldStates.map((ledgerState) => (
              <li key={ledgerState.id}>
                <StatusPill
                  label={ledgerState.label}
                  tone="neutral"
                  category={ledgerState.category}
                  state={ledgerState.state}
                  description={ledgerState.summary}
                />
                <p>{ledgerState.summary}</p>
              </li>
            ))}
          </ol>
        </CornerFramePanel>
      </div>

      <section className="lab-boundaries" aria-labelledby="lab-boundaries-title">
        <h2 id="lab-boundaries-title">Lab Boundaries</h2>
        <div className="lab-boundaries__grid">
          {labBoundarySummaries.map((boundary) => (
            <article key={boundary.id} className="lab-boundary-card">
              <header>
                <h3>{boundary.title}</h3>
                <StatusPill
                  label={boundary.state}
                  tone="neutral"
                  category={boundary.category}
                  state={boundary.state}
                  description={boundary.summary}
                  size="compact"
                />
              </header>
              <p>{boundary.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="lab-foundation__links" aria-label="Lab destination links">
        <Link href="/">Return to World</Link>
        <Link href="/builder">Open Workshop</Link>
        <Link href="/atlas">Open Atlas</Link>
      </nav>
    </section>
  );
}
