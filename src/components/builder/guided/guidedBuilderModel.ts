import {
  modelSchemaArtifactType,
  validateModelSchemaDefinition,
  type ModelEntityKind,
  type ModelParameterValueKind,
  type ModelRuleKind,
  type ModelSchemaDefinition,
  type ModelSpaceKind,
  type ModelValueKind
} from "../../../simulation/modelSchema";
import { createModelSchemaDraftView, type ModelSchemaDraftView } from "../modelSchemaAuthoring";

export const guidedBuilderSteps = [
  {
    id: "purpose",
    label: "Model purpose",
    technicalLabel: "ModelSchemaDefinition identity and limitation notes"
  },
  {
    id: "entities",
    label: "Entities and state",
    technicalLabel: "EntityTypeDeclaration and AttributeTypeDeclaration"
  },
  {
    id: "space",
    label: "Environment and space",
    technicalLabel: "SpaceDeclaration"
  },
  {
    id: "rules",
    label: "Rules and interactions",
    technicalLabel: "Non-executable RuleDeclaration"
  },
  {
    id: "startingConditions",
    label: "Starting conditions",
    technicalLabel: "ParameterDeclaration and assumption notes"
  },
  {
    id: "review",
    label: "Review",
    technicalLabel: "ortus.modelSchema structural validation"
  }
] as const;

export type GuidedBuilderStepId = (typeof guidedBuilderSteps)[number]["id"];

export const guidedEntityKinds = [
  { value: "agent", label: "Agent" },
  { value: "cell", label: "Cell" },
  { value: "node", label: "Network node" },
  { value: "resourceStock", label: "Resource stock" },
  { value: "aggregate", label: "Aggregate" },
  { value: "environment", label: "Environment" }
] as const satisfies readonly { value: ModelEntityKind; label: string }[];

export type GuidedEntityKind = (typeof guidedEntityKinds)[number]["value"];

export const guidedValueKinds = [
  { value: "number", label: "Number" },
  { value: "integer", label: "Integer" },
  { value: "boolean", label: "Boolean" },
  { value: "string", label: "Text" },
  { value: "category", label: "Category" }
] as const satisfies readonly { value: ModelValueKind; label: string }[];

export type GuidedValueKind = (typeof guidedValueKinds)[number]["value"];

export const guidedSpaceKinds = [
  { value: "none", label: "No explicit space" },
  { value: "abstract", label: "Abstract space" },
  { value: "grid2d", label: "Two-dimensional grid" },
  { value: "continuous2d", label: "Two-dimensional continuous space" },
  { value: "network", label: "Network space" }
] as const satisfies readonly { value: "none" | ModelSpaceKind; label: string }[];

export type GuidedSpaceKind = (typeof guidedSpaceKinds)[number]["value"];

export const guidedRuleKinds = [
  { value: "agentBehavior", label: "Entity behavior" },
  { value: "stateTransition", label: "State transition" },
  { value: "interaction", label: "Interaction" },
  { value: "movement", label: "Movement" },
  { value: "observation", label: "Observation" },
  { value: "custom", label: "Other structural rule" }
] as const satisfies readonly { value: ModelRuleKind; label: string }[];

export type GuidedRuleKind = (typeof guidedRuleKinds)[number]["value"];

export const guidedParameterValueKinds = [
  { value: "number", label: "Number" },
  { value: "integer", label: "Integer" },
  { value: "boolean", label: "Boolean" },
  { value: "category", label: "Category" },
  { value: "string", label: "Text" }
] as const satisfies readonly { value: ModelParameterValueKind; label: string }[];

export type GuidedParameterValueKind = (typeof guidedParameterValueKinds)[number]["value"];

export const guidedBuilderLimits = Object.freeze({
  entities: 12,
  stateFieldsPerEntity: 12,
  rules: 16,
  parameters: 16
});

export interface GuidedStateFieldDraft {
  key: string;
  name: string;
  valueKind: GuidedValueKind;
  defaultValueDescription: string;
}

