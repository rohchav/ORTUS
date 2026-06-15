"use client";

import { EmptyState } from "../EmptyState";
import { CornerFramePanel } from "../ui/CornerFramePanel";
import type { BuilderSelection, BuilderWorkspaceFilters, BuilderWorkspaceViewModel } from "./builderViewModel";
import {
  createBuilderViewportLayout,
  formatNodeKind,
  formatNodeStatus,
  getVisibleWorkspaceEdges,
  getVisibleWorkspaceNodes
} from "./builderViewModel";

interface BuilderViewportState {
  x: number;
  y: number;
  zoom: number;
}

interface BuilderViewportProps {
  viewModel: BuilderWorkspaceViewModel | null;
  filters: BuilderWorkspaceFilters;
  selection: BuilderSelection | null;
  viewport: BuilderViewportState;
  onViewportChange: (viewport: BuilderViewportState) => void;
  onResetViewport: () => void;
  onSelect: (selection: BuilderSelection) => void;
}

export function BuilderViewport({ viewModel, filters, selection, viewport, onViewportChange, onResetViewport, onSelect }: BuilderViewportProps) {
  const visibleNodes = viewModel ? getVisibleWorkspaceNodes(viewModel, filters) : [];
  const visibleEdges = viewModel ? getVisibleWorkspaceEdges(viewModel, visibleNodes) : [];
  const layout = createBuilderViewportLayout(visibleNodes, visibleEdges);
  const nodeLayoutsById = new Map(layout.nodes.map((node) => [node.id, node]));

  return (
    <CornerFramePanel
      title="Workspace Viewport"
      eyebrow="Read Only"
      actions={
        <div className="builder-viewport-controls" aria-label="Read-only viewport controls">
          <button type="button" onClick={() => onViewportChange({ ...viewport, x: viewport.x - 32 })} aria-label="Pan viewport left" suppressHydrationWarning>
            ←
          </button>
          <button type="button" onClick={() => onViewportChange({ ...viewport, x: viewport.x + 32 })} aria-label="Pan viewport right" suppressHydrationWarning>
            →
          </button>
          <button type="button" onClick={() => onViewportChange({ ...viewport, y: viewport.y - 32 })} aria-label="Pan viewport up" suppressHydrationWarning>
            ↑
          </button>
          <button type="button" onClick={() => onViewportChange({ ...viewport, y: viewport.y + 32 })} aria-label="Pan viewport down" suppressHydrationWarning>
            ↓
          </button>
          <button
            type="button"
            onClick={() => onViewportChange({ ...viewport, zoom: Math.max(0.65, Number((viewport.zoom - 0.1).toFixed(2))) })}
            aria-label="Zoom viewport out"
            suppressHydrationWarning
          >
            -
          </button>
          <button
            type="button"
            onClick={() => onViewportChange({ ...viewport, zoom: Math.min(1.6, Number((viewport.zoom + 0.1).toFixed(2))) })}
            aria-label="Zoom viewport in"
            suppressHydrationWarning
          >
            +
          </button>
          <button type="button" onClick={onResetViewport} suppressHydrationWarning>
            Reset View
          </button>
        </div>
      }
      className="builder-viewport-panel"
    >
      <section className="builder-viewport" aria-label="Read-only visual workspace descriptors">
        {!viewModel ? (
          <EmptyState
            title="No workspace loaded"
            message="Import an ortus.visualBuilderWorkspace artifact to inspect its structural nodes, edges, markers, and references."
          />
        ) : visibleNodes.length === 0 ? (
          <EmptyState title="No visible nodes" message="The current filters hide all nodes. Unsupported and future-only items remain available in navigation." />
        ) : (
          <>
            <div className="builder-viewport__surface" tabIndex={0} aria-label="Read-only workspace graph viewport">
              <div
                className="builder-viewport__canvas"
                style={{
                  width: layout.width,
                  height: layout.height,
                  transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
                }}
              >
                <svg className="builder-edge-layer" width={layout.width} height={layout.height} aria-hidden="true">
                  {layout.edges.map((edgeLayout) => (
                    <line
                      key={edgeLayout.id}
                      x1={edgeLayout.x1}
                      y1={edgeLayout.y1}
                      x2={edgeLayout.x2}
                      y2={edgeLayout.y2}
                      className={selection?.type === "edge" && selection.id === edgeLayout.id ? "is-selected" : ""}
                    />
                  ))}
                </svg>
                {visibleNodes.map((node) => {
                  const nodeLayout = nodeLayoutsById.get(node.id);
                  if (!nodeLayout) {
                    return null;
                  }
                  const connected = visibleEdges.some((edge) => edge.sourceNodeId === node.id || edge.targetNodeId === node.id);
                  const selected = selection?.type === "node" && selection.id === node.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={`builder-node-card ${selected ? "is-selected" : ""} ${connected ? "is-connected" : ""}`}
                      data-status={node.status}
                      style={{
                        left: nodeLayout.x,
                        top: nodeLayout.y,
                        width: nodeLayout.width,
                        height: nodeLayout.height
                      }}
                      aria-pressed={selected}
                      aria-label={`Select structural node ${node.label} for read-only inspection; ${formatNodeKind(node.nodeKind)}; ${formatNodeStatus(node.status)}`}
                      onClick={() => onSelect({ type: "node", id: node.id })}
                      suppressHydrationWarning
                    >
                      <span>{node.label}</span>
                      <em>{formatNodeKind(node.nodeKind)}</em>
                      <b>{formatNodeStatus(node.status)}</b>
                    </button>
                  );
                })}
              </div>
            </div>
            <section className="builder-edge-list" aria-label="Workspace edges as text">
              <h2>Edges</h2>
              {visibleEdges.length > 0 ? (
                visibleEdges.map((edge) => (
                  <button
                    key={edge.id}
                    type="button"
                    className={selection?.type === "edge" && selection.id === edge.id ? "is-active" : ""}
                    aria-pressed={selection?.type === "edge" && selection.id === edge.id}
                    aria-label={`Select structural edge ${edge.label ?? edge.id} for read-only inspection; not executable dataflow`}
                    onClick={() => onSelect({ type: "edge", id: edge.id })}
                    suppressHydrationWarning
                  >
                    <span>{edge.label ?? edge.id}</span>
                    <em>
                      {edge.sourceNodeId} → {edge.targetNodeId} · {edge.edgeKind} · structural link, not executable dataflow
                    </em>
                  </button>
                ))
              ) : (
                <p className="builder-muted">No visible edges. Edges remain visual descriptors, not dataflow.</p>
              )}
            </section>
          </>
        )}
      </section>
    </CornerFramePanel>
  );
}
