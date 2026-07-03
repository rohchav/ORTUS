import type { StatusPillCategory, StatusPillState } from "../components/ui/statusPillSemantics";

export type LandscapeConceptId =
  | "behavioral-landscape"
  | "parameter-space"
  | "outcome-space"
  | "model-condition"
  | "sampled-area"
  | "unsampled-area"
  | "unresolved-region"
  | "model-regime"
  | "transition-zone"
  | "sensitivity-zone"
  | "externally-unvalidated-area"
  | "conceptual-scaffold"
  | "future-sampled-landscape";

export type LandscapeAxisId = "parameter-axis" | "outcome-axis";

export type LandscapeRegionStateId =
  | "unsampled"
  | "future-sampled"
  | "unresolved"
  | "supported-within-model"
  | "contradicted-within-model"
  | "transition-zone"
  | "sensitivity-zone"
  | "model-regime"
  | "externally-unvalidated"
  | "future-sampled-landscape";

export type LandscapeBoundaryId =
  | "conceptual-vs-sampled"
  | "world-relationship"
  | "lab-relationship"
  | "atlas-relationship"
  | "model-vs-real-world"
  | "non-persistence";

export interface LandscapeStatus {
  label: string;
  category: Extract<StatusPillCategory, "evidence" | "capability">;
  state: Extract<StatusPillState, "supported" | "contradicted" | "unresolved" | "planning-only" | "future-only">;
}

export interface LandscapeConcept {
  id: LandscapeConceptId;
  label: string;
  status: LandscapeStatus;
  summary: string;
  distinction: string;
}

export interface LandscapeAxis {
  id: LandscapeAxisId;
  label: string;
  status: LandscapeStatus;
  summary: string;
  notData: string;
}

export interface LandscapeRegionState {
  id: LandscapeRegionStateId;
  label: string;
  status: LandscapeStatus;
  summary: string;
  interpretation: string;
}

export interface LandscapeBoundary {
  id: LandscapeBoundaryId;
  title: string;
  status: LandscapeStatus;
  summary: string;
}

export interface LandscapeScaffoldSummary {
  label: "Conceptual scaffold - not sampled run data.";
  status: LandscapeStatus;
  summary: string;
  anatomy: readonly string[];
  boundary: string;
}

export interface BehavioralLandscapeFoundation {
  title: "Behavioral Landscape Foundation";
  statusLabel: "GW7 foundation";
  status: LandscapeStatus;
  principle: string;
  boundary: string;
  purpose: string;
  axes: readonly LandscapeAxis[];
  concepts: readonly LandscapeConcept[];
  regionStates: readonly LandscapeRegionState[];
  scaffold: LandscapeScaffoldSummary;
  boundaries: readonly LandscapeBoundary[];
}

const capabilityPlanningStatus = Object.freeze({
  label: "Planning-only",
  category: "capability",
  state: "planning-only"
} satisfies LandscapeStatus);

const capabilityFutureStatus = Object.freeze({
  label: "Future-only",
  category: "capability",
  state: "future-only"
} satisfies LandscapeStatus);

const evidenceUnresolvedStatus = Object.freeze({
  label: "Unresolved",
  category: "evidence",
  state: "unresolved"
} satisfies LandscapeStatus);

const evidenceSupportedStatus = Object.freeze({
  label: "Supported within model",
  category: "evidence",
  state: "supported"
} satisfies LandscapeStatus);

const evidenceContradictedStatus = Object.freeze({
  label: "Contradicted within model",
  category: "evidence",
  state: "contradicted"
} satisfies LandscapeStatus);

export const landscapeAxes = [
  {
    id: "parameter-axis",
    label: "Parameter axis",
    status: capabilityPlanningStatus,
    summary: "Names a model condition that could be varied in future source-backed exploration.",
    notData: "A parameter axis is a coordinate idea, not a sampled map or runtime sweep."
  },
  {
    id: "outcome-axis",
    label: "Outcome axis",
    status: capabilityPlanningStatus,
    summary: "Names a model-output dimension that could be compared after future source-backed sampling.",
    notData: "An outcome axis is not an empirical measurement or validation result."
  }
] as const satisfies readonly LandscapeAxis[];

