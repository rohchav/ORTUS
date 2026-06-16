import {
  getModelInterpreterCapabilityReport,
  type ModelInterpreterCapabilityReport,
  type ModelSchemaDefinition
} from "../../../simulation/modelSchema";
import type { JsonValue } from "../../../simulation/kernel/types";
import {
  mapModelSchemaErrorToFieldId,
  type ModelSchemaAuthoringSectionId,
  type ModelSchemaRepeatedKey
} from "../modelSchemaAuthoring";

export const schemaValidationEmptyState = "Structurally valid. This does not make the schema runnable.";

export const schemaValidationRepairBoundaryPhrases = [
  "Repair suggestions are structural editing assistance. They do not make a schema runnable.",
  "A repaired schema may be structurally valid and still have no runtime implementation.",
  "ORTUS does not infer the correct model behavior from validation repairs.",
  "Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines."
] as const;

export const schemaValidationRuleRepairBoundaryPhrase =
  "Rule repair suggestions only edit structural declarations. They do not execute or validate behavior.";

export type SchemaValidationSeverity = "error" | "warning" | "info";
export type SchemaRepairRiskLevel = "safe" | "confirmation" | "manualOnly";

export interface SchemaValidationUxModel {
  overview: SchemaValidationOverview;
  groups: readonly SchemaValidationIssueGroup[];
  issues: readonly SchemaValidationIssue[];
  emptyState: string | null;
  boundaryPhrases: readonly string[];
}

export interface SchemaValidationOverview {
  structuralStatus: "Structurally valid" | "Structurally invalid";
  runnableStatus: "Not runnable";
  compilerStatus: "No compiler or interpreter";
  errorCount: number;
  warningCount: number;
  suggestionCount: number;
  manualOnlyCount: number;
  unsupportedCapabilityCount: number;
  serviceOnlyNotice: string;
  futureOnlyNotice: string;
}

export interface SchemaValidationIssueGroup {
  id: string;
  title: string;
  count: number;
  highestSeverity: SchemaValidationSeverity;
  issues: readonly SchemaValidationIssue[];
}

export interface SchemaValidationIssue {
  id: string;
  title: string;
  category: string;
  severity: SchemaValidationSeverity;
  sectionId: ModelSchemaAuthoringSectionId;
  fieldId: string | null;
  path: string;
  explanation: string;
  whyItMatters: string;
  originalMessage: string;
  suggestion: SchemaRepairSuggestion | null;
  manualGuidance: string;
  boundaryNotice: string;
}

export interface SchemaRepairSuggestion {
  id: string;
  label: string;
  actionLabel: "Apply structural edit" | "Normalize identifier" | "Clear unsafe payload" | "Remove unsafe metadata key";
  canApply: boolean;
  riskLevel: SchemaRepairRiskLevel;
  requiresConfirmation: boolean;
  summary: string;
  preview: string;
  disabledReason: string | null;
  patch: SchemaRepairPatch | null;
}

export type SchemaRepairPatch =
  | {
      kind: "trimTopLevelString";
      field: "id" | "name" | "version" | "description";
      from: string;
      to: string;
      draftHash: string;
    }
  | {
      kind: "trimDeclarationId";
      collection: EditableIdCollectionKey;
      index: number;
      from: string;
      to: string;
      draftHash: string;
    }
  | {
      kind: "removeTopLevelMetadataKey";
      key: string;
      draftHash: string;
    }
  | {
      kind: "setDeclarationExecutableFalse";
      collection: ModelSchemaRepeatedKey;
      index: number;
      draftHash: string;
    };

export interface SchemaRepairApplicationResult {
  applied: boolean;
  draft: ModelSchemaDefinition;
  report: ModelInterpreterCapabilityReport;
  message: string;
}

export interface SchemaRepairApplyOptions {
  confirmed?: boolean;
}

type EditableIdCollectionKey = ModelSchemaRepeatedKey | "assumptionNotes" | "limitationNotes" | "validationNotes";

const severityRank: Record<SchemaValidationSeverity, number> = {
  error: 3,
  warning: 2,
  info: 1
};

const repeatedSectionByKey: Record<EditableIdCollectionKey, ModelSchemaAuthoringSectionId> = {
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
  validationNotes: "notes"
};

const editableIdCollections = Object.keys(repeatedSectionByKey) as readonly EditableIdCollectionKey[];

