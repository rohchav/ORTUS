import type {
  MetricDeclaration,
  ModelArtifactReference,
  ModelRuleKind,
  ModelSchemaDefinition,
  ParameterDeclaration
} from "../../../simulation/modelSchema";
import type { ModelSchemaAuthoringSectionId } from "../modelSchemaAuthoring";
import type { SchemaTemplateFitConcept, SchemaTemplateFitReportUxModel } from "../fitReport/schemaTemplateFitReportUx";

export const schemaScenarioPlanningInvalidState =
  "Scenario planning unavailable: the current schema must be structurally valid before ORTUS can plan scenario questions from it.";

export const schemaScenarioPlanningStaleFitState =
  "Scenario planning unavailable: refresh the stale fit report before using it for scenario planning.";

export const schemaScenarioPlanningStalePlanState =
  "Scenario planning unavailable: refresh the scenario plan from the current valid schema and current fit report.";

export const schemaScenarioPlanningCurrentSource =
  "Scenario plan generated from current structurally valid draft.";

export const schemaScenarioPlanningMissingFitPhrase =
  "No current fit report is available. Scenario planning can still list schema-centered questions, but template-linked planning remains incomplete.";

export const schemaScenarioPlanningBoundaryPhrases = [
  "Scenario planning from schema is a planning aid. It does not create runnable scenarios.",
  "Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state.",
  "Scenario questions are hypotheses to explore, not predictions or validated conclusions.",
  "A scenario plan can suggest what to inspect, but it does not prove what will happen.",
  "Fit reports describe structural resemblance. Scenario plans describe possible study designs. Neither one makes a schema runnable.",
  "A strong fit can guide planning, but it is not runtime readiness."
] as const;

export const schemaScenarioPlanningQuestionCopy = "Scenario questions are study prompts, not claims about real-world outcomes.";
export const schemaScenarioPlanningInterventionCopy =
  "Conceptual interventions describe what a future scenario might vary. They are not executable controls.";
export const schemaScenarioPlanningMetricCopy =
  "Suggested metrics describe what to observe if a future runtime exists. They are not empirical measurements.";
export const schemaScenarioPlanningDataCopy =
  "Data needs identify what would be required for calibration or validation. They do not imply the current schema is calibrated.";
export const schemaScenarioPlanningAssumptionCopy =
  "Assumption checks identify what the modeler should clarify. They do not resolve the assumption.";
export const schemaScenarioPlanningVerificationCopy =
  "Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.";
export const schemaScenarioPlanningNeuralCopy =
  "Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic scenario-planning capability.";
export const schemaScenarioPlanningMr0Copy =
  "MR0 roadmap concepts may appear as future-only planning gaps. They are not implemented scenario capabilities.";
export const schemaScenarioPlanningBlackjackCopy =
  "Blackjack work is offline simulation only in the roadmap. Prompt 39 does not add gambling advice, live casino assistance, wearable input, camera input, or card-counting support.";

export type ScenarioPlanningConfidence = "high-structure" | "medium-structure" | "low-structure" | "insufficient-structure";
export type ScenarioPlanningFitReportStatus = "fresh" | "missing" | "stale";
export type ScenarioPlanningRiskLevel = "low" | "medium" | "high";
export type ScenarioPlanningGapKind = "unsupported" | "lossy" | "runtimeGap" | "futureOnly";

export interface ScenarioQuestion {
  id: string;
  question: string;
  rationale: string;
  linkedSchemaPaths: readonly string[];
  linkedTemplateIds: readonly string[];
  riskLevel: ScenarioPlanningRiskLevel;
  sectionId: ModelSchemaAuthoringSectionId;
}

export interface ScenarioIntervention {
  id: string;
  label: string;
  description: string;
  linkedParameters: readonly string[];
  linkedEntities: readonly string[];
  boundary: string;
  sectionId: ModelSchemaAuthoringSectionId;
}

export interface ScenarioMetric {
  id: string;
  label: string;
  description: string;
  linkedSchemaPaths: readonly string[];
  limitation: string;
  sectionId: ModelSchemaAuthoringSectionId;
}

export interface ScenarioParameterFamily {
  id: string;
  label: string;
  description: string;
  parameterIds: readonly string[];
  sectionId: ModelSchemaAuthoringSectionId;
}

export interface ScenarioAssumptionCheck {
  id: string;
  assumption: string;
  whyItMatters: string;
  clarify: string;
  sectionId: ModelSchemaAuthoringSectionId;
}

export interface ScenarioDataNeed {
  id: string;
  need: string;
  whyItMatters: string;
  limitation: string;
  sectionId: ModelSchemaAuthoringSectionId;
}

export interface TemplatePlanningLink {
  id: string;
  templateId: string;
  templateName: string;
  fitLabel: string;
  scoreLabel: string;
  planningUse: string;
  boundary: string;
}

export interface ScenarioGap {
  id: string;
  label: string;
  kind: ScenarioPlanningGapKind;
  severity: ScenarioPlanningRiskLevel;
  schemaPath: string;
  sectionId: ModelSchemaAuthoringSectionId;
  explanation: string;
}

export interface SchemaScenarioPlanCounts {
  candidateQuestions: number;
  conceptualInterventions: number;
  observableMetrics: number;
  parameterFamilies: number;
  assumptionChecks: number;
  dataNeeds: number;
  unsupportedOrLossyGaps: number;
  futureOnlyGaps: number;
  templatePlanningLinks: number;
}

export interface SchemaScenarioPlanUxModel {
  available: boolean;
  disabledReason: string | null;
  stale: boolean;
  staleReason: string | null;
  sourceDescription: string;
  sourceStatus: "current-valid-draft" | "unavailable";
  schemaId: string | null;
  schemaName: string | null;
  fitReportStatus: ScenarioPlanningFitReportStatus;
  fitReportStatusDescription: string;
  planningConfidence: ScenarioPlanningConfidence;
  summary: string;
  counts: SchemaScenarioPlanCounts;
  candidateQuestions: readonly ScenarioQuestion[];
  conceptualInterventions: readonly ScenarioIntervention[];
  observableMetrics: readonly ScenarioMetric[];
  parameterFamilies: readonly ScenarioParameterFamily[];
  assumptionChecks: readonly ScenarioAssumptionCheck[];
  dataNeeds: readonly ScenarioDataNeed[];
  templatePlanningLinks: readonly TemplatePlanningLink[];
  unsupportedOrLossyGaps: readonly ScenarioGap[];
  futureOnlyGaps: readonly ScenarioGap[];
  claimBoundaries: readonly string[];
  nextModelingSteps: readonly string[];
  boundaryPhrases: readonly string[];
  questionCopy: string;
  interventionCopy: string;
  metricCopy: string;
  dataCopy: string;
  assumptionCopy: string;
  verificationCopy: string;
  neuralCopy: string;
  mr0Copy: string;
  blackjackCopy: string;
  reportText: string;
}

export interface SchemaScenarioPlanSnapshot {
  draftHash: string;
  fitReportHash: string;
  ux: SchemaScenarioPlanUxModel;
}

