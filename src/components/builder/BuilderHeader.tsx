"use client";

import type { ChangeEvent } from "react";
import { OrtusBrand } from "../branding";
import { maxVisualBuilderWorkspaceJsonLength, visualBuilderWorkspaceArtifactType } from "../../simulation/visualBuilderWorkspace";
import { BuilderStatusBadge } from "./BuilderStatusBadge";
import type { BuilderModeId } from "./BuilderModeTabs";
import type { BuilderWorkspaceViewModel } from "./builderViewModel";

interface BuilderHeaderProps {
  activeMode: BuilderModeId;
  viewModel: BuilderWorkspaceViewModel | null;
  canExport: boolean;
  showValidation: boolean;
  showWarnings: boolean;
  onLoadImportText: () => void;
  onFileText: (text: string) => void;
  onFileError: (message: string) => void;
  onExport: () => void;
  onClearWorkspace: () => void;
  onToggleValidation: () => void;
  onToggleWarnings: () => void;
}

export function BuilderHeader({
  activeMode,
  viewModel,
  canExport,
  showValidation,
  showWarnings,
  onLoadImportText,
  onFileText,
  onFileError,
  onExport,
  onClearWorkspace,
  onToggleValidation,
  onToggleWarnings
}: BuilderHeaderProps) {
  const workspace = viewModel?.workspace;
  const authoring = activeMode === "authorSchema";
  const graphViewing = activeMode === "graph";
  const statusBadges = [
    ...(authoring || !viewModel
      ? [
          {
            label: "Structural only",
            tone: "accent" as const,
            description: "Builder artifacts and forms are structural only."
          },
          {
            label: "Not runnable",
            tone: "danger" as const,
            description: "A structurally valid artifact is not a runnable simulation."
          },
          {
            label: "No compiler",
            tone: "neutral" as const,
            description: "The Builder does not compile or interpret model schemas."
          },
          {
            label: "No schema execution",
            tone: "neutral" as const,
            description: "The Builder does not execute model schemas or rule declarations."
          }
        ]
      : viewModel.statusBadges),
    {
      label: "No template generation",
      tone: "neutral" as const,
      description: "Builder artifacts do not generate templates."
    },
    {
      label: "No scenario generation",
      tone: "neutral" as const,
      description: "Builder artifacts do not generate scenarios."
    },
    {
      label: "No RunConfig generation",
      tone: "neutral" as const,
      description: "Builder artifacts do not generate RunConfigs."
    }
  ];

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (file.size > maxVisualBuilderWorkspaceJsonLength * 4) {
      onFileError(`Workspace file is too large. The import limit is ${maxVisualBuilderWorkspaceJsonLength} JSON characters.`);
      return;
    }
    try {
      onFileText(await file.text());
    } catch {
      onFileError("Could not read workspace JSON file.");
    }
  }

  return (
    <header className="builder-header" aria-label="ORTUS Builder header">
      <div className="builder-header__identity">
        <OrtusBrand href="/" showDescriptor={false} className="builder-header__brand" />
        <div>
          <span className="builder-header__eyebrow">
            {authoring
              ? "Builder / Model Schema Authoring Forms V1"
              : graphViewing
                ? "Builder / Visual Builder Graph View V1"
                : "Builder Workspace / Safe UI Shell V1"}
          </span>
          <h1>{authoring ? "Model Schema Authoring" : graphViewing ? "Structural Graph View" : (workspace?.name ?? "No workspace loaded")}</h1>
          {authoring ? (
            <p>ortus.modelSchema · structural artifact forms · local in-memory draft</p>
          ) : graphViewing ? (
            <p>
              {workspace?.name ?? "No workspace loaded"} · {workspace?.id ?? "import a workspace source"} ·{" "}
              {workspace?.artifactType ?? visualBuilderWorkspaceArtifactType}
            </p>
          ) : (
            <p>
              {workspace?.id ?? "Import an ortus.visualBuilderWorkspace artifact"} · {workspace?.artifactType ?? visualBuilderWorkspaceArtifactType} ·
              version {workspace?.version ?? "none"} · workspace {workspace?.workspaceVersion ?? "none"}
            </p>
          )}
          {authoring ? (
            <p>A valid authored schema is not a runnable simulation.</p>
          ) : graphViewing ? (
            <p>Visual relationships only · selection, filtering, panning, and zooming remain UI-only state.</p>
          ) : viewModel ? (
            <p>
              {viewModel.summary.nodeCount} nodes · {viewModel.summary.edgeCount} edges · {viewModel.summary.warningMarkerCount} warning markers ·{" "}
              {viewModel.summary.unsupportedMarkerCount} unsupported markers
            </p>
          ) : null}
        </div>
      </div>
      <div className="builder-header__status" role="status" aria-label="Builder structural status">
        {statusBadges.map((badge) => (
          <BuilderStatusBadge key={badge.label} badge={badge} />
        ))}
      </div>
      {authoring ? (
        <div className="builder-header__actions" aria-label="Schema authoring storage status">
          <span className="builder-header__local-state">Local draft only · no backend persistence</span>
        </div>
      ) : (
        <div className="builder-header__actions" aria-label="Workspace file and panel actions">
          <label className="builder-file-button">
            <input type="file" accept="application/json,.json" onChange={handleFileChange} aria-label="Import workspace JSON file" />
            Import File
          </label>
          {!graphViewing ? (
            <button type="button" onClick={onLoadImportText} suppressHydrationWarning>
              Load Workspace JSON
            </button>
          ) : null}
          <button type="button" onClick={onExport} disabled={!canExport} suppressHydrationWarning>
            Export Workspace JSON
          </button>
          <button type="button" onClick={onClearWorkspace} disabled={!workspace} suppressHydrationWarning>
            Clear Loaded Workspace
          </button>
          {!graphViewing ? (
            <>
              <button type="button" onClick={onToggleValidation} aria-pressed={showValidation} suppressHydrationWarning>
                Validation Panel
              </button>
              <button type="button" onClick={onToggleWarnings} aria-pressed={showWarnings} suppressHydrationWarning>
                Warnings Panel
              </button>
            </>
          ) : null}
        </div>
      )}
    </header>
  );
}
