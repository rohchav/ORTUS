"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { maxModelSchemaJsonLength, type ModelSchemaDefinition } from "../../simulation/modelSchema";
import { CornerFramePanel } from "../ui/CornerFramePanel";
import { ModelSchemaSectionEditor, type RemovalRequest } from "./ModelSchemaSectionEditor";
import {
  createEmptyModelSchemaDraft,
  createModelSchemaDraftView,
  exportModelSchemaDraft,
  importModelSchemaDraft,
  isModelSchemaDraftDirty,
  mapModelSchemaErrorToFieldId,
  modelSchemaAuthoringSections,
  removeModelSchemaDeclaration,
  type ModelSchemaAuthoringSectionId
} from "./modelSchemaAuthoring";

type PendingAction =
  | { type: "reset"; triggerId: string; focusAfterId: string }
  | { type: "restore"; triggerId: string; focusAfterId: string }
  | { type: "import"; artifact: ModelSchemaDefinition; triggerId: string; focusAfterId: string }
  | { type: "removeMetadata"; metadataKey: string; triggerId: string; focusAfterId: string }
  | ({ type: "remove" } & RemovalRequest);

interface ModelSchemaAuthoringShellProps {
  hidden?: boolean;
}

export function ModelSchemaAuthoringShell({ hidden = false }: ModelSchemaAuthoringShellProps) {
  const initialDraft = useMemo(() => createEmptyModelSchemaDraft(), []);
  const [draft, setDraft] = useState<ModelSchemaDefinition>(initialDraft);
  const [baseline, setBaseline] = useState<ModelSchemaDefinition>(initialDraft);
  const [lastValidArtifact, setLastValidArtifact] = useState<ModelSchemaDefinition | null>(null);
  const [activeSection, setActiveSection] = useState<ModelSchemaAuthoringSectionId>("identity");
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Empty structural draft created in memory.");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deferredDraft = useDeferredValue(draft);
  const validationPending = deferredDraft !== draft;
  const view = useMemo(() => createModelSchemaDraftView(deferredDraft), [deferredDraft]);
  const dirty = useMemo(() => isModelSchemaDraftDirty(draft, baseline), [draft, baseline]);

  useEffect(() => {
    if (!dirty) {
      return;
    }
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (pendingAction) {
      confirmButtonRef.current?.focus();
    }
  }, [pendingAction]);

  function updateDraft(nextDraft: ModelSchemaDefinition) {
    setDraft(nextDraft);
    setExportText("");
    setExportError(null);
    setStatusMessage("Draft changed. Validation report updated; no runtime state was touched.");
  }

  function importSchema(json: string, triggerId: string) {
    const result = importModelSchemaDraft(draft, json);
    if (!result.changed || !result.artifact) {
      setImportError(result.error ?? "Invalid model schema JSON.");
      setStatusMessage("Import rejected. The current draft and last valid artifact were preserved.");
      return;
    }
    if (dirty) {
      setPendingAction({
        type: "import",
        artifact: result.artifact,
        triggerId,
        focusAfterId: triggerId
      });
      setImportError(null);
      setStatusMessage("Valid import staged. Confirm before replacing the current unsaved draft.");
      return;
    }
    applyImportedArtifact(result.artifact);
  }

  function applyImportedArtifact(artifact: ModelSchemaDefinition) {
    setDraft(artifact);
    setBaseline(artifact);
    setLastValidArtifact(artifact);
    setActiveSection("identity");
    setImportError(null);
    setExportError(null);
    setExportText("");
    setStatusMessage("Valid model-schema artifact imported. It remains structural and not runnable.");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (file.size > maxModelSchemaJsonLength * 4) {
      setImportError(`Model-schema file is too large. The import limit is ${maxModelSchemaJsonLength} JSON characters.`);
      setStatusMessage("Oversized file import rejected before reading. The current draft and last valid artifact were preserved.");
      return;
    }
    try {
      const text = await file.text();
      setImportText(text);
      importSchema(text, "schema-import-file");
    } catch {
      setImportError("Could not read model-schema JSON file.");
      setStatusMessage("File import failed. The current draft was preserved.");
    }
  }

  function exportSchema() {
    const result = exportModelSchemaDraft(draft);
    if (!result.artifact) {
      setExportError(result.error ?? "The current draft is not structurally valid.");
      setExportText("");
      setStatusMessage("Export unavailable. Fix structural validation errors first.");
      return;
    }
    setDraft(result.artifact);
    setBaseline(result.artifact);
    setLastValidArtifact(result.artifact);
    setExportText(result.json);
    setExportError(null);
    setStatusMessage("Valid ortus.modelSchema JSON exported. Export does not create a runnable model.");
  }

  function requestReset() {
    if (!dirty) {
      resetDraft();
      return;
    }
    setPendingAction({ type: "reset", triggerId: "schema-reset-draft", focusAfterId: "schema-reset-draft" });
  }

  function requestRestore() {
    if (!lastValidArtifact) {
      return;
    }
    if (!dirty) {
      restoreLastValid();
      return;
    }
    setPendingAction({ type: "restore", triggerId: "schema-restore-last-valid", focusAfterId: "schema-restore-last-valid" });
  }

  function confirmPendingAction() {
    const action = pendingAction;
    if (!action) {
      return;
    }
    setPendingAction(null);
    if (action.type === "reset") {
      resetDraft();
    } else if (action.type === "restore") {
      restoreLastValid();
    } else if (action.type === "import") {
      applyImportedArtifact(action.artifact);
    } else if (action.type === "removeMetadata") {
      removeMetadataItem(action.metadataKey);
    } else {
      removeDraftItem(action);
    }
    focusAfterRender(action.focusAfterId);
  }

  function cancelPendingAction() {
    const focusId = pendingAction?.triggerId;
    setPendingAction(null);
    if (focusId) {
      focusAfterRender(focusId);
    }
  }

  function resetDraft() {
    const nextDraft = createEmptyModelSchemaDraft();
    setDraft(nextDraft);
    setBaseline(nextDraft);
    setActiveSection("identity");
    setImportText("");
    setExportText("");
    setImportError(null);
    setExportError(null);
    setStatusMessage("Draft reset to the minimal empty structural form. The last valid artifact checkpoint remains available.");
  }

  function restoreLastValid() {
    if (!lastValidArtifact) {
      return;
    }
    setDraft(lastValidArtifact);
    setBaseline(lastValidArtifact);
    setExportText("");
    setImportError(null);
    setExportError(null);
    setStatusMessage("Last valid imported/exported artifact restored as the current draft.");
  }

  function removeDraftItem(action: Extract<PendingAction, { type: "remove" }>) {
    const key = action.key;
    if (isAssumptionNoteKey(key)) {
      setDraft((current) => ({
        ...current,
        [key]: (current[key] ?? []).filter((_, index) => index !== action.index)
      }));
    } else {
      setDraft((current) => removeModelSchemaDeclaration(current, key, action.index));
    }
    setExportText("");
    setExportError(null);
    setStatusMessage(`${action.label} removed from the draft after confirmation.`);
  }

  function removeMetadataItem(metadataKey: string) {
    setDraft((current) => {
      const metadata = { ...(current.metadata ?? {}) };
      delete metadata[metadataKey];
      return { ...current, metadata };
    });
    setExportText("");
    setExportError(null);
    setStatusMessage(`Metadata ${metadataKey} removed from the draft after confirmation.`);
  }

  function handleConfirmationKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelPendingAction();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    if (event.shiftKey && document.activeElement === confirmButtonRef.current) {
      event.preventDefault();
      cancelButtonRef.current?.focus();
    } else if (!event.shiftKey && document.activeElement === cancelButtonRef.current) {
      event.preventDefault();
      confirmButtonRef.current?.focus();
    }
  }

  return (
    <section
      id="builder-mode-panel-authorSchema"
      className="schema-authoring-shell"
      role="tabpanel"
      aria-labelledby="builder-mode-tab-authorSchema"
      aria-label="Model schema authoring forms"
      hidden={hidden}
    >
      <aside className="schema-authoring-nav" aria-label="Schema outline and artifact exchange">
        <CornerFramePanel title="Schema Outline" eyebrow="Structural Sections" variant="compact">
          <SchemaSectionNavigation
            draft={draft}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </CornerFramePanel>
        <CornerFramePanel title="Import / Export" eyebrow="ortus.modelSchema" variant="compact">
          <div className="schema-artifact-exchange">
            <label className="schema-file-button">
              <input
                id="schema-import-file"
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                aria-label="Import model schema JSON file"
              />
              Import JSON file
            </label>
            <label htmlFor="schema-import-json">
              <span>Import JSON text</span>
              <textarea
                id="schema-import-json"
                className="json-box"
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="Paste a validated ortus.modelSchema artifact"
                rows={7}
              />
            </label>
            <button
              id="schema-import-text"
              type="button"
              onClick={() => importSchema(importText, "schema-import-text")}
              suppressHydrationWarning
            >
              Import model schema
            </button>
            {importError ? (
              <p className="builder-error" role="alert">
                {importError}
              </p>
            ) : null}
            <button type="button" onClick={exportSchema} disabled={validationPending || !view.structurallyValid} suppressHydrationWarning>
              Export valid schema JSON
            </button>
            {validationPending ? (
              <p className="builder-muted">Export is disabled while structural validation is updating.</p>
            ) : !view.structurallyValid ? (
              <p className="builder-muted">Export is disabled while the draft is structurally invalid.</p>
            ) : null}
            {exportError ? (
              <p className="builder-error" role="alert">
                {exportError}
              </p>
            ) : null}
            {exportText ? (
              <label htmlFor="schema-export-json">
                <span>Exported schema JSON</span>
                <textarea id="schema-export-json" className="json-box" value={exportText} readOnly rows={7} />
              </label>
            ) : null}
          </div>
        </CornerFramePanel>
      </aside>

      <div className="schema-authoring-editor">
        <header className="schema-authoring-editor__status">
          <div>
            <span>Model Schema Authoring Forms V1</span>
            <h2>{draft.name || "Untitled structural schema"}</h2>
            <p>{statusMessage}</p>
          </div>
          <div className="schema-draft-actions">
            <span className={dirty ? "is-dirty" : "is-clean"}>{dirty ? "Unsaved changes" : "Draft checkpoint current"}</span>
            <button id="schema-reset-draft" type="button" onClick={requestReset} suppressHydrationWarning>
              Reset draft
            </button>
            <button
              id="schema-restore-last-valid"
              type="button"
              disabled={!lastValidArtifact}
              onClick={requestRestore}
              suppressHydrationWarning
            >
              Restore last valid
            </button>
          </div>
        </header>
        <CornerFramePanel
          title={modelSchemaAuthoringSections.find((section) => section.id === activeSection)?.label ?? "Schema Section"}
          eyebrow="Structured Form"
          variant="standard"
          className="schema-authoring-editor__panel"
        >
          <div
            id="schema-section-panel"
            role="tabpanel"
            aria-labelledby={`schema-section-tab-${activeSection}`}
            className="schema-authoring-editor__scroll"
          >
            <ModelSchemaSectionEditor
              draft={draft}
              activeSection={activeSection}
              fieldErrorId={view.fieldErrorId}
              onDraftChange={updateDraft}
              onRequestRemoval={(request) => setPendingAction({ type: "remove", ...request })}
              onRequestMetadataRemoval={(request) => setPendingAction({ type: "removeMetadata", ...request })}
            />
          </div>
        </CornerFramePanel>
      </div>

      <aside className="schema-authoring-validation" aria-label="Schema validation and limits">
        <CornerFramePanel title="Validation + Limits" eyebrow="Service Report" variant="compact">
          <section className="schema-validation-report">
            <p className="schema-risk-note">A valid model schema is still not a runnable simulation.</p>
            <p className="schema-validation-status" role="status" aria-live="polite" aria-atomic="true">
              {validationPending
                ? "Structural validation updating."
                : `${view.report.valid ? "Structurally valid" : "Structurally invalid"}. ${view.report.errors.length} errors and ${view.report.warnings.length} warnings.`}
            </p>
            <dl className="builder-inspector__rows">
              <div>
                <dt>Structural status</dt>
                <dd>{view.report.valid ? "Structurally valid" : "Structurally invalid"}</dd>
              </div>
              <div>
                <dt>Runnable now</dt>
                <dd>{view.report.runnableNow ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt>Interpreter</dt>
                <dd>{view.report.interpreterAvailable ? "Available" : "Unavailable"}</dd>
              </div>
              <div>
                <dt>Executable rules</dt>
                <dd>{view.report.executableRuleCount}</dd>
              </div>
              <div>
                <dt>Error count</dt>
                <dd>{view.report.errors.length}</dd>
              </div>
              <div>
                <dt>Warning count</dt>
                <dd>{view.report.warnings.length}</dd>
              </div>
            </dl>
            {view.report.errors.length > 0 ? (
              <section className="schema-validation-block" aria-labelledby="schema-error-summary-title">
                <h3 id="schema-error-summary-title">Error Summary</h3>
                <ul className="builder-message-list builder-message-list--error">
	                  {view.report.errors.map((error, index) => {
	                    const targetId = mapModelSchemaErrorToFieldId(error);
	                    return (
	                      <li key={`${error}-${index}`}>
	                        {targetId ? (
	                          <a
	                            href={`#${validationErrorTarget(targetId, activeSection)}`}
	                            onClick={(event) => {
	                              event.preventDefault();
	                              const section = sectionForFieldError(targetId);
	                              setActiveSection(section);
	                              focusAfterRender(targetId);
	                            }}
	                          >
	                            {error}
	                          </a>
	                        ) : (
	                          error
	                        )}
	                      </li>
	                    );
	                  })}
                </ul>
              </section>
            ) : null}
            <section className="schema-validation-block" aria-labelledby="schema-missing-capabilities-title">
              <h3 id="schema-missing-capabilities-title">Missing Runtime Capabilities</h3>
              <ul className="builder-message-list">
                {view.report.missingRuntimeCapabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </section>
            <section className="schema-validation-block" aria-labelledby="schema-warning-summary-title">
              <h3 id="schema-warning-summary-title">Warnings</h3>
              <ul className="builder-message-list">
                {view.report.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
            {view.summary ? (
              <section className="schema-validation-block" aria-labelledby="schema-summary-title">
                <h3 id="schema-summary-title">Structural Summary</h3>
                <dl className="builder-inspector__rows">
                  <div>
                    <dt>Entities</dt>
                    <dd>{view.summary.entityTypeCount}</dd>
                  </div>
                  <div>
                    <dt>Components</dt>
                    <dd>{view.summary.componentTypeCount}</dd>
                  </div>
                  <div>
                    <dt>Attributes</dt>
                    <dd>{view.summary.attributeTypeCount}</dd>
                  </div>
                  <div>
                    <dt>Spaces</dt>
                    <dd>{view.summary.spaceCount}</dd>
                  </div>
                  <div>
                    <dt>Parameters</dt>
                    <dd>{view.summary.parameterCount}</dd>
                  </div>
                  <div>
                    <dt>Metrics</dt>
                    <dd>{view.summary.metricCount}</dd>
                  </div>
                  <div>
                    <dt>Rules</dt>
                    <dd>{view.summary.ruleDeclarationCount}</dd>
                  </div>
                  <div>
                    <dt>Artifact refs</dt>
                    <dd>{view.summary.artifactReferenceCount}</dd>
                  </div>
                </dl>
              </section>
            ) : null}
            <section className="schema-validation-block" aria-labelledby="schema-hard-limits-title">
              <h3 id="schema-hard-limits-title">Hard Limits</h3>
              <ul className="builder-message-list">
                <li>No schema execution.</li>
                <li>No compiler.</li>
                <li>No template generation.</li>
                <li>No scenario generation.</li>
                <li>No RunConfig generation.</li>
                <li>No snapshot generation.</li>
                <li>No engine generation.</li>
                <li>No visual graph authoring.</li>
                <li>No compatibility conversion.</li>
                <li>No social-learning artifact execution.</li>
              </ul>
            </section>
            <p className="builder-muted">
              Last valid artifact: {lastValidArtifact ? `${lastValidArtifact.name} (${lastValidArtifact.id})` : "none imported or exported yet"}.
            </p>
          </section>
        </CornerFramePanel>
      </aside>

      {pendingAction ? (
        <div className="schema-confirmation-backdrop">
          <div
            className="schema-confirmation"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="schema-confirmation-title"
            aria-describedby="schema-confirmation-description"
            onKeyDown={handleConfirmationKeyDown}
          >
            <h2 id="schema-confirmation-title">{confirmationTitle(pendingAction)}</h2>
            <p id="schema-confirmation-description">{confirmationDescription(pendingAction)}</p>
            <div>
              <button ref={confirmButtonRef} type="button" onClick={confirmPendingAction} suppressHydrationWarning>
                Confirm
              </button>
              <button ref={cancelButtonRef} type="button" onClick={cancelPendingAction} suppressHydrationWarning>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SchemaSectionNavigation({
  draft,
  activeSection,
  onSectionChange
}: {
  draft: ModelSchemaDefinition;
  activeSection: ModelSchemaAuthoringSectionId;
  onSectionChange: (section: ModelSchemaAuthoringSectionId) => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, sectionId: ModelSchemaAuthoringSectionId) {
    const currentIndex = modelSchemaAuthoringSections.findIndex((section) => section.id === sectionId);
    const nextIndex =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? (currentIndex + 1) % modelSchemaAuthoringSections.length
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? (currentIndex - 1 + modelSchemaAuthoringSections.length) % modelSchemaAuthoringSections.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? modelSchemaAuthoringSections.length - 1
              : null;
    if (nextIndex === null) {
      return;
    }
    event.preventDefault();
    const nextSection = modelSchemaAuthoringSections[nextIndex]!;
    onSectionChange(nextSection.id);
    focusAfterRender(`schema-section-tab-${nextSection.id}`);
  }

  return (
    <nav className="schema-section-nav" aria-label="Model schema sections" role="tablist" aria-orientation="vertical">
      {modelSchemaAuthoringSections.map((section) => (
        <button
          key={section.id}
          id={`schema-section-tab-${section.id}`}
          type="button"
          role="tab"
          aria-selected={activeSection === section.id}
          aria-controls="schema-section-panel"
          tabIndex={activeSection === section.id ? 0 : -1}
          className={activeSection === section.id ? "is-active" : ""}
          onClick={() => onSectionChange(section.id)}
          onKeyDown={(event) => handleKeyDown(event, section.id)}
          suppressHydrationWarning
        >
          <span>{section.label}</span>
          <em>{sectionCount(draft, section.id)}</em>
        </button>
      ))}
    </nav>
  );
}

function sectionCount(draft: ModelSchemaDefinition, section: ModelSchemaAuthoringSectionId): string {
  switch (section) {
    case "identity":
      return draft.id && draft.name && draft.version ? "identity set" : "required fields";
    case "entities":
      return `${draft.entityTypes.length}`;
    case "components":
      return `${draft.componentTypes?.length ?? 0}`;
    case "attributes":
      return `${draft.attributeTypes?.length ?? 0}`;
    case "spaces":
      return `${draft.spaces?.length ?? 0}`;
    case "parameters":
      return `${draft.parameters?.length ?? 0}`;
    case "metrics":
      return `${draft.metrics?.length ?? 0}`;
    case "rules":
      return `${draft.ruleDeclarations?.length ?? 0}`;
    case "artifacts":
      return `${draft.artifactReferences?.length ?? 0}`;
    case "notes":
      return `${(draft.assumptionNotes?.length ?? 0) + (draft.limitationNotes?.length ?? 0) + (draft.validationNotes?.length ?? 0)}`;
  }
}

function confirmationTitle(action: PendingAction): string {
  if (action.type === "reset") {
    return "Reset unsaved draft?";
  }
  if (action.type === "restore") {
    return "Restore last valid artifact?";
  }
  if (action.type === "import") {
    return "Replace unsaved draft with imported schema?";
  }
  if (action.type === "removeMetadata") {
    return `Remove metadata ${action.metadataKey}?`;
  }
  return `Remove ${action.label}?`;
}

function confirmationDescription(action: PendingAction): string {
  if (action.type === "reset") {
    return "This discards all unsaved form edits and returns to the minimal empty draft. The last valid artifact checkpoint remains available.";
  }
  if (action.type === "restore") {
    return "This discards current unsaved edits and replaces the draft with the last valid imported or exported model-schema artifact.";
  }
  if (action.type === "import") {
    return "This discards current unsaved edits and replaces the draft with the validated imported model-schema artifact.";
  }
  if (action.type === "removeMetadata") {
    return "This removes the selected inert metadata entry from the draft. The action does not affect simulation state.";
  }
  return "This removes the selected structural item from the draft. Cross-references may become invalid and will be reported by the model-schema service.";
}

function focusAfterRender(id: string): void {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.focus();
  });
}

function validationErrorTarget(fieldErrorId: string, activeSection: ModelSchemaAuthoringSectionId): string {
  const section = sectionForFieldError(fieldErrorId);
  return section === activeSection ? fieldErrorId : `schema-section-tab-${section}`;
}

function sectionForFieldError(fieldErrorId: string): ModelSchemaAuthoringSectionId {
  if (fieldErrorId.includes("entityTypes") || fieldErrorId.endsWith("-entities")) {
    return "entities";
  }
  if (fieldErrorId.includes("componentTypes") || fieldErrorId.endsWith("-components")) {
    return "components";
  }
  if (fieldErrorId.includes("attributeTypes") || fieldErrorId.endsWith("-attributes")) {
    return "attributes";
  }
  if (fieldErrorId.includes("-spaces")) {
    return "spaces";
  }
  if (fieldErrorId.includes("-parameters")) {
    return "parameters";
  }
  if (fieldErrorId.includes("-metrics")) {
    return "metrics";
  }
  if (fieldErrorId.includes("ruleDeclarations") || fieldErrorId.endsWith("-rules")) {
    return "rules";
  }
  if (fieldErrorId.includes("artifactReferences") || fieldErrorId.endsWith("-artifacts")) {
    return "artifacts";
  }
  if (
    fieldErrorId.includes("assumptionNotes") ||
    fieldErrorId.includes("limitationNotes") ||
    fieldErrorId.includes("validationNotes") ||
    fieldErrorId.endsWith("-notes")
  ) {
    return "notes";
  }
  return "identity";
}

function isAssumptionNoteKey(
  key: RemovalRequest["key"]
): key is "assumptionNotes" | "limitationNotes" | "validationNotes" {
  return key === "assumptionNotes" || key === "limitationNotes" || key === "validationNotes";
}
