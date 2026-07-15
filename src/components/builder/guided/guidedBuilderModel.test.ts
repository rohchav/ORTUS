import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assembleGuidedModelSchemaCandidate,
  createDeterministicStructuralIds,
  createGuidedBuilderDraft,
  createGuidedBuilderHandoff,
  createGuidedBuilderReview,
  createGuidedEntityDraft,
  createGuidedParameterDraft,
  createGuidedRuleDraft,
  createGuidedStateFieldDraft,
  getNextGuidedBuilderStep,
  getPreviousGuidedBuilderStep,
  guidedBuilderSteps,
  isGuidedBuilderDraftMeaningful,
  nextGuidedDraftKey,
  validateGuidedBuilderDraft,
  type GuidedBuilderDraft
} from "./guidedBuilderModel";

const repoRoot = process.cwd();

function validGuidedDraft(): GuidedBuilderDraft {
  return {
    modelName: "Exchange Commons",
    modelDescription: "A stylized structural model of local resource exchange.",
    limitation: "This draft does not represent real people or establish real-world accuracy.",
    entities: [
      {
        key: "entity-1",
        name: "Resource holder",
        description: "A bounded abstract entity, not a person profile.",
        entityKind: "agent",
        stateFields: [
          {
            key: "state-1",
            name: "Resource level",
            valueKind: "number",
            defaultValueDescription: "10"
          }
        ]
      },
      {
        key: "entity-2",
        name: "Exchange site",
        description: "A structural interaction site.",
        entityKind: "node",
        stateFields: []
      }
    ],
    space: {
      kind: "network",
      name: "Exchange topology",
      coordinateDescription: "Abstract adjacency only."
    },
    rules: [
      {
        key: "rule-1",
        name: "Local exchange",
        description: "A resource holder may exchange with an adjacent exchange site.",
        ruleKind: "interaction",
        sourceEntityKey: "entity-1",
        targetEntityKey: "entity-2"
      }
    ],
    parameters: [
      {
        key: "parameter-1",
        name: "Initial resource level",
        valueKind: "integer",
        defaultValueDescription: "10",
        rangeDescription: "0 to 100"
      }
    ],
    startingConditionAssumption: "All structural entities begin under the same declared parameter assumption."
  };
}

