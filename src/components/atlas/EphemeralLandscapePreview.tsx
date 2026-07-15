"use client";

import { forwardRef, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  auditLandscapeProbePlanForEphemeralPreview,
  clearEphemeralLandscapePreviewResult,
  ephemeralLandscapePreviewCapabilities,
  executeEphemeralLandscapePreview,
  formatEphemeralPreviewNumber,
  getEphemeralLandscapePreviewCapability,
  getEphemeralLandscapePreviewMetric,
  getEphemeralLandscapePreviewParameter,
  isEphemeralLandscapePreviewResultStale,
  maxEphemeralPreviewWorkUnits,
  safeCreateEphemeralLandscapePreviewRequest,
  type EphemeralLandscapePreviewConfigurationInput,
  type EphemeralLandscapePreviewRequest,
  type EphemeralLandscapePreviewResult,
  type PreviewExecutionProgress,
  type PreviewParameterCapability,
  type PreviewSamplePoint,
  type PreviewValidationIssue
} from "../../simulation/atlasPreview";
import { CornerFramePanel } from "../ui/CornerFramePanel";
import { Disclosure } from "../ui/Disclosure";
import { StatusPill } from "../ui/StatusPill";

interface PreviewDraft {
  templateId: string;
  scenarioId: string;
  xParameterId: string;
  xMinimum: string;
  xMaximum: string;
  xPointCount: string;
  yEnabled: boolean;
  yParameterId: string;
  yMinimum: string;
  yMaximum: string;
  yPointCount: string;
  seeds: string;
  tickHorizon: string;
  metricId: string;
}

type PreviewUiStatus =
  | "idle"
  | "configured"
  | "invalid"
  | "running"
  | "cancelling"
  | "completed"
  | "completed_with_errors"
  | "cancelled"
  | "failed";

const capability = ephemeralLandscapePreviewCapabilities[0]!;
const probeMappingAudit = auditLandscapeProbePlanForEphemeralPreview();

const initialDraft: PreviewDraft = {
  templateId: capability.templateId,
  scenarioId: capability.scenario.id,
  xParameterId: "",
  xMinimum: "",
  xMaximum: "",
  xPointCount: "3",
  yEnabled: false,
  yParameterId: "",
  yMinimum: "",
  yMaximum: "",
  yPointCount: "3",
  seeds: "101",
  tickHorizon: "50",
  metricId: ""
};

