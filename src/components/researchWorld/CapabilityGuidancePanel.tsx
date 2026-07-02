"use client";

import {
  getCapabilityGuidanceByDestinationId,
  type CapabilityBoundary,
  type CapabilityGuidanceItem
} from "../../lib/capabilityGuidance";
import type { ResearchDestinationId } from "../../lib/researchDestinations";
import { CornerFramePanel } from "../ui/CornerFramePanel";
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
  const planningOnly = limitItems(guidance.planningOnly, maxItemsPerGroup);
  const notImplemented = limitItems(guidance.notImplemented, maxItemsPerGroup);
  const doNotAssume = limitItems(guidance.doNotAssume, maxItemsPerGroup);
  const relatedDestinations = limitItems(guidance.relatedDestinations, maxItemsPerGroup);

  return (
    <section
      className={`capability-guidance ${className}`}
      aria-labelledby={titleId}
      data-capability-guidance-destination={destinationId}
      data-capability-guidance-route={guidance.route}
    >
      <CornerFramePanel title="Capability Guidance" eyebrow={guidance.roleLabel} variant="compact" className="capability-guidance__panel">
        <h2 id={titleId} className="sr-only">
          Capability Guidance
        </h2>
        <p className="capability-guidance__principle">{guidance.visibleBoundary}</p>
        <p className="capability-guidance__scope">{guidance.principle}</p>

        <GuidanceGroup title="Available here" items={availableHere} />
        <GuidanceGroup title="Planning-only" items={planningOnly} />
        <GuidanceGroup title="Not implemented" items={notImplemented} />
        <BoundaryGroup boundaries={doNotAssume} />

        <section className="capability-guidance__group" aria-labelledby={`capability-guidance-${destinationId}-related`}>
          <h3 id={`capability-guidance-${destinationId}-related`}>Related destination</h3>
          <ul className="capability-guidance__list">
            {relatedDestinations.map((destination) => (
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
      </CornerFramePanel>
    </section>
  );
}

function limitItems<T>(items: readonly T[], maxItems: number | undefined): readonly T[] {
  if (maxItems === undefined) {
    return items;
  }
  return items.slice(0, maxItems);
}

function GuidanceGroup({ title, items }: { title: CapabilityGuidanceItem["status"]["label"]; items: readonly CapabilityGuidanceItem[] }) {
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

function BoundaryGroup({ boundaries }: { boundaries: readonly CapabilityBoundary[] }) {
  return (
    <section className="capability-guidance__group" aria-labelledby="capability-guidance-do-not-assume">
      <h3 id="capability-guidance-do-not-assume">Do not assume</h3>
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

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
