"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  phaseForGuidedRecipe,
  type GuidedInvestigationAuthority,
  type StarterWorldLaunch
} from "../../lib/starterWorlds";
import type { SimulationWorkspaceModeId } from "../../lib/workspaceModes";
import type { SavedRunSummary } from "../../simulation";
import { useSimulationStore } from "../../state/simulationStore";
import { getTemplateDescriptor } from "../../lib/templateVisuals";
import { useActiveWorldRuntime } from "../runtime/ProductionRuntimeProvider";

interface GuidedInvestigationPanelProps {
  authority: GuidedInvestigationAuthority;
  launch: StarterWorldLaunch;
  activeMode: SimulationWorkspaceModeId;
  onOpenTask: (mode: SimulationWorkspaceModeId) => void;
  onFocusPlayback: () => void;
  onExitGuide: () => void;
  onRestorePreparedRecipe: () => void;
}

export function GuidedInvestigationPanel({
  authority,
  launch,
  activeMode,
  onOpenTask,
  onFocusPlayback,
  onExitGuide,
  onRestorePreparedRecipe
}: GuidedInvestigationPanelProps) {
  const runtime = useActiveWorldRuntime();
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const seed = useSimulationStore((state) => state.seed);
  const activeParameters = useSimulationStore((state) => state.parameterValues);
  const interventionCount = runtime.appliedInterventionCount;
  const savedRuns = useSimulationStore((state) => state.savedRuns);
  const savedRunCount = savedRuns.length;
  const phase = phaseForGuidedRecipe(authority, launch.recipeId ?? "");
  const isBaseline = phase.recipeRole === "baseline";
  const recipe = isBaseline ? authority.baselineRecipe : authority.contrastRecipe;
  const pairedRecipe = isBaseline ? authority.contrastRecipe : authority.baselineRecipe;
  const pairedHref = isBaseline ? authority.contrastHref : authority.baselineHref;
  const preparedRunReference = isBaseline ? authority.baselineRunReference : authority.contrastRunReference;
  const [stepIndex, setStepIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [restoreConfirmationOpen, setRestoreConfirmationOpen] = useState(false);
  const guideRef = useRef<HTMLElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const divergenceHeadingRef = useRef<HTMLHeadingElement>(null);
  const restoreTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreConfirmRef = useRef<HTMLButtonElement>(null);
  const previousRecipeRef = useRef(recipe.id);
  const previousActiveRecipeMatchRef = useRef(true);
  const focusStepAfterChangeRef = useRef(false);
  const step = phase.steps[stepIndex] ?? phase.steps[0]!;
  const preparedRunDifferences = useMemo(
    () => describePreparedRunDifferences({
      authority,
      reference: preparedRunReference,
      activeTemplateId: selectedTemplateId,
      activeMetadata: runtime.metadata,
      activeSeed: seed,
      activeParameters,
      interventionCount
    }),
    [activeParameters, authority, interventionCount, preparedRunReference, runtime.metadata, seed, selectedTemplateId]
  );
  const activeRecipeMatches = preparedRunDifferences.length === 0;
  const metricRecord = runtime.metricsHistory.at(-1);
  const metricsAvailable = authority.focusOutputs.every((output) =>
    Number.isFinite(metricRecord?.values[output.metricId])
  );
  const openTask = step.actions.find((action) => action.type === "open-task");
  const taskVisible = !openTask || activeMode === openTask.task;
  const horizonReached = runtime.tick >= authority.suggestedRunHorizon;
  const checkState = {
    activeRecipeMatches,
    isPaused: !runtime.isRunning,
    tickIsZero: runtime.tick === 0,
    horizonReached,
    taskVisible,
    metricsAvailable,
    comparisonSummaryExists: savedRunCount > 0,
    pairedRecipeLoaded: launch.recipeId === recipe.id && activeRecipeMatches
  };
  const allChecksMet = step.technicalChecks.every((check) => checkIsMet(check, checkState));

  useEffect(() => {
    const previouslyMatched = previousActiveRecipeMatchRef.current;
    previousActiveRecipeMatchRef.current = activeRecipeMatches;
    if (!previouslyMatched || activeRecipeMatches) {
      if (activeRecipeMatches) setRestoreConfirmationOpen(false);
      return;
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (collapsed) {
          guideRef.current?.focus();
        } else {
          divergenceHeadingRef.current?.focus();
        }
      });
    });
  }, [activeRecipeMatches, collapsed]);

  useEffect(() => {
    if (previousRecipeRef.current === recipe.id) {
      return;
    }
    previousRecipeRef.current = recipe.id;
    setStepIndex(0);
    setCollapsed(false);
    setRestoreConfirmationOpen(false);
    previousActiveRecipeMatchRef.current = true;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => guideRef.current?.focus());
    });
  }, [recipe.id]);

  useEffect(() => {
    if (!focusStepAfterChangeRef.current || collapsed) {
      return;
    }
    focusStepAfterChangeRef.current = false;
    window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }, [collapsed, stepIndex]);

  function selectStep(nextIndex: number) {
    const bounded = Math.max(0, Math.min(phase.steps.length - 1, nextIndex));
    focusStepAfterChangeRef.current = true;
    setStepIndex(bounded);
  }

  function toggleCollapsed() {
    setRestoreConfirmationOpen(false);
    setCollapsed((current) => !current);
  }

  function requestPreparedRecipeRestore() {
    setRestoreConfirmationOpen(true);
    window.requestAnimationFrame(() => restoreConfirmRef.current?.focus());
  }

  function cancelPreparedRecipeRestore() {
    setRestoreConfirmationOpen(false);
    window.requestAnimationFrame(() => restoreTriggerRef.current?.focus());
  }

  function confirmPreparedRecipeRestore() {
    setRestoreConfirmationOpen(false);
    onRestorePreparedRecipe();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => guideRef.current?.focus());
    });
  }

  return (
    <section
      ref={guideRef}
      className="world-guide"
      aria-labelledby="world-guide-title"
      data-guided-investigation-panel={authority.guide.id}
      data-guide-phase={phase.recipeRole}
      data-guide-step={step.id}
      data-guide-collapsed={collapsed ? "true" : "false"}
      data-guide-runtime-state={activeRecipeMatches ? "prepared" : "modified"}
      tabIndex={-1}
    >
      <header className="world-guide__head">
        <div>
          <span>Guided investigation</span>
          <strong id="world-guide-title">{authority.guide.title}</strong>
          <small>
            {recipe.title}<br />
            <b>{activeRecipeMatches ? "Prepared run" : "Modified active run"} · Step {stepIndex + 1} of {phase.steps.length}</b>
          </small>
        </div>
        <div className="world-guide__head-actions">
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls="world-guide-content"
            onClick={toggleCollapsed}
          >
            {collapsed ? "Expand guide" : "Collapse guide"}
          </button>
          <button type="button" onClick={onExitGuide}>Exit guide</button>
        </div>
      </header>

      {!collapsed ? (
        <div id="world-guide-content" className="world-guide__content">
          <nav className="world-guide__links" aria-label="Reading a Flock references">
            <Link href={authority.landingHref}>Guide overview</Link>
            <Link href={authority.flagshipHref}>Flagship detail</Link>
          </nav>
          {!activeRecipeMatches ? (
            <section className="world-guide__divergence" aria-labelledby="world-guide-divergence-title">
              <h3 id="world-guide-divergence-title" ref={divergenceHeadingRef} tabIndex={-1}>
                Prepared-pair context changed
              </h3>
              <p>
                This active run no longer matches {recipe.title}. The controlled-pair claim no longer applies to this active run.
              </p>
              <dl>
                <div><dt>Active world</dt><dd>{getTemplateDescriptor(selectedTemplateId).template.name}</dd></div>
                <div><dt>Active {authority.controlledDifference.label}</dt><dd>{formatValue(activeParameters.noise as string | number | boolean | null)}</dd></div>
                <div><dt>Active seed</dt><dd>{seed}</dd></div>
                <div><dt>Changed context</dt><dd>{preparedRunDifferences.join(", ")}</dd></div>
              </dl>
              <p>Continue exploring this modified run without the controlled-pair claim, restore the prepared reference, or exit the guide.</p>
              {!restoreConfirmationOpen ? (
                <div className="world-guide__divergence-actions">
                  <button ref={restoreTriggerRef} type="button" onClick={requestPreparedRecipeRestore}>Restore prepared recipe</button>
                  <button type="button" onClick={onExitGuide}>Exit guide</button>
                </div>
              ) : (
                <div className="world-guide__restore-confirmation" role="group" aria-label="Confirm prepared recipe restore">
                  <p>
                    Restoring replaces the active run with a fresh paused tick-0 prepared run. Current tick and world state are discarded; Setup drafts and comparison summaries remain separate.
                  </p>
                  <button ref={restoreConfirmRef} type="button" onClick={confirmPreparedRecipeRestore}>Confirm restore prepared recipe</button>
                  <button type="button" onClick={cancelPreparedRecipeRestore}>Keep modified run</button>
                </div>
              )}
            </section>
          ) : null}
          <ol className="world-guide__steps" aria-label={`${phase.title} steps`}>
            {phase.steps.map((candidate, index) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  aria-current={index === stepIndex ? "step" : undefined}
                  onClick={() => selectStep(index)}
                >
                  <span>{index + 1}</span>
                  <strong>{candidate.title}</strong>
                </button>
              </li>
            ))}
          </ol>

          <div className="world-guide__step">
            <p>{phase.title}</p>
            <h3 ref={stepHeadingRef} tabIndex={-1}>{step.title}</h3>
            <span>{step.summary}</span>
            <StepContent
              authority={authority}
              isBaseline={isBaseline}
              stepIndex={stepIndex}
              recipeTitle={recipe.title}
              currentTick={runtime.tick}
              entityCount={runtime.entityCount}
              isRunning={runtime.isRunning}
              activeRecipeMatches={activeRecipeMatches}
              savedRuns={savedRuns}
              prompts={step.prompts ?? []}
            />
            <ul className="world-guide__checks" aria-label="Technical orientation">
              {step.technicalChecks.map((check) => (
                <li key={check} data-check-met={checkIsMet(check, checkState) ? "true" : "false"}>
                  {checkMessage(check, checkState, authority, activeMode)}
                </li>
              ))}
            </ul>
            {step.technicalChecks.includes("tick-reached-horizon") ? (
              <p className="world-guide__announced-status" role="status" aria-atomic="true">
                {horizonReached ? "Suggested horizon reached." : "The run has not reached the suggested horizon yet."}
              </p>
            ) : null}
            <div className="world-guide__commands">
              {step.actions.flatMap((action, index) => {
                if (action.type === "open-task") {
                  return [
                    <button key={`${action.type}-${action.task}-${index}`} type="button" onClick={() => onOpenTask(action.task)}>
                      Open {taskLabel(action.task)}
                    </button>
                  ];
                }
                if (action.type === "run-prepared-world") {
                  return [<button key={`${action.type}-${index}`} type="button" onClick={onFocusPlayback}>Focus playback controls</button>];
                }
                if (action.type === "launch-paired-recipe") {
                  return [<Link key={`${action.type}-${index}`} href={pairedHref}>Open {pairedRecipe.title}</Link>];
                }
                return [];
              })}
            </div>

            {!isBaseline && stepIndex === 0 ? (
              <p className="world-guide__direct-entry">
                This contrast phase does not assume that the baseline was run. <Link href={authority.baselineHref}>Reopen {authority.baselineRecipe.title}</Link>.
              </p>
            ) : null}

            {!isBaseline && stepIndex === 3 ? (
              <ContrastReview
                authority={authority}
                savedRuns={savedRuns}
                onOpenSetup={() => onOpenTask("setup")}
                onExitGuide={onExitGuide}
              />
            ) : null}
          </div>

          <div className="world-guide__navigation">
            <button
              type="button"
              aria-label={stepIndex > 0 ? `Previous step: ${phase.steps[stepIndex - 1]!.title}` : "Previous step"}
              onClick={() => selectStep(stepIndex - 1)}
              disabled={stepIndex === 0}
            >
              Previous step
            </button>
            {stepIndex < phase.steps.length - 1 ? (
              <button
                type="button"
                aria-label={`${allChecksMet ? "Next step" : "Continue without check"}: ${phase.steps[stepIndex + 1]!.title}`}
                onClick={() => selectStep(stepIndex + 1)}
              >
                {allChecksMet ? "Next step" : "Continue without check"}
              </button>
            ) : null}
          </div>
          <p className="world-guide__boundary">{authority.guide.modelBoundary}</p>
        </div>
      ) : null}
    </section>
  );
}

