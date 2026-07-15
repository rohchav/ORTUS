"use client";

import type {
  SchemaTemplateFitCandidate,
  SchemaTemplateFitConcept,
  SchemaTemplateFitReportUxModel
} from "./schemaTemplateFitReportUx";

interface SchemaTemplateFitReportPanelProps {
  ux: SchemaTemplateFitReportUxModel;
  collapsedCandidateIds: ReadonlySet<string>;
  onToggleCandidate: (candidateId: string) => void;
  onRefresh: () => void;
  onCopyDiagnostics: () => Promise<void>;
  onJumpToSection: (concept: SchemaTemplateFitConcept) => void;
}

export function SchemaTemplateFitReportPanel({
  ux,
  collapsedCandidateIds,
  onToggleCandidate,
  onRefresh,
  onCopyDiagnostics,
  onJumpToSection
}: SchemaTemplateFitReportPanelProps) {
  return (
    <section className="schema-fit-report" aria-labelledby="schema-fit-report-title">
      <header className="schema-fit-report__header">
        <div>
          <h3 id="schema-fit-report-title">Schema-to-Template Fit Report V1</h3>
          <p>{ux.sourceDescription}</p>
        </div>
        <div className="schema-fit-report__actions">
          <button type="button" onClick={onRefresh} suppressHydrationWarning>
            Refresh fit report
          </button>
          <button type="button" onClick={() => void onCopyDiagnostics()} suppressHydrationWarning>
            Copy diagnostics
          </button>
        </div>
      </header>

      <ul className="schema-fit-report__boundaries" aria-label="Schema-to-template fit report boundaries">
        {ux.boundaryPhrases.map((phrase) => (
          <li key={phrase}>{phrase}</li>
        ))}
      </ul>

      {ux.staleReason ? (
        <p className="schema-risk-note schema-fit-report__stale" role="status">
          {ux.staleReason}
        </p>
      ) : null}

      {!ux.available ? (
        <p className="schema-risk-note" role="status">
          {ux.disabledReason}
        </p>
      ) : ux.emptyState ? (
        <p className="schema-fit-report__empty" role="status">
          {ux.emptyState}
        </p>
      ) : (
        <>
          <FitReportOverview ux={ux} />
          <section className="schema-fit-report__candidate-list" aria-labelledby="schema-fit-candidates-title">
            <h3 id="schema-fit-candidates-title">Closest Templates</h3>
            {ux.candidates.map((candidate) => (
              <FitCandidatePanel
                key={candidate.id}
                candidate={candidate}
                collapsed={collapsedCandidateIds.has(candidate.id)}
                onToggleCandidate={onToggleCandidate}
                onJumpToSection={onJumpToSection}
              />
            ))}
          </section>
        </>
      )}

      <details className="schema-fit-report__diagnostics">
        <summary>Copyable fit diagnostics</summary>
        <pre>{ux.diagnostics}</pre>
      </details>
    </section>
  );
}

function FitReportOverview({ ux }: { ux: SchemaTemplateFitReportUxModel }) {
  return (
    <section className="schema-fit-report__overview" aria-labelledby="schema-fit-overview-title">
      <h3 id="schema-fit-overview-title">Fit Summary</h3>
      <dl className="builder-inspector__rows schema-fit-report__facts">
        <div>
          <dt>Source status</dt>
          <dd>{ux.sourceStatus}</dd>
        </div>
        <div>
          <dt>Schema</dt>
          <dd>{ux.sourceSchemaName ? `${ux.sourceSchemaName} (${ux.sourceSchemaId})` : "Unknown"}</dd>
        </div>
        <div>
          <dt>Generated from</dt>
          <dd>{ux.generatedDescription}</dd>
        </div>
        <div>
          <dt>Template profiles</dt>
          <dd>{ux.templateProfileCount}</dd>
        </div>
        <div>
          <dt>Strongest resemblance</dt>
          <dd>{ux.strongestTemplateLabel}</dd>
        </div>
        <div>
          <dt>Overall fit</dt>
          <dd>{ux.overallFit}</dd>
        </div>
        <div>
          <dt>Mapped concepts</dt>
          <dd>{ux.totals.mapped}</dd>
        </div>
        <div>
          <dt>Partial concepts</dt>
          <dd>{ux.totals.partial}</dd>
        </div>
        <div>
          <dt>Unsupported concepts</dt>
          <dd>{ux.totals.unsupported}</dd>
        </div>
        <div>
          <dt>Lossy mappings</dt>
          <dd>{ux.totals.lossy}</dd>
        </div>
        <div>
          <dt>Future-only gaps</dt>
          <dd>{ux.totals.futureOnly}</dd>
        </div>
        <div>
          <dt>Runtime gaps</dt>
          <dd>{ux.totals.runtimeGaps}</dd>
        </div>
      </dl>
      <p className="schema-fit-report__note">{ux.weakFitPhrase}</p>
    </section>
  );
}

