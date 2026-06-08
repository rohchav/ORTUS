import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createCompatibilityReport,
  createCompatibilityReportForProductionTemplates,
  createDefaultTemplateMappingProfiles,
  createTemplateMappingProfileFromTemplate,
  deserializeSchemaTemplateCompatibilityReport,
  deserializeTemplateMappingProfile,
  getArtifactFamily,
  getBestTemplateFit,
  getPrimitive,
  getSchemaTemplateCompatibilityValidationReport,
  getSchemaTemplateCompatibilityWarnings,
  getTemplateCapability,
  getTemplateResult,
  listArtifactFamiliesForPrimitive,
  listLossyMappings,
  listMappedConcepts,
  listServiceOnlyPrimitives,
  listTemplateResults,
  listUnsupportedConcepts,
  productionTemplates,
  schemaTemplateCompatibility,
  schemaTemplateCompatibilityReportArtifactType,
  serializeSchemaTemplateCompatibilityReport,
  serializeTemplateMappingProfile,
  summarizeSchemaTemplateCompatibility,
  templateAssumptionProfile,
  templateMappingProfileArtifactType,
  validateCompositionCapabilities,
  validateHybridComposition,
  validateSchemaTemplateCompatibilityReport,
  validateTemplateMappingProfile,
  type HybridModelComposition,
  type ModelSchemaDefinition,
  type SchemaTemplateCompatibilityReport,
  type TemplateMappingProfile
} from "../index";

const repoRoot = process.cwd();

const requiredCompatibilityDocPhrases = [
  "Template/schema compatibility reports are structural fit analyses; they do not convert schemas into runnable models.",
  "A strong template fit does not mean a schema can run.",
  "Unsupported and lossy mappings must remain visible; they must not be silently dropped.",
  "Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines."
] as const;

const requiredLiveStateForbiddenKeys = [
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "metricHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "runState",
  "runSummary",
  "runSummaries",
  "template",
  "activeEngine"
] as const;

const requiredUnsafeCompatibilityKeys = [
  "formula",
  "expression",
  "equation",
  "code",
  "script",
  "javascript",
  "typescript",
  "python",
  "functionBody",
  "runtime",
  "execute",
  "executor",
  "compiler",
  "interpreter",
  "parser",
  "transpiler",
  "codegen",
  "generatedCode",
  "convert",
  "converter",
  "conversionFunction",
  "generateTemplate",
  "generateScenario",
  "generateRunConfig",
  "generateSnapshot",
  "createEngine",
  "applyScenario",
  "templateFactory",
  "scenarioFactory",
  "runConfigFactory",
  "snapshotFactory",
  "netlogoCode",
  "mesaModel",
  "masonModel",
  "externalAdapter",
  "externalRuntime",
  "llm",
  "largeLanguageModel",
  "embedding",
  "embeddings",
  "modelWeights",
  "trainingData",
  "realPersonProfile",
  "protectedAttributeInference",
  "persuasionOptimization",
  "microtargeting",
  "proof",
  "certification",
  "riskScore",
  "safetyScore"
] as const;