const maxQuestions = 8;
const maxInterventions = 8;
const maxMetrics = 8;
const maxParameterFamilies = 8;
const maxAssumptionChecks = 10;
const maxDataNeeds = 10;
const maxTemplateLinks = 4;
const maxGaps = 14;
const maxReportLength = 18_000;

const templateHints: Record<
  string,
  {
    questions: readonly string[];
    metrics: readonly string[];
    boundary: string;
  }
> = {
  "predator-prey": {
    questions: [
      "How do birth and death parameters affect population cycles?",
      "How does initial composition affect collapse or persistence?",
      "How does movement or contact structure affect encounter rates?"
    ],
    metrics: ["predator count", "prey count", "extinction time", "oscillation amplitude", "encounter rate"],
    boundary: "Stylized ecological ABM planning only, not an ecological forecast."
  },
  "epidemic-spread": {
    questions: [
      "How do infection and recovery rates affect outbreak duration?",
      "How does contact structure affect peak prevalence?",
      "How do conceptual spread levers alter outcomes in the stylized model?"
    ],
    metrics: ["susceptible count", "infected count", "recovered count", "peak infected", "duration"],
    boundary: "Stylized epidemic ABM planning only, not medical or public-health prediction."
  },
  "opinion-dynamics": {
    questions: [
      "How do influence strength and interaction structure affect polarization?",
      "How do stubborn agents affect consensus or fragmentation?",
      "How do bounded social-learning settings affect opinion distribution?"
    ],
    metrics: ["average opinion", "opinion variance", "polarization", "cluster count"],
    boundary: "Stylized opinion dynamics planning only, not persuasion, diagnosis, or real-person inference."
  },
  "schelling-segregation": {
    questions: [
      "How does tolerance threshold affect segregation-pattern summaries?",
      "How does vacancy rate affect relocation dynamics?"
    ],
    metrics: ["satisfaction rate", "relocation count", "cluster proxy", "segregation proxy"],
    boundary: "Stylized segregation-model planning only, not real demographic prediction."
  },
  "flocking-boids": {
    questions: [
      "How do alignment, cohesion, and separation weights affect group formation?",
      "How does noise affect flock stability?"
    ],
    metrics: ["cohesion", "heading alignment", "group count", "dispersion"],
    boundary: "Stylized movement ABM planning only, not animal-behavior proof."
  },
  "forest-fire": {
    questions: [
      "How do spread threshold and density settings affect local-spread patterns?",
      "How does initial composition affect fragmentation or persistence in the abstract landscape?"
    ],
    metrics: ["burned-cell count", "active-front count", "spread duration", "fragmentation proxy"],
    boundary: "Abstract local-spread planning only, not wildfire, GIS, weather, or firefighting prediction."
  },
  "neural-excitation-network": {
    questions: [
      "How do threshold, decay, and coupling parameters affect activation cascades?",
      "How do output assemblies influence readout stability?",
      "How does stimulation location affect activation spread?"
    ],
    metrics: ["activation count", "cascade size", "output assembly activation", "readout confidence"],
    boundary: "Stylized neural excitation planning only, not biological brain simulation, cognition, diagnosis, or treatment."
  }
};

const mr0Terms: readonly { id: string; label: string; patterns: readonly RegExp[]; sectionId: ModelSchemaAuthoringSectionId }[] = [
  { id: "urban-daily-routine", label: "Urban Daily Routine / Activity Choice", patterns: [/\burban daily routine\b/, /\bactivity choice\b/], sectionId: "notes" },
  { id: "atmospheric-field-dynamics", label: "Atmospheric Field Dynamics", patterns: [/\batmospheric field\b/, /\batmospheric dynamics\b/], sectionId: "spaces" },
  { id: "urban-exposure-resilience", label: "Urban Exposure + Resilience", patterns: [/\burban exposure\b/, /\bexposure resilience\b/], sectionId: "metrics" },
  { id: "cluster-based-readout", label: "Cluster-Based Decision Readout Generalization", patterns: [/\bcluster-based decision readout\b/, /\bdecision readout generalization\b/], sectionId: "rules" },
  { id: "stimulus-conditioned-clusters", label: "Stimulus-Conditioned Decision Clusters", patterns: [/\bstimulus-conditioned decision clusters\b/, /\bstimulus conditioned decision clusters\b/], sectionId: "rules" },
  { id: "blackjack-sequential-decision-lab", label: "Blackjack Sequential Decision Lab", patterns: [/\bblackjack\b/, /\bsequential decision lab\b/], sectionId: "rules" },
  { id: "observed-cluster-discovery", label: "Observed Cluster Discovery / Decision-Space Analytics", patterns: [/\bobserved cluster discovery\b/, /\bdecision-space analytics\b/, /\bcluster discovery\b/], sectionId: "metrics" }
];

export function createSchemaScenarioPlanUxModel(
  draft: ModelSchemaDefinition,
  structurallyValid: boolean,
  fitReport: SchemaTemplateFitReportUxModel | null
): SchemaScenarioPlanUxModel {
  if (!structurallyValid) {
    return createUnavailableScenarioPlan(draft, schemaScenarioPlanningInvalidState, "missing", "Schema is structurally invalid.");
  }
  if (fitReport?.stale) {
    return createUnavailableScenarioPlan(draft, schemaScenarioPlanningStaleFitState, "stale", schemaScenarioPlanningStaleFitState);
  }

  const fitAvailable = Boolean(fitReport?.available);
  const templatePlanningLinks = fitAvailable ? createTemplatePlanningLinks(fitReport) : [];
  const unsupportedOrLossyGaps = fitAvailable ? collectFitGaps(fitReport, ["unsupported", "lossy", "runtimeGap"]) : [];
  const futureOnlyGaps = collectFutureGaps(draft, fitReport);
  const parameterFamilies = createParameterFamilies(draft);
  const candidateQuestions = createCandidateQuestions(draft, templatePlanningLinks, unsupportedOrLossyGaps, futureOnlyGaps);
  const conceptualInterventions = createConceptualInterventions(draft, parameterFamilies);
  const observableMetrics = createObservableMetrics(draft, templatePlanningLinks);
  const assumptionChecks = createAssumptionChecks(draft, unsupportedOrLossyGaps, futureOnlyGaps);
  const dataNeeds = createDataNeeds(draft, parameterFamilies, observableMetrics);
  const counts = {
    candidateQuestions: candidateQuestions.length,
    conceptualInterventions: conceptualInterventions.length,
    observableMetrics: observableMetrics.length,
    parameterFamilies: parameterFamilies.length,
    assumptionChecks: assumptionChecks.length,
    dataNeeds: dataNeeds.length,
    unsupportedOrLossyGaps: unsupportedOrLossyGaps.length,
    futureOnlyGaps: futureOnlyGaps.length,
    templatePlanningLinks: templatePlanningLinks.length
  };
  const planningConfidence = classifyConfidence(draft, counts, fitReport);
  const model: SchemaScenarioPlanUxModel = {
    available: true,
    disabledReason: null,
    stale: false,
    staleReason: null,
    sourceDescription: schemaScenarioPlanningCurrentSource,
    sourceStatus: "current-valid-draft",
    schemaId: draft.id,
    schemaName: draft.name,
    fitReportStatus: fitAvailable ? "fresh" : "missing",
    fitReportStatusDescription: fitAvailable ? "Fresh non-stale fit report available for structural planning context." : schemaScenarioPlanningMissingFitPhrase,
    planningConfidence,
    summary: summarizePlan(draft, planningConfidence, counts, fitAvailable),
    counts,
    candidateQuestions,
    conceptualInterventions,
    observableMetrics,
    parameterFamilies,
    assumptionChecks,
    dataNeeds,
    templatePlanningLinks,
    unsupportedOrLossyGaps,
    futureOnlyGaps,
    claimBoundaries: createClaimBoundaries(draft, futureOnlyGaps),
    nextModelingSteps: createNextModelingSteps(fitAvailable, unsupportedOrLossyGaps, futureOnlyGaps),
    boundaryPhrases: schemaScenarioPlanningBoundaryPhrases,
    questionCopy: schemaScenarioPlanningQuestionCopy,
    interventionCopy: schemaScenarioPlanningInterventionCopy,
    metricCopy: schemaScenarioPlanningMetricCopy,
    dataCopy: schemaScenarioPlanningDataCopy,
    assumptionCopy: schemaScenarioPlanningAssumptionCopy,
    verificationCopy: schemaScenarioPlanningVerificationCopy,
    neuralCopy: schemaScenarioPlanningNeuralCopy,
    mr0Copy: schemaScenarioPlanningMr0Copy,
    blackjackCopy: schemaScenarioPlanningBlackjackCopy,
    reportText: ""
  };
  return { ...model, reportText: boundText(formatSchemaScenarioPlanningReport(model)) };
}

