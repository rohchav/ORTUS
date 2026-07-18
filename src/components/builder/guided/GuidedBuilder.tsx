"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import type { ModelSchemaDefinition } from "../../../simulation/modelSchema";
import { CornerFramePanel } from "../../ui/CornerFramePanel";
import { Disclosure } from "../../ui/Disclosure";
import {
  createGuidedBuilderDraft,
  createGuidedBuilderHandoff,
  createGuidedBuilderReview,
  createGuidedEntityDraft,
  createGuidedParameterDraft,
  createGuidedRuleDraft,
  createGuidedStateFieldDraft,
  getGuidedBuilderStepIssues,
  getNextGuidedBuilderStep,
  getPreviousGuidedBuilderStep,
  guidedBuilderLimits,
  guidedBuilderSteps,
  guidedEntityKinds,
  guidedParameterValueKinds,
  guidedRuleKinds,
  guidedSpaceKinds,
  guidedValueKinds,
  isGuidedBuilderDraftMeaningful,
  nextGuidedDraftKey,
  type GuidedBuilderDraft,
  type GuidedBuilderIssue,
  type GuidedBuilderStepId,
  type GuidedEntityDraft,
  type GuidedParameterDraft,
  type GuidedRuleDraft,
  type GuidedStateFieldDraft
} from "./guidedBuilderModel";

export interface GuidedBuilderHandoffResolution {
  requestId: number;
  status: "applied" | "canceled";
}

interface GuidedBuilderProps {
  handoffResolution: GuidedBuilderHandoffResolution | null;
  onMeaningfulChange: (meaningful: boolean) => void;
  onOpenAdvanced: () => void;
  onHandoffRequest: (artifact: ModelSchemaDefinition) => void;
}

type GuidedPendingAction =
  | { type: "startOver"; triggerId: string; focusAfterId: string }
  | { type: "removeEntity"; key: string; label: string; triggerId: string; focusAfterId: string }
  | { type: "removeState"; entityKey: string; key: string; label: string; triggerId: string; focusAfterId: string }
  | { type: "removeRule"; key: string; label: string; triggerId: string; focusAfterId: string }
  | { type: "removeParameter"; key: string; label: string; triggerId: string; focusAfterId: string };

const allGuidedStepIds = new Set<GuidedBuilderStepId>(guidedBuilderSteps.map((step) => step.id));

