import { rawStarterWorldDefinitions } from "./definitions";
import type { StarterWorldDefinition } from "./types";
import { validateStarterWorldDefinitions } from "./validation";

const validatedStarterWorlds = validateStarterWorldDefinitions(rawStarterWorldDefinitions).map(deepFreeze);

export const starterWorlds: readonly StarterWorldDefinition[] = deepFreeze([...validatedStarterWorlds]);
export const runnableStarterWorlds: readonly StarterWorldDefinition[] = deepFreeze(
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

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.isFrozen(value) ? value : Object.freeze(value);
}
