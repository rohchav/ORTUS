import { validateSpatialFieldModel } from "./validation";
import type {
  CoordinateSpace,
  EnvironmentalLayer,
  FieldDefinition,
  SamplingRule,
  SpatialFieldModel,
  SpatialFieldSummary
} from "./types";
import { maxSpatialFieldWarnings } from "./types";

export function getCoordinateSpace(model: SpatialFieldModel): CoordinateSpace {
  return clone(validateSpatialFieldModel(model).coordinateSpace);
}

export function listFields(model: SpatialFieldModel): readonly FieldDefinition[] {
  return clone(validateSpatialFieldModel(model).fields);
}

export function listActiveFields(model: SpatialFieldModel): readonly FieldDefinition[] {
  return clone(validateSpatialFieldModel(model).fields.filter((field) => field.active));
}

export function getField(model: SpatialFieldModel, fieldId: string): FieldDefinition | undefined {
  const field = validateSpatialFieldModel(model).fields.find((candidate) => candidate.id === fieldId);
  return field ? clone(field) : undefined;
}

export function listLayers(model: SpatialFieldModel): readonly EnvironmentalLayer[] {
  return clone(validateSpatialFieldModel(model).layers ?? []);
}

export function listActiveLayers(model: SpatialFieldModel): readonly EnvironmentalLayer[] {
  return clone((validateSpatialFieldModel(model).layers ?? []).filter((layer) => layer.active));
}

export function getLayer(model: SpatialFieldModel, layerId: string): EnvironmentalLayer | undefined {
  const layer = validateSpatialFieldModel(model).layers?.find((candidate) => candidate.id === layerId);
  return layer ? clone(layer) : undefined;
}

export function getFieldsForLayer(model: SpatialFieldModel, layerId: string): readonly FieldDefinition[] {
  const valid = validateSpatialFieldModel(model);
  const layer = valid.layers?.find((candidate) => candidate.id === layerId);
  if (!layer) {
    return [];
  }
  const ids = new Set(layer.fieldIds);
  return clone(valid.fields.filter((field) => ids.has(field.id)));
}

export function listSamplingRules(model: SpatialFieldModel): readonly SamplingRule[] {
  return clone(validateSpatialFieldModel(model).samplingRules ?? []);
}

export function getSamplingRulesForField(model: SpatialFieldModel, fieldId: string): readonly SamplingRule[] {
  return clone((validateSpatialFieldModel(model).samplingRules ?? []).filter((rule) => rule.fieldId === fieldId));
}

export function modelHasSyntheticFields(model: SpatialFieldModel): boolean {
  return validateSpatialFieldModel(model).fields.some((field) => field.valueSource === "synthetic");
}

export function modelHasMeasuredFields(model: SpatialFieldModel): boolean {
  return validateSpatialFieldModel(model).fields.some((field) => field.valueSource === "measured");
}

export function modelHasPlaceholderFields(model: SpatialFieldModel): boolean {
  return validateSpatialFieldModel(model).fields.some((field) => field.valueSource === "placeholder");
}

export function summarizeSpatialFieldModel(model: SpatialFieldModel): SpatialFieldSummary {
  const valid = validateSpatialFieldModel(model);
  const fields = valid.fields;
  const layers = valid.layers ?? [];
  const samplingRules = valid.samplingRules ?? [];
  return {
    id: valid.id,
    name: valid.name,
    coordinateSpaceType: valid.coordinateSpace.spaceType,
    fieldCount: fields.length,
    activeFieldCount: fields.filter((field) => field.active).length,
    layerCount: layers.length,
    activeLayerCount: layers.filter((layer) => layer.active).length,
    samplingRuleCount: samplingRules.length,
    syntheticFieldCount: fields.filter((field) => field.valueSource === "synthetic").length,
    measuredFieldCount: fields.filter((field) => field.valueSource === "measured").length,
    placeholderFieldCount: fields.filter((field) => field.valueSource === "placeholder").length,
    executableCount: 0,
    warnings: getSpatialFieldWarnings(valid)
  };
}

export function validateSpatialFieldModelForRuntime(model: SpatialFieldModel) {
  const valid = validateSpatialFieldModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "Spatial fields are structural layer definitions, not runtime diffusion or GIS engines.",
      ...getSpatialFieldWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "spatialFields" as const,
        requiredSupportLevel: "runtime" as const,
        reason: "Spatial fields V1 is structural only; current templates do not execute field sampling, interpolation, diffusion, advection, or field coupling."
      }
    ]
  };
}

export function getSpatialFieldWarnings(model: SpatialFieldModel): readonly string[] {
  const valid = validateSpatialFieldModel(model);
  const warnings: string[] = [];
  const fields = valid.fields;
  const layers = valid.layers ?? [];
  const samplingRules = valid.samplingRules ?? [];

  if (!valid.coordinateSpace.extent) {
    warnings.push("Coordinate space has no extent; the spatial field model remains structural and cannot bound runtime sampling.");
  }
  if (valid.coordinateSpace.spaceType === "grid2D" && !valid.coordinateSpace.resolution) {
    warnings.push("Grid coordinate space has no resolution; rows, columns, or cell size are not declared.");
  }
  if (valid.coordinateSpace.spaceType === "continuous2D" && !valid.coordinateSpace.unit) {
    warnings.push("Continuous coordinate space has no unit; distance semantics are structural only.");
  }

  for (const field of fields) {
    if (field.fieldType === "probabilityLike") {
      warnings.push(`Field ${field.id} is probability-like, but it is not a calibrated probability.`);
    }
    if (field.valueSource === "measured" && !hasProvenanceNote(field.notes)) {
      warnings.push(`Measured field ${field.id} has no provenance notes.`);
    }
    if (field.valueSource === "synthetic" && !hasNotes(field.notes)) {
      warnings.push(`Synthetic field ${field.id} has no synthetic-detail notes.`);
    }
    if (field.valueSource === "placeholder" && field.active) {
      warnings.push(`Placeholder field ${field.id} is active; active fields are structural declarations, not runtime-executed field coupling.`);
    } else if (field.active) {
      warnings.push(`Active field ${field.id} is a structural declaration, not runtime-executed field coupling.`);
    }
  }

  for (const layer of layers) {
    if (layer.fieldIds.length === 0) {
      warnings.push(`Environmental layer ${layer.id} has no fields.`);
    }
    if (layer.active) {
      warnings.push(`Active environmental layer ${layer.id} is a structural declaration, not runtime-rendered or runtime-executed behavior.`);
    }
  }

  for (const rule of samplingRules) {
    if (rule.extrapolationPolicy === "unknown") {
      warnings.push(`Sampling rule ${rule.id} has unknown extrapolation policy.`);
    }
    warnings.push(`Sampling rule ${rule.id} is a structural declaration, not executable interpolation or field sampling.`);
  }

  return warnings.slice(0, maxSpatialFieldWarnings);
}

function hasNotes(notes: readonly string[] | undefined): boolean {
  return Boolean(notes?.some((note) => note.trim().length > 0));
}

function hasProvenanceNote(notes: readonly string[] | undefined): boolean {
  return Boolean(notes?.some((note) => /provenance|source|measured|measurement/i.test(note)));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
