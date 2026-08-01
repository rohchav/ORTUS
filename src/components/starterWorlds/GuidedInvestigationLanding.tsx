import Link from "next/link";
import type { GuidedInvestigationAuthority } from "../../lib/starterWorlds";
import { GuidedInvestigationVisual } from "./GuidedInvestigationVisual";

export function GuidedInvestigationLanding({
  authority
}: {
  authority: GuidedInvestigationAuthority;
}) {
  const {
    guide,
    world,
    baselineRecipe,
    contrastRecipe,
    controlledDifference,
    sharedConditions,
    focusOutputs
  } = authority;
  const visibleSharedConditions = prioritizeSharedConditions(sharedConditions).slice(0, 7);

  return (
    <article className="guided-investigation-landing" data-guided-investigation={guide.id}>
      <header className="guided-investigation-hero">
        <div className="guided-investigation-hero__copy">
          <nav aria-label="Guided investigation breadcrumbs">
            <Link href="/worlds">Explore Worlds</Link>
            <Link href={authority.collectionHref}>{authority.pack.shortTitle} collection</Link>
          </nav>
          <p>Guided investigation · {guide.estimatedMinutes} minutes</p>
          <h1>{guide.title}</h1>
          <strong>{guide.hookQuestion}</strong>
          <div className="guided-investigation-hero__premise">
            {guide.opening.map((line) => <span key={line}>{line}</span>)}
          </div>
          <dl className="guided-investigation-hero__facts">
            <div>
              <dt>Controlled difference</dt>
              <dd>
                {controlledDifference.label}: {formatValue(controlledDifference.baselineValue)} versus {formatValue(controlledDifference.contrastValue)}
              </dd>
            </div>
            <div>
              <dt>Inspect</dt>
              <dd>{focusOutputs.map((output) => output.label).join(" and ")}</dd>
            </div>
          </dl>
          <div className="guided-investigation-hero__actions">
            <Link className="guided-investigation-primary" href={authority.baselineHref}>
              Start with {baselineRecipe.title.toLowerCase()}
            </Link>
            <Link href={authority.flagshipHref}>Back to {world.title}</Link>
          </div>
        </div>
        <GuidedInvestigationVisual kind={world.visualKind} />
      </header>

      <div className="guided-investigation-body">
        <section aria-labelledby="guide-question-title">
          <header><p>01 / Question</p><h2 id="guide-question-title">The question</h2></header>
          <div><strong>{guide.hookQuestion}</strong><p>{guide.summary}</p></div>
        </section>

        <section aria-labelledby="guide-change-title">
          <header><p>02 / What changes</p><h2 id="guide-change-title">One prepared difference</h2></header>
          <div className="guided-investigation-pair">
            <article>
              <span>Baseline</span>
              <h3>{baselineRecipe.title}</h3>
              <dl><dt>{controlledDifference.label}</dt><dd>{formatValue(controlledDifference.baselineValue)}</dd></dl>
            </article>
            <article>
              <span>Contrast</span>
              <h3>{contrastRecipe.title}</h3>
              <dl><dt>{controlledDifference.label}</dt><dd>{formatValue(controlledDifference.contrastValue)}</dd></dl>
            </article>
          </div>
        </section>

        <section aria-labelledby="guide-controlled-title">
          <header><p>03 / What stays controlled</p><h2 id="guide-controlled-title">Shared effective conditions</h2></header>
          <div>
            <dl className="guided-investigation-conditions">
              {visibleSharedConditions.map((condition) => (
                <div key={condition.field}><dt>{condition.label}</dt><dd>{formatValue(condition.value)}</dd></div>
              ))}
            </dl>
            {sharedConditions.length > visibleSharedConditions.length ? (
              <p className="guided-investigation-note">
                Plus {sharedConditions.length - visibleSharedConditions.length} additional matching effective settings in the audited comparison.
              </p>
            ) : null}
            <p className="guided-investigation-note">{authority.tickZeroSummary}</p>
          </div>
        </section>

        <section aria-labelledby="guide-inspect-title">
          <header><p>04 / What you will inspect</p><h2 id="guide-inspect-title">Two outputs, one visible world</h2></header>
          <div className="guided-investigation-outputs">
            {focusOutputs.map((output) => (
              <article key={output.metricId}><h3>{output.label}</h3><p>{output.description}</p></article>
            ))}
          </div>
        </section>

        <section aria-labelledby="guide-start-title">
          <header><p>05 / Start</p><h2 id="guide-start-title">Start the investigation</h2></header>
          <div className="guided-investigation-start">
            <p>The baseline opens as a fresh, paused run at tick zero. Playback remains under your control.</p>
            <Link className="guided-investigation-primary" href={authority.baselineHref}>Start with {baselineRecipe.title.toLowerCase()}</Link>
          </div>
        </section>

        <section aria-labelledby="guide-outline-title">
          <header><p>06 / Investigation outline</p><h2 id="guide-outline-title">Read the prepared pair</h2></header>
          <ol className="guided-investigation-outline">
            <li>Run the clear-signals baseline.</li>
            <li>Inspect {focusOutputs.map((output) => output.label).join(" and ")}.</li>
            <li>Capture the existing comparison summary.</li>
            <li>Run the noisy-signals contrast.</li>
            <li>Review what changed and what did not.</li>
          </ol>
        </section>

        <section aria-labelledby="guide-boundary-title">
          <header><p>07 / Model boundary</p><h2 id="guide-boundary-title">What this pair can show</h2></header>
          <p className="guided-investigation-boundary">{guide.modelBoundary}</p>
        </section>

        <section aria-labelledby="guide-continue-title">
          <header><p>08 / Continue without the guide</p><h2 id="guide-continue-title">Use the prepared world directly</h2></header>
          <div className="guided-investigation-continue">
            <p>The same audited baseline and contrast remain available without instructional steps.</p>
            <Link href={authority.unguidedBaselineHref}>Open {baselineRecipe.title} without the guide</Link>
            <Link href={authority.flagshipHref}>Review the full flagship world</Link>
          </div>
        </section>
      </div>
    </article>
  );
}

function prioritizeSharedConditions(
  conditions: GuidedInvestigationAuthority["sharedConditions"]
) {
  const preferred = ["seed", "initializationPresetId", "parameters.agentCount"];
  return [
    ...preferred.flatMap((field) => conditions.filter((condition) => condition.field === field)),
    ...conditions.filter((condition) => !preferred.includes(condition.field))
  ];
}

function formatValue(value: string | number | boolean | null): string {
  if (value === null) {
    return "Not used";
  }
  if (typeof value === "boolean") {
    return value ? "On" : "Off";
  }
  return String(value);
}
