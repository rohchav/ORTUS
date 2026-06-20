import type { ModelSchemaDefinition } from "../../../simulation/modelSchema";
import {
  createCompatibilityReport,
  createDefaultTemplateMappingProfiles,
  summarizeSchemaTemplateCompatibility,
  type MappingStatus,
  type SchemaConceptMapping,
  type TemplateCompatibilityResult,
  type TemplateMappingProfile,
  type UnsupportedSchemaConcept
} from "../../../simulation/schemaTemplateCompatibility";
import type { ModelSchemaAuthoringSectionId } from "../modelSchemaAuthoring";

export const schemaTemplateFitReportInvalidState =
  "Fit report unavailable: the current schema must be structurally valid before ORTUS can compare it to runtime templates.";

export const schemaTemplateFitReportEmptyState = "No template mapping profiles are available. This does not make the schema invalid.";

export const schemaTemplateFitReportCurrentDraftSource = "Fit report generated from current structurally valid draft.";

export const schemaTemplateFitReportStalePhrase =
  "This fit report may be stale because the schema changed after it was generated. Refresh the report before using it.";

export const schemaTemplateFitReportWeakFitPhrase =
  "Weak fit means existing templates do not structurally cover much of this schema. It does not mean the schema is wrong.";

export const schemaTemplateFitReportBoundaryPhrases = [
  "Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models.",
  "A strong template fit does not mean a schema can run.",
  "Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents.",
  "Unsupported and lossy mappings must remain visible; they must not be silently dropped.",
  "Rule fits are structural comparisons. Rule declarations are not executed.",
  "Fit score is a structural summary, not a runtime readiness score.",
  "Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles.",
  "Builder graphs remain structural inspection views. Fit reports do not make them executable.",
  "Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability.",
  "MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report."
] as const;

const validationDistinctionPhrase = schemaTemplateFitReportBoundaryPhrases[6];
const ruleBoundaryPhrase = schemaTemplateFitReportBoundaryPhrases[4];
const graphBoundaryPhrase = schemaTemplateFitReportBoundaryPhrases[7];
const neuralBoundaryPhrase = schemaTemplateFitReportBoundaryPhrases[8];
const mr0BoundaryPhrase = schemaTemplateFitReportBoundaryPhrases[9];
const scoreBoundaryPhrase = schemaTemplateFitReportBoundaryPhrases[5];

export type SchemaTemplateFitLevel = "strong" | "moderate" | "partial" | "weak" | "unsupported";
export type SchemaTemplateFitConceptGroup = "matched" | "partial" | "unsupported" | "lossy" | "futureOnly" | "runtimeGap";
export type SchemaTemplateFitConceptSeverity = "info" | "warning" | "critical";

export interface SchemaTemplateFitConcept {
  id: string;
  label: string;
  group: SchemaTemplateFitConceptGroup;
  severity: SchemaTemplateFitConceptSeverity;
  schemaPath: string;
  sectionId: ModelSchemaAuthoringSectionId;
  templateConceptLabel: string;
  explanation: string;
  notes: readonly string[];
}

export interface SchemaTemplateFitCandidate {
  id: string;
  templateId: string;
  templateName: string;
  templateVersion: string;
  fit: TemplateCompatibilityResult["fit"];
  fitLevel: SchemaTemplateFitLevel;
  score: number;
  scoreLabel: string;
  summary: string;
  matchedConcepts: readonly SchemaTemplateFitConcept[];
  partialConcepts: readonly SchemaTemplateFitConcept[];
  unsupportedConcepts: readonly SchemaTemplateFitConcept[];
  lossyConcepts: readonly SchemaTemplateFitConcept[];
  futureOnlyConcepts: readonly SchemaTemplateFitConcept[];
  runtimeGaps: readonly SchemaTemplateFitConcept[];
  warnings: readonly string[];
  assumptions: readonly string[];
  caveats: readonly string[];
}

export interface SchemaTemplateFitTotals {
  mapped: number;
  partial: number;
  unsupported: number;
  lossy: number;
  futureOnly: number;
  runtimeGaps: number;
}

