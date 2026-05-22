import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deserializeHybridComposition,
  deserializeMultiScaleModel,
  getAggregationRulesFromScale,
  getAggregationRulesToScale,
  getArtifactFamily,
  getCrossScaleLinksBetween,
  getCrossScaleLinksForScale,
  getDisaggregationRulesFromScale,
  getDisaggregationRulesToScale,
  getEntityTypesForScale,
  getPrimitive,
  getScaleLevel,
  getTemplateCapability,
  hasScaleLevel,
  hybridCompositionArtifactType,
  listScaleLevels,
  listScaleLevelsByOrder,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  modelUsesScaleType,
  productionTemplates,
  scaleModelArtifactType,
  serializeMultiScaleModel,
  summarizeMultiScaleModel,
  validateCompositionCapabilities,
  validateMultiScaleModel,
  validateMultiScaleModelForRuntime,
  type HybridModelComposition,
  type MultiScaleModel
} from "../index";

const repoRoot = process.cwd();

function minimalScaleModel(overrides: Partial<MultiScaleModel> = {}): MultiScaleModel {
  return {
    schemaVersion: "1",
    artifactType: scaleModelArtifactType,
    id: "scale-test",
    name: "Scale Test",
    version: "1.0.0",
    scaleLevels: [
      {
        id: "micro",
        label: "Agents",
        order: 0,
        scaleType: "micro",
        entityTypes: []
      }
    ],
    aggregationRules: [],
    disaggregationRules: [],
    crossScaleLinks: [],
    ...overrides
  };
}

function microMesoMacroModel(overrides: Partial<MultiScaleModel> = {}): MultiScaleModel {
  return minimalScaleModel({
    primaryScaleId: "micro",
    scaleLevels: [
      {
        id: "micro",
        label: "People",
        order: 0,
        scaleType: "micro",
        entityTypes: [
          {
            id: "person",
            label: "Person",
            kind: "agent",
            stateVariables: [{ id: "infected", label: "Infected", valueType: "boolean" }]
          }
        ]
      },
      {
        id: "meso",
        label: "Households",
        order: 1,
        scaleType: "meso",
        entityTypes: [{ id: "household", label: "Household", kind: "group" }]
      },
      {
        id: "macro",
        label: "Region",
        order: 2,
        scaleType: "macro",
        entityTypes: [
          {
            id: "region",
            label: "Region",
            kind: "region",
            metrics: [{ id: "infectedCount", label: "Infected Count", valueType: "integer" }]
          }
        ]
      }
    ],
    aggregationRules: [
      {
        id: "count-infected",
        label: "Count Infected",
        fromScaleId: "micro",
        toScaleId: "macro",
        fromEntityTypeId: "person",
        toEntityTypeId: "region",
        aggregationType: "count",
        sourceVariables: ["infected"],
        targetVariables: ["infectedCount"],
        informationLossNotes: ["Individual infection timelines are lost in the regional count."],
        executable: false
      }
    ],
    disaggregationRules: [
      {
        id: "restore-region-count",
        label: "Restore Previous Agents",
        fromScaleId: "macro",
        toScaleId: "micro",
        fromEntityTypeId: "region",
        toEntityTypeId: "person",
        disaggregationType: "restorePrevious",
        executable: false
      },
      {
        id: "sample-agents",
        label: "Sample Representative Agents",
        fromScaleId: "macro",
        toScaleId: "micro",
        fromEntityTypeId: "region",
        toEntityTypeId: "person",
        disaggregationType: "sampleRepresentative",
        syntheticDetailNotes: ["Representative agents are synthetic and should not be treated as observed people."],
        executable: false
      }
    ],
    crossScaleLinks: [
      {
        id: "regional-constraint",
        label: "Regional Constraint",
        sourceScaleId: "macro",
        targetScaleId: "micro",
        sourceEntityTypeId: "region",
        targetEntityTypeId: "person",
        linkType: "constrainDown",
        direction: "down",
        active: true,
        executable: false,
        notes: "Structural link only."
      }
    ],
    ...overrides
  });
}