export interface GuidedEntityDraft {
  key: string;
  name: string;
  description: string;
  entityKind: GuidedEntityKind;
  stateFields: readonly GuidedStateFieldDraft[];
}

export interface GuidedSpaceDraft {
  kind: GuidedSpaceKind;
  name: string;
  coordinateDescription: string;
}

export interface GuidedRuleDraft {
  key: string;
  name: string;
  description: string;
  ruleKind: GuidedRuleKind;
  sourceEntityKey: string;
  targetEntityKey: string;
}

export interface GuidedParameterDraft {
  key: string;
  name: string;
  valueKind: GuidedParameterValueKind;
  defaultValueDescription: string;
  rangeDescription: string;
}

export interface GuidedBuilderDraft {
  modelName: string;
  modelDescription: string;
  limitation: string;
  entities: readonly GuidedEntityDraft[];
  space: GuidedSpaceDraft;
  rules: readonly GuidedRuleDraft[];
  parameters: readonly GuidedParameterDraft[];
  startingConditionAssumption: string;
}

export type GuidedIssueSeverity = "error" | "warning";

export interface GuidedBuilderIssue {
  id: string;
  stepId: GuidedBuilderStepId;
  fieldId: string;
  severity: GuidedIssueSeverity;
  message: string;
}

export interface GuidedBuilderReview {
  candidate: ModelSchemaDefinition;
  serviceView: ModelSchemaDraftView;
  issues: readonly GuidedBuilderIssue[];
  errors: readonly GuidedBuilderIssue[];
  warnings: readonly GuidedBuilderIssue[];
  structurallyValid: boolean;
  canHandoff: boolean;
}

export interface GuidedBuilderHandoffResult {
  artifact: ModelSchemaDefinition | null;
  review: GuidedBuilderReview;
}

export function createGuidedBuilderDraft(): GuidedBuilderDraft {
  return {
    modelName: "",
    modelDescription: "",
    limitation: "",
    entities: [createGuidedEntityDraft("entity-1")],
    space: {
      kind: "none",
      name: "",
      coordinateDescription: ""
    },
    rules: [],
    parameters: [],
    startingConditionAssumption: ""
  };
}

export function createGuidedEntityDraft(key: string): GuidedEntityDraft {
  return {
    key,
    name: "",
    description: "",
    entityKind: "agent",
    stateFields: []
  };
}

export function createGuidedStateFieldDraft(key: string): GuidedStateFieldDraft {
  return {
    key,
    name: "",
    valueKind: "number",
    defaultValueDescription: ""
  };
}

export function createGuidedRuleDraft(key: string): GuidedRuleDraft {
  return {
    key,
    name: "",
    description: "",
    ruleKind: "interaction",
    sourceEntityKey: "",
    targetEntityKey: ""
  };
}

export function createGuidedParameterDraft(key: string): GuidedParameterDraft {
  return {
    key,
    name: "",
    valueKind: "number",
    defaultValueDescription: "",
    rangeDescription: ""
  };
}

