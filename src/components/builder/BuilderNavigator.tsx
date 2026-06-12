"use client";

import { CornerFramePanel } from "../ui/CornerFramePanel";
import type { BuilderSelection, BuilderWorkspaceFilters, BuilderWorkspaceViewModel } from "./builderViewModel";
import { formatNodeKind, formatNodeStatus, formatSelectionType } from "./builderViewModel";

interface BuilderNavigatorProps {
  viewModel: BuilderWorkspaceViewModel | null;
  filters: BuilderWorkspaceFilters;
  selection: BuilderSelection | null;
  importText: string;
  exportText: string;
  importError: string | null;
  onImportTextChange: (value: string) => void;
  onFiltersChange: (filters: BuilderWorkspaceFilters) => void;
  onSelect: (selection: BuilderSelection) => void;
}

export function BuilderNavigator({
  viewModel,
  filters,
  selection,
  importText,
  exportText,
  importError,
  onImportTextChange,
  onFiltersChange,
  onSelect
}: BuilderNavigatorProps) {
  return (
    <aside className="builder-nav" aria-label="Builder navigation and import">
      <CornerFramePanel title="Workspace JSON" eyebrow="Artifact" variant="compact">
        <label className="json-field">
          <span>Import ortus.visualBuilderWorkspace JSON</span>
          <textarea
            className="json-box builder-json-box"
            value={importText}
            onChange={(event) => onImportTextChange(event.target.value)}
            aria-label="Visual builder workspace JSON to import"
            placeholder="Paste an ortus.visualBuilderWorkspace artifact."
            suppressHydrationWarning
          />
        </label>
        {importError ? (
          <p className="builder-error" role="alert">
            {importError}
          </p>
        ) : null}
        {exportText ? (
          <label className="json-field">
            <span>Latest workspace export</span>
            <textarea
              className="json-box builder-json-box"
              value={exportText}
              readOnly
              aria-label="Latest exported visual builder workspace JSON"
              suppressHydrationWarning
            />
          </label>
        ) : null}
      </CornerFramePanel>

      <CornerFramePanel title="Navigation" eyebrow="Read Only" variant="compact">
        <div className="builder-filter-grid">
          <label>
            <span>Node kind</span>
            <select
              value={filters.nodeKind}
              onChange={(event) => onFiltersChange({ ...filters, nodeKind: event.target.value as BuilderWorkspaceFilters["nodeKind"] })}
              disabled={!viewModel}
              suppressHydrationWarning
            >
              <option value="all">All kinds</option>
              {(viewModel?.availableNodeKinds ?? []).map((kind) => (
                <option key={kind} value={kind}>
                  {formatNodeKind(kind)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Node status</span>
            <select
              value={filters.nodeStatus}
              onChange={(event) => onFiltersChange({ ...filters, nodeStatus: event.target.value as BuilderWorkspaceFilters["nodeStatus"] })}
              disabled={!viewModel}
              suppressHydrationWarning
            >
              <option value="all">All statuses</option>
              {(viewModel?.availableNodeStatuses ?? []).map((status) => (
                <option key={status} value={status}>
                  {formatNodeStatus(status)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {viewModel ? (
          <div className="builder-nav__groups">
            <NavGroup title="Sections" count={viewModel.sections.length}>
              {viewModel.sections.map((section) => (
                <NavButton
                  key={section.id}
                  active={selection?.type === "section" && selection.id === section.id}
                  label={section.label}
                  meta={section.sectionKind}
                  onClick={() => onSelect({ type: "section", id: section.id })}
                />
              ))}
            </NavGroup>
            <NavGroup title="Panels" count={viewModel.panels.length}>
              {viewModel.panels.map((panel) => (
                <NavButton
                  key={panel.id}
                  active={selection?.type === "panel" && selection.id === panel.id}
                  label={panel.label}
                  meta={panel.panelKind}
                  onClick={() => onSelect({ type: "panel", id: panel.id })}
                />
              ))}
            </NavGroup>
            <NavGroup title="Nodes" count={viewModel.nodes.length}>
              {viewModel.nodes.map((node) => (
                <NavButton
                  key={node.id}
                  active={selection?.type === "node" && selection.id === node.id}
                  label={node.label}
                  meta={`${formatNodeKind(node.nodeKind)} · ${formatNodeStatus(node.status)}`}
                  onClick={() => onSelect({ type: "node", id: node.id })}
                />
              ))}
            </NavGroup>
            <NavGroup title="Artifact References" count={viewModel.artifactReferences.length}>
              {viewModel.artifactReferences.map((reference) => (
                <NavButton
                  key={reference.id}
                  active={selection?.type === "artifactReference" && selection.id === reference.id}
                  label={reference.label}
                  meta={`${reference.artifactType} · ${reference.role}`}
                  onClick={() => onSelect({ type: "artifactReference", id: reference.id })}
                />
              ))}
            </NavGroup>
            <NavGroup title="Markers" count={viewModel.markers.length}>
              {viewModel.markers.map(({ source, marker }) => (
                <NavButton
                  key={marker.id}
                  active={selection?.type === "marker" && selection.id === marker.id}
                  label={marker.label}
                  meta={`${source} · ${marker.severity} · ${marker.markerKind}`}
                  onClick={() => onSelect({ type: "marker", id: marker.id })}
                />
              ))}
            </NavGroup>
          </div>
        ) : (
          <p className="builder-muted">No workspace loaded. Import displays only structural artifacts and keeps runtime state untouched.</p>
        )}
        {selection ? (
          <p className="builder-selection-readout" aria-live="polite">
            Selected {formatSelectionType(selection.type)} {selection.id}
          </p>
        ) : null}
      </CornerFramePanel>
    </aside>
  );
}

function NavGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="builder-nav-group" aria-label={`${title} (${count})`}>
      <h2>
        {title} <span>{count}</span>
      </h2>
      <div>{count > 0 ? children : <p className="builder-muted">None declared.</p>}</div>
    </section>
  );
}

function NavButton({ active, label, meta, onClick }: { active: boolean; label: string; meta: string; onClick: () => void }) {
  return (
    <button type="button" className={active ? "is-active" : ""} aria-pressed={active} onClick={onClick} suppressHydrationWarning>
      <span>{label}</span>
      <em>{meta}</em>
    </button>
  );
}
