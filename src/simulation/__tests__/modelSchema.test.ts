import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deserializeModelSchema,
  getArtifactFamily,
  getArtifactReference,
  getAttributeType,
  getAttributesForComponentType,
  getAttributesForEntityType,
  getComponentType,
  getComponentsForEntityType,
  getEntityType,
  getMetric,
  getModelInterpreterCapabilityReport,
  getModelSchemaWarnings,
  getParameter,
  getPrimitive,
  getRuleDeclaration,
  getRulesForEntityType,
  getSpace,
  getTemplateCapability,
  listActiveEntityTypes,
  listActiveRuleDeclarations,
  listArtifactFamiliesForPrimitive,
  listArtifactReferences,
  listArtifactReferencesByRole,
  listArtifactReferencesByType,
  listAttributeTypes,
  listComponentTypes,
  listEntityTypes,
  listEntityTypesByKind,
  listMetrics,
  listParameters,
  listReservedPrimitives,
  listRuleDeclarations,
  listRuleDeclarationsByKind,
  listServiceOnlyPrimitives,
  listSpaces,
  listSpacesByKind,
  modelSchemaArtifactType,
  productionTemplates,
  schemaHasArtifactType,
  schemaHasRuleKind,
  serializeModelSchema,
  summarizeModelSchema,
  validateCompositionCapabilities,
  validateHybridComposition,
  validateModelSchemaDefinition,
  type HybridModelComposition,
  type ModelSchemaDefinition
} from "../index";

const repoRoot = process.cwd();

function minimalSchema(overrides: Partial<ModelSchemaDefinition> = {}): ModelSchemaDefinition {
  return {
    artifactType: modelSchemaArtifactType,
    id: "minimal-schema",
    name: "Minimal Schema",
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
    ...overrides
  };
}

