import type { MetricDefinition, ParameterDefinition, SimulationTemplate, TemplateSpaceType } from "../kernel/types";
import type {
  AttributeTypeDeclaration,
  ComponentTypeDeclaration,
  EntityTypeDeclaration,
  MetricDeclaration,
  ModelArtifactReference,
  ModelEntityKind,
  ModelMetricKind,
  ModelParameterValueKind,
  ModelRuleKind,
  ModelSchemaDefinition,
  ModelSpaceKind,
  ParameterDeclaration,
  RuleDeclaration,
  SpaceDeclaration
} from "../modelSchema/types";
import { validateModelSchemaDefinition } from "../modelSchema/validation";
import { getArtifactFamily, getPrimitive, getTemplateCapability } from "../registry/query";
import type { PrimitiveId } from "../registry/types";
import { productionTemplates } from "../templates/registry";
import { getSchemaTemplateCompatibilityWarnings, requiredSchemaTemplateCompatibilityWarnings } from "./summary";
import {
  schemaTemplateCompatibilityReportArtifactType,
  templateMappingProfileArtifactType,
  type CompatibilityFit,
  type LossyMappingKind,
  type LossyMappingNote,
  type LossyMappingSeverity,
  type MappingConfidence,
  type MappingStatus,
  type SchemaConceptMapping,
  type SchemaElementKind,
  type SchemaTemplateCompatibilityReport,
  type TemplateCompatibilityResult,
  type TemplateConceptKind,
  type TemplateMappingProfile,
  type UnsupportedReason,
  type UnsupportedSchemaConcept
} from "./types";
import { validateSchemaTemplateCompatibilityReport, validateTemplateMappingProfile } from "./validation";

const compatibilityPrimitiveId = "schemaTemplateCompatibility" as PrimitiveId;

const profilePrimitiveIds = [
  "scenarios",
  "snapshots",
  "behaviorModes",
  "agentComposition",
  "uncertainty",
  "assumptions",
  "modelSchema",
  "knowledgeMemorySocialLearning",
  "visualBuilderWorkspace",
  compatibilityPrimitiveId
] as const;

const universalRuntimeRequirements = [
  "ModelSchemaDefinition runtime interpreter",
  "template-owned schema ingestion",
  "ruleDescription execution",
  "safe rule primitive runtime",
  "scenario generation",
  "RunConfig generation",
  "snapshot generation",
  "template generation",
  "engine creation",
  "validation/calibration evidence"
] as const;

