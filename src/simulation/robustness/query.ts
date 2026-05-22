import { validateRobustnessResilienceModel } from "./validation";
import type {
  FailureMode,
  ResponseCriterion,
  RobustnessDescriptor,
  RobustnessDescriptorStatus,
  RobustnessKind,
  RobustnessResilienceModel,
  RobustnessResilienceSummary,
  StressorDefinition,
  StressTestPlan
} from "./types";
import { maxRobustnessWarnings } from "./types";

export function listRobustnessDescriptors(model: RobustnessResilienceModel): readonly RobustnessDescriptor[] {
  return clone(validateRobustnessResilienceModel(model).descriptors);
}

export function listActiveRobustnessDescriptors(model: RobustnessResilienceModel): readonly RobustnessDescriptor[] {
  return clone(validateRobustnessResilienceModel(model).descriptors.filter((descriptor) => descriptor.active));
}

export function getRobustnessDescriptor(model: RobustnessResilienceModel, descriptorId: string): RobustnessDescriptor | undefined {
  const descriptor = validateRobustnessResilienceModel(model).descriptors.find((candidate) => candidate.id === descriptorId);
  return descriptor ? clone(descriptor) : undefined;
}

export function listRobustnessDescriptorsByKind(model: RobustnessResilienceModel, robustnessKind: RobustnessKind): readonly RobustnessDescriptor[] {
  return clone(validateRobustnessResilienceModel(model).descriptors.filter((descriptor) => descriptor.robustnessKind === robustnessKind));
}

export function listRobustnessDescriptorsByStatus(
  model: RobustnessResilienceModel,
  status: RobustnessDescriptorStatus
): readonly RobustnessDescriptor[] {
  return clone(validateRobustnessResilienceModel(model).descriptors.filter((descriptor) => descriptor.status === status));
}

export function listCandidateRobustnessDescriptors(model: RobustnessResilienceModel): readonly RobustnessDescriptor[] {
  return clone(
    validateRobustnessResilienceModel(model).descriptors.filter(
      (descriptor) => descriptor.status === "candidate" || descriptor.status === "hypothesized"
    )
  );
}

export function listPlannedStressTests(model: RobustnessResilienceModel): readonly RobustnessDescriptor[] {
  return clone(validateRobustnessResilienceModel(model).descriptors.filter((descriptor) => descriptor.status === "plannedTest"));
}

export function listObservedRobustnessDescriptors(model: RobustnessResilienceModel): readonly RobustnessDescriptor[] {
  return clone(validateRobustnessResilienceModel(model).descriptors.filter((descriptor) => descriptor.status === "observedInModelOutput"));
}

export function listStressors(model: RobustnessResilienceModel): readonly StressorDefinition[] {
  return clone(validateRobustnessResilienceModel(model).stressors ?? []);
}

export function listActiveStressors(model: RobustnessResilienceModel): readonly StressorDefinition[] {
  return clone((validateRobustnessResilienceModel(model).stressors ?? []).filter((stressor) => stressor.active));
}

export function getStressor(model: RobustnessResilienceModel, stressorId: string): StressorDefinition | undefined {
  const stressor = validateRobustnessResilienceModel(model).stressors?.find((candidate) => candidate.id === stressorId);
  return stressor ? clone(stressor) : undefined;
}

export function getStressorsForDescriptor(model: RobustnessResilienceModel, descriptorId: string): readonly StressorDefinition[] {
  const valid = validateRobustnessResilienceModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.stressorIds ?? []);
  return clone((valid.stressors ?? []).filter((stressor) => ids.has(stressor.id)));
}

export function listResponseCriteria(model: RobustnessResilienceModel): readonly ResponseCriterion[] {
  return clone(validateRobustnessResilienceModel(model).responseCriteria ?? []);
}

export function getResponseCriterion(model: RobustnessResilienceModel, criterionId: string): ResponseCriterion | undefined {
  const criterion = validateRobustnessResilienceModel(model).responseCriteria?.find((candidate) => candidate.id === criterionId);
  return criterion ? clone(criterion) : undefined;
}

export function getResponseCriteriaForDescriptor(model: RobustnessResilienceModel, descriptorId: string): readonly ResponseCriterion[] {
  const valid = validateRobustnessResilienceModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.responseCriterionIds ?? []);
  return clone((valid.responseCriteria ?? []).filter((criterion) => ids.has(criterion.id)));
}

export function listFailureModes(model: RobustnessResilienceModel): readonly FailureMode[] {
  return clone(validateRobustnessResilienceModel(model).failureModes ?? []);
}

export function getFailureMode(model: RobustnessResilienceModel, failureModeId: string): FailureMode | undefined {
  const failureMode = validateRobustnessResilienceModel(model).failureModes?.find((candidate) => candidate.id === failureModeId);
  return failureMode ? clone(failureMode) : undefined;
}