function fullSchema(overrides: Partial<ModelSchemaDefinition> = {}): ModelSchemaDefinition {
  return minimalSchema({
    id: "opinion-schema",
    name: "Opinion Schema",
    description: "A structural schema for a hand-built Opinion Dynamics style template.",
    scope: {
      templateId: "opinion-dynamics",
      hybridCompositionId: "hybrid-1",
      networkDefinitionId: "network-1",
      resourceSystemId: "resource-1",
      eventScheduleId: "events-1",
      delayQueueId: "delay-1",
      feedbackLoopModelId: "feedback-1",
      scaleModelId: "scale-1",
      scaleViewStateId: "scale-view-1",
      boundaryModelId: "boundary-1",
      fieldLayerId: "field-1",
      observabilityModelId: "observability-1",
      causalAssumptionModelId: "causal-1",
      quantitySemanticsModelId: "quantity-1",
      emergencePatternModelId: "emergence-1",
      robustnessResilienceModelId: "robustness-1",
      controlStrategyModelId: "control-1",
      notes: ["Scope references are structural only."]
    },
    entityTypes: [
      {
        id: "person",
        label: "Person",
        entityKind: "agent",
        componentTypeIds: ["opinion-state"],
        attributeTypeIds: ["stubbornness"],
        spaceIds: ["social-space"],
        active: true,
        executable: false
      },
      {
        id: "ambient-context",
        label: "Ambient Context",
        entityKind: "aggregate",
        active: false,
        executable: false
      }
    ],
    componentTypes: [
      {
        id: "opinion-state",
        label: "Opinion State",
        componentKind: "belief",
        attributeTypeIds: ["opinion", "mood"],
        active: true,
        executable: false
      },
      {
        id: "empty-component",
        label: "Empty Component",
        componentKind: "custom",
        active: false,
        executable: false
      }
    ],
    attributeTypes: [
      {
        id: "opinion",
        label: "Opinion",
        valueKind: "number",
        quantityId: "opinion-score",
        unitId: "dimensionless",
        dimensionId: "dimensionless",
        active: true,
        executable: false
      },
      {
        id: "stubbornness",
        label: "Stubbornness",
        valueKind: "number",
        active: true,
        executable: false
      },
      {
        id: "mood",
        label: "Mood",
        valueKind: "category",
        allowedValues: ["calm", "charged"],
        active: false,
        executable: false
      },
      {
        id: "custom-signal",
        label: "Custom Signal",
        valueKind: "custom",
        active: false,
        executable: false
      }
    ],
    spaces: [
      {
        id: "social-space",
        label: "Social Space",
        spaceKind: "continuous2d",
        boundaryModelId: "boundary-1",
        fieldLayerId: "field-1",
        networkDefinitionId: "network-1",
        scaleModelId: "scale-1",
        coordinateDescription: "Abstract 2D exposure space.",
        active: true,
        executable: false
      }
    ],
    parameters: [
      {
        id: "influence-radius",
        label: "Influence Radius",
        valueKind: "number",
        rangeDescription: "0 to 100 in model coordinates.",
        uncertaintyVariableId: "uncertain-radius",
        active: true,
        executable: false
      }
    ],
    metrics: [
      {
        id: "mean-opinion",
        label: "Mean Opinion",
        metricKind: "mean",
        sourceDescription: "Declared metric only.",
        active: true,
        executable: false
      },
      {
        id: "emergence-index",
        label: "Emergence Index",
        metricKind: "emergenceIndicator",
        active: false,
        executable: false
      },
      {
        id: "robustness-index",
        label: "Robustness Index",
        metricKind: "robustnessIndicator",
        active: false,
        executable: false
      },
      {
        id: "control-index",
        label: "Control Index",
        metricKind: "controlIndicator",
        active: false,
        executable: false
      }
    ],
    artifactReferences: [
      {
        id: "template-ref",
        label: "Template Ref",
        artifactType: "ortus.template",
        artifactId: "opinion-dynamics",
        role: "context",
        active: true,
        executable: false
      },
      {
        id: "scenario-ref",
        label: "Scenario Ref",
        artifactType: "ortus.scenario",
        artifactId: "scenario-1",
        primitiveId: "scenarios",
        role: "input",
        active: false,
        executable: false
      },
      {
        id: "validation-ref",
        label: "Validation Ref",
        artifactType: "ortus.validationReport",
        artifactId: "validation-1",
        primitiveId: "validationCalibration",
        role: "validationTarget",
        active: false,
        executable: false
      },
      {
        id: "future-ref",
        label: "Future Ref",
        artifactType: "ortus.modelDefinition",
        artifactId: "future-1",
        primitiveId: "safeInterpreterCompiler",
        role: "futureRuntimeDependency",
        active: false,
        executable: false
      }
    ],
    ruleDeclarations: [
      {
        id: "move-rule",
        label: "Move Rule",
        ruleKind: "movement",
        sourceEntityTypeIds: ["person"],
        parameterIds: ["influence-radius"],
        metricIds: ["mean-opinion"],
        referencedArtifactIds: ["template-ref"],
        ruleDescription: "Describe movement conceptually without formulas.",
        active: true,
        executable: false
      },
      {
        id: "interaction-rule",
        label: "Interaction Rule",
        ruleKind: "interaction",
        sourceEntityTypeIds: ["person"],
        targetEntityTypeIds: ["person"],
        ruleDescription: "Describe local interaction conceptually.",
        active: false,
        executable: false
      },
      {
        id: "state-rule",
        label: "State Rule",
        ruleKind: "stateTransition",
        ruleDescription: "Describe a future state transition.",
        active: false,
        executable: false
      },
      {
        id: "network-rule",
        label: "Network Rule",
        ruleKind: "networkUpdate",
        ruleDescription: "Describe a future relation change.",
        active: false,
        executable: false
      },
      {
        id: "resource-rule",
        label: "Resource Rule",
        ruleKind: "resourceFlow",
        ruleDescription: "Describe future stock/flow logic.",
        active: false,
        executable: false
      },
      {
        id: "event-rule",
        label: "Event Rule",
        ruleKind: "eventEmission",
        ruleDescription: "Describe a future event emission.",
        active: false,
        executable: false
      },
      {
        id: "feedback-rule",
        label: "Feedback Rule",
        ruleKind: "feedbackAdjustment",
        ruleDescription: "Describe feedback adjustment metadata.",
        active: false,
        executable: false
      },
      {
        id: "observation-rule",
        label: "Observation Rule",
        ruleKind: "observation",
        ruleDescription: "Describe measurement metadata.",
        active: false,
        executable: false
      },
      {
        id: "control-rule",
        label: "Control Rule",
        ruleKind: "controlPolicy",
        ruleDescription: "Describe a structural policy.",
        active: false,
        executable: false
      },
      {
        id: "aggregate-rule",
        label: "Aggregate Rule",
        ruleKind: "aggregation",
        ruleDescription: "Describe aggregation metadata.",
        active: false,
        executable: false
      },
      {
        id: "social-rule",
        label: "Social Rule",
        ruleKind: "socialLearning",
        ruleDescription: "Describe social learning as a future structural placeholder.",
        active: false,
        executable: false
      },
      {
        id: "memory-rule",
        label: "Memory Rule",
        ruleKind: "memoryUpdate",
        ruleDescription: "Describe memory update as a future structural placeholder.",
        active: false,
        executable: false
      },
      {
        id: "belief-rule",
        label: "Belief Rule",
        ruleKind: "beliefUpdate",
        ruleDescription: "Describe belief update as a future structural placeholder.",
        active: false,
        executable: false
      }
    ],
    ...overrides
  });
}

function hybridComposition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: "ortus.hybridComposition",
    id: "schema-composition",
    name: "Schema Composition",
    version: "1.0.0",
    baseTemplateId: "opinion-dynamics",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