function compatibilitySchema(overrides: Partial<ModelSchemaDefinition> = {}): ModelSchemaDefinition {
  return {
    artifactType: "ortus.modelSchema",
    id: "opinion-compatibility-schema",
    name: "Opinion Compatibility Schema",
    description:
      "A structural schema with broad compatible language, NetLogo/Mesa/MASON references, social learning, validation, calibration, causal proof, and LLM wording for warning coverage.",
    version: "1.0.0",
    schemaVersion: "1",
    scope: { templateId: "opinion-dynamics" },
    entityTypes: [
      {
        id: "person",
        label: "Person",
        entityKind: "agent",
        componentTypeIds: ["opinion-state", "memory-state"],
        attributeTypeIds: ["opinion"],
        spaceIds: ["social-space"],
        active: true,
        executable: false
      },
      {
        id: "social-context",
        label: "Social Context",
        entityKind: "aggregate",
        active: false,
        executable: false
      }
    ],
    componentTypes: [
      {
        id: "opinion-state",
        label: "Opinion State",
        componentKind: "belief",
        attributeTypeIds: ["opinion"],
        active: true,
        executable: false
      },
      {
        id: "memory-state",
        label: "Memory State",
        componentKind: "memory",
        active: false,
        executable: false
      }
    ],
    attributeTypes: [
      {
        id: "opinion",
        label: "Opinion",
        valueKind: "number",
        active: true,
        executable: false
      },
      {
        id: "custom-signal",
        label: "Custom Signal",
        valueKind: "custom",
        active: false,
        executable: false
      }
    ],
    spaces: [
      {
        id: "social-space",
        label: "Social Space",
        spaceKind: "continuous2d",
        active: true,
        executable: false
      },
      {
        id: "contact-network",
        label: "Contact Network",
        spaceKind: "network",
        active: false,
        executable: false
      }
    ],
    parameters: [
      {
        id: "influenceRadius",
        label: "Influence radius",
        valueKind: "number",
        active: true,
        executable: false
      },
      {
        id: "attention-distribution",
        label: "Attention Distribution",
        valueKind: "distributionReference",
        active: false,
        executable: false
      }
    ],
    metrics: [
      {
        id: "meanOpinion",
        label: "Average opinion",
        metricKind: "mean",
        active: true,
        executable: false
      },
      {
        id: "network-score",
        label: "Network Score",
        metricKind: "networkMetric",
        active: false,
        executable: false
      },
      {
        id: "emergence-score",
        label: "Emergence Score",
        metricKind: "emergenceIndicator",
        active: false,
        executable: false
      }
    ],
    artifactReferences: [
      {
        id: "social-ref",
        label: "Social Semantics",
        artifactType: "ortus.knowledgeMemorySocialLearningModel",
        artifactId: "social-1",
        primitiveId: "knowledgeMemorySocialLearning",
        role: "context",
        active: true,
        executable: false
      },
      {
        id: "scenario-ref",
        label: "Scenario Ref",
        artifactType: "ortus.scenario",
        artifactId: "scenario-1",
        primitiveId: "scenarios",
        role: "input",
        active: false,
        executable: false
      },
      {
        id: "future-ref",
        label: "Future Ref",
        artifactType: "ortus.modelDefinition",
        artifactId: "future-model",
        primitiveId: "modelDefinitionSchema",
        role: "futureRuntimeDependency",
        active: false,
        executable: false
      }
    ],
    ruleDeclarations: [
      {
        id: "movement-rule",
        label: "Movement Rule",
        ruleKind: "movement",
        sourceEntityTypeIds: ["person"],
        parameterIds: ["influenceRadius"],
        metricIds: ["meanOpinion"],
        ruleDescription: "Agents move through an abstract social space. This is descriptive, not executable.",
        active: true,
        executable: false
      },
      {
        id: "social-rule",
        label: "Social Rule",
        ruleKind: "socialLearning",
        sourceEntityTypeIds: ["person"],
        targetEntityTypeIds: ["person"],
        referencedArtifactIds: ["social-ref"],
        ruleDescription: "Describe bounded social learning as future metadata only.",
        active: false,
        executable: false
      },
      {
        id: "network-rule",
        label: "Network Rule",
        ruleKind: "networkUpdate",
        referencedArtifactIds: ["social-ref"],
        ruleDescription: "Describe a future network update.",
        active: false,
        executable: false
      }
    ],
    ...overrides
  };
}

function hybridComposition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: "ortus.hybridComposition",
    id: "compatibility-composition",
    name: "Compatibility Composition",
    version: "1.0.0",
    baseTemplateId: "opinion-dynamics",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

