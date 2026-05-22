import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  areQuantitiesDeclaredCompatible,
  boundaryModelArtifactType,
  causalAssumptionModelArtifactType,
  createDefaultScenario,
  createEngineFromScenario,
  delayQueueArtifactType,
  deserializeQuantitySemanticsModel,
  eventScheduleArtifactType,
  feedbackEventMetricsArtifactType,
  feedbackLoopsArtifactType,
  fieldLayerArtifactType,
  getArtifactFamily,
  getCompatibilityRule,
  getCompatibilityRulesForQuantity,
  getDimension,
  getPrimitive,
  getQuantity,
  getQuantitySemanticsWarnings,
  getTemplateCapability,
  getUnit,
  hybridCompositionArtifactType,
  listActiveQuantities,
  listCompatibilityRules,
  listCountQuantities,
  listDimensions,
  listProbabilityQuantities,
  listQuantities,
  listQuantitiesByDimension,
  listQuantitiesByKind,
  listQuantitiesByUnit,
  listRateQuantities,
  listReservedPrimitives,
  listResourceQuantities,
  listServiceOnlyPrimitives,
  listUnits,
  listUnitsForDimension,
  modelHasProbabilityQuantities,
  modelHasRateQuantities,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  observabilityModelArtifactType,
  productionTemplateMap,
  productionTemplates,
  quantitySemanticsModelArtifactType,
  resourceMetricsArtifactType,
  resourceSystemArtifactType,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeQuantitySemanticsModel,
  snapshotArtifactType,
  summarizeQuantitySemanticsModel,
  uncertaintyConfigArtifactType,
  uncertaintyResultArtifactType,
  validateCompositionCapabilities,
  validateQuantitySemanticsModel,
  validateQuantitySemanticsModelForRuntime,
  type HybridModelComposition,
  type QuantityDefinition,
  type QuantitySemanticsModel
} from "../index";

const repoRoot = process.cwd();

function quantityModel(overrides: Partial<QuantitySemanticsModel> = {}): QuantitySemanticsModel {
  return {
    schemaVersion: "1",
    artifactType: quantitySemanticsModelArtifactType,
    id: "quantity-model",
    name: "Quantity Model",
    version: "1.0.0",
    dimensions: [{ id: "count", label: "Count", dimensionKind: "count" }],
    units: [{ id: "cell-count", label: "Cell Count", symbol: "cells", dimensionId: "count", unitKind: "base", canonical: true }],
    quantities: [
      {
        id: "active-fire-count",
        label: "Active Fire Count",
        quantityKind: "count",
        unitId: "cell-count",
        dimensionId: "count",
        numericRole: "integer",
        active: false,
        executable: false
      }
    ],
    ...overrides
  };
}

