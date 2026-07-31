"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  queryStarterWorlds,
  starterWorldComplexities,
  starterWorldComplexityLabels,
  starterWorldDomainLabels,
  starterWorldDomains,
  starterWorldMechanismLabels,
  starterWorldMechanisms,
  starterWorldSystemFormLabels,
  starterWorldSystemForms,
  type StarterWorldComplexity,
  type StarterWorldDefinition,
  type StarterWorldDomain,
  type StarterWorldFilters,
  type StarterWorldMechanism,
  type StarterWorldSystemForm
} from "../../lib/starterWorlds";
import { StarterWorldVisual } from "./StarterWorldVisual";

interface ExploreWorldsCatalogProps {
  worlds: readonly StarterWorldDefinition[];
  featuredWorldId: string;
}

const noFilters: StarterWorldFilters = {};

export function ExploreWorldsCatalog({ worlds, featuredWorldId }: ExploreWorldsCatalogProps) {
  const [filters, setFilters] = useState<StarterWorldFilters>(noFilters);
  const [search, setSearch] = useState("");
  const featured = worlds.find((world) => world.id === featuredWorldId) ?? worlds[0]!;
  const results = useMemo(() => queryStarterWorlds(worlds, filters, search), [filters, search, worlds]);
  const activeFilterText = filterSummary(filters, search);
  const domainOptions = starterWorldDomains.filter((value) => worlds.some((world) => world.domain.includes(value)));
  const mechanismOptions = starterWorldMechanisms.filter((value) => worlds.some((world) => world.mechanisms.includes(value)));
  const formOptions = starterWorldSystemForms.filter((value) => worlds.some((world) => world.systemForms.includes(value)));
  const complexityOptions = starterWorldComplexities.filter((value) => worlds.some((world) => world.complexity === value));

  function reset() {
    setFilters(noFilters);
    setSearch("");
  }

  return (
    <div className="worlds-catalog" data-worlds-catalog>
      <header className="worlds-catalog__intro">
        <p>Runnable systems, prepared for investigation</p>
        <h1>Explore Worlds</h1>
        <span>Choose a question, inspect the mechanism, and enter a fresh runnable world with one useful change already in view.</span>
      </header>

      <section className="worlds-feature" aria-labelledby="worlds-feature-title">
        <StarterWorldVisual kind={featured.visualKind} />
        <div className="worlds-feature__copy">
          <p>Featured Starter World</p>
          <h2 id="worlds-feature-title">{featured.hookQuestion}</h2>
          <strong>{featured.title}</strong>
          <span>{featured.oneSentencePremise}</span>
          <div className="worlds-feature__signals" aria-label="Featured world characteristics">
            {featured.catalogIndicators.slice(0, 3).map((indicator) => (
              <span key={indicator}>{indicator}</span>
            ))}
          </div>
          <Link
            href={`/worlds/${featured.slug}`}
            aria-label={`Explore featured world: ${featured.title}`}
          >
            Explore featured world
          </Link>
        </div>
      </section>

      <section className="worlds-browse" aria-labelledby="worlds-browse-title">
        <div className="worlds-browse__heading">
          <div>
            <p>Browse runnable worlds</p>
            <h2 id="worlds-browse-title">Find a system by question or mechanism</h2>
          </div>
          <span aria-live="polite">{results.length} of {worlds.length} worlds shown</span>
        </div>

        <div className="worlds-filters" aria-label="Explore Worlds filters">
          <label className="worlds-search">
            <span>Search worlds</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try coordination, grid, delay..."
            />
          </label>
          <FilterSelect
            label="Domain"
            value={filters.domain}
            options={domainOptions}
            labels={starterWorldDomainLabels}
            onChange={(domain) => setFilters((current) => ({ ...current, domain }))}
          />
          <FilterSelect
            label="Mechanism"
            value={filters.mechanism}
            options={mechanismOptions}
            labels={starterWorldMechanismLabels}
            onChange={(mechanism) => setFilters((current) => ({ ...current, mechanism }))}
          />
          <FilterSelect
            label="System form"
            value={filters.systemForm}
            options={formOptions}
            labels={starterWorldSystemFormLabels}
            onChange={(systemForm) => setFilters((current) => ({ ...current, systemForm }))}
          />
          <FilterSelect
            label="Complexity"
            value={filters.complexity}
            options={complexityOptions}
            labels={starterWorldComplexityLabels}
            onChange={(complexity) => setFilters((current) => ({ ...current, complexity }))}
          />
          <button type="button" className="worlds-filters__reset" onClick={reset} disabled={activeFilterText === "None"}>
            Reset
          </button>
        </div>

        <p className="worlds-filters__status" aria-live="polite">
          <strong>Active filters:</strong> {activeFilterText}
        </p>

        {results.length > 0 ? (
          <div className="worlds-grid">
            {results.map((world) => (
              <article key={world.id} className={`world-card world-card--${world.visualKind}`} data-starter-card={world.id}>
                <StarterWorldVisual kind={world.visualKind} compact />
                <div className="world-card__copy">
                  <p className="world-card__hook">{world.hookQuestion}</p>
                  <h3>{world.title}</h3>
                  <span className="world-card__premise">{world.oneSentencePremise}</span>
                  <ul aria-label={`${world.title} characteristics`}>
                    {world.catalogIndicators.map((indicator) => (
                      <li key={indicator}>{indicator}</li>
                    ))}
                  </ul>
                  <div className="world-card__activity">
                    <span>First activity</span>
                    <strong>{world.estimatedFirstActivity}</strong>
                  </div>
                  <Link href={`/worlds/${world.slug}`} aria-label={`Explore ${world.title}`}>
                    Explore world
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="worlds-empty" aria-labelledby="worlds-empty-title">
            <h3 id="worlds-empty-title">No runnable worlds match this combination</h3>
            <p>Active filters: {activeFilterText}. The catalog does not add planned or imaginary results.</p>
            <button type="button" onClick={reset}>Reset browse controls</button>
          </section>
        )}
      </section>
    </div>
  );
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T | undefined;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T | undefined) => void;
}

function FilterSelect<T extends string>({ label, value, options, labels, onChange }: FilterSelectProps<T>) {
  return (
    <label className="worlds-filter">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value ?? ""}
        onChange={(event) => onChange((event.target.value || undefined) as T | undefined)}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{labels[option]}</option>
        ))}
      </select>
    </label>
  );
}

function filterSummary(filters: StarterWorldFilters, search: string): string {
  const values = [
    filters.domain ? `Domain: ${starterWorldDomainLabels[filters.domain as StarterWorldDomain]}` : null,
    filters.mechanism ? `Mechanism: ${starterWorldMechanismLabels[filters.mechanism as StarterWorldMechanism]}` : null,
    filters.systemForm ? `System form: ${starterWorldSystemFormLabels[filters.systemForm as StarterWorldSystemForm]}` : null,
    filters.complexity ? `Complexity: ${starterWorldComplexityLabels[filters.complexity as StarterWorldComplexity]}` : null,
    search.trim() ? `Search: "${search.trim()}"` : null
  ].filter((value): value is string => Boolean(value));
  return values.length > 0 ? values.join("; ") : "None";
}
