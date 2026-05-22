import { validateEmergencePatternModel } from "./validation";
import type {
  EmergencePatternModel,
  EmergencePatternSummary,
  PatternDescriptor,
  PatternDescriptorStatus,
  PatternKind,
  PatternScaleLink,
  PatternSignature,
  PatternThreshold,
  PatternTimeWindow,
  PatternVariable
} from "./types";
import { maxEmergenceWarnings } from "./types";

export function listPatternDescriptors(model: EmergencePatternModel): readonly PatternDescriptor[] {
  return clone(validateEmergencePatternModel(model).descriptors);
}

export function listActivePatternDescriptors(model: EmergencePatternModel): readonly PatternDescriptor[] {
  return clone(validateEmergencePatternModel(model).descriptors.filter((descriptor) => descriptor.active));
}

export function getPatternDescriptor(model: EmergencePatternModel, descriptorId: string): PatternDescriptor | undefined {
  const descriptor = validateEmergencePatternModel(model).descriptors.find((candidate) => candidate.id === descriptorId);
  return descriptor ? clone(descriptor) : undefined;
}

export function listPatternDescriptorsByKind(model: EmergencePatternModel, patternKind: PatternKind): readonly PatternDescriptor[] {
  return clone(validateEmergencePatternModel(model).descriptors.filter((descriptor) => descriptor.patternKind === patternKind));
}

export function listPatternDescriptorsByStatus(model: EmergencePatternModel, status: PatternDescriptorStatus): readonly PatternDescriptor[] {
  return clone(validateEmergencePatternModel(model).descriptors.filter((descriptor) => descriptor.status === status));
}

export function listCandidatePatternDescriptors(model: EmergencePatternModel): readonly PatternDescriptor[] {
  return clone(
    validateEmergencePatternModel(model).descriptors.filter(
      (descriptor) => descriptor.status === "candidate" || descriptor.status === "hypothesized"
    )
  );
}

export function listObservedPatternDescriptors(model: EmergencePatternModel): readonly PatternDescriptor[] {
  return clone(validateEmergencePatternModel(model).descriptors.filter((descriptor) => descriptor.status === "observedInModelOutput"));
}

export function listPatternVariables(model: EmergencePatternModel): readonly PatternVariable[] {
  return clone(validateEmergencePatternModel(model).patternVariables ?? []);
}

export function getPatternVariable(model: EmergencePatternModel, variableId: string): PatternVariable | undefined {
  const variable = validateEmergencePatternModel(model).patternVariables?.find((candidate) => candidate.id === variableId);
  return variable ? clone(variable) : undefined;
}

export function listPatternSignatures(model: EmergencePatternModel): readonly PatternSignature[] {
  return clone(validateEmergencePatternModel(model).signatures ?? []);
}

export function getPatternSignature(model: EmergencePatternModel, signatureId: string): PatternSignature | undefined {
  const signature = validateEmergencePatternModel(model).signatures?.find((candidate) => candidate.id === signatureId);
  return signature ? clone(signature) : undefined;
}

export function getSignaturesForDescriptor(model: EmergencePatternModel, descriptorId: string): readonly PatternSignature[] {
  const valid = validateEmergencePatternModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.signatureIds ?? []);
  return clone((valid.signatures ?? []).filter((signature) => ids.has(signature.id)));
}

export function listPatternThresholds(model: EmergencePatternModel): readonly PatternThreshold[] {
  return clone(validateEmergencePatternModel(model).thresholds ?? []);
}

export function getPatternThreshold(model: EmergencePatternModel, thresholdId: string): PatternThreshold | undefined {
  const threshold = validateEmergencePatternModel(model).thresholds?.find((candidate) => candidate.id === thresholdId);
  return threshold ? clone(threshold) : undefined;
}

export function getThresholdsForDescriptor(model: EmergencePatternModel, descriptorId: string): readonly PatternThreshold[] {
  const valid = validateEmergencePatternModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.thresholdIds ?? []);
  return clone((valid.thresholds ?? []).filter((threshold) => ids.has(threshold.id)));
}

export function listPatternTimeWindows(model: EmergencePatternModel): readonly PatternTimeWindow[] {
  return clone(validateEmergencePatternModel(model).timeWindows ?? []);
}

export function getPatternTimeWindow(model: EmergencePatternModel, timeWindowId: string): PatternTimeWindow | undefined {
  const timeWindow = validateEmergencePatternModel(model).timeWindows?.find((candidate) => candidate.id === timeWindowId);
  return timeWindow ? clone(timeWindow) : undefined;
}

