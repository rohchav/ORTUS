import {
  deserializeModelSchema,
  getModelInterpreterCapabilityReport,
  modelSchemaArtifactType,
  serializeModelSchema,
  summarizeModelSchema,
  type AttributeTypeDeclaration,
  type ComponentTypeDeclaration,
  type EntityTypeDeclaration,
  type MetricDeclaration,
  type ModelArtifactReference,
  type ModelInterpreterCapabilityReport,
  type ModelSchemaDefinition,
  type ModelSchemaSummary,
  type ParameterDeclaration,
  type RuleDeclaration,
  type SpaceDeclaration
} from "../../simulation/modelSchema";
import type { AssumptionItem } from "../../simulation/assumptions";
import { getArtifactFamily, getPrimitive, type PrimitiveId } from "../../simulation/registry";

export const modelSchemaAuthoringSections = [
  { id: "identity", label: "Identity", description: "Artifact identity, version, scope, and top-level metadata." },
  { id: "entities", label: "Entities", description: "Structural entity type declarations." },
  { id: "components", label: "Components", description: "Reusable structural component declarations." },
  { id: "attributes", label: "Attributes", description: "Bounded value-shape declarations." },
  { id: "spaces", label: "Spaces", description: "Structural space references and coordinate descriptions." },
  { id: "parameters", label: "Parameters", description: "Non-executable parameter declarations." },
  { id: "metrics", label: "Metrics", description: "Declared model outputs, not empirical measurements." },
  { id: "rules", label: "Rules", description: "Descriptive rule declarations that ORTUS does not execute." },
  { id: "artifacts", label: "Artifacts", description: "Structural artifact references that do not activate runtime support." },
  { id: "notes", label: "Notes", description: "Assumptions, limitations, validation notes, and metadata." }
] as const;

export type ModelSchemaAuthoringSectionId = (typeof modelSchemaAuthoringSections)[number]["id"];

export type ModelSchemaRepeatedKey =
  | "entityTypes"
  | "componentTypes"
  | "attributeTypes"
  | "spaces"
  | "parameters"
  | "metrics"
  | "ruleDeclarations"
  | "artifactReferences";

export interface ModelSchemaDraftView {
  report: ModelInterpreterCapabilityReport;
  summary: ModelSchemaSummary | null;
  fieldErrorId: string | null;
  structurallyValid: boolean;
}

export interface ModelSchemaImportResult {
  draft: ModelSchemaDefinition;
  artifact: ModelSchemaDefinition | null;
  error: string | null;
  changed: boolean;
}

export interface ModelSchemaExportResult {
  json: string;
  artifact: ModelSchemaDefinition | null;
  error: string | null;
}

export interface ArtifactReferenceStatus {
  artifactStatus: string;
  primitiveStatus: string;
  runtimeNote: string;
}

export function createEmptyModelSchemaDraft(): ModelSchemaDefinition {
  return {
    artifactType: modelSchemaArtifactType,
    id: "",
    name: "",
    description: "",
    version: "",
    schemaVersion: "1",
    entityTypes: [
      {
        id: "",
        label: "",
        entityKind: "agent",
        active: true,
        executable: false
      }
    ],
    componentTypes: [],
    attributeTypes: [],
    spaces: [],
    parameters: [],
    metrics: [],
    ruleDeclarations: [],
    artifactReferences: [],
    assumptionNotes: [],
    limitationNotes: [],
    validationNotes: [],
    metadata: {}
  };
}

export function createModelSchemaDraftView(draft: ModelSchemaDefinition): ModelSchemaDraftView {
  const report = getModelInterpreterCapabilityReport(draft);
  return {
    report,
    summary: report.valid ? summarizeModelSchema(draft) : null,
    fieldErrorId: report.errors[0] ? mapModelSchemaErrorToFieldId(report.errors[0]) : null,
    structurallyValid: report.valid
  };
}

export function importModelSchemaDraft(currentDraft: ModelSchemaDefinition, json: string): ModelSchemaImportResult {
  try {
    const artifact = deserializeModelSchema(json);
    return {
      draft: artifact,
      artifact,
      error: null,
      changed: true
    };
  } catch (error) {
    return {
      draft: currentDraft,
      artifact: null,
      error: error instanceof Error ? error.message : "Invalid model schema JSON.",
      changed: false
    };
  }
}