const schemaIssueCategoryOrder = new Map(
  [
    "Unsafe metadata",
    "Execution safety",
    "Duplicate identifiers",
    "Broken references",
    "Missing required structure",
    "Invalid option",
    "Size limits",
    "Other structural issues",
    "Structural cleanup suggestions",
    "Runtime boundaries",
    "Social/cognitive boundary",
    "Missing runtime capabilities"
  ].map((category, index) => [category, index])
);

const validationPathRootToSection: Record<string, ModelSchemaAuthoringSectionId> = {
  artifactType: "identity",
  id: "identity",
  name: "identity",
  description: "identity",
  version: "identity",
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

export function createSchemaValidationUxModel(
  draft: ModelSchemaDefinition,
  report: ModelInterpreterCapabilityReport
): SchemaValidationUxModel {
  const draftHash = getSchemaDraftHash(draft);
  const issues: SchemaValidationIssue[] = [];

  report.errors.forEach((error, index) => {
    issues.push(classifyValidationError(draft, draftHash, error, index));
  });

  issues.push(...collectNormalizationSuggestions(draft, draftHash, issues.length));
  issues.push(...collectExecutablePayloadSuggestions(draft, draftHash, issues.length));

  report.warnings.forEach((warning, index) => {
    issues.push(createBoundaryIssue("warning", warning, index));
  });

  report.missingRuntimeCapabilities.forEach((capability, index) => {
    issues.push(createMissingCapabilityIssue(capability, index));
  });

  const groups = groupIssues(issues);
  const suggestionCount = issues.filter((issue) => issue.suggestion?.canApply && issue.suggestion.patch && issue.suggestion.riskLevel !== "manualOnly").length;
  const manualOnlyCount = issues.filter((issue) => issue.suggestion?.riskLevel === "manualOnly" || (!issue.suggestion && issue.severity === "error")).length;

  return {
    overview: {
      structuralStatus: report.valid ? "Structurally valid" : "Structurally invalid",
      runnableStatus: "Not runnable",
      compilerStatus: "No compiler or interpreter",
      errorCount: report.errors.length,
      warningCount: report.warnings.length,
      suggestionCount,
      manualOnlyCount,
      unsupportedCapabilityCount: report.missingRuntimeCapabilities.length,
      serviceOnlyNotice: "Model-schema validation is service-level structural support, not template runtime support.",
      futureOnlyNotice: "Interpreter, compiler, conversion, generated artifacts, and visual-builder execution remain future-only."
    },
    groups,
    issues,
    emptyState: report.valid && issues.length === 0 ? schemaValidationEmptyState : null,
    boundaryPhrases: schemaValidationRepairBoundaryPhrases
  };
}

export function applySchemaRepairSuggestion(
  draft: ModelSchemaDefinition,
  suggestion: SchemaRepairSuggestion,
  options: SchemaRepairApplyOptions = {}
): SchemaRepairApplicationResult {
  if (!suggestion.canApply || !suggestion.patch || suggestion.riskLevel === "manualOnly") {
    return repairFailure(draft, "This issue requires manual schema editing; no draft changes were applied.");
  }
  const patch = suggestion.patch as unknown;
  if (!isSchemaRepairPatch(patch)) {
    return repairFailure(draft, "Repair suggestion is malformed or unsupported. No draft changes were applied.");
  }
  if (patchTargetsPrototype(patch)) {
    return repairFailure(draft, "Repair suggestion targets a protected object key. No draft changes were applied.");
  }
  if (suggestion.requiresConfirmation && !options.confirmed) {
    return repairFailure(draft, "Repair suggestion requires confirmation before changing the draft. No draft changes were applied.");
  }
  if (patch.draftHash !== getSchemaDraftHash(draft)) {
    return repairFailure(draft, "Repair suggestion is stale because the draft changed. No draft changes were applied.");
  }

  let nextDraft: ModelSchemaDefinition;
  try {
    nextDraft = cloneDraft(draft);
  } catch {
    return repairFailure(draft, "Repair suggestion could not clone the current JSON draft. No draft changes were applied.");
  }

  const applied = applySchemaRepairPatch(nextDraft, patch);
  if (!applied) {
    return repairFailure(draft, "Repair suggestion no longer matches the current draft. No draft changes were applied.");
  }

  return {
    applied: true,
    draft: nextDraft,
    report: getModelInterpreterCapabilityReport(nextDraft),
    message: "Structural repair applied and validation recomputed. This does not make the schema runnable."
  };
}

export function getSchemaDraftHash(draft: ModelSchemaDefinition): string {
  return hashText(JSON.stringify(draft));
}

export function formatSchemaValidationIssueDetails(issue: SchemaValidationIssue): string {
  return [
    `Title: ${issue.title}`,
    `Severity: ${issue.severity}`,
    `Category: ${issue.category}`,
    `Section: ${issue.sectionId}`,
    `Path: ${issue.path}`,
    `Original validation message: ${issue.originalMessage}`,
    `Suggestion: ${issue.suggestion?.summary ?? "Manual review required."}`,
    `Can apply: ${issue.suggestion ? String(issue.suggestion.canApply) : "false"}`,
    `Requires confirmation: ${issue.suggestion ? String(issue.suggestion.requiresConfirmation) : "false"}`,
    `Risk: ${issue.suggestion?.riskLevel ?? "manualOnly"}`,
    `Boundary: ${issue.boundaryNotice}`
  ].join("\n");
}

function classifyValidationError(
  draft: ModelSchemaDefinition,
  draftHash: string,
  message: string,
  index: number
): SchemaValidationIssue {
  const parsedPath = parseInvalidSchemaPath(message);
  const fieldId = mapModelSchemaErrorToFieldId(message);
  const sectionId = parsedPath ? sectionForValidationPath(parsedPath.path) : fieldId ? sectionForFieldId(fieldId) : sectionForMessage(message);
  const path = parsedPath?.path ?? fieldId ?? "schema";

  const unsafeKey = parseUnsafeMetadataKey(message);
  if (unsafeKey) {
    return {
      id: issueId("unsafe-metadata", index, message),
      title: `Unsafe metadata key: ${unsafeKey}`,
      category: "Unsafe metadata",
      severity: "error",
      sectionId: "notes",
      fieldId: metadataFieldId(draft, unsafeKey),
      path: `metadata.${unsafeKey}`,
      explanation: "The model-schema validator rejects keys associated with runtime payloads, executable code, profiling, protected-class inference, persuasion, datasets, proofs, calibration, LLMs, or biographies.",
      whyItMatters:
        "Leaving these keys in structural artifacts would invite false runtime-support claims, unsafe profiling semantics, or hidden execution coupling.",
      originalMessage: message,
      suggestion: topLevelMetadataHasKey(draft, unsafeKey) && !isPrototypePollutionKey(unsafeKey)
        ? {
            id: repairId("remove-metadata", unsafeKey),
            label: `Remove unsafe metadata key ${unsafeKey}`,
            actionLabel: "Remove unsafe metadata key",
            canApply: true,
            riskLevel: "confirmation",
            requiresConfirmation: true,
            summary: `Remove the top-level metadata key ${unsafeKey}.`,
            preview: `The metadata entry ${unsafeKey} will be deleted from the current draft only.`,
            disabledReason: null,
            patch: { kind: "removeTopLevelMetadataKey", key: unsafeKey, draftHash }
          }
        : manualRepair("unsafe-metadata", unsafeKey, "Remove or rename the unsafe key in the section where it appears."),
      manualGuidance: "Delete the unsafe metadata field or replace it with bounded, inert transparency text.",
      boundaryNotice: schemaValidationRepairBoundaryPhrases[0]
    };
  }

  const duplicate = parseDuplicateId(message);
  if (duplicate) {
    return {
      id: issueId("duplicate-id", index, message),
      title: `Duplicate ${duplicate.label} id`,
      category: "Duplicate identifiers",
      severity: "error",
      sectionId,
      fieldId,
      path,
      explanation: `The id ${duplicate.id} appears more than once in the same declaration family.`,
      whyItMatters: "ORTUS cannot infer whether duplicate declarations are the same concept, two distinct concepts, or an accidental placeholder.",
      originalMessage: message,
      suggestion: manualRepair(
        "duplicate-id",
        duplicate.id,
        "Choose the intended declaration manually, then rename or remove duplicates with domain intent preserved."
      ),
      manualGuidance: "Review the duplicated declarations. Rename one only when it truly represents a distinct model concept.",
      boundaryNotice: schemaValidationRepairBoundaryPhrases[2]
    };
  }

  const reference = parseUnknownReference(message);
  if (reference) {
    return {
      id: issueId("unknown-reference", index, message),
      title: `Unknown ${reference.referenceKind}`,
      category: "Broken references",
      severity: "error",
      sectionId,
      fieldId,
      path,
      explanation: `${reference.sourceLabel} references ${reference.missingId}, but no matching declaration exists in this schema.`,
      whyItMatters: "Creating or removing a reference changes model intent; ORTUS cannot infer the correct target declaration.",
      originalMessage: message,
      suggestion: manualRepair(
        "unknown-reference",
        reference.missingId,
        "Add the missing declaration or remove the reference only after deciding the modeling intent."
      ),
      manualGuidance: "Jump to the referenced section and either add the missing structural declaration or remove the reference manually.",
      boundaryNotice: schemaValidationRepairBoundaryPhrases[2]
    };
  }

  const executablePatch = parsedPath ? executablePatchForPath(draft, draftHash, parsedPath.path) : null;
  if (executablePatch) {
    return {
      id: issueId("executable-payload", index, message),
      title: "Executable flag rejected",
      category: "Execution safety",
      severity: "error",
      sectionId,
      fieldId,
      path,
      explanation: "Model-schema declarations must be inert and declare executable as false.",
      whyItMatters: "Allowing executable payloads would blur structural authoring into hidden runtime behavior.",
      originalMessage: message,
      suggestion: {
            id: repairId("clear-executable", path),
            label: "Set executable to false",
            actionLabel: "Clear unsafe payload",
            canApply: true,
            riskLevel: "safe",
            requiresConfirmation: false,
        summary: "Set the rejected executable flag back to false.",
        preview: "Only the executable boolean is changed; no rule text, metadata, template, or runtime state is touched.",
        disabledReason: null,
        patch: executablePatch
      },
      manualGuidance: "Keep rule declarations descriptive and non-executable.",
      boundaryNotice: schemaValidationRepairBoundaryPhrases[0]
    };
  }

  const invalidEnum = parsedPath?.detail.toLowerCase().includes("invalid enum value");
  const oversized = message.includes("characters or less");
  const required = parsedPath?.detail.toLowerCase().includes("required") || parsedPath?.detail.toLowerCase().includes("at least 1 character");
  const category = invalidEnum
    ? "Invalid option"
      : oversized
        ? "Size limits"
        : required
          ? "Missing required structure"
          : "Other structural issues";

  return {
    id: issueId("validation-error", index, message),
    title: issueTitleFromMessage(category, parsedPath?.path ?? message),
    category,
    severity: "error",
    sectionId,
    fieldId,
    path,
    explanation: parsedPath?.detail ?? message,
    whyItMatters: "The serializer only exports schemas that pass the headless model-schema validator.",
    originalMessage: message,
    suggestion: manualRepair(
      "structural-validation",
      path,
      "Edit the field manually. ORTUS cannot infer the correct model behavior from a validation error."
    ),
    manualGuidance: "Use the field guidance and service validation message to make an explicit structural edit.",
    boundaryNotice: schemaValidationRepairBoundaryPhrases[2]
  };
}

function collectNormalizationSuggestions(
  draft: ModelSchemaDefinition,
  draftHash: string,
  startIndex: number
): readonly SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];
  const topLevelFields = ["id", "name", "version", "description"] as const;
  for (const field of topLevelFields) {
    const value = draft[field];
    if (typeof value !== "string") {
      continue;
    }
    const trimmed = value.trim();
    if (!trimmed || trimmed === value) {
      continue;
    }
    issues.push({
      id: issueId("normalize-top-level", startIndex + issues.length, `${field}:${value}`),
      title: `Normalize ${field}`,
      category: "Structural cleanup suggestions",
      severity: "info",
      sectionId: "identity",
      fieldId: `schema-identity-${field}`,
      path: field,
      explanation: "Leading or trailing whitespace can create confusing ids and labels when schemas are exchanged.",
      whyItMatters: "This is a formatting repair only; it does not infer model behavior or runtime support.",
      originalMessage: "Whitespace normalization suggestion generated from the current draft.",
      suggestion: {
        id: repairId("trim-top-level", field),
        label: `Trim whitespace from ${field}`,
        actionLabel: field === "id" ? "Normalize identifier" : "Apply structural edit",
        canApply: true,
        riskLevel: "safe",
        requiresConfirmation: false,
        summary: `Trim leading and trailing whitespace from ${field}.`,
        preview: `${JSON.stringify(value)} becomes ${JSON.stringify(trimmed)}.`,
        disabledReason: null,
        patch: { kind: "trimTopLevelString", field, from: value, to: trimmed, draftHash }
      },
      manualGuidance: "Review the cleaned text if the surrounding whitespace had intentional meaning.",
      boundaryNotice: schemaValidationRepairBoundaryPhrases[0]
    });
  }

  for (const collection of editableIdCollections) {
    const declarations = readEditableIdCollection(draft, collection);
    declarations.forEach((item, index) => {
      if (!item || typeof item.id !== "string") {
        return;
      }
      const trimmed = item.id.trim();
      if (!trimmed || trimmed === item.id) {
        return;
      }
      issues.push({
        id: issueId("normalize-declaration", startIndex + issues.length, `${collection}:${index}:${item.id}`),
        title: `Normalize ${collection} id`,
        category: "Structural cleanup suggestions",
        severity: "info",
        sectionId: repeatedSectionByKey[collection],
        fieldId: `schema-${collection}-${index}-id`,
        path: `${collection}.${index}.id`,
        explanation: "The declaration id has leading or trailing whitespace.",
        whyItMatters: "Trimming an id is structural cleanup; it does not create template support, behavior, or empirical validity.",
        originalMessage: "Whitespace normalization suggestion generated from the current draft.",
        suggestion: {
          id: repairId("trim-declaration-id", `${collection}-${index}`),
          label: `Trim whitespace from ${collection} ${index + 1} id`,
          actionLabel: "Normalize identifier",
          canApply: true,
          riskLevel: "safe",
          requiresConfirmation: false,
          summary: `Trim leading and trailing whitespace from ${collection} item ${index + 1}.`,
          preview: `${JSON.stringify(item.id)} becomes ${JSON.stringify(trimmed)}.`,
          disabledReason: null,
          patch: { kind: "trimDeclarationId", collection, index, from: item.id, to: trimmed, draftHash }
        },
        manualGuidance: "Confirm the normalized id still matches any explicit references you intend to keep.",
        boundaryNotice: schemaValidationRepairBoundaryPhrases[0]
      });
    });
  }
  return issues;
}