function StepContent({
  authority,
  isBaseline,
  stepIndex,
  recipeTitle,
  currentTick,
  entityCount,
  isRunning,
  activeRecipeMatches,
  savedRuns,
  prompts
}: {
  authority: GuidedInvestigationAuthority;
  isBaseline: boolean;
  stepIndex: number;
  recipeTitle: string;
  currentTick: number;
  entityCount: number;
  isRunning: boolean;
  activeRecipeMatches: boolean;
  savedRuns: readonly SavedRunSummary[];
  prompts: readonly string[];
}) {
  const difference = authority.controlledDifference;
  const currentValue = isBaseline ? difference.baselineValue : difference.contrastValue;
  const savedRunCount = savedRuns.length;
  if (stepIndex === 0) {
    return (
      <div className="world-guide__detail">
        <dl className="world-guide__facts">
          <div><dt>Prepared recipe</dt><dd>{recipeTitle}</dd></div>
          <div><dt>Prepared {difference.label}</dt><dd>{formatValue(currentValue)}</dd></div>
          {!isBaseline ? <div><dt>Paired baseline {difference.label}</dt><dd>{formatValue(difference.baselineValue)}</dd></div> : null}
          <div><dt>Prepared seed</dt><dd>{authority.sharedSeed}</dd></div>
          <div><dt>Entities now</dt><dd>{entityCount}</dd></div>
          <div><dt>Tick</dt><dd>{currentTick}</dd></div>
          <div><dt>Run state</dt><dd>{isRunning ? "Running" : "Paused"}</dd></div>
          <div><dt>Outputs</dt><dd>{authority.focusOutputs.map((output) => output.label).join(" and ")}</dd></div>
        </dl>
        <p>{authority.tickZeroSummary}</p>
        <p>
          {activeRecipeMatches
            ? `Only the audited ${difference.label} setting changes between this active prepared run and its paired prepared recipe.`
            : `In the prepared reference pair, only ${difference.label} changes. That statement does not describe this modified active run.`}
        </p>
        {!isBaseline ? <p>This is a fresh run, not a continuation of the baseline.</p> : null}
      </div>
    );
  }
  if (stepIndex === 1) {
    return (
      <div className="world-guide__detail">
        <dl className="world-guide__facts world-guide__facts--compact">
          <div><dt>Current tick</dt><dd>{currentTick}</dd></div>
          <div><dt>Prepared reference horizon</dt><dd>{authority.suggestedRunHorizon} ticks</dd></div>
        </dl>
        <p>Use Run, Pause, or Step in the existing playback dock. The guide does not run or pause the model for you.</p>
        {!isBaseline ? <p>Using the same horizon makes the two prepared run summaries easier to inspect. It does not turn the pair into a statistical experiment.</p> : null}
      </div>
    );
  }
  if (stepIndex === 2) {
    return (
      <div className="world-guide__detail">
        <dl className="world-guide__outputs">
          {authority.focusOutputs.map((output) => <div key={output.metricId}><dt>{output.label}</dt><dd>{output.description}</dd></div>)}
        </dl>
        <p>The two values do not have to change together.</p>
        <p>These bounded outputs do not exhaustively describe flock structure.</p>
        <PromptList prompts={prompts} />
      </div>
    );
  }
  return (
    <div className="world-guide__detail">
      <p>Capture remains an explicit action in the existing World Compare task. The guide does not save, name, or overwrite a summary.</p>
      <p>
        {savedRunCount > 0
          ? "A comparison summary is available in the existing local library. Availability alone does not identify a prepared baseline or establish a controlled pair."
          : "No comparison summary is available yet."}
      </p>
      <SummaryProvenance runs={savedRuns} />
    </div>
  );
}

