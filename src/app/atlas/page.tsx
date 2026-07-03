import type { Metadata } from "next";
import Link from "next/link";
import { behavioralLandscapeFoundation } from "../../lib/behavioralLandscapeFoundation";
import {
  atlasBoundarySummaries,
  atlasCapabilityLegendState,
  atlasEvidenceStates,
  atlasFoundationSummary,
  atlasMapRegionStates
} from "../../lib/atlasFoundation";
import { getResearchDestinationById } from "../../lib/researchDestinations";
import { CapabilityGuidancePanel } from "../../components/researchWorld/CapabilityGuidancePanel";
import { CornerFramePanel } from "../../components/ui/CornerFramePanel";
import { StatusPill } from "../../components/ui/StatusPill";

export const metadata: Metadata = {
  title: "Atlas | ORTUS",
  description: "Non-persistent Atlas foundation for investigated model behavior and evidence boundaries."
};

export default function AtlasPage() {
  const destination = getResearchDestinationById("atlas");

  return (
    <section className="atlas-foundation" aria-labelledby="atlas-title" data-destination-surface="atlas">
      <div className="atlas-foundation__header">
        <span className="atlas-foundation__eyebrow">Research World destination</span>
        <div className="atlas-foundation__title-row">
          <h1 id="atlas-title">{atlasFoundationSummary.routeLabel}</h1>
          <StatusPill
            label={atlasFoundationSummary.statusLabel}
            tone="neutral"
            category={atlasFoundationSummary.category}
            state={atlasFoundationSummary.state}
            description="Non-persistent information architecture and evidence semantics only."
          />
        </div>
        <p>{destination.purpose}</p>
      </div>

      <CapabilityGuidancePanel destinationId="atlas" className="capability-guidance--route" />

      <div className="atlas-foundation__grid">
        <CornerFramePanel title="Current Boundary" eyebrow="GW4 scope" variant="standard" className="atlas-foundation__panel">
          <h2 className="sr-only">Current Boundary</h2>
          <p>{atlasFoundationSummary.currentBoundary}</p>
          <p>{atlasFoundationSummary.epistemicBoundary}</p>
          <p>{atlasFoundationSummary.nonPersistenceBoundary}</p>
          <StatusPill
            label="Records not implemented"
            tone="neutral"
            category="capability"
            state="future-only"
            description="Discovery Atlas records, saved behavioral landscape maps, sampled-region maps, and evidence-linked regimes are future work."
          />
        </CornerFramePanel>

        <CornerFramePanel title="Evidence State Legend" eyebrow="Future interpretation" variant="standard" className="atlas-foundation__panel">
          <h2 className="sr-only">Evidence State Legend</h2>
          <p>
            These states define how future Atlas evidence should be read. They do not create records, scores, samples, or
            real-world validation.
          </p>
          <ul className="atlas-evidence-legend">
            {atlasEvidenceStates.map((evidenceState) => (
              <li key={evidenceState.id}>
                <div className="atlas-evidence-legend__head">
                  <StatusPill
                    label={evidenceState.label}
                    tone="neutral"
                    category={evidenceState.category}
                    state={evidenceState.state}
                    description={evidenceState.summary}
                  />
                  <span>
                    {evidenceState.category} / {evidenceState.state}
                  </span>
                </div>
                <p>{evidenceState.interpretation}</p>
              </li>
            ))}
            <li>
              <div className="atlas-evidence-legend__head">
                <StatusPill
                  label={atlasCapabilityLegendState.label}
                  tone="neutral"
                  category={atlasCapabilityLegendState.category}
                  state={atlasCapabilityLegendState.state}
                  description={atlasCapabilityLegendState.summary}
                />
                <span>
                  {atlasCapabilityLegendState.category} / {atlasCapabilityLegendState.state}
                </span>
              </div>
              <p>{atlasCapabilityLegendState.interpretation}</p>
            </li>
          </ul>
        </CornerFramePanel>

        <CornerFramePanel title="Conceptual Scaffold" eyebrow="Not run data" variant="standard" className="atlas-foundation__panel">
          <h2 className="sr-only">Conceptual Scaffold</h2>
          <p>
            Conceptual scaffold - not run data. This is a text map of Atlas anatomy, not a visual data surface,
            discovery list, or sampled-area display.
          </p>
          <ol className="atlas-map-scaffold">
            {atlasMapRegionStates.map((regionState) => (
              <li key={regionState.id}>
                <StatusPill
                  label={regionState.label}
                  tone="neutral"
                  category={regionState.category}
                  state={regionState.state}
                  description={regionState.summary}
                />
                <p>{regionState.summary}</p>
              </li>
            ))}
          </ol>
        </CornerFramePanel>
      </div>

      <section
        className="behavioral-landscape-foundation"
        aria-labelledby="behavioral-landscape-title"
        data-behavioral-landscape-foundation="conceptual"
      >
        <div className="behavioral-landscape-foundation__header">
          <div>
            <span className="behavioral-landscape-foundation__eyebrow">GW7 scope</span>
            <h2 id="behavioral-landscape-title">{behavioralLandscapeFoundation.title}</h2>
          </div>
          <StatusPill
            label={behavioralLandscapeFoundation.statusLabel}
            tone="neutral"
            category={behavioralLandscapeFoundation.status.category}
            state={behavioralLandscapeFoundation.status.state}
            description={behavioralLandscapeFoundation.boundary}
          />
        </div>
        <p>{behavioralLandscapeFoundation.principle}</p>
        <p>{behavioralLandscapeFoundation.boundary}</p>
        <p>{behavioralLandscapeFoundation.purpose}</p>

        <div className="behavioral-landscape-foundation__grid">
          <CornerFramePanel title="Parameter And Outcome Space" eyebrow="Axes, not data" variant="standard" className="atlas-foundation__panel">
            <h3 className="sr-only">Parameter And Outcome Space</h3>
            <ul className="landscape-axis-list">
              {behavioralLandscapeFoundation.axes.map((axis) => (
                <li key={axis.id}>
                  <div className="landscape-list__head">
                    <StatusPill
                      label={axis.label}
                      tone="neutral"
                      category={axis.status.category}
                      state={axis.status.state}
                      description={axis.notData}
                    />
                    <span>
                      {axis.status.category} / {axis.status.state}
                    </span>
                  </div>
                  <p>{axis.summary}</p>
                  <p>{axis.notData}</p>
                </li>
              ))}
            </ul>
          </CornerFramePanel>

          <CornerFramePanel title="Landscape Vocabulary" eyebrow="Concepts, not claims" variant="standard" className="atlas-foundation__panel">
            <h3 className="sr-only">Landscape Vocabulary</h3>
            <ul className="landscape-concept-list">
              {behavioralLandscapeFoundation.concepts.map((concept) => (
                <li key={concept.id}>
                  <div className="landscape-list__head">
                    <StatusPill
                      label={concept.label}
                      tone="neutral"
                      category={concept.status.category}
                      state={concept.status.state}
                      description={concept.distinction}
                    />
                    <span>
                      {concept.status.category} / {concept.status.state}
                    </span>
                  </div>
                  <p>{concept.summary}</p>
                  <p>{concept.distinction}</p>
                </li>
              ))}
            </ul>
          </CornerFramePanel>

          <CornerFramePanel title="Conceptual Scaffold" eyebrow="Not sampled run data" variant="standard" className="atlas-foundation__panel">
            <h3 className="sr-only">Behavioral Landscape Conceptual Scaffold</h3>
            <div className="landscape-list__head">
              <StatusPill
                label={behavioralLandscapeFoundation.scaffold.label}
                tone="neutral"
                category={behavioralLandscapeFoundation.scaffold.status.category}
                state={behavioralLandscapeFoundation.scaffold.status.state}
                description={behavioralLandscapeFoundation.scaffold.boundary}
              />
              <span>
                {behavioralLandscapeFoundation.scaffold.status.category} / {behavioralLandscapeFoundation.scaffold.status.state}
              </span>
            </div>
            <p>{behavioralLandscapeFoundation.scaffold.summary}</p>
            <ol className="landscape-scaffold-list">
              {behavioralLandscapeFoundation.scaffold.anatomy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p>{behavioralLandscapeFoundation.scaffold.boundary}</p>
          </CornerFramePanel>
        </div>

        <section className="landscape-region-semantics" aria-labelledby="landscape-region-semantics-title">
          <h3 id="landscape-region-semantics-title">Landscape Region Semantics</h3>
          <ul className="landscape-region-list">
            {behavioralLandscapeFoundation.regionStates.map((regionState) => (
              <li key={regionState.id}>
                <div className="landscape-list__head">
                  <StatusPill
                    label={regionState.label}
                    tone="neutral"
                    category={regionState.status.category}
                    state={regionState.status.state}
                    description={regionState.interpretation}
                    size="compact"
                  />
                  <span>
                    {regionState.status.category} / {regionState.status.state}
                  </span>
                </div>
                <p>{regionState.summary}</p>
                <p>{regionState.interpretation}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="landscape-boundaries" aria-labelledby="landscape-boundaries-title">
          <h3 id="landscape-boundaries-title">Behavioral Landscape Boundaries</h3>
          <div className="landscape-boundaries__grid">
            {behavioralLandscapeFoundation.boundaries.map((boundary) => (
              <article key={boundary.id} className="landscape-boundary-card">
                <header>
                  <h4>{boundary.title}</h4>
                  <StatusPill
                    label={boundary.status.label}
                    tone="neutral"
                    category={boundary.status.category}
                    state={boundary.status.state}
                    description={boundary.summary}
                    size="compact"
                  />
                </header>
                <p>{boundary.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="atlas-boundaries" aria-labelledby="atlas-boundaries-title">
        <h2 id="atlas-boundaries-title">Atlas Boundaries</h2>
        <div className="atlas-boundaries__grid">
          {atlasBoundarySummaries.map((boundary) => (
            <article key={boundary.id} className="atlas-boundary-card">
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

      <nav className="atlas-foundation__links" aria-label="Atlas destination links">
        <Link href="/">Return to World</Link>
        <Link href="/builder">Open Workshop</Link>
      </nav>
    </section>
  );
}