export function exportModelSchemaDraft(draft: ModelSchemaDefinition): ModelSchemaExportResult {
  try {
    const json = serializeModelSchema(draft);
    return {
      json,
      artifact: deserializeModelSchema(json),
      error: null
    };
  } catch (error) {
    return {
      json: "",
      artifact: null,
      error: error instanceof Error ? error.message : "Invalid model schema draft."
    };
  }
}

export function isModelSchemaDraftDirty(draft: ModelSchemaDefinition, baseline: ModelSchemaDefinition): boolean {
  return JSON.stringify(draft) !== JSON.stringify(baseline);
}

export function isEmptyModelSchemaAuthoringDraft(draft: ModelSchemaDefinition): boolean {
  return JSON.stringify(draft) === JSON.stringify(createEmptyModelSchemaDraft());
}

export function updateModelSchemaDeclaration<K extends ModelSchemaRepeatedKey>(
  draft: ModelSchemaDefinition,
  key: K,
  index: number,
  value: ModelSchemaDeclarationFor<K>
): ModelSchemaDefinition {
  const current = [...(draft[key] ?? [])] as ModelSchemaDeclarationFor<K>[];
  current[index] = value;
  return { ...draft, [key]: current };
}

export function addModelSchemaDeclaration<K extends ModelSchemaRepeatedKey>(
  draft: ModelSchemaDefinition,
  key: K,
  value: ModelSchemaDeclarationFor<K>
): ModelSchemaDefinition {
  return { ...draft, [key]: [...(draft[key] ?? []), value] };
}

export function removeModelSchemaDeclaration(
  draft: ModelSchemaDefinition,
  key: ModelSchemaRepeatedKey,
  index: number
): ModelSchemaDefinition {
  return { ...draft, [key]: (draft[key] ?? []).filter((_, candidateIndex) => candidateIndex !== index) };
}

export function createEntityTypeDeclaration(draft: ModelSchemaDefinition): EntityTypeDeclaration {
  const id = nextId("entity", draft.entityTypes);
  return { id, label: titleFromId(id), entityKind: "agent", active: true, executable: false };
}

export function createComponentTypeDeclaration(draft: ModelSchemaDefinition): ComponentTypeDeclaration {
  const id = nextId("component", draft.componentTypes ?? []);
  return { id, label: titleFromId(id), componentKind: "state", active: true, executable: false };
}

export function createAttributeTypeDeclaration(draft: ModelSchemaDefinition): AttributeTypeDeclaration {
  const id = nextId("attribute", draft.attributeTypes ?? []);
  return { id, label: titleFromId(id), valueKind: "number", active: true, executable: false };
}

export function createSpaceDeclaration(draft: ModelSchemaDefinition): SpaceDeclaration {
  const id = nextId("space", draft.spaces ?? []);
  return { id, label: titleFromId(id), spaceKind: "abstract", active: true, executable: false };
}

export function createParameterDeclaration(draft: ModelSchemaDefinition): ParameterDeclaration {
  const id = nextId("parameter", draft.parameters ?? []);
  return { id, label: titleFromId(id), valueKind: "number", active: true, executable: false };
}

export function createMetricDeclaration(draft: ModelSchemaDefinition): MetricDeclaration {
  const id = nextId("metric", draft.metrics ?? []);
  return { id, label: titleFromId(id), metricKind: "count", active: true, executable: false };
}

export function createRuleDeclaration(draft: ModelSchemaDefinition): RuleDeclaration {
  const id = nextId("rule", draft.ruleDeclarations ?? []);
  return {
    id,
    label: titleFromId(id),
    ruleKind: "custom",
    ruleDescription: "Describe intended structural behavior only.",
    active: true,
    executable: false
  };
}

export function createArtifactReference(draft: ModelSchemaDefinition): ModelArtifactReference {
  const id = nextId("artifact-reference", draft.artifactReferences ?? []);
  return {
    id,
    label: titleFromId(id),
    artifactType: "ortus.reference",
    artifactId: `artifact-${(draft.artifactReferences ?? []).length + 1}`,
    role: "context",
    active: true,
    executable: false
  };
}

