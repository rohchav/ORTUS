"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import type { VisualBuilderWorkspaceDefinition } from "../../../simulation/visualBuilderWorkspace";
import { EmptyState } from "../../EmptyState";
import { CornerFramePanel } from "../../ui/CornerFramePanel";
import {
  createBuilderGraphEdgePath,
  createBuilderGraphViewModel,
  defaultBuilderGraphFilters,
  filterBuilderGraph,
  formatGraphLabel,
  formatGraphStatus,
  getBuilderGraphFitZoom,
  getBuilderGraphInspector,
  getBuilderGraphNeighborhood,
  getBuilderGraphNodeDomId,
  maxBuilderGraphVisualEdges,
  maxBuilderGraphVisualNodes,
  resolveBuilderGraphSelection,
  type BuilderGraphFilters,
  type BuilderGraphSelection,
  type BuilderGraphViewModel
} from "./builderGraphViewModel";

interface BuilderGraphViewProps {
  workspace: VisualBuilderWorkspaceDefinition | null;
}

interface BuilderGraphViewport {
  x: number;
  y: number;
  zoom: number;
}

const defaultGraphViewport: BuilderGraphViewport = { x: 0, y: 0, zoom: 1 };

export function BuilderGraphView({ workspace }: BuilderGraphViewProps) {
  const viewModel = useMemo(() => (workspace ? createBuilderGraphViewModel(workspace) : null), [workspace]);
  const [filters, setFilters] = useState<BuilderGraphFilters>(defaultBuilderGraphFilters);
  const [selection, setSelection] = useState<BuilderGraphSelection | null>(null);
  const [viewport, setViewport] = useState<BuilderGraphViewport>(defaultGraphViewport);
  const [highlightNeighborhood, setHighlightNeighborhood] = useState(true);
  const graphSurfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters(defaultBuilderGraphFilters);
    setSelection(viewModel?.nodes[0] ? { type: "node", id: viewModel.nodes[0].id } : null);
    setViewport(defaultGraphViewport);
  }, [viewModel]);

  const filtered = useMemo(
    () => (viewModel ? filterBuilderGraph(viewModel, filters) : { nodes: [], edges: [], hiddenNodeCount: 0, hiddenEdgeCount: 0 }),
    [filters, viewModel]
  );
  const neighborhood = useMemo(
    () => (viewModel ? getBuilderGraphNeighborhood(viewModel, selection) : { nodeIds: new Set<string>(), edgeIds: new Set<string>() }),
    [selection, viewModel]
  );
  const inspector = useMemo(
    () => (viewModel ? getBuilderGraphInspector(viewModel, selection) : null),
    [selection, viewModel]
  );
  const nodeById = useMemo(() => new Map(filtered.nodes.map((node) => [node.id, node])), [filtered.nodes]);
  const visibleNodeIds = useMemo(() => new Set(filtered.nodes.map((node) => node.id)), [filtered.nodes]);
  const visibleEdgeIds = useMemo(() => new Set(filtered.edges.map((edge) => edge.id)), [filtered.edges]);

  useEffect(() => {
    setSelection((current) => resolveBuilderGraphSelection(current, filtered));
  }, [filtered.edges, filtered.nodes]);

  function selectGraphItem(nextSelection: BuilderGraphSelection) {
    setSelection(nextSelection);
  }

  function resetFilters() {
    setFilters(defaultBuilderGraphFilters);
  }

  function fitGraph() {
    if (!viewModel?.summary.visualGraphAvailable || viewModel.summary.nodeCount === 0) {
      return;
    }
    const surface = graphSurfaceRef.current;
    setViewport({
      x: 0,
      y: 0,
      zoom: getBuilderGraphFitZoom(viewModel, surface?.clientWidth, surface?.clientHeight)
    });
  }

  function handleNodeKeyDown(event: KeyboardEvent<HTMLButtonElement>, nodeId: string) {
    const currentIndex = filtered.nodes.findIndex((node) => node.id === nodeId);
    const nextIndex =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (currentIndex + 1) % filtered.nodes.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (currentIndex - 1 + filtered.nodes.length) % filtered.nodes.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? filtered.nodes.length - 1
              : null;
    if (nextIndex === null || filtered.nodes.length === 0) {
      return;
    }
    event.preventDefault();
    const nextNode = filtered.nodes[nextIndex];
    if (!nextNode) {
      return;
    }
    setSelection({ type: "node", id: nextNode.id });
    focusGraphNode(nextNode.id);
  }

  return (
    <section
      id="builder-mode-panel-graph"
      className="builder-graph-mode"
      role="tabpanel"
      aria-labelledby="builder-mode-tab-graph"
      aria-label="Read-only structural Graph View"
    >
      <header className="builder-graph-mode__status">
        <div>
          <span>Visual Builder Graph View V1</span>
          <h2>{viewModel?.sourceArtifactName ?? "No graph source loaded"}</h2>
          <p>
            {viewModel
              ? `${viewModel.sourceArtifactType} · ${viewModel.sourceArtifactId}`
              : "Import an ortus.visualBuilderWorkspace artifact in Workspace Inspector."}
          </p>
        </div>
        <dl className="builder-graph-summary" aria-label="Graph structural status summary">
          <div>
            <dt>Structural validity</dt>
            <dd>{viewModel ? (viewModel.structuralValid ? "Valid" : "Invalid") : "No source"}</dd>
          </div>
          <div>
            <dt>Runnable now</dt>
            <dd>No</dd>
          </div>
          <div>
            <dt>Validation markers</dt>
            <dd>{viewModel?.summary.validationMarkerCount ?? 0}</dd>
          </div>
          <div>
            <dt>Warning markers</dt>
            <dd>{viewModel?.summary.warningMarkerCount ?? 0}</dd>
          </div>
          <div>
            <dt>Unsupported items</dt>
            <dd>{viewModel?.summary.unsupportedItemCount ?? 0}</dd>
          </div>
          <div>
            <dt>Unsupported markers</dt>
            <dd>{viewModel?.summary.unsupportedMarkerCount ?? 0}</dd>
          </div>
          <div>
            <dt>Future-only items / markers</dt>
            <dd>
              {viewModel?.summary.futureOnlyItemCount ?? 0} / {viewModel?.summary.futureOnlyMarkerCount ?? 0}
            </dd>
          </div>
          <div>
            <dt>Service-only items</dt>
            <dd>{viewModel?.summary.serviceOnlyItemCount ?? 0}</dd>
          </div>
          <div>
            <dt>Runtime-boundary notices</dt>
            <dd>{viewModel?.summary.reportNoticeCount ?? 0}</dd>
          </div>
          <div>
            <dt>Missing runtime capabilities</dt>
            <dd>{viewModel?.summary.missingRuntimeCapabilityCount ?? 0}</dd>
          </div>
          <div>
            <dt>Interpreter / compiler</dt>
            <dd>Unavailable</dd>
          </div>
        </dl>
        <div className="builder-graph-mode__safety" role="note" aria-label="Graph View runtime boundary">
          <strong>Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges.</strong>
          <span>Graph View is read-only. It visualizes structural relationships and does not execute nodes or edges.</span>
          <span>Graph selection, filtering, panning, and zooming are UI-only state.</span>
          <span>Graph View is not visual programming, schema execution, or runtime generation.</span>
          <span>Workspace nodes and edges are visual descriptors, not executable dataflow.</span>
          <span>A structurally valid workspace is still not a runnable model.</span>
          <span>A graph that looks complete is still not a runnable model.</span>
        </div>
      </header>

      <div className="builder-graph-mode__layout">
        <aside className="builder-graph-sidebar" aria-label="Graph controls and outline" tabIndex={0}>
          <GraphControls
            viewModel={viewModel}
            filters={filters}
            viewport={viewport}
            highlightNeighborhood={highlightNeighborhood}
            onFiltersChange={setFilters}
            onViewportChange={setViewport}
            onFitGraph={fitGraph}
            onHighlightNeighborhoodChange={setHighlightNeighborhood}
            onResetFilters={resetFilters}
          />
          <GraphOutline
            viewModel={viewModel}
            nodes={filtered.nodes}
            selection={selection}
            hiddenNodeCount={filtered.hiddenNodeCount}
            onSelect={selectGraphItem}
          />
        </aside>

        <GraphCanvas
          viewModel={viewModel}
          surfaceRef={graphSurfaceRef}
          nodes={filtered.nodes}
          edges={filtered.edges}
          nodeById={nodeById}
          selection={selection}
          viewport={viewport}
          highlightNeighborhood={highlightNeighborhood}
          neighborhood={neighborhood}
          hiddenNodeCount={filtered.hiddenNodeCount}
          hiddenEdgeCount={filtered.hiddenEdgeCount}
          onSelect={selectGraphItem}
          onNodeKeyDown={handleNodeKeyDown}
          onResetFilters={resetFilters}
        />

        <aside className="builder-graph-inspector-column" aria-label="Graph inspector and edge list">
          <GraphInspector
            viewModel={viewModel}
            inspector={inspector}
            selection={selection}
            visibleNodeIds={visibleNodeIds}
            visibleEdgeIds={visibleEdgeIds}
            onSelect={selectGraphItem}
          />
          <GraphEdgeList
            edges={filtered.edges}
            selection={selection}
            onSelect={selectGraphItem}
          />
        </aside>
      </div>
    </section>
  );
}