export function EphemeralLandscapePreview() {
  const [draft, setDraft] = useState<PreviewDraft>(initialDraft);
  const [showValidation, setShowValidation] = useState(false);
  const [uiStatus, setUiStatus] = useState<PreviewUiStatus>("idle");
  const [progress, setProgress] = useState<PreviewExecutionProgress | null>(null);
  const [result, setResult] = useState<EphemeralLandscapePreviewResult | null>(null);
  const [pendingReplacement, setPendingReplacement] = useState<EphemeralLandscapePreviewRequest | null>(null);
  const [liveMessage, setLiveMessage] = useState("No preview has been run.");
  const cancellationRef = useRef({ cancelled: false });
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const cancelRunButtonRef = useRef<HTMLButtonElement>(null);
  const replaceButtonRef = useRef<HTMLButtonElement>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  const configuration = useMemo(() => draftToConfiguration(draft), [draft]);
  const validation = useMemo(() => safeCreateEphemeralLandscapePreviewRequest(configuration), [configuration]);
  const currentCapability = getEphemeralLandscapePreviewCapability(draft.templateId) ?? capability;
  const busy = uiStatus === "running" || uiStatus === "cancelling";
  const stale = result ? isEphemeralLandscapePreviewResultStale(result, validation.request) : false;
  const lifecycle = stale ? "stale" : !result && uiStatus === "idle" && validation.request ? "configured" : uiStatus;
  const workEstimate = estimateDraftWork(draft);

  useEffect(() => {
    if (showValidation && validation.issues.length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [showValidation, validation.issues]);

  useEffect(() => {
    if (pendingReplacement) {
      replaceButtonRef.current?.focus();
    }
  }, [pendingReplacement]);

  function updateDraft(patch: Partial<PreviewDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setShowValidation(false);
    if (!busy && !result) {
      setUiStatus("idle");
    }
  }

  function selectAxis(axis: "x" | "y", parameterId: string) {
    const parameter = getEphemeralLandscapePreviewParameter(currentCapability, parameterId);
    if (axis === "x") {
      updateDraft({
        xParameterId: parameterId,
        xMinimum: parameter ? String(parameter.suggestedMinimum) : "",
        xMaximum: parameter ? String(parameter.suggestedMaximum) : "",
        xPointCount: parameter ? String(parameter.suggestedPointCount) : "3"
      });
      return;
    }
    updateDraft({
      yParameterId: parameterId,
      yMinimum: parameter ? String(parameter.suggestedMinimum) : "",
      yMaximum: parameter ? String(parameter.suggestedMaximum) : "",
      yPointCount: parameter ? String(parameter.suggestedPointCount) : "3"
    });
  }

  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);
    if (!validation.request) {
      setUiStatus("invalid");
      setLiveMessage(`Preview configuration has ${validation.issues.length} error${validation.issues.length === 1 ? "" : "s"}.`);
      return;
    }
    if (result) {
      setPendingReplacement(validation.request);
      return;
    }
    void startPreview(validation.request);
  }

  async function startPreview(request: EphemeralLandscapePreviewRequest) {
    cancellationRef.current = { cancelled: false };
    setPendingReplacement(null);
    setShowValidation(false);
    setResult(null);
    setUiStatus("running");
    setProgress({
      completedRunCount: 0,
      totalRunCount: request.workEstimate.sampleRunCount,
      successfulRunCount: 0,
      failedRunCount: 0,
      status: "running"
    });
    setLiveMessage(`0 of ${request.workEstimate.sampleRunCount} sample runs complete.`);
    requestAnimationFrame(() => cancelRunButtonRef.current?.focus());

    try {
      const nextResult = await executeEphemeralLandscapePreview(request, {
        signal: cancellationRef.current,
        onProgress(nextProgress) {
          setProgress(nextProgress);
          if (nextProgress.status === "running") {
            setLiveMessage(`${nextProgress.completedRunCount} of ${nextProgress.totalRunCount} sample runs complete.`);
          }
        }
      });
      setResult(nextResult);
      setUiStatus(nextResult.status);
      setLiveMessage(completionMessage(nextResult));
    } catch (error) {
      setUiStatus("failed");
      setLiveMessage(`Preview executor failed before a result could be constructed: ${userMessage(error)}`);
    }
  }

  function requestCancellation() {
    cancellationRef.current.cancelled = true;
    setUiStatus("cancelling");
    setLiveMessage(
      `${progress?.completedRunCount ?? 0} of ${progress?.totalRunCount ?? 0} sample runs complete. Cancellation will take effect after the current sample.`
    );
  }

  function clearPreview() {
    setResult(clearEphemeralLandscapePreviewResult());
    setProgress(null);
    setUiStatus(validation.request ? "configured" : "idle");
    setLiveMessage("Ephemeral preview cleared. No World, Experiment Runner, probe-plan, or storage state changed.");
    requestAnimationFrame(() => runButtonRef.current?.focus());
  }

  function cancelReplacement() {
    setPendingReplacement(null);
    requestAnimationFrame(() => runButtonRef.current?.focus());
  }

  function confirmReplacement() {
    const request = pendingReplacement;
    if (!request) {
      return;
    }
    setPendingReplacement(null);
    void startPreview(request);
  }

  function handleReplacementKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelReplacement();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const first = replaceButtonRef.current;
    const last = keepButtonRef.current;
    if (!first || !last) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const issueFor = (path: string) => showValidation && validation.issues.some((issue) => issue.path === path || issue.path.startsWith(`${path}.`));

  return (
    <section
      className="ephemeral-preview"
      aria-labelledby="ephemeral-preview-title"
      data-ephemeral-landscape-preview
      data-preview-lifecycle={lifecycle}
    >
      <div className="ephemeral-preview__heading">
        <div>
          <span>GW9 bounded runtime slice</span>
          <h2 id="ephemeral-preview-title">Ephemeral Landscape Preview</h2>
        </div>
        <PreviewLifecycleStatus status={lifecycle} />
      </div>

      <div className="ephemeral-preview__boundary" aria-label="Ephemeral preview capability boundary">
        <p>
          This is a bounded, ephemeral sample of model behavior. It is not a complete behavioral landscape, detected regime map,
          saved discovery, validated result, or claim about the real world.
        </p>
        <p>
          Preview V1 samples one or two numeric parameters on a small explicit grid and observes one implemented numeric metric at
          the final configured tick.
        </p>
      </div>

      <div className="ephemeral-preview__layout">
        <CornerFramePanel
          title="Preview Configuration"
          eyebrow="Explicit local request"
          variant="standard"
          className="ephemeral-preview__configuration"
        >
          <form noValidate onSubmit={submitPreview} aria-describedby="ephemeral-preview-local-boundary">
            {showValidation && validation.issues.length > 0 ? (
              <PreviewErrorSummary ref={errorSummaryRef} issues={validation.issues} />
            ) : null}

            <div className="ephemeral-preview__field-grid ephemeral-preview__field-grid--identity">
              <label htmlFor="ephemeral-preview-template">
                Runtime template
                <select
                  id="ephemeral-preview-template"
                  value={draft.templateId}
                  disabled={busy}
                  aria-invalid={issueFor("templateId") || undefined}
                  onChange={(event) => updateDraft({ templateId: event.target.value })}
                >
                  {ephemeralLandscapePreviewCapabilities.map((item) => (
                    <option key={item.templateId} value={item.templateId}>
                      {item.templateName}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="ephemeral-preview-scenario">
                Implemented scenario
                <select
                  id="ephemeral-preview-scenario"
                  value={draft.scenarioId}
                  disabled={busy}
                  aria-invalid={issueFor("scenarioId") || undefined}
                  onChange={(event) => updateDraft({ scenarioId: event.target.value })}
                >
                  <option value={currentCapability.scenario.id}>{currentCapability.scenario.name}</option>
                </select>
              </label>
            </div>

            <AxisFieldset
              axis="x"
              legend="X axis"
              draft={draft}
              parameters={currentCapability.parameters}
              disabled={busy}
              issueFor={issueFor}
              onSelect={(parameterId) => selectAxis("x", parameterId)}
              onUpdate={updateDraft}
            />

            <fieldset className="ephemeral-preview__axis-fieldset" disabled={busy}>
              <legend>Optional Y axis</legend>
              <label className="ephemeral-preview__toggle" htmlFor="ephemeral-preview-y-enabled">
                <input
                  id="ephemeral-preview-y-enabled"
                  type="checkbox"
                  checked={draft.yEnabled}
                  onChange={(event) => updateDraft({ yEnabled: event.target.checked })}
                />
                Enable a second numeric axis
              </label>
              {draft.yEnabled ? (
                <AxisFields
                  axis="y"
                  draft={draft}
                  parameters={currentCapability.parameters}
                  disabled={busy}
                  issueFor={issueFor}
                  onSelect={(parameterId) => selectAxis("y", parameterId)}
                  onUpdate={updateDraft}
                />
              ) : null}
            </fieldset>

            <fieldset className="ephemeral-preview__seed-fieldset" disabled={busy}>
              <legend>Deterministic seeds</legend>
              <label htmlFor="ephemeral-preview-seeds">
                Explicit integer seeds
                <input
                  id="ephemeral-preview-seeds"
                  value={draft.seeds}
                  inputMode="numeric"
                  aria-invalid={issueFor("seeds") || undefined}
                  aria-describedby="ephemeral-preview-seed-help"
                  onChange={(event) => updateDraft({ seeds: event.target.value })}
                />
              </label>
              <p id="ephemeral-preview-seed-help">
                Enter one to three comma-separated integers. Seed variation shows how this model preview changes across the selected
                deterministic runs. It is not a confidence interval or estimate of real-world uncertainty.
              </p>
            </fieldset>

            <div className="ephemeral-preview__field-grid">
              <label htmlFor="ephemeral-preview-ticks">
                Final tick horizon
                <input
                  id="ephemeral-preview-ticks"
                  type="number"
                  min="1"
                  max="250"
                  step="1"
                  value={draft.tickHorizon}
                  disabled={busy}
                  aria-invalid={issueFor("tickHorizon") || undefined}
                  onChange={(event) => updateDraft({ tickHorizon: event.target.value })}
                />
              </label>
              <label htmlFor="ephemeral-preview-metric">
                Final-tick numeric metric
                <select
                  id="ephemeral-preview-metric"
                  value={draft.metricId}
                  disabled={busy}
                  aria-required="true"
                  aria-invalid={issueFor("metricId") || undefined}
                  aria-describedby="ephemeral-preview-metric-help"
                  onChange={(event) => updateDraft({ metricId: event.target.value })}
                >
                  <option value="">Select a metric</option>
                  {currentCapability.metrics.map((metric) => (
                    <option key={metric.id} value={metric.id}>
                      {metric.label}
                    </option>
                  ))}
                </select>
                <span id="ephemeral-preview-metric-help" className="ephemeral-preview__field-help">
                  Availability is limited to implemented numeric metrics declared by this preview capability.
                </span>
              </label>
            </div>

            <WorkEstimate estimate={workEstimate} request={validation.request} />

            <p id="ephemeral-preview-local-boundary" className="ephemeral-preview__local-boundary">
              Runs occur locally in isolated simulation instances. Results are temporary and disappear on reload.
            </p>

            <div className="ephemeral-preview__actions">
              <button ref={runButtonRef} type="submit" disabled={busy} className="ephemeral-preview__run-action">
                Run ephemeral preview
              </button>
              {busy ? (
                <button
                  ref={cancelRunButtonRef}
                  type="button"
                  disabled={uiStatus === "cancelling"}
                  onClick={requestCancellation}
                >
                  Cancel after current sample
                </button>
              ) : null}
            </div>
          </form>
        </CornerFramePanel>

        <aside className="ephemeral-preview__side" aria-label="Preview execution boundary and status">
          <CornerFramePanel title="Execution Status" eyebrow="Exact sample progress" variant="compact">
            <p className="ephemeral-preview__live-status" role="status" aria-live="polite" aria-atomic="true">
              {liveMessage}
            </p>
            {progress ? (
              <dl className="ephemeral-preview__progress-facts">
                <div>
                  <dt>Terminal runs</dt>
                  <dd>
                    {progress.completedRunCount} of {progress.totalRunCount}
                  </dd>
                </div>
                <div>
                  <dt>Successful</dt>
                  <dd>{progress.successfulRunCount}</dd>
                </div>
                <div>
                  <dt>Failed</dt>
                  <dd>{progress.failedRunCount}</dd>
                </div>
              </dl>
            ) : null}
          </CornerFramePanel>

          <CornerFramePanel title="Probe Plan Boundary" eyebrow="Separate planning artifact" variant="compact">
            <p>{probeMappingAudit.reason}</p>
            <p>No probe-plan fields are copied or silently ignored. Review and configure the separate supported preview form directly.</p>
          </CornerFramePanel>
        </aside>
      </div>

      {result ? <PreviewResult result={result} stale={stale} onClear={clearPreview} /> : null}

      {pendingReplacement ? (
        <div className="ephemeral-preview__dialog-backdrop">
          <div
            className="ephemeral-preview__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ephemeral-preview-replace-title"
            aria-describedby="ephemeral-preview-replace-description"
            onKeyDown={handleReplacementKeyDown}
          >
            <h2 id="ephemeral-preview-replace-title">Replace the current ephemeral preview?</h2>
            <p id="ephemeral-preview-replace-description">
              Starting this request discards only the current in-memory Atlas preview. It does not clear World, Experiment Runner,
              probe-plan, comparison, or storage state.
            </p>
            <div>
              <button ref={replaceButtonRef} type="button" onClick={confirmReplacement}>
                Replace and run
              </button>
              <button ref={keepButtonRef} type="button" onClick={cancelReplacement}>
                Keep current preview
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AxisFieldset(props: AxisFieldsProps & { legend: string }) {
  return (
    <fieldset className="ephemeral-preview__axis-fieldset" disabled={props.disabled}>
      <legend>{props.legend}</legend>
      <AxisFields {...props} />
    </fieldset>
  );
}

interface AxisFieldsProps {
  axis: "x" | "y";
  draft: PreviewDraft;
  parameters: readonly PreviewParameterCapability[];
  disabled: boolean;
  issueFor(path: string): boolean;
  onSelect(parameterId: string): void;
  onUpdate(patch: Partial<PreviewDraft>): void;
}

function AxisFields({ axis, draft, parameters, disabled, issueFor, onSelect, onUpdate }: AxisFieldsProps) {
  const prefix = axis === "x" ? "x" : "y";
  const title = axis.toUpperCase();
  const values =
    axis === "x"
      ? { parameterId: draft.xParameterId, minimum: draft.xMinimum, maximum: draft.xMaximum, pointCount: draft.xPointCount }
      : { parameterId: draft.yParameterId, minimum: draft.yMinimum, maximum: draft.yMaximum, pointCount: draft.yPointCount };
  const selected = parameters.find((parameter) => parameter.id === values.parameterId);

  return (
    <div className="ephemeral-preview__axis-fields">
      <label htmlFor={`ephemeral-preview-${prefix}-parameter`}>
        {title} parameter
        <select
          id={`ephemeral-preview-${prefix}-parameter`}
          value={values.parameterId}
          disabled={disabled}
          aria-required="true"
          aria-invalid={issueFor(`${prefix}Axis.parameterId`) || undefined}
          aria-describedby={`ephemeral-preview-${prefix}-parameter-help`}
          onChange={(event) => onSelect(event.target.value)}
        >
          <option value="">Select a numeric parameter</option>
          {parameters.map((parameter) => (
            <option key={parameter.id} value={parameter.id} disabled={axis === "y" && parameter.id === draft.xParameterId}>
              {parameter.label}
            </option>
          ))}
        </select>
      </label>
      <p id={`ephemeral-preview-${prefix}-parameter-help`} className="ephemeral-preview__field-help">
        {selected
          ? `${selected.description} Supported preview range: ${selected.minimum} to ${selected.maximum}.`
          : "No parameter is selected automatically."}
      </p>
      <div className="ephemeral-preview__field-grid ephemeral-preview__field-grid--axis">
        <label htmlFor={`ephemeral-preview-${prefix}-minimum`}>
          {title} minimum
          <input
            id={`ephemeral-preview-${prefix}-minimum`}
            type="number"
            value={values.minimum}
            min={selected?.minimum}
            max={selected?.maximum}
            step={selected?.step ?? "any"}
            disabled={disabled}
            aria-invalid={issueFor(`${prefix}Axis.minimum`) || issueFor(`${prefix}Axis`) || undefined}
            onChange={(event) => onUpdate(axis === "x" ? { xMinimum: event.target.value } : { yMinimum: event.target.value })}
          />
        </label>
        <label htmlFor={`ephemeral-preview-${prefix}-maximum`}>
          {title} maximum
          <input
            id={`ephemeral-preview-${prefix}-maximum`}
            type="number"
            value={values.maximum}
            min={selected?.minimum}
            max={selected?.maximum}
            step={selected?.step ?? "any"}
            disabled={disabled}
            aria-invalid={issueFor(`${prefix}Axis.maximum`) || issueFor(`${prefix}Axis`) || undefined}
            onChange={(event) => onUpdate(axis === "x" ? { xMaximum: event.target.value } : { yMaximum: event.target.value })}
          />
        </label>
        <label htmlFor={`ephemeral-preview-${prefix}-points`}>
          {title} points
          <input
            id={`ephemeral-preview-${prefix}-points`}
            type="number"
            value={values.pointCount}
            min="2"
            max="5"
            step="1"
            disabled={disabled}
            aria-invalid={issueFor(`${prefix}Axis.pointCount`) || issueFor(`${prefix}Axis`) || undefined}
            onChange={(event) => onUpdate(axis === "x" ? { xPointCount: event.target.value } : { yPointCount: event.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

function WorkEstimate({
  estimate,
  request
}: {
  estimate: ReturnType<typeof estimateDraftWork>;
  request: EphemeralLandscapePreviewRequest | null;
}) {
  const withinBudget = request !== null;
  return (
    <section className="ephemeral-preview__work" aria-labelledby="ephemeral-preview-work-title" data-budget-status={withinBudget ? "within" : estimate ? "check" : "incomplete"}>
      <div className="ephemeral-preview__work-heading">
        <h3 id="ephemeral-preview-work-title">Work Estimate</h3>
        <StatusPill
          label={withinBudget ? "Within preview budget" : estimate && estimate.workUnits > maxEphemeralPreviewWorkUnits ? "Outside preview budget" : "Check configuration"}
          tone={withinBudget ? "moss" : "neutral"}
          category="operational"
          state={withinBudget ? "ready" : "idle"}
          description="Software work bound for this local preview, not a scientific or scalability assessment."
          size="compact"
        />
      </div>
      <dl>
        <div>
          <dt>Sample points</dt>
          <dd>{request?.workEstimate.gridPointCount ?? estimate?.gridPointCount ?? "-"}</dd>
        </div>
        <div>
          <dt>Sample runs</dt>
          <dd>{request?.workEstimate.sampleRunCount ?? estimate?.sampleRunCount ?? "-"}</dd>
        </div>
        <div>
          <dt>Tick horizon</dt>
          <dd>{request?.workEstimate.tickHorizon ?? estimate?.tickHorizon ?? "-"}</dd>
        </div>
        <div>
          <dt>Work units</dt>
          <dd>
            {request?.workEstimate.workUnits ?? estimate?.workUnits ?? "-"} / {maxEphemeralPreviewWorkUnits}
          </dd>
        </div>
      </dl>
      <p>This limit keeps the preview local, bounded, and responsive. It is not a scalability estimate.</p>
    </section>
  );
}

const PreviewErrorSummary = forwardRef<HTMLDivElement, { issues: readonly PreviewValidationIssue[] }>(function PreviewErrorSummary(
  { issues },
  ref
) {
  return (
    <div
      ref={ref}
      id="ephemeral-preview-error-summary"
      className="ephemeral-preview__error-summary"
      role="alert"
      tabIndex={-1}
      aria-labelledby="ephemeral-preview-error-title"
    >
      <h3 id="ephemeral-preview-error-title">Preview configuration needs attention</h3>
      <ul>
        {issues.map((issue, index) => (
          <li key={`${issue.path}-${index}`}>
            <a href={`#${fieldIdForIssue(issue.path)}`}>{issue.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
});

function PreviewLifecycleStatus({ status }: { status: string }) {
  const model =
    status === "running"
      ? { label: "Running", category: "operational" as const, state: "running" as const }
      : status === "cancelling"
        ? { label: "Cancelling", category: "operational" as const, state: "paused" as const }
        : status === "completed"
          ? { label: "Completed", category: "operational" as const, state: "completed" as const }
          : status === "completed_with_errors"
            ? { label: "Completed with errors", category: "operational" as const, state: "failed" as const }
            : status === "cancelled"
              ? { label: "Cancelled", category: "operational" as const, state: "paused" as const }
              : status === "failed" || status === "invalid"
                ? { label: status === "failed" ? "Failed" : "Invalid", category: "operational" as const, state: "failed" as const }
                : status === "stale"
                  ? { label: "Stale preview", category: "evidence" as const, state: "stale" as const }
                  : status === "configured"
                    ? { label: "Configured", category: "operational" as const, state: "ready" as const }
                    : { label: "Unsampled", category: "evidence" as const, state: "unresolved" as const };
  return <StatusPill {...model} tone="neutral" description={`Ephemeral preview lifecycle state: ${model.label}.`} />;
}

function PreviewResult({ result, stale, onClear }: { result: EphemeralLandscapePreviewResult; stale: boolean; onClear(): void }) {
  const runtimeCapability = getEphemeralLandscapePreviewCapability(result.request.templateId)!;
  const metric = getEphemeralLandscapePreviewMetric(runtimeCapability, result.request.metricId)!;
  return (
    <section
      className={`ephemeral-preview-result ${stale ? "is-stale" : ""}`}
      aria-labelledby="ephemeral-preview-result-title"
      data-preview-result-status={stale ? "stale" : result.status}
    >
      <div className="ephemeral-preview-result__heading">
        <div>
          <span>Executed model outputs</span>
          <h2 id="ephemeral-preview-result-title">Sampled Preview</h2>
        </div>
        <PreviewLifecycleStatus status={stale ? "stale" : result.status} />
      </div>
      {stale ? (
        <p className="ephemeral-preview-result__stale" role="status">
          This preview is stale because the configuration changed after it ran. The result and provenance below still describe the original request.
        </p>
      ) : null}
      <p className="ephemeral-preview-result__sample-boundary">
        Only the displayed coordinates were sampled. No values between them were inferred.
      </p>
      <p>
        Metric: <strong>{metric.label}</strong> ({metric.id}) after final tick {result.request.tickHorizon}. Numeric cells are exact
        aggregates of successful displayed seed runs{metric.unit ? ` in ${metric.unit}` : ""}; failed or unstarted runs have no fabricated value.
      </p>
      <ul className="ephemeral-preview-result__warnings" aria-label="Preview interpretation warnings">
        {result.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>

      {result.request.yAxis ? (
        <TwoAxisResultTable result={result} metricPrecision={metric.precision} />
      ) : (
        <OneAxisResultTable result={result} metricPrecision={metric.precision} />
      )}

      <Disclosure
        expandLabel="Show per-seed sample runs"
        collapseLabel="Hide per-seed sample runs"
        contentId="ephemeral-preview-per-seed-runs"
        className="ephemeral-preview-result__disclosure"
      >
        <div className="ephemeral-preview-result__table-region" role="region" aria-label="Per-seed sample run results" tabIndex={0}>
          <table>
            <caption>Attempted sample runs in deterministic execution order</caption>
            <thead>
              <tr>
                <th scope="col">Run</th>
                <th scope="col">Coordinate</th>
                <th scope="col">Seed</th>
                <th scope="col">Final tick</th>
                <th scope="col">Metric value</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.runs.map((run) => (
                <tr key={run.runId} data-sample-run-status={run.status}>
                  <th scope="row">{run.runId}</th>
                  <td>{coordinateText(run.coordinate)}</td>
                  <td>{run.seed}</td>
                  <td>{run.finalTick ?? "Unavailable"}</td>
                  <td>{run.metricValue === null ? "No value" : formatEphemeralPreviewNumber(run.metricValue, metric.precision)}</td>
                  <td>{run.status === "success" ? "Sampled" : `Failed: ${run.error?.kind ?? "sample run"}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Disclosure>

      <PreviewProvenance result={result} />

      {result.errors.length > 0 ? (
        <Disclosure
          expandLabel="Show technical sample errors"
          collapseLabel="Hide technical sample errors"
          contentId="ephemeral-preview-errors"
          className="ephemeral-preview-result__disclosure"
        >
          <ul className="ephemeral-preview-result__errors">
            {result.errors.map((error, index) => (
              <li key={`${error.runId ?? "executor"}-${index}`}>
                <strong>{error.kind}</strong>
                {error.runId ? ` / ${error.runId}` : ""}: {error.message}
              </li>
            ))}
          </ul>
        </Disclosure>
      ) : null}

      <div className="ephemeral-preview-result__actions">
        <button type="button" onClick={onClear}>
          Clear preview
        </button>
      </div>
    </section>
  );
}

function OneAxisResultTable({ result, metricPrecision }: { result: EphemeralLandscapePreviewResult; metricPrecision: number }) {
  const capability = getEphemeralLandscapePreviewCapability(result.request.templateId)!;
  const parameter = getEphemeralLandscapePreviewParameter(capability, result.request.xAxis.parameterId)!;
  return (
    <div className="ephemeral-preview-result__table-region" role="region" aria-label="One-axis sampled preview values" tabIndex={0}>
      <table>
        <caption>Executed one-axis sample points</caption>
        <thead>
          <tr>
            <th scope="col">{parameter.label}</th>
            <th scope="col">Mean</th>
            <th scope="col">Minimum</th>
            <th scope="col">Maximum</th>
            <th scope="col">Successful seeds</th>
            <th scope="col">Failed runs</th>
            <th scope="col">Sample status</th>
          </tr>
        </thead>
        <tbody>
          {result.points.map((point) => (
            <tr key={point.pointId} data-sample-point-status={point.status}>
              <th scope="row">{formatEphemeralPreviewNumber(point.coordinate.x.value)}</th>
              <AggregateCells point={point} precision={metricPrecision} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AggregateCells({ point, precision }: { point: PreviewSamplePoint; precision: number }) {
  const aggregate = point.mean === null ? "No value" : formatEphemeralPreviewNumber(point.mean, precision);
  return (
    <>
      <td>{aggregate}</td>
      <td>{point.minimum === null ? "No value" : formatEphemeralPreviewNumber(point.minimum, precision)}</td>
      <td>{point.maximum === null ? "No value" : formatEphemeralPreviewNumber(point.maximum, precision)}</td>
      <td>
        {point.successfulRunCount} of {point.plannedSeedCount}
      </td>
      <td>{point.failedRunCount}</td>
      <td>{samplePointStatusLabel(point)}</td>
    </>
  );
}

function TwoAxisResultTable({ result, metricPrecision }: { result: EphemeralLandscapePreviewResult; metricPrecision: number }) {
  const capability = getEphemeralLandscapePreviewCapability(result.request.templateId)!;
  const xParameter = getEphemeralLandscapePreviewParameter(capability, result.request.xAxis.parameterId)!;
  const yParameter = getEphemeralLandscapePreviewParameter(capability, result.request.yAxis!.parameterId)!;
  const xValues = uniqueNumbers(result.points.map((point) => point.coordinate.x.value));
  const yValues = uniqueNumbers(result.points.flatMap((point) => (point.coordinate.y ? [point.coordinate.y.value] : [])));
  return (
    <div className="ephemeral-preview-result__matrix-region" role="region" aria-label="Two-axis sampled preview matrix" tabIndex={0}>
      <table>
        <caption>
          Executed sample matrix: {yParameter.label} by {xParameter.label}
        </caption>
        <thead>
          <tr>
            <th scope="col">
              {yParameter.label} / {xParameter.label}
            </th>
            {xValues.map((xValue) => (
              <th key={xValue} scope="col">
                {formatEphemeralPreviewNumber(xValue)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yValues.map((yValue) => (
            <tr key={yValue}>
              <th scope="row">{formatEphemeralPreviewNumber(yValue)}</th>
              {xValues.map((xValue) => {
                const point = result.points.find(
                  (candidate) => candidate.coordinate.x.value === xValue && candidate.coordinate.y?.value === yValue
                );
                return (
                  <td key={xValue} data-sample-point-status={point?.status ?? "unsampled"}>
                    {point ? (
                      <>
                        <strong>{point.mean === null ? "No value" : formatEphemeralPreviewNumber(point.mean, metricPrecision)}</strong>
                        <span>{samplePointStatusLabel(point)}</span>
                        <small>
                          {point.successfulRunCount} successful / {point.failedRunCount} failed
                        </small>
                      </>
                    ) : (
                      <span>Unsampled</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreviewProvenance({ result }: { result: EphemeralLandscapePreviewResult }) {
  const capability = getEphemeralLandscapePreviewCapability(result.request.templateId)!;
  const metric = getEphemeralLandscapePreviewMetric(capability, result.request.metricId)!;
  return (
    <Disclosure
      expandLabel="Show preview provenance"
      collapseLabel="Hide preview provenance"
      contentId="ephemeral-preview-provenance"
      className="ephemeral-preview-result__disclosure"
    >
      <section aria-labelledby="ephemeral-preview-provenance-title">
        <h3 id="ephemeral-preview-provenance-title">In-memory Preview Provenance</h3>
        <dl className="ephemeral-preview-result__provenance">
          <ProvenanceFact term="Template" value={`${capability.templateName} / ${capability.templateId}`} />
          <ProvenanceFact term="Template version" value={capability.templateVersion} />
          <ProvenanceFact term="Scenario" value={`${capability.scenario.name} / ${capability.scenario.id}`} />
          <ProvenanceFact term="Capability version" value={result.capabilityVersion} />
          <ProvenanceFact
            term="X axis"
            value={`${result.request.xAxis.parameterId}: ${result.request.xAxis.values.map((value) => formatEphemeralPreviewNumber(value)).join(", ")}`}
          />
          {result.request.yAxis ? (
            <ProvenanceFact
              term="Y axis"
              value={`${result.request.yAxis.parameterId}: ${result.request.yAxis.values.map((value) => formatEphemeralPreviewNumber(value)).join(", ")}`}
            />
          ) : null}
          <ProvenanceFact term="Fixed parameters" value={formatFixedParameters(result.request.fixedParameters)} />
          <ProvenanceFact term="Explicit seeds" value={result.request.seeds.join(", ")} />
          <ProvenanceFact term="Tick horizon" value={String(result.request.tickHorizon)} />
          <ProvenanceFact term="Metric" value={`${metric.label} / ${metric.id}`} />
          <ProvenanceFact term="Metric unit" value={metric.unit ?? "Dimensionless model value"} />
          <ProvenanceFact term="Observation" value="After the final configured simulation tick" />
          <ProvenanceFact term="Work units" value={String(result.request.workEstimate.workUnits)} />
          <ProvenanceFact term="Completed runs" value={`${result.completedRunCount} of ${result.plannedRunCount}`} />
          <ProvenanceFact term="Failed runs" value={String(result.failedRunCount)} />
          <ProvenanceFact
            term="Cancellation"
            value={result.cancellation.effective ? `Effective; ${result.cancellation.unstartedRunCount} runs unstarted` : result.cancellation.requested ? "Requested after all work completed" : "Not requested"}
          />
          <ProvenanceFact term="Preview status" value={result.status.replaceAll("_", " ")} />
        </dl>
        <p>This provenance belongs only to the current in-memory preview. It is not a saved record identifier.</p>
      </section>
    </Disclosure>
  );
}

function ProvenanceFact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function draftToConfiguration(draft: PreviewDraft): EphemeralLandscapePreviewConfigurationInput {
  return {
    templateId: draft.templateId,
    scenarioId: draft.scenarioId,
    xAxis: {
      parameterId: draft.xParameterId,
      minimum: draft.xParameterId ? parseNumber(draft.xMinimum) : 0,
      maximum: draft.xParameterId ? parseNumber(draft.xMaximum) : 1,
      pointCount: parseNumber(draft.xPointCount)
    },
    ...(draft.yEnabled
      ? {
          yAxis: {
            parameterId: draft.yParameterId,
            minimum: draft.yParameterId ? parseNumber(draft.yMinimum) : 0,
            maximum: draft.yParameterId ? parseNumber(draft.yMaximum) : 1,
            pointCount: parseNumber(draft.yPointCount)
          }
        }
      : {}),
    seeds: parseSeeds(draft.seeds),
    tickHorizon: parseNumber(draft.tickHorizon),
    metricId: draft.metricId
  };
}

function estimateDraftWork(draft: PreviewDraft): {
  gridPointCount: number;
  sampleRunCount: number;
  tickHorizon: number;
  workUnits: number;
} | null {
  const xPoints = parseNumber(draft.xPointCount);
  const yPoints = draft.yEnabled ? parseNumber(draft.yPointCount) : 1;
  const seeds = parseSeeds(draft.seeds);
  const tickHorizon = parseNumber(draft.tickHorizon);
  if (![xPoints, yPoints, tickHorizon].every(Number.isSafeInteger) || xPoints <= 0 || yPoints <= 0 || tickHorizon <= 0 || seeds.length === 0) {
    return null;
  }
  const gridPointCount = xPoints * yPoints;
  const sampleRunCount = gridPointCount * seeds.length;
  return { gridPointCount, sampleRunCount, tickHorizon, workUnits: sampleRunCount * tickHorizon };
}

function parseSeeds(value: string): number[] {
  if (value.trim().length === 0) {
    return [];
  }
  return value.split(",").map((part) => parseNumber(part));
}

function parseNumber(value: string): number {
  return value.trim().length === 0 ? Number.NaN : Number(value);
}

function fieldIdForIssue(path: string): string {
  if (path.startsWith("templateId")) return "ephemeral-preview-template";
  if (path.startsWith("scenarioId")) return "ephemeral-preview-scenario";
  if (path.startsWith("xAxis.parameterId")) return "ephemeral-preview-x-parameter";
  if (path.startsWith("xAxis.minimum")) return "ephemeral-preview-x-minimum";
  if (path.startsWith("xAxis.maximum")) return "ephemeral-preview-x-maximum";
  if (path.startsWith("xAxis.pointCount") || path === "xAxis") return "ephemeral-preview-x-points";
  if (path.startsWith("yAxis.parameterId")) return "ephemeral-preview-y-parameter";
  if (path.startsWith("yAxis.minimum")) return "ephemeral-preview-y-minimum";
  if (path.startsWith("yAxis.maximum")) return "ephemeral-preview-y-maximum";
  if (path.startsWith("yAxis.pointCount") || path === "yAxis") return "ephemeral-preview-y-points";
  if (path.startsWith("seeds")) return "ephemeral-preview-seeds";
  if (path.startsWith("tickHorizon")) return "ephemeral-preview-ticks";
  if (path.startsWith("metricId")) return "ephemeral-preview-metric";
  return "ephemeral-preview-error-summary";
}

function completionMessage(result: EphemeralLandscapePreviewResult): string {
  if (result.status === "cancelled") {
    return `Preview cancelled after ${result.completedRunCount} of ${result.plannedRunCount} sample runs. ${result.cancellation.unstartedRunCount} runs remain unsampled.`;
  }
  if (result.status === "failed") {
    return `Preview failed after ${result.completedRunCount} of ${result.plannedRunCount} sample runs reached a terminal state.`;
  }
  if (result.status === "completed_with_errors") {
    return `Completed with errors: ${result.completedRunCount} of ${result.plannedRunCount} sample runs reached a terminal state; ${result.failedRunCount} failed.`;
  }
  return `${result.completedRunCount} of ${result.plannedRunCount} sample runs complete. Sampled preview ready.`;
}

function coordinateText(coordinate: PreviewSamplePoint["coordinate"]): string {
  return [
    `${coordinate.x.parameterId}=${formatEphemeralPreviewNumber(coordinate.x.value)}`,
    ...(coordinate.y ? [`${coordinate.y.parameterId}=${formatEphemeralPreviewNumber(coordinate.y.value)}`] : [])
  ].join(", ");
}

function samplePointStatusLabel(point: PreviewSamplePoint): string {
  if (point.status === "failed") return "Failed; no successful seed value";
  if (point.status === "partial") return `Partial; ${point.unstartedRunCount} unstarted and ${point.failedRunCount} failed`;
  return "Sampled exact coordinate";
}

function uniqueNumbers(values: readonly number[]): number[] {
  return [...new Set(values)];
}

function formatFixedParameters(parameters: EphemeralLandscapePreviewRequest["fixedParameters"]): string {
  return Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(", ");
}

function userMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 360 ? `${message.slice(0, 357)}...` : message;
}
