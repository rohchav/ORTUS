"use client";

import { usePathname } from "next/navigation";
import { getResearchDestinationByPathname, isFutureOnlyResearchDestination } from "../../lib/researchDestinations";
import { StatusPill } from "../ui/StatusPill";

export function ResearchDestinationContext() {
  const pathname = usePathname();
  const destination = getResearchDestinationByPathname(pathname);

  if (!destination) {
    return (
      <section className="research-destination-context" aria-label="Current destination">
        <span>Current destination</span>
        <strong>ORTUS</strong>
        <p>Route not recognized by the Research World destination model.</p>
      </section>
    );
  }

  const futureOnly = isFutureOnlyResearchDestination(destination);

  return (
    <section className="research-destination-context" aria-label="Current destination">
      <div className="research-destination-context__copy">
        <span>Current destination</span>
        <strong>{destination.label}</strong>
        <p>{destination.purpose}</p>
      </div>
      {futureOnly && destination.status ? (
        <StatusPill
          label={destination.status.label}
          tone="neutral"
          category={destination.status.category}
          state={destination.status.state}
          description={destination.status.description}
          size="compact"
        />
      ) : null}
    </section>
  );
}