export function createTemplateMappingProfileFromTemplate(template: SimulationTemplate): TemplateMappingProfile {
  const supportedArtifactTypes = [
    ...(template.capabilities?.supportsScenarioBuilder ? ["ortus.scenario"] : []),
    ...(template.capabilities?.supportsSnapshotExport ? ["ortus.snapshot"] : []),
    ...(template.assumptionProfile ? ["ortus.assumptionProfile"] : [])
  ];

  const profile: TemplateMappingProfile = {
    schemaVersion: "1",
    artifactType: templateMappingProfileArtifactType,
    id: `template-mapping-profile:${template.id}`,
    name: `${template.name} Template Mapping Profile`,
    version: template.version,
    templateId: template.id,
    templateName: template.name,
    templateVersion: template.version,
    description: `Structural mapping profile derived from static template metadata for ${template.name}.`,
    supportedEntityKinds: unique((template.entityTypeDefinitions ?? []).map((entity) => inferEntityKind(entity.representedAs, entity.typeId, entity.label))),
    supportedEntityTypeIds: unique((template.entityTypeDefinitions ?? []).map((entity) => entity.typeId)),
    supportedComponentTypeIds: unique((template.entityTypeDefinitions ?? []).flatMap((entity) => entity.components ?? [])),
    supportedSpaceKinds: unique(spaceKindForTemplateSpace(template.spaceDefinition?.type)),
    supportedParameterKinds: unique(template.parameterDefinitions.map((parameter) => parameterValueKindForTemplateParameter(parameter))),
    supportedParameterValueKinds: unique(template.parameterDefinitions.map((parameter) => parameterValueKindForTemplateParameter(parameter))),
    supportedParameterIds: unique(template.parameterDefinitions.map((parameter) => parameter.key)),
    supportedMetricKinds: unique((template.metricDefinitions ?? []).map((metric) => metricKindForTemplateMetric(metric))),
    supportedMetricIds: unique((template.metricDefinitions ?? []).map((metric) => metric.key)),
    supportedRuleKinds: supportedRuleKindsForTemplate(template),
    supportedBehaviorModeIds: unique((template.behaviorModes ?? []).map((mode) => mode.id)),
    supportedArtifactTypes: unique(supportedArtifactTypes),
    unsupportedConcepts: [
      "ModelSchemaDefinition runtime execution",
      "schema-to-template conversion",
      "scenario generation",
      "RunConfig generation",
      "snapshot generation",
      "template generation",
      "visual builder runtime",
      "external framework interop",
      "social-learning runtime",
      "validation/calibration"
    ],
    capabilityNotes: [
      "Supported fields describe static template metadata only.",
      "Template runtime capability remains governed by the primitive registry and template capability map."
    ],
    limitationNotes: [
      "This profile is not a runtime adapter.",
      "This profile does not mutate or generate template behavior."
    ],
    primitiveCapabilities: profilePrimitiveIds.flatMap((primitiveId) => {
      const capability = getTemplateCapability(template.id, primitiveId);
      return capability
        ? [
            {
              primitiveId,
              supportLevel: capability.supportLevel,
              runtimeActive: capability.runtimeActive,
              serviceAvailable: capability.serviceAvailable,
              notes: capability.notes
            }
          ]
        : [];
    }),
    active: true,
    executable: false,
    runtimeActive: false,
    conversionSupported: false,
    generationSupported: false,
    notes: [
      "Profile is derived from static template metadata only.",
      "Profile support does not mean ModelSchemaDefinition runtime support.",
      "Template runtime behavior remains hand-built and is not generated from this profile."
    ],
    metadata: {
      source: "production-template-registry",
      structuralOnly: true
    }
  };

  return validateTemplateMappingProfile(profile);
}

export function createDefaultTemplateMappingProfiles(): readonly TemplateMappingProfile[] {
  return productionTemplates.map((template) => createTemplateMappingProfileFromTemplate(template));
}

export function createCompatibilityReport(
  schema: ModelSchemaDefinition,
  profiles: readonly TemplateMappingProfile[]
): SchemaTemplateCompatibilityReport {
  const validSchema = validateModelSchemaDefinition(schema);
  const validProfiles = profiles.map((profile) => validateTemplateMappingProfile(profile));
  const templateResults = validProfiles.map((profile) => createTemplateCompatibilityResult(validSchema, profile));
  const best = [...templateResults].sort((a, b) => b.score - a.score || fitRank(b.fit) - fitRank(a.fit) || a.templateId.localeCompare(b.templateId))[0];
  const reportBase: SchemaTemplateCompatibilityReport = {
    schemaVersion: "1",
    artifactType: schemaTemplateCompatibilityReportArtifactType,
    id: `schema-template-compatibility:${validSchema.id}`,
    name: `${validSchema.name} Template Compatibility Report`,
    version: "1.0.0",
    schemaId: validSchema.id,
    modelSchemaId: validSchema.id,
    modelSchemaName: validSchema.name,
    modelSchemaVersion: validSchema.version,
    generatedAtDescription: "Deterministic structural analysis; no execution timestamp or runtime state is embedded.",
    templateResults,
    ...(best ? { bestTemplateId: best.templateId } : {}),
    overallFit: best?.fit ?? "none",
    requiredRuntimeCapabilities: [...universalRuntimeRequirements],
    warnings: [
      ...requiredSchemaTemplateCompatibilityWarnings,
      "Report is structural only and cannot be executed.",
      "Compatibility mapping does not mutate templates, schemas, scenarios, snapshots, RunConfigs, or engines."
    ],
    runnableNow: false,
    schemaExecutionAvailable: false,
    conversionAvailable: false,
    scenarioGenerationAvailable: false,
    runConfigGenerationAvailable: false,
    snapshotGenerationAvailable: false,
    templateGenerationAvailable: false,
    engineCreationAvailable: false,
    generationAvailable: false,
    validationAvailable: false,
    calibrationAvailable: false,
    active: true,
    executable: false,
    errors: [],
    assumptionNotes: ["Fit reports compare declared structure; they are not evidence that model assumptions are valid."],
    limitationNotes: [
      "Fit does not mean runnable.",
      "Compatibility mapping does not generate scenarios, RunConfigs, snapshots, templates, or engines."
    ],
    metadata: {
      structuralOnly: true,
      profileCount: validProfiles.length
    }
  };
  const reportWithWarnings = {
    ...reportBase,
    warnings: getSchemaTemplateCompatibilityWarnings(reportBase)
  };
  return validateSchemaTemplateCompatibilityReport(reportWithWarnings);
}

