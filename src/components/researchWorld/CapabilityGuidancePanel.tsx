"use client";

import {
  getCapabilityGuidanceByDestinationId,
  type CapabilityBoundary,
  type CapabilityGuidanceItem
} from "../../lib/capabilityGuidance";
import type { ResearchDestinationId } from "../../lib/researchDestinations";
import { Disclosure } from "../ui/Disclosure";
import { StatusPill } from "../ui/StatusPill";

interface CapabilityGuidancePanelProps {
  destinationId: ResearchDestinationId;
  className?: string;
  maxItemsPerGroup?: number;
}

export function CapabilityGuidancePanel({ destinationId, className = "", maxItemsPerGroup }: CapabilityGuidancePanelProps) {
  const guidance = getCapabilityGuidanceByDestinationId(destinationId);
  const titleId = `capability-guidance-${destinationId}-title`;
  const availableHere = limitItems(guidance.availableHere, maxItemsPerGroup);
  const additionalAvailable = guidance.availableHere.slice(availableHere.length);
  const primaryBoundary = guidance.doNotAssume.slice(0, 1);
  const additionalBoundaries = guidance.doNotAssume.slice(1);

  return (
    <section
      className={`capability-guidance ${className}`}
      aria-labelledby={titleId}
      data-capability-guidance-destination={destinationId}
      data-capability-guidance-route={guidance.route}
    >
      <h2 id={titleId} className="sr-only">
        Capability reference
      </h2>
      <p className="capability-guidance__principle">
        <strong>Capability note:</strong> {contextualBoundary[destinationId]}
      </p>
      <Disclosure
        expandLabel="Capability reference"
        collapseLabel="Hide capability reference"
        contentId={`capability-guidance-${destinationId}-details`}
        className="capability-guidance__disclosure"
      >
        <div className="capability-guidance__reference">
          <p className="capability-guidance__scope">{guidance.principle}</p>
          <div className="capability-guidance__details-grid">
            <GuidanceGroup title="Available here" items={availableHere} />
            <BoundaryGroup boundaries={primaryBoundary} />
            {additionalAvailable.length > 0 ? <GuidanceGroup title="More available here" items={additionalAvailable} /> : null}
            <GuidanceGroup title="Planning-only" items={guidance.planningOnly} />
            <GuidanceGroup title="Not implemented" items={guidance.notImplemented} />
            {additionalBoundaries.length > 0 ? (
              <BoundaryGroup title="Additional boundaries" boundaries={additionalBoundaries} />
            ) : null}
            <RelatedDestinations destinationId={destinationId} destinations={guidance.relatedDestinations} />
          </div>
        </div>
      </Disclosure>
    </section>
  );
}

const contextualBoundary: Record<ResearchDestinationId, string> = {
  world: "World output is simulated model state. A runnable model is not automatically calibrated or validated against the real world.",
  workshop: "Workshop artifacts describe model structure. They do not compile or execute a custom model.",
  lab: "Lab currently provides a non-persistent evidence-record foundation; it does not save research records.",
  atlas: "Atlas preview results stay page-local and describe model output, not certified real-world discoveries."
};

function limitItems<T>(items: readonly T[], maxItems: number | undefined): readonly T[] {
  if (maxItems === undefined) {
    return items;
  }
  return items.slice(0, maxItems);
}

function GuidanceGroup({ title, items }: { title: string; items: readonly CapabilityGuidanceItem[] }) {
  const groupId = `capability-guidance-${slug(title)}`;
  return (
    <section className="capability-guidance__group" aria-labelledby={groupId}>
      <h3 id={groupId}>{title}</h3>
      <ul className="capability-guidance__list">
        {items.map((item) => (
          <li key={item.id}>
            <div className="capability-guidance__row-head">
              <StatusPill
                label={item.status.label}
                tone="neutral"
                category={item.status.category}
                state={item.status.state}
                description={item.summary}
                size="compact"
              />
              <strong>{item.label}</strong>
            </div>
            <p>{item.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BoundaryGroup({ title = "Do not assume", boundaries }: { title?: string; boundaries: readonly CapabilityBoundary[] }) {
  const groupId = `capability-guidance-${slug(title)}`;
  return (
    <section className="capability-guidance__group" aria-labelledby={groupId}>
      <h3 id={groupId}>{title}</h3>
      <ul className="capability-guidance__list">
        {boundaries.map((boundary) => (
          <li key={boundary.id}>
            <div className="capability-guidance__row-head">
              <StatusPill
                label={boundary.status.label}
                tone="neutral"
                category={boundary.status.category}
                state={boundary.status.state}
                description={boundary.summary}
                size="compact"
              />
              <strong>{boundary.label}</strong>
            </div>
            <p>{boundary.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedDestinations({
  destinationId,
  destinations
}: {
  destinationId: ResearchDestinationId;
  destinations: ReturnType<typeof getCapabilityGuidanceByDestinationId>["relatedDestinations"];
}) {
  return (
    <section className="capability-guidance__group" aria-labelledby={`capability-guidance-${destinationId}-related`}>
      <h3 id={`capability-guidance-${destinationId}-related`}>Related destination</h3>
      <ul className="capability-guidance__list">
        {destinations.map((destination) => (
          <li key={destination.destinationId}>
            <div className="capability-guidance__row-head">
              <StatusPill
                label="Related destination"
                tone="neutral"
                category="capability"
                state="planning-only"
                description={`${destination.label} route: ${destination.summary}`}
                size="compact"
              />
              <strong>{destination.label}</strong>
            </div>
            <p>{destination.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