export function createSchemaScenarioPlanSnapshot(
  draft: ModelSchemaDefinition,
  structurallyValid: boolean,
  fitReport: SchemaTemplateFitReportUxModel | null
): SchemaScenarioPlanSnapshot {
  return {
    draftHash: getSchemaScenarioPlanDraftHash(draft),
    fitReportHash: getScenarioFitReportHash(fitReport),
    ux: createSchemaScenarioPlanUxModel(draft, structurallyValid, fitReport)
  };
}

export function resolveSchemaScenarioPlanUxModel(
  draft: ModelSchemaDefinition,
  structurallyValid: boolean,
  fitReport: SchemaTemplateFitReportUxModel | null,
  snapshot: SchemaScenarioPlanSnapshot | null
): SchemaScenarioPlanUxModel {
  if (!structurallyValid || fitReport?.stale) {
    return createSchemaScenarioPlanUxModel(draft, structurallyValid, fitReport);
  }
  const draftHash = getSchemaScenarioPlanDraftHash(draft);
  const fitReportHash = getScenarioFitReportHash(fitReport);
  if (snapshot?.draftHash === draftHash && snapshot.fitReportHash === fitReportHash) {
    return snapshot.ux;
  }
  if (snapshot) {
    return createStaleScenarioPlan(draft, fitReport);
  }
  return createSchemaScenarioPlanUxModel(draft, structurallyValid, fitReport);
}

export function getSchemaScenarioPlanDraftHash(draft: ModelSchemaDefinition): string {
  return hashText(JSON.stringify(draft));
}

export function getScenarioFitReportHash(fitReport: SchemaTemplateFitReportUxModel | null): string {
  if (!fitReport) {
    return "missing";
  }
  return hashText(
    JSON.stringify({
      stale: fitReport.stale,
      sourceStatus: fitReport.sourceStatus,
      sourceSchemaId: fitReport.sourceSchemaId,
      sourceSchemaName: fitReport.sourceSchemaName,
      candidateCount: fitReport.candidateCount,
      totals: fitReport.totals,
      diagnostics: fitReport.diagnostics,
      candidates: fitReport.candidates.map((candidate) => ({
        templateId: candidate.templateId,
        fit: candidate.fit,
        score: candidate.score,
        counts: [
          candidate.matchedConcepts.length,
          candidate.partialConcepts.length,
          candidate.unsupportedConcepts.length,
          candidate.lossyConcepts.length,
          candidate.futureOnlyConcepts.length,
          candidate.runtimeGaps.length
        ]
      }))
    })
  );
}

export function formatSchemaScenarioPlanningReport(model: SchemaScenarioPlanUxModel): string {
  const lines = [
    "Scenario Planning From Schema V1",
    `Source: ${model.sourceDescription}`,
    `Source status: ${model.sourceStatus}`,
    `Schema: ${model.schemaName ?? "unknown"} (${model.schemaId ?? "unknown"})`,
    `Fit report status: ${model.fitReportStatus} - ${model.fitReportStatusDescription}`,
    `Planning confidence: ${model.planningConfidence}`,
    `Counts: questions ${model.counts.candidateQuestions}, conceptual interventions ${model.counts.conceptualInterventions}, metrics ${model.counts.observableMetrics}, assumptions ${model.counts.assumptionChecks}, unsupported/lossy/runtime gaps ${model.counts.unsupportedOrLossyGaps}, future-only gaps ${model.counts.futureOnlyGaps}`,
    "",
    "Required boundaries:",
    ...model.boundaryPhrases.map((phrase) => `- ${phrase}`),
    `- ${model.questionCopy}`,
    `- ${model.interventionCopy}`,
    `- ${model.metricCopy}`,
    `- ${model.dataCopy}`,
    `- ${model.assumptionCopy}`,
    `- ${model.verificationCopy}`,
    `- ${model.neuralCopy}`,
    `- ${model.mr0Copy}`,
    `- ${model.blackjackCopy}`,
    "",
    `Summary: ${model.summary}`
  ];

  appendReportSection(lines, "Candidate scenario questions", model.candidateQuestions.map((item) => `${item.question} Risk: ${item.riskLevel}. Rationale: ${item.rationale}`));
  appendReportSection(lines, "Conceptual interventions", model.conceptualInterventions.map((item) => `${item.label}: ${item.description} ${item.boundary}`));
  appendReportSection(lines, "Observable metrics", model.observableMetrics.map((item) => `${item.label}: ${item.description} Limitation: ${item.limitation}`));
  appendReportSection(lines, "Parameter families", model.parameterFamilies.map((item) => `${item.label}: ${item.description} Parameters: ${item.parameterIds.join(", ") || "none"}`));
  appendReportSection(lines, "Assumption checks", model.assumptionChecks.map((item) => `${item.assumption}: ${item.whyItMatters} Clarify: ${item.clarify}`));
  appendReportSection(lines, "Data/calibration needs", model.dataNeeds.map((item) => `${item.need}: ${item.whyItMatters} Limitation: ${item.limitation}`));
  appendReportSection(lines, "Template planning links", model.templatePlanningLinks.map((item) => `${item.templateName} (${item.templateId}): ${item.planningUse} ${item.boundary}`));
  appendReportSection(lines, "Unsupported/lossy/runtime gaps", model.unsupportedOrLossyGaps.map((item) => `${item.label} (${item.kind}): ${item.explanation}`));
  appendReportSection(lines, "Future-only gaps", model.futureOnlyGaps.map((item) => `${item.label}: ${item.explanation}`));
  appendReportSection(lines, "Claim boundaries", model.claimBoundaries);
  appendReportSection(lines, "Next modeling steps", model.nextModelingSteps);

  return `${lines.join("\n")}\n`;
}