export function createCompatibilityReportForProductionTemplates(schema: ModelSchemaDefinition): SchemaTemplateCompatibilityReport {
  return createCompatibilityReport(schema, createDefaultTemplateMappingProfiles());
}

function createTemplateCompatibilityResult(schema: ModelSchemaDefinition, profile: TemplateMappingProfile): TemplateCompatibilityResult {
  const mappedConcepts: SchemaConceptMapping[] = [];
  const unsupportedConcepts: UnsupportedSchemaConcept[] = [];
  const lossyMappings: LossyMappingNote[] = [];

  const addMapped = (
    element: ElementRef,
    templateConceptKind: TemplateConceptKind,
    templateConceptId: string | undefined,
    status: MappingStatus,
    confidence: MappingConfidence,
    notes: readonly string[] = []
  ) => {
    mappedConcepts.push({
      id: mappingId(profile.templateId, element.kind, element.id),
      schemaElementId: element.id,
      schemaElementLabel: element.label,
      schemaElementKind: element.kind,
      schemaElementType: element.type,
      ...(templateConceptId ? { templateConceptId } : {}),
      ...(templateConceptId ? { templateConceptLabel: templateConceptId } : {}),
      templateConceptKind,
      status,
      confidence,
      active: element.active,
      executable: false,
      notes
    });
  };

  const addUnsupported = (
    element: ElementRef,
    reason: UnsupportedReason,
    notes: readonly string[],
    primitiveId?: PrimitiveId,
    artifactType?: string
  ) => {
    unsupportedConcepts.push({
      id: unsupportedId(profile.templateId, element.kind, element.id),
      schemaElementId: element.id,
      schemaElementLabel: element.label,
      schemaElementKind: element.kind,
      schemaElementType: element.type,
      reason,
      ...(primitiveId ? { primitiveId } : {}),
      ...(artifactType ? { artifactType } : {}),
      active: element.active,
      executable: false,
      notes
    });
  };

  const addLoss = (
    element: ElementRef,
    lossKind: LossyMappingKind,
    severity: LossyMappingSeverity,
    message: string,
    notes: readonly string[] = []
  ) => {
    lossyMappings.push({
      id: lossId(profile.templateId, element.kind, element.id, lossKind),
      schemaElementId: element.id,
      schemaElementKind: element.kind,
      lossKind,
      severity,
      message,
      active: element.active,
      executable: false,
      notes
    });
  };

  for (const entity of schema.entityTypes) {
    const element = entityRef(entity);
    if (profile.supportedEntityKinds.includes(entity.entityKind)) {
      addMapped(element, entity.entityKind === "cell" ? "cell" : "agent", matchByIdOrLabel(entity.id, entity.label, profile.supportedEntityTypeIds), "mapped", "high", [
        "Entity kind matches template metadata, not a generated runtime class."
      ]);
    } else if (entity.entityKind === "aggregate" || entity.entityKind === "environment" || entity.entityKind === "custom") {
      addMapped(element, "custom", undefined, "lossy", "low", ["Template has no direct entity-kind equivalent; only broad structure can be compared."]);
      addLoss(element, "semanticLoss", "warning", `Schema entity ${entity.id} has no exact template entity equivalent.`);
    } else {
      addUnsupported(element, "noTemplateCapability", [`Template profile does not support schema entity kind ${entity.entityKind}.`]);
    }
  }

  for (const component of schema.componentTypes ?? []) {
    const element = componentRef(component);
    const matchingComponent = matchByIdOrLabel(component.id, component.label, profile.supportedComponentTypeIds);
    if (matchingComponent) {
      addMapped(element, "custom", matchingComponent, "mapped", "high", ["Component id appears in template entity metadata."]);
    } else if (component.componentKind === "memory") {
      addUnsupported(element, "runtimeUnsupported", ["No current production template implements bounded memory runtime from schemas."], "knowledgeMemorySocialLearning");
    } else if (component.componentKind === "belief") {
      addMapped(element, "custom", undefined, "lossy", "low", [
        "Template state may expose opinion-like values, but schema belief components are not human cognition or social-learning runtime."
      ]);
      addLoss(element, "socialCognitiveLoss", "critical", `Schema belief component ${component.id} is only structurally comparable to template state.`);
    } else if (["state", "position", "velocity", "identity", "health", "group"].includes(component.componentKind)) {
      addMapped(element, "custom", undefined, "partial", "medium", ["Component kind is broadly comparable to template metadata only."]);
      addLoss(element, "semanticLoss", "info", `Component ${component.id} is matched by broad kind, not exact runtime schema ingestion.`);
    } else {
      addUnsupported(element, "ambiguous", [`Template profile has no explicit component support for ${component.componentKind}.`]);
    }
  }

  for (const attribute of schema.attributeTypes ?? []) {
    const element = attributeRef(attribute);
    if (attribute.valueKind === "custom" || attribute.valueKind === "distributionReference" || attribute.valueKind === "quantityReference") {
      addUnsupported(element, attribute.valueKind === "custom" ? "ambiguous" : "serviceOnlyPrimitive", [
        `Attribute value kind ${attribute.valueKind} is not directly ingested by production templates.`
      ]);
    } else {
      addMapped(element, "custom", undefined, "partial", "low", ["Attribute value kind can be compared structurally, but template state is not generated from attributes."]);
      addLoss(element, attribute.valueKind.startsWith("vector") ? "semanticLoss" : "unitLoss", "info", `Attribute ${attribute.id} loses runtime/unit semantics in static mapping.`);
    }
  }

  for (const space of schema.spaces ?? []) {
    const element = spaceRef(space);
    if (profile.supportedSpaceKinds.includes(space.spaceKind)) {
      addMapped(element, "space", space.id, "mapped", "high", ["Space kind matches static template space metadata."]);
    } else if (space.spaceKind === "network") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Network services are globally available, but current templates do not use network topology at runtime."], "networks");
    } else if (space.spaceKind === "field") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Spatial fields are service-only structural artifacts; current templates do not runtime-support SpatialFieldModel."], "spatialFields");
    } else if (space.spaceKind === "multiscale") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Multi-scale structure is service-only; current templates do not execute explicit scale levels or cross-scale rules."], "multiScale");
    } else {
      addUnsupported(element, "noTemplateCapability", [`Template profile does not support schema space kind ${space.spaceKind}.`]);
    }
  }

  for (const parameter of schema.parameters ?? []) {
    const element = parameterRef(parameter);
    const matchingParameter = matchByIdOrLabel(parameter.id, parameter.label, profile.supportedParameterIds);
    if (matchingParameter) {
      addMapped(element, "parameter", matchingParameter, "mapped", "high", ["Parameter id/label matches template parameter metadata."]);
    } else if (profile.supportedParameterValueKinds.includes(parameter.valueKind)) {
      addMapped(element, "parameter", undefined, "partial", "medium", ["Parameter value kind matches, but no exact template parameter id was found."]);
      addLoss(element, "semanticLoss", "info", `Schema parameter ${parameter.id} is value-kind compatible but not exact.`);
    } else {
      addUnsupported(element, parameter.valueKind === "distributionReference" ? "serviceOnlyPrimitive" : "noTemplateCapability", [
        `Template profile does not support schema parameter value kind ${parameter.valueKind}.`
      ]);
    }
  }

  for (const metric of schema.metrics ?? []) {
    const element = metricRef(metric);
    const matchingMetric = matchByIdOrLabel(metric.id, metric.label, profile.supportedMetricIds);
    if (matchingMetric) {
      addMapped(element, "metric", matchingMetric, "mapped", "high", ["Metric id/label matches template metric metadata."]);
    } else if (profile.supportedMetricKinds.includes(metric.metricKind)) {
      addMapped(element, "metric", undefined, "partial", "medium", ["Metric kind matches, but metrics are not computed from schemas."]);
      addLoss(element, "measurementLoss", "warning", `Schema metric ${metric.id} is structurally comparable but not runtime-computed from the schema.`);
    } else if (metric.metricKind === "networkMetric") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Network metrics are service-level structural summaries, not current template runtime support."], "networks");
    } else if (metric.metricKind === "resourceMetric") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Resource metrics are service-level structural summaries, not current template runtime support."], "resources");
    } else if (metric.metricKind === "fieldMetric") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Field metrics are service-level/future structural summaries, not current template runtime support."], "spatialFields");
    } else if (metric.metricKind === "emergenceIndicator") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Emergence descriptors do not execute runtime detection or prove emergence."], "emergenceDetection");
    } else if (metric.metricKind === "robustnessIndicator") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Robustness/resilience descriptors do not execute stress testing or prove robustness."], "robustnessResilience");
    } else if (metric.metricKind === "controlIndicator") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Control/strategy descriptors do not execute policies or validate strategy effectiveness."], "interventionStrategy");
    } else {
      addUnsupported(element, "ambiguous", [`Template profile does not support schema metric kind ${metric.metricKind}.`]);
    }
  }

  for (const rule of schema.ruleDeclarations ?? []) {
    const element = ruleRef(rule);
    if (rule.ruleKind === "socialLearning" || rule.ruleKind === "memoryUpdate" || rule.ruleKind === "beliefUpdate") {
      addUnsupported(element, "runtimeUnsupported", [
        "Social-learning, memory, and belief rule declarations are structural only and do not implement human cognition or runtime learning."
      ], "knowledgeMemorySocialLearning");
      addLoss(element, "socialCognitiveLoss", "critical", `Rule ${rule.id} cannot be mapped to social/cognitive runtime because no such runtime exists.`);
    } else if (isServiceOnlyRule(rule.ruleKind)) {
      const primitiveId = primitiveForServiceOnlyRule(rule.ruleKind);
      addUnsupported(element, primitiveId ? "serviceOnlyPrimitive" : "runtimeUnsupported", [serviceOnlyRuleNote(rule.ruleKind)], primitiveId);
    } else if (profile.supportedRuleKinds.includes(rule.ruleKind)) {
      addMapped(element, "behaviorMode", profile.supportedBehaviorModeIds[0], "lossy", "low", [
        "Rule kind resembles template behavior metadata, but ruleDescription is not parsed, compiled, or executed."
      ]);
      addLoss(element, "behaviorLoss", "critical", `Rule ${rule.id} is not executable; matching only records broad behavioral resemblance.`);
    } else {
      addUnsupported(element, "runtimeUnsupported", [`Template profile does not support schema rule kind ${rule.ruleKind}; no schema interpreter exists.`]);
    }
  }

  for (const reference of schema.artifactReferences ?? []) {
    const element = artifactRef(reference);
    const artifact = getArtifactFamily(reference.artifactType);
    const primitive = reference.primitiveId ? getPrimitive(reference.primitiveId) : artifact ? getPrimitive(artifact.primitiveId) : undefined;
    const primitiveId = reference.primitiveId ?? artifact?.primitiveId;
    if (reference.artifactType === "ortus.knowledgeMemorySocialLearningModel") {
      addUnsupported(
        { ...element, kind: "socialLearningDescriptor" },
        "runtimeUnsupported",
        ["Social-learning artifact references are structural only and do not implement cognition or runtime learning."],
        "knowledgeMemorySocialLearning",
        reference.artifactType
      );
    } else if (!artifact || artifact.implemented === false || primitive?.status === "reserved") {
      addUnsupported(element, "futurePrimitive", ["Referenced artifact family is unknown, unimplemented, external, or reserved future work."], primitiveId, reference.artifactType);
    } else if (primitive?.status === "serviceOnly" || primitive?.status === "metadataOnly") {
      addUnsupported(element, "serviceOnlyPrimitive", ["Referenced artifact family is service/metadata-only and does not imply template runtime support."], primitiveId, reference.artifactType);
    } else if (profile.supportedArtifactTypes.includes(reference.artifactType)) {
      addMapped(element, "custom", reference.artifactType, "partial", "medium", [
        "Artifact family is recognized structurally, but compatibility mapping does not replay or generate artifacts."
      ]);
      addLoss(element, "runtimeLoss", "warning", `Artifact reference ${reference.id} is not executed, replayed, generated, or converted.`);
    } else {
      addUnsupported(element, "noTemplateCapability", [`Template profile does not support artifact family ${reference.artifactType}.`], primitiveId, reference.artifactType);
    }
  }

  const score = compatibilityScore(mappedConcepts, unsupportedConcepts);
  const fit = compatibilityFit(score, mappedConcepts, unsupportedConcepts, lossyMappings, schema.scope?.templateId === profile.templateId);
  const resultBase: TemplateCompatibilityResult = {
    id: `template-compatibility:${profile.templateId}`,
    templateId: profile.templateId,
    templateName: profile.templateName ?? profile.name,
    templateVersion: profile.templateVersion ?? profile.version,
    fit,
    score,
    mappedConcepts,
    unsupportedConcepts,
    lossyMappings,
    requiredRuntimeCapabilities: [...universalRuntimeRequirements],
    missingTemplateCapabilities: missingCapabilitiesForResult(profile, unsupportedConcepts, lossyMappings),
    warnings: resultWarnings(profile, fit, unsupportedConcepts, lossyMappings),
    runnableNow: false,
    schemaExecutionSupported: false,
    conversionSupported: false,
    generationSupported: false,
    templateRuntimeSupportClaimed: false,
    active: true,
    executable: false,
    metadata: {
      structuralOnly: true,
      exactTemplateScopeMatch: Boolean(schema.scope?.templateId === profile.templateId)
    }
  };
  return resultBase;
}