export function getTimeWindowsForDescriptor(model: EmergencePatternModel, descriptorId: string): readonly PatternTimeWindow[] {
  const valid = validateEmergencePatternModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.timeWindowIds ?? []);
  return clone((valid.timeWindows ?? []).filter((timeWindow) => ids.has(timeWindow.id)));
}

export function listPatternScaleLinks(model: EmergencePatternModel): readonly PatternScaleLink[] {
  return clone(validateEmergencePatternModel(model).scaleLinks ?? []);
}

export function getPatternScaleLink(model: EmergencePatternModel, scaleLinkId: string): PatternScaleLink | undefined {
  const scaleLink = validateEmergencePatternModel(model).scaleLinks?.find((candidate) => candidate.id === scaleLinkId);
  return scaleLink ? clone(scaleLink) : undefined;
}

export function getScaleLinksForDescriptor(model: EmergencePatternModel, descriptorId: string): readonly PatternScaleLink[] {
  const valid = validateEmergencePatternModel(model);
  const descriptor = valid.descriptors.find((candidate) => candidate.id === descriptorId);
  const ids = new Set(descriptor?.scaleLinkIds ?? []);
  return clone((valid.scaleLinks ?? []).filter((scaleLink) => ids.has(scaleLink.id)));
}

export function modelHasCandidatePatterns(model: EmergencePatternModel): boolean {
  return validateEmergencePatternModel(model).descriptors.some(
    (descriptor) => descriptor.status === "candidate" || descriptor.status === "hypothesized"
  );
}

export function modelHasExternallyValidatedPatterns(model: EmergencePatternModel): boolean {
  return validateEmergencePatternModel(model).descriptors.some((descriptor) => descriptor.status === "externallyValidated");
}

export function summarizeEmergencePatternModel(model: EmergencePatternModel): EmergencePatternSummary {
  const valid = validateEmergencePatternModel(model);
  return {
    id: valid.id,
    name: valid.name,
    descriptorCount: valid.descriptors.length,
    activeDescriptorCount: valid.descriptors.filter((descriptor) => descriptor.active).length,
    candidateCount: valid.descriptors.filter((descriptor) => descriptor.status === "candidate").length,
    observedInModelOutputCount: valid.descriptors.filter((descriptor) => descriptor.status === "observedInModelOutput").length,
    internallyTestedCount: valid.descriptors.filter((descriptor) => descriptor.status === "internallyTested").length,
    externallyValidatedCount: valid.descriptors.filter((descriptor) => descriptor.status === "externallyValidated").length,
    rejectedCount: valid.descriptors.filter((descriptor) => descriptor.status === "rejected").length,
    variableCount: (valid.patternVariables ?? []).length,
    signatureCount: (valid.signatures ?? []).length,
    thresholdCount: (valid.thresholds ?? []).length,
    timeWindowCount: (valid.timeWindows ?? []).length,
    scaleLinkCount: (valid.scaleLinks ?? []).length,
    executableCount: 0,
    warnings: getEmergencePatternWarnings(valid)
  };
}

export function validateEmergencePatternModelForRuntime(model: EmergencePatternModel) {
  const valid = validateEmergencePatternModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "Emergence pattern descriptors describe candidate patterns; they do not prove emergence or execute runtime detection.",
      ...getEmergencePatternWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "emergenceDetection" as const,
        requiredSupportLevel: "runtime" as const,
        reason:
          "Emergence Pattern Descriptors V1 is structural only; current templates do not detect patterns at runtime, prove emergence, compute statistical significance, mine patterns with ML, validate, or calibrate."
      }
    ]
  };
}