function baseComposition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "scale-composition",
    name: "Scale Composition",
    version: "1.0.0",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("multi-scale architecture service", () => {
  it("validates minimal and micro/meso/macro scale models while rejecting malformed structure", () => {
    expect(validateMultiScaleModel(minimalScaleModel()).id).toBe("scale-test");
    expect(validateMultiScaleModel(microMesoMacroModel()).scaleLevels).toHaveLength(3);
    expect(() => validateMultiScaleModel(minimalScaleModel({ id: "" }))).toThrow(/Invalid multi-scale model/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ name: "" }))).toThrow(/Invalid multi-scale model/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ version: "" }))).toThrow(/Invalid multi-scale model/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ artifactType: "ortus.scenario" as never }))).toThrow(/Invalid multi-scale model/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ scaleLevels: [] }))).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(minimalScaleModel({ scaleLevels: [{ ...minimalScaleModel().scaleLevels[0]! }, { ...minimalScaleModel().scaleLevels[0]! }] }))
    ).toThrow(/Duplicate scale level id/);
    expect(() =>
      validateMultiScaleModel(
        minimalScaleModel({
          scaleLevels: [
            { ...minimalScaleModel().scaleLevels[0]!, id: "micro" },
            { ...minimalScaleModel().scaleLevels[0]!, id: "meso", order: 0 }
          ]
        })
      )
    ).toThrow(/Duplicate scale order/);
    expect(() =>
      validateMultiScaleModel(
        minimalScaleModel({
          scaleLevels: [
            {
              id: "micro",
              label: "Agents",
              order: 0,
              scaleType: "micro",
              entityTypes: [
                { id: "agent", label: "Agent", kind: "agent" },
                { id: "agent", label: "Agent Again", kind: "agent" }
              ]
            }
          ]
        })
      )
    ).toThrow(/Duplicate entity type id/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ scaleLevels: [{ ...minimalScaleModel().scaleLevels[0]!, scaleType: "zoom" as never }] }))).toThrow(
      /Invalid multi-scale model/
    );
    expect(() =>
      validateMultiScaleModel(
        minimalScaleModel({
          scaleLevels: [
            {
              id: "micro",
              label: "Agents",
              order: 0,
              scaleType: "micro",
              entityTypes: [{ id: "agent", label: "Agent", kind: "creature" as never }]
            }
          ]
        })
      )
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(
        minimalScaleModel({
          scaleLevels: [
            {
              id: "micro",
              label: "Agents",
              order: 0,
              scaleType: "micro",
              entityTypes: [
                { id: "agent", label: "Agent", kind: "agent", stateVariables: [{ id: "x", label: "X", valueType: "formula" as never }] }
              ]
            }
          ]
        })
      )
    ).toThrow(/Invalid multi-scale model/);
    expect(() => validateMultiScaleModel(microMesoMacroModel({ primaryScaleId: "missing" }))).toThrow(/Unknown primaryScaleId/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ aggregationRules: [{ ...microMesoMacroModel().aggregationRules[0]!, fromScaleId: "missing" }] }))
    ).toThrow(/unknown source scale/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ aggregationRules: [{ ...microMesoMacroModel().aggregationRules[0]!, toScaleId: "missing" }] }))
    ).toThrow(/unknown target scale/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ aggregationRules: [{ ...microMesoMacroModel().aggregationRules[0]!, fromEntityTypeId: "missing" }] }))
    ).toThrow(/unknown entity type/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ aggregationRules: [{ ...microMesoMacroModel().aggregationRules[0]!, toEntityTypeId: "missing" }] }))
    ).toThrow(/unknown entity type/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ aggregationRules: [{ ...microMesoMacroModel().aggregationRules[0]!, toScaleId: "micro" }] }))
    ).toThrow(/different scale levels/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ aggregationRules: [{ ...microMesoMacroModel().aggregationRules[0]!, aggregationType: "script" as never }] })
      )
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ aggregationRules: [{ ...microMesoMacroModel().aggregationRules[0]!, executable: true as false }] }))
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ aggregationRules: [microMesoMacroModel().aggregationRules[0]!, microMesoMacroModel().aggregationRules[0]!] })
      )
    ).toThrow(/Duplicate aggregation rule id/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ disaggregationRules: [{ ...microMesoMacroModel().disaggregationRules[1]!, fromScaleId: "missing" }] }))
    ).toThrow(/unknown source scale/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ disaggregationRules: [{ ...microMesoMacroModel().disaggregationRules[1]!, toScaleId: "missing" }] }))
    ).toThrow(/unknown target scale/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ disaggregationRules: [{ ...microMesoMacroModel().disaggregationRules[1]!, toEntityTypeId: "missing" }] })
      )
    ).toThrow(/unknown entity type/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ disaggregationRules: [{ ...microMesoMacroModel().disaggregationRules[1]!, toScaleId: "macro" }] })
      )
    ).toThrow(/different scale levels/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ disaggregationRules: [{ ...microMesoMacroModel().disaggregationRules[1]!, disaggregationType: "execute" as never }] })
      )
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ disaggregationRules: [{ ...microMesoMacroModel().disaggregationRules[1]!, executable: true as false }] })
      )
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ disaggregationRules: [microMesoMacroModel().disaggregationRules[1]!, microMesoMacroModel().disaggregationRules[1]!] })
      )
    ).toThrow(/Duplicate disaggregation rule id/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ disaggregationRules: [{ ...microMesoMacroModel().disaggregationRules[1]!, syntheticDetailNotes: undefined }] })
      )
    ).toThrow(/synthetic detail/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, sourceScaleId: "missing" }] }))
    ).toThrow(/unknown source scale/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, targetScaleId: "missing" }] }))
    ).toThrow(/unknown target scale/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, sourceEntityTypeId: "missing" }] })
      )
    ).toThrow(/unknown entity type/);
    expect(() =>
      validateMultiScaleModel(
        microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, targetEntityTypeId: "missing" }] })
      )
    ).toThrow(/unknown entity type/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, targetScaleId: "macro" }] }))
    ).toThrow(/different scale levels/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, linkType: "causal" as never }] }))
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, direction: "sideways" as never }] }))
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ crossScaleLinks: [{ ...microMesoMacroModel().crossScaleLinks[0]!, executable: true as false }] }))
    ).toThrow(/Invalid multi-scale model/);
    expect(() =>
      validateMultiScaleModel(microMesoMacroModel({ crossScaleLinks: [microMesoMacroModel().crossScaleLinks[0]!, microMesoMacroModel().crossScaleLinks[0]!] }))
    ).toThrow(/Duplicate cross-scale link id/);
    expect(() => validateMultiScaleModel({ ...minimalScaleModel(), extra: true })).toThrow(/Invalid multi-scale model/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ metadata: { world: { tick: 1 } } }))).toThrow(/live-state|executable/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ metadata: { formula: "x + y" } }))).toThrow(/live-state|executable/);
    expect(() => validateMultiScaleModel(minimalScaleModel({ metadata: { huge: "x".repeat(250_000) } }))).toThrow(/Multi-scale model/);
  });

  it("surfaces information loss and synthetic detail without making scale models runnable", () => {
    const report = validateMultiScaleModelForRuntime(microMesoMacroModel());
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.informationLossWarnings[0]).toContain("Individual infection timelines");
    expect(report.syntheticDetailWarnings).toHaveLength(1);
    expect(report.syntheticDetailWarnings[0]).toContain("Representative agents");
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "multiScale", requiredSupportLevel: "runtime" });

    const restoreOnly = microMesoMacroModel({ disaggregationRules: [microMesoMacroModel().disaggregationRules[0]!] });
    expect(validateMultiScaleModelForRuntime(restoreOnly).syntheticDetailWarnings).toHaveLength(0);
    expect(summarizeMultiScaleModel(microMesoMacroModel())).toMatchObject({
      scaleLevelCount: 3,
      entityTypeCount: 3,
      aggregationRuleCount: 1,
      disaggregationRuleCount: 2,
      crossScaleLinkCount: 1,
      hasInformationLoss: true,
      hasSyntheticDisaggregation: true,
      runnableNow: false
    });
  });

  it("queries scale levels, rules, and links deterministically without mutating inputs", () => {
    const model = microMesoMacroModel();
    const before = JSON.stringify(model);
    expect(getScaleLevel(model, "macro")?.label).toBe("Region");
    expect(getScaleLevel(model, "missing")).toBeUndefined();
    expect(listScaleLevels(model).map((level) => level.id)).toEqual(["micro", "meso", "macro"]);
    expect(listScaleLevelsByOrder(model).map((level) => level.id)).toEqual(["micro", "meso", "macro"]);
    expect(getEntityTypesForScale(model, "micro").map((entityType) => entityType.id)).toEqual(["person"]);
    expect(getEntityTypesForScale(model, "missing")).toEqual([]);
    expect(getAggregationRulesFromScale(model, "micro")).toHaveLength(1);
    expect(getAggregationRulesToScale(model, "macro")).toHaveLength(1);
    expect(getDisaggregationRulesFromScale(model, "macro")).toHaveLength(2);
    expect(getDisaggregationRulesToScale(model, "micro")).toHaveLength(2);
    expect(getCrossScaleLinksForScale(model, "macro")).toHaveLength(1);
    expect(getCrossScaleLinksBetween(model, "macro", "micro")).toHaveLength(1);
    expect(hasScaleLevel(model, "meso")).toBe(true);
    expect(modelUsesScaleType(model, "macro")).toBe(true);
    const levels = listScaleLevelsByOrder(model);
    (levels[0] as { id: string }).id = "mutated";
    expect(getScaleLevel(model, "micro")?.id).toBe("micro");
    expect(JSON.stringify(model)).toBe(before);
  });

  it("serializes scale models and rejects other artifact families", () => {
    const model = microMesoMacroModel();
    const json = serializeMultiScaleModel(model);
    expect(json).toContain(`"artifactType": "${scaleModelArtifactType}"`);
    expect(deserializeMultiScaleModel(json)).toMatchObject({ id: "scale-test", primaryScaleId: "micro" });

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
      "ortus.hybridComposition"
    ]) {
      expect(() => deserializeMultiScaleModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeMultiScaleModel(JSON.stringify({ schemaVersion: "1", artifactType: scaleModelArtifactType }))).toThrow(
      /Invalid multi-scale model/
    );
    expect(() => deserializeMultiScaleModel(JSON.stringify({ ...model, metadata: { huge: "x".repeat(250_000) } }))).toThrow(/Multi-scale model/);
    expect(() => deserializeMultiScaleModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeMultiScaleModel({ ...model, metadata: { callback: () => null } })).toThrow(/plain JSON|Invalid multi-scale model/);
  });

  it("updates registry and template capability truth without implementing scale-aware views", () => {
    expect(getPrimitive("multiScale")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("multiScale");
    expect(getArtifactFamily(scaleModelArtifactType)).toMatchObject({
      primitiveId: "multiScale",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("scaleAwareViews")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("observability")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("causalAssumptions")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("multiScale");

    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "multiScale")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "scaleAwareViews")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
    }
    expect(getTemplateCapability("flocking-boids", "behaviorModes")?.notes).toContain("groupAware");
    expect(getTemplateCapability("flocking-boids", "multiScale")?.runtimeActive).toBe(false);
  });

  it("lets hybrid compositions reference scale models without making them runnable", () => {
    const composition = baseComposition({
      baseTemplateId: "flocking-boids",
      primitiveAttachments: [
        {
          id: "scale-ref",
          primitiveId: "multiScale",
          attachmentType: "scaleModel",
          mode: "reference",
          artifactType: scaleModelArtifactType,
          artifactId: "scale-model-1",
          active: true,
          required: true
        }
      ],
      requiredCapabilities: [{ primitiveId: "multiScale", requiredSupportLevel: "runtime" }]
    });
    const report = validateCompositionCapabilities(composition);
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.some((missing) => missing.primitiveId === "multiScale")).toBe(true);
    expect(() => deserializeHybridComposition(JSON.stringify({ schemaVersion: "1", artifactType: scaleModelArtifactType }))).toThrow(/artifact type/);
  });

  it("documents the camera-zoom and synthetic-detail boundaries", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Camera zoom is not multi-scale modeling.");
    expect(docs).toContain("Aggregation can lose information, and disaggregation can create synthetic detail.");
    expect(docs).toContain("A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics.");
  });

  it("keeps multiscale services headless and free of execution/randomness hooks", () => {
    const multiscaleDir = join(repoRoot, "src", "simulation", "multiscale");
    const source = readdirSync(multiscaleDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(multiscaleDir, file), "utf8"))
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