interface ElementRef {
  id: string;
  label?: string;
  kind: SchemaElementKind;
  type?: string;
  active: boolean;
}

function entityRef(entity: EntityTypeDeclaration): ElementRef {
  return { id: entity.id, label: entity.label, kind: "entityType", type: entity.entityKind, active: entity.active };
}

function componentRef(component: ComponentTypeDeclaration): ElementRef {
  return { id: component.id, label: component.label, kind: "componentType", type: component.componentKind, active: component.active };
}

function attributeRef(attribute: AttributeTypeDeclaration): ElementRef {
  return { id: attribute.id, label: attribute.label, kind: "attributeType", type: attribute.valueKind, active: attribute.active };
}

function spaceRef(space: SpaceDeclaration): ElementRef {
  return { id: space.id, label: space.label, kind: "space", type: space.spaceKind, active: space.active };
}

function parameterRef(parameter: ParameterDeclaration): ElementRef {
  return { id: parameter.id, label: parameter.label, kind: "parameter", type: parameter.valueKind, active: parameter.active };
}

function metricRef(metric: MetricDeclaration): ElementRef {
  return { id: metric.id, label: metric.label, kind: "metric", type: metric.metricKind, active: metric.active };
}

function ruleRef(rule: RuleDeclaration): ElementRef {
  return { id: rule.id, label: rule.label, kind: "ruleDeclaration", type: rule.ruleKind, active: rule.active };
}