function GraphControls({
  viewModel,
  filters,
  viewport,
  highlightNeighborhood,
  onFiltersChange,
  onViewportChange,
  onFitGraph,
  onHighlightNeighborhoodChange,
  onResetFilters
}: {
  viewModel: BuilderGraphViewModel | null;
  filters: BuilderGraphFilters;
  viewport: BuilderGraphViewport;
  highlightNeighborhood: boolean;
  onFiltersChange: (filters: BuilderGraphFilters) => void;
  onViewportChange: (viewport: BuilderGraphViewport) => void;
  onFitGraph: () => void;
  onHighlightNeighborhoodChange: (value: boolean) => void;
  onResetFilters: () => void;
}) {
  const viewportAvailable = Boolean(
    viewModel?.summary.visualGraphAvailable && viewModel.summary.nodeCount > 0
  );

  return (
    <CornerFramePanel title="Explore Graph" eyebrow="UI-only controls" variant="compact">
      <section className="builder-graph-controls" aria-label="Graph search, filters, pan, and zoom">
        <label className="builder-graph-field">
          <span>Search id, label, kind, or status</span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            disabled={!viewModel}
            placeholder="Search structural items"
            suppressHydrationWarning
          />
        </label>
        <div className="builder-graph-filter-grid">
          <label className="builder-graph-field">
            <span>Node kind</span>
            <select
              value={filters.nodeKind}
              onChange={(event) => onFiltersChange({ ...filters, nodeKind: event.target.value as BuilderGraphFilters["nodeKind"] })}
              disabled={!viewModel}
              suppressHydrationWarning
            >
              <option value="all">All kinds</option>
              {(viewModel?.availableNodeKinds ?? []).map((kind) => (
                <option key={kind} value={kind}>
                  {formatGraphLabel(kind)}
                </option>
              ))}
            </select>
          </label>
          <label className="builder-graph-field">
            <span>Node status</span>
            <select
              value={filters.nodeStatus}
              onChange={(event) => onFiltersChange({ ...filters, nodeStatus: event.target.value as BuilderGraphFilters["nodeStatus"] })}
              disabled={!viewModel}
              suppressHydrationWarning
            >
              <option value="all">All statuses</option>
              {(viewModel?.availableNodeStatuses ?? []).map((status) => (
                <option key={status} value={status}>
                  {formatGraphStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="builder-graph-field">
            <span>Warning status</span>
            <select
              value={filters.warningStatus}
              onChange={(event) =>
                onFiltersChange({ ...filters, warningStatus: event.target.value as BuilderGraphFilters["warningStatus"] })
              }
              disabled={!viewModel}
              suppressHydrationWarning
            >
              <option value="all">All items</option>
              <option value="withWarnings">Warnings only</option>
            </select>
          </label>
        </div>
        <div className="builder-graph-toggles">
          <label>
            <input
              type="checkbox"
              checked={filters.showFutureOnly}
              onChange={(event) => onFiltersChange({ ...filters, showFutureOnly: event.target.checked })}
              disabled={!viewModel}
              suppressHydrationWarning
            />
            <span>Show future-only items</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showUnsupported}
              onChange={(event) => onFiltersChange({ ...filters, showUnsupported: event.target.checked })}
              disabled={!viewModel}
              suppressHydrationWarning
            />
            <span>Show unsupported items</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={highlightNeighborhood}
              onChange={(event) => onHighlightNeighborhoodChange(event.target.checked)}
              disabled={!viewModel}
              suppressHydrationWarning
            />
            <span>Highlight selected connections</span>
          </label>
        </div>
        <button type="button" onClick={onResetFilters} disabled={!viewModel} suppressHydrationWarning>
          Reset Filters
        </button>
        <div className="builder-graph-viewport-controls" aria-label="Graph viewport controls">
          <button
            type="button"
            aria-label="Pan graph left"
            onClick={() => onViewportChange({ ...viewport, x: viewport.x - 40 })}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Pan Left
          </button>
          <button
            type="button"
            aria-label="Pan graph right"
            onClick={() => onViewportChange({ ...viewport, x: viewport.x + 40 })}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Pan Right
          </button>
          <button
            type="button"
            aria-label="Pan graph up"
            onClick={() => onViewportChange({ ...viewport, y: viewport.y - 40 })}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Pan Up
          </button>
          <button
            type="button"
            aria-label="Pan graph down"
            onClick={() => onViewportChange({ ...viewport, y: viewport.y + 40 })}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Pan Down
          </button>
          <button
            type="button"
            aria-label="Zoom graph out"
            onClick={() => onViewportChange({ ...viewport, zoom: clampZoom(viewport.zoom - 0.1) })}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Zoom Out
          </button>
          <button
            type="button"
            aria-label="Zoom graph in"
            onClick={() => onViewportChange({ ...viewport, zoom: clampZoom(viewport.zoom + 0.1) })}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Zoom In
          </button>
          <button
            type="button"
            aria-label="Fit structural graph in the visible surface"
            onClick={onFitGraph}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Fit Graph
          </button>
          <button
            type="button"
            aria-label="Reset structural graph view"
            onClick={() => onViewportChange(defaultGraphViewport)}
            disabled={!viewportAvailable}
            suppressHydrationWarning
          >
            Reset View
          </button>
        </div>
        <p className="builder-graph-viewport-readout">
          {viewportAvailable
            ? `View offset ${viewport.x}, ${viewport.y} · zoom ${Math.round(viewport.zoom * 100)}%`
            : "Visual viewport controls are unavailable in outline-only mode."}
        </p>
        {viewModel ? (
          <details className="builder-graph-warning-summary">
            <summary>
              Markers, notices, and unavailable capabilities (
              {viewModel.summary.validationMarkerCount +
                viewModel.summary.warningMarkerCount +
                viewModel.summary.unsupportedMarkerCount +
                viewModel.summary.reportNoticeCount +
                viewModel.summary.missingRuntimeCapabilityCount}
              )
            </summary>
            <ul>
              {viewModel.warnings.map((warning) => (
                <li key={warning.id}>
                  <strong>{warning.label}</strong>
                  <span>
                    {warning.severity} · {warning.targetType}
                    {warning.targetId ? ` ${warning.targetId}` : ""}
                  </span>
                  <p>{warning.message}</p>
                </li>
              ))}
              {viewModel.missingRuntimeCapabilities.map((capability) => (
                <li key={capability}>
                  <strong>Unavailable</strong>
                  <p>{capability}</p>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
    </CornerFramePanel>
  );
}

function GraphOutline({
  viewModel,
  nodes,
  selection,
  hiddenNodeCount,
  onSelect
}: {
  viewModel: BuilderGraphViewModel | null;
  nodes: readonly BuilderGraphViewModel["nodes"][number][];
  selection: BuilderGraphSelection | null;
  hiddenNodeCount: number;
  onSelect: (selection: BuilderGraphSelection) => void;
}) {
  return (
    <CornerFramePanel title="Graph Outline" eyebrow="Keyboard-accessible nodes" variant="compact">
      <section className="builder-graph-outline" aria-label="Graph outline grouped by node kind">
        {!viewModel ? (
          <p className="builder-muted">No workspace graph source is loaded.</p>
        ) : nodes.length === 0 ? (
          <p className="builder-muted">No nodes match the current filters. Reset filters to restore the outline.</p>
        ) : (
          viewModel.groups.map((group) => {
            const groupNodes = nodes.filter((node) => node.kind === group.kind);
            return groupNodes.length > 0 ? (
              <section key={group.id} aria-label={`${group.label} nodes`}>
                <h3>
                  {group.label} <span>{groupNodes.length}</span>
                </h3>
                <div>
                  {groupNodes.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      aria-pressed={selection?.type === "node" && selection.id === node.id}
                      className={selection?.type === "node" && selection.id === node.id ? "is-active" : ""}
                      onClick={() => onSelect({ type: "node", id: node.id })}
                      suppressHydrationWarning
                    >
                      <span>Structural node · {node.label}</span>
                      <em>
                        {node.id} · {formatGraphStatus(node.status)} · {node.warnings.length} warnings
                      </em>
                    </button>
                  ))}
                </div>
              </section>
            ) : null;
          })
        )}
        {viewModel ? (
          <p className="builder-graph-filter-count">
            Showing {nodes.length} of {viewModel.summary.nodeCount} nodes. {hiddenNodeCount} hidden by current filters.
          </p>
        ) : null}
      </section>
    </CornerFramePanel>
  );
}

function GraphCanvas({
  viewModel,
  surfaceRef,
  nodes,
  edges,
  nodeById,
  selection,
  viewport,
  highlightNeighborhood,
  neighborhood,
  hiddenNodeCount,
  hiddenEdgeCount,
  onSelect,
  onNodeKeyDown,
  onResetFilters
}: {
  viewModel: BuilderGraphViewModel | null;
  surfaceRef: RefObject<HTMLDivElement | null>;
  nodes: readonly BuilderGraphViewModel["nodes"][number][];
  edges: readonly BuilderGraphViewModel["edges"][number][];
  nodeById: ReadonlyMap<string, BuilderGraphViewModel["nodes"][number]>;
  selection: BuilderGraphSelection | null;
  viewport: BuilderGraphViewport;
  highlightNeighborhood: boolean;
  neighborhood: ReturnType<typeof getBuilderGraphNeighborhood>;
  hiddenNodeCount: number;
  hiddenEdgeCount: number;
  onSelect: (selection: BuilderGraphSelection) => void;
  onNodeKeyDown: (event: KeyboardEvent<HTMLButtonElement>, nodeId: string) => void;
  onResetFilters: () => void;
}) {
  return (
    <CornerFramePanel
      title="Structural Relationship Map"
      eyebrow="Read only · no execution"
      className="builder-graph-canvas-panel"
      actions={
        viewModel ? (
          <span className="builder-graph-canvas-count">
            {nodes.length} nodes · {edges.length} edges
          </span>
        ) : null
      }
    >
      <section className="builder-graph-canvas" aria-label="Read-only structural relationship graph">
        <p id="builder-graph-description" className="sr-only">
          Nodes are structural workspace descriptors. Lines show structural relationships only. Use the graph outline and edge list for equivalent
          keyboard-accessible text navigation.
        </p>
        {!viewModel ? (
          <EmptyState
            title="No graph source"
            message="Import an ortus.visualBuilderWorkspace artifact in Workspace Inspector. Graph View never creates a workspace from a schema."
          />
        ) : !viewModel.summary.visualGraphAvailable ? (
          <div className="builder-graph-fallback" role="status">
            <strong>Visual graph limited for this artifact</strong>
            <p>
              The workspace has {viewModel.summary.nodeCount} nodes and {viewModel.summary.edgeCount} edges. V1 draws at most{" "}
              {maxBuilderGraphVisualNodes} nodes and {maxBuilderGraphVisualEdges} edges.
            </p>
            <p>Use the filtered Graph Outline and Edges list. The source artifact is unchanged.</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="builder-graph-fallback" role="status">
            <strong>No graph items match the current filters</strong>
            <p>
              {hiddenNodeCount} nodes and {hiddenEdgeCount} edges are filtered out. Warning counts above still describe the complete source artifact.
            </p>
            <button type="button" onClick={onResetFilters} suppressHydrationWarning>
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            ref={surfaceRef}
            className="builder-graph-canvas__surface"
            role="group"
            aria-label={`Structural graph for ${viewModel.sourceArtifactName}`}
            aria-describedby="builder-graph-description"
          >
            <div
              className="builder-graph-canvas__plane"
              style={{
                width: viewModel.layout.width,
                height: viewModel.layout.height,
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
              }}
            >
              <svg
                className="builder-graph-edge-layer"
                width={viewModel.layout.width}
                height={viewModel.layout.height}
                aria-hidden="true"
              >
                {edges.map((edge) => {
                  const source = nodeById.get(edge.sourceNodeId);
                  const target = nodeById.get(edge.targetNodeId);
                  if (!source || !target) {
                    return null;
                  }
                  const selected = selection?.type === "edge" && selection.id === edge.id;
                  const dimmed =
                    highlightNeighborhood &&
                    Boolean(selection) &&
                    !selected &&
                    !neighborhood.edgeIds.has(edge.id);
                  return (
                    <path
                      key={edge.id}
                      d={createBuilderGraphEdgePath(source, target)}
                      className={`${selected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""} ${edge.warnings.length > 0 ? "has-warning" : ""}`}
                      data-kind={edge.kind}
                    />
                  );
                })}
              </svg>
              {nodes.map((node) => {
                const selected = selection?.type === "node" && selection.id === node.id;
                const dimmed =
                  highlightNeighborhood &&
                  Boolean(selection) &&
                  !selected &&
                  !neighborhood.nodeIds.has(node.id);
                return (
                  <button
                    key={node.id}
                    id={getBuilderGraphNodeDomId(node.id)}
                    type="button"
                    className={`builder-graph-node ${selected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
                    data-status={node.status}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: node.size.width,
                      height: node.size.height
                    }}
                    aria-pressed={selected}
                    aria-label={`Structural node; ${node.label}; ${formatGraphLabel(node.kind)}; ${formatGraphStatus(node.status)}; ${node.warnings.length} warnings; not executable`}
                    onClick={() => onSelect({ type: "node", id: node.id })}
                    onKeyDown={(event) => onNodeKeyDown(event, node.id)}
                    suppressHydrationWarning
                  >
                    <em>Structural node · {formatGraphLabel(node.kind)}</em>
                    <span>{node.label}</span>
                    <b>{formatGraphStatus(node.status)}</b>
                    <small>{node.warnings.length > 0 ? `${node.warnings.length} warning markers` : "No item warning markers"}</small>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </CornerFramePanel>
  );
}

function GraphInspector({
  viewModel,
  inspector,
  selection,
  visibleNodeIds,
  visibleEdgeIds,
  onSelect
}: {
  viewModel: BuilderGraphViewModel | null;
  inspector: ReturnType<typeof getBuilderGraphInspector>;
  selection: BuilderGraphSelection | null;
  visibleNodeIds: ReadonlySet<string>;
  visibleEdgeIds: ReadonlySet<string>;
  onSelect: (selection: BuilderGraphSelection) => void;
}) {
  return (
    <CornerFramePanel title="Graph Inspector" eyebrow="Read only" variant="compact">
      <section className="builder-graph-inspector" aria-label="Selected graph item inspector" tabIndex={0}>
        {!viewModel ? (
          <EmptyState title="No graph source" message="Load a workspace artifact before inspecting graph items." />
        ) : !inspector ? (
          <EmptyState title="Nothing selected" message="Select a node from the graph or outline, or an edge from the text list." />
        ) : (
          <>
            <div className="builder-graph-inspector__head">
              <span>{inspector.eyebrow}</span>
              <h2>{inspector.heading}</h2>
              <p aria-live="polite">
                Selected {selection?.type} {inspector.id}
              </p>
            </div>
            <dl className="builder-inspector__rows">
              {inspector.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="builder-limitation">{inspector.limitation}</p>
            <GraphInspectorLinks
              label="Connected nodes"
              ids={inspector.connectedNodeIds}
              type="node"
              visibleIds={visibleNodeIds}
              onSelect={onSelect}
            />
            <GraphInspectorLinks
              label="Connected edges"
              ids={inspector.connectedEdgeIds}
              type="edge"
              visibleIds={visibleEdgeIds}
              onSelect={onSelect}
            />
            {inspector.warnings.length > 0 ? (
              <section className="builder-graph-inspector__messages" aria-label="Selected item warnings">
                <h3>Warnings</h3>
                <ul>
                  {inspector.warnings.map((warning, index) => (
                    <li key={`${index}-${warning}`}>{warning}</li>
                  ))}
                </ul>
              </section>
            ) : (
              <p className="builder-muted">No item-specific warnings. Global runtime limitations still apply.</p>
            )}
            {inspector.notes.length > 0 ? (
              <section className="builder-graph-inspector__messages" aria-label="Selected item notes">
                <h3>Notes</h3>
                <ul>
                  {inspector.notes.map((note, index) => (
                    <li key={`${index}-${note}`}>{note}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section className="builder-graph-metadata" aria-label="Selected item metadata as text">
              <h3>Metadata</h3>
              <pre>{inspector.metadataText}</pre>
            </section>
          </>
        )}
      </section>
    </CornerFramePanel>
  );
}

function GraphInspectorLinks({
  label,
  ids,
  type,
  visibleIds,
  onSelect
}: {
  label: string;
  ids: readonly string[];
  type: BuilderGraphSelection["type"];
  visibleIds: ReadonlySet<string>;
  onSelect: (selection: BuilderGraphSelection) => void;
}) {
  return (
    <section className="builder-graph-inspector__links" aria-label={label}>
      <h3>{label}</h3>
      {ids.length > 0 ? (
        ids.map((id) =>
          visibleIds.has(id) ? (
            <button key={id} type="button" onClick={() => onSelect({ type, id })} suppressHydrationWarning>
              {id}
            </button>
          ) : (
            <span key={id}>
              {id} · hidden by current filters
            </span>
          )
        )
      ) : (
        <span>None</span>
      )}
    </section>
  );
}

function GraphEdgeList({
  edges,
  selection,
  onSelect
}: {
  edges: readonly BuilderGraphViewModel["edges"][number][];
  selection: BuilderGraphSelection | null;
  onSelect: (selection: BuilderGraphSelection) => void;
}) {
  return (
    <CornerFramePanel title="Edges" eyebrow="Accessible relationship list" variant="compact">
      <section className="builder-graph-edge-list" aria-label="Structural graph edges as text">
        {edges.length === 0 ? (
          <p className="builder-muted">No edges match the current filters. Edges are never executable dataflow.</p>
        ) : (
          edges.map((edge) => (
            <button
              key={edge.id}
              type="button"
              aria-pressed={selection?.type === "edge" && selection.id === edge.id}
              className={selection?.type === "edge" && selection.id === edge.id ? "is-active" : ""}
              onClick={() => onSelect({ type: "edge", id: edge.id })}
              suppressHydrationWarning
            >
              <span>Structural relation · {edge.label}</span>
              <em>
                {edge.sourceNodeId} to {edge.targetNodeId} · {formatGraphLabel(edge.kind)} · structural relation · {edge.warnings.length} warnings
              </em>
            </button>
          ))
        )}
      </section>
    </CornerFramePanel>
  );
}

function focusGraphNode(nodeId: string) {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(getBuilderGraphNodeDomId(nodeId))?.focus();
  });
}

function clampZoom(value: number): number {
  return Math.max(0.1, Math.min(1.6, Number(value.toFixed(2))));
}
