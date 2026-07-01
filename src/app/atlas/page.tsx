import type { Metadata } from "next";
import Link from "next/link";
import {
  atlasBoundarySummaries,
  atlasCapabilityLegendState,
  atlasEvidenceStates,
  atlasFoundationSummary,
  atlasMapRegionStates
} from "../../lib/atlasFoundation";
import { getResearchDestinationById } from "../../lib/researchDestinations";
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
            description="Discovery Atlas records, behavioral landscapes, sampled-region maps, and evidence-linked regimes are future work."
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
            Conceptual scaffold - not run data. This is a text map of Atlas anatomy, not a parameter-space map, heatmap,
            contour, discovery list, or sampled-region display.
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
