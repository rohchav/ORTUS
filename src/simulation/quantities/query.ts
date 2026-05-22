import { validateQuantitySemanticsModel } from "./validation";
import type {
  CompatibilityRule,
  DimensionDefinition,
  QuantityDefinition,
  QuantityKind,
  QuantitySemanticsModel,
  QuantitySemanticsSummary,
  UnitDefinition
} from "./types";
import { maxQuantityWarnings } from "./types";

export function listDimensions(model: QuantitySemanticsModel): readonly DimensionDefinition[] {
  return clone(validateQuantitySemanticsModel(model).dimensions);
}

export function getDimension(model: QuantitySemanticsModel, dimensionId: string): DimensionDefinition | undefined {
  const dimension = validateQuantitySemanticsModel(model).dimensions.find((candidate) => candidate.id === dimensionId);
  return dimension ? clone(dimension) : undefined;
}

export function listUnits(model: QuantitySemanticsModel): readonly UnitDefinition[] {
  return clone(validateQuantitySemanticsModel(model).units);
}

export function getUnit(model: QuantitySemanticsModel, unitId: string): UnitDefinition | undefined {
  const unit = validateQuantitySemanticsModel(model).units.find((candidate) => candidate.id === unitId);
  return unit ? clone(unit) : undefined;
}

export function listUnitsForDimension(model: QuantitySemanticsModel, dimensionId: string): readonly UnitDefinition[] {
  return clone(validateQuantitySemanticsModel(model).units.filter((unit) => unit.dimensionId === dimensionId));
}

export function listQuantities(model: QuantitySemanticsModel): readonly QuantityDefinition[] {
  return clone(validateQuantitySemanticsModel(model).quantities);
}

export function listActiveQuantities(model: QuantitySemanticsModel): readonly QuantityDefinition[] {
  return clone(validateQuantitySemanticsModel(model).quantities.filter((quantity) => quantity.active));
}

export function getQuantity(model: QuantitySemanticsModel, quantityId: string): QuantityDefinition | undefined {
  const quantity = validateQuantitySemanticsModel(model).quantities.find((candidate) => candidate.id === quantityId);
  return quantity ? clone(quantity) : undefined;
}

export function listQuantitiesByKind(model: QuantitySemanticsModel, quantityKind: QuantityKind): readonly QuantityDefinition[] {
  return clone(validateQuantitySemanticsModel(model).quantities.filter((quantity) => quantity.quantityKind === quantityKind));
}

export function listQuantitiesByDimension(model: QuantitySemanticsModel, dimensionId: string): readonly QuantityDefinition[] {
  const valid = validateQuantitySemanticsModel(model);
  const unitsById = new Map(valid.units.map((unit) => [unit.id, unit]));
  return clone(
    valid.quantities.filter((quantity) => quantity.dimensionId === dimensionId || (quantity.unitId && unitsById.get(quantity.unitId)?.dimensionId === dimensionId))
  );
}

export function listQuantitiesByUnit(model: QuantitySemanticsModel, unitId: string): readonly QuantityDefinition[] {
  return clone(validateQuantitySemanticsModel(model).quantities.filter((quantity) => quantity.unitId === unitId));
}

export function listProbabilityQuantities(model: QuantitySemanticsModel): readonly QuantityDefinition[] {
  return clone(validateQuantitySemanticsModel(model).quantities.filter((quantity) => quantity.quantityKind === "probability"));
}

export function listRateQuantities(model: QuantitySemanticsModel): readonly QuantityDefinition[] {
  return clone(validateQuantitySemanticsModel(model).quantities.filter((quantity) => quantity.quantityKind === "rate"));
}

export function listCountQuantities(model: QuantitySemanticsModel): readonly QuantityDefinition[] {
  return clone(validateQuantitySemanticsModel(model).quantities.filter((quantity) => quantity.quantityKind === "count"));
}

export function listResourceQuantities(model: QuantitySemanticsModel): readonly QuantityDefinition[] {
  return clone(
    validateQuantitySemanticsModel(model).quantities.filter(
      (quantity) => quantity.quantityKind === "resourceStock" || quantity.quantityKind === "resourceFlow"
    )
  );
}

export function listCompatibilityRules(model: QuantitySemanticsModel): readonly CompatibilityRule[] {
  return clone(validateQuantitySemanticsModel(model).compatibilityRules ?? []);
}

export function getCompatibilityRule(model: QuantitySemanticsModel, ruleId: string): CompatibilityRule | undefined {
  const rule = validateQuantitySemanticsModel(model).compatibilityRules?.find((candidate) => candidate.id === ruleId);
  return rule ? clone(rule) : undefined;
}

