import { rawGuidedInvestigationDefinitions } from "./definitions";
import type { GuidedInvestigationDefinition } from "./types";
import { validateGuidedInvestigationDefinitions } from "./validation";

const validatedGuides = validateGuidedInvestigationDefinitions(rawGuidedInvestigationDefinitions).map(deepFreeze);

export const guidedInvestigations: readonly GuidedInvestigationDefinition[] = deepFreeze([
  ...validatedGuides
]);

export function getGuidedInvestigationById(id: string): GuidedInvestigationDefinition | undefined {
  return guidedInvestigations.find((guide) => guide.id === id);
}

export function getGuidedInvestigationBySlug(slug: string): GuidedInvestigationDefinition | undefined {
  return guidedInvestigations.find((guide) => guide.slug === slug);
}

export function getGuidedInvestigationForWorld(
  starterWorldId: string
): GuidedInvestigationDefinition | undefined {
  return guidedInvestigations.find((guide) => guide.starterWorldId === starterWorldId);
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}
