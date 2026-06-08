import { z } from "zod";
import { assumptionItemSchema, validateAssumptionItems } from "../assumptions/validation";
import { SimulationSerializationError, SimulationValidationError } from "../kernel/Errors";
import { jsonValueSchema } from "../kernel/Validation";
import type { JsonValue } from "../kernel/types";
import { primitiveIds } from "../registry/types";
import {
  maxVisualBuilderWorkspaceArtifactReferences,
  maxVisualBuilderWorkspaceDescriptionLength,
  maxVisualBuilderWorkspaceItems,
  maxVisualBuilderWorkspaceJsonLength,
  maxVisualBuilderWorkspaceMarkers,
  maxVisualBuilderWorkspaceMetadataJsonLength,
  maxVisualBuilderWorkspaceNoteLength,
  maxVisualBuilderWorkspaceNotes,
  visualBuilderArtifactReferenceRoles,
  visualBuilderEdgeKinds,
  visualBuilderLayoutKinds,
  visualBuilderMarkerKinds,
  visualBuilderMarkerSeverities,
  visualBuilderNodeKinds,
  visualBuilderNodeStatuses,
  visualBuilderPanelKinds,
  visualBuilderSectionKinds,
  visualBuilderWorkspaceArtifactType,
  type VisualBuilderArtifactReference,
  type VisualBuilderEdge,
  type VisualBuilderLayout,
  type VisualBuilderMarker,
  type VisualBuilderNode,
  type VisualBuilderPanel,
  type VisualBuilderSection,
  type VisualBuilderSelection,
  type VisualBuilderViewport,
  type VisualBuilderWorkspaceDefinition,
  type VisualBuilderWorkspaceScope
} from "./types";

const boundedString = (max: number) => z.string().min(1).max(max);
const optionalDescription = z.string().max(maxVisualBuilderWorkspaceDescriptionLength).optional();
const noteSchema = z.string().min(1).max(maxVisualBuilderWorkspaceNoteLength);
const notesSchema = z.array(noteSchema).max(maxVisualBuilderWorkspaceNotes);
const stringIdArraySchema = z.array(boundedString(160)).max(maxVisualBuilderWorkspaceItems);

const pointSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite()
  })
  .strict();

const sizeSchema = z
  .object({
    width: z.number().finite().nonnegative(),
    height: z.number().finite().nonnegative()
  })
  .strict();