function fullQuantityModel(overrides: Partial<QuantitySemanticsModel> = {}): QuantitySemanticsModel {
  return quantityModel({
    scope: {
      templateId: "forest-fire",
      observabilityModelId: "observability-1",
      causalAssumptionModelId: "causal-1",
      notes: ["Scope is structural only."]
    },
    dimensions: [
      { id: "count", label: "Count", dimensionKind: "count" },
      { id: "probability", label: "Probability", dimensionKind: "probability" },
      { id: "time", label: "Time", dimensionKind: "time" },
      {
        id: "per-tick-rate",
        label: "Per Tick Rate",
        dimensionKind: "rate",
        baseDimensions: [
          { dimensionId: "count", exponent: 1 },
          { dimensionId: "time", exponent: -1 }
        ]
      },
      { id: "dimensionless", label: "Dimensionless", dimensionKind: "dimensionless" },
      { id: "resource", label: "Resource", dimensionKind: "resource" }
    ],
    units: [
      { id: "cell-count", label: "Cell Count", symbol: "cells", dimensionId: "count", unitKind: "base", canonical: true },
      { id: "probability-unit", label: "Probability Unit", symbol: "p", dimensionId: "probability", unitKind: "dimensionless", canonical: true },
      { id: "tick", label: "Tick", symbol: "tick", dimensionId: "time", unitKind: "base", canonical: true },
      {
        id: "count-per-tick",
        label: "Count Per Tick",
        symbol: "cells/tick",
        dimensionId: "per-tick-rate",
        unitKind: "derived",
        canonical: true,
        conversionNotes: "Could be converted if a physical time mapping existed."
      },
      { id: "index-unit", label: "Index Unit", dimensionId: "dimensionless", unitKind: "index", canonical: true },
      { id: "fuel-unit", label: "Fuel Unit", dimensionId: "resource", unitKind: "base" }
    ],
    quantities: [
      quantityModel().quantities[0]!,
      {
        id: "spread-probability",
        label: "Spread Probability",
        quantityKind: "probability",
        unitId: "probability-unit",
        dimensionId: "probability",
        numericRole: "bounded01",
        validRange: { min: 0, max: 1, includeMin: true, includeMax: true },
        active: true,
        executable: false
      },
      {
        id: "new-ignitions-rate",
        label: "New Ignitions Rate",
        quantityKind: "rate",
        unitId: "count-per-tick",
        dimensionId: "per-tick-rate",
        numericRole: "nonNegative",
        perTick: true,
        perTimeUnitId: "tick",
        active: true,
        executable: false
      },
      {
        id: "fuel-index",
        label: "Fuel Index",
        quantityKind: "index",
        unitId: "index-unit",
        dimensionId: "dimensionless",
        numericRole: "bounded01",
        active: false,
        executable: false
      },
      {
        id: "fuel-stock",
        label: "Fuel Stock",
        quantityKind: "resourceStock",
        unitId: "fuel-unit",
        dimensionId: "resource",
        numericRole: "nonNegative",
        active: false,
        executable: false
      },
      {
        id: "burning-fraction",
        label: "Burning Fraction Metric",
        quantityKind: "metric",
        unitId: "probability-unit",
        dimensionId: "probability",
        targetPath: "metrics.burningFraction",
        numericRole: "bounded01",
        active: false,
        executable: false
      }
    ],
    compatibilityRules: [
      {
        id: "probability-index-conversion",
        label: "Probability Index Conversion",
        leftQuantityId: "spread-probability",
        rightQuantityId: "fuel-index",
        relation: "requiresConversion",
        executable: false
      },
      {
        id: "count-compatible",
        label: "Count Compatible",
        leftDimensionId: "count",
        rightDimensionId: "count",
        relation: "compatible",
        executable: false
      }
    ],
    ...overrides
  });
}

