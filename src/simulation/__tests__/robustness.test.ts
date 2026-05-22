import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  boundaryModelArtifactType,
  causalAssumptionModelArtifactType,
  createDefaultScenario,
  createEngineFromScenario,
  delayQueueArtifactType,
  deserializeRobustnessResilienceModel,
  emergencePatternModelArtifactType,
  eventScheduleArtifactType,
  feedbackEventMetricsArtifactType,
  feedbackLoopsArtifactType,
  fieldLayerArtifactType,
  getArtifactFamily,
  getFailureMode,
  getFailureModesForDescriptor,
  getPrimitive,
  getResponseCriteriaForDescriptor,
  getResponseCriterion,
  getRobustnessDescriptor,
  getRobustnessResilienceWarnings,
  getStressor,
  getStressorsForDescriptor,
  getStressTestPlan,
  getStressTestPlansForDescriptor,
  getTemplateCapability,
  hybridCompositionArtifactType,
  listActiveRobustnessDescriptors,
  listActiveStressors,
  listCandidateRobustnessDescriptors,
  listFailureModes,
  listObservedRobustnessDescriptors,
  listPlannedStressTests,
  listReservedPrimitives,
  listResponseCriteria,
  listRobustnessDescriptors,
  listRobustnessDescriptorsByKind,
  listRobustnessDescriptorsByStatus,
  listServiceOnlyPrimitives,
  listStressors,
  listStressTestPlans,
  modelHasExternallyValidatedRobustness,
  modelHasPlannedStressTests,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  observabilityModelArtifactType,
  productionTemplateMap,
  productionTemplates,
  quantitySemanticsModelArtifactType,
  resourceMetricsArtifactType,
  resourceSystemArtifactType,
  robustnessResilienceModelArtifactType,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeRobustnessResilienceModel,
  snapshotArtifactType,
  summarizeRobustnessResilienceModel,
  uncertaintyConfigArtifactType,
  uncertaintyResultArtifactType,
  validateCompositionCapabilities,
  validateRobustnessResilienceModel,
  validateRobustnessResilienceModelForRuntime,
  type HybridModelComposition,
  type RobustnessDescriptor,
  type RobustnessResilienceModel
} from "../index";

const repoRoot = process.cwd();

function robustnessModel(overrides: Partial<RobustnessResilienceModel> = {}): RobustnessResilienceModel {
  return {
    schemaVersion: "1",
    artifactType: robustnessResilienceModelArtifactType,
    id: "robustness-model",
    name: "Robustness Model",
    version: "1.0.0",
    descriptors: [
      {
        id: "candidate-resilience",
        label: "Candidate Resilience",
        robustnessKind: "resilience",
        status: "candidate",
        active: false,
        executable: false
      }
    ],
    ...overrides
  };
}