function artifactRef(reference: ModelArtifactReference): ElementRef {
  const kind = reference.artifactType === "ortus.modelSchema" ? "modelReference" : "artifactReference";
  return { id: reference.id, label: reference.label, kind, type: reference.artifactType, active: reference.active };
}

function inferEntityKind(representedAs: string | undefined, typeId: string, label: string): ModelEntityKind {
  const text = `${typeId} ${label}`.toLowerCase();
  if (representedAs === "cell" || representedAs === "state" || text.includes("cell")) {
    return "cell";
  }
  if (text.includes("edge")) {
    return "edge";
  }
  if (text.includes("node")) {
    return "node";
  }
  return "agent";
}

function spaceKindForTemplateSpace(spaceType: TemplateSpaceType | undefined): readonly ModelSpaceKind[] {
  switch (spaceType) {
    case "continuous2d":
      return ["continuous2d"];
    case "grid2d":
      return ["grid2d"];
    case "network":
      return ["network"];
    case "hybrid":
      return ["abstract", "custom"];
    default:
      return [];
  }
}

function parameterValueKindForTemplateParameter(parameter: ParameterDefinition): ModelParameterValueKind {
  switch (parameter.type) {
    case "number":
      return "number";
    case "integer":
      return "integer";
    case "boolean":
      return "boolean";
    case "select":
      return "category";
  }
}