function createUnavailableScenarioPlan(
  draft: ModelSchemaDefinition,
  disabledReason: string,
  fitReportStatus: ScenarioPlanningFitReportStatus,
  fitReportStatusDescription: string,
  options: {
    stale?: boolean;
    staleReason?: string;
    sourceDescription?: string;
    nextModelingSteps?: readonly string[];
  } = {}
): SchemaScenarioPlanUxModel {
  const stale = options.stale ?? fitReportStatus === "stale";
  const model: SchemaScenarioPlanUxModel = {
    available: false,
    disabledReason,
    stale,
    staleReason: stale ? (options.staleReason ?? disabledReason) : null,
    sourceDescription: options.sourceDescription ?? "No scenario plan generated from an invalid schema or stale fit report.",
    sourceStatus: "unavailable",
    schemaId: draft.id || null,
    schemaName: draft.name || null,
    fitReportStatus,
    fitReportStatusDescription,
    planningConfidence: "insufficient-structure",
    summary: disabledReason,
    counts: emptyCounts(),
    candidateQuestions: [],
    conceptualInterventions: [],
    observableMetrics: [],
    parameterFamilies: [],
    assumptionChecks: [],
    dataNeeds: [],
    templatePlanningLinks: [],
    unsupportedOrLossyGaps: [],
    futureOnlyGaps: [],
    claimBoundaries: createClaimBoundaries(draft, []),
    nextModelingSteps:
      options.nextModelingSteps ??
      (fitReportStatus === "stale" ? ["Refresh the stale fit report before using it for scenario planning."] : ["Fix structural validation issues before planning scenario questions."]),
    boundaryPhrases: schemaScenarioPlanningBoundaryPhrases,
    questionCopy: schemaScenarioPlanningQuestionCopy,
    interventionCopy: schemaScenarioPlanningInterventionCopy,
    metricCopy: schemaScenarioPlanningMetricCopy,
    dataCopy: schemaScenarioPlanningDataCopy,
    assumptionCopy: schemaScenarioPlanningAssumptionCopy,
    verificationCopy: schemaScenarioPlanningVerificationCopy,
    neuralCopy: schemaScenarioPlanningNeuralCopy,
    mr0Copy: schemaScenarioPlanningMr0Copy,
    blackjackCopy: schemaScenarioPlanningBlackjackCopy,
    reportText: ""
  };
  return { ...model, reportText: boundText(formatSchemaScenarioPlanningReport(model)) };
}

function createStaleScenarioPlan(
  draft: ModelSchemaDefinition,
  fitReport: SchemaTemplateFitReportUxModel | null
): SchemaScenarioPlanUxModel {
  const fitAvailable = Boolean(fitReport?.available);
  return createUnavailableScenarioPlan(
    draft,
    schemaScenarioPlanningStalePlanState,
    fitAvailable ? "fresh" : "missing",
    fitAvailable
      ? "Current fit report is available, but the stored scenario plan was generated from different inputs."
      : schemaScenarioPlanningMissingFitPhrase,
    {
      stale: true,
      staleReason: schemaScenarioPlanningStalePlanState,
      sourceDescription: "No current scenario plan is available because the schema or fit-report source changed after the previous plan was generated.",
      nextModelingSteps: ["Refresh the scenario plan from the current valid schema before copying or using it."]
    }
  );
}

function createTemplatePlanningLinks(fitReport: SchemaTemplateFitReportUxModel | null): TemplatePlanningLink[] {
  if (!fitReport?.available) {
    return [];
  }
  return fitReport.candidates
    .filter((candidate) => candidate.fitLevel !== "unsupported")
    .slice(0, maxTemplateLinks)
    .map((candidate) => {
      const hint = templateHints[candidate.templateId];
      return {
        id: `template-link:${candidate.templateId}`,
        templateId: candidate.templateId,
        templateName: candidate.templateName,
        fitLabel: candidate.fit,
        scoreLabel: candidate.scoreLabel,
        planningUse: hint
          ? `Use this only as a structural planning family for questions such as: ${hint.questions[0] ?? "clarify model assumptions."}`
          : "Use this only as a structural planning family; no runtime conversion is implied.",
        boundary: hint?.boundary ?? "Template resemblance is structural only and does not make the schema runnable."
      };
    });
}

function createCandidateQuestions(
  draft: ModelSchemaDefinition,
  templateLinks: readonly TemplatePlanningLink[],
  unsupportedOrLossyGaps: readonly ScenarioGap[],
  futureOnlyGaps: readonly ScenarioGap[]
): ScenarioQuestion[] {
  const questions: ScenarioQuestion[] = [];
  const metrics = activeMetrics(draft);
  const parameters = activeParameters(draft);
  const rules = activeRules(draft);
  const spaces = activeSpaces(draft);

  for (const link of templateLinks) {
    const hint = templateHints[link.templateId];
    for (const question of hint?.questions ?? []) {
      addUnique(
        questions,
        {
          id: `template-question:${link.templateId}:${slugify(question)}`,
          question,
          rationale: `${link.templateName} is a structurally relevant template candidate. ${link.boundary}`,
          linkedSchemaPaths: ["scope.templateId"],
          linkedTemplateIds: [link.templateId],
          riskLevel: link.templateId === "neural-excitation-network" ? "high" : "medium",
          sectionId: "identity"
        },
        (item) => item.question
      );
      if (questions.length >= maxQuestions) {
        return questions;
      }
    }
  }

  for (const parameter of parameters) {
    const metric = metrics[questions.length % Math.max(metrics.length, 1)];
    addUnique(
      questions,
      {
        id: `parameter-question:${parameter.id}:${metric?.id ?? "outcome"}`,
        question: metric
          ? `How does varying ${displayName(parameter)} affect ${displayName(metric)} in a future template-owned runtime?`
          : `How does varying ${displayName(parameter)} change the model-output patterns the user plans to inspect?`,
        rationale: "The schema declares this parameter structurally; the question is a study prompt, not executable behavior.",
        linkedSchemaPaths: [`parameters.${parameter.id}`, metric ? `metrics.${metric.id}` : "metrics"],
        linkedTemplateIds: templateLinks.map((link) => link.templateId),
        riskLevel: "medium",
        sectionId: "parameters"
      },
      (item) => item.question
    );
    if (questions.length >= maxQuestions) {
      return questions;
    }
  }

  for (const rule of rules) {
    addUnique(
      questions,
      {
        id: `rule-question:${rule.id}`,
        question: questionForRuleKind(rule.ruleKind, displayName(rule)),
        rationale: "Rule declarations are descriptive metadata. This question records what a later audited runtime slice might need to test.",
        linkedSchemaPaths: [`ruleDeclarations.${rule.id}`],
        linkedTemplateIds: templateLinks.map((link) => link.templateId),
        riskLevel: rule.ruleKind === "socialLearning" || rule.ruleKind === "beliefUpdate" || rule.ruleKind === "memoryUpdate" ? "high" : "medium",
        sectionId: "rules"
      },
      (item) => item.question
    );
    if (questions.length >= maxQuestions) {
      return questions;
    }
  }

  for (const space of spaces) {
    addUnique(
      questions,
      {
        id: `space-question:${space.id}`,
        question: `How does the declared ${space.spaceKind} space shape the observable model-output patterns?`,
        rationale: "Space declarations are structural. This does not execute movement, fields, networks, or multi-scale behavior.",
        linkedSchemaPaths: [`spaces.${space.id}`],
        linkedTemplateIds: templateLinks.map((link) => link.templateId),
        riskLevel: space.spaceKind === "field" || space.spaceKind === "multiscale" ? "high" : "medium",
        sectionId: "spaces"
      },
      (item) => item.question
    );
    if (questions.length >= maxQuestions) {
      return questions;
    }
  }

  if (futureOnlyGaps.length > 0 || unsupportedOrLossyGaps.length > 0) {
    addUnique(
      questions,
      {
        id: "gap-question",
        question: "Which unsupported, lossy, or future-only concepts must be resolved before any runtime work is scoped?",
        rationale: "Visible gaps are model-risk signals. They are not runtime capabilities.",
        linkedSchemaPaths: [...futureOnlyGaps, ...unsupportedOrLossyGaps].slice(0, 4).map((gap) => gap.schemaPath),
        linkedTemplateIds: templateLinks.map((link) => link.templateId),
        riskLevel: "high",
        sectionId: "notes"
      },
      (item) => item.question
    );
  }

  if (questions.length === 0) {
    questions.push({
      id: "minimal-schema-question",
      question: "What assumptions, parameters, and metrics must be added before this schema can support meaningful scenario planning?",
      rationale: "The schema is structurally valid but sparse. Planning should start with modeling intent and measurement definitions.",
      linkedSchemaPaths: ["identity"],
      linkedTemplateIds: [],
      riskLevel: "high",
      sectionId: "identity"
    });
  }

  return questions.slice(0, maxQuestions);
}

