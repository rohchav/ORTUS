import type { StatusPillCategory, StatusPillState } from "../components/ui/statusPillSemantics";

export type LabRecordLifecycleStateId =
  | "draft-schema"
  | "awaiting-capture"
  | "not-persisted"
  | "unresolved"
  | "model-only"
  | "externally-unvalidated"
  | "comparison-not-implemented"
  | "notebook-not-implemented"
  | "future-only";

export type LabLedgerScaffoldStateId =
  | "record-schema"
  | "run-provenance-slot"
  | "comparison-slot"
  | "interpretation-slot";

export interface LabRecordLifecycleState {
  id: LabRecordLifecycleStateId;
  label: string;
  category: Extract<StatusPillCategory, "capability" | "evidence">;
  state: Extract<StatusPillState, "future-only" | "unresolved" | "unverified">;
  summary: string;
  interpretation: string;
}

export interface LabLedgerScaffoldState {
  id: LabLedgerScaffoldStateId;
  label: string;
  category: Extract<StatusPillCategory, "capability" | "evidence">;
  state: Extract<StatusPillState, "future-only" | "planning-only" | "unresolved" | "unverified">;
  summary: string;
}

export interface LabFoundationSummary {
  routeLabel: "Lab";
  statusLabel: "GW5 foundation";
  category: Extract<StatusPillCategory, "capability">;
  state: Extract<StatusPillState, "planning-only">;
  purpose: string;
  currentBoundary: string;
  epistemicBoundary: string;
  nonPersistenceBoundary: string;
  ledgerBoundary: string;
}

export interface LabBoundarySummary {
  id: "world-relationship" | "atlas-relationship" | "model-vs-world" | "non-persistence";
  title: string;
  category: Extract<StatusPillCategory, "capability" | "evidence">;
  state: Extract<StatusPillState, "future-only" | "planning-only" | "unresolved" | "unverified">;
  summary: string;
}

export const labFoundationSummary: LabFoundationSummary = {
  routeLabel: "Lab",
  statusLabel: "GW5 foundation",
  category: "capability",
  state: "planning-only",
  purpose: "Structure how ORTUS will eventually organize model-run evidence records without saving data in GW5.",
  currentBoundary:
    "Lab is a non-persistent foundation in GW5. Persistent evidence records, experiment ledgers, notebooks, saved comparisons, and run history are not implemented yet.",
  epistemicBoundary:
    "Lab records will organize evidence about model investigations. They will not certify discoveries about the real world.",
  nonPersistenceBoundary: "Nothing on this Lab route is a saved experiment, saved evidence record, or persistent run history.",
  ledgerBoundary: "Conceptual scaffold - not saved Lab data. This is record anatomy, not an experiment history or notebook."
} as const;

export const labRecordLifecycleStates = [
  {
    id: "draft-schema",
    label: "Draft schema",
    category: "capability",
    state: "future-only",
    summary: "A future record shape may be drafted before any run evidence is captured.",
    interpretation: "Record schema is not a saved record."
  },
  {
    id: "awaiting-capture",
    label: "Awaiting capture",
    category: "capability",
    state: "future-only",
    summary: "A future Lab record may wait for source-backed run evidence.",
    interpretation: "Awaiting capture does not mean this route has imported a World run."
  },
  {
    id: "not-persisted",
    label: "Not persisted",
    category: "capability",
    state: "future-only",
    summary: "GW5 does not save Lab records, experiment ledgers, notebooks, comparisons, or run history.",
    interpretation: "Experiment ledger foundation is not experiment history."
  },
  {
    id: "unresolved",
    label: "Unresolved",
    category: "evidence",
    state: "unresolved",
    summary: "Future model evidence may be insufficient for an interpretation.",
    interpretation: "Unresolved is an evidence state, not a missing software implementation."
  },
  {
    id: "model-only",
    label: "Model-only",
    category: "evidence",
    state: "unresolved",
    summary: "Future evidence records would describe model behavior under explicit assumptions.",
    interpretation: "Model evidence is not real-world validation."
  },
  {
    id: "externally-unvalidated",
    label: "Externally unvalidated",
    category: "evidence",
    state: "unverified",
    summary: "Future Lab evidence may lack external calibration or validation.",
    interpretation: "Model output is not empirical truth."
  },
  {
    id: "comparison-not-implemented",
    label: "Comparison not implemented",
    category: "capability",
    state: "future-only",
    summary: "Stored comparison sets are future work and are not created by GW5.",
    interpretation: "Future-only is capability status, not evidence support."
  },
  {
    id: "notebook-not-implemented",
    label: "Notebook not implemented",
    category: "capability",
    state: "future-only",
    summary: "Notebook entries are future work and are not created by GW5.",
    interpretation: "No notebook, journal, or activity feed exists here."
  },
  {
    id: "future-only",
    label: "Future-only",
    category: "capability",
    state: "future-only",
    summary: "The capability is reserved for later work and is not locked or disabled.",
    interpretation: "Future-only is not locked."
  }
] as const satisfies readonly LabRecordLifecycleState[];

export const labLedgerScaffoldStates = [
  {
    id: "record-schema",
    label: "Record schema",
    category: "capability",
    state: "planning-only",
    summary: "A future Lab record would need explicit source, model, scenario, seed, and assumption references."
  },
  {
    id: "run-provenance-slot",
    label: "Run provenance slot",
    category: "capability",
    state: "future-only",
    summary: "A future slot may point to a source-backed run, but GW5 does not save or import one."
  },
  {
    id: "comparison-slot",
    label: "Comparison slot",
    category: "capability",
    state: "future-only",
    summary: "A future slot may connect bounded comparisons; no comparison set is stored in GW5."
  },
  {
    id: "interpretation-slot",
    label: "Interpretation slot",
    category: "evidence",
    state: "unresolved",
    summary: "A future interpretation would stay model-bounded and externally unvalidated unless later evidence changes that."
  }
] as const satisfies readonly LabLedgerScaffoldState[];

export const labBoundarySummaries = [
  {
    id: "world-relationship",
    title: "Relationship To World",
    category: "evidence",
    state: "unresolved",
    summary:
      "World currently exposes live provenance, observation, and intervention readiness. GW5 Lab does not save those runs or convert them into evidence records."
  },
  {
    id: "atlas-relationship",
    title: "Relationship To Atlas",
    category: "capability",
    state: "planning-only",
    summary:
      "Atlas currently defines non-persistent evidence-state semantics. GW5 Lab does not publish records to Atlas or create discoveries."
  },
  {
    id: "model-vs-world",
    title: "Model Investigation Vs Real-World Validation",
    category: "evidence",
    state: "unverified",
    summary: "Lab records will organize evidence about model investigations. They will not certify discoveries about the real world."
  },
  {
    id: "non-persistence",
    title: "Non-Persistence Boundary",
    category: "capability",
    state: "planning-only",
    summary: "GW5 creates Lab information architecture and record semantics, not saved experiments or persistent run history."
  }
] as const satisfies readonly LabBoundarySummary[];

export function getLabRecordLifecycleStateById(id: LabRecordLifecycleStateId): LabRecordLifecycleState {
  const lifecycleState = labRecordLifecycleStates.find((candidate) => candidate.id === id);
  if (!lifecycleState) {
    throw new Error(`Unknown Lab record lifecycle state: ${id}`);
  }
  return lifecycleState;
}
