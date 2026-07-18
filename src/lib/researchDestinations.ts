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
  route: "/world" | "/lab" | "/atlas" | "/builder";
  purpose: string;
  availability: ResearchDestinationAvailability;
  navigationOrder: number;
  status?: ResearchDestinationStatus;
}

export const researchDestinations: readonly ResearchDestinationDefinition[] = Object.freeze([
  {
    id: "world",
    label: "World",
    route: "/world",
    purpose: "Observe and perturb an active modeled system.",
    availability: "available",
    navigationOrder: 1
  },
  {
    id: "lab",
    label: "Lab",
    route: "/lab",
    purpose: "Structure future evidence records and experiment ledgers without saving Lab data in GW5.",
    availability: "foundation",
    navigationOrder: 2,
    status: {
      label: "Foundation",
      category: "capability",
      state: "planning-only",
      description: "GW5 adds non-persistent Lab information architecture; persistent evidence records are not implemented."
    }
  },
  {
    id: "atlas",
    label: "Atlas",
    route: "/atlas",
    purpose: "Run bounded ephemeral model-space previews without certifying real-world discovery.",
    availability: "available",
    navigationOrder: 3
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
