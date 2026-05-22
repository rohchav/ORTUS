import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  boundaryModelArtifactType,
  deserializeSpatialFieldModel,
  fieldLayerArtifactType,
  getArtifactFamily,
  getCoordinateSpace,
  getField,
  getFieldsForLayer,
  getLayer,
  getPrimitive,
  getSamplingRulesForField,
  getSpatialFieldWarnings,
  getTemplateCapability,
  hybridCompositionArtifactType,
  listActiveFields,
  listActiveLayers,
  listFields,
  listLayers,
  listReservedPrimitives,
  listSamplingRules,
  listServiceOnlyPrimitives,
  modelHasMeasuredFields,
  modelHasPlaceholderFields,
  modelHasSyntheticFields,
  productionTemplates,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeSpatialFieldModel,
  summarizeSpatialFieldModel,
  validateCompositionCapabilities,
  validateSpatialFieldModel,
  validateSpatialFieldModelForRuntime,
  type HybridModelComposition,
  type SpatialFieldModel
} from "../index";

const repoRoot = process.cwd();

function spatialModel(overrides: Partial<SpatialFieldModel> = {}): SpatialFieldModel {
  return {
    schemaVersion: "1",
    artifactType: fieldLayerArtifactType,
    id: "field-model",
    name: "Field Model",
    version: "1.0.0",
    coordinateSpace: {
      id: "space",
      label: "World Space",
      spaceType: "grid2D",
      extent: { minX: 0, maxX: 100, minY: 0, maxY: 50 },
      resolution: { rows: 10, columns: 20 },
      unit: "meters"
    },
    fields: [
      {
        id: "temperature",
        label: "Temperature",
        fieldType: "scalar",
        valueType: "number",
        unit: "C",
        valueSource: "declared",
        active: true,
        executable: false,
        notes: ["Declared environmental context only."]
      }
    ],
    ...overrides
  };
}

