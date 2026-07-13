"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { maxModelSchemaJsonLength, type ModelSchemaDefinition, type ModelSchemaSummary } from "../../simulation/modelSchema";
import { CornerFramePanel } from "../ui/CornerFramePanel";
import { ModelSchemaSectionEditor, type RemovalRequest } from "./ModelSchemaSectionEditor";
import {
  createEmptyModelSchemaDraft,
  createModelSchemaDraftView,
  exportModelSchemaDraft,
  importModelSchemaDraft,
  isEmptyModelSchemaAuthoringDraft,
  isModelSchemaDraftDirty,
  modelSchemaAuthoringSections,
  removeModelSchemaDeclaration,
  type ModelSchemaAuthoringSectionId
} from "./modelSchemaAuthoring";
import {
  createSchemaTemplateFitReportSnapshot,
  resolveSchemaTemplateFitReportUxModel,
  SchemaTemplateFitReportPanel,
  type SchemaTemplateFitConcept,
  type SchemaTemplateFitReportSnapshot
} from "./fitReport";
import {
  applySchemaRepairSuggestion,
  createSchemaValidationUxModel,
  formatSchemaValidationIssueDetails,
  schemaValidationEmptyState,
  schemaValidationRuleRepairBoundaryPhrase,
  type SchemaRepairSuggestion,
  type SchemaValidationIssue,
  type SchemaValidationIssueGroup,
  type SchemaValidationUxModel
} from "./validation/schemaValidationUx";
import {
  createSchemaScenarioPlanSnapshot,
  resolveSchemaScenarioPlanUxModel,
  SchemaScenarioPlanningPanel,
  schemaScenarioPlanningInvalidState,
  schemaScenarioPlanningStaleFitState,
  type ScenarioPlanningSectionId,
  type SchemaScenarioPlanSnapshot
} from "./scenarioPlanning";

type PendingAction =
  | { type: "reset"; triggerId: string; focusAfterId: string }
  | { type: "restore"; triggerId: string; focusAfterId: string }
  | { type: "import"; artifact: ModelSchemaDefinition; triggerId: string; focusAfterId: string }
  | {
      type: "guidedHandoff";
      artifact: ModelSchemaDefinition;
      currentDraftName: string;
      triggerId: string;
      focusAfterId: string;
    }
  | { type: "removeMetadata"; metadataKey: string; triggerId: string; focusAfterId: string }
  | { type: "repair"; suggestion: SchemaRepairSuggestion; triggerId: string; focusAfterId: string }
  | ({ type: "remove" } & RemovalRequest);

interface ModelSchemaAuthoringShellProps {
  hidden?: boolean;
  guidedHandoffRequest?: { requestId: number; artifact: ModelSchemaDefinition } | null;
  onGuidedHandoffResolution?: (requestId: number, status: "applied" | "canceled") => void;
}

