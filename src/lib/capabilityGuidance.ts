import type { StatusPillCategory, StatusPillState } from "../components/ui/statusPillSemantics";
import {
  getResearchDestinationById,
  type ResearchDestinationDefinition,
  type ResearchDestinationId
} from "./researchDestinations";

export type CapabilityDestinationRole = "live-modeling" | "authoring" | "lab-foundation" | "atlas-foundation";

export type CapabilityAvailability = "available" | "planning-only" | "not-implemented" | "boundary";

export interface CapabilityStatus {
  label: "Available here" | "Planning-only" | "Not implemented" | "Do not assume" | "Related destination";
  category: StatusPillCategory;
  state: StatusPillState;
}

export interface CapabilityGuidanceItem {
  id: string;
  label: string;
  availability: CapabilityAvailability;
  status: CapabilityStatus;
  summary: string;
}

export interface CapabilityBoundary {
  id: string;
  label: string;
  status: CapabilityStatus;
  summary: string;
}

export interface CapabilityRelatedDestination {
  destinationId: ResearchDestinationId;
  label: string;
  route: ResearchDestinationDefinition["route"];
  summary: string;
}

export interface CapabilityGuidanceSummary {
  destinationId: ResearchDestinationId;
  destinationLabel: string;
  route: ResearchDestinationDefinition["route"];
  role: CapabilityDestinationRole;
  roleLabel: string;
  routePurpose: string;
  principle: typeof capabilityGuidancePrinciple;
  boundary: typeof capabilityGuidanceBoundary;
  visibleBoundary: typeof capabilityGuidanceVisibleBoundary;
  availableHere: readonly CapabilityGuidanceItem[];
  planningOnly: readonly CapabilityGuidanceItem[];
  notImplemented: readonly CapabilityGuidanceItem[];
  doNotAssume: readonly CapabilityBoundary[];
  relatedDestinations: readonly CapabilityRelatedDestination[];
}

export const capabilityGuidancePrinciple =
  "Capability guidance describes current product capability. It does not create capability.";

export const capabilityGuidanceBoundary =
  "GW6 creates source-backed guidance and capability orientation. It does not create saved records, Atlas discoveries, Lab experiments, behavioral landscapes, progression, user-derived routing, or behavior-derived task ordering.";

export const capabilityGuidanceVisibleBoundary =
  "Guidance describes current ORTUS capabilities. It does not create saved records, validation, discoveries, or persistence.";

const availableStatus = Object.freeze({
  label: "Available here",
  category: "capability",
  state: "supported"
} satisfies CapabilityStatus);

const planningStatus = Object.freeze({
  label: "Planning-only",
  category: "capability",
  state: "planning-only"
} satisfies CapabilityStatus);

const notImplementedStatus = Object.freeze({
  label: "Not implemented",
  category: "capability",
  state: "future-only"
} satisfies CapabilityStatus);

const capabilityBoundaryStatus = Object.freeze({
  label: "Do not assume",
  category: "capability",
  state: "planning-only"
} satisfies CapabilityStatus);

const evidenceBoundaryStatus = Object.freeze({
  label: "Do not assume",
  category: "evidence",
  state: "unresolved"
} satisfies CapabilityStatus);

function item(
  id: string,
  label: string,
  availability: CapabilityAvailability,
  status: CapabilityStatus,
  summary: string
): CapabilityGuidanceItem {
  return Object.freeze({ id, label, availability, status, summary });
}

function boundary(
  id: string,
  label: string,
  status: CapabilityStatus,
  summary: string
): CapabilityBoundary {
  return Object.freeze({ id, label, status, summary });
}

function related(destinationId: ResearchDestinationId, summary: string): CapabilityRelatedDestination {
  const destination = getResearchDestinationById(destinationId);
  return Object.freeze({
    destinationId,
    label: destination.label,
    route: destination.route,
    summary
  });
}

function summary(
  destinationId: ResearchDestinationId,
  role: CapabilityDestinationRole,
  roleLabel: string,
  availableHere: readonly CapabilityGuidanceItem[],
  planningOnly: readonly CapabilityGuidanceItem[],
  notImplemented: readonly CapabilityGuidanceItem[],
  doNotAssume: readonly CapabilityBoundary[],
  relatedDestinations: readonly CapabilityRelatedDestination[]
): CapabilityGuidanceSummary {
  const destination = getResearchDestinationById(destinationId);
  return Object.freeze({
    destinationId,
    destinationLabel: destination.label,
    route: destination.route,
    role,
    roleLabel,
    routePurpose: destination.purpose,
    principle: capabilityGuidancePrinciple,
    boundary: capabilityGuidanceBoundary,
    visibleBoundary: capabilityGuidanceVisibleBoundary,
    availableHere: Object.freeze([...availableHere]),
    planningOnly: Object.freeze([...planningOnly]),
    notImplemented: Object.freeze([...notImplemented]),
    doNotAssume: Object.freeze([...doNotAssume]),
    relatedDestinations: Object.freeze([...relatedDestinations])
  });
}

