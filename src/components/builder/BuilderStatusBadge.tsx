import type { BuilderStatusBadge as BuilderStatusBadgeModel } from "./builderViewModel";

interface BuilderStatusBadgeProps {
  badge: BuilderStatusBadgeModel;
}

export function BuilderStatusBadge({ badge }: BuilderStatusBadgeProps) {
  return (
    <span
      className={`builder-status-badge builder-status-badge--${badge.tone}`}
      title={badge.description}
      aria-label={`${badge.label}: ${badge.description}`}
      data-status-category={badge.category ?? "capability"}
      data-state={badge.state ?? "unverified"}
      data-size="compact"
    >
      <i aria-hidden="true" />
      {badge.label}
    </span>
  );
}
