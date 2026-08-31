"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  getSiblingStarterWorldRecipe,
  getStarterWorldLaunchRecipeById,
  getStarterWorldPackForWorld,
  requireStarterWorldById,
  starterRemixWorkshopHref,
  starterWorldLaunchHref,
  type StarterWorldLaunch
} from "../lib/starterWorlds";

interface StarterActionNudgeProps {
  launch: StarterWorldLaunch;
  activeGuideId?: string;
  onPrepareRemix: (launch: StarterWorldLaunch) => string | null;
}

export function StarterActionNudge({ launch, activeGuideId, onPrepareRemix }: StarterActionNudgeProps) {
  const [visible, setVisible] = useState(true);
  const [remixError, setRemixError] = useState<string | null>(null);
  const nudgeRef = useRef<HTMLElement>(null);
  const focusAfterSiblingActivation = useRef(false);
  const world = requireStarterWorldById(launch.starterWorldId);
  const recipe = launch.recipeId ? getStarterWorldLaunchRecipeById(launch.recipeId) : undefined;
  const pack = getStarterWorldPackForWorld(world.id);
  const sibling = recipe ? getSiblingStarterWorldRecipe(recipe.id) : undefined;

  useEffect(() => {
    if (!focusAfterSiblingActivation.current) {
      return;
    }
    focusAfterSiblingActivation.current = false;
    requestAnimationFrame(() => nudgeRef.current?.focus());
  }, [recipe?.id]);

  if (!visible) {
    return null;
  }

  function dismiss() {
    setVisible(false);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(".world-stage")?.focus());
  }

  function captureActiveWorldHandoff(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const error = onPrepareRemix(launch);
    if (error) {
      event.preventDefault();
      setRemixError(error);
      return;
    }
    setRemixError(null);
  }

  return (
    <aside
      ref={nudgeRef}
      className={`starter-nudge${recipe ? " starter-nudge--recipe" : ""}${activeGuideId ? " starter-nudge--guided" : ""}`}
      aria-label={activeGuideId ? `${world.title} prepared recipe context` : `${world.title} starter steps`}
      tabIndex={-1}
      data-starter-nudge
      data-starter-world-id={world.id}
      {...(recipe ? { "data-starter-recipe-id": recipe.id } : {})}
    >
      <div className="starter-nudge__copy">
        <p>
          Exploring: <Link href={`/worlds/${world.slug}`}>{world.title}</Link>
        </p>
        {recipe ? (
          <>
            <p className="starter-nudge__recipe"><strong>{activeGuideId ? "Prepared reference:" : "Recipe:"}</strong> {recipe.title}</p>
            {!activeGuideId ? (
              <>
                <span>{recipe.purpose}</span>
                <ol>
                  <li>Run to {recipe.suggestedRunHorizon} ticks.</li>
                  <li>Watch {world.whatToWatch.filter((item) => item.metricId && recipe.outputsToWatch.includes(item.metricId)).map((item) => item.label).join(" and ")}.</li>
                  <li>Return for the paired recipe.</li>
                </ol>
              </>
            ) : null}
            <nav aria-label="Prepared recipe links">
              {pack ? <Link href={`/worlds/packs/${pack.slug}`}>Back to collection</Link> : null}
              <Link
                href={starterRemixWorkshopHref(world.id, {
                  recipeId: recipe.id,
                  entry: "world",
                  ...(world.firstChange.targetType === "parameter" ? { focusParameterId: world.firstChange.targetId } : {})
                })}
                onClick={captureActiveWorldHandoff}
              >
                Remix this recipe
              </Link>
              {sibling ? (
                <Link
                  href={starterWorldLaunchHref(world.id, sibling.id, activeGuideId)}
                  onClick={() => {
                    focusAfterSiblingActivation.current = true;
                  }}
                >
                  Launch {sibling.comparisonRole}: {sibling.title}
                </Link>
              ) : null}
            </nav>
          </>
        ) : (
          <>
            <p className="starter-nudge__question">Question: {world.hookQuestion}</p>
            <div className="starter-nudge__investigation">
              <section>
                <span>Entities and mechanism</span>
                <strong>{world.anatomy.entities?.[0] ?? world.oneSentencePremise}</strong>
                <small>{world.firstRun.action}</small>
              </section>
              <section>
                <span>Relevant change</span>
                <strong>{world.firstChange.targetLabel}</strong>
                <small>{world.firstChange.action}</small>
              </section>
              <section>
                <span>Watch</span>
                <strong>{world.whatToWatch.map((item) => item.label).join(" and ")}</strong>
                <small>{world.firstChange.differenceToLookFor}</small>
              </section>
            </div>
            <nav aria-label="Starter remix link">
              <Link
                href={starterRemixWorkshopHref(world.id, {
                  entry: "world",
                  ...(world.firstChange.targetType === "parameter" ? { focusParameterId: world.firstChange.targetId } : {})
                })}
                onClick={captureActiveWorldHandoff}
              >
                Remix this system
              </Link>
            </nav>
          </>
        )}
        {remixError ? <p role="alert">{remixError}</p> : null}
      </div>
      <button type="button" onClick={dismiss} aria-label={`Dismiss ${world.title} starter steps`}>
        Dismiss
      </button>
    </aside>
  );
}