export function nextGuidedDraftKey(prefix: "entity" | "state" | "rule" | "parameter", keys: readonly string[]): string {
  const maxIndex = keys.reduce((highest, key) => {
    const match = key.match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `${prefix}-${maxIndex + 1}`;
}

export function isGuidedBuilderDraftMeaningful(draft: GuidedBuilderDraft): boolean {
  return JSON.stringify(draft) !== JSON.stringify(createGuidedBuilderDraft());
}

export function getNextGuidedBuilderStep(stepId: GuidedBuilderStepId): GuidedBuilderStepId {
  const index = guidedBuilderSteps.findIndex((step) => step.id === stepId);
  return guidedBuilderSteps[Math.min(index + 1, guidedBuilderSteps.length - 1)]!.id;
}

export function getPreviousGuidedBuilderStep(stepId: GuidedBuilderStepId): GuidedBuilderStepId {
  const index = guidedBuilderSteps.findIndex((step) => step.id === stepId);
  return guidedBuilderSteps[Math.max(index - 1, 0)]!.id;
}

export function createDeterministicStructuralIds(prefix: string, labels: readonly string[]): readonly string[] {
  const counts = new Map<string, number>();
  return labels.map((label) => {
    const base = `${normalizeStructuralIdPart(prefix, 28)}-${normalizeStructuralIdPart(label, 124)}`.slice(0, 153);
    const occurrence = (counts.get(base) ?? 0) + 1;
    counts.set(base, occurrence);
    return occurrence === 1 ? base : `${base.slice(0, 156 - String(occurrence).length)}-${occurrence}`;
  });
}

export function assembleGuidedModelSchemaCandidate(draft: GuidedBuilderDraft): ModelSchemaDefinition {
  const modelId = createDeterministicStructuralIds("model", [draft.modelName])[0]!;
  const entityIds = createDeterministicStructuralIds(
    "entity",
    draft.entities.map((entity) => entity.name)
  );
  const entityIdByKey = new Map(draft.entities.map((entity, index) => [entity.key, entityIds[index]!]));
  const spaceId = draft.space.kind === "none" ? null : createDeterministicStructuralIds("space", [draft.space.name])[0]!;
  const stateEntries = draft.entities.flatMap((entity) => entity.stateFields.map((field) => ({ entity, field })));
  const attributeIds = createDeterministicStructuralIds(
    "attribute",
    stateEntries.map(({ entity, field }) => `${entity.name}-${field.name}`)
  );
  const attributeTypes = stateEntries.map(({ field }, index) => ({
    id: attributeIds[index]!,
    label: field.name,
    valueKind: field.valueKind,
    ...(hasText(field.defaultValueDescription) ? { defaultValueDescription: field.defaultValueDescription } : {}),
    active: true,
    executable: false as const
  }));
  const attributeIdsByEntityKey = new Map(draft.entities.map((entity) => [entity.key, [] as string[]]));
  stateEntries.forEach(({ entity }, index) => attributeIdsByEntityKey.get(entity.key)!.push(attributeIds[index]!));
  const ruleIds = createDeterministicStructuralIds(
    "rule",
    draft.rules.map((rule) => rule.name)
  );
  const parameterIds = createDeterministicStructuralIds(
    "parameter",
    draft.parameters.map((parameter) => parameter.name)
  );

  return {
    artifactType: modelSchemaArtifactType,
    id: modelId,
    name: draft.modelName,
    description: draft.modelDescription,
    version: "1.0.0",
    schemaVersion: "1",
    entityTypes: draft.entities.map((entity, index) => ({
      id: entityIds[index]!,
      label: entity.name,
      entityKind: entity.entityKind,
      ...(hasText(entity.description) ? { description: entity.description } : {}),
      ...(entity.stateFields.length > 0 ? { attributeTypeIds: attributeIdsByEntityKey.get(entity.key) } : {}),
      ...(spaceId ? { spaceIds: [spaceId] } : {}),
      active: true,
      executable: false as const
    })),
    componentTypes: [],
    attributeTypes,
    spaces:
      draft.space.kind === "none"
        ? []
        : [
            {
              id: spaceId!,
              label: draft.space.name,
              spaceKind: draft.space.kind,
              ...(hasText(draft.space.coordinateDescription) ? { coordinateDescription: draft.space.coordinateDescription } : {}),
              active: true,
              executable: false as const
            }
          ],
    parameters: draft.parameters.map((parameter, index) => ({
      id: parameterIds[index]!,
      label: parameter.name,
      valueKind: parameter.valueKind,
      ...(hasText(parameter.defaultValueDescription) ? { defaultValueDescription: parameter.defaultValueDescription } : {}),
      ...(hasText(parameter.rangeDescription) ? { rangeDescription: parameter.rangeDescription } : {}),
      active: true,
      executable: false as const
    })),
    metrics: [],
    ruleDeclarations: draft.rules.map((rule, index) => ({
      id: ruleIds[index]!,
      label: rule.name,
      ruleKind: rule.ruleKind,
      ...(rule.sourceEntityKey
        ? { sourceEntityTypeIds: [entityIdByKey.get(rule.sourceEntityKey) ?? `missing-entity-${rule.sourceEntityKey}`] }
        : {}),
      ...(rule.targetEntityKey
        ? { targetEntityTypeIds: [entityIdByKey.get(rule.targetEntityKey) ?? `missing-entity-${rule.targetEntityKey}`] }
        : {}),
      ruleDescription: rule.description,
      active: true,
      executable: false as const
    })),
    artifactReferences: [],
    assumptionNotes: hasText(draft.startingConditionAssumption)
      ? [
          {
            id: createDeterministicStructuralIds("assumption", [draft.modelName])[0]!,
            label: "Guided starting-condition assumption",
            description: draft.startingConditionAssumption,
            severity: "caution",
            category: "starting conditions",
            confidence: "unknown"
          }
        ]
      : [],
    limitationNotes: hasText(draft.limitation)
      ? [
          {
            id: createDeterministicStructuralIds("limitation", [draft.modelName])[0]!,
            label: "Guided model limitation",
            description: draft.limitation,
            severity: "caution",
            category: "scope"
          }
        ]
      : [],
    validationNotes: []
  };
}

export function createGuidedBuilderReview(draft: GuidedBuilderDraft): GuidedBuilderReview {
  const candidate = assembleGuidedModelSchemaCandidate(draft);
  const serviceView = createModelSchemaDraftView(candidate);
  const issues = validateGuidedBuilderDraft(draft);
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const structurallyValid = errors.length === 0 && serviceView.structurallyValid;
  return {
    candidate,
    serviceView,
    issues,
    errors,
    warnings,
    structurallyValid,
    canHandoff: structurallyValid
  };
}

export function createGuidedBuilderHandoff(draft: GuidedBuilderDraft): GuidedBuilderHandoffResult {
  const review = createGuidedBuilderReview(draft);
  if (!review.canHandoff) {
    return { artifact: null, review };
  }
  return {
    artifact: validateModelSchemaDefinition(review.candidate),
    review
  };
}

export function validateGuidedBuilderDraft(draft: GuidedBuilderDraft): readonly GuidedBuilderIssue[] {
  const issues: GuidedBuilderIssue[] = [];

  requiredTextIssue(issues, "purpose", "guided-model-name", "Model name", draft.modelName, 180);
  reservedNameIssue(issues, "purpose", "guided-model-name", "Model name", draft.modelName);
  requiredTextIssue(issues, "purpose", "guided-model-description", "Short description", draft.modelDescription, 2_000);
  optionalTextLengthIssue(issues, "purpose", "guided-model-limitation", "Limitation", draft.limitation, 900);
  if (!hasText(draft.limitation)) {
    issues.push(warning("purpose", "guided-model-limitation", "No explicit limitation has been recorded. Advanced review is recommended."));
  }

  if (draft.entities.length === 0) {
    issues.push(error("entities", "guided-entity-list", "At least one entity type is required."));
  }
  duplicateNameIssues(
    issues,
    "entities",
    draft.entities.map((entity) => ({ fieldId: `guided-entity-${entity.key}-name`, name: entity.name })),
    "Entity name"
  );
  for (const entity of draft.entities) {
    const entityNameId = `guided-entity-${entity.key}-name`;
    requiredTextIssue(issues, "entities", entityNameId, "Entity name", entity.name, 180);
    reservedNameIssue(issues, "entities", entityNameId, "Entity name", entity.name);
    optionalTextLengthIssue(issues, "entities", `guided-entity-${entity.key}-description`, "Entity description", entity.description, 2_000);
    duplicateNameIssues(
      issues,
      "entities",
      entity.stateFields.map((field) => ({ fieldId: `guided-state-${field.key}-name`, name: field.name })),
      `State-field name for ${entity.name || "unnamed entity"}`
    );
    for (const field of entity.stateFields) {
      const fieldNameId = `guided-state-${field.key}-name`;
      requiredTextIssue(issues, "entities", fieldNameId, "State-field name", field.name, 180);
      reservedNameIssue(issues, "entities", fieldNameId, "State-field name", field.name);
      optionalTextLengthIssue(
        issues,
        "entities",
        `guided-state-${field.key}-default`,
        "State default description",
        field.defaultValueDescription,
        800
      );
      if (hasText(field.defaultValueDescription) && !isValidTypedDefault(field.defaultValueDescription, field.valueKind)) {
        issues.push(
          error(
            "entities",
            `guided-state-${field.key}-default`,
            typedDefaultMessage("State default", field.valueKind)
          )
        );
      }
    }
  }

  if (draft.space.kind !== "none") {
    requiredTextIssue(issues, "space", "guided-space-name", "Space name", draft.space.name, 180);
    reservedNameIssue(issues, "space", "guided-space-name", "Space name", draft.space.name);
  }
  optionalTextLengthIssue(issues, "space", "guided-space-coordinates", "Coordinate description", draft.space.coordinateDescription, 800);
  if (draft.space.kind === "network") {
    issues.push(
      warning(
        "space",
        "guided-space-kind",
        "Network space is a structural declaration only. It does not add network runtime behavior or template support."
      )
    );
  }

  duplicateNameIssues(
    issues,
    "rules",
    draft.rules.map((rule) => ({ fieldId: `guided-rule-${rule.key}-name`, name: rule.name })),
    "Rule name"
  );
  const entityKeys = new Set(draft.entities.map((entity) => entity.key));
  for (const rule of draft.rules) {
    const ruleNameId = `guided-rule-${rule.key}-name`;
    requiredTextIssue(issues, "rules", ruleNameId, "Rule name", rule.name, 180);
    reservedNameIssue(issues, "rules", ruleNameId, "Rule name", rule.name);
    requiredTextIssue(issues, "rules", `guided-rule-${rule.key}-description`, "Rule description", rule.description, 2_000);
    if (rule.sourceEntityKey && !entityKeys.has(rule.sourceEntityKey)) {
      issues.push(error("rules", `guided-rule-${rule.key}-source`, "The source entity was removed. Select an existing entity or no source."));
    }
    if (rule.targetEntityKey && !entityKeys.has(rule.targetEntityKey)) {
      issues.push(error("rules", `guided-rule-${rule.key}-target`, "The target entity was removed. Select an existing entity or no target."));
    }
  }
  if (draft.rules.length === 0) {
    issues.push(warning("rules", "guided-rule-list", "No structural rules have been declared."));
  }

  duplicateNameIssues(
    issues,
    "startingConditions",
    draft.parameters.map((parameter) => ({ fieldId: `guided-parameter-${parameter.key}-name`, name: parameter.name })),
    "Parameter name"
  );
  for (const parameter of draft.parameters) {
    const parameterNameId = `guided-parameter-${parameter.key}-name`;
    requiredTextIssue(issues, "startingConditions", parameterNameId, "Parameter name", parameter.name, 180);
    reservedNameIssue(issues, "startingConditions", parameterNameId, "Parameter name", parameter.name);
    optionalTextLengthIssue(
      issues,
      "startingConditions",
      `guided-parameter-${parameter.key}-default`,
      "Parameter default description",
      parameter.defaultValueDescription,
      800
    );
    optionalTextLengthIssue(
      issues,
      "startingConditions",
      `guided-parameter-${parameter.key}-range`,
      "Parameter range description",
      parameter.rangeDescription,
      800
    );
    if (hasText(parameter.defaultValueDescription) && !isValidTypedDefault(parameter.defaultValueDescription, parameter.valueKind)) {
      issues.push(
        error(
          "startingConditions",
          `guided-parameter-${parameter.key}-default`,
          typedDefaultMessage("Parameter default", parameter.valueKind)
        )
      );
    }
  }
  optionalTextLengthIssue(
    issues,
    "startingConditions",
    "guided-starting-assumption",
    "Starting-condition assumption",
    draft.startingConditionAssumption,
    900
  );
  if (!hasText(draft.startingConditionAssumption)) {
    issues.push(
      warning(
        "startingConditions",
        "guided-starting-assumption",
        "No starting-condition assumption has been recorded. Parameter declarations remain structural either way."
      )
    );
  }

  return issues;
}

export function getGuidedBuilderStepIssues(
  issues: readonly GuidedBuilderIssue[],
  stepId: GuidedBuilderStepId,
  severity?: GuidedIssueSeverity
): readonly GuidedBuilderIssue[] {
  return issues.filter((issue) => issue.stepId === stepId && (!severity || issue.severity === severity));
}

function requiredTextIssue(
  issues: GuidedBuilderIssue[],
  stepId: GuidedBuilderStepId,
  fieldId: string,
  label: string,
  value: string,
  maxLength: number
): void {
  if (!hasText(value)) {
    issues.push(error(stepId, fieldId, `${label} is required.`));
  } else if (value.length > maxLength) {
    issues.push(error(stepId, fieldId, `${label} must be ${maxLength} characters or fewer.`));
  }
}

function optionalTextLengthIssue(
  issues: GuidedBuilderIssue[],
  stepId: GuidedBuilderStepId,
  fieldId: string,
  label: string,
  value: string,
  maxLength: number
): void {
  if (value.length > maxLength) {
    issues.push(error(stepId, fieldId, `${label} must be ${maxLength} characters or fewer.`));
  }
}

function reservedNameIssue(
  issues: GuidedBuilderIssue[],
  stepId: GuidedBuilderStepId,
  fieldId: string,
  label: string,
  value: string
): void {
  if (reservedStructuralNames.has(normalizeName(value))) {
    issues.push(error(stepId, fieldId, `${label} uses a reserved structural name.`));
  }
}

function duplicateNameIssues(
  issues: GuidedBuilderIssue[],
  stepId: GuidedBuilderStepId,
  values: readonly { fieldId: string; name: string }[],
  label: string
): void {
  const firstFieldByName = new Map<string, string>();
  for (const value of values) {
    const normalized = normalizeName(value.name);
    if (!normalized) {
      continue;
    }
    if (firstFieldByName.has(normalized)) {
      issues.push(error(stepId, value.fieldId, `${label} duplicates an earlier name in this section.`));
    } else {
      firstFieldByName.set(normalized, value.fieldId);
    }
  }
}

function isValidTypedDefault(value: string, valueKind: GuidedValueKind | GuidedParameterValueKind): boolean {
  const trimmed = value.trim();
  if (valueKind === "number") {
    return trimmed.length > 0 && Number.isFinite(Number(trimmed));
  }
  if (valueKind === "integer") {
    return /^[-+]?\d+$/.test(trimmed) && Number.isSafeInteger(Number(trimmed));
  }
  if (valueKind === "boolean") {
    return trimmed === "true" || trimmed === "false";
  }
  return trimmed.length > 0;
}

function typedDefaultMessage(label: string, valueKind: GuidedValueKind | GuidedParameterValueKind): string {
  if (valueKind === "number") {
    return `${label} must be a finite number when the value type is Number.`;
  }
  if (valueKind === "integer") {
    return `${label} must be a safe whole number when the value type is Integer.`;
  }
  if (valueKind === "boolean") {
    return `${label} must be exactly true or false when the value type is Boolean.`;
  }
  return `${label} must contain text for the selected value type.`;
}

function error(stepId: GuidedBuilderStepId, fieldId: string, message: string): GuidedBuilderIssue {
  return {
    id: `error:${stepId}:${fieldId}:${normalizeStructuralIdPart(message, 42)}`,
    stepId,
    fieldId,
    severity: "error",
    message
  };
}

function warning(stepId: GuidedBuilderStepId, fieldId: string, message: string): GuidedBuilderIssue {
  return {
    id: `warning:${stepId}:${fieldId}:${normalizeStructuralIdPart(message, 42)}`,
    stepId,
    fieldId,
    severity: "warning",
    message
  };
}

function normalizeStructuralIdPart(value: string, maxLength: number): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return normalized || "untitled";
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

const reservedStructuralNames = new Set(["__proto__", "prototype", "constructor"]);
