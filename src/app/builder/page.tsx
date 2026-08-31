import type { Metadata } from "next";
import Link from "next/link";
import { BuilderShell } from "../../components/builder";
import { resolveStarterRemixRequest } from "../../lib/starterWorlds";

export const metadata: Metadata = {
  title: "Workshop | ORTUS",
  description: "Construct and inspect model structure."
};

interface BuilderPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  if (hasUnsafeAsyncSearchParamKey(searchParams)) {
    return <StarterRemixError message="The Starter remix URL contains an unsafe query key." />;
  }
  const query = await searchParams;
  const hasRemixQuery = query.starter !== undefined || query.recipe !== undefined || query.from !== undefined || query.focus !== undefined;
  if (!hasRemixQuery) {
    return <BuilderShell />;
  }
  if (query.starter === "unsafe-query-key") {
    return <StarterRemixError message="The Starter remix URL contains an unsafe query key." />;
  }
  if ([query.starter, query.recipe, query.from, query.focus].some(Array.isArray)) {
    return <StarterRemixError message="The Starter remix URL contains duplicate values." />;
  }
  if (Object.keys(query).some((key) => key !== "starter" && key !== "recipe" && key !== "from" && key !== "focus")) {
    return <StarterRemixError message="The Starter remix URL contains unsupported configuration data." />;
  }
  const starterId = singleValue(query.starter);
  if (!starterId) {
    return <StarterRemixError message="A Starter remix must identify its source Starter World." />;
  }
  const recipeId = singleValue(query.recipe);
  const from = singleValue(query.from);
  const focusParameterId = singleValue(query.focus);
  if (
    (query.recipe !== undefined && !recipeId) ||
    (query.from !== undefined && !from) ||
    (query.focus !== undefined && !focusParameterId)
  ) {
    return <StarterRemixError message="The Starter remix URL contains an empty identifier or entry value." />;
  }
  if (from && from !== "world") {
    return <StarterRemixError message="The Starter remix entry context is not supported." />;
  }
  const result = resolveStarterRemixRequest({
    starterId,
    ...(recipeId ? { recipeId } : {}),
    ...(from === "world" ? { entry: "world" as const } : {}),
    ...(focusParameterId ? { focusParameterId } : {})
  });
  if (!result.ok) {
    return <StarterRemixError message={result.message} />;
  }

  return <BuilderShell key={result.source.lineage.draftId} remixSource={result.source} />;
}

function StarterRemixError({ message }: { message: string }) {
  return (
    <section className="starter-launch-error" data-starter-remix-error role="alert">
      <p>Starter remix stopped</p>
      <h1>This source could not be forked safely</h1>
      <span>{message}</span>
      <div>
        <Link href="/worlds">Back to Explore Worlds</Link>
        <Link href="/builder">Open structural Workshop</Link>
      </div>
    </section>
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hasUnsafeAsyncSearchParamKey(searchParams: BuilderPageProps["searchParams"]): boolean {
  return ["__proto__", "prototype", "constructor", "then", "catch", "finally"]
    .some((key) => Object.prototype.hasOwnProperty.call(searchParams, key));
}
