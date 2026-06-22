import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { modelSchemaArtifactType, type ModelSchemaDefinition } from "../../../simulation/modelSchema";
import {
  createSchemaTemplateFitReportSnapshot,
  createSchemaTemplateFitReportUxModel,
  resolveSchemaTemplateFitReportUxModel
} from "../fitReport/schemaTemplateFitReportUx";
import {
  createSchemaScenarioPlanSnapshot,
  createSchemaScenarioPlanUxModel,
  resolveSchemaScenarioPlanUxModel,
  schemaScenarioPlanningAssumptionCopy,
  schemaScenarioPlanningBlackjackCopy,
  schemaScenarioPlanningBoundaryPhrases,
  schemaScenarioPlanningDataCopy,
  schemaScenarioPlanningInterventionCopy,
  schemaScenarioPlanningInvalidState,
  schemaScenarioPlanningMetricCopy,
  schemaScenarioPlanningMissingFitPhrase,
  schemaScenarioPlanningMr0Copy,
  schemaScenarioPlanningNeuralCopy,
  schemaScenarioPlanningQuestionCopy,
  schemaScenarioPlanningStaleFitState,
  schemaScenarioPlanningStalePlanState,
  schemaScenarioPlanningVerificationCopy
} from "./schemaScenarioPlanningUx";

const repoRoot = process.cwd();

function validDraft(overrides: Partial<ModelSchemaDefinition> = {}): ModelSchemaDefinition {
  return {
    artifactType: modelSchemaArtifactType,
    id: "planning-schema",
    name: "Planning Schema",
    version: "1.0.0",
    schemaVersion: "1",
    scope: { templateId: "opinion-dynamics" },
    entityTypes: [
      {
        id: "agent",
        label: "Agent",
        entityKind: "agent",
        active: true,
        executable: false
      }
    ],
    componentTypes: [{ id: "opinion", label: "Opinion", componentKind: "belief", active: true, executable: false }],
    attributeTypes: [],
    spaces: [{ id: "contact-network", label: "Contact Network", spaceKind: "network", active: true, executable: false }],
    parameters: [
      {
        id: "influenceRate",
        label: "Influence rate",
        valueKind: "number",
        rangeDescription: "0 to 1",
        active: true,
        executable: false
      },
      {
        id: "toleranceThreshold",
        label: "Tolerance threshold",
        valueKind: "number",
        rangeDescription: "0 to 1",
        active: true,
        executable: false
      }
    ],
    metrics: [{ id: "polarization", label: "Polarization", metricKind: "distribution", active: true, executable: false }],
    ruleDeclarations: [
      {
        id: "bounded-influence",
        label: "Bounded influence",
        ruleKind: "socialLearning",
        sourceEntityTypeIds: ["agent"],
        parameterIds: ["influenceRate"],
        metricIds: ["polarization"],
        ruleDescription: "Structural only; this is not executed.",
        active: true,
        executable: false
      }
    ],
    artifactReferences: [],
    assumptionNotes: [],
    limitationNotes: [],
    validationNotes: [],
    metadata: {},
    ...overrides
  };
}

