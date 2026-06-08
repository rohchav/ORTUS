import { validateModelSchemaDefinition } from "./validation";
import type {
  AttributeTypeDeclaration,
  ComponentTypeDeclaration,
  EntityTypeDeclaration,
  MetricDeclaration,
  ModelArtifactReference,
  ModelEntityKind,
  ModelRuleKind,
  ModelSchemaDefinition,
  ModelSpaceKind,
  ParameterDeclaration,
  RuleDeclaration,
  SpaceDeclaration
} from "./types";

export function listEntityTypes(schema: ModelSchemaDefinition): readonly EntityTypeDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).entityTypes);
}

export function listActiveEntityTypes(schema: ModelSchemaDefinition): readonly EntityTypeDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).entityTypes.filter((entity) => entity.active));
}

export function getEntityType(schema: ModelSchemaDefinition, entityTypeId: string): EntityTypeDeclaration | undefined {
  const entity = validateModelSchemaDefinition(schema).entityTypes.find((candidate) => candidate.id === entityTypeId);
  return entity ? clone(entity) : undefined;
}

export function listEntityTypesByKind(schema: ModelSchemaDefinition, entityKind: ModelEntityKind): readonly EntityTypeDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).entityTypes.filter((entity) => entity.entityKind === entityKind));
}

export function listComponentTypes(schema: ModelSchemaDefinition): readonly ComponentTypeDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).componentTypes ?? []);
}

export function getComponentType(schema: ModelSchemaDefinition, componentTypeId: string): ComponentTypeDeclaration | undefined {
  const component = validateModelSchemaDefinition(schema).componentTypes?.find((candidate) => candidate.id === componentTypeId);
  return component ? clone(component) : undefined;
}

export function getComponentsForEntityType(schema: ModelSchemaDefinition, entityTypeId: string): readonly ComponentTypeDeclaration[] {
  const valid = validateModelSchemaDefinition(schema);
  const entity = valid.entityTypes.find((candidate) => candidate.id === entityTypeId);
  const ids = new Set(entity?.componentTypeIds ?? []);
  return clone((valid.componentTypes ?? []).filter((component) => ids.has(component.id)));
}

export function listAttributeTypes(schema: ModelSchemaDefinition): readonly AttributeTypeDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).attributeTypes ?? []);
}

export function getAttributeType(schema: ModelSchemaDefinition, attributeTypeId: string): AttributeTypeDeclaration | undefined {
  const attribute = validateModelSchemaDefinition(schema).attributeTypes?.find((candidate) => candidate.id === attributeTypeId);
  return attribute ? clone(attribute) : undefined;
}

export function getAttributesForEntityType(schema: ModelSchemaDefinition, entityTypeId: string): readonly AttributeTypeDeclaration[] {
  const valid = validateModelSchemaDefinition(schema);
  const entity = valid.entityTypes.find((candidate) => candidate.id === entityTypeId);
  const ids = new Set(entity?.attributeTypeIds ?? []);
  for (const component of getComponentsForEntityType(valid, entityTypeId)) {
    for (const attributeId of component.attributeTypeIds ?? []) {
      ids.add(attributeId);
    }
  }
  return clone((valid.attributeTypes ?? []).filter((attribute) => ids.has(attribute.id)));
}

export function getAttributesForComponentType(schema: ModelSchemaDefinition, componentTypeId: string): readonly AttributeTypeDeclaration[] {
  const valid = validateModelSchemaDefinition(schema);
  const component = valid.componentTypes?.find((candidate) => candidate.id === componentTypeId);
  const ids = new Set(component?.attributeTypeIds ?? []);
  return clone((valid.attributeTypes ?? []).filter((attribute) => ids.has(attribute.id)));
}

export function listSpaces(schema: ModelSchemaDefinition): readonly SpaceDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).spaces ?? []);
}

export function getSpace(schema: ModelSchemaDefinition, spaceId: string): SpaceDeclaration | undefined {
  const space = validateModelSchemaDefinition(schema).spaces?.find((candidate) => candidate.id === spaceId);
  return space ? clone(space) : undefined;
}