function createConceptualInterventions(draft: ModelSchemaDefinition, families: readonly ScenarioParameterFamily[]): ScenarioIntervention[] {
  const interventions: ScenarioIntervention[] = [];
  const entities = activeEntities(draft);
  for (const family of families) {
    addUnique(
      interventions,
      {
        id: `intervention:${family.id}`,
        label: `Vary ${family.label.toLowerCase()}`,
        description: `${family.description} This is a conceptual lever for a future scenario design, not a control in the current app.`,
        linkedParameters: family.parameterIds,
        linkedEntities: entities.slice(0, 4).map((entity) => entity.id),
        boundary: schemaScenarioPlanningInterventionCopy,
        sectionId: "parameters"
      },
      (item) => item.label
    );
    if (interventions.length >= maxInterventions) {
      return interventions;
    }
  }

  if (entities.length > 0) {
    interventions.push({
      id: "intervention:initial-composition",
      label: "Modify initial composition",
      description: "Vary the declared entity mix or starting proportions after a future runtime contract defines what those initial conditions mean.",
      linkedParameters: [],
      linkedEntities: entities.slice(0, 6).map((entity) => entity.id),
      boundary: schemaScenarioPlanningInterventionCopy,
      sectionId: "entities"
    });
  }

  for (const space of activeSpaces(draft)) {
    addUnique(
      interventions,
      {
        id: `intervention:space:${space.id}`,
        label: `Vary ${space.spaceKind} structure`,
        description: `Treat ${displayName(space)} as a conceptual structure to vary only after a future template explicitly owns that runtime behavior.`,
        linkedParameters: [],
        linkedEntities: entities.slice(0, 4).map((entity) => entity.id),
        boundary: schemaScenarioPlanningInterventionCopy,
        sectionId: "spaces"
      },
      (item) => item.label
    );
    if (interventions.length >= maxInterventions) {
      return interventions;
    }
  }

  return interventions.slice(0, maxInterventions);
}

function createObservableMetrics(draft: ModelSchemaDefinition, templateLinks: readonly TemplatePlanningLink[]): ScenarioMetric[] {
  const metrics: ScenarioMetric[] = [];
  for (const metric of activeMetrics(draft)) {
    addUnique(
      metrics,
      {
        id: `metric:${metric.id}`,
        label: displayName(metric),
        description: `Observe the declared ${metric.metricKind} model-output summary if a future runtime slice implements it.`,
        linkedSchemaPaths: [`metrics.${metric.id}`],
        limitation: schemaScenarioPlanningMetricCopy,
        sectionId: "metrics"
      },
      (item) => item.label
    );
    if (metrics.length >= maxMetrics) {
      return metrics;
    }
  }

  for (const link of templateLinks) {
    const hint = templateHints[link.templateId];
    for (const label of hint?.metrics ?? []) {
      addUnique(
        metrics,
        {
          id: `template-metric:${link.templateId}:${slugify(label)}`,
          label,
          description: `${label} is a candidate model-output summary often inspected for the ${link.templateName} family.`,
          linkedSchemaPaths: ["metrics"],
          limitation: `${schemaScenarioPlanningMetricCopy} ${link.boundary}`,
          sectionId: "metrics"
        },
        (item) => item.label
      );
      if (metrics.length >= maxMetrics) {
        return metrics;
      }
    }
  }

  if (metrics.length === 0 && activeEntities(draft).length > 0) {
    metrics.push({
      id: "metric:entity-counts",
      label: "Entity counts",
      description: "Count declared entity categories as a minimal model-output summary if a future runtime exists.",
      linkedSchemaPaths: ["entityTypes"],
      limitation: schemaScenarioPlanningMetricCopy,
      sectionId: "entities"
    });
  }

  return metrics.slice(0, maxMetrics);
}

function createParameterFamilies(draft: ModelSchemaDefinition): ScenarioParameterFamily[] {
  const grouped = new Map<string, { label: string; description: string; parameterIds: string[] }>();
  for (const parameter of activeParameters(draft)) {
    const family = parameterFamilyFor(parameter);
    const existing = grouped.get(family.id);
    if (existing) {
      existing.parameterIds.push(parameter.id);
    } else {
      grouped.set(family.id, { label: family.label, description: family.description, parameterIds: [parameter.id] });
    }
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => parameterFamilyOrder(a) - parameterFamilyOrder(b) || a.localeCompare(b))
    .slice(0, maxParameterFamilies)
    .map(([id, family]) => ({
      id: `family:${id}`,
      label: family.label,
      description: family.description,
      parameterIds: family.parameterIds.sort(),
      sectionId: "parameters" as const
    }));
}