export function getCompatibilityRulesForQuantity(model: QuantitySemanticsModel, quantityId: string): readonly CompatibilityRule[] {
  return clone(
    (validateQuantitySemanticsModel(model).compatibilityRules ?? []).filter(
      (rule) => rule.leftQuantityId === quantityId || rule.rightQuantityId === quantityId
    )
  );
}

export function areQuantitiesDeclaredCompatible(model: QuantitySemanticsModel, leftQuantityId: string, rightQuantityId: string): boolean {
  const valid = validateQuantitySemanticsModel(model);
  return (valid.compatibilityRules ?? []).some((rule) => {
    const sameOrder = rule.leftQuantityId === leftQuantityId && rule.rightQuantityId === rightQuantityId;
    const reverseOrder = rule.leftQuantityId === rightQuantityId && rule.rightQuantityId === leftQuantityId;
    return (sameOrder || reverseOrder) && (rule.relation === "compatible" || rule.relation === "requiresConversion");
  });
}

export function modelHasProbabilityQuantities(model: QuantitySemanticsModel): boolean {
  return validateQuantitySemanticsModel(model).quantities.some((quantity) => quantity.quantityKind === "probability");
}

export function modelHasRateQuantities(model: QuantitySemanticsModel): boolean {
  return validateQuantitySemanticsModel(model).quantities.some((quantity) => quantity.quantityKind === "rate");
}

export function summarizeQuantitySemanticsModel(model: QuantitySemanticsModel): QuantitySemanticsSummary {
  const valid = validateQuantitySemanticsModel(model);
  return {
    id: valid.id,
    name: valid.name,
    dimensionCount: valid.dimensions.length,
    unitCount: valid.units.length,
    quantityCount: valid.quantities.length,
    activeQuantityCount: valid.quantities.filter((quantity) => quantity.active).length,
    probabilityQuantityCount: valid.quantities.filter((quantity) => quantity.quantityKind === "probability").length,
    rateQuantityCount: valid.quantities.filter((quantity) => quantity.quantityKind === "rate").length,
    countQuantityCount: valid.quantities.filter((quantity) => quantity.quantityKind === "count").length,
    resourceQuantityCount: valid.quantities.filter((quantity) => quantity.quantityKind === "resourceStock" || quantity.quantityKind === "resourceFlow").length,
    dimensionlessQuantityCount: valid.quantities.filter((quantity) => isDimensionlessQuantity(valid, quantity)).length,
    compatibilityRuleCount: (valid.compatibilityRules ?? []).length,
    executableCount: 0,
    warnings: getQuantitySemanticsWarnings(valid)
  };
}

export function validateQuantitySemanticsModelForRuntime(model: QuantitySemanticsModel) {
  const valid = validateQuantitySemanticsModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "Quantity semantics declarations do not enforce runtime unit conversion or dimensional consistency.",
      ...getQuantitySemanticsWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "unitsDimensionalConsistency" as const,
        requiredSupportLevel: "runtime" as const,
        reason:
          "Units/Dimensions V1 is structural only; current templates do not enforce units, execute conversions, solve dimensions, run symbolic algebra, calibrate, or validate values."
      }
    ]
  };
}