export interface SchemaTemplateFitReportUxModel {
  available: boolean;
  disabledReason: string | null;
  stale: boolean;
  staleReason: string | null;
  sourceDescription: string;
  sourceStatus: string;
  sourceSchemaId: string | null;
  sourceSchemaName: string | null;
  generatedDescription: string | null;
  templateProfileCount: number;
  candidateCount: number;
  strongestFitLevel: SchemaTemplateFitLevel | "none";
  strongestTemplateLabel: string;
  overallFit: TemplateCompatibilityResult["fit"] | "none";
  totals: SchemaTemplateFitTotals;
  candidates: readonly SchemaTemplateFitCandidate[];
  boundaryPhrases: readonly string[];
  validationDistinction: string;
  ruleBoundaryPhrase: string;
  graphBoundaryPhrase: string;
  neuralBoundaryPhrase: string;
  mr0BoundaryPhrase: string;
  scoreBoundaryPhrase: string;
  weakFitPhrase: string;
  emptyState: string | null;
  diagnostics: string;
}

export interface SchemaTemplateFitReportSnapshot {
  draftHash: string;
  ux: SchemaTemplateFitReportUxModel;
}

interface CreateFitReportOptions {
  profiles?: readonly TemplateMappingProfile[];
}

const fitLevelRank: Record<SchemaTemplateFitLevel, number> = {
  strong: 4,
  moderate: 3,
  partial: 2,
  weak: 1,
  unsupported: 0
};