describe("schema scenario planning UX model", () => {
  it("stays unavailable for structurally invalid schemas with the required disabled state", () => {
    const draft = validDraft({ id: "" });
    const ux = createSchemaScenarioPlanUxModel(draft, false, null);

    expect(ux.available).toBe(false);
    expect(ux.disabledReason).toBe(schemaScenarioPlanningInvalidState);
    expect(ux.planningConfidence).toBe("insufficient-structure");
    expect(ux.reportText).toContain(schemaScenarioPlanningInvalidState);
    expect(ux.boundaryPhrases).toEqual(schemaScenarioPlanningBoundaryPhrases);
  });

  it("produces a deterministic non-runnable planning report for a valid schema and fresh fit report", () => {
    const draft = validDraft();
    const fitReport = createSchemaTemplateFitReportUxModel(draft, true);
    const first = createSchemaScenarioPlanUxModel(draft, true, fitReport);
    const second = createSchemaScenarioPlanUxModel(draft, true, fitReport);

    expect(first.available).toBe(true);
    expect(first.fitReportStatus).toBe("fresh");
    expect(first.planningConfidence).not.toBe("insufficient-structure");
    expect(first.candidateQuestions.length).toBeGreaterThan(0);
    expect(first.conceptualInterventions.length).toBeGreaterThan(0);
    expect(first.observableMetrics.length).toBeGreaterThan(0);
    expect(first.parameterFamilies.map((family) => family.label)).toEqual(expect.arrayContaining(["Rate parameters", "Threshold parameters"]));
    expect(first.assumptionChecks.map((check) => check.assumption)).toContain("Social/cognitive descriptor bounds");
    expect(first.dataNeeds.map((need) => need.need)).toContain("Validation metrics");
    expect(first.reportText).toBe(second.reportText);
    for (const phrase of [
      ...schemaScenarioPlanningBoundaryPhrases,
      schemaScenarioPlanningQuestionCopy,
      schemaScenarioPlanningInterventionCopy,
      schemaScenarioPlanningMetricCopy,
      schemaScenarioPlanningDataCopy,
      schemaScenarioPlanningAssumptionCopy,
      schemaScenarioPlanningVerificationCopy,
      schemaScenarioPlanningNeuralCopy,
      schemaScenarioPlanningMr0Copy,
      schemaScenarioPlanningBlackjackCopy
    ]) {
      expect(first.reportText).toContain(phrase);
    }
    expect(first.reportText).not.toContain("ready to run");
    expect(first.reportText).not.toContain("recommended policy");
  });

  it("handles missing fit report context without pretending template readiness", () => {
    const ux = createSchemaScenarioPlanUxModel(validDraft(), true, null);

    expect(ux.available).toBe(true);
    expect(ux.fitReportStatus).toBe("missing");
    expect(ux.fitReportStatusDescription).toBe(schemaScenarioPlanningMissingFitPhrase);
    expect(ux.templatePlanningLinks).toHaveLength(0);
    expect(ux.candidateQuestions.length).toBeGreaterThan(0);
    expect(ux.reportText).toContain(schemaScenarioPlanningMissingFitPhrase);
  });

  it("disables planning for stale fit reports instead of silently using old fit context", () => {
    const draft = validDraft();
    const fitSnapshot = createSchemaTemplateFitReportSnapshot(draft, true);
    const editedDraft = { ...draft, name: "Edited Planning Schema" };
    const staleFitReport = resolveSchemaTemplateFitReportUxModel(editedDraft, true, fitSnapshot);
    const ux = createSchemaScenarioPlanUxModel(editedDraft, true, staleFitReport);

    expect(staleFitReport.stale).toBe(true);
    expect(ux.available).toBe(false);
    expect(ux.stale).toBe(true);
    expect(ux.disabledReason).toBe(schemaScenarioPlanningStaleFitState);
    expect(ux.reportText).toContain(schemaScenarioPlanningStaleFitState);
  });

  it("marks an old planning snapshot stale when the schema changes before refresh", () => {
    const oldDraft = validDraft({
      parameters: [{ id: "infectionRate", label: "Infection rate", valueKind: "number", active: true, executable: false }],
      metrics: [{ id: "peakInfected", label: "Peak infected", metricKind: "count", active: true, executable: false }]
    });
    const oldFit = createSchemaTemplateFitReportUxModel(oldDraft, true);
    const oldSnapshot = createSchemaScenarioPlanSnapshot(oldDraft, true, oldFit);
    const nextDraft = validDraft({
      parameters: [{ id: "recoveryRate", label: "Recovery rate", valueKind: "number", active: true, executable: false }],
      metrics: [{ id: "outbreakDuration", label: "Outbreak duration", metricKind: "count", active: true, executable: false }]
    });
    const nextFit = createSchemaTemplateFitReportUxModel(nextDraft, true);
    const resolved = resolveSchemaScenarioPlanUxModel(nextDraft, true, nextFit, oldSnapshot);

    expect(resolved.available).toBe(false);
    expect(resolved.stale).toBe(true);
    expect(resolved.disabledReason).toBe(schemaScenarioPlanningStalePlanState);
    expect(resolved.reportText).toContain(schemaScenarioPlanningStalePlanState);
    expect(resolved.reportText).not.toContain("Peak infected");

    const refreshedSnapshot = createSchemaScenarioPlanSnapshot(nextDraft, true, nextFit);
    const refreshed = resolveSchemaScenarioPlanUxModel(nextDraft, true, nextFit, refreshedSnapshot);
    expect(refreshed.available).toBe(true);
    expect(refreshed.reportText).toContain("Recovery rate");
    expect(refreshed.reportText).toContain("Outbreak duration");
    expect(refreshed.reportText).not.toContain("Peak infected");
  });

  it("marks a planning snapshot stale when the fit-report source changes before refresh", () => {
    const draft = validDraft();
    const fitReport = createSchemaTemplateFitReportUxModel(draft, true);
    const snapshot = createSchemaScenarioPlanSnapshot(draft, true, fitReport);
    const changedFitReport = {
      ...fitReport,
      diagnostics: `${fitReport.diagnostics}\nAdditional audit-only fit diagnostic.`
    };
    const stale = resolveSchemaScenarioPlanUxModel(draft, true, changedFitReport, snapshot);

    expect(stale.available).toBe(false);
    expect(stale.stale).toBe(true);
    expect(stale.disabledReason).toBe(schemaScenarioPlanningStalePlanState);
    expect(stale.fitReportStatus).toBe("fresh");
    expect(stale.reportText).toContain("stored scenario plan was generated from different inputs");

    const refreshedSnapshot = createSchemaScenarioPlanSnapshot(draft, true, changedFitReport);
    const refreshed = resolveSchemaScenarioPlanUxModel(draft, true, changedFitReport, refreshedSnapshot);
    expect(refreshed.available).toBe(true);
    expect(refreshed.reportText).toContain("Planning Schema");
  });

  it("preserves unsupported, lossy, runtime, MR0, neural, and blackjack boundaries as planning gaps", () => {
    const draft = validDraft({
      scope: { templateId: "neural-excitation-network" },
      description:
        "Urban exposure resilience, cluster-based decision readout generalization, stimulus-conditioned decision clusters, observed cluster discovery, and blackjack sequential decision lab are future roadmap ideas.",
      spaces: [
        { id: "atmospheric-field", label: "Atmospheric Field", spaceKind: "field", active: true, executable: false },
        { id: "network-space", label: "Network Space", spaceKind: "network", active: true, executable: false }
      ],
      artifactReferences: [
        {
          id: "future-cluster",
          label: "Future Cluster Artifact",
          artifactType: "ortus.futureDecisionCluster",
          artifactId: "future-1",
          role: "futureRuntimeDependency",
          active: true,
          executable: false
        }
      ]
    });
    const fitReport = createSchemaTemplateFitReportUxModel(draft, true);
    const ux = createSchemaScenarioPlanUxModel(draft, true, fitReport);
    const gapText = [...ux.unsupportedOrLossyGaps, ...ux.futureOnlyGaps].map((gap) => `${gap.label} ${gap.explanation}`).join(" ");

    expect(ux.unsupportedOrLossyGaps.length).toBeGreaterThan(0);
    expect(ux.futureOnlyGaps.length).toBeGreaterThan(0);
    expect(gapText).toContain("Urban Exposure + Resilience");
    expect(gapText).toContain("Cluster-Based Decision Readout Generalization");
    expect(gapText).toContain("Stimulus-Conditioned Decision Clusters");
    expect(gapText).toContain("Observed Cluster Discovery");
    expect(gapText).toContain("Blackjack");
    expect(ux.claimBoundaries).toContain(schemaScenarioPlanningNeuralCopy);
    expect(ux.claimBoundaries).toContain(schemaScenarioPlanningMr0Copy);
    expect(ux.claimBoundaries).toContain(schemaScenarioPlanningBlackjackCopy);
  });

  it("bounds copied report length and does not mutate the input schema or fit report", () => {
    const draft = validDraft({
      parameters: Array.from({ length: 40 }, (_, index) => ({
        id: `rate${index}`,
        label: `Rate ${index}`,
        valueKind: "number" as const,
        active: true,
        executable: false as const
      })),
      metrics: Array.from({ length: 40 }, (_, index) => ({
        id: `metric${index}`,
        label: `Metric ${index}`,
        metricKind: "count" as const,
        active: true,
        executable: false as const
      }))
    });
    const fitReport = createSchemaTemplateFitReportUxModel(draft, true);
    const draftBefore = JSON.stringify(draft);
    const fitBefore = JSON.stringify(fitReport);
    const ux = createSchemaScenarioPlanUxModel(draft, true, fitReport);

    expect(ux.candidateQuestions.length).toBeLessThanOrEqual(8);
    expect(ux.conceptualInterventions.length).toBeLessThanOrEqual(8);
    expect(ux.observableMetrics.length).toBeLessThanOrEqual(8);
    expect(ux.reportText.length).toBeLessThanOrEqual(18_200);
    expect(JSON.stringify(draft)).toBe(draftBefore);
    expect(JSON.stringify(fitReport)).toBe(fitBefore);
  });

  it("returns bounded serializable data without functions or old output in stale reports", () => {
    const draft = validDraft();
    const fitReport = createSchemaTemplateFitReportUxModel(draft, true);
    const ux = createSchemaScenarioPlanUxModel(draft, true, fitReport);
    const snapshot = createSchemaScenarioPlanSnapshot(draft, true, fitReport);
    const changedDraft = validDraft({
      metrics: [{ id: "newMetric", label: "New metric", metricKind: "count", active: true, executable: false }]
    });
    const stale = resolveSchemaScenarioPlanUxModel(changedDraft, true, createSchemaTemplateFitReportUxModel(changedDraft, true), snapshot);

    expectNoFunctions(ux);
    expectNoFunctions(stale);
    expect(JSON.stringify(ux)).toContain("candidateQuestions");
    expect(stale.reportText).toContain(schemaScenarioPlanningStalePlanState);
    expect(stale.reportText).not.toContain("Polarization");
    expect(stale.reportText.length).toBeLessThanOrEqual(18_200);
  });
});