function minimalReport(overrides: Partial<SchemaTemplateCompatibilityReport> = {}): SchemaTemplateCompatibilityReport {
  return {
    schemaVersion: "1",
    artifactType: schemaTemplateCompatibilityReportArtifactType,
    id: "compatibility-report",
    modelSchemaId: "schema-1",
    modelSchemaName: "Schema",
    modelSchemaVersion: "1.0.0",
    templateResults: [],
    overallFit: "none",
    requiredRuntimeCapabilities: ["ModelSchemaDefinition runtime interpreter"],
    warnings: [...requiredCompatibilityDocPhrases],
    runnableNow: false,
    schemaExecutionAvailable: false,
    conversionAvailable: false,
    generationAvailable: false,
    validationAvailable: false,
    calibrationAvailable: false,
    active: true,
    executable: false,
    ...overrides
  };
}

function expectInvalidProfile(label: string, profile: unknown, expected: RegExp = /Invalid template mapping profile|Template mapping profile/): void {
  expect(() => validateTemplateMappingProfile(profile), label).toThrow(expected);
}

function expectInvalidReport(
  label: string,
  report: unknown,
  expected: RegExp = /Invalid schema\/template compatibility report|Schema\/template compatibility report/
): void {
  expect(() => validateSchemaTemplateCompatibilityReport(report), label).toThrow(expected);
}