const scopeSchema: z.ZodType<VisualBuilderWorkspaceScope> = z
  .object({
    modelSchemaId: boundedString(160).optional(),
    hybridCompositionId: boundedString(160).optional(),
    scenarioId: boundedString(240).optional(),
    templateId: boundedString(160).optional(),
    knowledgeMemorySocialLearningModelId: boundedString(160).optional(),
    observabilityModelId: boundedString(160).optional(),
    causalAssumptionModelId: boundedString(160).optional(),
    quantitySemanticsModelId: boundedString(160).optional(),
    networkDefinitionId: boundedString(160).optional(),
    resourceSystemId: boundedString(160).optional(),
    feedbackLoopModelId: boundedString(160).optional(),
    boundaryModelId: boundedString(160).optional(),
    fieldLayerId: boundedString(160).optional(),
    scaleModelId: boundedString(160).optional(),
    controlStrategyModelId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const nodeSchema: z.ZodType<VisualBuilderNode> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    nodeKind: z.enum(visualBuilderNodeKinds),
    referencedArtifactType: boundedString(180).optional(),
    referencedArtifactId: boundedString(240).optional(),
    referencedSchemaElementId: boundedString(160).optional(),
    status: z.enum(visualBuilderNodeStatuses),
    position: pointSchema.optional(),
    size: sizeSchema.optional(),
    collapsed: z.boolean().optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const edgeSchema: z.ZodType<VisualBuilderEdge> = z
  .object({
    id: boundedString(160),
    label: boundedString(180).optional(),
    edgeKind: z.enum(visualBuilderEdgeKinds),
    sourceNodeId: boundedString(160),
    targetNodeId: boundedString(160),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const panelSchema: z.ZodType<VisualBuilderPanel> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    panelKind: z.enum(visualBuilderPanelKinds),
    nodeIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const sectionSchema: z.ZodType<VisualBuilderSection> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    sectionKind: z.enum(visualBuilderSectionKinds),
    panelIds: stringIdArraySchema.optional(),
    nodeIds: stringIdArraySchema.optional(),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const markerSchema: z.ZodType<VisualBuilderMarker> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    markerKind: z.enum(visualBuilderMarkerKinds),
    targetNodeId: boundedString(160).optional(),
    targetEdgeId: boundedString(160).optional(),
    severity: z.enum(visualBuilderMarkerSeverities),
    message: z.string().min(1).max(2_000),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const artifactReferenceSchema: z.ZodType<VisualBuilderArtifactReference> = z
  .object({
    id: boundedString(160),
    label: boundedString(180),
    artifactType: boundedString(180),
    artifactId: boundedString(240),
    primitiveId: z.enum(primitiveIds).optional(),
    role: z.enum(visualBuilderArtifactReferenceRoles),
    active: z.boolean(),
    executable: z.literal(false),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const selectionSchema: z.ZodType<VisualBuilderSelection> = z
  .object({
    selectedNodeIds: stringIdArraySchema.optional(),
    selectedEdgeIds: stringIdArraySchema.optional(),
    focusedPanelId: boundedString(160).optional(),
    focusedSectionId: boundedString(160).optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const viewportSchema: z.ZodType<VisualBuilderViewport> = z
  .object({
    x: z.number().finite().optional(),
    y: z.number().finite().optional(),
    zoom: z.number().finite().positive().optional(),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const layoutSchema: z.ZodType<VisualBuilderLayout> = z
  .object({
    layoutKind: z.enum(visualBuilderLayoutKinds),
    notes: notesSchema.optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const workspaceDefinitionSchema: z.ZodType<VisualBuilderWorkspaceDefinition> = z
  .object({
    artifactType: z.literal(visualBuilderWorkspaceArtifactType),
    id: boundedString(160),
    name: boundedString(180),
    description: optionalDescription,
    version: boundedString(80),
    workspaceVersion: z.literal("1"),
    scope: scopeSchema.optional(),
    modelSchemaId: boundedString(160).optional(),
    nodes: z.array(nodeSchema).max(maxVisualBuilderWorkspaceItems),
    edges: z.array(edgeSchema).max(maxVisualBuilderWorkspaceItems).optional(),
    panels: z.array(panelSchema).max(maxVisualBuilderWorkspaceItems).optional(),
    sections: z.array(sectionSchema).max(maxVisualBuilderWorkspaceItems).optional(),
    artifactReferences: z.array(artifactReferenceSchema).max(maxVisualBuilderWorkspaceArtifactReferences).optional(),
    validationMarkers: z.array(markerSchema).max(maxVisualBuilderWorkspaceMarkers).optional(),
    warningMarkers: z.array(markerSchema).max(maxVisualBuilderWorkspaceMarkers).optional(),
    unsupportedMarkers: z.array(markerSchema).max(maxVisualBuilderWorkspaceMarkers).optional(),
    selection: selectionSchema.optional(),
    viewport: viewportSchema.optional(),
    layout: layoutSchema.optional(),
    assumptionNotes: z.array(assumptionItemSchema).max(maxVisualBuilderWorkspaceNotes).optional(),
    limitationNotes: z.array(assumptionItemSchema).max(maxVisualBuilderWorkspaceNotes).optional(),
    validationNotes: z.array(assumptionItemSchema).max(maxVisualBuilderWorkspaceNotes).optional(),
    metadata: z.record(jsonValueSchema).optional()
  })
  .strict();

const forbiddenVisualBuilderWorkspaceKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "metricHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "runState",
  "runSummary",
  "runSummaries",
  "template",
  "activeEngine",
  "formula",
  "formulas",
  "expression",
  "expressions",
  "equation",
  "equations",
  "code",
  "script",
  "javascript",
  "typescript",
  "python",
  "functionBody",
  "function",
  "class",
  "prototype",
  "constructor",
  "__proto__",
  "callback",
  "reactComponent",
  "componentRef",
  "domRef",
  "canvasRef",
  "uiRuntime",
  "visualBuilderUi",
  "nodeEditor",
  "nodeCanvas",
  "graphRenderer",
  "toolbar",
  "palette",
  "saveLoadUi",
  "runModelButton",
  "schemaAuthoringForm",
  "dragDropRuntime",
  "runtime",
  "runtimeHook",
  "runtimeHooks",
  "execute",
  "executor",
  "stepFunction",
  "tickFunction",
  "behaviorFunction",
  "ruleFunction",
  "simulationLoop",
  "visualBuilderRuntime",
  "nodeRuntime",
  "edgeRuntime",
  "dataflowRuntime",
  "blockProgram",
  "visualProgram",
  "graphProgram",
  "graphExecution",
  "bytecode",
  "ast",
  "compile",
  "compiler",
  "interpreter",
  "parser",
  "transpiler",
  "codegen",
  "generatedCode",
  "generateTemplate",
  "generateScenario",
  "generateRunConfig",
  "generateSnapshot",
  "createEngine",
  "applyScenario",
  "netlogoCode",
  "netlogoImport",
  "netlogoExport",
  "mesaModel",
  "mesaImport",
  "mesaExport",
  "masonModel",
  "masonImport",
  "masonExport",
  "externalAdapter",
  "externalRuntime",
  "externalFrameworkImport",
  "externalFrameworkExport",
  "frameworkAdapter",
  "llm",
  "llmAgent",
  "llmAgents",
  "largeLanguageModel",
  "prompt",
  "promptTemplate",
  "promptChain",
  "promptChains",
  "embedding",
  "embeddings",
  "modelWeight",
  "modelWeights",
  "trainingData",
  "trainingDataset",
  "dataset",
  "observedData",
  "dataFrame",
  "realPersonProfile",
  "realPersonTraits",
  "protectedAttribute",
  "protectedAttributeInference",
  "raceInference",
  "religionInference",
  "politicalInference",
  "sexualOrientationInference",
  "healthInference",
  "persuasionOptimization",
  "manipulationOptimization",
  "microtargeting",
  "targeting",
  "targetingModel",
  "proof",
  "certification",
  "safetyCertification",
  "riskScore",
  "safetyScore"
]);

const normalizedForbiddenVisualBuilderWorkspaceKeys = new Set(Array.from(forbiddenVisualBuilderWorkspaceKeys).map((key) => key.toLowerCase()));

const allowedTopLevelKeys = new Set([
  "artifactType",
  "id",
  "name",
  "description",
  "version",
  "workspaceVersion",
  "scope",
  "modelSchemaId",
  "nodes",
  "edges",
  "panels",
  "sections",
  "artifactReferences",
  "validationMarkers",
  "warningMarkers",
  "unsupportedMarkers",
  "selection",
  "viewport",
  "layout",
  "assumptionNotes",
  "limitationNotes",
  "validationNotes",
  "metadata"
]);

export function validateVisualBuilderWorkspaceDefinition(value: unknown): VisualBuilderWorkspaceDefinition {
  assertPlainVisualBuilderWorkspaceJson(value, "Visual builder workspace");
  const parsed = workspaceDefinitionSchema.safeParse(value);
  if (!parsed.success) {
    throw new SimulationValidationError(`Invalid visual builder workspace: ${formatZodIssue(parsed.error)}`);
  }
  const workspace = normalizeVisualBuilderWorkspaceDefinition(parsed.data);
  assertVisualBuilderWorkspaceJsonBound(workspace, maxVisualBuilderWorkspaceJsonLength, "Visual builder workspace");
  validateNotes(workspace);
  validateMetadataBounds(workspace);
  validateUniqueIds("workspace node", workspace.nodes);
  validateUniqueIds("workspace edge", workspace.edges ?? []);
  validateUniqueIds("workspace panel", workspace.panels ?? []);
  validateUniqueIds("workspace section", workspace.sections ?? []);
  validateUniqueIds("workspace marker", allMarkers(workspace));
  validateUniqueIds("workspace artifact reference", workspace.artifactReferences ?? []);
  validateReferences(workspace);
  return workspace;
}

export function parseVisualBuilderWorkspaceJson(json: string | unknown): VisualBuilderWorkspaceDefinition {
  let raw: unknown = json;
  if (typeof json === "string") {
    if (json.length > maxVisualBuilderWorkspaceJsonLength) {
      throw new SimulationSerializationError(`Visual builder workspace JSON must be ${maxVisualBuilderWorkspaceJsonLength} characters or less`);
    }
    try {
      raw = JSON.parse(json);
    } catch (error) {
      throw new SimulationSerializationError("Invalid visual builder workspace JSON", { cause: error });
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || (raw as { artifactType?: unknown }).artifactType !== visualBuilderWorkspaceArtifactType) {
    throw new SimulationSerializationError(`Expected artifact type ${visualBuilderWorkspaceArtifactType}`);
  }
  return validateVisualBuilderWorkspaceDefinition(raw);
}

export function normalizeVisualBuilderWorkspaceDefinition(workspace: VisualBuilderWorkspaceDefinition): VisualBuilderWorkspaceDefinition {
  return {
    ...workspace,
    ...(workspace.scope ? { scope: cloneRecord(workspace.scope) } : {}),
    nodes: workspace.nodes.map((node) => cloneRecord(node)),
    ...(workspace.edges ? { edges: workspace.edges.map((edge) => cloneRecord(edge)) } : {}),
    ...(workspace.panels ? { panels: workspace.panels.map((panel) => cloneRecord(panel)) } : {}),
    ...(workspace.sections ? { sections: workspace.sections.map((section) => cloneRecord(section)) } : {}),
    ...(workspace.artifactReferences ? { artifactReferences: workspace.artifactReferences.map((reference) => cloneRecord(reference)) } : {}),
    ...(workspace.validationMarkers ? { validationMarkers: workspace.validationMarkers.map((marker) => cloneRecord(marker)) } : {}),
    ...(workspace.warningMarkers ? { warningMarkers: workspace.warningMarkers.map((marker) => cloneRecord(marker)) } : {}),
    ...(workspace.unsupportedMarkers ? { unsupportedMarkers: workspace.unsupportedMarkers.map((marker) => cloneRecord(marker)) } : {}),
    ...(workspace.selection ? { selection: cloneRecord(workspace.selection) } : {}),
    ...(workspace.viewport ? { viewport: cloneRecord(workspace.viewport) } : {}),
    ...(workspace.layout ? { layout: cloneRecord(workspace.layout) } : {}),
    ...(workspace.assumptionNotes ? { assumptionNotes: validateAssumptionItems("visual builder workspace assumption notes", workspace.assumptionNotes) } : {}),
    ...(workspace.limitationNotes ? { limitationNotes: validateAssumptionItems("visual builder workspace limitation notes", workspace.limitationNotes) } : {}),
    ...(workspace.validationNotes ? { validationNotes: validateAssumptionItems("visual builder workspace validation notes", workspace.validationNotes) } : {}),
    ...(workspace.metadata ? { metadata: cloneRecord(workspace.metadata) as Record<string, JsonValue> } : {})
  };
}

function validateReferences(workspace: VisualBuilderWorkspaceDefinition): void {
  const nodeIds = new Set(workspace.nodes.map((node) => node.id));
  const edgeIds = new Set((workspace.edges ?? []).map((edge) => edge.id));
  const panelIds = new Set((workspace.panels ?? []).map((panel) => panel.id));
  const sectionIds = new Set((workspace.sections ?? []).map((section) => section.id));

  for (const edge of workspace.edges ?? []) {
    validateReferenceSet(`Edge ${edge.id}`, "sourceNodeId", [edge.sourceNodeId], nodeIds);
    validateReferenceSet(`Edge ${edge.id}`, "targetNodeId", [edge.targetNodeId], nodeIds);
  }
  for (const panel of workspace.panels ?? []) {
    validateReferenceSet(`Panel ${panel.id}`, "nodeId", panel.nodeIds ?? [], nodeIds);
  }
  for (const section of workspace.sections ?? []) {
    validateReferenceSet(`Section ${section.id}`, "panelId", section.panelIds ?? [], panelIds);
    validateReferenceSet(`Section ${section.id}`, "nodeId", section.nodeIds ?? [], nodeIds);
  }
  for (const marker of allMarkers(workspace)) {
    validateReferenceSet(`Marker ${marker.id}`, "targetNodeId", marker.targetNodeId ? [marker.targetNodeId] : [], nodeIds);
    validateReferenceSet(`Marker ${marker.id}`, "targetEdgeId", marker.targetEdgeId ? [marker.targetEdgeId] : [], edgeIds);
  }
  if (workspace.selection) {
    validateReferenceSet("Selection", "selectedNodeId", workspace.selection.selectedNodeIds ?? [], nodeIds);
    validateReferenceSet("Selection", "selectedEdgeId", workspace.selection.selectedEdgeIds ?? [], edgeIds);
    validateReferenceSet("Selection", "focusedPanelId", workspace.selection.focusedPanelId ? [workspace.selection.focusedPanelId] : [], panelIds);
    validateReferenceSet("Selection", "focusedSectionId", workspace.selection.focusedSectionId ? [workspace.selection.focusedSectionId] : [], sectionIds);
  }
}

function validateReferenceSet(label: string, field: string, ids: readonly string[], knownIds: ReadonlySet<string>): void {
  for (const id of ids) {
    if (!knownIds.has(id)) {
      throw new SimulationValidationError(`${label} references unknown ${field}: ${id}`);
    }
  }
}

function validateUniqueIds(label: string, values: readonly { id: string }[]): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new SimulationValidationError(`Duplicate ${label} id: ${value.id}`);
    }
    ids.add(value.id);
  }
}

function validateNotes(workspace: VisualBuilderWorkspaceDefinition): void {
  for (const [section, notes] of [
    ["assumptionNotes", workspace.assumptionNotes],
    ["limitationNotes", workspace.limitationNotes],
    ["validationNotes", workspace.validationNotes]
  ] as const) {
    if (notes) {
      validateAssumptionItems(`visual builder workspace ${section}`, notes);
    }
  }
}

function validateMetadataBounds(workspace: VisualBuilderWorkspaceDefinition): void {
  const metadataValues: Array<[string, Record<string, JsonValue> | undefined]> = [
    ["workspace metadata", workspace.metadata],
    ["scope metadata", workspace.scope?.metadata],
    ["selection metadata", workspace.selection?.metadata],
    ["viewport metadata", workspace.viewport?.metadata],
    ["layout metadata", workspace.layout?.metadata],
    ...workspace.nodes.map((node) => [`node ${node.id} metadata`, node.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(workspace.edges ?? []).map((edge) => [`edge ${edge.id} metadata`, edge.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(workspace.panels ?? []).map((panel) => [`panel ${panel.id} metadata`, panel.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(workspace.sections ?? []).map((section) => [`section ${section.id} metadata`, section.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...allMarkers(workspace).map((marker) => [`marker ${marker.id} metadata`, marker.metadata] as [string, Record<string, JsonValue> | undefined]),
    ...(workspace.artifactReferences ?? []).map((reference) => [`artifact reference ${reference.id} metadata`, reference.metadata] as [
      string,
      Record<string, JsonValue> | undefined
    ])
  ];
  for (const [label, metadata] of metadataValues) {
    if (metadata) {
      assertVisualBuilderWorkspaceJsonBound(metadata, maxVisualBuilderWorkspaceMetadataJsonLength, label);
    }
  }
}

export function assertVisualBuilderWorkspaceJsonBound(value: unknown, maxLength: number, label: string): void {
  const length = JSON.stringify(value).length;
  if (length > maxLength) {
    throw new SimulationValidationError(`${label} must be ${maxLength} characters or less`);
  }
}

export function assertPlainVisualBuilderWorkspaceJson(value: unknown, label: string): void {
  const stack: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const item = stack.pop();
    const current = item?.value;
    const depth = item?.depth ?? 0;
    if (current === null || current === undefined) {
      continue;
    }
    if (typeof current === "function" || typeof current === "symbol" || typeof current === "bigint") {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    if (typeof current !== "object") {
      if (typeof current === "number" && !Number.isFinite(current)) {
        throw new SimulationValidationError(`${label} must not contain non-finite numbers`);
      }
      continue;
    }
    if (Array.isArray(current)) {
      stack.push(...current.map((child) => ({ value: child, depth: depth + 1 })));
      continue;
    }
    if (!isPlainRecord(current)) {
      throw new SimulationValidationError(`${label} must be plain JSON`);
    }
    if (seen.has(current)) {
      throw new SimulationValidationError(`${label} must be acyclic plain JSON`);
    }
    seen.add(current);
    for (const [key, child] of Object.entries(current)) {
      if (isForbiddenVisualBuilderWorkspaceKey(key) && !(depth === 0 && allowedTopLevelKeys.has(key))) {
        throw new SimulationValidationError(
          `${label} must not contain live-state, executable, formula, code, visual-programming, graph-execution, compiler, schema-generation, runtime-engine, external-framework, LLM, embedding, model-weight, training-data, real-person, protected-class, persuasion, microtargeting, proof, certification, safety, or risk key ${key}`
        );
      }
      stack.push({ value: child, depth: depth + 1 });
    }
  }
}

function allMarkers(workspace: VisualBuilderWorkspaceDefinition): readonly VisualBuilderMarker[] {
  return [...(workspace.validationMarkers ?? []), ...(workspace.warningMarkers ?? []), ...(workspace.unsupportedMarkers ?? [])];
}

function isForbiddenVisualBuilderWorkspaceKey(key: string): boolean {
  return forbiddenVisualBuilderWorkspaceKeys.has(key) || normalizedForbiddenVisualBuilderWorkspaceKeys.has(key.toLowerCase());
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainRecord(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function formatZodIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "unknown validation issue";
  }
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
