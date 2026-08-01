"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getSiblingStarterWorldRecipe,
  getStarterWorldLaunchRecipeById,
  getStarterWorldPackForWorld,
  requireStarterWorldById,
  starterWorldLaunchHref,
  type StarterWorldLaunch
} from "../lib/starterWorlds";

interface StarterActionNudgeProps {
  launch: StarterWorldLaunch;
}

export function StarterActionNudge({ launch }: StarterActionNudgeProps) {
  const [visible, setVisible] = useState(true);
  const world = requireStarterWorldById(launch.starterWorldId);
  const recipe = launch.recipeId ? getStarterWorldLaunchRecipeById(launch.recipeId) : undefined;
  const pack = getStarterWorldPackForWorld(world.id);
  const sibling = recipe ? getSiblingStarterWorldRecipe(recipe.id) : undefined;

  if (!visible) {
    return null;
  }

  function dismiss() {
    setVisible(false);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(".world-stage")?.focus());
  }

  return (
    <aside
      className={`starter-nudge${recipe ? " starter-nudge--recipe" : ""}`}
      aria-label={`${world.title} starter steps`}
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
            <p className="starter-nudge__recipe"><strong>Recipe:</strong> {recipe.title}</p>
            <span>{recipe.purpose}</span>
            <ol>
              <li>Run to {recipe.suggestedRunHorizon} ticks.</li>
              <li>Watch {world.whatToWatch.filter((item) => item.metricId && recipe.outputsToWatch.includes(item.metricId)).map((item) => item.label).join(" and ")}.</li>
              <li>Return for the paired recipe.</li>
            </ol>
            <nav aria-label="Prepared recipe links">
              {pack ? <Link href={`/worlds/packs/${pack.slug}`}>Back to collection</Link> : null}
              {sibling ? (
                <Link href={starterWorldLaunchHref(world.id, sibling.id)}>
                  Launch {sibling.comparisonRole}: {sibling.title}
                </Link>
              ) : null}
            </nav>
          </>
        ) : (
          <ol>
            <li>{world.firstRun.action}</li>
            <li>{world.firstChange.action}</li>
            <li>Watch {world.whatToWatch.map((item) => item.label).join(" and ")}.</li>
          </ol>
        )}
      </div>
      <button type="button" onClick={dismiss} aria-label={`Dismiss ${world.title} starter steps`}>
        Dismiss
      </button>
    </aside>
  );
}
