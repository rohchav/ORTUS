import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  active?: boolean;
}

export function IconButton({ label, icon, active = false, className = "", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button ${active ? "is-active" : ""} ${className}`}
      title={label}
      aria-label={label}
      suppressHydrationWarning
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