function collectExecutablePayloadSuggestions(
  draft: ModelSchemaDefinition,
  draftHash: string,
  startIndex: number
): readonly SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];
  const collections: readonly ModelSchemaRepeatedKey[] = [
    "entityTypes",
    "componentTypes",
    "attributeTypes",
    "spaces",
    "parameters",
    "metrics",
    "ruleDeclarations",
    "artifactReferences"
  ];
  for (const collection of collections) {
    const declarations = (draft[collection] ?? []) as readonly { executable?: unknown; id?: unknown }[];
    declarations.forEach((item, index) => {
      if (item.executable !== true) {
        return;
      }
      issues.push({
        id: issueId("executable-current-draft", startIndex + issues.length, `${collection}:${index}`),
        title: "Executable flag present",
        category: "Execution safety",
        severity: "error",
        sectionId: repeatedSectionByKey[collection],
        fieldId: `schema-${collection}-${index}-executable`,
        path: `${collection}.${index}.executable`,
        explanation: "The current draft contains an executable flag set to true, which violates the model-schema contract.",
        whyItMatters: "Schema authoring cannot become a hidden interpreter or custom runtime.",
        originalMessage: "Executable true detected in the current draft.",
        suggestion: {
          id: repairId("clear-executable", `${collection}-${index}`),
          label: "Set executable to false",
          actionLabel: "Clear unsafe payload",
          canApply: true,
          riskLevel: "safe",
          requiresConfirmation: false,
          summary: "Set executable to false on this declaration.",
          preview: "Only the executable boolean is changed; no rule text, metadata, template, or runtime state is touched.",
          disabledReason: null,
          patch: { kind: "setDeclarationExecutableFalse", collection, index, draftHash }
        },
        manualGuidance: "Keep executable false and describe behavior only in inert text fields.",
        boundaryNotice: schemaValidationRepairBoundaryPhrases[0]
      });
    });
  }
  return issues;
}

