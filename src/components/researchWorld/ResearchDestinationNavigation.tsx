"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getResearchDestinationByPathname,
  isFutureOnlyResearchDestination,
  researchDestinations
} from "../../lib/researchDestinations";

export function ResearchDestinationNavigation() {
  const pathname = usePathname();
  const currentDestination = getResearchDestinationByPathname(pathname);

  return (
    <nav className="research-destination-nav" aria-label="Research World destinations">
      <ol className="research-destination-nav__list">
        {researchDestinations.map((destination) => {
          const current = currentDestination?.id === destination.id;
          const futureOnly = isFutureOnlyResearchDestination(destination);
          return (
            <li key={destination.id}>
              <Link
                href={destination.route}
                className="research-destination-nav__link"
                aria-current={current ? "page" : undefined}
                aria-label={futureOnly ? `${destination.label}, future-only destination` : destination.label}
                data-destination-id={destination.id}
              >
                <span data-destination-label>{destination.label}</span>
                {futureOnly ? <span className="research-destination-nav__future">Future</span> : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
