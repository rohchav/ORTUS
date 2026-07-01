import type { StatusPillCategory, StatusPillState } from "../components/ui/statusPillSemantics";

export type AtlasEvidenceStateId =
  | "unsampled"
  | "sampled"
  | "unresolved"
  | "supported-within-model"
  | "contradicted-within-model"
  | "unsupported"
  | "externally-unvalidated";

export type AtlasMapRegionStateId =
  | "model-question-space"
  | "unsampled-model-space"
  | "future-source-backed-sample"
  | "interpretation-boundary";

export interface AtlasEvidenceState {
  id: AtlasEvidenceStateId;
  label: string;
  category: Extract<StatusPillCategory, "evidence">;
  state: Extract<StatusPillState, "observed" | "supported" | "contradicted" | "unresolved" | "unsupported" | "unverified">;
  summary: string;
  interpretation: string;
}

export interface AtlasMapRegionState {
  id: AtlasMapRegionStateId;
  label: string;
  category: Extract<StatusPillCategory, "evidence" | "capability">;
  state: Extract<StatusPillState, "observed" | "unresolved" | "unverified" | "planning-only" | "future-only">;
  summary: string;
}

export interface AtlasFoundationSummary {
  routeLabel: "Atlas";
  statusLabel: "GW4 foundation";
  category: Extract<StatusPillCategory, "capability">;
  state: Extract<StatusPillState, "planning-only">;
  purpose: string;
  currentBoundary: string;
  epistemicBoundary: string;
  nonPersistenceBoundary: string;
}

export interface AtlasBoundarySummary {
  id: "model-vs-world" | "non-persistence" | "world-relationship" | "lab-relationship";
  title: string;
  category: Extract<StatusPillCategory, "evidence" | "capability">;
  state: Extract<StatusPillState, "unresolved" | "unverified" | "planning-only" | "future-only">;
  summary: string;
}

export const atlasFoundationSummary: AtlasFoundationSummary = {
  routeLabel: "Atlas",
  statusLabel: "GW4 foundation",
  category: "capability",
  state: "planning-only",
  purpose: "Orient future evidence about investigated model behavior without creating saved Atlas records.",
  currentBoundary:
    "Atlas is a non-persistent foundation in GW4. Discovery records, behavioral landscapes, sampled-region maps, and evidence-linked model regimes are not implemented yet.",
  epistemicBoundary:
    "Atlas will organize evidence about model behavior. It will not certify discoveries about the real world.",
  nonPersistenceBoundary: "Nothing on this Atlas route is a saved discovery, saved evidence record, or persistent map."
} as const;

export const atlasEvidenceStates = [
  {
    id: "unsampled",
    label: "Unsampled",
    category: "evidence",
    state: "unresolved",
    summary: "No source-backed model-space sample is attached.",
    interpretation: "Unknown in model space; it is not a failed software state."
  },
  {
    id: "sampled",
    label: "Sampled",
    category: "evidence",
    state: "observed",
    summary: "A future Atlas item has source-backed model-run evidence.",
    interpretation: "Sampled in model space does not mean validated in the real world."
  },
  {
    id: "unresolved",
    label: "Unresolved",
    category: "evidence",
    state: "unresolved",
    summary: "Available model evidence does not yet support a clear interpretation.",
    interpretation: "An unresolved finding is an open modeling question, not a runtime failure."
  },
  {
    id: "supported-within-model",
    label: "Supported within model",
    category: "evidence",
    state: "supported",
    summary: "Future source-backed model evidence supports an interpretation inside the model boundary.",
    interpretation: "Supported within a model is not empirical proof."
  },
  {
    id: "contradicted-within-model",
    label: "Contradicted within model",
    category: "evidence",
    state: "contradicted",
    summary: "Future source-backed model evidence conflicts with an interpretation.",
    interpretation: "Contradiction is useful evidence, not a reason to hide the result."
  },
  {
    id: "unsupported",
    label: "Unsupported",
    category: "evidence",
    state: "unsupported",
    summary: "Available model evidence does not support the interpretation.",
    interpretation: "Unsupported is an epistemic state, not an unavailable route or disabled control."
  },
  {
    id: "externally-unvalidated",
    label: "Externally unvalidated",
    category: "evidence",
    state: "unverified",
    summary: "Model evidence has not been calibrated or validated against external observations.",
    interpretation: "Model output is not empirical truth."
  }
] as const satisfies readonly AtlasEvidenceState[];

export const atlasCapabilityLegendState = {
  id: "future-only",
  label: "Future-only",
  category: "capability",
  state: "future-only",
  summary: "The capability is reserved for later work and is not locked or disabled.",
  interpretation: "Future-only is capability status, not evidence support."
} as const;

export const atlasMapRegionStates = [
  {
    id: "model-question-space",
    label: "Question space",
    category: "capability",
    state: "planning-only",
    summary: "A conceptual place to name what part of model behavior might be investigated later."
  },
  {
    id: "unsampled-model-space",
    label: "Unsampled model space",
    category: "evidence",
    state: "unresolved",
    summary: "No source-backed model samples are attached to this route in GW4."
  },
  {
    id: "future-source-backed-sample",
    label: "Future sampled slice",
    category: "capability",
    state: "future-only",
    summary: "A future Atlas slice would need run provenance before it could be shown as sampled."
  },
  {
    id: "interpretation-boundary",
    label: "Interpretation boundary",
    category: "evidence",
    state: "unverified",
    summary: "Even model-supported behavior remains externally unvalidated unless later validation work proves otherwise."
  }
] as const satisfies readonly AtlasMapRegionState[];

export const atlasBoundarySummaries = [
  {
    id: "model-vs-world",
    title: "Model Behavior Vs Real-World Discovery",
    category: "evidence",
    state: "unverified",
    summary: "Atlas maps investigated model behavior. It does not certify discoveries about the real world."
  },
  {
    id: "non-persistence",
    title: "Non-Persistence Boundary",
    category: "capability",
    state: "planning-only",
    summary: "GW4 creates Atlas information architecture and evidence semantics, not saved discoveries or persistent maps."
  },
  {
    id: "world-relationship",
    title: "Relationship To World",
    category: "evidence",
    state: "unresolved",
    summary:
      "World currently exposes live provenance, observation, and intervention readiness. GW4 Atlas does not save those runs or convert them into discoveries."
  },
  {
    id: "lab-relationship",
    title: "Relationship To Lab",
    category: "capability",
    state: "future-only",
    summary: "GW4 defines Atlas evidence semantics. Persistent Lab evidence records are still not implemented."
  }
] as const satisfies readonly AtlasBoundarySummary[];

export function getAtlasEvidenceStateById(id: AtlasEvidenceStateId): AtlasEvidenceState {
  const evidenceState = atlasEvidenceStates.find((candidate) => candidate.id === id);
  if (!evidenceState) {
    throw new Error(`Unknown Atlas evidence state: ${id}`);
  }
  return evidenceState;
}
