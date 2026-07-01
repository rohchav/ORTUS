export type ResearchDestinationId = "world" | "lab" | "atlas" | "workshop";

export type ResearchDestinationAvailability = "available" | "foundation" | "future-only";

export interface ResearchDestinationStatus {
  label: "Foundation" | "Future-only";
  category: "capability";
  state: "planning-only" | "future-only";
  description: string;
}

export interface ResearchDestinationDefinition {
  id: ResearchDestinationId;
  label: string;
  route: "/" | "/lab" | "/atlas" | "/builder";
  purpose: string;
  availability: ResearchDestinationAvailability;
  navigationOrder: number;
  status?: ResearchDestinationStatus;
}

const futureOnlyStatus = (description: string): ResearchDestinationStatus => ({
  label: "Future-only",
  category: "capability",
  state: "future-only",
  description
});

export const researchDestinations: readonly ResearchDestinationDefinition[] = Object.freeze([
  {
    id: "world",
    label: "World",
    route: "/",
    purpose: "Observe and perturb an active modeled system.",
    availability: "available",
    navigationOrder: 1
  },
  {
    id: "lab",
    label: "Lab",
    route: "/lab",
    purpose: "Organize experiments, evidence, and reusable research assets.",
    availability: "future-only",
    navigationOrder: 2,
    status: futureOnlyStatus("Lab is an informational foundation in GW1; persistent research data is not implemented.")
  },
  {
    id: "atlas",
    label: "Atlas",
    route: "/atlas",
    purpose: "Orient evidence about investigated model behavior without certifying real-world discovery.",
    availability: "foundation",
    navigationOrder: 3,
    status: {
      label: "Foundation",
      category: "capability",
      state: "planning-only",
      description: "GW4 adds non-persistent Atlas information architecture; Discovery Atlas records are not implemented."
    }
  },
  {
    id: "workshop",
    label: "Workshop",
    route: "/builder",
    purpose: "Construct and inspect model structure.",
    availability: "available",
    navigationOrder: 4
  }
]);

export function getResearchDestinationById(id: ResearchDestinationId): ResearchDestinationDefinition {
  const destination = researchDestinations.find((candidate) => candidate.id === id);
  if (!destination) {
    throw new Error(`Unknown Research World destination: ${id}`);
  }
  return destination;
}

export function getResearchDestinationByPathname(pathname: string): ResearchDestinationDefinition | null {
  const normalized = normalizePathname(pathname);
  return (
    researchDestinations.find((destination) => {
      if (destination.route === "/") {
        return normalized === "/";
      }
      return normalized === destination.route || normalized.startsWith(`${destination.route}/`);
    }) ?? null
  );
}

export function getCanonicalResearchDestinationRoutes(): readonly ResearchDestinationDefinition["route"][] {
  return researchDestinations.map((destination) => destination.route);
}

export function isFutureOnlyResearchDestination(destination: ResearchDestinationDefinition): boolean {
  return destination.availability === "future-only";
}

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] ?? "/";
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const withoutTrailingSlash = withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;
  return withoutTrailingSlash || "/";
}
