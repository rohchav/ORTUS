import { getArtifactFamily, getPrimitive } from "../registry/query";
import { validateModelSchemaDefinition } from "./validation";
import { maxModelSchemaWarnings, type ModelSchemaDefinition, type ModelSchemaSummary } from "./types";

export function summarizeModelSchema(schema: ModelSchemaDefinition): ModelSchemaSummary {
  const valid = validateModelSchemaDefinition(schema);
  return {
    id: valid.id,
    name: valid.name,
    entityTypeCount: valid.entityTypes.length,
    componentTypeCount: (valid.componentTypes ?? []).length,
    attributeTypeCount: (valid.attributeTypes ?? []).length,
    spaceCount: (valid.spaces ?? []).length,
    parameterCount: (valid.parameters ?? []).length,
    metricCount: (valid.metrics ?? []).length,
    ruleDeclarationCount: (valid.ruleDeclarations ?? []).length,
    artifactReferenceCount: (valid.artifactReferences ?? []).length,
    activeEntityTypeCount: valid.entityTypes.filter((entity) => entity.active).length,
    activeRuleDeclarationCount: (valid.ruleDeclarations ?? []).filter((rule) => rule.active).length,
    executableCount: 0,
    warnings: getModelSchemaWarnings(valid)
  };
}

export function getModelSchemaWarnings(schema: ModelSchemaDefinition): readonly string[] {
  const valid = validateModelSchemaDefinition(schema);
  const warnings: string[] = [
    "No model schema interpreter exists in V1; runnableNow is false for generic model schemas.",
    "No visual builder exists in V1; model schemas do not imply visual-builder support.",
    "No compiler exists in V1; model schemas are not compiled into templates or runtime behavior."
  ];

  const rules = valid.ruleDeclarations ?? [];
  if (rules.length > 0) {
    warnings.push("Rule declarations are structural descriptions only and are not executed.");
  } else {
    warnings.push("Schema has no rule declarations; it describes structure but no behavior semantics.");
  }

  if (hasAnyActiveDeclaration(valid)) {
    warnings.push("Active declarations are structurally active only; active does not mean runtime-executed.");
  }
  if ((valid.spaces ?? []).length === 0) {
    warnings.push("Schema has no spaces; it does not define where entities exist.");
  }
  if ((valid.parameters ?? []).length === 0) {
    warnings.push("Schema has no parameters; it has no parameter surface.");
  }
  if ((valid.metrics ?? []).length === 0) {
    warnings.push("Schema has no metrics; metrics are not computed from the schema.");
  }

  for (const entity of valid.entityTypes) {
    if (!entity.componentTypeIds?.length && !entity.attributeTypeIds?.length) {
      warnings.push(`Entity type ${entity.id} has no components or attributes and is underspecified.`);
    }
  }

  for (const component of valid.componentTypes ?? []) {
    if (!component.attributeTypeIds?.length) {
      warnings.push(`Component type ${component.id} has no attributes and is underspecified.`);
    }
  }

  for (const attribute of valid.attributeTypes ?? []) {
    if (attribute.valueKind === "custom") {
      warnings.push(`Attribute ${attribute.id} uses custom value semantics; custom values are not interpreted in V1.`);
    }
  }

  for (const space of valid.spaces ?? []) {
    if (space.networkDefinitionId || space.fieldLayerId || space.boundaryModelId || space.scaleModelId) {
      warnings.push(`Space ${space.id} references network/field/boundary/scale artifacts structurally only.`);
    }
  }

  for (const parameter of valid.parameters ?? []) {
    if (parameter.uncertaintyVariableId) {
      warnings.push(`Parameter ${parameter.id} references uncertainty; schema parameters are not automatically sampled.`);
    }
  }

  for (const metric of valid.metrics ?? []) {
    if (metric.metricKind === "emergenceIndicator" || metric.metricKind === "robustnessIndicator" || metric.metricKind === "controlIndicator") {
      warnings.push(`Metric ${metric.id} is a ${metric.metricKind}; it is not automatically computed or validated.`);
    }
  }

  for (const rule of rules) {
    if (rule.ruleKind === "agentBehavior" || rule.ruleKind === "movement" || rule.ruleKind === "interaction") {
      warnings.push(`Rule ${rule.id} is ${rule.ruleKind}; no runtime agent interpreter exists in V1.`);
    }
    if (rule.ruleKind === "stateTransition") {
      warnings.push(`Rule ${rule.id} is stateTransition; no runtime state-transition interpreter exists in V1.`);
    }
    if (rule.ruleKind === "resourceFlow") {
      warnings.push(`Rule ${rule.id} is resourceFlow; it does not execute stock/flow logic.`);
    }
    if (rule.ruleKind === "networkUpdate") {
      warnings.push(`Rule ${rule.id} is networkUpdate; it does not mutate networks.`);
    }
    if (rule.ruleKind === "eventEmission") {
      warnings.push(`Rule ${rule.id} is eventEmission; it does not emit runtime events.`);
    }
    if (rule.ruleKind === "feedbackAdjustment") {
      warnings.push(`Rule ${rule.id} is feedbackAdjustment; it does not run feedback loops.`);
    }
    if (rule.ruleKind === "observation") {
      warnings.push(`Rule ${rule.id} is observation; it does not perform measurement.`);
    }
    if (rule.ruleKind === "controlPolicy") {
      warnings.push(`Rule ${rule.id} is controlPolicy; it does not execute strategy/control.`);
    }
    if (rule.ruleKind === "aggregation" || rule.ruleKind === "disaggregation") {
      warnings.push(`Rule ${rule.id} is ${rule.ruleKind}; it does not execute multi-scale transitions.`);
    }
    if (rule.ruleKind === "socialLearning" || rule.ruleKind === "memoryUpdate" || rule.ruleKind === "beliefUpdate") {
      warnings.push(
        `Rule ${rule.id} is ${rule.ruleKind}; belief, memory, and social-learning rule declarations are structural placeholders and do not implement runtime cognition.`
      );
    }
  }

  for (const reference of valid.artifactReferences ?? []) {
    warnings.push(`Artifact reference ${reference.id} is structural only and does not make the schema runnable.`);
    if (reference.artifactType === "ortus.scenario" || reference.artifactType === "ortus.snapshot" || reference.artifactType.startsWith("ortus.template")) {
      warnings.push(`Artifact reference ${reference.id} points to a runtime artifact family; attachment does not make the schema executable.`);
    }
    if (reference.role === "validationTarget") {
      warnings.push(`Artifact reference ${reference.id} is a validationTarget; it does not validate anything in V1.`);
    }
    if (reference.role === "futureRuntimeDependency") {
      warnings.push(`Artifact reference ${reference.id} is a futureRuntimeDependency; that dependency is not implemented by this schema.`);
    }
    const artifact = getArtifactFamily(reference.artifactType);
    const primitive = reference.primitiveId ? getPrimitive(reference.primitiveId) : undefined;
    if (!artifact || artifact.implemented === false || primitive?.status === "reserved") {
      warnings.push(`Artifact reference ${reference.id} points to an external, unknown, or future-only capability.`);
    }
  }

  if (!valid.validationNotes?.length && claimsBroadApplicability(valid)) {
    warnings.push("Schema uses broad applicability wording without validation notes; V1 does not validate real-world applicability.");
  }
  if (mentionsUniversalModel(valid)) {
    warnings.push("Universal model wording is not supported; ModelSchemaDefinition is not a universal model builder.");
  }
  if (mentionsExternalFrameworkCompatibility(valid)) {
    warnings.push("NetLogo/Mesa/MASON compatibility wording is documentation only; external framework interop is not implemented.");
  }
  if (rules.some((rule) => rule.ruleKind === "socialLearning" || rule.ruleKind === "memoryUpdate" || rule.ruleKind === "beliefUpdate")) {
    warnings.push("No social/cognitive runtime exists in V1; Prompt 31C/31D remain future work.");
  }
  if (mentionsLlmAgents(valid)) {
    warnings.push("No LLM agent runtime exists in V1.");
  }
  if (mentionsFullHumanCognition(valid)) {
    warnings.push("No full-human-cognition support exists in V1.");
  }

  return Array.from(new Set(warnings)).slice(0, maxModelSchemaWarnings);
}