function expectInvalid(label: string, schema: unknown, expected: RegExp): void {
  expect(() => validateModelSchemaDefinition(schema), label).toThrow(expected);
}

describe("model schema service", () => {
  it("validates minimal and full structural schemas", () => {
    expect(validateModelSchemaDefinition(minimalSchema())).toMatchObject({ id: "minimal-schema", artifactType: modelSchemaArtifactType });
    expect(validateModelSchemaDefinition(fullSchema())).toMatchObject({ id: "opinion-schema", ruleDeclarations: expect.any(Array) });
  });

  it("rejects malformed fields, duplicate ids, executable flags, unsafe payloads, and live state", () => {
    const duplicate = <K extends keyof ModelSchemaDefinition>(key: K) => {
      const value = fullSchema()[key] as readonly { id: string }[];
      return fullSchema({ [key]: [value[0], value[0]] } as Partial<ModelSchemaDefinition>);
    };

    const cases: Array<[string, unknown, RegExp]> = [
      ["missing id", { ...minimalSchema(), id: undefined }, /id/],
      ["missing name", { ...minimalSchema(), name: undefined }, /name/],
      ["invalid artifactType", { ...minimalSchema(), artifactType: "ortus.scenario" }, /artifactType/],
      ["invalid version", { ...minimalSchema(), version: "" }, /version/],
      ["invalid schemaVersion", { ...minimalSchema(), schemaVersion: "2" }, /schemaVersion/],
      ["missing entityTypes", { ...minimalSchema(), entityTypes: undefined }, /entityTypes/],
      ["malformed entityTypes", { ...minimalSchema(), entityTypes: {} }, /entityTypes/],
      ["duplicate entity ids", duplicate("entityTypes"), /Duplicate entity type id/],
      ["duplicate component ids", duplicate("componentTypes"), /Duplicate component type id/],
      ["duplicate attribute ids", duplicate("attributeTypes"), /Duplicate attribute type id/],
      ["duplicate space ids", duplicate("spaces"), /Duplicate space id/],
      ["duplicate parameter ids", duplicate("parameters"), /Duplicate parameter id/],
      ["duplicate metric ids", duplicate("metrics"), /Duplicate metric id/],
      ["duplicate rule ids", duplicate("ruleDeclarations"), /Duplicate rule declaration id/],
      ["duplicate artifact refs", duplicate("artifactReferences"), /Duplicate artifact reference id/],
      ["invalid entityKind", fullSchema({ entityTypes: [{ ...fullSchema().entityTypes[0]!, entityKind: "person" as never }] }), /entityKind/],
      ["entity unknown component", fullSchema({ entityTypes: [{ ...fullSchema().entityTypes[0]!, componentTypeIds: ["missing"] }] }), /unknown componentTypeId/],
      ["entity unknown attribute", fullSchema({ entityTypes: [{ ...fullSchema().entityTypes[0]!, attributeTypeIds: ["missing"] }] }), /unknown attributeTypeId/],
      ["entity unknown space", fullSchema({ entityTypes: [{ ...fullSchema().entityTypes[0]!, spaceIds: ["missing"] }] }), /unknown spaceId/],
      ["entity executable true", fullSchema({ entityTypes: [{ ...fullSchema().entityTypes[0]!, executable: true as never }] }), /executable/],
      ["invalid componentKind", fullSchema({ componentTypes: [{ ...fullSchema().componentTypes![0]!, componentKind: "mood" as never }] }), /componentKind/],
      ["component unknown attribute", fullSchema({ componentTypes: [{ ...fullSchema().componentTypes![0]!, attributeTypeIds: ["missing"] }] }), /unknown attributeTypeId/],
      ["component executable true", fullSchema({ componentTypes: [{ ...fullSchema().componentTypes![0]!, executable: true as never }] }), /executable/],
      ["invalid valueKind", fullSchema({ attributeTypes: [{ ...fullSchema().attributeTypes![0]!, valueKind: "float" as never }] }), /valueKind/],
      ["invalid allowedValues", fullSchema({ attributeTypes: [{ ...fullSchema().attributeTypes![2]!, allowedValues: {} as never }] }), /allowedValues/],
      ["attribute executable true", fullSchema({ attributeTypes: [{ ...fullSchema().attributeTypes![0]!, executable: true as never }] }), /executable/],
      ["invalid spaceKind", fullSchema({ spaces: [{ ...fullSchema().spaces![0]!, spaceKind: "map" as never }] }), /spaceKind/],
      ["space executable true", fullSchema({ spaces: [{ ...fullSchema().spaces![0]!, executable: true as never }] }), /executable/],
      ["invalid parameter valueKind", fullSchema({ parameters: [{ ...fullSchema().parameters![0]!, valueKind: "float" as never }] }), /valueKind/],
      ["parameter executable true", fullSchema({ parameters: [{ ...fullSchema().parameters![0]!, executable: true as never }] }), /executable/],
      ["invalid metricKind", fullSchema({ metrics: [{ ...fullSchema().metrics![0]!, metricKind: "median" as never }] }), /metricKind/],
      ["metric executable true", fullSchema({ metrics: [{ ...fullSchema().metrics![0]!, executable: true as never }] }), /executable/],
      ["invalid ruleKind", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![0]!, ruleKind: "formula" as never }] }), /ruleKind/],
      ["rule unknown source", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![0]!, sourceEntityTypeIds: ["missing"] }] }), /unknown sourceEntityTypeId/],
      ["rule unknown target", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![1]!, targetEntityTypeIds: ["missing"] }] }), /unknown targetEntityTypeId/],
      ["rule unknown parameter", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![0]!, parameterIds: ["missing"] }] }), /unknown parameterId/],
      ["rule unknown metric", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![0]!, metricIds: ["missing"] }] }), /unknown metricId/],
      ["rule unknown artifact", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![0]!, referencedArtifactIds: ["missing"] }] }), /unknown referencedArtifactId/],
      ["rule missing description", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![0]!, ruleDescription: undefined as never }] }), /ruleDescription/],
      ["rule executable true", fullSchema({ ruleDeclarations: [{ ...fullSchema().ruleDeclarations![0]!, executable: true as never }] }), /executable/],
      ["invalid artifact role", fullSchema({ artifactReferences: [{ ...fullSchema().artifactReferences![0]!, role: "runtime" as never }] }), /role/],
      ["artifact missing type", fullSchema({ artifactReferences: [{ ...fullSchema().artifactReferences![0]!, artifactType: undefined as never }] }), /artifactType/],
      ["artifact missing id", fullSchema({ artifactReferences: [{ ...fullSchema().artifactReferences![0]!, artifactId: undefined as never }] }), /artifactId/],
      ["artifact executable true", fullSchema({ artifactReferences: [{ ...fullSchema().artifactReferences![0]!, executable: true as never }] }), /executable/],
      ["non-finite numeric field", fullSchema({ metadata: { value: Number.POSITIVE_INFINITY } as never }), /non-finite/],
      ["unknown top-level field", { ...minimalSchema(), extra: true }, /Unrecognized key|Invalid model schema/],
      ["live-state payload", minimalSchema({ metadata: { world: { tick: 1 } } }), /live-state/],
      ["oversized notes", minimalSchema({ entityTypes: [{ ...minimalSchema().entityTypes[0]!, notes: ["x".repeat(2_000)] }] }), /notes/],
      ["oversized metadata", minimalSchema({ metadata: { huge: "x".repeat(30_000) } }), /metadata/],
      ["oversized model", minimalSchema({ description: "x".repeat(300_000) }), /description|Model schema/],
      ["function payload", minimalSchema({ metadata: { callback: () => null } as never }), /plain JSON|callback/],
      ["class payload", minimalSchema({ metadata: { custom: new Date() } as never }), /plain JSON/],
      ["formula payload", minimalSchema({ metadata: { formula: "x + y" } }), /formula/],
      ["metric history payload", minimalSchema({ metadata: { metricHistory: [] } }), /metricHistory/],
      ["dataset payload", minimalSchema({ metadata: { dataset: [] } }), /dataset/],
      ["compiler payload", minimalSchema({ metadata: { compiler: {} } }), /compiler/],
      ["visual builder payload", minimalSchema({ metadata: { visualBuilderState: {} } }), /visualBuilderState/],
      ["external framework payload", minimalSchema({ metadata: { netlogoCode: "to go" } }), /netlogoCode/],
      ["Mesa payload", minimalSchema({ metadata: { mesaModel: {} } }), /mesaModel/],
      ["MASON payload", minimalSchema({ metadata: { masonModel: {} } }), /masonModel/],
      ["optimizer payload", minimalSchema({ metadata: { optimizer: {} } }), /optimizer/],
      ["controller payload", minimalSchema({ metadata: { controller: {} } }), /controller/],
      ["RL payload", minimalSchema({ metadata: { reinforcementLearning: {} } }), /reinforcementLearning/],
      ["MPC payload", minimalSchema({ metadata: { modelPredictiveControl: {} } }), /modelPredictiveControl/],
      ["proof payload", minimalSchema({ metadata: { proof: {} } }), /proof/],
      ["certification payload", minimalSchema({ metadata: { certification: {} } }), /certification/],
      ["safety payload", minimalSchema({ metadata: { safetyScore: 1 } }), /safetyScore/],
      ["risk payload", minimalSchema({ metadata: { riskScore: 1 } }), /riskScore/],
      ["calibration payload", minimalSchema({ metadata: { calibration: {} } }), /calibration/],
      ["likelihood payload", minimalSchema({ metadata: { likelihood: 0.8 } }), /likelihood/],
      ["inference payload", minimalSchema({ metadata: { inference: {} } }), /inference/],
      ["LLM payload", minimalSchema({ metadata: { llm: "agent" } }), /llm/],
      ["embedding payload", minimalSchema({ metadata: { embeddings: [] } }), /embeddings/],
      ["model weights payload", minimalSchema({ metadata: { modelWeights: [] } }), /modelWeights/],
      ["training data payload", minimalSchema({ metadata: { trainingData: [] } }), /trainingData/],
      ["free-text memory payload", minimalSchema({ metadata: { freeTextMemory: "biography" } }), /freeTextMemory/],
      ["real-person payload", minimalSchema({ metadata: { realPersonProfile: {} } }), /realPersonProfile/],
      ["protected-class payload", minimalSchema({ metadata: { protectedAttributeInference: {} } }), /protectedAttributeInference/]
    ];

    for (const [label, schema, expected] of cases) {
      expectInvalid(label, schema, expected);
    }

    const forbiddenLiveStateKeys = [
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
      "activeEngine"
    ];
    for (const key of forbiddenLiveStateKeys) {
      expectInvalid(`forbidden live-state key ${key}`, minimalSchema({ metadata: { [key]: {} } }), new RegExp(key));
    }

    const forbiddenUnsafeKeys = [
      "formula",
      "expression",
      "equation",
      "code",
      "script",
      "javascript",
      "typescript",
      "python",
      "functionBody",
      "bytecode",
      "ast",
      "parser",
      "interpreter",
      "compiler",
      "transpiler",
      "codegen",
      "generatedCode",
      "runtime",
      "runtimeHooks",
      "execute",
      "executor",
      "stepFunction",
      "tickFunction",
      "behaviorFunction",
      "ruleFunction",
      "simulationLoop",
      "visualBuilderState",
      "nodeGraph",
      "blockProgram",
      "externalFrameworkImport",
      "externalFrameworkExport",
      "frameworkAdapter",
      "netlogoCode",
      "netlogoImport",
      "netlogoExport",
      "mesaModel",
      "mesaImport",
      "mesaExport",
      "masonModel",
      "masonImport",
      "masonExport",
      "optimizer",
      "controller",
      "policyEngine",
      "reinforcementLearning",
      "modelPredictiveControl",
      "calibration",
      "likelihood",
      "inference",
      "dataset",
      "observedData",
      "timeSeries",
      "rawData",
      "dataFrame",
      "csv",
      "table",
      "proof",
      "certification",
      "riskScore",
      "safetyScore",
      "llm",
      "largeLanguageModel",
      "embedding",
      "embeddings",
      "modelWeights",
      "trainingData",
      "promptTemplate",
      "agentBiography",
      "freeTextMemory",
      "realPersonProfile",
      "protectedAttributeInference",
      "function",
      "class",
      "prototype",
      "constructor",
      "__proto__"
    ];
    for (const key of forbiddenUnsafeKeys) {
      expectInvalid(`forbidden unsafe key ${key}`, minimalSchema({ metadata: { [key]: "payload" } }), /must not contain/);
    }
  });

  it("surfaces structural-only warnings without implying runtime support", () => {
    const warnings = getModelSchemaWarnings(
      fullSchema({
        description: "A universal model for broad applicability, real-world operational use, NetLogo/Mesa/MASON compatibility, LLM agents, and full human cognition."
      })
    );
    expect(warnings.join("\n")).toContain("Rule declarations are structural descriptions only");
    expect(warnings.join("\n")).toContain("Active declarations are structurally active only");
    expect(warnings.join("\n")).toContain("Space social-space references network/field/boundary/scale artifacts structurally only.");
    expect(warnings.join("\n")).toContain("Parameter influence-radius references uncertainty; schema parameters are not automatically sampled.");
    expect(warnings.join("\n")).toContain("emergenceIndicator");
    expect(warnings.join("\n")).toContain("robustnessIndicator");
    expect(warnings.join("\n")).toContain("controlIndicator");
    expect(warnings.join("\n")).toContain("no runtime agent interpreter exists");
    expect(warnings.join("\n")).toContain("no runtime state-transition interpreter exists");
    expect(warnings.join("\n")).toContain("does not execute stock/flow logic");
    expect(warnings.join("\n")).toContain("does not mutate networks");
    expect(warnings.join("\n")).toContain("does not emit runtime events");
    expect(warnings.join("\n")).toContain("does not run feedback loops");
    expect(warnings.join("\n")).toContain("does not perform measurement");
    expect(warnings.join("\n")).toContain("does not execute strategy/control");
    expect(warnings.join("\n")).toContain("does not execute multi-scale transitions");
    expect(warnings.join("\n")).toContain("do not implement runtime cognition");
    expect(warnings.join("\n")).toContain("Artifact reference template-ref is structural only");
    expect(warnings.join("\n")).toContain("validationTarget");
    expect(warnings.join("\n")).toContain("futureRuntimeDependency");
    expect(warnings.join("\n")).toContain("broad applicability wording");
    expect(warnings.join("\n")).toContain("Universal model wording");
    expect(warnings.join("\n")).toContain("NetLogo/Mesa/MASON compatibility");
    expect(warnings.join("\n")).toContain("No model schema interpreter exists");
    expect(warnings.join("\n")).toContain("No visual builder exists");
    expect(warnings.join("\n")).toContain("No compiler exists");
    expect(warnings.join("\n")).toContain("No social/cognitive runtime exists");
    expect(warnings.join("\n")).toContain("No LLM agent runtime exists");
    expect(warnings.join("\n")).toContain("No full-human-cognition support exists");

    const minimalWarnings = getModelSchemaWarnings(minimalSchema());
    expect(minimalWarnings.join("\n")).toContain("Schema has no rule declarations");
    expect(minimalWarnings.join("\n")).toContain("Schema has no spaces");
    expect(minimalWarnings.join("\n")).toContain("Schema has no parameters");
    expect(minimalWarnings.join("\n")).toContain("Schema has no metrics");
    expect(minimalWarnings.join("\n")).toContain("Entity type agent has no components or attributes");
  });

  it("queries schema declarations deterministically without mutating inputs", () => {
    const schema = fullSchema();
    const before = JSON.stringify(schema);
    expect(listEntityTypes(schema)).toHaveLength(2);
    expect(listActiveEntityTypes(schema)).toHaveLength(1);
    expect(getEntityType(schema, "person")?.label).toBe("Person");
    expect(listEntityTypesByKind(schema, "agent")).toHaveLength(1);
    expect(listComponentTypes(schema)).toHaveLength(2);
    expect(getComponentType(schema, "opinion-state")?.componentKind).toBe("belief");
    expect(getComponentsForEntityType(schema, "person").map((component) => component.id)).toEqual(["opinion-state"]);
    expect(listAttributeTypes(schema)).toHaveLength(4);
    expect(getAttributeType(schema, "opinion")?.valueKind).toBe("number");
    expect(getAttributesForEntityType(schema, "person").map((attribute) => attribute.id)).toEqual(["opinion", "stubbornness", "mood"]);
    expect(getAttributesForComponentType(schema, "opinion-state").map((attribute) => attribute.id)).toEqual(["opinion", "mood"]);
    expect(listSpaces(schema)).toHaveLength(1);
    expect(getSpace(schema, "social-space")?.spaceKind).toBe("continuous2d");
    expect(listSpacesByKind(schema, "continuous2d")).toHaveLength(1);
    expect(listParameters(schema)).toHaveLength(1);
    expect(getParameter(schema, "influence-radius")?.valueKind).toBe("number");
    expect(listMetrics(schema)).toHaveLength(4);
    expect(getMetric(schema, "mean-opinion")?.metricKind).toBe("mean");
    expect(listRuleDeclarations(schema)).toHaveLength(13);
    expect(listActiveRuleDeclarations(schema).map((rule) => rule.id)).toEqual(["move-rule"]);
    expect(getRuleDeclaration(schema, "move-rule")?.ruleKind).toBe("movement");
    expect(listRuleDeclarationsByKind(schema, "socialLearning")).toHaveLength(1);
    expect(getRulesForEntityType(schema, "person").map((rule) => rule.id)).toEqual(["move-rule", "interaction-rule"]);
    expect(listArtifactReferences(schema)).toHaveLength(4);
    expect(getArtifactReference(schema, "scenario-ref")?.artifactType).toBe("ortus.scenario");
    expect(listArtifactReferencesByType(schema, "ortus.scenario")).toHaveLength(1);
    expect(listArtifactReferencesByRole(schema, "validationTarget")).toHaveLength(1);
    expect(schemaHasRuleKind(schema, "beliefUpdate")).toBe(true);
    expect(schemaHasArtifactType(schema, "ortus.scenario")).toBe(true);
    expect(summarizeModelSchema(schema)).toMatchObject({
      id: "opinion-schema",
      entityTypeCount: 2,
      componentTypeCount: 2,
      attributeTypeCount: 4,
      executableCount: 0
    });

    const entity = listEntityTypes(schema)[0] as { label: string };
    entity.label = "Mutated";
    expect(getEntityType(schema, "person")?.label).toBe("Person");
    expect(JSON.stringify(schema)).toBe(before);
  });

  it("round-trips model schema artifacts and rejects other artifact families or unsafe imports", () => {
    const schema = fullSchema();
    const json = serializeModelSchema(schema);
    expect(json).toContain(`"artifactType": "${modelSchemaArtifactType}"`);
    expect(deserializeModelSchema(json)).toMatchObject({ id: "opinion-schema", artifactType: modelSchemaArtifactType });

    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.networkMetrics",
      "ortus.resourceSystem",
      "ortus.resourceMetrics",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.feedbackEventMetrics",
      "ortus.hybridComposition",
      "ortus.scaleModel",
      "ortus.scaleViewState",
      "ortus.boundaryModel",
      "ortus.fieldLayer",
      "ortus.observabilityModel",
      "ortus.causalAssumptionModel",
      "ortus.quantitySemanticsModel",
      "ortus.emergencePatternModel",
      "ortus.robustnessResilienceModel",
      "ortus.controlStrategyModel"
    ]) {
      expect(() => deserializeModelSchema(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }

    for (const metadata of [
      { world: {} },
      { dataset: [] },
      { timeSeries: [] },
      { metricHistory: [] },
      { formula: "x = y" },
      { code: "return true" },
      { compiler: {} },
      { visualBuilderState: {} },
      { externalFrameworkImport: {} },
      { externalFrameworkExport: {} },
      { netlogoCode: "to go" },
      { netlogoImport: {} },
      { netlogoExport: {} },
      { mesaModel: {} },
      { mesaImport: {} },
      { mesaExport: {} },
      { masonModel: {} },
      { masonImport: {} },
      { masonExport: {} },
      { optimizer: {} },
      { proof: {} },
      { calibration: {} },
      { llm: "agent" },
      { embedding: [] },
      { freeTextMemory: "biography" },
      { realPersonProfile: {} },
      { protectedAttributeInference: {} }
    ]) {
      expect(() => deserializeModelSchema(JSON.stringify(minimalSchema({ metadata: metadata as unknown as Record<string, never> })))).toThrow();
    }
    expect(() => deserializeModelSchema("x".repeat(300_000))).toThrow(/Model schema JSON/);
  });

  it("reports interpreter capability without parsing, compiling, running templates, or creating snapshots", () => {
    const report = getModelInterpreterCapabilityReport(fullSchema());
    expect(report).toMatchObject({
      modelId: "opinion-schema",
      valid: true,
      runnableNow: false,
      interpreterAvailable: false,
      executableRuleCount: 0,
      errors: []
    });
    expect(report.unsupportedRuleKinds).toEqual(expect.arrayContaining(["movement", "socialLearning", "memoryUpdate", "beliefUpdate"]));
    expect(report.missingRuntimeCapabilities).toEqual(expect.arrayContaining(["safe model schema interpreter", "custom simulation runtime", "social/cognitive runtime"]));
    expect(report.warnings.join("\n")).toContain("Model schemas declare model structure; they do not execute rules or create runnable simulations.");
    expect(report.warnings.join("\n")).toContain("A valid model schema is not a template, scenario, RunConfig, or snapshot.");
    expect(report.warnings.join("\n")).toContain("Rule declarations are descriptive metadata, not parsed formulas or executable behavior.");

    const invalid = getModelInterpreterCapabilityReport({ ...minimalSchema(), id: "" });
    expect(invalid.valid).toBe(false);
    expect(invalid.runnableNow).toBe(false);
    expect(invalid.interpreterAvailable).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });

  it("integrates with registries while leaving compiler, visual builder, validation, external interop, and social runtime future-only", () => {
    expect(getPrimitive("modelSchema")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("modelSchema");
    expect(getPrimitive("modelDefinitionSchema")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("safeInterpreterCompiler")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("validationCalibration")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("externalFrameworkInterop")).toMatchObject({ status: "reserved" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).toEqual(
      expect.arrayContaining(["safeInterpreterCompiler", "visualModelBuilder", "validationCalibration", "externalFrameworkInterop"])
    );
    expect(getArtifactFamily(modelSchemaArtifactType)).toMatchObject({
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true,
      primitiveId: "modelSchema"
    });
    expect(listArtifactFamiliesForPrimitive("modelSchema")).toEqual([
      expect.objectContaining({ artifactType: modelSchemaArtifactType, implemented: true, importSupported: true, exportSupported: true })
    ]);

    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "modelSchema")).toMatchObject({
        status: "unsupported",
        supportLevel: "none",
        runtimeActive: false,
        serviceAvailable: true
      });
    }
  });

  it("lets hybrid compositions reference model schemas without making them runnable or satisfying future runtime needs", () => {
    const composition = hybridComposition({
      primitiveAttachments: [
        {
          id: "schema-ref",
          primitiveId: "modelSchema",
          attachmentType: "modelSchema",
          mode: "reference",
          artifactType: modelSchemaArtifactType,
          artifactId: "opinion-schema",
          active: true,
          required: true
        }
      ],
      requiredCapabilities: []
    });
    expect(validateHybridComposition(composition).primitiveAttachments[0]).toMatchObject({ attachmentType: "modelSchema" });
    const report = validateCompositionCapabilities(composition);
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "modelSchema", requiredSupportLevel: "runtime" });

    const serviceOnly = hybridComposition({ requiredCapabilities: [{ primitiveId: "modelSchema", requiredSupportLevel: "service" }] });
    expect(validateCompositionCapabilities(serviceOnly).runnableNow).toBe(true);

    for (const primitiveId of ["visualModelBuilder", "safeInterpreterCompiler", "validationCalibration", "externalFrameworkInterop"] as const) {
      expect(
        validateCompositionCapabilities(hybridComposition({ requiredCapabilities: [{ primitiveId, requiredSupportLevel: "metadata" }] })).runnableNow
      ).toBe(false);
    }
    expect(validateCompositionCapabilities(hybridComposition({ requiredCapabilities: [{ primitiveId: "adaptiveAgents", requiredSupportLevel: "metadata" }] })).runnableNow).toBe(false);
  });

  it("preserves distinctions from templates, scenarios, RunConfigs, snapshots, primitives, external frameworks, and social cognition", () => {
    const schema = fullSchema();
    expect(getTemplateCapability("opinion-dynamics", "modelSchema")?.runtimeActive).toBe(false);
    expect(summarizeModelSchema(schema).warnings.join("\n")).toContain("does not make the schema runnable");
    expect(getModelInterpreterCapabilityReport(schema).runnableNow).toBe(false);
    expect(schemaHasArtifactType(schema, "ortus.scenario")).toBe(true);
    expect(schemaHasRuleKind(schema, "resourceFlow")).toBe(true);
    expect(schemaHasRuleKind(schema, "networkUpdate")).toBe(true);
    expect(schemaHasRuleKind(schema, "feedbackAdjustment")).toBe(true);
    expect(schemaHasRuleKind(schema, "observation")).toBe(true);
    expect(schemaHasRuleKind(schema, "controlPolicy")).toBe(true);
    expect(schemaHasRuleKind(schema, "aggregation")).toBe(true);
    expect(schemaHasRuleKind(schema, "socialLearning")).toBe(true);

    const templateSource = readdirSync(join(repoRoot, "src", "simulation", "templates"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(repoRoot, "src", "simulation", "templates", file), "utf8"))
      .join("\n");
    expect(templateSource).not.toMatch(/modelSchema/i);
  });

  it("adds template assumption-profile notes distinguishing hand-built runtime templates from schemas", () => {
    const assumptionText = productionTemplates
      .flatMap((template) => template.assumptionProfile?.limitations.map((item) => item.description) ?? [])
      .join("\n");
    expect(assumptionText).toContain("Production templates are hand-built runtime models; they are not generated from ModelSchemaDefinition artifacts.");
    expect(assumptionText).toContain("Template parameters, metrics, and interventions are template-owned runtime metadata");
    expect(assumptionText).toContain("Forest Fire / Landscape Spread is a hand-built local-spread template, not evidence of a generic model-schema interpreter.");
    expect(assumptionText).toContain("ModelSchemaDefinition artifacts are structural and not executable");
    expect(assumptionText).toContain("Belief, memory, or social-learning schema rule declarations do not implement social-learning runtime");
  });

  it("documents model schema boundaries and required phrases", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "planned_roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "codex", "CURRENT_CONTEXT.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "codex", "SESSION_LOG.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Model schemas declare model structure; they do not execute rules or create runnable simulations.");
    expect(docs).toContain("A valid model schema is not a template, scenario, RunConfig, or snapshot.");
    expect(docs).toContain("Rule declarations are descriptive metadata, not parsed formulas or executable behavior.");
    expect(docs).toContain("Belief, memory, and social-learning rule declarations are structural placeholders; they do not implement human cognition or social-learning runtime.");
    expect(docs).toContain("ORTUS has completed Prompt 33");
    expect(docs).toContain("Visual builder workspaces are structural planning artifacts; they do not implement the visual builder UI.");
    expect(docs).toContain("Opinion Dynamics social learning is a stylized template-owned runtime mode, not a model of full human cognition.");
    expect(docs).toContain("Social-learning semantic artifacts are not executed directly by the Opinion Dynamics template.");
    expect(docs).toContain("A valid visual builder workspace does not make a model schema runnable.");
  });

  it("keeps modelSchema services headless and free of execution, parser, framework, optimizer, and LLM runtime hooks", () => {
    const modelSchemaDir = join(repoRoot, "src", "simulation", "modelSchema");
    const source = readdirSync(modelSchemaDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(modelSchemaDir, file), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']zustand["']/);
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.");
    expect(source).not.toContain("Canvas");
    expect(source).not.toContain("SimulationEngine");
    expect(source).not.toContain("createEngine");
    expect(source).not.toContain("createSnapshot");
    expect(source).not.toMatch(/from ["'].*templates/);
    expect(source).not.toMatch(/from ["'].*experiments/);
    expect(source).not.toMatch(/from ["'].*interventions/);
  });
});
