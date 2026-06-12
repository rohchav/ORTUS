"use client";

import { CornerFramePanel } from "../ui/CornerFramePanel";
import type { BuilderWorkspaceViewModel } from "./builderViewModel";
import { getWorkspaceValidationViewModel, getWorkspaceWarningsViewModel } from "./builderViewModel";

interface BuilderValidationPanelProps {
  viewModel: BuilderWorkspaceViewModel | null;
  showValidation: boolean;
  showWarnings: boolean;
}

export function BuilderValidationPanel({ viewModel, showValidation, showWarnings }: BuilderValidationPanelProps) {
  const report = viewModel ? getWorkspaceValidationViewModel(viewModel) : null;
  const warnings = viewModel ? getWorkspaceWarningsViewModel(viewModel) : [];

  return (
    <CornerFramePanel title="Validation + Warnings" eyebrow="Capability Boundary" variant="compact" className="builder-validation-panel">
      <section className="builder-validation" aria-label="Workspace validation and warnings" aria-live="polite">
        {!viewModel || !report ? (
          <p className="builder-muted">No workspace loaded. Invalid imports are rejected before they replace the previous valid workspace.</p>
        ) : (
          <>
            {showValidation ? (
              <div className="builder-validation__block">
                <h2>Validation Report</h2>
                <dl className="builder-inspector__rows">
                  <div>
                    <dt>Structurally valid</dt>
                    <dd>{String(report.valid)}</dd>
                  </div>
                  <div>
                    <dt>Runnable now</dt>
                    <dd>{String(report.runnableNow)}</dd>
                  </div>
                  <div>
                    <dt>Visual builder runtime</dt>
                    <dd>{String(report.visualBuilderRuntimeAvailable)}</dd>
                  </div>
                  <div>
                    <dt>Schema execution</dt>
                    <dd>{String(report.schemaExecutionAvailable)}</dd>
                  </div>
                  <div>
                    <dt>Compiler</dt>
                    <dd>{String(report.compilerAvailable)}</dd>
                  </div>
                </dl>
                {report.errors.length > 0 ? (
                  <ul className="builder-message-list builder-message-list--error">
                    {report.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                ) : null}
                <section className="builder-message-list" aria-label="Missing runtime capabilities">
                  <h3>Missing Capabilities</h3>
                  <ul>
                    {report.missingCapabilities.map((capability) => (
                      <li key={capability}>{capability}</li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : null}
            {showWarnings ? (
              <div className="builder-validation__block">
                <h2>Warnings</h2>
                <ul className="builder-message-list">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
                <h2>Markers</h2>
                <ul className="builder-marker-list">
                  {viewModel.markers.map(({ source, marker }) => (
                    <li key={marker.id} data-severity={marker.severity}>
                      <strong>{marker.label}</strong>
                      <span>
                        {source} · {marker.markerKind} · {marker.severity}
                      </span>
                      <p>{marker.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </section>
    </CornerFramePanel>
  );
}
