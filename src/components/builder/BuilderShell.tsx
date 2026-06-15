"use client";

import { useMemo, useState } from "react";
import { validateVisualBuilderWorkspaceDefinition, type VisualBuilderWorkspaceDefinition } from "../../simulation/visualBuilderWorkspace";
import { BuilderHeader } from "./BuilderHeader";
import { BuilderInspector } from "./BuilderInspector";
import { BuilderModeTabs, type BuilderModeId } from "./BuilderModeTabs";
import { BuilderNavigator } from "./BuilderNavigator";
import { BuilderValidationPanel } from "./BuilderValidationPanel";
import { BuilderViewport } from "./BuilderViewport";
import { ModelSchemaAuthoringShell } from "./ModelSchemaAuthoringShell";
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
  const viewModel = useMemo(() => (workspace ? createBuilderWorkspaceViewModel(workspace) : null), [workspace]);

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
    <main className="builder-shell" aria-label="Safe visual builder shell" data-product-context="ORTUS structural Builder">
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
        <aside className="builder-side" aria-label="Builder inspector and validation">
          <BuilderInspector
            viewModel={viewModel}
            selection={selection}
            onSelectEdge={(edgeId) => setSelection({ type: "edge", id: edgeId })}
            onSelectMarker={(markerId) => setSelection({ type: "marker", id: markerId })}
          />
          <BuilderValidationPanel viewModel={viewModel} showValidation={showValidation} showWarnings={showWarnings} />
        </aside>
      </section>
      <ModelSchemaAuthoringShell hidden={activeMode !== "authorSchema"} />
    </main>
  );
}