describe("schema/template compatibility mapping service", () => {
  it("validates profiles and reports while rejecting unsafe or runtime-shaped payloads", () => {
    const profile = createTemplateMappingProfileFromTemplate(productionTemplates[0]!);
    expect(validateTemplateMappingProfile(profile)).toMatchObject({
      artifactType: templateMappingProfileArtifactType,
      executable: false,
      runtimeActive: false,
      conversionSupported: false,
      generationSupported: false
    });
    expect(validateSchemaTemplateCompatibilityReport(minimalReport())).toMatchObject({
      artifactType: schemaTemplateCompatibilityReportArtifactType,
      runnableNow: false,
      schemaExecutionAvailable: false,
      conversionAvailable: false,
      generationAvailable: false,
      validationAvailable: false,
      calibrationAvailable: false,
      executable: false
    });

    expectInvalidProfile("wrong artifact type", { ...profile, artifactType: schemaTemplateCompatibilityReportArtifactType }, /artifactType/);
    expectInvalidProfile("duplicate supported parameter", { ...profile, supportedParameterIds: ["agentCount", "agentCount"] }, /Duplicate supported parameter id/);
    expectInvalidProfile("profile executable true", { ...profile, executable: true }, /executable/);
    expectInvalidProfile("profile runtime true", { ...profile, runtimeActive: true }, /runtimeActive/);
    expectInvalidReport("report executable true", minimalReport({ executable: true as never }), /executable/);
    expectInvalidReport("report runnable true", minimalReport({ runnableNow: true as never }), /runnableNow/);
    expectInvalidReport("report schema execution true", minimalReport({ schemaExecutionAvailable: true as never }), /schemaExecutionAvailable/);
    expectInvalidReport("report conversion true", minimalReport({ conversionAvailable: true as never }), /conversionAvailable/);
    expectInvalidReport("report generation true", minimalReport({ generationAvailable: true as never }), /generationAvailable/);
    expectInvalidReport("report validation true", minimalReport({ validationAvailable: true as never }), /validationAvailable/);
    expectInvalidReport("report calibration true", minimalReport({ calibrationAvailable: true as never }), /calibrationAvailable/);
    expectInvalidReport("best template mismatch", minimalReport({ bestTemplateId: "missing" }), /bestTemplateId/);
    expectInvalidReport("unknown top-level field", { ...minimalReport(), extra: true }, /Unrecognized key|Invalid schema/);
    expectInvalidReport("non-finite number", minimalReport({ metadata: { value: Number.NaN } as never }), /non-finite/);
    expectInvalidReport("function payload", minimalReport({ metadata: { handler: () => null } as never }), /plain JSON/);
    expectInvalidReport("non-plain payload", minimalReport({ metadata: { when: new Date() } as never }), /plain JSON/);
    const cyclicPayload: Record<string, unknown> = {};
    cyclicPayload.self = cyclicPayload;
    expectInvalidReport("cyclic payload", minimalReport({ metadata: { cyclicPayload } as never }), /acyclic plain JSON/);

    for (const key of [...requiredLiveStateForbiddenKeys, ...requiredUnsafeCompatibilityKeys]) {
      expectInvalidReport(`forbidden report key ${key}`, minimalReport({ metadata: { [key]: true } as never }), /must not contain/);
      expectInvalidProfile(`forbidden profile key ${key}`, { ...profile, metadata: { [key]: true } }, /must not contain/);
    }
  });

  it("creates conservative reports for production templates without making schemas runnable", () => {
    const schema = compatibilitySchema();
    const profiles = createDefaultTemplateMappingProfiles();
    expect(profiles).toHaveLength(productionTemplates.length);
    expect(profiles.every((profile) => profile.executable === false && profile.runtimeActive === false)).toBe(true);

    const report = createCompatibilityReportForProductionTemplates(schema);
    expect(report.templateResults).toHaveLength(productionTemplates.length);
    expect(report.runnableNow).toBe(false);
    expect(report.schemaExecutionAvailable).toBe(false);
    expect(report.conversionAvailable).toBe(false);
    expect(report.generationAvailable).toBe(false);
    expect(report.validationAvailable).toBe(false);
    expect(report.calibrationAvailable).toBe(false);
    expect(report.warnings).toEqual(expect.arrayContaining([...requiredCompatibilityDocPhrases]));
    expect(report.requiredRuntimeCapabilities).toEqual(
      expect.arrayContaining(["ModelSchemaDefinition runtime interpreter", "scenario generation", "RunConfig generation", "template generation"])
    );

    const best = getBestTemplateFit(report);
    expect(best?.templateId).toBeTruthy();
    expect(best?.runnableNow).toBe(false);
    expect(best?.schemaExecutionSupported).toBe(false);
    expect(best?.conversionSupported).toBe(false);
    expect(best?.generationSupported).toBe(false);
    expect(best?.templateRuntimeSupportClaimed).toBe(false);

    const opinion = getTemplateResult(report, "opinion-dynamics");
    expect(opinion).toBeDefined();
    expect(opinion?.mappedConcepts.length).toBeGreaterThan(0);
    expect(opinion?.unsupportedConcepts.map((concept) => concept.schemaElementId)).toEqual(
      expect.arrayContaining(["memory-state", "contact-network", "social-rule", "social-ref", "future-ref"])
    );
    expect(opinion?.lossyMappings.map((loss) => loss.schemaElementId)).toEqual(expect.arrayContaining(["movement-rule", "social-rule", "social-context"]));
    expect(opinion?.warnings).toEqual(expect.arrayContaining(["Unsupported schema concepts remain visible and must not be hidden."]));
    expect(opinion?.missingTemplateCapabilities).toEqual(expect.arrayContaining(["lossless schema-to-template semantic mapping"]));

    expect(() => validateSchemaTemplateCompatibilityReport(report)).not.toThrow();
    expect(JSON.stringify(schema)).toBe(JSON.stringify(compatibilitySchema()));
  });

  it("queries, summarizes, and serializes compatibility artifacts without mutating inputs", () => {
    const profile = createTemplateMappingProfileFromTemplate(productionTemplates.find((template) => template.id === "opinion-dynamics")!);
    const report = createCompatibilityReport(compatibilitySchema(), [profile]);
    const before = JSON.stringify(report);

    expect(listTemplateResults(report)).toHaveLength(1);
    expect(getTemplateResult(report, "opinion-dynamics")?.templateId).toBe("opinion-dynamics");
    expect(getBestTemplateFit(report)?.templateId).toBe("opinion-dynamics");
    const result = listTemplateResults(report)[0]!;
    expect(listMappedConcepts(result).length).toBeGreaterThan(0);
    expect(listUnsupportedConcepts(result).length).toBeGreaterThan(0);
    expect(listLossyMappings(result).length).toBeGreaterThan(0);
    expect(schemaTemplateCompatibility.listMappedConcepts(result)).toHaveLength(listMappedConcepts(result).length);
    expect(summarizeSchemaTemplateCompatibility(report)).toMatchObject({
      reportId: "schema-template-compatibility:opinion-compatibility-schema",
      modelSchemaId: "opinion-compatibility-schema",
      templateResultCount: 1,
      bestTemplateId: "opinion-dynamics",
      runnableNow: false
    });
    expect(getSchemaTemplateCompatibilityWarnings(report)).toEqual(expect.arrayContaining([...requiredCompatibilityDocPhrases]));
    expect(getSchemaTemplateCompatibilityValidationReport(report)).toMatchObject({
      reportId: "schema-template-compatibility:opinion-compatibility-schema",
      valid: true,
      runnableNow: false,
      conversionAvailable: false,
      generationAvailable: false,
      validationAvailable: false,
      calibrationAvailable: false
    });
    expect(getSchemaTemplateCompatibilityValidationReport({ artifactType: schemaTemplateCompatibilityReportArtifactType })).toMatchObject({
      valid: false,
      runnableNow: false
    });

    const clonedResults = [...listTemplateResults(report)];
    clonedResults[0]!.warnings = ["mutated clone"] as never;
    expect(getTemplateResult(report, "opinion-dynamics")?.warnings).not.toEqual(["mutated clone"]);

    const reportJson = serializeSchemaTemplateCompatibilityReport(report);
    expect(reportJson).toContain(`"artifactType": "${schemaTemplateCompatibilityReportArtifactType}"`);
    expect(deserializeSchemaTemplateCompatibilityReport(reportJson)).toMatchObject({ id: report.id });

    const profileJson = serializeTemplateMappingProfile(profile);
    expect(profileJson).toContain(`"artifactType": "${templateMappingProfileArtifactType}"`);
    expect(deserializeTemplateMappingProfile(profileJson)).toMatchObject({ id: profile.id });

    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.resourceSystem",
      "ortus.eventSchedule",
      "ortus.feedbackLoops",
      "ortus.hybridComposition",
      "ortus.scaleModel",
      "ortus.observabilityModel",
      "ortus.causalAssumptionModel",
      "ortus.quantitySemanticsModel",
      "ortus.emergencePatternModel",
      "ortus.robustnessResilienceModel",
      "ortus.controlStrategyModel",
      "ortus.modelSchema",
      "ortus.knowledgeMemorySocialLearningModel",
      "ortus.visualBuilderWorkspace",
      templateMappingProfileArtifactType
    ]) {
      expect(() => deserializeSchemaTemplateCompatibilityReport(JSON.stringify({ artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeTemplateMappingProfile(JSON.stringify({ artifactType: schemaTemplateCompatibilityReportArtifactType }))).toThrow(/artifact type/);
    expect(() => deserializeSchemaTemplateCompatibilityReport([])).toThrow(/artifact type/);
    expect(() => deserializeSchemaTemplateCompatibilityReport("x".repeat(300_000))).toThrow(/JSON/);
    expect(JSON.stringify(report)).toBe(before);
  });

  it("integrates with registry, template capabilities, and hybrid composition without satisfying runtime support", () => {
    expect(getPrimitive("schemaTemplateCompatibility")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("schemaTemplateCompatibility");
    expect(listArtifactFamiliesForPrimitive("schemaTemplateCompatibility").map((artifact) => artifact.artifactType)).toEqual(
      expect.arrayContaining([schemaTemplateCompatibilityReportArtifactType, templateMappingProfileArtifactType])
    );
    expect(getArtifactFamily(schemaTemplateCompatibilityReportArtifactType)).toMatchObject({
      primitiveId: "schemaTemplateCompatibility",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });

    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "schemaTemplateCompatibility")).toMatchObject({
        status: "unsupported",
        supportLevel: "none",
        runtimeActive: false,
        serviceAvailable: true
      });
    }

    const composition = hybridComposition({
      primitiveAttachments: [
        {
          id: "compatibility-report-ref",
          primitiveId: "schemaTemplateCompatibility",
          attachmentType: "schemaTemplateCompatibilityReport",
          mode: "reference",
          artifactType: schemaTemplateCompatibilityReportArtifactType,
          artifactId: "compatibility-report",
          active: true,
          required: true
        },
        {
          id: "template-profile-ref",
          primitiveId: "schemaTemplateCompatibility",
          attachmentType: "templateMappingProfile",
          mode: "reference",
          artifactType: templateMappingProfileArtifactType,
          artifactId: "template-profile",
          active: false,
          required: false
        }
      ],
      requiredCapabilities: [{ primitiveId: "schemaTemplateCompatibility", requiredSupportLevel: "runtime" }]
    });
    expect(validateHybridComposition(composition).primitiveAttachments.map((attachment) => attachment.attachmentType)).toEqual([
      "schemaTemplateCompatibilityReport",
      "templateMappingProfile"
    ]);
    const capabilityReport = validateCompositionCapabilities(composition);
    expect(capabilityReport.valid).toBe(true);
    expect(capabilityReport.runnableNow).toBe(false);
    expect(capabilityReport.missingCapabilities[0]).toMatchObject({
      primitiveId: "schemaTemplateCompatibility",
      requiredSupportLevel: "runtime",
      templateId: "opinion-dynamics"
    });
    expect(() =>
      validateHybridComposition(
        hybridComposition({
          primitiveAttachments: [
            {
              id: "bad-inline",
              primitiveId: "schemaTemplateCompatibility",
              attachmentType: "schemaTemplateCompatibilityReport",
              mode: "inline",
              artifactType: schemaTemplateCompatibilityReportArtifactType,
              inlineData: minimalReport() as never,
              active: true,
              required: false
            }
          ]
        })
      )
    ).toThrow(/Inline data is not supported/);
  });

  it("updates docs, assumptions, and architecture boundaries without adding execution or UI code", () => {
    const auditedDocPaths = [
      "README.md",
      "docs/concepts.md",
      "src/simulation/README.md",
      "docs/roadmap.md",
      "planned_roadmap.md",
      "docs/codex/CURRENT_CONTEXT.md",
      "docs/codex/SESSION_LOG.md",
      "AGENTS.md"
    ] as const;

    for (const docPath of auditedDocPaths) {
      const doc = readFileSync(join(repoRoot, docPath), "utf8");
      for (const phrase of requiredCompatibilityDocPhrases) {
        expect(doc, `${docPath} includes required compatibility phrase`).toContain(phrase);
      }
    }

    const docs = auditedDocPaths.map((docPath) => readFileSync(join(repoRoot, docPath), "utf8")).join("\n");
    expect(docs).toContain("Prompt 33B");
    expect(docs).toContain("Do not treat compatibility as conversion.");
    expect(docs).toContain("Do not treat strong fit as runnable.");
    expect(docs).toContain("Do not hide unsupported concepts.");
    expect(docs).toContain("Do not silently drop lossy mappings.");
    expect(docs).toContain("Do not mutate templates from compatibility reports.");

    const assumptionText = productionTemplates
      .flatMap((template) => templateAssumptionProfile(template).limitations.map((item) => item.description))
      .join("\n");
    for (const phrase of requiredCompatibilityDocPhrases) {
      expect(assumptionText).toContain(phrase);
    }

    const source = readdirSync(join(repoRoot, "src", "simulation", "schemaTemplateCompatibility"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(repoRoot, "src", "simulation", "schemaTemplateCompatibility", file), "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']zustand["']/);
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.");
    expect(source).not.toMatch(/from ["'].*components/);
    expect(source).not.toMatch(/from ["'].*state/);
    expect(source).not.toMatch(/from ["'].*SimulationEngine/);
    expect(source).not.toMatch(/new SimulationEngine/);
    expect(source).not.toMatch(/createInitialWorld\s*\(/);
    expect(source).not.toMatch(/registerSystems\s*\(/);
    expect(source).not.toMatch(/registerMetrics\s*\(/);
    expect(source).not.toMatch(/validateRunConfig\s*\(/);
    expect(source).not.toMatch(/validateScenario\s*\(/);
  });
});