function createBoundaryIssue(severity: SchemaValidationSeverity, message: string, index: number): SchemaValidationIssue {
  const socialSafety = /social|cognitive|belief|memory|llm|person|profil|protected|diagnos|persuasion|target/i.test(message);
  return {
    id: issueId(socialSafety ? "social-boundary" : "runtime-boundary", index, message),
    title: socialSafety ? "Social/cognitive boundary" : "Runtime boundary",
    category: socialSafety ? "Social/cognitive boundary" : "Runtime boundaries",
    severity,
    sectionId: socialSafety ? "rules" : "identity",
    fieldId: null,
    path: "validation report",
    explanation: message,
    whyItMatters: socialSafety
      ? "Social and cognitive descriptors are not human minds, real-person profiles, protected-class inference, or persuasion systems."
      : "Structural validity is not runtime readiness, scientific validation, calibration, or proof.",
    originalMessage: message,
    suggestion: null,
    manualGuidance: "Keep this warning visible near authored structure; do not treat it as a repair target.",
    boundaryNotice: schemaValidationRepairBoundaryPhrases[1]
  };
}

function createMissingCapabilityIssue(capability: string, index: number): SchemaValidationIssue {
  return {
    id: issueId("missing-capability", index, capability),
    title: `Missing runtime capability: ${capability}`,
    category: "Missing runtime capabilities",
    severity: "info",
    sectionId: "identity",
    fieldId: null,
    path: "capability report",
    explanation: `${capability} is not implemented for model-schema authoring.`,
    whyItMatters: "Global service availability must not be confused with template runtime support.",
    originalMessage: capability,
    suggestion: null,
    manualGuidance: "Disclose the missing capability. Do not add run, compile, preview, generate, or apply actions.",
    boundaryNotice: schemaValidationRepairBoundaryPhrases[3]
  };
}