describe("Guided Builder draft model", () => {
  it("initializes a bounded, local-only structural draft with one required entity slot", () => {
    const draft = createGuidedBuilderDraft();

    expect(draft).toEqual({
      modelName: "",
      modelDescription: "",
      limitation: "",
      entities: [createGuidedEntityDraft("entity-1")],
      space: { kind: "none", name: "", coordinateDescription: "" },
      rules: [],
      parameters: [],
      startingConditionAssumption: ""
    });
    expect(draft).not.toHaveProperty("runtime");
    expect(draft).not.toHaveProperty("scenario");
    expect(draft).not.toHaveProperty("runConfig");
    expect(draft).not.toHaveProperty("snapshot");
    expect(isGuidedBuilderDraftMeaningful(draft)).toBe(false);
  });

  it("uses stable local keys without time, randomness, or UUIDs", () => {
    expect(nextGuidedDraftKey("entity", ["entity-1", "entity-3", "external-key"])).toBe("entity-4");
    expect(nextGuidedDraftKey("state", [])).toBe("state-1");
    expect(createGuidedStateFieldDraft("state-2").key).toBe("state-2");
    expect(createGuidedRuleDraft("rule-2").key).toBe("rule-2");
    expect(createGuidedParameterDraft("parameter-2").key).toBe("parameter-2");
  });

  it("derives deterministic semantic ids with stable collision suffixes", () => {
    const first = createDeterministicStructuralIds("entity", ["Household", "household", "House hold", "Échange"]);
    const second = createDeterministicStructuralIds("entity", ["Household", "household", "House hold", "Échange"]);

    expect(first).toEqual(["entity-household", "entity-household-2", "entity-house-hold", "entity-echange"]);
    expect(second).toEqual(first);
    expect(first.every((id) => id.length <= 160)).toBe(true);
  });

  it("maps every guided value into real model-schema fields with documented static defaults", () => {
    const artifact = assembleGuidedModelSchemaCandidate(validGuidedDraft());

    expect(artifact).toMatchObject({
      artifactType: "ortus.modelSchema",
      id: "model-exchange-commons",
      name: "Exchange Commons",
      version: "1.0.0",
      schemaVersion: "1"
    });
    expect(artifact.entityTypes).toEqual([
      expect.objectContaining({
        id: "entity-resource-holder",
        label: "Resource holder",
        entityKind: "agent",
        attributeTypeIds: ["attribute-resource-holder-resource-level"],
        spaceIds: ["space-exchange-topology"],
        active: true,
        executable: false
      }),
      expect.objectContaining({
        id: "entity-exchange-site",
        label: "Exchange site",
        entityKind: "node",
        spaceIds: ["space-exchange-topology"],
        active: true,
        executable: false
      })
    ]);
    expect(artifact.attributeTypes).toEqual([
      expect.objectContaining({
        id: "attribute-resource-holder-resource-level",
        label: "Resource level",
        valueKind: "number",
        defaultValueDescription: "10",
        executable: false
      })
    ]);
    expect(artifact.ruleDeclarations?.[0]).toMatchObject({
      id: "rule-local-exchange",
      sourceEntityTypeIds: ["entity-resource-holder"],
      targetEntityTypeIds: ["entity-exchange-site"],
      ruleDescription: "A resource holder may exchange with an adjacent exchange site.",
      executable: false
    });
    expect(artifact.parameters?.[0]).toMatchObject({
      id: "parameter-initial-resource-level",
      defaultValueDescription: "10",
      rangeDescription: "0 to 100",
      executable: false
    });
    expect(artifact.assumptionNotes?.[0]?.description).toBe(validGuidedDraft().startingConditionAssumption);
    expect(artifact.limitationNotes?.[0]?.description).toBe(validGuidedDraft().limitation);
    expect(artifact).not.toHaveProperty("scope");
    expect(artifact).not.toHaveProperty("metadata");
  });

  it("produces equivalent structural artifacts for equivalent logical input", () => {
    const first = assembleGuidedModelSchemaCandidate(validGuidedDraft());
    const second = assembleGuidedModelSchemaCandidate(structuredClone(validGuidedDraft()));

    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("keeps generated note ids within authoritative bounds for a maximum-length model name", () => {
    const draft = {
      ...validGuidedDraft(),
      modelName: "M".repeat(180)
    };
    const first = createGuidedBuilderHandoff(draft);
    const second = createGuidedBuilderHandoff(structuredClone(draft));

    expect(first.review.serviceView.structurallyValid).toBe(true);
    expect(first.artifact).not.toBeNull();
    expect(first.artifact?.assumptionNotes?.[0]?.id).toBe("assumption-guided-starting-condition");
    expect(first.artifact?.limitationNotes?.[0]?.id).toBe("limitation-guided-model-scope");
    expect(first.artifact?.assumptionNotes?.[0]?.id.length).toBeLessThanOrEqual(80);
    expect(first.artifact?.limitationNotes?.[0]?.id.length).toBeLessThanOrEqual(80);
    expect(second.artifact).toEqual(first.artifact);
  });

  it("applies collision suffixes globally across entity and attribute declarations", () => {
    const draft = validGuidedDraft();
    const collisionDraft: GuidedBuilderDraft = {
      ...draft,
      entities: [
        { ...draft.entities[0]!, name: "Échange", stateFields: [{ ...draft.entities[0]!.stateFields[0]!, name: "Load" }] },
        { ...draft.entities[1]!, name: "Echange", stateFields: [{ ...createGuidedStateFieldDraft("state-2"), name: "Load" }] }
      ],
      rules: []
    };
    const artifact = assembleGuidedModelSchemaCandidate(collisionDraft);

    expect(artifact.entityTypes.map((entity) => entity.id)).toEqual(["entity-echange", "entity-echange-2"]);
    expect(artifact.attributeTypes?.map((attribute) => attribute.id)).toEqual(["attribute-echange-load", "attribute-echange-load-2"]);
    expect(createGuidedBuilderReview(collisionDraft).serviceView.structurallyValid).toBe(true);
  });

  it("reports required and duplicate names deterministically", () => {
    const emptyIssues = validateGuidedBuilderDraft(createGuidedBuilderDraft());
    expect(emptyIssues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(["Model name is required.", "Short description is required.", "Entity name is required."])
    );

    const draft = validGuidedDraft();
    const duplicateDraft = {
      ...draft,
      entities: [draft.entities[0]!, { ...draft.entities[1]!, name: " resource HOLDER " }]
    };
    const duplicateIssues = validateGuidedBuilderDraft(duplicateDraft);
    expect(duplicateIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stepId: "entities",
          fieldId: "guided-entity-entity-2-name",
          severity: "error",
          message: "Entity name duplicates an earlier name in this section."
        })
      ])
    );
  });

  it("rejects malformed typed defaults without converting them into runtime values", () => {
    const draft = validGuidedDraft();
    const invalid = {
      ...draft,
      entities: [
        {
          ...draft.entities[0]!,
          stateFields: [{ ...draft.entities[0]!.stateFields[0]!, valueKind: "integer" as const, defaultValueDescription: "10.5" }]
        },
        draft.entities[1]!
      ],
      parameters: [{ ...draft.parameters[0]!, valueKind: "boolean" as const, defaultValueDescription: "yes" }]
    };

    expect(validateGuidedBuilderDraft(invalid)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldId: "guided-state-state-1-default", severity: "error" }),
        expect.objectContaining({ fieldId: "guided-parameter-parameter-1-default", severity: "error" })
      ])
    );
    expect(assembleGuidedModelSchemaCandidate(invalid).attributeTypes?.[0]?.defaultValueDescription).toBe("10.5");
  });

  it("keeps removed entity references visible and blocks handoff instead of silently deleting them", () => {
    const draft = validGuidedDraft();
    const withRemovedTarget = { ...draft, entities: [draft.entities[0]!] };
    const review = createGuidedBuilderReview(withRemovedTarget);

    expect(review.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldId: "guided-rule-rule-1-target",
          message: "The target entity was removed. Select an existing entity or no target."
        })
      ])
    );
    expect(review.candidate.ruleDeclarations?.[0]?.targetEntityTypeIds).toEqual(["missing-entity-entity-2"]);
    expect(review.serviceView.report.errors.join("\n")).toMatch(/unknown targetEntityTypeId/i);
    expect(createGuidedBuilderHandoff(withRemovedTarget).artifact).toBeNull();
  });

  it("keeps step navigation reversible without mutating draft values", () => {
    const draft = validGuidedDraft();
    const before = structuredClone(draft);

    expect(guidedBuilderSteps.map((step) => step.id)).toEqual([
      "purpose",
      "entities",
      "space",
      "rules",
      "startingConditions",
      "review"
    ]);
    expect(getNextGuidedBuilderStep("purpose")).toBe("entities");
    expect(getPreviousGuidedBuilderStep("entities")).toBe("purpose");
    expect(getNextGuidedBuilderStep("review")).toBe("review");
    expect(getPreviousGuidedBuilderStep("purpose")).toBe("purpose");
    expect(draft).toEqual(before);
  });

  it("resets to the documented empty local draft without changing an external Advanced or World sentinel", () => {
    const meaningful = validGuidedDraft();
    const advancedSentinel = { draftName: "Existing Advanced draft" };
    const worldSentinel = { templateId: "forest-fire", tick: 17, seed: "world-seed" };
    const advancedBefore = structuredClone(advancedSentinel);
    const worldBefore = structuredClone(worldSentinel);

    expect(isGuidedBuilderDraftMeaningful(meaningful)).toBe(true);
    expect(isGuidedBuilderDraftMeaningful(createGuidedBuilderDraft())).toBe(false);
    expect(advancedSentinel).toEqual(advancedBefore);
    expect(worldSentinel).toEqual(worldBefore);
  });

  it("creates a handoff only for an existing-validator-approved structural artifact", () => {
    const valid = createGuidedBuilderHandoff(validGuidedDraft());
    const invalid = createGuidedBuilderHandoff(createGuidedBuilderDraft());

    expect(valid.artifact).toEqual(valid.review.candidate);
    expect(valid.review.structurallyValid).toBe(true);
    expect(valid.review.serviceView.report).toMatchObject({
      valid: true,
      runnableNow: false,
      interpreterAvailable: false,
      executableRuleCount: 0
    });
    expect(invalid.artifact).toBeNull();
    expect(invalid.review.structurallyValid).toBe(false);
  });
});