function ContrastReview({
  authority,
  savedRuns,
  onOpenSetup,
  onExitGuide
}: {
  authority: GuidedInvestigationAuthority;
  savedRuns: readonly SavedRunSummary[];
  onOpenSetup: () => void;
  onExitGuide: () => void;
}) {
  return (
    <section className="world-guide__reflection" aria-labelledby="world-guide-reflection-title">
      <h4 id="world-guide-reflection-title">Questions for the next run</h4>
      {savedRuns.length === 0 ? (
        <p>
          No comparison summary is available in the existing comparison workspace. You can still inspect the current outputs, or reopen the baseline and capture it explicitly.
        </p>
      ) : (
        <p>Available summaries are not attributed to this guide. Inspect their provenance and selected runs before treating any one as the prepared baseline.</p>
      )}
      <PromptList prompts={authority.guide.reflectionPrompts} />
      <nav aria-label="Optional investigation next actions">
        <Link href={authority.baselineHref}>Reopen {authority.baselineRecipe.title}</Link>
        <button type="button" onClick={onOpenSetup}>Try another Noise value</button>
        <Link href={authority.flagshipHref}>Return to the flagship world</Link>
        <Link href={authority.collectionHref}>Explore the collection</Link>
        <button type="button" onClick={onExitGuide}>Exit the guide</button>
      </nav>
    </section>
  );
}

