import type { MultiScaleModel, ScaleLevel, ScaleType } from "./types";
import { validateMultiScaleModel } from "./validation";

export function getScaleLevel(model: MultiScaleModel, scaleId: string): ScaleLevel | undefined {
  const level = validateMultiScaleModel(model).scaleLevels.find((candidate) => candidate.id === scaleId);
  return level ? clone(level) : undefined;
}

export function listScaleLevels(model: MultiScaleModel): readonly ScaleLevel[] {
  return clone(validateMultiScaleModel(model).scaleLevels);
}

export function listScaleLevelsByOrder(model: MultiScaleModel): readonly ScaleLevel[] {
  return clone([...validateMultiScaleModel(model).scaleLevels].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)));
}

export function getEntityTypesForScale(model: MultiScaleModel, scaleId: string) {
  const level = validateMultiScaleModel(model).scaleLevels.find((candidate) => candidate.id === scaleId);
  return clone(level?.entityTypes ?? []);
}

export function getAggregationRulesFromScale(model: MultiScaleModel, scaleId: string) {
  return clone(validateMultiScaleModel(model).aggregationRules.filter((rule) => rule.fromScaleId === scaleId));
}

export function getAggregationRulesToScale(model: MultiScaleModel, scaleId: string) {
  return clone(validateMultiScaleModel(model).aggregationRules.filter((rule) => rule.toScaleId === scaleId));
}

export function getDisaggregationRulesFromScale(model: MultiScaleModel, scaleId: string) {
  return clone(validateMultiScaleModel(model).disaggregationRules.filter((rule) => rule.fromScaleId === scaleId));
}

export function getDisaggregationRulesToScale(model: MultiScaleModel, scaleId: string) {
  return clone(validateMultiScaleModel(model).disaggregationRules.filter((rule) => rule.toScaleId === scaleId));
}

export function getCrossScaleLinksForScale(model: MultiScaleModel, scaleId: string) {
  return clone(
    validateMultiScaleModel(model).crossScaleLinks.filter((link) => link.sourceScaleId === scaleId || link.targetScaleId === scaleId)
  );
}

export function getCrossScaleLinksBetween(model: MultiScaleModel, sourceScaleId: string, targetScaleId: string) {
  return clone(
    validateMultiScaleModel(model).crossScaleLinks.filter(
      (link) => link.sourceScaleId === sourceScaleId && link.targetScaleId === targetScaleId
    )
  );
}

export function hasScaleLevel(model: MultiScaleModel, scaleId: string): boolean {
  return validateMultiScaleModel(model).scaleLevels.some((level) => level.id === scaleId);
}

export function modelUsesScaleType(model: MultiScaleModel, scaleType: ScaleType): boolean {
  return validateMultiScaleModel(model).scaleLevels.some((level) => level.scaleType === scaleType);
}

export function summarizeMultiScaleModel(model: MultiScaleModel) {
  const valid = validateMultiScaleModel(model);
  const informationLossWarnings = getInformationLossWarnings(valid);
  const syntheticDetailWarnings = getSyntheticDetailWarnings(valid);
  return {
    id: valid.id,
    name: valid.name,
    scaleLevelCount: valid.scaleLevels.length,
    entityTypeCount: valid.scaleLevels.reduce((sum, level) => sum + level.entityTypes.length, 0),
    aggregationRuleCount: valid.aggregationRules.length,
    disaggregationRuleCount: valid.disaggregationRules.length,
    crossScaleLinkCount: valid.crossScaleLinks.length,
    ...(valid.primaryScaleId ? { primaryScaleId: valid.primaryScaleId } : {}),
    hasSyntheticDisaggregation: valid.disaggregationRules.some((rule) => rule.disaggregationType !== "restorePrevious"),
    hasInformationLoss: informationLossWarnings.length > 0,
    runnableNow: false,
    warnings: [
      "Multi-scale V1 is structural only; current templates do not execute multi-scale dynamics.",
      ...informationLossWarnings,
      ...syntheticDetailWarnings
    ]
  };
}

export function validateMultiScaleModelForRuntime(model: MultiScaleModel) {
  const valid = validateMultiScaleModel(model);
  const informationLossWarnings = getInformationLossWarnings(valid);
  const syntheticDetailWarnings = getSyntheticDetailWarnings(valid);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    warnings: [
      "A valid scale model is a structural description, not proof that a template can execute multi-scale dynamics.",
      "Camera zoom is not multi-scale modeling.",
      ...informationLossWarnings,
      ...syntheticDetailWarnings
    ],
    errors: [],
    informationLossWarnings,
    syntheticDetailWarnings,
    missingCapabilities: [
      {
        primitiveId: "multiScale" as const,
        requiredSupportLevel: "runtime" as const,
        reason: "Multi-scale runtime aggregation/disaggregation is not implemented in V1."
      }
    ]
  };
}

function getInformationLossWarnings(model: MultiScaleModel): readonly string[] {
  return model.aggregationRules
    .filter((rule) => (rule.informationLossNotes?.length ?? 0) > 0)
    .map((rule) => `Aggregation rule ${rule.id} may lose information: ${rule.informationLossNotes!.join(" ")}`);
}

function getSyntheticDetailWarnings(model: MultiScaleModel): readonly string[] {
  return model.disaggregationRules
    .filter((rule) => rule.disaggregationType !== "restorePrevious")
    .map((rule) => `Disaggregation rule ${rule.id} creates synthetic detail: ${rule.syntheticDetailNotes?.join(" ") ?? "noted by rule type"}`);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
