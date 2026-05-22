"use client";

import type { ReactNode } from "react";

interface CornerFramePanelProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
  variant?: "compact" | "standard" | "floating";
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function CornerFramePanel({
  title,
  eyebrow,
  children,
  actions,
  variant = "standard",
  collapsed = false,
  onToggle,
  className = ""
}: CornerFramePanelProps) {
  return (
    <section className={`corner-panel corner-panel--${variant} ${collapsed ? "is-collapsed" : ""} ${className}`}>
      <span className="corner-panel__edgeCode" aria-hidden="true" />
      <span className="corner-panel__ticks" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="corner-mark corner-mark--tl" />
      <span className="corner-mark corner-mark--tr" />
      <span className="corner-mark corner-mark--bl" />
      <span className="corner-mark corner-mark--br" />
      <header className="corner-panel__header">
        <button
          type="button"
          className="corner-panel__titleButton"
          onClick={onToggle}
          aria-expanded={!collapsed}
          disabled={!onToggle}
          suppressHydrationWarning
        >
          {eyebrow ? <span className="corner-panel__eyebrow">{eyebrow}</span> : null}
          <span className="corner-panel__titleRow">
            <span className="corner-panel__title">{title}</span>
            <span className="corner-panel__titleSignal" aria-hidden="true">
              //
            </span>
          </span>
        </button>
        <div className="corner-panel__actions">
          {onToggle ? (
            <span className="corner-panel__toggleHint" aria-hidden="true">
              {collapsed ? "Open" : "Hide"}
            </span>
          ) : null}
          {actions}
        </div>
      </header>
      {!collapsed ? <div className="corner-panel__body">{children}</div> : null}
    </section>
  );
}
