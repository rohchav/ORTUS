import type { ElementType } from "react";
import { getRouteOrientation } from "../../lib/routeOrientation";
import type { ResearchDestinationId } from "../../lib/researchDestinations";
import { Disclosure } from "../ui/Disclosure";
import { StatusPill } from "../ui/StatusPill";

interface RouteOrientationPanelProps {
  destinationId: ResearchDestinationId;
  headingLevel?: 1 | 2;
  className?: string;
}

export function RouteOrientationPanel({ destinationId, headingLevel = 2, className = "" }: RouteOrientationPanelProps) {
  const orientation = getRouteOrientation(destinationId);
  const titleId = `route-orientation-${destinationId}-title`;
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <section
      className={`route-orientation route-orientation--${destinationId} ${className}`}
      aria-labelledby={titleId}
      data-route-orientation={destinationId}
    >
      <div className="route-orientation__heading">
        <div>
          <span className="route-orientation__eyebrow">Research World destination</span>
          <Heading id={titleId}>{orientation.routeName}</Heading>
        </div>
        {orientation.status ? (
          <StatusPill
            label={orientation.status.label}
            tone="neutral"
            category={orientation.status.category}
            state={orientation.status.state}
            description={orientation.status.description}
          />
        ) : null}
      </div>
      <p className="route-orientation__purpose">{orientation.purpose}</p>
      <p className="route-orientation__start">
        <strong>{orientation.startLabel}:</strong> {orientation.startHere}
      </p>
      <p className="route-orientation__boundary">
        <strong>Boundary:</strong> {orientation.boundary}
      </p>
      <Disclosure
        expandLabel="Technical details"
        collapseLabel="Hide technical details"
        contentId={`route-orientation-${destinationId}-technical-details`}
        className="route-orientation__disclosure"
      >
        <dl className="route-orientation__terms">
          {orientation.technicalDetails.map((detail) => (
            <div key={detail.plainLanguage}>
              <dt>{detail.plainLanguage}</dt>
              <dd>{detail.technicalLanguage}</dd>
            </div>
          ))}
        </dl>
      </Disclosure>
    </section>
  );
}
