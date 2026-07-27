import { rawStarterWorldDefinitions } from "./definitions";
import type { StarterWorldDefinition } from "./types";
import { validateStarterWorldDefinitions } from "./validation";

const validatedStarterWorlds = validateStarterWorldDefinitions(rawStarterWorldDefinitions);

export const starterWorlds: readonly StarterWorldDefinition[] = Object.freeze([...validatedStarterWorlds]);
export const runnableStarterWorlds: readonly StarterWorldDefinition[] = Object.freeze(
  starterWorlds.filter((definition) => definition.runtimeStatus === "runnable")
);

export function getStarterWorldById(id: string): StarterWorldDefinition | undefined {
  return starterWorlds.find((definition) => definition.id === id);
}

export function getStarterWorldBySlug(slug: string): StarterWorldDefinition | undefined {
  return starterWorlds.find((definition) => definition.slug === slug);
}

export function requireStarterWorldById(id: string): StarterWorldDefinition {
  const definition = getStarterWorldById(id);
  if (!definition) {
    throw new Error(`Unknown Starter World: ${id}`);
  }
  return definition;
}

export function requireStarterWorldBySlug(slug: string): StarterWorldDefinition {
  const definition = getStarterWorldBySlug(slug);
  if (!definition) {
    throw new Error(`Unknown Starter World slug: ${slug}`);
  }
  return definition;
}

export const featuredStarterWorld =
  runnableStarterWorlds.find((definition) => definition.featured) ?? runnableStarterWorlds[0]!;