export function getQuantitySemanticsWarnings(model: QuantitySemanticsModel): readonly string[] {
  const valid = validateQuantitySemanticsModel(model);
  const warnings: string[] = [];
  const dimensionsById = new Map(valid.dimensions.map((dimension) => [dimension.id, dimension]));
  const unitsById = new Map(valid.units.map((unit) => [unit.id, unit]));
  const canonicalByDimension = new Map<string, UnitDefinition[]>();

  for (const unit of valid.units) {
    if (unit.canonical) {
      const units = canonicalByDimension.get(unit.dimensionId) ?? [];
      units.push(unit);
      canonicalByDimension.set(unit.dimensionId, units);
    }
    if (unit.conversionNotes) {
      warnings.push(`Unit ${unit.id} has conversionNotes, but Quantity Semantics V1 does not execute conversion.`);
    }
    if (unit.unitKind === "index" || unit.unitKind === "category") {
      warnings.push(`Unit ${unit.id} is ${unit.unitKind}; arithmetic over index/category units may be invalid.`);
    }
  }

  for (const dimension of valid.dimensions) {
    const units = valid.units.filter((unit) => unit.dimensionId === dimension.id);
    if (units.length > 0 && !units.some((unit) => unit.canonical)) {
      warnings.push(`Dimension ${dimension.id} has no canonical unit declaration.`);
    }
    const canonicalUnits = canonicalByDimension.get(dimension.id) ?? [];
    if (canonicalUnits.length > 1) {
      warnings.push(`Dimension ${dimension.id} has multiple canonical units; no automatic conversion is executed.`);
    }
  }

  for (const quantity of valid.quantities) {
    const unit = quantity.unitId ? unitsById.get(quantity.unitId) : undefined;
    const declaredDimension = quantity.dimensionId ? dimensionsById.get(quantity.dimensionId) : undefined;
    const unitDimension = unit ? dimensionsById.get(unit.dimensionId) : undefined;
    if (!quantity.unitId && !quantity.dimensionId) {
      warnings.push(`Quantity ${quantity.id} has neither unitId nor dimensionId.`);
    }
    if (unit && quantity.dimensionId && unit.dimensionId !== quantity.dimensionId) {
      warnings.push(`Quantity ${quantity.id} unit ${unit.id} dimension ${unit.dimensionId} differs from declared dimension ${quantity.dimensionId}.`);
    }
    if (quantity.quantityKind === "probability" && quantity.numericRole !== "bounded01") {
      warnings.push(`Probability quantity ${quantity.id} is not declared with bounded01 numericRole; it is not a calibrated probability.`);
    }
    if (quantity.numericRole === "bounded01" && quantity.quantityKind !== "probability") {
      warnings.push(`Quantity ${quantity.id} uses bounded01 numericRole outside a probability quantity; check whether 0..1 semantics are intended.`);
    }
    if (quantity.quantityKind === "count" && quantity.numericRole !== "integer" && quantity.numericRole !== "nonNegative") {
      warnings.push(`Count quantity ${quantity.id} is not declared as integer or nonNegative.`);
    }
    if (quantity.quantityKind === "rate" && !quantity.perTick && !quantity.perTimeUnitId && !quantity.perSpaceUnitId && !quantity.perEntityUnitId) {
      warnings.push(`Rate quantity ${quantity.id} has no per-tick, per-time, per-space, or per-entity basis.`);
    }
    if (quantity.perTick) {
      warnings.push(`Quantity ${quantity.id} is perTick; tick is model time, not physical time unless explicitly mapped.`);
    }
    if ((quantity.quantityKind === "resourceStock" || quantity.quantityKind === "resourceFlow") && !valid.scope?.resourceSystemId) {
      warnings.push(`Resource quantity ${quantity.id} has no resourceSystemId in scope; describing resource units does not enforce resource runtime behavior.`);
    }
    if (quantity.quantityKind === "metric") {
      warnings.push(`Metric quantity ${quantity.id} unit semantics are declarations, not empirical validation.`);
    }
    if (quantity.active) {
      warnings.push(`Active quantity ${quantity.id} is a structural declaration, not runtime-enforced unit behavior.`);
    }
    if (unit?.unitKind === "index" || unit?.unitKind === "category" || declaredDimension?.dimensionKind === "dimensionless" || unitDimension?.dimensionKind === "dimensionless") {
      warnings.push(`Quantity ${quantity.id} is dimensionless/index/category-like; semantics must be explicit before arithmetic or comparison.`);
    }
  }

  for (const rule of valid.compatibilityRules ?? []) {
    if (rule.relation === "requiresConversion") {
      warnings.push(`Compatibility rule ${rule.id} requiresConversion, but conversion is structural only and is not executed.`);
    }
    if (rule.relation === "unknown") {
      warnings.push(`Compatibility rule ${rule.id} has unknown compatibility semantics.`);
    }
  }

  if (valid.scope?.observabilityModelId) {
    warnings.push("Quantity scope references an observability model; measurement units do not imply measurement validity.");
  }
  if (valid.scope?.causalAssumptionModelId) {
    warnings.push("Quantity scope references a causal assumption model; unit consistency does not imply causal validity or proof.");
  }

  return warnings.slice(0, maxQuantityWarnings);
}

function isDimensionlessQuantity(model: QuantitySemanticsModel, quantity: QuantityDefinition): boolean {
  const unitsById = new Map(model.units.map((unit) => [unit.id, unit]));
  const dimensionsById = new Map(model.dimensions.map((dimension) => [dimension.id, dimension]));
  const unit = quantity.unitId ? unitsById.get(quantity.unitId) : undefined;
  const dimensionId = quantity.dimensionId ?? unit?.dimensionId;
  return Boolean(dimensionId && dimensionsById.get(dimensionId)?.dimensionKind === "dimensionless");
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