export function getEmergencePatternWarnings(model: EmergencePatternModel): readonly string[] {
  const valid = validateEmergencePatternModel(model);
  const warnings: string[] = [];
  const signaturesById = new Map((valid.signatures ?? []).map((signature) => [signature.id, signature]));

  for (const descriptor of valid.descriptors) {
    if (descriptor.status === "externallyValidated" && !descriptor.notes?.length && !valid.validationNotes?.length) {
      warnings.push(`Descriptor ${descriptor.id} is externallyValidated without validation or provenance notes.`);
    }
    if (descriptor.status === "observedInModelOutput") {
      warnings.push(`Descriptor ${descriptor.id} is observedInModelOutput; model output is not real-world validation.`);
    }
    if (descriptor.status === "internallyTested") {
      warnings.push(`Descriptor ${descriptor.id} is internallyTested; internal checks are software/model checks, not empirical validation.`);
    }
    if (descriptor.active) {
      warnings.push(`Active descriptor ${descriptor.id} is a structural declaration, not a runtime-detected result.`);
    }
    if (descriptor.status === "candidate" || descriptor.status === "hypothesized") {
      warnings.push(`Descriptor ${descriptor.id} is ${descriptor.status}; it is not confirmed or proven emergence.`);
    }
    if (!descriptor.localMechanismDescription) {
      warnings.push(`Descriptor ${descriptor.id} has no localMechanismDescription.`);
    }
    if (!descriptor.globalPatternDescription) {
      warnings.push(`Descriptor ${descriptor.id} has no globalPatternDescription.`);
    }
    if (!descriptor.signatureIds?.length) {
      warnings.push(`Descriptor ${descriptor.id} has no pattern signatures.`);
    }
    if (!descriptor.variableIds?.length) {
      warnings.push(`Descriptor ${descriptor.id} has no pattern variables.`);
    }
    if (
      (descriptor.patternKind === "phaseTransition" || descriptor.patternKind === "tippingPoint" || descriptor.patternKind === "criticality") &&
      !descriptor.thresholdIds?.length
    ) {
      warnings.push(`Descriptor ${descriptor.id} describes ${descriptor.patternKind} without a threshold.`);
    }
    if ((descriptor.patternKind === "oscillation" || descriptor.patternKind === "wave") && !descriptor.timeWindowIds?.length) {
      warnings.push(`Descriptor ${descriptor.id} describes ${descriptor.patternKind} without timing-window semantics.`);
    }
    if (descriptor.patternKind === "clustering" || descriptor.patternKind === "segregation") {
      const hasSpatialOrNetworkSignature = (descriptor.signatureIds ?? []).some((signatureId) => {
        const kind = signaturesById.get(signatureId)?.signatureKind;
        return kind === "spatialCluster" || kind === "networkCluster";
      });
      if (!hasSpatialOrNetworkSignature) {
        warnings.push(`Descriptor ${descriptor.id} describes ${descriptor.patternKind} without a spatial or network signature.`);
      }
    }
    if (valid.scope?.templateId === "forest-fire" && (descriptor.patternKind === "cascade" || descriptor.patternKind === "percolation")) {
      warnings.push(`Forest-fire ${descriptor.patternKind} descriptor ${descriptor.id} is an abstract spread descriptor, not wildfire validation.`);
    }
  }

  for (const signature of valid.signatures ?? []) {
    if (signature.active) {
      warnings.push(`Active signature ${signature.id} is structural only and is not computed at runtime.`);
    }
  }

  for (const threshold of valid.thresholds ?? []) {
    if (!threshold.quantityId && !threshold.unitId) {
      warnings.push(`Threshold ${threshold.id} has no quantityId or unitId reference.`);
    }
  }

  for (const timeWindow of valid.timeWindows ?? []) {
    if (timeWindow.windowKind === "unknown") {
      warnings.push(`Time window ${timeWindow.id} has unknown timing semantics.`);
    }
  }

  for (const scaleLink of valid.scaleLinks ?? []) {
    if (
      scaleLink.relation === "localToGlobal" ||
      scaleLink.relation === "crossScaleFeedback" ||
      scaleLink.relation === "aggregation" ||
      scaleLink.relation === "disaggregation"
    ) {
      warnings.push(`Scale link ${scaleLink.id} relation ${scaleLink.relation} is structural only and executes no aggregation or detection.`);
    }
  }

  for (const variable of valid.patternVariables ?? []) {
    if (variable.variableKind === "metric") {
      warnings.push(`Metric variable ${variable.id} references runtime model output, not empirical pattern evidence.`);
    }
  }

  if (valid.scope?.observabilityModelId) {
    warnings.push("Emergence scope references an observability model; observability does not prove the pattern.");
  }
  if (valid.scope?.causalAssumptionModelId) {
    warnings.push("Emergence scope references a causal assumption model; causal assumptions do not prove emergence.");
  }
  if (valid.scope?.quantitySemanticsModelId) {
    warnings.push("Emergence scope references a quantity semantics model; unit consistency does not prove emergence.");
  }
  if (valid.scope?.scaleModelId || valid.scope?.scaleViewStateId) {
    warnings.push("Emergence scope references scale structure; multi-scale structure and scale views do not prove emergence.");
  }
  if (!valid.descriptors.some((descriptor) => descriptor.status === "externallyValidated")) {
    warnings.push("No external validation is declared; pattern descriptors are descriptive model metadata, not broad applicability claims.");
  }

  return warnings.slice(0, maxEmergenceWarnings);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
