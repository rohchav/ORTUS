interface StatusPillProps {
  label: string;
  tone?: "neutral" | "accent" | "danger" | "moss";
}

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  return (
    <span className={`status-pill status-pill--${tone}`}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
