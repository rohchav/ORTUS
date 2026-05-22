import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  artifactFamilyRegistry,
  assertTemplateDoesNotClaimUnsupportedRuntime,
  getArtifactFamily,
  getPrimitive,
  getRoadmapNextPrimitivePhases,
  getTemplateCapability,
  getTemplatePrimitiveCapabilities,
  listArtifactFamilies,
  listArtifactFamiliesForPrimitive,
  listImplementedPrimitives,
  listPrimitives,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  listTemplatesSupportingPrimitive,
  primitiveIds,
  primitiveRegistry,
  productionTemplates,
  templatePrimitiveCapabilities,
  validateArtifactFamilyRegistry,
  validatePrimitiveRegistryEntries,
  validateSystemsPrimitiveRegistry,
  validateTemplatePrimitiveCapabilityRegistry,
  type ArtifactFamilyEntry,
  type SystemsPrimitiveEntry,
  type TemplatePrimitiveCapability
} from "../index";

const repoRoot = process.cwd();

describe("systems primitive registry and capability map", () => {
  it("validates primitive, artifact, and template capability registries", () => {
    expect(() => validateSystemsPrimitiveRegistry()).not.toThrow();
    expect(() => validatePrimitiveRegistryEntries([...primitiveRegistry, primitiveRegistry[0]!] as readonly SystemsPrimitiveEntry[])).toThrow(
      /Duplicate primitive id/
    );
    expect(() =>
      validateArtifactFamilyRegistry(
        [
          artifactFamilyRegistry[0]!,
          { ...artifactFamilyRegistry[1]!, artifactType: artifactFamilyRegistry[0]!.artifactType }
        ] as readonly ArtifactFamilyEntry[],
        primitiveRegistry
      )
    ).toThrow(/Duplicate artifact type/);
    expect(() =>
      validateArtifactFamilyRegistry([{ ...artifactFamilyRegistry[0]!, primitiveId: "missing" as never }], primitiveRegistry)
    ).toThrow(/unknown primitive/);

    const unknownPrimitiveCapabilities = replaceCapability(0, { primitiveId: "missing" as never });
    expect(() => validateTemplatePrimitiveCapabilityRegistry(unknownPrimitiveCapabilities, primitiveRegistry)).toThrow(/unknown primitive/);

    const unknownTemplateCapabilities = replaceCapability(0, { templateId: "missing-template" });
    expect(() => validateTemplatePrimitiveCapabilityRegistry(unknownTemplateCapabilities, primitiveRegistry)).toThrow(/unknown template/);

    const reservedIndex = templatePrimitiveCapabilities.findIndex(
      (capability) => capability.templateId === productionTemplates[0]!.id && capability.primitiveId === "visualModelBuilder"
    );
    const invalidReservedRuntime = replaceCapability(reservedIndex, {
      status: "implemented",
      supportLevel: "runtime",
      runtimeActive: true
    });
    expect(() => validateTemplatePrimitiveCapabilityRegistry(invalidReservedRuntime, primitiveRegistry)).toThrow(/reserved primitive/);

    const invalidSupportLevel = replaceCapability(0, { supportLevel: "none", runtimeActive: true });
    expect(() => validateTemplatePrimitiveCapabilityRegistry(invalidSupportLevel, primitiveRegistry)).toThrow(/runtime-active/);

    const networkIndex = templatePrimitiveCapabilities.findIndex(
      (capability) => capability.templateId === productionTemplates[0]!.id && capability.primitiveId === "networks"
    );
    const invalidServiceOnlyRuntime = replaceCapability(networkIndex, {
      status: "implemented",
      supportLevel: "runtime",
      runtimeActive: true
    });
    expect(() => validateTemplatePrimitiveCapabilityRegistry(invalidServiceOnlyRuntime, primitiveRegistry)).toThrow(/serviceOnly primitive/);

    const assumptionsIndex = templatePrimitiveCapabilities.findIndex(
      (capability) => capability.templateId === productionTemplates[0]!.id && capability.primitiveId === "assumptions"
    );
    const invalidMetadataOnlyRuntime = replaceCapability(assumptionsIndex, {
      status: "implemented",
      supportLevel: "runtime",
      runtimeActive: true
    });
    expect(() => validateTemplatePrimitiveCapabilityRegistry(invalidMetadataOnlyRuntime, primitiveRegistry)).toThrow(/metadataOnly primitive/);

    expect(() => validatePrimitiveRegistryEntries([{ ...primitiveRegistry[0]!, supportLevel: "none" }] as readonly SystemsPrimitiveEntry[])).toThrow(
      /implemented status/
    );
    expect(() =>
      validatePrimitiveRegistryEntries([{ ...getPrimitive("networks")!, supportLevel: "runtime" }] as readonly SystemsPrimitiveEntry[])
    ).toThrow(/serviceOnly status/);
    expect(() =>
      validateArtifactFamilyRegistry([{ ...getArtifactFamily("ortus.validationReport")!, importSupported: true }] as readonly ArtifactFamilyEntry[], primitiveRegistry)
    ).toThrow(/Reserved artifact/);
    expect(() =>
      validateArtifactFamilyRegistry([{ ...getArtifactFamily("ortus.validationReport")!, exportSupported: true }] as readonly ArtifactFamilyEntry[], primitiveRegistry)
    ).toThrow(/Reserved artifact/);
    expect(() =>
      validateArtifactFamilyRegistry([{ ...getArtifactFamily("ortus.validationReport")!, implemented: true }] as readonly ArtifactFamilyEntry[], primitiveRegistry)
    ).toThrow(/Reserved artifact/);
  });

  it("records current primitive statuses without turning services into template support", () => {
    expect(getPrimitive("networks")?.status).toBe("serviceOnly");
    expect(getPrimitive("resources")?.status).toBe("serviceOnly");
    expect(getPrimitive("feedbackEvents")?.status).toBe("serviceOnly");
    expect(getPrimitive("hybridComposition")?.status).toBe("serviceOnly");
    expect(getPrimitive("uncertainty")?.status).toBe("serviceOnly");
    expect(getPrimitive("assumptions")?.status).toBe("metadataOnly");
    expect(getPrimitive("multiScale")?.status).toBe("serviceOnly");
    expect(getPrimitive("scaleAwareViews")?.status).toBe("serviceOnly");
    expect(getPrimitive("boundariesEnvironment")?.status).toBe("serviceOnly");
    expect(getPrimitive("spatialFields")?.status).toBe("serviceOnly");
    expect(getPrimitive("observability")?.status).toBe("serviceOnly");
    expect(getPrimitive("causalAssumptions")?.status).toBe("serviceOnly");
    expect(getPrimitive("unitsDimensionalConsistency")?.status).toBe("serviceOnly");
    expect(getPrimitive("emergenceDetection")?.status).toBe("serviceOnly");
    expect(getPrimitive("robustnessResilience")?.status).toBe("serviceOnly");
    expect(getPrimitive("visualModelBuilder")?.status).toBe("reserved");
  });

  it("keeps artifact families distinct and marks reserved artifacts as future-only", () => {
    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.networkMetrics",
      "ortus.resourceSystem",
      "ortus.resourceMetrics",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.feedbackEventMetrics",
      "ortus.hybridComposition",
      "ortus.scaleModel",
      "ortus.scaleViewState",
      "ortus.boundaryModel",
      "ortus.fieldLayer",
      "ortus.observabilityModel",
      "ortus.causalAssumptionModel",
      "ortus.quantitySemanticsModel",
      "ortus.emergencePatternModel",
      "ortus.robustnessResilienceModel"
    ]) {
      const artifact = getArtifactFamily(artifactType);
      expect(artifact?.implemented).toBe(true);
      expect(artifact?.importSupported).toBe(true);
      expect(artifact?.exportSupported).toBe(true);
    }

    for (const artifactType of [
      "ortus.modelDefinition",
      "ortus.validationReport",
      "ortus.traceReport",
      "ortus.patternLibrary",
      "ortus.domainPack"
    ]) {
      const artifact = getArtifactFamily(artifactType);
      expect(artifact?.implemented).toBe(false);
      expect(artifact?.importSupported).toBe(false);
      expect(artifact?.exportSupported).toBe(false);
    }
  });

  it("summarizes production template capabilities conservatively", () => {
    for (const template of productionTemplates) {
      const capabilities = getTemplatePrimitiveCapabilities(template.id);
      expect(capabilities).toHaveLength(primitiveIds.length);
      expect(assertTemplateDoesNotClaimUnsupportedRuntime(template.id)).toBe(true);
      expect(getTemplateCapability(template.id, "scenarios")?.runtimeActive).toBe(true);
      expect(getTemplateCapability(template.id, "behaviorModes")?.runtimeActive).toBe(true);
      expect(getTemplateCapability(template.id, "agentComposition")?.runtimeActive).toBe(true);
      expect(getTemplateCapability(template.id, "uncertainty")).toMatchObject({ status: "serviceOnly", runtimeActive: false });
      expect(getTemplateCapability(template.id, "assumptions")).toMatchObject({ status: "metadataOnly", runtimeActive: false });
      expect(getTemplateCapability(template.id, "networks")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "resources")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "feedbackEvents")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "hybridComposition")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "multiScale")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "scaleAwareViews")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "boundariesEnvironment")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "spatialFields")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "observability")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "unitsDimensionalConsistency")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "emergenceDetection")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "robustnessResilience")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });

      for (const primitive of listReservedPrimitives()) {
        expect(getTemplateCapability(template.id, primitive.id)).toMatchObject({ status: "unsupported", runtimeActive: false });
      }
    }

    expect(getTemplateCapability("flocking-boids", "behaviorModes")?.notes).toContain("groupAware");
    expect(getTemplateCapability("flocking-boids", "adaptiveAgents")).toMatchObject({ status: "unsupported", runtimeActive: false });
  });

  it("queries registry data deterministically without mutating registry constants", () => {
    expect(getPrimitive("missing" as never)).toBeUndefined();
    expect(getArtifactFamily("ortus.missing")).toBeUndefined();
    expect(getTemplateCapability("missing-template", "networks")).toBeUndefined();
    expect(listPrimitives()).toHaveLength(primitiveIds.length);
    expect(listImplementedPrimitives().map((primitive) => primitive.id)).toEqual(
      expect.arrayContaining(["scenarios", "snapshots", "behaviorModes", "agentComposition"])
    );
    expect(listReservedPrimitives().some((primitive) => primitive.id === "observability")).toBe(false);
    expect(listReservedPrimitives().some((primitive) => primitive.id === "unitsDimensionalConsistency")).toBe(false);
    expect(listReservedPrimitives().some((primitive) => primitive.id === "emergenceDetection")).toBe(false);
    expect(listReservedPrimitives().some((primitive) => primitive.id === "robustnessResilience")).toBe(false);
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toEqual(
      expect.arrayContaining([
        "networks",
        "resources",
        "feedbackEvents",
        "hybridComposition",
        "multiScale",
        "scaleAwareViews",
        "boundariesEnvironment",
        "spatialFields",
        "observability",
        "causalAssumptions",
        "unitsDimensionalConsistency",
        "emergenceDetection",
        "robustnessResilience"
      ])
    );
    expect(listArtifactFamilies().length).toBeGreaterThan(0);
    expect(getArtifactFamily("ortus.networkDefinition")?.primitiveId).toBe("networks");
    expect(listArtifactFamiliesForPrimitive("feedbackEvents").map((artifact) => artifact.artifactType)).toEqual(
      expect.arrayContaining(["ortus.eventSchedule", "ortus.delayQueue", "ortus.feedbackLoops", "ortus.feedbackEventMetrics"])
    );
    expect(getTemplateCapability("epidemic-spread", "networks")?.runtimeActive).toBe(false);
    expect(getTemplatePrimitiveCapabilities("missing-template")).toHaveLength(0);
    expect(listTemplatesSupportingPrimitive("networks")).toHaveLength(0);
    expect(listTemplatesSupportingPrimitive("networks", { runtimeOnly: false, includeUnsupportedWithGlobalService: true })).toHaveLength(
      productionTemplates.length
    );
    expect(getRoadmapNextPrimitivePhases()[0]).toMatchObject({ prompt: "20", primitiveIds: ["hybridComposition"] });

    const primitive = getPrimitive("networks") as SystemsPrimitiveEntry;
    (primitive as { status: string }).status = "implemented";
    expect(getPrimitive("networks")?.status).toBe("serviceOnly");
  });

  it("documents registry boundaries without claiming reserved behavior", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Global service availability is not template support. A primitive can exist as a headless service while every current template still reports no runtime support for it.");
    expect(docs).toContain("Reserved primitives are roadmap commitments, not implemented behavior.");
    expect(docs).toContain("The registry does not change runtime behavior by itself.");
    expect(docs).toContain("Check `src/simulation/registry` before claiming primitive or template support.");
    expect(docs).toContain("Distinguish global service availability from template runtime support.");
  });

  it("keeps registry code headless and free of execution/randomness hooks", () => {
    const registryDir = join(repoRoot, "src", "simulation", "registry");
    const source = readdirSync(registryDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(registryDir, file), "utf8"))
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

function replaceCapability(index: number, patch: Partial<TemplatePrimitiveCapability>): readonly TemplatePrimitiveCapability[] {
  return templatePrimitiveCapabilities.map((capability, currentIndex) => (currentIndex === index ? { ...capability, ...patch } : capability));
}