function SummaryProvenance({ runs }: { runs: readonly SavedRunSummary[] }) {
  if (runs.length === 0) return null;
  const visibleRuns = runs.slice(0, 3);
  return (
    <div className="world-guide__summary-provenance">
      <strong>Available summary provenance</strong>
      <ul>
        {visibleRuns.map((run) => (
          <li key={run.runId}>
            <b>{run.label}</b>
            <span>{run.templateName} · seed {run.seed} · {run.ticksRun} ticks</span>
          </li>
        ))}
      </ul>
      {runs.length > visibleRuns.length ? <small>Plus {runs.length - visibleRuns.length} more in Compare.</small> : null}
    </div>
  );
}

function PromptList({ prompts }: { prompts: readonly string[] }) {
  return prompts.length > 0 ? <ul className="world-guide__prompts">{prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul> : null;
}

type CheckState = {
  activeRecipeMatches: boolean;
  isPaused: boolean;
  tickIsZero: boolean;
  horizonReached: boolean;
  taskVisible: boolean;
  metricsAvailable: boolean;
  comparisonSummaryExists: boolean;
  pairedRecipeLoaded: boolean;
};

function checkIsMet(check: string, state: CheckState): boolean {
  switch (check) {
    case "correct-recipe-loaded": return state.activeRecipeMatches;
    case "run-is-paused": return state.isPaused;
    case "tick-is-zero": return state.tickIsZero;
    case "tick-reached-horizon": return state.horizonReached;
    case "task-is-visible": return state.taskVisible;
    case "metric-is-available": return state.metricsAvailable;
    case "comparison-summary-exists": return state.comparisonSummaryExists;
    case "paired-recipe-loaded": return state.pairedRecipeLoaded;
    default: return false;
  }
}

function checkMessage(
  check: string,
  state: CheckState,
  authority: GuidedInvestigationAuthority,
  activeMode: SimulationWorkspaceModeId
): string {
  switch (check) {
    case "correct-recipe-loaded":
      return state.activeRecipeMatches ? "The active run matches the prepared recipe." : "The active run differs from the prepared recipe reference.";
    case "run-is-paused":
      return state.isPaused ? "The run is paused." : "The run is currently running.";
    case "tick-is-zero":
      return state.tickIsZero ? "The active run is at tick zero." : "The active run has moved beyond tick zero.";
    case "tick-reached-horizon":
      return state.horizonReached ? "Suggested horizon reached." : "The run has not reached the suggested horizon yet.";
    case "task-is-visible":
      return state.taskVisible ? `${taskLabel(activeMode)} is visible.` : "The suggested World task is not currently visible.";
    case "metric-is-available":
      return state.metricsAvailable ? `${authority.focusOutputs.map((output) => output.label).join(" and ")} are available.` : "The focused outputs are not available in the current snapshot.";
    case "comparison-summary-exists":
      return state.comparisonSummaryExists ? "A comparison summary is available." : "No comparison summary is available yet.";
    case "paired-recipe-loaded":
      return state.pairedRecipeLoaded ? "The prepared contrast recipe is loaded." : "The active recipe does not match this guide phase.";
    default:
      return "Technical status unavailable.";
  }
}

function describePreparedRunDifferences({
  authority,
  reference,
  activeTemplateId,
  activeMetadata,
  activeSeed,
  activeParameters,
  interventionCount
}: {
  authority: GuidedInvestigationAuthority;
  reference: GuidedInvestigationAuthority["baselineRunReference"];
  activeTemplateId: string;
  activeMetadata: Readonly<Record<string, unknown>>;
  activeSeed: string;
  activeParameters: Readonly<Record<string, unknown>>;
  interventionCount: number;
}): string[] {
  const differences: string[] = [];
  if (activeTemplateId !== reference.templateId) differences.push("World template");
  if (
    activeMetadata.starterWorldId !== reference.starterWorldId ||
    activeMetadata.starterWorldRecipeId !== reference.recipeId
  ) {
    differences.push("Prepared recipe provenance");
  }
  const initializationProvenanceChanged =
    activeMetadata.initializationPreset !== reference.initializationPreset ||
    !sameDataValue(activeMetadata.initializationOptions, reference.initializationOptions) ||
    !sameDataValue(activeMetadata.agentComposition, reference.agentComposition) ||
    activeMetadata.behaviorMode !== reference.behaviorMode ||
    !sameDataValue(activeMetadata.environmentOptions, reference.environmentOptions);
  if (initializationProvenanceChanged) differences.push("Prepared initialization provenance");
  if (activeSeed !== reference.seed) differences.push("Seed");

  const parameterKeys = new Set([
    ...Object.keys(reference.parameters),
    ...Object.keys(activeParameters)
  ]);
  for (const key of [...parameterKeys].sort()) {
    if (!sameDataValue(activeParameters[key], reference.parameters[key])) {
      differences.push(parameterLabel(authority, key));
    }
  }
  if (interventionCount > 0) differences.push("Applied interventions");
  return [...new Set(differences)];
}

function parameterLabel(authority: GuidedInvestigationAuthority, key: string): string {
  const field = `parameters.${key}`;
  return authority.comparison.controlledDifferences.find((item) => item.field === field)?.label ??
    authority.comparison.sharedConditions.find((item) => item.field === field)?.label ??
    key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}

function sameDataValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => sameDataValue(value, right[index]));
  }
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") {
    return false;
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] && sameDataValue(leftRecord[key], rightRecord[key]));
}

function taskLabel(task: SimulationWorkspaceModeId): string {
  return task === "setup" ? "Setup" : task === "observe" ? "Observe" : task === "compare" ? "Compare" : task;
}

function formatValue(value: string | number | boolean | null | undefined): string {
  if (value === undefined) return "Unavailable";
  if (value === null) return "Not used";
  if (typeof value === "boolean") return value ? "On" : "Off";
  return String(value);
}
