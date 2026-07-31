import Link from "next/link";
import {
  createDefaultStarterWorldLaunch,
  starterWorldAnatomyLabels,
  starterWorldMechanismLabels,
  starterWorldRemixStatusLabels,
  starterWorldSourceRelationshipLabels,
  starterWorldSourceTypeLabels,
  type StarterWorldAnatomy,
  type StarterWorldDefinition
} from "../../lib/starterWorlds";
import { StarterWorldVisual } from "./StarterWorldVisual";

interface StarterWorldDetailProps {
  world: StarterWorldDefinition;
}

const anatomyOrder: readonly (keyof StarterWorldAnatomy)[] = [
  "entities",
  "groups",
  "environment",
  "resources",
  "networks",
  "fields",
  "boundaries",
  "scales",
  "feedbackLoops",
  "delays",
  "adaptation",
  "selection",
  "stochasticity",
  "observables"
];

export function StarterWorldDetail({ world }: StarterWorldDetailProps) {
  const launch = createDefaultStarterWorldLaunch(world.id);
  const anatomy = anatomyOrder.flatMap((facet) => {
    const items = world.anatomy[facet];
    return items ? [{ facet, items }] : [];
  });

  return (
    <article className={`world-detail world-detail--${world.visualKind}`} data-world-detail={world.id}>
      <header className="world-detail__hero">
        <div className="world-detail__hero-copy">
          <Link className="world-detail__back" href="/worlds">Back to Explore Worlds</Link>
          <p>{world.hookQuestion}</p>
          <h1>{world.title}</h1>
          <span className="world-detail__premise">{world.oneSentencePremise}</span>
          <ul className="world-detail__signals" aria-label={`${world.title} system characteristics`}>
            {world.catalogIndicators.map((indicator) => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
          <div className="world-detail__first-action">
            <span>Start with</span>
            <strong>{world.firstRun.action}</strong>
          </div>
          <Link className="world-detail__launch" href={launch.href}>Launch this world</Link>
        </div>
        <div className="world-detail__hero-visual">
          <StarterWorldVisual kind={world.visualKind} />
          <dl>
            {anatomy.slice(0, 3).map(({ facet, items }) => (
              <div key={facet}>
                <dt>{starterWorldAnatomyLabels[facet]}</dt>
                <dd>{items[0]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="world-detail__body">
        <section className="world-detail__question" aria-labelledby="world-detail-question">
          <p>01 / The question</p>
          <h2 id="world-detail-question">{world.hookQuestion}</h2>
          <span>{world.summary}</span>
        </section>

        <section className="world-detail__section" aria-labelledby="world-detail-inside">
          <header>
            <p>02 / System anatomy</p>
            <h2 id="world-detail-inside">Inside this world</h2>
          </header>
          <div className="world-detail__anatomy">
            {anatomy.map(({ facet, items }) => (
              <section key={facet}>
                <h3>{starterWorldAnatomyLabels[facet]}</h3>
                <ul>
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="world-detail__section world-detail__mechanisms" aria-labelledby="world-detail-mechanisms">
          <header>
            <p>03 / Interaction</p>
            <h2 id="world-detail-mechanisms">How the system works</h2>
          </header>
          <div>
            <ul aria-label="Primary mechanisms">
              {world.primaryMechanisms.map((mechanism) => (
                <li key={mechanism}>{starterWorldMechanismLabels[mechanism]}</li>
              ))}
            </ul>
            <p>{world.interactionPattern}</p>
            <p>{world.systemDynamics}</p>
          </div>
        </section>

        <section className="world-detail__section world-detail__start" aria-labelledby="world-detail-start">
          <header>
            <p>04 / First investigation</p>
            <h2 id="world-detail-start">Start here</h2>
          </header>
          <ol>
            <li>
              <span>Run the baseline</span>
              <strong>{world.firstRun.action}</strong>
              <p>{world.firstRun.demonstrates}</p>
            </li>
            <li>
              <span>Make one change</span>
              <strong>{world.firstChange.action}</strong>
              <p>{world.firstChange.differenceToLookFor}</p>
            </li>
            <li>
              <span>Watch the result</span>
              <strong>{world.whatToWatch.map((item) => item.label).join(" and ")}</strong>
              <p>{world.whatToWatch[0]!.description}</p>
            </li>
          </ol>
          <Link className="world-detail__launch world-detail__launch--inline" href={launch.href}>Launch fresh at tick 0</Link>
        </section>

        <section className="world-detail__section" aria-labelledby="world-detail-investigate">
          <header>
            <p>05 / Run again</p>
            <h2 id="world-detail-investigate">Things to investigate</h2>
          </header>
          <ol className="world-detail__prompts">
            {world.investigationPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
          </ol>
        </section>

        <section className="world-detail__section world-detail__research" aria-labelledby="world-detail-research">
          <header>
            <p>06 / Related work</p>
            <h2 id="world-detail-research">Research connection</h2>
          </header>
          <div>
            <p className="world-detail__research-boundary">
              These sources connect the Starter World to related ideas and research. They do not validate or calibrate this implementation.
            </p>
            <ol>
              {world.sources.map((source) => (
                <li key={source.sourceId}>
                  <a href={source.urlOrDoi} target="_blank" rel="noreferrer noopener">
                    {source.title} (external source)
                  </a>
                  <span>{source.authorsOrOrganization}, {source.year}</span>
                  <small>
                    {starterWorldSourceTypeLabels[source.sourceType]}; {starterWorldSourceRelationshipLabels[source.relationship]}
                  </small>
                  <p>{source.note}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="world-detail__section world-detail__boundary" aria-labelledby="world-detail-boundary">
          <header>
            <p>07 / Model boundary</p>
            <h2 id="world-detail-boundary">What this world leaves out</h2>
          </header>
          <div>
            <p>{world.mainLimitation}</p>
            <Link href={`/world?template=${world.runtime!.templateId}&task=understand`}>Open the full model reference in World</Link>
          </div>
        </section>

        <section className="world-detail__section world-detail__remix" aria-labelledby="world-detail-remix">
          <header>
            <p>08 / Expansion path</p>
            <h2 id="world-detail-remix">Remix directions</h2>
          </header>
          <div className="world-detail__remix-list">
            {world.remixIdeas.map((idea) => (
              <section key={idea.title}>
                <span>{starterWorldRemixStatusLabels[idea.status]}</span>
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
              </section>
            ))}
            {world.futureExpansion.map((expansion) => (
              <section key={expansion.title} className="world-detail__future">
                <span>Future architecture</span>
                <h3>{expansion.title}</h3>
                <p>{expansion.description}</p>
                <small>Requires: {expansion.requiredCapability}</small>
              </section>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