function layeredSpatialModel(overrides: Partial<SpatialFieldModel> = {}): SpatialFieldModel {
  return spatialModel({
    fields: [
      spatialModel().fields[0]!,
      {
        id: "risk",
        label: "Risk",
        fieldType: "probabilityLike",
        valueType: "number",
        valueSource: "synthetic",
        active: true,
        executable: false,
        notes: ["Synthetic risk surface for structural context only."]
      }
    ],
    layers: [
      {
        id: "climate",
        label: "Climate",
        layerType: "climate",
        fieldIds: ["temperature"],
        active: true,
        executable: false
      },
      {
        id: "risk-layer",
        label: "Risk Layer",
        layerType: "risk",
        fieldIds: ["risk"],
        active: false,
        executable: false
      }
    ],
    samplingRules: [
      {
        id: "temperature-sample",
        label: "Temperature Sample",
        fieldId: "temperature",
        samplingType: "nearest",
        extrapolationPolicy: "reject",
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
    id: "field-composition",
    name: "Field Composition",
    version: "1.0.0",
    baseTemplateId: "epidemic-spread",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("spatial field and environmental layer services", () => {
  it("validates spatial field models conservatively", () => {
    expect(validateSpatialFieldModel(spatialModel()).id).toBe("field-model");
    expect(validateSpatialFieldModel(layeredSpatialModel()).layers?.[0]?.id).toBe("climate");
    expect(() => validateSpatialFieldModel(spatialModel({ id: "" }))).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel(spatialModel({ name: "" }))).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel(spatialModel({ artifactType: "ortus.boundaryModel" as never }))).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel(spatialModel({ version: "" }))).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel({ ...spatialModel(), coordinateSpace: undefined })).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel(spatialModel({ coordinateSpace: { ...spatialModel().coordinateSpace, spaceType: "raster" as never } }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() =>
      validateSpatialFieldModel(spatialModel({ coordinateSpace: { ...spatialModel().coordinateSpace, extent: { minX: 1, maxX: 1, minY: 0, maxY: 1 } } }))
    ).toThrow(/extent/);
    expect(() =>
      validateSpatialFieldModel(spatialModel({ coordinateSpace: { ...spatialModel().coordinateSpace, extent: { minX: 0, maxX: Infinity, minY: 0, maxY: 1 } } }))
    ).toThrow(/non-finite/);
    expect(() =>
      validateSpatialFieldModel(spatialModel({ coordinateSpace: { ...spatialModel().coordinateSpace, resolution: { dx: -1 } } }))
    ).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel({ ...spatialModel(), fields: undefined })).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel(spatialModel({ fields: [spatialModel().fields[0]!, { ...spatialModel().fields[0]! }] }))).toThrow(
      /Duplicate field id/
    );
    expect(() => validateSpatialFieldModel(layeredSpatialModel({ layers: [layeredSpatialModel().layers![0]!, { ...layeredSpatialModel().layers![0]! }] }))).toThrow(
      /Duplicate environmental layer id/
    );
    expect(() =>
      validateSpatialFieldModel(layeredSpatialModel({ samplingRules: [layeredSpatialModel().samplingRules![0]!, { ...layeredSpatialModel().samplingRules![0]! }] }))
    ).toThrow(/Duplicate sampling rule id/);
    expect(() => validateSpatialFieldModel(spatialModel({ fields: [{ ...spatialModel().fields[0]!, fieldType: "heightmap" as never }] }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() => validateSpatialFieldModel(spatialModel({ fields: [{ ...spatialModel().fields[0]!, valueType: "matrix" as never }] }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() => validateSpatialFieldModel(spatialModel({ fields: [{ ...spatialModel().fields[0]!, valueSource: "observed" as never }] }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() => validateSpatialFieldModel(spatialModel({ fields: [{ ...spatialModel().fields[0]!, executable: true as never }] }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() => validateSpatialFieldModel(layeredSpatialModel({ layers: [{ ...layeredSpatialModel().layers![0]!, layerType: "soil" as never }] }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() => validateSpatialFieldModel(layeredSpatialModel({ layers: [{ ...layeredSpatialModel().layers![0]!, fieldIds: ["missing"] }] }))).toThrow(
      /unknown fieldId/
    );
    expect(() => validateSpatialFieldModel(layeredSpatialModel({ layers: [{ ...layeredSpatialModel().layers![0]!, executable: true as never }] }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() => validateSpatialFieldModel(layeredSpatialModel({ samplingRules: [{ ...layeredSpatialModel().samplingRules![0]!, fieldId: "missing" }] }))).toThrow(
      /unknown fieldId/
    );
    expect(() =>
      validateSpatialFieldModel(layeredSpatialModel({ samplingRules: [{ ...layeredSpatialModel().samplingRules![0]!, samplingType: "kriging" as never }] }))
    ).toThrow(/Invalid spatial field model/);
    expect(() =>
      validateSpatialFieldModel(layeredSpatialModel({ samplingRules: [{ ...layeredSpatialModel().samplingRules![0]!, extrapolationPolicy: "linear" as never }] }))
    ).toThrow(/Invalid spatial field model/);
    expect(() =>
      validateSpatialFieldModel(layeredSpatialModel({ samplingRules: [{ ...layeredSpatialModel().samplingRules![0]!, executable: true as never }] }))
    ).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel({ ...spatialModel(), extra: true })).toThrow(/Invalid spatial field model/);
    expect(() => validateSpatialFieldModel(spatialModel({ metadata: { world: { tick: 1 } } }))).toThrow(/live-state|executable/);
    expect(() => validateSpatialFieldModel(spatialModel({ metadata: { formula: "x + y" } }))).toThrow(/live-state|executable/);
    expect(() => validateSpatialFieldModel(spatialModel({ metadata: { gridValues: [[1, 2, 3]] } }))).toThrow(/raster\/value-grid/);
    expect(() => validateSpatialFieldModel(spatialModel({ metadata: { huge: "x".repeat(230_000) } }))).toThrow(/Spatial field model/);
    expect(() => validateSpatialFieldModel(new Date())).toThrow(/plain JSON|Invalid spatial field model/);
  });

  it("surfaces spatial-field warnings without implying calibration, prediction, or runtime execution", () => {
    const warned = spatialModel({
      coordinateSpace: { id: "space", label: "Sparse Grid", spaceType: "grid2D" },
      fields: [
        { id: "risk", label: "Risk", fieldType: "probabilityLike", valueType: "number", valueSource: "synthetic", active: true, executable: false },
        { id: "sensor", label: "Sensor", fieldType: "scalar", valueType: "number", valueSource: "measured", active: false, executable: false },
        { id: "placeholder", label: "Placeholder", fieldType: "scalar", valueType: "number", valueSource: "placeholder", active: true, executable: false }
      ],
      layers: [{ id: "empty-layer", label: "Empty", layerType: "terrain", fieldIds: [], active: true, executable: false }],
      samplingRules: [{ id: "risk-sample", label: "Risk Sample", fieldId: "risk", samplingType: "nearest", extrapolationPolicy: "unknown", executable: false }]
    });
    const warnings = getSpatialFieldWarnings(warned).join(" ");
    expect(warnings).toMatch(/not a calibrated probability/);
    expect(warnings).toMatch(/Measured field sensor has no provenance/);
    expect(warnings).toMatch(/Synthetic field risk has no synthetic-detail/);
    expect(warnings).toMatch(/Placeholder field placeholder is active/);
    expect(warnings).toMatch(/structural declaration/);
    expect(warnings).toMatch(/no extent/);
    expect(warnings).toMatch(/Grid coordinate space has no resolution/);
    expect(warnings).toMatch(/unknown extrapolation policy/);
    expect(warnings).toMatch(/Environmental layer empty-layer has no fields/);
    expect(warnings).not.toMatch(/causal proof|predict/i);

    const continuousWarnings = getSpatialFieldWarnings(
      spatialModel({ coordinateSpace: { id: "continuous", label: "Continuous", spaceType: "continuous2D" } })
    ).join(" ");
    expect(continuousWarnings).toMatch(/Continuous coordinate space has no unit/);

    const report = validateSpatialFieldModelForRuntime(warned);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "spatialFields", requiredSupportLevel: "runtime" });
    expect(report.warnings.join(" ")).toContain("Spatial fields are structural layer definitions");
  });

  it("queries and summarizes spatial field structure without mutating input", () => {
    const model = layeredSpatialModel();
    const before = JSON.stringify(model);
    expect(getCoordinateSpace(model).spaceType).toBe("grid2D");
    expect(listFields(model).map((field) => field.id)).toEqual(["temperature", "risk"]);
    expect(listActiveFields(model).map((field) => field.id)).toEqual(["temperature", "risk"]);
    expect(getField(model, "risk")?.fieldType).toBe("probabilityLike");
    expect(listLayers(model).map((layer) => layer.id)).toEqual(["climate", "risk-layer"]);
    expect(listActiveLayers(model).map((layer) => layer.id)).toEqual(["climate"]);
    expect(getLayer(model, "climate")?.layerType).toBe("climate");
    expect(getFieldsForLayer(model, "climate").map((field) => field.id)).toEqual(["temperature"]);
    expect(listSamplingRules(model).map((rule) => rule.id)).toEqual(["temperature-sample"]);
    expect(getSamplingRulesForField(model, "temperature").map((rule) => rule.id)).toEqual(["temperature-sample"]);
    expect(modelHasSyntheticFields(model)).toBe(true);
    expect(modelHasMeasuredFields(model)).toBe(false);
    expect(modelHasPlaceholderFields(model)).toBe(false);
    expect(summarizeSpatialFieldModel(model)).toMatchObject({
      id: "field-model",
      coordinateSpaceType: "grid2D",
      fieldCount: 2,
      activeFieldCount: 2,
      layerCount: 2,
      activeLayerCount: 1,
      samplingRuleCount: 1,
      syntheticFieldCount: 1,
      measuredFieldCount: 0,
      placeholderFieldCount: 0,
      executableCount: 0
    });
    expect(JSON.stringify(model)).toBe(before);
    const returnedField = listFields(model)[0] as { label: string };
    returnedField.label = "Mutated";
    expect(getField(model, "temperature")?.label).toBe("Temperature");
    expect(getFieldsForLayer(model, "missing")).toEqual([]);
    expect(getSamplingRulesForField(model, "missing")).toEqual([]);
  });

  it("serializes only spatial field artifacts and rejects other artifact families", () => {
    const model = layeredSpatialModel();
    const json = serializeSpatialFieldModel(model);
    expect(json).toContain(`"artifactType": "${fieldLayerArtifactType}"`);
    expect(deserializeSpatialFieldModel(json)).toMatchObject({ id: "field-model", artifactType: fieldLayerArtifactType });
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
      hybridCompositionArtifactType,
      scaleModelArtifactType,
      scaleViewStateArtifactType,
      boundaryModelArtifactType
    ]) {
      expect(() => deserializeSpatialFieldModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeSpatialFieldModel(JSON.stringify({ schemaVersion: "1", artifactType: fieldLayerArtifactType }))).toThrow(
      /Invalid spatial field model/
    );
    expect(() => deserializeSpatialFieldModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeSpatialFieldModel({ ...model, metadata: { callback: () => null } })).toThrow(/plain JSON|Invalid spatial field model/);
  });

  it("updates registry and template capabilities without making templates spatial-field aware", () => {
    expect(getPrimitive("spatialFields")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toEqual(expect.arrayContaining(["spatialFields", "boundariesEnvironment"]));
    expect(getArtifactFamily(fieldLayerArtifactType)).toMatchObject({
      primitiveId: "spatialFields",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("boundariesEnvironment")).toMatchObject({ status: "serviceOnly" });
    expect(getPrimitive("observability")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("causalAssumptions")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("spatialFields");
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "spatialFields")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "boundariesEnvironment")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "observability")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
    expect(getTemplateCapability("flocking-boids", "spatialFields")?.runtimeActive).toBe(false);
    expect(getTemplateCapability("schelling-segregation", "spatialFields")?.runtimeActive).toBe(false);
    expect(getTemplateCapability("predator-prey", "spatialFields")?.runtimeActive).toBe(false);
  });

  it("keeps template assumption notes concise and honest about spatial-field limitations", () => {
    for (const template of productionTemplates) {
      const text = JSON.stringify(template.assumptionProfile).toLowerCase();
      expect(text).toMatch(/spatial field|field layer|environmental field/);
      expect(text).not.toMatch(/spatial-field capable|runtime-active spatial|field-layer support|calibrated probability field|causal proof/i);
    }
    expect(JSON.stringify(productionTemplates.find((template) => template.id === "flocking-boids")?.assumptionProfile)).toContain(
      "positions as environmental field layers"
    );
    expect(JSON.stringify(productionTemplates.find((template) => template.id === "schelling-segregation")?.assumptionProfile)).toContain(
      "grid occupancy as an environmental field layer"
    );
    expect(JSON.stringify(productionTemplates.find((template) => template.id === "predator-prey")?.assumptionProfile)).toContain(
      "spatial fields or environmental layers"
    );
  });

  it("keeps boundary and field-layer composition references distinct and non-runnable for runtime requirements", () => {
    const fieldReport = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "field-ref",
            primitiveId: "spatialFields",
            attachmentType: "fieldLayer",
            mode: "reference",
            artifactType: fieldLayerArtifactType,
            artifactId: "field-model-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "spatialFields", requiredSupportLevel: "runtime" }]
      })
    );
    expect(fieldReport.valid).toBe(true);
    expect(fieldReport.runnableNow).toBe(false);
    expect(fieldReport.missingCapabilities.map((missing) => missing.primitiveId)).toContain("spatialFields");

    const boundaryRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "field-ref",
            primitiveId: "spatialFields",
            attachmentType: "fieldLayer",
            mode: "reference",
            artifactType: fieldLayerArtifactType,
            artifactId: "field-model-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "boundariesEnvironment", requiredSupportLevel: "runtime" }]
      })
    );
    expect(boundaryRequirement.runnableNow).toBe(false);
    expect(boundaryRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("boundariesEnvironment");

    const spatialRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "boundary-ref",
            primitiveId: "boundariesEnvironment",
            attachmentType: "boundaryModel",
            mode: "reference",
            artifactType: boundaryModelArtifactType,
            artifactId: "boundary-model-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "spatialFields", requiredSupportLevel: "runtime" }]
      })
    );
    expect(spatialRequirement.runnableNow).toBe(false);
    expect(spatialRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("spatialFields");
  });

  it("documents spatial-field boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Spatial fields are structural layer definitions, not runtime diffusion or GIS engines.");
    expect(docs).toContain("World coordinates, grids, and positions are not the same as explicit environmental field layers.");
    expect(docs).toContain("A probability-like field is not a calibrated probability unless calibration is explicitly implemented and documented.");
    expect(docs).toContain("Prompt 25 adds Observability + Measurement Model V1 as structural measurement metadata.");

    const spatialDir = join(repoRoot, "src", "simulation", "spatialFields");
    const source = readdirSync(spatialDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(spatialDir, file), "utf8"))
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
    expect(source).not.toContain("WorldStage");
    expect(source).not.toMatch(/from ["'][^"']*\/(renderer|components|app|gis|diffusion|advection|physics|solver|compiler|visualBuilder)(\/|["'])/);
  });
});