export function listSpacesByKind(schema: ModelSchemaDefinition, spaceKind: ModelSpaceKind): readonly SpaceDeclaration[] {
  return clone((validateModelSchemaDefinition(schema).spaces ?? []).filter((space) => space.spaceKind === spaceKind));
}

export function listParameters(schema: ModelSchemaDefinition): readonly ParameterDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).parameters ?? []);
}

export function getParameter(schema: ModelSchemaDefinition, parameterId: string): ParameterDeclaration | undefined {
  const parameter = validateModelSchemaDefinition(schema).parameters?.find((candidate) => candidate.id === parameterId);
  return parameter ? clone(parameter) : undefined;
}

export function listMetrics(schema: ModelSchemaDefinition): readonly MetricDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).metrics ?? []);
}

export function getMetric(schema: ModelSchemaDefinition, metricId: string): MetricDeclaration | undefined {
  const metric = validateModelSchemaDefinition(schema).metrics?.find((candidate) => candidate.id === metricId);
  return metric ? clone(metric) : undefined;
}

export function listRuleDeclarations(schema: ModelSchemaDefinition): readonly RuleDeclaration[] {
  return clone(validateModelSchemaDefinition(schema).ruleDeclarations ?? []);
}

export function listActiveRuleDeclarations(schema: ModelSchemaDefinition): readonly RuleDeclaration[] {
  return clone((validateModelSchemaDefinition(schema).ruleDeclarations ?? []).filter((rule) => rule.active));
}

export function getRuleDeclaration(schema: ModelSchemaDefinition, ruleId: string): RuleDeclaration | undefined {
  const rule = validateModelSchemaDefinition(schema).ruleDeclarations?.find((candidate) => candidate.id === ruleId);
  return rule ? clone(rule) : undefined;
}

export function listRuleDeclarationsByKind(schema: ModelSchemaDefinition, ruleKind: ModelRuleKind): readonly RuleDeclaration[] {
  return clone((validateModelSchemaDefinition(schema).ruleDeclarations ?? []).filter((rule) => rule.ruleKind === ruleKind));
}

export function getRulesForEntityType(schema: ModelSchemaDefinition, entityTypeId: string): readonly RuleDeclaration[] {
  return clone(
    (validateModelSchemaDefinition(schema).ruleDeclarations ?? []).filter(
      (rule) => rule.sourceEntityTypeIds?.includes(entityTypeId) || rule.targetEntityTypeIds?.includes(entityTypeId)
    )
  );
}

export function listArtifactReferences(schema: ModelSchemaDefinition): readonly ModelArtifactReference[] {
  return clone(validateModelSchemaDefinition(schema).artifactReferences ?? []);
}

export function getArtifactReference(schema: ModelSchemaDefinition, referenceId: string): ModelArtifactReference | undefined {
  const reference = validateModelSchemaDefinition(schema).artifactReferences?.find((candidate) => candidate.id === referenceId);
  return reference ? clone(reference) : undefined;
}

export function listArtifactReferencesByType(schema: ModelSchemaDefinition, artifactType: string): readonly ModelArtifactReference[] {
  return clone((validateModelSchemaDefinition(schema).artifactReferences ?? []).filter((reference) => reference.artifactType === artifactType));
}

export function listArtifactReferencesByRole(schema: ModelSchemaDefinition, role: ModelArtifactReference["role"]): readonly ModelArtifactReference[] {
  return clone((validateModelSchemaDefinition(schema).artifactReferences ?? []).filter((reference) => reference.role === role));
}

export function schemaHasRuleKind(schema: ModelSchemaDefinition, ruleKind: ModelRuleKind): boolean {
  return (validateModelSchemaDefinition(schema).ruleDeclarations ?? []).some((rule) => rule.ruleKind === ruleKind);
}

export function schemaHasArtifactType(schema: ModelSchemaDefinition, artifactType: string): boolean {
  return (validateModelSchemaDefinition(schema).artifactReferences ?? []).some((reference) => reference.artifactType === artifactType);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
