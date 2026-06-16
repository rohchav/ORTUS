import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getModelInterpreterCapabilityReport, modelSchemaArtifactType, type ModelSchemaDefinition } from "../../../simulation/modelSchema";
import {
  applySchemaRepairSuggestion,
  createSchemaValidationUxModel,
  formatSchemaValidationIssueDetails,
  getSchemaDraftHash,
  schemaValidationRuleRepairBoundaryPhrase,
  schemaValidationRepairBoundaryPhrases
} from "./schemaValidationUx";
import type { SchemaRepairSuggestion } from "./schemaValidationUx";

function validDraft(overrides: Partial<ModelSchemaDefinition> = {}): ModelSchemaDefinition {
  return {
    artifactType: modelSchemaArtifactType,
    id: "authored-schema",
    name: "Authored Schema",
    version: "1.0.0",
    schemaVersion: "1",
    entityTypes: [
      {
        id: "agent",
        label: "Agent",
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
    metadata: {},
    ...overrides
  };
}

describe("schema validation UX and repair suggestions", () => {
  it("creates structural-only overview and persistent boundary phrases", () => {
    const draft = validDraft();
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));

    expect(ux.overview.structuralStatus).toBe("Structurally valid");
    expect(ux.overview.runnableStatus).toBe("Not runnable");
    expect(ux.overview.compilerStatus).toBe("No compiler or interpreter");
    expect(ux.overview.serviceOnlyNotice).toContain("service-level structural support");
    expect(ux.overview.futureOnlyNotice).toContain("future-only");
    expect(ux.boundaryPhrases).toEqual(schemaValidationRepairBoundaryPhrases);
    expect(ux.boundaryPhrases).toContain("Repair suggestions are structural editing assistance. They do not make a schema runnable.");
    expect(ux.groups.some((group) => group.title === "Missing runtime capabilities")).toBe(true);
  });

  it("offers safe identifier normalization without making runnable claims", () => {
    const draft = validDraft({
      id: " authored-schema ",
      entityTypes: [
        {
          id: " agent ",
          label: "Agent",
          entityKind: "agent",
          active: true,
          executable: false
        }
      ]
    });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const suggestions = ux.issues.map((issue) => issue.suggestion).filter(Boolean);
    const topLevelTrim = suggestions.find((suggestion) => suggestion?.patch?.kind === "trimTopLevelString");
    const declarationTrim = suggestions.find((suggestion) => suggestion?.patch?.kind === "trimDeclarationId");

    expect(topLevelTrim).toMatchObject({
      actionLabel: "Normalize identifier",
      canApply: true,
      riskLevel: "safe",
      requiresConfirmation: false
    });
    expect(declarationTrim).toMatchObject({
      actionLabel: "Normalize identifier",
      canApply: true,
      riskLevel: "safe",
      requiresConfirmation: false
    });

    const result = applySchemaRepairSuggestion(draft, topLevelTrim!);
    expect(result.applied).toBe(true);
    expect(result.draft.id).toBe("authored-schema");
    expect(result.report.runnableNow).toBe(false);
    expect(result.message).toContain("does not make the schema runnable");
  });

  it("requires confirmation before removing unsafe metadata keys and validates afterward", () => {
    const draft = validDraft({ metadata: { formula: "x + y", purpose: "test" } });
    const report = getModelInterpreterCapabilityReport(draft);
    const ux = createSchemaValidationUxModel(draft, report);
    const issue = ux.issues.find((candidate) => candidate.category === "Unsafe metadata");

    expect(report.valid).toBe(false);
    expect(issue?.suggestion).toMatchObject({
      actionLabel: "Remove unsafe metadata key",
      canApply: true,
      riskLevel: "confirmation",
      requiresConfirmation: true
    });

    const result = applySchemaRepairSuggestion(draft, issue!.suggestion!);
    expect(result.applied).toBe(false);
    expect(result.draft).toBe(draft);
    expect(result.message).toContain("requires confirmation");

    const confirmed = applySchemaRepairSuggestion(draft, issue!.suggestion!, { confirmed: true });
    expect(confirmed.applied).toBe(true);
    expect(confirmed.draft.metadata).toEqual({ purpose: "test" });
    expect(confirmed.report.valid).toBe(true);
    expect(confirmed.report.runnableNow).toBe(false);
  });

  it("keeps prototype-like unsafe metadata manual-only and rejects fabricated prototype patches", () => {
    const draft = validDraft({ metadata: JSON.parse('{"__proto__":"pollute","purpose":"test"}') as ModelSchemaDefinition["metadata"] });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const issue = ux.issues.find((candidate) => candidate.category === "Unsafe metadata");

    expect(issue?.suggestion).toMatchObject({
      canApply: false,
      riskLevel: "manualOnly",
      patch: null
    });

    const forgedSuggestion: SchemaRepairSuggestion = {
      id: "forged-prototype-repair",
      label: "Forged prototype repair",
      actionLabel: "Remove unsafe metadata key",
      canApply: true,
      riskLevel: "confirmation",
      requiresConfirmation: true,
      summary: "Attempt to remove a protected metadata key.",
      preview: "The metadata entry __proto__ would be removed.",
      disabledReason: null,
      patch: { kind: "removeTopLevelMetadataKey", key: "__proto__", draftHash: getSchemaDraftHash(draft) }
    };
    const result = applySchemaRepairSuggestion(draft, forgedSuggestion, { confirmed: true });

    expect(result.applied).toBe(false);
    expect(result.draft).toBe(draft);
    expect(result.message).toContain("protected object key");
    expect(({} as { pollute?: unknown }).pollute).toBeUndefined();
  });

  it("rejects malformed fabricated patches before touching the draft", () => {
    const draft = validDraft({ id: " authored-schema " });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const suggestion = ux.issues.find((issue) => issue.suggestion?.patch?.kind === "trimTopLevelString")!.suggestion!;
    const forgedSuggestion = {
      ...suggestion,
      patch: { kind: "trimTopLevelString", field: "__proto__", from: draft.id, to: "authored-schema", draftHash: getSchemaDraftHash(draft) }
    } as unknown as SchemaRepairSuggestion;
    const result = applySchemaRepairSuggestion(draft, forgedSuggestion);

    expect(result.applied).toBe(false);
    expect(result.draft).toBe(draft);
    expect(result.message).toContain("malformed or unsupported");
    expect(draft.id).toBe(" authored-schema ");
  });

  it("rejects stale list-item suggestions after list mutation", () => {
    const draft = validDraft({
      entityTypes: [{ id: " agent ", label: "Agent", entityKind: "agent", active: true, executable: false }]
    });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const suggestion = ux.issues.find((issue) => issue.suggestion?.patch?.kind === "trimDeclarationId")!.suggestion!;
    const changedDraft = {
      ...draft,
      entityTypes: [
        { id: "inserted", label: "Inserted", entityKind: "agent", active: true, executable: false } as ModelSchemaDefinition["entityTypes"][number],
        ...draft.entityTypes
      ]
    };
    const result = applySchemaRepairSuggestion(changedDraft, suggestion);

    expect(result.applied).toBe(false);
    expect(result.draft).toBe(changedDraft);
    expect(result.message).toContain("stale");
    expect(changedDraft.entityTypes[1]?.id).toBe(" agent ");
  });

  it("keeps ambiguous duplicate ids and unknown references manual-only", () => {
    const duplicate = validDraft({
      entityTypes: [
        { id: "agent", label: "Agent", entityKind: "agent", active: true, executable: false },
        { id: "agent", label: "Second Agent", entityKind: "agent", active: true, executable: false }
      ]
    });
    const duplicateUx = createSchemaValidationUxModel(duplicate, getModelInterpreterCapabilityReport(duplicate));
    const duplicateIssue = duplicateUx.issues.find((issue) => issue.category === "Duplicate identifiers");
    expect(duplicateIssue?.suggestion).toMatchObject({
      canApply: false,
      riskLevel: "manualOnly",
      patch: null
    });
    expect(duplicateIssue?.manualGuidance).toContain("Review the duplicated declarations");

    const brokenReference = validDraft({
      entityTypes: [
        {
          id: "agent",
          label: "Agent",
          entityKind: "agent",
          componentTypeIds: ["missing-component"],
          active: true,
          executable: false
        }
      ]
    });
    const referenceUx = createSchemaValidationUxModel(brokenReference, getModelInterpreterCapabilityReport(brokenReference));
    const referenceIssue = referenceUx.issues.find((issue) => issue.category === "Broken references");
    expect(referenceIssue?.suggestion).toMatchObject({
      canApply: false,
      riskLevel: "manualOnly",
      patch: null
    });
    expect(referenceIssue?.whyItMatters).toContain("ORTUS cannot infer the correct target declaration");
  });

  it("clears imported executable flags without executing rule text", () => {
    const draft = validDraft({
      ruleDeclarations: [
        {
          id: "rule-1",
          label: "Rule",
          ruleKind: "custom",
          ruleDescription: "Do not parse this as a formula or function body.",
          active: true,
          executable: true
        } as unknown as NonNullable<ModelSchemaDefinition["ruleDeclarations"]>[number]
      ]
    });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const issue = ux.issues.find((candidate) => candidate.suggestion?.patch?.kind === "setDeclarationExecutableFalse");
    const result = applySchemaRepairSuggestion(draft, issue!.suggestion!);

    expect(issue?.suggestion).toMatchObject({
      actionLabel: "Clear unsafe payload",
      canApply: true,
      riskLevel: "safe"
    });
    expect(result.applied).toBe(true);
    expect(result.draft.ruleDeclarations?.[0]?.executable).toBe(false);
    expect(result.draft.ruleDeclarations?.[0]?.ruleDescription).toBe("Do not parse this as a formula or function body.");
    expect(result.report.valid).toBe(true);
    expect(result.report.runnableNow).toBe(false);
  });

  it("rejects stale suggestions and preserves the current draft", () => {
    const draft = validDraft({ id: " authored-schema " });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const suggestion = ux.issues.find((issue) => issue.suggestion?.patch?.kind === "trimTopLevelString")!.suggestion!;
    const changedDraft = { ...draft, name: "Changed while suggestion was visible" };
    const result = applySchemaRepairSuggestion(changedDraft, suggestion);

    expect(result.applied).toBe(false);
    expect(result.draft).toBe(changedDraft);
    expect(result.message).toContain("stale");
  });

  it("formats copyable issue details as text-only diagnostics", () => {
    const draft = validDraft({ metadata: { persuasionOptimization: true } });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const details = formatSchemaValidationIssueDetails(ux.issues[0]!);

    expect(details).toContain("Original validation message:");
    expect(details).toContain("Can apply:");
    expect(details).toContain("Requires confirmation:");
    expect(details).toContain("Risk:");
    expect(details).toContain("Boundary:");
    expect(details).not.toContain("<script");
    expect(details).not.toContain("dangerouslySetInnerHTML");
  });

  it("uses safe deterministic grouping for mixed errors, warnings, and capability gaps", () => {
    const draft = validDraft({
      id: " authored-schema ",
      metadata: { formula: "x + y" }
    });
    const ux = createSchemaValidationUxModel(draft, getModelInterpreterCapabilityReport(draft));
    const titles = ux.groups.map((group) => group.title);

    expect(titles).toEqual([
      "Unsafe metadata",
      "Structural cleanup suggestions",
      "Runtime boundaries",
      "Missing runtime capabilities"
    ]);
    expect(ux.groups.find((group) => group.title === "Unsafe metadata")).toMatchObject({
      count: 1,
      highestSeverity: "error"
    });
  });

  it("puts unknown validation messages into a safe structural group", () => {
    const draft = validDraft();
    const report = {
      ...getModelInterpreterCapabilityReport(draft),
      valid: false,
      errors: ["Unexpected model schema validator failure"]
    };
    const ux = createSchemaValidationUxModel(draft, report);
    const issue = ux.issues.find((candidate) => candidate.category === "Other structural issues");

    expect(issue).toMatchObject({
      severity: "error",
      suggestion: expect.objectContaining({
        canApply: false,
        riskLevel: "manualOnly",
        patch: null
      })
    });
  });

  it("exports the required rule repair boundary phrase", () => {
    expect(schemaValidationRuleRepairBoundaryPhrase).toBe(
      "Rule repair suggestions only edit structural declarations. They do not execute or validate behavior."
    );
  });

  it("keeps repair assistance free of execution, code generation, network, and external API hooks", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "builder", "validation", "schemaValidationUx.ts"), "utf8");
    for (const forbidden of [
      "dangerouslySetInnerHTML",
      "eval(",
      "new Function",
      "Function(",
      "dynamic import",
      "import(",
      "fetch(",
      "XMLHttpRequest",
      "WebSocket",
      "iframe",
      "URL.createObjectURL",
      "JSONPatch",
      "jsonpatch",
      "fast-json-patch",
      "SimulationEngine",
      "useSimulationStore",
      "generateScenario",
      "generateRunConfig",
      "generateSnapshot",
      "generateTemplate"
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
