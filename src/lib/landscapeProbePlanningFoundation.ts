import type { StatusPillCategory, StatusPillState } from "../components/ui/statusPillSemantics";

export type LandscapeProbePlanConceptId =
  | "probe-intent"
  | "candidate-parameter-axis"
  | "candidate-outcome-measure"
  | "candidate-range"
  | "candidate-constraint"
  | "sampling-intent"
  | "planned-comparison"
  | "unresolved-feasibility"
  | "externally-unvalidated-hypothesis"
  | "non-executable-plan"
  | "future-sampled-probe";

export type LandscapeProbeAxisCandidateId =
  | "model-condition-axis"
  | "parameter-range-axis"
  | "seed-scenario-axis";

export type LandscapeProbeOutcomeCandidateId =
  | "model-output-measure"
  | "comparison-outcome"
  | "interpretation-check";

export type LandscapeProbeConstraintId =
  | "template-capability-boundary"
  | "provenance-requirement"
  | "sampling-design-requirement"
  | "external-validation-gap";

export type LandscapeProbeBoundaryId =
  | "planning-vs-execution"
  | "sampling-intent-vs-result"
  | "world-relationship"
  | "lab-relationship"
  | "atlas-relationship"
  | "model-vs-real-world"
  | "non-persistence";

export interface LandscapeProbePlanningStatus {
  label: string;
  category: Extract<StatusPillCategory, "evidence" | "capability">;
  state: Extract<StatusPillState, "unresolved" | "planning-only" | "future-only">;
}

export interface LandscapeProbePlanConcept {
  id: LandscapeProbePlanConceptId;
  label: string;
  status: LandscapeProbePlanningStatus;
  summary: string;
  distinction: string;
}

export interface LandscapeProbeAxisCandidate {
  id: LandscapeProbeAxisCandidateId;
  label: string;
  status: LandscapeProbePlanningStatus;
  summary: string;
  notSampled: string;
}

export interface LandscapeProbeOutcomeCandidate {
  id: LandscapeProbeOutcomeCandidateId;
  label: string;
  status: LandscapeProbePlanningStatus;
  summary: string;
  notEvidence: string;
}

export interface LandscapeProbeConstraint {
  id: LandscapeProbeConstraintId;
  label: string;
  status: LandscapeProbePlanningStatus;
  summary: string;
  boundary: string;
}

export interface LandscapeProbeBoundary {
  id: LandscapeProbeBoundaryId;
  title: string;
  status: LandscapeProbePlanningStatus;
  summary: string;
}

export interface LandscapeProbePlanningSummary {
  label: "Conceptual probe plan - not executable and not saved.";
  status: LandscapeProbePlanningStatus;
  summary: string;
  anatomy: readonly string[];
  boundary: string;
}

export interface LandscapeProbePlanningFoundation {
  title: "Landscape Probe Planning";
  statusLabel: "GW8 foundation";
  status: LandscapeProbePlanningStatus;
  principle: string;
  boundary: string;
  purpose: string;
  concepts: readonly LandscapeProbePlanConcept[];
  axes: readonly LandscapeProbeAxisCandidate[];
  outcomes: readonly LandscapeProbeOutcomeCandidate[];
  constraints: readonly LandscapeProbeConstraint[];
  scaffold: LandscapeProbePlanningSummary;
  boundaries: readonly LandscapeProbeBoundary[];
}

const capabilityPlanningStatus = Object.freeze({
  label: "Planning-only",
  category: "capability",
  state: "planning-only"
} satisfies LandscapeProbePlanningStatus);

const capabilityFutureStatus = Object.freeze({
  label: "Future-only",
  category: "capability",
  state: "future-only"
} satisfies LandscapeProbePlanningStatus);

const evidenceUnresolvedStatus = Object.freeze({
  label: "Unresolved",
  category: "evidence",
  state: "unresolved"
} satisfies LandscapeProbePlanningStatus);

