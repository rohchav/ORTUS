import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compositionRequiresRuntimeSupport,
  compositionUsesPrimitive,
  deserializeHybridComposition,
  getActiveAttachments,
  getAttachmentsForPrimitive,
  getCompositionArtifactRefs,
  getCompositionPrimitiveIds,
  getDeclaredOnlyAttachments,
  getPrimitive,
  getRequiredCapabilitiesForPrimitive,
  getTemplateCapability,
  hybridCompositionArtifactType,
  listArtifactFamiliesForPrimitive,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  productionTemplates,
  serializeHybridComposition,
  summarizeComposition,
  validateCompositionCapabilities,
  validateHybridComposition,
  type HybridModelComposition
} from "../index";

const repoRoot = process.cwd();

function baseComposition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "hybrid-test",
    name: "Hybrid Test",
    description: "Structural hybrid composition fixture.",
    version: "1.0.0",
    primitiveAttachments: [],
    requiredCapabilities: [],
    metadata: {},
    ...overrides
  };
}

function networkAttachment(required = false) {
  return {
    id: "network-ref",
    primitiveId: "networks" as const,
    attachmentType: "networkDefinition" as const,
    mode: "reference" as const,
    artifactType: "ortus.networkDefinition",
    artifactId: "network-1",
    active: true,
    required,
    notes: "Structural contact network reference."
  };
}

