export type StatusPillTone = "neutral" | "accent" | "danger" | "moss";

export type StatusPillCategory = "operational" | "interaction" | "evidence" | "capability";

export type StatusPillState =
  | "idle"
  | "ready"
  | "active"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "disabled"
  | "runnable"
  | "non-runnable"
  | "selected"
  | "observed"
  | "supported"
  | "contradicted"
  | "unresolved"
  | "uncertain"
  | "stale"
  | "unsupported"
  | "lossy"
  | "planning-only"
  | "future-only"
  | "unverified";

export interface StatusPillSemantics {
  category: StatusPillCategory;
  state: StatusPillState;
  ariaLabel: string;
}

interface StatusPillSemanticInput {
  label: string;
  tone?: StatusPillTone;
  category?: StatusPillCategory;
  state?: StatusPillState;
  description?: string;
}

const legacyToneState: Record<StatusPillTone, Pick<StatusPillSemantics, "category" | "state">> = {
  neutral: { category: "operational", state: "idle" },
  accent: { category: "interaction", state: "active" },
  danger: { category: "operational", state: "failed" },
  moss: { category: "evidence", state: "supported" }
};

export function resolveStatusPillSemantics({
  label,
  tone = "neutral",
  category,
  state,
  description
}: StatusPillSemanticInput): StatusPillSemantics {
  const legacy = legacyToneState[tone];
  const resolvedCategory = category ?? legacy.category;
  const resolvedState = state ?? legacy.state;
  return {
    category: resolvedCategory,
    state: resolvedState,
    ariaLabel: description ? `${label}: ${description}` : label
  };
}