function createAssumptionChecks(
  draft: ModelSchemaDefinition,
  unsupportedOrLossyGaps: readonly ScenarioGap[],
  futureOnlyGaps: readonly ScenarioGap[]
): ScenarioAssumptionCheck[] {
  const checks: ScenarioAssumptionCheck[] = [];
  addAssumption(checks, "agent-heterogeneity", "Homogeneous versus heterogeneous entities", "Entity declarations do not by themselves define variation within a type.", "State which attributes vary, which stay fixed, and why.", "entities");
  if (activeParameters(draft).length > 0) {
    addAssumption(checks, "parameter-ranges", "Parameter ranges and units", "Planning levers are weak if ranges, units, or admissible categories are vague.", "Document plausible ranges, units, and provenance before treating sweeps as meaningful.", "parameters");
  }
  if (activeRules(draft).length > 0) {
    addAssumption(checks, "update-schedule", "Synchronous versus asynchronous update", "Rule declarations do not specify scheduling semantics unless a later runtime contract does.", "Clarify update order, simultaneity, delays, and conflict handling.", "rules");
  }
  if (hasNetworkStructure(draft)) {
    addAssumption(checks, "network-static-adaptive", "Fixed versus adaptive network", "Network structure changes can dominate outcomes, but a network declaration is not executable topology.", "State whether ties are fixed, rewired, weighted, or only a structural placeholder.", "spaces");
  }
  if (hasLocalInteraction(draft)) {
    addAssumption(checks, "local-global", "Local versus global interaction", "Interaction scope changes how patterns should be interpreted.", "Specify radius, neighborhood, contact, or global-mixing assumptions.", "rules");
  }
  if (hasEnvironmentStructure(draft)) {
    addAssumption(checks, "environment-static-dynamic", "Static versus dynamic environment", "Field, boundary, and environment declarations are structural unless a template executes them.", "Clarify which environmental values are fixed, exogenous, synthetic, or future-only.", "spaces");
  }
  if (activeMetrics(draft).length > 0) {
    addAssumption(checks, "measurement-proxy", "Metric versus measurement", "A schema metric is a model-output target, not empirical observation.", "Document proxy limits, measurement noise, validation target, and data provenance.", "metrics");
  }
  if (hasSocialCognitiveStructure(draft)) {
    addAssumption(checks, "social-cognitive-bounds", "Social/cognitive descriptor bounds", "Belief, memory, and social-learning declarations are not human minds.", "Keep representations bounded, symbolic or numeric, and separated from profiling or persuasion claims.", "rules");
  }
  if (unsupportedOrLossyGaps.length > 0) {
    addAssumption(checks, "gap-intent", "Unsupported or lossy modeling intent", "Unsupported and lossy concepts can invalidate a proposed study design if ignored.", "Decide whether each gap is essential, deferrable, or should be removed from the claim.", "notes");
  }
  if (futureOnlyGaps.length > 0) {
    addAssumption(checks, "future-only-boundary", "Future-only roadmap boundary", "MR0 concepts may be useful planning gaps, but they are not implemented scenario capabilities.", "Mark future-only concepts as non-runtime dependencies until a dedicated prompt implements and audits them.", "notes");
  }
  return checks.slice(0, maxAssumptionChecks);
}

function createDataNeeds(
  draft: ModelSchemaDefinition,
  parameterFamilies: readonly ScenarioParameterFamily[],
  observableMetrics: readonly ScenarioMetric[]
): ScenarioDataNeed[] {
  const needs: ScenarioDataNeed[] = [];
  addDataNeed(needs, "initial-conditions", "Initial conditions", "The starting entity composition and state distribution shape any future scenario study.", "Absent initial-condition data limits interpretation to toy exploration.", "entities");
  if (parameterFamilies.length > 0) {
    addDataNeed(needs, "parameter-ranges", "Parameter ranges and provenance", "Scenario levers need bounded values, units where relevant, and a reason for the range.", "Absent ranges make sensitivity exercises arbitrary.", "parameters");
  }
  if (hasRateParameter(draft)) {
    addDataNeed(needs, "baseline-rates", "Baseline rates", "Rate-like parameters need baseline estimates before output magnitudes deserve attention.", "Missing baselines prevent calibration claims.", "parameters");
  }
  if (hasNetworkStructure(draft)) {
    addDataNeed(needs, "network-structure", "Network or contact structure", "Topology assumptions often dominate spread, influence, and encounter processes.", "Absent network data makes structural resemblance especially fragile.", "spaces");
  }
  if (observableMetrics.length > 0) {
    addDataNeed(needs, "validation-metrics", "Validation metrics", "Declared metrics need observed or benchmark counterparts before outputs can be compared seriously.", "Absent validation targets mean outputs remain exploratory model behavior.", "metrics");
    addDataNeed(needs, "observed-time-series", "Observed time series or summary distributions", "Temporal or distributional data are needed to check whether stylized patterns are plausible.", "Absent observations block calibration and external validation.", "metrics");
  }
  addDataNeed(needs, "sensitivity-plan", "Sensitivity-analysis plan", "Planning should identify which parameters and assumptions would be varied conceptually.", "Without sensitivity planning, single-output narratives are overinterpretation bait.", "notes");
  addDataNeed(needs, "uncertainty-ranges", "Uncertainty ranges", "Uncertainty bounds are needed before comparing scenario alternatives.", "Uncertainty descriptors are not calibrated probabilities by default.", "notes");
  if (hasSocialCognitiveStructure(draft)) {
    addDataNeed(needs, "ethics-purpose-review", "Ethical purpose and profiling review", "Social/cognitive descriptors require clear purpose limits and avoidance of real-person inference.", "Absent review increases protected-class, profiling, and persuasion risks.", "notes");
  }
  return needs.slice(0, maxDataNeeds);
}

function collectFitGaps(fitReport: SchemaTemplateFitReportUxModel | null, kinds: readonly ScenarioPlanningGapKind[]): ScenarioGap[] {
  if (!fitReport?.available) {
    return [];
  }
  const gaps: ScenarioGap[] = [];
  for (const candidate of fitReport.candidates) {
    const concepts: Array<{ kind: ScenarioPlanningGapKind; concept: SchemaTemplateFitConcept }> = [
      ...candidate.unsupportedConcepts.map((concept) => ({ kind: "unsupported" as const, concept })),
      ...candidate.lossyConcepts.map((concept) => ({ kind: "lossy" as const, concept })),
      ...candidate.runtimeGaps.map((concept) => ({ kind: "runtimeGap" as const, concept }))
    ];
    for (const { kind, concept } of concepts) {
      if (!kinds.includes(kind)) {
        continue;
      }
      addUnique(
        gaps,
        {
          id: `gap:${kind}:${slugify(concept.label)}:${slugify(concept.schemaPath)}`,
          label: concept.label,
          kind,
          severity: concept.severity === "critical" ? "high" : concept.severity === "warning" ? "medium" : "low",
          schemaPath: concept.schemaPath,
          sectionId: concept.sectionId,
          explanation: concept.explanation
        },
        (item) => `${item.kind}:${item.label}:${item.schemaPath}`
      );
      if (gaps.length >= maxGaps) {
        return gaps;
      }
    }
  }
  return gaps.slice(0, maxGaps);
}