function applySchemaRepairPatch(draft: ModelSchemaDefinition, patch: SchemaRepairPatch): boolean {
  switch (patch.kind) {
    case "trimTopLevelString":
      if (draft[patch.field] !== patch.from) {
        return false;
      }
      return assignTopLevelString(draft, patch.field, patch.to);
    case "trimDeclarationId":
      return assignDeclarationId(draft, patch.collection, patch.index, patch.from, patch.to);
    case "removeTopLevelMetadataKey":
      if (!topLevelMetadataHasKey(draft, patch.key)) {
        return false;
      }
      draft.metadata = Object.fromEntries(Object.entries(draft.metadata ?? {}).filter(([key]) => key !== patch.key)) as Record<string, JsonValue>;
      return true;
    case "setDeclarationExecutableFalse":
      return setDeclarationExecutableFalse(draft, patch.collection, patch.index);
  }
}

function assignTopLevelString(
  draft: ModelSchemaDefinition,
  field: "id" | "name" | "version" | "description",
  value: string
): boolean {
  draft[field] = value;
  return true;
}

function assignDeclarationId(
  draft: ModelSchemaDefinition,
  collection: EditableIdCollectionKey,
  index: number,
  from: string,
  to: string
): boolean {
  const declarations = readEditableIdCollection(draft, collection);
  const declaration = declarations[index];
  if (!declaration || declaration.id !== from) {
    return false;
  }
  const nextDeclarations = declarations.map((item, itemIndex) => (itemIndex === index ? { ...item, id: to } : item));
  assignEditableIdCollection(draft, collection, nextDeclarations);
  return true;
}

