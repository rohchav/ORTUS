"use client";

import { EmptyState } from "../EmptyState";
import { CornerFramePanel } from "../ui/CornerFramePanel";
import type { BuilderSelection, BuilderWorkspaceViewModel } from "./builderViewModel";
import { getInspectorViewModel } from "./builderViewModel";

interface BuilderInspectorProps {
  viewModel: BuilderWorkspaceViewModel | null;
  selection: BuilderSelection | null;
  onSelectEdge: (edgeId: string) => void;
  onSelectMarker: (markerId: string) => void;
}

export function BuilderInspector({ viewModel, selection, onSelectEdge, onSelectMarker }: BuilderInspectorProps) {
  const inspector = viewModel ? getInspectorViewModel(viewModel, selection) : null;

  return (
    <CornerFramePanel title="Inspector" eyebrow="Read Only" variant="compact" className="builder-inspector-panel">
      <section className="builder-inspector" aria-label="Selected workspace item inspector" data-readonly="true">
        {!viewModel ? (
          <EmptyState title="No selection" message="Load a workspace to inspect structural nodes, edges, panels, markers, and references." />
        ) : !inspector ? (
          <EmptyState title="Nothing selected" message="Select a structural item from navigation or the viewport. Inspection is read-only." />
        ) : (
          <>
            <div className="builder-inspector__head">
              <span>{inspector.eyebrow}</span>
              <h2>{inspector.heading}</h2>
            </div>
            <dl className="builder-inspector__rows">
              {inspector.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="builder-limitation">{inspector.runtimeLimitation}</p>
            <div className="builder-inspector__links" aria-label="Inspector relationships">
              <span>Connected edges</span>
              {inspector.connectedEdgeIds.length > 0 ? (
                inspector.connectedEdgeIds.map((edgeId) => (
                  <button key={edgeId} type="button" onClick={() => onSelectEdge(edgeId)} suppressHydrationWarning>
                    {edgeId}
                  </button>
                ))
              ) : (
                <em>None</em>
              )}
              <span>Markers</span>
              {inspector.markerIds.length > 0 ? (
                inspector.markerIds.map((markerId) => (
                  <button key={markerId} type="button" onClick={() => onSelectMarker(markerId)} suppressHydrationWarning>
                    {markerId}
                  </button>
                ))
              ) : (
                <em>None</em>
              )}
            </div>
            {inspector.notes.length > 0 ? (
              <section className="builder-note-list" aria-label="Item notes">
                <h3>Notes</h3>
                <ul>
                  {inspector.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <p className="builder-metadata-summary">{inspector.metadataSummary}</p>
          </>
        )}
      </section>
    </CornerFramePanel>
  );
}