export const landscapeProbePlanConcepts = [
  {
    id: "probe-intent",
    label: "Probe intent",
    status: capabilityPlanningStatus,
    summary: "Names why a future model-space investigation might compare conditions.",
    distinction: "Probe plan is not an executed probe."
  },
  {
    id: "candidate-parameter-axis",
    label: "Candidate parameter axis",
    status: capabilityFutureStatus,
    summary: "Names a model condition that a future probe might vary.",
    distinction: "Candidate axis is not a sampled parameter."
  },
  {
    id: "candidate-outcome-measure",
    label: "Candidate outcome measure",
    status: capabilityFutureStatus,
    summary: "Names a model-output summary that a future probe might inspect.",
    distinction: "Planned outcome is not observed evidence."
  },
  {
    id: "candidate-range",
    label: "Candidate range",
    status: capabilityFutureStatus,
    summary: "Names a bounded future variation idea without selecting sampled values.",
    distinction: "Candidate range is not an explored range."
  },
  {
    id: "candidate-constraint",
    label: "Candidate constraint",
    status: capabilityFutureStatus,
    summary: "Names limits a future probe would need to respect before execution exists.",
    distinction: "Constraint planning is not scheduler or queue logic."
  },
  {
    id: "sampling-intent",
    label: "Sampling intent",
    status: capabilityFutureStatus,
    summary: "Names what future sampling might try to compare.",
    distinction: "Sampling intent is not a sampling result."
  },
  {
    id: "planned-comparison",
    label: "Planned comparison",
    status: capabilityFutureStatus,
    summary: "Names a possible future comparison across model conditions.",
    distinction: "Planned comparison is not a completed analysis."
  },
  {
    id: "unresolved-feasibility",
    label: "Unresolved feasibility",
    status: evidenceUnresolvedStatus,
    summary: "Records uncertainty about whether a future probe can be framed responsibly.",
    distinction: "Unresolved feasibility is not a failed run or disabled route."
  },
  {
    id: "externally-unvalidated-hypothesis",
    label: "Externally unvalidated hypothesis",
    status: evidenceUnresolvedStatus,
    summary: "Frames a model-only question without external calibration or validation.",
    distinction: "Model hypothesis is not a real-world claim."
  },
  {
    id: "non-executable-plan",
    label: "Non-executable plan",
    status: capabilityFutureStatus,
    summary: "Makes explicit that GW8 planning cannot run probes.",
    distinction: "Planning scaffold is not a run queue."
  },
  {
    id: "future-sampled-probe",
    label: "Future sampled probe",
    status: capabilityFutureStatus,
    summary: "A later capability would need explicit execution, provenance, and audit.",
    distinction: "Future-only is not locked progression."
  }
] as const satisfies readonly LandscapeProbePlanConcept[];

export const landscapeProbeAxisCandidates = [
  {
    id: "model-condition-axis",
    label: "Model condition axis",
    status: capabilityFutureStatus,
    summary: "A future probe may vary a template, scenario, seed, or assumption context.",
    notSampled: "This axis candidate is a planning descriptor, not sampled model-space data."
  },
  {
    id: "parameter-range-axis",
    label: "Parameter range axis",
    status: capabilityFutureStatus,
    summary: "A future probe may define a bounded parameter range after template support is known.",
    notSampled: "A named range is not an explored range or coverage claim."
  },
  {
    id: "seed-scenario-axis",
    label: "Seed and scenario axis",
    status: capabilityFutureStatus,
    summary: "A future probe may compare seeds or initial-condition recipes with explicit provenance.",
    notSampled: "No seed set, scenario set, or run queue is created in GW8."
  }
] as const satisfies readonly LandscapeProbeAxisCandidate[];

export const landscapeProbeOutcomeCandidates = [
  {
    id: "model-output-measure",
    label: "Model-output measure",
    status: capabilityFutureStatus,
    summary: "A future probe may inspect a model-output summary after source-backed runs exist.",
    notEvidence: "A planned outcome measure is not observed evidence."
  },
  {
    id: "comparison-outcome",
    label: "Comparison outcome",
    status: capabilityFutureStatus,
    summary: "A future probe may compare outputs across explicit model conditions.",
    notEvidence: "A planned comparison is not a sampled result or regime detection."
  },
  {
    id: "interpretation-check",
    label: "Interpretation check",
    status: evidenceUnresolvedStatus,
    summary: "A future probe may need an interpretation boundary before any claim is made.",
    notEvidence: "A model-bounded interpretation check is not real-world validation."
  }
] as const satisfies readonly LandscapeProbeOutcomeCandidate[];

export const landscapeProbeConstraints = [
  {
    id: "template-capability-boundary",
    label: "Template capability boundary",
    status: capabilityFutureStatus,
    summary: "A future probe must stay within template-supported parameters, variants, and metrics.",
    boundary: "Template capability is not inferred from a planning idea."
  },
  {
    id: "provenance-requirement",
    label: "Provenance requirement",
    status: capabilityFutureStatus,
    summary: "A future executable probe would need explicit model, scenario, seed, and parameter provenance.",
    boundary: "GW8 stores no provenance record because no probe is executed or saved."
  },
  {
    id: "sampling-design-requirement",
    label: "Sampling design requirement",
    status: capabilityFutureStatus,
    summary: "A future sampled probe would need bounded sampling rules and audit before execution.",
    boundary: "GW8 does not create a sampler, run queue, job queue, or batch execution path."
  },
  {
    id: "external-validation-gap",
    label: "External validation gap",
    status: evidenceUnresolvedStatus,
    summary: "A planned probe remains externally unvalidated unless later validation work is done.",
    boundary: "A planned probe does not support real-world claims."
  }
] as const satisfies readonly LandscapeProbeConstraint[];

