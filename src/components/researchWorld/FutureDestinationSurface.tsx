import Link from "next/link";
import { getResearchDestinationById, type ResearchDestinationId } from "../../lib/researchDestinations";
import { CornerFramePanel } from "../ui/CornerFramePanel";
import { StatusPill } from "../ui/StatusPill";

interface FutureDestinationSurfaceProps {
  destinationId: Extract<ResearchDestinationId, "lab" | "atlas">;
  boundaryCopy: string;
  implementationCopy: string;
  plannedResponsibilities: readonly string[];
  principles: readonly string[];
}

export function FutureDestinationSurface({
  destinationId,
  boundaryCopy,
  implementationCopy,
  plannedResponsibilities,
  principles
}: FutureDestinationSurfaceProps) {
  const destination = getResearchDestinationById(destinationId);
  const status = destination.status;

  return (
    <section className="future-destination" aria-labelledby={`${destination.id}-title`} data-destination-surface={destination.id}>
      <div className="future-destination__header">
        <span className="future-destination__eyebrow">Research World destination</span>
        <div className="future-destination__title-row">
          <h1 id={`${destination.id}-title`}>{destination.label}</h1>
          {status ? (
            <StatusPill
              label={status.label}
              tone="neutral"
              category={status.category}
              state={status.state}
              description={status.description}
            />
          ) : null}
        </div>
        <p>{destination.purpose}</p>
      </div>

      <div className="future-destination__grid">
        <CornerFramePanel title="Current Boundary" eyebrow="GW1 scope" variant="standard" className="future-destination__panel">
          <p>{implementationCopy}</p>
          <p>{boundaryCopy}</p>
        </CornerFramePanel>

        <CornerFramePanel title="Planned Responsibilities" eyebrow="Future work" variant="standard" className="future-destination__panel">
          <ul className="future-destination__list">
            {plannedResponsibilities.map((responsibility) => (
              <li key={responsibility}>{responsibility}</li>
            ))}
          </ul>
        </CornerFramePanel>

        <CornerFramePanel title="Model Boundaries" eyebrow="Epistemic guardrails" variant="standard" className="future-destination__panel">
          <ul className="future-destination__list">
            {principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </CornerFramePanel>
      </div>

      <nav className="future-destination__links" aria-label={`${destination.label} destination links`}>
        <Link href="/">Return to World</Link>
        <Link href="/builder">Open Workshop</Link>
      </nav>
    </section>
  );
}