describe("hybrid model composition layer", () => {
  it("validates minimal and base-template compositions while rejecting malformed structure", () => {
    expect(validateHybridComposition(baseComposition()).id).toBe("hybrid-test");
    expect(validateHybridComposition(baseComposition({ baseTemplateId: "epidemic-spread" })).baseTemplateId).toBe("epidemic-spread");
    expect(() => validateHybridComposition(baseComposition({ id: "" }))).toThrow(/Invalid hybrid composition/);
    expect(() => validateHybridComposition(baseComposition({ name: "" }))).toThrow(/Invalid hybrid composition/);
    expect(() => validateHybridComposition(baseComposition({ version: "" }))).toThrow(/Invalid hybrid composition/);
    expect(() => validateHybridComposition(baseComposition({ baseTemplateId: "missing-template" }))).toThrow(/Unknown composition baseTemplateId/);
    expect(() =>
      validateHybridComposition(baseComposition({ primitiveAttachments: [{ ...networkAttachment(), primitiveId: "missing" as never }] }))
    ).toThrow(/Invalid hybrid composition|Unknown attachment primitiveId/);
    expect(() =>
      validateHybridComposition(baseComposition({ primitiveAttachments: [{ ...networkAttachment(), artifactType: "ortus.unknown" }] }))
    ).toThrow(/artifactType/);
    expect(() =>
      validateHybridComposition(baseComposition({ primitiveAttachments: [{ ...networkAttachment(), primitiveId: "resources" }] }))
    ).toThrow(/primitiveId does not match/);
    expect(() =>
      validateHybridComposition(
        baseComposition({
          primitiveAttachments: [
            { id: "future", primitiveId: "visualModelBuilder", attachmentType: "reservedFuture", mode: "declaredOnly", active: true, required: false }
          ]
        })
      )
    ).toThrow(/declaredOnly|Reserved primitive/);
    expect(() =>
      validateHybridComposition(baseComposition({ primitiveAttachments: [{ ...networkAttachment(), mode: "declaredOnly" }] }))
    ).toThrow(/declaredOnly|Declared-only/);
    expect(() =>
      validateHybridComposition(
        baseComposition({
          primitiveAttachments: [
            {
              id: "uncertainty-inline",
              primitiveId: "uncertainty",
              attachmentType: "uncertaintyConfig",
              mode: "inline",
              artifactType: "ortus.uncertaintyConfig",
              inlineData: { schemaVersion: "1", artifactType: "ortus.uncertaintyConfig" },
              active: true,
              required: false
            }
          ]
        })
      )
    ).toThrow(/Inline data is not supported/);
    expect(() =>
      validateHybridComposition(baseComposition({ primitiveAttachments: [{ ...networkAttachment(), artifactId: undefined }] }))
    ).toThrow(/requires artifactType and artifactId/);
    expect(() =>
      validateHybridComposition(baseComposition({ primitiveAttachments: [networkAttachment(), { ...networkAttachment(), artifactId: "network-2" }] }))
    ).toThrow(/Duplicate primitive attachment id/);
    expect(() =>
      validateHybridComposition(
        baseComposition({
          requiredCapabilities: [
            { primitiveId: "networks", requiredSupportLevel: "runtime" },
            { primitiveId: "networks", requiredSupportLevel: "runtime" }
          ]
        })
      )
    ).toThrow(/Duplicate requiredCapabilities/);
    expect(() => validateHybridComposition(baseComposition({ metadata: { world: { tick: 1 } } }))).toThrow(/live run state/);
    expect(() => validateHybridComposition(baseComposition({ metadata: { huge: "x".repeat(250_000) } }))).toThrow(/Hybrid composition/);
    expect(() => validateHybridComposition({ ...baseComposition(), extra: true })).toThrow(/Invalid hybrid composition/);
    expect(() =>
      validateHybridComposition(baseComposition({ requiredCapabilities: [{ primitiveId: "visualModelBuilder", requiredSupportLevel: "runtime" }] }))
    ).toThrow(/Reserved primitive visualModelBuilder cannot require runtime support/);
  });

  it("checks capabilities conservatively without treating service availability as template runtime support", () => {
    const networkRuntime = baseComposition({
      baseTemplateId: "epidemic-spread",
      primitiveAttachments: [networkAttachment(false)],
      requiredCapabilities: [{ primitiveId: "networks", requiredSupportLevel: "runtime" }]
    });
    const networkRuntimeReport = validateCompositionCapabilities(networkRuntime);
    expect(networkRuntimeReport.valid).toBe(true);
    expect(networkRuntimeReport.runnableNow).toBe(false);
    expect(networkRuntimeReport.missingCapabilities[0]).toMatchObject({
      primitiveId: "networks",
      requiredSupportLevel: "runtime",
      templateId: "epidemic-spread"
    });
    expect(networkRuntimeReport.missingCapabilities[0]?.reason).toContain("Global service availability");

    const networkService = baseComposition({
      baseTemplateId: "epidemic-spread",
      primitiveAttachments: [networkAttachment(false)],
      requiredCapabilities: [{ primitiveId: "networks", requiredSupportLevel: "service" }]
    });
    const serviceReport = validateCompositionCapabilities(networkService);
    expect(serviceReport.valid).toBe(true);
    expect(serviceReport.runnableNow).toBe(true);
    expect(serviceReport.missingCapabilities).toHaveLength(0);
    expect(serviceReport.warnings[0]).toMatch(/not runtime-active/);

    const resourceRuntime = baseComposition({
      baseTemplateId: "predator-prey",
      requiredCapabilities: [{ primitiveId: "resources", requiredSupportLevel: "runtime" }]
    });
    expect(validateCompositionCapabilities(resourceRuntime).runnableNow).toBe(false);

    const modelSchemaRuntime = baseComposition({
      baseTemplateId: "opinion-dynamics",
      primitiveAttachments: [
        {
          id: "schema-ref",
          primitiveId: "modelSchema",
          attachmentType: "modelSchema",
          mode: "reference",
          artifactType: "ortus.modelSchema",
          artifactId: "schema-1",
          active: true,
          required: true
        }
      ],
      requiredCapabilities: [{ primitiveId: "modelSchema", requiredSupportLevel: "runtime" }]
    });
    const modelSchemaReport = validateCompositionCapabilities(modelSchemaRuntime);
    expect(modelSchemaReport.valid).toBe(true);
    expect(modelSchemaReport.runnableNow).toBe(false);
    expect(modelSchemaReport.missingCapabilities[0]).toMatchObject({ primitiveId: "modelSchema", requiredSupportLevel: "runtime" });

    const feedbackRuntime = baseComposition({
      baseTemplateId: "opinion-dynamics",
      requiredCapabilities: [{ primitiveId: "feedbackEvents", requiredSupportLevel: "runtime" }]
    });
    expect(validateCompositionCapabilities(feedbackRuntime).runnableNow).toBe(false);

    const validationRequirement = baseComposition({
      baseTemplateId: "epidemic-spread",
      requiredCapabilities: [{ primitiveId: "validationCalibration", requiredSupportLevel: "metadata" }]
    });
    expect(validateCompositionCapabilities(validationRequirement)).toMatchObject({ runnableNow: false });

    const structurallyValidButNotRunnable = baseComposition({
      baseTemplateId: "epidemic-spread",
      primitiveAttachments: [networkAttachment(true)]
    });
    const structuralReport = validateCompositionCapabilities(structurallyValidButNotRunnable);
    expect(structuralReport.valid).toBe(true);
    expect(structuralReport.runnableNow).toBe(false);
    expect(structuralReport.unsupportedAttachments).toEqual(["network-ref"]);
  });

  it("queries composition attachments, requirements, summaries, and artifact refs without mutating inputs", () => {
    const composition = baseComposition({
      baseTemplateId: "epidemic-spread",
      primitiveAttachments: [
        networkAttachment(false),
        { id: "future", primitiveId: "visualModelBuilder", attachmentType: "reservedFuture", mode: "declaredOnly", active: false, required: false }
      ],
      requiredCapabilities: [{ primitiveId: "networks", requiredSupportLevel: "service" }]
    });
    const before = JSON.stringify(composition);
    expect(getCompositionPrimitiveIds(composition)).toEqual(["networks", "visualModelBuilder"]);
    expect(getActiveAttachments(composition)).toHaveLength(1);
    expect(getDeclaredOnlyAttachments(composition)).toHaveLength(1);
    expect(getAttachmentsForPrimitive(composition, "networks")).toHaveLength(1);
    expect(getRequiredCapabilitiesForPrimitive(composition, "networks")).toHaveLength(1);
    expect(compositionUsesPrimitive(composition, "networks")).toBe(true);
    expect(compositionRequiresRuntimeSupport(composition, "networks")).toBe(false);
    expect(summarizeComposition(composition)).toMatchObject({
      id: "hybrid-test",
      primitiveCount: 2,
      activeAttachmentCount: 1,
      declaredOnlyAttachmentCount: 1,
      requiredCapabilityCount: 1,
      runnableNow: true
    });
    expect(getCompositionArtifactRefs(composition)).toEqual([
      {
        attachmentId: "network-ref",
        primitiveId: "networks",
        attachmentType: "networkDefinition",
        artifactType: "ortus.networkDefinition",
        artifactId: "network-1",
        mode: "reference",
        active: true,
        required: false
      }
    ]);
    expect(JSON.stringify(composition)).toBe(before);
  });

  it("serializes only hybrid composition artifacts and rejects other artifact families", () => {
    const composition = baseComposition({ baseTemplateId: "epidemic-spread", primitiveAttachments: [networkAttachment(false)] });
    const json = serializeHybridComposition(composition);
    expect(json).toContain(`"artifactType": "${hybridCompositionArtifactType}"`);
    expect(deserializeHybridComposition(json)).toMatchObject({ id: "hybrid-test", baseTemplateId: "epidemic-spread" });

    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.resourceSystem",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.observabilityModel",
      "ortus.quantitySemanticsModel",
      "ortus.emergencePatternModel",
      "ortus.robustnessResilienceModel",
      "ortus.visualBuilderWorkspace",
      "ortus.schemaTemplateCompatibilityReport",
      "ortus.templateMappingProfile"
    ]) {
      expect(() => deserializeHybridComposition(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeHybridComposition(JSON.stringify({ ...composition, metadata: { activeEngine: {} } }))).toThrow(/live run state/);
    expect(() => deserializeHybridComposition({ ...composition, primitiveAttachments: [{ ...networkAttachment(), inlineData: () => null }] })).toThrow(
      /plain JSON|Invalid hybrid composition/
    );
  });

  it("integrates with the primitive registry without changing current template runtime support", () => {
    expect(getPrimitive("hybridComposition")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("hybridComposition");
    expect(listArtifactFamiliesForPrimitive("hybridComposition")).toEqual([
      expect.objectContaining({ artifactType: hybridCompositionArtifactType, implemented: true, importSupported: true, exportSupported: true })
    ]);
    expect(listReservedPrimitives().map((primitive) => primitive.id)).toEqual(
      expect.arrayContaining(["validationCalibration", "visualModelBuilder"])
    );
    expect(getPrimitive("observability")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("causalAssumptions")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("unitsDimensionalConsistency")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("emergenceDetection")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("robustnessResilience")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("modelSchema")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("visualBuilderWorkspace")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("schemaTemplateCompatibility")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("hybridComposition");
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "hybridComposition")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "networks")?.runtimeActive).toBe(false);
      expect(getTemplateCapability(template.id, "resources")?.runtimeActive).toBe(false);
      expect(getTemplateCapability(template.id, "feedbackEvents")?.runtimeActive).toBe(false);
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "unitsDimensionalConsistency")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "emergenceDetection")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "robustnessResilience")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "modelSchema")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "visualBuilderWorkspace")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "schemaTemplateCompatibility")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
    }
  });

  it("documents valid-vs-runnable and attachment boundaries", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Hybrid compositions can be valid without being runnable. Valid means the composition is structurally coherent; runnable means the required runtime capabilities are actually implemented.");
    expect(docs).toContain("Attaching a primitive artifact to a composition does not automatically make a template use that primitive.");
    expect(docs).toContain("Do not treat HybridModelComposition as a compiler.");
  });

  it("keeps composition services headless and free of execution/randomness hooks", () => {
    const compositionDir = join(repoRoot, "src", "simulation", "composition");
    const source = readdirSync(compositionDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(compositionDir, file), "utf8"))
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
    expect(source).not.toContain("Canvas");
  });
});