export function GuidedBuilder({ handoffResolution, onMeaningfulChange, onOpenAdvanced, onHandoffRequest }: GuidedBuilderProps) {
  const [draft, setDraft] = useState<GuidedBuilderDraft>(() => createGuidedBuilderDraft());
  const [activeStep, setActiveStep] = useState<GuidedBuilderStepId>("purpose");
  const [attemptedSteps, setAttemptedSteps] = useState<ReadonlySet<GuidedBuilderStepId>>(() => new Set());
  const [touchedFields, setTouchedFields] = useState<ReadonlySet<string>>(() => new Set());
  const [errorSummaryStep, setErrorSummaryStep] = useState<GuidedBuilderStepId | null>(null);
  const [pendingAction, setPendingAction] = useState<GuidedPendingAction | null>(null);
  const [statusMessage, setStatusMessage] = useState("Empty Guided Builder draft created in this page session.");
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const review = useMemo(() => createGuidedBuilderReview(draft), [draft]);
  const meaningful = useMemo(() => isGuidedBuilderDraftMeaningful(draft), [draft]);
  const currentStep = guidedBuilderSteps.find((step) => step.id === activeStep)!;
  const currentIndex = guidedBuilderSteps.findIndex((step) => step.id === activeStep);
  const currentErrors = getGuidedBuilderStepIssues(review.errors, activeStep, "error");

  useEffect(() => {
    onMeaningfulChange(meaningful);
  }, [meaningful, onMeaningfulChange]);

  useEffect(() => {
    if (!pendingAction) {
      return;
    }
    confirmButtonRef.current?.focus();
  }, [pendingAction]);

  useEffect(() => {
    if (!handoffResolution) {
      return;
    }
    setStatusMessage(
      handoffResolution.status === "applied"
        ? "The validated structural draft is open in Advanced Builder. No World or runtime state was changed."
        : "Advanced handoff canceled. The Guided Builder draft and current Advanced draft were both preserved."
    );
  }, [handoffResolution]);

  function updateDraft(update: (current: GuidedBuilderDraft) => GuidedBuilderDraft) {
    setDraft(update);
    setStatusMessage("Guided structural draft changed in local page-session state.");
  }

  function markTouched(fieldId: string) {
    setTouchedFields((current) => new Set(current).add(fieldId));
  }

  function showFieldIssue(issue: GuidedBuilderIssue | undefined): boolean {
    if (!issue) {
      return false;
    }
    return (
      activeStep === "review" ||
      touchedFields.has(issue.fieldId) ||
      attemptedSteps.has(issue.stepId) ||
      issue.message.includes("duplicates") ||
      issue.message.includes("was removed")
    );
  }

  function issueFor(fieldId: string): GuidedBuilderIssue | undefined {
    return review.errors.find((issue) => issue.fieldId === fieldId);
  }

  function moveToStep(stepId: GuidedBuilderStepId) {
    setActiveStep(stepId);
    setErrorSummaryStep(null);
    focusAfterRender(`guided-step-heading-${stepId}`);
  }

  function focusIssue(issue: GuidedBuilderIssue) {
    setActiveStep(issue.stepId);
    setErrorSummaryStep(issue.stepId);
    focusAfterRender(issue.fieldId);
  }

  function continueFromCurrentStep() {
    const errors = getGuidedBuilderStepIssues(review.errors, activeStep, "error");
    if (errors.length > 0) {
      setAttemptedSteps((current) => new Set(current).add(activeStep));
      setErrorSummaryStep(activeStep);
      setStatusMessage(`${errors.length} structural field ${errors.length === 1 ? "error requires" : "errors require"} attention in this step.`);
      focusAfterRender(`guided-error-summary-${activeStep}`);
      return;
    }
    moveToStep(getNextGuidedBuilderStep(activeStep));
  }

  function openReview() {
    setAttemptedSteps(new Set(allGuidedStepIds));
    moveToStep("review");
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeStep !== "review") {
      continueFromCurrentStep();
    }
  }

  function requestHandoff() {
    const handoff = createGuidedBuilderHandoff(draft);
    if (!handoff.artifact) {
      setAttemptedSteps(new Set(allGuidedStepIds));
      setActiveStep("review");
      setErrorSummaryStep("review");
      setStatusMessage("Handoff blocked because the current draft needs structural attention.");
      focusAfterRender("guided-review-error-summary");
      return;
    }
    setStatusMessage("Validated structural handoff requested. Workshop will not execute or install this draft.");
    onHandoffRequest(handoff.artifact);
  }

  function addEntity() {
    if (draft.entities.length >= guidedBuilderLimits.entities) {
      return;
    }
    const key = nextGuidedDraftKey(
      "entity",
      draft.entities.map((entity) => entity.key)
    );
    updateDraft((current) => ({ ...current, entities: [...current.entities, createGuidedEntityDraft(key)] }));
    focusAfterRender(`guided-entity-${key}-name`);
  }

  function updateEntity(key: string, update: (entity: GuidedEntityDraft) => GuidedEntityDraft) {
    updateDraft((current) => ({
      ...current,
      entities: current.entities.map((entity) => (entity.key === key ? update(entity) : entity))
    }));
  }

  function addStateField(entityKey: string) {
    const allStateKeys = draft.entities.flatMap((entity) => entity.stateFields.map((field) => field.key));
    const key = nextGuidedDraftKey("state", allStateKeys);
    updateEntity(entityKey, (entity) => ({
      ...entity,
      stateFields: [...entity.stateFields, createGuidedStateFieldDraft(key)]
    }));
    focusAfterRender(`guided-state-${key}-name`);
  }

  function updateStateField(entityKey: string, key: string, update: (field: GuidedStateFieldDraft) => GuidedStateFieldDraft) {
    updateEntity(entityKey, (entity) => ({
      ...entity,
      stateFields: entity.stateFields.map((field) => (field.key === key ? update(field) : field))
    }));
  }

  function addRule() {
    if (draft.rules.length >= guidedBuilderLimits.rules) {
      return;
    }
    const key = nextGuidedDraftKey(
      "rule",
      draft.rules.map((rule) => rule.key)
    );
    updateDraft((current) => ({ ...current, rules: [...current.rules, createGuidedRuleDraft(key)] }));
    focusAfterRender(`guided-rule-${key}-name`);
  }

  function updateRule(key: string, update: (rule: GuidedRuleDraft) => GuidedRuleDraft) {
    updateDraft((current) => ({
      ...current,
      rules: current.rules.map((rule) => (rule.key === key ? update(rule) : rule))
    }));
  }

  function addParameter() {
    if (draft.parameters.length >= guidedBuilderLimits.parameters) {
      return;
    }
    const key = nextGuidedDraftKey(
      "parameter",
      draft.parameters.map((parameter) => parameter.key)
    );
    updateDraft((current) => ({ ...current, parameters: [...current.parameters, createGuidedParameterDraft(key)] }));
    focusAfterRender(`guided-parameter-${key}-name`);
  }

  function updateParameter(key: string, update: (parameter: GuidedParameterDraft) => GuidedParameterDraft) {
    updateDraft((current) => ({
      ...current,
      parameters: current.parameters.map((parameter) => (parameter.key === key ? update(parameter) : parameter))
    }));
  }

  function confirmPendingAction() {
    const action = pendingAction;
    if (!action) {
      return;
    }
    setPendingAction(null);
    if (action.type === "startOver") {
      setDraft(createGuidedBuilderDraft());
      setActiveStep("purpose");
      setAttemptedSteps(new Set());
      setTouchedFields(new Set());
      setErrorSummaryStep(null);
      setStatusMessage("Guided Builder reset. Advanced Builder and World were not changed.");
      focusAfterRender("guided-step-heading-purpose");
      return;
    }
    if (action.type === "removeEntity") {
      updateDraft((current) => ({ ...current, entities: current.entities.filter((entity) => entity.key !== action.key) }));
    } else if (action.type === "removeState") {
      updateEntity(action.entityKey, (entity) => ({
        ...entity,
        stateFields: entity.stateFields.filter((field) => field.key !== action.key)
      }));
    } else if (action.type === "removeRule") {
      updateDraft((current) => ({ ...current, rules: current.rules.filter((rule) => rule.key !== action.key) }));
    } else {
      updateDraft((current) => ({ ...current, parameters: current.parameters.filter((parameter) => parameter.key !== action.key) }));
    }
    focusAfterRender(action.focusAfterId);
  }

  function cancelPendingAction() {
    const triggerId = pendingAction?.triggerId;
    setPendingAction(null);
    setStatusMessage("Destructive action canceled. The Guided Builder draft was preserved.");
    if (triggerId) {
      focusAfterRender(triggerId);
    }
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
    <section className="guided-builder" aria-label="Guided model-structure authoring">
      <header className="guided-builder__header">
        <div>
          <span>Guided Builder / model-structure draft</span>
          <h2>{draft.modelName || "Untitled structural draft"}</h2>
          <p>The draft exists only in this page session. Reloading resets it.</p>
        </div>
        <div className="guided-builder__header-actions">
          <span className="guided-builder__state" data-state={review.canHandoff ? "valid" : meaningful ? "attention" : "draft"}>
            {review.canHandoff ? "Structurally valid" : meaningful ? "Needs structural attention" : "Draft"}
          </span>
          <button type="button" onClick={onOpenAdvanced} suppressHydrationWarning>
            Open Advanced Builder
          </button>
          <button
            id="guided-start-over"
            type="button"
            disabled={!meaningful}
            onClick={() =>
              setPendingAction({
                type: "startOver",
                triggerId: "guided-start-over",
                focusAfterId: "guided-start-over"
              })
            }
            suppressHydrationWarning
          >
            Start over
          </button>
        </div>
      </header>

      <p className="guided-builder__status" role="status" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </p>

      <div className="guided-builder__layout">
        <aside className="guided-builder__steps" aria-label="Guided Builder steps">
          <CornerFramePanel title="Draft Steps" eyebrow={`Step ${currentIndex + 1} of ${guidedBuilderSteps.length}`} variant="compact">
            <nav aria-label="Guided structural authoring steps">
              <ol>
                {guidedBuilderSteps.map((step, index) => {
                  const stepErrors = getGuidedBuilderStepIssues(review.errors, step.id, "error").length;
                  const showStepErrors = attemptedSteps.has(step.id);
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        className={activeStep === step.id ? "is-current" : ""}
                        aria-current={activeStep === step.id ? "step" : undefined}
                        onClick={() => moveToStep(step.id)}
                        suppressHydrationWarning
                      >
                        <span>{index + 1}</span>
                        <strong>{step.label}</strong>
                        <em>{showStepErrors && stepErrors > 0 ? `${stepErrors} ${stepErrors === 1 ? "error" : "errors"}` : "Open"}</em>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </CornerFramePanel>
        </aside>

        <form className="guided-builder__form" aria-labelledby={`guided-step-heading-${activeStep}`} onSubmit={submitStep} noValidate>
          <CornerFramePanel title={currentStep.label} eyebrow={currentStep.technicalLabel} variant="standard">
            <div className="guided-builder__step" data-step={activeStep}>
              <header className="guided-builder__step-heading">
                <span>
                  Step {currentIndex + 1} of {guidedBuilderSteps.length}
                </span>
                <h3 id={`guided-step-heading-${activeStep}`} tabIndex={-1}>
                  {currentStep.label}
                </h3>
              </header>

              {errorSummaryStep === activeStep && currentErrors.length > 0 ? (
                <GuidedErrorSummary id={`guided-error-summary-${activeStep}`} issues={currentErrors} onIssueFocus={focusIssue} />
              ) : null}

              {activeStep === "purpose" ? (
                <PurposeStep
                  draft={draft}
                  issueFor={issueFor}
                  showFieldIssue={showFieldIssue}
                  markTouched={markTouched}
                  onChange={updateDraft}
                />
              ) : null}
              {activeStep === "entities" ? (
                <EntitiesStep
                  draft={draft}
                  issueFor={issueFor}
                  showFieldIssue={showFieldIssue}
                  markTouched={markTouched}
                  onAddEntity={addEntity}
                  onUpdateEntity={updateEntity}
                  onAddStateField={addStateField}
                  onUpdateStateField={updateStateField}
                  onRequestAction={setPendingAction}
                />
              ) : null}
              {activeStep === "space" ? (
                <SpaceStep
                  draft={draft}
                  issueFor={issueFor}
                  showFieldIssue={showFieldIssue}
                  markTouched={markTouched}
                  onChange={updateDraft}
                />
              ) : null}
              {activeStep === "rules" ? (
                <RulesStep
                  draft={draft}
                  issueFor={issueFor}
                  showFieldIssue={showFieldIssue}
                  markTouched={markTouched}
                  onAddRule={addRule}
                  onUpdateRule={updateRule}
                  onRequestAction={setPendingAction}
                />
              ) : null}
              {activeStep === "startingConditions" ? (
                <StartingConditionsStep
                  draft={draft}
                  issueFor={issueFor}
                  showFieldIssue={showFieldIssue}
                  markTouched={markTouched}
                  onChange={updateDraft}
                  onAddParameter={addParameter}
                  onUpdateParameter={updateParameter}
                  onRequestAction={setPendingAction}
                />
              ) : null}
              {activeStep === "review" ? (
                <ReviewStep draft={draft} review={review} onIssueFocus={focusIssue} onHandoff={requestHandoff} />
              ) : null}

              <footer className="guided-builder__navigation" aria-label="Guided step controls">
                <button
                  type="button"
                  disabled={activeStep === "purpose"}
                  onClick={() => moveToStep(getPreviousGuidedBuilderStep(activeStep))}
                  suppressHydrationWarning
                >
                  Back
                </button>
                {activeStep !== "review" ? (
                  <button type="submit" suppressHydrationWarning>
                    Continue
                  </button>
                ) : null}
                {activeStep !== "review" ? (
                  <button type="button" onClick={openReview} suppressHydrationWarning>
                    Review
                  </button>
                ) : null}
              </footer>
            </div>
          </CornerFramePanel>
        </form>
      </div>
        <aside className="guided-builder__boundaries" aria-label="Guided Builder support boundary">
          <Disclosure expandLabel="Guided and Advanced support" collapseLabel="Hide Guided and Advanced support">
            <CornerFramePanel title="Bounded Support" eyebrow="Guided / Advanced" variant="compact">
              <p>Guided Builder supports a bounded subset of the structural artifact.</p>
              <p>Advanced Builder remains available for complete and exact editing.</p>
              <dl>
                <div>
                  <dt>Guided</dt>
                  <dd>Identity, entities, state attributes, one space, descriptive rules, parameters, assumptions, and limitations.</dd>
                </div>
                <div>
                  <dt>Advanced-only</dt>
                  <dd>Components, metrics, artifact references, exact metadata, scope references, fit reports, and scenario planning.</dd>
                </div>
                <div>
                  <dt>Unavailable</dt>
                  <dd>Compilation, execution, simulation preview, runtime-template creation, active World mutation, and scientific validation.</dd>
                </div>
              </dl>
              <p className="guided-builder__boundary-note">
                The Guided Builder creates a model-structure draft. It does not compile, simulate, run, preview, calibrate, validate against reality, or install the draft as a runtime template.
              </p>
            </CornerFramePanel>
          </Disclosure>
        </aside>

      {pendingAction ? (
        <div className="schema-confirmation-backdrop">
          <div
            className="schema-confirmation"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="guided-confirmation-title"
            aria-describedby="guided-confirmation-description"
            onKeyDown={handleConfirmationKeyDown}
          >
            <h2 id="guided-confirmation-title">{guidedConfirmationTitle(pendingAction)}</h2>
            <p id="guided-confirmation-description">{guidedConfirmationDescription(pendingAction)}</p>
            <div>
              <button ref={confirmButtonRef} type="button" onClick={confirmPendingAction} suppressHydrationWarning>
                {pendingAction.type === "startOver" ? "Start over" : "Remove"}
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

interface StepFieldProps {
  issueFor: (fieldId: string) => GuidedBuilderIssue | undefined;
  showFieldIssue: (issue: GuidedBuilderIssue | undefined) => boolean;
  markTouched: (fieldId: string) => void;
}

function PurposeStep({
  draft,
  issueFor,
  showFieldIssue,
  markTouched,
  onChange
}: StepFieldProps & {
  draft: GuidedBuilderDraft;
  onChange: (update: (current: GuidedBuilderDraft) => GuidedBuilderDraft) => void;
}) {
  return (
    <div className="guided-builder__step-content">
      <p>This description explains what the structural draft is intended to represent. It does not establish scientific validity or real-world accuracy.</p>
      <p className="guided-builder__example">Example: explore how local exchange rules can change a stylized resource distribution.</p>
      <fieldset>
        <legend>Structural identity</legend>
        <GuidedTextField
          id="guided-model-name"
          label="Model name"
          description="Maps to ModelSchemaDefinition.name; a deterministic structural id is derived from this name."
          value={draft.modelName}
          placeholder="For example, Neighborhood resource exchange"
          maxLength={180}
          issue={issueFor("guided-model-name")}
          showIssue={showFieldIssue(issueFor("guided-model-name"))}
          onBlur={markTouched}
          onChange={(value) => onChange((current) => ({ ...current, modelName: value }))}
        />
        <GuidedTextField
          id="guided-model-description"
          label="Short description"
          description="Maps directly to ModelSchemaDefinition.description. It is not parsed into behavior."
          value={draft.modelDescription}
          placeholder="What system does this draft represent, and what question is it meant to explore?"
          maxLength={2_000}
          rows={4}
          issue={issueFor("guided-model-description")}
          showIssue={showFieldIssue(issueFor("guided-model-description"))}
          onBlur={markTouched}
          onChange={(value) => onChange((current) => ({ ...current, modelDescription: value }))}
        />
        <GuidedTextField
          id="guided-model-limitation"
          label="Explicit limitation"
          description="Maps to one limitationNotes item. Describe what the model omits or must not be inferred from it."
          value={draft.limitation}
          placeholder="What does this simplified structure omit or make unsafe to infer?"
          maxLength={900}
          rows={3}
          required={false}
          issue={issueFor("guided-model-limitation")}
          showIssue={showFieldIssue(issueFor("guided-model-limitation"))}
          onBlur={markTouched}
          onChange={(value) => onChange((current) => ({ ...current, limitation: value }))}
        />
      </fieldset>
      <p className="guided-builder__boundary-note">Free text remains descriptive. Workshop does not infer hidden rules, people, traits, protected classes, or persuasion targets from it.</p>
    </div>
  );
}

function EntitiesStep({
  draft,
  issueFor,
  showFieldIssue,
  markTouched,
  onAddEntity,
  onUpdateEntity,
  onAddStateField,
  onUpdateStateField,
  onRequestAction
}: StepFieldProps & {
  draft: GuidedBuilderDraft;
  onAddEntity: () => void;
  onUpdateEntity: (key: string, update: (entity: GuidedEntityDraft) => GuidedEntityDraft) => void;
  onAddStateField: (entityKey: string) => void;
  onUpdateStateField: (entityKey: string, key: string, update: (field: GuidedStateFieldDraft) => GuidedStateFieldDraft) => void;
  onRequestAction: (action: GuidedPendingAction) => void;
}) {
  return (
    <div className="guided-builder__step-content" id="guided-entity-list">
      <p>Entity types and state fields become bounded EntityTypeDeclaration and AttributeTypeDeclaration records. They do not create runtime agents.</p>
      {draft.entities.map((entity, entityIndex) => (
        <fieldset key={entity.key} className="guided-builder__repeated-group">
          <legend>Entity type {entityIndex + 1}</legend>
          <div className="guided-builder__group-actions">
            <span>Deterministic id preview: derived from the entity name</span>
            <button
              id={`guided-remove-entity-${entity.key}`}
              type="button"
              disabled={draft.entities.length === 1}
              onClick={() =>
                onRequestAction({
                  type: "removeEntity",
                  key: entity.key,
                  label: entity.name || `entity type ${entityIndex + 1}`,
                  triggerId: `guided-remove-entity-${entity.key}`,
                  focusAfterId: "guided-add-entity"
                })
              }
              suppressHydrationWarning
            >
              Remove entity
            </button>
          </div>
          <div className="guided-builder__field-grid">
            <GuidedTextField
              id={`guided-entity-${entity.key}-name`}
              label="Entity name"
              description="Maps to EntityTypeDeclaration.label and contributes to its deterministic id."
              value={entity.name}
              maxLength={180}
              issue={issueFor(`guided-entity-${entity.key}-name`)}
              showIssue={showFieldIssue(issueFor(`guided-entity-${entity.key}-name`))}
              onBlur={markTouched}
              onChange={(value) => onUpdateEntity(entity.key, (current) => ({ ...current, name: value }))}
            />
            <GuidedSelectField
              id={`guided-entity-${entity.key}-kind`}
              label="Entity kind"
              description="Maps to EntityTypeDeclaration.entityKind. This classification is structural only."
              value={entity.entityKind}
              options={guidedEntityKinds}
              onChange={(value) => onUpdateEntity(entity.key, (current) => ({ ...current, entityKind: value as GuidedEntityDraft["entityKind"] }))}
            />
          </div>
          <GuidedTextField
            id={`guided-entity-${entity.key}-description`}
            label="Entity description"
            description="Optional structural description. It is not a biography, profile, or behavioral inference."
            value={entity.description}
            maxLength={2_000}
            rows={2}
            required={false}
            issue={issueFor(`guided-entity-${entity.key}-description`)}
            showIssue={showFieldIssue(issueFor(`guided-entity-${entity.key}-description`))}
            onBlur={markTouched}
            onChange={(value) => onUpdateEntity(entity.key, (current) => ({ ...current, description: value }))}
          />
          <fieldset className="guided-builder__nested-group">
            <legend>State fields for {entity.name || `entity ${entityIndex + 1}`}</legend>
            {entity.stateFields.length === 0 ? <p className="builder-muted">No state attributes declared for this entity.</p> : null}
            {entity.stateFields.map((field, fieldIndex) => (
              <div key={field.key} className="guided-builder__state-row">
                <GuidedTextField
                  id={`guided-state-${field.key}-name`}
                  label={`State field ${fieldIndex + 1} name`}
                  description="Maps to AttributeTypeDeclaration.label."
                  value={field.name}
                  maxLength={180}
                  issue={issueFor(`guided-state-${field.key}-name`)}
                  showIssue={showFieldIssue(issueFor(`guided-state-${field.key}-name`))}
                  onBlur={markTouched}
                  onChange={(value) => onUpdateStateField(entity.key, field.key, (current) => ({ ...current, name: value }))}
                />
                <GuidedSelectField
                  id={`guided-state-${field.key}-kind`}
                  label="Value type"
                  description="Maps to AttributeTypeDeclaration.valueKind."
                  value={field.valueKind}
                  options={guidedValueKinds}
                  onChange={(value) =>
                    onUpdateStateField(entity.key, field.key, (current) => ({
                      ...current,
                      valueKind: value as GuidedStateFieldDraft["valueKind"]
                    }))
                  }
                />
                <GuidedTextField
                  id={`guided-state-${field.key}-default`}
                  label="Default description"
                  description="Maps to defaultValueDescription. It remains structural and does not initialize runtime state."
                  value={field.defaultValueDescription}
                  maxLength={800}
                  required={false}
                  issue={issueFor(`guided-state-${field.key}-default`)}
                  showIssue={showFieldIssue(issueFor(`guided-state-${field.key}-default`))}
                  onBlur={markTouched}
                  onChange={(value) =>
                    onUpdateStateField(entity.key, field.key, (current) => ({ ...current, defaultValueDescription: value }))
                  }
                />
                <button
                  id={`guided-remove-state-${field.key}`}
                  type="button"
                  onClick={() =>
                    onRequestAction({
                      type: "removeState",
                      entityKey: entity.key,
                      key: field.key,
                      label: field.name || `state field ${fieldIndex + 1}`,
                      triggerId: `guided-remove-state-${field.key}`,
                      focusAfterId: `guided-add-state-${entity.key}`
                    })
                  }
                  suppressHydrationWarning
                >
                  Remove state field
                </button>
              </div>
            ))}
            <button
              id={`guided-add-state-${entity.key}`}
              type="button"
              disabled={entity.stateFields.length >= guidedBuilderLimits.stateFieldsPerEntity}
              onClick={() => onAddStateField(entity.key)}
              suppressHydrationWarning
            >
              Add state field
            </button>
          </fieldset>
        </fieldset>
      ))}
      <button
        id="guided-add-entity"
        type="button"
        disabled={draft.entities.length >= guidedBuilderLimits.entities}
        onClick={onAddEntity}
        suppressHydrationWarning
      >
        Add entity type
      </button>
      <p className="guided-builder__boundary-note">State values are bounded symbolic or numeric declarations. No arbitrary code, formulas, biographies, embeddings, or real-person profiles are supported.</p>
    </div>
  );
}

function SpaceStep({
  draft,
  issueFor,
  showFieldIssue,
  markTouched,
  onChange
}: StepFieldProps & {
  draft: GuidedBuilderDraft;
  onChange: (update: (current: GuidedBuilderDraft) => GuidedBuilderDraft) => void;
}) {
  return (
    <div className="guided-builder__step-content">
      <p>This describes the model's intended structure. Runtime support depends on implemented templates and engines.</p>
      <fieldset>
        <legend>Structural space</legend>
        <GuidedSelectField
          id="guided-space-kind"
          label="Space kind"
          description="Maps to zero or one SpaceDeclaration. No explicit space is a valid structural choice."
          value={draft.space.kind}
          options={guidedSpaceKinds}
          onChange={(value) =>
            onChange((current) => ({
              ...current,
              space: { ...current.space, kind: value as GuidedBuilderDraft["space"]["kind"] }
            }))
          }
        />
        {draft.space.kind !== "none" ? (
          <>
            <GuidedTextField
              id="guided-space-name"
              label="Space name"
              description="Maps to SpaceDeclaration.label and contributes to its deterministic id. Every guided entity references this one space."
              value={draft.space.name}
              maxLength={180}
              issue={issueFor("guided-space-name")}
              showIssue={showFieldIssue(issueFor("guided-space-name"))}
              onBlur={markTouched}
              onChange={(value) =>
                onChange((current) => ({ ...current, space: { ...current.space, name: value } }))
              }
            />
            <GuidedTextField
              id="guided-space-coordinates"
              label="Coordinate description"
              description="Optional SpaceDeclaration.coordinateDescription text. Workshop does not turn it into geometry."
              value={draft.space.coordinateDescription}
              maxLength={800}
              rows={3}
              required={false}
              issue={issueFor("guided-space-coordinates")}
              showIssue={showFieldIssue(issueFor("guided-space-coordinates"))}
              onBlur={markTouched}
              onChange={(value) =>
                onChange((current) => ({ ...current, space: { ...current.space, coordinateDescription: value } }))
              }
            />
          </>
        ) : null}
      </fieldset>
      {draft.space.kind === "network" ? (
        <p className="guided-builder__warning" role="status">
          Network space is a structural declaration only. It does not add a network definition, network runtime behavior, causal edges, or template support.
        </p>
      ) : null}
      <p className="guided-builder__boundary-note">Boundary models, fields, multiscale declarations, resources, and exact scope references are Advanced-only. Their structural presence would still not earn runtime support.</p>
    </div>
  );
}

function RulesStep({
  draft,
  issueFor,
  showFieldIssue,
  markTouched,
  onAddRule,
  onUpdateRule,
  onRequestAction
}: StepFieldProps & {
  draft: GuidedBuilderDraft;
  onAddRule: () => void;
  onUpdateRule: (key: string, update: (rule: GuidedRuleDraft) => GuidedRuleDraft) => void;
  onRequestAction: (action: GuidedPendingAction) => void;
}) {
  return (
    <div className="guided-builder__step-content" id="guided-rule-list">
      <p>Rules authored here describe intended model structure. They are not executed by Workshop.</p>
      <p className="guided-builder__example">Example: resource holders exchange with one neighboring holder under a named interaction rule.</p>
      {draft.rules.length === 0 ? <p className="builder-muted">No structural rule declarations yet.</p> : null}
      {draft.rules.map((rule, index) => (
        <fieldset key={rule.key} className="guided-builder__repeated-group">
          <legend>Rule declaration {index + 1}</legend>
          <div className="guided-builder__group-actions">
            <span>Non-executable structural metadata</span>
            <button
              id={`guided-remove-rule-${rule.key}`}
              type="button"
              onClick={() =>
                onRequestAction({
                  type: "removeRule",
                  key: rule.key,
                  label: rule.name || `rule ${index + 1}`,
                  triggerId: `guided-remove-rule-${rule.key}`,
                  focusAfterId: "guided-add-rule"
                })
              }
              suppressHydrationWarning
            >
              Remove rule
            </button>
          </div>
          <div className="guided-builder__field-grid">
            <GuidedTextField
              id={`guided-rule-${rule.key}-name`}
              label="Rule name"
              description="Maps to RuleDeclaration.label and contributes to its deterministic id."
              value={rule.name}
              maxLength={180}
              issue={issueFor(`guided-rule-${rule.key}-name`)}
              showIssue={showFieldIssue(issueFor(`guided-rule-${rule.key}-name`))}
              onBlur={markTouched}
              onChange={(value) => onUpdateRule(rule.key, (current) => ({ ...current, name: value }))}
            />
            <GuidedSelectField
              id={`guided-rule-${rule.key}-kind`}
              label="Rule kind"
              description="Maps to RuleDeclaration.ruleKind. The kind is not an execution dispatch."
              value={rule.ruleKind}
              options={guidedRuleKinds}
              onChange={(value) =>
                onUpdateRule(rule.key, (current) => ({ ...current, ruleKind: value as GuidedRuleDraft["ruleKind"] }))
              }
            />
          </div>
          <GuidedTextField
            id={`guided-rule-${rule.key}-description`}
            label="Rule description"
            description="Maps verbatim to ruleDescription. ORTUS does not parse, compile, or execute this text."
            value={rule.description}
            maxLength={2_000}
            rows={3}
            issue={issueFor(`guided-rule-${rule.key}-description`)}
            showIssue={showFieldIssue(issueFor(`guided-rule-${rule.key}-description`))}
            onBlur={markTouched}
            onChange={(value) => onUpdateRule(rule.key, (current) => ({ ...current, description: value }))}
          />
          <div className="guided-builder__field-grid">
            <EntityReferenceField
              id={`guided-rule-${rule.key}-source`}
              label="Source entity"
              description="Optional sourceEntityTypeIds reference."
              value={rule.sourceEntityKey}
              entities={draft.entities}
              issue={issueFor(`guided-rule-${rule.key}-source`)}
              showIssue={showFieldIssue(issueFor(`guided-rule-${rule.key}-source`))}
              onChange={(value) => onUpdateRule(rule.key, (current) => ({ ...current, sourceEntityKey: value }))}
            />
            <EntityReferenceField
              id={`guided-rule-${rule.key}-target`}
              label="Target entity"
              description="Optional targetEntityTypeIds reference."
              value={rule.targetEntityKey}
              entities={draft.entities}
              issue={issueFor(`guided-rule-${rule.key}-target`)}
              showIssue={showFieldIssue(issueFor(`guided-rule-${rule.key}-target`))}
              onChange={(value) => onUpdateRule(rule.key, (current) => ({ ...current, targetEntityKey: value }))}
            />
          </div>
        </fieldset>
      ))}
      <button id="guided-add-rule" type="button" disabled={draft.rules.length >= guidedBuilderLimits.rules} onClick={onAddRule} suppressHydrationWarning>
        Add structural rule
      </button>
      <p className="guided-builder__boundary-note">No formulas, scripts, code, executable expressions, generated behavior, update scheduler, or hidden rule inference exists in this flow.</p>
    </div>
  );
}

function StartingConditionsStep({
  draft,
  issueFor,
  showFieldIssue,
  markTouched,
  onChange,
  onAddParameter,
  onUpdateParameter,
  onRequestAction
}: StepFieldProps & {
  draft: GuidedBuilderDraft;
  onChange: (update: (current: GuidedBuilderDraft) => GuidedBuilderDraft) => void;
  onAddParameter: () => void;
  onUpdateParameter: (key: string, update: (parameter: GuidedParameterDraft) => GuidedParameterDraft) => void;
  onRequestAction: (action: GuidedPendingAction) => void;
}) {
  return (
    <div className="guided-builder__step-content">
      <p>Starting-condition structure is not an executable scenario. Parameter defaults and ranges remain descriptive declarations.</p>
      {draft.parameters.map((parameter, index) => (
        <fieldset key={parameter.key} className="guided-builder__repeated-group">
          <legend>Parameter declaration {index + 1}</legend>
          <div className="guided-builder__group-actions">
            <span>Structural parameter, not active configuration</span>
            <button
              id={`guided-remove-parameter-${parameter.key}`}
              type="button"
              onClick={() =>
                onRequestAction({
                  type: "removeParameter",
                  key: parameter.key,
                  label: parameter.name || `parameter ${index + 1}`,
                  triggerId: `guided-remove-parameter-${parameter.key}`,
                  focusAfterId: "guided-add-parameter"
                })
              }
              suppressHydrationWarning
            >
              Remove parameter
            </button>
          </div>
          <div className="guided-builder__field-grid">
            <GuidedTextField
              id={`guided-parameter-${parameter.key}-name`}
              label="Parameter name"
              description="Maps to ParameterDeclaration.label and contributes to its deterministic id."
              value={parameter.name}
              maxLength={180}
              issue={issueFor(`guided-parameter-${parameter.key}-name`)}
              showIssue={showFieldIssue(issueFor(`guided-parameter-${parameter.key}-name`))}
              onBlur={markTouched}
              onChange={(value) => onUpdateParameter(parameter.key, (current) => ({ ...current, name: value }))}
            />
            <GuidedSelectField
              id={`guided-parameter-${parameter.key}-kind`}
              label="Value type"
              description="Maps to ParameterDeclaration.valueKind. Seed values are intentionally excluded."
              value={parameter.valueKind}
              options={guidedParameterValueKinds}
              onChange={(value) =>
                onUpdateParameter(parameter.key, (current) => ({
                  ...current,
                  valueKind: value as GuidedParameterDraft["valueKind"]
                }))
              }
            />
          </div>
          <div className="guided-builder__field-grid">
            <GuidedTextField
              id={`guided-parameter-${parameter.key}-default`}
              label="Default description"
              description="Maps to defaultValueDescription; it does not set an active World value."
              value={parameter.defaultValueDescription}
              maxLength={800}
              required={false}
              issue={issueFor(`guided-parameter-${parameter.key}-default`)}
              showIssue={showFieldIssue(issueFor(`guided-parameter-${parameter.key}-default`))}
              onBlur={markTouched}
              onChange={(value) =>
                onUpdateParameter(parameter.key, (current) => ({ ...current, defaultValueDescription: value }))
              }
            />
            <GuidedTextField
              id={`guided-parameter-${parameter.key}-range`}
              label="Range description"
              description="Maps to rangeDescription. Workshop does not enforce it as a runtime parameter bound."
              value={parameter.rangeDescription}
              maxLength={800}
              required={false}
              issue={issueFor(`guided-parameter-${parameter.key}-range`)}
              showIssue={showFieldIssue(issueFor(`guided-parameter-${parameter.key}-range`))}
              onBlur={markTouched}
              onChange={(value) => onUpdateParameter(parameter.key, (current) => ({ ...current, rangeDescription: value }))}
            />
          </div>
        </fieldset>
      ))}
      <button
        id="guided-add-parameter"
        type="button"
        disabled={draft.parameters.length >= guidedBuilderLimits.parameters}
        onClick={onAddParameter}
        suppressHydrationWarning
      >
        Add parameter declaration
      </button>
      <fieldset>
        <legend>Starting-condition assumption</legend>
        <GuidedTextField
          id="guided-starting-assumption"
          label="Assumption"
          description="Maps to one assumptionNotes item. It identifies what the modeler assumes; it does not resolve or validate the assumption."
          value={draft.startingConditionAssumption}
          maxLength={900}
          rows={3}
          required={false}
          issue={issueFor("guided-starting-assumption")}
          showIssue={showFieldIssue(issueFor("guided-starting-assumption"))}
          onBlur={markTouched}
          onChange={(value) => onChange((current) => ({ ...current, startingConditionAssumption: value }))}
        />
      </fieldset>
      <p className="guided-builder__boundary-note">This step creates no scenario, RunConfig, seed, initial world, active template configuration, composition runtime, or simulation snapshot.</p>
    </div>
  );
}

function ReviewStep({
  draft,
  review,
  onIssueFocus,
  onHandoff
}: {
  draft: GuidedBuilderDraft;
  review: ReturnType<typeof createGuidedBuilderReview>;
  onIssueFocus: (issue: GuidedBuilderIssue) => void;
  onHandoff: () => void;
}) {
  const serviceErrors = review.serviceView.report.errors;
  return (
    <div className="guided-builder__step-content guided-builder__review">
      <p className="guided-builder__boundary-note">Structural validity does not mean runtime support or real-world validity.</p>
      <div className="guided-builder__review-status" role="status" aria-live="polite" aria-atomic="true">
        <strong>{review.canHandoff ? "Structurally valid" : "Needs structural attention"}</strong>
        <span>Advanced review recommended</span>
        <span>Runnable now: no</span>
      </div>

      {review.errors.length > 0 || serviceErrors.length > 0 ? (
        <section id="guided-review-error-summary" className="guided-builder__error-summary" role="alert" tabIndex={-1} aria-labelledby="guided-review-error-title">
          <h4 id="guided-review-error-title">Structural attention required</h4>
          {review.errors.length > 0 ? (
            <ul>
              {review.errors.map((issue) => (
                <li key={issue.id}>
                  <button type="button" onClick={() => onIssueFocus(issue)} suppressHydrationWarning>
                    {guidedBuilderSteps.find((step) => step.id === issue.stepId)?.label}: {issue.message}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {serviceErrors.length > 0 ? (
            <div>
              <strong>Existing model-schema validator</strong>
              <ul>
                {serviceErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="guided-builder__valid-note">The existing model-schema validator accepts this structural artifact. It remains non-runnable.</p>
      )}

      {review.warnings.length > 0 ? (
        <section className="guided-builder__warnings" aria-labelledby="guided-review-warning-title">
          <h4 id="guided-review-warning-title">Warnings and review notes</h4>
          <ul>
            {review.warnings.map((issue) => (
              <li key={issue.id}>{issue.message}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="guided-review-identity-title">
        <h4 id="guided-review-identity-title">Model identity</h4>
        <dl className="guided-builder__review-list">
          <div>
            <dt>Name</dt>
            <dd>{draft.modelName || "Not entered"}</dd>
          </div>
          <div>
            <dt>Description</dt>
            <dd>{draft.modelDescription || "Not entered"}</dd>
          </div>
          <div>
            <dt>Limitation</dt>
            <dd>{draft.limitation || "Not entered"}</dd>
          </div>
          <div>
            <dt>Structural id</dt>
            <dd>{review.candidate.id}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="guided-review-entities-title">
        <h4 id="guided-review-entities-title">Entities and state</h4>
        {draft.entities.map((entity) => (
          <article key={entity.key} className="guided-builder__review-item">
            <h5>{entity.name || "Unnamed entity"}</h5>
            <p>{entity.entityKind} · {entity.description || "No description"}</p>
            <ul>
              {entity.stateFields.length > 0 ? (
                entity.stateFields.map((field) => (
                  <li key={field.key}>
                    {field.name || "Unnamed state field"}: {field.valueKind}
                    {field.defaultValueDescription ? `, default description ${field.defaultValueDescription}` : ""}
                  </li>
                ))
              ) : (
                <li>No state fields declared.</li>
              )}
            </ul>
          </article>
        ))}
      </section>

      <section aria-labelledby="guided-review-space-title">
        <h4 id="guided-review-space-title">Environment and space</h4>
        <p>
          {draft.space.kind === "none"
            ? "No explicit space declared."
            : `${draft.space.name || "Unnamed space"}: ${draft.space.kind}. ${draft.space.coordinateDescription || "No coordinate description."}`}
        </p>
      </section>

      <section aria-labelledby="guided-review-rules-title">
        <h4 id="guided-review-rules-title">Declared rules and interactions</h4>
        <ul>
          {draft.rules.length > 0 ? (
            draft.rules.map((rule) => (
              <li key={rule.key}>
                <strong>{rule.name || "Unnamed rule"}</strong>: {rule.ruleKind}. {rule.description || "No description."}
              </li>
            ))
          ) : (
            <li>No structural rules declared.</li>
          )}
        </ul>
      </section>

      <section aria-labelledby="guided-review-starting-title">
        <h4 id="guided-review-starting-title">Starting-condition structure</h4>
        <ul>
          {draft.parameters.length > 0 ? (
            draft.parameters.map((parameter) => (
              <li key={parameter.key}>
                <strong>{parameter.name || "Unnamed parameter"}</strong>: {parameter.valueKind}; default description {parameter.defaultValueDescription || "not entered"}; range {parameter.rangeDescription || "not entered"}.
              </li>
            ))
          ) : (
            <li>No parameter declarations.</li>
          )}
        </ul>
        <p>Assumption: {draft.startingConditionAssumption || "Not entered"}</p>
      </section>

      <section aria-labelledby="guided-review-advanced-title">
        <h4 id="guided-review-advanced-title">Unsupported or Advanced-only concepts</h4>
        <p>Components, metrics, artifact and scope references, exact metadata, multiple spaces, boundary references, observability, update order, stochasticity semantics, and provenance require Advanced review or are unavailable.</p>
      </section>

      <details className="guided-builder__artifact-preview">
        <summary>Review exact structural artifact</summary>
        <pre>{JSON.stringify(review.candidate, null, 2)}</pre>
      </details>

      <div className="guided-builder__handoff">
        <button id="guided-open-draft-advanced" type="button" disabled={!review.canHandoff} onClick={onHandoff} suppressHydrationWarning>
          Open draft in Advanced Builder
        </button>
        {!review.canHandoff ? <p>Resolve structural errors before transferring this draft.</p> : null}
        <p>The explicit handoff replaces only the Advanced Author Schema draft after any required overwrite confirmation. It does not change World.</p>
      </div>
    </div>
  );
}

function GuidedTextField({
  id,
  label,
  description,
  value,
  maxLength,
  placeholder,
  rows,
  required = true,
  issue,
  showIssue,
  onBlur,
  onChange
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  maxLength: number;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  issue?: GuidedBuilderIssue;
  showIssue: boolean;
  onBlur: (fieldId: string) => void;
  onChange: (value: string) => void;
}) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = showIssue ? `${descriptionId} ${errorId}` : descriptionId;
  return (
    <label className="guided-builder__field" htmlFor={id}>
      <span>
        {label}
        {required ? <em>Required</em> : <em>Optional</em>}
      </span>
      <small id={descriptionId}>{description}</small>
      {rows ? (
        <textarea
          id={id}
          value={value}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={showIssue ? true : undefined}
          onBlur={() => onBlur(id)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={showIssue ? true : undefined}
          onBlur={() => onBlur(id)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {showIssue && issue ? (
        <strong id={errorId} className="guided-builder__field-error">
          {issue.message}
        </strong>
      ) : null}
    </label>
  );
}

function GuidedSelectField({
  id,
  label,
  description,
  value,
  options,
  onChange
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const descriptionId = `${id}-description`;
  return (
    <label className="guided-builder__field" htmlFor={id}>
      <span>{label}</span>
      <small id={descriptionId}>{description}</small>
      <select id={id} value={value} aria-describedby={descriptionId} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EntityReferenceField({
  id,
  label,
  description,
  value,
  entities,
  issue,
  showIssue,
  onChange
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  entities: readonly GuidedEntityDraft[];
  issue?: GuidedBuilderIssue;
  showIssue: boolean;
  onChange: (value: string) => void;
}) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const missing = Boolean(value && !entities.some((entity) => entity.key === value));
  return (
    <label className="guided-builder__field" htmlFor={id}>
      <span>{label}</span>
      <small id={descriptionId}>{description}</small>
      <select
        id={id}
        value={value}
        aria-describedby={showIssue ? `${descriptionId} ${errorId}` : descriptionId}
        aria-invalid={showIssue ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">No explicit reference</option>
        {missing ? <option value={value}>Removed entity reference ({value})</option> : null}
        {entities.map((entity, index) => (
          <option key={entity.key} value={entity.key}>
            {entity.name || `Unnamed entity ${index + 1}`}
          </option>
        ))}
      </select>
      {showIssue && issue ? (
        <strong id={errorId} className="guided-builder__field-error">
          {issue.message}
        </strong>
      ) : null}
    </label>
  );
}

function GuidedErrorSummary({
  id,
  issues,
  onIssueFocus
}: {
  id: string;
  issues: readonly GuidedBuilderIssue[];
  onIssueFocus: (issue: GuidedBuilderIssue) => void;
}) {
  return (
    <section id={id} className="guided-builder__error-summary" role="alert" tabIndex={-1} aria-labelledby={`${id}-title`}>
      <h4 id={`${id}-title`}>Check this step</h4>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            <button type="button" onClick={() => onIssueFocus(issue)} suppressHydrationWarning>
              {issue.message}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function guidedConfirmationTitle(action: GuidedPendingAction): string {
  if (action.type === "startOver") {
    return "Start over with an empty Guided Builder draft?";
  }
  return `Remove ${action.label}?`;
}

function guidedConfirmationDescription(action: GuidedPendingAction): ReactNode {
  if (action.type === "startOver") {
    return "This discards the local, unsaved Guided Builder draft and resets its step state. Advanced Builder and World remain unchanged.";
  }
  if (action.type === "removeEntity") {
    return "This removes the entity and its state-field declarations. Existing rule references are retained and will be reported as structural errors until you resolve them.";
  }
  return "This removes only the selected structural declaration from the local Guided Builder draft. Advanced Builder and World remain unchanged.";
}

function focusAfterRender(id: string): void {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.focus();
  });
}
