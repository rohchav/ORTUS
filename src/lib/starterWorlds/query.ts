import type {
  StarterWorldComplexity,
  StarterWorldDefinition,
  StarterWorldDomain,
  StarterWorldMechanism,
  StarterWorldSystemForm
} from "./types";

export interface StarterWorldFilters {
  domain?: StarterWorldDomain;
  mechanism?: StarterWorldMechanism;
  systemForm?: StarterWorldSystemForm;
  complexity?: StarterWorldComplexity;
}

export function filterStarterWorlds(
  definitions: readonly StarterWorldDefinition[],
  filters: StarterWorldFilters
): StarterWorldDefinition[] {
  return definitions.filter(
    (definition) =>
      (!filters.domain || definition.domain.includes(filters.domain)) &&
      (!filters.mechanism || definition.mechanisms.includes(filters.mechanism)) &&
      (!filters.systemForm || definition.systemForms.includes(filters.systemForm)) &&
      (!filters.complexity || definition.complexity === filters.complexity)
  );
}

export function searchStarterWorlds(
  definitions: readonly StarterWorldDefinition[],
  search: string
): StarterWorldDefinition[] {
  const terms = normalizeSearch(search).split(" ").filter(Boolean);
  if (terms.length === 0) {
    return [...definitions];
  }
  return definitions.filter((definition) => {
    const haystack = starterWorldSearchText(definition);
    return terms.every((term) => haystack.includes(term));
  });
}

export function queryStarterWorlds(
  definitions: readonly StarterWorldDefinition[],
  filters: StarterWorldFilters,
  search: string
): StarterWorldDefinition[] {
  return searchStarterWorlds(filterStarterWorlds(definitions, filters), search);
}

export function starterWorldSearchText(definition: StarterWorldDefinition): string {
  const anatomy = Object.entries(definition.anatomy).flatMap(([facet, values]) => [facet, ...(values ?? [])]);
  return normalizeSearch(
    [
      definition.title,
      definition.shortTitle,
      definition.hookQuestion,
      definition.oneSentencePremise,
      definition.summary,
      ...definition.domain,
      ...definition.mechanisms,
      ...definition.systemForms,
      ...definition.catalogIndicators,
      ...definition.primaryMechanisms,
      ...anatomy
    ].join(" ")
  );
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
