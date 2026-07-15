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
  | "ephemeral-sampled-slice"
  | "interpretation-boundary";

export interface AtlasEvidenceState {
  id: AtlasEvidenceStateId;
  label: string;
  category: Extract<StatusPillCategory, "evidence">;
  state: Extract<StatusPillState, "supported" | "contradicted" | "unresolved" | "unsupported" | "unverified">;
  summary: string;
  interpretation: string;
}

export interface AtlasMapRegionState {
  id: AtlasMapRegionStateId;
  label: string;
  category: Extract<StatusPillCategory, "evidence" | "capability">;
  state: Extract<StatusPillState, "supported" | "unresolved" | "unverified" | "planning-only" | "future-only">;
  summary: string;
}

export interface AtlasFoundationSummary {
  routeLabel: "Atlas";
  statusLabel: "GW9 preview available";
  category: Extract<StatusPillCategory, "capability">;
  state: Extract<StatusPillState, "supported">;
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
  statusLabel: "GW9 preview available",
  category: "capability",
  state: "supported",
  purpose: "Run a bounded ephemeral model-space preview while preserving the Atlas evidence and non-persistence boundaries.",
  currentBoundary:
    "Atlas now provides one bounded, deterministic, non-persistent sampling preview. Discovery records, saved behavioral landscape maps, sampled-region maps, and evidence-linked model regimes remain unimplemented.",
  epistemicBoundary:
    "Atlas previews exact model outputs at executed coordinates. They do not certify discoveries about the real world.",
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
    state: "unresolved",
    summary: "A GW9 preview coordinate is sampled only after its isolated model runs reach a terminal state.",
    interpretation: "Sampled means executed inside the exact model request; it is not persistent or real-world validation."
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
    summary: "Model space remains unsampled until the user explicitly runs a supported preview request."
  },
  {
    id: "ephemeral-sampled-slice",
    label: "Ephemeral sampled slice",
    category: "capability",
    state: "supported",
    summary: "GW9 can display exact executed coordinates with in-memory provenance; it does not save a sampled map."
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
    summary: "GW9 adds an in-memory preview, not saved discoveries, persistent maps, or cross-session history."
  },
  {
    id: "world-relationship",
    title: "Relationship To World",
    category: "evidence",
    state: "unresolved",
    summary:
      "GW9 Atlas creates fresh isolated engines and does not reuse, save, or convert the active World run into a discovery."
  },
  {
    id: "lab-relationship",
    title: "Relationship To Lab",
    category: "capability",
    state: "planning-only",
    summary:
      "GW5 Lab defines non-persistent evidence-record semantics. Persistent Lab evidence records and Lab-to-Atlas publication are still not implemented."
  }
] as const satisfies readonly AtlasBoundarySummary[];

export function getAtlasEvidenceStateById(id: AtlasEvidenceStateId): AtlasEvidenceState {
  const evidenceState = atlasEvidenceStates.find((candidate) => candidate.id === id);
  if (!evidenceState) {
    throw new Error(`Unknown Atlas evidence state: ${id}`);
  }
  return evidenceState;
}