function collectFutureGaps(draft: ModelSchemaDefinition, fitReport: SchemaTemplateFitReportUxModel | null): ScenarioGap[] {
  const gaps: ScenarioGap[] = [];
  if (fitReport?.available) {
    for (const candidate of fitReport.candidates) {
      for (const concept of candidate.futureOnlyConcepts) {
        addUnique(
          gaps,
          {
            id: `future-gap:${slugify(concept.label)}:${slugify(concept.schemaPath)}`,
            label: concept.label,
            kind: "futureOnly",
            severity: concept.severity === "critical" ? "high" : "medium",
            schemaPath: concept.schemaPath,
            sectionId: concept.sectionId,
            explanation: `${concept.explanation} ${schemaScenarioPlanningMr0Copy}`
          },
          (item) => `${item.label}:${item.schemaPath}`
        );
        if (gaps.length >= maxGaps) {
          return gaps;
        }
      }
    }
  }
  const text = JSON.stringify(draft).toLowerCase();
  for (const term of mr0Terms) {
    if (!term.patterns.some((pattern) => pattern.test(text))) {
      continue;
    }
    addUnique(
      gaps,
      {
        id: `future-gap:${term.id}`,
        label: term.label,
        kind: "futureOnly",
        severity: "medium",
        schemaPath: "roadmapReferences",
        sectionId: term.sectionId,
        explanation:
          term.id === "blackjack-sequential-decision-lab"
            ? `${schemaScenarioPlanningMr0Copy} ${schemaScenarioPlanningBlackjackCopy}`
            : schemaScenarioPlanningMr0Copy
      },
      (item) => `${item.label}:${item.schemaPath}`
    );
  }
  return gaps.slice(0, maxGaps);
}

function createClaimBoundaries(draft: ModelSchemaDefinition, futureOnlyGaps: readonly ScenarioGap[]): string[] {
  const boundaries = [
    "Do not claim the scenario plan is runnable, validated, calibrated, policy-ready, or scientifically proven.",
    "Do not treat candidate questions as forecasts or validated conclusions.",
    "Do not treat conceptual interventions as executable controls or optimized interventions.",
    "Do not treat suggested metrics as empirical measurements or causal evidence.",
    "Do not treat scenario plans as medical, public-health, weather, operational, or real-human-behavior predictions.",
    "Do not treat scenario planning as policy recommendation, persuasion optimization, targeting logic, or gambling assistance.",
    "Do not infer real-person traits, protected classes, psychological diagnoses, beliefs, intentions, or preferences.",
    "Do not make Builder graphs executable or Model Schemas runnable from scenario planning.",
    schemaScenarioPlanningNeuralCopy,
    schemaScenarioPlanningMr0Copy
  ];
  if (hasBlackjackText(draft) || futureOnlyGaps.some((gap) => gap.label.toLowerCase().includes("blackjack"))) {
    boundaries.push(schemaScenarioPlanningBlackjackCopy);
  }
  if (hasForestFireText(draft)) {
    boundaries.push("Do not describe abstract landscape-spread planning as wildfire prediction, GIS, weather, suppression, or calibrated fire behavior.");
  }
  return boundaries;
}

function createNextModelingSteps(
  fitAvailable: boolean,
  unsupportedOrLossyGaps: readonly ScenarioGap[],
  futureOnlyGaps: readonly ScenarioGap[]
): string[] {
  const steps = [
    "Clarify model assumptions and write limitation notes before interpreting any future output.",
    "Define parameter ranges, units where relevant, and data provenance.",
    "Add or refine metrics that would be observable if a future runtime exists.",
    "Plan sensitivity analysis conceptually without executing or optimizing a policy."
  ];
  if (!fitAvailable) {
    steps.unshift("Refresh or create a fit report to add template-linked structural context.");
  }
  if (unsupportedOrLossyGaps.length > 0) {
    steps.push("Resolve unsupported, lossy, and runtime-gap concepts before scoping runtime implementation.");
  }
  if (futureOnlyGaps.length > 0) {
    steps.push("Keep MR0 roadmap concepts in future-only notes until dedicated implementation and audit prompts exist.");
  }
  steps.push("Choose a candidate template family only as a future implementation discussion, not as conversion.");
  return steps;
}

function classifyConfidence(
  draft: ModelSchemaDefinition,
  counts: SchemaScenarioPlanCounts,
  fitReport: SchemaTemplateFitReportUxModel | null
): ScenarioPlanningConfidence {
  const structureCount =
    activeEntities(draft).length +
    activeParameters(draft).length +
    activeMetrics(draft).length +
    activeRules(draft).length +
    activeSpaces(draft).length;
  if (structureCount < 2 || counts.candidateQuestions === 0) {
    return "insufficient-structure";
  }
  if (fitReport?.available && counts.templatePlanningLinks > 0 && counts.observableMetrics > 0 && counts.parameterFamilies > 0 && counts.unsupportedOrLossyGaps <= 4) {
    return "high-structure";
  }
  if ((fitReport?.available || counts.observableMetrics > 0) && counts.candidateQuestions > 1) {
    return "medium-structure";
  }
  return "low-structure";
}

function summarizePlan(
  draft: ModelSchemaDefinition,
  confidence: ScenarioPlanningConfidence,
  counts: SchemaScenarioPlanCounts,
  fitAvailable: boolean
): string {
  const schemaName = draft.name || draft.id || "Untitled schema";
  const fitPhrase = fitAvailable ? "with current non-stale fit-report context" : "without template-linked fit context";
  return `${schemaName} has ${confidence} planning support ${fitPhrase}. The report lists ${counts.candidateQuestions} study questions, ${counts.conceptualInterventions} conceptual levers, ${counts.observableMetrics} observable-metric ideas, and ${counts.unsupportedOrLossyGaps + counts.futureOnlyGaps} visible gaps. It remains non-runnable planning.`;
}

function questionForRuleKind(kind: ModelRuleKind, label: string): string {
  switch (kind) {
    case "interaction":
      return `How should ${label} vary under different local interaction assumptions?`;
    case "movement":
      return `How should ${label} affect spatial pattern summaries if a future runtime implements movement?`;
    case "networkUpdate":
      return `How would fixed versus adaptive network assumptions change outcomes related to ${label}?`;
    case "resourceFlow":
      return `How would bounded versus scarce resources change model-output summaries related to ${label}?`;
    case "eventEmission":
      return `How would event timing assumptions change the patterns associated with ${label}?`;
    case "feedbackAdjustment":
      return `Which feedback assumptions around ${label} need tests before causal language is allowed?`;
    case "observation":
      return `Which proxy or measurement assumptions around ${label} would limit interpretation?`;
    case "controlPolicy":
      return `Which policy-like assumptions around ${label} should be documented without treating them as recommendations?`;
    case "aggregation":
    case "disaggregation":
      return `What information would be lost or synthesized by ${label} across scales?`;
    case "socialLearning":
    case "memoryUpdate":
    case "beliefUpdate":
      return `Which bounded symbolic assumptions around ${label} are being studied without claiming human cognition?`;
    default:
      return `What study question does ${label} suggest, and which runtime support would be required before testing it?`;
  }
}