export function getFailureModesForDescriptor(model: RobustnessResilienceModel, descriptorId: string): readonly FailureMode[] {
  const valid = validateRobustnessResilienceModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.failureModeIds ?? []);
  return clone((valid.failureModes ?? []).filter((failureMode) => ids.has(failureMode.id)));
}

export function listStressTestPlans(model: RobustnessResilienceModel): readonly StressTestPlan[] {
  return clone(validateRobustnessResilienceModel(model).stressTestPlans ?? []);
}

export function getStressTestPlan(model: RobustnessResilienceModel, planId: string): StressTestPlan | undefined {
  const plan = validateRobustnessResilienceModel(model).stressTestPlans?.find((candidate) => candidate.id === planId);
  return plan ? clone(plan) : undefined;
}

export function getStressTestPlansForDescriptor(model: RobustnessResilienceModel, descriptorId: string): readonly StressTestPlan[] {
  const valid = validateRobustnessResilienceModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.stressTestPlanIds ?? []);
  return clone((valid.stressTestPlans ?? []).filter((plan) => ids.has(plan.id)));
}

export function modelHasPlannedStressTests(model: RobustnessResilienceModel): boolean {
  return validateRobustnessResilienceModel(model).descriptors.some((descriptor) => descriptor.status === "plannedTest");
}

export function modelHasExternallyValidatedRobustness(model: RobustnessResilienceModel): boolean {
  return validateRobustnessResilienceModel(model).descriptors.some((descriptor) => descriptor.status === "externallyValidated");
}

export function summarizeRobustnessResilienceModel(model: RobustnessResilienceModel): RobustnessResilienceSummary {
  const valid = validateRobustnessResilienceModel(model);
  return {
    id: valid.id,
    name: valid.name,
    descriptorCount: valid.descriptors.length,
    activeDescriptorCount: valid.descriptors.filter((descriptor) => descriptor.active).length,
    stressorCount: (valid.stressors ?? []).length,
    activeStressorCount: (valid.stressors ?? []).filter((stressor) => stressor.active).length,
    responseCriterionCount: (valid.responseCriteria ?? []).length,
    failureModeCount: (valid.failureModes ?? []).length,
    stressTestPlanCount: (valid.stressTestPlans ?? []).length,
    candidateCount: valid.descriptors.filter((descriptor) => descriptor.status === "candidate").length,
    plannedTestCount: valid.descriptors.filter((descriptor) => descriptor.status === "plannedTest").length,
    observedInModelOutputCount: valid.descriptors.filter((descriptor) => descriptor.status === "observedInModelOutput").length,
    internallyTestedCount: valid.descriptors.filter((descriptor) => descriptor.status === "internallyTested").length,
    externallyValidatedCount: valid.descriptors.filter((descriptor) => descriptor.status === "externallyValidated").length,
    rejectedCount: valid.descriptors.filter((descriptor) => descriptor.status === "rejected").length,
    executableCount: 0,
    warnings: getRobustnessResilienceWarnings(valid)
  };
}

export function validateRobustnessResilienceModelForRuntime(model: RobustnessResilienceModel) {
  const valid = validateRobustnessResilienceModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "Robustness and resilience descriptors declare stress semantics; they do not prove a system is robust or resilient or execute stress tests.",
      ...getRobustnessResilienceWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "robustnessResilience" as const,
        requiredSupportLevel: "runtime" as const,
        reason:
          "Robustness/Resilience V1 is structural only; current templates do not execute stressors, perturb active simulations, run stress-test plans, perform statistical validation, certify safety, optimize controls, validate, or calibrate."
      }
    ]
  };
}