export const capabilityGuidanceSummaries: readonly CapabilityGuidanceSummary[] = Object.freeze([
  summary(
    "world",
    "live-modeling",
    "Live modeling surface",
    [
      item(
        "world-active-run",
        "Active local run",
        "available",
        availableStatus,
        "World hosts the active simulation surface, run controls, snapshots, metrics, and template-defined command paths for the current local run."
      ),
      item(
        "world-observation-intervention",
        "Observation and perturbation readiness",
        "available",
        availableStatus,
        "Observe and Intervene summarize current model state and available template-defined perturbations without creating Lab or Atlas records."
      )
    ],
    [
      item(
        "world-lab-atlas-handoff",
        "Research handoff semantics",
        "planning-only",
        planningStatus,
        "Future Lab and Atlas work may organize investigations, but World currently exposes live state rather than durable research assets."
      )
    ],
    [
      item(
        "world-persistent-records",
        "Persistent records and maps",
        "not-implemented",
        notImplementedStatus,
        "World does not create persistent run records, evidence records, Discovery Atlas entries, behavioral landscapes, or reusable research assets."
      )
    ],
    [
      boundary(
        "world-model-output",
        "Model output is not empirical truth",
        evidenceBoundaryStatus,
        "Visible patterns and metrics describe this model under this configuration; they are not measurements of the real world."
      ),
      boundary(
        "world-live-state",
        "Live state is not a saved Lab asset",
        capabilityBoundaryStatus,
        "Current-run intervention entries and observations are engine or snapshot state, not durable Lab data."
      ),
      boundary(
        "world-guidance-only",
        "Guidance is route-scoped orientation",
        capabilityBoundaryStatus,
        "This panel is static product capability guidance; it does not infer user needs from behavior."
      )
    ],
    [
      related("workshop", "Author structural model artifacts without mutating the active run."),
      related("lab", "Read non-persistent evidence-record structure; durable records are not implemented."),
      related("atlas", "Read non-persistent evidence semantics; durable discoveries and maps are not implemented.")
    ]
  ),
  summary(
    "workshop",
    "authoring",
    "Structural authoring surface",
    [
      item(
        "workshop-authoring",
        "Schema and workspace authoring",
        "available",
        availableStatus,
        "Workshop supports structural schema authoring, validation assistance, graph inspection, fit reports, and scenario planning as planning surfaces."
      ),
      item(
        "workshop-readonly-graph",
        "Builder graph inspection",
        "available",
        availableStatus,
        "Graph view supports deterministic inspection, filtering, and accessible outlines without executing nodes or edges."
      )
    ],
    [
      item(
        "workshop-runtime-bridge",
        "Runtime bridge",
        "planning-only",
        planningStatus,
        "Authored structures can inform later runtime work, but they are not engines, scenarios, RunConfigs, or template behavior."
      )
    ],
    [
      item(
        "workshop-execution",
        "Execution and generation",
        "not-implemented",
        notImplementedStatus,
        "Workshop does not compile schemas, execute builder graphs, generate templates, produce scenarios, or apply authored structure to the active simulation."
      )
    ],
    [
      boundary(
        "workshop-valid-runnable",
        "Valid is not runnable",
        capabilityBoundaryStatus,
        "A structurally valid schema or workspace remains planning structure unless separate template runtime support exists."
      ),
      boundary(
        "workshop-no-runtime-mutation",
        "Authoring does not mutate World",
        capabilityBoundaryStatus,
        "Workshop selection, graph inspection, fit reports, and scenario plans do not mutate active simulation state."
      ),
      boundary(
        "workshop-no-hidden-interpreter",
        "No hidden schema interpreter",
        capabilityBoundaryStatus,
        "Rule descriptions, graph edges, and schema metadata are not parsed or executed."
      )
    ],
    [
      related("world", "Run and inspect existing template-owned simulations."),
      related("lab", "Read non-persistent evidence-record structure for future investigation records."),
      related("atlas", "Read non-persistent evidence-state structure for future model-behavior maps.")
    ]
  ),
  summary(
    "lab",
    "lab-foundation",
    "Evidence-record foundation",
    [
      item(
        "lab-information-architecture",
        "Evidence-record vocabulary",
        "available",
        availableStatus,
        "Lab exposes non-persistent lifecycle semantics, model-only evidence boundaries, and a conceptual experiment-ledger scaffold."
      )
    ],
    [
      item(
        "lab-record-model",
        "Durable Lab record model",
        "planning-only",
        planningStatus,
        "The current route describes how future evidence records should be interpreted; it does not preserve run data."
      )
    ],
    [
      item(
        "lab-persistence",
        "Persistent Lab assets",
        "not-implemented",
        notImplementedStatus,
        "Persistent evidence records, experiment ledgers, notebooks, saved comparisons, run history, and Lab-to-Atlas publication are not implemented."
      )
    ],
    [
      boundary(
        "lab-not-database",
        "Lab is not a database",
        capabilityBoundaryStatus,
        "The Lab surface is readable information architecture, not storage, account state, local history, or a durable research repository."
      ),
      boundary(
        "lab-not-validation",
        "Lab records would not validate reality",
        evidenceBoundaryStatus,
        "Future records may organize model investigations; they would not certify real-world truth by existing."
      ),
      boundary(
        "lab-not-user-advice",
        "Guidance is static",
        capabilityBoundaryStatus,
        "Capability orientation is static and source-backed; it is not inferred from the user or derived from user behavior."
      )
    ],
    [
      related("world", "Inspect current model state; World does not preserve Lab records."),
      related("atlas", "Read non-persistent evidence semantics; durable Atlas publication is not implemented."),
      related("workshop", "Author structural model artifacts; authoring does not create Lab records.")
    ]
  ),
  summary(
    "atlas",
    "atlas-foundation",
    "Evidence-orientation foundation",
    [
      item(
        "atlas-information-architecture",
        "Evidence-state vocabulary",
        "available",
        availableStatus,
        "Atlas exposes non-persistent evidence states, sampled/unsampled interpretation, and a conceptual scaffold for investigated model behavior."
      )
    ],
    [
      item(
        "atlas-map-semantics",
        "Model-behavior map semantics",
        "planning-only",
        planningStatus,
        "Future Atlas work may organize investigated regions, but the current route does not contain sampled data or durable maps."
      )
    ],
    [
      item(
        "atlas-persistence",
        "Discovery records and landscapes",
        "not-implemented",
        notImplementedStatus,
        "Discovery Atlas records, persistent evidence maps, sampled-region displays backed by run data, behavioral landscapes, and evidence-rating surfaces are not implemented."
      )
    ],
    [
      boundary(
        "atlas-not-discovery-certification",
        "Atlas is not discovery certification",
        evidenceBoundaryStatus,
        "Evidence-state labels describe model-investigation semantics; they do not certify discoveries about the real world."
      ),
      boundary(
        "atlas-no-hidden-samples",
        "Unsampled regions remain unknown",
        evidenceBoundaryStatus,
        "A conceptual scaffold does not imply sampled parameter space, inferred regimes, or validated behavioral landscapes."
      ),
      boundary(
        "atlas-not-user-advice",
        "Guidance is static",
        capabilityBoundaryStatus,
        "Capability orientation is static and source-backed; it does not infer user needs, order route choices, or target users."
      )
    ],
    [
      related("world", "Inspect current model state; World does not create Atlas records."),
      related("lab", "Read non-persistent evidence-record structure; Lab publication is not implemented."),
      related("workshop", "Author structural model artifacts; authoring does not create Atlas maps.")
    ]
  )
]);

export const capabilityGuidanceRouteContract = Object.freeze(
  capabilityGuidanceSummaries.map((guidance) => ({
    destinationId: guidance.destinationId,
    route: guidance.route,
    label: guidance.destinationLabel
  }))
);

export function getCapabilityGuidanceByDestinationId(destinationId: ResearchDestinationId): CapabilityGuidanceSummary {
  const guidance = capabilityGuidanceSummaries.find((candidate) => candidate.destinationId === destinationId);
  if (!guidance) {
    throw new Error(`Unknown capability guidance destination: ${destinationId}`);
  }
  return guidance;
}

export function getCapabilityGuidanceByRoute(route: ResearchDestinationDefinition["route"]): CapabilityGuidanceSummary {
  const guidance = capabilityGuidanceSummaries.find((candidate) => candidate.route === route);
  if (!guidance) {
    throw new Error(`Unknown capability guidance route: ${route}`);
  }
  return guidance;
}

export function getCapabilityGuidanceCanonicalRoutes(): readonly ResearchDestinationDefinition["route"][] {
  return capabilityGuidanceRouteContract.map((contract) => contract.route);
}