function fullRobustnessModel(overrides: Partial<RobustnessResilienceModel> = {}): RobustnessResilienceModel {
  return robustnessModel({
    scope: {
      templateId: "forest-fire",
      uncertaintyConfigId: "uncertainty-1",
      uncertaintyResultId: "uncertainty-result-1",
      emergencePatternModelId: "emergence-1",
      boundaryModelId: "boundary-1",
      resourceSystemId: "resource-1",
      feedbackLoopModelId: "feedback-1",
      scaleModelId: "scale-1",
      quantitySemanticsModelId: "quantity-1",
      observabilityModelId: "observability-1",
      causalAssumptionModelId: "causal-1",
      notes: ["Scope is structural only."]
    },
    stressors: [
      {
        id: "spread-perturbation",
        label: "Spread Perturbation",
        stressorKind: "parameterPerturbation",
        targetPath: "parameters.spreadProbability",
        targetDescription: "Stylized spread probability parameter.",
        magnitudeDescription: "Increase within a declared structural range.",
        durationDescription: "Applied in a proposed scenario comparison.",
        timingDescription: "Declared before a fresh run in a future runtime phase.",
        active: true,
        executable: false
      },
      {
        id: "resource-shock",
        label: "Resource Shock",
        stressorKind: "resourceShock",
        targetDescription: "Structural resource stress placeholder.",
        active: false,
        executable: false
      }
    ],
    responseCriteria: [
      {
        id: "burning-bounded",
        label: "Burning Bounded",
        criterionKind: "boundedDeviation",
        metricId: "burningFraction",
        quantityId: "burning-fraction",
        thresholdDescription: "Burning fraction remains below a declared model-output threshold.",
        successDescription: "No runtime success evaluation is performed in V1.",
        active: true,
        executable: false
      }
    ],
    failureModes: [
      {
        id: "cascade-failure",
        label: "Cascade Failure",
        failureKind: "cascade",
        triggerDescription: "A stylized spread process crosses a declared threshold.",
        consequenceDescription: "Large parts of the abstract grid may become burned in model output.",
        recoveryDescription: "Recovery-like behavior is stylized regrowth, not wildfire resilience.",
        active: true,
        executable: false
      }
    ],
    stressTestPlans: [
      {
        id: "spread-sweep",
        label: "Spread Sweep",
        planKind: "parameterSweep",
        stressorIds: ["spread-perturbation"],
        responseCriterionIds: ["burning-bounded"],
        scenarioIds: ["scenario-a", "scenario-b"],
        uncertaintyConfigId: "uncertainty-1",
        timeWindowDescription: "Future comparison over declared model ticks.",
        replicationDescription: "Replications are descriptive only in V1.",
        active: true,
        executable: false
      }
    ],
    descriptors: [
      {
        id: "candidate-resilience",
        label: "Candidate Resilience",
        robustnessKind: "resilience",
        status: "candidate",
        targetDescription: "Abstract landscape spread response.",
        stressorIds: ["spread-perturbation"],
        responseCriterionIds: ["burning-bounded"],
        failureModeIds: ["cascade-failure"],
        stressTestPlanIds: ["spread-sweep"],
        active: true,
        executable: false
      },
      {
        id: "planned-sensitivity",
        label: "Planned Sensitivity",
        robustnessKind: "sensitivity",
        status: "plannedTest",
        targetDescription: "Stylized parameter sensitivity plan.",
        stressorIds: ["spread-perturbation"],
        responseCriterionIds: ["burning-bounded"],
        stressTestPlanIds: ["spread-sweep"],
        active: false,
        executable: false
      },
      {
        id: "observed-stability",
        label: "Observed Stability",
        robustnessKind: "stability",
        status: "observedInModelOutput",
        targetDescription: "Model-output metric trace.",
        stressorIds: ["spread-perturbation"],
        responseCriterionIds: ["burning-bounded"],
        active: false,
        executable: false
      },
      {
        id: "internal-fragility",
        label: "Internal Fragility",
        robustnessKind: "fragility",
        status: "internallyTested",
        targetDescription: "Internal test fixture only.",
        stressorIds: ["spread-perturbation"],
        responseCriterionIds: ["burning-bounded"],
        active: false,
        executable: false
      },
      {
        id: "external-robustness",
        label: "External Robustness",
        robustnessKind: "robustness",
        status: "externallyValidated",
        targetDescription: "Fixture with provenance notes only.",
        stressorIds: ["spread-perturbation"],
        responseCriterionIds: ["burning-bounded"],
        active: false,
        executable: false,
        notes: ["External evidence would require review outside V1."]
      },
      {
        id: "rejected-redundancy",
        label: "Rejected Redundancy",
        robustnessKind: "redundancy",
        status: "rejected",
        targetDescription: "Rejected fixture.",
        stressorIds: ["spread-perturbation"],
        responseCriterionIds: ["burning-bounded"],
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
    id: "robustness-composition",
    name: "Robustness Composition",
    version: "1.0.0",
    baseTemplateId: "forest-fire",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("robustness, resilience, and stress testing semantics services", () => {
  it("validates robustness/resilience models conservatively", () => {
    expect(validateRobustnessResilienceModel(robustnessModel()).id).toBe("robustness-model");
    expect(validateRobustnessResilienceModel(fullRobustnessModel()).descriptors).toHaveLength(6);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ id: "" }))).toThrow(/Invalid robustness\/resilience model/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ name: "" }))).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(robustnessModel({ artifactType: "ortus.emergencePatternModel" as never }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ version: "" }))).toThrow(/Invalid robustness\/resilience model/);
    expect(() => validateRobustnessResilienceModel({ ...robustnessModel(), descriptors: undefined })).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(robustnessModel({ descriptors: [robustnessModel().descriptors[0]!, { ...robustnessModel().descriptors[0]! }] }))
    ).toThrow(/Duplicate descriptor id/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ stressors: [fullRobustnessModel().stressors![0]!, { ...fullRobustnessModel().stressors![0]! }] }))
    ).toThrow(/Duplicate stressor id/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ responseCriteria: [fullRobustnessModel().responseCriteria![0]!, { ...fullRobustnessModel().responseCriteria![0]! }] })
      )
    ).toThrow(/Duplicate response criterion id/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ failureModes: [fullRobustnessModel().failureModes![0]!, { ...fullRobustnessModel().failureModes![0]! }] })
      )
    ).toThrow(/Duplicate failure mode id/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ stressTestPlans: [fullRobustnessModel().stressTestPlans![0]!, { ...fullRobustnessModel().stressTestPlans![0]! }] })
      )
    ).toThrow(/Duplicate stress test plan id/);
    expect(() =>
      validateRobustnessResilienceModel(robustnessModel({ descriptors: [{ ...robustnessModel().descriptors[0]!, robustnessKind: "certified" as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(robustnessModel({ descriptors: [{ ...robustnessModel().descriptors[0]!, status: "proven" as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ descriptors: [{ ...fullRobustnessModel().descriptors[0]!, stressorIds: ["missing"] }] }))
    ).toThrow(/unknown stressorId/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ descriptors: [{ ...fullRobustnessModel().descriptors[0]!, responseCriterionIds: ["missing"] }] })
      )
    ).toThrow(/unknown responseCriterionId/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ descriptors: [{ ...fullRobustnessModel().descriptors[0]!, failureModeIds: ["missing"] }] }))
    ).toThrow(/unknown failureModeId/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ descriptors: [{ ...fullRobustnessModel().descriptors[0]!, stressTestPlanIds: ["missing"] }] })
      )
    ).toThrow(/unknown stressTestPlanId/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ descriptors: [{ ...fullRobustnessModel().descriptors[0]!, executable: true as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ stressors: [{ ...fullRobustnessModel().stressors![0]!, stressorKind: "optimizer" as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ stressors: [{ ...fullRobustnessModel().stressors![0]!, executable: true as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ responseCriteria: [{ ...fullRobustnessModel().responseCriteria![0]!, criterionKind: "pValue" as never }] })
      )
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ responseCriteria: [{ ...fullRobustnessModel().responseCriteria![0]!, executable: true as never }] })
      )
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ failureModes: [{ ...fullRobustnessModel().failureModes![0]!, failureKind: "riskScore" as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ failureModes: [{ ...fullRobustnessModel().failureModes![0]!, executable: true as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ stressTestPlans: [{ ...fullRobustnessModel().stressTestPlans![0]!, planKind: "controller" as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ stressTestPlans: [{ ...fullRobustnessModel().stressTestPlans![0]!, stressorIds: ["missing"] }] }))
    ).toThrow(/unknown stressorId/);
    expect(() =>
      validateRobustnessResilienceModel(
        fullRobustnessModel({ stressTestPlans: [{ ...fullRobustnessModel().stressTestPlans![0]!, responseCriterionIds: ["missing"] }] })
      )
    ).toThrow(/unknown responseCriterionId/);
    expect(() =>
      validateRobustnessResilienceModel(fullRobustnessModel({ stressTestPlans: [{ ...fullRobustnessModel().stressTestPlans![0]!, executable: true as never }] }))
    ).toThrow(/Invalid robustness\/resilience model/);
    expect(() => validateRobustnessResilienceModel({ ...robustnessModel(), extra: true })).toThrow(/Invalid robustness\/resilience model/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { metricHistory: [] } }))).toThrow(/metricHistory|live-state/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { value: Infinity } }))).toThrow(/non-finite/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { formula: "x + y" } }))).toThrow(/formula/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/dataset/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/timeSeries/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { optimizer: "best-policy" } }))).toThrow(/optimizer/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { controller: "pid" } }))).toThrow(/controller/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { policy: "auto" } }))).toThrow(/policy/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { controlPolicy: "auto" } }))).toThrow(/controlPolicy/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { riskScore: 0.2 } }))).toThrow(/riskScore/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { safetyScore: 0.9 } }))).toThrow(/safetyScore/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { pValue: 0.01 } }))).toThrow(/pValue/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { significance: true } }))).toThrow(/significance/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { certification: "safe" } }))).toThrow(/certification/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { proof: "robust" } }))).toThrow(/proof/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { stressTestResult: {} } }))).toThrow(/stressTestResult/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { executedRuns: [] } }))).toThrow(/executedRuns/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { experimentResults: [] } }))).toThrow(/experimentResults/);
    expect(() => validateRobustnessResilienceModel(robustnessModel({ metadata: { huge: "x".repeat(230_000) } }))).toThrow(/Robustness\/resilience model/);
    expect(() => validateRobustnessResilienceModel(new Date())).toThrow(/plain JSON|Invalid robustness\/resilience model/);
    expect(() => validateRobustnessResilienceModel({ ...robustnessModel(), metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid robustness\/resilience model|executable-shaped/
    );
  });

  it("surfaces robustness warnings without implying proof, certification, validation, safety, or runtime execution", () => {
    const warned = fullRobustnessModel({
      descriptors: [
        { id: "external-no-notes", label: "External No Notes", robustnessKind: "robustness", status: "externallyValidated", active: false, executable: false },
        {
          id: "observed-output",
          label: "Observed Output",
          robustnessKind: "stability",
          status: "observedInModelOutput",
          stressorIds: ["spread-perturbation"],
          responseCriterionIds: ["burning-bounded"],
          active: false,
          executable: false
        },
        {
          id: "internal-check",
          label: "Internal Check",
          robustnessKind: "fragility",
          status: "internallyTested",
          stressorIds: ["spread-perturbation"],
          responseCriterionIds: ["burning-bounded"],
          active: false,
          executable: false
        },
        {
          id: "planned-check",
          label: "Planned Check",
          robustnessKind: "sensitivity",
          status: "plannedTest",
          stressorIds: ["spread-perturbation"],
          responseCriterionIds: ["burning-bounded"],
          active: false,
          executable: false
        },
        {
          id: "hypothesis",
          label: "Hypothesis",
          robustnessKind: "resilience",
          status: "hypothesized",
          active: true,
          executable: false
        },
        {
          id: "broad-claim",
          label: "Broad Claim",
          robustnessKind: "robustness",
          status: "candidate",
          targetDescription: "Broad applicability claim for real-world systems.",
          active: false,
          executable: false
        }
      ],
      stressors: [
        fullRobustnessModel().stressors![0]!,
        { id: "empty-stressor", label: "Empty Stressor", stressorKind: "stateShock", active: true, executable: false },
        {
          id: "intervention-stressor",
          label: "Intervention Stressor",
          stressorKind: "intervention",
          targetDescription: "Runtime intervention reference.",
          active: false,
          executable: false
        }
      ],
      responseCriteria: [
        fullRobustnessModel().responseCriteria![0]!,
        { id: "empty-criterion", label: "Empty Criterion", criterionKind: "threshold", active: true, executable: false }
      ],
      failureModes: [
        fullRobustnessModel().failureModes![0]!,
        { id: "empty-failure", label: "Empty Failure", failureKind: "collapse", active: true, executable: false }
      ],
      stressTestPlans: [
        fullRobustnessModel().stressTestPlans![0]!,
        { id: "empty-plan", label: "Empty Plan", planKind: "singlePerturbation", active: true, executable: false }
      ]
    });
    const warnings = getRobustnessResilienceWarnings(warned).join(" ");
    expect(warnings).toMatch(/externallyValidated without validation or provenance notes/);
    expect(warnings).toMatch(/model output is not real-world robustness validation/);
    expect(warnings).toMatch(/internal checks are software\/model checks, not empirical validation/);
    expect(warnings).toMatch(/no stress test is executed by this descriptor/);
    expect(warnings).toMatch(/robustness or resilience is not confirmed/);
    expect(warnings).toMatch(/broad-applicability language without external validation/);
    expect(warnings).toMatch(/Active descriptor hypothesis is structural only/);
    expect(warnings).toMatch(/no stressor references/);
    expect(warnings).toMatch(/no response criterion references/);
    expect(warnings).toMatch(/no targetDescription/);
    expect(warnings).toMatch(/Active stressor empty-stressor is structural only and is not applied at runtime/);
    expect(warnings).toMatch(/no targetPath or targetDescription/);
    expect(warnings).toMatch(/no magnitude, duration, or timing description/);
    expect(warnings).toMatch(/runtime interventions are not general robustness testing unless explicitly modeled and evaluated/);
    expect(warnings).toMatch(/Active response criterion empty-criterion is structural only and is not evaluated at runtime/);
    expect(warnings).toMatch(/no metricId, thresholdDescription, or successDescription/);
    expect(warnings).toMatch(/Failure mode empty-failure has no triggerDescription or consequenceDescription/);
    expect(warnings).toMatch(/Active stress-test plan empty-plan is structural only and is not executed/);
    expect(warnings).toMatch(/Stress-test plan empty-plan has no stressor or response criterion references/);
    expect(warnings).toMatch(/uncertainty ensembles are not robustness validation/);
    expect(warnings).toMatch(/pattern descriptors do not prove robustness or resilience/);
    expect(warnings).toMatch(/causal assumptions do not prove robustness or resilience/);
    expect(warnings).toMatch(/measurement structure does not validate robustness/);
    expect(warnings).toMatch(/units do not validate robustness/);
    expect(warnings).toMatch(/attached primitives do not execute stressors/);
    expect(warnings).toMatch(/Forest-fire stress, cascade, collapse, or recovery descriptors are abstract model behavior/);
    expect(warnings).not.toMatch(/will execute|statistically significant|certified safe|operationally ready|proven robust/i);

    const report = validateRobustnessResilienceModelForRuntime(warned);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "robustnessResilience", requiredSupportLevel: "runtime" });
    expect(report.warnings.join(" ")).toContain("do not prove a system is robust or resilient or execute stress tests");
  });

  it("queries and summarizes robustness descriptors without mutating input", () => {
    const model = fullRobustnessModel();
    const before = JSON.stringify(model);
    expect(listRobustnessDescriptors(model).map((descriptor) => descriptor.id)).toEqual([
      "candidate-resilience",
      "planned-sensitivity",
      "observed-stability",
      "internal-fragility",
      "external-robustness",
      "rejected-redundancy"
    ]);
    expect(listActiveRobustnessDescriptors(model).map((descriptor) => descriptor.id)).toEqual(["candidate-resilience"]);
    expect(getRobustnessDescriptor(model, "candidate-resilience")?.robustnessKind).toBe("resilience");
    expect(listRobustnessDescriptorsByKind(model, "sensitivity").map((descriptor) => descriptor.id)).toEqual(["planned-sensitivity"]);
    expect(listRobustnessDescriptorsByStatus(model, "externallyValidated").map((descriptor) => descriptor.id)).toEqual(["external-robustness"]);
    expect(listCandidateRobustnessDescriptors(model).map((descriptor) => descriptor.id)).toEqual(["candidate-resilience"]);
    expect(listPlannedStressTests(model).map((descriptor) => descriptor.id)).toEqual(["planned-sensitivity"]);
    expect(listObservedRobustnessDescriptors(model).map((descriptor) => descriptor.id)).toEqual(["observed-stability"]);
    expect(listStressors(model)).toHaveLength(2);
    expect(listActiveStressors(model).map((stressor) => stressor.id)).toEqual(["spread-perturbation"]);
    expect(getStressor(model, "spread-perturbation")?.stressorKind).toBe("parameterPerturbation");
    expect(getStressorsForDescriptor(model, "candidate-resilience").map((stressor) => stressor.id)).toEqual(["spread-perturbation"]);
    expect(listResponseCriteria(model)).toHaveLength(1);
    expect(getResponseCriterion(model, "burning-bounded")?.criterionKind).toBe("boundedDeviation");
    expect(getResponseCriteriaForDescriptor(model, "candidate-resilience").map((criterion) => criterion.id)).toEqual(["burning-bounded"]);
    expect(listFailureModes(model)).toHaveLength(1);
    expect(getFailureMode(model, "cascade-failure")?.failureKind).toBe("cascade");
    expect(getFailureModesForDescriptor(model, "candidate-resilience").map((failureMode) => failureMode.id)).toEqual(["cascade-failure"]);
    expect(listStressTestPlans(model)).toHaveLength(1);
    expect(getStressTestPlan(model, "spread-sweep")?.planKind).toBe("parameterSweep");
    expect(getStressTestPlansForDescriptor(model, "candidate-resilience").map((plan) => plan.id)).toEqual(["spread-sweep"]);
    expect(modelHasPlannedStressTests(model)).toBe(true);
    expect(modelHasExternallyValidatedRobustness(model)).toBe(true);
    expect(summarizeRobustnessResilienceModel(model)).toMatchObject({
      id: "robustness-model",
      descriptorCount: 6,
      activeDescriptorCount: 1,
      stressorCount: 2,
      activeStressorCount: 1,
      responseCriterionCount: 1,
      failureModeCount: 1,
      stressTestPlanCount: 1,
      candidateCount: 1,
      plannedTestCount: 1,
      observedInModelOutputCount: 1,
      internallyTestedCount: 1,
      externallyValidatedCount: 1,
      rejectedCount: 1,
      executableCount: 0
    });
    expect(listStressors(robustnessModel())).toEqual([]);
    expect(getStressor(robustnessModel(), "missing")).toBeUndefined();
    expect(getStressorsForDescriptor(robustnessModel(), "candidate-resilience")).toEqual([]);
    expect(JSON.stringify(model)).toBe(before);
    const returned = listRobustnessDescriptors(model)[0] as RobustnessDescriptor;
    (returned as { label: string }).label = "Mutated";
    expect(listRobustnessDescriptors(model)[0]?.label).toBe("Candidate Resilience");
  });

  it("serializes only robustness/resilience artifacts and rejects other artifact families", () => {
    const model = fullRobustnessModel();
    const json = serializeRobustnessResilienceModel(model);
    expect(json).toContain(`"artifactType": "${robustnessResilienceModelArtifactType}"`);
    expect(deserializeRobustnessResilienceModel(json)).toMatchObject({ id: "robustness-model", artifactType: robustnessResilienceModelArtifactType });
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
      quantitySemanticsModelArtifactType,
      emergencePatternModelArtifactType
    ]) {
      expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ schemaVersion: "1", artifactType: robustnessResilienceModelArtifactType }))).toThrow(
      /Invalid robustness\/resilience model/
    );
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/dataset/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/timeSeries/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { metricHistory: [] } }))).toThrow(/metricHistory/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { formula: "x + y" } }))).toThrow(/formula/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { algorithm: "search" } }))).toThrow(/algorithm/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { optimizer: "best" } }))).toThrow(/optimizer/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { controller: "pid" } }))).toThrow(/controller/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { policy: "auto" } }))).toThrow(/policy/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { controlPolicy: "auto" } }))).toThrow(/controlPolicy/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { riskScore: 0.2 } }))).toThrow(/riskScore/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { safetyScore: 0.9 } }))).toThrow(/safetyScore/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { significance: true } }))).toThrow(/significance/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { certification: "safe" } }))).toThrow(/certification/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { stressTestResult: {} } }))).toThrow(/stressTestResult/);
    expect(() => deserializeRobustnessResilienceModel(JSON.stringify({ ...model, metadata: { experimentResults: [] } }))).toThrow(/experimentResults/);
    expect(() => deserializeRobustnessResilienceModel({ ...model, metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid robustness\/resilience model|executable-shaped/
    );
  });

  it("updates registry and template capabilities without making templates robustness-runtime capable", () => {
    expect(getPrimitive("robustnessResilience")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("robustnessResilience");
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("robustnessResilience");
    expect(getArtifactFamily(robustnessResilienceModelArtifactType)).toMatchObject({
      primitiveId: "robustnessResilience",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("validationCalibration")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("externalFrameworkInterop")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("modelDefinitionSchema")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("interventionStrategy")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "robustnessResilience")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "validationCalibration")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "modelDefinitionSchema")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
  });

  it("keeps uncertainty, emergence, causality, observability, quantities, resources, templates, visuals, and metrics distinct from robustness validation", () => {
    const template = productionTemplateMap["forest-fire"];
    const scenario = createDefaultScenario({ template, scenarioId: "forest-robustness-distinction", seed: "forest-robustness", now: "2026-05-20T12:00:00.000Z" });
    const { engine } = createEngineFromScenario(scenario);
    engine.runSteps(2);
    const latestMetrics = engine.createSnapshot().metricsHistory.at(-1)?.values;
    expect(latestMetrics?.burningFraction).toBeDefined();
    expect(getTemplateCapability("forest-fire", "robustnessResilience")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
    expect(getTemplateCapability("forest-fire", "uncertainty")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "emergenceDetection")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "observability")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "causalAssumptions")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "unitsDimensionalConsistency")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "resources")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "feedbackEvents")).toMatchObject({ runtimeActive: false });

    const profileText = JSON.stringify(template.assumptionProfile).toLowerCase();
    expect(profileText).toContain("visual patterns and metric traces are model outputs, not empirical robustness evidence");
    expect(profileText).toContain("uncertainty ensembles are not robustness validation by themselves");
    expect(profileText).toContain("forest-fire spread, collapse, recovery, or stress-like patterns are abstract model outputs, not wildfire risk validation");
    expect(profileText).not.toContain("system is robust");
    expect(profileText).not.toContain("certified safe");

    for (const productionTemplate of productionTemplates) {
      expect(getTemplateCapability(productionTemplate.id, "robustnessResilience")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
    }

    const warnings = getRobustnessResilienceWarnings(fullRobustnessModel()).join(" ");
    expect(warnings).toMatch(/uncertainty ensembles are not robustness validation/);
    expect(warnings).toMatch(/pattern descriptors do not prove robustness or resilience/);
    expect(warnings).toMatch(/causal assumptions do not prove robustness or resilience/);
    expect(warnings).toMatch(/measurement structure does not validate robustness/);
    expect(warnings).toMatch(/units do not validate robustness/);
    expect(warnings).toMatch(/attached primitives do not execute stressors/);
  });

  it("keeps robustness composition references structural and non-runnable for runtime requirements", () => {
    const report = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "robustness-ref",
            primitiveId: "robustnessResilience",
            attachmentType: "robustnessResilienceModel",
            mode: "reference",
            artifactType: robustnessResilienceModelArtifactType,
            artifactId: "robustness-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "robustnessResilience", requiredSupportLevel: "runtime" }]
      })
    );
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toContain("robustnessResilience");

    const validationRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "robustness-ref",
            primitiveId: "robustnessResilience",
            attachmentType: "robustnessResilienceModel",
            mode: "reference",
            artifactType: robustnessResilienceModelArtifactType,
            artifactId: "robustness-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "validationCalibration", requiredSupportLevel: "metadata" }]
      })
    );
    expect(validationRequirement.runnableNow).toBe(false);
    expect(validationRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("validationCalibration");

    const controlRequirement = validateCompositionCapabilities(
      composition({
        requiredCapabilities: [{ primitiveId: "interventionStrategy", requiredSupportLevel: "runtime" }]
      })
    );
    expect(controlRequirement.runnableNow).toBe(false);
    expect(controlRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("interventionStrategy");

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

  it("documents robustness boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient.");
    expect(docs).toContain("Active stressors and stress-test plans are structural declarations, not runtime-executed perturbations.");
    expect(docs).toContain("Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves.");
    expect(docs).toContain("Do not treat visible persistence, collapse, or recovery as resilience proof.");
    expect(docs).toContain("Do not mark templates robustness/resilience-capable unless runtime uses `RobustnessResilienceModel`.");
    expect(docs).toContain("Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies.");

    const robustnessDir = join(repoRoot, "src", "simulation", "robustness");
    const source = readdirSync(robustnessDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(robustnessDir, file), "utf8"))
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
    expect(source).not.toMatch(/from ["'][^"']*\/(renderer|components|app|optimization|control|statistics|significance|risk|safety|calibration|mcmc|filter|kalman|particle|compiler|visualBuilder)(\/|["'])/);
  });
});
