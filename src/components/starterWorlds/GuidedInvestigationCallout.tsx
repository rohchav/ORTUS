import Link from "next/link";
import type { GuidedInvestigationAuthority } from "../../lib/starterWorlds";

export function GuidedInvestigationCallout({
  authority,
  context
}: {
  authority: GuidedInvestigationAuthority;
  context: "world" | "collection";
}) {
  return (
    <section
      className={`guided-investigation-callout guided-investigation-callout--${context}`}
      aria-labelledby={`guided-investigation-callout-${context}`}
      data-guide-callout={authority.guide.id}
    >
      <header>
        <p>Guided investigation · {authority.guide.estimatedMinutes} minutes</p>
        <h2 id={`guided-investigation-callout-${context}`}>{authority.guide.title}</h2>
      </header>
      <div>
        <strong>{authority.guide.hookQuestion}</strong>
        <span>Inspect {authority.focusOutputs.map((output) => output.label).join(" and ")} across one prepared pair.</span>
      </div>
      <Link href={authority.landingHref}>Try the guided investigation</Link>
    </section>
  );
}
