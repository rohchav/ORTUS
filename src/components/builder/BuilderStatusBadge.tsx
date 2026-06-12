import type { BuilderStatusBadge as BuilderStatusBadgeModel } from "./builderViewModel";

interface BuilderStatusBadgeProps {
  badge: BuilderStatusBadgeModel;
}

export function BuilderStatusBadge({ badge }: BuilderStatusBadgeProps) {
  return (
    <span className={`builder-status-badge builder-status-badge--${badge.tone}`} title={badge.description}>
      <i aria-hidden="true" />
      {badge.label}
    </span>
  );
}