export function createAssumptionItem(prefix: string, items: readonly AssumptionItem[]): AssumptionItem {
  const id = nextId(prefix, items);
  return {
    id,
    label: titleFromId(id),
    description: ""
  };
}

export function parseReferenceIds(value: string): readonly string[] | undefined {
  const ids = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : undefined;
}

export function formatReferenceIds(value: readonly string[] | undefined): string {
  return value?.join(", ") ?? "";
}

export function parseNotes(value: string): readonly string[] | undefined {
  const notes = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return notes.length > 0 ? notes : undefined;
}

export function formatNotes(value: readonly string[] | undefined): string {
  return value?.join("\n") ?? "";
}

export function getArtifactReferenceStatus(reference: ModelArtifactReference): ArtifactReferenceStatus {
  const artifact = getArtifactFamily(reference.artifactType);
  const primitive = reference.primitiveId ? getPrimitive(reference.primitiveId) : undefined;
  return {
    artifactStatus: artifact ? (artifact.serviceOnly ? "service only" : artifact.implemented ? "implemented artifact service" : "future only") : "unknown",
    primitiveStatus: primitive ? `${primitive.status} / ${primitive.supportLevel}` : reference.primitiveId ? "unknown primitive" : "not declared",
    runtimeNote: "Attachment is structural only and does not activate template or simulation runtime support."
  };
}

export function mapModelSchemaErrorToFieldId(error: string): string | null {
  const pathMatch = error.match(/Invalid model schema: ([A-Za-z]+)(?:\.(\d+))?(?:\.([A-Za-z]+))?:/);
  if (pathMatch) {
    const [, root, index, field] = pathMatch;
    if (root === "id" || root === "name" || root === "version" || root === "description") {
      return `schema-identity-${root}`;
    }
    if (index !== undefined && field) {
      return `schema-${root}-${index}-${field}`;
    }
    return root ? `schema-section-${sectionIdForRoot(root)}` : null;
  }

  const duplicateMatch = error.match(/Duplicate (entity type|component type|attribute type|space|parameter|metric|rule declaration|artifact reference) id/);
  if (duplicateMatch) {
    return `schema-section-${sectionIdForDuplicateLabel(duplicateMatch[1] ?? "")}`;
  }
  if (error.startsWith("Entity type ")) {
    return "schema-section-entities";
  }
  if (error.startsWith("Component type ")) {
    return "schema-section-components";
  }
  if (error.startsWith("Rule declaration ")) {
    return "schema-section-rules";
  }
  return null;
}

export function primitiveIdOrUndefined(value: string): PrimitiveId | undefined {
  return value ? (value as PrimitiveId) : undefined;
}

type ModelSchemaDeclarationFor<K extends ModelSchemaRepeatedKey> = NonNullable<ModelSchemaDefinition[K]>[number];

function nextId(prefix: string, items: readonly { id: string }[]): string {
  const ids = new Set(items.map((item) => item.id));
  let index = items.length + 1;
  while (ids.has(`${prefix}-${index}`)) {
    index += 1;
  }
  return `${prefix}-${index}`;
}

function titleFromId(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sectionIdForRoot(root: string): ModelSchemaAuthoringSectionId {
  const sections: Record<string, ModelSchemaAuthoringSectionId> = {
    artifactType: "identity",
    schemaVersion: "identity",
    scope: "identity",
    entityTypes: "entities",
    componentTypes: "components",
    attributeTypes: "attributes",
    spaces: "spaces",
    parameters: "parameters",
    metrics: "metrics",
    ruleDeclarations: "rules",
    artifactReferences: "artifacts",
    assumptionNotes: "notes",
    limitationNotes: "notes",
    validationNotes: "notes",
    metadata: "notes"
  };
  return sections[root] ?? "identity";
}

function sectionIdForDuplicateLabel(label: string): ModelSchemaAuthoringSectionId {
  const sections: Record<string, ModelSchemaAuthoringSectionId> = {
    "entity type": "entities",
    "component type": "components",
    "attribute type": "attributes",
    space: "spaces",
    parameter: "parameters",
    metric: "metrics",
    "rule declaration": "rules",
    "artifact reference": "artifacts"
  };
  return sections[label] ?? "identity";
}