export const landscapeConcepts = [
  {
    id: "behavioral-landscape",
    label: "Behavioral landscape",
    status: capabilityPlanningStatus,
    summary: "A way to describe how model behavior may vary across model conditions.",
    distinction: "A behavioral landscape is not a real-world map, empirical proof, or Discovery Atlas record."
  },
  {
    id: "parameter-space",
    label: "Parameter space",
    status: capabilityPlanningStatus,
    summary: "The bounded set of model inputs, assumptions, or initial conditions a future study may vary.",
    distinction: "Parameter space is not automatically sampled by naming it."
  },
  {
    id: "outcome-space",
    label: "Outcome space",
    status: capabilityPlanningStatus,
    summary: "The set of model-output summaries a future study may compare across conditions.",
    distinction: "Outcome space is model output, not empirical truth."
  },
  {
    id: "model-condition",
    label: "Model condition",
    status: capabilityPlanningStatus,
    summary: "A specific template, scenario, seed, parameter, or assumption context inside the model boundary.",
    distinction: "Model condition is not external-world context unless later evidence connects it."
  },
  {
    id: "sampled-area",
    label: "Sampled area",
    status: evidenceUnresolvedStatus,
    summary: "A future area could be called sampled only after source-backed model runs exist.",
    distinction: "Sampled in model space is not empirically validated."
  },
  {
    id: "unsampled-area",
    label: "Unsampled area",
    status: evidenceUnresolvedStatus,
    summary: "No source-backed model samples are attached.",
    distinction: "Unsampled means unknown in model space, not failed, locked, or known."
  },
  {
    id: "unresolved-region",
    label: "Unresolved region",
    status: evidenceUnresolvedStatus,
    summary: "Future model evidence may be insufficient or conflicting.",
    distinction: "Unresolved is an epistemic state, not an operational error."
  },
  {
    id: "model-regime",
    label: "Model regime",
    status: evidenceUnresolvedStatus,
    summary: "A future source-backed pattern of model behavior within explicit model conditions.",
    distinction: "Model regime is not a real-world law."
  },
  {
    id: "transition-zone",
    label: "Transition zone",
    status: evidenceUnresolvedStatus,
    summary: "A future area where model outputs may change qualitatively across nearby model conditions.",
    distinction: "Transition zone is not a proven tipping point."
  },
  {
    id: "sensitivity-zone",
    label: "Sensitivity zone",
    status: evidenceUnresolvedStatus,
    summary: "A future area where model outputs may vary strongly under nearby model conditions.",
    distinction: "Sensitivity is not causal certainty."
  },
  {
    id: "externally-unvalidated-area",
    label: "Externally unvalidated area",
    status: evidenceUnresolvedStatus,
    summary: "A future model-space interpretation without external calibration or validation.",
    distinction: "Externally unvalidated model behavior is not empirical truth."
  },
  {
    id: "conceptual-scaffold",
    label: "Conceptual scaffold",
    status: capabilityFutureStatus,
    summary: "A text-only anatomy for future exploration vocabulary.",
    distinction: "Conceptual scaffold is not run data."
  },
  {
    id: "future-sampled-landscape",
    label: "Future sampled landscape",
    status: capabilityFutureStatus,
    summary: "A later capability that would need explicit run provenance, sampling rules, and audit.",
    distinction: "Future-only is not locked progression and not current evidence support."
  }
] as const satisfies readonly LandscapeConcept[];

export const landscapeRegionStates = [
  {
    id: "unsampled",
    label: "Unsampled",
    status: evidenceUnresolvedStatus,
    summary: "No source-backed model-space sample is attached.",
    interpretation: "Unknown in model space; not a failed route or hidden known result."
  },
  {
    id: "future-sampled",
    label: "Sampled in future model space",
    status: evidenceUnresolvedStatus,
    summary: "Would require source-backed model-run evidence before it can be described as sampled.",
    interpretation: "Sampling in model space would still not validate real-world claims."
  },
  {
    id: "unresolved",
    label: "Unresolved region",
    status: evidenceUnresolvedStatus,
    summary: "Future model evidence may be incomplete, conflicting, or insufficient for interpretation.",
    interpretation: "Unresolved is an evidence state, not an operational failure."
  },
  {
    id: "supported-within-model",
    label: "Supported within model",
    status: evidenceSupportedStatus,
    summary: "Future source-backed model evidence supports an interpretation inside the model boundary.",
    interpretation: "Supported inside the model is not empirical proof."
  },
  {
    id: "contradicted-within-model",
    label: "Contradicted within model",
    status: evidenceContradictedStatus,
    summary: "Future source-backed model evidence conflicts with an interpretation inside the model boundary.",
    interpretation: "Contradicted inside a model is useful evidence, not a software failure."
  },
  {
    id: "transition-zone",
    label: "Transition zone",
    status: evidenceUnresolvedStatus,
    summary: "Future sampling may show a qualitative model-output shift near this area.",
    interpretation: "A transition zone is not a proven real-world tipping point."
  },
  {
    id: "sensitivity-zone",
    label: "Sensitivity zone",
    status: evidenceUnresolvedStatus,
    summary: "Future sampling may show strong model-output variation under nearby model conditions.",
    interpretation: "Sensitivity is not causal certainty."
  },
  {
    id: "model-regime",
    label: "Model regime",
    status: evidenceUnresolvedStatus,
    summary: "Future sampling may support a bounded pattern of model behavior.",
    interpretation: "A model regime is not a real-world law or policy effect."
  },
  {
    id: "externally-unvalidated",
    label: "Externally unvalidated area",
    status: evidenceUnresolvedStatus,
    summary: "A future model-space region without external validation or calibration.",
    interpretation: "Model output is not empirical truth."
  },
  {
    id: "future-sampled-landscape",
    label: "Future sampled landscape",
    status: capabilityFutureStatus,
    summary: "A later capability requiring explicit sampling, provenance, and audit.",
    interpretation: "Future-only is capability status, not evidence support or locked progression."
  }
] as const satisfies readonly LandscapeRegionState[];

