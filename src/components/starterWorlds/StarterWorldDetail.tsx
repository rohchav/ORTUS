import Link from "next/link";
import {
  createDefaultStarterWorldLaunch,
  deriveGuidedInvestigationAuthority,
  getGuidedInvestigationForWorld,
  getPreparedStarterComparisonForWorld,
  getStarterWorldPackForWorld,
  getStarterWorldById,
  resolveStarterWorldLaunch,
  starterWorldAnatomyLabels,
  starterWorldLaunchRecipesForWorld,
  starterWorldMechanismLabels,
  starterWorldRemixStatusLabels,
  starterRemixWorkshopHref,
  starterWorldSourceRelationshipLabels,
  starterWorldSourceTypeLabels,
  type PreparedStarterComparison,
  type StarterWorldAnatomy,
  type StarterWorldDefinition,
  type StarterWorldLaunchRecipe
} from "../../lib/starterWorlds";
import { GuidedInvestigationCallout } from "./GuidedInvestigationCallout";
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
  const comparison = getPreparedStarterComparisonForWorld(world.id);
  const recipes = starterWorldLaunchRecipesForWorld(world.id);
  const baselineRecipe = comparison
    ? recipes.find((recipe) => recipe.id === comparison.baselineRecipeId)
    : undefined;
  const contrastRecipe = comparison
    ? recipes.find((recipe) => recipe.id === comparison.contrastRecipeId)
    : undefined;
  const pack = getStarterWorldPackForWorld(world.id);
  const guide = getGuidedInvestigationForWorld(world.id);
  const guideAuthority = guide ? deriveGuidedInvestigationAuthority(guide) : undefined;
  const parent = world.parentWorldId ? getStarterWorldById(world.parentWorldId) : undefined;
  const launch = baselineRecipe
    ? requireRecipeLaunch(world.id, baselineRecipe.id)
    : createDefaultStarterWorldLaunch(world.id);
  const anatomy = anatomyOrder.flatMap((facet) => {
    const items = world.anatomy[facet];
    return items ? [{ facet, items }] : [];
  });

  return (
    <article className={`world-detail world-detail--${world.visualKind}${comparison ? " world-detail--flagship" : ""}`} data-world-detail={world.id}>
      <header className="world-detail__hero">
        <div className="world-detail__hero-copy">
          <nav className="world-detail__back" aria-label="Starter World breadcrumbs">
            <Link href="/worlds">Explore Worlds</Link>
            {pack ? <Link href={`/worlds/packs/${pack.slug}`}>{pack.shortTitle} collection</Link> : null}
          </nav>
          <p>{world.hookQuestion}</p>
          <h1>{world.title}</h1>
          <span className="world-detail__premise">{world.oneSentencePremise}</span>
          {parent ? (
            <span className="world-detail__parent">
              A focused investigation built on <Link href={`/worlds/${parent.slug}`}>{parent.title}</Link>.
            </span>
          ) : null}
          <ul className="world-detail__signals" aria-label={`${world.title} system characteristics`}>
            {world.catalogIndicators.map((indicator) => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
          <div className="world-detail__first-action">
            <span>{baselineRecipe ? "Prepared baseline" : "Start with"}</span>
            <strong>{baselineRecipe?.title ?? world.firstRun.action}</strong>
            {contrastRecipe ? <small>Paired contrast available: {contrastRecipe.title}</small> : null}
          </div>
          <div className="world-detail__hero-actions">
            <Link className="world-detail__launch" href={launch.href}>
              {baselineRecipe ? `Launch baseline: ${baselineRecipe.title}` : "Launch this world"}
            </Link>
            <Link
              className="world-detail__remix-action"
              href={starterRemixWorkshopHref(world.id, {
                ...(baselineRecipe ? { recipeId: baselineRecipe.id } : {}),
                ...(world.firstChange.targetType === "parameter" ? { focusParameterId: world.firstChange.targetId } : {})
              })}
            >
              Remix this system
            </Link>
          </div>
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
        {guideAuthority ? <GuidedInvestigationCallout authority={guideAuthority} context="world" /> : null}
        {!comparison ? (
          <section className="world-detail__question" aria-labelledby="world-detail-question">
            <p>01 / The question</p>
            <h2 id="world-detail-question">{world.hookQuestion}</h2>
            <span>{world.summary}</span>
          </section>
        ) : null}

        <section className="world-detail__section" aria-labelledby="world-detail-inside">
          <header>
            <p>{comparison ? "01" : "02"} / System anatomy</p>
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
            <p>{comparison ? "02" : "03"} / Interaction</p>
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

        {comparison && baselineRecipe && contrastRecipe ? (
          <>
            <section className="world-detail__section world-detail__comparison" aria-labelledby="world-detail-comparison">
              <header>
                <p>03 / Prepared pair</p>
                <h2 id="world-detail-comparison">Prepared comparison</h2>
              </header>
              <div className="world-detail__comparison-intro">
                <strong>{comparison.question}</strong>
                <p>{comparison.expectedPattern}</p>
                <dl>
                  <dt>Tick-0 state</dt>
                  <dd>{comparison.tickZeroSummary}</dd>
                </dl>
              </div>
              <div className="world-detail__recipe-grid">
                <RecipeCard world={world} recipe={baselineRecipe} comparison={comparison} />
                <RecipeCard world={world} recipe={contrastRecipe} comparison={comparison} />
              </div>
              <div className="world-detail__compare-workflow">
                <h3>Use the existing World Compare task</h3>
                <ol>
                  {comparison.suggestedProcedure.map((step) => <li key={step}>{step}</li>)}
                </ol>
                <p>A prepared pair makes configuration differences easier to inspect. It does not establish robustness, causality, or empirical validity.</p>
              </div>
            </section>

            <section className="world-detail__section world-detail__watch" aria-labelledby="world-detail-watch">
              <header>
                <p>04 / Named outputs</p>
                <h2 id="world-detail-watch">What to watch</h2>
              </header>
              <div>
                {world.whatToWatch.map((item) => (
                  <article key={item.label}>
                    <h3>{item.label}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
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
            <div className="world-detail__inline-actions">
              <Link className="world-detail__launch world-detail__launch--inline" href={launch.href}>Launch fresh at tick 0</Link>
              <Link
                className="world-detail__remix-action"
                href={starterRemixWorkshopHref(world.id, {
                  ...(world.firstChange.targetType === "parameter" ? { focusParameterId: world.firstChange.targetId } : {})
                })}
              >
                Remix this change
              </Link>
            </div>
          </section>
        )}

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
            <h2 id="world-detail-boundary">{comparison ? "Main model boundary" : "What this world leaves out"}</h2>
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

function RecipeCard({
  world,
  recipe,
  comparison
}: {
  world: StarterWorldDefinition;
  recipe: StarterWorldLaunchRecipe;
  comparison: PreparedStarterComparison;
}) {
  const launch = requireRecipeLaunch(world.id, recipe.id);
  const role = recipe.comparisonRole === "baseline" ? "Baseline" : "Contrast";
  const shared = prioritizeSharedConditions(recipe, comparison.sharedConditions);
  const outputs = recipe.outputsToWatch.map((metricId) => {
    return world.whatToWatch.find((item) => item.metricId === metricId)?.label ?? metricId;
  });

  return (
    <article className={`world-recipe world-recipe--${recipe.comparisonRole}`} data-starter-recipe={recipe.id}>
      <header>
        <span>{role}</span>
        <h3>{recipe.title}</h3>
        <p>{recipe.shortDescription}</p>
      </header>
      <div>
        <h4>What differs</h4>
        <dl>
          {comparison.controlledDifferences.map((difference) => (
            <div key={difference.field}>
              <dt>{difference.label}</dt>
              <dd>{formatComparisonValue(recipe.comparisonRole === "baseline" ? difference.baselineValue : difference.contrastValue)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h4>What remains controlled in the scenario</h4>
        <ul>
          {shared.slice(0, 6).map((condition) => (
            <li key={condition.field}><span>{condition.label}</span><strong>{formatComparisonValue(condition.value)}</strong></li>
          ))}
        </ul>
        {shared.length > 6 ? <small>Plus {shared.length - 6} other matching scenario settings.</small> : null}
      </div>
      <dl className="world-recipe__run">
        <div><dt>Task</dt><dd>{capitalize(recipe.recommendedTask)}</dd></div>
        <div><dt>Run horizon</dt><dd>{recipe.suggestedRunHorizon} ticks</dd></div>
        <div><dt>Outputs</dt><dd>{outputs.join(" and ")}</dd></div>
      </dl>
      {recipe.visualCue ? <p className="world-recipe__cue">{recipe.visualCue}</p> : null}
      <div className="world-recipe__actions">
        <Link href={launch.href} aria-label={`Launch ${role.toLowerCase()}: ${recipe.title}`}>
          Launch {role.toLowerCase()}
        </Link>
        <Link
          href={starterRemixWorkshopHref(world.id, {
            recipeId: recipe.id,
            ...(world.firstChange.targetType === "parameter" ? { focusParameterId: world.firstChange.targetId } : {})
          })}
          aria-label={`Remix ${role.toLowerCase()}: ${recipe.title}`}
        >
          Remix {role.toLowerCase()}
        </Link>
      </div>
    </article>
  );
}

function prioritizeSharedConditions(
  recipe: StarterWorldLaunchRecipe,
  conditions: PreparedStarterComparison["sharedConditions"]
) {
  const preferredFields = [
    "seed",
    ...Object.keys(recipe.parameterOverrides).map((key) => `parameters.${key}`),
    ...Object.keys(recipe.initializationOptions ?? {}).map((key) => `initializationOptions.${key}`)
  ];
  const preferred = new Set(preferredFields);
  return [
    ...preferredFields.flatMap((field) => conditions.filter((condition) => condition.field === field)),
    ...conditions.filter((condition) => !preferred.has(condition.field))
  ];
}

function requireRecipeLaunch(starterWorldId: string, recipeId: string) {
  const result = resolveStarterWorldLaunch({ starterId: starterWorldId, recipeId });
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.launch;
}

function formatComparisonValue(value: string | number | boolean | null): string {
  if (value === null) {
    return "Not used";
  }
  if (typeof value === "boolean") {
    return value ? "On" : "Off";
  }
  return String(value);
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