function setDeclarationExecutableFalse(draft: ModelSchemaDefinition, collection: ModelSchemaRepeatedKey, index: number): boolean {
  const declarations = [...((draft[collection] ?? []) as unknown as readonly Record<string, unknown>[])];
  const declaration = declarations[index];
  if (!declaration || declaration.executable !== true) {
    return false;
  }
  declarations[index] = { ...declaration, executable: false };
  (draft as unknown as Record<string, unknown>)[collection] = declarations;
  return true;
}

function readEditableIdCollection(draft: ModelSchemaDefinition, collection: EditableIdCollectionKey): readonly { id: string }[] {
  return ((draft as unknown as Record<EditableIdCollectionKey, readonly { id: string }[] | undefined>)[collection] ?? []) as readonly {
    id: string;
  }[];
}

function assignEditableIdCollection(
  draft: ModelSchemaDefinition,
  collection: EditableIdCollectionKey,
  values: readonly { id: string }[]
): void {
  (draft as unknown as Record<EditableIdCollectionKey, readonly { id: string }[]>)[collection] = values;
}

function executablePatchForPath(
  draft: ModelSchemaDefinition,
  draftHash: string,
  path: string
): Extract<SchemaRepairPatch, { kind: "setDeclarationExecutableFalse" }> | null {
  const match = path.match(/^([A-Za-z]+)\.(\d+)\.executable$/);
  if (!match) {
    return null;
  }
  const [, collection, rawIndex] = match;
  if (!isRepeatedKey(collection)) {
    return null;
  }
  const index = Number(rawIndex);
  const declarations = (draft[collection] ?? []) as readonly { executable?: unknown }[];
  if (declarations[index]?.executable !== true) {
    return null;
  }
  return { kind: "setDeclarationExecutableFalse", collection, index, draftHash };
}