function composition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "quantity-composition",
    name: "Quantity Composition",
    version: "1.0.0",
    baseTemplateId: "forest-fire",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("units, dimensions, and quantity semantics services", () => {
  it("validates quantity semantics models conservatively", () => {
    expect(validateQuantitySemanticsModel(quantityModel()).id).toBe("quantity-model");
    expect(validateQuantitySemanticsModel(fullQuantityModel()).quantities).toHaveLength(6);
    expect(() => validateQuantitySemanticsModel(quantityModel({ id: "" }))).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ name: "" }))).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ artifactType: "ortus.causalAssumptionModel" as never }))).toThrow(
      /Invalid quantity semantics model/
    );
    expect(() => validateQuantitySemanticsModel(quantityModel({ version: "" }))).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel({ ...quantityModel(), dimensions: undefined })).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel({ ...quantityModel(), units: undefined })).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel({ ...quantityModel(), quantities: undefined })).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ dimensions: [quantityModel().dimensions[0]!, { ...quantityModel().dimensions[0]! }] }))).toThrow(
      /Duplicate dimension id/
    );
    expect(() => validateQuantitySemanticsModel(quantityModel({ units: [quantityModel().units[0]!, { ...quantityModel().units[0]! }] }))).toThrow(
      /Duplicate unit id/
    );
    expect(() => validateQuantitySemanticsModel(quantityModel({ quantities: [quantityModel().quantities[0]!, { ...quantityModel().quantities[0]! }] }))).toThrow(
      /Duplicate quantity id/
    );
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ compatibilityRules: [fullQuantityModel().compatibilityRules![0]!, { ...fullQuantityModel().compatibilityRules![0]! }] }))
    ).toThrow(/Duplicate compatibility rule id/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ dimensions: [{ ...quantityModel().dimensions[0]!, dimensionKind: "truth" as never }] }))).toThrow(
      /Invalid quantity semantics model/
    );
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ dimensions: [{ ...fullQuantityModel().dimensions[3]!, baseDimensions: [{ dimensionId: "missing", exponent: 1 }] }] }))
    ).toThrow(/unknown base dimensionId/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ dimensions: [{ ...fullQuantityModel().dimensions[3]!, baseDimensions: [{ dimensionId: "count", exponent: "one" as never }] }] }))
    ).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ units: [{ ...quantityModel().units[0]!, unitKind: "solver" as never }] }))).toThrow(
      /Invalid quantity semantics model/
    );
    expect(() => validateQuantitySemanticsModel(quantityModel({ units: [{ ...quantityModel().units[0]!, dimensionId: "missing" }] }))).toThrow(
      /unknown dimensionId/
    );
    expect(() =>
      validateQuantitySemanticsModel(quantityModel({ quantities: [{ ...quantityModel().quantities[0]!, quantityKind: "prediction" as never }] }))
    ).toThrow(/Invalid quantity semantics model/);
    expect(() =>
      validateQuantitySemanticsModel(quantityModel({ quantities: [{ ...quantityModel().quantities[0]!, numericRole: "calibrated" as never }] }))
    ).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ quantities: [{ ...quantityModel().quantities[0]!, unitId: "missing" }] }))).toThrow(
      /unknown unitId/
    );
    expect(() => validateQuantitySemanticsModel(quantityModel({ quantities: [{ ...quantityModel().quantities[0]!, dimensionId: "missing" }] }))).toThrow(
      /unknown dimensionId/
    );
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ quantities: [{ ...fullQuantityModel().quantities[0]!, executable: true as never }] }))
    ).toThrow(/Invalid quantity semantics model/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ quantities: [{ ...fullQuantityModel().quantities[0]!, validRange: {} }], compatibilityRules: [] }))
    ).toThrow(/validRange requires/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ quantities: [{ ...fullQuantityModel().quantities[0]!, validRange: { min: Infinity } }], compatibilityRules: [] }))
    ).toThrow(/non-finite|Invalid quantity semantics model/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ quantities: [{ ...fullQuantityModel().quantities[0]!, validRange: { min: 2, max: 1 } }], compatibilityRules: [] }))
    ).toThrow(/min/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ quantities: [{ ...fullQuantityModel().quantities[1]!, validRange: { min: -0.1, max: 1 } }], compatibilityRules: [] }))
    ).toThrow(/bounded01/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ quantities: [{ ...fullQuantityModel().quantities[0]!, extensive: true, intensive: true }] }))
    ).toThrow(/extensive and intensive/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ compatibilityRules: [{ ...fullQuantityModel().compatibilityRules![0]!, leftQuantityId: "missing" }] }))
    ).toThrow(/unknown leftQuantityId/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ compatibilityRules: [{ ...fullQuantityModel().compatibilityRules![1]!, leftDimensionId: "missing" }] }))
    ).toThrow(/unknown leftDimensionId/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ compatibilityRules: [{ ...fullQuantityModel().compatibilityRules![0]!, relation: "solves" as never }] }))
    ).toThrow(/Invalid quantity semantics model/);
    expect(() =>
      validateQuantitySemanticsModel(fullQuantityModel({ compatibilityRules: [{ ...fullQuantityModel().compatibilityRules![0]!, executable: true as never }] }))
    ).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel({ ...quantityModel(), extra: true })).toThrow(/Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { world: { tick: 1 } } }))).toThrow(/live-state|executable/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { formula: "x + y" } }))).toThrow(/formula/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { equation: "m/s" } }))).toThrow(/equation/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { solver: "dimensional" } }))).toThrow(/solver/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { unitConverter: "auto" } }))).toThrow(/unitConverter/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { calibration: "fit" } }))).toThrow(/calibration/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { likelihood: "p\\(y\\)" } }))).toThrow(/likelihood/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { proof: "certified" } }))).toThrow(/proof/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { certification: "valid" } }))).toThrow(/certification/);
    expect(() => validateQuantitySemanticsModel(quantityModel({ metadata: { huge: "x".repeat(230_000) } }))).toThrow(/Quantity semantics model/);
    expect(() => validateQuantitySemanticsModel(new Date())).toThrow(/plain JSON|Invalid quantity semantics model/);
    expect(() => validateQuantitySemanticsModel({ ...quantityModel(), metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid quantity semantics model|executable-shaped/
    );

    const mismatch = fullQuantityModel({
      quantities: [{ ...fullQuantityModel().quantities[0]!, unitId: "probability-unit", dimensionId: "count" }],
      compatibilityRules: []
    });
    expect(validateQuantitySemanticsModel(mismatch).id).toBe("quantity-model");
    expect(getQuantitySemanticsWarnings(mismatch).join(" ")).toMatch(/differs from declared dimension/);
  });

  it("surfaces quantity warnings without implying conversion, calibration, validation, or enforcement", () => {
    const warned = fullQuantityModel({
      scope: { templateId: "forest-fire", observabilityModelId: "obs-1", causalAssumptionModelId: "causal-1" },
      units: [
        ...fullQuantityModel().units,
        {
          id: "probability-alt",
          label: "Probability Alt",
          dimensionId: "probability",
          unitKind: "dimensionless",
          canonical: true
        },
        { id: "category-unit", label: "Category", dimensionId: "dimensionless", unitKind: "category", canonical: false }
      ],
      quantities: [
        ...fullQuantityModel().quantities,
        {
          id: "untyped",
          label: "Untyped Quantity",
          quantityKind: "state",
          numericRole: "unknown",
          active: false,
          executable: false
        },
        {
          id: "loose-probability",
          label: "Loose Probability",
          quantityKind: "probability",
          dimensionId: "probability",
          numericRole: "continuous",
          active: false,
          executable: false
        },
        {
          id: "loose-count",
          label: "Loose Count",
          quantityKind: "count",
          dimensionId: "count",
          numericRole: "continuous",
          active: false,
          executable: false
        },
        {
          id: "basisless-rate",
          label: "Basisless Rate",
          quantityKind: "rate",
          dimensionId: "per-tick-rate",
          numericRole: "nonNegative",
          active: false,
          executable: false
        }
      ],
      compatibilityRules: [
        ...fullQuantityModel().compatibilityRules!,
        {
          id: "unknown-rule",
          label: "Unknown Rule",
          leftDimensionId: "count",
          rightDimensionId: "probability",
          relation: "unknown",
          executable: false
        }
      ]
    });
    const warnings = getQuantitySemanticsWarnings(warned).join(" ");
    expect(warnings).toMatch(/neither unitId nor dimensionId/);
    expect(warnings).toMatch(/Probability quantity loose-probability is not declared with bounded01/);
    expect(warnings).toMatch(/bounded01 numericRole outside a probability quantity/);
    expect(warnings).toMatch(/Count quantity loose-count is not declared as integer or nonNegative/);
    expect(warnings).toMatch(/Rate quantity basisless-rate has no per-tick, per-time, per-space, or per-entity basis/);
    expect(warnings).toMatch(/tick is model time, not physical time/);
    expect(warnings).toMatch(/conversionNotes.*does not execute conversion/);
    expect(warnings).toMatch(/requiresConversion.*conversion is structural only/);
    expect(warnings).toMatch(/index\/category units may be invalid/);
    expect(warnings).toMatch(/dimensionless\/index\/category-like/);
    expect(warnings).toMatch(/Resource quantity fuel-stock has no resourceSystemId/);
    expect(warnings).toMatch(/Metric quantity burning-fraction unit semantics are declarations, not empirical validation/);
    expect(warnings).toMatch(/measurement units do not imply measurement validity/);
    expect(warnings).toMatch(/unit consistency does not imply causal validity or proof/);
    expect(warnings).toMatch(/Active quantity spread-probability is a structural declaration/);
    expect(warnings).toMatch(/Dimension resource has no canonical unit declaration/);
    expect(warnings).toMatch(/Dimension probability has multiple canonical units/);
    expect(warnings).toMatch(/unknown compatibility semantics/);
    expect(warnings).not.toMatch(/will convert|empirically valid/i);

    const report = validateQuantitySemanticsModelForRuntime(warned);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "unitsDimensionalConsistency", requiredSupportLevel: "runtime" });
    expect(report.warnings.join(" ")).toContain("do not enforce runtime unit conversion or dimensional consistency");
  });

  it("queries and summarizes quantity semantics without mutating input", () => {
    const model = fullQuantityModel();
    const before = JSON.stringify(model);
    expect(listDimensions(model).map((dimension) => dimension.id)).toEqual(["count", "probability", "time", "per-tick-rate", "dimensionless", "resource"]);
    expect(getDimension(model, "probability")?.dimensionKind).toBe("probability");
    expect(listUnits(model)).toHaveLength(6);
    expect(getUnit(model, "cell-count")?.dimensionId).toBe("count");
    expect(listUnitsForDimension(model, "probability").map((unit) => unit.id)).toEqual(["probability-unit"]);
    expect(listQuantities(model)).toHaveLength(6);
    expect(listActiveQuantities(model).map((quantity) => quantity.id)).toEqual(["spread-probability", "new-ignitions-rate"]);
    expect(getQuantity(model, "spread-probability")?.numericRole).toBe("bounded01");
    expect(listQuantitiesByKind(model, "metric").map((quantity) => quantity.id)).toEqual(["burning-fraction"]);
    expect(listQuantitiesByDimension(model, "probability").map((quantity) => quantity.id)).toEqual(["spread-probability", "burning-fraction"]);
    expect(listQuantitiesByUnit(model, "probability-unit").map((quantity) => quantity.id)).toEqual(["spread-probability", "burning-fraction"]);
    expect(listProbabilityQuantities(model).map((quantity) => quantity.id)).toEqual(["spread-probability"]);
    expect(listRateQuantities(model).map((quantity) => quantity.id)).toEqual(["new-ignitions-rate"]);
    expect(listCountQuantities(model).map((quantity) => quantity.id)).toEqual(["active-fire-count"]);
    expect(listResourceQuantities(model).map((quantity) => quantity.id)).toEqual(["fuel-stock"]);
    expect(listCompatibilityRules(model)).toHaveLength(2);
    expect(getCompatibilityRule(model, "probability-index-conversion")?.relation).toBe("requiresConversion");
    expect(getCompatibilityRulesForQuantity(model, "spread-probability").map((rule) => rule.id)).toEqual(["probability-index-conversion"]);
    expect(areQuantitiesDeclaredCompatible(model, "spread-probability", "fuel-index")).toBe(true);
    expect(areQuantitiesDeclaredCompatible(model, "spread-probability", "fuel-stock")).toBe(false);
    expect(listCompatibilityRules(quantityModel())).toEqual([]);
    expect(getCompatibilityRule(quantityModel(), "missing")).toBeUndefined();
    expect(getCompatibilityRulesForQuantity(quantityModel(), "active-fire-count")).toEqual([]);
    expect(areQuantitiesDeclaredCompatible(quantityModel(), "active-fire-count", "missing")).toBe(false);
    expect(modelHasProbabilityQuantities(model)).toBe(true);
    expect(modelHasRateQuantities(model)).toBe(true);
    expect(summarizeQuantitySemanticsModel(model)).toMatchObject({
      id: "quantity-model",
      dimensionCount: 6,
      unitCount: 6,
      quantityCount: 6,
      activeQuantityCount: 2,
      probabilityQuantityCount: 1,
      rateQuantityCount: 1,
      countQuantityCount: 1,
      resourceQuantityCount: 1,
      dimensionlessQuantityCount: 1,
      compatibilityRuleCount: 2,
      executableCount: 0
    });
    expect(JSON.stringify(model)).toBe(before);
    const returned = listQuantities(model)[0] as QuantityDefinition;
    (returned as { label: string }).label = "Mutated";
    expect(listQuantities(model)[0]?.label).toBe("Active Fire Count");
  });

  it("serializes only quantity-semantics artifacts and rejects other artifact families", () => {
    const model = fullQuantityModel();
    const json = serializeQuantitySemanticsModel(model);
    expect(json).toContain(`"artifactType": "${quantitySemanticsModelArtifactType}"`);
    expect(deserializeQuantitySemanticsModel(json)).toMatchObject({ id: "quantity-model", artifactType: quantitySemanticsModelArtifactType });
    for (const artifactType of [
      "ortus.scenario",
      snapshotArtifactType,
      uncertaintyConfigArtifactType,
      uncertaintyResultArtifactType,
      "ortus.assumptionProfile",
      networkDefinitionArtifactType,
      networkMetricsArtifactType,
      resourceSystemArtifactType,
      resourceMetricsArtifactType,
      eventScheduleArtifactType,
      delayQueueArtifactType,
      feedbackLoopsArtifactType,
      feedbackEventMetricsArtifactType,
      hybridCompositionArtifactType,
      scaleModelArtifactType,
      scaleViewStateArtifactType,
      boundaryModelArtifactType,
      fieldLayerArtifactType,
      observabilityModelArtifactType,
      causalAssumptionModelArtifactType
    ]) {
      expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ schemaVersion: "1", artifactType: quantitySemanticsModelArtifactType }))).toThrow(
      /Invalid quantity semantics model/
    );
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(
      /external-data/
    );
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { equation: "distance/time" } }))).toThrow(/equation/);
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { solver: "symbolic" } }))).toThrow(/solver/);
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { conversionFunction: "x => x" } }))).toThrow(
      /conversionFunction/
    );
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { calibrationResult: "fit" } }))).toThrow(
      /calibrationResult/
    );
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { likelihood: "p(y)" } }))).toThrow(/likelihood/);
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { proof: "certified" } }))).toThrow(/proof/);
    expect(() => deserializeQuantitySemanticsModel(JSON.stringify({ ...model, metadata: { certification: "valid" } }))).toThrow(
      /certification/
    );
    expect(() => deserializeQuantitySemanticsModel({ ...model, metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid quantity semantics model|executable-shaped/
    );
  });

  it("updates registry and template capabilities without making templates quantity-runtime capable", () => {
    expect(getPrimitive("unitsDimensionalConsistency")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("unitsDimensionalConsistency");
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("unitsDimensionalConsistency");
    expect(getArtifactFamily(quantitySemanticsModelArtifactType)).toMatchObject({
      primitiveId: "unitsDimensionalConsistency",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("validationCalibration")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("externalFrameworkInterop")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("modelDefinitionSchema")).toMatchObject({ status: "reserved" });
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "unitsDimensionalConsistency")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "validationCalibration")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "modelDefinitionSchema")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "externalFrameworkInterop")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
    expect(getTemplateCapability("forest-fire", "unitsDimensionalConsistency")?.notes).toContain("Parameter labels, metric labels");
  });

  it("keeps observability, causality, resources, feedback, metrics, and parameters distinct from quantity runtime support", () => {
    const template = productionTemplateMap["forest-fire"];
    const scenario = createDefaultScenario({ template, scenarioId: "forest-quantity-distinction", seed: "forest-quantity", now: "2026-05-19T12:00:00.000Z" });
    const { engine } = createEngineFromScenario(scenario);
    engine.runSteps(2);
    const latestMetrics = engine.createSnapshot().metricsHistory.at(-1)?.values;
    expect(latestMetrics?.burningFraction).toBeDefined();
    expect(getTemplateCapability("forest-fire", "unitsDimensionalConsistency")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "observability")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "causalAssumptions")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "resources")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
    expect(getTemplateCapability("forest-fire", "feedbackEvents")).toMatchObject({ runtimeActive: false, serviceAvailable: true });

    const profileText = JSON.stringify(template.assumptionProfile).toLowerCase();
    expect(profileText).toContain("template parameter labels, metric labels, and numeric bounds are not full runtime unit or dimension semantics");
    expect(profileText).toContain("forest-fire probability parameters are stylized model probabilities, not measured wildfire probabilities");
    expect(profileText).not.toContain("calibrated wildfire probability");

    const warnings = getQuantitySemanticsWarnings(fullQuantityModel()).join(" ");
    expect(warnings).toMatch(/measurement units do not imply measurement validity/);
    expect(warnings).toMatch(/unit consistency does not imply causal validity or proof/);
    expect(warnings).toMatch(/Resource quantity fuel-stock has no resourceSystemId/);
  });

  it("keeps quantity composition references structural and non-runnable for runtime requirements", () => {
    const report = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "quantity-ref",
            primitiveId: "unitsDimensionalConsistency",
            attachmentType: "quantitySemanticsModel",
            mode: "reference",
            artifactType: quantitySemanticsModelArtifactType,
            artifactId: "quantity-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "unitsDimensionalConsistency", requiredSupportLevel: "runtime" }]
      })
    );
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toContain("unitsDimensionalConsistency");

    const validationRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "quantity-ref",
            primitiveId: "unitsDimensionalConsistency",
            attachmentType: "quantitySemanticsModel",
            mode: "reference",
            artifactType: quantitySemanticsModelArtifactType,
            artifactId: "quantity-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "validationCalibration", requiredSupportLevel: "metadata" }]
      })
    );
    expect(validationRequirement.runnableNow).toBe(false);
    expect(validationRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("validationCalibration");

    const schemaRequirement = validateCompositionCapabilities(
      composition({
        requiredCapabilities: [{ primitiveId: "modelDefinitionSchema", requiredSupportLevel: "metadata" }]
      })
    );
    expect(schemaRequirement.runnableNow).toBe(false);
    expect(schemaRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("modelDefinitionSchema");
  });

  it("documents quantity boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics.");
    expect(docs).toContain("Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency.");
    expect(docs).toContain("Per-tick rates are model-time rates unless a physical time mapping is explicitly defined.");
    expect(docs).toContain("Do not treat parameter labels/ranges as full unit semantics.");
    expect(docs).toContain("Do not mark templates quantity-semantics-capable unless runtime uses `QuantitySemanticsModel`.");
    expect(docs).toContain("Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies.");

    const quantitiesDir = join(repoRoot, "src", "simulation", "quantities");
    const source = readdirSync(quantitiesDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(quantitiesDir, file), "utf8"))
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
    expect(source).not.toMatch(/from ["'][^"']*\/(renderer|components|app|symbolic|algebra|solver|calibration|mcmc|filter|kalman|particle|unit-conversion|compiler|visualBuilder)(\/|["'])/);
  });
});
