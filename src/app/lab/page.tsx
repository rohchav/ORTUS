import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityGuidancePanel } from "../../components/researchWorld/CapabilityGuidancePanel";
import { RouteOrientationPanel } from "../../components/researchWorld/RouteOrientationPanel";
import { CornerFramePanel } from "../../components/ui/CornerFramePanel";
import { Disclosure } from "../../components/ui/Disclosure";
import { StatusPill } from "../../components/ui/StatusPill";
import {
  labBoundarySummaries,
  labFoundationSummary,
  labLedgerScaffoldStates,
  labRecordLifecycleStates
} from "../../lib/labFoundation";

export const metadata: Metadata = {
  title: "Lab | ORTUS",
  description: "Non-persistent Lab foundation for model investigation evidence records and experiment ledger semantics."
};

export default function LabPage() {
  return (
    <section className="lab-foundation" data-destination-surface="lab">
      <RouteOrientationPanel destinationId="lab" headingLevel={1} />

      <section className="lab-foundation__overview" aria-labelledby="lab-overview-title">
        <div className="lab-foundation__section-heading">
          <span>Start with the model boundary</span>
          <h2 id="lab-overview-title">What Lab Means Right Now</h2>
        </div>
        <div className="lab-foundation__grid">
          <CornerFramePanel title="What Exists Now" eyebrow="Conceptual foundation" variant="standard" className="lab-foundation__panel">
            <h3 className="sr-only">What Exists Now</h3>
            <p>{labFoundationSummary.purpose}</p>
            <p>{labFoundationSummary.epistemicBoundary}</p>
          </CornerFramePanel>

          <CornerFramePanel title="Conceptual Lifecycle" eyebrow="Three starting states" variant="standard" className="lab-foundation__panel">
            <h3 className="sr-only">Conceptual Lifecycle</h3>
            <ol className="lab-ledger-scaffold lab-lifecycle-preview">
              {labRecordLifecycleStates.slice(0, 3).map((recordState) => (
                <li key={recordState.id}>
                  <StatusPill
                    label={recordState.label}
                    tone="neutral"
                    category={recordState.category}
                    state={recordState.state}
                    description={recordState.summary}
                  />
                  <p>{recordState.interpretation}</p>
                </li>
              ))}
            </ol>
          </CornerFramePanel>
        </div>
      </section>

      <CapabilityGuidancePanel destinationId="lab" className="capability-guidance--route" />

      <Disclosure
        expandLabel="Show Lab technical details"
        collapseLabel="Hide Lab technical details"
        contentId="lab-technical-details"
        className="route-technical-disclosure"
      >
        <div className="lab-foundation__technical">
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
        </div>
      </Disclosure>

      <nav className="lab-foundation__links" aria-label="Lab destination links">
        <Link href="/">Return to World</Link>
        <Link href="/builder">Open Workshop</Link>
        <Link href="/atlas">Open Atlas</Link>
      </nav>
    </section>
  );
}