function hasAnyActiveDeclaration(schema: ModelSchemaDefinition): boolean {
  return [
    ...schema.entityTypes,
    ...(schema.componentTypes ?? []),
    ...(schema.attributeTypes ?? []),
    ...(schema.spaces ?? []),
    ...(schema.parameters ?? []),
    ...(schema.metrics ?? []),
    ...(schema.ruleDeclarations ?? []),
    ...(schema.artifactReferences ?? [])
  ].some((declaration) => declaration.active);
}

function claimsBroadApplicability(schema: ModelSchemaDefinition): boolean {
  return textFor(schema).match(/\bbroad applicability\b|\bgeneraliz|\breal-world\b|\breal world\b|\boperational\b|\bproduction\b|\bvalidated\b|\bpredict/i) !== null;
}

function mentionsUniversalModel(schema: ModelSchemaDefinition): boolean {
  return textFor(schema).match(/\buniversal model\b|\buniversal model builder\b|\bgeneral purpose model\b/i) !== null;
}

function mentionsExternalFrameworkCompatibility(schema: ModelSchemaDefinition): boolean {
  return textFor(schema).match(/\bnetlogo\b|\bmesa\b|\bmason\b|\bexternal framework\b|\binterop\b|\bcompatib/i) !== null;
}

function mentionsLlmAgents(schema: ModelSchemaDefinition): boolean {
  return textFor(schema).match(/\bllm\b|\blarge language model\b|\bembedding\b|\bmodel weights\b|\bprompt template\b/i) !== null;
}

function mentionsFullHumanCognition(schema: ModelSchemaDefinition): boolean {
  return textFor(schema).match(/\bfull human cognition\b|\bhuman-like mind\b|\bhuman mind\b|\bmind simulation\b|\bpsychological diagnosis\b/i) !== null;
}

function textFor(schema: ModelSchemaDefinition): string {
  return JSON.stringify({
    name: schema.name,
    description: schema.description,
    scope: schema.scope,
    entityTypes: schema.entityTypes,
    componentTypes: schema.componentTypes,
    attributeTypes: schema.attributeTypes,
    spaces: schema.spaces,
    parameters: schema.parameters,
    metrics: schema.metrics,
    ruleDeclarations: schema.ruleDeclarations,
    artifactReferences: schema.artifactReferences,
    assumptionNotes: schema.assumptionNotes,
    limitationNotes: schema.limitationNotes,
    validationNotes: schema.validationNotes,
    metadata: schema.metadata
  }).toLowerCase();
}
