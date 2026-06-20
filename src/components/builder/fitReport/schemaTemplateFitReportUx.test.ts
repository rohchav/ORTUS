import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { modelSchemaArtifactType, type ModelSchemaDefinition } from "../../../simulation/modelSchema";
import { createDefaultTemplateMappingProfiles, type TemplateMappingProfile } from "../../../simulation/schemaTemplateCompatibility";
import {
  createSchemaTemplateFitReportSnapshot,
  createSchemaTemplateFitReportUxModel,
  resolveSchemaTemplateFitReportUxModel,
  schemaTemplateFitReportBoundaryPhrases,
  schemaTemplateFitReportCurrentDraftSource,
  schemaTemplateFitReportEmptyState,
  schemaTemplateFitReportInvalidState,
  schemaTemplateFitReportStalePhrase,
  schemaTemplateFitReportWeakFitPhrase
} from "./schemaTemplateFitReportUx";

const repoRoot = process.cwd();

function validDraft(overrides: Partial<ModelSchemaDefinition> = {}): ModelSchemaDefinition {
  return {
    artifactType: modelSchemaArtifactType,
    id: "authored-schema",
    name: "Authored Schema",
    version: "1.0.0",
    schemaVersion: "1",
    entityTypes: [
      {
        id: "agent",
        label: "Agent",
        entityKind: "agent",
        active: true,
        executable: false
      }
    ],
    componentTypes: [],
    attributeTypes: [],
    spaces: [],
    parameters: [],
    metrics: [],
    ruleDeclarations: [],
    artifactReferences: [],
    assumptionNotes: [],
    limitationNotes: [],
    validationNotes: [],
    metadata: {},
    ...overrides
  };
}

