import { Suspense, type ReactNode } from "react";
import { OrtusBrand } from "../branding";
import { ResearchDestinationNavigation } from "./ResearchDestinationNavigation";

interface ResearchWorldShellProps {
  children: ReactNode;
}

export function ResearchWorldShell({ children }: ResearchWorldShellProps) {
  return (
    <div className="research-shell">
      <a className="research-shell__skip" href="#research-world-main">
        Skip to destination content
      </a>
      <header className="research-shell__header" aria-label="ORTUS Research World shell">
        <div className="research-shell__identity">
          <OrtusBrand href="/" showDescriptor className="research-shell__brand" />
        </div>
        <Suspense fallback={<div className="research-destination-nav" aria-hidden="true" />}>
          <ResearchDestinationNavigation />
        </Suspense>
      </header>
      <main id="research-world-main" className="research-shell__main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