describe("schema scenario planning UI and source guardrails", () => {
  it("renders required planning sections, actions, copy, and aria-expanded controls", () => {
    const source = readScenarioPlanningSource();

    for (const phrase of [
      ...schemaScenarioPlanningBoundaryPhrases,
      schemaScenarioPlanningQuestionCopy,
      schemaScenarioPlanningInterventionCopy,
      schemaScenarioPlanningMetricCopy,
      schemaScenarioPlanningDataCopy,
      schemaScenarioPlanningAssumptionCopy,
      schemaScenarioPlanningVerificationCopy,
      schemaScenarioPlanningNeuralCopy,
      schemaScenarioPlanningMr0Copy,
      schemaScenarioPlanningBlackjackCopy,
      schemaScenarioPlanningInvalidState,
      schemaScenarioPlanningStaleFitState,
      schemaScenarioPlanningStalePlanState
    ]) {
      expect(source).toContain(phrase);
    }
    for (const label of [
      "Scenario Planning From Schema V1",
      "Planning Overview",
      "Candidate Scenario Questions",
      "Conceptual Interventions",
      "Observable Metrics",
      "Parameter Families",
      "Assumption Checks",
      "Data / Calibration Needs",
      "Unsupported / Lossy / Future-Only Gaps",
      "Claim Boundaries",
      "Refresh scenario plan",
      "Copy planning report",
      "View fit report",
      "Jump to schema section",
      "Copyable planning report",
      "aria-expanded={!collapsed}"
    ]) {
      expect(source).toContain(label);
    }
    expect(source).not.toMatch(/>\s*(Run scenario|Create scenario|Generate RunConfig|Generate snapshot|Generate engine|Generate agents|Generate template|Apply to simulation|Execute schema|Optimize intervention|Recommend policy)\s*</);
  });

  it("has no runtime, compiler, generation, repair, external API, or unsafe rendering hooks", () => {
    const source = readScenarioPlanningSource();
    for (const forbidden of [
      "SimulationEngine",
      "useSimulationStore",
      "simulationStore",
      "createDefaultRunConfig",
      "createDefaultScenario",
      "createInitialWorld",
      "createEngine",
      "registerSystems",
      "applySchemaRepairSuggestion",
      "createSchemaTemplateFitReportUxModel",
      "schemaTemplateCompatibility",
      "socialLearning/",
      "NeuralRuntimeLab",
      "StrategyAdaptation",
      "dangerouslySetInnerHTML",
      "eval(",
      "new Function",
      "iframe",
      "URL.createObjectURL",
      "fetch(",
      "XMLHttpRequest",
      "WebSocket",
      "import("
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("integrates through Author Schema state without importing compatibility internals or simulation runtime", () => {
    const shell = readFileSync(join(repoRoot, "src", "components", "builder", "ModelSchemaAuthoringShell.tsx"), "utf8");

    expect(shell).toContain("SchemaScenarioPlanningPanel");
    expect(shell).toContain("resolveSchemaScenarioPlanUxModel(deferredDraft, view.structurallyValid, fitReportUx, scenarioPlanSnapshot)");
    expect(shell).toContain("setScenarioPlanSnapshot(createSchemaScenarioPlanSnapshot(deferredDraft, true, fitReportUx))");
    expect(shell).toContain("schemaScenarioPlanningStaleFitState");
    expect(shell).not.toContain("schemaTemplateCompatibility");
    expect(shell).not.toContain("createCompatibilityReport");
    expect(shell).not.toContain("createDefaultScenario");
    expect(shell).not.toContain("createDefaultRunConfig");
  });
});

function readScenarioPlanningSource(): string {
  return ["SchemaScenarioPlanningPanel.tsx", "schemaScenarioPlanningUx.ts", "index.ts"]
    .map((file) => readFileSync(join(repoRoot, "src", "components", "builder", "scenarioPlanning", file), "utf8"))
    .join("\n");
}

function expectNoFunctions(value: unknown): void {
  if (typeof value === "function") {
    throw new Error("Scenario planning UX model must remain serializable data.");
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) {
      for (const item of nested) {
        expectNoFunctions(item);
      }
    } else {
      expectNoFunctions(nested);
    }
  }
}