function metricKindForTemplateMetric(metric: MetricDefinition): ModelMetricKind {
  const text = `${metric.key} ${metric.label} ${metric.description}`.toLowerCase();
  if (metric.valueType === "integer" || /\bcount\b|\btotal\b|\bnumber\b|\balive\b|\bempty\b|\bfuel\b|\bburning\b|\bburned\b|\bprey\b|\bpredator\b/.test(text)) {
    return "count";
  }
  if (metric.displayFormat === "percent" || /\bfraction\b|\bpercent\b|\bdensity\b|\bratio\b|\bshare\b|\bproportion\b/.test(text)) {
    return "fraction";
  }
  if (/\bmean\b|\baverage\b|\bavg\b/.test(text)) {
    return "mean";
  }
  if (/\brate\b|\bper tick\b/.test(text)) {
    return "rate";
  }
  if (/\bsum\b|\btotal\b/.test(text)) {
    return "sum";
  }
  return "custom";
}

function supportedRuleKindsForTemplate(template: SimulationTemplate): readonly ModelRuleKind[] {
  if (template.id === "forest-fire") {
    return ["stateTransition", "interaction"];
  }
  if (template.id === "schelling-segregation") {
    return ["agentBehavior", "movement", "interaction", "stateTransition"];
  }
  if (template.id === "flocking-boids") {
    return ["agentBehavior", "movement", "interaction"];
  }
  if (template.spaceDefinition?.type === "continuous2d") {
    return ["agentBehavior", "movement", "interaction", "stateTransition"];
  }
  return ["agentBehavior", "interaction", "stateTransition"];
}

