"use client";

import { useId, useState, type ReactNode } from "react";

interface DisclosureProps {
  children: ReactNode;
  expandLabel: string;
  collapseLabel?: string;
  className?: string;
  contentId?: string;
}

export function Disclosure({ children, expandLabel, collapseLabel, className = "", contentId }: DisclosureProps) {
  const generatedId = useId().replace(/:/g, "");
  const [expanded, setExpanded] = useState(false);
  const resolvedContentId = contentId ?? `disclosure-content-${generatedId}`;

  return (
    <div className={`disclosure ${className}`} data-disclosure-state={expanded ? "expanded" : "collapsed"}>
      <button
        type="button"
        className="disclosure__control"
        aria-expanded={expanded}
        aria-controls={resolvedContentId}
        data-disclosure-control
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? (collapseLabel ?? expandLabel) : expandLabel}
      </button>
      <div id={resolvedContentId} className="disclosure__content" data-disclosure-content hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}