function parameterFamilyFor(parameter: ParameterDeclaration): { id: string; label: string; description: string } {
  const text = `${parameter.id} ${parameter.label} ${parameter.rangeDescription ?? ""} ${parameter.defaultValueDescription ?? ""}`.toLowerCase();
  if (/\b(rate|probability|chance|infection|recovery|birth|death|contact|spread|decay)\b/.test(text)) {
    return { id: "rate", label: "Rate parameters", description: "Rate-like levers that would need baseline estimates and sensitivity ranges." };
  }
  if (/\b(threshold|tolerance|resistance|activation|cutoff)\b/.test(text)) {
    return { id: "threshold", label: "Threshold parameters", description: "Threshold-like levers that can change transition or activation behavior." };
  }
  if (/\b(delay|duration|cooldown|refractory|lag|wait)\b/.test(text)) {
    return { id: "delay", label: "Delay parameters", description: "Timing levers that require explicit model-time semantics." };
  }
  if (/\b(radius|distance|speed|movement|position|neighborhood|alignment|cohesion|separation)\b/.test(text)) {
    return { id: "spatial", label: "Spatial parameters", description: "Spatial or movement levers that require template-owned runtime support." };
  }
  if (/\b(network|degree|density|link|edge|contact|social)\b/.test(text)) {
    return { id: "network", label: "Network parameters", description: "Topology or contact levers that must not be confused with causal edges." };
  }
  if (/\b(noise|random|stochastic|seed)\b/.test(text)) {
    return { id: "noise", label: "Noise/stochasticity parameters", description: "Stochasticity levers that require seeded, deterministic runtime handling." };
  }
  if (/\b(resource|stock|flow|capacity|availability|budget)\b/.test(text)) {
    return { id: "resource", label: "Resource parameters", description: "Resource-like levers that remain conceptual unless a template executes resource logic." };
  }
  if (/\b(intervention|control|policy|strategy)\b/.test(text)) {
    return { id: "intervention", label: "Intervention parameters", description: "Policy-like levers that are conceptual only and not recommendations." };
  }
  return { id: "general", label: "General parameters", description: "General schema parameters that need modeling intent and bounded ranges." };
}

function parameterFamilyOrder(id: string): number {
  return ["rate", "threshold", "delay", "spatial", "network", "noise", "resource", "intervention", "general"].indexOf(id);
}

function activeEntities(draft: ModelSchemaDefinition) {
  return draft.entityTypes.filter((item) => item.active);
}

function activeParameters(draft: ModelSchemaDefinition): ParameterDeclaration[] {
  return [...(draft.parameters ?? [])].filter((item) => item.active);
}

function activeMetrics(draft: ModelSchemaDefinition): MetricDeclaration[] {
  return [...(draft.metrics ?? [])].filter((item) => item.active);
}

function activeRules(draft: ModelSchemaDefinition) {
  return [...(draft.ruleDeclarations ?? [])].filter((item) => item.active);
}

function activeSpaces(draft: ModelSchemaDefinition) {
  return [...(draft.spaces ?? [])].filter((item) => item.active);
}

function activeArtifactReferences(draft: ModelSchemaDefinition): ModelArtifactReference[] {
  return [...(draft.artifactReferences ?? [])].filter((item) => item.active);
}

function hasRateParameter(draft: ModelSchemaDefinition): boolean {
  return activeParameters(draft).some((parameter) => parameterFamilyFor(parameter).id === "rate");
}

function hasNetworkStructure(draft: ModelSchemaDefinition): boolean {
  return (
    activeSpaces(draft).some((space) => space.spaceKind === "network" || Boolean(space.networkDefinitionId)) ||
    activeRules(draft).some((rule) => rule.ruleKind === "networkUpdate") ||
    activeArtifactReferences(draft).some((artifact) => artifact.primitiveId === "networks" || artifact.artifactType.toLowerCase().includes("network"))
  );
}

function hasLocalInteraction(draft: ModelSchemaDefinition): boolean {
  return activeRules(draft).some((rule) => rule.ruleKind === "interaction" || rule.ruleKind === "movement") || activeSpaces(draft).some((space) => space.spaceKind === "grid2d" || space.spaceKind === "continuous2d");
}

function hasEnvironmentStructure(draft: ModelSchemaDefinition): boolean {
  return activeSpaces(draft).some((space) => space.spaceKind === "field" || space.spaceKind === "multiscale" || Boolean(space.boundaryModelId) || Boolean(space.fieldLayerId));
}

function hasSocialCognitiveStructure(draft: ModelSchemaDefinition): boolean {
  return (
    activeRules(draft).some((rule) => rule.ruleKind === "socialLearning" || rule.ruleKind === "memoryUpdate" || rule.ruleKind === "beliefUpdate") ||
    (draft.componentTypes ?? []).some((component) => component.active && ["belief", "memory"].includes(component.componentKind))
  );
}

function hasBlackjackText(draft: ModelSchemaDefinition): boolean {
  return JSON.stringify(draft).toLowerCase().includes("blackjack");
}

function hasForestFireText(draft: ModelSchemaDefinition): boolean {
  const text = JSON.stringify(draft).toLowerCase();
  return text.includes("forest fire") || text.includes("wildfire") || text.includes("landscape spread");
}

function displayName(item: { id: string; label: string }): string {
  return item.label || item.id;
}

function addAssumption(
  checks: ScenarioAssumptionCheck[],
  id: string,
  assumption: string,
  whyItMatters: string,
  clarify: string,
  sectionId: ModelSchemaAuthoringSectionId
) {
  addUnique(checks, { id: `assumption:${id}`, assumption, whyItMatters, clarify, sectionId }, (item) => item.id);
}

function addDataNeed(
  needs: ScenarioDataNeed[],
  id: string,
  need: string,
  whyItMatters: string,
  limitation: string,
  sectionId: ModelSchemaAuthoringSectionId
) {
  addUnique(needs, { id: `data:${id}`, need, whyItMatters, limitation, sectionId }, (item) => item.id);
}

function addUnique<T>(items: T[], item: T, keyOf: (item: T) => string) {
  const key = keyOf(item).toLowerCase();
  if (items.some((existing) => keyOf(existing).toLowerCase() === key)) {
    return;
  }
  items.push(item);
}

function appendReportSection(lines: string[], title: string, items: readonly string[]) {
  lines.push("", `${title}:`);
  if (items.length === 0) {
    lines.push("- None listed.");
    return;
  }
  for (const item of items) {
    lines.push(`- ${item}`);
  }
}

function emptyCounts(): SchemaScenarioPlanCounts {
  return {
    candidateQuestions: 0,
    conceptualInterventions: 0,
    observableMetrics: 0,
    parameterFamilies: 0,
    assumptionChecks: 0,
    dataNeeds: 0,
    unsupportedOrLossyGaps: 0,
    futureOnlyGaps: 0,
    templatePlanningLinks: 0
  };
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

function boundText(value: string): string {
  if (value.length <= maxReportLength) {
    return value;
  }
  return `${value.slice(0, maxReportLength - 120)}\n\n[Report truncated to keep the copied planning report bounded.]\n`;
}

function hashText(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