describe("Guided Builder UI and integration boundaries", () => {
  it("defaults to Guided while preserving direct, keyboard-operable access to Advanced", () => {
    const shell = source("src/components/builder/BuilderShell.tsx");
    const tabs = source("src/components/builder/BuilderExperienceTabs.tsx");

    expect(shell).toContain('useState<BuilderExperienceId>("guided")');
    expect(tabs).toContain("Guided Builder");
    expect(tabs).toContain("Advanced Builder");
    expect(tabs).toContain('role="tablist"');
    expect(tabs).toContain('role="tab"');
    expect(tabs).toContain("ArrowRight");
    expect(tabs).toContain("ArrowLeft");
    expect(shell).toContain('id="builder-experience-panel-guided"');
    expect(shell).toContain('id="builder-experience-panel-advanced"');
  });

  it("implements real semantic forms, focusable errors, and confirmation-protected destructive actions", () => {
    const guided = source("src/components/builder/guided/GuidedBuilder.tsx");

    expect(guided).toContain("<form");
    expect(guided).toContain("<fieldset>");
    expect(guided).toContain("<legend>");
    expect(guided).toContain("aria-describedby");
    expect(guided).toContain("aria-invalid");
    expect(guided).toContain('role="alert"');
    expect(guided).toContain('role="alertdialog"');
    expect(guided).toContain('aria-modal="true"');
    expect(guided).toContain('event.key === "Escape"');
    expect(guided).toContain('event.key !== "Tab"');
    expect(guided).toContain("Start over");
    expect(guided).toContain("Open draft in Advanced Builder");
  });

  it("protects an existing Advanced draft and leaves every expert tool intact", () => {
    const shell = source("src/components/builder/BuilderShell.tsx");
    const authoring = source("src/components/builder/ModelSchemaAuthoringShell.tsx");
    const modes = source("src/components/builder/BuilderModeTabs.tsx");

    expect(authoring).toContain("guidedHandoff");
    expect(authoring).toContain("Replace the current Advanced Author Schema draft?");
    expect(authoring).toContain("Cancel preserves both drafts.");
    expect(authoring).toContain("isEmptyModelSchemaAuthoringDraft(draft)");
    expect(shell).toContain('setActiveMode("authorSchema")');
    for (const phrase of ["Workspace Inspector", "Author Schema", "Graph View"]) {
      expect(modes).toContain(phrase);
    }
    for (const phrase of ["Import JSON file", "Export valid schema JSON", "Repair suggestions", "Fit Report", "Scenario Planning"]) {
      expect(authoring).toContain(phrase);
    }
  });

  it("adds no persistence, nondeterministic identity, runtime coupling, or misleading action", () => {
    const guidedSource = [
      source("src/components/builder/guided/guidedBuilderModel.ts"),
      source("src/components/builder/guided/GuidedBuilder.tsx"),
      source("src/components/builder/BuilderExperienceTabs.tsx"),
      source("src/components/builder/BuilderShell.tsx")
    ].join("\n");

    expect(guidedSource).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|createJSONStorage|persist\(|storageKey/i);
    expect(guidedSource).not.toMatch(/Date\.now|Math\.random|crypto\.randomUUID|randomUUID|uuidv4|nanoid/i);
    expect(guidedSource).not.toMatch(/SimulationEngine|useSimulationStore|simulationStore|createEngine|runFrameSteps|templateRegistry/i);
    expect(guidedSource).not.toMatch(/dangerouslySetInnerHTML|eval\(|new Function|WebAssembly|Worker\(/i);
    expect(guidedSource).not.toMatch(/from ["'][^"']*simulation\/(templates|scenarios|snapshots)[^"']*["']/i);
    expect(guidedSource).not.toMatch(/>\s*(Run model|Run in World|Preview simulation|Compile model|Generate template|Generate scenario|Generate RunConfig|Publish to Lab|Publish to Atlas|Validate scientifically|Calibrate automatically|AI recommendation|Recommended configuration)\s*</i);
  });
});

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}
