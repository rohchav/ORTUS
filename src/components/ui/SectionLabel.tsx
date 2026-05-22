interface SectionLabelProps {
  label: string;
  value?: string;
}

export function SectionLabel({ label, value }: SectionLabelProps) {
  return (
    <div className="section-label">
      <i aria-hidden="true" />
      <span>{label}</span>
      {value ? <strong>{value}</strong> : null}
    </div>
  );
}