export function getRobustnessResilienceWarnings(model: RobustnessResilienceModel): readonly string[] {
  const valid = validateRobustnessResilienceModel(model);
  const warnings: string[] = [];

  for (const descriptor of valid.descriptors) {
    if (descriptor.status === "externallyValidated" && !descriptor.notes?.length && !valid.validationNotes?.length) {
      warnings.push(`Descriptor ${descriptor.id} is externallyValidated without validation or provenance notes.`);
    }
    if (descriptor.status === "observedInModelOutput") {
      warnings.push(`Descriptor ${descriptor.id} is observedInModelOutput; model output is not real-world robustness validation.`);
    }
    if (descriptor.status === "internallyTested") {
      warnings.push(`Descriptor ${descriptor.id} is internallyTested; internal checks are software/model checks, not empirical validation.`);
    }
    if (descriptor.status === "plannedTest") {
      warnings.push(`Descriptor ${descriptor.id} is plannedTest; no stress test is executed by this descriptor.`);
    }
    if (descriptor.status === "candidate" || descriptor.status === "hypothesized") {
      warnings.push(`Descriptor ${descriptor.id} is ${descriptor.status}; robustness or resilience is not confirmed.`);
    }
    if (descriptor.status !== "externallyValidated" && descriptorClaimsBroadApplicability(descriptor)) {
      warnings.push(`Descriptor ${descriptor.id} uses broad-applicability language without external validation; V1 does not validate real-world robustness.`);
    }
    if (descriptor.active) {
      warnings.push(`Active descriptor ${descriptor.id} is structural only and is not runtime-executed.`);
    }
    if (!descriptor.stressorIds?.length) {
      warnings.push(`Descriptor ${descriptor.id} has no stressor references.`);
    }
    if (!descriptor.responseCriterionIds?.length) {
      warnings.push(`Descriptor ${descriptor.id} has no response criterion references.`);
    }
    if (!descriptor.targetDescription) {
      warnings.push(`Descriptor ${descriptor.id} has no targetDescription.`);
    }
  }

  for (const stressor of valid.stressors ?? []) {
    if (stressor.active) {
      warnings.push(`Active stressor ${stressor.id} is structural only and is not applied at runtime.`);
    }
    if (!stressor.targetPath && !stressor.targetDescription) {
      warnings.push(`Stressor ${stressor.id} has no targetPath or targetDescription.`);
    }
    if (!stressor.magnitudeDescription && !stressor.durationDescription && !stressor.timingDescription) {
      warnings.push(`Stressor ${stressor.id} has no magnitude, duration, or timing description.`);
    }
    if (stressor.stressorKind === "intervention") {
      warnings.push(
        `Stressor ${stressor.id} references intervention semantics; runtime interventions are not general robustness testing unless explicitly modeled and evaluated.`
      );
    }
  }

  for (const criterion of valid.responseCriteria ?? []) {
    if (criterion.active) {
      warnings.push(`Active response criterion ${criterion.id} is structural only and is not evaluated at runtime.`);
    }
    if (!criterion.metricId && !criterion.thresholdDescription && !criterion.successDescription) {
      warnings.push(`Response criterion ${criterion.id} has no metricId, thresholdDescription, or successDescription.`);
    }
  }

  for (const failureMode of valid.failureModes ?? []) {
    if (!failureMode.triggerDescription && !failureMode.consequenceDescription) {
      warnings.push(`Failure mode ${failureMode.id} has no triggerDescription or consequenceDescription.`);
    }
  }

  for (const plan of valid.stressTestPlans ?? []) {
    if (plan.active) {
      warnings.push(`Active stress-test plan ${plan.id} is structural only and is not executed.`);
    }
    if (!plan.stressorIds?.length && !plan.responseCriterionIds?.length) {
      warnings.push(`Stress-test plan ${plan.id} has no stressor or response criterion references.`);
    }
  }

  if (valid.scope?.uncertaintyConfigId || valid.scope?.uncertaintyResultId) {
    warnings.push("Robustness scope references uncertainty; uncertainty ensembles are not robustness validation by themselves.");
  }
  if (valid.scope?.emergencePatternModelId) {
    warnings.push("Robustness scope references emergence descriptors; pattern descriptors do not prove robustness or resilience.");
  }
  if (valid.scope?.causalAssumptionModelId) {
    warnings.push("Robustness scope references causal assumptions; causal assumptions do not prove robustness or resilience.");
  }
  if (valid.scope?.observabilityModelId) {
    warnings.push("Robustness scope references observability; measurement structure does not validate robustness.");
  }
  if (valid.scope?.quantitySemanticsModelId) {
    warnings.push("Robustness scope references quantity semantics; units do not validate robustness.");
  }
  if (valid.scope?.boundaryModelId || valid.scope?.resourceSystemId || valid.scope?.feedbackLoopModelId) {
    warnings.push("Robustness scope references boundary/resource/feedback structure; attached primitives do not execute stressors.");
  }
  if (valid.scope?.scaleModelId) {
    warnings.push("Robustness scope references scale structure; scale metadata does not validate robustness or resilience.");
  }
  if (valid.scope?.templateId === "forest-fire") {
    warnings.push("Forest-fire stress, cascade, collapse, or recovery descriptors are abstract model behavior, not wildfire risk validation.");
  }

  return warnings.slice(0, maxRobustnessWarnings);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function descriptorClaimsBroadApplicability(descriptor: RobustnessDescriptor): boolean {
  const text = JSON.stringify({
    targetDescription: descriptor.targetDescription,
    notes: descriptor.notes,
    metadata: descriptor.metadata
  }).toLowerCase();
  return /\bbroad applicability\b|\bgeneraliz|\breal-world\b|\breal world\b|\boperational\b|\bproduction\b|\bsafety\b|\bcertif/.test(text);
}
