"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { validateVisualBuilderWorkspaceDefinition, type VisualBuilderWorkspaceDefinition } from "../../simulation/visualBuilderWorkspace";
import { CapabilityGuidancePanel } from "../researchWorld/CapabilityGuidancePanel";
import { RouteOrientationPanel } from "../researchWorld/RouteOrientationPanel";
import { BuilderHeader } from "./BuilderHeader";
import { BuilderExperienceTabs, type BuilderExperienceId } from "./BuilderExperienceTabs";
import { BuilderInspector } from "./BuilderInspector";
import { BuilderModeTabs, type BuilderModeId } from "./BuilderModeTabs";
import { BuilderNavigator } from "./BuilderNavigator";
import { BuilderValidationPanel } from "./BuilderValidationPanel";
import { BuilderViewport } from "./BuilderViewport";
import { ModelSchemaAuthoringShell } from "./ModelSchemaAuthoringShell";
import { GuidedBuilder, type GuidedBuilderHandoffResolution } from "./guided/GuidedBuilder";
import type { ModelSchemaDefinition } from "../../simulation/modelSchema";
import { BuilderGraphView } from "./graph";
import {
  createBuilderWorkspaceViewModel,
  defaultBuilderWorkspaceFilters,
  exportBuilderWorkspaceJson,
  importBuilderWorkspaceJson,
  type BuilderSelection,
  type BuilderWorkspaceFilters
} from "./builderViewModel";

interface BuilderShellProps {
  initialWorkspace?: VisualBuilderWorkspaceDefinition;
}

