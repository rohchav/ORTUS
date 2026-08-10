import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { resolveStarterWorldLaunch } from "../../lib/starterWorlds";
import { simulationWorkspaceModeFromQuery } from "../../lib/workspaceModes";
import { templateDescriptors, type TemplateId } from "../../lib/templateVisuals";

export const metadata: Metadata = {
  title: "World | ORTUS",
  description: "Run, observe, and perturb an active modeled system."
};

interface WorldPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WorldPage({ searchParams }: WorldPageProps) {
  if (hasUnsafeAsyncSearchParamKey(searchParams)) {
    return <StarterLaunchError message="The Starter World launch URL contains an unsafe query key." />;
  }
  const query = await searchParams;
  if (query.starter === "unsafe-query-key") {
    return <StarterLaunchError message="The Starter World launch URL contains an unsafe query key." />;
  }
  const template = singleValue(query.template);
  const task = singleValue(query.task);
  const recipe = singleValue(query.recipe);
  const guide = singleValue(query.guide);

  if (query.recipe !== undefined && query.starter === undefined) {
    return <StarterLaunchError message="A prepared recipe must identify its Starter World." />;
  }
  if (query.guide !== undefined && query.starter === undefined) {
    return <StarterLaunchError message="A guided investigation must identify its Starter World and prepared recipe." />;
  }

  if (query.starter !== undefined) {
    if ([query.starter, query.recipe, query.guide, query.task].some(Array.isArray)) {
      return <StarterLaunchError message="The Starter World launch URL contains duplicate values." />;
    }
    if (Object.keys(query).some((key) => key !== "starter" && key !== "recipe" && key !== "guide" && key !== "task")) {
      return <StarterLaunchError message="The Starter World launch URL contains unsupported runtime overrides." />;
    }

    const result = resolveStarterWorldLaunch({
      starterId: query.starter,
      ...(recipe ? { recipeId: recipe } : {}),
      ...(guide ? { guideId: guide } : {}),
      ...(task ? { task } : {})
    });
    if (!result.ok || !isTemplateId(result.launch.templateId)) {
      return (
        <StarterLaunchError
          message={result.ok ? "The referenced runtime template is unavailable." : result.message}
        />
      );
    }

    return (
      <AppShell
        initialTemplateId={result.launch.templateId}
        initialWorkspaceMode={result.launch.task}
        starterLaunch={result.launch}
      />
    );
  }

  return <AppShell initialTemplateId={isTemplateId(template) ? template : undefined} initialWorkspaceMode={simulationWorkspaceModeFromQuery(task)} />;
}

function StarterLaunchError({ message }: { message: string }) {
  return (
    <section className="starter-launch-error" data-starter-launch-error role="alert">
      <p>Starter World launch stopped</p>
      <h1>This world could not be prepared safely</h1>
      <span>{message}</span>
      <div>
        <Link href="/worlds">Back to Explore Worlds</Link>
        <Link href="/">Return to Start</Link>
      </div>
    </section>
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hasUnsafeAsyncSearchParamKey(searchParams: WorldPageProps["searchParams"]): boolean {
  return ["__proto__", "prototype", "constructor", "then", "catch", "finally"]
    .some((key) => Object.prototype.hasOwnProperty.call(searchParams, key));
}

function isTemplateId(value: string | undefined): value is TemplateId {
  return templateDescriptors.some((descriptor) => descriptor.id === value);
}