function isServiceOnlyRule(ruleKind: ModelRuleKind): boolean {
  return [
    "networkUpdate",
    "resourceFlow",
    "eventEmission",
    "feedbackAdjustment",
    "observation",
    "controlPolicy",
    "aggregation",
    "disaggregation"
  ].includes(ruleKind);
}

function primitiveForServiceOnlyRule(ruleKind: ModelRuleKind): PrimitiveId | undefined {
  switch (ruleKind) {
    case "networkUpdate":
      return "networks";
    case "resourceFlow":
      return "resources";
    case "eventEmission":
    case "feedbackAdjustment":
      return "feedbackEvents";
    case "observation":
      return "observability";
    case "controlPolicy":
      return "interventionStrategy";
    case "aggregation":
    case "disaggregation":
      return "multiScale";
    default:
      return undefined;
  }
}

function serviceOnlyRuleNote(ruleKind: ModelRuleKind): string {
  switch (ruleKind) {
    case "networkUpdate":
      return "Network update rules are structural; current templates do not mutate networks from schemas.";
    case "resourceFlow":
      return "Resource-flow rules are structural; current templates do not execute schema stock/flow logic.";
    case "eventEmission":
      return "Event-emission rules are structural; current templates do not emit runtime events from schemas.";
    case "feedbackAdjustment":
      return "Feedback-adjustment rules are structural; current templates do not run schema feedback loops.";
    case "observation":
      return "Observation rules are structural; current templates do not execute measurement schedules or processes.";
    case "controlPolicy":
      return "Control-policy rules are structural; current templates do not execute strategies or policies.";
    case "aggregation":
    case "disaggregation":
      return "Aggregation/disaggregation rules are structural; current templates do not execute multi-scale transitions.";
    default:
      return "Rule kind is not runtime-supported by schema compatibility mapping.";
  }
}

function matchByIdOrLabel(id: string, label: string | undefined, candidates: readonly string[]): string | undefined {
  const normalizedId = normalizeKey(id);
  const normalizedLabel = label ? normalizeKey(label) : "";
  return candidates.find((candidate) => normalizeKey(candidate) === normalizedId || (normalizedLabel.length > 0 && normalizeKey(candidate) === normalizedLabel));
}