describe("schema-to-template fit report UX model", () => {
  it("stays unavailable for structurally invalid drafts and uses the required disabled state", () => {
    const draft = validDraft({ id: "" });
    const ux = createSchemaTemplateFitReportUxModel(draft, false);

    expect(ux.available).toBe(false);
    expect(ux.disabledReason).toBe(schemaTemplateFitReportInvalidState);
    expect(ux.candidateCount).toBe(0);
    expect(ux.diagnostics).toContain(schemaTemplateFitReportInvalidState);
    expect(ux.boundaryPhrases).toEqual(schemaTemplateFitReportBoundaryPhrases);
  });

  it("builds a deterministic current-draft report without claiming runtime readiness", () => {
    const draft = validDraft({
      scope: { templateId: "opinion-dynamics" },
      componentTypes: [{ id: "opinion", label: "Opinion", componentKind: "belief", active: true, executable: false }],
      parameters: [{ id: "neighborInfluence", label: "Neighbor influence", valueKind: "number", active: true, executable: false }],
      metrics: [{ id: "polarization", label: "Polarization", metricKind: "distribution", active: true, executable: false }],
      ruleDeclarations: [
        {
          id: "bounded-influence",
          label: "Bounded influence",
          ruleKind: "interaction",
          ruleDescription: "Structural comparison only; this declaration is not executed.",
          active: true,
          executable: false
        }
      ]
    });
    const first = createSchemaTemplateFitReportUxModel(draft, true);
    const second = createSchemaTemplateFitReportUxModel(draft, true);

    expect(first.available).toBe(true);
    expect(first.sourceDescription).toBe(schemaTemplateFitReportCurrentDraftSource);
    expect(first.candidateCount).toBeGreaterThan(0);
    expect(first.strongestFitLevel).not.toBe("none");
    expect(first.diagnostics).toBe(second.diagnostics);
    expect(first.diagnostics).toContain("Fit score is a structural summary, not a runtime readiness score.");
    expect(first.diagnostics).toContain("Rule fits are structural comparisons. Rule declarations are not executed.");
    expect(first.diagnostics).toContain("A strong template fit does not mean a schema can run.");
    expect(first.diagnostics).toContain("Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents.");
    expect(first.candidates[0]?.scoreLabel).toContain("structural score");
    expect(first.candidates[0]?.caveats).toContain("A strong template fit does not mean a schema can run.");
  });

  it("marks reports stale after the valid draft changes and refresh clears the stale warning", () => {
    const draft = validDraft({
      scope: { templateId: "opinion-dynamics" },
      componentTypes: [{ id: "opinion", label: "Opinion", componentKind: "belief", active: true, executable: false }]
    });
    const snapshot = createSchemaTemplateFitReportSnapshot(draft, true);
    const editedDraft = { ...draft, name: "Edited Schema" };
    const importedDraft = { ...draft, id: "imported-schema", name: "Imported Schema" };
    const repairedDraft = { ...draft, metadata: { reviewedAfterRepair: true } };

    for (const nextDraft of [editedDraft, importedDraft, repairedDraft]) {
      const stale = resolveSchemaTemplateFitReportUxModel(nextDraft, true, snapshot);
      expect(stale.stale).toBe(true);
      expect(stale.sourceDescription).toBe(schemaTemplateFitReportStalePhrase);
      expect(stale.diagnostics).toContain(schemaTemplateFitReportStalePhrase);
      expect(stale.candidateCount).toBe(snapshot.ux.candidateCount);
    }

    const refreshed = createSchemaTemplateFitReportSnapshot(editedDraft, true);
    expect(resolveSchemaTemplateFitReportUxModel(editedDraft, true, refreshed).stale).toBe(false);
  });

  it("does not fall back to a stale valid snapshot when the current draft is structurally invalid", () => {
    const snapshot = createSchemaTemplateFitReportSnapshot(validDraft(), true);
    const invalidDraft = validDraft({ id: "" });
    const ux = resolveSchemaTemplateFitReportUxModel(invalidDraft, false, snapshot);

    expect(ux.available).toBe(false);
    expect(ux.stale).toBe(false);
    expect(ux.disabledReason).toBe(schemaTemplateFitReportInvalidState);
    expect(ux.candidateCount).toBe(0);
    expect(ux.diagnostics).toContain(schemaTemplateFitReportInvalidState);
  });

  it("keeps unsupported, lossy, future-only, MR0, and runtime gaps visible", () => {
    const draft = validDraft({
      description:
        "Urban exposure resilience, cluster-based decision readout generalization, stimulus-conditioned decision clusters, and blackjack sequential decision lab are future roadmap ideas.",
      componentTypes: [
        { id: "memory", label: "Memory", componentKind: "memory", active: true, executable: false },
        { id: "belief", label: "Belief", componentKind: "belief", active: true, executable: false }
      ],
      spaces: [
        { id: "network-space", label: "Network Space", spaceKind: "network", active: true, executable: false },
        { id: "atmospheric-field", label: "Atmospheric Field", spaceKind: "field", active: true, executable: false }
      ],
      metrics: [{ id: "network-centrality", label: "Network Centrality", metricKind: "networkMetric", active: true, executable: false }],
      ruleDeclarations: [
        {
          id: "social-learning",
          label: "Social Learning",
          ruleKind: "socialLearning",
          ruleDescription: "A decision clusters note for structural fit only.",
          active: true,
          executable: false
        }
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
    const ux = createSchemaTemplateFitReportUxModel(draft, true);
    const combined = ux.candidates.flatMap((candidate) => [
      ...candidate.unsupportedConcepts,
      ...candidate.lossyConcepts,
      ...candidate.futureOnlyConcepts,
      ...candidate.runtimeGaps
    ]);

    expect(ux.totals.unsupported).toBeGreaterThan(0);
    expect(ux.totals.lossy).toBeGreaterThan(0);
    expect(ux.totals.futureOnly).toBeGreaterThan(0);
    expect(ux.totals.runtimeGaps).toBeGreaterThan(0);
    expect(combined.some((concept) => concept.label.includes("Urban Exposure + Resilience"))).toBe(true);
    expect(combined.some((concept) => concept.label.includes("Cluster-Based Decision Readout Generalization"))).toBe(true);
    expect(combined.some((concept) => concept.label.includes("Stimulus-Conditioned Decision Clusters"))).toBe(true);
    expect(combined.some((concept) => concept.label.includes("Blackjack"))).toBe(true);
    expect(combined.some((concept) => concept.explanation.includes("not a capability implemented by the fit report"))).toBe(true);
    expect(ux.diagnostics).toContain("MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report.");
    expect(ux.diagnostics).toContain("Unsupported and lossy mappings must remain visible; they must not be silently dropped.");
  });

  it("reports empty profile availability without invalidating the schema", () => {
    const ux = createSchemaTemplateFitReportUxModel(validDraft(), true, { profiles: [] });

    expect(ux.available).toBe(true);
    expect(ux.emptyState).toBe(schemaTemplateFitReportEmptyState);
    expect(ux.candidateCount).toBe(0);
    expect(ux.diagnostics).toContain(schemaTemplateFitReportEmptyState);
  });

  it("handles an unknown but valid template mapping profile safely", () => {
    const baseProfile = createDefaultTemplateMappingProfiles()[0]!;
    const unknownProfile = {
      ...baseProfile,
      id: "template-mapping-profile:unknown-template",
      name: "Unknown Template Mapping Profile",
      templateId: "unknown-template",
      templateName: "Unknown Template",
      supportedEntityKinds: [] as const,
      supportedParameterIds: [] as const,
      supportedMetricIds: [] as const,
      supportedRuleKinds: [] as const
    };
    const ux = createSchemaTemplateFitReportUxModel(validDraft(), true, { profiles: [unknownProfile] });

    expect(ux.available).toBe(true);
    expect(ux.candidateCount).toBe(1);
    expect(ux.candidates[0]).toMatchObject({ templateId: "unknown-template", templateName: "Unknown Template" });
    expect(ux.candidates[0]?.fitLevel).toBe("unsupported");
    expect(ux.diagnostics).toContain("Unknown Template");
  });

  it("ranks equal-score candidates by exact fit before stable template id", () => {
    const baseProfile = createDefaultTemplateMappingProfiles().find((profile) => profile.supportedEntityKinds.includes("agent"))!;
    const strongProfile = cloneProfile(baseProfile, {
      templateId: "aa-strong-template",
      templateName: "AA Strong Template"
    });
    const exactProfile = cloneProfile(baseProfile, {
      templateId: "zz-exact-template",
      templateName: "ZZ Exact Template"
    });
    const ux = createSchemaTemplateFitReportUxModel(validDraft({ scope: { templateId: "zz-exact-template" } }), true, {
      profiles: [strongProfile, exactProfile]
    });

    expect(ux.candidates.map((candidate) => candidate.templateId)).toEqual(["zz-exact-template", "aa-strong-template"]);
    expect(ux.candidates[0]?.fit).toBe("templateExact");
    expect(ux.candidates[0]?.score).toBe(ux.candidates[1]?.score);
  });

  it("ranks equal-score and equal-fit candidates by stable template id", () => {
    const baseProfile = createDefaultTemplateMappingProfiles().find((profile) => profile.supportedEntityKinds.includes("agent"))!;
    const bProfile = cloneProfile(baseProfile, {
      templateId: "bb-template",
      templateName: "BB Template"
    });
    const aProfile = cloneProfile(baseProfile, {
      templateId: "aa-template",
      templateName: "AA Template"
    });
    const ux = createSchemaTemplateFitReportUxModel(validDraft(), true, { profiles: [bProfile, aProfile] });

    expect(ux.candidates.map((candidate) => candidate.templateId)).toEqual(["aa-template", "bb-template"]);
    expect(ux.candidates[0]?.score).toBe(ux.candidates[1]?.score);
    expect(ux.candidates[0]?.fit).toBe(ux.candidates[1]?.fit);
  });

  it("does not mutate drafts or mapping profiles", () => {
    const draft = validDraft({
      componentTypes: [{ id: "belief", label: "Belief", componentKind: "belief", active: true, executable: false }]
    });
    const profiles = createDefaultTemplateMappingProfiles();
    const draftBefore = JSON.stringify(draft);
    const profilesBefore = JSON.stringify(profiles);

    createSchemaTemplateFitReportUxModel(draft, true, { profiles });

    expect(JSON.stringify(draft)).toBe(draftBefore);
    expect(JSON.stringify(profiles)).toBe(profilesBefore);
  });

  it("keeps weak fit language explicit instead of treating weak fit as schema invalidity", () => {
    const draft = validDraft({
      entityTypes: [{ id: "custom-entity", label: "Custom Entity", entityKind: "custom", active: true, executable: false }],
      metrics: [{ id: "custom-metric", label: "Custom Metric", metricKind: "custom", active: true, executable: false }]
    });
    const ux = createSchemaTemplateFitReportUxModel(draft, true);

    expect(ux.weakFitPhrase).toBe(schemaTemplateFitReportWeakFitPhrase);
    expect(ux.diagnostics).toContain(schemaTemplateFitReportWeakFitPhrase);
    expect(ux.available).toBe(true);
  });
});

describe("schema-to-template fit report UI guardrails", () => {
  it("renders only structural report actions and persistent caveats", () => {
    const source = readFitReportSource();

    for (const phrase of schemaTemplateFitReportBoundaryPhrases) {
      expect(source).toContain(phrase);
    }
    expect(source).toContain("Refresh fit report");
    expect(source).toContain(schemaTemplateFitReportStalePhrase);
    expect(source).toContain("View template assumptions");
    expect(source).toContain("Copy diagnostics");
    expect(source).toContain("Jump to schema section");
    expect(source).toContain("Copyable fit diagnostics");
    expect(source).toContain("candidateCountSummary");
    expect(source).toContain('aria-expanded={!collapsed}');
    expect(source).not.toMatch(/>\s*(Generate|Convert|Apply|Run|Make runnable)\s*</i);
  });

  it("has no runtime, compiler, repair, external API, or unsafe rendering hooks", () => {
    const source = readFitReportSource();
    for (const forbidden of [
      "SimulationEngine",
      "useSimulationStore",
      "simulationStore",
      "applySchemaRepairSuggestion",
      "lastValidArtifact",
      "createInitialWorld",
      "createEngine",
      "runConfigGeneration",
      "scenarioGeneration",
      "snapshotGeneration",
      "templateGeneration",
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

  it("keeps Author Schema integration indirect and away from compatibility engine internals", () => {
    const shell = readFileSync(join(repoRoot, "src", "components", "builder", "ModelSchemaAuthoringShell.tsx"), "utf8");

    expect(shell).toContain("SchemaTemplateFitReportPanel");
    expect(shell).toContain("createSchemaTemplateFitReportSnapshot(deferredDraft, true)");
    expect(shell).toContain("resolveSchemaTemplateFitReportUxModel(deferredDraft, view.structurallyValid, fitReportSnapshot)");
    expect(shell).toContain("setFitReportSnapshot(createSchemaTemplateFitReportSnapshot(deferredDraft, true))");
    expect(shell).not.toContain("schemaTemplateCompatibility");
    expect(shell).not.toContain("createCompatibilityReport");
    expect(shell).not.toContain("lastValidArtifact && createSchemaTemplateFitReportUxModel");
  });
});

function cloneProfile(
  profile: TemplateMappingProfile,
  overrides: Pick<TemplateMappingProfile, "templateId" | "templateName">
): TemplateMappingProfile {
  return {
    ...profile,
    id: `template-mapping-profile:${overrides.templateId}`,
    name: `${overrides.templateName} Mapping Profile`,
    templateId: overrides.templateId,
    templateName: overrides.templateName
  };
}

function readFitReportSource(): string {
  return ["SchemaTemplateFitReportPanel.tsx", "schemaTemplateFitReportUx.ts", "index.ts"]
    .map((file) => readFileSync(join(repoRoot, "src", "components", "builder", "fitReport", file), "utf8"))
    .join("\n");
}
