import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityGuidancePanel } from "../../components/researchWorld/CapabilityGuidancePanel";
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
  description: "Current non-persistent Lab orientation toward durable scientific memory and investigation records."
};

export default function LabPage() {
  return (
    <section className="lab-foundation" data-destination-surface="lab">
      <header className="destination-intro destination-intro--lab">
        <div>
          <p>Research record foundation</p>
          <h1>Lab</h1>
        </div>
        <p>World is the live experimental surface. Lab is intended to become durable scientific memory, but persistent Lab evidence records are not implemented.</p>
      </header>

      <section className="lab-now" aria-labelledby="lab-now-title">
        <div>
          <p>Current boundary</p>
          <h2 id="lab-now-title">Orientation today, scientific memory later</h2>
          <span>World can run implemented templates and compare bounded local summaries. Nothing on this Lab route saves, receives, or assesses those summaries.</span>
        </div>
        <div className="lab-memory-scope">
          <span>Intended future record</span>
          <ul>
            <li>questions and hypotheses</li>
            <li>experiments, runs, and comparisons</li>
            <li>evidence and counterevidence</li>
            <li>interpretations, failures, and contradictions</li>
            <li>SystemViews, assessments, and open questions</li>
          </ul>
        </div>
        <nav aria-label="Available research actions">
          <Link href="/world">Open World</Link>
          <Link href="/world?task=compare">Compare runs</Link>
          <Link href="/atlas">Sample in Atlas</Link>
        </nav>
      </section>

      <CapabilityGuidancePanel destinationId="lab" className="capability-guidance--route" />

      <Disclosure
        expandLabel="Lab technical foundation"
        collapseLabel="Hide Lab technical foundation"
        contentId="lab-technical-details"
        className="route-technical-disclosure"
      >
        <div className="lab-foundation__technical">
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
    </section>
  );
}