function compatibilityScore(mappedConcepts: readonly SchemaConceptMapping[], unsupportedConcepts: readonly UnsupportedSchemaConcept[]): number {
  const total = mappedConcepts.length + unsupportedConcepts.length;
  if (total === 0) {
    return 0;
  }
  const mappedScore = mappedConcepts.reduce((sum, mapping) => {
    switch (mapping.status) {
      case "mapped":
        return sum + 1;
      case "partial":
        return sum + 0.55;
      case "lossy":
        return sum + 0.35;
      case "futureOnly":
      case "unsupported":
        return sum;
    }
  }, 0);
  return Math.max(0, Math.min(1, Number((mappedScore / total).toFixed(3))));
}

function compatibilityFit(
  score: number,
  mappedConcepts: readonly SchemaConceptMapping[],
  unsupportedConcepts: readonly UnsupportedSchemaConcept[],
  lossyMappings: readonly LossyMappingNote[],
  exactTemplateScopeMatch: boolean
): CompatibilityFit {
  if (mappedConcepts.length + unsupportedConcepts.length === 0 || score === 0) {
    return "none";
  }
  if (exactTemplateScopeMatch && unsupportedConcepts.length === 0 && lossyMappings.length === 0 && mappedConcepts.every((mapping) => mapping.status === "mapped")) {
    return "templateExact";
  }
  if (score >= 0.75 && unsupportedConcepts.length <= 2) {
    return "strong";
  }
  if (score >= 0.4) {
    return "partial";
  }
  return "weak";
}

function missingCapabilitiesForResult(
  profile: TemplateMappingProfile,
  unsupportedConcepts: readonly UnsupportedSchemaConcept[],
  lossyMappings: readonly LossyMappingNote[]
): readonly string[] {
  return unique([
    ...universalRuntimeRequirements,
    "template runtime use of ModelSchemaDefinition",
    "proof that this template executes mapped schema rules",
    ...(unsupportedConcepts.length > 0 ? ["runtime support for unsupported schema concepts"] : []),
    ...(lossyMappings.length > 0 ? ["lossless schema-to-template semantic mapping"] : []),
    ...(profile.supportedRuleKinds.length > 0 ? ["schema rule interpreter constrained to template behavior modes"] : [])
  ]);
}

function resultWarnings(
  profile: TemplateMappingProfile,
  fit: CompatibilityFit,
  unsupportedConcepts: readonly UnsupportedSchemaConcept[],
  lossyMappings: readonly LossyMappingNote[]
): readonly string[] {
  return unique([
    `Template ${profile.templateId} fit is structural only; runnableNow remains false.`,
    "Static template metadata is not template runtime support for ModelSchemaDefinition.",
    "Compatibility mapping does not mutate templates or generate runnable artifacts.",
    ...(fit === "strong" || fit === "templateExact" ? ["A strong template fit does not mean a schema can run."] : []),
    ...(unsupportedConcepts.length > 0 ? ["Unsupported schema concepts remain visible and must not be hidden."] : []),
    ...(lossyMappings.length > 0 ? ["Lossy mappings remain visible and must not be silently dropped."] : [])
  ]);
}

function fitRank(fit: CompatibilityFit): number {
  switch (fit) {
    case "templateExact":
      return 4;
    case "strong":
      return 3;
    case "partial":
      return 2;
    case "weak":
      return 1;
    case "none":
      return 0;
  }
}

function mappingId(templateId: string, kind: string, id: string): string {
  return `mapping:${safeId(templateId)}:${safeId(kind)}:${safeId(id)}`;
}

function unsupportedId(templateId: string, kind: string, id: string): string {
  return `unsupported:${safeId(templateId)}:${safeId(kind)}:${safeId(id)}`;
}

function lossId(templateId: string, kind: string, id: string, lossKind: string): string {
  return `loss:${safeId(templateId)}:${safeId(kind)}:${safeId(id)}:${safeId(lossKind)}`;
}

function safeId(value: string): string {
  const safe = value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return safe || "item";
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function unique<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values)).sort();
}