export function ModelSchemaAuthoringShell({
  hidden = false,
  guidedHandoffRequest = null,
  onGuidedHandoffResolution
}: ModelSchemaAuthoringShellProps) {
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
  const [collapsedValidationGroups, setCollapsedValidationGroups] = useState<ReadonlySet<string>>(() => new Set());
  const [collapsedFitCandidates, setCollapsedFitCandidates] = useState<ReadonlySet<string>>(() => new Set());
  const [collapsedScenarioPlanSections, setCollapsedScenarioPlanSections] = useState<ReadonlySet<ScenarioPlanningSectionId>>(() => new Set());
  const [fitReportSnapshot, setFitReportSnapshot] = useState<SchemaTemplateFitReportSnapshot | null>(null);
  const [scenarioPlanSnapshot, setScenarioPlanSnapshot] = useState<SchemaScenarioPlanSnapshot | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const handledGuidedHandoffRequestRef = useRef<number | null>(null);
  const deferredDraft = useDeferredValue(draft);
  const validationPending = deferredDraft !== draft;
  const view = useMemo(() => createModelSchemaDraftView(deferredDraft), [deferredDraft]);
  const validationUx = useMemo(() => createSchemaValidationUxModel(deferredDraft, view.report), [deferredDraft, view.report]);
  const fitReportUx = useMemo(
    () => resolveSchemaTemplateFitReportUxModel(deferredDraft, view.structurallyValid, fitReportSnapshot),
    [deferredDraft, view.structurallyValid, fitReportSnapshot]
  );
  const scenarioPlanUx = useMemo(
    () => resolveSchemaScenarioPlanUxModel(deferredDraft, view.structurallyValid, fitReportUx, scenarioPlanSnapshot),
    [deferredDraft, fitReportUx, scenarioPlanSnapshot, view.structurallyValid]
  );
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

  useEffect(() => {
    if (!guidedHandoffRequest || handledGuidedHandoffRequestRef.current === guidedHandoffRequest.requestId) {
      return;
    }
    handledGuidedHandoffRequestRef.current = guidedHandoffRequest.requestId;
    if (isEmptyModelSchemaAuthoringDraft(draft)) {
      applyGuidedHandoffArtifact(guidedHandoffRequest.artifact, guidedHandoffRequest.requestId);
      return;
    }
    setPendingAction({
      type: "guidedHandoff",
      artifact: guidedHandoffRequest.artifact,
      currentDraftName: draft.name || "Untitled Advanced Author Schema draft",
      triggerId: "builder-experience-tab-advanced",
      focusAfterId: "schema-section-tab-identity"
    });
    setStatusMessage("Guided handoff staged. Confirm before replacing the current Advanced Author Schema draft.");
  }, [draft, guidedHandoffRequest]);

  useEffect(() => {
    if (validationPending || !view.structurallyValid || fitReportSnapshot) {
      return;
    }
    setFitReportSnapshot(createSchemaTemplateFitReportSnapshot(deferredDraft, true));
  }, [deferredDraft, fitReportSnapshot, validationPending, view.structurallyValid]);

  useEffect(() => {
    if (validationPending || !view.structurallyValid || fitReportUx.stale || scenarioPlanSnapshot) {
      return;
    }
    setScenarioPlanSnapshot(createSchemaScenarioPlanSnapshot(deferredDraft, true, fitReportUx));
  }, [deferredDraft, fitReportUx, scenarioPlanSnapshot, validationPending, view.structurallyValid]);

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

  function applyGuidedHandoffArtifact(artifact: ModelSchemaDefinition, requestId: number) {
    setDraft(artifact);
    setLastValidArtifact(artifact);
    setActiveSection("identity");
    setImportError(null);
    setExportError(null);
    setExportText("");
    setFitReportSnapshot(null);
    setScenarioPlanSnapshot(null);
    setStatusMessage("Guided structural draft opened in Advanced Author Schema. It remains local, unsaved, and not runnable.");
    onGuidedHandoffResolution?.(requestId, "applied");
    focusAfterRender("schema-section-tab-identity");
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

  function toggleValidationGroup(groupId: string) {
    setCollapsedValidationGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  function toggleFitCandidate(candidateId: string) {
    setCollapsedFitCandidates((current) => {
      const next = new Set(current);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  }

  function toggleScenarioPlanSection(sectionId: ScenarioPlanningSectionId) {
    setCollapsedScenarioPlanSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  function refreshFitReport() {
    if (validationPending) {
      setStatusMessage("Structural validation is updating. Refresh the fit report after the current draft is checked.");
      return;
    }
    if (!view.structurallyValid) {
      setStatusMessage("Fit report unavailable: the current schema must be structurally valid before ORTUS can compare it to runtime templates.");
      return;
    }
    setFitReportSnapshot(createSchemaTemplateFitReportSnapshot(deferredDraft, true));
    setStatusMessage("Schema-to-template fit report refreshed from the current structurally valid draft.");
  }

  function refreshScenarioPlan() {
    if (validationPending) {
      setStatusMessage("Structural validation is updating. Refresh the scenario plan after the current draft is checked.");
      return;
    }
    if (!view.structurallyValid) {
      setStatusMessage(schemaScenarioPlanningInvalidState);
      return;
    }
    if (fitReportUx.stale) {
      setStatusMessage(schemaScenarioPlanningStaleFitState);
      return;
    }
    setScenarioPlanSnapshot(createSchemaScenarioPlanSnapshot(deferredDraft, true, fitReportUx));
    setStatusMessage("Scenario planning report refreshed from the current structurally valid draft. No runtime artifact was generated.");
  }

  function requestRepairSuggestion(suggestion: SchemaRepairSuggestion, triggerId: string, focusAfterId: string) {
    if (validationPending) {
      setStatusMessage("Structural validation is updating. Repair suggestions are disabled until the current draft is checked.");
      focusAfterRender(triggerId);
      return;
    }
    if (!suggestion.canApply || !suggestion.patch || suggestion.riskLevel === "manualOnly") {
      setStatusMessage(suggestion.disabledReason ?? "This issue requires manual review. No draft changes were applied.");
      focusAfterRender(triggerId);
      return;
    }
    if (suggestion.requiresConfirmation) {
      setPendingAction({ type: "repair", suggestion, triggerId, focusAfterId });
      setStatusMessage("Structural repair staged. Confirm before changing the current draft.");
      return;
    }
    applyRepairSuggestionNow(suggestion, focusAfterId);
  }

  function applyRepairSuggestionNow(suggestion: SchemaRepairSuggestion, focusAfterId: string, confirmed = false) {
    const result = applySchemaRepairSuggestion(draft, suggestion, { confirmed });
    if (!result.applied) {
      setStatusMessage(result.message);
      focusAfterRender(focusAfterId);
      return;
    }
    setDraft(result.draft);
    setExportText("");
    setExportError(null);
    setStatusMessage(result.message);
    focusAfterRender(focusAfterId);
  }

  function jumpToValidationIssue(issue: SchemaValidationIssue) {
    const sectionTargetId = `schema-section-${issue.sectionId}`;
    const targetId = issue.fieldId ?? sectionTargetId;
    setActiveSection(issue.sectionId);
    focusAfterRender(targetId, () => {
      setStatusMessage(`Validation path ${issue.path} is not currently focusable. The ${issue.sectionId} section is open; use the issue path and original message.`);
      if (targetId !== sectionTargetId) {
        focusAfterRender(sectionTargetId);
      }
    });
  }

  async function copyValidationIssueDetails(issue: SchemaValidationIssue) {
    const details = formatSchemaValidationIssueDetails(issue);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(details);
        setStatusMessage("Validation issue details copied as text. The schema remains structural and not runnable.");
        return;
      } catch {
        setStatusMessage("Clipboard copy failed. Use the copyable issue details text in the issue card.");
        return;
      }
    }
    setStatusMessage("Clipboard copy is unavailable. Use the copyable issue details text in the issue card.");
  }

  async function copyFitReportDiagnostics() {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(fitReportUx.diagnostics);
        setStatusMessage("Schema-to-template fit diagnostics copied as text. No schema or runtime state was changed.");
        return;
      } catch {
        setStatusMessage("Clipboard copy failed. Use the copyable fit diagnostics text in the fit report.");
        return;
      }
    }
    setStatusMessage("Clipboard copy is unavailable. Use the copyable fit diagnostics text in the fit report.");
  }

  async function copyScenarioPlanningReport() {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(scenarioPlanUx.reportText);
        setStatusMessage("Scenario planning report copied as text. No schema, fit report, or runtime state was changed.");
        return;
      } catch {
        setStatusMessage("Clipboard copy failed. Use the copyable planning report text in the scenario planning panel.");
        return;
      }
    }
    setStatusMessage("Clipboard copy is unavailable. Use the copyable planning report text in the scenario planning panel.");
  }

  function jumpToFitConcept(concept: SchemaTemplateFitConcept) {
    const sectionTargetId = `schema-section-${concept.sectionId}`;
    setActiveSection(concept.sectionId);
    focusAfterRender(sectionTargetId, () => {
      setStatusMessage(`Fit report path ${concept.schemaPath} is not currently focusable. The ${concept.sectionId} section is open for manual inspection.`);
    });
  }

  function jumpToScenarioPlanningSection(sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) {
    const sectionTargetId = `schema-section-${sectionId}`;
    setActiveSection(sectionId);
    focusAfterRender(sectionTargetId, () => {
      setStatusMessage(`Scenario planning path ${schemaPath} is not currently focusable. The ${sectionId} section is open for manual inspection.`);
    });
  }

  function viewFitReportFromScenarioPlan() {
    focusAfterRender("schema-fit-report-title");
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
    } else if (action.type === "guidedHandoff") {
      applyGuidedHandoffArtifact(action.artifact, guidedHandoffRequest?.requestId ?? -1);
    } else if (action.type === "removeMetadata") {
      removeMetadataItem(action.metadataKey);
    } else if (action.type === "repair") {
      applyRepairSuggestionNow(action.suggestion, action.focusAfterId, true);
      return;
    } else {
      removeDraftItem(action);
    }
    focusAfterRender(action.focusAfterId);
  }

  function cancelPendingAction() {
    const focusId = pendingAction?.triggerId;
    if (pendingAction?.type === "guidedHandoff" && guidedHandoffRequest) {
      onGuidedHandoffResolution?.(guidedHandoffRequest.requestId, "canceled");
    }
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

      <aside className="schema-authoring-validation" aria-label="Schema validation, fit report, scenario planning, and limits">
        <CornerFramePanel title="Validation + Limits" eyebrow="Service Report" variant="compact">
          <SchemaValidationAssistance
            ux={validationUx}
            validationPending={validationPending}
            summary={view.summary}
            lastValidArtifact={lastValidArtifact}
            collapsedGroups={collapsedValidationGroups}
            onToggleGroup={toggleValidationGroup}
            onIssueJump={jumpToValidationIssue}
            onRepairSuggestion={requestRepairSuggestion}
            onCopyIssueDetails={copyValidationIssueDetails}
          />
        </CornerFramePanel>
        <CornerFramePanel title="Fit Report" eyebrow="Structural Template Review" variant="compact">
          <SchemaTemplateFitReportPanel
            ux={fitReportUx}
            collapsedCandidateIds={collapsedFitCandidates}
            onToggleCandidate={toggleFitCandidate}
            onRefresh={refreshFitReport}
            onCopyDiagnostics={copyFitReportDiagnostics}
            onJumpToSection={jumpToFitConcept}
          />
        </CornerFramePanel>
        <CornerFramePanel title="Scenario Planning" eyebrow="Planning Report" variant="compact">
          <SchemaScenarioPlanningPanel
            ux={scenarioPlanUx}
            collapsedSectionIds={collapsedScenarioPlanSections}
            onToggleSection={toggleScenarioPlanSection}
            onRefresh={refreshScenarioPlan}
            onCopyReport={copyScenarioPlanningReport}
            onJumpToSection={jumpToScenarioPlanningSection}
            onViewFitReport={viewFitReportFromScenarioPlan}
          />
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

function SchemaValidationAssistance({
  ux,
  validationPending,
  summary,
  lastValidArtifact,
  collapsedGroups,
  onToggleGroup,
  onIssueJump,
  onRepairSuggestion,
  onCopyIssueDetails
}: {
  ux: SchemaValidationUxModel;
  validationPending: boolean;
  summary: ModelSchemaSummary | null;
  lastValidArtifact: ModelSchemaDefinition | null;
  collapsedGroups: ReadonlySet<string>;
  onToggleGroup: (groupId: string) => void;
  onIssueJump: (issue: SchemaValidationIssue) => void;
  onRepairSuggestion: (suggestion: SchemaRepairSuggestion, triggerId: string, focusAfterId: string) => void;
  onCopyIssueDetails: (issue: SchemaValidationIssue) => Promise<void>;
}) {
  const statusText = validationPending
    ? "Structural validation updating."
    : `${ux.overview.structuralStatus}. ${ux.overview.errorCount} errors, ${ux.overview.warningCount} warnings, ${ux.overview.suggestionCount} repair suggestions, and ${ux.overview.manualOnlyCount} manual review items.`;

  return (
    <section className="schema-validation-report">
      <p className="schema-risk-note">A valid model schema is still not a runnable simulation.</p>
      <ul className="schema-validation-boundaries" aria-label="Validation repair boundaries">
        {ux.boundaryPhrases.map((phrase) => (
          <li key={phrase}>{phrase}</li>
        ))}
      </ul>
      <p className="schema-validation-status" role="status" aria-live="polite" aria-atomic="true">
        {statusText}
      </p>
      <dl className="builder-inspector__rows schema-validation-overview">
        <div>
          <dt>Structural status</dt>
          <dd>{ux.overview.structuralStatus}</dd>
        </div>
        <div>
          <dt>Runnable now</dt>
          <dd>{ux.overview.runnableStatus}</dd>
        </div>
        <div>
          <dt>Compiler / interpreter</dt>
          <dd>{ux.overview.compilerStatus}</dd>
        </div>
        <div>
          <dt>Error count</dt>
          <dd>{ux.overview.errorCount}</dd>
        </div>
        <div>
          <dt>Warning count</dt>
          <dd>{ux.overview.warningCount}</dd>
        </div>
        <div>
          <dt>Repair suggestions</dt>
          <dd>{ux.overview.suggestionCount}</dd>
        </div>
        <div>
          <dt>Manual review</dt>
          <dd>{ux.overview.manualOnlyCount}</dd>
        </div>
        <div>
          <dt>Unsupported capabilities</dt>
          <dd>{ux.overview.unsupportedCapabilityCount}</dd>
        </div>
      </dl>

      <section className="schema-validation-block" aria-labelledby="schema-support-boundary-title">
        <h3 id="schema-support-boundary-title">Support Boundary</h3>
        <ul className="builder-message-list">
          <li>{ux.overview.serviceOnlyNotice}</li>
          <li>{ux.overview.futureOnlyNotice}</li>
          <li>Unsupported, future-only, and service-only markers are disclosure markers, not repair targets.</li>
        </ul>
      </section>

      {ux.overview.errorCount > 0 ? (
        <section className="schema-validation-block" aria-labelledby="schema-error-summary-title">
          <h3 id="schema-error-summary-title">Error Summary</h3>
          <p className="builder-muted">Grouped issue cards below include paths, original validation messages, section jumps, and repair guidance.</p>
        </section>
      ) : (
        <p className="schema-validation-empty">{schemaValidationEmptyState}</p>
      )}

      <section className="schema-validation-block" aria-labelledby="schema-issue-groups-title">
        <h3 id="schema-issue-groups-title">Issue Groups</h3>
        <div className="schema-validation-groups">
          {ux.groups.map((group) => (
            <SchemaValidationIssueGroupPanel
              key={group.id}
              group={group}
              collapsed={collapsedGroups.has(group.id)}
              validationPending={validationPending}
              onToggleGroup={onToggleGroup}
              onIssueJump={onIssueJump}
              onRepairSuggestion={onRepairSuggestion}
              onCopyIssueDetails={onCopyIssueDetails}
            />
          ))}
        </div>
      </section>

      <section className="schema-validation-block" aria-labelledby="schema-missing-capabilities-title">
        <h3 id="schema-missing-capabilities-title">Missing Runtime Capabilities</h3>
        <p className="builder-muted">Capability gaps remain visible in the issue groups. They do not authorize runtime controls.</p>
      </section>

      <section className="schema-validation-block" aria-labelledby="schema-warning-summary-title">
        <h3 id="schema-warning-summary-title">Warnings</h3>
        <p className="builder-muted">Warnings are structural and epistemic boundaries. They are not scientific validation, calibration, or proof.</p>
      </section>

      {summary ? (
        <section className="schema-validation-block" aria-labelledby="schema-summary-title">
          <h3 id="schema-summary-title">Structural Summary</h3>
          <dl className="builder-inspector__rows">
            <div>
              <dt>Entities</dt>
              <dd>{summary.entityTypeCount}</dd>
            </div>
            <div>
              <dt>Components</dt>
              <dd>{summary.componentTypeCount}</dd>
            </div>
            <div>
              <dt>Attributes</dt>
              <dd>{summary.attributeTypeCount}</dd>
            </div>
            <div>
              <dt>Spaces</dt>
              <dd>{summary.spaceCount}</dd>
            </div>
            <div>
              <dt>Parameters</dt>
              <dd>{summary.parameterCount}</dd>
            </div>
            <div>
              <dt>Metrics</dt>
              <dd>{summary.metricCount}</dd>
            </div>
            <div>
              <dt>Rules</dt>
              <dd>{summary.ruleDeclarationCount}</dd>
            </div>
            <div>
              <dt>Artifact refs</dt>
              <dd>{summary.artifactReferenceCount}</dd>
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
  );
}

function SchemaValidationIssueGroupPanel({
  group,
  collapsed,
  validationPending,
  onToggleGroup,
  onIssueJump,
  onRepairSuggestion,
  onCopyIssueDetails
}: {
  group: SchemaValidationIssueGroup;
  collapsed: boolean;
  validationPending: boolean;
  onToggleGroup: (groupId: string) => void;
  onIssueJump: (issue: SchemaValidationIssue) => void;
  onRepairSuggestion: (suggestion: SchemaRepairSuggestion, triggerId: string, focusAfterId: string) => void;
  onCopyIssueDetails: (issue: SchemaValidationIssue) => Promise<void>;
}) {
  const bodyId = `schema-validation-group-body-${group.id}`;
  return (
    <section className="schema-validation-group" aria-labelledby={`schema-validation-group-title-${group.id}`}>
      <button
        id={`schema-validation-group-title-${group.id}`}
        type="button"
        className="schema-validation-group__button"
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        onClick={() => onToggleGroup(group.id)}
        suppressHydrationWarning
      >
        <span>{group.title}</span>
        <em>
          {group.count} items · highest severity {group.highestSeverity}
        </em>
      </button>
      {!collapsed ? (
        <div id={bodyId} className="schema-validation-issue-list">
          {group.issues.map((issue) => (
            <SchemaValidationIssueCard
              key={issue.id}
              issue={issue}
              validationPending={validationPending}
              onIssueJump={onIssueJump}
              onRepairSuggestion={onRepairSuggestion}
              onCopyIssueDetails={onCopyIssueDetails}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SchemaValidationIssueCard({
  issue,
  validationPending,
  onIssueJump,
  onRepairSuggestion,
  onCopyIssueDetails
}: {
  issue: SchemaValidationIssue;
  validationPending: boolean;
  onIssueJump: (issue: SchemaValidationIssue) => void;
  onRepairSuggestion: (suggestion: SchemaRepairSuggestion, triggerId: string, focusAfterId: string) => void;
  onCopyIssueDetails: (issue: SchemaValidationIssue) => Promise<void>;
}) {
  const suggestion = issue.suggestion;
  const repairButtonId = `schema-repair-action-${issue.id}`;
  const disabledReasonId = `schema-repair-disabled-${issue.id}`;
  const actionable = Boolean(suggestion?.canApply && suggestion.patch && suggestion.riskLevel !== "manualOnly");
  const disabledReason = validationPending
    ? "Structural validation is updating."
    : suggestion?.disabledReason;
  const focusAfterId = issue.fieldId ?? `schema-section-${issue.sectionId}`;
  const ruleRelated = issue.sectionId === "rules" || issue.path.includes("ruleDeclarations");

  return (
    <article className={`schema-validation-issue-card schema-validation-issue-card--${issue.severity}`}>
      <header>
        <div>
          <h4>{issue.title}</h4>
          <p>
            {issue.severity} · {issue.sectionId}
          </p>
        </div>
        <button type="button" onClick={() => onIssueJump(issue)} suppressHydrationWarning>
          {issue.fieldId ? "Jump to field" : "Jump to section"}
        </button>
      </header>
      <dl className="schema-validation-issue-card__facts">
        <div>
          <dt>Path</dt>
          <dd>{issue.path}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{issue.category}</dd>
        </div>
      </dl>
      <p>{issue.explanation}</p>
      <p>{issue.whyItMatters}</p>
      <div className="schema-validation-original-message">
        <span>Original validation message</span>
        <code>{issue.originalMessage}</code>
      </div>
      {suggestion ? (
        <div className="schema-validation-repair">
          <span>Suggestion</span>
          <p>{suggestion.summary}</p>
          <p>{suggestion.preview}</p>
          {actionable ? (
            <>
              <button
                id={repairButtonId}
                type="button"
                disabled={validationPending}
                aria-describedby={validationPending || disabledReason ? disabledReasonId : undefined}
                onClick={() => onRepairSuggestion(suggestion, repairButtonId, focusAfterId)}
                suppressHydrationWarning
              >
                {suggestion.actionLabel}
              </button>
              {validationPending || disabledReason ? (
                <p id={disabledReasonId} className="builder-muted">
                  {disabledReason}
                </p>
              ) : null}
            </>
          ) : (
            <p className="builder-muted">{issue.manualGuidance}</p>
          )}
          {ruleRelated ? <p className="schema-validation-rule-note">{schemaValidationRuleRepairBoundaryPhrase}</p> : null}
        </div>
      ) : (
        <>
          <p className="builder-muted">{issue.manualGuidance}</p>
          {ruleRelated ? <p className="schema-validation-rule-note">{schemaValidationRuleRepairBoundaryPhrase}</p> : null}
        </>
      )}
      <p className="schema-validation-boundary-note">{issue.boundaryNotice}</p>
      <details className="schema-validation-copyable">
        <summary>Copyable issue details</summary>
        <pre>{formatSchemaValidationIssueDetails(issue)}</pre>
      </details>
      <button type="button" onClick={() => void onCopyIssueDetails(issue)} suppressHydrationWarning>
        Copy issue details
      </button>
    </article>
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
  if (action.type === "guidedHandoff") {
    return "Replace the current Advanced Author Schema draft?";
  }
  if (action.type === "removeMetadata") {
    return `Remove metadata ${action.metadataKey}?`;
  }
  if (action.type === "repair") {
    return `${action.suggestion.label}?`;
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
  if (action.type === "guidedHandoff") {
    return `Current Advanced draft ${action.currentDraftName} will be replaced by guided structural draft ${action.artifact.name}. Cancel preserves both drafts. No World or runtime state will change.`;
  }
  if (action.type === "removeMetadata") {
    return "This removes the selected inert metadata entry from the draft. The action does not affect simulation state.";
  }
  if (action.type === "repair") {
    return `${action.suggestion.preview} The repair changes the current draft only, validates afterward, and does not make the schema runnable.`;
  }
  return "This removes the selected structural item from the draft. Cross-references may become invalid and will be reported by the model-schema service.";
}

function focusAfterRender(id: string, onMissing?: () => void): void {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      return;
    }
    onMissing?.();
  });
}

function isAssumptionNoteKey(
  key: RemovalRequest["key"]
): key is "assumptionNotes" | "limitationNotes" | "validationNotes" {
  return key === "assumptionNotes" || key === "limitationNotes" || key === "validationNotes";
}
