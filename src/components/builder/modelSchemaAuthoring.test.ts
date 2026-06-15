import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deserializeModelSchema,
  maxModelSchemaJsonLength,
  modelSchemaArtifactType,
  type ModelSchemaDefinition
} from "../../simulation/modelSchema";
import {
  addModelSchemaDeclaration,
  createComponentTypeDeclaration,
  createEmptyModelSchemaDraft,
  createEntityTypeDeclaration,
  createModelSchemaDraftView,
  createRuleDeclaration,
  exportModelSchemaDraft,
  getArtifactReferenceStatus,
  importModelSchemaDraft,
  isModelSchemaDraftDirty,
  mapModelSchemaErrorToFieldId,
  modelSchemaAuthoringSections,
  removeModelSchemaDeclaration,
  updateModelSchemaDeclaration
} from "./modelSchemaAuthoring";

const repoRoot = process.cwd();

function validDraft(overrides: Partial<ModelSchemaDefinition> = {}): ModelSchemaDefinition {
  return {
    ...createEmptyModelSchemaDraft(),
    id: "authored-schema",
    name: "Authored Schema",
    version: "1.0.0",
    entityTypes: [
      {
        id: "agent",
        label: "Agent",
        entityKind: "agent",
        active: true,
        executable: false
      }
    ],
    ...overrides
  };
}