export const landscapeProbePlanningSummary: LandscapeProbePlanningSummary = {
  label: "Conceptual probe plan - not executable and not saved.",
  status: capabilityFutureStatus,
  summary:
    "The scaffold names how a future model-space probe could be framed without pretending execution, samples, or records exist.",
  anatomy: [
    "Intent: the model-space question a future probe might frame.",
    "Axis candidate: a model condition that could be varied later.",
    "Outcome candidate: a model-output summary that could be inspected later.",
    "Constraint: an explicit boundary such as template capability, provenance, sampling design, or validation need."
  ],
  boundary:
    "This scaffold has no selected parameter values, no samples, no run queue, no saved plan, no probe result, and no detected regime."
} as const;

export const landscapeProbeBoundaries = [
  {
    id: "planning-vs-execution",
    title: "Planning Is Not Execution",
    status: capabilityFutureStatus,
    summary: "A landscape probe plan describes how a future model-space investigation could be framed."
  },
  {
    id: "sampling-intent-vs-result",
    title: "Sampling Intent Is Not A Sample",
    status: capabilityFutureStatus,
    summary: "Sampling intent does not generate samples, sampled regions, coverage estimates, or probe results."
  },
  {
    id: "world-relationship",
    title: "Relationship To World",
    status: evidenceUnresolvedStatus,
    summary: "World is where live model behavior is observed. GW8 does not execute landscape probes or turn World runs into planned samples."
  },
  {
    id: "lab-relationship",
    title: "Relationship To Lab",
    status: capabilityPlanningStatus,
    summary: "Lab describes how future evidence records could be organized. GW8 does not create probe records, experiment ledgers, notebooks, or run history."
  },
  {
    id: "atlas-relationship",
    title: "Relationship To Atlas",
    status: capabilityPlanningStatus,
    summary:
      "Landscape probe planning is non-executable in GW8. No probe plans are saved, no samples are generated, and no landscape regions are promoted to evidence."
  },
  {
    id: "model-vs-real-world",
    title: "Model Space Is Not The Real World",
    status: evidenceUnresolvedStatus,
    summary:
      "A planned probe can frame a future model-space investigation. It does not show that sampled behavior exists, that a regime has been detected, or that any real-world claim is supported."
  },
  {
    id: "non-persistence",
    title: "Non-Persistence Boundary",
    status: capabilityPlanningStatus,
    summary:
      "GW8 creates non-persistent landscape probe planning semantics. It does not execute probes, run parameter sweeps, generate samples, save plans, create Lab records, create Atlas discoveries, detect regimes, or validate real-world claims."
  }
] as const satisfies readonly LandscapeProbeBoundary[];

export const landscapeProbePlanningFoundation: LandscapeProbePlanningFoundation = {
  title: "Landscape Probe Planning",
  statusLabel: "GW8 foundation",
  status: capabilityPlanningStatus,
  principle:
    "A landscape probe plan describes how a future model-space investigation could be framed. It is not a sampled landscape, run queue, saved experiment, evidence record, or discovery.",
  boundary:
    "GW8 creates non-persistent landscape probe planning semantics. It does not execute probes, run parameter sweeps, generate samples, save plans, create Lab records, create Atlas discoveries, detect regimes, or validate real-world claims.",
  purpose:
    "Help modelers reason about candidate axes, candidate outcomes, ranges, constraints, and probe intent before ORTUS has landscape sampling or probe execution.",
  concepts: landscapeProbePlanConcepts,
  axes: landscapeProbeAxisCandidates,
  outcomes: landscapeProbeOutcomeCandidates,
  constraints: landscapeProbeConstraints,
  scaffold: landscapeProbePlanningSummary,
  boundaries: landscapeProbeBoundaries
} as const;

export function getLandscapeProbePlanConceptById(id: LandscapeProbePlanConceptId): LandscapeProbePlanConcept {
  const concept = landscapeProbePlanConcepts.find((candidate) => candidate.id === id);
  if (!concept) {
    throw new Error(`Unknown landscape probe planning concept: ${id}`);
  }
  return concept;
}

export function getLandscapeProbeConstraintById(id: LandscapeProbeConstraintId): LandscapeProbeConstraint {
  const constraint = landscapeProbeConstraints.find((candidate) => candidate.id === id);
  if (!constraint) {
    throw new Error(`Unknown landscape probe planning constraint: ${id}`);
  }
  return constraint;
}