function groupIssues(issues: readonly SchemaValidationIssue[]): readonly SchemaValidationIssueGroup[] {
  const groups = new Map<string, SchemaValidationIssue[]>();
  for (const issue of issues) {
    const key = groupId(issue.category);
    groups.set(key, [...(groups.get(key) ?? []), issue]);
  }
  return Array.from(groups.entries())
    .map(([id, groupIssuesForId], index) => ({
      id,
      title: groupIssuesForId[0]?.category ?? id,
      count: groupIssuesForId.length,
      highestSeverity: groupIssuesForId.reduce<SchemaValidationSeverity>(
        (highest, issue) => (severityRank[issue.severity] > severityRank[highest] ? issue.severity : highest),
        "info"
      ),
      issues: groupIssuesForId,
      order: schemaIssueCategoryOrder.get(groupIssuesForId[0]?.category ?? "") ?? 1_000,
      firstSeen: index
    }))
    .sort((left, right) => left.order - right.order || left.firstSeen - right.firstSeen || left.title.localeCompare(right.title))
    .map((group) => ({
      id: group.id,
      title: group.title,
      count: group.count,
      highestSeverity: group.highestSeverity,
      issues: group.issues
    }));
}

function repairFailure(draft: ModelSchemaDefinition, message: string): SchemaRepairApplicationResult {
  return {
    applied: false,
    draft,
    report: getModelInterpreterCapabilityReport(draft),
    message
  };
}

function manualRepair(idPart: string, value: string, summary: string): SchemaRepairSuggestion {
  return {
    id: repairId(idPart, value),
    label: "Manual repair required",
    actionLabel: "Apply structural edit",
    canApply: false,
    riskLevel: "manualOnly",
    requiresConfirmation: false,
    summary,
    preview: "No automatic edit is available because ORTUS cannot infer the intended model semantics.",
    disabledReason: "Manual-only: modeling intent is ambiguous.",
    patch: null
  };
}

function parseInvalidSchemaPath(message: string): { path: string; detail: string } | null {
  const match = message.match(/^Invalid model schema: ([^:]+): (.+)$/);
  return match ? { path: match[1] ?? "schema", detail: match[2] ?? message } : null;
}

function parseUnsafeMetadataKey(message: string): string | null {
  const match = message.match(/ key ([^\s]+)$/);
  return match?.[1] ?? null;
}

function parseDuplicateId(message: string): { label: string; id: string } | null {
  const match = message.match(/^Duplicate (entity type|component type|attribute type|space|parameter|metric|rule declaration|artifact reference) id: (.+)$/);
  return match ? { label: match[1] ?? "declaration", id: match[2] ?? "" } : null;
}

function parseUnknownReference(message: string): { sourceLabel: string; referenceKind: string; missingId: string } | null {
  const match = message.match(/^(Entity type .+|Component type .+|Rule declaration .+) references unknown ([A-Za-z]+): (.+)$/);
  return match ? { sourceLabel: match[1] ?? "Declaration", referenceKind: match[2] ?? "reference", missingId: match[3] ?? "" } : null;
}

function sectionForValidationPath(path: string): ModelSchemaAuthoringSectionId {
  const root = path.split(".")[0] ?? "id";
  return validationPathRootToSection[root] ?? "identity";
}