function FitCandidatePanel({
  candidate,
  collapsed,
  onToggleCandidate,
  onJumpToSection
}: {
  candidate: SchemaTemplateFitCandidate;
  collapsed: boolean;
  onToggleCandidate: (candidateId: string) => void;
  onJumpToSection: (concept: SchemaTemplateFitConcept) => void;
}) {
  const bodyId = `schema-fit-candidate-body-${candidate.templateId}`;
  return (
    <article className={`schema-fit-candidate schema-fit-candidate--${candidate.fitLevel}`}>
      <button
        type="button"
        className="schema-fit-candidate__button"
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        onClick={() => onToggleCandidate(candidate.id)}
        suppressHydrationWarning
      >
        <span>
          {candidate.templateName}
          <em>{candidate.templateId}</em>
        </span>
        <span className="schema-fit-candidate__metrics">
          <strong>{candidate.scoreLabel}</strong>
          <em>{candidateCountSummary(candidate)}</em>
        </span>
      </button>
      {!collapsed ? (
        <div id={bodyId} className="schema-fit-candidate__body">
          <dl className="builder-inspector__rows schema-fit-candidate__facts">
            <div>
              <dt>Fit label</dt>
              <dd>{candidate.fit}</dd>
            </div>
            <div>
              <dt>Fit level</dt>
              <dd>{candidate.fitLevel}</dd>
            </div>
            <div>
              <dt>Template version</dt>
              <dd>{candidate.templateVersion}</dd>
            </div>
            <div>
              <dt>Runtime readiness</dt>
              <dd>Not claimed</dd>
            </div>
          </dl>
          <p>{candidate.summary}</p>
          <details className="schema-fit-report__assumptions">
            <summary>View template assumptions</summary>
            <ul className="builder-message-list">
              {candidate.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </details>
          <ul className="schema-fit-report__boundaries" aria-label={`Caveats for ${candidate.templateName}`}>
            {candidate.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
          <ConceptGroup labelPrefix={candidate.templateId} title="Matched Concepts" concepts={candidate.matchedConcepts} onJumpToSection={onJumpToSection} />
          <ConceptGroup labelPrefix={candidate.templateId} title="Partial Concepts" concepts={candidate.partialConcepts} onJumpToSection={onJumpToSection} />
          <ConceptGroup labelPrefix={candidate.templateId} title="Unsupported Concepts" concepts={candidate.unsupportedConcepts} onJumpToSection={onJumpToSection} />
          <ConceptGroup labelPrefix={candidate.templateId} title="Lossy Mappings" concepts={candidate.lossyConcepts} onJumpToSection={onJumpToSection} />
          <ConceptGroup labelPrefix={candidate.templateId} title="Future-Only Gaps" concepts={candidate.futureOnlyConcepts} onJumpToSection={onJumpToSection} />
          <ConceptGroup labelPrefix={candidate.templateId} title="Runtime Gaps" concepts={candidate.runtimeGaps} onJumpToSection={onJumpToSection} />
          {candidate.warnings.length > 0 ? (
            <section className="schema-fit-concept-group" aria-label={`Warnings for ${candidate.templateName}`}>
              <h4>Warnings</h4>
              <ul className="builder-message-list">
                {candidate.warnings.slice(0, 8).map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ConceptGroup({
  labelPrefix,
  title,
  concepts,
  onJumpToSection
}: {
  labelPrefix: string;
  title: string;
  concepts: readonly SchemaTemplateFitConcept[];
  onJumpToSection: (concept: SchemaTemplateFitConcept) => void;
}) {
  if (concepts.length === 0) {
    return null;
  }
  const titleId = `schema-fit-${slugify(labelPrefix)}-${slugify(title)}-title`;
  return (
    <section className="schema-fit-concept-group" aria-label={`${title} for ${labelPrefix}`}>
      <h4 id={titleId}>{title}</h4>
      <div className="schema-fit-concept-list">
        {concepts.map((concept) => (
          <article key={concept.id} className={`schema-fit-concept schema-fit-concept--${concept.severity}`}>
            <header>
              <div>
                <h5>{concept.label}</h5>
                <p>
                  {concept.group} · {concept.schemaPath}
                </p>
              </div>
              <button type="button" onClick={() => onJumpToSection(concept)} suppressHydrationWarning>
                Jump to schema section
              </button>
            </header>
            <dl className="builder-inspector__rows">
              <div>
                <dt>Template concept</dt>
                <dd>{concept.templateConceptLabel}</dd>
              </div>
              <div>
                <dt>Section</dt>
                <dd>{concept.sectionId}</dd>
              </div>
            </dl>
            <p>{concept.explanation}</p>
            {concept.notes.length > 0 ? (
              <ul className="builder-message-list">
                {concept.notes.slice(0, 4).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function candidateCountSummary(candidate: SchemaTemplateFitCandidate): string {
  return [
    `matched ${candidate.matchedConcepts.length}`,
    `partial ${candidate.partialConcepts.length}`,
    `unsupported ${candidate.unsupportedConcepts.length}`,
    `lossy ${candidate.lossyConcepts.length}`,
    `future ${candidate.futureOnlyConcepts.length}`,
    `gaps ${candidate.runtimeGaps.length}`
  ].join(" · ");
}
