import {
  resolveStatusPillSemantics,
  type StatusPillCategory,
  type StatusPillState,
  type StatusPillTone
} from "./statusPillSemantics";

interface StatusPillProps {
  label: string;
  tone?: StatusPillTone;
  category?: StatusPillCategory;
  state?: StatusPillState;
  description?: string;
  size?: "compact" | "standard";
}

export function StatusPill({ label, tone = "neutral", category, state, description, size = "standard" }: StatusPillProps) {
  const semantics = resolveStatusPillSemantics({ label, tone, category, state, description });

  return (
    <span
      className={`status-pill status-pill--${tone}`}
      title={description}
      aria-label={semantics.ariaLabel}
      data-status-category={semantics.category}
      data-state={semantics.state}
      data-size={size}
    >
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
