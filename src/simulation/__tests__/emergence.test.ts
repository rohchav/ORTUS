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
  deserializeEmergencePatternModel,
  emergencePatternModelArtifactType,
  eventScheduleArtifactType,
  feedbackEventMetricsArtifactType,
  feedbackLoopsArtifactType,
  fieldLayerArtifactType,
  getArtifactFamily,
  getEmergencePatternWarnings,
  getPatternDescriptor,
  getPatternScaleLink,
  getPatternSignature,
  getPatternThreshold,
  getPatternTimeWindow,
  getPatternVariable,
  getPrimitive,
  getScaleLinksForDescriptor,
  getSignaturesForDescriptor,
  getTemplateCapability,
  getThresholdsForDescriptor,
  getTimeWindowsForDescriptor,
  hybridCompositionArtifactType,
  listActivePatternDescriptors,
  listCandidatePatternDescriptors,
  listObservedPatternDescriptors,
  listPatternDescriptors,
  listPatternDescriptorsByKind,
  listPatternDescriptorsByStatus,
  listPatternScaleLinks,
  listPatternSignatures,
  listPatternThresholds,
  listPatternTimeWindows,
  listPatternVariables,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  modelHasCandidatePatterns,
  modelHasExternallyValidatedPatterns,
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
  serializeEmergencePatternModel,
  snapshotArtifactType,
  summarizeEmergencePatternModel,
  uncertaintyConfigArtifactType,
  uncertaintyResultArtifactType,
  validateCompositionCapabilities,
  validateEmergencePatternModel,
  validateEmergencePatternModelForRuntime,
  type EmergencePatternModel,
  type HybridModelComposition,
  type PatternDescriptor
} from "../index";

const repoRoot = process.cwd();

function emergenceModel(overrides: Partial<EmergencePatternModel> = {}): EmergencePatternModel {
  return {
    schemaVersion: "1",
    artifactType: emergencePatternModelArtifactType,
    id: "emergence-model",
    name: "Emergence Model",
    version: "1.0.0",
    descriptors: [
      {
        id: "candidate-cascade",
        label: "Candidate Cascade",
        patternKind: "cascade",
        status: "candidate",
        active: false,
        executable: false
      }
    ],
    ...overrides
  };
}

