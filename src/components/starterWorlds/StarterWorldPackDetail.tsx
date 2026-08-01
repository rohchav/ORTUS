import Link from "next/link";
import {
  getPreparedStarterComparisonForWorld,
  requireStarterWorldById,
  starterWorldSystemFormLabels,
  type StarterWorldPackDefinition
} from "../../lib/starterWorlds";
import { StarterWorldCollectionVisual } from "./StarterWorldCollectionVisual";
import { StarterWorldVisual } from "./StarterWorldVisual";

interface StarterWorldPackDetailProps {
  pack: StarterWorldPackDefinition;
}

export function StarterWorldPackDetail({ pack }: StarterWorldPackDetailProps) {
  const worlds = pack.worldIds.map(requireStarterWorldById);
  const featured = requireStarterWorldById(pack.featuredWorldId);

  return (
    <article className="starter-pack-detail" data-starter-pack={pack.id}>
      <header className="starter-pack-detail__hero">
        <div className="starter-pack-detail__hero-copy">
          <Link href="/worlds">Back to Explore Worlds</Link>
          <p>Flagship Starter World collection</p>
          <h1>{pack.title}</h1>
          <strong>{pack.hook}</strong>
          <span>{pack.theme}</span>
          <Link className="starter-pack-detail__primary" href={`/worlds/${featured.slug}`}>
            Start with {featured.title}
          </Link>
        </div>
        <StarterWorldCollectionVisual worlds={worlds} />
      </header>

      <div className="starter-pack-detail__body">
        <section className="starter-pack-detail__questions" aria-labelledby="pack-questions-title">
          <header>
            <p>01 / Four systems</p>
            <h2 id="pack-questions-title">Four local questions</h2>
          </header>
          <div>
            {worlds.map((world) => {
              const comparison = getPreparedStarterComparisonForWorld(world.id)!;
              const difference =
                comparison.controlledDifferences.find((candidate) => candidate.field === "initializationPresetId") ??
                comparison.controlledDifferences[0]!;
              return (
                <article key={world.id} data-pack-world={world.id}>
                  <StarterWorldVisual kind={world.visualKind} compact />
                  <p>{world.hookQuestion}</p>
                  <h3>{world.title}</h3>
                  <dl>
                    <div>
                      <dt>System form</dt>
                      <dd>{world.systemForms.map((form) => starterWorldSystemFormLabels[form]).join(" + ")}</dd>
                    </div>
                    <div>
                      <dt>Controlled difference</dt>
                      <dd>{difference.label}: {formatValue(difference.baselineValue)} versus {formatValue(difference.contrastValue)}</dd>
                    </div>
                    <div>
                      <dt>Compare</dt>
                      <dd>{world.whatToWatch.filter((item) => item.metricId && comparison.outputsToCompare.includes(item.metricId)).map((item) => item.label).join(" and ")}</dd>
                    </div>
                  </dl>
                  <Link href={`/worlds/${world.slug}`}>Open {world.title}</Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="starter-pack-detail__mechanisms" aria-labelledby="pack-mechanisms-title">
          <header>
            <p>02 / Compare mechanisms</p>
            <h2 id="pack-mechanisms-title">Different systems, different local changes</h2>
          </header>
          <ol>
            <li><strong>Coordination</strong><span>Changes bounded steering noise inside local moving-agent neighborhoods.</span></li>
            <li><strong>Outbreak starts</strong><span>Changes whether equal initial infections occupy one cluster or several hotspots.</span></li>
            <li><strong>Predator pressure</strong><span>Changes the starting predator ratio before delayed population feedback unfolds.</span></li>
            <li><strong>Firebreak paths</strong><span>Changes whether local grid spread meets a connected path or a full-height empty corridor.</span></li>
          </ol>
          <p>The four templates do not share one mathematical model. The collection compares how distinct local mechanisms reorganize their own model outputs.</p>
        </section>

        <section className="starter-pack-detail__use" aria-labelledby="pack-use-title">
          <header>
            <p>03 / Use the collection</p>
            <h2 id="pack-use-title">Run one explicit pair</h2>
          </header>
          <ol>
            <li>Open one world.</li>
            <li>Run its baseline.</li>
            <li>Run its contrast.</li>
            <li>Compare the named outputs.</li>
          </ol>
          <p>No order is locked, no progress is stored, and each recipe creates a fresh paused world.</p>
        </section>

        <section className="starter-pack-detail__boundary" aria-labelledby="pack-boundary-title">
          <header>
            <p>04 / Collection boundary</p>
            <h2 id="pack-boundary-title">Prepared model comparisons</h2>
          </header>
          <p>{pack.researchBoundary}</p>
        </section>
      </div>
    </article>
  );
}

function formatValue(value: string | number | boolean | null): string {
  if (value === null) {
    return "not used";
  }
  if (typeof value === "boolean") {
    return value ? "On" : "Off";
  }
  return String(value);
}