export function BuilderShell({ initialWorkspace }: BuilderShellProps) {
  const router = useRouter();
  const [activeExperience, setActiveExperience] = useState<BuilderExperienceId>("guided");
  const [activeMode, setActiveMode] = useState<BuilderModeId>("workspace");
  const [workspace, setWorkspace] = useState<VisualBuilderWorkspaceDefinition | null>(() =>
    initialWorkspace ? validateVisualBuilderWorkspaceDefinition(initialWorkspace) : null
  );
  const [selection, setSelection] = useState<BuilderSelection | null>(() => {
    if (!initialWorkspace) {
      return null;
    }
    return createBuilderWorkspaceViewModel(validateVisualBuilderWorkspaceDefinition(initialWorkspace)).defaultSelection;
  });
  const [filters, setFilters] = useState<BuilderWorkspaceFilters>(defaultBuilderWorkspaceFilters);
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [guidedDraftMeaningful, setGuidedDraftMeaningful] = useState(false);
  const [guidedHandoffRequest, setGuidedHandoffRequest] = useState<{ requestId: number; artifact: ModelSchemaDefinition } | null>(null);
  const [guidedHandoffResolution, setGuidedHandoffResolution] = useState<GuidedBuilderHandoffResolution | null>(null);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);
  const [pendingHistoryBack, setPendingHistoryBack] = useState(false);
  const nextGuidedHandoffRequestIdRef = useRef(0);
  const pendingNavigationTriggerRef = useRef<HTMLElement | null>(null);
  const leaveConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const leaveCancelButtonRef = useRef<HTMLButtonElement>(null);
  const restoringGuidedHistoryGuardRef = useRef(false);
  const allowGuidedHistoryLeaveRef = useRef(false);
  const viewModel = useMemo(() => (workspace ? createBuilderWorkspaceViewModel(workspace) : null), [workspace]);

  const handleGuidedMeaningfulChange = useCallback((meaningful: boolean) => {
    setGuidedDraftMeaningful(meaningful);
  }, []);

  const openAdvancedBuilder = useCallback(() => {
    setActiveExperience("advanced");
  }, []);

  const requestGuidedHandoff = useCallback((artifact: ModelSchemaDefinition) => {
    nextGuidedHandoffRequestIdRef.current += 1;
    setGuidedHandoffResolution(null);
    setGuidedHandoffRequest({ requestId: nextGuidedHandoffRequestIdRef.current, artifact });
    setActiveMode("authorSchema");
    setActiveExperience("advanced");
  }, []);

  const resolveGuidedHandoff = useCallback((requestId: number, status: "applied" | "canceled") => {
    setGuidedHandoffRequest((current) => (current?.requestId === requestId ? null : current));
    setGuidedHandoffResolution({ requestId, status });
    if (status === "canceled") {
      setActiveExperience("guided");
    }
  }, []);

  useEffect(() => {
    if (guidedHandoffResolution?.status !== "canceled" || activeExperience !== "guided") {
      return;
    }
    window.requestAnimationFrame(() => document.getElementById("guided-open-draft-advanced")?.focus());
  }, [activeExperience, guidedHandoffResolution]);

  useEffect(() => {
    if (!guidedDraftMeaningful) {
      return;
    }
    const historyGuardKey = "__ortusGuidedDraftGuard";
    const currentHistoryState = window.history.state as Record<string, unknown> | null;
    if (!currentHistoryState?.[historyGuardKey]) {
      window.history.pushState({ ...currentHistoryState, [historyGuardKey]: true }, "", window.location.href);
    }
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const interceptRouteLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }
      const targetUrl = new URL(anchor.href, window.location.href);
      if (targetUrl.origin !== window.location.origin || targetUrl.pathname === window.location.pathname) {
        return;
      }
      event.preventDefault();
      pendingNavigationTriggerRef.current = anchor;
      setPendingNavigationHref(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
    };
    const interceptHistoryBack = () => {
      if (allowGuidedHistoryLeaveRef.current) {
        allowGuidedHistoryLeaveRef.current = false;
        return;
      }
      if (restoringGuidedHistoryGuardRef.current) {
        restoringGuidedHistoryGuardRef.current = false;
        return;
      }
      const activeElement = document.activeElement;
      pendingNavigationTriggerRef.current = activeElement instanceof HTMLElement ? activeElement : null;
      restoringGuidedHistoryGuardRef.current = true;
      window.history.forward();
      setPendingHistoryBack(true);
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    window.addEventListener("popstate", interceptHistoryBack);
    document.addEventListener("click", interceptRouteLink, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      window.removeEventListener("popstate", interceptHistoryBack);
      document.removeEventListener("click", interceptRouteLink, true);
    };
  }, [guidedDraftMeaningful]);

  useEffect(() => {
    if (pendingNavigationHref || pendingHistoryBack) {
      leaveConfirmButtonRef.current?.focus();
    }
  }, [pendingHistoryBack, pendingNavigationHref]);

  function cancelPendingNavigation() {
    setPendingNavigationHref(null);
    setPendingHistoryBack(false);
    window.requestAnimationFrame(() => pendingNavigationTriggerRef.current?.focus());
  }

  function confirmPendingNavigation() {
    const href = pendingNavigationHref;
    setPendingNavigationHref(null);
    if (pendingHistoryBack) {
      setPendingHistoryBack(false);
      allowGuidedHistoryLeaveRef.current = true;
      window.history.go(-2);
      window.setTimeout(() => {
        allowGuidedHistoryLeaveRef.current = false;
      }, 1_000);
      return;
    }
    if (href) {
      router.push(href);
    }
  }

  function handleLeaveConfirmationKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelPendingNavigation();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    if (event.shiftKey && document.activeElement === leaveConfirmButtonRef.current) {
      event.preventDefault();
      leaveCancelButtonRef.current?.focus();
    } else if (!event.shiftKey && document.activeElement === leaveCancelButtonRef.current) {
      event.preventDefault();
      leaveConfirmButtonRef.current?.focus();
    }
  }

  function replaceWorkspace(json: string) {
    const result = importBuilderWorkspaceJson(workspace, json);
    if (!result.changed || !result.workspace) {
      setImportError(result.error ?? "Invalid visual builder workspace JSON.");
      return;
    }
    const nextViewModel = createBuilderWorkspaceViewModel(result.workspace);
    setWorkspace(result.workspace);
    setSelection(nextViewModel.defaultSelection);
    setFilters(defaultBuilderWorkspaceFilters);
    setViewport({ x: 0, y: 0, zoom: 1 });
    setImportError(null);
    setExportText("");
  }

  return (
    <section className="builder-shell" aria-label="Builder structural shell" data-product-context="ORTUS structural Builder">
      <h1 className="sr-only">Workshop</h1>
      <RouteOrientationPanel destinationId="workshop" className="route-orientation--workshop-shell" />
      <BuilderExperienceTabs activeExperience={activeExperience} onExperienceChange={setActiveExperience} />
      <section
        id="builder-experience-panel-guided"
        className="builder-experience-panel builder-experience-panel--guided"
        role="tabpanel"
        aria-labelledby="builder-experience-tab-guided"
        hidden={activeExperience !== "guided"}
      >
        <GuidedBuilder
          handoffResolution={guidedHandoffResolution}
          onMeaningfulChange={handleGuidedMeaningfulChange}
          onOpenAdvanced={openAdvancedBuilder}
          onHandoffRequest={requestGuidedHandoff}
        />
      </section>
      <section
        id="builder-experience-panel-advanced"
        className="builder-experience-panel builder-experience-panel--advanced"
        role="tabpanel"
        aria-labelledby="builder-experience-tab-advanced"
        hidden={activeExperience !== "advanced"}
      >
        <BuilderHeader
          activeMode={activeMode}
          viewModel={viewModel}
          canExport={Boolean(workspace)}
          showValidation={showValidation}
          showWarnings={showWarnings}
          onLoadImportText={() => replaceWorkspace(importText)}
          onFileText={(text) => {
            setImportText(text);
            replaceWorkspace(text);
          }}
          onFileError={setImportError}
          onExport={() => {
            if (workspace) {
              setExportText(exportBuilderWorkspaceJson(workspace));
            }
          }}
          onClearWorkspace={() => {
            setWorkspace(null);
            setSelection(null);
            setFilters(defaultBuilderWorkspaceFilters);
            setExportText("");
            setImportError(null);
          }}
          onToggleValidation={() => setShowValidation((value) => !value)}
          onToggleWarnings={() => setShowWarnings((value) => !value)}
        />
        <BuilderModeTabs activeMode={activeMode} onModeChange={setActiveMode} />
        <section
          id="builder-mode-panel-workspace"
          className="builder-shell__body"
          role="tabpanel"
          aria-labelledby="builder-mode-tab-workspace"
          hidden={activeMode !== "workspace"}
        >
          <BuilderNavigator
            viewModel={viewModel}
            filters={filters}
            selection={selection}
            importText={importText}
            exportText={exportText}
            importError={importError}
            onImportTextChange={setImportText}
            onFiltersChange={setFilters}
            onSelect={setSelection}
          />
          <BuilderViewport
            viewModel={viewModel}
            filters={filters}
            selection={selection}
            viewport={viewport}
            onViewportChange={setViewport}
            onResetViewport={() => setViewport({ x: 0, y: 0, zoom: 1 })}
            onSelect={setSelection}
          />
          <aside className="builder-side" aria-label="Builder inspector and validation" tabIndex={0}>
            <BuilderInspector
              viewModel={viewModel}
              selection={selection}
              onSelectEdge={(edgeId) => setSelection({ type: "edge", id: edgeId })}
              onSelectMarker={(markerId) => setSelection({ type: "marker", id: markerId })}
            />
            <BuilderValidationPanel viewModel={viewModel} showValidation={showValidation} showWarnings={showWarnings} />
          </aside>
        </section>
        <ModelSchemaAuthoringShell
          hidden={activeMode !== "authorSchema"}
          guidedHandoffRequest={guidedHandoffRequest}
          onGuidedHandoffResolution={resolveGuidedHandoff}
        />
        {activeMode === "graph" ? <BuilderGraphView workspace={workspace} /> : null}
      </section>
      <CapabilityGuidancePanel destinationId="workshop" className="capability-guidance--workshop" maxItemsPerGroup={1} />
      {pendingNavigationHref || pendingHistoryBack ? (
        <div className="schema-confirmation-backdrop">
          <div
            className="schema-confirmation"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="builder-leave-confirmation-title"
            aria-describedby="builder-leave-confirmation-description"
            onKeyDown={handleLeaveConfirmationKeyDown}
          >
            <h2 id="builder-leave-confirmation-title">Leave Workshop and discard the local Guided draft?</h2>
            <p id="builder-leave-confirmation-description">
              Guided Builder data exists only in this page session. Leaving now discards it. Cancel keeps the draft and returns focus to the prior control.
            </p>
            <div>
              <button ref={leaveConfirmButtonRef} type="button" onClick={confirmPendingNavigation} suppressHydrationWarning>
                Leave Workshop
              </button>
              <button ref={leaveCancelButtonRef} type="button" onClick={cancelPendingNavigation} suppressHydrationWarning>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
