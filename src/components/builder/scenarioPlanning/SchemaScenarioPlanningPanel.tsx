"use client";

import type { ReactNode } from "react";
import type { ModelSchemaAuthoringSectionId } from "../modelSchemaAuthoring";
import type {
  ScenarioAssumptionCheck,
  ScenarioDataNeed,
  ScenarioGap,
  ScenarioIntervention,
  ScenarioMetric,
  ScenarioParameterFamily,
  ScenarioQuestion,
  SchemaScenarioPlanUxModel,
  TemplatePlanningLink
} from "./schemaScenarioPlanningUx";

export type ScenarioPlanningSectionId =
  | "questions"
  | "interventions"
  | "metrics"
  | "parameters"
  | "assumptions"
  | "data"
  | "templateLinks"
  | "gaps"
  | "boundaries"
  | "nextSteps";

interface SchemaScenarioPlanningPanelProps {
  ux: SchemaScenarioPlanUxModel;
  collapsedSectionIds: ReadonlySet<ScenarioPlanningSectionId>;
  onToggleSection: (sectionId: ScenarioPlanningSectionId) => void;
  onRefresh: () => void;
  onCopyReport: () => Promise<void>;
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
  onViewFitReport: () => void;
}

export function SchemaScenarioPlanningPanel({
  ux,
  collapsedSectionIds,
  onToggleSection,
  onRefresh,
  onCopyReport,
  onJumpToSection,
  onViewFitReport
}: SchemaScenarioPlanningPanelProps) {
  return (
    <section className="schema-scenario-plan" aria-labelledby="schema-scenario-plan-title">
      <header className="schema-scenario-plan__header">
        <div>
          <h3 id="schema-scenario-plan-title">Scenario Planning From Schema V1</h3>
          <p>{ux.sourceDescription}</p>
        </div>
        <div className="schema-scenario-plan__actions">
          <button type="button" onClick={onRefresh} suppressHydrationWarning>
            Refresh scenario plan
          </button>
          <button type="button" onClick={() => void onCopyReport()} suppressHydrationWarning>
            Copy planning report
          </button>
          <button type="button" onClick={onViewFitReport} suppressHydrationWarning>
            View fit report
          </button>
        </div>
      </header>

      <ul className="schema-scenario-plan__boundaries" aria-label="Scenario planning boundaries">
        {ux.boundaryPhrases.map((phrase) => (
          <li key={phrase}>{phrase}</li>
        ))}
      </ul>
      <p className="schema-risk-note">{ux.verificationCopy}</p>

      {!ux.available ? (
        <p className="schema-risk-note" role="status">
          {ux.disabledReason}
        </p>
      ) : (
        <>
          <PlanOverview ux={ux} />
          <PlanningSection
            id="questions"
            title="Candidate Scenario Questions"
            count={ux.candidateQuestions.length}
            collapsed={collapsedSectionIds.has("questions")}
            onToggleSection={onToggleSection}
            note={ux.questionCopy}
          >
            <ul className="schema-scenario-plan__list">
              {ux.candidateQuestions.map((question) => (
                <QuestionItem key={question.id} question={question} onJumpToSection={onJumpToSection} />
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="interventions"
            title="Conceptual Interventions"
            count={ux.conceptualInterventions.length}
            collapsed={collapsedSectionIds.has("interventions")}
            onToggleSection={onToggleSection}
            note={ux.interventionCopy}
          >
            <ul className="schema-scenario-plan__list">
              {ux.conceptualInterventions.map((intervention) => (
                <InterventionItem key={intervention.id} intervention={intervention} onJumpToSection={onJumpToSection} />
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="metrics"
            title="Observable Metrics"
            count={ux.observableMetrics.length}
            collapsed={collapsedSectionIds.has("metrics")}
            onToggleSection={onToggleSection}
            note={ux.metricCopy}
          >
            <ul className="schema-scenario-plan__list">
              {ux.observableMetrics.map((metric) => (
                <MetricItem key={metric.id} metric={metric} onJumpToSection={onJumpToSection} />
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="parameters"
            title="Parameter Families"
            count={ux.parameterFamilies.length}
            collapsed={collapsedSectionIds.has("parameters")}
            onToggleSection={onToggleSection}
          >
            <ul className="schema-scenario-plan__list">
              {ux.parameterFamilies.map((family) => (
                <ParameterFamilyItem key={family.id} family={family} onJumpToSection={onJumpToSection} />
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="assumptions"
            title="Assumption Checks"
            count={ux.assumptionChecks.length}
            collapsed={collapsedSectionIds.has("assumptions")}
            onToggleSection={onToggleSection}
            note={ux.assumptionCopy}
          >
            <ul className="schema-scenario-plan__list">
              {ux.assumptionChecks.map((assumption) => (
                <AssumptionItem key={assumption.id} assumption={assumption} onJumpToSection={onJumpToSection} />
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="data"
            title="Data / Calibration Needs"
            count={ux.dataNeeds.length}
            collapsed={collapsedSectionIds.has("data")}
            onToggleSection={onToggleSection}
            note={ux.dataCopy}
          >
            <ul className="schema-scenario-plan__list">
              {ux.dataNeeds.map((need) => (
                <DataNeedItem key={need.id} need={need} onJumpToSection={onJumpToSection} />
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="templateLinks"
            title="Fit-Linked Template Candidates"
            count={ux.templatePlanningLinks.length}
            collapsed={collapsedSectionIds.has("templateLinks")}
            onToggleSection={onToggleSection}
            note="Fit candidates are planning context only. They are not selected runtime templates."
          >
            <ul className="schema-scenario-plan__list">
              {ux.templatePlanningLinks.map((link) => (
                <TemplateLinkItem key={link.id} link={link} />
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="gaps"
            title="Unsupported / Lossy / Future-Only Gaps"
            count={ux.unsupportedOrLossyGaps.length + ux.futureOnlyGaps.length}
            collapsed={collapsedSectionIds.has("gaps")}
            onToggleSection={onToggleSection}
            note={`${ux.mr0Copy} ${ux.blackjackCopy}`}
          >
            <GapList
              unsupportedOrLossyGaps={ux.unsupportedOrLossyGaps}
              futureOnlyGaps={ux.futureOnlyGaps}
              onJumpToSection={onJumpToSection}
            />
          </PlanningSection>

          <PlanningSection
            id="boundaries"
            title="Claim Boundaries"
            count={ux.claimBoundaries.length}
            collapsed={collapsedSectionIds.has("boundaries")}
            onToggleSection={onToggleSection}
            note={`${ux.neuralCopy} ${ux.mr0Copy}`}
          >
            <ul className="schema-scenario-plan__list schema-scenario-plan__list--compact">
              {ux.claimBoundaries.map((boundary) => (
                <li key={boundary}>{boundary}</li>
              ))}
            </ul>
          </PlanningSection>

          <PlanningSection
            id="nextSteps"
            title="Next Modeling Steps"
            count={ux.nextModelingSteps.length}
            collapsed={collapsedSectionIds.has("nextSteps")}
            onToggleSection={onToggleSection}
          >
            <ul className="schema-scenario-plan__list schema-scenario-plan__list--compact">
              {ux.nextModelingSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </PlanningSection>
        </>
      )}

      <details className="schema-scenario-plan__report">
        <summary>Copyable planning report</summary>
        <pre>{ux.reportText}</pre>
      </details>
    </section>
  );
}

function PlanOverview({ ux }: { ux: SchemaScenarioPlanUxModel }) {
  return (
    <section className="schema-scenario-plan__overview" aria-labelledby="schema-scenario-overview-title">
      <h3 id="schema-scenario-overview-title">Planning Overview</h3>
      <dl className="builder-inspector__rows schema-scenario-plan__facts">
        <div>
          <dt>Schema</dt>
          <dd>{ux.schemaName ? `${ux.schemaName} (${ux.schemaId ?? "unknown"})` : "Unknown"}</dd>
        </div>
        <div>
          <dt>Source status</dt>
          <dd>{ux.sourceStatus}</dd>
        </div>
        <div>
          <dt>Fit report status</dt>
          <dd>
            {ux.fitReportStatus}: {ux.fitReportStatusDescription}
          </dd>
        </div>
        <div>
          <dt>Planning confidence</dt>
          <dd>{ux.planningConfidence}</dd>
        </div>
        <div>
          <dt>Scenario questions</dt>
          <dd>{ux.counts.candidateQuestions}</dd>
        </div>
        <div>
          <dt>Conceptual interventions</dt>
          <dd>{ux.counts.conceptualInterventions}</dd>
        </div>
        <div>
          <dt>Suggested metrics</dt>
          <dd>{ux.counts.observableMetrics}</dd>
        </div>
        <div>
          <dt>Assumption checks</dt>
          <dd>{ux.counts.assumptionChecks}</dd>
        </div>
        <div>
          <dt>Unsupported/lossy/future-only gaps</dt>
          <dd>{ux.counts.unsupportedOrLossyGaps + ux.counts.futureOnlyGaps}</dd>
        </div>
      </dl>
      <p className="schema-scenario-plan__note">{ux.summary}</p>
    </section>
  );
}

function PlanningSection({
  id,
  title,
  count,
  collapsed,
  onToggleSection,
  note,
  children
}: {
  id: ScenarioPlanningSectionId;
  title: string;
  count: number;
  collapsed: boolean;
  onToggleSection: (sectionId: ScenarioPlanningSectionId) => void;
  note?: string;
  children: ReactNode;
}) {
  const bodyId = `schema-scenario-section-${id}`;
  return (
    <section className="schema-scenario-plan__section">
      <button
        type="button"
        className="schema-scenario-plan__section-toggle"
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        onClick={() => onToggleSection(id)}
        suppressHydrationWarning
      >
        <span>{title}</span>
        <strong>{count}</strong>
      </button>
      {!collapsed ? (
        <div id={bodyId} className="schema-scenario-plan__section-body">
          {note ? <p className="schema-scenario-plan__note">{note}</p> : null}
          {count > 0 ? children : <p className="schema-scenario-plan__empty">No items listed for this structurally valid draft.</p>}
        </div>
      ) : null}
    </section>
  );
}

function QuestionItem({
  question,
  onJumpToSection
}: {
  question: ScenarioQuestion;
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
}) {
  return (
    <li className="schema-scenario-plan__item">
      <article>
        <h4>{question.question}</h4>
        <p>{question.rationale}</p>
        <ItemFacts
          rows={[
            ["Risk", question.riskLevel],
            ["Schema paths", question.linkedSchemaPaths.join(", ") || "None"],
            ["Template candidates", question.linkedTemplateIds.join(", ") || "None"]
          ]}
        />
        <button type="button" onClick={() => onJumpToSection(question.sectionId, question.linkedSchemaPaths[0] ?? question.sectionId)} suppressHydrationWarning>
          Jump to schema section
        </button>
      </article>
    </li>
  );
}

function InterventionItem({
  intervention,
  onJumpToSection
}: {
  intervention: ScenarioIntervention;
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
}) {
  return (
    <li className="schema-scenario-plan__item">
      <article>
        <h4>{intervention.label}</h4>
        <p>{intervention.description}</p>
        <ItemFacts
          rows={[
            ["Linked parameters", intervention.linkedParameters.join(", ") || "None"],
            ["Linked entities", intervention.linkedEntities.join(", ") || "None"],
            ["Boundary", intervention.boundary]
          ]}
        />
        <button type="button" onClick={() => onJumpToSection(intervention.sectionId, intervention.linkedParameters[0] ?? intervention.sectionId)} suppressHydrationWarning>
          Jump to schema section
        </button>
      </article>
    </li>
  );
}

function MetricItem({
  metric,
  onJumpToSection
}: {
  metric: ScenarioMetric;
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
}) {
  return (
    <li className="schema-scenario-plan__item">
      <article>
        <h4>{metric.label}</h4>
        <p>{metric.description}</p>
        <ItemFacts
          rows={[
            ["Schema paths", metric.linkedSchemaPaths.join(", ") || "None"],
            ["Limitation", metric.limitation]
          ]}
        />
        <button type="button" onClick={() => onJumpToSection(metric.sectionId, metric.linkedSchemaPaths[0] ?? metric.sectionId)} suppressHydrationWarning>
          Jump to schema section
        </button>
      </article>
    </li>
  );
}

function ParameterFamilyItem({
  family,
  onJumpToSection
}: {
  family: ScenarioParameterFamily;
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
}) {
  return (
    <li className="schema-scenario-plan__item">
      <article>
        <h4>{family.label}</h4>
        <p>{family.description}</p>
        <ItemFacts rows={[["Parameters", family.parameterIds.join(", ") || "None"]]} />
        <button type="button" onClick={() => onJumpToSection(family.sectionId, family.parameterIds[0] ?? family.sectionId)} suppressHydrationWarning>
          Jump to schema section
        </button>
      </article>
    </li>
  );
}

function AssumptionItem({
  assumption,
  onJumpToSection
}: {
  assumption: ScenarioAssumptionCheck;
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
}) {
  return (
    <li className="schema-scenario-plan__item">
      <article>
        <h4>{assumption.assumption}</h4>
        <p>{assumption.whyItMatters}</p>
        <ItemFacts rows={[["Clarify", assumption.clarify]]} />
        <button type="button" onClick={() => onJumpToSection(assumption.sectionId, assumption.sectionId)} suppressHydrationWarning>
          Jump to schema section
        </button>
      </article>
    </li>
  );
}

function DataNeedItem({
  need,
  onJumpToSection
}: {
  need: ScenarioDataNeed;
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
}) {
  return (
    <li className="schema-scenario-plan__item">
      <article>
        <h4>{need.need}</h4>
        <p>{need.whyItMatters}</p>
        <ItemFacts rows={[["Limitation", need.limitation]]} />
        <button type="button" onClick={() => onJumpToSection(need.sectionId, need.sectionId)} suppressHydrationWarning>
          Jump to schema section
        </button>
      </article>
    </li>
  );
}

function TemplateLinkItem({ link }: { link: TemplatePlanningLink }) {
  return (
    <li className="schema-scenario-plan__item">
      <article>
        <h4>
          {link.templateName} <em>{link.templateId}</em>
        </h4>
        <p>{link.planningUse}</p>
        <ItemFacts
          rows={[
            ["Fit label", link.fitLabel],
            ["Score", link.scoreLabel],
            ["Boundary", link.boundary]
          ]}
        />
      </article>
    </li>
  );
}

function GapList({
  unsupportedOrLossyGaps,
  futureOnlyGaps,
  onJumpToSection
}: {
  unsupportedOrLossyGaps: readonly ScenarioGap[];
  futureOnlyGaps: readonly ScenarioGap[];
  onJumpToSection: (sectionId: ModelSchemaAuthoringSectionId, schemaPath: string) => void;
}) {
  const allGaps = [...unsupportedOrLossyGaps, ...futureOnlyGaps];
  return (
    <ul className="schema-scenario-plan__list">
      {allGaps.map((gap) => (
        <li key={gap.id} className="schema-scenario-plan__item">
          <article>
            <h4>{gap.label}</h4>
            <p>{gap.explanation}</p>
            <ItemFacts
              rows={[
                ["Kind", gap.kind],
                ["Severity", gap.severity],
                ["Schema path", gap.schemaPath]
              ]}
            />
            <button type="button" onClick={() => onJumpToSection(gap.sectionId, gap.schemaPath)} suppressHydrationWarning>
              Jump to schema section
            </button>
          </article>
        </li>
      ))}
    </ul>
  );
}

function ItemFacts({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <dl className="builder-inspector__rows schema-scenario-plan__item-facts">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