export const landscapeScaffoldSummary: LandscapeScaffoldSummary = {
  label: "Conceptual scaffold - not sampled run data.",
  status: capabilityFutureStatus,
  summary:
    "The scaffold names landscape anatomy so modelers can reason about future exploration without pretending data exists now.",
  anatomy: [
    "Parameter axis: a model condition that could be varied later.",
    "Outcome axis: a model-output summary that could be compared later.",
    "Area state: a text status for sampled, unsampled, unresolved, or future source-backed interpretation.",
    "Boundary note: explicit copy that model-space interpretation is not real-world validation."
  ],
  boundary: "This scaffold has no data points, no persisted areas, no automatic model-regime discovery, and no run ingestion."
} as const;

export const landscapeBoundaries = [
  {
    id: "conceptual-vs-sampled",
    title: "Conceptual Anatomy Is Not Run Data",
    status: capabilityFutureStatus,
    summary: "A vocabulary scaffold can explain terms without showing sampled model-space data."
  },
  {
    id: "world-relationship",
    title: "Relationship To World",
    status: evidenceUnresolvedStatus,
    summary: "World is where live model behavior is observed. GW7 does not turn World runs into sampled landscape data."
  },
  {
    id: "lab-relationship",
    title: "Relationship To Lab",
    status: capabilityPlanningStatus,
    summary: "Lab describes how future evidence records could be organized. GW7 does not create landscape records or experiment ledgers."
  },
  {
    id: "atlas-relationship",
    title: "Relationship To Atlas",
    status: capabilityPlanningStatus,
    summary:
      "Behavioral landscapes are not implemented as saved Atlas maps in GW7. This section describes the vocabulary and boundaries for future model-space exploration."
  },
  {
    id: "model-vs-real-world",
    title: "Model Space Is Not The Real World",
    status: evidenceUnresolvedStatus,
    summary:
      "A landscape region can describe model behavior only after source-backed sampling. It does not certify real-world regimes or policy effects."
  },
  {
    id: "non-persistence",
    title: "Non-Persistence Boundary",
    status: capabilityPlanningStatus,
    summary:
      "GW7 creates behavioral-landscape vocabulary and non-persistent exploration scaffolding. It does not create saved landscapes, sampled-region maps, evidence records, Atlas discoveries, Lab experiments, regime detection, or real-world validation."
  }
] as const satisfies readonly LandscapeBoundary[];

export const behavioralLandscapeFoundation: BehavioralLandscapeFoundation = {
  title: "Behavioral Landscape Foundation",
  statusLabel: "GW7 foundation",
  status: capabilityPlanningStatus,
  principle:
    "A behavioral landscape describes how model behavior may vary across model conditions. It is not a real-world map, empirical proof, or Discovery Atlas record.",
  boundary:
    "GW7 creates behavioral-landscape vocabulary and non-persistent exploration scaffolding. It does not create saved landscapes, sampled-region maps, evidence records, Atlas discoveries, Lab experiments, regime detection, or real-world validation.",
  purpose:
    "Help modelers understand parameter space, outcome space, sampled and unsampled areas, and model regimes before ORTUS has persistent landscape maps.",
  axes: landscapeAxes,
  concepts: landscapeConcepts,
  regionStates: landscapeRegionStates,
  scaffold: landscapeScaffoldSummary,
  boundaries: landscapeBoundaries
} as const;

export function getLandscapeConceptById(id: LandscapeConceptId): LandscapeConcept {
  const concept = landscapeConcepts.find((candidate) => candidate.id === id);
  if (!concept) {
    throw new Error(`Unknown behavioral landscape concept: ${id}`);
  }
  return concept;
}

export function getLandscapeRegionStateById(id: LandscapeRegionStateId): LandscapeRegionState {
  const regionState = landscapeRegionStates.find((candidate) => candidate.id === id);
  if (!regionState) {
    throw new Error(`Unknown behavioral landscape region state: ${id}`);
  }
  return regionState;
}