describe("model schema authoring adapter", () => {
  it("creates a minimal empty structural draft and maps identity validation to fields", () => {
    const draft = createEmptyModelSchemaDraft();
    const view = createModelSchemaDraftView(draft);

    expect(draft).toMatchObject({
      artifactType: modelSchemaArtifactType,
      id: "",
      name: "",
      version: "",
      schemaVersion: "1"
    });
    expect(draft.entityTypes).toHaveLength(1);
    expect(view.report.valid).toBe(false);
    expect(view.report.runnableNow).toBe(false);
    expect(view.report.interpreterAvailable).toBe(false);
    expect(view.fieldErrorId).toBe("schema-identity-id");
  });

  it("reports a valid edited draft as structural but never runnable", () => {
    const view = createModelSchemaDraftView(validDraft());
    expect(view.report.valid).toBe(true);
    expect(view.report.runnableNow).toBe(false);
    expect(view.report.interpreterAvailable).toBe(false);
    expect(view.report.executableRuleCount).toBe(0);
    expect(view.summary).toMatchObject({
      entityTypeCount: 1,
      executableCount: 0
    });
    expect(view.report.warnings.join(" ")).toContain("do not execute rules");
  });

  it("adds, edits, and removes repeated declarations without corrupting unrelated sections", () => {
    let draft = validDraft({
      metrics: [
        {
          id: "count",
          label: "Count",
          metricKind: "count",
          active: true,
          executable: false
        }
      ]
    });
    const entity = createEntityTypeDeclaration(draft);
    draft = addModelSchemaDeclaration(draft, "entityTypes", entity);
    draft = updateModelSchemaDeclaration(draft, "entityTypes", 1, { ...entity, id: "group", label: "Group", entityKind: "aggregate" });
    draft = addModelSchemaDeclaration(draft, "componentTypes", createComponentTypeDeclaration(draft));
    draft = removeModelSchemaDeclaration(draft, "entityTypes", 0);

    expect(draft.entityTypes).toEqual([
      expect.objectContaining({ id: "group", label: "Group", entityKind: "aggregate", executable: false })
    ]);
    expect(draft.componentTypes).toHaveLength(1);
    expect(draft.metrics).toEqual([
      expect.objectContaining({ id: "count", executable: false })
    ]);
  });

  it("surfaces duplicate ids and cross-reference errors through service validation", () => {
    const duplicate = validDraft({
      entityTypes: [
        {
          id: "agent",
          label: "Agent",
          entityKind: "agent",
          active: true,
          executable: false
        },
        {
          id: "agent",
          label: "Second Agent",
          entityKind: "agent",
          active: false,
          executable: false
        }
      ]
    });
    const duplicateView = createModelSchemaDraftView(duplicate);
    expect(duplicateView.report.errors[0]).toMatch(/Duplicate entity type id/);
    expect(duplicateView.fieldErrorId).toBe("schema-section-entities");

    const crossReference = validDraft({
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
    const crossReferenceView = createModelSchemaDraftView(crossReference);
    expect(crossReferenceView.report.errors[0]).toMatch(/unknown componentTypeId/);
    expect(crossReferenceView.fieldErrorId).toBe("schema-section-entities");
  });

  it("keeps malformed, wrong-family, oversized, and unsafe imports from changing the current draft", () => {
    const current = validDraft({ name: "Current Draft" });
    const malformed = importModelSchemaDraft(current, "{");
    const wrongFamilies = [
      "ortus.visualBuilderWorkspace",
      "ortus.schemaTemplateCompatibilityReport",
      "ortus.templateMappingProfile",
      "ortus.knowledgeMemorySocialLearningModel",
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.hybridComposition"
    ].map((artifactType) => importModelSchemaDraft(current, JSON.stringify({ artifactType })));
    const unsafeImports = [
      { formula: "x + y" },
      { runtimeHooks: [] },
      { modelWeights: [] },
      { trainingData: [] },
      { realPersonProfile: {} },
      { protectedClassInference: {} },
      { psychologicalDiagnosis: {} },
      { persuasionOptimization: {} },
      { microtargeting: {} },
      { "Protected-Class-Inference": {} },
      { persuasion_optimization: {} }
    ].map((metadata) => importModelSchemaDraft(current, JSON.stringify({ ...validDraft(), metadata })));
    const oversized = importModelSchemaDraft(current, "x".repeat(maxModelSchemaJsonLength + 1));

    for (const result of [malformed, oversized, ...wrongFamilies, ...unsafeImports]) {
      expect(result.changed).toBe(false);
      expect(result.draft).toBe(current);
      expect(result.artifact).toBeNull();
      expect(result.error).toBeTruthy();
    }
  });

  it("keeps invalid export attempts non-destructive", () => {
    const draft = { ...validDraft(), id: "" };
    const before = JSON.stringify(draft);
    const result = exportModelSchemaDraft(draft);

    expect(result.artifact).toBeNull();
    expect(result.json).toBe("");
    expect(result.error).toBeTruthy();
    expect(JSON.stringify(draft)).toBe(before);
  });

  it("exports valid schemas through the existing serializer and round-trips without UI or simulation state", () => {
    const draft = validDraft({
      ruleDeclarations: [
        {
          ...createRuleDeclaration(validDraft()),
          id: "structural-rule",
          label: "Structural Rule",
          ruleKind: "socialLearning",
          ruleDescription: "Describe a stylized social-learning concept structurally.",
          executable: false
        }
      ]
    });
    const result = exportModelSchemaDraft(draft);
    const roundTrip = deserializeModelSchema(result.json);

    expect(result.error).toBeNull();
    expect(roundTrip).toMatchObject({
      artifactType: modelSchemaArtifactType,
      id: "authored-schema"
    });
    expect(roundTrip.ruleDeclarations?.[0]?.executable).toBe(false);
    expect(result.json).not.toContain("activeSection");
    expect(result.json).not.toContain("workspace selection");
    expect(result.json).not.toContain("runState");
    expect(result.json).not.toContain("snapshot");
    expect(result.json).not.toContain("RunConfig");
    expect(result.json).not.toContain("generatedCode");
  });

  it("preserves imported non-text allowed values and metadata through unrelated edits and export", () => {
    const imported = deserializeModelSchema(
      JSON.stringify(
        validDraft({
          attributeTypes: [
            {
              id: "category",
              label: "Category",
              valueKind: "category",
              allowedValues: [1, true, null, { label: "structured" }],
              active: true,
              executable: false
            }
          ],
          metadata: {
            count: 3,
            enabled: true,
            empty: null,
            nested: { source: "imported" }
          }
        })
      )
    );
    const edited = { ...imported, name: "Edited without coercion" };
    const roundTrip = deserializeModelSchema(exportModelSchemaDraft(edited).json);

    expect(roundTrip.attributeTypes?.[0]?.allowedValues).toEqual([1, true, null, { label: "structured" }]);
    expect(roundTrip.metadata).toEqual({
      count: 3,
      enabled: true,
      empty: null,
      nested: { source: "imported" }
    });
  });

  it("tracks dirty state against explicit checkpoints", () => {
    const baseline = validDraft();
    expect(isModelSchemaDraftDirty(baseline, baseline)).toBe(false);
    expect(isModelSchemaDraftDirty({ ...baseline, name: "Edited" }, baseline)).toBe(true);
  });

  it("shows registry status for structural artifact references without implying runtime support", () => {
    const status = getArtifactReferenceStatus({
      id: "schema-ref",
      label: "Schema",
      artifactType: modelSchemaArtifactType,
      artifactId: "schema-1",
      primitiveId: "modelSchema",
      role: "context",
      active: true,
      executable: false
    });
    expect(status.artifactStatus).toBe("service only");
    expect(status.primitiveStatus).toContain("serviceOnly");
    expect(status.runtimeNote).toContain("does not activate");
  });

  it("maps service error paths without implementing validation rules", () => {
    expect(mapModelSchemaErrorToFieldId("Invalid model schema: ruleDeclarations.2.ruleDescription: Required")).toBe(
      "schema-ruleDeclarations-2-ruleDescription"
    );
    expect(mapModelSchemaErrorToFieldId("Rule declaration rule-1 references unknown metricId: missing")).toBe("schema-section-rules");
  });
});

describe("model schema authoring UI architecture", () => {
  it("integrates Author Schema as an accessible Builder mode while preserving workspace inspection", () => {
    const source = readAuthoringSource();
    expect(source).toContain("Workspace Inspector");
    expect(source).toContain("Author Schema");
    expect(source).toContain('role="tablist"');
    expect(source).toContain('role="tabpanel"');
    expect(source).toContain("ArrowRight");
    expect(source).toContain("ArrowLeft");
    expect(source).toContain("Safe visual builder shell");
    expect(source).toContain("No workspace loaded");
  });

  it("makes every required section reachable and keeps validation visible", () => {
    expect(modelSchemaAuthoringSections.map((section) => section.id)).toEqual([
      "identity",
      "entities",
      "components",
      "attributes",
      "spaces",
      "parameters",
      "metrics",
      "rules",
      "artifacts",
      "notes"
    ]);
    const source = readAuthoringSource();
    expect(source).toContain("Schema Outline");
    expect(source).toContain("Validation + Limits");
    expect(source).toContain("Error Summary");
    expect(source).toContain("Missing Runtime Capabilities");
    expect(source).toContain("Warnings");
  });

  it("keeps non-runnable and rule-safety language persistent", () => {
    const source = readAuthoringSource();
    for (const phrase of [
      "Structural only",
      "Not runnable",
      "No schema execution",
      "No compiler",
      "No template generation",
      "No scenario generation",
      "No RunConfig generation",
      "A valid model schema is still not a runnable simulation.",
      "Rule declarations describe intended behavior only. They are not executed by ORTUS.",
      "Fixed by the model-schema contract. This form cannot author executable declarations."
    ]) {
      expect(source).toContain(phrase);
    }
  });

  it("provides draft safety, accessible confirmation, labels, and textual errors", () => {
    const source = readAuthoringSource();
    expect(source).toContain("Unsaved changes");
    expect(source).toContain("Restore last valid");
    expect(source).toContain('role="alertdialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('event.key === "Escape"');
    expect(source).toContain('event.key !== "Tab"');
    expect(source).toContain('role="alert"');
    expect(source).toContain("aria-invalid");
    expect(source).toContain("schema-field-error");
    expect(source).toContain("htmlFor=");
    expect(source).toContain("aria-label={`Remove");
    expect(source).toContain("onRequestMetadataRemoval");
    expect(source).toContain("Import rejected. The current draft and last valid artifact were preserved.");
    expect(source).toContain("Export is disabled while the draft is structurally invalid.");
    expect(source).toContain("Oversized file import rejected before reading.");
  });

  it("uses roving tab stops and a concise validation live region", () => {
    const source = readAuthoringSource();
    expect(source).toContain("tabIndex={mode.id === activeMode ? 0 : -1}");
    expect(source).toContain("tabIndex={activeSection === section.id ? 0 : -1}");
    expect(source).toContain('className="schema-validation-status" role="status" aria-live="polite" aria-atomic="true"');
    expect(source).not.toContain('className="schema-validation-report" aria-live="polite"');
  });

  it("stacks the three-column Builder before its minimum tracks can overflow", () => {
    const css = readFileSync(join(repoRoot, "src", "app", "globals.css"), "utf8");
    expect(css).toContain("@media (max-width: 1120px)");
    expect(css).toMatch(/@media \(max-width: 1120px\)[\s\S]*?\.schema-authoring-shell[\s\S]*?grid-template-columns: 1fr/);
  });

  it("contains no runtime, compiler, code-generation, external-framework, or unsafe rendering hooks", () => {
    const source = readAuthoringSource();
    for (const forbidden of [
      "SimulationEngine",
      "useSimulationStore",
      "/templates/",
      "schemaTemplateCompatibility",
      "socialLearning/",
      "simulation/composition",
      "simulation/scenarios",
      "simulation/snapshots",
      "simulation/templates",
      "simulationStore",
      "dangerouslySetInnerHTML",
      "eval(",
      "new Function",
      "iframe",
      "URL.createObjectURL",
      "fetch(",
      "XMLHttpRequest",
      "WebSocket",
      "netlogo",
      "mesaModel",
      "masonModel"
    ]) {
      expect(source).not.toContain(forbidden);
    }
    expect(source).not.toMatch(/>\s*Run Model\s*</);
    expect(source).not.toMatch(/>\s*Compile\s*</);
    expect(source).not.toMatch(/>\s*Preview Simulation\s*</);
    expect(source).not.toMatch(/>\s*Generate Scenario\s*</);
    expect(source).not.toMatch(/>\s*Generate RunConfig\s*</);
    expect(source).not.toMatch(/>\s*Generate Template\s*</);
    expect(source).not.toMatch(/>\s*Apply to Simulation\s*</);
    expect(source).not.toContain('label="Formula"');
    expect(source).not.toContain('label="Code"');
    expect(source).not.toContain('label="Script"');
  });
});

function readAuthoringSource(): string {
  return [
    "BuilderShell.tsx",
    "BuilderHeader.tsx",
    "BuilderModeTabs.tsx",
    "ModelSchemaAuthoringShell.tsx",
    "ModelSchemaSectionEditor.tsx",
    "modelSchemaAuthoring.ts"
  ]
    .map((file) => readFileSync(join(repoRoot, "src", "components", "builder", file), "utf8"))
    .join("\n");
}
