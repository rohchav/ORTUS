"use client";

import { useMemo } from "react";
import { metricLabel, getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import {
  deriveActiveRunProvenanceObservation,
  type ActiveRunProvenanceObservation,
  type RunStatusModel
} from "./activeRunProvenanceObservation";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { StatusPill } from "./ui/StatusPill";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

export function RunProvenanceObservationPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const engine = useSimulationStore((state) => state.engine);
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const runtime = useActiveWorldRuntime();
  const descriptor = getTemplateDescriptor(selectedTemplateId);

  const context = useMemo(
    () =>
      deriveActiveRunProvenanceObservation({
        selectedTemplateId,
        template: descriptor.template,
        templateLabel: descriptor.template.name,
        seed: runtime.seed,
        parameters: runtime.parameters,
        initialization: runtime.initialization,
        scenario: runtime.scenario,
        metadata: runtime.metadata,
        snapshot: runtime.workerManaged ? null : snapshot,
        projection: runtime.workerManaged && runtime.uiProjection ? {
          templateId: runtime.uiProjection.templateId,
          tick: runtime.tick,
          time: runtime.time,
          entityCount: runtime.entityCount,
          metricsHistory: runtime.metricsHistory,
          metricRecordCount: runtime.metricRecordCount
        } : null,
        isRunning: runtime.isRunning,
        hasActiveEngine: Boolean(engine),
        hasActiveRuntime: runtime.hasActiveRun,
        runtimeModeLabel: runtime.workerManaged ? "WorkerRuntimeDriver / flocking-v1" : undefined,
        lastError: runtime.state === "failed" ? runtime.error : null,
        speedMultiplier: runtime.speedMultiplier,
        interventionCount: runtime.interventionCount,
        metricLabelForKey: metricLabel
      }),
    [descriptor.template, engine, runtime, selectedTemplateId, snapshot]
  );

  const content = <RunProvenanceObservationView context={context} />;
  return embedded ? content : <CornerFramePanel title="Active Run Context" eyebrow="Live provenance" variant="compact">{content}</CornerFramePanel>;
}

function RunProvenanceObservationView({ context }: { context: ActiveRunProvenanceObservation }) {
  const { provenance, observation, interpretation } = context;
  const parameterPreview = provenance.parameterKeys.slice(0, 6).join(", ");
  const hiddenParameterCount = Math.max(0, provenance.parameterKeys.length - 6);

  return (
      <section className="active-run-context" aria-labelledby="active-run-context-heading">
        <div className="active-run-context__heading">
          <h3 id="active-run-context-heading">Active Run Provenance</h3>
          <StatusPill
            label={provenance.runConfigurationStatus.label}
            tone={provenance.runConfigurationStatus.tone}
            category={provenance.runConfigurationStatus.category}
            state={provenance.runConfigurationStatus.state}
            description={provenance.runConfigurationStatus.description}
            size="compact"
          />
        </div>

        <dl className="active-run-context__facts">
          <Fact label="Model" value={provenance.templateLabel} />
          <Fact label="Template ID" value={provenance.templateId} />
          <Fact label="Scenario" value={provenance.scenarioLabel} />
          <Fact label="Runtime" value={provenance.runtimeModeLabel} />
          <Fact label="Behavior" value={provenance.behaviorModeLabel} />
          <Fact label="Seed" value={provenance.seedLabel} />
          <Fact label="Parameters" value={provenance.parameterSummaryLabel} />
          <Fact label="Initialization" value={provenance.initializationLabel} />
          <Fact label="Composition" value={provenance.agentCompositionLabel} />
          <Fact label="Environment" value={provenance.environmentOptionsLabel} />
          <Fact label="Playback" value={provenance.speedLabel} />
          <Fact label="Fingerprint" value="Not generated in GW2" />
        </dl>

        {parameterPreview ? (
          <p className="active-run-context__key-preview">
            Parameter keys: {parameterPreview}
            {hiddenParameterCount > 0 ? `, +${hiddenParameterCount} more` : ""}
          </p>
        ) : null}

        <p className="microcopy">{provenance.boundaryCopy}</p>

        <div className="active-run-context__subsection" aria-label="Active run observation">
          <div className="active-run-context__subhead">
            <h4>Observation</h4>
            <StatusPill
              label={observation.runStatus.label}
              tone={observation.runStatus.tone}
              category={observation.runStatus.category}
              state={observation.runStatus.state}
              description="Operational state for the active World run."
              size="compact"
            />
          </div>
          <dl className="active-run-context__facts active-run-context__facts--compact">
            <Fact label="Lifecycle" value={observation.lifecycleStatus.label} status={observation.lifecycleStatus} />
            <Fact label="Runtime state" value={observation.runtimeStatusLabel} />
            <Fact label="Tick" value={observation.tickLabel} />
            <Fact label="Time" value={observation.timeLabel} />
            <Fact label="Advance" value={observation.advancingLabel} />
            <Fact label="Living entities" value={observation.aliveEntityCountLabel} />
            <Fact label="Metric records" value={observation.metricRecordCountLabel} />
            <Fact label="Interventions" value={String(observation.interventionCount)} />
          </dl>

          {observation.latestMetricRows.length > 0 ? (
            <div className="active-run-context__metrics" aria-label="Latest model-output metrics">
              {observation.latestMetricRows.map((metric) => (
                <div key={metric.key} className="active-run-context__metric">
                  <span>{metric.label}</span>
                  <strong>{metric.valueLabel}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="microcopy">Latest model-output metrics will appear after the run records metric history.</p>
          )}

          <p className="microcopy">{observation.boundaryCopy}</p>
        </div>

        <div className="active-run-context__subsection" aria-label="Interpretation boundary">
          <div className="active-run-context__subhead">
            <h4>Interpretation Boundary</h4>
            <StatusPill
              label={interpretation.evidenceStatus.label}
              tone={interpretation.evidenceStatus.tone}
              category={interpretation.evidenceStatus.category}
              state={interpretation.evidenceStatus.state}
              description={interpretation.evidenceStatus.description}
              size="compact"
            />
          </div>
          <p className="microcopy">{interpretation.visualPatternCopy}</p>
          <ul className="active-run-context__boundary-list">
            {interpretation.claimBoundaries.map((boundary) => (
              <li key={boundary}>{boundary}</li>
            ))}
          </ul>
        </div>
      </section>
  );
}

function Fact({ label, value, status }: { label: string; value: string; status?: RunStatusModel }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {status ? (
          <StatusPill
            label={status.label}
            tone={status.tone}
            category={status.category}
            state={status.state}
            description={status.description}
            size="compact"
          />
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