function sectionForMessage(message: string): ModelSchemaAuthoringSectionId {
  if (message.startsWith("Entity type ")) {
    return "entities";
  }
  if (message.startsWith("Component type ")) {
    return "components";
  }
  if (message.startsWith("Rule declaration ")) {
    return "rules";
  }
  return "identity";
}

export function sectionForFieldId(fieldId: string): ModelSchemaAuthoringSectionId {
  if (fieldId.includes("entityTypes") || fieldId.endsWith("-entities")) {
    return "entities";
  }
  if (fieldId.includes("componentTypes") || fieldId.endsWith("-components")) {
    return "components";
  }
  if (fieldId.includes("attributeTypes") || fieldId.endsWith("-attributes")) {
    return "attributes";
  }
  if (fieldId.includes("-spaces")) {
    return "spaces";
  }
  if (fieldId.includes("-parameters")) {
    return "parameters";
  }
  if (fieldId.includes("-metrics")) {
    return "metrics";
  }
  if (fieldId.includes("ruleDeclarations") || fieldId.endsWith("-rules")) {
    return "rules";
  }
  if (fieldId.includes("artifactReferences") || fieldId.endsWith("-artifacts")) {
    return "artifacts";
  }
  if (
    fieldId.includes("assumptionNotes") ||
    fieldId.includes("limitationNotes") ||
    fieldId.includes("validationNotes") ||
    fieldId.endsWith("-notes")
  ) {
    return "notes";
  }
  return "identity";
}

function metadataFieldId(draft: ModelSchemaDefinition, key: string): string | null {
  const index = Object.keys(draft.metadata ?? {}).findIndex((candidate) => candidate === key);
  return index >= 0 ? `schema-metadata-${index}-key` : "schema-section-notes";
}

function topLevelMetadataHasKey(draft: ModelSchemaDefinition, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(draft.metadata ?? {}, key);
}

function isRepeatedKey(value: string | undefined): value is ModelSchemaRepeatedKey {
  return (
    value === "entityTypes" ||
    value === "componentTypes" ||
    value === "attributeTypes" ||
    value === "spaces" ||
    value === "parameters" ||
    value === "metrics" ||
    value === "ruleDeclarations" ||
    value === "artifactReferences"
  );
}

function isEditableIdCollection(value: unknown): value is EditableIdCollectionKey {
  return typeof value === "string" && editableIdCollections.includes(value as EditableIdCollectionKey);
}

function isTopLevelStringField(value: unknown): value is "id" | "name" | "version" | "description" {
  return value === "id" || value === "name" || value === "version" || value === "description";
}

function isSchemaRepairPatch(value: unknown): value is SchemaRepairPatch {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const patch = value as Record<string, unknown>;
  if (typeof patch.draftHash !== "string") {
    return false;
  }
  switch (patch.kind) {
    case "trimTopLevelString":
      return isTopLevelStringField(patch.field) && typeof patch.from === "string" && typeof patch.to === "string";
    case "trimDeclarationId":
      return (
        isEditableIdCollection(patch.collection) &&
        Number.isInteger(patch.index) &&
        Number(patch.index) >= 0 &&
        typeof patch.from === "string" &&
        typeof patch.to === "string"
      );
    case "removeTopLevelMetadataKey":
      return typeof patch.key === "string";
    case "setDeclarationExecutableFalse":
      return isRepeatedKey(typeof patch.collection === "string" ? patch.collection : undefined) && Number.isInteger(patch.index) && Number(patch.index) >= 0;
    default:
      return false;
  }
}

function patchTargetsPrototype(patch: SchemaRepairPatch): boolean {
  return patch.kind === "removeTopLevelMetadataKey" && isPrototypePollutionKey(patch.key);
}

function isPrototypePollutionKey(key: string): boolean {
  const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return normalized === "proto" || normalized === "prototype" || normalized === "constructor";
}

function issueTitleFromMessage(category: string, path: string): string {
  return `${category}: ${path}`;
}

function groupId(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function issueId(prefix: string, index: number, message: string): string {
  return `schema-validation-${prefix}-${index}-${hashText(message)}`;
}

function repairId(prefix: string, value: string): string {
  return `schema-repair-${prefix}-${hashText(value)}`;
}

function hashText(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function cloneDraft(draft: ModelSchemaDefinition): ModelSchemaDefinition {
  return JSON.parse(JSON.stringify(draft)) as ModelSchemaDefinition;
}