function fullEmergenceModel(overrides: Partial<EmergencePatternModel> = {}): EmergencePatternModel {
  return emergenceModel({
    scope: {
      templateId: "forest-fire",
      observabilityModelId: "observability-1",
      causalAssumptionModelId: "causal-1",
      quantitySemanticsModelId: "quantity-1",
      scaleModelId: "scale-1",
      scaleViewStateId: "scale-view-1",
      notes: ["Scope is structural only."]
    },
    patternVariables: [
      {
        id: "burning-fraction",
        label: "Burning Fraction",
        variableKind: "metric",
        targetPath: "metrics.burningFraction",
        metricId: "burningFraction",
        quantityId: "burning-fraction"
      },
      {
        id: "cell-state",
        label: "Cell State",
        variableKind: "state",
        targetPath: "cells.state"
      }
    ],
    thresholds: [
      {
        id: "burning-threshold",
        label: "Burning Threshold",
        thresholdKind: "absolute",
        valueDescription: "burningFraction exceeds a declared model-output threshold.",
        quantityId: "burning-fraction",
        unitId: "probability-unit"
      }
    ],
    timeWindows: [
      {
        id: "early-window",
        label: "Early Window",
        windowKind: "tickRange",
        startTick: 0,
        endTick: 25,
        durationTicks: 25
      }
    ],
    scaleLinks: [
      {
        id: "cell-to-landscape",
        label: "Cell To Landscape",
        localScaleId: "cell",
        globalScaleId: "landscape",
        relation: "localToGlobal",
        executable: false
      }
    ],
    signatures: [
      {
        id: "burning-increase",
        label: "Burning Increase",
        signatureKind: "increase",
        variableId: "burning-fraction",
        thresholdId: "burning-threshold",
        timeWindowId: "early-window",
        active: true,
        executable: false
      },
      {
        id: "spatial-front",
        label: "Spatial Front",
        signatureKind: "spatialCluster",
        variableId: "cell-state",
        active: false,
        executable: false
      }
    ],
    descriptors: [
      {
        id: "candidate-cascade",
        label: "Candidate Cascade",
        patternKind: "cascade",
        status: "candidate",
        localMechanismDescription: "Local neighbor spread can ignite adjacent fuel cells in the abstract grid.",
        globalPatternDescription: "A landscape-level spread front may appear in model output.",
        variableIds: ["burning-fraction", "cell-state"],
        signatureIds: ["burning-increase", "spatial-front"],
        thresholdIds: ["burning-threshold"],
        timeWindowIds: ["early-window"],
        scaleLinkIds: ["cell-to-landscape"],
        active: true,
        executable: false
      },
      {
        id: "observed-segregation",
        label: "Observed Segregation",
        patternKind: "segregation",
        status: "observedInModelOutput",
        localMechanismDescription: "Model cells occupy different states.",
        globalPatternDescription: "Cell-state regions may separate in model output.",
        variableIds: ["cell-state"],
        signatureIds: ["spatial-front"],
        active: false,
        executable: false
      },
      {
        id: "internal-oscillation",
        label: "Internal Oscillation",
        patternKind: "oscillation",
        status: "internallyTested",
        localMechanismDescription: "A model metric can vary over ticks.",
        globalPatternDescription: "A metric trace may appear oscillatory in a declared time window.",
        variableIds: ["burning-fraction"],
        signatureIds: ["burning-increase"],
        timeWindowIds: ["early-window"],
        active: false,
        executable: false
      },
      {
        id: "external-cluster",
        label: "External Cluster",
        patternKind: "clustering",
        status: "externallyValidated",
        localMechanismDescription: "External validation is only represented as metadata.",
        globalPatternDescription: "This fixture includes provenance notes to avoid overclaiming.",
        variableIds: ["cell-state"],
        signatureIds: ["spatial-front"],
        active: false,
        executable: false,
        notes: ["Provenance would need to be reviewed outside V1."]
      },
      {
        id: "rejected-pattern",
        label: "Rejected Pattern",
        patternKind: "fragmentation",
        status: "rejected",
        localMechanismDescription: "Rejected descriptor fixture.",
        globalPatternDescription: "Not treated as detected.",
        variableIds: ["cell-state"],
        signatureIds: ["spatial-front"],
        active: false,
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
    id: "emergence-composition",
    name: "Emergence Composition",
    version: "1.0.0",
    baseTemplateId: "forest-fire",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("emergence detection and pattern descriptor services", () => {
  it("validates emergence pattern models conservatively", () => {
    expect(validateEmergencePatternModel(emergenceModel()).id).toBe("emergence-model");
    expect(validateEmergencePatternModel(fullEmergenceModel()).descriptors).toHaveLength(5);
    expect(() => validateEmergencePatternModel(emergenceModel({ id: "" }))).toThrow(/Invalid emergence pattern model/);
    expect(() => validateEmergencePatternModel(emergenceModel({ name: "" }))).toThrow(/Invalid emergence pattern model/);
    expect(() => validateEmergencePatternModel(emergenceModel({ artifactType: "ortus.quantitySemanticsModel" as never }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(emergenceModel({ version: "" }))).toThrow(/Invalid emergence pattern model/);
    expect(() => validateEmergencePatternModel({ ...emergenceModel(), descriptors: undefined })).toThrow(/Invalid emergence pattern model/);
    expect(() =>
      validateEmergencePatternModel(emergenceModel({ descriptors: [emergenceModel().descriptors[0]!, { ...emergenceModel().descriptors[0]! }] }))
    ).toThrow(/Duplicate descriptor id/);
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ signatures: [fullEmergenceModel().signatures![0]!, { ...fullEmergenceModel().signatures![0]! }] }))).toThrow(
      /Duplicate signature id/
    );
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ patternVariables: [fullEmergenceModel().patternVariables![0]!, { ...fullEmergenceModel().patternVariables![0]! }] }))
    ).toThrow(/Duplicate variable id/);
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ thresholds: [fullEmergenceModel().thresholds![0]!, { ...fullEmergenceModel().thresholds![0]! }] }))).toThrow(
      /Duplicate threshold id/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ timeWindows: [fullEmergenceModel().timeWindows![0]!, { ...fullEmergenceModel().timeWindows![0]! }] }))).toThrow(
      /Duplicate timeWindow id/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ scaleLinks: [fullEmergenceModel().scaleLinks![0]!, { ...fullEmergenceModel().scaleLinks![0]! }] }))).toThrow(
      /Duplicate scaleLink id/
    );
    expect(() =>
      validateEmergencePatternModel(emergenceModel({ descriptors: [{ ...emergenceModel().descriptors[0]!, patternKind: "intelligence" as never }] }))
    ).toThrow(/Invalid emergence pattern model/);
    expect(() =>
      validateEmergencePatternModel(emergenceModel({ descriptors: [{ ...emergenceModel().descriptors[0]!, status: "proven" as never }] }))
    ).toThrow(/Invalid emergence pattern model/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ descriptors: [{ ...fullEmergenceModel().descriptors[0]!, variableIds: ["missing"] }] }))
    ).toThrow(/unknown variableId/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ descriptors: [{ ...fullEmergenceModel().descriptors[0]!, signatureIds: ["missing"] }] }))
    ).toThrow(/unknown signatureId/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ descriptors: [{ ...fullEmergenceModel().descriptors[0]!, thresholdIds: ["missing"] }] }))
    ).toThrow(/unknown thresholdId/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ descriptors: [{ ...fullEmergenceModel().descriptors[0]!, timeWindowIds: ["missing"] }] }))
    ).toThrow(/unknown timeWindowId/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ descriptors: [{ ...fullEmergenceModel().descriptors[0]!, scaleLinkIds: ["missing"] }] }))
    ).toThrow(/unknown scaleLinkId/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ descriptors: [{ ...fullEmergenceModel().descriptors[0]!, executable: true as never }] }))
    ).toThrow(/Invalid emergence pattern model/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ patternVariables: [{ ...fullEmergenceModel().patternVariables![0]!, variableKind: "consciousness" as never }] }))
    ).toThrow(/Invalid emergence pattern model/);
    expect(() =>
      validateEmergencePatternModel(fullEmergenceModel({ signatures: [{ ...fullEmergenceModel().signatures![0]!, signatureKind: "detector" as never }] }))
    ).toThrow(/Invalid emergence pattern model/);
    expect(() =>
      validateEmergencePatternModel(
        fullEmergenceModel({ signatures: [{ ...fullEmergenceModel().signatures![0]!, variableId: "missing" }, fullEmergenceModel().signatures![1]!] })
      )
    ).toThrow(
      /unknown variableId/
    );
    expect(() =>
      validateEmergencePatternModel(
        fullEmergenceModel({ signatures: [{ ...fullEmergenceModel().signatures![0]!, thresholdId: "missing" }, fullEmergenceModel().signatures![1]!] })
      )
    ).toThrow(
      /unknown thresholdId/
    );
    expect(() =>
      validateEmergencePatternModel(
        fullEmergenceModel({ signatures: [{ ...fullEmergenceModel().signatures![0]!, timeWindowId: "missing" }, fullEmergenceModel().signatures![1]!] })
      )
    ).toThrow(
      /unknown timeWindowId/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ signatures: [{ ...fullEmergenceModel().signatures![0]!, executable: true as never }] }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ thresholds: [{ ...fullEmergenceModel().thresholds![0]!, thresholdKind: "pValue" as never }] }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ thresholds: [{ ...fullEmergenceModel().thresholds![0]!, valueDescription: "" }] }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ timeWindows: [{ ...fullEmergenceModel().timeWindows![0]!, windowKind: "detected" as never }] }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ timeWindows: [{ ...fullEmergenceModel().timeWindows![0]!, startTick: -1 }] }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ timeWindows: [{ ...fullEmergenceModel().timeWindows![0]!, startTick: Infinity }] }))).toThrow(
      /non-finite|Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ timeWindows: [{ ...fullEmergenceModel().timeWindows![0]!, startTick: 5, endTick: 4 }] }))).toThrow(
      /endTick/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ scaleLinks: [{ ...fullEmergenceModel().scaleLinks![0]!, relation: "proof" as never }] }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel(fullEmergenceModel({ scaleLinks: [{ ...fullEmergenceModel().scaleLinks![0]!, executable: true as never }] }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => validateEmergencePatternModel({ ...emergenceModel(), extra: true })).toThrow(/Invalid emergence pattern model/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { metricHistory: [] } }))).toThrow(/metricHistory|live-state/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { formula: "x + y" } }))).toThrow(/formula/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data|timeSeries/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data|dataset/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { algorithm: "kmeans" } }))).toThrow(/algorithm/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { anomalyDetector: "zscore" } }))).toThrow(/anomalyDetector/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { emergenceDetector: "auto" } }))).toThrow(/emergenceDetector/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { detector: "anomaly" } }))).toThrow(/detector/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { classifier: "ml" } }))).toThrow(/classifier/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { modelWeights: [1, 2, 3] } }))).toThrow(/modelWeights/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { pValue: 0.01 } }))).toThrow(/pValue/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { significance: true } }))).toThrow(/significance/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { calibration: "fit" } }))).toThrow(/calibration/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { proof: "proven" } }))).toThrow(/proof/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { certification: "valid" } }))).toThrow(/certification/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { consciousnessDetector: "sentience" } }))).toThrow(/consciousnessDetector/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { intelligenceScore: 1 } }))).toThrow(/intelligenceScore/);
    expect(() => validateEmergencePatternModel(emergenceModel({ metadata: { huge: "x".repeat(230_000) } }))).toThrow(/Emergence pattern model/);
    expect(() => validateEmergencePatternModel(new Date())).toThrow(/plain JSON|Invalid emergence pattern model/);
    expect(() => validateEmergencePatternModel({ ...emergenceModel(), metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid emergence pattern model|executable-shaped/
    );
  });

  it("surfaces emergence warnings without implying proof, runtime detection, statistics, validation, or calibration", () => {
    const warned = fullEmergenceModel({
      descriptors: [
        {
          id: "external-no-notes",
          label: "External No Notes",
          patternKind: "clustering",
          status: "externallyValidated",
          variableIds: ["cell-state"],
          signatureIds: ["burning-increase"],
          active: false,
          executable: false
        },
        {
          id: "observed-output",
          label: "Observed Output",
          patternKind: "segregation",
          status: "observedInModelOutput",
          variableIds: ["cell-state"],
          signatureIds: ["burning-increase"],
          active: false,
          executable: false
        },
        {
          id: "internal-check",
          label: "Internal Check",
          patternKind: "oscillation",
          status: "internallyTested",
          variableIds: ["burning-fraction"],
          signatureIds: ["burning-increase"],
          active: false,
          executable: false
        },
        {
          id: "critical-candidate",
          label: "Critical Candidate",
          patternKind: "criticality",
          status: "candidate",
          active: true,
          executable: false
        },
        {
          id: "wave-candidate",
          label: "Wave Candidate",
          patternKind: "wave",
          status: "hypothesized",
          variableIds: ["burning-fraction"],
          signatureIds: ["burning-increase"],
          active: false,
          executable: false
        },
        {
          id: "forest-cascade",
          label: "Forest Cascade",
          patternKind: "cascade",
          status: "candidate",
          variableIds: ["burning-fraction"],
          signatureIds: ["burning-increase"],
          active: false,
          executable: false
        }
      ],
      thresholds: [
        fullEmergenceModel().thresholds![0]!,
        { id: "floating-threshold", label: "Floating Threshold", thresholdKind: "absolute", valueDescription: "Value only." }
      ],
      timeWindows: [fullEmergenceModel().timeWindows![0]!, { id: "unknown-window", label: "Unknown Window", windowKind: "unknown" }],
      scaleLinks: [fullEmergenceModel().scaleLinks![0]!, { id: "feedback-scale", label: "Feedback Scale", relation: "crossScaleFeedback", executable: false }]
    });
    const warnings = getEmergencePatternWarnings(warned).join(" ");
    expect(warnings).toMatch(/externallyValidated without validation or provenance notes/);
    expect(warnings).toMatch(/model output is not real-world validation/);
    expect(warnings).toMatch(/internal checks are software\/model checks, not empirical validation/);
    expect(warnings).toMatch(/Active descriptor critical-candidate is a structural declaration/);
    expect(warnings).toMatch(/candidate; it is not confirmed or proven emergence/);
    expect(warnings).toMatch(/hypothesized; it is not confirmed or proven emergence/);
    expect(warnings).toMatch(/no localMechanismDescription/);
    expect(warnings).toMatch(/no globalPatternDescription/);
    expect(warnings).toMatch(/no pattern signatures/);
    expect(warnings).toMatch(/no pattern variables/);
    expect(warnings).toMatch(/criticality without a threshold/);
    expect(warnings).toMatch(/wave without timing-window semantics/);
    expect(warnings).toMatch(/segregation without a spatial or network signature/);
    expect(warnings).toMatch(/Scale link feedback-scale relation crossScaleFeedback is structural only/);
    expect(warnings).toMatch(/Active signature burning-increase is structural only and is not computed at runtime/);
    expect(warnings).toMatch(/Threshold floating-threshold has no quantityId or unitId/);
    expect(warnings).toMatch(/Time window unknown-window has unknown timing semantics/);
    expect(warnings).toMatch(/Metric variable burning-fraction references runtime model output, not empirical pattern evidence/);
    expect(warnings).toMatch(/observability does not prove the pattern/);
    expect(warnings).toMatch(/causal assumptions do not prove emergence/);
    expect(warnings).toMatch(/unit consistency does not prove emergence/);
    expect(warnings).toMatch(/multi-scale structure and scale views do not prove emergence/);
    expect(warnings).toMatch(/Forest-fire cascade descriptor forest-cascade is an abstract spread descriptor/);
    expect(warnings).not.toMatch(/will detect|statistically significant|proven true|calibrated/i);

    const report = validateEmergencePatternModelForRuntime(warned);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "emergenceDetection", requiredSupportLevel: "runtime" });
    expect(report.warnings.join(" ")).toContain("do not prove emergence or execute runtime detection");
  });

  it("queries and summarizes emergence descriptors without mutating input", () => {
    const model = fullEmergenceModel();
    const before = JSON.stringify(model);
    expect(listPatternDescriptors(model).map((descriptor) => descriptor.id)).toEqual([
      "candidate-cascade",
      "observed-segregation",
      "internal-oscillation",
      "external-cluster",
      "rejected-pattern"
    ]);
    expect(listActivePatternDescriptors(model).map((descriptor) => descriptor.id)).toEqual(["candidate-cascade"]);
    expect(getPatternDescriptor(model, "candidate-cascade")?.patternKind).toBe("cascade");
    expect(listPatternDescriptorsByKind(model, "segregation").map((descriptor) => descriptor.id)).toEqual(["observed-segregation"]);
    expect(listPatternDescriptorsByStatus(model, "externallyValidated").map((descriptor) => descriptor.id)).toEqual(["external-cluster"]);
    expect(listCandidatePatternDescriptors(model).map((descriptor) => descriptor.id)).toEqual(["candidate-cascade"]);
    expect(listObservedPatternDescriptors(model).map((descriptor) => descriptor.id)).toEqual(["observed-segregation"]);
    expect(listPatternVariables(model)).toHaveLength(2);
    expect(getPatternVariable(model, "burning-fraction")?.variableKind).toBe("metric");
    expect(listPatternSignatures(model)).toHaveLength(2);
    expect(getPatternSignature(model, "spatial-front")?.signatureKind).toBe("spatialCluster");
    expect(getSignaturesForDescriptor(model, "candidate-cascade").map((signature) => signature.id)).toEqual(["burning-increase", "spatial-front"]);
    expect(listPatternThresholds(model)).toHaveLength(1);
    expect(getPatternThreshold(model, "burning-threshold")?.thresholdKind).toBe("absolute");
    expect(getThresholdsForDescriptor(model, "candidate-cascade").map((threshold) => threshold.id)).toEqual(["burning-threshold"]);
    expect(listPatternTimeWindows(model)).toHaveLength(1);
    expect(getPatternTimeWindow(model, "early-window")?.windowKind).toBe("tickRange");
    expect(getTimeWindowsForDescriptor(model, "candidate-cascade").map((window) => window.id)).toEqual(["early-window"]);
    expect(listPatternScaleLinks(model)).toHaveLength(1);
    expect(getPatternScaleLink(model, "cell-to-landscape")?.relation).toBe("localToGlobal");
    expect(getScaleLinksForDescriptor(model, "candidate-cascade").map((link) => link.id)).toEqual(["cell-to-landscape"]);
    expect(modelHasCandidatePatterns(model)).toBe(true);
    expect(modelHasExternallyValidatedPatterns(model)).toBe(true);
    expect(summarizeEmergencePatternModel(model)).toMatchObject({
      id: "emergence-model",
      descriptorCount: 5,
      activeDescriptorCount: 1,
      candidateCount: 1,
      observedInModelOutputCount: 1,
      internallyTestedCount: 1,
      externallyValidatedCount: 1,
      rejectedCount: 1,
      variableCount: 2,
      signatureCount: 2,
      thresholdCount: 1,
      timeWindowCount: 1,
      scaleLinkCount: 1,
      executableCount: 0
    });
    expect(listPatternVariables(emergenceModel())).toEqual([]);
    expect(getPatternVariable(emergenceModel(), "missing")).toBeUndefined();
    expect(getSignaturesForDescriptor(emergenceModel(), "candidate-cascade")).toEqual([]);
    expect(JSON.stringify(model)).toBe(before);
    const returned = listPatternDescriptors(model)[0] as PatternDescriptor;
    (returned as { label: string }).label = "Mutated";
    expect(listPatternDescriptors(model)[0]?.label).toBe("Candidate Cascade");
  });

  it("serializes only emergence pattern artifacts and rejects other artifact families", () => {
    const model = fullEmergenceModel();
    const json = serializeEmergencePatternModel(model);
    expect(json).toContain(`"artifactType": "${emergencePatternModelArtifactType}"`);
    expect(deserializeEmergencePatternModel(json)).toMatchObject({ id: "emergence-model", artifactType: emergencePatternModelArtifactType });
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
      causalAssumptionModelArtifactType,
      quantitySemanticsModelArtifactType
    ]) {
      expect(() => deserializeEmergencePatternModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ schemaVersion: "1", artifactType: emergencePatternModelArtifactType }))).toThrow(
      /Invalid emergence pattern model/
    );
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(
      /external-data|dataset/
    );
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(
      /external-data|timeSeries/
    );
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { formula: "x + y" } }))).toThrow(/formula/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { algorithm: "kmeans" } }))).toThrow(/algorithm/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { anomalyDetector: "zscore" } }))).toThrow(/anomalyDetector/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { emergenceDetector: "auto" } }))).toThrow(/emergenceDetector/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { detector: "anomaly" } }))).toThrow(/detector/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { classifier: "ml" } }))).toThrow(/classifier/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { modelWeights: [1, 2] } }))).toThrow(/modelWeights/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { pValue: 0.01 } }))).toThrow(/pValue/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { calibration: "fit" } }))).toThrow(/calibration/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { proof: "proven" } }))).toThrow(/proof/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { certification: "valid" } }))).toThrow(/certification/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { consciousnessDetector: "sentience" } }))).toThrow(/consciousnessDetector/);
    expect(() => deserializeEmergencePatternModel(JSON.stringify({ ...model, metadata: { intelligenceScore: 1 } }))).toThrow(/intelligenceScore/);
    expect(() => deserializeEmergencePatternModel({ ...model, metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid emergence pattern model|executable-shaped/
    );
  });

  it("updates registry and template capabilities without making templates emergence-runtime capable", () => {
    expect(getPrimitive("emergenceDetection")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("emergenceDetection");
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("emergenceDetection");
    expect(getArtifactFamily(emergencePatternModelArtifactType)).toMatchObject({
      primitiveId: "emergenceDetection",
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
      expect(getTemplateCapability(template.id, "emergenceDetection")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "validationCalibration")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "modelDefinitionSchema")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
    expect(getTemplateCapability("flocking-boids", "behaviorModes")?.notes).toContain("groupAware");
    expect(getTemplateCapability("flocking-boids", "emergenceDetection")?.notes).toContain("not emergence proof");
  });

  it("keeps observability, causality, quantity, multiscale, templates, visuals, and metrics distinct from emergence proof", () => {
    const template = productionTemplateMap["forest-fire"];
    const scenario = createDefaultScenario({ template, scenarioId: "forest-emergence-distinction", seed: "forest-emergence", now: "2026-05-19T12:00:00.000Z" });
    const { engine } = createEngineFromScenario(scenario);
    engine.runSteps(2);
    const latestMetrics = engine.createSnapshot().metricsHistory.at(-1)?.values;
    expect(latestMetrics?.burningFraction).toBeDefined();
    expect(getTemplateCapability("forest-fire", "emergenceDetection")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "observability")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "causalAssumptions")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "unitsDimensionalConsistency")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "multiScale")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "scaleAwareViews")).toMatchObject({ runtimeActive: false });
    expect(areQuantitiesDeclaredCompatible).toBeTypeOf("function");

    const profileText = JSON.stringify(template.assumptionProfile).toLowerCase();
    expect(profileText).toContain("visual patterns and metric traces are model outputs, not empirical proof");
    expect(profileText).toContain("forest-fire cascades and spread patterns are abstract model outputs, not validated wildfire emergence");
    expect(profileText).not.toContain("true emergence proven");

    for (const productionTemplate of productionTemplates) {
      expect(getTemplateCapability(productionTemplate.id, "emergenceDetection")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
    }

    const warnings = getEmergencePatternWarnings(fullEmergenceModel()).join(" ");
    expect(warnings).toMatch(/observability does not prove the pattern/);
    expect(warnings).toMatch(/causal assumptions do not prove emergence/);
    expect(warnings).toMatch(/unit consistency does not prove emergence/);
    expect(warnings).toMatch(/multi-scale structure and scale views do not prove emergence/);
    expect(warnings).toMatch(/runtime model output, not empirical pattern evidence/);
  });

  it("keeps emergence composition references structural and non-runnable for runtime requirements", () => {
    const report = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "emergence-ref",
            primitiveId: "emergenceDetection",
            attachmentType: "emergencePatternModel",
            mode: "reference",
            artifactType: emergencePatternModelArtifactType,
            artifactId: "emergence-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "emergenceDetection", requiredSupportLevel: "runtime" }]
      })
    );
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toContain("emergenceDetection");

    const validationRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "emergence-ref",
            primitiveId: "emergenceDetection",
            attachmentType: "emergencePatternModel",
            mode: "reference",
            artifactType: emergencePatternModelArtifactType,
            artifactId: "emergence-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "validationCalibration", requiredSupportLevel: "metadata" }]
      })
    );
    expect(validationRequirement.runnableNow).toBe(false);
    expect(validationRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("validationCalibration");

    const visualRequirement = validateCompositionCapabilities(
      composition({
        requiredCapabilities: [{ primitiveId: "visualModelBuilder", requiredSupportLevel: "metadata" }]
      })
    );
    expect(visualRequirement.runnableNow).toBe(false);
    expect(visualRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("visualModelBuilder");

    const schemaRequirement = validateCompositionCapabilities(
      composition({
        requiredCapabilities: [{ primitiveId: "modelDefinitionSchema", requiredSupportLevel: "metadata" }]
      })
    );
    expect(schemaRequirement.runnableNow).toBe(false);
    expect(schemaRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("modelDefinitionSchema");
  });

  it("documents emergence boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Emergence pattern descriptors describe candidate patterns; they do not prove emergence.");
    expect(docs).toContain("Visual patterns and runtime metrics are model outputs, not empirical proof of emergence.");
    expect(docs).toContain("Active pattern descriptors are structural declarations, not runtime-detected results.");
    expect(docs).toContain("Do not treat visible patterns as emergence proof.");
    expect(docs).toContain("Do not mark templates emergence-detection-capable unless runtime uses `EmergencePatternModel`.");
    expect(docs).toContain("Do not treat quantity consistency as proof of emergence.");
    expect(docs).toContain("Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies.");

    const emergenceDir = join(repoRoot, "src", "simulation", "emergence");
    const source = readdirSync(emergenceDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(emergenceDir, file), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']zustand["']/);
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.location");
    expect(source).not.toContain("window.localStorage");
    expect(source).not.toContain("Canvas");
    expect(source).not.toMatch(/from ["'][^"']*\/(renderer|components|app|ml|clustering|anomaly|statistics|significance|calibration|mcmc|filter|kalman|particle|compiler|visualBuilder)(\/|["'])/);
  });
});
