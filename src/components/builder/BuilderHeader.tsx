"use client";

import type { ChangeEvent } from "react";
import { OrtusBrand } from "../branding";
import { visualBuilderWorkspaceArtifactType } from "../../simulation/visualBuilderWorkspace";
import { BuilderStatusBadge } from "./BuilderStatusBadge";
import type { BuilderWorkspaceViewModel } from "./builderViewModel";

interface BuilderHeaderProps {
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

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      onFileText(await file.text());
    } catch {
      onFileError("Could not read workspace JSON file.");
    }
  }

  return (
    <header className="builder-header" aria-label="Visual builder shell header">
      <div className="builder-header__identity">
        <OrtusBrand href="/" showDescriptor={false} className="builder-header__brand" />
        <div>
          <span className="builder-header__eyebrow">Builder Workspace / Safe UI Shell V1</span>
          <h1>{workspace?.name ?? "No workspace loaded"}</h1>
          <p>
            {workspace?.id ?? "Import an ortus.visualBuilderWorkspace artifact"} · {workspace?.artifactType ?? visualBuilderWorkspaceArtifactType} · version{" "}
            {workspace?.version ?? "none"} · workspace {workspace?.workspaceVersion ?? "none"}
          </p>
          {viewModel ? (
            <p>
              {viewModel.summary.nodeCount} nodes · {viewModel.summary.edgeCount} edges · {viewModel.summary.warningMarkerCount} warning markers ·{" "}
              {viewModel.summary.unsupportedMarkerCount} unsupported markers
            </p>
          ) : null}
        </div>
      </div>
      <div className="builder-header__status" role="status" aria-label="Workspace structural status">
        {(viewModel?.statusBadges ?? [
          {
            label: "Structural only",
            tone: "accent" as const,
            description: "The shell displays structural workspace artifacts only."
          },
          {
            label: "Not runnable",
            tone: "danger" as const,
            description: "No loaded workspace can run as a model."
          },
          {
            label: "No compiler",
            tone: "neutral" as const,
            description: "The builder shell does not compile models."
          },
          {
            label: "No schema execution",
            tone: "neutral" as const,
            description: "The builder shell does not execute model schemas."
          }
        ]).map((badge) => (
          <BuilderStatusBadge key={badge.label} badge={badge} />
        ))}
      </div>
      <div className="builder-header__actions" aria-label="Workspace file and panel actions">
        <label className="builder-file-button">
          <input type="file" accept="application/json,.json" onChange={handleFileChange} aria-label="Import workspace JSON file" />
          Import File
        </label>
        <button type="button" onClick={onLoadImportText} suppressHydrationWarning>
          Load Workspace JSON
        </button>
        <button type="button" onClick={onExport} disabled={!canExport} suppressHydrationWarning>
          Export Workspace JSON
        </button>
        <button type="button" onClick={onClearWorkspace} disabled={!workspace} suppressHydrationWarning>
          Clear Loaded Workspace
        </button>
        <button type="button" onClick={onToggleValidation} aria-pressed={showValidation} suppressHydrationWarning>
          Validation Panel
        </button>
        <button type="button" onClick={onToggleWarnings} aria-pressed={showWarnings} suppressHydrationWarning>
          Warnings Panel
        </button>
      </div>
    </header>
  );
}