export function createSchemaTemplateFitReportUxModel(
  draft: ModelSchemaDefinition,
  structurallyValid: boolean,
  options: CreateFitReportOptions = {}
): SchemaTemplateFitReportUxModel {
  if (!structurallyValid) {
    return createUnavailableModel(draft, schemaTemplateFitReportInvalidState);
  }

  const profiles = options.profiles ?? createDefaultTemplateMappingProfiles();
  if (profiles.length === 0) {
    const model: SchemaTemplateFitReportUxModel = {
      available: true,
      disabledReason: null,
      stale: false,
      staleReason: null,
      sourceDescription: schemaTemplateFitReportCurrentDraftSource,
      sourceStatus: "Current valid draft",
      sourceSchemaId: draft.id,
      sourceSchemaName: draft.name,
      generatedDescription: "No template profiles were compared.",
      templateProfileCount: 0,
      candidateCount: 0,
      strongestFitLevel: "none",
      strongestTemplateLabel: "None",
      overallFit: "none",
      totals: emptyTotals(),
      candidates: [],
      boundaryPhrases: schemaTemplateFitReportBoundaryPhrases,
      validationDistinction: validationDistinctionPhrase,
      ruleBoundaryPhrase,
      graphBoundaryPhrase,
      neuralBoundaryPhrase,
      mr0BoundaryPhrase,
      scoreBoundaryPhrase,
      weakFitPhrase: schemaTemplateFitReportWeakFitPhrase,
      emptyState: schemaTemplateFitReportEmptyState,
      diagnostics: ""
    };
    return { ...model, diagnostics: formatSchemaTemplateFitDiagnostics(model) };
  }

  try {
    const report = createCompatibilityReport(draft, profiles);
    const summary = summarizeSchemaTemplateCompatibility(report);
    const mr0Concepts = detectFutureRoadmapConcepts(draft);
    const candidates = [...report.templateResults].map((result) => createCandidate(result, mr0Concepts)).sort(compareCandidates);
    const strongest = candidates[0];
    const model: SchemaTemplateFitReportUxModel = {
      available: true,
      disabledReason: null,
      stale: false,
      staleReason: null,
      sourceDescription: schemaTemplateFitReportCurrentDraftSource,
      sourceStatus: "Current valid draft",
      sourceSchemaId: report.modelSchemaId,
      sourceSchemaName: report.modelSchemaName,
      generatedDescription: report.generatedAtDescription ?? "Deterministic structural analysis.",
      templateProfileCount: profiles.length,
      candidateCount: candidates.length,
      strongestFitLevel: strongest?.fitLevel ?? "none",
      strongestTemplateLabel: strongest ? `${strongest.templateName} (${strongest.templateId})` : "None",
      overallFit: summary.bestFit,
      totals: totalConcepts(candidates),
      candidates,
      boundaryPhrases: schemaTemplateFitReportBoundaryPhrases,
      validationDistinction: validationDistinctionPhrase,
      ruleBoundaryPhrase,
      graphBoundaryPhrase,
      neuralBoundaryPhrase,
      mr0BoundaryPhrase,
      scoreBoundaryPhrase,
      weakFitPhrase: schemaTemplateFitReportWeakFitPhrase,
      emptyState: null,
      diagnostics: ""
    };
    return { ...model, diagnostics: formatSchemaTemplateFitDiagnostics(model) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown compatibility-service error.";
    return createUnavailableModel(draft, `Fit report unavailable: ${message}`);
  }
}

export function createSchemaTemplateFitReportSnapshot(
  draft: ModelSchemaDefinition,
  structurallyValid: boolean,
  options: CreateFitReportOptions = {}
): SchemaTemplateFitReportSnapshot {
  return {
    draftHash: getSchemaTemplateFitReportDraftHash(draft),
    ux: createSchemaTemplateFitReportUxModel(draft, structurallyValid, options)
  };
}

export function resolveSchemaTemplateFitReportUxModel(
  draft: ModelSchemaDefinition,
  structurallyValid: boolean,
  snapshot: SchemaTemplateFitReportSnapshot | null,
  options: CreateFitReportOptions = {}
): SchemaTemplateFitReportUxModel {
  if (!structurallyValid) {
    return createSchemaTemplateFitReportUxModel(draft, false, options);
  }
  if (!snapshot) {
    return createSchemaTemplateFitReportUxModel(draft, true, options);
  }
  if (snapshot.draftHash !== getSchemaTemplateFitReportDraftHash(draft)) {
    return markSchemaTemplateFitReportStale(snapshot.ux);
  }
  return snapshot.ux;
}

export function markSchemaTemplateFitReportStale(model: SchemaTemplateFitReportUxModel): SchemaTemplateFitReportUxModel {
  const staleModel: SchemaTemplateFitReportUxModel = {
    ...model,
    stale: true,
    staleReason: schemaTemplateFitReportStalePhrase,
    sourceDescription: schemaTemplateFitReportStalePhrase,
    sourceStatus: "Stale report; refresh required before use"
  };
  return { ...staleModel, diagnostics: formatSchemaTemplateFitDiagnostics(staleModel) };
}

export function getSchemaTemplateFitReportDraftHash(draft: ModelSchemaDefinition): string {
  return hashText(JSON.stringify(draft));
}

export function formatSchemaTemplateFitDiagnostics(model: SchemaTemplateFitReportUxModel): string {
  const lines = [
    "Schema-to-Template Fit Report V1",
    `Source: ${model.sourceDescription}`,
    `Source status: ${model.sourceStatus}`,
    `Stale: ${model.stale ? "yes" : "no"}`,
    `Schema: ${model.sourceSchemaName ?? "unknown"} (${model.sourceSchemaId ?? "unknown"})`,
    `Generated: ${model.generatedDescription ?? "not generated"}`,
    `Template profiles compared: ${model.templateProfileCount}`,
    `Candidate count: ${model.candidateCount}`,
    `Strongest fit: ${model.strongestTemplateLabel}`,
    `Overall fit: ${model.overallFit}`,
    `Totals: mapped ${model.totals.mapped}, partial ${model.totals.partial}, unsupported ${model.totals.unsupported}, lossy ${model.totals.lossy}, future-only ${model.totals.futureOnly}, runtime gaps ${model.totals.runtimeGaps}`,
    "",
    "Boundaries:",
    ...model.boundaryPhrases.map((phrase) => `- ${phrase}`)
  ];

  if (model.staleReason) {
    lines.push("", `Stale warning: ${model.staleReason}`);
  }
  if (model.disabledReason) {
    lines.push("", `Unavailable: ${model.disabledReason}`);
  }
  if (model.emptyState) {
    lines.push("", `Empty state: ${model.emptyState}`);
  }

  for (const candidate of model.candidates) {
    lines.push(
      "",
      `${candidate.templateName} (${candidate.templateId})`,
      `- Fit: ${candidate.fit} (${candidate.fitLevel})`,
      `- Score: ${candidate.scoreLabel}`,
      `- Summary: ${candidate.summary}`,
      `- Matched: ${candidate.matchedConcepts.length}`,
      `- Partial: ${candidate.partialConcepts.length}`,
      `- Unsupported: ${candidate.unsupportedConcepts.length}`,
      `- Lossy: ${candidate.lossyConcepts.length}`,
      `- Future-only: ${candidate.futureOnlyConcepts.length}`,
      `- Runtime gaps: ${candidate.runtimeGaps.length}`
    );
    appendConceptLines(lines, "Unsupported concepts", candidate.unsupportedConcepts);
    appendConceptLines(lines, "Lossy mappings", candidate.lossyConcepts);
    appendConceptLines(lines, "Future-only gaps", candidate.futureOnlyConcepts);
    appendConceptLines(lines, "Runtime gaps", candidate.runtimeGaps);
  }

  return `${lines.join("\n")}\n`;
}

function createUnavailableModel(draft: ModelSchemaDefinition, disabledReason: string): SchemaTemplateFitReportUxModel {
  const model: SchemaTemplateFitReportUxModel = {
    available: false,
    disabledReason,
    stale: false,
    staleReason: null,
    sourceDescription: "No fit report generated from an invalid or unavailable draft.",
    sourceStatus: "Unavailable",
    sourceSchemaId: draft.id || null,
    sourceSchemaName: draft.name || null,
    generatedDescription: null,
    templateProfileCount: 0,
    candidateCount: 0,
    strongestFitLevel: "none",
    strongestTemplateLabel: "None",
    overallFit: "none",
    totals: emptyTotals(),
    candidates: [],
    boundaryPhrases: schemaTemplateFitReportBoundaryPhrases,
    validationDistinction: validationDistinctionPhrase,
    ruleBoundaryPhrase,
    graphBoundaryPhrase,
    neuralBoundaryPhrase,
    mr0BoundaryPhrase,
    scoreBoundaryPhrase,
    weakFitPhrase: schemaTemplateFitReportWeakFitPhrase,
    emptyState: null,
    diagnostics: ""
  };
  return { ...model, diagnostics: formatSchemaTemplateFitDiagnostics(model) };
}

function createCandidate(result: TemplateCompatibilityResult, mr0Concepts: readonly SchemaTemplateFitConcept[]): SchemaTemplateFitCandidate {
  const matchedConcepts = result.mappedConcepts.filter((concept) => concept.status === "mapped").map((concept) => mappedConceptToFitConcept(concept, "matched"));
  const partialConcepts = result.mappedConcepts.filter((concept) => concept.status === "partial").map((concept) => mappedConceptToFitConcept(concept, "partial"));
  const lossyFromMapped = result.mappedConcepts.filter((concept) => concept.status === "lossy").map((concept) => mappedConceptToFitConcept(concept, "lossy"));
  const futureOnlyFromMapped = result.mappedConcepts
    .filter((concept) => concept.status === "futureOnly")
    .map((concept) => mappedConceptToFitConcept(concept, "futureOnly"));
  const futureOnlyFromUnsupported = result.unsupportedConcepts
    .filter((concept) => concept.reason === "futurePrimitive")
    .map((concept) => unsupportedConceptToFitConcept(concept, "futureOnly"));
  const unsupportedConcepts = result.unsupportedConcepts
    .filter((concept) => concept.reason !== "futurePrimitive")
    .map((concept) => unsupportedConceptToFitConcept(concept, "unsupported"));
  const lossyConcepts = [
    ...lossyFromMapped,
    ...result.lossyMappings.map((loss) => ({
      id: `${result.templateId}:loss:${loss.id}`,
      label: `${loss.schemaElementKind} ${loss.schemaElementId}`,
      group: "lossy" as const,
      severity: fitSeverityForLoss(loss.severity),
      schemaPath: schemaPathForKind(loss.schemaElementKind, loss.schemaElementId),
      sectionId: sectionIdForSchemaElementKind(loss.schemaElementKind),
      templateConceptLabel: loss.lossKind,
      explanation: loss.message,
      notes: loss.notes ?? []
    }))
  ];
  const futureOnlyConcepts = [...futureOnlyFromMapped, ...futureOnlyFromUnsupported, ...mr0Concepts.map((concept) => ({ ...concept, id: `${result.templateId}:${concept.id}` }))];
  const runtimeGaps = [
    ...result.requiredRuntimeCapabilities.map((capability, index) => runtimeGapConcept(result.templateId, `required:${index}`, capability)),
    ...result.missingTemplateCapabilities.map((capability, index) => runtimeGapConcept(result.templateId, `missing:${index}`, capability))
  ];

  const fitLevel = fitLevelForResult(result);
  return {
    id: result.id,
    templateId: result.templateId,
    templateName: result.templateName,
    templateVersion: result.templateVersion,
    fit: result.fit,
    fitLevel,
    score: result.score,
    scoreLabel: `${Math.round(result.score * 100)}% structural score`,
    summary: summaryForCandidate(result, fitLevel, unsupportedConcepts.length, lossyConcepts.length, futureOnlyConcepts.length, runtimeGaps.length),
    matchedConcepts,
    partialConcepts,
    unsupportedConcepts,
    lossyConcepts,
    futureOnlyConcepts,
    runtimeGaps,
    warnings: result.warnings,
    assumptions: [
      "Template profile is derived from static production-template metadata.",
      "Reported matches compare declared schema structure with existing template metadata.",
      "Template runtime remains hand-built and is not generated from this fit report."
    ],
    caveats: [
      schemaTemplateFitReportBoundaryPhrases[0],
      schemaTemplateFitReportBoundaryPhrases[1],
      schemaTemplateFitReportBoundaryPhrases[2],
      schemaTemplateFitReportBoundaryPhrases[3],
      scoreBoundaryPhrase
    ]
  };
}

function mappedConceptToFitConcept(concept: SchemaConceptMapping, group: SchemaTemplateFitConceptGroup): SchemaTemplateFitConcept {
  return {
    id: `mapped:${concept.id}`,
    label: concept.schemaElementLabel ?? concept.schemaElementId,
    group,
    severity: group === "matched" ? "info" : group === "lossy" ? "warning" : "info",
    schemaPath: schemaPathForKind(concept.schemaElementKind, concept.schemaElementId),
    sectionId: sectionIdForSchemaElementKind(concept.schemaElementKind),
    templateConceptLabel: concept.templateConceptLabel ?? concept.templateConceptId ?? concept.templateConceptKind,
    explanation: explanationForMappedStatus(concept.status),
    notes: concept.notes ?? []
  };
}

function unsupportedConceptToFitConcept(concept: UnsupportedSchemaConcept, group: "unsupported" | "futureOnly"): SchemaTemplateFitConcept {
  return {
    id: `${group}:${concept.id}`,
    label: concept.schemaElementLabel ?? concept.schemaElementId,
    group,
    severity: group === "futureOnly" ? "warning" : "critical",
    schemaPath: schemaPathForKind(concept.schemaElementKind, concept.schemaElementId),
    sectionId: sectionIdForSchemaElementKind(concept.schemaElementKind),
    templateConceptLabel: concept.primitiveId ?? concept.artifactType ?? concept.reason,
    explanation:
      group === "futureOnly"
        ? "This concept points at unknown, reserved, or future work; the fit report keeps it visible without treating it as implemented."
        : "This concept is not covered by the template profile or currently lacks template runtime support.",
    notes: concept.notes
  };
}

function runtimeGapConcept(templateId: string, id: string, label: string): SchemaTemplateFitConcept {
  return {
    id: `${templateId}:runtime-gap:${id}`,
    label,
    group: "runtimeGap",
    severity: "critical",
    schemaPath: "runtimeCapabilities",
    sectionId: "identity",
    templateConceptLabel: "Missing runtime capability",
    explanation: "This capability would be required before structural fit could become runnable behavior.",
    notes: ["Valid does not mean runnable. Runnable does not mean validated."]
  };
}

function detectFutureRoadmapConcepts(schema: ModelSchemaDefinition): readonly SchemaTemplateFitConcept[] {
  const text = JSON.stringify(schema).toLowerCase();
  return futureRoadmapTerms
    .filter((term) => term.patterns.some((pattern) => pattern.test(text)))
    .map((term) => ({
      id: `future-roadmap:${term.id}`,
      label: term.label,
      group: "futureOnly" as const,
      severity: "warning" as const,
      schemaPath: "roadmapReferences",
      sectionId: term.sectionId,
      templateConceptLabel: "MR0 future-only gap",
      explanation: `${term.label} is a roadmap concept, not a capability implemented by the fit report.`,
      notes: [mr0BoundaryPhrase]
    }));
}

const futureRoadmapTerms: readonly {
  id: string;
  label: string;
  sectionId: ModelSchemaAuthoringSectionId;
  patterns: readonly RegExp[];
}[] = [
  { id: "urban-daily-routine", label: "Urban Daily Routine", sectionId: "notes", patterns: [/\burban daily routine\b/, /\burban routine\b/] },
  {
    id: "activity-choice",
    label: "Activity Choice",
    sectionId: "rules",
    patterns: [/\bactivity choice\b/, /\bactivity-selection\b/, /\bactivity selection\b/]
  },
  {
    id: "atmospheric-field-dynamics",
    label: "Atmospheric Field Dynamics",
    sectionId: "spaces",
    patterns: [/\batmospheric field\b/, /\batmospheric dynamics\b/]
  },
  {
    id: "urban-exposure-resilience",
    label: "Urban Exposure + Resilience",
    sectionId: "metrics",
    patterns: [/\burban exposure\b/, /\bexposure resilience\b/, /\burban resilience\b/]
  },
  {
    id: "decision-clusters",
    label: "Decision Clusters",
    sectionId: "rules",
    patterns: [/\bdecision cluster\b/, /\bdecision clusters\b/, /\bstimulus-conditioned decision\b/]
  },
  {
    id: "observed-cluster-discovery",
    label: "Observed Cluster Discovery",
    sectionId: "metrics",
    patterns: [/\bobserved cluster discovery\b/, /\bcluster discovery\b/]
  },
  {
    id: "cluster-based-decision-readout-generalization",
    label: "Cluster-Based Decision Readout Generalization",
    sectionId: "rules",
    patterns: [/\bcluster-based decision readout\b/, /\bdecision readout generalization\b/]
  },
  {
    id: "stimulus-conditioned-decision-clusters",
    label: "Stimulus-Conditioned Decision Clusters",
    sectionId: "rules",
    patterns: [/\bstimulus-conditioned decision clusters\b/, /\bstimulus conditioned decision clusters\b/]
  },
  {
    id: "blackjack-sequential-decision-lab",
    label: "Blackjack Sequential Decision Lab",
    sectionId: "rules",
    patterns: [/\bblackjack\b/, /\bsequential decision lab\b/]
  }
];

function explanationForMappedStatus(status: MappingStatus): string {
  switch (status) {
    case "mapped":
      return "The schema concept has a direct structural resemblance in the template metadata.";
    case "partial":
      return "The schema concept has a broad structural resemblance, but not an exact template concept.";
    case "lossy":
      return "The schema concept can be compared only with explicit information loss.";
    case "futureOnly":
      return "The schema concept points to future-only structure and is not implemented runtime support.";
    case "unsupported":
      return "The schema concept is not supported by this template profile.";
  }
}

function fitSeverityForLoss(severity: "info" | "warning" | "critical"): SchemaTemplateFitConceptSeverity {
  if (severity === "critical") {
    return "critical";
  }
  if (severity === "warning") {
    return "warning";
  }
  return "info";
}

function fitLevelForResult(result: TemplateCompatibilityResult): SchemaTemplateFitLevel {
  if (result.fit === "strong" || result.fit === "templateExact") {
    return "strong";
  }
  if (result.fit === "partial" && result.score >= 0.6) {
    return "moderate";
  }
  if (result.fit === "partial") {
    return "partial";
  }
  if (result.fit === "weak") {
    return "weak";
  }
  return "unsupported";
}

function summaryForCandidate(
  result: TemplateCompatibilityResult,
  fitLevel: SchemaTemplateFitLevel,
  unsupportedCount: number,
  lossyCount: number,
  futureOnlyCount: number,
  runtimeGapCount: number
): string {
  const base =
    fitLevel === "strong"
      ? "Closest structural resemblance among existing templates."
      : fitLevel === "moderate"
        ? "Moderate structural resemblance, with important gaps still visible."
        : fitLevel === "partial"
          ? "Partial structural resemblance with limited exact coverage."
          : fitLevel === "weak"
            ? schemaTemplateFitReportWeakFitPhrase
            : "No meaningful structural fit was found for this template.";
  return `${base} Unsupported ${unsupportedCount}; lossy ${lossyCount}; future-only ${futureOnlyCount}; runtime gaps ${runtimeGapCount}. Score ${Math.round(
    result.score * 100
  )}% is structural only.`;
}

function compareCandidates(a: SchemaTemplateFitCandidate, b: SchemaTemplateFitCandidate): number {
  return (
    b.score - a.score ||
    compatibilityFitRank(b.fit) - compatibilityFitRank(a.fit) ||
    fitLevelRank[b.fitLevel] - fitLevelRank[a.fitLevel] ||
    a.templateId.localeCompare(b.templateId)
  );
}

function compatibilityFitRank(fit: TemplateCompatibilityResult["fit"]): number {
  switch (fit) {
    case "templateExact":
      return 4;
    case "strong":
      return 3;
    case "partial":
      return 2;
    case "weak":
      return 1;
    case "none":
      return 0;
  }
}

function totalConcepts(candidates: readonly SchemaTemplateFitCandidate[]): SchemaTemplateFitTotals {
  return candidates.reduce(
    (totals, candidate) => ({
      mapped: totals.mapped + candidate.matchedConcepts.length,
      partial: totals.partial + candidate.partialConcepts.length,
      unsupported: totals.unsupported + candidate.unsupportedConcepts.length,
      lossy: totals.lossy + candidate.lossyConcepts.length,
      futureOnly: totals.futureOnly + candidate.futureOnlyConcepts.length,
      runtimeGaps: totals.runtimeGaps + candidate.runtimeGaps.length
    }),
    emptyTotals()
  );
}

function emptyTotals(): SchemaTemplateFitTotals {
  return {
    mapped: 0,
    partial: 0,
    unsupported: 0,
    lossy: 0,
    futureOnly: 0,
    runtimeGaps: 0
  };
}

function schemaPathForKind(kind: string, id: string): string {
  switch (kind) {
    case "entityType":
      return `entityTypes[id=${id}]`;
    case "componentType":
      return `componentTypes[id=${id}]`;
    case "attributeType":
      return `attributeTypes[id=${id}]`;
    case "space":
      return `spaces[id=${id}]`;
    case "parameter":
      return `parameters[id=${id}]`;
    case "metric":
      return `metrics[id=${id}]`;
    case "ruleDeclaration":
      return `ruleDeclarations[id=${id}]`;
    case "artifactReference":
    case "modelReference":
    case "socialLearningDescriptor":
      return `artifactReferences[id=${id}]`;
    default:
      return id;
  }
}

function sectionIdForSchemaElementKind(kind: string): ModelSchemaAuthoringSectionId {
  switch (kind) {
    case "entityType":
      return "entities";
    case "componentType":
      return "components";
    case "attributeType":
      return "attributes";
    case "space":
      return "spaces";
    case "parameter":
      return "parameters";
    case "metric":
      return "metrics";
    case "ruleDeclaration":
      return "rules";
    case "artifactReference":
    case "modelReference":
    case "socialLearningDescriptor":
      return "artifacts";
    default:
      return "identity";
  }
}

function appendConceptLines(lines: string[], title: string, concepts: readonly SchemaTemplateFitConcept[]) {
  if (concepts.length === 0) {
    return;
  }
  lines.push(`- ${title}:`);
  for (const concept of concepts.slice(0, 12)) {
    lines.push(`  - ${concept.label} at ${concept.schemaPath}: ${concept.explanation}`);
  }
  if (concepts.length > 12) {
    lines.push(`  - ${concepts.length - 12} additional items omitted from diagnostics preview.`);
  }
}

function hashText(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return `${Math.abs(hash).toString(36)}:${value.length}`;
}
